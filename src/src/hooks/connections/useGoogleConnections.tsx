import { useCallback } from 'react'

import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  googleConnections,
  isConnectionReadyToSync,
  syncGoogleCalendarAPI,
  syncGoogleDriveAPI,
  syncGoogleGmailAPI,
} from 'src/api/connections'

export const useGoogleConnections = (
  setConnectionState?: (scope: string, connectionState: ConnectionStates) => void,
  removeConnection?: (scope: ConnectionKeys) => void,
) => {
  const syncGoogleDrive = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_DRIVE, ConnectionStates.SYNCING)
      try {
        await syncGoogleDriveAPI(emailAddress)
      } catch (error) {
        console.error(error)
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.GOOGLE_DRIVE)
        }
        setConnectionState?.(ConnectionKeys.GOOGLE_DRIVE, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncGoogleGmail = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_GMAIL, ConnectionStates.SYNCING)
      try {
        await syncGoogleGmailAPI(emailAddress)
      } catch (error) {
        console.error(error)
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.GOOGLE_GMAIL)
        }
        setConnectionState?.(ConnectionKeys.GOOGLE_GMAIL, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncGoogleCalendar = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_CALENDAR, ConnectionStates.SYNCING)
      try {
        await syncGoogleCalendarAPI(emailAddress)
      } catch (error) {
        console.error(error)
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.GOOGLE_CALENDAR)
        }
        setConnectionState?.(ConnectionKeys.GOOGLE_CALENDAR, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncByConnectionKey = useCallback(
    async (email: string, connectionKey: ConnectionKeys) => {
      if (connectionKey === ConnectionKeys.GOOGLE_DRIVE) {
        await syncGoogleDrive(email)
        return
      }
      if (connectionKey === ConnectionKeys.GOOGLE_GMAIL) {
        await syncGoogleGmail(email)
        return
      }
      if (connectionKey === ConnectionKeys.GOOGLE_CALENDAR) {
        await syncGoogleCalendar(email)
        return
      }
    },
    [syncGoogleCalendar, syncGoogleDrive, syncGoogleGmail],
  )

  const syncConnections = useCallback(
    async (email: string, connections: Record<string, Connection>) => {
      const promises = []
      for (const connectionKey of Object.keys(googleConnections)) {
        if (isConnectionReadyToSync(connections[connectionKey])) {
          promises.push(syncByConnectionKey(email, connectionKey as ConnectionKeys))
        }
      }
      await Promise.all(promises)
    },
    [syncByConnectionKey],
  )

  return { syncByConnectionKey, syncConnections }
}
