---
name: Fly.io
description: Deploy and manage applications globally on Fly.io.
metadata: {"clawdbot":{"emoji":"🪁","homepage":"https://fly.io","requires":{"bins":["fly"]},"install":[{"id":"brew","kind":"brew","formula":"flyctl","bins":["fly","flyctl"]}]}}
---

# Fly.io

Use the Fly CLI to deploy and manage applications across global edge infrastructure.

## When to activate

- User asks to deploy an application to Fly.io
- User wants to manage machines, volumes, or secrets
- User needs to configure scaling, regions, or networking

## Common operations

| Task | Command |
|------|---------|
| Login | `fly auth login` |
| Launch app | `fly launch` |
| Deploy | `fly deploy` |
| View status | `fly status` |
| Set secret | `fly secrets set KEY=value` |
| SSH into machine | `fly ssh console` |
| View logs | `fly logs` |
