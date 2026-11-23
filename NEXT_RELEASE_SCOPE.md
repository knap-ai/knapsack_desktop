# Next Desktop release checkpoint

Base: `96c74a67eb21eb6e01e9a00a1a7a2cedb001f44d` (verified remote main and v3.5.4).
Local branch: `codex/desktop-next-search-20261122`.
This is an implementation tracker, not a declaration that the full requested release is ready.
No merge, release dispatch, installation, production restart or real connector action is authorized by this checkpoint.

| Area | Current evidence / implementation | Candidate status and remaining gate |
| --- | --- | --- |
| Mouse-selectable meeting and person/library search | Actual NotetakerSidebar regression reproduces null-relatedTarget blur unmount. Local interaction guard preserves click delivery, primary focus and touch; rejects drag, cancel, scrolling and secondary/control press. | Local commit 945eafc; independently reviewed actual sidebar callbacks and canceled-gesture tests pass. Full destination rendering and real WKWebView still unverified. |
| Search keyboard and dismissal | Escape, ArrowDown to first result, focus leave, outside press, preserved typed query and AT-style activation covered with synthetic data. | Stage 1 local tests; native keyboard/Tab acceptance remains. |
| Main chat vertical overflow | Current ClawdChat has responsive/compact action controls, but full-width controls remain exposed. | Integrated local grouped vertical disclosure from selective #749 port; helper/focus tests pass. Full chat mount/narrow/native visual gate remains. |
| Compact inline chat | Existing welcome/history handling is shared and must preserve real messages. | Integrated scoped synthetic welcome/example/starter suppression; persisted genuine history unchanged. |
| Chat autoscroll | Current near-bottom policy exists; deferred scroll callback needs race and streaming coverage. | Integrated deferred-frame intent recheck and cancellation; synthetic scrollback race tests pass. |
| Auto-expanding composer | Newly requested content-driven height across primary and inline chat. | Integrated shared ChatInputBar hook. Actual component baseline red and patched restored/input/clear/cap tests green; native geometry remains. |
| Meeting attendee Add to Library | Current attendee workspace lookup/navigation exists. | BLOCKED: #749 backend globally deduplicates email workspaces without an owner/profile association. Actual-source synthetic owner-B/owner-A counterexample reproduced; no unsafe port applied. Requires scoped storage and deliberate legacy handling. |
| Profile header and narrative Timeline | Existing PersonWorkspace/RelationshipTimeline and source metadata provide a partial base. | Pending verified synced photo/fallback, email placement, grouped substantive relevant note/mail evidence, history/coverage and citations audit. |
| Inline proper-name corrections | Existing NameSpellingReview and editing/memory helpers are partial foundations. | Pending inline activation, exact occurrence/all, optional memory, undo, formatting and account/privacy tests. |
| Cached and pregenerated prep | Existing prep/research components exist. | Audit cache/refresh and approved source behavior; scheduled pregeneration and automatic research are not yet verified. No new permissions or external research QA. |
| Missing notes and manual-note-aware explicit recovery | v3.5.4 Retry remains copy-only; separate local recovery work was previously tested at 84ba5aa30. | Clean-applied separately to current base with 43/43 synthetic tests and TypeScript passed; not integrated pending template/save concurrency reconciliation. Port/review independently with immutable originals, transcript reference/ownership checks and conditional explicit save. No live generation. |
| Template consistency across navigation/retry/failure | v3.5.4 busy guard is present but the accepted prior-notes/new-label race remains. | Release blocker for next bundle until a tested consistent selection/generation/commit model exists; avoid another ref-only workaround. |
| Templates drawer polish | Current cards show long descriptions; busy errors are verbose; selection persistence guard must remain. | Integrated compact purpose rows, collapsed instructions, quiet busy status, live re-enable, accessible Close/Escape and failed-persistence tests. This does not resolve durable template consistency. |
| Send Reply no-op / feedback | Existing EmailComposeDrawer route needs exact failure-point audit. | Pending account/thread/recipient validation and duplicate/failure fixtures; no real send. |
| Generated follow-up signoff | Current buildFollowUpEmailBody accepts userName; existing recipient firstName helper guesses from display names/email and is not a safe sender-identity substitute. | Integrated provider-declared given_name through existing Google/Microsoft responses and exact-email-matched follow-up drafts. Compound/non-Western preserved; unavailable metadata omitted. No new calls/scopes, no existing/custom body rewrite. Native Rust compile remains. |
| Embedded browser handoff and close | Existing EmbeddedBrowserSidebar needs lifecycle reproduction. | Pending synthetic lifecycle acceptance; no external agent action. |
| GitHub integration identity / selected repo grounding | Current UI and Developer Mode grounding require audit. | Pending explicit actual connection/project/ref; no new grants or arbitrary installation. |
| Loading timeout/retry | Separate draft #753 is Token Costs loading/retry hardening, not a verified Studio-loading fix. | Selective #753 port integrated, exact original blob hashes verified; added malformed-row rejection after review. Timeout/retry/profile isolation and honest unknown-vs-zero tests pass. Studio loading remains separate. |
| Save to Chat | Explicitly deferred from v3.5.4; separate prior local candidates are not integrated here. | Separate track; no completion claim. |
| Benchmark URLs and Proactive prompt policy | Separate local-only synthetic smoke stopped after first baseline protocol failure; no valid candidate comparison. | Separate track; no remote tools, billed calls or production changes. |
| Express | Separate product. | Excluded. |

## Existing draft reconciliation (read-only)

- Draft #749 remains open/unmerged at `cd9bdb6758e571c275a7b4568e185989aef7611c`; GitHub reports its base as `fee7cffd7894b2a0e4b15fe7671e73683ffc5079` (v3.5.2). It changes 79 files, so it cannot be merged wholesale onto v3.5.4.
- Existing #749 candidates include loop/email-signal filtering, People save APIs, timeline note joins, inline spellings, person overlay/header, notification summaries, inbox status, sender/signoff changes and notes failure handling. Audit/port these individually; their presence is not evidence of current native acceptance or compatibility with #752 guards.
- Draft #753 remains open/unmerged at `6caff6da4c0b461b6fa92a3deadb94ab5c195308`, reported base `0bec33ace2a4d522ae48cde11795098ddae0d4a8`. Its five files address Token Costs only.
- The separate 84ba5aa30 recovery candidate and #749 recovery logic must be reconciled together against current v3.5.4; do not reintroduce overwrite/cleanup/follow-up side effects through a broad cherry-pick.

## Audit delta still tracked

- Global vertical kebabs; saved-inbox status near Settings; remove duplicate floating/outlined status and duplicate Autopilot control while preserving Settings.
- App-owned Siri/DevTools triggers: reproduce before attributing to OS; no OS preference changes.
- Clear active account/workspace/grants, Reconnect now, pending-auth presentation without false yellow warning, subtle actual privacy status.
- Measure calendar sync and transcription independently; do not equate slow notes with retranscription.
- Meeting/person chat overlays with correct saved notes/context; Save to Chat remains a separate explicitly deferred track.
- Notification summary readability and dismiss-without-foreground are separate from the in-app cached brief.
- GBrain Prepare scoped to selected loop; promotional/FYI filtering and concrete grounded obligations. Broader goal/feed and upstream research remain separate design work.
- Regression checks for already shipped onboarding inference, privacy placement/help, popup resizing, scoped multi-Gmail, cache/calendar refresh, recording start/overrun/opt-out/window behavior and copied metadata. No live overrun/microphone or automatic research claim follows from prior CI.
- Shared context across devices is dormant; benchmark/third-party access, Chrome extension and Express are not silently included.

## Stage 1 verification

- Exact production baseline: search fixture fails before the patch (9/10 tests fail).
- Fixed real-sidebar suite plus adjacent sidebar/account-search tests: 19/19 pass, including compatibility mouse after canceled pointer/scroll.
- TypeScript: passes. New hook and fixture lint: passes.
- Test data, navigation callbacks and provider boundaries are synthetic; no native, model, account or send calls.
- No installed Playwright WebKit/Chromium test executable is present. Existing native DOM harness requires a reviewed isolated build and human Start checks gate; no native launch or bypass was attempted.
- Independent review found and verified the canceled-pointer compatibility regression; correction is under re-review. Broader desktop usability suite passes 126 component tests and 9 updater tests (before this extra regression). Rust synthetic QA could not compile because CMake is unavailable; no dependencies were installed. Hosted CI and full exact-candidate native QA have not run.

## Release gating

Do not ship a narrower early bundle based on this checkpoint. Reconcile the consolidated request audit, record included/missing items, obtain independent review, run meaningful focused and full exact-head checks, and perform safe native acceptance or explicitly resolve its blocker before staging the single next release.

## Composed local QA checkpoint

- Base/main reverified at 96c74a67; production untouched.
- Platform-workflow frontend subset passes: recording routing, developer intent, hydration, meeting chat/link, Add to Chat, notes editing, Slack notes, desktop usability and DOM fixtures.
- Desktop usability: 178/178 component tests plus 9/9 updater tests. No skipped tests in the executed subset. TypeScript passes.
- Review found malformed Token Costs rows could still crash formatting; two red/green decoder tests now reject these responses without private payloads.
- Native Rust attempt stopped while compiling Whisper dependency: cmake executable unavailable. No dependencies installed; native build/acceptance remains required.
- Recovery port kept separate: template identity and concurrent save coordination remain unresolved. Attendee global ownership counterexample also blocks that port.
- This staged draft is implementation/CI preparation only, not the full requested release and not eligible for merge, dispatch or publication.
