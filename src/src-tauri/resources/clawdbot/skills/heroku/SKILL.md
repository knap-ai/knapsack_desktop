---
name: Heroku
description: Deploy and manage applications on Heroku.
metadata: {"clawdbot":{"emoji":"🟣","homepage":"https://devcenter.heroku.com","requires":{"bins":["heroku"]},"install":[{"id":"brew","kind":"brew","formula":"heroku/brew/heroku","bins":["heroku"]}]}}
---

# Heroku

Use the Heroku CLI to deploy and manage applications.

## When to activate

- User asks to deploy an application to Heroku
- User wants to manage dynos, add-ons, or config vars
- User needs to view application logs or run one-off commands

## Common operations

| Task | Command |
|------|---------|
| Login | `heroku login` |
| Create app | `heroku create my-app` |
| Deploy | `git push heroku main` |
| View logs | `heroku logs --tail` |
| Set config | `heroku config:set KEY=value` |
| Run command | `heroku run bash` |
| Scale dynos | `heroku ps:scale web=2` |
