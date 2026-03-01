import { useCallback, useEffect, useState, useRef } from 'react'

import { Connection, ConnectionKeys, connectionsMap } from 'src/api/connections'
import { useChannelStatus } from 'src/hooks/channels/useChannelStatus'
import { logError } from 'src/utils/errorHandling'
import { BaseException } from 'src/utils/exceptions/base'
import { setIsFilesEnabled } from 'src/utils/permissions/files'
import {
  arePushNotificationsOSEnabledAndWantedByUser,
  requestNotificationOSPermissions,
  setUserWantsNotifications,
} from 'src/utils/permissions/notification'
import {
  getNotificationLeadTimeMin,
  setNotificationLeadTimeMin,
  setSaveTranscriptStore,
  shouldSaveTranscript,
} from 'src/utils/settings'

import { InputCheckbox } from 'src/components/atoms/input-checkbox'
import {
  Typography,
  TypographyWeight,
} from 'src/components/atoms/typography'
import { Dialog } from 'src/components/molecules/Dialog'
import HeartbeatSettings from 'src/components/organisms/HeartbeatSettings'

import styles from './styles.module.scss'
import { Profile } from 'src/hooks/auth/useAuth'
import InputSelect from 'src/components/atoms/input-select'

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
  onProviderSignInClick?: (provider?: 'openai' | 'anthropic') => void
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

const NOTIFICATION_LEAD_TIME = [{label: '1 minute before', value: '1'}, {label: '2 minutes before', value: '2'}, {label: '3 minutes before', value: '3'}]

// ── Accordion primitive ──────────────────────────────────────────────────────

type ProviderAccordionProps = {
  title: string
  badge?: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const ProviderAccordion = ({ title, badge, expanded, onToggle, children }: ProviderAccordionProps) => (
  <div className="border border-zinc-200 rounded-md overflow-hidden">
    <button
      type="button"
      className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <Typography weight={TypographyWeight.medium} className="text-sm">{title}</Typography>
        {badge}
      </div>
      <ChevronIcon expanded={expanded} />
    </button>
    {expanded && (
      <div className="px-3 py-2.5 flex flex-col gap-2 border-t border-zinc-100">
        {children}
      </div>
    )}
  </div>
)

// ── Ollama types ─────────────────────────────────────────────────────────────

type OllamaModel = {
  name: string
  size?: number
  parameter_size?: string
  family?: string
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
  const [sendPushNotificationsIsChecked, setSendPushNotificationsIsChecked] = useState<boolean>(false)
  const [saveTranscripts, setSaveTranscripts] = useState<boolean>(true)
  const [connectionsKey, setConnectionsKey] = useState<ConnectionKeys[]>([])
  const [showNotificationLeadTime, setShowNotificationLeadTime] = useState<number>(1)
  const [providerStatus, setProviderStatus] = useState<{
    active_provider?: string
    has_openai_key?: boolean
    has_anthropic_key?: boolean
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

  // Accordion state — which provider section is expanded
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)

  // Ollama state
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null)
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [ollamaBusy, setOllamaBusy] = useState(false)
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('')

  useEffect(() => {
    if(profile && profile.provider){
      if(profile.provider === ConnectionKeys.MICROSOFT_PROFILE){
        setConnectionsKey([ ...PERMISSION_LIST_MICROSOFT_CONNECTIONS ])
      } else {
        setConnectionsKey([ ...PERMISSION_LIST_GOOGLE_CONNECTIONS ])
      }
    }
  }, [profile]);

  useEffect(() => {
    getNotificationLeadTimeMin().then(value => setShowNotificationLeadTime(value))
  }, [])

  useEffect(() => {
    if (!isOpen) return
    fetch('http://localhost:8897/api/clawd/service/api-key-status')
      .then(r => r.json())
      .then(data => {
        setProviderStatus({
          active_provider: data.active_provider,
          has_openai_key: data.has_openai_key,
          has_anthropic_key: data.has_anthropic_key,
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

  // Check Ollama status + fetch models when the Ollama accordion is expanded
  useEffect(() => {
    if (expandedProvider !== 'ollama') return
    setOllamaRunning(null)
    fetch('http://localhost:8897/api/knapsack/ollama/status')
      .then(r => r.json())
      .then(data => setOllamaRunning(data.running))
      .catch(() => setOllamaRunning(false))

    fetch('http://localhost:8897/api/knapsack/ollama/models')
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
  }, [])

  const handleNotificationEnabledChange = useCallback(async () => {
    let userWantsNotfications = !sendPushNotificationsIsChecked
    console.log("USER WANTS NOTFICATIONS: ", userWantsNotfications)
    if (userWantsNotfications) {
      const permission = await requestNotificationOSPermissions()
      console.log("PERMISSIONS: ", permission)
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
      if (connectionsKey.includes(connection.key as ConnectionKeys)) {
        if (!connection.id) {
          logError(new BaseException('This connection is missing the ID property'), {
            additionalInfo: connection.key,
          })
          return
        }
        await deleteConnection(connection.id)
      }
      if (connection.key === ConnectionKeys.LOCAL_FILES) {
        setIsFilesEnabled(false)
      }
      fetchConnections(email)
    },
    [deleteConnection, email, fetchConnections],
  )

  const handleShowNotificationLeadTimeChange = (min: string) => {
    const minNumber = parseInt(min)
    setNotificationLeadTimeMin(minNumber);
    setShowNotificationLeadTime(minNumber);
  }

  const handleFlipSaveTranscript = () => {
    setSaveTranscripts(prevState => !prevState)
    setSaveTranscriptStore(!saveTranscripts)
  }

  // ── Ollama enable/disable ────────────────────────────────────────────────

  const handleOllamaToggle = async (enable: boolean) => {
    setOllamaBusy(true)
    try {
      const resp = await fetch('http://localhost:8897/api/knapsack/ollama/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: enable,
          model: selectedOllamaModel || null,
        }),
      })
      const data = await resp.json()
      if (data.success) {
        setProviderStatus(prev => prev ? {
          ...prev,
          ollama_enabled: enable,
          active_provider: enable ? 'ollama' : prev.active_provider === 'ollama' ? undefined : prev.active_provider,
        } : prev)
      }
    } catch {
      // silently fail
    } finally {
      setOllamaBusy(false)
    }
  }

  const handleOllamaModelChange = async (model: string) => {
    setSelectedOllamaModel(model)
    if (!providerStatus?.ollama_enabled) return
    // Persist model selection
    try {
      await fetch('http://localhost:8897/api/knapsack/ollama/configure', {
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

  // ── Accordion toggle ─────────────────────────────────────────────────────

  const toggleProvider = (id: string) => {
    setExpandedProvider(prev => prev === id ? null : id)
  }

  // ── Status badge helper ──────────────────────────────────────────────────

  const statusBadge = (isActive: boolean, isConnected: boolean) => {
    if (!isConnected) return null
    return (
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isActive ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
        {isActive ? 'Active' : 'Connected'}
      </span>
    )
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
              <Typography > Show a notification </Typography>
              <InputSelect
                options={NOTIFICATION_LEAD_TIME}
                value={showNotificationLeadTime.toString()}
                onChange={handleShowNotificationLeadTimeChange}
              />
            </div>
          </div>
        </div>
        <hr className="border-zinc-200" />

        {/* ── AI Provider (accordion) ─────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-3">
          <Typography weight={TypographyWeight.medium}>AI Provider</Typography>

          {/* Cloud providers */}
          <ProviderAccordion
            title="OpenAI"
            badge={statusBadge(providerStatus?.active_provider === 'openai', !!providerStatus?.has_openai_key)}
            expanded={expandedProvider === 'openai'}
            onToggle={() => toggleProvider('openai')}
          >
            <div className="flex justify-between items-center">
              <Typography className="text-sm text-gray-600">
                {providerStatus?.has_openai_key ? 'API key configured' : 'No API key set'}
              </Typography>
              <Typography
                className={`cursor-pointer text-sm ${styles.link}`}
                onClick={() => { handleClose(); onProviderSignInClick?.('openai') }}
              >
                {providerStatus?.has_openai_key ? 'Change' : 'Sign in'}
              </Typography>
            </div>
          </ProviderAccordion>

          <ProviderAccordion
            title="Anthropic"
            badge={statusBadge(providerStatus?.active_provider === 'anthropic', !!providerStatus?.has_anthropic_key)}
            expanded={expandedProvider === 'anthropic'}
            onToggle={() => toggleProvider('anthropic')}
          >
            <div className="flex justify-between items-center">
              <Typography className="text-sm text-gray-600">
                {providerStatus?.has_anthropic_key ? 'API key configured' : 'No API key set'}
              </Typography>
              <Typography
                className={`cursor-pointer text-sm ${styles.link}`}
                onClick={() => { handleClose(); onProviderSignInClick?.('anthropic') }}
              >
                {providerStatus?.has_anthropic_key ? 'Change' : 'Sign in'}
              </Typography>
            </div>
          </ProviderAccordion>

          {/* Extra providers */}
          {[
            { id: 'minimax', envVar: 'MINIMAX_API_KEY', name: 'MiniMax' },
            { id: 'zai', envVar: 'ZAI_API_KEY', name: 'ZAI (GLM)' },
            { id: 'huggingface', envVar: 'HF_TOKEN', name: 'Hugging Face' },
          ].map(ep => {
            const status = providerStatus?.extra_providers?.find(p => p.env_var === ep.envVar)
            return (
              <ProviderAccordion
                key={ep.id}
                title={ep.name}
                badge={status?.has_key ? (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                    Connected
                  </span>
                ) : undefined}
                expanded={expandedProvider === ep.id}
                onToggle={() => toggleProvider(ep.id)}
              >
                <div className="flex justify-between items-center">
                  <Typography className="text-sm text-gray-600">
                    {status?.has_key ? 'API key configured' : 'No API key set'}
                  </Typography>
                  <Typography
                    className={`cursor-pointer text-sm ${styles.link}`}
                    onClick={() => { handleClose(); onProviderSignInClick?.() }}
                  >
                    {status?.has_key ? 'Change' : 'Add key'}
                  </Typography>
                </div>
              </ProviderAccordion>
            )
          })}

          {/* Ollama (local LLM) */}
          <ProviderAccordion
            title="Ollama (Local)"
            badge={
              providerStatus?.ollama_enabled ? (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${providerStatus.active_provider === 'ollama' ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {providerStatus.active_provider === 'ollama' ? 'Active' : 'Enabled'}
                </span>
              ) : undefined
            }
            expanded={expandedProvider === 'ollama'}
            onToggle={() => toggleProvider('ollama')}
          >
            {/* Connection status */}
            <div className="flex items-center gap-2 mb-1">
              {ollamaRunning === null ? (
                <span className="text-xs text-gray-400 animate-pulse">Checking Ollama...</span>
              ) : ollamaRunning ? (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Ollama running
                </span>
              ) : (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Ollama not detected
                </span>
              )}
            </div>

            {!ollamaRunning && ollamaRunning !== null && (
              <Typography className="text-xs text-gray-500">
                Install Ollama from{' '}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  ollama.com
                </a>
                {' '}and start it to use local models.
              </Typography>
            )}

            {/* Model picker */}
            {ollamaRunning && ollamaModels.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Typography className="text-xs text-gray-500">Model</Typography>
                <InputSelect
                  options={ollamaModels.map(m => ({
                    label: `${m.name}${m.parameter_size ? ` (${m.parameter_size})` : ''}`,
                    value: m.name,
                  }))}
                  value={selectedOllamaModel || ollamaModels[0]?.name || ''}
                  onChange={handleOllamaModelChange}
                />
              </div>
            )}

            {ollamaRunning && ollamaModels.length === 0 && (
              <Typography className="text-xs text-gray-500">
                No models found. Run <code className="bg-zinc-100 px-1 rounded text-[11px]">ollama pull llama3.1</code> to download a model.
              </Typography>
            )}

            {/* Enable / Disable toggle */}
            {ollamaRunning && (
              <div className="flex justify-between items-center pt-1">
                <Typography className="text-sm">
                  {providerStatus?.ollama_enabled ? 'Ollama is enabled' : 'Use Ollama for AI'}
                </Typography>
                <button
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    providerStatus?.ollama_enabled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  } disabled:opacity-50`}
                  disabled={ollamaBusy}
                  onClick={() => handleOllamaToggle(!providerStatus?.ollama_enabled)}
                >
                  {ollamaBusy ? 'Saving...' : providerStatus?.ollama_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            )}

            {providerStatus?.ollama_enabled && (
              <Typography className="text-[11px] text-gray-400">
                Free local execution — no API costs
              </Typography>
            )}
          </ProviderAccordion>
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
                <span className="text-[10px] text-red-500 flex items-center gap-1 cursor-pointer" onClick={() => channels.checkHealth()}>
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
                {channels.whatsapp && channels.whatsapp.enabled && !channels.whatsapp.linked && !channels.whatsappLinking && !channels.whatsappQrUrl && (
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
                    if (channels.whatsapp?.linked || (channels.whatsapp?.enabled && !channels.whatsappLinking && !channels.whatsappQrUrl)) {
                      await channels.disconnectWhatsApp()
                    } else {
                      await channels.connectWhatsApp()
                    }
                  } finally {
                    setChannelBusy(null)
                  }
                }}
              >
                {channelBusy === 'whatsapp'
                  ? 'Working...'
                  : (channels.whatsapp?.linked || (channels.whatsapp?.enabled && !channels.whatsappLinking && !channels.whatsappQrUrl))
                    ? 'Disconnect'
                    : 'Connect'}
              </Typography>
            </div>
            {channels.channelErrors?.whatsapp && (
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">{channels.channelErrors.whatsapp}</Typography>
            )}
            {/* WhatsApp QR code */}
            {channels.whatsappQrUrl && (
              <div className="flex flex-col items-center gap-2 py-2">
                <img src={channels.whatsappQrUrl} alt="WhatsApp QR" className="w-[180px] h-[180px] rounded" />
                <Typography className="text-xs text-gray-500">Scan with WhatsApp on your phone</Typography>
                <Typography className="text-[10px] text-gray-400 animate-pulse">Waiting for scan...</Typography>
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
                {channels.imessage && channels.imessage.enabled && !channels.imessage.configured && (
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
                    } else {
                      await channels.connectIMessage()
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
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">{channels.channelErrors.imessage}</Typography>
            )}

            {/* Telegram */}
            <div className="flex justify-between h-[36px] items-center">
              <div className="flex items-center gap-2">
                <Typography>Telegram</Typography>
                {channels.telegram?.configured && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    Connected
                  </span>
                )}
                {channels.telegram && channels.telegram.enabled && !channels.telegram.configured && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                    Not configured
                  </span>
                )}
              </div>
              <Typography
                className={`cursor-pointer ${styles.link} ${channelBusy === 'telegram' ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={async () => {
                  if (channelBusy) return
                  if (channels.telegram?.configured) {
                    setChannelBusy('telegram')
                    try {
                      await channels.disconnectTelegram()
                    } finally {
                      setChannelBusy(null)
                    }
                  } else {
                    setShowTelegramInput(prev => !prev)
                  }
                }}
              >
                {channelBusy === 'telegram'
                  ? 'Working...'
                  : channels.telegram?.configured
                    ? 'Disconnect'
                    : showTelegramInput
                      ? 'Cancel'
                      : 'Connect'}
              </Typography>
            </div>
            {channels.channelErrors?.telegram && (
              <Typography className="text-[11px] text-red-500 -mt-1 ml-0.5">{channels.channelErrors.telegram}</Typography>
            )}
            {/* Telegram bot token input */}
            {showTelegramInput && !channels.telegram?.configured && (
              <div className="flex flex-col gap-2 py-1 pl-0.5">
                <Typography className="text-xs text-gray-500">
                  Enter your Telegram bot token from @BotFather:
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
                        setShowTelegramInput(false)
                        setTelegramBotToken('')
                      } catch {
                        // error is displayed via channelErrors
                      } finally {
                        setChannelBusy(null)
                      }
                    }}
                  >
                    {channelBusy === 'telegram' ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* More channels hint */}
          <div className="flex justify-between h-[36px] items-center">
            <div className="flex items-center gap-2">
              <Typography className="text-gray-500">More (Slack, Discord, IRC, Signal, ...)</Typography>
            </div>
            <Typography className={`text-xs text-gray-400`}>
              Use Channels panel in chat
            </Typography>
          </div>

          {channels.error && (
            <Typography className="text-xs text-red-500">{channels.error}</Typography>
          )}
        </div>
        <hr className="border-zinc-200" />
        <div className="PermissionContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Permissions</Typography>

          <div className="PermissionContent flex flex-col gap-2">
            {Object.values(connections)
              .filter(item => connectionsKey.includes(item.key as ConnectionKeys))
              .map(item => (
                <div
                  className="flex justify-between h-[36px] items-center"
                  key={`${item.key}-${item.id}`}
                >
                  <Typography>
                    {connectionsMap[item.key].label}
                    {connectionsKey.includes(item.key as ConnectionKeys)
                      ? `, ${email}`
                      : ''}
                  </Typography>
                  <Typography
                    className={`cursor-pointer ${styles.link}`}
                    onClick={() => handleDeleteConnection(item)}
                  >
                    Remove
                  </Typography>
                </div>
              ))}
          </div>
        </div>
        <div className="AddAccountContainer p-6 pt-4 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Add an account</Typography>
          <div className="PermissionContent flex flex-col gap-2">
            {
              connectionsKey
              .filter( ( key: ConnectionKeys ) =>
                !Object.keys(connections).includes(key as ConnectionKeys)
                && Object.keys(PERMISSION_NAME_LIST).includes(key as ConnectionKeys)
              )
              .map(( connectionKey: ConnectionKeys ) =>{
                  return (
                    <div key={connectionKey} className="flex justify-between h-[36px] items-center">
                    <Typography>{ Object.keys(PERMISSION_NAME_LIST).includes(connectionKey) ? PERMISSION_NAME_LIST[connectionKey] : ""}</Typography>
                    <Typography
                      className={`cursor-pointer ${styles.link}`}
                      onClick={() => onConnectAccountClick([connectionKey])}
                    >
                      Add
                    </Typography>
                  </div>
                  )
              })
            }
          </div>
        </div>
        <hr className="border-zinc-200" />
        <div className="DocumentsContainer p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Transcripts</Typography>
          <InputCheckbox
            checked={saveTranscripts}
            onClick={handleFlipSaveTranscript}
          >
            <Typography className="text-black">Save Transcripts</Typography>
          </InputCheckbox>
        </div>

        <hr className="border-zinc-200" />
        <HeartbeatSettings />
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
      </div>
    </Dialog>
  )
}
