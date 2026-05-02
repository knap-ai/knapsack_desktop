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
