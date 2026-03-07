use serde_json::json;

#[tauri::command]
pub fn open_screen_recording_settings() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        let output = Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
            .output();

        match output {
            Ok(_) => Ok(json!({ "success": true })),
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
#[tauri::command]
pub fn check_audio_permissions() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        let mic_granted = check_microphone_permission_macos();
        let screen_granted = check_screen_recording_permission_macos();

        Ok(json!({
            "microphone": mic_granted,
            "screen_recording": screen_granted,
            "all_granted": mic_granted && screen_granted
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

#[cfg(target_os = "macos")]
fn check_screen_recording_permission_macos() -> bool {
    // On macOS Sequoia (15.x+), both CGPreflightScreenCaptureAccess() and
    // SCShareableContent can return false even when the permission IS granted
    // in System Settings — the app often needs to be restarted after the user
    // toggles the permission on.  We try multiple strategies and return true
    // if ANY of them succeed.

    // Strategy 1: SCShareableContent (most reliable on modern macOS)
    {
        use std::sync::mpsc::channel;
        use std::time::Duration;
        use screen_capture_kit::shareable_content::SCShareableContent;

        let (tx, rx) = channel();
        SCShareableContent::get_shareable_content_with_completion_closure(
            move |shareable_content, _error| {
                let _ = tx.send(shareable_content.is_some());
            },
        );

        match rx.recv_timeout(Duration::from_secs(5)) {
            Ok(true) => return true,
            Ok(false) => { /* denied — try other methods */ }
            Err(_) => {
                log::warn!("SCShareableContent permission check timed out");
            }
        }
    }

    // Strategy 2: CGPreflightScreenCaptureAccess (works on pre-Sequoia)
    {
        extern "C" {
            fn CGPreflightScreenCaptureAccess() -> bool;
        }
        if unsafe { CGPreflightScreenCaptureAccess() } {
            return true;
        }
    }

    // Strategy 3: Check the TCC database directly.  On Sequoia the above APIs
    // can return stale results until the app is restarted, but the TCC database
    // reflects the actual toggle state immediately.
    {
        use std::process::Command;
        // Get our bundle ID (or fall back to a known value)
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

        let query = format!(
            "SELECT auth_value FROM access WHERE service='kTCCServiceScreenCapture' AND client='{}' LIMIT 1",
            bundle_id
        );
        if let Ok(output) = Command::new("sqlite3")
            .arg(format!("{}/Library/Application Support/com.apple.TCC/TCC.db",
                std::env::var("HOME").unwrap_or_default()))
            .arg(&query)
            .output()
        {
            let val = String::from_utf8_lossy(&output.stdout).trim().to_string();
            // auth_value 2 = authorized
            if val == "2" {
                log::info!("TCC database confirms screen recording permission granted");
                return true;
            }
        }
    }

    false
}
