import { ReactNode, useState } from 'react'

/** Keep a compact preview without silently hiding the rest of a day's calendars. */
export default function UpcomingCalendarEvents<T>({
  items,
  renderItem,
  dateLabel,
  showAll = false,
}: {
  items: T[]
  renderItem: (item: T) => ReactNode
  dateLabel: string
  showAll?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = showAll || expanded ? items : items.slice(0, 4)
  return (
    <div className="notetaker-sidebar__calendar-events">
      {visible.map(renderItem)}
      {!showAll && items.length > 4 && (
        <button
          type="button"
          className="notetaker-sidebar__calendar-more"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Show fewer events' : `Show ${items.length - 4} more events`} for ${dateLabel}`}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Show fewer' : `Show ${items.length - 4} more`}
        </button>
      )}
    </div>
  )
}
