import { useCallback, useEffect, useState } from 'react'

import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'

import KNAnalytics from 'src/utils/KNAnalytics'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

export function UpdateBanner() {
  const [state, setState] = useState<UpdateState>({ status: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      try {
        const { shouldUpdate, manifest } = await checkUpdate()
        if (!cancelled && shouldUpdate && manifest) {
          setState({ status: 'available', version: manifest.version })
          KNAnalytics.trackEvent('update_available', {
            version: manifest.version,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Update check failed:', err)
      }
    }

    check()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let unlisten: (() => void) | undefined

    onUpdaterEvent(({ error, status }) => {
      if (error) {
        setState({ status: 'error', message: error })
        KNAnalytics.trackEvent('update_error', {
          error,
          timestamp: new Date().toISOString(),
        })
      } else {
        KNAnalytics.trackEvent('update_' + status.toLowerCase(), {
          timestamp: new Date().toISOString(),
        })

        if (status === 'DONE') {
          setState({ status: 'ready' })
        }
      }
    }).then(fn => {
      unlisten = fn
    })

    return () => {
      unlisten?.()
    }
  }, [])

  const handleInstall = useCallback(async () => {
    setState({ status: 'downloading' })
    try {
      await installUpdate()
      // onUpdaterEvent will fire with DONE status and set state to 'ready'
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  const handleRestart = useCallback(async () => {
    await relaunch()
  }, [])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  if (state.status === 'idle' || dismissed) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm bg-blue-600 text-white z-50">
      <div className="flex items-center gap-2">
        {state.status === 'available' && (
          <>
            <span>A new version ({state.version}) is available.</span>
            <button
              onClick={handleInstall}
              className="px-3 py-1 rounded bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-blue-500 transition-colors"
            >
              Later
            </button>
          </>
        )}

        {state.status === 'downloading' && (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
            <span>Downloading update...</span>
          </>
        )}

        {state.status === 'ready' && (
          <>
            <span>Update downloaded. Restart to apply.</span>
            <button
              onClick={handleRestart}
              className="px-3 py-1 rounded bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              Restart Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-blue-500 transition-colors"
            >
              Later
            </button>
          </>
        )}

        {state.status === 'error' && (
          <>
            <span>Update failed: {state.message}</span>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-blue-500 transition-colors"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  )
}
