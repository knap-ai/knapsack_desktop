use actix_web::{get, HttpRequest, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::error::Error;

use crate::connections::google::profile::UserInfoResponse;
use crate::connections::microsoft::constants::{ MICROSOFT_PROFILE_SCOPE };
use crate::connections::microsoft::auth::{ refresh_user_connection, fetch_microsoft_profile };

use crate::db::models::user_connection::UserConnection;

pub async fn fetch_microsoft_profile_by_email(email: String) -> Result<UserInfoResponse, Error> {
  let user_connection = UserConnection::find_by_user_email_and_scope(
    email.clone(),
    String::from(MICROSOFT_PROFILE_SCOPE),
  )?;
  let access_token = match refresh_user_connection(user_connection, email.clone()).await {
    Ok(token) => token,
    Err(e) => return Err(Error::KSError(format!("Failed to refresh connection: {:?}", e))),
  };

  match fetch_microsoft_profile(&access_token.token, None).await {
    Ok(profile) => Ok(profile),
    Err(error) => Err(Error::KSError(format!(
      "Error when fetch profile {:?}",
      error
    ))),
  }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FetchMicrosoftProfileParams {
  email: String,
}

#[get("/api/knapsack/connections/microsoft/profile")]
pub async fn fetch_microsoft_profile_api(req: HttpRequest) -> impl Responder {
  let params =
    actix_web::web::Query::<FetchMicrosoftProfileParams>::from_query(req.query_string()).unwrap();
  match fetch_microsoft_profile_by_email(params.email.clone()).await {
    Ok(response) => HttpResponse::Ok().json(response),
    Err(e) => HttpResponse::BadRequest().json(UserInfoResponse {
      success: false,
      uuid: None,
      email: None,
      profile_image: None,
      name: None,
      message: Some(format!("Failed to fetch Microsoft profile: {:?}", e)),
    }),
  }
}
