import React, { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { appWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'
import { KN_API_STREAM_LLM_COMPLETE } from 'src/utils/constants'

const INITIAL_HEIGHT = 72
const MAX_RESPONSE_HEIGHT = 400
const INPUT_AREA_HEIGHT = 72
const QUICK_ACTIONS_HEIGHT = 44
const PADDING_BOTTOM = 16

// Read user profile from localStorage (shared with the main app)
const PROFILE_KEY = 'KN_PROFILE'
function getUserProfile(): { email: string; name?: string } | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupt data */ }
  return null
}

interface QuickAction {
  label: string
  query: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Summarize emails', query: 'Summarize my recent emails and highlight anything urgent.' },
  { label: 'Prep for meeting', query: 'Help me prepare for my next upcoming meeting.' },
  { label: 'Search docs', query: 'Search my documents for relevant information.' },
]

function OverlayPanel() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasResponse, setHasResponse] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-focus input when the overlay becomes visible
  useEffect(() => {
    const unlistenFocus = listen('tauri://focus', () => {
      inputRef.current?.focus()
    })

    return () => {
      unlistenFocus.then(unlisten => unlisten())
    }
  }, [])

  // Hide overlay on window blur (lost focus)
  useEffect(() => {
    const unlistenBlur = listen('tauri://blur', () => {
      // Small delay to avoid hiding when clicking within the window itself
      setTimeout(() => {
        invoke('hide_overlay_window')
      }, 100)
    })

    return () => {
      unlistenBlur.then(unlisten => unlisten())
    }
  }, [])

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Resize the window based on content
  const updateWindowSize = useCallback(async (contentHeight: number) => {
    const totalHeight = INPUT_AREA_HEIGHT + contentHeight + (contentHeight > 0 ? PADDING_BOTTOM : 0)
    const clampedHeight = Math.min(
      totalHeight,
      INPUT_AREA_HEIGHT + QUICK_ACTIONS_HEIGHT + MAX_RESPONSE_HEIGHT + PADDING_BOTTOM,
    )
    try {
      await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(680, clampedHeight))
    } catch (e) {
      // Window may have been closed; ignore
    }
  }, [])

  // Scroll response area to bottom as new content arrives
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [response])

  // Update window size when response or quick-actions visibility changes
  useEffect(() => {
    if (hasResponse && responseRef.current) {
      const contentHeight = Math.min(responseRef.current.scrollHeight, MAX_RESPONSE_HEIGHT) + PADDING_BOTTOM
      updateWindowSize(contentHeight)
    } else if (!hasResponse) {
      // Show quick actions area
      updateWindowSize(QUICK_ACTIONS_HEIGHT)
    }
  }, [hasResponse, response, updateWindowSize])

  const resetOverlay = useCallback(async () => {
    setQuery('')
    setResponse('')
    setHasResponse(false)
    setIsStreaming(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    try {
      await appWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(680, INITIAL_HEIGHT))
    } catch (e) {
      // ignore
    }
  }, [])

  const hideOverlay = useCallback(async () => {
    await resetOverlay()
    invoke('hide_overlay_window')
  }, [resetOverlay])

  const handleSubmit = useCallback(
    async (submittedQuery: string) => {
      if (!submittedQuery.trim() || isStreaming) return

      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setResponse('')
      setHasResponse(true)
      setIsStreaming(true)

      try {
        // Get user profile for the required user_email/user_name fields
        const profile = getUserProfile()

        const res = await fetch(KN_API_STREAM_LLM_COMPLETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: profile?.email || '',
            user_name: profile?.name || '',
            prompt: submittedQuery,
            documents: [],
            is_local: false,
          }),
          signal: controller.signal,
        })

        const reader = res.body?.getReader()
        if (!reader) {
          setResponse('Failed to connect to Knapsack server.')
          setIsStreaming(false)
          return
        }

        const decoder = new TextDecoder()
        let accumulated = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          // Parse SSE lines: each is "data: {json}\n"
          const lines = buffer.split('\n')
          // Keep the last (possibly incomplete) line in the buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            if (line === 'data: [DONE]') break
            try {
              const parsed = JSON.parse(line.slice(6))
              const text = parsed?.choices?.[0]?.text ?? ''
              accumulated += text
            } catch {
              // Malformed JSON chunk — skip
            }
          }
          setResponse(accumulated)
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User cancelled — do nothing
        } else {
          setResponse('An error occurred while getting a response. Please try again.')
        }
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [isStreaming],
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
          {/* Knapsack logo */}
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

          {/* Stop / clear button when streaming or has response */}
          {(isStreaming || hasResponse) && (
            <button
              onClick={resetOverlay}
              title={isStreaming ? 'Stop' : 'Clear'}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Separator */}
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
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {response || (
              <span style={{ color: '#999', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity={0.25}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    opacity={0.75}
                  />
                </svg>
                Thinking...
              </span>
            )}
            {isStreaming && (
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 16,
                  background: '#c54841',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'pulse 1s infinite',
                }}
              />
            )}
          </div>
        )}

        {/* Quick action buttons — shown only when there is no response */}
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

            {/* Keyboard shortcut hint */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#bbb', fontSize: 11 }}>
              <kbd
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  border: '1px solid #ddd',
                  background: '#f5f5f5',
                  fontFamily: 'inherit',
                }}
              >
                Esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        /* Ensure placeholder color in light theme */
        input::placeholder {
          color: #aaa !important;
        }
      `}</style>
    </div>
  )
}

export default OverlayPanel
