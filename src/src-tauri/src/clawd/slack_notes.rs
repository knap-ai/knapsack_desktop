#[path = "slack_notes_studio.rs"]
mod studio;
// Explicit Desktop notes sharing using configured native Slack accounts.
// No gateway/model routing, implicit account fallback, OAuth changes, or POST retries.
use actix_web::{get, post, web, HttpResponse};
use serde::Deserialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{io::Write, path::Path};
pub(super) const MISSING_SCOPE: &str = "Existing Slack permissions do not support this action. No permissions were changed.";

fn guard() -> Result<(), String> {
  if crate::qa_launch::is_synthetic_build() {
    return Err("Slack sharing is disabled in isolated QA.".into());
  }
  Ok(())
}
fn owner() -> Result<String, String> {
  guard()?;
  let email = super::service::knapsack_email_from_tokens()
    .ok_or("Sign in to Knapsack before sharing notes.")?;
  Ok(format!("{:x}", Sha256::digest(email.as_bytes())))
}
fn token_for(config: &Value, account: &str) -> Option<String> {
  let slack = config.pointer("/channels/slack")?;
  if slack.get("enabled").and_then(Value::as_bool) == Some(false) {
    return None;
  }
  let entry = slack.get("accounts").and_then(|v| v.get(account));
  if entry
    .and_then(|v| v.get("enabled"))
    .and_then(Value::as_bool)
    == Some(false)
  {
    return None;
  }
  let explicit = entry.and_then(|v| v.get("botToken"));
  // A named account must have its own resolvable credential. Never borrow the
  // root workspace's token for a missing/deleted/SecretRef account.
  let value = if account == "default" {
    explicit.or_else(|| slack.get("botToken"))
  } else {
    explicit
  };
  if let Some(value) = value {
    return value
      .as_str()
      .map(str::trim)
      .filter(|v| !v.is_empty() && !v.contains("REDACTED"))
      .map(str::to_owned);
  }
  if account == "default" {
    return std::env::var("SLACK_BOT_TOKEN")
      .ok()
      .filter(|v| !v.trim().is_empty());
  }
  None
}
fn account_token(account: &str) -> Result<String, String> {
  guard()?;
  if studio::is_studio(account) { studio::connector(account)?; return Ok(account.to_owned()); }
  let cfg = super::configured_gateway_config().ok_or("Slack configuration unavailable.")?;
  token_for(&cfg, account).ok_or_else(|| "This Slack account is disconnected, disabled, or its credential cannot be resolved. No alternate workspace was used.".into())
}
async fn slack(token: &str, method: &str, body: Value) -> Result<Value, String> {
  guard()?;
  if studio::is_studio(token) { return studio::call(token,method,body).await; }
  let client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(20))
    .build()
    .map_err(|_| "Slack client unavailable.")?;
  let url = format!("https://slack.com/api/{method}");
  let request = if matches!(method, "conversations.list" | "conversations.info") {
    client.get(url).bearer_auth(token).query(&body)
  } else {
    client.post(url).bearer_auth(token).json(&body)
  };
  let response = request.send().await.map_err(|_| {
    "Slack request outcome is uncertain. Do not retry a send until you verify the channel."
  })?;
  if response.status().as_u16() == 429 {
    return Err("Slack rate limited this request. No automatic retry was made.".into());
  }
  let value: Value = response
    .json()
    .await
    .map_err(|_| "Slack returned an unreadable response; send outcome may be uncertain.")?;
  if value.get("ok").and_then(Value::as_bool) != Some(true) {
    let code = value
      .get("error")
      .and_then(Value::as_str)
      .unwrap_or("unknown_error");
    // Error codes only; never expose provider response/token material.
    let safe = match code {
      "missing_scope" => {
        MISSING_SCOPE
      }
      "invalid_auth" | "token_revoked" | "account_inactive" => {
        "Slack connection expired or was revoked."
      }
      "channel_not_found" | "not_in_channel" | "is_archived" => {
        "The selected channel is unavailable. Choose a valid channel in this workspace."
      }
      _ => "Slack rejected the request. No alternate channel or workspace was used.",
    };
    return Err(safe.into());
  }
  Ok(value)
}
fn identity(value: &Value) -> Result<(&str, &str), String> {
  Ok((
    value
      .get("team_id")
      .and_then(Value::as_str)
      .filter(|s| !s.is_empty())
      .ok_or("Slack workspace identity missing.")?,
    value
      .get("team")
      .and_then(Value::as_str)
      .unwrap_or("Slack workspace"),
  ))
}
fn channel(value: &Value, expected: &str) -> Result<Value, String> {
  let c = value.get("channel").unwrap_or(value);
  if c.get("id").and_then(Value::as_str) != Some(expected)
    || !expected.starts_with(['C', 'G'])
    || c.get("is_archived").and_then(Value::as_bool) != Some(false)
    || c.get("is_member").and_then(Value::as_bool) != Some(true)
    || c.get("is_im").and_then(Value::as_bool) == Some(true)
    || c.get("is_mpim").and_then(Value::as_bool) == Some(true)
  {
    return Err(
      "Selected Slack channel is unavailable or the connected bot is not a member.".into(),
    );
  }
  Ok(
    json!({"id":expected,"name":c.get("name").and_then(Value::as_str).unwrap_or(expected),"private":c.get("is_private").and_then(Value::as_bool).unwrap_or(false)}),
  )
}
fn response(result: Result<Value, String>) -> HttpResponse {
  match result {
    Ok(data) => HttpResponse::Ok().json(json!({"success":true,"data":data})),
    Err(error) => HttpResponse::BadRequest().json(json!({"success":false,"error":error})),
  }
}
#[get("/api/clawd/slack-notes/workspaces")]
pub async fn workspaces() -> HttpResponse {
  response(
    async {
      let owner = owner()?;
      let config = super::configured_gateway_config().unwrap_or_else(|| json!({}));
      let mut ids: Vec<String> = config
        .pointer("/channels/slack/accounts")
        .and_then(Value::as_object)
        .map(|o| o.keys().cloned().collect())
        .unwrap_or_default();
      if !ids.iter().any(|id| id == "default") {
        ids.push("default".into());
      }
      let mut accounts = Vec::new();
      for id in ids {
        if let Some(token) = token_for(&config, &id) {
          match slack(&token, "auth.test", json!({})).await.and_then(|auth| {
            let (team,name)=identity(&auth)?;Ok((team.to_owned(),name.to_owned()))
          }) {
            Ok((team,name)) => {
              accounts.push(json!({"accountId":id,"teamId":team,"name":name,"source":"gateway"}));
            }
            Err(_) => accounts.push(json!({"accountId":id,"unavailable":true,"name":id})),
          }
        }
      }
      let mut warnings=Vec::new();
      match studio::accounts().await {
        Ok(oauth_accounts) => for mut account in oauth_accounts {
          let id=account["accountId"].as_str().unwrap_or("").to_owned();
          match slack(&id,"auth.test",json!({})).await.and_then(|auth| {
            let (team,name)=identity(&auth)?;Ok((team.to_owned(),name.to_owned()))
          }) {
            Ok((team,name)) => {account["teamId"]=json!(team);account["name"]=json!(name);},
            Err(_) => {account["unavailable"]=json!(true);}
          }
          accounts.push(account);
        },
        Err(_) => warnings.push("Studio Slack connections could not be loaded. Gateway bot connections are shown separately. Copying notes remains available."),
      }
      if self::owner()? != owner {return Err("Knapsack account changed. Reopen sharing.".into());}
      Ok(json!({"owner":owner,"accounts":accounts,"warnings":warnings}))
    }
    .await,
  )
}
#[derive(Deserialize)]
pub struct Destination {
  owner: String,
  #[serde(rename = "accountId")]
  account_id: String,
  #[serde(rename = "teamId")]
  team_id: String,
}
async fn verified(d: &Destination) -> Result<String, String> {
  if owner()? != d.owner {
    return Err("Knapsack account changed. Reopen sharing.".into());
  }
  let token = account_token(&d.account_id)?;
  let auth = slack(&token, "auth.test", json!({})).await?;
  if identity(&auth)?.0 != d.team_id {
    return Err("Slack workspace changed. Re-select the destination.".into());
  }
  Ok(token)
}
#[post("/api/clawd/slack-notes/channels")]
pub async fn channels(d: web::Json<Destination>) -> HttpResponse {
  response(async {
    let token = verified(&d).await?;
    let result=discover_channels(|body| slack(&token, "conversations.list", body)).await?;
    if owner()? != d.owner {return Err("Knapsack account changed. Reopen sharing.".into());}
    Ok(result)
  }.await)
}

async fn discover_channels<F, Fut>(mut call: F) -> Result<Value, String>
where F: FnMut(Value) -> Fut, Fut: std::future::Future<Output = Result<Value, String>> {
  let mut listed_channels = Vec::new();
  let mut warnings = Vec::new();
  let mut readable_classes = 0;
  for (kind, label) in [("public_channel", "Public"), ("private_channel", "Private")] {
    let mut cursor = String::new();
    let mut complete = false;
    for page_number in 0..50 {
      let page = match call(json!({"types":kind,"exclude_archived":true,"limit":200,"cursor":cursor})).await {
        Ok(page) => page,
        Err(error) if page_number == 0 && error == MISSING_SCOPE => {
          warnings.push(format!("{label} channels cannot be listed with this connection's existing permissions. No permissions were changed."));
          complete = true;
          break;
        }
        Err(error) => return Err(error),
      };
      if page_number == 0 { readable_classes += 1; }
      for value in page.get("channels").and_then(Value::as_array).ok_or("Slack channel list unavailable.")? {
        if let Some(id) = value.get("id").and_then(Value::as_str) {
          if let Ok(value) = channel(value, id) {
            if !listed_channels.iter().any(|existing: &Value| existing["id"] == value["id"]) { listed_channels.push(value); }
          }
        }
      }
      cursor = page.pointer("/response_metadata/next_cursor").and_then(Value::as_str).unwrap_or("").trim().into();
      if cursor.is_empty() { complete = true; break; }
    }
    if !complete { return Err("Slack channel list is too large. No partial default was selected.".into()); }
  }
  if readable_classes == 0 { return Err("This connection cannot list public or private channels with its existing permissions. Copy notes instead; no permissions were changed.".into()); }
  Ok(json!({"channels":listed_channels,"warnings":warnings}))
}
#[derive(Deserialize)]
pub struct Send {
  #[serde(flatten)]
  destination: Destination,
  #[serde(rename = "channelId")]
  channel_id: String,
  #[serde(rename = "requestId")]
  request_id: String,
  text: String,
  blocks: Vec<Value>,
}
fn validate_message(send: &Send) -> Result<(), String> {
  uuid::Uuid::parse_str(&send.request_id).map_err(|_| "Invalid send identity.")?;
  if send.text.trim().is_empty()
    || send.text.chars().count() > 39000
    || send.blocks.is_empty()
    || send.blocks.len() > 50
  {
    return Err("Notes exceed Slack message limits. Copy the notes instead.".into());
  }
  let mut table_chars = 0;
  for b in &send.blocks {
    match b.get("type").and_then(Value::as_str) {
      Some("section") => {
        let t = b.get("text").ok_or("Missing section text.")?;
        if t.get("type").and_then(Value::as_str) != Some("plain_text")
          || t
            .get("text")
            .and_then(Value::as_str)
            .is_none_or(|s| s.is_empty() || s.chars().count() > 3000)
        {
          return Err("Invalid Slack text section.".into());
        }
      }
      Some("table") => {
        let rows = b
          .get("rows")
          .and_then(Value::as_array)
          .ok_or("Invalid Slack table.")?;
        if rows.is_empty() || rows.len() > 100 {
          return Err("Slack tables support up to 100 rows.".into());
        }
        for row in rows {
          let cells = row.as_array().ok_or("Invalid table row.")?;
          if cells.is_empty() || cells.len() > 20 {
            return Err("Slack tables support up to 20 columns.".into());
          }
          for c in cells {
            if c.get("type").and_then(Value::as_str) != Some("raw_text") {
              return Err("Unsupported table cell.".into());
            }
            table_chars += c
              .get("text")
              .and_then(Value::as_str)
              .ok_or("Invalid table cell.")?
              .chars()
              .count();
          }
        }
      }
      _ => return Err("Unsupported Slack block.".into()),
    }
  }
  if table_chars > 10000 {
    return Err(
      "Tables exceed Slack's 10,000-character message limit. Copy the notes instead.".into(),
    );
  }
  Ok(())
}
fn inert_blocks(blocks: &[Value]) -> Vec<Value> {
  blocks.iter().map(|b|if b["type"]=="table"{json!({"type":"table","rows":b["rows"].as_array().unwrap().iter().map(|r|r.as_array().unwrap().iter().map(|c|json!({"type":"raw_text","text":c["text"]})).collect::<Vec<_>>()).collect::<Vec<_>>(),"column_settings":vec![json!({"is_wrapped":true});b["rows"][0].as_array().unwrap().len()]})}else{json!({"type":"section","text":{"type":"plain_text","text":b["text"]["text"],"emoji":false}})}).collect()
}
fn reserve(home: &Path, send: &Send) -> Result<std::path::PathBuf, String> {
  let id = uuid::Uuid::parse_str(&send.request_id).map_err(|_| "Invalid send identity.")?;
  let folder = home
    .join(".knapsack/slack-note-sends")
    .join(&send.destination.owner);
  for path in [
    home.join(".knapsack"),
    home.join(".knapsack/slack-note-sends"),
    folder.clone(),
  ] {
    if std::fs::symlink_metadata(path)
      .ok()
      .is_some_and(|m| m.file_type().is_symlink())
    {
      return Err("Send receipt directory cannot be a symbolic link.".into());
    }
  }
  std::fs::create_dir_all(&folder).map_err(|_| "Could not create send receipt.")?;
  let path = folder.join(format!("{id}.json"));
  let digest=format!("{:x}",Sha256::digest(serde_json::to_vec(&json!({"account":send.destination.account_id,"team":send.destination.team_id,"channel":send.channel_id,"text":send.text,"blocks":send.blocks})).unwrap()));
  let mut file=std::fs::OpenOptions::new().write(true).create_new(true).open(&path).map_err(|_|"This send was already submitted or has an uncertain outcome. Verify Slack before starting another send.")?;
  file
    .write_all(
      serde_json::to_string(&json!({"state":"pending","digest":digest}))
        .unwrap()
        .as_bytes(),
    )
    .and_then(|_| file.sync_all())
    .map_err(|_| "Could not reserve send receipt. Nothing was sent.")?;
  Ok(path)
}
#[post("/api/clawd/slack-notes/send")]
pub async fn send_notes(payload: web::Json<Send>) -> HttpResponse {
  response(async{
  guard()?;validate_message(&payload)?;let token=verified(&payload.destination).await?;
  let info=slack(&token,"conversations.info",json!({"channel":payload.channel_id})).await?;channel(&info,&payload.channel_id)?;
  let arguments=json!({"channel":payload.channel_id,"text":payload.text.replace('&',"&amp;").replace('<',"&lt;").replace('>',"&gt;"),"blocks":inert_blocks(&payload.blocks),"parse":"none","mrkdwn":false,"unfurl_links":false,"unfurl_media":false});
  let prepared=if studio::is_studio(&token) {Some(studio::prepare_send(&token,&payload.destination.team_id,&payload.request_id,arguments.clone()).await?)} else {None};
  // Recheck owner/config immediately before reserving; never reuse a stale token.
  if owner()?!=payload.destination.owner || account_token(&payload.destination.account_id)?!=token {return Err("Connection changed before sending. Reopen sharing.".into());}
  let home=dirs::home_dir().ok_or("Local receipt storage unavailable.")?;
  let receipt=reserve(&home,&payload)?;
  let result=match prepared {Some(send)=>studio::send(send).await?,None=>slack(&token,"chat.postMessage",arguments).await?};
  if result.get("ts").and_then(Value::as_str).is_none() || result.get("channel").and_then(Value::as_str)!=Some(&payload.channel_id) {return Err("Unexpected Slack receipt. Verify the channel; do not resend.".into());}
  let data=json!({"state":"sent","channelId":payload.channel_id,"teamId":payload.destination.team_id,"ts":result.get("ts")});
  // A failed receipt update retains the pending reservation, preventing repeats.
  let _=std::fs::write(receipt,serde_json::to_vec(&data).unwrap());Ok(data)
}.await)
}
#[cfg(test)]
mod tests {
  use super::*;
  fn request() -> Send {
    serde_json::from_value(json!({"owner":"fictional","accountId":"work","teamId":"T1","channelId":"C1","requestId":uuid::Uuid::new_v4().to_string(),"text":"fictional","blocks":[{"type":"table","rows":[[{"type":"raw_text","text":"Header"}],[{"type":"raw_text","text":"Value"}]]}]})).unwrap()
  }
  #[test]
  fn slack_notes_exact_account_never_borrows_other_workspace() {
    let c = json!({"channels":{"slack":{"botToken":"fictional-root","accounts":{"work":{"botToken":"fictional-work"},"unresolved":{"botToken":{"source":"secret"}},"disabled":{"enabled":false,"botToken":"fictional"}}}}});
    assert_eq!(token_for(&c, "work").as_deref(), Some("fictional-work"));
    assert_eq!(token_for(&c, "missing"), None);
    assert_eq!(token_for(&c, "unresolved"), None);
    assert_eq!(token_for(&c, "disabled"), None);
  }
  #[actix_web::test]
  async fn slack_notes_public_channels_survive_missing_private_scope() {
    let result = discover_channels(|body| async move {
      if body["types"] == "private_channel" { return Err(MISSING_SCOPE.into()); }
      Ok(json!({"channels":[{"id":"C1","name":"fictional","is_member":true,"is_archived":false}]}))
    }).await.unwrap();
    assert_eq!(result["channels"].as_array().unwrap().len(), 1);
    assert!(result["warnings"][0].as_str().unwrap().contains("Private channels"));
  }
  #[actix_web::test]
  async fn slack_notes_private_channels_survive_missing_public_scope() {
    let result = discover_channels(|body| async move {
      if body["types"] == "public_channel" { return Err(MISSING_SCOPE.into()); }
      Ok(json!({"channels":[{"id":"C1","is_private":true,"is_member":true,"is_archived":false}]}))
    }).await.unwrap();
    assert_eq!(result["channels"][0]["private"], true);
    assert!(result["warnings"][0].as_str().unwrap().contains("Public channels"));
  }
  #[actix_web::test]
  async fn slack_notes_discovery_fails_without_any_readable_class_or_on_auth_error() {
    assert!(discover_channels(|_| async { Err(MISSING_SCOPE.into()) }).await.unwrap_err().contains("cannot list public or private"));
    assert!(discover_channels(|_| async { Err("Slack connection expired or was revoked.".into()) }).await.unwrap_err().contains("expired"));
  }
  #[actix_web::test]
  async fn slack_notes_discovery_paginates_empty_pages_and_filters_membership() {
    let result = discover_channels(|body| async move {
      if body["types"] == "private_channel" { return Ok(json!({"channels":[]})); }
      if body["cursor"] == "" { return Ok(json!({"channels":[],"response_metadata":{"next_cursor":"page2"}})); }
      Ok(json!({"channels":[{"id":"C1","is_member":true,"is_archived":false},{"id":"C2","is_member":false,"is_archived":false},{"id":"C1","is_member":true,"is_archived":false}]}))
    }).await.unwrap();
    assert_eq!(result["channels"].as_array().unwrap().len(), 1);
    assert!(result["warnings"].as_array().unwrap().is_empty());
  }
  #[test]
  fn slack_notes_native_table_limits() {
    let mut r = request();
    assert!(validate_message(&r).is_ok());
    r.blocks[0]["rows"] = json!(vec![vec![json!({"type":"raw_text","text":"x"})]; 101]);
    assert!(validate_message(&r).is_err());
    r.blocks =
      vec![json!({"type":"table","rows":[[{"type":"raw_text","text":"x".repeat(10001)}]]})];
    assert!(validate_message(&r).is_err());
  }
  #[test]
  fn slack_notes_reservation_prevents_duplicate_and_uncertain_posts() {
    let root = tempfile::tempdir().unwrap();
    let r = request();
    assert!(reserve(root.path(), &r).is_ok());
    assert!(reserve(root.path(), &r).is_err());
    let mut altered = request();
    altered.request_id = r.request_id;
    altered.channel_id = "C2".into();
    assert!(reserve(root.path(), &altered).is_err());
  }
  #[test]
  fn slack_notes_deleted_archived_wrong_channel_fail_closed() {
    let good = json!({"id":"C1","name":"same-name","is_member":true,"is_archived":false});
    assert!(channel(&good, "C1").is_ok());
    assert!(channel(&good, "C2").is_err());
    assert!(channel(
      &json!({"id":"C1","is_member":true,"is_archived":true}),
      "C1"
    )
    .is_err());
  }
  #[test]
  fn slack_notes_compiled_qa_fails_before_any_account_or_http_access() {
    if crate::qa_launch::is_synthetic_build() {
      assert!(guard().is_err());
      assert!(owner().is_err());
      assert!(account_token("default").is_err());
    }
  }
  #[actix_web::test]
  async fn slack_notes_qa_routes_deny_before_network_or_configuration() {
    if std::env::var_os("KNAPSACK_QA_EXPECT_GATEWAY_TESTS").is_some() {
      assert!(crate::qa_launch::is_synthetic_build());
    }
    if !crate::qa_launch::is_synthetic_build() {
      return;
    }
    use actix_web::test;
    let app = test::init_service(
      actix_web::App::new()
        .service(workspaces)
        .service(channels)
        .service(send_notes),
    )
    .await;
    let response = test::call_service(
      &app,
      test::TestRequest::get()
        .uri("/api/clawd/slack-notes/workspaces")
        .to_request(),
    )
    .await;
    assert_eq!(response.status(), actix_web::http::StatusCode::BAD_REQUEST);
    let body: Value = test::read_body_json(response).await;
    assert!(body["error"].as_str().unwrap().contains("disabled"));
    for route in ["channels", "send"] {
      let payload = json!({"owner":"fictional","accountId":"work","teamId":"T1","channelId":"C1","requestId":uuid::Uuid::new_v4().to_string(),"text":"fictional","blocks":[{"type":"section","text":{"type":"plain_text","text":"fictional"}}]});
      let response = test::call_service(
        &app,
        test::TestRequest::post()
          .uri(&format!("/api/clawd/slack-notes/{route}"))
          .set_json(payload)
          .to_request(),
      )
      .await;
      assert_eq!(response.status(), actix_web::http::StatusCode::BAD_REQUEST);
      let body: Value = test::read_body_json(response).await;
      assert!(body["error"].as_str().unwrap().contains("disabled"));
    }
  }
}
