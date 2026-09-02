//! Authenticated loopback HTTP MCP bridge for OpenClaw 2026.8.2's
//! requester-scoped connection resolver API.
//!
//! The plugin supplies identity headers from trusted turn context and the
//! existing desktop API token. This endpoint independently verifies Slack
//! requesters against the configured bot account before delegating to Studio
//! or Snowflake. It never accepts an email address from the model or headers.

use actix_web::{post, web, HttpRequest, HttpResponse, Responder};
use serde_json::Value;
use sha2::{Digest, Sha256};

use super::{service, session_watcher, snowflake_mcp, studio_mcp};

const REQUESTER_SENDER_HEADER: &str = "x-knapsack-requester-sender-id";
const REQUESTER_ACCOUNT_HEADER: &str = "x-knapsack-requester-account-id";
const REQUESTER_CHANNEL_HEADER: &str = "x-knapsack-requester-channel";
const MAX_REQUESTER_HEADER_LENGTH: usize = 512;

#[derive(Debug, Clone, PartialEq, Eq)]
struct RequesterContext {
  channel: String,
  account_id: String,
  sender_id: String,
}

fn request_header(request: &HttpRequest, name: &str) -> Result<Option<String>, String> {
  let Some(value) = request.headers().get(name) else {
    return Ok(None);
  };
  let value = value
    .to_str()
    .map_err(|_| format!("Invalid {name} header"))?
    .trim();
  if value.is_empty() {
    return Ok(None);
  }
  if value.len() > MAX_REQUESTER_HEADER_LENGTH
    || !value
      .chars()
      .all(|character| character == '\t' || (' '..='~').contains(&character))
  {
    return Err(format!("Invalid {name} header"));
  }
  Ok(Some(value.to_string()))
}

fn requester_context(request: &HttpRequest) -> Result<RequesterContext, String> {
  let sender_id = request_header(request, REQUESTER_SENDER_HEADER)?
    .ok_or_else(|| "Missing trusted requester sender id".to_string())?;
  let channel = request_header(request, REQUESTER_CHANNEL_HEADER)?
    .unwrap_or_default()
    .to_ascii_lowercase();
  let account_id =
    request_header(request, REQUESTER_ACCOUNT_HEADER)?.unwrap_or_else(|| "default".to_string());
  Ok(RequesterContext {
    channel,
    account_id,
    sender_id,
  })
}

fn audit_session_id(context: &RequesterContext) -> String {
  let mut digest = Sha256::new();
  digest.update(context.channel.as_bytes());
  digest.update([0]);
  digest.update(context.account_id.as_bytes());
  digest.update([0]);
  digest.update(context.sender_id.as_bytes());
  format!("requester-{}", &format!("{:x}", digest.finalize())[..24])
}

async fn verified_requester_email(
  app_handle: &tauri::AppHandle,
  context: &RequesterContext,
) -> Result<String, String> {
  match context.channel.as_str() {
    "slack" => {
      session_watcher::resolve_verified_slack_requester(
        &service::app_clawdbot_home(app_handle),
        &context.account_id,
        &context.sender_id,
      )
      .await
    }
    // OpenClaw derives this value from the authenticated gateway client, not
    // from model arguments. Keep the allowlist exact; unknown web clients fail
    // closed. The isolated 8.2 QA fixture must prove which value is emitted
    // before this draft is eligible to merge.
    "webchat" | "knapsack"
      if matches!(
        context.sender_id.as_str(),
        "gateway-client" | "openclaw-control-ui" | "knapsack-desktop"
      ) =>
    {
      studio_mcp::connected_studio_owner()
    }
    "webchat" | "knapsack" => Err("Unrecognized first-party desktop requester".to_string()),
    "" => Err("Missing trusted requester channel".to_string()),
    other => Err(format!(
      "Requester-scoped Knapsack MCP is not enabled for channel {other}"
    )),
  }
}

#[post("/api/clawd/requester-mcp/{server}")]
pub async fn requester_mcp(
  app_handle: web::Data<tauri::AppHandle>,
  request: HttpRequest,
  server: web::Path<String>,
  body: web::Json<Value>,
) -> impl Responder {
  let server = server.into_inner();
  if !matches!(server.as_str(), "studio" | "snowflake") {
    return HttpResponse::NotFound().json(serde_json::json!({
      "jsonrpc": "2.0",
      "id": body.get("id").cloned().unwrap_or(Value::Null),
      "error": { "code": -32601, "message": "Unknown Knapsack MCP server" }
    }));
  }
  let context = match requester_context(&request) {
    Ok(context) => context,
    Err(error) => {
      return HttpResponse::Unauthorized().json(serde_json::json!({
        "jsonrpc": "2.0",
        "id": body.get("id").cloned().unwrap_or(Value::Null),
        "error": { "code": -32001, "message": error }
      }))
    }
  };
  let email = match verified_requester_email(app_handle.get_ref(), &context).await {
    Ok(email) => email,
    Err(error) => {
      return HttpResponse::Forbidden().json(serde_json::json!({
        "jsonrpc": "2.0",
        "id": body.get("id").cloned().unwrap_or(Value::Null),
        "error": { "code": -32002, "message": error }
      }))
    }
  };
  let session_id = audit_session_id(&context);
  let body = body.into_inner();
  let response = match server.as_str() {
    "studio" => studio_mcp::handle_request_for_verified_sender(body, &email).await,
    "snowflake" => {
      snowflake_mcp::handle_request_for_verified_sender(body, &email, &session_id).await
    }
    _ => unreachable!("server was validated above"),
  };
  match response {
    Some(response) => HttpResponse::Ok().json(response),
    None => HttpResponse::NoContent().finish(),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use actix_web::test as actix_test;

  #[test]
  fn audit_ids_are_stable_and_do_not_expose_native_identity() {
    let context = RequesterContext {
      channel: "slack".to_string(),
      account_id: "bankaya".to_string(),
      sender_id: "U0123456789".to_string(),
    };
    let first = audit_session_id(&context);
    assert_eq!(first, audit_session_id(&context));
    assert!(first.starts_with("requester-"));
    assert!(!first.contains("U0123456789"));

    let other_account = RequesterContext {
      account_id: "other-workspace".to_string(),
      ..context.clone()
    };
    let other_sender = RequesterContext {
      sender_id: "U9876543210".to_string(),
      ..context
    };
    assert_ne!(first, audit_session_id(&other_account));
    assert_ne!(first, audit_session_id(&other_sender));
  }

  #[actix_web::test]
  async fn requester_headers_are_required_and_bounded() {
    let request = actix_test::TestRequest::default().to_http_request();
    assert!(requester_context(&request).unwrap_err().contains("sender"));

    let request = actix_test::TestRequest::default()
      .insert_header((REQUESTER_SENDER_HEADER, "U0123456789"))
      .insert_header((REQUESTER_CHANNEL_HEADER, "slack"))
      .insert_header((REQUESTER_ACCOUNT_HEADER, "bankaya"))
      .to_http_request();
    assert_eq!(
      requester_context(&request).unwrap(),
      RequesterContext {
        channel: "slack".to_string(),
        account_id: "bankaya".to_string(),
        sender_id: "U0123456789".to_string(),
      }
    );
  }
}
