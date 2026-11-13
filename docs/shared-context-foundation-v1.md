# Shared-context v1: local, dormant foundation

Baseline: a640afea9. Selected-record sync is separate from one-writer checkpoint backup. No existing backup/account-continuity release gate is enabled, and no production data is migrated or transmitted.

## Implemented local pieces

`knapsack_state_backup::shared_context` coordinates explicitly selected conversation and curated-context records. Conversation payloads allow user/assistant text only. The strict native schema has no attachments, raw database/media input, provider settings, machine-path fields, permissions, tool grants, approvals or pending actions. Credential/common absolute-path detection is conservative defense in depth; manual review remains required and cannot guarantee arbitrary pasted secrets are absent.

The existing XChaCha20Poly1305 primitive is reused, with separate AAD domains for records and journals. Record AAD binds schema version, account, record, kind, revision and key version. Source device, enrollment epoch, mutation and source-record attribution are authenticated inside the encrypted payload. Existing legacy conversation envelopes retain their original format and bounds. Managed account recovery lets Knapsack recover keys and decrypt records; this is not server-blind/end-to-end storage.

The durable journal contains encrypted record bodies, immutable pending mutations, outcomes, conflicts, selected scope, tombstones and the feed cursor. No keys or plaintext drafts are persisted. Native SQLite commits generation CAS and the encrypted blob in one FULL-synchronous transaction. The path/connection factory is not exposed through IPC; production private-file opening/key custody is a launch gate.

Each local document is limited to 16 KiB, with 32 lifetime record IDs per journal. Ciphertext is stored once for each local draft and remote head, including full title/body conflicts. Admission is bounded to 6 MiB with an 8 MiB hard journal budget; tombstone/authority/recovery operations retain reserve headroom. SQLite reads are separately bounded. Server prototype limits are 100 lifetime account record IDs including permanent tombstones and non-pruned mutation receipts; these are not rolling-window quotas.

Fresh verified account/device/scope consent is required after restart. Random coordinator-session nonces, epochs, exact leases and an independent atomic consent fence reject stale work before dispatch and after authority checks. Native adapters verify current account/device authority before and after writes, historical receipt replays, reads and metadata pages. Native controllers must invalidate the consent fence synchronously on Cancel, sign-out, account switch, revocation and scope/draft changes; the future HTTP implementation must also abort in-flight requests.

Historical success acknowledges only the original mutation. It never regresses newer remote state or clears a tombstone. Live acknowledgements require a fresh current-state read before their content can be imported, even if an equal older head was previously observed. Conflicts retain the local draft plus an acknowledged outcome separately from current remote state. There is no automatic merge, including titles; no same-ID resurrection; no silent pruning. Explicit conflict discard binds both the reviewed remote revision and immutable local mutation ID.

## Backend draft alignment

The adapter follows `src/state_backup/SHARED_CONTEXT_V1.md` in the coordinated backend checkout, not the legacy conversation API:

- `/api/state-backup/records/{record_id}`: PUT uses the enrolled device, mutation UUID, kind, expected revision, key version, base64 ciphertext and explicit `confirm_share`. DELETE sends device, mutation, expected revision and `confirm_delete`, with no ciphertext or client-selected account identity.
- Receipts bind schema/account/record/kind/revision/source-device/key-version/sequence/mutation/digest. Current server authority must be checked before historical replay too.
- `/changes` is ordered metadata with an account-bound cursor, at most 50 events. Native GET fetches current state only for explicitly selected IDs; unselected events advance metadata without fetching content. All selected decrypts plus the exact page cursor commit atomically. A newer GET may advance a record revision, never the feed cursor. A deletion event cannot be paired with a newer live record.
- Tombstones are permanent for that ID. The server's current record ciphertext deletion does not erase older checkpoints, backups, downloaded copies or other stores. No delete-everywhere claim is made.

Storage sharing off means no context API calls. On-device AI processing is a separate per-device policy and may coexist with separately consented retained encrypted storage. Neither sign-in nor changing inference policy enables storage sharing.

## Review surface

The unmounted `SharedContextReview` component offers full read-only source previews, explicit account/device/selected-record consent, precise draft revision/digest submission, uncertain/revoked states and full local/remote conflict review. It uses no localStorage and never calls legacy conversation `onAdopt` or active-chat merge APIs. Imported text is a separate historical-context contract: “yes, send it” remains text, not a new user instruction or approval.

`bindingKey` must identify the unique verified native controller/session, including a fresh session nonce—not merely account/device/epoch or a display label. Selection `expectedLocalRevision` and `expectedDigest` refer to the exact local plaintext draft reviewed, not the server CAS revision. The future native source-snapshot factory must validate them against its frozen source snapshot before queueing. UI authority/draft changes cancel the originating controller before replacing callbacks and require fresh review.

## Deliberately unimplemented launch gates

The production signed-device HTTP transport, managed recovery-key/session factory, private journal-file factory, frozen native source snapshot/selection IPC and actual meeting/chat source integration are not connected. Only inert status IPC is registered; both frontend and native status report unavailable/off. Flipping a frontend flag cannot create a network operation. The review surface is not mounted in release UI.

Before launch: align the final backend contract; validate native identity/key custody and per-device signed authorization; wire per-request cancellation/abort; prove source-snapshot revision/digest binding; verify recovery and key/enrollment rotation of quarantined journals; validate two real enrolled devices, conflicts, response loss, deletions, revocation and retention/purge policy. Existing legacy plaintext shared-conversation drafts are not imported or reused. No inference policy, OS permission, installed app, live account, credential or recording is changed by this foundation.
