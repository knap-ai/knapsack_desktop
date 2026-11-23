//! Desktop-only immutable recovered copies. Never writes canonical notes/transcripts.
use super::recovered_source as core;
use super::recovered_source::{ProtocolError, Scope};
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  io::Read,
  path::{Component, Path},
};
const LIMIT: usize = 2 * 1024 * 1024;
#[derive(Debug, Clone, PartialEq)]
pub enum Error {
  Owner,
  Unavailable,
  Conflict,
}
type Result<T> = std::result::Result<T, Error>;
fn digest(b: impl AsRef<[u8]>) -> String {
  format!("{:x}", Sha256::digest(b.as_ref()))
}
fn map(e: ProtocolError) -> Error {
  match e {
    ProtocolError::Owner => Error::Owner,
    _ => Error::Unavailable,
  }
}
fn no_link(p: &Path) -> Result<()> {
  match std::fs::symlink_metadata(p) {
    Ok(m) if m.file_type().is_symlink() => Err(Error::Unavailable),
    Ok(m) => {
      #[cfg(unix)]
      {
        use std::os::unix::fs::MetadataExt;
        if m.is_file() && m.nlink() != 1 {
          return Err(Error::Unavailable);
        }
      }
      Ok(())
    }
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
    Err(_) => Err(Error::Unavailable),
  }
}
fn owner(home: &Path, c: &Connection, id: u64, uuid: &str, email: &str) -> Result<Scope> {
  let scope = core::scope_at(home, c, id).map_err(map)?;
  if scope.owner_uuid != uuid || scope.owner_email != email.trim().to_lowercase() {
    return Err(Error::Owner);
  }
  Ok(scope)
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptSource {
  pub id: u64,
  pub filename: String,
  pub hash: String,
  pub content: String,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prepared {
  pub scope: Scope,
  pub snapshot: String,
  pub saved_notes: Option<String>,
  pub transcript: TranscriptSource,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Copy {
  pub version: u64,
  pub body: String,
  pub saved_manual: Option<String>,
  pub draft_manual: String,
  pub transcript_id: u64,
  pub transcript_filename: String,
  pub transcript_hash: String,
  pub source_snapshot: String,
  pub restored_from: Option<u64>,
  pub body_hash: String,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Save {
  pub request_id: String,
  pub thread_id: u64,
  pub expected_uuid: String,
  pub expected_email: String,
  pub snapshot: String,
  pub body: String,
  pub draft_manual: String,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Receipt {
  pub scope: Scope,
  pub request_id: String,
  pub version: u64,
  pub body_hash: String,
  pub desktop_only: bool,
}
pub fn prepare(home: &Path, c: &Connection, id: u64, uuid: &str, email: &str) -> Result<Prepared> {
  let scope = owner(home, c, id, uuid, email)?;
  let notes = core::snapshot_at(home, c, id).map_err(map)?;
  let mut q = c
    .prepare("SELECT id,filename FROM transcripts WHERE thread_id=?1")
    .map_err(|_| Error::Unavailable)?;
  let rows = q
    .query_map([id], |r| Ok((r.get::<_, u64>(0)?, r.get::<_, String>(1)?)))
    .map_err(|_| Error::Unavailable)?
    .collect::<std::result::Result<Vec<_>, _>>()
    .map_err(|_| Error::Unavailable)?;
  if rows.len() != 1 {
    return Err(Error::Unavailable);
  }
  let (tid, name) = &rows[0];
  let mut parts = Path::new(name).components();
  if !name.is_ascii()
    || name.chars().any(char::is_control)
    || name.contains(['\\', '/', ':'])
    || !matches!(
      (parts.next(), parts.next()),
      (Some(Component::Normal(_)), None)
    )
  {
    return Err(Error::Unavailable);
  }
  let count: i64 = c
    .query_row(
      "SELECT count(*) FROM transcripts WHERE filename=?1 COLLATE NOCASE",
      [name],
      |r| r.get(0),
    )
    .map_err(|_| Error::Unavailable)?;
  if count != 1 {
    return Err(Error::Unavailable);
  }
  let folder = home.join(".knapsack/transcripts");
  let path = folder.join(name);
  for p in [
    home.to_owned(),
    home.join(".knapsack"),
    folder,
    path.clone(),
  ] {
    no_link(&p)?
  }
  let f = std::fs::File::open(&path).map_err(|_| Error::Unavailable)?;
  let before = f.metadata().map_err(|_| Error::Unavailable)?;
  if !before.is_file() || before.len() > LIMIT as u64 {
    return Err(Error::Unavailable);
  }
  let mut bytes = Vec::new();
  f.take(LIMIT as u64 + 1)
    .read_to_end(&mut bytes)
    .map_err(|_| Error::Unavailable)?;
  let after = std::fs::metadata(&path).map_err(|_| Error::Unavailable)?;
  if bytes.len() > LIMIT
    || before.len() != after.len()
    || before.modified().ok() != after.modified().ok()
  {
    return Err(Error::Conflict);
  }
  let content = String::from_utf8(bytes).map_err(|_| Error::Unavailable)?;
  if content.trim().is_empty() {
    return Err(Error::Unavailable);
  }
  let transcript = TranscriptSource {
    id: *tid,
    filename: name.clone(),
    hash: digest(content.as_bytes()),
    content,
  };
  let snapshot = digest(
    serde_json::to_vec(&(
      &notes.snapshot_revision,
      tid,
      name,
      &transcript.hash,
      format!("{:?}", after.modified().map_err(|_| Error::Unavailable)?),
    ))
    .map_err(|_| Error::Unavailable)?,
  );
  if core::snapshot_at(home, c, id)
    .map_err(map)?
    .snapshot_revision
    != notes.snapshot_revision
  {
    return Err(Error::Conflict);
  }
  owner(home, c, id, uuid, email)?;
  Ok(Prepared {
    scope,
    snapshot,
    saved_notes: notes.notes,
    transcript,
  })
}
fn folder(home: &Path, scope: &Scope, create: bool) -> Result<std::path::PathBuf> {
  no_link(home)?;
  // macOS /var and /tmp aliases must not defeat SQLite NOFOLLOW. Resolve the
  // already-verified home once; still reject every recovery-owned symlink.
  let canonical_home = home.canonicalize().map_err(|_| Error::Unavailable)?;
  let home = canonical_home.as_path();
  let root = home.join(".knapsack");
  let base = root.join("desktop-recovered-copies");
  let dir = base.join(digest(
    serde_json::to_vec(&(&scope.owner_uuid, &scope.owner_email)).map_err(|_| Error::Unavailable)?,
  ));
  for p in [home, &root, &base, &dir] {
    no_link(p)?;
    if create && !p.exists() {
      let mut b = std::fs::DirBuilder::new();
      #[cfg(unix)]
      {
        use std::os::unix::fs::DirBuilderExt;
        b.mode(0o700);
      }
      match b.create(p) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
          no_link(p)?;
        }
        Err(_) => return Err(Error::Unavailable),
      }
      #[cfg(unix)]
      {
        if let Some(parent) = p.parent() {
          std::fs::File::open(parent)
            .and_then(|f| f.sync_all())
            .map_err(|_| Error::Unavailable)?;
        }
      }
    }
    if p.exists() && !p.is_dir() {
      return Err(Error::Unavailable);
    }
  }
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    for p in [&base, &dir] {
      if p.exists()
        && std::fs::metadata(p)
          .map_err(|_| Error::Unavailable)?
          .permissions()
          .mode()
          & 0o077
          != 0
      {
        return Err(Error::Unavailable);
      }
    }
  }
  Ok(dir)
}
fn store(home: &Path, scope: &Scope, create: bool) -> Result<Option<Connection>> {
  let dir = folder(home, scope, create)?;
  let path = dir.join("copies-v1.sqlite3");
  no_link(&path)?;
  if !path.exists() {
    if !create {
      return Ok(None);
    }
    let mut o = std::fs::OpenOptions::new();
    o.write(true).create_new(true);
    #[cfg(unix)]
    {
      use std::os::unix::fs::OpenOptionsExt;
      o.mode(0o600);
    }
    match o.open(&path) {
      Ok(f) => f.sync_all().map_err(|_| Error::Unavailable)?,
      Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {}
      Err(_) => return Err(Error::Unavailable),
    }
  }
  no_link(&path)?;
  #[cfg(unix)]
  {
    use std::os::unix::fs::PermissionsExt;
    if std::fs::metadata(&path)
      .map_err(|_| Error::Unavailable)?
      .permissions()
      .mode()
      & 0o077
      != 0
    {
      return Err(Error::Unavailable);
    }
  }
  let flags = if create {
    rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_NOFOLLOW
  } else {
    rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NOFOLLOW
  };
  let c = Connection::open_with_flags(&path, flags).map_err(|_| Error::Unavailable)?;
  c.busy_timeout(std::time::Duration::from_secs(3))
    .map_err(|_| Error::Unavailable)?;
  let detected: i64 = c
    .query_row("PRAGMA user_version", [], |r| r.get(0))
    .map_err(|_| Error::Unavailable)?;
  if detected != 0 && detected != 1 {
    return Err(Error::Unavailable);
  }
  let journal: String = c
    .query_row("PRAGMA journal_mode", [], |r| r.get(0))
    .map_err(|_| Error::Unavailable)?;
  if journal != "delete" {
    return Err(Error::Unavailable);
  }
  if create {
    // Connection-local durability only; never rewrite an unknown store's journal mode.
    c.execute_batch("PRAGMA synchronous=EXTRA;")
      .map_err(|_| Error::Unavailable)?;
    let tx = rusqlite::Transaction::new_unchecked(&c, TransactionBehavior::Immediate)
      .map_err(|_| Error::Unavailable)?;
    let version: i64 = tx
      .query_row("PRAGMA user_version", [], |r| r.get(0))
      .map_err(|_| Error::Unavailable)?;
    if version == 0 {
      tx.execute_batch("CREATE TABLE copies(owner TEXT NOT NULL,meeting INTEGER NOT NULL,version INTEGER NOT NULL,request TEXT NOT NULL,payload_hash TEXT NOT NULL,document TEXT NOT NULL,PRIMARY KEY(owner,meeting,version),UNIQUE(owner,request));PRAGMA user_version=1;").map_err(|_|Error::Unavailable)?;
    } else if version != 1 {
      return Err(Error::Unavailable);
    }
    tx.commit().map_err(|_| Error::Unavailable)?;
  }
  if c
    .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
    .map_err(|_| Error::Unavailable)?
    != 1
  {
    return Err(Error::Unavailable);
  }
  Ok(Some(c))
}
fn intact(copy: &Copy) -> Result<()> {
  if copy.version == 0
    || copy.body_hash != digest(&copy.body)
    || copy.body.len() > LIMIT
    || copy.draft_manual.len() > LIMIT
    || copy.saved_manual.as_ref().is_some_and(|s| s.len() > LIMIT)
  {
    return Err(Error::Unavailable);
  }
  Ok(())
}
pub fn list(home: &Path, c: &Connection, id: u64, uuid: &str, email: &str) -> Result<Vec<Copy>> {
  let scope = owner(home, c, id, uuid, email)?;
  let Some(db) = store(home, &scope, false)? else {
    return Ok(vec![]);
  };
  let mut q = db
    .prepare(
      "SELECT version,document FROM copies WHERE owner=?1 AND meeting=?2 ORDER BY version DESC",
    )
    .map_err(|_| Error::Unavailable)?;
  let rows = q
    .query_map(params![scope.owner_uuid, id], |r| {
      Ok((r.get::<_, u64>(0)?, r.get::<_, String>(1)?))
    })
    .map_err(|_| Error::Unavailable)?
    .collect::<std::result::Result<Vec<_>, _>>()
    .map_err(|_| Error::Unavailable)?;
  let values = rows
    .into_iter()
    .map(|(version, r)| {
      let value: Copy = serde_json::from_str(&r).map_err(|_| Error::Unavailable)?;
      intact(&value)?;
      if value.version != version {
        return Err(Error::Unavailable);
      }
      Ok(value)
    })
    .collect::<Result<Vec<_>>>()?;
  owner(home, c, id, uuid, email)?;
  Ok(values)
}
fn append(
  home: &Path,
  c: &Connection,
  scope: &Scope,
  request: &str,
  payload: &str,
  mut copy: Copy,
  recheck: impl Fn() -> Result<()>,
) -> Result<Receipt> {
  uuid::Uuid::parse_str(request).map_err(|_| Error::Conflict)?;
  if copy.body.trim().is_empty() || copy.body.len() > LIMIT || copy.draft_manual.len() > LIMIT {
    return Err(Error::Unavailable);
  }
  let mut db = store(home, scope, true)?.ok_or(Error::Unavailable)?;
  let tx = db
    .transaction_with_behavior(TransactionBehavior::Immediate)
    .map_err(|_| Error::Unavailable)?;
  let previous: Option<(u64, String, String)> = tx
    .query_row(
      "SELECT meeting,payload_hash,document FROM copies WHERE owner=?1 AND request=?2",
      params![scope.owner_uuid, request],
      |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    )
    .optional()
    .map_err(|_| Error::Unavailable)?;
  if let Some((meeting, hash, document)) = previous {
    if meeting != scope.thread_id || hash != payload {
      return Err(Error::Conflict);
    }
    let old: Copy = serde_json::from_str(&document).map_err(|_| Error::Unavailable)?;
    intact(&old)?;
    owner(
      home,
      c,
      scope.thread_id,
      &scope.owner_uuid,
      &scope.owner_email,
    )?;
    return Ok(Receipt {
      scope: scope.clone(),
      request_id: request.into(),
      version: old.version,
      body_hash: old.body_hash,
      desktop_only: true,
    });
  }
  recheck()?;
  let version: u64 = tx
    .query_row(
      "SELECT COALESCE(MAX(version),0)+1 FROM copies WHERE owner=?1 AND meeting=?2",
      params![scope.owner_uuid, scope.thread_id],
      |r| r.get(0),
    )
    .map_err(|_| Error::Unavailable)?;
  copy.version = version;
  intact(&copy)?;
  tx.execute(
    "INSERT INTO copies VALUES(?1,?2,?3,?4,?5,?6)",
    params![
      scope.owner_uuid,
      scope.thread_id,
      version,
      request,
      payload,
      serde_json::to_string(&copy).map_err(|_| Error::Unavailable)?
    ],
  )
  .map_err(|_| Error::Unavailable)?;
  recheck()?;
  tx.commit().map_err(|_| Error::Unavailable)?;
  Ok(Receipt {
    scope: scope.clone(),
    request_id: request.into(),
    version,
    body_hash: copy.body_hash,
    desktop_only: true,
  })
}
pub fn save(home: &Path, c: &Connection, input: &Save) -> Result<Receipt> {
  let scope = owner(
    home,
    c,
    input.thread_id,
    &input.expected_uuid,
    &input.expected_email,
  )?;
  // An already-acknowledged identical request can be read without trusting a stale source snapshot.
  let payload = digest(serde_json::to_vec(input).map_err(|_| Error::Unavailable)?);
  let prepared = prepare(
    home,
    c,
    input.thread_id,
    &input.expected_uuid,
    &input.expected_email,
  )?;
  let copy = Copy {
    version: 0,
    body: input.body.clone(),
    saved_manual: prepared.saved_notes,
    draft_manual: input.draft_manual.clone(),
    transcript_id: prepared.transcript.id,
    transcript_filename: prepared.transcript.filename,
    transcript_hash: prepared.transcript.hash,
    source_snapshot: input.snapshot.clone(),
    restored_from: None,
    body_hash: digest(&input.body),
  };
  append(home, c, &scope, &input.request_id, &payload, copy, || {
    if prepare(
      home,
      c,
      input.thread_id,
      &input.expected_uuid,
      &input.expected_email,
    )?
    .snapshot
      != input.snapshot
    {
      return Err(Error::Conflict);
    }
    Ok(())
  })
}
pub fn restore(
  home: &Path,
  c: &Connection,
  id: u64,
  uuid: &str,
  email: &str,
  version: u64,
  request: &str,
) -> Result<Receipt> {
  let scope = owner(home, c, id, uuid, email)?;
  let mut old = list(home, c, id, uuid, email)?
    .into_iter()
    .find(|v| v.version == version)
    .ok_or(Error::Conflict)?;
  old.restored_from = Some(version);
  let payload =
    digest(serde_json::to_vec(&(id, version, "restore")).map_err(|_| Error::Unavailable)?);
  append(home, c, &scope, request, &payload, old, || {
    owner(home, c, id, uuid, email).map(|_| ())
  })
}
#[cfg(test)]
mod tests {
  use super::*;
  struct Fixture {
    // Close the SQLite handle before TempDir cleanup on Windows.
    c: Connection,
    home: tempfile::TempDir,
  }
  fn fixture() -> Fixture {
    let home = tempfile::tempdir().unwrap();
    std::fs::create_dir_all(home.path().join(".knapsack/notes")).unwrap();
    std::fs::create_dir_all(home.path().join(".knapsack/transcripts")).unwrap();
    std::fs::write(
      home.path().join(".knapsack/profile.dat"),
      br#"{"KN_PROFILE":{"uuid":"A","email":"a@example.invalid"}}"#,
    )
    .unwrap();
    std::fs::write(
      home.path().join(".knapsack/notes/10"),
      "Manual priority: reconcile sandbox totals. Who owns demo?\n",
    )
    .unwrap();
    std::fs::write(
      home.path().join(".knapsack/transcripts/synthetic.txt"),
      "CSV import test Friday. Riley prepares sample.\n",
    )
    .unwrap();
    let c = Connection::open(home.path().join("fixture.sqlite")).unwrap();
    c.execute_batch("CREATE TABLE users(id INTEGER,uuid TEXT,email TEXT);INSERT INTO users VALUES(1,'A','a@example.invalid'),(2,'B','b@example.invalid');CREATE TABLE automation_runs(thread_id INTEGER,user_id INTEGER);INSERT INTO automation_runs VALUES(10,1),(20,2);CREATE TABLE threads(id INTEGER,thread_type TEXT);INSERT INTO threads VALUES(10,'MEETING NOTES'),(20,'MEETING NOTES');CREATE TABLE messages(thread_id INTEGER,user_id INTEGER);CREATE TABLE transcripts(id INTEGER,thread_id INTEGER,filename TEXT);INSERT INTO transcripts VALUES(3,10,'synthetic.txt');").unwrap();
    Fixture { home, c }
  }
  fn input(f: &Fixture) -> Save {
    let p = prepare(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    Save{request_id:uuid::Uuid::new_v4().to_string(),thread_id:10,expected_uuid:"A".into(),expected_email:"a@example.invalid".into(),snapshot:p.snapshot,body:"Review: CSV test Friday; Riley prepares sample. Priority: reconcile totals. Open: demo owner?".into(),draft_manual:"Unsaved manual draft stays intact\n".into()}
  }
  fn originals(f: &Fixture) -> (Vec<u8>, Vec<u8>) {
    (
      std::fs::read(f.home.path().join(".knapsack/notes/10")).unwrap(),
      std::fs::read(f.home.path().join(".knapsack/transcripts/synthetic.txt")).unwrap(),
    )
  }
  #[test]
  fn explicit_copy_keeps_original_manual_transcript_and_editor_input_exact() {
    let f = fixture();
    let original = originals(&f);
    let p = prepare(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    assert!(list(f.home.path(), &f.c, 10, "A", "a@example.invalid")
      .unwrap()
      .is_empty());
    assert!(!f
      .home
      .path()
      .join(".knapsack/desktop-recovered-copies")
      .exists());
    let request = input(&f);
    let r = save(f.home.path(), &f.c, &request).unwrap();
    assert_eq!(r.version, 1);
    assert!(r.desktop_only);
    let copies = list(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    assert_eq!(copies[0].saved_manual, p.saved_notes);
    assert_eq!(copies[0].draft_manual, request.draft_manual);
    assert_eq!(copies[0].transcript_id, 3);
    assert_eq!(copies[0].transcript_hash, digest(original.1.as_slice()));
    assert_eq!(originals(&f), original);
  }
  #[test]
  fn request_replay_restart_and_changed_payload_are_safe() {
    let f = fixture();
    let original = originals(&f);
    let mut request = input(&f);
    let a = save(f.home.path(), &f.c, &request).unwrap();
    let b = save(f.home.path(), &f.c, &request).unwrap();
    assert_eq!(a.version, b.version);
    assert_eq!(
      list(f.home.path(), &f.c, 10, "A", "a@example.invalid")
        .unwrap()
        .len(),
      1
    );
    request.body.push('x');
    assert_eq!(
      save(f.home.path(), &f.c, &request).err(),
      Some(Error::Conflict)
    );
    assert_eq!(originals(&f), original);
    drop(
      store(
        f.home.path(),
        &owner(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap(),
        false,
      )
      .unwrap(),
    );
    assert_eq!(
      list(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap()[0].body_hash,
      a.body_hash
    );
  }
  #[test]
  fn fresh_process_reopens_the_saved_copy_and_originals() {
    let f = fixture();
    std::fs::write(
      f.home.path().join("synthetic-marker"),
      "recovered-copy-fixture",
    )
    .unwrap();
    let request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    let original = originals(&f);
    let output = std::process::Command::new(std::env::current_exe().unwrap())
      .args([
        "--exact",
        &format!(
          "{}::restart_child_reads_private_version",
          module_path!().split_once("::").unwrap().1
        ),
        "--nocapture",
      ])
      .env("KNAP_COPY_FIXTURE_RESTART", f.home.path())
      .output()
      .unwrap();
    assert!(output.status.success(), "Synthetic fresh process failed");
    assert!(String::from_utf8_lossy(&output.stdout).contains("1 passed; 0 failed"));
    assert_eq!(originals(&f), original);
  }
  #[test]
  fn concurrent_processes_append_one_version_for_the_same_request() {
    let f = fixture();
    std::fs::write(
      f.home.path().join("synthetic-marker"),
      "recovered-copy-fixture",
    )
    .unwrap();
    let mut request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    request.request_id = uuid::Uuid::new_v4().to_string();
    request.body = "Concurrent recovered copy".into();
    std::fs::write(
      f.home.path().join("synthetic-request.json"),
      serde_json::to_vec(&request).unwrap(),
    )
    .unwrap();
    let mut children = Vec::new();
    for _ in 0..2 {
      children.push(
        std::process::Command::new(std::env::current_exe().unwrap())
          .args([
            "--exact",
            &format!(
              "{}::restart_child_reads_private_version",
              module_path!().split_once("::").unwrap().1
            ),
            "--nocapture",
          ])
          .env("KNAP_COPY_FIXTURE_RESTART", f.home.path())
          .env("KNAP_COPY_FIXTURE_SAVE", "1")
          .stdout(std::process::Stdio::piped())
          .spawn()
          .unwrap(),
      );
    }
    for child in children {
      let output = child.wait_with_output().unwrap();
      assert!(output.status.success());
      assert!(String::from_utf8_lossy(&output.stdout).contains("1 passed; 0 failed"));
    }
    let copies = list(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    assert_eq!(copies.len(), 2);
    assert_eq!(copies[0].body, "Concurrent recovered copy");
    assert_eq!(copies[0].version, 2);
  }
  #[test]
  fn restart_child_reads_private_version() {
    let Ok(root) = std::env::var("KNAP_COPY_FIXTURE_RESTART") else {
      return;
    };
    let home = std::path::PathBuf::from(root);
    assert_eq!(
      std::fs::read_to_string(home.join("synthetic-marker")).unwrap(),
      "recovered-copy-fixture"
    );
    let c = Connection::open_with_flags(
      home.join("fixture.sqlite"),
      rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY,
    )
    .unwrap();
    if std::env::var("KNAP_COPY_FIXTURE_SAVE").as_deref() == Ok("1") {
      let input: Save =
        serde_json::from_slice(&std::fs::read(home.join("synthetic-request.json")).unwrap())
          .unwrap();
      assert_eq!(save(&home, &c, &input).unwrap().version, 2);
      return;
    }
    let copies = list(&home, &c, 10, "A", "a@example.invalid").unwrap();
    assert_eq!(copies.len(), 1);
    assert!(copies[0].body.contains("Riley"));
    assert_eq!(
      copies[0].draft_manual,
      "Unsaved manual draft stays intact\n"
    );
  }
  #[test]
  fn rollback_appends_new_copy_without_changing_prior_versions_or_legacy() {
    let f = fixture();
    let original = originals(&f);
    let mut request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    request.request_id = uuid::Uuid::new_v4().to_string();
    request.body = "Second recovered version".into();
    save(f.home.path(), &f.c, &request).unwrap();
    let id = uuid::Uuid::new_v4().to_string();
    let r = restore(f.home.path(), &f.c, 10, "A", "a@example.invalid", 1, &id).unwrap();
    assert_eq!(r.version, 3);
    assert_eq!(
      restore(f.home.path(), &f.c, 10, "A", "a@example.invalid", 1, &id)
        .unwrap()
        .version,
      3
    );
    let copies = list(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    assert_eq!(copies.len(), 3);
    assert_eq!(copies[0].body, copies[2].body);
    assert_eq!(copies[0].restored_from, Some(1));
    assert_eq!(copies[1].body, "Second recovered version");
    assert_eq!(originals(&f), original);
  }
  #[test]
  fn other_account_ambiguous_owner_and_profile_switch_never_expose_or_save() {
    let f = fixture();
    let request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    assert!(list(f.home.path(), &f.c, 10, "B", "b@example.invalid").is_err());
    assert!(prepare(f.home.path(), &f.c, 20, "A", "a@example.invalid").is_err());
    std::fs::write(
      f.home.path().join(".knapsack/profile.dat"),
      br#"{"KN_PROFILE":{"uuid":"B","email":"b@example.invalid"}}"#,
    )
    .unwrap();
    assert!(list(f.home.path(), &f.c, 10, "A", "a@example.invalid").is_err());
    assert!(save(f.home.path(), &f.c, &request).is_err());
  }
  #[test]
  fn changed_notes_or_transcript_refuses_stale_preview_and_never_rewrites() {
    for transcript in [true, false] {
      let f = fixture();
      let request = input(&f);
      let path = f.home.path().join(if transcript {
        ".knapsack/transcripts/synthetic.txt"
      } else {
        ".knapsack/notes/10"
      });
      std::fs::write(&path, "Newer material\n").unwrap();
      assert_eq!(
        save(f.home.path(), &f.c, &request).err(),
        Some(Error::Conflict)
      );
      assert!(list(f.home.path(), &f.c, 10, "A", "a@example.invalid")
        .unwrap()
        .is_empty());
      assert_eq!(std::fs::read_to_string(path).unwrap(), "Newer material\n");
    }
  }
  #[test]
  fn old_client_canonical_write_cannot_replace_a_recovered_version() {
    let f = fixture();
    let request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    std::fs::write(
      f.home.path().join(".knapsack/notes/10"),
      "Old client edits its own canonical notes",
    )
    .unwrap();
    let copies = list(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    assert_eq!(copies[0].body, request.body);
    assert!(copies[0]
      .saved_manual
      .as_ref()
      .unwrap()
      .contains("reconcile sandbox totals"));
    assert_eq!(
      std::fs::read_to_string(f.home.path().join(".knapsack/notes/10")).unwrap(),
      "Old client edits its own canonical notes"
    );
    assert_eq!(save(f.home.path(), &f.c, &request).unwrap().version, 1);
  }
  #[test]
  fn missing_blank_or_ambiguous_transcript_refuses() {
    for mode in ["missing", "blank", "ambiguous"] {
      let f = fixture();
      match mode {
        "missing" => {
          std::fs::remove_file(f.home.path().join(".knapsack/transcripts/synthetic.txt")).unwrap()
        }
        "blank" => std::fs::write(
          f.home.path().join(".knapsack/transcripts/synthetic.txt"),
          " ",
        )
        .unwrap(),
        _ => {
          f.c
            .execute("INSERT INTO transcripts VALUES(4,20,'synthetic.txt')", [])
            .unwrap();
        }
      }
      assert!(prepare(f.home.path(), &f.c, 10, "A", "a@example.invalid").is_err());
    }
  }
  #[test]
  fn missing_saved_notes_can_create_a_copy_without_creating_canonical_file() {
    let f = fixture();
    std::fs::remove_file(f.home.path().join(".knapsack/notes/10")).unwrap();
    save(f.home.path(), &f.c, &input(&f)).unwrap();
    assert!(!f.home.path().join(".knapsack/notes/10").exists());
  }
  #[test]
  fn future_store_format_is_not_migrated_or_overwritten_by_rollback() {
    let f = fixture();
    let request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    let scope = owner(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    let db = store(f.home.path(), &scope, true).unwrap().unwrap();
    db.pragma_update(None, "user_version", 99).unwrap();
    assert!(list(f.home.path(), &f.c, 10, "A", "a@example.invalid").is_err());
    assert!(save(f.home.path(), &f.c, &request).is_err());
    assert_eq!(
      db.query_row("SELECT count(*) FROM copies", [], |r| r.get::<_, i64>(0))
        .unwrap(),
      1
    );
    assert_eq!(
      db.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
        .unwrap(),
      99
    );
  }
  #[cfg(unix)]
  #[test]
  fn symlink_store_and_transcript_fail_closed() {
    use std::os::unix::fs::symlink;
    let f = fixture();
    std::fs::remove_file(f.home.path().join(".knapsack/transcripts/synthetic.txt")).unwrap();
    symlink(
      f.home.path().join(".knapsack/notes/10"),
      f.home.path().join(".knapsack/transcripts/synthetic.txt"),
    )
    .unwrap();
    assert!(prepare(f.home.path(), &f.c, 10, "A", "a@example.invalid").is_err());
    let f = fixture();
    symlink(
      f.home.path().join(".knapsack/notes"),
      f.home.path().join(".knapsack/desktop-recovered-copies"),
    )
    .unwrap();
    assert!(save(f.home.path(), &f.c, &input(&f)).is_err());
    let f = fixture();
    let request = input(&f);
    save(f.home.path(), &f.c, &request).unwrap();
    let scope = owner(f.home.path(), &f.c, 10, "A", "a@example.invalid").unwrap();
    let database = folder(f.home.path(), &scope, false)
      .unwrap()
      .join("copies-v1.sqlite3");
    std::fs::hard_link(database, f.home.path().join("synthetic-hardlink.sqlite")).unwrap();
    assert!(list(f.home.path(), &f.c, 10, "A", "a@example.invalid").is_err());
    assert!(save(f.home.path(), &f.c, &request).is_err());
  }
}
