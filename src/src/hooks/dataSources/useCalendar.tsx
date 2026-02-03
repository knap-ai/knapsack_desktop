import { useCallback, useEffect, useState } from 'react'

import { getCalendarEvents } from 'src/utils/data_fetch'
import KNAnalytics from 'src/utils/KNAnalytics'

export interface Meeting {
  meeting_platform: string
  teams_url: string
  zoom_url: string
  id: string
  title: string
  description: string
  start: number
  end: number
  location: string
  participants: { name: string; email: string }[]
  google_meet_url: string
  hasEnded: boolean
  event_id: string

  /**
   * Returns a readable string representation of the meeting
   * with title and participants (names and emails)
   */
  getReadableFormat(): string
}

export interface CalendarEvents {
  id: number
  title: string
  description: string
  start: number
  location: string
  attendees_json: string
  end: number
  creator_email: string
  google_meet_url: string
  event_id: string
}

export const serializeCalendarEventToMeeting = (event: CalendarEvents): Meeting => {
  const participants: { name: string; email: string }[] = JSON.parse(event.attendees_json).map(
    (attendee: { name: string; email: string }) => ({
      name: attendee.name,
      email: attendee.email,
    }),
  )

  const teamsRegex = /https:\/\/(?:teams\.microsoft\.com|teams\.live\.com)[^<>"\s\\]*/gi
  const zoomRegex = /https:\/\/(?:[a-z0-9-]+\.)?zoom\.(?:us|com)[^<>"\s\\]*/gi

  let teamsUrl = ''
  let zoomUrl = ''
  let meetingPlatform = event.google_meet_url ? 'google_meet' : 'unknown'

  if (event.location) {
    const teamsLocationMatches = event.location.match(teamsRegex)
    if (teamsLocationMatches && teamsLocationMatches.length > 0) {
      teamsUrl = teamsLocationMatches[0].replace(/[<>"\\]+$/, '')
      meetingPlatform = 'teams'
    }

    const zoomLocationMatches = event.location.match(zoomRegex)
    if (zoomLocationMatches && zoomLocationMatches.length > 0) {
      zoomUrl = zoomLocationMatches[0].replace(/[<>"\\]+$/, '')
      meetingPlatform = 'zoom'
    }
  }

  if (!teamsUrl && !zoomUrl && event.description) {
    const teamsDescMatches = event.description.match(teamsRegex)
    if (teamsDescMatches && teamsDescMatches.length > 0) {
      teamsUrl = teamsDescMatches[0].replace(/[<>"\\]+$/, '')
      meetingPlatform = 'teams'
    }

    const zoomDescMatches = event.description.match(zoomRegex)
    if (zoomDescMatches && zoomDescMatches.length > 0) {
      zoomUrl = zoomDescMatches[0].replace(/[<>"\\]+$/, '')
      meetingPlatform = 'zoom'
    }
  }

  const meeting: Meeting = {
    id: event.id.toString(),
    title: event.title,
    description: event.description,
    start: event.start,
    end: event.end,
    location: event.location,
    participants,
    google_meet_url: event.google_meet_url,
    teams_url: teamsUrl,
    zoom_url: zoomUrl,
    meeting_platform: meetingPlatform,
    hasEnded: false,
    event_id: event.event_id,
    getReadableFormat: function () {
      const participantsText = this.participants
        .map(p => `${p.name || ' '} (${p.email})`)
        .join('\n')

      return `Meeting Title: ${this.title}\n\nParticipants:\n${participantsText}`
    },
  }

  return meeting
}
const useCalendar = () => {
  const [meetings, setMeetings] = useState<Record<string, Meeting>>({})
  const ONE_WEEK_IN_MILLIS = 1000 * 60 * 60 * 24 * 7
  const ONE_DAY_IN_MILLIS = 1000 * 60 * 60 * 24 * 1

  const updateMeetingStatuses = useCallback((currentTime: number) => {
    setMeetings(prevMeetings => {
      const updatedMeetings = { ...prevMeetings }
      Object.keys(updatedMeetings).forEach(id => {
        updatedMeetings[id] = {
          ...updatedMeetings[id],
          hasEnded: currentTime >= updatedMeetings[id].end,
        }
      })
      return updatedMeetings
    })
    checkAndTrackEndingMeetings(currentTime)
  }, [])

  const checkAndTrackEndingMeetings = useCallback(
    (currentTime: number) => {
      Object.values(meetings).forEach(meeting => {
        const timeUntilEnd = meeting.end - currentTime
        if (timeUntilEnd > 0 && timeUntilEnd <= 60) {
          // Meeting ending within the next minute
          KNAnalytics.trackEvent('Meeting Ending', {
            meetingId: meeting.id,
          })
        }
      })
    },
    [meetings],
  )

  const getFutureMeetings = useCallback(
    () =>
      getCalendarEvents(
        Math.floor((new Date().getTime() - ONE_DAY_IN_MILLIS) / 1000),
        Math.floor((new Date().getTime() + ONE_WEEK_IN_MILLIS) / 1000),
      ),
    [ONE_DAY_IN_MILLIS, ONE_WEEK_IN_MILLIS],
  )

  const syncMeetings = useCallback(async () => {
    const meetings = await getFutureMeetings()
    const currentTime = Date.now() / 1000
    const updatedMeetings = meetings.reduce(
      (acc: Record<string, Meeting>, meeting: CalendarEvents) => {
        const serializedMeeting = serializeCalendarEventToMeeting(meeting)
        acc[meeting.id] = {
          ...serializedMeeting,
          end: meeting.end,
          hasEnded: currentTime >= meeting.end,
          getReadableFormat: serializedMeeting.getReadableFormat,
        }
        return acc
      },
      {},
    )
    setMeetings(updatedMeetings)
    return updatedMeetings
  }, [getFutureMeetings])

  useEffect(() => {
    syncMeetings()
  }, [])

  return {
    meetings,
    syncMeetings,
    updateMeetingStatuses,
  }
}

export default useCalendar
