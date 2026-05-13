import React, { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import Markdown from 'marked-react'
import { KN_SERVER_HOST } from 'src/utils/constants'
import { listWorkspaces, Workspace } from 'src/api/workspaces'

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

function parseAttendees(json: string): Attendee[] {
  try { return JSON.parse(json) } catch { return [] }
}

// ── Shared: skill runner hook ─────────────────────────────────────────────────

function useSkillRunner() {
  const [running, setRunning] = useState(false)
  const [runningLabel, setRunningLabel] = useState('')
  const [output, setOutput] = useState<string | null>(null)

  const run = useCallback(async (text: string, label: string) => {
    setRunning(true)
    setRunningLabel(label)
    setOutput(null)
    try {
      const res = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, channel: 'automation' }),
      })
      const data = await res.json()
      setOutput(data.ok && data.reply
        ? data.reply
        : `❌ ${data.message ?? 'No reply. Is the OpenClaw gateway running?'}`)
    } catch (e: any) {
      setOutput(`❌ ${e?.message ?? 'Network error'}`)
    } finally {
      setRunning(false)
    }
  }, [])

  const dismiss = useCallback(() => setOutput(null), [])

  return { running, runningLabel, output, run, dismiss }
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

// ── Section header ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-4 pt-5 pb-2">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
  </div>
)

// ── Meeting row ───────────────────────────────────────────────────────────────

const MeetingRow: React.FC<{
  event: CalendarEvent
  onPrep: (event: CalendarEvent) => void
  running: boolean
}> = ({ event, onPrep, running }) => {
  const attendees = parseAttendees(event.attendees_json)
  const names = attendees.map(a => a.name).filter(Boolean)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-base">
        📅
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{event.title}</div>
        <div className="text-xs text-gray-400 truncate">
          {dayLabel(event.start)} · {formatTime(event.start)}
          {names.length > 0 && ` · ${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2}` : ''}`}
        </div>
      </div>
      <button
        className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100"
        disabled={running}
        onClick={() => onPrep(event)}
      >
        Prep
      </button>
    </div>
  )
}

// ── Person row ────────────────────────────────────────────────────────────────

const PersonRow: React.FC<{
  workspace: Workspace
  onEnrich: (ws: Workspace) => void
  running: boolean
}> = ({ workspace, onEnrich, running }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
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
      className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100"
      disabled={running}
      onClick={() => onEnrich(workspace)}
    >
      Enrich
    </button>
  </div>
)

// ── Project row ───────────────────────────────────────────────────────────────

const ProjectRow: React.FC<{
  workspace: Workspace
  onResearch: (ws: Workspace) => void
  running: boolean
}> = ({ workspace, onResearch, running }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
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
      className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100"
      disabled={running}
      onClick={() => onResearch(workspace)}
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

const GBrainView: React.FC = () => {
  const [mode, setMode] = useState<PanelMode>('skills')
  const { running, runningLabel, output, run, dismiss } = useSkillRunner()

  // Meetings
  const [meetings, setMeetings] = useState<CalendarEvent[]>([])

  // Library
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
      .then((data: CalendarEvent[]) => {
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
  const prepMeeting = useCallback((event: CalendarEvent) => {
    const attendees = parseAttendees(event.attendees_json).map(a => a.name).join(', ')
    run(`/meeting-prep ${event.title}${attendees ? ` — Attendees: ${attendees}` : ''}`, `Prepping: ${event.title}`)
  }, [run])

  const enrichPerson = useCallback((ws: Workspace) => {
    run(`/enrich ${ws.name}`, `Enriching: ${ws.name}`)
  }, [run])

  const researchProject = useCallback((ws: Workspace) => {
    run(`/perplexity-research ${ws.name} project — ${ws.description ?? ''}`, `Researching: ${ws.name}`)
  }, [run])

  const handleCustom = useCallback(() => {
    const text = customText.trim()
    if (!text) return
    run(text, text)
  }, [customText, run])

  const handleSelectBrainPage = useCallback(async (relPath: string) => {
    setSelectedPath(relPath)
    setPageContent(null)
    const content = await invoke<string>('kn_brain_read_page', { brainRoot, relPath }).catch((e: any) => `> Error: ${e}`)
    setPageContent(content)
  }, [brainRoot])

  const noData = meetings.length === 0 && people.length === 0 && projects.length === 0

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
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

      {/* Skills mode */}
      {mode === 'skills' && (
        <div className="flex-1 overflow-y-auto">

          {/* Custom command bar */}
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
          <OutputPanel running={running} label={runningLabel} output={output} onDismiss={dismiss} />

          {noData && (
            <div className="px-4 py-8 text-sm text-gray-400 text-center">
              Syncing your calendar and library…
            </div>
          )}

          {/* Meetings */}
          {meetings.length > 0 && (
            <>
              <SectionHeader label="Meetings" />
              <div className="divide-y divide-gray-50">
                {meetings.map(ev => (
                  <MeetingRow key={ev.id} event={ev} onPrep={prepMeeting} running={running} />
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
                  <PersonRow key={ws.uuid} workspace={ws} onEnrich={enrichPerson} running={running} />
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
                  <ProjectRow key={ws.uuid} workspace={ws} onResearch={researchProject} running={running} />
                ))}
              </div>
            </>
          )}

          <div className="h-4" />
        </div>
      )}

      {/* Brain mode */}
      {mode === 'brain' && (
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
