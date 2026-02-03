use serde_json::json;

#[tauri::command]
pub fn open_microphone_settings() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        let output = Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
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