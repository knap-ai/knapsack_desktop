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
pub async fn send_gmail_email(user_email:&str,user_name:&str,to:&str,cc:Option<&str>,subject:&str,body:&str,thread_id:Option<&str>,attachments:Option<&[EmailAttachment]>)->Result<String,String>{send_gmail_email_from_account(user_email,user_email,user_name,to,cc,subject,body,thread_id,attachments).await}
pub async fn send_gmail_email_from_account(
  user_email: &str,
  account_email: &str,
  user_name: &str,
  to: &str,
  cc: Option<&str>,
  subject: &str,
  body: &str,
  thread_id: Option<&str>,
  attachments: Option<&[EmailAttachment]>,
) -> Result<String, String> {
  let connections = UserConnection::find_by_user_email(user_email.to_string()).map_err(|_| "Cannot read connected Gmail accounts")?;
  let mut selected = connections.into_iter().filter(|row| row.connection.as_ref().is_some_and(|c| c.scope == GOOGLE_GMAIL_SCOPE)
    && super::mail_sender::mailbox_matches(user_email, &row.calendar_account_email, account_email)).collect::<Vec<_>>();
  if selected.len() != 1 { return Err("Choose one connected Gmail mailbox; the selection is missing or ambiguous.".into()) }
  let user_connection = selected.remove(0);
  let access_token = refresh_connection_token(user_email.to_string(), user_connection).await.map_err(|_| "Could not refresh the existing Gmail connection")?;
  // 2. Build the MIME message
  let message_id = format!("<{}.knapsack@gmail.com>", Uuid::new_v4());
  let full_sender = if user_name.is_empty() {
    account_email.to_string()
  } else {
    format!("{} <{}>", user_name, account_email)
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
  pub connection_id: Option<u64>,
  pub expected_studio_owner: Option<String>,
  #[serde(default)]
  pub desktop_mailboxes: bool,
  pub query: Option<String>,
  pub max_results: Option<u32>,
  pub page_token: Option<String>,
  pub message_id: Option<String>,
}

struct NativeGmailMailbox {
  account: String,
  owner: String,
  connection: UserConnection,
}

fn select_native_gmail_account<'a>(
  accounts: &'a [NativeGmailMailbox], requested: Option<&str>, connection_id: Option<u64>, desktop: bool,
) -> Result<&'a NativeGmailMailbox, String> {
  let identities = accounts.iter().map(|mailbox| super::google_capabilities::MailboxIdentity {
    email: mailbox.account.clone(), id: mailbox.connection.id.unwrap_or(0),
  }).collect::<Vec<_>>();
  let index = super::google_capabilities::select_mailbox(&identities, requested, connection_id, desktop)?;
  Ok(&accounts[index])
}

fn selected_grant_is_current(selected: &UserConnection, current: &[UserConnection]) -> bool {
  current.iter().any(|row| row.id == selected.id && row.user_id == selected.user_id
    && row.connection_id == selected.connection_id
    && row.connection.as_ref().map(|c| c.scope.as_str()) == Some(GOOGLE_GMAIL_SCOPE)
    && row.calendar_account_email == selected.calendar_account_email
    && row.token == selected.token && row.refresh_token == selected.refresh_token)
}

async fn mailbox_access_token<F, Fut>(mailbox: &NativeGmailMailbox, refresh: F) -> Result<String, String>
where F: FnOnce(String, String) -> Fut, Fut: std::future::Future<Output = Result<String, String>> {
  if mailbox.connection.token.trim().is_empty() {
    return Err(format!("Gmail credentials unavailable for {}, connection {:?}. No other inbox was read.", mailbox.account, mailbox.connection.id));
  }
  refresh(mailbox.account.clone(), mailbox.connection.token.clone()).await.map_err(|reason| {
    let kind = if reason.contains("invalid_grant") || reason.contains("Invalid refresh token") { "authentication expired" } else { "token refresh temporarily unavailable" };
    format!("Gmail {kind} for {}, connection {:?}. No saved grant was changed and no other inbox was read.", mailbox.account, mailbox.connection.id)
  })
}

// Same saved-connection boundary as get_connections(all_users=true) and
// Autopilot's connectedEmailAccountEmails. A local user row alone is not a grant.
fn desktop_gmail_mailboxes() -> Result<(Vec<NativeGmailMailbox>, Vec<String>), String> {
  use crate::db::models::user::User;
  let users = User::find_all_with_email().map_err(|_| "Could not enumerate saved mailbox profiles.")?;
  let mut mailboxes = Vec::new();
  let mut unavailable = Vec::new();
  for user in users {
    match UserConnection::find_by_user_email(user.email.clone()) {
      Ok(connections) => for connection in connections {
        if connection.connection.as_ref().map(|c| c.scope.as_str()) != Some(GOOGLE_GMAIL_SCOPE) { continue; }
        if connection.id.is_none() { continue; }
        let account = if connection.calendar_account_email.trim().is_empty() {
          user.email.clone()
        } else { connection.calendar_account_email.trim().to_string() };
        mailboxes.push(NativeGmailMailbox { account, owner: user.email.clone(), connection });
      },
      Err(_) => unavailable.push(user.email),
    }
  }
  Ok((mailboxes, unavailable))
}

/// Exact capability inventory shared by prompt construction and the read tool.
/// Never union grants belonging to unrelated local profile owners.
pub(super) fn native_gmail_inventory() -> Result<(String, Vec<(String, UserConnection)>), String> {
  use serde_json::Value;
  let home = super::service::clawdbot_home_headless()?;
  let tokens: Value = serde_json::from_slice(&std::fs::read(home.join("tokens.json"))
    .map_err(|e| e.to_string())?).map_err(|e| e.to_string())?;
  let owner = tokens.get("knapsack_email").and_then(Value::as_str)
    .map(str::trim).filter(|v| !v.is_empty()).ok_or("Sign in to Knapsack to access connected Gmail accounts.")?;
  let accounts: Vec<_> = UserConnection::find_by_user_email(owner.to_string())
    .map_err(|e| e.to_string())?.into_iter()
    .filter(|c| c.connection.as_ref().map(|v| v.scope == GOOGLE_GMAIL_SCOPE).unwrap_or(false))
    .map(|c| (if c.calendar_account_email.is_empty() { owner.to_string() } else { c.calendar_account_email.clone() }, c))
    .collect();
  Ok((owner.to_string(), accounts))
}

pub(super) async fn native_gmail_read_impl(params: &NativeGmailRead) -> Result<serde_json::Value, String> {
  use serde_json::{json, Value};
  if !matches!(params.action.as_str(), "accounts" | "list" | "get" | "thread") {
    return Err("Native Gmail supports read-only actions: accounts, list, get.".into());
  }
  let (studio_owner, studio_accounts) = native_gmail_inventory()?;
  if params.expected_studio_owner.as_deref().is_some_and(|expected| !expected.eq_ignore_ascii_case(&studio_owner)) {
    return Err("Studio identity changed during this request. Refresh accounts; no inbox was read.".into());
  }
  let (accounts, unavailable_profiles) = if params.desktop_mailboxes {
    desktop_gmail_mailboxes()?
  } else {
    (studio_accounts.into_iter().map(|(account, connection)| NativeGmailMailbox {
      account, owner: studio_owner.clone(), connection,
    }).collect(), Vec::new())
  };
  if params.action == "accounts" {
    let mut available = accounts.iter().filter(|m| !m.connection.token.trim().is_empty())
      .map(|m| m.account.clone()).collect::<Vec<_>>();
    available.sort(); available.dedup();
    return Ok(json!({"provider":"native_google", "studio_owner_email":studio_owner,
      "access_scope":if params.desktop_mailboxes {"desktop_autopilot_connections"} else {"studio_owner"},
      "authentication":"saved_grants_not_freshly_validated", "accounts":available,
      "unavailable_profiles":unavailable_profiles,
      "connections":accounts.iter().map(|m| json!({"account_email":m.account,
        "owner_email":m.owner,"connection_id":m.connection.id,
        "available":!m.connection.token.trim().is_empty(),
        "credential_state":if m.connection.token.trim().is_empty() {"missing"} else {"saved_not_validated"}})).collect::<Vec<_>>() }));
  }
  let mailbox = select_native_gmail_account(&accounts, params.account_email.as_deref(), params.connection_id, params.desktop_mailboxes)?;
  let account = &mailbox.account;
  let connection = &mailbox.connection;
  let message_id = if matches!(params.action.as_str(), "get" | "thread") {
    Some(params.message_id.as_deref().filter(|id| !id.is_empty() && id.bytes().all(|b| b.is_ascii_alphanumeric()))
      .ok_or("message_id must be the exact Gmail message ID returned by list.")?)
  } else { None };
  // Read-only refresh: the shared refresh_connection_token helper deletes
  // invalid grants. A Scout read must preserve the saved connection instead.
  let token = mailbox_access_token(mailbox, |account, token| async move {
    crate::connections::google::auth::google_refresh_token(account, token).await.map_err(|e| e.to_string())
  }).await?;
  let current = UserConnection::find_by_user_email(mailbox.owner.clone()).map_err(|_| "Could not revalidate the selected saved grant.")?;
  let still_authorized = selected_grant_is_current(connection, &current);
  if !still_authorized { return Err("The selected Gmail grant changed or was removed. Refresh accounts; no inbox was read.".into()); }
  if let Some(expected) = params.expected_studio_owner.as_deref() {
    let (current_owner, _) = native_gmail_inventory()?;
    if !expected.eq_ignore_ascii_case(&current_owner) { return Err("Studio identity changed during authentication. No inbox was read.".into()); }
  }
  let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(20))
    .redirect(reqwest::redirect::Policy::none()).build().map_err(|e| e.to_string())?;
  // Saved labels are not proof of the OAuth token's mailbox identity. Verify
  // read-only account metadata before any message-content request.
  let profile_response = client.get("https://gmail.googleapis.com/gmail/v1/users/me/profile")
    .bearer_auth(&token).timeout(std::time::Duration::from_secs(8)).send().await
    .map_err(|_| format!("Could not verify the selected Gmail mailbox {account}. No messages were read."))?;
  if !profile_response.status().is_success() {
    return Err(format!("Gmail identity verification returned {} for {account}. No messages were read.", profile_response.status()));
  }
  let profile: Value = profile_response.json().await.map_err(|_| "Invalid Gmail identity response; no messages were read.")?;
  super::google_capabilities::verify_mailbox_identity(profile.get("emailAddress").and_then(Value::as_str), account)?;
  // Recheck after the identity request as well; saved-grant revocation or a
  // Studio sign-in change during the await cannot authorize a content read.
  let current = UserConnection::find_by_user_email(mailbox.owner.clone()).map_err(|_| "Could not revalidate the selected grant.")?;
  if !selected_grant_is_current(connection, &current) { return Err("Selected Gmail grant was removed or replaced. No messages were read.".into()); }
  if let Some(expected) = params.expected_studio_owner.as_deref() {
    let (current_owner, _) = native_gmail_inventory()?;
    if !expected.eq_ignore_ascii_case(&current_owner) { return Err("Studio identity changed. No messages were read.".into()); }
  }
  let url = match message_id {
    Some(id) if params.action == "thread" => format!("https://gmail.googleapis.com/gmail/v1/users/me/threads/{id}"),
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
    return Err(format!("Native Gmail API returned {status} for {account}, connection {:?}. No other inbox was read.", connection.id));
  }
  Ok(json!({"provider":"native_google", "account_email":account, "owner_email":mailbox.owner, "connection_id":connection.id, "result":body}))
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
  fn account(email: &str) -> NativeGmailMailbox {
    NativeGmailMailbox { account: email.into(), owner: email.into(), connection: UserConnection { id: None, user_id: 1, connection_id: 1,
      token: String::new(), refresh_token: None, connection: None, last_synced: None,
      calendar_account_email: email.into() }}
  }
  #[test]
  fn native_gmail_requires_an_explicit_account_when_ambiguous() {
    let accounts = vec![account("a@example.com"), account("b@example.com")];
    assert!(select_native_gmail_account(&accounts, None, None, false).is_err());
    assert!(select_native_gmail_account(&accounts, Some("stranger@example.com"), None, false).is_err());
    assert_eq!(select_native_gmail_account(&accounts, Some("B@example.com"), None, false).unwrap().account, "b@example.com");
    assert_eq!(select_native_gmail_account(&accounts[..1], None, None, false).unwrap().account, "a@example.com");
    assert!(select_native_gmail_account(&[], None, None, false).is_err());
  }
  #[tokio::test]
  async fn native_gmail_refuses_writes_before_accessing_credentials() {
    let request: NativeGmailRead = serde_json::from_value(serde_json::json!({"action":"send"})).unwrap();
    assert!(native_gmail_read_impl(&request).await.unwrap_err().contains("read-only"));
  }
  #[test]
  fn revoked_or_replaced_saved_grants_cannot_reuse_an_old_selection() {
    use crate::db::models::connection::Connection;
    let mut mailbox = account("a@example.invalid");
    mailbox.connection.id = Some(17);
    mailbox.connection.token = "synthetic-old".into();
    mailbox.connection.connection = Some(Connection { id: Some(1), scope: GOOGLE_GMAIL_SCOPE.into(), provider: "google".into() });
    assert!(selected_grant_is_current(&mailbox.connection, &[mailbox.connection.clone()]));
    assert!(!selected_grant_is_current(&mailbox.connection, &[]));
    let mut replaced = mailbox.connection.clone(); replaced.token = "synthetic-new".into();
    assert!(!selected_grant_is_current(&mailbox.connection, &[replaced]));
    let mut other = mailbox.connection.clone(); other.user_id += 1;
    assert!(!selected_grant_is_current(&mailbox.connection, &[other]));
  }
  #[tokio::test]
  async fn expired_account_does_not_delete_grants_or_fall_back_to_another_inbox() {
    let mut first = account("a@example.invalid"); first.connection.token = "synthetic-a".into();
    let mut second = account("b@example.invalid"); second.connection.token = "synthetic-b".into();
    let failed = mailbox_access_token(&first, |email, token| async move {
      assert_eq!(email, "a@example.invalid"); assert_eq!(token, "synthetic-a");
      Err("invalid_grant; secret diagnostic must not escape".into())
    }).await.unwrap_err();
    assert!(failed.contains("authentication expired for a@example.invalid"));
    assert!(!failed.contains("secret diagnostic"));
    assert_eq!(first.connection.token, "synthetic-a");
    let success = mailbox_access_token(&second, |email, token| async move {
      assert_eq!(email, "b@example.invalid"); assert_eq!(token, "synthetic-b"); Ok("synthetic-access".into())
    }).await.unwrap();
    assert_eq!(success, "synthetic-access");
  }
  #[tokio::test]
  async fn missing_credentials_do_not_attempt_refresh_and_transient_failure_is_not_expiry() {
    let mut mailbox = account("a@example.invalid");
    assert!(mailbox_access_token(&mailbox, |_, _| async { panic!("No refresh without a saved credential") }).await.unwrap_err().contains("credentials unavailable"));
    mailbox.connection.token = "synthetic".into();
    let error = mailbox_access_token(&mailbox, |_, _| async { Err("network timeout".into()) }).await.unwrap_err();
    assert!(error.contains("temporarily unavailable")); assert!(!error.contains("expired"));
  }

}
