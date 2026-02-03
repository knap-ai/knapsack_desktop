use crate::audio::audio::get_metadata;
use crate::db::models::transcript::Transcript;
use chrono::Utc;
use serde_json::json;
use std::fs::read_to_string;

/// Build a compact meeting manifest for the system prompt.
/// Lists recent meeting metadata (title, date, participants, thread_id) without loading
/// full transcript content. Returns empty string if no recent meetings exist.
pub async fn build_meeting_manifest(days: u32) -> String {
  let since = Utc::now().timestamp() - (days as i64 * 86400);
  let transcripts = match Transcript::find_recent(since) {
    Ok(t) => t,
    Err(e) => {
      log::warn!("Failed to load recent transcripts for manifest: {:?}", e);
      return String::new();
    }
  };
  if transcripts.is_empty() {
    return String::new();
  }

  let mut lines = Vec::new();
  lines.push(format!("## RECENT MEETINGS (last {} days)", days).to_string());
  lines.push("You have access to the following meeting transcripts and notes. Use `get_meeting_transcript(thread_id)` or `get_meeting_notes(thread_id)` tools to retrieve full content when relevant to the user's question.".to_string());
  lines.push(String::new());

  // Cap at 20 meetings to prevent system prompt bloat
  for t in transcripts.iter().take(20) {
    let tid = match t.thread_id {
      Some(id) => id,
      None => continue,
    };

    match get_metadata(tid).await {
      Ok(meta) => {
        let date_str = t
          .timestamp
          .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
          .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
          .unwrap_or_else(|| "unknown date".to_string());

        let duration_str = match (meta.start_time, meta.end_time) {
          (Some(s), Some(e)) if e > s => {
            let mins = (e - s) / 60000; // start_time/end_time are in milliseconds
            if mins > 0 {
              format!(" | ~{}min", mins)
            } else {
              String::new()
            }
          }
          _ => String::new(),
        };

        let participants_str = meta
          .participants
          .as_ref()
          .map(|p| {
            // Extract emails from JSON attendees array for compact display
            let compact = extract_participant_names(p);
            if compact.is_empty() {
              String::new()
            } else {
              format!(" | Participants: {}", compact)
            }
          })
          .unwrap_or_default();

        lines.push(format!(
          "- **{}** (thread_id: {}){}{} | {}",
          meta.filename, tid, duration_str, participants_str, date_str
        ));
      }
      Err(e) => {
        log::warn!("Failed to get metadata for thread {}: {:?}", tid, e);
        continue;
      }
    }
  }

  // Only return content if we actually built meeting entries (not just the header)
  if lines.len() <= 3 {
    return String::new();
  }

  lines.join("\n")
}

/// List recent meetings as a JSON-serializable structure (for the list_recent_meetings tool).
/// When a search term is provided, searches ALL meetings (ignoring days limit) to find
/// matches by title or participant name. Without search, returns meetings from the last N days.
pub async fn list_meetings(days: u32, search: Option<&str>) -> serde_json::Value {
  // When searching, look through all meetings to find matches regardless of date
  let transcripts = if search.is_some() {
    match Transcript::find_all() {
      Ok(t) => t,
      Err(e) => {
        log::warn!("Failed to load all transcripts for search: {:?}", e);
        return json!([]);
      }
    }
  } else {
    let since = Utc::now().timestamp() - (days as i64 * 86400);
    match Transcript::find_recent(since) {
      Ok(t) => t,
      Err(e) => {
        log::warn!("Failed to load recent transcripts: {:?}", e);
        return json!([]);
      }
    }
  };

  let search_lower = search.map(|s| s.to_lowercase());
  let mut meetings = Vec::new();

  for t in transcripts.iter().take(50) {
    let tid = match t.thread_id {
      Some(id) => id,
      None => continue,
    };

    match get_metadata(tid).await {
      Ok(meta) => {
        // Apply search filter if provided
        if let Some(ref query) = search_lower {
          let title_match = meta.filename.to_lowercase().contains(query);
          let participant_match = meta
            .participants
            .as_ref()
            .map(|p| p.to_lowercase().contains(query))
            .unwrap_or(false);
          if !title_match && !participant_match {
            continue;
          }
        }

        let date_str = t
          .timestamp
          .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
          .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
          .unwrap_or_else(|| "unknown".to_string());

        let duration_mins = match (meta.start_time, meta.end_time) {
          (Some(s), Some(e)) if e > s => Some((e - s) / 60000),
          _ => None,
        };

        let participants = meta
          .participants
          .as_ref()
          .map(|p| extract_participant_names(p))
          .unwrap_or_default();

        meetings.push(json!({
          "thread_id": tid,
          "title": meta.filename,
          "date": date_str,
          "duration_minutes": duration_mins,
          "participants": participants,
        }));
      }
      Err(_) => continue,
    }
  }

  json!(meetings)
}

/// Get the full transcript content for a specific meeting.
/// Truncates at 80,000 characters to fit within LLM context windows.
pub fn get_transcript_content(thread_id: u64) -> Result<String, String> {
  let transcript = Transcript::find_by_thread_id(thread_id)
    .map_err(|e| format!("DB error: {:?}", e))?
    .ok_or_else(|| format!("No transcript found for thread_id {}", thread_id))?;

  let home_dir = dirs::home_dir().ok_or("Could not determine home directory")?;
  let transcript_path = home_dir
    .join(".knapsack")
    .join("transcripts")
    .join(&transcript.filename);

  let content =
    read_to_string(&transcript_path).map_err(|e| format!("Failed to read transcript file: {}", e))?;

  // Truncate very long transcripts
  let max_chars = 80_000;
  if content.len() > max_chars {
    Ok(format!(
      "{}...\n\n[Transcript truncated at {} chars — total length: {} chars. Ask about specific sections or topics for more detail.]",
      &content[..max_chars],
      max_chars,
      content.len()
    ))
  } else {
    Ok(content)
  }
}

/// Get the user's notes for a specific meeting. Returns None if no notes exist.
pub fn get_notes_content(thread_id: u64) -> Result<Option<String>, String> {
  let home_dir = dirs::home_dir().ok_or("Could not determine home directory")?;
  let notes_path = home_dir
    .join(".knapsack")
    .join("notes")
    .join(thread_id.to_string());

  if !notes_path.exists() {
    return Ok(None);
  }

  let content =
    read_to_string(&notes_path).map_err(|e| format!("Failed to read notes file: {}", e))?;

  Ok(Some(content))
}

/// Extract participant names/emails from the JSON attendees string for compact display.
/// Input is typically a JSON array like: [{"email":"alice@co.com","displayName":"Alice",...}, ...]
fn extract_participant_names(json_str: &str) -> String {
  if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(json_str) {
    let names: Vec<String> = arr
      .iter()
      .filter_map(|v| {
        // Try displayName first, fall back to email
        v.get("displayName")
          .and_then(|n| n.as_str())
          .filter(|s| !s.is_empty())
          .or_else(|| {
            v.get("emailAddress")
              .and_then(|ea| ea.get("name"))
              .and_then(|n| n.as_str())
              .filter(|s| !s.is_empty())
          })
          .or_else(|| {
            v.get("email")
              .and_then(|e| e.as_str())
              .filter(|s| !s.is_empty())
          })
          .or_else(|| {
            v.get("emailAddress")
              .and_then(|ea| ea.get("address"))
              .and_then(|a| a.as_str())
              .filter(|s| !s.is_empty())
          })
          .map(|s| s.to_string())
      })
      .take(10) // Cap at 10 participants for display
      .collect();
    names.join(", ")
  } else {
    // Not valid JSON, return truncated raw string
    if json_str.len() > 100 {
      format!("{}...", &json_str[..100])
    } else {
      json_str.to_string()
    }
  }
}
