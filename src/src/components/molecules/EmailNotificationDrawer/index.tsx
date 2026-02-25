import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import { ConnectionKeys } from 'src/api/connections'
import { AutopilotActions, EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail, IFeed } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import KNAnalytics from 'src/utils/KNAnalytics'
import {
  KNLocalStorage,
  EMAIL_NOTIFICATION_DRAWER_DISMISSED,
} from 'src/utils/KNLocalStorage'

import EmailCategoryTabs from 'src/components/organisms/EmailCategoryTabs'
import EmailDraftCard from 'src/components/molecules/EmailDraftCard'
import EmailAutopilotSettings from 'src/components/molecules/EmailAutopilotSettings'
import SettingsButton from 'src/components/atoms/settings-button'

interface EmailNotificationDrawerProps {
  feed: IFeed
  onGoToEmail: () => void
  userEmail: string
  userName: string
  profileProvider?: string
}

const EmailNotificationDrawer = ({
  feed,
  onGoToEmail,
  userEmail,
  userName,
  profileProvider,
}: EmailNotificationDrawerProps) => {
  const [permanentlyDismissed, setPermanentlyDismissed] = useState<boolean | null>(null)
  const [sessionDismissedIds, setSessionDismissedIds] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [generatingDraftUid, setGeneratingDraftUid] = useState<string>('')
  const [sendingReplyUid, setSendingReplyUid] = useState<string>('')
  const [removingEmailUid, setRemovingEmailUid] = useState<string>('')
  const [isEditorActive, setIsEditorActive] = useState(false)
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0)
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

  const selectedCategory = useMemo(
    () => feed.selectedEmailCategory || EmailImportance.IMPORTANT,
    [feed.selectedEmailCategory],
  ) as EmailImportance

  // Email counts for category tabs
  const emailCounts = useMemo(() => {
    const counts: Record<EmailImportance, { total: number; active: number }> = {
      [EmailImportance.IMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.IMPORTANT_NO_RESPONSE]: { total: 0, active: 0 },
      [EmailImportance.INFORMATIONAL]: { total: 0, active: 0 },
      [EmailImportance.MARKETING]: { total: 0, active: 0 },
      [EmailImportance.UNIMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.UNCLASSIFIED]: { total: 0, active: 0 },
    }

    if (feed?.classifiedEmails) {
      Object.entries(feed.classifiedEmails).forEach(([category, emails]) => {
        const importanceValue = Object.values(EmailImportance).find(value => value === category)
        if (importanceValue) {
          const activeEmails =
            emails?.filter(email => !email.wasIgnored && !email.wasReplySent) || []
          counts[category as EmailImportance] = {
            total: emails?.length || 0,
            active: activeEmails.length,
          }
        }
      })
    }

    return counts
  }, [feed?.classifiedEmails])

  // Get filtered emails for the selected category
  const emailsForCategory = useMemo(() => {
    const uniqueEmailIds = new Set()

    const filterUniqueEmails = (emails: DisplayEmail[] | undefined) => {
      if (!emails) return []
      return emails.filter(email => {
        if (uniqueEmailIds.has(email.message.emailUid)) return false
        if (!email.wasIgnored && !email.wasReplySent && email.message.body) {
          uniqueEmailIds.add(email.message.emailUid)
        }
        return !email.wasIgnored && !email.wasReplySent && email.message.body
      })
    }

    const primaryEmails = filterUniqueEmails(feed?.classifiedEmails?.[selectedCategory])

    if (selectedCategory === EmailImportance.IMPORTANT_NO_RESPONSE) {
      const informationalEmails = filterUniqueEmails(
        feed?.classifiedEmails?.[EmailImportance.INFORMATIONAL],
      )
      return [...primaryEmails, ...informationalEmails]
    }

    if (selectedCategory === EmailImportance.MARKETING) {
      const unimportantEmails = filterUniqueEmails(
        feed?.classifiedEmails?.[EmailImportance.UNIMPORTANT],
      )
      return [...primaryEmails, ...unimportantEmails]
    }

    return primaryEmails
  }, [feed.feedContent, feed.classifiedEmails, selectedCategory])

  // Reset to first email when category changes
  useEffect(() => {
    setCurrentEmailIndex(0)
  }, [selectedCategory])

  // Clamp index if list shrinks (e.g. after action removes an email)
  useEffect(() => {
    if (emailsForCategory.length > 0 && currentEmailIndex >= emailsForCategory.length) {
      setCurrentEmailIndex(emailsForCategory.length - 1)
    }
  }, [emailsForCategory.length, currentEmailIndex])

  const currentEmail = emailsForCategory[currentEmailIndex] || null

  const actions = useMemo(() => {
    const categoryActions = feed.classificationActions[selectedCategory]
    return (
      categoryActions || {
        leftAction: AutopilotActions.MARK_AS_READ,
        rightAction: AutopilotActions.SEND_REPLY,
      }
    )
  }, [feed.classificationActions, selectedCategory])

  const updateAction = useCallback(
    (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => {
      feed.updateClassificationActions(selectedCategory, actionSide, action)
    },
    [feed.updateClassificationActions, selectedCategory],
  )

  // Get IMPORTANT emails that need a response and haven't been dismissed (for collapsed notification)
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

  // Total count of active important emails
  const totalPendingCount = useMemo(() => {
    const importantEmails = feed.classifiedEmails?.[EmailImportance.IMPORTANT] || []
    return importantEmails.filter(
      e => !e.wasIgnored && !e.wasReplySent && e.message.body,
    ).length
  }, [feed.classifiedEmails])

  // Track when new classified emails arrive (don't show on initial load)
  useEffect(() => {
    if (permanentlyDismissed || permanentlyDismissed === null) return

    const importantEmails = feed.classifiedEmails?.[EmailImportance.IMPORTANT] || []
    const currentCount = importantEmails.filter(
      e => !e.wasIgnored && !e.wasReplySent && e.message.body,
    ).length

    if (initialLoadRef.current) {
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

  const handleEmailActionTaken = useCallback((
    actionTaken: AutopilotActions,
    emailUid: string,
    draftReply?: string,
  ) => {
    if (
      actionTaken === AutopilotActions.MARK_AS_READ ||
      actionTaken === AutopilotActions.DELETE ||
      actionTaken === AutopilotActions.ARCHIVE
    ) {
      setRemovingEmailUid(emailUid)
      setTimeout(() => {
        feed.takeEmailAction(
          emailUid,
          actionTaken,
          profileProvider as ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
        )
        setRemovingEmailUid('')
      }, 300)
    } else if (
      actionTaken === AutopilotActions.SEND_REPLY ||
      actionTaken === AutopilotActions.REPLY_ARCHIVE ||
      actionTaken === AutopilotActions.REPLY_DELETE ||
      actionTaken === AutopilotActions.GENERATE_DRAFT_REPLY
    ) {
      feed.takeEmailAction(
        emailUid,
        actionTaken,
        profileProvider as ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
        draftReply,
      )
    }
  }, [feed.takeEmailAction, profileProvider])

  const handleDismiss = useCallback(() => {
    if (pendingEmail) {
      setSessionDismissedIds(prev => new Set(prev).add(pendingEmail.message.emailUid))
    }
    setIsAnimatingOut(true)
    setIsExpanded(false)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
    }, 300)
  }, [pendingEmail])

  const handleDismissForever = useCallback(async () => {
    await KNLocalStorage.setItem(EMAIL_NOTIFICATION_DRAWER_DISMISSED, true)
    setPermanentlyDismissed(true)
    setIsAnimatingOut(true)
    setIsExpanded(false)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
    }, 300)
  }, [])

  const handleGoToEmail = useCallback(() => {
    setIsAnimatingOut(true)
    setIsExpanded(false)
    setTimeout(() => {
      setIsVisible(false)
      setIsAnimatingOut(false)
      onGoToEmail()
    }, 200)
  }, [onGoToEmail])

  const handleExpand = useCallback(() => {
    setIsExpanded(true)
    KNAnalytics.trackEvent('email_drawer_expanded', {})
  }, [])

  const handleCollapse = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const isLoading =
    feed.emailAutopilotStatus.status === 'fetching-emails' ||
    feed.emailAutopilotStatus.status === 'classifying-emails' ||
    feed.emailAutopilotStatus.status === 'sync-email'

  const getLoadingText = (status: string) => {
    if (status === 'fetching-emails') return 'Engaging autopilot...'
    if (status === 'classifying-emails') return 'Analyzing emails...'
    if (status === 'sync-email') return 'Syncing emails...'
    return ''
  }

  if (!isVisible || !pendingEmail) return null

  const summary = pendingEmail.classification?.summary?.join(' ') || 'New email needs your response.'
  const sender = pendingEmail.message.sender
  const subject = pendingEmail.message.subject
  const date = KNDateUtils.formatFriendlyDate(pendingEmail.message.date)

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
        isAnimatingOut ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <div
        className={`mx-4 mb-4 rounded-xl bg-white border border-ks-warm-grey-200 shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[70vh]' : 'max-h-[200px]'
        }`}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-50 to-white border-b border-ks-warm-grey-100 cursor-pointer shrink-0"
          onClick={isExpanded ? handleCollapse : handleExpand}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold font-InterTight text-blue-700 tracking-wide uppercase">
              Email Autopilot
            </span>
            {totalPendingCount > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs font-Inter font-semibold">
                {totalPendingCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isExpanded && (
              <SettingsButton
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSettings(true)
                }}
                title="Email Autopilot Settings"
              />
            )}
            <span className="text-xs text-ks-warm-grey-600 font-InterTight">{date}</span>
            <svg
              className={`w-4 h-4 text-ks-warm-grey-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>

        {/* Collapsed content — single email preview */}
        {!isExpanded && (
          <>
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

            {/* Collapsed actions */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-ks-warm-grey-50 border-t border-ks-warm-grey-100 shrink-0">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExpand}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ks-warm-grey-200 bg-white hover:bg-ks-warm-grey-50 text-xs font-semibold font-InterTight text-ks-warm-grey-800 transition-colors"
                >
                  Open Autopilot
                </button>
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
                  Full View
                </button>
              </div>
            </div>
          </>
        )}

        {/* Expanded content — full autopilot mini-view */}
        {isExpanded && (
          <>
            {/* Settings Sidebar */}
            {showSettings && (
              <div className="fixed inset-0 z-50 flex justify-end">
                <div
                  className="bg-ks-warm-grey-200 bg-opacity-80 absolute inset-0"
                  onClick={() => setShowSettings(false)}
                />
                <div className="relative z-10 w-80 h-full overflow-auto">
                  <EmailAutopilotSettings onClose={() => setShowSettings(false)} />
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div className="border-b border-ks-warm-grey-100 shrink-0">
              <EmailCategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => {
                  if (feed.setSelectedEmailCategory) {
                    feed.setSelectedEmailCategory(category)
                  }
                }}
                emailCounts={emailCounts}
              />
            </div>

            {/* Single email view */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (!emailsForCategory || emailsForCategory.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CircularProgress size="2.5rem" sx={{ color: '#C14841' }} />
                  <span className="mt-3 text-sm text-gray-500 font-Inter">
                    {getLoadingText(feed.emailAutopilotStatus.status)}
                  </span>
                </div>
              ) : !emailsForCategory || emailsForCategory.length === 0 || !currentEmail ? (
                <div className="text-center text-gray-500 mt-4 font-Inter text-sm">
                  You're all caught up!
                </div>
              ) : (
                <div>
                  {/* Prev / Next navigation */}
                  {emailsForCategory.length > 1 && (
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentEmailIndex(i => Math.max(0, i - 1))}
                        disabled={currentEmailIndex === 0}
                        className="flex items-center gap-1 text-xs font-medium font-InterTight text-ks-warm-grey-700 hover:text-black disabled:text-ks-warm-grey-300 disabled:cursor-default transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Prev
                      </button>
                      <span className="text-xs font-Inter text-ks-warm-grey-600">
                        {currentEmailIndex + 1} of {emailsForCategory.length}
                      </span>
                      <button
                        onClick={() => setCurrentEmailIndex(i => Math.min(emailsForCategory.length - 1, i + 1))}
                        disabled={currentEmailIndex === emailsForCategory.length - 1}
                        className="flex items-center gap-1 text-xs font-medium font-InterTight text-ks-warm-grey-700 hover:text-black disabled:text-ks-warm-grey-300 disabled:cursor-default transition-colors"
                      >
                        Next
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div
                    key={currentEmail.message.emailUid}
                    className={`transition-opacity duration-300 ease-out ${
                      removingEmailUid === currentEmail.message.emailUid ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <EmailDraftCard
                      emailAutopilot={feed.emailAutopilot}
                      email={currentEmail}
                      onActionCallback={(
                        actionTaken: AutopilotActions,
                        emailUid: string,
                        draftReply?: string,
                      ) => handleEmailActionTaken(actionTaken, emailUid, draftReply)}
                      userEmail={userEmail}
                      userName={userName}
                      profileProvider={profileProvider ? profileProvider : ''}
                      selected={true}
                      generatingDraftUid={generatingDraftUid}
                      sendingReplyUid={sendingReplyUid}
                      actions={actions}
                      updateAction={updateAction}
                      setIsEditorActive={setIsEditorActive}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expanded footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-ks-warm-grey-50 border-t border-ks-warm-grey-100 shrink-0">
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
                Open Full View
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailNotificationDrawer
