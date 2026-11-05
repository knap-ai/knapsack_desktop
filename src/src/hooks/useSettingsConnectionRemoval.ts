import { useRef, useState } from 'react'

import type { Connection } from 'src/api/connections'
import { refreshAfterConnectionRemoval } from 'src/utils/settingsConnections'

export function useSettingsConnectionRemoval(options: {
  deleteConnection: (id: number) => void | Promise<unknown>
  onRemoved: (connection: Connection) => void
  refreshApp: () => Promise<unknown>
  refreshSettings: () => Promise<unknown>
}) {
  const inFlight = useRef(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const remove = async (connection: Connection) => {
    if (inFlight.current) return
    if (!connection.id && connection.key !== 'local_files_read') {
      setError('This connection has no saved ID. Reopen Settings and retry.')
      return
    }
    inFlight.current = true
    setRemovingId(connection.id ?? -1)
    setError('')
    try {
      if (connection.id) await options.deleteConnection(connection.id)
      options.onRemoved(connection)
      await refreshAfterConnectionRemoval(options.refreshApp, options.refreshSettings)
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Could not remove this connection. Try again.',
      )
    } finally {
      inFlight.current = false
      setRemovingId(null)
    }
  }
  return { remove, removingId, error, clearError: () => setError('') }
}
