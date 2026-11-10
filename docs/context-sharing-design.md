# Proposed Studio context sharing

Status: a local, dormant selected-record foundation is implemented; see [foundation details](shared-context-foundation-v1.md). No production transport, context transmission or account-continuity capability is enabled.

## Two independent controls

Studio sign-in establishes identity, not consent to upload. Show both AI processing and Context storage. Keep processing policy local to each device; another device cannot weaken it.

| AI processing | Inference and telemetry | Context storage |
| --- | --- | --- |
| Off | Existing provider policy and telemetry settings | This device by default; sharing needs separate consent |
| On-device AI | Local inference only; telemetry disabled | This device by default; optional sharing must disclose retained encrypted storage |
| Zero-retention inference | Approved routes only; telemetry disabled; usage metadata may remain | This device by default; shared encrypted context is retained storage |

Where sharing is offered, explain the current “On-device only” label as “On-device AI.” Do not imply connected mail/calendar stops networking. To prevent context egress, keep Context set to This device. Zero-retention inference is not zero-retention storage.

## Consent, isolation and key custody

Require account consent, individual device enrollment and explicit selection of records/categories before initial upload. Preview the scope and disclose retention and key custody. Existing account recovery lets Knapsack recover keys and decrypt backups; this is not server-blind end-to-end encryption. Markdown filename allowlisting cannot detect secrets pasted into note bodies.

Exclude provider credentials, OAuth/access/refresh tokens, raw local databases, machine paths, tool permissions, approvals, unfinished executions, pending capture/transcription state and inferred consent. Raw recordings stay outside initial scope. Imported context retains source attribution and never grants execution authority.

Support independent device pause. Account switching/sign-out invalidates in-flight authority and isolates caches. Revocation fences future access but cannot erase plaintext or keys already downloaded. Disable, revoke and delete have different effects and must be described separately.

## Existing APIs and missing launch gates

Both the Rust experimental-account-continuity feature and frontend release capability are disabled. Existing experimental APIs provide encrypted checkpoint handoff and explicitly shared conversations, and report automatic sync unavailable. Snapshot restore is not continuous shared context.

Conversation writes require explicit sharing confirmation, enrolled device, expected revision and mutation ID; stale writes conflict. Authentication can exchange one-shot codes from an already authenticated Studio session. Connected email is not Studio authentication. Native onboarding can reuse verified credentials or use the existing system-browser flow without an embedded webview.

Continuous sharing needs stable record IDs, compare-and-set revisions, idempotent mutations, preserved concurrent edits and conflict UI, deletion tombstones, retention/purge semantics, bounded encrypted payloads and revocation fencing. The inspected backend lacks conversation deletion and complete backup purge endpoints. Do not advertise delete everywhere.

Before enabling: validate the native identity bridge; hosted schema/KMS/auth readiness; selected-data consent and cancellation; two-device edit/conflict/retry/restart behavior; account-switch isolation; deletion/retention contract; revoked/offline device handling; interrupted/idempotent uploads; and privacy preservation across imports. Keep dormant gates disabled until that acceptance is complete.
