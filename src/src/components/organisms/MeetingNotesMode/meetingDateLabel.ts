/** Display only a verified calendar occurrence date; imported notes have no safe fallback. */
export function meetingDateLabel(startSeconds: number | undefined, now = new Date()): string | null {
  if (typeof startSeconds !== 'number' || !Number.isFinite(startSeconds) || startSeconds <= 0) return null
  const start = new Date(startSeconds * 1000)
  if (!Number.isFinite(start.getTime()) || start.getFullYear() > 9999) return null
  if (now.getFullYear() === start.getFullYear() && now.getMonth() === start.getMonth() && now.getDate() === start.getDate()) return 'Today'
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
