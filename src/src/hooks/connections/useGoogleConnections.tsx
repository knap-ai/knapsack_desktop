import { useCallback, useRef } from 'react'

import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  calendarConnectionKey,
  getGoogleCalendarConnections,
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
    (error: unknown, connectionKey: string) => {
      console.error(error)
      const err = error as Error
      if (err.message.includes('400')) {
        const count = (authFailureCounts.current[connectionKey] || 0) + 1
        authFailureCounts.current[connectionKey] = count

        if (count >= AUTH_FAILURE_THRESHOLD) {
          removeConnection?.(connectionKey as ConnectionKeys)
        } else {
          setConnectionState?.(connectionKey, ConnectionStates.FAILED)
        }
        return
      }
      setConnectionState?.(connectionKey, ConnectionStates.FAILED)
    },
    [setConnectionState, removeConnection],
  )

  const resetAuthFailure = useCallback((connectionKey: string) => {
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

  /** Sync a single Google Calendar account identified by calendarAccountEmail. */
  const syncGoogleCalendar = useCallback(
    async (primaryEmail: string, calendarAccountEmail: string) => {
      const recordKey = calendarConnectionKey(calendarAccountEmail)
      setConnectionState?.(recordKey, ConnectionStates.SYNCING)
      try {
        await syncGoogleCalendarAPI(primaryEmail, calendarAccountEmail)
        resetAuthFailure(recordKey)
      } catch (error) {
        handleSyncError(error, recordKey)
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
    },
    [syncGoogleDrive, syncGoogleGmail],
  )

  const syncConnections = useCallback(
    async (email: string, connections: Record<string, Connection>) => {
      const promises: Promise<void>[] = []

      // Sync Drive and Gmail using the base scope keys.
      for (const connectionKey of [ConnectionKeys.GOOGLE_DRIVE, ConnectionKeys.GOOGLE_GMAIL]) {
        if (isConnectionReadyToSync(connections[connectionKey])) {
          promises.push(syncByConnectionKey(email, connectionKey))
        }
      }

      // Sync every linked Google Calendar account independently.
      for (const calConn of getGoogleCalendarConnections(connections)) {
        if (isConnectionReadyToSync(calConn) && calConn.calendarAccountEmail) {
          promises.push(syncGoogleCalendar(email, calConn.calendarAccountEmail))
        }
      }

      await Promise.all(promises)
    },
    [syncByConnectionKey, syncGoogleCalendar],
  )

  return { syncByConnectionKey, syncConnections, syncGoogleCalendar }
}
