import { useCallback, useMemo, useRef, useState } from 'react'

import dayjs from 'dayjs'
import { insertFeedItemAPI } from 'src/api/feed_items'
import { insertSystemMessage } from 'src/api/automations'
import { getTranscript } from 'src/api/transcripts'
import { createThread, ThreadType } from 'src/api/threads'
import { BACKGROUND_INSIGHTS_PROMPT, POST_MEETING_FOLLOWUP_PROMPT } from 'src/prompts'
import DataFetcher, { getCalendarEvents } from 'src/utils/data_fetch'
import { logError } from 'src/utils/errorHandling'
import {
  getBackgroundNotificationsEnabled,
  getBackgroundNotificationHours,
  getBackgroundNotificationsLastRun,
  setBackgroundNotificationsLastRun,
  getPostMeetingFollowupEnabled,
} from 'src/utils/settings'
import { arePushNotificationsOSEnabledAndWantedByUser } from 'src/utils/permissions/notification'
import { ButtonConfig } from 'src/components/molecules/MeetingNotification'
import { LLMParams } from 'src/App'
import KNAnalytics from 'src/utils/KNAnalytics'

type BackgroundNotificationResult = {
  notificationTitle: string
  notificationBody: string
  fullAnalysis: string
  category?: string
  priority?: string
  actionItemCount?: number
  meetingTitle?: string
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

// Minimum hours between background insight runs (to prevent spamming)
const MIN_HOURS_BETWEEN_RUNS = 4

export function useBackgroundNotifications({
  userEmail,
  userName,
  openNotificationWindow,
  addToLLMQueue,
}: UseBackgroundNotificationsProps) {
  const dataFetcher = useMemo(() => new DataFetcher(), [])
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const pendingInsightRef = useRef<BackgroundNotificationResult | null>(null)
  const pendingFollowupRef = useRef<BackgroundNotificationResult | null>(null)

  /**
   * Gather context from all data sources for background insights.
   * Collects recent emails, upcoming calendar events, and today's full schedule.
   */
  const gatherInsightContext = useCallback(async (): Promise<string> => {
    const contextParts: string[] = []

    // Fetch recent emails (last 2 days, up to 15)
    try {
      const emails = await dataFetcher.getRecentGmailMessages(2, 15)
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

    // Fetch today's full calendar events for a comprehensive view
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

    // Fetch upcoming meetings (next 3)
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

    if (contextParts.length === 0) {
      return ''
    }

    return contextParts.join('\n')
  }, [dataFetcher])

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
   * Check if it's time to show a background insight notification.
   * Triggers at configured hours (default 9 AM and 2 PM), with a minimum gap
   * of MIN_HOURS_BETWEEN_RUNS to prevent duplicate notifications.
   */
  const shouldShowBackgroundInsight = useCallback(async (now: Date): Promise<boolean> => {
    const enabled = await getBackgroundNotificationsEnabled()
    if (!enabled) return false

    const notificationsEnabled = await arePushNotificationsOSEnabledAndWantedByUser()
    if (!notificationsEnabled) return false

    const scheduledHours = await getBackgroundNotificationHours()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Only trigger at the exact scheduled hour (within first minute of the hour)
    if (!scheduledHours.includes(currentHour) || currentMinute !== 0) {
      return false
    }

    // Check last run to prevent duplicates
    const lastRunStr = await getBackgroundNotificationsLastRun()
    if (lastRunStr) {
      const lastRun = new Date(lastRunStr)
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastRun < MIN_HOURS_BETWEEN_RUNS) {
        return false
      }
    }

    return true
  }, [])

  /**
   * Generate and show a background insight notification.
   * Called every minute from the main polling loop - only triggers at scheduled hours.
   */
  const handleBackgroundInsightNotification = useCallback(
    async (now: Date) => {
      if (isGeneratingInsight || !userEmail) return

      const shouldShow = await shouldShowBackgroundInsight(now)
      if (!shouldShow) return

      setIsGeneratingInsight(true)

      try {
        // Record the run time immediately to prevent duplicate triggers
        await setBackgroundNotificationsLastRun(now.toISOString())

        // Gather context from data sources
        const context = await gatherInsightContext()
        if (!context) {
          setIsGeneratingInsight(false)
          return
        }

        // Build the prompt with context
        const prompt =
          context +
          '\n\n' +
          BACKGROUND_INSIGHTS_PROMPT.replace('{userName}', userName).replace(
            '{userEmail}',
            userEmail,
          )

        KNAnalytics.trackEvent('backgroundInsightGeneration', {
          timestamp: dayjs(now).format('MM/DD/YYYY HH:mm:ss'),
        })

        // Use LLM to generate the insight
        addToLLMQueue({
          prompt,
          documents: [],
          messageStreamCallback: () => {},
          messageFinishCallback: async (response: string) => {
            setIsGeneratingInsight(false)
            const parsed = parseLLMResponse(response)

            if (parsed) {
              pendingInsightRef.current = parsed

              // Show the notification window
              await openNotificationWindow(
                undefined,
                [
                  {
                    buttonText: 'View Details',
                    buttonHandler: 'background_insight_notification_handler',
                  },
                  {
                    buttonText: 'Dismiss',
                    buttonHandler: 'dismiss_notification_handler',
                  },
                ],
                parsed.notificationTitle,
                parsed.notificationBody,
              )
            }
            return response
          },
          errorCallback: () => {
            setIsGeneratingInsight(false)
            console.error('Failed to generate background insight')
          },
        })
      } catch (error) {
        setIsGeneratingInsight(false)
        logError(new Error('Error generating background insight'), {
          additionalInfo: 'Error in handleBackgroundInsightNotification',
          error: String(error),
        })
      }
    },
    [
      isGeneratingInsight,
      userEmail,
      userName,
      shouldShowBackgroundInsight,
      gatherInsightContext,
      addToLLMQueue,
      openNotificationWindow,
      parseLLMResponse,
    ],
  )

  /**
   * Handle the post-meeting follow-up notification after a recording stops.
   * Fetches the transcript for the given thread and generates follow-up suggestions.
   */
  const handlePostMeetingFollowup = useCallback(
    async (meetingTitle: string, threadId: number) => {
      if (!userEmail) return

      const enabled = await getPostMeetingFollowupEnabled()
      if (!enabled) return

      const notificationsEnabled = await arePushNotificationsOSEnabledAndWantedByUser()
      if (!notificationsEnabled) return

      try {
        // Fetch the transcript for the meeting
        const transcript = await getTranscript(threadId)
        if (!transcript?.content || transcript.content.trim().length < 100) {
          // Transcript too short to generate meaningful follow-ups
          return
        }

        const contextPrefix = `## Meeting: ${meetingTitle}\n\n### Transcript\n\n${transcript.content}\n\n`

        const prompt =
          contextPrefix +
          POST_MEETING_FOLLOWUP_PROMPT.replace('{userName}', userName).replace(
            '{userEmail}',
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

              await openNotificationWindow(
                undefined,
                [
                  {
                    buttonText: 'View Follow-ups',
                    buttonHandler: 'post_meeting_followup_notification_handler',
                  },
                  {
                    buttonText: 'Dismiss',
                    buttonHandler: 'dismiss_notification_handler',
                  },
                ],
                parsed.notificationTitle || `Follow up: ${meetingTitle}`,
                parsed.notificationBody || 'Action items and follow-ups ready',
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
    [userEmail, userName, addToLLMQueue, openNotificationWindow, parseLLMResponse],
  )

  /**
   * Create a feed item with the full analysis when a background insight
   * notification is clicked. Returns the feed item ID for navigation.
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

  return {
    handleBackgroundInsightNotification,
    handlePostMeetingFollowup,
    createInsightFeedItem,
    createFollowupFeedItem,
    isGeneratingInsight,
  }
}
