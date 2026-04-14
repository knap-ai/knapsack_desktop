import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { pauseRecord, startRecord, stopRecord } from 'src/api/recording'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'

import { emit } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { openBesideApp } from 'src/utils/openBesideApp'

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

  const hasSynthesized = useCallback((threadId: number) => {
    return hasSynthesizedState.get(threadId) || false
  }, [hasSynthesizedState])

  const setHasSynthesized = useCallback((threadId: number, isSynthesizing: boolean) => {
    setHasSynthesizedState(prev => new Map(prev).set(threadId, isSynthesizing))
  }, [])

  const isLoadingNotes = useCallback((threadId: number) => {
    return loadingStates.get(threadId) || false
  }, [loadingStates])

  const setLoadingState = useCallback((threadId: number, isLoading: boolean) => {
    setLoadingStates(prev => new Map(prev).set(threadId, isLoading))
  }, [])

  const isRecording = useCallback((threadId: number) => {
    return isRecordingStates.get(threadId) || false
  }, [isRecordingStates])

  const setIsRecording = useCallback((threadId: number, isRecording: boolean) => {
    setIsRecordingStates(prev => {
      const newMap = new Map(prev).set(threadId, isRecording)
      setIsAnyRecording(Array.from(newMap.values()).some(Boolean))
      return newMap
    })
  }, [])

  const startRecording = useCallback(async (
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
          os_update_required?: boolean
          os_update_message?: string
        }>('check_audio_permissions')

        console.info(`[Recording] permissions: mic=${permissions.microphone} screen=${permissions.screen_recording} all=${permissions.all_granted}`)

        if (permissions.os_update_required) {
          const message = permissions.os_update_message || 'Meeting notes require macOS 14.2 (Sonoma) or later. Please update your operating system to use this feature.'
          logError(
            new Error('macOS update required'),
            {
              additionalInfo: message,
              error: 'os_update_required',
            },
            true,
          )
          throw new Error(message)
        }

        if (!permissions.all_granted) {
          const missing = []
          if (!permissions.microphone) missing.push('Microphone')
          if (!permissions.screen_recording) missing.push('System Audio Recording')
          const message = `Recording requires ${missing.join(' and ')} permission. Please grant access in System Settings > Privacy & Security, then try again.`

          // Clear stale localStorage so AudioPermissionChecker re-shows
          localStorage.removeItem('micPermissionGranted')
          localStorage.removeItem('screenPermissionGranted')
          // Also clear the dismissal flag so the permission dialog re-appears
          localStorage.removeItem('permissionsDismissed')

          logError(
            new Error('Missing recording permissions'),
            {
              additionalInfo: message,
              error: `microphone=${permissions.microphone} system_audio=${permissions.screen_recording}`,
            },
            true,
          )
          throw new Error(message)
        }
      } catch (permErr: any) {
        // If this is our own permission error, rethrow it
        if (permErr.message?.includes('permission') || permErr.message?.includes('Permission') || permErr.message?.includes('Recording requires') || permErr.message?.includes('macOS')) {
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
        await openBesideApp(eventUrl)
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
  }, [setIsRecording])

  const generateNotes = useCallback(async (
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

  }, [setHasSynthesized, setIsRecording])

  const stopRecording = useCallback(async (
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
    console.info(`[Recording] stopRecording threadId=${threadId} frontendState=${isRecording(threadId)}`)

    // Always attempt to stop — don't gate on frontend state which can desync
    const wasRecording = isRecording(threadId)
    setLoadingState(threadId, true)
    let stopSucceeded = false
    try {
      await stopRecord(threadId, saveTranscript, eventId)
      console.info(`[Recording] stopRecord succeeded for threadId=${threadId}`)
      stopSucceeded = true
    } catch (err: any) {
      // If backend says "no recording in progress", that's OK — state was out of sync
      if (err?.message?.includes('No recording in progress')) {
        console.warn(`[Recording] Backend had no recording for threadId=${threadId}, clearing frontend state`)
        stopSucceeded = true // Still clear state
      } else {
        console.error(`[Recording] stopRecording failed for threadId=${threadId}:`, err)
        logError(
          new Error('Error stopping recording'),
          {
            additionalInfo: `Error in stopRecording for threadId=${threadId}.`,
            error: err.message,
          },
          true,
        )
        setLoadingState(threadId, false)
        throw new Error(err.message || 'Error stop recording')
      }
    }
    // Always clear recording state after successful stop
    setFeedIsRecording(false)
    setIsRecording(threadId, false)

    if (wasRecording && stopSucceeded) {
      await generateNotes(threadId, synthesizeContent, saveNotes, notesMarkdown, meeting)
    }

    await fetchNotes()
    setLoadingState(threadId, false)
    checkTranscriptSaved()
  }, [isRecording, setIsRecording, setLoadingState, generateNotes])

  const pauseRecording = useCallback(async () => {
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
  }, [])

  const contextValue = useMemo(() => ({
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
  }), [isRecording, setIsRecording, isLoadingNotes, startRecording, stopRecording, isAnyRecording, pauseRecording, isPaused, generateNotes, hasSynthesized])

  return (
    <RecordingContext.Provider value={contextValue}>
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
