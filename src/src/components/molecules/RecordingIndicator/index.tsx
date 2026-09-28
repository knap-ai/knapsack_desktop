import { useCallback, useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'
import { isRecordingStatus } from 'src/api/recording'

function RecordingIndicator() {
  const [elapsed, setElapsed] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [stopPending, setStopPending] = useState(false)
  const [stopError, setStopError] = useState<string | null>(null)

  // Listen for recording start/stop events from the main window
  useEffect(() => {
    let disposed = false
    let checking = false
    let captureEpoch = 0
    const refresh = async () => {
      if (checking) return
      checking = true
      const epoch = captureEpoch
      try {
        const status = await isRecordingStatus()
        if (disposed || epoch !== captureEpoch || !status) return
        const active = status.isRecording && !status.isStarting && !status.isStopping
        setIsActive(active)
        if (!active) await invoke('hide_recording_indicator')
      } catch {
        // A transient status failure is not evidence that capture stopped.
      } finally {
        checking = false
      }
    }
    const unlistenStart = listen('recording-indicator-show', () => {
      captureEpoch += 1
      setElapsed(0)
      setStopError(null)
      void refresh()
    })
    const unlistenStop = listen('recording-indicator-hide', () => {
      setIsActive(false)
      void invoke('hide_recording_indicator')
    })
    void refresh()
    const statusInterval = setInterval(refresh, 1000)
    return () => {
      disposed = true
      clearInterval(statusInterval)
      unlistenStart.then(fn => fn())
      unlistenStop.then(fn => fn())
    }
  }, [])

  // Timer that counts up while visible
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

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

  const handleStop = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (stopPending) return
    setStopPending(true)
    setStopError(null)
    try {
      // The native command resolves the active thread and opens it before
      // requesting Stop. A chat/sidebar route need not have a meeting listener.
      await invoke('emit_stop_events')
    } catch (error) {
      setStopError(`Could not stop recording: ${String(error)}`)
    } finally {
      setStopPending(false)
    }
  }, [stopPending])

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
          disabled={stopPending}
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
          title={stopError || (stopPending ? 'Opening recording…' : 'Stop recording')}
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
