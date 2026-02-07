---
name: MySQL
description: Query and manage MySQL databases.
metadata: {"clawdbot":{"emoji":"🐬","homepage":"https://dev.mysql.com","requires":{"bins":["mysql"]},"install":[{"id":"brew","kind":"brew","formula":"mysql","bins":["mysql"]}]}}
---

# MySQL

Use the `mysql` client to connect to and query MySQL/MariaDB databases.

## When to activate

- User asks to query, create, or modify MySQL tables
- User wants to run SQL against a MySQL instance
- User needs to inspect schema or optimize queries

## Common operations

| Task | Command |
|------|---------|
| Connect | `mysql -h host -u user -p dbname` |
| Show databases | `SHOW DATABASES;` |
| Show tables | `SHOW TABLES;` |
| Describe table | `DESCRIBE tablename;` |
| Run query | `SELECT * FROM users LIMIT 10;` |
