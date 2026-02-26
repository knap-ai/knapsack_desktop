#!/usr/bin/env bash
set -euo pipefail

# knapsack-token.sh — Helper for retrieving OAuth access tokens from Knapsack
#
# Usage:
#   ./knapsack-token.sh discover          — list connected services
#   ./knapsack-token.sh token <scope>     — get a fresh access token for a scope
#
# Scopes (local connections):
#   google_drive_read, google_gmail_modify, google_calendar_read,
#   google_profile_read, microsoft_profile_read, microsoft_outlook_read,
#   microsoft_onedrive_read, microsoft_calendar_read
#
# Scopes (backend-managed connections):
#   wealthbox_crm, redtail_crm, precisefp_data, emoney_advisor, orion_portfolio

KNAPSACK_API="http://127.0.0.1:8897"

discover() {
  curl -sf "${KNAPSACK_API}/api/knapsack/connections/services" | jq .
}

get_token() {
  local scope="${1:?Usage: knapsack-token.sh token <scope>}"

  # Get user email from service discovery
  local email
  email=$(curl -sf "${KNAPSACK_API}/api/knapsack/connections/services" | jq -r '.email // empty')
  if [ -z "$email" ]; then
    echo '{"error": "No connected user found. Connect a service in Knapsack Settings."}' >&2
    exit 1
  fi

  # Use the unified token endpoint for all providers
  curl -sf "${KNAPSACK_API}/api/knapsack/connections/token?email=${email}&scope=${scope}" | jq -r '.access_token // empty'
}

case "${1:-help}" in
  discover)  discover ;;
  token)     get_token "${2:-}" ;;
  *)
    echo "Usage: knapsack-token.sh {discover|token <scope>}" >&2
    exit 1
    ;;
esac
