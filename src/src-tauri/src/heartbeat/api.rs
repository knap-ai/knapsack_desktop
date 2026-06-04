use actix_web::web::{Data, Json};
use actix_web::{get, post, put, HttpResponse};
use serde_json::json;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::db::models::heartbeat::{HeartbeatConfig, HeartbeatLog, UpdateHeartbeatConfigRequest};

/// GET /api/knapsack/heartbeat/config
/// Returns the current heartbeat configuration.
#[get("/api/knapsack/heartbeat/config")]
pub async fn get_heartbeat_config() -> HttpResponse {
  match HeartbeatConfig::get_config() {
    Ok(config) => HttpResponse::Ok().json(json!({
        "success": true,
        "data": config,
    })),
    Err(e) => {
      log::error!("[heartbeat] Failed to get config: {:?}", e);
      HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": format!("Failed to get heartbeat config: {:?}", e),
      }))
    }
  }
}

/// PUT /api/knapsack/heartbeat/config
/// Update the heartbeat configuration. Partial updates are supported.
#[put("/api/knapsack/heartbeat/config")]
pub async fn update_heartbeat_config(payload: Json<UpdateHeartbeatConfigRequest>) -> HttpResponse {
  match HeartbeatConfig::update_config(&payload.into_inner()) {
    Ok(config) => HttpResponse::Ok().json(json!({
        "success": true,
        "data": config,
    })),
    Err(e) => {
      log::error!("[heartbeat] Failed to update config: {:?}", e);
      HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": format!("Failed to update heartbeat config: {:?}", e),
      }))
    }
  }
}

/// GET /api/knapsack/heartbeat/logs
/// Returns the most recent heartbeat logs (default: 20).
#[get("/api/knapsack/heartbeat/logs")]
pub async fn get_heartbeat_logs() -> HttpResponse {
  match HeartbeatLog::get_recent_logs(20) {
    Ok(logs) => HttpResponse::Ok().json(json!({
        "success": true,
        "data": logs,
    })),
    Err(e) => {
      log::error!("[heartbeat] Failed to get logs: {:?}", e);
      HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": format!("Failed to get heartbeat logs: {:?}", e),
      }))
    }
  }
}

/// POST /api/knapsack/heartbeat/trigger
/// Manually trigger a heartbeat check right now.
#[post("/api/knapsack/heartbeat/trigger")]
pub async fn trigger_heartbeat(
  app_handle: Data<tauri::AppHandle>,
  is_chatting: Data<Arc<Mutex<AtomicBool>>>,
) -> HttpResponse {
  match super::engine::trigger_heartbeat(&app_handle, &is_chatting).await {
    Ok(log_entry) => HttpResponse::Ok().json(json!({
        "success": true,
        "data": log_entry,
    })),
    Err(e) => {
      log::error!("[heartbeat] Manual trigger failed: {}", e);
      HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": e,
      }))
    }
  }
}
