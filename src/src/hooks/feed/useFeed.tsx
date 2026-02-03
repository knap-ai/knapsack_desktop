import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { insertAutomationRun } from 'src/api/automations'
import { Connection, ConnectionKeys, ConnectionStates } from 'src/api/connections'
import { getEmailThread } from 'src/api/data_source'
import {
  deleteFeedItem,
  FeedItem,
  getFeedItems,
  insertFeedItemAPI,
  updateFeedItem,
} from 'src/api/feed_items'
import { isRecordingStatus, startRecord } from 'src/api/recording'
import {
  createMessage,
  createThread,
  IThread,
  KNChatMessage,
  Thread,
  ThreadType,
  updateThread,
} from 'src/api/threads'
import { LLMParams, ToastrState } from 'src/App'
import {
  Automation,
  //AutomationDataSources, Commented to fix build errors
  AutomationTrigger,
  convertAutomationDataSourceToConnectionKey,
} from 'src/automations/automation'
import {
  AutopilotActions,
  EmailClassification,
  EmailImportance,
  IEmailAutopilot,
  useEmailAutopilot,
} from 'src/hooks/dataSources/useEmailAutopilot'
import DataFetcher from 'src/utils/data_fetch'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import KNDateUtils from 'src/utils/KNDateUtils'
import { PriorityQueue } from 'src/utils/PriorityQueue'
import { HttpError } from 'src/utils/retryUtils'
import { shouldSaveTranscript } from 'src/utils/settings'
import { EmailDocument } from 'src/utils/SourceDocument'

import { SubTabChoices } from 'src/components/organisms/CenterWorkspace'

import { HandleAutomationArgs, IGoogleAuthControls } from '../automation/useAutomations'
import useCalendar from '../dataSources/useCalendar'

export interface DisplayEmail {
  message: EmailDocument
  classification: EmailClassification | null
  wasIgnored?: boolean
  wasReplySent?: boolean
  draftedReply?: string
}

const ignore_actions = [
  AutopilotActions.MARK_AS_READ,
  AutopilotActions.ARCHIVE,
  AutopilotActions.DELETE,
]

const reply_actions = [
  AutopilotActions.SEND_REPLY,
  AutopilotActions.REPLY_ARCHIVE,
  AutopilotActions.REPLY_DELETE,
]

const MAX_RETRIES = 5
export const STATIONARY_ITEMS = 'stationary'
export interface IFeed {
  updateFeedItemTitle?: (key: string, itemId: number, newTitle: string) => void
  deleteFeedItemFromState?: (itemId: number) => Promise<void>
  emailAutopilotStatus: {
    status:
      | 'idle'
      | 'fetching-emails'
      | 'classifying-emails'
      | 'creating-threads'
      | 'complete'
      | 'error'
      | 'sync-email'
    progress?: { current: number; total: number }
  }
  setEmailAutopilotStatus: React.Dispatch<
    React.SetStateAction<{
      status:
        | 'idle'
        | 'fetching-emails'
        | 'classifying-emails'
        | 'creating-threads'
        | 'complete'
        | 'error'
        | 'sync-email'
      progress?: {
        current: number
        total: number
      }
    }>
  >
  feedContent: Record<string, FeedItem[]>
  insertFeedItem: (
    timestamp: number,
    hideFollowUp: boolean,
    title: string,
    mockThread?: boolean,
    automation?: Automation,
  ) => Promise<{
    feedItem: FeedItem
    threadId: number | undefined
  }>
  handleAutomationFeed: (feedItem: FeedItem, automation?: Automation) => void
  insertMessageToFeedItem: (
    feedItem: FeedItem,
    message: string,
    timestamp: Date,
    userEmail: string | undefined,
    documentIds?: number[],
    threadId?: number,
  ) => void
  errorCallback: () => Promise<void>
  handleThreadFollowUpMessage: (text: string, feedItem: FeedItem) => Promise<void>
  isRecentDate: (date: string, showPastDays: boolean, showFutureDates: boolean) => boolean
  selectFeedItem: (key: string, index: number | undefined) => Promise<void>
  currentFeedItem: () => FeedItem | null
  googleAuthControls: IGoogleAuthControls
  unselectFeedItem: () => void
  handleSyncKnapSources: (automation: Automation) => boolean
  subTab: SubTabChoices
  setSubTab: React.Dispatch<React.SetStateAction<SubTabChoices>>
  setIsRecording: (item: FeedItem, isRecording: boolean | undefined) => void
  handleClickRecording: () => void
  getRecordingFeedItemTitle: () => string | undefined
  createNewMeeting: () => Promise<
    | {
        feedItemId: number | undefined
        threadId: number
      }
    | undefined
  >
  renameMeeting: (threadId: number, newTitle: string, feedItemId?: number) => Promise<void>
  refreshFeedItems: () => Promise<never[] | undefined>
  runEmailAutopilot: () => void
  classifiedEmails: Partial<Record<EmailImportance, DisplayEmail[]>>
  classificationActions: Partial<Record<EmailImportance, EmailAction>>
  updateClassificationActions: (
    classification: EmailImportance,
    actionSide: string,
    action: AutopilotActions,
  ) => void
  takeEmailAction: (
    emailUid: string,
    action: AutopilotActions,
    userProvider: ConnectionKeys.MICROSOFT_PROFILE | ConnectionKeys.GOOGLE_PROFILE,
    draftReply?: string,
  ) => void
  createEmailAutoPilot: () => Promise<FeedItem>
  emailAutopilot: IEmailAutopilot
  selectedEmailCategory: EmailImportance | null
  setSelectedEmailCategory: (category: EmailImportance) => void
  loggedEmailAutopilot: boolean
  createMeetingNotes: (feedItem: FeedItem) => Promise<Thread | undefined>
  currentMeetId: () => number | undefined
  getNextMeetId: () => number | undefined
  setThread: (updatedThread: IThread, feedItemId?: number) => void
  selectEmailCategory: () => void
  getTodayKey: () => string
}

export interface EmailAction {
  leftAction: AutopilotActions
  rightAction: AutopilotActions
}

export function useFeed(
  automations: Record<string, Automation>,
  handleErrorContact: (message: string) => void,
  handleAutomation: ({ automation, trigger, run, args }: HandleAutomationArgs) => Promise<boolean>,
  handleError: (error: Error | string) => void,
  addToLLMQueue: (item: LLMParams) => void,
  googleAuthControls: IGoogleAuthControls,
  connections: Record<string, Connection>,
  handleOpenToastr: (
    message: ReactElement,
    alertType: ToastrState['alertType'],
    autoHideDuration?: number,
    icon?: boolean,
    style?: Record<string, string>,
    actionText?: string,
    actionHandler?: () => void,
  ) => void,
  handleSyncStatusToastr: () => void,
  userEmail: string,
  userName?: string,
) {
  const { meetings, syncMeetings, updateMeetingStatuses } = useCalendar()
  const { emailAutopilot } = useEmailAutopilot(addToLLMQueue, userEmail, userName)
  const [feedContent, setFeedContent] = useState<Record<string, FeedItem[]>>({})
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null)
  const [recordingFeedItem, setRecordingFeedItem] = useState<FeedItem | null>(null)
  const [subTab, setSubTab] = useState(SubTabChoices.Welcome)
  const [emailAutopilotStatus, setEmailAutopilotStatus] = useState<{
    status:
      | 'idle'
      | 'fetching-emails'
      | 'classifying-emails'
      | 'creating-threads'
      | 'complete'
      | 'error'
      | 'sync-email'
    progress?: { current: number; total: number }
  }>({ status: 'idle' })
  const [classifiedEmails, setClassifiedEmails] = useState<
    Partial<Record<EmailImportance, DisplayEmail[]>>
  >({})
  const [classificationActions, setClassificationActions] = useState<
    Partial<Record<EmailImportance, EmailAction>>
  >({
    [EmailImportance.IMPORTANT]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
    [EmailImportance.IMPORTANT_NO_RESPONSE]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
    [EmailImportance.INFORMATIONAL]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
    [EmailImportance.MARKETING]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
    [EmailImportance.UNCLASSIFIED]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
    [EmailImportance.UNIMPORTANT]: {
      leftAction: AutopilotActions.MARK_AS_READ,
      rightAction: AutopilotActions.SEND_REPLY,
    },
  })

  const [emailPriorityQueue] = useState<PriorityQueue<DisplayEmail>>(
    new PriorityQueue<DisplayEmail>(),
  )
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [selectedEmailCategory, setSelectedEmailCategory] = useState<EmailImportance | null>(
    EmailImportance.IMPORTANT,
  )

  const updateClassificationActions = useCallback(
    (classification: EmailImportance, actionSide: string, action: AutopilotActions) => {
      setClassificationActions(prevState => {
        const newState = { ...prevState }
        if (
          actionSide === 'LEFT' &&
          (action === AutopilotActions.MARK_AS_READ ||
            action === AutopilotActions.ARCHIVE ||
            action === AutopilotActions.DELETE)
        ) {
          if (newState[classification]) {
            newState[classification] = {
              ...newState[classification],
              leftAction: action,
            }
          }
        } else if (
          actionSide === 'RIGHT' &&
          (action === AutopilotActions.SEND_REPLY ||
            action === AutopilotActions.REPLY_ARCHIVE ||
            action === AutopilotActions.REPLY_DELETE)
        ) {
          if (newState[classification]) {
            newState[classification] = {
              ...newState[classification],
              rightAction: action,
            }
          }
        }
        return newState
      })
    },
    [],
  )

  const getTotalClassifiedEmailsCount = (): number => {
    return Object.values(classifiedEmails).reduce((total, emails) => {
      return total + (emails?.length || 0)
    }, 0)
  }

  const processQueueItems = useCallback(
    async (userEmail: string, userName?: string) => {
      if (emailPriorityQueue.isEmpty() || isProcessingQueue) {
        return
      }

      setIsProcessingQueue(true)

      while (!emailPriorityQueue.isEmpty()) {
        const email = emailPriorityQueue.dequeue()
        if (email) {
          // Process the email here
          if (
            email.classification?.classification == 'IMPORTANT_NEEDS_RESPONSE' ||
            email.classification?.classification == 'IMPORTANT_NO_RESPONSE'
          ) {
            const draftedReply = await emailAutopilot.draftEmailReply(
              email.message,
              userEmail,
              userName,
            )

            setClassifiedEmails(prevState => {
              prevState['IMPORTANT_NEEDS_RESPONSE'] = prevState['IMPORTANT_NEEDS_RESPONSE']?.map(
                emailDisplay => {
                  if (emailDisplay.message.documentId === email.message.documentId) {
                    return { ...emailDisplay, draftedReply }
                  }
                  return emailDisplay
                },
              )
              return prevState
            })
            setClassifiedEmails(prevState => {
              prevState['IMPORTANT_NO_RESPONSE'] = prevState['IMPORTANT_NO_RESPONSE']?.map(
                emailDisplay => {
                  if (emailDisplay.message.documentId === email.message.documentId) {
                    return { ...emailDisplay, draftedReply }
                  }
                  return emailDisplay
                },
              )
              return prevState
            })
          }
          // Add 50ms delay between processing items
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      setIsProcessingQueue(false)
    },
    [emailPriorityQueue, isProcessingQueue, userEmail, userName],
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      processQueueItems(userEmail, userName)
    }, 200)

    return () => clearInterval(intervalId)
  }, [processQueueItems])

  const importancePriority: Record<EmailImportance, number> = {
    IMPORTANT_NEEDS_RESPONSE: 5,
    IMPORTANT_NO_RESPONSE: 4,
    INFORMATIONAL: 3,
    MARKETING: 2,
    UNIMPORTANT: 1,
    UNCLASSIFIED: 0,
  }

  const lastEmailId = useRef<number | undefined>(undefined)

  const selectEmailCategory = useCallback(() => {
    const getTabCount = (category: EmailImportance): number => {
      if (!classifiedEmails) return 0

      if (category === EmailImportance.IMPORTANT_NO_RESPONSE) {
        return (
          (classifiedEmails[EmailImportance.IMPORTANT_NO_RESPONSE]?.filter(
            email => !email.wasIgnored && !email.wasReplySent,
          )?.length || 0) +
          (classifiedEmails[EmailImportance.INFORMATIONAL]?.filter(
            email => !email.wasIgnored && !email.wasReplySent,
          )?.length || 0)
        )
      }

      if (category === EmailImportance.MARKETING) {
        return (
          (classifiedEmails[EmailImportance.MARKETING]?.filter(
            email => !email.wasIgnored && !email.wasReplySent,
          )?.length || 0) +
          (classifiedEmails[EmailImportance.UNIMPORTANT]?.filter(
            email => !email.wasIgnored && !email.wasReplySent,
          )?.length || 0)
        )
      }

      return (
        classifiedEmails[category]?.filter(email => !email.wasIgnored && !email.wasReplySent)
          ?.length || 0
      )
    }

    const categoriesToTry = [
      EmailImportance.IMPORTANT,
      EmailImportance.IMPORTANT_NO_RESPONSE,
      EmailImportance.MARKETING,
    ]

    let selectedCategory = categoriesToTry[0]

    for (const category of categoriesToTry) {
      const count = getTabCount(category)
      if (count > 0) {
        selectedCategory = category
        break
      }
    }

    setSelectedEmailCategory(selectedCategory)
  }, [classifiedEmails, setSelectedEmailCategory])

  const selectFeedItem = async (key: string, index: number | undefined) => {
    if (!index) {
      return
    }

    const indexFeedItemIndex = feedContent[key].findIndex(item => item.id === index)

    const feedItem = feedContent[key][indexFeedItemIndex]
    setSelectedFeedItem(feedItem)
    setSubTab(SubTabChoices.Workspace)
    try {
      await createMeetingNotes(feedItem)
      if (
        feedItem.title === 'Email Autopilot' &&
        loggedEmailAutopilot &&
        getTotalClassifiedEmailsCount() <= 0
      ) {
        runEmailAutopilot()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const meetingNotesInProgress = new Set()

  const createMeetingNotes = async (feedItem: FeedItem) => {
    if (feedItem && feedItem.automation?.name === 'Meeting Prep') {
      if (!feedItem.id || meetingNotesInProgress.has(feedItem.id)) {
        return undefined
      }

      const hasMeetingNotes = feedItem.threads?.some(
        thread => thread.threadType === ThreadType.MEETING_NOTES,
      )

      if (!hasMeetingNotes) {
        try {
          meetingNotesInProgress.add(feedItem.id)

          const newThread = await createThread(
            new Date().getTime(),
            true,
            feedItem.id,
            'Meeting Notes',
            `${feedItem.getTitle()}, ${KNDateUtils.formatStandardDateTime(feedItem.timestamp)}`,
            ThreadType.MEETING_NOTES,
          )

          if (newThread) {
            const thread = {
              id: newThread.id,
              date: newThread.timestamp ? new Date(newThread.timestamp) : undefined,
              hideFollowUp: true,
              messages: [],
              isLoading: true,
              title: newThread.title,
              subtitle: newThread.subtitle,
              threadType: newThread.threadType,
            } as IThread
            insertThreadToFeedItem(feedItem, thread as IThread)
          }
          return newThread
        } finally {
          meetingNotesInProgress.delete(feedItem.id)
        }
      }
    }
    return undefined
  }

  const handleSuccessMessagesClassified = (
    emails: EmailDocument[],
    emailClassification: EmailClassification[],
  ) => {
    setEmailAutopilotStatus(prevState => ({
      ...prevState,
      progress: {
        current: Math.min(
          (prevState.progress?.current || 0) + emails.length,
          prevState.progress?.total ?? emails.length,
        ),
        total: prevState.progress?.total ?? emails.length,
      },
    }))

    const displayEmails = emailClassification
      .map(classification => {
        const email = emails.find(email => email.documentId === classification.documentId)
        const key: EmailImportance = classification.classification
        if (email && key !== null) {
          const displayEmail: DisplayEmail = {
            message: email,
            classification: classification,
          }
          return displayEmail
        }
        return null
      })
      .filter(value => value)

    setClassifiedEmails(prevState => {
      const newState = { ...prevState }

      const newThreadIds = new Set(
        displayEmails.map(email => email?.message.threadId).filter(Boolean),
      )

      const filteredState: Partial<Record<EmailImportance, DisplayEmail[]>> = {}

      Object.keys(newState).forEach(key => {
        const emails = newState[key as EmailImportance]
        if (emails) {
          filteredState[key as EmailImportance] = emails.filter(
            (email: DisplayEmail) => !newThreadIds.has(email.message.threadId),
          )
        }
      })

      displayEmails.forEach(displayEmail => {
        if (displayEmail && displayEmail.classification) {
          const key: EmailImportance = displayEmail.classification.classification
          filteredState[key] = [...(filteredState[key] || []), displayEmail]
          // Sort emails by date in descending order
          filteredState[key].sort((a, b) => {
            const dateA = new Date(a.message.date).getTime()
            const dateB = new Date(b.message.date).getTime()
            return dateB - dateA
          })
        }
      })

      return filteredState
    })

    displayEmails.forEach(displayEmail => {
      if (displayEmail && displayEmail.classification) {
        const key: EmailImportance = displayEmail.classification?.classification
        emailPriorityQueue.enqueue(displayEmail, importancePriority[key])
      }
    })
  }

  useEffect(() => {
    if (emailAutopilotStatus.status != 'complete' && emailAutopilotStatus.progress)
      if (emailAutopilotStatus.progress?.total <= emailAutopilotStatus.progress?.current)
        setEmailAutopilotStatus(prev => ({ ...prev, status: 'complete' }))
  }, [emailAutopilotStatus])

  const handleFailMessagesClassified = (emails: EmailDocument[], retry: number = 0) => {
    if (retry < MAX_RETRIES) {
      executeClassification(emails, retry + 1)
      return
    }

    setEmailAutopilotStatus(prevState => ({
      ...prevState,
      progress: {
        current: Math.min(
          (prevState.progress?.current || 0) + emails.length,
          prevState.progress?.total ?? emails.length,
        ),
        total: prevState.progress?.total ?? emails.length,
      },
    }))

    setClassifiedEmails(prevState => {
      prevState['UNCLASSIFIED'] = [
        ...(prevState['UNCLASSIFIED'] || []),
        ...emails.map(message => ({
          message: message,
          classification: null,
        })),
      ]
      return prevState
    })
  }

  const createEmailAutoPilot = async (): Promise<FeedItem> => {
    const feedItemReturn = await insertFeedItemAPI(new Date().getTime(), 'Email Autopilot')
    const feedItem = new FeedItem({
      id: feedItemReturn.id,
      timestamp: new Date(feedItemReturn.timestamp),
      threads: undefined,
      run: undefined,
      isLoading: false,
      title: feedItemReturn.title,
    })

    return feedItem
  }

  const executeClassification = async (batch: EmailDocument[], retry: number = 0) => {
    try {
      emailAutopilot.classifyEmails(batch, handleSuccessMessagesClassified, emails =>
        handleFailMessagesClassified(emails, retry),
      )
    } catch (error: any) {
      logError(new Error('Could not classify'), {
        additionalInfo: '',
        error: error.toString(),
      })
      handleFailMessagesClassified(batch, retry)
      console.error('Error classifying emails:', error)
    }
  }

  const updateRecentClassifiedEmails = useCallback(async () => {
    try {
      const dataFetcher = new DataFetcher()

      const allMessages = await dataFetcher.getRecentGmailMessages(3, 5000)

      if (allMessages.length === 0) {
        return
      }

      setClassifiedEmails(prevState => {
        const newState: Partial<Record<EmailImportance, DisplayEmail[]>> = { ...prevState }

        Object.keys(newState).forEach(category => {
          const emailImportanceCategory = category as EmailImportance
          const emails = newState[emailImportanceCategory]
          if (emails) {
            newState[emailImportanceCategory] = emails.map((displayEmail: DisplayEmail) => {
              const updatedMessage = allMessages.find(
                message => message.documentId === displayEmail.message.documentId,
              )
              if (updatedMessage) {
                return {
                  ...displayEmail,
                  message: updatedMessage,
                  wasReplySent: !(
                    (updatedMessage.isStarred || !updatedMessage.isRead) &&
                    !updatedMessage.isArchived &&
                    !updatedMessage.isDeleted
                  ),
                }
              }
              return displayEmail
            })
          }
        })

        return newState
      })
    } catch (error) {
      logError(new Error('Error updating emails status'), {
        additionalInfo: '',
        error: error instanceof Error ? error.toString() : String(error),
      })
    }
  }, [classifiedEmails])

  const runEmailAutopilot = async () => {
    const dataFetcher = new DataFetcher()
    // const isSynced = handleSyncSources([AutomationDataSources.GMAIL])
    await updateRecentClassifiedEmails()
    if (emailAutopilotStatus.status === 'classifying-emails') {
      return
    }

    try {
      setEmailAutopilotStatus({ status: 'fetching-emails' })
      let allMessages = await dataFetcher.getRecentGmailMessages(2, 5000)

      if (allMessages.length === emailAutopilotStatus.progress?.total) {
        setEmailAutopilotStatus({ status: 'complete' })
        return
      }

      if (allMessages.length === 0) {
        setEmailAutopilotStatus({ status: 'complete' })
        return
      }

      allMessages = allMessages.filter(
        message => message.isStarred || (!message.isRead && !message.isArchived),
      )

      let messages = []
      if (lastEmailId.current) {
        const lastEmailIndex = allMessages.findIndex(
          message => message.documentId === lastEmailId.current,
        )
        messages = allMessages.slice(0, lastEmailIndex)
      } else {
        messages = allMessages
      }
      lastEmailId.current = allMessages[0].documentId

      const emailThreadsSet = new Set<EmailDocument>()

      for (const message of messages) {
        try {
          const threadResponse = await getEmailThread(message.documentId)
          if (threadResponse) {
            threadResponse.forEach(doc => {
              emailThreadsSet.add(doc)
            })
          }
        } catch (error) {
          logError(
            new Error(`Failed to fetch email thread for document ID ${message.documentId}:`),
            {
              additionalInfo: '',
              error: error instanceof Error ? error.toString() : String(error),
            },
          )
        }
      }

      let newMessages = Array.from(emailThreadsSet).filter(
        message => !message.sender.includes(userEmail),
      )

      const uniqueUuids: Record<string, number> = {}

      newMessages = newMessages.reduce((finalEmails, message) => {
        if (uniqueUuids[message.emailUid]) {
          const index = uniqueUuids[message.emailUid]
          finalEmails[index] = finalEmails[index].date > message.date ? finalEmails[index] : message
        } else {
          const pos = finalEmails.push(message)
          uniqueUuids[message.emailUid] = pos - 1
        }
        return finalEmails
      }, [] as EmailDocument[])

      if (newMessages.length === 0) {
        setEmailAutopilotStatus({ status: 'complete' })
        return
      }

      setEmailAutopilotStatus(prevState => ({
        status: 'classifying-emails',
        progress: {
          current: prevState.progress?.current ?? 0,
          total: prevState.progress?.total
            ? prevState.progress?.total + newMessages.length
            : newMessages.length,
        },
      }))

      const BATCH_SIZE = 3
      for (let i = 0; i < newMessages.length; i += BATCH_SIZE) {
        const batch = newMessages.slice(i, i + BATCH_SIZE)
        executeClassification(batch)

        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setTimeout(() => {
        setEmailAutopilotStatus(prevState => ({ ...prevState, status: 'complete' }))
        handleOpenToastr(
          <span>Email Autopilot finished syncing - let's send some emails!</span>,
          undefined,
          3000,
          false,
          {
            bgcolor: '#fdfdfd',
            color: '#3F3F46',
            'font-weight': '700',
          },
        )
      }, 300000)
    } catch (error) {
      setEmailAutopilotStatus({ status: 'error' })
      if (error instanceof HttpError) {
        logError(new Error('insertFeedItemAPI or createThread failed'), {
          additionalInfo: 'Error occurred while creating Email Autopilot FeedItem.',
          error: error.message,
        })
        handleErrorContact('Error starting Email Autopilot, please try again later.')
      }
      throw error
    }
  }

  const unselectFeedItem = () => {
    setSelectedFeedItem(null)
  }

  const currentFeedItem = useCallback(() => {
    return selectedFeedItem
  }, [selectedFeedItem])

  // const handleInsertNewMessagesFeedItem = useCallback(
  //   (feedItem: FeedItem, newMessages: KNChatMessage[], thread?: IThread) => {
  //     const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
  //     if (thread) {
  //       thread.messages = [...thread.messages, ...newMessages]
  //       thread.isLoading = false
  //     }
  //     feedItem.isLoading = false
  //     setFeedContent(prevState => {
  //       return {
  //         ...prevState,
  //         [timelineKey]: feedItem.id
  //           ? KNDateUtils.sortByTimestamp(
  //               [...prevState[timelineKey].filter(item => item.id !== feedItem.id), feedItem],
  //               false,
  //             )
  //           : KNDateUtils.sortByTimestamp([...(prevState[timelineKey] || []), feedItem], false),
  //       }
  //     })
  //   },
  //   [],
  // )

  const sucessHandler = async (
    feedItem: FeedItem,
    userEmail: string,
    userPrompt: string,
    botPrompt: string,
    documents: number[],
    userPromptFacade?: string,
    threadId?: number,
  ) => {
    const runId = feedItem.run?.id
    const updatedFeedItem = await insertAutomationRun({
      automationUuid: feedItem.run?.automationUuid
        ? automations[feedItem.run?.automationUuid].getUuid()
        : 'undefined',
      executionDate: new Date(),
      userEmail,
      userPrompt,
      userPromptFacade,
      botPrompt,
      threadId,
      runId,
      documents,
      feed_item_id: feedItem.id,
    })
    if (updatedFeedItem && updatedFeedItem.threads) {
      updateFeedItemThreads(feedItem, updatedFeedItem.threads)
    }
  }

  const errorCallback = async () => {
    refreshFeedItems()
  }

  const handleAutomationFeed = async (feedItem: FeedItem, automation?: Automation) => {
    setFeedItemIsLoading(feedItem, true)
    try {
      if (automation) {
        handleSyncKnapSources(automation)

        const needsAuth = await handleAutomation({
          automation: automation,
          trigger: AutomationTrigger.CLICK,
          run: feedItem.run,
          args: {
            feedItem,
            errorCallback,
            sucessHandler,
          },
        })

        if (needsAuth) {
          setFeedItemIsLoading(feedItem, false)
          return
        }
      }
    } catch {
      setFeedItemIsLoading(feedItem, false)
    }
  }

  const handleThreadFollowUpMessage = async (
    text: string,
    feedItem: FeedItem,
    documentIds?: number[],
    threadId?: number,
  ) => {
    KNAnalytics.trackEvent('SubmitFollowUpMessage', { threadId })

    if (userEmail === '') {
      throw new Error('User must be logged')
    }
    await insertMessageToFeedItem(feedItem, text, new Date(), userEmail, documentIds, threadId)
    setFeedItemIsLoading(feedItem, true)
    const messageStreamCallback = () => null
    const messageFinishCallback = async (message: string) => {
      try {
        await insertMessageToFeedItem(
          feedItem,
          message,
          new Date(),
          undefined,
          documentIds,
          threadId,
        )
      } catch {
        errorCallback()
      }
    }

    // TODO: add user recovery logic here
    const errorCallbackFollowUp = (error: Error) => {
      errorCallback()
      handleError(error)
    }
    const prompt =
      text + ' Limit your response to 200 characters and use markdown to structure your answer.'
    addToLLMQueue({
      documents: [],
      additionalDocuments: [],
      semanticSearchQuery: undefined,
      prompt: prompt,
      threadId: threadId,
      messageStreamCallback,
      messageFinishCallback,
      errorCallback: errorCallbackFollowUp,
    })
  }

  const insertMessageToFeedItem = async (
    feedItem: FeedItem,
    message: string,
    timestamp: Date,
    userEmail: string | undefined,
    documentIds?: number[],
    threadId?: number,
  ) => {
    const messageKN = {
      user_type: userEmail ? 'user' : 'bot',
      content_type: 'text',
      text: message,
      date: timestamp,
      document_ids: documentIds,
    } as KNChatMessage

    if (threadId) {
      const new_thread = await createMessage(
        messageKN,
        userEmail,
        timestamp.getTime(),
        documentIds,
        threadId,
      )
      if (new_thread) {
        feedItem.threads = feedItem.threads || []
        const existingThreadIndex = feedItem.threads.findIndex(
          thread => thread.id === new_thread.id,
        )
        if (existingThreadIndex !== -1) {
          feedItem.threads[existingThreadIndex] = new_thread
        } else {
          feedItem.threads.push(new_thread)
        }
      }
      feedItem.timestamp = feedItem.timestamp ? feedItem.timestamp : timestamp
      feedItem.isLoading = false

      const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
      setFeedContent(prevState => {
        if (!prevState[timelineKey]) {
          prevState[timelineKey] = []
        }
        prevState[timelineKey] = prevState[timelineKey].map(item =>
          item.id === feedItem.id && !feedItem.run ? feedItem : item,
        )
        return { ...prevState }
      })
    }
  }

  const insertFeedItem = async (
    timestamp: number,
    hideFollowUp: boolean,
    title: string,
    mockThread: boolean = false,
    automation?: Automation,
  ) => {
    try {
      const feedItemReturn = await insertFeedItemAPI(timestamp, title)

      const newThread = await createThread(timestamp, hideFollowUp, feedItemReturn.id)
      let threads = undefined
      if (newThread) {
        threads = [
          {
            id: newThread.id,
            date: newThread.timestamp ? new Date(newThread.timestamp) : undefined,
            hideFollowUp: true,
            messages: [],
            isLoading: true,
            title: newThread.title,
            subtitle: newThread.subtitle,
            threadType: newThread.threadType,
          },
        ] as IThread[]
      }
      const feedItem = new FeedItem({
        id: feedItemReturn.id,
        timestamp: new Date(feedItemReturn.timestamp),
        threads: mockThread
          ? [
              {
                id: 1,
                date: new Date(),
                hideFollowUp: true,
                messages: [],
                isLoading: true,
                threadType: ThreadType.CHAT,
              },
            ]
          : threads,
        run: undefined,
        isLoading: true,
        title: feedItemReturn.title,
        automation: automation,
      })
      const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
      await setFeedContent(prevState => {
        if (!prevState[timelineKey]) {
          prevState[timelineKey] = []
        }
        const existingFeedItem = prevState[timelineKey].find(item => item.id === feedItem.id)
        if (!existingFeedItem) {
          prevState[timelineKey].push(feedItem)
          prevState[timelineKey] = KNDateUtils.sortByTimestamp(prevState[timelineKey])
        }
        return { ...prevState }
      })
      setSelectedFeedItem(feedItem)
      setSubTab(SubTabChoices.Workspace)
      return { feedItem: feedItem, threadId: feedItem.threads?.[0].id }
    } catch (error) {
      if (error instanceof HttpError) {
        logError(new Error('insertFeedItemAPI or createThread failed'), {
          additionalInfo: 'Error occurred while inserting feed item and thread.',
          error: error.message,
        })
      }
      throw error
    }
  }

  const updateFeedItemThreads = useCallback((feedItem: FeedItem, threads: IThread[]) => {
    feedItem.isLoading = false
    feedItem.threads = threads

    const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
    setFeedContent(prevState => {
      prevState[timelineKey] = prevState[timelineKey].map(item =>
        item.id === feedItem.id ? feedItem : item,
      )
      return prevState
    })
  }, [])

  const insertThreadToFeedItem = useCallback((feedItem: FeedItem, newThread: IThread) => {
    feedItem.threads = feedItem.threads ? [...feedItem.threads, newThread] : [newThread]
    feedItem.isLoading = false
    const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
    setFeedContent(prevState => {
      if (!prevState[timelineKey]) {
        prevState[timelineKey] = []
      }
      prevState[timelineKey] = prevState[timelineKey].map(item =>
        item.run && item.id === feedItem.id ? feedItem : item,
      )
      return { ...prevState }
    })
  }, [])

  const refreshFeedItems = async () => {
    try {
      const recordingFeedItems = await isRecordingStatus()
      const fetchedFeedItems = await getFeedItems()
      let hasEmailAutopilot = false
      const groupedFeedItems = fetchedFeedItems.reduce(
        (acc: Record<string, FeedItem[]>, item: FeedItem) => {
          if (item.title == 'Email Autopilot') {
            hasEmailAutopilot = true
            if (STATIONARY_ITEMS in acc) {
              if (!acc[STATIONARY_ITEMS].find(currentItem => item.title == currentItem.title)) {
                acc[STATIONARY_ITEMS].push(item)
              }
            } else {
              acc[STATIONARY_ITEMS] = [item]
            }
          } else {
            const runParams =
              typeof item.run?.runParams === 'string'
                ? JSON.parse(item.run.runParams)
                : item.run?.runParams

            item.isRecording =
              recordingFeedItems &&
              recordingFeedItems.isRecording === true &&
              item.id === recordingFeedItems.feedItemId
                ? true
                : false
            item.calendarEvent = runParams?.event_id ? meetings?.[runParams.event_id] : undefined

            const timelineKey = KNDateUtils.timelineKeyFromTimestamp(item.timestamp)
            acc[timelineKey] = acc[timelineKey] || []
            acc[timelineKey].push(item)
          }
          return acc
        },
        {},
      )

      Object.keys(groupedFeedItems).forEach(key => {
        groupedFeedItems[key] = KNDateUtils.sortByTimestamp(groupedFeedItems[key])
      })

      if (userEmail && !hasEmailAutopilot) {
        const emailAutopilotItem = feed.createEmailAutoPilot()
        groupedFeedItems[STATIONARY_ITEMS] = [emailAutopilotItem]
      }
      setFeedContent(groupedFeedItems)
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          additionalInfo: '',
          error: error.message,
        })
      } else {
        logError(new Error('An unknown error occurred while fetching Feed.'), {
          additionalInfo: 'An unknown error occurred while fetching Feed.',
        })
      }
      return []
    }
  }

  const setFeedItemIsLoading = useCallback((feedItem: FeedItem, isLoading: boolean) => {
    const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
    feedItem.isLoading = isLoading
    setFeedContent(prevState => {
      return {
        ...prevState,
        [timelineKey]: feedItem.id
          ? KNDateUtils.sortByTimestamp(
              [...prevState[timelineKey].filter(item => item.id !== feedItem.id), feedItem],
              false,
            )
          : KNDateUtils.sortByTimestamp([...(prevState[timelineKey] || []), feedItem], false),
      }
    })
  }, [])

  const handleAutomationsFeedScheduleService = useCallback(
    async (now: Date) => {
      for (const feedItem of Object.values(feedContent)) {
        const readyRuns = feedItem.filter(item =>
          item.run &&
          !item.run.executionDate &&
          item.run.scheduleDate &&
          item.run.scheduleDate.getTime() < now.getTime() &&
          item.run?.automationUuid
            ? automations[item.run?.automationUuid].getIsActive()
            : false,
        )
        for (const feedItem of readyRuns) {
          // TODO: use handleFutureAutomation in the future,need to understand automationTigger impact
          const automation = feedItem.run?.automationUuid
            ? automations[feedItem.run?.automationUuid]
            : undefined
          const run = feedItem.run
          if (feedItem.run) {
            feedItem.run.executionDate = now
          }
          if (automation) {
            await handleAutomation({
              automation,
              trigger: AutomationTrigger.CADENCE,
              run,
              args: {
                feedItem,
                errorCallback,
                sucessHandler,
              },
            })
          }
        }
      }
    },
    [automations, handleAutomation],
  )

  const getTodayKey = useCallback(() => {
    const feedContentKeys = Object.entries(feedContent).map(([key, value]) => ({
      key,
      timestamp: value[0].timestamp,
    }))

    const todayKey = feedContentKeys
      .filter(item => item.key.includes('Today'))
      .map(item => item.key)
    return todayKey[0] || 'Today'
  }, [feedContent])

  useEffect(() => {
    const initializeFeed = async () => {
      refreshFeedItems()
    }
    initializeFeed()
  }, [automations, meetings])

  const feedContentKeys = Object.entries(feedContent).map(([key, value]) => ({
    key,
    timestamp: value[0].timestamp,
  }))

  const futureDays = feedContentKeys
    .filter(item => {
      if (
        item.key.includes('Today') ||
        item.key.includes('Yesterday') ||
        item.key === 'COMING UP'
      ) {
        return false
      }
      return KNDateUtils.isFutureDay(item.timestamp)
    })
    .map(item => item.key)

  const pastDays = feedContentKeys
    .filter(item => {
      if (
        item.key.includes('Today') ||
        item.key.includes('Yesterday') ||
        item.key.includes('Tomorrow')
      ) {
        return false
      }

      return KNDateUtils.isPastDay(item.timestamp)
    })
    .map(item => item.key)

  const isRecentDate = (date: string, showPastDates: boolean, showFutureDates: boolean) => {
    const recentDates = ['Today', 'Yesterday', 'COMING UP']
    if (showPastDates && showFutureDates) {
      return pastDays.includes(date) || futureDays.includes(date) || recentDates.includes(date)
    } else if (showPastDates) {
      return pastDays.includes(date) || recentDates.some(recentDate => date.includes(recentDate))
    } else if (showFutureDates) {
      return futureDays.includes(date) || recentDates.some(recentDate => date.includes(recentDate))
    }
    return recentDates.includes(date)
  }

  const checkSyncedSources = useCallback(
    (keys: (string | undefined)[]) => {
      const nonSyncedStates = [
        ConnectionStates.SYNCING,
        ConnectionStates.FAILED,
        ConnectionStates.FAILED,
      ]
      for (const key of keys) {
        if (key) {
          const connection = connections[key]
          if (
            nonSyncedStates.some(state => connection !== undefined && state === connection.state)
          ) {
            return false
          }
        }
      }
      return true
    },
    [connections],
  )

  const OpenNotSyncedToast = () => {
    handleOpenToastr(
      <span>Answers may be incomplete as some sources are still syncing.</span>,
      undefined,
      3000,
      false,
      { bgcolor: '#e5e7eb', color: '#3F3F46', 'font-weight': '700' },
      'See status',
      handleSyncStatusToastr,
    )
  }

  const handleSyncKnapSources = (automation: Automation) => {
    const sources = automation.getDataSources()
    const sourcesConnections = sources.map((source: string) =>
      convertAutomationDataSourceToConnectionKey(source),
    )
    const synced = checkSyncedSources(sourcesConnections)

    if (!synced) {
      OpenNotSyncedToast()
      return true
    }

    return false
  }

  // Commented to fix build errors
  // const handleSyncSources = (sources: AutomationDataSources[]) => {
  //   const sourcesConnections = sources.map((source: AutomationDataSources) =>
  //     convertAutomationDataSourceToConnectionKey(source),
  //   )
  //   const synced = checkSyncedSources(sourcesConnections)

  //   if (!synced) {
  //     // OpenNotSyncedToast()
  //     return false
  //   }

  //   return true
  // }

  const setIsRecording = useCallback(
    (feedItem: FeedItem, isRecording: boolean | undefined = undefined) => {
      const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
      feedItem.isRecording = isRecording ? isRecording : !feedItem.isRecording
      setRecordingFeedItem(feedItem.isRecording ? feedItem : null)
      setFeedContent(prevState => {
        const updatedFeedItems = prevState[timelineKey].map(item => {
          if (item.id === feedItem.id) {
            return feedItem
          }
          return item
        })

        return {
          ...prevState,
          [timelineKey]: updatedFeedItems,
        }
      })
    },
    [],
  )

  const handleClickRecording = () => {
    setSelectedFeedItem(recordingFeedItem)
    setSubTab(SubTabChoices.Workspace)
  }

  const getRecordingFeedItemTitle = () => {
    return recordingFeedItem?.getTitle()
  }

  const createNewMeeting = async () => {
    try {
      const feedItemReturn = await insertFeedItemAPI(new Date().getTime(), 'Untitled Meeting')
      const newThread = await createThread(
        new Date().getTime(),
        true,
        feedItemReturn.id,
        '',
        'Untitled Meeting',
        ThreadType.MEETING_NOTES,
      )
      if (newThread) {
        const thread = {
          id: newThread.id,
          date: newThread.timestamp ? new Date(newThread.timestamp) : undefined,
          hideFollowUp: true,
          messages: [],
          isLoading: true,
          title: newThread.title,
          subtitle: newThread.subtitle,
          threadType: newThread.threadType,
        } as IThread
        const feedItem = new FeedItem({
          id: feedItemReturn.id,
          timestamp: new Date(feedItemReturn.timestamp),
          threads: [thread],
          run: undefined,
          isLoading: false,
          title: feedItemReturn.title,
        })
        const timelineKey = KNDateUtils.timelineKeyFromTimestamp(feedItem.timestamp)
        setFeedContent(prevState => {
          if (!prevState[timelineKey]) {
            prevState[timelineKey] = []
          }
          const existingFeedItem = prevState[timelineKey].find(item => item.id === feedItem.id)
          if (!existingFeedItem) {
            prevState[timelineKey].push(feedItem)
            prevState[timelineKey] = KNDateUtils.sortByTimestamp(prevState[timelineKey])
          }
          return { ...prevState }
        })

        const eventId = feedItem.run?.runParams
          ? (JSON.parse(feedItem.run.runParams as string).event_id ?? 0)
          : 0
        const saveTranscript = await shouldSaveTranscript()

        await startRecord(thread.id, feedItem.id, eventId, saveTranscript)
        setIsRecording(feedItem)
        setSelectedFeedItem(feedItem)
        setSubTab(SubTabChoices.Workspace)
        return { threadId: thread.id, feedItemId: feedItem.id }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        logError(new Error('insertFeedItemAPI or createThread failed'), {
          additionalInfo: 'Error occurred while creating new meeting.',
          error: error.message,
        })
        handleErrorContact('Error creating new meeting, please try again later.')
      }
      throw error
    }
  }

  const renameMeeting = async (threadId: number, newTitle: string, feedItemId?: number) => {
    if (!feedItemId) return

    try {
      let updatedFeedItem: FeedItem | undefined
      let updatedThread: IThread | undefined

      for (const feedItems of Object.values(feedContent)) {
        const selectedFeedItem = feedItems.find(item => item.id === feedItemId)
        if (selectedFeedItem) {
          const updatedThreads = selectedFeedItem.threads?.map(thread => {
            if (thread.id === threadId) {
              updatedThread = { ...thread, subtitle: newTitle }
              return { ...thread, subtitle: newTitle }
            }
            return thread
          })
          updatedFeedItem = new FeedItem({
            ...selectedFeedItem,
            title: newTitle,
            threads: updatedThreads,
          })
          break
        }
      }

      await updateFeedItem(feedItemId, updatedFeedItem!)
      await updateThread(threadId, updatedThread!)

      setFeedContent(prevState => {
        const updatedState = { ...prevState }

        for (const [timelineKey, feedItems] of Object.entries(prevState)) {
          updatedState[timelineKey] = feedItems.map(feedItem => {
            if (feedItem.id !== feedItemId) return feedItem

            const updatedThreads = feedItem.threads?.map(thread => {
              if (thread.id === threadId && updatedThread) {
                return updatedThread
              }
              return thread
            })

            return new FeedItem({
              ...feedItem,
              title: newTitle,
              threads: updatedThreads,
            })
          })
        }

        return updatedState
      })
    } catch (error) {
      if (error instanceof HttpError) {
        logError(new Error('updateFeedItem or updateThread failed'), {
          additionalInfo: 'Error occurred while updating meeting name.',
          error: 'updateFeedItem or updateThread failed',
        })
        handleErrorContact('Error updating meeting name, please try again.')
      }
    }
  }

  const setThread = async (updatedThread: IThread, feedItemId?: number) => {
    if (!updatedThread || !updatedThread.id || !feedItemId) {
      return
    }

    try {
      setFeedContent(prevState => {
        const updatedState = { ...prevState }

        for (const [timelineKey, feedItems] of Object.entries(prevState)) {
          updatedState[timelineKey] = feedItems.map(feedItem => {
            if (feedItem.id !== feedItemId) return feedItem

            feedItem.threads?.map(thread => {
              if (updatedThread && thread.id === updatedThread.id) {
                return updatedThread
              }
              return thread
            })

            return feedItem
          })
        }
        return updatedState
      })

      await updateThread(updatedThread.id, updatedThread!)
    } catch (error) {
      if (error instanceof HttpError) {
        logError(new Error('setThread failed'), {
          additionalInfo: 'Error occurred while updating Thread.',
          error: 'setThread failed',
        })
        handleErrorContact('Error updating Thread, please try again.')
      }
    }
  }

  const updateFeedItemTitle = useCallback(
    async (_key: string, itemId: number, newTitle: string) => {
      if (itemId === undefined || itemId < 0) return

      try {
        let targetFeedItem: FeedItem | undefined

        for (const feedItems of Object.values(feedContent)) {
          const foundItem = feedItems.find(item => item.id === itemId)
          if (foundItem) {
            targetFeedItem = foundItem
            break
          }
        }

        if (!targetFeedItem) {
          console.error(`Feed item with ID ${itemId} not found`)
          return
        }

        const threadId =
          targetFeedItem.threads && targetFeedItem.threads.length > 0
            ? targetFeedItem.threads[0].id
            : undefined

        if (threadId) {
          await renameMeeting(threadId, newTitle, itemId)
        } else {
          const updatedFeedItem = new FeedItem({
            ...targetFeedItem,
            title: newTitle,
          })

          await updateFeedItem(itemId, updatedFeedItem)

          setFeedContent(prevState => {
            const newState = { ...prevState }

            for (const timelineKey of Object.keys(newState)) {
              const itemIndex = newState[timelineKey].findIndex(item => item.id === itemId)

              if (itemIndex !== -1) {
                newState[timelineKey] = [
                  ...newState[timelineKey].slice(0, itemIndex),
                  updatedFeedItem,
                  ...newState[timelineKey].slice(itemIndex + 1),
                ]
                break
              }
            }

            return newState
          })
        }
      } catch (error) {
        console.error('Error updating feed item title:', error)
        if (error instanceof HttpError) {
          logError(new Error('Error updating feed item title'), {
            additionalInfo: 'Error occurred while updating feed item title.',
            error: error.message,
          })
          handleErrorContact('Error updating title, please try again.')
        }
      }
    },
    [feedContent, setFeedContent, renameMeeting],
  )

  const deleteFeedItemFromState = useCallback(
    async (itemId: number) => {
      try {
        await deleteFeedItem(itemId)

        setFeedContent(prevState => {
          const newState = { ...prevState }

          for (const key of Object.keys(newState)) {
            newState[key] = newState[key].filter(item => item.id !== itemId)
          }

          return newState
        })
      } catch (error) {
        logError(new Error('Failed to delete item.'), {
          additionalInfo: '',
          error: error instanceof Error ? error.toString() : String(error),
        })
        handleErrorContact('Error deleting item, please try again.')
      }
    },
    [setFeedContent, handleErrorContact],
  )

  const takeEmailAction = (
    emailUid: string,
    action: AutopilotActions,
    userProvider: ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
    draftedReply?: string,
  ) => {
    setClassifiedEmails(prevState => {
      const newState = { ...prevState }

      // Search through all importance categories
      Object.keys(newState).forEach(importance => {
        const emails = newState[importance as EmailImportance]
        if (!emails) return

        // Find and update the matching email
        const emailIndex = emails.findIndex(email => email.message.emailUid === emailUid)

        if (emailIndex !== -1) {
          const updatedEmail = { ...emails[emailIndex] }
          const dataFetcher = new DataFetcher()
          if (ignore_actions.includes(action)) {
            updatedEmail.wasIgnored = true
            dataFetcher
              .postMarkEmailRead(userEmail, emailUid, userProvider, action)
              .catch(error => {
                console.error('Fail to mark email as read ', error)
              })
          } else if (reply_actions.includes(action)) {
            updatedEmail.wasReplySent = true
            dataFetcher
              .postMarkEmailRead(userEmail, emailUid, userProvider, action)
              .catch(error => {
                console.error('Fail to mark email as read ', error)
              })
          } else if (action === 'GENERATE_DRAFT_REPLY' && draftedReply) {
            updatedEmail.draftedReply = draftedReply
          }

          emails[emailIndex] = updatedEmail
        }
      })

      return newState
    })
  }

  const getNextMeetId = useCallback(() => {
    const now = new Date().getTime()
    const allItems = Object.values(feedContent)
      .flat()
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const nextItem = allItems.find(item => {
      return item.timestamp.getTime() > now
    })

    return nextItem?.id
  }, [feedContent])

  const currentMeetId = useCallback(() => {
    const now = new Date().getTime()

    const allItems = Object.values(feedContent)
      .flat()
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    const currentItems = allItems
      .filter(item => item.timestamp.getTime() <= now)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const currentItem = currentItems[0]
    if (!currentItem?.calendarEvent) {
      return undefined
    }

    const startTime = currentItem.calendarEvent.start * 1000
    const endTime = currentItem.calendarEvent.end * 1000
    const isEventInProgress = now >= startTime && now <= endTime

    return isEventInProgress ? currentItem.id : undefined
  }, [feedContent])

  const loggedEmailAutopilot = useMemo(() => {
    return connections[ConnectionKeys.GOOGLE_GMAIL] || connections[ConnectionKeys.MICROSOFT_OUTLOOK]
      ? true
      : false
  }, [connections])

  const feed: IFeed = {
    feedContent,
    insertFeedItem,
    handleAutomationFeed,
    insertMessageToFeedItem,
    errorCallback,
    handleThreadFollowUpMessage,
    isRecentDate,
    selectFeedItem,
    currentFeedItem,
    googleAuthControls,
    unselectFeedItem,
    handleSyncKnapSources,
    subTab,
    setSubTab,
    setIsRecording,
    handleClickRecording,
    getRecordingFeedItemTitle,
    createNewMeeting,
    renameMeeting,
    refreshFeedItems,
    runEmailAutopilot,
    createEmailAutoPilot,
    classifiedEmails,
    classificationActions,
    updateClassificationActions,
    emailAutopilotStatus,
    setEmailAutopilotStatus,
    takeEmailAction,
    emailAutopilot,
    selectedEmailCategory,
    setSelectedEmailCategory,
    loggedEmailAutopilot,
    createMeetingNotes,
    currentMeetId,
    getNextMeetId,
    updateFeedItemTitle,
    deleteFeedItemFromState,
    setThread,
    selectEmailCategory,
    getTodayKey,
  }

  return {
    feed,
    meetings,
    syncMeetings,
    handleAutomationsFeedScheduleService,
    updateMeetingStatuses,
  }
}
