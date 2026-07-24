import { useMemo, useState } from 'react'
import {
  ManagedAgent,
  ManagedAgentPolicyPack,
  ManagedAgentRoutePreviewResponse,
  ManagedAgentTemplate,
} from 'src/api/managedAgents'
import { useManagedAgents } from 'src/hooks/managedAgents/useManagedAgents'

interface ManagedAgentsPanelProps {
  enabled: boolean
  userId?: string
}

function titleCase(input: string) {
  return input
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function routeLabel(route?: ManagedAgentRoutePreviewResponse) {
  if (!route) return 'Preview unavailable'
  switch (route.routeTarget) {
    case 'desktop':
      return 'Desktop'
    case 'hybrid_fallback':
      return 'Hybrid fallback'
    case 'cloud':
      return 'Cloud'
    case 'blocked':
      return 'Blocked'
    default:
      return route.routeTarget
  }
}

function routeToneClass(route?: ManagedAgentRoutePreviewResponse) {
  if (!route) return ''
  switch (route.routeTarget) {
    case 'desktop':
      return 'ClawdManagedAgentRouteBadge--desktop'
    case 'hybrid_fallback':
      return 'ClawdManagedAgentRouteBadge--hybrid'
    case 'cloud':
      return 'ClawdManagedAgentRouteBadge--cloud'
    case 'blocked':
      return 'ClawdManagedAgentRouteBadge--blocked'
    default:
      return ''
  }
}

function templateForAgent(templates: ManagedAgentTemplate[], agent: ManagedAgent) {
  return templates.find(template => template.templateId === agent.templateId)
}

function policyForAgent(policyPacks: ManagedAgentPolicyPack[], agent: ManagedAgent) {
  return policyPacks.find(policy => policy.policyPackId === agent.policyPackId)
}

export default function ManagedAgentsPanel({ enabled, userId }: ManagedAgentsPanelProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>('scout_general')
  const [refreshingAgentId, setRefreshingAgentId] = useState<string | null>(null)
  const { agents, templates, policyPacks, presence, routePreviews, loading, error, refresh, refreshRoutePreview } =
    useManagedAgents(enabled, userId)

  const latestPresence = useMemo(
    () =>
      [...presence].sort((a, b) => {
        const aTs = Date.parse(a.lastHeartbeatAt) || 0
        const bTs = Date.parse(b.lastHeartbeatAt) || 0
        return bTs - aTs
      })[0],
    [presence],
  )

  return (
    <section className="ClawdManagedAgentsSection">
      <div className="ClawdManagedAgentsSectionHeader">
        <div>
          <h4>Managed Agents</h4>
          <p>
            Preview how Scout, Vera, and Felix route between cloud and desktop, with shared
            context continuity.
          </p>
        </div>
        <button className="ClawdManagedAgentsRefresh" onClick={() => refresh()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="ClawdManagedAgentsStrip">
        <div className="ClawdManagedAgentsStripCard">
          <span className="ClawdManagedAgentsStripLabel">Desktop extension</span>
          <strong>{latestPresence?.desktopExtensionEnabled ? 'Enabled' : 'Not detected'}</strong>
          <span>{latestPresence ? latestPresence.deviceId : 'No live presence yet'}</span>
        </div>
        <div className="ClawdManagedAgentsStripCard">
          <span className="ClawdManagedAgentsStripLabel">Presence</span>
          <strong>{latestPresence?.available ? 'Available' : 'Offline'}</strong>
          <span>{latestPresence?.lastHeartbeatAt ? new Date(latestPresence.lastHeartbeatAt).toLocaleString() : 'No heartbeat'}</span>
        </div>
        <div className="ClawdManagedAgentsStripCard">
          <span className="ClawdManagedAgentsStripLabel">Cloud fallback</span>
          <strong>Shared context</strong>
          <span>Studio and desktop can hand off when safe.</span>
        </div>
      </div>

      {error && <div className="ClawdChannelsPanelError">{error}</div>}

      <div className="ClawdChannelAccordion">
        {agents.map(agent => {
          const template = templateForAgent(templates, agent)
          const policy = policyForAgent(policyPacks, agent)
          const preview = routePreviews[agent.agentId]
          const isOpen = expandedAgentId === agent.agentId

          return (
            <div
              key={agent.agentId}
              className={`ClawdAccordionItem ${isOpen ? 'ClawdAccordionItem--open' : ''} ${preview?.success ? 'ClawdAccordionItem--connected' : ''}`}
            >
              <button
                className="ClawdAccordionHeader"
                onClick={() => setExpandedAgentId(isOpen ? null : agent.agentId)}
              >
                <div className="ClawdManagedAgentAvatar">{agent.displayName.charAt(0)}</div>
                <div className="ClawdManagedAgentHeaderText">
                  <div className="ClawdManagedAgentTitleRow">
                    <div className="ClawdAccordionTitle">{agent.displayName}</div>
                    <span className={`ClawdManagedAgentRouteBadge ${routeToneClass(preview)}`}>
                      {routeLabel(preview)}
                    </span>
                  </div>
                  <div className="ClawdAccordionDesc">
                    {template?.displayName || titleCase(agent.templateId)} · {titleCase(agent.executionMode)}
                  </div>
                </div>
                <svg
                  className="ClawdAccordionChevron"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className="ClawdAccordionBody">
                <div className="ClawdManagedAgentMeta">
                  <div>
                    <span className="ClawdManagedAgentMetaLabel">Tenant</span>
                    <strong>{agent.tenantId}</strong>
                  </div>
                  <div>
                    <span className="ClawdManagedAgentMetaLabel">Channels</span>
                    <strong>{agent.enabledChannels.map(titleCase).join(', ')}</strong>
                  </div>
                  <div>
                    <span className="ClawdManagedAgentMetaLabel">Policy pack</span>
                    <strong>{policy?.policyPackId || agent.policyPackId}</strong>
                  </div>
                </div>

                {template?.description && (
                  <div className="ClawdManagedAgentBodyText">{template.description}</div>
                )}

                {policy && (
                  <div className="ClawdManagedAgentChips">
                    {policy.slackThreadOnly && <span className="ClawdManagedAgentChip">Thread-only Slack replies</span>}
                    {!policy.verboseReasoningEnabled && <span className="ClawdManagedAgentChip">Reasoning hidden</span>}
                    {!policy.guiKeystrokeSimulationEnabled && <span className="ClawdManagedAgentChip">No GUI keystrokes</span>}
                    {policy.requireDomVerification && <span className="ClawdManagedAgentChip">DOM verification required</span>}
                    {policy.recurringTaskTruthfulnessRequired && <span className="ClawdManagedAgentChip">Truthful recurring runs</span>}
                  </div>
                )}

                <div className="ClawdManagedAgentContextBox">
                  <div className="ClawdChannelGuideTitle">Shared memory layers</div>
                  <div className="ClawdManagedAgentMemoryGrid">
                    <code>{agent.memoryLayers.template}</code>
                    <code>{agent.memoryLayers.rolePack}</code>
                    <code>{agent.memoryLayers.tenant}</code>
                    <code>{agent.memoryLayers.instance}</code>
                  </div>
                </div>

                <div className="ClawdManagedAgentContextBox">
                  <div className="ClawdChannelGuideTitle">Route preview</div>
                  {preview ? (
                    <>
                      <div className="ClawdManagedAgentRouteSummary">
                        <span>
                          Selected runtime: <strong>{preview.selectedRuntime ? titleCase(preview.selectedRuntime) : 'None'}</strong>
                        </span>
                        <span>
                          Fallback: <strong>{preview.fallbackRuntime ? titleCase(preview.fallbackRuntime) : 'None'}</strong>
                        </span>
                      </div>
                      {preview.matchedPresence && (
                        <div className="ClawdManagedAgentPresenceNote">
                          Desktop match: {preview.matchedPresence.deviceId} ·{' '}
                          {preview.matchedPresence.stale ? 'stale heartbeat' : 'live heartbeat'}
                        </div>
                      )}
                      <ul className="ClawdManagedAgentReasons">
                        {preview.reasons.map(reason => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="ClawdManagedAgentBodyText">
                      No preview yet. Use the button below to ask the local gateway how this agent would route.
                    </div>
                  )}

                  <button
                    className="ClawdChannelCardAction ClawdChannelCardAction--secondary"
                    disabled={refreshingAgentId === agent.agentId}
                    onClick={async () => {
                      setRefreshingAgentId(agent.agentId)
                      try {
                        await refreshRoutePreview(agent)
                      } finally {
                        setRefreshingAgentId(null)
                      }
                    }}
                  >
                    {refreshingAgentId === agent.agentId ? 'Previewing...' : 'Refresh route preview'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
