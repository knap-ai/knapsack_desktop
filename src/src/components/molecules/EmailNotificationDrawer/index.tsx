import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import { listen } from '@tauri-apps/api/event'
import { ConnectionKeys } from 'src/api/connections'
import { AutopilotActions, EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail, IFeed } from 'src/hooks/feed/useFeed'
import KNAnalytics from 'src/utils/KNAnalytics'
import {
  KNLocalStorage,
  EMAIL_NOTIFICATION_DRAWER_DISMISSED,
} from 'src/utils/KNLocalStorage'

import EmailDraftCard from 'src/components/molecules/EmailDraftCard'
import EmailAutopilotSettings from 'src/components/molecules/EmailAutopilotSettings'
import TakeActionButton from 'src/components/molecules/TakeActionButton'
import SettingsButton from 'src/components/atoms/settings-button'
import { decodeEmailSubject } from 'src/utils/emails'

interface EmailNotificationDrawerProps {
  feed: IFeed
  onGoToEmail: () => void
  userEmail: string
  userName: string
  profileProvider?: string
  forceOpen?: boolean
  forceEmailUid?: string
  onForceOpenHandled?: () => void
  isChatBusy?: boolean
}

const EmailNotificationDrawer = ({
  feed,
  onGoToEmail,
  userEmail,
  userName,
  profileProvider,
  forceOpen,
  forceEmailUid,
  onForceOpenHandled,
  isChatBusy,
}: EmailNotificationDrawerProps) => {
  const [permanentlyDismissed, setPermanentlyDismissed] = useState<boolean | null>(null)
  const [sessionDismissedIds, setSessionDismissedIds] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [generatingDraftUid, setGeneratingDraftUid] = useState<string>('')
  const [sendingReplyUid] = useState<string>('')
  const [removingEmailUid, setRemovingEmailUid] = useState<string>('')
  const [isEditorActive, setIsEditorActive] = useState(false)
  const [currentEmailUid, setCurrentEmailUid] = useState<string | null>(null)
  const [caughtUpDismissing, setCaughtUpDismissing] = useState(false)
  const [drawerWidth, setDrawerWidth] = useState(540)
  const [drawerHeight, setDrawerHeight] = useState(Math.round(window.innerHeight * 0.55))
  const resizingRef = useRef(false)
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const prevEmailCountRef = useRef<number>(0)
  const initialLoadRef = useRef(true)
  const frozenEmailRef = useRef<DisplayEmail | null>(null)
  const caughtUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAutopilotStatusRef = useRef<string | undefined>(undefined)
  const chatBusyStartRef = useRef<number | null>(null)
  const shownEmailUidsRef = useRef<Set<string>>(new Set())

  // Check if user has permanently dismissed
  useEffect(() => {
    const checkDismissed = async () => {
      const dismissed = await KNLocalStorage.getItem(EMAIL_NOTIFICATION_DRAWER_DISMISSED)
      setPermanentlyDismissed(dismissed === true)
    }
    checkDismissed()
  }, [])

  // Listen for /autopilot slash command to force-open the drawer in expanded mode
  useEffect(() => {
    const unlisten = listen('kn_trigger_autopilot', () => {
      setIsVisible(true)
      setIsExpanded(true)
      setIsAnimatingOut(false)
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // Handle forceOpen prop from parent (hotkey / event listener in Home).
  // When forceEmailUid is provided, navigate the drawer to that specific email.
  useEffect(() => {
    if (forceOpen) {
      if (forceEmailUid) {
        setCurrentEmailUid(forceEmailUid)
      }
      setPermanentlyDismissed(false)
      setIsVisible(true)
      setIsExpanded(true)
      setIsAnimatingOut(false)
      onForceOpenHandled?.()
    }
  }, [forceOpen, forceEmailUid, onForceOpenHandled])

  // Get IMPORTANT emails that need a response (drawer only shows this category)
  const emailsForCategory = useMemo(() => {
    const uniqueEmailIds = new Set<string>()
    const emails = feed?.classifiedEmails?.[EmailImportance.IMPORTANT] || []

    return emails.filter(email => {
      if (uniqueEmailIds.has(email.message.emailUid)) return false
      if (!email.wasIgnored && !email.wasReplySent && email.message.body) {
        uniqueEmailIds.add(email.message.emailUid)
        return true
      }
      return false
    })
  }, [feed.feedContent, feed.classifiedEmails])

  // Resolve current email by UID (stable across list re-sorts)
  const currentEmailIndex = useMemo(() => {
    if (!currentEmailUid) return 0
    const idx = emailsForCategory.findIndex(e => e.message.emailUid === currentEmailUid)
    return idx >= 0 ? idx : 0
  }, [emailsForCategory, currentEmailUid])

  // When the editor is active, freeze the displayed email so background updates
  // don't yank it away mid-edit.
  const currentEmail = useMemo(() => {
    if (isEditorActive && frozenEmailRef.current) {
      // Keep showing the frozen email while user is editing, but update draft if available
      const fresh = emailsForCategory.find(
        e => e.message.emailUid === frozenEmailRef.current!.message.emailUid,
      )
      if (fresh?.draftedReply && !frozenEmailRef.current.draftedReply) {
        frozenEmailRef.current = { ...frozenEmailRef.current, draftedReply: fresh.draftedReply }
      }
      return frozenEmailRef.current
    }
    const email = emailsForCategory[currentEmailIndex] || null
    frozenEmailRef.current = email
    return email
  }, [emailsForCategory, currentEmailIndex, isEditorActive])

  // Auto-select first email UID when list populates and nothing is selected
  useEffect(() => {
    if (!currentEmailUid && emailsForCategory.length > 0) {
      setCurrentEmailUid(emailsForCategory[0].message.emailUid)
    }
    // If the tracked UID is no longer in the list (e.g. after action), reset
    if (currentEmailUid && !isEditorActive) {
      const stillExists = emailsForCategory.some(e => e.message.emailUid === currentEmailUid)
      if (!stillExists && emailsForCategory.length > 0) {
        setCurrentEmailUid(emailsForCategory[0].message.emailUid)
      }
    }
  }, [emailsForCategory, currentEmailUid, isEditorActive])

  // Auto-trigger draft generation when the current email has no draft
  useEffect(() => {
    if (currentEmail && !currentEmail.draftedReply && isExpanded) {
      setGeneratingDraftUid(currentEmail.message.emailUid)
    }
  }, [currentEmail?.message.emailUid, currentEmail?.draftedReply, isExpanded])

  const actions = useMemo(() => {
    const categoryActions = feed.classificationActions[EmailImportance.IMPORTANT]
    return (
      categoryActions || {
        leftAction: AutopilotActions.MARK_AS_READ,
        rightAction: AutopilotActions.SEND_REPLY,
      }
    )
  }, [feed.classificationActions])

  const updateAction = useCallback(
    (actionSide: 'LEFT' | 'RIGHT', action: AutopilotActions) => {
      feed.updateClassificationActions(EmailImportance.IMPORTANT, actionSide, action)
    },
    [feed.updateClassificationActions],
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

  // Conservative auto-surface: only show after inference has been running for
  // a while (5s+), and only show each email once per session.
  const BUSY_DELAY_MS = 5000
  const prevChatBusyRef = useRef(isChatBusy)
  useEffect(() => {
    if (permanentlyDismissed || permanentlyDismissed === null) return

    const importantEmails = feed.classifiedEmails?.[EmailImportance.IMPORTANT] || []
    const currentCount = importantEmails.filter(
      e => !e.wasIgnored && !e.wasReplySent && e.message.body,
    ).length

    prevAutopilotStatusRef.current = feed.emailAutopilotStatus.status

    if (initialLoadRef.current) {
      prevEmailCountRef.current = currentCount
      if (feed.emailAutopilotStatus.status === 'complete') {
        initialLoadRef.current = false
      }
      return
    }

    // Track when chat became busy
    if (isChatBusy && !prevChatBusyRef.current) {
      chatBusyStartRef.current = Date.now()
    }
    if (!isChatBusy) {
      chatBusyStartRef.current = null
    }

    // Auto-dismiss when chat finishes (busy → not busy) and drawer wasn't force-opened
    if (prevChatBusyRef.current && !isChatBusy && isVisible && !forceOpen) {
      setIsAnimatingOut(true)
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimatingOut(false)
        setIsExpanded(false)
      }, 300)
    }

    prevChatBusyRef.current = isChatBusy
    prevEmailCountRef.current = currentCount
  }, [feed.classifiedEmails, feed.emailAutopilotStatus.status, permanentlyDismissed, pendingEmail, isChatBusy])

  // Delayed show: only pop the drawer after chat has been busy for BUSY_DELAY_MS,
  // and only for emails not yet shown this session.
  useEffect(() => {
    if (permanentlyDismissed || permanentlyDismissed === null) return
    if (!isChatBusy || !pendingEmail || initialLoadRef.current) return

    // Skip emails already shown this session
    if (shownEmailUidsRef.current.has(pendingEmail.message.emailUid)) return

    const timer = setTimeout(() => {
      // Re-check: still busy and same email?
      if (chatBusyStartRef.current && pendingEmail) {
        shownEmailUidsRef.current.add(pendingEmail.message.emailUid)
        setIsVisible(true)
        setIsAnimatingOut(false)
      }
    }, BUSY_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isChatBusy, pendingEmail?.message.emailUid, permanentlyDismissed])

  const isLoading =
    feed.emailAutopilotStatus.status === 'fetching-emails' ||
    feed.emailAutopilotStatus.status === 'classifying-emails' ||
    feed.emailAutopilotStatus.status === 'sync-email'

  // Graceful auto-dismiss when all emails are handled (caught up)
  useEffect(() => {
    if (
      isExpanded &&
      isVisible &&
      !isLoading &&
      !initialLoadRef.current &&
      emailsForCategory.length === 0
    ) {
      // Show "caught up" briefly, then slide out
      setCaughtUpDismissing(true)
      caughtUpTimerRef.current = setTimeout(() => {
        setIsAnimatingOut(true)
        setIsExpanded(false)
        setTimeout(() => {
          setIsVisible(false)
          setIsAnimatingOut(false)
          setCaughtUpDismissing(false)
        }, 400)
      }, 2000)
    }
    return () => {
      if (caughtUpTimerRef.current) {
        clearTimeout(caughtUpTimerRef.current)
        caughtUpTimerRef.current = null
      }
    }
  }, [emailsForCategory.length, isExpanded, isVisible, isLoading])

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
    // Sync expanded view to the same email shown in the collapsed preview
    if (pendingEmail) {
      setCurrentEmailUid(pendingEmail.message.emailUid)
    }
    setIsExpanded(true)
    KNAnalytics.trackEvent('email_drawer_expanded', {})
  }, [pendingEmail])

  const handleCollapse = useCallback(() => {
    setIsExpanded(false)
  }, [])

  const handleNoResponseNeeded = useCallback(() => {
    if (!pendingEmail) return
    const uid = pendingEmail.message.emailUid
    // Mark as read (ignored) — feeds back that this email didn't need a response
    feed.takeEmailAction(
      uid,
      AutopilotActions.MARK_AS_READ,
      profileProvider as ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
    )
    // Also session-dismiss so it doesn't reappear
    setSessionDismissedIds(prev => new Set(prev).add(uid))
  }, [pendingEmail, feed.takeEmailAction, profileProvider])


  // Resize drag handler — user drags the top-left corner to grow/shrink the drawer
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = true
    resizeStartRef.current = { x: e.clientX, y: e.clientY, w: drawerWidth, h: drawerHeight }

    const onMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const dx = resizeStartRef.current.x - ev.clientX // dragging left = increase width
      const dy = resizeStartRef.current.y - ev.clientY // dragging up = increase height
      setDrawerWidth(Math.max(400, Math.min(window.innerWidth * 0.9, resizeStartRef.current.w + dx)))
      setDrawerHeight(Math.max(300, Math.min(window.innerHeight - 32, resizeStartRef.current.h + dy)))
    }

    const onMouseUp = () => {
      resizingRef.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [drawerWidth, drawerHeight])

  const getLoadingText = (status: string) => {
    if (status === 'fetching-emails') return 'Engaging autopilot...'
    if (status === 'classifying-emails') return 'Analyzing emails...'
    if (status === 'sync-email') return 'Syncing emails...'
    return ''
  }

  // When expanded (e.g. via /autopilot), we don't need pendingEmail — the
  // category view handles empty states.  Collapsed mode still needs it.
  if (!isVisible) return null
  if (!isExpanded && !pendingEmail) return null

  const summary = pendingEmail?.classification?.summary?.join(' ') || 'New email needs your response.'
  const sender = pendingEmail?.message.sender ?? ''
  const subject = decodeEmailSubject(pendingEmail?.message.subject ?? '')
  const actionRequired = pendingEmail?.classification?.actionRequired || null

  return (
    <div
      className={`absolute bottom-0 right-0 z-40 transition-all duration-400 ease-out ${
        isAnimatingOut
          ? 'translate-y-full opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
      style={isExpanded ? { width: `${drawerWidth}px`, maxWidth: '90vw' } : { width: '540px', maxWidth: '540px' }}
    >
      <div
        className={`mr-4 mb-4 rounded-xl bg-white border border-ks-warm-grey-200 shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? '' : 'max-h-[220px]'
        }`}
        style={isExpanded ? { height: `${drawerHeight}px`, maxHeight: 'calc(100vh - 32px)' } : {}}
      >
        {/* Resize handle — top-left corner drag */}
        {isExpanded && (
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 group"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          >
            <svg className="w-3 h-3 m-0.5 text-ks-warm-grey-300 group-hover:text-ks-warm-grey-500 transition-colors" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="2" cy="2" r="1.2" />
              <circle cx="2" cy="6" r="1.2" />
              <circle cx="6" cy="2" r="1.2" />
            </svg>
          </div>
        )}
        {/* Header bar */}
        <div
          className="relative flex items-center justify-between px-4 py-2.5 bg-white border-b border-ks-warm-grey-100 shrink-0 cursor-pointer"
          onClick={isExpanded ? handleCollapse : handleExpand}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ks-red-500 animate-pulse" />
            <span className="text-xs font-semibold font-InterTight text-ks-red-700 tracking-wide uppercase">
              Email Autopilot
            </span>
            {totalPendingCount > 0 && (
              <span className="ml-1 bg-ks-red-100 text-ks-red-700 px-1.5 py-0.5 rounded-full text-xs font-Inter font-semibold">
                {totalPendingCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isExpanded && (
              <SettingsButton
                onClick={() => {
                  setShowSettings(true)
                }}
                title="Email Autopilot Settings"
              />
            )}
            {/* Open Full View icon */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleGoToEmail()
              }}
              className="p-1 rounded hover:bg-ks-warm-grey-100 transition-colors"
              title="Open Full View"
            >
              <svg className="w-3.5 h-3.5 text-ks-warm-grey-500 hover:text-ks-warm-grey-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14L21 3" />
              </svg>
            </button>
            {/* Don't show again icon */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismissForever()
              }}
              className="p-1 rounded hover:bg-ks-warm-grey-100 transition-colors"
              title="Don't show again"
            >
              <svg className="w-3.5 h-3.5 text-ks-warm-grey-500 hover:text-ks-warm-grey-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
            {/* Close / Dismiss button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="p-1 rounded hover:bg-ks-warm-grey-100 transition-colors"
              title="Dismiss"
            >
              <svg className="w-3.5 h-3.5 text-ks-warm-grey-500 hover:text-ks-warm-grey-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsed content — single email preview */}
        {!isExpanded && (
          <>
            <div className="flex-1 overflow-hidden px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold font-Lora text-ks-warm-grey-950 truncate">
                    {subject}
                  </div>
                  <div className="text-xs text-ks-warm-grey-600 font-InterTight mt-0.5 truncate">
                    From: {sender}
                  </div>
                  <div className="text-sm text-black font-Inter mt-2 leading-relaxed line-clamp-3">
                    {summary}
                  </div>
                </div>
              </div>
            </div>

            {/* Take Action button — sends email context as chat message */}
            {pendingEmail && (
              <div className="px-4 pb-1">
                <TakeActionButton
                  email={pendingEmail}
                  label={actionRequired ?? 'Take Action'}
                />
              </div>
            )}

            {/* Collapsed footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-ks-warm-grey-100 shrink-0">
              <button
                onClick={handleNoResponseNeeded}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ks-warm-grey-200 hover:bg-ks-warm-grey-100 text-ks-warm-grey-700 text-xs font-medium font-InterTight transition-colors"
              >
                No Response Needed
              </button>
              <button
                onClick={handleExpand}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ks-red-600 hover:bg-ks-red-700 text-white text-xs font-semibold font-InterTight transition-colors"
              >
                View Response
              </button>
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

            {/* Single email view — only IMPORTANT (needs response) emails */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (!emailsForCategory || emailsForCategory.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CircularProgress size="2.5rem" sx={{ color: '#C14841' }} />
                  <span className="mt-3 text-sm text-gray-500 font-Inter">
                    {getLoadingText(feed.emailAutopilotStatus.status)}
                  </span>
                </div>
              ) : !emailsForCategory || emailsForCategory.length === 0 || !currentEmail ? (
                <div className={`flex flex-col items-center justify-center py-8 transition-opacity duration-500 ${caughtUpDismissing ? 'opacity-60' : 'opacity-100'}`}>
                  <svg className="w-10 h-10 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-semibold font-Inter text-ks-warm-grey-800">
                    You're all caught up!
                  </div>
                  <div className="text-xs font-Inter text-ks-warm-grey-500 mt-1">
                    No emails need your attention right now.
                  </div>
                </div>
              ) : (
                <div>
                  {/* Prev / Next navigation */}
                  {emailsForCategory.length > 1 && (
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => {
                          const prevIdx = Math.max(0, currentEmailIndex - 1)
                          setCurrentEmailUid(emailsForCategory[prevIdx].message.emailUid)
                        }}
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
                        onClick={() => {
                          const nextIdx = Math.min(emailsForCategory.length - 1, currentEmailIndex + 1)
                          setCurrentEmailUid(emailsForCategory[nextIdx].message.emailUid)
                        }}
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

          </>
        )}
      </div>
    </div>
  )
}

export default EmailNotificationDrawer
