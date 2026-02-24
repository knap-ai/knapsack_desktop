import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail, IFeed } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import {
  KNLocalStorage,
  EMAIL_NOTIFICATION_DRAWER_DISMISSED,
} from 'src/utils/KNLocalStorage'

interface EmailNotificationDrawerProps {
  feed: IFeed
  onGoToEmail: () => void
}

const EmailNotificationDrawer = ({ feed, onGoToEmail }: EmailNotificationDrawerProps) => {
  const [permanentlyDismissed, setPermanentlyDismissed] = useState<boolean | null>(null)
  const [sessionDismissedIds, setSessionDismissedIds] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const prevEmailCountRef = useRef<number>(0)
  const initialLoadRef = useRef(true)

  // Check if user has permanently dismissed
  useEffect(() => {
    const checkDismissed = async () => {
      const dismissed = await KNLocalStorage.getItem(EMAIL_NOTIFICATION_DRAWER_DISMISSED)
      setPermanentlyDismissed(dismissed === true)
    }
    checkDismissed()
  }, [])

  // Get IMPORTANT emails that need a response and haven't been dismissed
  const pendingEmail: DisplayEmail | null = useMemo(() => {
    if (permanentlyDismissed || permanentlyDismissed === null) return null

    const importantEmails = feed.classifiedEmails?.[EmailImportance.IMPORTANT] || []
    const activeEmails = importantEmails.filter(
      email =>
        !email.wasIgnored &&
        !email.wasReplySent &&
        email.message.body &&
        !sessionDismissedIds.has(email.message.emailUid),
    )

    return activeEmails.length > 0 ? activeEmails[0] : null
  }, [feed.classifiedEmails, permanentlyDismissed, sessionDismissedIds])

  // Track when new classified emails arrive (don't show on initial load)
  useEffect(() => {
    if (permanentlyDismissed || permanentlyDismissed === null) return

    const importantEmails = feed.classifiedEmails?.[EmailImportance.IMPORTANT] || []
    const currentCount = importantEmails.filter(
      e => !e.wasIgnored && !e.wasReplySent && e.message.body,
    ).length

    if (initialLoadRef.current) {
      // On initial load, just record the count but don't show
      prevEmailCountRef.current = currentCount
      if (feed.emailAutopilotStatus.status === 'complete') {
        initialLoadRef.current = false
      }
      return
    }

    if (currentCount > prevEmailCountRef.current && pendingEmail) {
      setIsVisible(true)
      setIsAnimatingOut(false)
    }

    prevEmailCountRef.current = currentCount
  }, [feed.classifiedEmails, feed.emailAutopilotStatus.status, permanentlyDismissed, pendingEmail])

  const handleDismiss = useCallback(() => {
    if (pendingEmail) {
      setSessionDismissedIds(prev => new Set(prev).add(pendingEmail.message.emailUid))
    }
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
    }, 300)
  }, [pendingEmail])

  const handleDismissForever = useCallback(async () => {
    await KNLocalStorage.setItem(EMAIL_NOTIFICATION_DRAWER_DISMISSED, true)
    setPermanentlyDismissed(true)
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
    }, 300)
  }, [])

  const handleGoToEmail = useCallback(() => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
      onGoToEmail()
    }, 200)
  }, [onGoToEmail])

  if (!isVisible || !pendingEmail) return null

  const summary = pendingEmail.classification?.summary?.join(' ') || 'New email needs your response.'
  const sender = pendingEmail.message.sender
  const subject = pendingEmail.message.subject
  const date = KNDateUtils.formatFriendlyDate(pendingEmail.message.date)

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out ${
        isAnimatingOut ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-4 mb-4 rounded-xl bg-white border border-ks-warm-grey-200 shadow-lg overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-50 to-white border-b border-ks-warm-grey-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold font-InterTight text-blue-700 tracking-wide uppercase">
              New Email
            </span>
          </div>
          <span className="text-xs text-ks-warm-grey-600 font-InterTight">{date}</span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold font-Lora text-zinc-900 truncate">
                {subject}
              </div>
              <div className="text-xs text-ks-warm-grey-600 font-InterTight mt-0.5 truncate">
                From: {sender}
              </div>
              <div className="text-sm text-black font-Inter mt-2 leading-relaxed line-clamp-2">
                {summary}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-ks-warm-grey-50 border-t border-ks-warm-grey-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="text-xs font-medium font-InterTight text-ks-warm-grey-600 hover:text-ks-warm-grey-800 transition-colors"
            >
              Dismiss
            </button>
            <span className="text-ks-warm-grey-300">|</span>
            <button
              onClick={handleDismissForever}
              className="text-xs font-medium font-InterTight text-ks-warm-grey-500 hover:text-red-500 transition-colors"
            >
              Don't show again
            </button>
          </div>
          <button
            onClick={handleGoToEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold font-InterTight transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            View in Email
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailNotificationDrawer
