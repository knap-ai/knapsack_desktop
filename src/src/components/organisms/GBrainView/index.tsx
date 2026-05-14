import React, { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import Markdown from 'marked-react'
import { KN_SERVER_HOST } from 'src/utils/constants'
import { listWorkspaces, Workspace } from 'src/api/workspaces'
import { getFeedItems, FeedItem } from 'src/api/feed_items'
import { IFeed } from 'src/hooks/feed/useFeed'
import { CalendarEvents, serializeCalendarEventToMeeting } from 'src/hooks/dataSources/useCalendar'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Attendee {
  name: string
  email: string
}

interface BrainEntry {
  name: string
  relPath: string
  isDir: boolean
}

type Tab = 'feed' | 'skills' | 'brain'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function dayLabel(unix: number): string {
  const d = new Date(unix * 1000)
  const now = new Date()
  const tomorrow = new Date(); tomorrow.setDate(now.getDate() + 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (m < 2) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function parseAttendees(json: string): Attendee[] {
  try { return JSON.parse(json) } catch { return [] }
}

function skillEmoji(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('meeting') || n.includes('prep')) return '📅'
  if (n.includes('enrich') || n.includes('person')) return '🧠'
  if (n.includes('book')) return '📚'
  if (n.includes('research') || n.includes('perplexity')) return '🔍'
  if (n.includes('media') || n.includes('ingest')) return '🎬'
  if (n.includes('cron') || n.includes('task')) return '⏰'
  return '⚡'
}

const formatEventWindow = (event: CalendarEvents): string => (
  `${dayLabel(event.start)} ${formatTime(event.start)}-${formatTime(event.end)}`
)

const docNoun = (count: number): string => count === 1 ? 'source' : 'sources'

function topWorkspaceDocs(workspace: Workspace) {
  return (workspace.documents ?? [])
    .filter(doc => doc.summary || doc.documentName)
    .slice(0, 5)
}

function docDateLabel(epoch: number | null | undefined): string {
  if (!epoch) return 'undated'
  const ms = epoch > 10_000_000_000 ? epoch : epoch * 1000
  return new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function docTimeline(workspace: Workspace): string {
  const docs = topWorkspaceDocs(workspace)
  if (!docs.length) return '- No timeline entries yet. Add meetings, email, or notes to start the append-only history.'
  return docs
    .map(doc => `- **${docDateLabel(doc.createdAt)}** · ${doc.documentName || doc.sourceType || 'Memory'}${doc.summary ? ` — ${doc.summary}` : ''}`)
    .join('\n')
}

function personFallback(ws: Workspace): string {
  const docs = topWorkspaceDocs(ws)
  const sourceLine = `${docs.length || (ws.documents ?? []).length} ${docNoun(docs.length || (ws.documents ?? []).length)} in local memory`
  const latest = docs[0]?.summary || ws.description || 'Not enough signal yet. This page should improve as meetings, emails, and notes attach to the person.'
  return [
    `## ${ws.name}`,
    `**Person page starter** · ${sourceLine}`,
    '\n### Compiled truth',
    `- ${latest}`,
    '- Current best understanding belongs here: role, relationship, company, why this person matters, and any standing context.',
    '\n### State',
    '- Current status: unknown until the next enrichment or meeting note updates it.',
    '- Relationship context: capture how you know them and what changed recently.',
    '\n### Open threads',
    '- What do we owe them?',
    '- What do they owe us?',
    '- What should the next conversation clarify?',
    '\n### Score',
    '- Relationship/context score: unrated. Score should reflect importance, recency, and confidence.',
    '\n### Append-only timeline',
    docTimeline(ws),
    '\n### Raw source sidecars',
    docs.length ? docs.map(doc => `- ${doc.sourceType || doc.documentType || 'source'} · ${doc.documentName}`).join('\n') : '- No sidecars linked yet.',
    '\n### Next action',
    `Ask the agent to enrich ${ws.name} with career arc, contact info, meeting history, relationship context, and citations from the brain.`,
  ].filter(Boolean).join('\n')
}

function projectFallback(ws: Workspace): string {
  const docs = topWorkspaceDocs(ws)
  const notes = docs.length
    ? docs.map(doc => `- **${doc.documentName || doc.sourceType || 'Memory'}**: ${doc.summary || 'Indexed project source.'}`).join('\n')
    : '- No rich project summaries yet.'
  return [
    `## ${ws.name}`,
    '**Project page starter**',
    '\n### Compiled truth',
    ws.description || 'Current best understanding of the project belongs here.',
    '\n### State',
    '- Current status, owner, deadline, and last meaningful change.',
    '\n### Open threads',
    '- Unresolved questions',
    '- Risks',
    '- Next actions',
    '\n### Append-only timeline',
    notes,
    '\n### Suggested next move',
    `Ask: "Turn ${ws.name} into a project brief with current status, open loops, risks, and next actions."`,
  ].join('\n')
}

function meetingFallback(event: CalendarEvents): string {
  const attendees = parseAttendees(event.attendees_json)
  const names = attendees.map(a => a.name || a.email).filter(Boolean)
  return [
    `## ${event.title}`,
    `**${formatEventWindow(event)}**`,
    names.length ? `\n**People:** ${names.join(', ')}` : '',
    event.location ? `\n**Location:** ${event.location}` : '',
    '\n### Structured summary',
    '- Purpose: infer from title, calendar description, and linked people pages.',
    '- Decisions: capture during or after the meeting.',
    '- Follow-ups: capture owners and dates.',
    event.description ? `\n### Calendar notes\n${event.description}` : '',
    '\n### Entity propagation plan',
    names.length
      ? names.map(name => `- Update **${name}** person page with what changed, open threads, and relationship context.`).join('\n')
      : '- Identify people and companies mentioned, then update their brain pages.',
    '\n### Transcript / raw source sidecar',
    '- Attach transcript or meeting notes here after the call.',
    '\n### Prep angles',
    '- Pull current person/company/project pages.',
    '- Identify overlap, divergence, and one useful conversation hook.',
    '- Walk in with a specific desired outcome.',
  ].filter(Boolean).join('\n')
}

// ── Skill runner hook ─────────────────────────────────────────────────────────

function useSkillRunner() {
  const [running, setRunning] = useState(false)
  const [runningLabel, setRunningLabel] = useState('')
  const [output, setOutput] = useState<string | null>(null)

  const run = useCallback(async (text: string, label: string, fallback?: string) => {
    setRunning(true)
    setRunningLabel(label)
    setOutput(null)
    try {
      const res = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, channel: 'webchat', agentId: 'main' }),
      })
      const data = await res.json()
      if (data.ok && data.reply) {
        setOutput(data.reply)
      } else {
        setOutput(fallback ?? `Could not run the agent yet: ${data.message ?? 'No reply from the gateway.'}`)
      }
    } catch (e: any) {
      setOutput(fallback ?? `Could not reach the local gateway: ${e?.message ?? 'Network error'}`)
    } finally {
      setRunning(false)
    }
  }, [])

  return { running, runningLabel, output, setOutput, run }
}

// ── Output panel ──────────────────────────────────────────────────────────────

const OutputPanel: React.FC<{
  running: boolean
  label: string
  output: string | null
  onDismiss: () => void
}> = ({ running, label, output, onDismiss }) => {
  if (!running && output === null) return null
  return (
    <div className="mx-4 mb-4 border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 truncate flex-1">
          {running ? `${label}…` : label}
        </span>
        {!running && (
          <button className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0" onClick={onDismiss}>✕</button>
        )}
      </div>
      <div className="px-5 py-4">
        {running ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="animate-pulse">●</span> Working…
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <Markdown>{output ?? ''}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Feed item card ────────────────────────────────────────────────────────────

const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  const automationName = item.automation?.name ?? 'Skill run'
  const emoji = skillEmoji(automationName)
  const when = item.run?.executionDate
    ? relativeTime(item.run.executionDate)
    : relativeTime(item.timestamp)

  // Find the first bot reply in any thread
  const botReply = item.threads
    ?.flatMap(t => t.messages ?? [])
    .find(m => m.user_type === 'bot')?.text

  const snippet = botReply?.slice(0, 120).replace(/\n/g, ' ').trimEnd()

  return (
    <div
      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-base mt-0.5">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-medium text-gray-800 truncate">{item.title}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{when}</span>
          </div>
          <div className="text-xs text-gray-400 truncate">{automationName}</div>
          {!expanded && snippet && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{snippet}…</div>
          )}
          {expanded && botReply && (
            <div className="mt-3 prose prose-sm max-w-none" onClick={e => e.stopPropagation()}>
              <Markdown>{botReply}</Markdown>
            </div>
          )}
        </div>
        <span className="text-gray-300 text-xs flex-shrink-0 mt-1">{expanded ? '▾' : '▸'}</span>
      </div>
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-4 pt-5 pb-1">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
  </div>
)

// ── Meeting row ───────────────────────────────────────────────────────────────

const MeetingRow: React.FC<{
  event: CalendarEvents
  onOpen: (event: CalendarEvents) => void
  onPrep: (event: CalendarEvents) => void
  running: boolean
}> = ({ event, onOpen, onPrep, running }) => {
  const attendees = parseAttendees(event.attendees_json)
  const names = attendees.map(a => a.name).filter(Boolean)

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(event) }}
    >
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-base">📅</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{event.title}</div>
        <div className="text-xs text-gray-400 truncate">
          {dayLabel(event.start)} · {formatTime(event.start)}
          {names.length > 0 && ` · ${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`}
        </div>
      </div>
      <span className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
        Open
      </span>
      <button
        className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
        disabled={running}
        onClick={e => { e.stopPropagation(); onPrep(event) }}
      >
        Prep
      </button>
    </div>
  )
}

// ── Person row ────────────────────────────────────────────────────────────────

const PersonRow: React.FC<{
  workspace: Workspace
  onOpen: (ws: Workspace) => void
  onEnrich: (ws: Workspace) => void
  running: boolean
}> = ({ workspace, onOpen, onEnrich, running }) => (
  <div
    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(workspace)}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(workspace) }}
  >
    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-base">
      {workspace.icon || '👤'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-800 truncate">{workspace.name}</div>
      {workspace.description && (
        <div className="text-xs text-gray-400 truncate">{workspace.description}</div>
      )}
    </div>
    <button
      className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
      disabled={running}
      onClick={e => { e.stopPropagation(); onEnrich(workspace) }}
    >
      Enrich
    </button>
  </div>
)

// ── Project row ───────────────────────────────────────────────────────────────

const ProjectRow: React.FC<{
  workspace: Workspace
  onOpen: (ws: Workspace) => void
  onResearch: (ws: Workspace) => void
  running: boolean
}> = ({ workspace, onOpen, onResearch, running }) => (
  <div
    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(workspace)}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(workspace) }}
  >
    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-base">
      {workspace.icon || '📁'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-800 truncate">{workspace.name}</div>
      {workspace.description && (
        <div className="text-xs text-gray-400 truncate">{workspace.description}</div>
      )}
    </div>
    <button
      className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
      disabled={running}
      onClick={e => { e.stopPropagation(); onResearch(workspace) }}
    >
      Research
    </button>
  </div>
)

// ── Brain tree ────────────────────────────────────────────────────────────────

const BrainTreeNode: React.FC<{
  entry: BrainEntry
  brainRoot: string
  depth: number
  onSelectFile: (relPath: string) => void
  selectedPath: string | null
}> = ({ entry, brainRoot, depth, onSelectFile, selectedPath }) => {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<BrainEntry[]>([])

  const toggle = useCallback(async () => {
    if (!entry.isDir) { onSelectFile(entry.relPath); return }
    if (!expanded && children.length === 0) {
      const result = await invoke<BrainEntry[]>('kn_brain_list', { brainRoot, subPath: entry.relPath }).catch(() => [])
      setChildren(result)
    }
    setExpanded(e => !e)
  }, [entry, brainRoot, expanded, children, onSelectFile])

  const isSelected = !entry.isDir && selectedPath === entry.relPath

  return (
    <div>
      <div
        onClick={toggle}
        style={{ paddingLeft: 12 + depth * 16 }}
        className={`flex items-center gap-1.5 py-1 px-2 text-sm cursor-pointer rounded transition-colors
          ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <span className="w-4 text-xs opacity-40">{entry.isDir ? (expanded ? '▾' : '▸') : ''}</span>
        <span className="truncate">{entry.isDir ? '📁 ' : '📄 '}{entry.name.replace(/\.md$/, '')}</span>
      </div>
      {entry.isDir && expanded && children.map(c => (
        <BrainTreeNode key={c.relPath} entry={c} brainRoot={brainRoot} depth={depth + 1} onSelectFile={onSelectFile} selectedPath={selectedPath} />
      ))}
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface GBrainViewProps {
  feed?: IFeed
  onOpenMeeting?: () => void
  onOpenWorkspace?: (workspace: Workspace) => void
}

const GBrainView: React.FC<GBrainViewProps> = ({ feed, onOpenMeeting, onOpenWorkspace }) => {
  const [tab, setTab] = useState<Tab>('feed')
  const { running, runningLabel, output, setOutput, run } = useSkillRunner()

  // Feed
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [feedLoading, setFeedLoading] = useState(true)

  // Meetings & library
  const [meetings, setMeetings] = useState<CalendarEvents[]>([])
  const [people, setPeople] = useState<Workspace[]>([])
  const [projects, setProjects] = useState<Workspace[]>([])

  // Custom command
  const [customText, setCustomText] = useState('')

  // Brain
  const [brainRoot, setBrainRoot] = useState('')
  const [editingRoot, setEditingRoot] = useState(false)
  const [rootInput, setRootInput] = useState('')
  const [rootEntries, setRootEntries] = useState<BrainEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)

  // Load feed
  const loadFeed = useCallback(() => {
    setFeedLoading(true)
    getFeedItems()
      .then(items => {
        const withRuns = (items as FeedItem[])
          .filter(i => i.run || i.threads?.some(t => t.messages?.some(m => m.user_type === 'bot')))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 50)
        setFeedItems(withRuns)
      })
      .catch(() => {})
      .finally(() => setFeedLoading(false))
  }, [])

  useEffect(() => { loadFeed() }, [loadFeed])

  // Load brain root
  useEffect(() => {
    invoke<string>('kn_brain_default_root').then(root => {
      setBrainRoot(root); setRootInput(root)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!brainRoot) return
    invoke<BrainEntry[]>('kn_brain_list', { brainRoot, subPath: '' })
      .then(setRootEntries).catch(() => setRootEntries([]))
  }, [brainRoot])

  // Fetch upcoming meetings
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000)
    fetch(`${KN_SERVER_HOST}/api/knapsack/calendar/get_events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_timestamp: now, end_timestamp: now + 60 * 60 * 24 * 3 }),
    })
      .then(r => r.json())
      .then((data: CalendarEvents[]) => {
        setMeetings(
          (Array.isArray(data) ? data : [])
            .filter(e => e.start > now)
            .sort((a, b) => a.start - b.start)
            .slice(0, 10)
        )
      })
      .catch(() => {})
  }, [])

  // Fetch library workspaces
  useEffect(() => {
    listWorkspaces().then(res => {
      if (!res.success) return
      setPeople(res.data.filter(w => w.autoCurated && w.entityType === 'person'))
      setProjects(res.data.filter(w => w.autoCurated && w.entityType === 'project'))
    }).catch(() => {})
  }, [])

  // Actions
  const openMeeting = useCallback(async (event: CalendarEvents) => {
    if (!feed) {
      setOutput(meetingFallback(event))
      setTab('skills')
      return
    }
    await feed.openCalendarEvent(serializeCalendarEventToMeeting(event))
    onOpenMeeting?.()
  }, [feed, onOpenMeeting, setOutput])

  const prepMeeting = useCallback((event: CalendarEvents) => {
    const attendees = parseAttendees(event.attendees_json).map(a => a.name).join(', ')
    run(
      `Prepare me for this meeting using the GBrain meeting schema: structured summary, relevant person/company context, conversation hooks, follow-ups to capture, and entity propagation targets. Meeting: ${event.title}${attendees ? `. Attendees: ${attendees}.` : ''} Time: ${formatEventWindow(event)}.`,
      `Prepping: ${event.title}`,
      meetingFallback(event),
    )
    setTab('skills')
  }, [run])

  const enrichPerson = useCallback((ws: Workspace) => {
    run(
      `Build or update the GBrain person page for ${ws.name}. Use this schema: compiled truth, current state, open threads, relationship score, append-only timeline, raw source sidecars, and next action. Use local memory first and cite useful context.`,
      `Enriching: ${ws.name}`,
      personFallback(ws),
    )
    setTab('skills')
  }, [run])

  const researchProject = useCallback((ws: Workspace) => {
    run(
      `Build or update the GBrain project page for ${ws.name}${ws.description ? `: ${ws.description}` : ''}. Use compiled truth, current state, open threads, append-only timeline, raw sources, risks, and next actions.`,
      `Researching: ${ws.name}`,
      projectFallback(ws),
    )
    setTab('skills')
  }, [run])

  const handleCustom = useCallback(() => {
    const text = customText.trim()
    if (!text) return
    run(text, text)
    setCustomText('')
  }, [customText, run])

  const handleSelectBrainPage = useCallback(async (relPath: string) => {
    setSelectedPath(relPath)
    setPageContent(null)
    const content = await invoke<string>('kn_brain_read_page', { brainRoot, relPath }).catch((e: any) => `> Error: ${e}`)
    setPageContent(content)
  }, [brainRoot])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'skills', label: 'Skills' },
    { id: 'brain', label: 'Brain' },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-800">🧠 GBrain</span>
          <span className="text-[11px] text-gray-400 truncate">Start with one task, turn the pattern into a skill, and let memory compound.</span>
        </div>
        <div className="flex gap-1 ml-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${tab === t.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed tab ── */}
      {tab === 'feed' && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">What your brain did</span>
            <button
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              onClick={loadFeed}
            >
              Refresh
            </button>
          </div>

          {feedLoading ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-gray-400">
              <span className="animate-pulse">●</span> Loading…
            </div>
          ) : feedItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-sm font-medium text-gray-500 mb-1">No activity yet</div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Run your first skill to start building your brain.
              </div>
              <button
                className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
                onClick={() => setTab('skills')}
              >
                Open Skills →
              </button>
            </div>
          ) : (
            <div>
              {feedItems.map(item => (
                <FeedCard key={item.id ?? item.timestamp.getTime()} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Skills tab ── */}
      {tab === 'skills' && (
        <div className="flex-1 overflow-y-auto">
          {/* Command bar */}
          <div className="px-4 pt-4 pb-2 flex gap-2">
            <input
              className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 placeholder-gray-300"
              placeholder="/skill-name context… or just describe what you want"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCustom() }}
            />
            <button
              className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
              disabled={running || !customText.trim()}
              onClick={handleCustom}
            >
              Run
            </button>
          </div>

          {/* Output */}
          <OutputPanel running={running} label={runningLabel} output={output} onDismiss={() => setOutput(null)} />

          {/* Meetings */}
          {meetings.length > 0 && (
            <>
              <SectionHeader label="Meetings" />
              <div className="divide-y divide-gray-50">
                {meetings.map(ev => (
                  <MeetingRow key={ev.id} event={ev} onOpen={openMeeting} onPrep={prepMeeting} running={running} />
                ))}
              </div>
            </>
          )}

          {/* People */}
          {people.length > 0 && (
            <>
              <SectionHeader label="People" />
              <div className="divide-y divide-gray-50">
                {people.map(ws => (
                  <PersonRow
                    key={ws.uuid}
                    workspace={ws}
                    onOpen={onOpenWorkspace ?? enrichPerson}
                    onEnrich={enrichPerson}
                    running={running}
                  />
                ))}
              </div>
            </>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <SectionHeader label="Projects" />
              <div className="divide-y divide-gray-50">
                {projects.map(ws => (
                  <ProjectRow
                    key={ws.uuid}
                    workspace={ws}
                    onOpen={onOpenWorkspace ?? researchProject}
                    onResearch={researchProject}
                    running={running}
                  />
                ))}
              </div>
            </>
          )}

          <div className="h-4" />
        </div>
      )}

      {/* ── Brain tab ── */}
      {tab === 'brain' && (
        <div className="flex flex-1 min-h-0">
          <div className="w-56 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-white">
            <div className="px-3 py-2 border-b border-gray-100">
              {editingRoot ? (
                <input
                  autoFocus
                  className="w-full text-xs border border-blue-300 rounded px-2 py-1 outline-none"
                  value={rootInput}
                  onChange={e => setRootInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setBrainRoot(rootInput.trim()); setEditingRoot(false) }
                    if (e.key === 'Escape') { setRootInput(brainRoot); setEditingRoot(false) }
                  }}
                  onBlur={() => { setBrainRoot(rootInput.trim()); setEditingRoot(false) }}
                />
              ) : (
                <button
                  className="w-full text-left text-xs text-gray-400 hover:text-gray-600 truncate"
                  title="Click to change path"
                  onClick={() => setEditingRoot(true)}
                >
                  {brainRoot || '(set path)'}
                </button>
              )}
            </div>
            {rootEntries.length === 0 ? (
              <div className="p-4 text-xs text-gray-400 leading-relaxed">
                Brain is empty. Run skills to auto-populate it.
              </div>
            ) : (
              <div className="py-1">
                {rootEntries.map(entry => (
                  <BrainTreeNode
                    key={entry.relPath}
                    entry={entry}
                    brainRoot={brainRoot}
                    depth={0}
                    onSelectFile={handleSelectBrainPage}
                    selectedPath={selectedPath}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {pageContent !== null ? (
              <div className="prose prose-sm max-w-none">
                <Markdown>{pageContent}</Markdown>
              </div>
            ) : (
              <div className="text-sm text-gray-300 mt-12 text-center">Select a brain page</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GBrainView
