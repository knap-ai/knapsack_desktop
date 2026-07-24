const API_BASE = 'http://127.0.0.1:8897'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function post<T>(path: string, body?: unknown, timeoutMs = 30_000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || `HTTP ${res.status}`)
    }
    return (await res.json()) as T
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Request timed out — gateway may be down')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export type ManagedAgentExecutionMode =
  | 'cloud_primary'
  | 'cloud_primary_with_optional_desktop_extension'
  | 'desktop_primary_with_cloud_fallback'

export type ManagedAgentChannelKind = 'slack' | 'studio_chat' | 'desktop_chat'

export type ManagedAgentRouteTarget = 'cloud' | 'desktop' | 'hybrid_fallback' | 'blocked'
export type ManagedAgentRuntimeKind = 'cloud' | 'desktop'
export type ManagedAgentDesktopSessionRequirement = 'none' | 'preferred' | 'required'
export type ManagedAgentCapabilityKind =
  | 'browser_automation'
  | 'signed_in_browser_session'
  | 'computer_use'
  | 'local_files'
  | 'local_apps'
  | 'private_local_context'
  | 'cloud_chat'
  | 'shared_task_context'

export interface ManagedAgentMemoryLayers {
  template: string
  rolePack: string
  tenant: string
  instance: string
}

export interface ManagedAgentTemplate {
  templateId: string
  displayName: string
  description: string
  defaultPolicyPackId: string
  recommendedExecutionMode: ManagedAgentExecutionMode
  supportedChannels: ManagedAgentChannelKind[]
  reusableMemoryScope: string[]
}

export interface ManagedAgentPolicyPack {
  policyPackId: string
  description: string
  slackThreadOnly: boolean
  verboseReasoningEnabled: boolean
  guiKeystrokeSimulationEnabled: boolean
  requireDomVerification: boolean
  showModelFallbacks: boolean
  recurringTaskTruthfulnessRequired: boolean
}

export interface ManagedAgent {
  agentId: string
  displayName: string
  templateId: string
  tenantId: string
  policyPackId: string
  executionMode: ManagedAgentExecutionMode
  enabledChannels: ManagedAgentChannelKind[]
  memoryLayers: ManagedAgentMemoryLayers
}

export interface ManagedAgentsIndexResponse {
  success: boolean
  version: number
  templates: ManagedAgentTemplate[]
  policyPacks: ManagedAgentPolicyPack[]
  agents: ManagedAgent[]
}

export interface DesktopPresenceRecord {
  userId: string
  deviceId: string
  available: boolean
  desktopExtensionEnabled: boolean
  browserAutomation: boolean
  signedInBrowserSession: boolean
  computerUse: boolean
  localFiles: boolean
  localApps: boolean
  privateLocalContext: boolean
  lastHeartbeatAt: string
}

export interface SharedContextDescriptor {
  contextKey: string
  continuityMode: string
  memoryLayers: ManagedAgentMemoryLayers
  currentRuntime?: ManagedAgentRuntimeKind | null
  handoffSummary?: string | null
  sharedContextAvailable: boolean
}

export interface DesktopPresenceSummary {
  userId: string
  deviceId: string
  available: boolean
  desktopExtensionEnabled: boolean
  browserAutomation: boolean
  signedInBrowserSession: boolean
  computerUse: boolean
  localFiles: boolean
  localApps: boolean
  privateLocalContext: boolean
  lastHeartbeatAt: string
  stale: boolean
}

export interface ManagedAgentRoutePreviewResponse {
  success: boolean
  agentId: string
  routeTarget: ManagedAgentRouteTarget
  selectedRuntime?: ManagedAgentRuntimeKind | null
  fallbackRuntime?: ManagedAgentRuntimeKind | null
  reasons: string[]
  policyPackId: string
  sharedContext: SharedContextDescriptor
  matchedPresence?: DesktopPresenceSummary | null
}

export interface ManagedAgentRoutePreviewRequest {
  agentId: string
  userId: string
  channel: ManagedAgentChannelKind
  taskSummary: string
  contextKey?: string
  requiredCapabilities: ManagedAgentCapabilityKind[]
  desktopSessionRequirement: ManagedAgentDesktopSessionRequirement
}

export const getManagedAgentsIndex = () =>
  get<ManagedAgentsIndexResponse>('/api/clawd/managed-agents')

export const getManagedAgentPresenceForUser = (userId: string) =>
  get<DesktopPresenceRecord[]>(`/api/clawd/managed-agents/desktop-presence/${encodeURIComponent(userId)}`)

export const previewManagedAgentRoute = (body: ManagedAgentRoutePreviewRequest) =>
  post<ManagedAgentRoutePreviewResponse>('/api/clawd/managed-agents/route-preview', body)
