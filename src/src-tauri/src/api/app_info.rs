use actix_web::{get, Error, HttpResponse};
use serde::Serialize;

use crate::{release_type, Release};

#[derive(Serialize)]
struct ReleaseTypeReponse {
  pub release_type: Release,
}

#[get("/api/knapsack/release_type")]
async fn get_release_type() -> Result<HttpResponse, Error> {
  let release_type = release_type();
  let release_type_response = ReleaseTypeReponse { release_type };
  Ok(HttpResponse::Ok().json(release_type_response))
}
