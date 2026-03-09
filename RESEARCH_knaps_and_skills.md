# Research: How Users Access and Build Knaps in Knapsack Desktop

## Current State

### Two Independent Systems

**Knaps (Automations)** and **Skills (OpenClaw/MCP plugins)** are currently separate, parallel systems in the app. They don't interact with each other.

---

## How Users Currently Access Knaps

### Navigation
- **Sidebar tab bar** has an "Automate" tab, but it's **gated behind `fullRelease` flag** — only visible in full-release builds
- The **NewAutomation** view is accessible via:
  - Keyboard shortcut `Cmd+Ctrl+S` (hidden/developer shortcut)
  - The "Automate" tab (when enabled)
  - `+ Build new automation` card in the AutomationsList view
- The **Automation Lab modal** (Calendly booking for white-glove automation building) can be triggered from various places

### What Users See in the "Automate" Tab
- **AutomationsList**: Grid of automation cards showing name, description, data source icons
  - Each card has "View" (see past runs) and "Execute" (run now) buttons
  - Cards for "Email summary" and "Meeting prep" are **protected from deletion/editing** (built-in knaps)
  - Other user-created automations have a dots menu with Edit/Delete options
  - `+ Build new automation` card at the end

### Building a New Automation (AutomationForm / NewAutomation)
Two versions of the builder exist in the codebase:

**Legacy Builder** (`AutomationForm`):
- Step 1: Select data sources (Gmail, Calendar, Drive, Local Files, Web)
- Step 2: Write a prompt describing what Knapsack should do
- Step 3: Set cadence (Manual, Hourly, Daily, Weekly)
- Step 4: Name and description
- Save → creates `SemanticSearch` + `Prompt` steps

**Newer Builder** (`NewAutomation`):
- Prompt-first: "What should Knapsack do?" (large textarea)
- Data sources: Multi-select search with connected/pending states
- Cadence: Manual, Hourly, Daily, Weekly, or "Other" (free text)
- Preview: Live preview panel on the right side
- Publish button → submits to backend

### Running Automations
- **Manual**: Click "Execute" on an automation card
- **Scheduled**: Backend `CadenceTrigger` runs automations on schedule (hourly, daily, weekly, startup)
- **Results**: Appear as `AutomationRun` records → `FeedItem` + `Thread` in the activity feed
- Results are rendered through the chat message list system

---

## How Users Currently Access Skills

### Navigation
- Skills tab in sidebar labeled "Skills" — currently **`isActive: false`** (hidden)
- Skills are primarily accessed through the **ClawdChat** interface:
  - "Skills" button in chat header opens a right-side panel (400px)
  - Skill chips in the welcome area for quick access
  - Activity Panel terminal with CLI-style `skills list/install/enable/disable` commands

### Skills Panel (In-Chat)
Organized into four sections:
1. **Ready** (green dot) — enabled and usable
2. **Needs Setup** (orange dot) — missing dependencies/API keys
3. **Available from OpenClaw** (blue dot) — not yet installed
4. **Disabled** (gray dot) — installed but turned off

### Skills & MCPs Marketplace
- Dedicated view (currently hidden behind `isActive: false`)
- Three modes: "All", "Skills", "MCP Servers"
- Search and filter capabilities
- Install/configure/enable/disable lifecycle

### Skill Types
1. **Built-in** (9): Web Search, Browser Control, Email, Calendar, File Reader, File Writer, Python Scripts, Shell Commands, Screenshot
2. **OpenClaw** (41+): Community plugins (Notion, Slack, GitHub, etc.)
3. **MCP Servers**: External plugins with custom commands

---

## The Gap: Knaps Don't Use Skills

### Current Flow
```
Knaps → [data fetchers] → [LLM prompt] → [feed item]
Skills → [chat/gateway] → [tool execution] → [chat response]
```

### What's Missing
- Knaps can only use hardcoded step types (SemanticSearch, Prompt, EmailSummary, MeetingPrep, etc.)
- Knaps cannot invoke skills (Web Search, Slack, GitHub, etc.) as steps
- The automation builder only offers data source selection + a prompt — no skill/tool selection
- Users can't compose multi-step workflows that leverage the rich skill ecosystem

---

## Observations and Considerations

### 1. "Knapsack Studio" — Announced but Not Built
- The AutomationLabModal mentions "Knapsack Studio, our latest innovation, is arriving soon!"
- Currently redirects users to book a Calendly call for "white-glove Automation Labs"
- This is the natural home for a richer knap builder

### 2. The Builder is Prompt-Centric
- Both builder versions center around: "tell us what to do in natural language"
- This is a strength — it's approachable
- But it limits composability and predictability

### 3. Feature Flags Gate Most of the UI
- `fullRelease` gates: Automate tab, Chat tab
- `isActive: false`: Skills & MCPs marketplace tab, RAG/Workspaces tab
- The current production experience may be quite limited compared to what's in code

### 4. Skills Have Rich Infrastructure, Knaps Don't
- Skills have: marketplace, installation lifecycle, status monitoring, CLI management
- Knaps have: basic CRUD, simple sequential execution, prompt-based builder
- There's an asymmetry — skills are a platform, knaps are a feature

### 5. The Chat System is the Bridge
- Both knaps and skills ultimately feed into the chat/thread system
- Automation results become feed items/threads
- Skills are invoked through the chat gateway
- The chat layer is the natural integration point

---

## Potential Directions

### Option A: Skills as Knap Steps
Allow knaps to include skill invocations as steps in their sequential workflow. A knap could: fetch emails → summarize with LLM → post to Slack (skill) → create GitHub issue (skill).

### Option B: Chat-Driven Knaps
Reframe knaps as "saved chat prompts with triggers." Instead of a custom execution engine, knaps would be scheduled chat conversations where Claude has access to all enabled skills. The existing gateway/skill infrastructure handles execution.

### Option C: Knap Studio as Visual Workflow Builder
Build the promised "Knapsack Studio" as a node-based or step-based visual builder where skills are first-class building blocks alongside data sources and LLM prompts.

### Option D: Hybrid — Smart Prompts + Skill Access
Keep the prompt-centric approach but give the automation execution engine access to the skill/gateway layer. When a knap runs, it executes through the same gateway that has skill access, so Claude can use any enabled skill while fulfilling the automation prompt.
