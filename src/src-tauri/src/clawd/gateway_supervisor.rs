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
pub async fn ensure_gateway_running(label: &str, token: &str) -> GatewayEnsureResponse {
  if is_gateway_healthy(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy".to_string(),
    };
  }

  // Try kickstart (macOS)
  let _ = kickstart_launch_agent(label);

  // Give it a moment to come up
  tokio::time::sleep(std::time::Duration::from_millis(600)).await;

  if is_gateway_healthy(token).await {
    GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway restarted".to_string(),
    }
  } else {
    GatewayEnsureResponse {
      success: false,
      running: false,
      message: "Gateway not reachable".to_string(),
    }
  }
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
