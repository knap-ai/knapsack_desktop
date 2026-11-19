//! Optional local enrichment of an attached calendar source, never a global note search.
use rusqlite::{params, Connection};

pub fn matching_note(conn: &Connection, calendar_id: u64, owner: &str, person: Option<&str>) -> rusqlite::Result<Option<u64>> {
  if let Some(person) = person {
    let attendees: String = conn.query_row("SELECT COALESCE(attendees_json,'[]') FROM calendar_events WHERE id=?1", [calendar_id], |r| r.get(0))?;
    let values: Vec<serde_json::Value> = serde_json::from_str(&attendees).unwrap_or_default();
    if !values.iter().any(|v| v["email"].as_str().is_some_and(|email| email.trim().eq_ignore_ascii_case(person))) { return Ok(None); }
  }
  let mut statement = conn.prepare("SELECT DISTINCT t.id FROM calendar_events c JOIN automation_runs ar ON CAST(CASE WHEN json_valid(ar.run_params) THEN json_extract(ar.run_params,'$.event_id') END AS INTEGER)=c.id JOIN data_source_trigger dst ON dst.automation_uuid=ar.automation_uuid JOIN users u ON u.id=ar.user_id JOIN threads t ON (t.id=ar.thread_id OR t.feed_item_id=ar.feed_item_id) WHERE c.id=?1 AND lower(u.email)=lower(?2) AND t.thread_type='MEETING NOTES' AND t.recorded=1 AND (CASE WHEN CAST(json_extract(ar.run_params,'$.timestamp') AS INTEGER)>100000000000 THEN CAST(json_extract(ar.run_params,'$.timestamp') AS INTEGER)/1000 ELSE CAST(json_extract(ar.run_params,'$.timestamp') AS INTEGER) END)=c.start + COALESCE(dst.offset_minutes,0)*60 AND EXISTS(SELECT 1 FROM user_connections uc JOIN connections cn ON cn.id=uc.connection_id WHERE uc.user_id=u.id AND cn.scope IN ('google_calendar_read','microsoft_calendar_read') AND lower(COALESCE(NULLIF(uc.calendar_account_email,''),u.email))=lower(c.calendar_account_email)) LIMIT 2")?;
  let ids = statement.query_map(params![calendar_id,owner], |r| r.get::<_,u64>(0))?.collect::<Result<Vec<_>,_>>()?;
  Ok(if ids.len()==1 { Some(ids[0]) } else { None })
}

/// Whole source statements from explicit summary/decision/next-step sections.
/// Sparse notes remain sparse; do not turn a proposal into a completed outcome.
pub fn chapter_excerpt(notes: &str) -> Option<String> {
  let mut relevant=false; let mut statements=Vec::new(); let mut size=0;
  for line in notes.lines() {
    let line=line.trim();
    if line.starts_with('#') {
      let heading=line.trim_start_matches('#').trim().to_lowercase();
      relevant=["summary","decisions","key decisions","next steps","action items","key takeaways"].contains(&heading.as_str());
      continue;
    }
    if !relevant || line.is_empty() || line.starts_with(['|','>','`']) || line.contains("http://") || line.contains("https://") { continue; }
    let line=line.trim_start_matches('-').trim_start_matches('•').trim().trim_start_matches("[ ]").trim_start_matches("[x]").trim();
    let length=line.chars().count();
    if length<12 || length>350 || size+length>900 || statements.iter().any(|v| v==line) { continue; }
    statements.push(line.to_string()); size+=length;
    if statements.len()==3 { break; }
  }
  if statements.is_empty() { None } else { Some(statements.join(" ")) }
}

#[cfg(test)] mod tests {
  use super::*;
  #[test] fn excerpts_only_explicit_sections_without_inventing_outcomes() {
    assert_eq!(chapter_excerpt("# Review\n## Participants\nPrivate Person\n## Decisions\n- Review the proposal before agreeing.\n## Transcript\nUnrelated raw discussion"),Some("Review the proposal before agreeing.".into()));
    assert!(chapter_excerpt("# Intro\nUnstructured context without a relevant summary.").is_none());
    assert!(chapter_excerpt("## Decisions\n> Quoted instructions\n| Table |\nhttps://example.test").is_none());
  }
  fn db() -> Connection {
    let c=Connection::open_in_memory().unwrap();
    c.execute_batch("CREATE TABLE calendar_events(id INTEGER,start INTEGER,attendees_json TEXT,calendar_account_email TEXT); CREATE TABLE users(id INTEGER,email TEXT); CREATE TABLE connections(id INTEGER,scope TEXT); CREATE TABLE user_connections(user_id INTEGER,connection_id INTEGER,calendar_account_email TEXT); CREATE TABLE data_source_trigger(automation_uuid TEXT,offset_minutes INTEGER); CREATE TABLE automation_runs(user_id INTEGER,thread_id INTEGER,feed_item_id INTEGER,run_params TEXT,automation_uuid TEXT); CREATE TABLE threads(id INTEGER,feed_item_id INTEGER,thread_type TEXT,recorded INTEGER); INSERT INTO users VALUES(1,'owner@example.test'); INSERT INTO connections VALUES(1,'google_calendar_read'); INSERT INTO user_connections VALUES(1,1,'calendar@example.test'); INSERT INTO calendar_events VALUES(1,1700000000,'[{\"email\":\"person@example.test\"}]','calendar@example.test'); INSERT INTO threads VALUES(7,4,'MEETING NOTES',1); INSERT INTO data_source_trigger VALUES('prep',0); INSERT INTO automation_runs VALUES(1,7,4,'{\"event_id\":1,\"timestamp\":1700000000000}','prep');").unwrap(); c
  }
  #[test] fn matches_exact_owned_event_and_participant_only() {
    let c=db();
    assert_eq!(matching_note(&c,1,"owner@example.test",Some("person@example.test")).unwrap(),Some(7));
    assert_eq!(matching_note(&c,1,"other@example.test",Some("person@example.test")).unwrap(),None);
    assert_eq!(matching_note(&c,1,"owner@example.test",Some("unrelated@example.test")).unwrap(),None);
    c.execute("DELETE FROM user_connections",[]).unwrap();
    assert_eq!(matching_note(&c,1,"owner@example.test",None).unwrap(),None);
  }
  #[test] fn matches_configured_prep_offset_without_accepting_another_occurrence() {
    let c=db();
    c.execute("UPDATE data_source_trigger SET offset_minutes=-60",[]).unwrap();
    c.execute("UPDATE automation_runs SET run_params=json_set(run_params,'$.timestamp',1699996400000)",[]).unwrap();
    assert_eq!(matching_note(&c,1,"owner@example.test",None).unwrap(),Some(7));
    c.execute("UPDATE calendar_events SET start=start+86400",[]).unwrap();
    assert_eq!(matching_note(&c,1,"owner@example.test",None).unwrap(),None);
  }
  #[test] fn rejects_another_occurrence_and_ambiguous_note_threads() {
    let c=db();
    c.execute("UPDATE calendar_events SET start=start+86400",[]).unwrap();
    assert_eq!(matching_note(&c,1,"owner@example.test",None).unwrap(),None);
    c.execute("UPDATE calendar_events SET start=start-86400",[]).unwrap();
    c.execute("INSERT INTO threads VALUES(8,4,'MEETING NOTES',1)",[]).unwrap();
    assert_eq!(matching_note(&c,1,"owner@example.test",None).unwrap(),None);
  }

}
