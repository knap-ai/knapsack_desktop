//! Persistent WebSocket client for communicating with the Clawdbot Gateway.
//!
//! Why this exists:
//! - The previous implementation opened a brand new WebSocket connection per request.
//! - Under bursty workloads (e.g., WhatsApp/iMessage gateways), that can create
//!   reconnect storms, TIME_WAIT buildup, and general port sadness.
//!
//! This module provides a single shared connection with a bounded request queue.

use futures_util::{SinkExt, StreamExt};
use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::sync::{Mutex, oneshot};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 3;
const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

static REQUEST_ID: AtomicU64 = AtomicU64::new(1);
fn next_request_id() -> String {
  REQUEST_ID.fetch_add(1, Ordering::SeqCst).to_string()
}

#[derive(Serialize)]
struct RequestFrame {
  #[serde(rename = "type")]
  frame_type: &'static str,
  method: String,
  id: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  params: Option<Value>,
}

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

#[derive(Deserialize, Debug)]
struct EventFrame {
  #[serde(rename = "type")]
  frame_type: String,
  event: String,
  #[serde(default)]
  payload: Option<Value>,
}

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

struct Pending {
  tx: oneshot::Sender<Result<Value, String>>,
}

struct GatewayClient {
  write: Mutex<
    futures_util::stream::SplitSink<
      tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
      Message,
    >,
  >,
  pending: Mutex<HashMap<String, Pending>>,
}

static CLIENT: OnceCell<Arc<GatewayClient>> = OnceCell::new();

async fn ensure_gateway_best_effort(token: &str) {
  let _ = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, token).await;
}

async fn connect_and_handshake(token: &str) -> Result<Arc<GatewayClient>, String> {
  ensure_gateway_best_effort(token).await;

  let (ws_stream, _) = connect_async(GATEWAY_WS_URL)
    .await
    .map_err(|e| format!("Failed to connect to gateway: {}", e))?;

  let (mut write, mut read) = ws_stream.split();

  // Wait for connect.challenge
  let challenge_msg = tokio::time::timeout(std::time::Duration::from_secs(10), read.next())
    .await
    .map_err(|_| "Timeout waiting for challenge")?
    .ok_or("Connection closed before challenge")?
    .map_err(|e| format!("Error receiving challenge: {}", e))?;

  let challenge_text = match challenge_msg {
    Message::Text(t) => t,
    _ => return Err("Expected text message for challenge".to_string()),
  };

  let event: EventFrame = serde_json::from_str(&challenge_text)
    .map_err(|e| format!("Failed to parse challenge event: {}", e))?;
  if event.event != "connect.challenge" {
    return Err(format!("Expected connect.challenge, got {}", event.event));
  }

  // Send connect
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
    auth: Some(AuthInfo {
      token: token.to_string(),
    }),
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

  let connect_resp: ResponseFrame = serde_json::from_str(&connect_resp_text)
    .map_err(|e| format!("Failed to parse connect response: {}", e))?;

  if !connect_resp.ok {
    return Err(format!(
      "Connect failed: {:?}",
      connect_resp.error.unwrap_or(Value::Null)
    ));
  }

  let client = Arc::new(GatewayClient {
    write: Mutex::new(write),
    pending: Mutex::new(HashMap::new()),
  });

  // Spawn read loop
  let client_clone = client.clone();
  tokio::spawn(async move {
    while let Some(msg) = read.next().await {
      let Ok(msg) = msg else { continue };
      let Message::Text(text) = msg else { continue };

      if let Ok(resp) = serde_json::from_str::<ResponseFrame>(&text) {
        let mut pending = client_clone.pending.lock().await;
        if let Some(p) = pending.remove(&resp.id) {
          let out = if resp.ok {
            Ok(resp.result.or(resp.data).unwrap_or(Value::Null))
          } else {
            Err(format!("Request failed: {:?}", resp.error.unwrap_or(Value::Null)))
          };
          let _ = p.tx.send(out);
        }
      }
    }

    // Connection ended: fail all pending.
    let mut pending = client_clone.pending.lock().await;
    for (_, p) in pending.drain() {
      let _ = p.tx.send(Err("Gateway connection closed".to_string()));
    }
  });

  Ok(client)
}

async fn get_or_connect(token: &str) -> Result<Arc<GatewayClient>, String> {
  if let Some(c) = CLIENT.get() {
    return Ok(c.clone());
  }

  let client = connect_and_handshake(token).await?;
  let _ = CLIENT.set(client.clone());
  Ok(client)
}

/// Make a request using a persistent gateway connection.
pub async fn gateway_request_pooled(method: &str, params: Option<Value>, token: &str) -> Result<Value, String> {
  let client = get_or_connect(token).await?;

  let id = next_request_id();
  let frame = RequestFrame {
    frame_type: "request",
    method: method.to_string(),
    id: id.clone(),
    params,
  };

  let (tx, rx) = oneshot::channel();
  {
    let mut pending = client.pending.lock().await;
    pending.insert(id.clone(), Pending { tx });
  }

  {
    let mut write = client.write.lock().await;
    write
      .send(Message::Text(serde_json::to_string(&frame).unwrap()))
      .await
      .map_err(|e| format!("Failed to send request: {}", e))?;
  }

  tokio::time::timeout(std::time::Duration::from_secs(30), rx)
    .await
    .map_err(|_| "Timeout waiting for response")?
    .map_err(|_| "Gateway response channel closed".to_string())?
}
