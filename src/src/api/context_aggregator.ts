/** API helpers for Business Context Aggregation endpoints. */

const API_BASE = 'http://127.0.0.1:8897'

// ── Types ────────────────────────────────────────────────────

export interface ContextSources {
  meetings: boolean
  emails: boolean
  workspace_docs: boolean
  browser_urls: string[]
}

export interface AggregateRequest {
  project_description: string
  sources?: ContextSources
  time_range_hours?: number
  keywords?: string[]
}

export interface MeetingContext {
  title: string
  date: string
  participants: string[]
  summary: string
}

export interface EmailContext {
  subject: string
  from: string
  date: string
  snippet: string
}

export interface WorkspaceDocContext {
  title: string
  source: string
  snippet: string
  relevance_score: number
}

export interface BrowserPageContext {
  url: string
  title: string
  content_snippet: string
}

export interface AggregatedContext {
  project_description: string
  meetings: MeetingContext[]
  emails: EmailContext[]
  workspace_documents: WorkspaceDocContext[]
  browser_pages: BrowserPageContext[]
  combined_prompt: string
}

// ── API Calls ────────────────────────────────────────────────

export async function aggregateContext(
  request: AggregateRequest,
): Promise<{ ok: boolean; context?: AggregatedContext; message?: string }> {
  const resp = await fetch(`${API_BASE}/api/knapsack/context/aggregate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return resp.json()
}
