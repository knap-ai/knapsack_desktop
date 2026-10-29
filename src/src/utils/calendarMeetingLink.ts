import { open } from '@tauri-apps/api/shell'
import type { Meeting } from 'src/hooks/dataSources/useCalendar'
import { getEventUrl } from './meetingUtils'

type LinkStatus = 'idle' | 'opening' | 'opened' | 'error'
const attempts = new Map<string, { status: LinkStatus; openedAt?: number; pending?: Promise<boolean> }>()
const listeners = new Set<() => void>()
export const subscribeMeetingLink = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export const calendarMeetingLinkKey = (meeting: Meeting | undefined) => meeting
  ? JSON.stringify([meeting.calendar_account_email, meeting.event_id, meeting.id, meeting.start, getEventUrl(meeting)])
  : ''
export const meetingLinkStatus = (key: string): LinkStatus => attempts.get(key)?.status || 'idle'

// Call only for an explicit user action, never on selection, render, or auto-capture.
export function openCalendarMeetingLink(meeting: Meeting | undefined, manual = false): Promise<boolean> {
  const url = getEventUrl(meeting)
  if (!url) return Promise.resolve(false)
  const key = calendarMeetingLinkKey(meeting)
  const previous = attempts.get(key)
  if (previous?.pending) return previous.pending
  if (previous?.status === 'opened' && (!manual || Date.now() - (previous.openedAt || 0) < 1500)) return Promise.resolve(true)
  const attempt: { status: LinkStatus; openedAt?: number; pending?: Promise<boolean> } = { status: 'opening' }
  attempts.set(key, attempt)
  const notify = () => listeners.forEach(listener => listener())
  // Capture the calendar URL before yielding; later selections cannot retarget this click.
  attempt.pending = Promise.resolve().then(() => open(url)).then(() => {
    attempt.status = 'opened'
    attempt.openedAt = Date.now()
    return true
  }, () => {
    attempt.status = 'error'
    return false
  }).finally(() => { attempt.pending = undefined; notify() })
  notify()
  return attempt.pending
}

// Browser outcome is reported by CalendarMeetingLink; recording keeps its own result.
export function startCalendarRecordingAction<T>(meeting: Meeting | undefined, record: () => Promise<T>): Promise<T> {
  void openCalendarMeetingLink(meeting)
  return record()
}
