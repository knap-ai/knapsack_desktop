# Desktop polish and relationship story — local candidate

Base: released v3.4.9, a2a7546bf4fa3838025dd2cb89d827e71912ca84.
Branch: codex/desktop-polish-20261117. No publication or installation performed.

## Behavior

People and projects default to a vertical relationship timeline, retaining a Documents tab. Exact same-subject sources in one week may be clustered. Suggested significance comes from titles/tags; cards do not claim that proposed deals closed. Saved summaries remain attributed context. Native source metadata supplies email/calendar dates; manual imports are explicitly dated Added, and unknown dates remain unknown. Source links require a user click; calendar links use the exact cached event and existing open-notes action, never join or record.

Person headings prefer the saved proper name, then a name from exactly matching email headers/calendar attendees in attached sources. Email remains secondary. Unknown names use Unnamed contact/Add name. The same display-name rule applies to library cards and person chat context. There is no automatic cloud inference or modification of saved customer records.

Meeting controls now have consistent dimensions and a full-width title. Markdown explicitly restores semantic list markers removed by the reset. Redundant popup consent UI is removed from Email Autopilot; Settings retains the preference. Later calendar events can be expanded beyond the old four-event cap.

Autopilot and Scout query a local mail cache with different ranges/filters; neither query validates remote credentials. Strict cache failures now produce an error rather than an empty inbox. Per-account sync metadata exposes partial failures without claiming token validity. A live refresh-token failure from the supplied screenshot is not independently verified, and this patch does not renew credentials or repair missing remote cache data.

## Verification

- 35 focused frontend tests passed across 11 suites, then two additional WorkspaceView cases passed (project default timeline and proper-name resolution).
- TypeScript noEmit passed; Vite production build passed (existing large-chunk warning).
- Focused new-file ESLint passed; whole-repository lint was not claimed green.
- Three tests of the actual Rust timeline module passed in an isolated in-memory SQLite crate. Full native cargo check and all three timeline tests in the actual native binary now pass.
- Actual timeline component visually checked in Chrome at 1100px and 360px containers, person and project. Alternating timeline becomes one column, larger milestone cards remain readable.
- No production profile, recording, account, email, Slack, live model or security settings were used. No source link was opened against a real account.
- Locked npm dependency tree restored with ci --legacy-peer-deps --ignore-scripts. Missing QA peer packages were installed separately in /tmp and copied only when absent; no existing locked package was overwritten. package.json and package-lock.json are unchanged.

## Remaining acceptance

Native/WebKit source opening remains unrun. Header controls, semantic markdown markers and partial-sync warnings were additionally checked in a synthetic browser fixture at 900px and 360px; this is not full native-app acceptance. Live multi-account freshness/provider authentication is unverified. Source projections do not recover deleted records and deliberately avoid guessing calendar provider URLs. These are local implementation results, not release acceptance.

## QA repairs

Hosted platform tests caught the changed no-link wording. Restored the existing No video call link contract without weakening assertions: 30 meeting-link tests pass. Source review also found that header classes were applied only to the empty-notes branch; corrected the saved-notes branch and keyboard edit access. The complete local platform UI test batch passes after both repairs. Temporary visual fixtures were removed and their server stopped. Production app/data remain untouched.
