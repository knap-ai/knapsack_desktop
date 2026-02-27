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
        const res = await fetch(KN_API_STREAM_LLM_COMPLETE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
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
    <div className="flex flex-col w-full h-full items-center">
      <div
        className="w-full max-w-[680px] rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(30, 30, 30, 0.88)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45), 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Input area */}
        <div className="flex items-center px-4 h-[72px]">
          {/* Search icon */}
          <svg
            className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Knapsack anything..."
            autoFocus
            className="flex-1 bg-transparent text-white text-lg font-light outline-none placeholder-gray-500"
            style={{ fontSize: '18px', fontFamily: 'var(--font-inter)' }}
          />

          {/* Stop / clear button when streaming or has response */}
          {(isStreaming || hasResponse) && (
            <button
              onClick={resetOverlay}
              className="ml-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title={isStreaming ? 'Stop' : 'Clear'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Separator — always visible below the input */}
        <div className="mx-4 border-t border-white/10" />

        {/* Response area */}
        {hasResponse && (
          <div
            ref={responseRef}
            className="px-4 pt-3 pb-4 text-gray-200 text-sm leading-relaxed overflow-y-auto"
            style={{
              maxHeight: `${MAX_RESPONSE_HEIGHT}px`,
              fontFamily: 'var(--font-inter)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {response || (
              <span className="text-gray-500 inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Thinking...
              </span>
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </div>
        )}

        {/* Quick action buttons — shown only when there is no response */}
        {!hasResponse && (
          <div className="flex items-center gap-2 px-4 py-2.5">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                {action.label}
              </button>
            ))}

            {/* Keyboard shortcut hint */}
            <div className="ml-auto flex items-center gap-1 text-gray-600 text-xs">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-gray-700 bg-gray-800/50">
                Esc
              </kbd>
              <span>to close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OverlayPanel
