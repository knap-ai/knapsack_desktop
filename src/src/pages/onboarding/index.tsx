import { ChangeEvent, useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { upsertAutomation, insertAutomationToServer } from 'src/api/automations'
import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  getCompleteGoogleSignIn,
  googleConnections,
  microsoftConnections,
} from 'src/api/connections'
import { AGENT_TEMPLATES } from 'src/automations/agentTemplates'
import { upsertTeamAgents } from 'src/agents/teamRoster'
import { AutomationDataSources, CadenceType } from 'src/automations/automation'
import Prompt from 'src/automations/steps/Prompt'
import SemanticSearch from 'src/automations/steps/SemanticSearch'
import { Automation } from 'src/automations/automation'
import { Profile } from 'src/hooks/auth/useAuth'
import { useGoogleConnections } from 'src/hooks/connections/useGoogleConnections'
import { useLocalConnections } from 'src/hooks/connections/useLocalConnections'
import { useMicrosoftConnections } from 'src/hooks/connections/useMicrosoftConnections'
import { logError } from 'src/utils/errorHandling'
import KNAnalytics from 'src/utils/KNAnalytics'
import { CONNECTIONS, KNLocalStorage } from 'src/utils/KNLocalStorage'
import { getFilesPermissions, setIsFilesEnabled } from 'src/utils/permissions/files'
import { openGoogleAuthScreen } from 'src/utils/permissions/google'
import { openMicrosoftAuthScreen } from 'src/utils/permissions/microsoft'
// import { requestNotificationOSPermissions } from 'src/utils/permissions/notification'

import { Event, listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/api/shell'
import { getAppVersion } from 'src/utils/app'

import { AgentSelection } from './AgentPickerScreen'
import { AgentTelegramEntry } from './TelegramAccountsScreen'
import { OnboardingTemplate } from './template'

export const KN_ONBOARDING_URL_PARAM = 'onboarding'
export const KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED: string = 'kn_has_onboarded'

export const getHasOnboarded = async () => {
  const currentOnboardingStatus = await KNLocalStorage.getItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED)
  console.log('currentOnboardingStatus: ', currentOnboardingStatus)
  console.log('getAppVersion: ', await getAppVersion())
  return currentOnboardingStatus === '0.5.5' || currentOnboardingStatus === '1'
  // const val: string | null = KNLocalStorage.getItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED)
  // return val === '1'
}

export const setHasOnboarded = async (hasOnboarded: boolean) => {
  if (hasOnboarded) {
    KNLocalStorage.setItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED, '1')
  } else {
    KNLocalStorage.setItem(KN_LOCAL_STORAGE_KEY_HAS_ONBOARDED, '0')
  }
}

type OnboardingProps = {
  updateProfile: (profile: Profile) => void
}

export const Onboarding = ({ updateProfile }: OnboardingProps) => {
  const [currentSlideOutScreen, setCurrentSlideOutScreen] = useState<number | undefined>()
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false)
  const [currentSlideInScreen, setCurrentSlideInScreen] = useState<number | undefined>(0)
  const [googleListenerTransitionIndex, setGoogleListenerTransitionIndex] = useState<
    number | undefined
  >()
  const [microsoftListenerTransitionIndex, setMicrosoftListenerTransitionIndex] = useState<
    number | undefined
  >()
  const [connectedProvider, setConnectedProvider] = useState<'google' | 'microsoft' | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showGoogleRequiredMessage, setShowGoogleRequiredMessage] = useState<boolean>(false)
  const { syncConnections } = useGoogleConnections()
  const { syncLocalFiles } = useLocalConnections()
  const { syncConnections: syncMicrosoftConnections } = useMicrosoftConnections()
  const [activatedAgents, setActivatedAgents] = useState<AgentTelegramEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [googlePermissions, setGooglePermissions] = useState<Record<string, boolean>>({
    [ConnectionKeys.GOOGLE_CALENDAR]: true,
    // [ConnectionKeys.GOOGLE_DRIVE]: true,
    [ConnectionKeys.GOOGLE_GMAIL]: true,
    [ConnectionKeys.GOOGLE_PROFILE]: true,
  })
  const [microsoftPermissions] = useState<Record<string, boolean>>({
    [ConnectionKeys.MICROSOFT_OUTLOOK]: true,
    [ConnectionKeys.MICROSOFT_PROFILE]: true,
    [ConnectionKeys.MICROSOFT_CALENDAR]: true,
    // [ConnectionKeys.MICROSOFT_ONEDRIVE]: true,
  })

  const navigate = useNavigate()

  // On page load
  useEffect(() => {
    KNAnalytics.trackEvent('Onboarding Screen - Loaded', {})
  }, [])

  const ONBOARDING_SCREEN_NAMES: Record<number, string> = {
    0: 'welcome',
    1: 'sign_in',
    2: 'chrome_extension',
    3: 'agent_picker',
    4: 'telegram_accounts',
  }

  const transitionToNextScreen = useCallback(
    (index: number) => {
      KNAnalytics.trackEvent('onboarding_step_completed', {
        from_step: index,
        from_screen: ONBOARDING_SCREEN_NAMES[index] ?? `screen_${index}`,
        to_step: index + 1,
        to_screen: ONBOARDING_SCREEN_NAMES[index + 1] ?? `screen_${index + 1}`,
        app_version: KNAnalytics.APP_VERSION,
      })
      setCurrentSlideOutScreen(index)

      setTimeout(() => {
        setCurrentSlideInScreen(index + 1)

        setTimeout(() => {
          setCurrentSlideOutScreen(undefined)
        }, 800)
      }, 550)
    },
    [setCurrentSlideOutScreen, setCurrentSlideInScreen],
  )

  // Listen to google signin
  useEffect(() => {
    if (googleListenerTransitionIndex) {
      const unlistenPromise = listen(
        'signin_success',
        (event: Event<{ code: string; raw_scopes: string }>) => {
          setIsLoading(true)
          setError('')

          getCompleteGoogleSignIn(event.payload.code, event.payload.raw_scopes)
            .then(response => {
              const profile = response.profile
              profile.provider = ConnectionKeys.GOOGLE_PROFILE
              updateProfile(profile)
              setConnectedProvider('google')
              setUserEmail(profile.email)
              KNAnalytics.trackEvent('PermissionsGranted', {
                googlePermissions: googlePermissions,
              })
              const connections = Object.entries(googlePermissions)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_key, value]) => value)
                .reduce(
                  (acc: Record<string, Connection>, [key]) => ({
                    ...acc,
                    [key]: {
                      key,
                      state: ConnectionStates.IDLE,
                    },
                  }),
                  {},
                )
              KNLocalStorage.setItem(
                CONNECTIONS,
                Object.keys(connections).map(key => key),
              )
              syncConnections(response.profile.email, connections)
              transitionToExtensionScreen()
              setIsLoading(false)
            })
            .catch(error => {
              setIsLoading(false)

              setError('Something went wrong. Please try again later.')
              logError(new Error('Could not siging with google'), {
                additionalInfo: '',
                error: error,
              })
            })
        },
      )
      return () => {
        unlistenPromise.then(unlisten => unlisten())
      }
    } else if (microsoftListenerTransitionIndex) {
      const unlistenPromise = listen(
        'microsoft_signin_success',
        (event: Event<{ profile: Profile }>) => {
          setIsLoading(true)
          setError('')
          const profile = event.payload.profile
          profile.provider = ConnectionKeys.MICROSOFT_PROFILE
          updateProfile(profile)
          setConnectedProvider('microsoft')
          setUserEmail(profile.email)

          KNAnalytics.trackEvent('PermissionsGranted', {
            microsoftPermissions: microsoftPermissions,
          })

          const connections = Object.entries(microsoftPermissions)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_key, value]) => value)
            .reduce(
              (acc: Record<string, Connection>, [key]) => ({
                ...acc,
                [key]: {
                  key,
                  state: ConnectionStates.IDLE,
                },
              }),
              {},
            )
          KNLocalStorage.setItem(
            CONNECTIONS,
            Object.keys(connections).map(key => key),
          )
          syncMicrosoftConnections(event.payload.profile.email, connections)
          transitionToExtensionScreen()
          setIsLoading(false)
        },
      )
      return () => {
        unlistenPromise.then(unlisten => unlisten())
      }
    }
  }, [
    googleListenerTransitionIndex,
    googlePermissions,
    microsoftListenerTransitionIndex,
    microsoftPermissions,
    syncConnections,

    syncMicrosoftConnections,
    transitionToNextScreen,
    updateProfile,
  ])

  const onClickGrantFilePermission = (index: number) => {
    getFilesPermissions().then(result => {
      if (result) {
        KNAnalytics.trackEvent('OnboardingGrantedFilePermissions', {})
        transitionToNextScreen(index)
        syncLocalFiles()
      } else {
        alert(
          'To continue, please go to System Settings App -> Privacy and Security -> Files and Folders -> Knapsack App and enable permissions for your folders.',
        )
      }
    })
  }

  const onClickGrantGooglePermission = (index: number) => {
    if (!showGoogleRequiredMessage && Object.values(googlePermissions).includes(false)) {
      setShowGoogleRequiredMessage(true)
      return
    }
    let scopes: string[] = []
    for (const [key, googlePermission] of Object.entries(googlePermissions)) {
      if (googlePermission) {
        scopes = [...scopes, ...googleConnections[key].scopes]
      }
    }
    try {
      openGoogleAuthScreen(scopes.join(' '))
      setGoogleListenerTransitionIndex(index)
    } catch (error) {
      console.error('Failed to open Google auth:', error)
    }
  }

  const onMicrosoftGrantClick = (index: number) => {
    let scopes: string[] = []
    const scopeKeys: string[] = []
    for (const [key, microsotPermission] of Object.entries(microsoftPermissions)) {
      if (microsotPermission) {
        scopes = [...scopes, ...microsoftConnections[key].scopes]
        scopeKeys.push(key)
      }
    }
    openMicrosoftAuthScreen(scopes.join(' '), scopeKeys)
    setMicrosoftListenerTransitionIndex(index)
  }

  const onGoogleSkipClick = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Skipped Google Sign In', {})
    transitionToExtensionScreen()
  }

  const transitionToExtensionScreen = () => {
    transitionToNextScreen(2)
  }

  const navigateToNextScreen = async () => {
    await setHasOnboarded(true)
    navigate('/home?=' + KN_ONBOARDING_URL_PARAM)
  }

  const onChromeExtensionInstallClick = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Installed Chrome Extension', {})
    transitionToNextScreen(3)
  }

  const onChromeExtensionSkipClick = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Skipped Chrome Extension', {})
    transitionToNextScreen(3)
  }

  // const onClickGrantNotificationPermission = async () => {
  //   const result = await requestNotificationOSPermissions()
  //   if (result) {
  //     navigateToNextScreen()
  //   }
  // }

  // const onClickGrantAudioPermission = async () => {
  //   const result = await invoke('open_screen_recording_settings')
  //   if (result) {
  //     navigateToNextScreen()
  //   }
  // }

  const onChangeGooglePermissions = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setGooglePermissions(prevPermissions => ({
      ...prevPermissions,
      [key]: e.target.checked,
    }))
  }

  const onMessageScreenContinueClick = (index: number) => {
    transitionToNextScreen(index)
  }

  const onMessageScreenHowClick = () => {
    open(
      'https://www.linkedin.com/pulse/private-ai-knapsack-approach-mark-heynen-vaphc/?trackingId=7%2FTTWJINRnuP0Qs5SezkMA%3D%3D',
    )
  }

  const onSkipLocalFilePermission = (index: number) => {
    setIsFilesEnabled(false)
    transitionToNextScreen(index)
  }

  const handleAgentPickerActivate = async (selections: AgentSelection[]) => {
    const enabledSelections = selections.filter(s => s.enabled)

    for (const selection of enabledSelections) {
      let automation: Automation

      if (selection.isCustom && selection.customPrompt) {
        // Agentmaker-generated custom agent
        const sources = (selection.customSources ?? ['email', 'web']).map(s => {
          const isMs = connectedProvider === 'microsoft'
          switch (s) {
            case 'email':
              return isMs ? AutomationDataSources.OUTLOOK : AutomationDataSources.GMAIL
            case 'calendar':
              return isMs
                ? AutomationDataSources.MICROSOFT_CALENDAR
                : AutomationDataSources.GOOGLE_CALENDAR
            case 'drive':
              return isMs ? AutomationDataSources.ONEDRIVE : AutomationDataSources.DRIVE
            case 'web':
              return AutomationDataSources.WEB
            default:
              return AutomationDataSources.WEB
          }
        })

        const cadenceType =
          selection.customCadence === 'weekly'
            ? CadenceType.WEEKLY
            : selection.customCadence === 'hourly'
              ? CadenceType.HOURLY
              : CadenceType.DAILY

        automation = new Automation({
          name: selection.identity.displayName,
          description: selection.identity.personality,
          runs: [],
          cadences: [{ type: cadenceType, time: '08:00' }],
          steps: [
            new SemanticSearch({ sources, userPrompt: selection.customPrompt }),
            new Prompt({ userPrompt: selection.customPrompt }),
          ],
          isActive: true,
          showLibrary: true,
          icon: selection.identity.emoji,
          identity: selection.identity,
        })
      } else {
        // Preset template agent
        const template = AGENT_TEMPLATES.find(t => t.id === selection.templateId)
        if (!template) continue
        automation = template.createAutomation(connectedProvider, {
          cadence: selection.cadenceOverride,
          description: selection.descriptionOverride,
        })
        automation.setIdentity(selection.identity)
      }

      try {
        await upsertAutomation(automation)
        if (userEmail) {
          await insertAutomationToServer(automation, userEmail)
        }
      } catch (err) {
        console.error(`Failed to create agent ${selection.identity.displayName}:`, err)
      }
    }

    // Save activated agents so the first chat session can introduce them
    const activatedAgentsForChat = enabledSelections.map(s => ({
      name: s.identity.displayName,
      emoji: s.identity.emoji,
      personality: s.identity.personality,
      soul: s.identity.soul,
    }))
    localStorage.setItem('kn_onboarding_agents', JSON.stringify(activatedAgentsForChat))
    upsertTeamAgents(activatedAgentsForChat)

    // Build the list for the Telegram setup step
    const telegramEntries: AgentTelegramEntry[] = enabledSelections.map(s => ({
      agentId: s.identity.displayName.toLowerCase().replace(/\s+/g, '-'),
      name: s.identity.displayName,
      emoji: s.identity.emoji,
    }))
    setActivatedAgents(telegramEntries)

    KNAnalytics.trackEvent('Onboarding - Agents Activated', {
      count: enabledSelections.length,
      agents: enabledSelections.map(s => s.identity.displayName),
    })

    // Transition to the Telegram accounts setup step
    transitionToNextScreen(4)
  }

  const handleTelegramAccountsComplete = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Telegram Accounts Completed', {})
    navigateToNextScreen()
  }

  const handleTelegramAccountsSkip = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Skipped Telegram Accounts', {})
    navigateToNextScreen()
  }

  const handleAgentPickerSkip = (_index: number) => {
    KNAnalytics.trackEvent('Onboarding - Skipped Agent Picker', {})
    navigateToNextScreen()
  }

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasOnboarded = await getHasOnboarded()
      if (hasOnboarded) {
        navigate('/home')
      }
    }
    checkOnboardingStatus()
  }, [navigate])

  return (
    <OnboardingTemplate
      currentSlideInScreen={currentSlideInScreen}
      currentSlideOutScreen={currentSlideOutScreen}
      onWelcomeScreenContinueClick={transitionToNextScreen}
      acceptedTerms={acceptedTerms}
      setAcceptedTerms={setAcceptedTerms}
      onLocalFilesGrantClick={onClickGrantFilePermission}
      onLocalSkipClick={onSkipLocalFilePermission}
      onGoogleGrantClick={onClickGrantGooglePermission}
      onGoogleSkipClick={onGoogleSkipClick}
      onMessageScreenContinueClick={onMessageScreenContinueClick}
      onMessageScreenHowClick={onMessageScreenHowClick}
      onChangeGooglePermissions={onChangeGooglePermissions}
      googlePermissions={googlePermissions}
      onMicrosoftGrantClick={onMicrosoftGrantClick}
      isLoading={isLoading}
      error={error}
      onChromeExtensionInstallClick={onChromeExtensionInstallClick}
      onChromeExtensionSkipClick={onChromeExtensionSkipClick}
      connectedProvider={connectedProvider}
      onAgentPickerActivate={handleAgentPickerActivate}
      onAgentPickerSkip={handleAgentPickerSkip}
      activatedAgents={activatedAgents}
      userSlug={userEmail ? userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12) : 'user'}
      accountEmail={userEmail}
      onTelegramAccountsComplete={handleTelegramAccountsComplete}
      onTelegramAccountsSkip={handleTelegramAccountsSkip}
      //onAudioGrantClick={onClickGrantAudioPermission}
    />
  )
}
