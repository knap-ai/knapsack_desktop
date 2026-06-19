const commonDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'live.com',
  'mac.com',
  'me.com',
  'msn.com',
  'sbcglobal.net',
  'verizon.net',
  'att.net',
]

export function getEmailStringPrompt(emailsList: any[] | undefined): string[] | undefined {
  return emailsList
    ?.filter(email => {
      const textDetail = email.details.find((detail: any) => detail.name === 'Text')
      return textDetail && !textDetail.value.includes('X-Received')
    })
    .map(
      (email, _) => `
-----
Email:
${email.details
  .filter(
    (detail: any) =>
      ['From', 'To', 'Cc', 'Subject', 'Received', 'Text'].includes(detail.name) && detail.value,
  )
  .map((detail: any) => `${detail.name}: ${detail.value}`)
  .join('\n')}
-----
`,
    )
}

export function extractDomain(email: string): string {
  return email.split('@')[1]
}

export function extractWorkDomains(myEmail: string, emailList: string[]): string[] {
  const myDomain = myEmail.split('@')[1]

  return emailList
    .map(email => email.split('@')[1])
    .filter(domain => domain !== myDomain && !commonDomains.includes(domain))
}

export function extractInternalEmails(myEmail: string, emailList: string[]): string[] {
  const myDomain = myEmail.split('@')[1]

  return emailList.filter(email => {
    const domain = email.split('@')[1]
    return domain === myDomain
  })
}

export function extractExternalEmails(myEmail: string, emailList: string[]): string[] {
  const myDomain = myEmail.split('@')[1]

  return emailList.filter(email => {
    const domain = email.split('@')[1]
    return domain !== myDomain
  })
}

function cleanMeetingLine(line: string): string {
  return line
    .replace(/^[-*]\s*/, '')
    .replace(/^-\s*\[[ xX]\]\s*/, '')
    .replace(/^action item[s]?:\s*/i, '')
    .replace(/^action:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function ensureSentence(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function extractSection(lines: string[], heading: RegExp): string[] {
  const startIndex = lines.findIndex(line => heading.test(line.trim()))
  if (startIndex === -1) return []
  const out: string[] = []
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    if (/^##\s+/.test(line)) break
    out.push(line)
  }
  return out
}

function extractHighlights(lines: string[]): string[] {
  const sectionLines = extractSection(lines, /^##\s+Highlights/i)
  return sectionLines
    .filter(line => /^[-*]\s+/.test(line))
    .map(cleanMeetingLine)
    .filter(Boolean)
    .slice(0, 3)
}

function extractActionItems(lines: string[]): string[] {
  const explicitSection = extractSection(lines, /^##\s+Action Items/i)
  const sectionMatches = explicitSection
    .filter(line => /^[-*]\s+/.test(line))
    .map(cleanMeetingLine)
    .filter(Boolean)

  if (sectionMatches.length > 0) {
    return sectionMatches
  }

  return lines
    .filter(line => /^-\s*\[[ xX]\]/.test(line) || /^action item[s]?:/i.test(line) || /^action:/i.test(line))
    .map(cleanMeetingLine)
    .filter(Boolean)
}

function extractSummaryParagraph(lines: string[]): string | undefined {
  const summaryIndex = lines.findIndex(line => /^#\s+Summary/i.test(line.trim()))
  if (summaryIndex === -1) return
  const summaryLines: string[] = []
  for (let i = summaryIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    if (/^##\s+/.test(line) || /^#\s+Meeting Notes/i.test(line)) break
    if (/^[-*]\s+/.test(line)) continue
    summaryLines.push(line)
    if (summaryLines.join(' ').length > 240) break
  }
  const summary = ensureSentence(summaryLines.join(' ').replace(/\s+/g, ' ').trim())
  return summary || undefined
}

function firstName(nameOrEmail?: string): string | undefined {
  const value = nameOrEmail?.trim()
  if (!value) return
  const beforeEmail = value.split('<')[0].trim()
  const candidate = beforeEmail || value.split('@')[0].trim()
  const token = candidate.split(/\s+/)[0]?.trim()
  return token || undefined
}

/**
 * Build a short, conversational meeting follow-up email from meeting notes.
 * We intentionally avoid dumping raw task lists into the draft.
 */
export function buildFollowUpEmailBody(
  notesMarkdown: string,
  meetingTitle?: string,
  userName?: string,
  recipientName?: string,
): string {
  const lines = notesMarkdown.split('\n')
  const summary = extractSummaryParagraph(lines)
  const highlights = extractHighlights(lines)
  const actionItems = extractActionItems(lines)

  const greetingName = firstName(recipientName)
  const greeting = `<p>Hi${greetingName ? ` ${escHtml(greetingName)}` : ''},</p>`
  const intro = `<p>Great meeting today${meetingTitle ? ` about <strong>${escHtml(meetingTitle)}</strong>` : ''}. Thanks again for your time.</p>`

  let body = greeting + intro

  if (summary) {
    body += `<p>${escHtml(summary)}</p>`
  }

  if (highlights.length > 0) {
    body += `<p>A few quick takeaways from our conversation:</p><ul style="margin:4px 0;padding-left:20px">`
    highlights.forEach(item => {
      body += `<li>${escHtml(ensureSentence(item))}</li>`
    })
    body += `</ul>`
  }

  if (actionItems.length > 0) {
    body += `<p>I’ll follow up on the next steps we discussed and keep you posted on progress.</p>`
  } else if (highlights.length === 0 && !summary) {
    body += `<p>I’m happy to send over anything else that would be helpful from our conversation.</p>`
  }

  body += `<p>Please let me know if there’s anything you’d like me to prioritize or clarify.</p>`
  body += `<p>Best,<br>${escHtml(userName || '')}</p>`
  return body
}

/**
 * Decode common encoding issues in email subject lines.
 * Handles HTML entities and RFC 2047 MIME encoded-words that the backend
 * may not have fully decoded.
 */
export function decodeEmailSubject(subject: string): string {
  if (!subject) return subject

  let decoded = subject

  // 1. Decode RFC 2047 MIME encoded-words: =?charset?encoding?text?=
  //    Supports Base64 (B) and Quoted-Printable (Q) encodings
  decoded = decoded.replace(
    /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g,
    (_match, _charset: string, encoding: string, text: string) => {
      try {
        if (encoding.toUpperCase() === 'B') {
          return atob(text)
        } else if (encoding.toUpperCase() === 'Q') {
          return text
            .replace(/_/g, ' ')
            .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16)),
            )
        }
      } catch {
        // If decoding fails, return original text
      }
      return text
    },
  )

  // 2. Decode HTML entities (numeric and named)
  if (/&[#a-zA-Z]/.test(decoded)) {
    const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
    if (textarea) {
      textarea.innerHTML = decoded
      decoded = textarea.value
    }
  }

  return decoded
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function markdownToEmailHtml(markdown: string): string {
  const lines = markdown.split('\n')
  const out: string[] = []
  let inList = false

  const closeList = () => { if (inList) { out.push('</ul>'); inList = false } }

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('### ')) {
      closeList(); out.push(`<h4 style="margin:8px 0 4px">${escHtml(t.slice(4))}</h4>`)
    } else if (t.startsWith('## ')) {
      closeList(); out.push(`<h3 style="margin:10px 0 4px">${escHtml(t.slice(3))}</h3>`)
    } else if (t.startsWith('# ')) {
      closeList(); out.push(`<h2 style="margin:12px 0 6px">${escHtml(t.slice(2))}</h2>`)
    } else if (/^-\s+\[[xX]\]\s+/.test(t)) {
      if (!inList) { out.push('<ul style="margin:4px 0;padding-left:20px">'); inList = true }
      out.push(`<li>&#9746; ${escHtml(t.replace(/^-\s+\[[xX]\]\s+/, ''))}</li>`)
    } else if (/^-\s+\[ \]\s+/.test(t)) {
      if (!inList) { out.push('<ul style="margin:4px 0;padding-left:20px">'); inList = true }
      out.push(`<li>&#9744; ${escHtml(t.replace(/^-\s+\[ \]\s+/, ''))}</li>`)
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      if (!inList) { out.push('<ul style="margin:4px 0;padding-left:20px">'); inList = true }
      out.push(`<li>${escHtml(t.slice(2))}</li>`)
    } else if (t === '') {
      closeList()
    } else {
      closeList()
      out.push(`<p style="margin:6px 0">${escHtml(t)}</p>`)
    }
  }
  closeList()
  return out.join('')
}
