import { useEffect, useRef, useState } from 'react'

import { cancelStateBackupOperation } from 'src/api/stateBackup'

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

import IMessageFollowUpDelivery from './IMessageFollowUpDelivery'

type Intent = {
  intent_id: string
  device_id: string
  revision: number
  status: string
  challenge: string
  expires_at: number
  updates_opt_in: boolean
  updates_delivery_available: false
}
type Directory = { account_id: string; current_device_id: string; intents: Intent[] }
export default function MacIMessageSetup() {
  const [open, setOpen] = useState(false),
    [directory, setDirectory] = useState<Directory | null>(null),
    [handle, setHandle] = useState(''),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [ready, setReady] = useState(false)
  const generation = useRef(0),
    locked = useRef(false),
    requestId = useRef<string | null>(null)
  useEffect(() => {
    const operationGeneration = generation
    let mounted = true
    const cleanups: (() => void)[] = []
    const reset = () => {
      generation.current++
      setDirectory(null)
      requestId.current = null
      setHandle('')
      setConsent(false)
      setMessage('Account changed. Review setup again.')
      setBusy(false)
      locked.current = false
    }
    void (async () => {
      try {
        for (const event of ['knapsack-connected', 'knapsack-disconnected']) {
          const cleanup = await listen(event, reset)
          if (!mounted) cleanup()
          else cleanups.push(cleanup)
        }
        if (mounted) setReady(true)
      } catch {
        cleanups.forEach(fn => fn())
        if (mounted) setMessage('Account-change monitoring is unavailable. Setup is disabled.')
      }
    })()
    return () => {
      mounted = false
      operationGeneration.current++
      cleanups.forEach(fn => fn())
    }
  }, [])
  const run = async (operation: () => Promise<unknown>) => {
    if (locked.current || !ready) return
    locked.current = true
    setBusy(true)
    const epoch = generation.current
    try {
      const result = (await operation()) as {
        account_id?: string
        intents?: Intent[]
        intent?: Intent
        transport?: { message?: string }
        message?: string
      }
      if (epoch !== generation.current) return
      if (result.account_id && result.intents) setDirectory(result as Directory)
      if (result.intent)
        setDirectory(previous =>
          previous
            ? {
                ...previous,
                intents: previous.intents.map(value =>
                  value.intent_id === result.intent?.intent_id ? result.intent : value,
                ) as Intent[],
              }
            : previous,
        )
      setMessage(
        result.transport?.message ||
          result.message ||
          'Setup updated. Generic reminders require their own separate opt-in.',
      )
      setConsent(false)
    } catch (error) {
      if (epoch === generation.current) setMessage(String(error))
    } finally {
      if (epoch === generation.current) {
        locked.current = false
        setBusy(false)
      }
    }
  }
  const action = (intent: Intent, step: string) =>
    run(() =>
      invoke('kn_imessage_setup_action', {
        expectedAccountId: directory?.account_id,
        intentId: intent.intent_id,
        expectedRevision: intent.revision,
        action: step,
        handle,
        confirm: consent,
      }),
    )
  return (
    <section
      className="rounded-lg border p-4 my-4 space-y-3 min-w-0"
      aria-label="Optional iMessage follow-ups"
    >
      <button className="underline" onClick={() => setOpen(!open)}>
        Get follow-ups in iMessage · optional
      </button>
      {open && (
        <>
          <p>
            Finish on the Mac selected in Studio. That Mac must stay running. This is a Messages
            self-chat, not a hosted Knapsack number.
          </p>
          <p>
            Account verification is separate from Messages permissions. If account setup is
            unavailable, continue using follow-ups locally. Verify your Google or Microsoft identity
            and enroll this Mac in account Settings first.
          </p>
          <label className="block">
            <input
              type="checkbox"
              disabled={busy}
              checked={consent}
              onChange={event => setConsent(event.target.checked)}
            />{' '}
            I consent to this selected step. The permission check reads one chat identifier;
            destination lookup checks at most 20 identifiers and 5 self-thread messages. Send test
            submits one nonsensitive message to my verified self-chat. Check reply reads at most 20
            new messages there.
          </label>
          <div className="flex gap-3 flex-wrap">
            <button
              className="border rounded p-2"
              disabled={busy || !ready || !consent}
              onClick={() =>
                void run(() => invoke('kn_imessage_setup_readiness', { confirmRead: true }))
              }
            >
              Check Mac permissions
            </button>
            <button
              className="border rounded p-2"
              disabled={busy || !ready}
              onClick={() => void run(() => invoke('kn_imessage_setup_list'))}
            >
              Check saved setup requests
            </button>
          </div>
          {directory && (
            <button
              className="border rounded p-2"
              disabled={
                busy ||
                !consent ||
                directory.intents.some(
                  value =>
                    value.device_id === directory.current_device_id &&
                    !['cancelled', 'disconnected'].includes(value.status) &&
                    value.expires_at * 1000 > Date.now(),
                )
              }
              onClick={() =>
                void run(async () => {
                  const prior = directory.intents.find(
                    value => value.intent_id === requestId.current,
                  )
                  if (
                    prior &&
                    (['cancelled', 'disconnected'].includes(prior.status) ||
                      prior.expires_at * 1000 <= Date.now())
                  )
                    requestId.current = null
                  if (!requestId.current) requestId.current = crypto.randomUUID()
                  const result = await invoke<{ intent: Intent }>('kn_imessage_setup_create', {
                    expectedAccountId: directory.account_id,
                    intentId: requestId.current,
                    confirm: true,
                  })
                  return {
                    ...directory,
                    intents: directory.intents.some(
                      value => value.intent_id === result.intent.intent_id,
                    )
                      ? directory.intents
                      : [...directory.intents, result.intent],
                  }
                })
              }
            >
              Save setup request for this Mac
            </button>
          )}
          <p>
            Install imsg separately if unavailable. Grant Full Disk Access or Messages Automation
            only through macOS when you choose; this flow does not accept permissions. No private
            API, SIP change, or SMS fallback is used.
          </p>
          <label className="block">
            My own iMessage email or international phone number
            <input
              className="border rounded p-2 w-full"
              maxLength={254}
              disabled={busy}
              value={handle}
              onChange={event => {
                setHandle(event.target.value)
                setConsent(false)
              }}
            />
          </label>
          {directory?.intents.map(intent => (
            <article key={intent.intent_id} className="border rounded p-3 space-y-2 break-words">
              <p>
                {intent.device_id === directory.current_device_id
                  ? 'This Mac'
                  : 'Finish on selected Mac'}{' '}
                · {intent.status} · expires {new Date(intent.expires_at * 1000).toLocaleString()}
              </p>
              {intent.status === 'pending' && (
                <button
                  disabled={busy || !consent || intent.device_id !== directory.current_device_id}
                  className="underline"
                  onClick={() => void action(intent, 'claim')}
                >
                  Continue on this selected Mac
                </button>
              )}
              {intent.status === 'claimed' && (
                <button
                  disabled={busy || !consent || !handle}
                  className="underline"
                  onClick={() => void action(intent, 'test')}
                >
                  Send one test to my self-chat
                </button>
              )}
              {intent.status === 'testing' && (
                <>
                  <p>
                    In Messages reply exactly: KN {intent.challenge}. A submitted or interrupted
                    test is never automatically resent.
                  </p>
                  <button
                    disabled={busy || !consent || !handle}
                    className="underline"
                    onClick={() => void action(intent, 'verify')}
                  >
                    Check test delivery and my reply
                  </button>
                </>
              )}
              {['verified', 'paused'].includes(intent.status) && (
                <>
                  <p>
                    Self-thread access verified by test and reply; this does not prove an Apple ID
                    matches your account identity. Generic reminders require separate consent below.
                  </p>
                  <button
                    disabled={busy || !consent}
                    className="underline"
                    onClick={() =>
                      void action(intent, intent.status === 'verified' ? 'pause' : 'updates')
                    }
                  >
                    {intent.status === 'verified'
                      ? 'Pause destination and reminders'
                      : 'Resume destination; review reminder consent again'}
                  </button>
                </>
              )}
              {intent.status === 'verified' && intent.device_id === directory.current_device_id && (
                <IMessageFollowUpDelivery
                  key={`${directory.account_id}:${intent.intent_id}`}
                  accountId={directory.account_id}
                  intentId={intent.intent_id}
                  handle={handle}
                />
              )}
              {!['cancelled', 'disconnected'].includes(intent.status) && (
                <button
                  disabled={busy || !consent}
                  className="underline block"
                  onClick={() => void action(intent, 'disconnect')}
                >
                  Disconnect this setup
                </button>
              )}
            </article>
          ))}
          {busy && (
            <button
              className="underline"
              onClick={() => {
                generation.current++
                locked.current = false
                setBusy(false)
                void cancelStateBackupOperation()
                setMessage(
                  'Cancelled locally. A submitted test or server change may have completed; refresh before another action.',
                )
              }}
            >
              Cancel current step
            </button>
          )}
          {message && (
            <p role="status" className="break-words">
              {message}
            </p>
          )}
          <p>
            No briefs or automatic replies are activated here. Generic reminder delivery requires
            its own separate consent after verification. Disconnect any existing iMessage channel
            before the test; its automation must remain stopped throughout verification.
          </p>
        </>
      )}
    </section>
  )
}
