# Scout Proactive Work Agent Spec

Status: Draft v0.2  
Owner: Product / Engineering  
Launch wave: Slack first, Telegram later

## Summary

Scout should be implemented as one shared Studio-hosted identity with an optional per-user desktop execution plane.

Every inbound Scout interaction enters through Studio first. Studio decides whether to:

- execute in the cloud,
- hand the task off to the user’s paired desktop, or
- attempt desktop first and fall back to cloud.

This keeps the product model simple:

- one Scout Slack app,
- one runtime contract,
- one privacy model,
- two execution targets.

The desktop app is not a separate agent. It is an optional trusted execution/data plane that expands what Scout can do for that specific user when their machine is online.

## 1. Strategic Thesis

Scout should not try to win as "just another Slack bot." It should win by owning follow-through across the workday:

- meeting commitments,
- unresolved message threads,
- email follow-up,
- calendar prep,
- docs/files context,
- relationship continuity,
- execution of real work when advanced tools are needed.

The durable product advantage is not Slack presence alone. It is the combination of:

- a proprietary runtime that plans, routes, and enforces policy,
- shared messaging identities that make Scout easy to reach,
- and a trusted desktop plane that unlocks browser work, computer use, local files, and local-only scopes when available.

Positioning:

> Scout is the follow-through agent for your workday. It helps from Slack first, and when your paired desktop is available it can go beyond chat into real execution.

## 2. Product Model

### Shared identity

Scout has one shared app identity per workspace for Slack. Telegram should later reuse the same routing and privacy contract.

Users do not each get their own Slack bot. Instead:

- the workspace installs Scout once,
- each user binds their Slack identity to their Knapsack account,
- and Studio resolves each inbound message to the correct user and policy scope.

### Two execution planes

Scout can run in:

1. Studio cloud runtime
2. Paired desktop runtime

Studio is always:

- the ingress layer for Slack,
- the policy engine,
- the audit owner,
- and the egress layer for Slack replies.

The desktop is optionally:

- a source-gathering plane,
- an advanced tool plane,
- and a trusted local execution surface.

## 3. Core Architecture

### Studio owns

- Slack ingress and response delivery
- task planning and routing
- user binding resolution
- privacy policy decisions
- workspace/channel policy enforcement
- desktop presence registry
- cloud MCP/native execution
- audit records and telemetry

### Desktop owns

- signed-in user authentication to Studio
- desktop presence heartbeat
- local capability reporting
- local source retrieval
- browser work
- computer use
- local files and local-only scopes
- desktop-side privacy enforcement before returning results

### Markdown/custom instructions own

- tone
- operating preferences
- escalation style
- customer-specific norms

Markdown does not own routing, privacy boundaries, or runtime orchestration.

## 4. Routing Model

All Scout requests route through Studio first.

Studio evaluates:

- who the acting user is,
- which delivery surface the request came from,
- whether the user has a live paired desktop,
- whether the request materially benefits from desktop capabilities,
- whether privacy policy allows cloud fulfillment,
- and whether the request must be blocked, rerouted to DM, or answered in-channel.

### Execution targets

- `cloud`
  Studio fulfills using cloud MCPs/native integrations only.

- `desktop`
  Studio dispatches a scoped task to the user’s paired desktop and waits for a result.

- `hybrid_fallback`
  Studio prefers desktop, but falls back to cloud if no eligible desktop is available.

### Desktop session requirement

- `none`
  Cloud execution is fine.

- `preferred`
  Desktop is better if available, but not required.

- `required`
  Desktop is necessary. If unavailable, Scout returns a blocked result with guidance.

### Desktop-first examples

Prefer desktop when paired and online for:

- browser workflows,
- computer use,
- local file retrieval,
- local-only connectors,
- local app state,
- and richer follow-through actions that benefit from on-device context.

## 5. Identity, Binding, And Pairing

### Workspace install

Slack install is workspace-level. It stores:

- workspace/team metadata,
- bot identity,
- granted scopes,
- install mode/policy,
- and shared routing metadata.

### User binding

Each user separately binds:

- Slack user id
- to Knapsack user id

This allows:

- DMs to use that user’s private context and paired desktop,
- channel mentions to respect the acting user plus channel policy,
- and inbound events to work even when the workspace installer is not the acting user.

### Desktop pairing

The desktop app registers presence keyed by:

- user id
- device id

It publishes:

- availability,
- last heartbeat,
- browser availability,
- computer-use availability,
- local connector availability,
- and other capability hints.

Recommended v1 behavior:

- one active desktop per user for Scout routing,
- last-heartbeat-wins selection,
- no complex multi-device arbitration beyond freshness and capability matching.

## 6. Privacy Model

Privacy should be enforced as structured policy, not prompt instructions.

### Default boundaries

Private by default:

- personal desktop context,
- local files,
- personal email/calendar,
- personal memory,
- local-only scopes.

Allowed in shared channels:

- channel-visible Slack content,
- public/web data,
- explicitly shared artifacts,
- admin-allowlisted shared workspace data classes.

Not allowed in shared channels by default:

- another user’s private context,
- personal desktop-only data,
- personal local files,
- private connector content not explicitly shared.

### Privacy actions

Scout may:

- answer directly in channel,
- redact or summarize,
- ask to continue in DM,
- or block the request when policy requires it.

### Admin controls for v1

- shared-data allowlist
- allowed proactive shared-channel surfaces
- permission to use shared docs/meetings/email summaries in channels
- permission to surface sanitized desktop-originated results in channels

## 7. Runtime Contracts

The runtime contract should explicitly model identity, routing, privacy, and fallback.

### `ScoutTaskRequest`

```ts
type ScoutTaskRequest = {
  requestId: string;
  userIntent: string;
  userBinding: {
    knapsackUserId: string;
    slackUserId?: string;
    workspaceId?: string;
  };
  deliveryContext: {
    surface: 'slack_dm' | 'slack_channel' | 'slack_thread' | 'slack_mention' | 'slash_command' | 'proactive_digest';
    channelId?: string;
    threadTs?: string;
  };
  executionTarget: 'cloud' | 'desktop' | 'hybrid_fallback';
  desktopSessionRequirement: 'none' | 'preferred' | 'required';
  desktopCapabilities?: Array<
    'browser' | 'computer_use' | 'local_connectors' | 'local_files' | 'local_only_scopes'
  >;
  channelPolicyScope: {
    visibility: 'private_1_1' | 'shared_channel';
    allowedSharedDataClasses: string[];
  };
  sourceRefs: SourceRef[];
  compactSnippets?: Array<{
    id: string;
    kind: string;
    text: string;
    sourceRefs?: SourceRef[];
  }>;
  approvalPolicy: {
    requiresExplicitExternalSend: boolean;
    requiresApprovalForWrites: boolean;
    allowedAutomaticDrafts: boolean;
  };
};
```

### `SourceRef`

```ts
type SourceRef = {
  id: string;
  kind: string;
  title?: string;
  uri?: string;
  snippet?: string;
  dataClassification: 'private_personal' | 'shared_workspace' | 'channel_visible' | 'public';
  sharingBasis: 'user_auth' | 'workspace_install' | 'channel_visible' | 'admin_allowlist';
};
```

### `ScoutTaskResult`

```ts
type ScoutTaskResult = {
  requestId: string;
  answer?: string;
  draft?: string;
  sourceRefs: SourceRef[];
  executionTarget: 'cloud' | 'desktop' | 'hybrid_fallback';
  handoffReason?: string;
  fallbackReason?: string;
  privacyDecisions: Array<{
    decision: 'allowed' | 'redacted' | 'blocked' | 'reroute_dm' | 'shared_summary_allowed';
    reason: string;
    affectedSourceRefs?: string[];
  }>;
  blockedReasons?: string[];
  approvalNeededActions?: Array<{
    type: string;
    payload: Record<string, unknown>;
  }>;
  telemetryIds: {
    traceId: string;
    evaluationId?: string;
  };
};
```

## 8. Slack Behavior Rules

### DM behavior

In Slack DM, Scout may use:

- the bound user’s private scopes,
- paired desktop if available,
- and desktop-only capabilities if policy allows.

If the desktop is offline, Scout falls back to cloud where possible.

### Shared channel behavior

In shared channels, Scout may use only:

- channel-visible Slack context,
- public/web data,
- explicitly shared artifacts,
- admin-allowlisted shared workspace data classes.

If private context would improve the answer, Scout should:

- offer to continue in DM, or
- return a sanitized summary if policy permits.

### Delivery authority

Desktop should not post to Slack directly in v1.

Studio remains the final sender so:

- privacy checks stay centralized,
- retries stay centralized,
- audit remains consistent,
- and fallback logic stays deterministic.

## 9. API Surfaces

### Studio APIs

- `POST /api/scout/runtime/tasks`
- `POST /api/scout/runtime/work-signals/evaluate`
- `POST /api/scout/desktop/presence`
- `POST /api/scout/desktop/tasks`
- `POST /api/messaging/channels/slack/bind-user`
- `GET /api/messaging/channels/slack/bind-status`

### Desktop interfaces

- background heartbeat with `user_id`, `device_id`, capability snapshot, and availability
- inbound scoped task executor for Studio-originated Scout jobs
- result callback with answer/draft, source refs, privacy decisions, and blocked reasons

## 10. MVP Scope

### In scope

- Slack as the single launch channel
- shared Slack app install
- per-user Slack binding
- desktop presence registry
- desktop-preferred execution routing
- cloud fallback
- shared-channel privacy enforcement
- DM reroute behavior
- basic watchlist/thread follow-through built on the same policy model

### Out of scope for v1

- Telegram end-to-end launch
- direct desktop posting to Slack
- sophisticated multi-device arbitration
- broad autonomous outbound sends
- permissive shared-channel access to personal data

## 11. Implementation Order

1. Extend runtime contracts with execution target, user binding, delivery context, and privacy fields.
2. Add Studio desktop presence registry and scoped desktop task dispatch.
3. Add desktop heartbeat, capability snapshots, and inbound Scout task execution.
4. Replace manual Slack token assumptions with shared install plus per-user binding.
5. Add Slack DM and shared-channel routing with privacy-aware fallback.
6. Add watchlist/thread-tracking behaviors on the same scoped policy model.
7. Reuse the same contract for Telegram later.

## 12. Success Criteria

Scout v1 is working when:

- a bound user can DM Scout and get an answer whether or not their desktop is online,
- the same user gets richer execution when their paired desktop is online,
- a shared channel mention never leaks private personal context,
- Studio can explain whether a reply came from cloud or desktop path,
- and admins have a clear shared-data boundary they can reason about.

## 13. Non-Goals

Do not build this as:

- a separate desktop-only Scout identity,
- a per-user Slack bot model,
- a browser-first assistant,
- a prompt-only privacy model,
- or a generic chatbot whose behavior is disconnected from real follow-through.
