/** Developer-mode agent role definitions for the Agent Team feature. */

import { RoleType, TeamRole } from '../api/agent_team'

export interface RoleDefinition {
  role_type: RoleType
  label: string
  emoji: string
  description: string
  defaultEnabled: boolean
}

export const DEVELOPER_ROLES: RoleDefinition[] = [
  {
    role_type: 'PM',
    label: 'PM Agent',
    emoji: '\uD83D\uDCCB',
    description:
      'Reads business context and writes a detailed technical spec with acceptance criteria, component breakdown, and API contracts.',
    defaultEnabled: true,
  },
  {
    role_type: 'FrontendDev',
    label: 'Frontend Dev',
    emoji: '\uD83C\uDFA8',
    description:
      'Implements UI components, pages, and frontend logic from the spec. Runs inside a feedback loop that captures console errors and screenshots.',
    defaultEnabled: true,
  },
  {
    role_type: 'BackendDev',
    label: 'Backend Dev',
    emoji: '\u2699\uFE0F',
    description:
      'Implements API endpoints, database models, and business logic from the spec. Runs inside a feedback loop that captures terminal errors.',
    defaultEnabled: true,
  },
  {
    role_type: 'QA',
    label: 'QA Engineer',
    emoji: '\uD83E\uDDEA',
    description:
      'Reviews all work, opens the dev server, tests user flows, checks accessibility, and reports bugs with reproduction steps.',
    defaultEnabled: true,
  },
]

export function createDefaultTeamRoles(): TeamRole[] {
  return DEVELOPER_ROLES.filter(r => r.defaultEnabled).map(r => ({
    role_type: r.role_type,
  }))
}
