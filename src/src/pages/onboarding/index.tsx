import { ChangeEvent, useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  getCompleteGoogleSignIn,
  googleConnections,
  microsoftConnections,
} from 'src/api/connections'
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
  const [showGoogleRequiredMessage, setShowGoogleRequiredMessage] = useState<boolean>(false)
  const { syncConnections } = useGoogleConnections()
  const { syncLocalFiles } = useLocalConnections()
  const { syncConnections: syncMicrosoftConnections } = useMicrosoftConnections()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [googlePermissions, setGooglePermissions] = useState<Record<string, boolean>>({
    [ConnectionKeys.GOOGLE_CALENDAR]: true,
    // [ConnectionKeys.GOOGLE_DRIVE]: true,
    // [ConnectionKeys.GOOGLE_GMAIL]: true,
    [ConnectionKeys.GOOGLE_PROFILE]: true,
  })
  const [microsoftPermissions] = useState<Record<string, boolean>>({
    // [ConnectionKeys.MICROSOFT_OUTLOOK]: true,
    [ConnectionKeys.MICROSOFT_PROFILE]: true,
    [ConnectionKeys.MICROSOFT_CALENDAR]: true,
    // [ConnectionKeys.MICROSOFT_ONEDRIVE]: true,
  })

  const navigate = useNavigate()

  // On page load
  useEffect(() => {
    KNAnalytics.trackEvent('Onboarding Screen - Loaded', {})
  }, [])

  const transitionToNextScreen = useCallback(
    (index: number) => {
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
              navigateToNextScreen()
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
          navigateToNextScreen()
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
    openGoogleAuthScreen(scopes.join(' '))
    setGoogleListenerTransitionIndex(index)
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

  const onGoogleSkipClick = (index: number) => {
    if (!showGoogleRequiredMessage) {
      setShowGoogleRequiredMessage(true)
      return
    }
    transitionToNextScreen(index)
  }

  const navigateToNextScreen = async () => {
    await setHasOnboarded(true)
    navigate('/home?=' + KN_ONBOARDING_URL_PARAM)
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
      //onAudioGrantClick={onClickGrantAudioPermission}
    />
  )
}
