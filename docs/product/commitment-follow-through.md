# Commitment follow-through: first desktop slice

Meeting follow-up runs in **GBrain → Loops** now include **Keep commitments from slipping**.

1. Find commitments in a meeting run with saved source context. Text-only extraction uses the selected inference provider and fails closed under Privacy Mode. It has no tool access or provider fallback.
2. Review the exact supporting quote, named owner, action, and editable draft. Unsupported quotes are rejected before storage. Repeated extraction does not resurrect dismissed suggestions.
3. Confirm a follow-up time. Until a sent message is linked, tracking is explicitly a reminder only.
4. Save/copy the draft and send using the user's preferred surface. Copying never means sent.
5. Choose a connected Gmail account, recipient, and recent sent message. Native OAuth verifies the SENT label and exact recipient before storing the account/thread/message identity. No Composio access is involved.
6. While Knapsack is running, the app checks due observations across all screens. Gmail is polled at most once per 15 minutes per commitment. An unavailable account produces an explicit unknown state; it cannot become “no reply.” Checks resume after a restart.
7. A later incoming message from that exact recipient in that exact thread becomes **Reply received — review the outcome**. Drafts, sent messages, spam/trash and declared automatic responses do not count. The user decides whether the commitment is resolved.

Notifications are a single in-app notice per attention/reply transition, including across restarts. Pausing a commitment or its parent loop suspends observation. Changing state while an API request is in flight prevents the old response from restoring tracking. A new follow-up time can be set after reviewing a reply without re-alerting on that same message.

The local, portable registry is `<brain root>/.knapsack/follow-through-v1.json`; writes are serialized, atomically replaced, and use owner-only file permissions. It preserves quotes, drafts, selected identities, schedules, reply evidence, and status history. It is separate from `loops-v1.json` and must be included when backing up the brain.

## Scope

This slice supports desktop reminders and native Gmail reply verification. It does not send messages, monitor while the desktop app is closed, infer task completion from a reply, or deliver reminders into Slack. Extraction is user-triggered on existing meeting follow-up runs; it does not automatically process every new recording.

## Verification

- Full Rust suite: 374 passed, 1 existing ignored test (serial execution).
- Nine new Rust tests cover source quotes, delivery identity, reply ordering, automatic responses, persistence, due reminders, failed checks, pause races, and outcome review.
- Five JavaScript tests cover notification deduplication, missing credentials, retries, overlapping checks, disposal, and safe QA mode.
- TypeScript passes.
- Browser QA uses the actual panel bundled with synthetic registry data: evidence, draft controls, required date, track and pause.
- Live Gmail OAuth and the installed production app were not exercised for this feature, to avoid interfering with the parallel production recording investigation.
