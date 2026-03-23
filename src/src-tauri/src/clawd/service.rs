use actix_web::{get, post, web, HttpResponse, Responder};
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};

use crate::clawd::gateway_client;
use crate::clawd::sidecar::SharedClawdbotConfig;

// ── Windows process management ──────────────────────────────────────────
// On Windows we spawn the gateway as a child process (no launchd/launchctl).
// Track the PID so we can check status and kill it on disable.
#[cfg(target_os = "windows")]
static GATEWAY_PID: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

#[cfg(target_os = "windows")]
fn windows_log_path(stream: &str) -> PathBuf {
  let temp = std::env::temp_dir();
  match stream {
    "stdout" => temp.join("knapsack-clawdbot.out.log"),
    _ => temp.join("knapsack-clawdbot.err.log"),
  }
}

/// On Windows, kill a process listening on the given TCP port.
#[cfg(target_os = "windows")]
fn kill_process_on_port(port: u16) {
  use std::os::windows::process::CommandExt;
  const CREATE_NO_WINDOW: u32 = 0x08000000;
  let output = std::process::Command::new("netstat")
    .args(["-ano", "-p", "tcp"])
    .creation_flags(CREATE_NO_WINDOW)
    .output();
  if let Ok(out) = output {
    let text = String::from_utf8_lossy(&out.stdout);
    for line in text.lines() {
      if line.contains(&format!(":{} ", port)) && line.to_uppercase().contains("LISTENING") {
        if let Some(pid_str) = line.split_whitespace().last() {
          if let Ok(pid) = pid_str.parse::<u32>() {
            if pid > 0 {
              eprintln!("[clawd/service] killing process on port {} (pid {})", port, pid);
              let _ = std::process::Command::new("taskkill")
                .args(["/PID", &pid.to_string(), "/F"])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
            }
          }
        }
      }
    }
  }
}

/// Check if a process with the given PID is still running (Windows).
#[cfg(target_os = "windows")]
fn is_pid_alive(pid: u32) -> bool {
  if pid == 0 { return false; }
  use std::os::windows::process::CommandExt;
  const CREATE_NO_WINDOW: u32 = 0x08000000;
  std::process::Command::new("tasklist")
    .args(["/FI", &format!("PID eq {}", pid), "/NH"])
    .creation_flags(CREATE_NO_WINDOW)
    .output()
    .map(|o| {
      let out = String::from_utf8_lossy(&o.stdout);
      out.contains(&pid.to_string()) && !out.contains("No tasks")
    })
    .unwrap_or(false)
}

/// Whether we've already sent a one-shot `/start` nudge to the gateway's
/// browser control.  Reset when the gateway transitions from down to up,
/// or when the browser transitions from healthy to down, so the nudge
/// fires again after a gateway restart or a browser crash.
static BROWSER_START_NUDGED: AtomicBool = AtomicBool::new(false);

/// Tracks whether the gateway was healthy on the last health check.
/// Used to detect down→up transitions and reset BROWSER_START_NUDGED.
static GATEWAY_WAS_HEALTHY: AtomicBool = AtomicBool::new(false);

/// Tracks whether the browser was healthy on the last health check.
/// Used to detect healthy→down transitions (browser crashes) and reset
/// BROWSER_START_NUDGED so the recovery nudge can fire again.
static BROWSER_WAS_HEALTHY: AtomicBool = AtomicBool::new(false);

/// Tracks whether a gateway restart attempt is already in progress,
/// so the health endpoint doesn't spam `launchctl kickstart` on every poll.
static GATEWAY_RESTART_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

/// Resolve the directory for gateway service logs.
///
/// On macOS this is `~/Library/Logs/Knapsack/` (the conventional location for
/// application logs; survives reboots, unlike `/tmp`).
/// On other platforms we fall back to `~/.knapsack/logs/`.
/// The directory is created if it doesn't exist yet.
pub fn gateway_log_dir() -> PathBuf {
  let base = if cfg!(target_os = "macos") {
    dirs::home_dir()
      .map(|h| h.join("Library/Logs/Knapsack"))
      .unwrap_or_else(|| PathBuf::from("/tmp"))
  } else {
    dirs::home_dir()
      .map(|h| h.join(".knapsack/logs"))
      .unwrap_or_else(|| PathBuf::from("/tmp"))
  };
  let _ = std::fs::create_dir_all(&base);
  base
}

/// Path to the gateway stdout log file.
pub fn gateway_stdout_log() -> PathBuf {
  gateway_log_dir().join("knapsack-clawdbot.out.log")
}

/// Path to the gateway stderr log file.
pub fn gateway_stderr_log() -> PathBuf {
  gateway_log_dir().join("knapsack-clawdbot.err.log")
}

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

/// Stop and remove the standalone OpenClaw gateway LaunchAgent if present.
///
/// When a user previously installed standalone OpenClaw (`ai.openclaw.gateway`)
/// and then switches to Knapsack Desktop (`ai.knap.knapsack.clawdbot`), both
/// services compete for port 18789.  The standalone gateway may also use a
/// different device token, causing "device token mismatch" errors.
///
/// This function is best-effort: if the plist doesn't exist or bootout fails,
/// we silently continue.
#[cfg(target_os = "macos")]
fn remove_stale_standalone_gateway() {
  const STANDALONE_LABEL: &str = "ai.openclaw.gateway";
  let home = match dirs::home_dir() {
    Some(h) => h,
    None => return,
  };
  let plist_path = home
    .join("Library")
    .join("LaunchAgents")
    .join(format!("{}.plist", STANDALONE_LABEL));

  if !plist_path.exists() {
    return;
  }

  eprintln!(
    "[clawd/service] Found standalone OpenClaw gateway plist at {}; removing to avoid port conflict",
    plist_path.display()
  );

  let uid = unsafe { libc::getuid() };
  let domain = format!("gui/{}", uid);

  // Try to unload the service first
  let _ = std::process::Command::new("launchctl")
    .args(["bootout", &domain, plist_path.to_string_lossy().as_ref()])
    .status();

  // Remove the plist file so it doesn't get reloaded on login
  if let Err(e) = std::fs::remove_file(&plist_path) {
    eprintln!(
      "[clawd/service] Failed to remove standalone plist {}: {}",
      plist_path.display(),
      e
    );
  } else {
    eprintln!("[clawd/service] Removed standalone OpenClaw gateway plist");
  }

  // Give the old gateway a moment to exit
  std::thread::sleep(std::time::Duration::from_millis(1000));
}

#[cfg(target_os = "windows")]
fn kill_stale_clawdbot_chromes() {
  // Best effort: kill any Chrome holding the CDP port (18800).
  kill_process_on_port(18800);
  // Give Chrome a moment to exit so the port is released.
  std::thread::sleep(std::time::Duration::from_millis(500));
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn kill_stale_clawdbot_chromes() {
  // No-op on other platforms
}

#[cfg(not(target_os = "macos"))]
fn remove_stale_standalone_gateway() {
  // No-op on other platforms
}

/// Check if the gateway Node.js binary or the bundled clawdbot directory is
/// quarantined by macOS Gatekeeper.  When a DMG-installed app is not properly
/// code-signed and notarized, macOS adds a `com.apple.quarantine` xattr to the
/// files.  The gateway process can then be silently killed by Gatekeeper
/// (SIGKILL with no visible error) immediately after launch.
///
/// This diagnostic runs only when the gateway is down and the LaunchAgent is
/// loaded, to help surface the root cause in the health check response.
#[cfg(target_os = "macos")]
fn check_gatekeeper_quarantine(app_handle: &tauri::AppHandle, message: &mut String) {
  let clawdbot_home = app_clawdbot_home(app_handle);

  // Check quarantine xattr on the clawdbot home directory itself
  let check_targets = vec![
    clawdbot_home.clone(),
    clawdbot_home.join("dist").join("entry.js"),
  ];

  for target in &check_targets {
    if !target.exists() {
      continue;
    }
    let output = std::process::Command::new("xattr")
      .args(["-p", "com.apple.quarantine"])
      .arg(target)
      .output();
    match output {
      Ok(out) if out.status.success() => {
        let xattr_val = String::from_utf8_lossy(&out.stdout);
        eprintln!(
          "[clawd/service] Gatekeeper quarantine detected on {}: {}",
          target.display(),
          xattr_val.trim()
        );
        message.push_str(&format!(
          "\n[diagnostic] macOS Gatekeeper quarantine detected on {}. \
           The gateway binary may be blocked from running. \
           Try: xattr -cr \"{}\" or re-download from the latest signed release.",
          target.display(),
          clawdbot_home.display()
        ));
        return; // One diagnostic is enough
      }
      _ => {} // No quarantine xattr — good
    }
  }

  // Also check the node binary used by the gateway
  let resource_dir = app_handle.path_resolver().resource_dir();
  if let Some(res_dir) = resource_dir {
    let node_binary = res_dir.join("resources").join("node").join("node");
    if node_binary.exists() {
      // Verify code signature
      let codesign_check = std::process::Command::new("codesign")
        .args(["--verify", "--deep", "--strict"])
        .arg(&node_binary)
        .output();
      match codesign_check {
        Ok(out) if !out.status.success() => {
          let stderr = String::from_utf8_lossy(&out.stderr);
          eprintln!(
            "[clawd/service] Node binary code-sign verification failed: {}",
            stderr.trim()
          );
          message.push_str(&format!(
            "\n[diagnostic] Gateway node binary has an invalid code signature: {}. \
             macOS Gatekeeper may be killing the process. \
             Re-install from the latest notarized DMG release.",
            stderr.trim()
          ));
        }
        _ => {}
      }
    }
  }

  // Check for recent crash reports from the gateway
  if let Some(home) = dirs::home_dir() {
    let crash_dir = home.join("Library").join("Logs").join("DiagnosticReports");
    if crash_dir.is_dir() {
      let check_output = std::process::Command::new("ls")
        .args(["-t"])
        .arg(&crash_dir)
        .output();
      if let Ok(out) = check_output {
        let listing = String::from_utf8_lossy(&out.stdout);
        let recent_crashes: Vec<&str> = listing
          .lines()
          .filter(|l| {
            let lower = l.to_lowercase();
            lower.contains("node") || lower.contains("knapsack") || lower.contains("claw")
          })
          .take(3)
          .collect();
        if !recent_crashes.is_empty() {
          let crash_names = recent_crashes.join(", ");
          eprintln!("[clawd/service] Found potentially related crash reports: {}", crash_names);
          message.push_str(&format!(
            "\n[diagnostic] Crash reports found in ~/Library/Logs/DiagnosticReports/: {}. \
             This may indicate the gateway process is crashing on startup.",
            crash_names
          ));
        }
      }
    }
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
    if !k.is_empty() {
      if validate_api_key_format(k).is_ok() {
        std::env::set_var("OPENROUTER_API_KEY", k);
      } else {
        eprintln!("[clawd/service] WARNING: stored OPENROUTER_API_KEY looks malformed (len={}), skipping propagation. Please re-enter your key in Settings.", k.len());
      }
    }
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

  // Set OPENCLAW_HOME so gateway_client can find the config file for
  // token sync and browser config patching (especially important on
  // Windows where HOME is not set).
  let home = app_clawdbot_home(app_handle);
  let home_str = home.to_string_lossy().to_string();
  std::env::set_var("OPENCLAW_HOME", &home_str);
  std::env::set_var("CLAWDBOT_STATE_DIR", &home_str);
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
    stdout = gateway_stdout_log().to_string_lossy(),
    stderr = gateway_stderr_log().to_string_lossy()
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
  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    // On unsupported platforms, still check if the gateway happens to be running.
    let gateway_ok = reqwest::Client::builder()
      .timeout(std::time::Duration::from_millis(800))
      .build()
      .ok()
      .map(|c| c.get("http://127.0.0.1:18789/health").send());
    let gateway_ok = match gateway_ok {
      Some(fut) => fut.await.map(|r| r.status().is_success() || r.status().as_u16() == 404).unwrap_or(false),
      None => false,
    };
    let message = if gateway_ok {
      "Gateway is reachable (started externally). Auto-management not available on this platform.".to_string()
    } else {
      "Gateway not reachable. Service management is not available on this platform.".to_string()
    };
    return HttpResponse::Ok().json(ServiceHealthResponse {
      success: gateway_ok,
      gateway_ok,
      browser_ok: false,
      message,
    });
  }

  #[cfg(any(target_os = "macos", target_os = "windows"))]
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

    // Track gateway state transitions for recovery logic.
    let was_healthy = GATEWAY_WAS_HEALTHY.load(Ordering::Relaxed);

    if gateway_ok {
      // Gateway is up — record it so we can detect down→up transitions.
      GATEWAY_WAS_HEALTHY.store(true, Ordering::Relaxed);

      // If the gateway just came back (was previously down), reset the
      // browser nudge flag so we'll send a fresh /start nudge if needed.
      if !was_healthy {
        eprintln!("[clawd/service] gateway recovered — resetting browser nudge flag");
        BROWSER_START_NUDGED.store(false, Ordering::Relaxed);
        // Kill stale managed Chrome processes from the previous gateway
        // session.  They may still hold the CDP port (18800), preventing
        // the new gateway from launching its own browser.
        #[cfg(any(target_os = "macos", target_os = "windows"))]
        kill_stale_clawdbot_chromes();
        // Invalidate the pooled WebSocket connection — the old one is dead.
        gateway_client::invalidate();
      }
    } else {
      GATEWAY_WAS_HEALTHY.store(false, Ordering::Relaxed);
      // Gateway is down — browser can't be healthy either, reset its state.
      BROWSER_WAS_HEALTHY.store(false, Ordering::Relaxed);
    }

    // If gateway is down, try to restart it via launchctl kickstart.
    // This runs in a background task to avoid blocking the health poll.
    // We guard with GATEWAY_RESTART_IN_PROGRESS to prevent concurrent restarts.
    if !gateway_ok && !GATEWAY_RESTART_IN_PROGRESS.swap(true, Ordering::Relaxed) {
      let token = tokens.gateway_token.clone();
      eprintln!("[clawd/service] gateway not reachable — attempting background restart");
      tokio::spawn(async move {
        // Kill stale managed Chrome processes before restarting the gateway.
        // When the gateway exits, its Chrome child survives and holds the
        // CDP port (18800).  Without cleanup the new gateway can't launch
        // its own browser and browser control stays permanently down.
        #[cfg(any(target_os = "macos", target_os = "windows"))]
        kill_stale_clawdbot_chromes();

        use crate::clawd::gateway_supervisor;
        let result = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, &token).await;
        eprintln!("[clawd/service] gateway restart attempt: {} ({})", result.message,
          if result.running { "running" } else { "not running" });
        GATEWAY_RESTART_IN_PROGRESS.store(false, Ordering::Relaxed);
      });
    }

    // Browser control is accessed through the gateway's `browser.request` RPC
    // method.  Send a lightweight request to verify it's responsive.
    // Use a 5-second timeout to avoid blocking the health endpoint when the
    // browser RPC is slow (the default pooled request timeout is 30s).
    let browser_ok = if gateway_ok {
      // Try with "openclaw" profile (the managed, isolated browser profile
      // created by the gateway).  Fall back to no-profile if it fails.
      let check = tokio::time::timeout(
        std::time::Duration::from_secs(5),
        gateway_client::browser_request(
          "GET", "/tabs", Some(serde_json::json!({"profile": "openclaw"})), None, None,
        ),
      ).await;
      match check {
        Ok(Ok(_)) => true,
        Ok(Err(e)) => {
          eprintln!("[clawd/service] browser health check failed (profile=openclaw): {}", e);
          // Fallback: try without profile restriction
          match tokio::time::timeout(
            std::time::Duration::from_secs(3),
            gateway_client::browser_request("GET", "/tabs", None, None, None),
          ).await {
            Ok(Ok(_)) => {
              eprintln!("[clawd/service] browser health check succeeded without profile filter");
              true
            }
            Ok(Err(e2)) => {
              eprintln!("[clawd/service] browser health check failed (no profile): {}", e2);
              false
            }
            Err(_) => {
              eprintln!("[clawd/service] browser health check timed out (no profile, 3s)");
              false
            }
          }
        }
        Err(_) => {
          eprintln!("[clawd/service] browser health check timed out (5s)");
          false
        }
      }
    } else {
      false
    };

    // Track browser state transitions for crash recovery.
    // If the browser was previously healthy and is now down, reset the
    // nudge flag so we can send a fresh /start to recover from crashes.
    let browser_was_healthy = BROWSER_WAS_HEALTHY.load(Ordering::Relaxed);
    if browser_ok {
      BROWSER_WAS_HEALTHY.store(true, Ordering::Relaxed);
    } else if browser_was_healthy {
      // Browser just went from healthy → down (crashed).
      BROWSER_WAS_HEALTHY.store(false, Ordering::Relaxed);
      BROWSER_START_NUDGED.store(false, Ordering::Relaxed);
      eprintln!("[clawd/service] browser was healthy but is now down — resetting nudge flag for crash recovery");
    }

    // If the gateway is healthy but browser control isn't responding, send
    // a `/start` nudge.  This is idempotent on the gateway — if the
    // browser is already starting it's a no-op.  The flag resets when the
    // gateway recovers (down→up transition above) or when the browser
    // crashes (healthy→down transition above), so the nudge can fire
    // again after a gateway restart or browser crash.
    if gateway_ok && !browser_ok && !BROWSER_START_NUDGED.swap(true, Ordering::Relaxed) {
      eprintln!("[clawd/service] browser not reachable — sending /start nudge");
      tokio::spawn(async {
        match tokio::time::timeout(
          std::time::Duration::from_secs(10),
          gateway_client::browser_request(
            "POST", "/start", Some(serde_json::json!({"profile": "openclaw"})), None, None,
          ),
        ).await {
          Ok(Ok(_)) => eprintln!("[clawd/service] browser /start nudge succeeded"),
          Ok(Err(e)) => eprintln!("[clawd/service] browser /start nudge failed: {}", e),
          Err(_) => eprintln!("[clawd/service] browser /start nudge timed out"),
        }
      });
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
      // macOS-specific diagnostics: check LaunchAgent plist and launchctl status
      #[cfg(target_os = "macos")]
      {
        match launch_agent_plist_path() {
          Ok(plist) => {
            if !plist.exists() {
              message.push_str("\n[diagnostic] LaunchAgent plist not found — service may not be enabled. Try toggling Enable in Settings.");
              eprintln!("[clawd/service] gateway down: plist not found at {}", plist.display());
            } else {
              let uid = unsafe { libc::getuid() };
              let domain = format!("gui/{}/{}", uid, LAUNCH_AGENT_LABEL);
              let loaded = std::process::Command::new("launchctl")
                .args(["print", &domain])
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false);
              if !loaded {
                message.push_str("\n[diagnostic] LaunchAgent plist exists but service is not loaded. Try disabling and re-enabling in Settings.");
                eprintln!("[clawd/service] gateway down: plist exists but service not loaded (label={})", LAUNCH_AGENT_LABEL);
              } else {
                eprintln!("[clawd/service] gateway down: service is loaded but not responding on port 18789");

                // Check if Gatekeeper quarantine is blocking the gateway binary.
                // macOS can silently kill quarantined or improperly signed processes.
                check_gatekeeper_quarantine(&app_handle, &mut message);
              }
            }
          }
          Err(e) => {
            message.push_str(&format!("\n[diagnostic] Could not resolve LaunchAgent path: {}", e));
          }
        }
      }

      // Windows-specific diagnostics: check tracked PID
      #[cfg(target_os = "windows")]
      {
        let pid = GATEWAY_PID.load(Ordering::Relaxed);
        if pid == 0 {
          message.push_str("\n[diagnostic] No gateway process tracked — service may not be enabled. Try toggling Enable.");
          eprintln!("[clawd/service] gateway down: no PID tracked");
        } else if !is_pid_alive(pid) {
          message.push_str(&format!("\n[diagnostic] Gateway process (pid {}) is no longer running. Try re-enabling.", pid));
          eprintln!("[clawd/service] gateway down: tracked pid {} is dead", pid);
        } else {
          eprintln!("[clawd/service] gateway down: process pid {} alive but not responding on port 18789", pid);
        }
      }

      let err_path = gateway_stderr_log();
      // Also check legacy /tmp path for users who haven't restarted the service yet.
      let legacy_err_path = std::path::PathBuf::from("/tmp/knapsack-clawdbot.err.log");
      let log_content = std::fs::read_to_string(&err_path)
        .or_else(|_| std::fs::read_to_string(&legacy_err_path));
      if let Ok(content) = log_content {
        let tail: Vec<&str> = content.lines().rev().take(25).collect();
        if !tail.is_empty() {
          let mut tail_lines: Vec<&str> = tail.into_iter().collect();
          tail_lines.reverse();
          message.push_str("\n--- last stderr ---\n");
          message.push_str(&tail_lines.join("\n"));
        }
      } else {
        message.push_str(&format!("\n[diagnostic] No stderr log found at {} — gateway may have never started.", err_path.display()));
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
  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    return HttpResponse::NotImplemented().json(ServiceLogsResponse {
      success: false,
      stream: query.stream.clone().unwrap_or("stderr".to_string()),
      lines: query.lines.unwrap_or(200),
      text: "Service management is not implemented for this platform".to_string(),
    });
  }

  #[cfg(target_os = "windows")]
  {
    let stream = query.stream.clone().unwrap_or("stderr".to_string());
    let lines = query.lines.unwrap_or(200).min(2000);
    let path = windows_log_path(&stream);

    let mut s = String::new();
    if let Ok(mut f) = fs::File::open(&path) {
      let _ = f.read_to_string(&mut s);
    }

    let mut out_lines = s.lines().rev().take(lines).collect::<Vec<_>>();
    out_lines.reverse();

    return HttpResponse::Ok().json(ServiceLogsResponse {
      success: true,
      stream,
      lines,
      text: out_lines.join("\n"),
    });
  }

  #[cfg(target_os = "macos")]
  {
    let stream = query.stream.clone().unwrap_or("stderr".to_string());
    let lines = query.lines.unwrap_or(200).min(2000);

    let path = match stream.as_str() {
      "stdout" => gateway_stdout_log(),
      _ => gateway_stderr_log(),
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
  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    return HttpResponse::NotImplemented().json(ServiceStatusResponse {
      success: false,
      installed: false,
      running: false,
      label: LAUNCH_AGENT_LABEL.to_string(),
      message: "Service management is not implemented for this platform".to_string(),
    });
  }

  #[cfg(target_os = "windows")]
  {
    // Check if the tracked process is alive, or if the gateway port is responding
    let pid = GATEWAY_PID.load(Ordering::Relaxed);
    let pid_alive = is_pid_alive(pid);

    // Fallback: check if port 18789 is open (gateway may have been started externally)
    let port_open = if !pid_alive {
      std::net::TcpStream::connect_timeout(
        &std::net::SocketAddr::from(([127, 0, 0, 1], 18789u16)),
        std::time::Duration::from_millis(500),
      ).is_ok()
    } else {
      true
    };

    let running = pid_alive || port_open;

    return HttpResponse::Ok().json(ServiceStatusResponse {
      success: true,
      installed: true,
      running,
      label: LAUNCH_AGENT_LABEL.to_string(),
      message: if running {
        "Clawdbot service is running".to_string()
      } else {
        "Clawdbot service is not running".to_string()
      },
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

/// Validate that a string looks like a real API key (not markdown, prose, or garbage).
/// Returns `Ok(())` if valid, or `Err(message)` with a human-readable reason.
fn validate_api_key_format(key: &str) -> Result<(), String> {
  // API keys should be printable ASCII only
  if key.bytes().any(|b| b < 0x20 || b > 0x7e) {
    return Err("API key contains invalid characters. Keys should be printable ASCII only.".into());
  }
  // API keys are typically under 256 characters; 693 chars of markdown is not a key
  if key.len() > 256 {
    return Err(format!(
      "API key is too long ({} characters). Please paste only the key, not documentation.",
      key.len()
    ));
  }
  // Reject strings that look like markdown or prose (start with heading, bullet, etc.)
  let lower = key.trim_start();
  if lower.starts_with('#') || lower.starts_with("* ") || lower.starts_with("- ") {
    return Err("This looks like markdown or documentation text, not an API key.".into());
  }
  // Reject if it contains spaces (API keys never contain spaces)
  if key.contains(' ') {
    return Err("API key contains spaces. Please paste only the key value.".into());
  }
  Ok(())
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

  // Validate key format before storing (skip for ollama which uses a dummy key)
  if !key.is_empty() && provider != "ollama" {
    if let Err(msg) = validate_api_key_format(&key) {
      return HttpResponse::BadRequest().json(SetApiKeyResponse {
        success: false,
        message: msg,
      });
    }
  }

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
    // Ollama env vars: only set when Ollama is the active provider.
    // When switching AWAY from Ollama, clear the env vars so the gateway's
    // provider discovery won't pick up a stale Ollama provider.
    if provider == "ollama" && tokens.ollama_enabled.unwrap_or(false) {
      std::env::set_var("OLLAMA_API_KEY", "ollama-local");
      if let Some(m) = &tokens.ollama_model { std::env::set_var("KNAPSACK_OLLAMA_MODEL", m); }
      if let Some(u) = &tokens.ollama_base_url { std::env::set_var("OLLAMA_HOST", u); }
    } else if provider != "ollama" {
      std::env::remove_var("OLLAMA_API_KEY");
      std::env::remove_var("KNAPSACK_OLLAMA_MODEL");
      std::env::remove_var("OLLAMA_HOST");
    }

    // Update agents.defaults.model in the config file so the gateway uses
    // the correct model on restart.  Without this, a stale model (e.g.
    // ollama/deepseek-r1:8b) persists in openclaw.json even after the user
    // switches providers via the toolbar (no-key switch path).
    let config_path = app_clawdbot_home(&app_handle).join("openclaw.json");
    if let Ok(cfg_str) = fs::read_to_string(&config_path) {
      if let Ok(mut cfg_val) = serde_json::from_str::<serde_json::Value>(&cfg_str) {
        let model = crate::clawd::gateway_client::resolve_default_model();
        let agents = cfg_val
          .as_object_mut()
          .unwrap()
          .entry("agents")
          .or_insert_with(|| serde_json::json!({}));
        let mut empty_map = serde_json::Map::new();
        let defaults = agents
          .as_object_mut()
          .unwrap_or(&mut empty_map)
          .entry("defaults")
          .or_insert_with(|| serde_json::json!({}));
        defaults.as_object_mut().map(|d| {
          d.insert("model".to_string(), serde_json::json!({"primary": model}));
        });
        if let Ok(json) = serde_json::to_string_pretty(&cfg_val) {
          let _ = fs::write(&config_path, json);
          eprintln!("[clawd/service] Updated agents.defaults.model to '{}' in config file (provider switch)", model);
        }
      }
    }

    // Provider switch requires a full gateway restart — a config.patch only
    // updates the default model but does NOT re-run provider discovery, so
    // the old provider (e.g. Ollama) stays in the catalog and the gateway
    // keeps routing requests through it.
    //
    // Kill the running gateway; the health-check will auto-restart it with
    // the updated env vars and correct provider discovery.
    let switch_model = crate::clawd::gateway_client::resolve_default_model();
    eprintln!(
      "[clawd/service] Provider switch to '{}' (model: {}) — restarting gateway for provider re-discovery",
      provider, switch_model
    );
    // Invalidate the cached WS connection first
    crate::clawd::gateway_client::invalidate();
    #[cfg(target_os = "windows")]
    {
      kill_process_on_port(18789);
    }
    #[cfg(target_os = "macos")]
    {
      let pid = GATEWAY_PID.load(std::sync::atomic::Ordering::Relaxed);
      if pid > 0 {
        unsafe { libc::kill(pid as i32, libc::SIGTERM); }
        GATEWAY_PID.store(0, std::sync::atomic::Ordering::Relaxed);
      }
    }
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
  if let Some(k) = &tokens.openrouter_api_key {
    eprintln!("[clawd/service] set-api-key: propagating OPENROUTER_API_KEY len={} trimmed_len={}", k.len(), k.trim().len());
    std::env::set_var("OPENROUTER_API_KEY", k);
  }
  if let Some(p) = &tokens.active_provider { std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", p); }
  if let Some(m) = &tokens.openai_model { std::env::set_var("KNAPSACK_OPENAI_MODEL", m); }
  if let Some(m) = &tokens.anthropic_model { std::env::set_var("KNAPSACK_ANTHROPIC_MODEL", m); }
  if let Some(m) = &tokens.gemini_model { std::env::set_var("KNAPSACK_GEMINI_MODEL", m); }
  if let Some(m) = &tokens.groq_model { std::env::set_var("KNAPSACK_GROQ_MODEL", m); }
  if let Some(m) = &tokens.openrouter_model { std::env::set_var("KNAPSACK_OPENROUTER_MODEL", m); }
  // Propagate Ollama settings — only when Ollama is the active provider.
  // When switching away, clear the env vars so the gateway won't discover
  // a stale Ollama provider on restart.
  if provider == "ollama" && tokens.ollama_enabled.unwrap_or(false) {
    std::env::set_var("OLLAMA_API_KEY", "ollama-local");
    if let Some(m) = &tokens.ollama_model { std::env::set_var("KNAPSACK_OLLAMA_MODEL", m); }
    if let Some(u) = &tokens.ollama_base_url { std::env::set_var("OLLAMA_HOST", u); }
  } else if provider != "ollama" {
    std::env::remove_var("OLLAMA_API_KEY");
    std::env::remove_var("KNAPSACK_OLLAMA_MODEL");
    std::env::remove_var("OLLAMA_HOST");
  }
  if let Some(extra) = &tokens.extra_provider_keys {
    for (env_var, key) in extra {
      if is_allowed_extra_env_var(env_var) && !key.trim().is_empty() {
        std::env::set_var(env_var, key.trim());
      }
    }
  }

  // Update agents.defaults.model in the config file so the gateway uses
  // the correct model on restart.  Without this, a stale model (e.g.
  // ollama/llama3.2) persists in openclaw.json even after the user
  // switches to Claude or another provider, causing orphaned messages
  // when the gateway tries the wrong model.
  let config_path = app_clawdbot_home(&app_handle).join("openclaw.json");
  if let Ok(cfg_str) = fs::read_to_string(&config_path) {
    if let Ok(mut cfg_val) = serde_json::from_str::<serde_json::Value>(&cfg_str) {
      let model = crate::clawd::gateway_client::resolve_default_model();
      let agents = cfg_val
        .as_object_mut()
        .unwrap()
        .entry("agents")
        .or_insert_with(|| serde_json::json!({}));
      let mut empty_map = serde_json::Map::new();
      let defaults = agents
        .as_object_mut()
        .unwrap_or(&mut empty_map)
        .entry("defaults")
        .or_insert_with(|| serde_json::json!({}));
      defaults.as_object_mut().map(|d| {
        d.insert("model".to_string(), serde_json::json!({"primary": model}));
      });
      if let Ok(json) = serde_json::to_string_pretty(&cfg_val) {
        let _ = fs::write(&config_path, json);
        eprintln!("[clawd/service] Updated agents.defaults.model to '{}' in config file", model);
      }
    }
  }

  // Restart the gateway so provider discovery runs with updated env vars.
  // A config.patch alone only updates the default model but doesn't re-run
  // provider discovery — the old provider stays in the catalog.
  let model_for_gateway = crate::clawd::gateway_client::resolve_default_model();
  eprintln!(
    "[clawd/service] API key saved for '{}' (model: {}) — restarting gateway for provider re-discovery",
    provider, model_for_gateway
  );
  crate::clawd::gateway_client::invalidate();
  #[cfg(target_os = "windows")]
  {
    kill_process_on_port(18789);
  }
  #[cfg(target_os = "macos")]
  {
    let pid = GATEWAY_PID.load(std::sync::atomic::Ordering::Relaxed);
    if pid > 0 {
      unsafe { libc::kill(pid as i32, libc::SIGTERM); }
      GATEWAY_PID.store(0, std::sync::atomic::Ordering::Relaxed);
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

  // Update agents.defaults.model in the config file so the gateway uses
  // the correct model on restart (same fix as set_api_key).
  let config_path = app_clawdbot_home(&app_handle).join("openclaw.json");
  if let Ok(cfg_str) = fs::read_to_string(&config_path) {
    if let Ok(mut cfg_val) = serde_json::from_str::<serde_json::Value>(&cfg_str) {
      let model = crate::clawd::gateway_client::resolve_default_model();
      let agents = cfg_val
        .as_object_mut()
        .unwrap()
        .entry("agents")
        .or_insert_with(|| serde_json::json!({}));
      let mut empty_map = serde_json::Map::new();
      let defaults = agents
        .as_object_mut()
        .unwrap_or(&mut empty_map)
        .entry("defaults")
        .or_insert_with(|| serde_json::json!({}));
      defaults.as_object_mut().map(|d| {
        d.insert("model".to_string(), serde_json::json!({"primary": model}));
      });
      if let Ok(json) = serde_json::to_string_pretty(&cfg_val) {
        let _ = fs::write(&config_path, json);
        eprintln!("[clawd/service] Updated agents.defaults.model to '{}' in config file", model);
      }
    }
  }

  // Push model change to the running gateway immediately
  let ollama_model = crate::clawd::gateway_client::resolve_default_model();
  tokio::spawn(async move {
    if !crate::clawd::gateway_client::is_gateway_port_open().await {
      return;
    }
    let cfg_result = crate::clawd::gateway_client::config_get(None).await;
    if let Ok(cfg_val) = cfg_result {
      let base_hash = cfg_val.get("hash")
        .and_then(|h| h.as_str())
        .unwrap_or("");
      if !base_hash.is_empty() {
        let patch = serde_json::json!({
          "agents": {"defaults": {"model": {"primary": ollama_model}}}
        });
        match crate::clawd::gateway_client::config_patch(
          &patch.to_string(), base_hash, None
        ).await {
          Ok(_) => eprintln!(
            "[clawd/service] Pushed model '{}' to running gateway via config.patch (ollama configure)",
            ollama_model
          ),
          Err(e) => eprintln!(
            "[clawd/service] Failed to push model to gateway on ollama configure: {}",
            e
          ),
        }
      }
    }
  });

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

#[derive(Debug, Deserialize)]
pub struct OllamaDeleteRequest {
  pub model: String,
}

/// Delete a model from the local Ollama instance.
#[post("/api/knapsack/ollama/delete")]
pub async fn ollama_delete(
  app_handle: web::Data<tauri::AppHandle>,
  payload: web::Json<OllamaDeleteRequest>,
) -> impl Responder {
  let tokens = load_or_create_tokens(&app_handle).ok();
  let base_url = tokens
    .as_ref()
    .and_then(|t| t.ollama_base_url.clone())
    .unwrap_or_else(|| "http://127.0.0.1:11434".to_string());

  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(30))
    .build()
    .unwrap_or_default();

  let resp = match client
    .delete(format!("{}/api/delete", &base_url))
    .json(&serde_json::json!({ "model": &payload.model }))
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
      "message": format!("Ollama delete error ({}): {}", status, body),
    }));
  }

  eprintln!("[clawd/service] Deleted Ollama model: {}", &payload.model);

  HttpResponse::Ok().json(serde_json::json!({
    "success": true,
    "message": format!("Deleted model {}", &payload.model),
  }))
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

// ── Shared gateway config setup (used by both macOS and Windows) ────────

struct ServiceSetup {
  node_path: PathBuf,
  is_bundled_node: bool,
  program_args: Vec<String>,
  env: Vec<(String, String)>,
  app_version: String,
  os_info: String,
  working_dir: PathBuf,
}

/// Platform-agnostic gateway configuration setup.
/// Finds Node.js, resolves paths, creates/patches config files, builds env vars.
/// Returns everything needed to spawn the gateway process.
async fn prepare_gateway_config(
  app_handle: &tauri::AppHandle,
  cfg: &SharedClawdbotConfig,
) -> Result<ServiceSetup, String> {
  let tokens = load_or_create_tokens(app_handle)?;

  fn first_existing(paths: &[PathBuf]) -> Option<PathBuf> {
    paths.iter().find(|p| p.exists()).cloned()
  }

  // ── Find Node.js binary ──────────────────────────────────────────────
  let bundled_node = resource_path(app_handle, if cfg!(target_os = "windows") {
    "resources/node/node.exe"
  } else {
    "resources/node/node"
  });

  let node_candidates: Vec<PathBuf> = if cfg!(target_os = "windows") {
    let mut candidates = Vec::new();
    if !cfg!(debug_assertions) {
      candidates.push(bundled_node.clone());
    }
    // Search PATH for node.exe
    if let Ok(path_var) = std::env::var("PATH") {
      for dir in path_var.split(';') {
        let candidate = PathBuf::from(dir).join("node.exe");
        if candidate.exists() && !candidates.contains(&candidate) {
          candidates.push(candidate);
        }
      }
    }
    candidates.push(PathBuf::from(r"C:\Program Files\nodejs\node.exe"));
    if cfg!(debug_assertions) {
      candidates.push(bundled_node.clone());
    }
    candidates
  } else if cfg!(debug_assertions) {
    vec![
      PathBuf::from("/opt/homebrew/bin/node"),
      PathBuf::from("/usr/local/bin/node"),
      PathBuf::from("/usr/bin/node"),
      bundled_node.clone(),
    ]
  } else {
    vec![
      bundled_node.clone(),
      PathBuf::from("/opt/homebrew/bin/node"),
      PathBuf::from("/usr/local/bin/node"),
      PathBuf::from("/usr/bin/node"),
    ]
  };

  let bundled_node_path = resource_path(app_handle, if cfg!(target_os = "windows") {
    "resources/node/node.exe"
  } else {
    "resources/node/node"
  });

  let node_path = match first_existing(&node_candidates) {
    Some(p) => {
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
      return Err("Node.js not found. The bundled Node.js binary is missing and no system Node.js was found. Please reinstall Knapsack or install Node.js (https://nodejs.org).".to_string());
    }
  };

  // ── Find clawdbot entry ────────────────────────────────────────────
  let clawdbot_entry = if cfg!(debug_assertions) {
    if cfg!(target_os = "windows") {
      // Dev on Windows: look for workspace entry
      let ws_entry = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("clawdbot")
        .join("dist")
        .join("entry.js");
      ws_entry
    } else {
      let sys_entry = PathBuf::from("/opt/homebrew/lib/node_modules/clawdbot/dist/entry.js");
      let ws_entry = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("clawdbot")
        .join("dist")
        .join("entry.js");
      if sys_entry.exists() { sys_entry } else { ws_entry }
    }
  } else {
    resource_path(app_handle, "resources/clawdbot/dist/entry.js")
  };

  if !clawdbot_entry.exists() {
    eprintln!("[clawd/service] ERROR: Clawdbot entry not found at {}", clawdbot_entry.display());
    return Err(format!("Clawdbot not found at {}. Please reinstall Knapsack.", clawdbot_entry.display()));
  }
  eprintln!("[clawd/service] Using Clawdbot entry: {}", clawdbot_entry.display());

  let clawdbot_home = app_clawdbot_home(app_handle);
  let clawdbot_home_str = clawdbot_home.to_string_lossy().to_string();

  // ── Config file setup ──────────────────────────────────────────────
  // Ensure OpenClaw config exists with gateway.mode=local for first-run.
  let config_path = clawdbot_home.join("openclaw.json");
  let legacy_config_path = clawdbot_home.join("clawdbot.json");
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
      if let Ok(mut cfg_val) = serde_json::from_str::<serde_json::Value>(&existing) {
        let mut patched = false;

        // Ensure gateway.auth.token matches tokens.json
        let config_token = cfg_val
          .pointer("/gateway/auth/token")
          .and_then(|v| v.as_str())
          .unwrap_or("");
        if config_token != tokens.gateway_token.trim() {
          if cfg_val.get("gateway").is_none() {
            cfg_val.as_object_mut().unwrap().insert("gateway".to_string(), serde_json::json!({}));
          }
          if cfg_val.pointer("/gateway/auth").is_none() {
            cfg_val.pointer_mut("/gateway").unwrap().as_object_mut().unwrap()
              .insert("auth".to_string(), serde_json::json!({}));
          }
          cfg_val.pointer_mut("/gateway/auth").unwrap().as_object_mut().unwrap()
            .insert("token".to_string(), serde_json::json!(tokens.gateway_token.trim()));
          eprintln!("[clawd/service] Synced gateway.auth.token in config to match tokens.json");
          patched = true;
        }

        // Ensure plugins.slots.memory is set to "none"
        let current_memory = cfg_val
          .pointer("/plugins/slots/memory")
          .and_then(|v| v.as_str())
          .unwrap_or("");
        if current_memory != "none" {
          if cfg_val.get("plugins").is_none() {
            cfg_val.as_object_mut().unwrap().insert("plugins".to_string(), serde_json::json!({}));
          }
          if cfg_val.pointer("/plugins/slots").is_none() {
            cfg_val.pointer_mut("/plugins").unwrap().as_object_mut().unwrap()
              .insert("slots".to_string(), serde_json::json!({}));
          }
          cfg_val.pointer_mut("/plugins/slots").unwrap().as_object_mut().unwrap()
            .insert("memory".to_string(), serde_json::json!("none"));
          eprintln!("[clawd/service] Patched plugins.slots.memory to \"none\"");
          patched = true;
        }

        // Ensure browser.enabled is true
        let browser_enabled = cfg_val
          .pointer("/browser/enabled")
          .and_then(|v| v.as_bool())
          .unwrap_or(false);
        if !browser_enabled {
          if cfg_val.get("browser").is_none() {
            cfg_val.as_object_mut().unwrap().insert("browser".to_string(), serde_json::json!({}));
          }
          cfg_val.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
            .insert("enabled".to_string(), serde_json::json!(true));
          eprintln!("[clawd/service] Patched browser.enabled to true");
          patched = true;
        }

        // Ensure browser is NOT headless
        let browser_headless = cfg_val
          .pointer("/browser/headless")
          .and_then(|v| v.as_bool());
        if browser_headless != Some(false) {
          cfg_val.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
            .insert("headless".to_string(), serde_json::json!(false));
          eprintln!("[clawd/service] Patched browser.headless to false");
          patched = true;
        }

        // Set default profile to "openclaw"
        let current_profile = cfg_val
          .pointer("/browser/defaultProfile")
          .and_then(|v| v.as_str())
          .unwrap_or("chrome")
          .to_string();
        if current_profile == "chrome" || current_profile == "knapsack" || current_profile.is_empty() {
          cfg_val.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
            .insert("defaultProfile".to_string(), serde_json::json!("openclaw"));
          eprintln!("[clawd/service] Patched browser.defaultProfile from {:?} to openclaw", current_profile);
          patched = true;
        }

        // Clean up browser.hideAutomationBanner
        if cfg_val.pointer("/browser/hideAutomationBanner").is_some() {
          cfg_val.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
            .remove("hideAutomationBanner");
          eprintln!("[clawd/service] Removed invalid browser.hideAutomationBanner key from config");
          patched = true;
        }

        // Migrate agents.defaults.model from string to object form.
        // The gateway schema expects { primary: "...", fallbacks?: [...] }
        // but older Knapsack versions wrote a bare string.
        if let Some(model_val) = cfg_val.pointer("/agents/defaults/model") {
          if model_val.is_string() {
            let model_str = model_val.as_str().unwrap_or("").to_string();
            if let Some(defaults) = cfg_val.pointer_mut("/agents/defaults").and_then(|v| v.as_object_mut()) {
              defaults.insert("model".to_string(), serde_json::json!({"primary": model_str}));
              eprintln!("[clawd/service] Migrated agents.defaults.model from string to object form");
              patched = true;
            }
          }
        }

        // On Linux, set browser.noSandbox = true
        if cfg!(target_os = "linux") {
          let no_sandbox = cfg_val
            .pointer("/browser/noSandbox")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
          if !no_sandbox {
            cfg_val.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
              .insert("noSandbox".to_string(), serde_json::json!(true));
            eprintln!("[clawd/service] Patched browser.noSandbox to true (Linux)");
            patched = true;
          }
        }

        // Ensure browser tool is allowed in normal mode
        if cfg_val.get("tools").is_none() {
          cfg_val.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
        }
        let deny_exists = cfg_val.pointer("/tools/deny").and_then(|v| v.as_array()).is_some();
        if deny_exists {
          let browser_denied = cfg_val
            .pointer("/tools/deny")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
            .unwrap_or(false);
          if browser_denied {
            if let Some(deny_arr) = cfg_val.pointer_mut("/tools/deny").and_then(|v| v.as_array_mut()) {
              deny_arr.retain(|item| item.as_str() != Some("browser"));
              eprintln!("[clawd/service] Removed browser from tools.deny");
              patched = true;
            }
          }
        } else {
          cfg_val.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
            .insert("deny".to_string(), serde_json::json!(["canvas", "nodes", "cron", "gateway"]));
          eprintln!("[clawd/service] Created tools.deny (without browser)");
          patched = true;
        }

        // Ensure "browser" is in tools.allow
        let browser_tool_allowed = cfg_val
          .pointer("/tools/allow")
          .and_then(|v| v.as_array())
          .map(|arr| arr.iter().any(|item| item.as_str() == Some("browser")))
          .unwrap_or(false);
        if !browser_tool_allowed {
          let tools = cfg_val.pointer_mut("/tools").unwrap().as_object_mut().unwrap();
          if let Some(allow) = tools.get_mut("allow").and_then(|v| v.as_array_mut()) {
            allow.push(serde_json::json!("browser"));
          } else {
            tools.insert("allow".to_string(), serde_json::json!(["browser"]));
          }
          eprintln!("[clawd/service] Added browser to tools.allow");
          patched = true;
        }

        // Enable image understanding
        let image_understanding_enabled = cfg_val
          .pointer("/tools/media/image/enabled")
          .and_then(|v| v.as_bool())
          .unwrap_or(false);
        if !image_understanding_enabled {
          if cfg_val.get("tools").is_none() {
            cfg_val.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
          }
          let tools = cfg_val.pointer_mut("/tools").unwrap().as_object_mut().unwrap();
          if !tools.contains_key("media") {
            tools.insert("media".to_string(), serde_json::json!({}));
          }
          let media = cfg_val.pointer_mut("/tools/media").unwrap().as_object_mut().unwrap();
          if !media.contains_key("image") {
            media.insert("image".to_string(), serde_json::json!({}));
          }
          cfg_val.pointer_mut("/tools/media/image").unwrap().as_object_mut().unwrap()
            .insert("enabled".to_string(), serde_json::json!(true));
          eprintln!("[clawd/service] Enabled tools.media.image for photo understanding");
          patched = true;
        }

        // Ensure web_fetch and web_search are allowed
        if let Some(allow_arr) = cfg_val.pointer("/tools/allow").and_then(|v| v.as_array()) {
          let has_web_fetch = allow_arr.iter().any(|item| item.as_str() == Some("web_fetch"));
          let has_web_search = allow_arr.iter().any(|item| item.as_str() == Some("web_search"));
          let has_group_web = allow_arr.iter().any(|item| item.as_str() == Some("group:web"));
          if !has_web_fetch || !has_web_search {
            if !has_group_web {
              if let Some(arr) = cfg_val.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
                arr.push(serde_json::json!("group:web"));
              }
              eprintln!("[clawd/service] Added group:web to tools.allow");
              patched = true;
            }
          }
        }

        // Ensure exec/process/file tools are in allow
        let exec_tools = ["exec", "process", "read", "write", "edit", "apply_patch"];
        if let Some(allow_arr) = cfg_val.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
          for tool_name in &exec_tools {
            let already = allow_arr.iter().any(|item| item.as_str() == Some(tool_name));
            if !already {
              allow_arr.push(serde_json::json!(tool_name));
              eprintln!("[clawd/service] Added {} to tools.allow", tool_name);
              patched = true;
            }
          }
        }

        // Ensure sandbox tools path exists
        if cfg_val.get("tools").is_none() {
          cfg_val.as_object_mut().unwrap().insert("tools".to_string(), serde_json::json!({}));
        }
        if cfg_val.pointer("/tools/sandbox").is_none() {
          cfg_val.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
            .insert("sandbox".to_string(), serde_json::json!({}));
        }
        if cfg_val.pointer("/tools/sandbox/tools").is_none() {
          cfg_val.pointer_mut("/tools/sandbox").unwrap().as_object_mut().unwrap()
            .insert("tools".to_string(), serde_json::json!({}));
        }

        // Sandbox deny list
        let sandbox_tools_to_unblock = ["browser", "web_fetch", "web_search", "group:web"];
        if let Some(deny_arr) = cfg_val
          .pointer("/tools/sandbox/tools/deny")
          .and_then(|v| v.as_array())
        {
          let has_blocked = deny_arr.iter().any(|item| {
            item.as_str().map(|s| sandbox_tools_to_unblock.contains(&s)).unwrap_or(false)
          });
          if has_blocked {
            if let Some(deny_arr_mut) = cfg_val.pointer_mut("/tools/sandbox/tools/deny")
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
          cfg_val.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
            .insert("deny".to_string(), serde_json::json!(["canvas", "nodes", "cron", "gateway"]));
          eprintln!("[clawd/service] Created tools.sandbox.tools.deny (without browser)");
          patched = true;
        }

        // Sandbox allow list
        if let Some(allow_arr) = cfg_val.pointer("/tools/sandbox/tools/allow").and_then(|v| v.as_array()) {
          let has_browser = allow_arr.iter().any(|item| item.as_str() == Some("browser"));
          let has_group_web = allow_arr.iter().any(|item| item.as_str() == Some("group:web"));
          let mut needs_add = Vec::new();
          if !has_browser { needs_add.push("browser"); }
          if !has_group_web { needs_add.push("group:web"); }
          if !needs_add.is_empty() {
            if let Some(arr) = cfg_val.pointer_mut("/tools/sandbox/tools/allow").and_then(|v| v.as_array_mut()) {
              for tool in &needs_add {
                arr.push(serde_json::json!(tool));
              }
              eprintln!("[clawd/service] Added {:?} to tools.sandbox.tools.allow", needs_add);
              patched = true;
            }
          }
        } else {
          cfg_val.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
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
          match fs::write(&config_path, serde_json::to_string_pretty(&cfg_val).unwrap_or_default()) {
            Ok(_) => eprintln!("[clawd/service] Config patched successfully"),
            Err(e) => eprintln!("[clawd/service] WARNING: Failed to patch config: {}", e),
          }
        }
      }
    }
  }

  // ── TOOLS.md workspace setup ──────────────────────────────────────
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
  let should_write_tools_md = if tools_md_path.exists() {
    fs::read_to_string(&tools_md_path)
      .map(|content| !content.contains("FALLBACK BEHAVIOR"))
      .unwrap_or(true)
  } else {
    true
  };
  if should_write_tools_md {
    let tools_md_content = include_str!("tools_md_content.txt");
    match fs::write(&tools_md_path, tools_md_content) {
      Ok(_) => eprintln!("[clawd/service] Created workspace TOOLS.md at {}", tools_md_path.display()),
      Err(e) => eprintln!("[clawd/service] WARNING: Failed to write TOOLS.md: {}", e),
    }
  }

  // ── Build program args ────────────────────────────────────────────
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

  // ── Build environment variables ───────────────────────────────────
  let bundled_plugins_dir = resource_path(app_handle, "resources/clawdbot/extensions");
  let bundled_plugins_dir_str = bundled_plugins_dir.to_string_lossy().to_string();

  let node_dir = node_path.parent().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
  let path_separator = if cfg!(target_os = "windows") { ";" } else { ":" };
  let mut path_parts: Vec<String> = Vec::new();
  if !node_dir.is_empty() {
    path_parts.push(node_dir);
  }
  if cfg!(target_os = "windows") {
    // Add common Windows paths
    if let Ok(sys_path) = std::env::var("PATH") {
      for p in sys_path.split(';') {
        let s = p.to_string();
        if !s.is_empty() && !path_parts.contains(&s) {
          path_parts.push(s);
        }
      }
    }
  } else {
    for p in &["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"] {
      let s = p.to_string();
      if !path_parts.contains(&s) {
        path_parts.push(s);
      }
    }
  }
  let clawdbot_path = path_parts.join(path_separator);

  let user_home = dirs::home_dir()
    .map(|p| p.to_string_lossy().to_string())
    .unwrap_or_default();

  let mut env = vec![
    ("PATH".to_string(), clawdbot_path),
    ("HOME".to_string(), user_home.clone()),
    ("OPENCLAW_HOME".to_string(), clawdbot_home_str.clone()),
    ("CLAWDBOT_STATE_DIR".to_string(), clawdbot_home_str),
    ("CLAWDBOT_GATEWAY_TOKEN".to_string(), tokens.gateway_token.clone()),
    ("OPENCLAW_GATEWAY_TOKEN".to_string(), tokens.gateway_token.clone()),
    ("CLAWDBOT_GATEWAY_PORT".to_string(), "18789".to_string()),
    ("OPENCLAW_BUNDLED_PLUGINS_DIR".to_string(), bundled_plugins_dir_str),
    ("OPENCLAW_QUIET_CONFIG_VERSION".to_string(), "1".to_string()),
    // Ensure Node.js resolves packages from the bundled flat node_modules
    // directory.  Without this, stale nested node_modules can cause
    // ERR_PACKAGE_PATH_NOT_EXPORTED errors.
    ("NODE_PATH".to_string(), {
      let mut nm = clawdbot_entry.clone();
      nm.pop(); // remove entry.js
      nm.pop(); // remove dist/
      nm.push("node_modules");
      nm.to_string_lossy().to_string()
    }),
  ];

  // On Windows, propagate critical system env vars.  The gateway child process
  // receives ONLY the env vars we pass (`.envs()` replaces the environment).
  // Without these the Node.js gateway can't find Chrome, create temp files,
  // or perform TLS/crypto operations.
  if cfg!(target_os = "windows") {
    env.push(("USERPROFILE".to_string(), user_home));
    // These are required for Chrome detection, temp dirs, TLS, and subprocesses
    let windows_vars = [
      "APPDATA", "LOCALAPPDATA",
      "PROGRAMFILES", "PROGRAMFILES(X86)", "ProgramW6432",
      "SystemRoot", "SystemDrive",
      "TEMP", "TMP",
      "COMSPEC",
      "NUMBER_OF_PROCESSORS", "PROCESSOR_ARCHITECTURE",
      "PATHEXT",
      "HOMEDRIVE", "HOMEPATH",
    ];
    for var in &windows_vars {
      if let Ok(val) = std::env::var(var) {
        if !val.is_empty() {
          env.push((var.to_string(), val));
        }
      }
    }
  }

  // Propagate LLM keys
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
  // Propagate OpenRouter key
  if let Some(k) = tokens.openrouter_api_key.clone() {
    let k = k.trim().to_string();
    if !k.is_empty() {
      std::env::set_var("OPENROUTER_API_KEY", &k);
      env.push(("OPENROUTER_API_KEY".to_string(), k));
    }
  }

  // Propagate active provider and model overrides so the gateway uses the
  // correct provider/model the user selected in the UI.
  if let Some(p) = tokens.active_provider.clone() {
    let p = p.trim().to_string();
    if !p.is_empty() {
      std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", &p);
      env.push(("KNAPSACK_ACTIVE_PROVIDER".to_string(), p));
    }
  }
  if let Some(m) = tokens.openai_model.clone() {
    env.push(("KNAPSACK_OPENAI_MODEL".to_string(), m));
  }
  if let Some(m) = tokens.anthropic_model.clone() {
    env.push(("KNAPSACK_ANTHROPIC_MODEL".to_string(), m));
  }
  if let Some(m) = tokens.gemini_model.clone() {
    env.push(("KNAPSACK_GEMINI_MODEL".to_string(), m));
  }
  if let Some(m) = tokens.groq_model.clone() {
    env.push(("KNAPSACK_GROQ_MODEL".to_string(), m));
  }
  if let Some(m) = tokens.openrouter_model.clone() {
    env.push(("KNAPSACK_OPENROUTER_MODEL".to_string(), m));
  }

  if let Some(extra) = &tokens.extra_provider_keys {
    for (env_var, key) in extra {
      let key = key.trim().to_string();
      if !key.is_empty() && is_allowed_extra_env_var(env_var) {
        std::env::set_var(env_var, &key);
        env.push((env_var.clone(), key));
      }
    }
  }

  // Set gateway token and state dir in current Tauri process so that
  // gateway_client (ensure_browser_config, read_token_from_config, etc.)
  // can locate the config file and resolve the auth token.
  {
    let gw = tokens.gateway_token.trim();
    if !gw.is_empty() {
      std::env::set_var("CLAWDBOT_GATEWAY_TOKEN", gw);
      std::env::set_var("OPENCLAW_GATEWAY_TOKEN", gw);
    }
  }
  {
    let home_str = app_clawdbot_home(app_handle).to_string_lossy().to_string();
    std::env::set_var("OPENCLAW_HOME", &home_str);
    std::env::set_var("CLAWDBOT_STATE_DIR", &home_str);
  }

  // Set browser base_url
  {
    let mut cfg_guard = cfg.write().await;
    cfg_guard.base_url = Some("http://127.0.0.1:18791".to_string());
  }

  let is_bundled_node = node_path == bundled_node_path;
  let app_version = app_handle.package_info().version.to_string();
  let os_info = format!("{} {}", std::env::consts::OS, std::env::consts::ARCH);

  eprintln!(
    "[clawd/service] Knapsack v{} on {} — starting service ({})",
    app_version, os_info, LAUNCH_AGENT_LABEL
  );

  Ok(ServiceSetup {
    node_path,
    is_bundled_node,
    program_args,
    env,
    app_version,
    os_info,
    working_dir: workspace_path,
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
  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    return HttpResponse::NotImplemented().json(EnableServiceResponse {
      success: false,
      enabled: payload.enabled,
      message: "Service management is not implemented for this platform".to_string(),
    });
  }

  #[cfg(target_os = "windows")]
  {
    let enabled = payload.enabled;

    if enabled {
      // If a background restart is already in progress, wait for it to
      // finish rather than spawning a second gateway process.
      if GATEWAY_RESTART_IN_PROGRESS.load(Ordering::Relaxed) {
        eprintln!("[clawd/service] Enable request: background restart already in progress, waiting...");
        for _ in 0..20 {
          std::thread::sleep(std::time::Duration::from_millis(500));
          if !GATEWAY_RESTART_IN_PROGRESS.load(Ordering::Relaxed) { break; }
        }
        // If a gateway is now running, skip re-spawn
        let existing_pid = GATEWAY_PID.load(Ordering::Relaxed);
        if existing_pid > 0 {
          eprintln!("[clawd/service] Enable request: gateway already running (pid {})", existing_pid);
          return HttpResponse::Ok().json(EnableServiceResponse {
            success: true,
            enabled,
            message: format!("Gateway already started by background restart (pid {})", existing_pid),
          });
        }
      }

      let setup = match prepare_gateway_config(&app_handle, &cfg).await {
        Ok(s) => s,
        Err(e) => {
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: e,
          })
        }
      };

      // Mark restart in progress so the health-check background task
      // doesn't race us by spawning a second gateway.
      GATEWAY_RESTART_IN_PROGRESS.store(true, Ordering::Relaxed);

      // Kill stale Chrome processes holding the CDP port
      kill_stale_clawdbot_chromes();

      // Kill any existing gateway on port 18789
      kill_process_on_port(18789);
      // Brief pause to let ports release
      std::thread::sleep(std::time::Duration::from_millis(500));

      // Clean up stale gateway lock files left behind by terminated processes.
      // On Windows the lock dir is %TEMP%/openclaw/
      {
        let lock_dir = std::env::temp_dir().join("openclaw");
        if lock_dir.is_dir() {
          if let Ok(entries) = fs::read_dir(&lock_dir) {
            for entry in entries.flatten() {
              let name = entry.file_name();
              let name_str = name.to_string_lossy();
              if name_str.starts_with("gateway.") && name_str.ends_with(".lock") {
                match fs::remove_file(entry.path()) {
                  Ok(_) => eprintln!("[clawd/service] Removed stale lock: {}", entry.path().display()),
                  Err(e) => eprintln!("[clawd/service] WARNING: Failed to remove lock {}: {}", entry.path().display(), e),
                }
              }
            }
          }
        }
      }

      // Spawn the gateway process
      let stdout_log = windows_log_path("stdout");
      let stderr_log = windows_log_path("stderr");

      let stdout_file = match fs::File::create(&stdout_log) {
        Ok(f) => f,
        Err(e) => {
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: format!("Failed to create stdout log: {}", e),
          })
        }
      };
      let stderr_file = match fs::File::create(&stderr_log) {
        Ok(f) => f,
        Err(e) => {
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: format!("Failed to create stderr log: {}", e),
          })
        }
      };

      use std::os::windows::process::CommandExt;
      const CREATE_NO_WINDOW: u32 = 0x08000000;

      let child = std::process::Command::new(&setup.program_args[0])
        .args(&setup.program_args[1..])
        .envs(setup.env.iter().map(|(k, v)| (k.as_str(), v.as_str())))
        .current_dir(&setup.working_dir)
        .stdout(stdout_file)
        .stderr(stderr_file)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn();

      match child {
        Ok(child) => {
          let pid = child.id();
          GATEWAY_PID.store(pid, Ordering::Relaxed);
          GATEWAY_RESTART_IN_PROGRESS.store(false, Ordering::Relaxed);
          eprintln!("[clawd/service] Spawned gateway process (pid {})", pid);
        }
        Err(e) => {
          GATEWAY_RESTART_IN_PROGRESS.store(false, Ordering::Relaxed);
          return HttpResponse::InternalServerError().json(EnableServiceResponse {
            success: false,
            enabled,
            message: format!("Failed to spawn gateway process: {}", e),
          })
        }
      }

      return HttpResponse::Ok().json(EnableServiceResponse {
        success: true,
        enabled,
        message: format!(
          "Enabled background service ({}) using {} Node.js — Knapsack v{} on {}",
          LAUNCH_AGENT_LABEL,
          if setup.is_bundled_node { "bundled" } else { "system" },
          setup.app_version,
          setup.os_info
        ),
      });
    } else {
      // Disable: kill the gateway process
      let pid = GATEWAY_PID.load(Ordering::Relaxed);
      if pid > 0 {
        eprintln!("[clawd/service] Killing gateway process (pid {})", pid);
        {
          use std::os::windows::process::CommandExt;
          const CREATE_NO_WINDOW: u32 = 0x08000000;
          let _ = std::process::Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F", "/T"])
            .creation_flags(CREATE_NO_WINDOW)
            .status();
        }
        GATEWAY_PID.store(0, Ordering::Relaxed);
      }
      // Also kill by port as fallback
      kill_process_on_port(18789);

      return HttpResponse::Ok().json(EnableServiceResponse {
        success: true,
        enabled,
        message: format!("Disabled background service ({})", LAUNCH_AGENT_LABEL),
      });
    }
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

      // Resolve bundled plugins directory early — needed for the
      // OPENCLAW_BUNDLED_PLUGINS_DIR env var and for cleaning up stale
      // plugins.load.paths entries from older configs.
      let bundled_plugins_dir = resource_path(&app_handle, "resources/clawdbot/extensions");

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
            "allow": ["browser", "group:web", "exec", "process", "group:fs"],
            "deny": ["canvas", "nodes", "cron", "gateway"],
            "exec": {"applyPatch": {"enabled": true}},
            "media": {"image": {"enabled": true}},
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

            // Remove bundled extensions directory from plugins.load.paths.
            //
            // The OPENCLAW_BUNDLED_PLUGINS_DIR env var (always set) already
            // tells the gateway where to find bundled plugins.  Having the
            // same path in plugins.load.paths causes double plugin discovery:
            // the gateway scans the directory once as "config" origin and
            // again as "bundled" origin, producing dozens of "duplicate
            // plugin id detected" warnings and doubling startup time.
            //
            // Also clean up stale paths from previous app installs.
            {
              let bundled_dir = bundled_plugins_dir.to_string_lossy().to_string();
              if let Some(load_paths) = cfg
                .pointer("/plugins/load/paths")
                .and_then(|v| v.as_array())
              {
                let cleaned: Vec<serde_json::Value> = load_paths.iter().filter(|v| {
                  match v.as_str() {
                    Some(s) if s.contains("clawdbot/extensions") || s.contains("clawdbot\\extensions") => false,
                    _ => true,
                  }
                }).cloned().collect();
                if cleaned.len() != load_paths.len() {
                  if cfg.pointer("/plugins/load").is_some() {
                    cfg.pointer_mut("/plugins/load").unwrap().as_object_mut().unwrap()
                      .insert("paths".to_string(), serde_json::json!(cleaned));
                  }
                  eprintln!("[clawd/service] Removed bundled extensions from plugins.load.paths (using OPENCLAW_BUNDLED_PLUGINS_DIR env var instead)");
                  patched = true;
                }
              }
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

            // Set default profile to "openclaw" (managed, isolated) so the
            // browser tool works for channel automations.  The "chrome"
            // profile is an extension-relay that requires a human to manually
            // attach the Chrome extension to a tab — it will never work from
            // a background channel context (Telegram/Signal/etc.).
            let current_profile = cfg
              .pointer("/browser/defaultProfile")
              .and_then(|v| v.as_str())
              .unwrap_or("chrome")
              .to_string();
            if current_profile == "chrome" || current_profile == "knapsack" || current_profile.is_empty() {
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .insert("defaultProfile".to_string(), serde_json::json!("openclaw"));
              eprintln!("[clawd/service] Patched browser.defaultProfile from {:?} to openclaw", current_profile);
              patched = true;
            }

            // Clean up browser.hideAutomationBanner — the gateway's config
            // validator rejects this unrecognized key, causing a crash loop.
            if cfg.pointer("/browser/hideAutomationBanner").is_some() {
              cfg.pointer_mut("/browser").unwrap().as_object_mut().unwrap()
                .remove("hideAutomationBanner");
              eprintln!("[clawd/service] Removed invalid browser.hideAutomationBanner key from config");
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
            // Use group:fs instead of individual file tool names to avoid
            // "unknown entries (apply_patch)" warnings from the gateway validator.
            let exec_tools = ["exec", "process", "group:fs"];
            if let Some(allow_arr) = cfg.pointer_mut("/tools/allow").and_then(|v| v.as_array_mut()) {
              // Remove legacy individual entries now covered by group:fs
              let covered_by_group_fs = ["read", "write", "edit", "apply_patch"];
              let before_len = allow_arr.len();
              allow_arr.retain(|item| {
                item.as_str().map(|s| !covered_by_group_fs.contains(&s)).unwrap_or(true)
              });
              if allow_arr.len() != before_len {
                eprintln!("[clawd/service] Cleaned up individual file tool entries (now covered by group:fs)");
                patched = true;
              }

              for tool_name in &exec_tools {
                let already = allow_arr.iter().any(|item| item.as_str() == Some(tool_name));
                if !already {
                  allow_arr.push(serde_json::json!(tool_name));
                  eprintln!("[clawd/service] Added {} to tools.allow", tool_name);
                  patched = true;
                }
              }
            }

            // Enable apply_patch tool (gated behind tools.exec.applyPatch.enabled)
            if cfg.pointer("/tools/exec").is_none() {
              cfg.pointer_mut("/tools").unwrap().as_object_mut().unwrap()
                .insert("exec".into(), serde_json::json!({}));
            }
            if cfg.pointer("/tools/exec/applyPatch").is_none() {
              cfg.pointer_mut("/tools/exec").unwrap().as_object_mut().unwrap()
                .insert("applyPatch".into(), serde_json::json!({}));
            }
            if !cfg.pointer("/tools/exec/applyPatch/enabled")
              .and_then(|v| v.as_bool()).unwrap_or(false) {
              cfg.pointer_mut("/tools/exec/applyPatch").unwrap().as_object_mut().unwrap()
                .insert("enabled".into(), serde_json::json!(true));
              eprintln!("[clawd/service] Enabled tools.exec.applyPatch");
              patched = true;
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
              // Use group:fs instead of individual file tool names to avoid
              // "unknown entries" warnings from the gateway validator.
              cfg.pointer_mut("/tools/sandbox/tools").unwrap().as_object_mut().unwrap()
                .insert("allow".to_string(), serde_json::json!([
                  "exec", "process", "group:fs",
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
          .map(|content| !content.contains("FALLBACK BEHAVIOR"))
          .unwrap_or(true)
      } else {
        true
      };
      if should_write_tools_md {
        // Single source of truth: tools_md_content.txt
        let tools_md_content = include_str!("tools_md_content.txt");
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

      // bundled_plugins_dir was resolved earlier (before config patching)
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
        // Ensure Node.js resolves packages from the bundled flat node_modules
        // directory. Without this, stale nested node_modules (e.g. created by
        // a local pnpm install) can cause ERR_PACKAGE_PATH_NOT_EXPORTED errors
        // because Node finds a broken copy before reaching the correct one.
        ("NODE_PATH".to_string(), {
          let mut nm = clawdbot_entry.clone();
          nm.pop(); // remove entry.js
          nm.pop(); // remove dist/
          nm.push("node_modules");
          nm.to_string_lossy().to_string()
        }),
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

      // Propagate OpenRouter key
      if let Some(k) = tokens.openrouter_api_key.clone() {
        let k = k.trim().to_string();
        if !k.is_empty() {
          std::env::set_var("OPENROUTER_API_KEY", &k);
          env.push(("OPENROUTER_API_KEY".to_string(), k));
        }
      }

      // Propagate active provider and model overrides so the gateway uses the
      // correct provider/model the user selected in the UI.
      if let Some(p) = tokens.active_provider.clone() {
        let p = p.trim().to_string();
        if !p.is_empty() {
          std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", &p);
          env.push(("KNAPSACK_ACTIVE_PROVIDER".to_string(), p));
        }
      }
      if let Some(m) = tokens.openai_model.clone() {
        env.push(("KNAPSACK_OPENAI_MODEL".to_string(), m));
      }
      if let Some(m) = tokens.anthropic_model.clone() {
        env.push(("KNAPSACK_ANTHROPIC_MODEL".to_string(), m));
      }
      if let Some(m) = tokens.gemini_model.clone() {
        env.push(("KNAPSACK_GEMINI_MODEL".to_string(), m));
      }
      if let Some(m) = tokens.groq_model.clone() {
        env.push(("KNAPSACK_GROQ_MODEL".to_string(), m));
      }
      if let Some(m) = tokens.openrouter_model.clone() {
        env.push(("KNAPSACK_OPENROUTER_MODEL".to_string(), m));
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
      // Also set OPENCLAW_HOME in Tauri process so gateway_client can find
      // the config file for token sync and browser config patching.
      {
        let home_str = clawdbot_home.to_string_lossy().to_string();
        std::env::set_var("OPENCLAW_HOME", &home_str);
        std::env::set_var("CLAWDBOT_STATE_DIR", &home_str);
      }

      let plist = generate_plist(&program_args, &env);
      if let Err(e) = fs::write(&plist_path, plist) {
        return HttpResponse::InternalServerError().json(EnableServiceResponse {
          success: false,
          enabled,
          message: format!("Failed writing plist {}: {}", plist_path.display(), e),
        });
      }

      // Run "openclaw doctor --fix" to auto-migrate config for the new
      // version (e.g. WhatsApp allowFrom validation, Telegram streaming rename).
      // This is a quick, idempotent command that exits immediately.
      {
        let doctor_env: Vec<(String, String)> = env.clone();
        let mut doctor_cmd = std::process::Command::new(node_path.as_os_str());
        doctor_cmd
          .arg(clawdbot_entry.as_os_str())
          .args(["doctor", "--fix"]);
        for (k, v) in &doctor_env {
          doctor_cmd.env(k, v);
        }
        match doctor_cmd.output() {
          Ok(out) => {
            if !out.status.success() {
              let stderr = String::from_utf8_lossy(&out.stderr);
              eprintln!("[clawd/service] openclaw doctor --fix exited with {}: {}", out.status, stderr.chars().take(500).collect::<String>());
            } else {
              eprintln!("[clawd/service] openclaw doctor --fix completed successfully");
            }
          }
          Err(e) => eprintln!("[clawd/service] WARNING: failed to run openclaw doctor --fix: {}", e),
        }
      }

      // Kill any stale Chrome processes from a previous clawdbot session so
      // the new gateway can grab the CDP port (18800).
      kill_stale_clawdbot_chromes();

      // Remove the standalone OpenClaw gateway service if present — it
      // conflicts with Knapsack's own gateway on port 18789 and may use a
      // different device token, causing "device token mismatch" errors.
      remove_stale_standalone_gateway();

      // bootstrap + kickstart
      let uid = unsafe { libc::getuid() };
      let domain = format!("gui/{}", uid);

      // unload old if present (ignore errors)
      let _ = std::process::Command::new("launchctl")
        .args(["bootout", &domain, plist_path.to_string_lossy().as_ref()])
        .status();

      // Wait for the old gateway process to fully terminate and release
      // its port + lock file.  Without this delay, the new gateway may
      // encounter EADDRINUSE on port 18789 or fail to acquire the lock
      // because the dying process still holds it.
      std::thread::sleep(std::time::Duration::from_millis(1000));

      // Clean up stale gateway lock files left behind by the terminated
      // process.  The lock dir is /tmp/openclaw-{uid}/ and files match
      // gateway.*.lock.  Without cleanup, the new gateway may wait up
      // to 5 seconds for the lock to become stale (30s threshold) and
      // then fail with GatewayLockError.
      {
        let lock_dir = std::path::PathBuf::from(format!("/tmp/openclaw-{}", uid));
        if lock_dir.is_dir() {
          if let Ok(entries) = fs::read_dir(&lock_dir) {
            for entry in entries.flatten() {
              let name = entry.file_name();
              let name_str = name.to_string_lossy();
              if name_str.starts_with("gateway.") && name_str.ends_with(".lock") {
                match fs::remove_file(entry.path()) {
                  Ok(_) => eprintln!("[clawd/service] Removed stale lock: {}", entry.path().display()),
                  Err(e) => eprintln!("[clawd/service] WARNING: Failed to remove lock {}: {}", entry.path().display(), e),
                }
              }
            }
          }
        }
      }

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

#[cfg(target_os = "windows")]
pub async fn cycle_service(_app_handle: &tauri::AppHandle) {
  eprintln!("[clawd/service] Auto-cycling service on Windows...");

  // Kill the current gateway process
  let pid = GATEWAY_PID.load(Ordering::Relaxed);
  if pid > 0 {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let _ = std::process::Command::new("taskkill")
      .args(["/PID", &pid.to_string(), "/F", "/T"])
      .creation_flags(CREATE_NO_WINDOW)
      .status();
    GATEWAY_PID.store(0, Ordering::Relaxed);
  }
  kill_process_on_port(18789);

  // Brief pause before restarting
  tokio::time::sleep(std::time::Duration::from_millis(500)).await;

  // Note: We can't easily respawn the gateway here without the full config.
  // The health check loop in the frontend will call /api/clawd/service/enable
  // to restart the service if it detects the gateway is down.
  eprintln!("[clawd/service] Service killed — frontend will re-enable if needed.");
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub async fn cycle_service(_app_handle: &tauri::AppHandle) {
  // No-op on other platforms
}

/// Kill the gateway process and any child processes before the app exits.
/// Called from the quit handler so orphaned processes don't linger.
#[cfg(target_os = "windows")]
pub fn cleanup_gateway_on_exit() {
  use std::os::windows::process::CommandExt;
  use std::sync::atomic::Ordering;
  const CREATE_NO_WINDOW: u32 = 0x08000000;

  let pid = GATEWAY_PID.load(Ordering::Relaxed);
  if pid > 0 {
    eprintln!("[clawd/service] Cleaning up gateway process (pid {}) on exit", pid);
    let _ = std::process::Command::new("taskkill")
      .args(["/PID", &pid.to_string(), "/F", "/T"])
      .creation_flags(CREATE_NO_WINDOW)
      .status();
    GATEWAY_PID.store(0, Ordering::Relaxed);
  }
  kill_process_on_port(18789);
}

#[cfg(not(target_os = "windows"))]
pub fn cleanup_gateway_on_exit() {
  // On macOS, launchd manages the gateway; on Linux, no-op.
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
