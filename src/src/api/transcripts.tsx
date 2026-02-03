import { PROFILE_KEY } from 'src/hooks/auth/useAuth'
import { KN_API_GET_TRANSCRIPT, KN_API_THREAD_TRANSCRIPT } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'

import { getApiToken } from './connections'
import { isSharingEnabled } from 'src/utils/settings'

export interface ITranscript {
  id: number
  filename: string
  startTime: number
  endTime: number
  content: string
  participants: string
}

export async function getTranscript(threadId: number) {
  const response = await fetch(`${KN_API_GET_TRANSCRIPT}/${threadId}`, {
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

  const transcript = data.data as ITranscript

  try {
    const profile = await KNLocalStorage.getItem(PROFILE_KEY)

    if (isSharingEnabled('transcripts', 'knapsack', profile.sharing_permission)) {
      const serverRequestBody = {
        thread_id: threadId,
        transcript: transcript.content,
        uuid: profile.uuid,
        metadata: transcript.filename
          ? {
              uuid: profile.uuid,
              participants: transcript.participants ? String(transcript.participants) : '[]',
              start_time: transcript.startTime ? String(transcript.startTime) : '',
              end_time: transcript.endTime ? String(transcript.endTime) : '',
              filename: transcript.filename,
              thread_id: String(threadId),
            }
          : {},
      }
      const email = profile.email
      const token = await getApiToken(email)
      const serverUrl = import.meta.env.VITE_KN_API_SERVER || 'http://localhost:8000'

      const serverResponse = await fetch(`${serverUrl}/api/files/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serverRequestBody),
      })

      if (!serverResponse.ok) {
        const serverData = await serverResponse.json().catch(() => ({}))
        logError(new Error('Failed saving transcript to server'), {
          additionalInfo: 'Failed saving transcript to server with UUID',
          error: serverData.error || serverResponse.statusText,
        })
      }
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Unknown error occurred'), {
      additionalInfo: 'Error checking/sending transcript to server',
      error: String(error),
    })
  }

  return transcript
}

export const deleteTranscript = async (threadId: number) => {
  const response = await fetch(`${KN_API_GET_TRANSCRIPT}/${threadId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()

  if (!response.ok) {
    logError(new Error('Failed to delete transcript'), {
      additionalInfo: '',
      error: data.error,
    })
    throw new Error('Failed to delete transcript: ' + data.error)
  }
}

export async function getSavedTranscript(threadId: string) {
  const response = await fetch(`${KN_API_THREAD_TRANSCRIPT}?id=${threadId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    logError(new Error('Failed to fetch transcript'), {
      additionalInfo: '',
      error: data.message,
    })
    return false
  }
  return data.data
}
