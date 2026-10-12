// Ephemeral context for the existing post-meeting notification. No disk copy,
// mailbox access or raw content in the globally broadcast metadata event.
export type PostMeetingSource = { id: string; kind: 'transcript' | 'notes'; content: string }
const sources = new Map<number, PostMeetingSource & { timer: ReturnType<typeof setTimeout> }>()
const MAX_SOURCES = 8, MAX_CHARACTERS = 128000, LIFETIME_MS = 60000
let sequence = 0
export function capturePostMeetingSource(threadId: number, transcript: string, notes: string): string | undefined {
  const raw = transcript.trim(), summary = notes.trim()
  const kind = raw && raw.length <= MAX_CHARACTERS ? 'transcript' : 'notes'
  const content = kind === 'transcript' ? raw : summary
  if (!content || content.length > MAX_CHARACTERS) return undefined
  const existing = sources.get(threadId)
  if (existing) { clearTimeout(existing.timer); sources.delete(threadId) }
  while (sources.size >= MAX_SOURCES) {
    const first = sources.keys().next().value as number
    const previous = sources.get(first)
    if (previous) clearTimeout(previous.timer)
    sources.delete(first)
  }
  const id = `post-meeting-${++sequence}`
  const timer = setTimeout(() => { if (sources.get(threadId)?.id === id) sources.delete(threadId) }, LIFETIME_MS)
  if (typeof timer === 'object') timer.unref?.()
  sources.set(threadId, { id, kind, content, timer })
  return id
}
export function postMeetingSourceId(threadId: number): string | undefined { return sources.get(threadId)?.id }
export function takePostMeetingSource(threadId: number, sourceId?: string): PostMeetingSource | undefined {
  const source = sources.get(threadId)
  if (!source || (sourceId && source.id !== sourceId)) return undefined
  clearTimeout(source.timer)
  sources.delete(threadId)
  return { id: source.id, kind: source.kind, content: source.content }
}
