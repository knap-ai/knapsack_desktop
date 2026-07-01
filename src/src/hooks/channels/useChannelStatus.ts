import * as Sentry from '@sentry/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChannelStatus,
  getWhatsAppStatus,
  getIMessageStatus,
  getTelegramStatus,
  getGenericChannelStatus,
  enableWhatsApp,
  enableIMessage,
  configureTelegram,
  validateTelegramToken,
  configureGenericChannel,
  startWhatsAppLogin,
  waitWhatsAppLogin,
  relinkWhatsApp,
  loginWhatsAppPhone,
  disconnectWhatsApp,
  disconnectIMessage,
  disconnectTelegram,
  disconnectGenericChannel,
  setupIMessage,
  openFullDiskAccess,
  runChannelDiagnostics,
} from 'src/api/channels'
import KNAnalytics from 'src/utils/KNAnalytics'

/** Channel names supported via the generic endpoint. */
export const GENERIC_CHANNELS = ['slack', 'discord', 'signal', 'irc', 'googlechat'] as const
export type GenericChannelName = typeof GENERIC_CHANNELS[number]

export interface ChannelStates {
  whatsapp: ChannelStatus | null
  imessage: ChannelStatus | null
  telegram: ChannelStatus | null
  /** Status for generic channels (slack, discord, signal, irc, googlechat). */
  genericChannels: Record<GenericChannelName, ChannelStatus | null>
  loading: boolean
  error: string | null
  /** Per-channel error messages for inline display. */
  channelErrors: Record<string, string | null>
  /** Base64 data URL for the WhatsApp QR code, if login is in progress. */
  whatsappQrUrl: string | null
  /** 8-character pairing code for phone-number linking (alternative to QR). */
  whatsappPairingCode: string | null
  /** True while the backend is waiting for the gateway to restart and
   *  generate a QR code (can take ~10 s due to retry backoff). */
  whatsappLinking: boolean
  /** True while a health check is in progress. */
  healthChecking: boolean
  /** Result of the last gateway health check. */
  gatewayHealthy: boolean | null
  /** True during initial gateway startup — UI should show "Starting..." not error states. */
  gatewayStarting: boolean
}

/** Interval for polling unconfigured channels (30s instead of active interval). */
const UNCONFIGURED_POLL_INTERVAL = 30_000
const GATEWAY_HEALTH_POLL_TIMEOUT_MS = 6500

/** Returns true if a channel status indicates it has been configured/enabled by the user. */
function isChannelConfigured(status: ChannelStatus | null): boolean {
  if (!status) return false
  return !!(status.linked || status.configured || status.enabled)
}

function isChannelActive(status: ChannelStatus | null): boolean {
  if (!status) return false
  return !!(status.active || status.linked)
}

async function fetchGatewayHealthWithTimeout(): Promise<Response> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), GATEWAY_HEALTH_POLL_TIMEOUT_MS)
  try {
    return await fetch('http://127.0.0.1:8897/api/clawd/service/health', {
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

/**
 * Hook that polls WhatsApp, iMessage, and Telegram channel status from the backend.
 *
 * Only polls individual channel status for channels that have been configured.
 * Unconfigured channels are checked at a slower rate (30s) to detect new configs.
 *
 * @param enabled  Pass `false` to suppress polling (e.g. when the dialog is closed).
 * @param intervalMs  Polling interval in ms (default 15 s).
 */
export function useChannelStatus(enabled = true, intervalMs = 15_000) {
  const [whatsapp, setWhatsapp] = useState<ChannelStatus | null>(null)
  const [imessage, setImessage] = useState<ChannelStatus | null>(null)
  const [telegram, setTelegram] = useState<ChannelStatus | null>(null)
  const [genericChannels, setGenericChannels] = useState<Record<GenericChannelName, ChannelStatus | null>>(
    () => Object.fromEntries(GENERIC_CHANNELS.map(c => [c, null])) as Record<GenericChannelName, ChannelStatus | null>
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channelErrors, setChannelErrors] = useState<Record<string, string | null>>({})
  const [whatsappQrUrl, setWhatsappQrUrl] = useState<string | null>(null)
  const [whatsappPairingCode, setWhatsappPairingCode] = useState<string | null>(null)
  const [whatsappLinking, setWhatsappLinking] = useState(false)
  const [healthChecking, setHealthChecking] = useState(false)
  const [gatewayHealthy, setGatewayHealthy] = useState<boolean | null>(null)
  /** True while the gateway is initializing on first launch. */
  const [gatewayStarting, setGatewayStarting] = useState(true)
  /** Bot username returned by Telegram getMe, e.g. "mybot". */
  const [telegramBotUsername, setTelegramBotUsername] = useState<string | null>(null)

  // Track whether a QR wait is already in flight so we don't double-fire.
  const qrWaitActiveRef = useRef(false)

  const setChannelError = (channel: string, msg: string | null) => {
    setChannelErrors(prev => ({ ...prev, [channel]: msg }))
  }

  // Track previous JSON snapshots so we only trigger re-renders when data
  // actually changes.  This prevents the parent component (ClawdChat) from
  // re-rendering on every poll cycle, which was causing typing input lag.
  const prevJsonRef = useRef<Record<string, string>>({})

  // Track the last time we did a full poll (including unconfigured channels)
  const lastFullPollRef = useRef(0)

  // Track consecutive gateway-down polls for reconnect detection (Fix 5)
  const gwDownCountRef = useRef(0)

  // Track the previous gateway-up state to detect transitions for Amplitude events.
  const gwWasUpRef = useRef<boolean | null>(null)
  // Avoid sending duplicate Sentry alerts for the same outage within a session.
  const sentryCrashAlertedRef = useRef(false)

  // Track whether we've run diagnostics since gateway came up.
  // This ensures sandbox tools + model are repaired after a config reset
  // even if the user doesn't manually reconnect a channel.
  const diagRanRef = useRef(false)

  // Track whether we've run the Telegram getMe startup validation.
  // We do this once per session so we can restore the bot username
  // and verify the saved token is still valid on app relaunch.
  const tgValidatedRef = useRef(false)
  // Prevent overlapping poll cycles from piling up local HTTP requests when
  // the backend is slow or timing out. Coalesce extra refresh requests into a
  // single follow-up pass instead of running them concurrently.
  const refreshInFlightRef = useRef(false)
  const refreshQueuedRef = useRef(false)

  // Use refs to track current channel states for smart-polling decisions.
  // This avoids putting state variables in `refresh`'s dependency array,
  // which was causing the callback identity to change on every poll cycle
  // and restarting the polling interval (double-poll + interval drift).
  const whatsappRef = useRef(whatsapp)
  whatsappRef.current = whatsapp
  const imessageRef = useRef(imessage)
  imessageRef.current = imessage
  const telegramRef = useRef(telegram)
  telegramRef.current = telegram
  const genericChannelsRef = useRef(genericChannels)
  genericChannelsRef.current = genericChannels

  const runRefreshCycle = useCallback(async () => {
    // Only show loading indicator on the very first fetch, not background polls.
    // Toggling loading on every poll caused 2 extra parent re-renders per cycle.
    const isFirstLoad = prevJsonRef.current._initialized !== 'true'
    if (isFirstLoad) setLoading(true)
    // Only clear error if there was one — avoid unnecessary re-renders on every poll
    setError(prev => prev === null ? prev : null)
    try {
      // Quick gateway health check first — if gateway is down, skip the
      // expensive per-channel status polls which each timeout after 10-20s.
      let gwOk = false
      try {
        const hRes = await fetchGatewayHealthWithTimeout()
        if (hRes.ok) {
          const hData = await hRes.json()
          gwOk = !!hData.gateway_ok
          setGatewayHealthy(gwOk)
        } else {
          // Backend returned an error — gateway is not reachable
          setGatewayHealthy(false)
        }
      } catch {
        // Rust backend itself is unreachable — gateway definitely not ok
        setGatewayHealthy(false)
      }

      if (!gwOk) {
        gwDownCountRef.current++
        if (isFirstLoad) setLoading(false)
        prevJsonRef.current._initialized = 'true'
        // Keep gatewayStarting true briefly so UI shows "Starting..." instead
        // of "DOWN" during initial startup.  After 2 failed polls (~30s) transition
        // to the troubleshooting view so the user gets actionable feedback sooner.
        if (gwDownCountRef.current >= 2) {
          setGatewayStarting(false)
        }

        // Detect gateway-down transition for Amplitude + Sentry.
        const wasUp = gwWasUpRef.current
        gwWasUpRef.current = false
        if (wasUp === true) {
          // Gateway just went from up → down (crash or disconnect).
          KNAnalytics.trackEvent('gateway_status_changed', { status: 'down', cause: 'transition_up_to_down' })
          sentryCrashAlertedRef.current = false // allow a new alert for this outage
        }

        // After 3 consecutive down polls (~45s), fire a Sentry alert with
        // diagnostic details so on-call can investigate early.
        if (gwDownCountRef.current === 3 && !sentryCrashAlertedRef.current) {
          sentryCrashAlertedRef.current = true
          fetchGatewayHealthWithTimeout()
            .then(r => r.json())
            .then((data: { message?: string; diagnostic_type?: string }) => {
              const diagType = data.diagnostic_type ?? 'unknown'
              const snippet = (data.message ?? '').slice(0, 500)
              Sentry.withScope(scope => {
                scope.setTag('gateway_crash_type', diagType)
                scope.setTag('component', 'gateway')
                scope.setExtra('health_message', snippet)
                scope.setExtra('polls_down', gwDownCountRef.current)
                Sentry.captureException(
                  new Error(`Gateway unreachable after 3 polls — type=${diagType}`)
                )
              })
              KNAnalytics.trackEvent('gateway_startup_failed', {
                diagnostic_type: diagType,
                polls_down: gwDownCountRef.current,
                is_first_load: isFirstLoad,
              })
            })
            .catch(() => {
              // Backend itself unreachable — fire a generic alert
              Sentry.captureException(new Error('Gateway unreachable — Tauri backend also not responding'))
              KNAnalytics.trackEvent('gateway_startup_failed', {
                diagnostic_type: 'backend_unreachable',
                polls_down: gwDownCountRef.current,
                is_first_load: isFirstLoad,
              })
            })
        }

        return
      }

      // Gateway is up — reset down counter and clear starting state
      const prevGwState = gwWasUpRef.current
      gwDownCountRef.current = 0
      gwWasUpRef.current = true
      sentryCrashAlertedRef.current = false
      setGatewayStarting(false)

      if (prevGwState === false) {
        // Gateway recovered after being down — track the recovery.
        KNAnalytics.trackEvent('gateway_status_changed', { status: 'up', cause: 'recovered' })
      }

      // Read current state from refs (not closure) to avoid dependency churn
      const curWhatsapp = whatsappRef.current
      const curImessage = imessageRef.current
      const curTelegram = telegramRef.current
      const curGeneric = genericChannelsRef.current

      // Determine which channels need polling this cycle.
      // Configured channels: poll every cycle. Unconfigured: poll every 30s.
      const now = Date.now()
      const doFullPoll = isFirstLoad || (now - lastFullPollRef.current >= UNCONFIGURED_POLL_INTERVAL)
      if (doFullPoll) lastFullPollRef.current = now

      // Build promise array — only poll configured channels on fast path
      const waConfigured = isChannelConfigured(curWhatsapp)
      const imConfigured = isChannelConfigured(curImessage)
      const tgConfigured = isChannelConfigured(curTelegram)

      const promises: Promise<ChannelStatus | null>[] = [
        (waConfigured || doFullPoll) ? getWhatsAppStatus().catch(() => null) : Promise.resolve(curWhatsapp),
        (imConfigured || doFullPoll) ? getIMessageStatus().catch(() => null) : Promise.resolve(curImessage),
        (tgConfigured || doFullPoll) ? getTelegramStatus().catch(() => null) : Promise.resolve(curTelegram),
      ]

      // Generic channels: only poll configured ones (or all on full poll)
      const genericPromises = GENERIC_CHANNELS.map(ch => {
        const configured = isChannelConfigured(curGeneric[ch])
        return (configured || doFullPoll)
          ? getGenericChannelStatus(ch).catch(() => null)
          : Promise.resolve(curGeneric[ch])
      })

      const [wa, im, tg, ...genericResults] = await Promise.all([...promises, ...genericPromises])

      // Only update state when data actually changed (compare JSON snapshots).
      // This avoids re-rendering the parent on every poll when nothing changed.
      const waJson = JSON.stringify(wa)
      if (waJson !== prevJsonRef.current.wa) {
        prevJsonRef.current.wa = waJson
        setWhatsapp(wa)
      }
      const imJson = JSON.stringify(im)
      if (imJson !== prevJsonRef.current.im) {
        prevJsonRef.current.im = imJson
        setImessage(im)
      }
      const tgJson = JSON.stringify(tg)
      if (tgJson !== prevJsonRef.current.tg) {
        prevJsonRef.current.tg = tgJson
        setTelegram(tg)
      }

      // Update generic channel states
      const newGeneric: Record<string, ChannelStatus | null> = {}
      GENERIC_CHANNELS.forEach((ch, i) => {
        newGeneric[ch] = genericResults[i]
      })
      const genJson = JSON.stringify(newGeneric)
      if (genJson !== prevJsonRef.current.gen) {
        prevJsonRef.current.gen = genJson
        setGenericChannels(newGeneric as Record<GenericChannelName, ChannelStatus | null>)
      }

      // Surface gateway-level errors per channel — but suppress errors during
      // first launch when no channels are configured (first-run experience).
      const anyConfigured = waConfigured || imConfigured || tgConfigured ||
        GENERIC_CHANNELS.some(ch => isChannelConfigured(curGeneric[ch]))

      const newErrors: Record<string, string | null> = {}
      if (anyConfigured) {
        newErrors.whatsapp = (wa && !wa.success && wa.message) ? wa.message : null
        newErrors.imessage = (im && !im.success && im.message) ? im.message : null
        newErrors.telegram = (tg && !tg.success && tg.message) ? tg.message : null
        GENERIC_CHANNELS.forEach((ch, i) => {
          const status = genericResults[i]
          newErrors[ch] = (status && !status.success && status.message) ? status.message : null
        })
      }
      const errJson = JSON.stringify(newErrors)
      if (errJson !== prevJsonRef.current.err) {
        prevJsonRef.current.err = errJson
        setChannelErrors(newErrors)
      }

      // Clear QR code if WhatsApp is now linked
      if (wa?.linked) {
        setWhatsappQrUrl(null)
        setWhatsappLinking(false)
      }

      // Run diagnostics once when we first detect any connected channel.
      // This auto-repairs missing sandbox tools + model after a config
      // reset, which is the most common cause of "channel shows connected
      // but AI doesn't respond".
      if (!diagRanRef.current) {
        const anyLinked = !!(
          isChannelActive(wa) ||
          isChannelActive(im) ||
          isChannelActive(tg) ||
          genericResults.some(g => isChannelActive(g))
        )
        if (anyLinked) {
          diagRanRef.current = true
          // Fire-and-forget — don't block the poll cycle
          runChannelDiagnostics().then(diag => {
            if (diag.repairs.length > 0) {
              console.info('[useChannelStatus] Auto-repaired on startup:', diag.repairs)
            }
          }).catch(() => {})
        }
      }

      // On first load, re-validate the saved Telegram token via getMe so we
      // can restore the bot username in the UI and detect expired tokens.
      // Fire-and-forget — errors are surfaced as channelErrors.telegram.
      if (!tgValidatedRef.current && isFirstLoad && (tg?.configured || tg?.linked)) {
        tgValidatedRef.current = true
        // Retrieve the saved token from the gateway config so we can call getMe.
        // We read it from the gateway config snapshot that was already fetched.
        // If account is already present (gateway reported it), restore it directly.
        if (tg?.account) {
          const username = tg.account.replace(/^@/, '')
          setTelegramBotUsername(username)
          console.info(`[useChannelStatus] Telegram bot username restored from status: @${username}`)
        } else {
          console.info('[useChannelStatus] Telegram configured but no account in status yet — will retry on next poll')
        }
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch channel status')
    } finally {
      if (isFirstLoad) setLoading(false)
      prevJsonRef.current._initialized = 'true'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      refreshQueuedRef.current = true
      return
    }

    refreshInFlightRef.current = true
    try {
      do {
        refreshQueuedRef.current = false
        await runRefreshCycle()
      } while (refreshQueuedRef.current)
    } finally {
      refreshInFlightRef.current = false
    }
  }, [runRefreshCycle])

  // Always do a single initial fetch so hasAnyChannel / showChannelBanner
  // are populated on mount even when polling is disabled.
  useEffect(() => {
    refresh()
  }, [])

  // Only start the polling interval when explicitly enabled (e.g. channels
  // panel is open).  This avoids background re-renders while the user is
  // typing in the chat input.
  useEffect(() => {
    if (!enabled) return
    refresh() // refresh immediately when the panel opens
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [enabled, intervalMs, refresh])

  // ── Health check ─────────────────────────────────────────

  const checkHealth = useCallback(async () => {
    setHealthChecking(true)
    try {
      const res = await fetch('http://127.0.0.1:8897/api/clawd/service/health')
      if (res.ok) {
        const data = await res.json()
        setGatewayHealthy(!!data.gateway_ok)
        if (data.gateway_ok) setGatewayStarting(false)
      } else {
        setGatewayHealthy(false)
      }
    } catch {
      setGatewayHealthy(false)
    } finally {
      setHealthChecking(false)
    }
  }, [])

  // Run an initial health check when the hook is enabled
  useEffect(() => {
    if (enabled) checkHealth()
  }, [enabled, checkHealth])

  // ── Actions ────────────────────────────────────────────

  // Run diagnostics after channel connect/reconnect to auto-repair missing
  // sandbox tools, model settings, etc.  Without this, channels can show as
  // "connected" but the AI silently fails to respond because sandbox mode
  // blocks the tools it needs (especially after a config reset).
  const triggerDiagnostics = useCallback(async () => {
    try {
      const diag = await runChannelDiagnostics()
      if (diag.repairs.length > 0) {
        console.info('[useChannelStatus] Auto-repaired:', diag.repairs)
      }
      if (diag.issues.length > 0) {
        console.warn('[useChannelStatus] Remaining issues:', diag.issues)
      }
    } catch (e) {
      console.warn('[useChannelStatus] Diagnostics failed:', e)
    }
  }, [])

  const connectWhatsApp = useCallback(async () => {
    setWhatsappQrUrl(null)
    setWhatsappLinking(true)
    setChannelError('whatsapp', null)
    try {
      // Step 1: enable the WhatsApp channel in gateway config
      const enableRes = await enableWhatsApp(true)
      if (!enableRes.success) throw new Error(enableRes.message ?? 'Failed to enable WhatsApp')

      // Step 2: start QR login (backend retries while gateway restarts)
      const loginRes = await startWhatsAppLogin()
      if (!loginRes.success) throw new Error(loginRes.message ?? 'Failed to start WhatsApp login')

      if (loginRes.qrDataUrl) {
        setWhatsappQrUrl(loginRes.qrDataUrl)
        setWhatsappLinking(false)

        // Step 3: Wait for the user to scan the QR code in the background.
        // This calls web.login.wait which blocks until scan completes or timeout.
        if (!qrWaitActiveRef.current) {
          qrWaitActiveRef.current = true
          const qrShownAt = Date.now()
          waitWhatsAppLogin()
            .then(async (waitRes) => {
              if (waitRes.connected) {
                setWhatsappQrUrl(null)
                await refresh()
                // Auto-repair sandbox tools/model after successful connect
                triggerDiagnostics()
              } else {
                // If the wait returned very quickly (< 10 s) the backend likely
                // wasn't ready yet — keep the QR visible so the user can still
                // scan, but surface a note.  Only clear after a real timeout.
                const elapsed = Date.now() - qrShownAt
                if (elapsed < 10_000) {
                  // Backend returned too fast — keep the QR, don't clear it.
                  // The polling refresh() will clear it if the user links.
                  console.warn('[useChannelStatus] login-wait returned in', elapsed, 'ms — keeping QR visible')
                } else {
                  // Genuine timeout — user didn't scan in time
                  setWhatsappQrUrl(null)
                  setChannelError('whatsapp', waitRes.message ?? 'QR code expired. Click Connect to try again.')
                }
              }
            })
            .catch((e: any) => {
              // On error, keep the QR visible if it was shown very recently
              const elapsed = Date.now() - qrShownAt
              if (elapsed >= 10_000) {
                setWhatsappQrUrl(null)
              }
              setChannelError('whatsapp', e?.message ?? 'Login wait failed')
            })
            .finally(() => {
              qrWaitActiveRef.current = false
            })
        }
      } else {
        // No QR returned — check if already linked before giving up
        setWhatsappLinking(false)
        await refresh()
        // If still not linked after refresh, surface an actionable error
        const latest = whatsappRef.current
        if (!latest?.linked) {
          setChannelError('whatsapp', 'Could not generate QR code. Click Connect to try again.')
        }
      }
    } catch (e: any) {
      setChannelError('whatsapp', e.message)
      setWhatsappLinking(false)
    }
  }, [refresh])

  const doDisconnectWhatsApp = useCallback(async () => {
    setChannelError('whatsapp', null)
    try {
      const res = await disconnectWhatsApp()
      if (!res.success) throw new Error(res.message ?? 'Failed to disconnect WhatsApp')
      setWhatsappQrUrl(null)
      setWhatsappLinking(false)
      // Optimistically clear local state and sync the JSON snapshot ref
      // so the next poll doesn't see a phantom "change" and re-set state.
      setWhatsapp(null)
      prevJsonRef.current.wa = JSON.stringify(null)
      // Wait a moment for the gateway to restart after config.patch
      await new Promise(r => setTimeout(r, 2000))
      await refresh()
    } catch (e: any) {
      setChannelError('whatsapp', e.message)
      throw e
    }
  }, [refresh])

  const doRelinkWhatsApp = useCallback(async () => {
    setChannelError('whatsapp', null)
    setWhatsappLinking(true)
    setWhatsappQrUrl(null)
    try {
      const res = await relinkWhatsApp()
      if (!res.success) throw new Error(res.message ?? 'Failed to relink WhatsApp')
      if (res.qrDataUrl) {
        setWhatsappQrUrl(res.qrDataUrl)
        // Clear linked state so QR code is shown
        setWhatsapp(prev => prev ? { ...prev, linked: false } : prev)
        // Start polling for scan completion
        const pollForLink = async () => {
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 3000))
            const status = await getWhatsAppStatus()
            if (status.linked) {
              setWhatsapp(status)
              setWhatsappQrUrl(null)
              setWhatsappLinking(false)
              prevJsonRef.current.wa = JSON.stringify(status)
              // Auto-repair sandbox tools/model after successful relink
              triggerDiagnostics()
              return
            }
          }
          setWhatsappLinking(false)
          setChannelError('whatsapp', 'QR code expired. Click Relink to try again.')
        }
        pollForLink()
      } else {
        setWhatsappLinking(false)
        await refresh()
      }
    } catch (e: any) {
      setChannelError('whatsapp', e.message)
      setWhatsappLinking(false)
      throw e
    }
  }, [refresh])

  const doLoginWithPhone = useCallback(async (phoneNumber: string) => {
    setChannelError('whatsapp', null)
    setWhatsappLinking(true)
    setWhatsappQrUrl(null)
    setWhatsappPairingCode(null)
    try {
      const res = await loginWhatsAppPhone(phoneNumber)
      if (!res.success) throw new Error(res.message ?? 'Failed to start phone pairing')
      if (res.pairingCode) {
        setWhatsappPairingCode(res.pairingCode)
        // Clear linked state so pairing code is shown
        setWhatsapp(prev => prev ? { ...prev, linked: false } : prev)
        // Poll for link completion
        for (let i = 0; i < 40; i++) {
          await new Promise(r => setTimeout(r, 3000))
          const status = await getWhatsAppStatus()
          if (status.linked) {
            setWhatsapp(status)
            setWhatsappPairingCode(null)
            setWhatsappLinking(false)
            prevJsonRef.current.wa = JSON.stringify(status)
            triggerDiagnostics()
            return
          }
        }
        setWhatsappLinking(false)
        setChannelError('whatsapp', 'Pairing timed out. Try again.')
      } else {
        setWhatsappLinking(false)
        await refresh()
      }
    } catch (e: any) {
      setChannelError('whatsapp', e.message)
      setWhatsappLinking(false)
      throw e
    }
  }, [refresh, triggerDiagnostics])

  const connectIMessage = useCallback(async () => {
    setChannelError('imessage', null)
    try {
      const enableRes = await enableIMessage(true)
      if (!enableRes.success) throw new Error(enableRes.message ?? 'Failed to enable iMessage')
      const result = await setupIMessage()
      if (!result.configured) {
        await openFullDiskAccess()
      }
      await refresh()
      // Auto-repair sandbox tools/model after successful connect
      triggerDiagnostics()
    } catch (e: any) {
      setChannelError('imessage', e.message)
    }
  }, [refresh, triggerDiagnostics])

  const doDisconnectIMessage = useCallback(async () => {
    setChannelError('imessage', null)
    try {
      const res = await disconnectIMessage()
      if (!res.success) throw new Error(res.message ?? 'Failed to disconnect iMessage')
      // Optimistically clear local state and sync the JSON snapshot ref
      setImessage(null)
      prevJsonRef.current.im = JSON.stringify(null)
      // Wait a moment for the gateway to restart after config.patch
      await new Promise(r => setTimeout(r, 2000))
      await refresh()
    } catch (e: any) {
      setChannelError('imessage', e.message)
      throw e
    }
  }, [refresh])

  const connectTelegram = useCallback(async (botToken: string) => {
    setChannelError('telegram', null)
    try {
      // Step 1: Validate the token with Telegram's getMe before saving.
      // This gives the user immediate feedback if the token is wrong,
      // and also fetches the bot username to display in the UI.
      console.info('[useChannelStatus] Validating Telegram bot token via getMe...')
      const validation = await validateTelegramToken(botToken).catch(() => null)
      if (validation && !validation.success) {
        throw new Error(validation.message ?? 'Invalid bot token — please check it and try again')
      }
      const botUsername = validation?.bot_username ?? null

      // Step 2: Persist the token via config.patch.
      const res = await configureTelegram(botToken)
      if (!res.success) throw new Error(res.message ?? 'Failed to configure Telegram')

      // Step 3: Update telegram state immediately so the UI reflects the
      // connected state without waiting for the next 30-second full poll.
      // The normal refresh() smart-poll skips unconfigured channels, so we
      // must set state directly here.
      const optimisticStatus: ChannelStatus = {
        success: true,
        enabled: true,
        configured: true,
        linked: true,
        account: botUsername ? `@${botUsername}` : undefined,
      }
      const tgJson = JSON.stringify(optimisticStatus)
      prevJsonRef.current.tg = tgJson
      setTelegram(optimisticStatus)
      if (botUsername) {
        setTelegramBotUsername(botUsername)
        console.info(`[useChannelStatus] Telegram connected as @${botUsername}`)
      }

      // Step 4: Wait for gateway to restart after config.patch, then do a
      // real status poll to confirm the gateway has picked up the new token.
      await new Promise(r => setTimeout(r, 2000))
      const status = await getTelegramStatus().catch(() => null)
      if (status) {
        const newJson = JSON.stringify(status)
        prevJsonRef.current.tg = newJson
        setTelegram(status)
        if (!status.success && status.message) {
          setChannelError('telegram', status.message)
        }
      }

      // Auto-repair sandbox tools/model after successful connect
      triggerDiagnostics()
    } catch (e: any) {
      setChannelError('telegram', e.message)
      throw e
    }
  }, [refresh, triggerDiagnostics])

  const doDisconnectTelegram = useCallback(async () => {
    setChannelError('telegram', null)
    try {
      const res = await disconnectTelegram()
      if (!res.success) throw new Error(res.message ?? 'Failed to disconnect Telegram')
      setTelegram(null)
      prevJsonRef.current.tg = JSON.stringify(null)
      await new Promise(r => setTimeout(r, 2000))
      await refresh()
    } catch (e: any) {
      setChannelError('telegram', e.message)
      throw e
    }
  }, [refresh])

  // ── Generic channel actions ────────────────────────────────

  const connectGenericChannel = useCallback(async (channel: GenericChannelName, config: Record<string, unknown>) => {
    setChannelError(channel, null)
    try {
      const res = await configureGenericChannel(channel, config)
      if (!res.success) throw new Error(res.message ?? `Failed to configure ${channel}`)
      await refresh()
      // Auto-repair sandbox tools/model after successful connect
      triggerDiagnostics()
    } catch (e: any) {
      setChannelError(channel, e.message)
      throw e
    }
  }, [refresh, triggerDiagnostics])

  const doDisconnectGenericChannel = useCallback(async (channel: GenericChannelName) => {
    setChannelError(channel, null)
    try {
      const res = await disconnectGenericChannel(channel)
      if (!res.success) throw new Error(res.message ?? `Failed to disconnect ${channel}`)
      // Optimistically clear this channel's local state and sync snapshot
      setGenericChannels(prev => {
        const next = { ...prev, [channel]: null }
        prevJsonRef.current.gen = JSON.stringify(next)
        return next
      })
      await new Promise(r => setTimeout(r, 2000))
      await refresh()
    } catch (e: any) {
      setChannelError(channel, e.message)
      throw e
    }
  }, [refresh])

  return {
    whatsapp,
    imessage,
    telegram,
    genericChannels,
    loading,
    error,
    channelErrors,
    whatsappQrUrl,
    whatsappPairingCode,
    whatsappLinking,
    healthChecking,
    gatewayHealthy,
    /** True during initial gateway startup — UI should show "Starting..." not "DOWN". */
    gatewayStarting,
    /** Bot username confirmed via getMe, e.g. "mybot" (no @). Null until validated. */
    telegramBotUsername,
    refresh,
    checkHealth,
    connectWhatsApp,
    disconnectWhatsApp: doDisconnectWhatsApp,
    relinkWhatsApp: doRelinkWhatsApp,
    loginWithPhone: doLoginWithPhone,
    connectIMessage,
    disconnectIMessage: doDisconnectIMessage,
    connectTelegram,
    disconnectTelegram: doDisconnectTelegram,
    connectGenericChannel,
    disconnectGenericChannel: doDisconnectGenericChannel,
  }
}
