use actix_web::{get, HttpResponse, Error};
use serde::Serialize;

use crate::{Release, release_type};

#[derive(Serialize)]
struct ReleaseTypeReponse {
  pub release_type: Release,
}

#[get("/api/knapsack/release_type")]
async fn get_release_type() -> Result<HttpResponse, Error> {
  let release_type = release_type();
  let release_type_response = ReleaseTypeReponse {
    release_type,
  };
  Ok(HttpResponse::Ok().json(release_type_response))
}
