import './UpcomingMeetings.scss'

import { useEffect } from 'react'

import KNUtils from '../utils/KNStringUtils'

interface UpcomingMeetingsProps {
  onMeetingClick: (index: number, meeting: Meeting) => void
  selectedMeetingIndex: number
  meetings: Meeting[]
}

export interface Meeting {
  id: string
  eventId: string
  title: string
  description: string
  start: Date
  location: string
  participants: { name: string; email: string }[]
  google_meet_url?: string
  recurrenceId?: string
}

function UpcomingMeetings({
  onMeetingClick,
  selectedMeetingIndex,
  meetings,
}: UpcomingMeetingsProps) {
  useEffect(() => {
    console.log('UpcomingMeetings: Component has mounted or updated')
    return () => {
      console.log('UpcomingMeetings: Component will unmount')
    }
  }, [selectedMeetingIndex])

  return (
    <div className="w-full">
      {meetings && (
        <div className="searchList w-full">
          <div className="m-4">
            <span className="m-4 text-body-text text-bold text-kn-font-large">Automations</span>
          </div>
          {meetings &&
            meetings.map((mtg, index) => {
              const meetingTitle = mtg.title ? KNUtils.shortenText(mtg.title, 55) : ''

              return (
                <div
                  className={
                    `searchItem flex ml-4 ` + (selectedMeetingIndex == index ? 'selected' : '')
                  }
                  key={index}
                  onClick={() => {
                    onMeetingClick(index, mtg)
                  }}
                >
                  <div className="fileTypeIcon">
                    <img className="fileTypeIconImg" src="/assets/images/calendar.svg" />
                  </div>
                  <div className="rightList flex-col content-center">
                    <div className="fileName">{meetingTitle}</div>
                    <div className="fileAttr">{KNUtils.shortenText(mtg.description ?? '', 50)}</div>
                    <div className="title">{mtg.start.toLocaleString()}</div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default UpcomingMeetings
