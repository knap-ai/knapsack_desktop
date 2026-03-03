/** API helpers for Workspace / Knowledge Base endpoints. */

const API_BASE = 'http://localhost:8897'

// ── Types ────────────────────────────────────────────────────

export interface WorkspaceDocument {
  id: number | null
  workspaceUuid: string
  documentName: string
  documentPath: string | null
  documentType: string | null
  contentHash: string | null
  embedded: number | null
  createdAt: number | null
}

export interface Workspace {
  id: number | null
  uuid: string
  name: string
  description: string | null
  icon: string | null
  createdAt: number | null
  updatedAt: number | null
  documents: WorkspaceDocument[] | null
}

interface WorkspaceResponse {
  success: boolean
  data: Workspace | null
  error?: string
}

interface WorkspacesListResponse {
  success: boolean
  data: Workspace[]
}

interface DocumentResponse {
  success: boolean
  data: WorkspaceDocument | null
  error?: string
}

interface GenericResponse {
  success: boolean
  error?: string
}

export interface SearchResultItem {
  id: string
  score: number
  payload: Record<string, unknown>
}

interface SearchResponse {
  success: boolean
  results: SearchResultItem[]
  error?: string
}

// ── Helpers ──────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

// ── Workspace CRUD ───────────────────────────────────────────

export const createWorkspace = (
  name: string,
  description?: string,
  icon?: string,
) =>
  post<WorkspaceResponse>('/api/knapsack/workspaces', {
    name,
    description: description ?? null,
    icon: icon ?? null,
  })

export const listWorkspaces = () =>
  get<WorkspacesListResponse>('/api/knapsack/workspaces')

export const getWorkspace = (uuid: string) =>
  get<WorkspaceResponse>(`/api/knapsack/workspaces/${uuid}`)

export const updateWorkspace = (
  uuid: string,
  name: string,
  description?: string,
  icon?: string,
) =>
  put<WorkspaceResponse>(`/api/knapsack/workspaces/${uuid}`, {
    name,
    description: description ?? null,
    icon: icon ?? null,
  })

export const deleteWorkspace = (uuid: string) =>
  del<GenericResponse>(`/api/knapsack/workspaces/${uuid}`)

// ── Document management ──────────────────────────────────────

export const addDocumentToWorkspace = (
  workspaceUuid: string,
  documentName: string,
  documentPath?: string,
  documentType?: string,
  contentHash?: string,
) =>
  post<DocumentResponse>(`/api/knapsack/workspaces/${workspaceUuid}/documents`, {
    document_name: documentName,
    document_path: documentPath ?? null,
    document_type: documentType ?? null,
    content_hash: contentHash ?? null,
  })

export const removeDocumentFromWorkspace = (
  workspaceUuid: string,
  docId: number,
) => del<GenericResponse>(`/api/knapsack/workspaces/${workspaceUuid}/documents/${docId}`)

// ── Scoped semantic search ───────────────────────────────────

export const searchWorkspace = (
  workspaceUuid: string,
  query: string,
  top?: number,
) =>
  post<SearchResponse>(`/api/knapsack/workspaces/${workspaceUuid}/search`, {
    query,
    top: top ?? 10,
  })
