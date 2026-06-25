import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'

import KNAnalytics from 'src/utils/KNAnalytics'
import {
  getAutoInstallAppUpdatesEnabled,
  setAutoInstallAppUpdatesEnabled,
} from 'src/utils/settings'

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
  autoInstallEnabled: boolean
  countdownRemainingSec: number | null
  checkForUpdates: () => Promise<void>
  startInstall: () => Promise<void>
  restartApp: () => Promise<void>
  setAutoInstallEnabled: (enabled: boolean) => Promise<void>
  dismiss: () => void
  dismissed: boolean
}

const AUTO_INSTALL_COUNTDOWN_SEC = 60

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null)

export function useAppUpdate() {
  const ctx = useContext(AppUpdateContext)
  if (!ctx) throw new Error('useAppUpdate must be used within AppUpdateProvider')
  return ctx
}

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UpdateStatus>({ status: 'idle' })
  const [autoInstallEnabled, setAutoInstallEnabledState] = useState(true)
  const [countdownRemainingSec, setCountdownRemainingSec] = useState<number | null>(null)
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
      }
    }).then(fn => {
      unlisten = fn
    })

    return () => {
      unlisten?.()
    }
  }, [])

  useEffect(() => {
    getAutoInstallAppUpdatesEnabled()
      .then(setAutoInstallEnabledState)
      .catch(() => {})
  }, [])

  const checkForUpdates = useCallback(async () => {
    setState({ status: 'checking' })
    setDismissed(false)
    try {
      const { shouldUpdate, manifest } = await checkUpdate()
      if (shouldUpdate && manifest) {
        KNAnalytics.trackEvent('update_available', {
          from_version: KNAnalytics.APP_VERSION,
          to_version: manifest.version,
          timestamp: new Date().toISOString(),
        })
        setState({ status: 'available', version: manifest.version })
      } else {
        setState({ status: 'up-to-date' })
      }
    } catch (err) {
      const msg = String(err)
      const friendlyMsg = msg.includes('fetch') || msg.includes('release JSON') || msg.includes('network')
        ? 'Could not reach the update server. Check your connection and try again.'
        : msg
      setState({ status: 'error', message: friendlyMsg })
    }
  }, [])

  // startInstall is kept for explicit user-initiated installs (without relaunch)
  const startInstall = useCallback(async () => {
    setState({ status: 'downloading' })
    try {
      await installUpdate()
      setState({ status: 'ready' })
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [])

  // restartApp installs (if not already done) and immediately relaunches.
  // installUpdate() replaces the binary on disk — calling relaunch() after any
  // delay causes "No such file or directory" on macOS because the old binary
  // path is gone.  Doing both in one atomic sequence avoids that race.
  const restartApp = useCallback(async () => {
    const targetVersion = state.status === 'available' ? state.version : undefined
    KNAnalytics.trackEvent('update_install_initiated', {
      from_version: KNAnalytics.APP_VERSION,
      to_version: targetVersion,
      timestamp: new Date().toISOString(),
    })
    setState({ status: 'downloading' })
    try {
      await installUpdate()
      await relaunch()
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [state])

  const setAutoInstallEnabled = useCallback(async (enabled: boolean) => {
    setAutoInstallEnabledState(enabled)
    await setAutoInstallAppUpdatesEnabled(enabled)
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setCountdownRemainingSec(null)
  }, [])

  useEffect(() => {
    if (state.status === 'available') {
      setDismissed(false)
      if (autoInstallEnabled) {
        setCountdownRemainingSec(prev => prev ?? AUTO_INSTALL_COUNTDOWN_SEC)
      } else {
        setCountdownRemainingSec(null)
      }
      return
    }

    setCountdownRemainingSec(null)
  }, [autoInstallEnabled, state.status])

  useEffect(() => {
    if (
      !autoInstallEnabled ||
      dismissed ||
      state.status !== 'available' ||
      countdownRemainingSec === null
    ) {
      return
    }

    if (countdownRemainingSec <= 0) {
      void restartApp()
      return
    }

    const timer = window.setInterval(() => {
      setCountdownRemainingSec(prev => (prev === null ? null : prev - 1))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [autoInstallEnabled, countdownRemainingSec, dismissed, restartApp, state.status])

  // Auto-check on mount — only checks, does NOT install.
  // Installing and relaunching must happen together (see restartApp).
  useEffect(() => {
    checkForUpdates()
  }, [])

  return (
    <AppUpdateContext.Provider
      value={{
        updateState: state,
        autoInstallEnabled,
        countdownRemainingSec,
        checkForUpdates,
        startInstall,
        restartApp,
        setAutoInstallEnabled,
        dismiss,
        dismissed,
      }}
    >
      {children}
    </AppUpdateContext.Provider>
  )
}
