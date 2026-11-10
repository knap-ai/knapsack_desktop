import { useEffect, useRef, useState } from 'react'

import {
  EMAIL_POPUP_PREFERENCE_CHANGED,
  readEmailPopupPreference,
  writeEmailPopupPreference,
} from 'src/utils/emailPopupPreference'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'

export function useEmailPopupPreference() {
  const [state, setState] = useState<Awaited<ReturnType<typeof readEmailPopupPreference>> | null>(
    null,
  )
  const lock = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let generation = 0
    let active = true
    const refresh = () => {
      const request = ++generation
      setState(null)
      setError('')
      readEmailPopupPreference()
        .then(value => {
          if (active && request === generation && value.revision === getProfileRevision())
            setState(value)
        })
        .catch(() => {
          if (active && request === generation) setError('Could not load popup preferences.')
        })
    }
    refresh()
    window.addEventListener(PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener(EMAIL_POPUP_PREFERENCE_CHANGED, refresh)
    return () => {
      active = false
      generation++
      window.removeEventListener(PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener(EMAIL_POPUP_PREFERENCE_CHANGED, refresh)
    }
  }, [])
  const current = state?.revision === getProfileRevision() ? state : null
  return {
    enabled: current?.enabled === true,
    owner: current?.owner,
    ready: !!current?.owner,
    busy,
    error,
    setEnabled: async (enabled: boolean) => {
      if (!current?.owner || lock.current) return
      lock.current = true
      setBusy(true)
      setError('')
      try {
        await writeEmailPopupPreference(current.owner, current.revision, enabled)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save popup preferences.')
      } finally {
        lock.current = false
        setBusy(false)
      }
    },
  }
}
