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
    extra_providers?: Array<{ id: string; env_var: string; has_key: boolean }>
  } | null>(null)
  const settingsContainerRef = useRef<HTMLDivElement>(null)
  const channels = useChannelStatus(isOpen)
  const [channelBusy, setChannelBusy] = useState<string | null>(null)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [showTelegramInput, setShowTelegramInput] = useState(false)

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
          extra_providers: data.extra_providers,
        })
      })
      .catch(() => {})
  }, [isOpen])

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

  // const handleLocalFilesAddClick = useCallback(async () => {
  //   await getFilesPermissions()
  //   if (!email) {
  //     logError(new BaseException('The user email is missing'), {
  //       additionalInfo: 'Attempted to add local files without a valid user email Test 2',
  //     })
  //     return
  //   }
  //   await fetchConnections(email)
  // }, [email, fetchConnections])
  

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
        <div className="p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>AI Provider</Typography>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between h-[36px] items-center">
              <div className="flex items-center gap-2">
                <Typography>OpenAI</Typography>
                {providerStatus?.has_openai_key && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${providerStatus.active_provider === 'openai' ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {providerStatus.active_provider === 'openai' ? 'Active' : 'Connected'}
                  </span>
                )}
              </div>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => { handleClose(); onProviderSignInClick?.('openai') }}
              >
                {providerStatus?.has_openai_key ? 'Change' : 'Sign in'}
              </Typography>
            </div>
            <div className="flex justify-between h-[36px] items-center">
              <div className="flex items-center gap-2">
                <Typography>Anthropic</Typography>
                {providerStatus?.has_anthropic_key && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${providerStatus.active_provider === 'anthropic' ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {providerStatus.active_provider === 'anthropic' ? 'Active' : 'Connected'}
                  </span>
                )}
              </div>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => { handleClose(); onProviderSignInClick?.('anthropic') }}
              >
                {providerStatus?.has_anthropic_key ? 'Change' : 'Sign in'}
              </Typography>
            </div>
            {/* Extra providers (MiniMax, ZAI/GLM, HuggingFace) */}
            {[
              { id: 'minimax', envVar: 'MINIMAX_API_KEY', name: 'MiniMax' },
              { id: 'zai', envVar: 'ZAI_API_KEY', name: 'ZAI (GLM)' },
              { id: 'huggingface', envVar: 'HF_TOKEN', name: 'Hugging Face' },
            ].map(ep => {
              const status = providerStatus?.extra_providers?.find(p => p.env_var === ep.envVar)
              return (
                <div key={ep.id} className="flex justify-between h-[36px] items-center">
                  <div className="flex items-center gap-2">
                    <Typography>{ep.name}</Typography>
                    {status?.has_key && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                        Connected
                      </span>
                    )}
                  </div>
                  <Typography
                    className={`cursor-pointer ${styles.link}`}
                    onClick={() => { handleClose(); onProviderSignInClick?.() }}
                  >
                    {status?.has_key ? 'Change' : 'Add key'}
                  </Typography>
                </div>
              )
            })}
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
            {/* <div className="flex justify-between h-[36px] items-center">
              <Typography>Gmail</Typography>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => onConnectGoogleAccountClick(ConnectionKeys.GOOGLE_GMAIL)}
              >
                Add
              </Typography>
            </div>
            <div className="flex justify-between h-[36px] items-center">
              <Typography>Google Calendar</Typography>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => onConnectGoogleAccountClick(ConnectionKeys.GOOGLE_CALENDAR)}
              >
                Add
              </Typography>
            </div>
            <div className="flex justify-between h-[36px] items-center">
              <Typography>Google Drive</Typography>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={() => onConnectGoogleAccountClick(ConnectionKeys.GOOGLE_DRIVE)}
              >
                Add
              </Typography>
            </div> */}
            {/* <div className="flex justify-between h-[36px] items-center">
              <Typography>Local files</Typography>
              <Typography
                className={`cursor-pointer ${styles.link}`}
                onClick={handleLocalFilesAddClick}
              >
                Add
              </Typography>
            </div> */}
            {/* <div className="flex items-center h-[36px]">
            <hr className="w-full" color="#D6D3D1" />
          </div>
          <div className="flex items-center h-[36px]">
            <Typography className={`cursor-pointer ${styles.link}`}>
              Delete and remove my data
            </Typography>
          </div> */}
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

        <hr className="border-zinc-200" />
        <div className="p-6">
          <Typography className="text-ks-warm-grey-500 text-xs">
            AI assistant powered by{' '}
            <a
              href="https://openclawskills.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              OpenClaw
            </a>
          </Typography>
        </div>
      </div>
    </Dialog>
  )
}
