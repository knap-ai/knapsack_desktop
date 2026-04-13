import { useCallback, useEffect, useState } from 'react'
import { aggregateContext, AggregatedContext } from '../../../api/context_aggregator'

interface Project {
  id: string
  name: string
  description: string
  github_url: string
  dev_url: string
}

interface BusinessContextReaderProps {
  onInitiateSession: (prompt: string) => void
  activeRepo?: string
  githubRepos?: string[]
}

function repoToName(repo: string): string {
  // "knap-ai/knapsack_desktop" → "Knapsack Desktop"
  const name = repo.split('/').pop() || repo
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function makeProject(repo: string): Project {
  return {
    id: repo,
    name: repoToName(repo),
    description: `Building features for ${repoToName(repo)}`,
    github_url: `https://github.com/${repo}`,
    dev_url: 'http://localhost:3000',
  }
}

const SOURCES_DEFAULT = {
  meetings: true,
  emails: true,
  workspace_docs: true,
  browser_urls: [] as string[],
}

export default function BusinessContextReader({
  onInitiateSession,
  activeRepo,
  githubRepos = [],
}: BusinessContextReaderProps) {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (activeRepo) return [makeProject(activeRepo)]
    if (githubRepos.length > 0) return githubRepos.map(makeProject)
    return [{ id: 'new', name: 'My Project', description: '', github_url: '', dev_url: 'http://localhost:3000' }]
  })
  const [activeId, setActiveId] = useState<string>(() => projects[0]?.id ?? 'new')
  const [sources, setSources] = useState(SOURCES_DEFAULT)
  const [browserUrlInput, setBrowserUrlInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'gathering' | 'ready' | 'error'>('idle')
  const [context, setContext] = useState<AggregatedContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [addingProject, setAddingProject] = useState(false)

  // Listen for chat-driven population
  useEffect(() => {
    const handler = (e: Event) => {
      const description = (e as CustomEvent<string>).detail
      if (!description) return

      // Update the active project's description
      setProjects(prev => {
        const updated = prev.map(p =>
          p.id === activeId ? { ...p, description } : p,
        )
        return updated
      })
    }
    window.addEventListener('clawd-dev-populate', handler)
    return () => window.removeEventListener('clawd-dev-populate', handler)
  }, [activeId])
  const [newProjectName, setNewProjectName] = useState('')

  // Sync projects when activeRepo / githubRepos changes from parent
  useEffect(() => {
    if (!activeRepo) return
    setProjects(prev => {
      // Update or add the active repo
      if (prev.some(p => p.id === activeRepo)) {
        return prev
      }
      return [...prev, makeProject(activeRepo)]
    })
    setActiveId(activeRepo)
  }, [activeRepo])

  useEffect(() => {
    if (githubRepos.length === 0) return
    setProjects(prev => {
      const existingIds = new Set(prev.map(p => p.id))
      const toAdd = githubRepos.filter(r => !existingIds.has(r)).map(makeProject)
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev
    })
  }, [githubRepos])

  const activeProject = projects.find(p => p.id === activeId) ?? projects[0]

  const updateProject = useCallback((field: keyof Project, value: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === activeId ? { ...p, [field]: value } : p)),
    )
  }, [activeId])

  const handleAddProject = useCallback(() => {
    const name = newProjectName.trim()
    if (!name) return
    const id = `project-${Date.now()}`
    const proj: Project = {
      id,
      name,
      description: '',
      github_url: '',
      dev_url: 'http://localhost:3000',
    }
    setProjects(prev => [...prev, proj])
    setActiveId(id)
    setNewProjectName('')
    setAddingProject(false)
    setContext(null)
    setStatus('idle')
  }, [newProjectName])

  const handleRemoveProject = useCallback((id: string) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length === 0) return prev // keep at least one
      if (activeId === id) setActiveId(next[0].id)
      return next
    })
  }, [activeId])

  const handleSelectProject = useCallback((id: string) => {
    setActiveId(id)
    setContext(null)
    setStatus('idle')
    setError(null)
  }, [])

  const buildDescriptionFromContext = useCallback((ctx: AggregatedContext): string => {
    const lines: string[] = []

    // Summarize meetings
    for (const m of ctx.meetings) {
      if (m.summary) lines.push(`From meeting "${m.title}" (${m.date}): ${m.summary}`)
    }

    // Summarize emails
    for (const e of ctx.emails) {
      if (e.snippet) lines.push(`From email "${e.subject}": ${e.snippet}`)
    }

    // Summarize workspace docs
    for (const d of ctx.workspace_documents) {
      if (d.snippet) lines.push(`From ${d.source} doc "${d.title}": ${d.snippet}`)
    }

    // Summarize browser pages
    for (const p of ctx.browser_pages) {
      if (p.content_snippet) lines.push(`From ${p.title}: ${p.content_snippet}`)
    }

    return lines.length > 0
      ? lines.join('\n\n')
      : ''
  }, [])

  const handleGatherContext = useCallback(async () => {
    if (!activeProject?.name.trim()) return
    setStatus('gathering')
    setError(null)

    // Use description if user already typed something, otherwise use project name
    const searchQuery = activeProject.description.trim() || activeProject.name

    try {
      const result = await aggregateContext({
        project_description: searchQuery,
        sources,
        time_range_hours: 168,
      })

      if (result.ok && result.context) {
        setContext(result.context)
        setStatus('ready')

        // Auto-fill description from gathered context if currently empty or still the default
        const isDefault = !activeProject.description.trim()
          || activeProject.description === `Building features for ${activeProject.name}`
        if (isDefault) {
          const autoDesc = buildDescriptionFromContext(result.context)
          if (autoDesc) {
            updateProject('description', autoDesc)
          }
        }
      } else {
        setError(result.message || 'Failed to aggregate context')
        setStatus('error')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setStatus('error')
    }
  }, [activeProject, sources, buildDescriptionFromContext, updateProject])

  const handleGeneratePlan = useCallback(() => {
    if (!context?.combined_prompt) return
    const repoLine = activeProject?.github_url
      ? `\nGitHub repo: ${activeProject.github_url}`
      : ''
    onInitiateSession(context.combined_prompt + repoLine)
  }, [context, activeProject, onInitiateSession])

  const handleAddBrowserUrl = useCallback(() => {
    const url = browserUrlInput.trim()
    if (url && !sources.browser_urls.includes(url)) {
      setSources(prev => ({ ...prev, browser_urls: [...prev.browser_urls, url] }))
      setBrowserUrlInput('')
    }
  }, [browserUrlInput, sources.browser_urls])

  const contextItemCount =
    (context?.meetings.length || 0) +
    (context?.emails.length || 0) +
    (context?.workspace_documents.length || 0) +
    (context?.browser_pages.length || 0)

  const canGather = !!activeProject?.name.trim() && status !== 'gathering'

  return (
    <div className="DevModePanel__section">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>&#128218;</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Business Context Reader</span>
        </div>
        <button
          onClick={() => setAddingProject(v => !v)}
          title="Add project"
          style={{
            fontSize: 13,
            fontWeight: 700,
            width: 22,
            height: 22,
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 6,
            background: addingProject ? 'rgba(139,92,246,0.12)' : '#fff',
            color: '#7c3aed',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      {/* Add-project row */}
      {addingProject && (
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            autoFocus
            type="text"
            placeholder="Project name (e.g. 'Mobile App', 'Billing API')"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddProject()
              if (e.key === 'Escape') setAddingProject(false)
            }}
            style={{ flex: 1, fontSize: 11, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6 }}
          />
          <button
            onClick={handleAddProject}
            disabled={!newProjectName.trim()}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              border: 'none',
              borderRadius: 6,
              background: newProjectName.trim() ? '#7c3aed' : '#e0e0e0',
              color: newProjectName.trim() ? '#fff' : '#999',
              cursor: newProjectName.trim() ? 'pointer' : 'default',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Project tabs */}
      {projects.length > 1 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {projects.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                background: p.id === activeId ? 'rgba(139,92,246,0.12)' : '#f5f5f5',
                color: p.id === activeId ? '#7c3aed' : '#666',
                border: `1px solid ${p.id === activeId ? 'rgba(139,92,246,0.25)' : '#e0e0e0'}`,
              }}
              onClick={() => handleSelectProject(p.id)}
            >
              {p.name}
              {projects.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); handleRemoveProject(p.id) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    color: '#bbb',
                    padding: 0,
                    lineHeight: 1,
                    marginLeft: 2,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeProject && (
        <>
          {/* Project name (editable) */}
          <input
            type="text"
            value={activeProject.name}
            onChange={e => updateProject('name', e.target.value)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              background: '#fafafa',
            }}
          />

          {/* GitHub URL (optional for pre-repo projects) */}
          <input
            type="text"
            placeholder="GitHub URL (optional — leave blank for pre-repo projects)"
            value={activeProject.github_url}
            onChange={e => updateProject('github_url', e.target.value)}
            style={{
              fontSize: 11,
              padding: '5px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              color: activeProject.github_url ? '#7c3aed' : '#999',
            }}
          />

          {/* Description — auto-filled from context, editable */}
          <textarea
            placeholder="Auto-filled when you Gather Context, or type your own description..."
            value={activeProject.description}
            onChange={e => updateProject('description', e.target.value)}
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
        </>
      )}

      {/* Source toggles */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
        {(['meetings', 'emails', 'workspace_docs'] as const).map(src => (
          <label
            key={src}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: 6,
              background: sources[src] ? 'rgba(139,92,246,0.1)' : '#f5f5f5',
              color: sources[src] ? '#7c3aed' : '#888',
              border: `1px solid ${sources[src] ? 'rgba(139,92,246,0.2)' : '#e0e0e0'}`,
            }}
          >
            <input
              type="checkbox"
              checked={sources[src]}
              onChange={e => setSources(prev => ({ ...prev, [src]: e.target.checked }))}
              style={{ display: 'none' }}
            />
            {src === 'meetings' ? 'Meetings' : src === 'emails' ? 'Emails' : 'Docs'}
          </label>
        ))}
      </div>

      {/* Browser URLs */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Notion/Confluence URL..."
          value={browserUrlInput}
          onChange={e => setBrowserUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddBrowserUrl()}
          style={{ flex: 1, fontSize: 11, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6 }}
        />
        <button
          onClick={handleAddBrowserUrl}
          disabled={!browserUrlInput.trim()}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
            cursor: browserUrlInput.trim() ? 'pointer' : 'default',
            background: '#fff',
          }}
        >
          +
        </button>
      </div>
      {sources.browser_urls.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {sources.browser_urls.map(url => (
            <span
              key={url}
              style={{
                fontSize: 10,
                padding: '2px 6px',
                background: '#f0f0f0',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {url.length > 40 ? url.slice(0, 40) + '...' : url}
              <button
                onClick={() => setSources(prev => ({ ...prev, browser_urls: prev.browser_urls.filter(u => u !== url) }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#999', padding: 0 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleGatherContext}
          disabled={!canGather}
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 8,
            background: canGather ? '#7c3aed' : '#e0e0e0',
            color: canGather ? '#fff' : '#999',
            cursor: canGather ? 'pointer' : 'default',
          }}
        >
          {status === 'gathering' ? 'Gathering...' : 'Gather Context'}
        </button>

        {context && (
          <button
            onClick={handleGeneratePlan}
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: 600,
              padding: '8px 12px',
              border: '2px solid #7c3aed',
              borderRadius: 8,
              background: '#fff',
              color: '#7c3aed',
              cursor: 'pointer',
            }}
          >
            Generate Plan
          </button>
        )}
      </div>

      {error && <div className="DevModePanel__error">{error}</div>}

      {/* Context preview */}
      {context && (
        <div style={{ fontSize: 11, color: '#666' }}>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#333' }}
          >
            <span style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              &#9654;
            </span>
            {contextItemCount} context items gathered
            {context.meetings.length > 0 && ` (${context.meetings.length} meetings`}
            {context.emails.length > 0 && `, ${context.emails.length} emails`}
            {context.workspace_documents.length > 0 && `, ${context.workspace_documents.length} docs`}
            {context.browser_pages.length > 0 && `, ${context.browser_pages.length} pages`}
            {contextItemCount > 0 && ')'}
          </div>
          {expanded && (
            <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto', fontSize: 10, lineHeight: 1.6 }}>
              {context.meetings.map((m, i) => (
                <div key={`m-${i}`} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <strong>Meeting:</strong> {m.title} ({m.date})
                  {m.participants.length > 0 && <span style={{ color: '#999' }}> — {m.participants.join(', ')}</span>}
                </div>
              ))}
              {context.emails.map((e, i) => (
                <div key={`e-${i}`} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <strong>Email:</strong> {e.subject} — from {e.from}
                </div>
              ))}
              {context.workspace_documents.map((d, i) => (
                <div key={`d-${i}`} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <strong>Doc:</strong> {d.title} ({d.source}, score: {d.relevance_score.toFixed(2)})
                </div>
              ))}
              {context.browser_pages.map((p, i) => (
                <div key={`p-${i}`} style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <strong>Page:</strong> {p.title} — {p.url}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
