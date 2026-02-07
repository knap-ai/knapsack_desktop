---
name: Jira
description: Manage Jira issues, sprints, and project boards.
metadata: {"clawdbot":{"emoji":"📋","homepage":"https://developer.atlassian.com","primaryEnv":"JIRA_API_TOKEN","requires":{"env":["JIRA_API_TOKEN","JIRA_BASE_URL"]}}}
---

# Jira

Interact with Jira Cloud via the Atlassian REST API.

## When to activate

- User asks to create, update, or search Jira issues
- User wants to view sprint boards or backlogs
- User needs to transition issues or add comments

## Setup

Requires:
- `JIRA_API_TOKEN` — API token from https://id.atlassian.com/manage/api-tokens
- `JIRA_BASE_URL` — Your Jira instance URL (e.g., `https://yourteam.atlassian.net`)

## Capabilities

- Create and update issues (bugs, stories, tasks)
- Search with JQL queries
- Manage sprints and boards
- Add comments and attachments
- Transition issue status
