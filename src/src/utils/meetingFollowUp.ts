export interface FollowUpParticipant {
  name?: string
  email?: string
}

interface FollowUpTableRow {
  owner: string
  action: string
  blocker: string
}

const PLACEHOLDER_RE = /(?:\(\s*placeholder\s*\)|\[\s*placeholder\s*\]|\bplaceholder\b)/gi

function escHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function normalizeName(value?: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '')
    .replace(/^\s*\[[ xX]\]\s*/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureSentence(value: string): string {
  const text = value.trim()
  if (!text) return ''
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  return values.filter(value => {
    const key = value.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function firstName(value?: string): string | undefined {
  const text = (value || '').trim()
  if (!text) return
  const display = text.includes('<') ? text.split('<')[0].trim() : text
  const candidate = display || text.split('@')[0]
  return candidate.split(/\s+/)[0] || undefined
}

export function sanitizeMeetingTitle(rawTitle?: string): string | undefined {
  const title = (rawTitle || '')
    .replace(PLACEHOLDER_RE, ' ')
    .replace(/^[\s:|\-–—]+|[\s:|\-–—]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return title || undefined
}

export function buildFollowUpEmailSubject(rawTitle?: string): string {
  const title = sanitizeMeetingTitle(rawTitle)
  return title ? `Follow-up: ${title}` : 'Meeting follow-up'
}

export function filterFollowUpRecipients(
  participants: FollowUpParticipant[],
  userEmail?: string,
  userName?: string,
): FollowUpParticipant[] {
  const ownEmail = (userEmail || '').trim().toLowerCase()
  const ownName = normalizeName(userName)
  const seen = new Set<string>()

  return participants.filter(participant => {
    const email = (participant.email || '').trim().toLowerCase()
    const name = normalizeName(participant.name)
    if (!email || seen.has(email)) return false
    if (email === ownEmail || name === 'you' || name === 'me' || (ownName && name === ownName)) {
      return false
    }
    seen.add(email)
    return true
  })
}

function sectionLines(lines: string[], headingPattern: RegExp): string[] {
  const start = lines.findIndex(line => {
    const heading = line.trim().replace(/^#{1,6}\s*/, '').replace(/:$/, '').trim()
    return headingPattern.test(heading)
  })
  if (start === -1) return []

  const result: string[] = []
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (/^#{1,6}\s+/.test(line)) break
    if (line) result.push(line)
  }
  return result
}

function bulletItems(lines: string[]): string[] {
  return lines
    .filter(line => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line))
    .map(cleanMarkdown)
    .filter(Boolean)
}

function extractSummary(lines: string[]): string | undefined {
  const summary = sectionLines(lines, /^summary$/i)
  const paragraphs: string[] = []
  for (const line of summary) {
    if (/^#{1,6}\s+/.test(line) || /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line) || /^\|/.test(line)) break
    const cleaned = cleanMarkdown(line)
    if (cleaned) paragraphs.push(cleaned)
    if (paragraphs.join(' ').length >= 420) break
  }
  const text = paragraphs.join(' ').trim()
  return text ? ensureSentence(text) : undefined
}

function extractHighlights(lines: string[]): string[] {
  const preferred = sectionLines(lines, /^(?:highlights?|decisions?|key (?:outcomes?|takeaways?))$/i)
  const items = bulletItems(preferred)
  if (items.length > 0) return unique(items).slice(0, 4)
  return unique(bulletItems(sectionLines(lines, /^summary$/i))).slice(0, 4)
}

function splitTableRow(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(cleanMarkdown)
}

function isDividerRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
}

function findColumn(headers: string[], pattern: RegExp): number {
  return headers.findIndex(header => pattern.test(header.toLowerCase()))
}

function extractTableRows(lines: string[], userName?: string): FollowUpTableRow[] {
  const rows: FollowUpTableRow[] = []
  for (let index = 0; index < lines.length - 2; index += 1) {
    if (!/^\s*\|/.test(lines[index]) || !/^\s*\|/.test(lines[index + 1])) continue
    const headers = splitTableRow(lines[index])
    if (!isDividerRow(splitTableRow(lines[index + 1]))) continue

    let ownerIndex = findColumn(headers, /^(?:owner|person|who)$/)
    let actionIndex = findColumn(headers, /(?:next|action|follow.?up|commitment)/)
    let blockerIndex = findColumn(headers, /(?:blocker|dependency|waiting|open item|risk)/)
    if (ownerIndex === -1 && headers.length >= 3) ownerIndex = 0
    if (actionIndex === -1 && headers.length >= 3) actionIndex = 2
    if (blockerIndex === -1 && headers.length >= 4) blockerIndex = 3

    for (let rowIndex = index + 2; rowIndex < lines.length && /^\s*\|/.test(lines[rowIndex]); rowIndex += 1) {
      const cells = splitTableRow(lines[rowIndex])
      if (isDividerRow(cells)) continue
      const rawOwner = ownerIndex >= 0 ? cells[ownerIndex] || '' : ''
      const owner = /^(?:you|me)$/i.test(rawOwner) ? firstName(userName) || 'You' : rawOwner
      const action = actionIndex >= 0 ? cells[actionIndex] || '' : ''
      const blocker = blockerIndex >= 0 ? cells[blockerIndex] || '' : ''
      if (owner || action || blocker) rows.push({ owner, action, blocker })
    }
  }
  return rows
}

function extractActionItems(lines: string[], userName?: string): string[] {
  const section = sectionLines(lines, /^(?:action items?(?: and recommendations)?|next steps?|commitments?)$/i)
  const tableItems = extractTableRows(lines, userName)
    .filter(row => row.action)
    .map(row => row.owner ? `${row.owner}: ${row.action}` : row.action)
  return unique([...tableItems, ...bulletItems(section)]).slice(0, 7)
}

function extractBlockers(lines: string[], userName?: string): string[] {
  const tableBlockers = extractTableRows(lines, userName)
    .filter(row => row.blocker && !/^(?:none|n\/a|not applicable)$/i.test(row.blocker))
    .map(row => row.owner ? `${row.owner}: ${row.blocker}` : row.blocker)
  const sectionBlockers = bulletItems(
    sectionLines(lines, /^(?:blockers?|dependencies|risks?|open items?|open threads?)$/i),
  )
  return unique([...tableBlockers, ...sectionBlockers]).slice(0, 5)
}

function formatOwnedItem(item: string): string {
  const match = item.match(/^([^:—–-]{1,80})\s*(?::|—|–| - )\s*(.+)$/)
  if (!match) return escHtml(ensureSentence(item))
  return `<strong>${escHtml(match[1].trim())}:</strong> ${escHtml(ensureSentence(match[2]))}`
}

function htmlList(items: string[], owned = false): string {
  return `<ul style="margin:4px 0 12px;padding-left:20px">${items
    .map(item => `<li style="margin:0 0 6px">${owned ? formatOwnedItem(item) : escHtml(ensureSentence(item))}</li>`)
    .join('')}</ul>`
}

export function buildFollowUpEmailBody(
  notesMarkdown: string,
  rawMeetingTitle?: string,
  userName?: string,
  recipientName?: string,
  recipientCount = 1,
): string {
  const lines = notesMarkdown.split('\n')
  const title = sanitizeMeetingTitle(rawMeetingTitle)
  const summary = extractSummary(lines)
  const highlights = extractHighlights(lines)
  const actionItems = extractActionItems(lines, userName)
  const blockers = extractBlockers(lines, userName)
  const greetingName = recipientCount > 1 ? 'all' : firstName(recipientName)

  let body = `<p>Hi${greetingName ? ` ${escHtml(greetingName)}` : ''},</p>`
  body += title
    ? `<p>Thanks for the productive discussion on <strong>${escHtml(title)}</strong>.</p>`
    : '<p>Thanks for the productive discussion today.</p>'
  if (summary) body += `<p>${escHtml(summary)}</p>`
  if (highlights.length > 0) {
    body += '<p><strong>What we aligned on</strong></p>'
    body += htmlList(highlights)
  }
  if (actionItems.length > 0) {
    body += '<p><strong>Next steps</strong></p>'
    body += htmlList(actionItems, true)
  }
  if (blockers.length > 0) {
    body += '<p><strong>Open dependencies</strong></p>'
    body += htmlList(blockers, true)
  }
  if (!summary && highlights.length === 0 && actionItems.length === 0 && blockers.length === 0) {
    body += '<p>I captured the discussion, but the notes do not yet contain confirmed decisions or assigned next steps. Please reply with anything I missed.</p>'
  } else {
    body += '<p>If I missed anything or captured an owner incorrectly, reply here and I’ll update the plan.</p>'
  }
  body += `<p>Best,${userName ? `<br>${escHtml(userName)}` : ''}</p>`
  return body
}
