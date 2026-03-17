import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

import { IThread, ThreadType } from 'src/api/threads'
import { Connection, ConnectionKeys } from 'src/api/connections'
import { LLMParams } from 'src/App'
import { IFeed } from 'src/hooks/feed/useFeed'
import { MeetingTemplatePrompt } from 'src/utils/template_prompts'

import { Button, ButtonVariant } from 'src/components/atoms/button'
import MeetingNotesMode from 'src/components/organisms/MeetingNotesMode'
import AudioPermissionChecker from 'src/components/molecules/AudioPermissionChecker'
import TemplatesView from 'src/components/organisms/TemplatesView'
import TranscriptView from 'src/components/organisms/TranscriptView'
import MeetingTasks from 'src/components/molecules/MeetingTasks'
import { RecordingContextProps } from 'src/components/organisms/MeetingNotesMode/RecordingContext'
import { TaskItem } from 'src/components/organisms/CenterWorkspace'

import CalendarIcon from '/assets/images/dataSources/gcal.svg'

import './style.scss'

interface TemplatesState {
  isOpen: boolean
  thread?: IThread
}

interface TranscriptState {
  isOpen: boolean
  threadId?: number
}

interface TasksState {
  isOpen: boolean
  threadId?: number
  tasks: TaskItem[]
}

interface MeetingsTabViewProps {
  feed: IFeed
  addToLLMQueue: (item: LLMParams) => void
  copyToClipboard: (text: string) => void
  handleErrorContact: (message: string) => void
  recordingHandlers: RecordingContextProps
  connections?: Record<string, Connection>
  onConnectCalendar?: () => void
}

const MeetingsTabView = ({
  feed,
  addToLLMQueue,
  copyToClipboard,
  handleErrorContact,
  recordingHandlers,
  connections,
  onConnectCalendar,
}: MeetingsTabViewProps) => {
  const [micPermission, setMicPermission] = useState(localStorage.getItem('micPermissionGranted') === 'true')
  const [screenPermission, setScreenPermission] = useState(localStorage.getItem('screenPermissionGranted') === 'true')
  const [permissionsDismissed, setPermissionsDismissed] = useState(
    localStorage.getItem('permissionsDismissed') === 'true'
  )
  const [synthesisState, setSynthesisState] = useState(false)

  // Panel state (ported from CenterWorkspace)
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({ isOpen: false })
  const [templatesState, setTemplatesState] = useState<TemplatesState>({ isOpen: false })
  const [tasksState, setTasksState] = useState<TasksState>({ isOpen: false, tasks: [] })

  const onSynthesisFinish = () => setSynthesisState(prev => !prev)

  // Check real OS permissions on mount instead of relying solely on localStorage
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await invoke<{
          microphone: boolean
          screen_recording: boolean
          all_granted: boolean
        }>('check_audio_permissions')

        setMicPermission(permissions.microphone)
        setScreenPermission(permissions.screen_recording)

        if (permissions.microphone) {
          localStorage.setItem('micPermissionGranted', 'true')
        } else {
          localStorage.removeItem('micPermissionGranted')
        }
        if (permissions.screen_recording) {
          localStorage.setItem('screenPermissionGranted', 'true')
        } else {
          localStorage.removeItem('screenPermissionGranted')
        }

        if (permissions.all_granted) {
          localStorage.setItem('permissionsDismissed', 'true')
          setPermissionsDismissed(true)
        }
      } catch {
        // Fall back to localStorage values (already set in initial state)
      }
    }
    checkPermissions()
  }, [])

  const selectedMeeting = feed.currentFeedItem()
  const isSelectedMeetingNote = selectedMeeting?.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)

  // Close templates panel when selected meeting changes
  useEffect(() => {
    setTemplatesState({ isOpen: false })
  }, [feed.currentFeedItem])

  // --- Panel handlers (ported from CenterWorkspace) ---

  const handleOpenTemplates = async (thread: IThread) => {
    if (tasksState.isOpen) {
      setTasksState(prev => ({ ...prev, isOpen: false }))
    }
    if (transcriptState.isOpen) {
      setTranscriptState(prev => ({ ...prev, isOpen: false }))
    }
    setTemplatesState(prev => ({
      isOpen: !prev.isOpen,
      thread: thread,
    }))
  }

  const handleOpenTranscript = async (threadId: number | undefined) => {
    if (!threadId) return
    if (templatesState.isOpen) {
      setTemplatesState(prev => ({ ...prev, isOpen: false }))
    }
    if (tasksState.isOpen) {
      setTasksState(prev => ({ ...prev, isOpen: false }))
    }
    setTranscriptState(prev => ({
      isOpen: !prev.isOpen || prev.threadId !== threadId,
      threadId: threadId,
    }))
  }

  const handleOpenTasks = (threadId: number | undefined, tasks: TaskItem[]) => {
    if (!threadId) return
    if (templatesState.isOpen) {
      setTemplatesState(prev => ({ ...prev, isOpen: false }))
    }
    if (transcriptState.isOpen) {
      setTranscriptState(prev => ({ ...prev, isOpen: false }))
    }
    setTasksState({ isOpen: true, threadId, tasks })
  }

  const closeTemplatesView = () => {
    setTemplatesState({ isOpen: false })
  }

  const closeTranscript = () => {
    setTranscriptState({ isOpen: false })
  }

  const closeTasks = () => {
    setTasksState(prev => ({ ...prev, isOpen: false }))
  }

  const setMeetingTemplatePrompt = async (meetingTemplate: MeetingTemplatePrompt) => {
    const updatedThread = templatesState.thread
    if (updatedThread) {
      updatedThread.promptTemplate = meetingTemplate.key
      feed.setThread(updatedThread, feed.currentFeedItem()?.id)
    }
  }

  // --- End panel handlers ---

  const showPermissionsOverlay = (!micPermission || !screenPermission) && !permissionsDismissed

  return (
    <div className="MeetingsTabView MeetingsTabView--granola w-full h-full overflow-hidden flex flex-row">
      {/* Main content area (sidebar is now handled by GranolaSidebar) */}
      <div className="MeetingsTabView__content MeetingsTabView__content--full">
        <div className="flex flex-row h-full">
          <div className="flex-grow overflow-y-auto overflow-x-hidden relative">
            {showPermissionsOverlay && (
              <AudioPermissionChecker
                onBothPermissionsGranted={() => {
                  setMicPermission(true)
                  setScreenPermission(true)
                  localStorage.setItem('permissionsDismissed', 'true')
                  setPermissionsDismissed(true)
                }}
                onClose={() => {
                  localStorage.setItem('permissionsDismissed', 'true')
                  setPermissionsDismissed(true)
                }}
              />
            )}

            {!selectedMeeting || !isSelectedMeetingNote ? (
              <div className="MeetingsTabView__welcome MeetingsTabView__welcome--granola">
                <div className="MeetingsTabView__welcome-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C8A951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h1 className="MeetingsTabView__welcome-title">Select a meeting to view notes</h1>
                <p className="MeetingsTabView__welcome-subtitle">
                  Choose a meeting from the sidebar, or start a new recording
                </p>
                <div className="MeetingsTabView__welcome-actions">
                  <button
                    className="MeetingsTabView__quick-note-btn"
                    onClick={() => feed.createNewMeeting()}
                  >
                    + Quick note
                  </button>
                </div>
                {/* Calendar connection prompt */}
                {connections && !connections[ConnectionKeys.GOOGLE_CALENDAR] && !connections[ConnectionKeys.MICROSOFT_CALENDAR] && onConnectCalendar && (
                  <div className="MeetingsTabView__calendar-prompt MeetingsTabView__calendar-prompt--granola">
                    <div className="MeetingsTabView__calendar-prompt-content">
                      <img src={CalendarIcon} alt="Calendar" className="MeetingsTabView__calendar-prompt-icon" />
                      <div className="MeetingsTabView__calendar-prompt-text">
                        <p className="MeetingsTabView__calendar-prompt-title">Connect your calendar</p>
                        <p className="MeetingsTabView__calendar-prompt-subtitle">
                          Get notified when meetings start and automatically join with one click
                        </p>
                      </div>
                      <Button
                        label="Connect Calendar"
                        variant={ButtonVariant.borderBlue}
                        onClick={onConnectCalendar}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`MeetingsTabView__meeting-content ${showPermissionsOverlay ? 'pointer-events-none' : ''}`}>
                {(() => {
                  const notesThread = selectedMeeting.threads
                    ?.find(thread => thread.threadType === ThreadType.MEETING_NOTES)
                  return notesThread ? (
                    <MeetingNotesMode
                      key={notesThread.id}
                      feedItemId={selectedMeeting.id}
                      item={selectedMeeting}
                      thread={notesThread}
                      timestamp={selectedMeeting.timestamp}
                      runParam={selectedMeeting.run ? (selectedMeeting.run?.runParams as string) : undefined}
                      meeting={selectedMeeting.getCalendarEvent()}
                      addToLLMQueue={addToLLMQueue}
                      setFeedIsRecording={(isRecording: boolean | undefined = undefined) =>
                        feed.setIsRecording(selectedMeeting, isRecording)
                      }
                      copyToClipboard={copyToClipboard}
                      feed={feed}
                      synthesisState={synthesisState}
                      onSynthesisFinish={onSynthesisFinish}
                      handleOpenTemplates={handleOpenTemplates}
                      handleOpenTranscript={handleOpenTranscript}
                      closeTranscript={closeTranscript}
                      closeTasks={closeTasks}
                      handleErrorContact={handleErrorContact}
                      recordingHandlers={recordingHandlers}
                      handleOpenTasks={handleOpenTasks}
                    />
                  ) : null
                })()}
              </div>
            )}
          </div>

          {/* Right-side panels (Templates, Transcript, Tasks) */}
          {transcriptState.isOpen && transcriptState.threadId && (
            <TranscriptView threadId={transcriptState.threadId} onClose={closeTranscript} />
          )}
          {templatesState.isOpen && templatesState.thread && (
            <TemplatesView
              thread={templatesState.thread}
              onClose={closeTemplatesView}
              setMeetingTemplatePrompt={setMeetingTemplatePrompt}
            />
          )}
          {tasksState.isOpen && tasksState.threadId && (
            <MeetingTasks
              threadId={tasksState.threadId}
              tasks={tasksState.tasks}
              onClose={closeTasks}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingsTabView
