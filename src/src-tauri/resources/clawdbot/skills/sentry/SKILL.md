---
name: Sentry
description: Track errors and monitor application performance with Sentry.
metadata: {"clawdbot":{"emoji":"🐛","homepage":"https://sentry.io","primaryEnv":"SENTRY_AUTH_TOKEN","requires":{"env":["SENTRY_AUTH_TOKEN"]}}}
---

# Sentry

Interact with Sentry for error tracking and performance monitoring.

## When to activate

- User asks to check recent errors or exceptions
- User wants to investigate a specific Sentry issue
- User needs to create releases or manage source maps
- User asks about application error rates or performance

## Setup

Requires a `SENTRY_AUTH_TOKEN` environment variable (auth token from Sentry settings).

## Capabilities

- List and search recent issues and events
- View error details, stack traces, and breadcrumbs
- Manage releases and deploy tracking
- Query performance metrics and transactions
- Resolve, ignore, or assign issues
