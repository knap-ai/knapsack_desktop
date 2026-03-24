import { useCallback, useMemo, useRef, useState } from 'react'

import dayjs from 'dayjs'
import { insertFeedItemAPI } from 'src/api/feed_items'
import { insertSystemMessage } from 'src/api/automations'
import { getTranscript } from 'src/api/transcripts'
import { createThread, ThreadType } from 'src/api/threads'
import {
  MORNING_BRIEFING_PROMPT,
  EMAIL_ALERT_PROMPT,
  PRE_MEETING_PREP_PROMPT,
  POST_MEETING_FOLLOWUP_PROMPT,
  PROACTIVE_CHECKIN_PROMPT,
} from 'src/prompts'
import DataFetcher, { getCalendarEvents } from 'src/utils/data_fetch'
import { CalendarEvents } from 'src/hooks/dataSources/useCalendar'
import { logError } from 'src/utils/errorHandling'
import {
  getBackgroundNotificationsEnabled,
  setBackgroundNotificationsLastRun,
  getPostMeetingFollowupEnabled,
} from 'src/utils/settings'
import { arePushNotificationsOSEnabledAndWantedByUser } from 'src/utils/permissions/notification'
import { ButtonConfig } from 'src/components/molecules/MeetingNotification'
import { LLMParams } from 'src/App'
import KNAnalytics from 'src/utils/KNAnalytics'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import {
  getWhatsAppStatus,
  getIMessageStatus,
  sendChannelMessage,
} from 'src/api/channels'

type BackgroundNotificationResult = {
  notificationTitle: string
  notificationBody: string
  fullAnalysis: string
  category?: string
  priority?: string
  actionItemCount?: number
  meetingTitle?: string
  shouldNotify?: boolean
  suggestedActionShort?: string
  suggestedActionPrompt?: string
}

type UseBackgroundNotificationsProps = {
  userEmail: string
  userName: string
  openNotificationWindow: (
    eventId: string | undefined,
    buttonConfigs: ButtonConfig[],
    title: string,
    time: string,
  ) => Promise<void>
  addToLLMQueue: (item: LLMParams) => void
}

// Adaptive throttle: minimum minutes between notifications by priority
const THROTTLE_MINUTES = {
  high: 30,
  medium: 90,
  low: 120,
}

// When channels are attached, the user explicitly wants to be reached — lower throttles
const THROTTLE_MINUTES_WITH_CHANNELS = {
  high: 10,
  medium: 30,
  low: 60,
}

// Maximum background notifications per day (excludes post-meeting follow-ups)
const MAX_DAILY_NOTIFICATIONS = 6

// Higher daily cap when channels are attached — user opted into being chatty
const MAX_DAILY_NOTIFICATIONS_WITH_CHANNELS = 15

// LocalStorage keys for notification state
const KN_MORNING_BRIEFING_DATE = 'kn_morning_briefing_date'
const KN_DAILY_NOTIFICATION_COUNT = 'kn_daily_notification_count'
const KN_DAILY_NOTIFICATION_DATE = 'kn_daily_notification_date'
const KN_LAST_PROACTIVE_CHECKIN = 'kn_last_proactive_checkin'
const KN_PREPPED_MEETING_IDS = 'kn_prepped_meeting_ids'

/** Load persisted prepped-meeting IDs from localStorage, pruning any older than 7 days. */
function loadPreppedMeetingIds(): Set<string> {
  try {
    const stored = localStorage.getItem(KN_PREPPED_MEETING_IDS)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        // Each entry is { id, ts } where ts is when it was added
        const now = Date.now()
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        const valid = parsed.filter(
          (e: { id: string; ts: number }) => now - e.ts < sevenDays,
        )
        // Re-save pruned list
        localStorage.setItem(KN_PREPPED_MEETING_IDS, JSON.stringify(valid))
        return new Set<string>(valid.map((e: { id: string }) => e.id))
      }
    }
  } catch {
    // ignore corrupt data
  }
  return new Set<string>()
}

/** Persist a meeting ID to the prepped set in localStorage. */
function persistPreppedMeetingId(meetingKey: string) {
  try {
    const stored = localStorage.getItem(KN_PREPPED_MEETING_IDS)
    const entries: { id: string; ts: number }[] = stored
      ? JSON.parse(stored)
      : []
    if (!entries.some(e => e.id === meetingKey)) {
      entries.push({ id: meetingKey, ts: Date.now() })
    }
    localStorage.setItem(KN_PREPPED_MEETING_IDS, JSON.stringify(entries))
  } catch {
    // ignore
  }
}

export function useBackgroundNotifications({
  userEmail,
  userName,
  openNotificationWindow,
  addToLLMQueue,
}: UseBackgroundNotificationsProps) {
  const dataFetcher = useMemo(() => new DataFetcher(), [])
  const [isProcessing, setIsProcessing] = useState(false)
  const pendingInsightRef = useRef<BackgroundNotificationResult | null>(null)
  const pendingFollowupRef = useRef<BackgroundNotificationResult | null>(null)
  const lastNotificationTimeRef = useRef<number>(0)
  const preppedMeetingIdsRef = useRef<Set<string>>(loadPreppedMeetingIds())
  const processingLockRef = useRef<boolean>(false)
  const channelsAttachedRef = useRef<boolean | null>(null)

  /**
   * Check if any messaging channels (WhatsApp, iMessage) are connected.
   * Cached for the session to avoid repeated API calls.
   */
  const hasChannelsAttached = useCallback(async (): Promise<boolean> => {
    if (channelsAttachedRef.current !== null) return channelsAttachedRef.current

    try {
      const [waStatus, imStatus] = await Promise.all([
        getWhatsAppStatus().catch(() => null),
        getIMessageStatus().catch(() => null),
      ])

      const attached =
        (waStatus?.enabled && waStatus?.linked) ||
        (imStatus?.enabled && imStatus?.configured) ||
        false
      channelsAttachedRef.current = attached
      return attached
    } catch {
      return false
    }
  }, [])

  /**
   * Check if we can send a notification given the priority and daily limits.
   * Uses adaptive throttling: high-priority notifications can fire more frequently.
   */
  const canSendNotification = useCallback(
    async (priority: string): Promise<boolean> => {
      // All proactive notifications require proactive mode to be enabled
      const isProactive = localStorage.getItem('moltbot_proactive_mode') === 'true'
      if (!isProactive) return false

      const enabled = await getBackgroundNotificationsEnabled()
      if (!enabled) return false

      const notificationsEnabled = await arePushNotificationsOSEnabledAndWantedByUser()
      if (!notificationsEnabled) return false

      const withChannels = await hasChannelsAttached()

      // Check throttle based on priority — use lower throttles when channels are attached
      const now = Date.now()
      const minutesSinceLast = (now - lastNotificationTimeRef.current) / (1000 * 60)
      const throttleTable = withChannels ? THROTTLE_MINUTES_WITH_CHANNELS : THROTTLE_MINUTES
      const minMinutes =
        throttleTable[priority as keyof typeof throttleTable] || throttleTable.medium
      if (minutesSinceLast < minMinutes) return false

      // Check daily limit — higher cap when channels are attached
      const maxDaily = withChannels ? MAX_DAILY_NOTIFICATIONS_WITH_CHANNELS : MAX_DAILY_NOTIFICATIONS
      const today = dayjs().format('YYYY-MM-DD')
      const storedDate = await KNLocalStorage.getItem(KN_DAILY_NOTIFICATION_DATE)
      let dailyCount = 0
      if (storedDate === today) {
        dailyCount = (await KNLocalStorage.getItem(KN_DAILY_NOTIFICATION_COUNT)) || 0
      }
      if (dailyCount >= maxDaily) return false

      return true
    },
    [hasChannelsAttached],
  )

  /**
   * Record that a notification was sent. Updates throttle timer and daily count.
   */
  const recordNotification = useCallback(async (type: string) => {
    lastNotificationTimeRef.current = Date.now()

    const today = dayjs().format('YYYY-MM-DD')
    const storedDate = await KNLocalStorage.getItem(KN_DAILY_NOTIFICATION_DATE)
    let dailyCount = 0
    if (storedDate === today) {
      dailyCount = (await KNLocalStorage.getItem(KN_DAILY_NOTIFICATION_COUNT)) || 0
    }
    await KNLocalStorage.setItem(KN_DAILY_NOTIFICATION_DATE, today)
    await KNLocalStorage.setItem(KN_DAILY_NOTIFICATION_COUNT, dailyCount + 1)
    await setBackgroundNotificationsLastRun(new Date().toISOString())

    KNAnalytics.trackEvent('backgroundNotification', {
      type,
      timestamp: dayjs().format('MM/DD/YYYY HH:mm:ss'),
    })
  }, [])

  /**
   * Parse LLM JSON response, handling markdown code fences.
   */
  const parseLLMResponse = useCallback(
    (response: string): BackgroundNotificationResult | null => {
      try {
        let cleaned = response.trim()
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.slice(7)
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned.slice(3)
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.slice(0, -3)
        }
        cleaned = cleaned.trim()

        return JSON.parse(cleaned) as BackgroundNotificationResult
      } catch (err) {
        console.error('Failed to parse background notification LLM response:', err)
        return null
      }
    },
    [],
  )

  /**
   * Push a notification to connected messaging channels (WhatsApp, iMessage).
   * Runs in the background — failures are logged but never block the notification flow.
   *
   * When fullAnalysis is provided, sends a richer message to channels with the
   * full briefing content (stripped of markdown links for channel readability).
   */
  const pushToChannels = useCallback(
    async (title: string, body: string, fullAnalysis?: string, suggestedAction?: string) => {
      let text: string

      if (fullAnalysis) {
        // For channels: send the full briefing, not just the short notification
        // Strip knapsack:// deep links (not clickable outside the app) but keep the label
        const cleanedAnalysis = fullAnalysis
          .replace(/\[([^\]]+)\]\(knapsack:\/\/prompt\/[^)]+\)/g, '$1')
          .trim()

        text = `${title}\n\n${cleanedAnalysis}`

        // Append the suggested action as plain text if available
        if (suggestedAction) {
          text += `\n\n💡 Want me to help? Just reply: "${suggestedAction}"`
        }
      } else {
        text = `${title}\n\n${body}`
      }

      try {
        const [waStatus, imStatus] = await Promise.all([
          getWhatsAppStatus().catch(() => null),
          getIMessageStatus().catch(() => null),
        ])

        const sends: Promise<unknown>[] = []

        // WhatsApp: send to the linked account's own number (self-chat)
        if (waStatus?.enabled && waStatus?.linked && waStatus?.account) {
          sends.push(
            sendChannelMessage('whatsapp', waStatus.account, text).catch(err =>
              console.warn('[notifications] WhatsApp send failed:', err),
            ),
          )
        }

        // iMessage: send to the user's own email
        if (imStatus?.enabled && imStatus?.configured && userEmail) {
          sends.push(
            sendChannelMessage('imessage', userEmail, text).catch(err =>
              console.warn('[notifications] iMessage send failed:', err),
            ),
          )
        }

        if (sends.length > 0) {
          await Promise.all(sends)
        }
      } catch (err) {
        // Never let channel sends block the notification flow
        console.warn('[notifications] pushToChannels error:', err)
      }
    },
    [userEmail],
  )

  /**
   * Gather comprehensive context from all data sources (emails, calendar, meetings).
   * Used for morning briefing which needs a full picture.
   */
  const gatherFullContext = useCallback(async (): Promise<string> => {
    const contextParts: string[] = []

    // Fetch recent emails (last 2 days, up to 15), excluding emails sent by the user
    try {
      const allEmails = await dataFetcher.getRecentGmailMessages(2, 15)
      const emails = allEmails?.filter(
        e => !userEmail || !e.sender?.toLowerCase().includes(userEmail.toLowerCase()),
      )
      if (emails?.length) {
        contextParts.push('## Recent Emails\n')
        for (const email of emails.slice(0, 10)) {
          const dateStr = new Date(email.date * 1000).toLocaleString()
          const preview = (email.summary || email.body || '').slice(0, 200)
          contextParts.push(
            `- **From:** ${email.sender} | **Subject:** ${email.subject} | **Date:** ${dateStr}\n  ${preview}\n`,
          )
        }
      }
    } catch (err) {
      console.warn('Failed to fetch emails for background insight:', err)
    }

    // Fetch today's full calendar
    try {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const todayEvents = await getCalendarEvents(
        Math.floor(todayStart.getTime() / 1000),
        Math.floor(todayEnd.getTime() / 1000),
      )

      if (todayEvents?.length) {
        contextParts.push('\n## Today\'s Calendar\n')
        for (const event of todayEvents) {
          const startTime = event.start
            ? dayjs(event.start * 1000).format('h:mm A')
            : 'TBD'
          const endTime = event.end
            ? dayjs(event.end * 1000).format('h:mm A')
            : 'TBD'
          const attendees = event.attendees_json
            ? JSON.parse(event.attendees_json)
                .filter((a: any) => {
                  const email = a.email || a
                  return !userEmail || !email.toLowerCase().includes(userEmail.toLowerCase())
                })
                .map((a: any) => a.email || a)
                .join(', ')
            : 'N/A'
          contextParts.push(
            `- **${event.title || 'Untitled'}** (${startTime} - ${endTime}) | Attendees: ${attendees}\n`,
          )
        }
      }
    } catch (err) {
      console.warn('Failed to fetch today calendar events:', err)
    }

    // Fetch upcoming meetings
    try {
      const upcomingMeetings = await dataFetcher.getRecentCalendarEvents()
      if (upcomingMeetings?.length) {
        contextParts.push('\n## Upcoming Meetings\n')
        for (const meeting of upcomingMeetings) {
          const startStr = dayjs(meeting.start).format('ddd MMM D, h:mm A')
          const participants = meeting.participants?.join(', ') || 'N/A'
          contextParts.push(
            `- **${meeting.title}** at ${startStr} | Participants: ${participants}\n`,
          )
        }
      }
    } catch (err) {
      console.warn('Failed to fetch upcoming meetings for background insight:', err)
    }

    if (contextParts.length === 0) return ''
    return contextParts.join('\n')
  }, [dataFetcher, userEmail])

  /**
   * Gather email-focused context for email alert notifications.
   * Only includes recent emails (last 6 hours) to focus on what just arrived.
   */
  const gatherEmailContext = useCallback(
    async (): Promise<{ context: string; emailCount: number }> => {
      try {
        const emails = await dataFetcher.getRecentGmailMessages(1, 20)
        if (!emails?.length) return { context: '', emailCount: 0 }

        // Filter to recent emails (last 6 hours) and exclude emails sent by the user
        const sixHoursAgo = Date.now() / 1000 - 6 * 3600
        const recentEmails = emails.filter(
          e => e.date > sixHoursAgo && (!userEmail || !e.sender?.toLowerCase().includes(userEmail.toLowerCase())),
        )
        if (!recentEmails.length) return { context: '', emailCount: 0 }

        const contextParts: string[] = ['## Recent Emails (Last 6 Hours)\n']
        for (const email of recentEmails.slice(0, 10)) {
          const dateStr = new Date(email.date * 1000).toLocaleString()
          const preview = (email.summary || email.body || '').slice(0, 300)
          contextParts.push(
            `- **From:** ${email.sender} | **Subject:** ${email.subject} | **Date:** ${dateStr}\n  ${preview}\n`,
          )
        }

        return { context: contextParts.join('\n'), emailCount: recentEmails.length }
      } catch (err) {
        console.warn('Failed to gather email context:', err)
        return { context: '', emailCount: 0 }
      }
    },
    [dataFetcher, userEmail],
  )

  /**
   * Gather context for a specific meeting prep notification.
   * Includes meeting details and recent emails with attendees.
   */
  const gatherMeetingPrepContext = useCallback(
    async (meeting: {
      title: string
      start: Date
      participants?: { name: string; email: string }[]
      description?: string
    }): Promise<string> => {
      const contextParts: string[] = []

      const startTime = dayjs(meeting.start).format('h:mm A')
      const otherParticipants = meeting.participants?.filter(
        p => !userEmail || !p.email?.toLowerCase().includes(userEmail.toLowerCase()),
      )
      const participantNames =
        otherParticipants?.map(p => p.name || p.email).join(', ') || 'N/A'
      contextParts.push('## Upcoming Meeting\n')
      contextParts.push(`- **Title:** ${meeting.title}`)
      contextParts.push(`- **Time:** ${startTime}`)
      contextParts.push(`- **Participants:** ${participantNames}`)
      if (meeting.description) {
        contextParts.push(`- **Description:** ${meeting.description}`)
      }

      // Fetch recent emails from meeting participants for context
      if (meeting.participants?.length) {
        try {
          const addresses = meeting.participants.map(p => p.email)
          const participantEmails =
            await dataFetcher.getGmailSearchResultsByAddresses(addresses)
          if (participantEmails?.length) {
            contextParts.push('\n## Recent Emails with Attendees\n')
            for (const email of participantEmails.slice(0, 5)) {
              const dateStr = new Date(email.date * 1000).toLocaleString()
              const preview = (email.summary || email.body || '').slice(0, 200)
              contextParts.push(
                `- **From:** ${email.sender} | **Subject:** ${email.subject} | **Date:** ${dateStr}\n  ${preview}\n`,
              )
            }
          }
        } catch (err) {
          console.warn('Failed to fetch participant emails:', err)
        }
      }

      return contextParts.join('\n')
    },
    [dataFetcher, userEmail],
  )

  /**
   * Internal helper: generate an LLM-based notification and show it.
   * Handles the full flow: LLM call → parse → show notification window.
   */
  const generateAndShowNotification = useCallback(
    async (
      context: string,
      promptTemplate: string,
      notificationType: string,
      buttonHandler: string,
      buttonText: string,
    ) => {
      if (processingLockRef.current) return
      processingLockRef.current = true
      setIsProcessing(true)

      try {
        const fullPrompt =
          context +
          '\n\n' +
          promptTemplate
            .split('{userName}').join(userName)
            .split('{userEmail}').join(userEmail)

        addToLLMQueue({
          prompt: fullPrompt,
          documents: [],
          messageStreamCallback: () => {},
          messageFinishCallback: async (response: string) => {
            processingLockRef.current = false
            setIsProcessing(false)
            const parsed = parseLLMResponse(response)
            if (!parsed) return response

            // For email alerts, respect the shouldNotify flag from the LLM
            if (notificationType === 'email_alert' && parsed.shouldNotify === false) {
              return response
            }

            pendingInsightRef.current = parsed
            await recordNotification(notificationType)

            const primaryText = parsed.suggestedActionShort || buttonText
            await openNotificationWindow(
              undefined,
              [
                { buttonText: primaryText, buttonHandler: 'suggested_action_notification_handler' },
                { buttonText: 'View Briefing', buttonHandler: buttonHandler },
                { buttonText: 'Dismiss', buttonHandler: 'dismiss_notification_handler' },
              ],
              parsed.notificationTitle,
              parsed.notificationBody,
            )

            // Push full briefing to connected messaging channels (non-blocking)
            pushToChannels(
              parsed.notificationTitle,
              parsed.notificationBody,
              parsed.fullAnalysis,
              parsed.suggestedActionPrompt,
            )

            return response
          },
          errorCallback: () => {
            processingLockRef.current = false
            setIsProcessing(false)
            console.error(`Failed to generate ${notificationType} notification`)
          },
        })
      } catch (error) {
        processingLockRef.current = false
        setIsProcessing(false)
        logError(new Error(`Error generating ${notificationType}`), {
          additionalInfo: `Error in generateAndShowNotification for ${notificationType}`,
          error: String(error),
        })
      }
    },
    [
      userName,
      userEmail,
      addToLLMQueue,
      openNotificationWindow,
      parseLLMResponse,
      recordNotification,
      pushToChannels,
    ],
  )

  /**
   * EVENT TRIGGER: Email sync completed.
   * Called when the `finish_fetch_email` event fires with new emails.
   * Checks if any recent emails warrant a notification.
   */
  const handleEmailSyncComplete = useCallback(async (force = false) => {
    if (!userEmail || processingLockRef.current) return

    if (!force) {
      const canSend = await canSendNotification('medium')
      if (!canSend) return
    }

    const { context, emailCount } = await gatherEmailContext()
    if (!context || emailCount === 0) return

    await generateAndShowNotification(
      context,
      EMAIL_ALERT_PROMPT,
      'email_alert',
      'background_insight_notification_handler',
      'View Details',
    )
  }, [userEmail, canSendNotification, gatherEmailContext, generateAndShowNotification])

  /**
   * EVENT TRIGGER: Calendar sync completed.
   * Called when the `finish_fetch_calendar` event fires.
   * Checks for upcoming meetings that need preparation.
   */
  const handleCalendarSyncComplete = useCallback(async (force = false) => {
    if (!userEmail || processingLockRef.current) return

    try {
      const upcomingMeetings = await dataFetcher.getRecentCalendarEvents()
      if (!upcomingMeetings?.length) return

      const now = new Date()

      // Filter out any events that have already started (safety guard for stale data)
      const futureOnly = upcomingMeetings.filter(
        m => new Date(m.start) > now,
      )
      if (!futureOnly.length) return

      let meetingNeedingPrep
      if (force) {
        // When forced, pick the next upcoming future meeting regardless of time window
        const meetingKey = futureOnly[0].eventId || String(futureOnly[0].id)
        const notAlreadyPrepped = !preppedMeetingIdsRef.current.has(meetingKey)
        meetingNeedingPrep = notAlreadyPrepped ? futureOnly[0] : undefined
      } else {
        const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000)
        const fifteenMinFromNow = new Date(now.getTime() + 15 * 60 * 1000)

        // Find meetings starting in the next 15-30 minutes with multiple attendees
        meetingNeedingPrep = futureOnly.find(meeting => {
          const meetingStart = new Date(meeting.start)
          const hasMultipleAttendees = (meeting.participants?.length || 0) >= 2
          const isInWindow =
            meetingStart >= fifteenMinFromNow && meetingStart <= thirtyMinFromNow
          const meetingKey = meeting.eventId || String(meeting.id)
          const notAlreadyPrepped = !preppedMeetingIdsRef.current.has(meetingKey)
          return hasMultipleAttendees && isInWindow && notAlreadyPrepped
        })
      }

      if (!meetingNeedingPrep) return

      if (!force) {
        const canSend = await canSendNotification('high')
        if (!canSend) return
      }

      // Mark meeting as prepped to avoid duplicate notifications
      const meetingKey =
        meetingNeedingPrep.eventId || String(meetingNeedingPrep.id)
      preppedMeetingIdsRef.current.add(meetingKey)
      persistPreppedMeetingId(meetingKey)

      const context = await gatherMeetingPrepContext(meetingNeedingPrep)

      await generateAndShowNotification(
        context,
        PRE_MEETING_PREP_PROMPT,
        'pre_meeting_prep',
        'background_insight_notification_handler',
        'View Prep',
      )
    } catch (error) {
      logError(new Error('Error in handleCalendarSyncComplete'), {
        additionalInfo: 'Error checking for meeting prep notifications',
        error: String(error),
      })
    }
  }, [
    userEmail,
    dataFetcher,
    canSendNotification,
    gatherMeetingPrepContext,
    generateAndShowNotification,
  ])

  /**
   * TIMER TRIGGER: Morning briefing check.
   * Called every minute from the main polling loop.
   * Triggers once daily, adaptively timed:
   *   - 30 minutes before the first meeting of the day, OR
   *   - At 9:00 AM as a fallback if no meetings
   * Only active during 7:00 AM - 11:00 AM.
   */
  const checkMorningBriefing = useCallback(
    async (now: Date, force = false) => {
      if (!userEmail || processingLockRef.current) return

      if (!force) {
        // Check if already sent today
        const today = dayjs(now).format('YYYY-MM-DD')
        const morningBriefingDate = await KNLocalStorage.getItem(KN_MORNING_BRIEFING_DATE)
        if (morningBriefingDate === today) return

        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        // Only check during morning hours (7 AM - 11 AM)
        if (currentHour < 7 || currentHour > 11) return

        let shouldTrigger = false

        try {
          // Look at today's calendar to find the first meeting
          const todayStart = new Date(now)
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date(now)
          todayEnd.setHours(23, 59, 59, 999)

          const todayEvents = await getCalendarEvents(
            Math.floor(todayStart.getTime() / 1000),
            Math.floor(todayEnd.getTime() / 1000),
          )

          if (todayEvents?.length) {
            // Find the first future meeting today
            const nowTimestamp = Math.floor(now.getTime() / 1000)
            const futureMeetings = (todayEvents as CalendarEvents[])
              .filter((e: CalendarEvents) => e.start && e.start > nowTimestamp)
              .sort(
                (a: CalendarEvents, b: CalendarEvents) => (a.start || 0) - (b.start || 0),
              )

            if (futureMeetings.length > 0) {
              const firstMeetingStart = futureMeetings[0].start! * 1000
              const minutesUntilFirstMeeting =
                (firstMeetingStart - now.getTime()) / (1000 * 60)

              // Trigger 25-45 minutes before first meeting (wider window to avoid misses)
              if (minutesUntilFirstMeeting >= 25 && minutesUntilFirstMeeting <= 45) {
                shouldTrigger = true
              }
            }
          }

          // Fallback: if it's between 8:55-9:05 AM and no meeting-based trigger happened
          // Wider window so we don't miss the exact 9:00 minute
          if (!shouldTrigger && currentHour === 9 && currentMinute <= 5) {
            shouldTrigger = true
          }
          // Second fallback: if it's past 9 AM and still no briefing, trigger by 10 AM
          if (!shouldTrigger && currentHour === 10 && currentMinute === 0) {
            shouldTrigger = true
          }
        } catch (err) {
          // If calendar check fails, fall back to 9 AM window
          if (currentHour === 9 && currentMinute <= 5) {
            shouldTrigger = true
          }
        }

        if (!shouldTrigger) return

        const canSend = await canSendNotification('medium')
        if (!canSend) return

        // Mark morning briefing as sent for today
        await KNLocalStorage.setItem(KN_MORNING_BRIEFING_DATE, today)
      }

      const context = await gatherFullContext()
      if (!context) return

      await generateAndShowNotification(
        context,
        MORNING_BRIEFING_PROMPT,
        'morning_briefing',
        'background_insight_notification_handler',
        'View Briefing',
      )
    },
    [userEmail, canSendNotification, gatherFullContext, generateAndShowNotification],
  )

  /**
   * HEARTBEAT TRIGGER: Proactive check-in.
   * Called from the heartbeat loop when channels are attached.
   * Offers to help with whatever's on the user's plate — drafting replies,
   * prepping for meetings, triaging emails, etc.
   * Only fires when channels are connected (user explicitly opted into chatty mode).
   */
  const checkProactiveCheckin = useCallback(
    async (now: Date, force = false) => {
      if (!userEmail || processingLockRef.current) return

      if (!force) {
        // Only fire proactive check-ins when channels are attached
        const withChannels = await hasChannelsAttached()
        if (!withChannels) return

        const currentHour = now.getHours()
        // Only during working hours (8 AM - 7 PM)
        if (currentHour < 8 || currentHour >= 19) return

        // Don't fire if a check-in was sent recently (at least 2 hours between check-ins)
        const lastCheckin = await KNLocalStorage.getItem(KN_LAST_PROACTIVE_CHECKIN)
        if (lastCheckin) {
          const hoursSinceLast = (now.getTime() - new Date(lastCheckin).getTime()) / (1000 * 60 * 60)
          if (hoursSinceLast < 2) return
        }

        const canSend = await canSendNotification('medium')
        if (!canSend) return
      }

      await KNLocalStorage.setItem(KN_LAST_PROACTIVE_CHECKIN, now.toISOString())

      const context = await gatherFullContext()
      if (!context) return

      await generateAndShowNotification(
        context,
        PROACTIVE_CHECKIN_PROMPT,
        'proactive_checkin',
        'background_insight_notification_handler',
        'Take Action',
      )
    },
    [userEmail, hasChannelsAttached, canSendNotification, gatherFullContext, generateAndShowNotification],
  )

  /**
   * EVENT TRIGGER: Post-meeting follow-up.
   * Called when the `notes_synthesized` event fires after a recording stops.
   * Fetches the transcript and generates follow-up suggestions.
   */
  const handlePostMeetingFollowup = useCallback(
    async (meetingTitle: string, threadId: number) => {
      if (!userEmail) return

      const enabled = await getPostMeetingFollowupEnabled()
      if (!enabled) return

      const notificationsEnabled = await arePushNotificationsOSEnabledAndWantedByUser()
      if (!notificationsEnabled) return

      try {
        const transcript = await getTranscript(threadId)
        if (!transcript?.content || transcript.content.trim().length < 100) {
          return
        }

        const contextPrefix = `## Meeting: ${meetingTitle}\n\n### Transcript\n\n${transcript.content}\n\n`

        const prompt =
          contextPrefix +
          POST_MEETING_FOLLOWUP_PROMPT.split('{userName}').join(userName).split('{userEmail}').join(
            userEmail,
          )

        KNAnalytics.trackEvent('postMeetingFollowupGeneration', {
          meetingTitle,
          timestamp: dayjs().format('MM/DD/YYYY HH:mm:ss'),
        })

        addToLLMQueue({
          prompt,
          documents: [],
          messageStreamCallback: () => {},
          messageFinishCallback: async (response: string) => {
            const parsed = parseLLMResponse(response)

            if (parsed) {
              pendingFollowupRef.current = parsed
              await recordNotification('post_meeting_followup')

              const title = parsed.notificationTitle || `Follow up: ${meetingTitle}`
              const body = parsed.notificationBody || 'Action items and follow-ups ready'
              const primaryText = parsed.suggestedActionShort || 'View Follow-ups'

              await openNotificationWindow(
                undefined,
                [
                  {
                    buttonText: primaryText,
                    buttonHandler: 'suggested_followup_action_notification_handler',
                  },
                  {
                    buttonText: 'View Briefing',
                    buttonHandler: 'post_meeting_followup_notification_handler',
                  },
                  {
                    buttonText: 'Dismiss',
                    buttonHandler: 'dismiss_notification_handler',
                  },
                ],
                title,
                body,
              )

              // Push full follow-up analysis to connected messaging channels (non-blocking)
              pushToChannels(
                title,
                body,
                parsed.fullAnalysis,
                parsed.suggestedActionPrompt,
              )
            }
            return response
          },
          errorCallback: () => {
            console.error('Failed to generate post-meeting follow-up')
          },
        })
      } catch (error) {
        logError(new Error('Error generating post-meeting follow-up'), {
          additionalInfo: 'Error in handlePostMeetingFollowup',
          error: String(error),
        })
      }
    },
    [
      userEmail,
      userName,
      addToLLMQueue,
      openNotificationWindow,
      parseLLMResponse,
      recordNotification,
      pushToChannels,
    ],
  )

  /**
   * Create a feed item with the full analysis when a background notification
   * is clicked. Returns the feed item ID for navigation.
   */
  const createInsightFeedItem = useCallback(async (): Promise<number | undefined> => {
    const insight = pendingInsightRef.current
    if (!insight) return undefined

    try {
      const now = Date.now()
      const feedItemData = await insertFeedItemAPI(
        now,
        insight.notificationTitle || 'Knapsack Insight',
      )

      if (feedItemData?.id) {
        const thread = await createThread(
          now,
          false,
          feedItemData.id,
          'Knapsack Insight',
          insight.notificationTitle,
          ThreadType.CHAT,
        )

        if (thread?.id) {
          await insertSystemMessage(insight.fullAnalysis, now, false, thread.id)
        }

        pendingInsightRef.current = null
        return feedItemData.id
      }
    } catch (error) {
      logError(new Error('Error creating insight feed item'), {
        additionalInfo: 'Error in createInsightFeedItem',
        error: String(error),
      })
    }
    return undefined
  }, [])

  /**
   * Create a feed item with the full follow-up analysis when a post-meeting
   * notification is clicked. Returns the feed item ID for navigation.
   */
  const createFollowupFeedItem = useCallback(async (): Promise<number | undefined> => {
    const followup = pendingFollowupRef.current
    if (!followup) return undefined

    try {
      const now = Date.now()
      const title = followup.meetingTitle
        ? `Follow-up: ${followup.meetingTitle}`
        : 'Meeting Follow-up'

      const feedItemData = await insertFeedItemAPI(now, title)

      if (feedItemData?.id) {
        const thread = await createThread(
          now,
          false,
          feedItemData.id,
          title,
          followup.notificationTitle,
          ThreadType.CHAT,
        )

        if (thread?.id) {
          await insertSystemMessage(followup.fullAnalysis, now, false, thread.id)
        }

        pendingFollowupRef.current = null
        return feedItemData.id
      }
    } catch (error) {
      logError(new Error('Error creating follow-up feed item'), {
        additionalInfo: 'Error in createFollowupFeedItem',
        error: String(error),
      })
    }
    return undefined
  }, [])

  /**
   * Generate a morning briefing, create a feed item, and return both the ID
   * and full analysis text so the caller can display it in the chat window.
   */
  const triggerBriefingFeedItem = useCallback(
    async (): Promise<{ feedItemId?: number; fullAnalysis?: string }> => {
      if (!userEmail) return {}

      const context = await gatherFullContext()
      if (!context) return {}

      return new Promise<{ feedItemId?: number; fullAnalysis?: string }>(resolve => {
        const fullPrompt =
          context +
          '\n\n' +
          MORNING_BRIEFING_PROMPT.split('{userName}').join(userName).split('{userEmail}').join(
            userEmail,
          )

        addToLLMQueue({
          prompt: fullPrompt,
          documents: [],
          messageStreamCallback: () => {},
          messageFinishCallback: async (response: string) => {
            const parsed = parseLLMResponse(response)
            if (!parsed) {
              resolve({})
              return response
            }

            // Store so createInsightFeedItem can pick it up
            pendingInsightRef.current = parsed
            const feedItemId = await createInsightFeedItem()
            resolve({ feedItemId, fullAnalysis: parsed.fullAnalysis })

            // Push full briefing to connected channels (non-blocking)
            pushToChannels(
              parsed.notificationTitle,
              parsed.notificationBody,
              parsed.fullAnalysis,
              parsed.suggestedActionPrompt,
            )

            return response
          },
          errorCallback: () => {
            resolve({})
          },
        })
      })
    },
    [
      userEmail,
      userName,
      gatherFullContext,
      addToLLMQueue,
      parseLLMResponse,
      createInsightFeedItem,
      pushToChannels,
    ],
  )

  /**
   * Get the full analysis text from the most recent pending insight notification.
   * Returns null if no insight is pending.
   */
  const getPendingInsightText = useCallback((): string | null => {
    return pendingInsightRef.current?.fullAnalysis ?? null
  }, [])

  /**
   * Get the full analysis text from the most recent pending follow-up notification.
   * Returns null if no follow-up is pending.
   */
  const getPendingFollowupText = useCallback((): string | null => {
    return pendingFollowupRef.current?.fullAnalysis ?? null
  }, [])

  /**
   * Get the suggested action prompt from the most recent pending insight notification.
   * Returns null if no insight or no suggested action is pending.
   */
  const getPendingInsightSuggestedAction = useCallback((): string | null => {
    return pendingInsightRef.current?.suggestedActionPrompt ?? null
  }, [])

  /**
   * Get the suggested action prompt from the most recent pending follow-up notification.
   * Returns null if no follow-up or no suggested action is pending.
   */
  const getPendingFollowupSuggestedAction = useCallback((): string | null => {
    return pendingFollowupRef.current?.suggestedActionPrompt ?? null
  }, [])

  return {
    checkMorningBriefing,
    checkProactiveCheckin,
    handleEmailSyncComplete,
    handleCalendarSyncComplete,
    handlePostMeetingFollowup,
    createInsightFeedItem,
    createFollowupFeedItem,
    triggerBriefingFeedItem,
    getPendingInsightText,
    getPendingFollowupText,
    getPendingInsightSuggestedAction,
    getPendingFollowupSuggestedAction,
    isGeneratingInsight: isProcessing,
  }
}
