import { useCallback } from 'react'

import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  isConnectionReadyToSync,
  syncLocalFilesAPI,
} from 'src/api/connections'
import { isFilesEnabled } from 'src/utils/permissions/files'

export const useLocalConnections = (
  setConnectionState?: (scope: string, connectionState: ConnectionStates) => void,
) => {
  const getLocalConnections = async () => {
    const connections: Record<string, Connection> = {}
    const result = await isFilesEnabled()
    if (result) {
      connections[ConnectionKeys.LOCAL_FILES] = {
        key: ConnectionKeys.LOCAL_FILES,
        state: ConnectionStates.IDLE,
        lastSynced: new Date(),
      }
    }
    return connections
  }

  const syncLocalFiles = useCallback(async () => {
    setConnectionState?.(ConnectionKeys.LOCAL_FILES, ConnectionStates.SYNCING)
    await syncLocalFilesAPI()
  }, [setConnectionState])

  const syncConnections = (connections: Record<string, Connection>) => {
    if (isConnectionReadyToSync(connections[ConnectionKeys.LOCAL_FILES])) {
      syncLocalFiles()
    }
  }

  return { syncLocalFiles, getLocalConnections, syncConnections }
}
