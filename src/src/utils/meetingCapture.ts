export interface MeetingCaptureItem {
  id?: number | null
  title?: string
  timestamp: Date
  isRecording?: boolean
  calendarEvent?: {
    start: number
    end: number
    event_id?: string
    calendar_account_email?: string
    meeting_platform?: string
    google_meet_url?: string
    teams_url?: string
    zoom_url?: string
    participants?: Array<{ email?: string }>
  }
  threads?: Array<{ recorded?: boolean }>
}

export const meetingCaptureKey = (item: MeetingCaptureItem): string =>
  item.calendarEvent?.event_id
    ? `${item.calendarEvent.calendar_account_email || 'calendar'}:${item.calendarEvent.event_id}`
    : `meeting:${item.id ?? item.timestamp.getTime()}`

const looksLikeMeeting = (item: MeetingCaptureItem): boolean => {
  const event = item.calendarEvent
  if (!event) return false
  const durationMs = Math.max(0, event.end * 1000 - event.start * 1000)
  if (durationMs === 0 || durationMs > 4 * 60 * 60 * 1000) return false
  return Boolean(
    event.google_meet_url || event.teams_url || event.zoom_url ||
    (event.meeting_platform && event.meeting_platform !== 'unknown') ||
    (event.participants?.length ?? 0) > 1,
  )
}

export const findMeetingCaptureCandidate = <T extends MeetingCaptureItem>(
  items: T[],
  nowMs: number,
  options: { requireMicWindow?: boolean } = {},
): T | null => {
  const earlyMs = options.requireMicWindow === false ? 2 * 60 * 1000 : 10 * 60 * 1000
  const lateMs = options.requireMicWindow === false ? 0 : 15 * 60 * 1000
  return items
    .filter(item => {
      const event = item.calendarEvent
      if (!event || !looksLikeMeeting(item) || item.isRecording || item.threads?.some(thread => thread.recorded)) {
        return false
      }
      return nowMs >= event.start * 1000 - earlyMs && nowMs <= event.end * 1000 + lateMs
    })
    .sort((left, right) => {
      const leftStart = left.calendarEvent!.start * 1000
      const rightStart = right.calendarEvent!.start * 1000
      const leftActive = leftStart <= nowMs ? 0 : 1
      const rightActive = rightStart <= nowMs ? 0 : 1
      return leftActive - rightActive || Math.abs(nowMs - leftStart) - Math.abs(nowMs - rightStart)
    })[0] || null
}
