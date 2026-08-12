# Knapsack Desktop — Claude Code Guide

## Pre-commit checklist

Run these before every commit. CI will catch failures, but catching them locally is faster.

```sh
# TypeScript type check (catches type errors without building)
cd src && npx tsc --noEmit

# Rust unit tests (runs on any platform — no macOS system deps needed)
cd src && cargo test --manifest-path src-tauri/Cargo.toml 2>&1 | grep -E "test result|FAILED|^error"
```

For Rust compile errors that only show on macOS (e.g. libc, tauri platform APIs):
```sh
# macOS only
cd src && cargo check --manifest-path src-tauri/Cargo.toml --target aarch64-apple-darwin
```

## Build & install for local testing (macOS Apple Silicon)

```sh
cd src
TAURI_PRIVATE_KEY="" npm run tauri build -- --target aarch64-apple-darwin

pkill -x Knapsack; sleep 1
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/ai.knap.knapsack.clawdbot.plist 2>/dev/null
rm -f ~/Library/LaunchAgents/ai.knap.knapsack.clawdbot.plist   # force first-launch auto-enable
# Use absolute path — avoids "No such file" if cwd is wrong
APP=$(pwd)/src-tauri/target/aarch64-apple-darwin/release/bundle/macos/Knapsack.app
cp -R "$APP" /Applications/
open /Applications/Knapsack.app
```

Verify gateway auto-started after launch:
```sh
sleep 5 && grep "auto_enable" ~/Library/Logs/ai.knap.knapsack.clawdbot/clawdbot-stderr.log
```

## Architecture: gateway / browser layer

```
Knapsack (Tauri) ──WS──► Clawdbot gateway (Node, port 18789)
                                │
                                └──CDP──► Chrome (port 18791, browser control)
```

- **`clawd/gateway_client.rs`** — persistent pooled WebSocket client to the gateway. One shared connection (`CLIENT` static), serialized via `CONNECT_LOCK` to prevent thundering-herd.
- **`clawd/gateway_ws.rs`** — simple one-shot WS client used for non-pooled calls (cron, config).
- **`clawd/gateway_supervisor.rs`** — ensures the gateway LaunchAgent is running; calls launchctl.
- **`clawd/service.rs`** — actix handlers for enable/disable, config, diagnostics. Contains `prepare_gateway_config()` and `auto_enable_if_needed()`.

## Recurring bugs — invariants to always verify

### 1. Gateway WS scopes — all three handshake sites must include `operator.write`

There are **three** places that build `ConnectParams.scopes`. All must include all three:
```rust
scopes: vec!["operator.admin", "operator.read", "operator.write"],
```
Locations:
- `gateway_client.rs` — `connect_and_handshake()` (pooled client)
- `gateway_client.rs` — `connect_and_handshake_at()` (runtime config push)
- `gateway_ws.rs` — `gateway_request()` (one-shot)

Missing `operator.write` causes: `browser /start nudge failed: missing scope: operator.write`.

### 2. Model format — always read both string and object forms

`service.rs` writes `agents.defaults.model` as `{"primary": "groq/..."}` (object).
`gateway_client.rs` writes it as a plain string.
Always read both when comparing or syncing:

```rust
.and_then(|v| match v {
    Value::String(s) => Some(s.clone()),
    Value::Object(o) => o.get("primary").and_then(|p| p.as_str()).map(|s| s.to_string()),
    _ => None,
})
```

Failing to handle the object form makes `disk_model` always `""`, causing `disk_config_changed = true` every startup → unnecessary gateway restart on every launch.

### 3. Borrow checker: clone before mutating

When reading a field from a `serde_json::Value` and then mutating the same value, use `.to_owned()` / `.clone()` immediately after the read. NLL cannot bridge the borrow across `pointer_mut()` / `as_object_mut()` calls.

```rust
// BAD — disk_model borrows cfg, then cfg is mutated below:
let disk_model = cfg.pointer("/agents/defaults/model").and_then(|v| v.as_str());

// GOOD — owned copy, no live borrow during mutation:
let disk_model: String = cfg.pointer("/agents/defaults/model")
    .and_then(|v| v.as_str())
    .unwrap_or("")
    .to_owned();
```

### 4. Updater: install and relaunch must be atomic

`installUpdate()` replaces the binary on disk immediately. Calling `relaunch()` after any gap fails with "No such file or directory". Always do both in one sequence:

```typescript
await installUpdate()
await relaunch()        // must follow immediately — no await between them
```

### 5. Gateway port probe must be HTTP, not TCP

`is_gateway_port_open()` uses an HTTP GET. A raw `TcpStream::connect()` + drop causes the gateway WS server to log spurious `code=1006 "closed before connect"` for every probe.

### 6. Connection thundering herd

`get_or_connect()` and `spawn_reconnect_task()` both serialize through `CONNECT_LOCK` (tokio Mutex). Without it, N concurrent requests all seeing `CLIENT = None` each open a WS connection; N-1 get dropped → N-1 `code=1006` entries per burst. The reconnect task must also hold `CONNECT_LOCK` when calling `connect_and_handshake` — otherwise it races with `get_or_connect` after a gateway restart and produces the same burst. Do not remove either lock acquisition.

### 7. LaunchAgent auto-enable on first launch

`auto_enable_if_needed()` runs at startup (from `main.rs` `setup_handler`) in a background thread. It writes the plist and calls `launchctl bootstrap` + `kickstart` only when the plist doesn't already exist. When testing after a reinstall, delete the plist first:
```sh
rm -f ~/Library/LaunchAgents/ai.knap.knapsack.clawdbot.plist
```

### 8. `tools.allow` — build from `service::knapsack_tools_allow()` / `knapsack_sandbox_tools_allow()`, never a literal

Six call sites across `service.rs`, `channels.rs`, and `gateway_client.rs` each used to hand-roll the `tools.allow` / `tools.sandbox.tools.allow` array as a separate `serde_json::json!([...])` literal. When the snowflake MCP tool's allow entry was added, only `ensure_knapsack_snowflake_tool_allow()` got updated — the other five kept shipping the old list. Worse, `apply_runtime_browser_config()` in `gateway_client.rs` pushes its copy via a live `config.patch` RPC exactly once per process lifetime, which silently clobbers whatever `ensure_knapsack_snowflake_tool_allow()` had already fixed on disk whenever the gateway is already running (`prepare_gateway_config()` skips its own file write in that case, on the assumption the RPC path would carry the change — it didn't, for this field).

Symptom: the tool works when invoked directly, but a live Slack/other-channel session behaves as if the tool doesn't exist (the model never attempts it — it has no idea it's allowed), because the gateway's *effective* `tools.allow` never received the new entry.

Fix in place: every `tools.allow` / `tools.sandbox.tools.allow` payload must come from `service::knapsack_tools_allow()` / `service::knapsack_sandbox_tools_allow()`. Add new always-on MCP tool names to `KNAPSACK_MCP_TOOLS_ALLOW` in `service.rs` — never as a one-off literal at a call site.

### 9. `browser.rs` has a PARTIAL mirror of `StoredTokens` — never serialize it back

`clawd/browser.rs` defines its own `StoredTokens` + `load_or_create_tokens`, separate from the real one in `service.rs`. It is a **subset**: it has historically been missing `knapsack_refresh_token`, `desktop_api_token`, `session_capability_secret`, and `mobile_pairing_token`.

Two consequences, both of which have bitten:

1. **A missing field silently disables a feature.** `knapsack_refresh_token` was absent, so `refresh_knapsack_access_token` could only ever read a refresh token from the `KNAPSACK_REFRESH_TOKEN` env var and never from disk — leaving the app permanently 401'd ("Knapsack session expired — please sign in again") once the access token lapsed, even with a valid refresh token sitting in tokens.json. When adding a token field to `service.rs`, add it here too.
2. **Writing this struct back to tokens.json deletes unrelated secrets.** `load_or_create_tokens` only writes when the file is absent, which is why nothing has been lost yet. Any new persistence path must do a surgical merge on the parsed JSON instead — see `persist_knapsack_access_token`:

```rust
let mut value: serde_json::Value = serde_json::from_str(&raw)?;
value.as_object_mut()?.insert("knapsack_access_token".into(), token.into());
fs::write(&path, serde_json::to_string_pretty(&value)?)?;
```

Related invariant: **check JWT `exp` before trusting a cached access token.** `knapsack_bearer_token` returned the cached token unconditionally, so an expired credential was reused forever instead of triggering a refresh. `knapsack_token_is_expired` parses `exp` (60s skew) and treats non-JWT/opaque tokens as *not* expired — never discard a credential whose expiry you cannot read. The local `/refresh_token_api/{email}` endpoint echoes stored values rather than performing a real OAuth exchange, so its response must be expiry-checked too.

## Unit tests

The Rust unit tests live in `src/src-tauri/src/clawd/gateway_client.rs` (bottom of file). They cover the highest-regression-risk parsing logic and don't require a running gateway. Run with:

```sh
cd src && cargo test --manifest-path src-tauri/Cargo.toml clawd
```
