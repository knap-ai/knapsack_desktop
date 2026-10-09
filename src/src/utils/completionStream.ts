import { waitForAbort } from './notesGeneration'

// Fetch read boundaries are arbitrary, including inside JSON and UTF-8 characters.
export async function readCompletionStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onText: (text: string) => void,
  maxEvents: number,
  signal?: AbortSignal,
): Promise<string> {
  const cancel = () => { void reader.cancel().catch(() => {}) }
  signal?.addEventListener('abort', cancel, { once: true })
  try {
    if (signal?.aborted) throw signal.reason
    const decoder = new TextDecoder('utf-8')
    let pending = '', text = '', events = 0
    const consume = (line: string): boolean => {
      if (line.endsWith('\r')) line = line.slice(0, -1)
      if (!line.startsWith('data:')) return false
      const data = line.slice(5).trimStart()
      if (data === '[DONE]') return true
      if (!data) return false
      if (events >= maxEvents) throw new Error('Too many completion events')
      let parsed
      try { parsed = JSON.parse(data) } catch { throw new Error('Incomplete or invalid completion event') }
      const delta = parsed?.choices?.[0]?.text
      if (typeof delta !== 'string') throw new Error('Invalid completion event')
      events += 1
      text += delta
      if (text) onText(text)
      return false
    }
    while (true) {
      const { done, value } = await waitForAbort(reader.read(), signal)
      if (signal?.aborted) throw signal.reason
      pending += done ? decoder.decode() : decoder.decode(value, { stream: true })
      let end: number
      while ((end = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, end)
        pending = pending.slice(end + 1)
        if (consume(line)) return text
      }
      if (done) {
        if (pending) consume(pending)
        return text
      }
    }
  } finally {
    signal?.removeEventListener('abort', cancel)
  }
}
