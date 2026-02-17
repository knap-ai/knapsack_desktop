import { useCallback, useEffect, useState } from 'react'
import {
  ChannelStatus,
  getWhatsAppStatus,
  getIMessageStatus,
  enableWhatsApp,
  enableIMessage,
  startWhatsAppLogin,
  setupIMessage,
  openFullDiskAccess,
} from 'src/api/channels'

export interface ChannelStates {
  whatsapp: ChannelStatus | null
  imessage: ChannelStatus | null
  loading: boolean
  error: string | null
  /** Base64 data URL for the WhatsApp QR code, if login is in progress. */
  whatsappQrUrl: string | null
  /** True while the backend is waiting for the gateway to restart and
   *  generate a QR code (can take ~10 s due to retry backoff). */
  whatsappLinking: boolean
}

/**
 * Hook that polls WhatsApp and iMessage channel status from the backend.
 *
 * @param enabled  Pass `false` to suppress polling (e.g. when the dialog is closed).
 * @param intervalMs  Polling interval in ms (default 10 s).
 */
export function useChannelStatus(enabled = true, intervalMs = 10_000) {
  const [whatsapp, setWhatsapp] = useState<ChannelStatus | null>(null)
  const [imessage, setImessage] = useState<ChannelStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [whatsappQrUrl, setWhatsappQrUrl] = useState<string | null>(null)
  const [whatsappLinking, setWhatsappLinking] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [wa, im] = await Promise.all([
        getWhatsAppStatus().catch(() => null),
        getIMessageStatus().catch(() => null),
      ])
      setWhatsapp(wa)
      setImessage(im)
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

  // ── Actions ────────────────────────────────────────────

  const toggleWhatsApp = useCallback(async (on: boolean) => {
    const res = await enableWhatsApp(on)
    if (!res.success) throw new Error(res.message ?? 'Failed to toggle WhatsApp')
    if (!on) {
      setWhatsappQrUrl(null)
      setWhatsappLinking(false)
    }
    await refresh()
  }, [refresh])

  const connectWhatsApp = useCallback(async () => {
    setWhatsappQrUrl(null)
    setWhatsappLinking(true)
    try {
      // Step 1: enable the WhatsApp channel in gateway config
      const enableRes = await enableWhatsApp(true)
      if (!enableRes.success) throw new Error(enableRes.message ?? 'Failed to enable WhatsApp')
      // Step 2: start QR login (backend retries while gateway restarts)
      const loginRes = await startWhatsAppLogin()
      if (!loginRes.success) throw new Error(loginRes.message ?? 'Failed to start WhatsApp login')
      if (loginRes.qrDataUrl) {
        setWhatsappQrUrl(loginRes.qrDataUrl)
      }
    } finally {
      setWhatsappLinking(false)
    }
    await refresh()
  }, [refresh])

  const toggleIMessage = useCallback(async (on: boolean) => {
    const res = await enableIMessage(on)
    if (!res.success) throw new Error(res.message ?? 'Failed to toggle iMessage')
    await refresh()
  }, [refresh])

  const connectIMessage = useCallback(async () => {
    const enableRes = await enableIMessage(true)
    if (!enableRes.success) throw new Error(enableRes.message ?? 'Failed to enable iMessage')
    const result = await setupIMessage()
    if (!result.configured) {
      await openFullDiskAccess()
    }
    await refresh()
  }, [refresh])

  return {
    whatsapp,
    imessage,
    loading,
    error,
    whatsappQrUrl,
    whatsappLinking,
    refresh,
    toggleWhatsApp,
    connectWhatsApp,
    toggleIMessage,
    connectIMessage,
  }
}
