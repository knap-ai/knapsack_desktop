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
use tokio::sync::{Mutex, Semaphore, oneshot};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 3;
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
  let home = match std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
  {
    Ok(h) => h,
    Err(_) => return false,
  };

  // Check the app data dir first (OPENCLAW_HOME / CLAWDBOT_STATE_DIR) —
  // that's where service.rs creates the config the gateway actually reads.
  for var in ["OPENCLAW_HOME", "CLAWDBOT_STATE_DIR"] {
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

  let config_path = std::path::PathBuf::from(&home).join(".openclaw").join("openclaw.json");
  if !config_path.exists() {
    let legacy = std::path::PathBuf::from(&home).join(".clawdbot").join("clawdbot.json");
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

  let home = match std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
  {
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
    .unwrap_or_else(|| std::path::PathBuf::from(&home).join(".openclaw").join("workspace"));

  let _ = std::fs::create_dir_all(&workspace_path);
  let tools_md_path = workspace_path.join("TOOLS.md");

  let should_write = if tools_md_path.exists() {
    std::fs::read_to_string(&tools_md_path)
      .map(|c| !c.contains("FALLBACK BEHAVIOR"))
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
    Ok(_) => eprintln!("[gateway_client] Wrote TOOLS.md at {}", tools_md_path.display()),
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
        cfg.as_object_mut().unwrap().insert("gateway".into(), serde_json::json!({}));
      }
      if cfg.pointer("/gateway/auth").is_none() {
        cfg.pointer_mut("/gateway").unwrap().as_object_mut().unwrap()
          .insert("auth".into(), serde_json::json!({}));
      }
      cfg.pointer_mut("/gateway/auth").unwrap().as_object_mut().unwrap()
        .insert("token".into(), serde_json::json!(env_token));
      eprintln!("[gateway_client] Synced gateway.auth.token in config file");
      patched = true;
    }
  }

  // Ensure browser object exists.
  if cfg.get("browser").is_none() {
    cfg.as_object_mut().unwrap().insert("browser".into(), serde_json::json!({}));
    patched = true;
  }

  // browser.enabled = true
  let enabled = cfg.pointer("/browser/enabled").and_then(|v| v.as_bool()).unwrap_or(false);
  if !enabled {
    cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
      .insert("enabled".into(), serde_json::json!(true));
    eprintln!("[gateway_client] Patched browser.enabled to true");
    patched = true;
  }

  // browser.headless = false  (user needs visible Chrome for logins)
  // Always set explicitly — if absent, the gateway may default to headless=true.
  let headless = cfg.pointer("/browser/headless").and_then(|v| v.as_bool());
  if headless != Some(false) {
    cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
      .insert("headless".into(), serde_json::json!(false));
    eprintln!("[gateway_client] Patched browser.headless to false");
    patched = true;
  }

  // browser.defaultProfile = "openclaw"  (managed, isolated)
  let profile = cfg.pointer("/browser/defaultProfile").and_then(|v| v.as_str()).unwrap_or("chrome");
  if profile == "chrome" || profile == "knapsack" || profile.is_empty() {
    cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
      .insert("defaultProfile".into(), serde_json::json!("openclaw"));
    eprintln!("[gateway_client] Patched browser.defaultProfile to openclaw");
    patched = true;
  }

  // browser.noSandbox = true  (needed on Linux for Chrome without a display server)
  // On macOS this is unnecessary and causes a visible warning bar in Chrome.
  if cfg!(target_os = "linux") {
    let no_sandbox = cfg.pointer("/browser/noSandbox").and_then(|v| v.as_bool()).unwrap_or(false);
    if !no_sandbox {
      cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
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
    cfg.as_object_mut().unwrap().insert("tools".into(), serde_json::json!({}));
  }

  let deny_exists = cfg.pointer("/tools/deny").and_then(|v| v.as_array()).is_some();
  if deny_exists {
    // Remove "browser" from existing deny list
    let browser_denied = cfg
      .pointer("/tools/deny")
      .and_then(|v| v.as_array())
      .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
      .unwrap_or(false);
    if browser_denied {
      if let Some(deny_arr) = cfg.pointer_mut("/tools/deny").and_then(|v| v.as_array_mut()) {
        deny_arr.retain(|item| item.as_str() != Some("browser"));
        eprintln!("[gateway_client] Removed browser from tools.deny");
        patched = true;
      }
    }
  } else {
    // tools.deny is ABSENT — create it from gateway defaults WITHOUT "browser"
    // so the gateway doesn't fall back to its internal default (which blocks browser).
    // Gateway defaults: ["browser","canvas","nodes","cron","gateway",...channelIds]
    cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
      .insert("deny".into(), serde_json::json!(["canvas", "nodes", "cron", "gateway"]));
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
    if let Some(allow) = cfg.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
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
  let exec_tools: Vec<&str> = vec![
    "exec", "process", "group:fs",
  ];
  if let Some(allow) = cfg.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
    // Remove legacy individual entries that are now covered by group:fs
    let covered_by_group_fs = ["read", "write", "edit", "apply_patch"];
    let before_len = allow.len();
    allow.retain(|item| {
      item.as_str().map(|s| !covered_by_group_fs.contains(&s)).unwrap_or(true)
    });
    if allow.len() != before_len {
      eprintln!("[gateway_client] Cleaned up individual file tool entries (now covered by group:fs)");
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
    cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
      .insert("exec".into(), serde_json::json!({}));
  }
  if cfg.pointer("/tools/exec/applyPatch").is_none() {
    cfg.pointer_mut("/tools/exec").unwrap().as_object_mut().unwrap()
      .insert("applyPatch".into(), serde_json::json!({}));
  }
  let apply_patch_enabled = cfg.pointer("/tools/exec/applyPatch/enabled")
    .and_then(|v| v.as_bool())
    .unwrap_or(false);
  if !apply_patch_enabled {
    cfg.pointer_mut("/tools/exec/applyPatch").unwrap().as_object_mut().unwrap()
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
    cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
      .insert("sandbox".into(), serde_json::json!({}));
  }
  if cfg.pointer("/tools/sandbox/tools").is_none() {
    cfg.pointer_mut("/tools/sandbox").unwrap().as_object_mut().unwrap()
      .insert("tools".into(), serde_json::json!({}));
  }

  // sandbox deny list
  let sandbox_deny_exists = cfg.pointer("/tools/sandbox/tools/deny").and_then(|v| v.as_array()).is_some();
  if sandbox_deny_exists {
    let has_browser = cfg.pointer("/tools/sandbox/tools/deny")
      .and_then(|v| v.as_array())
      .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
      .unwrap_or(false);
    if has_browser {
      if let Some(arr) = cfg.pointer_mut("/tools/sandbox/tools/deny").and_then(|v| v.as_array_mut()) {
        arr.retain(|item| item.as_str() != Some("browser"));
        eprintln!("[gateway_client] Removed browser from tools.sandbox.tools.deny");
        patched = true;
      }
    }
  } else {
    cfg.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
      .insert("deny".into(), serde_json::json!(["canvas", "nodes", "cron", "gateway"]));
    eprintln!("[gateway_client] Created tools.sandbox.tools.deny (without browser)");
    patched = true;
  }

  // sandbox allow list
  let sandbox_allow_has_browser = cfg.pointer("/tools/sandbox/tools/allow")
    .and_then(|v| v.as_array())
    .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
    .unwrap_or(false);
  if !sandbox_allow_has_browser {
    if let Some(arr) = cfg.pointer_mut("/tools/sandbox/tools/allow").and_then(|v| v.as_array_mut()) {
      arr.push(serde_json::json!("browser"));
      arr.push(serde_json::json!("group:web"));
    } else {
      cfg.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
        .insert("allow".into(), serde_json::json!([
          "exec", "process", "group:fs",
          "image", "sessions_list", "sessions_history",
          "sessions_send", "sessions_spawn", "session_status",
          "browser", "group:web"
        ]));
    }
    eprintln!("[gateway_client] Added browser + group:web to tools.sandbox.tools.allow");
    patched = true;
  }

  // ── Telegram: cap the HTTP client timeout ────────────────────────────────
  //
  // Grammy's default timeoutSeconds is 500 (≈8 min).  getUpdates long-polls
  // block for that entire duration, and when they do time out the resulting
  // AbortError floods the log.  Set a reasonable 60s cap if Telegram is
  // configured but no explicit timeout is set.
  let tg_has_token = cfg
    .pointer("/channels/telegram/botToken")
    .and_then(|v| v.as_str())
    .map(|s| !s.trim().is_empty())
    .unwrap_or(false);
  if tg_has_token {
    let tg_has_timeout = cfg
      .pointer("/channels/telegram/timeoutSeconds")
      .and_then(|v| v.as_u64())
      .is_some();
    if !tg_has_timeout {
      if cfg.pointer("/channels/telegram").is_some() {
        cfg.pointer_mut("/channels/telegram").unwrap().as_object_mut().unwrap()
          .insert("timeoutSeconds".into(), serde_json::json!(60));
        eprintln!("[gateway_client] Set channels.telegram.timeoutSeconds to 60 (was Grammy default 500)");
        patched = true;
      }
    }
  }

  if patched {
    if let Ok(json) = serde_json::to_string_pretty(&cfg) {
      let _ = std::fs::write(config_path, json);
      eprintln!("[gateway_client] Wrote patched config to {}", config_path.display());
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
fn resolve_default_model() -> String {
  let active = std::env::var("KNAPSACK_ACTIVE_PROVIDER").unwrap_or_default();
  let has_key = |var: &str| std::env::var(var).map(|k| !k.trim().is_empty()).unwrap_or(false);

  // Respect the user's active provider selection and configured model
  match active.as_str() {
    "openrouter" => {
      let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
        .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
      return format!("openrouter/{}", model);
    }
    "ollama" => {
      let model = std::env::var("KNAPSACK_OLLAMA_MODEL")
        .unwrap_or_else(|_| "llama3.1".to_string());
      return format!("ollama/{}", model);
    }
    "anthropic" if has_key("ANTHROPIC_API_KEY") => {
      let model = std::env::var("KNAPSACK_ANTHROPIC_MODEL")
        .unwrap_or_else(|_| "claude-opus-4-6".to_string());
      return format!("anthropic/{}", model);
    }
    "openai" if has_key("OPENAI_API_KEY") => {
      let model = std::env::var("KNAPSACK_OPENAI_MODEL")
        .unwrap_or_else(|_| "gpt-5.4".to_string());
      return format!("openai/{}", model);
    }
    "groq" if has_key("GROQ_API_KEY") => {
      let model = std::env::var("KNAPSACK_GROQ_MODEL")
        .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
      return format!("groq/{}", model);
    }
    "gemini" if has_key("GEMINI_API_KEY") => {
      let model = std::env::var("KNAPSACK_GEMINI_MODEL")
        .unwrap_or_else(|_| "gemini-2.0-flash".to_string());
      return format!("google/{}", model);
    }
    _ => {}
  }

  // Fallback: try providers in preference order using user's configured model
  if has_key("ANTHROPIC_API_KEY") {
    let model = std::env::var("KNAPSACK_ANTHROPIC_MODEL")
      .unwrap_or_else(|_| "claude-opus-4-6".to_string());
    return format!("anthropic/{}", model);
  }
  if has_key("OPENAI_API_KEY") {
    let model = std::env::var("KNAPSACK_OPENAI_MODEL")
      .unwrap_or_else(|_| "gpt-5.4".to_string());
    return format!("openai/{}", model);
  }
  if has_key("GROQ_API_KEY") {
    let model = std::env::var("KNAPSACK_GROQ_MODEL")
      .unwrap_or_else(|_| "llama-3.3-70b-versatile".to_string());
    return format!("groq/{}", model);
  }
  if has_key("GEMINI_API_KEY") {
    let model = std::env::var("KNAPSACK_GEMINI_MODEL")
      .unwrap_or_else(|_| "gemini-2.0-flash".to_string());
    return format!("google/{}", model);
  }
  if has_key("OPENROUTER_API_KEY") {
    let model = std::env::var("KNAPSACK_OPENROUTER_MODEL")
      .unwrap_or_else(|_| "meta-llama/llama-3.3-70b-instruct:free".to_string());
    return format!("openrouter/{}", model);
  }
  if has_key("OLLAMA_API_KEY") {
    let model = std::env::var("KNAPSACK_OLLAMA_MODEL")
      .unwrap_or_else(|_| "llama3.1".to_string());
    return format!("ollama/{}", model);
  }
  "anthropic/claude-opus-4-6".to_string()
}

/// connection.  config.patch triggers a SIGUSR1 restart on the gateway, so
/// we use a throwaway connection and wait for the gateway to come back.
async fn apply_runtime_browser_config(token: &str) {
  // Open a temporary WebSocket just for the config.patch exchange.
  let tmp_ws = match tokio::time::timeout(
    Duration::from_secs(3),
    connect_async(GATEWAY_WS_URL),
  ).await {
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
  }).await {
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
      id: "gateway-client-patch",
      display_name: "Knapsack Desktop (config patch)",
      version: env!("CARGO_PKG_VERSION"),
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: Some(AuthInfo { token: token.to_string() }),
    role: "operator",
    scopes: vec!["operator.admin"],
  };

  let connect_frame = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(&connect_params).unwrap()),
  };

  if tmp_write
    .send(Message::Text(serde_json::to_string(&connect_frame).unwrap()))
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
  }).await {
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
    .send(Message::Text(serde_json::to_string(&config_get_frame).unwrap()))
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
              break Ok(resp.result.or(resp.data).or(resp.payload).unwrap_or(Value::Null));
            } else if resp.id == config_get_id {
              break Err("config.get failed");
            }
          }
        }
        Some(Ok(Message::Close(_))) | None => break Err("connection closed"),
        _ => continue,
      }
    }
  }).await {
    Ok(Ok(v)) => v,
    _ => {
      eprintln!("[gateway_client] config.get failed or timed out on tmp WS, skipping patch");
      return;
    }
  };

  let base_hash = cfg_val.pointer("/hash")
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

  // Check if agents.defaults.model is already set in the config.
  let config_inner = cfg_val.get("config").unwrap_or(&cfg_val);
  let has_model = config_inner
    .pointer("/agents/defaults/model")
    .and_then(|v| match v {
      Value::String(s) => if s.trim().is_empty() { None } else { Some(()) },
      Value::Object(o) => o.get("primary")
        .and_then(|v| v.as_str())
        .filter(|s| !s.trim().is_empty())
        .map(|_| ()),
      _ => None,
    })
    .is_some();

  if !has_model {
    // Pick the best model based on available API keys.
    let model = resolve_default_model();
    patch_obj.as_object_mut().unwrap().insert(
      "agents".to_string(),
      serde_json::json!({"defaults": {"model": model}}),
    );
    eprintln!("[gateway_client] agents.defaults.model missing — adding '{}' to runtime patch", model);
  }

  let raw_patch = patch_obj.to_string();

  let patch_frame = RequestFrame {
    frame_type: "req",
    method: "config.patch".to_string(),
    id: next_request_id(),
    params: Some(serde_json::json!({
      "raw": raw_patch,
      "baseHash": base_hash
    })),
  };
  let _ = tmp_write
    .send(Message::Text(serde_json::to_string(&patch_frame).unwrap()))
    .await;
  eprintln!("[gateway_client] Sent config.patch for browser settings on tmp WS — gateway will restart");

  // Close the temporary connection (it'll die when the gateway restarts anyway).
  let _ = tmp_write.send(Message::Close(None)).await;
  drop(tmp_write);
  drop(tmp_read);

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
  // Patch browser config on disk before the gateway reads it.  This covers
  // cold-start in dev mode (`npm run tauri dev`) where set_service_enabled
  // never runs.
  let disk_config_changed = ensure_browser_config();

  // Always push browser config to the running gateway on first connection.
  // Even if the on-disk config didn't change (because we patched it in a
  // previous app session), the running gateway may have been started with
  // stale config (e.g., headless=true).  We track with BROWSER_CONFIG_APPLIED
  // so we only do this once per process lifetime.
  //
  // IMPORTANT: We do this BEFORE establishing our main connection, using a
  // temporary connection.  config.patch triggers a SIGUSR1 restart on the
  // gateway, which would kill any in-flight requests on the same connection.
  let need_runtime_patch = !BROWSER_CONFIG_APPLIED.load(Ordering::Relaxed)
    && is_gateway_port_open().await;

  if need_runtime_patch {
    BROWSER_CONFIG_APPLIED.store(true, Ordering::Relaxed);
    if disk_config_changed {
      eprintln!("[gateway_client] Disk config was patched while gateway was running — applying via config.patch RPC");
    } else {
      eprintln!("[gateway_client] Pushing browser config to running gateway (ensure headless=false, browser enabled)");
    }
    apply_runtime_browser_config(token).await;
  }

  ensure_gateway_best_effort(token).await;

  // Wrap the TCP/WebSocket connection in a short timeout so we don't hang
  // for 10-30 seconds when the gateway is down (system TCP timeout defaults).
  let (ws_stream, _) = tokio::time::timeout(
    Duration::from_secs(3),
    connect_async(GATEWAY_WS_URL),
  )
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
      Message::Close(_) => return Err("Connection closed during challenge".to_string()),
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
      id: "gateway-client",
      display_name: "Knapsack Desktop",
      version: env!("CARGO_PKG_VERSION"),
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: Some(AuthInfo {
      token: token.to_string(),
    }),
    role: "operator",
    scopes: vec!["operator.admin"],
  };

  let connect_frame = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(connect_params).unwrap()),
  };

  write
    .send(Message::Text(serde_json::to_string(&connect_frame).unwrap()))
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
      Message::Close(_) => return Err("Connection closed during connect".to_string()),
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
              Ok(resp.result.or(resp.data).or(resp.payload).unwrap_or(Value::Null))
            } else {
              Err(format!("Request failed: {:?}", resp.error.unwrap_or(Value::Null)))
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

  // Slow path: establish a new connection.
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

/// Public wrapper: drop the cached connection.
///
/// Call this when the gateway is known to have restarted (e.g. after a
/// config.patch that triggers SIGUSR1) so the next request opens a fresh
/// WebSocket instead of sending into a dead socket.
pub fn invalidate() {
  invalidate_client();
}

/// Quick TCP probe to check if the gateway port is listening.
/// Returns true if the port accepts connections within 500ms.
/// Channel status endpoints can call this to fail fast.
pub async fn is_gateway_port_open() -> bool {
  tokio::time::timeout(
    Duration::from_millis(500),
    tokio::net::TcpStream::connect("127.0.0.1:18789"),
  )
    .await
    .map(|r| r.is_ok())
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
    pending.insert(id.clone(), Pending { tx, remaining_skips: 0 });
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
    Ok(Ok(Err(e))) => (Err(e), false),                // RPC error — connection is fine
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
    pending.insert(id.clone(), Pending { tx, remaining_skips: 1 });
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
    Ok(Ok(Err(e))) => (Err(e), false),                // RPC error — connection is fine
    Ok(Err(_)) => (Err("Gateway response channel closed".to_string()), true),
    Err(_) => (Err(format!("Agent request timed out after {}s", timeout_secs)), true),
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
  for var in ["OPENCLAW_GATEWAY_TOKEN", "CLAWDBOT_GATEWAY_TOKEN"] {
    if let Ok(token) = std::env::var(var) {
      let t = token.trim().to_string();
      if !t.is_empty() {
        return Some(t);
      }
    }
  }

  // On Windows, HOME is typically not set — fall back to USERPROFILE.
  let home = std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
    .unwrap_or_else(|_| ".".to_string());
  let config_candidates = [
    std::path::PathBuf::from(&home).join(".openclaw").join("openclaw.json"),
    std::path::PathBuf::from(&home).join(".clawdbot").join("clawdbot.json"),
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

  // Check the app data dir first (OPENCLAW_HOME / CLAWDBOT_STATE_DIR),
  // then standard user-level config locations.
  let mut candidates: Vec<std::path::PathBuf> = Vec::new();

  for var in ["OPENCLAW_HOME", "CLAWDBOT_STATE_DIR"] {
    if let Ok(dir) = std::env::var(var) {
      let dir = dir.trim().to_string();
      if !dir.is_empty() {
        candidates.push(std::path::PathBuf::from(&dir).join("openclaw.json"));
        candidates.push(std::path::PathBuf::from(&dir).join("clawdbot.json"));
      }
    }
  }

  candidates.push(std::path::PathBuf::from(&home).join(".openclaw").join("openclaw.json"));
  candidates.push(std::path::PathBuf::from(&home).join(".clawdbot").join("clawdbot.json"));

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

  let backoffs: &[u64] = &[500, 1000, 2000];
  let mut last_err = String::new();

  for attempt in 0..=backoffs.len() {
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

    match gateway_request_pooled("browser.request", Some(params), &t).await {
      Ok(result) => return Ok(result),
      Err(e) => {
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
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let idem = format!("knapsack-ui-{}", std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap_or_default()
    .as_millis());
  let params = serde_json::json!({
    "message": message,
    "idempotencyKey": idem,
    "deliver": false,
    "channel": "webchat",
    "agentId": "main",
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
