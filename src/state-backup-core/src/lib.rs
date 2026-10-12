//! Versioned, account-bound encrypted backups of the authoritative GBrain state.
//!
//! This crate performs no networking and never persists recovery keys. Callers must
//! serialize `snapshot` against *all* GBrain writers. A second complete read also
//! detects ordinary concurrent edits; it is not a substitute for that lock.
//! Restores create a new, absent root only and always disable restored live work.
//! Linux and macOS are supported; other platforms fail closed until equivalent
//! descriptor-relative, no-follow and atomic no-replace operations are provided.
pub mod conversations;
mod filesystem;
mod schema;
mod secrets;

use chacha20poly1305::{
  aead::{Aead, KeyInit, Payload},
  XChaCha20Poly1305, XNonce,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{collections::HashMap, fmt, path::Path};
use zeroize::{Zeroize, Zeroizing};

const MAGIC: &[u8; 8] = b"KNGBACK1";
const VERSION: u32 = 1;
const HEADER_LEN: usize = 8 + 4 + 24;
const MAX_ACCOUNT_LEN: usize = 256;
pub const STRUCTURED_FILES: [&str; 3] = [
  ".knapsack/loops-v1.json",
  ".knapsack/follow-through-v1.json",
  ".knapsack/goals-v1.json",
];

/// Errors never include file contents, credentials, keys, or account identifiers.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
  Io(&'static str),
  InvalidKey,
  InvalidAccount,
  Authentication,
  UnsupportedVersion,
  InvalidArchive,
  InvalidPath,
  PathCollision,
  UnsupportedEntry,
  SecretDetected,
  InvalidSchema,
  Bounds,
  UnstableSnapshot,
  DestinationExists,
  UnsupportedPlatform,
}
impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    f.write_str(match self {
      Self::Io(op) => op,
      Self::InvalidKey => "Recovery key must be 64 hexadecimal characters",
      Self::InvalidAccount => "An opaque account ID is required",
      Self::Authentication => {
        "Backup authentication failed (wrong account, recovery key, or damaged backup)"
      }
      Self::UnsupportedVersion => "Unsupported backup or state schema version",
      Self::InvalidArchive => "Invalid backup manifest or content digest",
      Self::InvalidPath => "Backup includes a non-portable or disallowed path",
      Self::PathCollision => "Backup includes duplicate or case-colliding paths",
      Self::UnsupportedEntry => "Backup source includes a symlink, executable, or special file",
      Self::SecretDetected => {
        "Potential credential detected; remove it from the eligible state before backing up"
      }
      Self::InvalidSchema => "Malformed or inconsistent structured state",
      Self::Bounds => "Backup exceeds configured limits",
      Self::UnstableSnapshot => {
        "Authoritative state changed while reading; retry after writes finish"
      }
      Self::DestinationExists => "Restore requires a new, absent destination",
      Self::UnsupportedPlatform => "Secure filesystem operation is unsupported on this platform",
    })
  }
}
impl std::error::Error for Error {}
pub type Result<T> = std::result::Result<T, Error>;

/// A random 256-bit recovery key. Intentionally has no Debug, Clone, or serde impl.
/// Callers must not put the exported key in settings, logs, storage, or telemetry.
pub struct RecoveryKey(Zeroizing<[u8; 32]>);
impl RecoveryKey {
  pub fn generate() -> Result<Self> {
    let mut bytes = Zeroizing::new([0u8; 32]);
    getrandom::getrandom(bytes.as_mut()).map_err(|_| Error::Io("Secure randomness unavailable"))?;
    Ok(Self(bytes))
  }
  pub fn from_hex(value: &str) -> Result<Self> {
    if value.len() != 64 {
      return Err(Error::InvalidKey);
    }
    let mut bytes = Zeroizing::new([0u8; 32]);
    hex::decode_to_slice(value, bytes.as_mut()).map_err(|_| Error::InvalidKey)?;
    Ok(Self(bytes))
  }
  /// Explicitly export for a user-controlled recovery flow. Zeroize the returned
  /// string when possible and do not save it with the ciphertext.
  pub fn to_hex(&self) -> Zeroizing<String> {
    Zeroizing::new(hex::encode(self.0.as_ref()))
  }
}

/// Hard caps apply to source, decrypted plaintext, individual files and restored data.
#[derive(Debug, Clone, Copy)]
pub struct Limits {
  pub max_files: usize,
  pub max_file_bytes: usize,
  pub max_total_bytes: usize,
  pub max_archive_bytes: usize,
  pub max_depth: usize,
}
impl Default for Limits {
  fn default() -> Self {
    Self {
      max_files: 10_000,
      max_file_bytes: 4 * 1024 * 1024,
      max_total_bytes: 8 * 1024 * 1024,
      max_archive_bytes: 16 * 1024 * 1024,
      max_depth: 32,
    }
  }
}
impl Limits {
  fn validate(self) -> Result<()> {
    if self.max_files == 0
      || self.max_file_bytes == 0
      || self.max_total_bytes == 0
      || self.max_archive_bytes < HEADER_LEN + 16
      || self.max_depth == 0
      || self.max_depth > 64
    {
      Err(Error::Bounds)
    } else {
      Ok(())
    }
  }
}

#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Entry {
  path: String,
  bytes: usize,
  sha256: String,
  content: String,
}
impl Drop for Entry {
  fn drop(&mut self) {
    self.content.zeroize();
  }
}
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Manifest {
  schema_version: u32,
  account_id: String,
  manifest_sha256: String,
  files: Vec<Entry>,
}

/// Verified source material, kept in memory. No Debug or Serialize implementation:
/// accidental logging or plaintext persistence requires an explicit bypass.
pub struct Snapshot {
  files: Vec<Entry>,
  warnings: Vec<String>,
}
#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotSummary {
  pub file_count: usize,
  pub total_bytes: usize,
}
impl Snapshot {
  /// Generic local-review warnings for preserved advisory/history references.
  /// Warnings contain no paths, record IDs, account IDs, or source content.
  pub fn warnings(&self) -> &[String] {
    &self.warnings
  }
  pub fn content_sha256(&self) -> String {
    manifest_digest(&self.files)
  }
  pub fn file_count(&self) -> usize {
    self.files.len()
  }
  pub fn summary(&self) -> SnapshotSummary {
    SnapshotSummary {
      file_count: self.files.len(),
      total_bytes: self.files.iter().map(|f| f.bytes).sum(),
    }
  }
  /// Names only, for a local review UI. Never send these to a backup server.
  pub fn paths(&self) -> impl Iterator<Item = &str> {
    self.files.iter().map(|f| f.path.as_str())
  }
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreReport {
  /// Historical/advisory reference gaps retained as inert evidence for review.
  pub warnings: Vec<String>,
  pub file_count: usize,
  pub total_bytes: usize,
  /// False means publishing succeeded but the final parent-directory fsync failed.
  /// Do not retry restore: the destination is already populated.
  pub durable: bool,
  pub paused_definitions: usize,
  pub expired_runs: usize,
  pub cleared_approvals: usize,
  pub paused_follow_through: usize,
  pub paused_goals: usize,
}

fn account_id(value: &str) -> Result<()> {
  if value.is_empty()
    || value.len() > MAX_ACCOUNT_LEN
    || !value
      .bytes()
      .all(|c| c.is_ascii_alphanumeric() || matches!(c, b'_' | b'-'))
  {
    return Err(Error::InvalidAccount);
  }
  Ok(())
}
fn digest(bytes: &[u8]) -> String {
  hex::encode(Sha256::digest(bytes))
}
fn manifest_digest(files: &[Entry]) -> String {
  let mut h = Sha256::new();
  h.update(b"knapsack-gbrain-manifest-v1\0");
  for file in files {
    h.update((file.path.len() as u64).to_be_bytes());
    h.update(file.path.as_bytes());
    h.update((file.bytes as u64).to_be_bytes());
    h.update(file.sha256.as_bytes());
  }
  hex::encode(h.finalize())
}
fn aad(account: &str) -> Vec<u8> {
  let mut data = b"knapsack-authoritative-gbrain-backup\0".to_vec();
  data.extend(VERSION.to_be_bytes());
  data.extend((account.len() as u32).to_be_bytes());
  data.extend(account.as_bytes());
  data
}

/// Read the complete allowlisted set twice and compare both content and names.
/// On edits return UnstableSnapshot; callers should not silently retry forever.
pub fn snapshot(root: &Path, limits: Limits) -> Result<Snapshot> {
  limits.validate()?;
  snapshot_reads(|| filesystem::read_tree(root, limits), limits)
}
fn snapshot_reads(
  mut read: impl FnMut() -> Result<Vec<Entry>>,
  limits: Limits,
) -> Result<Snapshot> {
  let first = read()?;
  let second = read()?;
  if first != second {
    return Err(Error::UnstableSnapshot);
  }
  let warnings = validate_files(&first, limits)?;
  Ok(Snapshot {
    files: first,
    warnings,
  })
}

/// Encrypt the entire manifest, filenames and contents. Only magic, version and
/// a fresh 192-bit nonce are public. The expected account is authenticated as AAD.
pub fn seal(snapshot: &Snapshot, key: &RecoveryKey, expected_account_id: &str) -> Result<Vec<u8>> {
  seal_with_limits(snapshot, key, expected_account_id, Limits::default())
}
pub fn seal_with_limits(
  snapshot: &Snapshot,
  key: &RecoveryKey,
  expected_account_id: &str,
  limits: Limits,
) -> Result<Vec<u8>> {
  limits.validate()?;
  account_id(expected_account_id)?;
  validate_files(&snapshot.files, limits)?;
  #[derive(Serialize)]
  #[serde(rename_all = "camelCase")]
  struct BorrowedManifest<'a> {
    schema_version: u32,
    account_id: &'a str,
    manifest_sha256: String,
    files: &'a [Entry],
  }
  let plaintext = Zeroizing::new(
    serde_json::to_vec(&BorrowedManifest {
      schema_version: VERSION,
      account_id: expected_account_id,
      manifest_sha256: manifest_digest(&snapshot.files),
      files: &snapshot.files,
    })
    .map_err(|_| Error::InvalidArchive)?,
  );
  if plaintext
    .len()
    .checked_add(HEADER_LEN + 16)
    .ok_or(Error::Bounds)?
    > limits.max_archive_bytes
  {
    return Err(Error::Bounds);
  }
  let mut nonce = [0u8; 24];
  getrandom::getrandom(&mut nonce).map_err(|_| Error::Io("Secure randomness unavailable"))?;
  let cipher = XChaCha20Poly1305::new_from_slice(key.0.as_ref()).map_err(|_| Error::InvalidKey)?;
  let ciphertext = cipher
    .encrypt(
      XNonce::from_slice(&nonce),
      Payload {
        msg: &plaintext,
        aad: &aad(expected_account_id),
      },
    )
    .map_err(|_| Error::Authentication)?;
  let mut result = Vec::with_capacity(HEADER_LEN + ciphertext.len());
  result.extend(MAGIC);
  result.extend(VERSION.to_be_bytes());
  result.extend(nonce);
  result.extend(ciphertext);
  Ok(result)
}

/// Fully authenticate, parse, bound, validate every digest, schema and path before
/// returning any restorable data. Account binding cannot be supplied by the archive.
pub fn open(
  envelope: &[u8],
  key: &RecoveryKey,
  expected_account_id: &str,
  limits: Limits,
) -> Result<Snapshot> {
  limits.validate()?;
  account_id(expected_account_id)?;
  if envelope.len() > limits.max_archive_bytes {
    return Err(Error::Bounds);
  }
  if envelope.len() < HEADER_LEN + 16 || &envelope[..8] != MAGIC {
    return Err(Error::InvalidArchive);
  }
  if u32::from_be_bytes(
    envelope[8..12]
      .try_into()
      .map_err(|_| Error::InvalidArchive)?,
  ) != VERSION
  {
    return Err(Error::UnsupportedVersion);
  }
  let cipher = XChaCha20Poly1305::new_from_slice(key.0.as_ref()).map_err(|_| Error::InvalidKey)?;
  let plaintext = Zeroizing::new(
    cipher
      .decrypt(
        XNonce::from_slice(&envelope[12..HEADER_LEN]),
        Payload {
          msg: &envelope[HEADER_LEN..],
          aad: &aad(expected_account_id),
        },
      )
      .map_err(|_| Error::Authentication)?,
  );
  // serde's recursion limit remains enabled. Duplicate object keys are rejected
  // at every depth before a typed parse can mask malicious ambiguous JSON.
  schema::reject_duplicate_keys(&plaintext)?;
  let manifest: Manifest = serde_json::from_slice(&plaintext).map_err(|_| Error::InvalidArchive)?;
  if manifest.schema_version != VERSION {
    return Err(Error::UnsupportedVersion);
  }
  if manifest.account_id != expected_account_id {
    return Err(Error::Authentication);
  }
  let warnings = validate_files(&manifest.files, limits)?;
  if manifest.manifest_sha256 != manifest_digest(&manifest.files) {
    return Err(Error::InvalidArchive);
  }
  Ok(Snapshot {
    files: manifest.files,
    warnings,
  })
}

/// Restore into an absent replacement-device root. Authentication should be done
/// with `open` first; no original snapshot data is mutated. All transforms and
/// validation finish in memory before a private staging directory is created.
pub fn restore_new(
  snapshot: &Snapshot,
  destination: &Path,
  restored_at: u64,
  limits: Limits,
) -> Result<RestoreReport> {
  limits.validate()?;
  let warnings = validate_files(&snapshot.files, limits)?;
  let mut report = RestoreReport {
    warnings,
    file_count: snapshot.files.len(),
    total_bytes: 0,
    durable: false,
    paused_definitions: 0,
    expired_runs: 0,
    cleared_approvals: 0,
    paused_follow_through: 0,
    paused_goals: 0,
  };
  let mut restored = Vec::with_capacity(snapshot.files.len());
  for file in &snapshot.files {
    let content = schema::restore_content(&file.path, &file.content, restored_at, &mut report)?;
    restored.push(Entry {
      path: file.path.clone(),
      bytes: content.len(),
      sha256: digest(content.as_bytes()),
      content,
    });
  }
  validate_files(&restored, limits)?;
  report.total_bytes = restored.iter().map(|f| f.bytes).sum();
  report.durable = filesystem::publish_new(&restored, destination)?;
  Ok(report)
}

fn validate_files(files: &[Entry], limits: Limits) -> Result<Vec<String>> {
  if files.len() > limits.max_files {
    return Err(Error::Bounds);
  }
  let mut total = 0usize;
  let mut paths: HashMap<String, (String, bool)> = HashMap::new();
  let mut prior: Option<&str> = None;
  for file in files {
    validate_path(&file.path, limits.max_depth)?;
    // Canonical ordering makes manifests unique, reproducible and reviewable.
    if prior.is_some_and(|p| p >= file.path.as_str()) {
      return Err(Error::PathCollision);
    }
    prior = Some(&file.path);
    // Include every directory prefix to reject Foo/a.md + foo/b.md aliases.
    let parts: Vec<_> = file.path.split('/').collect();
    for i in 1..parts.len() {
      let dir = parts[..i].join("/");
      let folded = dir.to_ascii_lowercase();
      if let Some((existing, is_file)) = paths.get(&folded) {
        if existing != &dir || *is_file {
          return Err(Error::PathCollision);
        }
      } else {
        paths.insert(folded, (dir, false));
      }
    }
    let folded = file.path.to_ascii_lowercase();
    if paths.insert(folded, (file.path.clone(), true)).is_some() {
      return Err(Error::PathCollision);
    }
    if file.bytes != file.content.len() || file.sha256 != digest(file.content.as_bytes()) {
      return Err(Error::InvalidArchive);
    }
    if file.bytes > limits.max_file_bytes {
      return Err(Error::Bounds);
    }
    total = total.checked_add(file.bytes).ok_or(Error::Bounds)?;
    if total > limits.max_total_bytes {
      return Err(Error::Bounds);
    }
    if file.content.contains('\0') {
      return Err(Error::InvalidArchive);
    }
    secrets::check(&file.content)?;
    schema::validate(&file.path, &file.content)?;
  }
  schema::validate_references(files)
}

fn portable_component(part: &str) -> bool {
  if part.is_empty()
    || part.len() > 180
    || part.starts_with('.')
    || part.ends_with(['.', ' '])
    || !part
      .bytes()
      .all(|c| c.is_ascii_alphanumeric() || matches!(c, b'_' | b'-' | b' ' | b'.'))
  {
    return false;
  }
  let base = part.split('.').next().unwrap_or("").to_ascii_lowercase();
  if matches!(base.as_str(), "con" | "prn" | "aux" | "nul")
    || (base.len() == 4
      && (base.starts_with("com") || base.starts_with("lpt"))
      && matches!(base.as_bytes()[3], b'1'..=b'9'))
  {
    return false;
  }
  true
}
fn blocked_component(part: &str) -> bool {
  let name = part.to_ascii_lowercase();
  let stem = name.strip_suffix(".md").unwrap_or(&name);
  matches!(
    stem,
    "bin"
      | "sbin"
      | "etc"
      | "proc"
      | "sys"
      | "dev"
      | "node_modules"
      | "target"
      | "dist"
      | "build"
      | "vendor"
      | "config"
      | "configuration"
      | "settings"
      | "runtime"
      | "cache"
      | "logs"
      | "tmp"
      | "temp"
      | "library"
      | "appdata"
      | "applications"
      | "system"
      | "openclaw"
      | "clawdbot"
      | "auth"
      | "oauth"
      | "password"
      | "passwords"
      | "token"
      | "tokens"
      | "secret"
      | "secrets"
      | "credentials"
      | "credential"
      | "keychain"
      | "keys"
      | "id_rsa"
      | "id_ed25519"
      | "agents"
      | "claude"
      | "skill"
      | "gemini"
  ) || [
    "api-key",
    "api_key",
    "apikey",
    "access-token",
    "access_token",
    "refresh-token",
    "refresh_token",
    "private-key",
    "private_key",
    "client-secret",
    "client_secret",
    "credential",
    "password",
  ]
  .iter()
  .any(|needle| stem.contains(needle))
}
fn validate_path(path: &str, max_depth: usize) -> Result<()> {
  if STRUCTURED_FILES.contains(&path) {
    return Ok(());
  }
  if path.len() > 1024 || !path.ends_with(".md") {
    return Err(Error::InvalidPath);
  }
  let parts: Vec<_> = path.split('/').collect();
  if parts.len() > max_depth
    || parts
      .iter()
      .any(|p| !portable_component(p) || blocked_component(p))
  {
    return Err(Error::InvalidPath);
  }
  Ok(())
}

#[cfg(test)]
mod tests;
