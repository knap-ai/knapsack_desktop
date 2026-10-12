import { invoke } from '@tauri-apps/api/tauri'

export type StateBackupRecoveryMode = 'account_recovery_v1' | 'private_key_v1'

/** Local state only. Reading this status must never contact a remote account. */
export interface StateBackupStatus {
  schemaVersion: 1
  brainRoot: string
  ownerAccountId: string | null
  deviceId: string
  enabled: boolean
  automatic: boolean
  /** Unix milliseconds. */
  lastBackupAt: number | null
  lastSnapshotId: string | null
  lastError: string | null
  recoveryMode?: StateBackupRecoveryMode | null
  /** Generic local review notices for preserved, inert historical evidence. */
  warnings?: string[]
}

/** The account service uses snake_case, unlike local native status. */
export interface StateBackupAccount {
  account_id: string
  enabled: boolean
  device_id: string | null
  epoch: number
  revision: number
  latest_snapshot_id: string | null
  recovery_mode: StateBackupRecoveryMode
  key_version: string | null
  account_recovery_available: boolean
  account_recovery_unavailable_reason: string | null
}

export const getStateBackupStatus = () => invoke<StateBackupStatus>('kn_state_backup_status')

/** Call only after the user explicitly asks to check their signed-in account. */
export const getStateBackupAccount = () => invoke<StateBackupAccount>('kn_state_backup_account')
export const verifyStateBackupIdentity = (provider: 'google' | 'microsoft') =>
  invoke<StateBackupAccount>('kn_state_backup_verify_identity', { provider })
export const cancelStateBackupOperation = () => invoke<void>('kn_state_backup_cancel_operation')
export const cancelStateBackupIdentity = () => invoke<void>('kn_state_backup_cancel_identity')
export const migrateLegacyStateBackup = (archivePath: string, confirmLocalMigration: boolean) =>
  invoke<StateBackupStatus>('kn_state_backup_migrate_legacy', { archivePath, confirmLocalMigration })

export const enableStateBackup = (options: {
  confirmAccountRecovery: boolean
  automatic: boolean
  expectedEpoch: number
}) =>
  invoke<StateBackupStatus>('kn_state_backup_enable', {
    confirmAccountRecovery: options.confirmAccountRecovery,
    automatic: options.automatic,
    expectedEpoch: options.expectedEpoch,
    takeover: false,
  })

export const backUpStateNow = () => invoke<StateBackupStatus>('kn_state_backup_now')

export const disableStateBackup = () => invoke<StateBackupStatus>('kn_state_backup_disable')

export const restoreStateBackup = (options: {
  snapshotId: string | null
  confirmReplace: boolean
  expectedEpoch: number
  expectedRevision?: number
  expectedSourceDevice?: string
}) =>
  invoke<StateBackupStatus>('kn_state_backup_restore', {
    snapshotId: options.snapshotId,
    confirmReplace: options.confirmReplace,
    expectedEpoch: options.expectedEpoch,
    expectedRevision: options.expectedRevision,
    expectedSourceDevice: options.expectedSourceDevice,
  })

/** Missing or inconsistent capability fields must never enable a legacy-key fallback. */
export const stateBackupRecoveryBlocker = (
  account: StateBackupAccount,
  localMode?: StateBackupRecoveryMode | null,
): string | null => {
  const reason = account.account_recovery_unavailable_reason
  if (reason === 'recovery_identity_signin_required') {
    return 'Verify your Google or Microsoft identity below. This uses identity permissions only and does not connect your mailbox or enable backup.'
  }
  if (reason === 'kms_unavailable') {
    return 'The protected recovery key service is unavailable. Retry later; no fallback key will be created.'
  }
  // The service uses the legacy enum as the default for a never-initialized account.
  // Only this exact empty state can start account recovery without migrating ciphertext.
  const uninitializedAccount =
    account.recovery_mode === 'private_key_v1' &&
    account.epoch === 0 &&
    account.revision === 0 &&
    account.latest_snapshot_id === null &&
    account.key_version === null &&
    account.device_id === null &&
    account.enabled === false
  if (
    (account.recovery_mode === 'private_key_v1' && !uninitializedAccount) ||
    localMode === 'private_key_v1' ||
    reason === 'legacy_private_key_migration_required'
  ) {
    return 'This backup uses an older recovery identity. On the original device, migrate an original encrypted archive using its key in the OS credential store. Email sign-in alone cannot unlock or migrate historical backups.'
  }
  if (reason === 'kms_not_configured') {
    return 'Account recovery is unavailable because Knapsack’s recovery key service is not configured on this server. The service must be configured before backups or restore can proceed.'
  }
  if (reason === 'provider_reauthentication_unavailable') {
    return 'Fresh Google or Microsoft identity verification for account recovery is not configured on this server. Ordinary Knapsack sign-in or refreshing the desktop session does not resolve this setup requirement.'
  }
  if (
    reason === 'immutable_account_auth_unavailable' ||
    reason === 'immutable_account_identity_unavailable'
  ) {
    return 'Verified account identity and recent sign-in integration are not configured on this server. Ordinary Knapsack sign-in does not resolve this server setup requirement.'
  }
  if (
    account.account_recovery_available !== true ||
    (account.recovery_mode !== 'account_recovery_v1' && !uninitializedAccount) ||
    reason !== null
  ) {
    return 'Verified account recovery is unavailable. Knapsack must confirm that its recovery key service and provider identity verification are ready before backups or restore can proceed.'
  }
  return null
}

// Native failures must not accidentally expose key-shaped material in the Settings page.
export const stateBackupErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/[a-f0-9]{64}/gi, '[redacted]')
}

export interface AccountDeviceDirectory {
  account_id: string
  current_device_id: string
  account: StateBackupAccount
  devices: Array<{ device_id: string; name: string; revoked?: boolean; platform: string; last_seen: number; recently_seen: boolean; is_writer: boolean }>
  checkpoint: { snapshot_id: string; source_device_id: string; revision: number; epoch: number; created_at: string } | null
  remote_execution_available: false
  continuous_sync_available: false
  server_time: number
}
export const getAccountDevices = () => invoke<AccountDeviceDirectory>('kn_account_devices')
export const registerAccountDevice = (name: string) => invoke<AccountDeviceDirectory>('kn_account_device_register', { name })
