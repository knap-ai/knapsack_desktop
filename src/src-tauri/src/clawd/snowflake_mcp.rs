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
//!   capability JWT sent to the broker.
//! - The broker's resulting Snowflake OAuth token is short-lived and
//!   single-use-`jti` per the broker contract. The query is issued over HTTPS
//!   from this process; it is never written to argv, a shell command line, or
//!   disk. (It formerly ran via `docker exec` inside the session's sandbox
//!   container — see `run_snowflake_statement` for why that path could never
//!   work and bought no additional protection.)
//!
//! DEVELOPMENT OVERRIDE (2026-08-11): every request is currently brokered as
//! a single fixed identity — see `DEV_FORCED_BROKER_EMAIL`. The verified-sender
//! gate above still applies, but the brokered identity does not vary per user,
//! so there is no per-user Snowflake isolation until that constant is `None`.
//!
//! ASSUMPTION FLAGGED: the broker's response shape (`{"token": "..."}`) and
//! the Snowflake account identifier (currently a placeholder constant) are
//! not yet confirmed against a live broker/Snowflake account — see the
//! `SNOWFLAKE_ACCOUNT` constant and `parse_broker_response` below.

use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Serialize;
use serde_json::{json, Value};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
// Needed by `run_stdio_server` for `stdout.write_all` / `flush`.
use tokio::io::AsyncWriteExt as _;

use super::service::read_session_capability_secret_headless;
use super::session_watcher::resolve_authorized_session;

const BROKER_BASE_URL: &str = "https://scout-oauth-web-ye3kc3evha-uk.a.run.app";
const TENANT_ID: &str = "bankaya";
/// Fallback only — the account host is normally read straight out of the
/// OAuth token (see `statements_url_from_token`). Confirmed from a live broker
/// token on 2026-08-11; the previous value here was the tenant name
/// (`bankaya`), which is NOT an account locator and 404'd.
const SNOWFLAKE_ACCOUNT: &str = "XLA65836.us-east-1";
/// Snowflake requires a non-empty User-Agent on SQL API requests.
const SNOWFLAKE_USER_AGENT: &str = "knapsack-desktop/1.0";
const JWT_TTL_SECS: u64 = 60;
const IDENTITY_WAIT_ATTEMPTS: usize = 12;
const IDENTITY_WAIT_INTERVAL: Duration = Duration::from_millis(500);

/// DEVELOPMENT OVERRIDE — broker every request as this one fixed identity,
/// whichever verified Slack sender actually triggered it.
///
/// The verified-sender gate still applies: a request with no verified Slack
/// identity on record is still refused (see `resolve_authorized_session`).
/// Only the identity handed to the token broker is overridden.
///
/// **This means any verified Slack sender gets this account's Snowflake
/// access — there is no per-user isolation while it is set.**
///
/// To move to per-user identity later, set this to `None`; the verified
/// sender's own email is then used and no other change is needed. The
/// `KNAPSACK_SNOWFLAKE_BROKER_EMAIL` env var overrides it at runtime, so
/// per-user behaviour can be exercised without a rebuild.
const DEV_FORCED_BROKER_EMAIL: Option<&str> = None;

/// Runtime-resolved override, env var taking precedence over the constant.
fn forced_broker_email() -> Option<String> {
  if let Ok(value) = std::env::var("KNAPSACK_SNOWFLAKE_BROKER_EMAIL") {
    let value = value.trim().to_string();
    if !value.is_empty() {
      return Some(value);
    }
  }
  DEV_FORCED_BROKER_EMAIL.map(|email| email.to_string())
}

/// The identity to broker as. Kept as one pure function used for BOTH the JWT
/// `sub` claim and the broker URL path: previously the URL hardcoded one email
/// while `sub` carried the verified sender's, and the broker rejected the
/// mismatch with HTTP 403 "sub did not match the requested email". Deriving
/// both from here makes that drift impossible.
fn resolve_broker_email<'a>(verified_email: &'a str, forced: Option<&'a str>) -> &'a str {
  forced.unwrap_or(verified_email)
}

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
  // Use the caller-supplied identity (percent-encoded — `@` is not valid
  // unescaped in a path segment). This previously hardcoded one address and
  // ignored the `email` argument entirely, which is what made `sub` and the
  // requested email disagree.
  let url = format!("{base_url}/token/{}", urlencoding::encode(email));
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

fn snowflake_statements_url() -> String {
  format!("https://{SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/statements")
}

/// Snowflake's OAuth token names the account host it was minted for, in its
/// own `aud`/`iss` claims (confirmed against a live broker token 2026-08-11:
/// `https://XLA65836.us-east-1.snowflakecomputing.com`). Prefer that over any
/// compiled-in guess — the previous hardcoded `bankaya` host does not exist and
/// Snowflake's edge answered with a 404 HTML error page.
///
/// Only `*.snowflakecomputing.com` is accepted: the token comes from our own
/// broker, but a claim is still attacker-influenceable input and must never be
/// able to redirect a bearer token to an arbitrary host.
fn statements_url_from_token(oauth_token: &str) -> Option<String> {
  let payload = oauth_token.split('.').nth(1)?;
  let decoded = base64::Engine::decode(
    &base64::engine::general_purpose::URL_SAFE_NO_PAD,
    payload.trim_end_matches('='),
  )
  .ok()?;
  let claims: Value = serde_json::from_slice(&decoded).ok()?;
  let base = ["aud", "iss"]
    .iter()
    .filter_map(|key| claims.get(*key).and_then(|value| value.as_str()))
    .find_map(|value| {
      let base = value.trim_end_matches('/');
      let host = base.strip_prefix("https://")?;
      // Reject anything that isn't a Snowflake host, and any embedded
      // path/credential/port trickery in the claim.
      if host.ends_with(".snowflakecomputing.com")
        && !host.contains('/')
        && !host.contains('@')
        && !host.contains(':')
      {
        Some(base.to_string())
      } else {
        None
      }
    })?;
  Some(format!("{base}/api/v2/statements"))
}

/// Run the statement directly over HTTPS from this process.
///
/// This previously shelled out to `docker exec` against the session's sandbox
/// container so the OAuth token would only ever exist inside that container.
/// That could not work, for two independent reasons found on 2026-08-11:
///
/// 1. Sandbox containers are created **lazily** by the gateway, only when a
///    sandboxed exec/fs tool actually needs one, and OpenClaw exposes no
///    "create" command (`openclaw sandbox recreate` only *removes* them, per
///    its own `--help`). A turn that only calls this MCP tool therefore has no
///    container at all — `openclaw sandbox list` reported `Total: 0`, with no
///    container ever created, running or stopped.
/// 2. This handler then called `recreate_sandbox_session_headless`, which
///    *removes* the container — so even a container that did exist would be
///    destroyed by the first query and unavailable to the next.
///
/// The container hop also bought no real protection here: this host process
/// fetches the token from the broker and necessarily holds it in memory
/// already, so piping it into a container does not keep it off the host. The
/// token remains short-lived and single-use-`jti` by the broker's contract,
/// and `SESSION_CAPABILITY_SECRET` still never leaves this process.
async fn run_snowflake_statement(oauth_token: &str, sql: &str) -> Result<Value, String> {
  let client = reqwest::Client::builder()
    .timeout(Duration::from_secs(90))
    // Snowflake's SQL API rejects a missing User-Agent outright:
    // `391903 Invalid or empty User-Agent header set: null` (reqwest sends
    // none by default).
    .user_agent(SNOWFLAKE_USER_AGENT)
    .build()
    .map_err(|error| format!("Unable to build Snowflake HTTP client: {error}"))?;
  let url = statements_url_from_token(oauth_token).unwrap_or_else(snowflake_statements_url);
  let response = client
    .post(&url)
    .bearer_auth(oauth_token)
    // The broker mints an OAuth access token (`"type": "OAT"`); without this
    // Snowflake interprets the bearer as the wrong credential type.
    .header("X-Snowflake-Authorization-Token-Type", "OAUTH")
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .json(&json!({ "statement": sql, "timeout": 60 }))
    .send()
    .await
    .map_err(|error| format!("Unable to reach Snowflake: {error}"))?;

  let status = response.status();
  let body = response
    .text()
    .await
    .map_err(|error| format!("Unable to read Snowflake response: {error}"))?;
  if !status.is_success() {
    // Surface Snowflake's own message — it is far more actionable than a
    // generic failure (unknown account, bad role/warehouse, SQL error, ...).
    return Err(format!(
      "Snowflake returned {status}: {}",
      body.trim().chars().take(600).collect::<String>()
    ));
  }
  serde_json::from_str(&body)
    .map_err(|error| format!("Snowflake returned a non-JSON response: {error}"))
}

async fn handle_snowflake_query(args: &Value) -> Result<Value, String> {
  // `session_id` is an optional hint only — see `resolve_authorized_session`.
  // Requiring it made every call fail: the model cannot know its own gateway
  // session id (it is never in its context) so it guessed its sandbox
  // directory name and was rejected every time.
  let session_id = args.get("session_id").and_then(|v| v.as_str());
  let query = args
    .get("query")
    .and_then(|v| v.as_str())
    .ok_or("Missing required argument: query")?;

  // The watcher polls the gateway, so a brand-new Slack DM session can reach
  // this tool a few seconds before its independently verified identity file is
  // written. Wait only for the "not yet present" case; ambiguity and corrupt
  // records still fail closed immediately.
  let mut authorized = None;
  let mut last_error = String::new();
  for attempt in 0..IDENTITY_WAIT_ATTEMPTS {
    match resolve_authorized_session(session_id) {
      Ok(identity) => {
        authorized = Some(identity);
        break;
      }
      Err(error) => {
        let retryable = error.contains("No verified Slack session on record");
        last_error = error;
        if !retryable || attempt + 1 == IDENTITY_WAIT_ATTEMPTS {
          break;
        }
        tokio::time::sleep(IDENTITY_WAIT_INTERVAL).await;
      }
    }
  }
  let (email, scope_key) = authorized
    .ok_or_else(|| format!("Cannot authorize this session for Snowflake access: {last_error}"))?;

  let secret = read_session_capability_secret_headless()?;
  // One value drives both the `sub` claim and the broker URL — see
  // `resolve_broker_email`.
  let forced = forced_broker_email();
  let broker_email = resolve_broker_email(&email, forced.as_deref());
  if broker_email != email {
    eprintln!(
      "[snowflake_mcp] dev override active: verified sender {email} brokered as {broker_email}"
    );
  }
  // Sign the RESOLVED scope key, never the model-supplied hint — the claim
  // must describe the session Knapsack actually verified.
  let jwt = mint_capability_jwt(&secret, broker_email, &scope_key)?;
  let oauth_token = fetch_broker_token(broker_email, &jwt).await?;

  // No sandbox-container teardown here any more: the token is never placed in
  // a container (see `run_snowflake_statement`), and the teardown this used to
  // perform actively *removed* the session's container — which is one of the
  // two reasons the container path could never work. Removing a live sandbox
  // out from under a running session is a side effect a read-only query has no
  // business having. `session_watcher` still does its own end-of-turn teardown.
  run_snowflake_statement(&oauth_token, query).await
}

// ── minimal MCP-over-stdio JSON-RPC framing ─────────────────────────────
// MCP's stdio transport is newline-delimited JSON-RPC 2.0 messages — one
// message per line on stdin/stdout. Only `initialize`, `tools/list`, and
// `tools/call` are implemented; that's the entire surface this server needs.

const TOOL_NAME: &str = "snowflake_query";

fn tool_schema() -> Value {
  json!({
    "name": TOOL_NAME,
    "description": "Run a SQL query against Snowflake. Access is already authenticated and authorized — Knapsack independently resolves the identity of the verified chat sender, so you do not supply, look up, or ask the user for any credentials, account name, warehouse, or session id. Just pass `query`.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": { "type": "string", "description": "The SQL statement to run." },
        "session_id": { "type": "string", "description": "Optional. Ignore unless you were explicitly given a Knapsack session id; it is only a hint and is never required." }
      },
      "required": ["query"]
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
      if stdout.write_all(serialized.as_bytes()).await.is_err() || stdout.flush().await.is_err() {
        break;
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  fn fake_oauth_token(claims: serde_json::Value) -> String {
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
    format!("header.{}.sig", URL_SAFE_NO_PAD.encode(claims.to_string()))
  }

  /// The 404 bug: the statements host must come from the token, not a guess.
  #[test]
  fn statements_url_is_taken_from_the_token_claims() {
    let token = fake_oauth_token(json!({
      "aud": "https://XLA65836.us-east-1.snowflakecomputing.com",
      "iss": "https://XLA65836.us-east-1.snowflakecomputing.com"
    }));
    assert_eq!(
      statements_url_from_token(&token).as_deref(),
      Some("https://XLA65836.us-east-1.snowflakecomputing.com/api/v2/statements")
    );
  }

  #[test]
  fn statements_url_falls_back_when_the_token_carries_no_host() {
    assert_eq!(statements_url_from_token("not-a-jwt"), None);
    assert_eq!(
      statements_url_from_token(&fake_oauth_token(json!({ "sub": "1" }))),
      None
    );
  }

  /// A bearer token must never be sent to a non-Snowflake host just because a
  /// claim said so.
  #[test]
  fn statements_url_rejects_non_snowflake_hosts() {
    for hostile in [
      "https://evil.example.com",
      "https://evil.com/x.snowflakecomputing.com",
      "https://user@evil.com",
      "http://XLA65836.us-east-1.snowflakecomputing.com",
    ] {
      let token = fake_oauth_token(json!({ "aud": hostile }));
      assert_eq!(
        statements_url_from_token(&token),
        None,
        "should have rejected {hostile}"
      );
    }
  }

  /// The 403 "sub did not match the requested email" bug: the URL and the JWT
  /// `sub` must always come from the same value.
  #[test]
  fn broker_email_override_applies_to_any_verified_sender() {
    assert_eq!(
      resolve_broker_email("daniel.ciolfi@ckl.io", Some("rogelio@bankaya.com.mx")),
      "rogelio@bankaya.com.mx"
    );
  }

  /// Setting `DEV_FORCED_BROKER_EMAIL` to `None` must be the only change
  /// needed to switch to per-user identity.
  #[test]
  fn without_an_override_the_verified_sender_is_used() {
    assert_eq!(
      resolve_broker_email("daniel.ciolfi@ckl.io", None),
      "daniel.ciolfi@ckl.io"
    );
  }

  #[test]
  fn dev_override_is_currently_the_fixed_development_identity() {
    std::env::remove_var("KNAPSACK_SNOWFLAKE_BROKER_EMAIL");
    assert_eq!(
      forced_broker_email().as_deref(),
      Some("rogelio@bankaya.com.mx")
    );
  }

  #[test]
  fn env_var_overrides_the_compiled_dev_identity() {
    std::env::set_var("KNAPSACK_SNOWFLAKE_BROKER_EMAIL", "someone.else@ckl.io");
    assert_eq!(
      forced_broker_email().as_deref(),
      Some("someone.else@ckl.io")
    );
    std::env::remove_var("KNAPSACK_SNOWFLAKE_BROKER_EMAIL");
  }

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

  #[tokio::test]
  async fn rejects_tool_call_missing_query() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    let error = handle_snowflake_query(&json!({})).await.unwrap_err();
    assert!(error.contains("query"), "unexpected error: {error}");
  }

  /// `session_id` is deliberately NOT required any more (the model cannot
  /// know it), but with no verified identity on record the call must still be
  /// refused rather than falling back to some default identity.
  #[tokio::test]
  async fn rejects_tool_call_when_no_verified_identity_exists() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    let error = handle_snowflake_query(&json!({ "query": "select 1" }))
      .await
      .unwrap_err();
    assert!(
      error.contains("Cannot authorize"),
      "unexpected error: {error}"
    );
  }

  #[tokio::test]
  async fn rejects_tool_call_for_unknown_session() {
    std::env::set_var("OPENCLAW_STATE_DIR", tempfile::tempdir().unwrap().path());
    let error = handle_snowflake_query(&json!({ "session_id": "never-seen", "query": "select 1" }))
      .await
      .unwrap_err();
    assert!(error.contains("Cannot authorize"));
  }

  /// The exact shape that failed in production on 2026-08-11: the model
  /// passed its sandbox workspace directory name as `session_id` because the
  /// real session id is not in its context. With one verified identity on
  /// record this must now succeed at the authorization step instead of
  /// dead-ending on "No verified identity on record".
  #[tokio::test]
  async fn wrong_model_supplied_session_id_still_authorizes_against_the_verified_record() {
    let tempdir = tempfile::tempdir().unwrap();
    std::env::set_var("OPENCLAW_STATE_DIR", tempdir.path());
    let dir = tempdir.path().join("snowflake-identities");
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(
      dir.join("f2abdfc8-real-session-id.json"),
      r#"{"email":"rogelio@bankaya.com.mx","scope_key":"agent:main:slack:default:direct:u0bpj321v9p"}"#,
    )
    .unwrap();

    let error = handle_snowflake_query(&json!({
      "session_id": "agent-main-slack-default-direct--b1096950",
      "query": "select 1"
    }))
    .await
    .unwrap_err();
    assert!(
      !error.contains("Cannot authorize"),
      "authorization should have resolved via the verified record, got: {error}"
    );
  }

  #[tokio::test]
  async fn initialize_and_tools_list_round_trip() {
    let init = handle_request(json!({ "jsonrpc": "2.0", "id": 1, "method": "initialize" }))
      .await
      .unwrap();
    assert_eq!(
      init["result"]["serverInfo"]["name"],
      "knapsack-snowflake-mcp"
    );

    let list = handle_request(json!({ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }))
      .await
      .unwrap();
    assert_eq!(list["result"]["tools"][0]["name"], TOOL_NAME);
  }

  #[tokio::test]
  async fn notifications_get_no_response() {
    let response =
      handle_request(json!({ "jsonrpc": "2.0", "method": "notifications/initialized" })).await;
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
    server
      .await
      .expect("mock server task panicked (assertion failed)");
  }

  #[tokio::test]
  async fn broker_forbidden_status_is_a_clear_error() {
    let (base_url, server) = serve_one(
      "HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n",
      |_request| {},
    );
    let error = fetch_broker_token_at(&base_url, "someone@bankaya.com.mx", "test-jwt")
      .await
      .unwrap_err();
    assert!(error.contains("did not match"));
    server
      .await
      .expect("mock server task panicked (assertion failed)");
  }
}
