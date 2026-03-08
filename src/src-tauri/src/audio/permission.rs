use serde_json::json;

#[tauri::command]
pub fn open_screen_recording_settings() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

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
    // Strategy 1: Check the TCC database for kTCCServiceAudioCapture
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

    // Strategy 2: Try to use CATapDescription to check if we can create a tap.
    // If the permission is not granted, AudioHardwareCreateProcessTap will fail.
    // We don't actually do this here to avoid side effects — the TCC check above
    // should be sufficient.

    false
}
