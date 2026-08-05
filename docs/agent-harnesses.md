# Agent harness adapters

Knapsack Desktop routes `/api/clawd/agent-chat` through a small harness adapter. OpenClaw remains the default, so existing installations do not need configuration changes. OpenClaw retains the existing direct-chat fallback. When a user deliberately selects Hermes, Desktop reports that Hermes is unavailable instead of silently changing runtimes.

## Select a harness

Users select the runtime in **Settings → Agent runtime (Advanced)**. Hermes is validated before Knapsack saves the switch. Environment variables remain available for development and managed deployments; they seed the configuration when no saved Desktop setting exists:

| Value | Behavior |
| --- | --- |
| `openclaw` | Existing OpenClaw gateway integration. This is the default. |
| `hermes` | Hermes Agent's OpenAI-compatible Responses API. |

The API response includes a `harness` field (`openclaw` or `hermes`) so clients and diagnostics can identify the successful adapter.

## Hermes configuration

Start Hermes with its API server enabled and an API key configured. Then provide Desktop the matching key:

```sh
export KNAPSACK_AGENT_HARNESS=hermes
export KNAPSACK_HERMES_API_KEY='the same value as Hermes API_SERVER_KEY'
```

Optional settings:

| Variable | Default | Notes |
| --- | --- | --- |
| `KNAPSACK_HERMES_BASE_URL` | `http://127.0.0.1:8642/v1` | Plain HTTP is accepted only for loopback. Remote endpoints must use HTTPS. |
| `KNAPSACK_HERMES_MODEL` | `hermes-agent` | Model identifier sent to `/v1/responses`. |

The adapter uses Hermes named conversations plus `X-Hermes-Session-Key` to keep Desktop and overlay sessions stable. Images are sent as inline `input_image` content; extracted text from documents is included in the user message.

The Hermes key stays in the Rust backend and is never returned to the webview or written to logs.

Settings uses Hermes's authenticated detailed readiness check to distinguish a connected server from one that needs configuration. An unreachable server is shown as offline with guidance that Hermes may not be installed, running, or listening at the configured address. A reachable but degraded server directs the user to check API-server mode, the API key, and the configured model provider.
