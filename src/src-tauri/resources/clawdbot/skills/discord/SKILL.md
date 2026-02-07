---
name: Discord
description: Send messages and manage Discord servers, channels, and bots.
metadata: {"clawdbot":{"emoji":"🎮","homepage":"https://discord.com/developers","primaryEnv":"DISCORD_BOT_TOKEN","requires":{"env":["DISCORD_BOT_TOKEN"]}}}
---

# Discord

Interact with Discord servers via the Discord API.

## When to activate

- User asks to send messages to Discord channels
- User wants to manage server roles, channels, or members
- User needs to read message history or search conversations

## Setup

Requires a `DISCORD_BOT_TOKEN` environment variable (Bot token from the Discord Developer Portal).

## Capabilities

- Send and read messages in channels and DMs
- Manage server roles and permissions
- Create and configure channels
- Search message history
- Handle reactions and threads
