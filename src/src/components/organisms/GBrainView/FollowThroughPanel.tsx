import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { LoopRun } from 'src/api/loops'
import { FollowThrough, listFollowThrough, extractFollowThrough, decideFollowThrough, linkFollowThrough, saveFollowThroughDraft } from 'src/api/followThrough'
import { useRef } from 'react'
import { requireFollowUpAiReady } from 'src/pages/onboarding/followUpReadiness'
import { KN_SERVER_HOST } from 'src/utils/constants'

const label: Record<FollowThrough['status'], string> = {
  proposed: 'Suggested commitment', tracking: 'Tracking', attention: 'Needs your attention',
  reply_received: 'Reply received — review the outcome', resolved: 'Resolved by you', paused: 'Paused', dismissed: 'Dismissed',
}
async function jsonRequest(path: string, body: unknown) {
  const response = await fetch(`${KN_SERVER_HOST}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}
function Commitment({ item, root, onChange }: { item: FollowThrough; root: string; onChange: () => Promise<void> }) {
  const [due, setDue] = useState(''), [draft, setDraft] = useState(item.proposal.draft)
  const [accounts, setAccounts] = useState<string[]>([]), [account, setAccount] = useState(item.account || '')
  const [recipient, setRecipient] = useState(item.recipient || ''), [sentId, setSentId] = useState(item.sentId || '')
  const [sentMessages, setSentMessages] = useState<Array<{ id: string; label: string }>>([])
  const [linking, setLinking] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const actionLock = useRef(false)
  const act = async (fn: () => Promise<unknown>) => {
    if (actionLock.current) return
    actionLock.current = true
    setBusy(true); setError('')
    try { await fn(); await onChange() } catch (e) { setError(String(e)) } finally { actionLock.current = false; setBusy(false) }
  }
  const decide = (decision: string) => act(() => decideFollowThrough(item.id, decision,
    decision === 'track' ? Math.floor(new Date(due).getTime() / 1000) : undefined, root))
  const terminal = ['resolved', 'dismissed'].includes(item.status)
  return <article className="CommitmentCard">
    <strong>{!item.sentId && item.status === 'tracking' ? 'Reminder scheduled' : !item.sentId && item.status === 'attention' ? 'Reminder due' : label[item.status]}</strong>
    <p><b>{item.proposal.owner}</b> — {item.proposal.action}</p>
    <p>Confidence: unscored candidate. Exact source evidence is required; current completion status still needs your review.</p><details><summary>Why Knapsack suggested this</summary><blockquote>{item.proposal.quote}</blockquote><p>From the saved source. This is an uncertain candidate, not proof that the commitment is still open. Confirm ownership and check the latest conversation for completion, cancellation, or a reply before tracking.</p></details>
    {!terminal && <details><summary>Follow-up draft</summary>
      <label>Edit draft<textarea value={draft} onChange={e => setDraft(e.target.value)} rows={5} /></label>
      <button disabled={busy || !draft.trim()} onClick={() => act(() => saveFollowThroughDraft(item.id, draft, root))}>Save draft</button>
      <button disabled={busy || !draft.trim()} onClick={() => act(async () => { await saveFollowThroughDraft(item.id, draft, root); await navigator.clipboard.writeText(draft) })}>Save & copy draft</button>
      <p>Copying does not send or verify delivery.</p>
    </details>}
    {item.dueAt && <p>Follow-up time: {new Date(item.dueAt * 1000).toLocaleString()}</p>}
    {item.threadId && item.account && <a href={`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(item.account)}#all/${encodeURIComponent(item.threadId)}`} target="_blank" rel="noreferrer">Open linked Gmail conversation</a>}
    {item.lastCheckedAt && <p>{item.sentId ? 'Last successful Gmail check' : 'Last reminder check'}: {new Date(item.lastCheckedAt * 1000).toLocaleString()}</p>}
    {item.checkError && <p role="alert">Could not check Gmail: {item.checkError}. Reply status is unknown.</p>}
    {!item.sentId && !terminal && <p>Reply tracking starts after you link a sent Gmail message. Until then, this is a reminder only.</p>}
    {['proposed', 'paused', 'tracking', 'attention', 'reply_received'].includes(item.status) && <div className="CommitmentActions">
      <label><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /> I owe this and checked the latest source; it is still unresolved.</label>
      <label>Remind me if unresolved<input type="datetime-local" value={due} onChange={e => setDue(e.target.value)} /></label>
      <button disabled={busy || !reviewed || !due || !Number.isFinite(new Date(due).getTime())} onClick={() => decide('track')}>{item.status === 'proposed' ? (item.sentId ? 'Confirm & track Gmail replies' : 'Confirm & remind me') : 'Set next reminder'}</button>
      {!['proposed', 'paused'].includes(item.status) && <button disabled={busy} onClick={() => decide('pause')}>Pause</button>}
      <button disabled={busy} onClick={() => decide('resolve')}>Mark resolved</button>
      <button disabled={busy} onClick={() => decide('dismiss')}>Dismiss</button>
    </div>}
    {['tracking', 'attention'].includes(item.status) && <button disabled={busy} onClick={() => act(async () => {
      const data = await jsonRequest('/api/clawd/gmail/read', { action: 'accounts' }); setAccounts(data.accounts || []); setLinking(true)
    })}>{item.sentId ? 'Change linked message' : 'Link sent Gmail message'}</button>}
    {linking && !terminal && <fieldset disabled={busy}>
      <legend>Verify delivery and watch for a reply</legend>
      <label>Sending account<select value={account} onChange={e => { setAccount(e.target.value); setSentMessages([]); setSentId('') }}><option value="">Choose connected account</option>{accounts.map(a => <option key={a}>{a}</option>)}</select></label>
      <label>Recipient email<input type="email" value={recipient} onChange={e => { setRecipient(e.target.value); setSentMessages([]); setSentId('') }} /></label>
      <button disabled={!account || !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(recipient)} onClick={() => act(async () => {
        const listing = await jsonRequest('/api/clawd/gmail/read', { action: 'list', account_email: account, query: `in:sent to:${recipient}`, max_results: 10 })
        const messages = await Promise.all((listing.result?.messages || []).map(async (message: { id: string }) => {
          const data = await jsonRequest('/api/clawd/gmail/read', { action: 'get', account_email: account, message_id: message.id })
          const headers = data.result?.payload?.headers || []
          const header = (name: string) => headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name)?.value || ''
          return { id: message.id, label: `${header('subject') || '(No subject)'} — ${header('date')}` }
        }))
        setSentMessages(messages); setSentId('')
        if (!messages.length) throw new Error('No sent messages found for this recipient in the selected account.')
      })}>Find recent sent messages</button>
      {sentMessages.length > 0 && <label>Which message contains your follow-up?<select value={sentId} onChange={e => setSentId(e.target.value)}><option value="">Choose sent message</option>{sentMessages.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label>}
      <p>Knapsack verifies the selected sent message and recipient, then checks only that conversation through Google’s API.</p>
      <button disabled={!account || !recipient || !sentId} onClick={() => act(async () => { await linkFollowThrough(item.id, account, recipient, sentId, root); setLinking(false) })}>Verify & link</button>
    </fieldset>}
    {item.status === 'reply_received' && <p>A later message from the selected recipient was found. Review it before marking the commitment resolved.</p>}
    {error && <p role="alert">{error}</p>}
  </article>
}
export default function FollowThroughPanel({ run, brainRoot, afterResults }: { run: LoopRun; brainRoot: string; afterResults?: ReactNode }) {
  const [items, setItems] = useState<FollowThrough[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const refresh = useCallback(async () => {
    const all = await listFollowThrough(brainRoot); setItems(all.filter(i => i.runId === run.id))
  }, [brainRoot, run.id])
  useEffect(() => {
    const update = () => { void refresh().catch(e => setError(String(e))) }
    update(); window.addEventListener('knapsack-follow-through-updated', update)
    return () => window.removeEventListener('knapsack-follow-through-updated', update)
  }, [refresh])
  const active = useRef(true)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [run.id])
  const extractionLock = useRef(false)
  const discover = async () => {
    if (extractionLock.current || !run.context) return
    extractionLock.current = true
    setBusy(true); setError('')
    try {
      if (run.loopId === 'onboarding-follow-ups') {
        await requireFollowUpAiReady()
      }
      if (!active.current) return
      const proposals = await extractFollowThrough(run.id, brainRoot)
      if (!active.current) return
      await refresh()
      if (!proposals.length) setError('No explicit, evidence-backed commitments found in this source.')
    } catch (e) { if (active.current) setError(String(e)) } finally { extractionLock.current = false; if (active.current) setBusy(false) }
  }
  if (!['starter-meeting-follow-up', 'onboarding-follow-ups'].includes(run.loopId)) return null
  return <section className="FollowThroughPanel" aria-label="Commitment follow-through">
    <h4>Keep commitments from slipping</h4>
    <p>Review suggestions and schedule reminders. Automatic reply checks are available only after linking a sent Gmail message; Outlook replies are not monitored automatically. Evidence and schedules stay in your local library. Extraction uses your selected AI provider. Checks run while Knapsack is open.</p>
    <button disabled={busy || !run.context} onClick={discover}>{busy ? 'Finding supported commitments…' : 'Find candidate follow-ups'}</button>
    {error && <p role="status">{error}</p>}
    {items.filter(i => i.status !== 'dismissed').map(item => <Commitment key={item.id} item={item} root={brainRoot} onChange={refresh} />)}
    {items.length > 0 && afterResults}
  </section>
}
