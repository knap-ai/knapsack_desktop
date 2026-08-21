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
  owner_email: &str,
  sender_email: &str,
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
  let precise_connection = UserConnection::find_by_scope_and_account_email(
    owner_email.to_string(),
    scope.clone(),
    sender_email.to_string(),
  );
  let user_connection = if sender_email.eq_ignore_ascii_case(owner_email) {
    precise_connection
      .or_else(|_| UserConnection::find_by_user_email_and_scope(owner_email.to_string(), scope))
  } else {
    precise_connection
  }
  .map_err(|e| format!("Email account not connected: {:?}", e))?;

  let access_token = refresh_connection_token(owner_email.to_string(), user_connection)
    .await
    .map_err(|e| format!("Failed to refresh auth token: {:?}", e))?;

  // 2. Build the MIME message
  let message_id = format!("<{}.knapsack@gmail.com>", Uuid::new_v4());
  let full_sender = if user_name.is_empty() {
    sender_email.to_string()
  } else {
    format!("{} <{}>", user_name, sender_email)
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
