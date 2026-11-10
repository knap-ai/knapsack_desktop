import { bindNotesSave as bindProfileNotesSave, BoundNotesSave } from 'src/utils/notesSave'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { CORRECTIONS_CHANGED, readCorrections, spellingContext } from 'src/utils/nameCorrections'
import { meetingSpeakerIdentityPrompt, MeetingSpeakerIdentity } from 'src/utils/meetingSpeakerIdentity'
import { capturePostMeetingSource } from 'src/utils/postMeetingSource'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Editor } from '@tiptap/react'
import { getApiToken } from 'src/api/connections'
import { deleteTranscript, getTranscript } from 'src/api/transcripts'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { NOTES_SYNTHESIS_PROMPT } from 'src/prompts'
import { KN_API_GET_TRANSCRIPT, KN_API_NOTES } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { isSharingEnabled, shouldSaveTranscript } from 'src/utils/settings'
import { MeetingTemplatePrompt } from 'src/utils/template_prompts'
import { normalizeMeetingNotesMarkdown } from 'src/utils/meetingNotesMarkdown'

import { NotesGeneration, cancelNotesGeneration, waitForAbort } from 'src/utils/notesGeneration'

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
  bindNotesSave: () => BoundNotesSave
  setContent: (content: string) => void
  setMarkdown: (markdown: string) => void
}

export const useMeetingSynthesis = (
  editor: Editor | null,
  addToLLMQueue: (params: LLMParams) => void,
  onSynthesisFinish: () => void,
  templatePrompt: MeetingTemplatePrompt,
  speakerIdentity?: MeetingSpeakerIdentity,
  accountEmail?: string,
): IMeetingSynthesis => {
  const speakerIdentityRules = meetingSpeakerIdentityPrompt(speakerIdentity)
  const [content, setContent] = useState<string>('')
  const [markdown, setMarkdown] = useState<string>('')
  const [isLLMLoading, setIsLLMLoading] = useState<boolean>(false)
  const [streamingMarkdown, setStreamingMarkdown] = useState<string>('')
  const [synthesisPhase, setSynthesisPhase] = useState<IMeetingSynthesis['synthesisPhase']>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [errorThreadId, setErrorThreadId] = useState<number | null>(null)

  const displayIdentity = JSON.stringify([accountEmail ?? speakerIdentity?.email ?? '', speakerIdentity?.name ?? ''])
  const generationIdentity = useRef(displayIdentity)
  const activeGeneration = useRef<NotesGeneration | null>(null)

  const generationSaves = useRef(new WeakMap<NotesGeneration, BoundNotesSave>())
  const bindingIdentity = useRef({identity:displayIdentity,revision:0})
  if(bindingIdentity.current.identity!==displayIdentity){bindingIdentity.current.identity=displayIdentity;bindingIdentity.current.revision++}
  const frameBindingRevision=bindingIdentity.current.revision
  const frameProfileRevision=getProfileRevision()
  useEffect(() => () => {
    activeGeneration.current?.cancel(new Error('Account or meeting view changed. Generate notes again.'))
  }, [displayIdentity])

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

  const bindNotesSave = ():BoundNotesSave => {
    const bound=bindProfileNotesSave({
      readProfile:()=>KNLocalStorage.getItem(PROFILE_KEY),
      tokenForEmail:getApiToken,
      reportCloudFailure:error=>logError(error,{additionalInfo:'Failed saving notes to server with UUID'}),
      canShare:permission=>isSharingEnabled('notes','knapsack',permission),
      fetcher:(input,init)=>fetch(input,init),
      localUrl:KN_API_NOTES,metadataUrl:KN_API_GET_TRANSCRIPT,
      serverUrl:import.meta.env.VITE_KN_API_SERVER || 'http://localhost:8000',
      bindingCurrent:()=>frameBindingRevision===bindingIdentity.current.revision && frameProfileRevision===getProfileRevision(),
      expectedEmail:accountEmail ?? speakerIdentity?.email,
    })
    const save=(threadId:number,notes:string,generation?:NotesGeneration)=>{
      if(!generation && !renderingGeneration.current && bound.isCurrent())cancelNotesGeneration(threadId,new Error('Note generation stopped because your notes were edited.'))
      return bound(threadId,notes,generation)
    }
    return Object.assign(save,{isCurrent:bound.isCurrent})
  }
  const saveNotes = async (threadId:number,notes:string,generation?:NotesGeneration) => {
    const save=generation ? generationSaves.current.get(generation) : bindNotesSave()
    if(!save)throw new Error('This note generation is no longer current.')
    try {await save(threadId,notes,generation)}
    catch(error){logError(error instanceof Error?error:new Error('Note save failed'),{additionalInfo:'Error in saveNotes'});throw error}
  }

  const constructTemplatePrompt = async (meetingTemplate: MeetingTemplatePrompt) => {
    const templatePrompt = meetingTemplate.prompt
    const additionalInstructions = await KNLocalStorage.getItem(meetingTemplate.key)
    const finalPrompt = additionalInstructions
      ? `${templatePrompt}\n\nAdditional Instructions: ${additionalInstructions}`
      : templatePrompt
    return finalPrompt
  }

  const customizeNotesSynthesisPrompt = async (meeting: Meeting | undefined, identityRules = speakerIdentityRules) => {
    let notesSynthesisPrompt = NOTES_SYNTHESIS_PROMPT
    if (meeting !== undefined) {
      const meetingInfo = meeting ? meeting.getReadableFormat() : ''
      // TODO: remove the piece relating to mis-transcribed company names in
      // the meetingInfoPrompt once we pass domain/company names to the transcription API.
      const meetingInfoPrompt = `Here's the meeting information:
${meetingInfo}

Use explicit transcript evidence to identify participants. The roster alone does not identify speakers. The title to the notes should use the meeting title.

Keep company names grounded in explicit evidence. Do not infer participant roles or employers from email domains.
`
      notesSynthesisPrompt = NOTES_SYNTHESIS_PROMPT.replace(
        '{MEETING_INFO_PROMPT}',
        meetingInfoPrompt,
      )
    } else {
      notesSynthesisPrompt = notesSynthesisPrompt.replace('{MEETING_INFO_PROMPT}', '')
    }

    notesSynthesisPrompt =
      notesSynthesisPrompt + '\n\n' + (await constructTemplatePrompt(templatePrompt)) + '\n\n' + identityRules

    return notesSynthesisPrompt
  }

  const synthesizeContent = useCallback(
    async (threadId: number, userNotes: string, meeting: Meeting | undefined) => {
      const saveBinding=bindNotesSave()
      if(!saveBinding.isCurrent())throw new Error('Account changed before note generation was admitted.')
      activeGeneration.current?.cancel(new Error('Note generation replaced by a newer attempt.'))
      const generation = new NotesGeneration(threadId)
      activeGeneration.current = generation
      generationSaves.current.set(generation,saveBinding)
      generationIdentity.current=displayIdentity
      setContent('')
      const cancelForSpellings = () => generation.cancel(new Error('Spellings changed. Generate notes again to use current settings.'))
      window.addEventListener(CORRECTIONS_CHANGED, cancelForSpellings)
      const cancelForProfile = () => {
        generationIdentity.current='';setContent('');setStreamingMarkdown('');setIsLLMLoading(false);setSynthesisPhase('idle')
        generation.cancel(new Error('Account changed. Generate notes again.'))
      }
      window.addEventListener(PROFILE_CHANGED_EVENT, cancelForProfile)
      const storageChanged = (event: StorageEvent) => { if (event.key?.startsWith('kn-meeting-spellings-v1:')) cancelForSpellings() }
      window.addEventListener('storage', storageChanged)
      const current = () => activeGeneration.current === generation && generation.current()
      setIsLLMLoading(true)
      setStreamingMarkdown('')
      setSynthesisPhase('reading-transcript')
      setError(null)
      setErrorThreadId(threadId)

      try {
        await waitForAbort((async () => {
          const startingProfile = await KNLocalStorage.getItem(PROFILE_KEY)
          generation.check()
          if (accountEmail !== undefined && (!accountEmail || !startingProfile?.uuid || startingProfile?.email?.toLowerCase() !== accountEmail.toLowerCase())) {
            throw new Error('Sign in to this account before generating meeting notes.')
          }
          const scope = JSON.stringify([startingProfile?.uuid || '', startingProfile?.email || '', startingProfile?.name || ''])
          const checkProfile = async () => {
            const profile = await KNLocalStorage.getItem(PROFILE_KEY)
            generation.check()
            if (scope !== JSON.stringify([profile?.uuid || '', profile?.email || '', profile?.name || ''])) {
              cancelForProfile(); generation.check()
            }
          }
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

          await checkProfile()
          const profile = startingProfile
          const identityRules = startingProfile?.name !== undefined || startingProfile?.email !== undefined ? meetingSpeakerIdentityPrompt({name:startingProfile.name,email:startingProfile.email}) : speakerIdentityRules
          const notesSynthesisPrompt = await customizeNotesSynthesisPrompt(meeting, identityRules) + spellingContext(transcript.content + '\n' + userNotes, readCorrections(profile?.uuid || ''))

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
                  capturePostMeetingSource(threadId, transcript.content || '', normalizedResponse)
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
        window.removeEventListener(CORRECTIONS_CHANGED, cancelForSpellings)
        window.removeEventListener(PROFILE_CHANGED_EVENT, cancelForProfile)
        generationSaves.current.delete(generation)
        window.removeEventListener('storage', storageChanged)
        generation.finish()
      }
    },
    [markdown, speakerIdentityRules, accountEmail, displayIdentity, frameProfileRevision],
  )

  const sameIdentity=generationIdentity.current===displayIdentity
  return {
    content: sameIdentity ? content : '',
    isLLMLoading: sameIdentity && isLLMLoading,
    streamingMarkdown: sameIdentity ? streamingMarkdown : '',
    synthesisPhase: sameIdentity ? synthesisPhase : 'idle',
    error: sameIdentity ? error : null,
    errorThreadId: sameIdentity ? errorThreadId : null,
    synthesizeContent,
    saveNotes,
    bindNotesSave,
    setContent,
    setMarkdown,
  }
}
