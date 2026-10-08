import { useEffect, useRef, useState } from 'react'

import { invoke } from '@tauri-apps/api/tauri'

type Status = { enabled?: boolean; intent_id?: string; last_error?: string; message?: string }
export default function IMessageFollowUpDelivery({
  accountId,
  intentId,
  handle,
}: {
  accountId: string
  intentId: string
  handle: string
}) {
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>({})
  const generation = useRef(0),
    locked = useRef(false)
  useEffect(() => {
    let mounted = true
    const refresh = () => {
      void invoke<Status>('kn_imessage_delivery_status')
        .then(value => {
          if (mounted) setStatus(value)
        })
        .catch(() => {
          if (mounted) setStatus({ last_error: 'Delivery status unavailable.' })
        })
    }
    refresh()
    window.addEventListener('knapsack-imessage-delivery-status', refresh)
    const timer = window.setInterval(refresh, 60_000)
    const epoch = generation
    return () => {
      mounted = false
      epoch.current++
      window.clearInterval(timer)
      window.removeEventListener('knapsack-imessage-delivery-status', refresh)
    }
  }, [accountId, intentId])
  const change = async (enable: boolean) => {
    if (locked.current || (enable && !consent)) return
    locked.current = true
    setBusy(true)
    const epoch = generation.current
    try {
      if (!enable) await invoke('kn_imessage_delivery_pause_local')
      const result = await invoke<Status>('kn_imessage_delivery_consent', {
        expectedAccountId: accountId,
        intentId,
        handle,
        enable,
        confirm: true,
      })
      if (epoch === generation.current) {
        setStatus(result)
        setConsent(false)
      }
    } catch (error) {
      if (epoch === generation.current)
        setStatus(previous => ({
          ...previous,
          enabled: enable ? previous.enabled : false,
          last_error: `${enable ? 'Delivery not enabled' : 'Paused locally; account pause may be unconfirmed'}: ${String(error)}`,
        }))
    } finally {
      if (epoch === generation.current) {
        locked.current = false
        setBusy(false)
      }
    }
  }
  const enabledHere = status.enabled && status.intent_id === intentId
  return (
    <section
      className="border rounded p-3 space-y-2"
      aria-label="Separate iMessage reminder consent"
    >
      <p>
        Optional generic reminders for follow-ups you reviewed and chose to track. One reminder per
        due time, at most five per check, only on this running Mac. Reminders older than a day are
        skipped.
      </p>
      <p>
        Message: “Knapsack: a reviewed follow-up needs attention. Open Knapsack to review it.” An
        opaque reference is appended. No source text, drafts, recipients, full briefings, groups,
        SMS, or automatic replies. Each attempt checks at most five messages in your verified
        self-chat.
      </p>
      <label className="block">
        <input
          type="checkbox"
          checked={consent}
          disabled={busy}
          onChange={event => setConsent(event.target.checked)}
        />{' '}
        I separately opt in to this scope and these bounded self-thread checks. This Mac stores my
        destination locally. After an app restart, account change or pause, I must review consent
        again.
      </label>
      <button
        className="underline block"
        disabled={busy || !consent || !handle || !!enabledHere}
        onClick={() => void change(true)}
      >
        Enable generic follow-up reminders on this Mac
      </button>
      <button className="underline block" disabled={busy} onClick={() => void change(false)}>
        Pause reminder delivery
      </button>
      <p role="status">
        {status.last_error ||
          status.message ||
          (enabledHere
            ? 'Locally enabled. Sending and delivery remain unverified until attempted.'
            : 'Reminder delivery is off on this Mac.')}
      </p>
      <p>
        Offline, stale verification, account changes, or missing permissions stop attempts. An
        admitted send can finish while you pause remotely; already submitted messages cannot be
        recalled. Interrupted or uncertain attempts never resend automatically.
      </p>
    </section>
  )
}
