---
name: knapsack-finance
description: Access financial services (Google Sheets, Gmail, Microsoft Excel, Outlook) through Knapsack's managed OAuth connections. No API keys needed — uses tokens from services the user has already connected.
version: 0.1.0
metadata:
  openclaw:
    emoji: "💰"
    homepage: https://knap.ai
    always: true
    requires:
      bins:
        - curl
        - jq
---

# Knapsack Finance — OAuth-Connected Financial Services

This skill gives you access to the user's connected financial services through Knapsack's OAuth token management. The user has already authenticated with these services through the Knapsack desktop app — you can make API calls on their behalf without needing separate API keys.

## How It Works

Knapsack stores OAuth tokens for connected services. This skill retrieves fresh access tokens from Knapsack's local API (`http://127.0.0.1:8897`) and uses them to call service APIs directly.

**Important**: Only use services the user has already connected. If a token request fails, tell the user they need to connect that service in Knapsack Settings first.

## Step 1: Discover Connected Services

Always start by discovering what services the user has connected. This also returns the user's email, which you need for token requests:

```bash
# Returns: { "success": true, "email": "user@example.com", "services": [{"scope": "google_drive_read", "provider": "google"}, ...] }
DISCOVERY=$(curl -s http://127.0.0.1:8897/api/knapsack/connections/services)
USER_EMAIL=$(echo "$DISCOVERY" | jq -r '.email')
echo "$DISCOVERY" | jq '.services[].scope'
```

If `services` is empty, the user hasn't connected any accounts yet — tell them to go to Knapsack Settings.

## Step 2: Retrieve Access Tokens

### Google Access Token

```bash
# Scopes: google_gmail_modify, google_drive_read, google_calendar_read, google_profile_read
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_drive_read" | jq -r '.access_token')
```

### Microsoft Access Token

```bash
CONNECTIONS=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections?email=${USER_EMAIL}")
TOKEN=$(echo "$CONNECTIONS" | jq -r '.connections[] | select(.connection.scope == "microsoft_outlook_read") | .token')
```

### Helper Script

A convenience script is bundled with this skill:

```bash
# Discover connected services
./knapsack-token.sh discover

# Get a fresh token for a specific scope
TOKEN=$(./knapsack-token.sh token google_drive_read)
```

Possible scopes:
- `google_profile_read` — Google profile
- `google_gmail_modify` — Gmail read/write
- `google_drive_read` — Google Drive (includes Sheets)
- `google_calendar_read` — Google Calendar
- `microsoft_profile_read` — Microsoft profile
- `microsoft_outlook_read` — Outlook email
- `microsoft_onedrive_read` — OneDrive (includes Excel Online)
- `microsoft_calendar_read` — Microsoft Calendar

## Financial Service APIs

### Google Sheets (via Drive scope)

Read a spreadsheet:
```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_drive_read" | jq -r '.access_token')

# List spreadsheets
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,modifiedTime)" | jq

# Read spreadsheet values
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}" | jq
```

Write to a spreadsheet:
```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_drive_read" | jq -r '.access_token')

curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?valueInputOption=USER_ENTERED" \
  -d '{"values": [["Date", "Amount", "Category"], ["2026-01-15", "150.00", "Office Supplies"]]}'
```

### Gmail — Financial Emails (via Gmail scope)

Search for financial emails (bank statements, invoices, receipts):
```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_gmail_modify" | jq -r '.access_token')

# Search for financial emails
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:(invoice OR receipt OR statement OR payment)&maxResults=10" | jq

# Get a specific email
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/${MESSAGE_ID}?format=full" | jq
```

Send a financial email:
```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_gmail_modify" | jq -r '.access_token')

# Construct and send the email (base64url-encoded RFC 2822)
EMAIL_CONTENT=$(printf 'To: %s\r\nSubject: %s\r\nContent-Type: text/plain\r\n\r\n%s' "$TO" "$SUBJECT" "$BODY" | base64 -w 0 | tr '+/' '-_' | tr -d '=')

curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send" \
  -d "{\"raw\": \"$EMAIL_CONTENT\"}"
```

### Google Calendar — Financial Events (via Calendar scope)

```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/google/auth_token?email=${USER_EMAIL}&scope=google_calendar_read" | jq -r '.access_token')

# Get upcoming events (payment due dates, financial meetings)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=$(date -u +%Y-%m-%dT%H:%M:%SZ)&maxResults=20&orderBy=startTime&singleEvents=true" | jq
```

### Microsoft Excel Online (via OneDrive scope)

```bash
CONNECTIONS=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections?email=${USER_EMAIL}")
TOKEN=$(echo "$CONNECTIONS" | jq -r '.connections[] | select(.connection.scope == "microsoft_onedrive_read") | .token')

# List Excel workbooks
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.xlsx')?select=id,name,lastModifiedDateTime" | jq

# Read worksheet data
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://graph.microsoft.com/v1.0/me/drive/items/${ITEM_ID}/workbook/worksheets/${SHEET_NAME}/usedRange" | jq
```

### Microsoft Outlook — Financial Emails (via Outlook scope)

```bash
CONNECTIONS=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections?email=${USER_EMAIL}")
TOKEN=$(echo "$CONNECTIONS" | jq -r '.connections[] | select(.connection.scope == "microsoft_outlook_read") | .token')

# Search for financial emails
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://graph.microsoft.com/v1.0/me/messages?\$search=\"invoice OR receipt OR statement\"&\$top=10&\$select=subject,from,receivedDateTime,bodyPreview" | jq
```

## Common Financial Workflows

### 1. Expense Tracking
When the user asks to track expenses:
1. Search Gmail/Outlook for receipt and invoice emails
2. Extract amounts, dates, vendors from email content
3. Write structured data to a Google Sheet or Excel workbook
4. Summarize totals by category

### 2. Financial Report Generation
When the user asks for a financial summary:
1. Read data from their spreadsheets (Sheets/Excel)
2. Pull relevant emails for the time period
3. Check calendar for financial meetings/deadlines
4. Compile and present the summary

### 3. Invoice Management
When the user asks about invoices:
1. Search emails for invoices (Gmail or Outlook)
2. Extract key fields (amount, due date, vendor, status)
3. Log to a tracking spreadsheet
4. Set calendar reminders for due dates

### 4. Budget Monitoring
When the user asks about their budget:
1. Read budget spreadsheet data
2. Pull recent transaction emails
3. Compare actual vs. planned spending
4. Alert on any overages

## Error Handling

- **Token request returns `success: false`**: The user hasn't connected this service. Tell them: "You'll need to connect [Google/Microsoft] in Knapsack Settings first."
- **API returns 401/403**: Token may have expired mid-request. Retry by fetching a new token.
- **API returns 404**: The resource (spreadsheet, email) doesn't exist or user doesn't have access.
- **Connection timeout**: Knapsack's local server may not be running. Check that the Knapsack app is open.

## Security & Privacy

- All API calls go directly from the user's machine to Google/Microsoft — no data passes through Knapsack servers.
- Access tokens are short-lived and refreshed on demand via Knapsack's local API.
- This skill never stores tokens on disk — it fetches fresh tokens for each operation.
- The local API (`127.0.0.1:8897`) is only accessible from the user's machine.

## External Endpoints

- `http://127.0.0.1:8897` — Knapsack local API (token retrieval, connection status)
- `https://sheets.googleapis.com` — Google Sheets API
- `https://www.googleapis.com` — Google Drive, Calendar, Gmail APIs
- `https://gmail.googleapis.com` — Gmail API
- `https://graph.microsoft.com` — Microsoft Graph API (Excel, Outlook, Calendar, OneDrive)
