# Desktop-only recovered notes copy

## Scope and user flow

This recovery slice is layered on reviewed draft #754 (`adf43e12692cc24d060b67842e88ffd466c3b0fd`), based on v3.5.4. The read-only source helper is dedicated to recovery; it does not depend on an experimental shared Notes protocol. It implements the explicitly approved **Save recovered copy** alternative. It does not activate canonical Notes v2 saving, migrate existing records or change the mobile/shared protocol.

An idle recorded meeting or meeting with a saved-transcript hint exposes **Recovered notes · Desktop only**, independently of any generation-failure flag. Opening it reads this meeting's stored copies; no generation runs automatically. **Preview recovered notes** obtains the native owner-bound transcript and original saved notes and captures the editor input unchanged. It submits those three sources through the existing configured notes model/privacy queue, with no chat-history thread routing, retrieval documents, tools, cleanup, sharing or follow-up completion callbacks. The prompt preserves manual priorities and leaves agenda questions open unless the transcript answers them. Existing saved text is not asserted to be exclusively manual.

A preview is transient until the separate **Save recovered copy** click. The original saved notes, current editor buffer and transcript are never replaced. The saved copy is displayed in its own version selector, with separately labeled preserved saved notes and editor input, plus transcript record/hash provenance. **Restore this as a new recovered copy** appends a version; prior copies remain immutable. It does not restore over the original canonical note.

## Physical and account boundaries

- New data lives only in `.knapsack/desktop-recovered-copies/<SHA256(owner UUID,email)>/copies-v1.sqlite3`, outside the legacy notes/transcript directories and the primary application database.
- Current native profile UUID/email must resolve to exactly one local owner. All automation runs for the selected meeting thread must identify that owner; conflicting message ownership or a non-meeting thread refuses access. Request fields alone cannot establish this scope.
- The transcript is the unique native transcript row for that exact thread, using the same thread-reference selection as the Transcript pane. Ambiguous/shared filenames, unsupported names, blank/missing sources and link paths refuse; no title/calendar join or global fallback is introduced.
- Preparation captures a source snapshot over the original saved-note snapshot and transcript ID/filename/content hash/file stamp. Save checks it again before transaction commit. Current owner checks run around reads and writes.
- Unix recovery-owned directories/files are private (0700/0600); symlinks and multiply-linked regular files refuse, and SQLite uses NOFOLLOW. Windows inherits the private user-home ACL; real Windows ACL/reparse behavior remains a platform QA gate.
- Explicit save alone initializes this separate store. Read/list/prepare do not create it. Main DB access uses the existing already-initialized read-only native connection helper.
- Four Desktop Tauri commands are registered. There is no new HTTP/mobile route, shared mirror, sync enrollment or change to scopes/security settings. Existing account continuity remains disabled by default.

This is current native Desktop-profile/local-thread ownership, not a claim of Google OAuth grant/subject authority. People enrollment still needs its independently reviewed provider authority.

## Persistence and concurrency

One SQLite IMMEDIATE transaction allocates the next owner/meeting version and commits the immutable document with its request-bound receipt. The document preserves original saved-note bytes, editor-input bytes, generated review text and transcript provenance. EXTRA synchronous durability is used; unsupported store versions/journal modes refuse without schema conversion or journal-mode rewriting. No canonical writer, deletion or overwrite operation exists in this module.

A stable request ID plus exact payload hash makes duplicate save/restore submissions idempotent. A changed payload under the same ID refuses. Frontend save and restore retries retain the ID after a lost response. Success is reported only after a matching owner/thread/request/body-hash receipt and separate readback. Unconfirmed outcomes retain the review draft and do not claim Saved. A source conflict requires a new preview. Editor changes disable saving an older preview; late editor changes remain untouched. Account/thread/epoch changes discard late UI results.

Copy history survives a fresh process and is unaffected by a legacy/mobile canonical-file write. Rollback of a recovered version appends another copy. Rolling back the application does not mirror or delete this store: older code ignores the new directory and continues reading its legacy canonical notes. Actual signed-binary upgrade/downgrade still requires release QA; this is source/storage evidence, not an installer claim.

## Verification and remaining gates

The focused tests compile the actual storage and dedicated source helper using disposable files, including fresh-process reopen, concurrent same-request processes, owner/source conflicts, append-only rollback and legacy-writer separation. The React suite exercises explicit save/readback, source preservation, editor/account changes and uncertain acknowledgements with synthetic native/model responses. Both platform CI workflows execute the portable storage tests; the recovery UI suite is included in the existing usability script.

Full Tauri compilation and native command wiring, actual WKWebView save/reopen and trusted Meeting/Library pointer navigation, configured-model quality/privacy-route validation, signed installer/updater and binary rollback remain release gates. Portable and React results are not native acceptance. This standalone draft must not be merged or released as the partial combined candidate; Add to Library still requires separately verified owner/grant authority. No live account, provider, application or OS settings are used by these tests.

Local validation of this isolated slice: 13 storage tests, 4 wiring checks, 187 usability tests and 9 updater checks passed; frontend typecheck and lint of the new components passed. The unrelated existing QA harness reports 76 passing checks and one fail-closed ancestry check because local process inspection is unavailable. That test and its safety policy are unchanged; no check was removed or weakened. Hosted Mac/Windows results are still required.
