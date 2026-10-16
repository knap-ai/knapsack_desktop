import { useEffect } from 'react'
import { useAppUpdate } from 'src/hooks/useAppUpdate'

export function UpdateBanner() {
  const {
    updateState: state,
    autoInstallEnabled,
    countdownRemainingSec,
    restartApp,
    dismiss,
    dismissed,
  } = useAppUpdate()

  useEffect(() => {
    if (state.status !== 'up-to-date' || state.source !== 'user') return
    const timer = window.setTimeout(dismiss, 5000)
    return () => window.clearTimeout(timer)
  }, [dismiss, state])

  // User-triggered checks show explicit progress/completion. Automatic startup
  // checks stay quiet unless an update or error needs attention.
  // 'downloading' shows a transient "Installing…" state while restartApp runs.
  const visible =
    !dismissed &&
    ((state.status === 'checking' && state.source === 'user') ||
      (state.status === 'up-to-date' && state.source === 'user') ||
      state.status === 'available' ||
      state.status === 'ready' ||
      state.status === 'downloading' ||
      state.status === 'error')

  if (!visible) return null

  return (
    <div className="flex items-center justify-center px-4 py-2 text-sm bg-red-600 text-white z-50">
      <div className="flex items-center gap-2">
        {state.status === 'checking' && <span>Checking for Knapsack updates…</span>}

        {state.status === 'up-to-date' && (
          <>
            <span>Knapsack is up to date.</span>
            <button onClick={dismiss} className="px-3 py-1 rounded border border-white/50 hover:bg-red-500 transition-colors">Dismiss</button>
          </>
        )}

        {(state.status === 'available' || state.status === 'ready') && (
          <>
            <span>
              {state.status === 'available' && 'version' in state
                ? autoInstallEnabled && countdownRemainingSec !== null
                  ? `Update available (v${state.version}). Knapsack will install it automatically in ${countdownRemainingSec}s.`
                  : `Update available (v${state.version}). Restart to install.`
                : 'A new version is ready. Restart to apply.'}
            </span>
            <button
              onClick={restartApp}
              className="px-3 py-1 rounded bg-white text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              Install Now
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-red-500 transition-colors"
            >
              {autoInstallEnabled ? 'Skip This Time' : 'Later'}
            </button>
          </>
        )}

        {state.status === 'downloading' && (
          <span>
            Downloading and installing update… This can take several minutes. Knapsack will restart
            when it finishes.
          </span>
        )}

        {state.status === 'error' && (
          <>
            <span>Update failed: {state.message}</span>
            <button
              onClick={dismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-red-500 transition-colors"
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  )
}
