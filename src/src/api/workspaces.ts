/** API helpers for Workspace / Knowledge Base endpoints. */

const API_BASE = 'http://127.0.0.1:8897'

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
  tags: string | null
  autoTags: string | null
  summary: string | null
  /** 'email' | 'calendar' | 'meeting' | 'drive' | 'local_file' | 'chat_output' | 'manual' | null */
  sourceType: string | null
  /** Stable id from the originating row used for dedupe. */
  sourceId: string | null
}

/** Parse a JSON-encoded tags string into an array. */
export function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return []
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
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
  /** 0/1 — true when this workspace was created by the library curator. */
  autoCurated: number | null
  /** 'person' | 'project' | null (null == manual collection). */
  entityType: string | null
  /** Canonical id — email address for people, slug for projects. */
  entityKey: string | null
  /** Last time the curator successfully ran for this collection. */
  lastCuratedAt: number | null
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

// ── Tag management ──────────────────────────────────────────

export const updateDocumentTags = (
  workspaceUuid: string,
  docId: number,
  tags: string[],
) =>
  put<GenericResponse>(
    `/api/knapsack/workspaces/${workspaceUuid}/documents/${docId}/tags`,
    { tags },
  )

// ── Save chat output to workspace ───────────────────────────

export const saveChatToWorkspace = (
  workspaceUuid: string,
  text: string,
  title: string,
  sourceThreadId?: number,
) =>
  post<DocumentResponse>(
    `/api/knapsack/workspaces/${workspaceUuid}/documents/from-chat`,
    {
      text,
      title,
      source_thread_id: sourceThreadId ?? null,
    },
  )

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

// ── Library curator ──────────────────────────────────────────

export interface CurationStatus {
  success: boolean
  enabled: boolean
  sourcesEmail: boolean
  sourcesCalendar: boolean
  sourcesDrive: boolean
  sourcesLocalFiles: boolean
  lastRunAt: number | null
}

interface RawCurationStatus {
  success: boolean
  enabled: boolean
  sources_email: boolean
  sources_calendar: boolean
  sources_drive: boolean
  sources_local_files: boolean
  last_run_at: number | null
}

const normalizeCurationStatus = (raw: RawCurationStatus): CurationStatus => ({
  success: raw.success,
  enabled: raw.enabled,
  sourcesEmail: raw.sources_email,
  sourcesCalendar: raw.sources_calendar,
  sourcesDrive: raw.sources_drive,
  sourcesLocalFiles: raw.sources_local_files,
  lastRunAt: raw.last_run_at,
})

export const getCurationStatus = async (): Promise<CurationStatus> => {
  const raw = await get<RawCurationStatus>('/api/knapsack/library/curation-status')
  return normalizeCurationStatus(raw)
}

export const updateCurationSettings = async (settings: {
  enabled?: boolean
  sourcesEmail?: boolean
  sourcesCalendar?: boolean
  sourcesDrive?: boolean
  sourcesLocalFiles?: boolean
}): Promise<CurationStatus> => {
  const raw = await put<RawCurationStatus>('/api/knapsack/library/settings', {
    enabled: settings.enabled,
    sources_email: settings.sourcesEmail,
    sources_calendar: settings.sourcesCalendar,
    sources_drive: settings.sourcesDrive,
    sources_local_files: settings.sourcesLocalFiles,
  })
  return normalizeCurationStatus(raw)
}

export const curateLibraryNow = () =>
  post<GenericResponse>('/api/knapsack/library/curate-now')

export const promoteWorkspace = (uuid: string) =>
  post<GenericResponse>(`/api/knapsack/workspaces/${uuid}/promote`)

export const wipeLibrary = (includeManual = false) =>
  fetch(`${API_BASE}/api/knapsack/library/wipe`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ include_manual: includeManual }),
  }).then(r => r.json() as Promise<{ success: boolean; deleted_auto: number; deleted_manual: number; error?: string }>)
