import React, { createContext, ReactNode, useContext, useRef, useState } from 'react'

import { pauseRecord, startRecord, stopRecord } from 'src/api/recording'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'

import { emit } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/shell'

export interface RecordingContextProps {
  isRecording: (threadId: number) => boolean
  setIsRecording: (threadId: number, isRecording: boolean) => void
  isLoadingNotes: (threadId: number) => boolean
  startRecording: (
    setFeedIsRecording: (isRecording: boolean | undefined) => void,
    saveTranscript: boolean,
    threadId: number,
    feedItemId?: number,
    eventId?: number,
    eventUrl?: string,
    isStart?: boolean,
  ) => Promise<void>
  stopRecording: (
    fetchNotes: () => Promise<void>,
    setFeedIsRecording: (isRecording: boolean | undefined) => void,
    synthesizeContent: (
      threadId: number,
      userNotes: string,
      meeting: Meeting | undefined,
    ) => Promise<void>,
    saveNotes: (threadId: number, notes: string) => Promise<void>,
    checkTranscriptSaved: () => Promise<void>,
    notesMarkdown: string,
    threadId: number,
    saveTranscript: boolean,
    meeting: Meeting | undefined,
    eventId?: number,
  ) => Promise<void>
  isAnyRecording: boolean
  pauseRecording: () => Promise<void>
  isPaused: boolean
  generateNotes: (
    threadId: number,
    synthesizeContent: (
      threadId: number,
      userNotes: string,
      meeting: Meeting | undefined,
    ) => Promise<void>,
    saveNotes: (threadId: number, notes: string) => Promise<void>,
    notesMarkdown: string,
    meeting: Meeting | undefined
  ) => Promise<void>
  hasSynthesized: (threadId: number) => boolean
}

interface RecordingProviderProps {
  children: ReactNode
}

const RecordingContext = createContext<RecordingContextProps | undefined>(undefined)

export const RecordingProvider: React.FC<RecordingProviderProps> = ({ children }) => {
  const [isRecordingStates, setIsRecordingStates] = useState<Map<number, boolean>>(new Map())
  const [loadingStates, setLoadingStates] = useState<Map<number, boolean>>(new Map())
  const [hasSynthesizedState, setHasSynthesizedState] = useState<Map<number, boolean>>(new Map())
  const [isAnyRecording, setIsAnyRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const isStartingRef = useRef(false)

  const hasSynthesized = (threadId: number) => {
    return hasSynthesizedState.get(threadId) || false
  }

  const setHasSynthesized = (threadId: number, isSynthesizing: boolean) => {
    setHasSynthesizedState(prev => new Map(prev).set(threadId, isSynthesizing))
  }

  const isLoadingNotes = (threadId: number) => {
    return loadingStates.get(threadId) || false
  }

  const setLoadingState = (threadId: number, isLoading: boolean) => {
    setLoadingStates(prev => new Map(prev).set(threadId, isLoading))
  }

  const isRecording = (threadId: number) => {
    return isRecordingStates.get(threadId) || false
  }

  const setIsRecording = (threadId: number, isRecording: boolean) => {
    setIsRecordingStates(prev => {
      const newMap = new Map(prev).set(threadId, isRecording)
      setIsAnyRecording(Array.from(newMap.values()).some(Boolean))
      return newMap
    })
  }

  const startRecording = async (
    setFeedIsRecording: (isRecording: boolean | undefined) => void,
    saveTranscript: boolean,
    threadId: number,
    feedItemId?: number,
    eventId?: number,
    eventUrl?: string,
    isStart: boolean = false,
  ) => {
    if (isStartingRef.current) {
      return
    }
    isStartingRef.current = true
    try {
      // Check macOS permissions before attempting to record.
      // This must succeed or recording is blocked — we never silently proceed
      // without verified permissions.
      console.info(`[Recording] startRecording threadId=${threadId} isStart=${isStart}`)
      try {
        const permissions = await invoke<{
          microphone: boolean
          screen_recording: boolean
          all_granted: boolean
        }>('check_audio_permissions')

        console.info(`[Recording] permissions: mic=${permissions.microphone} screen=${permissions.screen_recording} all=${permissions.all_granted}`)

        if (!permissions.all_granted) {
          const missing: string[] = []
          if (!permissions.microphone) missing.push('Microphone')
          if (!permissions.screen_recording) missing.push('Screen Recording')

          const message = `Recording requires ${missing.join(' and ')} permission${missing.length > 1 ? 's' : ''}. Please grant access in System Settings > Privacy & Security, then try again.`

          // Clear stale localStorage so AudioPermissionChecker re-shows
          if (!permissions.microphone) localStorage.removeItem('micPermissionGranted')
          if (!permissions.screen_recording) localStorage.removeItem('screenPermissionGranted')

          logError(
            new Error('Missing recording permissions'),
            {
              additionalInfo: message,
              error: `microphone=${permissions.microphone}, screen_recording=${permissions.screen_recording}`,
            },
            true,
          )
          throw new Error(message)
        }
      } catch (permErr: any) {
        // If this is our own permission error, rethrow it
        if (permErr.message?.includes('permission') || permErr.message?.includes('Permission') || permErr.message?.includes('Recording requires')) {
          throw permErr
        }
        // The permission check command itself failed. This is a real problem —
        // do NOT silently proceed. Surface the error to the user.
        const errorMsg = `Permission check failed: ${permErr.message || String(permErr)}. Please restart the app and try again.`
        logError(
          new Error('Permission check failed'),
          {
            additionalInfo: errorMsg,
            error: permErr.message || String(permErr),
          },
          true,
        )
        throw new Error(errorMsg)
      }

      console.info(`[Recording] calling startRecord endpoint for threadId=${threadId}`)
      await startRecord(threadId, feedItemId, eventId, saveTranscript)
      console.info(`[Recording] startRecord succeeded for threadId=${threadId}`)
      setFeedIsRecording(true)
      setIsRecording(threadId, true)
      if (eventUrl && isStart) {
        await open(eventUrl)
      } else if (!isStart) {
        setIsPaused(false)
      }
    } catch (err: any) {
      console.error(`[Recording] startRecording failed for threadId=${threadId}:`, err)
      logError(
        new Error('Error starting recording'),
        {
          additionalInfo: `Error in startRecord for threadId=${threadId}.`,
          error: err.message,
        },
        true,
      )
      throw new Error(err.message || 'Error start recording')
    } finally {
      isStartingRef.current = false
    }
  }

  const generateNotes = async (
    threadId: number,
    synthesizeContent: (
      threadId: number,
      userNotes: string,
      meeting: Meeting | undefined,
    ) => Promise<void>,
    saveNotes: (threadId: number, notes: string) => Promise<void>,
    notesMarkdown: string,
    meeting: Meeting | undefined
  ) => {
      try {
        KNAnalytics.trackEvent('Synthesizing notes', {})
        await synthesizeContent(threadId, notesMarkdown, meeting)
        setHasSynthesized(threadId, true)
        setIsRecording(threadId, false)
        await saveNotes(threadId, notesMarkdown)
        // Emit event for post-meeting follow-up notifications
        emit('notes_synthesized', {
          threadId,
          meetingTitle: meeting?.title || 'Meeting',
        }).catch(err => console.warn('Failed to emit notes_synthesized event:', err))
      } catch (error) {
        const lastError = error instanceof Error ? error : new Error(String(error))
        logError(lastError, { additionalInfo: 'Issue synthesizing/saving notes' }, true)
      }

  }

  const stopRecording = async (
    fetchNotes: () => Promise<void>,
    setFeedIsRecording: (isRecording: boolean | undefined) => void,
    synthesizeContent: (
      threadId: number,
      userNotes: string,
      meeting: Meeting | undefined,
    ) => Promise<void>,
    saveNotes: (threadId: number, notes: string) => Promise<void>,
    checkTranscriptSaved: () => Promise<void>,
    notesMarkdown: string,
    threadId: number,
    saveTranscript: boolean,
    meeting: Meeting | undefined,
    eventId?: number,
  ) => {
    setIsPaused(false)
    console.info(`[Recording] stopRecording threadId=${threadId}`)

    if (isRecording(threadId)) {
      setLoadingState(threadId, true)
      try {
        await stopRecord(threadId, saveTranscript, eventId)
        console.info(`[Recording] stopRecord succeeded for threadId=${threadId}`)
        setFeedIsRecording(false)
        setIsRecording(threadId, false)
      } catch (err: any) {
        console.error(`[Recording] stopRecording failed for threadId=${threadId}:`, err)
        logError(
          new Error('Error stopping recording'),
          {
            additionalInfo: `Error in stopRecording for threadId=${threadId}.`,
            error: err.message,
          },
          true,
        )
        throw new Error('Error stop recording')
      }
      await generateNotes(threadId, synthesizeContent, saveNotes, notesMarkdown, meeting)
    }

    await fetchNotes()
    setLoadingState(threadId, false)
    checkTranscriptSaved()
  }

  const pauseRecording = async () => {
    console.info('[Recording] pauseRecording')
    try {
      await pauseRecord()
      setIsPaused(true)
    } catch (err: any) {
      console.error('[Recording] pauseRecording failed:', err)
      logError(
        new Error('Error pausing recording'),
        { additionalInfo: 'pauseRecording failed', error: err.message },
        true,
      )
    }
  }

  return (
    <RecordingContext.Provider
      value={{
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
      }}
    >
      {children}
    </RecordingContext.Provider>
  )
}

export const useRecording = () => {
  const context = useContext(RecordingContext)
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider')
  }
  return context
}
