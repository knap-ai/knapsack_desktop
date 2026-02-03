import { Meeting } from 'src/hooks/dataSources/useCalendar'

export const getEventUrl = (meeting: Meeting | undefined): string | undefined => {
  if (!meeting) return undefined

  switch (meeting.meeting_platform) {
    case 'teams':
      return meeting.teams_url
    case 'zoom':
      return meeting.zoom_url
    default:
      return meeting.google_meet_url
  }
}