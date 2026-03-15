use google_gmail1::{hyper, hyper_rustls};
use once_cell::sync::Lazy;
use std::sync::Mutex;

/// Cached hyper HTTPS client to avoid repeatedly loading native root certificates.
///
/// On macOS, calling `with_native_roots()` invokes `SecTrustSettingsCopyTrustSettings`
/// for every certificate, which is not thread-safe when called concurrently from
/// multiple tokio workers. By building the client once and cloning it (hyper::Client
/// is backed by an Arc internally), we eliminate the concurrent certificate loading
/// that causes memory corruption crashes.
static CACHED_CLIENT: Lazy<
  Mutex<Option<hyper::Client<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>>>>,
> = Lazy::new(|| Mutex::new(None));

pub fn get_https_client(
) -> hyper::Client<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>> {
  let mut guard = CACHED_CLIENT.lock().unwrap();
  if let Some(client) = guard.as_ref() {
    return client.clone();
  }
  let client = hyper::Client::builder().build(
    hyper_rustls::HttpsConnectorBuilder::new()
      .with_native_roots()
      .unwrap()
      .https_or_http()
      .enable_http1()
      .build(),
  );
  *guard = Some(client.clone());
  client
}
