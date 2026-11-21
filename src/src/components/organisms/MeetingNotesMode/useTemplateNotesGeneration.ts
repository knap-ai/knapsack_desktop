import { useEffect, useRef, useState } from 'react'

import { waitForNotesGenerationIdle } from 'src/utils/notesGenerationAdmission'
import { getProfileRevision } from 'src/utils/profileScope'

/** Coalesce template changes while synthesis owns this thread. Never replay an old scope. */
export function useTemplateNotesGeneration({
  template,
  scope,
  threadId,
  enabled,
  blocked = false,
  generate,
}: {
  template: unknown
  scope: string
  threadId: number
  enabled: boolean
  blocked?: boolean
  generate: () => Promise<void>
}) {
  const [active, setActive] = useState<{ scope: string; template: unknown; token: symbol } | null>(
    null,
  )
  const previous = useRef({ scope, template })
  const latest = useRef({ scope, template, generate })
  latest.current = { scope, template, generate }
  useEffect(() => {
    if (previous.current.scope !== scope) {
      previous.current = { scope, template }
      return
    }
    if (!threadId || !enabled || blocked || previous.current.template === template) return
    let disposed = false
    const revision = getProfileRevision()
    const token = Symbol()
    setActive({ scope, template, token })
    void waitForNotesGenerationIdle(threadId)
      .then(async () => {
        if (
          disposed ||
          revision !== getProfileRevision() ||
          latest.current.scope !== scope ||
          latest.current.template !== template
        )
          return
        // Commit the selection only once the old request has released admission.
        // Use the current draft/callback, never the snapshot from the earlier selection.
        previous.current = { scope, template }
        await latest.current.generate()
      })
      .catch(() => {
        /* The existing generation path owns its error feedback. */
      })
      .finally(() => {
        setActive(value => (value?.token === token ? null : value))
      })
    return () => {
      disposed = true
    }
  }, [template, scope, threadId, enabled, blocked])
  return (
    enabled &&
    ((previous.current.scope === scope && previous.current.template !== template) ||
      (active?.scope === scope && active.template === template))
  )
}
