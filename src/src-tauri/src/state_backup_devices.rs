//! Account discovery delegates continuation to the existing reviewed restore path.
use super::*;

#[derive(Deserialize, Serialize)]
pub struct AccountDevice {
  device_id: String,
  name: String,
  #[serde(default)]
  revoked: bool,
  platform: String,
  last_seen: u64,
  recently_seen: bool,
  is_writer: bool,
}
#[derive(Deserialize, Serialize)]
pub struct Checkpoint {
  snapshot_id: String,
  source_device_id: String,
  revision: u64,
  epoch: u64,
  created_at: String,
}
#[derive(Deserialize, Serialize)]
pub struct DeviceDirectory {
  account_id: String,
  state: AccountState,
  devices: Vec<AccountDevice>,
  checkpoint: Option<Checkpoint>,
  remote_execution_available: bool,
  continuous_sync_available: bool,
  server_time: u64,
  account: Option<AccountState>,
  current_device_id: Option<String>,
}

async fn read_directory(response: reqwest::Response) -> Result<DeviceDirectory, String> {
  let mut response = checked(response).await?;
  let mut bytes = Vec::new();
  while let Some(chunk) = response.chunk().await.map_err(|_| "Device directory interrupted")? {
    if bytes.len() + chunk.len() > 32768 { return Err("Device directory response is too large".into()); }
    bytes.extend_from_slice(&chunk);
  }
  serde_json::from_slice(&bytes).map_err(|_| "Invalid device directory response".into())
}

fn validate_directory(directory: &DeviceDirectory, account: &AccountState) -> Result<(), String> {
  if directory.account_id != account.account_id || directory.state.account_id != account.account_id
    || directory.state.epoch != account.epoch || directory.state.revision != account.revision
    || directory.state.latest_snapshot_id != account.latest_snapshot_id
    || directory.state.device_id != account.device_id || directory.devices.len() > 20
    || directory.remote_execution_available || directory.continuous_sync_available {
    return Err("Account state changed or unsupported capabilities were reported. Refresh devices.".into());
  }
  Ok(())
}

async fn directory(app: &tauri::AppHandle, name: Option<String>) -> Result<DeviceDirectory, String> {
  let revision = session_revision();
  let _operation = OPERATION_LOCK.lock().await;
  unchanged(revision)?;
  let local = initialized()?;
  let token = access_token(app).await?;
  let account = account_for(&token).await?;
  if account.account_id == "unbound" { return Err("Verify your Google or Microsoft recovery identity before checking account devices.".into()); }
  let mut builder = api_client()?.get(api_url("/devices")?).bearer_auth(&token);
  if let Some(name) = name {
    if name.trim() != name || name.is_empty() || name.chars().count() > 64 || name.chars().any(|c| c.is_control()) {
      return Err("Use a readable computer name of up to 64 characters.".into());
    }
    builder = api_client()?.post(api_url("/devices")?).bearer_auth(&token)
      .json(&serde_json::json!({"device_id":local.device_id,"name":name,"platform":std::env::consts::OS}));
  }
  unchanged(revision)?;
  let mut result = read_directory(identity::send(builder).await?).await?;
  unchanged(revision)?;
  validate_directory(&result, &account)?;
  // Refresh presence only for an explicitly enrolled computer, never enroll on a read.
  if result.devices.iter().any(|d| d.device_id == local.device_id) {
    let request = api_client()?.post(api_url("/devices/heartbeat")?).bearer_auth(&token)
      .json(&serde_json::json!({"device_id":local.device_id}));
    result = read_directory(identity::send(request).await?).await?;
    unchanged(revision)?;
    validate_directory(&result, &account)?;
  }
  result.account = Some(account);
  result.current_device_id = Some(local.device_id);
  Ok(result)
}

#[tauri::command]
pub async fn kn_account_devices(app_handle: tauri::AppHandle) -> Result<DeviceDirectory, String> {
  directory(&app_handle, None).await
}
#[tauri::command]
pub async fn kn_account_device_register(app_handle: tauri::AppHandle, name: String) -> Result<DeviceDirectory, String> {
  directory(&app_handle, Some(name)).await
}

pub(super) fn review_checkpoint(account: &AccountState, expected_revision: Option<u64>, expected_source: Option<&str>) -> Result<(), String> {
  if expected_revision.is_some_and(|value| value != account.revision)
    || expected_source.is_some_and(|value| account.device_id.as_deref() != Some(value)) {
    return Err("The reviewed writer or checkpoint changed. Refresh devices before continuing.".into());
  }
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn continuation_requires_the_reviewed_writer_and_checkpoint() {
    let account: AccountState = serde_json::from_value(serde_json::json!({"account_id":"1","enabled":true,"device_id":"writer-a","epoch":2,"revision":3,"latest_snapshot_id":"snapshot","recovery_mode":"account_recovery_v1","key_version":"key","account_recovery_available":true,"account_recovery_unavailable_reason":null})).unwrap();
    assert!(review_checkpoint(&account,Some(3),Some("writer-a")).is_ok());
    assert!(review_checkpoint(&account,Some(2),Some("writer-a")).is_err());
    assert!(review_checkpoint(&account,Some(3),Some("writer-b")).is_err());
    assert!(review_checkpoint(&account,None,None).is_ok());
  }
}
