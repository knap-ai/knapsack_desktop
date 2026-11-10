//! Selected-record coordinator. No networking, keys on disk, inference policy,
//! filesystem import, instructions, permissions or execution authority.
use super::{
  account_id,
  conversations::{open_with_aad, seal_with_aad},
  secrets, Error, RecoveryKey,
};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
type Result<T> = std::result::Result<T, Error>;
const MAX_RECORDS: usize = 32;
const MAX_JOURNAL: usize = 8 * 1024 * 1024;
const NORMAL_BUDGET: usize = 6 * 1024 * 1024;
pub const MAX_RECORD_BYTES: usize = 16 * 1024;
const MAX_REVISION: u64 = 9_007_199_254_740_991;

fn uuid(id: &str) -> bool {
  id.len() == 36
    && id.bytes().enumerate().all(|(i, c)| {
      if [8, 13, 18, 23].contains(&i) {
        c == b'-'
      } else {
        c.is_ascii_hexdigit() && !c.is_ascii_uppercase()
      }
    })
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Binding {
  pub account_id: String,
  pub device_id: String,
  pub key_version: String,
  pub enrollment_epoch: u64,
}
impl Binding {
  fn validate(&self) -> Result<()> {
    account_id(&self.account_id)?;
    if !uuid(&self.device_id)
      || !uuid(&self.key_version)
      || self.enrollment_epoch == 0
      || self.enrollment_epoch > MAX_REVISION
    {
      return Err(Error::InvalidSchema);
    }
    Ok(())
  }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RecordKind {
  Conversation,
  CuratedContext,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Role {
  User,
  Assistant,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Message {
  pub id: String,
  pub role: Role,
  pub text: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Content {
  Conversation { messages: Vec<Message> },
  CuratedContext { text: String },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SelectedRecord {
  pub record_id: String,
  pub source_record_id: String,
  pub title: String,
  pub content: Content,
}
impl SelectedRecord {
  fn validate(&self) -> Result<RecordKind> {
    if !uuid(&self.record_id) || !uuid(&self.source_record_id) || self.title.len() > 256 {
      return Err(Error::InvalidSchema);
    }
    let mut texts = vec![self.title.as_str()];
    let kind = match &self.content {
      Content::Conversation { messages } => {
        if messages.is_empty() || messages.len() > 100 {
          return Err(Error::Bounds);
        }
        let mut ids = BTreeSet::new();
        for message in messages {
          if !uuid(&message.id) || !ids.insert(&message.id) {
            return Err(Error::InvalidSchema);
          }
          texts.push(&message.text);
        }
        RecordKind::Conversation
      }
      Content::CuratedContext { text } => {
        texts.push(text);
        RecordKind::CuratedContext
      }
    };
    for text in texts {
      if text.len() > 16 * 1024 {
        return Err(Error::Bounds);
      }
      secrets::check(text)?;
      let path = regex::Regex::new(r#"(?im)(?:^|[\s"'(=])(?:[a-z]:[\\/]|\\\\|/[^\s])"#)
        .map_err(|_| Error::InvalidSchema)?;
      if text.to_ascii_lowercase().contains("file://") || path.is_match(text) {
        return Err(Error::InvalidPath);
      }
    }
    if serde_json::to_vec(self)
      .map_err(|_| Error::InvalidSchema)?
      .len()
      > MAX_RECORD_BYTES
    {
      return Err(Error::Bounds);
    }
    Ok(kind)
  }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Mutation {
  pub protocol: u8,
  pub binding: Binding,
  pub record_id: String,
  pub kind: RecordKind,
  pub expected_revision: u64,
  pub mutation_id: String,
  pub deleted: bool,
  pub ciphertext: Vec<u8>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Receipt {
  pub schema_version: u8,
  pub account_id: String,
  pub record_id: String,
  pub kind: RecordKind,
  pub revision: u64,
  pub deleted: bool,
  pub source_device_id: String,
  pub key_version: String,
  pub sequence: u64,
  pub mutation_id: String,
  pub sha256: Option<String>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemoteRecord {
  pub receipt: Receipt,
  pub ciphertext: Option<Vec<u8>>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Payload {
  domain: String,
  binding: Binding,
  mutation_id: String,
  record: SelectedRecord,
}
fn aad(
  account: &str,
  id: &str,
  kind: &RecordKind,
  revision: u64,
  version: &str,
) -> Result<Vec<u8>> {
  account_id(account)?;
  if !uuid(id) || !uuid(version) || revision == 0 || revision > MAX_REVISION {
    return Err(Error::InvalidSchema);
  }
  serde_json::to_vec(&(
    "knapsack-shared-context-record-v1",
    1,
    account,
    id,
    kind,
    revision,
    version,
  ))
  .map_err(|_| Error::InvalidSchema)
}
impl Receipt {
  fn validate(&self) -> Result<()> {
    aad(
      &self.account_id,
      &self.record_id,
      &self.kind,
      self.revision,
      &self.key_version,
    )?;
    if self.schema_version != 1
      || !uuid(&self.source_device_id)
      || !uuid(&self.mutation_id)
      || self.sequence == 0
      || self.sequence > MAX_REVISION
      || self.deleted != self.sha256.is_none()
    {
      return Err(Error::InvalidSchema);
    }
    if self
      .sha256
      .as_ref()
      .is_some_and(|hash| hash.len() != 64 || !hash.bytes().all(|c| c.is_ascii_hexdigit()))
    {
      return Err(Error::InvalidSchema);
    }
    Ok(())
  }
}
impl RemoteRecord {
  fn open(&self, key: &RecoveryKey) -> Result<Option<SelectedRecord>> {
    self.receipt.validate()?;
    if self.receipt.deleted {
      if self.ciphertext.is_some() {
        return Err(Error::InvalidSchema);
      }
      return Ok(None);
    }
    let bytes = self.ciphertext.as_ref().ok_or(Error::InvalidSchema)?;
    if Some(super::digest(bytes)) != self.receipt.sha256 {
      return Err(Error::Authentication);
    }
    let plain = open_with_aad(
      bytes,
      key,
      &aad(
        &self.receipt.account_id,
        &self.receipt.record_id,
        &self.receipt.kind,
        self.receipt.revision,
        &self.receipt.key_version,
      )?,
    )?;
    let payload: Payload = serde_json::from_slice(&plain).map_err(|_| Error::InvalidSchema)?;
    payload.binding.validate()?;
    if payload.domain != "knapsack-shared-context-record-v1"
      || payload.record.record_id != self.receipt.record_id
      || payload.record.validate()? != self.receipt.kind
      || payload.binding.account_id != self.receipt.account_id
      || payload.binding.device_id != self.receipt.source_device_id
      || payload.binding.key_version != self.receipt.key_version
      || payload.mutation_id != self.receipt.mutation_id
    {
      return Err(Error::Authentication);
    }
    Ok(Some(payload.record))
  }
}
impl Mutation {
  pub fn validate(&self) -> Result<()> {
    self.binding.validate()?;
    aad(
      &self.binding.account_id,
      &self.record_id,
      &self.kind,
      self.expected_revision.checked_add(1).ok_or(Error::Bounds)?,
      &self.binding.key_version,
    )?;
    if self.protocol != 1 || !uuid(&self.mutation_id) || self.deleted != self.ciphertext.is_empty()
    {
      return Err(Error::InvalidSchema);
    }
    Ok(())
  }
  pub fn preview(&self, key: &RecoveryKey) -> Result<Option<SelectedRecord>> {
    self.validate()?;
    RemoteRecord {
      receipt: Receipt {
        schema_version: 1,
        account_id: self.binding.account_id.clone(),
        record_id: self.record_id.clone(),
        kind: self.kind.clone(),
        revision: self.expected_revision + 1,
        deleted: self.deleted,
        source_device_id: self.binding.device_id.clone(),
        key_version: self.binding.key_version.clone(),
        sequence: 1,
        mutation_id: self.mutation_id.clone(),
        sha256: if self.deleted {
          None
        } else {
          Some(super::digest(&self.ciphertext))
        },
      },
      ciphertext: if self.deleted {
        None
      } else {
        Some(self.ciphertext.clone())
      },
    }
    .open(key)
  }
  pub fn receipt_matches(&self, receipt: &Receipt) -> bool {
    receipt.validate().is_ok()
      && receipt.account_id == self.binding.account_id
      && receipt.record_id == self.record_id
      && receipt.kind == self.kind
      && receipt.revision == self.expected_revision + 1
      && receipt.deleted == self.deleted
      && receipt.source_device_id == self.binding.device_id
      && receipt.key_version == self.binding.key_version
      && receipt.mutation_id == self.mutation_id
      && receipt.sha256
        == if self.deleted {
          None
        } else {
          Some(super::digest(&self.ciphertext))
        }
  }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Conflict {
  pub local: Mutation,
  pub remote: RemoteRecord,
  pub acknowledged: Option<Receipt>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct ConflictDraft {
  local: Mutation,
  remote_revision: u64,
  acknowledged: Option<Receipt>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Journal {
  domain: String,
  binding: Binding,
  journal_id: String,
  selected: BTreeSet<String>,
  heads: BTreeMap<String, RemoteRecord>,
  pending: BTreeMap<String, Mutation>,
  conflicts: BTreeMap<String, ConflictDraft>,
  revoked: bool,
  cursor: u64,
  needs_refresh: BTreeSet<String>,
}
/// Store generation CAS and encrypted bytes atomically. Keys never enter storage.
pub trait DurableStore {
  fn load(&mut self) -> Result<Option<(u64, Vec<u8>)>>;
  fn compare_and_save(&mut self, generation: u64, ciphertext: &[u8]) -> Result<u64>;
}
#[derive(Clone)]
pub struct Lease {
  epoch: u64,
  session: [u8; 32],
  pub mutation: Mutation,
}
#[derive(Clone)]
pub struct ReadLease {
  epoch: u64,
  session: [u8; 32],
  pub record_id: String,
}
#[derive(Clone)]
pub struct PageLease {
  epoch: u64,
  session: [u8; 32],
  pub cursor: String,
}
pub enum Completion {
  Confirmed(Receipt),
  Conflict(RemoteRecord),
  Uncertain,
  Revoked,
}
#[derive(Clone)]
pub struct Change {
  pub event: Receipt,
  pub latest: Option<RemoteRecord>,
}
pub struct Coordinator<S: DurableStore> {
  store: S,
  state: Journal,
  generation: u64,
  epoch: u64,
  session: [u8; 32],
  active: bool,
  revoked_latch: bool,
}
fn journal_aad(binding: &Binding, id: &str) -> Result<Vec<u8>> {
  serde_json::to_vec(&("knapsack-shared-context-journal-v1", binding, id))
    .map_err(|_| Error::InvalidSchema)
}
impl<S: DurableStore> Coordinator<S> {
  pub fn load(
    mut store: S,
    key: &RecoveryKey,
    binding: Binding,
    journal_id: String,
  ) -> Result<Self> {
    binding.validate()?;
    if !uuid(&journal_id) {
      return Err(Error::InvalidSchema);
    }
    let (generation, state) = match store.load()? {
      None => (
        0,
        Journal {
          domain: "knapsack-shared-context-journal-v1".into(),
          binding: binding.clone(),
          journal_id: journal_id.clone(),
          selected: BTreeSet::new(),
          heads: BTreeMap::new(),
          pending: BTreeMap::new(),
          conflicts: BTreeMap::new(),
          revoked: false,
          cursor: 0,
          needs_refresh: BTreeSet::new(),
        },
      ),
      Some((generation, bytes)) => {
        let plain = open_with_aad(&bytes, key, &journal_aad(&binding, &journal_id)?)?;
        let state: Journal = serde_json::from_slice(&plain).map_err(|_| Error::InvalidSchema)?;
        if state.domain != "knapsack-shared-context-journal-v1"
          || state.binding != binding
          || state.journal_id != journal_id
        {
          return Err(Error::Authentication);
        }
        if state.heads.len() > MAX_RECORDS
          || state.pending.len() > MAX_RECORDS
          || state.conflicts.len() > MAX_RECORDS
          || state.selected.len() > MAX_RECORDS
        {
          return Err(Error::Bounds);
        }
        let lifetime = state
          .heads
          .keys()
          .chain(state.pending.keys())
          .chain(state.conflicts.keys())
          .collect::<BTreeSet<_>>();
        if lifetime.len() > MAX_RECORDS {
          return Err(Error::Bounds);
        }
        if generation == 0
          || state
            .pending
            .keys()
            .any(|id| state.conflicts.contains_key(id))
        {
          return Err(Error::InvalidSchema);
        }
        if state.cursor > MAX_REVISION
          || state.selected.iter().any(|id| !uuid(id))
          || state
            .needs_refresh
            .iter()
            .any(|id| !state.heads.contains_key(id))
        {
          return Err(Error::InvalidSchema);
        }
        for (id, remote) in &state.heads {
          if id != &remote.receipt.record_id
            || remote.receipt.account_id != binding.account_id
            || remote.receipt.key_version != binding.key_version
          {
            return Err(Error::Authentication);
          }
          remote.open(key)?;
        }
        for (id, pending) in &state.pending {
          if id != &pending.record_id || pending.binding != binding {
            return Err(Error::Authentication);
          }
          pending.preview(key)?;
        }
        for (id, conflict) in &state.conflicts {
          if id != &conflict.local.record_id
            || conflict.local.binding != binding
            || state.heads.get(id).map(|h| h.receipt.revision) != Some(conflict.remote_revision)
          {
            return Err(Error::Authentication);
          }
          if conflict
            .acknowledged
            .as_ref()
            .is_some_and(|receipt| !conflict.local.receipt_matches(receipt))
          {
            return Err(Error::Authentication);
          }
          conflict.local.preview(key)?;
        }
        (generation, state)
      }
    };
    let mut session = [0; 32];
    getrandom::getrandom(&mut session).map_err(|_| Error::Io("Secure randomness unavailable"))?;
    let revoked_latch = state.revoked;
    Ok(Self {
      store,
      state,
      generation,
      epoch: 0,
      session,
      active: false,
      revoked_latch,
    })
  }
  fn commit(&mut self, state: Journal, key: &RecoveryKey, reserved: bool) -> Result<()> {
    let plain =
      zeroize::Zeroizing::new(serde_json::to_vec(&state).map_err(|_| Error::InvalidSchema)?);
    if plain.len() > if reserved { MAX_JOURNAL } else { NORMAL_BUDGET } {
      return Err(Error::Bounds);
    }
    let bytes = seal_with_aad(
      &plain,
      key,
      &journal_aad(&state.binding, &state.journal_id)?,
    )?;
    let generation = match self.store.compare_and_save(self.generation, &bytes) {
      Ok(generation) => generation,
      Err(error) => {
        self.pause();
        return Err(error);
      }
    };
    if generation != self.generation.checked_add(1).ok_or(Error::Bounds)? {
      self.pause();
      return Err(Error::InvalidArchive);
    }
    self.generation = generation;
    self.state = state;
    Ok(())
  }
  pub fn enroll(
    &mut self,
    key: &RecoveryKey,
    verified: &Binding,
    selected: BTreeSet<String>,
    confirm: bool,
  ) -> Result<()> {
    self.pause();
    if !confirm
      || self.state.revoked
      || self.revoked_latch
      || verified != &self.state.binding
      || selected.len() > MAX_RECORDS
      || selected.iter().any(|id| !uuid(id))
    {
      return Err(Error::Authentication);
    }
    let mut next = self.state.clone();
    next.selected = selected;
    self.commit(next, key, true)?;
    self.active = true;
    Ok(())
  }
  pub fn pause(&mut self) {
    self.active = false;
    self.epoch = self.epoch.saturating_add(1);
  }
  fn allowed(&self, id: &str) -> Result<()> {
    if !self.active || self.state.revoked || self.revoked_latch || !self.state.selected.contains(id)
    {
      return Err(Error::Authentication);
    }
    Ok(())
  }
  pub fn queue(
    &mut self,
    key: &RecoveryKey,
    record: SelectedRecord,
    mutation_id: String,
  ) -> Result<()> {
    let kind = record.validate()?;
    let id = record.record_id.clone();
    self.allowed(&id)?;
    if self
      .state
      .heads
      .get(&id)
      .is_some_and(|head| head.receipt.deleted || head.receipt.kind != kind)
    {
      return Err(Error::InvalidSchema);
    }
    self.queue_payload(key, id, kind, Some(record), mutation_id)
  }
  pub fn delete(
    &mut self,
    key: &RecoveryKey,
    id: &str,
    mutation_id: String,
    confirm: bool,
  ) -> Result<()> {
    self.allowed(id)?;
    if !confirm {
      return Err(Error::Authentication);
    }
    let head = self.state.heads.get(id).ok_or(Error::InvalidSchema)?;
    if head.receipt.deleted {
      return Err(Error::InvalidSchema);
    }
    self.queue_payload(key, id.into(), head.receipt.kind.clone(), None, mutation_id)
  }
  fn queue_payload(
    &mut self,
    key: &RecoveryKey,
    id: String,
    kind: RecordKind,
    record: Option<SelectedRecord>,
    mutation_id: String,
  ) -> Result<()> {
    if !uuid(&mutation_id) {
      return Err(Error::InvalidSchema);
    }
    if self.state.pending.contains_key(&id)
      || self.state.conflicts.contains_key(&id)
      || self.state.pending.len() >= MAX_RECORDS
    {
      return Err(Error::UnstableSnapshot);
    }
    let lifetime = self
      .state
      .heads
      .keys()
      .chain(self.state.pending.keys())
      .chain(self.state.conflicts.keys())
      .collect::<BTreeSet<_>>();
    if !lifetime.contains(&id) && lifetime.len() >= MAX_RECORDS {
      return Err(Error::Bounds);
    }
    if self
      .state
      .pending
      .values()
      .any(|m| m.mutation_id == mutation_id)
      || self
        .state
        .heads
        .values()
        .any(|m| m.receipt.mutation_id == mutation_id)
      || self
        .state
        .conflicts
        .values()
        .any(|m| m.local.mutation_id == mutation_id)
    {
      return Err(Error::InvalidSchema);
    }
    let expected_revision = self
      .state
      .heads
      .get(&id)
      .map(|m| m.receipt.revision)
      .unwrap_or(0);
    let mut mutation = Mutation {
      protocol: 1,
      binding: self.state.binding.clone(),
      record_id: id.clone(),
      kind,
      expected_revision,
      mutation_id,
      deleted: record.is_none(),
      ciphertext: Vec::new(),
    };
    if let Some(record) = record {
      let payload = Payload {
        domain: "knapsack-shared-context-record-v1".into(),
        binding: mutation.binding.clone(),
        mutation_id: mutation.mutation_id.clone(),
        record,
      };
      let plain =
        zeroize::Zeroizing::new(serde_json::to_vec(&payload).map_err(|_| Error::InvalidSchema)?);
      mutation.ciphertext = seal_with_aad(
        &plain,
        key,
        &aad(
          &mutation.binding.account_id,
          &id,
          &mutation.kind,
          expected_revision + 1,
          &mutation.binding.key_version,
        )?,
      )?;
    }
    mutation.validate()?;
    let mut next = self.state.clone();
    let reserved = mutation.deleted;
    next.pending.insert(id, mutation);
    self.commit(next, key, reserved)
  }
  pub fn validate_binding(&self, expected: &Binding) -> Result<()> {
    if !self.active || self.state.revoked || self.revoked_latch || expected != &self.state.binding {
      return Err(Error::Authentication);
    }
    Ok(())
  }
  pub fn prepare_read(&self, id: &str) -> Result<ReadLease> {
    self.allowed(id)?;
    Ok(ReadLease {
      epoch: self.epoch,
      session: self.session,
      record_id: id.into(),
    })
  }
  pub fn validate_read(&self, lease: &ReadLease) -> Result<()> {
    self.allowed(&lease.record_id)?;
    if lease.epoch != self.epoch || lease.session != self.session {
      return Err(Error::Authentication);
    }
    Ok(())
  }
  pub fn prepare_page(&self) -> Result<PageLease> {
    if !self.active || self.state.revoked || self.revoked_latch {
      return Err(Error::Authentication);
    }
    Ok(PageLease {
      epoch: self.epoch,
      session: self.session,
      cursor: self.cursor(),
    })
  }
  pub fn validate_page(&self, lease: &PageLease) -> Result<()> {
    if !self.active
      || self.state.revoked
      || self.revoked_latch
      || lease.epoch != self.epoch
      || lease.session != self.session
      || lease.cursor != self.cursor()
    {
      return Err(Error::Authentication);
    }
    Ok(())
  }
  pub fn is_selected(&self, id: &str) -> Result<bool> {
    self.prepare_page()?;
    Ok(self.state.selected.contains(id))
  }
  pub fn prepare(&self, id: &str) -> Result<Lease> {
    if self.state.conflicts.contains_key(id) {
      return Err(Error::UnstableSnapshot);
    }
    self.reconcile(id, true)
  }
  /// Reconcile an immutable interrupted write, never create a replacement draft.
  pub fn reconcile(&self, id: &str, confirm: bool) -> Result<Lease> {
    self.allowed(id)?;
    if self
      .state
      .conflicts
      .get(id)
      .is_some_and(|c| c.acknowledged.is_some())
    {
      return Err(Error::InvalidSchema);
    }
    if !confirm {
      return Err(Error::Authentication);
    }
    Ok(Lease {
      epoch: self.epoch,
      session: self.session,
      mutation: self
        .state
        .pending
        .get(id)
        .or_else(|| self.state.conflicts.get(id).map(|c| &c.local))
        .ok_or(Error::InvalidSchema)?
        .clone(),
    })
  }
  fn validate_remote(&self, key: &RecoveryKey, remote: &RemoteRecord) -> Result<()> {
    if remote.receipt.account_id != self.state.binding.account_id
      || remote.receipt.key_version != self.state.binding.key_version
    {
      return Err(Error::Authentication);
    }
    remote.open(key)?;
    Ok(())
  }
  pub fn validate_lease(&self, lease: &Lease) -> Result<()> {
    self.allowed(&lease.mutation.record_id)?;
    if lease.epoch != self.epoch
      || lease.session != self.session
      || self
        .state
        .pending
        .get(&lease.mutation.record_id)
        .or_else(|| {
          self
            .state
            .conflicts
            .get(&lease.mutation.record_id)
            .map(|c| &c.local)
        })
        != Some(&lease.mutation)
    {
      return Err(Error::UnstableSnapshot);
    }
    Ok(())
  }
  pub fn complete(&mut self, key: &RecoveryKey, lease: &Lease, result: Completion) -> Result<()> {
    self.validate_lease(lease)?;
    match result {
      Completion::Uncertain => Ok(()),
      Completion::Revoked => {
        self.revoked_latch = true;
        self.pause();
        let mut next = self.state.clone();
        next.revoked = true;
        self.commit(next, key, true)
      }
      Completion::Confirmed(receipt) => {
        if !lease.mutation.receipt_matches(&receipt) {
          return Err(Error::Authentication);
        }
        let mut next = self.state.clone();
        let snapshot = RemoteRecord {
          ciphertext: if receipt.deleted {
            None
          } else {
            Some(lease.mutation.ciphertext.clone())
          },
          receipt: receipt.clone(),
        };
        self.validate_remote(key, &snapshot)?;
        if let Some(head) = next.heads.get(&receipt.record_id) {
          if head.receipt.revision == receipt.revision && head != &snapshot {
            return Err(Error::Authentication);
          }
          if head.receipt.revision < receipt.revision && receipt.sequence <= head.receipt.sequence {
            return Err(Error::Authentication);
          }
          if head.receipt.revision < receipt.revision {
            if !receipt.deleted {
              next.needs_refresh.insert(receipt.record_id.clone());
            } else {
              next.needs_refresh.remove(&receipt.record_id);
            }
            next.heads.insert(receipt.record_id.clone(), snapshot);
          }
        } else {
          if next.heads.len() >= MAX_RECORDS {
            return Err(Error::Bounds);
          }
          if !receipt.deleted {
            next.needs_refresh.insert(receipt.record_id.clone());
          }
          next.heads.insert(receipt.record_id.clone(), snapshot);
        }
        // Historical receipt acknowledges only that write; never regresses a
        // newer head/tombstone or discards a conflict's complete local draft.
        if !receipt.deleted
          && next
            .heads
            .get(&receipt.record_id)
            .is_some_and(|head| head.receipt.revision <= receipt.revision)
        {
          next.needs_refresh.insert(receipt.record_id.clone());
        }
        if let Some(conflict) = next.conflicts.get_mut(&receipt.record_id) {
          conflict.acknowledged = Some(receipt.clone());
        }
        next.pending.remove(&receipt.record_id);
        self.commit(next, key, true)
      }
      Completion::Conflict(remote) => {
        if remote.receipt.record_id != lease.mutation.record_id
          || remote.receipt.kind != lease.mutation.kind
        {
          return Err(Error::Authentication);
        }
        self.observe(key, remote)
      }
    }
  }
  fn merge_remote(
    &self,
    key: &RecoveryKey,
    next: &mut Journal,
    remote: RemoteRecord,
  ) -> Result<()> {
    self.allowed(&remote.receipt.record_id)?;
    self.validate_remote(key, &remote)?;
    if let Some(head) = next.heads.get(&remote.receipt.record_id) {
      if remote.receipt.revision < head.receipt.revision {
        return Ok(());
      }
      if remote.receipt.revision == head.receipt.revision {
        if &remote == head {
          next.needs_refresh.remove(&remote.receipt.record_id);
          return Ok(());
        }
        return Err(Error::Authentication);
      }
      if remote.receipt.sequence <= head.receipt.sequence {
        return Err(Error::Authentication);
      }
      if head.receipt.deleted {
        return Err(Error::InvalidSchema);
      }
      if head.receipt.kind != remote.receipt.kind {
        return Err(Error::InvalidSchema);
      }
    }
    if let Some(local) = next.pending.get(&remote.receipt.record_id) {
      if !local.receipt_matches(&remote.receipt) {
        next.conflicts.insert(
          remote.receipt.record_id.clone(),
          ConflictDraft {
            local: local.clone(),
            remote_revision: remote.receipt.revision,
            acknowledged: None,
          },
        );
        next.pending.remove(&remote.receipt.record_id);
      }
    }
    if next.heads.len() >= MAX_RECORDS && !next.heads.contains_key(&remote.receipt.record_id) {
      return Err(Error::Bounds);
    }
    if let Some(conflict) = next.conflicts.get_mut(&remote.receipt.record_id) {
      conflict.remote_revision = remote.receipt.revision;
    }
    next.needs_refresh.remove(&remote.receipt.record_id);
    next.heads.insert(remote.receipt.record_id.clone(), remote);
    Ok(())
  }
  pub fn observe(&mut self, key: &RecoveryKey, remote: RemoteRecord) -> Result<()> {
    let reserved = remote.receipt.deleted;
    let mut next = self.state.clone();
    self.merge_remote(key, &mut next, remote)?;
    self.commit(next, key, reserved)
  }
  pub fn cursor(&self) -> String {
    format!("{}:{}", self.state.binding.account_id, self.state.cursor)
  }
  pub fn apply_page(
    &mut self,
    key: &RecoveryKey,
    from: &str,
    to: &str,
    changes: Vec<Change>,
  ) -> Result<()> {
    if !self.active || self.state.revoked || from != self.cursor() || changes.len() > 50 {
      return Err(Error::Authentication);
    }
    let prefix = format!("{}:", self.state.binding.account_id);
    let end = to
      .strip_prefix(&prefix)
      .and_then(|s| s.parse::<u64>().ok())
      .ok_or(Error::InvalidSchema)?;
    let mut next = self.state.clone();
    let mut sequence = next.cursor;
    let mut new_live_content = false;
    for change in changes {
      change.event.validate()?;
      if change.event.account_id != next.binding.account_id
        || change.event.sequence != sequence.checked_add(1).ok_or(Error::Bounds)?
      {
        return Err(Error::InvalidSchema);
      }
      sequence = change.event.sequence;
      if next.selected.contains(&change.event.record_id) {
        let latest = change.latest.ok_or(Error::UnstableSnapshot)?;
        if change.event.deleted && !latest.receipt.deleted {
          return Err(Error::InvalidSchema);
        }
        if latest.receipt.record_id != change.event.record_id
          || latest.receipt.kind != change.event.kind
          || latest.receipt.revision < change.event.revision
          || latest.receipt.sequence < change.event.sequence
        {
          return Err(Error::InvalidSchema);
        }
        if latest.receipt.revision == change.event.revision && latest.receipt != change.event {
          return Err(Error::Authentication);
        }
        if !latest.receipt.deleted
          && next
            .heads
            .get(&latest.receipt.record_id)
            .map(|h| h.receipt.revision)
            .unwrap_or(0)
            < latest.receipt.revision
        {
          new_live_content = true;
        }
        self.merge_remote(key, &mut next, latest)?;
      } else if change.latest.is_some() {
        return Err(Error::Authentication);
      }
    }
    if end != sequence {
      return Err(Error::InvalidSchema);
    }
    next.cursor = end;
    self.commit(next, key, !new_live_content)
  }
  pub fn discard_conflict(
    &mut self,
    key: &RecoveryKey,
    id: &str,
    reviewed_revision: u64,
    reviewed_mutation: &str,
    confirm: bool,
  ) -> Result<()> {
    self.allowed(id)?;
    let conflict = self.state.conflicts.get(id).ok_or(Error::InvalidSchema)?;
    if !confirm
      || conflict.local.mutation_id != reviewed_mutation
      || conflict.remote_revision != reviewed_revision
      || self.state.heads.get(id).map(|h| h.receipt.revision) != Some(reviewed_revision)
    {
      return Err(Error::UnstableSnapshot);
    }
    let mut next = self.state.clone();
    next.pending.remove(id);
    next.conflicts.remove(id);
    self.commit(next, key, true)
  }
  pub fn conflict(&self, id: &str) -> Result<Option<Conflict>> {
    self.allowed(id)?;
    self
      .state
      .conflicts
      .get(id)
      .map(|c| {
        Ok(Conflict {
          local: c.local.clone(),
          remote: self
            .state
            .heads
            .get(id)
            .ok_or(Error::InvalidArchive)?
            .clone(),
          acknowledged: c.acknowledged.clone(),
        })
      })
      .transpose()
  }
  pub fn imported(&self, key: &RecoveryKey, id: &str) -> Result<ImportedContext> {
    self.allowed(id)?;
    if self.state.needs_refresh.contains(id) {
      return Err(Error::UnstableSnapshot);
    }
    let head = self.state.heads.get(id).ok_or(Error::InvalidSchema)?;
    Ok(ImportedContext {
      record: head.open(key)?,
      source_device_id: head.receipt.source_device_id.clone(),
      revision: head.receipt.revision,
    })
  }
}
/// Historical data only. No conversion to active conversation/tool messages,
/// executable jobs, approvals, permissions, provider settings or instructions.
pub struct ImportedContext {
  pub record: Option<SelectedRecord>,
  pub source_device_id: String,
  pub revision: u64,
}
#[cfg(test)]
mod tests;
