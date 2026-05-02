import { useAppUpdate } from 'src/hooks/useAppUpdate'

export function UpdateBanner() {
  const { updateState: state, restartApp, dismiss, dismissed } = useAppUpdate()

  // Show when an update is available (to install+restart) or on error.
  // 'downloading' shows a transient "Installing…" state while restartApp runs.
  const visible =
    !dismissed &&
    (state.status === 'available' ||
      state.status === 'ready' ||
      state.status === 'downloading' ||
      state.status === 'error')

  if (!visible) return null

  return (
    <div className="flex items-center justify-center px-4 py-2 text-sm bg-red-600 text-white z-50">
      <div className="flex items-center gap-2">
        {(state.status === 'available' || state.status === 'ready') && (
          <>
            <span>
              {state.status === 'available' && 'version' in state
                ? `Update available (v${state.version}). Restart to install.`
                : 'A new version is ready. Restart to apply.'}
            </span>
            <button
              onClick={restartApp}
              className="px-3 py-1 rounded bg-white text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              Restart Now
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-red-500 transition-colors"
            >
              Later
            </button>
          </>
        )}

        {state.status === 'downloading' && (
          <span>Installing update…</span>
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
