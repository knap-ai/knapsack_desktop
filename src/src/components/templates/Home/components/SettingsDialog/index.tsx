import { useCallback, useEffect, useState, useRef } from 'react'

import { Connection, ConnectionKeys, connectionsMap } from 'src/api/connections'
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

import styles from './styles.module.scss'
import { Profile } from 'src/hooks/auth/useAuth'
import InputSelect from 'src/components/atoms/input-select'
import { TokenCostDashboard } from 'src/components/organisms/TokenCostDashboard'

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
  profile
}: SettingsDialogProps) => {
  const [sendPushNotificationsIsChecked, setSendPushNotificationsIsChecked] = useState<boolean>(false)
  const [saveTranscripts, setSaveTranscripts] = useState<boolean>(true)
  const [connectionsKey, setConnectionsKey] = useState<ConnectionKeys[]>([])
  const [showNotificationLeadTime, setShowNotificationLeadTime] = useState<number>(1)
  const settingsContainerRef = useRef<HTMLDivElement>(null)

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
        <div className="p-6 flex flex-col gap-4">
          <Typography weight={TypographyWeight.medium}>Token Costs</Typography>
          <TokenCostDashboard />
        </div>

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
