---
name: knapsack-finance
description: Access financial services (Wealthbox CRM, Google Sheets, Gmail, Microsoft Excel, Outlook) through Knapsack's managed OAuth connections. No API keys needed — uses tokens from services the user has already connected.
version: 0.2.0
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

## Supported Services

### Financial Advisor / CRM
- **Wealthbox CRM** — contacts, tasks, events, opportunities, notes, activity stream, workflows
- **Redtail CRM** — contacts, activities, notes, opportunities, calendar
- **PreciseFP** — financial planning data collection forms, client questionnaires
- **eMoney Advisor** — financial plans, account aggregation
- **Orion Portfolio Solutions** — portfolio data, performance reporting, trading

### Productivity (with financial use cases)
- **Google Sheets** — spreadsheets, budgets, financial models
- **Gmail** — invoices, receipts, bank statements, financial correspondence
- **Google Calendar** — payment due dates, client meetings, review deadlines
- **Microsoft Excel Online** — workbooks, financial reports
- **Microsoft Outlook** — financial emails, client communications
- **Microsoft Calendar** — scheduling, reminders

## How It Works

Knapsack stores OAuth tokens for connected services. This skill retrieves fresh access tokens from Knapsack's local API (`http://127.0.0.1:8897`) and uses them to call service APIs directly.

There are two token sources:
1. **Local connections** (Google, Microsoft) — tokens are refreshed locally on the desktop
2. **Backend connections** (Wealthbox, Redtail, PreciseFP, eMoney, Orion) — tokens are managed by the Knapsack API server and proxied through the local API

**Important**: Only use services the user has already connected. If a token request fails, tell the user they need to connect that service in Knapsack Settings first.

## Step 1: Discover Connected Services

Always start by discovering what services the user has connected. This also returns the user's email, which you need for token requests:

```bash
# Returns: { "success": true, "email": "user@example.com", "services": [{"scope": "google_drive_read", "provider": "google"}, {"scope": "wealthbox_crm", "provider": "wealthbox"}, ...] }
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

### Wealthbox / Redtail / Other Backend-Managed Tokens

For services whose OAuth is managed by the Knapsack API server, retrieve the token via the proxy endpoint:

```bash
# Scopes: wealthbox_crm, redtail_crm, precisefp_data, emoney_advisor, orion_portfolio
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/token?email=${USER_EMAIL}&scope=wealthbox_crm" | jq -r '.access_token')
```

### Helper Script

A convenience script is bundled with this skill:

```bash
# Discover connected services
./knapsack-token.sh discover

# Get a fresh token for a specific scope
TOKEN=$(./knapsack-token.sh token google_drive_read)
TOKEN=$(./knapsack-token.sh token wealthbox_crm)
```

### All Possible Scopes

**Local connections (Google/Microsoft):**
- `google_profile_read` — Google profile
- `google_gmail_modify` — Gmail read/write
- `google_drive_read` — Google Drive (includes Sheets)
- `google_calendar_read` — Google Calendar
- `microsoft_profile_read` — Microsoft profile
- `microsoft_outlook_read` — Outlook email
- `microsoft_onedrive_read` — OneDrive (includes Excel Online)
- `microsoft_calendar_read` — Microsoft Calendar

**Backend connections (Financial Advisor tools):**
- `wealthbox_crm` — Wealthbox CRM (contacts, tasks, events, opportunities)
- `redtail_crm` — Redtail CRM (contacts, activities, notes)
- `precisefp_data` — PreciseFP (data gathering forms)
- `emoney_advisor` — eMoney Advisor (financial planning)
- `orion_portfolio` — Orion (portfolio management, performance)

## Financial Advisor CRM APIs

### Wealthbox CRM

Base URL: `https://api.crmworkspace.com/v1`

**List contacts:**
```bash
TOKEN=$(curl -s "http://127.0.0.1:8897/api/knapsack/connections/token?email=${USER_EMAIL}&scope=wealthbox_crm" | jq -r '.access_token')

# List all contacts (paginated)
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/contacts?per_page=25&page=1" | jq

# Search contacts by name
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/contacts?query=Smith&per_page=25" | jq
```

**Get a specific contact:**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/contacts/${CONTACT_ID}" | jq
```

**Create a contact:**
```bash
curl -s -X POST -H "ACCESS_TOKEN: $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.crmworkspace.com/v1/contacts" \
  -d '{
    "contact": {
      "first_name": "Jane",
      "last_name": "Doe",
      "contact_type": "Person",
      "email_addresses": [{"address": "jane@example.com", "kind": "Work"}],
      "phone_numbers": [{"address": "555-0100", "kind": "Mobile"}]
    }
  }' | jq
```

**List tasks:**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/tasks?per_page=25" | jq
```

**Create a task:**
```bash
curl -s -X POST -H "ACCESS_TOKEN: $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.crmworkspace.com/v1/tasks" \
  -d '{
    "task": {
      "name": "Review Q1 portfolio allocation",
      "due_date": "2026-03-15",
      "priority": 1,
      "linked_to": [{"id": '$CONTACT_ID', "type": "Contact"}]
    }
  }' | jq
```

**List events:**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/events?per_page=25" | jq
```

**List opportunities (deals/pipeline):**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/opportunities?per_page=25" | jq
```

**Get activity stream:**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/activity_stream?per_page=25" | jq
```

**Add a note to a contact:**
```bash
curl -s -X POST -H "ACCESS_TOKEN: $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.crmworkspace.com/v1/notes" \
  -d '{
    "note": {
      "body": "Discussed retirement timeline. Client wants to retire at 62.",
      "linked_to": [{"id": '$CONTACT_ID', "type": "Contact"}]
    }
  }' | jq
```

**Get authenticated user profile:**
```bash
curl -s -H "ACCESS_TOKEN: $TOKEN" \
  "https://api.crmworkspace.com/v1/me" | jq
```

**Important Wealthbox notes:**
- Rate limit: 1 request/second over 5-minute window (short bursts OK). 429 status if exceeded.
- Pagination: use `per_page` and `page` parameters on all list endpoints.
- Auth header: Wealthbox accepts either `ACCESS_TOKEN: <token>` or `Authorization: Bearer <token>`.

## Productivity Service APIs

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

## Financial Advisor Workflows

### 1. Client Onboarding (Wealthbox + Gmail + Sheets)
When a financial advisor asks to onboard a new client:
1. Create a contact in Wealthbox with client details
2. Create onboarding tasks in Wealthbox (gather docs, risk assessment, IPS review)
3. Send welcome email via Gmail with next steps
4. Create a client tracking row in Google Sheets
5. Schedule initial review meeting via Calendar

### 2. Client Review Preparation
When preparing for a client review:
1. Pull the client's contact record and notes from Wealthbox
2. Check recent activity stream for this client
3. Review open tasks and opportunities
4. Search Gmail/Outlook for recent client correspondence
5. Pull portfolio data from the client's financial spreadsheets
6. Compile a meeting prep summary

### 3. Pipeline Management
When the advisor asks about their sales pipeline:
1. List all open opportunities from Wealthbox
2. Check upcoming events/meetings related to prospects
3. Review tasks due this week
4. Summarize pipeline value by stage

### 4. Expense Tracking
When the user asks to track expenses:
1. Search Gmail/Outlook for receipt and invoice emails
2. Extract amounts, dates, vendors from email content
3. Write structured data to a Google Sheet or Excel workbook
4. Summarize totals by category

### 5. Financial Report Generation
When the user asks for a financial summary:
1. Read data from their spreadsheets (Sheets/Excel)
2. Pull relevant emails for the time period
3. Check calendar for financial meetings/deadlines
4. Compile and present the summary

### 6. CRM Data Hygiene
When the advisor asks to clean up their CRM:
1. List contacts from Wealthbox
2. Identify duplicates or missing information
3. Cross-reference with email contacts
4. Suggest merges or updates

## Error Handling

- **Token request returns `success: false`**: The user hasn't connected this service. Tell them: "You'll need to connect [service name] in Knapsack Settings first."
- **API returns 401/403**: Token may have expired mid-request. Retry by fetching a new token.
- **API returns 404**: The resource doesn't exist or user doesn't have access.
- **API returns 429**: Rate limited (especially Wealthbox: 1 req/sec). Wait a moment and retry.
- **Connection timeout**: Knapsack's local server may not be running. Check that the Knapsack app is open.

## Security & Privacy

- All API calls go directly from the user's machine to the service provider — no data passes through Knapsack servers.
- Access tokens are short-lived and refreshed on demand via Knapsack's local API.
- This skill never stores tokens on disk — it fetches fresh tokens for each operation.
- The local API (`127.0.0.1:8897`) is only accessible from the user's machine.
- CRM data (client PII) stays on the user's machine and is never sent to AI model providers.

## External Endpoints

- `http://127.0.0.1:8897` — Knapsack local API (token retrieval, connection status)
- `https://api.crmworkspace.com` — Wealthbox CRM API
- `https://sheets.googleapis.com` — Google Sheets API
- `https://www.googleapis.com` — Google Drive, Calendar, Gmail APIs
- `https://gmail.googleapis.com` — Gmail API
- `https://graph.microsoft.com` — Microsoft Graph API (Excel, Outlook, Calendar, OneDrive)
