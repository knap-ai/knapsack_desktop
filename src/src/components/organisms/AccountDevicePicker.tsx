import type { AccountDeviceDirectory, StateBackupStatus } from 'src/api/stateBackup'

type Props = {
  directory: AccountDeviceDirectory | null
  status: StateBackupStatus | null
  busy: boolean
  name: string
  selected: string | null
  confirmed: boolean
  onDiscover: () => void
  onName: (value: string) => void
  onRegister: () => void
  onSelect: (value: string) => void
  onConfirm: (value: boolean) => void
  onContinue: () => void
}
const button = 'rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50'

/** Pure review surface; the parent uses existing serialized backup operations. */
export default function AccountDevicePicker(props: Props) {
  const { directory: data, status, selected, confirmed, busy } = props
  const device = data?.devices.find(row => row.device_id === selected)
  const checkpoint = data?.checkpoint
  const account = data?.account
  const canContinue = !!data && !!device && !!checkpoint && !!account && !!status &&
    data.devices.some(row => row.device_id === data.current_device_id && !row.revoked) &&
    device.device_id !== data.current_device_id && !device.revoked && device.is_writer && account.enabled &&
    checkpoint.source_device_id === device.device_id && checkpoint.revision === account.revision &&
    checkpoint.snapshot_id === account.latest_snapshot_id && account.device_id === device.device_id &&
    account.account_recovery_available === true && account.account_recovery_unavailable_reason === null &&
    account.recovery_mode === 'account_recovery_v1' &&
    (status.ownerAccountId === null || status.ownerAccountId === account.account_id)
  return <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4" aria-label="Account computers">
    <button type="button" onClick={props.onDiscover} disabled={busy} aria-expanded={!!data}
      className="self-start flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-200 px-4 py-3 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M12 16v5M8 21h8" stroke="currentColor" strokeWidth="2" /></svg>
      {data?.devices.some(row => row.device_id === data.current_device_id && row.recently_seen) ? <>Connected with your computer <span aria-hidden="true">✓</span></> : 'Work on this computer'}
    </button>
    <p className="text-xs text-zinc-600">Work runs on this computer. Check account devices to review an encrypted checkpoint from another computer. This is checkpoint continuation, not a live remote connection.</p>
    {data && <>
      <p className="text-xs text-zinc-600">Checking devices refreshes presence for this computer if you have already added it. “Recently seen” does not mean remotely reachable.</p>
      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-sm">Computer name <input value={props.name} maxLength={64} onChange={event => props.onName(event.target.value)} disabled={busy} className="border rounded p-2 max-w-full" /></label>
        <button type="button" className={button} disabled={busy || !props.name.trim()} onClick={props.onRegister}>Add or rename this computer</button>
      </div>
      <div className="flex flex-col gap-2" role="group" aria-label="Choose a computer to review">
        {data.devices.map(row => <button key={row.device_id} type="button" className={`${button} text-left`} disabled={busy || row.revoked}
          aria-pressed={selected === row.device_id} onClick={() => props.onSelect(row.device_id)}>
          <span>{row.name}{row.device_id === data.current_device_id ? ' (this computer)' : ''}</span>
          <span className="block text-xs text-zinc-500">{row.platform} · {row.revoked ? 'Revoked' : row.recently_seen ? 'Recently seen' : 'Offline or not recently seen'} · {row.is_writer ? 'Account checkpoint writer' : 'Not the checkpoint writer'}</span>
        </button>)}
      </div>
      {!data.devices.length && <p className="text-sm">No account computers enrolled. Adding this computer shares only its name, platform and recent presence; it does not enable backup.</p>}
      {device && <aside className="flex flex-col gap-2 text-sm" aria-label="Review continuation">
        <p>Selected: {device.name}. Execution stays on this computer. Running on {device.name} remotely is unavailable.</p>
        <p>Checkpoint sync transfers eligible GBrain notes, goals and follow-ups. Chat tabs, Studio saved chats, credentials and OS permissions are not transferred.</p>
        {checkpoint && checkpoint.source_device_id === device.device_id
          ? <p>Latest checkpoint: revision {checkpoint.revision}, saved {checkpoint.created_at}. Work since that checkpoint is not included.</p>
          : <p>No current checkpoint from this computer. Save a checkpoint on the current writer first.</p>}
        {!device.recently_seen && <p>The source may be offline. Only its saved checkpoint can be continued.</p>}
        <label><input type="checkbox" checked={confirmed} disabled={busy || !canContinue} onChange={event => props.onConfirm(event.target.checked)} /> I reviewed this checkpoint and want to continue here. Preserve my current root, pause imported work and transfer checkpoint writer authority after verification.</label>
        <button type="button" className={button} disabled={busy || !confirmed || !canContinue} onClick={props.onContinue}>Continue checkpoint on this computer</button>
        <p className="text-xs text-zinc-600">This reuses verified backup restore with a reviewed writer and revision. Fresh Google or Microsoft verification is required. Restart after restore, reconnect local permissions, then explicitly review any paused work before activation. Nothing is sent or automatically replayed. If cancellation arrives after writer transfer was submitted, refresh account state and use the restore controls below to reconcile; cancellation does not roll back server authority.</p>
      </aside>}
    </>}
  </div>
}
