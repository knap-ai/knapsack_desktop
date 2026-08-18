import { AGENT_TEMPLATES } from 'src/automations/agentTemplates'

export type TeamAgent = {
  id: string
  name: string
  emoji: string
  personality: string
  soul: string
  browserProfile: string
}

const TEAM_ROSTER_STORAGE = 'knapsack.team.roster.v1'
const ONBOARDING_AGENTS_STORAGE = 'kn_onboarding_agents'

function slugifyAgentId(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'teammate'
}

function toTeamAgent(agent: {
  id?: string
  name: string
  emoji: string
  personality: string
  soul?: string
}): TeamAgent {
  const id = slugifyAgentId(agent.id || agent.name)
  return {
    id,
    name: agent.name.trim() || 'Teammate',
    emoji: agent.emoji || '🤖',
    personality: agent.personality.trim() || 'Your AI teammate',
    soul: agent.soul?.trim() || `You are ${agent.name}, a focused and helpful AI teammate.`,
    browserProfile: `agent-${id}`,
  }
}

export function defaultTeamRoster(): TeamAgent[] {
  return AGENT_TEMPLATES.map(template =>
    toTeamAgent({
      id: template.id,
      name: template.defaultIdentity.displayName,
      emoji: template.defaultIdentity.emoji,
      personality: template.defaultIdentity.personality,
      soul: template.defaultIdentity.soul,
    }),
  )
}

export function getPrimaryScout(agents: TeamAgent[]): TeamAgent {
  const scout = agents.find(agent => agent.id === 'scout')
    ?? defaultTeamRoster().find(agent => agent.id === 'scout')

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
        return parsed.map(agent => toTeamAgent(agent))
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
        const migrated = parsed.map(toTeamAgent)
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
  for (const agent of agents.map(toTeamAgent)) byId.set(agent.id, agent)
  saveTeamRoster(Array.from(byId.values()))
}
