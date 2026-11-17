import { Connection, ConnectionKeys, ConnectionStates } from 'src/api/connections'

export interface EmailSyncAccount {
  account: string
  queryAccount: string
  provider: 'Gmail' | 'Outlook'
  state: ConnectionStates
}

/** The same saved connection boundary used by Autopilot, never every local profile. */
export function emailSyncAccounts(connections: Record<string, Connection>): EmailSyncAccount[] {
  const accounts = new Map<string, EmailSyncAccount>()
  const severity = {
    [ConnectionStates.UP_TO_DATE]: 0,
    [ConnectionStates.IDLE]: 1,
    [ConnectionStates.SYNCING]: 2,
    [ConnectionStates.FAILED]: 3,
  }
  for (const connection of Object.values(connections)) {
    if (
      ![ConnectionKeys.GOOGLE_GMAIL, ConnectionKeys.MICROSOFT_OUTLOOK].includes(
        connection.key as ConnectionKeys,
      )
    )
      continue
    const outlook = connection.key === ConnectionKeys.MICROSOFT_OUTLOOK
    const account = (
      outlook ? connection.ownerEmail : connection.calendarAccountEmail || connection.ownerEmail
    )
      ?.trim()
      .toLowerCase()
    if (!account) continue
    const queryAccount = outlook ? `microsoft:${account}` : account
    const state = connection.state || ConnectionStates.IDLE
    const previous = accounts.get(queryAccount)
    if (!previous || severity[state] > severity[previous.state]) {
      accounts.set(queryAccount, {
        account,
        queryAccount,
        provider: outlook ? 'Outlook' : 'Gmail',
        state,
      })
    }
  }
  return [...accounts.values()].sort((a, b) => a.queryAccount.localeCompare(b.queryAccount))
}

export function emailCacheContext(
  accounts: EmailSyncAccount[],
  count: number,
  days: number,
): string {
  const failures = accounts.filter(a => a.state === ConnectionStates.FAILED)
  const syncing = accounts.filter(a => a.state === ConnectionStates.SYNCING)
  return [
    '## Local Email Cache Status',
    `This is a local cache query for the past ${days} calendar days, not a live Gmail/Outlook or token-validation request.`,
    `Selected saved inboxes: ${accounts.map(a => `${a.provider}: ${a.account}`).join('; ') || 'none available in this view'}.`,
    accounts.length
      ? `${count} locally synced messages matched the bounded query. Missing messages do not prove the remote inbox is empty.`
      : 'No email cache was read because the saved inbox scope is unavailable. Discover the authorized native email account inventory before querying.',
    failures.length
      ? `Sync needs attention for: ${failures.map(a => a.account).join(', ')}. Cached results may be incomplete. Do not claim these connections are healthy or diagnose an expired token without an actual provider error.`
      : 'Saved connection metadata is not proof that remote authentication or the latest sync succeeded.',
    syncing.length ? `Sync is in progress for: ${syncing.map(a => a.account).join(', ')}.` : '',
    'Email Autopilot uses locally synced unread or starred mail from the past 7 calendar days, then applies its category and handled-message filters. This 2-day sample is not the Autopilot result. Do not invent counts, causes, or claim all inboxes work. Report per-account failures separately; do not fall back to browser sign-in or request pasted mail.',
  ]
    .filter(Boolean)
    .join('\n')
}
