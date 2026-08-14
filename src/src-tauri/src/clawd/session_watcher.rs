//! Keeps Rust aware of live Slack-triggered gateway sessions so the
//! Snowflake MCP tool can bind each query to a real, verified sender email
//! (never a model-supplied argument), and so per-sender Docker sandbox
//! containers get destroyed right after each turn instead of staying warm.
//!
//! There is no push/event-subscription plumbing in `gateway_client.rs` today
//! (it only supports request/response RPC over the pooled connection), and
//! building a second persistent WS listener just for this is more moving
//! parts than the payoff justifies here. Instead this polls the existing
//! `sessions.list` RPC (confirmed present in the bundle's WS method table)
//! on an interval, diffing against what it saw last poll.
//!
//! `sessionId`, `key`, `origin.accountId`, and Slack sender detection
//! (`extract_slack_sender`) are confirmed against a live `sessions.list`
//! response (2026-08-11). `hasActiveRun`/`endedAt` are still an unverified
//! guess from static reads of minified JS — verify against a real gateway
//! response before relying on the sandbox-teardown path in production.

use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::time::Duration;

use super::gateway_client;
use super::service::{app_clawdbot_home, clawdbot_home_headless, resource_path};

const POLL_INTERVAL: Duration = Duration::from_secs(5);

#[derive(Debug, Clone, Default)]
struct TrackedSession {
  has_active_run: bool,
  scope_key: Option<String>,
}

/// The writer (`write_identity`, called from `poll_once` inside the main
/// Tauri app) and the reader (`lookup_authorized_session`, called from the
/// headless `--internal-mcp-snowflake` subprocess) resolve "clawdbot home"
/// two different ways — the main app has a real `AppHandle` and never has
/// `OPENCLAW_STATE_DIR` set in its own environment, while the headless
/// subprocess has no `AppHandle` and relies entirely on that env var (see
/// `clawdbot_home_headless`). Every caller here must pass in its own
/// correctly-resolved base dir rather than each having its own guess — this
/// function previously called `clawdbot_home_headless()` unconditionally,
/// which silently failed every time from the main app (confirmed: the main
/// process never has `OPENCLAW_STATE_DIR`/`OPENCLAW_HOME` set), so no
/// identity was ever written despite the MCP subprocess reading side working
/// fine.
fn identities_dir(clawdbot_home: &Path) -> Result<PathBuf, String> {
  let dir = clawdbot_home.join("snowflake-identities");
  std::fs::create_dir_all(&dir)
    .map_err(|error| format!("Unable to create snowflake-identities dir: {error}"))?;
  Ok(dir)
}

fn identity_path(clawdbot_home: &Path, session_id: &str) -> Result<PathBuf, String> {
  Ok(identities_dir(clawdbot_home)?.join(format!("{}.json", sanitize_session_id(session_id))))
}

/// session_id is an opaque gateway-issued id, not attacker-controlled path
/// input from a Slack message, but sanitize defensively anyway. Shared with
/// `prune_stale_identities` so a record's filename and the id it is matched
/// against are always derived the same way.
fn sanitize_session_id(session_id: &str) -> String {
  session_id
    .chars()
    .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == ':' { c } else { '_' })
    .collect()
}

/// Written by the watcher when a new session appears; read by
/// `snowflake_mcp.rs` on every tool call. Never written to inside the
/// sandboxed workspace, never touches `dist/` or openclaw.json.
#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct IdentityRecord {
  email: String,
  scope_key: String,
}

fn write_identity(clawdbot_home: &Path, session_id: &str, email: &str, scope_key: &str) -> Result<(), String> {
  let path = identity_path(clawdbot_home, session_id)?;
  let record = IdentityRecord {
    email: email.to_string(),
    scope_key: scope_key.to_string(),
  };
  let json = serde_json::to_string(&record).map_err(|error| error.to_string())?;
  std::fs::write(&path, json).map_err(|error| format!("Unable to write {}: {error}", path.display()))
}

fn remove_identity(clawdbot_home: &Path, session_id: &str) {
  if let Ok(path) = identity_path(clawdbot_home, session_id) {
    let _ = std::fs::remove_file(path);
  }
}

fn read_identity_at(clawdbot_home: &Path, session_id: &str) -> Result<(String, String), String> {
  let path = identity_path(clawdbot_home, session_id)?;
  let raw = std::fs::read_to_string(&path)
    .map_err(|_| format!("No verified identity on record for session_id {session_id}"))?;
  let record: IdentityRecord = serde_json::from_str(&raw)
    .map_err(|error| format!("Corrupt identity record for session_id {session_id}: {error}"))?;
  Ok((record.email, record.scope_key))
}

struct StoredIdentity {
  session_file_stem: String,
  email: String,
  scope_key: String,
  modified: std::time::SystemTime,
}

/// Every verified identity currently on record, oldest first.
fn list_identities(clawdbot_home: &Path) -> Result<Vec<StoredIdentity>, String> {
  let dir = identities_dir(clawdbot_home)?;
  let entries = std::fs::read_dir(&dir)
    .map_err(|error| format!("Unable to list {}: {error}", dir.display()))?;
  let mut found = Vec::new();
  for entry in entries.flatten() {
    let path = entry.path();
    if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
      continue;
    }
    let Ok(raw) = std::fs::read_to_string(&path) else {
      continue;
    };
    let Ok(record) = serde_json::from_str::<IdentityRecord>(&raw) else {
      continue;
    };
    let Some(stem) = path.file_stem().and_then(|stem| stem.to_str()) else {
      continue;
    };
    let modified = path
      .metadata()
      .and_then(|meta| meta.modified())
      .unwrap_or(std::time::UNIX_EPOCH);
    found.push(StoredIdentity {
      session_file_stem: stem.to_string(),
      email: record.email,
      scope_key: record.scope_key,
      modified,
    });
  }
  found.sort_by_key(|identity| identity.modified);
  Ok(found)
}

/// Delete records for sessions the gateway no longer reports.
///
/// Records were previously only removed on the end-of-turn active→inactive
/// transition, which a 5s poll routinely misses — and `/new` orphans the old
/// record outright, since that session simply disappears. They therefore
/// accumulated forever, and once two piled up every Snowflake query was
/// refused as "ambiguous" (observed 2026-08-12: one live record plus one from
/// a session retired the previous day).
fn prune_stale_identities(clawdbot_home: &Path, live_session_ids: &HashSet<String>) {
  let live_stems: HashSet<String> = live_session_ids
    .iter()
    .map(|id| sanitize_session_id(id))
    .collect();
  let Ok(identities) = list_identities(clawdbot_home) else {
    return;
  };
  for identity in identities {
    if live_stems.contains(&identity.session_file_stem) {
      continue;
    }
    if let Ok(path) = identity_path(clawdbot_home, &identity.session_file_stem) {
      if std::fs::remove_file(&path).is_ok() {
        eprintln!(
          "[session_watcher] pruned identity for retired session {}",
          identity.session_file_stem
        );
      }
    }
  }
}

/// Exact-key read. Kept for callers that genuinely hold a real gateway
/// session id; tool calls should use [`resolve_authorized_session`] instead.
pub(crate) fn lookup_authorized_session(session_id: &str) -> Result<(String, String), String> {
  let clawdbot_home = clawdbot_home_headless()?;
  read_identity_at(&clawdbot_home, session_id)
}

/// Public read side used by `snowflake_mcp.rs`, which has no `AppHandle` —
/// resolves clawdbot home headlessly via `OPENCLAW_STATE_DIR`/`OPENCLAW_HOME`
/// (or the platform default; see `default_clawdbot_home_from_env`).
///
/// `supplied` is the model-provided `session_id` and is treated ONLY as an
/// optional hint, never as proof of identity. It cannot be trusted or even
/// relied upon to be correct: confirmed 2026-08-11 against a live transcript,
/// the real gateway session id is never present anywhere in the model's
/// context, so the model has no way to know it. Asked for it anyway, it
/// reasonably guessed the one id-shaped string it *could* see — its sandbox
/// workspace directory name (`agent-main-slack-default-direct--b1096950`) —
/// and every call failed with "No verified identity on record". The gateway
/// also passes no session identifier to stdio MCP subprocesses (verified in
/// the vendored `pi-bundle-mcp-runtime`: `env`/`args`/`cwd` come purely from
/// static config), so the subprocess cannot self-identify either.
///
/// The security property that actually holds is therefore "a Slack sender
/// whose identity Rust independently verified via the Slack Web API must
/// exist on record" — never "the model told us who it is". Ambiguity is
/// refused rather than guessed.
pub(crate) fn resolve_authorized_session(
  supplied: Option<&str>,
) -> Result<(String, String), String> {
  let clawdbot_home = clawdbot_home_headless()?;

  // Tightest binding: the hint happens to be a real session id on record.
  if let Some(key) = supplied.map(str::trim).filter(|key| !key.is_empty()) {
    if let Ok(found) = read_identity_at(&clawdbot_home, key) {
      return Ok(found);
    }
  }

  let identities = list_identities(&clawdbot_home)?;
  if identities.is_empty() {
    return Err(
      "No verified Slack session on record. Message the bot from Slack first so Knapsack can \
       verify the sender via the Slack API, then retry."
        .to_string(),
    );
  }

  // Ambiguity is about *who*, not about how many records happen to be lying
  // around. One person legitimately has several sessions at once (a `/new`,
  // a DM plus a channel, a retired record the pruner has not caught yet), and
  // refusing there protects nothing while breaking every query — which is
  // exactly what happened on 2026-08-12, with two records that named the same
  // verified user. Only a genuine disagreement about the identity is unsafe.
  let distinct_emails: HashSet<&str> = identities
    .iter()
    .map(|identity| identity.email.as_str())
    .collect();
  if distinct_emails.len() > 1 {
    let mut emails: Vec<&str> = distinct_emails.into_iter().collect();
    emails.sort_unstable();
    return Err(format!(
      "Cannot determine which verified user this request belongs to — {} different users have \
       active sessions ({}) and the supplied session_id matched none of them. Refusing rather \
       than guessing.",
      emails.len(),
      emails.join(", ")
    ));
  }

  // Single identity: use its most recently verified session, so the JWT's
  // session_id claim describes the freshest record rather than a stale one.
  let newest = identities
    .last()
    .expect("non-empty checked above");
  Ok((newest.email.clone(), newest.scope_key.clone()))
}

fn extract_str<'a>(row: &'a Value, keys: &[&str]) -> Option<&'a str> {
  keys.iter().find_map(|key| row.get(key)).and_then(|v| v.as_str())
}

fn extract_bool(row: &Value, keys: &[&str]) -> Option<bool> {
  keys.iter().find_map(|key| row.get(key)).and_then(|v| v.as_bool())
}

/// `origin.from` is provider-prefixed (e.g. `"slack:U0BPJ321V9P"`), not a
/// bare native user id — strip everything up to and including the last `:`.
/// Passing the prefixed form straight to Slack's `users.info` fails lookup.
fn strip_provider_prefix(value: &str) -> &str {
  value.rsplit(':').next().unwrap_or(value)
}

/// Returns `(account_id, native_slack_user_id)` for a direct-message Slack
/// session row, or `None` if this row isn't one.
///
/// Confirmed against a live `sessions.list` row (2026-08-11, gateway
/// `server-methods`/`session-utils` source): there is no top-level "channel"
/// for direct-message sessions (`parseGroupKey` only derives one for
/// group/channel kinds) and no "origin.nativeDirectUserId" field at all —
/// the original field names here were an unverified guess from static reads
/// of minified JS (see the ASSUMPTION FLAGGED note at the top of this file)
/// and silently never matched, so no Slack identity was ever written. The
/// real shape is `lastChannel: "slack"` and `origin.from: "slack:U0BPJ321V9P"`
/// (provider-prefixed).
fn extract_slack_sender(row: &Value) -> Option<(String, String)> {
  let channel = extract_str(row, &["channel", "lastChannel"]).unwrap_or("");
  if !channel.eq_ignore_ascii_case("slack") {
    return None;
  }
  let origin = row.get("origin")?;
  let account_id = extract_str(origin, &["accountId"]).unwrap_or("");
  let slack_user_id = extract_str(origin, &["nativeDirectUserId", "from"]).map(strip_provider_prefix)?;
  if slack_user_id.is_empty() {
    return None;
  }
  Some((account_id.to_string(), slack_user_id.to_string()))
}

async fn resolve_slack_email(
  clawdbot_home: &Path,
  account_id: &str,
  slack_user_id: &str,
) -> Result<String, String> {
  // Deliberately reads openclaw.json directly rather than going through the
  // `config.get` WS RPC: the gateway redacts secret fields (confirmed live —
  // `config.get`'s "channels.slack.botToken" comes back as the literal
  // string `"__OPENCLAW_REDACTED__"`, not the real token) so every request
  // built from an RPC-fetched token would 401 against Slack with
  // "invalid_auth". This process (the main app) has direct filesystem access
  // to the same file the gateway itself reads, so there's no need to go
  // through the gateway for this at all.
  let config_path = clawdbot_home.join("openclaw.json");
  let raw = std::fs::read_to_string(&config_path)
    .map_err(|error| format!("Unable to read {}: {error}", config_path.display()))?;
  let cfg: Value = serde_json::from_str(&raw)
    .map_err(|error| format!("Unable to parse {}: {error}", config_path.display()))?;
  // ASSUMPTION FLAGGED: single-workspace Slack config at /channels/slack/botToken.
  // If multiple Slack accounts are configured, this needs to key off account_id.
  let bot_token = cfg
    .pointer("/channels/slack/botToken")
    .and_then(|v| v.as_str())
    .ok_or("No Slack bot token configured; cannot resolve sender email")?;
  let _ = account_id; // reserved for multi-workspace lookup, see assumption above

  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(10))
    .build()
    .map_err(|error| format!("Unable to build Slack HTTP client: {error}"))?;
  let response = client
    .get("https://slack.com/api/users.info")
    .bearer_auth(bot_token)
    .query(&[("user", slack_user_id)])
    .send()
    .await
    .map_err(|error| format!("Unable to reach Slack users.info: {error}"))?;
  let body: Value = response
    .json()
    .await
    .map_err(|error| format!("Invalid Slack users.info response: {error}"))?;
  if body.get("ok").and_then(|v| v.as_bool()) != Some(true) {
    return Err(format!(
      "Slack users.info failed: {}",
      body.get("error").and_then(|v| v.as_str()).unwrap_or("unknown")
    ));
  }
  body
    .pointer("/user/profile/email")
    .and_then(|v| v.as_str())
    .map(|s| s.to_string())
    .ok_or_else(|| "Slack profile has no email on file".to_string())
}

async fn run_sandbox_recreate(openclaw_bin: &std::path::Path, node_bin: Option<&std::path::Path>, scope_key: &str) {
  // `openclaw sandbox recreate --session <scopeKey>` — documented CLI escape
  // hatch (docs/gateway/sandboxing.md), wraps removeSandboxContainer(). Shell
  // out to the bundled openclaw.mjs rather than reimplementing container
  // discovery/removal in Rust.
  let mut command = match node_bin {
    Some(node_bin) if node_bin.exists() => tokio::process::Command::new(node_bin),
    _ => tokio::process::Command::new("node"), // fall back to a system node in dev builds
  };
  let result = command
    .arg(openclaw_bin)
    .arg("sandbox")
    .arg("recreate")
    .arg("--session")
    .arg(scope_key)
    .output()
    .await;
  match result {
    Ok(output) if !output.status.success() => {
      eprintln!(
        "[session_watcher] sandbox recreate --session {} failed: {}",
        scope_key,
        String::from_utf8_lossy(&output.stderr)
      );
    }
    Err(error) => {
      eprintln!(
        "[session_watcher] unable to run sandbox recreate --session {}: {}",
        scope_key, error
      );
    }
    _ => {}
  }
}

/// `openclaw sandbox create --session <scopeKey>` — KNAPSACK PATCH (see
/// `sandbox-cli-UJaskEDu.js`): the bundled OpenClaw CLI never exposed a way
/// to force sandbox creation on demand, only `recreate` (which only
/// *removes*). Containers were otherwise only ever created lazily as a side
/// effect of the agent turn actually invoking a sandboxed exec/fs tool. This
/// gives callers that need a container to exist ahead of that (before any
/// exec/fs tool call has happened this turn) a way to ask for it directly,
/// reusing the exact same `resolveSandboxContext` path the agent runner uses
/// internally — no new backend logic on the OpenClaw side, just a CLI entry
/// point onto the existing one.
async fn run_sandbox_create(openclaw_bin: &std::path::Path, node_bin: Option<&std::path::Path>, scope_key: &str) -> Result<(), String> {
  let mut command = match node_bin {
    Some(node_bin) if node_bin.exists() => tokio::process::Command::new(node_bin),
    _ => tokio::process::Command::new("node"), // fall back to a system node in dev builds
  };
  let output = command
    .arg(openclaw_bin)
    .arg("sandbox")
    .arg("create")
    .arg("--session")
    .arg(scope_key)
    .output()
    .await
    .map_err(|error| format!("unable to run sandbox create --session {scope_key}: {error}"))?;
  if !output.status.success() {
    return Err(format!(
      "sandbox create --session {} failed: {}",
      scope_key,
      String::from_utf8_lossy(&output.stderr)
    ));
  }
  Ok(())
}

/// Headless variant for the `--internal-mcp-snowflake` subprocess (mirrors
/// `recreate_sandbox_session_headless` — see its comment for the resource-dir
/// derivation rationale). Best-effort: on dev builds outside a signed `.app`
/// bundle this may not resolve, in which case the caller should fall back to
/// the HTTPS path rather than block on it.
///
/// Currently unused: not yet wired into `snowflake_mcp.rs` (that tool still
/// runs entirely over HTTPS, deliberately — see its module doc). Kept ready
/// for a caller that genuinely needs a container to exist for some other
/// reason, without reintroducing the OAuth-token-in-container-env exposure
/// `docker exec` had.
#[allow(dead_code)]
pub(crate) async fn ensure_sandbox_session_headless(scope_key: &str) -> Result<(), String> {
  let exe = std::env::current_exe().map_err(|error| format!("unable to resolve current_exe: {error}"))?;
  // macOS .app bundle layout: Contents/MacOS/<exe> -> Contents/Resources/<rel>
  let resources_dir = exe
    .parent()
    .and_then(|p| p.parent())
    .map(|p| p.join("Resources"))
    .ok_or_else(|| format!("unable to resolve bundle Resources dir from {}", exe.display()))?;
  let openclaw_bin = resources_dir.join("resources").join("clawdbot").join("openclaw.mjs");
  let node_bin = resources_dir.join("resources").join("node").join("node");
  run_sandbox_create(&openclaw_bin, Some(node_bin.as_path()), scope_key).await
}

/// Destroy+recreate the sandbox container for a given session's `scopeKey`,
/// called from within the main app process (the `session_watcher` poll
/// loop), which has a real Tauri `AppHandle` and can use its resource
/// resolver — the same one the gateway's own LaunchAgent plist generation
/// uses (see `expected_clawdbot_entry_for_plist` / the node quarantine
/// check in `service.rs`). The bundled resource dir is a different path
/// from the writable runtime `clawdbot_home` state dir.
pub(crate) async fn recreate_sandbox_session(app_handle: &tauri::AppHandle, scope_key: &str) {
  let openclaw_bin = resource_path(app_handle, "resources/clawdbot/openclaw.mjs");
  let node_bin = app_handle
    .path_resolver()
    .resource_dir()
    .map(|dir| dir.join("resources").join("node").join("node"));
  run_sandbox_recreate(&openclaw_bin, node_bin.as_deref(), scope_key).await;
}

/// Headless variant for the `--internal-mcp-snowflake` subprocess, which has
/// no Tauri `AppHandle` at all (main.rs intercepts before Tauri starts).
/// Derives the `.app` bundle's `Contents/Resources` dir from the running
/// executable's own path (mirrors the layout Tauri's resource resolver uses
/// on macOS) rather than requiring an AppHandle. Best-effort: on dev builds
/// that aren't inside a signed `.app` bundle, this may not resolve — that's
/// acceptable since the caller only logs a failure here, it never blocks
/// returning the query result to the model.
/// Currently unused: `snowflake_mcp` was its only caller and no longer tears
/// down the sandbox (that teardown removed the session's container, which is
/// part of why the container query path could never work). Kept as the
/// headless counterpart to `recreate_sandbox_session` for future callers.
#[allow(dead_code)]
pub(crate) async fn recreate_sandbox_session_headless(scope_key: &str) {
  let Ok(exe) = std::env::current_exe() else {
    eprintln!("[session_watcher] unable to resolve current_exe for headless sandbox recreate");
    return;
  };
  // macOS .app bundle layout: Contents/MacOS/<exe> -> Contents/Resources/<rel>
  let Some(resources_dir) = exe.parent().and_then(|p| p.parent()).map(|p| p.join("Resources")) else {
    eprintln!("[session_watcher] unable to resolve bundle Resources dir from {}", exe.display());
    return;
  };
  let openclaw_bin = resources_dir.join("resources").join("clawdbot").join("openclaw.mjs");
  let node_bin = resources_dir.join("resources").join("node").join("node");
  run_sandbox_recreate(&openclaw_bin, Some(node_bin.as_path()), scope_key).await;
}

async fn poll_once(app_handle: &tauri::AppHandle, seen: &mut HashMap<String, TrackedSession>) {
  // Piggy-backs on this loop rather than adding another timer: an npm install
  // can delete the gateway runtime's `node_modules/openclaw` self-link at any
  // time, which silently kills every inbound Slack message until it is put
  // back. Restoring it fixes the next message without a gateway restart.
  // Near-free when the link is present. See the function's docs for why this
  // cannot be a one-shot startup task.
  crate::clawd::service::ensure_clawdbot_runtime_self_link_for_app(app_handle);

  let clawdbot_home = app_clawdbot_home(app_handle);
  let Ok(token) = gateway_client::resolve_token(None) else {
    return;
  };
  let response = gateway_client::gateway_request_pooled_optional(
    "sessions.list",
    Some(serde_json::json!({})),
    &token,
  )
  .await;
  let Ok(response) = response else {
    return;
  };
  let rows = response
    .get("sessions")
    .or_else(|| response.get("rows"))
    .or_else(|| response.get("items"))
    .and_then(|v| v.as_array())
    .cloned()
    .unwrap_or_default();

  let mut current_ids: HashSet<String> = HashSet::new();

  for row in &rows {
    let Some(session_id) = extract_str(row, &["sessionId", "id"]) else {
      continue;
    };
    let session_id = session_id.to_string();
    current_ids.insert(session_id.clone());

    let scope_key = extract_str(row, &["key", "sessionKey", "scopeKey"]).map(|s| s.to_string());
    let has_active_run = extract_bool(row, &["hasActiveRun"]).unwrap_or(false);
    let ended_at = row.get("endedAt").map(|v| !v.is_null()).unwrap_or(false);

    let previously_tracked = seen.get(&session_id).cloned();

    // Re-assert the identity whenever the record is missing, not just the
    // first time a session is seen. The end-of-turn teardown below deletes
    // the record, and `seen` still holds the session afterwards — so a
    // first-sight-only write meant the identity was gone for every turn
    // after the first one and never came back, permanently breaking
    // Snowflake access for that session.
    let identity_missing = identity_path(&clawdbot_home, &session_id)
      .map(|path| !path.exists())
      .unwrap_or(true);
    if identity_missing {
      if let Some((account_id, slack_user_id)) = extract_slack_sender(row) {
        match resolve_slack_email(&clawdbot_home, &account_id, &slack_user_id).await {
          Ok(email) => {
            if let Some(scope_key) = &scope_key {
              if let Err(error) = write_identity(&clawdbot_home, &session_id, &email, scope_key) {
                eprintln!("[session_watcher] failed to write identity for {session_id}: {error}");
              }
            }
          }
          Err(error) => {
            eprintln!("[session_watcher] failed to resolve Slack email for session {session_id}: {error}");
          }
        }
      }
    }

    let was_active = previously_tracked.as_ref().map(|t| t.has_active_run).unwrap_or(false);
    if was_active && (!has_active_run || ended_at) {
      if let Some(scope_key) = scope_key.clone().or_else(|| previously_tracked.as_ref().and_then(|t| t.scope_key.clone())) {
        recreate_sandbox_session(app_handle, &scope_key).await;
        remove_identity(&clawdbot_home, &session_id);
      }
    }

    seen.insert(
      session_id,
      TrackedSession {
        has_active_run,
        scope_key,
      },
    );
  }

  seen.retain(|id, _| current_ids.contains(id));

  // Drop identity records for sessions that no longer exist. Only meaningful
  // once we have actually seen a session list — an empty/failed response must
  // not be read as "no sessions exist" and wipe every live record.
  if !current_ids.is_empty() {
    prune_stale_identities(&clawdbot_home, &current_ids);
  }
}

/// Spawn the background polling loop. Call once at app startup, alongside
/// the other gateway lifecycle tasks. Never panics — every failure mode
/// (gateway down, unsupported RPC, malformed response) is logged and
/// retried on the next tick.
pub fn spawn(app_handle: tauri::AppHandle) {
  tokio::spawn(async move {
    let mut seen: HashMap<String, TrackedSession> = HashMap::new();
    loop {
      poll_once(&app_handle, &mut seen).await;
      tokio::time::sleep(POLL_INTERVAL).await;
    }
  });
}

#[cfg(test)]
mod tests {
  use super::*;

  /// Regression test for the 2026-08-11 incident: `write_identity` (called
  /// from the main app, via an app-handle-resolved base dir) and
  /// `lookup_authorized_session` (called from the headless MCP subprocess,
  /// via `OPENCLAW_STATE_DIR`) must land on the same directory — previously
  /// `write_identity` resolved its own base dir via the headless-only path,
  /// which is unset in the main app's environment, so writes silently never
  /// landed anywhere `lookup_authorized_session` could find them.
  #[test]
  fn identity_round_trips_through_disk() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    write_identity(
      tempdir.path(),
      "sess_test_1",
      "rogelio@bankaya.com.mx",
      "agent:main:slack:T1:direct:U1",
    )
    .unwrap();
    let (email, scope_key) = lookup_authorized_session("sess_test_1").unwrap();
    assert_eq!(email, "rogelio@bankaya.com.mx");
    assert_eq!(scope_key, "agent:main:slack:T1:direct:U1");
    remove_identity(tempdir.path(), "sess_test_1");
    assert!(lookup_authorized_session("sess_test_1").is_err());
  }

  #[test]
  fn unknown_session_id_is_rejected_not_defaulted() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    assert!(lookup_authorized_session("never-seen-session").is_err());
  }

  fn seed_identity(home: &Path, session_id: &str, email: &str) {
    write_identity(home, session_id, email, "agent:main:slack:default:direct:u1").unwrap();
  }

  #[test]
  fn resolve_prefers_an_exact_session_id_match() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    seed_identity(tempdir.path(), "real-session", "exact@bankaya.com.mx");
    seed_identity(tempdir.path(), "other-session", "other@bankaya.com.mx");

    let (email, _) = resolve_authorized_session(Some("real-session")).unwrap();
    assert_eq!(email, "exact@bankaya.com.mx");
  }

  /// The production failure mode: the hint is wrong (the model guessed its
  /// sandbox dir name) but a single verified identity is on record.
  #[test]
  fn resolve_falls_back_to_the_single_verified_identity_when_the_hint_is_wrong() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    seed_identity(tempdir.path(), "real-session", "rogelio@bankaya.com.mx");

    let (email, scope_key) =
      resolve_authorized_session(Some("agent-main-slack-default-direct--b1096950")).unwrap();
    assert_eq!(email, "rogelio@bankaya.com.mx");
    assert_eq!(scope_key, "agent:main:slack:default:direct:u1");

    // Also works with no hint at all.
    assert_eq!(resolve_authorized_session(None).unwrap().0, "rogelio@bankaya.com.mx");
  }

  #[test]
  fn resolve_refuses_when_no_identity_is_on_record() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    let error = resolve_authorized_session(Some("anything")).unwrap_err();
    assert!(error.contains("No verified Slack session"), "got: {error}");
  }

  /// Never silently pick one of several *different* users — that would be a
  /// cross-user data leak the moment per-user Snowflake identity is real.
  #[test]
  fn resolve_refuses_ambiguity_between_different_users() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    seed_identity(tempdir.path(), "session-a", "a@bankaya.com.mx");
    seed_identity(tempdir.path(), "session-b", "b@bankaya.com.mx");

    let error = resolve_authorized_session(Some("not-a-real-id")).unwrap_err();
    assert!(error.contains("Refusing rather than guessing"), "got: {error}");
    assert!(error.contains("a@bankaya.com.mx"), "should name the users: {error}");
  }

  /// Regression test for 2026-08-12: one person with several sessions (a
  /// `/new`, or a not-yet-pruned retired record) is NOT ambiguous. Counting
  /// records instead of distinct users refused every query for no benefit.
  #[test]
  fn several_sessions_for_one_user_resolve_instead_of_refusing() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    write_identity(
      tempdir.path(),
      "retired-session",
      "daniel.ciolfi@ckl.io",
      "agent:main:slack:default:direct:u0bpj321v9p",
    )
    .unwrap();
    // Ensure a strictly newer mtime so "most recent" is deterministic.
    std::thread::sleep(std::time::Duration::from_millis(20));
    write_identity(
      tempdir.path(),
      "current-session",
      "daniel.ciolfi@ckl.io",
      "agent:main:slack:default:direct:current",
    )
    .unwrap();

    let (email, scope_key) = resolve_authorized_session(Some("wrong-hint")).unwrap();
    assert_eq!(email, "daniel.ciolfi@ckl.io");
    assert_eq!(
      scope_key, "agent:main:slack:default:direct:current",
      "should prefer the most recently verified session"
    );
  }

  #[test]
  fn stale_identities_are_pruned_and_live_ones_kept() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    seed_identity(tempdir.path(), "live-session", "daniel.ciolfi@ckl.io");
    seed_identity(tempdir.path(), "retired-session", "daniel.ciolfi@ckl.io");

    let live: HashSet<String> = ["live-session".to_string()].into_iter().collect();
    prune_stale_identities(tempdir.path(), &live);

    assert!(read_identity_at(tempdir.path(), "live-session").is_ok());
    assert!(read_identity_at(tempdir.path(), "retired-session").is_err());
  }

  #[test]
  fn strip_provider_prefix_removes_provider_and_passes_through_bare_ids() {
    assert_eq!(strip_provider_prefix("slack:U0BPJ321V9P"), "U0BPJ321V9P");
    assert_eq!(strip_provider_prefix("U0BPJ321V9P"), "U0BPJ321V9P");
  }

  /// This is a redacted copy of an actual live `sessions.list` row for a
  /// Slack direct-message session (captured 2026-08-11) — the shape that
  /// broke identity resolution: no top-level "channel", no
  /// "origin.nativeDirectUserId", and a provider-prefixed "origin.from".
  fn real_slack_direct_session_row() -> Value {
    serde_json::json!({
      "key": "agent:main:slack:default:direct:u0bpj321v9p",
      "sessionId": "f2abdfc8-a169-4d1f-9f9c-a1ece0b35e4f",
      "chatType": "direct",
      "lastChannel": "slack",
      "lastTo": "user:U0BPJ321V9P",
      "lastAccountId": "default",
      "origin": {
        "label": "Daniel Ciolfi",
        "provider": "slack",
        "surface": "slack",
        "chatType": "direct",
        "from": "slack:U0BPJ321V9P",
        "to": "user:U0BPJ321V9P",
        "nativeChannelId": "D0BPE5SEE22",
        "accountId": "default"
      }
    })
  }

  #[test]
  fn extract_slack_sender_matches_real_gateway_row_shape() {
    let row = real_slack_direct_session_row();
    let (account_id, slack_user_id) = extract_slack_sender(&row).expect(
      "a real Slack direct-message sessions.list row must be recognized as a Slack sender",
    );
    assert_eq!(account_id, "default");
    assert_eq!(slack_user_id, "U0BPJ321V9P");
  }

  #[test]
  fn extract_slack_sender_ignores_non_slack_rows() {
    let row = serde_json::json!({
      "key": "agent:main:main",
      "sessionId": "c1500ca3-a5af-4428-a04b-be85e697466c",
      "lastChannel": "webchat"
    });
    assert!(extract_slack_sender(&row).is_none());
  }

  #[test]
  fn extract_slack_sender_requires_a_nonempty_user_id() {
    let mut row = real_slack_direct_session_row();
    row["origin"]["from"] = serde_json::json!("slack:");
    assert!(extract_slack_sender(&row).is_none());
  }
}
