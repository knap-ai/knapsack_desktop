import type { Connection } from 'src/api/connections'

const GOOGLE_GMAIL_CONNECTION_KEY = 'google_gmail_modify'
const MICROSOFT_OUTLOOK_CONNECTION_KEY = 'microsoft_outlook_read'
export type MailProvider = 'gmail' | 'outlook'
export type MailSender = {
  id: string
  provider: MailProvider
  accountEmail: string
  ownerEmail: string
  requiresSelection?: boolean
}
export function connectedMailSenders(
  connections: Record<string, Connection>,
  ownerEmail?: string,
  includeOtherOwners = false,
): MailSender[] {
  if (!ownerEmail?.trim()) return []
  const result: MailSender[] = []
  for (const connection of Object.values(connections)) {
    const provider =
      connection.key === GOOGLE_GMAIL_CONNECTION_KEY
        ? 'gmail'
        : connection.key === MICROSOFT_OUTLOOK_CONNECTION_KEY
          ? 'outlook'
          : null
    const grantOwner = (connection.ownerEmail || ownerEmail).trim()
    const otherOwner = grantOwner.toLowerCase() !== ownerEmail.trim().toLowerCase()
    if (!provider || (otherOwner && !includeOtherOwners)) continue
    const accountEmail = (connection.calendarAccountEmail || grantOwner).trim()
    const id = `${provider}|${accountEmail.toLowerCase()}${otherOwner ? `|${grantOwner.toLowerCase()}` : ''}`
    if (!result.some(item => item.id === id))
      result.push({
        id,
        provider,
        accountEmail,
        ownerEmail: grantOwner,
        ...(otherOwner ? { requiresSelection: true } : {}),
      })
  }
  return result
}
export function initialMailSender(senders: MailSender[], requested?: string): string {
  const eligible = senders.filter(s => !s.requiresSelection)
  const matching = eligible.filter(
    s => s.accountEmail.toLowerCase() === requested?.trim().toLowerCase(),
  )
  return matching.length === 1
    ? matching[0].id
    : senders.length === 1 && eligible.length === 1
      ? eligible[0].id
      : ''
}
