import { useSyncExternalStore } from 'react'
import type { Meeting } from 'src/hooks/dataSources/useCalendar'
import { calendarMeetingLinkLabel, getEventUrl } from 'src/utils/meetingUtils'
import { calendarMeetingLinkKey, meetingLinkStatus, openCalendarMeetingLink, subscribeMeetingLink } from 'src/utils/calendarMeetingLink'

export default function CalendarMeetingLink({ meeting, recording = false }: { meeting: Meeting | undefined; recording?: boolean }) {
  const key = calendarMeetingLinkKey(meeting)
  const status = useSyncExternalStore(subscribeMeetingLink, () => meetingLinkStatus(key))
  const url = getEventUrl(meeting)
  const label = calendarMeetingLinkLabel(url).replace(/^Join /, recording ? 'Open ' : 'Join ')
  if (!meeting) return null
  if (!url) return <span className="meeting-link-unavailable" role="status">No meeting link</span>
  return <span className="calendar-meeting-link inline-flex flex-col text-xs">
    <a href={url} title={url} aria-label={label} aria-busy={status === 'opening'}
      className="meeting-link-button inline-flex h-9 items-center rounded-lg border border-zinc-300 px-3 text-sm font-medium leading-none whitespace-nowrap hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" onClick={event => { event.preventDefault(); void openCalendarMeetingLink(meeting, true) }}>
      {label}
    </a>
    {status === 'error' && <span role="status">Could not open the call. Try {label} again, or copy its link address.</span>}
  </span>
}
