import { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import './style.scss'

const API_BASE = 'http://localhost:8897'
const KN_GMAIL_SEARCH = API_BASE + '/api/knapsack/gmail_search'

interface SentryEmail {
  id: string
  subject: string
  snippet: string
  body: string
  from: string
  date: string
  issueTitle?: string
  projectName?: string
  errorType?: string
  parsed: boolean
}

interface SuggestedAction {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium'
  sourceEntry: ErrorLogEntry | SentryEmail
  sourceType: 'sentry' | 'log'
}

interface DevScanResult {
  id: string
  timestamp: number
  sentryIssues: SentryEmail[]
  errorLogEntries: ErrorLogEntry[]
  suggestedActions: SuggestedAction[]
  status: 'scanning' | 'done' | 'error'
  summary?: string
}

interface ErrorLogEntry {
  source: string
  level: 'error' | 'warning' | 'fatal'
  message: string
  timestamp: string
  stackTrace?: string
  raw?: string
}

interface DeveloperModePanelProps {
  onInitiateSession: (prompt: string) => void
  userEmail?: string
}

/** Sentry search queries to find error notification emails */
const SENTRY_SEARCH_QUERIES = [
  'from:noreply@md.getsentry.com subject:Error',
  'from:noreply@md.getsentry.com subject:Issue',
  'from:noreply@sentry.io',
  'subject:sentry alert',
]

/** Log line pattern: "2024-01-15 10:30:45 [ERROR] module - message" */
const LOG_LINE_PATTERN = /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(\S+)\s+-\s+(.*)$/

/** Patterns that indicate an error line in unstructured logs (e.g. clawdbot stderr) */
const RAW_ERROR_PATTERNS = /\b(error|err!|panic|fatal|failed|exception|traceback|segfault|SIGSEGV|SIGABRT|thread.*panicked|unhandled|refused|ECONNREFUSED|ENOENT|EPERM|EACCES|OOM|killed|abort|crash)\b/i
/** Lines to skip even if they match error patterns */
const RAW_ERROR_EXCLUDE = /\b(0 errors?|no errors?|error\.ts|errorHandling|error_handler|error\.rs|error\.go|loglevel|RUST_LOG|if err)\b/i

function parseSentryEmail(email: any): SentryEmail {
  const subject = email.subject || email.title || ''
  const body = email.body || email.snippet || email.text || ''
  const snippet = email.snippet || body.slice(0, 200)

  let issueTitle = ''
  let projectName = ''
  let errorType = ''

  // Pattern: "[Project] ErrorType: message"
  const projectMatch = subject.match(/\[([^\]]+)\]\s*(.*)/)
  if (projectMatch) {
    projectName = projectMatch[1]
    issueTitle = projectMatch[2]
  } else {
    issueTitle = subject
  }

  // Extract error type
  const errorTypeMatch = (issueTitle + ' ' + body).match(
    /(TypeError|ReferenceError|SyntaxError|RangeError|Error|Exception|Panic|FATAL|CRITICAL|UnhandledRejection|SegmentationFault|thread.*panicked|SIGSEGV|SIGABRT)[\s:]/i,
  )
  if (errorTypeMatch) {
    errorType = errorTypeMatch[1]
  }

  return {
    id: email.id || email.message_id || crypto.randomUUID(),
    subject,
    snippet,
    body,
    from: email.from || email.sender || '',
    date: email.date || email.timestamp || '',
    issueTitle,
    projectName,
    errorType,
    parsed: !!(projectName || errorType),
  }
}

function parseLogLine(line: string): ErrorLogEntry | null {
  const match = line.match(LOG_LINE_PATTERN)
  if (!match) return null
  const [, timestamp, level, source, message] = match
  const normalizedLevel = level.toUpperCase()
  if (normalizedLevel !== 'ERROR' && normalizedLevel !== 'WARN' && normalizedLevel !== 'FATAL') {
    return null
  }
  return {
    source,
    level: normalizedLevel === 'WARN' ? 'warning' : normalizedLevel === 'FATAL' ? 'fatal' : 'error',
    message,
    timestamp,
    raw: line,
  }
}

/** Parse raw/unstructured log lines (e.g. from clawdbot stderr) by matching error patterns */
function parseRawLogLines(lines: string[], sourceName: string): ErrorLogEntry[] {
  const entries: ErrorLogEntry[] = []
  let currentEntry: ErrorLogEntry | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (RAW_ERROR_PATTERNS.test(trimmed) && !RAW_ERROR_EXCLUDE.test(trimmed)) {
      // This is a new error line
      if (currentEntry) entries.push(currentEntry)

      // Try to extract a timestamp if one exists at the start
      const tsMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}[^\s]*)[\s:]+(.*)/)
      const isoMatch = trimmed.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(.*)/)

      let timestamp = ''
      let message = trimmed
      if (tsMatch) {
        timestamp = tsMatch[1]
        message = tsMatch[2]
      } else if (isoMatch) {
        timestamp = isoMatch[1]
        message = isoMatch[2]
      }

      currentEntry = {
        source: sourceName,
        level: /\b(panic|fatal|SIGSEGV|SIGABRT|killed|crash|abort)\b/i.test(trimmed) ? 'fatal' : 'error',
        message,
        timestamp,
        raw: trimmed,
      }
    } else if (currentEntry) {
      // Continuation / stack trace line
      currentEntry.stackTrace = (currentEntry.stackTrace || '') + '\n' + trimmed
    }
  }
  if (currentEntry) entries.push(currentEntry)

  return entries
}

/** Group consecutive log lines that look like a stack trace into the preceding error */
function parseLogLines(lines: string[]): ErrorLogEntry[] {
  const entries: ErrorLogEntry[] = []
  let currentEntry: ErrorLogEntry | null = null

  for (const line of lines) {
    const parsed = parseLogLine(line)
    if (parsed) {
      if (currentEntry) entries.push(currentEntry)
      currentEntry = parsed
    } else if (currentEntry && line.trim()) {
      // Continuation line — likely stack trace or multi-line message
      currentEntry.stackTrace = (currentEntry.stackTrace || '') + '\n' + line
    }
  }
  if (currentEntry) entries.push(currentEntry)

  return entries
}

function formatRelativeTime(ts: number): string {
  const now = Date.now()
  const diff = Math.floor((now - ts) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** Generate actionable suggestions from scan results, prioritized by severity */
function generateSuggestedActions(sentryIssues: SentryEmail[], logEntries: ErrorLogEntry[]): SuggestedAction[] {
  const actions: SuggestedAction[] = []

  // Sentry issues are high priority — they represent production errors
  for (const issue of sentryIssues) {
    const severity = /\b(panic|fatal|SIGSEG|crash|OOM)\b/i.test(issue.body + issue.subject) ? 'critical' as const : 'high' as const
    actions.push({
      id: `sentry-${issue.id}`,
      title: issue.issueTitle || issue.subject,
      description: `${issue.projectName ? `[${issue.projectName}] ` : ''}${issue.errorType || 'Error'}: ${issue.snippet.slice(0, 120)}`,
      severity,
      sourceEntry: issue,
      sourceType: 'sentry',
    })
  }

  // Deduplicate log entries by message prefix to avoid flooding with repeated errors
  const seenMessages = new Set<string>()
  for (const entry of logEntries) {
    const msgKey = entry.message.slice(0, 80)
    if (seenMessages.has(msgKey)) continue
    seenMessages.add(msgKey)

    const severity = entry.level === 'fatal' ? 'critical' as const
      : /\b(panic|SIGSEG|crash|OOM|killed|abort)\b/i.test(entry.message) ? 'critical' as const
      : /\b(refused|ECONNREFUSED|timeout|deadlock)\b/i.test(entry.message) ? 'high' as const
      : 'medium' as const

    actions.push({
      id: `log-${entry.source}-${entry.timestamp}-${actions.length}`,
      title: entry.message.slice(0, 100),
      description: `[${entry.source}] ${entry.level.toUpperCase()} at ${entry.timestamp || 'unknown time'}`,
      severity,
      sourceEntry: entry,
      sourceType: 'log',
    })
  }

  // Sort: critical first, then high, then medium
  const severityOrder = { critical: 0, high: 1, medium: 2 }
  actions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return actions
}

const DEFAULT_REPO = 'knap-ai/knapsack_desktop'

function loadGithubRepos(): string[] {
  try {
    const stored = localStorage.getItem('kn_dev_mode_github_repos')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [DEFAULT_REPO]
}

function saveGithubRepos(repos: string[]) {
  localStorage.setItem('kn_dev_mode_github_repos', JSON.stringify(repos))
}

function loadActiveRepo(): string {
  return localStorage.getItem('kn_dev_mode_active_repo') || DEFAULT_REPO
}

function saveActiveRepo(repo: string) {
  localStorage.setItem('kn_dev_mode_active_repo', repo)
}

export const DeveloperModePanel = ({ onInitiateSession, userEmail: _userEmail }: DeveloperModePanelProps) => {
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState<DevScanResult[]>([])
  const [autoScanEnabled, setAutoScanEnabled] = useState(() => {
    return localStorage.getItem('kn_dev_mode_autoscan') === 'true'
  })
  const [scanInterval, setScanInterval] = useState(() => {
    return parseInt(localStorage.getItem('kn_dev_mode_scan_interval') || '60', 10)
  })
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [initiatingPR, setInitiatingPR] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logSources, setLogSources] = useState<Record<string, number>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [githubRepos, setGithubRepos] = useState<string[]>(loadGithubRepos)
  const [activeRepo, setActiveRepo] = useState<string>(loadActiveRepo)
  const [newRepoInput, setNewRepoInput] = useState('')
  const [showRepoInput, setShowRepoInput] = useState(false)

  // ── Email scanning: search for Sentry alerts ──
  const searchSentryEmails = useCallback(async (): Promise<SentryEmail[]> => {
    const allEmails: SentryEmail[] = []
    const seenIds = new Set<string>()

    for (const query of SENTRY_SEARCH_QUERIES) {
      try {
        const resp = await fetch(KN_GMAIL_SEARCH, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, top: 10 }),
        })
        if (!resp.ok) continue
        const data = await resp.json()
        if (!data?.success || !data.display_docs) continue

        for (const doc of data.display_docs) {
          const parsed = parseSentryEmail(doc)
          if (!seenIds.has(parsed.id)) {
            seenIds.add(parsed.id)
            allEmails.push(parsed)
          }
        }
      } catch {
        // Search query failed — continue with next
      }
    }

    return allEmails
  }, [])

  // ── Local log scanning: read ALL error sources from the desktop app ──
  const fetchAllErrorLogs = useCallback(async (): Promise<ErrorLogEntry[]> => {
    const allEntries: ErrorLogEntry[] = []
    const sources: Record<string, number> = {}

    // 1. Tauri backend error log (ks_error.log) — Rust panics, server errors, DB errors
    try {
      const errorLines: string[] = await invoke('kn_read_logs', { logType: 'error', maxLines: 200 })
      const parsed = parseLogLines(errorLines)
      sources['ks_error.log'] = parsed.length
      for (const entry of parsed) {
        entry.source = 'backend:' + entry.source
        allEntries.push(entry)
      }
    } catch {
      sources['ks_error.log'] = -1
    }

    // 2. Tauri backend general log (ks.log) — filter for errors/warnings only
    try {
      const allLines: string[] = await invoke('kn_read_logs', { logType: 'all', maxLines: 500 })
      const parsed = parseLogLines(allLines)
      sources['ks.log'] = parsed.length
      const existingMessages = new Set(allEntries.map(e => e.message))
      for (const entry of parsed) {
        if (!existingMessages.has(entry.message)) {
          entry.source = 'backend:' + entry.source
          allEntries.push(entry)
        }
      }
    } catch {
      sources['ks.log'] = -1
    }

    // 3. Browser console errors — captured by OpenClaw's console interception
    try {
      const resp = await fetch(`${API_BASE}/api/clawd/browser/console?level=error&limit=50`)
      if (resp.ok) {
        const data = await resp.json()
        const entries = data?.entries || data?.logs || []
        sources['browser-console'] = entries.length
        for (const entry of entries) {
          allEntries.push({
            source: 'browser:console',
            level: entry.level === 'warning' ? 'warning' : 'error',
            message: entry.message || entry.text || JSON.stringify(entry),
            timestamp: entry.timestamp || new Date().toISOString(),
            stackTrace: entry.stackTrace || entry.stack,
          })
        }
      }
    } catch {
      sources['browser-console'] = -1
    }

    // 4. Frontend Sentry breadcrumbs — read from Sentry SDK in-memory
    try {
      const sentryModule = await import('@sentry/react')
      const scope = sentryModule.getCurrentScope?.()
      if (scope) {
        const breadcrumbs = (scope as any)._breadcrumbs || []
        const errorBreadcrumbs = breadcrumbs.filter(
          (b: any) => b.level === 'error' || b.level === 'fatal',
        )
        sources['sentry-breadcrumbs'] = errorBreadcrumbs.length
        for (const crumb of errorBreadcrumbs) {
          allEntries.push({
            source: 'sentry:breadcrumb',
            level: crumb.level === 'fatal' ? 'fatal' : 'error',
            message: crumb.message || `${crumb.category}: ${crumb.data ? JSON.stringify(crumb.data) : ''}`,
            timestamp: crumb.timestamp ? new Date(crumb.timestamp * 1000).toISOString() : '',
          })
        }
      }
    } catch {
      sources['sentry-breadcrumbs'] = -1
    }

    // 5. Heartbeat system errors
    try {
      const resp = await fetch(`${API_BASE}/api/knapsack/heartbeat/logs`)
      if (resp.ok) {
        const data = await resp.json()
        if (data.success && data.data) {
          const errorLogs = data.data.filter(
            (log: any) => log.decision === 'error' || (log.notificationContent || '').toLowerCase().includes('error'),
          )
          sources['heartbeat'] = errorLogs.length
          for (const log of errorLogs) {
            allEntries.push({
              source: 'heartbeat',
              level: 'error',
              message: log.notificationContent || log.contextSummary || 'Heartbeat error',
              timestamp: log.runAt ? new Date(log.runAt * 1000).toISOString() : '',
            })
          }
        }
      }
    } catch {
      sources['heartbeat'] = -1
    }

    // 6. Gateway/OpenClaw agent errors
    try {
      const resp = await fetch(`${API_BASE}/api/clawd/agent-status`)
      if (resp.ok) {
        const data = await resp.json()
        if (data.error || data.lastError) {
          sources['openclaw-agent'] = 1
          allEntries.push({
            source: 'openclaw:agent',
            level: 'error',
            message: data.error || data.lastError,
            timestamp: data.lastErrorTime || new Date().toISOString(),
          })
        } else {
          sources['openclaw-agent'] = 0
        }
      }
    } catch {
      sources['openclaw-agent'] = -1
    }

    // 7. Unhandled frontend exceptions — from our global error buffer
    try {
      const errorBuffer = (window as any).__kn_error_buffer
      if (Array.isArray(errorBuffer)) {
        sources['window-errors'] = errorBuffer.length
        for (const err of errorBuffer) {
          allEntries.push({
            source: 'frontend:unhandled',
            level: 'error',
            message: typeof err === 'string' ? err : (err.message || JSON.stringify(err)),
            timestamp: err.timestamp || new Date().toISOString(),
            stackTrace: err.stack,
          })
        }
      }
    } catch {
      sources['window-errors'] = -1
    }

    // 8. Terminal/PTY session errors — recent terminal output that contains error patterns
    try {
      const resp = await fetch(`${API_BASE}/api/clawd/terminal/output?max_lines=100`)
      if (resp.ok) {
        const data = await resp.json()
        const output = data?.output || data?.text || ''
        const lines = typeof output === 'string' ? output.split('\n') : (Array.isArray(output) ? output : [])
        const errorLines = lines.filter((line: string) =>
          /\b(error|panic|fatal|failed|exception|traceback|segfault)\b/i.test(line) &&
          !/\b(0 errors?|no errors?|error.ts|errorHandling)\b/i.test(line),
        )
        sources['terminal'] = errorLines.length
        if (errorLines.length > 0) {
          allEntries.push({
            source: 'terminal:pty',
            level: 'error',
            message: errorLines.slice(0, 5).join('\n'),
            timestamp: new Date().toISOString(),
            stackTrace: errorLines.length > 5 ? errorLines.slice(5).join('\n') : undefined,
          })
        }
      }
    } catch {
      sources['terminal'] = -1
    }

    // 9. Clawdbot gateway stderr — /tmp/knapsack-clawdbot.err.log (the main gateway process log)
    try {
      const errLines: string[] = await invoke('kn_read_logs', { logType: 'clawdbot_err', maxLines: 200 })
      const parsed = parseRawLogLines(errLines, 'clawdbot:stderr')
      sources['clawdbot-stderr'] = parsed.length
      for (const entry of parsed) {
        allEntries.push(entry)
      }
    } catch {
      // Also try the HTTP API fallback (works when gateway is running)
      try {
        const resp = await fetch(`${API_BASE}/api/clawd/service/logs?stream=stderr&lines=200`)
        if (resp.ok) {
          const data = await resp.json()
          if (data.success && data.text) {
            const lines = data.text.split('\n')
            const parsed = parseRawLogLines(lines, 'clawdbot:stderr')
            sources['clawdbot-stderr'] = parsed.length
            for (const entry of parsed) {
              allEntries.push(entry)
            }
          }
        }
      } catch {
        sources['clawdbot-stderr'] = -1
      }
    }

    // 10. Clawdbot gateway stdout — /tmp/knapsack-clawdbot.out.log
    try {
      const outLines: string[] = await invoke('kn_read_logs', { logType: 'clawdbot_out', maxLines: 100 })
      const parsed = parseRawLogLines(outLines, 'clawdbot:stdout')
      sources['clawdbot-stdout'] = parsed.length
      for (const entry of parsed) {
        allEntries.push(entry)
      }
    } catch {
      try {
        const resp = await fetch(`${API_BASE}/api/clawd/service/logs?stream=stdout&lines=100`)
        if (resp.ok) {
          const data = await resp.json()
          if (data.success && data.text) {
            const lines = data.text.split('\n')
            const parsed = parseRawLogLines(lines, 'clawdbot:stdout')
            sources['clawdbot-stdout'] = parsed.length
            for (const entry of parsed) {
              allEntries.push(entry)
            }
          }
        }
      } catch {
        sources['clawdbot-stdout'] = -1
      }
    }

    setLogSources(sources)

    // Sort by timestamp (most recent first) and deduplicate by message
    const seen = new Set<string>()
    const deduped: ErrorLogEntry[] = []
    for (const entry of allEntries) {
      const key = entry.source + ':' + entry.message.slice(0, 100)
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(entry)
      }
    }

    return deduped.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return tb - ta
    })
  }, [])

  const runScan = useCallback(async () => {
    setScanning(true)
    setError(null)

    const scanId = crypto.randomUUID()
    const result: DevScanResult = {
      id: scanId,
      timestamp: Date.now(),
      sentryIssues: [],
      errorLogEntries: [],
      suggestedActions: [],
      status: 'scanning',
    }

    setScanResults(prev => [result, ...prev.slice(0, 9)])

    try {
      const [sentryEmails, errorLogs] = await Promise.all([
        searchSentryEmails(),
        fetchAllErrorLogs(),
      ])

      const suggested = generateSuggestedActions(sentryEmails, errorLogs)
      result.sentryIssues = sentryEmails
      result.errorLogEntries = errorLogs
      result.suggestedActions = suggested
      result.status = 'done'
      const criticalCount = suggested.filter(a => a.severity === 'critical').length
      const highCount = suggested.filter(a => a.severity === 'high').length
      result.summary = criticalCount > 0
        ? `Found ${suggested.length} actionable issue${suggested.length !== 1 ? 's' : ''} (${criticalCount} critical, ${highCount} high) — ${errorLogs.length} errors across all logs`
        : `Found ${sentryEmails.length} Sentry issue${sentryEmails.length !== 1 ? 's' : ''}, ${errorLogs.length} error${errorLogs.length !== 1 ? 's' : ''} in logs — ${suggested.length} actionable`

      setScanResults(prev =>
        prev.map(r => (r.id === scanId ? { ...result } : r)),
      )
    } catch (e) {
      result.status = 'error'
      result.summary = `Scan failed: ${e instanceof Error ? e.message : 'Unknown error'}`
      setScanResults(prev =>
        prev.map(r => (r.id === scanId ? { ...result } : r)),
      )
      setError(result.summary)
    } finally {
      setScanning(false)
    }
  }, [searchSentryEmails, fetchAllErrorLogs])

  // Auto-scan interval
  useEffect(() => {
    if (autoScanEnabled && scanInterval > 0) {
      runScan()
      intervalRef.current = setInterval(runScan, scanInterval * 60 * 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoScanEnabled, scanInterval, runScan])

  // Install a global error buffer on mount so we can capture unhandled errors
  useEffect(() => {
    if (!(window as any).__kn_error_buffer) {
      ;(window as any).__kn_error_buffer = []
    }
    const handler = (event: ErrorEvent) => {
      const buf = (window as any).__kn_error_buffer
      if (Array.isArray(buf) && buf.length < 100) {
        buf.push({
          message: event.message,
          stack: event.error?.stack,
          timestamp: new Date().toISOString(),
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        })
      }
    }
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const buf = (window as any).__kn_error_buffer
      if (Array.isArray(buf) && buf.length < 100) {
        const reason = event.reason
        buf.push({
          message: reason?.message || String(reason),
          stack: reason?.stack,
          timestamp: new Date().toISOString(),
        })
      }
    }
    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', rejectionHandler)
    return () => {
      window.removeEventListener('error', handler)
      window.removeEventListener('unhandledrejection', rejectionHandler)
    }
  }, [])

  const handleAddRepo = useCallback(() => {
    const repo = newRepoInput.trim()
    // Accept owner/repo format
    if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return
    if (githubRepos.includes(repo)) {
      setNewRepoInput('')
      setShowRepoInput(false)
      return
    }
    const updated = [...githubRepos, repo]
    setGithubRepos(updated)
    saveGithubRepos(updated)
    setActiveRepo(repo)
    saveActiveRepo(repo)
    setNewRepoInput('')
    setShowRepoInput(false)
  }, [newRepoInput, githubRepos])

  const handleRemoveRepo = useCallback((repo: string) => {
    if (repo === DEFAULT_REPO) return // Can't remove the default
    const updated = githubRepos.filter(r => r !== repo)
    if (updated.length === 0) updated.push(DEFAULT_REPO)
    setGithubRepos(updated)
    saveGithubRepos(updated)
    if (activeRepo === repo) {
      setActiveRepo(updated[0])
      saveActiveRepo(updated[0])
    }
  }, [githubRepos, activeRepo])

  const handleSelectRepo = useCallback((repo: string) => {
    setActiveRepo(repo)
    saveActiveRepo(repo)
  }, [])

  const toggleAutoScan = useCallback(() => {
    const next = !autoScanEnabled
    setAutoScanEnabled(next)
    localStorage.setItem('kn_dev_mode_autoscan', String(next))
  }, [autoScanEnabled])

  const updateInterval = useCallback((mins: number) => {
    setScanInterval(mins)
    localStorage.setItem('kn_dev_mode_scan_interval', String(mins))
  }, [])

  const handleInitiateSession = useCallback(
    (issue: SentryEmail) => {
      setInitiatingPR(issue.id)

      const repoName = activeRepo.split('/').pop() || activeRepo
      const prompt = [
        `I found a Sentry error report that needs investigation and a fix:`,
        ``,
        `**Project:** ${issue.projectName || 'Unknown'}`,
        `**Error:** ${issue.errorType || 'Error'}`,
        `**Title:** ${issue.issueTitle || issue.subject}`,
        `**Target repo:** ${activeRepo}`,
        ``,
        `**Details from Sentry email:**`,
        '```',
        issue.snippet || issue.body.slice(0, 500),
        '```',
        ``,
        `Please investigate this bug in the ${repoName} codebase (${activeRepo}):`,
        `1. Search for the relevant code that could cause this error`,
        `2. Identify the root cause`,
        `3. Implement a fix`,
        `4. Create a PR with the fix in the ${activeRepo} repository`,
        ``,
        `Use Advanced mode shell commands if needed to search the codebase and run tests.`,
      ].join('\n')

      onInitiateSession(prompt)
      setTimeout(() => setInitiatingPR(null), 2000)
    },
    [onInitiateSession, activeRepo],
  )

  const handleInitiateFromLog = useCallback(
    (entry: ErrorLogEntry) => {
      const repoName = activeRepo.split('/').pop() || activeRepo
      const prompt = [
        `I found an error in the application logs that needs investigation:`,
        ``,
        `**Source:** ${entry.source}`,
        `**Level:** ${entry.level}`,
        `**Timestamp:** ${entry.timestamp}`,
        `**Message:** ${entry.message}`,
        `**Target repo:** ${activeRepo}`,
        entry.stackTrace ? `\n**Stack trace:**\n\`\`\`\n${entry.stackTrace}\n\`\`\`` : '',
        ``,
        `Please investigate this error in the ${repoName} codebase (${activeRepo}):`,
        `1. Search for the relevant code referenced in the error`,
        `2. Identify the root cause`,
        `3. Implement a fix`,
        `4. Create a PR with the fix in the ${activeRepo} repository`,
      ].join('\n')

      onInitiateSession(prompt)
    },
    [onInitiateSession, activeRepo],
  )

  const handleInitiateFromAction = useCallback(
    (action: SuggestedAction) => {
      if (action.sourceType === 'sentry') {
        handleInitiateSession(action.sourceEntry as SentryEmail)
      } else {
        handleInitiateFromLog(action.sourceEntry as ErrorLogEntry)
      }
    },
    [handleInitiateSession, handleInitiateFromLog],
  )

  const latestScan = scanResults[0]

  return (
    <div className="DevModePanel">
      <div className="DevModePanel__header">
        <div className="DevModePanel__title">
          <span className="DevModePanel__icon">{'{}'}</span>
          Developer Mode
        </div>
        <span className="DevModePanel__badge">BETA</span>
      </div>

      <div className="DevModePanel__description">
        Self-improving mode: scans all error sources — Sentry emails, backend logs (ks.log, ks_error.log), clawdbot gateway logs (/tmp/knapsack-clawdbot.err.log), browser console, frontend exceptions, heartbeat errors, OpenClaw agent errors, and terminal output — then suggests PRs and fixes. Enable auto-scan for continuous self-improvement.
      </div>

      {/* GitHub repository targeting */}
      <div className="DevModePanel__repos">
        <div className="DevModePanel__reposHeader">
          <span className="DevModePanel__sourcesTitle">Target Repository</span>
          <button
            className="DevModePanel__repoAddBtn"
            onClick={() => setShowRepoInput(!showRepoInput)}
            title="Add a GitHub repository"
          >
            +
          </button>
        </div>
        <div className="DevModePanel__repoList">
          {githubRepos.map(repo => (
            <div
              key={repo}
              className={`DevModePanel__repoChip ${activeRepo === repo ? 'DevModePanel__repoChip--active' : ''}`}
              onClick={() => handleSelectRepo(repo)}
            >
              <span className="DevModePanel__repoName">{repo}</span>
              {repo !== DEFAULT_REPO && (
                <button
                  className="DevModePanel__repoRemoveBtn"
                  onClick={e => {
                    e.stopPropagation()
                    handleRemoveRepo(repo)
                  }}
                  title="Remove repository"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
        {showRepoInput && (
          <div className="DevModePanel__repoInputRow">
            <input
              className="DevModePanel__repoInput"
              type="text"
              placeholder="owner/repo"
              value={newRepoInput}
              onChange={e => setNewRepoInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddRepo()
                if (e.key === 'Escape') {
                  setShowRepoInput(false)
                  setNewRepoInput('')
                }
              }}
              autoFocus
            />
            <button
              className="DevModePanel__repoConfirmBtn"
              onClick={handleAddRepo}
              disabled={!newRepoInput.trim() || !/^[\w.-]+\/[\w.-]+$/.test(newRepoInput.trim())}
            >
              Add
            </button>
          </div>
        )}
        <div className="DevModePanel__settingHint">
          Bugs and PRs will target the selected repository
        </div>
      </div>

      {error && <div className="DevModePanel__error">{error}</div>}

      {/* Log sources status */}
      {Object.keys(logSources).length > 0 && (
        <div className="DevModePanel__sources">
          <div className="DevModePanel__sourcesTitle">Log sources scanned</div>
          <div className="DevModePanel__sourcesList">
            {Object.entries(logSources).map(([source, count]) => (
              <span
                key={source}
                className={`DevModePanel__sourceChip ${count === -1 ? 'DevModePanel__sourceChip--unavailable' : count > 0 ? 'DevModePanel__sourceChip--errors' : 'DevModePanel__sourceChip--clean'}`}
              >
                {source} {count === -1 ? '(N/A)' : `(${count})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Auto-scan toggle */}
      <div className="DevModePanel__setting">
        <div className="DevModePanel__settingInfo">
          <span className="DevModePanel__settingLabel">Auto-scan for errors</span>
          <span className="DevModePanel__settingHint">
            Periodically check all log sources and email for new errors
          </span>
        </div>
        <button
          onClick={toggleAutoScan}
          className={`DevModePanel__toggle ${autoScanEnabled ? 'DevModePanel__toggle--on' : ''}`}
        >
          <span className="DevModePanel__toggleKnob" />
        </button>
      </div>

      {/* Scan interval */}
      {autoScanEnabled && (
        <div className="DevModePanel__setting">
          <span className="DevModePanel__settingLabel">Scan interval</span>
          <select
            value={scanInterval.toString()}
            onChange={e => updateInterval(parseInt(e.target.value))}
            className="DevModePanel__select"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
      )}

      {/* Manual scan button */}
      <div className="DevModePanel__actions">
        <button
          onClick={runScan}
          disabled={scanning}
          className="DevModePanel__scanBtn"
        >
          {scanning ? 'Scanning all sources...' : 'Scan Now'}
        </button>
        {latestScan && (
          <span className="DevModePanel__lastScan">
            Last scan: {formatRelativeTime(latestScan.timestamp)}
          </span>
        )}
      </div>

      {/* Scan results */}
      {latestScan && latestScan.status === 'done' && (
        <div className="DevModePanel__results">
          {latestScan.summary && (
            <div className="DevModePanel__summary">{latestScan.summary}</div>
          )}

          {/* Suggested actions — shown first, most actionable */}
          {latestScan.suggestedActions.length > 0 && (
            <div className="DevModePanel__section">
              <div className="DevModePanel__sectionTitle">
                Suggested Actions ({latestScan.suggestedActions.length})
              </div>
              {latestScan.suggestedActions.slice(0, 20).map(action => (
                <div key={action.id} className={`DevModePanel__suggestion DevModePanel__suggestion--${action.severity}`}>
                  <div className="DevModePanel__suggestionHeader">
                    <span className={`DevModePanel__severityBadge DevModePanel__severityBadge--${action.severity}`}>
                      {action.severity.toUpperCase()}
                    </span>
                    <span className="DevModePanel__suggestionTitle">{action.title}</span>
                  </div>
                  <div className="DevModePanel__suggestionDesc">{action.description}</div>
                  <button
                    className="DevModePanel__fixBtn"
                    onClick={() => handleInitiateFromAction(action)}
                  >
                    Investigate & Create PR
                  </button>
                </div>
              ))}
              {latestScan.suggestedActions.length > 20 && (
                <div className="DevModePanel__moreIndicator">
                  ...and {latestScan.suggestedActions.length - 20} more suggestions
                </div>
              )}
            </div>
          )}

          {/* Sentry issues from email */}
          {latestScan.sentryIssues.length > 0 && (
            <div className="DevModePanel__section">
              <div className="DevModePanel__sectionTitle">Sentry Issues (Email)</div>
              {latestScan.sentryIssues.map(issue => (
                <div
                  key={issue.id}
                  className={`DevModePanel__issue ${expandedIssue === issue.id ? 'DevModePanel__issue--expanded' : ''}`}
                >
                  <div
                    className="DevModePanel__issueHeader"
                    onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                  >
                    <div className="DevModePanel__issueInfo">
                      {issue.errorType && (
                        <span className="DevModePanel__errorType">{issue.errorType}</span>
                      )}
                      {issue.projectName && (
                        <span className="DevModePanel__projectName">{issue.projectName}</span>
                      )}
                      <span className="DevModePanel__issueTitle">
                        {issue.issueTitle || issue.subject}
                      </span>
                    </div>
                    <span className="DevModePanel__chevron">
                      {expandedIssue === issue.id ? '\u25B4' : '\u25BE'}
                    </span>
                  </div>

                  {expandedIssue === issue.id && (
                    <div className="DevModePanel__issueBody">
                      <div className="DevModePanel__issueSnippet">{issue.snippet}</div>
                      <div className="DevModePanel__issueDate">
                        {issue.date && new Date(issue.date).toLocaleString()}
                      </div>
                      <button
                        className="DevModePanel__fixBtn"
                        onClick={() => handleInitiateSession(issue)}
                        disabled={initiatingPR === issue.id}
                      >
                        {initiatingPR === issue.id
                          ? 'Initiating...'
                          : 'Investigate & Fix with Claude Code'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error log entries */}
          {latestScan.errorLogEntries.length > 0 && (
            <div className="DevModePanel__section">
              <div className="DevModePanel__sectionTitle">
                Application Errors ({latestScan.errorLogEntries.length})
              </div>
              {latestScan.errorLogEntries.slice(0, 30).map((entry, idx) => (
                <div key={idx} className="DevModePanel__logEntry">
                  <div className="DevModePanel__logHeader">
                    <span className={`DevModePanel__logLevel DevModePanel__logLevel--${entry.level}`}>
                      {entry.level.toUpperCase()}
                    </span>
                    <span className="DevModePanel__logSource">{entry.source}</span>
                    {entry.timestamp && (
                      <span className="DevModePanel__logTime">{entry.timestamp}</span>
                    )}
                  </div>
                  <div className="DevModePanel__logMessage">{entry.message}</div>
                  {entry.stackTrace && (
                    <details className="DevModePanel__stackDetails">
                      <summary>Stack trace</summary>
                      <pre className="DevModePanel__stackTrace">{entry.stackTrace}</pre>
                    </details>
                  )}
                  <button
                    className="DevModePanel__fixBtnSmall"
                    onClick={() => handleInitiateFromLog(entry)}
                  >
                    Investigate & Fix
                  </button>
                </div>
              ))}
              {latestScan.errorLogEntries.length > 30 && (
                <div className="DevModePanel__moreIndicator">
                  ...and {latestScan.errorLogEntries.length - 30} more errors
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {latestScan.sentryIssues.length === 0 && latestScan.errorLogEntries.length === 0 && (
            <div className="DevModePanel__empty">
              No Sentry issues or error logs found across any source. Looking good!
            </div>
          )}
        </div>
      )}

      {/* Scan history */}
      {scanResults.length > 1 && (
        <div className="DevModePanel__history">
          <div className="DevModePanel__sectionTitle">Scan History</div>
          {scanResults.slice(1, 6).map(scan => (
            <div key={scan.id} className="DevModePanel__historyEntry">
              <span className="DevModePanel__historyTime">
                {formatRelativeTime(scan.timestamp)}
              </span>
              <span className="DevModePanel__historySummary">
                {scan.summary || scan.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeveloperModePanel
