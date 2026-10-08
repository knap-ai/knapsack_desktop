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
  return <div className="w-full min-w-0 flex flex-col gap-3 rounded-xl bg-zinc-50 p-4" aria-label="Account computers">
    <button type="button" onClick={props.onDiscover} disabled={busy} aria-expanded={!!data}
      className="self-start flex items-center gap-2 rounded-full bg-zinc-900 text-zinc-200 px-4 py-3 text-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M12 16v5M8 21h8" stroke="currentColor" strokeWidth="2" /></svg>
      {data ? 'Refresh computers' : 'Check computers'}
    </button>
    {data && <>
      <p className="text-xs text-zinc-600">Continue a saved backup here. Work runs on this computer, not remotely.</p>
      <details className="text-sm" open={data.devices.some(row => row.device_id === data.current_device_id && !row.revoked) ? undefined : true}><summary className="cursor-pointer underline">Add or rename this computer</summary><div className="flex flex-wrap gap-2 items-center mt-2">
        <label className="text-sm">Computer name <input value={props.name} maxLength={64} onChange={event => props.onName(event.target.value)} disabled={busy} className="border rounded p-2 max-w-full" /></label>
        <button type="button" className={button} disabled={busy || !props.name.trim()} onClick={props.onRegister}>Add or rename this computer</button>
      </div><p className="text-xs mt-2 text-zinc-600">Only its name, platform and recent presence are shared. Backup stays off until you enable it.</p></details>
      <div className="flex flex-col gap-2" role="group" aria-label="Choose a computer to review">
        {data.devices.map(row => <button key={row.device_id} type="button" className={`${button} text-left`} disabled={busy || row.revoked}
          aria-pressed={selected === row.device_id} onClick={() => props.onSelect(row.device_id)}>
          <span>{row.name}{row.device_id === data.current_device_id ? ' (this computer)' : ''}</span>
          <span className="block text-xs text-zinc-500">{row.revoked ? 'Revoked' : row.recently_seen ? 'Recently seen' : 'Not recently seen'}{row.is_writer ? ' · Saves account backups' : ''}</span>
        </button>)}
      </div>
      {!data.devices.length && <p className="text-sm">No account computers enrolled. Adding this computer shares only its name, platform and recent presence; it does not enable backup.</p>}
      {device && <aside className="flex flex-col gap-2 text-sm" aria-label="Review continuation">
        {device.device_id === data.current_device_id ? <p>You are already working on this computer.</p> : <>
        <p>Selected: {device.name}. Running on {device.name} remotely is unavailable.</p>
        <p>Restore saved notes, goals and follow-ups here. Chat tabs, credentials and permissions stay separate.</p>
        {checkpoint && checkpoint.source_device_id === device.device_id
          ? <p>Backup saved {new Date(checkpoint.created_at).toLocaleString()}. Later changes are not included.</p>
          : <p>No current checkpoint from this computer. Save a checkpoint on the current writer first.</p>}
        {!device.recently_seen && <p>The source may be offline. Its saved backup is still available.</p>}
        {!canContinue && <p role="status">{device.device_id === data.current_device_id ? 'You are already working on this computer.' : !data.devices.some(row => row.device_id === data.current_device_id && !row.revoked) ? 'Add this computer before continuing.' : !account?.account_recovery_available ? 'Account recovery needs setup. Open Backup settings below.' : 'No verified current backup is ready from this computer. Save a backup there, then refresh.'}</p>}
        <p>Continuing keeps your current folder, pauses imported work and makes this computer the backup writer. Fresh Google or Microsoft verification is required. Knapsack’s recovery service can decrypt this backup. Restart and review paused work before resuming.</p>
        <label><input type="checkbox" checked={confirmed} disabled={busy || !canContinue} onChange={event => props.onConfirm(event.target.checked)} /> I reviewed this checkpoint and approve switching this computer to it.</label>
        <button type="button" className={button} disabled={busy || !confirmed || !canContinue} onClick={props.onContinue}>Continue checkpoint on this computer</button>
        <details className="text-xs text-zinc-600"><summary className="cursor-pointer underline">What changes when I continue?</summary><p>Other computers stop uploading backups until you transfer the writer again. Reconnect local permissions after restart; no actions or approvals replay. Canceling after transfer was submitted may not undo it. Refresh account state to check the outcome. Recently seen is presence, not proof of a live connection.</p></details>
        </>}
      </aside>}
    </>}
  </div>
}
