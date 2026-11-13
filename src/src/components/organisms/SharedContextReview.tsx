import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ContextCandidate,
  ContextConflict,
  ContextState,
  ReviewedContextSelection,
} from 'src/api/sharedContext'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

export type ContextReviewProps = {
  candidates: readonly ContextCandidate[]
  // Unique verified native controller/session nonce; never just an account label.
  bindingKey: string
  accountLabel: string
  deviceLabel: string
  verifiedIdentity: boolean
  enrolledDevice: boolean
  state: ContextState
  conflict?: ContextConflict
  onSelect: (selection: readonly ReviewedContextSelection[]) => Promise<void>
  onCancel: () => void
  onDiscardLocal: (id: string, reviewedRevision: number, localMutationId: string) => Promise<void>
}
// Pure review surface for isolated fixtures. Not mounted in release UI, and
// never routes to the legacy plaintext draft cache or conversation adoption.
export default function SharedContextReview(props: ContextReviewProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [accountConsent, setAccountConsent] = useState(false)
  const [deviceConsent, setDeviceConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [invalidated, setInvalidated] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [error, setError] = useState('')
  const [reviewBinding, setReviewBinding] = useState(props.bindingKey)
  const origin = useRef({ bindingKey: props.bindingKey, cancel: props.onCancel })
  const candidateToken = JSON.stringify(props.candidates)
  const [reviewToken, setReviewToken] = useState(candidateToken)
  const conflictToken = JSON.stringify(props.conflict)
  const [conflictReviewToken, setConflictReviewToken] = useState(conflictToken)
  const generation = useRef(0)
  const lock = useRef(false)
  const invalidate = useCallback(() => {
    generation.current++
  }, [])
  const cancel = () => {
    invalidate()
    setSelected(new Set())
    setAccountConsent(false)
    setDeviceConsent(false)
    setDiscard(false)
    lock.current = false
    setBusy(false)
    origin.current.cancel()
  }
  useEffect(() => {
    const changed = () => {
      invalidate()
      setInvalidated(true)
      setSelected(new Set())
      setAccountConsent(false)
      setDeviceConsent(false)
      lock.current = false
      setBusy(false)
      origin.current.cancel()
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, changed)
    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, changed)
      invalidate()
      origin.current.cancel()
    }
  }, [invalidate])
  useEffect(() => {
    if (reviewBinding !== props.bindingKey) {
      invalidate()
      lock.current = false
      setBusy(false)
      setSelected(new Set())
      setAccountConsent(false)
      setDeviceConsent(false)
      setDiscard(false)
      setReviewBinding(props.bindingKey)
      origin.current.cancel()
      origin.current = { bindingKey: props.bindingKey, cancel: props.onCancel }
    }
  }, [props.bindingKey, reviewBinding, props.onCancel, invalidate])
  useEffect(() => {
    if (reviewToken !== candidateToken) {
      invalidate()
      lock.current = false
      setBusy(false)
      setSelected(new Set())
      setAccountConsent(false)
      setDeviceConsent(false)
      setReviewToken(candidateToken)
      origin.current.cancel()
    }
  }, [candidateToken, reviewToken, invalidate])
  useEffect(() => {
    if (conflictReviewToken !== conflictToken) {
      setDiscard(false)
      setConflictReviewToken(conflictToken)
    }
  }, [conflictToken, conflictReviewToken])
  useEffect(() => {
    if (!props.verifiedIdentity || !props.enrolledDevice || props.state === 'revoked') {
      invalidate()
      lock.current = false
      setBusy(false)
      setSelected(new Set())
      setAccountConsent(false)
      setDeviceConsent(false)
      setDiscard(false)
      setInvalidated(true)
      origin.current.cancel()
    }
  }, [props.verifiedIdentity, props.enrolledDevice, props.state, invalidate])
  const allowed =
    reviewToken === candidateToken &&
    reviewBinding === props.bindingKey &&
    props.verifiedIdentity &&
    props.enrolledDevice &&
    !invalidated &&
    props.state !== 'revoked'
  const confirm = async () => {
    if (JSON.stringify(props.candidates) !== reviewToken) {
      cancel()
      setError('The selected draft changed. Review it again.')
      return
    }
    if (!allowed || !accountConsent || !deviceConsent || !selected.size || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    const current = generation.current
    try {
      await props.onSelect(
        props.candidates
          .filter(record => selected.has(record.id))
          .map(record => ({
            recordId: record.id,
            expectedLocalRevision: record.revision,
            expectedDigest: record.digest,
          })),
      )
    } catch {
      if (current === generation.current)
        setError('Sharing was not confirmed. Your local records are preserved.')
    } finally {
      if (current === generation.current) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  const discardLocal = async () => {
    if (
      !allowed ||
      !discard ||
      !props.conflict ||
      lock.current ||
      JSON.stringify(props.conflict) !== conflictReviewToken
    )
      return
    lock.current = true
    setBusy(true)
    const current = generation.current
    try {
      await props.onDiscardLocal(
        props.conflict.recordId,
        props.conflict.revision,
        props.conflict.localMutationId,
      )
    } catch {
      if (current === generation.current)
        setError('The conflict changed. Refresh and review both versions again.')
    } finally {
      if (current === generation.current) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  if (
    invalidated ||
    reviewBinding !== props.bindingKey ||
    !props.verifiedIdentity ||
    !props.enrolledDevice ||
    props.state === 'revoked'
  )
    return (
      <section aria-label="Review shared context">
        <p role="status">
          {props.state === 'revoked'
            ? 'Device access revoked. Sharing is paused.'
            : 'Sharing paused.'}
        </p>
        <p role="alert">
          Account changed. Reopen sharing to review context for the current identity.
        </p>
        <button type="button" onClick={cancel}>
          Cancel and pause
        </button>
      </section>
    )
  return (
    <section aria-label="Review shared context" className="p-4 space-y-4">
      <h2 className="font-semibold text-xl">Choose context to share</h2>
      <p>
        Account: {props.accountLabel} · Device: {props.deviceLabel}
      </p>
      <p>
        Knapsack can recover the encryption keys and decrypt shared records. This is retained
        encrypted storage, separate from this device’s AI processing privacy setting.
      </p>
      <p>
        Share only reviewed text. Credentials, mail databases, media, machine paths, provider
        settings, permissions and approvals are excluded. Text checks cannot detect every pasted
        secret; review the selected content yourself.
      </p>
      <p>
        Prototype limits: 16 KiB per record, 32 lifetime record IDs in this device journal, and 100
        account record IDs including permanent tombstones. Quotas never silently prune history or
        retry receipts.
      </p>
      <p>
        Deletion removes the current shared record. It does not erase existing backups or copies
        already downloaded on other devices.
      </p>
      <p role="status">
        {props.state === 'uncertain'
          ? 'Outcome unknown. Keep the exact encrypted draft and reconcile its original mutation.'
          : `Sharing: ${props.state}`}
      </p>
      {!allowed && (
        <p role="alert">
          Verify the account and enroll this device before sharing. Account changes require a fresh
          review.
        </p>
      )}
      <fieldset disabled={!allowed || busy} className="space-y-2">
        <legend>Select conversations and curated records</legend>
        {props.candidates.map(record => (
          <div key={record.id}>
            <label className="block">
              <input
                type="checkbox"
                checked={selected.has(record.id)}
                onChange={event =>
                  setSelected(previous => {
                    const next = new Set(previous)
                    if (event.target.checked) next.add(record.id)
                    else next.delete(record.id)
                    return next
                  })
                }
              />{' '}
              {record.title} · {record.kind} · Source: {record.sourceLabel}
            </label>
            <details>
              <summary>Review full text</summary>
              <pre className="whitespace-pre-wrap max-h-64 overflow-auto border p-2">
                {record.previewText}
              </pre>
            </details>
          </div>
        ))}
        <label className="block">
          <input
            type="checkbox"
            checked={accountConsent}
            onChange={event => setAccountConsent(event.target.checked)}
          />{' '}
          Share only these reviewed records with this Studio account; I understand
          account-recoverable storage.
        </label>
        <label className="block">
          <input
            type="checkbox"
            checked={deviceConsent}
            onChange={event => setDeviceConsent(event.target.checked)}
          />{' '}
          Enable the selected scope on this device. Signing in alone does not enable sharing.
        </label>
      </fieldset>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!allowed || !accountConsent || !deviceConsent || !selected.size || busy}
          onClick={() => void confirm()}
        >
          Confirm selected sharing
        </button>
        <button type="button" onClick={cancel}>
          Cancel and pause
        </button>
      </div>
      {props.conflict && (
        <section aria-label="Preserved conflict" className="border rounded p-3 space-y-2">
          <p>
            Local draft: {props.conflict.localTitle} · Source: {props.conflict.localSource}
          </p>
          <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
            {props.conflict.localText}
          </pre>
          <p>
            Remote record: {props.conflict.remoteTitle} · Source: {props.conflict.remoteSource} ·
            Revision: {props.conflict.revision}
          </p>
          <pre className="whitespace-pre-wrap max-h-64 overflow-auto">
            {props.conflict.remoteText}
          </pre>
          <p>
            {props.conflict.deleted
              ? 'The remote record is deleted. It will not be restored by an old draft or receipt.'
              : 'Both versions are preserved. No title or body is merged automatically.'}
          </p>
          <label>
            <input
              type="checkbox"
              checked={discard}
              disabled={!allowed || busy}
              onChange={event => setDiscard(event.target.checked)}
            />{' '}
            I reviewed both versions and want to discard this local conflict draft.
          </label>
          <button
            type="button"
            disabled={!allowed || !discard || busy || conflictToken !== conflictReviewToken}
            onClick={() => void discardLocal()}
          >
            Keep remote version
          </button>
        </section>
      )}
      {error && <p role="alert">{error}</p>}
      <p>
        Imported conversations are historical context. Text such as “yes, send it” never grants
        approval or resumes an action.
      </p>
    </section>
  )
}
