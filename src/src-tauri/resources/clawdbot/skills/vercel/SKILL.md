---
name: Vercel
description: Deploy and manage projects on Vercel.
metadata: {"clawdbot":{"emoji":"▲","homepage":"https://vercel.com","requires":{"bins":["vercel"]},"install":[{"id":"npm","kind":"node","package":"vercel","bins":["vercel"]}]}}
---

# Vercel

Use the Vercel CLI to deploy and manage web projects.

## When to activate

- User asks to deploy a project to Vercel
- User wants to manage environment variables or domains
- User needs to check deployment status or logs

## Common operations

| Task | Command |
|------|---------|
| Deploy | `vercel` |
| Deploy to production | `vercel --prod` |
| List deployments | `vercel ls` |
| Set env variable | `vercel env add SECRET` |
| View logs | `vercel logs deployment-url` |
| Link project | `vercel link` |
