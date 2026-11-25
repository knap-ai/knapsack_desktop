import { useEffect, useRef, useState } from 'react'

import type { LLMParams } from 'src/App'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

import { invoke } from '@tauri-apps/api/tauri'

type Scope = { threadId: number; ownerUuid: string; ownerEmail: string }
type Prepared = {
  scope: Scope
  snapshot: string
  savedNotes: string | null
  transcript: { id: number; filename: string; hash: string; content: string }
}
export type Copy = {
  version: number
  body: string
  savedManual: string | null
  draftManual: string
  transcriptId: number
  transcriptHash: string
  restoredFrom: number | null
  bodyHash: string
}
export type Request = {
  requestId: string
  threadId: number
  expectedUuid: string
  expectedEmail: string
  snapshot: string
  body: string
  draftManual: string
}
export type Receipt = {
  scope: Scope
  requestId: string
  version: number
  bodyHash: string
  desktopOnly: boolean
}
async function hash(text: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))),
    b => b.toString(16).padStart(2, '0'),
  ).join('')
}
async function native<T>(command: string, args: Record<string, unknown>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      invoke<T>(command, args),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Error('Recovery request not confirmed')), 15000)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}
export default function RecoveredCopy({
  threadId,
  accountEmail,
  manualDraft,
  missingSavedNotes = false,
  disabled,
  queue,
}: {
  threadId: number
  accountEmail: string
  manualDraft: string
  missingSavedNotes?: boolean
  disabled: boolean
  queue: (p: LLMParams) => void
}) {
  const [open, setOpen] = useState(false),
    [copies, setCopies] = useState<Copy[]>([]),
    [selected, setSelected] = useState<number>(),
    [preview, setPreview] = useState<{
      request: Request
      scope: Scope
      editorEpoch: number
    }>(),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [generating, setGenerating] = useState(false)
  const restorePending = useRef<{ binding: string; requestId: string }>()
  const epoch = useRef({ value: 0 }),
    editor = useRef({ value: manualDraft, epoch: 0 }),
    lock = useRef(false),
    abort = useRef<AbortController>()
  const live = useRef({ threadId, accountEmail })
  live.current = { threadId, accountEmail }
  if (editor.current.value !== manualDraft)
    editor.current = { value: manualDraft, epoch: editor.current.epoch + 1 }
  useEffect(() => {
    const lifecycle = epoch.current
    const clear = () => {
      lifecycle.value++
      abort.current?.abort()
      setOpen(false)
      setCopies([])
      setPreview(undefined)
      setStatus('')
      setBusy(false)
      setGenerating(false)
      restorePending.current = undefined
    }
    clear()
    window.addEventListener(PROFILE_CHANGED_EVENT, clear)
    return () => {
      lifecycle.value++
      abort.current?.abort()
      window.removeEventListener(PROFILE_CHANGED_EVENT, clear)
    }
  }, [threadId, accountEmail])
  const action = async (
    work: (owner: { uuid: string; email: string }, current: () => boolean) => Promise<void>,
  ) => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setStatus('')
    const token = epoch.current.value,
      revision = getProfileRevision(),
      thread = threadId,
      email = accountEmail
    const current = () =>
      epoch.current.value === token &&
      getProfileRevision() === revision &&
      live.current.threadId === thread &&
      live.current.accountEmail === email
    try {
      const p = await KNLocalStorage.getItem('KN_PROFILE')
      if (!current() || !p?.uuid || p.email?.toLowerCase() !== email.toLowerCase())
        throw Error('scope')
      await work({ uuid: p.uuid, email: p.email }, current)
    } catch (error) {
      if (current() && error === 'RECOVERY_SOURCE_CHANGED') {
        setPreview(undefined)
        setStatus('Source changed. Preview again before saving; originals are unchanged.')
      } else if (current() && error === 'RECOVERY_OWNER_UNVERIFIED') {
        setPreview(undefined)
        setCopies([])
        setOpen(false)
        setStatus('The meeting account could not be verified. Originals are unchanged.')
      } else if (current())
        setStatus(
          'Not confirmed. Originals are unchanged. You can retry or reload recovered copies.',
        )
    } finally {
      lock.current = false
      if (current()) setBusy(false)
    }
  }
  const args = (o: { uuid: string; email: string }) => ({
    threadId,
    expectedUuid: o.uuid,
    expectedEmail: o.email,
  })
  const validScope = (s: Scope, o: { uuid: string; email: string }) =>
    s.threadId === threadId && s.ownerUuid === o.uuid && s.ownerEmail === o.email.toLowerCase()
  const load = () =>
    action(async (o, current) => {
      const values = await native<Copy[]>('desktop_recovered_list', args(o))
      if (current()) {
        setCopies(values)
        setSelected(values[0]?.version)
        setOpen(true)
      }
    })
  const generate = () =>
    action(async (o, current) => {
      setPreview(undefined)
      const editorEpoch = editor.current.epoch,
        draft = editor.current.value
      const source = await native<Prepared>('desktop_recovered_prepare', args(o))
      if (!current()) return
      if (!validScope(source.scope, o) || !source.transcript.content.trim()) throw Error('source')
      const controller = new AbortController()
      abort.current = controller
      const timeout = setTimeout(() => controller.abort(), 120000)
      setGenerating(true)
      try {
        await new Promise<void>((resolve, reject) => {
          controller.signal.addEventListener('abort', () => reject(Error('cancelled')), {
            once: true,
          })
          queue({
            requestKind: 'notes',
            // Supply only verified source documents; do not attach chat history/routing.
            diagnosticKind: 'notes',
            signal: controller.signal,
            prompt:
              'Create a recovered meeting-note review draft using only the supplied saved transcript and manual notes. Preserve manual priorities and context. Original saved notes may also contain generated text; use the transcript to ground meeting claims, flag conflicts, and do not turn older generated text into new decisions. Agenda questions remain open questions unless the transcript explicitly answers them. Do not invent decisions, owners or deadlines. Do not call tools, research, send, share, schedule or perform follow-ups. This is a separate Desktop-only recovered copy; originals stay unchanged.',
            semanticSearchQuery: '',
            documents: [],
            additionalDocuments: [
              {
                title: 'Verified saved transcript',
                content: source.transcript.content,
              },
              {
                title: 'Original saved notes (may include manual notes)',
                content: source.savedNotes || '',
              },
              { title: 'Current editor manual draft', content: draft },
            ],
            messageFinishCallback: async body => {
              if (!current() || controller.signal.aborted) {
                resolve()
                return body
              }
              if (!body.trim()) {
                reject(Error('empty'))
                return body
              }
              setPreview({
                request: {
                  requestId: crypto.randomUUID(),
                  ...args(o),
                  snapshot: source.snapshot,
                  body,
                  draftManual: draft,
                },
                scope: source.scope,
                editorEpoch,
              })
              resolve()
              return body
            },
            errorCallback: error => reject(error),
          })
        })
      } finally {
        clearTimeout(timeout)
        if (current()) setGenerating(false)
      }
    })
  const save = () =>
    action(async (o, current) => {
      if (!preview || preview.editorEpoch !== editor.current.epoch || !validScope(preview.scope, o))
        throw Error('stale')
      const p = preview,
        receipt = await native<Receipt>('desktop_recovered_save', {
          input: p.request,
        })
      const bodyHash = await hash(p.request.body)
      if (!current()) return
      if (
        receipt.requestId !== p.request.requestId ||
        receipt.bodyHash !== bodyHash ||
        !receipt.desktopOnly ||
        !validScope(receipt.scope, o)
      )
        throw Error('ack')
      const values = await native<Copy[]>('desktop_recovered_list', args(o))
      if (!current()) return
      if (
        !values.some(
          v =>
            v.version === receipt.version && v.bodyHash === bodyHash && v.body === p.request.body,
        )
      )
        throw Error('readback')
      setCopies(values)
      setSelected(receipt.version)
      setPreview(undefined)
      setStatus(
        editor.current.epoch === p.editorEpoch
          ? 'Recovered copy saved on this Desktop. Original notes and transcript unchanged.'
          : 'Recovered copy saved from the reviewed preview. Newer editor edits remain unchanged.',
      )
    })
  const restore = (version: number) =>
    action(async (o, current) => {
      const old = copies.find(v => v.version === version)
      if (!old) throw Error('version')
      const binding = JSON.stringify([threadId, o.uuid, o.email, version])
      if (restorePending.current?.binding !== binding)
        restorePending.current = { binding, requestId: crypto.randomUUID() }
      const requestId = restorePending.current.requestId,
        r = await native<Receipt>('desktop_recovered_restore', {
          ...args(o),
          version,
          requestId,
        })
      if (!current()) return
      if (
        r.requestId !== requestId ||
        r.bodyHash !== old.bodyHash ||
        !r.desktopOnly ||
        !validScope(r.scope, o)
      )
        throw Error('ack')
      const values = await native<Copy[]>('desktop_recovered_list', args(o))
      if (!current()) return
      if (
        !values.some(
          v => v.version === r.version && v.body === old.body && v.restoredFrom === version,
        )
      )
        throw Error('readback')
      setCopies(values)
      setSelected(r.version)
      if (restorePending.current?.requestId === requestId) restorePending.current = undefined
      setStatus('Previous copy restored as a new Desktop-only version. Originals unchanged.')
    })
  const value = copies.find(v => v.version === selected)
  return (
    <section aria-label="Desktop recovered notes" className="my-3 rounded border p-3 text-sm">
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => (open ? setOpen(false) : void load())}
      >
        {missingSavedNotes ? 'Create notes from saved transcript' : 'Recovered notes · Desktop only'}
      </button>
      {missingSavedNotes && <p>Transcript saved. No original notes are saved. You can review and save a separate Desktop-only copy.</p>}
      {open && (
        <>
          <p>
            Separate saved copies on this Desktop. Original notes and transcript stay unchanged;
            these copies do not replace shared or iOS notes. Preview uses your current notes model
            and privacy settings.
          </p>
          <button type="button" disabled={busy || disabled} onClick={() => void generate()}>
            Preview recovered notes
          </button>{' '}
          <button type="button" disabled={busy} onClick={() => void load()}>
            Reload recovered copies
          </button>
          {copies.length > 0 && (
            <>
              <label>
                Recovered version{' '}
                <select value={selected} onChange={e => setSelected(Number(e.target.value))}>
                  {copies.map(v => (
                    <option key={v.version} value={v.version}>
                      Version {v.version}
                    </option>
                  ))}
                </select>
              </label>
              {value && (
                <>
                  <pre className="whitespace-pre-wrap break-words">{value.body}</pre>
                  <details>
                    <summary>Preserved source notes and transcript provenance</summary>
                    <p>Original saved notes</p>
                    <pre className="whitespace-pre-wrap">
                      {value.savedManual || 'No original saved notes'}
                    </pre>
                    <p>Editor input at preview</p>
                    <pre className="whitespace-pre-wrap">{value.draftManual}</pre>
                    <p>
                      Transcript record {value.transcriptId}; SHA-256 {value.transcriptHash}
                    </p>
                  </details>
                  <button type="button" disabled={busy} onClick={() => void restore(value.version)}>
                    Restore this as a new recovered copy
                  </button>
                </>
              )}
            </>
          )}
          {preview && (
            <section aria-label="Recovered copy preview">
              <pre className="whitespace-pre-wrap break-words">{preview.request.body}</pre>
              <button
                type="button"
                disabled={busy || disabled || preview.editorEpoch !== editor.current.epoch}
                onClick={() => void save()}
              >
                Save recovered copy
              </button>
              <button
                type="button"
                onClick={() => {
                  abort.current?.abort()
                  setPreview(undefined)
                }}
              >
                Dismiss preview
              </button>
              {preview.editorEpoch !== editor.current.epoch && (
                <p role="alert">Manual notes changed. Preview again before saving.</p>
              )}
            </section>
          )}
        </>
      )}
      {busy && (
        <>
          <p role="status">Working on recovered copies…</p>
          {generating && (
            <button type="button" onClick={() => abort.current?.abort()}>
              Cancel recovery preview
            </button>
          )}
        </>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  )
}
