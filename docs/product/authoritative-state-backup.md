# Authoritative GBrain state and account backup (review draft)

## Scope and safety boundary

This change makes the existing local GBrain the authoritative context and structured
work store. It does not create another task database. It reuses:

- GBrain Markdown for owned context, decisions and source notes.
- `.knapsack/loops-v1.json` for definitions, tasks, approvals, evidence and transitions.
- `.knapsack/follow-through-v1.json` for commitments, drafts, delivery/reply evidence and history.
- `.knapsack/goals-v1.json` for goals, key results, links and observations.

The accompanying Knapsack API patch stores only authenticated ciphertext for the
signed-in user's server-derived account ID. The API is feature-gated OFF by default.
No real account backup, migration, credential creation, deployment or publication
was performed as part of this implementation.

This is not multi-device synchronization or an always-on cloud executor. It does
not persist in-process agent-team jobs or replace their executor. Chats, synced
mail/calendar/Drive databases, raw meeting media, runtime instructions, provider
settings, tokens and other credential stores are outside this backup boundary.

## Local authority and migration

Existing `~/gbrain` is adopted in place. Until the user enables account backup it
continues to work locally, with no data copied to a service. A versioned local
`~/.knapsack/authoritative-state-v1.json` records the selected root, device UUID,
account ownership, explicit backup choices, epoch/revision and last confirmed
backup receipt. It never contains recovery keys, bearer tokens or passwords.

Existing GBrain, Loops, Goals, Follow-through and mobile reads resolve that root.
Atomic private writes and a shared snapshot/commit mutex prevent capturing
half-written app-owned records. Loops and Goals also serialize whole local
read/modify/write transactions. A retired generation rejects late writes;
Follow-through pins its resolved generation before any read or asynchronous work.

The pointer/config schema and all bundled state schemas must be version 1.
Unsupported or corrupt versions fail closed rather than silently resetting state.
Native configuration cannot be supplied or overwritten by a downloaded archive.

Once adopted for account A, that local GBrain cannot be uploaded to or restored
from account B just because someone switches sign-in. This V1 requires returning
to the owning account; ownership transfer/export is deliberately not implicit.

## Consent, account recovery and key custody

Backup is OFF until a user explicitly opts in through native Settings. Signing in
alone does not enable it. Consent binds one local GBrain, immutable account ID
and device identity. The agent gateway/localhost HTTP API cannot enable backup or
restore: these actions are native Tauri commands.

The selected recovery model is **account recovery through the same verified
Knapsack Google/Microsoft identity**, without a separate recovery code. Recovering
that identity at the provider can restore access once Knapsack verifies the stable
provider identity and recent authentication. An email address or password alone
is not an encryption key or sufficient proof of account ownership.

The native client encrypts content with a random 256-bit data-encryption key and
RustCrypto XChaCha20-Poly1305. The service stores only a KMS-wrapped data key bound
to the immutable Knapsack account, opaque key ID/version, environment and purpose.
The configured KMS key is server-selected, never supplied by the caller. Raw keys
are not stored beside snapshots and are never derived from passwords, email or
access tokens. Snapshot metadata records the immutable key version so retained
snapshots do not lose their key association.

The authorized Knapsack recovery service **can recover keys and decrypt backup
contents**. This is server-managed envelope encryption, not a zero-knowledge or
only-the-user encryption promise. Settings explicitly discloses this tradeoff
before opt-in. The backend returns a data key only to the authenticated native
client over first-party HTTPS, with no-store responses, recent-provider/device/
purpose checks, security-event emission, concurrency bounds and telemetry redaction.
Deployment-wide durable audit collection and per-account rate limiting remain
separate, unverified launch requirements. No raw data key is
returned through Tauri IPC to React, shown as a code, or accepted from UI arguments.

Automatic backup separately asks permission to cache the key in the native OS
credential store for use while the app is running. macOS Keychain and persistent
Linux Secret Service are configured explicitly; there is no plaintext/mock fallback
in production. Missing/locked storage pauses automation. Manual backup and restore
use the account recovery service and its verified recent-authentication checks.
Account sign-in now preserves local/BYOK inference selection. Selecting Knapsack
for inference remains the existing explicit Use Knapsack action. Disconnect also
preserves a different active provider.

### Default-off integration gates

Repository inspection found boto3 already installed, but no existing KMS wrapping
implementation or configured key ARN. The patch provides a fail-closed provider
interface and AWS KMS adapter; it does not create keys, IAM grants, credentials or
infrastructure. A deployment owner must choose the approved KMS key/environment,
least-privilege workload role, availability/rotation/retention policy and validate
its key policy. No raw local-key or application-secret fallback is allowed.

The existing authentication code uses email-oriented legacy sessions and does not
preserve genuine provider auth_time or stable issuer/subject mapping through its
refresh/desktop-code flow. The backup patch therefore requires reviewed immutable
account-principal and recent-provider-auth verifier interfaces that are unavailable
by default. Issuing a fresh desktop JWT from an old refresh cookie cannot substitute
for provider reauthentication. Configuration flags alone cannot bypass these gates.
Consequential backup routes and enrollment remain blocked until that real identity
integration is implemented and verified. `/me` exposes capability/blocker status
so Settings gives an accurate unavailable state rather than a recovery-code fallback.

Wrapped-key enrollment occurs before upload authority, at expected epoch 0 for a
new account, and does not itself enable backup. Existing private-key ciphertext is
not silently converted. This draft does not implement key rotation or migration
from the earlier private-key prototype. Retained wrapped-key associations must be
preserved if rotation is added later.

The secure archive filesystem currently supports macOS and Linux. Windows rejects
before key storage or authority mutation. Core format/validation details are in
`src/state-backup-core/README.md`. V1 caps source at 8 MiB, one file at 4 MiB, an
envelope at 16 MiB and count at 10,000. Names must be ASCII-portable. Unsupported
paths and suspected credentials fail the backup rather than silently omitting notes.
Credential detection is defense in depth, not proof that notes contain no secrets.

## Automatic backup and failure handling

While the app is running, the scheduler checks opted-in automatic backup after
startup and then every 15 minutes. It encrypts changed authoritative content only;
identical content with a current confirmed revision is skipped. Failures back off
up to one hour and appear in status. This does not run after the app closes.

Each upload checks native consent, current account, device identity and server
epoch. The service uses row-locked compare-and-set on the expected revision. Only
one authoritative device can advance it. Stale devices/epochs/revisions receive
409. Account changes/sign-out revoke local scheduling and cancel upload requests;
configuration commits compare the session generation while holding the same
configuration mutex as revocation, so a stale completion cannot restore consent.
A request already committed remotely may still exist; no claim of undoing a
completed upload is made.

Before upload, the client persists an encrypted retry envelope plus non-secret
metadata outside GBrain. An uncertain response retries the same snapshot ID and
identical bytes; the server checks idempotency against owner, device, epoch,
revision and digest. The client advances status only after validating the server
receipt against the exact uploaded envelope. Pending envelopes are authenticated
again before egress. No plaintext retry archive is created.

The account API retains the latest three ciphertext snapshots, each at most
16 MiB. Disable stops local uploads immediately; it attempts to fence the server
without deleting retained snapshots. If offline, Settings reports that the local
change succeeded while the server could not be updated. Re-enabling requires
explicit review. Turning backup off is not a deletion request.

## Privacy Mode

Existing Privacy Mode controls inference and telemetry; explicitly connected
services can still communicate. Encrypted backup is a separate, disclosed,
account-scoped opt-in in either inference privacy mode. It retains ciphertext in
the Knapsack account and never changes the selected inference/telemetry policy.
The data-egress manifest and Privacy Mode scope copy document this boundary.

## Replacement-device restore

1. The user explicitly checks the signed-in account and reviews its latest backup.
2. The client downloads bounded ciphertext and authenticates the complete bundle
   with the native-only account-recovered key and verified immutable account ID before writing any state.
3. The core validates paths, file/manifest hashes, schemas, versions and limits;
   creates a private sibling staging tree; fsyncs it; and atomically publishes a
   new absent generation without replacing even a racing empty directory.
4. Only a durably published generation is eligible for activation. Server takeover
   checks both the reviewed authority epoch and revision in one transaction, so
   a newer backup cannot be silently rolled back during restore.
5. The app atomically changes its local root pointer under the writer lock. The
   old root is retained. A crash before pointer commit leaves the old root usable;
   an unreferenced private staged/restored directory may remain for inspection.
6. Backup consent and OS-keychain choices are not restored or re-enabled. The user
   restarts the app, reviews restored work, and explicitly enables future backup.

Restoration pauses active Loops, expires unfinished runs, clears all live approval
fields, pauses follow-through polling and active goals, and preserves evidence,
drafts, completed/dismissed history and prior approvals only as historical events.
It never calls an executor, sends a message, grants a connector capability or
replays an external action. Original encrypted snapshots retain historical data.

Native metadata rename and fsync can have different outcomes. A post-rename fsync
failure says state was committed with uncertain durability. Settings reconciles
its local root after any restore error and requires restart/verification when the
root changed or status could not be read; it does not assume every error means
nothing changed.

## Legacy advisory references

The archive preserves historical/advisory references that the native app does not
enforce as foreign keys. Examples include historical goal observations after a
key result was removed, links to absent loops and optional run candidate IDs
without surviving candidates. Those references remain inert evidence; backup and
restore return generic local review warnings displayed in Settings. Records are
not discarded or reinterpreted, and warnings do not enable work or permissions.

Warnings are recomputed from validated content, never trusted from the archive.
Strict structural, version, hash, path and unique-ID checks remain, along with
executable-parent checks such as a run's loop definition and a follow-through
record's source run. Restored active work is still paused/expired and live approvals
cleared. The existing local state descriptor defaults older files to no warnings.

## Server contract and rollout gates

The coordinated `knap` patch adds `/api/state-backup/me`, `/key`, `/authority`, `/disable`,
`/snapshots` and `/snapshots/{id|latest}`. Access-token authentication plus a trusted immutable-account verifier resolves
the owner; body/header IDs never select that identity. Refresh/API-client
and service credentials are rejected. Ciphertext lives in dedicated PostgreSQL
metadata/blob tables, never the existing plaintext note/shared-file upload API.
`User.is_active` is analytics history in this repository, not a revocation flag,
and is correctly not treated as account authorization.

Takeover includes `expected_revision` and genuine recent-provider proof for its purpose/device. Upload headers bind device, epoch, expected
revision and snapshot UUID. The server transaction inserts the immutable snapshot,
advances its pointer and retains only the newest three together. An outermost ASGI
download limiter holds admission through the final socket send, including the
existing body-buffering middleware. Fleet-level quotas/limits still need review.

Before enabling the default-off server gate, validate:

- The SQL migration and concurrent first claim/upload/takeover against disposable
  PostgreSQL using the included opt-in integration test.
- Full application route/auth/middleware integration and deployment-wide capacity.
- Full native app compile and real macOS Keychain/Linux Secret Service behavior,
  including locked-store errors, sign-out, restart, restore and shutdown races.
- End-to-end backup on a test account and restoration on a separate test profile.
- Approved KMS configuration, stable-provider identity mapping and genuine recent-auth proof integration.
- Account recovery disclosure, key/DB-backup retention and operator-access policy review.
- Protected durable audit collection and per-account/fleet recovery rate limits.

## Verification commands

From repository root:

```
cargo test --manifest-path src/state-backup-core/Cargo.toml
python src/scripts/test-state-backup-adapter.py
cd src && node --test scripts/state-backup-ui.test.cjs
cd src && npx tsc --noEmit
cd src && cargo test --manifest-path src-tauri/Cargo.toml --no-default-features
```

The adapter harness compiles the actual backup/GBrain/Loops/Goals/Follow-through
source after removing Tauri command attributes, with test-only auth, inference,
mail and secure-store surfaces. It verifies real local-state logic and regressions;
it does not validate IPC macro generation, real native stores or the full app.
The full native test attempt in this cloud workspace is blocked by missing
`glib-2.0`/GTK development libraries. macOS platform verification requires an
authorized macOS executor. Those checks must not be reported as passed.
