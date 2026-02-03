use std::collections::HashMap;
use std::io::Read;
use std::time::Duration;

use actix_web::get;
use actix_web::http::StatusCode;
use actix_web::web::Data;
use actix_web::HttpRequest;
use actix_web::HttpResponse;

use actix_web::Responder;
use serde::{Deserialize, Serialize};

use tokio_retry::strategy::{jitter, ExponentialBackoff};
use tokio_retry::Retry;

use crate::error::Error;
use crate::spotlight::WINDOW_LABEL;

use crate::connections::google::profile::UserInfoResponse;
use crate::constants::{KN_MICROSOFT_AUTH_URL, KN_MICROSOFT_REDIRECT_URL, KN_MICROSOFT_TOKEN_URL};
use crate::db::models::connection::Connection;
use crate::db::models::user::User;
use crate::db::models::user_connection::UserConnection;
use base64::{engine::general_purpose, Engine as _};
use dotenv::dotenv;
use rand::{thread_rng,Rng};
use reqwest::Error as ReqwestError;
use reqwest::{Client, header::{HeaderMap, HeaderValue, AUTHORIZATION}};
use sha2::{Digest, Sha256};
use std::env;
use std::sync::Mutex;
use tauri::{CustomMenuItem, Manager, Window, WindowBuilder, WindowUrl};
use url::Url;
use crate::connections::utils::fetch_user_uuid;
use crate::utils::log::knap_log_error;

use crate::connections::google::types::FetchError;
use crate::connections::utils::create_knapsack_api_connection;
use crate::connections::utils::{get_knapsack_api_connection, FetchUuidError, get_api_access_token};

struct OAuthState {
  code_verifier: Mutex<String>,
  oauth_config: Mutex<OAuthConfig>,
  scope_keys: Mutex<Vec<String>>,
}

#[derive(Serialize, Clone)]
struct OAuthConfig {
  client_id: String,
  authorization_endpoint: String,
  token_endpoint: String,
  redirect_uri: String,
  scope: String,
  state: String,
}

#[derive(Debug, Deserialize)]
pub struct SigninParams {
  code: Option<String>,
  state: Option<String>,
  error: Option<String>,
  error_description: Option<String>,
}

#[derive(Serialize)]
struct TokenRequest {
  client_id: String,
  code: String,
  redirect_uri: String,
  grant_type: String,
  code_verifier: String,
}

#[derive(Deserialize, Debug)]
struct TokenResponse {
  refresh_token: String,
  access_token: String,
  access_internal: String,
  refresh_internal: String,
}

#[derive(Deserialize, Debug)]
struct TokenAccessResponse {
  access_token: String,
}

#[derive(Deserialize, Debug)]
struct MicrosoftProfile {
  displayName: Option<String>,
  mail: Option<String>,
  userPrincipalName: Option<String>,
  id: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct SigninEventPayload {
  profile: UserInfoResponse,
  connection_keys: Vec<String>,
}

#[derive(Serialize)]
struct RefreshRequest {
  client_id: String,
  refresh_token: String,
  grant_type: String,
}

#[derive(Serialize)]
struct RefreshResponse {
  access_token: String,
  refresh_token: Option<String>,
}

pub fn get_message_error(error_code: &str) -> &str {
  match error_code {
      "access_denied" => "You denied access permission",
      "invalid_client" => "There was a configuration issue with the application",
      "unauthorized_client" => "This application is not authorized for your organization",
      "invalid_grant" => "Your session has expired",
      "interaction_required" => "Additional permissions are required",
      "login_required" => "Your session has expired",
      "consent_required" => "Consent is required to continue",
      "temporarily_unavailable" => "The service is temporarily unavailable",
      "server_error" => "An unexpected error occurred",
      "invalid_request" => "There was an issue with the request",
      "bad_request" => "The request could not be completed",
      "invalid_resource" | "resource_not_found" => "The requested resource is not available for your Microsoft Tenant.",
      _ => "An unexpected error occurred during authentication",
  }
}

pub fn get_action_message(error_code: &str) -> &str {
  match error_code {
      "access_denied" => "Please try again",
      "invalid_client" => "Please contact support",
      "unauthorized_client" => "Please contact your administrator",
      "invalid_grant" => "Please sign in again",
      "interaction_required" => "Please authorize access",
      "login_required" => "Please log in again",
      "consent_required" => " Please grant the requested permissions",
      "temporarily_unavailable" => "Please try again shortly",
      "server_error" => "Please try again later",
      "invalid_request" => "Please check your connection and try again",
      "bad_request" => "Please try again",
      "invalid_resource" | "resource_not_found" => "Contact your tenant administrator and ask them to enable Knapsack for your organization using this link: <a>https://login.microsoftonline.com/common/adminconsent?client_id=0edbd2c2-902d-4678-9dc2-9de46d769973</a>
",
      _ => "Please try again",
  }
}

fn generate_code_verifier() -> String {
  const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const CODE_VERIFIER_LENGTH: usize = 128;

  let mut rng = thread_rng();
  (0..CODE_VERIFIER_LENGTH)
      .map(|_| {
          let idx = rng.gen_range(0..CHARSET.len());
          CHARSET[idx] as char
      })
      .collect()
}

fn generate_code_challenge(verifier: &str) -> String {
  let digest = Sha256::digest(verifier.as_bytes());
  general_purpose::URL_SAFE_NO_PAD.encode(digest)
}

fn get_authorization_url(config: &OAuthConfig, code_challenge: &str) -> String {
  let mut url = Url::parse(&config.authorization_endpoint).unwrap();
  url
    .query_pairs_mut()
    .append_pair("client_id", &config.client_id)
    .append_pair("response_type", "code")
    .append_pair("redirect_uri", &config.redirect_uri)
    .append_pair("scope", &config.scope)
    .append_pair("state",&config.state);
  url.to_string()
}

#[tauri::command]
pub async fn start_oauth(
  app_handle: tauri::AppHandle,
  scope: String,
  scope_keys: Vec<String>,
) -> String {
  let client_id =  env!("MICROSOFT_CLIENT_ID", "Missing MICROSOFT_CLIENT_ID env var");
  let config = OAuthConfig {
    client_id: client_id.to_string().clone(),
    authorization_endpoint: KN_MICROSOFT_AUTH_URL.to_string(),
    token_endpoint: KN_MICROSOFT_TOKEN_URL.to_string(),
    redirect_uri: KN_MICROSOFT_REDIRECT_URL.to_string(),
    scope: format!("openid offline_access {}", scope.replace(",", " ")),
    state: format!("openid offline_access {}", scope.replace(",", " ")),
  };

  let code_verifier = generate_code_verifier();
  let code_challenge = generate_code_challenge(&code_verifier);


  if let Some(oauth_state) = app_handle.try_state::<OAuthState>() {
    *oauth_state.code_verifier.lock().unwrap() = code_verifier.clone();
    *oauth_state.oauth_config.lock().unwrap() = config.clone();
    *oauth_state.scope_keys.lock().unwrap() = scope_keys;
  } else {
    app_handle.manage(OAuthState {
      code_verifier: Mutex::new(code_verifier.clone()),
      oauth_config: Mutex::new(config.clone()),
      scope_keys: Mutex::new(scope_keys),
    });
  }

  let authorization_url = get_authorization_url(&config, &code_challenge);
  authorization_url
}

async fn get_access_token(
  config: &OAuthConfig,
  code: &str,
  state: &str,
  code_verifier: &str,
) -> Result<TokenResponse, FetchError> {
  let client = reqwest::Client::new();
  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");
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
          "{api_server}/api/authentication/microsoft/signin/app/?code={code}&state={state}"
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

  Ok(response.json::<TokenResponse>().await?)
}

async fn refresh_access_token(
  refresh_token: String,
  email: String,
) -> Result<RefreshResponse, Error> {
  let client = reqwest::Client::new();
  let api_server: &'static str = env!("VITE_KN_API_SERVER", "Missing VITE_KN_API_SERVER env var");

  let access_token_api = get_api_access_token(&email.clone(), None).await
    .map_err(|e| FetchUuidError::NetworkError(format!("Failed to refresh access token: {}", e)))?;

    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", access_token_api))
            .map_err(|e| FetchUuidError::NetworkError(format!("Invalid header value: {}", e)))?
    );

  let response = client
    .post(format!("{api_server}/api/authentication/microsoft/refresh_access_token/app/"))
    .headers(headers)
    .json(&serde_json::json!({
      "refresh_token": refresh_token
    }))
    .send()
    .await?;

    if response.status().is_success() {
      let token_response: TokenAccessResponse = response.json().await?;
      let refresh = RefreshResponse {
        access_token: token_response.access_token,
        refresh_token: Some(refresh_token),
      };
  
      Ok(refresh)
    } else {
      Err(Error::KSError(format!(
        "Failed to refresh token: {}",
        response.status()
      )))
    }
}

pub async fn refresh_user_connection(user_connection: UserConnection, email: String) -> Result<UserConnection, Error>{
  let refresh_response: RefreshResponse = match refresh_access_token(
    user_connection.refresh_token.clone().unwrap(), email
  ).await {
    Ok(response) => response,
    Err(err) => {
      knap_log_error("Failed to refresh connection token".to_string(), Some(err), None);
      return Err(Error::KSError(format!("Invalid refresh token")))
    }
  };
  let updated_user_connection = UserConnection {
    id: user_connection.id,
    user_id: user_connection.user_id,
    connection_id: user_connection.connection_id,
    token: refresh_response.access_token,
    refresh_token: refresh_response.refresh_token,
    connection: user_connection.connection,
    last_synced: user_connection.last_synced,
  };
  updated_user_connection.clone().update();

  Ok(updated_user_connection)
}

fn focus_window(window: Window) {
  window.show().expect("Failed to show window");
  window.set_focus().expect("Failed to focus window");
}

pub async fn fetch_microsoft_profile(access_token: &str, refresh_internal: Option<String>) -> Result<UserInfoResponse, Error> {
  let client = reqwest::Client::new();

  let response = client
    .get("https://graph.microsoft.com/v1.0/me")
    .bearer_auth(access_token)
    .send()
    .await?;

  if response.status().is_success() {
    let profile = response.json::<MicrosoftProfile>().await?;
    let user_uuid = match profile.mail.as_deref() {
      Some(email) => match fetch_user_uuid(email, refresh_internal).await {
        Ok(uuid) => Some(uuid),
        Err(err) => {
          let err_msg = format!("{:?}", err);
          knap_log_error(err_msg, Some(Error::FetchUuidError(err)), None);
          None
        },
      },
      None => None,
    };
    let user_profile = UserInfoResponse {
      success: true,
      name: profile.displayName.clone(),
      email: profile.mail.clone(),
      profile_image: format!("https://graph.microsoft.com/v1.0/me/photo/$value").into(),
      message: None,
      uuid: user_uuid,
    };
    Ok(user_profile)
  } else {
    let error_text = response.text().await?;
    Err(Error::KSError(format!("Failed to get profile")))
  }
}

pub fn create_user_connection(
  email: String,
  access_token: String,
  refresh_token: Option<String>,
  scope: String,
) -> Result<(), Error> {
  let user = User::find_by_email(email)?;
  let connection = Connection::find_by_scope(scope)?;
  let user_connection = UserConnection {
    id: None,
    user_id: user.id.expect("User has no ID"),
    connection_id: connection.id.expect("Connection has no ID"),
    token: access_token,
    refresh_token: refresh_token,
    connection: Some(connection),
    last_synced: None,
  };
  user_connection.upsert()
}

fn create_connections_from_scopes(
  email: String,
  scopes: Vec<String>,
  access_token: String,
  refresh_token: Option<String>,
) -> Vec<String> {
  let mut connected_scopes: Vec<String> = vec![];
  for scope in scopes {
    let user_connection_creation_result = create_user_connection(
      email.clone(),
      access_token.clone(),
      refresh_token.clone(),
      scope.clone(),
    );
    match user_connection_creation_result {
      Ok(_) => {
        connected_scopes.push(scope);
      },
      Err(error) => {
        log::error!("Failed to create user connection for scope {}: {:?}", scope, error);
      }
    };
  }
  connected_scopes
}

async fn microsoft_signin(code: String, state: String, app_handle: tauri::AppHandle) -> Result<(), Error> {
  let oauth_state = app_handle.state::<OAuthState>();
  let code_verifier = oauth_state.code_verifier.lock().unwrap().clone();
  let config = oauth_state.oauth_config.lock().unwrap().clone();
  let scopes = oauth_state.scope_keys.lock().unwrap().clone();

  match get_access_token(&config, &code, &state, &code_verifier).await {
    Ok(token_response) => {
      let profile = match fetch_microsoft_profile(&token_response.access_token.clone(), Some(token_response.refresh_internal.clone())).await {
        Ok(profile) => profile,
        Err(error) => {
          return Err(Error::KSError(format!(
            "Failed to fetch Microsoft profile: {:?}",
            error
          )));
        }
      };
      let email = profile.email.clone().unwrap();
      let uuid = profile.uuid.clone().unwrap();
      let _ = User {
        id: None,
        email: email.clone(),
        uuid: Some(uuid),
      }.create();

      let connection_keys = create_connections_from_scopes(
        email.clone(),
        scopes,
        token_response.access_token.clone(),
        Some(token_response.refresh_token.clone()),
      );

      // Create Knapsack API connection
      create_knapsack_api_connection(
        email.clone(), 
        token_response.refresh_internal.as_ref()
      );

      let window = app_handle.get_window(WINDOW_LABEL).unwrap();
      window.emit(
        "microsoft_signin_success",
        SigninEventPayload {
          profile,
          connection_keys,
        },
      )?;
      focus_window(window);
    }
    Err(error) => {
      return Err(Error::KSError(format!(
        "Failed to get access token: {:?}",
        error
      )));
    }
  }

  Ok(())
}

#[get("/api/knapsack/microsoft/signin")]
async fn microsoft_signin_api(
    req: HttpRequest,
    app_handle: Data<tauri::AppHandle>,
) -> impl Responder {
  let params = match actix_web::web::Query::<SigninParams>::from_query(req.query_string()) {
    Ok(query) => query,
    Err(_) => return HttpResponse::BadRequest().body("Invalid query parameters"),
  };

  match (params.code.as_ref(), params.state.as_ref(), params.error.as_ref()) {
    (Some(code), Some(state), None) => handle_successful_signin(code, state, app_handle).await,
    (None, None, Some(error)) => handle_signin_error(error, &params, app_handle),
    _ => HttpResponse::BadRequest().body("Invalid request parameters"),
  }
}

async fn handle_successful_signin(
  code: &str,
  state: &str,
  app_handle: Data<tauri::AppHandle>,
) -> HttpResponse {
  match microsoft_signin(code.to_string(), state.to_string(), app_handle.get_ref().clone()).await {
    Ok(_) => {
      let html_file = app_handle
        .path_resolver()
        .resolve_resource("resources/signin_success.html")
        .expect("failed to resolve resource");
      let html_string = std::fs::read_to_string(&html_file)
        .unwrap_or_else(|_| "Signin success!".to_string());
      HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html_string)
    }
    Err(error) => {
      log::error!("Error signing in {:?}", error);
      HttpResponse::BadRequest().body("Signin failed!")
    }
  }
}

fn handle_signin_error(
  error: &str,
  params: &SigninParams,
  app_handle: Data<tauri::AppHandle>,
) -> HttpResponse {
  let err_msg = format!(
    "Microsoft signin error: {} - description: {}",
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
