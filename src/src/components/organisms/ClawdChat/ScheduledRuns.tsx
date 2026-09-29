import { useCallback, useEffect, useRef, useState } from 'react'
import { ScheduledTask, scheduledTaskOwner, formatScheduledTaskCadence, formatScheduledTaskDelivery } from 'src/utils/scheduledRuns'
import './scheduledRuns.scss'

const endpoint = 'http://127.0.0.1:8897/api/clawd/scheduled-tasks'

export default function ScheduledRuns({ agentId, agentName, active, onDraft }: {
  agentId: string; agentName: string; active: boolean; onDraft: (text: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); trigger.current?.focus() }
  const request = useRef(0)
  const toggleInFlight = useRef(false)
  const refresh = useCallback(async () => {
    const id = ++request.current
    setLoading(true)
    setError('')
    try {
      const response = await fetch(endpoint)
      const body = await response.json()
      if (!response.ok || !body.success) throw new Error(body.message || 'Could not load scheduled runs.')
      if (id === request.current) setTasks(Array.isArray(body.tasks) ? body.tasks : [])
    } catch (err) {
      if (id === request.current) setError(err instanceof Error ? err.message : 'Could not load scheduled runs.')
    } finally {
      if (id === request.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    if (!active) return
    void refresh()
    const timer = setInterval(() => void refresh(), 60_000)
    return () => { clearInterval(timer); request.current++ }
  }, [active, refresh])

  const own = tasks.filter(task => scheduledTaskOwner(task) === agentId)
  const shared = tasks.filter(task => !scheduledTaskOwner(task))
  const draft = (task?: ScheduledTask) => {
    onDraft(task
      ? `Update scheduled task “${task.name}” (ID: ${task.id}). Show me its current schedule and instructions, then ask what I want to change before applying it.`
      : `Help me create a scheduled run for ${agentName}. Associate it with my agent session ui-agent-${agentId}. Ask what it should do, when it should run, and where to deliver the result. Show me the proposal before creating it.`)
    close()
  }
  const toggle = async (task: ScheduledTask) => {
    if (toggleInFlight.current) return
    toggleInFlight.current = true
    setBusy(task.id)
    setError('')
    ++request.current // Discard reads started before this change.
    try {
      const response = await fetch(`${endpoint}/${encodeURIComponent(task.id)}/enabled`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !task.enabled }),
      })
      const body = await response.json()
      if (!response.ok || !body.success) throw new Error(body.message || 'Could not update this run.')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this run.')
    } finally { toggleInFlight.current = false; setBusy(null) }
  }
  const cards = (items: ScheduledTask[]) => items.map(task => <article className="ScheduledRunCard" key={task.id}>
    <div className="ScheduledRunHeading"><strong>{task.name}</strong><span>{task.enabled ? 'Active' : 'Paused'}</span></div>
    <p>{formatScheduledTaskCadence(task.schedule)}</p>
    <p>{task.enabled && task.next_run_at_ms ? `Next run: ${new Date(task.next_run_at_ms).toLocaleString()}` : 'No next run scheduled'} · {formatScheduledTaskDelivery(task.delivery)}</p>
    <div className="ScheduledRunActions">
      <button type="button" disabled={busy !== null} onClick={() => void toggle(task)}>{busy === task.id ? 'Saving…' : task.enabled ? 'Pause' : 'Resume'}</button>
      <button type="button" onClick={() => draft(task)}>Edit in chat</button>
    </div>
  </article>)

  return <>
    <button ref={trigger} type="button" className={open ? 'toggle-on' : ''} aria-expanded={open}
      title={`View ${agentName}'s scheduled runs`} onClick={() => { setOpen(!open); if (!open) void refresh() }}>
      Scheduled runs{own.length ? ` (${own.length})` : ''}
    </button>
    {open && active && <div className="ScheduledRunsBackdrop" onClick={close}>
      <section className="ScheduledRunsPanel" role="dialog" aria-modal="true" aria-label={`${agentName}'s scheduled runs`}
        onClick={event => event.stopPropagation()} onKeyDown={event => {
          if (event.key === 'Escape') { event.stopPropagation(); close() }
          if (event.key === 'Tab') {
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), summary'))
              .filter(element => element.getClientRects().length > 0)
            const first = controls[0], last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
          }
        }}>
        <header><div><h2>{agentName}’s scheduled runs</h2><p>Recurring work and reminders for this teammate.</p></div>
          <button type="button" autoFocus aria-label="Close scheduled runs" onClick={close}>×</button></header>
        <div className="ScheduledRunActions"><button type="button" onClick={() => draft()}>New scheduled run</button>
          <button type="button" disabled={loading || busy !== null} onClick={() => void refresh()}>{loading ? 'Refreshing…' : 'Refresh'}</button></div>
        {error && <p role="alert">{error}</p>}
        {!loading && !error && own.length === 0 && <p>No scheduled runs for {agentName} yet. Create one in this chat.</p>}
        {cards(own)}
        {shared.length > 0 && <details><summary>Shared / unassigned ({shared.length})</summary>
          <p>These runs have no teammate assigned. They are shown separately from {agentName}’s work.</p>{cards(shared)}</details>}
      </section>
    </div>}
  </>
}
