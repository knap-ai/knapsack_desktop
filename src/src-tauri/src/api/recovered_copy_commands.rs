//! Desktop native commands only. No HTTP/mobile route or legacy notes writer.
use super::recovered_source::ProtocolError;
fn read_existing_db(path: &std::path::Path) -> Result<rusqlite::Connection, ProtocolError> {
  let metadata = std::fs::symlink_metadata(path).map_err(|_| ProtocolError::Unavailable)?;
  if !metadata.is_file() || metadata.file_type().is_symlink() {
    return Err(ProtocolError::Unavailable);
  }
  rusqlite::Connection::open_with_flags(
    path,
    rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX,
  )
  .map_err(|_| ProtocolError::Unavailable)
}
fn native_read_db() -> Result<rusqlite::Connection, ProtocolError> {
  if !crate::db::db::database_ready() {
    return Err(ProtocolError::Unavailable);
  }
  read_existing_db(&crate::db::db::resolve_db_path())
}
use super::recovered_copy::{self, Copy, Prepared, Receipt, Save};
fn error(e: recovered_copy::Error) -> String {
  match e {
    recovered_copy::Error::Owner => "RECOVERY_OWNER_UNVERIFIED".into(),
    recovered_copy::Error::Conflict => "RECOVERY_SOURCE_CHANGED".into(),
    _ => "RECOVERY_UNAVAILABLE".into(),
  }
}
async fn perform<T: Send + 'static>(
  job: impl FnOnce(&std::path::Path, &rusqlite::Connection) -> Result<T, recovered_copy::Error>
    + Send
    + 'static,
) -> Result<T, String> {
  tauri::async_runtime::spawn_blocking(move || {
    let home = dirs::home_dir().ok_or(recovered_copy::Error::Owner)?;
    let c = native_read_db().map_err(|_| recovered_copy::Error::Unavailable)?;
    job(&home, &c)
  })
  .await
  .map_err(|_| "RECOVERY_REQUEST_UNCONFIRMED".to_string())?
  .map_err(error)
}
#[tauri::command]
pub async fn desktop_recovered_prepare(
  thread_id: u64,
  expected_uuid: String,
  expected_email: String,
) -> Result<Prepared, String> {
  perform(move |h, c| recovered_copy::prepare(h, c, thread_id, &expected_uuid, &expected_email))
    .await
}
#[tauri::command]
pub async fn desktop_recovered_list(
  thread_id: u64,
  expected_uuid: String,
  expected_email: String,
) -> Result<Vec<Copy>, String> {
  perform(move |h, c| recovered_copy::list(h, c, thread_id, &expected_uuid, &expected_email)).await
}
#[tauri::command]
pub async fn desktop_recovered_save(input: Save) -> Result<Receipt, String> {
  perform(move |h, c| recovered_copy::save(h, c, &input)).await
}
#[tauri::command]
pub async fn desktop_recovered_restore(
  thread_id: u64,
  expected_uuid: String,
  expected_email: String,
  version: u64,
  request_id: String,
) -> Result<Receipt, String> {
  perform(move |h, c| {
    recovered_copy::restore(
      h,
      c,
      thread_id,
      &expected_uuid,
      &expected_email,
      version,
      &request_id,
    )
  })
  .await
}
