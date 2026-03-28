import { useCallback } from 'react'

import { DisplayEmail } from 'src/hooks/feed/useFeed'
import { decodeEmailSubject } from 'src/utils/emails'
import KNAnalytics from 'src/utils/KNAnalytics'

interface TakeActionButtonProps {
  email: DisplayEmail
  /** Optional custom label; defaults to "Take Action" */
  label?: string
}

const TakeActionButton = ({ email, label = 'Take Action' }: TakeActionButtonProps) => {
  const handleClick = useCallback(() => {
    const subject = decodeEmailSubject(email.message.subject ?? '')
    const sender = email.message.sender ?? ''
    const summary = email.classification?.summary?.join(' ') ?? ''
    const actionHint = email.classification?.actionRequired ?? ''

    // Build a chat prompt with the email context
    const parts = [
      `I need to take action on an email:`,
      `Subject: "${subject}"`,
      `From: ${sender}`,
    ]
    if (summary) parts.push(`Summary: ${summary}`)
    if (actionHint) parts.push(`Suggested action: ${actionHint}`)
    parts.push(`\nWhat should I do?`)

    const msg = parts.join('\n')
    // Navigate to the chat tab first, then send the message
    window.dispatchEvent(new CustomEvent('clawd-focus-chat'))
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('clawd-send-user', { detail: msg }))
    }, 150)

    KNAnalytics.trackEvent('email_take_action', {
      has_action_hint: !!actionHint,
    })
  }, [email])

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold font-InterTight transition-colors"
      title="Take a non-email action on this request via chat"
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {label}
    </button>
  )
}

export default TakeActionButton
