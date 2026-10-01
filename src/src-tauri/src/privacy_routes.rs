//! Route-level decisions shared by chat, voice and fallback paths.
//! Provider names alone are never evidence of zero retention.
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum InferencePrivacy {
  #[default]
  LocalOnly,
  ZeroRetention,
}

pub fn credential_fingerprint(key: &str) -> String {
  format!("{:x}", Sha256::digest(key.trim().as_bytes()))
}

/// Returns the model to send, or fails before any content is uploaded.
/// The Groq confirmation is an owner acknowledgement of their account setting,
/// bound to one credential; it is not presented as a provider attestation.
pub fn route_model(
  mode: InferencePrivacy,
  provider: &str,
  model: &str,
  endpoint: &str,
  credential: &str,
  groq_confirmation: Option<&str>,
) -> Result<String, String> {
  let url = reqwest::Url::parse(endpoint).map_err(|_| "Invalid inference endpoint")?;
  if !url.username().is_empty() || url.password().is_some() {
    return Err("Privacy Mode rejects credentials in inference URLs".into());
  }
  if provider == "ollama" && url.scheme() == "http"
    && matches!(url.host_str(), Some("127.0.0.1" | "localhost" | "[::1]"))
    && !model.split([':', '/']).any(|part| part.eq_ignore_ascii_case("cloud"))
  {
    return Ok(model.to_string());
  }
  if mode == InferencePrivacy::LocalOnly {
    return Err("On-device mode requires a local Ollama model. Cloud fallback is blocked.".into());
  }
  if url.scheme() != "https" || url.port_or_known_default() != Some(443) {
    return Err("Private cloud inference requires an approved HTTPS endpoint".into());
  }
  match (provider, url.host_str()) {
    ("trustedrouter", Some("api.trustedrouter.com")) => {
      // The provider enforces a hard ZDR floor for this alias, including fallback.
      // Do not reuse a user's broad auto route or a community endpoint.
      Ok("trustedrouter/zdr".to_string())
    }
    ("groq", Some("api.groq.com")) if !credential.trim().is_empty()
      && groq_confirmation == Some(credential_fingerprint(credential).as_str()) => {
      // Compound can call third-party hosted tools; no blanket ZDR claim for them.
      if model.contains("compound") {
        return Err("Choose a Groq inference model without hosted tools for zero-retention mode".into());
      }
      Ok(model.to_string())
    }
    ("groq", _) => Err("Enable ZDR in Groq Data Controls and confirm it for this connection".into()),
    // Knapsack owner confirms end-to-end ZDR for the production service.
    ("knapsack", Some("api.knapsack.ai")) => Ok(model.to_string()),
    _ => Err("This route is not eligible for zero-retention mode. Choose an eligible private cloud route or local Ollama.".into()),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn old_policies_default_to_local_and_reject_cloud_disguises() {
    assert_eq!(InferencePrivacy::default(), InferencePrivacy::LocalOnly);
    for endpoint in ["http://localhost.evil.test", "http://127.0.0.1@evil.test", "https://ollama.com"] {
      assert!(route_model(InferencePrivacy::LocalOnly,"ollama","qwen3:8b",endpoint,"",None).is_err());
    }
    assert!(route_model(InferencePrivacy::LocalOnly,"ollama","qwen3:8b","http://[::1]:11434","",None).is_ok());
    assert!(route_model(InferencePrivacy::LocalOnly,"ollama","qwen3:cloud","http://localhost:11434","",None).is_err());
  }
  #[test]
  fn trustedrouter_forces_zdr_and_rejects_lookalike_hosts() {
    assert_eq!(route_model(InferencePrivacy::ZeroRetention,"trustedrouter","trustedrouter/auto","https://api.trustedrouter.com/v1","test",None).unwrap(),"trustedrouter/zdr");
    assert!(route_model(InferencePrivacy::ZeroRetention,"trustedrouter","auto","https://api.trustedrouter.com.evil.test/v1","test",None).is_err());
  }
  #[test]
  fn groq_confirmation_is_bound_to_the_key_and_excludes_hosted_tools() {
    let fingerprint = credential_fingerprint("key-one");
    for key in ["", "key-two"] {
      assert!(route_model(InferencePrivacy::ZeroRetention,"groq","whisper-large-v3-turbo","https://api.groq.com/openai/v1",key,Some(&fingerprint)).is_err());
    }
    assert!(route_model(InferencePrivacy::ZeroRetention,"groq","whisper-large-v3-turbo","https://api.groq.com/openai/v1","key-one",Some(&fingerprint)).is_ok());
    assert!(route_model(InferencePrivacy::ZeroRetention,"groq","groq/compound","https://api.groq.com/openai/v1","key-one",Some(&fingerprint)).is_err());
  }
  #[test]
  fn ordinary_cloud_routes_fail_closed() {
    for provider in ["openai", "anthropic", "knapsack-local"] {
      assert!(route_model(InferencePrivacy::ZeroRetention,provider,"auto","https://api.knapsack.ai","test",None).is_err());
    }
  }
  #[test]
  fn knapsack_zdr_is_production_only_and_never_local_only() {
    assert!(route_model(InferencePrivacy::ZeroRetention,"knapsack","auto","https://api.knapsack.ai/chat/completions","",None).is_ok());
    for endpoint in ["http://api.knapsack.ai", "https://api.knapsack.ai.evil.test", "https://api.knapsack.ai:8443", "https://user@api.knapsack.ai"] {
      assert!(route_model(InferencePrivacy::ZeroRetention,"knapsack","auto",endpoint,"",None).is_err());
    }
    assert!(route_model(InferencePrivacy::LocalOnly,"knapsack","auto","https://api.knapsack.ai","",None).is_err());
  }

}
