import { Base64 } from 'js-base64'
import { ConnectionKeys, getAccessToken } from 'src/api/connections'
import { DisplayEmail } from 'src/hooks/feed/useFeed'

interface SendEmailReplyParams {
  previousEmail: DisplayEmail
  userEmail: string
  userName: string
  body: string
  threadId?: string
}

async function getOriginalMessageId(threadId: string, accessToken: string): Promise<string> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=Message-ID`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch thread metadata')
  }

  const thread = await response.json()
  return thread.messages
    .map(
      (message: any) =>
        message.payload.headers.find((h: any) => h.name.toLowerCase() === 'message-id')?.value,
    )
    .filter(Boolean)
    .join(' ')
}

export const markEmail = async (
  threadId: string,
  asUnread: boolean,
  userEmail: string,
): Promise<void> => {
  try {
    const accessToken = await getAccessToken(userEmail, ConnectionKeys.GOOGLE_GMAIL)

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/modify`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removeLabelIds: asUnread ? ['UNREAD'] : [],
          addLabelIds: asUnread ? [] : ['UNREAD'],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gmail API error: ${errorData.error?.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error modifying email:', error)
    throw new Error('Failed to modify email read status')
  }
}

export const sendGmailReply = async ({
  previousEmail,
  userEmail,
  userName,
  body,
  threadId,
}: SendEmailReplyParams): Promise<void> => {
  const recipientList = Array.isArray(previousEmail.message.recipients)
    ? previousEmail.message.recipients.flatMap(recipient =>
        typeof recipient === 'string' && recipient.includes(',')
          ? recipient.split(',').map(r => r.trim())
          : recipient,
      )
    : typeof previousEmail.message.recipients === 'string'
      ? (previousEmail.message.recipients as string).split(',').map(r => r.trim())
      : Array.isArray(previousEmail.message.recipients)
        ? previousEmail.message.recipients
        : []

  const recipients = [previousEmail.message.sender, ...recipientList]
    .filter(recipient => !recipient.includes(userEmail))
    .join(', ')
  console.log("RECIPIENTS: ", recipients)
  let to = recipients
  let cc = previousEmail.message.cc
  let bcc: string[] | undefined
  let subject = previousEmail.message.subject
  let previousEmailDate = new Date(previousEmail.message.date * 1000).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  let fullSender = `${userName} <${userEmail}>`

  try {
    const accessToken = await getAccessToken(userEmail, ConnectionKeys.GOOGLE_GMAIL)

    let originalMessageId: string | undefined
    if (threadId) {
      originalMessageId = await getOriginalMessageId(threadId, accessToken)
    }

    const newMessageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@gmail.com>`

    const emailLines = [
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      `Message-ID: ${newMessageId}`,
      `Subject: ${subject}`,
      `From: ${fullSender}`,
      `To: ${to}`,
    ]

    // Add threading headers if this is a reply
    if (originalMessageId && threadId) {
      emailLines.push(`In-Reply-To: ${originalMessageId.split(' ').pop()}`)
      emailLines.push(`References: ${originalMessageId}`)
      emailLines.push(`Thread-Topic: ${subject}`)
    }

    // Add CC and BCC
    if (cc && cc.length > 0) {
      emailLines.push(`Cc: ${cc.join(', ')}`)
    }
    if (bcc !== undefined && bcc.length > 0) {
      emailLines.push(`Bcc: ${bcc.join(', ')}`)
    }

    emailLines.push(
      '',
      '<div>',
      `<p>${body.replace(/\n/g, '<br>')}</p>`,
      '<p style="margin-top: 16px; color: #666; font-size: 13px;">',
      'Crafted with care using <a href="https://knapsack.ai" style="color: #0066cc; text-decoration: none;">Knapsack</a>',
      '</p>',
      '</div>',
      '',
    )

    if (previousEmail && previousEmail.message.body) {
      const stripHtml = (html: string) => {
        return html.replace(/<(?!\/?(blockquote|p|div|br)(?=>|\s.*>))\s*\/?[^>]*>/g, '')
      }

      const strippedBody = stripHtml(previousEmail.message.body)
      emailLines.push(
        '<div class="gmail_quote">',
        '<details style="margin: 0; padding: 0;">',
        '<summary style="color: #666; cursor: pointer; outline: none; margin-bottom: 8px; display: inline-block; width: 100%; border-top: 1px solid #ccc; padding-top: 8px;">&nbsp;</summary>',
        `<div class="gmail_attr" style="color: #666; margin: 16px 0 8px;">On ${previousEmailDate} ${previousEmail.message.sender} wrote:</div>`,
        '<blockquote class="gmail_quote" style="margin:0 0 0 .8ex; border-left:1px #ccc solid; padding-left:1ex;">',
        strippedBody
          .split('\n')
          .map(line => `<p>${line}</p>`)
          .join(''),
        '</blockquote>',
        '</details>',
        '</div>',
      )
    }

    const email = emailLines.join('\r\n')

    const encodedEmail = Base64.encodeURI(email)

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
        ...(threadId && { threadId }), // Only include threadId if it exists
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gmail API error: ${errorData.error?.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}
