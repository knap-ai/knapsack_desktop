use serde_json::json;

#[tauri::command]
pub fn open_screen_recording_settings() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        // First, attempt a process tap probe. On macOS 14.4+/15+, this triggers
        // the system to register Knapsack in the "System Audio Recording" list
        // in System Settings, so the user doesn't have to manually find and add it.
        // This may also trigger an OS permission prompt dialog automatically.
        let already_granted = check_system_audio_via_tap_probe();
        if already_granted {
            log::info!("System audio permission already granted (tap probe succeeded)");
            return Ok(json!({ "success": true, "already_granted": true }));
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
            }))
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(json!({ "success": false, "error": "This command is only supported on macOS" }))
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
#[tauri::command]
pub fn check_audio_permissions() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        // The notetaker uses Core Audio Taps (AudioHardwareCreateProcessTap /
        // CATapDescription) which require macOS 14.2+. On older versions we
        // return early with a clear upgrade message instead of letting the
        // permission probe silently fail.
        if !check_macos_version_sufficient() {
            return Ok(json!({
                "microphone": false,
                "screen_recording": false,
                "all_granted": false,
                "os_update_required": true,
                "os_update_message": "Meeting notes require macOS 14.2 (Sonoma) or later. Please update your operating system to use this feature."
            }));
        }

        let mic_granted = check_microphone_permission_macos();
        let system_audio_granted = check_system_audio_permission_macos();

        Ok(json!({
            "microphone": mic_granted,
            "screen_recording": system_audio_granted,
            "all_granted": mic_granted && system_audio_granted
        }))
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

/// Check if the app has "System Audio Recording Only" permission
/// (kTCCServiceAudioCapture) on macOS 14.4+.
///
/// This is the less-intrusive permission that only captures system audio
/// (like Granola, ChatGPT, krisp, Limitless) instead of full screen recording.
#[cfg(target_os = "macos")]
fn check_system_audio_permission_macos() -> bool {
    // Strategy 1 (most reliable): Try to actually create a Core Audio process tap.
    // This exercises the exact permission (kTCCServiceAudioCapture) that the
    // recording code needs and works regardless of SIP or TCC database access.
    // On macOS Sonoma/Sequoia, SIP protects the TCC database from direct sqlite3
    // access, making database checks unreliable. The tap probe is authoritative.
    if check_system_audio_via_tap_probe() {
        return true;
    }

    // Strategy 2 (fallback): Check the TCC database for kTCCServiceAudioCapture.
    // This may fail on newer macOS versions where SIP protects the database,
    // but is kept as a fallback for older systems.
    {
        use std::process::Command;
        let bundle_id = Command::new("osascript")
            .arg("-e")
            .arg(r#"return id of app "Knapsack""#)
            .output()
            .ok()
            .and_then(|o| {
                let s = String::from_utf8_lossy(&o.stdout).trim().to_string();
                if s.is_empty() { None } else { Some(s) }
            })
            .unwrap_or_else(|| "ai.knapsack.desktop".to_string());

        // Check kTCCServiceAudioCapture (System Audio Recording Only)
        let query = format!(
            "SELECT auth_value FROM access WHERE service='kTCCServiceAudioCapture' AND client='{}' LIMIT 1",
            bundle_id
        );
        if let Ok(output) = Command::new("sqlite3")
            .arg(format!("{}/Library/Application Support/com.apple.TCC/TCC.db",
                std::env::var("HOME").unwrap_or_default()))
            .arg(&query)
            .output()
        {
            let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            if !stderr.is_empty() {
                log::warn!("TCC database query for kTCCServiceAudioCapture returned stderr: {}", stderr);
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
            .arg(format!("{}/Library/Application Support/com.apple.TCC/TCC.db",
                std::env::var("HOME").unwrap_or_default()))
            .arg(&query_screen)
            .output()
        {
            let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if val == "2" {
                log::info!("TCC database confirms screen recording permission granted (superset of audio capture)");
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
    let output = match Command::new("sw_vers")
        .arg("-productVersion")
        .output()
    {
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

/// Probe whether system audio recording is actually allowed by attempting
/// to create (and immediately destroy) a Core Audio process tap.
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
    let our_pid_ns: Id<AnyObject> = unsafe {
        let ns_number_class = AnyClass::get("NSNumber").unwrap();
        msg_send_id![ns_number_class, numberWithInt: our_pid]
    };
    let exclude_pids: Id<AnyObject> = unsafe {
        let ns_array_class = AnyClass::get("NSArray").unwrap();
        msg_send_id![ns_array_class, arrayWithObject: &*our_pid_ns]
    };

    let tap_desc: Id<AnyObject> = unsafe {
        let alloc: objc2::rc::Allocated<AnyObject> = msg_send_id![tap_desc_class, alloc];
        msg_send_id![alloc, initStereoGlobalTapButExcludeProcesses: &*exclude_pids]
    };

    let mut tap_id: u32 = 0;
    let status = unsafe {
        AudioHardwareCreateProcessTap(
            &*tap_desc as *const AnyObject as *mut std::ffi::c_void,
            &mut tap_id,
        )
    };

    if status == 0 {
        // Success — permission is granted. Clean up immediately.
        unsafe { AudioHardwareDestroyProcessTap(tap_id); }
        log::info!("Tap probe succeeded — system audio recording permission confirmed");
        true
    } else {
        log::info!("Tap probe failed with status {} — system audio permission not granted", status);
        false
    }
}
