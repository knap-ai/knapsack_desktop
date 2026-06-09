use serde_json::json;

#[tauri::command]
pub fn open_screen_recording_settings() -> Result<serde_json::Value, String> {
  #[cfg(target_os = "macos")]
  {
    use std::process::Command;

    // On macOS < 14.2, Core Audio Taps aren't available so skip the tap probe
    // and go straight to opening the (legacy) Screen Capture settings pane.
    if check_macos_version_sufficient() {
      // Attempt a process tap probe. On macOS 14.4+/15+, this triggers
      // the system to register Knapsack in the "System Audio Recording" list
      // in System Settings, so the user doesn't have to manually find and add it.
      // This may also trigger an OS permission prompt dialog automatically.
      let already_granted =
        std::panic::catch_unwind(check_system_audio_via_tap_probe).unwrap_or(false);
      if already_granted {
        log::info!("System audio permission already granted (tap probe succeeded)");
        return Ok(json!({ "success": true, "already_granted": true }));
      }
    }

    // Open "System Audio Recording Only" pane in System Settings (macOS 14.4+)
    // Falls back to the older Screen Capture pane on older macOS versions
    let result = Command::new("open")
      .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AudioCapture")
      .output();

    match result {
      Ok(output) => {
        if !output.status.success() {
          // Fallback: try the Screen Capture pane (pre-macOS 14.4)
          let _ = Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
            .output();
        }
        Ok(json!({ "success": true }))
      }
      Err(e) => Ok(json!({
          "success": false,
          "error": format!("Failed to open settings: {}", e)
      })),
    }
  }

  #[cfg(target_os = "windows")]
  {
    use std::os::windows::process::CommandExt;
    use std::process::Command;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    // Windows doesn't have a separate "screen recording" permission.
    // Open the general privacy settings.
    let output = Command::new("cmd")
      .args(["/C", "start", "ms-settings:privacy-microphone"])
      .creation_flags(CREATE_NO_WINDOW)
      .output();

    match output {
      Ok(_) => Ok(json!({ "success": true })),
      Err(e) => Ok(json!({
          "success": false,
          "error": format!("Failed to open settings: {}", e)
      })),
    }
  }

  #[cfg(not(any(target_os = "macos", target_os = "windows")))]
  {
    Ok(json!({ "success": false, "error": "This command is only supported on macOS and Windows" }))
  }
}

/// Reset stale TCC entries for audio/screen recording permissions, then
/// re-trigger the OS permission prompt via CGRequestScreenCaptureAccess().
///
/// This fixes the "stuck state" where permissions show as enabled in System
/// Settings but the app can't detect them (typically due to a stale code
/// signature in the TCC database after an app update).
#[tauri::command]
pub fn reset_audio_permissions() -> Result<serde_json::Value, String> {
  #[cfg(target_os = "macos")]
  {
    use std::process::Command;

    let bundle_id = get_bundle_id();
    log::info!("Resetting audio permissions for bundle ID: {}", bundle_id);

    // Reset both TCC services. tccutil only supports resetting (not granting),
    // which removes the stale entry so the OS will re-prompt on next access.
    let services = ["ScreenCapture", "AudioCapture"];
    let mut reset_results = Vec::new();

    for service in &services {
      let result = Command::new("tccutil")
        .arg("reset")
        .arg(service)
        .arg(&bundle_id)
        .output();

      match result {
        Ok(output) => {
          let success = output.status.success();
          let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
          log::info!(
            "tccutil reset {} {}: success={}, stderr={}",
            service,
            bundle_id,
            success,
            stderr
          );
          reset_results.push(json!({
              "service": service,
              "success": success,
              "stderr": stderr,
          }));
        }
        Err(e) => {
          log::warn!("tccutil reset {} {} failed: {}", service, bundle_id, e);
          reset_results.push(json!({
              "service": service,
              "success": false,
              "error": e.to_string(),
          }));
        }
      }
    }

    // After resetting, call CGRequestScreenCaptureAccess() to trigger the
    // OS permission prompt. This registers the current binary's code signature
    // with TCC, replacing any stale entry.
    let prompted = request_screen_capture_access();

    // Also try to trigger the system audio recording prompt by attempting
    // a tap probe (which registers the app in "System Audio Recording Only")
    let _ = std::panic::catch_unwind(check_system_audio_via_tap_probe);

    Ok(json!({
        "success": true,
        "bundle_id": bundle_id,
        "reset_results": reset_results,
        "screen_capture_prompted": prompted,
    }))
  }

  #[cfg(not(target_os = "macos"))]
  {
    Ok(json!({ "success": false, "error": "Only supported on macOS" }))
  }
}

/// Diagnose audio permission state — returns detailed info about each
/// detection strategy for debugging stuck permission issues.
#[tauri::command]
pub fn diagnose_audio_permissions() -> Result<serde_json::Value, String> {
  #[cfg(target_os = "macos")]
  {
    use std::process::Command;

    let bundle_id = get_bundle_id();

    // Check microphone
    let mic = check_microphone_permission_macos();

    // Strategy 1: tap probe
    let tap_result = match std::panic::catch_unwind(check_system_audio_via_tap_probe) {
      Ok(granted) => json!({ "granted": granted }),
      Err(_) => json!({ "granted": false, "error": "panicked" }),
    };

    // Strategy 2: CGPreflight
    let cg_preflight = check_screen_capture_via_cg_preflight();

    // Strategy 3: TCC database
    let tcc_audio = {
      let query = format!(
                "SELECT auth_value FROM access WHERE service='kTCCServiceAudioCapture' AND client='{}' LIMIT 1",
                bundle_id
            );
      Command::new("sqlite3")
        .arg(format!(
          "{}/Library/Application Support/com.apple.TCC/TCC.db",
          std::env::var("HOME").unwrap_or_default()
        ))
        .arg(&query)
        .output()
        .map(|o| {
          let val = String::from_utf8_lossy(&o.stdout).trim().to_string();
          let err = String::from_utf8_lossy(&o.stderr).trim().to_string();
          json!({ "auth_value": val, "stderr": err })
        })
        .unwrap_or_else(|e| json!({ "error": e.to_string() }))
    };

    let tcc_screen = {
      let query = format!(
                "SELECT auth_value FROM access WHERE service='kTCCServiceScreenCapture' AND client='{}' LIMIT 1",
                bundle_id
            );
      Command::new("sqlite3")
        .arg(format!(
          "{}/Library/Application Support/com.apple.TCC/TCC.db",
          std::env::var("HOME").unwrap_or_default()
        ))
        .arg(&query)
        .output()
        .map(|o| {
          let val = String::from_utf8_lossy(&o.stdout).trim().to_string();
          let err = String::from_utf8_lossy(&o.stderr).trim().to_string();
          json!({ "auth_value": val, "stderr": err })
        })
        .unwrap_or_else(|e| json!({ "error": e.to_string() }))
    };

    // macOS version
    let macos_version = Command::new("sw_vers")
      .arg("-productVersion")
      .output()
      .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
      .unwrap_or_else(|_| "unknown".to_string());

    Ok(json!({
        "bundle_id": bundle_id,
        "macos_version": macos_version,
        "microphone": mic,
        "tap_probe": tap_result,
        "cg_preflight_screen_capture": cg_preflight,
        "tcc_audio_capture": tcc_audio,
        "tcc_screen_capture": tcc_screen,
    }))
  }

  #[cfg(not(target_os = "macos"))]
  {
    Ok(json!({ "error": "Only supported on macOS" }))
  }
}

/// Check whether the app has the required macOS permissions for recording.
/// Returns a JSON object with `microphone` and `screen_recording` boolean fields,
/// plus `all_granted` for convenience.
///
/// Both microphone and system audio permissions are required for full meeting
/// recording. System audio now uses "System Audio Recording Only"
/// (kTCCServiceAudioCapture) instead of the full "Screen & System Audio Recording"
/// (kTCCServiceScreenCapture).
///
/// Marked `async` so Tauri dispatches it on the Tokio async runtime rather than
/// the macOS main thread. The actual blocking work (subprocess spawning for
/// `osascript`, `sw_vers`, Core Audio tap probe) is pushed onto a blocking
/// thread via `spawn_blocking`. This prevents the beachball observed on Intel
/// Macs where sequential subprocess invocations can take 5–15 s.
/// A 6-second timeout ensures we always return promptly — on timeout we fall
/// back to the cached localStorage values the frontend already holds.
#[tauri::command]
pub async fn check_audio_permissions() -> Result<serde_json::Value, String> {
  #[cfg(target_os = "macos")]
  {
    let result = tokio::time::timeout(
            std::time::Duration::from_secs(6),
            tokio::task::spawn_blocking(|| -> serde_json::Value {
                // The notetaker uses Core Audio Taps (AudioHardwareCreateProcessTap /
                // CATapDescription) which require macOS 14.2+. On older versions we
                // return early with a clear upgrade message instead of letting the
                // permission probe silently fail.
                if !check_macos_version_sufficient() {
                    return json!({
                        "microphone": false,
                        "screen_recording": false,
                        "all_granted": false,
                        "os_update_required": true,
                        "os_update_message": "Meeting notes require macOS 14.2 (Sonoma) or later. Please update your operating system to use this feature."
                    });
                }

                let mic_granted = check_microphone_permission_macos();
                let system_audio_granted = check_system_audio_permission_macos();

                log::info!(
                    "[check_audio_permissions] microphone={} system_audio={}",
                    mic_granted, system_audio_granted
                );

                json!({
                    "microphone": mic_granted,
                    "screen_recording": system_audio_granted,
                    "system_audio": system_audio_granted,
                    "all_granted": mic_granted
                })
            }),
        )
        .await;

    match result {
      Ok(Ok(value)) => Ok(value),
      Ok(Err(join_err)) => {
        log::error!(
          "[check_audio_permissions] spawn_blocking panicked: {}",
          join_err
        );
        // Return a neutral result so the frontend falls back to localStorage
        Err(format!("Permission check panicked: {}", join_err))
      }
      Err(_timeout) => {
        log::warn!("[check_audio_permissions] timed out after 6s — returning cached state");
        // Timeout: frontend will fall back to its cached localStorage values
        Err("Permission check timed out".to_string())
      }
    }
  }

  #[cfg(not(target_os = "macos"))]
  {
    // On non-macOS platforms, assume permissions are granted
    // (Windows/Linux handle permissions differently)
    Ok(json!({
        "microphone": true,
        "screen_recording": true,
        "all_granted": true
    }))
  }
}

#[cfg(target_os = "macos")]
fn check_microphone_permission_macos() -> bool {
  use std::process::Command;
  // Use AppleScript to query AVFoundation's authorization status for audio.
  // AVAuthorizationStatus: 0=notDetermined, 1=restricted, 2=denied, 3=authorized
  let result = Command::new("osascript")
        .arg("-e")
        .arg(
            r#"use framework "AVFoundation"
set status to current application's AVCaptureDevice's authorizationStatusForMediaType:(current application's AVMediaTypeAudio)
return status as integer"#,
        )
        .output();

  match result {
    Ok(output) => {
      let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
      // 3 = AVAuthorizationStatusAuthorized
      stdout == "3"
    }
    Err(e) => {
      log::warn!("Failed to check microphone permission: {}", e);
      false
    }
  }
}

/// Public helper for other modules (e.g. audio.rs) to gate the speaker-output
/// thread on system audio permission without re-doing the full TCC check.
#[cfg(target_os = "macos")]
pub fn has_system_audio_permission() -> bool {
  check_system_audio_permission_macos()
}

#[cfg(not(target_os = "macos"))]
pub fn has_system_audio_permission() -> bool {
  true // Windows/Linux handle audio capture without this permission
}

/// Check if the app has "System Audio Recording Only" permission
/// (kTCCServiceAudioCapture) on macOS 14.4+.
///
/// This is the less-intrusive permission that only captures system audio
/// (like ChatGPT, krisp, Limitless) instead of full screen recording.
#[cfg(target_os = "macos")]
fn check_system_audio_permission_macos() -> bool {
  // Strategy 1 (most reliable): Try to actually create a Core Audio process tap.
  // This exercises the exact permission (kTCCServiceAudioCapture) that the
  // recording code needs and works regardless of SIP or TCC database access.
  // On macOS Sonoma/Sequoia, SIP protects the TCC database from direct sqlite3
  // access, making database checks unreliable. The tap probe is authoritative.
  //
  // Wrapped in catch_unwind because the objc2 msg_send_id! macro panics if
  // the Objective-C init method returns nil (e.g., on unsupported macOS versions
  // or when CATapDescription internals fail). Without this, a panic here would
  // crash the entire check_audio_permissions command, causing the frontend to
  // fall back to stale localStorage values — leaving users permanently stuck.
  match std::panic::catch_unwind(check_system_audio_via_tap_probe) {
    Ok(true) => return true,
    Ok(false) => {
      log::info!("Tap probe returned false, trying fallback strategies");
    }
    Err(e) => {
      let panic_msg = if let Some(s) = e.downcast_ref::<&str>() {
        s.to_string()
      } else if let Some(s) = e.downcast_ref::<String>() {
        s.clone()
      } else {
        "unknown panic".to_string()
      };
      log::warn!(
        "Tap probe panicked ({}), trying fallback strategies",
        panic_msg
      );
    }
  }

  // Strategy 2: Use CGPreflightScreenCaptureAccess() to check for screen
  // recording permission (kTCCServiceScreenCapture). Screen recording is a
  // superset of system audio recording — if the user has granted "Screen &
  // System Audio Recording", this returns true and audio capture will work.
  // This is a stable Apple API (macOS 10.15+) that doesn't depend on TCC
  // database access or process tap creation.
  if check_screen_capture_via_cg_preflight() {
    log::info!("CGPreflightScreenCaptureAccess confirms screen recording permission (superset of audio capture)");
    return true;
  }

  // Strategy 3 (fallback): Check the TCC database for kTCCServiceAudioCapture.
  // This may fail on newer macOS versions where SIP protects the database,
  // but is kept as a fallback for older systems.
  {
    use std::process::Command;
    let bundle_id = get_bundle_id();

    // Check kTCCServiceAudioCapture (System Audio Recording Only)
    let query = format!(
            "SELECT auth_value FROM access WHERE service='kTCCServiceAudioCapture' AND client='{}' LIMIT 1",
            bundle_id
        );
    if let Ok(output) = Command::new("sqlite3")
      .arg(format!(
        "{}/Library/Application Support/com.apple.TCC/TCC.db",
        std::env::var("HOME").unwrap_or_default()
      ))
      .arg(&query)
      .output()
    {
      let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
      let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
      if !stderr.is_empty() {
        log::warn!(
          "TCC database query for kTCCServiceAudioCapture returned stderr: {}",
          stderr
        );
      }
      // auth_value 2 = authorized
      if val == "2" {
        log::info!("TCC database confirms system audio recording permission granted (kTCCServiceAudioCapture)");
        return true;
      }
    }

    // Also check the old kTCCServiceScreenCapture as a fallback —
    // if the user already had screen recording permission, system audio
    // capture will also work since screen recording is a superset.
    let query_screen = format!(
            "SELECT auth_value FROM access WHERE service='kTCCServiceScreenCapture' AND client='{}' LIMIT 1",
            bundle_id
        );
    if let Ok(output) = Command::new("sqlite3")
      .arg(format!(
        "{}/Library/Application Support/com.apple.TCC/TCC.db",
        std::env::var("HOME").unwrap_or_default()
      ))
      .arg(&query_screen)
      .output()
    {
      let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
      if val == "2" {
        log::info!(
          "TCC database confirms screen recording permission granted (superset of audio capture)"
        );
        return true;
      }
    }
  }

  false
}

/// Check if the current macOS version is >= 14.2 (required for Core Audio Taps).
#[cfg(target_os = "macos")]
fn check_macos_version_sufficient() -> bool {
  use std::process::Command;
  // sw_vers -productVersion returns e.g. "14.5" or "13.6.1"
  let output = match Command::new("sw_vers").arg("-productVersion").output() {
    Ok(o) => o,
    Err(e) => {
      log::warn!("Failed to run sw_vers: {}", e);
      return true; // assume sufficient if we can't determine
    }
  };
  let version_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
  let parts: Vec<u32> = version_str
    .split('.')
    .filter_map(|p| p.parse().ok())
    .collect();
  let major = parts.first().copied().unwrap_or(0);
  let minor = parts.get(1).copied().unwrap_or(0);
  // Require macOS 14.2+
  major > 14 || (major == 14 && minor >= 2)
}

/// Helper to get the app's bundle ID, with fallback to the known production ID.
#[cfg(target_os = "macos")]
fn get_bundle_id() -> String {
  use std::process::Command;
  Command::new("osascript")
    .arg("-e")
    .arg(r#"return id of app "Knapsack""#)
    .output()
    .ok()
    .and_then(|o| {
      let s = String::from_utf8_lossy(&o.stdout).trim().to_string();
      if s.is_empty() {
        None
      } else {
        Some(s)
      }
    })
    .unwrap_or_else(|| "ai.knapsack.desktop".to_string())
}

/// Check screen recording permission via CGPreflightScreenCaptureAccess().
/// This is a reliable Apple API available since macOS 10.15 that checks
/// kTCCServiceScreenCapture without requiring TCC database access or creating
/// any audio taps.
#[cfg(target_os = "macos")]
fn check_screen_capture_via_cg_preflight() -> bool {
  extern "C" {
    fn CGPreflightScreenCaptureAccess() -> bool;
  }

  match std::panic::catch_unwind(|| unsafe { CGPreflightScreenCaptureAccess() }) {
    Ok(granted) => {
      log::info!("CGPreflightScreenCaptureAccess returned {}", granted);
      granted
    }
    Err(_) => {
      log::warn!("CGPreflightScreenCaptureAccess panicked");
      false
    }
  }
}

/// Actively request screen capture access via CGRequestScreenCaptureAccess().
/// Unlike CGPreflight (read-only check), this triggers the OS permission prompt
/// if access hasn't been granted yet, and registers the current binary's code
/// signature with TCC. Returns true if access was granted.
#[cfg(target_os = "macos")]
fn request_screen_capture_access() -> bool {
  extern "C" {
    fn CGRequestScreenCaptureAccess() -> bool;
  }

  match std::panic::catch_unwind(|| unsafe { CGRequestScreenCaptureAccess() }) {
    Ok(granted) => {
      log::info!("CGRequestScreenCaptureAccess returned {}", granted);
      granted
    }
    Err(_) => {
      log::warn!("CGRequestScreenCaptureAccess panicked");
      false
    }
  }
}

/// Probe whether system audio recording is actually allowed by attempting
/// to create (and immediately destroy) a Core Audio process tap.
///
/// Uses raw `msg_send!` with a nullable return to avoid the panic that
/// `msg_send_id!` triggers when `initStereoGlobalTapButExcludeProcesses:`
/// returns nil (common on first permission grant or certain macOS versions).
/// Callers should still wrap this in `catch_unwind` as an extra safety net.
#[cfg(target_os = "macos")]
fn check_system_audio_via_tap_probe() -> bool {
  use objc2::runtime::{AnyClass, AnyObject};
  use objc2::{msg_send, msg_send_id, rc::Id};

  extern "C" {
    fn AudioHardwareCreateProcessTap(
      tap_description: *mut std::ffi::c_void,
      tap_id: *mut u32,
    ) -> i32;
    fn AudioHardwareDestroyProcessTap(tap_id: u32) -> i32;
  }

  let tap_desc_class = match AnyClass::get("CATapDescription") {
    Some(cls) => cls,
    None => {
      log::warn!("CATapDescription class not found — macOS 14.2+ required for tap probe");
      return false;
    }
  };

  // Create a minimal stereo global tap (excluding our own process to avoid feedback)
  let our_pid = std::process::id() as i32;
  log::info!(
    "Tap probe: creating CATapDescription excluding PID {}",
    our_pid
  );

  let our_pid_ns: Id<AnyObject> = unsafe {
    let ns_number_class = AnyClass::get("NSNumber").unwrap();
    msg_send_id![ns_number_class, numberWithInt: our_pid]
  };
  let exclude_pids: Id<AnyObject> = unsafe {
    let ns_array_class = AnyClass::get("NSArray").unwrap();
    msg_send_id![ns_array_class, arrayWithObject: &*our_pid_ns]
  };

  // Use raw msg_send! returning a nullable pointer instead of msg_send_id!
  // which panics on nil. initStereoGlobalTapButExcludeProcesses: can return
  // nil when permissions haven't been granted yet or on certain macOS versions,
  // and a panic here crashes the entire app (ObjC exceptions bypass catch_unwind).
  let tap_desc_ptr: *mut AnyObject = unsafe {
    let alloc: *mut AnyObject = msg_send![tap_desc_class, alloc];
    if alloc.is_null() {
      log::warn!("Tap probe: CATapDescription alloc returned nil");
      return false;
    }
    msg_send![alloc, initStereoGlobalTapButExcludeProcesses: &*exclude_pids]
  };
  if tap_desc_ptr.is_null() {
    log::warn!("Tap probe: CATapDescription initStereoGlobalTapButExcludeProcesses: returned nil — permission likely not granted yet");
    return false;
  }

  let mut tap_id: u32 = 0;
  let status =
    unsafe { AudioHardwareCreateProcessTap(tap_desc_ptr as *mut std::ffi::c_void, &mut tap_id) };

  // Release the tap description (we own it from alloc/init)
  unsafe {
    let _: () = msg_send![tap_desc_ptr, release];
  }

  if status == 0 {
    // Success — permission is granted. Clean up immediately.
    unsafe {
      AudioHardwareDestroyProcessTap(tap_id);
    }
    log::info!("Tap probe succeeded — system audio recording permission confirmed");
    true
  } else {
    log::warn!(
      "Tap probe: AudioHardwareCreateProcessTap failed with OSStatus {}. \
             This may indicate permission is denied, or may be a transient/system error.",
      status
    );
    false
  }
}
