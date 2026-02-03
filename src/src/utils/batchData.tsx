import { getApiToken } from 'src/api/connections'
import { PROFILE_KEY } from 'src/hooks/auth/useAuth'
import { KN_API_NOTES, KN_API_TRANSCRIPTS_LIST } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'

import { isSharingEnabled } from './settings'

export const uploadAllData = async (uuid: string, includeTranscripts: boolean = false) => {
  try {
    const profile = await KNLocalStorage.getItem(PROFILE_KEY)
    if (!profile || !profile.email) {
      throw new Error('No profile or email found for authentication')
    }

    const token = await getApiToken(profile.email)
    const serverUrl = import.meta.env.VITE_KN_API_SERVER

    await uploadNotes(uuid, token, serverUrl)

    if (
      includeTranscripts &&
      isSharingEnabled('transcripts', 'knapsack', profile.sharing_permission)
    ) {
      await uploadTranscripts(uuid, token, serverUrl)
    }
  } catch (error) {
    console.error('Error uploading data:', error)
    logError(error instanceof Error ? error : new Error('Unknown error occurred'), {
      additionalInfo: 'Error uploading data',
      error: String(error),
    })
  }
}

const uploadNotes = async (uuid: string, token: string, serverUrl: string) => {
  try {
    const response = await fetch(`${KN_API_NOTES}/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${(await response.text()) || 'Unknown error'}`)
    }

    const data = await response.json()

    if (!data.data?.notes || !data.data.notes.length) {
      console.log('No notes found to upload')
      return
    }

    const notes = data.data.notes

    try {
      const batchResponse = await fetch(`${serverUrl}/api/files/notes/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uuid,
          notes: notes.map((note: any) => ({
            thread_id: note.thread_id,
            content: note.content,
            uuid: uuid,
            participants: note.participants ? String(note.participants) : null,
            start_time: note.start_time ? String(note.start_time) : null,
            end_time: note.end_time ? String(note.end_time) : null,
            filename: note.filename,
          })),
        }),
      })

      if (batchResponse.ok) {
        const result = await batchResponse.json()
        KNAnalytics.trackEvent('Notes Batch Uploaded', {
          total: notes.length,
          success: result.uploaded_count,
          failed: result.failed_count,
        })
        return
      }
    } catch (error) {
      console.error('Error using notes batch endpoint, falling back to individual uploads:', error)
    }

    await uploadNotesIndividually(notes, uuid, token, serverUrl)
  } catch (error) {
    console.error('Error uploading notes:', error)
    throw error
  }
}

const uploadTranscripts = async (uuid: string, token: string, serverUrl: string) => {
  try {
    const response = await fetch(KN_API_TRANSCRIPTS_LIST, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${(await response.text()) || 'Unknown error'}`)
    }

    const data = await response.json()

    if (!data.data?.transcripts || !data.data.transcripts.length) {
      console.log('No transcripts found to upload')
      return
    }

    const transcripts = data.data.transcripts

    try {
      const batchResponse = await fetch(`${serverUrl}/api/files/transcripts/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uuid,
          transcripts: transcripts.map((t: any) => ({
            uuid: uuid,
            thread_id: t.thread_id,
            content: t.content,
            filename: t.filename,
            start_time: t.start_time ? String(t.start_time) : null,
            end_time: t.end_time ? String(t.end_time) : null,
            participants: t.participants ? String(t.participants) : null,
          })),
        }),
      })

      if (batchResponse.ok) {
        const result = await batchResponse.json()
        KNAnalytics.trackEvent('Transcripts Batch Uploaded', {
          total: transcripts.length,
          success: result.uploaded_count,
          failed: result.failed_count,
        })
        return
      }
    } catch (error) {
      console.error(
        'Error using transcripts batch endpoint, falling back to individual uploads:',
        error,
      )
    }

    // Fallback to individual uploads
    await uploadTranscriptsIndividually(transcripts, uuid, token, serverUrl)
  } catch (error) {
    console.error('Error uploading transcripts:', error)
    throw error
  }
}

const uploadNotesIndividually = async (
  notes: any[],
  uuid: string,
  token: string,
  serverUrl: string,
) => {
  let successCount = 0
  let failureCount = 0

  for (const note of notes) {
    try {
      const serverResponse = await fetch(`${serverUrl}/api/files/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: note.thread_id,
          notes: note.content,
          uuid,
        }),
      })

      if (serverResponse.ok) {
        successCount++
      } else {
        failureCount++
        console.error(`Failed to upload note ${note.thread_id}`)
      }
    } catch (error) {
      failureCount++
      console.error(`Error uploading note ${note.thread_id}:`, error)
    }
  }

  KNAnalytics.trackEvent('Notes Individually Uploaded', {
    total: notes.length,
    success: successCount,
    failed: failureCount,
  })
}

const uploadTranscriptsIndividually = async (
  transcripts: any[],
  uuid: string,
  token: string,
  serverUrl: string,
) => {
  let successCount = 0
  let failureCount = 0

  for (const transcript of transcripts) {
    try {
      if (!transcript.thread_id) {
        failureCount++
        console.error(`Skipping transcript ${transcript.filename} - no thread_id available`)
        continue
      }

      console.log(
        `Uploading transcript: ${transcript.filename} with thread_id: ${transcript.thread_id} and uuid: ${uuid}`,
      )
      const serverResponse = await fetch(`${serverUrl}/api/files/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: transcript.thread_id,
          transcript: transcript.content,
          uuid: uuid,
        }),
      })

      if (serverResponse.ok) {
        successCount++
        console.log(`Successfully uploaded transcript: ${transcript.filename}`)
      } else {
        failureCount++
        console.error(
          `Failed to upload transcript ${transcript.filename}, status: ${serverResponse.status}`,
        )
        const errorText = await serverResponse.text()
        console.error(`Error response: ${errorText}`)
      }
    } catch (error) {
      failureCount++
      console.error(`Error uploading transcript ${transcript.filename}:`, error)
    }
  }

  KNAnalytics.trackEvent('Transcripts Individually Uploaded', {
    total: transcripts.length,
    success: successCount,
    failed: failureCount,
  })
}

export const uploadAllNotes = async (uuid: string) => {
  return uploadAllData(uuid, false)
}
