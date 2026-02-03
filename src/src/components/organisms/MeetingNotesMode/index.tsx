import React, { useCallback, useEffect, useMemo, useState } from 'react'

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
import { IThread } from 'src/api/threads'
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

import { TaskItem } from '../CenterWorkspace'
import { RecordingContextProps } from './RecordingContext'

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
}

const MeetingNotesMode: React.FC<MeetingNotesModeProps> = ({
  thread,
  meeting,
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
}) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [disableIsRecording, setDisableIsRecording] = useState(false)
  const [notesMarkdown, setNotesMarkdown] = useState<string>('')
  const [isTitleSet, setIsTitleSet] = useState(thread.subtitle !== 'Untitled Meeting')
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
      const statusRecord = await statusRecordByThreadID(thread.id)
      const statusDisable = await isRecordingStatus()
      recordingHandlers.setIsRecording(thread.id, statusRecord)
      if (statusDisable && statusDisable.isRecording) {
        setDisableIsRecording(statusDisable.threadId !== thread.id)
      }
      handleStopRecording('Automatic')
    })
    return () => {
      unlistenAutoStopRecordingPromise.then(unlisten => unlisten())
      unlistenAutoStartRecordingPromise.then(unlisten => unlisten())
    }
  }, [[thread.id, isLLMLoading, synthesisState]])

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
    } catch (err) {
      handleErrorContact("Couldn't start recording")
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
    recordingHandlers.setIsRecording(thread.id, false)
    let eventId = getEventId()
    KNAnalytics.trackEvent('Stop recording', { type: type, meetingId: eventId })
    const saveTranscript = await shouldSaveTranscript()

    try {
      recordingHandlers.stopRecording(
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
    } catch (err) {
      handleErrorContact("Couldn't stop recording")
    }
  }

  const isSynthesizing = useCallback(() => {
    return recordingHandlers.isLoadingNotes(thread.id) || isLLMLoading
  }, [recordingHandlers.isLoadingNotes, isLLMLoading])

  useEffect(() => {
    if (isSynthesizing()) {
      const timer = setInterval(() => {
        setTranscribingTextIndex(prevIndex => (prevIndex + 1) % transcribingTexts.length)
      }, 1600)

      return () => clearInterval(timer)
    } else {
      setTranscribingTextIndex(0)
    }
  }, [isSynthesizing])

  if (!editor || isInitialLoading) return null

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

  return (
    <div>
      <div className="TightShadow w-full max-w-[45rem] mx-auto flex flex-col gap-y-4 rounded-[10px] bg-white relative p-4 mb-2">
        <div className="w-full flex-col justify-start items-start gap-4 inline-flex">
          <div className={'flex-row self-stretch justify-between items-center inline-flex'}>
            <div className="mr-auto mb-4 justify-start items-start inline-flex">
              <div className="text-zinc-800 text-xl font-Lora font-bold leading-6">
                {thread.subtitle}
              </div>
            </div>
            <div className={' my-auto'}>
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
              {isSynthesizing() && (
                <div className="inline-flex justify-center items-center">
                  <div className="text-right text-stone-500 text-sm font-normal font-Inter leading-tight w-72">
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
        <MeetingNotesTabBar
          thread={thread}
          feedItemId={feedItemId}
          feed={feed}
          templateLabel={templatePrompt.title}
          hasActionItems={hasActionItems()}
          onOpenTemplatesClick={handleOpenTemplates}
          onViewTranscriptClick={handleOpenTranscript}
          onTasksButtonClick={handleTasksButtonClick}
          onCopyClick={() => {
            if (copyToClipboard) copyToClipboard(notesMarkdown)
          }}
          canChangeTemplate={true}
          isEditing={isEditing}
          onEditClick={onEditClick}
        />
        {recordingHandlers.isRecording(thread.id) && (
          <div className="h-[49px] bg-ks-red-100 border-ks-red-200 border rounded-md py-3 px-3 w-full flex items-center">
            <span className="text-ks-red-800 text-xxs font-semibold ml-2 font-InterTight mr-1 tracking-[0.08em]">
              RECORDING.
            </span>
            <span className="text-ks-red-800 text-xxs font-InterTight tracking-[0.08em]">
              PLEASE NOTIFY ATTENDEES THAT THIS MEETING IS BEING RECORDED
            </span>
          </div>
        )}
        {isEditing ? (
          <div className="border-[1px] rounded-lg">
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

      </div>
    </div>
  )
}

export default MeetingNotesMode
