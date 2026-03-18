import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'

import KNAnalytics from 'src/utils/KNAnalytics'

export type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'up-to-date' }
  | { status: 'available'; version: string }
  | { status: 'downloading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

type AppUpdateContextValue = {
  updateState: UpdateStatus
  checkForUpdates: () => Promise<void>
  startInstall: () => Promise<void>
  restartApp: () => Promise<void>
  dismiss: () => void
  dismissed: boolean
}

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null)

export function useAppUpdate() {
  const ctx = useContext(AppUpdateContext)
  if (!ctx) throw new Error('useAppUpdate must be used within AppUpdateProvider')
  return ctx
}

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UpdateStatus>({ status: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  // Listen to updater events
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

  const checkForUpdates = useCallback(async () => {
    setState({ status: 'checking' })
    setDismissed(false)
    try {
      const { shouldUpdate, manifest } = await checkUpdate()
      if (shouldUpdate && manifest) {
        setState({ status: 'available', version: manifest.version })
        KNAnalytics.trackEvent('update_available', {
          version: manifest.version,
          timestamp: new Date().toISOString(),
        })
      } else {
        setState({ status: 'up-to-date' })
      }
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  const startInstall = useCallback(async () => {
    setState({ status: 'downloading' })
    try {
      await installUpdate()
      // onUpdaterEvent will fire with DONE and set state to 'ready'
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  const restartApp = useCallback(async () => {
    await relaunch()
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  // Auto-check on mount
  useEffect(() => {
    checkForUpdates()
  }, [])

  return (
    <AppUpdateContext.Provider
      value={{ updateState: state, checkForUpdates, startInstall, restartApp, dismiss, dismissed }}
    >
      {children}
    </AppUpdateContext.Provider>
  )
}
