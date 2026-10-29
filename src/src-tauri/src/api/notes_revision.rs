//! Conditional revisions of the canonical notes file. Transcript files are never
//! opened here. Receipts retain the before-image for explicit, conflict-safe Undo.
use super::{read_note_content, reject_symlink, secure_notes_dir, write_note_content};
use actix_web::{post, web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::path::Path;
use std::sync::atomic::Ordering;

pub(super) fn revision(thread_id: u64, notes: Option<&str>) -> String {
  let mut digest = Sha256::new();
  digest.update(thread_id.to_le_bytes());
  digest.update(if notes.is_some() { b"present".as_slice() } else { b"missing".as_slice() });
  digest.update(notes.unwrap_or("").as_bytes());
  format!("{:x}", digest.finalize())
}

#[derive(Debug, Deserialize)]
pub struct ReviseNotesRequest {
  thread_id: u64,
  expected_revision: String,
  notes: Option<String>,
  restore_revision: Option<String>,
  #[serde(default)]
  source: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotesRevisionReceipt {
  revision_id: String,
  thread_id: u64,
  before_revision: String,
  revision: String,
  before_notes: String,
  notes: String,
  source: Value,
  restored_from: Option<String>,
}

#[derive(Debug)]
enum RevisionError { Conflict(&'static str), Storage }

fn revise_at(home: &Path, request: &ReviseNotesRequest) -> Result<NotesRevisionReceipt, RevisionError> {
  let current = read_note_content(home, request.thread_id).map_err(|_| RevisionError::Storage)?
    .ok_or(RevisionError::Conflict("There are no saved notes to edit."))?;
  let before_revision = revision(request.thread_id, Some(&current));
  if before_revision != request.expected_revision {
    return Err(RevisionError::Conflict("Saved notes changed. Generate a new proposal from the latest notes."));
  }
  let history_root = secure_notes_dir(home).map_err(|_| RevisionError::Storage)?.join(".revisions");
  reject_symlink(&history_root).map_err(|_| RevisionError::Storage)?;
  let history = history_root.join(request.thread_id.to_string());
  reject_symlink(&history).map_err(|_| RevisionError::Storage)?;
  std::fs::create_dir_all(&history).map_err(|_| RevisionError::Storage)?;
  let notes = if let Some(id) = &request.restore_revision {
    let id = uuid::Uuid::parse_str(id).map_err(|_| RevisionError::Conflict("Invalid revision identity."))?;
    let path = history.join(format!("{id}.json"));
    reject_symlink(&path).map_err(|_| RevisionError::Storage)?;
    let receipt: NotesRevisionReceipt = serde_json::from_slice(&std::fs::read(path).map_err(|_| RevisionError::Conflict("Revision not found for this meeting."))?)
      .map_err(|_| RevisionError::Storage)?;
    if receipt.thread_id != request.thread_id || receipt.revision != before_revision {
      return Err(RevisionError::Conflict("A newer edit prevents Undo. Your current notes were kept."));
    }
    receipt.before_notes
  } else {
    request.notes.clone().filter(|text| !text.trim().is_empty())
      .ok_or(RevisionError::Conflict("The proposed notes are empty."))?
  };
  let receipt = NotesRevisionReceipt {
    revision_id: uuid::Uuid::new_v4().to_string(), thread_id: request.thread_id,
    before_revision, revision: revision(request.thread_id, Some(&notes)),
    before_notes: current, notes, source: request.source.clone(), restored_from: request.restore_revision.clone(),
  };
  let archive = history.join(format!("{}.json", receipt.revision_id));
  std::fs::write(&archive, serde_json::to_vec(&receipt).map_err(|_| RevisionError::Storage)?)
    .map_err(|_| RevisionError::Storage)?;
  if write_note_content(home, request.thread_id, &receipt.notes).is_err() {
    let _ = std::fs::remove_file(archive);
    return Err(RevisionError::Storage);
  }
  Ok(receipt)
}

#[post("/api/knapsack/notes/revise")]
pub async fn revise_notes(recording: web::Data<crate::RecordingState>, request: web::Json<ReviseNotesRequest>) -> HttpResponse {
  let _guard = crate::audio::audio::RECORDING_LIFECYCLE_LOCK.lock().unwrap();
  let completed = crate::db::models::thread::Thread::find_by_id(request.thread_id)
    .ok().flatten().is_some_and(|thread| thread.recorded == Some(true));
  let capturing = *recording.thread_id.lock().unwrap() == Some(request.thread_id)
    && (recording.is_recording.load(Ordering::Relaxed) || recording.is_starting.load(Ordering::Relaxed)
      || recording.is_stopping.load(Ordering::Relaxed));
  if !completed || capturing {
    return HttpResponse::Conflict().json(json!({"success": false, "error": "Finish the meeting before editing its saved notes with chat."}));
  }
  let Some(home) = dirs::home_dir() else { return HttpResponse::InternalServerError().finish(); };
  match revise_at(&home, &request) {
    Ok(receipt) => HttpResponse::Ok().json(json!({"success": true, "data": receipt})),
    Err(RevisionError::Conflict(message)) => HttpResponse::Conflict().json(json!({"success": false, "error": message})),
    Err(RevisionError::Storage) => HttpResponse::InternalServerError().json(json!({"success": false, "error": "Could not save the notes revision. Your proposal is still available."})),
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  fn request(thread_id: u64, before: &str, after: &str) -> ReviseNotesRequest {
    ReviseNotesRequest { thread_id, expected_revision: revision(thread_id, Some(before)), notes: Some(after.into()), restore_revision: None,
      source: json!({"request": "You swapped me and Frida", "transcript_revision": "fictional-evidence"}) }
  }
  #[test]
  fn meeting_notes_revision_apply_undo_and_transcript_identity() {
    let root = tempfile::tempdir().unwrap();
    write_note_content(root.path(), 42, "You represent Visa").unwrap();
    let evidence = root.path().join("transcript.txt"); std::fs::write(&evidence, "Frida: I represent Visa.").unwrap();
    let applied = revise_at(root.path(), &request(42, "You represent Visa", "Frida represents Visa")).unwrap();
    assert_eq!(read_note_content(root.path(), 42).unwrap().unwrap(), "Frida represents Visa");
    let undo = ReviseNotesRequest { expected_revision: applied.revision.clone(), restore_revision: Some(applied.revision_id.clone()), ..request(42, "", "") };
    let restored = revise_at(root.path(), &undo).unwrap();
    assert_eq!(restored.notes, "You represent Visa");
    assert_eq!(std::fs::read_to_string(evidence).unwrap(), "Frida: I represent Visa.");
    assert_eq!(applied.source["transcript_revision"], "fictional-evidence");
  }
  #[test]
  fn meeting_notes_revision_conflicts_and_cross_meeting_restore_do_not_overwrite() {
    let root = tempfile::tempdir().unwrap();
    write_note_content(root.path(), 42, "base").unwrap(); write_note_content(root.path(), 43, "other").unwrap();
    let applied = revise_at(root.path(), &request(42, "base", "proposal")).unwrap();
    assert!(matches!(revise_at(root.path(), &request(42, "base", "stale")), Err(RevisionError::Conflict(_))));
    write_note_content(root.path(), 42, "manual edit").unwrap();
    let undo = ReviseNotesRequest { expected_revision: revision(42, Some("manual edit")), restore_revision: Some(applied.revision_id.clone()), ..request(42, "", "") };
    assert!(matches!(revise_at(root.path(), &undo), Err(RevisionError::Conflict(_))));
    let other = ReviseNotesRequest { thread_id: 43, expected_revision: revision(43, Some("other")), ..undo };
    assert!(revise_at(root.path(), &other).is_err());
    assert_eq!(read_note_content(root.path(), 42).unwrap().unwrap(), "manual edit");
    assert_eq!(read_note_content(root.path(), 43).unwrap().unwrap(), "other");
  }
  #[test]
  fn meeting_notes_revision_archive_failure_keeps_canonical_notes() {
    let root = tempfile::tempdir().unwrap(); write_note_content(root.path(), 42, "base").unwrap();
    std::fs::write(root.path().join(".knapsack/notes/.revisions"), "blocked directory").unwrap();
    assert!(matches!(revise_at(root.path(), &request(42, "base", "proposal")), Err(RevisionError::Storage)));
    assert_eq!(read_note_content(root.path(), 42).unwrap().unwrap(), "base");
  }
}
