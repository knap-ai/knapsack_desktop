use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use tokio::sync::Mutex;

/// Global mutex to prevent concurrent `ensure_gateway_running` calls.
/// Multiple callers (channel status, WS reconnect, RPC client) can trigger
/// restarts simultaneously, causing launchctl bootout/bootstrap races that
/// result in I/O errors and "service not found" failures.
static RESTART_MUTEX: once_cell::sync::Lazy<Mutex<()>> = once_cell::sync::Lazy::new(|| Mutex::new(()));

/// Minimal gateway supervisor helpers.
///
/// Goal: avoid port exhaustion by preventing duplicate gateway processes.
///
/// We do this by:
/// 1) checking health endpoint on 127.0.0.1:18789
/// 2) if unhealthy, attempting to (re)start via launchctl kickstart (macOS)
///
/// NOTE: This intentionally does NOT manage credentials or change tokens.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GatewayEnsureResponse {
  pub success: bool,
  pub running: bool,
  pub message: String,
}

pub fn gateway_health_url() -> &'static str {
  "http://127.0.0.1:18789/health"
}

pub async fn is_gateway_healthy(token: &str) -> bool {
  let client = match reqwest::Client::builder()
    .timeout(std::time::Duration::from_millis(800))
    .build()
  {
    Ok(c) => c,
    Err(_) => return false,
  };

  match client.get(gateway_health_url()).bearer_auth(token).send().await {
    Ok(resp) => resp.status().is_success() || resp.status().as_u16() == 404,
    Err(_) => false,
  }
}

#[cfg(target_os = "macos")]
pub fn kickstart_launch_agent(label: &str) -> Result<(), String> {
  let uid = unsafe { libc::getuid() };
  let service = format!("gui/{}/{}", uid, label);

  // kickstart will start it if loaded; if not loaded, it errors.
  let output = Command::new("launchctl")
    .args(["kickstart", "-k", &service])
    .output()
    .map_err(|e| format!("Failed to run launchctl kickstart: {}", e))?;

  if output.status.success() {
    return Ok(());
  }

  let stderr = String::from_utf8_lossy(&output.stderr);
  eprintln!(
    "[gateway_supervisor] kickstart failed (exit {}): {}",
    output.status.code().unwrap_or(-1),
    stderr.trim()
  );

  // Fallback: bootout + bootstrap.  This is a stronger reset that reloads
  // the service definition.  It handles cases where the service is in a
  // bad state (e.g., macOS throttling crash-looping agents, stale service
  // registration, or the plist was updated after the last bootstrap).
  let home = dirs::home_dir().ok_or("Couldn't resolve home dir")?;
  let plist_path = home
    .join("Library")
    .join("LaunchAgents")
    .join(format!("{}.plist", label));

  if !plist_path.exists() {
    return Err(format!(
      "kickstart failed and plist not found at {}",
      plist_path.display()
    ));
  }

  let domain = format!("gui/{}", uid);
  let plist_str = plist_path.to_string_lossy().to_string();

  eprintln!("[gateway_supervisor] trying bootout + bootstrap fallback");

  // bootout (ignore errors — service may not be loaded)
  let _ = Command::new("launchctl")
    .args(["bootout", &domain, &plist_str])
    .output();

  // Small delay to let launchd clean up
  std::thread::sleep(std::time::Duration::from_millis(500));

  let boot = Command::new("launchctl")
    .args(["bootstrap", &domain, &plist_str])
    .output()
    .map_err(|e| format!("Failed to run launchctl bootstrap: {}", e))?;

  if !boot.status.success() {
    let boot_stderr = String::from_utf8_lossy(&boot.stderr);
    return Err(format!(
      "kickstart and bootstrap both failed: {}",
      boot_stderr.trim()
    ));
  }

  // kickstart after bootstrap to ensure the process actually starts
  let kick2 = Command::new("launchctl")
    .args(["kickstart", "-k", &service])
    .output();

  match kick2 {
    Ok(o) if o.status.success() => {
      eprintln!("[gateway_supervisor] bootout + bootstrap + kickstart succeeded");
      Ok(())
    }
    Ok(o) => {
      let k2_stderr = String::from_utf8_lossy(&o.stderr);
      eprintln!("[gateway_supervisor] post-bootstrap kickstart failed: {}", k2_stderr.trim());
      // Bootstrap succeeded, so the service should start via KeepAlive — treat as OK
      Ok(())
    }
    Err(e) => {
      eprintln!("[gateway_supervisor] post-bootstrap kickstart error: {}", e);
      Ok(()) // Bootstrap succeeded, KeepAlive should handle it
    }
  }
}

#[cfg(not(target_os = "macos"))]
pub fn kickstart_launch_agent(_label: &str) -> Result<(), String> {
  Err("kickstart not supported on this OS".to_string())
}

/// Best-effort: if gateway isn't healthy, try kickstarting the LaunchAgent.
///
/// This does NOT install/bootstrap the agent; it assumes the service is already enabled.
/// Uses exponential backoff: retries up to 4 times with delays of 500ms, 1s, 2s, 4s.
///
/// Protected by a mutex — only one restart attempt runs at a time.  Concurrent
/// callers wait for the in-progress attempt to finish and then re-check health.
pub async fn ensure_gateway_running(label: &str, token: &str) -> GatewayEnsureResponse {
  // Fast path: if already healthy, skip the mutex entirely.
  if is_gateway_healthy(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy".to_string(),
    };
  }

  // Acquire the restart mutex — if another caller is already restarting,
  // we wait for it to finish and then re-check health before trying ourselves.
  let _guard = RESTART_MUTEX.lock().await;

  // Re-check health after acquiring the lock — the previous holder may
  // have already restarted the gateway successfully.
  if is_gateway_healthy(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy (recovered while waiting)".to_string(),
    };
  }

  // Retry with exponential backoff: 500ms, 1s, 2s, 4s
  // Start faster to reduce perceived startup time; the gateway usually
  // comes up within the first second after kickstart.
  let backoff_ms: &[u64] = &[500, 1000, 2000, 4000];

  for (attempt, &delay) in backoff_ms.iter().enumerate() {
    eprintln!(
      "[gateway_supervisor] Gateway not healthy, attempt {}/{} — kickstarting and waiting {}ms",
      attempt + 1,
      backoff_ms.len(),
      delay
    );

    // Try kickstart (macOS)
    if let Err(e) = kickstart_launch_agent(label) {
      eprintln!("[gateway_supervisor] kickstart failed: {}", e);
    }

    tokio::time::sleep(std::time::Duration::from_millis(delay)).await;

    if is_gateway_healthy(token).await {
      return GatewayEnsureResponse {
        success: true,
        running: true,
        message: format!("Gateway started after {} attempt(s)", attempt + 1),
      };
    }
  }

  eprintln!("[gateway_supervisor] Gateway failed to start after {} attempts", backoff_ms.len());

  // Dump the last few lines of the gateway's stderr log so we can see
  // why the process is failing to start.
  let err_log = super::service::gateway_stderr_log();
  if let Ok(content) = std::fs::read_to_string(&err_log) {
    let tail: Vec<&str> = content.lines().rev().take(25).collect();
    if !tail.is_empty() {
      let mut lines: Vec<&str> = tail.into_iter().collect();
      lines.reverse();
      eprintln!("[gateway_supervisor] --- last gateway stderr ---");
      for line in &lines {
        eprintln!("[gateway_supervisor]   {}", line);
      }
    }
  }

  GatewayEnsureResponse {
    success: false,
    running: false,
    message: "Gateway not reachable after multiple retries (not running)".to_string(),
  }
}

/// Wait for the gateway to become healthy, polling with exponential backoff.
/// Returns `true` if the gateway is ready, `false` if it didn't come up in time.
/// Used by the frontend health-check endpoint to block until the gateway is ready.
pub async fn wait_for_gateway_ready(token: &str, max_wait_ms: u64) -> bool {
  let start = std::time::Instant::now();
  let mut interval_ms: u64 = 500;
  let max_interval_ms: u64 = 3000;

  while start.elapsed().as_millis() < max_wait_ms as u128 {
    if is_gateway_healthy(token).await {
      return true;
    }
    tokio::time::sleep(std::time::Duration::from_millis(interval_ms)).await;
    interval_ms = (interval_ms * 2).min(max_interval_ms);
  }
  false
}

/// Helper for locating clawdbot home (used by other modules). Kept here to avoid
/// circular imports if we later expand supervisor responsibilities.
#[allow(dead_code)]
pub fn app_clawdbot_home(app_handle: &tauri::AppHandle) -> PathBuf {
  app_handle
    .path_resolver()
    .app_data_dir()
    .unwrap_or_else(|| PathBuf::from("."))
    .join("clawdbot")
}
