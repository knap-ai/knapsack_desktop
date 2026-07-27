# Managed Agents Internal Spec

## Purpose

This spec defines the first Knapsack-managed agent layer that sits above today's desktop runtime.

The goal is to move from fragile per-machine agent behavior toward managed agents with:

- a shared cloud identity,
- reusable role and tenant memory,
- optional desktop extension when local capability is needed,
- consistent policy enforcement across Slack, Studio, and desktop chat.

This layer should support a general-purpose Scout agent first, then reusable named agents such as `vera_compliance_manager` and `felix_operations_assistant`.

## Product Shape

Each managed agent has:

- a stable agent id,
- a display name,
- a template,
- a tenant binding,
- a policy pack,
- an execution mode,
- enabled channels,
- layered memory references,
- shared task context that survives runtime handoff.

Knapsack should own this state. The desktop app may cache or extend it, but the source of truth should move toward Knapsack-managed storage and routing.

## Agent Examples

### `scout_general`

- global, reusable baseline agent
- general-purpose follow-through and coordination
- cloud-primary by default
- desktop extension optional

### `vera_compliance_manager`

- tenant-specific compliance operations agent
- optimized for mailbox workflows, filing, escalations, and repeatable controls
- cloud-primary with optional desktop extension
- should be reusable as a role template across customers, with tenant memory layered in

### `felix_operations_assistant`

- tenant-specific operations and scheduling agent
- optimized for recurring execution, reminders, scheduling, and operational follow-through
- cloud-primary with optional desktop extension

## Memory Model

Managed agents should use layered memory rather than one flat mutable memory file.

### Layer 1: Template Memory

Reusable memory for the broad agent type.

Examples:

- `scout_general_v1`
- `compliance_manager_v1`
- `operations_assistant_v1`

This includes:

- default behavior,
- tone,
- tool preferences,
- reusable operating guidance.

### Layer 2: Role Pack Memory

Reusable role-specific practices that can be shared across tenants.

Examples:

- `rethought_compliance_ops_v1`
- `rethought_operations_v1`

Long term these should be generalized so a new tenant can instantiate the same role with minimal drift.

### Layer 3: Tenant Memory

Shared tenant context owned by Knapsack cloud.

Examples:

- org-specific rules,
- preferred vendors,
- escalation paths,
- recurring business context,
- allowed systems and channels.

This memory should be shared across managed runtimes and not tied to one desktop machine.

### Layer 4: Instance Memory

Agent-instance memory for named agents.

Examples:

- `vera_compliance_manager_v1`
- `felix_operations_assistant_v1`

This includes:

- durable role-specific instructions,
- approved workflow patterns,
- scoped personalizations that belong to that agent identity.

## Routing Model

Every task should route through a managed routing layer before execution.

Possible route outcomes:

- `cloud`
- `desktop`
- `hybrid_fallback`
- `blocked`

### Cloud

Use cloud runtime when:

- the task can be completed without local-only capabilities,
- the desktop is offline,
- or the desktop is optional and cloud is sufficient.

### Desktop

Use desktop runtime when:

- the task requires local files,
- local apps,
- computer use,
- private local context,
- or a signed-in browser session that only exists on the user machine.

### Hybrid Fallback

Use desktop first, but preserve shared context so cloud can continue if the desktop disappears or fails.

This is the preferred mode for:

- browser-heavy work,
- user-authenticated web tasks,
- workflows that are better on desktop but not impossible in cloud.

### Blocked

Return blocked when:

- the task requires desktop-only capabilities,
- and there is no matching live desktop extension,
- and cloud cannot safely continue.

Blocked must be explicit and truthful. The product should never imply completion from partial activity.

## Shared Context Contract

Managed tasks need a shared context record that is runtime-agnostic.

Minimum fields:

- `agent_id`
- `tenant_id`
- `user_id`
- `context_key`
- `thread_id`
- `current_runtime`
- `handoff_summary`
- `last_user_intent`
- `notes`
- `updated_at`

This context is what makes cloud fallback credible. It should let Studio continue a task when desktop disappears, and let desktop resume when the machine returns.

## Policy Packs

Policy packs should be explicit objects, not incidental settings.

Minimum policy controls:

- thread-only Slack replies
- verbose reasoning disabled by default
- GUI keystroke simulation disabled
- DOM verification required for browser tasks
- model fallback visibility enabled
- recurring-task truthfulness required

These should be enforced by runtime, not left to prompt drift.

## Desktop Extension

The desktop app should act as an optional execution plane, not as the primary identity holder.

Desktop contributes:

- local browser automation
- signed-in browser sessions
- local file access
- local app access
- computer use
- private local context
- presence heartbeat and capability snapshot

Desktop should publish:

- whether it is available,
- what capabilities it currently has,
- whether it is stale,
- whether desktop extension is enabled for the bound user.

## Studio / Cloud Fallback

Studio chat should be a first-class fallback surface, not a separate disconnected experience.

If desktop is unavailable:

- the managed agent should still be reachable in Studio,
- shared context should remain available,
- the user should be told when output quality or capability has changed,
- and the task should continue when safely possible.

This is especially important for enterprise workflows where users move between Slack, Studio, and desktop throughout the day.

## Relationship To OpenClaw

Managed agents can still use OpenClaw runtimes, but OpenClaw should sit below the managed-agent control plane.

That means:

- Knapsack owns the agent registry,
- Knapsack owns the memory layers,
- Knapsack owns policy packs,
- Knapsack owns routing decisions,
- OpenClaw acts as an execution runtime for cloud and desktop tasks.

This keeps the strengths of OpenClaw while moving reliability, policy, and continuity into Knapsack-owned infrastructure.

## Initial Backend Slice

The first desktop-backed implementation should provide:

- seeded managed agent templates
- seeded policy packs
- seeded managed agents
- shared context persistence
- desktop presence persistence
- route preview logic

This is a backend foundation, not yet the full product.

## Next Implementation Steps

1. Add a desktop UI surface to inspect managed agents, policy packs, presence, and current route decisions.
2. Add a Studio-side managed-agent registry so desktop state stops being the long-term source of truth.
3. Add real heartbeat publishing from desktop into Knapsack-managed storage.
4. Add task handoff flows between desktop and Studio runtimes.
5. Add admin controls for enabling or disabling desktop extension per user.
6. Add reusable role-template creation so new tenant agents can be provisioned from Scout, Vera, and Felix patterns.
7. Add audit and history views so teams can inspect fallback, pause, and policy decisions.

## Success Criteria

This layer is successful when:

- Scout, Vera, and Felix can be expressed as managed agents with the same core schema,
- Slack and Studio share the same managed context,
- desktop capability is optional rather than foundational,
- fallback is explicit and truthful,
- and tenant knowledge survives machine changes, updates, and user turnover.
