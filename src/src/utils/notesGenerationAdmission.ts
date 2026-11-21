/** In-flight deduplication only. Never share work across a changed account origin. */
const pending = new Map<number, { origin: string; requestKey: string; promise: Promise<void> }>()
export function runNotesGenerationOnce(
  threadId: number,
  origin: string,
  work: () => Promise<void>,
  requestKey = '',
): Promise<void> {
  const existing = pending.get(threadId)
  if (existing) {
    if (existing.origin !== origin)
      return Promise.reject(
        new Error(
          'A generation from a different account context is still finishing. Retry after it settles.',
        ),
      )
    if (existing.requestKey !== requestKey)
      return Promise.reject(
        new Error(
          'A different notes request is already running. Wait for it to finish before changing the template or notes.',
        ),
      )
    return existing.promise
  }
  const promise = Promise.resolve().then(work)
  const entry = { origin, requestKey, promise }
  pending.set(threadId, entry)
  const release = () => {
    if (pending.get(threadId) === entry) pending.delete(threadId)
  }
  void promise.then(release, release)
  return promise
}
