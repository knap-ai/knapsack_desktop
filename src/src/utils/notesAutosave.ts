import { debounce } from 'lodash'

import type { BoundNotesSave } from './notesSave'

export function createNotesAutosave(
  callbacks: {
    saved: (threadId: number, notes: string) => void
    failed: (threadId: number) => void
  },
  delay = 500,
) {
  return debounce(async (threadId: number, notes: string, save: BoundNotesSave) => {
    try {
      await save(threadId, notes)
      if (save.isCurrent()) callbacks.saved(threadId, notes)
    } catch {
      if (save.isCurrent()) callbacks.failed(threadId)
    }
  }, delay)
}
