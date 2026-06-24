# Scout Proactive Work Agent Spec

Status: Draft v0.1
Owner: Product / Engineering
Primary bet: Scout wins by proactively helping users follow through across meetings, email, calendar, files, and messaging channels. It should not compete as "a better Slack chatbot" or as a markdown-defined local agent.

## 1. Strategic Thesis

Within 6 months, most serious AI assistants will support better models, larger context windows, Slack mentions, channel memory, async tasks, connected tools, and admin controls. Those are not durable differentiators by themselves.

Scout should differentiate by owning the follow-through layer of work through a proprietary runtime plus a trusted local execution layer:

- It notices commitments, asks, blockers, relationship context, and upcoming meetings.
- It prepares the next action before the user asks.
- It plans and routes through a knap-ai-owned Scout Runtime, not through customer markdown alone.
- It uses native integrations first, not browser automation as the default.
- It shows sources, confidence, state, and blocked reasons clearly.
- It asks for approval before external actions.
- It learns user preferences around timing, noise, tone, and autonomy.

Scout should be thought of as:

- A proprietary Scout Runtime/API owned by knap-ai.
- A transparent Markdown handbook owned by the customer.
- A trusted local harness/data plane inside `knapsack_desktop`.

Positioning:

> Scout is the workday follow-through agent. It watches the edges of your meetings, messages, email, calendar, and files so important work does not fall through the cracks.

## 2. Architecture Split

Scout is intentionally split across three layers with clear ownership boundaries.

### Markdown handbook

Markdown is the transparent customer-visible handbook for:

- Tone and communication style.
- Customer-specific preferences.
- Approved workflows and escalation rules.
- Customer-specific instructions and operating norms.

Markdown is not the core runtime, routing layer, privacy engine, or durable moat.

### knap-ai backend: Scout Runtime/API

The proprietary Scout Runtime/API owns:

- Workflow planning and task decomposition.
- Privacy policy decisions.
- Context compaction strategy.
- Verification and eval loops.
- Vertical playbooks and task-quality logic.
- Telemetry and outcome measurement.
- Provider/model fallback strategy.
- Cross-instance improvement from workflow and eval patterns without sharing raw customer data.

### `knapsack_desktop`: trusted local harness/data plane

The desktop app owns:

- Local credentials and authenticated access.
- Native connector retrieval and local source gathering.
- Local source refs and source extraction.
- Browser and OpenClaw execution.
- Local model support.
- Privacy enforcement before raw data is sent.
- Approval gates, UI rendering, and audit trail.

This split keeps proprietary planning and policy in the backend while preserving local trust, source fidelity, and execution control on device.

## 3. Scout Runtime Contracts

The product should define a clear request/result contract between `knapsack_desktop` and Scout Runtime, even before the wire format is finalized.

### `ScoutTaskRequest`

```ts
type ScoutTaskRequest = {
  requestId: string;
  userIntent: string;
  sourceRefs: SourceRef[];
  accountScope: string[];
  channelScope?: {
    channelId: string;
    visibility: 'private_1_1' | 'shared_channel' | 'team';
  };
  privacyMode: 'private' | 'shared_channel_default';
  availableIntegrations: Array<
    'calendar' | 'email' | 'drive' | 'slack' | 'telegram' | 'whatsapp' | 'meeting' | 'browser' | 'local_model'
  >;
  approvalPolicy: {
    requiresExplicitExternalSend: boolean;
    requiresApprovalForWrites: boolean;
    allowedAutomaticDrafts: boolean;
  };
  providerModelConstraints: {
    preferredProvider?: string;
    preferredModel?: string;
    allowedProviders?: string[];
    singleProviderMode?: boolean;
  };
  compactSnippets?: Array<{
    id: string;
    kind: string;
    text: string;
    sourceRefs?: SourceRef[];
  }>;
  localExecutionCapabilities: {
    nativeConnectorsAvailable: string[];
    browserAvailable: boolean;
    openClawAvailable: boolean;
    localModelsAvailable: string[];
  };
};
```

### `ScoutTaskResult`

```ts
type ScoutTaskResult = {
  requestId: string;
  answer?: string;
  draft?: string;
  actionPlan?: string[];
  sourceRefs: SourceRef[];
  confidence: number;
  privacyDecisions: Array<{
    decision: 'allowed' | 'redacted' | 'blocked' | 'reroute_dm';
    reason: string;
    affectedSourceRefs?: SourceRef[];
  }>;
  blockedReasons?: string[];
  telemetryIds: {
    traceId: string;
    evaluationId?: string;
    providerAttemptId?: string;
  };
  nextStepSuggestions?: string[];
  localExecutionInstructions?: Array<{
    type: 'draft_message' | 'draft_email' | 'open_browser' | 'run_native_query' | 'request_approval';
    payload: Record<string, unknown>;
  }>;
};
```

These contracts should preserve structured privacy, source, and execution context instead of flattening Scout into a plain prompt/response exchange.

## 4. Non-Goals

Do not build this as:

- "Claude Tag but for Knapsack."
- A generic Slack bot personality.
- A markdown-defined local agent whose core behavior lives in prompt files.
- A model-picker or higher-model story.
- A browser-first assistant.
- An always-on interruption engine.
- A project-management clone.
- An autonomous sender of emails/messages without explicit user or admin policy.

## 5. Primary Users

### User A: Client-facing executive / founder

Needs to stay prepared, responsive, and trusted across meetings, email, Slack, WhatsApp, Telegram, and docs.

Core anxieties:

- Missing an important follow-up.
- Walking into a meeting underprepared.
- Losing context across accounts or clients.
- Sending something socially awkward or wrong.

### User B: Operator / chief of staff

Needs to turn ambiguous conversations into next actions and keep other people unblocked.

Core anxieties:

- Threads ending without owner or date.
- Action items hidden in calls or chat.
- Follow-up emails taking too long.
- Not knowing what changed since last touchpoint.

### User C: Team admin / IT owner

Needs the agent to be useful without leaking data or acting outside approved scope.

Core anxieties:

- Cross-account data leakage.
- Unclear tool access.
- Unexplained spend or provider failures.
- Poor auditability.

## 6. Product Principles

1. Proactive, but never needy.
   Scout should interrupt only for concrete commitments, deadlines, meeting preparation, blocked work, or unresolved threads.

2. Native first.
   If email, calendar, Slack, Drive, or meeting data can answer the question, use that source before opening a browser.

3. Source every important claim.
   Users should be able to inspect which email, meeting, Slack message, doc, or calendar event informed the recommendation.

4. Ask before external action.
   Drafting is safe by default. Sending, scheduling, messaging, deleting, or modifying external systems requires explicit approval unless a user/admin policy says otherwise.

5. Preserve context intelligently.
   Compact, summarize, and retrieve context instead of blindly truncating it. Losing important history is a product failure.

6. Make failure actionable.
   When a tool/provider/channel fails, Scout should say what failed, why it thinks so, and what the user/admin can do.

7. Learn noise preferences.
   A dismissed alert is training signal. Scout should become quieter and more precise over time.

## 7. Differentiation Versus Claude Tag And Slackbot

### What they can copy quickly

- Tagging an AI in Slack.
- Channel memory.
- Async tasks.
- Better model access.
- Admin permissions.
- Basic audit logs.
- Slack-native summaries and search.

### Scout's defensible lane

- Cross-surface follow-through across meetings, calendar, email, Slack, Telegram, WhatsApp, Drive, and desktop context.
- Relationship-aware memory and prep briefs.
- Native integration routing before browser fallback.
- Commitment extraction and watchlists.
- Explicit approval and audit for outbound follow-up.
- Multi-account context handling across personal, client, and work identities.
- Trust-oriented diagnostics for provider/tool/channel failures.

### Durable moat

Scout's compounding value is not customer markdown alone and not raw pooled customer data.

It is:

- Reusable workflow playbooks.
- Verification and eval patterns.
- Routing policy.
- Privacy policy.
- Vertical task quality.
- Cross-instance learning from workflow and eval patterns without sharing raw customer data.

The message should be:

> Claude Tag is an AI teammate in Slack. Slackbot is Slack's assistant. Scout is the agent that knows what happened across your workday and helps you follow through.

## 8. Core Product: Scout Watchlist

Scout Watchlist is the first concrete product surface for proactive Scout.

It continuously tracks:

- Promises the user made.
- Asks directed at the user.
- Waiting-on-other-people items.
- Unresolved Slack/Telegram/WhatsApp threads.
- Upcoming meetings with weak prep.
- Follow-up emails that should exist but do not.
- New files/docs attached to calendar events or recent conversations.
- Tool/auth/provider issues that block expected work.

### Watchlist Item Types

| Type | Example | Default behavior |
| --- | --- | --- |
| Commitment | "Send Caitlin the revised pricing model" | Draft reminder and suggested next step |
| Ask | "Can you send the implementation plan?" | Draft reply or gather source docs |
| Waiting | "Amit said he would share the spreadsheet" | Remind later or ask if user wants to nudge |
| Meeting prep | "1pm Bankaya call has new attendees and no prep" | Build brief 20-30 min before meeting |
| Follow-up | "Yesterday's call has no follow-up email" | Draft follow-up and ask for review |
| Stale thread | "Slack thread ended unresolved" | Offer to track or assign owner |
| Blocked tool | "Gmail connected but email fetch is failing" | Show remediation and capture diagnostic |

### Watchlist UX

Primary surfaces:

- Desktop home panel: "Needs attention"
- Meeting sidebar: "Before this meeting"
- Post-meeting state: "Follow-through"
- Slack/Telegram reply: "I can track this"
- Daily digest: "3 things that may fall through"
- Shared channels when channel-scoped follow-through is enabled

Each item should show:

- Title
- Source
- Reason Scout surfaced it
- Confidence
- Suggested next action
- Current state
- Dismiss / snooze / track / draft / approve action

## 9. Proactive Event Model

### Event Sources

- Calendar event created, updated, canceled, starting soon.
- Meeting recording started/stopped.
- Transcript/follow-up generated.
- Email received/sent/drafted.
- Slack/Telegram/WhatsApp message received.
- File attached/shared/updated.
- Provider/tool/channel health changed.
- User dismissed, approved, edited, or ignored a Scout suggestion.

### Event Processing Pipeline

1. Ingest event with account/channel scope.
2. Normalize into `WorkSignal`.
3. Run classifiers for commitment, ask, blocker, follow-up, prep, waiting, stale thread.
4. Link to entities: person, account, company, meeting, thread, file, task.
5. Deduplicate against existing Watchlist items.
6. Score urgency, confidence, and user interruption cost.
7. Choose action: ignore, log, batch, notify, draft, ask permission, or escalate.

### WorkSignal Shape

```ts
type WorkSignal = {
  id: string;
  sourceType: 'calendar' | 'email' | 'meeting' | 'slack' | 'telegram' | 'whatsapp' | 'drive' | 'system';
  sourceId: string;
  accountId?: string;
  channelId?: string;
  threadId?: string;
  actorIds: string[];
  observedAt: string;
  text: string;
  metadata: Record<string, unknown>;
  privacyScope: 'private' | 'shared-channel' | 'team' | 'admin';
};
```

### WatchlistItem Shape

```ts
type WatchlistItem = {
  id: string;
  type: 'commitment' | 'ask' | 'waiting' | 'meeting_prep' | 'follow_up' | 'stale_thread' | 'blocked_tool';
  title: string;
  summary: string;
  sourceRefs: SourceRef[];
  ownerUserId?: string;
  relatedPeople: string[];
  relatedAccounts: string[];
  relatedMeetingIds: string[];
  relatedThreadIds: string[];
  dueAt?: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  state: 'new' | 'tracking' | 'drafted' | 'waiting_approval' | 'snoozed' | 'done' | 'dismissed' | 'blocked';
  suggestedActions: SuggestedAction[];
  lastUpdatedAt: string;
  dismissalReason?: string;
};
```

## 10. Action Model

### Safe actions by default

Scout may do these without approval:

- Summarize.
- Prepare a brief.
- Draft an email or message.
- Create a local Watchlist item.
- Suggest a reminder.
- Search native connected sources within approved scope.
- Diagnose provider/tool/channel status.

### Approval-required actions

Scout must ask before:

- Sending an email.
- Sending Slack/Telegram/WhatsApp/iMessage content.
- Scheduling or modifying calendar events.
- Sharing files.
- Deleting, archiving, or modifying external data.
- Inviting the agent into new channels.
- Expanding account or channel scope.

### Policy-controlled actions

Admins/users may allow explicit exceptions, such as:

- "Send routine scheduling replies under 100 words."
- "Post meeting summaries to this internal Slack channel."
- "Create calendar holds, but do not invite attendees."

Users should be able to choose stricter local-only processing for privacy-sensitive accounts when they want it, rather than the product imposing a single global default.

## 11. Privacy-Scoped Behavior

Scout should behave differently in private versus shared contexts, and those decisions should be explicit and auditable.

### Private 1:1 mode

In private 1:1 mode, Scout may use broader user-authorized context, including:

- Private email and calendar context.
- Connected Drive and meeting context.
- Private notes and prior user-specific working context.

### Shared channel mode

In shared channel mode, Scout should default to channel-visible or otherwise shared context only.

It should not assume that because the user personally authorized a source, the result is safe to reveal into a shared space.

### Private-context handling in shared channels

If private context is relevant to answering a shared-channel request, Scout must not leak it.

Instead, it should:

- Offer to continue in DM.
- Produce a sanitized summary that omits private-only facts.
- Explain that additional context exists but is not appropriate to surface in the current channel.

### Auditability

Privacy decisions should be:

- Explicit in the result payload.
- Visible in the audit trail.
- Traceable to account/channel scope and approval policy.

## 12. Native-First Routing

Scout should classify requests and route to native integrations before browser automation.

Routing order should be unambiguous:

1. Native email, calendar, Drive, Slack, and meeting-context sources.
2. Other authenticated structured sources available through the trusted local harness.
3. Browser automation only for public web tasks or UI-only tasks where native integrations cannot do the job.

Examples:

- "What is on my calendar tomorrow?" -> Calendar API.
- "Find Caitlin's latest email" -> Email API.
- "What did Amit send me?" -> Email + Slack search.
- "Draft follow-up from my 10am call" -> Meeting transcript + email context + docs.
- "What is the weather in Tokyo?" -> Web search or browser.
- "Open this web app and click export" -> Browser automation.

If native sources are unavailable:

1. Explain the missing source.
2. Offer reconnect/remediation.
3. Use browser fallback only when it can plausibly help.
4. Do not claim the user has no data if the issue is access or scope.
5. Report missing auth or scope as an access failure, not as "no data."

## 13. Meeting Intelligence V2

### Before Meeting

For each upcoming meeting, Scout should prepare:

- Meeting purpose inferred from title, attendees, description, prior meetings, email threads, and attached docs.
- Last touchpoint summary.
- Open commitments.
- Relevant emails since the last meeting.
- Relevant Slack/Telegram/WhatsApp mentions.
- Relevant docs/files.
- Suggested questions.
- Risks or unresolved issues.
- Recommended tone.

### During Meeting

Scout should:

- Capture transcript reliably.
- Accept inline questions.
- Use native context where possible.
- Track commitments as they occur.
- Mark uncertain items for review.

### After Meeting

Scout should produce:

- Human-quality summary.
- Action items with owners and due dates.
- Follow-up email draft that sounds like the user, not meeting notes pasted into email.
- Watchlist updates.
- Optional Slack/Telegram summary draft.

## 14. Context Strategy

Scout must assume context will grow beyond provider limits.

Requirements:

- Preserve important commitments, decisions, sources, and unresolved questions.
- Summarize large tool results before feeding them back into the model loop.
- Compact history conditionally when provider returns context/window errors.
- Use retrieval over full-history replay when possible.
- Keep source refs outside the model context and rehydrate only when needed.
- Retry after compaction and summarization rather than immediately failing.
- Support `knapsack`-only and other single-provider users without assuming a backup provider exists.
- Log context pressure, compaction decisions, provider, model, and fallback attempts with telemetry IDs.

Do not solve context pressure by simply dropping history. That makes Scout worse at its core job.

For single-provider resilience:

- Preserve source refs outside prompt context even when the prompt is compacted.
- Summarize oversized tool outputs before they are reintroduced.
- Retry with a compacted context plan that preserves commitments, decisions, and open loops.
- Make the compaction decision visible in telemetry and diagnostics.

## 15. Proactivity Rules

### Notify immediately only when:

- A meeting starts soon and prep is missing or important context changed.
- Someone directly asks the user for something time-sensitive.
- Scout is blocked from completing an explicitly requested task.
- A follow-up promised by the user is due or overdue.

### Batch by default when:

- Multiple low urgency tasks are detected.
- Threads are merely stale.
- Scout has low confidence.
- The user previously dismissed similar suggestions.

Daily digest cadence should default to daily.

### Do not notify when:

- Source is weak or ambiguous.
- The user is in focus/meeting mode and the item is not urgent.
- The item is already captured elsewhere.
- The action would feel socially risky without review.

## 16. Trust, Controls, And Audit

Every proactive item should answer:

- Why am I seeing this?
- What source created it?
- What will Scout do next?
- What account/channel is this scoped to?
- What permission is missing if blocked?
- How do I stop this class of suggestion?

Required UI controls:

- Dismiss
- Snooze
- Track
- Draft
- Approve/send
- Do not suggest this again
- View sources
- View diagnostic

Audit log should include:

- Trigger event.
- Sources consulted.
- Model/provider used.
- Tool calls.
- Privacy decisions and any redactions/reroutes.
- Action generated.
- Approval status.
- Failure reason.
- Cost/latency estimate where available.

## 17. MVP Scope

### MVP 1: Watchlist Detection + Manual Review

Inputs:

- Calendar
- Email
- Meeting transcripts
- Slack

Outputs:

- Desktop Watchlist panel
- Meeting prep items
- Follow-up drafts
- Source-backed item details

Constraints:

- No automatic sending.
- Slack/Telegram proactive replies only when explicitly invoked.
- Browser fallback visible and limited.
- Watchlist should include both personal items and shared channel items at launch.

### MVP 2: Proactive Meeting And Follow-Up

Add:

- Pre-meeting briefing notification.
- Post-meeting follow-up draft notification.
- Stale follow-up detection.
- Daily digest.

### MVP 3: Channel Follow-Through

Add:

- Slack/Telegram thread tracking.
- "Scout, keep this moving" command.
- Shared channel Watchlist items.
- Channel-scoped audit and controls.

## 18. Success Metrics

Activation:

- Percent of users with at least one connected calendar and email account.
- Percent of meetings with usable prep generated.
- Percent of meetings with follow-up draft generated.

Usefulness:

- Draft acceptance/edit rate.
- Watchlist item completion rate.
- Dismissal rate by item type.
- User rating on prep/follow-up quality.

Trust:

- Source view usage.
- Failed action rate.
- Reconnect/remediation success rate.
- Provider/tool/channel error rate.

Behavioral:

- Reduction in missed follow-ups.
- Increase in follow-up emails sent within 24 hours.
- Increase in meetings opened with prep viewed.

## 19. QA Requirements

The QA loop must include:

- Multi-account calendar and email visibility.
- Native email/calendar answers without browser opening.
- Meeting prep using connected email context.
- Follow-up email quality and draft generation.
- Slack and Telegram direct-message response with native context.
- Slack thread tracking and "keep this moving" command.
- Browser fallback only for browser-appropriate prompts.
- Provider context pressure handling with a single provider configured.
- Shared-channel privacy behavior that does not leak private-only context.
- Tool/provider/channel failure surfaced with actionable diagnostics.
- Proactivity quietness: no duplicate notifications, no repeated stale alerts after dismissal.

Acceptance thresholds:

- Gateway/browser ready within existing product readiness targets.
- Native calendar/email query response under 10 seconds when connected data is local or API-ready.
- Meeting prep generated at least 15 minutes before meeting when app is running and data is available.
- Follow-up draft generated within 60 seconds after recording stop.
- No outbound send without explicit approval.
- Proactive alerts should support both desktop notifications and in-app surfaces.

## 20. First PR Stack

### PR 1: Native Routing + Instrumentation

- Add intent classifier for calendar/email/meeting/Slack-history questions.
- Route native-first before browser.
- Log selected route, fallback route, source counts, and blocked reason.
- Add Sentry events for provider unavailable, context pressure, missing native scope, privacy reroute, and browser fallback failure.

### PR 2: Watchlist Data Model

- Add local Watchlist storage.
- Add WorkSignal normalization for calendar/email/meeting/Slack.
- Add commitment/ask/follow-up classifiers.
- Add dedupe and state transitions.

### PR 3: Watchlist UI

- Add desktop panel.
- Add source drawer.
- Add dismiss/snooze/track/draft actions.
- Add empty states that explain what data is connected.

### PR 4: Meeting Intelligence V2

- Rebuild meeting prep around native calendar/email/docs/transcript context.
- Improve follow-up email prompt and output format.
- Add source refs and confidence.

### PR 5: Channel Follow-Through

- Add Slack/Telegram "keep this moving" command.
- Add channel-scoped Watchlist items.
- Add channel-level tool status and policy summary.

## 21. Product Defaults

- Brand name: Scout.
- Watchlist launch scope: include both personal items and shared channel items.
- Local-only processing for privacy-sensitive accounts: user-selectable.
- VIP people and watched accounts: not in the initial scope.
- Daily digest cadence: daily.
- Proactive alerts: both desktop notifications and in-app surfaces.

## 22. Decision Summary

Build toward a proactive follow-through system powered by a proprietary Scout Runtime, not a better chatbot or a markdown-defined local agent.

The first lovable version should make one promise:

> Scout notices what matters, prepares the next step, and asks before acting.

Scout is the name of the proactive layer. The first version should support both personal and shared-channel follow-through, default to a daily digest, surface proactive alerts both in-app and through desktop notifications, and let users choose stricter local-only handling for privacy-sensitive accounts.

If Scout consistently helps users walk into meetings prepared, send better follow-ups, remember commitments, and recover from blocked tools clearly, it will be meaningfully differentiated even as Claude Tag, Slackbot, and model vendors improve.
