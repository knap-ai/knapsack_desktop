import { useAppUpdate } from 'src/hooks/useAppUpdate'

export function UpdateBanner() {
  const { updateState: state, startInstall, restartApp, dismiss, dismissed } = useAppUpdate()

  if (state.status === 'idle' || state.status === 'checking' || state.status === 'up-to-date' || dismissed) {
    return null
  }

  // Downloading state: show only the animated progress bar across the top
  if (state.status === 'downloading') {
    return (
      <div className="relative w-full h-1 bg-red-200 overflow-hidden z-50">
        <div
          className="absolute h-full bg-red-600 rounded-r"
          style={{
            width: '40%',
            animation: 'indeterminate 1.5s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes indeterminate {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm bg-red-600 text-white z-50">
      <div className="flex items-center gap-2">
        {state.status === 'available' && (
          <>
            <span>A new version ({state.version}) is available.</span>
            <button
              onClick={startInstall}
              className="px-3 py-1 rounded bg-white text-red-600 font-medium hover:bg-red-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1 rounded border border-white/50 hover:bg-red-500 transition-colors"
            >
              Later
            </button>
          </>
        )}

        {state.status === 'ready' && (
          <>
            <span>Update downloaded. Restart to apply.</span>
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
