use actix_web::{get, post, web::Data, web::Json, HttpRequest, HttpResponse, Responder};
use chrono::{DateTime, Duration, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::connections::api::ConnectionsEnum;
use crate::connections::google::gmail::FetchEmailEventPayload;
use crate::connections::microsoft::auth::refresh_user_connection;
use crate::connections::microsoft::constants::{MICROSOFT_BASE_URL, MICROSOFT_OUTLOOK_SCOPE};
use crate::db::models::email::Email;
use crate::db::models::user_connection::UserConnection;
use crate::error::Error;
use crate::utils::log::knap_log_error;
use crate::ConnectionsData;

use crate::spotlight::WINDOW_LABEL;
use std::fs::OpenOptions;
use std::io::Write;
use tauri::Manager;

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchMicrosoftOutlookParams {
  email: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchMicrosoftOutlookResponse {
  success: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FetchMicrosoftOutlookFailResponse {
  success: bool,
  details: String,
}

#[derive(Debug, Deserialize)]
struct EmailResponse {
  value: Vec<EmailData>,
}

#[derive(Debug, Deserialize)]
struct EmailData {
  id: String,
  subject: Option<String>,
  receivedDateTime: String,
  sender: Option<EmailAddressWrapper>,
  toRecipients: Vec<EmailAddressWrapper>,
  ccRecipients: Option<Vec<EmailAddressWrapper>>,
  body: EmailBody,
  conversationId: Option<String>,
  flag: Option<EmailFlag>,
  isRead: bool,
  parentFolderId: String,
}
#[derive(Debug, Deserialize)]
struct EmailFlag {
  flagStatus: String,
}
#[derive(Debug, Deserialize)]
struct EmailAddressWrapper {
  emailAddress: EmailAddress,
}

#[derive(Debug, Deserialize)]
struct EmailAddress {
  address: String,
}

#[derive(Debug, Deserialize)]
struct EmailBody {
  content: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SetEmailReadResponse {
  message: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SetEmailReadResponseParams {
  email: String,
  message_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReplyEmailParams {
  email: String,
  message_id: String,
  reply_body: String,
  previous_email_body: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReplyEmailResponse {
  message: String,
}

async fn upsert_email_by_uid(
  email_data: EmailData,
  archive_folder_id: String,
  flag_update: bool,
) -> Result<Email, Error> {
  if let Ok(Some(email)) = Email::find_by_uid(&email_data.id) {
    if !flag_update {
      return Ok(email);
    }
  }

  let received_timestamp = DateTime::parse_from_rfc3339(&email_data.receivedDateTime)
    .map(|dt| dt.timestamp() as u64)
    .unwrap_or(0);

  let is_archived = email_data.parentFolderId == archive_folder_id;

  let mut email_entry = Email {
    id: None,
    email_uid: email_data.id,
    subject: email_data.subject.unwrap_or_default(),
    date: received_timestamp,
    sender: email_data
      .sender
      .as_ref()
      .map_or("unknown@domain.com".to_string(), |s| {
        s.emailAddress.address.clone()
      }),
    recipient: email_data
      .toRecipients
      .iter()
      .map(|r| r.emailAddress.address.clone())
      .collect::<Vec<_>>()
      .join(", "),
    cc: email_data
      .ccRecipients
      .unwrap_or_default()
      .iter()
      .map(|r| r.emailAddress.address.clone())
      .collect::<Vec<_>>()
      .join(", "),
    body: email_data.body.content.unwrap_or_default(),
    thread_id: email_data.conversationId,
    is_starred: Some(
      email_data
        .flag
        .as_ref()
        .map_or(false, |flag| flag.flagStatus == "flagged"),
    ),
    is_read: Some(email_data.isRead),
    is_archived: Some(is_archived),
    is_deleted: Some(false),
  };

  email_entry.create();
  Ok(email_entry)
}

async fn get_archive_folder_id(access_token: &str) -> Result<String, Error> {
  let client = Client::new();
  let url = "https://graph.microsoft.com/v1.0/me/mailFolders/archive"; // Diretamente a pasta Archive

  let response = client
    .get(url)
    .header("Authorization", format!("Bearer {}", access_token))
    .send()
    .await?
    .json::<serde_json::Value>()
    .await?;

  if let Some(folder_id) = response["id"].as_str() {
    Ok(folder_id.to_string())
  } else {
    Ok("".to_string())
  }
}

async fn start_outlook_data_fetching(
  email: String,
  connections_data: Arc<Mutex<ConnectionsData>>,
  app_handle: tauri::AppHandle,
) -> Result<(), Error> {
  let user_connection = match UserConnection::find_by_user_email_and_scope(
    email.clone(),
    String::from(MICROSOFT_OUTLOOK_SCOPE),
  ) {
    Ok(user_connection) => user_connection,
    Err(error) => {
      log::error!("Failed to find user connection: {:?}", error);
      let msg = format!("Failed to find user connection for user: {}", email);
      knap_log_error(msg, Some(error), Some(true));
      return Err(Error::KSError("Fail to get user connection".to_string()));
    }
  };

  let update_user_connection = match refresh_user_connection(user_connection.clone(), email.clone()).await {
    Ok(updated_user_connection) => updated_user_connection,
    Err(error) => {
      log::error!("Failed to refresh access token: {:?}", error);
      let msg = format!(
        "Failed to refresh access token in microsoft outlook for user: {}",
        email
      );
      knap_log_error(msg, Some(error), None);
      return Err(Error::KSError("Fail to refresh access token".to_string()));
    }
  };

  if ConnectionsData::lock_and_get_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftOutlook,
  )
  .await
  {
    return Ok(());
  }

  ConnectionsData::lock_and_set_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftOutlook,
    true,
  )
  .await;
  fetch_outlook_emails(email.clone(), update_user_connection.token.clone(), 3, true).await;
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.emit(
    "finish_fetch_email",
    FetchEmailEventPayload { success: true },
  );

  ConnectionsData::lock_and_set_connection_is_syncing(
    connections_data.clone(),
    ConnectionsEnum::MicrosoftOutlook,
    false,
  )
  .await;

  Ok(())
}

pub async fn fetch_outlook_emails(
  email: String,
  access_token: String,
  days: u16,
  flag_update: bool,
) -> Result<(), Error> {
  let client = Client::new();
  let mut older_date = Utc::now();
  let limit_date = Utc::now() - Duration::days(days.into());
  let mut skip = 0;
  let top = 50;
  let mut all_email_uuids = Vec::new();

  loop {
    let url = format!(
      "{}/me/messages?$top={}&$skip={}&$orderby=receivedDateTime desc&$filter=receivedDateTime ge {}",
      MICROSOFT_BASE_URL,
      top,
      skip,
      limit_date.format("%Y-%m-%dT%H:%M:%SZ")
    );

    let response = client
      .get(&url)
      .header("Authorization", format!("Bearer {}", access_token.clone()))
      .send()
      .await?;

    if !response.status().is_success() {
      return Err(Error::from(format!(
        "Error fetching emails: {}",
        response.status()
      )));
    }

    let emails_response: EmailResponse = response.json().await?;
    let emails = emails_response.value;
    let emails_count = emails.len();

    let email_documents = Arc::new(Mutex::new(Vec::new()));

    let archive_folder_id = get_archive_folder_id(&access_token).await?;

    for email_data in emails {
      all_email_uuids.push(email_data.id.clone());
      let email_documents_clone = email_documents.clone();
      let email_record =
        match upsert_email_by_uid(email_data, archive_folder_id.clone(), flag_update.clone()).await
        {
          Ok(email) => email,
          Err(e) => {
            return Err(Error::from(format!(
              "Error creating or updating email: {:?}",
              e
            )));
          }
        };
      email_documents_clone.lock().await.push(email_record);
    }

    let locked_email_docs = email_documents.lock().await;

    let mut sliced_documents: Vec<HashMap<String, serde_json::Value>> = Vec::new();
    for email_doc in locked_email_docs.iter() {
      sliced_documents.append(&mut email_doc.get_documents());
    }
    skip += top;

    if emails_count < top as usize {
      break;
    }
  }

  Email::mark_deleted_emails(&all_email_uuids, 3).await?;

  Ok(())
}

#[get("/api/knapsack/connections/microsoft/outlook")]
async fn fetch_microsoft_email_api(
  req: HttpRequest,
  connections_data: Data<Arc<Mutex<ConnectionsData>>>,
  app_handle: Data<tauri::AppHandle>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchMicrosoftOutlookParams>::from_query(req.query_string()).unwrap();
  let unwrapped_connections_data = connections_data.get_ref().clone();
  let unwrapped_app_handle = app_handle.get_ref().clone();

  match start_outlook_data_fetching(
    params.email.clone(),
    unwrapped_connections_data,
    unwrapped_app_handle,
  )
  .await
  {
    Ok(_) => HttpResponse::Ok().json(FetchMicrosoftOutlookResponse { success: true }),
    Err(error) => {
      log::error!("Fetch emails fail {:?}", error);
      HttpResponse::BadRequest().json(FetchMicrosoftOutlookFailResponse {
        success: false,
        details: format!("Fetch emails error: {:?}", error),
      })
    }
  }
}

#[post("/api/knapsack/connections/microsoft/outlook/read")]
async fn set_email_as_read(payload: Json<SetEmailReadResponseParams>) -> impl Responder {
  let user_connection = match UserConnection::find_by_user_email_and_scope(
    payload.email.clone(),
    String::from(MICROSOFT_OUTLOOK_SCOPE),
  ) {
    Ok(connection) => connection,
    Err(_) => {
      return HttpResponse::BadRequest().json(SetEmailReadResponse {
        message: "Failed to find user connection".to_string(),
      })
    }
  };

  let access_token = match refresh_user_connection(user_connection.clone(), payload.email.clone()).await {
    Ok(updated_user_connection) => updated_user_connection.token,
    Err(_) => {
      return HttpResponse::InternalServerError().json(SetEmailReadResponse {
        message: "Failed to refresh access token".to_string(),
      })
    }
  };

  let client = Client::new();
  let url = format!("{}/me/messages/{}/", MICROSOFT_BASE_URL, payload.message_id);

  let body = serde_json::json!({ "isRead": true });

  let response = client
    .patch(&url)
    .header("Authorization", format!("Bearer {}", access_token))
    .header("Content-Type", "application/json")
    .json(&body)
    .send()
    .await;

  match response {
    Ok(resp) if resp.status().is_success() => HttpResponse::Ok().json(SetEmailReadResponse {
      message: "success".to_string(),
    }),
    Ok(resp) => HttpResponse::InternalServerError().json(SetEmailReadResponse {
      message: format!("Error: {:?}", resp.status()),
    }),
    Err(e) => HttpResponse::InternalServerError().json(SetEmailReadResponse {
      message: e.to_string(),
    }),
  }
}

#[post("/api/knapsack/connections/microsoft/outlook/reply")]
async fn reply_to_email(payload: Json<ReplyEmailParams>) -> impl Responder {
  let user_connection = match UserConnection::find_by_user_email_and_scope(
    payload.email.clone(),
    String::from(MICROSOFT_OUTLOOK_SCOPE),
  ) {
    Ok(connection) => connection,
    Err(_) => {
      return HttpResponse::BadRequest().json(ReplyEmailResponse {
        message: "Failed to find user connection".to_string(),
      })
    }
  };

  let access_token = match refresh_user_connection(user_connection.clone(), payload.email.clone()).await {
    Ok(updated_user_connection) => updated_user_connection.token,
    Err(_) => {
      return HttpResponse::InternalServerError().json(ReplyEmailResponse {
        message: "Failed to refresh access token".to_string(),
      })
    }
  };

  let client = Client::new();
  let url = format!(
    "{}/me/messages/{}/replyAll",
    MICROSOFT_BASE_URL, payload.message_id
  );

  let previous_content = match &payload.previous_email_body {
    Some(content) if !content.is_empty() => {
      // In Rust, we can't use JavaScript's regex syntax directly
      // Just pass through the content as-is for simplicity
      format!(
        "<blockquote class='outlook_quote' style='margin:0 0 0 .8ex; border-left:1px #ccc solid; padding-left:1ex;'>
          {}
        </blockquote>",
        content
      )
    },
    _ => String::new(),
  };

  let formatted_reply_body = format!(
    "<div><p>{}</p></div>
    <p style='margin-top: 16px; color: #666; font-size: 13px;'>
        Crafted with care using <a href='https://knapsack.ai' style='color: #0066cc; text-decoration: none;'>Knapsack</a>
    </p>
    <div style='margin-top: 20px;'>
      <details style='margin: 0; padding: 0;'>
        <summary style='color: #666; cursor: pointer; outline: none; margin-bottom: 8px; display: inline-block; width: 100%; border-top: 1px solid #ccc; padding-top: 8px;'>&nbsp;</summary>
        {}
      </details>
    </div>",
    payload.reply_body.replace("\n", "<br>"),
    previous_content
);

  let body = serde_json::json!({
    "comment": formatted_reply_body
  });

  let response = client
    .post(&url)
    .header("Authorization", format!("Bearer {}", access_token))
    .header("Content-Type", "application/json")
    .json(&body)
    .send()
    .await;

  match response {
    Ok(resp) if resp.status().is_success() => HttpResponse::Ok().json(ReplyEmailResponse {
      message: "Reply sent successfully".to_string(),
    }),
    Ok(resp) => HttpResponse::InternalServerError().json(ReplyEmailResponse {
      message: format!("Error: {:?}", resp.status()),
    }),
    Err(e) => HttpResponse::InternalServerError().json(ReplyEmailResponse {
      message: e.to_string(),
    }),
  }
}
