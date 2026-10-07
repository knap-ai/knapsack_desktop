//! Read-only, bounded Outlook follow-up source. Reuses existing Microsoft OAuth.
use actix_web::{web, HttpResponse, Responder};
use chrono::{Duration, Utc};
use serde::Deserialize;
use serde_json::{json, Value};
use std::future::Future;
use crate::connections::microsoft::{auth::refresh_user_connection, constants::MICROSOFT_OUTLOOK_SCOPE};
use crate::db::models::user_connection::UserConnection;

const GRAPH: &str = "https://graph.microsoft.com/v1.0";
const SELECT: &str = "id,conversationId,from,toRecipients,sentDateTime,receivedDateTime,body,webLink,isDraft";

#[derive(Deserialize)]
pub struct OutlookSourceRequest { pub action: String, pub account_email: Option<String> }

fn continuation(url: &str) -> Result<String, String> {
  let parsed = url::Url::parse(url).map_err(|_| "Invalid Graph continuation")?;
  if parsed.scheme() != "https" || parsed.host_str() != Some("graph.microsoft.com") || parsed.port().is_some()
    || parsed.path() != "/v1.0/me/messages" || !parsed.username().is_empty() || parsed.password().is_some() || parsed.fragment().is_some() {
    return Err("Unsafe Graph continuation; mailbox completeness unknown".into());
  }
  Ok(url.into())
}
fn source_link(value: &str) -> bool {
  url::Url::parse(value).map(|url| url.scheme() == "https" && matches!(url.host_str(), Some("outlook.office.com" | "outlook.office365.com" | "outlook.live.com"))
    && url.username().is_empty() && url.password().is_none() && url.port().is_none()).unwrap_or(false)
}
fn complete_source(messages: &[Value], conversation: &str) -> Option<String> {
  if messages.is_empty() || messages.len() > 50 { return None; }
  let mut seen = std::collections::HashSet::new();
  let mut blocks = Vec::new();
  for message in messages {
    if message["conversationId"].as_str()? != conversation || message["isDraft"].as_bool()? { return None; }
    let id = message["id"].as_str()?;
    let content = message.pointer("/body/content").and_then(Value::as_str)?;
    if !seen.insert(id) || !message.pointer("/body/contentType").and_then(Value::as_str)?.eq_ignore_ascii_case("text") || content.trim().is_empty() { return None; }
    let date = message["sentDateTime"].as_str().or_else(|| message["receivedDateTime"].as_str())?;
    let timestamp = chrono::DateTime::parse_from_rfc3339(date).ok()?.timestamp();
    let sender = message.pointer("/from/emailAddress/address").and_then(Value::as_str)?;
    let link = message["webLink"].as_str()?;
    if sender.is_empty() || !source_link(link) { return None; }
    let recipients = message["toRecipients"].as_array()?.iter().filter_map(|row| row.pointer("/emailAddress/address").and_then(Value::as_str)).collect::<Vec<_>>().join(", ");
    blocks.push((timestamp, format!("Source: {link}\nFrom: {sender}\nTo: {recipients}\nDate: {date}\n{content}")));
  }
  blocks.sort_by_key(|row| row.0);
  Some(blocks.into_iter().map(|row| row.1).collect::<Vec<_>>().join("\n\n"))
}

async fn scan<F, Fut>(expected_owner: Option<&str>, mut get: F) -> Result<Value, String>
where F: FnMut(String, Vec<(String, String)>) -> Fut, Fut: Future<Output=Result<Value, String>> {
  let profile = get(format!("{GRAPH}/me"), vec![("$select".into(), "mail,userPrincipalName".into())]).await?;
  let owner = profile["mail"].as_str().filter(|v| !v.is_empty()).or_else(|| profile["userPrincipalName"].as_str()).filter(|v| v.contains('@')).ok_or("Mailbox identity unavailable")?;
  if expected_owner.map(|expected| !owner.eq_ignore_ascii_case(expected)).unwrap_or(false) { return Err("Outlook mailbox identity differs from the selected connection; no messages were read".into()); }
  let cutoff = (Utc::now() - Duration::days(14)).format("%Y-%m-%dT%H:%M:%SZ").to_string();
  let listing = get(format!("{GRAPH}/me/mailFolders/sentitems/messages"), vec![("$filter".into(), format!("sentDateTime ge {cutoff}")), ("$orderby".into(), "sentDateTime desc".into()), ("$top".into(), "10".into()), ("$select".into(), "id,conversationId".into())]).await?;
  let mut conversations = Vec::new();
  for row in listing["value"].as_array().ok_or("Missing sent message collection")?.iter().take(10) {
    if let Some(id) = row["conversationId"].as_str().filter(|v| !v.is_empty() && v.len() <= 1000) { if !conversations.contains(&id.to_string()) { conversations.push(id.to_string()); } }
  }
  let mut source = String::new(); let mut skipped = 0; let mut reads = 0; let mut links = Vec::new();
  for conversation in conversations {
    let mut url = format!("{GRAPH}/me/messages");
    let mut params = vec![("$filter".into(), format!("conversationId eq '{}'", conversation.replace('\'', "''"))), ("$top".into(), "25".into()), ("$select".into(), "id,conversationId,isDraft".into())];
    let mut rows = Vec::new(); let mut complete = false;
    for _ in 0..2 {
      let page = get(url.clone(), params.clone()).await?;
      let values = page["value"].as_array().ok_or("Missing conversation collection")?;
      if values.len() > 25 { break; }
      rows.extend(values.iter().cloned());
      if let Some(next) = page["@odata.nextLink"].as_str().filter(|v| !v.is_empty()) { url = continuation(next)?; params.clear(); }
      else { complete = true; break; }
    }
    if !complete || rows.is_empty() || rows.len() > 50 || reads + rows.len() > 100 { skipped += 1; continue; }
    let mut messages = Vec::new();
    for row in rows {
      let id = match row["id"].as_str().filter(|v| !v.is_empty() && v.len() <= 2000) { Some(v) => v, None => { messages.clear(); break; } };
      reads += 1;
      let mut url = url::Url::parse(&format!("{GRAPH}/me/messages/")).map_err(|e| e.to_string())?;
      url.path_segments_mut().map_err(|_| "Invalid message path")?.pop_if_empty().push(id);
      messages.push(get(url.to_string(), vec![("$select".into(), SELECT.into())]).await?);
    }
    let block = match complete_source(&messages, &conversation) { Some(v) => v, None => { skipped += 1; continue; } };
    if source.chars().count() + block.chars().count() + 2 > 22000 { skipped += 1; continue; }
    source.push_str(&block); source.push_str("\n\n");
    for message in messages { if let Some(link) = message["webLink"].as_str() { if !links.contains(&link.to_string()) { links.push(link.to_string()); } } }
  }
  if source.trim().is_empty() { return Err("No complete Outlook conversations within scan bounds. Supply notes; earlier snippets were not used.".into()); }
  Ok(json!({"source":source,"owner":owner,"links":links,"skipped":skipped,"resolution_scope":"current mailbox snapshot; missing/deleted messages cannot be verified"}))
}

async fn source_impl(params: &OutlookSourceRequest) -> Result<Value, String> {
  if !matches!(params.action.as_str(), "accounts" | "scan") { return Err("Only read-only accounts/scan supported".into()); }
  let home = super::service::clawdbot_home_headless()?;
  let tokens: Value = serde_json::from_slice(&std::fs::read(home.join("tokens.json")).map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
  let owner = tokens["knapsack_email"].as_str().filter(|v| !v.is_empty()).ok_or("Sign in to Knapsack for connected Outlook accounts; supplied local notes need no account.")?;
  let accounts: Vec<_> = UserConnection::find_by_user_email(owner.into()).map_err(|e| e.to_string())?.into_iter()
    .filter(|row| row.connection.as_ref().map(|c| c.scope == MICROSOFT_OUTLOOK_SCOPE).unwrap_or(false))
    .map(|row| (if row.calendar_account_email.is_empty() { owner.into() } else { row.calendar_account_email.clone() }, row)).collect();
  if params.action == "accounts" { return Ok(json!({"accounts":accounts.iter().map(|row| &row.0).collect::<Vec<_>>()})); }
  let account = params.account_email.as_deref().filter(|v| !v.is_empty()).ok_or("Choose a connected Outlook account explicitly")?;
  let matching: Vec<_> = accounts.into_iter().filter(|row| row.0.eq_ignore_ascii_case(account)).collect();
  if matching.len() != 1 { return Err("Outlook connection is missing or ambiguous; reconnect before scanning".into()); }
  let (_, connection) = matching.into_iter().next().ok_or("Outlook account is no longer connected")?;
  if connection.refresh_token.as_deref().filter(|v| !v.is_empty()).is_none() { return Err("Outlook refresh token unavailable; reconnect in Home".into()); }
  let refreshed = refresh_user_connection(connection, owner.into()).await.map_err(|_| "Outlook connection refresh failed; no conversation was read")?;
  let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(15)).redirect(reqwest::redirect::Policy::none()).build().map_err(|e| e.to_string())?;
  let identity_file = home.join("tokens.json");
  let identity = owner.to_string();
  let result = tokio::time::timeout(std::time::Duration::from_secs(60), scan(Some(account), |url, params| {
    let identity_file = identity_file.clone(); let identity = identity.clone();
    let client = client.clone(); let token = refreshed.token.clone();
    async move {
      let current: Value = serde_json::from_slice(&std::fs::read(identity_file).map_err(|_| "Account session unavailable")?).map_err(|_| "Account session unavailable")?;
      if current["knapsack_email"].as_str() != Some(identity.as_str()) { return Err("Account changed; Outlook scan canceled".into()); }
      let response = client.get(url).bearer_auth(token).header("Prefer", "outlook.body-content-type=\"text\"").query(&params).send().await.map_err(|_| "Outlook read failed; latest status unknown")?;
      if !response.status().is_success() { return Err("Outlook read rejected; latest status unknown".into()); }
      response.json::<Value>().await.map_err(|_| "Invalid Outlook response".into())
    }
  })).await.map_err(|_| "Outlook scan exceeded 60 seconds; latest status unknown, no source accepted")??;
  let current: Value = serde_json::from_slice(&std::fs::read(home.join("tokens.json")).map_err(|_| "Account session unavailable")?).map_err(|_| "Account session unavailable")?;
  if current["knapsack_email"].as_str() != Some(owner) { return Err("Account changed; Outlook result discarded".into()); }
  if !result["owner"].as_str().map(|value| value.eq_ignore_ascii_case(account)).unwrap_or(false) { return Err("Outlook mailbox identity differs from the selected connection; reconnect before scanning".into()); }
  Ok(result)
}

#[actix_web::post("/api/clawd/outlook/follow-up-source")]
pub async fn follow_up_source(params: web::Json<OutlookSourceRequest>) -> impl Responder {
  match source_impl(&params).await { Ok(value) => HttpResponse::Ok().json(value), Err(error) => HttpResponse::BadRequest().json(json!({"error":error})) }
}

#[cfg(test)]
mod tests {
  use super::*;
  fn message(id: &str, text: &str, date: &str) -> Value { json!({"id":id,"conversationId":"thread","isDraft":false,"from":{"emailAddress":{"address":"alex@example.com"}},"toRecipients":[],"sentDateTime":date,"body":{"contentType":"text","content":text},"webLink":"https://outlook.office.com/mail/id/fixture"}) }
  #[test]
  fn complete_source_requires_full_bodies_and_latest_order() {
    let initial = message("1", "I will send the plan.", "2026-10-01T00:00:00Z");
    let later = message("2", "Plan sent, complete.", "2026-10-02T00:00:00Z");
    let text = complete_source(&[later, initial.clone()], "thread").unwrap();
    assert!(text.find("I will").unwrap() < text.find("Plan sent").unwrap());
    let mut html = initial.clone(); html["body"]["contentType"] = json!("html");
    assert!(complete_source(&[html], "thread").is_none());
    assert!(complete_source(&[initial.clone(), initial], "thread").is_none());
  }
  #[test]
  fn continuation_never_discloses_token_elsewhere() {
    assert!(continuation("https://graph.microsoft.com/v1.0/me/messages?$skiptoken=opaque").is_ok());
    for url in ["https://evil.example/v1.0/me/messages", "https://graph.microsoft.com:444/v1.0/me/messages", "https://graph.microsoft.com/v1.0/users/other/messages", "https://user@graph.microsoft.com/v1.0/me/messages"] { assert!(continuation(url).is_err()); }
  }
  #[tokio::test]
  async fn scan_paginates_and_gets_full_messages() {
    let mut calls = Vec::new();
    let result = scan(Some("alex@example.com"), |url, params| { calls.push((url.clone(), params.clone())); async move { Ok(if url.ends_with("/me") { json!({"mail":"alex@example.com"}) }
      else if url.contains("sentitems") { json!({"value":[{"conversationId":"thread"},{"conversationId":"thread"}]}) }
      else if url.contains("skiptoken") { json!({"value":[{"id":"2"}]}) }
      else if url.ends_with("/messages") { json!({"value":[{"id":"1"}],"@odata.nextLink":"https://graph.microsoft.com/v1.0/me/messages?$skiptoken=opaque"}) }
      else if url.ends_with("/1") { message("1", "I will send the plan.", "2026-10-01T00:00:00Z") }
      else { message("2", "Already sent, complete.", "2026-10-02T00:00:00Z") }) } }).await.unwrap();
    assert!(result["source"].as_str().unwrap().contains("Already sent"));
    assert_eq!(calls.len(), 6); assert!(calls[3].1.is_empty());
    assert_eq!(result["owner"], "alex@example.com");
  }
  #[tokio::test]
  async fn incomplete_pagination_never_extracts_earlier_message() {
    let result = scan(None, |url, _| async move { Ok(if url.ends_with("/me") { json!({"mail":"alex@example.com"}) } else if url.contains("sentitems") { json!({"value":[{"conversationId":"thread"}]}) } else { json!({"value":[{"id":"1"}],"@odata.nextLink":"https://graph.microsoft.com/v1.0/me/messages?$skiptoken=next"}) }) }).await;
    assert!(result.unwrap_err().contains("No complete"));
  }
  #[tokio::test]
  async fn mailbox_mismatch_stops_before_message_reads() {
    let mut calls = 0;
    let result = scan(Some("selected@example.com"), |_, _| { calls += 1; async { Ok(json!({"mail":"other@example.com"})) } }).await;
    assert!(result.unwrap_err().contains("no messages were read"));
    assert_eq!(calls, 1);
  }
  #[tokio::test]
  async fn sent_listing_limit_is_enforced_locally() {
    let mut reads = 0;
    let result = scan(None, |url, params| {
      let conversation = params.iter().find(|row| row.0 == "$filter").map(|row| row.1.split('\'').nth(1).unwrap_or("").to_string());
      let data = if url.ends_with("/me") { json!({"mail":"alex@example.com"}) }
      else if url.contains("sentitems") { json!({"value":(0..15).map(|id| json!({"conversationId":id.to_string()})).collect::<Vec<_>>()}) }
      else if url.ends_with("/messages") { json!({"value":[{"id":conversation.unwrap()}]}) }
      else { reads += 1; let id = url.rsplit('/').next().unwrap(); let mut row = message(id,"I will send the plan.","2026-10-01T00:00:00Z"); row["conversationId"] = json!(id); row };
      async move { Ok(data) }
    }).await.unwrap();
    assert_eq!(reads, 10); assert_eq!(result["skipped"], 0);
  }
  #[tokio::test]
  async fn full_body_read_budget_discards_remaining_whole_conversations() {
    let mut reads = 0;
    let result = scan(None, |url, params| {
      let conversation = params.iter().find(|row| row.0 == "$filter").map(|row| row.1.split('\'').nth(1).unwrap_or("").to_string());
      let data = if url.ends_with("/me") { json!({"mail":"alex@example.com"}) }
      else if url.contains("sentitems") { json!({"value":(0..10).map(|id| json!({"conversationId":id.to_string()})).collect::<Vec<_>>()}) }
      else if url.ends_with("/messages") { let conversation = conversation.unwrap(); json!({"value":(0..20).map(|id| json!({"id":format!("{conversation}-{id}")})).collect::<Vec<_>>()}) }
      else { reads += 1; let id = url.rsplit('/').next().unwrap(); let mut row = message(id,"x","2026-10-01T00:00:00Z"); row["conversationId"] = json!(id.split('-').next().unwrap()); row };
      async move { Ok(data) }
    }).await.unwrap();
    assert_eq!(reads, 100); assert_eq!(result["skipped"], 5);
  }
}
