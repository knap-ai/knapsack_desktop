import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { mergeAttributes } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItemExtension from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash/debounce'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { getDocumentInfos, getDriveDocumentsIds } from 'src/api/data_source'
import { FeedItem } from 'src/api/feed_items'
import { isRecordingStatus, statusRecordByThreadID } from 'src/api/recording'
import { IThread, ThreadType } from 'src/api/threads'
import { getSavedTranscript } from 'src/api/transcripts'
import { LLMParams } from 'src/App'
import { Meeting } from 'src/hooks/dataSources/useCalendar'
import { IFeed } from 'src/hooks/feed/useFeed'
import { useMeetingSynthesis } from 'src/hooks/useMeetingMode'
import { KN_API_NOTES } from 'src/utils/constants'
import DataFetcher from 'src/utils/data_fetch'
import { extractExternalEmails, extractInternalEmails, extractWorkDomains } from 'src/utils/emails'
import { logError } from 'src/utils/errorHandling'
import { KNFileType } from 'src/utils/KNSearchFilters'
import KNAnalytics from 'src/utils/KNAnalytics'
import { enterMeetingWindowLayout } from 'src/utils/meetingWindowLayout'
import { normalizeMeetingNotesMarkdown } from 'src/utils/meetingNotesMarkdown'
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
import ClawdChat from 'src/components/organisms/ClawdChat'

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
  handleOpenTranscript: (FeedItemId: number | undefined, participantNames?: string[]) => void
  handleErrorContact: (message: string) => void
  closeTranscript: () => void
  closeTasks: () => void
  recordingHandlers: RecordingContextProps
  handleOpenTasks?: (threadId: number | undefined, tasks: TaskItem[]) => void
  handleOpenInsights?: (threadId: number | undefined) => void
  onEmailClick?: (notesMarkdown: string, meeting: Meeting | undefined) => void
  onLibraryWorkspaceOpen?: (ws: Workspace) => void
  hasEmailContext?: boolean
  onConnectEmail?: () => void
  userEmail?: string
  userEmails?: string[]
  userName?: string
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
  onEmailClick,
  onLibraryWorkspaceOpen,
  hasEmailContext = false,
  onConnectEmail,
  userEmail,
  userEmails = [],
  userName,
}) => {
  useEffect(() => enterMeetingWindowLayout(), [])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const initialLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [disableIsRecording, setDisableIsRecording] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isEndingMeeting, setIsEndingMeeting] = useState(false)
  const [notesMarkdown, setNotesMarkdown] = useState<string>('')
  const [personWorkspaces, setPersonWorkspaces] = useState<Record<string, Workspace>>({})
  const [isMeetingChatOpen, setIsMeetingChatOpen] = useState(false)
  const [meetingChatInitialInput, setMeetingChatInitialInput] = useState(
    'What should I pay attention to in this meeting?',
  )
  const [meetingTranscriptContext, setMeetingTranscriptContext] = useState('')
  const [briefPrepContent, setBriefPrepContent] = useState('')
  const [isBriefPrepGenerating, setIsBriefPrepGenerating] = useState(false)
  const [briefPrepDismissed, setBriefPrepDismissed] = useState(false)
  const [briefPrepExpanded, setBriefPrepExpanded] = useState(true)
  const [emailContextBannerDismissed, setEmailContextBannerDismissed] = useState(false)
  const [briefPrepSources, setBriefPrepSources] = useState<string[]>(['Calendar'])
  const briefPrepTriggeredRef = useRef(false)
  const missingNotesRecoveryTriggeredRef = useRef(false)

  useEffect(() => {
    missingNotesRecoveryTriggeredRef.current = false
  }, [thread.id])

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
  const [showLiveBanner, setShowLiveBanner] = useState(false)
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

  // Keep editableTitle in sync with the prop when not actively editing (handles
  // external changes like auto-title from notes synthesis or calendar auto-attach)
  useEffect(() => {
    if (!isEditingTitle) {
      setEditableTitle(thread.subtitle || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.subtitle])

  const saveTitleEdit = () => {
    const trimmed = editableTitle.trim()
    if (trimmed && trimmed !== thread.subtitle) {
      feed.renameMeeting(thread.id, trimmed, feedItemId)
      setIsTitleSet(true)
    }
    setIsEditingTitle(false)
  }

  const openMeetingChat = () => {
    setMeetingChatInitialInput('What should I pay attention to in this meeting?')
    setBriefPrepExpanded(true)
    setIsMeetingChatOpen(true)
  }

  useEffect(() => {
    if (!isMeetingChatOpen || !thread.savedTranscript) return
    let cancelled = false
    getSavedTranscript(thread.id.toString()).then(data => {
      if (cancelled || !data?.content) return
      setMeetingTranscriptContext(extractTranscriptBodyForContext(data.content))
    }).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isMeetingChatOpen, thread.id, thread.savedTranscript])

  const meetingChatContext = useMemo(() => {
    const participantList = meeting?.participants
      ?.map(p => p.name ? `${p.name} (${p.email})` : p.email)
      .filter(Boolean)
      .join(', ') || 'Unknown'
    const lines = [
      'You are answering from the inline meeting chat. Answer from the meeting brief, notes, transcript, and details below before using broader memory.',
      'You have the same browser, web search, native integrations, and Knapsack Studio connector tools as the main chat. Use them when they materially improve the answer or when the user asks you to look something up.',
      'For transcript or note questions, use the local meeting tools with the thread id below if the embedded snapshot is incomplete. If a required Studio connector is disconnected, explain which one is needed so the chat can offer its inline Connect action.',
      `The user is ${userName || 'the signed-in user'}${userEmail ? ` (${userEmail})` : ''}. Address the user directly and do not confuse them with external attendees.`,
      '',
      'Meeting details:',
      `- Title: ${meeting?.title || thread.subtitle || 'Meeting'}`,
      `- Meeting thread id: ${thread.id}`,
      `- Participants: ${participantList}`,
      meeting?.start ? `- Start: ${dayjs.unix(meeting.start).format('MMM D, YYYY h:mm A')}` : '',
      meeting?.end ? `- End: ${dayjs.unix(meeting.end).format('MMM D, YYYY h:mm A')}` : '',
      meeting?.description ? `- Description: ${meeting.description}` : '',
      `- Recording status: ${recordingHandlers.isRecording(thread.id) ? 'currently recording' : 'not recording'}`,
      '',
      'Current meeting brief:',
      briefPrepContent || 'No brief is available yet.',
      '',
      'Current notes:',
      notesMarkdown || 'No notes yet.',
      '',
      'Transcript:',
      meetingTranscriptContext || (thread.savedTranscript ? 'Transcript is being loaded or unavailable.' : 'No saved transcript yet. If the meeting is still live, rely on current notes and meeting details.'),
    ]
    return lines.filter(line => line !== '').join('\n')
  }, [briefPrepContent, meeting, meetingTranscriptContext, notesMarkdown, recordingHandlers, thread.id, thread.savedTranscript, thread.subtitle, userEmail, userName])

  const [transcribingTextIndex, setTranscribingTextIndex] = useState(0)
  const transcribingTexts = [
    'Privately transcribing...',
    'Deleting recording/transcript from server...',
    'Generating meeting notes...',
    'Deleting meeting notes from server...',
    'Saving transcript locally...',
    'Transcript saved',
  ]
  // Completed meetings should open as polished notes. Editing is opt-in so the
  // document doesn't flash a toolbar or flatten rich Markdown on first render.
  const [isEditing, setIsEditing] = useState(!thread.recorded)
  const [prepContent, setPrepContent] = useState('')
  const [isPrepGenerating, setIsPrepGenerating] = useState(false)
  const [suggestedCalendarEvent, setSuggestedCalendarEvent] = useState<Meeting | null>(null)
  const [showCalendarPicker, setShowCalendarPicker] = useState(false)
  const [showAttendeePicker, setShowAttendeePicker] = useState(false)
  const calendarPickerRef = useRef<HTMLDivElement>(null)
  const attendeePickerRef = useRef<HTMLDivElement>(null)

  const [inlineInsights, setInlineInsights] = useState<Array<{id: number; mins: number; text: string}>>([])
  const sameDayMeetings = useMemo(() => {
    if (!feed.meetings || meeting) return []
    const day = dayjs(timestamp).format('YYYY-MM-DD')
    return Object.values(feed.meetings).filter(
      m => dayjs(m.start * 1000).format('YYYY-MM-DD') === day,
    ).sort((a, b) => a.start - b.start)
  }, [feed.meetings, timestamp, meeting])

  const attendeeEmails = useMemo(
    () => meeting?.participants.map(p => p.email).filter(Boolean) ?? [],
    [meeting?.participants],
  )

  const attendeeNames = useMemo(
    () => meeting?.participants.map(p => p.name || p.email.split('@')[0]).filter(Boolean) ?? [],
    [meeting?.participants],
  )

  const userEmailSet = useMemo(
    () => new Set([userEmail, ...userEmails]
      .filter((email): email is string => !!email)
      .map(email => email.trim().toLowerCase())),
    [userEmail, userEmails],
  )

  const otherParticipants = useMemo(
    () => meeting?.participants.filter(
      p => !userEmailSet.has(p.email.trim().toLowerCase()),
    ) ?? [],
    [meeting?.participants, userEmailSet],
  )

  const otherParticipantEmails = useMemo(
    () => otherParticipants.map(participant => participant.email).filter(Boolean),
    [otherParticipants],
  )

  const externalDomains = useMemo(() => {
    if (!userEmail || otherParticipantEmails.length === 0) return []
    return Array.from(new Set(extractWorkDomains(userEmail, otherParticipantEmails)))
  }, [otherParticipantEmails, userEmail])

  const buildBriefPrepDocuments = useCallback(async () => {
    if (!meeting || !userEmail || attendeeEmails.length === 0) {
      return { documents: [] as number[], sources: ['Calendar'] }
    }

    const dataFetcher = new DataFetcher()
    const internalEmails = extractInternalEmails(userEmail, otherParticipantEmails)
    const externalEmails = extractExternalEmails(userEmail, otherParticipantEmails)
    const sourceSet = new Set<string>(['Calendar'])
    const documents = new Set<number>()

    try {
      const emailDocs = (
        await Promise.all([
          internalEmails.length
            ? dataFetcher.getGmailSearchResultsByAddresses(internalEmails)
            : Promise.resolve([]),
          externalEmails.length
            ? dataFetcher.getGmailSearchResultsByAddresses(externalEmails)
            : Promise.resolve([]),
        ])
      ).flat()

      emailDocs.forEach(doc => {
        if (doc.documentId) documents.add(doc.documentId)
      })
      if (emailDocs.length > 0) sourceSet.add('Email')
    } catch {
      // Briefs should still render from calendar/search context if mail search is unavailable.
    }

    try {
      const driveIds = await getDriveDocumentsIds(otherParticipantEmails, userEmail)
      const driveDocuments = driveIds.length
        ? await getDocumentInfos(
            driveIds,
            driveIds.map(() => KNFileType.DRIVE_FILE),
            userEmail,
          )
        : []

      driveDocuments.forEach(doc => {
        if (doc.documentId) documents.add(doc.documentId)
      })
      if (driveDocuments.length > 0) sourceSet.add('Drive')
    } catch {
      // Drive is opportunistic context; do not block the meeting surface on it.
    }

    sourceSet.add('Previous notes')
    if (externalDomains.length > 0) sourceSet.add('Web')

    return { documents: Array.from(documents).slice(0, 12), sources: Array.from(sourceSet) }
  }, [attendeeEmails.length, externalDomains.length, meeting, otherParticipantEmails, userEmail])

  useEffect(() => {
    if (!showCalendarPicker && !showAttendeePicker) return
    const handler = (e: MouseEvent) => {
      if (calendarPickerRef.current && !calendarPickerRef.current.contains(e.target as Node)) {
        setShowCalendarPicker(false)
      }
      if (attendeePickerRef.current && !attendeePickerRef.current.contains(e.target as Node)) {
        setShowAttendeePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAttendeePicker, showCalendarPicker])

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
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'notetaker-note__table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: { class: 'notetaker-note__task-list' },
      }),
      TaskItemExtension.configure({ nested: true }),
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
      // Safety timeout: if fetchNotes hangs (e.g. server temporarily busy),
      // clear the skeleton after 8 seconds so the view isn't stuck forever.
      if (initialLoadingTimerRef.current) clearTimeout(initialLoadingTimerRef.current)
      initialLoadingTimerRef.current = setTimeout(() => setIsInitialLoading(false), 8000)
      fetchNotes()
      refreshStatus()
    }
    return () => {
      if (initialLoadingTimerRef.current) clearTimeout(initialLoadingTimerRef.current)
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
      const unlistenAutoStartRecordingPromise = listen(
        'stop_recording',
        async (event: Event<{ threadId?: number | null }>) => {
        if (event.payload?.threadId && event.payload.threadId !== thread.id) return

        const statusDisable = await isRecordingStatus()
        if (statusDisable && statusDisable.isRecording) {
          setDisableIsRecording(statusDisable.threadId !== thread.id)
        }
        // Do NOT update isRecording state here — stopRecording() manages it.
        // Setting it to false before calling handleStopRecording would cause
        // wasRecording to be false inside stopRecording, preventing note generation.
        requestStopRecording('Automatic')
      },
    )
    // Listen for heartbeat insights during recording — always show inline, notify if proactive mode on
    const unlistenHeartbeatPromise = listen(
      'meeting_heartbeat',
      async (event: Event<{ threadId: number; insight: string; elapsedMinutes: number }>) => {
        const { insight, elapsedMinutes } = event.payload
        const mins = Math.round(elapsedMinutes)
        setInlineInsights(prev => [...prev, { id: Date.now(), mins, text: insight }])
        const isProactive = localStorage.getItem('moltbot_proactive_mode') === 'true'
        if (isProactive) {
          invoke('show_notification_window', {
            eventId: null,
            buttonConfigs: [{ buttonText: 'Dismiss', buttonHandler: 'dismiss_notification_handler' }],
            title: `Meeting insight (${mins} min)`,
            time: insight,
          }).catch(e => console.error('Failed to show meeting insight notification:', e))
        }
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

  // Auto-generate brief meeting prep when a calendar meeting opens for the first time
  useEffect(() => {
    if (!meeting?.event_id || thread.recorded || briefPrepTriggeredRef.current) return
    briefPrepTriggeredRef.current = true
    setIsBriefPrepGenerating(true)
    setBriefPrepSources(['Calendar'])
    // Safety timeout: if the gateway doesn't respond within 30s, clear the spinner
    const briefPrepTimeout = setTimeout(() => setIsBriefPrepGenerating(false), 30000)
    const participantList = meeting.participants
      .map(p => {
        const participant = p.name ? `${p.name} (${p.email})` : p.email
        return userEmailSet.has(p.email.trim().toLowerCase()) ? `${participant} [you]` : participant
      })
      .join(', ')
    const otherParticipantList = otherParticipants
      .map(p => p.name ? `${p.name} (${p.email})` : p.email)
      .join(', ')
    const startTime = meeting.start
      ? dayjs.unix(meeting.start).format('MMM D, YYYY h:mm A')
      : 'unknown time'
    const desc = meeting.description ? ` Context: ${meeting.description}.` : ''
    buildBriefPrepDocuments().then(({ documents, sources }) => {
      if (sources.length > 0) setBriefPrepSources(sources)
      addToLLMQueue({
        prompt: `You are preparing ${userName || 'the signed-in user'}${userEmail ? ` (${userEmail})` : ''} for a meeting. Always write to this user as "you". Do not treat the user as an external customer, prospect, vendor, or attendee to research.

Use the provided calendar details, prior notes, email, drive, and semantic-search context when available.

Write a concise meeting brief in markdown with no preamble and exactly this structure:

**Why this meeting matters:** one sharp sentence from the user's point of view.

**Open threads:** 2-3 bullets about commitments, unresolved topics, recent interactions, or likely stakes for the user. If context is thin, say what is known from the calendar instead of inventing.

**People to know:** 1-3 bullets naming attendees other than the user and what the user should remember about them.

**Best move:** one direct recommendation for how the user should approach the conversation.

Meeting: ${meeting.title || thread.subtitle || 'Meeting'}
Time: ${startTime}
User: ${userName || 'Unknown'}${userEmail ? ` <${userEmail}>` : ''}
User email identities: ${Array.from(userEmailSet).join(', ') || 'unknown'}
All participants: ${participantList}
Participants other than the user: ${otherParticipantList || 'unknown'}${desc}
External domains: ${externalDomains.join(', ') || 'none'}

Be specific, compact, and useful while the user is joining the call.`,
        semanticSearchQuery: [
          meeting.title || thread.subtitle || 'meeting',
          otherParticipantList || participantList,
          externalDomains.join(' '),
          userName || '',
          'previous meeting notes recent email open threads agenda action items',
        ].filter(Boolean).join(' '),
        documents,
        messageStreamCallback: (chunk) => setBriefPrepContent(prev => prev + chunk),
        messageFinishCallback: async (response) => {
          clearTimeout(briefPrepTimeout)
          setBriefPrepContent(response)
          setIsBriefPrepGenerating(false)
          return undefined
        },
        errorCallback: () => {
          clearTimeout(briefPrepTimeout)
          setIsBriefPrepGenerating(false)
        },
      })
    }).catch(() => {
      clearTimeout(briefPrepTimeout)
      setIsBriefPrepGenerating(false)
    })
    return () => clearTimeout(briefPrepTimeout)
  }, [
    meeting?.event_id,
    buildBriefPrepDocuments,
    externalDomains,
    otherParticipants,
    thread.recorded,
    thread.subtitle,
    userEmail,
    userEmailSet,
    userName,
  ])

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

  const fetchNotes = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${KN_API_NOTES}/${thread.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const notesExist = data?.data?.exists === true
        if (notesExist) {
          const normalizedNotes = normalizeMeetingNotesMarkdown(data.data.notes || '')
          setNotesMarkdown(normalizedNotes)
          const parsedNotes = editor?.storage.markdown.parser.parse(normalizedNotes)
          editor?.commands.setContent(parsedNotes || normalizedNotes)
          return normalizedNotes
        } else {
          setMarkdown('')
          editor?.commands.setContent('')
          // A successful automatic stop can finish while the newly opened
          // meeting view is still restoring its recording state. Older builds
          // could therefore save the transcript without ever queuing synthesis.
          // Recover those meetings once when they are opened instead of leaving
          // a permanently blank summary.
          if (
            thread.recorded &&
            thread.savedTranscript &&
            !recordingHandlers.isLoadingNotes(thread.id) &&
            !isLLMLoading &&
            !missingNotesRecoveryTriggeredRef.current
          ) {
            missingNotesRecoveryTriggeredRef.current = true
            void recordingHandlers.generateNotes(
              thread.id,
              synthesizeContent,
              saveNotes,
              '',
              meeting,
            )
          }
          return null
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
    return null
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
      // Show the live recording banner on first start
      setShowLiveBanner(true)
      // Auto-attach to the calendar event that best overlaps with the current time
      if (!meeting && feed.meetings && feedItemId != null) {
        const nowMs = Date.now()
        const WINDOW_MS = 15 * 60 * 1000
        let bestMatch: Meeting | null = null
        let bestDist = Infinity
        for (const m of Object.values(feed.meetings)) {
          const startMs = m.start * 1000
          const endMs = m.end * 1000
          if (nowMs >= startMs - WINDOW_MS && nowMs <= endMs + WINDOW_MS) {
            const dist = Math.abs(startMs - nowMs)
            if (dist < bestDist) {
              bestDist = dist
              bestMatch = m
            }
          }
        }
        if (bestMatch) {
          feed.attachNotesToCalendarEvent(feedItemId, bestMatch)
          if (!isTitleSet) {
            feed.renameMeeting(thread.id, bestMatch.title, feedItemId)
            setEditableTitle(bestMatch.title)
            setIsTitleSet(true)
          }
        }
      }
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

  const requestStopRecording = async (type: string) => {
    setIsEndingMeeting(true)
    try {
      await handleStopRecording(type)
    } finally {
      setIsEndingMeeting(false)
    }
  }

  // Keep a ref so the listener below always calls the latest stop handler
  // without stale-closure issues (recordingHandlers changes each render when
  // isRecordingStates updates, so capturing it in a [thread.id]-scoped effect
  // means isRecording() always returned false and stop was silently skipped).
  const handleStopRecordingRef = React.useRef(requestStopRecording)
  handleStopRecordingRef.current = requestStopRecording

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

  const isEndingMeetingState = isEndingMeeting || (
    recordingHandlers.isLoadingNotes(thread.id) && !recordingHandlers.isRecording(thread.id) && !thread.recorded
  )
  const endingMeetingStatusText = isEndingMeeting
    ? 'Stopping recording and preparing your notes.'
    : transcribingTexts[transcribingTextIndex]

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
        <div className="notetaker-note__scroll-area">
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
                      else if (e.key === 'Escape') { setEditableTitle(thread.subtitle || ''); setIsEditingTitle(false) }
                    }}
                    placeholder="Meeting title..."
                  />
                ) : (
                  <h1
                    className="notetaker-note__title notetaker-note__title--editable"
                    onClick={() => { setIsEditingTitle(true) }}
                    title="Click to edit title"
                  >
                    {editableTitle || thread.subtitle}
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
                {!thread.recorded && !isEndingMeetingState && (
                  <RecordControlPanel
                    onClickJoin={() => handleRecordClick(true)}
                    onClickEnd={() => requestStopRecording('Manually')}
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
          {/* End-of-meeting progress */}
          {isEndingMeetingState && (
            <div className="notetaker-note__post-meeting-banner">
              <div className="notetaker-note__post-meeting-line">
                <span className="notetaker-note__post-meeting-wave" aria-hidden="true">
                  <span style={{ animationDelay: '0ms' }} />
                  <span style={{ animationDelay: '150ms' }} />
                  <span style={{ animationDelay: '300ms' }} />
                  <span style={{ animationDelay: '450ms' }} />
                </span>
                {endingMeetingStatusText}
              </div>
              <p className="notetaker-note__post-meeting-subtext">
                Your notes are being finalized. This should only take a moment.
              </p>
            </div>
          )}
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
            <MeetingChatNotice
              meetingPlatform={meeting?.meeting_platform}
              meetingUrl={meeting?.google_meet_url}
            />
          )}
        </div>
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
              onClick={() => requestStopRecording('Manually')}
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

  const getAttendeeLabel = (participant: { name: string; email: string }) =>
    participant.name || participant.email.split('@')[0]

  const getAttendeeInitials = (participant: { name: string; email: string }) => {
    const label = getAttendeeLabel(participant).trim()
    const parts = label.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return label.slice(0, 2).toUpperCase()
  }

  const handleAttendeeSelect = (participant: { name: string; email: string }) => {
    const workspace = personWorkspaces[participant.email?.toLowerCase()]
    if (!workspace || !onLibraryWorkspaceOpen) return
    setShowAttendeePicker(false)
    onLibraryWorkspaceOpen(workspace)
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
    <div className={`notetaker-note ${isMeetingChatOpen ? 'notetaker-note--chat-open' : ''}`}>
      <div className="notetaker-note__content-row">
      <div className="notetaker-note__scroll-area">
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
                    else if (e.key === 'Escape') { setEditableTitle(thread.subtitle || ''); setIsEditingTitle(false) }
                  }}
                  placeholder="Meeting title..."
                />
              ) : (
                <h1
                  className="notetaker-note__title notetaker-note__title--editable"
                  onClick={() => { setIsEditingTitle(true) }}
                  title="Click to edit title"
                >
                  {editableTitle || thread.subtitle}
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
                  <div className="notetaker-note__attendees-wrap" ref={attendeePickerRef}>
                    <button
                      type="button"
                      className="notetaker-note__meta-item notetaker-note__attendees-chip"
                      onClick={() => setShowAttendeePicker(prev => !prev)}
                      title="View attendees"
                    >
                      <span className="notetaker-note__attendee-stack" aria-hidden="true">
                        {meeting.participants.slice(0, 3).map((participant, index) => (
                          <span
                            key={`${participant.email}-${index}`}
                            className="notetaker-note__attendee-avatar"
                          >
                            {getAttendeeInitials(participant)}
                          </span>
                        ))}
                      </span>
                      <span className="notetaker-note__attendees-chip-text">
                        {meeting.participants.length} attendees
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {showAttendeePicker && (
                      <div className="notetaker-note__attendees-popover">
                        <div className="notetaker-note__attendees-popover-header">
                          <span>Attendees</span>
                          <span>{meeting.participants.length}</span>
                        </div>
                        <div className="notetaker-note__attendees-list">
                          {meeting.participants.map((participant, index) => {
                            const label = getAttendeeLabel(participant)
                            const workspace = personWorkspaces[participant.email?.toLowerCase()]
                            return (
                              <button
                                key={`${participant.email}-${index}`}
                                type="button"
                                className={`notetaker-note__attendee-row ${workspace ? '' : 'notetaker-note__attendee-row--disabled'}`}
                                onClick={() => handleAttendeeSelect(participant)}
                                disabled={!workspace || !onLibraryWorkspaceOpen}
                                title={workspace ? `Open ${label}'s library record` : 'No library entry yet'}
                              >
                                <span className="notetaker-note__attendee-row-avatar">
                                  {getAttendeeInitials(participant)}
                                </span>
                                <span className="notetaker-note__attendee-row-copy">
                                  <span className="notetaker-note__attendee-row-name">{label}</span>
                                  <span className="notetaker-note__attendee-row-email">{participant.email}</span>
                                </span>
                                <span className="notetaker-note__attendee-row-action">
                                  {workspace ? 'Open' : 'No entry'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
              {!thread.recorded && !isEndingMeetingState && (
                <RecordControlPanel
                  onClickJoin={() => handleRecordClick(true)}
                  onClickEnd={() => requestStopRecording('Manually')}
                  onClickPause={() => recordingHandlers.pauseRecording()}
                  onClickResume={() => handleRecordClick(false)}
                  isRecording={recordingHandlers.isRecording(thread.id)}
                  isDisabled={disableIsRecording}
                  isSynthesizing={isSynthesizing()}
                  isPaused={recordingHandlers.isPaused}
                />
              )}
              {isSynthesizing() && !isEndingMeetingState && !synthTimedOut && (
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
          {isEndingMeetingState && (
            <div className="notetaker-note__post-meeting-banner">
              <div className="notetaker-note__post-meeting-line">
                <span className="notetaker-note__post-meeting-wave" aria-hidden="true">
                  <span style={{ animationDelay: '0ms' }} />
                  <span style={{ animationDelay: '150ms' }} />
                  <span style={{ animationDelay: '300ms' }} />
                  <span style={{ animationDelay: '450ms' }} />
                </span>
                {endingMeetingStatusText}
              </div>
              <p className="notetaker-note__post-meeting-subtext">
                Your notes are being finalized. This should only take a moment.
              </p>
            </div>
          )}
        </div>

        {/* Recording notice */}
        {recordingHandlers.isRecording(thread.id) && (
          <MeetingChatNotice
            meetingPlatform={meeting?.meeting_platform}
            meetingUrl={meeting?.google_meet_url}
          />
        )}

        {/* Live recording welcome banner */}
        {recordingHandlers.isRecording(thread.id) && showLiveBanner && (
          <div className="notetaker-note__live-banner">
            <div className="notetaker-note__live-banner-title">Live meeting</div>
            <p className="notetaker-note__live-banner-line">
              <span className="notetaker-note__live-banner-waveform" aria-hidden="true">
                <span style={{animationDelay: '0ms'}} />
                <span style={{animationDelay: '150ms'}} />
                <span style={{animationDelay: '300ms'}} />
                <span style={{animationDelay: '450ms'}} />
              </span>
              Knapsack is <span className="notetaker-note__live-banner-em">transcribing</span> your meeting.
            </p>
            <p className="notetaker-note__live-banner-line">
              Write notes as you normally would. When the meeting ends, Knapsack will{' '}
              <span className="notetaker-note__live-banner-em">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline',verticalAlign:'middle',marginRight:2}}>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                enhance your notes
              </span>.
            </p>
            <button
              className="notetaker-note__live-banner-ok"
              onClick={() => setShowLiveBanner(false)}
            >
              Okay
            </button>
          </div>
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
        {!recordingHandlers.isRecording(thread.id) && !isEndingMeetingState && (
          <MeetingNotesTabBar
            thread={thread}
            feedItemId={feedItemId}
            feed={feed}
            templateLabel={templatePrompt.title}
            hasActionItems={hasActionItems()}
            onOpenTemplatesClick={handleOpenTemplates}
            onViewTranscriptClick={() => handleOpenTranscript(
              thread.id,
              meeting?.participants?.map(p => p.name || p.email).filter(Boolean),
            )}
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

        {/* Meeting brief drawer — auto-generated on open and kept available while recording */}
        {meeting && !thread.recorded && !briefPrepDismissed && (briefPrepContent || isBriefPrepGenerating) && (
          <div className={`notetaker-note__brief-drawer ${briefPrepExpanded ? 'notetaker-note__brief-drawer--expanded' : 'notetaker-note__brief-drawer--collapsed'}`}>
            <div className="notetaker-note__brief-drawer-header">
              <button
                className="notetaker-note__brief-drawer-toggle"
                onClick={() => setBriefPrepExpanded(prev => !prev)}
                title={briefPrepExpanded ? 'Collapse brief' : 'Expand brief'}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points={briefPrepExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
              </button>
              <div className="notetaker-note__brief-drawer-title-wrap">
                <span className="notetaker-note__brief-drawer-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  Your brief
                </span>
                <span className="notetaker-note__brief-drawer-subtitle">
                  {attendeeNames.length > 0
                    ? `${attendeeNames.slice(0, 2).join(', ')}${attendeeNames.length > 2 ? ` +${attendeeNames.length - 2}` : ''}`
                    : 'Prepared from meeting context'}
                </span>
              </div>
              <div className="notetaker-note__brief-drawer-actions">
                <button
                  className="notetaker-note__brief-drawer-miss"
                  onClick={() => {
                    setMeetingChatInitialInput('What did I miss? Compare the brief, current notes, and available meeting context.')
                    setIsMeetingChatOpen(true)
                    setBriefPrepExpanded(true)
                  }}
                >
                  What did I miss?
                </button>
                <button
                  className="notetaker-note__brief-drawer-dismiss"
                  onClick={() => setBriefPrepDismissed(true)}
                  title="Dismiss"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
            {briefPrepExpanded && (
              <div className="notetaker-note__brief-drawer-body">
                <div className="notetaker-note__brief-drawer-sources">
                  {briefPrepSources.map(source => (
                    <span key={source} className="notetaker-note__brief-source-chip">{source}</span>
                  ))}
                </div>
                {isBriefPrepGenerating && !briefPrepContent ? (
                  <p className="notetaker-note__brief-prep-card-loading">Preparing your meeting brief...</p>
                ) : (
                  <div className="notetaker-note__brief-prep-card-text">
                    <MarkdownDisplay markdown={briefPrepContent} onChange={() => {}} />
                  </div>
                )}
                {!hasEmailContext && !emailContextBannerDismissed && onConnectEmail && (
                  <div className="notetaker-note__brief-email-banner">
                    <div className="notetaker-note__brief-email-copy">
                      <strong>Missing email context?</strong>
                      <span>Connect mail to include recent threads with attendees.</span>
                    </div>
                    <button className="notetaker-note__brief-email-connect" onClick={onConnectEmail}>
                      Connect
                    </button>
                    <button
                      className="notetaker-note__brief-email-dismiss"
                      onClick={() => setEmailContextBannerDismissed(true)}
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inline insights — collected from heartbeat during recording, dismissable */}
        {inlineInsights.length > 0 && (
          <div className="notetaker-note__insights-inline">
            {inlineInsights.map(insight => (
              <div key={insight.id} className="notetaker-note__insight-card">
                <div className="notetaker-note__insight-card-header">
                  <span className="notetaker-note__insight-card-badge">{insight.mins} min</span>
                  <button
                    className="notetaker-note__insight-card-dismiss"
                    onClick={() => setInlineInsights(prev => prev.filter(i => i.id !== insight.id))}
                    title="Dismiss"
                  >
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <p className="notetaker-note__insight-card-text">{insight.text}</p>
              </div>
            ))}
          </div>
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
            <div className="notetaker-note__document notetaker-note__document--editing text-left text-wrap min-h-[320px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        ) : (
          <MarkdownDisplay
            markdown={notesMarkdown}
            className="notetaker-note__document notetaker-note__document--display"
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
      </div>

      </div>

      {isMeetingChatOpen && (
        <section className="notetaker-note__chat-overlay" aria-label="Meeting chat">
          <div className="notetaker-note__chat-overlay-handle" aria-hidden="true" />
          <button
            type="button"
            className="notetaker-note__chat-overlay-close"
            onClick={() => setIsMeetingChatOpen(false)}
            title="Close meeting chat"
            aria-label="Close meeting chat"
          >
            ×
          </button>
          <ClawdChat
            userName={userName}
            userEmail={userEmail}
            compact
            title="Ask about this meeting"
            contextPrefix={meetingChatContext}
            initialInput={meetingChatInitialInput}
            chatId={`meeting:${thread.id}`}
            sessionId={`meeting:${thread.id}`}
          />
        </section>
      )}

      {/* Notetaker bottom bar */}
      {(true) && (
      <div
        className={`notetaker-note__bottom-bar ${!recordingHandlers.isRecording(thread.id) ? 'notetaker-note__bottom-bar--chat-launcher' : ''}`}
      >
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
            {!isMeetingChatOpen && (
              <div
                className="notetaker-note__bottom-chat"
                onClick={openMeetingChat}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="text"
                  placeholder="Ask about the meeting"
                  className="notetaker-note__bottom-chat-input"
                  readOnly
                  style={{ cursor: 'pointer' }}
                />
              </div>
            )}
            <button
              className="notetaker-note__bottom-stop"
              onClick={() => requestStopRecording('Manually')}
            >
              Stop recording
            </button>
          </>
        ) : (
          <>
            {isEndingMeetingState ? (
              <span className="notetaker-note__post-meeting-line">
                <span className="notetaker-note__post-meeting-wave" aria-hidden="true">
                  <span style={{ animationDelay: '0ms' }} />
                  <span style={{ animationDelay: '150ms' }} />
                  <span style={{ animationDelay: '300ms' }} />
                  <span style={{ animationDelay: '450ms' }} />
                </span>
                {endingMeetingStatusText}
              </span>
            ) : (
              <>
                {!isMeetingChatOpen && <button className="notetaker-note__bottom-audio" title="Audio waveform">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="8" x2="4" y2="16" />
                    <line x1="8" y1="5" x2="8" y2="19" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="16" y1="5" x2="16" y2="19" />
                    <line x1="20" y1="8" x2="20" y2="16" />
                  </svg>
                </button>}
                {!isMeetingChatOpen && <div
                  className="notetaker-note__bottom-chat"
                  onClick={openMeetingChat}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="text"
                    placeholder="Continue chat"
                    className="notetaker-note__bottom-chat-input"
                    readOnly
                    style={{ cursor: 'pointer' }}
                  />
                </div>}
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
          </>
        )}
      </div>
      )}
    </div>
  )
}

const extractTranscriptBodyForContext = (raw: string) => {
  const parts = raw.split(/\n{3,}/).map(part => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join('\n\n') : raw.trim()
}

export default MeetingNotesMode
