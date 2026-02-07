import '../../../main.css'
import 'prismjs/themes/prism-tomorrow.css'
import './Home.scss'

import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

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
import { getReleaseType } from 'src/api/app_info'

import { ConnectionKeys, googleConnections, microsoftConnections } from '../../../api/connections'
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
  const [connectionsDropdownOpened, setConnectionsDropdownOpened] = useState(false)
  const [showAutomationLabModal, setShowAutomationLabModal] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

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
      }
    }
  }, [])

  useEffect(() => {
    // remove scrollbars
    document.documentElement.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
                connectionsDropdownOpened={connectionsDropdownOpened}
                setConnectionsDropdownOpened={setConnectionsDropdownOpened}
              />
            </>
          ) : (
            <SigninButton onClick={handleSigninButtonClick} connections={connections} />
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
                <div className="overflow-hidden w-full h-full flex flex-row">
                  <div className="overflow-hidden flex-1 h-full min-w-0">
                    <ClawdChat
                      showActivityPanel={showActivityPanel}
                      onToggleActivity={() => setShowActivityPanel(prev => !prev)}
                    />
                  </div>
                  {showActivityPanel && (
                    <div className="overflow-hidden h-full border-l border-gray-200 bg-white" style={{ width: 420 }}>
                      <ActivityPanel onClose={() => setShowActivityPanel(false)} />
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
