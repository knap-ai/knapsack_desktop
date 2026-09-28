//! Text-only Gemini OAuth inference. Uses the connected account, never an agent/tools.
use crate::llm::types::{LLMError, Message, MessageSender};
use serde_json::{json, Value};
use std::{path::Path, time::{Duration, SystemTime, UNIX_EPOCH}};

const ENDPOINT: &str = "https://cloudcode-pa.googleapis.com/v1internal";
fn error(message: &str) -> LLMError { LLMError::ChatCompletionFailed(message.into()) }
fn profile(store: &Value) -> Result<&Value, LLMError> {
  let profiles = store["profiles"].as_object().ok_or_else(|| error("Reconnect Gemini in Settings."))?;
  if let Some(id) = store["lastGood"]["google-gemini-cli"].as_str() {
    if let Some(p) = profiles.get(id).filter(|p| p["provider"] == "google-gemini-cli") { return Ok(p); }
  }
  let mut matching = profiles.values().filter(|p| p["provider"] == "google-gemini-cli" && p["type"] == "oauth");
  let first = matching.next().ok_or_else(|| error("Reconnect Gemini in Settings."))?;
  if matching.next().is_some() { return Err(error("Select a Gemini OAuth account in Settings before extracting commitments.")); }
  Ok(first)
}
fn request(model: &str, project: Option<&str>, messages: &[Message]) -> Value {
  let system: Vec<_> = messages.iter().filter(|m| matches!(m.sender, MessageSender::System)).map(|m| json!({"text": m.content})).collect();
  let contents: Vec<_> = messages.iter().filter(|m| !matches!(m.sender, MessageSender::System)).map(|m|
    json!({"role": if matches!(m.sender, MessageSender::Bot) { "model" } else { "user" }, "parts": [{"text":m.content}]})).collect();
  let mut body = json!({"model":model, "request": {"contents":contents,
    "systemInstruction":{"parts":system}, "generationConfig":{"maxOutputTokens":4096}}});
  if let Some(project) = project { body["project"] = json!(project); }
  body
}
fn response_text(value: &Value) -> Result<String, LLMError> {
  let candidate = &value["response"]["candidates"][0];
  if candidate["finishReason"].as_str() != Some("STOP") { return Err(error("Gemini did not finish the extraction. Try again.")); }
  let parts = candidate["content"]["parts"].as_array().ok_or_else(|| error("Gemini returned no extraction."))?;
  if parts.iter().any(|p| p.get("functionCall").is_some()) { return Err(error("Gemini returned a tool request instead of an extraction.")); }
  let text: String = parts.iter().filter(|p| p["thought"] != true).filter_map(|p| p["text"].as_str()).collect();
  if text.trim().is_empty() { return Err(error("Gemini returned no extraction.")); }
  Ok(text)
}
async fn post(client: &reqwest::Client, token: &str, method: &str, body: Value) -> Result<Value, LLMError> {
  let response = client.post(format!("{ENDPOINT}:{method}")).bearer_auth(token).json(&body).send().await
    .map_err(|_| error("Could not reach Gemini. Try again."))?;
  if !response.status().is_success() {
    return Err(error(&format!("Gemini returned HTTP {}. Check your Gemini connection and account access in Settings.", response.status().as_u16())));
  }
  response.json().await.map_err(|_| error("Gemini returned an invalid response."))
}
pub(super) async fn complete(home: &Path, messages: &[Message]) -> Result<String, LLMError> {
  // Validate before reading credentials, refreshing tokens, or sending source material.
  crate::privacy_mode::validate_inference("google-gemini-cli", Some(ENDPOINT)).map_err(LLMError::ProviderNotConfigured)?;
  let raw = std::fs::read(home.join("agents/main/agent/auth-profiles.json")).map_err(|_| error("Reconnect Gemini in Settings."))?;
  let store: Value = serde_json::from_slice(&raw).map_err(|_| error("Reconnect Gemini in Settings."))?;
  let auth = profile(&store)?;
  let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64;
  let access = if auth["expires"].as_u64().unwrap_or(0) > now + 30_000 {
    auth["access"].as_str().filter(|s| !s.is_empty()).ok_or_else(|| error("Reconnect Gemini in Settings."))?.to_owned()
  } else {
    let refresh = auth["refresh"].as_str().filter(|s| !s.is_empty()).ok_or_else(|| error("Reconnect Gemini in Settings."))?;
    let email = auth["email"].as_str().ok_or_else(|| error("Reconnect Gemini in Settings."))?;
    crate::connections::google::auth::google_refresh_token(email.into(), refresh.into()).await
      .map_err(|_| error("Could not refresh Gemini authentication. Reconnect Gemini in Settings."))?
  };
  let client = reqwest::Client::builder().timeout(Duration::from_secs(90)).build().map_err(|_| error("Could not initialize Gemini."))?;
  let mut project = auth["projectId"].as_str().filter(|s| !s.is_empty()).map(String::from);
  if project.is_none() {
    let loaded = post(&client, &access, "loadCodeAssist", json!({"metadata":{"ideType":"IDE_UNSPECIFIED","platform":"PLATFORM_UNSPECIFIED","pluginType":"GEMINI"}})).await?;
    project = loaded["cloudaicompanionProject"].as_str().or_else(|| loaded["cloudaicompanionProject"]["id"].as_str()).map(String::from);
    if project.is_none() { return Err(error("Finish Gemini CLI account setup before extracting commitments with Gemini OAuth.")); }
  }
  let model = std::env::var("KNAPSACK_GEMINI_MODEL").unwrap_or_else(|_| "gemini-3.8-flash".into());
  let model = model.strip_prefix("google-gemini-cli/").or_else(|| model.strip_prefix("google/")).unwrap_or(&model);
  response_text(&post(&client, &access, "generateContent", request(model, project.as_deref(), messages)).await?)
}
#[cfg(test)]
mod tests {
  use super::*;
  #[test] fn oauth_account_selection_never_uses_an_api_key_provider() {
    let store = json!({"profiles":{"a":{"provider":"openai","type":"api_key"}}});
    assert!(profile(&store).is_err());
    let store = json!({"profiles":{"a":{"provider":"google-gemini-cli","type":"oauth","access":"fixture"}}});
    assert_eq!(profile(&store).unwrap()["access"], "fixture");
  }
  #[test] fn extraction_cannot_advertise_or_execute_tools() {
    let body = request("test", Some("project"), &[Message{sender:MessageSender::User,content:"source".into()}]);
    assert!(body["request"].get("tools").is_none());
    assert_eq!(body["request"]["contents"][0]["parts"][0]["text"], "source");
    assert!(response_text(&json!({"response":{"candidates":[{"finishReason":"STOP","content":{"parts":[{"functionCall":{"name":"send"}}]}}]}})).is_err());
  }
  #[test] fn extraction_rejects_truncation_and_ignores_thoughts() {
    assert!(response_text(&json!({"response":{"candidates":[{"finishReason":"MAX_TOKENS"}]}})).is_err());
    assert_eq!(response_text(&json!({"response":{"candidates":[{"finishReason":"STOP","content":{"parts":[{"thought":true,"text":"private"},{"text":"[]"}]}}]}})).unwrap(), "[]");
  }
}
