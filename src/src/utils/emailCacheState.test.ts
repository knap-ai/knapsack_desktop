// @vitest-environment jsdom
import { ConnectionKeys, ConnectionStates, type Connection } from 'src/api/connections'
import { expect, it } from 'vitest'

import { emailCacheContext, emailSyncAccounts } from './emailCacheState'

it('keeps authorized Gmail and Outlook identities distinct and preserves partial failures', () => {
  const accounts = emailSyncAccounts({
    a: {
      key: ConnectionKeys.GOOGLE_GMAIL,
      ownerEmail: 'owner@example.test',
      calendarAccountEmail: 'personal@example.test',
      state: ConnectionStates.FAILED,
    },
    b: {
      key: ConnectionKeys.MICROSOFT_OUTLOOK,
      ownerEmail: 'work@example.test',
      state: ConnectionStates.UP_TO_DATE,
    },
    unknown: { key: ConnectionKeys.GOOGLE_GMAIL, state: ConnectionStates.IDLE },
  } as Record<string, Connection>)
  expect(accounts.map(a => a.queryAccount)).toEqual([
    'microsoft:work@example.test',
    'personal@example.test',
  ])
  const text = emailCacheContext(accounts, 0, 2)
  expect(text).toContain('Sync needs attention for: personal@example.test')
  expect(text).toContain('not a live Gmail/Outlook or token-validation request')
  expect(text).toContain('Missing messages do not prove the remote inbox is empty')
})
it('never invents an account scope from absent identity metadata', () => {
  expect(emailSyncAccounts({})).toEqual([])
  expect(emailCacheContext([], 0, 2)).toContain('No email cache was read')
})
