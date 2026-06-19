## Chat Context Budgeting

### Goal

Preserve Knapsack's autonomous/background behavior without allowing a single chat
turn to overload the active provider context window.

### Problem

The chat stack currently allows several large context sources to accumulate into
the foreground request:

- prior user/assistant history
- persistent memory notes
- native email/calendar prefetched context
- terminal output
- attachment text extraction
- gateway/shared-session history

Even when each source is reasonable alone, the combined foreground payload can
become large enough to trip provider limits or destabilize the request path.

### Design Principles

1. Background work should happen in separate working contexts.
2. Foreground chat should receive compact findings, not raw source dumps.
3. Every request path should have a deterministic inline-context budget.
4. If a request still exceeds provider limits, compact before failing over to a
   user-visible error.

### Immediate Safeguards in This Patch

1. **Bound memory notes before request send**
   - keep fewer entries
   - trim each summary
   - enforce a total character cap

2. **Bound frontend native context injection**
   - clamp prefetched email/calendar context
   - only include terminal context for prompts that are actually code or
     terminal related
   - clamp any terminal context that is included

3. **Bound inline request text on both chat paths**
   - clamp the assembled frontend text before it is sent
   - clamp the gateway `agent-chat` inline text before it reaches the bundled
     gateway
   - clamp the direct `/api/clawd/chat` user-turn payload before it reaches the
     provider loop

4. **Preserve autonomy**
   - the system still performs autonomous/background work
   - the change only reduces how much raw material is replayed into the active
     foreground turn

### Follow-up Work

The durable architecture should move further toward:

- artifact handles instead of raw inline tool output
- subtask-specific scratch contexts
- retrieval-on-demand for email/calendar/browser results
- token-budget preflight by source before every provider call
