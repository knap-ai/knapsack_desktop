import React, { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { KN_SERVER_HOST } from 'src/utils/constants'

const INITIAL_HEIGHT = 72
const MAX_RESPONSE_HEIGHT = 400
const INPUT_AREA_HEIGHT = 72
const QUICK_ACTIONS_HEIGHT = 44
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

function OverlayPanel() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasResponse, setHasResponse] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-focus input when the overlay becomes visible
  useEffect(() => {
    const unlistenFocus = listen('tauri://focus', () => {
      inputRef.current?.focus()
    })
    return () => { unlistenFocus.then(unlisten => unlisten()) }
  }, [])

  // Hide overlay on window blur
  useEffect(() => {
    const unlistenBlur = listen('tauri://blur', () => {
      setTimeout(() => { invoke('hide_overlay_window') }, 100)
    })
    return () => { unlistenBlur.then(unlisten => unlisten()) }
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  const updateWindowSize = useCallback(async (contentHeight: number) => {
    const totalHeight = INPUT_AREA_HEIGHT + contentHeight + (contentHeight > 0 ? PADDING_BOTTOM : 0)
    const clampedHeight = Math.min(
      totalHeight,
      INPUT_AREA_HEIGHT + QUICK_ACTIONS_HEIGHT + MAX_RESPONSE_HEIGHT + PADDING_BOTTOM,
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
      const contentHeight = Math.min(responseRef.current.scrollHeight, MAX_RESPONSE_HEIGHT) + PADDING_BOTTOM
      updateWindowSize(contentHeight)
    } else if (!hasResponse) {
      updateWindowSize(QUICK_ACTIONS_HEIGHT)
    }
  }, [hasResponse, response, updateWindowSize])

  const resetOverlay = useCallback(async () => {
    setQuery('')
    setResponse('')
    setHasResponse(false)
    setIsLoading(false)
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

      setResponse('')
      setHasResponse(true)
      setIsLoading(true)

      try {
        // Try gateway agent-chat first (shared session with channels),
        // fall back to direct LLM chat if gateway is unavailable.
        let reply: string | null = null

        try {
          const agentRes = await fetch(AGENT_CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: submittedQuery }),
            signal: controller.signal,
          })
          const agentData = await agentRes.json()
          if (agentData.ok && agentData.reply) {
            reply = agentData.reply
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
            body: JSON.stringify({ text: submittedQuery }),
            signal: controller.signal,
          })
          const directData = await directRes.json()
          reply = directData.reply || directData.message || directData.error || null
        }

        if (reply) {
          setResponse(reply)
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
    [isLoading],
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
                Thinking... this may take a moment
              </span>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(response) }} />
            )}
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
