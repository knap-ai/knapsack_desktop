import './emailSyncNotice.scss'

import { ConnectionStates } from 'src/api/connections'
import type { EmailSyncAccount } from 'src/utils/emailCacheState'

export default function EmailSyncNotice({
  accounts = [],
  error,
  busy,
  onRetry,
}: {
  accounts?: EmailSyncAccount[]
  error?: string
  busy: boolean
  onRetry: () => void
}) {
  const failed = accounts.filter(account => account.state === ConnectionStates.FAILED)
  return (
    <section className="email-sync-notice" aria-label="Email source status">
      <span className="sr-only" role="status">{busy ? 'Refreshing saved inboxes' : error || failed.length ? 'Inbox sync needs attention' : 'Saved inbox view ready'}</span>
      <details>
          <summary aria-label={busy ? 'Inbox status: refreshing' : error || failed.length ? 'Inbox status: needs attention' : 'Inbox status'} title="Inbox status">
            <span aria-hidden="true">{error || failed.length ? '!' : busy ? '↻' : '▤'}</span>
          </summary>
          <div className="email-sync-notice__popover">
          <strong>{accounts.length} saved {accounts.length === 1 ? 'inbox' : 'inboxes'}</strong>
          {busy && <p>Refreshing view…</p>}
          <p>Saved mail · past 7 days · unread or starred</p>
          <ul>
            {accounts.map(account => (
              <li key={account.queryAccount}>
                <span>{account.account}</span>
                <span>
                  {account.provider} ·{' '}
                  {account.state === ConnectionStates.FAILED
                    ? 'Sync needs attention'
                    : account.state === ConnectionStates.SYNCING
                      ? 'Syncing'
                      : 'Saved connection'}
                </span>
              </li>
            ))}
          </ul>
      {(error || failed.length > 0) && (
        <div role="alert" className="email-sync-notice__warning">
          <p>
            {error ||
              `Sync needs attention for ${failed.map(account => account.account).join(', ')}. Results may be incomplete.`}
          </p>
          <p>
            Review the affected account in Settings → Connections. Saved mail remains available;
            this view does not validate provider sign-in.
          </p>
          {error && (
            <button type="button" disabled={busy} onClick={onRetry}>
              Retry email view
            </button>
          )}
        </div>
      )}
          </div>
        </details>
    </section>
  )
}
