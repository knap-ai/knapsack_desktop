use reqwest::{
  header::{HeaderMap, HeaderValue, AUTHORIZATION},
  Client,
};
use serde_json::json;
use std::collections::HashMap;
use std::io::Read;
use std::time::Duration;
use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::Retry;

use actix_web::get;
use actix_web::http::StatusCode;
use actix_web::web::Data;
use actix_web::HttpRequest;
use actix_web::HttpResponse;

use actix_web::Responder;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::Window;

use crate::error::Error;
use crate::spotlight::WINDOW_LABEL;

use crate::db::models::connection::Connection;
use crate::db::models::user::User;
use crate::db::models::user_connection::UserConnection;

use super::constants::GOOGLE_CALENDAR_SCOPE;
use super::constants::GOOGLE_DRIVE_SCOPE;
use super::constants::GOOGLE_GMAIL_SCOPE;
use super::constants::GOOGLE_PROFILE_SCOPE;
use super::profile::fetch_google_profile;
use crate::utils::log::knap_log_error;


use crate::connections::google::types::FetchError;
use crate::connections::utils::{
  create_knapsack_api_connection, get_api_access_token, FetchUuidError,
};

#[derive(Debug, Deserialize)]
pub struct SigninParams {
  code: Option<String>,
  scope: Option<String>,
  error: Option<String>,
  error_description: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct SigninEventPayload {
  code: String,
  raw_scopes: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleSigninResponse {
  refresh_token: String,
  access_token: String,
  refresh_internal: Option<String>,
  access_internal: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SigninResponse {
  success: bool,
  refresh_token: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleRefreshTokenResponse {
  access_token: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchAccessTokenParams {
  email: String,
  scope: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AccessTokenResponse {
  success: bool,
  pub access_token: Option<String>,
}

pub fn get_message_error(error_code: &str) -> &str {
  match error_code {
      "access_denied" => "You denied access",
      "invalid_request" => "There was a problem with the authentication request",
      "unauthorized_client" => "This application is not authorized to make this request",
      "unsupported_response_type" => "The application requested an unsupported response type",
      "invalid_scope" => "The requested permission is not valid",
      "server_error" => "Google encountered an internal error",
      "temporarily_unavailable" => "Google services are temporarily unavailable",
      _ => "An unexpected error occurred during authentication with Google",
  }
}

pub fn get_action_message(error_code: &str) -> &str {
  match error_code {
      "access_denied" => "Please try again and allow the requested permissions",
      "invalid_request" => "Please try again later",
      "unauthorized_client" => "Please contact support",
      "unsupported_response_type" => "Please contact support",
      "invalid_scope" => "Please contact the administrator",
      "server_error" => "Please try again later",
      "temporarily_unavailable" => "Please try again in a few minutes",
      _ => "Please try again later",
  }
}

pub async fn google_refresh_token(email: String, refresh_token: String) -> Result<String, Error> {
  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
  let client = reqwest::Client::new();

  let access_token_api = get_api_access_token(&email.clone(), None).await
    .map_err(|e| FetchUuidError::NetworkError(format!("Failed to refresh access token: {}", e)))?;

  let mut headers = HeaderMap::new();
  headers.insert(
      AUTHORIZATION,
      HeaderValue::from_str(&format!("Bearer {}", access_token_api))
          .map_err(|e| FetchUuidError::NetworkError(format!("Invalid header value: {}", e)))?
  );

  let response = client
    .post(format!(
      "{api_server}/api/authentication/google/refresh-token/?refresh_token={refresh_token}"
    ))
    .headers(headers)
    .send()
    .await?
    .json::<GoogleRefreshTokenResponse>()
    .await?;
  Ok(response.access_token)
}

fn create_connections_from_scopes(
  email: String,
  raw_scope: String,
  refresh_token: String,
) -> Result<Vec<String>, Error> {
  let scopes = raw_scope.split(" ").collect::<Vec<&str>>();
  let mut scopes_index: HashMap<&str, Vec<&str>> = HashMap::new();
  scopes_index.insert(
    GOOGLE_PROFILE_SCOPE,
    vec!["https://www.googleapis.com/auth/userinfo.email"],
  );
  scopes_index.insert(
    GOOGLE_DRIVE_SCOPE,
    vec!["https://www.googleapis.com/auth/drive.readonly"],
  );
  scopes_index.insert(
    GOOGLE_CALENDAR_SCOPE,
    vec!["https://www.googleapis.com/auth/calendar.readonly"],
  );
  scopes_index.insert(
    GOOGLE_GMAIL_SCOPE,
    vec![
      "https://www.googleapis.com/auth/gmail.modify",
    ],
  );

  let mut connected_scopes: Vec<String> = vec![];
  for (scope_key, scope_values) in scopes_index.iter() {
    for scope_value in scope_values {
      if !(scopes.contains(scope_value)) {
        continue;
      }
      let user_connection_creation_result = create_user_connection(
        email.clone(),
        refresh_token.clone(),
        String::from(*scope_key),
      );

      match user_connection_creation_result {
        Ok(_) => {
          connected_scopes.push(String::from(*scope_key));
        }
        Err(error) => {
          log::error!("Failed to create user connection: {:?}", error);
          return Err(Error::KSError(format!(
            "Failed to create user connection for scope {:?}: {:?}",
            scope_key, error
          )));
        }
      }
    }
  }
  Ok(connected_scopes)
}

async fn post_signin(code: String) -> Result<GoogleSigninResponse, FetchError> {
  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
  let client = reqwest::Client::new();
  let retry_strategy = ExponentialBackoff::from_millis(2000)
    .max_delay(Duration::from_secs(3))
    .map(jitter)
    .take(3);

  let response = Retry::spawn(retry_strategy, || {
    let code = code.clone();
    let client = client.clone();
    async move {
      let response = client
        .get(format!(
          "{api_server}/api/authentication/google/signin/app?code={code}"
        ))
        .send()
        .await
        .map_err(FetchError::NetworkError)?;

      match response.status() {
        StatusCode::OK => Ok(response),
        StatusCode::UNAUTHORIZED => Err(FetchError::InvalidToken),
        StatusCode::TOO_MANY_REQUESTS => Err(FetchError::RateLimitExceeded),
        status if status.is_server_error() => Err(FetchError::ServerError(status)),
        _ => Err(FetchError::UnknownError(format!(
          "Unexpected status code: {:?}",
          response.status()
        ))),
      }
    }
  })
  .await?;

  Ok(response.json::<GoogleSigninResponse>().await?)
}

fn focus_window(window: Window) {
  window.show().expect("Failed to show window");
  window.set_focus().expect("Failed to focus window");
}

#[get("/api/knapsack/google/complete/signin")]
async fn complete_google_signin(
  req: HttpRequest,
  app_handle: Data<tauri::AppHandle>,
) -> impl Responder {
  let params = actix_web::web::Query::<SigninParams>::from_query(req.query_string()).unwrap();
  let code = params.code.as_ref().unwrap().to_string();
  let raw_scopes = params.scope.as_ref().unwrap().to_string();

  let response = match post_signin(code.clone()).await {
    Ok(response) => response,
    Err(err) => {
      log::error!("Failed to post signin: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to post signin: {:?}", err),
        "success": false
      }));
    }
  };

  let profile = match fetch_google_profile(response.access_token.clone(), response.refresh_internal.clone()).await {
    Ok(profile) => profile,
    Err(err) => {
      log::error!("Fail to fetch Google profile: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to fetch Google profile: {:?}", err),
        "success": false
      }));
    }
  };

  let email = profile.email.clone().unwrap();
  let uuid = profile.uuid.clone().unwrap();
  let _ = User {
    id: None,
    email: email.clone(),
    uuid: Some(uuid),
  }.create();

  // Create Knapsack API connection
  create_knapsack_api_connection(
    email.clone(),
    response.refresh_internal.clone().unwrap().as_ref(),
  );

  let connection_keys = match create_connections_from_scopes(
    email.clone(),
    raw_scopes.clone(),
    response.refresh_token.clone(),
  ) {
    Ok(connection_keys) => connection_keys,
    Err(err) => {
      log::error!("Failed to create connections: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to create connections: {:?}", err),
        "success": false
      }));
    }
  };

  HttpResponse::Ok().json(json!({
    "profile": profile,
    "connection_keys": connection_keys
  }))
}

#[get("/api/knapsack/google/signin")]
async fn google_signin_api(req: HttpRequest, app_handle: Data<tauri::AppHandle>) -> impl Responder {
  let params = match actix_web::web::Query::<SigninParams>::from_query(req.query_string()) {
    Ok(query) => query,
    Err(_) => return HttpResponse::BadRequest().body("Invalid query parameters"),
  };

  match (params.code.as_ref(), params.error.as_ref()) {
    (Some(code), None) => handle_successful_signin(&params, app_handle),
    (None, Some(error)) => handle_error_signin(&params, app_handle),
    _ => HttpResponse::BadRequest().body("Invalid signin request"),
  }
}

fn handle_successful_signin(
  params: &SigninParams,
  app_handle: Data<tauri::AppHandle>
) -> HttpResponse {
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.emit(
    "signin_success",
    SigninEventPayload {
      code: params.code.as_ref().unwrap().to_string(),
      raw_scopes: params.scope.as_ref().unwrap().to_string(),
    },
  );
  focus_window(window);

  let html_file = app_handle
    .path_resolver()
    .resolve_resource("resources/signin_success.html")
    .expect("failed to resolve resource");
  let mut file = std::fs::File::open(&html_file).unwrap();
  let mut html_string = String::new();
  file.read_to_string(&mut html_string);
  HttpResponse::build(StatusCode::OK)
    .content_type("text/html; charset=utf-8")
    .body(html_string)
}

fn handle_error_signin(
  params: &SigninParams,
  app_handle: Data<tauri::AppHandle>,
) -> HttpResponse {
  let error = params.error.as_ref().unwrap();
  let err_msg = format!(
    "Google signin error: {} - description: {}",
    error,
    params.error_description.as_deref().unwrap_or("No description provided")
  );
  knap_log_error(err_msg.clone(), None, Some(true));
  let html_file = app_handle
    .path_resolver()
    .resolve_resource("resources/signin_error.html")
    .expect("failed to resolve resource");
  let html_string = std::fs::read_to_string(&html_file)
    .unwrap_or_else(|_| "Error page not found".to_string());

  let message = get_message_error(error);
  let action_message = get_action_message(error);
  let error_html = html_string
    .replace("{{ERROR_MESSAGE}}", message)
    .replace("{{ERROR_ACTION_MESSAGE}}", action_message)
    .replace(
      "{{ERROR_DESCRIPTION}}",
      params.error_description.as_deref().unwrap_or("No description provided"),
    );

  HttpResponse::Ok()
    .content_type("text/html; charset=utf-8")
    .body(error_html)
}

#[get("/api/knapsack/focus")]
async fn focus(app_handle: Data<tauri::AppHandle>) -> impl Responder {
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  focus_window(window);
  HttpResponse::Ok().finish()
}

pub fn create_user_connection(
  email: String,
  refresh_token: String,
  scope: String,
) -> Result<(), Error> {
  let user = User::find_by_email(email)?;
  let connection = Connection::find_by_scope(scope)?;
  let user_connection = UserConnection {
    id: None,
    user_id: user.id.expect("User has no ID"),
    connection_id: connection.id.expect("Connection has no ID"),
    token: refresh_token.clone(),
    refresh_token: Some(refresh_token.clone()),
    connection: None,
    last_synced: None,
  };
  user_connection.upsert()
}

pub async fn refresh_connection_token(email: String, user_connection: UserConnection) -> Result<String, Error> {
  match google_refresh_token(email, user_connection.clone().token).await {
    Ok(access_token) => Ok(access_token),
    Err(err) => {
      knap_log_error("Failed to refresh connection token".to_string(), Some(err), None);
      Err(Error::KSError(format!("Invalid refresh token")))
    }
  }
}

#[get("/api/knapsack/connections/google/auth_token")]
async fn fetch_google_auth_token_api(
  req: HttpRequest,
  app_handle: Data<tauri::AppHandle>,
) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchAccessTokenParams>::from_query(req.query_string()).unwrap();
  let user_connection = UserConnection::find_by_user_email_and_scope(
    params.email.clone(),
    params.scope.clone(),
  )
  .unwrap();
  match refresh_connection_token(params.email.clone(), user_connection.clone()).await {
    Ok(access_token) => HttpResponse::Ok().json(AccessTokenResponse {
      success: true,
      access_token: Some(access_token),
    }),
    Err(_) => HttpResponse::BadRequest().json(AccessTokenResponse {
      success: false,
      access_token: None,
    }),
  }
}
