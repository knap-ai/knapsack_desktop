/** API helpers for messaging channel endpoints (WhatsApp, iMessage). */

const API_BASE = 'http://localhost:8897'

export interface ChannelStatus {
  success: boolean
  enabled: boolean
  configured: boolean
  linked?: boolean
  provider?: string
  message?: string
}

interface GenericResponse {
  success: boolean
  message?: string
  configured?: boolean
  linked?: boolean
}

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

// ── WhatsApp ─────────────────────────────────────────────────

export const getWhatsAppStatus = () =>
  get<ChannelStatus>('/api/clawd/channels/whatsapp/status')

export const enableWhatsApp = (enabled: boolean) =>
  post<GenericResponse>('/api/clawd/channels/whatsapp/enable', { enabled })

export const startWhatsAppLogin = () =>
  post<GenericResponse>('/api/clawd/channels/whatsapp/login')

// ── iMessage ─────────────────────────────────────────────────

export const getIMessageStatus = () =>
  get<ChannelStatus>('/api/clawd/channels/imessage/status')

export const enableIMessage = (enabled: boolean) =>
  post<GenericResponse>('/api/clawd/channels/imessage/enable', { enabled })

export const setupIMessage = () =>
  post<GenericResponse>('/api/clawd/channels/imessage/setup')

export const openFullDiskAccess = () =>
  post<GenericResponse>('/api/clawd/channels/open-full-disk-access')
