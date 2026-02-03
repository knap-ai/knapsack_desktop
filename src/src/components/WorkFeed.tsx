import { useEffect, useRef, useState } from 'react'

import './WorkFeed.scss'

import { ONE_DAY_IN_MILLIS, ONE_WEEK_IN_MILLIS } from 'src/utils/constants'

import { getGoogleCalendarEvents } from '../api/connections'
import KNUtils from '../utils/KNStringUtils'
import { SourceDocument } from '../utils/SourceDocument'
import TextRenderer from './TextRenderer'

import './WorkFeed.scss'

interface WorkFeedProps {
  onRemoveSource: (index: number, type: string) => void
  feedMessages: any
  isChatLoading: boolean
  searchItemsForChat: any
  webSearchResponse: any
  semanticSearchResponse: any
}

export interface FeedItem {
  id: string
  title: string
  description: string
  timestamp: Date
  location: string
  content: string
  sources: SourceDocument[]
  hasRun: boolean
}

// const ONE_MONTH_IN_MILLIS = 1000 * 60 * 60 * 24 * 31;

function WorkFeed({}: WorkFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [hoveredItemIdx, setHoveredItemIdx] = useState<number | null>(null)

  useEffect(() => {
    buildFeed()
  }, [])

  const buildFeed = async () => {
    const calendarEvents = await getGoogleCalendarEvents(
      Math.floor((new Date().getTime() - ONE_DAY_IN_MILLIS) / 1000),
      Math.floor((new Date().getTime() + ONE_WEEK_IN_MILLIS) / 1000),
    )
    console.log('CALENDAR EVENTS: ', calendarEvents)

    // TODO: weave together calendarEvents and feedMessages/automationOutputs.
    // Sort by timestamp ascending.
    // setFeedItems([]);
    const newFeedItems: FeedItem[] = calendarEvents.map((event: any) => {
      let attendeesObj = []
      try {
        attendeesObj = JSON.parse(event.attendees_json)
      } catch (error) {
        console.error('Failed to parse attendees JSON: ', event.attendees)
      }
      console.log('attendeesObj: ', attendeesObj)

      const attendees = attendeesObj.map((item: any) => item.email)
      const attendeesStr = attendees.join(', ')

      return {
        id: event.id,
        title: event.title, // Assuming the event has a 'summary' property
        description: attendeesStr || '', // Fallback to empty string if no description
        timestamp: new Date(event.start * 1000), // Assuming event has 'start.dateTime'
        location: event.location || '',
        content: '', // Reusing summary, but you can customize this
        sources: [], // Assuming no source documents are associated with events; adjust as needed
        hasRun: false, // Set initial value; adjust based on logic
      }
    })

    // Sort feed items by timestamp, ascending
    newFeedItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    setFeedItems(newFeedItems)
  }

  const messageListEndDivRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col py-0 pl-10 w-full">
      <div className="KNChatMessageContainer flex flex-col overflow-y-auto max-h-full flex-grow p-6">
        <div className="flex flex-row">
          <div className="LeftBumper"></div>
          <div className="FeedMessageList mt-6 ml-3 mr-12 sm:mr-24">
            {feedItems &&
              feedItems.map((feedItem, index) => (
                <div>
                  <div className="text-sm SubTextColor my-auto mx-2">
                    {KNUtils.getUserDisplayTime(feedItem.timestamp)}
                  </div>
                  <div
                    key={index}
                    className={`${hoveredItemIdx !== index ? 'AutomationOutputBox' : 'AutomationOutputBoxHover'} items-end mb-6 py-1 px-2`}
                    onMouseEnter={() => setHoveredItemIdx(index)}
                    onMouseLeave={() => setHoveredItemIdx(null)}
                  >
                    <div key={index} className={`KNChatMessage ${feedItem.title} text-left`}>
                      <div className="KNChatMessageRight LongText">
                        <div className="gap-4 mt-2 mb-3">
                          {/* <img className='w-8 h-8' src='/assets/images/chat/chat-bot-icon.png' />*/}
                          {feedItem &&
                            feedItem.sources.length > 0 &&
                            feedItem.sources.map((doc: any, i: any) => (
                              <div
                                key={i}
                                className="SourceCard source-result flex flex-col m-1 px-2 py-3 rounded-md w-width-percent-45"
                              >
                                <div className="flex-1 flex flex-row source-result gap-2 max-w-64">
                                  <a
                                    className="source-link flex-grow max-h-12 pl-1 text-left text-ellipsis overflow-hidden text-sm text-body-text"
                                    href={feedItem.title}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {KNUtils.shortenText(feedItem.title, 53)}
                                  </a>
                                </div>
                                <div className="source-result-bottom text-[#afafaf] flex flex-row font-fkgr items-center mt-2 pl-1 text-xs">
                                  <img
                                    className="favicon flex h-4"
                                    src={KNUtils.getFaviconUrl(doc.url)}
                                    onError={e => {
                                      ;(e.target as HTMLImageElement).src =
                                        '/assets/images/knap-logo-medium.png'
                                    }}
                                  />
                                  <div className="website flex ml-2 text-soft-gray">
                                    {KNUtils.getDomainAsWord(doc.url)}
                                  </div>
                                  <div className="number flex ml-1">{'• ' + (i + 1)}</div>
                                </div>
                              </div>
                            ))}
                          <div className="KNChatMessageContent rounded-[10px] p-[14px] text-body-text text-kn-font-regular">
                            <div className="flex flex-row">
                              <div className="flex flex-col">
                                <div className="text-base font-medium">{feedItem.title}</div>
                                <div className="text-sm SubTextColor my-auto">
                                  {feedItem.description}
                                </div>
                                <div className="text-sm SubTextColor my-auto">
                                  {feedItem.location}
                                </div>
                              </div>
                              <div className="flex flex-1"></div>
                              {hoveredItemIdx === index && (
                                <div className="FeedButton flex ml-auto items-center text-base font-medium">
                                  Get Meeting Report
                                </div>
                              )}
                            </div>
                            <TextRenderer text={feedItem.content}></TextRenderer>
                            {/*<div className="LongText text-[#a0a0a0] font-regular">{feedItem.description}</div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="RightBumper"></div>
          <div ref={messageListEndDivRef} />
        </div>
      </div>
    </div>
  )
}

export default WorkFeed
