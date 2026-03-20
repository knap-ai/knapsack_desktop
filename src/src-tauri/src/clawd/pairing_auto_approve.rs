//! Auto-approve the first pairing request for a channel, then lock down to allowlist.
//!
//! When a channel starts with `dmPolicy: "pairing"`, the first unknown user who
//! messages the bot receives a pairing code.  In the Knapsack Desktop context the
//! first user is almost always the device owner.  This module polls the pairing
//! store file and, as soon as a request appears:
//!
//! 1. Reads the sender ID from the pairing request.
//! 2. Writes that ID into the channel's allowFrom store (so the gateway accepts
//!    future messages from this sender immediately).
//! 3. Patches the gateway config to switch `dmPolicy` from `"pairing"` to
//!    `"allowlist"` so no further pairing codes are ever exposed.
//!
//! The polling task is spawned as a background `tokio::spawn` and automatically
//! stops after the first approval or after a timeout.

use serde_json::Value;
use std::path::PathBuf;
use std::time::Duration;

use crate::clawd::gateway_client;

// ── Path resolution ─────────────────────────────────────────────────────

/// Resolve the OpenClaw credentials directory.
///
/// Mirrors the JS resolution order:
///   OPENCLAW_OAUTH_DIR  →  {state_dir}/credentials
///
/// where state_dir is:
///   OPENCLAW_STATE_DIR / CLAWDBOT_STATE_DIR  →  ~/.openclaw
fn resolve_credentials_dir() -> Option<PathBuf> {
  // Explicit override
  if let Ok(d) = std::env::var("OPENCLAW_OAUTH_DIR") {
    let d = d.trim().to_string();
    if !d.is_empty() {
      return Some(PathBuf::from(d));
    }
  }

  // State dir from env
  for var in ["OPENCLAW_STATE_DIR", "CLAWDBOT_STATE_DIR", "OPENCLAW_HOME"] {
    if let Ok(d) = std::env::var(var) {
      let d = d.trim().to_string();
      if !d.is_empty() {
        return Some(PathBuf::from(d).join("credentials"));
      }
    }
  }

  // Tauri app data dir: on macOS ~/Library/Application Support/ai.knap.knapsack/clawdbot
  // On Linux: ~/.local/share/ai.knap.knapsack/clawdbot
  if let Some(data_dir) = dirs::data_dir() {
    let app_state = data_dir.join("ai.knap.knapsack").join("clawdbot");
    if app_state.exists() {
      return Some(app_state.join("credentials"));
    }
  }

  // Last resort: ~/.openclaw/credentials
  dirs::home_dir().map(|h| h.join(".openclaw").join("credentials"))
}

fn pairing_store_path(channel: &str) -> Option<PathBuf> {
  resolve_credentials_dir().map(|d| d.join(format!("{}-pairing.json", channel)))
}

fn allow_from_store_path(channel: &str, account_id: &str) -> Option<PathBuf> {
  resolve_credentials_dir().map(|d| {
    if account_id.is_empty() || account_id == "default" {
      d.join(format!("{}-allowFrom.json", channel))
    } else {
      d.join(format!("{}-{}-allowFrom.json", channel, account_id))
    }
  })
}

// ── File I/O ────────────────────────────────────────────────────────────

/// Read pending pairing requests from the store file.
/// Returns Vec of (id, code, account_id) tuples.
fn read_pairing_requests(path: &std::path::Path) -> Vec<(String, String, String)> {
  let content = match std::fs::read_to_string(path) {
    Ok(c) => c,
    Err(_) => return vec![],
  };
  let parsed: Value = match serde_json::from_str(&content) {
    Ok(v) => v,
    Err(_) => return vec![],
  };
  let requests = match parsed.get("requests").and_then(|r| r.as_array()) {
    Some(arr) => arr,
    None => return vec![],
  };

  requests
    .iter()
    .filter_map(|req| {
      let id = req.get("id").and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        _ => None,
      })?;
      let code = req.get("code").and_then(|v| v.as_str())?.to_string();
      let account_id = req
        .get("meta")
        .and_then(|m| m.get("accountId"))
        .and_then(|v| v.as_str())
        .unwrap_or("default")
        .to_string();
      Some((id, code, account_id))
    })
    .collect()
}

/// Write the sender ID into the allowFrom store file.
fn write_allow_from(path: &std::path::Path, sender_id: &str) -> Result<(), String> {
  // Read existing entries if any
  let mut entries: Vec<String> = vec![];
  if let Ok(content) = std::fs::read_to_string(path) {
    if let Ok(parsed) = serde_json::from_str::<Value>(&content) {
      if let Some(arr) = parsed.get("allowFrom").and_then(|v| v.as_array()) {
        for v in arr {
          if let Some(s) = v.as_str() {
            entries.push(s.to_string());
          }
        }
      }
    }
  }

  // Add sender if not already present
  let normalized = sender_id.trim().to_string();
  if !entries.contains(&normalized) {
    entries.push(normalized);
  }

  let store = serde_json::json!({
      "version": 1,
      "allowFrom": entries,
  });

  // Ensure parent directory exists
  if let Some(parent) = path.parent() {
    let _ = std::fs::create_dir_all(parent);
  }

  std::fs::write(path, serde_json::to_string_pretty(&store).unwrap())
    .map_err(|e| format!("Failed to write allowFrom store: {}", e))
}

/// Remove an approved request from the pairing store.
fn remove_pairing_request(path: &std::path::Path, code: &str) -> Result<(), String> {
  let content =
    std::fs::read_to_string(path).map_err(|e| format!("Failed to read pairing store: {}", e))?;
  let mut parsed: Value =
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse pairing store: {}", e))?;

  if let Some(requests) = parsed.get_mut("requests").and_then(|r| r.as_array_mut()) {
    requests.retain(|req| {
      req
        .get("code")
        .and_then(|v| v.as_str())
        .map(|c| c.to_uppercase() != code.to_uppercase())
        .unwrap_or(true)
    });
  }

  std::fs::write(path, serde_json::to_string_pretty(&parsed).unwrap())
    .map_err(|e| format!("Failed to write pairing store: {}", e))
}

// ── Config patch ────────────────────────────────────────────────────────

/// Switch the channel's dmPolicy to "allowlist" via the gateway RPC.
async fn switch_to_allowlist(channel: &str) -> Result<(), String> {
  let snapshot = gateway_client::config_get(None).await?;
  let base_hash = snapshot
    .get("hash")
    .and_then(|v| v.as_str())
    .or_else(|| snapshot.get("baseHash").and_then(|v| v.as_str()))
    .unwrap_or("")
    .to_string();

  // Build a minimal patch that only changes dmPolicy.
  // Some channels (discord, slack, googlechat) use nested dm.policy —
  // but those aren't using this auto-approve flow.  Telegram, Signal,
  // and other top-level-dmPolicy channels are the target here.
  let patch = serde_json::json!({
      "channels": {
          channel: {
              "dmPolicy": "allowlist"
          }
      }
  });

  gateway_client::config_patch(&serde_json::to_string(&patch).unwrap(), &base_hash, None).await?;

  Ok(())
}

// ── Public API ──────────────────────────────────────────────────────────

/// Spawn a background task that auto-approves the first pairing request
/// for the given channel, then switches the channel to allowlist mode.
///
/// The task polls every 3 seconds for up to 10 minutes, then gives up.
/// If no pairing request ever appears (user never messages the bot),
/// the channel stays in pairing mode — which is fine, just not optimal.
pub fn spawn_auto_approve(channel: &str) {
  let channel = channel.to_string();

  tokio::spawn(async move {
    let pairing_path = match pairing_store_path(&channel) {
      Some(p) => p,
      None => {
        log::warn!(
          "[pairing_auto_approve] Could not resolve credentials dir for channel '{}'",
          channel
        );
        return;
      }
    };

    log::info!(
      "[pairing_auto_approve] Watching for first pairing request: {} (channel: {})",
      pairing_path.display(),
      channel
    );

    let max_wait = Duration::from_secs(600); // 10 minutes
    let poll_interval = Duration::from_secs(3);
    let start = std::time::Instant::now();

    loop {
      if start.elapsed() > max_wait {
        log::info!(
          "[pairing_auto_approve] Timed out waiting for pairing request (channel: {})",
          channel
        );
        return;
      }

      tokio::time::sleep(poll_interval).await;

      let requests = read_pairing_requests(&pairing_path);
      if requests.is_empty() {
        continue;
      }

      // Take the first request
      let (sender_id, code, account_id) = &requests[0];
      log::info!(
                "[pairing_auto_approve] Auto-approving first pairing request: sender={}, channel={}, account={}",
                sender_id,
                channel,
                account_id
            );

      // Step 1: Write sender ID to the allowFrom store
      let af_path = match allow_from_store_path(&channel, account_id) {
        Some(p) => p,
        None => {
          log::error!(
            "[pairing_auto_approve] Could not resolve allowFrom path for channel '{}'",
            channel
          );
          return;
        }
      };

      if let Err(e) = write_allow_from(&af_path, sender_id) {
        log::error!("[pairing_auto_approve] Failed to write allowFrom: {}", e);
        return;
      }
      log::info!(
        "[pairing_auto_approve] Added {} to allowFrom store at {}",
        sender_id,
        af_path.display()
      );

      // Step 2: Remove the request from the pairing store
      if let Err(e) = remove_pairing_request(&pairing_path, code) {
        log::warn!(
          "[pairing_auto_approve] Failed to clean up pairing request: {}",
          e
        );
        // Non-fatal — the important thing is allowFrom is written
      }

      // Step 3: Switch dmPolicy to "allowlist"
      match switch_to_allowlist(&channel).await {
        Ok(()) => {
          log::info!(
            "[pairing_auto_approve] Switched channel '{}' to dmPolicy=allowlist",
            channel
          );
        }
        Err(e) => {
          log::error!(
            "[pairing_auto_approve] Failed to switch dmPolicy for '{}': {}",
            channel,
            e
          );
          // allowFrom is already written, so the sender can still
          // interact.  The policy switch can be retried or done
          // manually via the UI.
        }
      }

      return; // Done — only auto-approve once
    }
  });
}
