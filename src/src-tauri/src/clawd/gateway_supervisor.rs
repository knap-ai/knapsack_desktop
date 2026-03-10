use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

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
  let status = Command::new("launchctl")
    .args(["kickstart", "-k", &service])
    .status()
    .map_err(|e| format!("Failed to run launchctl kickstart: {}", e))?;

  if status.success() {
    Ok(())
  } else {
    Err("launchctl kickstart failed".to_string())
  }
}

#[cfg(not(target_os = "macos"))]
pub fn kickstart_launch_agent(_label: &str) -> Result<(), String> {
  Err("kickstart not supported on this OS".to_string())
}

/// Best-effort: if gateway isn't healthy, try kickstarting the LaunchAgent.
///
/// This does NOT install/bootstrap the agent; it assumes the service is already enabled.
/// Uses exponential backoff: retries up to 4 times with delays of 1s, 2s, 4s, 8s.
pub async fn ensure_gateway_running(label: &str, token: &str) -> GatewayEnsureResponse {
  if is_gateway_healthy(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy".to_string(),
    };
  }

  // Retry with exponential backoff: 1s, 2s, 4s, 8s
  let backoff_ms: &[u64] = &[1000, 2000, 4000, 8000];

  for (attempt, &delay) in backoff_ms.iter().enumerate() {
    eprintln!(
      "[gateway_supervisor] Gateway not healthy, attempt {}/{} — kickstarting and waiting {}ms",
      attempt + 1,
      backoff_ms.len(),
      delay
    );

    // Try kickstart (macOS)
    let _ = kickstart_launch_agent(label);

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
  GatewayEnsureResponse {
    success: false,
    running: false,
    message: "Gateway not reachable after multiple retries".to_string(),
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
