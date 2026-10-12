//! Account-scoped, explicitly opted-in encrypted backup of the existing GBrain stores.
//! This is a Tauri-only control plane: no agent/localhost route can opt in or restore.
use base64::Engine as _;
use knapsack_state_backup::{Limits, RecoveryKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  fs,
  io::{Read, Write},
  path::{Path, PathBuf},
  sync::Mutex,
  time::{Duration, SystemTime, UNIX_EPOCH},
};
use zeroize::Zeroize;
#[path = "state_backup_identity.rs"]
mod identity;
#[path = "state_backup_devices.rs"]
pub(crate) mod devices;
#[path = "state_backup_conversations.rs"]
pub(crate) mod conversations;
#[path = "state_backup_imessage.rs"]
pub(crate) mod imessage;
#[path = "state_backup_imessage_delivery.rs"]
pub(crate) mod imessage_delivery;

pub(crate) static STORE_WRITE_LOCK: Mutex<()> = Mutex::new(());
static CONFIG_LOCK: Mutex<()> = Mutex::new(());
static OPERATION_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());
const MAX_ENVELOPE: usize = 16 * 1024 * 1024;
static SESSION_REVISION: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
static CANCEL: once_cell::sync::Lazy<tokio::sync::watch::Sender<u64>> =
  once_cell::sync::Lazy::new(|| tokio::sync::watch::channel(0).0);
fn session_revision() -> u64 {
  SESSION_REVISION.load(std::sync::atomic::Ordering::SeqCst)
}
fn cancel_active() {
  let next = SESSION_REVISION.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
  CANCEL.send_replace(next);
}
fn unchanged(revision: u64) -> Result<(), String> {
  if session_revision() != revision {
    Err("Account or backup consent changed. Operation cancelled.".into())
  } else {
    Ok(())
  }
}
/// Sign-out/account change revokes local consent before credentials change. No network calls.
pub(crate) fn suspend_on_account_change() {
  cancel_active();
  imessage_delivery::suspend();
  identity::clear();
  let Ok(_config) = CONFIG_LOCK.lock() else {
    return;
  };
  if let Ok(mut s) = load() {
    s.enabled = false;
    s.automatic = false;
    s.last_error = Some("Account changed. Review and enable backup again.".into());
    let _ = save_unlocked(&s);
    clear_key(&s);
  }
}
const KEY_SERVICE: &str = "ai.knap.knapsack.state-backup.v1";
const ACCOUNT_RECOVERY_MODE: &str = "account_recovery_v1";

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LocalState {
  schema_version: u32,
  brain_root: PathBuf,
  owner_account_id: Option<String>,
  device_id: String,
  enabled: bool,
  automatic: bool,
  epoch: u64,
  revision: u64,
  last_backup_at: Option<u64>,
  last_snapshot_id: Option<String>,
  last_content_sha256: Option<String>,
  last_error: Option<String>,
  #[serde(default)]
  warnings: Vec<String>,
  #[serde(default)]
  recovery_mode: Option<String>,
  #[serde(default)]
  key_version: Option<String>,
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupStatus {
  schema_version: u32,
  brain_root: String,
  owner_account_id: Option<String>,
  device_id: String,
  enabled: bool,
  automatic: bool,
  last_backup_at: Option<u64>,
  last_snapshot_id: Option<String>,
  last_error: Option<String>,
  warnings: Vec<String>,
  recovery_mode: Option<String>,
}
impl From<LocalState> for BackupStatus {
  fn from(s: LocalState) -> Self {
    Self {
      schema_version: s.schema_version,
      brain_root: s.brain_root.to_string_lossy().into_owned(),
      owner_account_id: s.owner_account_id,
      device_id: s.device_id,
      enabled: s.enabled,
      automatic: s.automatic,
      last_backup_at: s.last_backup_at,
      last_snapshot_id: s.last_snapshot_id,
      last_error: s.last_error,
      warnings: s.warnings,
      recovery_mode: s.recovery_mode,
    }
  }
}
#[derive(Clone, Deserialize, Serialize)]
pub struct AccountState {
  account_id: String,
  enabled: bool,
  device_id: Option<String>,
  epoch: u64,
  revision: u64,
  latest_snapshot_id: Option<String>,
  #[serde(default)]
  recovery_mode: String,
  #[serde(default)]
  key_version: Option<String>,
  #[serde(default)]
  account_recovery_available: bool,
  #[serde(default)]
  account_recovery_unavailable_reason: Option<String>,
}
#[derive(Deserialize)]
struct Receipt {
  snapshot_id: String,
  account_id: String,
  revision: u64,
  epoch: u64,
  sha256: String,
  size_bytes: usize,
  recovery_mode: String,
  key_version: Option<String>,
}
#[derive(Serialize, Deserialize)]
struct Pending {
  account_id: String,
  device_id: String,
  epoch: u64,
  revision: u64,
  snapshot_id: String,
  content_sha256: String,
  envelope_sha256: String,
  recovery_mode: String,
  key_version: String,
}
fn timestamp() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or_default()
    .as_millis() as u64
}
fn digest(bytes: &[u8]) -> String {
  format!("{:x}", Sha256::digest(bytes))
}
fn state_dir() -> Result<PathBuf, String> {
  #[cfg(test)]
  {
    thread_local! { static TEST_ROOT: PathBuf = std::env::temp_dir().canonicalize().unwrap().join(format!("kn-state-test-{}", uuid::Uuid::new_v4())); }
    return TEST_ROOT.with(|p| Ok(p.clone()));
  }
  #[cfg(not(test))]
  {
    dirs::home_dir()
      .map(|p| p.join(".knapsack"))
      .ok_or("Home directory unavailable".into())
  }
}
fn state_path() -> Result<PathBuf, String> {
  Ok(state_dir()?.join("authoritative-state-v1.json"))
}
pub(crate) fn legacy_root() -> PathBuf {
  dirs::home_dir().unwrap_or_default().join("gbrain")
}
fn load() -> Result<LocalState, String> {
  let path = state_path()?;
  if !path.exists() {
    return Ok(LocalState {
      schema_version: 1,
      brain_root: legacy_root(),
      owner_account_id: None,
      device_id: uuid::Uuid::new_v4().to_string(),
      enabled: false,
      automatic: false,
      epoch: 0,
      revision: 0,
      last_backup_at: None,
      last_snapshot_id: None,
      last_content_sha256: None,
      last_error: None,
      warnings: Vec::new(),
      recovery_mode: None,
      key_version: None,
    });
  }
  if path
    .symlink_metadata()
    .map_err(|_| "Cannot inspect authoritative state")?
    .file_type()
    .is_symlink()
  {
    return Err("Refusing symbolic-link authoritative state".into());
  }
  let s: LocalState =
    serde_json::from_slice(&fs::read(path).map_err(|_| "Cannot read authoritative state")?)
      .map_err(|_| "Authoritative state is invalid; recovery is required before writing")?;
  if s.schema_version != 1 || !s.brain_root.is_absolute() {
    return Err("Unsupported authoritative state version or root".into());
  }
  uuid::Uuid::parse_str(&s.device_id).map_err(|_| "Invalid authoritative device identity")?;
  Ok(s)
}
/// Creates private directories/files before writing bytes and commits by fsync + rename.
pub(crate) fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), String> {
  let parent = path.parent().ok_or("Missing state directory")?;
  for ancestor in path.ancestors() {
    if ancestor
      .symlink_metadata()
      .map(|m| m.file_type().is_symlink())
      .unwrap_or(false)
    {
      return Err("Refusing a symbolic-link state path".into());
    }
  }
  fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(parent, fs::Permissions::from_mode(0o700)).map_err(|e| e.to_string())?;
  }
  if path
    .symlink_metadata()
    .map(|m| m.file_type().is_symlink())
    .unwrap_or(false)
  {
    return Err("Refusing a symbolic-link state file".into());
  }
  let tmp = parent.join(format!(".state-{}.tmp", uuid::Uuid::new_v4()));
  let result = (|| {
    let mut options = fs::OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
      use std::os::unix::fs::OpenOptionsExt;
      options.mode(0o600);
    }
    let mut f = options.open(&tmp).map_err(|e| e.to_string())?;
    f.write_all(bytes)
      .and_then(|_| f.sync_all())
      .map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    #[cfg(unix)]
    {
      fs::File::open(parent).and_then(|f| f.sync_all()).map_err(|_| "State committed, but disk durability could not be confirmed. Restart Knapsack and check backup status.".to_string())?;
    }
    Ok(())
  })();
  if result.is_err() {
    let _ = fs::remove_file(tmp);
  }
  result
}
fn save_unlocked(s: &LocalState) -> Result<(), String> {
  atomic_write(
    &state_path()?,
    &serde_json::to_vec_pretty(s).map_err(|e| e.to_string())?,
  )
}
fn commit_session(s: &LocalState, session: u64) -> Result<(), String> {
  let _config = CONFIG_LOCK.lock().map_err(|_| "State settings are busy")?;
  unchanged(session)?;
  save_unlocked(s)
}
fn platform_supported() -> Result<(), String> {
  if cfg!(any(target_os = "macos", target_os = "linux")) {
    Ok(())
  } else {
    Err("Encrypted state backup and restore currently support macOS and Linux only".into())
  }
}
fn initialized() -> Result<LocalState, String> {
  let _g = CONFIG_LOCK.lock().map_err(|_| "State settings are busy")?;
  let s = load()?;
  if !state_path()?.exists() {
    save_unlocked(&s)?;
  }
  Ok(s)
}
pub(crate) fn authoritative_root() -> Result<PathBuf, String> {
  Ok(load()?.brain_root)
}
/// Once account ownership is adopted, callers cannot accidentally keep writing an old generation.
pub(crate) fn resolve_root(requested: &str) -> Result<PathBuf, String> {
  let s = load()?;
  let root = if requested.trim().is_empty() {
    s.brain_root.clone()
  } else {
    PathBuf::from(requested.trim())
  };
  if s.owner_account_id.is_some() && root != s.brain_root {
    return Err("The authoritative GBrain changed. Refresh or restart Knapsack.".into());
  }
  Ok(root)
}
pub(crate) fn check_write_target(path: &Path) -> Result<(), String> {
  let s = load()?;
  if s.owner_account_id.is_some() && !path.starts_with(&s.brain_root) {
    return Err("Cannot write to a retired GBrain generation".into());
  }
  Ok(())
}

#[tauri::command]
pub fn kn_state_backup_status() -> Result<BackupStatus, String> {
  Ok(initialized()?.into())
}

fn api_client() -> Result<reqwest::Client, String> {
  reqwest::Client::builder()
    .redirect(reqwest::redirect::Policy::none())
    .timeout(Duration::from_secs(60))
    .build()
    .map_err(|_| "Cannot initialize backup connection".into())
}
fn api_url(suffix: &str) -> Result<String, String> {
  // Compile-time first-party endpoint only; never accept an arbitrary URL from UI/agent/config.
  let base = option_env!("VITE_KN_API_SERVER")
    .unwrap_or("https://api.knapsack.ai")
    .trim_end_matches('/');
  let u = reqwest::Url::parse(base).map_err(|_| "Invalid backup service endpoint")?;
  if u.scheme() != "https"
    || u.username() != ""
    || u.password().is_some()
    || u.query().is_some()
    || u.fragment().is_some()
  {
    return Err("Backup service requires a credential-free HTTPS endpoint".into());
  }
  Ok(format!("{base}/api/state-backup{suffix}"))
}
async fn access_token(app: &tauri::AppHandle) -> Result<String, String> {
  crate::clawd::service::studio_access_token(app).await
}
fn http_error(status: reqwest::StatusCode) -> String {
  match status.as_u16() {
    401 | 403 => "Knapsack sign-in is required or expired. Reconnect your account.",
    409 => "Backup authority changed or another backup committed. Refresh account status before retrying.",
    404 => "No matching account backup was found.",
    413 => "This backup exceeds the account backup size limit.",
    503 => "Account backup is not available on this Knapsack server yet.",
    _ => "The backup service could not complete the request. Existing local state and backups are unchanged.",
  }.into()
}
async fn checked(response: reqwest::Response) -> Result<reqwest::Response, String> {
  if !response.status().is_success() {
    return Err(http_error(response.status()));
  }
  Ok(response)
}
async fn account_for(token: &str) -> Result<AccountState, String> {
  let r = identity::send(api_client()?.get(api_url("/me")?).bearer_auth(token)).await?;
  let value: AccountState = checked(r)
    .await?
    .json()
    .await
    .map_err(|_| "Invalid backup account response")?;
  if value.account_id.is_empty() || value.account_id.len() > 128 {
    return Err("Invalid account identity".into());
  }
  Ok(value)
}
#[tauri::command]
pub async fn kn_state_backup_account(app_handle: tauri::AppHandle) -> Result<AccountState, String> {
  account_for(&access_token(&app_handle).await?).await
}
#[tauri::command]
pub async fn kn_state_backup_verify_identity(app_handle: tauri::AppHandle, provider: String) -> Result<AccountState, String> {
  let _op = OPERATION_LOCK.lock().await;
  let state = initialized()?;
  let revision = session_revision();
  identity::authorize(&app_handle, &provider, "backup-sign-in", &state, None).await?;
  unchanged(revision)?;
  account_for(&access_token(&app_handle).await?).await
}
#[tauri::command]
pub fn kn_state_backup_cancel_identity() { identity::cancel(); }
#[tauri::command]
pub fn kn_state_backup_cancel_operation() {
  cancel_active();
  identity::cancel();
}

fn decode_legacy_archive(bytes: &[u8], key: &RecoveryKey, old_owner: &str, new_owner: &str) -> Result<knapsack_state_backup::Snapshot, String> {
  if old_owner == new_owner || new_owner == "unbound" { return Err("Migration requires a distinct verified recovery identity.".into()); }
  knapsack_state_backup::open(bytes, key, old_owner, Limits::default()).map_err(|_| "Original archive authentication failed. The original device/key is required; no email-based recovery fallback is available.".into())
}

#[tauri::command]
pub async fn kn_state_backup_migrate_legacy(
  app_handle: tauri::AppHandle, archive_path: String, confirm_local_migration: bool,
) -> Result<BackupStatus, String> {
  let _op = OPERATION_LOCK.lock().await;
  let revision = session_revision();
  platform_supported()?;
  if !confirm_local_migration { return Err("Review and confirm migration of the original encrypted archive first.".into()); }
  let mut state = initialized()?;
  let old_owner = state.owner_account_id.as_deref().ok_or("No original backup identity is recorded on this device.")?.to_string();
  let account = account_for(&access_token(&app_handle).await?).await?;
  require_account_recovery(&account)?;
  if account.epoch != 0 || account.revision != 0 || account.latest_snapshot_id.is_some() || account.device_id.is_some() {
    return Err("Local historical migration requires an empty verified recovery namespace. Existing backups will not be merged.".into());
  }
  // Original key stays in the OS credential store. Neither the old key nor
  // decrypted historical files are sent to the server or exposed through IPC.
  let original_key = read_key(&old_owner, &state.device_id)?;
  let metadata = fs::symlink_metadata(&archive_path).map_err(|_| "Original encrypted archive is unavailable")?;
  if !metadata.is_file() || metadata.file_type().is_symlink() || metadata.len() > MAX_ENVELOPE as u64 {
    return Err("Select a regular original encrypted archive no larger than 16 MiB.".into());
  }
  let mut bytes = Vec::new();
  fs::File::open(&archive_path).map_err(|_| "Original encrypted archive is unavailable")?
    .take((MAX_ENVELOPE+1) as u64).read_to_end(&mut bytes).map_err(|_| "Cannot read original encrypted archive")?;
  if bytes.len() > MAX_ENVELOPE { return Err("Original archive exceeds the size limit.".into()); }
  let snapshot = decode_legacy_archive(&bytes, &original_key, &old_owner, &account.account_id)?;
  unchanged(revision)?;
  identity::authorize(&app_handle,&identity::provider()?,"backup-key-enroll",&state,Some(&account)).await?;
  let managed = managed_key(&access_token(&app_handle).await?,&account,&state,"ensure",None).await?;
  unchanged(revision)?;
  let destination = state.brain_root.parent().ok_or("GBrain has no parent directory")?
    .join(format!("gbrain-migrated-{}",uuid::Uuid::new_v4()));
  let warnings = {
    let _store = STORE_WRITE_LOCK.lock().map_err(|_| "Authoritative state is busy")?;
    let report = knapsack_state_backup::restore_new(&snapshot,&destination,timestamp()/1000,Limits::default()).map_err(|e|e.to_string())?;
    if !report.durable { return Err("Migration was staged but durability was not verified. Original GBrain remains active.".into()); }
    report.warnings
  };
  current_account(&app_handle,&account.account_id).await?;
  unchanged(revision)?;
  state.brain_root = destination;
  state.owner_account_id = Some(account.account_id);
  state.recovery_mode = Some(ACCOUNT_RECOVERY_MODE.into());
  state.key_version = Some(managed.version);
  state.epoch = 0; state.revision = 0; state.enabled = false; state.automatic = false;
  state.last_backup_at = None; state.last_snapshot_id = None; state.last_content_sha256 = None;
  state.last_error = None; state.warnings = warnings;
  commit_session(&state,revision)?;
  clear_pending();
  // Preserve the original root, archive and old OS key for historical recovery.
  // Migration never enables/upload backups or imports approvals/live execution.
  Ok(state.into())
}
async fn current_account(app: &tauri::AppHandle, expected: &str) -> Result<String, String> {
  let token = access_token(app).await?;
  if account_for(&token).await?.account_id != expected {
    return Err("Signed-in account changed. Backup is paused.".into());
  }
  Ok(token)
}
fn owned(s: &LocalState, a: &AccountState) -> Result<(), String> {
  if s
    .owner_account_id
    .as_deref()
    .is_some_and(|id| id != a.account_id)
  {
    return Err("This GBrain belongs to another Knapsack account. No data was uploaded.".into());
  }
  Ok(())
}
fn gate(s: &LocalState, a: &AccountState) -> Result<(), String> {
  owned(s, a)?;
  if !s.enabled || s.owner_account_id.as_deref() != Some(a.account_id.as_str()) {
    return Err("Enable backup for this account first".into());
  }
  if !a.enabled || a.device_id.as_deref() != Some(s.device_id.as_str()) || a.epoch != s.epoch {
    return Err("This computer is no longer the authoritative backup device. Restore or review account status.".into());
  }
  Ok(())
}

// Explicit native backends only. Never use keyring's in-memory mock fallback in production.
#[cfg(any(target_os = "macos", target_os = "windows", target_os = "linux"))]
fn key_entry(account: &str, device: &str) -> Result<keyring::Entry, String> {
  keyring::Entry::new(KEY_SERVICE, &format!("{account}:{device}")).map_err(|_| {
    "OS credential store unavailable. Use manual backup or unlock your keychain.".into()
  })
}
fn store_key(account: &str, device: &str, key: &str) -> Result<(), String> {
  #[cfg(any(target_os = "macos", target_os = "windows", target_os = "linux"))]
  {
    key_entry(account, device)?
      .set_password(key)
      .map_err(|_| "Could not save recovery key in the OS credential store")?;
    if key_entry(account, device)?
      .get_password()
      .map_err(|_| "Could not verify saved recovery key")?
      != key
    {
      return Err("OS credential store verification failed".into());
    }
    return Ok(());
  }
  #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
  {
    let _ = (account, device, key);
    Err("Automatic backup is unsupported on this platform".into())
  }
}
fn read_key(account: &str, device: &str) -> Result<RecoveryKey, String> {
  #[cfg(any(target_os = "macos", target_os = "windows", target_os = "linux"))]
  {
    let raw =
      zeroize::Zeroizing::new(key_entry(account, device)?.get_password().map_err(|_| {
        "Automatic backup paused: OS credential store is locked or key is unavailable"
      })?);
    return RecoveryKey::from_hex(raw.trim()).map_err(|e| e.to_string());
  }
  #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
  {
    let _ = (account, device);
    Err("Automatic backup unsupported".into())
  }
}
fn clear_key(s: &LocalState) {
  // Historical keys are the sole recovery authority; retain them on sign-out/disable.
  if s.recovery_mode.as_deref() != Some(ACCOUNT_RECOVERY_MODE) { return; }
  #[cfg(any(target_os = "macos", target_os = "windows", target_os = "linux"))]
  {
    if let Some(account) = &s.owner_account_id {
      if let Ok(entry) = key_entry(account, &s.device_id) {
        let _ = entry.delete_credential();
      }
    }
  }
}
async fn download(token: &str, id: Option<&str>) -> Result<Vec<u8>, String> {
  let suffix = if let Some(id) = id {
    uuid::Uuid::parse_str(id).map_err(|_| "Invalid snapshot ID")?;
    format!("/snapshots/{id}")
  } else {
    "/snapshots/latest".into()
  };
  let r = identity::send(api_client()?.get(api_url(&suffix)?).bearer_auth(token)).await?;
  let mut r = checked(r).await?;
  if r
    .content_length()
    .is_some_and(|size| size > MAX_ENVELOPE as u64)
  {
    return Err("Backup exceeds size limit".into());
  }
  let mut out = Vec::new();
  while let Some(chunk) = r
    .chunk()
    .await
    .map_err(|_| "Backup download was interrupted")?
  {
    if out.len() + chunk.len() > MAX_ENVELOPE {
      return Err("Backup exceeds size limit".into());
    }
    out.extend_from_slice(&chunk);
  }
  Ok(out)
}
#[derive(Deserialize)]
struct ManagedKeyReply {
  account_id: String,
  recovery_mode: String,
  key_id: String,
  key_version: String,
  data_key_b64: String,
}
impl Drop for ManagedKeyReply {
  fn drop(&mut self) {
    self.data_key_b64.zeroize();
  }
}
struct ManagedKey {
  key: RecoveryKey,
  version: String,
}
fn require_account_recovery(account: &AccountState) -> Result<(), String> {
  if !account.account_recovery_available {
    return Err(match account.account_recovery_unavailable_reason.as_deref() {
      Some("kms_not_configured") => "Account recovery is unavailable: Knapsack's protected key service has not been configured.",
      Some("legacy_private_key_migration_required") => "This account has legacy private-key backups. A reviewed migration is required before account recovery can be enabled.",
      _ => "Account recovery is unavailable: verified account identity and recent Google/Microsoft authentication must be integrated on this server.",
    }.into());
  }
  if account.latest_snapshot_id.is_some() && account.recovery_mode != ACCOUNT_RECOVERY_MODE {
    return Err(
      "Legacy private-key backups cannot be silently converted to account recovery".into(),
    );
  }
  Ok(())
}
fn decode_managed_key(
  reply: &ManagedKeyReply,
  expected_account: &str,
  expected_version: Option<&str>,
) -> Result<ManagedKey, String> {
  if reply.account_id != expected_account
    || reply.recovery_mode != ACCOUNT_RECOVERY_MODE
    || expected_version.is_some_and(|version| version != reply.key_version)
    || uuid::Uuid::parse_str(&reply.key_id).is_err()
    || uuid::Uuid::parse_str(&reply.key_version).is_err()
  {
    return Err("Account recovery returned an unexpected key identity".into());
  }
  let bytes = zeroize::Zeroizing::new(
    base64::engine::general_purpose::STANDARD
      .decode(&reply.data_key_b64)
      .map_err(|_| "Invalid protected account key response")?,
  );
  if bytes.len() != 32 {
    return Err("Invalid protected account key length".into());
  }
  let hex = zeroize::Zeroizing::new(bytes.iter().map(|b| format!("{b:02x}")).collect::<String>());
  let key = RecoveryKey::from_hex(&hex).map_err(|_| "Invalid protected account key")?;
  Ok(ManagedKey {
    key,
    version: reply.key_version.clone(),
  })
}
async fn managed_key(
  token: &str,
  account: &AccountState,
  state: &LocalState,
  operation: &str,
  version: Option<&str>,
) -> Result<ManagedKey, String> {
  require_account_recovery(account)?;
  let body = if operation == "ensure" {
    serde_json::json!({"operation":"ensure","recovery_mode":ACCOUNT_RECOVERY_MODE,"device_id":state.device_id,"expected_epoch":account.epoch})
  } else {
    serde_json::json!({"operation":"recover","recovery_mode":ACCOUNT_RECOVERY_MODE,"device_id":state.device_id,"key_version":version.ok_or("Account backup has no managed key version")?})
  };
  let request = api_client()?
    .post(api_url("/key")?)
    .bearer_auth(token)
    .json(&body);
  let response = identity::send(request).await?;
  if response.status() == reqwest::StatusCode::UNAUTHORIZED
    || response.status() == reqwest::StatusCode::FORBIDDEN
  {
    return Err("Account recovery requires verified, recent Google/Microsoft sign-in for this Knapsack account and device.".into());
  }
  if response.status() == reqwest::StatusCode::SERVICE_UNAVAILABLE {
    return Err("Protected account recovery is not configured or is temporarily unavailable. No fallback key was created.".into());
  }
  let mut response = checked(response).await?;
  // Bound and zeroize the sensitive response body. Never return this reply through IPC.
  if response.content_length().is_some_and(|n| n > 4096) {
    return Err("Invalid protected account key response".into());
  }
  let mut bytes = zeroize::Zeroizing::new(Vec::new());
  while let Some(chunk) = response
    .chunk()
    .await
    .map_err(|_| "Account key response interrupted")?
  {
    if bytes.len() + chunk.len() > 4096 {
      return Err("Invalid protected account key response".into());
    }
    bytes.extend_from_slice(&chunk);
  }
  let reply: ManagedKeyReply =
    serde_json::from_slice(&bytes).map_err(|_| "Invalid protected account key response")?;
  decode_managed_key(&reply, &account.account_id, version)
}

async fn claim(
  token: &str,
  s: &LocalState,
  epoch: u64,
  revision: u64,
  takeover: bool,
) -> Result<AccountState, String> {
  let r = identity::send(api_client()?.post(api_url("/authority")?).bearer_auth(token)
    .json(&serde_json::json!({"device_id":s.device_id,"expected_epoch":epoch,"expected_revision":revision,"takeover":takeover,"enable_backup":true}))).await?;
  checked(r)
    .await?
    .json()
    .await
    .map_err(|_| "Invalid backup authority response".into())
}
#[tauri::command]
pub async fn kn_state_backup_enable(
  app_handle: tauri::AppHandle,
  confirm_account_recovery: bool,
  automatic: bool,
  expected_epoch: u64,
  takeover: bool,
) -> Result<BackupStatus, String> {
  let _op = OPERATION_LOCK.lock().await;
  let session = session_revision();
  platform_supported()?;
  if !confirm_account_recovery {
    return Err("Confirm that Knapsack can recover your encrypted backup through your verified account before enabling it".into());
  }
  if takeover {
    return Err("Restore the existing account backup to replace its authoritative device".into());
  }
  let mut s = initialized()?;
  let token = access_token(&app_handle).await?;
  let account = account_for(&token).await?;
  owned(&s, &account)?;
  if account.epoch != expected_epoch {
    return Err("Account state changed. Check account again.".into());
  }
  if account
    .device_id
    .as_deref()
    .is_some_and(|id| id != s.device_id)
  {
    return Err("Restore the existing backup before replacing its authoritative device".into());
  }
  require_account_recovery(&account)?;
  identity::authorize(&app_handle, &identity::provider()?, "backup-key-enroll", &s, Some(&account)).await?;
  unchanged(session)?;
  let managed = managed_key(
    &token,
    &account,
    &s,
    "ensure",
    account.key_version.as_deref(),
  )
  .await?;
  unchanged(session)?;
  let key = managed.key;
  if account.latest_snapshot_id.is_some() {
    let bytes = download(&token, None).await?;
    knapsack_state_backup::open(&bytes, &key, &account.account_id, Limits::default())
      .map_err(|e| e.to_string())?;
  }
  if automatic {
    let _config = CONFIG_LOCK.lock().map_err(|_| "State settings are busy")?;
    unchanged(session)?;
    store_key(&account.account_id, &s.device_id, &key.to_hex())?;
  }
  let token = current_account(&app_handle, &account.account_id).await?;
  unchanged(session)?;
  let authority = claim(&token, &s, expected_epoch, account.revision, false).await?;
  unchanged(session)?;
  if authority.account_id != account.account_id
    || !authority.enabled
    || authority.device_id.as_deref() != Some(s.device_id.as_str())
    || authority.revision != account.revision
    || authority.recovery_mode != ACCOUNT_RECOVERY_MODE
    || authority.key_version.as_deref() != Some(managed.version.as_str())
  {
    return Err("Invalid backup authority response".into());
  }
  s.owner_account_id = Some(account.account_id);
  s.recovery_mode = Some(ACCOUNT_RECOVERY_MODE.into());
  s.key_version = Some(managed.version);
  s.enabled = true;
  s.automatic = automatic;
  s.epoch = authority.epoch;
  s.revision = authority.revision;
  s.last_error = None;
  commit_session(&s, session)?;
  if !automatic {
    clear_key(&s);
  }
  Ok(s.into())
}

fn pending_paths() -> Result<(PathBuf, PathBuf), String> {
  Ok((
    state_dir()?.join("state-backup-pending-v1.json"),
    state_dir()?.join("state-backup-pending-v1.bin"),
  ))
}
fn clear_pending() {
  if let Ok((meta, bytes)) = pending_paths() {
    let _ = fs::remove_file(meta);
    let _ = fs::remove_file(bytes);
  }
}
async fn backup(app: &tauri::AppHandle) -> Result<BackupStatus, String> {
  platform_supported()?;
  let session = session_revision();
  let mut cancelled = CANCEL.subscribe();
  let mut s = initialized()?;
  if !s.enabled {
    return Err("Account backup is disabled".into());
  }
  let token = access_token(app).await?;
  let account = account_for(&token).await?;
  gate(&s, &account)?;
  require_account_recovery(&account)?;
  let version = s
    .key_version
    .as_deref()
    .ok_or("Review and enable account recovery before backing up")?;
  if s.recovery_mode.as_deref() != Some(ACCOUNT_RECOVERY_MODE)
    || account.key_version.as_deref() != Some(version)
  {
    return Err("Account recovery key version changed. Review and enable backup again.".into());
  }
  let key = if s.automatic {
    read_key(&account.account_id, &s.device_id)?
  } else {
    identity::authorize(app, &identity::provider()?, "backup-key-recover", &s, Some(&account)).await?;
    unchanged(session)?;
    managed_key(&token, &account, &s, "recover", Some(version))
      .await?
      .key
  };
  let key_version = version.to_string();
  // Existing backup validates the key even after an app restart. Never silently rotate it.
  if account.latest_snapshot_id.is_some() {
    knapsack_state_backup::open(
      &download(&token, None).await?,
      &key,
      &account.account_id,
      Limits::default(),
    )
    .map_err(|e| e.to_string())?;
  }
  let (meta_path, bytes_path) = pending_paths()?;
  let (pending, bytes): (Pending, Vec<u8>) = if meta_path.exists() {
    let pending: Pending =
      serde_json::from_slice(&fs::read(&meta_path).map_err(|_| "Cannot read pending backup")?)
        .map_err(|_| "Invalid pending backup metadata")?;
    if pending.account_id != account.account_id
      || pending.device_id != s.device_id
      || pending.epoch != s.epoch
      || pending.recovery_mode != ACCOUNT_RECOVERY_MODE
      || pending.key_version != key_version
    {
      return Err(
        "Pending backup belongs to a different authority; disable backup before reconfiguration"
          .into(),
      );
    }
    if fs::metadata(&bytes_path)
      .map_err(|_| "Pending backup unavailable")?
      .len()
      > MAX_ENVELOPE as u64
    {
      return Err("Pending backup exceeds size limit".into());
    }
    let bytes = fs::read(&bytes_path).map_err(|_| "Pending backup data unavailable")?;
    if bytes.len() > MAX_ENVELOPE || digest(&bytes) != pending.envelope_sha256 {
      return Err("Pending encrypted backup is damaged".into());
    }
    let verified =
      knapsack_state_backup::open(&bytes, &key, &account.account_id, Limits::default())
        .map_err(|e| e.to_string())?;
    s.warnings = verified.warnings().to_vec();
    (pending, bytes)
  } else {
    let snapshot = {
      let _store = STORE_WRITE_LOCK
        .lock()
        .map_err(|_| "Authoritative state is busy")?;
      knapsack_state_backup::snapshot(&s.brain_root, Limits::default())
        .map_err(|e| e.to_string())?
    };
    s.warnings = snapshot.warnings().to_vec();
    let content_hash = snapshot.content_sha256();
    if s.last_content_sha256.as_deref() == Some(content_hash.as_str())
      && s.revision == account.revision
    {
      unchanged(session)?;
      s.last_error = None;
      commit_session(&s, session)?;
      return Ok(s.into());
    }
    let bytes = knapsack_state_backup::seal(&snapshot, &key, &account.account_id)
      .map_err(|e| e.to_string())?;
    if bytes.len() > MAX_ENVELOPE {
      return Err("Encrypted backup exceeds size limit".into());
    }
    let p = Pending {
      account_id: account.account_id.clone(),
      device_id: s.device_id.clone(),
      epoch: s.epoch,
      revision: account.revision,
      snapshot_id: uuid::Uuid::new_v4().to_string(),
      content_sha256: content_hash,
      envelope_sha256: digest(&bytes),
      recovery_mode: ACCOUNT_RECOVERY_MODE.into(),
      key_version: key_version.clone(),
    };
    atomic_write(&bytes_path, &bytes)?;
    atomic_write(
      &meta_path,
      &serde_json::to_vec(&p).map_err(|e| e.to_string())?,
    )?;
    (p, bytes)
  };
  // Consent and the current signed-in account are rechecked immediately before egress.
  let latest = load()?;
  gate(&latest, &account)?;
  let token = current_account(app, &account.account_id).await?;
  unchanged(session)?;
  let size = bytes.len();
  let request = api_client()?
    .post(api_url("/snapshots")?)
    .bearer_auth(token)
    .header("Content-Type", "application/octet-stream")
    .header("X-Backup-Device", &pending.device_id)
    .header("X-Backup-Epoch", pending.epoch)
    .header("X-Backup-Revision", pending.revision)
    .header("X-Backup-Snapshot", &pending.snapshot_id)
    .header("X-Backup-Recovery-Mode", &pending.recovery_mode)
    .header("X-Backup-Key-Version", &pending.key_version)
    .body(bytes);
  let response = tokio::select! {
    response = identity::send(request) => response?,
    _ = cancelled.changed() => return Err("Account or backup consent changed. Upload cancelled.".into()),
  };
  unchanged(session)?;
  let receipt: Receipt = checked(response)
    .await?
    .json()
    .await
    .map_err(|_| "Invalid backup receipt; retry will verify the same snapshot")?;
  if receipt.account_id != pending.account_id
    || receipt.snapshot_id != pending.snapshot_id
    || receipt.epoch != pending.epoch
    || receipt.revision != pending.revision + 1
    || receipt.sha256 != pending.envelope_sha256
    || receipt.size_bytes != size
    || receipt.recovery_mode != pending.recovery_mode
    || receipt.key_version.as_deref() != Some(pending.key_version.as_str())
  {
    return Err("Backup receipt did not match the encrypted snapshot".into());
  }
  unchanged(session)?;
  s.revision = receipt.revision;
  s.last_backup_at = Some(timestamp());
  s.last_snapshot_id = Some(receipt.snapshot_id);
  s.last_content_sha256 = Some(pending.content_sha256);
  s.last_error = None;
  commit_session(&s, session)?;
  clear_pending();
  Ok(s.into())
}
fn record_error(error: &str) {
  let Ok(_config) = CONFIG_LOCK.lock() else {
    return;
  };
  if let Ok(mut s) = load() {
    s.last_error = Some(error.into());
    let _ = save_unlocked(&s);
  }
}
#[tauri::command]
pub async fn kn_state_backup_now(app_handle: tauri::AppHandle) -> Result<BackupStatus, String> {
  let _op = OPERATION_LOCK.lock().await;
  let result = backup(&app_handle).await;
  if let Err(e) = &result {
    record_error(e);
  }
  result
}
#[tauri::command]
pub async fn kn_state_backup_disable(app_handle: tauri::AppHandle) -> Result<BackupStatus, String> {
  cancel_active();
  let _op = OPERATION_LOCK.lock().await;
  let session = session_revision();
  let mut s = initialized()?;
  // Stop local scheduling first, including when offline/signed out. Never re-enable after errors.
  s.enabled = false;
  s.automatic = false;
  commit_session(&s, session)?;
  clear_key(&s);
  clear_pending();
  let result = async {
    let token = access_token(&app_handle).await?;
    let account = account_for(&token).await?;
    owned(&s, &account)?;
    if account.device_id.as_deref() != Some(s.device_id.as_str()) {
      return Ok::<(), String>(());
    }
    let request = api_client()?
      .post(api_url("/disable")?)
      .bearer_auth(token)
      .json(&serde_json::json!({"device_id":s.device_id,"expected_epoch":account.epoch}));
    let response = identity::send(request).await?;
    checked(response).await?;
    Ok(())
  }
  .await;
  let _config = CONFIG_LOCK.lock().map_err(|_| "State settings are busy")?;
  let mut latest = load()?;
  latest.last_error = result.err();
  save_unlocked(&latest)?;
  Ok(latest.into())
}
#[tauri::command]
pub async fn kn_state_backup_restore(
  app_handle: tauri::AppHandle,
  snapshot_id: Option<String>,
  confirm_replace: bool,
  expected_epoch: u64,
  expected_revision: Option<u64>,
  expected_source_device: Option<String>,
) -> Result<BackupStatus, String> {
  let session = session_revision();
  let _op = OPERATION_LOCK.lock().await;
  unchanged(session)?;
  platform_supported()?;
  if !confirm_replace {
    return Err("Confirm replacement-device restore first".into());
  }
  let mut s = initialized()?;
  let token = access_token(&app_handle).await?;
  let account = account_for(&token).await?;
  owned(&s, &account)?;
  if account.epoch != expected_epoch {
    return Err("Account authority changed. Check account again.".into());
  }
  devices::review_checkpoint(&account, expected_revision, expected_source_device.as_deref())?;
  if snapshot_id
    .as_deref()
    .is_some_and(|id| Some(id) != account.latest_snapshot_id.as_deref())
  {
    return Err("A newer account backup exists. Check account again before restoring.".into());
  }
  require_account_recovery(&account)?;
  identity::authorize(&app_handle, &identity::provider()?, "backup-restore", &s, Some(&account)).await?;
  unchanged(session)?;
  let managed = managed_key(
    &token,
    &account,
    &s,
    "recover",
    account.key_version.as_deref(),
  )
  .await?;
  unchanged(session)?;
  let snapshot = knapsack_state_backup::open(
    &download(&token, snapshot_id.as_deref()).await?,
    &managed.key,
    &account.account_id,
    Limits::default(),
  )
  .map_err(|e| e.to_string())?;
  let destination = s
    .brain_root
    .parent()
    .ok_or("GBrain has no parent directory")?
    .join(format!("gbrain-restored-{}", uuid::Uuid::new_v4()));
  // The old root remains intact. Restored records are inert and all live approvals are removed.
  let restore_warnings = {
    let _store = STORE_WRITE_LOCK
      .lock()
      .map_err(|_| "Authoritative state is busy")?;
    let report = knapsack_state_backup::restore_new(
      &snapshot,
      &destination,
      timestamp() / 1000,
      Limits::default(),
    )
    .map_err(|e| e.to_string())?;
    if !report.durable {
      return Err("Restore was staged but disk durability could not be verified. Existing GBrain remains authoritative.".into());
    }
    report.warnings
  };
  let token = current_account(&app_handle, &account.account_id).await?;
  unchanged(session)?;
  let authority = claim(&token, &s, expected_epoch, account.revision, true).await?;
  unchanged(session)?;
  if authority.account_id != account.account_id
    || !authority.enabled
    || authority.device_id.as_deref() != Some(s.device_id.as_str())
    || authority.revision != account.revision
    || authority.recovery_mode != ACCOUNT_RECOVERY_MODE
    || authority.key_version.as_deref() != Some(managed.version.as_str())
  {
    return Err("Restore staged, but authority transfer was not verified".into());
  }
  {
    let _store = STORE_WRITE_LOCK
      .lock()
      .map_err(|_| "Authoritative state is busy")?;
    clear_key(&s);
    s.brain_root = destination;
    s.warnings = restore_warnings;
    s.owner_account_id = Some(account.account_id);
    s.recovery_mode = Some(ACCOUNT_RECOVERY_MODE.into());
    s.key_version = Some(managed.version);
    s.epoch = authority.epoch;
    s.revision = authority.revision;
    // Restore never imports/re-enables consent or unattended execution. User enables backup separately.
    s.enabled = false;
    s.automatic = false;
    s.last_backup_at = None;
    s.last_snapshot_id = authority.latest_snapshot_id;
    s.last_content_sha256 = None;
    s.last_error = None;
    commit_session(&s, session)?;
    clear_pending();
  }
  Ok(s.into())
}
/// Run only while the app is running. No credentials, keychain calls or network access before opt-in.
pub fn spawn(app: tauri::AppHandle) {
  tauri::async_runtime::spawn(async move {
    let mut delay = Duration::from_secs(60);
    loop {
      tokio::time::sleep(delay).await;
      let Ok(s) = load() else { continue };
      if !s.enabled || !s.automatic {
        delay = Duration::from_secs(60);
        continue;
      }
      let Ok(_op) = OPERATION_LOCK.try_lock() else {
        continue;
      };
      match backup(&app).await {
        Ok(_) => delay = Duration::from_secs(15 * 60),
        Err(e) => {
          record_error(&e);
          delay = (delay * 2).min(Duration::from_secs(60 * 60));
        }
      }
    }
  });
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn historical_migration_requires_original_key_and_exact_old_owner() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().canonicalize().unwrap();
    fs::write(path.join("memory.md"), "fixture history").unwrap();
    let snapshot = knapsack_state_backup::snapshot(&path, Limits::default()).unwrap();
    let original = RecoveryKey::from_hex(&"11".repeat(32)).unwrap();
    let other = RecoveryKey::from_hex(&"22".repeat(32)).unwrap();
    let bytes = knapsack_state_backup::seal(&snapshot,&original,"old-owner").unwrap();
    assert!(decode_legacy_archive(&bytes,&original,"old-owner","new-owner").is_ok());
    assert!(decode_legacy_archive(&bytes,&other,"old-owner","new-owner").is_err());
    assert!(decode_legacy_archive(&bytes,&original,"wrong-owner","new-owner").is_err());
    assert!(decode_legacy_archive(&bytes,&original,"old-owner","old-owner").is_err());
    assert!(decode_legacy_archive(&bytes,&original,"old-owner","unbound").is_err());
  }
  fn local() -> LocalState {
    LocalState {
      schema_version: 1,
      brain_root: PathBuf::from("/brain"),
      owner_account_id: Some("account-a".into()),
      device_id: "device-a".into(),
      enabled: true,
      automatic: false,
      epoch: 7,
      revision: 3,
      last_backup_at: None,
      last_snapshot_id: None,
      last_content_sha256: None,
      last_error: None,
      warnings: Vec::new(),
      recovery_mode: None,
      key_version: None,
    }
  }
  fn account() -> AccountState {
    AccountState {
      account_id: "account-a".into(),
      enabled: true,
      device_id: Some("device-a".into()),
      epoch: 7,
      revision: 3,
      latest_snapshot_id: None,
      recovery_mode: ACCOUNT_RECOVERY_MODE.into(),
      key_version: Some("123e4567-e89b-12d3-a456-426614174000".into()),
      account_recovery_available: true,
      account_recovery_unavailable_reason: None,
    }
  }
  fn key_reply() -> ManagedKeyReply {
    ManagedKeyReply {
      account_id: "account-a".into(),
      recovery_mode: ACCOUNT_RECOVERY_MODE.into(),
      key_id: "123e4567-e89b-12d3-a456-426614174001".into(),
      key_version: "123e4567-e89b-12d3-a456-426614174000".into(),
      data_key_b64: base64::engine::general_purpose::STANDARD.encode([7u8; 32]),
    }
  }
  #[test]
  fn managed_key_reply_binds_account_mode_identity_and_version() {
    let reply = key_reply();
    assert!(decode_managed_key(&reply, "account-a", Some(&reply.key_version)).is_ok());
    assert!(decode_managed_key(&reply, "account-b", None).is_err());
    assert!(decode_managed_key(&reply, "account-a", Some("other-version")).is_err());
    let mut reply = key_reply();
    reply.recovery_mode = "private_key_v1".into();
    assert!(decode_managed_key(&reply, "account-a", None).is_err());
    let mut reply = key_reply();
    reply.key_id = "not-an-opaque-uuid".into();
    assert!(decode_managed_key(&reply, "account-a", None).is_err());
  }
  #[test]
  fn managed_key_reply_rejects_invalid_encoded_keys() {
    let mut reply = key_reply();
    reply.data_key_b64 = "not-base64".into();
    assert!(decode_managed_key(&reply, "account-a", None).is_err());
    reply.data_key_b64 = base64::engine::general_purpose::STANDARD.encode([7u8; 31]);
    assert!(decode_managed_key(&reply, "account-a", None).is_err());
  }
  #[test]
  fn unavailable_managed_recovery_and_legacy_snapshots_fail_closed() {
    let mut a = account();
    a.account_recovery_available = false;
    for reason in [
      "kms_not_configured",
      "provider_reauthentication_unavailable",
      "immutable_account_auth_unavailable",
    ] {
      a.account_recovery_unavailable_reason = Some(reason.into());
      assert!(require_account_recovery(&a).is_err());
    }
    let mut a = account();
    a.latest_snapshot_id = Some("existing".into());
    a.recovery_mode = "private_key_v1".into();
    assert!(require_account_recovery(&a).is_err());
  }
  #[test]
  fn account_capability_absence_never_enables_recovery() {
    let legacy = serde_json::json!({"account_id":"account-a","enabled":false,"device_id":null,"epoch":0,"revision":0,"latest_snapshot_id":null});
    let a: AccountState = serde_json::from_value(legacy).unwrap();
    assert!(!a.account_recovery_available);
    assert!(require_account_recovery(&a).is_err());
  }
  #[test]
  fn account_switch_cannot_upload_owned_brain() {
    let mut a = account();
    a.account_id = "account-b".into();
    assert!(gate(&local(), &a).is_err());
  }
  #[test]
  fn consent_is_required_on_both_sides() {
    let mut s = local();
    s.enabled = false;
    assert!(gate(&s, &account()).is_err());
    let mut a = account();
    a.enabled = false;
    assert!(gate(&local(), &a).is_err());
    let mut s = local();
    s.owner_account_id = None;
    assert!(gate(&s, &account()).is_err());
  }
  #[test]
  fn stale_device_and_epoch_are_fenced() {
    let mut a = account();
    a.device_id = Some("other-device".into());
    assert!(gate(&local(), &a).is_err());
    a = account();
    a.epoch += 1;
    assert!(gate(&local(), &a).is_err());
  }
  #[test]
  fn local_settings_never_serialize_keys_or_credentials() {
    let text = serde_json::to_string(&local()).unwrap();
    for secret in ["recoveryKey", "access_token", "refresh_token", "password"] {
      assert!(!text.contains(secret));
    }
  }
  #[test]
  fn old_local_descriptors_default_to_no_review_warnings() {
    let mut value = serde_json::to_value(local()).unwrap();
    value.as_object_mut().unwrap().remove("warnings");
    let restored: LocalState = serde_json::from_value(value).unwrap();
    assert!(restored.warnings.is_empty());
  }
  #[test]
  fn cancellation_invalidates_an_inflight_operation() {
    let prior = session_revision();
    cancel_active();
    assert!(unchanged(prior).is_err());
  }
  #[test]
  fn status_has_no_live_approvals_or_hidden_credentials() {
    let status = serde_json::to_value(BackupStatus::from(local())).unwrap();
    assert_eq!(status["schemaVersion"], 1);
    assert!(status.get("epoch").is_none());
    assert!(status.get("recoveryKey").is_none());
  }
  #[test]
  fn stale_consent_commit_cannot_undo_cancellation() {
    let mut s = initialized().unwrap();
    s.enabled = true;
    let old_session = session_revision();
    {
      let _config = CONFIG_LOCK.lock().unwrap();
      cancel_active();
      let mut disabled = s.clone();
      disabled.enabled = false;
      save_unlocked(&disabled).unwrap();
    }
    assert!(commit_session(&s, old_session).is_err());
    assert!(!load().unwrap().enabled);
  }
  #[test]
  fn generation_switch_rejects_retired_writer_target() {
    let first = tempfile::Builder::new().tempdir_in(std::env::temp_dir().canonicalize().unwrap()).unwrap();
    let second = tempfile::Builder::new().tempdir_in(std::env::temp_dir().canonicalize().unwrap()).unwrap();
    test_adopt_root(first.path());
    let pinned = resolve_root("")
      .unwrap()
      .join(".knapsack/follow-through-v1.json");
    test_adopt_root(second.path());
    assert!(check_write_target(&pinned).is_err());
    assert_eq!(resolve_root("").unwrap(), second.path());
  }
  #[test]
  fn atomic_writes_are_complete_and_private() {
    let dir = tempfile::Builder::new().tempdir_in(std::env::temp_dir().canonicalize().unwrap()).unwrap();
    let path = dir.path().join("state.json");
    atomic_write(&path, b"first").unwrap();
    atomic_write(&path, b"second").unwrap();
    assert_eq!(fs::read(&path).unwrap(), b"second");
    #[cfg(unix)]
    {
      use std::os::unix::fs::PermissionsExt;
      assert_eq!(
        fs::metadata(&path).unwrap().permissions().mode() & 0o777,
        0o600
      );
    }
    assert_eq!(fs::read_dir(dir.path()).unwrap().count(), 1);
  }
  #[cfg(unix)]
  #[test]
  fn atomic_write_rejects_symlink_ancestors_and_files() {
    let dir = tempfile::Builder::new().tempdir_in(std::env::temp_dir().canonicalize().unwrap()).unwrap();
    let target = dir.path().join("target");
    fs::create_dir(&target).unwrap();
    let link = dir.path().join("alias");
    std::os::unix::fs::symlink(&target, &link).unwrap();
    assert!(atomic_write(&link.join("data"), b"blocked").is_err());
    assert!(!target.join("data").exists());
  }
}

#[cfg(test)]
pub(crate) fn test_adopt_root(root: &Path) {
  let mut s = initialized().unwrap();
  s.brain_root = root.into();
  s.owner_account_id = Some("test-account".into());
  let _config = CONFIG_LOCK.lock().unwrap();
  save_unlocked(&s).unwrap();
}
