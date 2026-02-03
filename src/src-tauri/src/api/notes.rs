use crate::error::Error;
use actix_web::{
  get, post,
  web::{self, Json},
  HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::{read_to_string, File};
use std::io::Write;

use crate::audio::audio::get_metadata;
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

fn save_notes_to_file(thread_id: u64, notes_content: &str) -> Result<(), Error> {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let notes_dir = knapsack_data_dir.join("notes");

  if let Err(e) = std::fs::create_dir_all(&notes_dir) {
    log::error!("Failed to create notes directory: {:?}", e);
    return Err(Error::KSError(
      "failed to create notes directory".to_string(),
    ));
  }

  let notes_path = notes_dir.join(thread_id.to_string());

  match File::create(&notes_path) {
    Ok(mut file) => {
      if let Err(e) = file.write_all(notes_content.as_bytes()) {
        log::error!("Failed to write notes to file: {:?}", e);
        Err(Error::KSError("failed to write notes".to_string()))
      } else {
        Ok(())
      }
    }
    Err(e) => {
      log::error!("Failed to create notes file: {:?}", e);
      Err(Error::KSError("failed to create notes file".to_string()))
    }
  }
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
}

fn check_if_legacy_notes_exists(thread_id: u64) -> Result<Option<String>, Error> {
  let transcript = match Transcript::find_by_thread_id(thread_id) {
    Ok(Some(t)) => t,
    Ok(None) => return Ok(None),
    Err(_) => return Ok(None),
  };
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let notes_dir = knapsack_data_dir.join("notes");
  let notes_path = notes_dir.join(&transcript.filename);

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
  let knapsack_data_dir = home_dir.join(".knapsack");
  let notes_dir = knapsack_data_dir.join("notes");
  let notes_path = notes_dir.join(thread_id.to_string());

  let notes = if notes_path.exists() {
    match read_to_string(&notes_path) {
      Ok(content) => Some(content),
      Err(e) => {
        log::error!("Failed to read notes' content: {:?}.", e);
        return HttpResponse::InternalServerError()
          .json(json!({"error": format!("Failed to read notes' content: {:?}", e)}));
      }
    }
  } else {
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
  };

  HttpResponse::Ok().json(json!({
    "success": true,
    "data": GetNotesResponse { notes }
  }))
}

#[get("/api/knapsack/notes/list")]
async fn list_all_notes() -> impl Responder {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let knapsack_data_dir = home_dir.join(".knapsack");
  let notes_dir = knapsack_data_dir.join("notes");

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
          if path.is_file() {
            if let Some(filename) = path.file_name() {
              if let Some(filename_str) = filename.to_str() {
                if let Ok(thread_id) = filename_str.parse::<u64>() {
                  let metadata = get_metadata(thread_id).await.unwrap();
                  match read_to_string(&path) {
                    Ok(content) => {
                      notes_list.push(json!({
                          "thread_id": thread_id,
                          "content": content,
                          "filename": metadata.filename.clone(),
                          "start_time": metadata.start_time.clone(),
                          "end_time": metadata.end_time.clone(),
                          "participants": metadata.participants.clone(),
                          "thread_id": metadata.thread_id.clone()
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
