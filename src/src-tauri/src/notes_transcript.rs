//! Read-only, account-bound note preparation outside WebKit's loopback HTTP queue.
use std::io::Read;
use std::path::{Component, Path};

use crate::db::models::transcript::{Transcript, TranscriptWithContent};

const MAX_TRANSCRIPT_BYTES: u64 = 8 * 1024 * 1024;
const READ_ERROR: &str =
  "Could not read the saved meeting transcript. Your recording is preserved. Retry notes.";
const ACCOUNT_ERROR: &str = "Account changed before the saved transcript could be read.";

pub(crate) fn validate_profile(home: &Path, email: &str, uuid: &str) -> Result<(), String> {
  if email.trim().is_empty() || uuid.trim().is_empty() {
    return Err(ACCOUNT_ERROR.into());
  }
  let raw = std::fs::read(home.join(".knapsack/profile.dat")).map_err(|_| ACCOUNT_ERROR)?;
  let settings: serde_json::Value = serde_json::from_slice(&raw).map_err(|_| ACCOUNT_ERROR)?;
  let profile = &settings["KN_PROFILE"];
  if profile["email"]
    .as_str()
    .map(|v| v.trim().eq_ignore_ascii_case(email.trim()))
    != Some(true)
    || profile["uuid"].as_str() != Some(uuid)
  {
    return Err(ACCOUNT_ERROR.into());
  }
  Ok(())
}

fn read_bound_file(
  home: &Path,
  email: &str,
  uuid: &str,
  folder: &str,
  filename: &str,
  read: impl FnOnce(&Path) -> Result<String, String>,
) -> Result<String, String> {
  validate_profile(home, email, uuid)?;
  let mut components = Path::new(filename).components();
  if !matches!(
    (components.next(), components.next()),
    (Some(Component::Normal(_)), None)
  ) {
    return Err(READ_ERROR.into());
  }
  let root = home.join(".knapsack").join(folder);
  for path in [home.join(".knapsack"), root.clone(), root.join(filename)] {
    if std::fs::symlink_metadata(&path)
      .map_err(|_| READ_ERROR)?
      .file_type()
      .is_symlink()
    {
      return Err(READ_ERROR.into());
    }
  }
  let root = root.canonicalize().map_err(|_| READ_ERROR)?;
  let path = root.join(filename).canonicalize().map_err(|_| READ_ERROR)?;
  if !path.starts_with(&root) || !path.is_file() {
    return Err(READ_ERROR.into());
  }
  let content = read(&path)?;
  validate_profile(home, email, uuid)?;
  Ok(content)
}

fn read_bounded(path: &Path) -> Result<String, String> {
  let file = std::fs::File::open(path).map_err(|_| READ_ERROR)?;
  let mut bytes = Vec::new();
  file
    .take(MAX_TRANSCRIPT_BYTES + 1)
    .read_to_end(&mut bytes)
    .map_err(|_| READ_ERROR)?;
  if bytes.len() as u64 > MAX_TRANSCRIPT_BYTES {
    return Err(READ_ERROR.into());
  }
  String::from_utf8(bytes).map_err(|_| READ_ERROR.into())
}

#[tauri::command]
pub async fn read_saved_notes_transcript(
  thread_id: u64,
  expected_email: String,
  expected_uuid: String,
) -> Result<TranscriptWithContent, String> {
  let home = dirs::home_dir().ok_or(READ_ERROR)?;
  let worker_home = home.clone();
  let email = expected_email.clone();
  let uuid = expected_uuid.clone();
  let (transcript, content) = tauri::async_runtime::spawn_blocking(move || {
    validate_profile(&worker_home, &email, &uuid)?;
    let transcript = Transcript::find_by_thread_id(thread_id)
      .map_err(|_| READ_ERROR)?
      .ok_or(READ_ERROR)?;
    let content = read_bound_file(
      &worker_home,
      &email,
      &uuid,
      "transcripts",
      &transcript.filename,
      read_bounded,
    )?;
    Ok::<_, String>((transcript, content))
  })
  .await
  .map_err(|_| READ_ERROR)??;
  let metadata = crate::audio::audio::get_metadata(thread_id)
    .await
    .map_err(|_| READ_ERROR)?;
  validate_profile(&home, &expected_email, &expected_uuid)?;
  Ok(TranscriptWithContent {
    transcript,
    content,
    filename: metadata.filename,
    start_time: metadata.start_time,
    end_time: metadata.end_time,
    participants: metadata.participants,
    thread_id: metadata.thread_id,
  })
}

fn file_present<T>(result: std::io::Result<T>) -> Result<bool, String> {
  match result {
    Ok(_) => Ok(true),
    Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
    Err(_) => Err(READ_ERROR.into()),
  }
}
fn basename(name: &str) -> bool {
  let mut components = Path::new(name).components();
  matches!(
    (components.next(), components.next()),
    (Some(Component::Normal(_)), None)
  )
}

fn read_notes_files(
  home: &Path,
  email: &str,
  uuid: &str,
  thread_id: u64,
  legacy: impl FnOnce() -> Result<Option<String>, String>,
  present: impl Fn(&Path) -> Result<bool, String>,
) -> Result<Option<String>, String> {
  validate_profile(home, email, uuid)?;
  for directory in [home.join(".knapsack"), home.join(".knapsack/notes")] {
    match std::fs::symlink_metadata(directory) {
      Ok(metadata) if metadata.file_type().is_symlink() => return Err(READ_ERROR.into()),
      result => {
        file_present(result)?;
      }
    }
  }
  let canonical = thread_id.to_string();
  let candidate = home.join(".knapsack/notes").join(&canonical);
  let filename = if present(&candidate)? {
    Some(canonical)
  } else {
    match legacy()? {
      Some(name) => {
        if !basename(&name) {
          return Err(READ_ERROR.into());
        }
        if present(&home.join(".knapsack/notes").join(&name))? {
          Some(name)
        } else {
          None
        }
      }
      None => None,
    }
  };
  let notes = match filename {
    Some(name) => Some(read_bound_file(
      home,
      email,
      uuid,
      "notes",
      &name,
      read_bounded,
    )?),
    None => None,
  };
  validate_profile(home, email, uuid)?;
  Ok(notes)
}

#[tauri::command]
pub async fn read_saved_meeting_notes(
  thread_id: u64,
  expected_email: String,
  expected_uuid: String,
) -> Result<serde_json::Value, String> {
  let home = dirs::home_dir().ok_or(READ_ERROR)?;
  tauri::async_runtime::spawn_blocking(move || {
    validate_profile(&home, &expected_email, &expected_uuid)?;
    crate::db::models::thread::Thread::find_by_id(thread_id)
      .map_err(|_| READ_ERROR)?
      .ok_or(READ_ERROR)?;
    let notes = read_notes_files(
      &home,
      &expected_email,
      &expected_uuid,
      thread_id,
      || {
        Ok(
          Transcript::find_by_thread_id(thread_id)
            .map_err(|_| READ_ERROR)?
            .map(|t| t.filename),
        )
      },
      |path| file_present(std::fs::symlink_metadata(path)),
    )?;
    let result = crate::api::notes::notes_snapshot(&home, thread_id, notes);
    validate_profile(&home, &expected_email, &expected_uuid)?;
    if result["data"]["recording"].is_null() {
      return Err(READ_ERROR.into());
    }
    Ok(result)
  })
  .await
  .map_err(|_| READ_ERROR)?
}

/// Fixed synthetic fixture executed inside the isolated native QA application.
/// Never callable through IPC and never enabled in a production build.
pub(crate) async fn native_read_probe() -> Result<(), String> {
  use crate::db::models::{feed_item::FeedItem, thread::Thread};
  if !crate::qa_launch::is_synthetic_build() {
    return Err("not_synthetic".into());
  }
  let home = dirs::home_dir().ok_or(READ_ERROR)?;
  if Some(home.as_path()) != option_env!("KNAPSACK_QA_BUILD_HOME").map(Path::new) {
    return Err("wrong_synthetic_home".into());
  }
  let profile = home.join(".knapsack/profile.dat");
  let previous = match std::fs::read(&profile) {
    Ok(value) => Some(value),
    Err(error) if error.kind() == std::io::ErrorKind::NotFound => None,
    Err(_) => return Err(READ_ERROR.into()),
  };
  std::fs::create_dir_all(home.join(".knapsack/transcripts")).map_err(|_| READ_ERROR)?;
  std::fs::create_dir_all(home.join(".knapsack/notes")).map_err(|_| READ_ERROR)?;
  std::fs::write(
    &profile,
    br#"{"KN_PROFILE":{"email":"native@example.test","uuid":"native-owner"}}"#,
  )
  .map_err(|_| READ_ERROR)?;
  let result = async {
    let mut feed = FeedItem {
      title: Some("Fictional saved meeting".into()),
      timestamp: Some(1700000000),
      ..Default::default()
    };
    feed.create().map_err(|_| READ_ERROR)?;
    let mut thread = Thread {
      feed_item_id: feed.id,
      ..Default::default()
    };
    thread.create().map_err(|_| READ_ERROR)?;
    let id = thread.id.ok_or(READ_ERROR)?;
    let filename = "native-read-probe.txt";
    let mut transcript = Transcript {
      thread_id: Some(id),
      filename: filename.into(),
      ..Default::default()
    };
    transcript.create().map_err(|_| READ_ERROR)?;
    let transcript_path = home.join(".knapsack/transcripts").join(filename);
    let notes_path = home.join(".knapsack/notes").join(id.to_string());
    std::fs::write(&transcript_path, "Fictional retained transcript").map_err(|_| READ_ERROR)?;
    std::fs::write(&notes_path, "Existing fictional user edits").map_err(|_| READ_ERROR)?;
    for _ in 0..2 {
      let value =
        read_saved_notes_transcript(id, "native@example.test".into(), "native-owner".into())
          .await?;
      let notes =
        read_saved_meeting_notes(id, "native@example.test".into(), "native-owner".into()).await?;
      if value.content != "Fictional retained transcript"
        || value.thread_id != Some(id)
        || notes["data"]["notes"] != "Existing fictional user edits"
        || notes["data"]["thread_id"] != id
      {
        return Err("native_read_mismatch".into());
      }
    }
    if read_saved_meeting_notes(id, "other@example.test".into(), "other-owner".into())
      .await
      .is_ok()
      || read_saved_notes_transcript(id, "other@example.test".into(), "other-owner".into())
        .await
        .is_ok()
    {
      return Err("native_account_boundary".into());
    }
    if std::fs::read_to_string(&notes_path).map_err(|_| READ_ERROR)?
      != "Existing fictional user edits"
      || std::fs::read_to_string(&transcript_path).map_err(|_| READ_ERROR)?
        != "Fictional retained transcript"
    {
      return Err("native_read_modified_source".into());
    }
    Ok(())
  }
  .await;
  match previous {
    Some(bytes) => std::fs::write(profile, bytes),
    None => std::fs::remove_file(profile),
  }
  .map_err(|_| READ_ERROR)?;
  result
}

#[cfg(test)]
mod tests {
  use super::*;
  fn fixture() -> tempfile::TempDir {
    let h = tempfile::tempdir().unwrap();
    std::fs::create_dir_all(h.path().join(".knapsack/transcripts")).unwrap();
    profile(h.path(), "a@example.test", "owner-a");
    std::fs::write(
      h.path().join(".knapsack/transcripts/one.txt"),
      "Saved meeting",
    )
    .unwrap();
    h
  }
  fn profile(home: &Path, email: &str, uuid: &str) {
    std::fs::write(
      home.join(".knapsack/profile.dat"),
      serde_json::json!({"KN_PROFILE":{"email":email,"uuid":uuid}}).to_string(),
    )
    .unwrap();
  }
  #[test]
  fn reads_only_matching_profile_and_preserves_file() {
    let h = fixture();
    assert_eq!(
      read_bound_file(
        h.path(),
        "A@example.test",
        "owner-a",
        "transcripts",
        "one.txt",
        read_bounded
      )
      .unwrap(),
      "Saved meeting"
    );
    assert_eq!(
      std::fs::read_to_string(h.path().join(".knapsack/transcripts/one.txt")).unwrap(),
      "Saved meeting"
    );
  }
  #[test]
  fn rejects_wrong_or_missing_identity_before_read() {
    let h = fixture();
    for (email, uuid) in [
      ("b@example.test", "owner-a"),
      ("a@example.test", "owner-b"),
      ("", "owner-a"),
    ] {
      assert!(
        read_bound_file(h.path(), email, uuid, "transcripts", "one.txt", |_| panic!(
          "must not read"
        ))
        .is_err()
      );
    }
  }
  #[test]
  fn account_switch_during_read_never_returns_content() {
    let h = fixture();
    assert!(read_bound_file(
      h.path(),
      "a@example.test",
      "owner-a",
      "transcripts",
      "one.txt",
      |path| {
        let text = read_bounded(path)?;
        profile(h.path(), "b@example.test", "owner-b");
        Ok(text)
      }
    )
    .is_err());
  }
  #[test]
  fn rejects_traversal_and_missing_files() {
    let h = fixture();
    for file in ["../profile.dat", "/etc/passwd", "missing.txt"] {
      assert!(read_bound_file(
        h.path(),
        "a@example.test",
        "owner-a",
        "transcripts",
        file,
        read_bounded
      )
      .is_err());
    }
  }
  #[cfg(unix)]
  #[test]
  fn rejects_symlink_source() {
    let h = fixture();
    std::os::unix::fs::symlink(
      h.path().join(".knapsack/profile.dat"),
      h.path().join(".knapsack/transcripts/link.txt"),
    )
    .unwrap();
    assert!(read_bound_file(
      h.path(),
      "a@example.test",
      "owner-a",
      "transcripts",
      "link.txt",
      read_bounded
    )
    .is_err());
  }
  #[test]
  fn bounds_transcript_read_without_truncating() {
    let h = fixture();
    let p = h.path().join(".knapsack/transcripts/large.txt");
    std::fs::File::create(&p)
      .unwrap()
      .set_len(MAX_TRANSCRIPT_BYTES + 1)
      .unwrap();
    assert!(read_bounded(&p).is_err());
  }
  #[test]
  fn only_not_found_is_a_missing_file() {
    assert!(!file_present::<()>(Err(std::io::ErrorKind::NotFound.into())).unwrap());
    for kind in [
      std::io::ErrorKind::PermissionDenied,
      std::io::ErrorKind::Other,
      std::io::ErrorKind::Interrupted,
    ] {
      assert!(file_present::<()>(Err(kind.into())).is_err());
    }
  }
  #[test]
  fn notes_lane_is_read_only_and_checks_the_same_profile() {
    let h = fixture();
    std::fs::create_dir(h.path().join(".knapsack/notes")).unwrap();
    let p = h.path().join(".knapsack/notes/44");
    std::fs::write(&p, "Existing user notes").unwrap();
    assert_eq!(
      read_bound_file(
        h.path(),
        "a@example.test",
        "owner-a",
        "notes",
        "44",
        read_bounded
      )
      .unwrap(),
      "Existing user notes"
    );
    assert!(read_bound_file(
      h.path(),
      "b@example.test",
      "owner-b",
      "notes",
      "44",
      read_bounded
    )
    .is_err());
    assert_eq!(std::fs::read_to_string(p).unwrap(), "Existing user notes");
  }

  fn exists(path: &Path) -> Result<bool, String> {
    file_present(std::fs::symlink_metadata(path))
  }
  #[test]
  fn canonical_notes_win_without_looking_up_legacy() {
    let h = fixture();
    std::fs::create_dir(h.path().join(".knapsack/notes")).unwrap();
    std::fs::write(h.path().join(".knapsack/notes/44"), "Canonical edits").unwrap();
    assert_eq!(
      read_notes_files(
        h.path(),
        "a@example.test",
        "owner-a",
        44,
        || panic!("must not consult legacy"),
        exists
      )
      .unwrap(),
      Some("Canonical edits".into())
    );
  }
  #[test]
  fn legacy_notes_are_read_without_migration_or_deletion() {
    let h = fixture();
    std::fs::create_dir(h.path().join(".knapsack/notes")).unwrap();
    let path = h.path().join(".knapsack/notes/legacy.txt");
    std::fs::write(&path, "Legacy user notes").unwrap();
    assert_eq!(
      read_notes_files(
        h.path(),
        "a@example.test",
        "owner-a",
        44,
        || Ok(Some("legacy.txt".into())),
        exists
      )
      .unwrap(),
      Some("Legacy user notes".into())
    );
    assert_eq!(std::fs::read_to_string(path).unwrap(), "Legacy user notes");
    assert!(!h.path().join(".knapsack/notes/44").exists());
  }
  #[test]
  fn genuine_absence_never_creates_a_note_or_directory() {
    let h = fixture();
    assert_eq!(
      read_notes_files(
        h.path(),
        "a@example.test",
        "owner-a",
        44,
        || Ok(None),
        exists
      )
      .unwrap(),
      None
    );
    assert!(!h.path().join(".knapsack/notes").exists());
  }
  #[test]
  fn stat_failures_never_fall_back_to_legacy_or_report_missing() {
    let h = fixture();
    assert!(read_notes_files(
      h.path(),
      "a@example.test",
      "owner-a",
      44,
      || panic!("must not consult legacy"),
      |_| Err("synthetic permission failure".into())
    )
    .is_err());
    assert!(read_notes_files(
      h.path(),
      "a@example.test",
      "owner-a",
      44,
      || Ok(Some("legacy.txt".into())),
      |path| if path.ends_with("44") {
        Ok(false)
      } else {
        Err("synthetic I/O failure".into())
      }
    )
    .is_err());
  }
  #[cfg(unix)]
  #[test]
  fn notes_snapshot_rejects_symlink_folders_and_files() {
    let h = fixture();
    let outside = tempfile::tempdir().unwrap();
    std::os::unix::fs::symlink(outside.path(), h.path().join(".knapsack/notes")).unwrap();
    assert!(read_notes_files(
      h.path(),
      "a@example.test",
      "owner-a",
      44,
      || Ok(None),
      exists
    )
    .is_err());
    std::fs::remove_file(h.path().join(".knapsack/notes")).unwrap();
    std::fs::create_dir(h.path().join(".knapsack/notes")).unwrap();
    std::os::unix::fs::symlink(
      h.path().join(".knapsack/profile.dat"),
      h.path().join(".knapsack/notes/44"),
    )
    .unwrap();
    assert!(read_notes_files(
      h.path(),
      "a@example.test",
      "owner-a",
      44,
      || Ok(None),
      exists
    )
    .is_err());
  }
}

pub(crate) fn read_bound_notes(home: &Path, email: &str, uuid: &str, thread_id: u64) -> Result<Option<String>, String> {
  validate_profile(home,email,uuid)?;
  let filename=thread_id.to_string();
  match std::fs::symlink_metadata(home.join(".knapsack/notes").join(&filename)) {
    Err(error) if error.kind()==std::io::ErrorKind::NotFound => Ok(None),
    Err(_) => Err(READ_ERROR.into()),
    Ok(_) => read_bound_file(home,email,uuid,"notes",&filename,|path| {
      // Timeline excerpts do not need unbounded full meeting documents.
      let mut bytes=Vec::new();
      std::fs::File::open(path).map_err(|_| READ_ERROR)?.take(256*1024+1).read_to_end(&mut bytes).map_err(|_| READ_ERROR)?;
      if bytes.len()>256*1024 { return Err(READ_ERROR.into()); }
      String::from_utf8(bytes).map_err(|_| READ_ERROR.into())
    }).map(Some),
  }
}
