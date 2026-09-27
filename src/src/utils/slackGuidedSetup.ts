export const SLACK_GUIDED_SETUP_PROMPT = `Please set up the Slack integration for Knapsack for me using the shared openclaw browser profile. I have confirmed that I am signed into https://api.slack.com/apps in that browser. Verify the session before changing anything.

Goals:
1. Open the Slack app configuration flow and reuse the existing Knapsack/OpenClaw/Vera app if one already exists. Only create a new app if there is no suitable existing one.
2. Make sure the app is configured for internal workspace use like Merlin.
3. Add every required setting so the Slack integration works without extra manual guesswork.

Required Slack settings:
- App Home:
  - home_tab_enabled = true
  - messages_tab_enabled = true
  - messages_tab_read_only_enabled = false
- Assistant threads enabled
- Socket Mode enabled
- App-level token with scope: connections:write
- Bot token scopes:
  - app_mentions:read
  - assistant:write
  - channels:history
  - channels:read
  - chat:write
  - commands
  - emoji:read
  - files:read
  - files:write
  - groups:history
  - groups:read
  - im:history
  - im:read
  - im:write
  - mpim:history
  - mpim:read
  - mpim:write
  - pins:read
  - pins:write
  - reactions:read
  - reactions:write
  - usergroups:read
  - users:read
  - users:read.email
- Optional if available: chat:write.customize

When finished:
1. Reinstall the Slack app to the workspace if Slack requires it.
2. Confirm that the app can receive direct messages and that sending messages to the app is not turned off.
3. Save the tokens using Knapsack channel configuration if that tool is available. Never print secrets in chat. If secure configuration is unavailable, ask me to paste the tokens into the masked Slack fields myself. Verify the resulting channel status before claiming success.
4. If any step requires a human admin click or approval, stop and give me one crisp instruction at a time.

Do not send test messages or contact anyone. If browser login or workspace approval requires me, pause for that action. Please drive this in the browser and keep going until Slack is fully configured or you hit a real human-only blocker.`
