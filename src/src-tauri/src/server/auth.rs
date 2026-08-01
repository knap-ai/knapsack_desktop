use std::future::{ready, Ready};
use std::rc::Rc;

use actix_web::body::EitherBody;
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use actix_web::{Error, HttpResponse};
use futures_util::future::LocalBoxFuture;

pub const DESKTOP_API_TOKEN_HEADER: &str = "x-knapsack-api-token";
pub const MOBILE_API_TOKEN_HEADER: &str = "x-knapsack-mobile-token";
pub const DESKTOP_API_TOKEN_ENV: &str = "KNAPSACK_DESKTOP_API_TOKEN";

#[derive(Clone, Copy)]
pub enum ApiSurface {
  Desktop,
  Mobile,
}

#[derive(Clone)]
pub struct ApiAuth {
  token: Rc<String>,
  surface: ApiSurface,
}

impl ApiAuth {
  pub fn desktop(token: String) -> Self {
    Self {
      token: Rc::new(token),
      surface: ApiSurface::Desktop,
    }
  }

  pub fn mobile(token: String) -> Self {
    Self {
      token: Rc::new(token),
      surface: ApiSurface::Mobile,
    }
  }
}

fn is_public_desktop_path(path: &str) -> bool {
  matches!(
    path,
    "/"
      | "/api/clawd/oauth/callback"
      | "/api/auth/knapsack-callback"
      | "/api/knapsack/google/signin"
      | "/api/knapsack/microsoft/signin"
      | "/api/knapsack/focus"
  )
}

fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
  if left.len() != right.len() {
    return false;
  }
  left
    .iter()
    .zip(right.iter())
    .fold(0u8, |difference, (a, b)| difference | (a ^ b))
    == 0
}

fn request_is_authorized(req: &ServiceRequest, token: &str, surface: ApiSurface) -> bool {
  if req.method() == actix_web::http::Method::OPTIONS {
    return true;
  }
  if matches!(surface, ApiSurface::Desktop) && is_public_desktop_path(req.path()) {
    return true;
  }

  let header_name = match surface {
    ApiSurface::Desktop => DESKTOP_API_TOKEN_HEADER,
    ApiSurface::Mobile => MOBILE_API_TOKEN_HEADER,
  };
  req
    .headers()
    .get(header_name)
    .and_then(|value| value.to_str().ok())
    .map(|value| constant_time_eq(value.as_bytes(), token.as_bytes()))
    .unwrap_or(false)
}

impl<S, B> Transform<S, ServiceRequest> for ApiAuth
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<EitherBody<B>>;
  type Error = Error;
  type InitError = ();
  type Transform = ApiAuthMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ready(Ok(ApiAuthMiddleware {
      service: Rc::new(service),
      token: Rc::clone(&self.token),
      surface: self.surface,
    }))
  }
}

pub struct ApiAuthMiddleware<S> {
  service: Rc<S>,
  token: Rc<String>,
  surface: ApiSurface,
}

impl<S, B> Service<ServiceRequest> for ApiAuthMiddleware<S>
where
  S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
  S::Future: 'static,
  B: 'static,
{
  type Response = ServiceResponse<EitherBody<B>>;
  type Error = Error;
  type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

  actix_web::dev::forward_ready!(service);

  fn call(&self, req: ServiceRequest) -> Self::Future {
    if !request_is_authorized(&req, &self.token, self.surface) {
      return Box::pin(async move {
        Ok(
          req.into_response(
            HttpResponse::Unauthorized()
              .json(serde_json::json!({"error": "Authentication required"}))
              .map_into_right_body(),
          ),
        )
      });
    }

    let service = Rc::clone(&self.service);
    Box::pin(async move {
      service
        .call(req)
        .await
        .map(ServiceResponse::map_into_left_body)
    })
  }
}

pub fn desktop_api_token_from_env() -> Result<String, String> {
  std::env::var(DESKTOP_API_TOKEN_ENV)
    .ok()
    .filter(|token| !token.trim().is_empty())
    .ok_or_else(|| "Desktop API token is unavailable".to_string())
}

pub fn authenticated_request(
  builder: reqwest::RequestBuilder,
) -> Result<reqwest::RequestBuilder, String> {
  Ok(builder.header(DESKTOP_API_TOKEN_HEADER, desktop_api_token_from_env()?))
}

#[cfg(test)]
mod tests {
  use super::*;
  use actix_web::{http::StatusCode, test as actix_test, web, App};

  #[test]
  fn only_external_callback_routes_are_public() {
    assert!(is_public_desktop_path("/api/clawd/oauth/callback"));
    assert!(is_public_desktop_path("/api/knapsack/google/signin"));
    assert!(is_public_desktop_path("/api/knapsack/focus"));
    assert!(!is_public_desktop_path("/api/clawd/service/get-api-key"));
    assert!(!is_public_desktop_path("/api/clawd/agent-run"));
  }

  #[test]
  fn token_comparison_requires_exact_value() {
    assert!(constant_time_eq(b"secret", b"secret"));
    assert!(!constant_time_eq(b"secret", b"Secret"));
    assert!(!constant_time_eq(b"secret", b"secret-extra"));
  }

  #[actix_web::test]
  async fn desktop_routes_reject_missing_token_and_accept_matching_token() {
    let app = actix_test::init_service(
      App::new()
        .wrap(ApiAuth::desktop("desktop-secret".to_string()))
        .route(
          "/private",
          web::get().to(|| async { HttpResponse::Ok().finish() }),
        ),
    )
    .await;

    let unauthorized = actix_test::call_service(
      &app,
      actix_test::TestRequest::get().uri("/private").to_request(),
    )
    .await;
    assert_eq!(unauthorized.status(), StatusCode::UNAUTHORIZED);

    let authorized = actix_test::call_service(
      &app,
      actix_test::TestRequest::get()
        .uri("/private")
        .insert_header((DESKTOP_API_TOKEN_HEADER, "desktop-secret"))
        .to_request(),
    )
    .await;
    assert_eq!(authorized.status(), StatusCode::OK);
  }

  #[actix_web::test]
  async fn mobile_routes_require_the_distinct_pairing_token() {
    let app = actix_test::init_service(
      App::new()
        .wrap(ApiAuth::mobile("mobile-secret".to_string()))
        .route("/", web::get().to(|| async { HttpResponse::Ok().finish() })),
    )
    .await;

    let desktop_token = actix_test::call_service(
      &app,
      actix_test::TestRequest::get()
        .uri("/")
        .insert_header((DESKTOP_API_TOKEN_HEADER, "mobile-secret"))
        .to_request(),
    )
    .await;
    assert_eq!(desktop_token.status(), StatusCode::UNAUTHORIZED);

    let mobile_token = actix_test::call_service(
      &app,
      actix_test::TestRequest::get()
        .uri("/")
        .insert_header((MOBILE_API_TOKEN_HEADER, "mobile-secret"))
        .to_request(),
    )
    .await;
    assert_eq!(mobile_token.status(), StatusCode::OK);
  }
}
