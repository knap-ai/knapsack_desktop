import { hasPendingNotesWrite } from './notesGeneration'

/** In-flight deduplication only. Never share work across a changed account origin. */
const templateWrites = new Set<number>()
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

/** Synchronous guard before a template can be persisted; includes preflight and save. */
export function assertNotesTemplateChangeAllowed(threadId: number): void {
  if (pending.has(threadId) || hasPendingNotesWrite(threadId) || templateWrites.has(threadId)) {
    throw new Error(
      'Notes generation or saving is still running. Wait for it to finish, then choose a template.',
    )
  }
}

/** A template write remains reserved across picker unmounts until its backend reply. */
export async function withNotesTemplateWrite<T>(
  threadId: number,
  work: () => Promise<T>,
): Promise<T> {
  assertNotesTemplateChangeAllowed(threadId)
  templateWrites.add(threadId)
  try {
    return await work()
  } finally {
    templateWrites.delete(threadId)
  }
}
