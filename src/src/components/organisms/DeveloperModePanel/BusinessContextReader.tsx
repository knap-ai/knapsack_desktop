import { useCallback, useState } from 'react'
import { aggregateContext, AggregatedContext } from '../../../api/context_aggregator'

interface BusinessContextReaderProps {
  onInitiateSession: (prompt: string) => void
}

export default function BusinessContextReader({ onInitiateSession }: BusinessContextReaderProps) {
  const [projectDescription, setProjectDescription] = useState('')
  const [sources, setSources] = useState({
    meetings: true,
    emails: true,
    workspace_docs: true,
    browser_urls: [] as string[],
  })
  const [browserUrlInput, setBrowserUrlInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'gathering' | 'ready' | 'error'>('idle')
  const [context, setContext] = useState<AggregatedContext | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const handleGatherContext = useCallback(async () => {
    if (!projectDescription.trim()) return
    setStatus('gathering')
    setError(null)

    try {
      const result = await aggregateContext({
        project_description: projectDescription,
        sources,
        time_range_hours: 168,
      })

      if (result.ok && result.context) {
        setContext(result.context)
        setStatus('ready')
      } else {
        setError(result.message || 'Failed to aggregate context')
        setStatus('error')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
      setStatus('error')
    }
  }, [projectDescription, sources])

  const handleGeneratePlan = useCallback(() => {
    if (!context?.combined_prompt) return
    onInitiateSession(context.combined_prompt)
  }, [context, onInitiateSession])

  const handleAddBrowserUrl = useCallback(() => {
    const url = browserUrlInput.trim()
    if (url && !sources.browser_urls.includes(url)) {
      setSources(prev => ({
        ...prev,
        browser_urls: [...prev.browser_urls, url],
      }))
      setBrowserUrlInput('')
    }
  }, [browserUrlInput, sources.browser_urls])

  const handleRemoveBrowserUrl = useCallback((url: string) => {
    setSources(prev => ({
      ...prev,
      browser_urls: prev.browser_urls.filter(u => u !== url),
    }))
  }, [])

  const contextItemCount =
    (context?.meetings.length || 0) +
    (context?.emails.length || 0) +
    (context?.workspace_documents.length || 0) +
    (context?.browser_pages.length || 0)

  return (
    <div className="DevModePanel__section">
      <div className="DevModePanel__sectionHeader" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>&#128218;</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Business Context Reader</span>
      </div>

      {/* Project description */}
      <textarea
        className="DevModePanel__textarea"
        placeholder="Describe what you're building... (e.g., 'User profile page with avatar upload, bio editor, and activity timeline')"
        value={projectDescription}
        onChange={e => setProjectDescription(e.target.value)}
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
          style={{
            flex: 1,
            fontSize: 11,
            padding: '4px 8px',
            border: '1px solid #e0e0e0',
            borderRadius: 6,
          }}
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
                onClick={() => handleRemoveBrowserUrl(url)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 10,
                  color: '#999',
                  padding: 0,
                }}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleGatherContext}
          disabled={!projectDescription.trim() || status === 'gathering'}
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 600,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 8,
            background: projectDescription.trim() ? '#7c3aed' : '#e0e0e0',
            color: projectDescription.trim() ? '#fff' : '#999',
            cursor: projectDescription.trim() ? 'pointer' : 'default',
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

      {/* Error */}
      {error && (
        <div className="DevModePanel__error">{error}</div>
      )}

      {/* Context preview */}
      {context && (
        <div style={{ fontSize: 11, color: '#666' }}>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 600,
              color: '#333',
            }}
          >
            <span style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              &#9654;
            </span>
            {contextItemCount} context items gathered
            {context.meetings.length > 0 && ` (${context.meetings.length} meetings`}
            {context.emails.length > 0 && `, ${context.emails.length} emails`}
            {context.workspace_documents.length > 0 && `, ${context.workspace_documents.length} docs`}
            {context.browser_pages.length > 0 && `, ${context.browser_pages.length} pages`}
            )
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
