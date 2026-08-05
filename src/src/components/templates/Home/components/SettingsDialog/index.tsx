import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Connection,
  ConnectionKeys,
  connectionsMap,
  getConnections,
  getGoogleCalendarConnections,
  getGoogleDriveConnections,
  getGoogleGmailConnections,
} from 'src/api/connections'
import {
  getSessionCapabilitySecretStatus,
  setSessionCapabilitySecret,
} from 'src/api/channels'
import { Profile } from 'src/hooks/auth/useAuth'
import { useChannelStatus } from 'src/hooks/channels/useChannelStatus'
import { useAppUpdate } from 'src/hooks/useAppUpdate'
import { KN_API_GET_USER_EMAIL } from 'src/utils/constants'
import { logError } from 'src/utils/errorHandling'
import { BaseException } from 'src/utils/exceptions/base'
import KNAnalytics from 'src/utils/KNAnalytics'
import { setIsFilesEnabled } from 'src/utils/permissions/files'
import {
  openAddGoogleCalendarScreen,
  openAddGoogleDriveScreen,
  openAddGoogleGmailScreen,
} from 'src/utils/permissions/google'
import {
  arePushNotificationsOSEnabledAndWantedByUser,
  requestNotificationOSPermissions,
  setUserWantsNotifications,
} from 'src/utils/permissions/notification'
import {
  getKeepAwakeConfirmationAcknowledged,
  getKeepAwakeOnLidCloseEnabled,
  getMeetingChatAutoSend,
  getMeetingChatEnabled,
  getNotificationLeadTimeMin,
  setKeepAwakeConfirmationAcknowledged,
  setKeepAwakeOnLidCloseEnabled,
  setMeetingChatAutoSend as setMeetingChatAutoSendSetting,
  setMeetingChatEnabled as setMeetingChatEnabledSetting,
  setNotificationLeadTimeMin,
  setSaveTranscriptStore,
  shouldSaveTranscript,
} from 'src/utils/settings'

import { InputCheckbox } from 'src/components/atoms/input-checkbox'
import InputSelect from 'src/components/atoms/input-select'
import { Typography, TypographyWeight } from 'src/components/atoms/typography'
import { Dialog } from 'src/components/molecules/Dialog'
import HeartbeatSettings from 'src/components/organisms/HeartbeatSettings'

import { invoke } from '@tauri-apps/api/tauri'

import styles from './styles.module.scss'

type SettingsDialogProps = {
  handlePrivacyLinkClick: () => void
  handleTermsOfUseClick: () => void
  handleClose: () => void
  isOpen: boolean
  connections: Record<string, Connection>
  email?: string
  onConnectAccountClick: (keys: ConnectionKeys[]) => void
  fetchConnections: (email: string) => void
  deleteConnection: (id: number) => void
  profile: Profile | undefined
  onProviderSignInClick?: (
    provider?: 'knapsack' | 'openai' | 'anthropic' | 'openrouter' | 'trustedrouter',
  ) => void
}

const PERMISSION_LIST_GOOGLE_CONNECTIONS = new Set([
  ConnectionKeys.GOOGLE_CALENDAR,
  ConnectionKeys.GOOGLE_DRIVE,
  ConnectionKeys.GOOGLE_GMAIL,
])

const PERMISSION_LIST_MICROSOFT_CONNECTIONS = new Set([
  ConnectionKeys.MICROSOFT_CALENDAR,
  ConnectionKeys.MICROSOFT_ONEDRIVE,
  ConnectionKeys.MICROSOFT_OUTLOOK,
])

const PERMISSION_NAME_LIST = {
  [ConnectionKeys.GOOGLE_CALENDAR]: 'Calendar',
  [ConnectionKeys.GOOGLE_DRIVE]: 'Drive',
  [ConnectionKeys.GOOGLE_GMAIL]: 'Gmail',
  [ConnectionKeys.MICROSOFT_CALENDAR]: 'Outlook Calendar',
  [ConnectionKeys.LOCAL_FILES]: 'Local files',
  [ConnectionKeys.GOOGLE_PROFILE]: 'Google Profile',
  [ConnectionKeys.MICROSOFT_PROFILE]: 'Microsoft Profile',
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: 'OneDrive',
  [ConnectionKeys.MICROSOFT_OUTLOOK]: 'Outlook',
}

const NOTIFICATION_LEAD_TIME = [
  { label: '1 minute before', value: '1' },
  { label: '2 minutes before', value: '2' },
  { label: '3 minutes before', value: '3' },
]

// ── Accordion primitive (mirrors ClawdChat channel accordion) ────────────────

type ProviderAccordionProps = {
  title: string
  isActive?: boolean
  isConnected?: boolean
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const ProviderAccordion = ({
  title,
  isActive,
  isConnected,
  expanded,
  onToggle,
  children,
}: ProviderAccordionProps) => (
  <div
    className={`${styles.providerItem} ${expanded ? styles.providerItemOpen : ''} ${isConnected ? styles.providerItemConnected : ''}`}
  >
    <button className={styles.providerHeader} onClick={onToggle}>
      <div className={styles.providerTitle}>{title}</div>
      {isConnected && (
        <span className={styles.providerCheck}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {isActive && <span className={styles.providerBadgeActive}>Active</span>}
      <svg
        className={styles.providerChevron}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div className={styles.providerBody}>{children}</div>
  </div>
)

// ── Ollama types ─────────────────────────────────────────────────────────────

type OllamaModel = {
  name: string
  size?: number
  parameter_size?: string
  family?: string
}

// ── Update section ───────────────────────────────────────────────────────────

const UpdateSection = () => {
  const {
    updateState,
    autoInstallEnabled,
    countdownRemainingSec,
    checkForUpdates,
    restartApp,
    setAutoInstallEnabled,
  } = useAppUpdate()

  const statusText = (() => {
    switch (updateState.status) {
      case 'checking':
        return 'Checking for updates...'
      case 'up-to-date':
        return "You're up to date"
      case 'available':
        if (autoInstallEnabled && countdownRemainingSec !== null) {
          return `Version ${'version' in updateState ? updateState.version : ''} available - auto-installing in ${countdownRemainingSec}s`
        }
        return `Version ${'version' in updateState ? updateState.version : ''} available`
      case 'downloading':
        return 'Installing update…'
      case 'ready':
        return 'Update ready — restart to apply'
      case 'error':
        return `Error: ${updateState.message}`
      default:
        return null
    }
  })()

  return (
    <div className="p-6 flex flex-col gap-3">
      <Typography weight={TypographyWeight.medium}>Updates</Typography>
      <div className="flex flex-col gap-2 rounded border border-zinc-200 bg-zinc-50 px-3 py-2">
        <InputCheckbox
          checked={autoInstallEnabled}
          onClick={() => {
            void setAutoInstallEnabled(!autoInstallEnabled)
          }}
        >
          Automatically install updates after a 1 minute countdown
        </InputCheckbox>
        <Typography className="text-xs text-zinc-500">
          Best for headless or unattended Macs. When an update is found, Knapsack will warn for 60
          seconds, then close and install it automatically.
        </Typography>
      </div>
      <div className="flex justify-between items-center h-[36px]">
        <Typography className="text-sm text-gray-600">
          {statusText || 'Check for new versions'}
        </Typography>
        {(updateState.status === 'idle' ||
          updateState.status === 'up-to-date' ||
          updateState.status === 'error') && (
          <button
            onClick={checkForUpdates}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Check for Updates
          </button>
        )}
        {updateState.status === 'checking' && (
          <span className="text-sm text-gray-400 animate-pulse">Checking...</span>
        )}
        {(updateState.status === 'available' || updateState.status === 'ready') && (
          <button
            onClick={restartApp}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Install &amp; Restart
          </button>
        )}
        {updateState.status === 'downloading' && (
          <span className="text-sm text-gray-400 animate-pulse">Installing…</span>
        )}
      </div>
    </div>
  )
}

// ── Support section ──────────────────────────────────────────────────────────

function SupportSection() {
  const [logPath, setLogPath] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    invoke<string>('kn_get_log_path')
      .then(setLogPath)
      .catch(() => {})
  }, [])

  const handleOpenLogsFolder = useCallback(async () => {
    if (!logPath) return
    try {
      await invoke('kn_open_file_as_app', { path: logPath })
    } catch {
      // folder may not exist yet before first log write; that's fine
    }
  }, [logPath])

  const handleCopyLogPath = useCallback(async () => {
    if (!logPath) return
    await navigator.clipboard.writeText(logPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [logPath])

  return (
    <div className="p-6 flex flex-col gap-4">
      <Typography weight={TypographyWeight.medium}>Support</Typography>
      <Typography className="text-zinc-500 text-sm">
        Share your log folder with Knapsack support to help diagnose issues.
      </Typography>
      <div className="flex gap-3">
        <button
          className="px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-100 transition-colors"
          onClick={handleOpenLogsFolder}
          disabled={!logPath}
        >
          Open logs folder
        </button>
        <button
          className="px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-100 transition-colors"
          onClick={handleCopyLogPath}
          disabled={!logPath}
        >
          {copied ? 'Copied!' : 'Copy log path'}
        </button>
      </div>
    </div>
  )
}

function MobilePairingSection() {
  const [pairingCode, setPairingCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    invoke<string>('get_mobile_pairing_token')
      .then(setPairingCode)
      .catch(() => setPairingCode(''))
  }, [])

  const copyPairingCode = useCallback(async () => {
    if (!pairingCode) return
    await navigator.clipboard.writeText(pairingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [pairingCode])

  return (
    <div className="p-6 flex flex-col gap-3">
      <Typography weight={TypographyWeight.medium}>Mobile pairing</Typography>
      <Typography className="text-zinc-500 text-sm">
        Copy this private code into Knapsack on your iPhone. It prevents other devices on the same
        network from reading your chats, meetings, or calendar.
      </Typography>
      <button
        className="self-start px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-100 transition-colors"
        onClick={copyPairingCode}
        disabled={!pairingCode}
      >
        {copied ? 'Copied!' : 'Copy mobile pairing code'}
      </button>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export const SettingsDialog = ({
  handlePrivacyLinkClick,
  handleTermsOfUseClick,
  handleClose,
  isOpen,
  connections,
  email,
  onConnectAccountClick,
  fetchConnections,
  deleteConnection,
  profile,
  onProviderSignInClick,
}: SettingsDialogProps) => {
  const [settingsConnections, setSettingsConnections] =
    useState<Record<string, Connection>>(connections)
  const [sendPushNotificationsIsChecked, setSendPushNotificationsIsChecked] =
    useState<boolean>(false)
  const [saveTranscripts, setSaveTranscripts] = useState<boolean>(true)
  const [meetingChatEnabled, setMeetingChatEnabled] = useState<boolean>(true)
  const [meetingChatAutoSend, setMeetingChatAutoSend] = useState<boolean>(false)
  const [keepAwakeOnLidCloseEnabled, setKeepAwakeOnLidCloseEnabledState] = useState<boolean>(false)
  const [showKeepAwakeEnableModal, setShowKeepAwakeEnableModal] = useState<boolean>(false)
  const [hasAcknowledgedKeepAwakeWarning, setHasAcknowledgedKeepAwakeWarning] =
    useState<boolean>(false)
  const [connectionsKey, setConnectionsKey] = useState<ConnectionKeys[]>([])
  const [showNotificationLeadTime, setShowNotificationLeadTime] = useState<number>(1)
  const [embeddedBrowserEnabled, setEmbeddedBrowserEnabled] = useState(
    () => localStorage.getItem('knapsack.browser.embedded.enabled') === 'true',
  )
  const [browserPresentationBusy, setBrowserPresentationBusy] = useState(false)
  const [browserPresentationMessage, setBrowserPresentationMessage] = useState('')
  const [providerStatus, setProviderStatus] = useState<{
    active_provider?: string
    has_openai_key?: boolean
    has_anthropic_key?: boolean
    has_openrouter_key?: boolean
    has_trustedrouter_key?: boolean
    has_gemini_cli_key?: boolean
    has_knapsack?: boolean
    knapsack_email?: string
    ollama_enabled?: boolean
    ollama_model?: string
    ollama_base_url?: string
    extra_providers?: Array<{ id: string; env_var: string; has_key: boolean }>
  } | null>(null)
  const settingsContainerRef = useRef<HTMLDivElement>(null)
  const channels = useChannelStatus(isOpen)
  const [channelBusy, setChannelBusy] = useState<string | null>(null)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [showTelegramInput, setShowTelegramInput] = useState(false)
  const isMacPlatform = navigator.platform?.includes('Mac')
  const isWindowsPlatform = navigator.platform?.includes('Win')
  const showKeepAwakePowerControls = isMacPlatform || isWindowsPlatform

  // Accordion state — which provider section is expanded
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  // Snowflake identity broker secret (shared with the team, not user-generated)
  const [snowflakeSecretConfigured, setSnowflakeSecretConfigured] = useState(false)
  const [snowflakeSecretInput, setSnowflakeSecretInput] = useState('')
  const [snowflakeSecretSaving, setSnowflakeSecretSaving] = useState(false)
  const [snowflakeSecretMessage, setSnowflakeSecretMessage] = useState('')
  const [showSnowflakeInput, setShowSnowflakeInput] = useState(false)

  useEffect(() => {
    getSessionCapabilitySecretStatus()
      .then(res => setSnowflakeSecretConfigured(res.configured))
      .catch(() => {
        /* status endpoint unreachable — leave as not configured */
      })
  }, [])

  const handleSaveSnowflakeSecret = useCallback(async () => {
    setSnowflakeSecretSaving(true)
    setSnowflakeSecretMessage('')
    try {
      const res = await setSessionCapabilitySecret(snowflakeSecretInput.trim())
      if (res.success) {
        setSnowflakeSecretConfigured(!!snowflakeSecretInput.trim())
        setSnowflakeSecretInput('')
        setSnowflakeSecretMessage(res.message ?? 'Saved')
        setShowSnowflakeInput(false)
      } else {
        setSnowflakeSecretMessage(res.message ?? 'Failed to save')
      }
    } catch {
      setSnowflakeSecretMessage('Failed to reach the local service — is Knapsack running?')
    } finally {
      setSnowflakeSecretSaving(false)
    }
  }, [snowflakeSecretInput])

  // Ollama state
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null)
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [ollamaBusy, setOllamaBusy] = useState(false)
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('')
  const [backendPrimaryEmail, setBackendPrimaryEmail] = useState('')
  const displayConnections =
    isOpen && Object.keys(settingsConnections).length > 0 ? settingsConnections : connections
  const googlePrimaryEmail =
    email ||
    profile?.email ||
    backendPrimaryEmail ||
    getGoogleDriveConnections(displayConnections).find(item => item.calendarAccountEmail)
      ?.calendarAccountEmail ||
    getGoogleGmailConnections(displayConnections).find(item => item.calendarAccountEmail)
      ?.calendarAccountEmail ||
    getGoogleCalendarConnections(displayConnections).find(item => item.calendarAccountEmail)
      ?.calendarAccountEmail ||
    ''

  const loadSettingsConnections = useCallback(async () => {
    if (!googlePrimaryEmail) return
    try {
      const updatedConnections = await getConnections(googlePrimaryEmail, { includeAllUsers: true })
      setSettingsConnections(updatedConnections)
    } catch (error: any) {
      logError(new Error('Failed to load all settings connections'), {
        additionalInfo: 'Settings connections aggregate',
        error: error?.message || String(error),
      })
      setSettingsConnections(connections)
    }
  }, [connections, googlePrimaryEmail])

  const requireGooglePrimaryEmail = useCallback(
    (flow: string) => {
      if (googlePrimaryEmail) return googlePrimaryEmail

      const error = new Error('Missing primary Google email for add-account flow')
      logError(error, {
        additionalInfo: flow,
        error: error.message,
      })
      console.error(error.message, flow)
      return null
    },
    [googlePrimaryEmail],
  )

  const handleAddGoogleDrive = useCallback(() => {
    const primaryEmail = requireGooglePrimaryEmail('drive')
    if (primaryEmail) openAddGoogleDriveScreen(primaryEmail)
  }, [requireGooglePrimaryEmail])

  const handleAddGoogleGmail = useCallback(() => {
    const primaryEmail = requireGooglePrimaryEmail('gmail')
    if (primaryEmail) openAddGoogleGmailScreen(primaryEmail)
  }, [requireGooglePrimaryEmail])

  const handleAddGoogleCalendar = useCallback(() => {
    const primaryEmail = requireGooglePrimaryEmail('calendar')
    if (primaryEmail) {
      openAddGoogleCalendarScreen(primaryEmail, 'https://www.googleapis.com/auth/calendar.readonly')
    }
  }, [requireGooglePrimaryEmail])

  const getGoogleAccountLabel = useCallback(
    (item: Connection) => item.calendarAccountEmail || googlePrimaryEmail || 'unknown account',
    [googlePrimaryEmail],
  )

  const getGoogleOwnerSuffix = useCallback((item: Connection) => {
    if (!item.ownerEmail || item.ownerEmail === item.calendarAccountEmail) return ''
    return ` via ${item.ownerEmail}`
  }, [])

  useEffect(() => {
    setSettingsConnections(connections)
  }, [connections])

  useEffect(() => {
    if (!isOpen || email || profile?.email || backendPrimaryEmail) return

    fetch(KN_API_GET_USER_EMAIL)
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (data?.email) setBackendPrimaryEmail(data.email)
      })
      .catch(error => {
        logError(new Error('Failed to load fallback user email'), {
          additionalInfo: 'Settings add Google account',
          error: error.message,
        })
      })
  }, [backendPrimaryEmail, email, isOpen, profile?.email])

  useEffect(() => {
    if (!isOpen) return
    void loadSettingsConnections()
  }, [isOpen, loadSettingsConnections])

  useEffect(() => {
    if (profile && profile.provider) {
      if (profile.provider === ConnectionKeys.MICROSOFT_PROFILE) {
        setConnectionsKey([...PERMISSION_LIST_MICROSOFT_CONNECTIONS])
      } else {
        setConnectionsKey([...PERMISSION_LIST_GOOGLE_CONNECTIONS])
      }
    }
  }, [profile])

  useEffect(() => {
    getNotificationLeadTimeMin().then(value => setShowNotificationLeadTime(value))
  }, [])

  useEffect(() => {
    if (!isOpen) return
    fetch('http://127.0.0.1:8897/api/clawd/browser/presentation')
      .then(response => (response.ok ? response.json() : null))
      .then(data => {
        if (typeof data?.embedded === 'boolean') {
          setEmbeddedBrowserEnabled(data.embedded)
        }
      })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    fetch('http://127.0.0.1:8897/api/clawd/service/api-key-status')
      .then(r => r.json())
      .then(data => {
        setProviderStatus({
          active_provider: data.active_provider,
          has_openai_key: data.has_openai_key,
          has_anthropic_key: data.has_anthropic_key,
          has_openrouter_key: data.has_openrouter_key,
          has_trustedrouter_key: data.has_trustedrouter_key,
          has_gemini_cli_key: data.has_gemini_cli_key,
          has_knapsack: data.has_knapsack,
          knapsack_email: data.knapsack_email,
          ollama_enabled: data.ollama_enabled,
          ollama_model: data.ollama_model,
          ollama_base_url: data.ollama_base_url,
          extra_providers: data.extra_providers,
        })
        if (data.ollama_model) {
          setSelectedOllamaModel(data.ollama_model)
        }
      })
      .catch(() => {})
  }, [isOpen])

  const handleEmbeddedBrowserToggle = useCallback(async () => {
    if (browserPresentationBusy) return
    const nextEnabled = !embeddedBrowserEnabled
    setBrowserPresentationBusy(true)
    setBrowserPresentationMessage('Switching browser mode…')
    try {
      const response = await fetch('http://127.0.0.1:8897/api/clawd/browser/presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedded: nextEnabled }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not change browser mode')
      }
      setEmbeddedBrowserEnabled(result.embedded)
      setBrowserPresentationMessage(result.message)
      localStorage.setItem(
        'knapsack.browser.embedded.enabled',
        String(result.embedded),
      )
      window.dispatchEvent(
        new CustomEvent('knapsack:browser-mode-changed', {
          detail: { enabled: result.embedded },
        }),
      )
    } catch (error) {
      setBrowserPresentationMessage(
        error instanceof Error ? error.message : String(error),
      )
    } finally {
      setBrowserPresentationBusy(false)
    }
  }, [browserPresentationBusy, embeddedBrowserEnabled])

  // Check Ollama status + fetch models when the Ollama accordion is expanded
  useEffect(() => {
    if (expandedProvider !== 'ollama') return
    setOllamaRunning(null)
    fetch('http://127.0.0.1:8897/api/knapsack/ollama/status')
      .then(r => r.json())
      .then(data => setOllamaRunning(data.running))
      .catch(() => setOllamaRunning(false))

    fetch('http://127.0.0.1:8897/api/knapsack/ollama/models')
      .then(r => r.json())
      .then(data => {
        if (data.success) setOllamaModels(data.models)
      })
      .catch(() => {})
  }, [expandedProvider])

  useEffect(() => {
    shouldSaveTranscript().then(value => {
      setSaveTranscripts(value)
    })

    arePushNotificationsOSEnabledAndWantedByUser().then(value => {
      setSendPushNotificationsIsChecked(value)
    })

    getMeetingChatEnabled().then(setMeetingChatEnabled)
    getMeetingChatAutoSend().then(setMeetingChatAutoSend)
    getKeepAwakeOnLidCloseEnabled().then(setKeepAwakeOnLidCloseEnabledState)
    getKeepAwakeConfirmationAcknowledged().then(setHasAcknowledgedKeepAwakeWarning)
  }, [])

  const handleNotificationEnabledChange = useCallback(async () => {
    let userWantsNotfications = !sendPushNotificationsIsChecked
    console.log('USER WANTS NOTFICATIONS: ', userWantsNotfications)
    if (userWantsNotfications) {
      const permission = await requestNotificationOSPermissions()
      console.log('PERMISSIONS: ', permission)
      if (!permission) {
        console.log("USER DIDN'T GIVE OS PERMISSION FOR NOTIFICATIONS: aborting")
        return
      }
    }
    setUserWantsNotifications(userWantsNotfications)
    setSendPushNotificationsIsChecked(userWantsNotfications)
  }, [sendPushNotificationsIsChecked])

  const handleDeleteConnection = useCallback(
    async (connection: Connection) => {
      if (!email) {
        logError(new BaseException('The user email is missing'), {
          additionalInfo: 'Attempted to delete a connection without a valid user email',
        })
        return
      }
      if (connection.id) {
        await deleteConnection(connection.id)
      } else if (connection.key !== ConnectionKeys.LOCAL_FILES) {
        logError(new BaseException('This connection is missing the ID property'), {
          additionalInfo: connection.key,
        })
        return
      }
      if (connection.key === ConnectionKeys.LOCAL_FILES) {
        setIsFilesEnabled(false)
      }
      await fetchConnections(email)
      await loadSettingsConnections()
    },
    [deleteConnection, email, fetchConnections, loadSettingsConnections],
  )

  const handleShowNotificationLeadTimeChange = (min: string) => {
    const minNumber = parseInt(min)
    setNotificationLeadTimeMin(minNumber)
    setShowNotificationLeadTime(minNumber)
  }

  const handleFlipSaveTranscript = () => {
    setSaveTranscripts(prevState => !prevState)
    setSaveTranscriptStore(!saveTranscripts)
  }

  const handleFlipMeetingChatEnabled = () => {
    const newValue = !meetingChatEnabled
    setMeetingChatEnabled(newValue)
    setMeetingChatEnabledSetting(newValue)
  }

  const handleFlipMeetingChatAutoSend = () => {
    const newValue = !meetingChatAutoSend
    setMeetingChatAutoSend(newValue)
    setMeetingChatAutoSendSetting(newValue)
  }

  const applyKeepAwakeOnLidCloseSetting = useCallback((newValue: boolean) => {
    setKeepAwakeOnLidCloseEnabledState(newValue)
    setKeepAwakeOnLidCloseEnabled(newValue)
    invoke('kn_set_keep_awake', { enabled: newValue }).catch(() => {})
  }, [])

  const confirmKeepAwakeEnable = useCallback(() => {
    void setKeepAwakeConfirmationAcknowledged()
    setHasAcknowledgedKeepAwakeWarning(true)
    setShowKeepAwakeEnableModal(false)
    applyKeepAwakeOnLidCloseSetting(true)
  }, [applyKeepAwakeOnLidCloseSetting])

  const cancelKeepAwakeEnable = useCallback(() => {
    setShowKeepAwakeEnableModal(false)
  }, [])

  const handleFlipKeepAwakeOnLidClose = useCallback(() => {
    const newValue = !keepAwakeOnLidCloseEnabled
    if (!newValue) {
      applyKeepAwakeOnLidCloseSetting(false)
      return
    }
    if (hasAcknowledgedKeepAwakeWarning) {
      applyKeepAwakeOnLidCloseSetting(true)
      return
    }
    setShowKeepAwakeEnableModal(true)
  }, [applyKeepAwakeOnLidCloseSetting, hasAcknowledgedKeepAwakeWarning, keepAwakeOnLidCloseEnabled])

  // ── Ollama enable/disable ────────────────────────────────────────────────

  const handleOllamaToggle = async (enable: boolean) => {
    setOllamaBusy(true)
    try {
      const resp = await fetch('http://127.0.0.1:8897/api/knapsack/ollama/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: enable,
          model: selectedOllamaModel || null,
        }),
      })
      const data = await resp.json()
      if (data.success) {
        setProviderStatus(prev =>
          prev
            ? {
                ...prev,
                ollama_enabled: enable,
              }
            : prev,
        )
      }
    } catch {
      // silently fail
    } finally {
      setOllamaBusy(false)
    }
  }

  const [deletingOllamaModel, setDeletingOllamaModel] = useState<string | null>(null)

  const handleOllamaModelChange = async (model: string) => {
    setSelectedOllamaModel(model)
    if (!providerStatus?.ollama_enabled) return
    // Persist model selection
    try {
      await fetch('http://127.0.0.1:8897/api/knapsack/ollama/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          model,
        }),
      })
    } catch {
      // silently fail
    }
  }

  const handleOllamaDeleteModel = async (model: string) => {
    if (
      !confirm(
        `Delete "${model}"? This will free disk space but you'll need to re-download it to use it again.`,
      )
    )
      return
    setDeletingOllamaModel(model)
    try {
      const resp = await fetch('http://127.0.0.1:8897/api/knapsack/ollama/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      })
      const data = await resp.json()
      if (data.success) {
        setOllamaModels(prev => prev.filter(m => m.name !== model))
        // If the deleted model was selected, clear selection
        if (selectedOllamaModel === model) {
          const remaining = ollamaModels.filter(m => m.name !== model)
          const next = remaining[0]?.name || ''
          setSelectedOllamaModel(next)
          if (next && providerStatus?.ollama_enabled) {
            handleOllamaModelChange(next)
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setDeletingOllamaModel(null)
    }
  }

  // ── Accordion toggle ─────────────────────────────────────────────────────

  const toggleProvider = (id: string) => {
    setExpandedProvider(prev => (prev === id ? null : id))
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])

  return (
    <Dialog
      onClose={handleClose}
      isOpen={isOpen}
      dismissable
      className="flex items-center justify-center my-[88px] h-[100vh]"
    >
      <div
        ref={settingsContainerRef}
        className="SettingsContainer relative flex flex-col w-[420px] rounded-lg border border-solid border-zinc-200 bg-white flex-col max-h-[calc(100vh-166px)] overflow-auto"
      >
        <div className="NotificationContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Notifications</Typography>
          <div className="NotificationContent flex flex-col gap-6">
            <InputCheckbox
              checked={sendPushNotificationsIsChecked}
              onClick={handleNotificationEnabledChange}
            >
              <Typography className="text-black">Send push notifications</Typography>
            </InputCheckbox>
          </div>
          <div className="DocumentsContainer py-3 flex flex-col gap-4">
            <div className="flex justify-between h-[36px] items-center">
              <Typography> Show a notification </Typography>
              <InputSelect
                options={NOTIFICATION_LEAD_TIME}
                value={showNotificationLeadTime.toString()}
                onChange={handleShowNotificationLeadTimeChange}
              />
            </div>
          </div>
        </div>
        <hr className="border-zinc-200" />

        <div className="p-6 flex flex-col gap-3">
          <Typography weight={TypographyWeight.medium}>Browser</Typography>
          <InputCheckbox
            checked={embeddedBrowserEnabled}
            onClick={handleEmbeddedBrowserToggle}
          >
            <Typography className="text-black">
              Use embedded browser
            </Typography>
          </InputCheckbox>
          <Typography className="text-xs text-zinc-500 leading-5">
            Off keeps the existing managed Chrome window. On shows that same
            browser profile beside chat and prevents separate browser popups.
            Saved logins remain in the profile in either mode. Changing this
            setting briefly restarts the browser.
          </Typography>
          {browserPresentationMessage && (
            <Typography
              className={`text-xs ${
                browserPresentationMessage.toLowerCase().includes('could not')
                  ? 'text-red-500'
                  : 'text-zinc-500'
              }`}
            >
              {browserPresentationBusy
                ? 'Switching browser mode…'
                : browserPresentationMessage}
            </Typography>
          )}
        </div>
        <hr className="border-zinc-200" />

        {/* ── AI Provider (accordion) ─────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-3">
          <Typography weight={TypographyWeight.medium}>AI Provider</Typography>

          <div className={styles.providerAccordion}>
            {/* Knapsack cloud inference */}
            <ProviderAccordion
              title="Knapsack"
              isActive={providerStatus?.active_provider === 'knapsack'}
              isConnected={!!providerStatus?.has_knapsack}
              expanded={expandedProvider === 'knapsack'}
              onToggle={() => toggleProvider('knapsack')}
            >
              <div className={styles.providerActions}>
                <span className={styles.providerStatus}>
                  {providerStatus?.has_knapsack
                    ? `Connected as ${providerStatus.knapsack_email}`
                    : 'No Knapsack account connected'}
                </span>
                <button
                  className={styles.providerActionLink}
                  onClick={() => {
                    handleClose()
                    onProviderSignInClick?.('knapsack')
                  }}
                >
                  {providerStatus?.has_knapsack ? 'Change model' : 'Connect'}
                </button>
              </div>
              {!providerStatus?.has_knapsack && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                  Need an account?{' '}
                  <a
                    href="https://studio.knapsack.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c54841' }}
                  >
                    Sign up at studio.knapsack.ai
                  </a>
                </p>
              )}
            </ProviderAccordion>

            {/* OpenAI */}
            <ProviderAccordion
              title="OpenAI"
              isActive={providerStatus?.active_provider === 'openai'}
              isConnected={!!providerStatus?.has_openai_key}
              expanded={expandedProvider === 'openai'}
              onToggle={() => toggleProvider('openai')}
            >
              <div className={styles.providerActions}>
                <span className={styles.providerStatus}>
                  {providerStatus?.has_openai_key ? 'API key configured' : 'No API key set'}
                </span>
                <button
                  className={styles.providerActionLink}
                  onClick={() => {
                    handleClose()
                    onProviderSignInClick?.('openai')
                  }}
                >
                  {providerStatus?.has_openai_key ? 'Change' : 'Sign in'}
                </button>
              </div>
            </ProviderAccordion>

            {/* Anthropic */}
            <ProviderAccordion
              title="Anthropic"
              isActive={providerStatus?.active_provider === 'anthropic'}
              isConnected={!!providerStatus?.has_anthropic_key}
              expanded={expandedProvider === 'anthropic'}
              onToggle={() => toggleProvider('anthropic')}
            >
              <div className={styles.providerActions}>
                <span className={styles.providerStatus}>
                  {providerStatus?.has_anthropic_key ? 'API key configured' : 'No API key set'}
                </span>
                <button
                  className={styles.providerActionLink}
                  onClick={() => {
                    handleClose()
                    onProviderSignInClick?.('anthropic')
                  }}
                >
                  {providerStatus?.has_anthropic_key ? 'Change' : 'Sign in'}
                </button>
              </div>
            </ProviderAccordion>

            {/* OpenRouter */}
            <ProviderAccordion
              title="OpenRouter"
              isActive={providerStatus?.active_provider === 'openrouter'}
              isConnected={!!providerStatus?.has_openrouter_key}
              expanded={expandedProvider === 'openrouter'}
              onToggle={() => toggleProvider('openrouter')}
            >
              <div className={styles.providerActions}>
                <span className={styles.providerStatus}>
                  {providerStatus?.has_openrouter_key ? 'API key configured' : 'No API key set'}
                </span>
                <button
                  className={styles.providerActionLink}
                  onClick={() => {
                    handleClose()
                    onProviderSignInClick?.('openrouter')
                  }}
                >
                  {providerStatus?.has_openrouter_key ? 'Change' : 'Sign in'}
                </button>
              </div>
            </ProviderAccordion>

            {/* TrustedRouter */}
            <ProviderAccordion
              title="TrustedRouter"
              isActive={providerStatus?.active_provider === 'trustedrouter'}
              isConnected={!!providerStatus?.has_trustedrouter_key}
              expanded={expandedProvider === 'trustedrouter'}
              onToggle={() => toggleProvider('trustedrouter')}
            >
              <div className={styles.providerActions}>
                <span className={styles.providerStatus}>
                  {providerStatus?.has_trustedrouter_key ? 'API key configured' : 'No API key set'}
                </span>
                <button
                  className={styles.providerActionLink}
                  onClick={() => {
                    handleClose()
                    onProviderSignInClick?.('trustedrouter')
                  }}
                >
                  {providerStatus?.has_trustedrouter_key ? 'Change' : 'Sign in'}
                </button>
              </div>
            </ProviderAccordion>

            {/* Extra providers */}
            {[
              { id: 'gemini', envVar: 'GEMINI_API_KEY', name: 'Google (Gemini)' },
              { id: 'groq', envVar: 'GROQ_API_KEY', name: 'Groq' },
              { id: 'minimax', envVar: 'MINIMAX_API_KEY', name: 'MiniMax' },
              { id: 'zai', envVar: 'ZAI_API_KEY', name: 'ZAI (GLM)' },
              { id: 'huggingface', envVar: 'HF_TOKEN', name: 'Hugging Face' },
            ].map(ep => {
              const status = providerStatus?.extra_providers?.find(p => p.env_var === ep.envVar)
              const isGeminiViaCli = ep.id === 'gemini' && !!providerStatus?.has_gemini_cli_key
              const isConnected = !!status?.has_key || isGeminiViaCli
              return (
                <ProviderAccordion
                  key={ep.id}
                  title={ep.name}
                  isConnected={isConnected}
                  expanded={expandedProvider === ep.id}
                  onToggle={() => toggleProvider(ep.id)}
                >
                  <div className={styles.providerActions}>
                    <span className={styles.providerStatus}>
                      {isConnected
                        ? isGeminiViaCli && !status?.has_key
                          ? 'Gemini CLI auth configured'
                          : 'API key configured'
                        : 'No API key set'}
                    </span>
                    <button
                      className={styles.providerActionLink}
                      onClick={() => {
                        handleClose()
                        onProviderSignInClick?.()
                      }}
                    >
                      {isConnected ? 'Change' : 'Add key'}
                    </button>
                  </div>
                </ProviderAccordion>
              )
            })}

            {/* Ollama (local LLM) */}
            <ProviderAccordion
              title="Ollama (Local)"
              isActive={providerStatus?.active_provider === 'ollama'}
              isConnected={!!providerStatus?.ollama_enabled}
              expanded={expandedProvider === 'ollama'}
              onToggle={() => toggleProvider('ollama')}
            >
              {/* Connection status */}
              <div style={{ marginBottom: 6 }}>
                {ollamaRunning === null ? (
                  <span className={styles.ollamaStatusChecking}>Checking Ollama...</span>
                ) : ollamaRunning ? (
                  <span className={styles.ollamaStatusGreen}>
                    <span className={styles.ollamaStatusDotGreen} />
                    Ollama running
                  </span>
                ) : (
                  <span className={styles.ollamaStatusRed}>
                    <span className={styles.ollamaStatusDotRed} />
                    Ollama not detected
                  </span>
                )}
              </div>

              {!ollamaRunning && ollamaRunning !== null && (
                <div className={styles.ollamaHint}>
                  Install Ollama from{' '}
                  <a
                    href="https://ollama.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.ollamaHintLink}
                  >
                    ollama.com
                  </a>{' '}
                  and start it to use local models.
                </div>
              )}

              {/* Model picker */}
              {ollamaRunning && ollamaModels.length > 0 && (
                <div>
                  <div className={styles.ollamaModelLabel}>Active Model</div>
                  <InputSelect
                    options={ollamaModels.map(m => ({
                      label: `${m.name}${m.parameter_size ? ` (${m.parameter_size})` : ''}`,
                      value: m.name,
                    }))}
                    value={selectedOllamaModel || ollamaModels[0]?.name || ''}
                    onChange={handleOllamaModelChange}
                  />
                  <div className={styles.ollamaModelLabel} style={{ marginTop: 10 }}>
                    Installed Models
                  </div>
                  <div className={styles.ollamaModelList}>
                    {ollamaModels.map(m => {
                      const sizeGB = m.size ? (m.size / 1_073_741_824).toFixed(1) : null
                      const isSelected = (selectedOllamaModel || ollamaModels[0]?.name) === m.name
                      const isDeleting = deletingOllamaModel === m.name
                      return (
                        <div key={m.name} className={styles.ollamaModelRow}>
                          <div className={styles.ollamaModelInfo}>
                            <span className={styles.ollamaModelName}>
                              {m.name}
                              {isSelected && (
                                <span className={styles.ollamaModelActive}>active</span>
                              )}
                            </span>
                            <span className={styles.ollamaModelMeta}>
                              {m.parameter_size && <span>{m.parameter_size}</span>}
                              {sizeGB && <span>{sizeGB} GB</span>}
                              {m.family && <span>{m.family}</span>}
                            </span>
                          </div>
                          <button
                            className={styles.ollamaDeleteBtn}
                            disabled={isDeleting}
                            onClick={() => handleOllamaDeleteModel(m.name)}
                            title={`Delete ${m.name}`}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {ollamaRunning && ollamaModels.length === 0 && (
                <div className={styles.ollamaNoModels}>
                  No models found. Run{' '}
                  <code className={styles.ollamaNoModelsCode}>ollama pull llama3.1</code> to
                  download a model.
                </div>
              )}

              {/* Enable / Disable toggle */}
              {ollamaRunning && (
                <div className={styles.ollamaToggleRow}>
                  <span className={styles.ollamaToggleLabel}>
                    {providerStatus?.ollama_enabled ? 'Ollama is enabled' : 'Use Ollama for AI'}
                  </span>
                  <button
                    className={
                      providerStatus?.ollama_enabled
                        ? styles.ollamaToggleBtnDisable
                        : styles.ollamaToggleBtnEnable
                    }
                    disabled={ollamaBusy}
                    onClick={() => handleOllamaToggle(!providerStatus?.ollama_enabled)}
                  >
                    {ollamaBusy
                      ? 'Saving...'
                      : providerStatus?.ollama_enabled
                        ? 'Disable'
                        : 'Enable'}
                  </button>
                </div>
              )}

              {providerStatus?.ollama_enabled && (
                <div className={styles.ollamaFreeHint}>Free local execution — no API costs</div>
              )}
            </ProviderAccordion>
          </div>
        </div>

        <hr className="border-zinc-200" />
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Typography weight={TypographyWeight.medium}>Messaging Channels</Typography>
            {/* Gateway health indicator */}
            <div className="flex items-center gap-1.5">
              {channels.healthChecking ? (
                <span className="text-[10px] text-gray-400 animate-pulse">checking...</span>
              ) : channels.gatewayHealthy === true ? (
                <span className="text-[10px] text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Gateway OK
                </span>
              ) : channels.gatewayHealthy === false ? (
                <span
                  className="text-[10px] text-red-500 flex items-center gap-1 cursor-pointer"
                  onClick={() => channels.checkHealth()}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Gateway down — retry
                </span>
              ) : null}
            </div>
          </div>
          {channels.loading && !channels.whatsapp && !channels.imessage && (
            <div className="text-xs text-gray-400 animate-pulse">Loading channel status...</div>
          )}
          <div className="flex flex-col gap-2">
            {/* WhatsApp */}
            <div className="flex justify-between h-[36px] items-center">
              <div className="flex items-center gap-2">
                <Typography>WhatsApp</Typography>
                {channels.whatsapp?.linked && channels.whatsapp?.account && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    {channels.whatsapp.account}
                  </span>
                )}
                {channels.whatsapp?.linked && !channels.whatsapp?.account && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    Connected
                  </span>
                )}
                {channels.whatsapp &&
                  channels.whatsapp.enabled &&
                  !channels.whatsapp.linked &&
                  !channels.whatsappLinking &&
                  !channels.whatsappQrUrl && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                      Not linked
                    </span>
                  )}
                {channels.whatsappLinking && (
                  <span className="text-xs text-gray-400 animate-pulse">Generating QR...</span>
                )}
              </div>
              <Typography
                className={`cursor-pointer ${styles.link} ${channelBusy === 'whatsapp' ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={async () => {
                  if (channelBusy) return
                  setChannelBusy('whatsapp')
                  try {
                    if (
                      channels.whatsapp?.linked ||
                      (channels.whatsapp?.enabled &&
                        !channels.whatsappLinking &&
                        !channels.whatsappQrUrl)
                    ) {
                      await channels.disconnectWhatsApp()
                      KNAnalytics.trackEvent('channel_disconnected', {
                        channel: 'whatsapp',
                        app_version: KNAnalytics.APP_VERSION,
                      })
                    } else {
                      await channels.connectWhatsApp()
                      KNAnalytics.trackEvent('channel_connected', {
                        channel: 'whatsapp',
                        app_version: KNAnalytics.APP_VERSION,
                      })
                    }
                  } finally {
                    setChannelBusy(null)
                  }
                }}
              >
                {channelBusy === 'whatsapp'
                  ? 'Working...'
                  : channels.whatsapp?.linked ||
                      (channels.whatsapp?.enabled &&
                        !channels.whatsappLinking &&
                        !channels.whatsappQrUrl)
                    ? 'Disconnect'
                    : 'Connect'}
              </Typography>
            </div>
            {channels.channelErrors?.whatsapp && (
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">
                {channels.channelErrors.whatsapp}
              </Typography>
            )}
            {/* WhatsApp QR code */}
            {channels.whatsappQrUrl && (
              <div className="flex flex-col items-center gap-2 py-2">
                <img
                  src={channels.whatsappQrUrl}
                  alt="WhatsApp QR"
                  className="w-[180px] h-[180px] rounded"
                />
                <Typography className="text-xs text-gray-500">
                  Scan with WhatsApp on your phone
                </Typography>
                <Typography className="text-[10px] text-gray-400 animate-pulse">
                  Waiting for scan...
                </Typography>
              </div>
            )}

            {/* iMessage */}
            <div className="flex justify-between h-[36px] items-center">
              <div className="flex items-center gap-2">
                <Typography>iMessage</Typography>
                {channels.imessage?.configured && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    Connected
                  </span>
                )}
                {channels.imessage &&
                  channels.imessage.enabled &&
                  !channels.imessage.configured && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                      Needs setup
                    </span>
                  )}
              </div>
              <Typography
                className={`cursor-pointer ${styles.link} ${channelBusy === 'imessage' ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={async () => {
                  if (channelBusy) return
                  setChannelBusy('imessage')
                  try {
                    if (channels.imessage?.configured) {
                      await channels.disconnectIMessage()
                      KNAnalytics.trackEvent('channel_disconnected', {
                        channel: 'imessage',
                        app_version: KNAnalytics.APP_VERSION,
                      })
                    } else {
                      await channels.connectIMessage()
                      KNAnalytics.trackEvent('channel_connected', {
                        channel: 'imessage',
                        app_version: KNAnalytics.APP_VERSION,
                      })
                    }
                  } finally {
                    setChannelBusy(null)
                  }
                }}
              >
                {channelBusy === 'imessage'
                  ? 'Working...'
                  : channels.imessage?.configured
                    ? 'Disconnect'
                    : 'Connect'}
              </Typography>
            </div>
            {channels.channelErrors?.imessage && (
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">
                {channels.channelErrors.imessage}
              </Typography>
            )}

            {/* Telegram */}
            <div className="flex justify-between items-start py-1">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Typography>Telegram</Typography>
                  {channels.telegram?.configured ? (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                      {channels.telegramBotUsername
                        ? `Connected as @${channels.telegramBotUsername}`
                        : channels.telegram?.account
                          ? `Connected as ${channels.telegram.account}`
                          : 'Connected'}
                    </span>
                  ) : channels.telegram?.enabled ? (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                      Not configured
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Re-link button: visible when connected, lets user swap tokens */}
                {channels.telegram?.configured && (
                  <Typography
                    className={`cursor-pointer text-xs text-gray-500 hover:text-gray-700 ${channelBusy === 'telegram' ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => {
                      if (channelBusy) return
                      setShowTelegramInput(prev => !prev)
                    }}
                  >
                    {showTelegramInput ? 'Cancel re-link' : 'Re-link'}
                  </Typography>
                )}
                <Typography
                  className={`cursor-pointer ${styles.link} ${channelBusy === 'telegram' ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={async () => {
                    if (channelBusy) return
                    if (channels.telegram?.configured && !showTelegramInput) {
                      setChannelBusy('telegram')
                      try {
                        await channels.disconnectTelegram()
                        KNAnalytics.trackEvent('channel_disconnected', {
                          channel: 'telegram',
                          app_version: KNAnalytics.APP_VERSION,
                        })
                      } finally {
                        setChannelBusy(null)
                      }
                    } else if (!channels.telegram?.configured) {
                      setShowTelegramInput(prev => !prev)
                    }
                  }}
                >
                  {channelBusy === 'telegram'
                    ? 'Working...'
                    : channels.telegram?.configured
                      ? showTelegramInput
                        ? 'Cancel'
                        : 'Disconnect'
                      : showTelegramInput
                        ? 'Cancel'
                        : 'Connect'}
                </Typography>
              </div>
            </div>
            {channels.channelErrors?.telegram && (
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">
                {channels.channelErrors.telegram}
              </Typography>
            )}
            {/* Telegram bot token input — shown on Connect or Re-link */}
            {showTelegramInput && (
              <div className="flex flex-col gap-2 py-1 pl-0.5">
                <Typography className="text-xs text-gray-500">
                  {channels.telegram?.configured
                    ? 'Enter new bot token to replace the current one:'
                    : 'Enter your Telegram bot token from @BotFather:'}
                </Typography>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={telegramBotToken}
                    onChange={e => setTelegramBotToken(e.target.value)}
                    placeholder="123456:ABC-DEF..."
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                  <button
                    className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                    disabled={!telegramBotToken.trim() || channelBusy === 'telegram'}
                    onClick={async () => {
                      setChannelBusy('telegram')
                      try {
                        await channels.connectTelegram(telegramBotToken.trim())
                        KNAnalytics.trackEvent('channel_connected', {
                          channel: 'telegram',
                          app_version: KNAnalytics.APP_VERSION,
                        })
                        setShowTelegramInput(false)
                        setTelegramBotToken('')
                      } catch {
                        // error is displayed via channelErrors
                      } finally {
                        setChannelBusy(null)
                      }
                    }}
                  >
                    {channelBusy === 'telegram' ? 'Validating...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* More channels hint */}
          <div className="flex justify-between h-[36px] items-center">
            <div className="flex items-center gap-2">
              <Typography className="text-gray-500">
                More (Slack, Discord, IRC, Signal, ...)
              </Typography>
            </div>
            <Typography className={`text-xs text-gray-400`}>Use Channels panel in chat</Typography>
          </div>

          {channels.error && (
            <Typography className="text-xs text-red-500">{channels.error}</Typography>
          )}
        </div>
        <hr className="border-zinc-200" />
        <div className="PermissionContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Permissions</Typography>

          <div className="PermissionContent flex flex-col gap-2">
            {/* Non-calendar, non-drive, non-gmail connections */}
            {Object.values(connections)
              .filter(
                item =>
                  connectionsKey.includes(item.key as ConnectionKeys) &&
                  item.key !== ConnectionKeys.GOOGLE_CALENDAR &&
                  item.key !== ConnectionKeys.GOOGLE_DRIVE &&
                  item.key !== ConnectionKeys.GOOGLE_GMAIL &&
                  item.key !== ConnectionKeys.MICROSOFT_CALENDAR,
              )
              .map(item => (
                <div
                  className="flex justify-between h-[36px] items-center"
                  key={`${item.key}-${item.id}`}
                >
                  <Typography>
                    {connectionsMap[item.key]?.label ?? item.key}, {email}
                  </Typography>
                  <Typography
                    className={`cursor-pointer ${styles.link}`}
                    onClick={() => handleDeleteConnection(item)}
                  >
                    Remove
                  </Typography>
                </div>
              ))}

            {/* Google Drive — one row per linked account */}
            {getGoogleDriveConnections(displayConnections).map(item => (
              <div
                className="flex justify-between h-[36px] items-center"
                key={`drive-${item.id}-${item.calendarAccountEmail}-${item.ownerEmail}`}
              >
                <Typography>
                  Drive, {getGoogleAccountLabel(item)}
                  {getGoogleOwnerSuffix(item)}
                </Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={() => handleDeleteConnection(item)}
                >
                  Remove
                </Typography>
              </div>
            ))}

            {/* Google Gmail — one row per linked account */}
            {getGoogleGmailConnections(displayConnections).map(item => (
              <div
                className="flex justify-between h-[36px] items-center"
                key={`gmail-${item.id}-${item.calendarAccountEmail}-${item.ownerEmail}`}
              >
                <Typography>
                  Gmail, {getGoogleAccountLabel(item)}
                  {getGoogleOwnerSuffix(item)}
                </Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={() => handleDeleteConnection(item)}
                >
                  Remove
                </Typography>
              </div>
            ))}

            {/* Google Calendar — one row per linked account */}
            {getGoogleCalendarConnections(displayConnections).map(item => (
              <div
                className="flex justify-between h-[36px] items-center"
                key={`cal-${item.id}-${item.calendarAccountEmail}-${item.ownerEmail}`}
              >
                <Typography>
                  Calendar, {getGoogleAccountLabel(item)}
                  {getGoogleOwnerSuffix(item)}
                </Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={() => handleDeleteConnection(item)}
                >
                  Remove
                </Typography>
              </div>
            ))}

            {/* Microsoft Calendar */}
            {connections[ConnectionKeys.MICROSOFT_CALENDAR] && (
              <div className="flex justify-between h-[36px] items-center">
                <Typography>Outlook Calendar, {email}</Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={() =>
                    handleDeleteConnection(connections[ConnectionKeys.MICROSOFT_CALENDAR])
                  }
                >
                  Remove
                </Typography>
              </div>
            )}
          </div>
        </div>
        <hr className="border-zinc-200" />
        <div className="SnowflakeBrokerContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Snowflake Broker (Scout)</Typography>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Paste the shared signing secret the Scout/broker team gave you — this
            isn&apos;t something you generate yourself.
          </div>
          <div className="flex justify-between h-[36px] items-center">
            <Typography>{snowflakeSecretConfigured ? '••••••••••••' : 'No secret set'}</Typography>
            {snowflakeSecretConfigured && !showSnowflakeInput && (
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => {
                  setSnowflakeSecretMessage('')
                  setShowSnowflakeInput(true)
                }}
              >
                Change
              </Typography>
            )}
          </div>
          {(showSnowflakeInput || !snowflakeSecretConfigured) && (
            <div className="flex gap-2 items-center">
              <input
                type="password"
                placeholder="Paste the broker secret here"
                value={snowflakeSecretInput}
                onChange={e => setSnowflakeSecretInput(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
              <button
                className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                disabled={snowflakeSecretSaving || !snowflakeSecretInput.trim()}
                onClick={handleSaveSnowflakeSecret}
              >
                {snowflakeSecretSaving ? 'Saving...' : 'Save'}
              </button>
              {snowflakeSecretConfigured && (
                <button
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  disabled={snowflakeSecretSaving}
                  onClick={() => {
                    setSnowflakeSecretInput('')
                    setSnowflakeSecretMessage('')
                    setShowSnowflakeInput(false)
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
          {snowflakeSecretMessage && (
            <Typography className="text-xs text-gray-400">{snowflakeSecretMessage}</Typography>
          )}
        </div>
        <hr className="border-zinc-200" />
        <div className="AddAccountContainer p-6 pt-4 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Add an account</Typography>
          <div className="PermissionContent flex flex-col gap-2">
            {/* Standard permissions that aren't multi-account and aren't yet connected */}
            {connectionsKey
              .filter(
                (key: ConnectionKeys) =>
                  key !== ConnectionKeys.GOOGLE_CALENDAR &&
                  key !== ConnectionKeys.GOOGLE_DRIVE &&
                  key !== ConnectionKeys.GOOGLE_GMAIL &&
                  key !== ConnectionKeys.MICROSOFT_CALENDAR &&
                  !Object.keys(connections).some(k => k === key || k.startsWith(`${key}|`)) &&
                  Object.keys(PERMISSION_NAME_LIST).includes(key as string),
              )
              .map((connectionKey: ConnectionKeys) => (
                <div key={connectionKey} className="flex justify-between h-[36px] items-center">
                  <Typography>{PERMISSION_NAME_LIST[connectionKey] ?? ''}</Typography>
                  <Typography
                    className={`cursor-pointer ${styles.link}`}
                    onClick={() => onConnectAccountClick([connectionKey])}
                  >
                    Add
                  </Typography>
                </div>
              ))}

            {/* Add Google Drive (always available for Google users) */}
            {profile?.provider === ConnectionKeys.GOOGLE_PROFILE && (
              <div className="flex justify-between h-[36px] items-center">
                <Typography>Google Drive</Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={handleAddGoogleDrive}
                >
                  {getGoogleDriveConnections(displayConnections).length > 0 ? 'Add another' : 'Add'}
                </Typography>
              </div>
            )}

            {/* Add Gmail (always available for Google users) */}
            {profile?.provider === ConnectionKeys.GOOGLE_PROFILE && (
              <div className="flex justify-between h-[36px] items-center">
                <Typography>Gmail</Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={handleAddGoogleGmail}
                >
                  {getGoogleGmailConnections(displayConnections).length > 0 ? 'Add another' : 'Add'}
                </Typography>
              </div>
            )}

            {/* Add Google Calendar (always available for Google users) */}
            {profile?.provider === ConnectionKeys.GOOGLE_PROFILE && (
              <div className="flex justify-between h-[36px] items-center">
                <Typography>Google Calendar</Typography>
                <Typography
                  className={`cursor-pointer ${styles.link}`}
                  onClick={handleAddGoogleCalendar}
                >
                  {getGoogleCalendarConnections(displayConnections).length > 0
                    ? 'Add another'
                    : 'Add'}
                </Typography>
              </div>
            )}
          </div>
        </div>
        <hr className="border-zinc-200" />
        <div className="DocumentsContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Transcripts</Typography>
          <InputCheckbox checked={saveTranscripts} onClick={handleFlipSaveTranscript}>
            <Typography className="text-black">Save Transcripts</Typography>
          </InputCheckbox>
        </div>

        <hr className="border-zinc-200" />
        {showKeepAwakePowerControls && (
          <div className="DocumentsContainer p-6 flex flex-col gap-4">
            <Typography weight={TypographyWeight.medium}>Power</Typography>
            <InputCheckbox
              checked={keepAwakeOnLidCloseEnabled}
              onClick={handleFlipKeepAwakeOnLidClose}
            >
              <Typography className="text-black">
                {isMacPlatform
                  ? 'Keep computer awake when screen/lid closes'
                  : 'Keep computer awake while this app runs'}
              </Typography>
            </InputCheckbox>
            <Typography className="text-xs text-zinc-500 leading-5">
              {isMacPlatform
                ? 'Opt-in behavior while the app is running. Enable only for remote/off-screen workflows; this can increase battery use and heat.'
                : 'Windows keeps the system from entering idle sleep while Knapsack is running. It cannot always override lid-close power settings on every machine.'}
            </Typography>
          </div>
        )}

        <hr className="border-zinc-200" />
        <div className="DocumentsContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Meeting Chat Notice</Typography>
          <InputCheckbox checked={meetingChatEnabled} onClick={handleFlipMeetingChatEnabled}>
            <Typography className="text-black">Show chat notice when recording</Typography>
          </InputCheckbox>
          <InputCheckbox checked={meetingChatAutoSend} onClick={handleFlipMeetingChatAutoSend}>
            <Typography className="text-black">Auto-send notice to meeting chat (macOS)</Typography>
          </InputCheckbox>
        </div>

        <hr className="border-zinc-200" />
        <HeartbeatSettings />
        <hr className="border-zinc-200" />
        <MobilePairingSection />
        <hr className="border-zinc-200" />
        <UpdateSection />
        <hr className="border-zinc-200" />
        <div className="DocumentsContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Documents</Typography>
          <div className="PermissionContent flex flex-col gap-2">
            <div className="h-[36px] flex items-center">
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={handleTermsOfUseClick}
              >
                Terms of Use
              </Typography>
            </div>
            <div className="h-[36px] flex items-center">
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={handlePrivacyLinkClick}
              >
                Privacy Policy
              </Typography>
            </div>
          </div>
        </div>
        <hr className="border-zinc-200" />
        <SupportSection />
        {showKeepAwakeEnableModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-5 w-[430px] shadow-xl">
              <Typography weight={TypographyWeight.medium} className="text-lg">
                {isMacPlatform
                  ? 'Keep Mac awake when lid/screen closes?'
                  : 'Keep computer awake while Knapsack runs?'}
              </Typography>
              <p className="mt-2 text-sm text-zinc-600">
                {isMacPlatform
                  ? 'This enables a system wake assertion while Knapsack is running so your Mac stays awake with the lid closed.'
                  : 'This requests that Windows keep the system from sleeping during use while Knapsack is running.'}
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                {isMacPlatform
                  ? 'Knapsack does not uninstall or modify any installed software. Turn it on only when needed for remote recording, remote troubleshooting, or other unattended workflows. It may increase battery use and heat.'
                  : 'Knapsack does not uninstall or modify any installed software. Turn it on only when needed for remote/off-screen workflows. It may increase battery use and heat.'}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-100"
                  onClick={cancelKeepAwakeEnable}
                >
                  Not now
                </button>
                <button
                  className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                  onClick={confirmKeepAwakeEnable}
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
