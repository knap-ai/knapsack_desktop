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

/**
 * Build a conversational meeting follow-up email from raw meeting notes markdown.
 * Extracts action items and key decisions, then writes them as plain prose rather
 * than pasting the full structured notes dump.
 */
export function buildFollowUpEmailBody(notesMarkdown: string, meetingTitle?: string, userName?: string): string {
  const lines = notesMarkdown.split('\n').map(l => l.trim()).filter(Boolean)

  // Pull out action items (lines with checkboxes or starting with "Action:")
  const actionItems = lines.filter(l =>
    /^-\s*\[[ xX]\]/.test(l) || /^action item[s]?:/i.test(l) || /^action:/i.test(l)
  ).map(l => l.replace(/^-\s*\[[ xX]\]\s*/, '').replace(/^action item[s]?:\s*/i, '').replace(/^action:\s*/i, ''))

  // Pull out key decisions / outcomes
  const decisions = lines.filter(l =>
    /^(?:decision|outcome|agreed|next step)[s]?:/i.test(l)
  ).map(l => l.replace(/^[^:]+:\s*/i, ''))

  const greeting = `<p>Hi,</p>`
  const intro = `<p>Great meeting${meetingTitle ? ` about ${meetingTitle}` : ''} — thanks for your time!</p>`

  let body = greeting + intro

  if (actionItems.length > 0) {
    body += `<p>Here's what we agreed on:</p><ul style="margin:4px 0;padding-left:20px">`
    actionItems.forEach(item => { body += `<li>${escHtml(item)}</li>` })
    body += `</ul>`
  } else if (decisions.length > 0) {
    body += `<p>Key takeaways:</p><ul style="margin:4px 0;padding-left:20px">`
    decisions.forEach(d => { body += `<li>${escHtml(d)}</li>` })
    body += `</ul>`
  } else {
    body += `<p>Happy to share a quick summary if useful — just let me know.</p>`
  }

  body += `<p>Let me know if you have any questions or if anything needs adjusting.</p>`
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
