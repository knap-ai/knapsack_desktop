import type { Connection } from 'src/api/connections'
export type MailProvider = 'gmail' | 'outlook'
export type MailSender = { id: string; provider: MailProvider; accountEmail: string; ownerEmail: string }
export function connectedMailSenders(connections: Record<string, Connection>, ownerEmail?: string): MailSender[] {
  if (!ownerEmail?.trim()) return []
  const result: MailSender[] = []
  for (const connection of Object.values(connections)) {
    const provider = connection.key === 'google_gmail_read' ? 'gmail' : connection.key === 'microsoft_outlook_read' ? 'outlook' : null
    if (!provider || (connection.ownerEmail && connection.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase())) continue
    const accountEmail = (connection.calendarAccountEmail || ownerEmail).trim()
    const id = `${provider}|${accountEmail.toLowerCase()}`
    if (!result.some(item => item.id === id)) result.push({ id, provider, accountEmail, ownerEmail })
  }
  return result
}
export function initialMailSender(senders: MailSender[], requested?: string): string {
  const matching = senders.filter(s => s.accountEmail.toLowerCase() === requested?.trim().toLowerCase())
  return matching.length === 1 ? matching[0].id : senders.length === 1 ? senders[0].id : ''
}
