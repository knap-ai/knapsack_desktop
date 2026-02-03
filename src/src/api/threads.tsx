import { logError } from 'src/utils/errorHandling'
import { HttpError, retryFetch } from 'src/utils/retryUtils'

import { KN_API_CREATE_MESSAGE, KN_API_FEEDBACKS, KN_API_THREADS } from '../utils/constants'

export enum ThreadType {
  CHAT = 'CHAT',
  MEETING_NOTES = 'MEETING_NOTES',
  EMAIL_AUTOPILOT = 'EMAIL_AUTOPILOT',
}

// TODO: I know duplicating this name ('Thread') is horrible.
// The Thread in KNChatMessage is really a ThreadWithMessages.
// This Thread directly mimics our DB model.
export interface KNChatMessage {
  id?: number
  user_type: 'user' | 'bot'
  content_type: 'text' // Add more types as needed
  text: string
  date: Date
  isStreaming?: boolean
  feedback?: number
  document_ids?: number[]
}

export interface IThread {
  id: number
  date: Date
  hideFollowUp: boolean
  messages: KNChatMessage[]
  isLoading?: boolean
  title?: string
  subtitle?: string
  threadType: ThreadType
  recorded?: boolean
  savedTranscript?: string
  promptTemplate?: string
}

export interface Thread {
  id: number
  timestamp?: Date
  hideFollowUp?: boolean
  title?: string
  subtitle?: string
  feedItemId?: number
  threadType: ThreadType
  promptTemplate?: string
}

export const serializeMessage = (
  messages: {
    id: number
    user_id: number
    content: string
    content_facade: string
    timestamp: number
    document_ids?: number[]
  }[],
) => {
  const messagesSerialized = messages
    .map(msg => ({
      id: msg.id,
      user_type: msg.user_id > 0 ? 'user' : 'bot',
      content_type: 'text',
      text: msg.content_facade ?? msg.content,
      date: new Date(msg.timestamp),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()) as KNChatMessage[]

  return messagesSerialized
}

const serializeFeedback = (data: {
  id: number
  user_id: number
  message_id: number
  feedback: number
  timestamp: number
}) => ({
  message_id: data.message_id,
  feedback: data.feedback,
})

export const serializeThreadWithMessages = (threadData: {
  thread: {
    id: number
    timestamp: number
    hideFollowUp: boolean
    threadType: ThreadType
    promptTemplate?: string
  }
  messages: {
    id: number
    userId: number
    content: string
    contentFacade: string
    timestamp: number
    documentIds?: number[]
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
        document_ids: msg.documentIds,
      }))
      .sort((a, b) => a.id - b.id) as KNChatMessage[]
  }
  const thread = {
    id: threadData.thread.id,
    date: new Date(threadData.thread.timestamp),
    messages: messages,
    hideFollowUp: threadData.thread.hideFollowUp,
    threadType: threadData.thread.threadType,
    promptTemplate: threadData.thread.promptTemplate,
  }
  return thread
}

const serializeThread = (thread: Thread) => {
  return {
    id: thread.id,
    timestamp: thread.timestamp ? thread.timestamp.getTime() : null,
    hideFollowUp: thread.hideFollowUp,
    threadType: thread.threadType,
    title: thread.title,
    subtitle: thread.subtitle,
    promptTemplate: thread.promptTemplate,
  }
}

export async function updateThread(thread_id: number, thread: Thread) {
  try {
    const response = await retryFetch(KN_API_THREADS + '/' + String(thread_id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ thread: serializeThread(thread) }),
    })

    const data = await response.json()
    if (!data || data.success !== true) {
      const error = new HttpError(response.status, data.message, data.error_code)
      logError(error, {
        additionalInfo: 'Error occurred while updating thread',
        error: data.message,
      })
      throw error
    }

    return true
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      logError(error, {
        additionalInfo: 'Error occurred while updating thread',
        error: error.message,
      })
      throw error
    }
    const finalError = new HttpError(
      500,
      'An unexpected error occurred while updating thread',
      'UNKWON_ERROR',
    )
    logError(finalError, {
      additionalInfo: 'Error occurred while updating thread',
      error: 'An unexpected error occurred while updating thread',
    })
    throw finalError
  }
}

export async function getFeedbacks(email: string) {
  const response = await fetch(`${KN_API_FEEDBACKS}?email=${email}`, {
    method: 'GET',
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    logError(new Error('Get feedbacks data error'), {
      additionalInfo: '',
      error: data.message,
    })
  }
  return data.data.map(serializeFeedback)
}

export async function createMessage(
  msg: KNChatMessage,
  userEmail: string | undefined,
  timestamp: number,
  documentIds?: number[],
  thread_id?: number,
) {
  const body = {
    user_email: userEmail,
    thread_id: thread_id,
    content: msg.text,
    content_facade: msg.text,
    timestamp: timestamp,
    document_ids: documentIds,
  }
  const response = await fetch(KN_API_CREATE_MESSAGE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    console.log(`createMessage data error`)
    return undefined
  }
  return serializeThreadWithMessages(data.thread)
}

export async function createThread(
  timestamp: number,
  hide_follow_up: boolean,
  feed_item_id: number,
  title?: string,
  subtitle?: string,
  thread_type: string = ThreadType.CHAT,
) {
  const body = {
    timestamp,
    hide_follow_up,
    feed_item_id,
    title,
    subtitle,
    thread_type,
  }
  const response = await fetch(KN_API_THREADS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!data || data['success'] !== true) {
    console.log(`createThread data error`)
    return
  }
  return data.thread as Thread
}
