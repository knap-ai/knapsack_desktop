#[path = "notes_revision.rs"]
mod revisions;
pub use revisions::revise_notes;

use crate::error::Error;
use actix_web::{
  get, post,
  web::{self, Json},
  HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::{read_to_string, OpenOptions};
use std::io::Write;
use std::path::{Component, Path, PathBuf};

use crate::audio::audio::{get_metadata, RECORDING_LIFECYCLE_LOCK};
use crate::db::models::thread::Thread;
use crate::db::models::transcript::Transcript;

#[derive(Deserialize)]
struct SaveNotesRequest {
  notes: String,
  thread_id: u64,
}

#[derive(Serialize)]
struct NoteItem {
  thread_id: u64,
  content: String,
}

#[derive(Serialize)]
struct AllNotesResponse {
  notes: Vec<NoteItem>,
}

fn reject_symlink(path: &Path) -> Result<(), Error> {
  if let Ok(metadata) = std::fs::symlink_metadata(path) {
    if metadata.file_type().is_symlink() {
      return Err(Error::KSError("notes path cannot be a symlink".to_string()));
    }
  }
  Ok(())
}

fn secure_notes_dir(home_dir: &Path) -> Result<PathBuf, Error> {
  let knapsack_data_dir = home_dir.join(".knapsack");
  let notes_dir = knapsack_data_dir.join("notes");
  reject_symlink(&knapsack_data_dir)?;
  reject_symlink(&notes_dir)?;
  std::fs::create_dir_all(&notes_dir)
    .map_err(|_| Error::KSError("failed to create notes directory".to_string()))?;
  reject_symlink(&knapsack_data_dir)?;
  reject_symlink(&notes_dir)?;
  Ok(notes_dir)
}

fn note_path(home_dir: &Path, thread_id: u64) -> Result<PathBuf, Error> {
  let path = secure_notes_dir(home_dir)?.join(thread_id.to_string());
  reject_symlink(&path)?;
  Ok(path)
}

fn legacy_note_path(home_dir: &Path, filename: &str) -> Result<PathBuf, Error> {
  let mut components = Path::new(filename).components();
  match (components.next(), components.next()) {
    (Some(Component::Normal(_)), None) => {}
    _ => return Err(Error::KSError("invalid legacy notes filename".to_string())),
  }
  let path = secure_notes_dir(home_dir)?.join(filename);
  reject_symlink(&path)?;
  Ok(path)
}

fn write_note_content(home_dir: &Path, thread_id: u64, notes_content: &str) -> Result<(), Error> {
  let notes_path = note_path(home_dir, thread_id)?;
  let temporary = notes_path.with_file_name(format!(".notes-{}-{}.tmp", thread_id, uuid::Uuid::new_v4()));
  let mut file = OpenOptions::new().write(true).create_new(true).open(&temporary)
    .map_err(|_| Error::KSError("failed to create temporary notes file".into()))?;
  let written = file.write_all(notes_content.as_bytes()).and_then(|_| file.sync_all());
  drop(file);
  if written.is_err() || std::fs::rename(&temporary, &notes_path).is_err() {
    let _ = std::fs::remove_file(&temporary);
    return Err(Error::KSError("failed to commit notes file".into()));
  }
  Ok(())
}

fn read_note_content(home_dir: &Path, thread_id: u64) -> Result<Option<String>, Error> {
  let notes_path = note_path(home_dir, thread_id)?;
  if !notes_path.exists() {
    return Ok(None);
  }
  read_to_string(notes_path)
    .map(Some)
    .map_err(|e| Error::KSError(format!("Failed to read notes' content: {:?}", e)))
}

pub(crate) fn save_notes_to_file(thread_id: u64, notes_content: &str) -> Result<(), Error> {
  let _lifecycle_guard = RECORDING_LIFECYCLE_LOCK.lock().unwrap();
  if Thread::find_by_id(thread_id)?.is_none() {
    return Err(Error::KSError(
      "Cannot save notes for a deleted meeting".to_string(),
    ));
  }
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  write_note_content(&home_dir, thread_id, notes_content)
}

#[post("/api/knapsack/notes")]
async fn save_notes(data: Json<SaveNotesRequest>) -> impl Responder {
  match save_notes_to_file(data.thread_id, &data.notes) {
    Ok(_) => {
      log::debug!("Saved notes.");
      HttpResponse::Ok().json(json!({
        "success": true,
        "message": "Notes saved successfully"
      }))
    }
    Err(e) => {
      return HttpResponse::InternalServerError().json(json!({
        "error": format!("{:?}", e),
        "success": false
      }))
    }
  }
}

#[derive(Serialize)]
struct GetNotesResponse {
  notes: Option<String>,
  exists: bool,
  thread_id: u64,
  revision: String,
}

fn check_if_legacy_notes_exists(thread_id: u64) -> Result<Option<String>, Error> {
  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => return Ok(None),
    Err(_) => return Ok(None),
  };
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let notes_path = legacy_note_path(&home_dir, &transcript.filename)?;

  let notes = if notes_path.exists() {
    match read_to_string(&notes_path) {
      Ok(content) => {
        log::info!("Found legacy notes! {:?}", &transcript.filename);
        save_notes_to_file(thread_id, &content)?;
        if let Err(e) = std::fs::remove_file(&notes_path) {
          log::error!("Failed to delete legacy notes file: {:?}", e);
        }
        Ok(Some(content))
      }
      Err(e) => Err(Error::KSError(format!(
        "Failed to read legacy notes: {:?}",
        e
      ))),
    }
  } else {
    Ok(None)
  };
  notes
}

#[get("/api/knapsack/notes/{thread_id}")]
async fn get_notes(path: web::Path<u64>) -> impl Responder {
  let thread_id = path.into_inner();

  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let notes = match read_note_content(&home_dir, thread_id) {
    Ok(Some(content)) => Some(content),
    Err(e) => {
      log::error!("Failed to read notes' content: {:?}.", e);
      return HttpResponse::InternalServerError()
        .json(json!({"error": format!("Failed to read notes' content: {:?}", e)}));
    }
    Ok(None) => {
      log::info!(
        "Failed to read notes file: {}. Checking for legacy notes.",
        thread_id
      );
      let legacy_notes = match check_if_legacy_notes_exists(thread_id) {
        Ok(n) => n,
        Err(e) => {
          log::error!("Failed to read legacy notes: {:?}.", e);
          return HttpResponse::InternalServerError()
            .json(json!({"error": format!("Failed to read legacy notes: {:?}", e)}));
        }
      };
      legacy_notes
    }
  };

  let exists = notes.is_some();
  let revision = revisions::revision(thread_id, notes.as_deref());

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": GetNotesResponse { notes, exists, thread_id, revision }
  }))
}

#[get("/api/knapsack/notes/list")]
async fn list_all_notes() -> impl Responder {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let notes_dir = match secure_notes_dir(&home_dir) {
    Ok(path) => path,
    Err(error) => {
      return HttpResponse::InternalServerError()
        .json(json!({"error": format!("Failed to access notes: {:?}", error)}))
    }
  };

  if !notes_dir.exists() {
    return HttpResponse::Ok().json(json!({
        "success": true,
        "data": {
            "notes": []
        }
    }));
  }

  let mut notes_list = Vec::new();

  match std::fs::read_dir(&notes_dir) {
    Ok(entries) => {
      for entry in entries {
        if let Ok(entry) = entry {
          let path = entry.path();
          if std::fs::symlink_metadata(&path)
            .map(|metadata| metadata.file_type().is_file())
            .unwrap_or(false)
          {
            if let Some(filename) = path.file_name() {
              if let Some(filename_str) = filename.to_str() {
                if let Ok(thread_id) = filename_str.parse::<u64>() {
                  let metadata = match get_metadata(thread_id).await {
                    Ok(metadata) => Some(metadata),
                    Err(error) => {
                      log::warn!(
                        "Failed to load note metadata for thread {} ({}): {:?}",
                        thread_id,
                        filename_str,
                        error
                      );
                      None
                    }
                  };
                  match read_to_string(&path) {
                    Ok(content) => {
                      notes_list.push(json!({
                          "thread_id": thread_id,
                          "content": content,
                          "filename": metadata.as_ref().map(|value| value.filename.clone()).unwrap_or_else(|| filename_str.to_string()),
                          "start_time": metadata.as_ref().and_then(|value| value.start_time),
                          "end_time": metadata.as_ref().and_then(|value| value.end_time),
                          "participants": metadata.as_ref().and_then(|value| value.participants.clone()),
                          "thread_id": metadata.as_ref().and_then(|value| value.thread_id).or(Some(thread_id))
                      }));
                    }
                    Err(e) => {
                      log::error!("Failed to read notes file {}: {:?}", filename_str, e);
                    }
                  }
                }
              }
            }
          }
        }
      }

      HttpResponse::Ok().json(json!({
          "success": true,
          "data": {
              "notes": notes_list
          }
      }))
    }
    Err(e) => {
      log::error!("Failed to read notes directory: {:?}", e);
      HttpResponse::InternalServerError().json(json!({
          "success": false,
          "error": format!("Failed to read notes directory: {:?}", e)
      }))
    }
  }
}

#[cfg(test)]
mod isolation_tests {
  use super::*;

  #[test]
  fn synthetic_qa_note_reads_and_writes_cannot_touch_production_sentinel() {
    let root = tempfile::tempdir().unwrap();
    let production_home = root.path().join("production-home");
    let synthetic_home = root.path().join("synthetic-home");
    let production_note = production_home.join(".knapsack/notes/42");
    std::fs::create_dir_all(production_note.parent().unwrap()).unwrap();
    std::fs::write(&production_note, "production sentinel").unwrap();

    assert_eq!(read_note_content(&synthetic_home, 42).unwrap(), None);
    write_note_content(&synthetic_home, 42, "synthetic note").unwrap();

    assert_eq!(
      std::fs::read_to_string(&production_note).unwrap(),
      "production sentinel"
    );
    assert_eq!(
      read_note_content(&synthetic_home, 42).unwrap().as_deref(),
      Some("synthetic note")
    );
  }

  #[test]
  fn synthetic_qa_legacy_note_filename_rejects_path_traversal() {
    let root = tempfile::tempdir().unwrap();
    for filename in ["../42", "nested/42", "/tmp/42", "."] {
      assert!(
        legacy_note_path(root.path(), filename).is_err(),
        "{filename}"
      );
    }
    assert!(legacy_note_path(root.path(), "meeting.txt").is_ok());
  }

  #[cfg(unix)]
  #[test]
  fn synthetic_qa_notes_reject_symlinked_directories_and_files() {
    use std::os::unix::fs::symlink;

    let root = tempfile::tempdir().unwrap();
    let production_home = root.path().join("production-home");
    let production_notes = production_home.join(".knapsack/notes");
    std::fs::create_dir_all(&production_notes).unwrap();
    let production_note = production_notes.join("42");
    std::fs::write(&production_note, "production sentinel").unwrap();

    let directory_attack_home = root.path().join("directory-attack-home");
    std::fs::create_dir_all(directory_attack_home.join(".knapsack")).unwrap();
    symlink(
      &production_notes,
      directory_attack_home.join(".knapsack/notes"),
    )
    .unwrap();
    assert!(write_note_content(&directory_attack_home, 42, "overwrite").is_err());

    let file_attack_home = root.path().join("file-attack-home");
    std::fs::create_dir_all(file_attack_home.join(".knapsack/notes")).unwrap();
    symlink(
      &production_note,
      file_attack_home.join(".knapsack/notes/42"),
    )
    .unwrap();
    assert!(read_note_content(&file_attack_home, 42).is_err());
    assert!(write_note_content(&file_attack_home, 42, "overwrite").is_err());
    assert_eq!(
      std::fs::read_to_string(&production_note).unwrap(),
      "production sentinel"
    );
  }
}
