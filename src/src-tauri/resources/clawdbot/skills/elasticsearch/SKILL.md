---
name: Elasticsearch
description: Search, index, and analyze data with Elasticsearch.
metadata: {"clawdbot":{"emoji":"🔎","homepage":"https://www.elastic.co","primaryEnv":"ELASTICSEARCH_URL","requires":{"env":["ELASTICSEARCH_URL"]}}}
---

# Elasticsearch

Interact with Elasticsearch clusters for full-text search and analytics.

## When to activate

- User asks to search or query an Elasticsearch index
- User wants to create indices or manage mappings
- User needs to analyze logs or run aggregations
- User asks about cluster health or performance

## Setup

Requires `ELASTICSEARCH_URL` environment variable (e.g., `https://user:pass@localhost:9200`).

## Capabilities

- Full-text search with complex queries (bool, match, range, etc.)
- Create and manage indices and mappings
- Run aggregations for analytics
- Monitor cluster health and shard allocation
- Bulk index and reindex operations
