// Notes have one finite lifetime, including preparation, queue wait and streaming.
export const NOTES_GENERATION_DEADLINE_MS = 180000

export function waitForAbort<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return work
  return new Promise<T>((resolve, reject) => {
    const aborted = () => reject(signal.reason || new DOMException('Note generation cancelled', 'AbortError'))
    signal.addEventListener('abort', aborted, { once: true })
    if (signal.aborted) aborted()
    work.then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted))
  })
}

const generations = new Map<number, NotesGeneration>()
// Do not abort a submitted local write: cancellation cannot undo a server commit.
// A replacement waits for that write to settle before submitting its own write.
const writes = new Map<number, Promise<unknown>>()

export class NotesGeneration {
  readonly controller = new AbortController()
  readonly signal = this.controller.signal
  private timer: ReturnType<typeof setTimeout>
  constructor(readonly threadId: number) {
    generations.get(threadId)?.cancel(new Error('Note generation replaced by a newer attempt.'))
    generations.set(threadId, this)
    this.timer = setTimeout(() => this.cancel(new Error('Note generation timed out. Your transcript is saved. Retry notes.')), NOTES_GENERATION_DEADLINE_MS)
  }
  current() { return generations.get(this.threadId) === this && !this.signal.aborted }
  check() {
    if (!this.current()) throw this.signal.reason || new Error('Note generation is no longer current.')
  }
  cancel(error: Error) { this.controller.abort(error) }
  finish() {
    clearTimeout(this.timer)
    if (generations.get(this.threadId) === this) generations.delete(this.threadId)
  }
  async write<T>(save: () => Promise<T>): Promise<T> {
    return waitForAbort(serializeNotesWrite(this.threadId, () => { this.check(); return save() }), this.signal)
  }
}

export function serializeNotesWrite<T>(threadId: number, save: () => Promise<T>): Promise<T> {
  const previous = writes.get(threadId) || Promise.resolve()
  const pending = previous.catch(() => {}).then(save)
  writes.set(threadId, pending)
  void pending.finally(() => { if (writes.get(threadId) === pending) writes.delete(threadId) }).catch(() => {})
  return pending
}

export function cancelNotesGeneration(threadId: number, reason: Error) {
  generations.get(threadId)?.cancel(reason)
}
