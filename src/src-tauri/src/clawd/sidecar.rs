use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Configuration for talking to a Clawdbot instance.
///
/// For now, this is intentionally simple: we store a base URL and later we can
/// add "managed sidecar" startup (bundled binary) once the launch contract is finalized.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ClawdbotConfig {
  /// Example: http://127.0.0.1:18791
  pub base_url: Option<String>,
}

pub type SharedClawdbotConfig = Arc<RwLock<ClawdbotConfig>>;

#[derive(Debug, Serialize)]
pub struct ClawdbotStatusResponse {
  pub success: bool,
  pub base_url: Option<String>,
  pub message: String,
}

#[get("/api/clawd/status")]
pub async fn status(cfg: web::Data<SharedClawdbotConfig>) -> impl Responder {
  let cfg = cfg.read().await;
  HttpResponse::Ok().json(ClawdbotStatusResponse {
    success: true,
    base_url: cfg.base_url.clone(),
    message: match cfg.base_url.as_ref() {
      Some(url) => format!("Clawdbot configured: {}", url),
      None => "Clawdbot not configured yet".to_string(),
    },
  })
}

#[derive(Debug, Deserialize)]
pub struct SetClawdbotConfigRequest {
  pub base_url: String,
}

#[derive(Debug, Serialize)]
pub struct SetClawdbotConfigResponse {
  pub success: bool,
  pub message: String,
}

/// Set Clawdbot base URL at runtime.
///
/// This is a stepping stone to the "managed sidecar" approach:
/// once we bundle/run Clawdbot with the app, we can populate this automatically.
#[post("/api/clawd/config")]
pub async fn set_config(
  cfg: web::Data<SharedClawdbotConfig>,
  payload: web::Json<SetClawdbotConfigRequest>,
) -> impl Responder {
  let mut cfg_guard = cfg.write().await;
  cfg_guard.base_url = Some(payload.base_url.trim_end_matches('/').to_string());

  HttpResponse::Ok().json(SetClawdbotConfigResponse {
    success: true,
    message: "Clawdbot base_url set".to_string(),
  })
}
