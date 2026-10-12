import { KN_SERVER_HOST } from 'src/utils/constants'

async function read(body: Record<string, unknown>, signal?: AbortSignal) {
  const response = await fetch(`${KN_SERVER_HOST}/api/clawd/gmail/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || data.message || 'Gmail is unavailable. Reconnect in Home and retry.')
  return data
}
export type MailProvider = 'gmail' | 'outlook'
async function outlookRead(body: Record<string, unknown>, signal?: AbortSignal) {
  const response = await fetch(`${KN_SERVER_HOST}/api/clawd/outlook/follow-up-source`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  const data = await response.json()
  if (signal?.aborted) throw new Error('Outlook scan canceled.')
  if (!response.ok) throw new Error(data.error || 'Outlook is unavailable. Reconnect in Home and retry.')
  return data
}
export async function followUpMailAccounts(signal?: AbortSignal, provider: MailProvider = 'gmail'): Promise<string[]> {
  const data = await (provider === 'outlook' ? outlookRead({ action: 'accounts' }, signal) : read({ action: 'accounts' }, signal))
  return Array.isArray(data.accounts) ? data.accounts : []
}
function plainText(payload: any): string {
  if (payload.mimeType === 'text/plain' && typeof payload.body?.data === 'string') {
    const encoded = payload.body.data.replace(/-/g, '+').replace(/_/g, '/')
    return new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0)))
  }
  return (payload.parts || []).map(plainText).filter(Boolean).join('\n')
}
const header = (message: any, name: string) => message.payload?.headers?.find((h: any) => h.name.toLowerCase() === name)?.value || ''

/** User-triggered bounded reads only. Full later thread contents are required; no snippet-based inference. */
export async function readFollowUpThreads(account: string, signal?: AbortSignal, provider: MailProvider = 'gmail'): Promise<{ source: string; skipped: number; owner?: string }> {
  const available = await followUpMailAccounts(signal, provider)
  if (!available.includes(account)) throw new Error('This mail account is no longer connected. Choose a connected account and retry.')
  if (provider === 'outlook') return outlookRead({ action: 'scan', account_email: account }, signal)
  const listing = await read({ action: 'list', account_email: account, query: 'in:sent newer_than:14d', max_results: 10 }, signal)
  const threads = new Set<string>()
  for (const message of (listing.result?.messages || []).slice(0, 10)) {
    if (message.threadId) threads.add(message.threadId)
  }
  let source = '', skipped = 0
  for (const threadId of threads) {
    // A failure leaves resolution unknown; never extract an earlier message by itself.
    const data = await read({ action: 'thread', account_email: account, message_id: threadId }, signal)
    const messages = [...(data.result?.messages || [])].sort((a, b) => Number(a.internalDate) - Number(b.internalDate))
    const complete = messages.length > 0 && messages.every(m => plainText(m.payload || {}).trim())
    const context = messages.map(m => `From: ${header(m, 'from')}\nTo: ${header(m, 'to')}\nDate: ${header(m, 'date')}\n${plainText(m.payload || {})}`).join('\n\n')
    const block = `\nThread: https://mail.google.com/mail/u/?authuser=${encodeURIComponent(account)}#all/${encodeURIComponent(threadId)}\n${context}\n`
    if (!complete || source.length + block.length > 22000) { skipped++; continue }
    source += block
  }
  if (!source.trim()) throw new Error('No complete readable conversations found in the last 10 sent messages from 14 days. Supply notes instead. Unsupported or oversized threads are not inferred from snippets.')
  return { source, skipped }
}
