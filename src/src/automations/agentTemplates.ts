import {
  AgentIdentity,
  Automation,
  AutomationDataSources,
  Cadence,
  CadenceType,
  DaysOfWeek,
} from './automation'
import Prompt from './steps/Prompt'
import SemanticSearch from './steps/SemanticSearch'

export type AbstractSource = 'email' | 'calendar' | 'drive' | 'web' | 'local'

export interface AgentTemplate {
  id: string
  defaultIdentity: AgentIdentity
  description: string
  abstractSources: AbstractSource[]
  defaultCadence: Cadence
  createAutomation: (provider: 'google' | 'microsoft' | null, overrides?: { cadence?: Cadence; description?: string }) => Automation
}

function resolveSource(
  abstractSource: AbstractSource,
  provider: 'google' | 'microsoft' | null,
): AutomationDataSources {
  const isMs = provider === 'microsoft'
  switch (abstractSource) {
    case 'email':
      return isMs ? AutomationDataSources.OUTLOOK : AutomationDataSources.GMAIL
    case 'calendar':
      return isMs
        ? AutomationDataSources.MICROSOFT_CALENDAR
        : AutomationDataSources.GOOGLE_CALENDAR
    case 'drive':
      return isMs ? AutomationDataSources.ONEDRIVE : AutomationDataSources.DRIVE
    case 'web':
      return AutomationDataSources.WEB
    case 'local':
      return AutomationDataSources.LOCAL_FILES
  }
}

function resolveSources(
  abstractSources: AbstractSource[],
  provider: 'google' | 'microsoft' | null,
): AutomationDataSources[] {
  return abstractSources.map(s => resolveSource(s, provider))
}

// ── Polly — Inbox & Social Media Monitor ────────────────────

const POLLY_SEARCH_PROMPT =
  'Find all social media notification emails, newsletters, and important messages from today. Also search for my social media profiles and recent activity.'

const POLLY_PROMPT = `You are Polly, the user's inbox and social media monitor. You have a warm, concise personality.

Analyze today's emails and web results to produce:

# 📬 Daily Inbox & Social Briefing

## Priority Messages
- Important emails requiring response (from contacts, clients, colleagues)
- Suggested quick responses for each

## Social Media Radar
- Which social platforms sent notifications today (LinkedIn, Twitter/X, Instagram, Facebook, etc.)
- Summary of social activity: new connections, mentions, engagement on posts
- Which platforms appear most active based on email notification frequency
- Notable social interactions worth responding to

## Newsletters & Updates
- Key takeaways from newsletters received today

## Recommended Actions
- Top 3 things to respond to first`

// ── Scout — Executive Assistant ─────────────────────────────

const SCOUT_SEARCH_PROMPT =
  "Find today's upcoming meetings, recent meeting notes, action items, and email threads with meeting participants. Also find any tasks or commitments I've made in recent emails."

const SCOUT_PROMPT = `You are Scout, the user's executive assistant. You are organized, proactive, and detail-oriented.

Produce a daily executive briefing:

# 📋 Executive Assistant Briefing

## Today's Meetings
For each upcoming meeting today:
- **Meeting name** — time, duration, location/link
- **Participants** and your relationship context (from email history)
- **Prep notes**: relevant recent emails, shared documents, last interaction
- **Suggested talking points** and questions to ask
- **Icebreaker** for external participants

## Follow-Up from Recent Meetings
For meetings in the past 24-48 hours:
- Action items you committed to — status check
- Action items others committed to — follow-up needed?
- Key decisions that need documentation or communication

## Task Tracker
- Open commitments from emails (things you said you'd do)
- Deadlines approaching this week
- Items that appear stalled or overdue

## Priorities for Today
- Top 3 things to focus on, ranked by urgency and importance`

// ── Atlas — Relationship Optimizer ──────────────────────────

const ATLAS_SEARCH_PROMPT =
  "Find all business contacts, client interactions, partnership discussions, introductions, and networking opportunities from recent emails and calendar. Search the web for companies and people I've been in contact with."

const ATLAS_PROMPT = `You are Atlas, the user's relationship optimizer. You are strategic, insightful, and opportunity-driven.

Produce a weekly relationship intelligence report:

# 🤝 Relationship Intelligence Report

## Hot Opportunities
- Business opportunities surfaced from recent email conversations
- Introductions that were offered but not yet acted on
- Deals or partnerships in progress — next steps needed

## Key Relationships to Nurture
- Contacts you haven't reached out to recently but should (based on interaction history)
- People who've reached out that you haven't responded to
- Relationships that appear to be cooling off

## Network Growth
- New contacts added this week (from email/calendar)
- Who introduced you to whom — your network map is expanding where?
- Industry events or meetings that could expand your network

## Strategic Recommendations
- Top 3 people to schedule meetings with this week, and why
- Potential collaborations or partnerships to explore
- Follow-ups that could unlock value`

// ── Coach — Daily Work Coach ────────────────────────────────

const COACH_SEARCH_PROMPT =
  'Analyze my email sending patterns, calendar density, meeting frequency, response times, and work habits from recent activity.'

const COACH_PROMPT = `You are Coach, the user's daily work coach. You are direct, analytical, and encouraging.

Analyze my work patterns and produce a daily coaching report:

# 🎯 Daily Work Coach

## Work Pattern Analysis
- How many emails sent/received yesterday
- Meeting load: hours in meetings vs. focus time
- Response time patterns: are you keeping up or falling behind?
- Late-night or weekend work detected? Flag burnout risk

## Productivity Insights
- What consumed most of your time yesterday?
- Were your meetings productive (had agendas, action items)?
- Ratio of reactive work (responding) vs. proactive work (creating)

## Today's Game Plan
- Based on your calendar, here's your focus vs. meeting balance today
- Suggested time blocks for deep work
- Meetings that could potentially be emails

## Coach's Corner
- One specific, actionable habit to improve this week
- Celebrate one thing you did well recently
- Challenge for today`

// ── Agentmaker Prompt ───────────────────────────────────────

export const AGENTMAKER_PROMPT = `Look at my email, calendar, and connected files. Analyze my workflow, identify operational bottlenecks, and suggest up to 3 additional specialized agents that would make me significantly more productive.

For each agent, output JSON:
[{ "name": "...", "emoji": "...", "description": "...", "sources": ["email", "calendar", "drive", "web"], "cadence": "daily|weekly|hourly", "prompt": "..." }]

Only output the JSON array, nothing else.`

// ── Template Definitions ────────────────────────────────────

function createSemanticSearchPromptAutomation(opts: {
  name: string
  description: string
  identity: AgentIdentity
  abstractSources: AbstractSource[]
  cadence: Cadence
  searchPrompt: string
  agentPrompt: string
  provider: 'google' | 'microsoft' | null
}): Automation {
  const sources = resolveSources(opts.abstractSources, opts.provider)
  return new Automation({
    name: opts.name,
    description: opts.description,
    runs: [],
    cadences: [opts.cadence],
    steps: [
      new SemanticSearch({ sources, userPrompt: opts.searchPrompt }),
      new Prompt({ userPrompt: opts.agentPrompt }),
    ],
    isActive: true,
    showLibrary: true,
    icon: opts.identity.emoji,
    identity: opts.identity,
  })
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'polly',
    defaultIdentity: {
      displayName: 'Polly',
      emoji: '📬',
      personality: 'Your inbox & social media radar',
      soul: 'You are warm, concise, and observant. You notice patterns in communication and surface what matters most.',
    },
    description: 'Summarizes your daily email and monitors social media activity based on notifications and web presence.',
    abstractSources: ['email', 'web'],
    defaultCadence: { type: CadenceType.DAILY, time: '08:00' },
    createAutomation(provider, overrides) {
      return createSemanticSearchPromptAutomation({
        name: this.defaultIdentity.displayName,
        description: overrides?.description ?? this.description,
        identity: this.defaultIdentity,
        abstractSources: this.abstractSources,
        cadence: overrides?.cadence ?? this.defaultCadence,
        searchPrompt: POLLY_SEARCH_PROMPT,
        agentPrompt: POLLY_PROMPT,
        provider,
      })
    },
  },
  {
    id: 'scout',
    defaultIdentity: {
      displayName: 'Scout',
      emoji: '📋',
      personality: 'Your executive assistant',
      soul: 'You are organized, proactive, and detail-oriented. Nothing falls through the cracks on your watch.',
    },
    description:
      'Prepares you for meetings, follows up on action items, and tracks all your commitments like an executive assistant.',
    abstractSources: ['calendar', 'email', 'drive'],
    defaultCadence: { type: CadenceType.DAILY, time: '07:30' },
    createAutomation(provider, overrides) {
      return createSemanticSearchPromptAutomation({
        name: this.defaultIdentity.displayName,
        description: overrides?.description ?? this.description,
        identity: this.defaultIdentity,
        abstractSources: this.abstractSources,
        cadence: overrides?.cadence ?? this.defaultCadence,
        searchPrompt: SCOUT_SEARCH_PROMPT,
        agentPrompt: SCOUT_PROMPT,
        provider,
      })
    },
  },
  {
    id: 'atlas',
    defaultIdentity: {
      displayName: 'Atlas',
      emoji: '🤝',
      personality: 'Your relationship optimizer',
      soul: 'You are strategic, insightful, and opportunity-driven. You see connections and possibilities others miss.',
    },
    description:
      'Actively seeks business opportunities, identifies high-value contacts, and recommends who to meet with.',
    abstractSources: ['email', 'calendar', 'drive', 'web'],
    defaultCadence: { type: CadenceType.WEEKLY, dayOfWeek: DaysOfWeek.MONDAY, time: '08:00' },
    createAutomation(provider, overrides) {
      return createSemanticSearchPromptAutomation({
        name: this.defaultIdentity.displayName,
        description: overrides?.description ?? this.description,
        identity: this.defaultIdentity,
        abstractSources: this.abstractSources,
        cadence: overrides?.cadence ?? this.defaultCadence,
        searchPrompt: ATLAS_SEARCH_PROMPT,
        agentPrompt: ATLAS_PROMPT,
        provider,
      })
    },
  },
  {
    id: 'coach',
    defaultIdentity: {
      displayName: 'Coach',
      emoji: '🎯',
      personality: 'Your daily work coach',
      soul: 'You are direct, analytical, and encouraging. You help people see their patterns and grow.',
    },
    description:
      'Monitors how you work — patterns, productivity, habits — and gives actionable daily coaching.',
    abstractSources: ['email', 'calendar', 'drive', 'web'],
    defaultCadence: { type: CadenceType.DAILY, time: '07:00' },
    createAutomation(provider, overrides) {
      return createSemanticSearchPromptAutomation({
        name: this.defaultIdentity.displayName,
        description: overrides?.description ?? this.description,
        identity: this.defaultIdentity,
        abstractSources: this.abstractSources,
        cadence: overrides?.cadence ?? this.defaultCadence,
        searchPrompt: COACH_SEARCH_PROMPT,
        agentPrompt: COACH_PROMPT,
        provider,
      })
    },
  },
]
