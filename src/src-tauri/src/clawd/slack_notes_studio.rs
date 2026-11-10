//! Exact-account Studio adapter for the notes picker. Never exports credentials.
use serde_json::{json, Value};
const PREFIX: &str = "studio:slack:";

pub(super) fn connector(account: &str) -> Result<String, String> {
  let id = account
    .strip_prefix(PREFIX)
    .filter(|id| !id.is_empty() && id.bytes().all(|b| b.is_ascii_digit()))
    .ok_or("Invalid Studio Slack account. Reopen sharing.")?;
  Ok(format!("slack:{id}"))
}
pub(super) fn is_studio(account: &str) -> bool {
  account.starts_with("studio:")
}
fn has_error(value: Option<&Value>) -> bool {
  match value {
    None | Some(Value::Null) | Some(Value::Bool(false)) => false,
    Some(Value::String(text)) => !text.is_empty(),
    _ => true,
  }
}
pub(super) fn provider_data(value: Value) -> Result<Value, String> {
  let content = value
    .get("content")
    .and_then(Value::as_array)
    .ok_or("Studio Slack returned an unreadable result.")?;
  if content.len() != 1 {
    return Err("Studio Slack returned an ambiguous result.".into());
  }
  let raw: Value = serde_json::from_str(
    content[0]
      .get("text")
      .and_then(Value::as_str)
      .ok_or("Studio Slack result is not JSON.")?,
  )
  .map_err(|_| "Studio Slack result is not complete JSON.")?;
  let data = raw.get("data").cloned().unwrap_or_else(|| raw.clone());
  if value.get("isError").and_then(Value::as_bool) == Some(true)
    || raw.get("successful").and_then(Value::as_bool) == Some(false)
    || raw.get("ok").and_then(Value::as_bool) == Some(false)
    || data.get("ok").and_then(Value::as_bool) != Some(true)
    || has_error(raw.get("error"))
    || has_error(data.get("error"))
  {
    if data.get("error").and_then(Value::as_str) == Some("missing_scope") {
      return Err(super::MISSING_SCOPE.into());
    }
    return Err("Studio Slack did not confirm success. No alternate workspace was used; check Slack before retrying a send.".into());
  }
  Ok(data)
}

fn action(method: &str) -> Result<&'static str, String> {
  // Published Composio Slack toolkit identifiers; discovery must confirm each
  // exact name/schema at runtime before use. Never execute a guessed fallback.
  match method {
    "auth.test" => Ok("slack_slack_test_auth"),
    "conversations.list" => Ok("slack_slack_list_all_channels"),
    "conversations.info" => Ok("slack_slack_retrieve_conversation_information"),
    "chat.postMessage" => Ok("slack_slack_chat_post_message"),
    _ => Err("Unsupported notes sharing operation.".into()),
  }
}
fn validate_schema(tool: &Value, args: &Value) -> Result<(), String> {
  let schema = &tool["inputSchema"];
  let properties = schema["properties"]
    .as_object()
    .ok_or("Studio Slack action schema is unavailable.")?;
  let args = args.as_object().ok_or("Invalid Slack arguments.")?;
  if args.keys().any(|key| !properties.contains_key(key)) {
    return Err("This Studio Slack action does not support the required safe arguments. Copy the notes instead.".into());
  }
  if schema["required"].as_array().is_some_and(|required| {
    required
      .iter()
      .any(|key| key.as_str().is_none_or(|key| !args.contains_key(key)))
  }) {
    return Err(
      "This Studio Slack action requires additional information. Copy the notes instead.".into(),
    );
  }
  Ok(())
}
pub(super) async fn accounts() -> Result<Vec<Value>, String> {
  let inventory = crate::clawd::studio_mcp::connected_connectors().await?;
  Ok(inventory.into_iter().filter_map(|item| {
    let id=item["id"].as_str()?.strip_prefix("slack:")?;
    if id.is_empty() || !id.bytes().all(|b|b.is_ascii_digit()) {return None;}
    Some(json!({"accountId":format!("{PREFIX}{id}"),"name":item["account"].as_str().or(item["name"].as_str()).unwrap_or("Slack"),"source":"studio"}))
  }).collect())
}
fn supports_single_attempt(catalog: &Value) -> bool {
  let contract = &catalog["slackNotesContract"];
  contract["version"].as_u64() == Some(1)
    && contract["singleAttempt"].as_bool() == Some(true)
    && contract["approvalSnapshotVersion"].as_u64() == Some(1)
    && contract["idempotency"].as_str() == Some("durable_v1")
}

async fn discover(account: &str, method: &str, args: &Value) -> Result<String, String> {
  let connector = connector(account)?;
  let name = action(method)?;
  let catalog = crate::clawd::studio_mcp::request_studio(
    reqwest::Method::GET,
    &format!("/desktop/integrations/{connector}/tools?query={name}&limit=25"),
    None,
  )
  .await?;
  let tool = catalog["tools"]
    .as_array()
    .and_then(|tools| {
      tools
        .iter()
        .find(|tool| tool["name"].as_str() == Some(name))
    })
    .ok_or("Required Studio Slack action is unavailable. No alternate connection was used.")?;
  validate_schema(tool, args)?;
  if method == "chat.postMessage" && !supports_single_attempt(&catalog) {
    return Err("Studio Slack sharing needs the server's complete v1 single-attempt contract. Copy the notes instead; nothing was sent.".into());
  }
  Ok(connector)
}

pub(super) struct PreparedSend {
  connector: String,
  envelope: Value,
}
fn approval_envelope(team: &str, request_id: &str, args: Value) -> Result<Value, String> {
  uuid::Uuid::parse_str(request_id).map_err(|_| "Invalid send identity.")?;
  let channel = args["channel"]
    .as_str()
    .filter(|id| !id.is_empty())
    .ok_or("Missing approved channel.")?;
  if team.is_empty() {
    return Err("Missing approved workspace identity.".into());
  }
  Ok(json!({
    "contractVersion":1,"requestId":request_id,"expectedTeamId":team,
    "name":"slack_slack_chat_post_message","arguments":args,
    "approvalSnapshot":{"version":1,"teamId":team,"channelId":channel,
      "message":{"text":args["text"],"blocks":args["blocks"]}}
  }))
}
pub(super) async fn prepare_send(
  account: &str,
  team: &str,
  request_id: &str,
  args: Value,
) -> Result<PreparedSend, String> {
  let connector = discover(account, "chat.postMessage", &args).await?;
  let envelope = approval_envelope(team, request_id, args)?;
  Ok(PreparedSend {
    connector,
    envelope,
  })
}
fn confirmed_receipt(value: Value, envelope: &Value) -> Result<Value, String> {
  if value["isError"].as_bool() != Some(false) {
    return Err("Studio Slack did not confirm delivery. Verify Slack before resending.".into());
  }
  let data = provider_data(value)?;
  if data["team_id"] != envelope["expectedTeamId"]
    || data["channel"] != envelope["arguments"]["channel"]
    || data["request_id"] != envelope["requestId"]
    || data["approval_snapshot_version"].as_u64() != Some(1)
    || data["ts"].as_str().is_none_or(|ts| ts.trim().is_empty())
  {
    return Err("Unexpected Studio Slack receipt. Verify the channel; do not resend.".into());
  }
  Ok(data)
}
pub(super) async fn send(prepared: PreparedSend) -> Result<Value, String> {
  // An old server has no such route. Never fall back to the generic adapter.
  let path = format!(
    "/desktop/integrations/{}/slack-notes/v1/send",
    prepared.connector
  );
  let value = crate::clawd::studio_mcp::request_studio(
    reqwest::Method::POST,
    &path,
    Some(prepared.envelope.clone()),
  )
  .await?;
  confirmed_receipt(value, &prepared.envelope)
}
pub(super) async fn call(account: &str, method: &str, args: Value) -> Result<Value, String> {
  if method == "chat.postMessage" {
    return Err("Notes sends require the complete approved v1 envelope.".into());
  }
  let connector = discover(account, method, &args).await?;
  let name = action(method)?;
  let value = crate::clawd::studio_mcp::request_studio(
    reqwest::Method::POST,
    &format!("/desktop/integrations/{connector}/call"),
    Some(json!({"name":name,"arguments":args})),
  )
  .await?;
  provider_data(value)
}
#[cfg(test)]
mod tests {
  use super::*;
  fn contract() -> Value {
    json!({"slackNotesContract":{"version":1,"singleAttempt":true,"approvalSnapshotVersion":1,"idempotency":"durable_v1"}})
  }
  #[test]
  fn old_servers_never_enable_sends() {
    assert!(!supports_single_attempt(&json!({})));
    assert!(!supports_single_attempt(
      &json!({"slackNotesContract":{"singleAttempt":true}})
    ));
    assert!(supports_single_attempt(&contract()));
    for (key, value) in [
      ("version", json!(2)),
      ("singleAttempt", json!(false)),
      ("approvalSnapshotVersion", json!(2)),
      ("idempotency", json!("memory")),
    ] {
      let mut catalog = contract();
      catalog["slackNotesContract"][key] = value;
      assert!(!supports_single_attempt(&catalog));
    }
  }
  #[test]
  fn missing_scope_is_classified_even_when_mcp_marks_error() {
    let value = json!({"content":[{"text":json!({"successful":false,"data":{"ok":false,"error":"missing_scope"}}).to_string()}],"isError":true});
    assert_eq!(
      provider_data(value).unwrap_err(),
      super::super::MISSING_SCOPE
    );
  }
  #[test]
  fn explicit_nested_errors_are_never_success() {
    let body = |error| json!({"content":[{"text":json!({"successful":true,"data":{"ok":true,"error":error}}).to_string()}],"isError":false});
    assert!(provider_data(body(json!("denied"))).is_err());
    assert!(provider_data(body(json!(false))).is_ok());
    assert!(provider_data(body(Value::Null)).is_ok());
  }
  #[test]
  fn exact_account_only() {
    assert_eq!(connector("studio:slack:42").unwrap(), "slack:42");
    for bad in [
      "slack",
      "studio:slack:",
      "studio:slack:../42",
      "studio:slack:42?x=1",
    ] {
      assert!(connector(bad).is_err())
    }
  }
  #[test]
  fn preserves_complete_provider_json() {
    let value = json!({"content":[{"text":json!({"successful":true,"data":{"ok":true,"channels":[],"response_metadata":{"next_cursor":"next"}}}).to_string()}],"isError":false});
    assert_eq!(
      provider_data(value).unwrap()["response_metadata"]["next_cursor"],
      "next"
    );
  }
  #[test]
  fn rejects_unconfirmed_or_ambiguous_results() {
    for value in [
      json!({"content":[{"text":"{}"}]}),
      json!({"content":[{"text":"{truncated"}]}),
      json!({"content":[],"isError":true}),
    ] {
      assert!(provider_data(value).is_err())
    }
  }
  #[test]
  fn validates_required_and_safe_arguments() {
    let tool =
      json!({"inputSchema":{"properties":{"channel":{},"text":{}},"required":["channel"]}});
    assert!(validate_schema(&tool, &json!({"channel":"C1","text":"synthetic"})).is_ok());
    assert!(validate_schema(&tool, &json!({"text":"synthetic"})).is_err());
    assert!(validate_schema(&tool, &json!({"channel":"C1","unfurl_links":false})).is_err());
  }
}

#[cfg(test)]
mod v1_tests {
  use super::*;
  fn args() -> Value {
    json!({"channel":"C1","text":"Synthetic &lt;@U1&gt;","blocks":[{"type":"section","text":{"type":"plain_text","text":"Synthetic <@U1>","emoji":false}}],"parse":"none","mrkdwn":false,"unfurl_links":false,"unfurl_media":false})
  }
  fn envelope() -> Value {
    approval_envelope("T1", "11111111-1111-4111-8111-111111111111", args()).unwrap()
  }
  fn receipt(body: &Value) -> Value {
    json!({"content":[{"type":"text","text":json!({"successful":true,"data":{"ok":true,"team_id":body["expectedTeamId"],"channel":body["arguments"]["channel"],"request_id":body["requestId"],"approval_snapshot_version":1,"ts":"123.456"}}).to_string()}],"isError":false})
  }
  #[test]
  fn approval_snapshot_is_exact_transport_payload() {
    let body = envelope();
    if std::env::var("KNAPSACK_QA_EXPORT_SLACK_V1").as_deref() == Ok("1") {
      println!("SLACK_NOTES_V1_SYNTHETIC_ENVELOPE={body}");
    }
    assert_eq!(body["contractVersion"], 1);
    assert_eq!(body["approvalSnapshot"]["version"], 1);
    assert_eq!(
      body["approvalSnapshot"]["message"],
      json!({"text":body["arguments"]["text"],"blocks":body["arguments"]["blocks"]})
    );
    assert_eq!(body["approvalSnapshot"]["teamId"], body["expectedTeamId"]);
    assert_eq!(
      body["approvalSnapshot"]["channelId"],
      body["arguments"]["channel"]
    );
    assert!(approval_envelope("T1", "not-a-uuid", args()).is_err());
  }
  #[test]
  fn only_exact_versioned_receipt_confirms_success() {
    let body = envelope();
    if let Ok(path) = std::env::var("KNAPSACK_QA_SLACK_V1_RECEIPT_PATH") {
      let bytes = std::fs::read(path).expect("Synthetic cross-contract receipt fixture");
      assert!(bytes.len() <= 8192);
      let response: Value = serde_json::from_slice(&bytes).expect("Synthetic receipt JSON");
      assert!(confirmed_receipt(response, &body).is_ok());
    }
    assert!(confirmed_receipt(receipt(&body), &body).is_ok());
    for (field, value) in [
      ("team_id", json!("T2")),
      ("channel", json!("C2")),
      ("request_id", json!("other")),
      ("approval_snapshot_version", json!(2)),
      ("ts", json!("")),
      ("ts", Value::Null),
    ] {
      let mut response = receipt(&body);
      let mut raw: Value =
        serde_json::from_str(response["content"][0]["text"].as_str().unwrap()).unwrap();
      raw["data"][field] = value;
      response["content"][0]["text"] = json!(raw.to_string());
      assert!(confirmed_receipt(response, &body).is_err());
    }
    let mut response = receipt(&body);
    response["isError"] = json!(true);
    assert!(confirmed_receipt(response, &body).is_err());
  }
}
