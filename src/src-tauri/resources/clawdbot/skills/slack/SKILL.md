---
name: Slack
description: Send and read Slack messages, manage channels, and search conversations.
metadata: {"clawdbot":{"emoji":"💬","homepage":"https://api.slack.com","primaryEnv":"SLACK_TOKEN","requires":{"env":["SLACK_TOKEN"]}}}
---

# Slack

Interact with Slack workspaces via the Slack API.

## When to activate

- User asks to send a message to a Slack channel or user
- User wants to read recent messages or search conversations
- User needs to manage channels, threads, or reactions

## Setup

Requires a `SLACK_TOKEN` environment variable (Bot User OAuth Token starting with `xoxb-`).

## Capabilities

- Send messages to channels and DMs
- Read and search message history
- Manage channels (create, archive, invite)
- Upload files and snippets
- Add reactions and thread replies
