/// Peekaboo-based self-QA and self-healing for macOS.
///
/// When the gateway goes down or WS reconnect is exhausted this module fires a
/// background task that uses the `peekaboo` CLI to:
///
///  1. Detect macOS system dialogs that might be blocking the gateway
///     (e.g. "Knapsack wants Screen Recording access") and dismiss them.
///  2. Capture a diagnostic screenshot saved to the system temp dir so the
///     support team can see exactly what was on screen at the time of failure.
///
/// All operations are:
///  - macOS-only (the whole module is cfg-gated)
///  - fire-and-forget (never blocks the existing recovery path)
///  - fail-safe (any error just logs and returns; peekaboo not being installed
///    is a silent no-op)

#[cfg(target_os = "macos")]
mod imp {
  use std::path::PathBuf;
  use std::time::{SystemTime, UNIX_EPOCH};
  use tokio::process::Command;
  use tokio::io::AsyncReadExt;

  const KNOWN_PATHS: &[&str] = &[
    "/opt/homebrew/bin/peekaboo",
    "/usr/local/bin/peekaboo",
    "/usr/bin/peekaboo",
  ];

  /// Locate the peekaboo binary: try `which` first, then well-known paths.
  fn find_peekaboo() -> Option<PathBuf> {
    if let Ok(out) = std::process::Command::new("which").arg("peekaboo").output() {
      if out.status.success() {
        let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
        if !s.is_empty() {
          return Some(PathBuf::from(s));
        }
      }
    }
    for &p in KNOWN_PATHS {
      let pb = PathBuf::from(p);
      if pb.exists() {
        return Some(pb);
      }
    }
    None
  }

  /// Run a peekaboo subcommand and return stdout. Timeout: 8 s.
  async fn run(bin: &PathBuf, args: &[&str]) -> Option<String> {
    let result = tokio::time::timeout(
      std::time::Duration::from_secs(8),
      Command::new(bin).args(args).output(),
    )
    .await;

    match result {
      Ok(Ok(out)) => Some(String::from_utf8_lossy(&out.stdout).to_string()),
      Ok(Err(e)) => {
        eprintln!("[peekaboo_watchdog] run {:?} error: {}", args, e);
        None
      }
      Err(_) => {
        eprintln!("[peekaboo_watchdog] run {:?} timed out", args);
        None
      }
    }
  }

  /// Check for blocking macOS system dialogs and try to dismiss them.
  ///
  /// Common blockers: TCC permission sheets ("wants access to Screen Recording"),
  /// crash reporters, update prompts.  We attempt to click "Allow" first, then
  /// fall back to "OK", then generic dismiss.
  async fn clear_blocking_dialogs(bin: &PathBuf) {
    let Some(json) = run(bin, &["dialog", "list", "--json"]).await else { return };

    // If the output is non-trivially empty there's at least one dialog open.
    let trimmed = json.trim();
    if trimmed.is_empty() || trimmed == "[]" || trimmed == "null" {
      return;
    }

    eprintln!("[peekaboo_watchdog] blocking dialog detected: {}", trimmed);

    // Try the most permissive button first ("Allow"), then generic OK, then dismiss.
    for button in &["Allow", "OK", "Continue"] {
      if let Some(out) = run(bin, &["dialog", "click", "--button", button]).await {
        let out = out.trim();
        if !out.is_empty() {
          eprintln!("[peekaboo_watchdog] clicked '{}' button: {}", button, out);
          return;
        }
      }
    }

    // Last resort: generic dismiss (presses Escape / default cancel).
    if let Some(out) = run(bin, &["dialog", "dismiss"]).await {
      eprintln!("[peekaboo_watchdog] dialog dismiss result: {}", out.trim());
    }
  }

  /// Take a full-screen diagnostic screenshot and return the saved path.
  async fn capture_screenshot(bin: &PathBuf, label: &str) -> Option<String> {
    let ts = SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map(|d| d.as_secs())
      .unwrap_or(0);
    let path = format!("/tmp/knapsack-health-{}-{}.png", label, ts);
    run(bin, &["image", "--mode", "screen", "--path", &path]).await;
    if std::path::Path::new(&path).exists() {
      Some(path)
    } else {
      None
    }
  }

  /// Confirm Knapsack is listed as a running app.
  async fn knapsack_is_running(bin: &PathBuf) -> bool {
    let Some(json) = run(bin, &["list", "apps", "--json"]).await else { return true };
    // If we can't parse it, assume OK rather than false-positive.
    json.to_lowercase().contains("knapsack")
  }

  /// Internal async body — called from both public entry points.
  async fn run_watchdog(label: &str) {
    let Some(bin) = find_peekaboo() else {
      eprintln!("[peekaboo_watchdog] peekaboo not installed — skipping ({label})");
      return;
    };
    eprintln!("[peekaboo_watchdog] starting watchdog ({label}), bin={}", bin.display());

    // 1. Clear any dialog that might be blocking the gateway or the OS.
    clear_blocking_dialogs(&bin).await;

    // 2. Diagnostic screenshot so we can see the screen state at failure time.
    match capture_screenshot(&bin, label).await {
      Some(path) => eprintln!("[peekaboo_watchdog] screenshot saved: {}", path),
      None => eprintln!("[peekaboo_watchdog] screenshot failed or empty"),
    }

    // 3. Sanity-check that the Knapsack process is still running.
    if !knapsack_is_running(&bin).await {
      eprintln!("[peekaboo_watchdog] WARNING: Knapsack not found in running apps list");
    }
  }

  /// Fire-and-forget: triggered when `ensure_gateway_running` exhausts all retries.
  pub fn on_gateway_down() {
    tokio::spawn(async { run_watchdog("gateway-down").await });
  }

  /// Fire-and-forget: triggered when the WS reconnect task exhausts all attempts.
  pub fn on_reconnect_exhausted() {
    tokio::spawn(async { run_watchdog("reconnect-exhausted").await });
  }
}

// ── Public surface (no-ops on non-macOS) ────────────────────────────────────

/// Call after `ensure_gateway_running` returns failure.
#[cfg(target_os = "macos")]
pub fn on_gateway_down() {
  imp::on_gateway_down();
}

#[cfg(not(target_os = "macos"))]
pub fn on_gateway_down() {}

/// Call when the WS reconnect task gives up after all attempts.
#[cfg(target_os = "macos")]
pub fn on_reconnect_exhausted() {
  imp::on_reconnect_exhausted();
}

#[cfg(not(target_os = "macos"))]
pub fn on_reconnect_exhausted() {}
