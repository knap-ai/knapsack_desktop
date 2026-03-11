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
  configureGenericChannel,
  startWhatsAppLogin,
  waitWhatsAppLogin,
  disconnectWhatsApp,
  disconnectIMessage,
  disconnectTelegram,
  disconnectGenericChannel,
  setupIMessage,
  openFullDiskAccess,
} from 'src/api/channels'

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

/** Returns true if a channel status indicates it has been configured/enabled by the user. */
function isChannelConfigured(status: ChannelStatus | null): boolean {
  if (!status) return false
  return !!(status.linked || status.configured || status.enabled)
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
  const [whatsappLinking, setWhatsappLinking] = useState(false)
  const [healthChecking, setHealthChecking] = useState(false)
  const [gatewayHealthy, setGatewayHealthy] = useState<boolean | null>(null)
  /** True while the gateway is initializing on first launch. */
  const [gatewayStarting, setGatewayStarting] = useState(true)

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

  const refresh = useCallback(async () => {
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
        const hRes = await fetch('http://localhost:8897/api/clawd/service/health')
        if (hRes.ok) {
          const hData = await hRes.json()
          gwOk = !!hData.gateway_ok
          setGatewayHealthy(gwOk)
        }
      } catch {
        // Rust backend itself is unreachable — gateway definitely not ok
        setGatewayHealthy(false)
      }

      if (!gwOk) {
        gwDownCountRef.current++
        if (isFirstLoad) setLoading(false)
        prevJsonRef.current._initialized = 'true'
        // Keep gatewayStarting true for the first ~45s so UI shows "Starting..."
        // instead of "DOWN" during initial startup. After enough failed polls,
        // transition to "reconnecting..." so the user gets actionable feedback.
        if (gwDownCountRef.current >= 4) {
          setGatewayStarting(false)
        }
        return
      }

      // Gateway is up — reset down counter and clear starting state
      gwDownCountRef.current = 0
      setGatewayStarting(false)

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
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch channel status')
    } finally {
      if (isFirstLoad) setLoading(false)
      prevJsonRef.current._initialized = 'true'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const res = await fetch('http://localhost:8897/api/clawd/service/health')
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
        // No QR returned — may already be linked
        setWhatsappLinking(false)
        await refresh()
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
    } catch (e: any) {
      setChannelError('imessage', e.message)
    }
  }, [refresh])

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
      const res = await configureTelegram(botToken)
      if (!res.success) throw new Error(res.message ?? 'Failed to configure Telegram')
      await refresh()
    } catch (e: any) {
      setChannelError('telegram', e.message)
      throw e
    }
  }, [refresh])

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
    } catch (e: any) {
      setChannelError(channel, e.message)
      throw e
    }
  }, [refresh])

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
    whatsappLinking,
    healthChecking,
    gatewayHealthy,
    /** True during initial gateway startup — UI should show "Starting..." not "DOWN". */
    gatewayStarting,
    refresh,
    checkHealth,
    connectWhatsApp,
    disconnectWhatsApp: doDisconnectWhatsApp,
    connectIMessage,
    disconnectIMessage: doDisconnectIMessage,
    connectTelegram,
    disconnectTelegram: doDisconnectTelegram,
    connectGenericChannel,
    disconnectGenericChannel: doDisconnectGenericChannel,
  }
}
