//! Persistent WebSocket client for communicating with the Clawdbot Gateway.
//!
//! Why this exists:
//! - The previous implementation opened a brand new WebSocket connection per request.
//! - Under bursty workloads (e.g., WhatsApp/iMessage gateways), that can create
//!   reconnect storms, TIME_WAIT buildup, and general port sadness.
//!
//! This module provides a single shared connection with:
//! - bounded in-flight requests (backpressure)
//! - a simple circuit breaker (avoid thrash when gateway is down)

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, Semaphore, oneshot};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::clawd::gateway_supervisor;

const GATEWAY_WS_URL: &str = "ws://127.0.0.1:18789";
const PROTOCOL_VERSION: u32 = 3;
const LAUNCH_AGENT_LABEL: &str = "ai.knap.knapsack.clawdbot";

// Backpressure: cap concurrent in-flight requests.
const MAX_IN_FLIGHT: usize = 64;

// Circuit breaker: trip after N consecutive failures, cool down for a bit.
const BREAKER_TRIP_AFTER: u32 = 5;
const BREAKER_COOLDOWN: Duration = Duration::from_secs(20);

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
  payload: Option<Value>,
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

#[derive(Default)]
struct CircuitBreaker {
  consecutive_failures: u32,
  open_until: Option<Instant>,
}

impl CircuitBreaker {
  fn allow(&self) -> bool {
    match self.open_until {
      None => true,
      Some(t) => Instant::now() >= t,
    }
  }

  fn on_success(&mut self) {
    self.consecutive_failures = 0;
    self.open_until = None;
  }

  fn on_failure(&mut self) {
    self.consecutive_failures = self.consecutive_failures.saturating_add(1);
    if self.consecutive_failures >= BREAKER_TRIP_AFTER {
      self.open_until = Some(Instant::now() + BREAKER_COOLDOWN);
    }
  }

  fn state_string(&self) -> String {
    if let Some(t) = self.open_until {
      if Instant::now() < t {
        return format!("open until {:?}", t);
      }
    }
    format!("closed (failures={})", self.consecutive_failures)
  }
}

struct GatewayClient {
  write: Mutex<
    futures_util::stream::SplitSink<
      tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>,
      Message,
    >,
  >,
  pending: Mutex<HashMap<String, Pending>>,
  in_flight: Semaphore,
  breaker: Mutex<CircuitBreaker>,
}

/// Holds the current gateway connection.  Uses a std RwLock (never held
/// across await points) so the connection can be replaced when the
/// underlying WebSocket drops, enabling transparent reconnection.
static CLIENT: once_cell::sync::Lazy<std::sync::RwLock<Option<Arc<GatewayClient>>>> =
  once_cell::sync::Lazy::new(|| std::sync::RwLock::new(None));

async fn ensure_gateway_best_effort(token: &str) {
  let _ = gateway_supervisor::ensure_gateway_running(LAUNCH_AGENT_LABEL, token).await;
}

async fn connect_and_handshake(token: &str) -> Result<Arc<GatewayClient>, String> {
  ensure_gateway_best_effort(token).await;

  let (ws_stream, _) = connect_async(GATEWAY_WS_URL)
    .await
    .map_err(|e| format!("Failed to connect to gateway: {}", e))?;

  let (mut write, mut read) = ws_stream.split();

  // Wait for connect.challenge (skip ping/pong control frames)
  let challenge_text = loop {
    let challenge_msg = tokio::time::timeout(Duration::from_secs(10), read.next())
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
      id: "gateway-client",
      display_name: "Knapsack Desktop",
      version: env!("CARGO_PKG_VERSION"),
      platform: std::env::consts::OS,
      mode: "backend",
    },
    auth: Some(AuthInfo {
      token: token.to_string(),
    }),
    role: "operator",
    scopes: vec!["operator.admin"],
  };

  let connect_frame = RequestFrame {
    frame_type: "req",
    method: "connect".to_string(),
    id: next_request_id(),
    params: Some(serde_json::to_value(connect_params).unwrap()),
  };

  write
    .send(Message::Text(serde_json::to_string(&connect_frame).unwrap()))
    .await
    .map_err(|e| format!("Failed to send connect: {}", e))?;

  // Wait for connect response (skip ping/pong control frames)
  let connect_resp_text = loop {
    let connect_resp_msg = tokio::time::timeout(Duration::from_secs(10), read.next())
      .await
      .map_err(|_| "Timeout waiting for connect response")?
      .ok_or("Connection closed before connect response")?
      .map_err(|e| format!("Error receiving connect response: {}", e))?;

    match connect_resp_msg {
      Message::Text(t) => break t,
      Message::Close(_) => return Err("Connection closed during connect".to_string()),
      _ => continue, // Skip ping/pong control frames
    }
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
    in_flight: Semaphore::new(MAX_IN_FLIGHT),
    breaker: Mutex::new(CircuitBreaker::default()),
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
            Ok(resp.result.or(resp.data).or(resp.payload).unwrap_or(Value::Null))
          } else {
            Err(format!("Request failed: {:?}", resp.error.unwrap_or(Value::Null)))
          };
          let _ = p.tx.send(out);
        }
      }
    }

    // Connection ended: fail all pending and invalidate so we reconnect.
    let mut pending = client_clone.pending.lock().await;
    for (_, p) in pending.drain() {
      let _ = p.tx.send(Err("Gateway connection closed".to_string()));
    }
    drop(pending);
    invalidate_client();
  });

  Ok(client)
}

async fn get_or_connect(token: &str) -> Result<Arc<GatewayClient>, String> {
  // Fast path: return existing connection.
  {
    let guard = CLIENT.read().unwrap();
    if let Some(ref c) = *guard {
      return Ok(c.clone());
    }
  }

  // Slow path: establish a new connection.
  let client = connect_and_handshake(token).await?;
  {
    let mut guard = CLIENT.write().unwrap();
    *guard = Some(client.clone());
  }
  Ok(client)
}

/// Invalidate the current connection so the next request reconnects.
fn invalidate_client() {
  let mut guard = CLIENT.write().unwrap();
  *guard = None;
}

/// Public wrapper: drop the cached connection.
///
/// Call this when the gateway is known to have restarted (e.g. after a
/// config.patch that triggers SIGUSR1) so the next request opens a fresh
/// WebSocket instead of sending into a dead socket.
pub fn invalidate() {
  invalidate_client();
}

/// Make a request using a persistent gateway connection.
///
/// Adds:
/// - bounded in-flight requests (backpressure)
/// - circuit breaker to avoid thrashing when gateway is down
pub async fn gateway_request_pooled(
  method: &str,
  params: Option<Value>,
  token: &str,
) -> Result<Value, String> {
  let client = get_or_connect(token).await?;

  // Circuit breaker check
  {
    let breaker = client.breaker.lock().await;
    if !breaker.allow() {
      return Err(format!(
        "Gateway circuit breaker is open ({})",
        breaker.state_string()
      ));
    }
  }

  // Backpressure: acquire an in-flight permit.
  let permit = client
    .in_flight
    .acquire()
    .await
    .map_err(|_| "Gateway request queue closed".to_string())?;

  let id = next_request_id();
  let frame = RequestFrame {
    frame_type: "req",
    method: method.to_string(),
    id: id.clone(),
    params,
  };

  let (tx, rx) = oneshot::channel();
  {
    let mut pending = client.pending.lock().await;
    pending.insert(id.clone(), Pending { tx });
  }

  let send_res = {
    let mut write = client.write.lock().await;
    write
      .send(Message::Text(serde_json::to_string(&frame).unwrap()))
      .await
      .map_err(|e| format!("Failed to send request: {}", e))
  };

  if let Err(e) = send_res {
    // Remove pending entry, mark breaker failure, and invalidate the
    // connection so the next request attempts a fresh handshake.
    {
      let mut pending = client.pending.lock().await;
      pending.remove(&id);
    }
    {
      let mut breaker = client.breaker.lock().await;
      breaker.on_failure();
    }
    invalidate_client();
    drop(permit);
    return Err(e);
  }

  let out = tokio::time::timeout(Duration::from_secs(30), rx)
    .await
    .map_err(|_| "Timeout waiting for response".to_string())
    .and_then(|r| r.map_err(|_| "Gateway response channel closed".to_string()))
    .and_then(|r| r);

  // Update breaker state based on outcome.
  {
    let mut breaker = client.breaker.lock().await;
    if out.is_ok() {
      breaker.on_success();
    } else {
      breaker.on_failure();
      // Connection may be stale; drop it so we reconnect next time.
      drop(breaker);
      invalidate_client();
    }
  }

  drop(permit);
  out
}

// ---------------------------------------------------------------------------
// Convenience helpers — mirror the gateway_ws public API but go through the
// persistent pooled connection instead of opening a new WebSocket each time.
// ---------------------------------------------------------------------------

/// Get the gateway token from environment or config file.
fn get_gateway_token() -> Option<String> {
  for var in ["OPENCLAW_GATEWAY_TOKEN", "CLAWDBOT_GATEWAY_TOKEN"] {
    if let Ok(token) = std::env::var(var) {
      let t = token.trim().to_string();
      if !t.is_empty() {
        return Some(t);
      }
    }
  }

  let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
  let config_candidates = [
    std::path::PathBuf::from(&home).join(".openclaw").join("openclaw.json"),
    std::path::PathBuf::from(&home).join(".clawdbot").join("clawdbot.json"),
  ];

  for config_path in &config_candidates {
    if let Ok(content) = std::fs::read_to_string(config_path) {
      if let Ok(config) = serde_json::from_str::<Value>(&content) {
        if let Some(token) = config
          .get("gateway")
          .and_then(|g| g.get("auth"))
          .and_then(|a| a.get("token"))
          .and_then(|t| t.as_str())
        {
          return Some(token.to_string());
        }
      }
    }
  }

  None
}

fn resolve_token(token: Option<&str>) -> Result<String, String> {
  if let Some(t) = token {
    return Ok(t.to_string());
  }
  get_gateway_token().ok_or_else(|| {
    "No gateway token found. Set OPENCLAW_GATEWAY_TOKEN or configure via Settings.".to_string()
  })
}

/// Get channel status from the gateway (pooled).
pub async fn get_channel_status(token: Option<&str>) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled("status", None, &t).await
}

/// Call a channel method on the gateway (pooled).
pub async fn call_channel_method(
  method: &str,
  params: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled(method, params, &t).await
}

/// Send a browser control request through the gateway's `browser.request`
/// RPC method.  The gateway dispatches to its in-process browser control
/// service (same routes as the legacy HTTP bridge that used to run on
/// port 18791).
pub async fn browser_request(
  http_method: &str,
  path: &str,
  query: Option<Value>,
  body: Option<Value>,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let mut params = serde_json::json!({
    "method": http_method,
    "path": path,
  });
  if let Some(q) = query {
    params["query"] = q;
  }
  if let Some(b) = body {
    params["body"] = b;
  }
  gateway_request_pooled("browser.request", Some(params), &t).await
}

/// Get current config from gateway (pooled).
pub async fn config_get(token: Option<&str>) -> Result<Value, String> {
  let t = resolve_token(token)?;
  gateway_request_pooled("config.get", None, &t).await
}

/// Patch config on gateway (pooled) - requires baseHash from config.get.
pub async fn config_patch(
  raw_patch: &str,
  base_hash: &str,
  token: Option<&str>,
) -> Result<Value, String> {
  let t = resolve_token(token)?;
  let params = serde_json::json!({
    "raw": raw_patch,
    "baseHash": base_hash
  });
  gateway_request_pooled("config.patch", Some(params), &t).await
}
