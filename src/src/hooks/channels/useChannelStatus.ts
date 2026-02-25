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
}

/**
 * Hook that polls WhatsApp, iMessage, and Telegram channel status from the backend.
 *
 * @param enabled  Pass `false` to suppress polling (e.g. when the dialog is closed).
 * @param intervalMs  Polling interval in ms (default 10 s).
 */
export function useChannelStatus(enabled = true, intervalMs = 10_000) {
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

  // Track whether a QR wait is already in flight so we don't double-fire.
  const qrWaitActiveRef = useRef(false)

  const setChannelError = (channel: string, msg: string | null) => {
    setChannelErrors(prev => ({ ...prev, [channel]: msg }))
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [wa, im, tg, ...genericResults] = await Promise.all([
        getWhatsAppStatus().catch(() => null),
        getIMessageStatus().catch(() => null),
        getTelegramStatus().catch(() => null),
        ...GENERIC_CHANNELS.map(ch => getGenericChannelStatus(ch).catch(() => null)),
      ])
      setWhatsapp(wa)
      setImessage(im)
      setTelegram(tg)

      // Update generic channel states
      const newGeneric = { ...genericChannels }
      GENERIC_CHANNELS.forEach((ch, i) => {
        newGeneric[ch] = genericResults[i]
      })
      setGenericChannels(newGeneric)

      // Surface gateway-level errors per channel
      if (wa && !wa.success && wa.message) setChannelError('whatsapp', wa.message)
      else setChannelError('whatsapp', null)
      if (im && !im.success && im.message) setChannelError('imessage', im.message)
      else setChannelError('imessage', null)
      if (tg && !tg.success && tg.message) setChannelError('telegram', tg.message)
      else setChannelError('telegram', null)
      GENERIC_CHANNELS.forEach((ch, i) => {
        const status = genericResults[i]
        if (status && !status.success && status.message) setChannelError(ch, status.message)
        else setChannelError(ch, null)
      })

      // Clear QR code if WhatsApp is now linked
      if (wa?.linked) {
        setWhatsappQrUrl(null)
        setWhatsappLinking(false)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch channel status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    refresh()
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
