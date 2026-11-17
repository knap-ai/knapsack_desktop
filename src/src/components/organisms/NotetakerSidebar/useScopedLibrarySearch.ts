import { useEffect, useState } from 'react'

import { listWorkspaces, type Workspace } from 'src/api/workspaces'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

export function useScopedLibrarySearch(query: string, resetQuery: () => void) {
  const [results, setResults] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    const changed = () => {
      setResults([])
      setLoading(false)
      setError(false)
      resetQuery()
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, changed)
    return () => window.removeEventListener(PROFILE_CHANGED_EVENT, changed)
  }, [resetQuery])
  useEffect(() => {
    const revision = getProfileRevision()
    let disposed = false
    const current = () => !disposed && getProfileRevision() === revision
    setResults([])
    setError(false)
    if (!query.trim()) {
      setLoading(false)
      return
    }
    setLoading(true)
    const text = query.trim().toLowerCase()
    void listWorkspaces()
      .then(response => {
        if (!current()) return
        if (!response.success) throw new Error('Library search unavailable')
        setResults(
          response.data.filter(
            workspace =>
              workspace.name?.toLowerCase().includes(text) ||
              workspace.description?.toLowerCase().includes(text),
          ),
        )
      })
      .catch(() => {
        if (current()) setError(true)
      })
      .finally(() => {
        if (current()) setLoading(false)
      })
    return () => {
      disposed = true
    }
  }, [query])
  return { results, loading, error }
}
