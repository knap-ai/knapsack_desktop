//! Provider classification booleans only; no headers, credentials or message content.
use crate::clawd::loop_email::Signals;
use rusqlite::{params, Connection, OptionalExtension};
pub fn store(conn: &Connection, account: &str, uid: &str, s: Signals) -> rusqlite::Result<()> {
  conn.execute_batch("CREATE TABLE IF NOT EXISTS email_loop_signals(account TEXT NOT NULL,uid TEXT NOT NULL,junk INTEGER NOT NULL,promotions INTEGER NOT NULL,bulk INTEGER NOT NULL,PRIMARY KEY(account,uid))")?;
  conn.execute("INSERT INTO email_loop_signals VALUES(?1,?2,?3,?4,?5) ON CONFLICT(account,uid) DO UPDATE SET junk=excluded.junk,promotions=excluded.promotions,bulk=excluded.bulk",params![account.trim().to_lowercase(),uid,s.junk,s.promotions,s.bulk])?;
  Ok(())
}
pub fn read(conn: &Connection, account: &str, uid: &str) -> rusqlite::Result<Signals> {
  let exists: bool = conn.query_row(
    "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='email_loop_signals')",
    [],
    |r| r.get(0),
  )?;
  if !exists {
    return Ok(Signals::default());
  }
  Ok(
    conn
      .query_row(
        "SELECT junk,promotions,bulk FROM email_loop_signals WHERE account=?1 AND uid=?2",
        params![account.trim().to_lowercase(), uid],
        |r| {
          Ok(Signals {
            junk: r.get(0)?,
            promotions: r.get(1)?,
            bulk: r.get(2)?,
            ..Default::default()
          })
        },
      )
      .optional()?
      .unwrap_or_default(),
  )
}
pub fn sent_history(
  conn: &Connection,
  account: &str,
  thread: &str,
  before: u64,
) -> rusqlite::Result<bool> {
  let mut stmt=conn.prepare("SELECT sender FROM emails WHERE account_email=?1 AND thread_id=?2 AND date<?3 AND COALESCE(is_deleted,0)=0 ORDER BY date DESC LIMIT 20")?;
  let senders = stmt
    .query_map(params![account, thread, before], |r| r.get::<_, String>(0))?
    .collect::<rusqlite::Result<Vec<_>>>()?;
  Ok(senders.iter().any(|sender| {
    mailparse::addrparse(sender)
      .ok()
      .and_then(|s| s.extract_single_info())
      .is_some_and(|s| {
        s.addr
          .eq_ignore_ascii_case(account.strip_prefix("microsoft:").unwrap_or(account))
      })
  }))
}
#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn history_is_read_only_account_bound_and_before_current_message() {
    let c = Connection::open_in_memory().unwrap();
    c.execute_batch("CREATE TABLE emails(account_email TEXT,thread_id TEXT,date INTEGER,sender TEXT,is_deleted INTEGER); INSERT INTO emails VALUES('a@example.test','same',1,'Owner <a@example.test>',0); INSERT INTO emails VALUES('b@example.test','same',1,'a@example.test',0);").unwrap();
    assert!(sent_history(&c, "a@example.test", "same", 2).unwrap());
    assert!(!sent_history(&c, "b@example.test", "same", 2).unwrap());
    assert!(!sent_history(&c, "a@example.test", "same", 1).unwrap());
  }
  #[test]
  fn metadata_is_account_bound_and_missing_is_unknown() {
    let c = Connection::open_in_memory().unwrap();
    assert!(!read(&c, "a@example.test", "id").unwrap().junk);
    store(
      &c,
      "a@example.test",
      "id",
      Signals {
        junk: true,
        ..Default::default()
      },
    )
    .unwrap();
    assert!(read(&c, "A@example.test", "id").unwrap().junk);
    assert!(!read(&c, "b@example.test", "id").unwrap().junk);
  }
}
