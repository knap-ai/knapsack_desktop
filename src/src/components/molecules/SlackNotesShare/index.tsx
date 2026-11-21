import { useEffect, useMemo, useRef, useState } from 'react'

import {
  confirmedSlackDestination,
  freshSlackSuggestion,
  slackSuggestionScope,
  warmSlackSuggestion,
  type WarmSlackNotesSuggestion,
  rememberConfirmedSlackDestination,
  sendSlackNotes,
  SlackNotesChannel,
  slackNotesChannels,
  SlackNotesDestination,
  slackNotesSendId,
  SlackNotesWorkspace,
  slackNotesWorkspaces,
} from 'src/api/slackNotes'
import { type MeetingNotesClipboardMetadata, buildSlackNotesMessage, copyMeetingNotesForSlack } from 'src/utils/slackMeetingNotes'

type Props = {
  threadId: number
  userEmail?: string
  calendarAccountEmail?: string
  warmSuggestion?: WarmSlackNotesSuggestion
  reusePreflight?: boolean
  notes: () => Promise<{ markdown: string; title?: string; metadata?: MeetingNotesClipboardMetadata }>
  onClose: () => void
}
type Preview = {
  destination: SlackNotesDestination
  workspace: string
  channel: string
  message: ReturnType<typeof buildSlackNotesMessage>
}
function nameCounts(rows: { name: string }[]) {
  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.name, (counts.get(row.name) || 0) + 1)
  return counts
}
export default function SlackNotesShare({ threadId, userEmail, calendarAccountEmail, warmSuggestion, reusePreflight, notes, onClose }: Props) {
  const [owner, setOwner] = useState(''),
    [workspaces, setWorkspaces] = useState<SlackNotesWorkspace[]>([]),
    [account, setAccount] = useState(''),
    [channels, setChannels] = useState<SlackNotesChannel[]>([]),
    [channelLoading, setChannelLoading] = useState(false),
    [channelError, setChannelError] = useState(''),
    [channelAttempt, setChannelAttempt] = useState(0),
    [selected, setSelected] = useState(''),
    [preview, setPreview] = useState<Preview>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [status, setStatus] = useState(''),
    [channelWarnings, setChannelWarnings] = useState<string[]>([]),
    [posting, setPosting] = useState(false),
    [inventoryWarnings, setInventoryWarnings] = useState<string[]>([]),
    [discovering, setDiscovering] = useState(true)
  const scope = slackSuggestionScope(threadId, userEmail, calendarAccountEmail),
    live = useRef(scope)
  live.current = scope
  const epoch = useRef(0),
    locked = useRef(false),
    lifetime = useRef(0),
    suggested = useRef<SlackNotesDestination>(),
    inventoryOwner = useRef(''),
    warmed = useRef<WarmSlackNotesSuggestion>(),
    usingWarmList = useRef(false),
    root = useRef<HTMLDivElement>(null)
  const scopeCurrent = () => scope === live.current && scope === slackSuggestionScope(threadId, userEmail, calendarAccountEmail)
  const current = (token: number) => token === epoch.current && scopeCurrent()
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ++epoch.current
    ++lifetime.current
    inventoryOwner.current = ''
    warmed.current = undefined
    usingWarmList.current = false
    suggested.current = undefined
    setOwner('')
    setWorkspaces([])
    setAccount('')
    setSelected('')
    setError('')
    setStatus('')
    let disposed = false
    const currentInventory = () => !disposed && scopeCurrent()
    root.current?.focus()
    setDiscovering(true)
    const load = async () => {
      const fromWarm = freshSlackSuggestion(warmSuggestion, scope) ??
        (reusePreflight ? await warmSlackSuggestion(threadId, userEmail, calendarAccountEmail) : undefined)
      if (!currentInventory()) return
      const initial = freshSlackSuggestion(fromWarm, scope)
      warmed.current = initial
      const data = initial?.inventory ?? await slackNotesWorkspaces()
      if (!currentInventory()) return
      const saved = initial?.destination ?? await confirmedSlackDestination(data.owner, calendarAccountEmail)
      if (!currentInventory()) return
      inventoryOwner.current = data.owner
      setOwner(data.owner)
      setWorkspaces(data.accounts)
      setInventoryWarnings(data.warnings || [])
      const matches = saved
        ? data.accounts.filter(w => !w.unavailable && w.accountId === saved.accountId && w.teamId === saved.teamId)
        : []
      if (saved && matches.length === 1 &&
          data.accounts.filter(w => w.accountId === saved.accountId).length === 1) {
        suggested.current = saved
        setAccount(matches[0].accountId)
      } else if (saved)
        setError(
          'Saved Slack destination is unavailable. Choose a workspace and channel; no replacement was selected.',
        )
    }
    void load().catch(e => {
      if (currentInventory()) setError(e instanceof Error ? e.message : 'Could not load Slack workspaces.')
    }).finally(() => { if (currentInventory()) setDiscovering(false) })
    return () => {
      disposed = true
      epoch.current++
      lifetime.current++
      previous?.focus()
    }
    // The scope binds all authority inputs; late warm props must not reset a user's manual selection.
  }, [scope, calendarAccountEmail, reusePreflight, threadId, userEmail])
  const workspace = workspaces.find(w => w.accountId === account && !w.unavailable)
  const workspaceNames = useMemo(() => nameCounts(workspaces), [workspaces])
  const channelNames = useMemo(() => nameCounts(channels), [channels])
  useEffect(() => {
    setChannels([])
    setChannelWarnings([])
    setPreview(undefined)
    setChannelError('')
    setSelected('')
    if (!owner || !workspace) {
      setChannelLoading(false)
      return
    }
    const token = ++epoch.current
    const abort = new AbortController()
    const deadline = setTimeout(() => {
      abort.abort()
      if (!current(token)) return
      setChannelLoading(false)
      setChannelError('Slack took too long to list channels. Retry, or copy your notes.')
    }, 15_000)
    setChannelLoading(true)
    const initial = freshSlackSuggestion(warmed.current, scope)
    const useWarm = initial && channelAttempt === 0 && suggested.current &&
      initial.destination.owner === owner && initial.destination.accountId === workspace.accountId &&
      initial.destination.teamId === workspace.teamId ? initial : undefined
    usingWarmList.current = !!useWarm
    const list = useWarm ? Promise.resolve(useWarm.listed)
      : slackNotesChannels({ owner, accountId: workspace.accountId, teamId: workspace.teamId }, abort.signal)
    list.then(data => {
        if (abort.signal.aborted || !current(token)) return
        setChannels(data.channels)
        setChannelWarnings(data.warnings || [])
        const hint = suggested.current
        suggested.current = undefined
        if (hint && hint.accountId === workspace.accountId && hint.teamId === workspace.teamId) {
          if (data.channels.some(c => c.id === hint.channelId)) setSelected(hint.channelId)
          else setChannelError('Previously used channel is unavailable. Choose a channel explicitly.')
        }
      })
      .catch(e => {
        if (!current(token) || abort.signal.aborted) return
        const message = e instanceof Error ? e.message : ''
        setChannelError(/permissions|revoked|expired|rate limit|changed|disabled/i.test(message)
          ? message : 'Could not load Slack channels. Retry, or copy your notes.')
      })
      .finally(() => {
        clearTimeout(deadline)
        if (current(token) && !abort.signal.aborted) setChannelLoading(false)
      })
    return () => { clearTimeout(deadline); abort.abort(); epoch.current++ }
  }, [owner, workspace?.accountId, workspace?.teamId, scope, channelAttempt])
  const choose = (id: string) => {
    suggested.current = undefined
    setSelected(id)
    setPreview(undefined)
    setChannelError('')
    setStatus('')
  }
  const action = async (kind: 'copy' | 'preview' | 'send') => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    setStatus('')
    const token = epoch.current
    const started = lifetime.current
    const active = () => kind === 'copy'
      ? started === lifetime.current && scopeCurrent()
      : current(token)
    try {
      if (kind === 'copy') {
        const value = await notes()
        if (!active()) return
        await copyMeetingNotesForSlack(value.markdown, value.title, value.metadata)
        if (active()) setStatus('Copied for Slack. Paste into any conversation.')
      }
      if (kind === 'preview') {
        if (usingWarmList.current && !freshSlackSuggestion(warmed.current, scope)) {
          setChannelAttempt(value => value + 1)
          return
        }
        const channel = channels.find(c => c.id === selected)
        if (channelLoading || !workspace || !channel)
          throw new Error('Choose a connected workspace and available channel.')
        const destination = {
          owner,
          accountId: workspace.accountId,
          teamId: workspace.teamId,
          channelId: channel.id,
        }
        const value = await notes()
        if (!active()) return
        setPreview({
          destination,
          workspace: workspace.name,
          channel: channel.name,
          message: buildSlackNotesMessage(value.markdown, value.title),
        })
      }
      if (kind === 'send' && preview && !channelLoading && workspace?.accountId === preview.destination.accountId &&
        workspace.teamId === preview.destination.teamId && channels.some(c => c.id === preview.destination.channelId)) {
        setPosting(true)
        const id = await slackNotesSendId(preview.destination, preview.message)
        if (!active()) return
        const receipt = await sendSlackNotes(preview.destination, preview.message, id)
        if (active()) {
          if (
            receipt.state !== 'sent' || typeof receipt.ts !== 'string' || !receipt.ts.trim() ||
            receipt.channelId !== preview.destination.channelId ||
            receipt.teamId !== preview.destination.teamId
          )
            throw new Error('Unexpected destination receipt. Verify Slack before resending.')
          void rememberConfirmedSlackDestination(preview.destination, calendarAccountEmail, receipt,
            () => active() && inventoryOwner.current === preview.destination.owner).catch(() => {})
          setStatus(`Sent to ${preview.workspace} / #${preview.channel}.`)
          setPreview(undefined)
        }
      }
    } catch (e) {
      if (active())
        setError(
          e instanceof Error
            ? e.message
            : 'Slack sharing failed. Verify the channel before retrying a send.',
        )
    } finally {
      locked.current = false
      if (active()) {
        setBusy(false)
        setPosting(false)
      }
    }
  }
  return (
    <div className="slack-notes-backdrop">
      <div
        ref={root}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-busy={busy || discovering || channelLoading}
        aria-label="Copy or send notes to Slack"
        onKeyDown={e => {
          if (e.key === 'Escape' && !posting) {
            e.stopPropagation()
            onClose()
          }
          if (e.key === 'Tab') {
            const controls = Array.from(
              root.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), select:not(:disabled), [tabindex="0"]',
              ) || [],
            )
            const first = controls[0],
              last = controls[controls.length - 1]
            if (
              e.shiftKey &&
              (document.activeElement === first || document.activeElement === root.current)
            ) {
              e.preventDefault()
              last?.focus()
            } else if (
              !e.shiftKey &&
              (document.activeElement === last || document.activeElement === root.current)
            ) {
              e.preventDefault()
              first?.focus()
            }
          }
        }}
        className="slack-notes-dialog"
      >
        <h2>Share to Slack</h2>
        <p>Choose a workspace and channel, then review your notes before sending.</p>
        <button disabled={busy} onClick={() => action('copy')}>
          Copy for Slack
        </button>
        <label>
          Workspace{' '}
          <select
            aria-label="Slack workspace"
            disabled={busy || discovering}
            value={account}
            onChange={e => {
              suggested.current = undefined
              setAccount(e.target.value)
              setSelected('')
              setPreview(undefined)
              setError('')
              setStatus('')
            }}
          >
            <option value="">{discovering ? 'Loading connected workspaces…' : 'Choose workspace'}</option>
            {workspaces.map(w => (
              <option key={w.accountId} value={w.accountId} disabled={w.unavailable}>
                {w.unavailable && w.name === w.accountId ? 'Slack workspace' : w.name}{w.unavailable ? ' (unavailable)' : ''}
                {(workspaceNames.get(w.name) || 0) > 1 &&
                  ` · ${w.source === 'studio' ? 'Studio' : w.source === 'gateway' ? 'Scout' : 'workspace'} ${w.teamId?.slice(-4) || w.accountId.slice(-4)}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Channel{' '}
          <select
            aria-label="Slack channel"
            disabled={busy || channelLoading || !workspace || !channels.length}
            value={selected}
            onChange={e => choose(e.target.value)}
          >
            <option value="">
              {channelLoading
                ? 'Loading channels…'
                : !workspace
                  ? 'Choose a workspace first'
                  : !channels.length
                    ? 'No channels available'
                    : 'Choose channel'}
            </option>
            {channels.map(c => (
              <option key={c.id} value={c.id}>
                {c.name === c.id ? 'Unnamed channel' : `#${c.name}`}{c.private ? ' · private' : ''}
                {(c.name === c.id || (channelNames.get(c.name) || 0) > 1) && ` · ${c.id.slice(-4)}`}
              </option>
            ))}
          </select>
        </label>
        {inventoryWarnings.map(warning => (
          <p role="status" key={warning}>
            {warning}
          </p>
        ))}
        {channelWarnings.map(warning => (
          <p role="status" key={warning}>
            {warning}
          </p>
        ))}
        {workspace && !channelLoading && !channelError && !channels.length && (
          <p>No joined channels are available with this connection.</p>
        )}
        <p>
          A successful send can suggest a destination for this calendar next time. Nothing posts automatically.
        </p>
        <button disabled={busy || channelLoading || !selected} onClick={() => action('preview')}>
          Preview send to channel
        </button>
        {preview && (
          <section aria-label="Slack send preview">
            <h3>
              {preview.workspace} ({preview.destination.teamId}) / #{preview.channel} (
              {preview.destination.channelId})
            </h3>
            {preview.message.blocks.map((b, i) =>
              b.type === 'table' ? (
                <table key={i}>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((c, j) =>
                          r === 0 ? <th key={j}>{c.text}</th> : <td key={j}>{c.text}</td>,
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ whiteSpace: 'pre-wrap' }} key={i}>
                  {b.text.text}
                </p>
              ),
            )}
            <button disabled={busy} onClick={() => action('send')}>
              Send these notes to #{preview.channel}
            </button>
            <button disabled={busy} onClick={() => setPreview(undefined)}>
              Cancel send
            </button>
          </section>
        )}
        {channelLoading && <p role="status">Checking available Slack channels. You can copy your notes now.</p>}
        {busy && <p role="status">{posting ? 'Sending notes…' : 'Preparing notes…'}</p>}
        {channelError && <p role="alert">{channelError}</p>}
        {workspace && channelError && !channelLoading && !channels.length && (
          <button type="button" disabled={busy} onClick={() => setChannelAttempt(value => value + 1)}>Retry loading channels</button>
        )}
        {error && <p role="alert">{error}</p>}
        {status && <p role="status">{status}</p>}
        <button disabled={posting} onClick={onClose}>
          Close
        </button>
        {!discovering && !workspaces.length && (
          <button
            type="button"
            onClick={() => {
              onClose()
              window.dispatchEvent(new Event('knapsack:connect-slack'))
            }}
          >
            Connect Slack
          </button>
        )}
        {!discovering && !workspaces.length && (
          <p>Connect Slack to send notes directly. You can always copy notes without connecting.</p>
        )}
      </div>
    </div>
  )
}
