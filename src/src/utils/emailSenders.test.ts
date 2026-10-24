import { describe, expect, it } from 'vitest'

import type { Connection } from 'src/api/connections'
import { connectedMailSenders, initialMailSender } from './emailSenders'

const connection = (key: string, accountEmail: string): Connection => ({
  key,
  state: 'UP_TO_DATE',
  calendarAccountEmail: accountEmail,
  ownerEmail: 'owner@example.invalid',
} as unknown as Connection)

describe('connected mail senders', () => {
  it('includes current Gmail modify and Outlook connections', () => {
    const senders = connectedMailSenders({
      gmail: connection('google_gmail_modify', 'gmail@example.invalid'),
      outlook: connection('microsoft_outlook_read', 'outlook@example.invalid'),
    }, 'owner@example.invalid')

    expect(senders.map(sender => [sender.provider, sender.accountEmail])).toEqual([
      ['gmail', 'gmail@example.invalid'],
      ['outlook', 'outlook@example.invalid'],
    ])
  })

  it('selects a requested connected mailbox and otherwise defaults only when unambiguous', () => {
    const senders = connectedMailSenders({
      gmail: connection('google_gmail_modify', 'gmail@example.invalid'),
      outlook: connection('microsoft_outlook_read', 'outlook@example.invalid'),
    }, 'owner@example.invalid')

    expect(initialMailSender(senders, 'outlook@example.invalid')).toBe('outlook|outlook@example.invalid')
    expect(initialMailSender(senders, 'unknown@example.invalid')).toBe('')
    expect(initialMailSender(senders.slice(0, 1), 'unknown@example.invalid')).toBe(senders[0].id)
  })
})
