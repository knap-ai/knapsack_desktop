import AccountDevicePicker from './AccountDevicePicker'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getAccountDevices,
  registerAccountDevice,
  type AccountDeviceDirectory,
  backUpStateNow,
  disableStateBackup,
  enableStateBackup,
  getStateBackupAccount,
  getStateBackupStatus,
  restoreStateBackup,
  stateBackupErrorMessage,
  stateBackupRecoveryBlocker,
  verifyStateBackupIdentity,
  cancelStateBackupIdentity,
  cancelStateBackupOperation,
  migrateLegacyStateBackup,
  type StateBackupAccount,
  type StateBackupStatus,
} from 'src/api/stateBackup'

import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/api/dialog'

type Form = 'setup' | 'restore' | null
type Action = 'devices' | 'register-device' | 'account' | 'verify' | 'enable' | 'backup' | 'disable' | 'restore' | 'migrate'

// Settings lives inside a portal that unmounts on close. Keep only operation metadata across
// remounts so closing the panel cannot queue a second request or hide a required app restart.
// Encryption keys never enter this UI; account data is never stored here.
const operation = {
  pending: null as Action | null,
  restartRequired: false,
  restoreNeedsVerification: false,
  migrated: false,
  observers: new Set<(refresh: boolean) => void>(),
}
const notifyOperation = (refresh = false) => operation.observers.forEach(update => update(refresh))

const buttonClass =
  'rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'

export default function StateBackupControl({ isOpen = true, onSignIn }: { isOpen?: boolean; onSignIn?: () => void }) {
  const [devices, setDevices] = useState<AccountDeviceDirectory | null>(null)
  const [deviceName, setDeviceName] = useState('My computer')
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [confirmedContinuation, setConfirmedContinuation] = useState(false)
  const [status, setStatus] = useState<StateBackupStatus | null>(null)
  const [account, setAccount] = useState<StateBackupAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [accountWatchReady, setAccountWatchReady] = useState(false)
  const [pending, setPending] = useState<Action | null>(operation.pending)
  const [form, setForm] = useState<Form>(null)
  const [confirmedAccountRecovery, setConfirmedAccountRecovery] = useState(false)
  const [confirmedCloud, setConfirmedCloud] = useState(false)
  const [confirmedRestore, setConfirmedRestore] = useState(false)
  const [confirmedMigration, setConfirmedMigration] = useState(false)
  const [automatic, setAutomatic] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [restored, setRestored] = useState(operation.restartRequired)
  const mounted = useRef(false)
  const session = useRef(0)
  const statusRead = useRef(0)

  const clearConsent = useCallback(() => {
    setDevices(null)
    setSelectedDevice(null)
    setConfirmedContinuation(false)
    setConfirmedAccountRecovery(false)
    setConfirmedCloud(false)
    setConfirmedRestore(false)
    setConfirmedMigration(false)
  }, [])

  const refreshLocal = useCallback(async () => {
    const currentSession = session.current
    const read = ++statusRead.current
    setLoading(true)
    try {
      const next = await getStateBackupStatus()
      if (mounted.current && currentSession === session.current && read === statusRead.current) {
        setStatus(next)
      }
    } catch (cause) {
      if (mounted.current && currentSession === session.current && read === statusRead.current) {
        clearConsent()
        setStatus(null)
        setAccount(null)
        setError(stateBackupErrorMessage(cause))
      }
    } finally {
      if (mounted.current && read === statusRead.current) setLoading(false)
    }
  }, [clearConsent])

  useEffect(() => {
    mounted.current = true
    const updateOperation = (refresh: boolean) => {
      setPending(operation.pending)
      setRestored(operation.restartRequired)
      if (refresh) void refreshLocal()
    }
    operation.observers.add(updateOperation)
    updateOperation(false)
    return () => {
      mounted.current = false
      operation.observers.delete(updateOperation)
    }
  }, [refreshLocal])

  useEffect(() => {
    let disposed = false
    let registered = 0
    const unlisten: UnlistenFn[] = []
    setAccountWatchReady(false)
    if (!isOpen) return
    const accountChanged = () => {
      if (disposed || !mounted.current) return
      ++session.current
      clearConsent()
      setStatus(null)
      setAccount(null)
      setForm(null)
      setAutomatic(false)
      setNotice('Account changed. Check the signed-in account again before using cloud backup.')
      setError('')
      void refreshLocal()
    }
    for (const event of ['knapsack-connected', 'knapsack-disconnected']) {
      void listen(event, accountChanged)
        .then(stop => {
          if (disposed) stop()
          else {
            unlisten.push(stop)
            if (++registered === 2) setAccountWatchReady(true)
          }
        })
        .catch(() => {
          if (!disposed && mounted.current) {
            ++session.current
            clearConsent()
            setAccount(null)
            setForm(null)
            setError(
              'Could not watch account changes. Close and reopen Settings before using backup.',
            )
          }
        })
    }
    return () => {
      disposed = true
      unlisten.forEach(stop => stop())
    }
  }, [isOpen, clearConsent, refreshLocal])

  useEffect(() => {
    // Closing Settings invalidates pending account results and clears explicit consent.
    ++session.current
    clearConsent()
    setAccount(null)
    setForm(null)
    setError('')
    if (isOpen) void refreshLocal()
    return () => {
      const cancel = operation.pending && ['restore', 'devices', 'register-device'].includes(operation.pending) ? cancelStateBackupOperation : cancelStateBackupIdentity
      void cancel().catch(() => {})
    }
  }, [isOpen, clearConsent, refreshLocal])

  const run = async <T,>(action: Action, task: () => Promise<T>, success: (value: T) => void) => {
    // Fence clicks synchronously, including after this panel unmounts and mounts again.
    if (operation.pending !== null || loading || operation.restartRequired) return
    if (
      ['enable', 'backup', 'restore'].includes(action) &&
      (!account || stateBackupRecoveryBlocker(account, status?.recoveryMode))
    )
      return
    operation.pending = action
    notifyOperation()
    const currentSession = session.current
    const originalRoot = status?.brainRoot
    ++statusRead.current
    setError('')
    setNotice('')
    try {
      const value = await task()
      if (action === 'migrate') operation.migrated = true
      if (action === 'restore' || action === 'migrate') operation.restartRequired = true
      if (mounted.current && currentSession === session.current) success(value)
    } catch (cause) {
      let verificationFailed = false
      if (action === 'restore' || action === 'migrate') {
        // Atomic rename can activate the new root before a later durability check fails.
        // A rejected command is not proof that local state stayed unchanged.
        try {
          const latest = await getStateBackupStatus()
          if (!originalRoot || latest.brainRoot !== originalRoot) {
            operation.restartRequired = true
            operation.restoreNeedsVerification = true
          }
          if (mounted.current && currentSession === session.current) setStatus(latest)
        } catch {
          verificationFailed = true
          operation.restartRequired = true
          operation.restoreNeedsVerification = true
          if (mounted.current && currentSession === session.current) setStatus(null)
        }
      }
      if (mounted.current && currentSession === session.current) {
        const message = stateBackupErrorMessage(cause)
        setError(
          verificationFailed ? `${message} Local GBrain status could not be verified.` : message,
        )
        clearConsent()
        setAccount(null)
        setForm(null)
      }
    } finally {
      operation.pending = null
      // A different panel/session must re-read local state, never inherit an old account result.
      notifyOperation(!mounted.current || currentSession !== session.current)
    }
  }

  const startForm = (next: Form) => {
    clearConsent()
    setForm(next)
    setAutomatic(false)
    setError('')
    setNotice('')
  }

  const saved = (next: StateBackupStatus, message: string) => {
    setStatus(next)
    clearConsent()
    setForm(null)
    // Epoch/snapshot data must be explicitly refreshed before another account-scoped mutation.
    setAccount(null)
    setNotice(message)
  }

  const operationBusy = loading || pending !== null || restored
  const busy = operationBusy || !accountWatchReady
  const accountMismatch =
    !!account && !!status?.ownerAccountId && status.ownerAccountId !== account.account_id
  const ownedByThisDevice = !!account && !!status && account.device_id === status.deviceId
  const canConfigure =
    !!account &&
    !!status &&
    !accountMismatch &&
    (ownedByThisDevice || (!account.latest_snapshot_id && !account.device_id))
  const canBackUp =
    !!account &&
    !!status &&
    status.enabled &&
    account.enabled &&
    status.ownerAccountId === account.account_id &&
    ownedByThisDevice
  const warnings = status?.warnings?.filter(warning => warning.trim()) || []
  const recoveryBlocker = account ? stateBackupRecoveryBlocker(account, status?.recoveryMode) : null
  const canMigrateLegacy = !!account && !!status && !!status.ownerAccountId &&
    status.ownerAccountId !== account.account_id && !stateBackupRecoveryBlocker(account) &&
    account.epoch === 0 && account.revision === 0 && account.latest_snapshot_id === null && account.device_id === null
  const lastBackup =
    status?.lastBackupAt != null ? new Date(status.lastBackupAt).toLocaleString() : null

  const receivedDevices = (value: AccountDeviceDirectory) => {
    setDevices(value)
    setAccount(value.account)
    setSelectedDevice(null)
    setConfirmedContinuation(false)
  }

  return (
    <section className="p-6 w-full min-w-0 flex flex-col gap-3 break-words" aria-labelledby="state-backup-title">
      <h2 id="state-backup-title" className="font-medium text-lg">Backup &amp; computers</h2>
      <p className="text-sm text-zinc-600">Save your work, then continue from its backup on another computer.</p>
      <AccountDevicePicker directory={devices} status={status} busy={busy || !accountWatchReady || restored}
        name={deviceName} selected={selectedDevice} confirmed={confirmedContinuation}
        onName={setDeviceName} onDiscover={() => { clearConsent(); void run('devices', getAccountDevices, receivedDevices) }}
        onRegister={() => { if (devices) void run('register-device', () => registerAccountDevice(deviceName.trim()), receivedDevices) }}
        onSelect={value => { setSelectedDevice(value); setConfirmedContinuation(false) }} onConfirm={setConfirmedContinuation}
        onContinue={() => {
          if (!devices?.checkpoint || !selectedDevice || !confirmedContinuation) return
          const checkpoint = devices.checkpoint
          void run('restore', () => restoreStateBackup({ snapshotId: checkpoint.snapshot_id, confirmReplace: true,
            expectedEpoch: devices.account.epoch, expectedRevision: checkpoint.revision, expectedSourceDevice: selectedDevice }), value => {
            setStatus(value); clearConsent(); setNotice('Checkpoint continued here. Restart Knapsack, then review paused work and reconnect local permissions.')
          })
        }} />
      <p className="text-sm text-zinc-600">
        {loading ? 'Checking local state…' : !status ? 'Local status unavailable' : status.enabled ? status.automatic ? 'Automatic backup enabled' : 'Manual backup enabled' : 'Cloud backup off on this computer'}
      </p>
      <details onToggle={event => {
        if (event.target !== event.currentTarget) return
        if (!event.currentTarget.open) {
          ++session.current
          clearConsent()
          setAccount(null)
          setForm(null)
          const cancel = operation.pending === 'restore' ? cancelStateBackupOperation : cancelStateBackupIdentity
          void cancel().catch(() => {})
        }
      }}>
      <summary className="text-sm font-medium cursor-pointer underline">Backup settings</summary>
      <div className="flex flex-col gap-3 mt-3">
      <p className="text-sm text-zinc-600">Encrypted backup is optional and separate from Privacy Mode.</p>
      {status && (
        <details className="text-sm"><summary className="cursor-pointer underline">Local backup details</summary><dl className="space-y-1 mt-2">
          <div>
            <dt className="inline font-medium">Active local folder: </dt>
            <dd className="inline break-all">{status.brainRoot}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Last backup: </dt>
            <dd className="inline">{lastBackup || 'No backup recorded on this computer'}</dd>
          </div>

        </dl></details>
      )}
      {warnings.length > 0 && (
        <aside
          className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          aria-labelledby="state-backup-review-title"
        >
          <h3 id="state-backup-review-title" className="font-medium">
            Local state review notices
          </h3>
          <p className="mt-1">
            Historical references have been preserved as inert evidence. Review related work before
            resuming it; these notices do not grant approval or trigger actions.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning, index) => (
              <li key={index}>{stateBackupErrorMessage(warning)}</li>
            ))}
          </ul>
        </aside>
      )}
      <p className="text-xs text-zinc-500">Account checks contact Knapsack. Recovery verification uses Google or Microsoft identity permissions only, not mail access.</p>
      {!restored && (
        <div className="flex flex-wrap gap-2">
          {(['google', 'microsoft'] as const).map(provider => (
            <button key={provider} type="button" className={buttonClass} disabled={busy || !status}
              onClick={() => {
                clearConsent()
                setAccount(null)
                setForm(null)
                void run('verify', () => verifyStateBackupIdentity(provider), next => {
                  setAccount(next)
                  setNotice('Recovery identity verified. Review the account and backup action before continuing.')
                })
              }}>
              Verify {provider === 'google' ? 'Google' : 'Microsoft'} recovery identity
            </button>
          ))}
          {pending && ['verify', 'enable', 'backup', 'restore', 'migrate'].includes(pending) && (
            <button type="button" className={buttonClass} onClick={() => {
              const cancel = pending === 'restore' ? cancelStateBackupOperation : cancelStateBackupIdentity
              void cancel().catch(() => setError('Could not cancel. Close the provider window and wait for expiry.'))
            }}>{pending === 'restore' ? 'Cancel restore' : 'Cancel identity verification'}</button>
          )}
          <button
            type="button"
            className={buttonClass}
            disabled={busy || !status}
            onClick={() => {
              clearConsent()
              setForm(null)
              setAccount(null)
              void run('account', getStateBackupAccount, next => {
                setAccount(next)
                void refreshLocal()
              })
            }}
          >
            {pending === 'account'
              ? 'Checking account…'
              : account
                ? 'Refresh account'
                : 'Check signed-in account'}
          </button>
          {!status && (
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              onClick={() => {
                setError('')
                void refreshLocal()
              }}
            >
              Retry local status
            </button>
          )}
          {status?.enabled && (
            <button
              type="button"
              className={buttonClass}
              disabled={operationBusy}
              onClick={() =>
                void run('disable', disableStateBackup, next =>
                  saved(
                    next,
                    next.lastError
                      ? 'Backups stopped on this computer. The account-side change could not be confirmed; see the last backup error. Existing encrypted snapshots remain.'
                      : 'Cloud backup disabled. Existing encrypted snapshots remain in your account; this does not delete them.',
                  ),
                )
              }
            >
              {pending === 'disable' ? 'Disabling…' : 'Disable cloud backup'}
            </button>
          )}
        </div>
      )}
      {account && !restored && (
        <div className="rounded-lg border border-zinc-200 p-4 space-y-3">
          <details className="text-sm"><summary className="cursor-pointer underline">Account details</summary><p className="break-all">Knapsack account: {account.account_id}</p></details>
          {accountMismatch && (
            <p className="text-sm text-amber-800">
              This local GBrain belongs to another Knapsack account. Reconnect that account before
              changing backup or restoring state. No local state will be uploaded to the account
              shown above.
            </p>
          )}
          {canMigrateLegacy && (
            <aside className="rounded-lg border border-amber-200 p-3 text-sm space-y-2">
              <p>Historical migration requires an original encrypted archive and its key in this original device&apos;s OS credential store. The archive is authenticated locally and copied into a new recovery identity. Your previous folder and key remain intact. Cloud backup stays off; imported approvals and live work stay paused.</p>
              <label className="flex gap-2 items-start">
                <input type="checkbox" checked={confirmedMigration} disabled={busy}
                  onChange={event => setConfirmedMigration(event.target.checked)} />
                I have the original archive on this device and approve this local migration.
              </label>
              <button type="button" className={buttonClass} disabled={busy || !confirmedMigration}
                onClick={() => void run('migrate', async () => {
                  const path = await open({ title: 'Select the original encrypted Knapsack archive', multiple: false, directory: false })
                  if (typeof path !== 'string') throw new Error('Archive selection cancelled. No migration was started.')
                  return migrateLegacyStateBackup(path, true)
                }, next => saved(next, 'Historical archive migrated. Restart Knapsack; cloud backup remains off.'))}>
                Migrate original encrypted archive
              </button>
            </aside>
          )}
          {!canConfigure && !accountMismatch && (
            <p className="text-sm text-amber-800">
              Another computer owns this account&apos;s backup state. Restore its latest snapshot
              here before enabling backups. If no snapshot is available yet, make a backup on that
              computer first.
            </p>
          )}
          {recoveryBlocker && (
            <aside
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
              aria-labelledby="state-backup-unavailable-title"
            >
              <h3 id="state-backup-unavailable-title" className="font-medium">
                Account recovery setup required
              </h3>
              <p className="mt-1">{recoveryBlocker}</p>
            </aside>
          )}
          <div className="flex flex-wrap gap-2">
            {canConfigure && (
              <button
                type="button"
                className={buttonClass}
                disabled={busy || !!recoveryBlocker}
                onClick={() => startForm('setup')}
              >
                {status?.enabled ? 'Change backup settings' : 'Set up encrypted backup'}
              </button>
            )}
            {canBackUp && (
              <button
                type="button"
                className={buttonClass}
                disabled={busy || !!recoveryBlocker}
                onClick={() =>
                  void run('backup', backUpStateNow, next =>
                    saved(next, 'Encrypted backup saved to your Knapsack account.'),
                  )
                }
              >
                {pending === 'backup' ? 'Backing up…' : 'Back up now'}
              </button>
            )}
            {account.latest_snapshot_id && !accountMismatch && (
              <button
                type="button"
                className={buttonClass}
                disabled={busy || !!recoveryBlocker}
                onClick={() => startForm('restore')}
              >
                Restore latest backup
              </button>
            )}
          </div>
          {form && !recoveryBlocker && (
            <div className="border-t pt-3 space-y-3">
              {form === 'setup' && (
                <>
                  <h3 className="font-medium">Choose whether to back up this GBrain</h3>
                  <p className="text-sm">
                    Notes, goals, follow-ups and Loop history (including old approvals) are encrypted
                    here and stored in your Knapsack account. Credentials are excluded; secrets pasted
                    into notes may be included. Review your notes first.
                  </p>
                </>
              )}
              <p className="text-sm">
                Recovery uses fresh Google or Microsoft identity verification linked to this same Knapsack account.
                Knapsack&apos;s authorized recovery service can recover the encryption key and decrypt
                your backup. This is not zero-knowledge storage. No separate recovery code is needed.
              </p>
              {form === 'restore' && (
                <>
                  <h3 className="font-medium">Restore this account&apos;s latest GBrain backup</h3>
                  <p className="text-sm">
                    Switch to this saved backup and keep your previous local folder. This computer
                    becomes the backup writer; other computers can no longer upload backups until you
                    transfer the writer again.
                  </p>
                  <p className="text-sm">
                    Restored active Loops are paused, restored approvals cannot be used, and no
                    external actions are replayed. Review them before resuming work. Restart
                    Knapsack after restoration.
                  </p>
                </>
              )}
              {form === 'setup' && (
                <>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={busy}
                      checked={confirmedAccountRecovery}
                      onChange={event => setConfirmedAccountRecovery(event.target.checked)}
                    />
                    I understand Knapsack can recover my backup through my verified account.
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={busy}
                      checked={confirmedCloud}
                      onChange={event => setConfirmedCloud(event.target.checked)}
                    />
                    I want encrypted GBrain snapshots uploaded to and retained in this Knapsack
                    account.
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={busy}
                      checked={automatic}
                      onChange={event => setAutomatic(event.target.checked)}
                    />
                    Enable automatic backups and allow Knapsack to save the encryption key in this
                    computer&apos;s OS secure credential store.
                  </label>
                  <p className="text-xs text-zinc-500">
                    Automatic backups check for changed state every 15 minutes while Knapsack is
                    running. Leave this unchecked for manual backups, which run when you choose Back
                    up now.
                  </p>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={busy || !canConfigure || !confirmedAccountRecovery || !confirmedCloud}
                    onClick={() =>
                      void run(
                        'enable',
                        () =>
                          enableStateBackup({
                            confirmAccountRecovery: confirmedAccountRecovery,
                            automatic,
                            expectedEpoch: account.epoch,
                          }),
                        next =>
                          saved(
                            next,
                            'Backup settings saved. You can check your account and back up now.',
                          ),
                      )
                    }
                  >
                    {pending === 'enable' ? 'Saving…' : 'Enable encrypted backup'}
                  </button>
                </>
              )}
              {form === 'restore' && (
                <>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      disabled={busy}
                      checked={confirmedRestore}
                      onChange={event => setConfirmedRestore(event.target.checked)}
                    />
                    I understand this switches this computer&apos;s active GBrain and makes it the
                    backup-authoritative device, fencing other devices. I will restart Knapsack and
                    review paused Loops and approvals.
                  </label>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={busy || !confirmedRestore}
                    onClick={() =>
                      void run(
                        'restore',
                        () =>
                          restoreStateBackup({
                            snapshotId: account.latest_snapshot_id,
                            confirmReplace: confirmedRestore,
                            expectedEpoch: account.epoch,
                          }),
                        next => {
                          saved(
                            next,
                            'Backup restored. Restart Knapsack to use the restored GBrain. Your previous local folder was retained. Review paused Loops and obtain new approvals before resuming work.',
                          )
                          setRestored(true)
                        },
                      )
                    }
                  >
                    {pending === 'restore' ? 'Restoring…' : 'Restore and switch this GBrain'}
                  </button>
                </>
              )}
              <button
                type="button"
                className={`${buttonClass} ml-2`}
                disabled={busy}
                onClick={() => startForm(null)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      </div></details>
      {status?.lastError && <p role="alert" className="text-sm text-amber-800">Backup needs attention: {stateBackupErrorMessage(status.lastError)}</p>}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {onSignIn && error && /sign.?in|connect.*account|account.*connect/i.test(error) && <button type="button" className={buttonClass} disabled={busy} onClick={onSignIn}>Sign in to Knapsack</button>}
      {notice && !restored && (
        <p role="status" className="text-sm text-zinc-700">
          {notice}
        </p>
      )}
      {restored && (
        <p role="status" className="text-sm text-amber-800">
          {operation.restoreNeedsVerification
            ? 'Restoration reported an error and the active local GBrain changed or could not be verified. Restart Knapsack and check backup status before continuing. The previous local folder was retained. Review paused Loops and obtain new approvals before resuming work.'
            : operation.migrated
              ? 'Historical archive migrated. Restart Knapsack to use the migrated GBrain. Your previous folder, archive and original key were retained. Cloud backup remains off. Review paused work and obtain new approvals before resuming.'
              : 'Backup restored. Restart Knapsack to use the restored GBrain. Your previous local folder was retained. Review paused Loops and obtain new approvals before resuming work.'}
        </p>
      )}
    </section>
  )
}
