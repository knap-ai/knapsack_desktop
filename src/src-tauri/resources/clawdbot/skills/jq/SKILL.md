---
name: jq
description: Parse, filter, and transform JSON data on the command line.
metadata: {"clawdbot":{"emoji":"🔧","homepage":"https://jqlang.github.io/jq/","requires":{"bins":["jq"]},"install":[{"id":"brew","kind":"brew","formula":"jq","bins":["jq"]}]}}
---

# jq

Use `jq` to slice, filter, map, and transform JSON with ease.

## When to activate

- User asks to parse or extract data from JSON files or API responses
- User wants to filter, transform, or reformat JSON
- User needs to build data pipelines involving JSON

## Common operations

| Task | Command |
|------|---------|
| Pretty-print | `cat data.json \| jq .` |
| Extract field | `jq '.name' data.json` |
| Filter array | `jq '.[] \| select(.age > 30)' data.json` |
| Map values | `jq '[.[] \| .name]' data.json` |
| Combine fields | `jq '{name, email}' data.json` |
