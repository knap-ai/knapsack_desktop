/** API helpers for Automated QA Suite endpoints. */

const API_BASE = 'http://127.0.0.1:8897'

// ── Types ────────────────────────────────────────────────────

export type QATestType = 'smoke' | 'visual_regression' | 'accessibility' | 'console_errors'

export interface QARunConfig {
  dev_url: string
  test_types?: QATestType[]
  scenario_ids?: string[]
}

export type QARunStatus = 'running' | 'complete' | 'failed'

export interface QATestResult {
  test_type: QATestType
  name: string
  passed: boolean
  message: string
  screenshot_base64?: string
  details?: string
}

export interface QARunResult {
  run_id: string
  status: QARunStatus
  dev_url: string
  started_at: number
  completed_at?: number
  results: QATestResult[]
  summary: string
  total_passed: number
  total_failed: number
}

export interface QAScenario {
  id: string
  name: string
  url: string
  steps: string
  test_type: QATestType
  created_at: number
}

// ── API Calls ────────────────────────────────────────────────

export async function runQASuite(
  config: QARunConfig,
): Promise<{ ok: boolean; run_id?: string; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  return resp.json()
}

export async function getQAStatus(
  runId: string,
): Promise<{ ok: boolean; result?: QARunResult; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/status/${runId}`)
  return resp.json()
}

export async function getQAResults(
  runId: string,
): Promise<{ ok: boolean; result?: QARunResult; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/results/${runId}`)
  return resp.json()
}

export async function getTestScenarios(): Promise<{
  ok: boolean
  scenarios?: QAScenario[]
}> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/scenarios`)
  return resp.json()
}

export async function saveTestScenario(
  scenario: Omit<QAScenario, 'id' | 'created_at'>,
): Promise<{ ok: boolean; id?: string; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  })
  return resp.json()
}

export async function deleteTestScenario(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/dev/qa/scenarios/${id}`, {
    method: 'DELETE',
  })
  return resp.json()
}
