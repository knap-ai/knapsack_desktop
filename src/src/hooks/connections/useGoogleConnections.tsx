import { useCallback, useRef } from 'react'

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

// Track auth failures across syncs so we only trigger reconnect after
// multiple consecutive 400 errors, not a single transient one.
const AUTH_FAILURE_THRESHOLD = 2

export const useGoogleConnections = (
  setConnectionState?: (scope: string, connectionState: ConnectionStates) => void,
  removeConnection?: (scope: ConnectionKeys) => void,
) => {
  const authFailureCounts = useRef<Record<string, number>>({})

  const handleSyncError = useCallback(
    (error: unknown, connectionKey: ConnectionKeys) => {
      console.error(error)
      const err = error as Error
      if (err.message.includes('400')) {
        const count = (authFailureCounts.current[connectionKey] || 0) + 1
        authFailureCounts.current[connectionKey] = count

        if (count >= AUTH_FAILURE_THRESHOLD) {
          // Only trigger reconnect after repeated auth failures
          removeConnection?.(connectionKey)
        } else {
          // First failure: mark as failed but don't trigger reconnect dialog
          setConnectionState?.(connectionKey, ConnectionStates.FAILED)
        }
        return
      }
      setConnectionState?.(connectionKey, ConnectionStates.FAILED)
    },
    [setConnectionState, removeConnection],
  )

  const resetAuthFailure = useCallback((connectionKey: ConnectionKeys) => {
    authFailureCounts.current[connectionKey] = 0
  }, [])

  const syncGoogleDrive = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_DRIVE, ConnectionStates.SYNCING)
      try {
        await syncGoogleDriveAPI(emailAddress)
        resetAuthFailure(ConnectionKeys.GOOGLE_DRIVE)
      } catch (error) {
        handleSyncError(error, ConnectionKeys.GOOGLE_DRIVE)
      }
    },
    [setConnectionState, handleSyncError, resetAuthFailure],
  )

  const syncGoogleGmail = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_GMAIL, ConnectionStates.SYNCING)
      try {
        await syncGoogleGmailAPI(emailAddress)
        resetAuthFailure(ConnectionKeys.GOOGLE_GMAIL)
      } catch (error) {
        handleSyncError(error, ConnectionKeys.GOOGLE_GMAIL)
      }
    },
    [setConnectionState, handleSyncError, resetAuthFailure],
  )

  const syncGoogleCalendar = useCallback(
    async (emailAddress: string) => {
      setConnectionState?.(ConnectionKeys.GOOGLE_CALENDAR, ConnectionStates.SYNCING)
      try {
        await syncGoogleCalendarAPI(emailAddress)
        resetAuthFailure(ConnectionKeys.GOOGLE_CALENDAR)
      } catch (error) {
        handleSyncError(error, ConnectionKeys.GOOGLE_CALENDAR)
      }
    },
    [setConnectionState, handleSyncError, resetAuthFailure],
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
