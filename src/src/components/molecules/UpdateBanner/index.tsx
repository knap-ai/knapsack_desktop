import { useAppUpdate } from 'src/hooks/useAppUpdate'

export function UpdateBanner() {
  const { updateState: state, restartApp, dismiss, dismissed } = useAppUpdate()

  // Only show the banner when the update is fully downloaded and ready to install,
  // or on error. Everything else (checking, downloading) happens silently.
  if (dismissed || state.status !== 'ready' && state.status !== 'error') {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm bg-red-600 text-white z-50">
      <div className="flex items-center gap-2">
        {state.status === 'ready' && (
          <>
            <span>A new version has been downloaded. Restart to apply.</span>
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
