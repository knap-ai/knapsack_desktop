import type { Connection } from 'src/api/connections'
import { describe, expect, it } from 'vitest'

import { connectedMailSenders, initialMailSender } from './emailSenders'

const connection = (key: string, accountEmail: string): Connection =>
  ({
    key,
    state: 'UP_TO_DATE',
    calendarAccountEmail: accountEmail,
    ownerEmail: 'owner@example.invalid',
  }) as unknown as Connection

describe('connected mail senders', () => {
  it('requires explicit selection of a mailbox granted under another local owner', () => {
    const grants = { linked: connection('google_gmail_modify', 'linked@example.invalid') }
    const senders = connectedMailSenders(grants, 'different@example.invalid', true)
    expect(senders).toHaveLength(1)
    expect(senders[0].ownerEmail).toBe('owner@example.invalid')
    expect(initialMailSender(senders, 'linked@example.invalid')).toBe('')
    expect(connectedMailSenders(grants, 'different@example.invalid')).toEqual([])
  })
  it('keeps a legacy Outlook or Gmail grant bound to its owner when mailbox metadata is absent', () => {
    for (const key of ['microsoft_outlook_read', 'google_gmail_modify']) {
      const senders = connectedMailSenders(
        { saved: connection(key, '') },
        'current@example.invalid',
        true,
      )
      expect(senders[0]).toMatchObject({
        accountEmail: 'owner@example.invalid',
        ownerEmail: 'owner@example.invalid',
        requiresSelection: true,
      })
      expect(initialMailSender(senders, 'current@example.invalid')).toBe('')
    }
  })
  it('includes current Gmail modify and Outlook connections', () => {
    const senders = connectedMailSenders(
      {
        gmail: connection('google_gmail_modify', 'gmail@example.invalid'),
        outlook: connection('microsoft_outlook_read', 'outlook@example.invalid'),
      },
      'owner@example.invalid',
    )

    expect(senders.map(sender => [sender.provider, sender.accountEmail])).toEqual([
      ['gmail', 'gmail@example.invalid'],
      ['outlook', 'outlook@example.invalid'],
    ])
  })

  it('selects a requested connected mailbox and otherwise defaults only when unambiguous', () => {
    const senders = connectedMailSenders(
      {
        gmail: connection('google_gmail_modify', 'gmail@example.invalid'),
        outlook: connection('microsoft_outlook_read', 'outlook@example.invalid'),
      },
      'owner@example.invalid',
    )

    expect(initialMailSender(senders, 'outlook@example.invalid')).toBe(
      'outlook|outlook@example.invalid',
    )
    expect(initialMailSender(senders, 'unknown@example.invalid')).toBe('')
    expect(initialMailSender(senders.slice(0, 1), 'unknown@example.invalid')).toBe(senders[0].id)
  })
})
