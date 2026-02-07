---
name: Grafana
description: Query metrics, create dashboards, and manage alerts with Grafana.
metadata: {"clawdbot":{"emoji":"📊","homepage":"https://grafana.com","primaryEnv":"GRAFANA_API_KEY","requires":{"env":["GRAFANA_API_KEY","GRAFANA_URL"]}}}
---

# Grafana

Interact with Grafana for dashboards, metrics, and alerting.

## When to activate

- User asks to query or visualize metrics
- User wants to create or update Grafana dashboards
- User needs to manage alert rules or notification channels
- User asks about data source configuration

## Setup

Requires:
- `GRAFANA_API_KEY` — Service account token from Grafana
- `GRAFANA_URL` — Grafana instance URL (e.g., `https://grafana.example.com`)

## Capabilities

- Query data sources (Prometheus, InfluxDB, Loki, etc.)
- Create and update dashboards via the API
- Manage alert rules and contact points
- Search and organize dashboards with folders and tags
