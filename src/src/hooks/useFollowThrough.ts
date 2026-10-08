import { useEffect, useRef } from 'react'

import { checkFollowThrough } from 'src/api/followThrough'

import { invoke } from '@tauri-apps/api/tauri'

// Runs across all app screens. The backend persists the schedule and serializes
// checks, so reloads and multiple listeners do not create duplicate Gmail reads.
export function useFollowThrough(enabled = true, onAttention?: (count: number) => void) {
  const notify = useRef(onAttention)
  notify.current = onAttention
  useEffect(() => {
    if (!enabled) return
    let disposed = false,
      checking = false
    const check = async () => {
      if (checking || disposed) return
      checking = true
      try {
        const items = await checkFollowThrough()
        if (disposed) return
        const unseen = items.filter(item => {
          if (!['attention', 'reply_received'].includes(item.status) || item.checkError)
            return false
          const key = `knapsack:follow-through:${item.id}:${item.status}:${item.dueAt}`
          if (localStorage.getItem(key)) return false
          localStorage.setItem(key, 'seen')
          return true
        })
        if (unseen.length) notify.current?.(unseen.length)
        window.dispatchEvent(new Event('knapsack-follow-through-updated'))
        // Native code independently checks durable opt-in, exact account/device,
        // latest follow-up state and one-time server admission before sending.
        try {
          await invoke('kn_imessage_delivery_tick')
        } catch {
          window.dispatchEvent(new Event('knapsack-imessage-delivery-status'))
        }
      } catch {
        /* A later tick retries; never interpret a failed check as no reply. */
      } finally {
        checking = false
      }
    }
    void check()
    const timer = window.setInterval(check, 60_000)
    return () => {
      disposed = true
      window.clearInterval(timer)
    }
  }, [enabled])
}
