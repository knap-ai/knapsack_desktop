import { useEffect, useState } from 'react'
import { KN_API_MEETING_INSIGHTS } from 'src/utils/constants'

interface MeetingInsight {
  id: number
  threadId: number
  elapsedMinutes: number
  insight: string
  createdAt: number
}

interface InsightsViewProps {
  threadId: number
  onClose: () => void
}

const InsightsView: React.FC<InsightsViewProps> = ({ threadId, onClose }) => {
  const [insights, setInsights] = useState<MeetingInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!threadId) return
    setLoading(true)
    setError(null)
    fetch(`${KN_API_MEETING_INSIGHTS}/${threadId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setInsights(data.data ?? [])
        } else {
          setError('Failed to load insights')
        }
      })
      .catch(() => setError('Failed to load insights'))
      .finally(() => setLoading(false))
  }, [threadId])

  return (
    <div className="flex flex-col h-full w-72 border-l border-ks-warm-grey-200 bg-white overflow-hidden flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ks-warm-grey-200">
        <span className="text-sm font-semibold text-gray-800">Meeting Insights</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <p className="text-sm text-gray-400 text-center mt-8">Loading insights...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center mt-8">{error}</p>
        )}
        {!loading && !error && insights.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            No insights recorded for this meeting.
          </p>
        )}
        {!loading && !error && insights.length > 0 && (
          <ol className="flex flex-col gap-4">
            {insights.map(insight => (
              <li key={insight.id} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-ks-orange-600">
                  {insight.elapsedMinutes} min
                </span>
                <p className="text-sm text-gray-700 leading-snug">{insight.insight}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export default InsightsView
