import { useCallback, useEffect, useMemo, useState } from 'react'

import dayjs from 'dayjs'
import {
  deleteAutomationAPI,
  getAutomations,
  getAutomationStartStatusAPI,
  scheduleRuns,
  updateAutomationAPI,
} from 'src/api/automations'
import { ConnectionKeys, getAccessToken } from 'src/api/connections'
import { FeedItem } from 'src/api/feed_items'
import { CreateAutomationProps, LLMParams, WebSearchResponse } from 'src/App'
import { Automation, AutomationRun, AutomationTrigger } from 'src/automations/automation'
import { StepExecuteContext } from 'src/automations/steps/Base'
import { IFeed } from 'src/hooks/feed/useFeed'
import DataFetcher from 'src/utils/data_fetch'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { arePushNotificationsOSEnabledAndWantedByUser } from 'src/utils/permissions/notification'
import { getNotificationLeadTimeMin } from 'src/utils/settings'

import { ButtonConfig } from 'src/components/molecules/MeetingNotification'

import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

const checkAuth = async (userEmail: string) => {
  try {
    await getAccessToken(userEmail, ConnectionKeys.GOOGLE_PROFILE)
  } catch (error) {
    throw error
  }
}

type AutomationHelperFunctions = {
  submitWebSearch: (submittedUserPrompt: string) => Promise<WebSearchResponse | undefined>
  stopLLMExecution: () => Promise<void>
  handleError: (error: Error | string) => void
  addToLLMQueue: (item: LLMParams) => void
}

export type HandleAutomationCallArgs = {
  documents: number[]
  additionalDocuments: { title: string; content: string }[]
  userPrompt: string
  userPromptFacade?: string
  semanticSearchQuery?: string
  args?: {
    feedItem: FeedItem
    errorCallback: () => void
    sucessHandler: (
      feedItem: FeedItem,
      userEmail: string,
      userPrompt: string,
      botPrompt: string,
      documents: number[],
      userPromptFacade?: string,
    ) => void
  }
}

type UseAutomationProps = {
  userEmail: string
  feed?: IFeed
  automationHelperFunctions: AutomationHelperFunctions
}

enum NotificationTypes {
  MEETING_PREP = 'meeting-prep',
  MEETING_NOTES = 'meeting-notes',
}

type NotificationService = {
  sentIdentifiers: string[]
  type: NotificationTypes
  minutesToNotify: number
}

export interface IGoogleAuthControls {
  showGoogleAuthPopup: boolean
  setShowGoogleAuthPopup: (show: boolean) => void
  currentAutomation: string | undefined
  setCurrentAutomation: (automation: string | undefined) => void
  currentFeedItem: FeedItem | undefined
  setCurrentFeedItem: (feedItem: FeedItem | undefined) => void
}

export type HandleAutomationArgs = {
  automation: Automation
  trigger: AutomationTrigger
  run?: AutomationRun
  args?: {
    feedItem: FeedItem
    errorCallback: () => void
    sucessHandler: (
      feedItem: FeedItem,
      userEmail: string,
      userPrompt: string,
      botPrompt: string,
      documents: number[],
      userPromptFacade?: string,
    ) => void
  }
}

export function useAutomations({
  userEmail,
  automationHelperFunctions: { submitWebSearch, stopLLMExecution, handleError, addToLLMQueue },
}: UseAutomationProps) {
  const [automations, setAutomations] = useState<Record<number, Automation>>({})
  const [showGoogleAuthPopup, setShowGoogleAuthPopup] = useState(false)
  const [currentAutomation, setCurrentAutomation] = useState<string>()
  const [currentFeedItem, setCurrentFeedItem] = useState<FeedItem>()
  const [notificationServices, setNotificationServices] = useState<NotificationService[]>([
    { type: NotificationTypes.MEETING_PREP, sentIdentifiers: [], minutesToNotify: 10 },
    { type: NotificationTypes.MEETING_NOTES, sentIdentifiers: [], minutesToNotify: 1 },
  ])
  const [isNotificationWindowShowing, setIsNotificationWindowShowing] = useState(false)
  //const [nextMeeting, setNextMeeting] = useState<CalendarEvents | null>(null)

  const dataFetcher = useMemo(() => new DataFetcher(), [])

  const updateAutomationState = useCallback((automation: Automation) => {
    const automationUuid = automation.getUuid()
    setAutomations(prevState => ({
      ...prevState,
      [automationUuid]: automation,
    }))
  }, [])

  const syncAutomations = useCallback(async () => {
    try {
      const fetchedAutomations = await getAutomations()
      fetchedAutomations.forEach(updateAutomationState)
    } catch (err) {
      console.error(err)
      handleError('Error fetching automations')
    }
  }, [handleError, updateAutomationState])

  const handleAutomationError = useCallback(
    (error: Error) => {
      handleError(error)
      stopLLMExecution()
    },
    [handleError, stopLLMExecution],
  )

  const getIsAutomationReadyPolling = useCallback(async (attempts = 20) => {
    if (await getAutomationStartStatusAPI()) {
      return
    }
    if (attempts <= 0) {
      throw new Error(
        'There is not enough information to run this automation. Make sure that required services are connected',
      )
    }

    await new Promise((acc, rej) =>
      setTimeout(() => {
        getIsAutomationReadyPolling(attempts - 1)
          .then(acc)
          .catch(rej)
      }, 1000),
    )
  }, [])

  const handleChatbotAutomationRun = useCallback(
    async ({
      documents,
      additionalDocuments,
      userPrompt,
      userPromptFacade,
      semanticSearchQuery,
      args,
    }: HandleAutomationCallArgs) => {
      if (!userEmail) {
        throw Error('Automation failed to execute because the user is not logged in.')
      }
      // TODO: add user recovery logic here
      const errorCallback = (error: Error) => {
        // todo: Implement a retry system and add automation back to the Queue
        args?.errorCallback()
        handleAutomationError(error)
      }
      const messageStreamCallback = (_content: string) => {
        // todo: Implement stream
      }
      const messageFinishCallback = async (response: string) => {
        if (!response) {
          handleError('Failed to run automation')
          return undefined
        }

        await args?.sucessHandler(
          args?.feedItem,
          userEmail,
          userPrompt,
          response,
          documents,
          userPromptFacade,
        )
        await syncAutomations()
        return response
      }
      addToLLMQueue({
        prompt: userPrompt,
        semanticSearchQuery,
        documents,
        additionalDocuments,
        messageStreamCallback,
        messageFinishCallback,
        errorCallback,
      })
    },
    [userEmail, addToLLMQueue, handleAutomationError, handleError, syncAutomations],
  )

  const handleAutomation = useCallback(
    async (args: HandleAutomationArgs): Promise<boolean> => {
      if (showGoogleAuthPopup) {
        return true
      }
      setCurrentFeedItem(args.args?.feedItem)
      try {
        await checkAuth(userEmail)
      } catch {
        setCurrentAutomation(args.automation.getName())
        // setShowGoogleAuthPopup(true)
        return true
      }

      // only runs if auth succeeded
      try {
        const { automation, trigger, run, args: automationArgs } = args

        const steps = automation.getSteps()
        if (!steps.length) {
          throw new Error('Automation steps did not load, please try again')
        }

        if (
          [AutomationTrigger.CADENCE, AutomationTrigger.STARTUP].includes(trigger) &&
          !automation.getIsActive()
        ) {
          return false
        }

        KNAnalytics.trackEvent('AutomationRun', {
          automationName: automation.getName(),
        })

        let runParams = run?.runParams ?? {}
        if (typeof runParams === 'string') {
          runParams = JSON.parse(runParams)
        }
        let context: StepExecuteContext = {
          userEmail,
          trigger,
          ...runParams,
        }

        for (const step of steps) {
          const helpers = {
            getIsAutomationReadyPolling,
            dataFetcher,
            submitWebSearch,
            handleChatbotAutomationRun: ({
              documents,
              additionalDocuments,
              semanticSearchQuery,
              userPrompt,
              userPromptFacade,
            }: Omit<HandleAutomationCallArgs, 'args'>) =>
              handleChatbotAutomationRun({
                documents,
                additionalDocuments,
                userPrompt,
                userPromptFacade,
                semanticSearchQuery,
                args: automationArgs,
              }),
          }

          try {
            context = await step.execute(context, helpers)
          } catch (error) {
            handleAutomationError(error as Error)
            automationArgs?.errorCallback()
            throw error
          }
        }

        return false
      } catch (error) {
        handleAutomationError(error as Error)
        args.args?.errorCallback?.()
        return false
      }
    },
    [userEmail, dataFetcher, handleAutomationError, handleChatbotAutomationRun, submitWebSearch],
  )

  const handleAutomationPreview = useCallback(
    async (
      automation: Automation,
      onAutomationFinishCallback: (message: string, documentIds?: number[]) => void,
    ) => {
      const handleChatbotAutomationRun = async ({
        documents,
        userPrompt,
        userPromptFacade,
      }: Omit<HandleAutomationCallArgs, 'args'>) => {
        // TODO: add user recovery logic here
        const errorCallback = (error: Error) => {
          handleAutomationError(error as Error)
        }

        // For preview, show final content
        const onFinishCallback = (message: string) => {
          onAutomationFinishCallback(message, documents)
        }
        addToLLMQueue({
          prompt: userPrompt,
          semanticSearchQuery: userPromptFacade !== undefined ? userPromptFacade : userPrompt,
          documents,
          messageStreamCallback: () => null,
          messageFinishCallback: onFinishCallback,
          errorCallback,
        })
      }

      let context: StepExecuteContext = { userEmail, trigger: AutomationTrigger.CLICK }
      for (const step of automation.getSteps()) {
        try {
          const helpers = {
            getIsAutomationReadyPolling,
            dataFetcher,
            submitWebSearch,
            handleChatbotAutomationRun,
          }
          context = await step.execute(context, helpers)
        } catch (error) {
          handleAutomationError(error as Error)
          throw error
        }
      }
    },
    [
      addToLLMQueue,
      dataFetcher,
      getIsAutomationReadyPolling,
      handleAutomationError,
      submitWebSearch,
      userEmail,
    ],
  )

  const deleteAutomation = useCallback(
    async (automation: Automation) => {
      const automationId = automation.getId()
      if (automationId !== undefined) {
        await deleteAutomationAPI(automationId)
        const updatedAutomations = { ...automations }
        delete updatedAutomations[automationId]
        setAutomations(updatedAutomations)
      }
    },
    [automations],
  )

  const updateAutomation = useCallback(
    async (
      automationId: number,
      { uuid, name, description, steps, runs, cadences, isActive }: CreateAutomationProps,
    ) => {
      const automation = new Automation({
        id: automationId,
        uuid: uuid,
        name,
        description: description,
        isActive: isActive,
        steps: steps,
        runs: runs ?? [],
        cadences,
      })
      const result = await updateAutomationAPI(automationId, automation)
      updateAutomationState(automation)
      return result
    },
    [updateAutomationState],
  )

  const openNotificationWindow = useCallback(
    async (
      eventId: string | undefined,
      buttonConfigs: ButtonConfig[],
      title: string,
      time: string,
    ) => {
      if (!isNotificationWindowShowing) {
        try {
          await invoke('show_notification_window', {
            eventId,
            buttonConfigs,
            title,
            time,
          })
          setIsNotificationWindowShowing(true)
        } catch (error) {
          console.error(error)
          logError(new Error('Error showing notification window'), {
            additionalInfo: `Error showing notification window for eventId: ${eventId}`,
            error: error as string,
          })
        }
      }
    },
    [],
  )

  // -- Notification handling starts here --
  const handleMeetingNotesNotification = useCallback(
    async (now: Date, service: NotificationService, notificationIndex: number) => {
      if (isNotificationWindowShowing) {
        return
      }

      const meetings = await dataFetcher.getRecentCalendarEvents()

      if (meetings?.length) {
        for (const meeting of meetings) {
          const startTime = dayjs(meeting.start)
          const minutesUntil = Math.ceil(startTime.diff(dayjs(now), 'minute', true))

          const leadTime = await getNotificationLeadTimeMin()
          if (
            minutesUntil === leadTime &&
            !service.sentIdentifiers.includes(meeting.eventId) &&
            !isNotificationWindowShowing
          ) {
            KNAnalytics.trackEvent('notificationPush', {
              meetingStart: startTime.format('MM/DD/YYYY HH:mm::ss'),
              pushDatetime: dayjs().format('MM/DD/YYYY HH:mm::ss'),
              meetingId: meeting.eventId,
            })

            try {
              openNotificationWindow(
                meeting.id.toString(),
                [
                  {
                    buttonText: 'Join and record',
                    buttonHandler: 'meeting_start_notification_handler',
                  },
                  {
                    buttonText: 'Record',
                    buttonHandler: 'meeting_record_notification_handler',
                  },
                  {
                    buttonText: 'Open Knapsack',
                    buttonHandler: 'meeting_open_notification_handler',
                  },
                ],
                meeting.title,
                startTime.format('h:mm A'),
              )
              setNotificationServices(prev =>
                prev.map((s, idx) =>
                  idx === notificationIndex
                    ? {
                        ...s,
                        sentIdentifiers: [...s.sentIdentifiers, meeting.id],
                      }
                    : s,
                ),
              )
            } catch (error) {
              setIsNotificationWindowShowing(false)
            }
            break
          }
        }
      }
    },
    [dataFetcher, isNotificationWindowShowing],
  )

  const handleNotificationsScheduleService = useCallback(
    async (now: Date) => {
      const showNotifications = await arePushNotificationsOSEnabledAndWantedByUser()
      if (!showNotifications) {
        return
      }

      notificationServices.forEach(async (notification, index) => {
        if (notification.type === NotificationTypes.MEETING_NOTES) {
          await handleMeetingNotesNotification(now, notification, index)
        }
      })
    },
    [handleMeetingNotesNotification, notificationServices, isNotificationWindowShowing],
  )

  // On load
  useEffect(() => {
    if (userEmail) {
      scheduleRuns(userEmail).finally(() => {
        syncAutomations()
      })
    }

    const unlistenPromisse = listen('close-notification', () => {
      setIsNotificationWindowShowing(false)
    })

    return () => {
      unlistenPromisse.then(unlisten => unlisten())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  const googleAuthControls: IGoogleAuthControls = {
    showGoogleAuthPopup,
    setShowGoogleAuthPopup,
    currentAutomation,
    setCurrentAutomation,
    currentFeedItem,
    setCurrentFeedItem,
  }

  return {
    automations,
    updateAutomationState,
    syncAutomations,
    deleteAutomation,
    updateAutomation,
    handleAutomation,
    handleAutomationPreview,
    handleNotificationsScheduleService,
    scheduleRuns,
    googleAuthControls,
    openNotificationWindow,
  }
}
