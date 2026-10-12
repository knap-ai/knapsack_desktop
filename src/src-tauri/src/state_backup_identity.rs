//! Native-only recovery credentials. Nothing here is serialized into UI or GBrain.
use super::*;
use ring::signature::{Ed25519KeyPair, KeyPair};
use std::collections::HashMap;
use zeroize::Zeroizing;
use tauri::Manager;

struct Session {
  token: Zeroizing<String>,
  session_id: String,
  pkcs8: Zeroizing<Vec<u8>>,
  proofs: HashMap<String, Zeroizing<String>>,
  provider: String,
  expires_at: u64,
}
static SESSION: Mutex<Option<Session>> = Mutex::new(None);
static PENDING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);
struct PendingGuard;
impl Drop for PendingGuard {
  fn drop(&mut self) { PENDING.store(false,std::sync::atomic::Ordering::SeqCst); }
}

pub(super) fn clear() {
  if let Ok(mut session) = SESSION.lock() { *session = None; }
  super::conversations::clear_keys();
}
pub(super) fn cancel() {
  if PENDING.load(std::sync::atomic::Ordering::SeqCst) { super::cancel_active(); clear(); }
}
pub(super) fn provider() -> Result<String, String> {
  SESSION.lock().map_err(|_| "Recovery identity is busy")?.as_ref()
    .map(|s| s.provider.clone()).ok_or_else(|| "Verify your Google or Microsoft recovery identity first.".into())
}

pub(super) fn signature_message(session: &str, method: &str, path: &str, time: &str,
    nonce: &str, body_hash: &str, header_hash: &str) -> String {
  ["knapsack-recovery-request-v1",session,method,path,time,nonce,body_hash,header_hash].join("\n")
}

pub(super) async fn send(builder: reqwest::RequestBuilder) -> Result<reqwest::Response, String> {
  let mut request = builder.build().map_err(|_| "Invalid backup request")?;
  {
    let mut guard = SESSION.lock().map_err(|_| "Recovery identity is busy")?;
    match guard.as_mut() {
      Some(session) => {
        if timestamp()/1000 >= session.expires_at { return Err("Recovery identity expired. Verify your identity again.".into()); }
        let body = match request.body() {
          Some(body) => body.as_bytes().ok_or("Unsupported streaming backup request")?,
          None => &[],
        };
        let body_hash = digest(body);
        let backup_headers = ["X-Backup-Device","X-Backup-Epoch","X-Backup-Revision","X-Backup-Snapshot","X-Backup-Recovery-Mode","X-Backup-Key-Version"]
          .iter().map(|name| request.headers().get(*name).and_then(|v| v.to_str().ok()).unwrap_or("")).collect::<Vec<_>>().join("\n");
        let time = (timestamp()/1000).to_string();
        let nonce = uuid::Uuid::new_v4().to_string();
        let key = Ed25519KeyPair::from_pkcs8(&session.pkcs8).map_err(|_| "Recovery device key is unavailable")?;
        let message = signature_message(&session.session_id, request.method().as_str(),request.url().path(),&time,&nonce,&body_hash,&digest(backup_headers.as_bytes()));
        let signature = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(key.sign(message.as_bytes()).as_ref());
        let purpose = if request.url().path().ends_with("/key") {
          let data: serde_json::Value = serde_json::from_slice(body).map_err(|_| "Invalid backup key request")?;
          Some(if data["operation"] == "ensure" { "backup-key-enroll" } else { "backup-key-recover" })
        } else if request.url().path().ends_with("/authority") {
          let data: serde_json::Value = serde_json::from_slice(body).map_err(|_| "Invalid backup authority request")?;
          if data["takeover"] == true { Some("backup-device-takeover") } else { None }
        } else if request.url().path().ends_with("/devices/revoke") { Some("backup-device-revoke") } else { None };
        let headers = request.headers_mut();
        for (name,value) in [("X-Knapsack-Recovery-Session",session.token.as_str()),
          ("X-Knapsack-Recovery-Time",time.as_str()),("X-Knapsack-Recovery-Nonce",nonce.as_str()),
          ("X-Knapsack-Recovery-Body-SHA256",body_hash.as_str()),("X-Knapsack-Recovery-Signature",signature.as_str())] {
          headers.insert(reqwest::header::HeaderName::from_bytes(name.as_bytes()).map_err(|_| "Invalid recovery header")?,
            reqwest::header::HeaderValue::from_str(value).map_err(|_| "Invalid recovery credential")?);
        }
        if let Some(purpose) = purpose {
          let proof = session.proofs.remove(purpose).ok_or("Fresh provider verification is required for this backup action.")?;
          headers.insert("X-Knapsack-Recovery-Proof",reqwest::header::HeaderValue::from_str(&proof).map_err(|_| "Invalid recovery proof")?);
        }
      }
      None if request.url().path().ends_with("/me") => {},
      None => return Err("Verify your Google or Microsoft recovery identity first.".into()),
    }
  }
  super::api_client()?.execute(request).await.map_err(|_| "Recovery request was interrupted. Check status before retrying.".into())
}

#[derive(Deserialize)]
struct StartReply {
  flow_id: String, poll_secret: String, session_token: String, session_id: String,
  proof_tokens: HashMap<String,String>, authorization_url: String,
}
impl Drop for StartReply {
  fn drop(&mut self) {
    self.poll_secret.zeroize(); self.session_token.zeroize(); self.authorization_url.zeroize();
    for value in self.proof_tokens.values_mut() { value.zeroize(); }
  }
}

fn trusted_authorization_url(provider: &str, value: &str) -> Result<(), String> {
  let url = reqwest::Url::parse(value).map_err(|_| "Invalid recovery authorization URL")?;
  let (host,path) = if provider == "google" { ("accounts.google.com","/o/oauth2/v2/auth") }
    else if provider == "microsoft" { ("login.microsoftonline.com","/common/oauth2/v2.0/authorize") }
    else { return Err("Choose Google or Microsoft for recovery identity.".into()); };
  if url.scheme() != "https" || url.host_str() != Some(host) || url.path() != path
    || url.port_or_known_default() != Some(443) || !url.username().is_empty() || url.password().is_some() || url.fragment().is_some() {
    return Err("Recovery authorization URL is not an approved provider endpoint.".into());
  }
  let params: HashMap<_,_> = url.query_pairs().into_owned().collect();
  if params.get("scope").map(String::as_str) != Some("openid profile")
    || params.get("code_challenge_method").map(String::as_str) != Some("S256") {
    return Err("Recovery verification must use identity-only permissions and PKCE.".into());
  }
  Ok(())
}

pub(super) async fn authorize(app: &tauri::AppHandle, provider: &str, purpose: &str,
    state: &LocalState, account: Option<&AccountState>) -> Result<(), String> {
  authorize_reviewed(app,provider,purpose,state,account,None).await
}

pub(super) async fn authorize_reviewed(app:&tauri::AppHandle, provider:&str,purpose:&str,state:&LocalState,account:Option<&AccountState>,revoked_device:Option<&str>)->Result<(),String> {
  PENDING.store(true,std::sync::atomic::Ordering::SeqCst);
  let _pending = PendingGuard;
  let revision = session_revision();
  let mut cancelled = CANCEL.subscribe();
  let token = Zeroizing::new(access_token(app).await?);
  let rng = ring::rand::SystemRandom::new();
  let pkcs8 = Zeroizing::new(Ed25519KeyPair::generate_pkcs8(&rng).map_err(|_| "Cannot create recovery device proof")?.as_ref().to_vec());
  let key = Ed25519KeyPair::from_pkcs8(&pkcs8).map_err(|_| "Cannot initialize recovery device proof")?;
  let mut body = serde_json::json!({"provider":provider,"device_id":state.device_id,
    "device_public_key":base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(key.public_key().as_ref()),"purpose":purpose});
  if let Some(account) = account {
    body["expected_owner_id"] = account.account_id.clone().into();
    if purpose == "backup-device-revoke" {
      body["expected_epoch"] = account.epoch.into();
      body["revoked_device_id"] = revoked_device.ok_or("Choose a reviewed computer to revoke")?.into();
    }
    if purpose == "backup-key-enroll" || purpose == "backup-restore" { body["expected_epoch"] = account.epoch.into(); }
    if purpose == "backup-key-recover" || purpose == "backup-restore" { body["key_version"] = account.key_version.clone().into(); }
    if purpose == "backup-restore" { body["expected_revision"] = account.revision.into(); }
  }
  let response = api_client()?.post(api_url("/auth/start")?).bearer_auth(token.as_str()).json(&body).send().await
    .map_err(|_| "Recovery verification could not be reached")?;
  let response = checked(response).await?;
  // Credentials stay in native memory. Never return this reply over IPC or log it.
  let mut bytes = Zeroizing::new(Vec::new());
  let mut response = response;
  while let Some(chunk) = response.chunk().await.map_err(|_| "Recovery verification interrupted")? {
    if bytes.len()+chunk.len()>16384 { return Err("Invalid recovery verification response".into()); }
    bytes.extend_from_slice(&chunk);
  }
  let mut reply: StartReply = serde_json::from_slice(&bytes).map_err(|_| "Invalid recovery verification response")?;
  trusted_authorization_url(provider,&reply.authorization_url)?;
  if uuid::Uuid::parse_str(&reply.flow_id).is_err() || uuid::Uuid::parse_str(&reply.session_id).is_err()
    || reply.session_token.len()!=64 || reply.poll_secret.len()!=43 || reply.proof_tokens.values().any(|value| value.len()!=64) {
    return Err("Invalid recovery credential response".into());
  }
  unchanged(revision)?;
  tauri::api::shell::open(&app.shell_scope(),&reply.authorization_url,None).map_err(|_| "Could not open identity verification in your browser")?;
  PENDING.store(true,std::sync::atomic::Ordering::SeqCst);
  let result = async {
    let started = std::time::Instant::now();
    loop {
      tokio::select! {
        _ = tokio::time::sleep(Duration::from_secs(2)) => {},
        _ = cancelled.changed() => return Err("Recovery verification cancelled. No backup action was replayed.".to_string()),
      }
      unchanged(revision)?;
      if started.elapsed()>Duration::from_secs(300) { return Err("Identity verification expired. Retry when ready.".into()); }
      let result = api_client()?.post(api_url("/auth/poll")?).bearer_auth(token.as_str())
        .json(&serde_json::json!({"flow_id":reply.flow_id,"poll_secret":reply.poll_secret})).send().await
        .map_err(|_| "Recovery verification was interrupted")?;
      let value: serde_json::Value = checked(result).await?.json().await.map_err(|_| "Invalid recovery verification status")?;
      match value["status"].as_str() {
        Some("waiting" | "verifying") => continue,
        Some("complete") => {
          if value["session_id"].as_str()!=Some(reply.session_id.as_str())
            || account.is_some_and(|a| value["account_id"].as_str()!=Some(a.account_id.as_str())) { return Err("Recovery identity changed. Review the account again.".into()); }
          unchanged(revision)?;
          let mut guard = SESSION.lock().map_err(|_| "Recovery identity is busy")?;
          unchanged(revision)?;
          *guard = Some(Session { token: Zeroizing::new(std::mem::take(&mut reply.session_token)),
            session_id: reply.session_id.clone(), pkcs8,
            proofs: std::mem::take(&mut reply.proof_tokens).into_iter().map(|(k,v)|(k,Zeroizing::new(v))).collect(),
            provider:provider.to_string(), expires_at:timestamp()/1000+14400 });
          return Ok(());
        }
        _ => return Err("Provider verification failed or was cancelled. Retry when ready.".into()),
      }
    }
  }.await;
  PENDING.store(false,std::sync::atomic::Ordering::SeqCst);
  if result.is_err() {
    let _ = api_client()?.post(api_url("/auth/cancel")?).bearer_auth(token.as_str())
      .json(&serde_json::json!({"flow_id":reply.flow_id,"poll_secret":reply.poll_secret})).send().await;
  }
  result
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn signatures_bind_method_path_body_and_headers() {
    let message=signature_message("session","POST","/api/state-backup/key","1","nonce","body","headers");
    assert_eq!(message,"knapsack-recovery-request-v1\nsession\nPOST\n/api/state-backup/key\n1\nnonce\nbody\nheaders");
    assert_ne!(message,signature_message("session","GET","/api/state-backup/key","1","nonce","body","headers"));
  }
  #[test]
  fn authorization_cannot_open_arbitrary_hosts_or_mail_grants() {
    assert!(trusted_authorization_url("google","https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20profile&code_challenge_method=S256").is_ok());
    assert!(trusted_authorization_url("google","https://attacker.invalid/o/oauth2/v2/auth?scope=openid%20profile&code_challenge_method=S256").is_err());
    assert!(trusted_authorization_url("google","https://accounts.google.com/o/oauth2/v2/auth?scope=gmail.modify&code_challenge_method=S256").is_err());
  }
}
