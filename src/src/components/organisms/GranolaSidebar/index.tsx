import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

import { FeedItem } from 'src/api/feed_items'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import { ThreadType } from 'src/api/threads'
import { getAppVersion } from 'src/utils/app'

import './style.scss'

interface GranolaSidebarProps {
  feed: IFeed
  onQuickNote: () => void
  onSettingsClick: () => void
  onChatClick?: () => void
  onEmailClick?: () => void
  isAnyRecording?: boolean
}

function GranolaSidebar({ feed, onQuickNote, onSettingsClick, onChatClick, onEmailClick, isAnyRecording }: GranolaSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1)
  const [appVersion, setAppVersion] = useState<string>('')
  const [calendarCollapsed, setCalendarCollapsed] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)

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
      // Escape closes search
      if (e.key === 'Escape' && searchFocused) {
        searchInputRef.current?.blur()
        setSearchQuery('')
        setSelectedSearchIndex(-1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchFocused])

  const currentFeedItem = feed.currentFeedItem()

  // Build the "Coming up" events for the calendar widget
  const upcomingEvents = useMemo(() => {
    if (!feed.feedContent) return {}
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

  // Build flat search results for arrow key navigation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const results: { item: FeedItem; key: string }[] = []

    // Search upcoming events
    Object.values(upcomingEvents).forEach(events => {
      results.push(...filterBySearch(events))
    })

    // Search past notes
    orderedPastKeys.forEach(dateKey => {
      if (pastNotes[dateKey]) {
        results.push(...filterBySearch(pastNotes[dateKey]))
      }
    })

    // Search today items without meeting threads
    const todayKey = Object.keys(feed.feedContent || {}).find(k => k.includes('Today'))
    if (todayKey && feed.feedContent[todayKey]) {
      const todayItems = feed.feedContent[todayKey]
        .filter(item => !item.threads?.some(t => t.threadType === ThreadType.MEETING_NOTES))
        .map(item => ({ item, key: todayKey }))
      results.push(...filterBySearch(todayItems))
    }

    return results
  }, [searchQuery, upcomingEvents, pastNotes, orderedPastKeys, feed.feedContent, filterBySearch])

  // Handle arrow key navigation in search results
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchQuery.trim() || searchResults.length === 0) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSearchIndex(prev => prev <= 0 ? searchResults.length - 1 : prev - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSearchIndex(prev => prev >= searchResults.length - 1 ? 0 : prev + 1)
    } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
      e.preventDefault()
      const selected = searchResults[selectedSearchIndex]
      if (selected.item.id != null) {
        feed.selectFeedItem(selected.key, selected.item.id)
      } else if (selected.item.calendarEvent) {
        feed.openCalendarEvent(selected.item.calendarEvent)
      }
      setSearchQuery('')
      setSelectedSearchIndex(-1)
      searchInputRef.current?.blur()
    }
  }, [searchQuery, searchResults, selectedSearchIndex, feed])

  // Scroll selected search result into view
  useEffect(() => {
    if (selectedSearchIndex >= 0 && searchResultsRef.current) {
      const items = searchResultsRef.current.querySelectorAll('.granola-sidebar__search-result')
      if (items[selectedSearchIndex]) {
        items[selectedSearchIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedSearchIndex])

  return (
    <div className="granola-sidebar">
      {/* Navigation icons at top */}
      <nav className="granola-sidebar__nav">
        <button
          className="granola-sidebar__nav-icon granola-sidebar__nav-icon--active"
          title="Meetings"
        >
          {/* Calendar icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <button
          className="granola-sidebar__nav-icon"
          onClick={onChatClick}
          title="Chat"
        >
          {/* Chat icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button
          className="granola-sidebar__nav-icon"
          onClick={onEmailClick}
          title="Email Autopilot"
        >
          {/* Email icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </button>
        <div className="granola-sidebar__nav-spacer" />
        <button
          className="granola-sidebar__nav-icon"
          onClick={onSettingsClick}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </button>
      </nav>

      {/* Scrollable content */}
      <div className="granola-sidebar__content">
        {/* Ad hoc meeting button - prominent */}
        <div className="granola-sidebar__new-meeting">
          <button
            className="granola-sidebar__new-meeting-btn"
            onClick={onQuickNote}
            disabled={isAnyRecording}
            title={isAnyRecording ? 'Recording in progress' : 'Start a new meeting'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Meeting
          </button>
        </div>

        {/* Coming Up calendar widget - collapsible */}
        {Object.keys(upcomingEvents).length > 0 && (
          <div className="granola-sidebar__coming-up">
            <div className="granola-sidebar__section-header" onClick={() => setCalendarCollapsed(!calendarCollapsed)}>
              <h2 className="granola-sidebar__section-title">Coming up</h2>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`granola-sidebar__collapse-icon ${calendarCollapsed ? 'granola-sidebar__collapse-icon--collapsed' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {!calendarCollapsed && (
              <div className="granola-sidebar__calendar-card">
                {Object.entries(upcomingEvents).slice(0, 5).map(([dateStr, events]) => {
                  const date = dayjs(dateStr)
                  const isToday = date.isSame(dayjs(), 'day')
                  const filteredEvents = filterBySearch(events).slice(0, 4)
                  if (filteredEvents.length === 0) return null

                  return (
                    <div key={dateStr} className="granola-sidebar__calendar-day">
                      <div className="granola-sidebar__calendar-date">
                        <span className="granola-sidebar__calendar-date-num">{date.format('D')}</span>
                        <div className="granola-sidebar__calendar-date-meta">
                          <span className="granola-sidebar__calendar-month">{date.format('MMMM')}</span>
                          {isToday && <span className="granola-sidebar__calendar-today-dot" />}
                          <span className="granola-sidebar__calendar-day-name">{date.format('ddd')}</span>
                        </div>
                      </div>
                      <div className="granola-sidebar__calendar-events">
                        {filteredEvents.map(({ item, key }) => {
                          const isNow = isNowMeeting(item)
                          const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                          return (
                            <div
                              key={item.id ?? `cal-${item.calendarEvent?.id ?? title}`}
                              className={`granola-sidebar__calendar-event ${isNow ? 'granola-sidebar__calendar-event--now' : ''}`}
                              onClick={() => {
                                if (item.id != null) {
                                  feed.selectFeedItem(key, item.id)
                                } else if (item.calendarEvent) {
                                  feed.openCalendarEvent(item.calendarEvent)
                                }
                              }}
                            >
                              <div className="granola-sidebar__calendar-event-bar" />
                              <div className="granola-sidebar__calendar-event-content">
                                <div className="granola-sidebar__calendar-event-title">{title}</div>
                                <div className="granola-sidebar__calendar-event-time">
                                  {isNow && <span className="granola-sidebar__now-label">Now &middot; </span>}
                                  {formatTimeRange(item)}
                                </div>
                              </div>
                              {isNow && (
                                <button
                                  className="granola-sidebar__start-now-btn"
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
            )}
          </div>
        )}

        {/* Past notes list */}
        {orderedPastKeys.map(dateKey => {
          const items = filterBySearch(pastNotes[dateKey])
          if (!items || items.length === 0) return null
          if (!feed.isRecentDate(dateKey, true, false)) return null

          return (
            <div key={dateKey} className="granola-sidebar__notes-group">
              <div className="granola-sidebar__notes-date">{dateKey}</div>
              {items.map(({ item, key }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const time = dayjs(item.timestamp).format('h:mm A')

                return (
                  <div
                    key={item.id ?? `note-${title}`}
                    className={`granola-sidebar__note-card ${isSelected ? 'granola-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(key, item.id)
                      }
                    }}
                  >
                    <div className="granola-sidebar__note-avatar">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="granola-sidebar__note-info">
                      <div className="granola-sidebar__note-title">{title}</div>
                    </div>
                    <div className="granola-sidebar__note-meta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="granola-sidebar__note-lock">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span className="granola-sidebar__note-time">{time}</span>
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
            <div className="granola-sidebar__notes-group">
              <div className="granola-sidebar__notes-date">Today</div>
              {todayItems.map(({ item }) => {
                const isSelected = currentFeedItem?.id === item.id
                const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
                const time = dayjs(item.timestamp).format('h:mm A')

                return (
                  <div
                    key={item.id}
                    className={`granola-sidebar__note-card ${isSelected ? 'granola-sidebar__note-card--selected' : ''}`}
                    onClick={() => {
                      if (item.id != null) {
                        feed.selectFeedItem(todayKey, item.id)
                      }
                    }}
                  >
                    <div className="granola-sidebar__note-avatar">
                      {title.charAt(0).toUpperCase()}
                    </div>
                    <div className="granola-sidebar__note-info">
                      <div className="granola-sidebar__note-title">{title}</div>
                    </div>
                    <div className="granola-sidebar__note-meta">
                      <span className="granola-sidebar__note-time">{time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Bottom bar: search + version */}
      <div className="granola-sidebar__bottom">
        {/* Search results (appear bottom-up above the search bar) */}
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="granola-sidebar__search-results" ref={searchResultsRef}>
            {searchResults.map(({ item, key }, index) => {
              const title = typeof item.getTitle === 'function' ? item.getTitle() : item.title || ''
              const time = dayjs(item.timestamp).format('h:mm A')
              return (
                <div
                  key={item.id ?? `sr-${title}-${index}`}
                  className={`granola-sidebar__search-result ${index === selectedSearchIndex ? 'granola-sidebar__search-result--selected' : ''}`}
                  onClick={() => {
                    if (item.id != null) {
                      feed.selectFeedItem(key, item.id)
                    } else if (item.calendarEvent) {
                      feed.openCalendarEvent(item.calendarEvent)
                    }
                    setSearchQuery('')
                    setSelectedSearchIndex(-1)
                  }}
                >
                  <div className="granola-sidebar__search-result-title">{title}</div>
                  <div className="granola-sidebar__search-result-time">{time}</div>
                </div>
              )
            })}
          </div>
        )}
        {searchQuery.trim() && searchResults.length === 0 && (
          <div className="granola-sidebar__search-results">
            <div className="granola-sidebar__search-no-results">No meetings found</div>
          </div>
        )}
        <div className={`granola-sidebar__search-box ${searchFocused ? 'granola-sidebar__search-box--focused' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="granola-sidebar__search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search meetings"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedSearchIndex(-1) }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => { setTimeout(() => setSearchFocused(false), 150) }}
            onKeyDown={handleSearchKeyDown}
            className="granola-sidebar__search-input"
          />
          <kbd className="granola-sidebar__search-shortcut">
            {navigator.platform?.includes('Mac') ? '\u2318' : 'Ctrl+'}K
          </kbd>
        </div>
        {appVersion && (
          <div className="granola-sidebar__version">Knapsack v{appVersion}</div>
        )}
      </div>
    </div>
  )
}

export default GranolaSidebar
