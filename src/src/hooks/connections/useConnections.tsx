import { useCallback, useEffect, useState } from 'react'

import {
  Connection,
  ConnectionKeys,
  ConnectionStates,
  dateFormat,
  getConnections,
  getConnectionsStatus,
  syncedMessage
} from 'src/api/connections'

import KNDateUtils from 'src/utils/KNDateUtils'
import { CONNECTIONS, KNLocalStorage } from 'src/utils/KNLocalStorage'
import { useGoogleConnections } from './useGoogleConnections'
import { useLocalConnections } from './useLocalConnections'
import { useMicrosoftConnections } from './useMicrosoftConnections'

export const useConnections = (initialState: Record<string, Connection> = {}) => {
  const [connections, setConnections] = useState<Record<string, Connection>>(initialState)
  const [reconnect, setReconnect] = useState<ConnectionKeys[]>([])

  const cleanReconnectKeys = useCallback(() =>{
    setReconnect([])
  }, [reconnect])

  useEffect(() => {
    if (Object.keys(connections).length === 0) {
      KNLocalStorage.getItem(CONNECTIONS).then((connectionKeys) => {
        if (connectionKeys) {
          KNLocalStorage.getItem(CONNECTIONS).then((conns) => {
            setConnections(
              conns.reduce(
              (acc: Record<string, Connection>, connKey: string) => {

                acc[connKey] = {
                  key: connKey as string,
                  state: ConnectionStates.IDLE
                }
                return acc
              },{})
            );
          })
        }
      })

    }
  }, []);

  const addConnections = useCallback(async(scopes: string[]) => {
    const localConnections = await KNLocalStorage.getItem(CONNECTIONS)
    localConnections.push(...scopes)
    KNLocalStorage.setItem(CONNECTIONS, localConnections)

    setConnections(prevState => ({
      ...prevState,
      ...scopes.reduce((acc, scope) => ({
        ...acc,
        [scope]: prevState[scope] ? prevState[scope] : { key: scope, state: ConnectionStates.IDLE },
      }), {}),
    }))
  }, [setConnections])

  const setConnectionState = useCallback((scope: string, state: ConnectionStates) => {
    setConnections(prevState => ({
      ...prevState,
      [scope]: { ...(prevState[scope] ?? {}), state },
    }))
  }, [])

  const removeConnection = useCallback((scope: ConnectionKeys) => {
    setConnections(prevState => {
      const newState = {...prevState }
      delete newState[scope]
      return newState
    });

    KNLocalStorage.getItem(CONNECTIONS).then((connectionKeys: string[]) => {
      console.log('Connection state updated:', { scope, connectionKeys })
      const filteredKeys = connectionKeys.filter((connKey) => connKey !== scope)
      console.log('Filtered connection state updated:', { scope, filteredKeys })
      KNLocalStorage.setItem(CONNECTIONS, filteredKeys)
    })
    console.log("==> reconnect", reconnect)
    console.log("==> scope", scope)
    setReconnect(prev => {
      if (! prev.includes(scope)) {
        return [
          ...prev,
          scope,
        ]
      }
      return [...prev]
    })
  }, [setConnections])

  const { syncByConnectionKey, syncConnections: syncGoogleConnections } =
    useGoogleConnections(setConnectionState, removeConnection)
  const { syncConnections: syncLocalConnections, getLocalConnections } =
    useLocalConnections(setConnectionState)
  const {syncByConnectionKey: syncMicrosoftByConnectionKey, syncConnections: syncMicrosoftConnections } =
    useMicrosoftConnections(setConnectionState, removeConnection)

  const fetchConnections = useCallback(
    async (email: string) => {
      const cloudConnections = await getConnections(email)
      // const localConnections = await getLocalConnections()
      const updatedConnections: Record<string, Connection> = {}
      for (const { id, key, state, lastSynced, syncedSince } of [
        ...Object.values(cloudConnections),
        // ...Object.values(localConnections),
      ]) {
        updatedConnections[key] =
          connections[key]?.state === ConnectionStates.UP_TO_DATE ||
          connections[key]?.state === ConnectionStates.SYNCING
            ? connections[key]
            : { id, key, state }

        if (lastSynced != null) {
          if (typeof lastSynced === 'string') {
            updatedConnections[key].lastSynced = lastSynced
          } else {
            let lastSyncedDate = lastSynced as Date
            let syncedSinceDate = syncedSince as Date

            updatedConnections[key].lastSynced = syncedMessage[key as ConnectionKeys]
            if (key !== ConnectionKeys.LOCAL_FILES) {
              updatedConnections[key].lastSynced += KNDateUtils.formatDate(
                syncedSinceDate ? syncedSinceDate : lastSyncedDate,
                dateFormat[key as ConnectionKeys]
              )
            }
          }
        }

      }
      setConnections(updatedConnections)
      return updatedConnections
    },
    [connections, getLocalConnections],
  )

  // Check connections finished syncing
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined
    const syncingConnections = Object.entries(connections)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_key, connection]) => connection.state === ConnectionStates.SYNCING)
      .map(([key]) => key)
    if (syncingConnections.length) {
      interval = setInterval(async () => {
        const connectionsStatus = await getConnectionsStatus()
        const finishedConnections = Object.entries(connectionsStatus)
          .filter(([key, value]) => syncingConnections.includes(key) && !value)
          .reduce(
            (acc: Record<string, Connection>, [key]) => ({
              ...acc,
              [key]: {
                ...connections[key],
                state: ConnectionStates.UP_TO_DATE,
              },
            }),
            {},
          )
        setConnections(prev => ({
          ...prev,
          ...finishedConnections,
        }))
      }, 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [connections])

  const setConnectionsByKeys = useCallback((ConnectionKeys: ConnectionKeys[]) => {
    const updatedConnections = {
      ...connections,
      ...ConnectionKeys.reduce(
        (acc: Record<string, Connection>, key) => ({
          ...acc,
          [key]: { key, state: ConnectionStates.IDLE },
        }),
        {},
      ),
    }
    setConnections(_ => (updatedConnections))
    return updatedConnections
  }, [])

  const syncConnections = useCallback(
    async (email: string, updatedConnections: Record<string, Connection>) => {
      syncGoogleConnections(email, updatedConnections)
      syncLocalConnections(updatedConnections)
      syncMicrosoftConnections(email, updatedConnections)
    },
    [syncGoogleConnections, syncLocalConnections],
  )

  const syncGoogleConnectionsByKey = useCallback(
    async (email: string, ConnectionKeys: ConnectionKeys[]) => {
      for (const connectionKey of ConnectionKeys) {
        setConnectionState(connectionKey, ConnectionStates.IDLE)
        syncByConnectionKey(email, connectionKey as ConnectionKeys)
      }
    },
    [setConnectionState, syncByConnectionKey],
  )

  const syncMicrosoftConnectionsByKey = useCallback(
    async (email: string, ConnectionKeys: ConnectionKeys[]) => {
      for (const connectionKey of ConnectionKeys) {
        setConnectionState(connectionKey, ConnectionStates.IDLE)
        syncMicrosoftByConnectionKey(email, connectionKey as ConnectionKeys)
      }
    },
    [setConnectionState, syncMicrosoftByConnectionKey],
  )

  return {
    connections,
    reconnect,
    cleanReconnectKeys,
    fetchConnections,
    setConnectionState,
    setConnectionsByKeys,
    syncConnections,
    addConnections,
    syncGoogleConnectionsByKey,
    syncMicrosoftConnectionsByKey,
  }
}
