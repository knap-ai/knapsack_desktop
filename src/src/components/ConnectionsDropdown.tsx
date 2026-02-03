import './ConnectionsDropdown.scss'

import React, { useEffect } from 'react'

import { TUTORIAL_LINK } from 'src/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography as MaterialTypography,
  Menu,
  MenuItem,
  MenuList,
  Paper,
} from '@mui/material'

import { Connection, ConnectionKeys, ConnectionStates } from '../api/connections'
import { Profile } from '../hooks/auth/useAuth'
import LoadingIcon from './atoms/loading-icon'
import { open } from '@tauri-apps/api/shell'

type ConnectionsDropdownProps = {
  className?: string
  profile: Profile
  onSignoutClick: () => void
  onGoogleItemClick: (connectionKey: ConnectionKeys[]) => void
  onSettingsClick: () => void
  connections: Record<string, Connection>
  connectionsDropdownOpened: boolean
  setConnectionsDropdownOpened: (connectionsDropdownOpened: boolean) => void
}

const ConnectionItem = ({
  label,
  icon,
  connection,
  onConnectClick,
}: {
  label: string
  icon: string
  connection?: Connection
  onConnectClick: () => void
}) => {
  return (
    <MenuItem onClick={onConnectClick}>
      <ListItemIcon>
        {connection?.state === ConnectionStates.SYNCING ? (
          <LoadingIcon />
        ) : (
          <img className="w-5 mx-1" src={icon} />
        )}
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
      {!connection?.state && (
        <Button variant="outlined" size="small">
          Connect
        </Button>
      )}
      {connection?.state === ConnectionStates.SYNCING && (
        <MaterialTypography variant="body2" color="text.secondary">
          {connection?.lastSynced && connection?.state !== ConnectionStates.SYNCING
            ? `${connection?.lastSynced}`
            : 'Syncing'}
        </MaterialTypography>
      )}
      {connection?.state === ConnectionStates.UP_TO_DATE && (
        <MaterialTypography variant="body2" color="text.secondary">
          {connection?.lastSynced ? `${connection?.lastSynced}` : 'Up to date'}
        </MaterialTypography>
      )}
    </MenuItem>
  )
}

const Item = ({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) => {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon>
        <img className="w-5 mx-1" src={icon} />
      </ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  )
}

const connectionIcon = {
  [ConnectionKeys.GOOGLE_GMAIL]: '/assets/images/dataSources/gmail.svg',
  [ConnectionKeys.GOOGLE_CALENDAR]: '/assets/images/dataSources/gcal.svg',
  [ConnectionKeys.GOOGLE_DRIVE]: '/assets/images/dataSources/gdrive.svg',
  [ConnectionKeys.LOCAL_FILES]: '/assets/images/dataSources/local.svg',
  [ConnectionKeys.GOOGLE_PROFILE]: '',
  [ConnectionKeys.MICROSOFT_PROFILE]: '',
  [ConnectionKeys.MICROSOFT_CALENDAR]: '/assets/images/dataSources/ms_calendar.svg',
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: '/assets/images/dataSources/ms_onedrive.svg',
  [ConnectionKeys.MICROSOFT_OUTLOOK]: '/assets/images/dataSources/ms_outlook.svg',
}
const connectionLabel = {
  [ConnectionKeys.GOOGLE_GMAIL]: 'Gmail',
  [ConnectionKeys.GOOGLE_CALENDAR]: 'Google Calendar',
  [ConnectionKeys.GOOGLE_DRIVE]: 'Google Drive',
  [ConnectionKeys.LOCAL_FILES]: 'Local Files',
  [ConnectionKeys.GOOGLE_PROFILE]: '',
  [ConnectionKeys.MICROSOFT_PROFILE]: '',
  [ConnectionKeys.MICROSOFT_CALENDAR]: 'Outlook Calendar',
  [ConnectionKeys.MICROSOFT_ONEDRIVE]: 'OneDrive',
  [ConnectionKeys.MICROSOFT_OUTLOOK]: 'Outlook',
}

export const ConnectionsDropdown: React.FC<ConnectionsDropdownProps> = ({
  // profile,
  className,
  onSignoutClick,
  connections,
  onGoogleItemClick,
  onSettingsClick,
  connectionsDropdownOpened,
  setConnectionsDropdownOpened,
}) => {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(null)
  const anchorElementRef = React.useRef(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorElement(event.currentTarget)
    setConnectionsDropdownOpened(true)
  }
  const handleClose = () => {
    setAnchorElement(null)
    setConnectionsDropdownOpened(false)
  }

  useEffect(() => {
    if (connectionsDropdownOpened) {
      setAnchorElement(anchorElementRef.current)
    } else {
      setAnchorElement(null)
    }
  }, [connectionsDropdownOpened])

  return (
    <>
      <div ref={anchorElementRef} className={`flex items-center cursor-pointer ${className}`} onClick={handleClick}>
        <img src="assets/images/icons/settings-icon.svg" className="h-6 w-6" />
      </div>
      <Menu
        id="basic-menu"
        anchorEl={anchorElement}
        open={!!anchorElement}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Paper sx={{ width: 420, maxWidth: '100%' }} elevation={0}>
          <MenuList dense>
            {Object.keys(connections)
              .filter(
                connectionkey =>
                  connectionkey != ConnectionKeys.GOOGLE_PROFILE &&
                  connectionkey != ConnectionKeys.MICROSOFT_PROFILE &&
                  Object.values(ConnectionKeys).includes(connectionkey as ConnectionKeys),
              )
              .map(connectionKey => (
                <ConnectionItem
                  key={connectionKey}
                  label={connectionLabel[connectionKey as ConnectionKeys]}
                  icon={connectionIcon[connectionKey as ConnectionKeys]}
                  connection={connections[connectionKey]}
                  onConnectClick={() => onGoogleItemClick([connectionKey as ConnectionKeys])}
                />
              ))}
            <Divider />
            <Item
              label="Settings"
              icon="/assets/images/settings-icon.svg"
              onClick={() => {
                onSettingsClick()
                handleClose()
              }}
            />
            <Divider />
            <Item
              label="Tutorial Video"
              icon="/assets/images/tutorial-video-icon.svg"
              onClick={() => {
                open(TUTORIAL_LINK)
                handleClose()
              }}
            />

            <Divider />

            <MenuItem onClick={onSignoutClick}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Signout</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Menu>
    </>
  )
}
