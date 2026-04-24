import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { mergeAttributes } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { FeedItem } from 'src/api/feed_items'
import { isRecordingStatus, statusRecordByThreadID } from 'src/api/recording'
import { IThread, ThreadType } from 'src/api/threads'
import { LLMParams } from 'src/App'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { IFeed } from 'src/hooks/feed/useFeed'
import { useMeetingSynthesis } from 'src/hooks/useMeetingMode'
import { KN_API_NOTES } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { getEventUrl } from 'src/utils/meetingUtils'
import { shouldSaveTranscript } from 'src/utils/settings'
import {
  INTERNAL_MEETING,
  MEETING_TEMPLATES,
  MeetingTemplatePrompt,
} from 'src/utils/template_prompts'
import { Markdown } from 'tiptap-markdown'
import MeetingNotesTabBar from 'src/components/molecules/MeetingNotesTabBar'
import RecordControlPanel from 'src/components/molecules/RecordControlPanel'
import MarkdownDisplay from 'src/components/molecules/MarkdownDisplay'

import { Event, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'

import MeetingChatNotice from 'src/components/molecules/MeetingChatNotice'
import { TaskItem } from '../CenterWorkspace'
import { RecordingContextProps } from './RecordingContext'
import { listWorkspaces, Workspace } from 'src/api/workspaces'

interface MenuButtonProps<T = any> {
  isActive: boolean
  onClick: (params: T | undefined) => void
  onClickParams?: T
  children: React.ReactNode
  title?: string
  disabled?: boolean
}

const MenuButton: React.FC<MenuButtonProps> = ({
  isActive,
  onClick,
  onClickParams,
  children,
  title,
  disabled,
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    className={`
      p-2 rounded-md text-sm font-medium transition-colors
      ${isActive ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'hover:bg-gray-100 text-gray-600'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    onClick={() => onClick(onClickParams)}
  >
    {children}
  </button>
)

interface MeetingNotesModeProps {
  key: number
  feedItemId?: number
  thread: IThread
  item: FeedItem
  meeting: Meeting | undefined
  timestamp: Date
  runParam: string | undefined
  addToLLMQueue?: (params: LLMParams) => void
  setFeedIsRecording: (isRecording: boolean | undefined) => void
  copyToClipboard?: (text: string) => void
  startRecording?: boolean
  feed: IFeed
  synthesisState: boolean
  onSynthesisFinish: () => void
  handleOpenTemplates: (thread: IThread) => Promise<void>
  handleOpenTranscript: (FeedItemId: number | undefined) => void
  handleErrorContact: (message: string) => void
  closeTranscript: () => void
  closeTasks: () => void
  recordingHandlers: RecordingContextProps
  handleOpenTasks?: (threadId: number | undefined, tasks: TaskItem[]) => void
  handleOpenInsights?: (threadId: number | undefined) => void
  onChatClick?: () => void
  onEmailClick?: (notesMarkdown: string, meeting: Meeting | undefined) => void
  onLibraryWorkspaceOpen?: (ws: Workspace) => void
  onAttendeeClick?: (email: string, name: string) => void
}

const MeetingNotesMode: React.FC<MeetingNotesModeProps> = ({
  thread,
  meeting,
  timestamp,
  runParam,
  addToLLMQueue = () => {
    console.log('LLM Queue not configured:')
  },
  setFeedIsRecording,
  feedItemId,
  copyToClipboard,
  feed,
  synthesisState,
  onSynthesisFinish,
  handleOpenTemplates,
  handleOpenTranscript,
  handleErrorContact,
  closeTranscript,
  closeTasks,
  recordingHandlers,
  handleOpenTasks,
  handleOpenInsights,
  onChatClick,
  onEmailClick,
  onLibraryWorkspaceOpen,
  onAttendeeClick,
}) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [disableIsRecording, setDisableIsRecording] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [notesMarkdown, setNotesMarkdown] = useState<string>('')
  const [personWorkspaces, setPersonWorkspaces] = useState<Record<string, Workspace>>({})

  useEffect(() => {
    listWorkspaces().then(res => {
      if (!res.success) return
      const map: Record<string, Workspace> = {}
      res.data.forEach(ws => {
        if (ws.entityType === 'person' && ws.entityKey) {
          map[ws.entityKey.toLowerCase()] = ws
        }
      })
      setPersonWorkspaces(map)
    }).catch(() => {})
  }, [])
  const [isTitleSet, setIsTitleSet] = useState(thread.subtitle !== 'Untitled Meeting')
  const [isEditingTitle, setIsEditingTitle] = useState(
    !thread.recorded && thread.subtitle === 'Untitled Meeting',
  )
  const [editableTitle, setEditableTitle] = useState(thread.subtitle || '')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const saveTitleEdit = () => {
    const trimmed = editableTitle.trim()
    if (trimmed && trimmed !== thread.subtitle) {
      feed.renameMeeting(thread.id, trimmed, feedItemId)
      setIsTitleSet(true)
    }
    setIsEditingTitle(false)
  }

  const [transcribingTextIndex, setTranscribingTextIndex] = useState(0)
  const transcribingTexts = [
    'Privately transcribing...',
    'Deleting recording/transcript from server...',
    'Generating meeting notes...',
    'Deleting meeting notes from server...',
    'Saving transcript locally...',
    'Transcript saved',
  ]
  const [isEditing, setIsEditing] = useState(true)
  const [prepContent, setPrepContent] = useState('')
  const [isPrepGenerating, setIsPrepGenerating] = useState(false)
  const [suggestedCalendarEvent, setSuggestedCalendarEvent] = useState<Meeting | null>(null)
  const [showCalendarPicker, setShowCalendarPicker] = useState(false)
  const calendarPickerRef = useRef<HTMLDivElement>(null)

  const sameDayMeetings = useMemo(() => {
    if (!feed.meetings || meeting) return []
    const day = dayjs(timestamp).format('YYYY-MM-DD')
    return Object.values(feed.meetings).filter(
      m => dayjs(m.start * 1000).format('YYYY-MM-DD') === day,
    ).sort((a, b) => a.start - b.start)
  }, [feed.meetings, timestamp, meeting])

  useEffect(() => {
    if (!showCalendarPicker) return
    const handler = (e: MouseEvent) => {
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(e.target as Node)) {
        setShowCalendarPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showCalendarPicker])

  const templatePrompt: MeetingTemplatePrompt = useMemo(() => {
    if (thread.promptTemplate) {
      return MEETING_TEMPLATES[thread.promptTemplate]
    }
    return INTERNAL_MEETING
  }, [thread.promptTemplate])

  const hasActionItems = useCallback(() => {
    if (!notesMarkdown) return false
    const actionItems = extractActionItems(notesMarkdown)
    return actionItems.length > 0
  }, [notesMarkdown])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-disc ml-4 text-sm',
          },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-decimal ml-4 text-sm',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1 text-sm',
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: 'text-black',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'text-black',
          },
        },
      }),
      Heading.extend({
        levels: [1, 2],
        renderHTML({ node, HTMLAttributes }) {
          const level = this.options.levels.includes(node.attrs.level)
            ? node.attrs.level
            : this.options.levels[0]
          const classes: Record<number, string> = {
            1: 'text-lg font-InterTight font-bold mt-2 leading-7',
            2: 'text-base font-semibold leading-6 mt-1 ',
          }
          return [
            `h${level}`,
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
              class: `${classes[level]}`,
            }),
            0,
          ]
        },
      }).configure({ levels: [1, 2] }),
      Typography,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your meeting notes...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML()
      // Get markdown content and preserve intentional formatting
      // 1. Replace triple or more newlines with double newlines
      // 2. Preserve double newlines (paragraph breaks)
      // 3. Remove escape characters
      const markdownContent = editor.storage.markdown.getMarkdown()
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with double newlines
        .replace(/\\/g, '')          // Remove escape characters

      setContent(htmlContent)
      setNotesMarkdown(markdownContent)
      setMarkdown(markdownContent)
      localStorage.setItem('meeting-notes-draft', markdownContent)

      if (thread.id) {
        debouncedSave(thread.id, markdownContent)
      }
    },
    editorProps: {
      attributes: {
        class:
          'leading-sm text-sm focus:outline-none focus:ring-0 focus:ring-transparent text-wrap p-3 rounded-md',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const { selection } = view.state
          const { $from, empty } = selection
          const { state } = view
          const { doc } = state
          const firstLine = doc.textBetween(0, doc.content.firstChild?.nodeSize || 0, '\n')
          if (!isTitleSet) {
            feed.renameMeeting(thread.id, firstLine, feedItemId)
            setIsTitleSet(true)
          }

          if (empty && $from.parent.type.name === 'listItem' && $from.parent.content.size === 0) {
            editor?.commands.liftListItem('listItem')
            return true
          }
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          return false // Return false to allow default arrow key behavior
        }
        return false
      },
    },
  })

  const { isLLMLoading, synthesizeContent, saveNotes, setContent, setMarkdown } =
    useMeetingSynthesis(editor, addToLLMQueue, onSynthesisFinish, templatePrompt)

  const debouncedSave = useMemo(
    () =>
      debounce(async (threadId: number, markdownContent: string) => {
        try {
          await saveNotes(threadId, markdownContent)
        } catch (error) {
          console.error('Error saving notes:', error)
        }
      }, 500),
    [],
  )
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  useEffect(() => {
    const refreshStatus = async () => {
      const statusRecord = await statusRecordByThreadID(thread.id)
      const statusDisable = await isRecordingStatus()
      recordingHandlers.setIsRecording(thread.id, statusRecord)
      if (statusDisable && statusDisable.isRecording) {
        setDisableIsRecording(statusDisable.threadId !== thread.id)
      }
    }

    if (thread.id) {
      fetchNotes()
      refreshStatus()
    }
  }, [thread.id, isLLMLoading, synthesisState])

  useEffect(() => {
    closeTranscript()
    closeTasks()
  }, [thread.id])

  useEffect(() => {
    const unlistenAutoStopRecordingPromise = listen(
      'start_recording',
      async (event: Event<{ openUrl: boolean }>) => {
        if (!disableIsRecording) {
          handleRecordClick(event.payload.openUrl)
        }
      },
    )
    const unlistenAutoStartRecordingPromise = listen('stop_recording', async () => {
      const statusDisable = await isRecordingStatus()
      if (statusDisable && statusDisable.isRecording) {
        setDisableIsRecording(statusDisable.threadId !== thread.id)
      }
      // Do NOT update isRecording state here — stopRecording() manages it.
      // Setting it to false before calling handleStopRecording would cause
      // wasRecording to be false inside stopRecording, preventing note generation.
      handleStopRecording('Automatic')
    })
    // Listen for 15-minute heartbeat insights during recording (proactive mode only)
    const unlistenHeartbeatPromise = listen(
      'meeting_heartbeat',
      async (event: Event<{ threadId: number; insight: string; elapsedMinutes: number }>) => {
        const isProactive = localStorage.getItem('moltbot_proactive_mode') === 'true'
        if (!isProactive) return

        const { insight, elapsedMinutes } = event.payload
        const mins = Math.round(elapsedMinutes)
        invoke('show_notification_window', {
          eventId: null,
          buttonConfigs: [{ buttonText: 'Dismiss', buttonHandler: 'dismiss_notification_handler' }],
          title: `Meeting insight (${mins} min)`,
          time: insight,
        }).catch(e => console.error('Failed to show meeting insight notification:', e))
      },
    )
    return () => {
      unlistenAutoStopRecordingPromise.then(unlisten => unlisten())
      unlistenAutoStartRecordingPromise.then(unlisten => unlisten())
      unlistenHeartbeatPromise.then(unlisten => unlisten())
    }
  }, [thread.id, isLLMLoading, synthesisState])

  // Track the previous promptTemplate to detect changes
  const previousPromptTemplateRef = React.useRef(thread.promptTemplate)

  useEffect(() => {
    if (
      previousPromptTemplateRef.current !== thread.promptTemplate &&
      thread.id &&
      thread.recorded
    ) {
      recordingHandlers.generateNotes(
        thread.id,
        synthesizeContent,
        saveNotes,
        notesMarkdown,
        meeting,
      )
    }

    previousPromptTemplateRef.current = thread.promptTemplate
  }, [thread.promptTemplate])

  useEffect(() => {
    setIsEditing(!thread.recorded)
  }, [recordingHandlers.hasSynthesized])

  // Auto-generate title for ad hoc / untitled meetings after notes are synthesized
  useEffect(() => {
    if (!isTitleSet && recordingHandlers.hasSynthesized(thread.id) && notesMarkdown) {
      // Extract title from the generated notes:
      // 1. First markdown heading (# Title)
      // 2. First non-empty line
      // 3. First ~60 chars of content
      let autoTitle = ''
      const lines = notesMarkdown.split('\n').filter(l => l.trim())
      for (const line of lines) {
        const headingMatch = line.match(/^#{1,3}\s+(.+)/)
        if (headingMatch) {
          autoTitle = headingMatch[1].trim()
          break
        }
      }
      if (!autoTitle && lines.length > 0) {
        // Use the first meaningful line, stripped of markdown formatting
        autoTitle = lines[0]
          .replace(/^[#*\->\s]+/, '')
          .replace(/\*\*/g, '')
          .trim()
      }
      if (autoTitle) {
        // Cap at 60 chars
        if (autoTitle.length > 60) {
          autoTitle = autoTitle.substring(0, 57) + '...'
        }
        feed.renameMeeting(thread.id, autoTitle, feedItemId)
        setIsTitleSet(true)
      }
    }
  }, [recordingHandlers.hasSynthesized(thread.id), notesMarkdown, isTitleSet])

  // After synthesis, prompt to attach ad-hoc notes to a nearby calendar event that has no notes yet.
  useEffect(() => {
    if (!recordingHandlers.hasSynthesized(thread.id) || meeting || suggestedCalendarEvent) return
    const FORTY_FIVE_MIN = 45 * 60 * 1000
    const meetingTime = timestamp.getTime()
    for (const feedItems of Object.values(feed.feedContent)) {
      for (const fi of feedItems) {
        if (!fi.calendarEvent || fi.id === feedItemId) continue
        const hasNotes = fi.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)
        if (hasNotes) continue
        const calStart = fi.calendarEvent.start
          ? fi.calendarEvent.start * 1000
          : fi.timestamp.getTime()
        if (Math.abs(calStart - meetingTime) <= FORTY_FIVE_MIN) {
          setSuggestedCalendarEvent(fi.calendarEvent)
          return
        }
      }
    }
  }, [recordingHandlers.hasSynthesized(thread.id)])

  const getRunParamObject = () => {
    if (runParam) {
      try {
        return JSON.parse(runParam)
      } catch (error) {
        console.error('Error parsing runParam:', error)
        return {}
      }
    }
    return {}
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${KN_API_NOTES}/${thread.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.data && data.data.notes) {
          setNotesMarkdown(data.data.notes)
          editor?.commands.setContent(data.data.notes)
        } else {
          setMarkdown('')
          editor?.commands.setContent('')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          additionalInfo: 'Error fetching notes MeetingNotesMode',
          error: error.message,
        })
      } else {
        logError(new Error(String(error)), {
          additionalInfo: 'Error fetching notes MeetingNotesMode',
          error: String(error),
        })
      }
    } finally {
      setIsInitialLoading(false)
    }
  }

  const checkTranscriptSaved = async () => {
    thread.recorded = true

    if (await shouldSaveTranscript()) {
      thread.savedTranscript = '/placeholder/transcript'
    }
  }

  const handleRecordClick = async (isStart: boolean) => {
    const saveTranscript = await shouldSaveTranscript()
    const runParamsObj = getRunParamObject()
    let eventId = 0
    if ('event_id' in runParamsObj) {
      eventId = runParamsObj.event_id
    }
    try {
      await recordingHandlers.startRecording(
        setFeedIsRecording,
        saveTranscript,
        thread.id,
        feedItemId,
        eventId,
        getEventUrl(meeting),
        isStart,
      )
    } catch (err: any) {
      const msg: string = err?.message || ''
      const isPermissionIssue = msg.includes('permission') || msg.includes('Permission') || msg.includes('Recording requires')
      const isMacOSIssue = msg.includes('macOS') || msg.includes('Sonoma')

      let message: string
      if (isPermissionIssue || isMacOSIssue) {
        // Detailed messages already constructed upstream in RecordingContext
        message = msg || 'Recording requires audio permissions. Please grant access in System Settings > Privacy & Security, then try again.'
      } else if (msg.includes('Permission check failed')) {
        message = msg
      } else if (msg.includes('Recording is already in progress') || msg.includes('already in progress')) {
        message = "A recording is already in progress. Stop the current recording first, or restart Knapsack if you believe no recording is active."
      } else if (msg.includes('Failed to create transcript record')) {
        message = "Couldn't start recording due to a database error. Please restart Knapsack and try again."
      } else if (msg) {
        message = `Couldn't start recording. Error: ${msg}`
      } else {
        message = "Couldn't start recording. Check that your microphone is available and try again."
      }
      if (isPermissionIssue || isMacOSIssue) {
        setPermissionError(message)
      }
      handleErrorContact(message)
    }
  }

  const getEventId = () => {
    const runParamsObj = getRunParamObject()
    let eventId = 0
    if ('event_id' in runParamsObj) {
      eventId = runParamsObj.event_id
    }
    return eventId
  }

  const handleStopRecording = async (type: string) => {
    let eventId = getEventId()
    KNAnalytics.trackEvent('Stop recording', { type: type, meetingId: eventId })
    const saveTranscript = await shouldSaveTranscript()

    try {
      await recordingHandlers.stopRecording(
        fetchNotes,
        setFeedIsRecording,
        synthesizeContent,
        saveNotes,
        checkTranscriptSaved,
        notesMarkdown,
        thread.id,
        saveTranscript,
        meeting,
        eventId,
      )
    } catch (err: any) {
      const msg: string = err?.message || ''
      let userMessage: string
      if (msg.includes('Mic recording task failed to complete')) {
        userMessage = "Microphone recording stopped unexpectedly. Your transcript was partially saved — meeting notes may be incomplete."
      } else if (msg.includes('Audio output recording task failed to complete')) {
        userMessage = "System audio recording stopped unexpectedly. Your transcript was partially saved — meeting notes may be incomplete."
      } else if (msg.includes('Failed to combine') || msg.includes('generate transcript')) {
        userMessage = "Couldn't process the recording. Check that you have enough disk space, then try regenerating notes from the template menu."
      } else if (msg.includes('Transcript not found') || msg.includes('transcript not found') || msg.includes('Failed to retrieve transcript')) {
        userMessage = "Recording transcript not found. The recording may not have captured audio — try starting a new recording."
      } else if (msg.includes('No thread found') || msg.includes('Failed to get thread') || msg.includes('Failed to update thread')) {
        userMessage = "A database error occurred while saving the recording. Please restart Knapsack and try again."
      } else if (msg) {
        userMessage = `Couldn't stop recording. Error: ${msg}`
      } else {
        userMessage = "Couldn't stop recording. Please try again."
      }
      handleErrorContact(userMessage)
    }
  }

  // Keep a ref so the listener below always calls the latest handleStopRecording
  // without stale-closure issues (recordingHandlers changes each render when
  // isRecordingStates updates, so capturing it in a [thread.id]-scoped effect
  // means isRecording() always returned false and stop was silently skipped).
  const handleStopRecordingRef = React.useRef(handleStopRecording)
  handleStopRecordingRef.current = handleStopRecording

  useEffect(() => {
    const unlisten = listen('stop-recording-from-indicator', () => {
      handleStopRecordingRef.current('Indicator')
    })
    return () => { unlisten.then(fn => fn()) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSynthesizing = useCallback(() => {
    return recordingHandlers.isLoadingNotes(thread.id) || isLLMLoading
  }, [recordingHandlers, thread.id, isLLMLoading])

  const [synthTimedOut, setSynthTimedOut] = useState(false)

  useEffect(() => {
    if (isSynthesizing() && !synthTimedOut) {
      const timer = setInterval(() => {
        setTranscribingTextIndex(prevIndex => (prevIndex + 1) % transcribingTexts.length)
      }, 1600)

      // Safety timeout: if synthesizing takes more than 3 minutes, stop the spinner
      const timeout = setTimeout(() => {
        setSynthTimedOut(true)
        handleErrorContact('Note generation is taking longer than expected. Your recording was saved — you can regenerate notes from the template menu.')
      }, 3 * 60 * 1000)

      return () => {
        clearInterval(timer)
        clearTimeout(timeout)
      }
    } else {
      setTranscribingTextIndex(0)
      if (!isSynthesizing()) {
        setSynthTimedOut(false)
      }
    }
  }, [isSynthesizing, synthTimedOut])

  if (!editor || isInitialLoading) {
    return (
      <div className="notetaker-note">
        <div className="notetaker-note__container">
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    className="notetaker-note__title-input"
                    value={editableTitle}
                    onChange={e => setEditableTitle(e.target.value)}
                    onBlur={saveTitleEdit}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); saveTitleEdit() }
                      else if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                    placeholder="Meeting title..."
                  />
                ) : (
                  <h1
                    className="notetaker-note__title"
                    onClick={!thread.recorded ? () => { setIsEditingTitle(true) } : undefined}
                    style={!thread.recorded ? { cursor: 'text' } : undefined}
                  >
                    {thread.subtitle}
                  </h1>
                )}
                <div className="notetaker-note__meta">
                  <span className="notetaker-note__meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {dayjs(new Date()).isSame(dayjs(meeting?.start ? meeting.start * 1000 : undefined), 'day') ? 'Today' : dayjs(meeting?.start ? meeting.start * 1000 : undefined).format('MMM D')}
                  </span>
                  {thread.recorded && !meeting && sameDayMeetings.length > 0 && (
                    <div className="notetaker-note__link-event-wrap" ref={calendarPickerRef}>
                      <button
                        className="notetaker-note__link-event-btn"
                        onClick={() => setShowCalendarPicker(v => !v)}
                        title="Link to a calendar event"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Link to calendar event
                      </button>
                      {showCalendarPicker && (
                        <div className="notetaker-note__calendar-picker">
                          {sameDayMeetings.map(m => (
                            <button
                              key={m.event_id}
                              className="notetaker-note__calendar-picker-item"
                              onClick={() => {
                                if (feedItemId != null) {
                                  feed.attachNotesToCalendarEvent(feedItemId, m)
                                }
                                setShowCalendarPicker(false)
                                setSuggestedCalendarEvent(null)
                              }}
                            >
                              <span className="notetaker-note__calendar-picker-time">
                                {dayjs(m.start * 1000).format('h:mm A')}
                              </span>
                              <span className="notetaker-note__calendar-picker-title">
                                {m.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {!thread.recorded && (
                  <RecordControlPanel
                    onClickJoin={() => handleRecordClick(true)}
                    onClickEnd={() => handleStopRecording('Manually')}
                    onClickPause={() => recordingHandlers.pauseRecording()}
                    onClickResume={() => handleRecordClick(false)}
                    isRecording={recordingHandlers.isRecording(thread.id)}
                    isDisabled={disableIsRecording}
                    isSynthesizing={isSynthesizing()}
                    isPaused={recordingHandlers.isPaused}
                  />
                )}
              </div>
            </div>
          </div>
          {/* Loading skeleton */}
          {!recordingHandlers.isRecording(thread.id) && (
            <div className="mt-6 space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          )}
          {/* Show recording notice + stop button when recording during loading */}
          {recordingHandlers.isRecording(thread.id) && (
            <MeetingChatNotice meetingPlatform={meeting?.meeting_platform} />
          )}
        </div>
        {/* Bottom bar stop button available even during loading */}
        {recordingHandlers.isRecording(thread.id) && (
          <div className="notetaker-note__bottom-bar">
            <div className="notetaker-note__bottom-waveform">
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '0ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '150ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '300ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '450ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '600ms'}} />
            </div>
            <div className="notetaker-note__bottom-recording-status">
              Privately transcribing...
            </div>
            <div className="flex-1" />
            <button
              className="notetaker-note__bottom-stop"
              onClick={() => handleStopRecording('Manually')}
            >
              Stop recording
            </button>
          </div>
        )}
      </div>
    )
  }

  const extractActionItems = (markdownContent: string): string[] => {
    if (!markdownContent) return []

    const actionItemsRegex = /## Action Items\s+([\s\S]*?)(?=##|$)/i
    const match = markdownContent.match(actionItemsRegex)

    if (!match || !match[1]) return []

    const actionItemsSection = match[1].trim()
    const actionItems = actionItemsSection
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => {
        let cleanedLine = line.trim().replace(/^-\s*/, '').trim()

        cleanedLine = cleanedLine.replace(/\\\[|\\\]|\[|\]/g, '').trim()

        cleanedLine = cleanedLine.replace(/^\s*\[[\s*x*\s*]\s*/, '').trim()

        cleanedLine = cleanedLine.replace(/^\*\*|\*\*$|\*$|^\*/g, '').trim()

        return cleanedLine
      })
      .filter(line => line.length > 0)

    return actionItems
  }

  const convertToTaskItems = (actionItems: string[]): TaskItem[] => {
    return actionItems.map((item, index) => ({
      id: `task-${index}`,
      text: item,
      isCompleted: false,
    }))
  }

  const handleTasksButtonClick = () => {
    if (handleOpenTasks && thread.id) {
      const actionItems = extractActionItems(notesMarkdown)
      const tasks = convertToTaskItems(actionItems)
      handleOpenTasks(thread.id, tasks)
    }
  }

  const onEditClick = () => {
    setIsEditing(!isEditing)
  }

  const generatePrep = () => {
    if (!meeting || isPrepGenerating) return
    setIsPrepGenerating(true)
    setPrepContent('')

    const participantList = meeting.participants
      .map(p => p.name ? `${p.name} (${p.email})` : p.email)
      .join(', ')
    const startTime = meeting.start
      ? new Date(meeting.start * 1000).toLocaleString()
      : 'unknown time'
    const description = meeting.description
      ? `\nAgenda/Description: ${meeting.description}`
      : ''

    const prompt = `You are a meeting preparation assistant. Generate a concise, practical meeting prep for the following meeting.

Meeting: ${meeting.title || thread.subtitle}
Time: ${startTime}
Participants: ${participantList}${description}

Provide exactly three short sections using these markdown headers:

## Key Context
(2-3 bullets on the likely purpose, relationship, and what each person is likely to want)

## Topics to Cover
(2-3 bullets on specific agenda items or discussion points)

## Questions to Ask
(2-3 sharp, specific questions to raise in this meeting)

Be direct, specific, and concise. No filler text.`

    addToLLMQueue({
      prompt,
      semanticSearchQuery: `meeting preparation ${meeting.title || thread.subtitle}`,
      documents: [],
      messageStreamCallback: (chunk) => {
        setPrepContent(prev => prev + chunk)
      },
      messageFinishCallback: async (response) => {
        setPrepContent(response)
        setIsPrepGenerating(false)
        return undefined
      },
      errorCallback: () => {
        setIsPrepGenerating(false)
      },
    })
  }

  return (
    <div className="notetaker-note">
      <div className="notetaker-note__container">
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  className="notetaker-note__title-input"
                  value={editableTitle}
                  onChange={e => setEditableTitle(e.target.value)}
                  onBlur={saveTitleEdit}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); saveTitleEdit() }
                    else if (e.key === 'Escape') setIsEditingTitle(false)
                  }}
                  placeholder="Meeting title..."
                />
              ) : (
                <h1
                  className="notetaker-note__title"
                  onClick={!thread.recorded ? () => { setIsEditingTitle(true) } : undefined}
                  style={!thread.recorded ? { cursor: 'text' } : undefined}
                >
                  {thread.subtitle}
                </h1>
              )}
              {/* Metadata row */}
              <div className="notetaker-note__meta">
                {recordingHandlers.isRecording(thread.id) && (
                  <span className="notetaker-note__meta-item notetaker-note__meta-item--recording">
                    <span className="notetaker-note__recording-dot" />
                    Recording
                  </span>
                )}
                <span className="notetaker-note__meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {dayjs(new Date()).isSame(dayjs(meeting?.start ? meeting.start * 1000 : undefined), 'day') ? 'Today' : dayjs(meeting?.start ? meeting.start * 1000 : undefined).format('MMM D')}
                </span>
                {meeting?.participants && meeting.participants.length > 0 && (
                  <span className="notetaker-note__meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {meeting.participants.slice(0, 3).map(p => p.name || p.email.split('@')[0]).join(', ')}
                    {meeting.participants.length > 3 && ` +${meeting.participants.length - 3}`}
                  </span>
                )}
                {thread.recorded && !meeting && sameDayMeetings.length > 0 && (
                  <div className="notetaker-note__link-event-wrap" ref={calendarPickerRef}>
                    <button
                      className="notetaker-note__link-event-btn"
                      onClick={() => setShowCalendarPicker(v => !v)}
                      title="Link to a calendar event"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Link to calendar event
                    </button>
                    {showCalendarPicker && (
                      <div className="notetaker-note__calendar-picker">
                        {sameDayMeetings.map(m => (
                          <button
                            key={m.event_id}
                            className="notetaker-note__calendar-picker-item"
                            onClick={() => {
                              if (feedItemId != null) {
                                feed.attachNotesToCalendarEvent(feedItemId, m)
                              }
                              setShowCalendarPicker(false)
                              setSuggestedCalendarEvent(null)
                            }}
                          >
                            <span className="notetaker-note__calendar-picker-time">
                              {dayjs(m.start * 1000).format('h:mm A')}
                            </span>
                            <span className="notetaker-note__calendar-picker-title">
                              {m.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              {!thread.recorded && (
                <RecordControlPanel
                  onClickJoin={() => handleRecordClick(true)}
                  onClickEnd={() => handleStopRecording('Manually')}
                  onClickPause={() => recordingHandlers.pauseRecording()}
                  onClickResume={() => handleRecordClick(false)}
                  isRecording={recordingHandlers.isRecording(thread.id)}
                  isDisabled={disableIsRecording}
                  isSynthesizing={isSynthesizing()}
                  isPaused={recordingHandlers.isPaused}
                />
              )}
              {isSynthesizing() && !synthTimedOut && (
                <div className="inline-flex justify-center items-center">
                  <div className="text-right text-stone-500 text-sm font-normal font-Inter leading-tight max-w-[18rem]">
                    <TransitionGroup className="relative overflow-hidden whitespace-nowrap h-6">
                      <CSSTransition
                        key={transcribingTextIndex}
                        timeout={400}
                        classNames={{
                          enter: 'translate-x-full',
                          enterActive:
                            'translate-x-0 transition-transform duration-400 ease-in-out',
                          exit: 'translate-x-0',
                          exitActive:
                            '-translate-x-full transition-transform duration-400 ease-in-out',
                        }}
                      >
                        <div className="absolute inset-0">
                          {transcribingTexts[transcribingTextIndex]}
                        </div>
                      </CSSTransition>
                    </TransitionGroup>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recording notice */}
        {recordingHandlers.isRecording(thread.id) && (
          <MeetingChatNotice meetingPlatform={meeting?.meeting_platform} />
        )}

        {/* Attach-to-calendar-event prompt */}
        {suggestedCalendarEvent && (
          <div className="notetaker-note__attach-banner">
            <span className="notetaker-note__attach-banner-text">
              Attach these notes to <strong>&ldquo;{suggestedCalendarEvent.title}&rdquo;</strong>?
            </span>
            <button
              className="notetaker-note__attach-banner-yes"
              onClick={() => {
                if (feedItemId != null) {
                  feed.attachNotesToCalendarEvent(feedItemId, suggestedCalendarEvent)
                }
                setSuggestedCalendarEvent(null)
              }}
            >
              Yes, attach
            </button>
            <button
              className="notetaker-note__attach-banner-no"
              onClick={() => setSuggestedCalendarEvent(null)}
            >
              No
            </button>
          </div>
        )}

        {/* Permission error banner */}
        {permissionError && !recordingHandlers.isRecording(thread.id) && (
          <div className="notetaker-note__permission-error">
            <div className="notetaker-note__permission-error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="notetaker-note__permission-error-content">
              <strong>Microphone access required</strong>
              <p>{permissionError}</p>
              <div className="notetaker-note__permission-error-steps">
                <p><strong>To fix:</strong></p>
                <ol>
                  <li>Open <strong>System Settings</strong> &rarr; <strong>Privacy &amp; Security</strong> &rarr; <strong>Microphone</strong></li>
                  <li>Toggle <strong>Knapsack</strong> on (or off then on if already enabled)</li>
                  <li>Restart Knapsack and try recording again</li>
                </ol>
              </div>
            </div>
            <button
              className="notetaker-note__permission-error-dismiss"
              onClick={() => setPermissionError(null)}
              title="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Tab bar for template, transcript, tasks - hidden during active recording for clean view */}
        {!recordingHandlers.isRecording(thread.id) && (
          <MeetingNotesTabBar
            thread={thread}
            feedItemId={feedItemId}
            feed={feed}
            templateLabel={templatePrompt.title}
            hasActionItems={hasActionItems()}
            onOpenTemplatesClick={handleOpenTemplates}
            onViewTranscriptClick={handleOpenTranscript}
            onTasksButtonClick={handleTasksButtonClick}
            onInsightsClick={handleOpenInsights ? () => handleOpenInsights(thread.id) : undefined}
            onCopyClick={() => {
              if (copyToClipboard) copyToClipboard(notesMarkdown)
            }}
            canChangeTemplate={true}
            isEditing={isEditing}
            onEditClick={onEditClick}
          />
        )}

        {/* Editor - always shown, focused during recording */}
        {isEditing ? (
          <div className={`notetaker-note__editor ${recordingHandlers.isRecording(thread.id) ? 'notetaker-note__editor--recording' : ''}`}>
            {!recordingHandlers.isRecording(thread.id) && (
              <div className="border-0 border-b-[1px] outline-none mx-3 py-1">
                <div className="flex flex-wrap gap-1 rounded-md px-2">
                  <div className="flex gap-1 font-RobotoMono">
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      isActive={editor.isActive('bold')}
                      title="Bold (Cmd + B)"
                    >
                      <span className="font-bold">B</span>
                    </MenuButton>
                    <MenuButton
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      isActive={editor.isActive('italic')}
                      title="Italic (Cmd + I)"
                    >
                      <span className="italic">I</span>
                    </MenuButton>
                    <div className="w-px h-6 bg-gray-200 mt-2 mx-2" />

                    <div className="flex gap-1">
                      <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                      >
                        H1
                      </MenuButton>

                      <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                      >
                        H2
                      </MenuButton>

                      <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                      >
                        • List
                      </MenuButton>

                      <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                      >
                        1. List
                      </MenuButton>
                    </div>

                    <div className="w-px h-6 bg-gray-200 mt-2 mx-1" />

                    <div className="flex gap-1">
                      <MenuButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Horizontal Rule (---)"
                      >
                        <span>―</span>
                      </MenuButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="text-left text-wrap max-w-[85vh] min-h-[320px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <MarkdownDisplay markdown={notesMarkdown}
            onChange={(updatedMarkdown) => {
              setNotesMarkdown(updatedMarkdown)
              saveNotes(thread.id, updatedMarkdown)
            }}
          />
        )}

        {/* Meeting prep: shown when notes are empty and not recording */}
        {!notesMarkdown.trim() &&
          !recordingHandlers.isRecording(thread.id) &&
          !isSynthesizing() &&
          meeting && (
            <div className="notetaker-note__prep">
              <div className="notetaker-note__prep-header-row">
                <span className="notetaker-note__prep-header">Meeting Prep</span>
                {!prepContent && (
                  <button
                    className="notetaker-note__prep-generate"
                    onClick={generatePrep}
                    disabled={isPrepGenerating}
                  >
                    {isPrepGenerating ? (
                      <>
                        <span className="notetaker-note__prep-spinner" />
                        Generating...
                      </>
                    ) : 'Generate'}
                  </button>
                )}
              </div>

              {/* Static metadata rows */}
              {getEventUrl(meeting) && (
                <div className="notetaker-note__prep-row">
                  <span className="notetaker-note__prep-label">Video</span>
                  <a
                    href={getEventUrl(meeting)}
                    className="notetaker-note__prep-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {meeting.meeting_platform === 'zoom'
                      ? 'Zoom'
                      : meeting.meeting_platform === 'teams'
                        ? 'Microsoft Teams'
                        : 'Google Meet'}
                  </a>
                </div>
              )}
              {!getEventUrl(meeting) && meeting.location && (
                <div className="notetaker-note__prep-row">
                  <span className="notetaker-note__prep-label">Location</span>
                  <span className="notetaker-note__prep-value">{meeting.location}</span>
                </div>
              )}
              {meeting.participants && meeting.participants.length > 0 && (
                <div className="notetaker-note__prep-row">
                  <span className="notetaker-note__prep-label">Attendees</span>
                  <div className="notetaker-note__prep-chips">
                    {meeting.participants.map((p, i) => {
                      const ws = personWorkspaces[p.email?.toLowerCase()]
                      const label = p.name || p.email.split('@')[0]
                      if (ws && onLibraryWorkspaceOpen) {
                        return (
                          <button
                            key={i}
                            className="notetaker-note__prep-chip notetaker-note__prep-chip--linked"
                            onClick={() => onLibraryWorkspaceOpen(ws)}
                            title={`Open ${label}'s library record`}
                          >
                            {label}
                          </button>
                        )
                      }
                      if (onAttendeeClick) {
                        return (
                          <button
                            key={i}
                            className="notetaker-note__prep-chip notetaker-note__prep-chip--clickable"
                            onClick={() => onAttendeeClick(p.email, label)}
                            title={p.email}
                          >
                            {label}
                          </button>
                        )
                      }
                      return (
                        <span key={i} className="notetaker-note__prep-chip">
                          {label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* AI-generated prep content */}
              {prepContent && (
                <div className="notetaker-note__prep-ai">
                  <MarkdownDisplay
                    markdown={prepContent}
                    onChange={() => {}}
                  />
                </div>
              )}
            </div>
          )}

      </div>

      {/* Notetaker bottom bar */}
      <div className="notetaker-note__bottom-bar">
        {recordingHandlers.isRecording(thread.id) ? (
          <>
            <div className="notetaker-note__bottom-waveform">
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '0ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '150ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '300ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '450ms'}} />
              <span className="notetaker-note__waveform-bar" style={{animationDelay: '600ms'}} />
            </div>
            <div className="notetaker-note__bottom-recording-status">
              Privately transcribing...
            </div>
            <div className="flex-1" />
            <button
              className="notetaker-note__bottom-stop"
              onClick={() => handleStopRecording('Manually')}
            >
              Stop recording
            </button>
          </>
        ) : (
          <>
            <button className="notetaker-note__bottom-audio" title="Audio waveform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="8" x2="4" y2="16" />
                <line x1="8" y1="5" x2="8" y2="19" />
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="16" y1="5" x2="16" y2="19" />
                <line x1="20" y1="8" x2="20" y2="16" />
              </svg>
            </button>
            <div
              className="notetaker-note__bottom-chat"
              onClick={() => onChatClick?.()}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="text"
                placeholder="Continue chat"
                className="notetaker-note__bottom-chat-input"
                readOnly
                style={{ cursor: 'pointer' }}
              />
            </div>
            {thread.recorded && (
              <button
                className="notetaker-note__bottom-action"
                onClick={() => onEmailClick?.(notesMarkdown, meeting)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
                  <path d="M9 13h6" />
                  <path d="M9 17h3" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
                Write follow up email
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MeetingNotesMode
