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
    // Call CGPreflightScreenCaptureAccess directly from the app process via FFI.
    // Using `swift -e` runs in a subprocess which macOS treats as a different app,
    // so it always returns false even when Knapsack has the permission.
    extern "C" {
        fn CGPreflightScreenCaptureAccess() -> bool;
    }
    if unsafe { CGPreflightScreenCaptureAccess() } {
        return true;
    }

    // Fallback: On macOS Sequoia (15.x+), CGPreflightScreenCaptureAccess() can
    // return false even when the permission IS granted in System Settings.
    // Use SCShareableContent as a more reliable check — it returns content when
    // permission is granted, or an error when denied.
    use std::sync::mpsc::channel;
    use std::time::Duration;
    use screen_capture_kit::shareable_content::SCShareableContent;

    let (tx, rx) = channel();
    SCShareableContent::get_shareable_content_with_completion_closure(
        move |shareable_content, _error| {
            let _ = tx.send(shareable_content.is_some());
        },
    );

    match rx.recv_timeout(Duration::from_secs(2)) {
        Ok(granted) => granted,
        Err(_) => {
            log::warn!("SCShareableContent permission check timed out, falling back to false");
            false
        }
    }
}
