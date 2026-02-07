---
name: GitHub
description: Manage repositories, issues, pull requests, and code reviews using the GitHub CLI.
metadata: {"clawdbot":{"emoji":"🐙","homepage":"https://cli.github.com","requires":{"bins":["gh"]},"install":[{"id":"brew","kind":"brew","formula":"gh","bins":["gh"]},{"id":"npm","kind":"node","package":"@anthropic-ai/github-skill","bins":["gh"]}]}}
---

# GitHub

Use the `gh` CLI to interact with GitHub repositories, issues, pull requests, actions, and more.

## When to activate

- User asks to create, view, or manage GitHub issues or PRs
- User wants to check CI/CD status or workflow runs
- User asks to clone, fork, or browse repositories
- User wants to review or merge pull requests

## Common operations

| Task | Command |
|------|---------|
| List open PRs | `gh pr list` |
| Create a PR | `gh pr create --title "..." --body "..."` |
| View an issue | `gh issue view 123` |
| List workflows | `gh run list` |
| Clone a repo | `gh repo clone owner/repo` |
| Search code | `gh search code "query"` |
