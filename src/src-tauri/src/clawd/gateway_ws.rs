//! WebSocket client for communicating with the Clawdbot Gateway
//!
//! The gateway uses a WebSocket-based JSON-RPC protocol. This module provides
//! a simple interface for making requests to the gateway.

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 4;
const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

static REQUEST_ID: AtomicU64 = AtomicU64::new(1);

fn next_request_id() -> String {
  REQUEST_ID.fetch_add(1, Ordering::SeqCst).to_string()
}

/// Request frame sent to the gateway
#[derive(Serialize)]
struct RequestFrame {
  #[serde(rename = "type")]
  frame_type: &'static str,
  method: String,
  id: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  params: Option<Value>,
}

/// Deserialize id field that may be a string or number
fn deserialize_string_or_number<'de, D>(deserializer: D) -> Result<String, D::Error>
where
  D: serde::Deserializer<'de>,
{
  let v = Value::deserialize(deserializer)?;
  match v {
    Value::String(s) => Ok(s),
    Value::Number(n) => Ok(n.to_string()),
    _ => Ok(v.to_string()),
  }
}

/// Response frame received from the gateway
#[derive(Deserialize, Debug)]
struct ResponseFrame {
  #[serde(rename = "type", default)]
  frame_type: Option<String>,
  #[serde(deserialize_with = "deserialize_string_or_number")]
  id: String,
  #[serde(default)]
  ok: bool,
  #[serde(default)]
  result: Option<Value>,
  #[serde(default)]
  data: Option<Value>,
  #[serde(default)]
  payload: Option<Value>,
  #[serde(default)]
  error: Option<Value>,
}

/// Event frame received from the gateway (like connect.challenge)
#[derive(Deserialize, Debug)]
struct EventFrame {
  #[serde(rename = "type")]
  frame_type: String,
  event: String,
  #[serde(default)]
  payload: Option<Value>,
}

/// Connect parameters sent during handshake
#[derive(Serialize)]
struct ConnectParams {
  #[serde(rename = "minProtocol")]
  min_protocol: u32,
  #[serde(rename = "maxProtocol")]
  max_protocol: u32,
  client: ClientInfo,
  auth: Option<AuthInfo>,
  role: &'static str,
  scopes: Vec<&'static str>,
}

#[derive(Serialize)]
struct ClientInfo {
  id: &'static str,
  #[serde(rename = "displayName")]
  display_name: &'static str,
  version: &'static str,
  platform: &'static str,
  mode: &'static str,
}

#[derive(Serialize)]
struct AuthInfo {
  token: String,
}

async fn ensure_gateway_best_effort(token: Option<&str>) {
  let Some(token) = token else {
    return;
  };
  let _ = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, token).await;
}

fn read_token_from_json(path: &Path) -> Option<String> {
  let content = std::fs::read_to_string(path).ok()?;
  let config = serde_json::from_str::<serde_json::Value>(&content).ok()?;

  config
    .get("gateway_token")
    .and_then(|v| v.as_str())
    .or_else(|| {
      config
        .get("gateway")
        .and_then(|g| g.get("auth"))
        .and_then(|a| a.get("token"))
        .and_then(|t| t.as_str())
    })
    .map(str::trim)
    .filter(|token| !token.is_empty())
    .map(ToString::to_string)
}

fn gateway_token_candidates() -> Vec<PathBuf> {
  let mut candidates = Vec::new();

  for var in ["OPENCLAW_HOME", "OPENCLAW_STATE_DIR"] {
    if let Ok(dir) = std::env::var(var) {
      let dir = dir.trim();
      if !dir.is_empty() {
        let base = PathBuf::from(dir);
        candidates.push(base.join("tokens.json"));
        candidates.push(base.join("openclaw.json"));
        candidates.push(base.join("clawdbot.json"));
      }
    }
  }

  let home = std::env::var("HOME")
    .or_else(|_| std::env::var("USERPROFILE"))
    .unwrap_or_else(|_| ".".to_string());
  candidates.push(PathBuf::from(&home).join(".openclaw").join("openclaw.json"));
  candidates.push(PathBuf::from(&home).join(".clawdbot").join("clawdbot.json"));

  candidates
}

fn should_retry_gateway_auth(error: &str) -> bool {
  let lower = error.to_lowercase();
  lower.contains("token mismatch")
    || lower.contains("unauthorized")
    || lower.contains("rate_limited")
    || lower.contains("closed before connect")
    || lower.contains("connection closed during connect")
    || lower.contains("connection closed before connect response")
}

async fn gateway_request_once(
  method: &str,
  params: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  // Best-effort: ensure gateway is up before connecting.
  ensure_gateway_best_effort(token).await;

  // Connect to WebSocket
  let (ws_stream, _) = connect_async(GATEWAY_WS_URL)
    .await
    .map_err(|e| format!("Failed to connect to gateway: {}", e))?;

  let (mut write, mut read) = ws_stream.split();

  // Wait for connect.challenge event (skip ping/pong control frames)
  let challenge_text = loop {
    let challenge_msg = tokio::time::timeout(std::time::Duration::from_secs(5), read.next())
      .await
      .map_err(|_| "Timeout waiting for challenge")?
      .ok_or("Connection closed before challenge")?
      .map_err(|e| format!("Error receiving challenge: {}", e))?;

    match challenge_msg {
      Message::Text(t) => break t,
      Message::Close(_) => return Err("Connection closed during challenge".to_string()),
      _ => continue, // Skip ping/pong control frames
    }
  };

  let challenge: EventFrame =
    serde_json::from_str(&challenge_text).map_err(|e| format!("Invalid challenge: {}", e))?;

  if challenge.event != "connect.challenge" {
    return Err(format!(
      "Expected connect.challenge, got {}",
      challenge.event
    ));
  }

  // Send connect request
  let connect_id = next_request_id();
  let connect_params = ConnectParams {
    min_protocol: PROTOCOL_VERSION,
    max_protocol: PROTOCOL_VERSION,
    client: ClientInfo {
      id: "gateway-client", // Must match GATEWAY_CLIENT_IDS in clawdbot protocol
      display_name: "Knapsack",
      version: "0.9.23",
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: token.map(|t| AuthInfo {
      token: t.to_string(),
    }),
    role: "operator",
    scopes: vec!["operator.admin", "operator.read", "operator.write"],
  };
  let connect_params_value = serde_json::to_value(connect_params)
    .map_err(|e| format!("Failed to serialize connect params: {}", e))?;
  let connect_req = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: connect_id.clone(),
    params: Some(connect_params_value),
  };

  let connect_json =
    serde_json::to_string(&connect_req).map_err(|e| format!("Failed to serialize: {}", e))?;
  write
    .send(Message::Text(connect_json))
    .await
    .map_err(|e| format!("Failed to send connect: {}", e))?;

  // Wait for connect response (skip ping/pong control frames)
  let connect_text = loop {
    let connect_resp = tokio::time::timeout(std::time::Duration::from_secs(5), read.next())
      .await
      .map_err(|_| "Timeout waiting for connect response")?
      .ok_or("Connection closed before connect response")?
      .map_err(|e| format!("Error receiving connect response: {}", e))?;

    match connect_resp {
      Message::Text(t) => break t,
      Message::Close(_) => return Err("Connection closed during connect".to_string()),
      _ => continue, // Skip ping/pong control frames
    }
  };

  let connect_res: ResponseFrame =
    serde_json::from_str(&connect_text).map_err(|e| format!("Invalid connect response: {}", e))?;

  if !connect_res.ok {
    return Err(format!(
      "Connect failed: {:?}",
      connect_res.error.unwrap_or(Value::Null)
    ));
  }

  // Now send the actual request
  let req_id = next_request_id();
  let request = RequestFrame {
    frame_type: "req",
    method: method.to_string(),
    id: req_id.clone(),
    params,
  };

  let request_json =
    serde_json::to_string(&request).map_err(|e| format!("Failed to serialize request: {}", e))?;
  write
    .send(Message::Text(request_json))
    .await
    .map_err(|e| format!("Failed to send request: {}", e))?;

  // Wait for response (may receive events in between, skip them)
  loop {
    let msg = tokio::time::timeout(std::time::Duration::from_secs(10), read.next())
      .await
      .map_err(|_| "Timeout waiting for response")?
      .ok_or("Connection closed before response")?
      .map_err(|e| format!("Error receiving response: {}", e))?;

    let text = match msg {
      Message::Text(t) => t,
      Message::Close(_) => return Err("Connection closed".to_string()),
      _ => continue, // Skip ping/pong etc
    };

    // Try to parse as response
    if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&text) {
      if resp.id == req_id {
        if resp.ok {
          // Gateway may use "result", "data", or "payload" for the response body
          let result = resp
            .result
            .or(resp.data)
            .or(resp.payload)
            .unwrap_or(Value::Null);
          return Ok(result);
        } else {
          return Err(format!(
            "Request failed: {:?}",
            resp.error.unwrap_or(Value::Null)
          ));
        }
      }
    } else {
      // Fallback: try parsing as generic JSON to extract result
      if let Ok(val) = serde_json::from_str::<Value>(&text) {
        if let Some(id) = val.get("id").and_then(|v| v.as_str()) {
          if id == req_id {
            // Try to extract result from any field
            let result = val
              .get("result")
              .or_else(|| val.get("data"))
              .or_else(|| val.get("payload"))
              .cloned()
              .unwrap_or(Value::Null);
            let ok = val.get("ok").and_then(|v| v.as_bool()).unwrap_or(false);
            if ok || !result.is_null() {
              return Ok(result);
            }
            let error = val.get("error").cloned().unwrap_or(Value::Null);
            return Err(format!("Request failed: {:?}", error));
          }
        }
      }
      let preview: String = text.chars().take(300).collect();
      eprintln!("[gateway_ws] unmatched frame for {}: {}", method, preview);
    }
    // Otherwise it might be an event, skip it
  }
}

/// Make a single request to the gateway and return the result.
///
/// If the auth token drifted out of sync, retry once with the canonical token
/// from app state before escalating to the gateway self-heal path.
pub async fn gateway_request(
  method: &str,
  params: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let mut current_token = token.map(ToString::to_string);
  let mut self_heal_attempted = false;

  loop {
    match gateway_request_once(method, params.clone(), current_token.as_deref()).await {
      Ok(result) => return Ok(result),
      Err(error) => {
        if !should_retry_gateway_auth(&error) {
          return Err(error);
        }

        if let Some(recovered_token) = get_gateway_token() {
          let needs_token_retry = current_token
            .as_deref()
            .map(|token| token != recovered_token)
            .unwrap_or(true);
          if needs_token_retry {
            eprintln!(
              "[gateway_ws] auth/connect failed for {} — retrying with canonical app token",
              method
            );
            current_token = Some(recovered_token);
            continue;
          }
        }

        if !self_heal_attempted && crate::clawd::gateway_client::is_gateway_port_open().await {
          if let Some(token) = current_token.as_deref() {
            eprintln!(
              "[gateway_ws] auth/connect failed for {} with gateway still listening — triggering self-heal",
              method
            );
            self_heal_attempted = true;
            crate::clawd::service::self_heal_gateway_conflict(token).await;
            continue;
          }
        }

        return Err(error);
      }
    }
  }
}

/// Get the gateway token from environment or config file
fn get_gateway_token() -> Option<String> {
  if let Ok(token) = std::env::var("OPENCLAW_GATEWAY_TOKEN") {
    let t = token.trim().to_string();
    if !t.is_empty() {
      return Some(t);
    }
  }

  for path in gateway_token_candidates() {
    if let Some(token) = read_token_from_json(&path) {
      return Some(token);
    }
  }

  None
}

/// Get channel status from the gateway
pub async fn get_channel_status(token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  gateway_request("status", None, token).await
}

/// Call a channel method on the gateway
pub async fn call_channel_method(
  method: &str,
  params: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  gateway_request(method, params, token).await
}

/// Get current config from gateway
pub async fn config_get(token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  gateway_request("config.get", None, token).await
}

/// Patch config on gateway - requires baseHash from config.get
pub async fn config_patch(
  raw_patch: &str,
  base_hash: &str,
  token: Option<&str>,
) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  let params = serde_json::json!({
      "raw": raw_patch,
      "baseHash": base_hash
  });
  gateway_request("config.patch", Some(params), token).await
}

// --- Cron/Scheduling API ---

/// List all scheduled jobs
pub async fn cron_list(token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  gateway_request("cron.list", None, token).await
}

/// Add a new scheduled job
/// schedule can be: { kind: "at", atMs: number } | { kind: "every", everyMs: number, anchorMs?: number } | { kind: "cron", expr: string, tz?: string }
/// payload: { kind: "systemEvent" | "agentTurn", text: string }
pub async fn cron_add(
  name: &str,
  schedule: Value,
  payload: Value,
  token: Option<&str>,
) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  let params = serde_json::json!({
      "name": name,
      "schedule": schedule,
      "payload": payload,
      "enabled": true
  });
  gateway_request("cron.add", Some(params), token).await
}

/// Remove a scheduled job by ID
pub async fn cron_remove(job_id: &str, token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  let params = serde_json::json!({ "id": job_id });
  gateway_request("cron.remove", Some(params), token).await
}

/// Run a job immediately
pub async fn cron_run(job_id: &str, token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  let params = serde_json::json!({ "id": job_id });
  gateway_request("cron.run", Some(params), token).await
}

/// Update a scheduled job
pub async fn cron_update(job_id: &str, patch: Value, token: Option<&str>) -> Result<Value, String> {
  let env_token = get_gateway_token();
  let token = token.or(env_token.as_deref());
  let params = serde_json::json!({
      "id": job_id,
      "patch": patch
  });
  gateway_request("cron.update", Some(params), token).await
}

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  #[ignore] // Requires running gateway
  async fn test_get_status() {
    let result = get_channel_status(None).await;
    println!("Status result: {:?}", result);
    assert!(result.is_ok());
  }
}
