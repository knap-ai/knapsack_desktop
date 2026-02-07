---
name: SQLite
description: Query and manage lightweight SQLite databases.
metadata: {"clawdbot":{"emoji":"🪶","homepage":"https://sqlite.org","requires":{"bins":["sqlite3"]},"install":[{"id":"brew","kind":"brew","formula":"sqlite","bins":["sqlite3"]}]}}
---

# SQLite

Use `sqlite3` to work with local SQLite database files.

## When to activate

- User asks to query or create SQLite databases
- User wants to inspect `.db` or `.sqlite` files
- User needs a quick local database for prototyping

## Common operations

| Task | Command |
|------|---------|
| Open database | `sqlite3 mydb.db` |
| List tables | `.tables` |
| Show schema | `.schema tablename` |
| Run query | `SELECT * FROM users;` |
| Export CSV | `.mode csv` then `.output data.csv` |
| Import CSV | `.import data.csv tablename` |
