// Serve-only sidebar fixture boundary; no production build imports this module.
import type { TeamAgent, TeamGroup } from 'src/agents/teamRoster'

export type { TeamAgent, TeamGroup }
export function getPrimaryScout(agents: TeamAgent[]) {
  const agent = agents.find(value => value.id === 'scout') || agents[0]
  if (!agent) throw new Error('qa_search_missing_synthetic_agent')
  return agent
}
const blocked = (): never => {
  throw new Error('qa_search_team_action_blocked')
}
export const createTeamAgent = blocked
export const createTeamGroup = blocked
export const saveTeamGroups = blocked
export const saveTeamRoster = blocked
export const nextCustomAgentBrowserProfile = blocked
