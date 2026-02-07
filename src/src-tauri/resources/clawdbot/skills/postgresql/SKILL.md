---
name: PostgreSQL
description: Query and manage PostgreSQL databases.
metadata: {"clawdbot":{"emoji":"🐘","homepage":"https://www.postgresql.org","requires":{"bins":["psql"]},"install":[{"id":"brew","kind":"brew","formula":"postgresql@16","bins":["psql"]}]}}
---

# PostgreSQL

Use `psql` to connect to and query PostgreSQL databases.

## When to activate

- User asks to query, create, or modify database tables
- User wants to run SQL against a PostgreSQL instance
- User needs to inspect schema, indexes, or query plans

## Common operations

| Task | Command |
|------|---------|
| Connect | `psql -h host -U user -d dbname` |
| List databases | `\l` |
| List tables | `\dt` |
| Describe table | `\d tablename` |
| Run query | `SELECT * FROM users LIMIT 10;` |
| Export to CSV | `\copy (SELECT ...) TO 'out.csv' CSV HEADER` |
