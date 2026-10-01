#[path = "privacy_routes.rs"]
pub mod routes;

// Enforced, local Privacy Mode policy.
//
// This policy intentionally lives outside the agent/gateway configuration.
// A model can suggest a provider, but it cannot change this file or relax the
// checks performed by the desktop process before it starts or reconfigures a
// gateway.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::sync::Mutex;
static POLICY_WRITE_LOCK: Mutex<()> = Mutex::new(());
use std::path::PathBuf;
use routes::InferencePrivacy;

const POLICY_VERSION: u8 = 2;
const MANIFEST: &str = include_str!("../data-egress-manifest.json");

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
struct PrivacyModeConfig {
  version: u8,
  enabled: bool,
  #[serde(default)]
  mode: InferencePrivacy,
  #[serde(default)]
  groq_zdr_fingerprint: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PrivacyModeStatus {
  pub enabled: bool,
  pub policy_version: u8,
  pub selected_mode: InferencePrivacy,
  pub groq_zdr_confirmed: bool,
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
        mode: InferencePrivacy::LocalOnly,
        groq_zdr_fingerprint: None,
      }),
    Ok(_) => PrivacyModeConfig {
      version: POLICY_VERSION,
      enabled: false,
      mode: InferencePrivacy::LocalOnly,
      groq_zdr_fingerprint: None,
    },
    // Without a known private location, fail closed rather than risk egress.
    Err(_) => PrivacyModeConfig {
      version: POLICY_VERSION,
      enabled: true,
      mode: InferencePrivacy::LocalOnly,
      groq_zdr_fingerprint: None,
    },
  };
  config
}

pub fn is_enabled() -> bool { read_config().enabled }

pub fn is_local_only() -> bool {
  let config = read_config();
  config.enabled && config.mode == InferencePrivacy::LocalOnly
}

pub fn enforce_route(provider: &str, model: &str, endpoint: &str, credential: &str) -> Result<String, String> {
  let config = read_config();
  if !config.enabled { return Ok(model.to_string()); }
  routes::route_model(config.mode, provider, model, endpoint, credential, config.groq_zdr_fingerprint.as_deref())
}

#[tauri::command]
pub fn authorize_private_inference(provider: String, model: String, endpoint: String, credential: String) -> Result<String, String> {
  enforce_route(&provider, &model, &endpoint, &credential)
}

fn manifest_sha256() -> String {
  format!("{:x}", Sha256::digest(MANIFEST.as_bytes()))
}

pub fn status() -> PrivacyModeStatus {
  let config = read_config();
  PrivacyModeStatus {
    enabled: config.enabled,
    policy_version: POLICY_VERSION,
    selected_mode: config.mode,
    groq_zdr_confirmed: config.groq_zdr_fingerprint.is_some(),
    inference: if !config.enabled { "normal" } else if config.mode == InferencePrivacy::LocalOnly { "local-only" } else { "zero-retention" },
    telemetry: if config.enabled { "disabled" } else { "normal" },
    manifest_sha256: manifest_sha256(),
  }
}

/// Privacy Mode permits only a loopback Ollama endpoint. Cloud Ollama and all
/// other providers are outbound inference and therefore fail closed.
pub fn validate_inference(provider: &str, ollama_base_url: Option<&str>) -> Result<(), String> {
  if !is_enabled() { return Ok(()); }
  if !is_local_only() && matches!(provider, "groq" | "trustedrouter" | "knapsack") { return Ok(()); }
  if !provider.eq_ignore_ascii_case("ollama") {
    return Err("Privacy Mode allows local inference only. Select a local Ollama model or turn off Privacy Mode yourself in Settings.".to_string());
  }
  let url = ollama_base_url
    .unwrap_or("http://127.0.0.1:11434")
    .trim()
    .to_lowercase();
  let local = reqwest::Url::parse(&url).ok().is_some_and(|url| {
    url.scheme() == "http"
      && url.username().is_empty()
      && url.password().is_none()
      && matches!(url.host_str(), Some("127.0.0.1" | "localhost" | "[::1]"))
  });
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
  if is_local_only() {
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
pub fn set_privacy_mode(app_handle: tauri::AppHandle, enabled: bool, mode: Option<InferencePrivacy>, confirm_groq_zdr: Option<bool>) -> Result<PrivacyModeStatus, String> {
  let _guard = POLICY_WRITE_LOCK.lock().map_err(|_| "Privacy settings are busy")?;
  let path = config_path()?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    harden_directory(parent);
  }
  let previous = read_config();
  let groq_zdr_fingerprint = match confirm_groq_zdr {
    Some(true) => Some(crate::clawd::service::groq_privacy_fingerprint(&app_handle)?),
    Some(false) => None,
    None => previous.groq_zdr_fingerprint,
  };
  let config = PrivacyModeConfig {
    version: POLICY_VERSION, enabled,
    mode: mode.unwrap_or(previous.mode), groq_zdr_fingerprint,
  };
  let temporary = path.with_extension(format!("{}.tmp", uuid::Uuid::new_v4()));
  let saved = (|| -> Result<(), String> {
    let mut options = fs::OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)] {
      use std::os::unix::fs::OpenOptionsExt;
      options.mode(0o600);
    }
    let mut file = options.open(&temporary).map_err(|e| e.to_string())?;
    file.write_all(&serde_json::to_vec_pretty(&config).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
    file.sync_all().map_err(|e| e.to_string())?;
    drop(file);
    fs::rename(&temporary, &path).map_err(|e| e.to_string())?;
    Ok(())
  })();
  if let Err(error) = saved {
    let _ = fs::remove_file(&temporary);
    return Err(format!("Could not save Privacy Mode: {error}"));
  }
  harden(&path);
  crate::clawd::service::propagate_llm_keys_to_env(&app_handle);
  if enabled {
    apply_local_inference_env();
  }
  Ok(status())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn legacy_privacy_selection_remains_local_only() {
    let legacy: PrivacyModeConfig = serde_json::from_str(r#"{"version":1,"enabled":true}"#).unwrap();
    assert_eq!(legacy.mode, InferencePrivacy::LocalOnly);
    assert!(legacy.groq_zdr_fingerprint.is_none());
  }

  #[test]
  fn manifest_has_a_stable_audit_hash() {
    assert_eq!(manifest_sha256().len(), 64);
  }
}

/// Only hardware capacity, never identifiers or personal content.
#[tauri::command]
pub fn get_local_model_hardware() -> serde_json::Value {
  let mut system = sysinfo::System::new();
  system.refresh_memory();
  system.refresh_cpu_all();
  serde_json::json!({
    "memory_bytes": system.total_memory(),
    "available_memory_bytes": system.available_memory(),
    "architecture": std::env::consts::ARCH,
    "cpu": system.cpus().first().map(|cpu| cpu.brand()).unwrap_or("Unknown CPU"),
  })
}
