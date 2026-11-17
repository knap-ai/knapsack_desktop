//! Read-only source metadata for the relationship story. Never reads message bodies,
//! calls a provider, changes a collection, or substitutes import time for event time.
use std::collections::BTreeMap;
use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;

pub struct SavedSource {
  pub document_id: u64,
  pub kind: Option<String>,
  pub source_id: Option<String>,
  pub path: Option<String>,
  pub added_at: Option<i64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineSource {
  pub document_id: u64,
  pub source_id: Option<String>,
  pub kind: String,
  pub occurred_at: Option<i64>,
  pub date_kind: String,
  pub url: Option<String>,
  pub account: Option<String>,
  pub available: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TimelineData {
  pub display_name: Option<String>,
  pub sources: Vec<TimelineSource>,
  pub truncated: bool,
}

pub fn proper_name(value: &str) -> Option<String> {
  let value = value.trim().trim_matches('"').trim();
  let candidate = if let Some((prefix, suffix)) = value.split_once('<') {
    if suffix.contains('@') && suffix.ends_with('>') { prefix.trim() } else { value }
  } else { value };
  if candidate.is_empty() || candidate.contains('@') || candidate.chars().count() > 120
    || candidate.chars().any(char::is_control) || !candidate.chars().any(char::is_alphabetic)
    || candidate.eq_ignore_ascii_case("Unnamed contact") {
    None
  } else { Some(candidate.to_string()) }
}

fn header_name(header: &str, email: &str) -> Option<String> {
  let mut quote = false;
  let mut escaped = false;
  let mut angle = false;
  let mut start = 0;
  let mut pieces = Vec::new();
  for (index, ch) in header.char_indices() {
    if escaped { escaped = false; continue; }
    match ch {
      '\\' if quote => escaped = true,
      '"' => quote = !quote,
      '<' if !quote => angle = true,
      '>' if !quote => angle = false,
      ',' if !quote && !angle => { pieces.push(&header[start..index]); start = index + 1; }
      _ => (),
    }
  }
  pieces.push(&header[start..]);
  for piece in pieces {
    if let (Some(open), Some(close)) = (piece.find('<'), piece.rfind('>')) {
      if close > open && piece[open + 1..close].trim().eq_ignore_ascii_case(email) {
        if let Some(name) = proper_name(&piece[..open]) { return Some(name); }
      }
    }
  }
  None
}

fn timestamp(value: Option<i64>) -> Option<i64> { value.filter(|value| *value > 0 && *value < 32_503_680_000) }

pub fn project_sources(conn: &Connection, entity_type: &str, entity_key: &str, saved_name: &str,
  documents: &[SavedSource]) -> rusqlite::Result<TimelineData> {
  let mut sources = Vec::new();
  let mut names: BTreeMap<String, usize> = BTreeMap::new();
  for doc in documents.iter().take(2000) {
    let kind = doc.kind.as_deref().unwrap_or("manual");
    let mut source = TimelineSource { document_id: doc.document_id, source_id: doc.source_id.clone(),
      kind: kind.to_string(), occurred_at: None, date_kind: "unknown".into(), url: None,
      account: None, available: false };
    let id = doc.source_id.as_deref().and_then(|value| value.parse::<u64>().ok());
    match (kind, id) {
      ("email", Some(id)) => {
        let row = conn.query_row("SELECT date, sender, recipient, cc, account_email, email_uid, thread_id FROM emails WHERE id = ?1", [id], |row| {
          Ok((row.get::<_, Option<i64>>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?,
            row.get::<_, String>(3)?, row.get::<_, String>(4)?, row.get::<_, String>(5)?, row.get::<_, Option<String>>(6)?))
        }).optional()?;
        if let Some((date, sender, recipient, cc, account, uid, thread)) = row {
          source.available = true;
          source.occurred_at = timestamp(date);
          source.date_kind = "occurred".into();
          source.account = Some(account.clone());
          if entity_type == "person" {
            for header in [&sender, &recipient, &cc] {
              if let Some(name) = header_name(header, entity_key) { *names.entry(name).or_default() += 1; }
            }
          }
          if let Some(mailbox) = account.strip_prefix("microsoft:") {
            if !mailbox.is_empty() && !uid.is_empty() {
              source.url = Some(format!("https://outlook.office.com/mail/deeplink/read/{}?login_hint={}", urlencoding::encode(&uid), urlencoding::encode(mailbox)));
            }
          } else if account.contains('@') && !uid.is_empty() {
            let thread = thread.filter(|value| !value.is_empty()).unwrap_or(uid);
            source.url = Some(format!("https://mail.google.com/mail/?authuser={}#all/{}", urlencoding::encode(&account), urlencoding::encode(&thread)));
          }
        }
      }
      ("calendar", Some(id)) => {
        let row = conn.query_row("SELECT start, attendees_json, calendar_account_email FROM calendar_events WHERE id = ?1", [id], |row| {
          Ok((row.get::<_, Option<i64>>(0)?, row.get::<_, Option<String>>(1)?, row.get::<_, Option<String>>(2)?))
        }).optional()?;
        if let Some((date, attendees, account)) = row {
          source.available = true;
          source.occurred_at = timestamp(date);
          source.date_kind = "occurred".into();
          source.account = account;
          // Historical calendar rows do not reliably identify their provider.
          // Open the exact saved event natively rather than invent a Google URL.
          if entity_type == "person" {
            if let Some(serde_json::Value::Array(attendees)) = attendees.and_then(|value| serde_json::from_str(&value).ok()) {
              for attendee in attendees {
                if attendee["email"].as_str().is_some_and(|email| email.eq_ignore_ascii_case(entity_key)) {
                  if let Some(name) = attendee["name"].as_str().and_then(proper_name) { *names.entry(name).or_default() += 1; }
                }
              }
            }
          }
        }
      }
      _ => {
        // A manually added document has an added date, not an inferred event date.
        if matches!(kind, "manual" | "local_file") {
          source.occurred_at = timestamp(doc.added_at);
          source.date_kind = "added".into();
        }
        source.url = doc.path.clone();
        source.available = source.url.is_some();
      }
    }
    sources.push(source);
  }
  let display_name = if entity_type == "person" {
    proper_name(saved_name).or_else(|| names.into_iter().max_by(|a, b| a.1.cmp(&b.1).then_with(|| b.0.cmp(&a.0))).map(|entry| entry.0))
  } else { None };
  Ok(TimelineData { display_name, sources, truncated: documents.len() > 2000 })
}

#[cfg(test)]
mod tests {
  use super::*;
  fn db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch("CREATE TABLE emails(id INTEGER, date INTEGER, sender TEXT, recipient TEXT, cc TEXT, account_email TEXT, email_uid TEXT, thread_id TEXT); CREATE TABLE calendar_events(id INTEGER, start INTEGER, attendees_json TEXT, calendar_account_email TEXT);").unwrap();
    conn
  }
  fn source(kind: &str, id: &str) -> SavedSource { SavedSource { document_id: 7, kind: Some(kind.into()), source_id: Some(id.into()), path: None, added_at: Some(9999) } }
  #[test]
  fn resolves_source_date_and_exact_person_without_email_or_import_time_as_title() {
    let conn = db();
    conn.execute("INSERT INTO emails VALUES(1, 1000, ?1, '', '', 'owner@example.test', 'message', 'thread')", ["\"Rivera, Alberto\" <alberto@example.test>, Wrong <other@example.test>"]).unwrap();
    let result = project_sources(&conn, "person", "alberto@example.test", "alberto@example.test", &[source("email", "1")]).unwrap();
    assert_eq!(result.display_name.as_deref(), Some("Rivera, Alberto"));
    assert_eq!(result.sources[0].occurred_at, Some(1000));
    assert!(result.sources[0].url.as_deref().unwrap().contains("authuser=owner%40example.test#all/thread"));
    let unknown = project_sources(&conn, "person", "other@example.test", "other@example.test", &[source("email", "99")]).unwrap();
    assert!(unknown.display_name.is_none());
    assert!(unknown.sources[0].occurred_at.is_none());
    assert!(!unknown.sources[0].available);
  }
  #[test]
  fn calendar_names_are_exact_and_projects_use_the_same_evidence_projection() {
    let conn = db();
    conn.execute("INSERT INTO calendar_events VALUES(1, 2000, ?1, 'personal@example.test')", [r#"[{"email":"alberto@example.test","name":"Alberto Rivera"},{"email":"other@example.test","name":"Wrong Person"}]"#]).unwrap();
    let docs = [source("calendar", "1")];
    let person = project_sources(&conn, "person", "alberto@example.test", "", &docs).unwrap();
    assert_eq!(person.display_name.as_deref(), Some("Alberto Rivera"));
    assert_eq!(person.sources[0].occurred_at, Some(2000));
    assert!(person.sources[0].url.is_none());
    let project = project_sources(&conn, "project", "partnership", "Partnership", &docs).unwrap();
    assert_eq!(project.sources.len(), 1);
    assert!(project.display_name.is_none());
    assert_eq!(proper_name("alberto@example.test"), None);
    assert_eq!(proper_name("Alberto Rivera"), Some("Alberto Rivera".into()));
  }
  #[test]
  fn errors_are_not_empty_success_and_no_sources_means_no_unscoped_query() {
    let conn = Connection::open_in_memory().unwrap();
    assert!(project_sources(&conn, "person", "a@example.test", "", &[]).unwrap().sources.is_empty());
    assert!(project_sources(&conn, "person", "a@example.test", "", &[source("email", "1")]).is_err());
  }
}
