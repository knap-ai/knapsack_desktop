import {
  KN_API_MIC_USAGE,
  KN_API_PAUSE_RECORD,
  KN_API_RECORD_STATUS,
  KN_API_START_RECORD,
  KN_API_STOP_RECORD,
} from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'

export interface RecordingStatus {
  isRecording: boolean
  threadId: number
  feedItemId: number
  success: true
}
export async function startRecord(
  threadId: number,
  feedItemId?: number,
  eventId?: number,
  saveTranscript?: boolean,
) {
  KNAnalytics.trackEvent('Start recording', {})
  const body = JSON.stringify({
    thread_id: threadId,
    feed_item_id: feedItemId,
    event_id: eventId,
    save_transcript: saveTranscript,
  })
  const response = await fetch(KN_API_START_RECORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  })
  if (!response.ok) {
    logError(new Error('Failed to start recording'), {
      additionalInfo: '',
      error: await response.text(),
    })
    throw new Error('Failed to start recording')
  }
  return true
}

export async function stopRecord(
  threadId: number,
  saveTranscript: boolean = false,
  eventId: number | undefined = undefined,
) {
  KNAnalytics.trackEvent('Stop recording API', {})
  const body = JSON.stringify({
    thread_id: threadId,
    save_transcript: saveTranscript,
    event_id: eventId,
  })
  const response = await fetch(KN_API_STOP_RECORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  })
  if (!response.ok) {
    logError(
      new Error('Failed to stop recording'),
      {
        additionalInfo: '',
        error: await response.text(),
      },
      true,
    )
    throw new Error('Failed to stop recording')
  }
  return true
}

export async function statusRecordByThreadID(threadId: number) {
  const response = await fetch(KN_API_RECORD_STATUS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    logError(new Error('Failed to fetch recording status'), {
      additionalInfo: '',
      error: data.message,
    })
    return false
  }

  if (data.threadId === threadId) {
    return data.isRecording
  } else {
    return false
  }
}

export async function isRecordingStatus() {
  const response = await fetch(KN_API_RECORD_STATUS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    logError(new Error('Failed to fetch recording status'), {
      additionalInfo: '',
      error: data.message,
    })
    return false
  }

  return data as RecordingStatus
}

export async function getMicUsage() {
  const response = await fetch(KN_API_MIC_USAGE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    logError(new Error('Failed to fetch recording status'), {
      additionalInfo: '',
      error: 'Error fetching mic usage',
    })
    return false
  }

  const data = await response.json()
  return data
}

export async function pauseRecord() {
  KNAnalytics.trackEvent('Pause recording API', {})
  const response = await fetch(KN_API_PAUSE_RECORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    logError(
      new Error('Failed to pause recording'),
      {
        additionalInfo: '',
        error: await response.text(),
      },
      true,
    )
    throw new Error('Failed to pause recording')
  }
  return true
}

export async function transcribeRecording() {}
