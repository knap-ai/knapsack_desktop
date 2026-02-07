---
name: Cloudflare
description: Manage Cloudflare Workers, Pages, DNS, and edge infrastructure.
metadata: {"clawdbot":{"emoji":"⚡","homepage":"https://developers.cloudflare.com","requires":{"bins":["wrangler"]},"install":[{"id":"npm","kind":"node","package":"wrangler","bins":["wrangler"]}]}}
---

# Cloudflare

Use Wrangler to manage Cloudflare Workers, Pages, R2, KV, and DNS.

## When to activate

- User asks to deploy or manage Cloudflare Workers
- User wants to configure DNS records or edge rules
- User needs to manage R2 storage or KV namespaces
- User asks about Cloudflare Pages deployments

## Common operations

| Task | Command |
|------|---------|
| Login | `wrangler login` |
| Deploy Worker | `wrangler deploy` |
| Dev mode | `wrangler dev` |
| List KV namespaces | `wrangler kv:namespace list` |
| Tail logs | `wrangler tail` |
| Publish Pages | `wrangler pages deploy ./dist` |
