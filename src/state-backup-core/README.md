# Authoritative state backup core

A small Rust library, independent of Tauri and the account service. It performs
no network calls, stores no credentials, and never changes an existing GBrain.
The desktop adapter owns account authentication, explicit backup consent, a
single-authoritative-device lease, OS secure-store access, upload/download, and
switching the authoritative root after a successful restore. The production
application uses managed Knapsack account recovery; its random data key is KMS-
wrapped server-side and recovered only to native code after verified account and
recent provider authentication. The low-level `RecoveryKey` type name is retained
for this cryptographic library; it does not imply a user-facing recovery code.
Knapsack's authorized recovery service can recover/decrypt data, so the deployed
model is not zero-knowledge or only-the-user encryption.

## API

```rust,no_run
use knapsack_state_backup::{snapshot, seal, open, restore_new, Limits, RecoveryKey};
use std::path::Path;

# fn example() -> Result<(), Box<dyn std::error::Error>> {
let limits = Limits::default();
let recovery_key = RecoveryKey::generate()?;
// Self-contained library example/test key. Production receives its managed DEK
// in native code; it never exports a key through IPC or shows it in the UI.
let account_id = "opaque-user-id"; // Authenticated User.id; never a JWT or email.

// Hold the same mutation lock used by ALL authoritative GBrain writers here.
let captured = snapshot(Path::new("/Users/owner/gbrain"), limits)?;
let fingerprint = captured.content_sha256(); // Skip unchanged scheduled snapshots.
let ciphertext = seal(&captured, &recovery_key, account_id)?;

// After download on a replacement device, authenticate every byte before writing.
let verified = open(&ciphertext, &recovery_key, account_id, limits)?;
let report = restore_new(&verified, Path::new("/Users/owner/gbrain-replacement"),
                         1_800_000_000, limits)?;
if !report.durable {
    // Data was published, but the final parent fsync failed. Do not activate this
    // root or retry into it. Keep the previous active root and report the failure.
}
# Ok(())
# }
```

`RecoveryKey::from_hex` imports an exact 64-character representation of a data key. The key has
no `Debug`, `Clone`, or serde implementation and is zeroized on drop. Low-level key export creates sensitive plaintext; the application must not expose
it to UI and must avoid logs,
analytics, settings, localStorage, files and crash-report fields. Keep it only
in memory or an explicitly approved platform secure store. There is no password,
account-token or email derivation and no plaintext persistence fallback. Server
key custody is provided by the separate managed recovery integration, not this crate.

`Snapshot` has no `Debug` or serde implementation. It exposes `summary()`,
`file_count()`, `paths()` for local review, `content_sha256()`, and `warnings()`
for preserved historical/advisory reference gaps. Warnings are deterministic,
deduplicated and generic: no paths, IDs, source content, or account identities.
They are computed from validated content, never trusted as archive metadata. Its private
file buffers are zeroized on drop. The caller must not upload review paths or
fingerprints as unnecessary metadata. `seal_with_limits` supports callers with
a different explicit limit policy; `seal` uses the defaults.

## Boundaries

- Defaults: 10,000 files; 4 MiB per file; 8 MiB total UTF-8 source; 16 MiB complete
  encrypted archive; 32 path components. JSON-escaping/manifest overhead counts
  against the archive cap. Restored/transformed files are revalidated against
  the same limits before staging. Directory enumeration is also bounded.
- Positive allowlist: ordinary non-hidden lowercase-extension `.md` files,
  and precisely `.knapsack/loops-v1.json`, `follow-through-v1.json`, and
  `goals-v1.json`. The latter two names are also under `.knapsack`.
- Hidden/runtime/config/system/build/credential directories are excluded from
  traversal. Other file extensions are excluded. Runtime instruction files
  `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `GEMINI.md`, credential-named Markdown,
  executable Markdown, all encountered symlinks, hard-linked eligible files,
  special files, malformed UTF-8, and NUL-containing content fail the snapshot.
- V1 path names are deliberately ASCII-portable. Unicode names are rejected
  rather than guessed/normalized or silently omitted. Components must use
  letters, digits, spaces, underscore, hyphen or dot, cannot be hidden or end
  in spaces/dots, cannot be Windows device names, and cannot exceed 180 bytes.
  Complete paths cannot exceed 1,024 bytes. Absolute/traversal/backslash paths,
  file/directory aliases, duplicate paths and case-colliding directory prefixes
  are rejected. An unsupported path requires a user-visible repair decision.
- Credential detection blocks the complete snapshot on common private-key,
  provider-token, token-assignment, bearer, JWT and credential-URL patterns.
  JSON strings are checked again after escape decoding. This is conservative
  defense in depth, not a guarantee that every possible secret can be found.
  It can flag innocent examples; do not bypass the error or silently drop notes.
- Structured JSON must match the native v1 persisted models, including exact
  camelCase/snake_case version spelling. Unknown versions, unknown fields,
  unknown statuses, duplicate JSON keys and duplicate record IDs fail closed.
  Executable parent references (`run.loopId`, `followThrough.runId`) must resolve;
  observations must reference an existing goal and goal links must reference a
  key result within their own goal. Native-valid advisory/history gaps do not
  block backup: unavailable or different-loop run candidates, accepted candidate
  history referencing an uninstalled definition, goal links to uninstalled loops,
  and append-only observations of subsequently removed key results are preserved
  unchanged and surfaced as generic local warnings. Proposed/dismissed template
  candidates without installed definitions are routine and do not warn. No record
  is silently dropped, reassigned or granted new permission. Other malformed
  executable parent links require deliberate repair before backup/restore.
- The app's common writer/snapshot lock is mandatory. Two complete bounded
  content reads and before/after metadata checks detect additional concurrent
  edits, but cannot replace application-wide synchronization or filesystem
  transactions for writers outside the app.

## Encrypted format v1

The only public bytes are `KNGBACK1` (8 bytes), big-endian version 1 (4 bytes),
a fresh OS-random XChaCha20 nonce (24 bytes), and ciphertext plus its 16-byte tag.
The random 256-bit data key is separate from the archive. RustCrypto XChaCha20-Poly1305
`chacha20poly1305 0.10.1` authenticates a domain separator, version, length and
expected opaque account ID as additional data. Nothing in an untrusted archive
chooses the account. Wrong account, wrong key, or tampering fails authentication.

Encrypted JSON contains version, account ID, a deterministic SHA-256 manifest
digest, and sorted files with canonical path, byte length, SHA-256 and original
UTF-8 contents. The manifest digest uses domain separation and length-prefixed
paths, byte lengths and content digests. All integrity, schema, path, count and
size checks finish before any restore write. No compression or extraction
library is used, so there is no decompression expansion or archive entry routing.

## Restore safety

The original encrypted snapshot is historical evidence and retains original
approval decisions. `RestoreReport.warnings` repeats advisory/history warnings
for local review; restoring does not resolve them automatically. Restoring a separate in-memory copy:

- Pauses active loop definitions.
- Expires every nonterminal loop run, including blocked runs; clears `approval`
  on **all** runs, including terminal runs; appends a restore event preserving
  any old decision only as historical prose; retains previous events, evidence,
  drafts, dismissed candidates and source identities.
- Pauses tracking/attention follow-through; clears every `nextCheckAt`, bumps
  revisions, and appends a restore audit history marker. Dismissed/resolved
  history and message links remain intact.
- Pauses active and at-risk goals; retains achieved/deleted statuses, links and
  observations. Root-wide restore/authority audit belongs to the desktop adapter.

Restores require an **absent** destination in an existing non-symlink parent.
Directories are created at `0700`, files at `0600`, with exclusive no-follow
creation, under a random sibling staging directory. Every file and directory
is fsynced before publication. Linux `renameat2(RENAME_NOREPLACE)` and macOS
`renameatx_np(RENAME_EXCL)` atomically publish without clobbering even an empty
destination created after preflight. Failure before publication cleans staging
best-effort and leaves any existing destination untouched. A process crash can
leave a private, unreferenced staging folder; it never makes a partial tree active.
After publication, a failed final parent fsync is reported as `durable=false`,
not an ambiguous error implying nothing was written. The adapter must refuse
activation when durability is unconfirmed.

Descriptor-relative opens pin every ancestor and use `O_NOFOLLOW`; the source
root or an ancestor symlink is rejected. Linux/macOS are the current production
filesystem targets. Windows and unsupported atomic-rename platforms fail closed;
there is no weaker rename fallback. This is not protection from a malicious
same-user process with arbitrary access to the application's memory or all files.

## Tests

Run independently of the desktop's heavyweight native dependencies:

```sh
cargo test --manifest-path src/state-backup-core/Cargo.toml
```

The suite covers crypto/authentication/tampering, manifest hashes, limits, version
and schema checks, escaped secrets, allowlist, adversarial paths/collisions,
symlinks/hardlinks/special files, inert restore and approval replay, historical
preservation, cross-file references, private modes, deterministic two-pass edits,
preflight failures, midway staging cleanup, no-clobber publication races, and
native-valid orphan/advisory-history round trips with warnings and inert work.
