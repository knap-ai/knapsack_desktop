import { useCallback, useRef, useState } from 'react'

import { Editor } from '@tiptap/react'
import { getApiToken } from 'src/api/connections'
import { deleteTranscript, getTranscript, ITranscript } from 'src/api/transcripts'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { NOTES_SYNTHESIS_PROMPT } from 'src/prompts'
import { KN_API_GET_TRANSCRIPT, KN_API_NOTES } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { isSharingEnabled, shouldSaveTranscript } from 'src/utils/settings'
import { MeetingTemplatePrompt } from 'src/utils/template_prompts'
import { normalizeMeetingNotesMarkdown } from 'src/utils/meetingNotesMarkdown'

import { NotesGeneration, cancelNotesGeneration, serializeNotesWrite, waitForAbort } from 'src/utils/notesGeneration'

import { PROFILE_KEY } from './auth/useAuth'

type LLMParams = {
  diagnosticKind?: 'notes' | 'completion'
  signal?: AbortSignal
  prompt: string
  semanticSearchQuery: string
  documents: number[]
  additionalDocuments?: {
    title: string
    content: string
  }[]
  messageStreamCallback: (content: string) => void
  messageFinishCallback: (response: string) => Promise<string | undefined>
  errorCallback: (error: Error) => void
}

interface IMeetingSynthesis {
  content: string
  isLLMLoading: boolean
  streamingMarkdown: string
  synthesisPhase: 'idle' | 'reading-transcript' | 'writing' | 'saving'
  error: Error | null
  errorThreadId: number | null
  synthesizeContent: (
    threadId: number,
    userNotes: string,
    meeting: Meeting | undefined,
  ) => Promise<void>
  saveNotes: (threadId: number, notes: string) => Promise<void>
  setContent: (content: string) => void
  setMarkdown: (markdown: string) => void
}

export const useMeetingSynthesis = (
  editor: Editor | null,
  addToLLMQueue: (params: LLMParams) => void,
  onSynthesisFinish: () => void,
  templatePrompt: MeetingTemplatePrompt,
): IMeetingSynthesis => {
  const [content, setContent] = useState<string>('')
  const [markdown, setMarkdown] = useState<string>('')
  const [isLLMLoading, setIsLLMLoading] = useState<boolean>(false)
  const [streamingMarkdown, setStreamingMarkdown] = useState<string>('')
  const [synthesisPhase, setSynthesisPhase] = useState<IMeetingSynthesis['synthesisPhase']>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [errorThreadId, setErrorThreadId] = useState<number | null>(null)

  const activeGeneration = useRef<NotesGeneration | null>(null)

  const renderingGeneration = useRef(false)

  const insertLLMResponse = (editor: Editor | null, response: string) => {
    if (!editor) return

    const parsedResponse = editor.storage.markdown.parser.parse(response)

    // Intermediate clearing must not enqueue an empty autosave if insertion fails.
    editor.commands.clearContent(false)

    editor
      .chain()
      .focus()
      //.setColor('#4F46E5') - Property 'setColor' does not exist on type 'ChainedCommands'.ts(2339) commented for build
      .insertContent(parsedResponse)
      .run()

    const newHtmlContent = editor.getHTML()
    const newMarkdownContent = editor.storage.markdown.getMarkdown()
    setContent(newHtmlContent)
    setMarkdown(newMarkdownContent)
  }

  const saveNotes = async (threadId: number, notes: string, generation?: NotesGeneration) => {
    try {
      if (!generation && !renderingGeneration.current) {
        cancelNotesGeneration(threadId, new Error('Note generation stopped because your notes were edited. Your edits are saved.'))
      }
      const localSave = async () => {
        generation?.check()
        const localResponse = await fetch(KN_API_NOTES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thread_id: threadId,
            notes: notes,
          }),
        })

        const localData = await localResponse.json()

        if (!localResponse.ok || localData?.success !== true) {
          logError(new Error('Failed saving notes locally'), {
            additionalInfo: 'Failed saving notes to local backend',
            error: localData.error,
          })
          throw new Error('Failed saving notes locally')
        }

        return localData
      }
      const localData = generation ? await generation.write(localSave) : await serializeNotesWrite(threadId, localSave)
      generation?.check()

      const profile = await KNLocalStorage.getItem(PROFILE_KEY)
      generation?.check()

      if (!profile || !profile.uuid || !notes) {
        return localData
      }

      // using the endpoint to get the metadata
      const response = await fetch(`${KN_API_GET_TRANSCRIPT}/${threadId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      generation?.check()

      if (!data || data['success'] !== true) {
        return
      }

      const transcript = data.data as ITranscript

      if (isSharingEnabled('notes', 'knapsack', profile.sharing_permission)) {
        const serverRequestBody = {
          thread_id: threadId,
          notes: notes,
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
        generation?.check()
        const serverUrl = import.meta.env.VITE_KN_API_SERVER || 'http://localhost:8000'

        const serverResponse = await fetch(`${serverUrl}/api/files/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serverRequestBody),
        })

        if (!serverResponse.ok) {
          const serverData = await serverResponse.json().catch(() => ({}))
          logError(new Error('Failed saving notes to server'), {
            additionalInfo: 'Failed saving notes to server with UUID',
            error: serverData.error || serverResponse.statusText,
          })
        }
      }

      return localData
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Unknown error occurred'), {
        additionalInfo: 'Error in saveNotes',
        error: String(error),
      })
      throw error
    }
  }

  const constructTemplatePrompt = async (meetingTemplate: MeetingTemplatePrompt) => {
    const templatePrompt = meetingTemplate.prompt
    const additionalInstructions = await KNLocalStorage.getItem(meetingTemplate.key)
    const finalPrompt = additionalInstructions
      ? `${templatePrompt}\n\nAdditional Instructions: ${additionalInstructions}`
      : templatePrompt
    return finalPrompt
  }

  const customizeNotesSynthesisPrompt = async (meeting: Meeting | undefined) => {
    let notesSynthesisPrompt = NOTES_SYNTHESIS_PROMPT
    if (meeting !== undefined) {
      const meetingInfo = meeting ? meeting.getReadableFormat() : ''
      // TODO: remove the piece relating to mis-transcribed company names in
      // the meetingInfoPrompt once we pass domain/company names to the transcription API.
      const meetingInfoPrompt = `Here's the meeting information:
${meetingInfo}

Use this meeting information to infer participant names where you can. The title to the notes should use the meeting title.

It's highly likely that the company names mentioned in the transcript appear in the email domains of the participants. Use the email domain to fix any company names in your notes that might be incorrectly spelled in the transcript.
`
      notesSynthesisPrompt = NOTES_SYNTHESIS_PROMPT.replace(
        '{MEETING_INFO_PROMPT}',
        meetingInfoPrompt,
      )
    } else {
      notesSynthesisPrompt = notesSynthesisPrompt.replace('{MEETING_INFO_PROMPT}', '')
    }

    notesSynthesisPrompt =
      notesSynthesisPrompt + '\n\n' + (await constructTemplatePrompt(templatePrompt))

    return notesSynthesisPrompt
  }

  const synthesizeContent = useCallback(
    async (threadId: number, userNotes: string, meeting: Meeting | undefined) => {
      activeGeneration.current?.cancel(new Error('Note generation replaced by a newer attempt.'))
      const generation = new NotesGeneration(threadId)
      activeGeneration.current = generation
      const current = () => activeGeneration.current === generation && generation.current()
      setIsLLMLoading(true)
      setStreamingMarkdown('')
      setSynthesisPhase('reading-transcript')
      setError(null)
      setErrorThreadId(threadId)

      try {
        await waitForAbort((async () => {
          const transcript = await getTranscript(threadId, { localOnly: true })
          if (!transcript) {
            logError(new Error('Transcript is undefined or null.'), {
              additionalInfo: 'error getTranscript',
              error: 'Transcript is undefined or null',
            })
            throw new Error('The meeting transcript is not available yet. Existing notes have been preserved.')
          }

          if (!transcript.content?.trim() && !userNotes.trim()) {
            throw new Error('No transcript text or notes are available for this meeting yet. Your existing notes have been preserved; try again after transcription finishes.')
          }

          generation.check()
          const shouldSave = await shouldSaveTranscript()
          KNAnalytics.trackEvent('Synthesize: user notes stats', { length: userNotes.length })

          const notesSynthesisPrompt = await customizeNotesSynthesisPrompt(meeting)

          generation.check()
          setSynthesisPhase('writing')
          await new Promise<void>((resolve, reject) => {
            addToLLMQueue({
              diagnosticKind: 'notes',
              signal: generation.signal,
              prompt: notesSynthesisPrompt,
              semanticSearchQuery: '',
              documents: [],
              additionalDocuments: [
                { title: 'Meeting Transcript', content: transcript.content },
                { title: 'User Notes', content: userNotes },
              ],
              // The legacy stream callback receives the complete response-so-far,
              // not a delta. Render it immediately so notes visibly take shape
              // instead of leaving the user on a blank page until completion.
              messageStreamCallback: content => {
                if (!current()) return
                setSynthesisPhase('writing')
                setStreamingMarkdown(normalizeMeetingNotesMarkdown(content))
              },
              messageFinishCallback: async response => {
                if (!current()) return response
                const normalizedResponse = normalizeMeetingNotesMarkdown(response)
                setStreamingMarkdown(normalizedResponse)
                setSynthesisPhase('saving')
                try {
                  if (!normalizedResponse.trim()) {
                    throw new Error('No notes were returned. Retry from the saved meeting.')
                  }
                  await saveNotes(threadId, normalizedResponse, generation)
                  generation.check()
                  // Rendering cannot prevent durable notes from being saved.
                  // A queued job may finish after its editor has been destroyed.
                  try {
                    renderingGeneration.current = true
                    if (editor && !editor.isDestroyed) insertLLMResponse(editor, normalizedResponse)
                  } catch {
                    logError(new Error('Notes saved but editor update failed'), {
                      additionalInfo: 'Reopen the meeting to load saved notes',
                    })
                  } finally {
                    renderingGeneration.current = false
                  }
                  if (!shouldSave) {
                    await deleteTranscript(threadId)
                  }
                } catch (err: any) {
                  logError(
                    err,
                    {
                      additionalInfo: 'Error handling notes or transcript',
                      error: err,
                    },
                    true,
                  )
                  if (!current()) { reject(err); return response }
                  setError(err)
                  setIsLLMLoading(false)
                  setSynthesisPhase('idle')
                  reject(err)
                  return response
                }

                if (!current()) { reject(generation.signal.reason); return response }
                onSynthesisFinish()
                KNAnalytics.trackEvent('Synthesized notes', {})
                setIsLLMLoading(false)
                setSynthesisPhase('idle')
                setStreamingMarkdown('')
                resolve()
                return response
              },
              errorCallback: error => {
                if (!current()) { reject(error); return }
                // Keep the transcript and autosaved live notes intact so the user
                // can retry; never overwrite them with a stale pre-synthesis value.
                logError(error, {
                  additionalInfo: 'errorCallback from addToLLMQueue',
                  error: error.message,
                })
                setError(error)
                setIsLLMLoading(false)
                setSynthesisPhase('idle')
                setStreamingMarkdown('')
                reject(error)
              },
            })
          })
        })(), generation.signal)
      } catch (err) {
        if (activeGeneration.current !== generation) throw err
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        setIsLLMLoading(false)
        setSynthesisPhase('idle')
        setStreamingMarkdown('')
        throw err
      } finally {
        generation.finish()
      }
    },
    [markdown],
  )

  return {
    content,
    isLLMLoading,
    streamingMarkdown,
    synthesisPhase,
    error,
    errorThreadId,
    synthesizeContent,
    saveNotes,
    setContent,
    setMarkdown,
  }
}
