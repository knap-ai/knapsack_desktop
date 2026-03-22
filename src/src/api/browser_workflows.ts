const BASE_URL = 'http://127.0.0.1:8897/api/knapsack/browser_workflows'

export type RecordedAction = {
  actionType: string
  url?: string | null
  value?: string | null
  timestampMs: number
  selector?: ElementSelector | null
}

export type ElementSelector = {
  tagName?: string | null
  id?: string | null
  className?: string | null
  textContent?: string | null
  ariaLabel?: string | null
  ariaRole?: string | null
  placeholder?: string | null
  name?: string | null
  cssSelector?: string | null
  xpath?: string | null
  outerHtmlPreview?: string | null
}

export type BrowserWorkflow = {
  id?: number
  uuid: string
  name: string
  description: string
  startUrl: string
  stepsJson: string
  browserProfile: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export type BrowserWorkflowRun = {
  id?: number
  workflowUuid: string
  automationRunId?: number | null
  status: string
  startedAt?: number | null
  completedAt?: number | null
  resultJson?: string | null
  errorMessage?: string | null
  screenshotPath?: string | null
}

export type WorkflowExecutionResult = {
  steps: Array<{
    stepIndex: number
    actionType: string
    status: string
    detail?: string | null
  }>
  total: number
  succeeded: number
  failed: number
}

export async function getWorkflows(): Promise<BrowserWorkflow[]> {
  const resp = await fetch(BASE_URL)
  return resp.json()
}

export async function getWorkflow(uuid: string): Promise<BrowserWorkflow> {
  const resp = await fetch(`${BASE_URL}/${uuid}`)
  return resp.json()
}

export async function createWorkflow(params: {
  name: string
  description?: string
  startUrl: string
  stepsJson: string
  browserProfile?: string
}): Promise<BrowserWorkflow> {
  const resp = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      start_url: params.startUrl,
      steps_json: params.stepsJson,
      browser_profile: params.browserProfile || 'openclaw',
    }),
  })
  return resp.json()
}

export async function updateWorkflow(
  uuid: string,
  params: {
    name?: string
    description?: string
    startUrl?: string
    stepsJson?: string
    browserProfile?: string
    isActive?: boolean
  }
): Promise<BrowserWorkflow> {
  const resp = await fetch(`${BASE_URL}/${uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: params.name,
      description: params.description,
      start_url: params.startUrl,
      steps_json: params.stepsJson,
      browser_profile: params.browserProfile,
      is_active: params.isActive,
    }),
  })
  return resp.json()
}

export async function deleteWorkflow(id: number): Promise<void> {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export async function executeWorkflow(
  uuid: string
): Promise<{ run: BrowserWorkflowRun; result: WorkflowExecutionResult }> {
  const resp = await fetch(`${BASE_URL}/${uuid}/execute`, { method: 'POST' })
  return resp.json()
}

export async function getWorkflowRuns(uuid: string): Promise<BrowserWorkflowRun[]> {
  const resp = await fetch(`${BASE_URL}/${uuid}/runs`)
  return resp.json()
}
