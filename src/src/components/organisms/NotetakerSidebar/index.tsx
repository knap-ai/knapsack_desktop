import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

import { FeedItem } from 'src/api/feed_items'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import { ThreadType } from 'src/api/threads'
import { getAppVersion } from 'src/utils/app'

import './style.scss'

export type NotetakerView = 'home' | 'chat'

interface NotetakerSidebarProps {
  feed: IFeed
  onQuickNote: () => void
  onSettingsClick: () => void
  onChatClick?: () => void
  onHomeClick?: () => void
  activeView?: NotetakerView
}

function NotetakerSidebar({ feed, onQuickNote, onSettingsClick, onChatClick, onHomeClick, activeView: controlledView }: NotetakerSidebarProps) {
  const [internalView, setInternalView] = useState<NotetakerView>('home')
  const activeView = controlledView ?? internalView
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAppVersion().then(v => setAppVersion(v))
  }, [])

  // Ctrl+K / Cmd+K shortcut
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

  const currentFeedItem = feed.currentFeedItem()

  // Build the "Coming up" events for the calendar widget
  const upcomingEvents = useMemo(() => {
    if (!feed.feedContent) return []
    const now = Date.now()

    const events: { item: FeedItem; key: string }[] = []
    Object.entries(feed.feedContent).forEach(([key, items]) => {
      if (key === STATIONARY_ITEMS) return
      items.forEach(item => {
        if (item.calendarEvent || (item.timestamp && item.timestamp.getTime() > now - 3600000)) {
          events.push({ item, key })
        }
      })
    })

    events.sort((a, b) => a.item.timestamp.getTime() - b.item.timestamp.getTime())

    // Group by date
    const grouped: Record<string, { item: FeedItem; key: string }[]> = {}
    events.forEach(ev => {
      const dateKey = dayjs(ev.item.timestamp).format('YYYY-MM-DD')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(ev)
    })

    return grouped
  }, [feed.feedContent])

  // Build past notes list grouped by date
  const pastNotes = useMemo(() => {
    if (!feed.feedContent) return {}

    const now = Date.now()
    const groups: Record<string, { item: FeedItem; key: string }[]> = {}

    Object.entries(feed.feedContent).forEach(([key, items]) => {
      if (key === STATIONARY_ITEMS) return
      items.forEach(item => {
        const hasMeetingNotes = item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES)
        if (hasMeetingNotes && item.timestamp.getTime() < now) {
          const dateKey = key
          if (!groups[dateKey]) groups[dateKey] = []
          groups[dateKey].push({ item, key })
        }
      })
    })

    // Sort within each group
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.item.timestamp.getTime() - a.item.timestamp.getTime())
    })

    return groups
  }, [feed.feedContent])

  const orderedPastKeys = useMemo(() => {
    const keys = Object.entries(pastNotes)
      .filter(([_, items]: [string, { item: FeedItem; key: string }[]]) => items.length > 0)
      .map(([key, items]: [string, { item: FeedItem; key: string }[]]) => ({
        key,
        timestamp: items[0].item.timestamp,
      }))

    return KNDateUtils.sortByTimestamp(keys, false).map(k => k.key)
  }, [pastNotes])

  const isNowMeeting = useCallback((item: FeedItem) => {
    const now = Date.now()
    const start = item.timestamp.getTime()
    const end = item.calendarEvent?.end
      ? (item.calendarEvent.end < start / 100 ? item.calendarEvent.end * 1000 : item.calendarEvent.end)
      : start + 30 * 60 * 1000
    return start <= now && now <= end
  }, [])

  const formatTimeRange = useCallback((item: FeedItem) => {
    const start = dayjs(item.timestamp).format('h:mm A')
    if (item.calendarEvent?.end) {
      const endTs = item.calendarEvent.end < item.timestamp.getTime() / 100
        ? item.calendarEvent.end * 1000
        : item.calendarEvent.end
      const end = dayjs(endTs).format('h:mm A')
      return `${start} \u2013 ${end}`
    }
    return start
  }, [])

  // Filter items by search
  const filterBySearch = useCallback((items: { item: FeedItem; key: string }[]) => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(({ item }) => {
      const title = (typeof item.getTitle === 'function' ? item.getTitle() : item.title) || ''
      const subtitle = item.getSubtitle?.() || ''
      return title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q)
    })
  }, [searchQuery])

  return (
    <div className="notetaker-sidebar">
      {/* Search */}
      <div className="notetaker-sidebar__search">
        <div className={`notetaker-sidebar__search-box ${searchFocused ? 'notetaker-sidebar__search-box--focused' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notetaker-sidebar__search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="notetaker-sidebar__search-input"
          />
          <kbd className="notetaker-sidebar__search-shortcut">
            {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl+'}K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="notetaker-sidebar__nav">
        <button
          className={`notetaker-sidebar__nav-item ${activeView === 'home' ? 'notetaker-sidebar__nav-item--active' : ''}`}
          onClick={() => { setInternalView('home'); onHomeClick?.() }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>
        <button
          className={`notetaker-sidebar__nav-item ${activeView === 'chat' ? 'notetaker-sidebar__nav-item--active' : ''}`}
          onClick={() => { setInternalView('chat'); onChatClick?.() }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
      </nav>

      {/* Scrollable content */}
      <div className="notetaker-sidebar__content">
        {/* Coming Up calendar widget */}
        {Object.keys(upcomingEvents).length > 0 && (
          <div className="notetaker-sidebar__coming-up">
            <h2 className="notetaker-sidebar__section-title">Coming up</h2>
            <div className="notetaker-sidebar__calendar-card">
              {Object.entries(upcomingEvents).slice(0, 5).map(([dateStr, events]) => {
                const date = dayjs(dateStr)
                const isToday = date.isSame(dayjs(), 'day')
                const filteredEvents = filterBySearch(events).slice(0, 4)
                if (filteredEvents.length === 0) return null

                return (
                  <div key={dateStr} className="notetaker-sidebar__calendar-day">
                    <div className="notetaker-sidebar__calendar-date">
                      <span className="notetaker-sidebar__calendar-date-num">{date.format('D')}</span>
                      <div className="notetaker-sidebar__calendar-date-meta">
                        <span className="notetaker-sidebar__calendar-month">{date.format('MMMM')}</span>
                        {isToday && <span className="notetaker-sidebar__calendar-today-dot" />}
                        <span className="notetaker-sidebar__calendar-day-name">{date.format('ddd')}</span>
                      </div>
                    </div>
                    <div className="notetaker-sidebar__calendar-events">
                      {filteredEvents.map(({ item, key }) => {
                        const isNow = isNowMeeting(item)
                        const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                        return (
                          <div
                            key={item.id ?? `cal-${item.calendarEvent?.id ?? title}`}
                            className={`notetaker-sidebar__calendar-event ${isNow ? 'notetaker-sidebar__calendar-event--now' : ''}`}
                            onClick={() => {
                              if (item.id != null) {
                                feed.selectFeedItem(key, item.id)
                              } else if (item.calendarEvent) {
                                feed.openCalendarEvent(item.calendarEvent)
                              }
                            }}
                          >
                            <div className="notetaker-sidebar__calendar-event-bar" />
                            <div className="notetaker-sidebar__calendar-event-content">
                              <div className="notetaker-sidebar__calendar-event-title">{title}</div>
                              <div className="notetaker-sidebar__calendar-event-time">
                                {isNow && <span className="notetaker-sidebar__now-label">Now &middot; </span>}
                                {formatTimeRange(item)}
                              </div>
                            </div>
                            {isNow && (
                              <button
                                className="notetaker-sidebar__start-now-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (item.id != null) {
                                    feed.selectFeedItem(key, item.id)
                                  }
                                  feed.createNewMeeting()
                                }}
                              >
                                Start now
                              </button>
                            )}
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

        {/* Past notes list */}
        {orderedPastKeys.map(dateKey => {
          const items = filterBySearch(pastNotes[dateKey])
          if (!items || items.length === 0) return null
          if (!feed.isRecentDate(dateKey, true, false)) return null

          return (
            <div key={dateKey} className="notetaker-sidebar__notes-group">
              <div className="notetaker-sidebar__notes-date">{dateKey}</div>
              {items.map(({ item, key }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const subtitle = item.getSubtitle?.() || ''
                const time = dayjs(item.timestamp).format('h:mm A')

                return (
                  <div
                    key={item.id ?? `note-${title}`}
                    className={`notetaker-sidebar__note-card ${isSelected ? 'notetaker-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(key, item.id)
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notetaker-sidebar__note-lock">
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

        {/* Today section for notes without meeting threads */}
        {(() => {
          const todayKey = Object.keys(feed.feedContent || {}).find(k => k.includes('Today'))
          if (!todayKey || !feed.feedContent[todayKey]) return null

          const todayItems = filterBySearch(
            feed.feedContent[todayKey]
              .filter(item => !item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES))
              .map(item => ({ item, key: todayKey }))
          )
          if (todayItems.length === 0) return null

          return (
            <div className="notetaker-sidebar__notes-group">
              <div className="notetaker-sidebar__notes-date">Today</div>
              {todayItems.map(({ item }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const time = dayjs(item.timestamp).format('h:mm A')

                return (
                  <div
                    key={item.id}
                    className={`notetaker-sidebar__note-card ${isSelected ? 'notetaker-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(todayKey, item.id)
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

      {/* Bottom bar */}
      <div className="notetaker-sidebar__bottom">
        <div className="notetaker-sidebar__bottom-actions">
          <button
            className="notetaker-sidebar__bottom-btn"
            onClick={onQuickNote}
            title="Quick note"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="notetaker-sidebar__bottom-btn"
            onClick={onSettingsClick}
            title="Settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
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
