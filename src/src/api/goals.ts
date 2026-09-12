import { invoke } from '@tauri-apps/api/tauri'

export type GoalStatus = 'draft' | 'active' | 'at_risk' | 'achieved' | 'paused' | 'deleted'
export type MetricDirection = 'increase' | 'decrease'

export interface GoalKeyResult {
  id: string
  title: string
  unit?: string
  baseline?: number
  target?: number
  deadline?: string
  authoritativeSource?: string
  direction: MetricDirection
}

export interface GoalLoopLink {
  loopId: string
  keyResultId: string
  driver: string
  expectedContribution: string
  leadingIndicator: boolean
  reviewCadence: string
  falsification: string
}

export interface GoalObservation {
  id: string
  goalId: string
  keyResultId: string
  value: number
  source: string
  sourceRecord: string
  observedAt: number
  verified: boolean
}

export interface GoalDefinition {
  schemaVersion: number
  id: string
  name: string
  objective: string
  owner?: string
  collaborators: string[]
  status: GoalStatus
  keyResults: GoalKeyResult[]
  loopLinks: GoalLoopLink[]
  constraints: string[]
  nonGoals: string[]
  createdAt: number
  updatedAt: number
}

export interface GoalAssessment {
  goal: GoalDefinition
  observations: GoalObservation[]
  missingFields: string[]
  uncoveredKeyResultIds: string[]
}

export interface GoalProposal {
  name?: string
  objective?: string
  owner?: string
  reason?: string
  keyResults?: Array<{
    title?: string
    unit?: string
    baseline?: number | null
    target?: number | null
    deadline?: string
    authoritativeSource?: string
    direction?: MetricDirection
  }>
}

export const parseGoalProposalResponse = (value: string): GoalProposal => {
  const match = value.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const parsed = JSON.parse((match?.[1] ?? value).trim()) as GoalProposal
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Goal proposal must be a JSON object.')
  }
  return parsed
}

export const listGoals = (brainRoot = '') => invoke<GoalAssessment[]>('kn_goal_list', { brainRoot })

export const saveGoal = (goal: GoalDefinition, brainRoot = '') =>
  invoke<GoalAssessment>('kn_goal_upsert', { brainRoot, goal })

export const addGoalObservation = (observation: GoalObservation, brainRoot = '') =>
  invoke<GoalAssessment>('kn_goal_add_observation', { brainRoot, observation })

export const deleteGoal = (goalId: string, brainRoot = '') =>
  invoke<GoalAssessment>('kn_goal_delete', { brainRoot, goalId })

export const latestVerifiedObservation = (assessment: GoalAssessment, keyResultId: string) =>
  assessment.observations
    .filter(row => row.keyResultId === keyResultId && row.verified)
    .sort((a, b) => b.observedAt - a.observedAt)[0]

export const keyResultProgress = (assessment: GoalAssessment, keyResult: GoalKeyResult) => {
  const current = latestVerifiedObservation(assessment, keyResult.id)?.value
  if (current === undefined || keyResult.baseline === undefined || keyResult.target === undefined)
    return undefined
  const span = keyResult.target - keyResult.baseline
  if (span === 0) return undefined
  return Math.max(0, Math.min(100, ((current - keyResult.baseline) / span) * 100))
}
