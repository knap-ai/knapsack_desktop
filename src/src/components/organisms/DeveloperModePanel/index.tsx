import { useCallback, useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { sendNotification } from '@tauri-apps/api/notification'
import './style.scss'

const API_BASE = 'http://127.0.0.1:8897'
const KN_GMAIL_SEARCH = API_BASE + '/api/knapsack/gmail_search'
const KN_API_THREADS = API_BASE + '/api/knapsack/threads'
const KN_API_TRANSCRIPT = API_BASE + '/api/knapsack/transcript'

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
  proactiveMode?: boolean
}

/** Maps repo → default reviewer for auto-created PRs */
const REPO_REVIEWERS: Record<string, string> = {
  'knap-ai/knapsack_desktop': 'heynenm',
}

/** Max auto-initiated PR sessions per scan cycle (prevent runaway) */
const MAX_AUTO_SESSIONS_PER_SCAN = 2

/**
 * Safety gate: patterns that should NEVER be auto-fixed proactively because
 * they could introduce security vulnerabilities or harm users.
 * These are filtered out before the AI even sees them.
 */
const UNSAFE_AUTOFIX_PATTERNS = [
  /\b(auth|authentication|authorization|oauth|jwt|token|credential|password|secret|api.?key|private.?key)\b/i,
  /\b(sql.?inject|xss|csrf|cors|injection|sanitiz|escap|encrypt|decrypt|hash|salt)\b/i,
  /\b(permission|privilege|escalat|admin|root|sudo|chmod|chown)\b/i,
  /\b(certificate|ssl|tls|https|cert.?pin)\b/i,
  /\b(eval|exec|spawn|child.?process|require\(.*\+|\.call\(|\.apply\()\b/i,
]

/** Pre-flight safety check: returns true if action is safe to auto-fix */
function isActionSafeForAutoFix(action: SuggestedAction): { safe: boolean; reason?: string } {
  const text = action.title + ' ' + action.description
  const entry = action.sourceEntry
  const fullText = text + ' ' + ('message' in entry ? entry.message : '') + ' ' + ('stackTrace' in entry && entry.stackTrace ? entry.stackTrace : '')

  for (const pattern of UNSAFE_AUTOFIX_PATTERNS) {
    if (pattern.test(fullText)) {
      return { safe: false, reason: `Touches security-sensitive area: ${pattern.source.slice(0, 40)}` }
    }
  }
  return { safe: true }
}

/**
 * Safety preamble injected into all auto-initiated PR prompts.
 * Forces the AI to answer these questions before proceeding.
 */
const SAFETY_GATE_PREAMBLE = `
**IMPORTANT — Before creating any PR, you MUST answer these two questions:**

1. **Is this good for the user?** — Will this fix genuinely improve the user experience, fix a real bug, or add real value? If the error is transient, expected, or cosmetic with no user impact, do NOT create a PR — just report your findings.

2. **Does this introduce security vulnerabilities?** — Could this fix introduce SQL injection, XSS, CSRF, authentication bypasses, credential exposure, command injection, or any other security vulnerability? If yes, do NOT create the PR — report the security concern instead.

If either answer is negative, explain why and stop. Do NOT create a PR that could harm users or compromise security.
`

/** localStorage key to track last auto-fix timestamp to throttle */
const KN_DEV_LAST_AUTOFIX = 'kn_dev_mode_last_autofix'

/** localStorage keys for proactive scope settings */
const KN_DEV_AUTOFIX_SCOPE = 'kn_dev_mode_autofix_scope'
const KN_DEV_SOCIAL_SCAN = 'kn_dev_mode_social_scan'

/** Minimum minutes between auto-initiated PR sessions */
const AUTOFIX_THROTTLE_MINUTES = 30

interface AutoFixScope {
  critical: boolean
  high: boolean
  medium: boolean
}

interface SocialScanConfig {
  enabled: boolean
  twitter: boolean
  reddit: boolean
  github: boolean
  meetings: boolean
  keywords: string[]
}

/** localStorage key for social scan last check */
const KN_DEV_SOCIAL_LAST_CHECK = 'kn_dev_mode_social_last_check'

/** Throttle social scans (hours) */
const SOCIAL_SCAN_INTERVAL_HOURS = 6

/** localStorage key for last OpenClaw update check */
const KN_DEV_OPENCLAW_CHECK = 'kn_dev_mode_openclaw_check'

/** How often to re-check for OpenClaw updates (hours) */
const OPENCLAW_CHECK_INTERVAL_HOURS = 12

/** npm registry URL for openclaw */
const OPENCLAW_NPM_REGISTRY = 'https://registry.npmjs.org/openclaw'

interface SocialPost {
  id: string
  platform: 'twitter' | 'reddit' | 'github'
  title: string
  body: string
  url: string
  author: string
  score?: number
  timestamp: string
  relevance: 'feature-request' | 'bug-report' | 'idea' | 'discussion'
}

interface SocialScanResult {
  posts: SocialPost[]
  lastChecked: number
  status: 'checking' | 'done' | 'error'
  error?: string
}

interface MeetingNoteInsight {
  id: string
  meetingTitle: string
  threadId: number
  timestamp: string
  actionItems: string[]
  featureIdeas: string[]
  bugsMentioned: string[]
  raw: string
}

interface OpenClawUpdateInfo {
  currentVersion: string
  latestVersion: string | null
  availableVersions: string[]
  lastChecked: number
  status: 'checking' | 'up-to-date' | 'update-available' | 'major-update' | 'error'
  changelog?: string
  error?: string
}

/** Compare semver-ish versions: returns -1 (a<b), 0 (equal), 1 (a>b) */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na < nb) return -1
    if (na > nb) return 1
  }
  return 0
}

/** Determine if an update is a major bump (first segment differs) */
function isMajorUpdate(current: string, latest: string): boolean {
  const ca = current.split('.')[0]
  const la = latest.split('.')[0]
  return ca !== la
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

export const DeveloperModePanel = ({ onInitiateSession, userEmail: _userEmail, proactiveMode }: DeveloperModePanelProps) => {
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
  const [autoFixLog, setAutoFixLog] = useState<string[]>([])
  const [autoFixScope, setAutoFixScope] = useState<AutoFixScope>(() => {
    try {
      const stored = localStorage.getItem(KN_DEV_AUTOFIX_SCOPE)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (typeof parsed === 'object' && parsed !== null) return parsed
      }
    } catch { /* migrate from old format */ }
    return { critical: true, high: false, medium: false }
  })
  const [socialScan, setSocialScan] = useState<SocialScanConfig>(() => {
    try {
      const stored = localStorage.getItem(KN_DEV_SOCIAL_SCAN)
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return { enabled: false, twitter: true, reddit: true, github: true, meetings: true, keywords: [] }
  })
  const [socialResults, setSocialResults] = useState<SocialScanResult | null>(null)
  const [meetingInsights, setMeetingInsights] = useState<MeetingNoteInsight[]>([])
  const [openclawUpdate, setOpenclawUpdate] = useState<OpenClawUpdateInfo | null>(() => {
    try {
      const stored = localStorage.getItem(KN_DEV_OPENCLAW_CHECK)
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return null
  })
  const [bundledOpenclawVersion, setBundledOpenclawVersion] = useState<string | null>(null)
  const autoFixInProgressRef = useRef(false)

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

      // Also check for OpenClaw updates and social media during scans
      checkOpenClawUpdates()
      if (socialScan.enabled) {
        scanSocialMedia()
        scanMeetingNotes()
      }

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

      // ── Proactive auto-fix: if proactive mode is on, auto-initiate sessions for in-scope issues ──
      if (proactiveMode && autoScanEnabled && suggested.length > 0) {
        const inScopeActions = suggested.filter(a => autoFixScope[a.severity])
        if (inScopeActions.length > 0) {
          handleProactiveAutoFix(inScopeActions)
        }
      }
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
  }, [searchSentryEmails, fetchAllErrorLogs, proactiveMode, autoScanEnabled, autoFixScope]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const updateAutoFixScope = useCallback((key: keyof AutoFixScope, value: boolean) => {
    setAutoFixScope(prev => {
      // Critical is always on — can't uncheck it
      if (key === 'critical' && !value) return prev
      const next = { ...prev, [key]: value }
      localStorage.setItem(KN_DEV_AUTOFIX_SCOPE, JSON.stringify(next))
      return next
    })
  }, [])

  const updateSocialScan = useCallback((update: Partial<SocialScanConfig>) => {
    setSocialScan(prev => {
      const next = { ...prev, ...update }
      localStorage.setItem(KN_DEV_SOCIAL_SCAN, JSON.stringify(next))
      return next
    })
  }, [])

  // ── Meeting notes scanning ──
  const scanMeetingNotes = useCallback(async () => {
    if (!socialScan.enabled || !socialScan.meetings) return

    try {
      const insights: MeetingNoteInsight[] = []

      // Primary: use /api/knapsack/notes/list which returns all notes with content + metadata
      const notesResp = await fetch(`${API_BASE}/api/knapsack/notes/list`)
      if (notesResp.ok) {
        const notesData = await notesResp.json()
        if (notesData?.success && notesData?.data?.notes) {
          // Filter to recent notes (last 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const recentNotes = notesData.data.notes.filter((note: any) => {
            const startTime = note.start_time
            if (!startTime) return true
            const ts = typeof startTime === 'number' ? startTime * 1000 : new Date(startTime).getTime()
            return ts > sevenDaysAgo
          }).slice(0, 15)

          for (const note of recentNotes) {
            const content = note.content || ''
            if (!content.trim()) continue

            const title = note.filename || `Meeting ${note.thread_id}`
            const participants = note.participants || ''

            // Extract action items, feature ideas, and bug mentions
            const actionItems: string[] = []
            const featureIdeas: string[] = []
            const bugsMentioned: string[] = []

            const lines = content.split('\n')
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || trimmed.length < 5) continue

              // Action items: "TODO", "action item", "we need to", "let's", "should"
              if (/\b(TODO|action item|we need to|let's|we should|follow up|next step|assigned to|take away|owner:)\b/i.test(trimmed)) {
                actionItems.push(trimmed.slice(0, 200))
              }
              // Feature ideas: "feature", "it would be nice", "we could add", "idea"
              if (/\b(feature|it would be (nice|great|cool)|we could add|idea|how about|what if we|wouldn't it be|enhancement|improvement|roadmap|backlog)\b/i.test(trimmed)) {
                featureIdeas.push(trimmed.slice(0, 200))
              }
              // Bug mentions: "bug", "broken", "not working", "error", "fix"
              if (/\b(bug|broken|not working|keeps crashing|error|issue with|needs? fix|regression|fails|failing)\b/i.test(trimmed) &&
                  !/\b(no bugs?|0 errors?|bug free|fixed)\b/i.test(trimmed)) {
                bugsMentioned.push(trimmed.slice(0, 200))
              }
            }

            // Also check for markdown "## Action Items" sections
            const actionSection = content.match(/##\s*Action Items?\s*\n([\s\S]*?)(?=\n##|\n$|$)/i)
            if (actionSection) {
              const items = actionSection[1].split('\n').filter((l: string) => l.trim().startsWith('-') || l.trim().startsWith('*'))
              for (const item of items) {
                const cleaned = item.replace(/^[\s*-]+/, '').trim()
                if (cleaned && !actionItems.includes(cleaned)) {
                  actionItems.push(cleaned.slice(0, 200))
                }
              }
            }

            if (actionItems.length > 0 || featureIdeas.length > 0 || bugsMentioned.length > 0) {
              insights.push({
                id: `meeting-${note.thread_id}`,
                meetingTitle: title + (participants ? ` (${participants})` : ''),
                threadId: note.thread_id,
                timestamp: note.start_time || note.end_time || '',
                actionItems: [...new Set(actionItems)].slice(0, 10),
                featureIdeas: [...new Set(featureIdeas)].slice(0, 10),
                bugsMentioned: [...new Set(bugsMentioned)].slice(0, 10),
                raw: content.slice(0, 2000),
              })
            }
          }
        }
      }

      // Fallback: also check transcripts via threads API for meetings without synthesized notes
      if (insights.length === 0) {
        try {
          const resp = await fetch(`${KN_API_THREADS}?limit=10`)
          if (resp.ok) {
            const data = await resp.json()
            const threads = (data.data || data.threads || []).filter(
              (t: any) => t.thread_type === 'MEETING_NOTES' || t.threadType === 'MEETING_NOTES',
            ).slice(0, 5)

            for (const thread of threads) {
              try {
                const tResp = await fetch(`${KN_API_TRANSCRIPT}/${thread.id}`)
                if (!tResp.ok) continue
                const tData = await tResp.json()
                if (!tData?.success || !tData?.data?.content) continue

                const content = tData.data.content
                const title = thread.title || thread.subtitle || `Meeting ${thread.id}`
                const actionItems: string[] = []
                const featureIdeas: string[] = []
                const bugsMentioned: string[] = []

                for (const line of content.split('\n')) {
                  const trimmed = line.trim()
                  if (/\b(TODO|action item|we need to|let's|we should|follow up|next step)\b/i.test(trimmed)) {
                    actionItems.push(trimmed.slice(0, 200))
                  }
                  if (/\b(feature|we could add|idea|how about|what if we|enhancement)\b/i.test(trimmed)) {
                    featureIdeas.push(trimmed.slice(0, 200))
                  }
                  if (/\b(bug|broken|not working|crash|error|regression)\b/i.test(trimmed) && !/\b(no bugs?|fixed)\b/i.test(trimmed)) {
                    bugsMentioned.push(trimmed.slice(0, 200))
                  }
                }

                if (actionItems.length > 0 || featureIdeas.length > 0 || bugsMentioned.length > 0) {
                  insights.push({
                    id: `meeting-${thread.id}`,
                    meetingTitle: title,
                    threadId: thread.id,
                    timestamp: thread.timestamp || thread.date || '',
                    actionItems: [...new Set(actionItems)].slice(0, 10),
                    featureIdeas: [...new Set(featureIdeas)].slice(0, 10),
                    bugsMentioned: [...new Set(bugsMentioned)].slice(0, 10),
                    raw: content.slice(0, 2000),
                  })
                }
              } catch { /* transcript fetch failed */ }
            }
          }
        } catch { /* threads fallback failed */ }
      }

      setMeetingInsights(insights)
    } catch { /* meeting notes scan failed */ }
  }, [socialScan])

  // ── OpenClaw library update check ──
  const checkOpenClawUpdates = useCallback(async (force = false) => {
    // Throttle: don't re-check if we checked recently
    if (!force && openclawUpdate?.lastChecked) {
      const hoursSince = (Date.now() - openclawUpdate.lastChecked) / (1000 * 60 * 60)
      if (hoursSince < OPENCLAW_CHECK_INTERVAL_HOURS && openclawUpdate.status !== 'error') return
    }

    const currentVersion = bundledOpenclawVersion ?? 'unknown'

    setOpenclawUpdate(prev => ({
      currentVersion,
      latestVersion: prev?.latestVersion || null,
      availableVersions: prev?.availableVersions || [],
      lastChecked: Date.now(),
      status: 'checking',
    }))

    try {
      const resp = await fetch(OPENCLAW_NPM_REGISTRY, {
        headers: { Accept: 'application/json' },
      })
      if (!resp.ok) throw new Error(`npm registry returned ${resp.status}`)
      const data = await resp.json()

      const latestVersion = data['dist-tags']?.latest || null
      const allVersions = Object.keys(data.versions || {})
        .sort((a, b) => compareVersions(b, a)) // newest first

      // Get recent versions newer than current
      const newerVersions = allVersions.filter(v => compareVersions(v, currentVersion) > 0)

      // Collect changelog notes from newer versions
      let changelog = ''
      for (const ver of newerVersions.slice(0, 5)) {
        const versionData = data.versions[ver]
        if (versionData?.description || versionData?.gitHead) {
          changelog += `**${ver}**: ${versionData.description || 'No description'}\n`
        }
      }

      let status: OpenClawUpdateInfo['status'] = 'up-to-date'
      if (latestVersion && compareVersions(currentVersion, latestVersion) < 0) {
        status = isMajorUpdate(currentVersion, latestVersion) ? 'major-update' : 'update-available'
      }

      const info: OpenClawUpdateInfo = {
        currentVersion,
        latestVersion,
        availableVersions: newerVersions.slice(0, 10),
        lastChecked: Date.now(),
        status,
        changelog: changelog || undefined,
      }
      setOpenclawUpdate(info)
      localStorage.setItem(KN_DEV_OPENCLAW_CHECK, JSON.stringify(info))

      // Notify on major updates when proactive mode is on
      if (proactiveMode && status === 'major-update' && latestVersion) {
        try {
          sendNotification({
            title: 'OpenClaw major update available',
            body: `${currentVersion} → ${latestVersion} (${newerVersions.length} versions behind)`,
          })
        } catch { /* notification permission may not be granted */ }
      }
    } catch (e) {
      const info: OpenClawUpdateInfo = {
        currentVersion,
        latestVersion: null,
        availableVersions: [],
        lastChecked: Date.now(),
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error',
      }
      setOpenclawUpdate(info)
      localStorage.setItem(KN_DEV_OPENCLAW_CHECK, JSON.stringify(info))
    }
  }, [bundledOpenclawVersion, openclawUpdate, proactiveMode])

  // Check for OpenClaw updates on mount and during auto-scan
  useEffect(() => {
    invoke<string>('kn_get_openclaw_version')
      .then(v => setBundledOpenclawVersion(v))
      .catch(() => { /* version unavailable */ })
    checkOpenClawUpdates()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInitiateOpenClawUpdate = useCallback(() => {
    const info = openclawUpdate
    if (!info || !info.latestVersion) return

    const reviewer = REPO_REVIEWERS[activeRepo]
    const prompt = [
      `The bundled OpenClaw library needs to be updated:`,
      ``,
      `**Current version:** ${info.currentVersion}`,
      `**Latest version:** ${info.latestVersion}`,
      `**Newer versions available:** ${info.availableVersions.join(', ')}`,
      info.changelog ? `\n**Recent changes:**\n${info.changelog}` : '',
      ``,
      `**Target repo:** ${activeRepo}`,
      ``,
      `Please update the OpenClaw dependency in the ${activeRepo} repository:`,
      `1. The bundled OpenClaw package is at \`src/src-tauri/resources/clawdbot/\``,
      `2. Update the version in \`src/src-tauri/resources/clawdbot/package.json\``,
      `3. Run \`cd src/src-tauri/resources/clawdbot && npm install\` to update dependencies`,
      `4. Run \`bash src/scripts/prune-clawdbot.sh\` to prune unused packages`,
      `5. Check for any breaking changes or config migration needed`,
      `6. Test that the gateway starts correctly`,
      `7. Create a PR with the update in the ${activeRepo} repository`,
      reviewer ? `8. Request review from @${reviewer} on the PR` : '',
      SAFETY_GATE_PREAMBLE,
    ].filter(Boolean).join('\n')

    onInitiateSession(prompt)
  }, [openclawUpdate, activeRepo, onInitiateSession])

  // ── Social media scanning: X.com and Reddit ──
  const scanSocialMedia = useCallback(async (force = false) => {
    if (!socialScan.enabled) return
    if (!socialScan.twitter && !socialScan.reddit && !socialScan.github) return

    // Throttle
    if (!force) {
      const lastCheck = localStorage.getItem(KN_DEV_SOCIAL_LAST_CHECK)
      if (lastCheck) {
        const hoursSince = (Date.now() - parseInt(lastCheck, 10)) / (1000 * 60 * 60)
        if (hoursSince < SOCIAL_SCAN_INTERVAL_HOURS) return
      }
    }

    setSocialResults({ posts: [], lastChecked: Date.now(), status: 'checking' })

    // Build search keywords from repo name and any user-configured keywords
    const repoName = activeRepo.split('/').pop() || activeRepo
    const baseKeywords = [repoName]
    // Add common related terms based on repo
    if (repoName === 'knapsack_desktop' || repoName === 'knapsack') {
      baseKeywords.push('knapsack ai', 'knapsack desktop', 'openclaw')
    }
    const allKeywords = [...baseKeywords, ...socialScan.keywords].filter(Boolean)

    const posts: SocialPost[] = []

    // Reddit search via public JSON API
    if (socialScan.reddit) {
      for (const keyword of allKeywords.slice(0, 3)) {
        try {
          const query = encodeURIComponent(keyword)
          const resp = await fetch(
            `https://www.reddit.com/search.json?q=${query}&sort=new&limit=10&t=week`,
            { headers: { Accept: 'application/json' } },
          )
          if (resp.ok) {
            const data = await resp.json()
            const children = data?.data?.children || []
            for (const child of children) {
              const post = child.data
              if (!post) continue
              // Classify by flair or content patterns
              const text = `${post.title} ${post.selftext || ''}`.toLowerCase()
              let relevance: SocialPost['relevance'] = 'discussion'
              if (/\b(feature request|feature idea|wish|would be great|please add|should have)\b/i.test(text)) {
                relevance = 'feature-request'
              } else if (/\b(bug|error|crash|broken|not working|issue)\b/i.test(text)) {
                relevance = 'bug-report'
              } else if (/\b(idea|concept|thought|what if|how about|suggestion)\b/i.test(text)) {
                relevance = 'idea'
              }

              posts.push({
                id: `reddit-${post.id}`,
                platform: 'reddit',
                title: post.title || '',
                body: (post.selftext || '').slice(0, 500),
                url: post.permalink ? `https://reddit.com${post.permalink}` : '',
                author: post.author || '',
                score: post.score,
                timestamp: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : '',
                relevance,
              })
            }
          }
        } catch { /* reddit search failed for this keyword */ }
      }
    }

    // X.com/Twitter — use nitter or public search as fallback
    // Note: Twitter API requires auth, so we use a best-effort public search
    if (socialScan.twitter) {
      for (const keyword of allKeywords.slice(0, 2)) {
        try {
          // Try nitter instances for public tweet search
          const query = encodeURIComponent(keyword)
          const nitterInstances = ['https://nitter.net', 'https://nitter.privacydev.net']
          for (const instance of nitterInstances) {
            try {
              const resp = await fetch(`${instance}/search?f=tweets&q=${query}`, {
                headers: { Accept: 'text/html' },
                signal: AbortSignal.timeout(5000),
              })
              if (resp.ok) {
                const html = await resp.text()
                // Parse tweet-like content from nitter HTML
                const tweetPattern = /<div class="tweet-content[^"]*"[^>]*>([\s\S]*?)<\/div>/g
                const usernamePattern = /<a class="username"[^>]*>@([^<]+)<\/a>/g
                const linkPattern = /href="\/([^/]+)\/status\/(\d+)"/g

                const contents: string[] = []
                let match
                while ((match = tweetPattern.exec(html)) !== null) {
                  contents.push(match[1].replace(/<[^>]+>/g, '').trim())
                }

                const usernames: string[] = []
                while ((match = usernamePattern.exec(html)) !== null) {
                  usernames.push(match[1])
                }

                const links: string[] = []
                while ((match = linkPattern.exec(html)) !== null) {
                  links.push(`https://x.com/${match[1]}/status/${match[2]}`)
                }

                for (let i = 0; i < Math.min(contents.length, 5); i++) {
                  const text = contents[i]
                  let relevance: SocialPost['relevance'] = 'discussion'
                  if (/\b(feature|wish|please add|should have|need|want)\b/i.test(text)) {
                    relevance = 'feature-request'
                  } else if (/\b(bug|error|crash|broken|not working)\b/i.test(text)) {
                    relevance = 'bug-report'
                  } else if (/\b(idea|concept|what if|how about|cool|awesome)\b/i.test(text)) {
                    relevance = 'idea'
                  }

                  posts.push({
                    id: `twitter-${i}-${keyword}`,
                    platform: 'twitter',
                    title: text.slice(0, 100),
                    body: text,
                    url: links[i] || '',
                    author: usernames[i] || '',
                    timestamp: new Date().toISOString(),
                    relevance,
                  })
                }
                break // Got results from this nitter instance
              }
            } catch { /* this nitter instance failed, try next */ }
          }
        } catch { /* twitter search failed for this keyword */ }
      }
    }

    // GitHub Issues — search the target repo and related repos for feature requests
    if (socialScan.github) {
      try {
        // Search the active repo's issues for feature requests and enhancements
        const resp = await fetch(
          `https://api.github.com/search/issues?q=repo:${activeRepo}+type:issue+state:open+label:enhancement,feature,feature-request&sort=created&order=desc&per_page=15`,
          { headers: { Accept: 'application/vnd.github.v3+json' } },
        )
        if (resp.ok) {
          const data = await resp.json()
          for (const issue of (data.items || [])) {
            const labels = (issue.labels || []).map((l: any) => l.name?.toLowerCase() || '').join(' ')
            const text = `${issue.title} ${issue.body || ''} ${labels}`.toLowerCase()

            let relevance: SocialPost['relevance'] = 'feature-request'
            if (/\b(bug|error|crash|broken|regression)\b/i.test(text)) {
              relevance = 'bug-report'
            } else if (/\b(idea|concept|rfc|proposal|discussion)\b/i.test(text)) {
              relevance = 'idea'
            }

            posts.push({
              id: `github-${issue.id}`,
              platform: 'github',
              title: issue.title || '',
              body: (issue.body || '').slice(0, 500),
              url: issue.html_url || '',
              author: issue.user?.login || '',
              score: issue.reactions?.['+1'] || issue.reactions?.total_count || 0,
              timestamp: issue.created_at || '',
              relevance,
            })
          }
        }
      } catch { /* github search failed */ }

      // Also search across GitHub for mentions in other repos
      for (const keyword of allKeywords.slice(0, 2)) {
        try {
          const query = encodeURIComponent(`${keyword} in:title,body type:issue state:open`)
          const resp = await fetch(
            `https://api.github.com/search/issues?q=${query}&sort=created&order=desc&per_page=10`,
            { headers: { Accept: 'application/vnd.github.v3+json' } },
          )
          if (resp.ok) {
            const data = await resp.json()
            for (const issue of (data.items || [])) {
              // Skip issues from the active repo (already fetched above)
              if (issue.repository_url?.includes(activeRepo)) continue

              const text = `${issue.title} ${issue.body || ''}`.toLowerCase()
              let relevance: SocialPost['relevance'] = 'discussion'
              if (/\b(feature|request|enhancement|wish|please add)\b/i.test(text)) {
                relevance = 'feature-request'
              } else if (/\b(idea|concept|suggestion)\b/i.test(text)) {
                relevance = 'idea'
              } else if (/\b(bug|error|crash|broken)\b/i.test(text)) {
                relevance = 'bug-report'
              }

              posts.push({
                id: `github-ext-${issue.id}`,
                platform: 'github',
                title: issue.title || '',
                body: (issue.body || '').slice(0, 500),
                url: issue.html_url || '',
                author: issue.user?.login || '',
                score: issue.reactions?.['+1'] || 0,
                timestamp: issue.created_at || '',
                relevance,
              })
            }
          }
        } catch { /* github search failed for keyword */ }
      }
    }

    // Deduplicate by title similarity
    const seen = new Set<string>()
    const deduped = posts.filter(p => {
      const key = p.title.toLowerCase().slice(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort: feature requests and ideas first, then by score
    const relevanceOrder = { 'feature-request': 0, 'idea': 1, 'bug-report': 2, 'discussion': 3 }
    deduped.sort((a, b) => {
      const ra = relevanceOrder[a.relevance] - relevanceOrder[b.relevance]
      if (ra !== 0) return ra
      return (b.score || 0) - (a.score || 0)
    })

    localStorage.setItem(KN_DEV_SOCIAL_LAST_CHECK, String(Date.now()))
    setSocialResults({ posts: deduped, lastChecked: Date.now(), status: 'done' })

    // Proactive notification for high-value feature requests
    if (proactiveMode && deduped.some(p => p.relevance === 'feature-request')) {
      const featureRequests = deduped.filter(p => p.relevance === 'feature-request')
      try {
        sendNotification({
          title: `${featureRequests.length} feature request${featureRequests.length > 1 ? 's' : ''} found`,
          body: featureRequests.slice(0, 2).map(p => p.title.slice(0, 60)).join(', '),
        })
      } catch { /* notification permission may not be granted */ }
    }
  }, [socialScan, activeRepo, proactiveMode])

  const handleInitiateFromSocialPost = useCallback(
    (post: SocialPost) => {
      const repoName = activeRepo.split('/').pop() || activeRepo
      const reviewer = REPO_REVIEWERS[activeRepo]
      const typeLabel = post.relevance === 'feature-request' ? 'Feature Request'
        : post.relevance === 'idea' ? 'Idea'
        : post.relevance === 'bug-report' ? 'Bug Report'
        : 'Discussion'

      const platformLabel = post.platform === 'twitter' ? 'X.com' : post.platform === 'reddit' ? 'Reddit' : 'GitHub Issues'
      const prompt = [
        `I found a ${typeLabel.toLowerCase()} from ${platformLabel} relevant to our project:`,
        ``,
        `**Type:** ${typeLabel}`,
        `**Platform:** ${platformLabel}`,
        `**Author:** ${post.author}`,
        post.url ? `**URL:** ${post.url}` : '',
        `**Title:** ${post.title}`,
        ``,
        `**Content:**`,
        '```',
        post.body.slice(0, 800),
        '```',
        ``,
        `**Target repo:** ${activeRepo}`,
        ``,
        `Please evaluate this ${typeLabel.toLowerCase()} for the ${repoName} codebase (${activeRepo}):`,
        `1. Assess if this is feasible and valuable to implement`,
        `2. If yes, design a minimal implementation`,
        `3. Implement the changes`,
        `4. Create a PR with the implementation in the ${activeRepo} repository`,
        reviewer ? `5. Request review from @${reviewer} on the PR` : '',
        SAFETY_GATE_PREAMBLE,
      ].filter(Boolean).join('\n')

      onInitiateSession(prompt)
    },
    [activeRepo, onInitiateSession],
  )

  const handleInitiateFromMeeting = useCallback(
    (insight: MeetingNoteInsight, type: 'action' | 'feature' | 'bug', text: string) => {
      const repoName = activeRepo.split('/').pop() || activeRepo
      const reviewer = REPO_REVIEWERS[activeRepo]
      const typeLabel = type === 'feature' ? 'feature idea' : type === 'bug' ? 'bug report' : 'action item'
      const prompt = [
        `From a recent meeting ("${insight.meetingTitle}"), the following ${typeLabel} was discussed:`,
        ``,
        `**Item:** ${text}`,
        `**Meeting:** ${insight.meetingTitle}`,
        `**Date:** ${insight.timestamp ? new Date(typeof insight.timestamp === 'number' ? (insight.timestamp as number) * 1000 : insight.timestamp).toLocaleDateString() : 'Recent'}`,
        `**Target repo:** ${activeRepo}`,
        ``,
        `**Relevant meeting context:**`,
        '```',
        insight.raw.slice(0, 1000),
        '```',
        ``,
        `Please ${type === 'bug' ? 'investigate and fix' : 'implement'} this in the ${repoName} codebase (${activeRepo}):`,
        `1. ${type === 'bug' ? 'Search for the relevant code and identify the root cause' : 'Assess feasibility and design a minimal implementation'}`,
        `2. Implement the changes`,
        `3. Create a PR in the ${activeRepo} repository`,
        reviewer ? `4. Request review from @${reviewer} on the PR` : '',
        SAFETY_GATE_PREAMBLE,
      ].filter(Boolean).join('\n')

      onInitiateSession(prompt)
    },
    [activeRepo, onInitiateSession],
  )

  const handleInitiateSession = useCallback(
    (issue: SentryEmail) => {
      setInitiatingPR(issue.id)

      const repoName = activeRepo.split('/').pop() || activeRepo
      const reviewer = REPO_REVIEWERS[activeRepo]
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
        reviewer ? `5. Request review from @${reviewer} on the PR` : '',
        ``,
        `Use Advanced mode shell commands if needed to search the codebase and run tests.`,
        SAFETY_GATE_PREAMBLE,
      ].filter(Boolean).join('\n')

      onInitiateSession(prompt)
      setTimeout(() => setInitiatingPR(null), 2000)
    },
    [onInitiateSession, activeRepo],
  )

  const handleInitiateFromLog = useCallback(
    (entry: ErrorLogEntry) => {
      const repoName = activeRepo.split('/').pop() || activeRepo
      const reviewer = REPO_REVIEWERS[activeRepo]
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
        reviewer ? `5. Request review from @${reviewer} on the PR` : '',
        SAFETY_GATE_PREAMBLE,
      ].filter(Boolean).join('\n')

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

  /**
   * Proactive auto-fix: when auto-scan detects critical errors and proactive mode is on,
   * send a native notification and automatically initiate Claude Code sessions to create PRs.
   * Throttled to avoid runaway session creation.
   */
  const handleProactiveAutoFix = useCallback(
    async (criticalActions: SuggestedAction[]) => {
      if (autoFixInProgressRef.current) return

      // Throttle: don't auto-fix more frequently than AUTOFIX_THROTTLE_MINUTES
      const lastAutoFix = localStorage.getItem(KN_DEV_LAST_AUTOFIX)
      if (lastAutoFix) {
        const minutesSince = (Date.now() - parseInt(lastAutoFix, 10)) / (1000 * 60)
        if (minutesSince < AUTOFIX_THROTTLE_MINUTES) return
      }

      autoFixInProgressRef.current = true
      localStorage.setItem(KN_DEV_LAST_AUTOFIX, String(Date.now()))

      const reviewer = REPO_REVIEWERS[activeRepo]

      // Pre-flight safety gate: filter out actions that touch security-sensitive areas
      const safeActions: SuggestedAction[] = []
      const blockedActions: { action: SuggestedAction; reason: string }[] = []
      for (const action of criticalActions) {
        const check = isActionSafeForAutoFix(action)
        if (check.safe) {
          safeActions.push(action)
        } else {
          blockedActions.push({ action, reason: check.reason || 'Security concern' })
        }
      }

      if (blockedActions.length > 0) {
        const blockedLog = blockedActions.map(b =>
          `[${new Date().toLocaleTimeString()}] BLOCKED auto-fix (${b.reason}): ${b.action.title.slice(0, 60)}`,
        )
        setAutoFixLog(prev => [...blockedLog, ...prev].slice(0, 20))

        try {
          sendNotification({
            title: `${blockedActions.length} fix${blockedActions.length > 1 ? 'es' : ''} blocked by safety gate`,
            body: `Security-sensitive: ${blockedActions.map(b => b.action.title.slice(0, 40)).join(', ')}. Manual review required.`,
          })
        } catch { /* ignore */ }
      }

      if (safeActions.length === 0) {
        autoFixInProgressRef.current = false
        return
      }

      const actionsToFix = safeActions.slice(0, MAX_AUTO_SESSIONS_PER_SCAN)

      // Send native notification about the auto-fix
      try {
        const titles = actionsToFix.map(a => a.title.slice(0, 60)).join(', ')
        sendNotification({
          title: `Developer Mode: ${actionsToFix.length} critical error${actionsToFix.length > 1 ? 's' : ''} found`,
          body: `Auto-creating PR${actionsToFix.length > 1 ? 's' : ''} for: ${titles}${reviewer ? ` — will request review from @${reviewer}` : ''}`,
        })
      } catch {
        // Notification permission may not be granted — continue anyway
      }

      const logEntries: string[] = []

      for (const action of actionsToFix) {
        const logMsg = `[${new Date().toLocaleTimeString()}] Auto-initiating fix for: ${action.title.slice(0, 80)}`
        logEntries.push(logMsg)

        // Initiate the session (this sends the prompt to the AI)
        if (action.sourceType === 'sentry') {
          handleInitiateSession(action.sourceEntry as SentryEmail)
        } else {
          handleInitiateFromLog(action.sourceEntry as ErrorLogEntry)
        }

        // Small delay between sessions to avoid overwhelming the system
        if (actionsToFix.indexOf(action) < actionsToFix.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      setAutoFixLog(prev => [...logEntries, ...prev].slice(0, 20))
      autoFixInProgressRef.current = false
    },
    [activeRepo, handleInitiateSession, handleInitiateFromLog],
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

      {/* OpenClaw library update status */}
      {openclawUpdate && (
        <div className={`DevModePanel__openclawStatus DevModePanel__openclawStatus--${openclawUpdate.status}`}>
          <div className="DevModePanel__openclawHeader">
            <span className="DevModePanel__sourcesTitle">OpenClaw Library</span>
            <button
              className="DevModePanel__openclawRefresh"
              onClick={() => checkOpenClawUpdates(true)}
              disabled={openclawUpdate.status === 'checking'}
              title="Check for updates"
            >
              {openclawUpdate.status === 'checking' ? '...' : 'Check'}
            </button>
          </div>
          <div className="DevModePanel__openclawVersionRow">
            <span className="DevModePanel__openclawLabel">Bundled:</span>
            <span className="DevModePanel__openclawVersion">{openclawUpdate.currentVersion}</span>
            {openclawUpdate.latestVersion && (
              <>
                <span className="DevModePanel__openclawLabel">Latest:</span>
                <span className={`DevModePanel__openclawVersion ${openclawUpdate.status === 'update-available' || openclawUpdate.status === 'major-update' ? 'DevModePanel__openclawVersion--newer' : ''}`}>
                  {openclawUpdate.latestVersion}
                </span>
              </>
            )}
          </div>
          {openclawUpdate.status === 'up-to-date' && (
            <div className="DevModePanel__settingHint">Up to date</div>
          )}
          {openclawUpdate.status === 'error' && (
            <div className="DevModePanel__settingHint">Could not check: {openclawUpdate.error}</div>
          )}
          {(openclawUpdate.status === 'update-available' || openclawUpdate.status === 'major-update') && (
            <div className="DevModePanel__openclawUpdateInfo">
              <div className={`DevModePanel__openclawBadge ${openclawUpdate.status === 'major-update' ? 'DevModePanel__openclawBadge--major' : ''}`}>
                {openclawUpdate.status === 'major-update' ? 'MAJOR UPDATE' : 'UPDATE AVAILABLE'}
              </div>
              {openclawUpdate.availableVersions.length > 0 && (
                <div className="DevModePanel__settingHint">
                  {openclawUpdate.availableVersions.length} newer version{openclawUpdate.availableVersions.length !== 1 ? 's' : ''}: {openclawUpdate.availableVersions.slice(0, 5).join(', ')}
                </div>
              )}
              {openclawUpdate.changelog && (
                <details className="DevModePanel__stackDetails">
                  <summary>Version notes</summary>
                  <pre className="DevModePanel__stackTrace">{openclawUpdate.changelog}</pre>
                </details>
              )}
              <button
                className="DevModePanel__fixBtn"
                onClick={handleInitiateOpenClawUpdate}
              >
                Create Update PR
              </button>
            </div>
          )}
          {openclawUpdate.lastChecked > 0 && openclawUpdate.status !== 'checking' && (
            <div className="DevModePanel__settingHint">
              Last checked: {formatRelativeTime(openclawUpdate.lastChecked)}
            </div>
          )}
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

      {/* Proactive auto-fix status */}
      {autoScanEnabled && (
        <div className="DevModePanel__setting">
          <div className="DevModePanel__settingInfo">
            <span className="DevModePanel__settingLabel">
              Proactive auto-fix {proactiveMode ? '(active)' : '(requires Proactive mode)'}
            </span>
            <span className="DevModePanel__settingHint">
              {proactiveMode
                ? `Auto-creates PRs${REPO_REVIEWERS[activeRepo] ? ` with @${REPO_REVIEWERS[activeRepo]} as reviewer` : ''}`
                : 'Enable Proactive mode to auto-create PRs for errors'}
            </span>
          </div>
          <span className={`DevModePanel__statusDot ${proactiveMode ? 'DevModePanel__statusDot--active' : 'DevModePanel__statusDot--inactive'}`} />
        </div>
      )}

      {/* Auto-fix severity scope — checkboxes */}
      {autoScanEnabled && proactiveMode && (
        <div className="DevModePanel__checkboxGroup">
          <span className="DevModePanel__settingLabel">Auto-fix scope</span>
          <label className="DevModePanel__checkbox">
            <input type="checkbox" checked={autoFixScope.critical} disabled title="Critical is always enabled" onChange={() => {}} />
            <span>Critical</span>
            <span className="DevModePanel__checkboxHint">panics, crashes, OOM</span>
          </label>
          <label className="DevModePanel__checkbox">
            <input type="checkbox" checked={autoFixScope.high} onChange={e => updateAutoFixScope('high', e.target.checked)} />
            <span>High</span>
            <span className="DevModePanel__checkboxHint">connection errors, timeouts</span>
          </label>
          <label className="DevModePanel__checkbox">
            <input type="checkbox" checked={autoFixScope.medium} onChange={e => updateAutoFixScope('medium', e.target.checked)} />
            <span>Medium</span>
            <span className="DevModePanel__checkboxHint">all other actionable errors</span>
          </label>
        </div>
      )}

      {/* Feature discovery — social media & GitHub issues */}
      {autoScanEnabled && (
        <div className="DevModePanel__checkboxGroup">
          <div className="DevModePanel__settingRow">
            <span className="DevModePanel__settingLabel">Feature discovery</span>
            <button
              onClick={() => updateSocialScan({ enabled: !socialScan.enabled })}
              className={`DevModePanel__toggle ${socialScan.enabled ? 'DevModePanel__toggle--on' : ''}`}
            >
              <span className="DevModePanel__toggleKnob" />
            </button>
          </div>
          <span className="DevModePanel__settingHint">
            Scan for feature requests, ideas, and discussions relevant to your repository
          </span>
          {socialScan.enabled && (
            <>
              <label className="DevModePanel__checkbox">
                <input type="checkbox" checked={socialScan.meetings} onChange={e => updateSocialScan({ meetings: e.target.checked })} />
                <span>Meeting Notes</span>
                <span className="DevModePanel__checkboxHint">action items, ideas, bugs from meetings</span>
              </label>
              <label className="DevModePanel__checkbox">
                <input type="checkbox" checked={socialScan.github} onChange={e => updateSocialScan({ github: e.target.checked })} />
                <span>GitHub Issues</span>
                <span className="DevModePanel__checkboxHint">open issues, feature requests, enhancements</span>
              </label>
              <label className="DevModePanel__checkbox">
                <input type="checkbox" checked={socialScan.reddit} onChange={e => updateSocialScan({ reddit: e.target.checked })} />
                <span>Reddit</span>
                <span className="DevModePanel__checkboxHint">posts and discussions</span>
              </label>
              <label className="DevModePanel__checkbox">
                <input type="checkbox" checked={socialScan.twitter} onChange={e => updateSocialScan({ twitter: e.target.checked })} />
                <span>X.com</span>
                <span className="DevModePanel__checkboxHint">tweets and threads</span>
              </label>
              <div className="DevModePanel__keywordsRow">
                <input
                  className="DevModePanel__repoInput"
                  type="text"
                  placeholder="Extra keywords (comma separated)"
                  defaultValue={socialScan.keywords.join(', ')}
                  onBlur={e => {
                    const kw = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    updateSocialScan({ keywords: kw })
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const kw = (e.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)
                      updateSocialScan({ keywords: kw })
                    }
                  }}
                />
                <button
                  className="DevModePanel__openclawRefresh"
                  onClick={() => scanSocialMedia(true)}
                  disabled={socialResults?.status === 'checking'}
                >
                  {socialResults?.status === 'checking' ? '...' : 'Scan'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Auto-fix activity log */}
      {autoFixLog.length > 0 && (
        <div className="DevModePanel__autoFixLog">
          <div className="DevModePanel__sourcesTitle">Auto-fix Activity</div>
          {autoFixLog.slice(0, 5).map((log, idx) => (
            <div key={idx} className="DevModePanel__autoFixEntry">{log}</div>
          ))}
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

      {/* Meeting notes insights */}
      {meetingInsights.length > 0 && (
        <div className="DevModePanel__section">
          <div className="DevModePanel__sectionTitle">
            Meeting Insights ({meetingInsights.length} meeting{meetingInsights.length !== 1 ? 's' : ''})
          </div>
          {meetingInsights.map(insight => (
            <div key={insight.id} className="DevModePanel__meetingInsight">
              <div className="DevModePanel__meetingTitle">{insight.meetingTitle}</div>
              {insight.actionItems.length > 0 && (
                <div className="DevModePanel__meetingItems">
                  <span className="DevModePanel__meetingLabel">Action items:</span>
                  {insight.actionItems.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="DevModePanel__meetingItem">
                      <span className="DevModePanel__meetingItemText">{item.slice(0, 100)}</span>
                      <button className="DevModePanel__fixBtnSmall" onClick={() => handleInitiateFromMeeting(insight, 'action', item)}>
                        Implement
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {insight.featureIdeas.length > 0 && (
                <div className="DevModePanel__meetingItems">
                  <span className="DevModePanel__meetingLabel">Feature ideas:</span>
                  {insight.featureIdeas.slice(0, 3).map((idea, idx) => (
                    <div key={idx} className="DevModePanel__meetingItem">
                      <span className="DevModePanel__meetingItemText">{idea.slice(0, 100)}</span>
                      <button className="DevModePanel__fixBtnSmall" onClick={() => handleInitiateFromMeeting(insight, 'feature', idea)}>
                        Implement
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {insight.bugsMentioned.length > 0 && (
                <div className="DevModePanel__meetingItems">
                  <span className="DevModePanel__meetingLabel">Bugs discussed:</span>
                  {insight.bugsMentioned.slice(0, 3).map((bug, idx) => (
                    <div key={idx} className="DevModePanel__meetingItem">
                      <span className="DevModePanel__meetingItemText">{bug.slice(0, 100)}</span>
                      <button className="DevModePanel__fixBtnSmall" onClick={() => handleInitiateFromMeeting(insight, 'bug', bug)}>
                        Fix
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Social / feature discovery results */}
      {socialResults && socialResults.status === 'done' && socialResults.posts.length > 0 && (
        <div className="DevModePanel__section">
          <div className="DevModePanel__sectionTitle">
            Feature Discovery ({socialResults.posts.length})
          </div>
          {socialResults.posts.slice(0, 15).map(post => (
            <div key={post.id} className="DevModePanel__socialPost">
              <div className="DevModePanel__socialHeader">
                <span className={`DevModePanel__socialPlatform DevModePanel__socialPlatform--${post.platform}`}>
                  {post.platform === 'twitter' ? 'X' : post.platform === 'reddit' ? 'Reddit' : 'GitHub'}
                </span>
                <span className={`DevModePanel__socialRelevance DevModePanel__socialRelevance--${post.relevance}`}>
                  {post.relevance.replace('-', ' ')}
                </span>
                {post.score != null && post.score > 0 && (
                  <span className="DevModePanel__socialScore">+{post.score}</span>
                )}
              </div>
              <div className="DevModePanel__socialTitle">{post.title}</div>
              {post.body && post.body !== post.title && (
                <div className="DevModePanel__socialBody">{post.body.slice(0, 150)}</div>
              )}
              <div className="DevModePanel__socialFooter">
                <span className="DevModePanel__logTime">@{post.author}</span>
                {post.url && (
                  <a
                    className="DevModePanel__socialLink"
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
                <button
                  className="DevModePanel__fixBtnSmall"
                  onClick={() => handleInitiateFromSocialPost(post)}
                >
                  Implement
                </button>
              </div>
            </div>
          ))}
          {socialResults.posts.length > 15 && (
            <div className="DevModePanel__moreIndicator">
              ...and {socialResults.posts.length - 15} more posts
            </div>
          )}
          {socialResults.lastChecked > 0 && (
            <div className="DevModePanel__settingHint">
              Last checked: {formatRelativeTime(socialResults.lastChecked)}
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
