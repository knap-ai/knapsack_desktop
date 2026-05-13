import React, { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import Markdown from 'marked-react'
import { KN_SERVER_HOST } from 'src/utils/constants'

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: number
  title: string
  start: number
  end: number
  attendees_json: string
}

interface Attendee {
  name: string
  email: string
}

interface BrainEntry {
  name: string
  relPath: string
  isDir: boolean
}

type PanelMode = 'skills' | 'brain'

interface SkillDef {
  slug: string
  emoji: string
  label: string
  hint: string
  placeholder: string
}

// ── Skill catalog ─────────────────────────────────────────────────────────────

const SKILLS: SkillDef[] = [
  {
    slug: 'meeting-prep',
    emoji: '🤝',
    label: 'Meeting Prep',
    hint: 'Who are you meeting?',
    placeholder: 'e.g. Sam Altman',
  },
  {
    slug: 'enrich',
    emoji: '🧠',
    label: 'Enrich Person',
    hint: 'Research and update someone\'s brain page',
    placeholder: 'e.g. Demis Hassabis',
  },
  {
    slug: 'book-mirror',
    emoji: '📚',
    label: 'Book Mirror',
    hint: 'Map a book\'s ideas to your life context',
    placeholder: 'e.g. Zero to One',
  },
  {
    slug: 'perplexity-research',
    emoji: '🔍',
    label: 'Research',
    hint: 'Brain-augmented web research',
    placeholder: 'e.g. What is Sam\'s view on AGI timelines?',
  },
  {
    slug: 'media-ingest',
    emoji: '🎬',
    label: 'Ingest Media',
    hint: 'Add a video, podcast, or URL to your brain',
    placeholder: 'URL or file path',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function isToday(unix: number): boolean {
  const d = new Date(unix * 1000)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isTomorrow(unix: number): boolean {
  const d = new Date(unix * 1000)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.toDateString() === tomorrow.toDateString()
}

function dayLabel(unix: number): string {
  if (isToday(unix)) return 'Today'
  if (isTomorrow(unix)) return 'Tomorrow'
  return new Date(unix * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function parseAttendees(json: string): Attendee[] {
  try { return JSON.parse(json) } catch { return [] }
}

function shortName(name: string): string {
  const parts = name.trim().split(' ')
  return parts[0]
}

// ── Meeting card ──────────────────────────────────────────────────────────────

const MeetingCard: React.FC<{
  event: CalendarEvent
  onPrep: (event: CalendarEvent) => void
  running: boolean
}> = ({ event, onPrep, running }) => {
  const attendees = parseAttendees(event.attendees_json)
  const names = attendees.map(a => shortName(a.name)).filter(Boolean).slice(0, 4)

  return (
    <div className="flex-shrink-0 w-48 border border-gray-200 rounded-xl p-3 bg-white flex flex-col gap-2">
      <div className="text-xs text-gray-400 font-medium">
        {dayLabel(event.start)} · {formatTime(event.start)}
      </div>
      <div className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 flex-1">
        {event.title}
      </div>
      {names.length > 0 && (
        <div className="text-xs text-gray-400 truncate">
          {names.join(', ')}
        </div>
      )}
      <button
        className="w-full py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        disabled={running}
        onClick={() => onPrep(event)}
      >
        {running ? '…' : 'Prep'}
      </button>
    </div>
  )
}

// ── Skill row ─────────────────────────────────────────────────────────────────

const SkillRow: React.FC<{
  skill: SkillDef
  onRun: (slug: string, context: string) => void
  running: boolean
}> = ({ skill, onRun, running }) => {
  const [input, setInput] = useState('')

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-lg w-7 flex-shrink-0 text-center">{skill.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-700">{skill.label}</div>
        <input
          className="mt-1 w-full text-sm bg-transparent outline-none text-gray-600 placeholder-gray-300"
          placeholder={skill.placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) onRun(skill.slug, input.trim())
          }}
        />
      </div>
      <button
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors"
        disabled={running || !input.trim()}
        onClick={() => onRun(skill.slug, input.trim())}
      >
        Run
      </button>
    </div>
  )
}

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

const GBrainView: React.FC = () => {
  const [mode, setMode] = useState<PanelMode>('skills')

  // meetings
  const [meetings, setMeetings] = useState<CalendarEvent[]>([])

  // skill runner
  const [running, setRunning] = useState(false)
  const [runningLabel, setRunningLabel] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const customRef = useRef<HTMLInputElement>(null)

  // brain
  const [brainRoot, setBrainRoot] = useState('')
  const [editingRoot, setEditingRoot] = useState(false)
  const [rootInput, setRootInput] = useState('')
  const [rootEntries, setRootEntries] = useState<BrainEntry[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)

  // Load default brain root
  useEffect(() => {
    invoke<string>('kn_brain_default_root').then(root => {
      setBrainRoot(root)
      setRootInput(root)
    }).catch(() => {})
  }, [])

  // Load brain root entries
  useEffect(() => {
    if (!brainRoot) return
    invoke<BrainEntry[]>('kn_brain_list', { brainRoot, subPath: '' })
      .then(setRootEntries)
      .catch(() => setRootEntries([]))
  }, [brainRoot])

  // Fetch upcoming meetings (next 3 days)
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000)
    const end = now + 60 * 60 * 24 * 3
    fetch(`${KN_SERVER_HOST}/api/knapsack/calendar/get_events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_timestamp: now, end_timestamp: end }),
    })
      .then(r => r.json())
      .then((data: CalendarEvent[]) => {
        const upcoming = (Array.isArray(data) ? data : [])
          .filter(e => e.start > now)
          .sort((a, b) => a.start - b.start)
          .slice(0, 8)
        setMeetings(upcoming)
      })
      .catch(() => {})
  }, [])

  // Run a skill
  const runSkill = useCallback(async (slug: string, context: string, label?: string) => {
    setRunning(true)
    setRunningLabel(label ?? context)
    setOutput(null)
    try {
      const res = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `/${slug} ${context}`, channel: 'automation' }),
      })
      const data = await res.json()
      setOutput(data.ok && data.reply ? data.reply : `❌ ${data.message ?? 'No reply from OpenClaw. Is the gateway running?'}`)
    } catch (e: any) {
      setOutput(`❌ ${e?.message ?? 'Network error'}`)
    } finally {
      setRunning(false)
    }
  }, [])

  const prepMeeting = useCallback((event: CalendarEvent) => {
    const attendees = parseAttendees(event.attendees_json).map(a => a.name).join(', ')
    const context = `${event.title}${attendees ? ` — Attendees: ${attendees}` : ''}`
    runSkill('meeting-prep', context, event.title)
  }, [runSkill])

  const handleCustom = useCallback(() => {
    const text = customText.trim()
    if (!text) return
    setRunning(true)
    setRunningLabel(text)
    setOutput(null)
    fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, channel: 'automation' }),
    })
      .then(r => r.json())
      .then(data => setOutput(data.ok && data.reply ? data.reply : `❌ ${data.message ?? 'No reply'}`))
      .catch((e: any) => setOutput(`❌ ${e?.message ?? 'Network error'}`))
      .finally(() => setRunning(false))
  }, [customText])

  const handleSelectBrainPage = useCallback(async (relPath: string) => {
    setSelectedPath(relPath)
    setPageContent(null)
    const content = await invoke<string>('kn_brain_read_page', { brainRoot, relPath }).catch((e: any) => `> Error: ${e}`)
    setPageContent(content)
  }, [brainRoot])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-800">🧠 GBrain</span>
        <div className="flex gap-1 ml-auto">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'skills' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setMode('skills')}
          >
            Skills
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'brain' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setMode('brain')}
          >
            Brain
          </button>
        </div>
      </div>

      {/* ── Skills mode ── */}
      {mode === 'skills' && (
        <div className="flex-1 overflow-y-auto">
          {/* Meetings strip */}
          {meetings.length > 0 && (
            <div className="px-5 pt-5 pb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Upcoming meetings
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {meetings.map(ev => (
                  <MeetingCard
                    key={ev.id}
                    event={ev}
                    onPrep={prepMeeting}
                    running={running}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Skills list */}
          <div className="px-5 pt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Skills
            </div>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 mb-4">
              {SKILLS.map(skill => (
                <SkillRow key={skill.slug} skill={skill} onRun={runSkill} running={running} />
              ))}
            </div>
          </div>

          {/* Custom command */}
          <div className="px-5 pb-4">
            <div className="flex gap-2">
              <input
                ref={customRef}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 bg-white placeholder-gray-300"
                placeholder="/skill-name context…"
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
          </div>

          {/* Output */}
          {(running || output !== null) && (
            <div className="mx-5 mb-5 border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 truncate flex-1">
                  {running ? `Running: ${runningLabel}…` : runningLabel}
                </span>
                {!running && (
                  <button
                    className="text-xs text-gray-400 hover:text-gray-600"
                    onClick={() => setOutput(null)}
                  >
                    ✕
                  </button>
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
          )}
        </div>
      )}

      {/* ── Brain mode ── */}
      {mode === 'brain' && (
        <div className="flex flex-1 min-h-0">
          {/* Tree */}
          <div className="w-56 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-white">
            {/* Path editor */}
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
                Brain is empty. Run skills to auto-populate it, or add <code>.md</code> files to <span className="font-mono">{brainRoot}</span>.
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

          {/* Page viewer */}
          <div className="flex-1 overflow-y-auto p-6">
            {pageContent !== null ? (
              <div className="prose prose-sm max-w-none">
                <Markdown>{pageContent}</Markdown>
              </div>
            ) : (
              <div className="text-sm text-gray-300 mt-12 text-center">
                Select a brain page
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GBrainView
