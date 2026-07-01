import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { invoke } from '@tauri-apps/api'
import { platform } from '@tauri-apps/api/os'
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

async function prepareNativeUpdateInstall() {
  if ((await platform()) !== 'darwin') {
    return
  }
  await invoke('kn_prepare_updater_temp_dir')
}

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
      await prepareNativeUpdateInstall()
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
      await prepareNativeUpdateInstall()
      await installUpdate()
      await relaunch()
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [state])

  const dismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  // Auto-check on mount — only checks, does NOT install.
  // Installing and relaunching must happen together (see restartApp).
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
