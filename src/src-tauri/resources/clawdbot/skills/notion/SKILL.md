---
name: Notion
description: Read and edit Notion pages, databases, and workspaces.
metadata: {"clawdbot":{"emoji":"📝","homepage":"https://developers.notion.com","primaryEnv":"NOTION_API_KEY","requires":{"env":["NOTION_API_KEY"]}}}
---

# Notion

Interact with Notion workspaces via the Notion API.

## When to activate

- User asks to read or edit Notion pages or databases
- User wants to search across their Notion workspace
- User needs to create new pages or add database entries

## Setup

Requires a `NOTION_API_KEY` environment variable (Internal integration token starting with `ntn_`).

## Capabilities

- Read and update page content (blocks)
- Query and filter databases
- Create new pages and database entries
- Search across the workspace
- Manage page properties and metadata
