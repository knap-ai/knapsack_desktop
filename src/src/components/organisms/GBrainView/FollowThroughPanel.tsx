import { useCallback, useEffect, useState } from 'react'
import { LoopRun } from 'src/api/loops'
import { FollowThrough, listFollowThrough, extractFollowThrough, decideFollowThrough, linkFollowThrough, saveFollowThroughDraft } from 'src/api/followThrough'
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
  const act = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true); setError('')
    try { await fn(); await onChange() } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }
  const decide = (decision: string) => act(() => decideFollowThrough(item.id, decision,
    decision === 'track' ? Math.floor(new Date(due).getTime() / 1000) : undefined, root))
  const terminal = ['resolved', 'dismissed'].includes(item.status)
  return <article className="CommitmentCard">
    <strong>{label[item.status]}</strong>
    <p><b>{item.proposal.owner}</b> — {item.proposal.action}</p>
    <details><summary>Why Knapsack suggested this</summary><blockquote>{item.proposal.quote}</blockquote><p>From this meeting’s saved transcript or notes. Confirm the owner and meaning before tracking.</p></details>
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
      <label>Remind me if unresolved<input type="datetime-local" value={due} onChange={e => setDue(e.target.value)} /></label>
      <button disabled={busy || !due || !Number.isFinite(new Date(due).getTime())} onClick={() => decide('track')}>{item.status === 'proposed' ? 'Confirm & track' : 'Set next follow-up'}</button>
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
export default function FollowThroughPanel({ run, brainRoot }: { run: LoopRun; brainRoot: string }) {
  const [items, setItems] = useState<FollowThrough[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const refresh = useCallback(async () => {
    const all = await listFollowThrough(brainRoot); setItems(all.filter(i => i.runId === run.id))
  }, [brainRoot, run.id])
  useEffect(() => {
    const update = () => { void refresh().catch(e => setError(String(e))) }
    update(); window.addEventListener('knapsack-follow-through-updated', update)
    return () => window.removeEventListener('knapsack-follow-through-updated', update)
  }, [refresh])
  const discover = async () => {
    if (busy || !run.context) return
    setBusy(true); setError('')
    try {
      const proposals = await extractFollowThrough(run.id, brainRoot)
      await refresh()
      if (!proposals.length) setError('No explicit, evidence-backed commitments found in this meeting.')
    } catch (e) { setError(String(e)) } finally { setBusy(false) }
  }
  if (run.loopId !== 'starter-meeting-follow-up') return null
  return <section className="FollowThroughPanel" aria-label="Commitment follow-through">
    <h4>Keep commitments from slipping</h4>
    <p>Review suggestions, prepare a follow-up, then track replies. Evidence and schedules stay in your local library. Extraction uses your selected AI provider; linked replies use native Gmail. Checks run while Knapsack is open.</p>
    <button disabled={busy || !run.context} onClick={discover}>{busy ? 'Finding supported commitments…' : 'Find commitments in this meeting'}</button>
    {error && <p role="status">{error}</p>}
    {items.filter(i => i.status !== 'dismissed').map(item => <Commitment key={item.id} item={item} root={brainRoot} onChange={refresh} />)}
  </section>
}
