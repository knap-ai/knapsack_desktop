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
import GoogleAuthPopup from 'src/components/organisms/GoogleAuthPopUp'
import { Header } from 'src/components/organisms/Header'
import MeetingsTabView from 'src/components/organisms/MeetingsTabView'

import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'
import { emit, listen } from '@tauri-apps/api/event'
import { getReleaseType } from 'src/api/app_info'

import { ConnectionKeys, googleConnections, microsoftConnections } from '../../../api/connections'
import { AutopilotActions } from 'src/hooks/dataSources/useEmailAutopilot'
import { DisplayEmail } from 'src/hooks/feed/useFeed'
import { getFeedbacks } from '../../../api/threads'
import { setHasOnboarded } from '../../../pages/onboarding'
import { openGoogleAuthScreen } from '../../../utils/permissions/google'
import { requestNotificationOSPermissions } from '../../../utils/permissions/notification'
import NewAutomation from '../NewAutomation'
import { ConnectionsDropdown } from './../../ConnectionsDropdown'
import { SigninButton } from './../../SigninButton'
import TabBar, { TabChoices } from './../../TabBar'
import ClawdChat from 'src/components/organisms/ClawdChat'
import ActivityPanel from 'src/components/organisms/ActivityPanel'
import EmailNotificationDrawer from 'src/components/molecules/EmailNotificationDrawer'

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
  const [currentTab, setCurrentTab] = useState<TabChoices>(TabChoices.Moltbot)
  const [useLocalLLM, setUseLocalLLM] = useState<boolean>(false)
  const [isSettingsDialogOpened, setIsSettingsDialogOpened] = useState(false)
  const [isProviderSignInDialogOpened, setIsProviderSignInDialogOpened] = useState(false)
  const [providerSignInInitialProvider, setProviderSignInInitialProvider] = useState<'openai' | 'anthropic' | undefined>(undefined)
  const [connectionsDropdownOpened, setConnectionsDropdownOpened] = useState(false)
  const [showAutomationLabModal, setShowAutomationLabModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [activityPanelWidth, setActivityPanelWidth] = useState(420)
  const [autopilotForceOpen, setAutopilotForceOpen] = useState(false)
  const [autopilotForceEmailUid, setAutopilotForceEmailUid] = useState<string | undefined>(undefined)
  const [isChatBusy, setIsChatBusy] = useState(false)
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
        setCurrentTab(TabChoices.Moltbot)
      } else if (event.key === 'b' && event.metaKey && event.ctrlKey) {
        // Cmd+Ctrl+B: trigger email/calendar briefing in chat
        setCurrentTab(TabChoices.Moltbot)
        emit('kn_trigger_briefing', {})
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
      setCurrentTab(TabChoices.Moltbot)
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // When ClawdChat drafts an email reply, find the matching classified email,
  // attach the draft body, and open the autopilot drawer to that email.
  // Only works when the user has authenticated email — otherwise the draft
  // stays visible in the chat (the original approach).
  useEffect(() => {
    const unlisten = listen<{ subject: string; draftBody: string }>(
      'kn_email_draft_from_chat',
      (event) => {
        if (!feed.loggedEmailAutopilot) return // no email auth — keep draft in chat

        const { subject, draftBody } = event.payload
        if (!subject || !draftBody) return

        const normalise = (s: string) =>
          s.toLowerCase().replace(/^re:\s*/i, '').replace(/[^a-z0-9]/g, '')

        const normSubject = normalise(subject)

        // Search all classified email categories for a subject match
        const allEmails = (Object.values(feed.classifiedEmails ?? {}) as DisplayEmail[][]).flat()
        const match = allEmails.find(
          e => e && normalise(e.message.subject ?? '').includes(normSubject),
        ) ?? allEmails.find(
          e => e && normSubject.includes(normalise(e.message.subject ?? '')),
        )

        if (match) {
          // Set the draft on the matched email
          feed.takeEmailAction(
            match.message.emailUid,
            AutopilotActions.GENERATE_DRAFT_REPLY,
            (auth.profile?.provider ?? ConnectionKeys.GOOGLE_PROFILE) as
              ConnectionKeys.GOOGLE_PROFILE | ConnectionKeys.MICROSOFT_PROFILE,
            draftBody,
          )
          // Open drawer to this specific email
          setAutopilotForceEmailUid(match.message.emailUid)
          setAutopilotForceOpen(true)
        } else {
          // No match — just open the drawer generically
          setAutopilotForceOpen(true)
        }
      },
    )
    return () => {
      unlisten.then(fn => fn())
    }
  }, [feed.classifiedEmails, feed.loggedEmailAutopilot, auth.profile?.provider])

  useEffect(() => {
    document.documentElement.style.backgroundColor = 'rgba(5, 5, 5, 0.0)'
    invoke('kn_init_app')
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
      const scopes = [
        ...googleConnections[ConnectionKeys.GOOGLE_PROFILE].scopes,
        ...googleConnections[ConnectionKeys.GOOGLE_GMAIL].scopes,
        ...googleConnections[ConnectionKeys.GOOGLE_CALENDAR].scopes,
      ].join(' ')
      openGoogleAuthScreen(scopes)
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
      const scopes = [
        ...microsoftConnections[ConnectionKeys.MICROSOFT_PROFILE].scopes,
        ...microsoftConnections[ConnectionKeys.MICROSOFT_OUTLOOK].scopes,
        ...microsoftConnections[ConnectionKeys.MICROSOFT_CALENDAR].scopes,
      ].join(' ')

      openMicrosoftAuthScreen(scopes, [
        ConnectionKeys.MICROSOFT_PROFILE,
        ConnectionKeys.MICROSOFT_OUTLOOK,
        ConnectionKeys.MICROSOFT_CALENDAR,
      ])
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

  const handleOpenProviderSignIn = useCallback((provider?: 'openai' | 'anthropic') => {
    setProviderSignInInitialProvider(provider)
    setIsProviderSignInDialogOpened(true)
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
        rightComponent={
          auth.profile ? (
            <>
              <a
                className="text-ks-warm-grey-700 hover:text-ks-warm-grey-800 cursor-pointer font-bold !font-Lora text-xs flex items-center"
                href="https://www.knapsack.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
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
          <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} fullRelease={fullRelease} />
          <div data-tauri-drag-region className="overflow-hidden w-full h-full">
            <div className="KNWorkspace overflow-hidden w-full h-full bg-ks-bg-main">
              {currentTab === TabChoices.Work && (
                <div className="overflow-hidden w-full h-full flex flex-row">
                  <FeedSidebar feed={feed} isAnyRecording={isAnyRecording} />
                  {/*<RecordingProvider>*/}
                  <CenterWorkspace
                    feed={feed}
                    llmBar={llmBar}
                    userImg={userImage}
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

              {currentTab === TabChoices.Moltbot && (
                <div className="overflow-hidden w-full h-full flex flex-row relative">
                  <div className="overflow-hidden flex-1 h-full min-w-0">
                    <ClawdChat
                      showActivityPanel={showActivityPanel}
                      onToggleActivity={() => setShowActivityPanel(prev => !prev)}
                      onCloseActivity={() => setShowActivityPanel(false)}
                      userEmail={userEmail}
                      userName={userName}
                      onBusyChange={setIsChatBusy}
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
                  {(feed.loggedEmailAutopilot || autopilotForceOpen) ? (
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
                      forceEmailUid={autopilotForceEmailUid}
                      onForceOpenHandled={() => {
                        setAutopilotForceOpen(false)
                        setAutopilotForceEmailUid(undefined)
                      }}
                      isChatBusy={isChatBusy}
                    />
                  ) : auth.profile && (
                    <div className="absolute bottom-0 right-0 z-40">
                      <div className="mr-4 mb-4 rounded-xl bg-white border border-ks-warm-grey-200 shadow-lg overflow-hidden p-4 max-w-[360px]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-ks-red-500" />
                          <span className="text-xs font-semibold font-InterTight text-ks-red-700 tracking-wide uppercase">
                            Email Autopilot
                          </span>
                        </div>
                        <p className="text-sm text-ks-warm-grey-700 font-Inter mb-3">
                          Connect your email to enable smart email triage and draft replies.
                        </p>
                        <button
                          onClick={() => onConnectAccountClick([
                            auth.profile?.provider === ConnectionKeys.MICROSOFT_PROFILE
                              ? ConnectionKeys.MICROSOFT_OUTLOOK
                              : ConnectionKeys.GOOGLE_GMAIL,
                          ])}
                          className="px-3 py-1.5 rounded-lg bg-ks-red-600 hover:bg-ks-red-700 text-white text-xs font-semibold font-InterTight transition-colors"
                        >
                          {auth.profile?.provider === ConnectionKeys.MICROSOFT_PROFILE
                            ? 'Connect Outlook'
                            : 'Connect Gmail'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentTab === TabChoices.Email && (
                <EmailTabView
                  feed={feed}
                  userEmail={userEmail}
                  userName={userName}
                  profileProvider={auth.profile?.provider}
                  onConnectAccountClick={onConnectAccountClick}
                />
              )}

              {currentTab === TabChoices.Meeting && (
                <MeetingsTabView
                  feed={feed}
                  addToLLMQueue={addToLLMQueue}
                  copyToClipboard={copyToClipboard}
                  handleErrorContact={handleErrorContact}
                  recordingHandlers={recordingHandlers}
                  connections={connections}
                  onConnectCalendar={() => onConnectAccountClick([ConnectionKeys.GOOGLE_CALENDAR])}
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
