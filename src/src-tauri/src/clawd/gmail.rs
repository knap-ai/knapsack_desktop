use actix_web::{get, web, HttpResponse, Responder};
use base64::{
  engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD},
  Engine,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::connections::google::auth::refresh_connection_token;
use crate::connections::google::constants::GOOGLE_GMAIL_SCOPE;
use crate::db::models::email::Email;
use crate::db::models::user_connection::UserConnection;

#[derive(Debug, Deserialize)]
pub struct UnreadImportantParams {
  /// Max number of emails to return.
  pub top: Option<usize>,
}

#[derive(Debug, Serialize)]
pub struct UnreadImportantEmail {
  pub email_uid: String,
  pub subject: String,
  pub sender: String,
  pub date: u64,
  pub is_starred: Option<bool>,
  pub is_read: Option<bool>,
  pub is_archived: Option<bool>,
  pub is_deleted: Option<bool>,
  pub body_preview: String,
}

#[derive(Debug, Serialize)]
pub struct UnreadImportantResponse {
  pub success: bool,
  pub emails: Vec<UnreadImportantEmail>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailAttachment {
  pub filename: String,
  pub mime_type: String,
  pub content: String,
  pub encoding: Option<String>,
}

fn wrap_base64_lines(encoded: &str) -> String {
  encoded
    .as_bytes()
    .chunks(76)
    .map(|chunk| String::from_utf8_lossy(chunk).to_string())
    .collect::<Vec<_>>()
    .join("\r\n")
}

/// A lightweight endpoint intended for Clawd integration: provide a bundle of
/// "unread + important" (currently approximated as UNREAD + STARRED) emails.
///
/// The summarization itself can happen either:
/// - via your local LLM endpoint (`/api/knapsack/llm/complete`), or
/// - by forwarding these to Clawdbot.
#[get("/api/clawd/gmail/unread_important")]
pub async fn get_unread_important(query: web::Query<UnreadImportantParams>) -> impl Responder {
  let top = query.top.unwrap_or(10);

  // NOTE: This relies on emails already being synced into the local DB.
  // We currently filter in-memory because Email model APIs are limited.
  let mut emails = Email::get_recent_emails(top * 5);

  emails.retain(|e| e.is_deleted != Some(true));
  emails.retain(|e| e.is_read != Some(true));
  emails.retain(|e| e.is_starred == Some(true));

  let emails = emails.into_iter().take(top).collect::<Vec<_>>();

  let mapped = emails
    .into_iter()
    .map(|e| {
      let body_preview = e.body.chars().take(800).collect::<String>();
      UnreadImportantEmail {
        email_uid: e.email_uid,
        subject: e.subject,
        sender: e.sender,
        date: e.date,
        is_starred: e.is_starred,
        is_read: e.is_read,
        is_archived: e.is_archived,
        is_deleted: e.is_deleted,
        body_preview,
      }
    })
    .collect::<Vec<_>>();

  HttpResponse::Ok().json(UnreadImportantResponse {
    success: true,
    emails: mapped,
  })
}

/// Send an email via the Gmail API using the user's OAuth credentials.
/// Supports both new emails and replies (when thread_id is provided).
pub async fn send_gmail_email(
  user_email: &str,
  user_name: &str,
  to: &str,
  cc: Option<&str>,
  subject: &str,
  body: &str,
  thread_id: Option<&str>,
  attachments: Option<&[EmailAttachment]>,
) -> Result<String, String> {
  // 1. Get OAuth access token
  let scope = GOOGLE_GMAIL_SCOPE.to_string();
  let user_connection = UserConnection::find_by_user_email_and_scope(user_email.to_string(), scope)
    .map_err(|e| format!("Email account not connected: {:?}", e))?;

  let access_token = refresh_connection_token(user_email.to_string(), user_connection)
    .await
    .map_err(|e| format!("Failed to refresh auth token: {:?}", e))?;

  // 2. Build the MIME message
  let message_id = format!("<{}.knapsack@gmail.com>", Uuid::new_v4());
  let full_sender = if user_name.is_empty() {
    user_email.to_string()
  } else {
    format!("{} <{}>", user_name, user_email)
  };

  let has_attachments = attachments.map(|items| !items.is_empty()).unwrap_or(false);
  let boundary = format!("knapsack-boundary-{}", Uuid::new_v4());
  let mut headers = vec!["MIME-Version: 1.0".to_string()];
  if has_attachments {
    headers.push(format!(
      "Content-Type: multipart/mixed; boundary=\"{}\"",
      boundary
    ));
  } else {
    headers.push("Content-Type: text/html; charset=utf-8".to_string());
  }
  headers.extend([
    format!("Message-ID: {}", message_id),
    format!("Subject: {}", subject),
    format!("From: {}", full_sender),
    format!("To: {}", to),
  ]);

  if let Some(cc_val) = cc {
    if !cc_val.is_empty() {
      headers.push(format!("Cc: {}", cc_val));
    }
  }

  let html_body = format!("<div dir=\"ltr\">{}</div>", body);

  let raw_message = if has_attachments {
    let mut parts = vec![
      format!("{}\r\n", headers.join("\r\n")),
      format!("--{}\r\n", boundary),
      "Content-Type: text/html; charset=utf-8\r\n".to_string(),
      "Content-Transfer-Encoding: 7bit\r\n\r\n".to_string(),
      format!("{}\r\n", html_body),
    ];

    if let Some(items) = attachments {
      for attachment in items {
        let bytes = if attachment.encoding.as_deref() == Some("base64") {
          STANDARD
            .decode(attachment.content.as_bytes())
            .map_err(|e| format!("Invalid attachment base64: {}", e))?
        } else {
          attachment.content.as_bytes().to_vec()
        };
        let encoded_attachment = wrap_base64_lines(&STANDARD.encode(bytes));
        parts.push(format!("--{}\r\n", boundary));
        parts.push(format!(
          "Content-Type: {}; name=\"{}\"\r\n",
          attachment.mime_type, attachment.filename
        ));
        parts.push("Content-Transfer-Encoding: base64\r\n".to_string());
        parts.push(format!(
          "Content-Disposition: attachment; filename=\"{}\"\r\n\r\n",
          attachment.filename
        ));
        parts.push(format!("{}\r\n", encoded_attachment));
      }
    }

    parts.push(format!("--{}--", boundary));
    parts.join("")
  } else {
    format!("{}\r\n\r\n{}", headers.join("\r\n"), html_body)
  };
  let encoded = URL_SAFE_NO_PAD.encode(raw_message.as_bytes());

  // 3. Send via Gmail API
  let mut payload = serde_json::json!({ "raw": encoded });
  if let Some(tid) = thread_id {
    if !tid.is_empty() {
      payload["threadId"] = serde_json::json!(tid);
    }
  }

  let client = reqwest::Client::new();
  let resp = client
    .post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
    .bearer_auth(&access_token)
    .json(&payload)
    .send()
    .await
    .map_err(|e| format!("Gmail API request failed: {}", e))?;

  if resp.status().is_success() {
    let resp_body: serde_json::Value = resp
      .json()
      .await
      .map_err(|e| format!("Failed to parse Gmail response: {}", e))?;
    let msg_id = resp_body["id"].as_str().unwrap_or("unknown").to_string();
    Ok(format!("Email sent successfully (message ID: {})", msg_id))
  } else {
    let status = resp.status();
    let error_text = resp
      .text()
      .await
      .unwrap_or_else(|_| "unknown error".to_string());
    Err(format!("Gmail API error ({}): {}", status, error_text))
  }
}

/// Read-only agent access through the Google accounts connected on this desktop.
/// This endpoint never sends Gmail requests to Studio or Composio.
#[derive(Debug, Deserialize)]
pub struct NativeGmailRead {
  pub action: String,
  pub account_email: Option<String>,
  pub query: Option<String>,
  pub max_results: Option<u32>,
  pub page_token: Option<String>,
  pub message_id: Option<String>,
}

fn select_native_gmail_account<'a>(
  accounts: &'a [(String, UserConnection)], requested: Option<&str>,
) -> Result<&'a (String, UserConnection), String> {
  if let Some(requested) = requested.filter(|s| !s.trim().is_empty()) {
    return accounts.iter().find(|(email, _)| email.eq_ignore_ascii_case(requested.trim()))
      .ok_or_else(|| "That Gmail account is not connected on this desktop. Use action accounts.".into());
  }
  if accounts.len() == 1 { return Ok(&accounts[0]); }
  Err("Choose account_email from action accounts; no account is selected implicitly when multiple Gmail accounts are connected.".into())
}

async fn native_gmail_read_impl(params: &NativeGmailRead) -> Result<serde_json::Value, String> {
  use serde_json::{json, Value};
  if !matches!(params.action.as_str(), "accounts" | "list" | "get") {
    return Err("Native Gmail supports read-only actions: accounts, list, get.".into());
  }
  let home = super::service::clawdbot_home_headless()?;
  let tokens: Value = serde_json::from_slice(&std::fs::read(home.join("tokens.json"))
    .map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
  let owner = tokens.get("knapsack_email").and_then(Value::as_str)
    .filter(|v| !v.is_empty()).ok_or("Sign in to Knapsack to access connected Gmail accounts.")?;
  let accounts: Vec<_> = UserConnection::find_by_user_email(owner.to_string())
    .map_err(|e| e.to_string())?.into_iter()
    .filter(|c| c.connection.as_ref().map(|v| v.scope == GOOGLE_GMAIL_SCOPE).unwrap_or(false))
    .map(|c| (if c.calendar_account_email.is_empty() { owner.to_string() } else { c.calendar_account_email.clone() }, c))
    .collect();
  if params.action == "accounts" {
    return Ok(json!({"provider":"native_google", "accounts":accounts.iter().map(|(email,_)| email).collect::<Vec<_>>()}));
  }
  let (account, connection) = select_native_gmail_account(&accounts, params.account_email.as_deref())?;
  let message_id = if params.action == "get" {
    Some(params.message_id.as_deref().filter(|id| !id.is_empty() && id.bytes().all(|b| b.is_ascii_alphanumeric()))
      .ok_or("message_id must be the exact Gmail message ID returned by list.")?)
  } else { None };
  let token = refresh_connection_token(owner.to_string(), connection.clone()).await.map_err(|e| e.to_string())?;
  let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(30))
    .redirect(reqwest::redirect::Policy::none()).build().map_err(|e| e.to_string())?;
  let url = match message_id {
    Some(id) => format!("https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}"),
    None => "https://gmail.googleapis.com/gmail/v1/users/me/messages".to_string(),
  };
  let mut request = client.get(url).bearer_auth(token);
  if message_id.is_some() { request = request.query(&[("format", "full")]); }
  else {
    request = request.query(&[("maxResults", params.max_results.unwrap_or(10).clamp(1, 20).to_string())]);
    if let Some(q) = &params.query { request = request.query(&[("q", q)]); }
    if let Some(page) = &params.page_token { request = request.query(&[("pageToken", page)]); }
  }
  let response = request.send().await.map_err(|e| e.to_string())?;
  let status = response.status();
  let body: Value = response.json().await.map_err(|e| e.to_string())?;
  if !status.is_success() {
    return Err(format!("Native Gmail API returned {status}: {}", body.pointer("/error/message").and_then(Value::as_str).unwrap_or("request failed")));
  }
  Ok(json!({"provider":"native_google", "account_email":account, "result":body}))
}

#[actix_web::post("/api/clawd/gmail/read")]
pub async fn native_gmail_read(params: web::Json<NativeGmailRead>) -> impl Responder {
  match native_gmail_read_impl(&params).await {
    Ok(value) => HttpResponse::Ok().json(value),
    Err(error) => HttpResponse::BadRequest().json(serde_json::json!({"error":error})),
  }
}

#[cfg(test)]
mod native_gmail_tests {
  use super::*;
  fn account(email: &str) -> (String, UserConnection) {
    (email.into(), UserConnection { id: None, user_id: 1, connection_id: 1,
      token: String::new(), refresh_token: None, connection: None, last_synced: None,
      calendar_account_email: email.into() })
  }
  #[test]
  fn native_gmail_requires_an_explicit_account_when_ambiguous() {
    let accounts = vec![account("a@example.com"), account("b@example.com")];
    assert!(select_native_gmail_account(&accounts, None).is_err());
    assert!(select_native_gmail_account(&accounts, Some("stranger@example.com")).is_err());
    assert_eq!(select_native_gmail_account(&accounts, Some("B@example.com")).unwrap().0, "b@example.com");
    assert_eq!(select_native_gmail_account(&accounts[..1], None).unwrap().0, "a@example.com");
    assert!(select_native_gmail_account(&[], None).is_err());
  }
  #[tokio::test]
  async fn native_gmail_refuses_writes_before_accessing_credentials() {
    let request: NativeGmailRead = serde_json::from_value(serde_json::json!({"action":"send"})).unwrap();
    assert!(native_gmail_read_impl(&request).await.unwrap_err().contains("read-only"));
  }
}
