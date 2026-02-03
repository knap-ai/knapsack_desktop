import { IThread, KNChatMessage, ThreadType } from 'src/api/threads'
import { Automation, AutomationRun } from 'src/automations/automation'
import {
  CalendarEvents,
  Meeting,
  serializeCalendarEventToMeeting,
} from 'src/hooks/dataSources/useCalendar'
import { KN_API_FEED_ITEM } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import { HttpError, retryFetch } from 'src/utils/retryUtils'

type FeedItemProps = {
  id?: number
  title: string
  timestamp: Date
  threads?: IThread[]
  run?: AutomationRun
  isLoading?: boolean
  calendarEvent?: Meeting
  automation?: Automation
  isRecording?: boolean
  deleted?: boolean
}

export const serializeThreadWithMessages = (threadData: {
  thread: {
    id: number
    timestamp: number
    hideFollowUp: boolean
    threadType: ThreadType
    title: string
    subtitle: string
    recorded: boolean
    savedTranscript: string
    promptTemplate: string
  }
  messages: {
    id: number
    userId: number
    content: string
    contentFacade: string
    timestamp: number
  }[]
}) => {
  let messages: KNChatMessage[] = []
  if (threadData.messages.length > 0) {
    messages = threadData.messages
      .map(msg => ({
        id: msg.id,
        user_type: msg.userId > 0 ? 'user' : 'bot',
        content_type: 'text',
        text: msg.contentFacade ?? msg.content,
        date: new Date(msg.timestamp * 1000),
      }))
      .sort((a, b) => a.id - b.id) as KNChatMessage[]
  }
  const thread = {
    id: threadData.thread.id,
    date: new Date(threadData.thread.timestamp),
    messages: messages,
    hideFollowUp: threadData.thread.hideFollowUp,
    threadType: threadData.thread.threadType,
    title: threadData.thread.title,
    subtitle: threadData.thread.subtitle,
    recorded: threadData.thread.recorded,
    savedTranscript: threadData.thread.savedTranscript,
    promptTemplate: threadData.thread.promptTemplate,
  }
  return thread
}

export const serializeFeedItem = (feedItemData: {
  feedItem: {
    deleted: boolean | undefined
    id: number
    timestamp: number
    title: string
  }
  threads:
    | {
        thread: {
          id: number
          timestamp: number
          hideFollowUp: boolean
          threadType: ThreadType
          title: string
          subtitle: string
          recorded: boolean
          savedTranscript: string
          promptTemplate: string
        }
        messages: {
          id: number
          userId: number
          content: string
          contentFacade: string
          timestamp: number
        }[]
      }[]
    | null
  run: {
    id: number
    date: number
    userId: number
    threadId: number
    scheduleTimestamp: number
    executionTimestamp?: number
    runParams: string
    automationUuid: string
  } | null
  calendarEvent: CalendarEvents | null
  automation: Automation | null
}) => {
  let run: AutomationRun | undefined = undefined
  if (feedItemData.run !== null) {
    run = {
      id: feedItemData.run.id,
      scheduleDate: new Date(feedItemData.run.scheduleTimestamp),
      executionDate: feedItemData.run.executionTimestamp
        ? new Date(feedItemData.run.executionTimestamp)
        : undefined,
      runParams: feedItemData.run.runParams,
      automationUuid: feedItemData.run.automationUuid,
    } as AutomationRun
  }

  let threads: IThread[] | undefined = undefined
  if (feedItemData.threads !== null) {
    threads = feedItemData.threads.map(threadData => {
      return serializeThreadWithMessages(threadData)
    })
  }
  //TODO: remove Match in the future because is a fallback to old meetings title
  const match = feedItemData.feedItem.title.match(/^(.*), \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} .+$/)
  const feedItemTitle = match ? match[1] : feedItemData.feedItem.title

  const event =
    feedItemData.calendarEvent !== null
      ? serializeCalendarEventToMeeting(feedItemData.calendarEvent)
      : undefined
  const feedItem = new FeedItem({
    id: feedItemData.feedItem.id,
    timestamp: new Date(feedItemData.feedItem.timestamp),
    title: feedItemTitle,
    threads,
    run,
    isLoading: false,
    calendarEvent: event,
    automation: feedItemData.automation ? (feedItemData.automation as Automation) : undefined,
    isRecording: false,
    deleted: feedItemData.feedItem.deleted,
  })
  return feedItem
}

export async function getFeedItems() {
  try {
    const response = await retryFetch(KN_API_FEED_ITEM, {
      method: 'GET',
    })
    const data = await response.json()
    if (!data || data['success'] !== true) {
      const error = new HttpError(response.status, data.message, data.error_code)
      logError(error, {
        additionalInfo: 'Error occurred while fetching feed item',
        error: data.message,
      })
      throw error
    }
    return data.data.map(serializeFeedItem)
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      logError(error, {
        additionalInfo: 'Error occurred while fetching feed item',
        error: error.message,
      })
      throw error
    }
    const finalError = new HttpError(
      500,
      'An unexpected error occurred while fetching feed item',
      'UNKWON_ERROR',
    )
    logError(finalError, {
      additionalInfo: 'Error occurred while fetching feed item',
      error: 'An unexpected error occurred while fetching feed item',
    })
    throw finalError
  }
}

export async function insertFeedItemAPI(timestamp: number, title: string) {
  try {
    const response = await retryFetch(KN_API_FEED_ITEM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        timestamp: timestamp,
      }),
    })
    const data = await response.json()
    if (!data || data['success'] !== true) {
      const error = new HttpError(response.status, data.message, data.error_code)
      logError(error, {
        additionalInfo: 'Error occurred while inserting feed item',
        error: data.message,
      })
      throw error
    }
    return data.data
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      logError(error, {
        additionalInfo: 'Error occurred while inserting feed item',
        error: error.message,
      })
      throw error
    }
    const finalError = new HttpError(
      500,
      'An unexpected error occurred while inserting feed item',
      'UNKWON_ERROR',
    )
    logError(finalError, {
      additionalInfo: 'Error occurred while inserting feed item',
      error: 'An unexpected error occurred while inserting feed item',
    })
    throw finalError
  }
}

const serializeBackendFeedItem = (feedItem: FeedItem) => {
  return {
    id: feedItem.id,
    timestamp: feedItem.timestamp ? feedItem.timestamp.getTime() : null,
    title: feedItem.title,
    deleted: feedItem.deleted || null,
  }
}

export async function updateFeedItem(feedItemId: number, feedItem: FeedItem) {
  try {
    const response = await retryFetch(KN_API_FEED_ITEM + '/' + String(feedItemId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feed_item: serializeBackendFeedItem(feedItem) }),
    })

    const data = await response.json()
    if (!data || data.success !== true) {
      const error = new HttpError(response.status, data.message, data.error_code)
      logError(error, {
        additionalInfo: 'Error occurred while updating feed item',
        error: data.message,
      })
      throw error
    }
    return true
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      logError(error, {
        additionalInfo: 'Error occurred while updating feed item',
        error: error.message,
      })
      throw error
    }
    const finalError = new HttpError(
      500,
      'An unexpected error occurred while updating feed item',
      'UNKWON_ERROR',
    )
    logError(finalError, {
      additionalInfo: 'Error occurred while updating feed item',
      error: 'An unexpected error occurred while updating feed item',
    })
    throw finalError
  }
}

export async function deleteFeedItem(feedItemId: number): Promise<boolean> {
  const payload = {
    feed_item: {
      id: feedItemId,
      deleted: true,
    },
  }

  try {
    const response = await retryFetch(`${KN_API_FEED_ITEM}/${feedItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!data || data.success !== true) {
      throw new Error(data.message || "Failed to delete feed item")
    }
    return true
  } catch (error) {
    console.error("Error deleting feed item:", error)
    throw error
  }
}

export class FeedItem {
  id?: number
  timestamp: Date
  threads?: IThread[]
  title: string
  run?: AutomationRun
  isLoading?: boolean
  calendarEvent?: Meeting
  automation?: Automation
  isRecording?: boolean
  deleted: any

  constructor({
    id,
    timestamp,
    threads,
    run,
    isLoading,
    title,
    calendarEvent,
    automation,
    isRecording,
  }: FeedItemProps) {
    this.id = id
    this.timestamp = timestamp
    this.threads = threads
    this.title = title
    this.run = run
    this.isLoading = isLoading
    this.calendarEvent = calendarEvent
    this.automation = automation
    this.isRecording = isRecording
  }

  getTitle() {
    return this.title
  }

  getSubtitle() {
    return ''
  }

  getTime() {
    return this.timestamp
  }

  getCalendarEvent() {
    return this.calendarEvent
  }

  getAutomation() {
    return this.automation
  }
}
