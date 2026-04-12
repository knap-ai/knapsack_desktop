import { useCallback, useState } from 'react'
import { TeamConfig, TeamRole, RoleType } from '../../../api/agent_team'

interface AgentTeamConfigProps {
  onLaunch: (config: TeamConfig) => void
  launching: boolean
}

interface RoleEntry {
  role_type: RoleType
  defaultLabel: string
  name: string
  enabled: boolean
}

const INITIAL_ROLES: RoleEntry[] = [
  { role_type: 'PM', defaultLabel: 'PM', name: 'Sage', enabled: true },
  { role_type: 'Critic', defaultLabel: 'Critic', name: 'Raven', enabled: true },
  { role_type: 'FrontendDev', defaultLabel: 'Frontend Dev', name: 'Pixel', enabled: true },
  { role_type: 'BackendDev', defaultLabel: 'Backend Dev', name: 'Forge', enabled: true },
  { role_type: 'QA', defaultLabel: 'QA Engineer', name: 'Sentry', enabled: true },
]

export default function AgentTeamConfig({ onLaunch, launching }: AgentTeamConfigProps) {
  const [description, setDescription] = useState('')
  const [devUrl, setDevUrl] = useState('http://localhost:3000')
  const [maxIterations, setMaxIterations] = useState(5)
  const [roles, setRoles] = useState<RoleEntry[]>(INITIAL_ROLES)
  const [editingRole, setEditingRole] = useState<RoleType | null>(null)
  const [businessContext, setBusinessContext] = useState('')

  const toggleRole = useCallback((roleType: RoleType) => {
    setRoles(prev =>
      prev.map(r => (r.role_type === roleType ? { ...r, enabled: !r.enabled } : r)),
    )
  }, [])

  const updateRoleName = useCallback((roleType: RoleType, name: string) => {
    setRoles(prev =>
      prev.map(r => (r.role_type === roleType ? { ...r, name } : r)),
    )
  }, [])

  const enabledRoles = roles.filter(r => r.enabled)

  const handleLaunch = useCallback(() => {
    if (!description.trim()) return

    const teamRoles: TeamRole[] = enabledRoles.map(r => ({
      role_type: r.role_type,
      display_name: r.name,
    }))

    const config: TeamConfig = {
      project_description: description,
      dev_url: devUrl || undefined,
      max_iterations: maxIterations,
      roles: teamRoles,
      business_context: businessContext || undefined,
    }

    onLaunch(config)
  }, [description, devUrl, maxIterations, enabledRoles, businessContext, onLaunch])

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
          boxSizing: 'border-box',
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

      {/* Role selection with editable names */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {roles.map(role => (
          <div
            key={role.role_type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 8px',
              borderRadius: 6,
              background: role.enabled ? 'rgba(139,92,246,0.06)' : '#fafafa',
              border: `1px solid ${role.enabled ? 'rgba(139,92,246,0.15)' : '#eee'}`,
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={role.enabled}
              onChange={() => toggleRole(role.role_type)}
              style={{ width: 14, height: 14, accentColor: '#8b5cf6', cursor: 'pointer', flexShrink: 0 }}
            />

            {/* Role label */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: role.enabled ? '#7c3aed' : '#aaa',
                minWidth: 75,
                flexShrink: 0,
              }}
            >
              {role.defaultLabel}
            </span>

            {/* Editable name */}
            {editingRole === role.role_type ? (
              <input
                autoFocus
                type="text"
                value={role.name}
                onChange={e => updateRoleName(role.role_type, e.target.value)}
                onBlur={() => setEditingRole(null)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') setEditingRole(null)
                }}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '2px 6px',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: 4,
                  outline: 'none',
                  background: '#fff',
                  color: '#333',
                }}
              />
            ) : (
              <span
                onClick={() => role.enabled && setEditingRole(role.role_type)}
                title="Click to rename"
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  color: role.enabled ? '#333' : '#bbb',
                  cursor: role.enabled ? 'text' : 'default',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid transparent',
                }}
              >
                {role.name}
              </span>
            )}
          </div>
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
            boxSizing: 'border-box',
          }}
        />
      </details>

      {/* Launch */}
      <button
        onClick={handleLaunch}
        disabled={!description.trim() || launching || enabledRoles.length === 0}
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: '8px 16px',
          border: 'none',
          borderRadius: 8,
          background:
            description.trim() && !launching && enabledRoles.length > 0
              ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
              : '#e0e0e0',
          color:
            description.trim() && !launching && enabledRoles.length > 0
              ? '#fff'
              : '#999',
          cursor:
            description.trim() && !launching && enabledRoles.length > 0
              ? 'pointer'
              : 'default',
        }}
      >
        {launching ? 'Launching Team...' : `Launch ${enabledRoles.length}-Agent Team`}
      </button>
    </div>
  )
}
