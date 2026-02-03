import './style.scss'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeedItem } from 'src/api/feed_items'
import { EmailImportance } from 'src/hooks/dataSources/useEmailAutopilot'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'

import { Button, ButtonVariant } from 'src/components/atoms/button'
import { Tooltip, TooltipVariant } from 'src/components/atoms/tooltip'
import FixedThreadPreviewCard from 'src/components/molecules/FixedThreadPreviewCard'
import ThreadPreviewCard from 'src/components/molecules/ThreadPreviewCard'

import OpenSidebarIcon from '/assets/images/feedSidebar/OpenSidebar.svg'
import FeedSidebarArrowDown from '/assets/images/icons/FeedSidebarArrowDown.svg'
import Mic from '/assets/images/icons/mic-grey.svg'

interface FeedSidebarProps {
  feed: IFeed
  isAnyRecording: boolean
}

const SIDEBAR_TOGGLE_THRESHOLD = 675

function FeedSidebar({ feed, isAnyRecording }: FeedSidebarProps) {
  const currentFeedItem = feed.currentFeedItem()
  const [datesDisplay] = useState({ future: false, past: true })
  const [open, setOpen] = useState(true)
  const threadCardRef = useRef<HTMLDivElement>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    if (feed && feed.feedContent) {
      Object.keys(feed.feedContent).forEach(key => {
        if (!key.includes('Today') && !feed.isRecentDate(key, true, false)) {
          initialState[key] = true
        }
      })
    }
    return initialState
  })

  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({})

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }))

    setManuallyToggled(prev => ({
      ...prev,
      [key]: true,
    }))
  }

  useEffect(() => {
    if (!feed || !feed.feedContent) return

    setCollapsedSections(prev => {
      const newState = { ...prev }

      Object.keys(feed.feedContent).forEach(key => {
        if (!manuallyToggled[key]) {
          if (
            !key.includes('Today') &&
            feed.feedContent[key] &&
            feed.feedContent[key][0]?.timestamp > new Date() &&
            !prev[key]
          ) {
            newState[key] = true
          }
        }
      })

      return newState
    })
  }, [feed.feedContent, manuallyToggled])

  const setDrawerOpenState = () => {
    if (window.innerWidth < SIDEBAR_TOGGLE_THRESHOLD && open) {
      setOpen(false)
    } else if (window.innerWidth >= SIDEBAR_TOGGLE_THRESHOLD && !open) {
      setOpen(true)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setDrawerOpenState()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [open])

  useEffect(() => {
    if (currentFeedItem) {
      const threadCard = document.getElementById(`ThreadCard${currentFeedItem.id}`)
      if (threadCard) {
        threadCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentFeedItem])

  const emailCategories = useMemo(() => {
    const categories: Record<EmailImportance, { total: number; active: number }> = {
      [EmailImportance.IMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.IMPORTANT_NO_RESPONSE]: { total: 0, active: 0 },
      [EmailImportance.INFORMATIONAL]: { total: 0, active: 0 },
      [EmailImportance.MARKETING]: { total: 0, active: 0 },
      [EmailImportance.UNIMPORTANT]: { total: 0, active: 0 },
      [EmailImportance.UNCLASSIFIED]: { total: 0, active: 0 },
    }

    if (feed?.classifiedEmails) {
      Object.entries(feed.classifiedEmails).forEach(([category, emails]) => {
        const importanceValue = Object.values(EmailImportance).find(value => value === category)
        if (importanceValue) {
          const activeEmails =
            emails?.filter(email => !email.wasIgnored && !email.wasReplySent) || []
          categories[category as EmailImportance] = {
            total: emails?.length || 0,
            active: activeEmails.length,
          }
        }
      })
    }

    return categories
  }, [feed?.classifiedEmails])

  const totalEmailCount = useMemo(() => {
    return Object.entries(emailCategories).reduce((sum, [category, counts]) => {
      if (category !== EmailImportance.UNCLASSIFIED) {
        return sum + counts.active
      }
      return sum
    }, 0)
  }, [emailCategories])

  const handleTitleChange = useCallback(
    (key: string, itemId: number, newTitle: string) => {
      if (feed.updateFeedItemTitle) {
        feed.updateFeedItemTitle(key, itemId, newTitle)
      }
    },
    [feed],
  )

  const handleDeleteItem = useCallback(
    (itemId: number) => {
      if (feed.deleteFeedItemFromState && itemId !== undefined) {
        feed
          .deleteFeedItemFromState(itemId)
          .then(() => {
            if (currentFeedItem?.id === itemId) {
              feed.unselectFeedItem()
            }
          })
          .catch(error => {
            console.error('Error deleting feed item:', error)
          })
      }
    },
    [feed, currentFeedItem],
  )

  const renderFeedItem = useCallback(
    (
      item: FeedItem,
      index: number,
      dateGroupIndex: number,
      key: string,
      nextItemId: number | undefined,
      currentItemId: number | undefined,
    ) => {
      const isSelected = currentFeedItem?.id === item.id
      const isNextItem = nextItemId ? item.id === nextItemId : false
      const isNowItem = currentItemId ? item.id === currentItemId : false

      const absoluteMessageIndex =
        Object.values(feed.feedContent)
          .slice(0, dateGroupIndex)
          .reduce((acc, curr) => acc + curr.length, 0) + index

      return (
        <Fragment key={absoluteMessageIndex}>
          <div
            className={`flex flex-col w-full text-left border-r border-t border-b rounded-r-md
              ${
                isSelected
                  ? 'bg-ks-warm-grey-100 border-ks-warm-grey-200'
                  : 'hover:bg-ks-warm-grey-100 hover:border-ks-warm-grey-200 border-transparent'
              } ${index > 0 ? 'mt-px' : ''}`}
            id={`ThreadCard${item.id}`}
            ref={isSelected ? threadCardRef : null}
            onClick={() => {
              feed.selectFeedItem(key, item.id)
            }}
          >
            {isNowItem && (
              <div className="pl-12 pt-1 pb-0">
                <div className="font-InterTight font-semibold text-xxs text-ks-red-700 leading-4 tracking-[0.08em]">
                  NOW
                </div>
              </div>
            )}
            {isNextItem && (
              <div className="pl-12 pt-1 pb-0">
                <div className="font-InterTight font-semibold text-xxs text-ks-warm-grey-700 leading-4 tracking-[0.08em]">
                  NEXT
                </div>
              </div>
            )}
            <div className="flex items-center w-full">
              <div className="pl-10 w-full">
                <ThreadPreviewCard
                  title={
                    item && typeof item.getTitle === 'function'
                      ? item.getTitle()
                      : item?.title || ''
                  }
                  subTitle={item.getSubtitle()}
                  executedTime={item.timestamp}
                  isSelected={isSelected}
                  isRecording={item.isRecording}
                  setIsSelected={() => {
                    feed.selectFeedItem(key, item.id)
                  }}
                  hasLabel={isNowItem || isNextItem}
                  showFullDate={key === 'COMING UP'}
                  onTitleChange={newTitle => {
                    if (item.id !== undefined) {
                      handleTitleChange(key, item.id, newTitle)
                    }
                  }}
                  onDelete={item.id !== undefined ? () => handleDeleteItem(item.id!) : undefined}
                />
              </div>
            </div>
          </div>
        </Fragment>
      )
    },
    [feed, feed.feedContent, currentFeedItem, handleTitleChange, handleDeleteItem],
  )

  const renderFeedContent = useCallback(() => {
    const now = new Date().getTime()
    let nextItemId: number | undefined = undefined
    let currentItemId: number | undefined = undefined

    const allItems = Object.values(feed.feedContent)
      .flat()
      .filter(item => item && item.timestamp)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
    const nextItem = allItems.find(item => {
      return item.timestamp.getTime() > now
    })
    if (nextItem) {
      nextItemId = nextItem.id
    }

    const currentItems = allItems.filter(item => {
      const startTime = item.timestamp.getTime()

      if (item.calendarEvent && item.calendarEvent.end) {
        const endTimestamp =
          item.calendarEvent.end < item.timestamp.getTime() / 100
            ? item.calendarEvent.end * 1000
            : item.calendarEvent.end

        return startTime <= now && now <= endTimestamp
      }

      const defaultEndTime = startTime + 30 * 60 * 1000
      return startTime <= now && now <= defaultEndTime
    })

    if (currentItems.length > 0) {
      currentItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      const now_time = new Date().getTime() / 1000;
      if (currentItems[0].calendarEvent && currentItems[0].calendarEvent?.start < now_time && currentItems[0].calendarEvent?.end > now_time) {
        currentItemId = currentItems[0].id
      }
    }

    const keyTimestamp = Object.entries(feed.feedContent)
      .filter(([_, feedItems]) => feedItems && feedItems.length > 0 && feedItems[0]?.timestamp)
      .map(([key, feedItems]) => ({
        key: key,
        timestamp: feedItems[0].timestamp,
      }))
      .filter(item => item.key != STATIONARY_ITEMS)

    const orderedKeyTimestamp = KNDateUtils.sortByTimestamp(keyTimestamp, false)

    return orderedKeyTimestamp.map((keyTimestamp, dateGroupIndex) => {
      const key = keyTimestamp.key
      let feedItems = KNDateUtils.sortByTimestamp(feed.feedContent[key], false)

      if (key === 'COMING UP') {
        const nextFiveEvents = [...feed.feedContent[key]]
          .sort((a, b) => {
            const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp)
            const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp)
            return aTime - bTime
          })
          .slice(0, 5)

        feedItems = KNDateUtils.sortByTimestamp(nextFiveEvents, false)
      }

      if (!feed.isRecentDate(key, datesDisplay.past, datesDisplay.future)) {
        return null
      }

      const isCollapsed = collapsedSections[key]

      return (
        <div
          key={`${key}-${feedItems.length}`}
          className="relative flex-col mb-4 w-full max-w-[22.5em] h-auto"
        >
          <div
            className={`font-Lora flex cursor-pointer relative pl-12
              tracking-[1.44px] uppercase font-bold my-1 leading-4
              ${getColorClassForKey(key)} ${key.includes('Today') ? 'text-ks-warm-grey-950' : 'text-ks-warm-grey-800'}`}
            onClick={() => toggleSection(key)}
          >
            <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center">
              <img
                src={FeedSidebarArrowDown}
                className={`w-4 h-1.5 transition-transform duration-100
                  ${key.includes('Today') ? '' : 'opacity-70'}
                  ${isCollapsed ? 'rotate-[-90deg]' : ''}`}
                alt="Toggle section"
              />
            </div>
            <div className="font-Lora text-xs font-bold leading-4 tracking-[0.097em]">{key}</div>
          </div>
          <div
            className={`
              overflow-hidden transition-all duration-200 ease-in-out mx-0
              ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}
            `}
          >
            {feedItems.map((item, index) =>
              renderFeedItem(
                item,
                item.id ? item.id : index,
                dateGroupIndex,
                key,
                nextItemId,
                currentItemId,
              ),
            )}
          </div>
        </div>
      )
    })
  }, [feed, feed.feedContent, collapsedSections, datesDisplay.past, datesDisplay.future])

  function getColorClassForKey(key: string): string {
    return key.includes('Today') ? 'text-warm-grey-950' : 'text-warm-grey-600'
  }
  return (
    <div className={`pt-6 flex-none h-full ${open ? 'min-w-[22.5em]' : ''}`}>
      {!open && (
        <div
          className="TightShadow cursor-pointer absolute top-12 left-4 bg-white hover:bg-gray-100 transition-colors duration-200 rounded-full"
          onClick={() => setOpen(true)}
          style={{
            zIndex: 9999,
          }}
        >
          <img className="h-5" src={OpenSidebarIcon} alt="Open Sidebar" />
        </div>
      )}
      {open && (
        <div
          className={`
            ease-in-out h-full w-full
            ${open ? '' : 'w-0 overflow-hidden'}
          `}
        >
          <div className="bg-ks-bg-main flex flex-col h-full">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden h-full">
              {feed.feedContent[STATIONARY_ITEMS] &&
                feed.feedContent[STATIONARY_ITEMS].map((item, index) => (
                  <Fragment key={index}>
                    <div
                      className={`flex items-center text-left ${currentFeedItem?.id === item.id ? '' : ''}`}
                      id={`ThreadCard${item.id}`}
                      ref={currentFeedItem?.id === item.id ? threadCardRef : null}
                    >
                      <div className="w-full">
                        <FixedThreadPreviewCard
                          title={
                            item && typeof item.getTitle === 'function'
                              ? item.getTitle()
                              : item?.title || 'Email Autopilot'
                          }
                          isSelected={currentFeedItem?.id === item.id}
                          setIsSelected={() => {
                            feed.selectFeedItem(STATIONARY_ITEMS, item.id)

                            if (item.title === 'Email Autopilot') {
                              feed.selectEmailCategory()
                            }
                          }}
                          itemCount={item.title === 'Email Autopilot' ? totalEmailCount : undefined}
                        />
                      </div>
                    </div>
                  </Fragment>
                ))}
              {feed.feedContent[STATIONARY_ITEMS] && (
                <div className="my-4 px-6.5 flex justify-center">
                  <hr className="border-1 border-gray-300 w-4/5" />
                </div>
              )}
              {renderFeedContent()}
            </div>
            <div className="flex flex-row justify-center">
              <div className="CenterWorkspace_DiscordBtn flex justify-center p-3 py-4">
                {isAnyRecording ? (
                  <Tooltip
                    label="Meeting recording in progress"
                    component={
                      <Button
                        label="Ad hoc meeting"
                        icon={<img src={Mic} alt="Microphone" />}
                        variant={ButtonVariant.startMeetingGrey}
                        onClick={() => feed.createNewMeeting()}
                        disabled={isAnyRecording}
                      />
                    }
                    variant={TooltipVariant.inProgressMeeting}
                  />
                ) : (
                  <Button
                    label="Ad hoc meeting"
                    icon={<img src={Mic} alt="Microphone" />}
                    variant={ButtonVariant.startMeetingGrey}
                    onClick={() => feed.createNewMeeting()}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedSidebar
