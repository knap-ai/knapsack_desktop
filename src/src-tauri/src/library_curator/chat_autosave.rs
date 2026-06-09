//! Auto-save significant chat threads into the user's Library.
//!
//! Scans CHAT-type threads modified since the last curation pass, applies a
//! significance heuristic (≥2 user turns AND ≥400 chars of assistant output),
//! and saves each qualifying thread as a workspace document. The thread is
//! routed to the matching Project auto-collection by keyword-matching its
//! body against each project's name/slug/description; threads that don't
//! match any project fall through to a general "Saved Chats" auto-collection.
//!
//! Idempotent across runs via the (workspace_uuid, source_type, source_id)
//! unique index — re-running this never duplicates a thread.

use crate::db::db::get_db_conn;
use crate::db::models::message::Message;
use crate::db::models::workspace::{Workspace, WorkspaceDocument};
use crate::error::Error;
use crate::library_curator::settings::CuratorSettings;

const MIN_USER_TURNS: usize = 2;
const MIN_ASSISTANT_CHARS: usize = 400;
const MAX_THREADS_PER_PASS: i64 = 100;

/// Walk recent CHAT threads, save the significant ones to the matching
/// project (or to a fallback "Saved Chats" collection).
pub fn autosave_significant_chats(cfg: &CuratorSettings) -> Result<(), Error> {
  // Default to ~24 hours ago on first run so we don't autosave the user's
  // entire chat history in one go.
  let now = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|d| d.as_secs() as i64)
    .unwrap_or(0);
  let default_cutoff = now - 86_400;
  let cutoff = cfg.last_run_at.unwrap_or(default_cutoff);

  let threads = recent_chat_threads(cutoff)?;
  if threads.is_empty() {
    log::info!(
      "[library_curator/chats] no chat threads since cutoff {}",
      cutoff
    );
    return Ok(());
  }

  let projects = load_project_keyword_index();
  let mut saved = 0_usize;

  for (thread_id, title) in threads {
    let messages = match Message::find_by_thread_id(thread_id) {
      Ok(m) => m,
      Err(_) => continue,
    };
    if !is_significant(&messages) {
      continue;
    }

    let body = render_thread_markdown(&title, &messages);
    let target = match pick_target_workspace(&body, &projects) {
      Ok(w) => w,
      Err(e) => {
        log::warn!(
          "[library_curator/chats] no target workspace for thread {}: {:?}",
          thread_id,
          e
        );
        continue;
      }
    };

    let display_title = title
      .clone()
      .filter(|t| !t.trim().is_empty())
      .unwrap_or_else(|| {
        messages
          .iter()
          .find(|m| m.user_id.is_some())
          .map(|m| truncate_for_title(&m.content))
          .unwrap_or_else(|| format!("Chat {}", thread_id))
      });

    if WorkspaceDocument::create_with_source(
      target.uuid.clone(),
      display_title,
      None,
      Some("chat_output".to_string()),
      Some(body),
      Some("chat_output".to_string()),
      Some(thread_id.to_string()),
    )
    .is_ok()
    {
      saved += 1;
    }
  }

  log::info!(
    "[library_curator/chats] autosaved {} significant threads",
    saved
  );
  Ok(())
}

fn recent_chat_threads(cutoff: i64) -> Result<Vec<(u64, Option<String>)>, Error> {
  let connection = get_db_conn();
  let mut stmt = connection.prepare(
        "SELECT id, title FROM threads WHERE thread_type = 'CHAT' AND COALESCE(timestamp, 0) >= ?1 ORDER BY id DESC LIMIT ?2",
    )?;
  let rows = stmt.query_map(rusqlite::params![cutoff, MAX_THREADS_PER_PASS], |row| {
    Ok((row.get::<_, u64>(0)?, row.get::<_, Option<String>>(1)?))
  })?;
  Ok(rows.flatten().collect())
}

fn is_significant(messages: &[Message]) -> bool {
  let mut user_turns = 0_usize;
  let mut assistant_chars = 0_usize;
  for m in messages {
    // user_id Some => user message; None => assistant.
    if m.user_id.is_some() {
      user_turns += 1;
    } else {
      assistant_chars += m.content.trim().len();
    }
  }
  user_turns >= MIN_USER_TURNS && assistant_chars >= MIN_ASSISTANT_CHARS
}

fn render_thread_markdown(title: &Option<String>, messages: &[Message]) -> String {
  let mut out = String::new();
  if let Some(t) = title {
    if !t.trim().is_empty() {
      out.push_str(&format!("# {}\n\n", t.trim()));
    }
  }
  for m in messages {
    let role = if m.user_id.is_some() {
      "User"
    } else {
      "Assistant"
    };
    out.push_str(&format!("**{}:** {}\n\n", role, m.content.trim()));
  }
  out
}

fn truncate_for_title(s: &str) -> String {
  let s = s.trim();
  if s.chars().count() <= 80 {
    s.to_string()
  } else {
    let cut: String = s.chars().take(80).collect();
    format!("{}…", cut)
  }
}

struct ProjectKeyword {
  workspace: Workspace,
  keywords: Vec<String>,
}

fn load_project_keyword_index() -> Vec<ProjectKeyword> {
  let mut out = Vec::new();
  let Ok(workspaces) = Workspace::find_all() else {
    return out;
  };
  for ws in workspaces {
    if ws.entity_type.as_deref() != Some("project") {
      continue;
    }
    let mut keywords: Vec<String> = Vec::new();
    let name = ws.name.trim().to_lowercase();
    if name.len() >= 3 {
      keywords.push(name);
    }
    if let Some(slug) = ws.entity_key.clone() {
      let s = slug.replace('-', " ").trim().to_lowercase();
      if s.len() >= 3 {
        keywords.push(s);
      }
    }
    if let Some(desc) = ws.description.clone() {
      let d = desc.trim().to_lowercase();
      if d.len() >= 3 {
        keywords.push(d);
      }
    }
    if !keywords.is_empty() {
      out.push(ProjectKeyword {
        workspace: ws,
        keywords,
      });
    }
  }
  out
}

fn pick_target_workspace(body: &str, projects: &[ProjectKeyword]) -> Result<Workspace, Error> {
  let lower = body.to_lowercase();
  for p in projects {
    // Skip the catch-all bucket so it doesn't shadow real project hits.
    if p.workspace.entity_key.as_deref() == Some("saved-chats") {
      continue;
    }
    if p.keywords.iter().any(|k| lower.contains(k)) {
      return Ok(p.workspace.clone());
    }
  }
  // Fallback: a general "Saved Chats" auto-collection so users still see
  // every saved chat in their library even when it doesn't match a project.
  Workspace::upsert_auto_collection(
    "project",
    "saved-chats",
    "Saved Chats",
    Some("Significant chat threads automatically saved to your library."),
    Some("💬"),
  )
}
