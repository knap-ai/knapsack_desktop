import './style.scss'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

type ActivitySubTab = 'logs' | 'costs' | 'terminal'

interface TerminalLine {
  type: 'command' | 'stdout' | 'stderr' | 'system'
  text: string
  timestamp: Date
}

interface TokenCostEntry {
  id: number
  timestamp: Date
  model: string
  tokensUsed: number
  estimatedCost: number
  action: string
}

const ActivityPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<ActivitySubTab>('logs')

  return (
    <div className="ActivityPanel w-full h-full flex flex-col overflow-hidden">
      {/* Sub-tab bar */}
      <div className="ActivityPanel__tabs flex px-6 pt-4 bg-white">
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
    <div className="flex flex-col h-full px-6 py-4">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
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

// Model pricing estimates (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'groq-llama': { input: 0.05, output: 0.08 },
  'groq-mixtral': { input: 0.24, output: 0.24 },
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  default: { input: 0.15, output: 0.15 },
}

const TokenCostsView: React.FC = () => {
  const [entries, setEntries] = useState<TokenCostEntry[]>([])
  const [sessionStart] = useState<Date>(new Date())

  // Listen for token usage events from the LLM calls
  useEffect(() => {
    // Poll the local server for recent LLM activity
    const fetchCosts = async () => {
      try {
        const res = await fetch('http://localhost:8897/api/knapsack/automations/runs')
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data)) {
            const costEntries: TokenCostEntry[] = data
              .filter((run: any) => run.created_at && new Date(run.created_at) >= sessionStart)
              .map((run: any, idx: number) => ({
                id: run.id || idx,
                timestamp: new Date(run.created_at),
                model: run.model || 'groq-llama',
                tokensUsed: run.tokens_used || 0,
                estimatedCost: (run.tokens_used || 0) * 0.00000015,
                action: run.automation_name || run.step_name || 'LLM Call',
              }))
            setEntries(costEntries)
          }
        }
      } catch {
        // Silently fail - costs are best-effort
      }
    }

    fetchCosts()
    const interval = setInterval(fetchCosts, 10000)
    return () => clearInterval(interval)
  }, [sessionStart])

  const totalTokens = useMemo(
    () => entries.reduce((sum, e) => sum + e.tokensUsed, 0),
    [entries],
  )
  const totalCost = useMemo(
    () => entries.reduce((sum, e) => sum + e.estimatedCost, 0),
    [entries],
  )

  return (
    <div className="flex flex-col h-full px-6 py-4 overflow-y-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">Session Tokens</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totalTokens.toLocaleString()}
          </div>
        </div>
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">Estimated Cost</div>
          <div className="text-2xl font-semibold text-gray-900">
            ${totalCost.toFixed(4)}
          </div>
        </div>
        <div className="ActivityPanel__costCard">
          <div className="text-xs text-gray-500 mb-1">API Calls</div>
          <div className="text-2xl font-semibold text-gray-900">
            {entries.length}
          </div>
        </div>
      </div>

      {/* Cost history table */}
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-3">Recent Activity</div>
        {entries.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-400 text-sm">No token usage recorded this session</div>
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
                  <th className="text-right px-4 py-2 font-medium">Tokens</th>
                  <th className="text-right px-4 py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{entry.action}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px]">
                        {entry.model}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      {entry.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700 font-mono">
                      ${entry.estimatedCost.toFixed(6)}
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
   TERMINAL VIEW
   ========================================================= */

const TerminalView: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'system',
      text: 'Knapsack Terminal ready. Type a command and press Enter.',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [cwd, setCwd] = useState<string>('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get initial working directory
  useEffect(() => {
    const getHome = async () => {
      try {
        const result: string = await invoke('kn_execute_command', { command: 'pwd' })
        setCwd(result.trim())
      } catch {
        setCwd('~')
      }
    }
    getHome()
  }, [])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [isExecuting])

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text, timestamp: new Date() }])
  }, [])

  const executeCommand = useCallback(
    async (command: string) => {
      const trimmed = command.trim()
      if (!trimmed) return

      setCommandHistory(prev => [trimmed, ...prev])
      setHistoryIndex(-1)
      addLine('command', `$ ${trimmed}`)

      // Handle built-in commands
      if (trimmed === 'clear') {
        setLines([])
        return
      }

      if (trimmed.startsWith('cd ')) {
        const dir = trimmed.slice(3).trim()
        setIsExecuting(true)
        try {
          // Resolve the new directory by running cd + pwd
          const actualCommand = cwd
            ? `cd "${cwd}" && cd ${dir} && pwd`
            : `cd ${dir} && pwd`
          const result: string = await invoke('kn_execute_command', { command: actualCommand })
          const newCwd = result.trim()
          setCwd(newCwd)
          addLine('system', `Changed directory to ${newCwd}`)
        } catch (err) {
          addLine('stderr', `cd: ${err}`)
        } finally {
          setIsExecuting(false)
        }
        return
      }

      setIsExecuting(true)
      try {
        const actualCommand = cwd ? `cd "${cwd}" && ${trimmed}` : trimmed
        const result: string = await invoke('kn_execute_command', { command: actualCommand })
        if (result) {
          addLine('stdout', result)
        }
      } catch (err) {
        addLine('stderr', String(err))
      } finally {
        setIsExecuting(false)
      }
    },
    [cwd, addLine],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(inputValue)
      setInputValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setInputValue(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInputValue(commandHistory[newIndex])
      } else {
        setHistoryIndex(-1)
        setInputValue('')
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const cwdDisplay = cwd
    ? cwd.replace(/^\/Users\/[^/]+/, '~').replace(/^\/home\/[^/]+/, '~')
    : '~'

  return (
    <div className="flex flex-col h-full px-6 py-4">
      {/* Terminal header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">{cwdDisplay}</span>
        </div>
        <button
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setLines([])}
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
          {lines.map((line, i) => (
            <div key={i} className={`terminal__line--${line.type}`}>
              {line.text}
            </div>
          ))}
          {isExecuting && (
            <div className="terminal__line--system animate-pulse">Running...</div>
          )}
        </div>

        <div className="terminal__input-row">
          <span className="terminal__prompt">{cwdDisplay} $</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal__input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isExecuting ? 'Waiting for command to finish...' : 'Enter a command...'}
            disabled={isExecuting}
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

export default ActivityPanel
