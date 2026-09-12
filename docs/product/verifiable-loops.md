# Knapsack Verifiable Loops

## Product brief

**Status:** Working product direction  
**Product promise:** Knapsack notices recurring work early, takes on the safe
parts, asks only when judgment or permission is required, and keeps going until
there is evidence of the outcome.

## Vision

Most knowledge work is not a collection of isolated prompts or tasks. It is a
set of recurring loops: signals arrive, context is gathered, decisions are
made, actions are taken, and an outcome is checked.

Knapsack should learn those loops from the work a user already does across
email, meetings, calendars, documents, and business systems. It should then
earn responsibility for more of each loop—from observation, to preparation, to
supervised execution, and eventually to handling routine cases while escalating
exceptions.

A commitment is one useful signal inside this system. It is not the organizing
object and should not turn Knapsack into another task manager the user must
maintain.

## Why now

General-purpose agents are becoming capable of performing individual steps,
but users still have to recognize the work, formulate the task, provide the
context, supervise execution, and decide whether it really succeeded. That
coordination tax limits practical productivity.

Knapsack's opportunity is to own the durable layer around model calls:

- recognizing that a repeatable loop exists
- preserving its state and context over time
- enforcing its approvals and controls
- choosing interchangeable models and execution environments
- verifying the real-world result
- improving the loop from observed outcomes

The durable loop—not the chat session or model—is the product.

## Product principles

### Safe

- Observation is read-only and is always the starting point.
- Authority is explicit, scoped per loop, and revocable.
- Consequential actions require the recorded approval policy.
- The model performing work is never the sole verifier of its work.
- A run cannot be called complete until its required evidence is present.
- Every transition, approval, exception, and proof artifact is auditable.
- Uncertainty, missing context, and conflicting evidence stop or narrow action.

### Simple

- Users do not draw workflows before receiving value.
- Knapsack proposes loops from existing behavior in plain language.
- The normal interface answers four questions: What did Knapsack notice? What
  is it doing? What needs me? How does it know the work is done?
- Scout is the single front door; specialists, tools, and infrastructure remain
  behind the experience.
- Users approve outcomes and boundaries, not agent implementation details.

### Sovereign

- Knapsack owns the canonical loop definitions, state, approvals, and evidence.
- Desired outcomes and controls are stored independently of provider prompts.
- Models, clouds, vector stores, connectors, and agent runtimes are replaceable
  adapters.
- Canonical state is stored locally in a documented, versioned format and can be
  synchronized to a Knapsack-hosted or customer-owned control plane.
- Provider memory and indexes are disposable derived state.
- Users can inspect, export, migrate, pause, and delete their loops.

## Target user and initial wedge

The initial user is a busy operator or executive who works across several
accounts and organizations, spends much of the day in meetings and email, and
is responsible for outcomes that cross people and systems.

The first wedge is **workday loops** because Knapsack already observes their
signals and can verify many outcomes without deep ERP integration:

1. meeting to approved recap and owned next steps
2. important inbound email to correct, delivered response
3. request or decision to completed follow-up

The abstraction must simultaneously support **controlled operating loops** so
the product does not collapse into a personal task tracker:

4. invoice receipt to approved, settled, posted, reconciled payment
5. forecast cycle to approved publication and later calibration against actuals

Workday loops establish daily usefulness. Finance loops prove that Knapsack can
become operational infrastructure.

## Jobs to be done

### Primary job

> When work begins or repeats, help me recognize the whole process, take on the
> safe and repeatable parts, involve me only where my judgment or authority is
> needed, and prove that the intended result occurred.

### Supporting jobs

- Show me important work I have not yet turned into a task.
- Preserve context across meetings, messages, files, people, and time.
- Prepare the next best action before I ask.
- Prevent work from silently stalling between people or systems.
- Let me delegate without losing control, provenance, or visibility.
- Improve recurring processes from exceptions and measured outcomes.

## Core user experience

### 1. Notice

Knapsack passively observes authorized sources and detects repeated patterns.
A candidate loop card explains:

- what pattern was observed and over what period
- the likely trigger and desired outcome
- the people and systems involved
- the steps that appear deterministic or repeatable
- the decisions or actions requiring authority
- how completion could be verified
- what context or proof is still missing

The user can **Start observing**, dismiss, or correct the proposal. Starting
observation grants no permission to send, pay, publish, or modify another
system.

### 2. Learn

During observation, Knapsack builds a process map from actual runs. It records
the order of steps, common inputs, human decisions, exceptions, timing, and
authoritative proof. It shows the user a concise comparison between inferred
behavior and what actually happened.

### 3. Prepare

Once reliable, Knapsack gathers context and prepares artifacts: a recap, draft,
payment packet, forecast package, system update, or decision brief. The user
reviews a single outcome-oriented approval surface showing target, account,
material changes, risks, and expected proof.

### 4. Execute and verify

For authorized loops, Knapsack executes the approved steps, checks
authoritative systems, and presents a receipt. A success state says what
happened and cites the evidence. A blocked state says exactly what is missing
and the smallest user decision needed.

### 5. Improve

Knapsack measures exceptions, reversals, human edits, timing, and downstream
outcomes. It recommends a maturity change only after the loop meets explicit
quality and safety thresholds.

## Domain model

### Loop definition

A definition contains:

- stable id and schema version
- name, description, and business category
- trigger and authoritative source
- desired outcome
- observed steps and expected artifacts
- autonomy maturity
- approval and escalation policy
- required verification rules
- owners, systems, and account identities
- lifecycle status and version history

### Loop run

A run contains:

- loop definition and version
- trigger and source provenance
- current state and append-only state history
- inputs, prepared artifacts, and action receipts
- approval decisions and identity of approvers
- exceptions and escalation state
- verification evidence
- start, deadline, and update timestamps

### Run lifecycle

```text
detected
  -> gathering context
  -> preparing
  -> waiting for approval (when required)
  -> executing
  -> verifying
  -> completed
```

Blocked, failed, cancelled, and expired are explicit states. "Completed" is a
guarded result, not an agent-authored label.

### Autonomy maturity

1. **Observe:** map the human process without taking action.
2. **Shadow:** produce an independent result and compare it with the human run.
3. **Prepare:** gather inputs and create drafts or packets for review.
4. **Supervised:** execute explicitly approved steps and verify the result.
5. **Exception only:** handle established low-risk cases within policy and
   escalate exceptions.

Promotion is earned per loop. There is no global autonomous mode.

## Verification model

Every loop declares what constitutes proof before execution. Supported methods
are:

- **System record:** an authoritative system confirms the outcome.
- **Deterministic check:** code or a rule validates the required condition.
- **Human approval:** an authorized person records a judgment or control.
- **Deferred outcome:** later evidence evaluates an earlier prediction or
  intervention.

Examples:

| Loop              | Required evidence                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Meeting follow-up | recording ended, recap approved, delivery receipt, next-step owners recorded                       |
| Email response    | correct account and recipients, approved wording when required, message in Sent                    |
| Invoice payment   | duplicate and matching checks, authorized release, bank settlement, ledger posting, reconciliation |
| Forecast          | current source data, approved assumptions, published version, later variance against actuals       |

## Trust and authority model

Authority is represented as a policy attached to a loop and constrained by:

- permitted action types
- permitted accounts, systems, recipients, and monetary limits
- required approvers
- validity period and revocation
- data residency and execution-location requirements
- mandatory verification and escalation behavior

Observation, shadowing, and preparation are structurally unable to execute
consequential actions. Supervised execution requires approval. Exception-only
execution is allowed only inside the explicit policy envelope; anything outside
it becomes blocked.

## Sovereign architecture

The system has five separable layers:

1. **Signal layer:** local and connected events from email, calendar, meetings,
   files, chat, browsers, and business systems.
2. **Loop control plane:** definitions, versions, run state, policies,
   approvals, deadlines, and audit history.
3. **Context plane:** local knowledge graph and retrievable artifacts with
   provenance and identity boundaries.
4. **Execution plane:** provider-neutral action requests routed to local agents,
   customer infrastructure, or approved clouds.
5. **Verification plane:** deterministic checks and system-of-record adapters
   that independently evaluate outcomes.

Models may propose a loop, interpret unstructured context, or perform a step.
They do not own canonical state, authority, or the definition of success.

## Differentiation

Knapsack should not compete as another general chat surface or one-off agent
workspace. Its differentiation is durable operational acceleration:

- **Proactive:** it recognizes work before the user formulates a prompt.
- **Longitudinal:** it learns processes across many runs, not one session.
- **Outcome-based:** it optimizes for verified real-world completion, not a
  plausible answer.
- **Governed:** authority and approval are first-class, per-loop objects.
- **Cross-system:** a loop persists across email, meetings, files, and systems of
  record.
- **Sovereign:** the control plane survives changes in model, cloud, runtime, or
  connector.
- **Compounding:** every observed run improves the process map, exception
  handling, and verification confidence.

## Roadmap

### Phase 1 — Loop foundation and workday proof (0–90 days)

**Goal:** prove that users understand, trust, and repeatedly use verifiable
loops.

- Ship Brain > Loops with candidate, active, blocked, and completed states.
- Persist provider-neutral definitions, run history, approval, and evidence.
- Detect meeting-follow-up candidates from completed recordings.
- Create meeting runs containing transcript, notes, decisions, and owners.
- Prepare recap and follow-up drafts; require approval before delivery.
- Verify delivery and next-step recording before completion.
- Detect likely email-response candidates with correct account identity.
- Add loop receipts, exception states, pause, and delete/export controls.
- Instrument every maturity transition, intervention, and verification result.

**Exit criteria**

- At least 20 design partners observe a loop for two consecutive weeks.
- At least 50% activate one proposed loop without workflow setup.
- At least 70% of activated meeting loops reach a verified outcome.
- Zero execution outside an explicit approval policy.
- False completion rate below 1% in supervised loops.

### Phase 2 — Learning and multi-run reliability (3–6 months)

**Goal:** show that Knapsack gets materially better with repeated use.

- Add shadow mode and artifact comparison.
- Learn common edits, exceptions, durations, and missing inputs.
- Add per-loop reliability and maturity recommendations.
- Add deadlines and proactive blocked-loop escalation.
- Introduce provider-neutral execution requests and two model/runtime adapters.
- Add signed definition and run export/import.
- Launch one finance design-partner loop in observation and preparation modes.

**Exit criteria**

- Median human edits per prepared artifact decline over five runs.
- At least 30% of retained users run three or more loop types weekly.
- The same loop passes its acceptance suite on two model providers.
- Blocked work is surfaced before its deadline in at least 90% of instrumented
  runs.

### Phase 3 — Controlled operations (6–12 months)

**Goal:** move from personal acceleration into auditable business operations.

- Add accounting, banking, and planning-system adapters.
- Pilot invoice-to-reconciliation and forecast-calibration loops.
- Add role-based approval, segregation of duties, monetary limits, and policy
  simulation.
- Add customer-owned sync/control-plane deployment.
- Add exception-only maturity for narrowly bounded, reversible actions.
- Publish audit and evidence export for operational reviews.

**Exit criteria**

- A finance loop completes end to end with independent system-of-record proof.
- Design partners reduce median handling time by at least 30% without increased
  exception or reversal rates.
- Customer-owned execution can replace Knapsack-hosted execution without
  changing the loop definition.

## Phase 1 epics and acceptance criteria

### Epic A — Loop registry and guarded lifecycle

- Definitions and runs persist locally in a versioned portable format.
- Invalid state transitions are rejected.
- Observation, shadow, and preparation cannot execute actions.
- Supervised execution cannot start without approval.
- Completion cannot occur without every required proof item.
- Run history is append-only from the user experience.

### Epic B — Candidate discovery

- A completed meeting can create a candidate without manual entry.
- Every candidate names its observed signal and confidence.
- Duplicate proposals collapse into one loop candidate.
- Accepting begins in observation; dismissing suppresses repeated noise.
- Users can correct trigger, outcome, and verification requirements in plain
  language.

### Epic C — Meeting follow-up loop

- Recording completion reliably triggers gathering and preparation.
- Processing progress is visible immediately.
- The run associates the correct meeting, attendees, transcript, and account.
- The user receives a polished recap and proposed next steps.
- Copy output renders cleanly in Slack and email.
- Sending requires target/account confirmation and approval.
- Delivery and next-step ownership are verified before completion.

### Epic D — Trust surface

- Every run shows status, next action, approval boundary, and required proof.
- The user can pause or cancel a loop at any point before an irreversible step.
- Errors distinguish missing context, denied authority, execution failure, and
  failed verification.
- Advanced detail exposes provenance, model/runtime, and audit history without
  cluttering the default view.

### Epic E — Sovereignty test harness

- Loop fixtures run without network access through preparation.
- Canonical data can be exported and re-imported losslessly.
- An execution adapter can be replaced without changing stored loop state.
- Verification tests do not rely on the model that performed the action.
- Account and tenant boundaries are included in acceptance fixtures.

## Metrics

### North-star metric

**Verified outcomes per weekly active user.**

This counts a run only when its declared evidence is satisfied. It avoids
rewarding noisy suggestions, agent activity, or unverified claims.

### Supporting metrics

- candidate acceptance and dismissal rates
- time from signal to candidate and signal to verified outcome
- verified completion rate by loop type and maturity
- human interventions and edit distance per verified run
- false completion, reversal, and approval-policy violation rates
- blocked runs surfaced before their service-level deadline
- retained users with two or more active loop types
- cost and latency per verified outcome
- percentage of loop acceptance suites passing across multiple providers

## Risks and mitigations

| Risk                                         | Mitigation                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Candidate noise destroys trust               | Begin with high-confidence event boundaries, show why a loop was proposed, learn dismissals |
| Users fear surveillance                      | Local-first storage, visible source controls, observation receipts, pause/delete/export     |
| Verification becomes a model assertion       | Require typed evidence from deterministic checks or authoritative systems                   |
| Agent takes an unauthorized action           | Structural maturity gates plus explicit scoped authority and action-time checks             |
| Product becomes a task manager               | Center runs on triggers, outcomes, actions, and proof; commitments remain signals           |
| Integrations dominate the roadmap            | Prove the control plane on workday loops, then add adapters by high-value loop              |
| One provider becomes architectural           | Keep prompts and execution behind adapters; test fixtures across providers                  |
| Enterprise controls make the product complex | Progressive disclosure: simple default surface, policy detail only when needed              |

## Non-goals

- A general-purpose workflow builder.
- A replacement for project management or accounting systems of record.
- Fully autonomous execution on first observation.
- Model-specific memory as canonical product state.
- Measuring success by messages sent, tasks generated, or agent runtime.
- Requiring users to document every commitment or manually maintain each loop.

## Immediate decisions

1. Treat the loop registry and verification contract as platform primitives,
   not meeting-feature implementation details.
2. Use meeting follow-up as the first complete vertical slice.
3. Require an independent proof path for every completion claim.
4. Start all discovered loops in observation mode.
5. Instrument the maturity ladder before enabling supervised execution.
6. Design the provider-neutral execution contract before adding a second runner.
7. Recruit finance design partners during Phase 1 so their controls shape the
   abstraction before Phase 2.

## One-sentence positioning

> Knapsack is the private, model-independent operating layer that learns your
> recurring work, takes on what it can safely handle, and proves the outcome.
