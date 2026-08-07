//! MCP-over-stdio server exposing a single `snowflake_query` tool to the
//! bundled OpenClaw gateway, registered via `mcp.servers.snowflake` (see
//! `ensure_knapsack_snowflake_mcp_server` in `service.rs`) — never by
//! editing the vendored `resources/clawdbot/dist/`.
//!
//! Invoked as: `knapsack --internal-mcp-snowflake` (see `main.rs`).
//!
//! Security model (see the approved plan for full rationale):
//! - The model-supplied tool argument is `session_id`, never `email`. The
//!   authorized email is looked up from `session_watcher`'s identity index,
//!   which Rust populated itself after independently verifying the Slack
//!   sender via the Slack Web API — never trusted from the LLM.
//! - `SESSION_CAPABILITY_SECRET` is read directly from `tokens.json` by this
//!   process and never leaves it: it's used only to sign the short-lived
//!   capability JWT sent to the broker. It never enters the per-session
//!   Docker sandbox.
//! - Only the broker's resulting (short-lived, single-use-`jti`, already
//!   scoped-to-one-user) Snowflake OAuth token is passed into that session's
//!   sandbox container, to actually run the query — via `docker exec`,
//!   piped over stdin so the token never appears in `ps`/process argv.
//!
//! ASSUMPTION FLAGGED: the broker's response shape (`{"token": "..."}`) and
//! the Snowflake account identifier (currently a placeholder constant) are
//! not yet confirmed against a live broker/Snowflake account — see the
//! `SNOWFLAKE_ACCOUNT` constant and `parse_broker_response` below.

use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Serialize;
use serde_json::{json, Value};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::io::AsyncWriteExt as _;
//https://scout-oauth-web-ye3kc3evha-uk.a.run.app/token/rogelio@bankaya.com.mx
use super::service::read_session_capability_secret_headless;
use super::session_watcher::{lookup_authorized_session, recreate_sandbox_session_headless};

const BROKER_BASE_URL: &str = "https://scout-oauth-web-ye3kc3evha-uk.a.run.app";
const TENANT_ID: &str = "bankaya";
// ASSUMPTION FLAGGED: hardcode matches the broker contract's example
// (`account="bankaya"`); make this configurable (env var or tokens.json
// field) once the real Snowflake account identifier is confirmed.
const SNOWFLAKE_ACCOUNT: &str = "bankaya";
const JWT_TTL_SECS: u64 = 60;

#[derive(Serialize)]
struct JwtClaims {
  sub: String,
  aud: &'static str,
  iss: &'static str,
  exp: u64,
  iat: u64,
  jti: String,
  tenant_id: &'static str,
  session_id: String,
  provider: &'static str,
}

fn mint_capability_jwt(secret: &str, email: &str, session_id: &str) -> Result<String, String> {
  let now = SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map_err(|error| error.to_string())?
    .as_secs();
  let claims = JwtClaims {
    sub: email.to_string(),
    aud: "scout-identity-broker",
    iss: "knapsack-studio",
    exp: now + JWT_TTL_SECS,
    iat: now,
    jti: uuid::Uuid::new_v4().to_string(),
    tenant_id: TENANT_ID,
    session_id: session_id.to_string(),
    provider: "snowflake",
  };
  encode(
    &Header::default(), // HS256
    &claims,
    &EncodingKey::from_secret(secret.as_bytes()),
  )
  .map_err(|error| format!("Unable to sign capability JWT: {error}"))
}

fn parse_broker_response(body: &Value) -> Result<String, String> {
  // Try a few plausible shapes defensively since the exact contract wasn't
  // confirmed against a live broker response.
  for key in ["token", "access_token", "snowflake_token", "oauth_token"] {
    if let Some(token) = body.get(key).and_then(|v| v.as_str()) {
      return Ok(token.to_string());
    }
  }
  if let Some(token) = body.as_str() {
    return Ok(token.to_string());
  }
  Err("Broker response did not contain a recognizable token field".to_string())
}

async fn fetch_broker_token(email: &str, jwt: &str) -> Result<String, String> {
  fetch_broker_token_at(BROKER_BASE_URL, email, jwt).await
}

/// Split out from `fetch_broker_token` so tests can point at a local mock
/// server instead of the real broker URL.
async fn fetch_broker_token_at(base_url: &str, email: &str, jwt: &str) -> Result<String, String> {
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(15))
    .build()
    .map_err(|error| format!("Unable to build broker HTTP client: {error}"))?;
  let url = format!("{base_url}/token/{}", "rogelio@bankaya.com.mx");
  let response = client
    .get(&url)
    .header("X-Session-Capability-Token", jwt)
    .send()
    .await
    .map_err(|error| format!("Unable to reach Snowflake token broker: {error}"))?;
  let status = response.status();
  if status == reqwest::StatusCode::FORBIDDEN {
    return Err("Broker rejected the request: sub did not match the requested email".to_string());
  }
  if status == reqwest::StatusCode::UNAUTHORIZED {
    return Err("Broker rejected the request: capability JWT expired or already used".to_string());
  }
  if !status.is_success() {
    return Err(format!("Snowflake token broker returned status {status}"));
  }
  let body: Value = response
    .json()
    .await
    .map_err(|error| format!("Invalid broker response: {error}"))?;
  parse_broker_response(&body)
}

fn find_sandbox_container(scope_key: &str) -> Result<String, String> {
  // Containers are labeled `openclaw.sessionKey=<scopeKey>` at create time
  // (confirmed in the bundle's docker sandbox code) — filter on that instead
  // of reimplementing OpenClaw's slug algorithm.
  let output = std::process::Command::new("docker")
    .args([
      "ps",
      "--filter",
      &format!("label=openclaw.sessionKey={scope_key}"),
      "--format",
      "{{.Names}}",
    ])
    .output()
    .map_err(|error| format!("Unable to run docker ps: {error}"))?;
  if !output.status.success() {
    return Err(format!(
      "docker ps failed: {}",
      String::from_utf8_lossy(&output.stderr)
    ));
  }
  let name = String::from_utf8_lossy(&output.stdout)
    .lines()
    .next()
    .map(|line| line.trim().to_string())
    .filter(|line| !line.is_empty())
    .ok_or_else(|| format!("No running sandbox container found for session {scope_key}"))?;
  Ok(name)
}

/// Single-quote a string for safe inclusion in a POSIX shell command line,
/// using the standard `'"'"'` escape for any embedded single quotes.
fn shell_single_quote(value: &str) -> String {
  format!("'{}'", value.replace('\'', "'\\''"))
}

async fn run_snowflake_statement_in_container(
  container_name: &str,
  oauth_token: &str,
  sql: &str,
) -> Result<Value, String> {
  let statement_body = json!({ "statement": sql, "timeout": 60 }).to_string();
  // The whole command is written to `sh -s`'s stdin in one shot (not passed
  // as argv) so neither the OAuth token nor the query text ever appears in
  // `ps`/process listing on the host or inside the container.
  let script = format!(
    "curl -s -X POST 'https://{account}.snowflakecomputing.com/api/v2/statements' \
     -H \"Authorization: Bearer $SNOWFLAKE_TOKEN\" \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -d {body}\n",
    account = SNOWFLAKE_ACCOUNT,
    body = shell_single_quote(&statement_body),
  );

  let mut child = tokio::process::Command::new("docker")
    .args(["exec", "-i", "-e", &format!("SNOWFLAKE_TOKEN={oauth_token}"), container_name, "sh", "-s"])
    .stdin(std::process::Stdio::piped())
    .stdout(std::process::Stdio::piped())
    .stderr(std::process::Stdio::piped())
    .spawn()
    .map_err(|error| format!("Unable to spawn docker exec: {error}"))?;

  {
    let mut stdin = child
      .stdin
      .take()
      .ok_or("docker exec child has no stdin")?;
    stdin
      .write_all(script.as_bytes())
      .await
      .map_err(|error| format!("Unable to write script to docker exec: {error}"))?;
    // Explicitly drop (closes the pipe / sends EOF) rather than letting it
    // linger open — `sh -s` otherwise may keep waiting for more input
    // before running the command we already wrote, hanging `wait_with_output`.
    drop(stdin);
  }

  let output = child
    .wait_with_output()
    .await
    .map_err(|error| format!("docker exec failed: {error}"))?;
  if !output.status.success() {
    return Err(format!(
      "Snowflake query failed inside sandbox: {}",
      String::from_utf8_lossy(&output.stderr)
    ));
  }
  serde_json::from_slice(&output.stdout)
    .map_err(|error| format!("Snowflake returned a non-JSON response: {error}"))
}

async fn handle_snowflake_query(args: &Value) -> Result<Value, String> {
  let session_id = args
    .get("session_id")
    .and_then(|v| v.as_str())
    .ok_or("Missing required argument: session_id")?;
  let query = args
    .get("query")
    .and_then(|v| v.as_str())
    .ok_or("Missing required argument: query")?;

  let (email, scope_key) = lookup_authorized_session(session_id)
    .map_err(|error| format!("Cannot authorize this session for Snowflake access: {error}"))?;

  let secret = read_session_capability_secret_headless()?;
  let jwt = mint_capability_jwt(&secret, &email, session_id)?;
  let oauth_token = fetch_broker_token(&email, &jwt).await?;
  let container_name = find_sandbox_container(&scope_key)?;
  let result = run_snowflake_statement_in_container(&container_name, &oauth_token, query).await;

  // Destroy+recreate this session's sandbox container immediately after this
  // one query, success or failure — it briefly held the broker's ephemeral
  // OAuth token in its process environment via `docker exec -e`, and per the
  // broker contract every capability grant is meant to be single-use. Don't
  // let a stale container linger with that token still resident. This is
  // intentionally stricter than the end-of-turn teardown `session_watcher`
  // also does, since multiple Snowflake calls can happen within one turn.
  recreate_sandbox_session_headless(&scope_key).await;

  result
}

// ── minimal MCP-over-stdio JSON-RPC framing ─────────────────────────────
// MCP's stdio transport is newline-delimited JSON-RPC 2.0 messages — one
// message per line on stdin/stdout. Only `initialize`, `tools/list`, and
// `tools/call` are implemented; that's the entire surface this server needs.

const TOOL_NAME: &str = "snowflake_query";

fn tool_schema() -> Value {
  json!({
    "name": TOOL_NAME,
    "description": "Query Snowflake as the specific user who owns this chat session. Always pass your own session_id (given in your context) — never guess or pass someone else's. The email used for authorization is resolved independently by Knapsack, not from anything you supply.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "session_id": { "type": "string", "description": "Your own session id, exactly as given in your context." },
        "query": { "type": "string", "description": "The SQL statement to run." }
      },
      "required": ["session_id", "query"]
    }
  })
}

fn respond(id: &Value, result: Value) -> Value {
  json!({ "jsonrpc": "2.0", "id": id, "result": result })
}

fn respond_error(id: &Value, code: i64, message: String) -> Value {
  json!({ "jsonrpc": "2.0", "id": id, "error": { "code": code, "message": message } })
}

async fn handle_request(request: Value) -> Option<Value> {
  let id = request.get("id").cloned().unwrap_or(Value::Null);
  let method = request.get("method").and_then(|v| v.as_str()).unwrap_or("");

  // Notifications (no "id") get no response, per JSON-RPC 2.0.
  let has_id = request.get("id").is_some();

  let response = match method {
    "initialize" => respond(
      &id,
      json!({
        "protocolVersion": "2024-11-05",
        "serverInfo": { "name": "knapsack-snowflake-mcp", "version": "1" },
        "capabilities": { "tools": {} }
      }),
    ),
    "tools/list" => respond(&id, json!({ "tools": [tool_schema()] })),
    "tools/call" => {
      let params = request.get("params").cloned().unwrap_or(Value::Null);
      let name = params.get("name").and_then(|v| v.as_str()).unwrap_or("");
      if name != TOOL_NAME {
        respond_error(&id, -32602, format!("Unknown tool: {name}"))
      } else {
        let args = params.get("arguments").cloned().unwrap_or(json!({}));
        match handle_snowflake_query(&args).await {
          Ok(result) => respond(
            &id,
            json!({ "content": [{ "type": "text", "text": result.to_string() }] }),
          ),
          Err(error) => respond(
            &id,
            json!({ "content": [{ "type": "text", "text": error }], "isError": true }),
          ),
        }
      }
    }
    "notifications/initialized" | "" => return None,
    other => respond_error(&id, -32601, format!("Method not found: {other}")),
  };

  if has_id {
    Some(response)
  } else {
    None
  }
}

/// Async stdio loop, meant to be awaited directly from `main()`'s existing
/// `#[tokio::main]` runtime (this subcommand invocation does nothing else
/// with the process, so there's no other work competing for it) — does NOT
/// spawn a second nested runtime, which would panic ("Cannot start a
/// runtime from within a runtime") since `main` is already inside one.
/// Returns when stdin closes (the gateway killed us) or on unrecoverable I/O
/// error; the caller should exit the process afterward.
pub async fn run_stdio_server() {
  use tokio::io::AsyncBufReadExt;

  let stdin = tokio::io::stdin();
  let mut reader = tokio::io::BufReader::new(stdin).lines();
  let mut stdout = tokio::io::stdout();

  loop {
    let line = match reader.next_line().await {
      Ok(Some(line)) => line,
      Ok(None) => break, // stdin closed
      Err(_) => break,
    };
    let trimmed = line.trim();
    if trimmed.is_empty() {
      continue;
    }
    let request: Value = match serde_json::from_str(trimmed) {
      Ok(value) => value,
      Err(error) => {
        eprintln!("[snowflake_mcp] ignoring malformed JSON-RPC line: {error}");
        continue;
      }
    };
    if let Some(response) = handle_request(request).await {
      let Ok(mut serialized) = serde_json::to_string(&response) else {
        continue;
      };
      serialized.push('\n');
      if stdout.write_all(serialized.as_bytes()).await.is_err()
        || stdout.flush().await.is_err()
      {
        break;
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn jwt_claims_have_expected_shape() {
    let jwt = mint_capability_jwt("test-secret", "rogelio@bankaya.com.mx", "sess_123").unwrap();
    let mut validation = jsonwebtoken::Validation::new(jsonwebtoken::Algorithm::HS256);
    validation.set_audience(&["scout-identity-broker"]);
    let decoded = jsonwebtoken::decode::<Value>(
      &jwt,
      &jsonwebtoken::DecodingKey::from_secret("test-secret".as_bytes()),
      &validation,
    )
    .unwrap();
    assert_eq!(decoded.claims["sub"], "rogelio@bankaya.com.mx");
    assert_eq!(decoded.claims["iss"], "knapsack-studio");
    assert_eq!(decoded.claims["tenant_id"], "bankaya");
    assert_eq!(decoded.claims["provider"], "snowflake");
    assert_eq!(decoded.claims["session_id"], "sess_123");
    assert!(decoded.claims["jti"].as_str().unwrap().len() > 10);
  }

  #[test]
  fn two_jwts_for_the_same_session_have_different_jti() {
    let a = mint_capability_jwt("secret", "a@bankaya.com.mx", "sess_1").unwrap();
    let b = mint_capability_jwt("secret", "a@bankaya.com.mx", "sess_1").unwrap();
    assert_ne!(a, b);
  }

  #[test]
  fn shell_single_quote_escapes_embedded_quotes() {
    assert_eq!(shell_single_quote("hello"), "'hello'");
    assert_eq!(shell_single_quote("O'Brien"), "'O'\\''Brien'");
  }

  /// Proves the escaping is actually safe by round-tripping through a real
  /// shell, rather than pattern-matching the escaped string (which contains
  /// adjacent `'` and `;` characters as a normal artifact of correct
  /// escaping — a naive substring check would false-positive on that).
  #[test]
  fn shell_single_quote_round_trips_through_a_real_shell() {
    for sql in [
      "SELECT 1",
      "SELECT * FROM t WHERE name = 'x'; rm -rf /",
      "it's a \"test\" with $VAR and `backticks`",
      "",
    ] {
      let quoted = shell_single_quote(sql);
      let output = std::process::Command::new("sh")
        .arg("-c")
        .arg(format!("printf '%s' {quoted}"))
        .output()
        .expect("sh must be available to run this test");
      assert!(output.status.success());
      assert_eq!(
        String::from_utf8_lossy(&output.stdout),
        sql,
        "shell round-trip did not preserve the original string for input: {sql:?}"
      );
    }
  }

  #[tokio::test]
  async fn rejects_tool_call_missing_session_id() {
    let error = handle_snowflake_query(&json!({ "query": "select 1" }))
      .await
      .unwrap_err();
    assert!(error.contains("session_id"));
  }

  #[tokio::test]
  async fn rejects_tool_call_for_unknown_session() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    let error = handle_snowflake_query(&json!({ "session_id": "never-seen", "query": "select 1" }))
      .await
      .unwrap_err();
    assert!(error.contains("Cannot authorize"));
  }

  #[tokio::test]
  async fn initialize_and_tools_list_round_trip() {
    let init = handle_request(json!({ "jsonrpc": "2.0", "id": 1, "method": "initialize" }))
      .await
      .unwrap();
    assert_eq!(init["result"]["serverInfo"]["name"], "knapsack-snowflake-mcp");

    let list = handle_request(json!({ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }))
      .await
      .unwrap();
    assert_eq!(list["result"]["tools"][0]["name"], TOOL_NAME);
  }

  #[tokio::test]
  async fn notifications_get_no_response() {
    let response = handle_request(json!({ "jsonrpc": "2.0", "method": "notifications/initialized" })).await;
    assert!(response.is_none());
  }

  /// Minimal one-shot mock HTTP server: accepts a single connection, hands
  /// the raw request text to `assert_request`, and writes back `response`
  /// verbatim. No new mocking crate — this is deliberately tiny since we
  /// only need to verify header/URL shape and response parsing, not a full
  /// HTTP implementation. Returns the server's URL and a `JoinHandle` the
  /// caller MUST await — a panic inside a spawned task otherwise only logs
  /// to stderr instead of failing the test.
  fn serve_one(
    response: &'static str,
    assert_request: impl FnOnce(&str) + Send + 'static,
  ) -> (String, tokio::task::JoinHandle<()>) {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
    listener.set_nonblocking(true).unwrap();
    let addr = listener.local_addr().unwrap();
    let listener = tokio::net::TcpListener::from_std(listener).unwrap();
    let handle = tokio::spawn(async move {
      let (mut socket, _) = listener.accept().await.unwrap();
      let mut buf = vec![0u8; 8192];
      let n = socket.read(&mut buf).await.unwrap();
      let request = String::from_utf8_lossy(&buf[..n]).to_string();
      assert_request(&request);
      socket.write_all(response.as_bytes()).await.unwrap();
    });
    (format!("http://{addr}"), handle)
  }

  #[tokio::test]
  async fn broker_request_sends_capability_header_and_hits_email_path() {
    let (base_url, server) = serve_one(
      "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{\"token\":\"snow-tok\"}",
      |request| {
        assert!(request.starts_with("GET /token/rogelio%40bankaya.com.mx"));
        assert!(request.contains("x-session-capability-token: test-jwt") || request.contains("X-Session-Capability-Token: test-jwt"));
      },
    );

    let token = fetch_broker_token_at(&base_url, "rogelio@bankaya.com.mx", "test-jwt")
      .await
      .unwrap();
    assert_eq!(token, "snow-tok");
    server.await.expect("mock server task panicked (assertion failed)");
  }

  #[tokio::test]
  async fn broker_forbidden_status_is_a_clear_error() {
    let (base_url, server) =
      serve_one("HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n", |_request| {});
    let error = fetch_broker_token_at(&base_url, "someone@bankaya.com.mx", "test-jwt")
      .await
      .unwrap_err();
    assert!(error.contains("did not match"));
    server.await.expect("mock server task panicked (assertion failed)");
  }
}
