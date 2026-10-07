import MacIMessageSetup from 'src/components/organisms/MacIMessageSetup'
import { useEffect, useRef, useState } from 'react'
import { listLoopDefinitions, listLoopRuns, LoopDefinition, LoopRun, saveLoopDefinition, startLoopRun } from 'src/api/loops'
import { requireFollowUpAiReady } from './followUpReadiness'
import { followUpMailAccounts, readFollowUpThreads, MailProvider } from './mailFollowUps'
import './followUps.scss'
import FollowThroughPanel from 'src/components/organisms/GBrainView/FollowThroughPanel'

const LOOP = 'onboarding-follow-ups'
const definition: LoopDefinition = {
  schemaVersion: 1, id: LOOP, name: 'Find follow-ups I owe', description: 'Review commitments from supplied notes.',
  category: 'Workday', maturity: 'observe', status: 'active', trigger: { kind: 'manual', source: 'Supplied notes', description: 'User supplies notes for review' },
  desiredOutcome: 'User reviews evidence and confirms unresolved commitments.', approvalPolicy: { requiredBeforeExecution: true, description: 'No automatic actions or messages.' },
  verificationRules: [], createdAt: 0, updatedAt: 0,
}
export default function FirstFollowUps({ onFinish, onConfigure }: { onFinish: () => Promise<void>; onConfigure: () => void }) {
  const [source, setSource] = useState(''), [owner, setOwner] = useState(''), [title, setTitle] = useState('')
  const [runs, setRuns] = useState<LoopRun[]>([]), [run, setRun] = useState<LoopRun | null>(null)
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [loading, setLoading] = useState(true)
  const locked = useRef(false), active = useRef(true), cancellation = useRef<AbortController | null>(null)
  useEffect(() => { active.current = true; return () => { active.current = false; cancellation.current?.abort() } }, [])
  const [provider, setProvider] = useState<MailProvider>('gmail')
  const [accounts, setAccounts] = useState<string[]>([]), [account, setAccount] = useState(''), [mailStatus, setMailStatus] = useState('')
  useEffect(() => { let active = true; listLoopRuns(LOOP).then(saved => { if (active) { setRuns(saved); setRun(saved[saved.length - 1] || null) } }).catch(e => { if (active) setError(String(e)) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const prepare = async () => {
    if (locked.current) return
    locked.current = true; setBusy(true); setError('')
    const abort = new AbortController(); cancellation.current = abort
    try {
      await requireFollowUpAiReady()
      if (!active.current || abort.signal.aborted) return
      if (!source.trim() || !owner.trim() || !title.trim()) throw new Error('Supply a source name, your name as used in the notes, and the full conversation or notes including later updates.')
      if (source.length > 22000) throw new Error('Use a source of at most 22,000 characters so all later updates can be checked.')
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([owner.trim().toLowerCase(), source])))
      const runId = 'follow-up-source-' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
      const existing = (await listLoopRuns(LOOP)).find(item => item.id === runId)
      if (existing) { setRun(existing); setSource(''); return }
      const definitions = await listLoopDefinitions()
      if (!definitions.some(item => item.id === LOOP)) await saveLoopDefinition(definition)
      if (!active.current || abort.signal.aborted) return
      const saved = await startLoopRun(LOOP, runId, { subject: title.trim(), targetIdentity: owner.trim(), context: `Source name: ${title.trim()}\nThe user whose commitments to find: ${owner.trim()}\n\n${source}` })
      setRuns(current => [...current, saved]); setRun(saved); setSource('')
    } catch (e) { setError(String(e)) } finally { locked.current = false; setBusy(false) }
  }
  const mail = async (scan: boolean) => {
    if (locked.current) return
    locked.current = true; setBusy(true); setError('')
    const abort = new AbortController(); cancellation.current = abort
    try {
      if (!scan) {
        const available = await followUpMailAccounts(abort.signal, provider); setAccounts(available); setAccount(available[0] || '')
        setMailStatus(available.length ? 'Choose an account. Reading begins only when you click Find in connected mail.' : 'No account is connected for this mail provider. Connect mail separately in Home, then return, or supply notes.')
      } else {
        await requireFollowUpAiReady()
        if (abort.signal.aborted) return
        const result = await readFollowUpThreads(account, abort.signal, provider)
        if (!active.current || abort.signal.aborted) return
        setOwner(result.owner || account); setTitle(`${provider === 'outlook' ? 'Outlook' : 'Gmail'} conversations checked ${new Date().toLocaleString()}`); setSource(result.source)
        setMailStatus(`Read complete latest conversations from at most 10 sent messages in 14 days. ${result.skipped} incomplete, unsupported or oversized conversations skipped. Outlook checks full conversations across your mailbox; large or incomplete conversations are skipped. Missing/deleted messages cannot be verified. Review the source below, then use these notes. This is not a scan of your entire mailbox. Outlook scans stop after 60 seconds. Cancel discards results; reads already started may finish within these bounds.`)
      }
    } catch (e) { setError(String(e)) } finally { locked.current = false; setBusy(false) }
  }
  return <section className="FirstFollowUps" aria-label="Find follow-ups I owe">
    <h1 className="text-3xl font-semibold my-6">Find follow-ups I owe</h1>
    <p>Find commitments in complete Gmail or Outlook mailbox conversations or supply notes including the latest updates. Cloud AI can receive the selected source if you chose cloud inference; local-only mode never falls back to cloud. No messages are sent automatically.</p>
    <div className="my-6 border rounded p-4"><h2 className="font-semibold">Find in connected mail</h2><label className="block">Mail provider<select disabled={busy} value={provider} onChange={e => { setProvider(e.target.value as MailProvider); setAccounts([]); setAccount(''); setMailStatus('') }}><option value="gmail">Gmail</option><option value="outlook">Microsoft Outlook</option></select></label><p>Read at most 10 recent sent messages and their full latest conversations from one account. Calendar access is not needed. Mail permissions are separate from Knapsack account sign-in.</p><button className="underline my-3" disabled={busy} onClick={() => void mail(false)}>Check connected mail accounts</button>{accounts.length > 0 && <><label className="block">Account<select disabled={busy} value={account} onChange={e => setAccount(e.target.value)}>{accounts.map(a => <option key={a}>{a}</option>)}</select></label><button className="underline my-3" disabled={busy || !account} onClick={() => void mail(true)}>Find in connected mail</button></>}{mailStatus && <p role="status">{mailStatus}</p>}</div>
    <p className="my-4 text-sm">Account login and mail/calendar connections are available in Home when needed. Cross-device recovery is not enabled by onboarding; its availability and consent must be checked separately.</p>
    {loading ? <p role="status">Loading saved work…</p> : <>
      {runs.length > 0 && <label className="block my-4">Resume saved source<select className="block border p-2 w-full" value={run?.id || ''} onChange={e => setRun(runs.find(item => item.id === e.target.value) || null)}>{runs.map(item => <option key={item.id} value={item.id}>{item.subject || 'Supplied notes'}</option>)}</select></label>}
      <fieldset disabled={busy} className="my-6 space-y-4">
        <legend className="font-semibold">Review a new source</legend>
        <label className="block">Source name<input className="block w-full border p-2" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block">Your name as used in the notes<input className="block w-full border p-2" maxLength={200} value={owner} onChange={e => setOwner(e.target.value)} /></label>
        <label className="block">Notes or conversation<textarea className="block w-full border p-2" rows={8} maxLength={22000} value={source} onChange={e => setSource(e.target.value)} /></label>
        <p className="text-sm">The source is saved in your existing local work library. You will review suggestions before activating reminders. Canceling leaves saved work available here.</p>
        <button className="rounded bg-zinc-900 text-white px-6 py-3" disabled={!source.trim() || !owner.trim() || !title.trim()} onClick={() => void prepare()}>{busy ? 'Checking selected AI…' : 'Use these notes'}</button>
      </fieldset>
      {run && <>{(run.context?.match(/https:\/\/(?:mail\.google\.com\/mail\/u\/\?authuser=[^\s]+#all\/[a-zA-Z0-9_-]+|outlook\.(?:office\.com|office365\.com|live\.com)\/[^\s]+)/g) || []).map(url => <a className="block underline my-2" key={url} href={url} target="_blank" rel="noreferrer">Open source conversation</a>)}<h2 className="text-xl font-semibold">{run.subject}</h2><details className="my-4"><summary>View saved source</summary><pre className="whitespace-pre-wrap break-words">{run.context}</pre></details><FollowThroughPanel key={run.id} run={run} brainRoot="" afterResults={<MacIMessageSetup />} /></>}
    </>}
    {busy && <button className="underline" onClick={() => { cancellation.current?.abort(); setMailStatus("Canceled. No extraction or action will replay.") }}>Cancel this step</button>}
    {error && <p role="alert" className="my-4 text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-4 my-8"><button className="underline" disabled={busy} onClick={() => void onFinish()}>Continue to Home</button><button className="underline" disabled={busy} onClick={onConfigure}>Set up account or connections in Home</button></div>
  </section>
}
