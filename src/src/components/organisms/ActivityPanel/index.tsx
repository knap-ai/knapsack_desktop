import './style.scss'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import {
  KN_API_TOKEN_USAGE_SUMMARY,
  KN_API_TOKEN_USAGE_RECENT,
  KN_API_TOKEN_USAGE_BUDGET,
} from 'src/utils/constants'

type ActivitySubTab = 'logs' | 'costs' | 'terminal'

interface TerminalLine {
  type: 'command' | 'stdout' | 'stderr' | 'system'
  text: string
  timestamp: Date
}

interface TokenUsageRecord {
  id: number
  provider: string
  model: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  action: string
  created_at: number
}

const ActivityPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<ActivitySubTab>('terminal')

  return (
    <div className="ActivityPanel w-full h-full flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="ActivityPanel__tabs flex px-4 pt-3 bg-white">
        {(['logs', 'costs', 'terminal'] as ActivitySubTab[]).map(tab => (
          <button
            key={tab}
            className={`ActivityPanel__tab ${activeSubTab === tab ? 'ActivityPanel__tab--active' : ''}`}
            onClick={() => setActiveSubTab(tab)}
          >
            {tab === 'logs' && 'Logs'}
            {tab === 'costs' && 'Token Costs'}
            {tab === 'terminal' && 'Terminal'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeSubTab === 'logs' && <LogsView />}
        {activeSubTab === 'costs' && <TokenCostsView />}
        {activeSubTab === 'terminal' && <TerminalView />}
      </div>
    </div>
  )
}

/* =========================================================
   LOGS VIEW
   ========================================================= */

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
    if (!filterText) return logs
    const lower = filterText.toLowerCase()
    return logs.filter(line => line.toLowerCase().includes(lower))
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
   TOKEN COSTS VIEW
   ========================================================= */

interface UsageSummary {
  totalCostUsd: number
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  byModel: { provider: string; model: string; request_count: number; total_input_tokens: number; total_output_tokens: number; total_cost_usd: number }[]
}

interface BudgetStatus {
  dailyCostUsd: number
  monthlyCostUsd: number
}

const TokenCostsView: React.FC = () => {
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
                <span className="text-gray-500">{m.request_count} calls</span>
                <span className="text-gray-400 mx-1">&middot;</span>
                <span className="text-gray-700 font-mono">${m.total_cost_usd.toFixed(4)}</span>
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
                      {new Date(record.created_at * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{record.action || 'LLM Call'}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px]">
                        {record.model}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      {record.input_tokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      {record.output_tokens.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      ${record.cost_usd.toFixed(6)}
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
}

const DEFAULT_SESSIONS: { id: string; label: string; initialCwd: string }[] = [
  { id: 'app', label: 'App', initialCwd: '~/knapsack_desktop' },
  { id: 'clawdbot', label: 'Clawdbot', initialCwd: '~/knapsack_desktop/src/src-tauri/resources/clawdbot' },
]

function makeSession(id: string, label: string, initialCwd: string): TerminalSession {
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

  // Resolve initial cwd for each session
  useEffect(() => {
    sessions.forEach(session => {
      if (session.cwd) return // already resolved
      const resolveDir = async () => {
        try {
          const expanded = session.initialCwd.replace(/^~/, '$HOME')
          const result: string = await invoke('kn_execute_command', {
            command: `eval cd ${expanded} 2>/dev/null && pwd || pwd`,
          })
          updateSession(session.id, s => ({ ...s, cwd: result.trim() }))
        } catch {
          updateSession(session.id, s => ({ ...s, cwd: '~' }))
        }
      }
      resolveDir()
    })
  }, [sessions.length])

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

  const executeCommand = useCallback(
    async (sessionId: string, command: string) => {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) return
      const trimmed = command.trim()
      if (!trimmed) return

      updateSession(sessionId, s => ({
        ...s,
        commandHistory: [trimmed, ...s.commandHistory],
        historyIndex: -1,
      }))
      addLine(sessionId, 'command', `$ ${trimmed}`)

      if (trimmed === 'clear') {
        updateSession(sessionId, s => ({ ...s, lines: [] }))
        return
      }

      if (trimmed.startsWith('cd ')) {
        const dir = trimmed.slice(3).trim()
        updateSession(sessionId, s => ({ ...s, isExecuting: true }))
        try {
          const cwd = session.cwd
          const actualCommand = cwd ? `cd "${cwd}" && cd ${dir} && pwd` : `cd ${dir} && pwd`
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

      updateSession(sessionId, s => ({ ...s, isExecuting: true }))
      try {
        const cwd = session.cwd
        const actualCommand = cwd ? `cd "${cwd}" && ${trimmed}` : trimmed
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const sid = activeSession.id
    if (e.key === 'Enter' && !activeSession.isExecuting) {
      executeCommand(sid, activeSession.inputValue)
      updateSession(sid, s => ({ ...s, inputValue: '' }))
    } else if (e.key === 'ArrowUp') {
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
      updateSession(sid, s => ({ ...s, lines: [] }))
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
        <button
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => updateSession(activeSession.id, s => ({ ...s, lines: [] }))}
        >
          Clear
        </button>
      </div>

      {/* Terminal body */}
      <div
        className="ActivityPanel__terminal flex-1 flex flex-col"
        onClick={() => inputRef.current?.focus()}
      >
        <div ref={outputRef} className="terminal__output flex-1">
          {activeSession.lines.map((line, i) => (
            <div key={i} className={`terminal__line--${line.type}`}>
              {line.text}
            </div>
          ))}
          {activeSession.isExecuting && (
            <div className="terminal__line--system animate-pulse">Running...</div>
          )}
        </div>

        <div className="terminal__input-row">
          <span className="terminal__prompt">{cwdDisplay} $</span>
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
        </div>
      </div>
    </div>
  )
}

export default ActivityPanel
