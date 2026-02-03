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
