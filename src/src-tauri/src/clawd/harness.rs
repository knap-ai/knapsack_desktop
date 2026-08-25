use actix_web::{get, post, web, HttpResponse, Responder};
use futures::future::try_join_all;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;
use url::Url;

use crate::clawd::gateway_client;

const DEFAULT_HERMES_BASE_URL: &str = "http://127.0.0.1:8642/v1";
const DEFAULT_HERMES_MODEL: &str = "hermes-agent";
// Group rooms can spawn several independent agents and wait for synthesis.
// Keep this aligned with the frontend agent-chat budget so the harness does
// not abandon orchestration and silently fall back to a single direct model.
// Leave a small transport/UI buffer inside the frontend's 300-second budget.
// Every OpenClaw phase shares this one deadline.
const HARNESS_TIMEOUT: Duration = Duration::from_secs(285);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AgentHarnessKind {
  OpenClaw,
  Hermes,
}

impl AgentHarnessKind {
  pub fn as_str(self) -> &'static str {
    match self {
      Self::OpenClaw => "openclaw",
      Self::Hermes => "hermes",
    }
  }
}

#[derive(Debug)]
pub struct HarnessRequest<'a> {
  pub message: &'a str,
  pub attachments: &'a [Value],
  pub conversation_scope: Option<&'a str>,
  pub session_id: &'a str,
  pub team_members: &'a [TeamMember],
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TeamMember {
  pub id: String,
  pub name: String,
  #[serde(default)]
  pub personality: String,
  #[serde(default)]
  pub soul: String,
  #[serde(default)]
  pub browser_profile: String,
}

#[derive(Debug)]
pub struct HarnessReply {
  pub reply: String,
  pub harness: AgentHarnessKind,
}

#[derive(Debug, Clone)]
struct HermesConfig {
  base_url: String,
  api_key: String,
  model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct StoredHarnessSettings {
  #[serde(default = "default_harness_name")]
  harness: String,
  #[serde(default = "default_hermes_base_url")]
  hermes_base_url: String,
  #[serde(default)]
  hermes_api_key: Option<String>,
  #[serde(default = "default_hermes_model")]
  hermes_model: String,
}

impl Default for StoredHarnessSettings {
  fn default() -> Self {
    Self {
      harness: default_harness_name(),
      hermes_base_url: default_hermes_base_url(),
      hermes_api_key: None,
      hermes_model: default_hermes_model(),
    }
  }
}

#[derive(Debug, Deserialize)]
pub struct HarnessSettingsRequest {
  harness: String,
  #[serde(default)]
  hermes_base_url: Option<String>,
  #[serde(default)]
  hermes_api_key: Option<String>,
  #[serde(default)]
  hermes_model: Option<String>,
}

#[derive(Debug, Serialize)]
struct HermesProbe {
  status: &'static str,
  message: String,
}

fn default_harness_name() -> String {
  "openclaw".to_string()
}

fn default_hermes_base_url() -> String {
  DEFAULT_HERMES_BASE_URL.to_string()
}

fn default_hermes_model() -> String {
  DEFAULT_HERMES_MODEL.to_string()
}

fn settings_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
  app_handle
    .path_resolver()
    .app_data_dir()
    .map(|directory| directory.join("agent-harness.json"))
    .ok_or_else(|| "Could not resolve the Knapsack application data directory".to_string())
}

fn load_settings(app_handle: &tauri::AppHandle) -> Result<StoredHarnessSettings, String> {
  let path = settings_path(app_handle)?;
  if path.exists() {
    let raw = fs::read_to_string(&path)
      .map_err(|error| format!("Could not read agent harness settings: {error}"))?;
    return serde_json::from_str(&raw)
      .map_err(|error| format!("Could not parse agent harness settings: {error}"));
  }

  Ok(StoredHarnessSettings {
    harness: std::env::var("KNAPSACK_AGENT_HARNESS").unwrap_or_else(|_| default_harness_name()),
    hermes_base_url: std::env::var("KNAPSACK_HERMES_BASE_URL")
      .unwrap_or_else(|_| default_hermes_base_url()),
    hermes_api_key: std::env::var("KNAPSACK_HERMES_API_KEY")
      .ok()
      .filter(|value| !value.trim().is_empty()),
    hermes_model: std::env::var("KNAPSACK_HERMES_MODEL").unwrap_or_else(|_| default_hermes_model()),
  })
}

fn save_settings(
  app_handle: &tauri::AppHandle,
  settings: &StoredHarnessSettings,
) -> Result<(), String> {
  let path = settings_path(app_handle)?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent)
      .map_err(|error| format!("Could not create the settings directory: {error}"))?;
  }
  let serialized = serde_json::to_string_pretty(settings)
    .map_err(|error| format!("Could not serialize agent harness settings: {error}"))?;
  fs::write(&path, serialized)
    .map_err(|error| format!("Could not save agent harness settings: {error}"))?;
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(&path, fs::Permissions::from_mode(0o600))
      .map_err(|error| format!("Could not secure agent harness settings: {error}"))?;
  }
  Ok(())
}

pub fn parse_harness_kind(raw: Option<&str>) -> Result<AgentHarnessKind, String> {
  match raw
    .unwrap_or("openclaw")
    .trim()
    .to_ascii_lowercase()
    .as_str()
  {
    "" | "openclaw" | "clawdbot" => Ok(AgentHarnessKind::OpenClaw),
    "hermes" => Ok(AgentHarnessKind::Hermes),
    other => Err(format!(
      "Unsupported agent harness '{other}'. Expected 'openclaw' or 'hermes'."
    )),
  }
}

pub fn selected_harness(app_handle: &tauri::AppHandle) -> Result<AgentHarnessKind, String> {
  let settings = load_settings(app_handle)?;
  parse_harness_kind(Some(&settings.harness))
}

pub async fn run_selected(
  app_handle: &tauri::AppHandle,
  request: HarnessRequest<'_>,
) -> Result<HarnessReply, String> {
  let settings = load_settings(app_handle)?;
  let harness = parse_harness_kind(Some(&settings.harness))?;
  let reply = match harness {
    AgentHarnessKind::OpenClaw => run_openclaw(&request).await?,
    AgentHarnessKind::Hermes => run_hermes(&request, hermes_config(&settings)?).await?,
  };
  Ok(HarnessReply { reply, harness })
}

async fn run_openclaw(request: &HarnessRequest<'_>) -> Result<String, String> {
  if !gateway_client::is_gateway_port_open().await {
    return Err("OpenClaw gateway is not reachable".to_string());
  }

  if request.team_members.len() >= 2 {
    return run_openclaw_group(request).await;
  }

  let session_key = openclaw_session_key(request.session_id);
  let deadline = tokio::time::Instant::now() + HARNESS_TIMEOUT;
  let existing_children = openclaw_child_session_keys(&session_key).await?;
  let result = tokio::time::timeout(
    remaining_until(deadline)?,
    gateway_client::agent_chat(
      request.message,
      request.attachments,
      None,
      request.conversation_scope,
      Some(&session_key),
    ),
  )
  .await
  .map_err(|_| format!("OpenClaw timed out after {HARNESS_TIMEOUT:?}"))??;

  match parse_openclaw_reply(&result) {
    Ok(reply) => Ok(reply),
    Err(error) if error == "OpenClaw returned an empty reply" => {
      let contributions =
        collect_openclaw_subagent_results(&session_key, &existing_children, deadline).await?;
      synthesize_openclaw_group_reply(request, &session_key, &contributions, deadline).await
    }
    Err(error) => Err(error),
  }
}

const MAX_GROUP_MEMBERS: usize = 8;

async fn run_openclaw_group(request: &HarnessRequest<'_>) -> Result<String, String> {
  let parent_session_key = openclaw_session_key(request.session_id);
  let deadline = tokio::time::Instant::now() + HARNESS_TIMEOUT;
  let members = request
    .team_members
    .iter()
    .take(MAX_GROUP_MEMBERS)
    .collect::<Vec<_>>();

  let calls = members.iter().map(|member| {
    let prompt = openclaw_group_member_prompt(member, request.message);
    let session_key = openclaw_group_member_session_key(&parent_session_key, &member.id);
    async move {
      let result = tokio::time::timeout(
        remaining_until(deadline)?,
        gateway_client::agent_chat(&prompt, request.attachments, None, None, Some(&session_key)),
      )
      .await
      .map_err(|_| format!("{} did not finish before the group deadline", member.name))??;
      let reply = parse_openclaw_reply(&result)
        .map_err(|error| format!("{} could not contribute: {error}", member.name))?;
      Ok::<(String, String), String>((member.name.clone(), reply))
    }
  });

  let contributions = try_join_all(calls).await?;

  synthesize_openclaw_group_reply(request, &parent_session_key, &contributions, deadline).await
}

fn openclaw_group_member_session_key(parent_session_key: &str, member_id: &str) -> String {
  format!("{parent_session_key}:member:{}", safe_session_id(member_id))
}

fn openclaw_group_member_prompt(member: &TeamMember, request: &str) -> String {
  let browser_instruction = if member.browser_profile.trim().is_empty() {
    String::new()
  } else {
    format!(
      " When browser work is useful, use only browser profile {:?}.",
      member.browser_profile.trim()
    )
  };
  format!(
    "You are {} in a Knapsack group room. Your role is: {}. {} Work independently and provide your own concise, evidence-based contribution to the user's request. Return that contribution as plain text even if another teammate will synthesize it later. Never answer with NO_REPLY. Do not spawn agents, call sessions_spawn, or yield this turn.{}\n\nUser request and trusted Knapsack context:\n{}",
    member.name.trim(),
    member.personality.trim(),
    member.soul.trim(),
    browser_instruction,
    request
  )
}

const OPENCLAW_FOLLOWUP_TIMEOUT: Duration = Duration::from_secs(120);

fn remaining_until(deadline: tokio::time::Instant) -> Result<Duration, String> {
  deadline
    .checked_duration_since(tokio::time::Instant::now())
    .filter(|remaining| !remaining.is_zero())
    .ok_or_else(|| "OpenClaw orchestration exceeded its overall deadline".to_string())
}

async fn openclaw_child_session_keys(session_key: &str) -> Result<HashSet<String>, String> {
  let sessions = gateway_client::sessions_list(None, 500).await?;
  Ok(
    sessions
      .get("sessions")
      .and_then(Value::as_array)
      .into_iter()
      .flatten()
      .filter(|session| session.get("spawnedBy").and_then(Value::as_str) == Some(session_key))
      .filter_map(|session| session.get("key").and_then(Value::as_str))
      .map(str::to_string)
      .collect(),
  )
}

async fn collect_openclaw_subagent_results(
  session_key: &str,
  existing_children: &HashSet<String>,
  overall_deadline: tokio::time::Instant,
) -> Result<Vec<(String, String)>, String> {
  let deadline = (tokio::time::Instant::now() + OPENCLAW_FOLLOWUP_TIMEOUT).min(overall_deadline);
  let mut delay = Duration::from_millis(250);

  loop {
    match gateway_client::sessions_list(None, 500).await {
      Ok(sessions) => {
        let children = new_child_sessions(&sessions, session_key, existing_children);
        if children.len() >= 2 && children.iter().all(|child| child.1 == "done") {
          let mut contributions = Vec::with_capacity(children.len());
          for (key, _) in children {
            let history = gateway_client::chat_history(&key, None, 100).await?;
            let reply = latest_assistant_after_last_user(&history)
              .ok_or_else(|| format!("OpenClaw child session {key} completed without a reply"))?;
            contributions.push((key, reply));
          }
          return Ok(contributions);
        }
      }
      Err(error) => {
        eprintln!("[harness] Could not inspect yielded OpenClaw children yet: {error}");
      }
    }

    if tokio::time::Instant::now() >= deadline {
      return Err("OpenClaw child agents did not finish in time".to_string());
    }
    tokio::time::sleep(delay).await;
    delay = (delay * 2).min(Duration::from_secs(2));
  }
}

fn new_child_sessions(
  sessions: &Value,
  parent_key: &str,
  existing_children: &HashSet<String>,
) -> Vec<(String, String)> {
  sessions
    .get("sessions")
    .and_then(Value::as_array)
    .into_iter()
    .flatten()
    .filter(|session| session.get("spawnedBy").and_then(Value::as_str) == Some(parent_key))
    .filter_map(|session| {
      let key = session.get("key")?.as_str()?;
      if existing_children.contains(key) {
        return None;
      }
      Some((
        key.to_string(),
        session
          .get("status")
          .and_then(Value::as_str)
          .unwrap_or("unknown")
          .to_string(),
      ))
    })
    .collect()
}

async fn synthesize_openclaw_group_reply(
  request: &HarnessRequest<'_>,
  parent_session_key: &str,
  contributions: &[(String, String)],
  deadline: tokio::time::Instant,
) -> Result<String, String> {
  let prompt = openclaw_group_synthesis_prompt(request.message, contributions);
  let synthesis_key = format!("{parent_session_key}:synthesis");
  let result = tokio::time::timeout(
    remaining_until(deadline)?,
    gateway_client::agent_chat(
      &prompt,
      request.attachments,
      None,
      None,
      Some(&synthesis_key),
    ),
  )
  .await
  .map_err(|_| "OpenClaw synthesis exceeded the overall orchestration deadline".to_string())??;
  parse_openclaw_reply(&result)
}

fn openclaw_group_synthesis_prompt(
  original_request: &str,
  contributions: &[(String, String)],
) -> String {
  let contributions_text = contributions
    .iter()
    .map(|(name, reply)| {
      let capped = if reply.chars().count() > 8_000 {
        reply.chars().take(8_000).collect::<String>()
      } else {
        reply.clone()
      };
      format!("{}:\n{}", name, capped)
    })
    .collect::<Vec<_>>()
    .join("\n\n");
  let prompt = format!(
    "You are the lead agent for a Knapsack group room. The selected child agents have already completed their one independent turn. This is the only synthesis pass: do not call tools, spawn more agents, ask contributors follow-up questions, or start another round. Synthesize their contributions into one concise, user-facing answer that directly answers the original request. Preserve meaningful disagreements and do not mention internal orchestration.\n\nOriginal request:\n{}\n\nContributions:\n{}",
    original_request, contributions_text
  );
  prompt
}

fn latest_assistant_after_last_user(history: &Value) -> Option<String> {
  let messages = history.get("messages")?.as_array()?;
  let last_user = messages
    .iter()
    .rposition(|message| message.get("role").and_then(Value::as_str) == Some("user"))?;

  messages[last_user + 1..]
    .iter()
    .rev()
    .find(|message| message.get("role").and_then(Value::as_str) == Some("assistant"))
    .and_then(message_text)
    .filter(|text| !text.trim().is_empty())
}

fn message_text(message: &Value) -> Option<String> {
  if let Some(text) = message.get("text").and_then(Value::as_str) {
    return Some(text.to_string());
  }
  if let Some(text) = message.get("content").and_then(Value::as_str) {
    return Some(text.to_string());
  }

  let text = message
    .get("content")
    .and_then(Value::as_array)?
    .iter()
    .filter(|part| part.get("type").and_then(Value::as_str) == Some("text"))
    .filter_map(|part| part.get("text").and_then(Value::as_str))
    .collect::<Vec<_>>()
    .join("\n\n");
  Some(text)
}

fn hermes_config(settings: &StoredHarnessSettings) -> Result<HermesConfig, String> {
  let base_url = settings.hermes_base_url.trim().to_string();
  validate_hermes_base_url(&base_url)?;

  let api_key = settings
    .hermes_api_key
    .clone()
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty())
    .ok_or_else(|| {
      "Hermes requires KNAPSACK_HERMES_API_KEY; it must match Hermes API_SERVER_KEY".to_string()
    })?;
  let model = settings.hermes_model.trim().to_string();
  let model = if model.is_empty() {
    default_hermes_model()
  } else {
    model
  };

  Ok(HermesConfig {
    base_url: base_url.trim_end_matches('/').to_string(),
    api_key,
    model,
  })
}

fn validate_hermes_base_url(raw: &str) -> Result<(), String> {
  let parsed =
    Url::parse(raw.trim()).map_err(|_| "Invalid KNAPSACK_HERMES_BASE_URL".to_string())?;
  if !parsed.username().is_empty()
    || parsed.password().is_some()
    || parsed.query().is_some()
    || parsed.fragment().is_some()
  {
    return Err(
      "KNAPSACK_HERMES_BASE_URL cannot contain credentials, query parameters, or a fragment"
        .to_string(),
    );
  }

  let loopback = parsed
    .host_str()
    .map(|host| host.eq_ignore_ascii_case("localhost") || host == "127.0.0.1" || host == "::1")
    .unwrap_or(false);
  if parsed.scheme() != "https" && !(parsed.scheme() == "http" && loopback) {
    return Err("KNAPSACK_HERMES_BASE_URL must use HTTPS unless it points to loopback".to_string());
  }
  Ok(())
}

fn hermes_responses_url(base_url: &str) -> String {
  let base = base_url.trim_end_matches('/');
  if base.ends_with("/v1") {
    format!("{base}/responses")
  } else {
    format!("{base}/v1/responses")
  }
}

fn hermes_detailed_health_url(base_url: &str) -> String {
  let base = base_url.trim_end_matches('/');
  let root = base.strip_suffix("/v1").unwrap_or(base);
  format!("{root}/health/detailed")
}

async fn probe_hermes(config: &HermesConfig) -> HermesProbe {
  let client = match reqwest::Client::builder()
    .timeout(Duration::from_secs(5))
    .build()
  {
    Ok(client) => client,
    Err(error) => {
      return HermesProbe {
        status: "offline",
        message: format!("Could not initialize the Hermes health check: {error}"),
      }
    }
  };

  let response = match client
    .get(hermes_detailed_health_url(&config.base_url))
    .bearer_auth(&config.api_key)
    .send()
    .await
  {
    Ok(response) => response,
    Err(_) => {
      return HermesProbe {
        status: "offline",
        message: "Hermes is not running or cannot be reached at this address.".to_string(),
      }
    }
  };

  if response.status() == reqwest::StatusCode::UNAUTHORIZED
    || response.status() == reqwest::StatusCode::FORBIDDEN
  {
    return HermesProbe {
      status: "needs_configuration",
      message: "The API key does not match the Hermes API_SERVER_KEY.".to_string(),
    };
  }
  if !response.status().is_success() {
    return HermesProbe {
      status: "needs_configuration",
      message: format!(
        "Hermes returned HTTP {} from its readiness check.",
        response.status()
      ),
    };
  }

  let body = match response.json::<Value>().await {
    Ok(body) => body,
    Err(_) => {
      return HermesProbe {
        status: "needs_configuration",
        message: "Hermes returned an unreadable readiness response.".to_string(),
      }
    }
  };
  let status = body
    .get("status")
    .and_then(Value::as_str)
    .unwrap_or("unknown");
  if matches!(
    status.to_ascii_lowercase().as_str(),
    "ok" | "healthy" | "ready"
  ) {
    HermesProbe {
      status: "connected",
      message: "Hermes is connected and ready.".to_string(),
    }
  } else {
    HermesProbe {
      status: "needs_configuration",
      message: "Hermes is reachable but its model provider or runtime is not ready.".to_string(),
    }
  }
}

fn updated_settings(
  current: StoredHarnessSettings,
  request: HarnessSettingsRequest,
) -> Result<StoredHarnessSettings, String> {
  let harness = parse_harness_kind(Some(&request.harness))?;
  let hermes_base_url = request
    .hermes_base_url
    .unwrap_or(current.hermes_base_url)
    .trim()
    .to_string();
  if harness == AgentHarnessKind::Hermes {
    validate_hermes_base_url(&hermes_base_url)?;
  }
  let supplied_key = request
    .hermes_api_key
    .map(|key| key.trim().to_string())
    .filter(|key| !key.is_empty());
  let hermes_api_key = supplied_key.or(current.hermes_api_key);
  let hermes_model = request
    .hermes_model
    .unwrap_or(current.hermes_model)
    .trim()
    .to_string();

  Ok(StoredHarnessSettings {
    harness: harness.as_str().to_string(),
    hermes_base_url,
    hermes_api_key,
    hermes_model: if hermes_model.is_empty() {
      default_hermes_model()
    } else {
      hermes_model
    },
  })
}

fn public_settings(settings: &StoredHarnessSettings) -> Value {
  json!({
    "success": true,
    "harness": settings.harness,
    "hermes_base_url": settings.hermes_base_url,
    "hermes_model": settings.hermes_model,
    "has_hermes_api_key": settings.hermes_api_key.as_ref().is_some_and(|key| !key.trim().is_empty()),
  })
}

#[get("/api/clawd/harness/settings")]
pub async fn get_harness_settings(app_handle: web::Data<tauri::AppHandle>) -> impl Responder {
  match load_settings(app_handle.get_ref()) {
    Ok(settings) => HttpResponse::Ok().json(public_settings(&settings)),
    Err(error) => HttpResponse::InternalServerError().json(json!({
      "success": false,
      "message": error,
    })),
  }
}

#[post("/api/clawd/harness/test")]
pub async fn test_harness_settings(
  app_handle: web::Data<tauri::AppHandle>,
  body: web::Json<HarnessSettingsRequest>,
) -> impl Responder {
  let current = match load_settings(app_handle.get_ref()) {
    Ok(settings) => settings,
    Err(error) => {
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "status": "needs_configuration",
        "message": error,
      }))
    }
  };
  let settings = match updated_settings(current, body.into_inner()) {
    Ok(settings) => settings,
    Err(error) => {
      return HttpResponse::BadRequest().json(json!({
        "success": false,
        "status": "needs_configuration",
        "message": error,
      }))
    }
  };
  let config = match hermes_config(&settings) {
    Ok(config) => config,
    Err(error) => {
      return HttpResponse::BadRequest().json(json!({
        "success": false,
        "status": "needs_configuration",
        "message": error,
      }))
    }
  };
  let probe = probe_hermes(&config).await;
  HttpResponse::Ok().json(json!({
    "success": probe.status == "connected",
    "status": probe.status,
    "message": probe.message,
  }))
}

#[post("/api/clawd/harness/settings")]
pub async fn set_harness_settings(
  app_handle: web::Data<tauri::AppHandle>,
  body: web::Json<HarnessSettingsRequest>,
) -> impl Responder {
  let current = match load_settings(app_handle.get_ref()) {
    Ok(settings) => settings,
    Err(error) => {
      return HttpResponse::InternalServerError().json(json!({
        "success": false,
        "message": error,
      }))
    }
  };
  let settings = match updated_settings(current, body.into_inner()) {
    Ok(settings) => settings,
    Err(error) => {
      return HttpResponse::BadRequest().json(json!({
        "success": false,
        "message": error,
      }))
    }
  };

  if settings.harness == AgentHarnessKind::Hermes.as_str() {
    let config = match hermes_config(&settings) {
      Ok(config) => config,
      Err(error) => {
        return HttpResponse::BadRequest().json(json!({
          "success": false,
          "status": "needs_configuration",
          "message": error,
        }))
      }
    };
    let probe = probe_hermes(&config).await;
    if probe.status != "connected" {
      return HttpResponse::BadRequest().json(json!({
        "success": false,
        "status": probe.status,
        "message": probe.message,
      }));
    }
  }

  match save_settings(app_handle.get_ref(), &settings) {
    Ok(()) => HttpResponse::Ok().json(public_settings(&settings)),
    Err(error) => HttpResponse::InternalServerError().json(json!({
      "success": false,
      "message": error,
    })),
  }
}

fn safe_session_id(raw: &str) -> String {
  let normalized = raw
    .chars()
    .map(|ch| {
      if ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | ':' | '.') {
        ch
      } else {
        '-'
      }
    })
    .take(128)
    .collect::<String>();
  if normalized.is_empty() {
    "ui".to_string()
  } else {
    normalized
  }
}

fn openclaw_session_key(session_id: &str) -> String {
  format!("agent:main:webchat:dm:{}", safe_session_id(session_id))
}

fn hermes_input(request: &HarnessRequest<'_>) -> Value {
  if request.attachments.is_empty() {
    return Value::String(request.message.to_string());
  }

  let mut content = vec![json!({"type": "input_text", "text": request.message})];
  for attachment in request.attachments {
    if let Some(data_url) = attachment.get("content").and_then(Value::as_str) {
      if data_url.starts_with("data:image/") {
        content.push(json!({"type": "input_image", "image_url": data_url}));
      }
    }
  }
  json!([{"role": "user", "content": content}])
}

async fn run_hermes(request: &HarnessRequest<'_>, config: HermesConfig) -> Result<String, String> {
  let session_id = safe_session_id(request.session_id);
  let request_body = json!({
    "model": config.model,
    "input": hermes_input(request),
    "conversation": format!("knapsack-{session_id}"),
    "store": true,
  });
  let response = reqwest::Client::builder()
    .timeout(HARNESS_TIMEOUT)
    .build()
    .map_err(|error| format!("Failed to initialize Hermes client: {error}"))?
    .post(hermes_responses_url(&config.base_url))
    .bearer_auth(&config.api_key)
    .header(
      "X-Hermes-Session-Key",
      format!("agent:main:knapsack:dm:{session_id}"),
    )
    .json(&request_body)
    .send()
    .await
    .map_err(|error| format!("Hermes request failed: {error}"))?;

  let status = response.status();
  let body = response
    .json::<Value>()
    .await
    .map_err(|error| format!("Hermes returned an invalid response: {error}"))?;
  if !status.is_success() {
    let message = body
      .pointer("/error/message")
      .or_else(|| body.get("message"))
      .and_then(Value::as_str)
      .unwrap_or("unknown error");
    return Err(format!("Hermes returned HTTP {status}: {message}"));
  }

  parse_hermes_reply(&body)
}

fn parse_hermes_reply(body: &Value) -> Result<String, String> {
  if let Some(text) = body.get("output_text").and_then(Value::as_str) {
    if !text.trim().is_empty() {
      return Ok(text.to_string());
    }
  }

  let text = body
    .get("output")
    .and_then(Value::as_array)
    .into_iter()
    .flatten()
    .filter(|item| item.get("type").and_then(Value::as_str) == Some("message"))
    .flat_map(|item| {
      item
        .get("content")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    })
    .filter(|part| part.get("type").and_then(Value::as_str) == Some("output_text"))
    .filter_map(|part| part.get("text").and_then(Value::as_str))
    .collect::<Vec<_>>()
    .join("\n\n");

  if text.trim().is_empty() {
    Err("Hermes returned no assistant text".to_string())
  } else {
    Ok(text)
  }
}

fn parse_openclaw_reply(result: &Value) -> Result<String, String> {
  let status = result
    .get("status")
    .and_then(Value::as_str)
    .unwrap_or("unknown");
  let reply = result
    .pointer("/result/payloads")
    .and_then(Value::as_array)
    .map(|payloads| {
      payloads
        .iter()
        .filter_map(|payload| payload.get("text").and_then(Value::as_str))
        .map(parse_sse_payload_text)
        .collect::<Vec<_>>()
        .join("\n\n")
    })
    .unwrap_or_else(|| {
      result
        .get("summary")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string()
    });

  let trimmed = reply.trim();
  if gateway_run_failed(status) {
    return Err(format!("OpenClaw run ended with status {status}"));
  }
  if trimmed.is_empty() {
    return Err("OpenClaw returned an empty reply".to_string());
  }
  if is_gateway_execution_failure_reply(trimmed) {
    return Err("OpenClaw returned an execution failure".to_string());
  }
  let is_http_error = trimmed.len() >= 4
    && trimmed.as_bytes().get(3) == Some(&b' ')
    && trimmed[..3]
      .parse::<u16>()
      .map(|code| (300..=599).contains(&code))
      .unwrap_or(false);
  if is_http_error {
    return Err("OpenClaw returned an HTTP error reply".to_string());
  }
  if is_degraded_gateway_capability_reply(trimmed) {
    return Err("OpenClaw returned a degraded capability reply".to_string());
  }

  Ok(reply)
}

pub(crate) fn parse_sse_payload_text(raw: &str) -> String {
  if !raw.contains("data: ") {
    return raw.to_string();
  }

  let mut parts = Vec::new();
  for line in raw.lines() {
    let line = line.trim();
    if let Some(json_str) = line.strip_prefix("data: ") {
      let json_str = json_str.trim();
      if json_str == "[DONE]" {
        continue;
      }
      if let Ok(parsed) = serde_json::from_str::<Value>(json_str) {
        if let Some(choices) = parsed.get("choices").and_then(Value::as_array) {
          for choice in choices {
            if let Some(text) = choice
              .get("text")
              .and_then(Value::as_str)
              .or_else(|| choice.pointer("/delta/content").and_then(Value::as_str))
              .or_else(|| choice.pointer("/message/content").and_then(Value::as_str))
            {
              parts.push(text.to_string());
            }
          }
        } else if let Some(text) = parsed.get("text").and_then(Value::as_str) {
          parts.push(text.to_string());
        }
      } else {
        parts.push(json_str.to_string());
      }
    } else if !line.is_empty() && !line.starts_with(':') {
      parts.push(line.to_string());
    }
  }

  if parts.is_empty() {
    raw.to_string()
  } else {
    parts.join("")
  }
}

fn is_degraded_gateway_capability_reply(reply: &str) -> bool {
  let lower = reply.trim().to_lowercase().replace('`', "");
  if lower.is_empty() {
    return true;
  }
  if lower.contains("web_search tool") && lower.contains("disabled") {
    return true;
  }
  if lower.contains("web search tool") && lower.contains("disabled") {
    return true;
  }
  [
    "web_search tool is disabled",
    "web_search tool required",
    "web search tool is disabled",
    "web search tool required",
    "no provider is available",
    "don't have access to your email client",
    "do not have access to your email accounts",
    "do not have access to your email account",
    "don't have direct access to your email",
    "none of which include email access",
    "none of which include direct email access",
    "based on my memory.md",
    "i checked my memory.md",
    "my memory.md file",
    "browser is currently unavailable",
    "unable to perform web searches",
    "no direct email send capability available",
  ]
  .iter()
  .any(|needle| lower.contains(needle))
}

fn gateway_run_failed(status: &str) -> bool {
  matches!(
    status.trim().to_ascii_lowercase().as_str(),
    "failed" | "error" | "errored" | "cancelled" | "canceled" | "timed_out" | "timeout"
  )
}

fn is_gateway_execution_failure_reply(reply: &str) -> bool {
  let lower = reply.trim().to_lowercase().replace('`', "");
  [
    "json deserialize error",
    "unexpected end of hex escape",
    "invalid args",
    "missing required key",
    "cannot find module",
    "permission denied",
    "command not found",
    "message failed",
    "tool call validation failed",
  ]
  .iter()
  .any(|needle| lower.contains(needle))
}

#[cfg(test)]
mod tests {
  use super::*;
  use tokio::io::{AsyncReadExt, AsyncWriteExt};
  use tokio::net::TcpListener;

  fn request<'a>(attachments: &'a [Value]) -> HarnessRequest<'a> {
    HarnessRequest {
      message: "describe this",
      attachments,
      conversation_scope: None,
      session_id: "ui / primary",
      team_members: &[],
    }
  }

  #[test]
  fn harness_selection_defaults_to_openclaw_and_accepts_hermes() {
    assert_eq!(
      parse_harness_kind(None).unwrap(),
      AgentHarnessKind::OpenClaw
    );
    assert_eq!(
      parse_harness_kind(Some("clawdbot")).unwrap(),
      AgentHarnessKind::OpenClaw
    );
    assert_eq!(
      parse_harness_kind(Some(" HERMES ")).unwrap(),
      AgentHarnessKind::Hermes
    );
    assert!(parse_harness_kind(Some("unknown")).is_err());
  }
  #[test]
  fn hermes_url_only_allows_loopback_http_or_https() {
    assert!(validate_hermes_base_url("http://127.0.0.1:8642/v1").is_ok());
    assert!(validate_hermes_base_url("http://localhost:8642").is_ok());
    assert!(validate_hermes_base_url("https://hermes.example.com/v1").is_ok());
    assert!(validate_hermes_base_url("http://hermes.example.com/v1").is_err());
    assert!(validate_hermes_base_url("https://user:pass@example.com/v1").is_err());
  }

  #[test]
  fn hermes_endpoint_accepts_base_with_or_without_v1() {
    assert_eq!(
      hermes_responses_url("http://127.0.0.1:8642/v1"),
      "http://127.0.0.1:8642/v1/responses"
    );
    assert_eq!(
      hermes_responses_url("https://hermes.example.com"),
      "https://hermes.example.com/v1/responses"
    );
    assert_eq!(
      hermes_detailed_health_url("http://127.0.0.1:8642/v1"),
      "http://127.0.0.1:8642/health/detailed"
    );
  }

  #[test]
  fn settings_update_preserves_existing_key_when_the_ui_leaves_it_blank() {
    let current = StoredHarnessSettings {
      hermes_api_key: Some("saved-secret".to_string()),
      ..StoredHarnessSettings::default()
    };
    let updated = updated_settings(
      current,
      HarnessSettingsRequest {
        harness: "hermes".to_string(),
        hermes_base_url: Some("http://localhost:8642/v1".to_string()),
        hermes_api_key: Some("".to_string()),
        hermes_model: None,
      },
    )
    .unwrap();
    assert_eq!(updated.harness, "hermes");
    assert_eq!(updated.hermes_api_key.as_deref(), Some("saved-secret"));
    assert_eq!(
      public_settings(&updated).get("has_hermes_api_key"),
      Some(&json!(true))
    );
    assert!(public_settings(&updated).get("hermes_api_key").is_none());
  }

  #[test]
  fn switching_to_openclaw_allows_recovery_from_an_invalid_hermes_url() {
    let current = StoredHarnessSettings {
      harness: "hermes".to_string(),
      hermes_base_url: "http://remote-hermes.example.com/v1".to_string(),
      ..StoredHarnessSettings::default()
    };
    let updated = updated_settings(
      current,
      HarnessSettingsRequest {
        harness: "openclaw".to_string(),
        hermes_base_url: None,
        hermes_api_key: None,
        hermes_model: None,
      },
    )
    .unwrap();

    assert_eq!(updated.harness, "openclaw");
    assert_eq!(
      updated.hermes_base_url,
      "http://remote-hermes.example.com/v1"
    );
  }

  #[test]
  fn selecting_hermes_still_rejects_an_invalid_remote_url() {
    let result = updated_settings(
      StoredHarnessSettings::default(),
      HarnessSettingsRequest {
        harness: "hermes".to_string(),
        hermes_base_url: Some("http://remote-hermes.example.com/v1".to_string()),
        hermes_api_key: None,
        hermes_model: None,
      },
    );

    assert!(result.is_err());
  }

  #[test]
  fn hermes_input_preserves_text_and_inline_images() {
    let attachments = vec![json!({
      "fileName": "screen.png",
      "mimeType": "image/png",
      "content": "data:image/png;base64,AAAA"
    })];
    let input = hermes_input(&request(&attachments));
    assert_eq!(
      input.pointer("/0/content/0/type"),
      Some(&json!("input_text"))
    );
    assert_eq!(
      input.pointer("/0/content/1/image_url"),
      Some(&json!("data:image/png;base64,AAAA"))
    );
  }

  #[test]
  fn hermes_reply_extracts_responses_api_output() {
    let body = json!({
      "output": [{
        "type": "message",
        "role": "assistant",
        "content": [
          {"type": "output_text", "text": "first"},
          {"type": "output_text", "text": "second"}
        ]
      }]
    });
    assert_eq!(parse_hermes_reply(&body).unwrap(), "first\n\nsecond");
    assert!(parse_hermes_reply(&json!({"output": []})).is_err());
  }

  #[test]
  fn openclaw_reply_rejects_failed_or_degraded_results() {
    assert_eq!(
      parse_openclaw_reply(&json!({
        "status": "completed",
        "result": {"payloads": [{"text": "hello"}]}
      }))
      .unwrap(),
      "hello"
    );
    assert!(parse_openclaw_reply(&json!({
      "status": "failed",
      "summary": "nope"
    }))
    .is_err());
    assert!(parse_openclaw_reply(&json!({
      "status": "completed",
      "summary": "Browser is currently unavailable"
    }))
    .is_err());
    assert!(parse_openclaw_reply(&json!({
      "status": "completed",
      "summary": "The `web_search` tool has been disabled by policy"
    }))
    .is_err());
  }

  #[test]
  fn yielded_openclaw_history_returns_only_a_new_assistant_reply() {
    let history = json!({
      "messages": [
        {"role": "user", "content": [{"type": "text", "text": "old request"}]},
        {"role": "assistant", "content": [{"type": "text", "text": "old reply"}]},
        {"role": "user", "content": [{"type": "text", "text": "group request"}]},
        {"role": "assistant", "content": [
          {"type": "text", "text": "Scout and Polly agree"},
          {"type": "text", "text": "with one caveat"}
        ]}
      ]
    });
    assert_eq!(
      latest_assistant_after_last_user(&history).as_deref(),
      Some("Scout and Polly agree\n\nwith one caveat")
    );

    let still_waiting = json!({
      "messages": [
        {"role": "assistant", "text": "stale reply"},
        {"role": "user", "text": "new group request"}
      ]
    });
    assert_eq!(latest_assistant_after_last_user(&still_waiting), None);
  }

  #[test]
  fn yielded_openclaw_collection_ignores_old_children_and_waits_for_all_new_ones() {
    let sessions = json!({
      "sessions": [
        {"key": "old", "spawnedBy": "parent", "status": "done"},
        {"key": "scout", "spawnedBy": "parent", "status": "done"},
        {"key": "polly", "spawnedBy": "parent", "status": "running"},
        {"key": "other", "spawnedBy": "another-parent", "status": "done"}
      ]
    });
    let existing = HashSet::from(["old".to_string()]);
    let children = new_child_sessions(&sessions, "parent", &existing);
    assert_eq!(
      children,
      vec![
        ("scout".to_string(), "done".to_string()),
        ("polly".to_string(), "running".to_string())
      ]
    );
    assert!(!children.iter().all(|child| child.1 == "done"));
  }

  #[test]
  fn session_ids_are_bounded_and_header_safe() {
    assert_eq!(safe_session_id("ui / primary"), "ui---primary");
    assert_eq!(safe_session_id("\r\n"), "--");
    assert_eq!(safe_session_id(""), "ui");
    assert!(safe_session_id(&"a".repeat(300)).len() <= 128);
  }

  #[test]
  fn openclaw_agent_chats_use_distinct_stable_session_keys() {
    assert_eq!(
      openclaw_session_key("ui-agent-scout"),
      "agent:main:webchat:dm:ui-agent-scout"
    );
    assert_ne!(
      openclaw_session_key("ui-agent-scout"),
      openclaw_session_key("ui-agent-operator")
    );
  }

  #[test]
  fn group_members_use_stable_main_agent_sessions_without_runtime_agent_ids() {
    let member = TeamMember {
      id: "Atlas / Relationships".to_string(),
      name: "Atlas".to_string(),
      personality: "Relationship strategist".to_string(),
      soul: "Find the human context behind the request.".to_string(),
      browser_profile: "agent-atlas".to_string(),
    };
    let prompt = openclaw_group_member_prompt(&member, "How is my relationship with Mauricio?");

    assert!(prompt.contains("You are Atlas"));
    assert!(prompt.contains("Relationship strategist"));
    assert!(prompt.contains("agent-atlas"));
    assert!(prompt.contains("How is my relationship with Mauricio?"));
    assert!(prompt.contains("Do not spawn agents"));
    assert!(prompt.contains("Never answer with NO_REPLY"));
    assert!(!prompt.contains("agentId"));
    assert_eq!(
      openclaw_group_member_session_key("agent:main:webchat:dm:group", &member.id),
      "agent:main:webchat:dm:group:member:Atlas---Relationships"
    );
  }

  #[test]
  fn group_chat_is_one_bounded_round_followed_by_one_synthesis() {
    let prompt = openclaw_group_synthesis_prompt(
      "Choose the best next step",
      &[
        ("Scout".to_string(), "Inspect the evidence.".to_string()),
        ("Atlas".to_string(), "Make a decision.".to_string()),
      ],
    );

    assert_eq!(MAX_GROUP_MEMBERS, 8);
    assert!(prompt.contains("one independent turn"));
    assert!(prompt.contains("only synthesis pass"));
    assert!(prompt.contains("do not call tools, spawn more agents"));
    assert!(prompt.contains("ask contributors follow-up questions"));
    assert!(prompt.contains("Scout:\nInspect the evidence."));
    assert!(prompt.contains("Atlas:\nMake a decision."));
  }

  #[tokio::test]
  async fn hermes_adapter_sends_authenticated_responses_request() {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let server = tokio::spawn(async move {
      let (mut socket, _) = listener.accept().await.unwrap();
      let mut request_bytes = Vec::new();
      let mut buffer = [0u8; 4096];
      let request_length = loop {
        let count = socket.read(&mut buffer).await.unwrap();
        assert!(count > 0, "client disconnected before sending a request");
        request_bytes.extend_from_slice(&buffer[..count]);
        let request_text = String::from_utf8_lossy(&request_bytes);
        if let Some(headers_end) = request_text.find("\r\n\r\n") {
          let content_length = request_text[..headers_end]
            .lines()
            .find_map(|line| {
              let (name, value) = line.split_once(':')?;
              name
                .eq_ignore_ascii_case("content-length")
                .then(|| value.trim().parse::<usize>().ok())
                .flatten()
            })
            .unwrap_or(0);
          break headers_end + 4 + content_length;
        }
      };
      while request_bytes.len() < request_length {
        let count = socket.read(&mut buffer).await.unwrap();
        assert!(count > 0, "client disconnected before sending its body");
        request_bytes.extend_from_slice(&buffer[..count]);
      }

      let response_body = r#"{"output_text":"Hermes is ready"}"#;
      let response = format!(
        "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
        response_body.len(),
        response_body
      );
      socket.write_all(response.as_bytes()).await.unwrap();
      String::from_utf8(request_bytes).unwrap()
    });

    let reply = run_hermes(
      &request(&[]),
      HermesConfig {
        base_url: format!("http://{address}/v1"),
        api_key: "test-secret".to_string(),
        model: "hermes-test".to_string(),
      },
    )
    .await
    .unwrap();
    assert_eq!(reply, "Hermes is ready");

    let captured = server.await.unwrap();
    let captured_lower = captured.to_ascii_lowercase();
    assert!(captured.starts_with("POST /v1/responses HTTP/1.1\r\n"));
    assert!(captured_lower.contains("authorization: bearer test-secret\r\n"));
    assert!(
      captured_lower.contains("x-hermes-session-key: agent:main:knapsack:dm:ui---primary\r\n")
    );
    assert!(captured.contains(r#""conversation":"knapsack-ui---primary""#));
    assert!(captured.contains(r#""model":"hermes-test""#));
  }
}
