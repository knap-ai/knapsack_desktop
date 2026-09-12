import { invoke } from '@tauri-apps/api/tauri'

export type LoopMaturity = 'observe' | 'shadow' | 'prepare' | 'supervised' | 'exception_only'
export type LoopDefinitionStatus = 'draft' | 'active' | 'paused'
export type LoopRunStatus =
  | 'queued'
  | 'gathering_context'
  | 'preparing'
  | 'waiting_for_approval'
  | 'executing'
  | 'verifying'
  | 'completed'
  | 'blocked'
  | 'failed'
  | 'cancelled'
export type VerificationMethod =
  | 'system_record'
  | 'deterministic_check'
  | 'human_approval'
  | 'deferred_outcome'

export interface LoopTrigger {
  kind: 'event' | 'schedule' | 'manual' | string
  source?: string
  description: string
}

export interface VerificationRule {
  id: string
  label: string
  method: VerificationMethod
  source?: string
  required: boolean
}

export interface ApprovalPolicy {
  requiredBeforeExecution: boolean
  description?: string
}

export interface LoopDefinition {
  schemaVersion: number
  id: string
  name: string
  description: string
  category: string
  maturity: LoopMaturity
  status: LoopDefinitionStatus
  trigger: LoopTrigger
  desiredOutcome: string
  approvalPolicy: ApprovalPolicy
  verificationRules: VerificationRule[]
  createdAt: number
  updatedAt: number
}

export interface LoopEvidence {
  id: string
  verificationId: string
  label: string
  source: string
  details?: string
  verified: boolean
  observedAt: number
}

export interface LoopRun {
  id: string
  loopId: string
  status: LoopRunStatus
  approval?: 'pending' | 'approved' | 'rejected'
  evidence: LoopEvidence[]
  events: Array<{
    from?: LoopRunStatus
    to: LoopRunStatus
    at: number
    note?: string
  }>
  startedAt: number
  updatedAt: number
}

export const listLoopDefinitions = (brainRoot = '') =>
  invoke<LoopDefinition[]>('kn_loop_list_definitions', { brainRoot })

export const saveLoopDefinition = (definition: LoopDefinition, brainRoot = '') =>
  invoke<LoopDefinition>('kn_loop_upsert_definition', { brainRoot, definition })

export const listLoopRuns = (loopId?: string, brainRoot = '') =>
  invoke<LoopRun[]>('kn_loop_list_runs', { brainRoot, loopId })
