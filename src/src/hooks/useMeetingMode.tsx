import { useCallback, useState } from 'react'

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

import { PROFILE_KEY } from './auth/useAuth'

type LLMParams = {
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
  error: Error | null
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
  const [error, setError] = useState<Error | null>(null)

  const insertLLMResponse = (editor: Editor | null, response: string) => {
    if (!editor) return

    editor.commands.clearContent()

    const parsedResponse = editor.storage.markdown.parser.parse(response)

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

  const saveNotes = async (threadId: number, notes: string) => {
    try {
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

      if (!localResponse.ok) {
        logError(new Error('Failed saving notes locally'), {
          additionalInfo: 'Failed saving notes to local backend',
          error: localData.error,
        })
        return localData
      }

      const profile = await KNLocalStorage.getItem(PROFILE_KEY)

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
      setIsLLMLoading(true)
      setError(null)

      try {
        const transcript = await getTranscript(threadId)
        if (!transcript) {
          logError(new Error('Transcript is undefined or null.'), {
            additionalInfo: 'error getTranscript',
            error: 'Transcript is undefined or null',
          })
          return
        }

        const shouldSave = await shouldSaveTranscript()
        KNAnalytics.trackEvent('Synthesize: user notes stats', { length: userNotes.length })

        const notesSynthesisPrompt = await customizeNotesSynthesisPrompt(meeting)

        addToLLMQueue({
          prompt: notesSynthesisPrompt,
          semanticSearchQuery: '',
          documents: [],
          additionalDocuments: [
            { title: 'Meeting Transcript', content: transcript.content },
            { title: 'User Notes', content: userNotes },
          ],
          messageStreamCallback: content => {
            console.log('LLM Stream:', content)
          },
          messageFinishCallback: async response => {
            // TODO verify if we still need that, I think onSynthesisFinish solve this
            insertLLMResponse(editor, response) // this is where the response is inserted into the editor
            try {
              await saveNotes(threadId, response)
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
              setError(err)
            }

            onSynthesisFinish()
            KNAnalytics.trackEvent('Synthesized notes', {})
            setIsLLMLoading(false)
            return Promise.resolve(response)
          },
          errorCallback: error => {
            // TODO: it isn't working properly because save notes button need fix - task #94456439
            saveNotes(threadId, markdown).then(() => {
              if (!shouldSave) {
                deleteTranscript(threadId)
              }
            })

            logError(error, {
              additionalInfo: 'errorCallback from addToLLMQueue',
              error: error.message,
            })
            setError(error)
            setIsLLMLoading(false)
          },
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'))
        setIsLLMLoading(false)
      }
    },
    [markdown],
  )

  return {
    content,
    isLLMLoading,
    error,
    synthesizeContent,
    saveNotes,
    setContent,
    setMarkdown,
  }
}
