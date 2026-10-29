import { useSyncExternalStore } from 'react'
import type { Meeting } from 'src/hooks/dataSources/useCalendar'
import { calendarMeetingLinkLabel, getEventUrl } from 'src/utils/meetingUtils'
import { calendarMeetingLinkKey, meetingLinkStatus, openCalendarMeetingLink, subscribeMeetingLink } from 'src/utils/calendarMeetingLink'

export default function CalendarMeetingLink({ meeting }: { meeting: Meeting | undefined }) {
  const key = calendarMeetingLinkKey(meeting)
  const status = useSyncExternalStore(subscribeMeetingLink, () => meetingLinkStatus(key))
  const url = getEventUrl(meeting)
  const label = calendarMeetingLinkLabel(url)
  if (!meeting) return null
  if (!url) return <span role="status">No video call link in this calendar event.</span>
  return <span className="inline-flex flex-col text-xs">
    <a href={url} title={url} aria-label={label} aria-busy={status === 'opening'}
      className="underline" onClick={event => { event.preventDefault(); void openCalendarMeetingLink(meeting, true) }}>
      {label}
    </a>
    {status === 'error' && <span role="status">Could not open the call. Try {label} again, or copy its link address.</span>}
  </span>
}
