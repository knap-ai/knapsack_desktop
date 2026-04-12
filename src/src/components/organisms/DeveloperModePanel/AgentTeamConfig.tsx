import { useCallback, useState } from 'react'
import { TeamConfig, TeamRole, RoleType } from '../../../api/agent_team'

interface AgentTeamConfigProps {
  onLaunch: (config: TeamConfig) => void
  launching: boolean
}

const DEFAULT_ROLES: TeamRole[] = [
  { role_type: 'PM' },
  { role_type: 'FrontendDev' },
  { role_type: 'BackendDev' },
  { role_type: 'QA' },
]

const ROLE_LABELS: Record<RoleType, string> = {
  PM: 'PM (writes spec)',
  FrontendDev: 'Frontend Dev',
  BackendDev: 'Backend Dev',
  QA: 'QA Engineer',
}

export default function AgentTeamConfig({ onLaunch, launching }: AgentTeamConfigProps) {
  const [description, setDescription] = useState('')
  const [devUrl, setDevUrl] = useState('http://localhost:3000')
  const [maxIterations, setMaxIterations] = useState(5)
  const [selectedRoles, setSelectedRoles] = useState<Set<RoleType>>(
    new Set(['PM', 'FrontendDev', 'BackendDev', 'QA']),
  )
  const [businessContext, setBusinessContext] = useState('')

  const toggleRole = useCallback((role: RoleType) => {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      if (next.has(role)) {
        next.delete(role)
      } else {
        next.add(role)
      }
      return next
    })
  }, [])

  const handleLaunch = useCallback(() => {
    if (!description.trim()) return

    const config: TeamConfig = {
      project_description: description,
      dev_url: devUrl || undefined,
      max_iterations: maxIterations,
      roles: DEFAULT_ROLES.filter(r => selectedRoles.has(r.role_type)),
      business_context: businessContext || undefined,
    }

    onLaunch(config)
  }, [description, devUrl, maxIterations, selectedRoles, businessContext, onLaunch])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Project description */}
      <textarea
        placeholder="What should the team build? (e.g., 'Build a user settings page with password change, notification preferences, and account deletion')"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          fontSize: 12,
          padding: '8px 10px',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      {/* Dev server URL */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>Dev server:</label>
        <input
          type="text"
          value={devUrl}
          onChange={e => setDevUrl(e.target.value)}
          placeholder="http://localhost:3000"
          style={{
            flex: 1,
            fontSize: 11,
            padding: '4px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
          }}
        />
      </div>

      {/* Role selection */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {DEFAULT_ROLES.map(role => (
          <label
            key={role.role_type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: 6,
              background: selectedRoles.has(role.role_type)
                ? 'rgba(139,92,246,0.1)'
                : '#f5f5f5',
              color: selectedRoles.has(role.role_type) ? '#7c3aed' : '#888',
              border: `1px solid ${selectedRoles.has(role.role_type) ? 'rgba(139,92,246,0.2)' : '#e0e0e0'}`,
            }}
          >
            <input
              type="checkbox"
              checked={selectedRoles.has(role.role_type)}
              onChange={() => toggleRole(role.role_type)}
              style={{ display: 'none' }}
            />
            {ROLE_LABELS[role.role_type]}
          </label>
        ))}
      </div>

      {/* Feedback iterations */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#666', whiteSpace: 'nowrap' }}>
          Max feedback iterations:
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={maxIterations}
          onChange={e => setMaxIterations(parseInt(e.target.value) || 5)}
          style={{
            width: 50,
            fontSize: 11,
            padding: '4px 6px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            textAlign: 'center',
          }}
        />
      </div>

      {/* Optional business context */}
      <details style={{ fontSize: 11, color: '#666' }}>
        <summary style={{ cursor: 'pointer' }}>Additional business context (optional)</summary>
        <textarea
          placeholder="Paste PRD, spec, or additional requirements here..."
          value={businessContext}
          onChange={e => setBusinessContext(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            fontSize: 11,
            padding: '6px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            marginTop: 6,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </details>

      {/* Launch */}
      <button
        onClick={handleLaunch}
        disabled={!description.trim() || launching || selectedRoles.size === 0}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '8px 16px',
          border: 'none',
          borderRadius: 8,
          background:
            description.trim() && !launching && selectedRoles.size > 0
              ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
              : '#e0e0e0',
          color:
            description.trim() && !launching && selectedRoles.size > 0
              ? '#fff'
              : '#999',
          cursor:
            description.trim() && !launching && selectedRoles.size > 0
              ? 'pointer'
              : 'default',
        }}
      >
        {launching ? 'Launching Team...' : `Launch ${selectedRoles.size}-Agent Team`}
      </button>
    </div>
  )
}
