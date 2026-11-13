//! Dormant shared-record bridge. No HTTP client or account/key enrollment is
//! installed here. The coordinator and encrypted journal are exercised only by
//! isolated callers until the signed-device transport and key bridge pass QA.
use knapsack_state_backup::{
  shared_context::{Binding, DurableStore, Mutation, Receipt},
  Error,
};
use rusqlite::{params, Connection};
use serde::Serialize;

#[derive(Serialize)]
pub struct SharedContextStatus {
  feature_available: bool,
  sync_enabled: bool,
  inference_policy_is_per_device: bool,
  account_recoverable_encryption: bool,
  local_record_limit: usize,
  account_lifetime_record_limit: usize,
}
#[tauri::command]
pub fn kn_shared_context_status() -> SharedContextStatus {
  SharedContextStatus {
    feature_available: false,
    sync_enabled: false,
    inference_policy_is_per_device: true,
    account_recoverable_encryption: true,
    local_record_limit: 32,
    account_lifetime_record_limit: 100,
  }
}

/// Connection/path creation is intentionally not exposed through IPC. A future
/// enrolled-account factory must own a private per-device DB and key session.
/// SQLite transaction CAS makes the generation + encrypted journal one commit.
pub(crate) struct SqliteJournal {
  connection: Connection,
  scope: String,
}
impl SqliteJournal {
  pub(crate) fn new(
    connection: Connection,
    binding: &Binding,
    journal_id: &str,
  ) -> Result<Self, Error> {
    use sha2::{Digest, Sha256};
    let scope = format!(
      "{:x}",
      Sha256::digest(serde_json::to_vec(&(binding, journal_id)).map_err(|_| Error::InvalidSchema)?)
    );
    connection
      .busy_timeout(std::time::Duration::from_secs(5))
      .map_err(|_| Error::Io("Journal busy"))?;
    connection.execute_batch("PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS shared_context_journal_v1(scope TEXT PRIMARY KEY, generation INTEGER NOT NULL CHECK(generation>0), ciphertext BLOB NOT NULL);").map_err(|_|Error::Io("Cannot initialize encrypted journal"))?;
    Ok(Self { connection, scope })
  }
}
impl DurableStore for SqliteJournal {
  fn load(&mut self) -> Result<Option<(u64, Vec<u8>)>, Error> {
    use rusqlite::OptionalExtension;
    let row:Option<(u64,u64,Vec<u8>)>=self.connection.query_row("SELECT generation,length(ciphertext),substr(ciphertext,1,9437185) FROM shared_context_journal_v1 WHERE scope=?1",[&self.scope],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?))).optional().map_err(|_|Error::Io("Cannot read encrypted journal"))?;
    row
      .map(|(generation, length, bytes)| {
        if length > 9 * 1024 * 1024 || bytes.len() as u64 != length {
          Err(Error::Bounds)
        } else {
          Ok((generation, bytes))
        }
      })
      .transpose()
  }
  fn compare_and_save(&mut self, generation: u64, ciphertext: &[u8]) -> Result<u64, Error> {
    if ciphertext.len() > 9 * 1024 * 1024 {
      return Err(Error::Bounds);
    }
    let next = generation
      .checked_add(1)
      .filter(|n| *n < i64::MAX as u64)
      .ok_or(Error::Bounds)?;
    let transaction = self
      .connection
      .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
      .map_err(|_| Error::Io("Cannot lock encrypted journal"))?;
    let changed=if generation==0 {
      transaction.execute("INSERT OR IGNORE INTO shared_context_journal_v1(scope,generation,ciphertext) VALUES(?1,?2,?3)",params![&self.scope,next,ciphertext])
    }else{
      transaction.execute("UPDATE shared_context_journal_v1 SET generation=?1,ciphertext=?2 WHERE scope=?3 AND generation=?4",params![next,ciphertext,&self.scope,generation])
    }.map_err(|_|Error::Io("Cannot save encrypted journal"))?;
    if changed != 1 {
      return Err(Error::UnstableSnapshot);
    }
    transaction
      .commit()
      .map_err(|_| Error::Io("Journal outcome uncertain; reload before retry"))?;
    Ok(next)
  }
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(untagged)]
pub(crate) enum WriteBody {
  Put {
    device_id: String,
    mutation_id: String,
    kind: knapsack_state_backup::shared_context::RecordKind,
    expected_revision: u64,
    key_version: String,
    ciphertext_b64: String,
    confirm_share: bool,
  },
  Delete {
    device_id: String,
    mutation_id: String,
    expected_revision: u64,
    confirm_delete: bool,
  },
}
#[derive(Clone, Debug, PartialEq)]
pub(crate) struct WriteRequest {
  pub method: &'static str,
  pub path: String,
  pub body: WriteBody,
}
pub(crate) fn wire_mutation(mutation: &Mutation) -> Result<WriteRequest, Error> {
  use base64::Engine;
  mutation.validate()?;
  // Core construction validates IDs, kind, revisions and bounded plaintext.
  if mutation.protocol != 1
    || uuid::Uuid::parse_str(&mutation.record_id).is_err()
    || uuid::Uuid::parse_str(&mutation.mutation_id).is_err()
  {
    return Err(Error::InvalidSchema);
  }
  let body = if mutation.deleted {
    if !mutation.ciphertext.is_empty() {
      return Err(Error::InvalidSchema);
    }
    WriteBody::Delete {
      device_id: mutation.binding.device_id.clone(),
      mutation_id: mutation.mutation_id.clone(),
      expected_revision: mutation.expected_revision,
      confirm_delete: true,
    }
  } else {
    if mutation.ciphertext.len() < 48 || mutation.ciphertext.len() > 256 * 1024 {
      return Err(Error::Bounds);
    }
    WriteBody::Put {
      device_id: mutation.binding.device_id.clone(),
      mutation_id: mutation.mutation_id.clone(),
      kind: mutation.kind.clone(),
      expected_revision: mutation.expected_revision,
      key_version: mutation.binding.key_version.clone(),
      ciphertext_b64: base64::engine::general_purpose::STANDARD.encode(&mutation.ciphertext),
      confirm_share: true,
    }
  };
  Ok(WriteRequest {
    method: if mutation.deleted { "DELETE" } else { "PUT" },
    path: format!("/api/state-backup/records/{}", mutation.record_id),
    body,
  })
}

/// There is no production implementation. Both checks must obtain current
/// enrolled account/device authority, including for historical receipt replay.
pub(crate) trait VerifiedTransport {
  fn authority(&mut self) -> Result<Binding, Error>;
  fn send(&mut self, request: &WriteRequest) -> Result<Receipt, Error>;
  fn read(
    &mut self,
    _record_id: &str,
  ) -> Result<knapsack_state_backup::shared_context::RemoteRecord, Error> {
    Err(Error::UnsupportedVersion)
  }
  fn changes(&mut self, _cursor: &str) -> Result<MetadataPage, Error> {
    Err(Error::UnsupportedVersion)
  }
}
pub(crate) struct MetadataPage {
  pub changes: Vec<Receipt>,
  pub next_cursor: String,
  pub has_more: bool,
}

#[derive(Clone, Default)]
pub(crate) struct ConsentFence(std::sync::Arc<std::sync::atomic::AtomicU64>);
impl ConsentFence {
  pub(crate) fn invalidate(&self) {
    self.0.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
  }
  pub(crate) fn ticket(&self) -> u64 {
    self.0.load(std::sync::atomic::Ordering::SeqCst)
  }
}
pub(crate) fn send_verified<T: VerifiedTransport, S: DurableStore>(
  coordinator: &knapsack_state_backup::shared_context::Coordinator<S>,
  lease: &knapsack_state_backup::shared_context::Lease,
  fence: &ConsentFence,
  ticket: u64,
  transport: &mut T,
  expected: &Binding,
) -> Result<Receipt, Error> {
  let check = || {
    coordinator.validate_lease(lease)?;
    if fence.ticket() != ticket {
      return Err(Error::Authentication);
    }
    Ok(())
  };
  check()?;
  if &transport.authority()? != expected || &lease.mutation.binding != expected {
    return Err(Error::Authentication);
  }
  check()?;
  let request = wire_mutation(&lease.mutation)?;
  check()?;
  let receipt = transport.send(&request)?;
  check()?;
  if &transport.authority()? != expected || !lease.mutation.receipt_matches(&receipt) {
    return Err(Error::Authentication);
  }
  check()?;
  Ok(receipt)
}

pub(crate) fn read_verified<T: VerifiedTransport, S: DurableStore>(
  coordinator: &knapsack_state_backup::shared_context::Coordinator<S>,
  lease: &knapsack_state_backup::shared_context::ReadLease,
  fence: &ConsentFence,
  ticket: u64,
  transport: &mut T,
  expected: &Binding,
) -> Result<knapsack_state_backup::shared_context::RemoteRecord, Error> {
  let check = || {
    coordinator.validate_binding(expected)?;
    coordinator.validate_read(lease)?;
    if fence.ticket() != ticket {
      return Err(Error::Authentication);
    }
    Ok(())
  };
  check()?;
  if &transport.authority()? != expected {
    return Err(Error::Authentication);
  }
  check()?;
  let record = transport.read(&lease.record_id)?;
  check()?;
  if &transport.authority()? != expected
    || record.receipt.account_id != expected.account_id
    || record.receipt.record_id != lease.record_id
  {
    return Err(Error::Authentication);
  }
  check()?;
  Ok(record)
}
pub(crate) fn apply_page_verified<T: VerifiedTransport, S: DurableStore>(
  coordinator: &mut knapsack_state_backup::shared_context::Coordinator<S>,
  key: &knapsack_state_backup::RecoveryKey,
  fence: &ConsentFence,
  ticket: u64,
  transport: &mut T,
  expected: &Binding,
) -> Result<bool, Error> {
  let lease = coordinator.prepare_page()?;
  let check = |c: &knapsack_state_backup::shared_context::Coordinator<S>| {
    c.validate_binding(expected)?;
    c.validate_page(&lease)?;
    if fence.ticket() != ticket {
      return Err(Error::Authentication);
    }
    Ok(())
  };
  check(coordinator)?;
  if &transport.authority()? != expected {
    return Err(Error::Authentication);
  }
  check(coordinator)?;
  let page = transport.changes(&lease.cursor)?;
  check(coordinator)?;
  if &transport.authority()? != expected || page.changes.len() > 50 {
    return Err(Error::Authentication);
  }
  check(coordinator)?;
  if page.has_more && page.changes.is_empty() {
    return Err(Error::InvalidArchive);
  }
  let mut changes = Vec::new();
  for event in page.changes {
    if event.account_id != expected.account_id {
      return Err(Error::Authentication);
    }
    let latest = if coordinator.is_selected(&event.record_id)? {
      let read = coordinator.prepare_read(&event.record_id)?;
      Some(read_verified(
        coordinator,
        &read,
        fence,
        ticket,
        transport,
        expected,
      )?)
    } else {
      None
    };
    changes.push(knapsack_state_backup::shared_context::Change { event, latest });
  }
  check(coordinator)?;
  if &transport.authority()? != expected {
    return Err(Error::Authentication);
  }
  check(coordinator)?;
  coordinator.apply_page(key, &lease.cursor, &page.next_cursor, changes)?;
  Ok(page.has_more)
}

#[cfg(test)]
mod tests {
  use super::*;
  use knapsack_state_backup::shared_context::{Content, Coordinator, SelectedRecord};
  fn id(n: u32) -> String {
    format!("{n:08x}-1111-4111-8111-{n:012x}")
  }
  fn binding() -> Binding {
    Binding {
      account_id: "synthetic-owner".into(),
      device_id: id(1),
      key_version: id(2),
      enrollment_epoch: 1,
    }
  }
  fn key() -> knapsack_state_backup::RecoveryKey {
    knapsack_state_backup::RecoveryKey::from_hex(&"ab".repeat(32)).unwrap()
  }
  #[test]
  fn sqlite_restart_and_cas_preserve_encrypted_retry_bytes() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("synthetic.db");
    let store = SqliteJournal::new(Connection::open(&path).unwrap(), &binding(), &id(3)).unwrap();
    let mut c = Coordinator::load(store, &key(), binding(), id(3)).unwrap();
    c.enroll(&key(), &binding(), [id(4)].into(), true).unwrap();
    c.queue(
      &key(),
      SelectedRecord {
        record_id: id(4),
        source_record_id: id(5),
        title: "Private synthetic title".into(),
        content: Content::CuratedContext {
          text: "Reviewed historical context".into(),
        },
      },
      id(6),
    )
    .unwrap();
    let pending = c.prepare(&id(4)).unwrap().mutation;
    drop(c);
    let mut stale =
      SqliteJournal::new(Connection::open(&path).unwrap(), &binding(), &id(3)).unwrap();
    let saved = stale.load().unwrap().unwrap();
    assert!(!String::from_utf8_lossy(&saved.1).contains("Private synthetic title"));
    let store = SqliteJournal::new(Connection::open(&path).unwrap(), &binding(), &id(3)).unwrap();
    let mut recovered = Coordinator::load(store, &key(), binding(), id(3)).unwrap();
    assert!(recovered.prepare(&id(4)).is_err());
    recovered
      .enroll(&key(), &binding(), [id(4)].into(), true)
      .unwrap();
    assert_eq!(recovered.prepare(&id(4)).unwrap().mutation, pending);
    assert!(stale.compare_and_save(saved.0, &saved.1).is_err());
  }
  #[test]
  fn wire_delete_does_not_send_content_or_claim_server_account_from_body() {
    let mutation = Mutation {
      protocol: 1,
      binding: binding(),
      record_id: id(4),
      kind: knapsack_state_backup::shared_context::RecordKind::CuratedContext,
      expected_revision: 1,
      mutation_id: id(6),
      deleted: true,
      ciphertext: Vec::new(),
    };
    let wire = wire_mutation(&mutation).unwrap();
    assert_eq!(wire.method, "DELETE");
    let json = serde_json::to_value(wire.body).unwrap();
    assert!(json.get("account_id").is_none());
    assert!(json.get("ciphertext_b64").is_none());
    assert_eq!(json["confirm_delete"], true);
  }
  #[test]
  fn dormant_status_never_enrolls_or_opens_storage() {
    let status = kn_shared_context_status();
    assert!(!status.feature_available);
    assert!(!status.sync_enabled);
  }
  fn fixture() -> (
    knapsack_state_backup::shared_context::Coordinator<SqliteJournal>,
    knapsack_state_backup::shared_context::Lease,
  ) {
    let store =
      SqliteJournal::new(Connection::open_in_memory().unwrap(), &binding(), &id(3)).unwrap();
    let mut c = Coordinator::load(store, &key(), binding(), id(3)).unwrap();
    c.enroll(&key(), &binding(), [id(4)].into(), true).unwrap();
    c.queue(
      &key(),
      SelectedRecord {
        record_id: id(4),
        source_record_id: id(5),
        title: "Synthetic".into(),
        content: Content::CuratedContext {
          text: "Historical text".into(),
        },
      },
      id(6),
    )
    .unwrap();
    let lease = c.prepare(&id(4)).unwrap();
    (c, lease)
  }
  struct FakeTransport {
    calls: usize,
    cancel: Option<ConsentFence>,
    authorized: bool,
  }
  impl VerifiedTransport for FakeTransport {
    fn authority(&mut self) -> Result<Binding, Error> {
      if let Some(fence) = self.cancel.take() {
        fence.invalidate();
      }
      if self.authorized {
        Ok(binding())
      } else {
        Err(Error::Authentication)
      }
    }
    fn send(&mut self, _: &WriteRequest) -> Result<Receipt, Error> {
      self.calls += 1;
      Err(Error::Io("Synthetic interrupted response"))
    }
  }
  #[test]
  fn paused_stale_or_cancelled_consent_never_invokes_transport() {
    let (mut c, lease) = fixture();
    let fence = ConsentFence::default();
    let ticket = fence.ticket();
    let mut transport = FakeTransport {
      calls: 0,
      cancel: None,
      authorized: true,
    };
    c.pause();
    assert!(send_verified(&c, &lease, &fence, ticket, &mut transport, &binding()).is_err());
    assert_eq!(transport.calls, 0);
    c.enroll(&key(), &binding(), [id(4)].into(), true).unwrap();
    assert!(send_verified(&c, &lease, &fence, ticket, &mut transport, &binding()).is_err());
    assert_eq!(transport.calls, 0);
    let current = c.prepare(&id(4)).unwrap();
    transport.cancel = Some(fence.clone());
    assert!(send_verified(&c, &current, &fence, ticket, &mut transport, &binding()).is_err());
    assert_eq!(transport.calls, 0);
    let ticket = fence.ticket();
    transport.authorized = false;
    assert!(send_verified(&c, &current, &fence, ticket, &mut transport, &binding()).is_err());
    assert_eq!(transport.calls, 0);
  }
  #[test]
  fn interrupted_synthetic_send_keeps_exact_durable_retry() {
    let (c, lease) = fixture();
    let fence = ConsentFence::default();
    let mut transport = FakeTransport {
      calls: 0,
      cancel: None,
      authorized: true,
    };
    assert!(send_verified(
      &c,
      &lease,
      &fence,
      fence.ticket(),
      &mut transport,
      &binding()
    )
    .is_err());
    assert_eq!(transport.calls, 1);
    assert_eq!(c.prepare(&id(4)).unwrap().mutation, lease.mutation);
  }
  #[test]
  fn corrupt_oversized_database_blob_is_bounded_and_wire_fields_are_validated() {
    let mut store =
      SqliteJournal::new(Connection::open_in_memory().unwrap(), &binding(), &id(3)).unwrap();
    store
      .connection
      .execute(
        "INSERT INTO shared_context_journal_v1 VALUES(?1,1,zeroblob(10485760))",
        [&store.scope],
      )
      .unwrap();
    assert_eq!(store.load().unwrap_err(), Error::Bounds);
    let (_, lease) = fixture();
    let mut mutation = lease.mutation;
    mutation.binding.device_id = "bad".into();
    assert!(wire_mutation(&mutation).is_err());
  }

  fn receipt(m: &Mutation, sequence: u64) -> Receipt {
    use sha2::{Digest, Sha256};
    Receipt {
      schema_version: 1,
      account_id: m.binding.account_id.clone(),
      record_id: m.record_id.clone(),
      kind: m.kind.clone(),
      revision: m.expected_revision + 1,
      deleted: m.deleted,
      source_device_id: m.binding.device_id.clone(),
      key_version: m.binding.key_version.clone(),
      sequence,
      mutation_id: m.mutation_id.clone(),
      sha256: if m.deleted {
        None
      } else {
        Some(format!("{:x}", Sha256::digest(&m.ciphertext)))
      },
    }
  }
  struct FakeReads {
    owner: Binding,
    record: knapsack_state_backup::shared_context::RemoteRecord,
    reads: usize,
    pages: usize,
    checks: usize,
    deny_at: usize,
    cancel: Option<ConsentFence>,
    events: Vec<Receipt>,
    cursor: String,
  }
  impl VerifiedTransport for FakeReads {
    fn authority(&mut self) -> Result<Binding, Error> {
      self.checks += 1;
      if self.checks == self.deny_at {
        Err(Error::Authentication)
      } else {
        Ok(self.owner.clone())
      }
    }
    fn send(&mut self, _: &WriteRequest) -> Result<Receipt, Error> {
      panic!("Read fixture never writes")
    }
    fn read(
      &mut self,
      id: &str,
    ) -> Result<knapsack_state_backup::shared_context::RemoteRecord, Error> {
      self.reads += 1;
      if let Some(fence) = self.cancel.take() {
        fence.invalidate();
      }
      if id != self.record.receipt.record_id {
        return Err(Error::InvalidSchema);
      }
      Ok(self.record.clone())
    }
    fn changes(&mut self, _: &str) -> Result<MetadataPage, Error> {
      self.pages += 1;
      Ok(MetadataPage {
        changes: self.events.clone(),
        next_cursor: self.cursor.clone(),
        has_more: false,
      })
    }
  }
  fn reader(m: &Mutation) -> FakeReads {
    let receipt = receipt(m, 1);
    FakeReads {
      owner: binding(),
      record: knapsack_state_backup::shared_context::RemoteRecord {
        receipt: receipt.clone(),
        ciphertext: Some(m.ciphertext.clone()),
      },
      reads: 0,
      pages: 0,
      checks: 0,
      deny_at: usize::MAX,
      cancel: None,
      events: vec![receipt],
      cursor: "synthetic-owner:1".into(),
    }
  }
  #[test]
  fn reads_and_pages_never_cross_coordinator_account_and_cancel_before_import() {
    let (c, lease) = fixture();
    let read = c.prepare_read(&id(4)).unwrap();
    let fence = ConsentFence::default();
    let mut transport = reader(&lease.mutation);
    let mut other = binding();
    other.account_id = "other-owner".into();
    transport.owner = other.clone();
    assert!(read_verified(&c, &read, &fence, fence.ticket(), &mut transport, &other).is_err());
    assert_eq!(transport.reads, 0);
    let (mut page_coordinator, _) = fixture();
    assert!(apply_page_verified(
      &mut page_coordinator,
      &key(),
      &fence,
      fence.ticket(),
      &mut transport,
      &other
    )
    .is_err());
    assert_eq!(transport.pages, 0);
    transport.owner = binding();
    transport.cancel = Some(fence.clone());
    assert!(read_verified(
      &c,
      &read,
      &fence,
      fence.ticket(),
      &mut transport,
      &binding()
    )
    .is_err());
    assert_eq!(transport.reads, 1);
    assert!(c.imported(&key(), &id(4)).is_err());
  }
  #[test]
  fn page_apply_checks_authority_and_never_partially_advances_after_read_failure() {
    let (mut c, lease) = fixture();
    c.enroll(&key(), &binding(), [id(4), id(7)].into(), true)
      .unwrap();
    let fence = ConsentFence::default();
    let mut transport = reader(&lease.mutation);
    let mut other = receipt(&lease.mutation, 2);
    other.record_id = id(7);
    other.mutation_id = id(8);
    transport.events.push(other);
    transport.cursor = "synthetic-owner:2".into();
    assert!(apply_page_verified(
      &mut c,
      &key(),
      &fence,
      fence.ticket(),
      &mut transport,
      &binding()
    )
    .is_err());
    assert_eq!(c.cursor(), "synthetic-owner:0");
    assert!(c.imported(&key(), &id(4)).is_err());
    let mut revoked = reader(&lease.mutation);
    revoked.deny_at = 1;
    assert!(apply_page_verified(
      &mut c,
      &key(),
      &fence,
      fence.ticket(),
      &mut revoked,
      &binding()
    )
    .is_err());
    assert_eq!(revoked.pages, 0);
  }
  #[test]
  fn metadata_only_unselected_events_do_not_fetch_content() {
    let (mut c, lease) = fixture();
    let fence = ConsentFence::default();
    let mut transport = reader(&lease.mutation);
    transport.events[0].record_id = id(7);
    transport.events[0].mutation_id = id(8);
    apply_page_verified(
      &mut c,
      &key(),
      &fence,
      fence.ticket(),
      &mut transport,
      &binding(),
    )
    .unwrap();
    assert_eq!(transport.reads, 0);
    assert_eq!(c.cursor(), "synthetic-owner:1");
  }
}
