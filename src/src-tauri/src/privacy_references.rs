//! Opens only fixed public references from the privacy dialog, never agent URLs.
fn reference_url(reference: &str) -> Result<&'static str, &'static str> {
  match reference {
    "zdr" => Ok("https://openagreements.org/practice-guides/ai-vendors/zdr-cross-provider-comparison"),
    "on-device" => Ok("https://docs.ollama.com/faq"),
    "inference" => Ok("https://cloud.google.com/discover/what-is-ai-inference"),
    _ => Err("Unknown privacy reference"),
  }
}

#[cfg(target_os = "macos")]
fn mac_open_args(url: &'static str) -> [&'static str; 3] {
  // A headless Chromium process can share the default browser's bundle ID.
  // Ask LaunchServices for a new foreground instance, not that running
  // instance. Leave the default browser and its profile settings alone.
  ["-n", "-u", url]
}

#[tauri::command]
pub async fn open_privacy_reference(app: tauri::AppHandle, reference: String) -> Result<(), String> {
  let url = reference_url(&reference)?;
  if crate::qa_launch::is_synthetic_build() {
    return Err("External links are disabled in synthetic QA".into());
  }
  #[cfg(target_os = "macos")]
  {
    let _ = app;
    tauri::async_runtime::spawn_blocking(move || {
      use std::process::{Command, Stdio};
      let status = Command::new("/usr/bin/open")
        .args(mac_open_args(url))
        .env_clear()
        .stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null())
        .status().map_err(|_| "Could not request a browser window")?;
      if status.success() { Ok(()) } else { Err("Could not request a browser window") }
    })
    .await.map_err(|_| "Could not request a browser window")?.map_err(String::from)
  }
  #[cfg(not(target_os = "macos"))]
  {
    use tauri::Manager;
    tauri::api::shell::open(&app.shell_scope(), url, None)
      .map_err(|_| "Could not request a browser window".into())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn only_fixed_public_references_are_openable() {
    for key in ["zdr", "on-device", "inference"] {
      assert!(reference_url(key).unwrap().starts_with("https://"));
    }
    for invalid in ["", "-a Google Chrome", "zdr?private", "https://example.invalid", "file:///tmp/file"] {
      assert!(reference_url(invalid).is_err());
    }
    assert_eq!(reference_url("zdr"), Ok("https://openagreements.org/practice-guides/ai-vendors/zdr-cross-provider-comparison"));
  }
  #[cfg(target_os = "macos")]
  #[test]
  fn new_instance_receives_only_the_fixed_url_and_is_not_backgrounded() {
    let url = reference_url("zdr").unwrap();
    assert_eq!(mac_open_args(url), ["-n", "-u", url]);
  }
}
