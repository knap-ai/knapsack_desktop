import { useCallback, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { emit, listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'

function RecordingIndicator() {
  const [elapsed, setElapsed] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Listen for recording start/stop events from the main window
  useEffect(() => {
    const unlistenStart = listen('recording-indicator-show', () => {
      setElapsed(0)
    })
    const unlistenStop = listen('recording-indicator-hide', () => {
      invoke('hide_recording_indicator')
    })
    return () => {
      unlistenStart.then(fn => fn())
      unlistenStop.then(fn => fn())
    }
  }, [])

  // Timer that counts up while visible
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Allow dragging the pill around the screen
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    setIsDragging(true)
    appWindow.startDragging()
  }, [])

  const handleClick = useCallback(() => {
    if (!isDragging) {
      invoke('kn_show_app')
    }
    setIsDragging(false)
  }, [isDragging])

  const handleStop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    invoke('emit_event', {
      event: 'stop-recording-from-indicator',
      payload: {},
    }).catch(() => {
      emit('stop-recording-from-indicator')
    })
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        cursor: 'grab',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 16px 8px 12px',
          borderRadius: 24,
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          fontFamily: "'Inter', -apple-system, sans-serif",
          userSelect: 'none',
        }}
      >
        {/* Knapsack logo */}
        <img
          src="/assets/images/knap-logo-medium.png"
          alt="Knapsack"
          style={{ width: 20, height: 20, flexShrink: 0 }}
        />

        {/* Animated waveform bars */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: 20,
          }}
        >
          {[0, 150, 300, 450, 600].map((delay) => (
            <span
              key={delay}
              style={{
                width: 3,
                borderRadius: 2,
                background: '#6B7A2F',
                animation: `waveform-bounce 1.2s ease-in-out ${delay}ms infinite`,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#333333',
            fontVariantNumeric: 'tabular-nums',
            minWidth: 38,
          }}
        >
          {formatElapsed(elapsed)}
        </span>

        {/* Stop button */}
        <button
          onClick={handleStop}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
          }}
          title="Stop recording"
        >
          <span
            style={{
              display: 'block',
              width: 8,
              height: 8,
              borderRadius: 1,
              background: '#ffffff',
            }}
          />
        </button>
      </div>

      <style>{`
        @keyframes waveform-bounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </div>
  )
}

export default RecordingIndicator
