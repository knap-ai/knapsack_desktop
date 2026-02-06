import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Navigate, Route, Routes } from 'react-router-dom'

import './main.css'

import { Alert, Button as MUIButton, Snackbar } from '@mui/material'
import dayjs from 'dayjs'
import {
  // Connection,
  ConnectionKeys,
  // ConnectionStates,
  deleteConnection as deleteConnectionApi,
  getCompleteGoogleSignIn,
  getGoogleConnectionKeysFromScopes,
  getGoogleProfile,
  getMicrosoftProfile,
  updateLastSeen,
} from 'src/api/connections'
import { IAuth, Profile, useAuth } from 'src/hooks/auth/useAuth'
//import { RecordingProvider } from 'src/components/organisms/MeetingNotesMode/RecordingContext'

import { useFeed } from 'src/hooks/feed/useFeed'
import { useLLMBar } from 'src/hooks/feed/useLLMBar'
import { getHasOnboarded, Onboarding } from 'src/pages/onboarding'
import { KN_API_STOP_LLM_EXECUTION, KN_CHAT_MESSAGE_MAX_STREAM_READS } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'

import Home from './components/templates/Home/Home'
import {
  RecordingContextProps,
  useRecording,
} from 'src/components/organisms/MeetingNotesMode/RecordingContext'

import { Event, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { onUpdaterEvent } from '@tauri-apps/api/updater'

import { KNChatMessage } from './api/threads'
import { Automation, AutomationRun, Cadence } from './automations/automation'
import BaseStep from './automations/steps/Base'
import { useAutomations } from './hooks/automation/useAutomations'
import { useConnections } from './hooks/connections/useConnections'
import { uploadAllData } from './utils/batchData'
import DataFetcher from './utils/data_fetch'
import { BaseException } from './utils/exceptions/base'
import KNAnalytics from './utils/KNAnalytics'
import { isSharingEnabled } from './utils/settings'

export type CreateAutomationProps = {
  uuid?: string
  name: string
  description: string
  steps: BaseStep[]
  runs?: AutomationRun[]
  cadences: Cadence[]
  isActive?: boolean
}

export interface IGoogleDriveItem {
  name: string
  mimeType: string
  id: string
}

export interface IGoogleDriveData {
  docs: IGoogleDriveItem[]
  action: string
}

export interface HomeProps {
  auth: IAuth
  feed: any
  automations: any
  connections: any
  toastrState: ToastrState
  votes: Record<number, number>
  googleAuthControls: {
    showGoogleAuthPopup: boolean
    setShowGoogleAuthPopup: (show: boolean) => void
  }
  handleAutomationPreview: (
    automation: Automation,
    onAutomationFinishCallback: (message: string, documentIds?: number[]) => void,
  ) => Promise<void>
  handleOpenToastr: (
    message: ReactElement,
    alertType: ToastrState['alertType'],
    autoHideDuration?: number,
    icon?: boolean,
    style?: Record<string, string>,
    actionText?: string,
    actionHandler?: () => void,
  ) => void
  fetchConnections: (email: string) => Promise<any>
  deleteConnection: (id: number) => Promise<void>
  handleError: (error: Error | string) => void
  llmBar: any
  //handleAutomationPreview: (automation: any) => void; // or proper type
  addToLLMQueue: (item: LLMParams) => void
  updateAutomation: (
    automationId: number,
    createAutomationProps: CreateAutomationProps,
  ) => Promise<boolean>
  setVotes: React.Dispatch<React.SetStateAction<Record<number, number>>>
  recordingHandlers: RecordingContextProps
  isSignInDialogOpened: boolean
  setIsSignInDialogOpened: (show: boolean) => void
  reconnectKeys: ConnectionKeys[]
  isAnyRecording: boolean
}

export type LLMParams = {
  prompt: string
  semanticSearchQuery?: string
  documents: number[]
  additionalDocuments?: { title: string; content: string }[]
  messageStreamCallback?: (message: string) => void
  messageFinishCallback?: (message: string) => void
  errorCallback?: (error: Error) => void
  threadId?: number
}

type LLMQueueProps = {
  isProcessing: boolean
  items: LLMParams[]
}

export type ToastrState = {
  message?: React.ReactElement
  autoHideDuration?: number
  alertType?: 'success' | 'info' | 'warning' | 'error'
  icon?: boolean
  style?: Record<string, string>
  actionText?: string
  actionHandler?: () => void
}

export class WebSearchDocument {
  id: number
  title: string
  url: string
  text: string

  constructor(id: number, title: string, url: string, text: string = '') {
    this.id = id
    this.title = title
    this.url = url
    this.text = text
  }
}

export class WebSearchResponse {
  success: boolean
  stage: any
  num_tokens_used: number
  websearch_docs: WebSearchDocument[]
  answer: string
  error_message: string

  constructor(
    success: boolean,
    stage: any,
    num_tokens_used: number,
    websearch_docs: WebSearchDocument[],
    answer: string,
    error_message: string = '',
  ) {
    this.success = success
    this.stage = stage
    this.num_tokens_used = num_tokens_used
    this.websearch_docs = websearch_docs
    this.answer = answer
    this.error_message = error_message
  }
}

const JSON_STREAM_SEPARATOR = '[/PERPLEXED-SEPARATOR]'

export const serializeWebSearchToLLMAdditionalDocuments = (
  webSearchResponse?: WebSearchResponse,
) => {
  return (
    webSearchResponse?.websearch_docs.map(doc => ({ title: doc.title, content: doc.text })) ?? []
  )
}

export const serializeItemToLLMAdditionalDocument = async (semanticSearchResponse?: any[]) => {
  return semanticSearchResponse?.map(item => JSON.stringify(item))
}

const dataFetcher = new DataFetcher()

function App() {
  const [uuid, setUuid] = useState<string>('')
  const auth: IAuth = useAuth()

  const [toastrState, setToastrState] = useState<ToastrState>({})
  const [LLMQueue, setLLMQueue] = useState<LLMQueueProps>({ isProcessing: false, items: [] })
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [, setConnectionsDropdownOpened] = useState(false)
  const [isSignInDialogOpened, setIsSignInDialogOpened] = useState(false)

  const userName = useMemo(() => auth.profile?.name ?? '', [auth.profile])
  const userEmail = useMemo(() => auth.profile?.email ?? '', [auth.profile])
  const [_webSearchResponse, setWebSearchResponse] = useState<WebSearchResponse | null>(null)
  const [_searchTextValue, setSearchTextValue] = useState<string>('')
  const {
    connections,
    reconnect,
    cleanReconnectKeys,
    syncConnections,
    fetchConnections,
    addConnections,
  } = useConnections()
  const [_isChatLoading, setIsChatLoading] = useState<boolean>(false)
  const [_chatMessages, setChatMessages] = useState<KNChatMessage[]>([])
  // const [micUsage, setMicUsage] = useState<number>(0)

  const {
    isRecording,
    setIsRecording,
    isLoadingNotes,
    startRecording,
    stopRecording,
    isAnyRecording,
    pauseRecording,
    isPaused,
    generateNotes,
    hasSynthesized,
  } = useRecording()

  useEffect(() => {
    const email = auth.profile?.email ?? ''
    const userUuid = auth.profile?.uuid ?? ''
    if (uuid !== '') {
      KNAnalytics.initAnalytics(email, uuid, userUuid)
    }
  }, [auth.profile?.email, uuid, auth.profile?.uuid])

  // -- TOAST HANDLERS --
  const handleOpenToastr = useCallback(
    (
      message: ReactElement,
      alertType: ToastrState['alertType'],
      autoHideDuration?: number,
      icon: boolean = true,
      style: Record<string, string> = {},
      actionText?: string,
      actionHandler?: () => void,
    ) => {
      setToastrState({
        message,
        autoHideDuration,
        alertType,
        icon,
        style,
        actionText,
        actionHandler,
      })
    },
    [],
  )

  const handleErrorContact = (message: string) => {
    handleOpenToastr(<span>{message}</span>, 'error', 3000, false, {
      bgcolor: '#e5e7eb',
      color: '#3F3F46',
      'font-weight': '700',
    })
  }

  function handleCloseToastr() {
    setToastrState(prevState => ({ ...prevState, message: undefined }))
  }

  function handleSyncStatusToastr() {
    setToastrState(prevState => ({ ...prevState, message: undefined }))
    setConnectionsDropdownOpened(true)
  }

  const handleError = useCallback(
    (error: Error | string) => {
      let errorMessage = 'An error occurred'
      if (error instanceof BaseException && !!error.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      handleOpenToastr(<span>{errorMessage}</span>, 'error', 3000)
    },
    [handleOpenToastr],
  )

  // -- LLM Queue management --
  const addToLLMQueue = useCallback((item: LLMParams) => {
    setLLMQueue(prevState => ({
      ...prevState,
      items: [item, ...prevState.items],
    }))
  }, [])

  const chatMessagesAskBot = useCallback(
    async ({
      prompt,
      semanticSearchQuery,
      documents,
      additionalDocuments,
      messageStreamCallback,
      messageFinishCallback,
      errorCallback,
      threadId,
    }: LLMParams) => {
      KNAnalytics.trackEvent('chatMessagesAskBot', { threadId: threadId })
      try {
        const reader = await dataFetcher.getChatCompletionStream(
          userEmail,
          userName,
          prompt,
          semanticSearchQuery,
          documents,
          false,
          additionalDocuments,
          threadId,
        )

        const decoder = new TextDecoder('utf-8')
        if (!reader) {
          handleOpenToastr(<span>An error occurred, please try again</span>, 'error', 5000)
          logError(new Error('No return from dataFetcher.getChatCompletionStream'), {
            additionalInfo: 'No return from dataFetcher.getChatCompletionStream',
            error: 'No return from dataFetcher.getChatCompletionStream',
          })
          return
        }
        let num_reads = 0
        let messageText = ''

        const readStreamChunk = async (
          reader: ReadableStreamDefaultReader<Uint8Array>,
        ): Promise<boolean> => {
          const { done, value } = await reader.read()
          if (done) {
            return true
          }

          const strData = decoder.decode(value)
          const objects = strData.split('\n')
          for (const strLine of objects) {
            if (!strLine.startsWith('data: ')) {
              return false
            }
            if (strLine === 'data: [DONE]') {
              return true
            }

            messageText += JSON.parse(strLine.slice(6)).choices[0].text
            if (messageText) {
              messageStreamCallback?.(messageText)
              // setMessageStream(messageText)
            }

            num_reads += 1
          }
          return false
        }
        while (true) {
          if (num_reads >= KN_CHAT_MESSAGE_MAX_STREAM_READS) {
            handleOpenToastr(<span>An error occurred, please try again</span>, 'error', 5000)
            logError(new Error('ChatMessagesFetch: Error: too many chat messages streamed'), {
              additionalInfo:
                'ChatMessagesFetch: Error: too many chat messages streamed, possibly something wrong.  Breaking to avoid infinite loop.',
              error: 'ChatMessagesFetch: Error: too many chat messages streamed',
            })
            break
          }
          if (await readStreamChunk(reader)) {
            break
          }
        }
        if (messageText) {
          messageFinishCallback?.(messageText)
        }
        return messageText
      } catch (err) {
        const error = (err as Error) || new Error(String(err))
        logError(error, {
          additionalInfo: 'Error during Groq fetch',
          error: error.message,
        })
        handleErrorContact(error.message)
        errorCallback?.(err as Error)
      }
    },
    [dataFetcher, false],
  )

  useEffect(() => {
    if (!LLMQueue.items.length) {
      return
    }

    if (LLMQueue.isProcessing) {
      return
    }

    const head = LLMQueue.items[0]

    setLLMQueue(prevState => ({
      isProcessing: true,
      items: prevState.items.slice(1),
    }))

    chatMessagesAskBot(head).finally(() =>
      setLLMQueue(prevState => ({
        ...prevState,
        isProcessing: false,
      })),
    )
  }, [LLMQueue, chatMessagesAskBot])

  useEffect(() => {
    if (auth.profile?.email) {
      const email = auth.profile.email
      // Update profile
      if (auth.profile.provider == ConnectionKeys.MICROSOFT_PROFILE) {
        getMicrosoftProfile(email).then(updatedProfile => auth.updateProfile(updatedProfile))
      } else {
        getGoogleProfile(email).then(updatedProfile => auth.updateProfile(updatedProfile))
      }

      // Update connections and start syncing data
      fetchConnections(email).then(updatedConnections => syncConnections(email, updatedConnections))
    }
  }, [auth.profile?.email])

  useEffect(() => {
    if (reconnect && reconnect.length > 0 && auth.profile) {
      setIsSignInDialogOpened(true)
    }
  }, [reconnect])

  useEffect(() => {}, [auth.profile?.email])

  useEffect(() => {
    const unlistenPromise = listen(
      'signin_success',
      async (event: Event<{ code: string; raw_scopes: string }>) => {
        const hasOnboarded = await getHasOnboarded()
        if (!hasOnboarded) {
          return
        }
        getCompleteGoogleSignIn(event.payload.code, event.payload.raw_scopes)
          .then(async response => {
            auth.updateProfile({
              email: response.profile.email,
              name: response.profile.name,
              profile_image: response.profile.profile_image,
              uuid: response.profile.uuid,
              provider: ConnectionKeys.GOOGLE_PROFILE,
            })
            const scopes = getGoogleConnectionKeysFromScopes(event.payload.raw_scopes.split(' '))
            await addConnections(scopes)

            fetchConnections(response.profile.email).then(updatedConnections => {
              KNAnalytics.trackEvent('PermissionsGranted', {
                googlePermissions: updatedConnections,
              })
              syncConnections(response.profile.email, updatedConnections)
              setIsSignInDialogOpened(false)
              cleanReconnectKeys()
            })
          })
          .catch(error => {
            handleErrorContact('Something went wrong. Please try again later.')
            logError(new Error('Could not siging with google'), {
              additionalInfo: '',
              error: error,
            })
            setIsSignInDialogOpened(false)
          })
      },
    )

    const unlistenMicrosoftPromise = listen(
      'microsoft_signin_success',
      async (event: Event<{ profile: Profile; connection_keys: string[] }>) => {
        const hasOnboarded = await getHasOnboarded()
        if (!hasOnboarded) {
          return
        }
        const profile = event.payload.profile
        profile.provider = ConnectionKeys.MICROSOFT_PROFILE
        auth.updateProfile(profile)

        await addConnections(event.payload.connection_keys)
        fetchConnections(profile.email).then(updatedConnections => {
          KNAnalytics.trackEvent('PermissionsGranted', {
            googlePermissions: updatedConnections,
          })
          syncConnections(profile.email, updatedConnections)

          KNAnalytics.trackEvent('PermissionsGranted', {
            googlePermissions: updatedConnections,
          })
        })
        setIsSignInDialogOpened(false)
        cleanReconnectKeys()
      },
    )
    const unlistenFetchCalendarPromise = listen(
      'finish_fetch_calendar',
      async (event: Event<{ success: boolean; synced_events_count?: number }>) => {
        if (event.payload.success) {
          KNAnalytics.trackEvent('CalendarSynced', {
            synced_events_count: event.payload.synced_events_count || 0,
            source: connections[ConnectionKeys.GOOGLE_CALENDAR] ? 'google' : 'microsoft',
            success: true,
          })

          await syncMeetings()
          await scheduleRuns(userEmail)
          await syncAutomations()
        }
      },
    )

    const unlistenWindowFocusPromise = listen('custom-focus', async event => {
      feed.refreshFeedItems()
      if (auth.profile?.email) {
        const email = auth.profile.email
        const result = await updateLastSeen(email)
        if (
          auth.profile.sharing_permission === 0 &&
          isSharingEnabled('notes', 'knapsack', result.sharing_permission)
        ) {
          uploadAllData(
            auth.profile.uuid,
            isSharingEnabled('transcripts', 'knapsack', result.sharing_permission),
          )
        }
        if (result.success && result.sharing_permission !== undefined) {
          const currentProfile = auth.profile
          auth.updateProfile({
            ...currentProfile,
            sharing_permission: result.sharing_permission,
          })
        }

        const CalendarConnection = Object.fromEntries(
          Object.entries({
            [ConnectionKeys.GOOGLE_CALENDAR]: connections[ConnectionKeys.GOOGLE_CALENDAR],
            [ConnectionKeys.MICROSOFT_CALENDAR]: connections[ConnectionKeys.MICROSOFT_CALENDAR],
            [ConnectionKeys.GOOGLE_GMAIL]: connections[ConnectionKeys.GOOGLE_GMAIL],
            [ConnectionKeys.MICROSOFT_OUTLOOK]: connections[ConnectionKeys.MICROSOFT_OUTLOOK],
          }).filter(([_, value]) => value !== undefined),
        )
        if (Object.keys(CalendarConnection).length > 0) {
          syncConnections(email, CalendarConnection)
        } else {
          logError(new Error('No calendar connections found'), {
            additionalInfo: JSON.stringify(event.payload),
            error: 'No calendar connections found',
          })
        }
      }
    })

    const unlistenAutoOpenFeedItemPromise = listen('open_feed_item', async () => {
      feedRef.current.handleClickRecording()
    })

    const unlistenFetchEmailPromise = listen(
      'finish_fetch_email',
      async (event: Event<{ success: boolean }>) => {
        if (event.payload.success) {
          await feedRef.current.runEmailAutopilot()
        }
      },
    )

    return () => {
      unlistenPromise.then(unlisten => unlisten())
      unlistenMicrosoftPromise.then(unlisten => unlisten())
      unlistenFetchCalendarPromise.then(unlisten => unlisten())
      unlistenWindowFocusPromise.then(unlisten => unlisten())
      unlistenAutoOpenFeedItemPromise.then(unlisten => unlisten())
      unlistenFetchEmailPromise.then(unlisten => unlisten())
    }
  }, [fetchConnections, auth.updateProfile, syncConnections, userEmail])

  const submitWebSearch = async (submittedUserPrompt: string) => {
    setSearchTextValue(submittedUserPrompt)

    let res = null
    let error_message = ''

    try {
      res = await fetch('https://knap.ai/api/knapsack/stream_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_prompt: submittedUserPrompt }),
      })
    } catch (error) {
      error_message =
        "We're experiencing a high volume of requests at the moment. Please try again in a little while. We apologize for the inconvenience."
      handleOpenToastr(<span>{error_message}</span>, 'error', 5000)
      console.error('Error submitting search: ' + error)
    }
    if (!res || !res.ok) {
      handleOpenToastr(<span>An error occurred, please try again</span>, 'error', 5000)
      setWebSearchResponse(new WebSearchResponse(false, null, 0, [], '', error_message))
      return
    }
    if (res.body === null) {
      handleOpenToastr(<span>An error occurred, please try again</span>, 'error', 5000)
      return
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    const response = await readStream(decoder, reader)
    return response
  }

  async function readStream(
    decoder: TextDecoder,
    reader: ReadableStreamDefaultReader<Uint8Array>,
  ): Promise<WebSearchResponse> {
    let buffer = ''
    let response: WebSearchResponse = new WebSearchResponse(false, null, 0, [], '', '')

    let isErrorResponse = false
    while (!isErrorResponse) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value)
      let boundary = buffer.indexOf(JSON_STREAM_SEPARATOR)

      while (boundary !== -1) {
        const input = buffer.substring(0, boundary)
        buffer = buffer.substring(boundary + JSON_STREAM_SEPARATOR.length)
        if (input.trim() === '') {
          break
        }
        const result = JSON.parse(input)
        boundary = buffer.indexOf(JSON_STREAM_SEPARATOR)

        const isSuccess = result.success
        const error_message = isSuccess ? '' : result.message

        if (result.stage === 'Downloading Webpages' && result.websearch_docs.length > 0) {
          response = new WebSearchResponse(
            isSuccess,
            result.stage,
            result.num_tokens_used,
            result.websearch_docs.map(
              (doc: any) => new WebSearchDocument(doc.id, doc.title, doc.url, doc.text),
            ),
            result.answer,
          )
          setWebSearchResponse(response)
          return response
        } else if (isSuccess && result.stage !== 'Downloading Webpages') {
          response = new WebSearchResponse(
            isSuccess,
            result.stage,
            result.num_tokens_used,
            result.websearch_docs.map(
              (doc: any) => new WebSearchDocument(doc.id, doc.title, doc.url, doc.text),
            ),
            result.answer,
          )
          setWebSearchResponse(response)
        } else {
          response = new WebSearchResponse(false, null, 0, [], '', error_message)
          isErrorResponse = true
          break
        }
      }
    }
    setWebSearchResponse(response)
    return response
  }

  const stopLLMExecution = async () => {
    await fetch(KN_API_STOP_LLM_EXECUTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const {
    automations,
    handleAutomation,
    updateAutomation,
    handleAutomationPreview,
    handleNotificationsScheduleService,
    scheduleRuns,
    syncAutomations,
    googleAuthControls,
    openNotificationWindow,
  } = useAutomations({
    userEmail,
    automationHelperFunctions: {
      submitWebSearch,
      stopLLMExecution,
      handleError,
      addToLLMQueue,
    },
  })

  const { feed, syncMeetings, handleAutomationsFeedScheduleService, updateMeetingStatuses } =
    useFeed(
      automations,
      handleErrorContact,
      handleAutomation,
      handleError,
      addToLLMQueue,
      googleAuthControls,
      connections,
      handleOpenToastr,
      handleSyncStatusToastr,
      userEmail,
      userName,
    )

  const setClocks = useCallback(() => {
    if (!userEmail) {
      return
    }
    const MINUTE_MS = 60000

    const minuteInterval = setInterval(() => {
      const date = new Date()
      const currentTime = (window as any).testTime ? (window as any).testTime : Date.now() / 1000

      handleNotificationsScheduleService(date)
      handleAutomationsFeedScheduleService(date)
      updateMeetingStatuses(currentTime)
    }, MINUTE_MS)

    return () => {
      clearInterval(minuteInterval)
    }
  }, [userEmail])

  // TODO test this hook the refresh don't look being working as expected
  useEffect(() => {
    if (!userEmail) return

    const MINUTE_MS = 60000
    const fiveMinutesInterval = setInterval(async () => {
      await syncConnections(userEmail, connections)
      await syncMeetings()
      await scheduleRuns(userEmail)
      await syncAutomations()
    }, MINUTE_MS * 5)

    return () => {
      clearInterval(fiveMinutesInterval)
    }
  }, [
    syncAutomations,
    syncMeetings,
    scheduleRuns,
    handleAutomationsFeedScheduleService,
    handleNotificationsScheduleService,
    syncConnections,
    connections,
    userEmail,
    updateMeetingStatuses,
  ])

  useEffect(() => {
    const unlistenClock = setClocks()
    return () => {
      unlistenClock?.()
    }
  }, [setClocks])

  const setChatStream = (messageText: string, isStillStreaming: boolean = true) => {
    setIsChatLoading(false)
    setChatMessages(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1]
      if (lastMessage?.isStreaming) {
        const updatedLastMessage = {
          ...lastMessage,
          text: messageText,
          isStreaming: isStillStreaming,
        }
        return [...prevMessages.slice(0, -1), updatedLastMessage]
      }
      return [
        ...prevMessages,
        {
          user_type: 'bot',
          content_type: 'text',
          text: messageText,
          date: new Date(),
          isStreaming: isStillStreaming,
        },
      ]
    })
  }

  //TODO Replace the use Ref and make useFeed as a context
  // The issue was that App don't reload usually so new meetings never was catched
  // with useRef and useEffect we force to reload the feed reference
  const feedRef = useRef(feed)

  useEffect(() => {
    feedRef.current = feed
  }, [feed])

  const startRecordingExistingMeeting = async (
    meetingId: string | undefined,
    openUrl: boolean,
    startRecord: boolean,
  ) => {
    const dateKey = feedRef.current.getTodayKey()
    const items = feedRef.current.feedContent[dateKey]
    const item = items.find(i => i.calendarEvent?.id === meetingId)
    if (item) {
      await feedRef.current.selectFeedItem(dateKey, item.id)
      await new Promise(resolve => setTimeout(resolve, 500))
      if (startRecord) {
        await invoke('emit_event', {
          event: 'start_recording',
          payload: { openUrl },
        })
      }
    }
  }

  const startRecordingAdHocMeeting = useCallback(async () => {
    try {
      await feedRef.current.createNewMeeting()
    } catch (err) {
      handleErrorContact('Could not start recording for new meeting')
      const error = (err as Error) || new Error(String(err))
      logError(
        new Error('Could not create ad hoc meeting and start record from notification'),
        {
          additionalInfo: '',
          error: error.message,
        },
        true,
      )
    }
  }, [feed])

  const recordingHandlers: RecordingContextProps = {
    isRecording,
    setIsRecording,
    isLoadingNotes,
    startRecording,
    stopRecording,
    isAnyRecording,
    pauseRecording,
    isPaused,
    generateNotes,
    hasSynthesized,
  }

  useEffect(() => {
    const unlistenPromise = listen('meeting_ended', async () => {
      try {
        openNotificationWindow(
          undefined,
          [
            {
              buttonText: 'Stop recording',
              buttonHandler: 'still_there_notification_handler',
            },
          ],
          'Still there?',
          '',
        )
      } catch (error) {
        console.error('Error showing meeting ended notification:', error)
      }
    })

    // Cleanup listener when component unmounts
    return () => {
      unlistenPromise.then(unlisten => unlisten())
    }
  }, [])

  const { LLMBar: llmBar } = useLLMBar(addToLLMQueue, setChatStream, feed, handleError, userEmail)

  useEffect(() => {
    const setupUpdaterTracking = async () => {
      const unlisten = await onUpdaterEvent(({ error, status }) => {
        if (error) {
          KNAnalytics.trackEvent('update_error', {
            error: error,
            timestamp: new Date().toISOString(),
          })
        } else {
          const statusAmplitude = 'update_' + status.toLowerCase()
          KNAnalytics.trackEvent(statusAmplitude, {
            timestamp: new Date().toISOString(),
          })
        }
      })
      return unlisten
    }

    let unlistenUpdater: (() => void) | undefined
    setupUpdaterTracking().then(unlisten => {
      unlistenUpdater = unlisten
    })

    fetchUUID()

    invoke('plugin:autostart|enable')
      .then(() => console.log('Autostart enabled'))
      .catch(error => console.error('Failed to enable autostart:', error))

    return () => {
      if (unlistenUpdater) {
        unlistenUpdater()
      }
    }
  }, [])

  const fetchUUID = async () => {
    try {
      const uuid: string = await invoke('kn_get_or_generate_uuid')
      setUuid(uuid)
    } catch (error) {
      console.error('Failed to fetch UUID:', error)
    }
  }

  // -- NOTIFICATION HANDLERS --
  const stopMeetingNotification = async () => {
    await invoke('emit_stop_events')
    invoke('close_notification_window')
    return
  }

  const startMeetingNotification = async (
    meetingId: string | null,
    openUrl: boolean,
    startRecord: boolean,
  ) => {
    if (meetingId) {
      KNAnalytics.trackEvent('notificationOpenMeeting', {
        //TODO remove dayjs from here
        pushDatetime: dayjs().format('MM/DD/YYYY HH:mm:ss'),
        meetingId: meetingId,
      })
      await invoke('activate_main_window')
      try {
        await startRecordingExistingMeeting(meetingId, openUrl, startRecord)
      } catch (error) {
        logError(new Error('Error in handleJoinMeeting'), {
          additionalInfo: 'Error in handleJoinMeeting',
          error: String(error),
        })
      } finally {
        await invoke('close_notification_window')
      }
    } else {
      await startRecordingAdHocMeeting()
      await invoke('activate_main_window')
    }
  }

  const notificationStrategies = {
    meeting_start_notification_handler: async (meetingId: string | null) =>
      startMeetingNotification(meetingId, true, true),
    still_there_notification_handler: async (_meetingId: string | null) =>
      stopMeetingNotification(),
    meeting_record_notification_handler: async (meetingId: string | null) =>
      startMeetingNotification(meetingId, false, true),
    meeting_open_notification_handler: async (meetingId: string | null) =>
      startMeetingNotification(meetingId, false, false),
  }

  useEffect(() => {
    const unlistenPromise = listen(
      'notification_handler',
      async (event: Event<{ meetingId: string | null; buttonHandler: string }>) => {
        if (event.payload.buttonHandler in notificationStrategies) {
          const handler =
            notificationStrategies[
              event.payload.buttonHandler as keyof typeof notificationStrategies
            ]
          await handler(event.payload.meetingId)
        } else {
          console.error(`Unknown button handler: ${event.payload.buttonHandler}`)
        }
      },
    )

    // Cleanup listener when component unmounts
    return () => {
      unlistenPromise.then(unlisten => unlisten())
    }
  }, [])

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={!!toastrState.message}
        onClose={handleCloseToastr}
        autoHideDuration={toastrState.autoHideDuration}
      >
        <Alert
          icon={toastrState.icon}
          onClose={handleCloseToastr}
          severity={toastrState.alertType}
          variant="filled"
          sx={{ boxShadow: 3, width: '100%', ...toastrState.style }}
          action={
            toastrState.actionText ? (
              <MUIButton
                size="small"
                onClick={toastrState.actionHandler ? toastrState.actionHandler : handleCloseToastr}
                sx={{ color: 'blue', boxShadow: 0, 'font-weight': '700', textTransform: 'none' }}
              >
                {toastrState.actionText}
              </MUIButton>
            ) : null
          }
        >
          {toastrState.message}
        </Alert>
      </Snackbar>

      <Routes>
        <Route path="/onboard" element={<Onboarding updateProfile={auth.updateProfile} />} />
        <Route
          path="/home"
          element={
            <Home
              auth={auth}
              feed={feed}
              automations={automations}
              connections={connections}
              toastrState={toastrState}
              votes={votes}
              googleAuthControls={googleAuthControls}
              handleOpenToastr={handleOpenToastr}
              fetchConnections={fetchConnections}
              deleteConnection={deleteConnectionApi}
              handleError={handleError}
              addToLLMQueue={addToLLMQueue}
              updateAutomation={(automation: any) => updateAutomation(automation.id, automation)}
              setVotes={setVotes}
              llmBar={llmBar}
              handleAutomationPreview={handleAutomationPreview}
              recordingHandlers={recordingHandlers}
              isSignInDialogOpened={isSignInDialogOpened}
              setIsSignInDialogOpened={setIsSignInDialogOpened}
              reconnectKeys={reconnect}
              isAnyRecording={isAnyRecording}
            />
          }
        />
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </>
  )
}

export default App
