---
name: Redis
description: Query and manage Redis key-value stores and caches.
metadata: {"clawdbot":{"emoji":"🔴","homepage":"https://redis.io","requires":{"anyBins":["redis-cli","valkey-cli"]},"install":[{"id":"brew","kind":"brew","formula":"redis","bins":["redis-cli"]}]}}
---

# Redis

Use `redis-cli` to interact with Redis instances for caching, pub/sub, and data storage.

## When to activate

- User asks to query, set, or manage Redis keys
- User wants to inspect cache contents or flush data
- User needs to debug Redis pub/sub or streams

## Common operations

| Task | Command |
|------|---------|
| Connect | `redis-cli -h host -p 6379` |
| Get a key | `GET mykey` |
| Set a key | `SET mykey "value"` |
| List keys | `KEYS pattern*` |
| Check info | `INFO` |
