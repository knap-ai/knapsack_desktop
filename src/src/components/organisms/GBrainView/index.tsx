import React, { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import Markdown from 'marked-react'
import { KN_SERVER_HOST } from 'src/utils/constants'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BrainEntry {
  name: string
  relPath: string
  isDir: boolean
}

type PanelTab = 'brain' | 'skills'

interface SkillDef {
  name: string
  slug: string
  emoji: string
  description: string
  placeholder: string
}

// ── Skill catalog ─────────────────────────────────────────────────────────────

const GBRAIN_SKILLS: SkillDef[] = [
  {
    name: 'Meeting Prep',
    slug: 'meeting-prep',
    emoji: '🤝',
    description: 'Prep context, angles, and hooks for an upcoming meeting with someone.',
    placeholder: 'Person name or topic (e.g. "Demis Hassabis")',
  },
  {
    name: 'Book Mirror',
    slug: 'book-mirror',
    emoji: '📚',
    description: 'Mirror a book\'s ideas to your life context — two-column synthesis.',
    placeholder: 'Book title (e.g. "When Things Fall Apart")',
  },
  {
    name: 'Enrich',
    slug: 'enrich',
    emoji: '🧠',
    description: 'Research and enrich a person\'s brain page from multiple sources.',
    placeholder: 'Person name (e.g. "Sam Altman")',
  },
  {
    name: 'Media Ingest',
    slug: 'media-ingest',
    emoji: '🎬',
    description: 'Ingest a video, audio, PDF, or URL into the brain.',
    placeholder: 'URL or file path',
  },
  {
    name: 'Skillify',
    slug: 'skillify',
    emoji: '⚡',
    description: 'Turn a workflow you just ran into a reusable registered skill.',
    placeholder: 'Describe the workflow to extract (e.g. "the book mirror I just did")',
  },
  {
    name: 'Perplexity Research',
    slug: 'perplexity-research',
    emoji: '🔍',
    description: 'Web research that checks what the brain already knows first.',
    placeholder: 'Research question (e.g. "What is Sam Altman\'s view on AGI timelines?")',
  },
]

// ── Brain tree node ───────────────────────────────────────────────────────────

const BrainTreeNode: React.FC<{
  entry: BrainEntry
  brainRoot: string
  depth: number
  onSelectFile: (relPath: string) => void
  selectedPath: string | null
}> = ({ entry, brainRoot, depth, onSelectFile, selectedPath }) => {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<BrainEntry[]>([])
  const [loading, setLoading] = useState(false)

  const toggle = useCallback(async () => {
    if (!entry.isDir) {
      onSelectFile(entry.relPath)
      return
    }
    if (!expanded && children.length === 0) {
      setLoading(true)
      try {
        const result = await invoke<BrainEntry[]>('kn_brain_list', {
          brainRoot,
          subPath: entry.relPath,
        })
        setChildren(result)
      } catch (e) {
        console.error('kn_brain_list error:', e)
      } finally {
        setLoading(false)
      }
    }
    setExpanded(prev => !prev)
  }, [entry, brainRoot, expanded, children, onSelectFile])

  const isSelected = !entry.isDir && selectedPath === entry.relPath
  const paddingLeft = 12 + depth * 16

  return (
    <div>
      <div
        onClick={toggle}
        style={{ paddingLeft }}
        className={`flex items-center gap-1.5 py-1 px-2 text-sm cursor-pointer rounded transition-colors
          ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
      >
        <span className="flex-shrink-0 text-xs opacity-50 w-4">
          {entry.isDir ? (expanded ? '▾' : '▸') : ''}
        </span>
        <span className="truncate">
          {entry.isDir ? '📁 ' : '📄 '}
          {entry.name.replace(/\.md$/, '')}
        </span>
        {loading && <span className="ml-auto text-xs text-gray-400">…</span>}
      </div>
      {entry.isDir && expanded && (
        <div>
          {children.map(child => (
            <BrainTreeNode
              key={child.relPath}
              entry={child}
              brainRoot={brainRoot}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Skill card ────────────────────────────────────────────────────────────────

const SkillCard: React.FC<{
  skill: SkillDef
  onRun: (slug: string, context: string) => void
  running: boolean
}> = ({ skill, onRun, running }) => {
  const [input, setInput] = useState('')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{skill.emoji}</span>
          <div>
            <div className="font-medium text-sm text-gray-900">{skill.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{skill.description}</div>
          </div>
        </div>
        <span className="text-xs text-gray-400 ml-2 mt-0.5">{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-blue-400"
            placeholder={skill.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) onRun(skill.slug, input.trim())
            }}
          />
          <button
            className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
            disabled={running || !input.trim()}
            onClick={() => onRun(skill.slug, input.trim())}
          >
            {running ? '…' : 'Run'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

const GBrainView: React.FC = () => {
  const [brainRoot, setBrainRoot] = useState('')
  const [editingRoot, setEditingRoot] = useState(false)
  const [rootInput, setRootInput] = useState('')
  const [rootEntries, setRootEntries] = useState<BrainEntry[]>([])
  const [rootError, setRootError] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [pageContent, setPageContent] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [panelTab, setPanelTab] = useState<PanelTab>('brain')

  const [skillRunning, setSkillRunning] = useState(false)
  const [skillOutput, setSkillOutput] = useState<string | null>(null)
  const [customSkillText, setCustomSkillText] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  // Load default brain root on mount
  useEffect(() => {
    invoke<string>('kn_brain_default_root').then(root => {
      setBrainRoot(root)
      setRootInput(root)
    }).catch(() => {})
  }, [])

  // Load root-level entries when brainRoot changes
  const loadRoot = useCallback(async (root: string) => {
    setRootError(null)
    setRootEntries([])
    try {
      const entries = await invoke<BrainEntry[]>('kn_brain_list', {
        brainRoot: root,
        subPath: '',
      })
      setRootEntries(entries)
    } catch (e: any) {
      setRootError(typeof e === 'string' ? e : e?.message ?? 'Failed to load brain')
    }
  }, [])

  useEffect(() => {
    if (brainRoot) loadRoot(brainRoot)
  }, [brainRoot, loadRoot])

  // Load selected brain page
  const handleSelectFile = useCallback(async (relPath: string) => {
    setSelectedPath(relPath)
    setPageContent(null)
    setPageLoading(true)
    setPanelTab('brain')
    try {
      const content = await invoke<string>('kn_brain_read_page', {
        brainRoot,
        relPath,
      })
      setPageContent(content)
    } catch (e: any) {
      setPageContent(`> Error reading page: ${typeof e === 'string' ? e : e?.message}`)
    } finally {
      setPageLoading(false)
    }
  }, [brainRoot])

  // Run a GBrain skill via OpenClaw agent-run endpoint
  const runSkill = useCallback(async (slug: string, context: string) => {
    setSkillRunning(true)
    setSkillOutput(null)
    setPanelTab('skills')
    try {
      const res = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `/${slug} ${context}`, channel: 'automation' }),
      })
      const data = await res.json()
      if (!data.ok || !data.reply) {
        setSkillOutput(`❌ Skill failed: ${data.message ?? 'no reply'}`)
      } else {
        setSkillOutput(data.reply)
      }
    } catch (e: any) {
      setSkillOutput(`❌ Request error: ${typeof e === 'string' ? e : e?.message}`)
    } finally {
      setSkillRunning(false)
    }
  }, [])

  const handleCustomSkill = useCallback(() => {
    const text = customSkillText.trim()
    if (!text) return
    setSkillRunning(true)
    setSkillOutput(null)
    setPanelTab('skills')
    fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, channel: 'automation' }),
    })
      .then(r => r.json())
      .then(data => {
        setSkillOutput(data.ok ? data.reply : `❌ ${data.message ?? 'no reply'}`)
      })
      .catch((e: any) => setSkillOutput(`❌ ${e?.message ?? e}`))
      .finally(() => setSkillRunning(false))
  }, [customSkillText])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-700">🧠 GBrain</span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {editingRoot ? (
            <input
              autoFocus
              className="flex-1 text-xs border border-blue-300 rounded px-2 py-1 outline-none bg-white"
              value={rootInput}
              onChange={e => setRootInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setBrainRoot(rootInput.trim())
                  setEditingRoot(false)
                } else if (e.key === 'Escape') {
                  setRootInput(brainRoot)
                  setEditingRoot(false)
                }
              }}
              onBlur={() => {
                setBrainRoot(rootInput.trim())
                setEditingRoot(false)
              }}
            />
          ) : (
            <button
              className="text-xs text-gray-400 truncate max-w-xs hover:text-gray-600 transition-colors text-left"
              title="Click to change brain path"
              onClick={() => setEditingRoot(true)}
            >
              {brainRoot || '(set brain path)'}
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors
              ${panelTab === 'brain' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setPanelTab('brain')}
          >
            Brain
          </button>
          <button
            className={`px-3 py-1 rounded text-xs font-medium transition-colors
              ${panelTab === 'skills' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setPanelTab('skills')}
          >
            Skills
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left: file tree */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {rootError ? (
            <div className="p-3 text-xs text-red-500">
              <div className="font-medium">Brain not found</div>
              <div className="mt-1 text-gray-400">{rootError}</div>
              <div className="mt-2 text-gray-400">
                Clone GBrain: <code className="bg-gray-100 px-1 rounded">git clone github.com/garrytan/gbrain ~/gbrain</code>
              </div>
            </div>
          ) : rootEntries.length === 0 ? (
            <div className="p-3 text-xs text-gray-400">
              {brainRoot ? 'Loading…' : 'Set a brain path above'}
            </div>
          ) : (
            <div className="py-1">
              {rootEntries.map(entry => (
                <BrainTreeNode
                  key={entry.relPath}
                  entry={entry}
                  brainRoot={brainRoot}
                  depth={0}
                  onSelectFile={handleSelectFile}
                  selectedPath={selectedPath}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: content area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {panelTab === 'brain' ? (
            <div className="flex-1 overflow-y-auto p-6">
              {pageLoading && (
                <div className="text-sm text-gray-400">Loading…</div>
              )}
              {!pageLoading && pageContent !== null && (
                <div className="prose prose-sm max-w-none">
                  <Markdown>{pageContent}</Markdown>
                </div>
              )}
              {!pageLoading && pageContent === null && (
                <div className="text-sm text-gray-400 mt-8 text-center">
                  Select a brain page to read it
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Custom command bar */}
              <div className="flex gap-2">
                <input
                  ref={customInputRef}
                  className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  placeholder="/skill-name context… (e.g. /meeting-prep Sam Altman)"
                  value={customSkillText}
                  onChange={e => setCustomSkillText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customSkillText.trim()) handleCustomSkill()
                  }}
                />
                <button
                  className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
                  disabled={skillRunning || !customSkillText.trim()}
                  onClick={handleCustomSkill}
                >
                  {skillRunning ? '…' : 'Run'}
                </button>
              </div>

              {/* Skill output */}
              {skillOutput !== null && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
                  <div className="text-xs text-gray-400 mb-2 font-medium">Output</div>
                  <div className="prose prose-sm max-w-none">
                    <Markdown>{skillOutput}</Markdown>
                  </div>
                </div>
              )}

              {skillRunning && skillOutput === null && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-400">
                  Running skill…
                </div>
              )}

              {/* Skill cards */}
              <div className="grid grid-cols-1 gap-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Quick Launch
                </div>
                {GBRAIN_SKILLS.map(skill => (
                  <SkillCard
                    key={skill.slug}
                    skill={skill}
                    onRun={runSkill}
                    running={skillRunning}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GBrainView
