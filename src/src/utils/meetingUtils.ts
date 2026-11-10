import type { Meeting } from 'src/hooks/dataSources/useCalendar'

export function verifiedCalendarVideoUrl(value: string | undefined): string | undefined {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return undefined
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return undefined
    return url.href
  } catch { return undefined }
}

export const getEventUrl = (meeting: Meeting | undefined): string | undefined => {
  if (!meeting) return undefined
  const conferenceUrl = verifiedCalendarVideoUrl(meeting.google_meet_url)
  if (conferenceUrl) return conferenceUrl
  const value = meeting.meeting_platform === 'teams' ? meeting.teams_url
    : meeting.meeting_platform === 'zoom' ? meeting.zoom_url : meeting.google_meet_url
  return verifiedCalendarVideoUrl(value)
}

export function calendarMeetingLinkLabel(value: string | undefined): string {
  const verified = verifiedCalendarVideoUrl(value)
  if (!verified) return 'Join meeting'
  const host = new URL(verified).hostname.toLowerCase()
  if (host === 'meet.google.com') return 'Join Meet'
  if (['zoom.us', 'zoom.com'].some(domain => host === domain || host.endsWith(`.${domain}`))) return 'Join Zoom'
  if (['teams.microsoft.com', 'teams.live.com', 'teams.cloud.microsoft'].includes(host)) return 'Join Teams'
  return 'Join meeting'
}
