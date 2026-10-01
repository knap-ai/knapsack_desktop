use serde_json::json;

#[tauri::command]
pub fn open_microphone_settings() -> Result<serde_json::Value, String> {
  #[cfg(target_os = "macos")]
  {
    // Native Launch Services avoids spawning `open` when file descriptors are
    // scarce. Check the returned BOOL instead of silently reporting success.
    use objc2::{msg_send, msg_send_id, rc::Id};
    use objc2::runtime::{AnyClass, AnyObject, Bool};
    use objc2_foundation::NSString;
    unsafe {
      let url_class = AnyClass::get("NSURL").ok_or("NSURL unavailable")?;
      let workspace_class = AnyClass::get("NSWorkspace").ok_or("NSWorkspace unavailable")?;
      let address = NSString::from_str("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone");
      let url: Id<AnyObject> = msg_send_id![url_class, URLWithString: &*address];
      let workspace: *mut AnyObject = msg_send![workspace_class, sharedWorkspace];
      let opened: Bool = msg_send![workspace, openURL: &*url];
      if !opened.as_bool() {
        return Err("Could not open System Settings. Open Privacy & Security > Microphone manually.".into());
      }
      Ok(json!({ "success": true }))
    }
  }

  #[cfg(target_os = "windows")]
  {
    use std::os::windows::process::CommandExt;
    use std::process::Command;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let output = Command::new("cmd")
      .args(["/C", "start", "ms-settings:privacy-microphone"])
      .creation_flags(CREATE_NO_WINDOW)
      .output();

    match output {
      Ok(output) if output.status.success() => Ok(json!({ "success": true })),
      Ok(_) => Err("Could not open microphone settings".into()),
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
