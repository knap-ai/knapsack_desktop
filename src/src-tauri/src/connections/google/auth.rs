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
  state: Option<String>,
  /// When set, this is an "add calendar account" flow for an already-logged-in
  /// user.  The new OAuth tokens belong to a second Google account; we skip
  /// creating a new user and instead attach the calendar connection to the
  /// existing user identified by this email.
  primary_email: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct SigninEventPayload {
  code: String,
  raw_scopes: String,
  state: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
struct AdditionalSigninEventPayload {
  primary_email: String,
  account_email: String,
  connection_keys: Vec<String>,
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

/// Response from Google's OAuth2 token endpoint
#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleTokenExchangeResponse {
  access_token: String,
  refresh_token: Option<String>,
  expires_in: u64,
  token_type: String,
  scope: Option<String>,
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

/// Refresh access token locally using Google's token endpoint.
async fn refresh_token_locally(
  refresh_token: String,
  client_secret: Option<&str>,
) -> Result<String, Error> {
  let client_id: &'static str = env!(
    "VITE_GOOGLE_CLIENT_ID",
    "Missing VITE_GOOGLE_CLIENT_ID env var"
  );
  let client = reqwest::Client::new();

  let mut params = vec![
    ("refresh_token".to_string(), refresh_token),
    ("client_id".to_string(), client_id.to_string()),
    ("grant_type".to_string(), "refresh_token".to_string()),
  ];
  if let Some(client_secret) = client_secret.filter(|secret| !secret.is_empty()) {
    params.push(("client_secret".to_string(), client_secret.to_string()));
  }

  let response = client
    .post("https://oauth2.googleapis.com/token")
    .form(&params)
    .send()
    .await?;

  if response.status().is_success() {
    let token_response = response.json::<GoogleRefreshTokenResponse>().await?;
    Ok(token_response.access_token)
  } else {
    let error_text = response.text().await.unwrap_or_default();
    log::error!("Google token refresh failed: {}", error_text);

    // Check if this is an invalid/expired refresh token error
    if error_text.contains("invalid_grant")
      || error_text.contains("Token has been expired or revoked")
    {
      Err(Error::KSError("Invalid refresh token".to_string()))
    } else {
      Err(Error::KSError(format!(
        "Token refresh failed: {}",
        error_text
      )))
    }
  }
}

/// Refresh access token via knap.ai backend.
async fn refresh_token_via_backend(email: String, refresh_token: String) -> Result<String, Error> {
  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
  let client = reqwest::Client::new();

  let access_token_api = get_api_access_token(&email.clone(), None)
    .await
    .map_err(|e| FetchUuidError::NetworkError(format!("Failed to refresh access token: {}", e)))?;

  let mut headers = HeaderMap::new();
  headers.insert(
    AUTHORIZATION,
    HeaderValue::from_str(&format!("Bearer {}", access_token_api))
      .map_err(|e| FetchUuidError::NetworkError(format!("Invalid header value: {}", e)))?,
  );

  let retry_strategy = ExponentialBackoff::from_millis(1000)
    .max_delay(Duration::from_secs(4))
    .map(jitter)
    .take(3);

  let response = Retry::spawn(retry_strategy, || {
    let client = client.clone();
    let headers = headers.clone();
    let refresh_token = refresh_token.clone();
    async move {
      let resp = client
        .post(format!(
          "{api_server}/api/authentication/google/refresh-token/?refresh_token={refresh_token}"
        ))
        .headers(headers)
        .send()
        .await
        .map_err(|e| Error::KSError(format!("Network error: {}", e)))?;

      if resp.status().is_server_error() {
        log::warn!(
          "Server error refreshing Google token ({}), retrying...",
          resp.status()
        );
        return Err(Error::KSError(format!("Server error: {}", resp.status())));
      }

      resp
        .json::<GoogleRefreshTokenResponse>()
        .await
        .map_err(|e| Error::KSError(format!("Failed to parse refresh response: {}", e)))
    }
  })
  .await?;

  Ok(response.access_token)
}

pub async fn google_refresh_token(email: String, refresh_token: String) -> Result<String, Error> {
  let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
    .ok()
    .filter(|secret| !secret.is_empty());

  if let Some(client_secret) = client_secret.as_deref() {
    match refresh_token_locally(refresh_token.clone(), Some(client_secret)).await {
      Ok(access_token) => return Ok(access_token),
      Err(Error::KSError(message)) if message == "Invalid refresh token" => {
        return Err(Error::KSError(message));
      }
      Err(error) => {
        log::warn!(
          "Local Google token refresh failed, falling back to knap.ai backend: {:?}",
          error
        );
      }
    }
  }

  refresh_token_via_backend(email, refresh_token).await
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
    vec!["https://www.googleapis.com/auth/gmail.modify"],
  );

  let mut connected_scopes: Vec<String> = vec![];
  for (scope_key, scope_values) in scopes_index.iter() {
    for scope_value in scope_values {
      if !(scopes.contains(scope_value)) {
        continue;
      }
      // For calendar, drive, and gmail the calendar_account_email identifies
      // which Google account's data this connection syncs.
      let calendar_account_email = if [
        GOOGLE_CALENDAR_SCOPE,
        GOOGLE_DRIVE_SCOPE,
        GOOGLE_GMAIL_SCOPE,
      ]
      .contains(scope_key)
      {
        email.clone()
      } else {
        String::new()
      };
      let user_connection_creation_result = create_user_connection(
        email.clone(),
        refresh_token.clone(),
        None,
        String::from(*scope_key),
        calendar_account_email,
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

/// Create connections for a *secondary* Google account.  Looks at `raw_scopes`
/// to decide which connection types to create (calendar, drive, gmail).
/// `primary_user_email` identifies the existing user; `new_account_email` is
/// the email of the newly authorised Google account.
/// `refresh_internal` is the knap.ai internal refresh token for the secondary
/// account — stored as `refresh_token` so we can use it to get API access
/// tokens on behalf of that account when refreshing its Google OAuth tokens.
fn create_additional_connections(
  primary_user_email: String,
  new_account_email: String,
  raw_scopes: String,
  refresh_token: String,
  refresh_internal: Option<String>,
) -> Result<Vec<String>, Error> {
  let scopes = raw_scopes.split(' ').collect::<Vec<&str>>();

  // Also create/update the knap.ai API connection for the secondary account so
  // we can obtain its API access token when refreshing Google OAuth tokens.
  if let Some(ref ri) = refresh_internal {
    // Ensure the secondary account user row exists (may be first time linking).
    if User::find_by_email(new_account_email.clone()).is_err() {
      let _ = User {
        id: None,
        email: new_account_email.clone(),
        uuid: None,
      }
      .create();
    }
    create_knapsack_api_connection(new_account_email.clone(), ri.as_str());
  }

  let scope_map: &[(&str, &[&str])] = &[
    (
      GOOGLE_CALENDAR_SCOPE,
      &["https://www.googleapis.com/auth/calendar.readonly"],
    ),
    (
      GOOGLE_DRIVE_SCOPE,
      &["https://www.googleapis.com/auth/drive.readonly"],
    ),
    (
      GOOGLE_GMAIL_SCOPE,
      &["https://www.googleapis.com/auth/gmail.modify"],
    ),
  ];

  let mut created: Vec<String> = vec![];
  for (scope_key, scope_values) in scope_map {
    let has_scope = scope_values.iter().any(|sv| scopes.contains(sv));
    if !has_scope {
      continue;
    }
    create_user_connection(
      primary_user_email.clone(),
      refresh_token.clone(),
      refresh_internal.clone(),
      String::from(*scope_key),
      new_account_email.clone(),
    )?;
    created.push(String::from(*scope_key));
  }
  Ok(created)
}

/// Exchange OAuth code for tokens locally using Google's token endpoint.
/// This is used when GOOGLE_CLIENT_SECRET is configured for self-hosted builds.
async fn exchange_code_locally(
  code: String,
  client_secret: Option<&str>,
) -> Result<GoogleSigninResponse, FetchError> {
  let client_id: &'static str = env!(
    "VITE_GOOGLE_CLIENT_ID",
    "Missing VITE_GOOGLE_CLIENT_ID env var"
  );
  let redirect_uri = "http://localhost:8897/api/knapsack/google/signin";
  let client = reqwest::Client::new();

  let mut params = vec![
    ("code".to_string(), code),
    ("client_id".to_string(), client_id.to_string()),
    ("redirect_uri".to_string(), redirect_uri.to_string()),
    ("grant_type".to_string(), "authorization_code".to_string()),
  ];
  if let Some(client_secret) = client_secret.filter(|secret| !secret.is_empty()) {
    params.push(("client_secret".to_string(), client_secret.to_string()));
  }

  let response = client
    .post("https://oauth2.googleapis.com/token")
    .form(&params)
    .send()
    .await
    .map_err(FetchError::NetworkError)?;

  match response.status() {
    StatusCode::OK => {
      let token_response = response.json::<GoogleTokenExchangeResponse>().await?;
      Ok(GoogleSigninResponse {
        access_token: token_response.access_token,
        refresh_token: token_response.refresh_token.unwrap_or_default(),
        // For local auth, we don't have internal tokens (those are for knap.ai API)
        refresh_internal: None,
        access_internal: None,
      })
    }
    StatusCode::BAD_REQUEST => {
      let error_text = response.text().await.unwrap_or_default();
      log::error!("Google token exchange failed: {}", error_text);
      Err(FetchError::UnknownError(format!(
        "Token exchange failed: {}",
        error_text
      )))
    }
    status => Err(FetchError::UnknownError(format!(
      "Unexpected status code from Google: {:?}",
      status
    ))),
  }
}

/// Exchange OAuth code via knap.ai backend (default for DMG builds).
async fn exchange_code_via_backend(code: String) -> Result<GoogleSigninResponse, FetchError> {
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
        .get(format!("{api_server}/api/authentication/google/signin/app"))
        .query(&[("code", code.as_str())])
        .send()
        .await
        .map_err(FetchError::NetworkError)?;

      match response.status() {
        StatusCode::OK => Ok(response),
        StatusCode::UNAUTHORIZED => Err(FetchError::InvalidToken),
        StatusCode::TOO_MANY_REQUESTS => Err(FetchError::RateLimitExceeded),
        status if status.is_server_error() => Err(FetchError::ServerError(status)),
        status => {
          let body = response.text().await.unwrap_or_default();
          Err(FetchError::UnknownError(format!(
            "Unexpected status code {} from google signin exchange: {}",
            status, body
          )))
        }
      }
    }
  })
  .await?;

  Ok(response.json::<GoogleSigninResponse>().await?)
}

async fn post_signin(code: String) -> Result<GoogleSigninResponse, FetchError> {
  let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
    .ok()
    .filter(|secret| !secret.is_empty());

  // The production Google client is a confidential web client. Submitting its
  // authorization code without the secret is not a harmless capability probe:
  // Google may invalidate the one-time code before the backend can exchange it.
  // Only attempt the local exchange when a secret is actually configured.
  if let Some(client_secret) = client_secret.as_deref() {
    match exchange_code_locally(code.clone(), Some(client_secret)).await {
      Ok(response) => {
        log::info!("Using local Google OAuth token exchange");
        return Ok(response);
      }
      Err(FetchError::UnknownError(message))
        if message.contains("invalid_grant")
          || message.contains("invalid_client")
          || message.contains("unauthorized_client") =>
      {
        return Err(FetchError::UnknownError(message));
      }
      Err(error) => {
        log::warn!(
          "Local Google OAuth token exchange failed, falling back to knap.ai backend: {:?}",
          error
        );
      }
    }
  }

  log::info!("Using knap.ai backend for Google OAuth token exchange");
  exchange_code_via_backend(code).await
}

async fn link_additional_google_account(
  code: String,
  raw_scopes: String,
  primary_email: String,
) -> Result<(String, Vec<String>), String> {
  let response = post_signin(code)
    .await
    .map_err(|err| format!("Failed to post signin: {:?}", err))?;
  let profile = fetch_google_profile(
    response.access_token.clone(),
    response.refresh_internal.clone(),
  )
  .await
  .map_err(|err| format!("Failed to fetch Google profile: {:?}", err))?;
  let account_email = profile
    .email
    .ok_or_else(|| "Google profile did not include an email address".to_string())?;
  let connection_keys = create_additional_connections(
    primary_email,
    account_email.clone(),
    raw_scopes,
    response.refresh_token,
    response.refresh_internal,
  )
  .map_err(|err| format!("Failed to link additional account: {:?}", err))?;
  Ok((account_email, connection_keys))
}

fn parse_add_account_primary_email(state: Option<&str>) -> Option<String> {
  let state = state?;
  let parts = state.split(':').collect::<Vec<_>>();
  if parts.len() < 4 || parts[0] != "knapsack_add_account" {
    return None;
  }
  if !matches!(parts[1], "workspace" | "calendar" | "drive" | "gmail") {
    return None;
  }
  let email = parts[3].trim();
  if email.is_empty() || !email.contains('@') {
    return None;
  }
  Some(email.to_string())
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

  if let Some(primary_email) = params.primary_email.clone() {
    return match link_additional_google_account(code, raw_scopes, primary_email).await {
      Ok((account_email, connection_keys)) => HttpResponse::Ok().json(json!({
        "success": true,
        "calendar_email": account_email,
        "connection_keys": connection_keys
      })),
      Err(err) => {
        log::error!("Failed to link additional account: {}", err);
        HttpResponse::InternalServerError().json(json!({
          "error": err,
          "success": false
        }))
      }
    };
  }

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

  let profile = match fetch_google_profile(
    response.access_token.clone(),
    response.refresh_internal.clone(),
  )
  .await
  {
    Ok(profile) => profile,
    Err(err) => {
      log::error!("Fail to fetch Google profile: {:?}", err);
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("Failed to fetch Google profile: {:?}", err),
        "success": false
      }));
    }
  };

  let calendar_email = profile.email.clone().unwrap();

  // ── Normal (primary) sign-in flow ──────────────────────────────────────────
  let email = calendar_email.clone();
  let uuid = profile.uuid.clone().unwrap_or_else(|| {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    email.hash(&mut hasher);
    format!("local-{:x}", hasher.finish())
  });
  let _ = User {
    id: None,
    email: email.clone(),
    uuid: Some(uuid),
  }
  .create();

  if let Some(ref refresh_internal) = response.refresh_internal {
    create_knapsack_api_connection(email.clone(), refresh_internal.as_ref());
  }

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
    (Some(code), None) => {
      if let Some(primary_email) = parse_add_account_primary_email(params.state.as_deref()) {
        let raw_scopes = params.scope.clone().unwrap_or_default();
        let window = app_handle.get_window(WINDOW_LABEL).unwrap();
        return match link_additional_google_account(code.clone(), raw_scopes, primary_email.clone())
          .await
        {
          Ok((account_email, connection_keys)) => {
            log::info!(
              "Linked additional Google account {} to {} for scopes {:?}",
              account_email,
              primary_email,
              connection_keys
            );
            let _ = window.emit(
              "google_account_linked",
              AdditionalSigninEventPayload {
                primary_email,
                account_email,
                connection_keys,
              },
            );
            focus_window(window);
            let html_file = app_handle
              .path_resolver()
              .resolve_resource("resources/signin_success.html")
              .expect("failed to resolve resource");
            let html_string = std::fs::read_to_string(&html_file).unwrap_or_else(|_| {
              "Google account connected. You can close this window.".to_string()
            });
            HttpResponse::Ok()
              .content_type("text/html; charset=utf-8")
              .body(html_string)
          }
          Err(err) => {
            log::error!("Failed to link additional Google account: {}", err);
            focus_window(window);
            HttpResponse::InternalServerError()
              .content_type("text/html; charset=utf-8")
              .body("Google account connection failed. Return to Knapsack and try again.")
          }
        };
      }
      handle_successful_signin(&params, app_handle)
    }
    (None, Some(error)) => handle_error_signin(&params, app_handle),
    _ => HttpResponse::BadRequest().body("Invalid signin request"),
  }
}

fn handle_successful_signin(
  params: &SigninParams,
  app_handle: Data<tauri::AppHandle>,
) -> HttpResponse {
  let window = app_handle.get_window(WINDOW_LABEL).unwrap();
  window.emit(
    "signin_success",
    SigninEventPayload {
      code: params.code.as_ref().unwrap().to_string(),
      raw_scopes: params.scope.as_ref().unwrap().to_string(),
      state: params.state.clone(),
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

fn handle_error_signin(params: &SigninParams, app_handle: Data<tauri::AppHandle>) -> HttpResponse {
  let error = params.error.as_ref().unwrap();
  let err_msg = format!(
    "Google signin error: {} - description: {}",
    error,
    params
      .error_description
      .as_deref()
      .unwrap_or("No description provided")
  );
  knap_log_error(err_msg.clone(), None, Some(true));
  let html_file = app_handle
    .path_resolver()
    .resolve_resource("resources/signin_error.html")
    .expect("failed to resolve resource");
  let html_string =
    std::fs::read_to_string(&html_file).unwrap_or_else(|_| "Error page not found".to_string());

  let message = get_message_error(error);
  let action_message = get_action_message(error);
  let error_html = html_string
    .replace("{{ERROR_MESSAGE}}", message)
    .replace("{{ERROR_ACTION_MESSAGE}}", action_message)
    .replace(
      "{{ERROR_DESCRIPTION}}",
      params
        .error_description
        .as_deref()
        .unwrap_or("No description provided"),
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
  google_refresh_token_val: String,
  refresh_internal: Option<String>,
  scope: String,
  calendar_account_email: String,
) -> Result<(), Error> {
  let user = User::find_by_email(email)?;
  let connection = Connection::find_by_scope(scope)?;
  let user_connection = UserConnection {
    id: None,
    user_id: user.id.expect("User has no ID"),
    connection_id: connection.id.expect("Connection has no ID"),
    token: google_refresh_token_val.clone(),
    // For secondary accounts, store the knap.ai internal refresh token so
    // token refresh can use the secondary account's own API credentials.
    // For primary accounts without refresh_internal, fall back to the Google
    // refresh token (legacy behaviour — refresh_token_via_backend will use the
    // primary user's knapsack_access_key connection instead).
    refresh_token: Some(refresh_internal.unwrap_or(google_refresh_token_val)),
    connection: None,
    last_synced: None,
    calendar_account_email,
  };
  user_connection.upsert()
}

pub async fn refresh_connection_token(
  email: String,
  user_connection: UserConnection,
) -> Result<String, Error> {
  // For secondary Google accounts, `calendar_account_email` differs from `email`
  // (the primary user). Use the secondary account's own identity for the backend
  // token refresh so the correct API credentials are used.
  let effective_email = if !user_connection.calendar_account_email.is_empty()
    && user_connection.calendar_account_email != email
  {
    user_connection.calendar_account_email.clone()
  } else {
    email.clone()
  };

  match google_refresh_token(effective_email.clone(), user_connection.clone().token).await {
    Ok(access_token) => Ok(access_token),
    Err(err) => {
      let err_str = err.to_string();
      let is_invalid_refresh_token = err_str.contains("Invalid refresh token")
        || err_str.contains("401 Unauthorized")
        || err_str.contains("400 Bad Request");

      if is_invalid_refresh_token {
        let _ = user_connection.clone().delete();
        log::info!(
          "Deleted invalid Google connection for user {} (connection_id: {}). User will need to reconnect.",
          email,
          user_connection.connection_id
        );
        return Err(knap_log_error(
          format!(
            "Invalid refresh token for user {}. Please reconnect your Google account in Settings.",
            effective_email
          ),
          Some(err),
          None,
        ));
      }

      knap_log_error(
        format!("Failed to refresh connection token: {}", err_str),
        Some(err),
        None,
      );
      Err(Error::KSError(format!(
        "Failed to refresh connection token: {}",
        err_str
      )))
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
  let user_connection =
    UserConnection::find_by_user_email_and_scope(params.email.clone(), params.scope.clone())
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

#[cfg(test)]
mod tests {
  use super::parse_add_account_primary_email;

  #[test]
  fn parses_primary_email_from_supported_add_account_state() {
    assert_eq!(
      parse_add_account_primary_email(Some(
        "knapsack_add_account:workspace:nonce-123:mark@knap.ai"
      )),
      Some("mark@knap.ai".to_string())
    );
  }

  #[test]
  fn rejects_legacy_malformed_or_unrelated_state() {
    assert_eq!(
      parse_add_account_primary_email(Some("knapsack_add_account:workspace:nonce-123")),
      None
    );
    assert_eq!(
      parse_add_account_primary_email(Some("knapsack_add_account:unknown:nonce-123:mark@knap.ai")),
      None
    );
    assert_eq!(
      parse_add_account_primary_email(Some("other:workspace:nonce-123:mark@knap.ai")),
      None
    );
  }
}
