---
name: ngrok
description: Expose local servers to the internet with secure tunnels.
metadata: {"clawdbot":{"emoji":"🔗","homepage":"https://ngrok.com","requires":{"bins":["ngrok"]},"install":[{"id":"brew","kind":"brew","formula":"ngrok/ngrok/ngrok","bins":["ngrok"]}]}}
---

# ngrok

Use ngrok to create secure tunnels to expose local services.

## When to activate

- User asks to expose a local server to the internet
- User wants to test webhooks from external services
- User needs a public URL for a local development server

## Common operations

| Task | Command |
|------|---------|
| Expose HTTP port | `ngrok http 3000` |
| Expose with domain | `ngrok http --domain=app.ngrok.dev 3000` |
| TCP tunnel | `ngrok tcp 22` |
| List tunnels | `ngrok api tunnels list` |
| View dashboard | Open http://localhost:4040 |
