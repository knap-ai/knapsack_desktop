/** Hold UI and draft ownership across an asynchronous, already-bound note save. */
export async function commitSpellingCorrection({
  markdown,
  current,
  save,
  keepDraft,
  clearMatchingDraft,
  commit,
}: {
  markdown: string
  current: () => boolean
  save: () => Promise<void>
  keepDraft: (markdown: string) => void
  clearMatchingDraft: (markdown: string) => void
  commit: (markdown: string) => void
}) {
  if (!current()) throw new Error('Notes or account changed. Reopen the correction.')
  keepDraft(markdown)
  try {
    await save()
  } catch {
    throw new Error(
      'Could not save. Your correction is kept on this device; retry or reopen the meeting.',
    )
  }
  if (!current()) throw new Error('Notes changed while saving. Your newer draft is preserved.')
  clearMatchingDraft(markdown)
  commit(markdown)
}
