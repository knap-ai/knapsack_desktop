---
name: MongoDB
description: Query and manage MongoDB databases with mongosh.
metadata: {"clawdbot":{"emoji":"🍃","homepage":"https://www.mongodb.com","requires":{"bins":["mongosh"]},"install":[{"id":"brew","kind":"brew","formula":"mongosh","bins":["mongosh"]}]}}
---

# MongoDB

Use `mongosh` to interact with MongoDB databases.

## When to activate

- User asks to query, insert, or manage MongoDB collections
- User wants to inspect documents or aggregation pipelines
- User needs to manage indexes or database operations

## Common operations

| Task | Command |
|------|---------|
| Connect | `mongosh "mongodb://host:27017/db"` |
| Show databases | `show dbs` |
| Show collections | `show collections` |
| Find documents | `db.collection.find({})` |
| Insert document | `db.collection.insertOne({...})` |
| Aggregate | `db.collection.aggregate([...])` |
