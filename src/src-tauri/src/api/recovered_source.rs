//! Side-effect-free Desktop recovery source snapshot; no shared write protocol.
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  io::Read,
  path::{Component, Path},
};
const LIMIT: u64 = 2 * 1024 * 1024;
#[derive(Clone, Copy, Debug)]
pub enum ProtocolError {
  Owner,
  Unavailable,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Scope {
  pub thread_id: u64,
  pub owner_uuid: String,
  pub owner_email: String,
}
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
  pub protocol_version: u8,
  pub scope: Scope,
  pub notes: Option<String>,
  pub exists: bool,
  pub source: &'static str,
  pub snapshot_revision: String,
  pub conditional_save: bool,
}
fn hash(bytes: impl AsRef<[u8]>) -> String {
  format!("{:x}", Sha256::digest(bytes.as_ref()))
}
fn no_link(path: &Path) -> Result<(), ProtocolError> {
  match std::fs::symlink_metadata(path) {
    Ok(m) if m.file_type().is_symlink() => Err(ProtocolError::Unavailable),
    Ok(_) => Ok(()),
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
    Err(_) => Err(ProtocolError::Unavailable),
  }
}
fn read(home: &Path, name: &str) -> Result<Option<(String, String)>, ProtocolError> {
  let mut parts = Path::new(name).components();
  if !matches!(
    (parts.next(), parts.next()),
    (Some(Component::Normal(_)), None)
  ) {
    return Err(ProtocolError::Unavailable);
  }
  let folder = home.join(".knapsack/notes");
  let path = folder.join(name);
  for p in [home.join(".knapsack"), folder, path.clone()] {
    no_link(&p)?;
  }
  let file = match std::fs::File::open(&path) {
    Ok(f) => f,
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
    Err(_) => return Err(ProtocolError::Unavailable),
  };
  let before = file.metadata().map_err(|_| ProtocolError::Unavailable)?;
  if !before.is_file() || before.len() > LIMIT {
    return Err(ProtocolError::Unavailable);
  }
  let mut bytes = Vec::new();
  file
    .take(LIMIT + 1)
    .read_to_end(&mut bytes)
    .map_err(|_| ProtocolError::Unavailable)?;
  let after = std::fs::metadata(path).map_err(|_| ProtocolError::Unavailable)?;
  if bytes.len() as u64 > LIMIT
    || before.len() != after.len()
    || before.modified().ok() != after.modified().ok()
  {
    return Err(ProtocolError::Unavailable);
  }
  let stamp = hash(format!(
    "{}:{:?}:{}",
    after.len(),
    after.modified().map_err(|_| ProtocolError::Unavailable)?,
    hash(&bytes)
  ));
  Ok(Some((
    String::from_utf8(bytes).map_err(|_| ProtocolError::Unavailable)?,
    stamp,
  )))
}
fn owner(home: &Path, conn: &Connection, id: u64) -> Result<(Scope, String), ProtocolError> {
  let path = home.join(".knapsack/profile.dat");
  for p in [home.to_path_buf(), home.join(".knapsack"), path.clone()] {
    no_link(&p)?;
  }
  let file = std::fs::File::open(path).map_err(|_| ProtocolError::Owner)?;
  let metadata = file.metadata().map_err(|_| ProtocolError::Owner)?;
  if !metadata.is_file() || metadata.len() > 262144 {
    return Err(ProtocolError::Owner);
  }
  let mut bytes = Vec::new();
  file
    .take(262145)
    .read_to_end(&mut bytes)
    .map_err(|_| ProtocolError::Owner)?;
  if bytes.len() > 262144 {
    return Err(ProtocolError::Owner);
  }
  let value: serde_json::Value =
    serde_json::from_slice(&bytes).map_err(|_| ProtocolError::Owner)?;
  let uuid = value["KN_PROFILE"]["uuid"]
    .as_str()
    .filter(|s| !s.is_empty())
    .ok_or(ProtocolError::Owner)?
    .to_string();
  let email = value["KN_PROFILE"]["email"]
    .as_str()
    .filter(|s| !s.trim().is_empty())
    .ok_or(ProtocolError::Owner)?
    .trim()
    .to_lowercase();
  let mut query = conn
    .prepare("SELECT id FROM users WHERE uuid=?1 AND lower(trim(email))=?2")
    .map_err(|_| ProtocolError::Owner)?;
  let users = query
    .query_map(params![uuid, email], |r| r.get::<_, i64>(0))
    .map_err(|_| ProtocolError::Owner)?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|_| ProtocolError::Owner)?;
  if users.len() != 1 {
    return Err(ProtocolError::Owner);
  }
  let mut query = conn
    .prepare("SELECT DISTINCT user_id FROM automation_runs WHERE thread_id=?1")
    .map_err(|_| ProtocolError::Owner)?;
  let owners = query
    .query_map([id], |r| r.get::<_, i64>(0))
    .map_err(|_| ProtocolError::Owner)?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|_| ProtocolError::Owner)?;
  if owners != users {
    return Err(ProtocolError::Owner);
  }
  let valid:bool=conn.query_row("SELECT EXISTS(SELECT 1 FROM threads WHERE id=?1 AND thread_type='MEETING NOTES') AND NOT EXISTS(SELECT 1 FROM messages WHERE thread_id=?1 AND user_id IS NOT NULL AND user_id<>?2)",params![id,users[0]],|r|r.get(0)).map_err(|_|ProtocolError::Owner)?;
  if !valid {
    return Err(ProtocolError::Owner);
  }
  Ok((
    Scope {
      thread_id: id,
      owner_uuid: uuid,
      owner_email: email,
    },
    hash(format!(
      "{}:{:?}",
      hash(bytes),
      metadata.modified().map_err(|_| ProtocolError::Owner)?
    )),
  ))
}
pub fn scope_at(home: &Path, conn: &Connection, id: u64) -> Result<Scope, ProtocolError> {
  let (scope, stamp) = owner(home, conn, id)?;
  if owner(home, conn, id)?.1 != stamp {
    return Err(ProtocolError::Owner);
  }
  Ok(scope)
}
pub fn snapshot_at(home: &Path, conn: &Connection, id: u64) -> Result<Snapshot, ProtocolError> {
  let (scope, stamp) = owner(home, conn, id)?;
  let selected = if let Some(value) = read(home, &id.to_string())? {
    Some(("canonical", value))
  } else {
    let mut q = conn
      .prepare("SELECT filename FROM transcripts WHERE thread_id=?1")
      .map_err(|_| ProtocolError::Unavailable)?;
    let names = q
      .query_map([id], |r| r.get::<_, String>(0))
      .map_err(|_| ProtocolError::Unavailable)?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|_| ProtocolError::Unavailable)?;
    if names.len() > 1 {
      return Err(ProtocolError::Unavailable);
    }
    match names.first() {
      Some(name) => {
        // A numeric basename could address another canonical thread file. A shared
        // transcript basename has ambiguous legacy ownership. Never guess either.
        if name.parse::<u64>().is_ok() || !name.is_ascii() {
          return Err(ProtocolError::Unavailable);
        }
        let linked: i64 = conn
          .query_row(
            "SELECT count(*) FROM transcripts WHERE filename=?1 COLLATE NOCASE",
            [name],
            |r| r.get(0),
          )
          .map_err(|_| ProtocolError::Unavailable)?;
        if linked != 1 {
          return Err(ProtocolError::Unavailable);
        }
        read(home, name)?.map(|value| ("legacy", value))
      }
      None => None,
    }
  };
  if owner(home, conn, id)?.1 != stamp {
    return Err(ProtocolError::Owner);
  }
  let (source, notes, file_stamp) = match selected {
    Some((source, (notes, file_stamp))) => (source, Some(notes), file_stamp),
    None => ("missing", None, String::new()),
  };
  let revision = format!(
    "read-v1:{}",
    hash(
      serde_json::to_vec(&(&scope, &stamp, source, &file_stamp, &notes))
        .map_err(|_| ProtocolError::Unavailable)?
    )
  );
  Ok(Snapshot {
    protocol_version: 1,
    scope,
    exists: notes.is_some(),
    notes,
    source,
    snapshot_revision: revision,
    conditional_save: false,
  })
}
