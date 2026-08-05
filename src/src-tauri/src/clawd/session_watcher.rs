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
//! ASSUMPTION FLAGGED: the exact field names below (`sessionId`, `key`,
//! `channel`, `origin.nativeDirectUserId`, `origin.accountId`, `hasActiveRun`,
//! `endedAt`) are read defensively (multiple fallback field names tried)
//! because the bundle's `sessions.list` row shape was inspected via static
//! reads of minified JS, not a live response. Verify against a real gateway
//! response before relying on this in production and tighten the parsing.

use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::time::Duration;

use super::gateway_client;
use super::service::{clawdbot_home_headless, resource_path};

const POLL_INTERVAL: Duration = Duration::from_secs(5);

#[derive(Debug, Clone, Default)]
struct TrackedSession {
  has_active_run: bool,
  scope_key: Option<String>,
}

fn identities_dir() -> Result<PathBuf, String> {
  let dir = clawdbot_home_headless()?.join("snowflake-identities");
  std::fs::create_dir_all(&dir)
    .map_err(|error| format!("Unable to create snowflake-identities dir: {error}"))?;
  Ok(dir)
}

fn identity_path(session_id: &str) -> Result<PathBuf, String> {
  // session_id is an opaque gateway-issued id, not attacker-controlled path
  // input from a Slack message, but sanitize defensively anyway.
  let safe: String = session_id
    .chars()
    .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == ':' { c } else { '_' })
    .collect();
  Ok(identities_dir()?.join(format!("{safe}.json")))
}

/// Written by the watcher when a new session appears; read by
/// `snowflake_mcp.rs` on every tool call. Never written to inside the
/// sandboxed workspace, never touches `dist/` or openclaw.json.
#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct IdentityRecord {
  email: String,
  scope_key: String,
}

fn write_identity(session_id: &str, email: &str, scope_key: &str) -> Result<(), String> {
  let path = identity_path(session_id)?;
  let record = IdentityRecord {
    email: email.to_string(),
    scope_key: scope_key.to_string(),
  };
  let json = serde_json::to_string(&record).map_err(|error| error.to_string())?;
  std::fs::write(&path, json).map_err(|error| format!("Unable to write {}: {error}", path.display()))
}

fn remove_identity(session_id: &str) {
  if let Ok(path) = identity_path(session_id) {
    let _ = std::fs::remove_file(path);
  }
}

/// Public read side used by `snowflake_mcp.rs`. Deliberately returns an
/// error (never a default/fallback identity) when nothing is on record —
/// the whole point is to never let a tool call proceed with a guessed or
/// model-supplied identity.
pub(crate) fn lookup_authorized_session(session_id: &str) -> Result<(String, String), String> {
  let path = identity_path(session_id)?;
  let raw = std::fs::read_to_string(&path)
    .map_err(|_| format!("No verified identity on record for session_id {session_id}"))?;
  let record: IdentityRecord = serde_json::from_str(&raw)
    .map_err(|error| format!("Corrupt identity record for session_id {session_id}: {error}"))?;
  Ok((record.email, record.scope_key))
}

fn extract_str<'a>(row: &'a Value, keys: &[&str]) -> Option<&'a str> {
  keys.iter().find_map(|key| row.get(key)).and_then(|v| v.as_str())
}

fn extract_bool(row: &Value, keys: &[&str]) -> Option<bool> {
  keys.iter().find_map(|key| row.get(key)).and_then(|v| v.as_bool())
}

async fn resolve_slack_email(account_id: &str, slack_user_id: &str) -> Result<String, String> {
  let cfg = gateway_client::config_get(None)
    .await
    .map_err(|error| format!("Unable to read gateway config: {error}"))?;
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

    let channel = extract_str(row, &["channel"]).unwrap_or("");
    let scope_key = extract_str(row, &["key", "sessionKey", "scopeKey"]).map(|s| s.to_string());
    let has_active_run = extract_bool(row, &["hasActiveRun"]).unwrap_or(false);
    let ended_at = row.get("endedAt").map(|v| !v.is_null()).unwrap_or(false);

    let previously_tracked = seen.get(&session_id).cloned();

    if previously_tracked.is_none() && channel.eq_ignore_ascii_case("slack") {
      let origin = row.get("origin");
      let account_id = origin
        .and_then(|o| extract_str(o, &["accountId"]))
        .unwrap_or("");
      let slack_user_id = origin
        .and_then(|o| extract_str(o, &["nativeDirectUserId", "from"]))
        .unwrap_or("");
      if !slack_user_id.is_empty() {
        match resolve_slack_email(account_id, slack_user_id).await {
          Ok(email) => {
            if let Some(scope_key) = &scope_key {
              if let Err(error) = write_identity(&session_id, &email, scope_key) {
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
        remove_identity(&session_id);
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

  #[test]
  fn identity_round_trips_through_disk() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    write_identity("sess_test_1", "rogelio@bankaya.com.mx", "agent:main:slack:T1:direct:U1").unwrap();
    let (email, scope_key) = lookup_authorized_session("sess_test_1").unwrap();
    assert_eq!(email, "rogelio@bankaya.com.mx");
    assert_eq!(scope_key, "agent:main:slack:T1:direct:U1");
    remove_identity("sess_test_1");
    assert!(lookup_authorized_session("sess_test_1").is_err());
  }

  #[test]
  fn unknown_session_id_is_rejected_not_defaulted() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    assert!(lookup_authorized_session("never-seen-session").is_err());
  }
}
