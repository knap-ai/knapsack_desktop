import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DesktopPresenceRecord,
  ManagedAgent,
  ManagedAgentCapabilityKind,
  ManagedAgentPolicyPack,
  ManagedAgentRoutePreviewRequest,
  ManagedAgentRoutePreviewResponse,
  ManagedAgentTemplate,
  getManagedAgentPresenceForUser,
  getManagedAgentsIndex,
  previewManagedAgentRoute,
} from 'src/api/managedAgents'

interface ManagedAgentsState {
  version: number | null
  templates: ManagedAgentTemplate[]
  policyPacks: ManagedAgentPolicyPack[]
  agents: ManagedAgent[]
  presence: DesktopPresenceRecord[]
  routePreviews: Record<string, ManagedAgentRoutePreviewResponse | undefined>
  loading: boolean
  error: string | null
}

function defaultCapabilitiesForAgent(agent: ManagedAgent): ManagedAgentCapabilityKind[] {
  if (agent.agentId === 'scout_general') return ['cloud_chat', 'shared_task_context']
  return ['browser_automation', 'shared_task_context']
}

function defaultTaskSummaryForAgent(agent: ManagedAgent): string {
  if (agent.agentId === 'scout_general') {
    return 'Handle a shared Slack or Studio follow-through task with cloud-first continuity.'
  }
  if (agent.agentId === 'vera_compliance_manager') {
    return 'Review a compliance workflow and continue in cloud if desktop-only context is unavailable.'
  }
  return 'Handle an operations follow-up task with browser help when available.'
}

function defaultPreviewRequest(agent: ManagedAgent, userId: string): ManagedAgentRoutePreviewRequest {
  return {
    agentId: agent.agentId,
    userId,
    channel: 'slack',
    taskSummary: defaultTaskSummaryForAgent(agent),
    contextKey: `${agent.agentId}:${userId}:preview`,
    requiredCapabilities: defaultCapabilitiesForAgent(agent),
    desktopSessionRequirement: agent.agentId === 'scout_general' ? 'none' : 'preferred',
  }
}

export function useManagedAgents(enabled: boolean, userId?: string) {
  const normalizedUserId = useMemo(() => {
    const trimmed = (userId || '').trim()
    return trimmed || 'desktop-user'
  }, [userId])

  const [state, setState] = useState<ManagedAgentsState>({
    version: null,
    templates: [],
    policyPacks: [],
    agents: [],
    presence: [],
    routePreviews: {},
    loading: false,
    error: null,
  })

  const refreshRoutePreview = useCallback(
    async (agent: ManagedAgent, overrides?: Partial<ManagedAgentRoutePreviewRequest>) => {
      const request: ManagedAgentRoutePreviewRequest = {
        ...defaultPreviewRequest(agent, normalizedUserId),
        ...overrides,
      }
      const preview = await previewManagedAgentRoute(request)
      setState(prev => ({
        ...prev,
        routePreviews: {
          ...prev.routePreviews,
          [agent.agentId]: preview,
        },
      }))
      return preview
    },
    [normalizedUserId],
  )

  const refresh = useCallback(async () => {
    if (!enabled) return
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const index = await getManagedAgentsIndex()
      const presence = normalizedUserId
        ? await getManagedAgentPresenceForUser(normalizedUserId).catch(() => [])
        : []

      setState(prev => ({
        ...prev,
        version: index.version,
        templates: index.templates,
        policyPacks: index.policyPacks,
        agents: index.agents,
        presence,
        loading: false,
        error: null,
      }))

      const previews = await Promise.all(
        index.agents.map(async agent => {
          try {
            const preview = await previewManagedAgentRoute(defaultPreviewRequest(agent, normalizedUserId))
            return [agent.agentId, preview] as const
          } catch {
            return [agent.agentId, undefined] as const
          }
        }),
      )

      setState(prev => ({
        ...prev,
        routePreviews: Object.fromEntries(previews),
      }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err?.message || 'Failed to load managed agents',
      }))
    }
  }, [enabled, normalizedUserId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    ...state,
    normalizedUserId,
    refresh,
    refreshRoutePreview,
  }
}
