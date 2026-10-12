//! Inert release facade: no identity, keychain, migration, scheduler, cloud or transport access.
use std::{fs,io::Write,path::{Path,PathBuf},sync::Mutex};
use serde_json::{json,Value};
pub(crate) static STORE_WRITE_LOCK:Mutex<()>=Mutex::new(());
const UNAVAILABLE:&str="Computer backup and account handoff are not available in this build.";
pub(crate) fn legacy_root()->PathBuf {dirs::home_dir().unwrap_or_default().join("gbrain")}
pub(crate) fn authoritative_root()->Result<PathBuf,String>{Ok(legacy_root())}
pub(crate) fn resolve_root(requested:&str)->Result<PathBuf,String>{Ok(if requested.trim().is_empty(){legacy_root()}else{PathBuf::from(requested.trim())})}
pub(crate) fn check_write_target(_path:&Path)->Result<(),String>{Ok(())}
pub(crate) fn suspend_on_account_change(){}
pub(crate) fn spawn(_app:tauri::AppHandle){}
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
#[tauri::command]
pub fn kn_state_backup_status()->Result<Value,String>{Ok(json!({"schemaVersion":1,"brainRoot":legacy_root(),"ownerAccountId":null,"deviceId":"","enabled":false,"automatic":false,"lastBackupAt":null,"lastSnapshotId":null,"lastError":null,"warnings":[],"recoveryMode":null,"featureAvailable":false,"unavailableReason":UNAVAILABLE}))}
#[tauri::command]
pub fn kn_state_backup_cancel_identity(){}
#[tauri::command]
pub fn kn_state_backup_cancel_operation(){}
#[tauri::command]
pub async fn kn_state_backup_account()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_verify_identity()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_migrate_legacy()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_enable()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_now()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_disable()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_state_backup_restore()->Result<Value,String>{Err(UNAVAILABLE.into())}
pub(crate) mod devices {
use super::*;
#[tauri::command]
pub async fn kn_account_devices()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_account_device_register()->Result<Value,String>{Err(UNAVAILABLE.into())}
}
pub(crate) mod conversations {
use super::*;
#[tauri::command]
pub async fn kn_account_conversations()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_account_conversation_read()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_account_conversation_publish()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_account_device_revoke()->Result<Value,String>{Err(UNAVAILABLE.into())}
}
pub(crate) mod imessage {
use super::*;
pub(crate) fn setup_fenced()->bool{false}
pub(crate) async fn config_write_guard(_method:&str,_params:&Option<Value>)->Result<Option<tokio::sync::MutexGuard<'static,()>>,String>{Ok(None)}
#[tauri::command]
pub async fn kn_imessage_setup_list()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_imessage_setup_create()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_imessage_setup_readiness()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_imessage_setup_action()->Result<Value,String>{Err(UNAVAILABLE.into())}
}
pub(crate) mod imessage_delivery {
use super::*;
#[tauri::command]
pub fn kn_imessage_delivery_status()->Result<Value,String>{Ok(json!({"enabled":false,"available":false,"reason":UNAVAILABLE}))}
#[tauri::command]
pub fn kn_imessage_delivery_pause_local()->Result<(),String>{Ok(())}
#[tauri::command]
pub async fn kn_imessage_delivery_consent()->Result<Value,String>{Err(UNAVAILABLE.into())}
#[tauri::command]
pub async fn kn_imessage_delivery_tick()->Result<Value,String>{Err(UNAVAILABLE.into())}
}
#[cfg(test)] mod tests {
use super::*;
#[test] fn default_status_is_inert_and_has_no_device_identity(){let v=kn_state_backup_status().unwrap();assert_eq!(v["featureAvailable"],false);assert_eq!(v["enabled"],false);assert_eq!(v["automatic"],false);assert_eq!(v["deviceId"],"");assert!(v["ownerAccountId"].is_null());}
#[tokio::test] async fn all_consequential_actions_reject_without_side_effects(){assert!(kn_state_backup_enable().await.is_err());assert!(kn_state_backup_now().await.is_err());assert!(kn_state_backup_restore().await.is_err());assert!(kn_state_backup_verify_identity().await.is_err());assert!(devices::kn_account_device_register().await.is_err());assert!(conversations::kn_account_conversation_publish().await.is_err());assert!(imessage::kn_imessage_setup_create().await.is_err());assert!(imessage_delivery::kn_imessage_delivery_tick().await.is_err());}
}
