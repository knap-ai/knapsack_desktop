import { useCallback } from "react";
import { 
  Connection, 
  ConnectionKeys, 
  ConnectionStates, 
  isConnectionReadyToSync, 
  microsoftConnections, 
  syncMicrosoftCalendarAPI,
  syncMicrosoftOutlookAPI
} from "src/api/connections";

export const useMicrosoftConnections = (
  setConnectionState?: (scope: string, connectionState: ConnectionStates) => void,
  removeConnection?: (scope: ConnectionKeys) => void,
) => {
  const syncOneDrive = useCallback(
    async (emailAddress: string) => {
      console.log('Syncing OneDrive with', emailAddress)
      setConnectionState?.(ConnectionKeys.MICROSOFT_ONEDRIVE, ConnectionStates.SYNCING)
      try {
        // await syncMicrosoftOneDriveAPI(emailAddress) TODO: Remove the comment when the API is ready
        console.log('Google Drive sync not implemented yet')
      } catch (error) {
        console.error(error)
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.MICROSOFT_ONEDRIVE)
        }
        setConnectionState?.(ConnectionKeys.MICROSOFT_ONEDRIVE, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncOutlook = useCallback(
    async (emailAddress: string) => {
      console.log('Syncing OneDrive with', emailAddress)
      setConnectionState?.(ConnectionKeys.MICROSOFT_OUTLOOK, ConnectionStates.SYNCING)
      try {
        await syncMicrosoftOutlookAPI(emailAddress)
      } catch (error) {
        console.error(error);
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.MICROSOFT_OUTLOOK)
        }
        setConnectionState?.(ConnectionKeys.MICROSOFT_OUTLOOK, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncMicrosoftCalendar = useCallback(
    async (emailAddress: string) => {
      console.log('Syncing OneDrive with', emailAddress)
      setConnectionState?.(ConnectionKeys.MICROSOFT_CALENDAR, ConnectionStates.SYNCING)
      try {
        await syncMicrosoftCalendarAPI(emailAddress);
      } catch (error) {
        console.error(error);
        let err = error as Error
        if (err.message.includes('400')) {
          removeConnection?.(ConnectionKeys.MICROSOFT_CALENDAR)
        }
        setConnectionState?.(ConnectionKeys.MICROSOFT_CALENDAR, ConnectionStates.FAILED)
      }
    },
    [setConnectionState],
  )

  const syncByConnectionKey = useCallback(
    async (email: string, connectionKey: ConnectionKeys) => {
      if (connectionKey === ConnectionKeys.MICROSOFT_ONEDRIVE) {
        await syncOneDrive(email)
        return
      }
      if (connectionKey === ConnectionKeys.MICROSOFT_OUTLOOK) {
        await syncOutlook(email)
        return
      }
      if (connectionKey === ConnectionKeys.MICROSOFT_CALENDAR) {
        await syncMicrosoftCalendar(email)
        return
      }
    },
    [syncMicrosoftCalendar, syncOneDrive, syncOutlook],
  )

  const syncConnections = useCallback(
    async (email: string, connections: Record<string, Connection>) => {
      const promises = []
      for (const connectionKey of Object.keys(microsoftConnections)) {
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
