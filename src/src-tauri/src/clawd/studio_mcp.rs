//! MCP-over-stdio bridge for every Composio connector attached to the
//! Knapsack Studio account signed into Desktop.
//!
//! The Studio bearer and Composio connected-account IDs never enter the
//! gateway config or model context. This subprocess reads Desktop's private
//! token store and asks Studio to discover/execute tools for the authenticated
//! user. Two meta-tools keep large Composio action catalogs out of every turn:
//! the agent first lists one connector's actions, then calls a selected action.

use once_cell::sync::Lazy;
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::Mutex;
use std::time::Duration;
use tokio::io::AsyncWriteExt as _;

use super::service::clawdbot_home_headless;

const LIST_TOOL: &str = "list_connector_tools";
const CALL_TOOL: &str = "call_connector_tool";
static REFRESHED_ACCESS_TOKEN: Lazy<Mutex<Option<String>>> = Lazy::new(|| Mutex::new(None));

#[derive(Deserialize)]
struct StudioTokens {
  knapsack_access_token: Option<String>,
  knapsack_refresh_token: Option<String>,
}

fn api_base() -> String {
  std::env::var("KNAPSACK_STUDIO_API_BASE")
    .ok()
    .filter(|value| !value.trim().is_empty())
    .unwrap_or_else(|| {
      option_env!("VITE_KN_API_SERVER")
        .unwrap_or("https://api.knapsack.ai")
        .to_string()
    })
    .trim_end_matches('/')
    .to_string()
}

fn read_tokens() -> Result<StudioTokens, String> {
  let path = clawdbot_home_headless()?.join("tokens.json");
  let raw = std::fs::read_to_string(&path)
    .map_err(|error| format!("Unable to read Studio sign-in: {error}"))?;
  serde_json::from_str(&raw).map_err(|error| format!("Unable to parse Studio sign-in: {error}"))
}

fn nonempty(value: Option<String>) -> Option<String> {
  value
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty())
}

async fn refresh_access_token(refresh_token: &str) -> Result<String, String> {
  let response = reqwest::Client::builder()
    .timeout(Duration::from_secs(15))
    .build()
    .map_err(|error| error.to_string())?
    .get(format!("{}/api/authentication/refresh/app", api_base()))
    .header("refresh-token", refresh_token)
    .send()
    .await
    .map_err(|error| format!("Unable to refresh Studio sign-in: {error}"))?;
  if !response.status().is_success() {
    return Err("Knapsack Studio sign-in expired. Reconnect Studio in Settings.".to_string());
  }
  let body: Value = response
    .json()
    .await
    .map_err(|error| format!("Invalid Studio refresh response: {error}"))?;
  let token = body
    .get("access_token")
    .and_then(Value::as_str)
    .or_else(|| body.get("token").and_then(Value::as_str))
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .map(ToOwned::to_owned)
    .ok_or_else(|| "Studio refresh response did not contain an access token".to_string())?;
  if let Ok(mut cached) = REFRESHED_ACCESS_TOKEN.lock() {
    *cached = Some(token.clone());
  }
  Ok(token)
}

async fn request_studio(
  method: reqwest::Method,
  path: &str,
  body: Option<Value>,
) -> Result<Value, String> {
  let tokens = read_tokens()?;
  let cached = REFRESHED_ACCESS_TOKEN
    .lock()
    .ok()
    .and_then(|value| value.clone());
  let refresh_token = nonempty(tokens.knapsack_refresh_token);
  let mut access_token = match cached.or_else(|| nonempty(tokens.knapsack_access_token)) {
    Some(token) => token,
    None => match refresh_token.as_deref() {
      Some(refresh) => refresh_access_token(refresh).await?,
      None => return Err("Connect a Knapsack Studio account in Settings first.".to_string()),
    },
  };
  let timeout = if method == reqwest::Method::POST && path.ends_with("/call") {
    Duration::from_secs(120)
  } else {
    Duration::from_secs(45)
  };
  let client = reqwest::Client::builder()
    .timeout(timeout)
    .build()
    .map_err(|error| error.to_string())?;

  for attempt in 0..2 {
    let mut request = client
      .request(method.clone(), format!("{}{}", api_base(), path))
      .bearer_auth(&access_token);
    if let Some(payload) = body.as_ref() {
      request = request.json(payload);
    }
    let response = request
      .send()
      .await
      .map_err(|error| format!("Unable to reach Knapsack Studio: {error}"))?;
    if response.status() == reqwest::StatusCode::UNAUTHORIZED && attempt == 0 {
      let refresh = refresh_token.as_deref().ok_or_else(|| {
        "Knapsack Studio sign-in expired. Reconnect Studio in Settings.".to_string()
      })?;
      access_token = refresh_access_token(refresh).await?;
      continue;
    }
    let status = response.status();
    let value: Value = response.json().await.unwrap_or_else(|_| json!({}));
    if !status.is_success() {
      let detail = value
        .get("detail")
        .and_then(Value::as_str)
        .unwrap_or("Studio connector request failed");
      return Err(format!("{detail} ({status})"));
    }
    return Ok(value);
  }
  Err("Knapsack Studio sign-in expired. Reconnect Studio in Settings.".to_string())
}

async fn connected_connectors() -> Result<Vec<Value>, String> {
  let body = request_studio(
    reqwest::Method::GET,
    "/desktop/integrations/connected",
    None,
  )
  .await?;
  Ok(
    body
      .get("connectors")
      .and_then(Value::as_array)
      .cloned()
      .unwrap_or_default(),
  )
}

async fn list_connector_tools(arguments: &Value) -> Result<Value, String> {
  let connector = arguments
    .get("connector")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| "connector is required".to_string())?;
  request_studio(
    reqwest::Method::GET,
    &format!(
      "/desktop/integrations/{}/tools",
      urlencoding::encode(connector)
    ),
    None,
  )
  .await
}

async fn call_connector_tool(arguments: &Value) -> Result<Value, String> {
  let connector = arguments
    .get("connector")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| "connector is required".to_string())?;
  let name = arguments
    .get("name")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| "name is required".to_string())?;
  let tool_arguments = arguments
    .get("arguments")
    .cloned()
    .unwrap_or_else(|| json!({}));
  request_studio(
    reqwest::Method::POST,
    &format!(
      "/desktop/integrations/{}/call",
      urlencoding::encode(connector)
    ),
    Some(json!({ "name": name, "arguments": tool_arguments })),
  )
  .await
}

fn tool_schemas(connectors: &[Value], discovery_error: Option<&str>) -> Vec<Value> {
  let ids = connectors
    .iter()
    .filter_map(|connector| connector.get("id").and_then(Value::as_str))
    .collect::<Vec<_>>();
  let labels = connectors
    .iter()
    .filter_map(|connector| {
      Some(format!(
        "{} ({})",
        connector.get("name")?.as_str()?,
        connector.get("id")?.as_str()?
      ))
    })
    .collect::<Vec<_>>()
    .join(", ");
  let connector_schema = if ids.is_empty() {
    let description = discovery_error
      .map(|error| {
        format!(
          "Connected Studio connector id. Connector discovery is currently unavailable: {error}"
        )
      })
      .unwrap_or_else(|| "Connected Studio connector id".to_string());
    json!({ "type": "string", "description": description })
  } else {
    json!({ "type": "string", "enum": ids, "description": format!("Connected Studio connector. Available: {labels}") })
  };
  vec![
    json!({
      "name": LIST_TOOL,
      "description": "List the available actions and exact input schemas for one connector already connected through Knapsack Studio. Call this before using call_connector_tool. Never ask the user for connector credentials.",
      "inputSchema": {
        "type": "object",
        "properties": { "connector": connector_schema.clone() },
        "required": ["connector"]
      }
    }),
    json!({
      "name": CALL_TOOL,
      "description": "Execute an action from a connector already connected through Knapsack Studio. First call list_connector_tools, then use its exact action name and argument schema. Only perform writes or sends when the user requested them.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "connector": connector_schema,
          "name": { "type": "string", "description": "Exact action name returned by list_connector_tools" },
          "arguments": { "type": "object", "description": "Arguments matching the listed action input schema" }
        },
        "required": ["connector", "name", "arguments"]
      }
    }),
  ]
}

fn respond(id: &Value, result: Value) -> Value {
  json!({ "jsonrpc": "2.0", "id": id, "result": result })
}

fn respond_error(id: &Value, code: i64, message: String) -> Value {
  json!({ "jsonrpc": "2.0", "id": id, "error": { "code": code, "message": message } })
}

async fn handle_request(request: Value) -> Option<Value> {
  let id = request.get("id").cloned().unwrap_or(Value::Null);
  let method = request.get("method").and_then(Value::as_str).unwrap_or("");
  let has_id = request.get("id").is_some();
  let response = match method {
    "initialize" => respond(
      &id,
      json!({
        "protocolVersion": "2024-11-05",
        "serverInfo": { "name": "knapsack-studio-mcp", "version": "1" },
        "capabilities": { "tools": { "listChanged": true } }
      }),
    ),
    "tools/list" => {
      let (connectors, discovery_error) = match connected_connectors().await {
        Ok(connectors) => (connectors, None),
        Err(error) => (Vec::new(), Some(error)),
      };
      respond(
        &id,
        json!({ "tools": tool_schemas(&connectors, discovery_error.as_deref()) }),
      )
    }
    "tools/call" => {
      let params = request.get("params").cloned().unwrap_or_else(|| json!({}));
      let name = params.get("name").and_then(Value::as_str).unwrap_or("");
      let arguments = params
        .get("arguments")
        .cloned()
        .unwrap_or_else(|| json!({}));
      let result = match name {
        LIST_TOOL => list_connector_tools(&arguments).await,
        CALL_TOOL => call_connector_tool(&arguments).await,
        _ => Err(format!("Unknown tool: {name}")),
      };
      match result {
        Ok(value) => respond(
          &id,
          json!({ "content": [{ "type": "text", "text": value.to_string() }] }),
        ),
        Err(error) => respond(
          &id,
          json!({ "content": [{ "type": "text", "text": error }], "isError": true }),
        ),
      }
    }
    "notifications/initialized" | "" => return None,
    other => respond_error(&id, -32601, format!("Method not found: {other}")),
  };
  has_id.then_some(response)
}

pub async fn run_stdio_server() {
  use tokio::io::AsyncBufReadExt;

  let stdin = tokio::io::stdin();
  let mut reader = tokio::io::BufReader::new(stdin).lines();
  let mut stdout = tokio::io::stdout();
  loop {
    let line = match reader.next_line().await {
      Ok(Some(line)) => line,
      _ => break,
    };
    let request: Value = match serde_json::from_str(line.trim()) {
      Ok(value) => value,
      Err(error) => {
        eprintln!("[studio_mcp] ignoring malformed JSON-RPC line: {error}");
        continue;
      }
    };
    if let Some(response) = handle_request(request).await {
      let Ok(mut serialized) = serde_json::to_string(&response) else {
        continue;
      };
      serialized.push('\n');
      if stdout.write_all(serialized.as_bytes()).await.is_err() || stdout.flush().await.is_err() {
        break;
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn connector_catalog_becomes_mcp_enum_without_secrets() {
    let tools = tool_schemas(&[json!({ "id": "slack", "name": "Slack" })], None);
    let serialized = serde_json::to_string(&tools).unwrap();
    assert!(serialized.contains("slack"));
    assert!(serialized.contains("Slack"));
    assert!(!serialized.contains("access_token"));
  }
}
