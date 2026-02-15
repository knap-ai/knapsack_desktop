//! WebSocket client for communicating with the Clawdbot Gateway
//!
//! The gateway uses a WebSocket-based JSON-RPC protocol. This module provides
//! a simple interface for making requests to the gateway.

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::atomic::{AtomicU64, Ordering};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 3;
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
  let Some(token) = token else { return; };
  let _ = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, token).await;
}

/// Make a single request to the gateway and return the result
pub async fn gateway_request(method: &str, params: Option<Value>, token: Option<&str>) -> Result<Value, String> {
  // Best-effort: ensure gateway is up before connecting.
  ensure_gateway_best_effort(token).await;

  // Connect to WebSocket
  let (ws_stream, _) = connect_async(GATEWAY_WS_URL)
    .await
    .map_err(|e| format!("Failed to connect to gateway: {}", e))?;

  let (mut write, mut read) = ws_stream.split();

  // Wait for connect.challenge event
  let challenge_msg = tokio::time::timeout(std::time::Duration::from_secs(10), read.next())
    .await
    .map_err(|_| "Timeout waiting for challenge")?
    .ok_or("Connection closed before challenge")?
    .map_err(|e| format!("Error receiving challenge: {}", e))?;

  let challenge_text = match challenge_msg {
    Message::Text(t) => t,
    _ => return Err("Expected text message for challenge".to_string()),
  };

  let event: EventFrame =
    serde_json::from_str(&challenge_text).map_err(|e| format!("Failed to parse challenge event: {}", e))?;

  if event.event != "connect.challenge" {
    return Err(format!("Expected connect.challenge, got {}", event.event));
  }

  // Send connect request
  let connect_params = ConnectParams {
    min_protocol: PROTOCOL_VERSION,
    max_protocol: PROTOCOL_VERSION,
    client: ClientInfo {
      id: "knapsack-desktop",
      display_name: "Knapsack Desktop",
      version: env!("CARGO_PKG_VERSION"),
      platform: "desktop",
      mode: "app",
    },
    auth: token.map(|t| AuthInfo { token: t.to_string() }),
    role: "client",
    scopes: vec!["*"],
  };

  let connect_frame = RequestFrame {
    frame_type: "request",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(connect_params).unwrap()),
  };

  write
    .send(Message::Text(serde_json::to_string(&connect_frame).unwrap()))
    .await
    .map_err(|e| format!("Failed to send connect: {}", e))?;

  // Wait for connect response
  let connect_resp_msg = tokio::time::timeout(std::time::Duration::from_secs(10), read.next())
    .await
    .map_err(|_| "Timeout waiting for connect response")?
    .ok_or("Connection closed before connect response")?
    .map_err(|e| format!("Error receiving connect response: {}", e))?;

  let connect_resp_text = match connect_resp_msg {
    Message::Text(t) => t,
    _ => return Err("Expected text message for connect response".to_string()),
  };

  let connect_resp: ResponseFrame =
    serde_json::from_str(&connect_resp_text).map_err(|e| format!("Failed to parse connect response: {}", e))?;

  if !connect_resp.ok {
    return Err(format!("Connect failed: {:?}", connect_resp.error.unwrap_or(Value::Null)));
  }

  // Send actual request
  let request_frame = RequestFrame {
    frame_type: "request",
    method: method.to_string(),
    id: next_request_id(),
    params,
  };

  write
    .send(Message::Text(serde_json::to_string(&request_frame).unwrap()))
    .await
    .map_err(|e| format!("Failed to send request: {}", e))?;

  // Wait for response
  let resp_msg = tokio::time::timeout(std::time::Duration::from_secs(30), read.next())
    .await
    .map_err(|_| "Timeout waiting for response")?
    .ok_or("Connection closed before response")?
    .map_err(|e| format!("Error receiving response: {}", e))?;

  let resp_text = match resp_msg {
    Message::Text(t) => t,
    _ => return Err("Expected text message for response".to_string()),
  };

  let resp: ResponseFrame = serde_json::from_str(&resp_text).map_err(|e| format!("Failed to parse response: {}", e))?;

  if resp.ok {
    Ok(resp.result.or(resp.data).unwrap_or(Value::Null))
  } else {
    Err(format!("Request failed: {:?}", resp.error.unwrap_or(Value::Null)))
  }
}
