import React, { Fragment, useState, useEffect, useMemo } from 'react'

import './style.scss'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { ConnectionKeys } from 'src/api/connections'
import { FeedItem } from 'src/api/feed_items'
import { IThread, ThreadType } from 'src/api/threads'
import { CreateAutomationProps, LLMParams } from 'src/App'
import { Automation } from 'src/automations/automation'
import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import { ILLMBar } from 'src/hooks/feed/useLLMBar'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'
import { EmailHelpButton } from 'src/components/molecules/EmailHelpButton'
import { MeetingTemplatePrompt } from 'src/utils/template_prompts'
import ExecutableCard from 'src/components/molecules/ExecutableCard'
import LoginWarningAutopilot from 'src/components/molecules/LoginWarningAutopilot'
import ThreadCard from 'src/components/molecules/ThreadCard'
import KnapsackLMBar from 'src/components/organisms/KnapsackLMBar'
import MeetingNotesMode from 'src/components/organisms/MeetingNotesMode'
import TemplatesView from 'src/components/organisms/TemplatesView'
import TranscriptView from 'src/components/organisms/TranscriptView'
import MeetingTasks from 'src/components/molecules/MeetingTasks'
import AudioPermissionChecker from 'src/components/molecules/AudioPermissionChecker'

import { RecordingContextProps } from '../MeetingNotesMode/RecordingContext'
import Mic from '/assets/images/icons/mic-white.svg'
import { EmailAutopilot } from 'src/components/molecules/EmailAutopilot'
import { logError } from 'src/utils/errorHandling'
import EmailCategoryTabs from '../EmailCategoryTabs'
import SettingsButton from 'src/components/atoms/settings-button'

interface CenterWorkspaceProps {
  feed: IFeed
  llmBar: ILLMBar
  userImg?: string
  updateAutomation: (
    automationId: number,
    createAutomationProps: CreateAutomationProps,
  ) => Promise<boolean>
  handleVote: (messageId: number, vote: 1 | -1) => void
  votes: Record<number, number>
  copyToClipboard: (text: string) => void
  automations: Record<string, Automation>
  handleAutomationPreview: (
    automation: Automation,
    onAutomationFinishCallback: (message: string, documentIds?: number[]) => void,
  ) => Promise<void>
  addToLLMQueue: (item: LLMParams) => void
  userEmail: string
  userName: string
  onConnectAccountClick: (key: ConnectionKeys[]) => void
  profileProvider?: string
  handleErrorContact: (message: string) => void
  recordingHandlers: RecordingContextProps
}

export enum SubTabChoices {
  Welcome = 'Welcome',
  Workspace = 'Workspace',
  Library = 'Library',
}

interface TemplatesState {
  isOpen: boolean
  thread?: IThread
}

interface TranscriptState {
  isOpen: boolean
  threadId?: number
}

export interface TaskItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface TasksState {
  isOpen: boolean;
  threadId?: number;
  tasks: TaskItem[];
}

const CenterWorkspace: React.FC<CenterWorkspaceProps> = ({
  feed,
  llmBar,
  userImg,
  handleVote,
  votes,
  copyToClipboard,
  automations,
  handleAutomationPreview,
  addToLLMQueue,
  userEmail,
  userName,
  onConnectAccountClick,
  profileProvider,
  handleErrorContact,
  recordingHandlers,
}) => {
  const [synthesisState, setSynthesisState] = useState(false)
  const [transcriptState, setTranscriptState] = useState<TranscriptState>({ isOpen: false })
  const [templatesState, setTemplatesState] = useState<TemplatesState>({ isOpen: false })
  const [tasksState, setTasksState] = useState<TasksState>({ isOpen: false, tasks: [] });
  const [showEmailAutopilotPrompt, setShowEmailAutopilotPrompt] = useState(true)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [micPermission, setMicPermission] = useState(localStorage.getItem('micPermissionGranted') === 'true');
  const [screenPermission, setScreenPermission] = useState(localStorage.getItem('screenPermissionGranted') === 'true');
  const [forceShowPermissions] = useState(false);

  const onSynthesisFinish = () => setSynthesisState(prev => !prev)

  useEffect(() => {
    if (feed.loggedEmailAutopilot && feed.subTab === SubTabChoices.Welcome) {
      const autopilotItem = feed.feedContent[STATIONARY_ITEMS]?.find(
        item => item.title === 'Email Autopilot',
      )

      if (autopilotItem) {
        feed.selectFeedItem(STATIONARY_ITEMS, autopilotItem.id)

        if (feed.setSelectedEmailCategory) {
          feed.setSelectedEmailCategory(EmailImportance.IMPORTANT_NO_RESPONSE)
        }

        feed.setSubTab(SubTabChoices.Workspace)
      }
    }
  }, [feed.loggedEmailAutopilot, feed.subTab, feed.feedContent])

  const emailCategories = useMemo(() => {
    const categories: Record<EmailImportance, { total: number; active: number }> = {
      [EmailImportance.IMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.IMPORTANT_NO_RESPONSE]: { total: 0, active: 0 },
      [EmailImportance.INFORMATIONAL]: { total: 0, active: 0 },
      [EmailImportance.MARKETING]: { total: 0, active: 0 },
      [EmailImportance.UNIMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.UNCLASSIFIED]: { total: 0, active: 0 },
    }

    if (feed?.classifiedEmails) {
      Object.entries(feed.classifiedEmails).forEach(([category, emails]) => {
        const importanceValue = Object.values(EmailImportance).find(value => value === category)
        if (importanceValue) {
          const activeEmails =
            emails?.filter(email => !email.wasIgnored && !email.wasReplySent) || []
          categories[category as EmailImportance] = {
            total: emails?.length || 0,
            active: activeEmails.length,
          }
        }
      })
    }

    return categories
  }, [feed?.classifiedEmails])

  useEffect(() => {
    closeTemplatesView()
  }, [feed.currentFeedItem])

  const handleOpenTemplates = async (thread: IThread) => {
    if (tasksState.isOpen) {
      setTasksState(prev => ({
        ...prev,
        isOpen: false
      }))
    }
    if (transcriptState.isOpen) {
      setTranscriptState(prev => ({
        ...prev,
        isOpen: false
      }))
    }

    setTemplatesState(prev => ({
      isOpen: !prev.isOpen,
      thread: thread
    }))
  }

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          const hasPermission = permissionStatus.state === 'granted'
          setMicPermission(hasPermission)
          return hasPermission
        } else {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop())
            setMicPermission(true)
            return true
          } catch (error) {
            logError(new Error('Mic permission denied'), {
              additionalInfo: '',
              error: error instanceof Error ? error.message : String(error),
            })
            setMicPermission(false)
            return false
          }
        }
      } catch (error) {
        setMicPermission(false)
        return false
      }
    }

    const checkPermissions = async () => {
      try {
        await checkMicrophonePermission()
      } catch (error) {
        logError(new Error('Error checking permissions.'), {
          additionalInfo: '',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    };

    checkPermissions()
  }, [])

  const handleOpenTranscript = async (threadId: number | undefined) => {
    if (!threadId) return

    if (templatesState.isOpen) {
      setTemplatesState(prev => ({
        ...prev,
        isOpen: false
      }))
    }
    if (tasksState.isOpen) {
      setTasksState(prev => ({
        ...prev,
        isOpen: false
      }))
    }

    setTranscriptState(prev => ({
      isOpen: !prev.isOpen || prev.threadId !== threadId,
      threadId: threadId,
    }))
  }

  const handleOpenTasks = (threadId: number | undefined, tasks: TaskItem[]) => {
    if (!threadId) return

    if (templatesState.isOpen) {
      setTemplatesState(prev => ({
        ...prev,
        isOpen: false
      }))
    }
    if (transcriptState.isOpen) {
      setTranscriptState(prev => ({
        ...prev,
        isOpen: false
      }))
    }

    setTasksState({
      isOpen: true,
      threadId,
      tasks
    })
  }

  const closeTemplatesView = () => {
    setTemplatesState(_ => ({
      isOpen: false,
    }))
  }

  const closeTranscript = () => {
    setTranscriptState(_ => ({
      isOpen: false,
    }))
  }

  const closeTasks = () => {
    setTasksState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  const renderThreads = (item: FeedItem | null) => {
    if (item && item.threads && item.threads.length > 0) {
      const hasMeetingNotesThread = item.threads.some(
        thread => thread.threadType === ThreadType.MEETING_NOTES
      )

      const showPermissionsOverlay = (hasMeetingNotesThread &&
                                 (!micPermission || !screenPermission)) ||
                                 forceShowPermissions;

      return (
        <Fragment>
          <div className="mb-2 w-full relative">
          {showPermissionsOverlay && (
            <AudioPermissionChecker
              onBothPermissionsGranted={() => {
                setMicPermission(true)
                setScreenPermission(true)
              }}
            />
          )}
            {item.title !== 'Email Autopilot' &&
              item.threads.map((thread: IThread) => {
                if (thread.threadType === ThreadType.MEETING_NOTES) {
                  return (
                    <div
                      key={thread.id}
                      className={showPermissionsOverlay ? 'pointer-events-none' : ''}
                    >
                    <MeetingNotesMode
                      key={thread.id}
                      feedItemId={item.id}
                      item={item}
                      thread={thread}
                      timestamp={item.timestamp}
                      runParam={item.run ? (item.run?.runParams as string) : undefined}
                      meeting={item.getCalendarEvent()}
                      addToLLMQueue={addToLLMQueue}
                      setFeedIsRecording={(isRecording: boolean | undefined = undefined) =>
                        feed.setIsRecording(item, isRecording)
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
                  </div>
                  )
                } else if (thread.threadType === ThreadType.EMAIL_AUTOPILOT) {
                  return <></>
                } else {
                  return (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      user_img={userImg}
                      handleVote={handleVote}
                      copyToClipboard={copyToClipboard}
                      votes={votes}
                    />
                  )
                }
              })}
            {item.isLoading && (
              <div className="results-loader mx-auto mt-10 w-3/4 justify-center">
                <Stack spacing={2} direction="row" className="justify-center">
                  <CircularProgress size="3rem" sx={{ color: '#C14841' }} />
                </Stack>
              </div>
            )}
          </div>
          <div className="h-10"></div>
        </Fragment>
      )
    } else if (item && item.title === 'Email Autopilot' && feed.loggedEmailAutopilot) {
      return (
        <Fragment>
          <div className="w-full">
            <div className="relative w-full">
              <div className="flex justify-center items-center">
                <EmailCategoryTabs
                  selectedCategory={feed.selectedEmailCategory}
                  onSelectCategory={(category) => {
                    if (feed.setSelectedEmailCategory) {
                      feed.setSelectedEmailCategory(category);
                    }
                  }}
                  emailCounts={emailCategories}
                />
              </div>
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <SettingsButton
                  onClick={() => setShowEmailSettings(true)}
                  title="Email Autopilot Settings"
                />
              </div>
            </div>
            <div className="py-4">
              <EmailAutopilot
                feed={feed}
                profileProvider={profileProvider}
                userEmail={userEmail}
                userName={userName}
                showSettings={showEmailSettings}
                setShowSettings={setShowEmailSettings}
              />
            </div>
          </div>
        </Fragment>
      )
    }
    if (item && item.isLoading) {
      return <div className="results-loader animate-pulse ml-1 mt-8 w-3/4"></div>
    }
  }

  const onAutomationClick = async (automation: Automation | undefined) => {
    if (automation === undefined) {
      return
    }
    if (feed) {
      const result = await feed.insertFeedItem(
        new Date().getTime(),
        true,
        automation.name,
        false,
        automation,
      )
      const newFeedItem = result.feedItem
      const threadId = result.threadId
      await handleAutomationPreview(automation, async (message: string, documentIds?: number[]) => {
        if (feed && newFeedItem) {
          feed.insertMessageToFeedItem(
            newFeedItem,
            message,
            new Date(),
            undefined,
            documentIds,
            threadId,
          )
        }
      })
    }
  }

  const setMeetingTemplatePrompt = async (meetingTemplate: MeetingTemplatePrompt) => {
    let updatedThread = templatesState.thread
    if (updatedThread) {
      updatedThread.promptTemplate = meetingTemplate.key
      feed.setThread(updatedThread, feed.currentFeedItem()?.id)
    }
  }

  return (
    <div className="CenterWorkspace w-full flex-1 flex flex-col overflow-y-auto overflow-x-hidden overflow-x-none relative">
      <div className="flex flex-row h-full">
        {!feed.loggedEmailAutopilot &&
          showEmailAutopilotPrompt &&
          (feed.currentFeedItem() === null ||
            feed.currentFeedItem()?.title === 'Email Autopilot') && (
            <div className="w-full h-full">
              <LoginWarningAutopilot
                onConnectAccountClick={(key: ConnectionKeys) => {
                  feed.setEmailAutopilotStatus({ status: 'sync-email' })
                  onConnectAccountClick([key])
                  const autopilotItem = feed.feedContent[STATIONARY_ITEMS].find(
                    item => item.title === 'Email Autopilot',
                  )
                  if (autopilotItem) {
                    feed.selectFeedItem(STATIONARY_ITEMS, autopilotItem.id)
                  }
                }}
                onSkip={() => setShowEmailAutopilotPrompt(false)}
                provider={profileProvider}
              />
            </div>
          )}

        {(feed.loggedEmailAutopilot || !showEmailAutopilotPrompt) &&
          feed.subTab === SubTabChoices.Welcome && (
            <div className="flex-grow h-full">
              <div className="flex flex-col h-full justify-center content-center items-center gap-y-10">
                <div className=" justify-between self-stretch text-center text-4xl font-normal font-['Lora'] leading-10">
                  Welcome to Knapsack
                </div>
                <div className="relative w-[468px] h-[270px]">
                  <iframe
                    src="https://www.loom.com/embed/becc8ee2a3e64714acaa2724cc167488"
                    allowFullScreen
                    className="shadow-sm bg-white h-full w-full rounded-2xl"
                    title="Knapsack Welcome Video"
                  ></iframe>
                </div>

                <div className="font-['Inter'] text-[#333333] text-lg font-regular mx-auto leading-7 justify-between text-center">
                  Knapsack is your private AI automation <br /> platform. Your files, events, and
                  emails are <br />
                  <span className="font-bold">never shared with us.</span>
                </div>
                <Button
                  label="Record a test meeting"
                  variant={ButtonVariant.startMeeting}
                  icon={<img src={Mic} />}
                  size={ButtonSize.small}
                  onClick={() => feed.createNewMeeting()}
                />
              </div>
            </div>
          )}

        {(feed.loggedEmailAutopilot ||
          !showEmailAutopilotPrompt ||
          (feed.currentFeedItem() !== null &&
            feed.currentFeedItem()?.title !== 'Email Autopilot')) &&
          feed.subTab === SubTabChoices.Workspace && (
            <div className="flex-grow my-10">{renderThreads(feed.currentFeedItem())}</div>
          )}

        {(feed.loggedEmailAutopilot || !showEmailAutopilotPrompt) &&
          feed.subTab === SubTabChoices.Library && (
            <div className="flex flex-col w-full gap-6 m-7">
              <div className="opacity-40 text-black text-xl font-semibold leading-7">General</div>
              <div className="flex flex-wrap gap-4 w-full mb-24">
                {automations &&
                  Object.entries(automations).map(
                    ([uuid, automation]) =>
                      automation.getShowLibrary() && (
                        <ExecutableCard
                          key={uuid}
                          id={uuid}
                          title={automation.getName()}
                          description={automation.getDescription()}
                          buttonLabel={'Run'}
                          onClick={automation => onAutomationClick(automation)}
                          onClickParams={automation}
                          highlightedText={automation.getIsBeta() ? 'BETA' : ''}
                          iconUrl={automation.getIcon()}
                        />
                      ),
                  )}
              </div>
              <div className="flex flex-grow fixed bottom-0 p-4 content-center justify-center">
                <div
                  className="CenterWorkspace_LLMBar justify-between flex flex-row items-center w-searchbar-xs"
                  style={{ zIndex: 9999 }}
                >
                  <div className="TightShadow flex-grow rounded-[32px] bg-white min-h-14 m-2">
                    <KnapsackLMBar LLMBarUtils={llmBar} />
                  </div>
                </div>
              </div>
            </div>
          )}
        {transcriptState.isOpen && transcriptState.threadId && (
          <TranscriptView threadId={transcriptState.threadId} onClose={() => closeTranscript()} />
        )}
        {templatesState.isOpen && templatesState.thread && (
          <TemplatesView
            thread={templatesState.thread}
            onClose={() => closeTemplatesView()}
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
      <div className="flex-grow"></div>
      <div className="fixed bottom-0 right-0 p-3" style={{ zIndex: 9999 }}>
        <div className="CenterWorkspace_HelpBtn flex justify-end pr-3">
          <EmailHelpButton provider={profileProvider} />
        </div>
      </div>
    </div>
  )
}

export default CenterWorkspace
