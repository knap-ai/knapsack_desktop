use reqwest::StatusCode;
use tokio_retry::strategy::{ExponentialBackoff, jitter};
use tokio_retry::Retry;
use std::time::Duration;

use crate::connections::google::constants::{
  GOOGLE_APIS_BASE_URL, GOOGLE_DRIVE_SCOPE, GOOGLE_PROFILE_SCOPE,
};
use crate::connections::google::types::{ FetchError };
use crate::db::models::user_connection::UserConnection;
use crate::error::Error;
use actix_web::web::Data;
use actix_web::{get, HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use super::auth::refresh_connection_token;
use crate::connections::utils::fetch_user_uuid;
use crate::utils::log::knap_log_error;

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleUserInfoResponse {
  email: String,
  picture: Option<String>,
  name: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct UserInfoResponse {
  pub success: bool,
  pub email: Option<String>,
  pub profile_image: Option<String>,
  pub name: Option<String>,
  pub message: Option<String>,
  pub uuid: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchGoogleProfileParams {
  email: String,
}

pub async fn fetch_google_profile(access_token: String, refresh_internal: Option<String>) -> Result<UserInfoResponse, FetchError> {
  let client = reqwest::Client::new();
  let retry_strategy = ExponentialBackoff::from_millis(2000)
      .max_delay(Duration::from_secs(3))
      .map(jitter) 
      .take(3);

    let response = Retry::spawn(retry_strategy, || {
      let access_token = access_token.clone();
      let client = client.clone();
      async move {
        let response = client
          .get(format!("{}/v3/userinfo", GOOGLE_APIS_BASE_URL))
          .header("authorization", format!("Bearer {}", access_token))
          .send()
          .await
          .map_err(FetchError::NetworkError)?;

        match response.status() {
          StatusCode::OK => Ok(response),
          StatusCode::UNAUTHORIZED => Err(FetchError::InvalidToken),
          StatusCode::TOO_MANY_REQUESTS => Err(FetchError::RateLimitExceeded),
          status if status.is_server_error() => Err(FetchError::ServerError(status)),
          _ => Err(FetchError::UnknownError(format!(
              "Unexpected status code: {}",
              response.status()
          ))),
        }
      }
  }).await;

  let info = response.unwrap().json::<GoogleUserInfoResponse>().await.unwrap();
  let user_uuid: Option<String> = match fetch_user_uuid(&info.email, refresh_internal).await {
    Ok(uuid) => Some(uuid),
    Err(err) => {
      let err_msg = format!("{:?}", err);
      knap_log_error(err_msg, Some(Error::FetchUuidError(err)), None);
      None
    },
  };
  Ok(UserInfoResponse {
      success: true,
      email: Some(info.email),
      profile_image: info.picture,
      name: Some(info.name),
      uuid: user_uuid,
      message: None,
  })
}

pub async fn fetch_google_profile_by_email(email: String) -> Result<UserInfoResponse, Error> {
  let user_connection = UserConnection::find_by_user_email_and_scope(
    email.clone(),
    String::from(GOOGLE_PROFILE_SCOPE),
  )?;
  let access_token = refresh_connection_token(email.clone(), user_connection).await?;
  match fetch_google_profile(access_token, None).await {
    Ok(profile) => Ok(profile),
    Err(error) => Err(Error::KSError(format!(
      "Error when fetch profile {:?}",
      error
    ))),
  }
}

#[get("/api/knapsack/connections/google/profile")]
async fn fetch_google_profile_api(req: HttpRequest) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchGoogleProfileParams>::from_query(req.query_string()).unwrap();
  match fetch_google_profile_by_email(params.email.clone()).await {
    Ok(response) => HttpResponse::Ok().json(response),
    Err(e) => HttpResponse::BadRequest().json(UserInfoResponse {
      success: false,
      email: None,
      profile_image: None,
      name: None,
      message: Some(format!("Failed to fetch Google profile: {:?}", e)),
      uuid: None,
    }),
  }
}
