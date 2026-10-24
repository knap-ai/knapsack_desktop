import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import KNAnalytics from 'src/utils/KNAnalytics'
import {
  getAutoInstallAppUpdatesEnabled,
  setAutoInstallAppUpdatesEnabled,
} from 'src/utils/settings'

import { invoke } from '@tauri-apps/api'
import { platform } from '@tauri-apps/api/os'
import { relaunch } from '@tauri-apps/api/process'
import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { listen } from '@tauri-apps/api/event'
import { getAppVersion } from 'src/utils/app'
import {
  checkAppUpdateStatus,
  installAppUpdate,
  normalizeAppVersion,
} from 'src/utils/appUpdate'

export type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking'; source: 'automatic' | 'user' }
  | { status: 'up-to-date'; source: 'automatic' | 'user' }
  | { status: 'available'; version: string }
  | { status: 'downloading' }
  | { status: 'ready' }
  | { status: 'error'; message: string }

type AppUpdateContextValue = {
  updateState: UpdateStatus
  autoInstallEnabled: boolean
  countdownRemainingSec: number | null
  checkForUpdates: (source?: 'automatic' | 'user') => Promise<void>
  startInstall: () => Promise<void>
  restartApp: () => Promise<void>
  setAutoInstallEnabled: (enabled: boolean) => Promise<void>
  dismiss: () => void
  dismissed: boolean
}

const AUTO_INSTALL_COUNTDOWN_SEC = 60
const AUTO_INSTALL_RETRY_COOLDOWN_MS = 30 * 60 * 1000
const AUTO_INSTALL_SNOOZE_KEY = 'kn_auto_install_update_snooze'
const LOCAL_QA_SAFE = import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE === '1'

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null)

async function prepareNativeUpdateInstall() {
  if ((await platform()) !== 'darwin') {
    return
  }
  await invoke('kn_prepare_updater_temp_dir')
}

function readAutoInstallSnooze(): { version: string; until: number } | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(AUTO_INSTALL_SNOOZE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.version === 'string' &&
      parsed.version &&
      typeof parsed?.until === 'number'
    ) {
      return parsed
    }
  } catch {
    // Ignore malformed persisted state.
  }

  return null
}

function writeAutoInstallSnooze(
  version: string,
  until = Date.now() + AUTO_INSTALL_RETRY_COOLDOWN_MS,
) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      AUTO_INSTALL_SNOOZE_KEY,
      JSON.stringify({ version: normalizeAppVersion(version), until }),
    )
  } catch {
    // Ignore storage failures; updater flow still works without persistence.
  }
}

function clearAutoInstallSnooze() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(AUTO_INSTALL_SNOOZE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function isAutoInstallSnoozed(version: string): boolean {
  const snooze = readAutoInstallSnooze()
  if (!snooze) {
    return false
  }

  if (snooze.until <= Date.now()) {
    clearAutoInstallSnooze()
    return false
  }

  return normalizeAppVersion(snooze.version) === normalizeAppVersion(version)
}

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
  const installInFlightRef = useRef(false)
  const checkInFlightRef = useRef(false)
  const checkSourceRef = useRef<'automatic' | 'user'>('automatic')

  // Listen to updater events
  useEffect(() => {
    if (LOCAL_QA_SAFE) return
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
    if (LOCAL_QA_SAFE) {
      setAutoInstallEnabledState(false)
      return
    }
    getAutoInstallAppUpdatesEnabled()
      .then(setAutoInstallEnabledState)
      .catch(() => {})
  }, [])

  const checkForUpdates = useCallback(async (source: 'automatic' | 'user' = 'user') => {
    if (LOCAL_QA_SAFE) return
    if (checkInFlightRef.current) {
      // A tray/settings click during the startup check must still surface the
      // in-flight check and its final up-to-date result to the user.
      if (source === 'user') {
        checkSourceRef.current = 'user'
        setState(current => current.status === 'checking'
          ? { status: 'checking', source: 'user' }
          : current)
        setDismissed(false)
      }
      return
    }
    checkInFlightRef.current = true
    checkSourceRef.current = source
    setState({ status: 'checking', source })
    setDismissed(false)
    try {
      const result = await checkAppUpdateStatus(await getAppVersion(), checkUpdate)
      if (result.status === 'available') {
        KNAnalytics.trackEvent('update_available', {
          from_version: KNAnalytics.APP_VERSION,
          to_version: result.version,
          timestamp: new Date().toISOString(),
        })
        setState(result)
      } else {
        clearAutoInstallSnooze()
        setState({ status: 'up-to-date', source: checkSourceRef.current })
      }
    } catch (err) {
      const msg = String(err)
      const friendlyMsg =
        msg.includes('fetch') || msg.includes('release JSON') || msg.includes('network')
          ? 'Could not reach the update server. Check your connection and try again.'
          : msg
      setState({ status: 'error', message: friendlyMsg })
    } finally {
      checkInFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    const unlisten = listen('check_for_updates', () => {
      void checkForUpdates('user')
    })
    return () => { unlisten.then(stop => stop()) }
  }, [checkForUpdates])

  const runInstall = useCallback(async (targetVersion?: string) => {
    if (LOCAL_QA_SAFE) throw new Error('App updates are disabled in synthetic QA')
    if (installInFlightRef.current) {
      return
    }

    installInFlightRef.current = true
    setState({ status: 'downloading' })

    try {
      // Do not impose a JavaScript timeout here. Tauri's native updater cannot
      // be cancelled by abandoning this promise, and large signed macOS builds
      // can legitimately take several minutes to download, verify, and replace.
      // A timeout would leave the native install running while skipping the
      // relaunch below, so the old version would remain open indefinitely.
      await installAppUpdate(prepareNativeUpdateInstall, installUpdate)
    } catch (err) {
      if (targetVersion) {
        writeAutoInstallSnooze(targetVersion)
      }
      throw err
    } finally {
      installInFlightRef.current = false
    }
  }, [])

  // startInstall is kept for explicit user-initiated installs (without relaunch)
  const startInstall = useCallback(async () => {
    try {
      const targetVersion = state.status === 'available' ? state.version : undefined
      await runInstall(targetVersion)
      clearAutoInstallSnooze()
      setState({ status: 'ready' })
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [runInstall, state])

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
    try {
      await runInstall(targetVersion)
      clearAutoInstallSnooze()
      await relaunch()
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }, [runInstall, state])

  const setAutoInstallEnabled = useCallback(async (enabled: boolean) => {
    if (LOCAL_QA_SAFE) return
    setAutoInstallEnabledState(enabled)
    await setAutoInstallAppUpdatesEnabled(enabled)
  }, [])

  const dismiss = useCallback(() => {
    if (autoInstallEnabled && state.status === 'available') {
      writeAutoInstallSnooze(state.version)
    }
    setDismissed(true)
    setCountdownRemainingSec(null)
  }, [autoInstallEnabled, state])

  useEffect(() => {
    if (state.status === 'available') {
      setDismissed(false)
      if (autoInstallEnabled && !isAutoInstallSnoozed(state.version)) {
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
    if (LOCAL_QA_SAFE) return
    void checkForUpdates('automatic')
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
