import { useCallback, useEffect, useState } from 'react'

interface GitHubConnectProps {
  activeRepo?: string
}

interface SkillStatus {
  name: string
  installed: boolean
  enabled: boolean
  ready: boolean
}

const API_BASE = 'http://127.0.0.1:8897'

export default function GitHubConnect({ activeRepo }: GitHubConnectProps) {
  const [status, setStatus] = useState<'checking' | 'not_installed' | 'installed' | 'ready' | 'error'>('checking')
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repoData, setRepoData] = useState<{
    open_issues: number
    open_prs: number
    recent_commits: number
  } | null>(null)
  const [loadingData, setLoadingData] = useState(false)

  // Check GitHub skill status
  const checkStatus = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/clawd/skills/status`)
      const data = await resp.json()
      const skills: SkillStatus[] = data?.skills || []
      const gh = skills.find((s: SkillStatus) => s.name === 'github')

      if (!gh || !gh.installed) {
        setStatus('not_installed')
      } else if (gh.ready) {
        setStatus('ready')
      } else {
        setStatus('installed')
      }
    } catch {
      setStatus('error')
      setError('Could not check skill status')
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Install the GitHub skill
  const handleInstall = useCallback(async () => {
    setInstalling(true)
    setError(null)
    try {
      const resp = await fetch(`${API_BASE}/api/clawd/skills/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: 'github' }),
      })
      const data = await resp.json()
      if (data.ok) {
        setStatus('ready')
      } else {
        setError(data.message || 'Install failed')
      }
    } catch {
      setError('Network error during install')
    } finally {
      setInstalling(false)
    }
  }, [])

  // Fetch repo activity data when connected and repo is set
  const fetchRepoData = useCallback(async () => {
    if (!activeRepo || status !== 'ready') return
    setLoadingData(true)
    try {
      // Use public GitHub API for basic repo stats
      const [issuesResp, prsResp] = await Promise.all([
        fetch(`https://api.github.com/search/issues?q=repo:${activeRepo}+type:issue+state:open&per_page=1`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        }),
        fetch(`https://api.github.com/search/issues?q=repo:${activeRepo}+type:pr+state:open&per_page=1`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        }),
      ])
      const issuesData = await issuesResp.json()
      const prsData = await prsResp.json()

      setRepoData({
        open_issues: issuesData.total_count || 0,
        open_prs: prsData.total_count || 0,
        recent_commits: 0, // would need auth for this
      })
    } catch {
      // Silently fail -- repo data is supplementary
    } finally {
      setLoadingData(false)
    }
  }, [activeRepo, status])

  useEffect(() => {
    fetchRepoData()
  }, [fetchRepoData])

  return (
    <div className="DevModePanel__section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>&#128025;</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>GitHub</span>
          {status === 'ready' && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(34,197,94,0.1)',
                color: '#16a34a',
              }}
            >
              Connected
            </span>
          )}
        </div>
        {status === 'ready' && (
          <button
            onClick={fetchRepoData}
            disabled={loadingData}
            style={{
              fontSize: 10,
              padding: '2px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: 4,
              background: '#fff',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            {loadingData ? '...' : 'Refresh'}
          </button>
        )}
      </div>

      {status === 'checking' && (
        <div style={{ fontSize: 11, color: '#999' }}>Checking GitHub connection...</div>
      )}

      {status === 'not_installed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>
            Connect GitHub to give agents access to your repos, PRs, issues, and commit history for richer project context.
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              background: installing ? '#e0e0e0' : '#24292e',
              color: installing ? '#999' : '#fff',
              cursor: installing ? 'default' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {installing ? 'Connecting...' : 'Connect GitHub'}
          </button>
        </div>
      )}

      {status === 'installed' && (
        <div style={{ fontSize: 11, color: '#d97706' }}>
          GitHub skill installed but not yet ready. Check OpenClaw settings.
        </div>
      )}

      {status === 'ready' && repoData && activeRepo && (
        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{repoData.open_issues}</span>
            <span style={{ color: '#999', fontSize: 10 }}>Open Issues</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>{repoData.open_prs}</span>
            <span style={{ color: '#999', fontSize: 10 }}>Open PRs</span>
          </div>
        </div>
      )}

      {status === 'ready' && !activeRepo && (
        <div style={{ fontSize: 11, color: '#999' }}>
          Select a target repository above to see project data.
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: '#dc2626' }}>{error}</div>
      )}
    </div>
  )
}
