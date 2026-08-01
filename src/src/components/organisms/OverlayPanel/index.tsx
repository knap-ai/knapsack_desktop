import React, { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { KN_SERVER_HOST } from 'src/utils/constants'
import {
  Workspace,
  WorkspaceDocument,
  listWorkspaces,
  saveChatToWorkspace,
  parseTags,
} from 'src/api/workspaces'

const INITIAL_HEIGHT = 72
const MAX_RESPONSE_HEIGHT = 400
const INPUT_AREA_HEIGHT = 72
const QUICK_ACTIONS_HEIGHT = 44
const SUGGESTED_PROMPT_HEIGHT = 40
const LIBRARY_RESULTS_HEIGHT = 80
const PADDING_BOTTOM = 16

const AGENT_CHAT_URL = KN_SERVER_HOST + '/api/clawd/agent-chat'
const DIRECT_CHAT_URL = KN_SERVER_HOST + '/api/clawd/chat'

interface QuickAction {
  label: string
  query: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Summarize emails', query: 'Summarize my recent emails and highlight anything urgent.' },
  { label: 'Prep for meeting', query: 'Help me prepare for my next upcoming meeting.' },
  { label: 'Search the web', query: 'Search the web for the latest AI news and give me a summary.' },
]

interface LibraryMatch {
  doc: WorkspaceDocument
  workspaceName: string
  workspaceIcon: string | null
  matchType: 'name' | 'tag' | 'summary'
}

/** Search all library documents by name, tags, and summary. Returns top matches. */
function searchLibrary(
  workspaces: Workspace[],
  query: string,
  max = 3,
): LibraryMatch[] {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
  if (terms.length === 0) return []

  const scored: { match: LibraryMatch; score: number }[] = []

  for (const ws of workspaces) {
    for (const doc of ws.documents ?? []) {
      let score = 0
      let matchType: LibraryMatch['matchType'] = 'name'

      const nameLower = doc.documentName.toLowerCase()
      for (const term of terms) {
        if (nameLower.includes(term)) score += 3
      }

      const allTags = [...parseTags(doc.autoTags), ...parseTags(doc.tags)]
      for (const tag of allTags) {
        const tagLower = tag.toLowerCase()
        for (const term of terms) {
          if (tagLower.includes(term) || term.includes(tagLower)) {
            score += 2
            matchType = score > 3 ? matchType : 'tag'
          }
        }
      }

      if (doc.summary) {
        const summaryLower = doc.summary.toLowerCase()
        for (const term of terms) {
          if (summaryLower.includes(term)) {
            score += 1
            matchType = score > 3 ? matchType : 'summary'
          }
        }
      }

      if (score > 0) {
        scored.push({
          match: {
            doc,
            workspaceName: ws.name,
            workspaceIcon: ws.icon,
            matchType,
          },
          score,
        })
      }
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(s => s.match)
}

/** Minimal markdown-to-HTML for overlay responses. */
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:14px;font-weight:700;margin:12px 0 4px">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:12px 0 4px">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:700;margin:12px 0 6px">$1</h1>')
  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
  // Bullet lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:16px;list-style-type:disc">$1</li>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#4f6fac;text-decoration:underline">$1</a>')
  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '<br/><br/>')
  // Single newlines
  html = html.replace(/\n/g, '<br/>')
  return html
}

/** Extract a suggested follow-up prompt from the AI response.
 *  Looks for a trailing question or falls back to a generic follow-up. */
function extractSuggestedPrompt(response: string, _originalQuery: string): string {
  // Look for the last sentence ending with '?'
  const lines = response.trim().split('\n').filter(l => l.trim())
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 3); i--) {
    const line = lines[i].trim()
    if (line.endsWith('?') && line.length > 10 && line.length < 200) {
      // Use the question itself as the follow-up (strip leading markdown)
      return line.replace(/^[#*\->\s]+/, '')
    }
  }
  return 'Tell me more about this'
}

function OverlayPanel() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasResponse, setHasResponse] = useState(false)
  const [suggestedPrompt, setSuggestedPrompt] = useState('')
  const [libraryMatches, setLibraryMatches] = useState<LibraryMatch[]>([])
  const [workspacesCache, setWorkspacesCache] = useState<Workspace[]>([])
  const [showSavePicker, setShowSavePicker] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const savePickerRef = useRef<HTMLDivElement>(null)

  // Pre-fetch workspaces on mount so Library search is instant
  useEffect(() => {
    listWorkspaces()
      .then(res => {
        if (res.success) setWorkspacesCache(res.data)
      })
      .catch(() => {}) // Silently ignore — Library features degrade gracefully
  }, [])

  // Auto-focus input when the overlay becomes visible
  useEffect(() => {
    const unlistenFocus = listen('tauri://focus', () => {
      inputRef.current?.focus()
      // Refresh workspace cache when overlay opens
      listWorkspaces()
        .then(res => { if (res.success) setWorkspacesCache(res.data) })
        .catch(() => {})
    })
    return () => { unlistenFocus.then(unlisten => unlisten()) }
  }, [])

  // Hide overlay on window blur — but only when idle (no active query).
  const hasResponseRef = useRef(false)
  const isLoadingRef = useRef(false)
  useEffect(() => { hasResponseRef.current = hasResponse }, [hasResponse])
  useEffect(() => { isLoadingRef.current = isLoading }, [isLoading])

  useEffect(() => {
    const unlistenBlur = listen('tauri://blur', () => {
      if (!hasResponseRef.current && !isLoadingRef.current) {
        setTimeout(() => { invoke('hide_overlay_window') }, 100)
      }
    })
    return () => { unlistenBlur.then(unlisten => unlisten()) }
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  // Close save picker on click outside
  useEffect(() => {
    if (!showSavePicker) return
    const handler = (e: MouseEvent) => {
      if (savePickerRef.current && !savePickerRef.current.contains(e.target as Node)) {
        setShowSavePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSavePicker])

  const updateWindowSize = useCallback(async (contentHeight: number) => {
    const totalHeight = INPUT_AREA_HEIGHT + contentHeight + (contentHeight > 0 ? PADDING_BOTTOM : 0)
    const clampedHeight = Math.min(
      totalHeight,
      INPUT_AREA_HEIGHT + LIBRARY_RESULTS_HEIGHT + MAX_RESPONSE_HEIGHT + SUGGESTED_PROMPT_HEIGHT + PADDING_BOTTOM,
    )
    try {
      await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(680, clampedHeight))
    } catch { /* Window may have been closed */ }
  }, [])

  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight
  }, [response])

  useEffect(() => {
    if (hasResponse && responseRef.current) {
      const scrollH = Math.min(responseRef.current.scrollHeight, MAX_RESPONSE_HEIGHT)
      const suggestedH = suggestedPrompt && !isLoading && response ? SUGGESTED_PROMPT_HEIGHT : 0
      const libraryH = libraryMatches.length > 0 ? LIBRARY_RESULTS_HEIGHT : 0
      const contentHeight = libraryH + scrollH + suggestedH + PADDING_BOTTOM
      updateWindowSize(contentHeight)
    } else if (!hasResponse) {
      updateWindowSize(QUICK_ACTIONS_HEIGHT)
    }
  }, [hasResponse, response, suggestedPrompt, isLoading, libraryMatches, updateWindowSize])

  const resetOverlay = useCallback(async () => {
    setQuery('')
    setResponse('')
    setHasResponse(false)
    setIsLoading(false)
    setSuggestedPrompt('')
    setLibraryMatches([])
    setShowSavePicker(false)
    setSaveToast(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    try {
      await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(680, INITIAL_HEIGHT))
    } catch { /* ignore */ }
  }, [])

  const hideOverlay = useCallback(async () => {
    await resetOverlay()
    invoke('hide_overlay_window')
  }, [resetOverlay])

  const handleSubmit = useCallback(
    async (submittedQuery: string) => {
      if (!submittedQuery.trim() || isLoading) return

      if (abortControllerRef.current) abortControllerRef.current.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      // Search Library instantly (client-side, no network needed)
      const matches = searchLibrary(workspacesCache, submittedQuery)
      setLibraryMatches(matches)

      setResponse('')
      setHasResponse(true)
      setIsLoading(true)
      setShowSavePicker(false)
      setSaveToast(null)

      try {
        // Try the configured agent harness first, then fall back to direct LLM
        // chat if it is unavailable.
        let reply: string | null = null

        try {
          const agentRes = await fetch(AGENT_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: submittedQuery, sessionId: 'overlay', preferFast: true }),
            signal: controller.signal,
          })
          const agentData = await agentRes.json()
          if (agentData.ok && agentData.reply) {
            reply = agentData.reply
          } else if (agentData.noFallback && agentData.message) {
            reply = agentData.message
          }
          // If not ok or no reply, fall through to direct chat
        } catch (agentErr: any) {
          if (agentErr.name === 'AbortError' && controller.signal.aborted) throw agentErr
          // Gateway unreachable — fall through to direct chat
        }

        // Fallback: direct LLM chat (has browser tools with shell fallback)
        if (!reply) {
          const directRes = await fetch(DIRECT_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: submittedQuery, preferFast: true }),
            signal: controller.signal,
          })
          const directData = await directRes.json()
          reply = directData.reply || directData.message || directData.error || null
        }

        if (reply) {
          setResponse(reply)
          setSuggestedPrompt(extractSuggestedPrompt(reply, submittedQuery))
        } else {
          setResponse('No response received. Make sure an API key is configured in Settings.')
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled
        } else {
          setResponse('An error occurred while getting a response. Please try again.')
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [isLoading, workspacesCache],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        hideOverlay()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(query)
      }
    },
    [hideOverlay, handleSubmit, query],
  )

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      setQuery(action.query)
      handleSubmit(action.query)
    },
    [handleSubmit],
  )

  const handleSaveToWorkspace = useCallback(
    async (ws: Workspace) => {
      if (!response) return
      try {
        const title = query.slice(0, 80) || 'Saved answer'
        const res = await saveChatToWorkspace(ws.uuid, response, title)
        if (res.success) {
          setShowSavePicker(false)
          setSaveToast(ws.name)
          setTimeout(() => setSaveToast(null), 2500)
        }
      } catch (err) {
        console.error('Failed to save to workspace:', err)
      }
    },
    [response, query],
  )

  /** Icon for a doc based on its type. */
  const docIcon = (doc: WorkspaceDocument) => {
    if (doc.documentType === 'chat_output') return '\uD83D\uDCAC'
    if (doc.documentType === 'folder') return '\uD83D\uDCC2'
    return '\uD83D\uDCC4'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          borderRadius: 16,
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
          fontFamily: "var(--font-inter, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
        }}
      >
        {/* Input area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 72 }}>
          <img
            src="/assets/images/knap-logo-medium.png"
            alt="Knapsack"
            style={{ width: 24, height: 24, marginRight: 12, flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Knapsack anything..."
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              color: '#1a1a1a',
              fontSize: 18,
              fontWeight: 300,
              outline: 'none',
              border: 'none',
              fontFamily: 'inherit',
            }}
          />
          {(isLoading || hasResponse) && (
            <button
              onClick={resetOverlay}
              title={isLoading ? 'Stop' : 'Clear'}
              style={{
                marginLeft: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#999',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div style={{ margin: '0 16px', borderTop: '1px solid rgba(0,0,0,0.08)' }} />

        {/* Library matches — shown instantly before AI response */}
        {libraryMatches.length > 0 && (
          <div style={{ padding: '8px 16px 4px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              From your Library
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {libraryMatches.map((match, i) => {
                const tags = [...parseTags(match.doc.autoTags), ...parseTags(match.doc.tags)].slice(0, 2)
                return (
                  <div
                    key={match.doc.id ?? i}
                    style={{
                      flex: '0 0 auto',
                      maxWidth: 200,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: 'rgba(91, 106, 191, 0.06)',
                      border: '1px solid rgba(91, 106, 191, 0.12)',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 12 }}>{docIcon(match.doc)}</span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {match.doc.documentName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#888' }}>
                        {match.workspaceIcon || '\uD83D\uDCC1'} {match.workspaceName}
                      </span>
                      {tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.06)',
                          color: '#777',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Response area */}
        {hasResponse && (
          <div
            ref={responseRef}
            style={{
              padding: '12px 16px 16px',
              color: '#333',
              fontSize: 14,
              lineHeight: 1.6,
              overflowY: 'auto',
              maxHeight: MAX_RESPONSE_HEIGHT,
              fontFamily: 'inherit',
              wordBreak: 'break-word',
            }}
          >
            {isLoading && !response ? (
              <span style={{ color: '#999', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity={0.75} />
                </svg>
                {libraryMatches.length > 0
                  ? 'Thinking... reviewing your Library docs'
                  : 'Thinking... this may take a moment'}
              </span>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(response) }} />
            )}
          </div>
        )}

        {/* Action bar: suggested follow-up + save button */}
        {!isLoading && response && (
          <div style={{
            padding: '0 16px 12px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {/* Suggested follow-up */}
            {suggestedPrompt && (
              <button
                onClick={() => {
                  setQuery(suggestedPrompt)
                  inputRef.current?.focus()
                }}
                style={{
                  flex: 1,
                  marginTop: 8,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#c54841',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
              >
                {suggestedPrompt}
              </button>
            )}

            {/* Save to Library button */}
            <div style={{ position: 'relative', marginTop: 8 }}>
              {saveToast ? (
                <span style={{
                  fontSize: 11,
                  color: '#22c55e',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved to {saveToast}
                </span>
              ) : (
                <button
                  onClick={() => setShowSavePicker(prev => !prev)}
                  title="Save to Library"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    background: 'rgba(91, 106, 191, 0.08)',
                    color: '#5b6abf',
                    border: '1px solid rgba(91, 106, 191, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(91, 106, 191, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(91, 106, 191, 0.25)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(91, 106, 191, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(91, 106, 191, 0.15)'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Save
                </button>
              )}

              {/* Inline workspace picker */}
              {showSavePicker && (
                <div
                  ref={savePickerRef}
                  style={{
                    position: 'absolute',
                    bottom: 32,
                    right: 0,
                    width: 220,
                    maxHeight: 200,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 10,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    zIndex: 10,
                  }}
                >
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    padding: '8px 10px 4px',
                  }}>
                    Save to collection
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 160 }}>
                    {workspacesCache.length === 0 && (
                      <div style={{ padding: '8px 10px', fontSize: 11, color: '#999' }}>
                        No collections yet
                      </div>
                    )}
                    {workspacesCache.map(ws => (
                      <button
                        key={ws.uuid}
                        onClick={() => handleSaveToWorkspace(ws)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          width: '100%',
                          padding: '6px 10px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        <span style={{ fontSize: 13 }}>{ws.icon || '\uD83D\uDCC1'}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 500, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ws.name}
                          </div>
                          <div style={{ fontSize: 10, color: '#999' }}>
                            {ws.documents?.length ?? 0} docs
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick action buttons */}
        {!hasResponse && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 10px' }}>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'rgba(0,0,0,0.05)',
                  color: '#666',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(197,72,65,0.1)'
                  e.currentTarget.style.color = '#c54841'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                  e.currentTarget.style.color = '#666'
                }}
              >
                {action.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#bbb', fontSize: 11 }}>
              <kbd style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, border: '1px solid #ddd', background: '#f5f5f5', fontFamily: 'inherit' }}>
                Esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #aaa !important;
        }
      `}</style>
    </div>
  )
}

export default OverlayPanel
