use actix_web::{get, post, web, HttpResponse, Responder};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use crate::clawd::gateway_client;
use crate::clawd::sidecar::SharedClawdbotConfig;

/// Timestamp (seconds since UNIX epoch) of the last browser recovery attempt.
/// Used to rate-limit recovery so we don't spam stop/start on every health poll.
static LAST_BROWSER_RECOVERY: AtomicU64 = AtomicU64::new(0);
/// Minimum seconds between browser recovery attempts.
const BROWSER_RECOVERY_COOLDOWN_SECS: u64 = 30;

const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

/// Kill any Chrome processes that were launched by clawdbot/openclaw and may
/// still be holding the CDP debug port (18800).  This happens when the service
/// is restarted (the gateway exits but the Chrome child survives because it's a
/// separate process).  Without this cleanup the new gateway can't launch its
/// own Chrome on the same port and browser control stays in `cdpReady: false`.
#[cfg(target_os = "macos")]
fn kill_stale_clawdbot_chromes() {
  // `pgrep -f` finds processes whose full command-line matches the pattern.
  // The managed Chrome always has `--user-data-dir=…/browser/<profile>/user-data`
  // in its argv, which normal user Chrome doesn't.
  // Match both clawdbot/ and openclaw/ paths since CONFIG_DIR may use either.
  let patterns = &[
    "clawdbot/browser/.*/user-data",
    "openclaw/browser/.*/user-data",
  ];
  let mut killed_any = false;
  for pattern in patterns {
    let output = std::process::Command::new("pgrep")
      .args(["-f", pattern])
      .output();
    if let Ok(out) = output {
      let pids = String::from_utf8_lossy(&out.stdout);
      for pid_str in pids.split_whitespace() {
        if let Ok(pid) = pid_str.parse::<i32>() {
          eprintln!("[clawd/service] killing stale managed Chrome (pid {}, pattern: {})", pid, pattern);
          unsafe { libc::kill(pid, libc::SIGTERM); }
          killed_any = true;
        }
      }
    }
  }
  // Give Chrome a moment to exit so the port is released.
  if killed_any {
    std::thread::sleep(std::time::Duration::from_millis(1500));
  }
}

fn launch_agent_plist_path() -> Result<PathBuf, String> {
  let home = dirs::home_dir().ok_or("Couldn't resolve home dir")?;
  Ok(
    home
      .join("Library")
      .join("LaunchAgents")
      .join(format!("{}.plist", LAUNCH_AGENT_LABEL)),
  )
}

fn app_clawdbot_home(app_handle: &tauri::AppHandle) -> PathBuf {
  app_handle
    .path_resolver()
    .app_data_dir()
    .unwrap_or_else(|| PathBuf::from("."))
    .join("clawdbot")
}

fn ensure_dir(p: &Path) -> Result<(), String> {
  fs::create_dir_all(p).map_err(|e| format!("Failed to create dir {}: {}", p.display(), e))
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct StoredTokens {
  gateway_token: String,
  browser_control_token: String,

  // Optional: used by the embedded Clawdbot browser server chat agent.
  groq_api_key: Option<String>,
  openai_api_key: Option<String>,
  openai_model: Option<String>,

  // Multi-provider support
  #[serde(default)]
  anthropic_api_key: Option<String>,
  #[serde(default)]
  anthropic_model: Option<String>,
  #[serde(default)]
  gemini_api_key: Option<String>,
  #[serde(default)]
  gemini_model: Option<String>,
  #[serde(default)]
  groq_model: Option<String>,
  // OpenRouter support (access many models via openrouter.ai)
  #[serde(default)]
  openrouter_api_key: Option<String>,
  #[serde(default)]
  openrouter_model: Option<String>,

  /// Which provider is currently selected: "openai", "anthropic", "gemini", "groq", "openrouter", "ollama"
  #[serde(default)]
  active_provider: Option<String>,

  // Ollama (local LLM) support
  #[serde(default)]
  ollama_enabled: Option<bool>,
  #[serde(default)]
  ollama_model: Option<String>,
  #[serde(default)]
  ollama_base_url: Option<String>,

  /// Additional provider API keys (env_var_name -> key).
  /// These are passed as environment variables to the OpenClaw subprocess.
  /// e.g. {"MINIMAX_API_KEY": "...", "ZAI_API_KEY": "...", "HF_TOKEN": "..."}
  #[serde(default)]
  extra_provider_keys: Option<std::collections::HashMap<String, String>>,
}

fn tokens_path(app_handle: &tauri::AppHandle) -> PathBuf {
  app_clawdbot_home(app_handle).join("tokens.json")
}

/// Set restrictive file permissions (owner read/write only) on sensitive files.
/// On Unix this sets mode 0600; on other platforms this is a no-op.
fn harden_file_permissions(path: &Path) {
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    let perms = std::fs::Permissions::from_mode(0o600);
    let _ = std::fs::set_permissions(path, perms);
  }
  let _ = path; // suppress unused warning on non-unix
}

/// Set restrictive directory permissions (owner rwx only) on sensitive dirs.
/// On Unix this sets mode 0700; on other platforms this is a no-op.
fn harden_dir_permissions(path: &Path) {
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    let perms = std::fs::Permissions::from_mode(0o700);
    let _ = std::fs::set_permissions(path, perms);
  }
  let _ = path;
}

fn load_or_create_tokens(app_handle: &tauri::AppHandle) -> Result<StoredTokens, String> {
  let home = app_clawdbot_home(app_handle);
  ensure_dir(&home)?;
  harden_dir_permissions(&home);

  let path = tokens_path(app_handle);
  if path.exists() {
    // Ensure permissions are tight even on existing files
    harden_file_permissions(&path);
    let s =
      fs::read_to_string(&path).map_err(|e| format!("Failed reading {}: {}", path.display(), e))?;
    let t: StoredTokens =
      serde_json::from_str(&s).map_err(|e| format!("Failed parsing {}: {}", path.display(), e))?;
    return Ok(t);
  }

  // Generate long-ish random-ish tokens. (We can switch to a cryptographic RNG later.)
  let gateway_token = uuid::Uuid::new_v4().to_string() + &uuid::Uuid::new_v4().to_string();
  let browser_control_token = uuid::Uuid::new_v4().to_string() + &uuid::Uuid::new_v4().to_string();
  let t = StoredTokens {
    gateway_token,
    browser_control_token,
    groq_api_key: None,
    openai_api_key: None, // User must provide their own API key
    openai_model: None,   // Defaults to gpt-5.4
    anthropic_api_key: None,
    anthropic_model: None, // Defaults to claude-sonnet-4-5-20250929
    gemini_api_key: None,
    gemini_model: None,    // Defaults to gemini-2.5-flash
    groq_model: None,      // Defaults to meta-llama/llama-4-scout-17b-16e-instruct
    openrouter_api_key: None,
    openrouter_model: None, // Defaults to meta-llama/llama-3.3-70b-instruct:free
    active_provider: None, // Defaults to openai
    ollama_enabled: None,
    ollama_model: None,
    ollama_base_url: None,
    extra_provider_keys: None,
  };

  fs::write(&path, serde_json::to_string_pretty(&t).unwrap_or_default())
    .map_err(|e| format!("Failed writing {}: {}", path.display(), e))?;
  harden_file_permissions(&path);

  Ok(t)
}

/// Load saved LLM API keys from tokens.json and set them as environment
/// variables so they are available to the actix server (llm_complete, transcribe, etc.)
/// from the moment the process starts — not just after clawdbot service enable.
pub fn propagate_llm_keys_to_env(app_handle: &tauri::AppHandle) {
  let tokens = match load_or_create_tokens(app_handle) {
    Ok(t) => t,
    Err(e) => {
      eprintln!("[clawd/service] Could not load tokens for early key propagation: {}", e);
      return;
    }
  };
  if let Some(k) = &tokens.groq_api_key {
    let k = k.trim();
    if !k.is_empty() { std::env::set_var("GROQ_API_KEY", k); }
  }
  if let Some(k) = &tokens.openai_api_key {
    let k = k.trim();
    if !k.is_empty() { std::env::set_var("OPENAI_API_KEY", k); }
  }
  if let Some(k) = &tokens.anthropic_api_key {
    let k = k.trim();
    if !k.is_empty() { std::env::set_var("ANTHROPIC_API_KEY", k); }
  }
  if let Some(k) = &tokens.gemini_api_key {
    let k = k.trim();
    if !k.is_empty() { std::env::set_var("GEMINI_API_KEY", k); }
  }
  // Propagate the active provider and model so the multi-provider
  // completion (meeting notes) can pick the right one.
  if let Some(p) = &tokens.active_provider {
    let p = p.trim();
    if !p.is_empty() { std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", p); }
  }
  if let Some(m) = &tokens.openai_model {
    let m = m.trim();
    if !m.is_empty() { std::env::set_var("KNAPSACK_OPENAI_MODEL", m); }
  }
  if let Some(m) = &tokens.anthropic_model {
    let m = m.trim();
    if !m.is_empty() { std::env::set_var("KNAPSACK_ANTHROPIC_MODEL", m); }
  }
  if let Some(m) = &tokens.gemini_model {
    let m = m.trim();
    if !m.is_empty() { std::env::set_var("KNAPSACK_GEMINI_MODEL", m); }
  }
  if let Some(m) = &tokens.groq_model {
    let m = m.trim();
    if !m.is_empty() { std::env::set_var("KNAPSACK_GROQ_MODEL", m); }
  }
  if let Some(k) = &tokens.openrouter_api_key {
    let k = k.trim();
    if !k.is_empty() { std::env::set_var("OPENROUTER_API_KEY", k); }
  }
  if let Some(m) = &tokens.openrouter_model {
    let m = m.trim();
    if !m.is_empty() { std::env::set_var("KNAPSACK_OPENROUTER_MODEL", m); }
  }
  // Propagate Ollama settings so OpenClaw subprocess picks them up
  if tokens.ollama_enabled.unwrap_or(false) {
    std::env::set_var("OLLAMA_API_KEY", "ollama-local");
    if let Some(m) = &tokens.ollama_model {
      let m = m.trim();
      if !m.is_empty() { std::env::set_var("KNAPSACK_OLLAMA_MODEL", m); }
    }
    if let Some(u) = &tokens.ollama_base_url {
      let u = u.trim();
      if !u.is_empty() { std::env::set_var("OLLAMA_HOST", u); }
    }
  }
  // Propagate extra provider keys (MiniMax, ZAI/GLM, HuggingFace, etc.)
  if let Some(extra) = &tokens.extra_provider_keys {
    for (env_var, key) in extra {
      let key = key.trim();
      if !key.is_empty() && is_allowed_extra_env_var(env_var) {
        std::env::set_var(env_var, key);
      }
    }
  }

  // Propagate gateway token so that in-process gateway RPC callers
  // (browser_request, channel methods, etc.) can resolve the token
  // via `resolve_token(None)` without needing an explicit parameter.
  let gw_token = &tokens.gateway_token;
  if !gw_token.trim().is_empty() {
    std::env::set_var("CLAWDBOT_GATEWAY_TOKEN", gw_token.trim());
    std::env::set_var("OPENCLAW_GATEWAY_TOKEN", gw_token.trim());
  }
}

/// Allowlist of environment variable names that extra_provider_keys may set.
/// Prevents arbitrary env injection from a tampered tokens.json.
fn is_allowed_extra_env_var(name: &str) -> bool {
  matches!(
    name,
    "MINIMAX_API_KEY"
      | "ZAI_API_KEY"
      | "Z_AI_API_KEY"
      | "HF_TOKEN"
      | "HUGGINGFACE_HUB_TOKEN"
  )
}

fn save_tokens(app_handle: &tauri::AppHandle, tokens: &StoredTokens) -> Result<(), String> {
  let home = app_clawdbot_home(app_handle);
  ensure_dir(&home)?;
  harden_dir_permissions(&home);
  let path = tokens_path(app_handle);
  fs::write(
    &path,
    serde_json::to_string_pretty(tokens).unwrap_or_default(),
  )
  .map_err(|e| format!("Failed writing {}: {}", path.display(), e))?;
  harden_file_permissions(&path);
  Ok(())
}

/// Get the configured OpenAI model (defaults to gpt-5.4 if not set)
pub fn get_openai_model(app_handle: &tauri::AppHandle) -> String {
  load_or_create_tokens(app_handle)
    .ok()
    .and_then(|t| t.openai_model)
    .unwrap_or_else(|| "gpt-5.4".to_string())
}

/// Get the configured Anthropic model (defaults to claude-sonnet-4-5-20250929 if not set)
pub fn get_anthropic_model(app_handle: &tauri::AppHandle) -> String {
  load_or_create_tokens(app_handle)
    .ok()
    .and_then(|t| t.anthropic_model)
    .unwrap_or_else(|| "claude-sonnet-4-5-20250929".to_string())
}

/// Get the configured Gemini model (defaults to gemini-2.5-flash if not set)
pub fn get_gemini_model(app_handle: &tauri::AppHandle) -> String {
  load_or_create_tokens(app_handle)
    .ok()
    .and_then(|t| t.gemini_model)
    .unwrap_or_else(|| "gemini-2.5-flash".to_string())
}

/// Get the configured Groq model (defaults to meta-llama/llama-4-scout-17b-16e-instruct if not set)
pub fn get_groq_model(app_handle: &tauri::AppHandle) -> String {
  load_or_create_tokens(app_handle)
    .ok()
    .and_then(|t| t.groq_model)
    .unwrap_or_else(|| "meta-llama/llama-4-scout-17b-16e-instruct".to_string())
}

/// Get the configured OpenRouter model (defaults to meta-llama/llama-3.3-70b-instruct:free if not set)
pub fn get_openrouter_model(app_handle: &tauri::AppHandle) -> String {
  load_or_create_tokens(app_handle)
    .ok()
    .and_then(|t| t.openrouter_model)
    .unwrap_or_else(|| "meta-llama/llama-3.3-70b-instruct:free".to_string())
}

fn resource_path(app_handle: &tauri::AppHandle, rel: &str) -> PathBuf {
  // NOTE: resolve_resource returns an absolute path inside the .app bundle.
  app_handle
    .path_resolver()
    .resolve_resource(rel)
    .unwrap_or_else(|| PathBuf::from(rel))
}

fn generate_plist(program_args: &[String], env: &[(String, String)]) -> String {
  let mut env_xml = String::new();
  for (k, v) in env {
    env_xml.push_str(&format!(
      "    <key>{}</key>\n    <string>{}</string>\n",
      xml_escape(k),
      xml_escape(v)
    ));
  }

  let mut args_xml = String::new();
  for a in program_args {
    args_xml.push_str(&format!("    <string>{}</string>\n", xml_escape(a)));
  }

  format!(
    r#"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">
<plist version=\"1.0\">
<dict>
  <key>Label</key>
  <string>{label}</string>

  <key>RunAtLoad</key>
  <true/>

  <key>KeepAlive</key>
  <true/>

  <key>ProgramArguments</key>
  <array>
{args_xml}  </array>

  <key>EnvironmentVariables</key>
  <dict>
{env_xml}  </dict>

  <key>StandardOutPath</key>
  <string>{stdout}</string>
  <key>StandardErrorPath</key>
  <string>{stderr}</string>
</dict>
</plist>
"#,
    label = LAUNCH_AGENT_LABEL,
    args_xml = args_xml,
    env_xml = env_xml,
    stdout = "/tmp/knapsack-clawdbot.out.log",
    stderr = "/tmp/knapsack-clawdbot.err.log"
  )
}

fn xml_escape(s: &str) -> String {
  s.replace('&', "&amp;")
    .replace('<', "&lt;")
    .replace('>', "&gt;")
    .replace('"', "&quot;")
    .replace('\'', "&apos;")
}

#[derive(Debug, Serialize)]
pub struct ServiceStatusResponse {
  pub success: bool,
  pub installed: bool,
  pub running: bool,
  pub label: String,
  pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ServiceHealthResponse {
  pub success: bool,
  pub gateway_ok: bool,
  pub browser_ok: bool,
  pub message: String,
}

#[get("/api/clawd/service/health")]
pub async fn service_health(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  #[cfg(not(target_os = "macos"))]
  {
    return HttpResponse::NotImplemented().json(ServiceHealthResponse {
      success: false,
      gateway_ok: false,
      browser_ok: false,
      message: "Service management is only implemented for macOS right now".to_string(),
    });
  }

  #[cfg(target_os = "macos")]
  {
    let tokens = match load_or_create_tokens(&app_handle) {
      Ok(t) => t,
      Err(e) => {
        return HttpResponse::InternalServerError().json(ServiceHealthResponse {
          success: false,
          gateway_ok: false,
          browser_ok: false,
          message: e,
        })
      }
    };

    // Gateway health: try a simple HTTP request to the gateway's HTTP endpoint.
    // The gateway also listens on HTTP for health checks.
    let gateway_ok = reqwest::Client::builder()
      .timeout(std::time::Duration::from_millis(800))
      .build()
      .ok()
      .and_then(|c| {
        let fut = c
          .get("http://127.0.0.1:18789/health")
          .bearer_auth(tokens.gateway_token.clone())
          .send();
        Some(fut)
      });

    let gateway_ok = match gateway_ok {
      Some(fut) => fut.await.map(|r| r.status().is_success() || r.status().as_u16() == 404).unwrap_or(false),
      None => false,
    };

    // Browser control is accessed through the gateway's `browser.request` RPC
    // method.  Send a lightweight request to verify it's responsive.
    // Use a 5-second timeout to avoid blocking the health endpoint when the
    // browser RPC is slow (the default pooled request timeout is 30s).
    let browser_ok = if gateway_ok {
      match tokio::time::timeout(
        std::time::Duration::from_secs(5),
        gateway_client::browser_request(
          "GET", "/tabs", Some(serde_json::json!({"profile": "knapsack"})), None, None,
        ),
      ).await {
        Ok(Ok(_)) => true,
        Ok(Err(e)) => {
          eprintln!("[clawd/service] browser health check failed: {}", e);
          false
        }
        Err(_) => {
          eprintln!("[clawd/service] browser health check timed out (5s)");
          false
        }
      }
    } else {
      false
    };

    // Auto-recover browser when the gateway is healthy but Chrome is not.
    // This handles stale Chrome processes holding the CDP port (18800) after
    // an app restart, or Chrome crashing while the gateway stays up.
    // Rate-limited to once per BROWSER_RECOVERY_COOLDOWN_SECS to avoid loops.
    if gateway_ok && !browser_ok {
      let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
      let last = LAST_BROWSER_RECOVERY.load(Ordering::Relaxed);
      if now.saturating_sub(last) >= BROWSER_RECOVERY_COOLDOWN_SECS {
        LAST_BROWSER_RECOVERY.store(now, Ordering::Relaxed);
        eprintln!("[clawd/service] browser down but gateway OK — attempting auto-recovery");

        // 1. Kill any stale Chrome processes that may be holding the CDP port.
        kill_stale_clawdbot_chromes();

        // 2. Tell the gateway to stop its current browser (if any) and start a fresh one.
        //    Fire-and-forget so we don't block the health response.
        tokio::spawn(async {
          // Stop first — ignore errors (browser may already be stopped)
          let _ = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            gateway_client::browser_request(
              "POST", "/stop", Some(serde_json::json!({"profile": "openclaw"})), None, None,
            ),
          ).await;

          // Small delay to let the port be released
          tokio::time::sleep(std::time::Duration::from_millis(1000)).await;

          // Start a fresh browser
          match tokio::time::timeout(
            std::time::Duration::from_secs(15),
            gateway_client::browser_request(
              "POST", "/start", Some(serde_json::json!({"profile": "openclaw"})), None, None,
            ),
          ).await {
            Ok(Ok(_)) => eprintln!("[clawd/service] browser auto-recovery: /start succeeded"),
            Ok(Err(e)) => eprintln!("[clawd/service] browser auto-recovery: /start failed: {}", e),
            Err(_) => eprintln!("[clawd/service] browser auto-recovery: /start timed out"),
          }
        });
      }
    }

    // When gateway is down, include the last few lines from stderr so the
    // user/UI can see why the process is failing without opening Terminal.
    let mut message = if gateway_ok && browser_ok {
      "Clawdbot gateway + browser are healthy".to_string()
    } else if gateway_ok {
      "Clawdbot gateway OK; browser is still starting up — waiting for Chrome CDP to become ready".to_string()
    } else if browser_ok {
      "Browser control OK; gateway not reachable".to_string()
    } else {
      "Clawdbot not reachable — the background service may not be running".to_string()
    };

    if !gateway_ok {
      let err_path = std::path::PathBuf::from("/tmp/knapsack-clawdbot.err.log");
      if let Ok(content) = std::fs::read_to_string(&err_path) {
        let tail: Vec<&str> = content.lines().rev().take(8).collect();
        if !tail.is_empty() {
          let mut tail_lines: Vec<&str> = tail.into_iter().collect();
          tail_lines.reverse();
          message.push_str("\n--- last stderr ---\n");
          message.push_str(&tail_lines.join("\n"));
        }
      }
    }

    HttpResponse::Ok().json(ServiceHealthResponse {
      success: true,
      gateway_ok,
      browser_ok,
      message,
    })
  }
}

/// Startup readiness endpoint: waits for gateway to become healthy with
/// exponential backoff, up to 30 seconds. Returns immediately if already healthy.
/// The frontend should call this once on app launch before making API calls.
#[get("/api/clawd/service/startup-ready")]
pub async fn service_startup_ready(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  use crate::clawd::gateway_supervisor;

  let tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(ServiceHealthResponse {
        success: false,
        gateway_ok: false,
        browser_ok: false,
        message: format!("Could not load tokens: {}", e),
      })
    }
  };

  let ready = gateway_supervisor::wait_for_gateway_ready(&tokens.gateway_token, 30_000).await;

  // If gateway is up, also wait for the browser CDP to become reachable.
  // Chrome takes a few seconds to start after the gateway launches it.
  let browser_ok = if ready {
    gateway_client::wait_for_browser_ready(None, 15).await
  } else {
    false
  };

  HttpResponse::Ok().json(ServiceHealthResponse {
    success: ready,
    gateway_ok: ready,
    browser_ok,
    message: if ready && browser_ok {
      "Gateway and browser are ready".to_string()
    } else if ready {
      "Gateway is ready; browser is still starting up".to_string()
    } else {
      "Gateway did not become ready within 30s".to_string()
    },
  })
}

#[derive(Debug, Deserialize)]
pub struct ServiceLogsParams {
  /// stdout | stderr
  pub stream: Option<String>,
  pub lines: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct ServiceLogsResponse {
  pub success: bool,
  pub stream: String,
  pub lines: usize,
  pub text: String,
}

#[get("/api/clawd/service/logs")]
pub async fn service_logs(query: web::Query<ServiceLogsParams>) -> impl Responder {
  #[cfg(not(target_os = "macos"))]
  {
    return HttpResponse::NotImplemented().json(ServiceLogsResponse {
      success: false,
      stream: query.stream.clone().unwrap_or("stderr".to_string()),
      lines: query.lines.unwrap_or(200),
      text: "Service management is only implemented for macOS right now".to_string(),
    });
  }

  #[cfg(target_os = "macos")]
  {
    let stream = query.stream.clone().unwrap_or("stderr".to_string());
    let lines = query.lines.unwrap_or(200).min(2000);

    let path = match stream.as_str() {
      "stdout" => PathBuf::from("/tmp/knapsack-clawdbot.out.log"),
      _ => PathBuf::from("/tmp/knapsack-clawdbot.err.log"),
    };

    let mut s = String::new();
    if let Ok(mut f) = fs::File::open(&path) {
      let _ = f.read_to_string(&mut s);
    }

    // keep last N lines
    let mut out_lines = s.lines().rev().take(lines).collect::<Vec<_>>();
    out_lines.reverse();

    HttpResponse::Ok().json(ServiceLogsResponse {
      success: true,
      stream,
      lines,
      text: out_lines.join("\n"),
    })
  }
}

#[get("/api/clawd/service/status")]
pub async fn service_status() -> impl Responder {
  #[cfg(not(target_os = "macos"))]
  {
    return HttpResponse::NotImplemented().json(ServiceStatusResponse {
      success: false,
      installed: false,
      running: false,
      label: LAUNCH_AGENT_LABEL.to_string(),
      message: "Service management is only implemented for macOS right now".to_string(),
    });
  }

  #[cfg(target_os = "macos")]
  {
    let plist_path = match launch_agent_plist_path() {
      Ok(p) => p,
      Err(e) => {
        return HttpResponse::InternalServerError().json(ServiceStatusResponse {
          success: false,
          installed: false,
          running: false,
          label: LAUNCH_AGENT_LABEL.to_string(),
          message: e,
        })
      }
    };

    let installed = plist_path.exists();

    // Best-effort: `launchctl print gui/<uid>/<label>` exits 0 when loaded.
    let uid = unsafe { libc::getuid() };
    let domain = format!("gui/{}/{}", uid, LAUNCH_AGENT_LABEL);
    let running = std::process::Command::new("launchctl")
      .args(["print", &domain])
      .status()
      .map(|s| s.success())
      .unwrap_or(false);

    HttpResponse::Ok().json(ServiceStatusResponse {
      success: true,
      installed,
      running,
      label: LAUNCH_AGENT_LABEL.to_string(),
      message: if running {
        "Clawdbot service is running".to_string()
      } else if installed {
        "Clawdbot service is installed but not running".to_string()
      } else {
        "Clawdbot service not installed".to_string()
      },
    })
  }
}

#[derive(Debug, Deserialize)]
pub struct EnableServiceRequest {
  pub enabled: bool,
}

#[derive(Debug, Serialize)]
pub struct EnableServiceResponse {
  pub success: bool,
  pub enabled: bool,
  pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct SetLlmKeysRequest {
  pub groq_api_key: Option<String>,
  pub openai_api_key: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SetLlmKeysResponse {
  pub success: bool,
  pub message: String,
}

/// Mask an API key, showing only the last 4 characters: "••••••••abcd"
fn mask_key(key: &str) -> String {
  let trimmed = key.trim();
  if trimmed.len() <= 4 {
    return "••••••••".to_string();
  }
  let last4 = &trimmed[trimmed.len() - 4..];
  format!("••••••••{}", last4)
}

/// Check API key status for all providers
#[derive(Debug, Serialize)]
pub struct ApiKeyStatusResponse {
  pub success: bool,
  pub has_key: bool,
  pub message: String,
  pub model: Option<String>,
  pub active_provider: Option<String>,
  pub has_openai_key: bool,
  pub has_anthropic_key: bool,
  pub has_gemini_key: bool,
  pub has_groq_key: bool,
  pub has_openrouter_key: bool,
  pub openai_key_hint: Option<String>,
  pub anthropic_key_hint: Option<String>,
  pub gemini_key_hint: Option<String>,
  pub groq_key_hint: Option<String>,
  pub openrouter_key_hint: Option<String>,
  // Ollama (local LLM) status
  pub ollama_enabled: bool,
  pub ollama_model: Option<String>,
  pub ollama_base_url: Option<String>,
  /// Extra providers: list of {id, env_var, has_key, key_hint}
  #[serde(skip_serializing_if = "Vec::is_empty")]
  pub extra_providers: Vec<ExtraProviderStatus>,
}

#[derive(Debug, Serialize)]
pub struct ExtraProviderStatus {
  pub id: String,
  pub env_var: String,
  pub has_key: bool,
  pub key_hint: Option<String>,
}

#[get("/api/clawd/service/api-key-status")]
pub async fn api_key_status(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  let tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(ApiKeyStatusResponse {
        success: false,
        has_key: false,
        message: e,
        model: None,
        active_provider: None,
        has_openai_key: false,
        has_anthropic_key: false,
        has_gemini_key: false,
        has_groq_key: false,
        has_openrouter_key: false,
        openai_key_hint: None,
        anthropic_key_hint: None,
        gemini_key_hint: None,
        groq_key_hint: None,
        openrouter_key_hint: None,
        ollama_enabled: false,
        ollama_model: None,
        ollama_base_url: None,
        extra_providers: vec![],
      })
    }
  };

  let has_openai = tokens.openai_api_key.as_ref().map(|k| !k.trim().is_empty()).unwrap_or(false);
  let has_anthropic = tokens.anthropic_api_key.as_ref().map(|k| !k.trim().is_empty()).unwrap_or(false);
  let has_gemini = tokens.gemini_api_key.as_ref().map(|k| !k.trim().is_empty()).unwrap_or(false);
  let has_groq = tokens.groq_api_key.as_ref().map(|k| !k.trim().is_empty()).unwrap_or(false);
  let has_openrouter = tokens.openrouter_api_key.as_ref().map(|k| !k.trim().is_empty()).unwrap_or(false);
  let ollama_enabled = tokens.ollama_enabled.unwrap_or(false);
  let has_key = has_openai || has_anthropic || has_gemini || has_groq || has_openrouter || ollama_enabled;

  let model = tokens.openai_model.clone();
  let active_provider = tokens.active_provider.clone();

  let openai_hint = tokens.openai_api_key.as_ref().filter(|k| !k.trim().is_empty()).map(|k| mask_key(k));
  let anthropic_hint = tokens.anthropic_api_key.as_ref().filter(|k| !k.trim().is_empty()).map(|k| mask_key(k));
  let gemini_hint = tokens.gemini_api_key.as_ref().filter(|k| !k.trim().is_empty()).map(|k| mask_key(k));
  let groq_hint = tokens.groq_api_key.as_ref().filter(|k| !k.trim().is_empty()).map(|k| mask_key(k));
  let openrouter_hint = tokens.openrouter_api_key.as_ref().filter(|k| !k.trim().is_empty()).map(|k| mask_key(k));

  // Build extra provider status list
  let extra_provider_defs: &[(&str, &str)] = &[
    ("minimax", "MINIMAX_API_KEY"),
    ("zai", "ZAI_API_KEY"),
    ("huggingface", "HF_TOKEN"),
  ];
  let extra_providers: Vec<ExtraProviderStatus> = extra_provider_defs
    .iter()
    .map(|(id, env_var)| {
      let key = tokens
        .extra_provider_keys
        .as_ref()
        .and_then(|m| m.get(*env_var))
        .filter(|k| !k.trim().is_empty());
      ExtraProviderStatus {
        id: id.to_string(),
        env_var: env_var.to_string(),
        has_key: key.is_some(),
        key_hint: key.map(|k| mask_key(k)),
      }
    })
    .collect();

  HttpResponse::Ok().json(ApiKeyStatusResponse {
    success: true,
    has_key,
    message: if has_key {
      "API key is set".to_string()
    } else {
      "No API key configured".to_string()
    },
    model,
    active_provider,
    has_openai_key: has_openai,
    has_anthropic_key: has_anthropic,
    has_gemini_key: has_gemini,
    has_groq_key: has_groq,
    has_openrouter_key: has_openrouter,
    openai_key_hint: openai_hint,
    anthropic_key_hint: anthropic_hint,
    gemini_key_hint: gemini_hint,
    groq_key_hint: groq_hint,
    openrouter_key_hint: openrouter_hint,
    ollama_enabled,
    ollama_model: tokens.ollama_model.clone(),
    ollama_base_url: tokens.ollama_base_url.clone(),
    extra_providers,
  })
}

/// Validate an API key by making a lightweight test request to the provider.
#[derive(Debug, Deserialize)]
pub struct ValidateApiKeyRequest {
  pub key: String,
  /// "openai", "anthropic", "gemini", or "groq"
  pub provider: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ValidateApiKeyResponse {
  pub success: bool,
  pub valid: bool,
  pub message: String,
}

#[post("/api/clawd/service/validate-api-key")]
pub async fn validate_api_key(
  payload: web::Json<ValidateApiKeyRequest>,
) -> impl Responder {
  let key = payload.key.trim().to_string();
  if key.is_empty() {
    return HttpResponse::BadRequest().json(ValidateApiKeyResponse {
      success: false,
      valid: false,
      message: "API key cannot be empty".to_string(),
    });
  }

  let provider = payload.provider.as_deref().unwrap_or("openai").to_lowercase();
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(10))
    .build()
    .unwrap_or_default();

  let result = match provider.as_str() {
    "anthropic" => {
      // Use the messages API with max_tokens=1 for a minimal validation call
      client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .body(r#"{"model":"claude-haiku-4-5-20251001","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}"#)
        .send()
        .await
    }
    "gemini" => {
      // List models endpoint to validate the key
      let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models?key={}",
        key
      );
      client.get(&url).send().await
    }
    "groq" => {
      client
        .get("https://api.groq.com/openai/v1/models")
        .bearer_auth(&key)
        .send()
        .await
    }
    "minimax" => {
      // MiniMax uses Anthropic-messages-compatible endpoint
      client
        .get("https://api.minimax.io/v1/models")
        .bearer_auth(&key)
        .send()
        .await
    }
    "zai" => {
      // ZAI/GLM uses Anthropic-messages-compatible endpoint
      client
        .get("https://api.synthetic.new/v1/models")
        .bearer_auth(&key)
        .send()
        .await
    }
    "openrouter" => {
      // OpenRouter: list models to validate key
      client
        .get("https://openrouter.ai/api/v1/models")
        .bearer_auth(&key)
        .send()
        .await
    }
    "huggingface" => {
      // Hugging Face: validate with whoami endpoint
      client
        .get("https://huggingface.co/api/whoami-v2")
        .bearer_auth(&key)
        .send()
        .await
    }
    _ => {
      // OpenAI: list models
      client
        .get("https://api.openai.com/v1/models")
        .bearer_auth(&key)
        .send()
        .await
    }
  };

  match result {
    Ok(resp) => {
      let status = resp.status();
      if status.is_success() {
        HttpResponse::Ok().json(ValidateApiKeyResponse {
          success: true,
          valid: true,
          message: "API key is valid".to_string(),
        })
      } else if status.as_u16() == 401 || status.as_u16() == 403 {
        HttpResponse::Ok().json(ValidateApiKeyResponse {
          success: true,
          valid: false,
          message: "Invalid API key".to_string(),
        })
      } else {
        let body = resp.text().await.unwrap_or_default();
        HttpResponse::Ok().json(ValidateApiKeyResponse {
          success: true,
          valid: false,
          message: format!("Provider returned error ({}): {}", status.as_u16(), body),
        })
      }
    }
    Err(e) => HttpResponse::Ok().json(ValidateApiKeyResponse {
      success: true,
      valid: false,
      message: format!("Could not reach provider: {}", e),
    }),
  }
}

/// Set API key for any provider (OpenAI, Anthropic, Gemini, or extra providers)
#[derive(Debug, Deserialize)]
pub struct SetApiKeyRequest {
  #[serde(default)]
  pub key: String,
  pub model: Option<String>,
  /// "openai" (default), "anthropic", "gemini", "groq", "minimax", "zai", "huggingface"
  pub provider: Option<String>,
  /// For extra providers: the environment variable name to store the key under.
  /// e.g. "MINIMAX_API_KEY", "ZAI_API_KEY", "HF_TOKEN"
  pub env_var: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SetApiKeyResponse {
  pub success: bool,
  pub message: String,
}

#[post("/api/clawd/service/set-api-key")]
pub async fn set_api_key(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<SetApiKeyRequest>,
) -> impl Responder {
  let mut tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(SetApiKeyResponse {
        success: false,
        message: e,
      })
    }
  };

  let key = payload.key.trim().to_string();
  let provider = payload.provider.as_deref().unwrap_or("openai").to_lowercase();

  // If no key provided, allow switching to a provider that already has a saved key
  if key.is_empty() {
    let has_existing = match provider.as_str() {
      "anthropic" => tokens.anthropic_api_key.as_ref().map_or(false, |k| !k.is_empty()),
      "gemini" => tokens.gemini_api_key.as_ref().map_or(false, |k| !k.is_empty()),
      "groq" => tokens.groq_api_key.as_ref().map_or(false, |k| !k.is_empty()),
      "openrouter" => tokens.openrouter_api_key.as_ref().map_or(false, |k| !k.is_empty()),
      "ollama" => true,
      _ => tokens.openai_api_key.as_ref().map_or(false, |k| !k.is_empty()),
    };
    if !has_existing {
      return HttpResponse::BadRequest().json(SetApiKeyResponse {
        success: false,
        message: "API key cannot be empty".to_string(),
      });
    }
    // Switch active provider and update model only
    tokens.active_provider = Some(provider.clone());
    if let Some(model) = &payload.model {
      match provider.as_str() {
        "anthropic" => { tokens.anthropic_model = Some(model.trim().to_string()); }
        "gemini" => { tokens.gemini_model = Some(model.trim().to_string()); }
        "groq" => { tokens.groq_model = Some(model.trim().to_string()); }
        "openrouter" => { tokens.openrouter_model = Some(model.trim().to_string()); }
        "ollama" => { tokens.ollama_model = Some(model.trim().to_string()); }
        _ => { tokens.openai_model = Some(model.trim().to_string()); }
      }
    }
    let provider_name = match provider.as_str() {
      "anthropic" => "Anthropic",
      "gemini" => "Gemini",
      "groq" => "Groq",
      "openrouter" => "OpenRouter",
      "ollama" => "Ollama",
      _ => "OpenAI",
    };
    if let Err(e) = save_tokens(&app_handle, &tokens) {
      return HttpResponse::InternalServerError().json(SetApiKeyResponse {
        success: false,
        message: e,
      });
    }
    // Propagate env vars for the switched provider
    if let Some(p) = &tokens.active_provider { std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", p); }
    if let Some(k) = &tokens.openai_api_key { std::env::set_var("OPENAI_API_KEY", k); }
    if let Some(k) = &tokens.anthropic_api_key { std::env::set_var("ANTHROPIC_API_KEY", k); }
    if let Some(k) = &tokens.gemini_api_key { std::env::set_var("GEMINI_API_KEY", k); }
    if let Some(k) = &tokens.groq_api_key { std::env::set_var("GROQ_API_KEY", k); }
    if let Some(k) = &tokens.openrouter_api_key { std::env::set_var("OPENROUTER_API_KEY", k); }
    return HttpResponse::Ok().json(SetApiKeyResponse {
      success: true,
      message: format!("Switched to {}", provider_name),
    });
  }

  let provider_name = match provider.as_str() {
    "anthropic" => {
      tokens.anthropic_api_key = Some(key);
      tokens.active_provider = Some("anthropic".to_string());
      if let Some(model) = &payload.model {
        tokens.anthropic_model = Some(model.trim().to_string());
      }
      "Anthropic"
    }
    "gemini" => {
      tokens.gemini_api_key = Some(key);
      tokens.active_provider = Some("gemini".to_string());
      if let Some(model) = &payload.model {
        tokens.gemini_model = Some(model.trim().to_string());
      }
      "Gemini"
    }
    "groq" => {
      tokens.groq_api_key = Some(key);
      tokens.active_provider = Some("groq".to_string());
      if let Some(model) = &payload.model {
        tokens.groq_model = Some(model.trim().to_string());
      }
      "Groq"
    }
    "openrouter" => {
      tokens.openrouter_api_key = Some(key);
      tokens.active_provider = Some("openrouter".to_string());
      if let Some(model) = &payload.model {
        tokens.openrouter_model = Some(model.trim().to_string());
      }
      "OpenRouter"
    }
    "ollama" => {
      // Ollama doesn't need a real API key — just enable it and store settings
      tokens.ollama_enabled = Some(true);
      tokens.active_provider = Some("ollama".to_string());
      if let Some(model) = &payload.model {
        tokens.ollama_model = Some(model.trim().to_string());
      }
      "Ollama"
    }
    "minimax" | "zai" | "huggingface" => {
      // Extra providers: store key in extra_provider_keys map.
      // Determine the env var name from the request or derive from provider.
      let env_var = payload.env_var.clone().unwrap_or_else(|| {
        match provider.as_str() {
          "minimax" => "MINIMAX_API_KEY".to_string(),
          "zai" => "ZAI_API_KEY".to_string(),
          "huggingface" => "HF_TOKEN".to_string(),
          _ => format!("{}_API_KEY", provider.to_uppercase()),
        }
      });
      if !is_allowed_extra_env_var(&env_var) {
        return HttpResponse::BadRequest().json(SetApiKeyResponse {
          success: false,
          message: format!("Environment variable {} is not allowed", env_var),
        });
      }
      let extra = tokens.extra_provider_keys.get_or_insert_with(std::collections::HashMap::new);
      extra.insert(env_var.clone(), key);
      // Don't change active_provider — these are supplementary to the main 4.
      match provider.as_str() {
        "minimax" => "MiniMax",
        "zai" => "ZAI (GLM)",
        "huggingface" => "Hugging Face",
        _ => "Extra Provider",
      }
    }
    _ => {
      tokens.openai_api_key = Some(key);
      tokens.active_provider = Some("openai".to_string());
      // Save model if provided, default to gpt-5.4
      if let Some(model) = &payload.model {
        tokens.openai_model = Some(model.trim().to_string());
      }
      "OpenAI"
    }
  };

  if let Err(e) = save_tokens(&app_handle, &tokens) {
    return HttpResponse::InternalServerError().json(SetApiKeyResponse {
      success: false,
      message: e,
    });
  }

  // Propagate saved keys as env vars for in-process consumers (notetaker, transcription).
  if let Some(k) = &tokens.groq_api_key { std::env::set_var("GROQ_API_KEY", k); }
  if let Some(k) = &tokens.openai_api_key { std::env::set_var("OPENAI_API_KEY", k); }
  if let Some(k) = &tokens.anthropic_api_key { std::env::set_var("ANTHROPIC_API_KEY", k); }
  if let Some(k) = &tokens.gemini_api_key { std::env::set_var("GEMINI_API_KEY", k); }
  if let Some(k) = &tokens.openrouter_api_key { std::env::set_var("OPENROUTER_API_KEY", k); }
  if let Some(p) = &tokens.active_provider { std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", p); }
  if let Some(m) = &tokens.openai_model { std::env::set_var("KNAPSACK_OPENAI_MODEL", m); }
  if let Some(m) = &tokens.anthropic_model { std::env::set_var("KNAPSACK_ANTHROPIC_MODEL", m); }
  if let Some(m) = &tokens.gemini_model { std::env::set_var("KNAPSACK_GEMINI_MODEL", m); }
  if let Some(m) = &tokens.groq_model { std::env::set_var("KNAPSACK_GROQ_MODEL", m); }
  if let Some(m) = &tokens.openrouter_model { std::env::set_var("KNAPSACK_OPENROUTER_MODEL", m); }
  // Propagate Ollama settings
  if tokens.ollama_enabled.unwrap_or(false) {
    std::env::set_var("OLLAMA_API_KEY", "ollama-local");
    if let Some(m) = &tokens.ollama_model { std::env::set_var("KNAPSACK_OLLAMA_MODEL", m); }
    if let Some(u) = &tokens.ollama_base_url { std::env::set_var("OLLAMA_HOST", u); }
  } else {
    std::env::remove_var("OLLAMA_API_KEY");
  }
  if let Some(extra) = &tokens.extra_provider_keys {
    for (env_var, key) in extra {
      if is_allowed_extra_env_var(env_var) && !key.trim().is_empty() {
        std::env::set_var(env_var, key.trim());
      }
    }
  }

  HttpResponse::Ok().json(SetApiKeyResponse {
    success: true,
    message: format!("{} API key saved successfully", provider_name),
  })
}

/// Remove an extra provider key.
#[derive(Debug, Deserialize)]
pub struct DeleteExtraProviderKeyRequest {
  pub env_var: String,
}

#[post("/api/clawd/service/delete-extra-provider-key")]
pub async fn delete_extra_provider_key(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<DeleteExtraProviderKeyRequest>,
) -> impl Responder {
  let mut tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(SetApiKeyResponse {
        success: false,
        message: e,
      })
    }
  };

  let env_var = payload.env_var.trim();
  if !is_allowed_extra_env_var(env_var) {
    return HttpResponse::BadRequest().json(SetApiKeyResponse {
      success: false,
      message: format!("Environment variable {} is not allowed", env_var),
    });
  }

  if let Some(extra) = tokens.extra_provider_keys.as_mut() {
    extra.remove(env_var);
  }
  std::env::remove_var(env_var);

  if let Err(e) = save_tokens(&app_handle, &tokens) {
    return HttpResponse::InternalServerError().json(SetApiKeyResponse {
      success: false,
      message: e,
    });
  }

  HttpResponse::Ok().json(SetApiKeyResponse {
    success: true,
    message: format!("Removed {}", env_var),
  })
}

// ── Ollama (local LLM) endpoints ───────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct OllamaStatusResponse {
  pub running: bool,
  pub base_url: String,
}

/// Check whether Ollama is running on the local machine.
#[get("/api/knapsack/ollama/status")]
pub async fn ollama_status(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  let tokens = load_or_create_tokens(&app_handle).ok();
  let base_url = tokens
    .as_ref()
    .and_then(|t| t.ollama_base_url.clone())
    .unwrap_or_else(|| "http://127.0.0.1:11434".to_string());

  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(3))
    .build()
    .unwrap_or_default();

  let running = client
    .get(format!("{}/api/tags", &base_url))
    .send()
    .await
    .map(|r| r.status().is_success())
    .unwrap_or(false);

  HttpResponse::Ok().json(OllamaStatusResponse { running, base_url })
}

#[derive(Debug, Serialize)]
pub struct OllamaModel {
  pub name: String,
  pub size: Option<u64>,
  pub parameter_size: Option<String>,
  pub family: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct OllamaModelsResponse {
  pub success: bool,
  pub models: Vec<OllamaModel>,
  pub message: String,
}

/// List models available in the local Ollama instance.
#[get("/api/knapsack/ollama/models")]
pub async fn ollama_models(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  let tokens = load_or_create_tokens(&app_handle).ok();
  let base_url = tokens
    .as_ref()
    .and_then(|t| t.ollama_base_url.clone())
    .unwrap_or_else(|| "http://127.0.0.1:11434".to_string());

  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(5))
    .build()
    .unwrap_or_default();

  let resp = match client.get(format!("{}/api/tags", &base_url)).send().await {
    Ok(r) => r,
    Err(e) => {
      return HttpResponse::Ok().json(OllamaModelsResponse {
        success: false,
        models: vec![],
        message: format!("Cannot reach Ollama at {}: {}", base_url, e),
      })
    }
  };

  if !resp.status().is_success() {
    return HttpResponse::Ok().json(OllamaModelsResponse {
      success: false,
      models: vec![],
      message: format!("Ollama returned status {}", resp.status()),
    });
  }

  let body: serde_json::Value = match resp.json().await {
    Ok(v) => v,
    Err(e) => {
      return HttpResponse::Ok().json(OllamaModelsResponse {
        success: false,
        models: vec![],
        message: format!("Failed to parse Ollama response: {}", e),
      })
    }
  };

  let models: Vec<OllamaModel> = body["models"]
    .as_array()
    .unwrap_or(&vec![])
    .iter()
    .map(|m| OllamaModel {
      name: m["name"].as_str().unwrap_or("").to_string(),
      size: m["size"].as_u64(),
      parameter_size: m["details"]["parameter_size"].as_str().map(|s| s.to_string()),
      family: m["details"]["family"].as_str().map(|s| s.to_string()),
    })
    .collect();

  HttpResponse::Ok().json(OllamaModelsResponse {
    success: true,
    message: format!("Found {} models", models.len()),
    models,
  })
}

#[derive(Debug, Deserialize)]
pub struct OllamaConfigRequest {
  pub enabled: bool,
  pub model: Option<String>,
  pub base_url: Option<String>,
}

/// Enable/disable Ollama and update its configuration.
#[post("/api/knapsack/ollama/configure")]
pub async fn ollama_configure(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<OllamaConfigRequest>,
) -> impl Responder {
  let mut tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(SetApiKeyResponse {
        success: false,
        message: e,
      })
    }
  };

  tokens.ollama_enabled = Some(payload.enabled);
  if let Some(model) = &payload.model {
    let m = model.trim().to_string();
    tokens.ollama_model = if m.is_empty() { None } else { Some(m) };
  }
  if let Some(url) = &payload.base_url {
    let u = url.trim().to_string();
    tokens.ollama_base_url = if u.is_empty() { None } else { Some(u) };
  }

  if payload.enabled {
    tokens.active_provider = Some("ollama".to_string());
  } else if tokens.active_provider.as_deref() == Some("ollama") {
    // If disabling Ollama and it was the active provider, clear it
    tokens.active_provider = None;
  }

  if let Err(e) = save_tokens(&app_handle, &tokens) {
    return HttpResponse::InternalServerError().json(SetApiKeyResponse {
      success: false,
      message: e,
    });
  }

  // Propagate env vars
  if payload.enabled {
    std::env::set_var("OLLAMA_API_KEY", "ollama-local");
    std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", "ollama");
    if let Some(m) = &tokens.ollama_model { std::env::set_var("KNAPSACK_OLLAMA_MODEL", m); }
    if let Some(u) = &tokens.ollama_base_url { std::env::set_var("OLLAMA_HOST", u); }
  } else {
    std::env::remove_var("OLLAMA_API_KEY");
    std::env::remove_var("KNAPSACK_OLLAMA_MODEL");
    std::env::remove_var("OLLAMA_HOST");
    if tokens.active_provider.as_deref() == Some("ollama") {
      std::env::remove_var("KNAPSACK_ACTIVE_PROVIDER");
    }
  }

  HttpResponse::Ok().json(SetApiKeyResponse {
    success: true,
    message: if payload.enabled {
      "Ollama enabled".to_string()
    } else {
      "Ollama disabled".to_string()
    },
  })
}

#[derive(Debug, Deserialize)]
pub struct OllamaPullRequest {
  pub model: String,
}

/// Pull (download) a model from the Ollama registry.
/// Streams progress back as newline-delimited JSON lines.
#[post("/api/knapsack/ollama/pull")]
pub async fn ollama_pull(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<OllamaPullRequest>,
) -> impl Responder {
  let tokens = load_or_create_tokens(&app_handle).ok();
  let base_url = tokens
    .as_ref()
    .and_then(|t| t.ollama_base_url.clone())
    .unwrap_or_else(|| "http://127.0.0.1:11434".to_string());

  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(3600)) // large models may take a while
    .build()
    .unwrap_or_default();

  let resp = match client
    .post(format!("{}/api/pull", &base_url))
    .json(&serde_json::json!({ "name": &payload.model, "stream": true }))
    .send()
    .await
  {
    Ok(r) => r,
    Err(e) => {
      return HttpResponse::BadGateway().json(serde_json::json!({
        "success": false,
        "message": format!("Cannot reach Ollama at {}: {}", base_url, e),
      }))
    }
  };

  if !resp.status().is_success() {
    let status = resp.status();
    let body = resp.text().await.unwrap_or_default();
    return HttpResponse::BadGateway().json(serde_json::json!({
      "success": false,
      "message": format!("Ollama pull error ({}): {}", status, body),
    }));
  }

  // Stream the Ollama pull progress lines through to the frontend.
  let stream = resp.bytes_stream().map(|chunk| {
    chunk.map(|b| actix_web::web::Bytes::from(b.to_vec()))
      .map_err(|e| actix_web::error::ErrorBadGateway(format!("Stream error: {}", e)))
  });

  HttpResponse::Ok()
    .content_type("application/x-ndjson")
    .streaming(stream)
}

/// Retrieve stored API keys for frontend use (voice/TTS, provider selection).
/// This keeps tokens.json as the single source of truth instead of localStorage.
#[derive(Debug, Serialize)]
pub struct GetApiKeyResponse {
  pub success: bool,
  pub key: Option<String>,
  pub model: Option<String>,
  pub active_provider: Option<String>,
  pub openai_key: Option<String>,
  pub anthropic_key: Option<String>,
  pub gemini_key: Option<String>,
  pub anthropic_model: Option<String>,
  pub gemini_model: Option<String>,
  pub groq_model: Option<String>,
  pub openrouter_model: Option<String>,
}

#[get("/api/clawd/service/get-api-key")]
pub async fn get_api_key(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  let tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(_) => {
      return HttpResponse::InternalServerError().json(GetApiKeyResponse {
        success: false,
        key: None,
        model: None,
        active_provider: None,
        openai_key: None,
        anthropic_key: None,
        gemini_key: None,
        anthropic_model: None,
        gemini_model: None,
        groq_model: None,
        openrouter_model: None,
      })
    }
  };

  let openai_key = tokens.openai_api_key.filter(|k| !k.trim().is_empty());
  let anthropic_key = tokens.anthropic_api_key.filter(|k| !k.trim().is_empty());
  let gemini_key = tokens.gemini_api_key.filter(|k| !k.trim().is_empty());

  // Return the currently active provider's key as `key` for backwards compatibility (voice/TTS)
  let active = tokens.active_provider.as_deref().unwrap_or("openai");
  let key = match active {
    "anthropic" => anthropic_key.clone(),
    "gemini" => gemini_key.clone(),
    _ => openai_key.clone(),
  };

  HttpResponse::Ok().json(GetApiKeyResponse {
    success: true,
    key,
    model: tokens.openai_model,
    active_provider: tokens.active_provider,
    openai_key,
    anthropic_key,
    gemini_key,
    anthropic_model: tokens.anthropic_model,
    gemini_model: tokens.gemini_model,
    groq_model: tokens.groq_model,
    openrouter_model: tokens.openrouter_model,
  })
}

/// Set LLM keys used by the embedded Clawdbot sidecars.
#[post("/api/clawd/service/llm_keys")]
pub async fn set_llm_keys(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<SetLlmKeysRequest>,
) -> impl Responder {
  let mut tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError().json(SetLlmKeysResponse {
        success: false,
        message: e,
      })
    }
  };

  tokens.groq_api_key = payload
    .groq_api_key
    .clone()
    .map(|s| s.trim().to_string())
    .filter(|s| !s.is_empty());

  tokens.openai_api_key = payload
    .openai_api_key
    .clone()
    .map(|s| s.trim().to_string())
    .filter(|s| !s.is_empty());

  if let Err(e) = save_tokens(&app_handle, &tokens) {
    return HttpResponse::InternalServerError().json(SetLlmKeysResponse {
      success: false,
      message: e,
    });
  }

  // Also set env vars in the current process so the notetaker/transcription can use them.
  if let Some(k) = &tokens.groq_api_key {
    std::env::set_var("GROQ_API_KEY", k);
  }
  if let Some(k) = &tokens.openai_api_key {
    std::env::set_var("OPENAI_API_KEY", k);
  }

  HttpResponse::Ok().json(SetLlmKeysResponse {
    success: true,
    message: "Saved LLM keys".to_string(),
  })
}

/// Enable/disable the background Clawdbot LaunchAgent.
///
/// On enable:
/// - write LaunchAgent plist
/// - bootstrap + kickstart
/// - auto-set in-memory Clawdbot browser base_url
#[post("/api/clawd/service/enable")]
pub async fn set_service_enabled(
  app_handle: web::Data<tauri::AppHandle>,
  cfg: web::Data<SharedClawdbotConfig>,
  payload: web::Json<EnableServiceRequest>,
) -> impl Responder {
  #[cfg(not(target_os = "macos"))]
  {
    return HttpResponse::NotImplemented().json(EnableServiceResponse {
      success: false,
      enabled: payload.enabled,
      message: "Service management is only implemented for macOS right now".to_string(),
    });
  }

  #[cfg(target_os = "macos")]
  {
    let enabled = payload.enabled;

    let plist_path = match launch_agent_plist_path() {
      Ok(p) => p,
      Err(e) => {
        return HttpResponse::InternalServerError().json(EnableServiceResponse {
          success: false,
          enabled,
          message: e,
        })
      }
    };

    if enabled {
      // Ensure dirs
      if let Some(parent) = plist_path.parent() {
        if let Err(e) = ensure_dir(parent) {
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: e,
          });
        }
      }

      let tokens = match load_or_create_tokens(&app_handle) {
        Ok(t) => t,
        Err(e) => {
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: e,
          })
        }
      };

      // Expected bundle layout:
      //   resources/node/node
      //   resources/clawdbot/ (packaged JS)
      //
      // DEV MODE NOTE:
      // In `tauri dev`, resolve_resource() may point at target/debug/resources, but those files
      // are not always present/updated. Also, the embedded node binary often fails due to missing
      // @rpath libnode dylib. So in debug builds, prefer system node + workspace clawdbot dist.

      fn first_existing(paths: &[PathBuf]) -> Option<PathBuf> {
        for pb in paths {
          if pb.exists() {
            return Some(pb.clone());
          }
        }
        None
      }

      // The bundled node binary is the official Node.js release which is self-contained
      // (only depends on system libraries). In production, prefer bundled node.
      // In dev, prefer system node for faster iteration.
      let bundled_node = resource_path(&app_handle, "resources/node/node");

      let node_candidates: Vec<PathBuf> = if cfg!(debug_assertions) {
        // Dev: prefer system node, fall back to bundled
        vec![
          PathBuf::from("/opt/homebrew/bin/node"),
          PathBuf::from("/usr/local/bin/node"),
          PathBuf::from("/usr/bin/node"),
          bundled_node,
        ]
      } else {
        // Production: prefer bundled node, fall back to system
        vec![
          bundled_node,
          PathBuf::from("/opt/homebrew/bin/node"),
          PathBuf::from("/usr/local/bin/node"),
          PathBuf::from("/usr/bin/node"),
        ]
      };

      let bundled_node_path = resource_path(&app_handle, "resources/node/node");
      let node_path = match first_existing(&node_candidates) {
        Some(p) => {
          // Log which Node.js binary we're using
          let is_bundled = p == bundled_node_path;
          eprintln!(
            "[clawd/service] Using Node.js: {} ({})",
            p.display(),
            if is_bundled { "bundled" } else { "system" }
          );
          p
        }
        None => {
          eprintln!("[clawd/service] ERROR: No Node.js found. Checked: {:?}", node_candidates);
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: "Node.js not found. The bundled Node.js binary is missing and no system Node.js was found. Please reinstall Knapsack or install Node.js (https://nodejs.org).".to_string(),
          });
        }
      };

      // For clawdbot entry, prefer bundled version in production, workspace version in dev
      let clawdbot_entry = if cfg!(debug_assertions) {
        let sys_entry = PathBuf::from("/opt/homebrew/lib/node_modules/clawdbot/dist/entry.js");
        let ws_entry = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
          .join("resources")
          .join("clawdbot")
          .join("dist")
          .join("entry.js");

        if sys_entry.exists() {
          sys_entry
        } else {
          ws_entry
        }
      } else {
        // Production: use bundled clawdbot JS inside the .app
        resource_path(&app_handle, "resources/clawdbot/dist/entry.js")
      };

      // Verify clawdbot entry exists
      if !clawdbot_entry.exists() {
        eprintln!("[clawd/service] ERROR: Clawdbot entry not found at {}", clawdbot_entry.display());
        return HttpResponse::InternalServerError().json(EnableServiceResponse {
          success: false,
          enabled,
          message: format!("Clawdbot not found at {}. Please reinstall Knapsack.", clawdbot_entry.display()),
        });
      }
      eprintln!("[clawd/service] Using Clawdbot entry: {}", clawdbot_entry.display());

      let clawdbot_home = app_clawdbot_home(&app_handle);
      let clawdbot_home_str = clawdbot_home.to_string_lossy().to_string();

      // Ensure OpenClaw config exists with gateway.mode=local for first-run.
      // Without this, OpenClaw refuses to start on a fresh machine.
      // NOTE: plugins.slots.memory must be set to "none" explicitly — if omitted,
      // OpenClaw's config normalizer defaults it to "memory-core" which then fails
      // validation because the config validator runs before plugin discovery.
      // Use openclaw.json (preferred in 2026.2+); also check for legacy clawdbot.json.
      let config_path = clawdbot_home.join("openclaw.json");
      let legacy_config_path = clawdbot_home.join("clawdbot.json");
      // If the legacy config exists but the new one doesn't, rename it.
      if legacy_config_path.exists() && !config_path.exists() {
        match fs::rename(&legacy_config_path, &config_path) {
          Ok(_) => eprintln!("[clawd/service] Migrated config from clawdbot.json to openclaw.json"),
          Err(e) => eprintln!("[clawd/service] WARNING: Failed to migrate config: {}. Will create new.", e),
        }
      }
      if !config_path.exists() {
        let _ = ensure_dir(&clawdbot_home);
        let default_config = serde_json::json!({
          "gateway": {
            "mode": "local",
            "auth": {
              "token": tokens.gateway_token.clone()
            }
          },
          "browser": {
            "enabled": true
          },
          "plugins": {
            "slots": {
              "memory": "none"
            }
          },
          "tools": {
            "allow": ["browser", "group:web", "exec", "process", "read", "write", "edit", "apply_patch"],
            "deny": ["canvas", "nodes", "cron", "gateway"],
            "media": {"image": {"enabled": true}},
            "sandbox": {
              "tools": {
                "deny": ["canvas", "nodes", "cron", "gateway"],
                "allow": [
                  "exec", "process", "read", "write", "edit", "apply_patch",
                  "image", "sessions_list", "sessions_history",
                  "sessions_send", "sessions_spawn", "session_status",
                  "browser", "group:web"
                ]
              }
            }
          }
        });
        match fs::write(&config_path, serde_json::to_string_pretty(&default_config).unwrap_or_default()) {
          Ok(_) => eprintln!("[clawd/service] Created default config at {}", config_path.display()),
          Err(e) => eprintln!("[clawd/service] WARNING: Failed to create config at {}: {}", config_path.display(), e),
        }
      } else {
        // Patch existing configs to ensure required fields are present.
        if let Ok(existing) = fs::read_to_string(&config_path) {
          if let Ok(mut cfg) = serde_json::from_str::<serde_json::Value>(&existing) {
            let mut patched = false;

            // Ensure gateway.auth.token matches tokens.json so the
            // WebSocket handshake succeeds.  Without this, a stale or
            // missing token in the config file causes "gateway token
            // mismatch" errors on every RPC call.
            let config_token = cfg
              .pointer("/gateway/auth/token")
              .and_then(|v| v.as_str())
              .unwrap_or("");
            if config_token != tokens.gateway_token.trim() {
              if cfg.get("gateway").is_none() {
                cfg.as_object_mut().unwrap().insert("gateway".to_string(), serde_json::json!({}));
              }
              if cfg.pointer("/gateway/auth").is_none() {
                cfg.pointer_mut("/gateway").unwrap().as_object_mut().unwrap()
                  .insert("auth".to_string(), serde_json::json!({}));
              }
              cfg.pointer_mut("/gateway/auth").unwrap().as_object_mut().unwrap()
                .insert("token".to_string(), serde_json::json!(tokens.gateway_token.trim()));
              eprintln!("[clawd/service] Synced gateway.auth.token in config to match tokens.json");
              patched = true;
            }

            // Ensure plugins.slots.memory is set to "none".
            // Clawdbot's config normalizer defaults an absent memory slot to "memory-core",
            // which triggers a validation error because the config validator runs before
            // plugin discovery picks up the bundled extensions directory.
            let current_memory = cfg
              .pointer("/plugins/slots/memory")
              .and_then(|v| v.as_str())
              .unwrap_or("");
            if current_memory != "none" {
              if cfg.get("plugins").is_none() {
                cfg.as_object_mut().unwrap().insert("plugins".to_string(), serde_json::json!({}));
              }
              if cfg.pointer("/plugins/slots").is_none() {
                cfg.pointer_mut("/plugins").unwrap().as_object_mut().unwrap()
                  .insert("slots".to_string(), serde_json::json!({}));
              }
              cfg.pointer_mut("/plugins/slots").unwrap().as_object_mut().unwrap()
                .insert("memory".to_string(), serde_json::json!("none"));
              eprintln!("[clawd/service] Patched plugins.slots.memory to \"none\"");
              patched = true;
            }

            // Ensure browser.enabled is true so the browser control HTTP server
            // starts on port 18791 (gateway port + 2).
            let browser_enabled = cfg
              .pointer("/browser/enabled")
              .and_then(|v| v.as_bool())
              .unwrap_or(false);
            if !browser_enabled {
              if cfg.get("browser").is_none() {
                cfg.as_object_mut().unwrap().insert("browser".to_string(), serde_json::json!({}));
              }
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .insert("enabled".to_string(), serde_json::json!(true));
              eprintln!("[clawd/service] Patched browser.enabled to true");
              patched = true;
            }

            // Ensure the browser is NOT headless — the user needs to see the
            // managed Chrome window to log into services (OAuth, banking, etc.).
            // Always set explicitly — if absent, the gateway may default to headless=true.
            let browser_headless = cfg
              .pointer("/browser/headless")
              .and_then(|v| v.as_bool());
            if browser_headless != Some(false) {
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .insert("headless".to_string(), serde_json::json!(false));
              eprintln!("[clawd/service] Patched browser.headless to false (user needs visible Chrome for logins)");
              patched = true;
            }

            // Set default profile to "knapsack" (managed, isolated) so the
            // browser tool works for channel automations.  The "chrome"
            // profile is an extension-relay that requires a human to manually
            // attach the Chrome extension to a tab — it will never work from
            // a background channel context (Telegram/Signal/etc.).
            let current_profile = cfg
              .pointer("/browser/defaultProfile")
              .and_then(|v| v.as_str())
              .unwrap_or("chrome")
              .to_string();
            if current_profile == "chrome" || current_profile == "openclaw" || current_profile.is_empty() {
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .insert("defaultProfile".to_string(), serde_json::json!("knapsack"));
              eprintln!("[clawd/service] Patched browser.defaultProfile from {:?} to knapsack", current_profile);
              patched = true;
            }

            // Suppress the "Chrome is being controlled by automated test software"
            // infobar on first launch by setting browser.hideAutomationBanner.
            let hide_banner = cfg
              .pointer("/browser/hideAutomationBanner")
              .and_then(|v| v.as_bool())
              .unwrap_or(false);
            if !hide_banner {
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .insert("hideAutomationBanner".to_string(), serde_json::json!(true));
              eprintln!("[clawd/service] Patched browser.hideAutomationBanner to true");
              patched = true;
            }

            // On Linux, Chrome/Chromium requires --no-sandbox when running
            // headless (no display server).  Set browser.noSandbox = true.
            // On macOS this is unnecessary and causes a visible warning bar.
            if cfg!(target_os = "linux") {
              let no_sandbox = cfg
                .pointer("/browser/noSandbox")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
              if !no_sandbox {
                cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                  .insert("noSandbox".to_string(), serde_json::json!(true));
                eprintln!("[clawd/service] Patched browser.noSandbox to true (Linux)");
                patched = true;
              }
            }

            // ── Ensure browser tool is allowed in NORMAL mode (webchat/desktop) ──
            //
            // The gateway's internal DEFAULT_TOOL_DENY includes "browser".
            // If tools.deny is ABSENT from the config, the gateway uses that
            // default, which BLOCKS browser for normal-mode requests (desktop
            // webchat).  We must explicitly set tools.deny WITHOUT "browser".

            // Ensure tools object exists
            if cfg.get("tools").is_none() {
              cfg.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
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
                  eprintln!("[clawd/service] Removed browser from tools.deny");
                  patched = true;
                }
              }
            } else {
              // tools.deny is ABSENT — create it from gateway defaults WITHOUT "browser"
              // Gateway defaults: ["browser","canvas","nodes","cron","gateway",...channelIds]
              cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
                .insert("deny".to_string(), serde_json::json!(["canvas", "nodes", "cron", "gateway"]));
              eprintln!("[clawd/service] Created tools.deny (without browser)");
              patched = true;
            }

            // Ensure "browser" is in tools.allow — the gateway's DEFAULT_TOOL_ALLOW
            // does NOT include "browser", so even with "full" profile the deny list
            // takes precedence unless we explicitly allow it.
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
                tools.insert("allow".to_string(), serde_json::json!(["browser"]));
              }
              eprintln!("[clawd/service] Added browser to tools.allow");
              patched = true;
            }

            // ── Enable image understanding (tools.media.image) ──────────
            // When the primary model doesn't support vision, the gateway can
            // describe images using a separate vision model.  Without this,
            // photo attachments from Telegram/Signal are passed as file paths
            // and the model can't see them.
            let image_understanding_enabled = cfg
              .pointer("/tools/media/image/enabled")
              .and_then(|v| v.as_bool())
              .unwrap_or(false);
            if !image_understanding_enabled {
              // Ensure tools.media.image exists
              if cfg.get("tools").is_none() {
                cfg.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
              }
              let tools = cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap();
              if !tools.contains_key("media") {
                tools.insert("media".to_string(), serde_json::json!({}));
              }
              let media = cfg.pointer_mut("/tools/media").unwrap().as_object_mut().unwrap();
              if !media.contains_key("image") {
                media.insert("image".to_string(), serde_json::json!({}));
              }
              cfg.pointer_mut("/tools/media/image").unwrap().as_object_mut().unwrap()
                .insert("enabled".to_string(), serde_json::json!(true));
              eprintln!("[clawd/service] Enabled tools.media.image for photo understanding");
              patched = true;
            }

            // ── Ensure web_fetch and web_search are allowed ──────────────
            // These tools let the bot fetch web pages and search the internet.
            // The full profile allows them by default, but if tools.allow is
            // set (e.g. by the browser patch above), we need to add them.
            if let Some(allow_arr) = cfg.pointer("/tools/allow").and_then(|v| v.as_array()) {
              let has_web_fetch = allow_arr.iter().any(|item| item.as_str() == Some("web_fetch"));
              let has_web_search = allow_arr.iter().any(|item| item.as_str() == Some("web_search"));
              let has_group_web = allow_arr.iter().any(|item| item.as_str() == Some("group:web"));
              if !has_web_fetch || !has_web_search {
                if !has_group_web {
                  // Add group:web which includes both web_fetch and web_search
                  if let Some(arr) = cfg.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
                    arr.push(serde_json::json!("group:web"));
                  }
                  eprintln!("[clawd/service] Added group:web to tools.allow");
                  patched = true;
                }
              }
            }

            // ── Ensure exec/process/file tools are in normal-mode allow ─────
            // These are the same tools granted in sandbox mode (Telegram/etc.)
            // but desktop webchat also needs them for Advanced Mode shell access.
            let exec_tools = ["exec", "process", "read", "write", "edit", "apply_patch"];
            if let Some(allow_arr) = cfg.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
              for tool_name in &exec_tools {
                let already = allow_arr.iter().any(|item| item.as_str() == Some(tool_name));
                if !already {
                  allow_arr.push(serde_json::json!(tool_name));
                  eprintln!("[clawd/service] Added {} to tools.allow", tool_name);
                  patched = true;
                }
              }
            }

            // ── Ensure browser + web tools are allowed in sandbox mode ─────
            // Channel messages (Telegram, Signal, etc.) run in sandbox mode,
            // which has a separate tools policy.  The gateway's built-in
            // DEFAULT_TOOL_ALLOW does NOT include web_fetch, web_search, or
            // browser — and DEFAULT_TOOL_DENY explicitly blocks browser.
            // We must create/patch both lists so channel messages can trigger
            // web retrieval and browser automation.

            // Ensure the tools.sandbox.tools path exists in the config
            if cfg.get("tools").is_none() {
              cfg.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
            }
            if cfg.pointer("/tools/sandbox").is_none() {
              cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
                .insert("sandbox".to_string(), serde_json::json!({}));
            }
            if cfg.pointer("/tools/sandbox/tools").is_none() {
              cfg.pointer_mut("/tools/sandbox").unwrap().as_object_mut().unwrap()
                .insert("tools".to_string(), serde_json::json!({}));
            }

            // --- sandbox deny list ---
            // Remove browser/web tools from deny if present; create the deny
            // list from gateway defaults (minus browser) if it doesn't exist.
            let sandbox_tools_to_unblock = ["browser", "web_fetch", "web_search", "group:web"];
            if let Some(deny_arr) = cfg
              .pointer("/tools/sandbox/tools/deny")
              .and_then(|v| v.as_array())
            {
              let has_blocked = deny_arr.iter().any(|item| {
                item.as_str().map(|s| sandbox_tools_to_unblock.contains(&s)).unwrap_or(false)
              });
              if has_blocked {
                if let Some(deny_arr_mut) = cfg.pointer_mut("/tools/sandbox/tools/deny")
                  .and_then(|v| v.as_array_mut())
                {
                  deny_arr_mut.retain(|item| {
                    item.as_str().map(|s| !sandbox_tools_to_unblock.contains(&s)).unwrap_or(true)
                  });
                  eprintln!("[clawd/service] Removed browser/web tools from tools.sandbox.tools.deny");
                  patched = true;
                }
              }
            } else {
              // Deny list doesn't exist — create it from gateway defaults but
              // WITHOUT "browser" so the agent can use browser from channels.
              // Gateway defaults: ["browser","canvas","nodes","cron","gateway",...channelIds]
              cfg.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
                .insert("deny".to_string(), serde_json::json!([
                  "canvas", "nodes", "cron", "gateway"
                ]));
              eprintln!("[clawd/service] Created tools.sandbox.tools.deny (without browser)");
              patched = true;
            }

            // --- sandbox allow list ---
            // Add browser + group:web to the allow list.  If the allow list
            // doesn't exist yet, create it from the gateway's defaults plus
            // browser and group:web so that web_fetch/web_search work from
            // channel messages (Telegram, WhatsApp, Signal, etc.).
            if let Some(allow_arr) = cfg.pointer("/tools/sandbox/tools/allow").and_then(|v| v.as_array()) {
              let has_browser = allow_arr.iter().any(|item| item.as_str() == Some("browser"));
              let has_group_web = allow_arr.iter().any(|item| item.as_str() == Some("group:web"));
              let mut needs_add = Vec::new();
              if !has_browser { needs_add.push("browser"); }
              if !has_group_web { needs_add.push("group:web"); }
              if !needs_add.is_empty() {
                if let Some(arr) = cfg.pointer_mut("/tools/sandbox/tools/allow").and_then(|v| v.as_array_mut()) {
                  for tool in &needs_add {
                    arr.push(serde_json::json!(tool));
                  }
                  eprintln!("[clawd/service] Added {:?} to tools.sandbox.tools.allow", needs_add);
                  patched = true;
                }
              }
            } else {
              // Allow list doesn't exist — create it from gateway defaults
              // plus browser and group:web.
              // Gateway DEFAULT_TOOL_ALLOW: exec, process, read, write, edit,
              //   apply_patch, image, sessions_list, sessions_history,
              //   sessions_send, sessions_spawn, session_status
              cfg.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
                .insert("allow".to_string(), serde_json::json!([
                  "exec", "process", "read", "write", "edit", "apply_patch",
                  "image", "sessions_list", "sessions_history",
                  "sessions_send", "sessions_spawn", "session_status",
                  "browser", "group:web"
                ]));
              eprintln!("[clawd/service] Created tools.sandbox.tools.allow (with browser + group:web)");
              patched = true;
            }

            if patched {
              match fs::write(&config_path, serde_json::to_string_pretty(&cfg).unwrap_or_default()) {
                Ok(_) => eprintln!("[clawd/service] Config patched successfully"),
                Err(e) => eprintln!("[clawd/service] WARNING: Failed to patch config: {}", e),
              }
            }
          }
        }
      }

      // Ensure the workspace has a TOOLS.md that tells the auto-reply agent
      // about browser automation capabilities.  The workspace is at
      // agents.defaults.workspace (default: ~/.openclaw/workspace).
      // Read the workspace path from the config, falling back to default.
      let workspace_path = {
        let cfg_str = fs::read_to_string(&config_path).unwrap_or_default();
        let cfg_val: serde_json::Value = serde_json::from_str(&cfg_str).unwrap_or(serde_json::json!({}));
        cfg_val
          .pointer("/agents/defaults/workspace")
          .and_then(|v| v.as_str())
          .map(|s| {
            if s.starts_with("~/") {
              let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
              home.join(&s[2..])
            } else {
              PathBuf::from(s)
            }
          })
          .unwrap_or_else(|| {
            let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
            home.join(".openclaw").join("workspace")
          })
      };

      if let Err(e) = ensure_dir(&workspace_path) {
        eprintln!("[clawd/service] WARNING: Failed to create workspace dir: {}", e);
      }

      let tools_md_path = workspace_path.join("TOOLS.md");
      // Write TOOLS.md if it doesn't exist or if it's missing key sections.
      let should_write_tools_md = if tools_md_path.exists() {
        fs::read_to_string(&tools_md_path)
          .map(|content| !content.contains("## Shell & Command Execution"))
          .unwrap_or(true)
      } else {
        true
      };
      if should_write_tools_md {
        let tools_md_content = r#"# Tools

## Cross-Channel Awareness

You are running inside the **Knapsack desktop app** on the user's computer. You serve the same user across multiple channels — the desktop chat UI, Telegram, WhatsApp, and iMessage all share the same session and capabilities.

**Key facts:**
- Messages from **Telegram, WhatsApp, and iMessage** are handled by the same agent as the desktop chat — they share history and session state
- You have access to a **real desktop browser** on the user's machine — use it to check email, calendars, web apps, etc. regardless of which channel the message came from
- When a user messages you from Telegram asking to "check my calendar" or "look up something online", **use the browser tool** — you CAN do it
- The browser is logged into the user's accounts (Google, Microsoft, etc.), so you can access authenticated services
- Never say "I can't browse the web" or "I don't have access to your calendar" — you DO have access via the browser tool

**Reviewing past channel conversations:**
- To check what you've been discussing on **Telegram, WhatsApp, iMessage**, or any channel: use `sessions_list` to find sessions from that channel, then `sessions_history` to read the conversation
- Example: if the user asks "what have we been talking about on Telegram?", use `sessions_list` with a filter for Telegram sessions, then read the history — do NOT browse to web.telegram.org or the messaging app's website
- You already have direct access to all channel conversation history through the sessions tools — no need to use the browser for this

**Channel-specific notes:**
- **Desktop chat**: The user sees your response directly in the Knapsack app
- **Telegram/WhatsApp/iMessage**: The user sees your response in their messaging app. Keep responses concise and mobile-friendly. You can still use the browser, run scripts, and access files — the user just won't see the browser directly

## Images & Photos

When a user sends you a photo or image, you can see it. The image is automatically loaded and visible to you. Describe what you see, answer questions about it, or use it in context.

## Web Fetch

You have a `web_fetch` tool that can fetch and read the content of any URL. Use it when the user asks you to:
- Look up information on a website
- Read an article, blog post, or documentation page
- Check a specific URL for content
- Get data from a public API

Just call the tool with the URL and you'll get the page content back as markdown.

## Web Search

You have a `web_search` tool for searching the internet. Use it when the user asks you to:
- Research a topic
- Find current information, news, or events
- Look up facts, prices, or availability
- Find answers to questions you're unsure about

## Browser Automation

You have full browser control on the user's desktop. Use it proactively for any web-based task — including when messages come from Telegram, WhatsApp, or iMessage.

- **Check email**: Navigate to https://mail.google.com (or Outlook, etc.) and read/summarize
- **Check calendar**: Navigate to https://calendar.google.com and read upcoming events
- **Access web apps**: Gmail, Google Calendar, Google Drive, LinkedIn, GitHub, Slack, HubSpot, Salesforce, Notion, Jira, etc.
- **Fill forms, click buttons, type text** on any website

### When to use browser vs web_fetch

- Use **web_fetch** for simple page reads (articles, docs, public pages)
- Use **browser** for interactive tasks requiring login, forms, JavaScript-heavy pages, or multi-step flows

### Quick access URLs

- Gmail: https://mail.google.com
- Google Calendar: https://calendar.google.com
- Google Drive: https://drive.google.com
- GitHub: https://github.com
- LinkedIn: https://www.linkedin.com

### Workflow

1. Navigate to the relevant website
2. Take a snapshot to see the page content
3. Interact with elements (click, type) as needed
4. Read and summarize the results for the user

## File Operations

You can read and write local files, list directories, and search for files.

## Script Execution

You can run Python scripts for calculations, data processing, and file transformations.

## Shell & Command Execution

You have full shell access on the user's machine. Use the `exec` tool to run any shell command — bash, git, npm, pip, curl, etc. Use the `process` tool to manage long-running processes.

**IMPORTANT:** When the user asks you to run a command, install something, write code, or automate a task — DO IT directly using these tools. Never tell the user to run commands themselves or say you lack shell access. You ARE the agent — act on their behalf.

## Scheduling

You can create, list, and cancel scheduled tasks (cron jobs).
"#;
        match fs::write(&tools_md_path, tools_md_content) {
          Ok(_) => eprintln!("[clawd/service] Created workspace TOOLS.md at {}", tools_md_path.display()),
          Err(e) => eprintln!("[clawd/service] WARNING: Failed to write TOOLS.md: {}", e),
        }
      }

      // Run in local mode with explicit tokens/ports.
      let program_args = vec![
        node_path.to_string_lossy().to_string(),
        clawdbot_entry.to_string_lossy().to_string(),
        "gateway".to_string(),
        "run".to_string(),
        "--allow-unconfigured".to_string(),
        "--bind".to_string(),
        "loopback".to_string(),
        "--auth".to_string(),
        "token".to_string(),
        "--token".to_string(),
        tokens.gateway_token.clone(),
        "--port".to_string(),
        "18789".to_string(),
      ];

      // Resolve bundled plugins directory (extensions are shipped with the app)
      let bundled_plugins_dir = resource_path(&app_handle, "resources/clawdbot/extensions");
      let bundled_plugins_dir_str = bundled_plugins_dir.to_string_lossy().to_string();

      // Build a PATH that includes the directory where we found node (so npm
      // is also discoverable), plus common macOS paths.  LaunchAgents get a
      // minimal PATH by default which typically excludes /opt/homebrew/bin.
      let node_dir = node_path.parent().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
      let mut path_parts: Vec<String> = Vec::new();
      if !node_dir.is_empty() {
        path_parts.push(node_dir);
      }
      for p in &["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"] {
        let s = p.to_string();
        if !path_parts.contains(&s) {
          path_parts.push(s);
        }
      }
      let clawdbot_path = path_parts.join(":");

      // Resolve user HOME dir — LaunchAgents on macOS *usually* inherit it
      // from the user session, but some contexts (especially after reboot before
      // first interactive login) may not have it set.  Node.js and many npm
      // packages assume HOME is available.
      let user_home = dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

      let mut env = vec![
        ("PATH".to_string(), clawdbot_path),
        ("HOME".to_string(), user_home),
        // OpenClaw 2026.2+ only recognizes OPENCLAW_HOME (no CLAWDBOT_HOME fallback).
        ("OPENCLAW_HOME".to_string(), clawdbot_home_str.clone()),
        // Point state dir (config, sessions, logs) to the app data dir so
        // OpenClaw finds our config file instead of looking in ~/.openclaw/
        ("CLAWDBOT_STATE_DIR".to_string(), clawdbot_home_str),
        (
          "CLAWDBOT_GATEWAY_TOKEN".to_string(),
          tokens.gateway_token.clone(),
        ),
        (
          "OPENCLAW_GATEWAY_TOKEN".to_string(),
          tokens.gateway_token.clone(),
        ),
        // Browser control auth is now unified with gateway auth in OpenClaw 2026.2+.
        // The old CLAWDBOT_BROWSER_CONTROL_TOKEN is no longer recognized.
        // Ensure control server family ports remain default.
        ("CLAWDBOT_GATEWAY_PORT".to_string(), "18789".to_string()),
        // Point to bundled plugins/extensions directory so OpenClaw can find memory-core etc.
        // Note: only OPENCLAW_BUNDLED_PLUGINS_DIR is recognized in 2026.2+ (no CLAWDBOT_ fallback).
        ("OPENCLAW_BUNDLED_PLUGINS_DIR".to_string(), bundled_plugins_dir_str),
        // Suppress the repetitive "Config was last written by a newer OpenClaw" warning.
        // The gateway logs this on every config read; setting this env var tells it to
        // log the warning only once on startup instead of on every read cycle.
        ("OPENCLAW_QUIET_CONFIG_VERSION".to_string(), "1".to_string()),
      ];

      // Propagate LLM keys to clawdbot subprocess AND to the current Tauri process
      // (so the notetaker/transcription can also use GROQ_API_KEY via std::env::var).
      if let Some(k) = tokens.groq_api_key.clone() {
        let k = k.trim().to_string();
        if !k.is_empty() {
          std::env::set_var("GROQ_API_KEY", &k);
          env.push(("GROQ_API_KEY".to_string(), k));
        }
      }

      if let Some(k) = tokens.openai_api_key.clone() {
        let k = k.trim().to_string();
        if !k.is_empty() {
          std::env::set_var("OPENAI_API_KEY", &k);
          env.push(("OPENAI_API_KEY".to_string(), k));
        }
      }

      if let Some(k) = tokens.anthropic_api_key.clone() {
        let k = k.trim().to_string();
        if !k.is_empty() {
          std::env::set_var("ANTHROPIC_API_KEY", &k);
          env.push(("ANTHROPIC_API_KEY".to_string(), k));
        }
      }

      if let Some(k) = tokens.gemini_api_key.clone() {
        let k = k.trim().to_string();
        if !k.is_empty() {
          std::env::set_var("GEMINI_API_KEY", &k);
          env.push(("GEMINI_API_KEY".to_string(), k));
        }
      }

      // Propagate Ollama settings to clawdbot subprocess
      if tokens.ollama_enabled.unwrap_or(false) {
        std::env::set_var("OLLAMA_API_KEY", "ollama-local");
        env.push(("OLLAMA_API_KEY".to_string(), "ollama-local".to_string()));
        if let Some(m) = tokens.ollama_model.clone() {
          let m = m.trim().to_string();
          if !m.is_empty() {
            std::env::set_var("KNAPSACK_OLLAMA_MODEL", &m);
            env.push(("KNAPSACK_OLLAMA_MODEL".to_string(), m));
          }
        }
        if let Some(u) = tokens.ollama_base_url.clone() {
          let u = u.trim().to_string();
          if !u.is_empty() {
            std::env::set_var("OLLAMA_HOST", &u);
            env.push(("OLLAMA_HOST".to_string(), u));
          }
        }
      }

      // Propagate extra provider keys (MiniMax, ZAI/GLM, HuggingFace, etc.)
      if let Some(extra) = &tokens.extra_provider_keys {
        for (env_var, key) in extra {
          let key = key.trim().to_string();
          if !key.is_empty() && is_allowed_extra_env_var(env_var) {
            std::env::set_var(env_var, &key);
            env.push((env_var.clone(), key));
          }
        }
      }

      // Also set gateway token in the current Tauri process so that
      // in-process RPC callers (browser_request, etc.) can resolve
      // the token via env var without needing an explicit parameter.
      {
        let gw = tokens.gateway_token.trim();
        if !gw.is_empty() {
          std::env::set_var("CLAWDBOT_GATEWAY_TOKEN", gw);
          std::env::set_var("OPENCLAW_GATEWAY_TOKEN", gw);
        }
      }

      let plist = generate_plist(&program_args, &env);
      if let Err(e) = fs::write(&plist_path, plist) {
        return HttpResponse::InternalServerError().json(EnableServiceResponse {
          success: false,
          enabled,
          message: format!("Failed writing plist {}: {}", plist_path.display(), e),
        });
      }

      // Kill any stale Chrome processes from a previous clawdbot session so
      // the new gateway can grab the CDP port (18800).
      kill_stale_clawdbot_chromes();

      // bootstrap + kickstart
      let uid = unsafe { libc::getuid() };
      let domain = format!("gui/{}", uid);

      // unload old if present (ignore errors)
      let _ = std::process::Command::new("launchctl")
        .args(["bootout", &domain, plist_path.to_string_lossy().as_ref()])
        .status();

      let boot = std::process::Command::new("launchctl")
        .args(["bootstrap", &domain, plist_path.to_string_lossy().as_ref()])
        .status();

      if let Err(e) = boot {
        return HttpResponse::InternalServerError().json(EnableServiceResponse {
          success: false,
          enabled,
          message: format!("launchctl bootstrap failed: {}", e),
        });
      }

      let service = format!("{}/{}", domain, LAUNCH_AGENT_LABEL);
      let _ = std::process::Command::new("launchctl")
        .args(["kickstart", "-k", &service])
        .status();

      // Best-effort: auto-configure browser control URL for Knapsack (in-memory)
      {
        let mut cfg_guard = cfg.write().await;
        cfg_guard.base_url = Some("http://127.0.0.1:18791".to_string());
      }

      // Log version and OS info for diagnostics
      let app_version = app_handle.package_info().version.to_string();
      let os_info = format!("{} {}", std::env::consts::OS, std::env::consts::ARCH);
      eprintln!(
        "[clawd/service] Knapsack v{} on {} — starting service ({})",
        app_version, os_info, LAUNCH_AGENT_LABEL
      );

      let is_bundled_node = node_path == bundled_node_path;
      HttpResponse::Ok().json(EnableServiceResponse {
        success: true,
        enabled,
        message: format!(
          "Enabled background service ({}) using {} Node.js — Knapsack v{} on {}",
          LAUNCH_AGENT_LABEL,
          if is_bundled_node { "bundled" } else { "system" },
          app_version,
          os_info
        ),
      })
    } else {
      // Disable
      let uid = unsafe { libc::getuid() };
      let domain = format!("gui/{}", uid);

      let _ = std::process::Command::new("launchctl")
        .args(["bootout", &domain, plist_path.to_string_lossy().as_ref()])
        .status();

      let _ = fs::remove_file(&plist_path);

      HttpResponse::Ok().json(EnableServiceResponse {
        success: true,
        enabled,
        message: format!("Disabled background service ({})", LAUNCH_AGENT_LABEL),
      })
    }
  }
}

/// Cycle (restart) the LaunchAgent service.  Called from browser.rs when a
/// connection error is detected during a tool call, to auto-recover without
/// requiring the user to manually click Enable/Disable.
#[cfg(target_os = "macos")]
pub async fn cycle_service(_app_handle: &tauri::AppHandle) {
  let Ok(plist_path) = launch_agent_plist_path() else { return };
  if !plist_path.exists() { return }

  let uid = unsafe { libc::getuid() };
  let domain = format!("gui/{}", uid);
  let plist_str = plist_path.to_string_lossy().to_string();

  eprintln!("[clawd/service] Auto-cycling service to recover browser connection...");
  let _ = std::process::Command::new("launchctl")
    .args(["bootout", &domain, &plist_str])
    .status();

  // Brief pause before restarting
  tokio::time::sleep(std::time::Duration::from_millis(500)).await;

  let _ = std::process::Command::new("launchctl")
    .args(["bootstrap", &domain, &plist_str])
    .status();

  let service = format!("{}/{}", domain, LAUNCH_AGENT_LABEL);
  let _ = std::process::Command::new("launchctl")
    .args(["kickstart", "-k", &service])
    .status();

  eprintln!("[clawd/service] Service cycle complete — waiting for browser to start.");
}

#[cfg(not(target_os = "macos"))]
pub async fn cycle_service(_app_handle: &tauri::AppHandle) {
  // No-op on non-macOS platforms
}

// --- Skills API endpoint (static catalog) ---

/// Return built-in skills catalog (static JSON file, no gateway dependency)
#[get("/api/clawd/skills/status")]
pub async fn skills_status(_h: web::Data<tauri::AppHandle>) -> impl Responder {
  let catalog: serde_json::Value = serde_json::from_str(
    include_str!("skills_catalog.json")
  ).unwrap_or_default();
  HttpResponse::Ok().json(serde_json::json!({"success": true, "skills": catalog}))
}

/// Install a skill — requires the gateway (clawdbot) to be running
#[derive(Debug, Deserialize)]
pub struct SkillInstallRequest {
  pub name: String,
  #[serde(rename = "installId")]
  pub install_id: Option<String>,
}

#[post("/api/clawd/skills/install")]
pub async fn skills_install(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<SkillInstallRequest>,
) -> impl Responder {
  let tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError()
        .json(serde_json::json!({"success": false, "error": e}))
    }
  };

  let mut params = serde_json::json!({"name": payload.name});
  if let Some(ref id) = payload.install_id {
    params["installId"] = serde_json::json!(id);
  }

  match super::gateway_client::gateway_request_pooled(
    "skills.install",
    Some(params),
    &tokens.gateway_token,
  ).await {
    Ok(result) => HttpResponse::Ok().json(serde_json::json!({"success": true, "result": result})),
    Err(e) => {
      eprintln!("[clawd/service] skills.install error: {}", e);
      HttpResponse::BadGateway()
        .json(serde_json::json!({"success": false, "error": "Skill installation requires the ClawdBot gateway to be running. Check the Activity panel for gateway status."}))
    }
  }
}

/// Update a skill's config (enable/disable, set API key)
#[derive(Debug, Deserialize)]
pub struct SkillUpdateRequest {
  #[serde(rename = "skillKey")]
  pub skill_key: String,
  pub enabled: Option<bool>,
  #[serde(rename = "apiKey")]
  pub api_key: Option<String>,
  pub env: Option<serde_json::Value>,
}

#[post("/api/clawd/skills/update")]
pub async fn skills_update(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<SkillUpdateRequest>,
) -> impl Responder {
  let tokens = match load_or_create_tokens(&app_handle) {
    Ok(t) => t,
    Err(e) => {
      return HttpResponse::InternalServerError()
        .json(serde_json::json!({"success": false, "error": e}))
    }
  };

  let mut params = serde_json::json!({"skillKey": payload.skill_key});
  if let Some(enabled) = payload.enabled {
    params["enabled"] = serde_json::json!(enabled);
  }
  if let Some(ref key) = payload.api_key {
    params["apiKey"] = serde_json::json!(key);
  }
  if let Some(ref env) = payload.env {
    params["env"] = env.clone();
  }

  match super::gateway_client::gateway_request_pooled(
    "skills.update",
    Some(params),
    &tokens.gateway_token,
  ).await {
    Ok(result) => HttpResponse::Ok().json(serde_json::json!({"success": true, "result": result})),
    Err(e) => {
      eprintln!("[clawd/service] skills.update error: {}", e);
      HttpResponse::BadGateway()
        .json(serde_json::json!({"success": false, "error": format!("Failed to update skill: {}", e)}))
    }
  }
}
