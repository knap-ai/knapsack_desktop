import dayjs from 'dayjs'
import { ConnectionKeys } from 'src/api/connections'
import { IGoogleDriveItem } from 'src/App'
import { AutopilotActions } from 'src/hooks/dataSources/useEmailAutopilot'

import { Meeting } from '../components/UpcomingMeetings'

import { AutomationDataSources } from '../automations/automation'
import {
  GOOGLE_DRIVE_LINK,
  KN_API_GET_EVENTS,
  KN_API_GET_EVENTS_IDS_BY_RECURRENCE_ID,
  KN_API_GET_USER_EMAIL,
  KN_API_GOOGLE_DRIVE_FILES,
  KN_API_GOOGLE_DRIVE_MIME_TYPES,
  KN_API_GOOGLE_GMAIL_READ,
  KN_API_GOOGLE_RESTORE_AUTH,
  KN_API_GOOGLE_START_FETCHING,
  KN_API_MICROSOFT_OUTLOOK_READ,
  KN_API_MICROSOFT_OUTLOOK_REPLY,
  KN_API_REST_GET_CALENDAR_EVENT,
  KN_API_REST_GET_RECENT_CALENDAR_EVENTS,
  KN_API_REST_GET_RECENT_EMAILS,
  KN_API_REST_GMAIL_SEARCH,
  KN_API_REST_GMAIL_SEARCH_SENT_EMAILS,
  KN_API_REST_LIST_EMAILS_AFTER_TIMESTAMP,
  KN_API_REST_SEARCH_EMAIL_BY_ADDRESES,
  KN_API_REST_SEMANTIC_SEARCH,
  KN_API_STREAM_LLM_COMPLETE,
  KN_API_UPDATE_EMAIL,
} from '../utils/constants'
import { EmailDocument, SourceDocument } from '../utils/SourceDocument'
import { logError } from './errorHandling'
import {
  CHAT_COMPLETION_ERROR_MESSAGES_MAPPING,
  throwChatCompletionError,
} from './exceptions/chat_completion'
import KNDateUtils from './KNDateUtils'
import { HttpError, retryFetch } from './retryUtils'

export default class DataFetcher {
  public async getChatCompletionStream(
    userEmail: string,
    userName: string,
    userPrompt: string,
    semanticSearchQuery: string | undefined,
    documents: number[],
    useLocalLLM: boolean,
    additionalDocuments?: { title: string; content: string }[],
    threadId?: number,
  ) {
    const body_obj = {
      user_email: userEmail,
      user_name: userName,
      prompt: userPrompt,
      semantic_search_query: semanticSearchQuery,
      documents,
      additional_documents: additionalDocuments,
      is_local: useLocalLLM,
      thread_id: threadId,
    }

    try {
      const response = await retryFetch(
        KN_API_STREAM_LLM_COMPLETE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body_obj),
        },
        {
          maxRetries: 3,
          baseDelay: 100,
          maxDelay: 1000,
          timeout: 60000,
        },
      )

      const reader = response.body?.getReader()
      return reader
    } catch (error) {
      if (error instanceof HttpError) {
        logError(error, { additionalInfo: 'Error chat completion stream', error: error.message })
        throwChatCompletionError({
          errorCode: error.code as keyof typeof CHAT_COMPLETION_ERROR_MESSAGES_MAPPING,
        })
      } else if (error instanceof Error) {
        logError(error, { additionalInfo: 'Error chat completion stream', error: error.message })
        throwChatCompletionError({})
      } else {
        logError(new Error('An unknown error occurred during chat completion stream'), {
          additionalInfo: 'An unknown error occurred during chat completion stream',
          error: String(error),
        })
        throwChatCompletionError({})
      }
    }
  }

  public async getGoogleAuthRestoreSuccess() {
    try {
      const response = await fetch(KN_API_GOOGLE_RESTORE_AUTH, { method: 'GET' })
      return response.status === 200
    } catch (err) {
      return false
    }
  }

  public async postStartGoogleDataFetching() {
    try {
      const response = await fetch(KN_API_GOOGLE_START_FETCHING, { method: 'POST' })
      return response.status === 200
    } catch (err) {
      return false
    }
  }

  public async getGmailSearchResults(searchTerm: string): Promise<EmailDocument[]> {
    const response = searchTerm
      ? await fetch(KN_API_REST_GMAIL_SEARCH, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchTerm, top: 10 }),
        })
      : await fetch(KN_API_REST_GET_RECENT_EMAILS, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ top: 10 }),
        })

    // TODO: handle error
    const data = await response.json()
    if (!data || data['success'] !== true) {
      return []
    }

    return data['display_docs'] as EmailDocument[]
  }

  public async listDaySentEmails(
    timestamp: number,
    email: string,
  ): Promise<EmailDocument[] | undefined> {
    const fromDatetime = new Date(timestamp)
    fromDatetime.setHours(0, 0, 0, 0)

    const toDatetime = dayjs(timestamp).add(1, 'day').toDate()
    toDatetime.setHours(0, 0, 0, 0)
    const bodyObj = {
      email,
      top: 10,
      from_timestamp: fromDatetime.getTime() / 1000,
      to_timestamp: toDatetime.getTime() / 1000,
    }
    const response = await fetch(KN_API_REST_GMAIL_SEARCH_SENT_EMAILS, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
    })
    // todo: handle error
    const data = await response.json()
    if (!data || data['success'] !== true) {
      return []
    }

    return data['display_docs'] as EmailDocument[]
  }

  public async getGmailSearchResultsByAddresses(addresses: string[]): Promise<EmailDocument[]> {
    const response = await fetch(KN_API_REST_SEARCH_EMAIL_BY_ADDRESES, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ top: 15, addresses }),
    })

    // TODO: handle error
    const data = await response.json()
    if (!data || data['success'] !== true) {
      return []
    }

    return data['display_docs'] as EmailDocument[]
  }

  public async getGmailDateMessages(date: Date): Promise<EmailDocument[]> {
    // const today = new Date()
    const fromDatetime = new Date(date)
    fromDatetime.setHours(0, 0, 0, 0)
    const toDatetime = new Date(date)
    toDatetime.setHours(23, 59, 59, 0)
    const response = await fetch(KN_API_REST_LIST_EMAILS_AFTER_TIMESTAMP, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        top: 1000,
        from_timestamp: fromDatetime.getTime() / 1000,
        to_timestamp: toDatetime.getTime() / 1000,
      }),
    })

    // TODO: handle error
    const data = await response.json()
    if (!data || data['success'] !== true) {
      return []
    }

    return data['display_docs'] as EmailDocument[]
  }

  public async getRecentGmailMessages(
    days: number,
    maxMessages: number = 20,
  ): Promise<EmailDocument[]> {
    const fromDatetime = KNDateUtils.nDaysAgo(days)
    const today = new Date()
    const toDatetime = new Date(today)
    toDatetime.setHours(23, 59, 59, 0)

    const response = await fetch(KN_API_REST_LIST_EMAILS_AFTER_TIMESTAMP, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        top: maxMessages,
        from_timestamp: fromDatetime.getTime() / 1000,
        to_timestamp: toDatetime.getTime() / 1000,
      }),
    })

    // TODO: handle error
    const data = await response.json()
    if (!data || data['success'] !== true) {
      return []
    }

    return data['display_docs'] as EmailDocument[]
  }
  // & helpers for getRecentCalendarEvents

  private processCalendarDocs(docs: any[]): Meeting[] {
    return docs
      .map(doc => this.createMeeting(doc))
      .filter((meeting): meeting is Meeting => !!meeting)
  }

  private createMeeting(doc: any): Meeting | null {
    const participants = JSON.parse(doc.attendees_json)

    if (participants.length <= 1) {
      return null // Skip meetings with only one participant
    }

    const startTimestampInMS = doc.start * 1000
    return {
      id: doc.id,
      eventId: doc.event_id,
      title: doc.title,
      description: doc.description,
      start: new Date(startTimestampInMS),
      location: doc.location,
      participants,
    }
  }

  public async getRecentCalendarEvents(): Promise<Meeting[] | undefined> {
    try {
      const response = await fetch(KN_API_REST_GET_RECENT_CALENDAR_EVENTS, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ top: 3 }),
      })
      const data = await response?.json()

      if (!data?.success) {
        return
      }
      const meetings = this.processCalendarDocs(data.display_docs)

      return meetings
    } catch (error) {
      console.error('Failed to fetch recent calendar events:', error)
      return
    }
  }

  public async getCalendarEvent(id: number): Promise<Meeting | undefined> {
    const response = await fetch(`${KN_API_REST_GET_CALENDAR_EVENT}/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!data || data['success'] !== true) {
      return
    }

    const item = data.data
    const startTimestampInMS = item.start * 1000
    const start = new Date(startTimestampInMS)
    const participants = JSON.parse(item.attendees_json)
    const location = item.location
    const google_meet_url = item.google_meet_url

    return {
      id: item.id,
      title: item.title,
      eventId: item.event_id,
      description: item.description,
      start,
      location: location,
      participants,
      google_meet_url: google_meet_url,
      recurrenceId: item.recurrence_id,
    }
  }

  public async semanticSearch(
    searchTerm: string,
    documents?: SourceDocument[],
    dataSources?: AutomationDataSources[],
    numResults: number = 10,
  ): Promise<SourceDocument[]> {
    const response = await fetch(KN_API_REST_SEMANTIC_SEARCH, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchTerm,
        top: numResults,
        documents,
        data_sources: dataSources,
      }),
    })
    const data = await response.json()
    return data.display_documents
  }

  public async fetchGoogleDriveFiles(files: IGoogleDriveItem[], email: string) {
    const requestJson = { files: files }
    const response = await fetch(`${KN_API_GOOGLE_DRIVE_FILES}?email=${email}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestJson),
    })
    const data = await response.json()
    return data
  }

  public async fetchUserEmail() {
    const response = await fetch(KN_API_GET_USER_EMAIL, {
      method: 'GET',
    })
    const data = await response.json()
    if (data.email) {
      return data.email
    }
  }

  public async getGoogleDriveMimeTypes() {
    const response = await fetch(KN_API_GOOGLE_DRIVE_MIME_TYPES, {
      method: 'GET',
    })
    const data = await response.json()
    return data.mime_types
  }

  public async getGoogleDriveFiles(itemId: string, token: string) {
    const link =
      GOOGLE_DRIVE_LINK + `?q=parents='${itemId}'&key=${import.meta.env.VITE_GOOGLE_DEVELOPER_KEY}`
    const response = await fetch(link, {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
    })
    const data = await response.json()
    return data.files
  }

  public async getEventIdsByRecurrenceId(recurrenceId: string) {
    const response = await fetch(
      KN_API_GET_EVENTS_IDS_BY_RECURRENCE_ID + `?recurrence_id=${recurrenceId}`,
      {
        method: 'GET',
      },
    )
    const data = await response.json()
    if (data) {
      return data
    }
    return []
  }

  public async postMarkEmailRead(
    email: string,
    messageId: string,
    provider: ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
    action: AutopilotActions,
  ) {
    const url =
      provider == ConnectionKeys.MICROSOFT_PROFILE
        ? KN_API_MICROSOFT_OUTLOOK_READ
        : KN_API_GOOGLE_GMAIL_READ

    let extra_action
    if (action === AutopilotActions.DELETE || action === AutopilotActions.REPLY_DELETE) {
      extra_action = 'delete'
    } else if (action === AutopilotActions.REPLY_ARCHIVE || action === AutopilotActions.ARCHIVE) {
      extra_action = 'archive'
    }

    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_id: messageId, email: email, extra_action: extra_action }),
    })
    const data = await response.json()

    if (response.ok) {
      const updateResponse = await fetch(KN_API_UPDATE_EMAIL, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailUid: messageId,
          isRead: true,
        }),
      })

      if (!updateResponse.ok) {
        const updateData = await updateResponse.json()
        logError(new Error('Failed to update email in database'), {
          additionalInfo: 'Failed to update email in database',
          error: updateData.message,
        })
      }
      return data
    }

    logError(new Error('Failed to mark email as read'), {
      additionalInfo: 'Failed to mark email as read',
      error: data.message,
    })
    throw new Error(data.message)
  }

  public async postOutlookSendReply(email: string, messageId: string, body: string, previousEmail?: any) {
    const previousEmailBody = previousEmail?.message?.body || '';
    const response = await fetch(`${KN_API_MICROSOFT_OUTLOOK_REPLY}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_id: messageId,
        reply_body: body,
        email: email,
        previous_email_body: previousEmailBody,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return data
    }

    logError(new Error('Failed to send email outlook'), {
      additionalInfo: 'Failed to send email outlook',
      error: data.message,
    })
    throw new Error(data.message)
  }
}

export async function getCalendarEvents(startTimestamp: number, endTimestamp: number) {
  const response = await fetch(
    `${KN_API_GET_EVENTS}?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  const data = await response.json()
  return data.display_docs
}
