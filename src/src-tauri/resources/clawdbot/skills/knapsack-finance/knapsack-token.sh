#!/usr/bin/env bash
set -euo pipefail

# knapsack-token.sh — Helper for retrieving OAuth access tokens from Knapsack
#
# Usage:
#   ./knapsack-token.sh discover          — list connected services
#   ./knapsack-token.sh token <scope>     — get a fresh access token for a scope
#
# Scopes:
#   google_drive_read, google_gmail_modify, google_calendar_read,
#   google_profile_read, microsoft_profile_read, microsoft_outlook_read,
#   microsoft_onedrive_read, microsoft_calendar_read

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

  local provider
  provider=$(echo "$scope" | cut -d'_' -f1)

  if [ "$provider" = "google" ]; then
    curl -sf "${KNAPSACK_API}/api/knapsack/connections/google/auth_token?email=${email}&scope=${scope}" | jq -r '.access_token // empty'
  elif [ "$provider" = "microsoft" ]; then
    # Microsoft tokens are stored directly in the connection
    curl -sf "${KNAPSACK_API}/api/knapsack/connections?email=${email}" \
      | jq -r --arg scope "$scope" '.connections[] | select(.connection.scope == $scope) | .token // empty'
  else
    echo '{"error": "Unknown provider. Supported: google, microsoft"}' >&2
    exit 1
  fi
}

case "${1:-help}" in
  discover)  discover ;;
  token)     get_token "${2:-}" ;;
  *)
    echo "Usage: knapsack-token.sh {discover|token <scope>}" >&2
    exit 1
    ;;
esac
