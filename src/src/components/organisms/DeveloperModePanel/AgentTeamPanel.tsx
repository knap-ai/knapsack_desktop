import { useCallback, useEffect, useRef, useState } from 'react'
import { launchTeam, getTeamStatus, cancelTeamRun, TeamRunState, TeamConfig, RoleType } from '../../../api/agent_team'
import AgentTeamConfig from './AgentTeamConfig'

interface AgentTeamPanelProps {
  onInitiateSession: (prompt: string) => void
  activeRepo?: string
}

const ROLE_ICONS: Record<RoleType, string> = {
  PM: '\uD83D\uDCCB',
  FrontendDev: '\uD83C\uDFA8',
  BackendDev: '\u2699\uFE0F',
  QA: '\uD83E\uDDEA',
}

const STATUS_ICONS: Record<string, string> = {
  Pending: '\u23F3',
  Running: '\uD83D\uDD04',
  Success: '\u2705',
  Failed: '\u274C',
  Skipped: '\u23ED\uFE0F',
}

export default function AgentTeamPanel({ onInitiateSession, activeRepo }: AgentTeamPanelProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [teamState, setTeamState] = useState<TeamRunState | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll for team status
  useEffect(() => {
    if (!runId) return

    const poll = async () => {
      try {
        const result = await getTeamStatus(runId)
        if (result.ok && result.state) {
          setTeamState(result.state)
          // Stop polling when complete
          if (['Complete', 'Failed', 'Cancelled'].includes(result.state.status)) {
            if (pollRef.current) {
              clearInterval(pollRef.current)
              pollRef.current = null
            }
          }
        }
      } catch {
        // Ignore poll errors
      }
    }

    poll() // immediate first call
    pollRef.current = setInterval(poll, 2500)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [runId])

  const handleLaunch = useCallback(
    async (config: TeamConfig) => {
      setLaunching(true)
      setError(null)
      setShowConfig(false)

      try {
        const result = await launchTeam({
          ...config,
          repo: activeRepo || config.repo,
        })

        if (result.ok && result.run_id) {
          setRunId(result.run_id)
        } else {
          setError(result.message || 'Failed to launch team')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Network error')
      } finally {
        setLaunching(false)
      }
    },
    [activeRepo],
  )

  const handleCancel = useCallback(async () => {
    if (!runId) return
    try {
      await cancelTeamRun(runId)
    } catch {
      // Ignore cancel errors
    }
  }, [runId])

  const handleReset = useCallback(() => {
    setRunId(null)
    setTeamState(null)
    setError(null)
  }, [])

  const isRunning = teamState && !['Complete', 'Failed', 'Cancelled'].includes(teamState.status)

  return (
    <div className="DevModePanel__section">
      <div className="DevModePanel__sectionHeader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>&#127959;</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Agent Team</span>
          {teamState && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
                background:
                  teamState.status === 'Complete'
                    ? 'rgba(34,197,94,0.1)'
                    : teamState.status === 'Failed'
                      ? 'rgba(220,38,38,0.1)'
                      : 'rgba(139,92,246,0.1)',
                color:
                  teamState.status === 'Complete'
                    ? '#16a34a'
                    : teamState.status === 'Failed'
                      ? '#dc2626'
                      : '#7c3aed',
              }}
            >
              {teamState.status}
            </span>
          )}
        </div>
        {!isRunning && (
          <button
            onClick={() => (teamState ? handleReset() : setShowConfig(!showConfig))}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {teamState ? 'New Team' : showConfig ? 'Cancel' : 'Configure'}
          </button>
        )}
      </div>

      {/* Config form */}
      {showConfig && !teamState && (
        <AgentTeamConfig onLaunch={handleLaunch} launching={launching} />
      )}

      {/* Error */}
      {error && <div className="DevModePanel__error">{error}</div>}

      {/* Team progress */}
      {teamState && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teamState.agents.map(agent => (
            <div
              key={agent.display_name}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background:
                  agent.status === 'Success'
                    ? 'rgba(34,197,94,0.05)'
                    : agent.status === 'Failed'
                      ? 'rgba(220,38,38,0.05)'
                      : agent.status === 'Running'
                        ? 'rgba(139,92,246,0.05)'
                        : '#fafafa',
                border: `1px solid ${
                  agent.status === 'Success'
                    ? 'rgba(34,197,94,0.15)'
                    : agent.status === 'Failed'
                      ? 'rgba(220,38,38,0.15)'
                      : agent.status === 'Running'
                        ? 'rgba(139,92,246,0.15)'
                        : '#eee'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <span>{ROLE_ICONS[agent.role] || ''}</span>
                  <span>{agent.display_name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
                  <span>{STATUS_ICONS[agent.status] || ''}</span>
                  <span>{agent.status}</span>
                  {agent.status === 'Running' && agent.max_iterations > 0 && (
                    <span style={{ color: '#999' }}>
                      ({agent.iteration}/{agent.max_iterations})
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback / output */}
              {agent.last_feedback && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    color: '#dc2626',
                    background: 'rgba(220,38,38,0.05)',
                    padding: '4px 6px',
                    borderRadius: 4,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    maxHeight: 60,
                    overflow: 'hidden',
                  }}
                >
                  {agent.last_feedback}
                </div>
              )}
              {agent.output_summary && agent.status === 'Success' && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    color: '#666',
                    maxHeight: 40,
                    overflow: 'hidden',
                  }}
                >
                  {agent.output_summary.slice(0, 150)}
                  {agent.output_summary.length > 150 ? '...' : ''}
                </div>
              )}
              {agent.error && (
                <div style={{ marginTop: 4, fontSize: 10, color: '#dc2626' }}>{agent.error}</div>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {isRunning && (
              <button
                onClick={handleCancel}
                style={{
                  fontSize: 11,
                  padding: '6px 12px',
                  border: '1px solid #dc2626',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                Cancel Team
              </button>
            )}
            {teamState.final_report && (
              <button
                onClick={() => onInitiateSession(`Review this QA report and fix any remaining issues:\n\n${teamState.final_report}`)}
                style={{
                  fontSize: 11,
                  padding: '6px 12px',
                  border: '1px solid #7c3aed',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#7c3aed',
                  cursor: 'pointer',
                }}
              >
                Fix Remaining Issues
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
