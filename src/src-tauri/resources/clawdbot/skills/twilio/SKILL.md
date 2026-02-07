---
name: Twilio
description: Send SMS, make calls, and manage communications with Twilio.
metadata: {"clawdbot":{"emoji":"📱","homepage":"https://www.twilio.com","primaryEnv":"TWILIO_AUTH_TOKEN","requires":{"env":["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN"]}}}
---

# Twilio

Interact with Twilio APIs for SMS, voice, and messaging.

## When to activate

- User asks to send SMS or MMS messages
- User wants to make or manage phone calls
- User needs to check message delivery status
- User asks about Twilio phone number management

## Setup

Requires:
- `TWILIO_ACCOUNT_SID` — Account SID from Twilio console
- `TWILIO_AUTH_TOKEN` — Auth token from Twilio console

## Capabilities

- Send SMS and MMS messages
- Make and manage voice calls
- Look up phone numbers
- Manage messaging services
- Check delivery receipts and logs
