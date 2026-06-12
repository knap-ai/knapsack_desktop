import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

import { FeedItem } from 'src/api/feed_items'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import { ThreadType } from 'src/api/threads'
import { getAppVersion } from 'src/utils/app'
import { Connection, ConnectionKeys, hasGoogleCalendar } from 'src/api/connections'
import { TabChoices } from 'src/components/TabBar'
import { listWorkspaces, Workspace } from 'src/api/workspaces'
import { RecordingContextProps } from 'src/components/organisms/MeetingNotesMode/RecordingContext'

import './style.scss'

interface NotetakerSidebarProps {
  feed: IFeed
  connections: Record<string, Connection>
  currentTab: TabChoices
  onTabChange: (tab: TabChoices, subView?: 'meetings' | 'chat') => void
  onQuickNote: () => void
  onConnectCalendar: () => void
  onMeetingSelect?: () => void
  activeView?: 'home' | 'chat'
  onLibraryWorkspaceOpen?: (ws: Workspace) => void
  recordingHandlers?: RecordingContextProps
}

function NotetakerSidebar({
  feed,
  connections,
  currentTab,
  onTabChange,
  onQuickNote,
  onConnectCalendar,
  onMeetingSelect,
  activeView = 'home',
  onLibraryWorkspaceOpen,
  recordingHandlers,
}: NotetakerSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')
  const [libraryResults, setLibraryResults] = useState<Workspace[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAppVersion().then(v => setAppVersion(v))
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setIsCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hasCalendarConnected = useMemo(
    () => !!(hasGoogleCalendar(connections) || connections[ConnectionKeys.MICROSOFT_CALENDAR]),
    [connections],
  )

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLibraryResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    listWorkspaces()
      .then(res => {
        if (res.success) {
          setLibraryResults(
            res.data.filter(
              (ws: Workspace) =>
                ws.name?.toLowerCase().includes(q) || ws.description?.toLowerCase().includes(q),
            ),
          )
        }
      })
      .catch(() => {})
  }, [searchQuery])

  const currentFeedItem = feed.currentFeedItem()

  const getMeetingEndTime = useCallback((item: FeedItem) => {
    const start = item.timestamp.getTime()
    if (!item.calendarEvent?.end) return start + 30 * 60 * 1000
    return item.calendarEvent.end < start / 100 ? item.calendarEvent.end * 1000 : item.calendarEvent.end
  }, [])

  const upcomingEvents = useMemo(() => {
    if (!feed.feedContent) return {}
    const now = Date.now()
    const events: { item: FeedItem; key: string }[] = []
    const seenEventKeys = new Set<string>()
    Object.entries(feed.feedContent).forEach(([key, items]) => {
      if (key === STATIONARY_ITEMS) return
      items.forEach(item => {
        if (!item.calendarEvent) return
        const dedupeKey = item.calendarEvent.event_id || `${item.title}_${Math.floor(item.timestamp.getTime() / 60000)}`
        if (seenEventKeys.has(dedupeKey)) return
        if (getMeetingEndTime(item) >= now) {
          seenEventKeys.add(dedupeKey)
          events.push({ item, key })
        }
      })
    })
    events.sort((a, b) => a.item.timestamp.getTime() - b.item.timestamp.getTime())
    const grouped: Record<string, { item: FeedItem; key: string }[]> = {}
    events.forEach(ev => {
      const dateKey = dayjs(ev.item.timestamp).format('YYYY-MM-DD')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(ev)
    })
    return grouped
  }, [feed.feedContent, getMeetingEndTime])

  const pastNotes = useMemo(() => {
    if (!feed.feedContent) return {}
    const now = Date.now()
    const groups: Record<string, { item: FeedItem; key: string }[]> = {}
    Object.entries(feed.feedContent).forEach(([key, items]) => {
      if (key === STATIONARY_ITEMS) return
      items.forEach(item => {
        const hasMeetingNotes = item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)
        const meetingHasEnded = !item.calendarEvent || getMeetingEndTime(item) < now
        if (hasMeetingNotes && item.timestamp.getTime() < now && meetingHasEnded) {
          if (!groups[key]) groups[key] = []
          groups[key].push({ item, key })
        }
      })
    })
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.item.timestamp.getTime() - a.item.timestamp.getTime())
    })
    return groups
  }, [feed.feedContent, getMeetingEndTime])

  const orderedPastKeys = useMemo(() => {
    const keys = Object.entries(pastNotes)
      .filter(([_, items]) => (items as { item: FeedItem; key: string }[]).length > 0)
      .map(([key, items]) => ({
        key,
        timestamp: (items as { item: FeedItem; key: string }[])[0].item.timestamp,
      }))
    return KNDateUtils.sortByTimestamp(keys, false).map(k => k.key)
  }, [pastNotes])

  const isNowMeeting = useCallback((item: FeedItem) => {
    const now = Date.now()
    const start = item.timestamp.getTime()
    const end = getMeetingEndTime(item)
    return start <= now && now <= end
  }, [getMeetingEndTime])

  const formatTimeRange = useCallback((item: FeedItem) => {
    const start = dayjs(item.timestamp).format('h:mm A')
    if (item.calendarEvent?.end) {
      const endTs =
        item.calendarEvent.end < item.timestamp.getTime() / 100
          ? item.calendarEvent.end * 1000
          : item.calendarEvent.end
      return `${start} \u2013 ${dayjs(endTs).format('h:mm A')}`
    }
    return start
  }, [])

  const filterBySearch = useCallback(
    (items: { item: FeedItem; key: string }[]) => {
      if (!searchQuery.trim()) return items
      const q = searchQuery.toLowerCase()
      return items.filter(({ item }) => {
        const title = (typeof item.getTitle === 'function' ? item.getTitle() : item.title) || ''
        const subtitle = item.getSubtitle?.() || ''
        return title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q)
      })
    },
    [searchQuery],
  )

  const isChatActive =
    currentTab === TabChoices.Openclaw ||
    (currentTab === TabChoices.Meeting && activeView === 'chat')
  const isEmailActive = currentTab === TabChoices.Email
  const isLibraryActive = currentTab === TabChoices.Library
  const isGBrainActive = currentTab === TabChoices.GBrain

  const chatIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )

  const emailIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )

  const libraryIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )

  const gbrainIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.67-3.6A3 3 0 0 1 3 12a3 3 0 0 1 2.37-2.94A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.67-3.6A3 3 0 0 0 21 12a3 3 0 0 0-2.37-2.94A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  )

  const noteIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )

  if (isCollapsed) {
    return (
      <div className="notetaker-sidebar notetaker-sidebar--collapsed">
        <button
          className="notetaker-sidebar__icon-btn"
          onClick={() => setIsCollapsed(false)}
          title="Expand sidebar"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <div className="notetaker-sidebar__icon-bottom">
          <button className="notetaker-sidebar__icon-btn" onClick={onQuickNote} title="New note">
            {noteIcon}
          </button>
          <button
            className={`notetaker-sidebar__icon-btn ${isChatActive ? 'notetaker-sidebar__icon-btn--active' : ''}`}
            onClick={() => onTabChange(TabChoices.Openclaw)}
            title="Chat"
          >
            {chatIcon}
          </button>
          <button
            className={`notetaker-sidebar__icon-btn ${isEmailActive ? 'notetaker-sidebar__icon-btn--active' : ''}`}
            onClick={() => onTabChange(TabChoices.Email)}
            title="Email Autopilot"
          >
            {emailIcon}
          </button>
          <button
            className={`notetaker-sidebar__icon-btn ${isLibraryActive ? 'notetaker-sidebar__icon-btn--active' : ''}`}
            onClick={() => onTabChange(TabChoices.Library)}
            title="Library"
          >
            {libraryIcon}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="notetaker-sidebar">
      <button
        className="notetaker-sidebar__collapse-btn"
        onClick={() => setIsCollapsed(true)}
        title="Collapse sidebar"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Search */}
      <div className="notetaker-sidebar__search">
        <div
          className={`notetaker-sidebar__search-box ${searchFocused ? 'notetaker-sidebar__search-box--focused' : ''}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="notetaker-sidebar__search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search meetings & library"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="notetaker-sidebar__search-input"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery('')} className="notetaker-sidebar__search-clear">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <kbd className="notetaker-sidebar__search-shortcut">
              {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl+'}K
            </kbd>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="notetaker-sidebar__content">
        {/* Connect calendar prompt */}
        {!hasCalendarConnected && (
          <div className="notetaker-sidebar__connect-prompt">
            <div className="notetaker-sidebar__connect-prompt-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </div>
            <div className="notetaker-sidebar__connect-prompt-title">Connect your calendar</div>
            <div className="notetaker-sidebar__connect-prompt-desc">
              See upcoming meetings and take notes automatically
            </div>
            <button
              className="notetaker-sidebar__connect-prompt-btn"
              onClick={onConnectCalendar}
            >
              Connect calendar
            </button>
          </div>
        )}

        {/* Coming Up calendar widget */}
        {hasCalendarConnected && Object.keys(upcomingEvents).length > 0 && (
          <div className="notetaker-sidebar__coming-up">
            <h2 className="notetaker-sidebar__section-title">Coming up</h2>
            <div className="notetaker-sidebar__calendar-card">
              {Object.entries(upcomingEvents)
                .slice(0, 5)
                .map(([dateStr, events]) => {
                  const date = dayjs(dateStr)
                  const isToday = date.isSame(dayjs(), 'day')
                  const filteredEvents = isToday
                    ? filterBySearch(events)
                    : filterBySearch(events).slice(0, 4)
                  if (filteredEvents.length === 0) return null
                  return (
                    <div key={dateStr} className="notetaker-sidebar__calendar-day">
                      <div className="notetaker-sidebar__calendar-date">
                        <span className="notetaker-sidebar__calendar-date-num">
                          {date.format('D')}
                        </span>
                        <div className="notetaker-sidebar__calendar-date-meta">
                          <span className="notetaker-sidebar__calendar-month">
                            {date.format('MMMM')}
                          </span>
                          {isToday && <span className="notetaker-sidebar__calendar-today-dot" />}
                          <span className="notetaker-sidebar__calendar-day-name">
                            {date.format('ddd')}
                          </span>
                        </div>
                      </div>
                      <div className="notetaker-sidebar__calendar-events">
                        {filteredEvents.map(({ item, key }) => {
                          const isNow = isNowMeeting(item)
                          const title =
                            typeof item.getTitle === 'function'
                              ? item.getTitle()
                              : item.title || ''
                          const isActivelyRecording = recordingHandlers != null &&
                            item.threads?.some(
                              t => t.threadType === ThreadType.MEETING_NOTES && t.id != null && recordingHandlers.isRecording(t.id)
                            )
                          return (
                            <div
                              key={item.id ?? `cal-${item.calendarEvent?.id ?? title}`}
                              className={`notetaker-sidebar__calendar-event ${isNow ? 'notetaker-sidebar__calendar-event--now' : ''} ${isActivelyRecording ? 'notetaker-sidebar__calendar-event--recording' : ''}`}
                              onClick={() => {
                                if (item.id != null) {
                                  feed.selectFeedItem(key, item.id)
                                } else if (item.calendarEvent) {
                                  feed.openCalendarEvent(item.calendarEvent)
                                }
                                onMeetingSelect?.()
                                onTabChange(TabChoices.Meeting, 'meetings')
                              }}
                            >
                              <div className={`notetaker-sidebar__calendar-event-bar ${isActivelyRecording ? 'notetaker-sidebar__calendar-event-bar--recording' : ''}`} />
                              <div className="notetaker-sidebar__calendar-event-content">
                                <div className="notetaker-sidebar__calendar-event-title-row">
                                  <div className="notetaker-sidebar__calendar-event-title">
                                    {title}
                                  </div>
                                  {!isActivelyRecording && item.threads?.some(
                                    t => t.threadType === ThreadType.MEETING_NOTES && t.recorded,
                                  ) && (
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#6474AC"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="notetaker-sidebar__note-has-notes"
                                      aria-label="Has meeting notes"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                      <line x1="16" y1="13" x2="8" y2="13" />
                                      <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                  )}
                                </div>
                                <div className="notetaker-sidebar__calendar-event-time">
                                  {isActivelyRecording ? (
                                    <span className="notetaker-sidebar__recording-label">
                                      <span className="notetaker-sidebar__recording-dot-pulse" />
                                      Recording
                                    </span>
                                  ) : isNow ? (
                                    <span className="notetaker-sidebar__now-label">
                                      Now &middot;{' '}
                                    </span>
                                  ) : null}
                                  {!isActivelyRecording && formatTimeRange(item)}
                                  {isActivelyRecording && (
                                    <span className="notetaker-sidebar__recording-time">
                                      {' '}&middot; {formatTimeRange(item)}
                                    </span>
                                  )}
                                </div>
                                {isNow && !isActivelyRecording && (
                                  <button
                                    className="notetaker-sidebar__start-now-btn"
                                    onClick={async e => {
                                      e.stopPropagation()
                                      await feed.startCalendarMeeting(item)
                                      onMeetingSelect?.()
                                      onTabChange(TabChoices.Meeting, 'meetings')
                                    }}
                                  >
                                    Start now
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Library search results */}
        {searchQuery.trim() && libraryResults.length > 0 && (
          <div className="notetaker-sidebar__notes-group">
            <div className="notetaker-sidebar__notes-date">Library</div>
            {libraryResults.map(ws => (
              <div
                key={ws.uuid}
                className="notetaker-sidebar__note-card"
                onClick={() => {
                  onTabChange(TabChoices.Library)
                  onLibraryWorkspaceOpen?.(ws)
                }}
              >
                <div className="notetaker-sidebar__note-avatar notetaker-sidebar__note-avatar--library">
                  {libraryIcon}
                </div>
                <div className="notetaker-sidebar__note-info">
                  <div className="notetaker-sidebar__note-title">{ws.name}</div>
                  {ws.description && (
                    <div className="notetaker-sidebar__note-subtitle">{ws.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past notes */}
        {orderedPastKeys.map(dateKey => {
          const items = filterBySearch(pastNotes[dateKey])
          if (!items || items.length === 0) return null
          if (!feed.isRecentDate(dateKey, true, false)) return null
          return (
            <div key={dateKey} className="notetaker-sidebar__notes-group">
              <div className="notetaker-sidebar__notes-date">{dateKey}</div>
              {items.map(({ item, key }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title =
                  typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const subtitle = item.getSubtitle?.() || ''
                const time = dayjs(item.timestamp).format('h:mm A')
                return (
                  <div
                    key={item.id ?? `note-${title}`}
                    className={`notetaker-sidebar__note-card ${isSelected ? 'notetaker-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(key, item.id)
                        onMeetingSelect?.()
                        onTabChange(TabChoices.Meeting, 'meetings')
                      }
                    }}
                  >
                    <div className="notetaker-sidebar__note-avatar">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="notetaker-sidebar__note-info">
                      <div className="notetaker-sidebar__note-title">{title}</div>
                      {subtitle && (
                        <div className="notetaker-sidebar__note-subtitle">{subtitle}</div>
                      )}
                    </div>
                    <div className="notetaker-sidebar__note-meta">
                      {item.threads?.some(
                        t => t.threadType === ThreadType.MEETING_NOTES && t.recorded,
                      ) && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6474AC"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="notetaker-sidebar__note-has-notes"
                          aria-label="Has meeting notes"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      )}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="notetaker-sidebar__note-lock"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="notetaker-sidebar__note-time">{time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Today's notes without meeting threads */}
        {(() => {
          const todayKey = Object.keys(feed.feedContent || {}).find(k => k.includes('Today'))
          if (!todayKey || !feed.feedContent[todayKey]) return null
          const todayItems = filterBySearch(
            feed.feedContent[todayKey]
              .filter(item => !item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES))
              .map(item => ({ item, key: todayKey })),
          )
          if (todayItems.length === 0) return null
          return (
            <div className="notetaker-sidebar__notes-group">
              <div className="notetaker-sidebar__notes-date">Today</div>
              {todayItems.map(({ item }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title =
                  typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const time = dayjs(item.timestamp).format('h:mm A')
                return (
                  <div
                    key={item.id}
                    className={`notetaker-sidebar__note-card ${isSelected ? 'notetaker-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(todayKey, item.id)
                        onMeetingSelect?.()
                        onTabChange(TabChoices.Meeting, 'meetings')
                      }
                    }}
                  >
                    <div className="notetaker-sidebar__note-avatar">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="notetaker-sidebar__note-info">
                      <div className="notetaker-sidebar__note-title">{title}</div>
                    </div>
                    <div className="notetaker-sidebar__note-meta">
                      <span className="notetaker-sidebar__note-time">{time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Bottom action bar */}
      <div className="notetaker-sidebar__bottom">
        <div className="notetaker-sidebar__bottom-actions">
          <button
            className="notetaker-sidebar__bottom-action"
            onClick={onQuickNote}
            title="New note"
          >
            {noteIcon}
            <span>New Note</span>
          </button>
          <button
            className={`notetaker-sidebar__bottom-action ${isChatActive ? 'notetaker-sidebar__bottom-action--active' : ''}`}
            onClick={() => onTabChange(TabChoices.Openclaw)}
            title="Chat"
          >
            {chatIcon}
            <span>Chat</span>
          </button>
          <button
            className={`notetaker-sidebar__bottom-action ${isEmailActive ? 'notetaker-sidebar__bottom-action--active' : ''}`}
            onClick={() => onTabChange(TabChoices.Email)}
            title="Email Autopilot"
          >
            {emailIcon}
            <span>Email</span>
          </button>
          <button
            className={`notetaker-sidebar__bottom-action ${isGBrainActive ? 'notetaker-sidebar__bottom-action--active' : ''}`}
            onClick={() => onTabChange(TabChoices.GBrain)}
            title="GBrain"
          >
            {gbrainIcon}
            <span>GBrain</span>
          </button>
        </div>
        {appVersion && (
          <div className="notetaker-sidebar__version">Knapsack v{appVersion}</div>
        )}
      </div>
    </div>
  )
}

export default NotetakerSidebar
