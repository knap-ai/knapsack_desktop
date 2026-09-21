//! Enforced, local Privacy Mode policy.
//!
//! This policy intentionally lives outside the agent/gateway configuration.
//! A model can suggest a provider, but it cannot change this file or relax the
//! checks performed by the desktop process before it starts or reconfigures a
//! gateway.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

const POLICY_VERSION: u8 = 1;
const MANIFEST: &str = include_str!("../data-egress-manifest.json");
static ENABLED: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
struct PrivacyModeConfig {
  version: u8,
  enabled: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct PrivacyModeStatus {
  pub enabled: bool,
  pub policy_version: u8,
  pub inference: &'static str,
  pub telemetry: &'static str,
  pub manifest_sha256: String,
}

fn config_path() -> Result<PathBuf, String> {
  dirs::home_dir()
    .map(|home| home.join(".knapsack").join("privacy-mode.json"))
    .ok_or_else(|| "Could not determine the home directory for Privacy Mode".to_string())
}

fn harden(path: &PathBuf) {
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o600));
  }
}

fn harden_directory(path: &std::path::Path) {
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o700));
  }
}

fn read_config() -> PrivacyModeConfig {
  let config = match config_path() {
    Ok(path) if path.exists() => fs::read_to_string(&path)
      .ok()
      .and_then(|raw| serde_json::from_str(&raw).ok())
      // A malformed or unreadable existing policy must not silently weaken it.
      .unwrap_or(PrivacyModeConfig {
        version: POLICY_VERSION,
        enabled: true,
      }),
    Ok(_) => PrivacyModeConfig {
      version: POLICY_VERSION,
      enabled: false,
    },
    // Without a known private location, fail closed rather than risk egress.
    Err(_) => PrivacyModeConfig {
      version: POLICY_VERSION,
      enabled: true,
    },
  };
  ENABLED.store(config.enabled, Ordering::Release);
  config
}

pub fn is_enabled() -> bool {
  if ENABLED.load(Ordering::Acquire) {
    return true;
  }
  read_config().enabled
}

fn manifest_sha256() -> String {
  format!("{:x}", Sha256::digest(MANIFEST.as_bytes()))
}

pub fn status() -> PrivacyModeStatus {
  PrivacyModeStatus {
    enabled: is_enabled(),
    policy_version: POLICY_VERSION,
    // Cloud ZDR is deliberately not inferred from an API key. A future
    // deployment can add a signed attestation, but this release fails closed.
    inference: if is_enabled() { "local-only" } else { "normal" },
    telemetry: if is_enabled() { "disabled" } else { "normal" },
    manifest_sha256: manifest_sha256(),
  }
}

/// Privacy Mode permits only a loopback Ollama endpoint. Cloud Ollama and all
/// other providers are outbound inference and therefore fail closed.
pub fn validate_inference(provider: &str, ollama_base_url: Option<&str>) -> Result<(), String> {
  if !is_enabled() {
    return Ok(());
  }
  if !provider.eq_ignore_ascii_case("ollama") {
    return Err("Privacy Mode allows local inference only. Select a local Ollama model or turn off Privacy Mode yourself in Settings.".to_string());
  }
  let url = ollama_base_url
    .unwrap_or("http://127.0.0.1:11434")
    .trim()
    .to_lowercase();
  let local = ["http://127.0.0.1", "http://localhost", "http://[::1]"]
    .iter()
    .any(|prefix| url.starts_with(prefix));
  if local {
    Ok(())
  } else {
    Err(
      "Privacy Mode does not allow a remote Ollama endpoint. Use localhost or 127.0.0.1."
        .to_string(),
    )
  }
}

pub fn apply_local_inference_env() {
  if is_enabled() {
    for key in [
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY",
      "GEMINI_API_KEY",
      "GOOGLE_API_KEY",
      "GROQ_API_KEY",
      "XAI_API_KEY",
      "OPENROUTER_API_KEY",
      "TRUSTEDROUTER_API_KEY",
      "KNAPSACK_ACCESS_TOKEN",
      "KNAPSACK_REFRESH_TOKEN",
      "KNAPSACK_USER_EMAIL",
    ] {
      std::env::remove_var(key);
    }
    std::env::set_var("KNAPSACK_ACTIVE_PROVIDER", "ollama");
    std::env::set_var("OLLAMA_API_KEY", "ollama-local");
    std::env::set_var("OLLAMA_HOST", "http://127.0.0.1:11434");
  }
}

#[tauri::command]
pub fn get_privacy_mode_status() -> PrivacyModeStatus {
  status()
}

/// This is a Tauri IPC command, not a localhost HTTP endpoint. The agent's
/// gateway has no capability for Tauri IPC and cannot relax the policy.
#[tauri::command]
pub fn set_privacy_mode(enabled: bool) -> Result<PrivacyModeStatus, String> {
  let path = config_path()?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    harden_directory(parent);
  }
  let config = PrivacyModeConfig {
    version: POLICY_VERSION,
    enabled,
  };
  fs::write(
    &path,
    serde_json::to_vec_pretty(&config).map_err(|e| e.to_string())?,
  )
  .map_err(|e| format!("Could not save Privacy Mode: {e}"))?;
  harden(&path);
  ENABLED.store(enabled, Ordering::Release);
  if enabled {
    apply_local_inference_env();
  }
  Ok(status())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn local_ollama_is_the_only_provider_when_enabled() {
    ENABLED.store(true, Ordering::Release);
    assert!(validate_inference("ollama", Some("http://127.0.0.1:11434")).is_ok());
    assert!(validate_inference("ollama", Some("https://api.ollama.com")).is_err());
    assert!(validate_inference("openai", None).is_err());
    ENABLED.store(false, Ordering::Release);
  }

  #[test]
  fn manifest_has_a_stable_audit_hash() {
    assert_eq!(manifest_sha256().len(), 64);
  }
}
