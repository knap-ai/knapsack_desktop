import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeedItem } from 'src/api/feed_items'
import { IThread, ThreadType } from 'src/api/threads'
import { LLMParams } from 'src/App'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import { MeetingTemplatePrompt } from 'src/utils/template_prompts'

import { Button, ButtonVariant } from 'src/components/atoms/button'
import { Tooltip, TooltipVariant } from 'src/components/atoms/tooltip'
import MeetingNotesMode from 'src/components/organisms/MeetingNotesMode'
import AudioPermissionChecker from 'src/components/molecules/AudioPermissionChecker'
import ThreadPreviewCard from 'src/components/molecules/ThreadPreviewCard'
import TemplatesView from 'src/components/organisms/TemplatesView'
import TranscriptView from 'src/components/organisms/TranscriptView'
import MeetingTasks from 'src/components/molecules/MeetingTasks'
import { RecordingContextProps } from 'src/components/organisms/MeetingNotesMode/RecordingContext'
import { TaskItem } from 'src/components/organisms/CenterWorkspace'

import FeedSidebarArrowDown from '/assets/images/icons/FeedSidebarArrowDown.svg'
import Mic from '/assets/images/icons/mic-grey.svg'

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
}

const MeetingsTabView = ({
  feed,
  addToLLMQueue,
  copyToClipboard,
  handleErrorContact,
  recordingHandlers,
}: MeetingsTabViewProps) => {
  const [micPermission, setMicPermission] = useState(localStorage.getItem('micPermissionGranted') === 'true')
  const [screenPermission, setScreenPermission] = useState(localStorage.getItem('screenPermissionGranted') === 'true')
  const [synthesisState, setSynthesisState] = useState(false)
  const threadCardRef = useRef<HTMLDivElement>(null)

  // Panel state (ported from CenterWorkspace)
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({ isOpen: false })
  const [templatesState, setTemplatesState] = useState<TemplatesState>({ isOpen: false })
  const [tasksState, setTasksState] = useState<TasksState>({ isOpen: false, tasks: [] })

  const onSynthesisFinish = () => setSynthesisState(prev => !prev)

  // Check if any meeting is currently recording
  const isAnyRecording = useMemo(() => {
    if (!feed.feedContent) return false
    return Object.entries(feed.feedContent).some(([key, feedItems]) => {
      if (key === STATIONARY_ITEMS) return false
      return feedItems.some(item =>
        item.isRecording && item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)
      )
    })
  }, [feed.feedContent])

  // Build date-grouped meeting items (same pattern as FeedSidebar)
  const groupedMeetings = useMemo(() => {
    const groups: Record<string, { key: string; item: FeedItem }[]> = {}

    if (feed.feedContent) {
      Object.entries(feed.feedContent).forEach(([key, feedItems]) => {
        if (key === STATIONARY_ITEMS) return

        feedItems.forEach(item => {
          if (item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)) {
            const dateKey = key
            if (!groups[dateKey]) {
              groups[dateKey] = []
            }
            groups[dateKey].push({ key, item })
          }
        })
      })
    }

    // Sort items within each group by timestamp descending
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) => b.item.timestamp.getTime() - a.item.timestamp.getTime())
    })

    return groups
  }, [feed.feedContent])

  // Get ordered date keys (same as FeedSidebar)
  const orderedDateKeys = useMemo(() => {
    const keyTimestamps = Object.entries(groupedMeetings)
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({
        key,
        timestamp: items[0].item.timestamp,
      }))

    return KNDateUtils.sortByTimestamp(keyTimestamps, false).map(kt => kt.key)
  }, [groupedMeetings])

  // Collapsible sections state (collapse old dates by default, keep Today open)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    orderedDateKeys.forEach(key => {
      if (!key.includes('Today') && !feed.isRecentDate(key, true, false)) {
        initialState[key] = true
      }
    })
    return initialState
  })

  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({})

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
    setManuallyToggled(prev => ({
      ...prev,
      [key]: true,
    }))
  }

  useEffect(() => {
    if (!feed || !feed.feedContent) return

    setCollapsedSections(prev => {
      const newState = { ...prev }
      orderedDateKeys.forEach(key => {
        if (!manuallyToggled[key]) {
          if (
            !key.includes('Today') &&
            groupedMeetings[key] &&
            groupedMeetings[key][0]?.item.timestamp > new Date() &&
            !prev[key]
          ) {
            newState[key] = true
          }
        }
      })
      return newState
    })
  }, [feed.feedContent, manuallyToggled])

  const selectedMeeting = feed.currentFeedItem()
  const isSelectedMeetingNote = selectedMeeting?.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)

  // Close templates panel when selected meeting changes
  useEffect(() => {
    setTemplatesState({ isOpen: false })
  }, [feed.currentFeedItem])

  // Scroll selected meeting card into view
  useEffect(() => {
    if (selectedMeeting) {
      const threadCard = document.getElementById(`MeetingCard${selectedMeeting.id}`)
      if (threadCard) {
        threadCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedMeeting])

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

  const handleTitleChange = useCallback(
    (key: string, itemId: number, newTitle: string) => {
      if (feed.updateFeedItemTitle) {
        feed.updateFeedItemTitle(key, itemId, newTitle)
      }
    },
    [feed],
  )

  const handleDeleteItem = useCallback(
    (itemId: number) => {
      if (feed.deleteFeedItemFromState && itemId !== undefined) {
        feed
          .deleteFeedItemFromState(itemId)
          .then(() => {
            if (selectedMeeting?.id === itemId) {
              feed.unselectFeedItem()
            }
          })
          .catch(error => {
            console.error('Error deleting feed item:', error)
          })
      }
    },
    [feed, selectedMeeting],
  )

  const showPermissionsOverlay = !micPermission || !screenPermission

  const hasMeetings = orderedDateKeys.length > 0

  return (
    <div className="MeetingsTabView w-full h-full overflow-hidden flex flex-row">
      {/* Sidebar with date-grouped meeting list */}
      <div className="MeetingsTabView__sidebar">
        <div className="MeetingsTabView__sidebar-scroll">
          {!hasMeetings ? (
            <div className="MeetingsTabView__empty">
              <p>No meetings yet</p>
              <p className="MeetingsTabView__empty-hint">
                Click "Ad hoc meeting" to start recording
              </p>
            </div>
          ) : (
            orderedDateKeys.map(dateKey => {
              const items = groupedMeetings[dateKey]
              if (!items || items.length === 0) return null

              // Filter to only show recent dates (past + today/yesterday)
              if (!feed.isRecentDate(dateKey, true, false)) return null

              const isCollapsed = collapsedSections[dateKey]

              return (
                <div
                  key={`${dateKey}-${items.length}`}
                  className="MeetingsTabView__date-group"
                >
                  {/* Date section header */}
                  <div
                    className={`MeetingsTabView__date-header ${dateKey.includes('Today') ? 'MeetingsTabView__date-header--today' : ''}`}
                    onClick={() => toggleSection(dateKey)}
                  >
                    <div className="MeetingsTabView__date-arrow">
                      <img
                        src={FeedSidebarArrowDown}
                        className={`w-4 h-1.5 transition-transform duration-100
                          ${dateKey.includes('Today') ? '' : 'opacity-70'}
                          ${isCollapsed ? 'rotate-[-90deg]' : ''}`}
                        alt="Toggle section"
                      />
                    </div>
                    <div className="MeetingsTabView__date-label">
                      {dateKey}
                    </div>
                  </div>

                  {/* Meeting items in this date group */}
                  <div
                    className={`MeetingsTabView__date-items ${isCollapsed ? 'MeetingsTabView__date-items--collapsed' : ''}`}
                  >
                    {items.map(({ key, item }) => {
                      const isSelected = selectedMeeting?.id === item.id

                      return (
                        <Fragment key={item.id}>
                          <div
                            className={`flex flex-col w-full text-left border-r border-t border-b rounded-r-md
                              ${
                                isSelected
                                  ? 'bg-ks-warm-grey-100 border-ks-warm-grey-200'
                                  : 'hover:bg-ks-warm-grey-100 hover:border-ks-warm-grey-200 border-transparent'
                              }`}
                            id={`MeetingCard${item.id}`}
                            ref={isSelected ? threadCardRef : null}
                            onClick={() => {
                              feed.selectFeedItem(key, item.id)
                            }}
                          >
                            <div className="flex items-center w-full">
                              <div className="pl-10 w-full">
                                <ThreadPreviewCard
                                  title={
                                    item && typeof item.getTitle === 'function'
                                      ? item.getTitle()
                                      : item?.title || ''
                                  }
                                  subTitle={item.getSubtitle()}
                                  executedTime={item.timestamp}
                                  isSelected={isSelected}
                                  isRecording={item.isRecording}
                                  setIsSelected={() => {
                                    feed.selectFeedItem(key, item.id)
                                  }}
                                  hasLabel={false}
                                  showFullDate={false}
                                  onTitleChange={newTitle => {
                                    if (item.id !== undefined) {
                                      handleTitleChange(key, item.id, newTitle)
                                    }
                                  }}
                                  onDelete={item.id !== undefined ? () => handleDeleteItem(item.id!) : undefined}
                                />
                              </div>
                            </div>
                          </div>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Ad hoc meeting button at bottom */}
        <div className="MeetingsTabView__sidebar-footer">
          {isAnyRecording ? (
            <Tooltip
              label="Meeting recording in progress"
              component={
                <Button
                  label="Ad hoc meeting"
                  icon={<img src={Mic} alt="Microphone" />}
                  variant={ButtonVariant.startMeetingGrey}
                  onClick={() => feed.createNewMeeting()}
                  disabled={isAnyRecording}
                />
              }
              variant={TooltipVariant.inProgressMeeting}
            />
          ) : (
            <Button
              label="Ad hoc meeting"
              icon={<img src={Mic} alt="Microphone" />}
              variant={ButtonVariant.startMeetingGrey}
              onClick={() => feed.createNewMeeting()}
            />
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="MeetingsTabView__content">
        <div className="flex flex-row h-full">
          <div className="flex-grow overflow-y-auto overflow-x-hidden relative">
            {showPermissionsOverlay && (
              <AudioPermissionChecker
                onBothPermissionsGranted={() => {
                  setMicPermission(true)
                  setScreenPermission(true)
                }}
              />
            )}

            {!selectedMeeting || !isSelectedMeetingNote ? (
              <div className="MeetingsTabView__welcome">
                <h1 className="MeetingsTabView__welcome-title">Meeting Notes</h1>
                <p className="MeetingsTabView__welcome-subtitle">
                  Record meetings and get AI-powered notes, summaries, and action items
                </p>
                <div className="MeetingsTabView__welcome-action">
                  <Button
                    label="Record a meeting"
                    icon={<img src={Mic} alt="Microphone" />}
                    variant={ButtonVariant.startMeetingGrey}
                    onClick={() => feed.createNewMeeting()}
                  />
                </div>
              </div>
            ) : (
              <div className={`MeetingsTabView__meeting-content ${showPermissionsOverlay ? 'pointer-events-none' : ''}`}>
                {selectedMeeting.threads
                  ?.filter(thread => thread.threadType === ThreadType.MEETING_NOTES)
                  .map((thread: IThread) => (
                    <MeetingNotesMode
                      key={thread.id}
                      feedItemId={selectedMeeting.id}
                      item={selectedMeeting}
                      thread={thread}
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
                  ))}
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
