use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

/// Global mutex to prevent concurrent `ensure_gateway_running` calls.
/// Multiple callers (channel status, WS reconnect, RPC client) can trigger
/// restarts simultaneously, causing launchctl bootout/bootstrap races that
/// result in I/O errors and "service not found" failures.
static RESTART_MUTEX: once_cell::sync::Lazy<Mutex<()>> =
  once_cell::sync::Lazy::new(|| Mutex::new(()));
const LOCAL_GATEWAY_HEALTH_TIMEOUT: Duration = Duration::from_millis(1000);

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
  "http://127.0.0.1:18789/healthz"
}

pub async fn is_gateway_healthy(token: &str) -> bool {
  let client = match reqwest::Client::builder()
    .timeout(LOCAL_GATEWAY_HEALTH_TIMEOUT)
    .build()
  {
    Ok(c) => c,
    Err(_) => return false,
  };

  match client
    .get(gateway_health_url())
    .bearer_auth(token)
    .send()
    .await
  {
    // Any HTTP response (200, 401, 404, 500 …) means the gateway process is
    // listening on the port.  Only a connection error means it is truly down.
    // Treating 401 as "unhealthy" caused a restart loop: the supervisor would
    // kickstart the gateway even though it was running, and the new instance
    // would fail with EADDRINUSE.
    Ok(_) => true,
    Err(_) => false,
  }
}

async fn is_gateway_healthy_or_ready(token: &str) -> bool {
  is_gateway_healthy(token).await
}

/// Check the macOS code signature of the running app bundle.
/// Returns `Some(message)` if the signature is broken, `None` if it's OK or
/// the app is unsigned (unsigned dev builds are expected and not an error).
#[cfg(target_os = "macos")]
fn check_app_bundle_signature() -> Option<String> {
  // Walk up from the executable: .../Knapsack.app/Contents/MacOS/Knapsack
  // parent() x3 gives us Knapsack.app; convert to PathBuf immediately so
  // nothing borrows from `exe` past this point.
  let exe = std::env::current_exe().ok()?;
  let app_bundle: std::path::PathBuf = exe
    .parent() // Contents/MacOS
    .and_then(|p| p.parent()) // Contents
    .and_then(|p| p.parent()) // Knapsack.app
    .map(|p| p.to_path_buf())?;

  if app_bundle.extension().map_or(true, |e| e != "app") {
    return None; // dev / test environment — skip check
  }

  let output = Command::new("codesign")
    .args(["--verify", "--deep", "--strict"])
    .arg(&app_bundle)
    .output()
    .ok()?;

  if output.status.success() {
    return None;
  }

  let stderr = String::from_utf8_lossy(&output.stderr);
  // "code object is not signed at all" is normal for unsigned dev builds.
  if stderr.contains("code object is not signed at all") {
    return None;
  }

  Some(format!(
    "App bundle code signature is broken ({}). \
     Reinstalling Knapsack from a fresh notarized DMG should fix this.",
    stderr.trim()
  ))
}

#[cfg(target_os = "macos")]
pub fn kickstart_launch_agent(label: &str) -> Result<(), String> {
  if std::env::var("KNAPSACK_QA_DIRECT_GATEWAY").ok().as_deref() == Some("1") {
    eprintln!(
      "[gateway_supervisor] skipping launchctl kickstart for {} in QA direct gateway mode",
      label
    );
    return Ok(());
  }

  // Verify the app bundle seal before attempting to bootstrap the LaunchAgent.
  // launchd rejects binaries from a bundle with a broken signature with a
  // cryptic I/O error; surface a clear message instead.
  if let Some(sig_err) = check_app_bundle_signature() {
    return Err(sig_err);
  }

  let uid = unsafe { libc::getuid() };
  let service = format!("gui/{}/{}", uid, label);

  // kickstart will start it if loaded; if not loaded, it errors.
  let output = launchctl_output_with_timeout(
    &["kickstart", "-k", &service],
    Duration::from_secs(5),
    "gateway supervisor kickstart",
  )?;

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
  let _ = launchctl_output_with_timeout(
    &["bootout", &domain, &plist_str],
    Duration::from_secs(5),
    "gateway supervisor bootout",
  );

  // Small delay to let launchd clean up
  std::thread::sleep(std::time::Duration::from_millis(500));

  let boot = launchctl_output_with_timeout(
    &["bootstrap", &domain, &plist_str],
    Duration::from_secs(5),
    "gateway supervisor bootstrap",
  )?;

  if !boot.status.success() {
    let boot_stderr = String::from_utf8_lossy(&boot.stderr);
    return Err(format!(
      "kickstart and bootstrap both failed: {}",
      boot_stderr.trim()
    ));
  }

  // kickstart after bootstrap to ensure the process actually starts
  let kick2 = launchctl_output_with_timeout(
    &["kickstart", "-k", &service],
    Duration::from_secs(5),
    "gateway supervisor post-bootstrap kickstart",
  );

  match kick2 {
    Ok(o) if o.status.success() => {
      eprintln!("[gateway_supervisor] bootout + bootstrap + kickstart succeeded");
      Ok(())
    }
    Ok(o) => {
      let k2_stderr = String::from_utf8_lossy(&o.stderr);
      eprintln!(
        "[gateway_supervisor] post-bootstrap kickstart failed: {}",
        k2_stderr.trim()
      );
      // Bootstrap succeeded, so the service should start via KeepAlive — treat as OK
      Ok(())
    }
    Err(e) => {
      eprintln!("[gateway_supervisor] post-bootstrap kickstart error: {}", e);
      Ok(()) // Bootstrap succeeded, KeepAlive should handle it
    }
  }
}

#[cfg(target_os = "macos")]
fn launchctl_output_with_timeout(
  args: &[&str],
  timeout: Duration,
  context: &str,
) -> Result<std::process::Output, String> {
  let mut child = Command::new("launchctl")
    .args(args)
    .spawn()
    .map_err(|e| format!("Failed to run launchctl {}: {}", context, e))?;
  let start = Instant::now();

  loop {
    match child.try_wait() {
      Ok(Some(_)) => {
        return child
          .wait_with_output()
          .map_err(|e| format!("Failed to collect launchctl {} output: {}", context, e));
      }
      Ok(None) if start.elapsed() < timeout => {
        std::thread::sleep(Duration::from_millis(100));
      }
      Ok(None) => {
        let _ = child.kill();
        let _ = child.wait();
        return Err(format!(
          "launchctl {} timed out after {}s",
          context,
          timeout.as_secs()
        ));
      }
      Err(e) => {
        return Err(format!("Failed to poll launchctl {}: {}", context, e));
      }
    }
  }
}

#[cfg(target_os = "windows")]
pub fn kickstart_launch_agent(_label: &str) -> Result<(), String> {
  // On Windows, we can't kickstart a LaunchAgent. The health check will
  // trigger a re-enable via the /api/clawd/service/enable endpoint.
  // For now, just check if the gateway port is already occupied.
  let port_open = std::net::TcpStream::connect_timeout(
    &std::net::SocketAddr::from(([127, 0, 0, 1], 18789u16)),
    std::time::Duration::from_millis(500),
  )
  .is_ok();

  if port_open {
    Ok(())
  } else {
    Err("Gateway not running on Windows — re-enable via the UI".to_string())
  }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
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
  if is_gateway_healthy_or_ready(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy".to_string(),
    };
  }

  if super::service::gateway_startup_in_progress() {
    return GatewayEnsureResponse {
      success: true,
      running: false,
      message: "Gateway is starting".to_string(),
    };
  }

  // Acquire the restart mutex — if another caller is already restarting,
  // we wait for it to finish and then re-check health before trying ourselves.
  let _guard = RESTART_MUTEX.lock().await;

  // Re-check health after acquiring the lock — the previous holder may
  // have already restarted the gateway successfully.
  if is_gateway_healthy_or_ready(token).await {
    return GatewayEnsureResponse {
      success: true,
      running: true,
      message: "Gateway healthy (recovered while waiting)".to_string(),
    };
  }

  if super::service::gateway_startup_in_progress() {
    return GatewayEnsureResponse {
      success: true,
      running: false,
      message: "Gateway is starting".to_string(),
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

    if is_gateway_healthy_or_ready(token).await {
      return GatewayEnsureResponse {
        success: true,
        running: true,
        message: format!("Gateway started after {} attempt(s)", attempt + 1),
      };
    }
  }

  eprintln!(
    "[gateway_supervisor] Gateway failed to start after {} attempts",
    backoff_ms.len()
  );

  // Dump the last few lines of the gateway's stderr log so we can see
  // why the process is failing to start.
  let err_log = super::service::gateway_stderr_log();
  let mut detail = String::new();
  let mut crash_type = "unknown";
  if let Ok(content) = std::fs::read_to_string(&err_log) {
    let tail: Vec<&str> = content.lines().rev().take(25).collect();
    if !tail.is_empty() {
      let mut lines: Vec<&str> = tail.into_iter().collect();
      lines.reverse();
      eprintln!("[gateway_supervisor] --- last gateway stderr ---");
      for line in &lines {
        eprintln!("[gateway_supervisor]   {}", line);
      }
      let tail_text = lines.join("\n");
      let lower = tail_text.to_lowercase();
      crash_type = if lower.contains("assertionerror")
        && (lower.contains("ipv4") || lower.contains("mdns") || lower.contains("address changed"))
      {
        "mdns_crash"
      } else if lower.contains("eaddrinuse") || lower.contains("address already in use") {
        "port_conflict"
      } else if lower.contains("assertionerror") || lower.contains("[err_assertion]") {
        "crash_loop"
      } else if lower.contains("gatekeeper") || lower.contains("sigkill") {
        "gatekeeper_blocked"
      } else {
        "unknown"
      };
      detail = format!("\nLast stderr:\n{}", tail_text);
    }
  }

  // Sentry alert: gateway failed to recover after retries — this is a real incident.
  sentry::with_scope(
    |scope| scope.set_tag("gateway_crash_type", crash_type),
    || {
      sentry::capture_message(
        &format!(
          "[gateway_supervisor] Gateway unreachable after {} retry attempts. type={}",
          backoff_ms.len(),
          crash_type
        ),
        sentry::Level::Error,
      )
    },
  );
  eprintln!(
    "[gateway_supervisor] Sentry alert sent: crash_type={}",
    crash_type
  );

  // On macOS, check if the process is being killed by Gatekeeper (exit code 9 = SIGKILL).
  #[cfg(target_os = "macos")]
  {
    let uid = unsafe { libc::getuid() };
    let service = format!("gui/{}/{}", uid, label);
    if let Ok(output) = Command::new("launchctl").args(["print", &service]).output() {
      let info = String::from_utf8_lossy(&output.stdout);
      // launchctl print shows "last exit code" for the service
      if info.contains("last exit code = 9") || info.contains("last exit code = 137") {
        eprintln!("[gateway_supervisor] Service was killed with SIGKILL — likely macOS Gatekeeper");
        detail.push_str("\n[diagnostic] Gateway process was killed with SIGKILL (exit code 9). This typically means macOS Gatekeeper is blocking the binary due to missing or invalid code signature. Try re-installing from the latest notarized DMG.");
      }
    }
  }

  // Peekaboo watchdog: try to dismiss any blocking macOS dialog and capture
  // a diagnostic screenshot — fire-and-forget, never blocks recovery.
  crate::clawd::peekaboo_watchdog::on_gateway_down();

  GatewayEnsureResponse {
    success: false,
    running: false,
    message: format!(
      "Gateway not reachable after multiple retries (not running).{}",
      detail
    ),
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
    if is_gateway_healthy_or_ready(token).await {
      return true;
    }
    let elapsed_ms = start.elapsed().as_millis() as u64;
    let remaining_ms = max_wait_ms.saturating_sub(elapsed_ms);
    if remaining_ms == 0 {
      break;
    }
    tokio::time::sleep(std::time::Duration::from_millis(
      interval_ms.min(remaining_ms),
    ))
    .await;
    interval_ms = (interval_ms * 2).min(max_interval_ms);
  }

  // The final sleep can land exactly on the budget edge. Probe once more so a
  // gateway that became ready during that sleep is not reported as a timeout.
  is_gateway_healthy_or_ready(token).await
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
