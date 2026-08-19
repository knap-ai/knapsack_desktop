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
}): TeamAgent {
  const id = slugifyAgentId(agent.id || agent.name)
  const customSuggestedPrompts = agent.suggestedPrompts?.filter(Boolean).slice(0, 3)
  return {
    id,
    name: agent.name.trim() || 'Teammate',
    emoji: agent.emoji || '🤖',
    personality: agent.personality.trim() || 'Your AI teammate',
    soul: agent.soul?.trim() || `You are ${agent.name}, a focused and helpful AI teammate.`,
    browserProfile: `agent-${id}`,
    suggestedPrompts: customSuggestedPrompts?.length
      ? customSuggestedPrompts
      : BUILT_IN_SUGGESTED_PROMPTS[id] || [
        `Review my connected information as ${agent.name}, ${agent.personality}, and tell me what matters most.`,
        `What is the highest-value action you can take for me today as ${agent.name}?`,
      ],
  }
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
    defaultTeamRoster().find(agent => agent.id === 'scout')

  if (!scout) throw new Error('Scout is missing from the default team roster')
  return scout
}

export function saveTeamRoster(agents: TeamAgent[]) {
  localStorage.setItem(TEAM_ROSTER_STORAGE, JSON.stringify(agents))
  window.dispatchEvent(new CustomEvent('knapsack:team-roster-changed'))
}

export function loadTeamRoster(): TeamAgent[] {
  const stored = localStorage.getItem(TEAM_ROSTER_STORAGE)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as TeamAgent[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(agent => createTeamAgent(agent))
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
        const migrated = parsed.map(createTeamAgent)
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
  agents: Array<{ name: string; emoji: string; personality: string; soul?: string }>,
) {
  const existing = loadTeamRoster()
  const byId = new Map(existing.map(agent => [agent.id, agent]))
  for (const agent of agents.map(createTeamAgent)) byId.set(agent.id, agent)
  saveTeamRoster(Array.from(byId.values()))
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
