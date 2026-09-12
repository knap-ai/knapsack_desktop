import { invoke } from '@tauri-apps/api/tauri'

export type LoopMaturity = 'observe' | 'shadow' | 'prepare' | 'supervised' | 'exception_only'
export type LoopDefinitionStatus = 'draft' | 'active' | 'paused' | 'deleted'
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
  | 'expired'
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

export interface PreparedArtifact {
  title: string
  body: string
  format: 'markdown' | 'slack_mrkdwn' | 'email_html' | string
  createdAt: number
}

export type LoopCandidateStatus = 'proposed' | 'accepted' | 'dismissed'

export interface LoopCandidate {
  id: string
  loopId: string
  signalId: string
  signalType: string
  title: string
  reason: string
  confidence: number
  context?: string
  accountIdentity?: string
  targetIdentity?: string
  status: LoopCandidateStatus
  observedAt: number
  updatedAt: number
}

export interface LoopRun {
  id: string
  loopId: string
  status: LoopRunStatus
  approval?: 'pending' | 'approved' | 'rejected'
  candidateId?: string
  subject?: string
  context?: string
  accountIdentity?: string
  targetIdentity?: string
  preparedArtifact?: PreparedArtifact
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

export const deleteLoopDefinition = (loopId: string, brainRoot = '') =>
  invoke<LoopDefinition>('kn_loop_delete_definition', { brainRoot, loopId })

export const listLoopRuns = (loopId?: string, brainRoot = '') =>
  invoke<LoopRun[]>('kn_loop_list_runs', { brainRoot, loopId })

export const listLoopCandidates = (brainRoot = '') =>
  invoke<LoopCandidate[]>('kn_loop_list_candidates', { brainRoot })

export const observeLoopCandidate = (candidate: LoopCandidate, brainRoot = '') =>
  invoke<LoopCandidate>('kn_loop_observe_candidate', { brainRoot, candidate })

export const discoverEmailLoopCandidates = (limit = 50, brainRoot = '') =>
  invoke<LoopCandidate[]>('kn_loop_discover_email_candidates', { brainRoot, limit })

export const decideLoopCandidate = (
  candidateId: string,
  decision: Exclude<LoopCandidateStatus, 'proposed'>,
  brainRoot = '',
) => invoke<LoopCandidate>('kn_loop_decide_candidate', { brainRoot, candidateId, decision })

export const startLoopRun = (
  loopId: string,
  runId: string,
  details: {
    candidateId?: string
    subject?: string
    context?: string
    accountIdentity?: string
    targetIdentity?: string
  } = {},
  brainRoot = '',
) => invoke<LoopRun>('kn_loop_start_run', { brainRoot, loopId, runId, ...details })

export const setLoopApproval = (
  runId: string,
  decision: 'pending' | 'approved' | 'rejected',
  brainRoot = '',
) => invoke<LoopRun>('kn_loop_set_approval', { brainRoot, runId, decision })

export const setPreparedArtifact = (runId: string, artifact: PreparedArtifact, brainRoot = '') =>
  invoke<LoopRun>('kn_loop_set_prepared_artifact', { brainRoot, runId, artifact })

export const transitionLoopRun = (
  runId: string,
  nextStatus: LoopRunStatus,
  evidence: LoopEvidence[] = [],
  note?: string,
  brainRoot = '',
) =>
  invoke<LoopRun>('kn_loop_transition_run', {
    brainRoot,
    runId,
    nextStatus,
    evidence,
    note,
  })

export const exportLoops = (brainRoot = '') => invoke<string>('kn_loop_export', { brainRoot })

export const importLoops = (payload: string, brainRoot = '') =>
  invoke<void>('kn_loop_import', { brainRoot, payload })
