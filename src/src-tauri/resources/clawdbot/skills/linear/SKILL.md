---
name: Linear
description: Manage Linear issues, projects, and cycles.
metadata: {"clawdbot":{"emoji":"🔷","homepage":"https://linear.app","primaryEnv":"LINEAR_API_KEY","requires":{"env":["LINEAR_API_KEY"]}}}
---

# Linear

Interact with Linear's issue tracker via the GraphQL API.

## When to activate

- User asks to create, update, or search Linear issues
- User wants to view projects, cycles, or team workloads
- User needs to manage issue priorities or assignments

## Setup

Requires a `LINEAR_API_KEY` environment variable (personal API key from Linear settings).

## Capabilities

- Create and update issues with labels, priorities, and assignees
- Search and filter issues across teams
- Manage projects and cycles
- View team workload and progress
- Add comments and attachments
