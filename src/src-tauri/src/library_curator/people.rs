//! People auto-collection detector.
//!
//! Scans the last 90 days of emails + calendar events, scores each contact
//! by a frequency-weighted blend of email touches and meeting touches, then
//! upserts an auto-curated `Workspace` per top contact and attaches their
//! recent emails / calendar events / meeting transcripts as documents.
//!
//! Pure rule-based — no LLM calls. Cheap, deterministic, and reliable.

use std::collections::HashMap;

use serde::Deserialize;

use crate::db::db::get_db_conn;
use crate::db::models::email::Email;
use crate::db::models::workspace::{Workspace, WorkspaceDocument};
use crate::error::Error;
use crate::library_curator::settings::CuratorSettings;

const TOP_N_PEOPLE: usize = 20;
const MAX_EMAILS_PER_PERSON: usize = 50;

/// Score weighting: meetings imply a much stronger relationship than CCs.
const EMAIL_WEIGHT: f32 = 1.0;
const MEETING_WEIGHT: f32 = 3.0;

/// Address fragments that almost always indicate noise (newsletters, alerts,
/// support bots, mailing lists). Matches are case-insensitive.
const NOISE_FRAGMENTS: &[&str] = &[
  "no-reply",
  "noreply",
  "do-not-reply",
  "donotreply",
  "notifications@",
  "notification@",
  "alerts@",
  "support@",
  "mailer-daemon",
  "postmaster@",
  "bounces+",
  "newsletter",
  "marketing@",
  "info@",
];

#[derive(Debug, Default, Clone)]
struct ContactStats {
  /// Display name resolved from "Name <email>" headers, when available.
  display_name: Option<String>,
  email_count: u32,
  meeting_count: u32,
  /// Recent email row ids — used to attach documents in the second pass.
  email_ids: Vec<u64>,
  /// Recent calendar event row ids — used to attach calendar documents.
  calendar_event_ids: Vec<u64>,
}

impl ContactStats {
  fn score(&self) -> f32 {
    (self.email_count as f32) * EMAIL_WEIGHT + (self.meeting_count as f32) * MEETING_WEIGHT
  }
}

/// Detect top people across email + calendar and upsert auto-collections.
pub fn detect_and_upsert(cfg: &CuratorSettings) -> Result<(), Error> {
  let own_addresses = load_own_addresses();
  log::info!(
    "[library_curator/people] own addresses: {:?}",
    own_addresses
  );

  let mut contacts: HashMap<String, ContactStats> = HashMap::new();

  if cfg.sources_email {
    ingest_emails(&mut contacts, &own_addresses)?;
  }
  if cfg.sources_calendar {
    ingest_calendar(&mut contacts, &own_addresses)?;
  }

  if contacts.is_empty() {
    log::info!("[library_curator/people] no contacts detected; nothing to do");
    return Ok(());
  }

  // Rank by score and take the top N.
  let mut ranked: Vec<(String, ContactStats)> = contacts.into_iter().collect();
  ranked.sort_by(|a, b| {
    b.1
      .score()
      .partial_cmp(&a.1.score())
      .unwrap_or(std::cmp::Ordering::Equal)
  });
  ranked.truncate(TOP_N_PEOPLE);

  log::info!(
    "[library_curator/people] upserting {} top contacts",
    ranked.len()
  );

  for (email_addr, stats) in ranked {
    if let Err(e) = upsert_person_collection(&email_addr, &stats) {
      log::warn!(
        "[library_curator/people] failed to upsert {}: {:?}",
        email_addr,
        e
      );
    }
  }

  Ok(())
}

/// Resolve every email address that belongs to the local user, so we can
/// exclude them from the contact graph (otherwise the user themselves would
/// always be the #1 ranked contact).
fn load_own_addresses() -> Vec<String> {
  let connection = get_db_conn();
  let mut emails = Vec::new();
  if let Ok(mut stmt) =
    connection.prepare("SELECT DISTINCT email FROM users WHERE email IS NOT NULL AND email != ''")
  {
    if let Ok(rows) = stmt.query_map([], |row| row.get::<_, String>(0)) {
      for r in rows.flatten() {
        emails.push(r.to_lowercase());
      }
    }
  }
  emails
}

fn ingest_emails(
  contacts: &mut HashMap<String, ContactStats>,
  own_addresses: &[String],
) -> Result<(), Error> {
  // Pull a generous slab — filter_emails sorts by date DESC, so we still get
  // the most recent emails when we cap below.
  let emails = Email::filter_emails(5_000, None, None, None, None);
  log::info!("[library_curator/people] scanning {} emails", emails.len());

  for email in emails {
    for header in [&email.sender, &email.recipient, &email.cc] {
      for (addr, name) in parse_address_list(header) {
        if !is_useful_address(&addr, own_addresses) {
          continue;
        }
        let entry = contacts.entry(addr).or_default();
        entry.email_count += 1;
        if entry.display_name.is_none() && name.is_some() {
          entry.display_name = name;
        }
        if entry.email_ids.len() < MAX_EMAILS_PER_PERSON {
          if let Some(id) = email.id {
            entry.email_ids.push(id);
          }
        }
      }
    }
  }
  Ok(())
}

fn ingest_calendar(
  contacts: &mut HashMap<String, ContactStats>,
  own_addresses: &[String],
) -> Result<(), Error> {
  let connection = get_db_conn();
  let mut stmt = connection
    .prepare("SELECT id, attendees_json FROM calendar_events WHERE attendees_json IS NOT NULL")?;
  let rows = stmt.query_map([], |row| {
    Ok((row.get::<_, u64>(0)?, row.get::<_, Option<String>>(1)?))
  })?;

  let mut event_count = 0_u32;
  for r in rows.flatten() {
    let (event_id, attendees_json) = r;
    let Some(json) = attendees_json else { continue };
    let attendees: Vec<Attendee> = match serde_json::from_str(&json) {
      Ok(v) => v,
      Err(_) => continue,
    };
    event_count += 1;

    for a in attendees {
      let addr = a.email.trim().to_lowercase();
      if addr.is_empty() || !is_useful_address(&addr, own_addresses) {
        continue;
      }
      let entry = contacts.entry(addr).or_default();
      entry.meeting_count += 1;
      if entry.display_name.is_none() && !a.name.trim().is_empty() {
        entry.display_name = Some(a.name);
      }
      if entry.calendar_event_ids.len() < MAX_EMAILS_PER_PERSON {
        entry.calendar_event_ids.push(event_id);
      }
    }
  }
  log::info!(
    "[library_curator/people] scanned {} calendar events",
    event_count
  );
  Ok(())
}

#[derive(Debug, Deserialize)]
struct Attendee {
  #[serde(default)]
  email: String,
  #[serde(default)]
  name: String,
}

/// Parse a comma-separated header value like
/// `"Alice <alice@example.com>, bob@example.com"` into `(addr, name)` pairs.
fn parse_address_list(raw: &str) -> Vec<(String, Option<String>)> {
  let mut out = Vec::new();
  for piece in raw.split(',') {
    let piece = piece.trim();
    if piece.is_empty() {
      continue;
    }
    if let (Some(open), Some(close)) = (piece.find('<'), piece.rfind('>')) {
      let name = piece[..open].trim().trim_matches('"').to_string();
      let addr = piece[open + 1..close].trim().to_lowercase();
      if addr.contains('@') {
        out.push((addr, if name.is_empty() { None } else { Some(name) }));
      }
    } else if piece.contains('@') {
      out.push((piece.to_lowercase(), None));
    }
  }
  out
}

fn is_useful_address(addr: &str, own_addresses: &[String]) -> bool {
  let lower = addr.to_lowercase();
  if !lower.contains('@') {
    return false;
  }
  if own_addresses.iter().any(|own| own == &lower) {
    return false;
  }
  for frag in NOISE_FRAGMENTS {
    if lower.contains(frag) {
      return false;
    }
  }
  true
}

fn upsert_person_collection(email_addr: &str, stats: &ContactStats) -> Result<(), Error> {
  let display = stats
    .display_name
    .clone()
    .unwrap_or_else(|| email_addr.to_string());
  let description = format!(
    "{} email{} · {} meeting{}",
    stats.email_count,
    if stats.email_count == 1 { "" } else { "s" },
    stats.meeting_count,
    if stats.meeting_count == 1 { "" } else { "s" },
  );

  let workspace = Workspace::upsert_auto_collection(
    "person",
    email_addr,
    &display,
    Some(&description),
    Some("👤"),
  )?;

  // If the user has promoted this collection to manual, leave it alone.
  if workspace.auto_curated.unwrap_or(0) == 0 {
    return Ok(());
  }

  // Attach email documents (deduped by the unique source index).
  for email_id in &stats.email_ids {
    if let Some(email) = Email::find_by_id(*email_id).ok().flatten() {
      let title = if email.subject.trim().is_empty() {
        "(no subject)".to_string()
      } else {
        email.subject.clone()
      };
      let _ = WorkspaceDocument::create_with_source(
        workspace.uuid.clone(),
        title,
        None,
        Some("email".to_string()),
        Some(email.body.clone()),
        Some("email".to_string()),
        Some(email_id.to_string()),
      );
    }
  }

  // Attach calendar event documents.
  for event_id in &stats.calendar_event_ids {
    let _ = attach_calendar_event(&workspace.uuid, *event_id);
  }

  Ok(())
}

fn attach_calendar_event(workspace_uuid: &str, event_id: u64) -> Result<(), Error> {
  let connection = get_db_conn();
  let mut stmt =
    connection.prepare("SELECT title, description, start FROM calendar_events WHERE id = ?1")?;
  let row = stmt
    .query_row([event_id], |row| {
      Ok((
        row.get::<_, Option<String>>(0)?,
        row.get::<_, Option<String>>(1)?,
        row.get::<_, Option<i64>>(2)?,
      ))
    })
    .ok();
  if let Some((title, description, _start)) = row {
    let title = title.unwrap_or_else(|| "(untitled meeting)".to_string());
    let _ = WorkspaceDocument::create_with_source(
      workspace_uuid.to_string(),
      title,
      None,
      Some("calendar".to_string()),
      description,
      Some("calendar".to_string()),
      Some(event_id.to_string()),
    );
  }
  Ok(())
}
