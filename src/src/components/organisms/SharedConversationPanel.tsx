import { useEffect, useRef, useState } from 'react'

import {
  listAccountConversations,
  publishAccountConversation,
  readAccountConversation,
  revokeAccountDevice,
  type SharedDirectory,
  type SharedMessage,
  type SharedRead,
} from 'src/api/accountConversations'
import {
  cancelStateBackupOperation,
  getAccountDevices,
  stateBackupErrorMessage,
  type AccountDeviceDirectory,
} from 'src/api/stateBackup'
import {
  cacheKey,
  conversationDocument,
  mergeSharedConversation,
  reviewedConversation,
  type SharingBinding,
} from 'src/utils/accountConversationState'

import { listen, type UnlistenFn } from '@tauri-apps/api/event'

type Props = {
  chatId: string
  title: string
  accountHint?: string
  messages: readonly { id: string; role: string; text: string; ts: number }[]
  busy: boolean
  onBusy: (value: boolean) => void
  onScope: (binding: SharingBinding) => void
  onAdopt: (messages: SharedMessage[], binding: SharingBinding) => void
  onReset: () => void
}
const button = 'rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50'

export default function SharedConversationPanel(props: Props) {
  const [open, setOpen] = useState(false),
    [watchReady, setWatchReady] = useState(false)
  const [devices, setDevices] = useState<AccountDeviceDirectory | null>(null),
    [directory, setDirectory] = useState<SharedDirectory | null>(null)
  const [binding, setBinding] = useState<SharingBinding | null>(null),
    [preview, setPreview] = useState<SharedRead | null>(null)
  const [confirmed, setConfirmed] = useState(false),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('')
  const [revokeTarget, setRevokeTarget] = useState(''),
    [revokeConfirmed, setRevokeConfirmed] = useState(false)
  const mounted = useRef(false),
    generation = useRef(0),
    running = useRef(false),
    confirmedRef = useRef(false)
  const bindingRef = useRef<SharingBinding | null>(null),
    propsRef = useRef(props)
  propsRef.current = props
  const previewDraft = useRef('')
  const reset = () => {
    ++generation.current
    confirmedRef.current = false
    bindingRef.current = null
    setDevices(null)
    setDirectory(null)
    setBinding(null)
    setPreview(null)
    setConfirmed(false)
    setRevokeConfirmed(false)
    setRevokeTarget('')
    setError('')
    setNotice('')
    propsRef.current.onReset()
    if (running.current) void cancelStateBackupOperation().catch(() => undefined)
  }
  useEffect(() => {
    mounted.current = true
    let disposed = false
    const stops: UnlistenFn[] = []
    const operationGeneration = generation
    void (async () => {
      try {
        for (const event of ['knapsack-connected', 'knapsack-disconnected']) {
          const stop = await listen(event, reset)
          if (disposed) stop()
          else stops.push(stop)
        }
        if (!disposed) setWatchReady(true)
      } catch {
        stops.splice(0).forEach(stop => stop())
        if (!disposed)
          setError(
            'Account change monitoring is unavailable. Sharing is blocked; reopen after reconnecting.',
          )
      }
    })()
    return () => {
      disposed = true
      mounted.current = false
      ++operationGeneration.current
      stops.forEach(stop => stop())
      if (running.current) void cancelStateBackupOperation().catch(() => undefined)
      propsRef.current.onBusy(false)
    }
  }, [])
  useEffect(() => {
    reset()
  }, [props.accountHint])
  useEffect(() => {
    const current = bindingRef.current
    if (!current) return
    try {
      const cached = JSON.stringify({
        binding: current,
        document: conversationDocument(props.messages, current.conversationId, props.title),
      })
      localStorage.setItem(cacheKey(current.accountId, props.chatId), cached)
      localStorage.setItem(
        `${cacheKey(current.accountId, props.chatId)}:${current.conversationId}`,
        cached,
      )
    } catch {
      setError(
        'Could not preserve this account draft locally. Keep this window open and copy the draft before leaving.',
      )
    }
  }, [props.messages, props.chatId, props.title, binding])
  const run = async (task: () => Promise<void>) => {
    if (running.current || propsRef.current.busy || !watchReady) return
    running.current = true
    propsRef.current.onBusy(true)
    setPending(true)
    setError('')
    const ticket = generation.current
    try {
      await task()
    } catch (err) {
      if (mounted.current && ticket === generation.current) setError(stateBackupErrorMessage(err))
    } finally {
      running.current = false
      propsRef.current.onBusy(false)
      if (mounted.current) setPending(false)
    }
  }
  const alive = (ticket: number) => mounted.current && generation.current === ticket
  const scope = (next: SharingBinding) => {
    bindingRef.current = next
    setBinding(next)
    propsRef.current.onScope(next)
  }
  const project = (id: string) =>
    conversationDocument(propsRef.current.messages, id, propsRef.current.title)
  const busy = pending || props.busy || !watchReady
  const enrolled = devices?.devices.some(
    row => row.device_id === devices.current_device_id && !row.revoked,
  )
  const check = () =>
    void run(async () => {
      const ticket = generation.current
      const next = await getAccountDevices()
      if (!alive(ticket)) return
      if (devices && devices.account_id !== next.account_id) {
        reset()
        return
      }
      setDevices(next)
      const list = await listAccountConversations(next.account_id)
      if (!alive(ticket)) return
      if (list.account_id !== next.account_id) throw Error('Account changed. Check sharing again.')
      setDirectory(list)
      setPreview(null)
      setConfirmed(false)
      confirmedRef.current = false
      setNotice(
        'Execution stays on this computer. Account conversation state is available; nothing has been uploaded.',
      )
    })
  const read = (id: string) =>
    void run(async () => {
      if (!devices) return
      const ticket = generation.current
      const localBefore = JSON.stringify(propsRef.current.messages)
      const result = reviewedConversation(
        await readAccountConversation(devices.account_id, id),
        devices.account_id,
        id,
      )
      if (!alive(ticket)) return
      previewDraft.current = localBefore
      setPreview(result)
      setConfirmed(false)
      confirmedRef.current = false
      setNotice(
        'Review the saved history. Your current draft is preserved until you choose how to continue.',
      )
    })
  const adopt = (merge: boolean) => {
    if (!preview || !confirmedRef.current || busy || !devices) return
    if (previewDraft.current !== JSON.stringify(propsRef.current.messages)) {
      setError('Your draft changed during review. Refresh the preview before continuing.')
      return
    }
    try {
      const next = {
        accountId: preview.account_id,
        conversationId: preview.receipt.conversation_id,
        revision: preview.receipt.revision,
      }
      const document =
        merge && bindingRef.current?.conversationId === next.conversationId
          ? mergeSharedConversation(preview.document, project(next.conversationId))
          : preview.document
      scope(next)
      propsRef.current.onAdopt(document.messages, next)
      setPreview(null)
      setConfirmed(false)
      confirmedRef.current = false
      setNotice(
        merge
          ? 'Reviewed histories combined locally. Publish explicitly to update the account revision.'
          : 'History continued here. New execution requires a new request; imported actions remain disabled.',
      )
    } catch (err) {
      setError(stateBackupErrorMessage(err))
    }
  }
  const publish = () => {
    if (busy || running.current || !devices || !confirmedRef.current || !enrolled || !directory)
      return
    const ticket = generation.current,
      current = bindingRef.current
    const id = current?.conversationId || crypto.randomUUID()
    const expected = current?.revision || 0
    // Pin identity before dispatch so an interrupted publish retries the same conversation.
    if (!current) scope({ accountId: devices.account_id, conversationId: id, revision: 0 })
    let document: ReturnType<typeof project>
    try {
      document = project(id)
    } catch (err) {
      setError(stateBackupErrorMessage(err))
      return
    }
    void run(async () => {
      const receipt = await publishAccountConversation(devices.account_id, expected, document, true)
      if (!alive(ticket)) return
      scope({ accountId: devices.account_id, conversationId: id, revision: receipt.revision })
      setConfirmed(false)
      confirmedRef.current = false
      setPreview(null)
      setNotice(
        `Published account revision ${receipt.revision}. Other computers can refresh it. Execution remains local.`,
      )
      const list = await listAccountConversations(devices.account_id)
      if (alive(ticket)) setDirectory(list)
    })
  }
  const resumeCache = (id?: string) => {
    if (!devices || busy) return
    try {
      const raw = localStorage.getItem(
        cacheKey(devices.account_id, props.chatId) + (id ? `:${id}` : ''),
      )
      if (!raw) throw Error('No cached account draft for this chat')
      const cached = JSON.parse(raw) as {
        binding: SharingBinding
        document: ReturnType<typeof project>
      }
      if (
        cached.binding.accountId !== devices.account_id ||
        !Number.isSafeInteger(cached.binding.revision) ||
        cached.binding.revision < 0 ||
        cached.document.schemaVersion !== 1 ||
        cached.document.conversationId !== cached.binding.conversationId
      )
        throw Error('Invalid account draft cache')
      const document = conversationDocument(
        cached.document.messages,
        cached.binding.conversationId,
        cached.document.title,
      )
      if (!confirmedRef.current) throw Error('Review resuming the account draft first')
      scope(cached.binding)
      propsRef.current.onAdopt(document.messages, cached.binding)
      setConfirmed(false)
      confirmedRef.current = false
      setNotice(
        'Resumed cached account draft. Refresh before publishing if another computer edited it; conflicts preserve this draft.',
      )
    } catch (err) {
      setError(stateBackupErrorMessage(err))
    }
  }
  return (
    <section
      className="mx-3 my-2 flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
      aria-label="Account conversation continuity"
    >
      <button
        type="button"
        className={`${button} self-start`}
        disabled={pending}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open)
          setConfirmed(false)
          confirmedRef.current = false
          setPreview(null)
        }}
      >
        Continue conversation across computers
      </button>
      {open && (
        <>
          <p className="text-sm">
            Execution: this computer. Share selected conversation text through your protected
            account, then refresh it on another Desktop. Remote execution and automatic
            synchronization are unavailable.
          </p>
          <p className="text-xs text-zinc-600">
            Nothing uploads until you publish. Sharing excludes attachments, credentials, system
            prompts, action controls and approvals. Review sensitive text; credential detection is
            conservative. Previously downloaded history cannot be erased by revocation.
          </p>
          <button type="button" className={button} disabled={busy} onClick={check}>
            Check shared account conversations
          </button>
          {devices && (
            <p className="text-xs">
              Verified account {devices.account_id} ·{' '}
              {enrolled ? 'This computer enrolled' : 'Add this computer in Settings before sharing'}{' '}
              · Protected account keys must be enrolled in Settings.
            </p>
          )}
          {binding && (
            <p className="text-sm">
              Conversation {binding.conversationId.slice(0, 8)} · reviewed revision{' '}
              {binding.revision} · local edits stay here until published.
            </p>
          )}
          {directory?.conversations.map(row => (
            <button
              key={row.conversation_id}
              type="button"
              className={`${button} text-left`}
              disabled={busy}
              onClick={() => read(row.conversation_id)}
            >
              Review conversation {row.conversation_id.slice(0, 8)} · revision {row.revision} · from{' '}
              {devices?.devices.find(device => device.device_id === row.source_device_id)?.name ||
                'another computer'}{' '}
              · saved {new Date(row.updated_at * 1000).toLocaleString()}
            </button>
          ))}
          {preview && (
            <div className="flex flex-col gap-2" aria-label="Review shared history">
              <p className="text-sm">
                {preview.document.title} · revision {preview.receipt.revision} ·{' '}
                {preview.document.messages.length} messages. Continuing replaces the visible
                history; your existing local draft is retained.
              </p>
              <div className="max-h-56 overflow-auto rounded border bg-white p-2">
                {preview.document.messages.map(message => (
                  <p key={message.id} className="whitespace-pre-wrap break-words text-sm">
                    <strong>{message.role}:</strong> {message.text}
                  </p>
                ))}
              </div>
            </div>
          )}
          <label className="text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={busy || !devices}
              onChange={event => {
                confirmedRef.current = event.target.checked
                setConfirmed(event.target.checked)
              }}
            />{' '}
            I reviewed this conversation and consent to the selected sharing or continuation action.
            No past approval grants permission to execute.
          </label>
          <div className="flex flex-wrap gap-2">
            {preview ? (
              <>
                <button
                  type="button"
                  className={button}
                  disabled={busy || !confirmed}
                  onClick={() => adopt(false)}
                >
                  Continue reviewed history here
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={busy || !confirmed}
                  onClick={() => resumeCache(preview.receipt.conversation_id)}
                >
                  Resume cached draft for this conversation
                </button>
                {binding?.conversationId === preview.receipt.conversation_id && (
                  <button
                    type="button"
                    className={button}
                    disabled={busy || !confirmed}
                    onClick={() => adopt(true)}
                  >
                    Combine reviewed histories locally
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={button}
                  disabled={busy || !confirmed || !enrolled || !directory}
                  onClick={publish}
                >
                  Publish this conversation
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={busy || !confirmed || !directory}
                  onClick={() => resumeCache()}
                >
                  Resume cached account draft
                </button>
              </>
            )}
            {binding && (
              <button
                type="button"
                className={button}
                disabled={busy || !confirmed}
                onClick={() => {
                  scope({
                    accountId: binding.accountId,
                    conversationId: crypto.randomUUID(),
                    revision: 0,
                  })
                  setPreview(null)
                  setConfirmed(false)
                  confirmedRef.current = false
                  setNotice(
                    'Preserved as a separate local account draft. Review and publish explicitly.',
                  )
                }}
              >
                Keep a separate conversation
              </button>
            )}
            {binding && (
              <button
                type="button"
                className={button}
                disabled={busy || !directory}
                onClick={() => read(binding.conversationId)}
              >
                Refresh saved revision
              </button>
            )}
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => {
                reset()
                setNotice('Returned to your local conversation. No shared work was activated.')
              }}
            >
              Return to local conversation
            </button>
            {pending && (
              <button
                type="button"
                className={button}
                onClick={() => {
                  ++generation.current
                  confirmedRef.current = false
                  setConfirmed(false)
                  void cancelStateBackupOperation().catch(() => undefined)
                  setNotice(
                    'Cancelled local adoption. A publish already submitted may have committed; refresh before changing the draft.',
                  )
                }}
              >
                Cancel shared operation
              </button>
            )}
          </div>
          {devices && (
            <details>
              <summary className="text-sm">Revoke another computer</summary>
              <p className="text-xs">
                Revocation blocks future server access and preserves already downloaded history.
                Revoking the checkpoint writer also pauses account backup; review writer recovery in
                Settings.
              </p>
              <select
                aria-label="Computer to revoke"
                value={revokeTarget}
                disabled={busy}
                onChange={event => {
                  setRevokeTarget(event.target.value)
                  setRevokeConfirmed(false)
                }}
              >
                <option value="">Choose computer</option>
                {devices.devices
                  .filter(row => row.device_id !== devices.current_device_id && !row.revoked)
                  .map(row => (
                    <option key={row.device_id} value={row.device_id}>
                      {row.name}
                    </option>
                  ))}
              </select>
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={revokeConfirmed}
                  disabled={busy || !revokeTarget}
                  onChange={event => setRevokeConfirmed(event.target.checked)}
                />{' '}
                I reviewed revoking this computer.
              </label>
              <button
                type="button"
                className={button}
                disabled={busy || !revokeTarget || !revokeConfirmed}
                onClick={() =>
                  void run(async () => {
                    const ticket = generation.current
                    await revokeAccountDevice(
                      devices.account_id,
                      revokeTarget,
                      devices.account.epoch,
                      true,
                    )
                    if (!alive(ticket)) return
                    setRevokeConfirmed(false)
                    setRevokeTarget('')
                    const refreshed = await getAccountDevices()
                    if (!alive(ticket)) return
                    if (refreshed.account_id !== devices.account_id)
                      throw Error('Account changed. Review devices again.')
                    setDevices(refreshed)
                    setNotice(
                      'Computer revoked. Future server access is blocked; existing local copies remain.',
                    )
                  })
                }
              >
                Verify and revoke computer
              </button>
            </details>
          )}
          <p className="text-xs text-zinc-600">
            Offline edits remain account-scoped locally. Reconnect and refresh explicitly; stale
            versions conflict rather than overwrite. Close or cancel blocks local adoption; a
            publish already submitted may have committed. Retry the same draft or refresh and review
            its result.
          </p>
          {notice && (
            <p role="status" className="text-sm">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  )
}
