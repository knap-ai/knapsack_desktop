import { useCallback, useEffect, useState } from 'react'

import { getConnections, type Connection } from 'src/api/connections'
import { KN_API_GET_USER_EMAIL } from 'src/utils/constants'
import { connectedMailSenders } from 'src/utils/emailSenders'

// The live sync map can omit mailboxes saved under another local sign-in.
// Read the same inventory as Settings, but require an explicit choice before
// using any grant outside the current owner. Never infer send capability from
// a browser login and never switch a selected grant after a send failure.
export function useMailSenders(
  connections: Record<string, Connection>,
  ownerEmail: string | undefined,
  enabled: boolean,
) {
  const [inventory, setInventory] = useState<{
    connections: Record<string, Connection>
    owner: string
    requestedOwner?: string
  }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    if (!enabled) {
      setInventory(undefined)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setError('')
    void (async () => {
      try {
        let owner = ownerEmail?.trim() || ''
        if (!owner) {
          const response = await fetch(KN_API_GET_USER_EMAIL, { signal: controller.signal })
          if (!response.ok) throw new Error('Account inventory unavailable')
          owner = String((await response.json()).email || '').trim()
        }
        if (!owner) throw new Error('Sign in to Knapsack to choose a sender.')
        const saved = await getConnections(owner, {
          includeAllUsers: true,
          signal: controller.signal,
        })
        if (!controller.signal.aborted)
          setInventory({ connections: saved, owner, requestedOwner: ownerEmail })
      } catch {
        if (!controller.signal.aborted)
          setError(
            'Could not refresh sender mailboxes. Your draft is preserved. Try again or check connected accounts.',
          )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [enabled, ownerEmail, revision])
  const current = enabled && inventory?.requestedOwner === ownerEmail ? inventory : undefined
  return {
    senders: current
      ? connectedMailSenders(current.connections, current.owner, true)
      : connectedMailSenders(connections, ownerEmail),
    loading,
    error,
    refresh,
  }
}
