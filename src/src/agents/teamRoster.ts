import { AGENT_TEMPLATES } from 'src/automations/agentTemplates'

export type TeamAgent = {
  id: string
  name: string
  emoji: string
  personality: string
  soul: string
  browserProfile: string
  suggestedPrompts: string[]
}

export type TeamGroup = {
  id: string
  name: string
  emoji: string
  agentIds: string[]
}

const TEAM_ROSTER_STORAGE = 'knapsack.team.roster.v1'
const TEAM_GROUPS_STORAGE = 'knapsack.team.groups.v1'
const ONBOARDING_AGENTS_STORAGE = 'kn_onboarding_agents'
export const CUSTOM_AGENT_BROWSER_PROFILES = Array.from(
  { length: 64 },
  (_, index) => `agent-custom-${String(index + 1).padStart(2, '0')}`,
)
const BUILT_IN_BROWSER_PROFILES = new Set([
  'agent-polly',
  'agent-scout',
  'agent-atlas',
  'agent-coach',
])

const BUILT_IN_SUGGESTED_PROMPTS: Record<string, string[]> = {
  scout: [
    "Brief me on today's meetings, commitments, and top priorities.",
    'Find the follow-ups that are most at risk of falling through the cracks.',
  ],
  polly: [
    'Triage my inbox and show me the messages that deserve a response first.',
    "Summarize today's newsletters and social notifications without the noise.",
  ],
  atlas: [
    'Show me the relationships and opportunities I should act on this week.',
    'Who should I follow up with now, and what should I say?',
  ],
  coach: [
    'Analyze my recent work patterns and give me a realistic plan for today.',
    'Where am I being too reactive, and what should I change this week?',
  ],
}

function slugifyAgentId(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'teammate'
}

export function createTeamAgent(agent: {
  id?: string
  name: string
  emoji: string
  personality: string
  soul?: string
  suggestedPrompts?: string[]
  browserProfile?: string
}): TeamAgent {
  const id = slugifyAgentId(agent.id || agent.name)
  const customSuggestedPrompts = agent.suggestedPrompts?.filter(Boolean).slice(0, 3)
  return {
    id,
    name: agent.name.trim() || 'Teammate',
    emoji: agent.emoji || '🤖',
    personality: agent.personality.trim() || 'Your AI teammate',
    soul: agent.soul?.trim() || `You are ${agent.name}, a focused and helpful AI teammate.`,
    browserProfile: agent.browserProfile || `agent-${id}`,
    suggestedPrompts: customSuggestedPrompts?.length
      ? customSuggestedPrompts
      : BUILT_IN_SUGGESTED_PROMPTS[id] || [
        `Review my connected information as ${agent.name}, ${agent.personality}, and tell me what matters most.`,
        `What is the highest-value action you can take for me today as ${agent.name}?`,
      ],
  }
}

function normalizeTeamBrowserProfiles(agents: TeamAgent[]): TeamAgent[] {
  const used = new Set<string>()
  return agents.map(agent => {
    if (BUILT_IN_BROWSER_PROFILES.has(agent.browserProfile)) {
      used.add(agent.browserProfile)
      return agent
    }
    const preserved = CUSTOM_AGENT_BROWSER_PROFILES.includes(agent.browserProfile)
      && !used.has(agent.browserProfile)
      ? agent.browserProfile
      : CUSTOM_AGENT_BROWSER_PROFILES.find(profile => !used.has(profile))
    const browserProfile = preserved || 'openclaw'
    used.add(browserProfile)
    return { ...agent, browserProfile }
  })
}

export function nextCustomAgentBrowserProfile(agents: TeamAgent[]): string {
  const used = new Set(agents.map(agent => agent.browserProfile))
  return CUSTOM_AGENT_BROWSER_PROFILES.find(profile => !used.has(profile)) || 'openclaw'
}

function normalizeTeamGroup(group: TeamGroup): TeamGroup {
  const id = slugifyAgentId(group.id || group.name)
  return {
    id,
    name: group.name.trim() || 'Team chat',
    emoji: group.emoji || '👥',
    agentIds: Array.from(new Set(group.agentIds.filter(Boolean))),
  }
}

export function defaultTeamRoster(): TeamAgent[] {
  return AGENT_TEMPLATES.map(template =>
    createTeamAgent({
      id: template.id,
      name: template.defaultIdentity.displayName,
      emoji: template.defaultIdentity.emoji,
      personality: template.defaultIdentity.personality,
      soul: template.defaultIdentity.soul,
      suggestedPrompts: BUILT_IN_SUGGESTED_PROMPTS[template.id],
    }),
  )
}

export function getPrimaryScout(agents: TeamAgent[]): TeamAgent {
  const scout =
    agents.find(agent => agent.id === 'scout') ??
    agents[0]

  if (!scout) throw new Error('A Knapsack team must contain at least one agent')
  return scout
}

export function saveTeamRoster(agents: TeamAgent[]) {
  if (agents.length === 0) {
    throw new Error('Create another agent before removing your last teammate.')
  }
  localStorage.setItem(TEAM_ROSTER_STORAGE, JSON.stringify(normalizeTeamBrowserProfiles(agents)))
  window.dispatchEvent(new CustomEvent('knapsack:team-roster-changed'))
}

export function loadTeamRoster(): TeamAgent[] {
  const stored = localStorage.getItem(TEAM_ROSTER_STORAGE)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as TeamAgent[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeTeamBrowserProfiles(parsed.map(agent => createTeamAgent(agent)))
      }
    } catch {
      // Fall through to onboarding migration/defaults.
    }
  }

  const onboarding = localStorage.getItem(ONBOARDING_AGENTS_STORAGE)
  if (onboarding) {
    try {
      const parsed = JSON.parse(onboarding) as Array<{
        name: string
        emoji: string
        personality: string
        soul?: string
      }>
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = normalizeTeamBrowserProfiles(parsed.map(createTeamAgent))
        localStorage.setItem(TEAM_ROSTER_STORAGE, JSON.stringify(migrated))
        return migrated
      }
    } catch {
      // Fall through to starter team.
    }
  }

  const defaults = defaultTeamRoster()
  localStorage.setItem(TEAM_ROSTER_STORAGE, JSON.stringify(defaults))
  return defaults
}

export function upsertTeamAgents(
  agents: Array<{ id?: string; name: string; emoji: string; personality: string; soul?: string }>,
) {
  const existing = loadTeamRoster()
  const byId = new Map(existing.map(agent => [agent.id, agent]))
  for (const agent of agents.map(createTeamAgent)) byId.set(agent.id, agent)
  saveTeamRoster(normalizeTeamBrowserProfiles(Array.from(byId.values())))
}

export function loadTeamGroups(): TeamGroup[] {
  const stored = localStorage.getItem(TEAM_GROUPS_STORAGE)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored) as TeamGroup[]
    return Array.isArray(parsed)
      ? parsed.map(normalizeTeamGroup).filter(group => group.agentIds.length >= 2)
      : []
  } catch {
    return []
  }
}

export function saveTeamGroups(groups: TeamGroup[]) {
  localStorage.setItem(TEAM_GROUPS_STORAGE, JSON.stringify(groups.map(normalizeTeamGroup)))
  window.dispatchEvent(new CustomEvent('knapsack:team-groups-changed'))
}

export function createTeamGroup(group: Omit<TeamGroup, 'id'> & { id?: string }): TeamGroup {
  return normalizeTeamGroup({ ...group, id: group.id || group.name })
}
