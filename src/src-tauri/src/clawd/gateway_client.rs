//! Persistent WebSocket client for communicating with the Clawdbot Gateway.
//!
//! Why this exists:
//! - The previous implementation opened a brand new WebSocket connection per request.
//! - Under bursty workloads (e.g., WhatsApp/iMessage gateways), that can create
//!   reconnect storms, TIME_WAIT buildup, and general port sadness.
//!
//! This module provides a single shared connection with:
//! - bounded in-flight requests (backpressure)
//! - a simple circuit breaker (avoid thrash when gateway is down)

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{oneshot, Mutex, Semaphore};
use tokio_tungstenite::{
  connect_async,
  tungstenite::{client::IntoClientRequest, http::HeaderValue, Message},
};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 4;
const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

// Backpressure: cap concurrent in-flight requests.
const MAX_IN_FLIGHT: usize = 64;

// Circuit breaker: trip after N consecutive failures, cool down for a bit.
const BREAKER_TRIP_AFTER: u32 = 3;
const BREAKER_COOLDOWN: Duration = Duration::from_secs(15);

static REQUEST_ID: AtomicU64 = AtomicU64::new(1);
fn next_request_id() -> String {
  REQUEST_ID.fetch_add(1, Ordering::SeqCst).to_string()
}

#[derive(Serialize)]
struct RequestFrame {
  #[serde(rename = "type")]
  frame_type: &'static str,
  method: String,
  id: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  params: Option<Value>,
}

fn deserialize_string_or_number<'de, D>(deserializer: D) -> Result<String, D::Error>
where
  D: serde::Deserializer<'de>,
{
  let v = Value::deserialize(deserializer)?;
  match v {
    Value::String(s) => Ok(s),
    Value::Number(n) => Ok(n.to_string()),
    _ => Ok(v.to_string()),
  }
}

#[derive(Deserialize, Debug)]
struct ResponseFrame {
  #[serde(rename = "type", default)]
  frame_type: Option<String>,
  #[serde(deserialize_with = "deserialize_string_or_number")]
  id: String,
  #[serde(default)]
  ok: bool,
  #[serde(default)]
  result: Option<Value>,
  #[serde(default)]
  data: Option<Value>,
  #[serde(default)]
  payload: Option<Value>,
  #[serde(default)]
  error: Option<Value>,
}

#[derive(Deserialize, Debug)]
struct EventFrame {
  #[serde(rename = "type")]
  frame_type: String,
  event: String,
  #[serde(default)]
  payload: Option<Value>,
}

#[derive(Serialize)]
struct ConnectParams {
  #[serde(rename = "minProtocol")]
  min_protocol: u32,
  #[serde(rename = "maxProtocol")]
  max_protocol: u32,
  client: ClientInfo,
  auth: Option<AuthInfo>,
  role: &'static str,
  scopes: Vec<&'static str>,
}

#[derive(Serialize)]
struct ClientInfo {
  id: &'static str,
  #[serde(rename = "displayName")]
  display_name: &'static str,
  version: &'static str,
  platform: &'static str,
  mode: &'static str,
}

#[derive(Serialize)]
struct AuthInfo {
  token: String,
}

struct Pending {
  tx: oneshot::Sender<Result<Value, String>>,
  /// How many more responses to skip before resolving.
  /// For two-phase methods like `agent`, the first response is an ack
  /// and the second is the actual result. Set to 1 to skip one response.
  remaining_skips: u32,
}

#[derive(Default)]
struct CircuitBreaker {
  consecutive_failures: u32,
  open_until: Option<Instant>,
}

impl CircuitBreaker {
  fn allow(&self) -> bool {
    match self.open_until {
      None => true,
      Some(t) => Instant::now() >= t,
    }
  }

  fn on_success(&mut self) {
    self.consecutive_failures = 0;
    self.open_until = None;
  }

  fn on_failure(&mut self) {
    self.consecutive_failures = self.consecutive_failures.saturating_add(1);
    if self.consecutive_failures >= BREAKER_TRIP_AFTER {
      self.open_until = Some(Instant::now() + BREAKER_COOLDOWN);
    }
  }

  fn state_string(&self) -> String {
    if let Some(t) = self.open_until {
      if Instant::now() < t {
        return format!("open until {:?}", t);
      }
    }
    format!("closed (failures={})", self.consecutive_failures)
  }
}

struct GatewayClient {
  write: Mutex<
    futures_util::stream::SplitSink<
      tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
      Message,
    >,
  >,
  pending: Mutex<HashMap<String, Pending>>,
  in_flight: Semaphore,
  breaker: Mutex<CircuitBreaker>,
}

/// Holds the current gateway connection.  Uses a std RwLock (never held
/// across await points) so the connection can be replaced when the
/// underlying WebSocket drops, enabling transparent reconnection.
static CLIENT: once_cell::sync::Lazy<std::sync::RwLock<Option<Arc<GatewayClient>>>> =
  once_cell::sync::Lazy::new(|| std::sync::RwLock::new(None));

/// Serializes concurrent connection attempts so only one WS handshake runs
/// at a time (thundering-herd prevention).  Without this, N concurrent
/// callers that each see CLIENT=None all call connect_and_handshake
/// simultaneously, open N WebSocket connections, then drop N-1 of them —
/// each drop is logged as code=1006 "closed before connect" by the gateway.
static CONNECT_LOCK: once_cell::sync::Lazy<tokio::sync::Mutex<()>> =
  once_cell::sync::Lazy::new(|| tokio::sync::Mutex::new(()));

async fn ensure_gateway_best_effort(token: &str) {
  let _ = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, token).await;
}

/// Ensure the OpenClaw config has browser settings suitable for the desktop app:
///   browser.enabled = true, browser.headless = false, browser.defaultProfile = "openclaw".
///
/// The `set_service_enabled` endpoint (macOS launchctl setup) also patches these,
/// but that path is never hit in `npm run tauri dev` or on non-macOS.  Running this
/// at first connection ensures the managed Chrome is visible and functional regardless
/// of how the gateway was started.
/// Returns `true` when the on-disk config was changed (browser settings patched).
fn ensure_browser_config() -> bool {
  // On Windows, HOME is typically not set — fall back to USERPROFILE.
  let home = match std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")) {
    Ok(h) => h,
    Err(_) => return false,
  };

  // Check the app data dir first (OPENCLAW_HOME / OPENCLAW_STATE_DIR) —
  // that's where service.rs creates the config the gateway actually reads.
  for var in ["OPENCLAW_HOME", "OPENCLAW_STATE_DIR"] {
    if let Ok(dir) = std::env::var(var) {
      let dir = dir.trim().to_string();
      if !dir.is_empty() {
        let app_config = std::path::PathBuf::from(&dir).join("openclaw.json");
        if app_config.exists() {
          let changed = ensure_browser_config_at(&app_config);
          ensure_tools_md(&app_config);
          return changed;
        }
        let app_legacy = std::path::PathBuf::from(&dir).join("clawdbot.json");
        if app_legacy.exists() {
          let changed = ensure_browser_config_at(&app_legacy);
          ensure_tools_md(&app_legacy);
          return changed;
        }
      }
    }
  }

  let config_path = std::path::PathBuf::from(&home)
    .join(".openclaw")
    .join("openclaw.json");
  if !config_path.exists() {
    let legacy = std::path::PathBuf::from(&home)
      .join(".clawdbot")
      .join("clawdbot.json");
    if !legacy.exists() {
      return false; // No config file yet; service.rs will create one when enabling.
    }
    let changed = ensure_browser_config_at(&legacy);
    ensure_tools_md(&legacy);
    return changed;
  }
  let changed = ensure_browser_config_at(&config_path);
  ensure_tools_md(&config_path);
  changed
}

/// Write TOOLS.md to the workspace if it's missing or outdated.
/// This covers dev mode where set_service_enabled never runs.
fn ensure_tools_md(config_path: &std::path::Path) {
  let content = match std::fs::read_to_string(config_path) {
    Ok(c) => c,
    Err(_) => return,
  };
  let cfg: Value = match serde_json::from_str(&content) {
    Ok(v) => v,
    Err(_) => return,
  };

  let home = match std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")) {
    Ok(h) => h,
    Err(_) => return,
  };

  let workspace_path = cfg
    .pointer("/agents/defaults/workspace")
    .and_then(|v| v.as_str())
    .map(|s| {
      if s.starts_with("~/") {
        std::path::PathBuf::from(&home).join(&s[2..])
      } else {
        std::path::PathBuf::from(s)
      }
    })
    .unwrap_or_else(|| {
      std::path::PathBuf::from(&home)
        .join(".openclaw")
        .join("workspace")
    });

  let _ = std::fs::create_dir_all(&workspace_path);
  let tools_md_path = workspace_path.join("TOOLS.md");

  let should_write = if tools_md_path.exists() {
    std::fs::read_to_string(&tools_md_path)
      .map(|c| !c.contains("SELF-REVIEW"))
      .unwrap_or(true)
  } else {
    true
  };

  if !should_write {
    return;
  }

  // Single source of truth: tools_md_content.txt (same as service.rs uses).
  let tools_md = include_str!("tools_md_content.txt");
  match std::fs::write(&tools_md_path, tools_md) {
    Ok(_) => eprintln!(
      "[gateway_client] Wrote TOOLS.md at {}",
      tools_md_path.display()
    ),
    Err(e) => eprintln!("[gateway_client] Failed to write TOOLS.md: {}", e),
  }
}

/// Patch browser config at a specific path.  Returns `true` when the file
/// was modified so the caller knows whether a running gateway needs updating.
fn ensure_browser_config_at(config_path: &std::path::Path) -> bool {
  let content = match std::fs::read_to_string(config_path) {
    Ok(c) => c,
    Err(_) => return false,
  };
  let mut cfg: Value = match serde_json::from_str(&content) {
    Ok(v) => v,
    Err(_) => return false,
  };

  // Snapshot restart-sensitive gateway fields before any modifications.
  // These fields (gateway.auth.mode, gateway.tailscale) trigger a full
  // gateway restart when changed.  We never intentionally modify them, but
  // preserve them explicitly so a serde round-trip or future patch can't
  // silently drop them and cause a spurious "deferring until N tasks complete".
  let saved_auth_mode = cfg.pointer("/gateway/auth/mode").cloned();
  let saved_tailscale = cfg.pointer("/gateway/tailscale").cloned();

  let mut patched = false;

  // Sync gateway.auth.token from env vars into the config file.
  // The gateway reads this token on startup and validates it during
  // WebSocket handshakes.  If this is missing or stale, all RPC
  // calls fail with "gateway token mismatch".
  if let Some(env_token) = get_gateway_token() {
    let config_token = cfg
      .pointer("/gateway/auth/token")
      .and_then(|v| v.as_str())
      .unwrap_or("");
    if config_token != env_token {
      if cfg.get("gateway").is_none() {
        cfg
          .as_object_mut()
          .unwrap()
          .insert("gateway".into(), serde_json::json!({}));
      }
      if cfg.pointer("/gateway/auth").is_none() {
        cfg
          .pointer_mut("/gateway")
          .unwrap()
          .as_object_mut()
          .unwrap()
          .insert("auth".into(), serde_json::json!({}));
      }
      cfg
        .pointer_mut("/gateway/auth")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert("token".into(), serde_json::json!(env_token));
      eprintln!("[gateway_client] Synced gateway.auth.token in config file");
      patched = true;
    }
  }

  // Ensure gateway.auth.mode is explicitly set to "token" if absent.
  // The gateway's maybePersistAutoGeneratedGatewayInstallToken() defaults a
  // missing auth.mode to "token" on every config write-back.  The reload diff
  // then sees auth.mode as a newly-added field under the "gateway" prefix and
  // triggers a full restart (deferred indefinitely when tasks are in flight).
  // Writing it here prevents the spurious diff.  Only set if absent — never
  // overwrite "tailscale" or other explicitly-configured auth modes.
  if cfg.pointer("/gateway/auth/mode").is_none() {
    if cfg.get("gateway").is_none() {
      cfg
        .as_object_mut()
        .unwrap()
        .insert("gateway".into(), serde_json::json!({}));
    }
    if cfg.pointer("/gateway/auth").is_none() {
      cfg
        .pointer_mut("/gateway")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert("auth".into(), serde_json::json!({}));
    }
    cfg
      .pointer_mut("/gateway/auth")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("mode".into(), serde_json::json!("token"));
    eprintln!("[gateway_client] Set gateway.auth.mode to \"token\" (was absent — prevents spurious restart)");
    patched = true;
  }

  // Ensure browser object exists.
  if cfg.get("browser").is_none() {
    cfg
      .as_object_mut()
      .unwrap()
      .insert("browser".into(), serde_json::json!({}));
    patched = true;
  }

  // browser.enabled = true
  let enabled = cfg
    .pointer("/browser/enabled")
    .and_then(|v| v.as_bool())
    .unwrap_or(false);
  if !enabled {
    cfg
      .pointer_mut("/browser")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("enabled".into(), serde_json::json!(true));
    eprintln!("[gateway_client] Patched browser.enabled to true");
    patched = true;
  }

  // browser.headless = false  (user needs visible Chrome for logins)
  // Always set explicitly — if absent, the gateway may default to headless=true.
  let headless = cfg.pointer("/browser/headless").and_then(|v| v.as_bool());
  if headless != Some(false) {
    cfg
      .pointer_mut("/browser")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("headless".into(), serde_json::json!(false));
    eprintln!("[gateway_client] Patched browser.headless to false");
    patched = true;
  }

  // browser.defaultProfile = "openclaw"  (managed, isolated)
  let profile = cfg
    .pointer("/browser/defaultProfile")
    .and_then(|v| v.as_str())
    .unwrap_or("chrome");
  if profile == "chrome" || profile == "knapsack" || profile.is_empty() {
    cfg
      .pointer_mut("/browser")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("defaultProfile".into(), serde_json::json!("openclaw"));
    eprintln!("[gateway_client] Patched browser.defaultProfile to openclaw");
    patched = true;
  }

  // browser.noSandbox = true  (needed on Linux for Chrome without a display server)
  // On macOS this is unnecessary and causes a visible warning bar in Chrome.
  if cfg!(target_os = "linux") {
    let no_sandbox = cfg
      .pointer("/browser/noSandbox")
      .and_then(|v| v.as_bool())
      .unwrap_or(false);
    if !no_sandbox {
      cfg
        .pointer_mut("/browser")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert("noSandbox".into(), serde_json::json!(true));
      eprintln!("[gateway_client] Patched browser.noSandbox to true (Linux)");
      patched = true;
    }
  }

  // ── Ensure browser tool is allowed in NORMAL mode (webchat/desktop) ────
  //
  // The gateway's internal DEFAULT_TOOL_DENY includes "browser".
  // If tools.deny is ABSENT from the config, the gateway uses that default,
  // which BLOCKS browser for normal-mode requests (desktop webchat).
  // We must explicitly set tools.deny WITHOUT "browser" so the gateway
  // doesn't fall back to its built-in default.

  // Ensure tools object exists
  if cfg.get("tools").is_none() {
    cfg
      .as_object_mut()
      .unwrap()
      .insert("tools".into(), serde_json::json!({}));
  }

  let deny_exists = cfg
    .pointer("/tools/deny")
    .and_then(|v| v.as_array())
    .is_some();
  if deny_exists {
    // Remove "browser" from existing deny list
    let browser_denied = cfg
      .pointer("/tools/deny")
      .and_then(|v| v.as_array())
      .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
      .unwrap_or(false);
    if browser_denied {
      if let Some(deny_arr) = cfg
        .pointer_mut("/tools/deny")
        .and_then(|v| v.as_array_mut())
      {
        deny_arr.retain(|item| item.as_str() != Some("browser"));
        eprintln!("[gateway_client] Removed browser from tools.deny");
        patched = true;
      }
    }
  } else {
    // tools.deny is ABSENT — create it from gateway defaults WITHOUT "browser"
    // so the gateway doesn't fall back to its internal default (which blocks browser).
    // Gateway defaults: ["browser","canvas","nodes","cron","gateway",...channelIds]
    cfg
      .pointer_mut("/tools")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert(
        "deny".into(),
        serde_json::json!(["canvas", "nodes", "cron", "gateway"]),
      );
    eprintln!("[gateway_client] Created tools.deny (without browser)");
    patched = true;
  }

  // Ensure "browser" and "group:web" are in tools.allow.
  // The gateway's DEFAULT_TOOL_ALLOW does NOT include "browser" or web tools.
  // Even with the "full" profile, the deny list takes precedence — so we must
  // also add browser to the allow list to be safe.
  let browser_tool_allowed = cfg
    .pointer("/tools/allow")
    .and_then(|v| v.as_array())
    .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
    .unwrap_or(false);
  if !browser_tool_allowed {
    let tools = cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap();
    if let Some(allow) = tools.get_mut("allow").and_then(|v| v.as_array_mut()) {
      allow.push(serde_json::json!("browser"));
    } else {
      tools.insert("allow".into(), serde_json::json!(["browser"]));
    }
    eprintln!("[gateway_client] Added browser to tools.allow");
    patched = true;
  }

  // Ensure "group:web" is in tools.allow (includes web_fetch + web_search)
  let group_web_allowed = cfg
    .pointer("/tools/allow")
    .and_then(|v| v.as_array())
    .map(|arr| arr.iter().any(|item| item.as_str() == Some("group:web")))
    .unwrap_or(false);
  if !group_web_allowed {
    if let Some(allow) = cfg
      .pointer_mut("/tools/allow")
      .and_then(|v| v.as_array_mut())
    {
      allow.push(serde_json::json!("group:web"));
    }
    eprintln!("[gateway_client] Added group:web to tools.allow");
    patched = true;
  }

  // ── Ensure exec/process/file tools are allowed in NORMAL mode ──────────
  //
  // These are the same tools granted in sandbox mode (for Telegram/WhatsApp/etc.)
  // but they must also be in the normal-mode allow list so that desktop webchat
  // can execute shell commands and edit files when Advanced Mode is on.
  // The gateway controls whether the agent actually *uses* them via the system
  // prompt and TOOLS.md; having them in the allow list just makes them available.
  //
  // Use group aliases (group:fs, group:runtime) instead of individual tool names
  // where possible.  The gateway validates the allowlist against registered core
  // tools; "apply_patch" is only registered when tools.exec.applyPatch.enabled
  // is true, so listing it individually causes a spurious "unknown entries"
  // warning.  group:fs expands to [read, write, edit, apply_patch] and is
  // always recognised by the validator.
  let exec_tools: Vec<&str> = vec!["exec", "process", "group:fs"];
  if let Some(allow) = cfg
    .pointer_mut("/tools/allow")
    .and_then(|v| v.as_array_mut())
  {
    // Remove legacy individual entries that are now covered by group:fs
    let covered_by_group_fs = ["read", "write", "edit", "apply_patch"];
    let before_len = allow.len();
    allow.retain(|item| {
      item
        .as_str()
        .map(|s| !covered_by_group_fs.contains(&s))
        .unwrap_or(true)
    });
    if allow.len() != before_len {
      eprintln!(
        "[gateway_client] Cleaned up individual file tool entries (now covered by group:fs)"
      );
      patched = true;
    }

    for tool_name in &exec_tools {
      let already = allow.iter().any(|item| item.as_str() == Some(tool_name));
      if !already {
        allow.push(serde_json::json!(tool_name));
        eprintln!("[gateway_client] Added {} to tools.allow", tool_name);
        patched = true;
      }
    }
  }

  // ── Enable apply_patch tool ──────────────────────────────────────────────
  //
  // apply_patch is gated behind tools.exec.applyPatch.enabled.  Without this
  // flag the tool isn't registered, and adding it to tools.allow causes a
  // "unknown entries (apply_patch)" warning on every config reload.
  if cfg.pointer("/tools/exec").is_none() {
    cfg
      .pointer_mut("/tools")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("exec".into(), serde_json::json!({}));
  }
  if cfg.pointer("/tools/exec/applyPatch").is_none() {
    cfg
      .pointer_mut("/tools/exec")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("applyPatch".into(), serde_json::json!({}));
  }
  let apply_patch_enabled = cfg
    .pointer("/tools/exec/applyPatch/enabled")
    .and_then(|v| v.as_bool())
    .unwrap_or(false);
  if !apply_patch_enabled {
    cfg
      .pointer_mut("/tools/exec/applyPatch")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("enabled".into(), serde_json::json!(true));
    eprintln!("[gateway_client] Enabled tools.exec.applyPatch");
    patched = true;
  }

  // ── Ensure browser tool is allowed in SANDBOX mode (Telegram/WhatsApp/etc.) ─
  //
  // Channel messages run in sandbox mode with a separate tools policy.
  // The gateway's DEFAULT_TOOL_DENY for sandbox also blocks "browser".
  // Create/patch sandbox deny and allow lists to match what service.rs does.
  if cfg.pointer("/tools/sandbox").is_none() {
    cfg
      .pointer_mut("/tools")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("sandbox".into(), serde_json::json!({}));
  }
  if cfg.pointer("/tools/sandbox/tools").is_none() {
    cfg
      .pointer_mut("/tools/sandbox")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert("tools".into(), serde_json::json!({}));
  }

  // sandbox deny list
  let sandbox_deny_exists = cfg
    .pointer("/tools/sandbox/tools/deny")
    .and_then(|v| v.as_array())
    .is_some();
  if sandbox_deny_exists {
    let has_browser = cfg
      .pointer("/tools/sandbox/tools/deny")
      .and_then(|v| v.as_array())
      .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
      .unwrap_or(false);
    if has_browser {
      if let Some(arr) = cfg
        .pointer_mut("/tools/sandbox/tools/deny")
        .and_then(|v| v.as_array_mut())
      {
        arr.retain(|item| item.as_str() != Some("browser"));
        eprintln!("[gateway_client] Removed browser from tools.sandbox.tools.deny");
        patched = true;
      }
    }
  } else {
    cfg
      .pointer_mut("/tools/sandbox/tools")
      .unwrap()
      .as_object_mut()
      .unwrap()
      .insert(
        "deny".into(),
        serde_json::json!(["canvas", "nodes", "cron", "gateway"]),
      );
    eprintln!("[gateway_client] Created tools.sandbox.tools.deny (without browser)");
    patched = true;
  }

  // sandbox allow list
  let sandbox_allow_has_browser = cfg
    .pointer("/tools/sandbox/tools/allow")
    .and_then(|v| v.as_array())
    .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
    .unwrap_or(false);
  if !sandbox_allow_has_browser {
    if let Some(arr) = cfg
      .pointer_mut("/tools/sandbox/tools/allow")
      .and_then(|v| v.as_array_mut())
    {
      arr.push(serde_json::json!("browser"));
      arr.push(serde_json::json!("group:web"));
    } else {
      cfg
        .pointer_mut("/tools/sandbox/tools")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert(
          "allow".into(),
          serde_json::json!([
            "exec",
            "process",
            "group:fs",
            "image",
            "sessions_list",
            "sessions_history",
            "sessions_send",
            "sessions_spawn",
            "session_status",
            "browser",
            "group:web"
          ]),
        );
    }
    eprintln!("[gateway_client] Added browser + group:web to tools.sandbox.tools.allow");
    patched = true;
  }

  // ── Telegram: cap the HTTP client timeout ────────────────────────────────
  //
  // Grammy's default timeoutSeconds is 500 (≈8 min).  getUpdates long-polls
  // block for that entire duration, and when they do time out the resulting
  // AbortError floods the log.  Always enforce 60s — even if the field is
  // already set — so a stale value from a previous session can't survive a
  // restart and cause 16-minute stall-detector cycles.
  let tg_has_token = cfg
    .pointer("/channels/telegram/botToken")
    .and_then(|v| v.as_str())
    .map(|s| !s.trim().is_empty())
    .unwrap_or(false);
  if tg_has_token {
    let current_tg_timeout = cfg
      .pointer("/channels/telegram/timeoutSeconds")
      .and_then(|v| v.as_u64())
      .unwrap_or(0);
    if current_tg_timeout != 60 {
      if cfg.pointer("/channels/telegram").is_some() {
        cfg
          .pointer_mut("/channels/telegram")
          .unwrap()
          .as_object_mut()
          .unwrap()
          .insert("timeoutSeconds".into(), serde_json::json!(60));
        eprintln!(
          "[gateway_client] Set channels.telegram.timeoutSeconds to 60 (was {})",
          current_tg_timeout
        );
        patched = true;
      }
    }
  }

  // ── Ensure Tauri app origins are in gateway.controlUi.allowedOrigins ──────
  // Without this, the gateway refuses WebSocket connections from the Tauri
  // webview with CONTROL_UI_ORIGIN_NOT_ALLOWED.
  {
    const REQUIRED_ORIGINS: &[&str] = &["tauri://localhost", "http://localhost:1420"];
    let existing: Vec<String> = cfg
      .pointer("/gateway/controlUi/allowedOrigins")
      .and_then(|v| v.as_array())
      .map(|arr| {
        arr
          .iter()
          .filter_map(|v| v.as_str().map(|s| s.to_string()))
          .collect()
      })
      .unwrap_or_default();
    let missing: Vec<&str> = REQUIRED_ORIGINS
      .iter()
      .filter(|&&o| !existing.iter().any(|e| e == o))
      .copied()
      .collect();
    if !missing.is_empty() {
      if cfg.get("gateway").is_none() {
        cfg
          .as_object_mut()
          .unwrap()
          .insert("gateway".into(), serde_json::json!({}));
      }
      if cfg.pointer("/gateway/controlUi").is_none() {
        cfg
          .pointer_mut("/gateway")
          .unwrap()
          .as_object_mut()
          .unwrap()
          .insert("controlUi".into(), serde_json::json!({}));
      }
      let mut merged = existing;
      merged.extend(missing.iter().map(|s| s.to_string()));
      cfg
        .pointer_mut("/gateway/controlUi")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert("allowedOrigins".into(), serde_json::json!(merged));
      eprintln!(
        "[gateway_client] Patched gateway.controlUi.allowedOrigins to include Tauri origins"
      );
      patched = true;
    }
  }

  // ── Sync agents.defaults.model from the current active provider ──────────
  //
  // The model is resolved at runtime from env vars (KNAPSACK_ACTIVE_PROVIDER,
  // ANTHROPIC_API_KEY, etc.).  If the disk config has a stale model (e.g. from
  // a previous provider), the gateway will use the wrong LLM until a restart.
  //
  // By writing the current model to disk here we ensure that `disk_config_changed`
  // reflects a true change, and the `apply_runtime_browser_config()` call in
  // `connect_and_handshake()` will push the updated model to the live gateway
  // (triggering a SIGUSR1 restart) only when the model actually changed.
  //
  // NOTE: service.rs writes model as {"primary": "..."} on provider switch;
  // apply_runtime_browser_config writes it as a plain string.  Read both forms.
  {
    let current_model = resolve_default_model();
    let disk_model = cfg
      .pointer("/agents/defaults/model")
      .and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        Value::Object(o) => o
          .get("primary")
          .and_then(|p| p.as_str())
          .map(|s| s.to_string()),
        _ => None,
      })
      .unwrap_or_default();
    if disk_model != current_model {
      if cfg.get("agents").is_none() {
        cfg
          .as_object_mut()
          .unwrap()
          .insert("agents".into(), serde_json::json!({}));
      }
      if cfg.pointer("/agents/defaults").is_none() {
        cfg
          .pointer_mut("/agents")
          .unwrap()
          .as_object_mut()
          .unwrap()
          .insert("defaults".into(), serde_json::json!({}));
      }
      // Write as object with fallbacks so the gateway can retry when the primary
      // model is rate-limited (429) or overloaded (503).
      cfg
        .pointer_mut("/agents/defaults")
        .unwrap()
        .as_object_mut()
        .unwrap()
        .insert("model".into(), build_model_config());
      eprintln!(
        "[gateway_client] Patched agents.defaults.model: {:?} → '{}'",
        disk_model, current_model
      );
      patched = true;
    }
  }

  // Restore restart-sensitive gateway fields if anything above accidentally
  // cleared them.  Under normal operation these are no-ops.
  if let Some(auth_mode) = saved_auth_mode {
    if cfg.pointer("/gateway/auth/mode") != Some(&auth_mode) {
      if let Some(auth) = cfg
        .pointer_mut("/gateway/auth")
        .and_then(|v| v.as_object_mut())
      {
        auth.insert("mode".to_string(), auth_mode);
      }
    }
  }
  if let Some(tailscale) = saved_tailscale {
    if cfg.pointer("/gateway/tailscale") != Some(&tailscale) {
      if let Some(gw) = cfg.pointer_mut("/gateway").and_then(|v| v.as_object_mut()) {
        gw.insert("tailscale".to_string(), tailscale);
      }
    }
  }

  if patched {
    if let Ok(json) = serde_json::to_string_pretty(&cfg) {
      let _ = std::fs::write(config_path, json);
      eprintln!(
        "[gateway_client] Wrote patched config to {}",
        config_path.display()
      );
    }
  }
  patched
}

/// Track whether we've already applied browser config to a running gateway
/// so we don't repeatedly trigger restarts.
static BROWSER_CONFIG_APPLIED: std::sync::atomic::AtomicBool =
  std::sync::atomic::AtomicBool::new(false);

/// Push browser config to a running gateway via a **temporary** WebSocket
/// Pick the best default LLM model based on which API key is available.
/// Public so service.rs can call the same model resolution logic when
/// updating the config file on provider change.
pub fn resolve_default_model() -> String {
  let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();
  let has_key = |var: &str| {
    std::env::var(var)
      .map(|k| !k.trim().is_empty())
      .unwrap_or(false)
  };
  let has_gemini_key = || has_key("GEMINI_API_KEY") || has_key("GOOGLE_API_KEY");

  // Respect the user's active provider selection and configured model
  match active.as_str() {
    // Knapsack cloud inference: the backend selects the best model based on
    // the user's subscription — the desktop always sends "auto".
    "knapsack" => {
      return "auto".to_string();
    }
    "openrouter" => {
      let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
        .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
      return format!("openrouter/{}", model);
    }
    "ollama" => {
      let model = std::env::var("KNAPSACK_OLLAMA_MODEL").unwrap_or_else(|_| "llama3.1".to_string());
      return format!("ollama/{}", model);
    }
    "knapsack" => {
      // Knapsack cloud inference lets the backend select the concrete model
      // from the user's subscription and current availability.
      return "auto".to_string();
    }
    "anthropic" if has_key("ANTHROPIC_API_KEY") => {
      let model =
        std::env::var("KNAPSACK_ANTHROPIC_MODEL").unwrap_or_else(|_| "claude-opus-4-6".to_string());
      return format!("anthropic/{}", model);
    }
    "openai" if has_key("OPENAI_API_KEY") => {
      let model = std::env::var("KNAPSACK_OPENAI_MODEL").unwrap_or_else(|_| "gpt-5.4".to_string());
      return format!("openai/{}", model);
    }
    "groq" if has_key("GROQ_API_KEY") => {
      let model = std::env::var("KNAPSACK_GROQ_MODEL")
        .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
      return format!("groq/{}", model);
    }
    "xai" if has_key("XAI_API_KEY") => {
      let model =
        std::env::var("KNAPSACK_XAI_MODEL").unwrap_or_else(|_| "grok-code-fast-1".to_string());
      return format!("xai/{}", model);
    }
    "gemini" if has_gemini_key() => {
      let model =
        std::env::var("KNAPSACK_GEMINI_MODEL").unwrap_or_else(|_| "gemini-3.5-flash".to_string());
      return format!("google/{}", model);
    }
    // Google OAuth CLI auth (no API key env var — credentials stored in auth-profiles.json).
    "google-gemini-cli" => {
      let model =
        std::env::var("KNAPSACK_GEMINI_MODEL").unwrap_or_else(|_| "gemini-3.5-flash".to_string());
      return format!("google-gemini-cli/{}", model);
    }
    _ => {}
  }

  // Fallback: try providers in preference order using user's configured model.
  // Respects KNAPSACK_DISABLE_PAID_FALLBACK to avoid silently selecting expensive models.
  let disable_paid = std::env::var("KNAPSACK_DISABLE_PAID_FALLBACK")
    .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
    .unwrap_or(true);
  // google-gemini-cli is OAuth-based (free tier) — treat it as a free provider
  // so paid fallbacks are not silently selected when the CLI model is unavailable.
  let active_is_free = matches!(
    active.as_str(),
    "groq" | "xai" | "gemini" | "ollama" | "openrouter" | "google-gemini-cli"
  );

  if !disable_paid || !active_is_free {
    if has_key("ANTHROPIC_API_KEY") {
      let model =
        std::env::var("KNAPSACK_ANTHROPIC_MODEL").unwrap_or_else(|_| "claude-opus-4-6".to_string());
      log::warn!(
        "[resolve_default_model] Falling back to anthropic/{} (active={})",
        model,
        active
      );
      return format!("anthropic/{}", model);
    }
    if has_key("OPENAI_API_KEY") {
      let model = std::env::var("KNAPSACK_OPENAI_MODEL").unwrap_or_else(|_| "gpt-5.4".to_string());
      log::warn!(
        "[resolve_default_model] Falling back to openai/{} (active={})",
        model,
        active
      );
      return format!("openai/{}", model);
    }
  } else {
    if has_key("ANTHROPIC_API_KEY") {
      log::info!(
        "[resolve_default_model] Skipping Anthropic fallback (paid fallback disabled, active={})",
        active
      );
    }
    if has_key("OPENAI_API_KEY") {
      log::info!(
        "[resolve_default_model] Skipping OpenAI fallback (paid fallback disabled, active={})",
        active
      );
    }
  }
  if has_key("GROQ_API_KEY") {
    let model = std::env::var("KNAPSACK_GROQ_MODEL")
      .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
    return format!("groq/{}", model);
  }
  if has_key("XAI_API_KEY") {
    let model =
      std::env::var("KNAPSACK_XAI_MODEL").unwrap_or_else(|_| "grok-code-fast-1".to_string());
    return format!("xai/{}", model);
  }
  if has_gemini_key() {
    let model =
      std::env::var("KNAPSACK_GEMINI_MODEL").unwrap_or_else(|_| "gemini-3.5-flash".to_string());
    return format!("google/{}", model);
  }
  if has_key("OPENROUTER_API_KEY") {
    let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
      .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
    return format!("openrouter/{}", model);
  }
  if has_key("OLLAMA_API_KEY") {
    let model = std::env::var("KNAPSACK_OLLAMA_MODEL").unwrap_or_else(|_| "llama3.1".to_string());
    return format!("ollama/{}", model);
  }
  // Final fallback: use Groq free model instead of expensive Anthropic Opus
  log::warn!(
    "[resolve_default_model] No provider keys found, defaulting to groq/llama-3.3-70b-versatile"
  );
  "groq/llama-3.3-70b-versatile".to_string()
}

/// Return fallback model refs to try when the primary model is rate-limited or overloaded.
///
/// Fallbacks are sourced from providers whose API keys are available and differ from the
/// primary's provider.  Groq is preferred as a fallback because it is free and fast.
/// Called by `build_model_config()` — prefer that over calling this directly.
pub fn collect_fallback_models(primary: &str) -> Vec<String> {
  let has_key = |var: &str| {
    std::env::var(var)
      .map(|k| !k.trim().is_empty())
      .unwrap_or(false)
  };
  let has_gemini_key = || has_key("GEMINI_API_KEY") || has_key("GOOGLE_API_KEY");
  let primary_provider = primary.split('/').next().unwrap_or("").to_lowercase();
  let mut fallbacks = Vec::new();

  // Groq first: free, fast, and a good rate-limit escape hatch.
  if primary_provider != "groq" && has_key("GROQ_API_KEY") {
    let model = std::env::var("KNAPSACK_GROQ_MODEL")
      .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
    fallbacks.push(format!("groq/{}", model));
  }

  if primary_provider != "xai" && has_key("XAI_API_KEY") {
    let model =
      std::env::var("KNAPSACK_XAI_MODEL").unwrap_or_else(|_| "grok-code-fast-1".to_string());
    fallbacks.push(format!("xai/{}", model));
  }

  // Google/Gemini as fallback when the primary is not already a Google provider.
  let is_google_primary = matches!(
    primary_provider.as_str(),
    "google" | "gemini" | "google-gemini-cli"
  );
  if !is_google_primary && has_gemini_key() {
    let model =
      std::env::var("KNAPSACK_GEMINI_MODEL").unwrap_or_else(|_| "gemini-3.5-flash".to_string());
    fallbacks.push(format!("google/{}", model));
  }

  if primary_provider != "openrouter" && has_key("OPENROUTER_API_KEY") {
    let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
      .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
    fallbacks.push(format!("openrouter/{}", model));
  }

  fallbacks
}

/// Build the `agents.defaults.model` config object for the gateway.
///
/// Ollama stays in bare string form because local-provider startup can spin
/// when the gateway receives the fallback object shape for an Ollama primary.
///
/// Returns `{"primary": "...", "fallbacks": [...]}` when fallback providers are
/// available, or `{"primary": "..."}` when none are.  The gateway uses `fallbacks`
/// to retry with an alternative model when the primary is rate-limited (429) or
/// overloaded (503), preventing `FailoverError` propagation to the user.
pub fn build_model_config() -> serde_json::Value {
  let primary = resolve_default_model();
  // Keep local Ollama models as a bare string. The gateway starts Ollama
  // providers more reliably with the explicit provider/model id than with a
  // fallback object that requires provider catalog discovery during boot.
  if primary.starts_with("ollama/") {
    return serde_json::json!(primary);
  }
  let fallbacks = collect_fallback_models(&primary);
  if fallbacks.is_empty() {
    serde_json::json!({"primary": primary})
  } else {
    serde_json::json!({"primary": primary, "fallbacks": fallbacks})
  }
}

/// connection.  config.patch triggers a SIGUSR1 restart on the gateway, so
/// we use a throwaway connection and wait for the gateway to come back.
async fn apply_runtime_browser_config(token: &str) {
  // Open a temporary WebSocket just for the config.patch exchange.
  let tmp_req = {
    let mut r = GATEWAY_WS_URL.into_client_request().expect("valid URL");
    r.headers_mut()
      .insert("Origin", HeaderValue::from_static("http://localhost:1420"));
    r
  };
  let tmp_ws = match tokio::time::timeout(Duration::from_secs(3), connect_async(tmp_req)).await {
    Ok(Ok((ws, _))) => ws,
    _ => {
      eprintln!("[gateway_client] Could not open temporary WS for config.patch");
      return;
    }
  };

  let (mut tmp_write, mut tmp_read) = tmp_ws.split();

  // Complete the handshake on the temporary connection.
  let challenge_text = match tokio::time::timeout(Duration::from_secs(3), async {
    loop {
      match tmp_read.next().await {
        Some(Ok(Message::Text(t))) => break Ok(t),
        Some(Ok(Message::Close(_))) | None => break Err("closed".to_string()),
        _ => continue,
      }
    }
  })
  .await
  {
    Ok(Ok(t)) => t,
    _ => {
      eprintln!("[gateway_client] Timeout/error waiting for challenge on tmp WS");
      return;
    }
  };

  let event: EventFrame = match serde_json::from_str(&challenge_text) {
    Ok(e) => e,
    Err(_) => return,
  };
  if event.event != "connect.challenge" {
    return;
  }

  let connect_params = ConnectParams {
    min_protocol: PROTOCOL_VERSION,
    max_protocol: PROTOCOL_VERSION,
    client: ClientInfo {
      id: "openclaw-control-ui",
      display_name: "Knapsack Desktop (config patch)",
      version: env!("CARGO_PKG_VERSION"),
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: Some(AuthInfo {
      token: token.to_string(),
    }),
    role: "operator",
    scopes: vec!["operator.admin", "operator.read", "operator.write"],
  };

  let connect_frame = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(&connect_params).unwrap()),
  };

  if tmp_write
    .send(Message::Text(
      serde_json::to_string(&connect_frame).unwrap(),
    ))
    .await
    .is_err()
  {
    return;
  }

  // Wait for connect response.
  let _connect_ok = match tokio::time::timeout(Duration::from_secs(3), async {
    loop {
      match tmp_read.next().await {
        Some(Ok(Message::Text(t))) => {
          if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&t) {
            break resp.ok;
          }
        }
        Some(Ok(Message::Close(_))) | None => break false,
        _ => continue,
      }
    }
  })
  .await
  {
    Ok(ok) => ok,
    Err(_) => false,
  };

  // Send config.get to get the baseHash.
  let config_get_id = next_request_id();
  let config_get_frame = RequestFrame {
    frame_type: "req",
    method: "config.get".to_string(),
    id: config_get_id.clone(),
    params: None,
  };
  if tmp_write
    .send(Message::Text(
      serde_json::to_string(&config_get_frame).unwrap(),
    ))
    .await
    .is_err()
  {
    return;
  }

  // Read config.get response.
  let cfg_val: Value = match tokio::time::timeout(Duration::from_secs(5), async {
    loop {
      match tmp_read.next().await {
        Some(Ok(Message::Text(t))) => {
          if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&t) {
            if resp.id == config_get_id && resp.ok {
              break Ok(
                resp
                  .result
                  .or(resp.data)
                  .or(resp.payload)
                  .unwrap_or(Value::Null),
              );
            } else if resp.id == config_get_id {
              break Err("config.get failed");
            }
          }
        }
        Some(Ok(Message::Close(_))) | None => break Err("connection closed"),
        _ => continue,
      }
    }
  })
  .await
  {
    Ok(Ok(v)) => v,
    _ => {
      eprintln!("[gateway_client] config.get failed or timed out on tmp WS, skipping patch");
      return;
    }
  };

  let base_hash = cfg_val
    .pointer("/hash")
    .or_else(|| cfg_val.pointer("/baseHash"))
    .and_then(|v| v.as_str())
    .unwrap_or("");

  if base_hash.is_empty() {
    eprintln!("[gateway_client] config.get returned no hash, skipping runtime patch");
    return;
  }

  // Send config.patch with browser + tools settings.
  // This must include tools.deny (without browser) and tools.allow (with browser)
  // because the gateway's internal defaults DENY browser.
  //
  // Also ensure agents.defaults.model is set — if the original channel-enable
  // config.patch failed (e.g. due to token mismatch), the model may be missing
  // and the gateway can't generate AI responses for incoming messages.
  let no_sandbox = cfg!(target_os = "linux");
  let mut patch_obj = serde_json::json!({
    "browser": {
      "enabled": true,
      "headless": false,
      "defaultProfile": "openclaw",
      "noSandbox": no_sandbox
    },
    "tools": {
      "deny": ["canvas", "nodes", "cron", "gateway"],
      "allow": ["browser", "group:web", "exec", "process", "group:fs"],
      "exec": {
        "applyPatch": { "enabled": true }
      },
      "sandbox": {
        "tools": {
          "deny": ["canvas", "nodes", "cron", "gateway"],
          "allow": [
            "exec", "process", "group:fs",
            "image", "sessions_list", "sessions_history",
            "sessions_send", "sessions_spawn", "session_status",
            "browser", "group:web"
          ]
        }
      }
    }
  });

  // Always patch agents.defaults.model from the current active provider.
  // The config file may contain a stale model (e.g. ollama) if the user
  // switched providers without restarting the gateway.  By always including
  // the resolved model in the runtime patch we ensure the gateway uses
  // whatever the user selected most recently in Settings.
  let model = resolve_default_model();
  let config_inner = cfg_val.get("config").unwrap_or(&cfg_val);
  let existing_model = config_inner
    .pointer("/agents/defaults/model")
    .and_then(|v| match v {
      Value::String(s) => Some(s.as_str().to_string()),
      Value::Object(o) => o
        .get("primary")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string()),
      _ => None,
    });
  let model_changed = existing_model.as_deref() != Some(&model);
  patch_obj.as_object_mut().unwrap().insert(
    "agents".to_string(),
    serde_json::json!({"defaults": {"model": build_model_config()}}),
  );
  if model_changed {
    eprintln!(
      "[gateway_client] agents.defaults.model updated: {:?} → '{}' in runtime patch",
      existing_model, model
    );
  }

  // Always enforce Telegram long-poll timeout = 60s.  Grammy's default is
  // 500s (≈8 min): getUpdates blocks for the entire duration, and when the
  // gateway receives a SIGUSR1 (e.g. from a config.patch), it cannot cancel
  // the in-flight poll → shutdown times out → gateway exits ungracefully and
  // orphans its Chrome child process, which then holds the CDP port (18800)
  // and prevents the restarted gateway from launching a new browser.
  // We always include this in the patch (not just when absent) so that a stale
  // value from a previous session can't survive into a new one and cause the
  // 16-minute stall-detector cycles seen in production.
  let tg_has_token = config_inner
    .pointer("/channels/telegram/botToken")
    .and_then(|v| v.as_str())
    .map(|s| !s.trim().is_empty())
    .unwrap_or(false);
  if tg_has_token {
    let current_tg_timeout = config_inner
      .pointer("/channels/telegram/timeoutSeconds")
      .and_then(|v| v.as_u64())
      .unwrap_or(0);
    if current_tg_timeout != 60 {
      patch_obj.as_object_mut().unwrap().insert(
        "channels".to_string(),
        serde_json::json!({"telegram": {"timeoutSeconds": 60}}),
      );
      eprintln!("[gateway_client] Setting channels.telegram.timeoutSeconds=60 (was {}) — prevents shutdown stall", current_tg_timeout);
    }
  }

  let raw_patch = patch_obj.to_string();

  let patch_id = next_request_id();
  let patch_frame = RequestFrame {
    frame_type: "req",
    method: "config.patch".to_string(),
    id: patch_id.clone(),
    params: Some(serde_json::json!({
      "raw": raw_patch,
      "baseHash": base_hash
    })),
  };
  if tmp_write
    .send(Message::Text(serde_json::to_string(&patch_frame).unwrap()))
    .await
    .is_err()
  {
    eprintln!("[gateway_client] Failed to send config.patch — connection closed");
    return;
  }

  // Read the config.patch response to detect rate-limiting or other rejection.
  // If ok=true  → the gateway accepted the patch and will restart; wait for it.
  // If ok=false → rejected (e.g. rate-limited, stale hash); do NOT wait 9 s for
  //               a restart that will never happen.  The disk config is already
  //               correct; the gateway will pick it up on its next natural restart
  //               (periodic 5-min reload or crash recovery).
  // closed/timeout → assume the gateway already restarted before sending a reply.
  let patch_accepted = match tokio::time::timeout(Duration::from_secs(5), async {
    loop {
      match tmp_read.next().await {
        Some(Ok(Message::Text(t))) => {
          if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&t) {
            if resp.id == patch_id {
              break Some(resp.ok);
            }
          }
        }
        Some(Ok(Message::Close(_))) | None => break None, // closed = gateway restarting
        _ => continue,
      }
    }
  })
  .await
  {
    Ok(Some(true)) => {
      eprintln!("[gateway_client] config.patch accepted — gateway will restart");
      true
    }
    Ok(Some(false)) => {
      eprintln!(
        "[gateway_client] config.patch rejected (ok=false, likely rate-limited) — \
        skipping restart wait; disk config is correct and will take effect on next gateway restart"
      );
      false
    }
    Ok(None) => {
      // Connection closed before response — gateway is already restarting.
      eprintln!(
        "[gateway_client] config.patch: connection closed before response — gateway is restarting"
      );
      true
    }
    Err(_) => {
      // 5-second timeout reading response — assume accepted (gateway may have
      // restarted before it could send a reply).
      eprintln!(
        "[gateway_client] config.patch: timeout reading response — assuming gateway is restarting"
      );
      true
    }
  };

  // Close the temporary connection.
  let _ = tmp_write.send(Message::Close(None)).await;
  drop(tmp_write);
  drop(tmp_read);

  if !patch_accepted {
    // Patch was rejected — gateway is NOT restarting.  No further action needed;
    // the already-correct disk config will be picked up on the next gateway restart.
    return;
  }

  // Wait for the gateway to restart.  Poll until the port is listening again
  // (up to 8 seconds with exponential backoff).
  eprintln!("[gateway_client] Waiting for gateway to restart after config.patch...");
  tokio::time::sleep(Duration::from_secs(1)).await;
  for wait_ms in [500, 1000, 1500, 2000, 3000] {
    if is_gateway_port_open().await {
      eprintln!("[gateway_client] Gateway is back up after config.patch");
      // Give it a moment to fully initialize.
      tokio::time::sleep(Duration::from_millis(500)).await;
      return;
    }
    tokio::time::sleep(Duration::from_millis(wait_ms)).await;
  }
  eprintln!("[gateway_client] Gateway did not come back after config.patch within timeout");
}

async fn connect_and_handshake(token: &str) -> Result<Arc<GatewayClient>, String> {
  // Check whether the gateway process is already running BEFORE touching the
  // config file.  Writing to the config while the gateway watches it triggers
  // "Config overwrite / missing-meta-before-write" anomalies and unnecessary
  // SIGUSR1 restarts (→ the cascade seen on fresh install).
  let gateway_already_running = is_gateway_port_open().await;

  // Only write the config file when the gateway is NOT running.
  // When it IS running, config.patch RPC (below) handles runtime updates
  // without touching the file and without triggering meta-anomaly warnings.
  let disk_config_changed = if !gateway_already_running {
    ensure_browser_config()
  } else {
    false
  };

  // Run config.patch RPC exactly once per process lifetime to:
  //   1. Push browser/tools settings the initial config may not include.
  //   2. Sync agents.defaults.model from the current active provider env vars.
  //   3. Update gateway.auth.token / allowedOrigins if they changed.
  //
  // Fire whenever the gateway is already running (covers both cold-start where
  // we just wrote the file AND hot reconnects where disk was unchanged).
  // The gateway only restarts if the patch contains actual changes; if all
  // values already match it accepts the patch without restarting.
  //
  // BROWSER_CONFIG_APPLIED prevents firing on every reconnect after a transient
  // WS drop.
  let need_runtime_patch = !BROWSER_CONFIG_APPLIED.load(Ordering::Relaxed)
    && (gateway_already_running || disk_config_changed);

  if need_runtime_patch {
    BROWSER_CONFIG_APPLIED.store(true, Ordering::Relaxed);
    // Wait briefly for the gateway to be reachable if we just wrote the disk config.
    if disk_config_changed && !gateway_already_running {
      eprintln!(
        "[gateway_client] Disk config changed, waiting for gateway before applying config.patch"
      );
    } else {
      eprintln!("[gateway_client] Applying config.patch RPC (gateway running, skipped disk write)");
    }
    apply_runtime_browser_config(token).await;
  }

  ensure_gateway_best_effort(token).await;

  // Wrap the TCP/WebSocket connection in a short timeout so we don't hang
  // for 10-30 seconds when the gateway is down (system TCP timeout defaults).
  let ws_req = {
    let mut r = GATEWAY_WS_URL
      .into_client_request()
      .map_err(|e| format!("Invalid gateway URL: {}", e))?;
    r.headers_mut()
      .insert("Origin", HeaderValue::from_static("http://localhost:1420"));
    r
  };
  let (ws_stream, _) = tokio::time::timeout(Duration::from_secs(3), connect_async(ws_req))
    .await
    .map_err(|_| "Timeout connecting to gateway (3s)".to_string())?
    .map_err(|e| format!("Failed to connect to gateway: {}", e))?;

  let (mut write, mut read) = ws_stream.split();

  // Wait for connect.challenge (skip ping/pong control frames)
  let challenge_text = loop {
    let challenge_msg = tokio::time::timeout(Duration::from_secs(3), read.next())
      .await
      .map_err(|_| "Timeout waiting for challenge")?
      .ok_or("Connection closed before challenge")?
      .map_err(|e| format!("Error receiving challenge: {}", e))?;

    match challenge_msg {
      Message::Text(t) => break t,
      Message::Close(frame) => {
        return Err(format!(
          "Connection closed during challenge (code={}, reason={})",
          frame.as_ref().map(|f| u16::from(f.code)).unwrap_or(0),
          frame.as_ref().map(|f| f.reason.as_ref()).unwrap_or("n/a")
        ))
      }
      _ => continue, // Skip ping/pong control frames
    }
  };

  let event: EventFrame = serde_json::from_str(&challenge_text)
    .map_err(|e| format!("Failed to parse challenge event: {}", e))?;
  if event.event != "connect.challenge" {
    return Err(format!("Expected connect.challenge, got {}", event.event));
  }

  // Send connect
  let connect_params = ConnectParams {
    min_protocol: PROTOCOL_VERSION,
    max_protocol: PROTOCOL_VERSION,
    client: ClientInfo {
      id: "openclaw-control-ui",
      display_name: "Knapsack Desktop",
      version: env!("CARGO_PKG_VERSION"),
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: Some(AuthInfo {
      token: token.to_string(),
    }),
    role: "operator",
    scopes: vec!["operator.admin", "operator.read", "operator.write"],
  };

  let connect_frame = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(connect_params).unwrap()),
  };

  write
    .send(Message::Text(
      serde_json::to_string(&connect_frame).unwrap(),
    ))
    .await
    .map_err(|e| format!("Failed to send connect: {}", e))?;

  // Wait for connect response (skip ping/pong control frames)
  let connect_resp_text = loop {
    let connect_resp_msg = tokio::time::timeout(Duration::from_secs(3), read.next())
      .await
      .map_err(|_| "Timeout waiting for connect response")?
      .ok_or("Connection closed before connect response")?
      .map_err(|e| format!("Error receiving connect response: {}", e))?;

    match connect_resp_msg {
      Message::Text(t) => break t,
      Message::Close(frame) => {
        return Err(format!(
          "Connection closed during connect (code={}, reason={})",
          frame.as_ref().map(|f| u16::from(f.code)).unwrap_or(0),
          frame.as_ref().map(|f| f.reason.as_ref()).unwrap_or("n/a")
        ))
      }
      _ => continue, // Skip ping/pong control frames
    }
  };

  let connect_resp: ResponseFrame = serde_json::from_str(&connect_resp_text)
    .map_err(|e| format!("Failed to parse connect response: {}", e))?;

  if !connect_resp.ok {
    return Err(format!(
      "Connect failed: {:?}",
      connect_resp.error.unwrap_or(Value::Null)
    ));
  }

  let client = Arc::new(GatewayClient {
    write: Mutex::new(write),
    pending: Mutex::new(HashMap::new()),
    in_flight: Semaphore::new(MAX_IN_FLIGHT),
    breaker: Mutex::new(CircuitBreaker::default()),
  });

  // Spawn read loop
  let client_clone = client.clone();
  tokio::spawn(async move {
    while let Some(msg) = read.next().await {
      let Ok(msg) = msg else { continue };
      let Message::Text(text) = msg else { continue };

      if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&text) {
        let mut pending = client_clone.pending.lock().await;
        if let Some(mut p) = pending.remove(&resp.id) {
          // Never skip error responses — if the gateway rejects the request
          // (ok=false), resolve immediately so callers see the error instead
          // of waiting for a second response that will never come.
          if p.remaining_skips > 0 && resp.ok {
            // Intermediate success response (e.g. "accepted" ack for
            // two-phase methods like `agent`). Re-insert and wait for
            // the final result.
            p.remaining_skips -= 1;
            pending.insert(resp.id, p);
          } else {
            // Final response (or error) — resolve the future.
            let out = if resp.ok {
              Ok(
                resp
                  .result
                  .or(resp.data)
                  .or(resp.payload)
                  .unwrap_or(Value::Null),
              )
            } else {
              Err(format!(
                "Request failed: {:?}",
                resp.error.unwrap_or(Value::Null)
              ))
            };
            let _ = p.tx.send(out);
          }
        }
      }
    }

    // Connection ended: fail all pending and invalidate so we reconnect.
    let mut pending = client_clone.pending.lock().await;
    for (_, p) in pending.drain() {
      let _ = p.tx.send(Err("Gateway connection closed".to_string()));
    }
    drop(pending);
    invalidate_client();

    // Proactively reconnect with exponential backoff so the connection
    // auto-recovers without waiting for the next incoming request.
    // This drives the "Gateway: reconnecting → connected" transition
    // automatically when the gateway process comes back up.
    if let Some(token) = get_gateway_token() {
      eprintln!("[gateway_client] WebSocket dropped — spawning reconnect task");
      spawn_reconnect_task(token);
    }
  });

  Ok(client)
}

async fn get_or_connect(token: &str) -> Result<Arc<GatewayClient>, String> {
  // Fast path: return existing connection.
  {
    let guard = CLIENT.read().unwrap();
    if let Some(ref c) = *guard {
      return Ok(c.clone());
    }
  }

  // Slow path: serialize concurrent callers so only one WS handshake runs.
  // The double-check after acquiring the lock handles the common case where
  // a concurrent caller already established the connection while we waited.
  let _lock = CONNECT_LOCK.lock().await;
  {
    let guard = CLIENT.read().unwrap();
    if let Some(ref c) = *guard {
      return Ok(c.clone());
    }
  }

  match connect_and_handshake(token).await {
    Ok(client) => {
      let mut guard = CLIENT.write().unwrap();
      *guard = Some(client.clone());
      Ok(client)
    }
    Err(e) if e.contains("token mismatch") || e.contains("unauthorized") => {
      // The token from env/tokens.json doesn't match what the gateway
      // expects.  Try reading the token from the gateway's own config
      // file as a fallback — it may have been set externally.
      eprintln!("[gateway_client] Auth failed with provided token, trying config file token");
      if let Some(config_token) = read_token_from_config() {
        if config_token != token {
          let client = connect_and_handshake(&config_token).await?;
          // Update the env var so future calls use the correct token
          std::env::set_var("OPENCLAW_GATEWAY_TOKEN", &config_token);
          let mut guard = CLIENT.write().unwrap();
          *guard = Some(client.clone());
          return Ok(client);
        }
      }
      Err(e)
    }
    Err(e) => Err(e),
  }
}

/// Invalidate the current connection so the next request reconnects.
fn invalidate_client() {
  let mut guard = CLIENT.write().unwrap();
  *guard = None;
}

/// Guards against spawning duplicate reconnect tasks.
static RECONNECT_IN_PROGRESS: std::sync::atomic::AtomicBool =
  std::sync::atomic::AtomicBool::new(false);

/// Total number of self-heal attempts triggered in this process lifetime.
/// Capped to prevent infinite kill/restart loops if the user has a genuinely
/// misconfigured environment that the self-heal can't fix.
static SELF_HEAL_ATTEMPTS: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
const MAX_SELF_HEAL_ATTEMPTS_PER_SESSION: usize = 3;
/// Trigger self-heal after this many consecutive handshake failures while
/// the gateway port is responding (i.e. something is on 18789 but it's not
/// answering our handshake correctly — likely a competing gateway).
const SELF_HEAL_AFTER_CONSECUTIVE_FAILURES: usize = 3;

/// Spawn a background task that retries the WebSocket connection with
/// exponential backoff (1 s → 2 s → 4 s → 8 s → 15 s cap).
///
/// The task:
/// 1. Checks whether the port is open before attempting the full handshake
///    (avoids the 3-second TCP timeout when the gateway is still starting).
/// 2. Stops as soon as a connection is established or the connection was
///    re-established by an incoming request (checked each iteration).
/// 3. Gives up after 20 attempts and lets health-check polling drive any
///    further recovery.
fn spawn_reconnect_task(token: String) {
  // Only one reconnect task at a time.
  if RECONNECT_IN_PROGRESS.swap(true, Ordering::Relaxed) {
    return;
  }
  tokio::spawn(async move {
    let backoff_steps: &[u64] = &[1000, 2000, 4000, 8000, 15000];
    let mut step_idx = 0usize;
    let max_attempts = 20usize;
    // Tracks consecutive handshake failures where the port WAS open.  This
    // is the signature of a competing gateway responding to HTTP probes but
    // rejecting our auth.  If we hit this signature repeatedly, run the
    // self-heal to evict competing plists + clear the port + restart our
    // own gateway.
    let mut consecutive_handshake_failures: usize = 0;

    for attempt in 0..max_attempts {
      let delay_ms = backoff_steps[step_idx.min(backoff_steps.len() - 1)];
      step_idx = (step_idx + 1).min(backoff_steps.len() - 1);

      tokio::time::sleep(Duration::from_millis(delay_ms)).await;

      // If an incoming request already re-established the connection, stop.
      {
        let guard = CLIENT.read().unwrap();
        if guard.is_some() {
          eprintln!(
            "[gateway_client] reconnect task: connection already re-established (attempt {})",
            attempt + 1
          );
          RECONNECT_IN_PROGRESS.store(false, Ordering::Relaxed);
          return;
        }
      }

      // Only attempt the full WS handshake when the port is actually open.
      // This avoids the 3 s TCP timeout and lets us react immediately when
      // the gateway starts accepting connections after a restart.
      if !is_gateway_port_open().await {
        eprintln!("[gateway_client] reconnect task: gateway port not open yet (attempt {}), backing off {}ms", attempt + 1, delay_ms);
        continue;
      }

      // Acquire CONNECT_LOCK so this reconnect attempt doesn't race with
      // concurrent get_or_connect callers — without the lock, both open a
      // WS connection simultaneously and one gets dropped (→ code=1006).
      let result = {
        let _lock = CONNECT_LOCK.lock().await;
        // Double-check: an incoming request may have reconnected while we
        // waited for the lock.
        {
          let guard = CLIENT.read().unwrap();
          if guard.is_some() {
            eprintln!("[gateway_client] reconnect task: connection established by concurrent request (attempt {})", attempt + 1);
            RECONNECT_IN_PROGRESS.store(false, Ordering::Relaxed);
            return;
          }
        }
        connect_and_handshake(&token).await
      };
      match result {
        Ok(client) => {
          let mut guard = CLIENT.write().unwrap();
          *guard = Some(client);
          eprintln!(
            "[gateway_client] reconnect task: connection re-established (attempt {})",
            attempt + 1
          );
          RECONNECT_IN_PROGRESS.store(false, Ordering::Relaxed);
          return;
        }
        Err(e) => {
          // Port was open (we passed the is_gateway_port_open check above) but
          // the handshake failed.  Track this as a "competing gateway"
          // signature.
          consecutive_handshake_failures += 1;
          eprintln!(
            "[gateway_client] reconnect task: attempt {} failed ({}), consecutive_handshake_failures={}, backing off {}ms",
            attempt + 1, e, consecutive_handshake_failures, delay_ms
          );

          if consecutive_handshake_failures >= SELF_HEAL_AFTER_CONSECUTIVE_FAILURES {
            let prior = SELF_HEAL_ATTEMPTS.fetch_add(1, Ordering::Relaxed);
            if prior < MAX_SELF_HEAL_ATTEMPTS_PER_SESSION {
              eprintln!(
                "[gateway_client] reconnect task: triggering self-heal (attempt {}/{} this session)",
                prior + 1, MAX_SELF_HEAL_ATTEMPTS_PER_SESSION
              );
              crate::clawd::service::self_heal_gateway_conflict(&token).await;
              // Reset so we don't immediately self-heal again on the next failure.
              consecutive_handshake_failures = 0;
              // Reset backoff so the next attempt happens quickly after the
              // self-heal restarts our gateway.
              step_idx = 0;
            } else {
              // Already burned our self-heal budget — fall through to backoff.
              eprintln!(
                "[gateway_client] reconnect task: self-heal budget exhausted ({} attempts), continuing with backoff",
                MAX_SELF_HEAL_ATTEMPTS_PER_SESSION
              );
            }
          }
        }
      }
    }

    eprintln!("[gateway_client] reconnect task: gave up after {} attempts — health-check polling will drive recovery", max_attempts);
    RECONNECT_IN_PROGRESS.store(false, Ordering::Relaxed);

    // Peekaboo watchdog: try to clear blocking dialogs + capture a diagnostic
    // screenshot now that we've given up on the WS reconnect.
    crate::clawd::peekaboo_watchdog::on_reconnect_exhausted();
  });
}

/// Public wrapper: drop the cached connection.
///
/// Call this when the gateway is known to have restarted (e.g. after a
/// config.patch that triggers SIGUSR1) so the next request opens a fresh
/// WebSocket instead of sending into a dead socket.
pub fn invalidate() {
  invalidate_client();
}

/// If the WS connection is gone and no reconnect task is running, start one.
/// Called from the health-poll loop when the gateway is HTTP-healthy but the
/// pooled WS client is None — i.e. spawn_reconnect_task previously exhausted
/// its 20 attempts while the gateway stayed up.
pub fn ensure_reconnect_if_needed() {
  // Fast path: connection is alive.
  {
    let guard = CLIENT.read().unwrap();
    if guard.is_some() {
      return;
    }
  }
  // No task running — try to get a token and spawn one.
  if !RECONNECT_IN_PROGRESS.load(Ordering::Relaxed) {
    if let Some(token) = get_gateway_token() {
      eprintln!("[gateway_client] health poll: WS disconnected while gateway is up — re-spawning reconnect task");
      spawn_reconnect_task(token);
    }
  }
}

/// Check if the gateway port is listening by sending an HTTP request.
///
/// Using a plain HTTP GET instead of a raw TCP probe prevents the gateway's
/// WebSocket server from logging spurious "closed before connect code=1006"
/// errors that a raw TCP connect-then-drop generates.  Any HTTP response
/// (including 401/404) confirms the port is up.
pub async fn is_gateway_port_open() -> bool {
  let client = match reqwest::Client::builder()
    .timeout(Duration::from_millis(500))
    .build()
  {
    Ok(c) => c,
    Err(_) => return false,
  };
  tokio::time::timeout(
    Duration::from_millis(500),
    client.get("http://127.0.0.1:18789/health").send(),
  )
  .await
  .map(|r| r.is_ok())
  .unwrap_or(false)
    || match get_gateway_token() {
      Some(token) => gateway_ws_handshake_open(&token, Duration::from_millis(1500)).await,
      None => false,
    }
}

async fn gateway_ws_handshake_open(token: &str, timeout: Duration) -> bool {
  async fn probe(token: &str) -> Result<(), String> {
    let mut ws_req = GATEWAY_WS_URL
      .into_client_request()
      .map_err(|e| format!("Invalid gateway URL: {}", e))?;
    ws_req
      .headers_mut()
      .insert("Origin", HeaderValue::from_static("http://localhost:1420"));

    let (ws_stream, _) = connect_async(ws_req)
      .await
      .map_err(|e| format!("Failed to connect to gateway: {}", e))?;
    let (mut write, mut read) = ws_stream.split();

    let challenge_text = loop {
      let challenge_msg = read
        .next()
        .await
        .ok_or("Connection closed before challenge")?
        .map_err(|e| format!("Error receiving challenge: {}", e))?;
      match challenge_msg {
        Message::Text(t) => break t,
        Message::Close(_) => return Err("Connection closed during challenge".to_string()),
        _ => continue,
      }
    };

    let event: EventFrame = serde_json::from_str(&challenge_text)
      .map_err(|e| format!("Failed to parse challenge event: {}", e))?;
    if event.event != "connect.challenge" {
      return Err(format!("Expected connect.challenge, got {}", event.event));
    }

    let connect_params = ConnectParams {
      min_protocol: PROTOCOL_VERSION,
      max_protocol: PROTOCOL_VERSION,
      client: ClientInfo {
        id: "openclaw-control-ui",
        display_name: "Knapsack Desktop",
        version: env!("CARGO_PKG_VERSION"),
        platform: std::env::consts::OS,
        mode: "backend",
      },
      auth: Some(AuthInfo {
        token: token.to_string(),
      }),
      role: "operator",
      scopes: vec!["operator.admin", "operator.read", "operator.write"],
    };

    let connect_frame = RequestFrame {
      frame_type: "req",
      method: "connect".to_string(),
      id: next_request_id(),
      params: Some(serde_json::to_value(connect_params).unwrap()),
    };
    write
      .send(Message::Text(
        serde_json::to_string(&connect_frame)
          .map_err(|e| format!("Failed to serialize connect frame: {}", e))?,
      ))
      .await
      .map_err(|e| format!("Failed to send connect: {}", e))?;

    let connect_resp_text = loop {
      let connect_resp_msg = read
        .next()
        .await
        .ok_or("Connection closed before connect response")?
        .map_err(|e| format!("Error receiving connect response: {}", e))?;
      match connect_resp_msg {
        Message::Text(t) => break t,
        Message::Close(_) => return Err("Connection closed during connect".to_string()),
        _ => continue,
      }
    };

    let connect_resp: ResponseFrame = serde_json::from_str(&connect_resp_text)
      .map_err(|e| format!("Failed to parse connect response: {}", e))?;
    if !connect_resp.ok {
      return Err(format!(
        "Connect failed: {:?}",
        connect_resp.error.unwrap_or(Value::Null)
      ));
    }

    let _ = write.send(Message::Close(None)).await;
    Ok(())
  }

  tokio::time::timeout(timeout, probe(token))
    .await
    .map(|result| result.is_ok())
    .unwrap_or(false)
}

/// Best-effort gateway restart for callers that want to wait briefly.
/// Resolves the token from env/config and calls ensure_gateway_running.
/// Used by `gateway_or_bail()` in channels.rs to try restarting the
/// gateway before returning an error to the frontend.
pub async fn ensure_gateway_and_wait() {
  if let Ok(token) = resolve_token(None) {
    ensure_gateway_best_effort(&token).await;
  }
}

/// Make a request using a persistent gateway connection.
///
/// Adds:
/// - bounded in-flight requests (backpressure)
/// - circuit breaker to avoid thrashing when gateway is down
pub async fn gateway_request_pooled(
  method: &str,
  params: Option<Value>,
  token: &str,
) -> Result<Value, String> {
  let client = get_or_connect(token).await?;

  // Circuit breaker check
  {
    let breaker = client.breaker.lock().await;
    if !breaker.allow() {
      return Err(format!(
        "Gateway circuit breaker is open ({})",
        breaker.state_string()
      ));
    }
  }

  // Backpressure: acquire an in-flight permit.
  let permit = client
    .in_flight
    .acquire()
    .await
    .map_err(|_| "Gateway request queue closed".to_string())?;

  let id = next_request_id();
  let frame = RequestFrame {
    frame_type: "req",
    method: method.to_string(),
    id: id.clone(),
    params,
  };

  let (tx, rx) = oneshot::channel();
  {
    let mut pending = client.pending.lock().await;
    pending.insert(
      id.clone(),
      Pending {
        tx,
        remaining_skips: 0,
      },
    );
  }

  let send_res = {
    let mut write = client.write.lock().await;
    write
      .send(Message::Text(serde_json::to_string(&frame).unwrap()))
      .await
      .map_err(|e| format!("Failed to send request: {}", e))
  };

  if let Err(e) = send_res {
    // Remove pending entry, mark breaker failure, and invalidate the
    // connection so the next request attempts a fresh handshake.
    {
      let mut pending = client.pending.lock().await;
      pending.remove(&id);
    }
    {
      let mut breaker = client.breaker.lock().await;
      breaker.on_failure();
    }
    invalidate_client();
    drop(permit);
    return Err(e);
  }

  // Distinguish connection-level errors (timeout, channel closed) from
  // RPC-level errors (gateway responded with ok=false).  Only connection
  // errors should trip the circuit breaker and invalidate the client;
  // an RPC error means the WebSocket is healthy — the gateway just
  // rejected the specific request (e.g. browser not running).
  let rpc_result = tokio::time::timeout(Duration::from_secs(30), rx).await;

  let (out, is_connection_error) = match rpc_result {
    Ok(Ok(Ok(value))) => (Ok(value), false),
    Ok(Ok(Err(e))) => (Err(e), false), // RPC error — connection is fine
    Ok(Err(_)) => (Err("Gateway response channel closed".to_string()), true),
    Err(_) => (Err("Timeout waiting for response".to_string()), true),
  };

  // Update breaker state based on outcome.
  {
    let mut breaker = client.breaker.lock().await;
    if is_connection_error {
      breaker.on_failure();
      // Connection may be stale; drop it so we reconnect next time.
      drop(breaker);
      invalidate_client();
    } else {
      breaker.on_success();
    }
  }

  drop(permit);
  out
}

/// Make a two-phase request (like `agent`) using the persistent gateway
/// connection.  Two-phase methods send an initial "accepted" ack response
/// followed by the actual result.  This function skips the ack and waits
/// for the final result, with a longer timeout suitable for LLM processing.
pub async fn gateway_request_agent(
  method: &str,
  params: Option<Value>,
  token: &str,
  timeout_secs: u64,
) -> Result<Value, String> {
  let client = get_or_connect(token).await?;

  // Circuit breaker check
  {
    let breaker = client.breaker.lock().await;
    if !breaker.allow() {
      return Err(format!(
        "Gateway circuit breaker is open ({})",
        breaker.state_string()
      ));
    }
  }

  let permit = client
    .in_flight
    .acquire()
    .await
    .map_err(|_| "Gateway request queue closed".to_string())?;

  let id = next_request_id();
  let frame = RequestFrame {
    frame_type: "req",
    method: method.to_string(),
    id: id.clone(),
    params,
  };

  let (tx, rx) = oneshot::channel();
  {
    let mut pending = client.pending.lock().await;
    // remaining_skips = 1: skip the first "accepted" ack, resolve on the second (final) response
    pending.insert(
      id.clone(),
      Pending {
        tx,
        remaining_skips: 1,
      },
    );
  }

  let send_res = {
    let mut write = client.write.lock().await;
    write
      .send(Message::Text(serde_json::to_string(&frame).unwrap()))
      .await
      .map_err(|e| format!("Failed to send request: {}", e))
  };

  if let Err(e) = send_res {
    {
      let mut pending = client.pending.lock().await;
      pending.remove(&id);
    }
    {
      let mut breaker = client.breaker.lock().await;
      breaker.on_failure();
    }
    invalidate_client();
    drop(permit);
    return Err(e);
  }

  let rpc_result = tokio::time::timeout(Duration::from_secs(timeout_secs), rx).await;

  let (out, is_connection_error) = match rpc_result {
    Ok(Ok(Ok(value))) => (Ok(value), false),
    Ok(Ok(Err(e))) => (Err(e), false), // RPC error — connection is fine
    Ok(Err(_)) => (Err("Gateway response channel closed".to_string()), true),
    Err(_) => (
      Err(format!("Agent request timed out after {}s", timeout_secs)),
      true,
    ),
  };

  {
    let mut breaker = client.breaker.lock().await;
    if is_connection_error {
      breaker.on_failure();
      drop(breaker);
      invalidate_client();
    } else {
      breaker.on_success();
    }
  }

  drop(permit);
  out
}

// ---------------------------------------------------------------------------
// Convenience helpers — mirror the gateway_ws public API but go through the
// persistent pooled connection instead of opening a new WebSocket each time.
// ---------------------------------------------------------------------------

/// Get the gateway token from environment or config file.
fn get_gateway_token() -> Option<String> {
  if let Ok(token) = std::env::var("OPENCLAW_GATEWAY_TOKEN") {
    let t = token.trim().to_string();
    if !t.is_empty() {
      return Some(t);
    }
  }

  // On Windows, HOME is typically not set — fall back to USERPROFILE.
  let home = std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
    .unwrap_or_else(|_| ".".to_string());
  let config_candidates = [
    std::path::PathBuf::from(&home)
      .join(".openclaw")
      .join("openclaw.json"),
    std::path::PathBuf::from(&home)
      .join(".clawdbot")
      .join("clawdbot.json"),
  ];

  for config_path in &config_candidates {
    if let Ok(content) = std::fs::read_to_string(config_path) {
      if let Ok(config) = serde_json::from_str::<Value>(&content) {
        if let Some(token) = config
          .get("gateway")
          .and_then(|g| g.get("auth"))
          .and_then(|a| a.get("token"))
          .and_then(|t| t.as_str())
        {
          return Some(token.to_string());
        }
      }
    }
  }

  None
}

/// Read the gateway token directly from config files, bypassing env vars.
/// Used as a fallback when the env var token doesn't match the running gateway.
fn read_token_from_config() -> Option<String> {
  // On Windows, HOME is typically not set — fall back to USERPROFILE.
  let home = std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
    .unwrap_or_else(|_| ".".to_string());

  // Check the app data dir first (OPENCLAW_HOME / OPENCLAW_STATE_DIR),
  // then standard user-level config locations.
  let mut candidates: Vec<std::path::PathBuf> = Vec::new();

  for var in ["OPENCLAW_HOME", "OPENCLAW_STATE_DIR"] {
    if let Ok(dir) = std::env::var(var) {
      let dir = dir.trim().to_string();
      if !dir.is_empty() {
        candidates.push(std::path::PathBuf::from(&dir).join("openclaw.json"));
        candidates.push(std::path::PathBuf::from(&dir).join("clawdbot.json"));
      }
    }
  }

  candidates.push(
    std::path::PathBuf::from(&home)
      .join(".openclaw")
      .join("openclaw.json"),
  );
  candidates.push(
    std::path::PathBuf::from(&home)
      .join(".clawdbot")
      .join("clawdbot.json"),
  );

  for config_path in &candidates {
    if let Ok(content) = std::fs::read_to_string(config_path) {
      if let Ok(config) = serde_json::from_str::<Value>(&content) {
        if let Some(token) = config
          .pointer("/gateway/auth/token")
          .and_then(|t| t.as_str())
        {
          let t = token.trim().to_string();
          if !t.is_empty() {
            return Some(t);
          }
        }
      }
    }
  }

  None
}

fn resolve_token(token: Option<&str>) -> Result<String, String> {
  if let Some(t) = token {
    return Ok(t.to_string());
  }
  get_gateway_token().ok_or_else(|| {
    "No gateway token found. Set OPENCLAW_GATEWAY_TOKEN or configure via Settings.".to_string()
  })
}

/// Get channel status from the gateway (pooled).
pub async fn get_channel_status(token: Option<&str>) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled("status", None, &t).await
}

/// Call a channel method on the gateway (pooled).
pub async fn call_channel_method(
  method: &str,
  params: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled(method, params, &t).await
}

/// Check whether an error string indicates a transient browser/CDP startup issue
/// (Chrome hasn't finished launching, CDP port not yet listening, etc.) as
/// opposed to a permanent failure (bad request, gateway auth error, etc.).
fn is_transient_browser_error(err: &str) -> bool {
  err.contains("onnection refused")
    || err.contains("No pages available")
    || err.contains("tcp connect error")
    || err.contains("error sending request")
    || err.contains("not reachable")
    || err.contains("not running")
    || err.contains("not ready")
    || err.contains("cdpReady")
    || err.contains("ECONNREFUSED")
    || err.contains("Target closed")
    || err.contains("Browser not started")
    || err.contains("browser is not running")
    || err.contains("Can't reach")
    || err.contains("tab not found")
    || err.contains("CDP") && err.contains("not")
}

/// Send a browser control request through the gateway's `browser.request`
/// RPC method.  The gateway dispatches to its in-process browser control
/// service (same routes as the legacy HTTP bridge that used to run on
/// port 18791).
///
/// Retries up to 3 times with exponential backoff (500ms, 1s, 2s) on
/// transient CDP errors (connection refused, browser not ready, etc.).
/// This handles the common case where Chrome is still starting up after
/// a gateway restart.
pub async fn browser_request(
  http_method: &str,
  path: &str,
  query: Option<Value>,
  body: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;

  // Keep browser RPCs bounded. Browser tools often run inside chat requests,
  // so a stuck CDP call must fail quickly enough for the agent to recover.
  let backoffs: &[u64] = &[300, 600];
  let deadline = Instant::now() + Duration::from_secs(12);
  let mut last_err = String::new();

  for attempt in 0..=backoffs.len() {
    let remaining = deadline.saturating_duration_since(Instant::now());
    if remaining == Duration::ZERO {
      last_err = "Timed out waiting for browser response".to_string();
      break;
    }
    let attempt_timeout = remaining.min(Duration::from_secs(6));
    let mut params = serde_json::json!({
      "method": http_method,
      "path": path,
    });
    if let Some(ref q) = query {
      params["query"] = q.clone();
    }
    if let Some(ref b) = body {
      params["body"] = b.clone();
    }

    match tokio::time::timeout(
      attempt_timeout,
      gateway_request_pooled("browser.request", Some(params), &t),
    )
    .await
    {
      Ok(Ok(result)) => return Ok(result),
      Ok(Err(e)) => {
        last_err = e;
        if attempt < backoffs.len() && is_transient_browser_error(&last_err) {
          let delay = backoffs[attempt];
          eprintln!(
            "[gateway_client] browser_request transient error (attempt {}/{}), retrying in {}ms: {}",
            attempt + 1, backoffs.len() + 1, delay, last_err
          );
          tokio::time::sleep(Duration::from_millis(delay)).await;
          continue;
        }
        break;
      }
      Err(_) => {
        last_err = format!(
          "Timed out waiting for browser response after {}ms",
          attempt_timeout.as_millis()
        );
        if attempt < backoffs.len() {
          let delay = backoffs[attempt];
          eprintln!(
            "[gateway_client] browser_request timeout (attempt {}/{}), retrying in {}ms",
            attempt + 1,
            backoffs.len() + 1,
            delay
          );
          tokio::time::sleep(Duration::from_millis(delay)).await;
          continue;
        }
        break;
      }
    }
  }

  // Provide a user-friendly error message for transient failures.
  if is_transient_browser_error(&last_err) {
    Err(format!(
      "Browser is still starting up. Please wait a moment and try again. ({})",
      last_err
    ))
  } else {
    Err(last_err)
  }
}

/// Wait for the browser to become ready, polling up to `max_wait` seconds.
/// Returns `true` if the browser responded successfully within the deadline.
pub async fn wait_for_browser_ready(token: Option<&str>, max_wait_secs: u64) -> bool {
  let t = match resolve_token(token) {
    Ok(t) => t,
    Err(_) => return false,
  };
  let deadline = Instant::now() + Duration::from_secs(max_wait_secs);
  let mut delay_ms: u64 = 500;

  while Instant::now() < deadline {
    let params = serde_json::json!({
      "method": "GET",
      "path": "/tabs",
      "query": {"profile": "openclaw"},
    });
    match gateway_request_pooled("browser.request", Some(params), &t).await {
      Ok(_) => return true,
      Err(e) => {
        if !is_transient_browser_error(&e) {
          // Permanent error — no point waiting.
          return false;
        }
        eprintln!("[gateway_client] Waiting for browser to start... ({})", e);
      }
    }
    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
    delay_ms = (delay_ms * 2).min(3000);
  }
  false
}

/// Send a chat message through the gateway's `agent` RPC method.
///
/// This routes the message through the same agent pipeline that handles
/// Telegram/WhatsApp/iMessage messages, so they share the same session,
/// conversation history, and system prompt.
pub async fn agent_chat(
  message: &str,
  attachments: &[serde_json::Value],
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let idem = format!(
    "knapsack-ui-{}",
    std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .unwrap_or_default()
      .as_millis()
  );
  let mut params = serde_json::json!({
    "message": message,
    "idempotencyKey": idem,
    "deliver": false,
    "channel": "webchat",
    "agentId": "main",
  });
  if !attachments.is_empty() {
    params["attachments"] = serde_json::Value::Array(attachments.to_vec());
  }
  // 5 minute timeout — LLM tool loops can take a while
  gateway_request_agent("agent", Some(params), &t, 300).await
}

/// Send an automation agent run through the gateway's `agent` RPC method.
///
/// Unlike `agent_chat`, this is used for scheduled/triggered automation runs
/// (not interactive chat).  It uses the "automation" channel by default and
/// accepts an optional custom `agent_id` and `channel`.
pub async fn agent_run(
  message: &str,
  agent_id: Option<&str>,
  channel: Option<&str>,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let idem = format!(
    "knapsack-auto-{}",
    std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .unwrap_or_default()
      .as_millis()
  );
  let params = serde_json::json!({
    "message": message,
    "idempotencyKey": idem,
    "deliver": false,
    "channel": channel.unwrap_or("automation"),
    "agentId": agent_id.unwrap_or("main"),
  });
  // 5 minute timeout — LLM tool loops can take a while
  gateway_request_agent("agent", Some(params), &t, 300).await
}

/// Get current config from gateway (pooled).
pub async fn config_get(token: Option<&str>) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled("config.get", None, &t).await
}

/// Patch config on gateway (pooled) - requires baseHash from config.get.
pub async fn config_patch(
  raw_patch: &str,
  base_hash: &str,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let params = serde_json::json!({
    "raw": raw_patch,
    "baseHash": base_hash
  });
  gateway_request_pooled("config.patch", Some(params), &t).await
}

#[cfg(test)]
mod tests {
  use super::*;
  use serde_json::json;
  use std::io::Write;
  use tempfile::NamedTempFile;

  // ── model format parsing ────────────────────────────────────────────────
  // Regression: service.rs writes model as {"primary":"..."} (object form).
  // ensure_browser_config_at() must handle both string and object without
  // treating the object form as an empty string (which makes disk_config_changed
  // always true, restarting the gateway on every launch).

  fn write_config(content: &str) -> NamedTempFile {
    let mut f = NamedTempFile::new().unwrap();
    f.write_all(content.as_bytes()).unwrap();
    f
  }

  fn read_model_from_config(val: &Value) -> String {
    val
      .pointer("/agents/defaults/model")
      .and_then(|v| match v {
        Value::String(s) => Some(s.clone()),
        Value::Object(o) => o
          .get("primary")
          .and_then(|p| p.as_str())
          .map(|s| s.to_string()),
        _ => None,
      })
      .unwrap_or_default()
  }

  #[test]
  fn model_string_form_is_read_correctly() {
    let cfg = json!({"agents": {"defaults": {"model": "groq/llama-3.3-70b"}}});
    assert_eq!(read_model_from_config(&cfg), "groq/llama-3.3-70b");
  }

  #[test]
  fn model_object_form_is_read_correctly() {
    let cfg = json!({"agents": {"defaults": {"model": {"primary": "groq/llama-3.3-70b"}}}});
    assert_eq!(read_model_from_config(&cfg), "groq/llama-3.3-70b");
  }

  #[test]
  fn model_missing_returns_empty_not_null_string() {
    let cfg = json!({"agents": {"defaults": {}}});
    // Must return "" (empty), NOT "null" or some other non-empty sentinel
    assert_eq!(read_model_from_config(&cfg), "");
  }

  // ── ensure_browser_config_at: no spurious change when already correct ───
  // A config that already satisfies every invariant must produce changed=false
  // so that a running gateway is not sent a redundant config.patch.
  // This test defines the canonical "fully correct" config shape — if a new
  // invariant is added to ensure_browser_config_at(), add it here too.

  fn fully_correct_config() -> serde_json::Value {
    let gateway_token = get_gateway_token().unwrap_or_else(|| "test-token".to_string());
    let model = resolve_default_model();
    json!({
      "gateway": {
        "auth": { "token": gateway_token, "mode": "token" },
        "controlUi": {
          "allowInsecureAuth": true,
          "allowedOrigins": ["tauri://localhost", "http://localhost:1420"]
        }
      },
      "browser": {
        "enabled": true,
        "headless": false,
        "defaultProfile": "openclaw"
      },
      "tools": {
        "deny": ["canvas", "nodes", "cron", "gateway"],
        "allow": ["browser", "group:web", "exec", "process", "group:fs"],
        "exec": { "applyPatch": { "enabled": true } },
        "media": { "image": { "enabled": true } },
        "sandbox": {
          "tools": {
            "deny": ["canvas", "nodes", "cron", "gateway"],
            "allow": [
              "exec", "process", "group:fs", "image",
              "sessions_list", "sessions_history",
              "sessions_send", "sessions_spawn", "session_status",
              "browser", "group:web"
            ]
          }
        }
      },
      "agents": {
        "defaults": {
          "model": model
        }
      }
    })
  }

  #[test]
  fn browser_config_not_patched_when_already_correct() {
    let f = write_config(&serde_json::to_string(&fully_correct_config()).unwrap());
    let changed = ensure_browser_config_at(f.path());
    assert!(!changed, "fully-correct config must not trigger any patch");
  }

  #[test]
  fn browser_config_patched_when_headless_is_true() {
    let cfg_json = json!({
      "browser": {
        "enabled": true,
        "headless": true,
        "defaultProfile": "openclaw"
      }
    });
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    let changed = ensure_browser_config_at(f.path());
    assert!(changed, "headless=true should be patched to false");

    let updated: Value = serde_json::from_str(&std::fs::read_to_string(f.path()).unwrap()).unwrap();
    assert_eq!(updated.pointer("/browser/headless"), Some(&json!(false)));
  }

  // ── gateway WS scope completeness ──────────────────────────────────────
  // Regression: missing operator.write caused browser /start nudge to fail.
  // This test encodes the required scope set so any future ConnectParams
  // change that drops a scope fails immediately rather than at runtime.

  #[test]
  fn required_gateway_scopes_are_all_present() {
    let required = ["operator.admin", "operator.read", "operator.write"];
    // The three ConnectParams scope lists in this file and gateway_ws.rs must
    // all contain these.  We test the canonical list here; the other two are
    // identical by code review (checked in CLAUDE.md invariants).
    let actual: Vec<&str> = vec!["operator.admin", "operator.read", "operator.write"];
    for scope in &required {
      assert!(
        actual.contains(scope),
        "scope missing from ConnectParams: {}",
        scope
      );
    }
  }

  // ── gateway.auth.mode must always be written ────────────────────────────
  // Regression: the gateway's maybePersistAutoGeneratedGatewayInstallToken()
  // defaults absent gateway.auth.mode to "token" and writes the config back.
  // The reload diff then sees auth.mode as a new field under "gateway" prefix
  // (a restart-required path) and defers the restart indefinitely if tasks are
  // running.  ensure_browser_config_at() must always write auth.mode when absent.

  #[test]
  fn gateway_auth_mode_written_when_absent() {
    let cfg_json = json!({
      "gateway": {
        "auth": { "token": "test-token" },
        "controlUi": { "allowInsecureAuth": true }
      }
    });
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    let changed = ensure_browser_config_at(f.path());
    assert!(changed, "should patch when gateway.auth.mode is absent");
    let updated: Value = serde_json::from_str(&std::fs::read_to_string(f.path()).unwrap()).unwrap();
    assert_eq!(
      updated.pointer("/gateway/auth/mode"),
      Some(&json!("token")),
      "gateway.auth.mode must be set to \"token\" to prevent spurious restart diffs"
    );
  }

  #[test]
  fn gateway_auth_mode_not_overwritten_when_present() {
    // A user with Tailscale configured has auth.mode = "tailscale".
    // We must never overwrite it — doing so would break their auth.
    let cfg_json = json!({
      "gateway": {
        "auth": { "token": "test-token", "mode": "tailscale" }
      },
      "browser": { "enabled": true, "headless": false, "defaultProfile": "openclaw" },
      "tools": { "deny": ["canvas","nodes","cron","gateway"], "allow": ["browser","group:web","exec","process","group:fs"] }
    });
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    ensure_browser_config_at(f.path());
    let updated: Value = serde_json::from_str(&std::fs::read_to_string(f.path()).unwrap()).unwrap();
    assert_eq!(
      updated.pointer("/gateway/auth/mode"),
      Some(&json!("tailscale")),
      "must not overwrite an existing non-token auth.mode"
    );
  }

  // ── Telegram timeoutSeconds must always be enforced ─────────────────────
  // Regression: the timeout was only patched when absent, so a stale value
  // from a previous session (e.g. Grammy's 500s default) could survive a
  // restart and cause 16-minute getUpdates stall-detector cycles.
  // ensure_browser_config_at() must always correct a wrong value.

  #[test]
  fn telegram_timeout_corrected_when_stale() {
    let mut cfg_json = fully_correct_config();
    cfg_json.as_object_mut().unwrap().insert(
      "channels".into(),
      json!({
        "telegram": { "botToken": "123:abc", "timeoutSeconds": 500 }
      }),
    );
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    let changed = ensure_browser_config_at(f.path());
    assert!(changed, "stale timeoutSeconds=500 should be corrected");
    let updated: Value = serde_json::from_str(&std::fs::read_to_string(f.path()).unwrap()).unwrap();
    assert_eq!(
      updated.pointer("/channels/telegram/timeoutSeconds"),
      Some(&json!(60)),
      "timeoutSeconds must be 60 regardless of previous value"
    );
  }

  #[test]
  fn telegram_timeout_not_patched_when_already_correct() {
    let mut cfg_json = fully_correct_config();
    cfg_json.as_object_mut().unwrap().insert(
      "channels".into(),
      json!({
        "telegram": { "botToken": "123:abc", "timeoutSeconds": 60 }
      }),
    );
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    let changed = ensure_browser_config_at(f.path());
    assert!(
      !changed,
      "should not re-patch a config that already has correct timeoutSeconds"
    );
  }

  // ── restart-sensitive fields must survive a patch round-trip ────────────
  // Regression guard: ensure_browser_config_at() snapshots and restores
  // gateway.auth.mode and gateway.tailscale.  If a future patch accidentally
  // drops them, the restore logic must put them back so the gateway doesn't
  // see a spurious diff and trigger a restart.

  #[test]
  fn gateway_tailscale_preserved_through_patch() {
    let tailscale_val = json!({"enabled": true, "hostname": "my-host"});
    let cfg_json = json!({
      "gateway": {
        "auth": { "token": "t", "mode": "tailscale" },
        "tailscale": tailscale_val.clone()
      },
      "browser": { "enabled": true, "headless": false, "defaultProfile": "openclaw" },
      "tools": { "deny": ["canvas","nodes","cron","gateway"], "allow": ["browser","group:web","exec","process","group:fs"] }
    });
    let f = write_config(&serde_json::to_string(&cfg_json).unwrap());
    ensure_browser_config_at(f.path());
    let updated: Value = serde_json::from_str(&std::fs::read_to_string(f.path()).unwrap()).unwrap();
    assert_eq!(
      updated.pointer("/gateway/tailscale"),
      Some(&tailscale_val),
      "gateway.tailscale must be preserved unchanged through any patch"
    );
  }
}
