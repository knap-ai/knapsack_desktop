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
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tokio::io::AsyncWriteExt as _;

use super::service::clawdbot_home_headless;
use super::session_watcher::resolve_bound_authorized_session_with_slack_context;

const LIST_TOOL: &str = "list_connector_tools";
const CALL_TOOL: &str = "call_connector_tool";
const CONNECTOR_TOOLS_CACHE_TTL: Duration = Duration::from_secs(10 * 60);
const LARGE_CONNECTOR_TOOL_COUNT: usize = 40;
const DEFAULT_SEARCH_RESULT_LIMIT: usize = 5;
const MAX_SEARCH_RESULT_LIMIT: usize = 10;
const MAX_SEARCH_RESULT_BYTES: usize = 12_000;

#[derive(Clone)]
struct RefreshedStudioToken {
  refresh_token: String,
  access_token: String,
}

static REFRESHED_ACCESS_TOKEN: Lazy<Mutex<Option<RefreshedStudioToken>>> =
  Lazy::new(|| Mutex::new(None));

#[derive(Clone)]
struct CachedConnectorTools {
  fetched_at: Instant,
  value: Value,
}

static CONNECTOR_TOOLS_CACHE: Lazy<Mutex<HashMap<String, CachedConnectorTools>>> =
  Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Deserialize)]
struct StudioTokens {
  knapsack_access_token: Option<String>,
  knapsack_refresh_token: Option<String>,
  knapsack_email: Option<String>,
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
    *cached = Some(RefreshedStudioToken {
      refresh_token: refresh_token.to_string(),
      access_token: token.clone(),
    });
  }
  Ok(token)
}

async fn request_studio(
  method: reqwest::Method,
  path: &str,
  body: Option<Value>,
) -> Result<Value, String> {
  let tokens = read_tokens()?;
  let stored_access_token = nonempty(tokens.knapsack_access_token);
  let refresh_token = nonempty(tokens.knapsack_refresh_token);
  if stored_access_token.is_none() && refresh_token.is_none() {
    if let Ok(mut cached) = REFRESHED_ACCESS_TOKEN.lock() {
      *cached = None;
    }
    return Err("Connect a Knapsack Studio account in Settings first.".to_string());
  }
  let cached = refresh_token.as_deref().and_then(|current_refresh| {
    REFRESHED_ACCESS_TOKEN
      .lock()
      .ok()
      .and_then(|value| value.clone())
      .filter(|value| value.refresh_token == current_refresh)
      .map(|value| value.access_token)
  });
  // A token refreshed by this process is newer than the access token still
  // present on disk. Prefer it while the refresh-token identity is unchanged.
  let mut access_token = match cached.or(stored_access_token) {
    Some(token) => token,
    None => match refresh_token.as_deref() {
      Some(refresh) => refresh_access_token(refresh).await?,
      None => return Err("Connect a Knapsack Studio account in Settings first.".to_string()),
    },
  };
  let timeout = if method == reqwest::Method::POST && path.ends_with("/call") {
    Duration::from_secs(120)
  } else if method == reqwest::Method::GET
    && (path.ends_with("/tools") || path.contains("/tools?"))
  {
    // Large Composio catalogs (GitHub currently exposes about 200 actions)
    // can take longer to generate on a cold Studio cache.
    Duration::from_secs(60)
  } else {
    Duration::from_secs(45)
  };
  let client = reqwest::Client::builder()
    .timeout(timeout)
    .build()
    .map_err(|error| error.to_string())?;

  let max_attempts = if method == reqwest::Method::GET { 3 } else { 2 };
  for attempt in 0..max_attempts {
    let mut request = client
      .request(method.clone(), format!("{}{}", api_base(), path))
      .bearer_auth(&access_token);
    if let Some(payload) = body.as_ref() {
      request = request.json(payload);
    }
    let response = match request.send().await {
      Ok(response) => response,
      Err(error) if method == reqwest::Method::GET && attempt + 1 < max_attempts => {
        eprintln!(
          "[studio_mcp] retrying Studio GET {path} after attempt {} failed: {error}",
          attempt + 1
        );
        tokio::time::sleep(Duration::from_millis(350 * (attempt as u64 + 1))).await;
        continue;
      }
      Err(error) => return Err(format!("Unable to reach Knapsack Studio: {error}")),
    };
    if response.status() == reqwest::StatusCode::UNAUTHORIZED && attempt + 1 < max_attempts {
      let refresh = refresh_token.as_deref().ok_or_else(|| {
        "Knapsack Studio sign-in expired. Reconnect Studio in Settings.".to_string()
      })?;
      access_token = refresh_access_token(refresh).await?;
      continue;
    }
    let status = response.status();
    let value: Value = response.json().await.unwrap_or_else(|_| json!({}));
    if method == reqwest::Method::GET && status.is_server_error() && attempt + 1 < max_attempts {
      eprintln!(
        "[studio_mcp] retrying Studio GET {path} after attempt {} returned {status}",
        attempt + 1
      );
      tokio::time::sleep(Duration::from_millis(350 * (attempt as u64 + 1))).await;
      continue;
    }
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

fn is_local_desktop_scope(scope_key: &str) -> bool {
  scope_key == "agent:main:main"
    || scope_key.starts_with("agent:main:webchat:")
    || scope_key.starts_with("agent:main:knapsack:")
}

fn email_domain(email: &str) -> Option<&str> {
  email.rsplit_once('@').map(|(_, domain)| domain)
}

async fn authorize_studio_request(arguments: &Value) -> Result<(), String> {
  let tokens = read_tokens()?;
  let owner = nonempty(tokens.knapsack_email).ok_or_else(|| {
    "Reconnect Knapsack Studio in Settings to confirm the account owner.".to_string()
  })?;
  let session_id = arguments
    .get("_knapsack_session_id")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| {
      "Cannot authorize Studio connector access: missing trusted gateway session context"
        .to_string()
    })?;
  let scope_key = arguments
    .get("_knapsack_scope_key")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| {
      "Cannot authorize Studio connector access: missing trusted gateway session scope".to_string()
    })?;

  let slack_user_id = arguments
    .get("_knapsack_slack_user_id")
    .and_then(Value::as_str);
  let slack_account_id = arguments
    .get("_knapsack_slack_account_id")
    .and_then(Value::as_str);
  let slack_workspace_id = arguments
    .get("_knapsack_slack_workspace_id")
    .and_then(Value::as_str);

  match resolve_bound_authorized_session_with_slack_context(
    session_id,
    scope_key,
    slack_account_id,
    slack_user_id,
    slack_workspace_id,
  )
  .await
  {
    Ok((sender, _)) => {
      // Studio credentials belong to the Desktop/Scout service identity, not
      // to whichever Slack user originated this request. The exact verified
      // sender still gates and audits access; it must not be compared to the
      // configured connector owner or selected from other active sessions.
      // Restrict service-account sharing to the owner's email domain so a
      // second Slack workspace cannot inherit another tenant's connectors.
      if !sender.eq_ignore_ascii_case(&owner)
        && email_domain(&sender)
          .zip(email_domain(&owner))
          .map(|(sender_domain, owner_domain)| !sender_domain.eq_ignore_ascii_case(owner_domain))
          .unwrap_or(true)
      {
        return Err(format!(
          "The verified Slack sender {sender} is outside the connected Studio owner's organization. Refusing connector access."
        ));
      }
      eprintln!(
        "[studio_mcp] authorized gateway session {session_id} scope {scope_key} as {sender} to use Studio owner {owner}"
      );
      Ok(())
    }
    // Desktop's first-party chat has no Slack identity record. Its trusted
    // gateway scope and local process own the private Studio token store.
    Err(_) if is_local_desktop_scope(scope_key) => Ok(()),
    Err(error) => Err(format!("Cannot authorize Studio connector access: {error}")),
  }
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
  authorize_studio_request(arguments).await?;
  let connector = arguments
    .get("connector")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .ok_or_else(|| "connector is required".to_string())?;
  let query = arguments
    .get("query")
    .and_then(Value::as_str)
    .map(str::trim)
    .filter(|value| !value.is_empty());
  let limit = arguments
    .get("limit")
    .and_then(Value::as_u64)
    .map(|value| value as usize)
    .unwrap_or(DEFAULT_SEARCH_RESULT_LIMIT)
    .clamp(1, MAX_SEARCH_RESULT_LIMIT);

  let cache_key = format!("{}\n{}\n{}", connector, query.unwrap_or(""), limit);
  let cached = CONNECTOR_TOOLS_CACHE
    .lock()
    .ok()
    .and_then(|cache| cache.get(&cache_key).cloned())
    .filter(|entry| entry.fetched_at.elapsed() < CONNECTOR_TOOLS_CACHE_TTL)
    .map(|entry| entry.value);
  let value = match cached {
    Some(value) => value,
    None => {
      let mut path = format!(
        "/desktop/integrations/{}/tools?limit={limit}",
        urlencoding::encode(connector)
      );
      if let Some(query) = query {
        path.push_str("&query=");
        path.push_str(&urlencoding::encode(query));
      }
      let value = request_studio(
        reqwest::Method::GET,
        &path,
        None,
      )
      .await?;
      if let Ok(mut cache) = CONNECTOR_TOOLS_CACHE.lock() {
        cache.insert(
          cache_key,
          CachedConnectorTools {
            fetched_at: Instant::now(),
            value: value.clone(),
          },
        );
      }
      value
    }
  };
  Ok(shape_connector_tools(value, query, limit))
}

fn shape_connector_tools(mut value: Value, query: Option<&str>, limit: usize) -> Value {
  let Some(tools) = value.get("tools").and_then(Value::as_array) else {
    return value;
  };
  let total = tools.len();
  let normalized_query = query.map(|value| value.to_ascii_lowercase());

  if let Some(query) = normalized_query.as_deref() {
    let query_terms = query.split_whitespace().collect::<Vec<_>>();
    let mut ranked = tools
      .iter()
      .enumerate()
      .filter_map(|(index, tool)| {
        score_tool_for_query(tool, query, &query_terms).map(|score| (score, index, tool))
      })
      .collect::<Vec<_>>();
    ranked.sort_by(|left, right| right.0.cmp(&left.0).then_with(|| left.1.cmp(&right.1)));
    let mut matches = Vec::new();
    let mut response_bytes = 0;
    for (_, _, tool) in ranked.into_iter().take(limit) {
      let tool_bytes = serde_json::to_vec(tool).map_or(0, |serialized| serialized.len());
      if !matches.is_empty() && response_bytes + tool_bytes > MAX_SEARCH_RESULT_BYTES {
        break;
      }
      response_bytes += tool_bytes;
      matches.push(tool.clone());
    }
    value["tools"] = Value::Array(matches);
    value["totalTools"] = json!(total);
    value["query"] = json!(query);
    value["message"] = json!(
      "Use an exact returned action name and input schema with call_connector_tool. Refine query if the needed action is not shown."
    );
    return value;
  }

  if total > LARGE_CONNECTOR_TOOL_COUNT {
    value["tools"] = Value::Array(
      tools
        .iter()
        .filter_map(|tool| {
          tool
            .get("name")
            .and_then(Value::as_str)
            .map(|name| json!({ "name": name }))
        })
        .collect(),
    );
    value["totalTools"] = json!(total);
    value["requiresQuery"] = json!(true);
    value["message"] = json!(
      "This connector has a large action catalog. Call list_connector_tools again with a short query describing the action you need to receive matching exact schemas."
    );
  }
  value
}

fn score_tool_for_query(tool: &Value, query: &str, query_terms: &[&str]) -> Option<u32> {
  let name = tool
    .get("name")
    .and_then(Value::as_str)
    .unwrap_or("")
    .to_ascii_lowercase();
  let normalized_name = name.replace('_', " ").replace('-', " ");
  let description = tool
    .get("description")
    .and_then(Value::as_str)
    .unwrap_or("")
    .to_ascii_lowercase();
  if !query_terms
    .iter()
    .all(|term| normalized_name.contains(term) || description.contains(term))
  {
    return None;
  }

  let mut score = 0;
  if normalized_name.contains(query) {
    score += 100;
  }
  if description.contains(query) {
    score += 5;
  }
  for term in query_terms {
    if normalized_name.contains(term) {
      score += 20;
    }
    if description.contains(term) {
      score += 1;
    }
  }
  Some(score)
}

async fn call_connector_tool(arguments: &Value) -> Result<Value, String> {
  authorize_studio_request(arguments).await?;
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
  let labels = connectors
    .iter()
    .filter_map(|connector| {
      let name = connector.get("name")?.as_str()?;
      let id = connector.get("id")?.as_str()?;
      match connector
        .get("account")
        .and_then(Value::as_str)
        .filter(|account| !account.trim().is_empty())
      {
        Some(account) => Some(format!("{name} ({id}; account {account})")),
        None => Some(format!("{name} ({id})")),
      }
    })
    .collect::<Vec<_>>()
    .join(", ");
  let description = if !labels.is_empty() {
    format!("Connected Studio connector id. Currently available: {labels}")
  } else if let Some(error) = discovery_error {
    format!("Connected Studio connector id. Connector discovery is currently unavailable: {error}")
  } else {
    "Connected Studio connector id".to_string()
  };
  // Keep this an open string. MCP clients cache tools/list; a static enum
  // would reject a connector added inline until the gateway relisted tools.
  let connector_schema = json!({ "type": "string", "description": description });
  vec![
    json!({
      "name": LIST_TOOL,
      "description": "Discover actions for one connector already connected through Knapsack Studio. Large connectors return a compact action index first; call again with query to receive matching exact input schemas. Call this before using call_connector_tool. Never ask the user for connector credentials.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "connector": connector_schema.clone(),
          "query": { "type": "string", "description": "Optional short action search, such as 'list repositories' or 'create issue'. Use this when the first result says requiresQuery." },
          "limit": { "type": "integer", "minimum": 1, "maximum": 10, "description": "Maximum matching exact schemas to return (default 5; response size is also bounded to prevent truncation)." }
        },
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

  static TEST_ENV_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

  fn seed_studio_owner_and_identity(
    home: &std::path::Path,
    session_id: &str,
    sender: &str,
    scope_key: &str,
  ) {
    std::fs::write(
      home.join("tokens.json"),
      r#"{"knapsack_email":"scout@bankaya.com.mx"}"#,
    )
    .unwrap();
    let identities = home.join("snowflake-identities");
    std::fs::create_dir_all(&identities).unwrap();
    std::fs::write(
      identities.join(format!("{session_id}.json")),
      serde_json::to_vec(&json!({ "email": sender, "scope_key": scope_key })).unwrap(),
    )
    .unwrap();
  }

  #[test]
  fn connector_catalog_describes_connectors_without_freezing_an_enum_or_secrets() {
    let tools = tool_schemas(
      &[
        json!({ "id": "slack", "name": "Slack" }),
        json!({
          "id": "google_gmail_modify",
          "name": "Google Gmail",
          "account": "mark@knap.ai",
          "provider": "native"
        }),
      ],
      None,
    );
    let serialized = serde_json::to_string(&tools).unwrap();
    assert!(serialized.contains("slack"));
    assert!(serialized.contains("Slack"));
    assert!(serialized.contains("google_gmail_modify"));
    assert!(serialized.contains("mark@knap.ai"));
    assert!(!serialized.contains("\"enum\""));
    assert!(!serialized.contains("access_token"));
  }

  #[test]
  fn large_connector_catalog_returns_a_compact_searchable_index() {
    let tools = (0..200)
      .map(|index| {
        json!({
          "name": format!("github_action_{index}"),
          "description": format!("GitHub action number {index}"),
          "inputSchema": { "type": "object", "properties": { "value": { "type": "string" } } }
        })
      })
      .collect::<Vec<_>>();
    let shaped = shape_connector_tools(
      json!({ "connector": "github", "tools": tools }),
      None,
      DEFAULT_SEARCH_RESULT_LIMIT,
    );

    assert_eq!(shaped.get("totalTools").and_then(Value::as_u64), Some(200));
    assert_eq!(
      shaped.get("requiresQuery").and_then(Value::as_bool),
      Some(true)
    );
    assert_eq!(shaped["tools"].as_array().unwrap().len(), 200);
    assert!(shaped["tools"][0].get("inputSchema").is_none());
  }

  #[test]
  fn connector_search_returns_only_matching_exact_schemas() {
    let shaped = shape_connector_tools(
      json!({
        "connector": "github",
        "tools": [
          { "name": "github_list_repositories", "description": "List repositories", "inputSchema": { "type": "object" } },
          { "name": "github_create_issue", "description": "Create an issue", "inputSchema": { "type": "object" } },
          { "name": "github_list_repository_issues", "description": "List issues for a repository", "inputSchema": { "type": "object" } }
        ]
      }),
      Some("list repositories"),
      1,
    );

    let matches = shaped["tools"].as_array().unwrap();
    assert_eq!(matches.len(), 1);
    assert_eq!(matches[0]["name"], "github_list_repositories");
    assert!(matches[0].get("inputSchema").is_some());
    assert_eq!(shaped.get("totalTools").and_then(Value::as_u64), Some(3));
  }

  #[tokio::test(flavor = "current_thread")]
  async fn exact_verified_slack_sender_can_use_scout_service_connectors() {
    let _guard = TEST_ENV_LOCK.lock().unwrap();
    let home = tempfile::tempdir().unwrap();
    let scope = "agent:main:slack:default:direct:u0asedsqp8f";
    seed_studio_owner_and_identity(home.path(), "session-mark", "mark@bankaya.com.mx", scope);
    std::env::set_var("OPENCLAW_STATE_DIR", home.path());

    authorize_studio_request(&json!({
      "_knapsack_session_id": "session-mark",
      "_knapsack_scope_key": scope
    }))
    .await
    .unwrap();
  }

  #[tokio::test(flavor = "current_thread")]
  async fn unknown_or_scope_mismatched_slack_session_fails_closed() {
    let _guard = TEST_ENV_LOCK.lock().unwrap();
    let home = tempfile::tempdir().unwrap();
    let scope = "agent:main:slack:default:direct:u0asedsqp8f";
    seed_studio_owner_and_identity(home.path(), "session-mark", "mark@bankaya.com.mx", scope);
    std::env::set_var("OPENCLAW_STATE_DIR", home.path());

    let unknown = authorize_studio_request(&json!({
      "_knapsack_session_id": "session-other",
      "_knapsack_scope_key": "agent:main:slack:default:direct:u0bpj321v9p"
    }))
    .await
    .unwrap_err();
    assert!(unknown.contains("Cannot authorize"));

    let mismatch = authorize_studio_request(&json!({
      "_knapsack_session_id": "session-mark",
      "_knapsack_scope_key": "agent:main:slack:default:direct:u0bpj321v9p"
    }))
    .await
    .unwrap_err();
    assert!(mismatch.contains("scope mismatch"));
  }

  #[tokio::test(flavor = "current_thread")]
  async fn verified_sender_outside_the_service_account_domain_fails_closed() {
    let _guard = TEST_ENV_LOCK.lock().unwrap();
    let home = tempfile::tempdir().unwrap();
    let scope = "agent:main:slack:default:direct:uexternal";
    seed_studio_owner_and_identity(home.path(), "session-external", "person@example.com", scope);
    std::env::set_var("OPENCLAW_STATE_DIR", home.path());

    let error = authorize_studio_request(&json!({
      "_knapsack_session_id": "session-external",
      "_knapsack_scope_key": scope
    }))
    .await
    .unwrap_err();
    assert!(error.contains("outside the connected Studio owner's organization"));
  }

  #[tokio::test(flavor = "current_thread")]
  async fn local_desktop_scope_remains_authorized_without_a_slack_identity() {
    let _guard = TEST_ENV_LOCK.lock().unwrap();
    let home = tempfile::tempdir().unwrap();
    std::fs::write(
      home.path().join("tokens.json"),
      r#"{"knapsack_email":"scout@bankaya.com.mx"}"#,
    )
    .unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", home.path());

    authorize_studio_request(&json!({
      "_knapsack_session_id": "ui-agent-scout",
      "_knapsack_scope_key": "agent:main:webchat:dm:ui-agent-scout"
    }))
    .await
    .unwrap();

    authorize_studio_request(&json!({
      "_knapsack_session_id": "main",
      "_knapsack_scope_key": "agent:main:main"
    }))
    .await
    .unwrap();
  }
}
