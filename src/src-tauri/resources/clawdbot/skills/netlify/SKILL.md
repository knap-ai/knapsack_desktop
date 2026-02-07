---
name: Netlify
description: Deploy and manage sites on Netlify.
metadata: {"clawdbot":{"emoji":"🌍","homepage":"https://www.netlify.com","requires":{"bins":["netlify"]},"install":[{"id":"npm","kind":"node","package":"netlify-cli","bins":["netlify"]}]}}
---

# Netlify

Use the Netlify CLI to deploy and manage web projects.

## When to activate

- User asks to deploy a site to Netlify
- User wants to manage environment variables, forms, or functions
- User needs to check deployment status or configure build settings

## Common operations

| Task | Command |
|------|---------|
| Login | `netlify login` |
| Init project | `netlify init` |
| Deploy preview | `netlify deploy` |
| Deploy production | `netlify deploy --prod` |
| Start dev server | `netlify dev` |
| Set env variable | `netlify env:set KEY value` |
