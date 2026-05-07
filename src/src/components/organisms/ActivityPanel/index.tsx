import './style.scss'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { getFrontendLogs, clearFrontendLogs, FrontendLogEntry } from 'src/utils/frontendLog'
import {
  KN_API_TOKEN_USAGE_SUMMARY,
  KN_API_TOKEN_USAGE_RECENT,
  KN_API_TOKEN_USAGE_BUDGET,
} from 'src/utils/constants'

/** Render a line of PTY output into plain text by interpreting ANSI/CSI cursor
 *  positioning sequences into a virtual line buffer.  This preserves the spatial
 *  layout that TUI apps (e.g. Claude Code) produce via cursor-column moves.
 *
 *  Each logical line gets its own character buffer so that \r (column-reset for
 *  in-place progress bar rewrites) cannot corrupt a different line's content. */
function stripAnsi(text: string): string {
  // One character array per logical line; we join them with \n at the end.
  const lines: string[][] = [[]]
  let col = 0
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    // ── ESC sequences ──
    if (ch === '\x1B') {
      // CSI: ESC [ <params> <final>
      if (text[i + 1] === '[') {
        const m = text.slice(i).match(/^\x1B\[([0-9;?]*)([A-Za-z])/)
        if (m) {
          i += m[0].length
          const params = m[1]
          const code = m[2]
          const n = parseInt(params, 10) || 1

          if (code === 'C') {
            // Cursor forward — insert spaces
            col += n
          } else if (code === 'G') {
            // Absolute column (1-based)
            col = (parseInt(params, 10) || 1) - 1
          } else if (code === 'D') {
            // Cursor back
            col = Math.max(0, col - n)
          } else if (code === 'K') {
            // Erase in line — clear from cursor to end
            const mode = parseInt(params, 10) || 0
            if (mode === 0 || mode === 2) lines[lines.length - 1].length = col
          }
          // All other CSI sequences (colors, etc.) are silently consumed
          continue
        }
      }

      // OSC: ESC ] ... BEL/ST
      const oscMatch = text.slice(i).match(/^\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/)
      if (oscMatch) { i += oscMatch[0].length; continue }

      // Two-char ESC sequences: charset, cursor save/restore, etc.
      const esc2 = text.slice(i).match(/^\x1B[()#][A-Za-z0-9]/) || text.slice(i).match(/^\x1B[78>=A-Za-z]/)
      if (esc2) { i += esc2[0].length; continue }

      // DCS / PM / APC
      const dcs = text.slice(i).match(/^\x1B[P_^][^\x1B]*\x1B\\/)
      if (dcs) { i += dcs[0].length; continue }

      // Unknown ESC — skip it
      i++
      continue
    }

    // 8-bit CSI (0x9B)
    if (ch === '\x9B') {
      const m = text.slice(i).match(/^\x9B[0-9;?]*[A-Za-z]/)
      if (m) { i += m[0].length; continue }
    }

    // Carriage return — move cursor to column 0 of the current line
    if (ch === '\r') { col = 0; i++; continue }

    // Newline — commit current line and start a fresh buffer
    if (ch === '\n') { lines.push([]); col = 0; i++; continue }

    // Tab
    if (ch === '\t') {
      const tabStop = ((col >> 3) + 1) << 3
      const line = lines[lines.length - 1]
      while (col < tabStop) { while (line.length <= col) line.push(' '); col++ }
      i++; continue
    }

    // Strip other control characters
    if (ch.charCodeAt(0) < 0x20 || ch === '\x7F') { i++; continue }

    // Printable character — place into the current line's buffer at col
    const line = lines[lines.length - 1]
    while (line.length < col) line.push(' ')
    line[col] = ch
    col++
    i++
  }

  return lines.map(l => l.join('')).join('\n')
}

// ── Module-level cache for active Claude Code session ──
// Persists across TerminalView mount/unmount cycles so that when the
// Activity Panel reopens, TerminalView can pick up a running (or finished)
// Claude Code session it missed because the event fired before it mounted.

interface ClaudeCodeSessionInfo {
  processId: string
  sessionId: string
  prompt: string
  cwd: string
  isActive: boolean
}

let _activeClaudeCodeSession: ClaudeCodeSessionInfo | null = null
let _moduleListenerInitialized = false

function initModuleListeners() {
  if (_moduleListenerInitialized) return
  _moduleListenerInitialized = true

  listen<{ processId: string; sessionId: string; prompt: string; cwd: string }>(
    'claude-code-started',
    event => {
      _activeClaudeCodeSession = { ...event.payload, isActive: true }
    },
  )

  listen<{ processId: string; sessionId: string; exitCode: number }>(
    'streaming-exit',
    event => {
      if (_activeClaudeCodeSession && event.payload.sessionId === _activeClaudeCodeSession.sessionId) {
        _activeClaudeCodeSession = { ..._activeClaudeCodeSession, isActive: false }
      }
    },
  )
}

initModuleListeners()

type ActivitySubTab = 'logs' | 'apperrors' | 'costs' | 'terminal'

interface TerminalLine {
  type: 'command' | 'stdout' | 'stderr' | 'system'
  text: string
  timestamp: Date
}

interface TokenUsageRecord {
  id: number
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
  requestType: string
  timestamp: number
}

interface ActivityPanelProps {
  onClose?: () => void
}

// Combines /service/status and /service/health into one non-contradictory line.
// The two endpoints measure different things: status checks the LaunchAgent plist
// via launchctl; health probes the HTTP port. The gateway process can be running
// (health OK) while the plist is missing (status: not installed), which is
// confusing when displayed as two independent lines.
function formatServiceStatus(
  status: { running: boolean; installed?: boolean; label?: string },
  health: { gateway_ok: boolean; browser_ok: boolean } | null
): string {
  const gw = health?.gateway_ok ?? false
  const br = health?.browser_ok ?? false
  const lines: string[] = []

  lines.push(`Gateway: ${gw ? 'OK' : 'down'}  |  Browser: ${br ? 'OK' : 'down'}`)

  if (status.running) {
    lines.push(`LaunchAgent: registered${status.label ? ` (${status.label})` : ''}`)
  } else if (gw) {
    // Process is alive but not managed by launchctl — explain rather than contradict
    lines.push(`LaunchAgent: not registered — gateway running standalone (won't auto-restart on crash)\nRun "enable" to register it properly.`)
  } else if (status.installed) {
    lines.push(`LaunchAgent: installed but not running${status.label ? ` (${status.label})` : ''}\nRun "enable" to start it.`)
  } else {
    lines.push(`LaunchAgent: not installed\nRun "enable" to install and start the gateway.`)
  }

  return lines.join('\n')
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<ActivitySubTab>('terminal')

  return (
    <div className="ActivityPanel w-full h-full flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="ActivityPanel__tabs flex px-4 pt-3 bg-white items-center">
        {(['logs', 'apperrors', 'costs', 'terminal'] as ActivitySubTab[]).map(tab => (
          <button
            key={tab}
            className={`ActivityPanel__tab ${activeSubTab === tab ? 'ActivityPanel__tab--active' : ''}`}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab === 'logs' && 'System Logs'}
            {tab === 'apperrors' && 'App Errors'}
            {tab === 'costs' && 'Token Costs'}
            {tab === 'terminal' && 'Terminal'}
          </button>
        ))}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none px-2 py-1"
            title="Close activity panel"
          >
            ×
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeSubTab === 'logs' && <LogsView />}
        {activeSubTab === 'apperrors' && <AppErrorsView />}
        {activeSubTab === 'costs' && <TokenCostsView />}
        {activeSubTab === 'terminal' && <TerminalView />}
      </div>
    </div>
  )
}

/* =========================================================
   LOGS VIEW
   ========================================================= */

// Lines that repeat on a timer during normal gateway operation — not actionable by users.
function isRoutineLogNoise(line: string): boolean {
  const l = line.toLowerCase()
  return l.includes('[diagnostic] stuck session')
    || l.includes('bonjour: watchdog detected non-announced service')
    || l.includes('bonjour: gateway name conflict resolved')
    || l.includes('bonjour: gateway hostname conflict resolved')
    || l.includes('unhandled promise rejection: ciao')
    || (l.includes('security warning') && l.includes('allowinsecureauth'))
}

const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [logType, setLogType] = useState<'all' | 'error'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filterText, setFilterText] = useState('')
  const logContainerRef = useRef<HTMLDivElement>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const lines: string[] = await invoke('kn_read_logs', {
        logType: logType === 'error' ? 'error' : 'all',
        maxLines: 500,
      })
      setLogs(lines)
    } catch (err) {
      console.error('Failed to read logs:', err)
      setLogs([`Failed to load logs: ${err}`])
    } finally {
      setIsLoading(false)
    }
  }, [logType])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const filteredLogs = useMemo(() => {
    if (filterText) {
      const lower = filterText.toLowerCase()
      return logs.filter(line => line.toLowerCase().includes(lower))
    }
    return logs.filter(line => !isRoutineLogNoise(line))
  }, [logs, filterText])

  const getLogLevel = (line: string): string => {
    if (line.includes('[ERROR]')) return 'error'
    if (line.includes('[WARN]')) return 'warn'
    if (line.includes('[INFO]')) return 'info'
    if (line.includes('[DEBUG]')) return 'debug'
    return 'info'
  }

  return (
    <div className="flex flex-col h-full px-4 py-3">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              logType === 'all' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'
            }`}
            onClick={() => setLogType('all')}
          >
            All Logs
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              logType === 'error' ? 'bg-white shadow-sm text-red-600 font-medium' : 'text-gray-500'
            }`}
            onClick={() => setLogType('error')}
          >
            Errors Only
          </button>
        </div>
        <input
          type="text"
          placeholder="Filter logs..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh
        </label>
        <button
          onClick={() => {
            navigator.clipboard.writeText(filteredLogs.join('\n'))
          }}
          disabled={filteredLogs.length === 0}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Copy All
        </button>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Log content */}
      <div
        ref={logContainerRef}
        className="flex-1 bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto font-mono"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-400 text-xs text-center py-10">
            {isLoading ? 'Loading logs...' : 'No log entries found'}
          </div>
        ) : (
          filteredLogs.map((line, i) => {
            const level = getLogLevel(line)
            return (
              <div key={i} className={`ActivityPanel__logEntry ActivityPanel__logEntry--${level}`}>
                {line}
              </div>
            )
          })
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>{filteredLogs.length} entries</span>
        {autoRefresh && <span>Auto-refreshing every 5s</span>}
      </div>
    </div>
  )
}

/* =========================================================
   APP ERRORS VIEW  (in-memory frontend error log)
   ========================================================= */

const AppErrorsView: React.FC = () => {
  const [entries, setEntries] = useState<FrontendLogEntry[]>([])
  const [filterText, setFilterText] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    setEntries(getFrontendLogs().reverse()) // newest first
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  // Scroll to top when new errors arrive
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0
  }, [entries.length])

  const filtered = useMemo(() => {
    if (!filterText) return entries
    const lower = filterText.toLowerCase()
    return entries.filter(
      e =>
        e.message.toLowerCase().includes(lower) ||
        (e.detail && e.detail.toLowerCase().includes(lower)),
    )
  }, [entries, filterText])

  const toggleExpanded = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const copyAll = () => {
    const text = filtered
      .map(e => `[${formatTime(e.timestamp)}] ${e.message}${e.detail ? '\n  ' + e.detail : ''}`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full px-4 py-3">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <input
          type="text"
          placeholder="Filter errors..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-gray-400 bg-white"
        />
        <button
          onClick={copyAll}
          disabled={filtered.length === 0}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          Copy All
        </button>
        <button
          onClick={() => {
            clearFrontendLogs()
            setEntries([])
          }}
          disabled={entries.length === 0}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-red-500 rounded-lg transition-colors disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Error list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col gap-1">
        {filtered.length === 0 ? (
          <div className="text-gray-400 text-xs text-center py-10">
            {entries.length === 0 ? 'No errors recorded this session' : 'No matches'}
          </div>
        ) : (
          filtered.map(entry => {
            const isOpen = expanded.has(entry.id)
            let parsedDetail: Record<string, string> | null = null
            if (entry.detail) {
              try { parsedDetail = JSON.parse(entry.detail) } catch { /* plain string */ }
            }
            return (
              <div
                key={entry.id}
                className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-mono shrink-0 pt-0.5">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span className="flex-1 text-red-800 break-words">{entry.message}</span>
                  {entry.detail && (
                    <button
                      onClick={() => toggleExpanded(entry.id)}
                      className="shrink-0 text-red-400 hover:text-red-600 font-mono"
                      title={isOpen ? 'Hide detail' : 'Show detail'}
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  )}
                </div>
                {isOpen && entry.detail && (
                  <div className="mt-2 pt-2 border-t border-red-100 font-mono text-red-700 space-y-0.5 break-all">
                    {parsedDetail ? (
                      Object.entries(parsedDetail).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-red-400">{k}:</span> {String(v)}
                        </div>
                      ))
                    ) : (
                      <div>{entry.detail}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>{filtered.length} error{filtered.length !== 1 ? 's' : ''} this session</span>
        <span>Auto-refreshing every 3s</span>
      </div>
    </div>
  )
}

/* =========================================================
   TOKEN COSTS VIEW
   ========================================================= */

interface UsageSummary {
  totalCostUsd: number
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  byModel: { provider: string; model: string; requestCount: number; totalInputTokens: number; totalOutputTokens: number; totalCostUsd: number }[]
}

interface BudgetStatus {
  dailyCostUsd: number
  monthlyCostUsd: number
}

export const TokenCostsView: React.FC = () => {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [records, setRecords] = useState<TokenUsageRecord[]>([])
  const [budget, setBudget] = useState<BudgetStatus | null>(null)
  const [days, setDays] = useState(30)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [summaryRes, recentRes, budgetRes] = await Promise.all([
        fetch(`${KN_API_TOKEN_USAGE_SUMMARY}?days=${days}`),
        fetch(`${KN_API_TOKEN_USAGE_RECENT}?limit=100`),
        fetch(KN_API_TOKEN_USAGE_BUDGET),
      ])

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        if (data.success) setSummary(data)
      }
      if (recentRes.ok) {
        const data = await recentRes.json()
        if (data.success) setRecords(data.records || [])
      }
      if (budgetRes.ok) {
        const data = await budgetRes.json()
        if (data.success) setBudget(data)
      }
    } catch {
      // Server may not be running yet - silently fail
    } finally {
      setIsLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const totalTokens = summary
    ? summary.totalInputTokens + summary.totalOutputTokens
    : 0

  return (
    <div className="flex flex-col h-full px-4 py-3 overflow-y-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">Total Tokens ({days}d)</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            {(summary?.totalInputTokens || 0).toLocaleString()} in / {(summary?.totalOutputTokens || 0).toLocaleString()} out
          </div>
        </div>
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">Total Cost ({days}d)</div>
          <div className="text-2xl font-semibold text-gray-900">
            ${(summary?.totalCostUsd || 0).toFixed(4)}
          </div>
        </div>
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">API Calls ({days}d)</div>
          <div className="text-2xl font-semibold text-gray-900">
            {summary?.totalRequests || 0}
          </div>
        </div>
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">Budget (today / 30d)</div>
          <div className="text-lg font-semibold text-gray-900">
            ${(budget?.dailyCostUsd || 0).toFixed(4)}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            ${(budget?.monthlyCostUsd || 0).toFixed(4)} this month
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {[1, 7, 30].map(d => (
            <button
              key={d}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                days === d ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500'
              }`}
              onClick={() => setDays(d)}
            >
              {d === 1 ? 'Today' : `${d}d`}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Model breakdown */}
      {summary?.byModel && summary.byModel.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">By Model</div>
          <div className="flex flex-wrap gap-2">
            {summary.byModel.map((m, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] mr-2">
                  {m.model}
                </span>
                <span className="text-gray-500">{m.requestCount} calls</span>
                <span className="text-gray-400 mx-1">&middot;</span>
                <span className="text-gray-700 font-mono">${(m.totalCostUsd ?? 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent records table */}
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-3">Recent Activity</div>
        {records.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-400 text-sm">No token usage recorded yet</div>
            <div className="text-gray-300 text-xs mt-1">
              Token costs will appear here as you use LLM features
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-4 py-2 font-medium">Time</th>
                  <th className="text-left px-4 py-2 font-medium">Action</th>
                  <th className="text-left px-4 py-2 font-medium">Model</th>
                  <th className="text-right px-4 py-2 font-medium">In</th>
                  <th className="text-right px-4 py-2 font-medium">Out</th>
                  <th className="text-right px-4 py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(record.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{record.requestType || 'LLM Call'}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px]">
                        {record.model}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      {record.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      {record.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      ${record.costUsd.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   TERMINAL VIEW – multi-session with default App & Clawdbot
   ========================================================= */

interface TerminalSession {
  id: string
  label: string
  lines: TerminalLine[]
  cwd: string
  initialCwd: string
  commandHistory: string[]
  historyIndex: number
  inputValue: string
  isExecuting: boolean
  streamingProcessId: string | null
  /** When true this session is backed by a real PTY (interactive SSH works) */
  isPty: boolean
  /** Whether the PTY session has been spawned and is alive */
  ptyAlive: boolean
}

const DEFAULT_SESSIONS: { id: string; label: string; initialCwd: string }[] = [
  { id: 'app', label: 'App', initialCwd: '~/knapsack_desktop' },
  { id: 'clawdbot', label: 'Clawdbot', initialCwd: '~/knapsack_desktop/src/src-tauri/resources/clawdbot' },
]

function makeSession(id: string, label: string, initialCwd: string, isPty = true): TerminalSession {
  return {
    id,
    label,
    lines: [{ type: 'system', text: `${label} terminal ready. Type a command and press Enter.`, timestamp: new Date() }],
    cwd: '',
    initialCwd,
    commandHistory: [],
    historyIndex: -1,
    inputValue: '',
    isExecuting: false,
    streamingProcessId: null,
    isPty,
    ptyAlive: false,
  }
}

const TerminalView: React.FC = () => {
  const [sessions, setSessions] = useState<TerminalSession[]>(() =>
    DEFAULT_SESSIONS.map(s => makeSession(s.id, s.label, s.initialCwd)),
  )
  const [activeSessionId, setActiveSessionId] = useState<string>('app')
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]

  const updateSession = useCallback((id: string, updater: (s: TerminalSession) => TerminalSession) => {
    setSessions(prev => prev.map(s => (s.id === id ? updater(s) : s)))
  }, [])

  // Resolve initial cwd and spawn PTY for each session
  useEffect(() => {
    sessions.forEach(session => {
      if (session.cwd) return // already resolved
      const resolveDir = async () => {
        try {
          const isWindows = navigator.userAgent.includes('Windows')
          const expanded = isWindows
            ? session.initialCwd.replace(/^~/, '%USERPROFILE%')
            : session.initialCwd.replace(/^~/, '$HOME')
          const command = isWindows
            ? `cd /d ${expanded} 2>nul && cd || cd`
            : `eval cd ${expanded} 2>/dev/null && pwd || pwd`
          const result: string = await invoke('kn_execute_command', {
            command,
          })
          const resolvedCwd = result.trim()
          updateSession(session.id, s => ({ ...s, cwd: resolvedCwd }))

          // Spawn PTY for sessions that want one
          if (session.isPty && !session.ptyAlive) {
            try {
              await invoke('kn_pty_spawn', {
                sessionId: session.id,
                cwd: resolvedCwd,
                cols: 120,
                rows: 30,
              })
              updateSession(session.id, s => ({ ...s, ptyAlive: true }))
            } catch (err) {
              console.warn(`PTY spawn failed for ${session.id}, falling back to pipe mode:`, err)
              updateSession(session.id, s => ({ ...s, isPty: false }))
            }
          }
        } catch {
          updateSession(session.id, s => ({ ...s, cwd: '~' }))
        }
      }
      resolveDir()
    })
  }, [sessions.length])

  // Cleanup: kill PTY sessions when component unmounts
  useEffect(() => {
    return () => {
      sessions.forEach(session => {
        if (session.isPty && session.ptyAlive) {
          invoke('kn_pty_kill', { sessionId: session.id }).catch(() => {})
        }
      })
    }
  }, [])

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [activeSession.lines])

  // Focus input on session switch or execution complete
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeSessionId, activeSession.isExecuting])

  const addLine = useCallback(
    (sessionId: string, type: TerminalLine['type'], text: string) => {
      updateSession(sessionId, s => ({
        ...s,
        lines: [...s.lines, { type, text, timestamp: new Date() }],
      }))
    },
    [updateSession],
  )

  // Live log streaming state
  const [liveLogsSession, setLiveLogsSession] = useState<string | null>(null)
  const lastLogLineCountRef = useRef<number>(0)
  const clawdbotInitRef = useRef(false)

  // Auto-fetch backend status when Clawdbot session first opens
  useEffect(() => {
    if (clawdbotInitRef.current) return
    const clawdbot = sessions.find(s => s.id === 'clawdbot')
    if (!clawdbot || !clawdbot.cwd) return
    clawdbotInitRef.current = true

    const fetchStatus = async () => {
      addLine('clawdbot', 'system', 'Fetching backend service status...')
      try {
        const [statusRes, healthRes] = await Promise.all([
          fetch('http://127.0.0.1:8897/api/clawd/service/status').catch(() => null),
          fetch('http://127.0.0.1:8897/api/clawd/service/health').catch(() => null),
        ])
        if (!statusRes?.ok) {
          addLine('clawdbot', 'stderr', 'Backend not reachable (is the app running?)')
        } else {
          const status = await statusRes.json()
          const health = healthRes?.ok ? await healthRes.json() : null
          addLine('clawdbot', 'stdout', formatServiceStatus(status, health))
        }
      } catch (err) {
        addLine('clawdbot', 'stderr', `Failed to fetch status: ${err}`)
      }
      addLine('clawdbot', 'system', 'Commands: "status", "enable", "disable", "logs" (stream live), "skills list", "claude <prompt>" (run Claude Code)')
    }
    fetchStatus()
  }, [sessions, addLine])

  // Live log polling
  useEffect(() => {
    if (!liveLogsSession) return
    lastLogLineCountRef.current = 0

    const poll = async () => {
      try {
        const lines: string[] = await invoke('kn_read_logs', { logType: 'all', maxLines: 500 })
        const newLines = lines.slice(lastLogLineCountRef.current)
        if (newLines.length > 0) {
          lastLogLineCountRef.current = lines.length
          newLines.forEach(line => addLine(liveLogsSession, 'stdout', line))
        }
      } catch {
        // Log reading may fail if files don't exist yet
      }
    }

    poll() // fetch immediately
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [liveLogsSession, addLine])

  // ── Claude Code session creation on-demand ──
  // When the chat agent delegates to Claude Code, a `claude-code-started` event
  // creates the session (if needed), switches to it, and shows the prompt.
  useEffect(() => {
    const unlisteners: Promise<UnlistenFn>[] = []

    unlisteners.push(
      listen<{ processId: string; sessionId: string; prompt: string; cwd: string }>(
        'claude-code-started',
        event => {
          const { processId, sessionId, prompt, cwd } = event.payload
          // Create session if it doesn't exist, otherwise clear it for the new run
          setSessions(prev => {
            const exists = prev.find(s => s.id === sessionId)
            if (exists) {
              return prev.map(s =>
                s.id === sessionId
                  ? {
                      ...s,
                      lines: [{ type: 'system' as const, text: `Claude Code: ${prompt}`, timestamp: new Date() }],
                      isExecuting: true,
                      streamingProcessId: processId,
                      cwd: cwd || s.cwd,
                    }
                  : s,
              )
            }
            return [
              ...prev,
              {
                ...makeSession(sessionId, 'Claude Code', cwd || '~'),
                lines: [{ type: 'system' as const, text: `Claude Code: ${prompt}`, timestamp: new Date() }],
                cwd: cwd || '',
                isExecuting: true,
                streamingProcessId: processId,
              },
            ]
          })
          // Auto-switch to the Claude Code tab
          setActiveSessionId(sessionId)
        },
      ),
    )

    return () => {
      unlisteners.forEach(p => p.then(unlisten => unlisten()))
    }
  }, [])

  // ── Reconcile with module-level cache on mount ──
  // If claude-code-started fired before this component mounted, the event
  // listener above missed it. Read the module-level cache and create the
  // session so the Claude Code tab appears immediately.
  useEffect(() => {
    if (!_activeClaudeCodeSession) return
    const { processId, sessionId, prompt, cwd, isActive } = _activeClaudeCodeSession

    setSessions(prev => {
      if (prev.find(s => s.id === sessionId)) return prev
      return [
        ...prev,
        {
          ...makeSession(sessionId, 'Claude Code', cwd || '~'),
          lines: [{ type: 'system' as const, text: `Claude Code: ${prompt}`, timestamp: new Date() }],
          cwd: cwd || '',
          isExecuting: isActive,
          streamingProcessId: isActive ? processId : null,
        },
      ]
    })
    setActiveSessionId(sessionId)
  }, [])

  // ── PTY output event listeners ──
  useEffect(() => {
    const unlisteners: Promise<UnlistenFn>[] = []

    unlisteners.push(
      listen<{ sessionId: string; data: string }>('pty-output', event => {
        const { sessionId, data } = event.payload
        // The Rust backend emits each raw read() chunk as one event, which
        // may be a partial line. Split on \n and append the first fragment to
        // the last stdout line so chunks within the same physical line merge
        // correctly rather than each becoming its own display row.
        const clean = stripAnsi(data).replace(/\r/g, '')
        const parts = clean.split('\n')
        setSessions(prev => {
          const exists = prev.find(s => s.id === sessionId)
          if (!exists) return prev
          return prev.map(s => {
            if (s.id !== sessionId) return s
            const lines = [...s.lines]
            const [first, ...rest] = parts
            // Append first fragment to last stdout line if one exists
            const last = lines[lines.length - 1]
            if (last && last.type === 'stdout') {
              lines[lines.length - 1] = { ...last, text: last.text + first }
            } else if (first) {
              lines.push({ type: 'stdout' as const, text: first, timestamp: new Date() })
            }
            // Remaining parts each start a new line (last may be empty trailing newline)
            for (let i = 0; i < rest.length; i++) {
              if (i === rest.length - 1 && rest[i] === '') continue
              lines.push({ type: 'stdout' as const, text: rest[i], timestamp: new Date() })
            }
            return { ...s, lines }
          })
        })
      }),
    )

    unlisteners.push(
      listen<{ sessionId: string }>('pty-exit', event => {
        const { sessionId } = event.payload
        setSessions(prev =>
          prev.map(s =>
            s.id === sessionId
              ? { ...s, ptyAlive: false, lines: [...s.lines, { type: 'system' as const, text: 'PTY session ended.', timestamp: new Date() }] }
              : s,
          ),
        )
      }),
    )

    return () => {
      unlisteners.forEach(p => p.then(unlisten => unlisten()))
    }
  }, [])

  // ── Streaming process event listeners (for claude code CLI, etc.) ──
  useEffect(() => {
    const unlisteners: Promise<UnlistenFn>[] = []

    unlisteners.push(
      listen<{ processId: string; sessionId: string; text: string }>('streaming-stdout', event => {
        const { sessionId, text } = event.payload
        // For dynamically-created sessions (claude-code), ensure the session exists
        setSessions(prev => {
          const exists = prev.find(s => s.id === sessionId)
          if (!exists) return prev // ignore events for unknown sessions
          return prev.map(s =>
            s.id === sessionId
              ? { ...s, lines: [...s.lines, { type: 'stdout' as const, text: stripAnsi(text), timestamp: new Date() }] }
              : s,
          )
        })
      }),
    )

    unlisteners.push(
      listen<{ processId: string; sessionId: string; text: string }>('streaming-stderr', event => {
        const { sessionId, text } = event.payload
        setSessions(prev => {
          const exists = prev.find(s => s.id === sessionId)
          if (!exists) return prev
          return prev.map(s =>
            s.id === sessionId
              ? { ...s, lines: [...s.lines, { type: 'stderr' as const, text: stripAnsi(text), timestamp: new Date() }] }
              : s,
          )
        })
      }),
    )

    unlisteners.push(
      listen<{ processId: string; sessionId: string; exitCode: number }>('streaming-exit', event => {
        const { sessionId, exitCode } = event.payload
        setSessions(prev => {
          const exists = prev.find(s => s.id === sessionId)
          if (!exists) return prev
          return prev.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  lines: [...s.lines, { type: 'system' as const, text: `Process exited with code ${exitCode}`, timestamp: new Date() }],
                  isExecuting: false,
                  streamingProcessId: null,
                }
              : s,
          )
        })
      }),
    )

    return () => {
      unlisteners.forEach(p => p.then(unlisten => unlisten()))
    }
  }, [])

  const killStreamingProcess = useCallback(
    async (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId)
      if (!session?.streamingProcessId) return
      try {
        await invoke('kn_kill_streaming_process', { processId: session.streamingProcessId })
        addLine(sessionId, 'system', 'Process terminated.')
      } catch (err) {
        addLine(sessionId, 'stderr', `Failed to kill process: ${err}`)
      }
    },
    [sessions, addLine],
  )

  const executeCommand = useCallback(
    async (sessionId: string, command: string) => {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) return
      const trimmed = command.trim()
      const cmd = trimmed.toLowerCase()

      // For PTY sessions, always forward Enter (even when empty) so that
      // interactive TUI prompts (e.g. Claude Code selection menus) receive
      // the keypress. Non-PTY sessions still require non-empty input.
      if (!trimmed) {
        if (session.isPty && session.ptyAlive) {
          invoke('kn_pty_write', { sessionId, data: '\n' }).catch(() => {})
          return
        }
        return
      }

      updateSession(sessionId, s => ({
        ...s,
        commandHistory: [trimmed, ...s.commandHistory],
        historyIndex: -1,
      }))
      addLine(sessionId, 'command', `$ ${trimmed}`)

      if (cmd === 'clear') {
        updateSession(sessionId, s => ({ ...s, lines: [] }))
        return
      }

      if (cmd === 'help') {
        addLine(sessionId, 'system', [
          'Built-in commands:',
          '  clear              Clear terminal output',
          '  status             Show gateway / browser health',
          '  logs               Toggle live log streaming',
          '  enable             Install and start the gateway LaunchAgent',
          '  disable            Stop gateway and remove LaunchAgent',
          '  gateway restart    Restart the gateway (re-runs enable)',
          '  doctor             Run openclaw doctor (check for issues)',
          '  doctor --fix       Run openclaw doctor --fix (auto-repair)',
          '  skills list        List skill status',
          '  skills install <n> Install a skill',
          '  skills enable <n>  Enable a skill',
          '  skills disable <n> Disable a skill',
          '  claude [args]      Run Claude Code CLI',
        ].join('\n'))
        return
      }

      // Live logs toggle command
      if (cmd === 'live logs' || cmd === 'logs' || cmd === 'live' || cmd === 'tail') {
        if (liveLogsSession === sessionId) {
          setLiveLogsSession(null)
          addLine(sessionId, 'system', 'Live log streaming stopped.')
        } else {
          setLiveLogsSession(sessionId)
          addLine(sessionId, 'system', 'Live log streaming started (polling every 2s). Type "logs" again to stop.')
        }
        return
      }

      // Service status command
      if (cmd === 'status' || cmd === 'service status') {
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const [statusRes, healthRes] = await Promise.all([
            fetch('http://127.0.0.1:8897/api/clawd/service/status').catch(() => null),
            fetch('http://127.0.0.1:8897/api/clawd/service/health').catch(() => null),
          ])
          if (!statusRes?.ok) {
            addLine(sessionId, 'stderr', 'Backend not reachable')
          } else {
            const status = await statusRes.json()
            const health = healthRes?.ok ? await healthRes.json() : null
            addLine(sessionId, 'stdout', formatServiceStatus(status, health))
          }
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // enable / disable — register or remove the LaunchAgent
      if (cmd === 'enable' || cmd === 'disable') {
        const enabling = cmd === 'enable'
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        addLine(sessionId, 'system', enabling ? 'Registering LaunchAgent and starting gateway...' : 'Stopping gateway and removing LaunchAgent...')
        try {
          const res = await fetch('http://127.0.0.1:8897/api/clawd/service/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: enabling }),
          })
          const data = await res.json()
          if (data.success) {
            addLine(sessionId, 'stdout', data.message || (enabling ? 'Gateway enabled.' : 'Gateway disabled.'))
            // Refresh status so user sees the new state immediately
            const [statusRes, healthRes] = await Promise.all([
              fetch('http://127.0.0.1:8897/api/clawd/service/status').catch(() => null),
              fetch('http://127.0.0.1:8897/api/clawd/service/health').catch(() => null),
            ])
            if (statusRes?.ok) {
              const status = await statusRes.json()
              const health = healthRes?.ok ? await healthRes.json() : null
              addLine(sessionId, 'stdout', formatServiceStatus(status, health))
            }
          } else {
            addLine(sessionId, 'stderr', data.message || 'Operation failed.')
          }
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // gateway restart — re-run enable to restart the gateway LaunchAgent
      if (
        cmd === 'gateway restart' ||
        cmd === 'restart' ||
        cmd === 'openclaw gateway restart' ||
        cmd === 'openclaw restart'
      ) {
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        addLine(sessionId, 'system', 'Restarting gateway (re-registering LaunchAgent)...')
        try {
          const res = await fetch('http://127.0.0.1:8897/api/clawd/service/enable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: true }),
          })
          const data = await res.json()
          addLine(sessionId, data.success ? 'stdout' : 'stderr', data.message || (data.success ? 'Gateway restarted.' : 'Restart failed.'))
          const [statusRes, healthRes] = await Promise.all([
            fetch('http://127.0.0.1:8897/api/clawd/service/status').catch(() => null),
            fetch('http://127.0.0.1:8897/api/clawd/service/health').catch(() => null),
          ])
          if (statusRes?.ok) {
            const status = await statusRes.json()
            const health = healthRes?.ok ? await healthRes.json() : null
            addLine(sessionId, 'stdout', formatServiceStatus(status, health))
          }
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // openclaw install — openclaw is embedded; guide user to enable/doctor instead
      if (cmd === 'openclaw install' || cmd === 'openclaw setup') {
        addLine(sessionId, 'system', 'openclaw is bundled inside Knapsack — no separate install needed.\nTry: "enable" to start the gateway, or "doctor" to diagnose issues.')
        return
      }

      // Skills CLI commands — intercept and call the backend API
      if (cmd === 'skills' || cmd === 'skills help') {
        addLine(sessionId, 'system', 'Usage: skills <command>\n\n  skills list       List all skills with status\n  skills install    Install a skill (e.g. skills install GitHub)\n  skills enable     Enable a skill (e.g. skills enable GitHub)\n  skills disable    Disable a skill (e.g. skills disable GitHub)\n  skills help       Show this help')
        return
      }

      if (cmd === 'skills list' || cmd === 'skills status' || cmd === 'skills check') {
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const resp = await fetch('http://127.0.0.1:8897/api/clawd/skills/status')
          const data = await resp.json()
          if (data.success && data.skills) {
            const skills: { name: string; eligible?: boolean; enabled?: boolean; source?: string; description?: string; missing?: string[] }[] = data.skills
            const lines: string[] = []
            const ready = skills.filter(s => s.eligible && s.enabled !== false)
            const needsSetup = skills.filter(s => !s.eligible && s.missing?.length)
            const available = skills.filter(s => !s.eligible && !s.missing?.length && s.source === 'OpenClaw')
            const disabled = skills.filter(s => s.eligible && s.enabled === false)

            if (ready.length) {
              lines.push(`\n  Ready (${ready.length}):`)
              ready.forEach(s => lines.push(`    ✓ ${s.name.padEnd(24)} ${s.description || ''}`))
            }
            if (disabled.length) {
              lines.push(`\n  Disabled (${disabled.length}):`)
              disabled.forEach(s => lines.push(`    ⏸ ${s.name.padEnd(24)} ${s.description || ''}`))
            }
            if (needsSetup.length) {
              lines.push(`\n  Needs Setup (${needsSetup.length}):`)
              needsSetup.forEach(s => lines.push(`    ✗ ${s.name.padEnd(24)} Missing: ${s.missing?.join(', ')}`))
            }
            if (available.length) {
              lines.push(`\n  Available from OpenClaw (${available.length}):`)
              available.forEach(s => lines.push(`    ○ ${s.name.padEnd(24)} ${s.description || ''}`))
            }
            lines.push(`\n  ${skills.length} skills total`)
            addLine(sessionId, 'stdout', lines.join('\n'))
          } else {
            addLine(sessionId, 'stderr', data.message || 'Failed to fetch skills status')
          }
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed to connect to backend: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      const installMatch = trimmed.match(/^skills\s+install\s+(.+)$/i)
      if (installMatch) {
        const skillName = installMatch[1].trim()
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          addLine(sessionId, 'system', `Installing ${skillName}...`)
          const resp = await fetch('http://127.0.0.1:8897/api/clawd/skills/install', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: skillName, installId: 'default' }),
          })
          const data = await resp.json()
          if (data.success) {
            addLine(sessionId, 'stdout', `✓ ${skillName} installed successfully`)
          } else {
            addLine(sessionId, 'stderr', `✗ ${data.message || 'Install failed'}`)
          }
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed to install: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      const enableMatch = trimmed.match(/^skills\s+enable\s+(.+)$/i)
      if (enableMatch) {
        const skillName = enableMatch[1].trim()
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const resp = await fetch('http://127.0.0.1:8897/api/clawd/skills/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillKey: skillName, enabled: true }),
          })
          const data = await resp.json()
          addLine(sessionId, data.success ? 'stdout' : 'stderr', data.success ? `✓ ${skillName} enabled` : `✗ ${data.message || 'Failed'}`)
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      const disableMatch = trimmed.match(/^skills\s+disable\s+(.+)$/i)
      if (disableMatch) {
        const skillName = disableMatch[1].trim()
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const resp = await fetch('http://127.0.0.1:8897/api/clawd/skills/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillKey: skillName, enabled: false }),
          })
          const data = await resp.json()
          addLine(sessionId, data.success ? 'stdout' : 'stderr', data.success ? `✓ ${skillName} disabled` : `✗ ${data.message || 'Failed'}`)
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // ── PTY-backed sessions: send the command directly to the PTY ──
      if (session.isPty && session.ptyAlive) {
        // For PTY sessions, write the command + newline to the PTY stdin.
        // The PTY's shell handles cd, history, job control, etc. natively.
        try {
          await invoke('kn_pty_write', { sessionId, data: trimmed + '\n' })
        } catch (err) {
          addLine(sessionId, 'stderr', `PTY write failed: ${err}`)
        }
        return
      }

      // ── Legacy pipe-based execution (non-PTY fallback) ──

      if (cmd.startsWith('cd ')) {
        const dir = trimmed.slice(3).trim()
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const cwd = session.cwd
          const isWindows = navigator.userAgent.includes('Windows')
          const actualCommand = isWindows
            ? (cwd ? `cd /d "${cwd}" && cd /d ${dir} && cd` : `cd /d ${dir} && cd`)
            : (cwd ? `cd "${cwd}" && cd ${dir} && pwd` : `cd ${dir} && pwd`)
          const result: string = await invoke('kn_execute_command', { command: actualCommand })
          const newCwd = result.trim()
          updateSession(sessionId, s => ({ ...s, cwd: newCwd }))
          addLine(sessionId, 'system', `Changed directory to ${newCwd}`)
        } catch (err) {
          addLine(sessionId, 'stderr', `cd: ${err}`)
        } finally {
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // openclaw doctor — run as a streaming process for real-time self-heal output
      if (
        cmd === 'doctor' ||
        cmd === 'doctor --fix' ||
        cmd === 'openclaw doctor' ||
        cmd === 'openclaw doctor --fix'
      ) {
        const isFixMode = cmd.includes('--fix')
        const doctorCmd = isFixMode ? 'openclaw doctor --fix' : 'openclaw doctor'
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          addLine(sessionId, 'system', isFixMode ? 'Running openclaw doctor --fix...' : 'Running openclaw doctor...')
          const processId: string = await invoke('kn_spawn_streaming_command', {
            command: doctorCmd,
            cwd: session.cwd || undefined,
            sessionId,
          })
          updateSession(sessionId, s => ({ ...s, streamingProcessId: processId }))
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed to run doctor: ${err}`)
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      // Claude Code CLI — run as a streaming process so output appears in real-time
      if (cmd === 'claude' || cmd.startsWith('claude ')) {
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          addLine(sessionId, 'system', 'Starting Claude Code...')
          const processId: string = await invoke('kn_spawn_streaming_command', {
            command: trimmed,
            cwd: session.cwd || undefined,
            sessionId,
          })
          updateSession(sessionId, s => ({ ...s, streamingProcessId: processId }))
        } catch (err) {
          addLine(sessionId, 'stderr', `Failed to start Claude Code: ${err}`)
          updateSession(sessionId, s => ({ ...s, isExecuting: false }))
        }
        return
      }

      updateSession(sessionId, s => ({ ...s, isExecuting: true }))
      try {
        const cwd = session.cwd
        const isWindows = navigator.userAgent.includes('Windows')
        const actualCommand = cwd
          ? (isWindows ? `cd /d "${cwd}" && ${trimmed}` : `cd "${cwd}" && ${trimmed}`)
          : trimmed
        const result: string = await invoke('kn_execute_command', { command: actualCommand })
        if (result) {
          addLine(sessionId, 'stdout', result)
        }
      } catch (err) {
        addLine(sessionId, 'stderr', String(err))
      } finally {
        updateSession(sessionId, s => ({ ...s, isExecuting: false }))
      }
    },
    [sessions, addLine, updateSession],
  )

  // Listen for "Run in Terminal" clicks from the chat code blocks
  const executeCommandRef = useRef(executeCommand)
  executeCommandRef.current = executeCommand
  const activeSessionIdRef = useRef(activeSessionId)
  activeSessionIdRef.current = activeSessionId

  useEffect(() => {
    const handler = (e: Event) => {
      const command = (e as CustomEvent).detail?.command
      if (typeof command === 'string' && command) {
        executeCommandRef.current(activeSessionIdRef.current, command)
      }
    }
    window.addEventListener('run-in-terminal', handler)
    return () => window.removeEventListener('run-in-terminal', handler)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const sid = activeSession.id

    // PTY mode: forward Ctrl+C as ETX byte (0x03) to the PTY
    if (activeSession.isPty && activeSession.ptyAlive && e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      invoke('kn_pty_write', { sessionId: sid, data: '\x03' }).catch(() => {})
      return
    }

    if (e.key === 'Enter' && !activeSession.isExecuting) {
      executeCommand(sid, activeSession.inputValue)
      updateSession(sid, s => ({ ...s, inputValue: '' }))
    } else if (e.key === 'ArrowUp') {
      // In PTY mode, forward arrow keys to the PTY for shell history
      if (activeSession.isPty && activeSession.ptyAlive) {
        e.preventDefault()
        invoke('kn_pty_write', { sessionId: sid, data: '\x1b[A' }).catch(() => {})
        return
      }
      e.preventDefault()
      if (activeSession.commandHistory.length > 0) {
        const newIndex = Math.min(activeSession.historyIndex + 1, activeSession.commandHistory.length - 1)
        updateSession(sid, s => ({
          ...s,
          historyIndex: newIndex,
          inputValue: s.commandHistory[newIndex],
        }))
      }
    } else if (e.key === 'ArrowDown') {
      if (activeSession.isPty && activeSession.ptyAlive) {
        e.preventDefault()
        invoke('kn_pty_write', { sessionId: sid, data: '\x1b[B' }).catch(() => {})
        return
      }
      e.preventDefault()
      if (activeSession.historyIndex > 0) {
        const newIndex = activeSession.historyIndex - 1
        updateSession(sid, s => ({
          ...s,
          historyIndex: newIndex,
          inputValue: s.commandHistory[newIndex],
        }))
      } else {
        updateSession(sid, s => ({ ...s, historyIndex: -1, inputValue: '' }))
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      if (activeSession.isPty && activeSession.ptyAlive) {
        // Send Ctrl+L to the PTY (clears screen in most shells)
        invoke('kn_pty_write', { sessionId: sid, data: '\x0c' }).catch(() => {})
      } else {
        updateSession(sid, s => ({ ...s, lines: [] }))
      }
    } else if (e.key === 'Tab' && activeSession.isPty && activeSession.ptyAlive) {
      // Forward Tab to PTY for tab-completion
      e.preventDefault()
      invoke('kn_pty_write', { sessionId: sid, data: '\t' }).catch(() => {})
    }
  }

  const cwdDisplay = activeSession.cwd
    ? activeSession.cwd.replace(/^\/Users\/[^/]+/, '~').replace(/^\/home\/[^/]+/, '~')
    : '~'

  return (
    <div className="flex flex-col h-full px-4 py-3">
      {/* Session tabs */}
      <div className="flex items-center gap-1 mb-2">
        {sessions.map(session => (
          <button
            key={session.id}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeSessionId === session.id
                ? 'bg-gray-700 text-white font-medium'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={() => setActiveSessionId(session.id)}
          >
            {session.label}
          </button>
        ))}
        <div className="flex-1" />
        {activeSessionId === 'clawdbot' && (
          <button
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              liveLogsSession === 'clawdbot'
                ? 'bg-green-600 text-white font-medium'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={() => {
              if (liveLogsSession === 'clawdbot') {
                setLiveLogsSession(null)
                addLine('clawdbot', 'system', 'Live log streaming stopped.')
              } else {
                setLiveLogsSession('clawdbot')
                addLine('clawdbot', 'system', 'Live log streaming started (polling every 2s)...')
              }
            }}
          >
            {liveLogsSession === 'clawdbot' ? '● Live' : '○ Live Logs'}
          </button>
        )}
        <button
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {
            updateSession(activeSession.id, s => ({ ...s, lines: [] }))
            if (liveLogsSession === activeSession.id) {
              setLiveLogsSession(null)
              lastLogLineCountRef.current = 0
            }
          }}
        >
          Clear
        </button>
      </div>

      {/* Terminal body */}
      <div
        className="ActivityPanel__terminal flex-1 flex flex-col"
        tabIndex={0}
        onClick={() => inputRef.current?.focus()}
        onKeyDown={e => {
          if (e.key === 'c' && e.ctrlKey) {
            if (activeSession.isPty && activeSession.ptyAlive) {
              e.preventDefault()
              invoke('kn_pty_write', { sessionId: activeSession.id, data: '\x03' }).catch(() => {})
            } else if (activeSession.streamingProcessId) {
              e.preventDefault()
              killStreamingProcess(activeSession.id)
            }
          }
        }}
      >
        <div ref={outputRef} className="terminal__output flex-1">
          {activeSession.lines.map((line, i) => (
            <div key={i} className={`terminal__line--${line.type}`}>
              {line.text}
            </div>
          ))}
          {activeSession.isExecuting && !activeSession.streamingProcessId && (
            <div className="terminal__line--system animate-pulse">Running...</div>
          )}
          {activeSession.streamingProcessId && (
            <div className="terminal__line--system animate-pulse">Claude Code running...</div>
          )}
        </div>

        <div className="terminal__input-row">
          {/* PTY sessions don't need a local prompt — the shell renders its own */}
          {!(activeSession.isPty && activeSession.ptyAlive) && (
            <span className="terminal__prompt">{cwdDisplay} $</span>
          )}
          {activeSession.isPty && activeSession.ptyAlive ? (
            <input
              ref={inputRef}
              type="text"
              className="terminal__input"
              value={activeSession.inputValue}
              onChange={e =>
                updateSession(activeSession.id, s => ({ ...s, inputValue: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              placeholder="Type here (interactive PTY)..."
              autoFocus
            />
          ) : activeSession.streamingProcessId ? (
            <button
              className="terminal__stop-btn"
              onClick={() => killStreamingProcess(activeSession.id)}
            >
              Stop
            </button>
          ) : (
            <input
              ref={inputRef}
              type="text"
              className="terminal__input"
              value={activeSession.inputValue}
              onChange={e =>
                updateSession(activeSession.id, s => ({ ...s, inputValue: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              placeholder={activeSession.isExecuting ? 'Waiting for command to finish...' : 'Enter a command...'}
              disabled={activeSession.isExecuting}
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityPanel
