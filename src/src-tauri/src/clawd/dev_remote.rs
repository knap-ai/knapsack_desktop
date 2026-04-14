//! Remote Developer Mode API
//!
//! Allows developer mode to be controlled from any source — the desktop UI,
//! Telegram, WhatsApp, or any other channel. Stores state server-side so
//! the UI can sync with remote changes, and pushes notifications back to
//! the originating channel.

use actix_web::{get, post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevProject {
  pub id: String,
  pub name: String,
  pub description: String,
  pub github_url: String,
  pub dev_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DevModeState {
  pub enabled: bool,
  pub projects: Vec<DevProject>,
  pub active_project_id: Option<String>,
  /// Channel that last modified state (e.g. "telegram", "whatsapp", "webchat")
  pub source_channel: Option<String>,
  /// Recipient address for channel notifications (e.g. phone number, @username)
  pub notify_to: Option<String>,
  /// Monotonically increasing version for change detection
  pub version: u64,
  pub updated_at: u64,
}

impl Default for DevModeState {
  fn default() -> Self {
    Self {
      enabled: false,
      projects: Vec::new(),
      active_project_id: None,
      source_channel: None,
      notify_to: None,
      version: 0,
      updated_at: now_secs(),
    }
  }
}

pub type SharedDevModeState = Arc<Mutex<DevModeState>>;

pub fn new_shared_dev_mode_state() -> SharedDevModeState {
  Arc::new(Mutex::new(DevModeState::default()))
}

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
pub struct RemoteCommand {
  pub action: String,
  /// Source channel (telegram, whatsapp, imessage, webchat, etc.)
  #[serde(default)]
  pub channel: Option<String>,
  /// Who to notify on this channel (phone number, @username, etc.)
  #[serde(default)]
  pub notify_to: Option<String>,
  /// Project fields (for set_project)
  #[serde(default)]
  pub name: Option<String>,
  #[serde(default)]
  pub description: Option<String>,
  #[serde(default)]
  pub github_url: Option<String>,
  #[serde(default)]
  pub dev_url: Option<String>,
  /// For launch_team: project description override
  #[serde(default)]
  pub project_description: Option<String>,
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/// GET /api/knapsack/dev/state - get current developer mode state
/// The frontend polls this to stay in sync with remote changes.
#[get("/api/knapsack/dev/state")]
pub async fn get_dev_state(state: web::Data<SharedDevModeState>) -> impl Responder {
  let guard = state.lock().await;
  HttpResponse::Ok().json(serde_json::json!({
      "ok": true,
      "state": *guard,
  }))
}

/// POST /api/knapsack/dev/remote - execute a developer mode command
///
/// Actions:
///   - "enable"       — enable developer mode
///   - "disable"      — disable developer mode
///   - "set_project"  — add or update a project (name, description, github_url, dev_url)
///   - "status"       — return current state (same as GET /state)
#[post("/api/knapsack/dev/remote")]
pub async fn remote_command(
  body: web::Json<RemoteCommand>,
  state: web::Data<SharedDevModeState>,
) -> impl Responder {
  let cmd = body.into_inner();
  let mut guard = state.lock().await;

  // Track source channel for notifications
  if let Some(ref ch) = cmd.channel {
    guard.source_channel = Some(ch.clone());
  }
  if let Some(ref to) = cmd.notify_to {
    guard.notify_to = Some(to.clone());
  }

  match cmd.action.as_str() {
    "enable" => {
      guard.enabled = true;
      guard.version += 1;
      guard.updated_at = now_secs();

      // If a description was provided, create/update a project
      if let Some(ref desc) = cmd.description {
        let name = cmd.name.unwrap_or_else(|| "Remote Project".to_string());
        let id = format!("remote-{}", now_secs());
        let project = DevProject {
          id: id.clone(),
          name,
          description: desc.clone(),
          github_url: cmd.github_url.unwrap_or_default(),
          dev_url: cmd
            .dev_url
            .unwrap_or_else(|| "http://localhost:3000".to_string()),
        };
        guard.projects.push(project);
        guard.active_project_id = Some(id);
      }

      eprintln!(
        "[dev_remote] Developer mode enabled via {:?}",
        guard.source_channel
      );

      HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": "Developer mode enabled",
          "state": *guard,
      }))
    }

    "disable" => {
      guard.enabled = false;
      guard.version += 1;
      guard.updated_at = now_secs();

      HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": "Developer mode disabled",
          "state": *guard,
      }))
    }

    "set_project" => {
      let name = cmd.name.unwrap_or_else(|| "Untitled Project".to_string());
      let description = cmd.description.unwrap_or_default();

      // Find existing project by name or create new
      let existing = guard.projects.iter_mut().find(|p| p.name == name);
      let project_id = if let Some(proj) = existing {
        if !description.is_empty() {
          proj.description = description;
        }
        if let Some(url) = cmd.github_url {
          proj.github_url = url;
        }
        if let Some(url) = cmd.dev_url {
          proj.dev_url = url;
        }
        proj.id.clone()
      } else {
        let id = format!("remote-{}", now_secs());
        let project = DevProject {
          id: id.clone(),
          name,
          description,
          github_url: cmd.github_url.unwrap_or_default(),
          dev_url: cmd
            .dev_url
            .unwrap_or_else(|| "http://localhost:3000".to_string()),
        };
        guard.projects.push(project);
        id
      };

      guard.active_project_id = Some(project_id);
      guard.version += 1;
      guard.updated_at = now_secs();

      // Auto-enable dev mode when setting projects
      if !guard.enabled {
        guard.enabled = true;
      }

      HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": "Project updated",
          "state": *guard,
      }))
    }

    "status" => HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "state": *guard,
    })),

    other => HttpResponse::BadRequest().json(serde_json::json!({
        "ok": false,
        "message": format!("Unknown action: {}", other),
    })),
  }
}

/// POST /api/knapsack/dev/notify - send a developer mode update to the source channel
///
/// Called internally when agent team status changes, QA completes, etc.
/// Sends a message back to whichever channel originally initiated dev mode.
#[post("/api/knapsack/dev/notify")]
pub async fn notify_channel(
  body: web::Json<NotifyRequest>,
  state: web::Data<SharedDevModeState>,
) -> impl Responder {
  let guard = state.lock().await;

  let channel = match &guard.source_channel {
    Some(ch) if ch != "webchat" => ch.clone(),
    _ => {
      return HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": "No external channel to notify (source is webchat)",
          "sent": false,
      }));
    }
  };

  let to = match &guard.notify_to {
    Some(to) => to.clone(),
    None => {
      return HttpResponse::Ok().json(serde_json::json!({
          "ok": false,
          "message": "No recipient address configured",
          "sent": false,
      }));
    }
  };

  drop(guard); // release lock before making outbound call

  let message = body.message.clone();

  // Use the existing channel send infrastructure
  let idempotency_key = format!("dev-notify-{}-{}", now_secs(), rand::random::<u32>());
  let params = serde_json::json!({
      "to": to,
      "message": message,
      "channel": channel,
      "idempotencyKey": idempotency_key,
  });

  match crate::clawd::gateway_client::call_channel_method("send", Some(params), None).await {
    Ok(_) => HttpResponse::Ok().json(serde_json::json!({
        "ok": true,
        "message": format!("Notification sent via {}", channel),
        "sent": true,
    })),
    Err(e) => {
      eprintln!("[dev_remote] Failed to send notification: {}", e);
      HttpResponse::Ok().json(serde_json::json!({
          "ok": true,
          "message": format!("Failed to send notification: {}", e),
          "sent": false,
      }))
    }
  }
}

#[derive(Debug, Deserialize)]
pub struct NotifyRequest {
  pub message: String,
}

fn now_secs() -> u64 {
  std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap_or_default()
    .as_secs()
}
