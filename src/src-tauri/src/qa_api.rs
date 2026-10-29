//! Synthetic QA never observes or configures a host gateway/provider. Keep the
//! HTTP boundary prefix-based so new configuration routes fail closed too.
use actix_web::HttpResponse;

pub const ISOLATED_MESSAGE: &str = "Gateway and provider access are disabled for synthetic QA";

pub fn denied() -> HttpResponse {
  HttpResponse::Forbidden().json(serde_json::json!({
    "success": false, "isolated": true, "message": ISOLATED_MESSAGE,
  }))
}

pub fn isolated_status() -> HttpResponse {
  let mut body = serde_json::json!({
    "success": false, "isolated": true, "message": ISOLATED_MESSAGE,
    "installed": false, "running": false, "enabled": false,
    "gateway_ok": false, "gateway_listening": false, "browser_ok": false,
    "channels_ok": false, "startup_elapsed_ms": 0, "diagnostic_type": "synthetic_qa",
    "label": "synthetic-qa-disabled", "has_key": false, "key": null,
    "model": null, "active_provider": null, "extra_providers": [],
    "ollama_enabled": false, "ollama_cloud_enabled": false, "ollama_model": null,
    "ollama_base_url": null, "base_url": "", "models": [],
    "force_docker_mode": false, "docker_sandbox_available": false,
    "has_secret": false, "configured": false, "has_knapsack": false,
    "knapsack_auth_expired": false,
  });
  for provider in ["openai", "anthropic", "gemini", "groq", "xai", "openrouter", "trustedrouter", "gemini_cli"] {
    body[format!("has_{provider}_key")] = false.into();
    body[format!("{provider}_key_hint")] = serde_json::Value::Null;
    body[format!("{provider}_key")] = serde_json::Value::Null;
  }
  HttpResponse::Ok().json(body)
}

pub fn response_for(path: &str, method: &str, synthetic: bool) -> Option<HttpResponse> {
  if !synthetic || method == "OPTIONS" { return None; }
  let decoded = match urlencoding::decode(path) {
    Ok(value) => value, Err(_) => return Some(denied()),
  };
  let path = decoded.trim_end_matches('/');
  let protected = path == "/api/clawd" || path.starts_with("/api/clawd/")
    || path == "/api/knapsack/ollama" || path.starts_with("/api/knapsack/ollama/")
    || path == "/api/auth" || path.starts_with("/api/auth/")
    || matches!(path, "/api/knapsack/google/signin" | "/api/knapsack/microsoft/signin");
  if !protected { return None; }
  let status = matches!(path,
    "/api/clawd/service/status" | "/api/clawd/service/health"
    | "/api/clawd/service/startup-ready" | "/api/clawd/service/api-key-status"
    | "/api/clawd/service/get-api-key" | "/api/clawd/service/docker-mode-status"
    | "/api/clawd/service/session-capability-secret-status"
    | "/api/knapsack/ollama/status" | "/api/knapsack/ollama/models"
  );
  Some(if method == "GET" && status { isolated_status() } else { denied() })
}

#[cfg(test)]
mod tests {
  use super::*;
  use actix_web::{body::to_bytes, http::StatusCode};

  #[actix_web::test]
  async fn synthetic_gateway_provider_policy_blocks_adjacent_and_future_routes() {
    for path in ["/api/knapsack/ollama/configure", "/api/knapsack/ollama/pull",
      "/api/knapsack/ollama/delete", "/api/clawd/service/set-api-key",
      "/api/clawd/service/validate-api-key", "/api/clawd/service/llm_keys",
      "/api/clawd/service/oauth-start", "/api/clawd/service/future-config", "/api/%63lawd/service/future-config",
      "/api/clawd/browser/start", "/api/clawd/channels/generic/slack/status"] {
      assert_eq!(response_for(path, "POST", true).unwrap().status(), StatusCode::FORBIDDEN, "{path}");
      assert!(response_for(path, "POST", false).is_none(), "production behavior changed: {path}");
    }
    for path in ["/api/auth/knapsack-callback", "/api/auth/future-callback",
      "/api/knapsack/google/signin", "/api/knapsack/microsoft/signin"] {
      assert_eq!(response_for(path, "GET", true).unwrap().status(), StatusCode::FORBIDDEN);
      assert!(response_for(path, "GET", false).is_none());
    }
    assert!(response_for("/api/knapsack/qa/ready", "GET", true).is_none());
    assert!(response_for("/api/knapsack/thread/transcript", "GET", true).is_none());
  }

  #[actix_web::test]
  async fn synthetic_gateway_status_is_disabled_without_host_probes_or_keys() {
    for path in ["/api/clawd/service/health", "/api/clawd/service/status",
      "/api/clawd/service/startup-ready", "/api/clawd/service/api-key-status",
      "/api/clawd/service/get-api-key", "/api/knapsack/ollama/models"] {
      let response = response_for(path, "GET", true).unwrap();
      assert_eq!(response.status(), StatusCode::OK);
      let body: serde_json::Value = serde_json::from_slice(&to_bytes(response.into_body()).await.unwrap()).unwrap();
      for key in ["success", "running", "installed", "gateway_ok", "browser_ok", "has_key", "ollama_enabled"] {
        assert_eq!(body[key], false, "{path}: {key}");
      }
      assert_eq!(body["key"], serde_json::Value::Null);
      assert_eq!(body["active_provider"], serde_json::Value::Null);
      assert_eq!(body["models"], serde_json::json!([]));
    }
  }
}
