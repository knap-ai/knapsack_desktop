//! Explicit local save of a participant from an already-authorized calendar row.
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};

pub fn save_participant(
  conn: &mut Connection, calendar_id: u64, participant: &str, owner: &str,
  authority: impl Fn() -> Result<(), String>,
) -> Result<String, String> {
  authority()?;
  let email = participant.trim().to_lowercase();
  if email.len() > 254 || email.chars().any(char::is_whitespace) || email.chars().any(char::is_control)
    || !email.split_once('@').is_some_and(|(local, domain)| !local.is_empty() && domain.contains('.') && !domain.contains('@'))
  { return Err("This participant has no usable email identity.".into()); }
  let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate).map_err(|_| "People Library is busy. Try again.")?;
  let row: Option<(String, String)> = tx.query_row(
    "SELECT COALESCE(attendees_json, '[]'), calendar_account_email FROM calendar_events WHERE id=?1", [calendar_id],
    |r| Ok((r.get(0)?, r.get(1)?)),
  ).optional().map_err(|_| "Could not read the saved meeting.")?;
  let (attendees, account) = row.ok_or("The saved meeting is unavailable.")?;
  // A saved event is not by itself proof that this active profile owns access.
  let authorized: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM user_connections uc JOIN users u ON u.id=uc.user_id JOIN connections c ON c.id=uc.connection_id WHERE lower(u.email)=lower(?1) AND c.scope IN ('google_calendar_read','microsoft_calendar_read') AND lower(COALESCE(NULLIF(uc.calendar_account_email,''),u.email))=lower(?2))", params![owner, account], |r| r.get(0)).map_err(|_| "Could not verify the meeting account.")?;
  if !authorized || email.eq_ignore_ascii_case(owner) || email.eq_ignore_ascii_case(&account) {
    return Err("This participant cannot be saved from the current meeting account.".into());
  }
  let attendees: Vec<serde_json::Value> = serde_json::from_str(&attendees).map_err(|_| "The saved participant list is unavailable.")?;
  let names: Vec<String> = attendees.iter().filter(|p| p["email"].as_str().is_some_and(|v| v.trim().eq_ignore_ascii_case(&email)))
    .filter_map(|p| p["name"].as_str().and_then(super::timeline::proper_name)).collect();
  if names.is_empty() || names.iter().any(|name| name != &names[0]) { return Err("This participant's identity needs clarification.".into()); }
  let count: i64 = tx.query_row("SELECT count(*) FROM workspaces WHERE entity_type='person' AND lower(trim(entity_key))=?1", [&email], |r| r.get(0)).map_err(|_| "Could not check People Library.")?;
  if count > 1 { return Err("More than one saved person matches this email. Review People Library first.".into()); }
  let existing = tx.query_row("SELECT uuid FROM workspaces WHERE entity_type='person' AND lower(trim(entity_key))=?1 ORDER BY id LIMIT 1", [&email], |r| r.get::<_, String>(0)).optional().map_err(|_| "Could not check People Library.")?;
  let uuid = if let Some(uuid) = existing { uuid } else {
    let uuid = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp();
    tx.execute("INSERT INTO workspaces(uuid,name,description,icon,created_at,updated_at,auto_curated,entity_type,entity_key,last_curated_at) VALUES(?1,?2,NULL,NULL,?3,?3,1,'person',?4,NULL)", params![uuid, names[0], now, email]).map_err(|_| "Could not save this person. Try again.")?;
    uuid
  };
  authority()?; // A profile switch rolls the uncommitted write back.
  tx.commit().map_err(|_| "Could not save this person. Try again.")?;
  Ok(uuid)
}

#[cfg(test)]
mod tests {
  use super::*;
  fn db() -> Connection {
    let c=Connection::open_in_memory().unwrap();
    c.execute_batch("CREATE TABLE users(id INTEGER,email TEXT); CREATE TABLE connections(id INTEGER,scope TEXT); CREATE TABLE user_connections(user_id INTEGER,connection_id INTEGER,calendar_account_email TEXT); CREATE TABLE calendar_events(id INTEGER,attendees_json TEXT,calendar_account_email TEXT); CREATE TABLE workspaces(id INTEGER PRIMARY KEY,uuid TEXT,name TEXT,description TEXT,icon TEXT,created_at INTEGER,updated_at INTEGER,auto_curated INTEGER,entity_type TEXT,entity_key TEXT,last_curated_at INTEGER); INSERT INTO users VALUES(1,'owner@example.test'); INSERT INTO connections VALUES(1,'google_calendar_read'); INSERT INTO user_connections VALUES(1,1,'calendar@example.test'); INSERT INTO calendar_events VALUES(1,'[{\"email\":\"person@example.test\",\"name\":\"Alex Rivera\"}]','calendar@example.test');").unwrap(); c
  }
  #[test] fn repeat_save_uses_verified_email_and_preserves_existing_name() {
    let mut c=db(); let a=save_participant(&mut c,1," Person@Example.Test ","owner@example.test",||Ok(())).unwrap();
    c.execute("UPDATE workspaces SET name='Preferred Name'",[]).unwrap();
    assert_eq!(a,save_participant(&mut c,1,"person@example.test","owner@example.test",||Ok(())).unwrap());
    assert_eq!(c.query_row("SELECT count(*) FROM workspaces",[],|r|r.get::<_,i64>(0)).unwrap(),1);
    assert_eq!(c.query_row("SELECT name FROM workspaces",[],|r|r.get::<_,String>(0)).unwrap(),"Preferred Name");
  }
  #[test] fn unlisted_self_and_unavailable_profile_fail_closed() {
    let mut c=db(); for (person,owner) in [("missing@example.test","owner@example.test"),("owner@example.test","owner@example.test"),("person@example.test","other@example.test")] {
      assert!(save_participant(&mut c,1,person,owner,||Ok(())).is_err());
    }
    assert!(save_participant(&mut c,1,"person@example.test","owner@example.test",||Err("Account changed".into())).is_err());
    assert_eq!(c.query_row("SELECT count(*) FROM workspaces",[],|r|r.get::<_,i64>(0)).unwrap(),0);
  }
  #[test] fn switch_before_commit_rolls_back() {
    let mut c=db(); let calls=std::cell::Cell::new(0);
    assert!(save_participant(&mut c,1,"person@example.test","owner@example.test",||{ calls.set(calls.get()+1); if calls.get()>1 {Err("Changed".into())} else {Ok(())} }).is_err());
    assert_eq!(c.query_row("SELECT count(*) FROM workspaces",[],|r|r.get::<_,i64>(0)).unwrap(),0);
  }
}
