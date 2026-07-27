import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DesktopPresenceRecord,
  ManagedAgent,
  ManagedAgentCapabilityKind,
  ManagedAgentChannelRunRequest,
  ManagedAgentExecutionSession,
  ManagedAgentPolicyPack,
  ManagedAgentRoutePreviewRequest,
  ManagedAgentRoutePreviewResponse,
  ManagedAgentTemplate,
  getManagedAgentExecutionSessions,
  getManagedAgentPresenceForUser,
  getManagedAgentsIndex,
  previewManagedAgentRoute,
  runManagedAgentChannel,
} from 'src/api/managedAgents'

interface ManagedAgentsState {
  version: number | null
  templates: ManagedAgentTemplate[]
  policyPacks: ManagedAgentPolicyPack[]
  agents: ManagedAgent[]
  presence: DesktopPresenceRecord[]
  sessions: ManagedAgentExecutionSession[]
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

function defaultProbeRequest(agent: ManagedAgent, userId: string): ManagedAgentChannelRunRequest {
  if (agent.agentId === 'scout_general') {
    return {
      agentId: agent.agentId,
      userId,
      channel: 'slack',
      message:
        'Control-plane probe: summarize how this shared Slack Scout run would be routed and confirm the managed execution session is persisted.',
      taskSummary: 'Slack shared-agent control-plane probe',
      contextKey: `${agent.agentId}:${userId}:slack-probe`,
      requiredCapabilities: ['cloud_chat', 'shared_task_context'],
      desktopSessionRequirement: 'none',
    }
  }

  return {
    agentId: agent.agentId,
    userId,
    channel: 'slack',
    message:
      'Control-plane probe: confirm this managed Slack run can preserve shared context and prefer desktop help when available.',
    taskSummary: `${agent.displayName} Slack control-plane probe`,
    contextKey: `${agent.agentId}:${userId}:slack-probe`,
    requiredCapabilities: ['browser_automation', 'shared_task_context'],
    desktopSessionRequirement: 'preferred',
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
    sessions: [],
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
      const sessionsResponse = normalizedUserId
        ? await getManagedAgentExecutionSessions({ userId: normalizedUserId }).catch(() => ({
            success: false,
            sessions: [],
          }))
        : { success: false, sessions: [] }

      setState(prev => ({
        ...prev,
        version: index.version,
        templates: index.templates,
        policyPacks: index.policyPacks,
        agents: index.agents,
        presence,
        sessions: sessionsResponse.sessions.length
          ? sessionsResponse.sessions
          : index.executionSessions.filter(session => session.userId === normalizedUserId),
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

  const runChannelProbe = useCallback(
    async (agent: ManagedAgent, overrides?: Partial<ManagedAgentChannelRunRequest>) => {
      const response = await runManagedAgentChannel({
        ...defaultProbeRequest(agent, normalizedUserId),
        ...overrides,
      })

      setState(prev => {
        const deduped = prev.sessions.filter(session => session.sessionId !== response.session.sessionId)
        return {
          ...prev,
          sessions: [response.session, ...deduped].sort((a, b) => {
            const aTs = Date.parse(a.updatedAt) || 0
            const bTs = Date.parse(b.updatedAt) || 0
            return bTs - aTs
          }),
          routePreviews: {
            ...prev.routePreviews,
            [agent.agentId]: response.routePreview,
          },
        }
      })

      return response
    },
    [normalizedUserId],
  )

  return {
    ...state,
    normalizedUserId,
    refresh,
    refreshRoutePreview,
    runChannelProbe,
  }
}
