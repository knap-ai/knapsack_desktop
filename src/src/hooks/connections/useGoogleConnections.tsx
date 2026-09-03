import { useCallback, useRef } from 'react'

import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  calendarConnectionKey,
  driveConnectionKey,
  gmailConnectionKey,
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

  /** Sync a single Google Drive account identified by accountEmail. */
  const syncGoogleDrive = useCallback(
    async (primaryEmail: string, accountEmail: string, stateKey?: string) => {
      const recordKey = stateKey || driveConnectionKey(accountEmail)
      setConnectionState?.(recordKey, ConnectionStates.SYNCING)
      try {
        await syncGoogleDriveAPI(primaryEmail, accountEmail)
        resetAuthFailure(recordKey)
      } catch (error) {
        handleSyncError(error, recordKey)
      }
    },
    [setConnectionState, handleSyncError, resetAuthFailure],
  )

  /** Sync a single Gmail account identified by accountEmail. */
  const syncGoogleGmail = useCallback(
    async (primaryEmail: string, accountEmail: string, stateKey?: string) => {
      const recordKey = stateKey || gmailConnectionKey(accountEmail)
      setConnectionState?.(recordKey, ConnectionStates.SYNCING)
      try {
        await syncGoogleGmailAPI(primaryEmail, accountEmail)
        resetAuthFailure(recordKey)
      } catch (error) {
        handleSyncError(error, recordKey)
      }
    },
    [setConnectionState, handleSyncError, resetAuthFailure],
  )

  /** Sync a single Google Calendar account identified by calendarAccountEmail. */
  const syncGoogleCalendar = useCallback(
    async (primaryEmail: string, calendarAccountEmail: string, stateKey?: string) => {
      const recordKey = stateKey || calendarConnectionKey(calendarAccountEmail)
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

  const syncConnections = useCallback(
    async (email: string, connections: Record<string, Connection>) => {
      const promises: Promise<void>[] = []

      // Sync every linked Google Drive account independently.
      for (const [recordKey, driveConn] of Object.entries(connections).filter(
        ([, connection]) => connection.key === ConnectionKeys.GOOGLE_DRIVE,
      )) {
        if (isConnectionReadyToSync(driveConn)) {
          promises.push(
            syncGoogleDrive(
              driveConn.ownerEmail || email,
              driveConn.calendarAccountEmail || email,
              recordKey,
            ),
          )
        }
      }

      // Sync every linked Gmail account independently.
      for (const [recordKey, gmailConn] of Object.entries(connections).filter(
        ([, connection]) => connection.key === ConnectionKeys.GOOGLE_GMAIL,
      )) {
        if (isConnectionReadyToSync(gmailConn)) {
          promises.push(
            syncGoogleGmail(
              gmailConn.ownerEmail || email,
              gmailConn.calendarAccountEmail || email,
              recordKey,
            ),
          )
        }
      }

      // Sync every linked Google Calendar account independently.
      for (const [recordKey, calConn] of Object.entries(connections).filter(
        ([, connection]) => connection.key === ConnectionKeys.GOOGLE_CALENDAR,
      )) {
        if (isConnectionReadyToSync(calConn)) {
          promises.push(
            syncGoogleCalendar(
              calConn.ownerEmail || email,
              calConn.calendarAccountEmail || email,
              recordKey,
            ),
          )
        }
      }

      await Promise.all(promises)
    },
    [syncGoogleDrive, syncGoogleGmail, syncGoogleCalendar],
  )

  return { syncConnections, syncGoogleCalendar, syncGoogleDrive, syncGoogleGmail }
}
