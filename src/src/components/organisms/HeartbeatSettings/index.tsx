import { useCallback, useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8897/api/knapsack/heartbeat'

interface HeartbeatConfig {
  id: number
  enabled: boolean
  intervalMinutes: number
  checkEmails: boolean
  checkCalendar: boolean
  checkDocuments: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
  lastRunAt: number | null
  createdAt: number | null
  updatedAt: number | null
}

interface HeartbeatLogEntry {
  id: number
  runAt: number
  contextSummary: string | null
  decision: string
  notificationSent: boolean
  notificationContent: string | null
  createdAt: number | null
}

const INTERVAL_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
]

function formatRelativeTime(ts: number | null): string {
  if (!ts) return 'never'
  const now = Math.floor(Date.now() / 1000)
  const diff = now - ts
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const HeartbeatSettings = () => {
  const [config, setConfig] = useState<HeartbeatConfig | null>(null)
  const [logs, setLogs] = useState<HeartbeatLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/config`)
      const data = await resp.json()
      if (data.success) {
        setConfig(data.data)
      }
    } catch (e) {
      console.error('[HeartbeatSettings] Failed to fetch config:', e)
      setError('Failed to load heartbeat settings')
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/logs`)
      const data = await resp.json()
      if (data.success) {
        setLogs(data.data)
      }
    } catch (e) {
      console.error('[HeartbeatSettings] Failed to fetch logs:', e)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchConfig(), fetchLogs()]).then(() => setLoading(false))
  }, [fetchConfig, fetchLogs])

  const updateConfig = useCallback(
    async (updates: Partial<HeartbeatConfig>) => {
      try {
        setError(null)
        const resp = await fetch(`${API_BASE}/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        const data = await resp.json()
        if (data.success) {
          setConfig(data.data)
        } else {
          setError(data.error || 'Failed to update settings')
        }
      } catch (e) {
        console.error('[HeartbeatSettings] Failed to update config:', e)
        setError('Failed to update settings')
      }
    },
    [],
  )

  const handleTrigger = useCallback(async () => {
    setTriggering(true)
    setError(null)
    try {
      const resp = await fetch(`${API_BASE}/trigger`, { method: 'POST' })
      const data = await resp.json()
      if (data.success) {
        // Refresh logs to show the new entry
        await fetchLogs()
        await fetchConfig()
      } else {
        setError(data.error || 'Trigger failed')
      }
    } catch (e) {
      console.error('[HeartbeatSettings] Trigger failed:', e)
      setError('Failed to trigger heartbeat check')
    } finally {
      setTriggering(false)
    }
  }, [fetchLogs, fetchConfig])

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="text-sm font-medium text-zinc-700">Heartbeat</div>
        <div className="text-xs text-gray-400 animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-6 flex flex-col gap-4">
        <div className="text-sm font-medium text-zinc-700">Heartbeat</div>
        <div className="text-xs text-red-500">Failed to load heartbeat settings</div>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-700">Heartbeat</div>
        <div className="flex items-center gap-2">
          {config.lastRunAt && (
            <span className="text-[10px] text-gray-400">
              Last run: {formatRelativeTime(config.lastRunAt)}
            </span>
          )}
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              config.enabled
                ? 'bg-green-50 text-green-700'
                : 'bg-zinc-100 text-zinc-500'
            }`}
          >
            {config.enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-black">Enable heartbeat monitoring</span>
          <span className="text-[10px] text-gray-400">Linked to proactive mode in chat</span>
        </div>
        <button
          onClick={() => updateConfig({ enabled: !config.enabled } as any)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            config.enabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              config.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>

      {/* Interval selector */}
      <div className="flex items-center justify-between h-[36px]">
        <span className="text-sm text-black">Check interval</span>
        <select
          value={config.intervalMinutes.toString()}
          onChange={e =>
            updateConfig({ intervalMinutes: parseInt(e.target.value) } as any)
          }
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 appearance-none"
        >
          {INTERVAL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data source checkboxes */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 font-medium">Monitor</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.checkEmails}
            onChange={() =>
              updateConfig({ checkEmails: !config.checkEmails } as any)
            }
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-black">Emails</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.checkCalendar}
            onChange={() =>
              updateConfig({ checkCalendar: !config.checkCalendar } as any)
            }
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-black">Calendar</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.checkDocuments}
            onChange={() =>
              updateConfig({ checkDocuments: !config.checkDocuments } as any)
            }
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-black">Documents</span>
        </label>
      </div>

      {/* Quiet hours */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 font-medium">Quiet hours</span>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={config.quietHoursStart || ''}
            onChange={e =>
              updateConfig({ quietHoursStart: e.target.value || null } as any)
            }
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="Start"
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="time"
            value={config.quietHoursEnd || ''}
            onChange={e =>
              updateConfig({ quietHoursEnd: e.target.value || null } as any)
            }
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="End"
          />
        </div>
        <span className="text-[10px] text-gray-400">
          No heartbeat checks during quiet hours
        </span>
      </div>

      {/* Trigger now button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="px-3 py-1.5 text-xs bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {triggering ? 'Checking...' : 'Check now'}
        </button>
      </div>

      {/* Recent logs */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs text-gray-500 font-medium">Recent activity</span>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {logs.slice(0, 10).map(log => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-1.5 px-2 rounded bg-zinc-50 text-[11px]"
              >
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    log.notificationSent ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">
                      {log.decision === 'notify' ? 'Notified' : 'Silent'}
                    </span>
                    <span className="text-gray-400">
                      {formatRelativeTime(log.runAt)}
                    </span>
                  </div>
                  {log.notificationContent && (
                    <p className="text-gray-500 mt-0.5 truncate">
                      {log.notificationContent}
                    </p>
                  )}
                  {log.contextSummary && (
                    <p className="text-gray-400 mt-0.5">{log.contextSummary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HeartbeatSettings
