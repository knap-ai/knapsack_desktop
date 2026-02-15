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
    await refresh()
  }, [refresh])

  const connectWhatsApp = useCallback(async () => {
    const enableRes = await enableWhatsApp(true)
    if (!enableRes.success) throw new Error(enableRes.message ?? 'Failed to enable WhatsApp')
    const loginRes = await startWhatsAppLogin()
    if (!loginRes.success) throw new Error(loginRes.message ?? 'Failed to start WhatsApp login')
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
    refresh,
    toggleWhatsApp,
    connectWhatsApp,
    toggleIMessage,
    connectIMessage,
  }
}
