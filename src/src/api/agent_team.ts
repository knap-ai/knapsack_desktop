/** API helpers for Agent Team orchestration endpoints. */

const API_BASE = 'http://127.0.0.1:8897'

// ── Types ────────────────────────────────────────────────────

export type RoleType = 'PM' | 'FrontendDev' | 'BackendDev' | 'QA'

export interface TeamRole {
  role_type: RoleType
  display_name?: string
  custom_prompt?: string
}

export interface TeamConfig {
  project_description: string
  dev_url?: string
  repo?: string
  max_iterations?: number
  roles?: TeamRole[]
  business_context?: string
}

export type AgentRunStatus = 'Pending' | 'Running' | 'Success' | 'Failed' | 'Skipped'
export type TeamStatus = 'Planning' | 'Building' | 'Testing' | 'Complete' | 'Failed' | 'Cancelled'

export interface AgentStatus {
  role: RoleType
  display_name: string
  status: AgentRunStatus
  iteration: number
  max_iterations: number
  last_feedback: string | null
  output_summary: string | null
  error: string | null
}

export interface TeamRunState {
  run_id: string
  status: TeamStatus
  agents: AgentStatus[]
  started_at: number
  completed_at: number | null
  spec: string | null
  final_report: string | null
}

// ── API Calls ────────────────────────────────────────────────

export async function launchTeam(
  config: TeamConfig,
): Promise<{ ok: boolean; run_id?: string; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/team/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  return resp.json()
}

export async function getTeamStatus(
  runId: string,
): Promise<{ ok: boolean; state?: TeamRunState; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/team/status/${runId}`)
  return resp.json()
}

export async function cancelTeamRun(
  runId: string,
): Promise<{ ok: boolean; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/team/cancel/${runId}`, {
    method: 'POST',
  })
  return resp.json()
}

export async function getAgentOutput(
  runId: string,
  agentId: string,
): Promise<{ ok: boolean; agent?: AgentStatus; spec?: string; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/team/output/${runId}/${agentId}`)
  return resp.json()
}
