interface ScoutWatchlistItem {
  id: string
  title: string
  summary: string
  dueAt?: Date
  source: 'meeting' | 'email' | 'tool'
  confidence: 'high' | 'medium' | 'low'
}

interface ScoutWatchlistProps {
  items: ScoutWatchlistItem[]
}

function formatDueAt(dueAt?: Date) {
  if (!dueAt) {
    return 'No due date'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return formatter.format(dueAt)
}

export function ScoutWatchlist({ items }: ScoutWatchlistProps) {
  if (!items.length) {
    return (
      <div className="mb-4 rounded-lg border border-ks-warm-grey-200 bg-white p-3">
        <div className="font-semibold text-sm text-ks-text-primary">Scout Watchlist</div>
        <div className="mt-2 text-sm text-ks-text-secondary">No follow-through items right now.</div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-ks-warm-grey-200 bg-white p-3">
      <div className="font-semibold text-sm text-ks-text-primary">Scout Watchlist</div>
      <div className="mt-2 space-y-2">
        {items.map(item => (
          <div key={item.id} className="rounded-md border border-ks-warm-grey-100 bg-ks-warm-grey-50 px-3 py-2">
            <div className="flex justify-between text-xs uppercase tracking-[0.04em] text-ks-text-secondary">
              <span>{item.source}</span>
              <span>{item.confidence} confidence</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-ks-text-primary">{item.title}</div>
            <div className="text-sm text-ks-text-secondary">{item.summary}</div>
            <div className="mt-1 text-xs text-ks-text-secondary">Due: {formatDueAt(item.dueAt)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export type { ScoutWatchlistItem }
