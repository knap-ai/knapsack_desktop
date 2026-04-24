import '../../../main.css'
import 'prismjs/themes/prism-tomorrow.css'
import './Home.scss'

import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { updateAutomationFeedbackAPI } from 'src/api/automations'
import { HomeProps } from 'src/App'
import {
  KN_API_STOP_LLM_EXECUTION,
  PRIVACY_POLICY_LINK,
  TERMS_LINK,
} from 'src/utils/constants'
//import { RecordingProvider } from 'src/components/organisms/MeetingNotesMode/RecordingContext'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { openMicrosoftAuthScreen } from 'src/utils/permissions/microsoft'

import { SettingsDialog } from './components/SettingsDialog'
import { SignInDialog } from './components/SigninDialog'
import { ProviderSignInDialog } from './components/ProviderSignInDialog'
import { ButtonVariant } from 'src/components/atoms/button'
import HeaderRecording from 'src/components/molecules/HeaderRecording'
import AutomationLabModal from 'src/components/molecules/AutomationLabModal'
import CenterWorkspace, { SubTabChoices } from 'src/components/organisms/CenterWorkspace'
import EmailTabView from 'src/components/organisms/EmailTabView'
import FeedSidebar from 'src/components/organisms/FeedSidebar'
import NotetakerSidebar from 'src/components/organisms/NotetakerSidebar'
import GoogleAuthPopup from 'src/components/organisms/GoogleAuthPopUp'
import { Header } from 'src/components/organisms/Header'
import MeetingsTabView from 'src/components/organisms/MeetingsTabView'

import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { getReleaseType } from 'src/api/app_info'
import { safeInvoke } from 'src/utils/tauriIpcBridge'

import { ConnectionKeys, googleConnections, microsoftConnections } from '../../../api/connections'
import { getFeedbacks } from '../../../api/threads'
import { setHasOnboarded } from '../../../pages/onboarding'
import { openGoogleAuthScreen } from '../../../utils/permissions/google'
import { requestNotificationOSPermissions } from '../../../utils/permissions/notification'
import NewAutomation from '../NewAutomation'
import { ConnectionsDropdown } from './../../ConnectionsDropdown'
import { SigninButton } from './../../SigninButton'
import { TabChoices } from './../../TabBar'
import ClawdChat from 'src/components/organisms/ClawdChat'
import ActivityPanel from 'src/components/organisms/ActivityPanel'
import EmailNotificationDrawer from 'src/components/molecules/EmailNotificationDrawer'
import EmailComposeDrawer from 'src/components/molecules/EmailComposeDrawer'
import WorkspacesList from 'src/components/organisms/WorkspacesList'
import WorkspaceView from 'src/components/organisms/WorkspaceView'
import MCPMarketplace from 'src/components/organisms/MCPMarketplace'
import { Workspace } from 'src/api/workspaces'

export interface ToastrState {
  message?: ReactElement
  autoHideDuration?: number
  alertType?: 'success' | 'info' | 'warning' | 'error'
  icon?: boolean
  style?: Record<string, string>
  actionText?: string
  actionHandler?: () => void
}

function Home({
  auth,
  feed,
  automations,
  connections,
  votes,
  googleAuthControls,
  handleOpenToastr,
  handleError,
  addToLLMQueue,
  updateAutomation,
  fetchConnections,
  deleteConnection,
  setVotes,
  llmBar,
  handleAutomationPreview,
  recordingHandlers,
  isSignInDialogOpened,
  setIsSignInDialogOpened,
  reconnectKeys,
  isAnyRecording,
}: HomeProps) {
  const [fullRelease, setFullRelease] = useState<boolean | null>(null)
  const [currentTab, setCurrentTab] = useState<TabChoices>(TabChoices.Openclaw)
  const [useLocalLLM, setUseLocalLLM] = useState<boolean>(false)
  const [isSettingsDialogOpened, setIsSettingsDialogOpened] = useState(false)
  const [isProviderSignInDialogOpened, setIsProviderSignInDialogOpened] = useState(false)
  const [providerSignInInitialProvider, setProviderSignInInitialProvider] = useState<'openai' | 'anthropic' | 'openrouter' | undefined>(undefined)
  const [openProviderPanelTrigger, setOpenProviderPanelTrigger] = useState(0)
  const [connectionsDropdownOpened, setConnectionsDropdownOpened] = useState(false)
  const [showAutomationLabModal, setShowAutomationLabModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [activityPanelWidth, setActivityPanelWidth] = useState(420)
  const [autopilotForceOpen, setAutopilotForceOpen] = useState(false)
  const [isChatBusy, setIsChatBusy] = useState(false)
  const [meetingSubView, setMeetingSubView] = useState<'meetings' | 'chat'>('meetings')
  const [chatInitialInput, setChatInitialInput] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const isResizingRef = useRef(false)

  const userEmail = useMemo(() => auth.profile?.email ?? '', [auth.profile])
  const userName = useMemo(() => auth.profile?.name ?? '', [auth.profile])
  const userImage = auth.profile?.profile_image || '/assets/images/chat/no-pic-user-avatar-icon.svg'

  const stopLLMExecution = async () => {
    await fetch(KN_API_STOP_LLM_EXECUTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const handleErrorContact = useCallback(
    (message: string) => {
      handleOpenToastr(<span>{message}</span>, 'error', 5000, false, {
        bgcolor: '#e5e7eb',
        color: '#3F3F46',
        'font-weight': '700',
      })
    },
    [handleOpenToastr],
  )

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Escape key always hides everything
    // console.log("handleKeyDown", event.key, searchResults.length, selectedSearchIndex);
    if (event.key === 'Escape') {
      feed.errorCallback()
      event.preventDefault()
      stopLLMExecution()
      feed.unselectFeedItem()
      feed.setSubTab(SubTabChoices.Welcome)
    } else {
      if (event.key === 'r' && event.metaKey && event.ctrlKey) {
        setHasOnboarded(false)
        handleOpenToastr(<span>Dev tool: Reset onboarding.</span>, 'success', 5000)
      } else if (event.key === 's' && event.metaKey && event.ctrlKey) {
        setCurrentTab(TabChoices.NewAutomation)
      } else if (event.key === 'e' && event.metaKey && event.ctrlKey) {
        setAutopilotForceOpen(true)
        setCurrentTab(TabChoices.Openclaw)
      }
    }
  }, [])

  useEffect(() => {
    // remove scrollbars
    document.documentElement.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Listen for /autopilot slash command to force-open the email drawer
  useEffect(() => {
    const unlisten = listen('kn_trigger_autopilot', () => {
      setAutopilotForceOpen(true)
      setCurrentTab(TabChoices.Openclaw)
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // Listen for system tray events
  useEffect(() => {
    const unlistenQuickNote = listen('create_quick_note', () => {
      setCurrentTab(TabChoices.Meeting)
      setMeetingSubView('meetings')
      feed.createNewMeeting()
    })
    const unlistenSettings = listen('open_settings', () => {
      setIsSettingsDialogOpened(true)
    })
    return () => {
      unlistenQuickNote.then(fn => fn())
      unlistenSettings.then(fn => fn())
    }
  }, [])

  // Listen for AI email draft ready — only when email is connected natively in the desktop app
  useEffect(() => {
    const handleEmailDraftReady = (e: Event) => {
      // Only use the compose drawer when the user has their email connected natively.
      // When email is not connected the AI falls back to browser automation instead.
      if (!feed.loggedEmailAutopilot) return
      const detail = (e as CustomEvent).detail
      feed.setComposedEmailDraft(detail)
      setCurrentTab(TabChoices.Openclaw)
    }
    const handleFocusChat = () => setCurrentTab(TabChoices.Openclaw)
    window.addEventListener('clawd-email-draft-ready', handleEmailDraftReady)
    window.addEventListener('clawd-focus-chat', handleFocusChat)
    return () => {
      window.removeEventListener('clawd-email-draft-ready', handleEmailDraftReady)
      window.removeEventListener('clawd-focus-chat', handleFocusChat)
    }
  }, [feed.loggedEmailAutopilot, feed.setComposedEmailDraft])

  useEffect(() => {
    document.documentElement.style.backgroundColor = 'rgba(5, 5, 5, 0.0)'
    // Use safeInvoke to handle race conditions where IPC bridge may not be ready yet
    safeInvoke('kn_init_app').catch(error => {
      console.error('Failed to initialize app shortcuts:', error)
    })
    requestNotificationOSPermissions()
    getReleaseType().then((releaseType: string) => {
      setFullRelease(releaseType === 'Full')
    })
  }, [])

  const handleVote = useCallback(
    async (messageId: number, vote: number) => {
      if (!auth.profile?.email) {
        handleOpenToastr(<span>You need to be logged in to vote</span>, 'error', 3000)
        return
      }
      const newVote = votes[messageId] === vote ? 0 : vote
      setVotes(prevVotes => ({
        ...prevVotes,
        [messageId]: newVote,
      }))
      await updateAutomationFeedbackAPI(messageId, auth.profile.email, newVote)
    },
    [auth.profile?.email, votes, handleOpenToastr],
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error)
    }
  }, [])

  const onConnectAccountClick = useCallback(
    (connectionKeys: ConnectionKeys[]) => {
      if (auth.profile?.provider && auth.profile.provider == ConnectionKeys.MICROSOFT_PROFILE) {
        handleMicrosoftMenuItemClick(connectionKeys)
      }
      handleGoogleMenuItemClick(connectionKeys)
    },
    [auth.profile],
  )

  const handleGoogleMenuItemClick = (connectionKeys: ConnectionKeys[]) => {
    const scopes = [
      ...googleConnections[ConnectionKeys.GOOGLE_PROFILE].scopes,
      ...connectionKeys.map(key => googleConnections[key].scopes),
    ].join(' ')
    openGoogleAuthScreen(scopes)
  }

  const handleMicrosoftMenuItemClick = (connectionKeys: ConnectionKeys[]) => {
    const scopes = [
      ...microsoftConnections[ConnectionKeys.MICROSOFT_PROFILE].scopes,
      ...connectionKeys.map(key => microsoftConnections[key].scopes),
    ].join(' ')

    openMicrosoftAuthScreen(scopes, connectionKeys)
  }

  const handleSigninGoogleButtonClick = () => {
    try {
      openGoogleAuthScreen(googleConnections[ConnectionKeys.GOOGLE_PROFILE].scopes.join(' '))
    } catch (error) {
      setConnectionsDropdownOpened(false)
      logError(new Error('Error opening Google Auth screen'), {
        additionalInfo: '',
        error: ` Error authenticating Google ${error}`,
      })

      handleErrorContact("Couldn't connect to Google, try again later")
    }
  }

  const handleSigninMicrosoftButtonClick = () => {
    try {
      const scopes = [...microsoftConnections[ConnectionKeys.MICROSOFT_PROFILE].scopes].join(' ')

      openMicrosoftAuthScreen(scopes, [ConnectionKeys.MICROSOFT_PROFILE])
    } catch (error) {
      setConnectionsDropdownOpened(false)
      logError(new Error('Error opening Microsoft Auth screen'), {
        additionalInfo: '',
        error: ` Error authenticating Microsoft ${error}`,
      })

      handleErrorContact("Couldn't connect to Microsoft, try again later")
    }
  }

  const handleSigninButtonClick = () => {
    if (Object.keys(connections).includes(ConnectionKeys.GOOGLE_PROFILE)) {
      handleSigninGoogleButtonClick()
    }
    if (Object.keys(connections).includes(ConnectionKeys.MICROSOFT_PROFILE)) {
      handleSigninMicrosoftButtonClick()
    }
  }

  const handleOpenProviderSignIn = useCallback((provider?: 'openai' | 'anthropic' | 'openrouter') => {
    // Close settings dialog and open the ClawdChat provider sidebar instead
    setIsSettingsDialogOpened(false)
    setProviderSignInInitialProvider(provider)
    setOpenProviderPanelTrigger(prev => prev + 1)
  }, [])

  const handleBackToHome = async () => {
    setCurrentTab(TabChoices.Work)
  }

  /* === END CALLBACKS === */

  /* === BEGIN EFFECTS === */

  useEffect(() => {
    // transparent background
    document.documentElement.style.backgroundColor = 'rgba(5, 5, 5, 0.0)'

    KNAnalytics.trackEvent('Home Screen - loaded', {})

    if (fullRelease === null) {
      getReleaseType().then((releaseType: string) => {
        setFullRelease(releaseType === 'Full')
      })
    }

    requestNotificationOSPermissions()
  }, [])

  useEffect(() => {
    if (auth.profile?.email) {
      getFeedbacks(auth.profile.email).then(feedbacks => {
        const votes = feedbacks.reduce(
          (acc: Record<number, number>, feedback: { message_id: number; feedback: number }) => ({
            ...acc,
            [feedback.message_id]: feedback.feedback,
          }),
          {},
        )
        setVotes(votes)
      })
    }
  }, [auth.profile?.email])

  /* === END EFFECTS === */

  /* === BEGIN RENDER === */

  const handlePrivacyLinkClick = () => open(PRIVACY_POLICY_LINK)
  const handleTermsOfUseClick = () => open(TERMS_LINK)

  const signout = async () => {
    try {
      await auth.signout()
    } catch (error) {
      setConnectionsDropdownOpened(false)
      handleError("We couldn't sign you out due to a local issue.")
    }
  }

  return (
    <div className="KNMainContainer">
      {googleAuthControls.showGoogleAuthPopup && (
        <GoogleAuthPopup
          onClose={() => googleAuthControls.setShowGoogleAuthPopup(false)}
          onAuth={async () => {
            googleAuthControls.setShowGoogleAuthPopup(false)
            // if (googleAuthControls.currentAutomation && googleAuthControls.currentFeedItem) {
            //   feed.handleCustomFeedAutomation(
            //     googleAuthControls.currentAutomation,
            //     googleAuthControls.currentFeedItem,
            //   )
            // }
          }}
          userEmail={userEmail}
        />
      )}
      <Header
        leftComponent={
          feed.getRecordingFeedItemTitle() && (
            <HeaderRecording
              label="recording in progress"
              buttonLabel="go to meeting"
              hasSelectedRecordingFeedItem={
                feed.currentFeedItem()?.getTitle() !== feed.getRecordingFeedItemTitle()
              }
              buttonOnClick={feed.handleClickRecording}
              buttonVariant={ButtonVariant.inProgressMeeting}
            />
          )
        }
        middleRightComponent={
          <button
            onClick={() => invoke('toggle_overlay_window')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-ks-warm-grey-200 bg-white hover:bg-ks-warm-grey-50 text-ks-warm-grey-600 hover:text-ks-warm-grey-800 transition-colors cursor-pointer"
            title="Open Quick Chat overlay"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
            <span className="text-[10px] font-medium">Quick Chat</span>
            <kbd className="text-[9px] font-mono bg-ks-warm-grey-100 text-ks-warm-grey-500 px-1 py-0.5 rounded border border-ks-warm-grey-200 leading-none">{navigator.platform?.includes('Mac') ? '\u2325Space' : 'Ctrl+Space'}</kbd>
          </button>
        }
        rightComponent={
          auth.profile ? (
            <>
              <ConnectionsDropdown
                profile={auth.profile}
                onSignoutClick={signout}
                connections={connections}
                onGoogleItemClick={handleGoogleMenuItemClick}
                onSettingsClick={() => setIsSettingsDialogOpened(true)}
                onProviderSignInClick={() => handleOpenProviderSignIn()}
                connectionsDropdownOpened={connectionsDropdownOpened}
                setConnectionsDropdownOpened={setConnectionsDropdownOpened}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsDialogOpened(true)}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-ks-warm-grey-300 bg-white hover:bg-ks-warm-grey-50 text-ks-warm-grey-700"
                title="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <SigninButton
                onGoogleSignIn={handleSigninButtonClick}
                onProviderSignIn={(provider) => handleOpenProviderSignIn(provider)}
              />
            </div>
          )
        }
      />
      <SettingsDialog
        handlePrivacyLinkClick={handlePrivacyLinkClick}
        handleTermsOfUseClick={handleTermsOfUseClick}
        handleClose={() => setIsSettingsDialogOpened(false)}
        isOpen={isSettingsDialogOpened}
        connections={connections}
        email={auth.profile?.email}
        onConnectAccountClick={onConnectAccountClick}
        fetchConnections={fetchConnections}
        deleteConnection={deleteConnection}
        profile={auth.profile}
        onProviderSignInClick={handleOpenProviderSignIn}
      />
      <ProviderSignInDialog
        isOpen={isProviderSignInDialogOpened}
        handleClose={() => setIsProviderSignInDialogOpened(false)}
        initialProvider={providerSignInInitialProvider}
      />
      <SignInDialog
        isOpen={isSignInDialogOpened}
        handleClose={() => setIsSignInDialogOpened(false)}
        profile={auth.profile}
        onConnectAccountClick={onConnectAccountClick}
        reconnectKeys={reconnectKeys}
      />
      <AutomationLabModal
        isOpen={showAutomationLabModal}
        onClose={() => setShowAutomationLabModal(false)}
      />
      <div className="overflow-hidden flex-1 bg-ks-bg-main rounded-b-[10px]">
        <div data-tauri-drag-region className="overflow-hidden flex flex-row h-full bg-ks-bg-main">
          {/* Unified sidebar — always visible */}
          <NotetakerSidebar
            feed={feed}
            connections={connections}
            currentTab={currentTab}
            onTabChange={(tab, subView) => {
              setCurrentTab(tab)
              if (subView) {
                setMeetingSubView(subView)
              } else if (tab === TabChoices.Meeting) {
                setMeetingSubView('meetings')
              }
            }}
            onLibraryWorkspaceOpen={(ws) => {
              setCurrentTab(TabChoices.Library)
              setSelectedWorkspace(ws)
            }}
            onQuickNote={() => {
              setCurrentTab(TabChoices.Meeting)
              setMeetingSubView('meetings')
              feed.createNewMeeting()
            }}
            onConnectCalendar={() => onConnectAccountClick([ConnectionKeys.GOOGLE_CALENDAR])}
            onMeetingSelect={() => {
              setCurrentTab(TabChoices.Meeting)
              setMeetingSubView('meetings')
            }}
            activeView={
              currentTab === TabChoices.Meeting
                ? meetingSubView === 'chat'
                  ? 'chat'
                  : 'home'
                : 'home'
            }
            recordingHandlers={recordingHandlers}
          />
          <div data-tauri-drag-region className="overflow-hidden w-full h-full">
            <div className="KNWorkspace overflow-hidden w-full h-full bg-ks-bg-main relative">
              {currentTab === TabChoices.Work && (
                <div className="overflow-hidden w-full h-full flex flex-row">
                  <FeedSidebar feed={feed} isAnyRecording={isAnyRecording} />
                  {/*<RecordingProvider>*/}
                  <CenterWorkspace
                    feed={feed}
                    llmBar={llmBar}
                    userImg={userImage}
                    onLibraryWorkspaceOpen={(ws) => {
                      setCurrentTab(TabChoices.Library)
                      setSelectedWorkspace(ws)
                    }}
                    updateAutomation={updateAutomation}
                    handleVote={handleVote}
                    votes={votes}
                    copyToClipboard={copyToClipboard}
                    automations={automations}
                    handleAutomationPreview={handleAutomationPreview}
                    addToLLMQueue={addToLLMQueue}
                    userEmail={userEmail}
                    userName={userName}
                    onConnectAccountClick={onConnectAccountClick}
                    profileProvider={auth.profile?.provider}
                    handleErrorContact={handleErrorContact}
                    recordingHandlers={recordingHandlers}
                  />
                  {/*</RecordingProvider>*/}
                </div>
              )}
              {currentTab === TabChoices.NewAutomation && (
                <NewAutomation
                  useLocalLLM={useLocalLLM}
                  connections={connections}
                  onConnectionItemClick={handleGoogleMenuItemClick}
                  setUseLocalLLM={setUseLocalLLM}
                  email_user={auth.profile ? auth.profile.email : ''}
                  saveLocally={false}
                  handleBackButton={handleBackToHome}
                  dataSourceTitle="What data should Knapsack look at?"
                  menuTitle="Suggestions"
                  promptTile="What should Knapsack do?"
                  labelButtonPreview="Preview"
                  cadenceTitle="When should this automation run?"
                  labelButtonSubmit="Publish"
                  handleOpenToastr={handleOpenToastr}
                  handleAutomationPreview={handleAutomationPreview}
                  feed={feed}
                />
              )}

              <div className={`overflow-hidden w-full h-full flex flex-row relative${currentTab !== TabChoices.Openclaw ? ' hidden' : ''}`}>
                  <div className="overflow-hidden flex-1 h-full min-w-0">
                    <ClawdChat
                      showActivityPanel={showActivityPanel}
                      onToggleActivity={() => setShowActivityPanel(prev => !prev)}
                      onCloseActivity={() => setShowActivityPanel(false)}
                      userEmail={userEmail}
                      userName={userName}
                      onBusyChange={setIsChatBusy}
                      openProviderPanel={openProviderPanelTrigger}
                    />
                  </div>
                  {showActivityPanel && (
                    <>
                      <div
                        className="activity-resize-handle"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          isResizingRef.current = true
                          const startX = e.clientX
                          const startWidth = activityPanelWidth
                          const onMove = (ev: MouseEvent) => {
                            if (!isResizingRef.current) return
                            const delta = startX - ev.clientX
                            setActivityPanelWidth(Math.max(280, Math.min(800, startWidth + delta)))
                          }
                          const onUp = () => {
                            isResizingRef.current = false
                            document.removeEventListener('mousemove', onMove)
                            document.removeEventListener('mouseup', onUp)
                            document.body.style.cursor = ''
                            document.body.style.userSelect = ''
                          }
                          document.body.style.cursor = 'col-resize'
                          document.body.style.userSelect = 'none'
                          document.addEventListener('mousemove', onMove)
                          document.addEventListener('mouseup', onUp)
                        }}
                      />
                      <div className="overflow-hidden h-full border-l border-ks-warm-grey-200 bg-white" style={{ width: activityPanelWidth, flexShrink: 0 }}>
                        <ActivityPanel onClose={() => setShowActivityPanel(false)} />
                      </div>
                    </>
                  )}
                  {(feed.loggedEmailAutopilot || autopilotForceOpen) && (
                    <EmailNotificationDrawer
                      feed={feed}
                      onGoToEmail={() => {
                        feed.selectEmailCategory()
                        setCurrentTab(TabChoices.Email)
                      }}
                      userEmail={userEmail}
                      userName={userName}
                      profileProvider={auth.profile?.provider}
                      forceOpen={autopilotForceOpen}
                      onForceOpenHandled={() => setAutopilotForceOpen(false)}
                      isChatBusy={isChatBusy}
                    />
                  )}
                </div>

              {currentTab === TabChoices.Email && (
                <EmailTabView
                  feed={feed}
                  userEmail={userEmail}
                  userName={userName}
                  profileProvider={auth.profile?.provider}
                  onConnectAccountClick={onConnectAccountClick}
                />
              )}

              {currentTab === TabChoices.Meeting && meetingSubView === 'meetings' && (
                <MeetingsTabView
                  feed={feed}
                  addToLLMQueue={addToLLMQueue}
                  copyToClipboard={copyToClipboard}
                  handleErrorContact={handleErrorContact}
                  recordingHandlers={recordingHandlers}
                  connections={connections}
                  onConnectCalendar={() => onConnectAccountClick([ConnectionKeys.GOOGLE_CALENDAR])}
                  onBack={() => {
                    // Back from note view returns to sidebar
                  }}
                  onChatClick={() => setMeetingSubView('chat')}
                  onAttendeeClick={(email, name) => {
                    setChatInitialInput(`Tell me about ${name || email}`)
                    setMeetingSubView('chat')
                  }}
                  onLibraryWorkspaceOpen={(ws) => {
                    setCurrentTab(TabChoices.Library)
                    setSelectedWorkspace(ws)
                  }}
                  onEmailClick={(notesMarkdown, meeting) => {
                    const participants = meeting?.participants ?? []
                    const toEmails = participants
                      .filter(p => p.email && p.email !== userEmail)
                      .map(p => p.email)
                      .join(', ')
                    const subject = meeting?.title ? `Follow up: ${meeting.title}` : 'Meeting Follow Up'
                    const escapedNotes = notesMarkdown
                      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/\n/g, '<br>')
                    const body = `<p>Hi,</p><p>Thank you for our meeting${meeting?.title ? ` — ${meeting.title}` : ''}. Here's a summary of what we discussed:</p><p>${escapedNotes}</p><p>Please let me know if you have any questions!</p><p>Best,<br>${userName || ''}</p>`
                    feed.setComposedEmailDraft({ to: toEmails, subject, body })
                  }}
                />
              )}

              {currentTab === TabChoices.Meeting && meetingSubView === 'chat' && (
                <div className="overflow-hidden w-full h-full flex flex-row relative">
                  <div className="overflow-hidden flex-1 h-full min-w-0">
                    <ClawdChat
                      showActivityPanel={showActivityPanel}
                      onToggleActivity={() => setShowActivityPanel(prev => !prev)}
                      onCloseActivity={() => setShowActivityPanel(false)}
                      userEmail={userEmail}
                      userName={userName}
                      onBusyChange={setIsChatBusy}
                      openProviderPanel={openProviderPanelTrigger}
                      initialInput={chatInitialInput}
                    />
                  </div>
                  {showActivityPanel && (
                    <>
                      <div
                        className="activity-resize-handle"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          isResizingRef.current = true
                          const startX = e.clientX
                          const startWidth = activityPanelWidth
                          const onMove = (ev: MouseEvent) => {
                            if (!isResizingRef.current) return
                            const delta = startX - ev.clientX
                            setActivityPanelWidth(Math.max(280, Math.min(800, startWidth + delta)))
                          }
                          const onUp = () => {
                            isResizingRef.current = false
                            document.removeEventListener('mousemove', onMove)
                            document.removeEventListener('mouseup', onUp)
                            document.body.style.cursor = ''
                            document.body.style.userSelect = ''
                          }
                          document.body.style.cursor = 'col-resize'
                          document.body.style.userSelect = 'none'
                          document.addEventListener('mousemove', onMove)
                          document.addEventListener('mouseup', onUp)
                        }}
                      />
                      <div className="overflow-hidden h-full border-l border-ks-warm-grey-200 bg-white" style={{ width: activityPanelWidth, flexShrink: 0 }}>
                        <ActivityPanel onClose={() => setShowActivityPanel(false)} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {currentTab === TabChoices.Library && (
                <div className="overflow-auto w-full h-full">
                  {selectedWorkspace ? (
                    <WorkspaceView
                      workspace={selectedWorkspace}
                      onBack={() => setSelectedWorkspace(null)}
                    />
                  ) : (
                    <WorkspacesList
                      onWorkspaceOpen={(ws) => setSelectedWorkspace(ws)}
                    />
                  )}
                </div>
              )}

              {currentTab === TabChoices.MCPMarketplace && (
                <div className="overflow-auto w-full h-full p-6">
                  <MCPMarketplace />
                </div>
              )}

              {feed.loggedEmailAutopilot && feed.composedEmailDraft && (
                <EmailComposeDrawer
                  draft={feed.composedEmailDraft}
                  userEmail={userEmail}
                  userName={userName}
                  onDismiss={() => feed.setComposedEmailDraft(null)}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
