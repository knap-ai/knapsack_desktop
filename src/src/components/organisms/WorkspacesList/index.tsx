import { useEffect, useMemo, useState } from 'react'
import {
  CurationStatus,
  Workspace,
  curateLibraryNow,
  createWorkspace,
  deleteWorkspace,
  getCurationStatus,
  listWorkspaces,
  parseTags,
  promoteWorkspace,
  updateCurationSettings,
  wipeLibrary,
} from '../../../api/workspaces'
import { KN_API_GET_USER_EMAIL, KN_API_STREAM_LLM_COMPLETE } from '../../../utils/constants'

const LOCAL_FILES_PROMPT_KEY = 'knap.library.localFilesPromptShown'
const GDRIVE_PROMPT_KEY = 'knap.library.gdrivePromptShown'
const SUMMARY_CACHE_PREFIX = 'knap.library.summary.'

interface CardSummary {
  summary: string
  nextAction: string
}

interface WorkspacesListProps {
  onWorkspaceOpen: (workspace: Workspace) => void
}

function WorkspacesList({ onWorkspaceOpen }: WorkspacesListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [curationStatus, setCurationStatus] = useState<CurationStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [showLocalFilesPrompt, setShowLocalFilesPrompt] = useState(false)
  const [showGDrivePrompt, setShowGDrivePrompt] = useState(false)
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true)
  const [cardSummaries, setCardSummaries] = useState<Map<string, CardSummary>>(new Map())

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const res = await listWorkspaces()
      if (res.success) {
        setWorkspaces(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatus = async () => {
    try {
      const status = await getCurationStatus()
      setCurationStatus(status)
      return status
    } catch (err) {
      console.error('Failed to fetch curation status:', err)
      return null
    }
  }

  useEffect(() => {
    const init = async () => {
      const status = await fetchStatus()

      // First-visit local files prompt — show only once per device.
      try {
        const shown = localStorage.getItem(LOCAL_FILES_PROMPT_KEY)
        if (!shown) setShowLocalFilesPrompt(true)
      } catch {
        // no-op
      }

      // GDrive encouragement — show once if Drive curation isn't yet enabled.
      try {
        const shown = localStorage.getItem(GDRIVE_PROMPT_KEY)
        if (!shown && status && !status.sourcesDrive) setShowGDrivePrompt(true)
      } catch {
        // no-op
      }

      // Auto-trigger curation on first open if it's never run before.
      if (status && status.enabled && !status.lastRunAt) {
        try {
          await curateLibraryNow()
        } catch {
          // non-fatal
        }
      }

      await fetchWorkspaces()
    }
    init()
  }, [])

  /** Load cached summaries and generate missing ones for auto-curated workspaces. */
  const [generatingSummaries, setGeneratingSummaries] = useState(false)

  useEffect(() => {
    if (workspaces.length === 0) return

    // Load what's already cached.
    const cached = new Map<string, CardSummary>()
    for (const ws of workspaces) {
      try {
        const raw = localStorage.getItem(SUMMARY_CACHE_PREFIX + ws.uuid)
        if (raw) cached.set(ws.uuid, JSON.parse(raw))
      } catch {
        // no-op
      }
    }
    if (cached.size > 0) setCardSummaries(cached)

    // Queue generation for auto-curated workspaces without a cached summary.
    const toGenerate = workspaces.filter(
      ws => ws.autoCurated && !cached.has(ws.uuid),
    )
    if (toGenerate.length === 0) return

    // Prioritize people first — they have the thinnest descriptions and benefit
    // most from an AI summary. Projects already have an LLM-generated description.
    toGenerate.sort((a, b) => {
      if (a.entityType === 'person' && b.entityType !== 'person') return -1
      if (a.entityType !== 'person' && b.entityType === 'person') return 1
      return 0
    })

    let cancelled = false
    setGeneratingSummaries(true)
    ;(async () => {
      // Fetch user email once for all LLM calls (may 404, that's fine).
      let userEmail = ''
      try {
        const res = await fetch(KN_API_GET_USER_EMAIL)
        if (res.ok) {
          const data = await res.json()
          if (data.email) userEmail = data.email
        }
      } catch {
        // proceed with empty email
      }

      for (const ws of toGenerate) {
        if (cancelled) break
        const existing = localStorage.getItem(SUMMARY_CACHE_PREFIX + ws.uuid)
        if (existing) continue
        try {
          const result = await generateCardSummary(ws, getTopTags(ws, 6), userEmail)
          if (cancelled) break
          if (result) {
            setCardSummaries(prev => {
              const next = new Map(prev)
              next.set(ws.uuid, result)
              return next
            })
            try {
              localStorage.setItem(SUMMARY_CACHE_PREFIX + ws.uuid, JSON.stringify(result))
            } catch {
              // no-op
            }
          }
        } catch (err) {
          console.error(`[Library] summary generation failed for ${ws.name}:`, err)
        }
      }
      if (!cancelled) setGeneratingSummaries(false)
    })()

    return () => {
      cancelled = true
      setGeneratingSummaries(false)
    }
  }, [workspaces])

  const dismissGDrivePrompt = (enable: boolean) => {
    try {
      localStorage.setItem(GDRIVE_PROMPT_KEY, '1')
    } catch {
      // no-op
    }
    setShowGDrivePrompt(false)
    if (enable) {
      updateCurationSettings({ sourcesDrive: true })
        .then(s => setCurationStatus(s))
        .catch(err => console.error('Failed to enable GDrive:', err))
    }
  }

  const dismissLocalFilesPrompt = (enable: boolean) => {
    try {
      localStorage.setItem(LOCAL_FILES_PROMPT_KEY, '1')
    } catch {
      // no-op
    }
    setShowLocalFilesPrompt(false)
    if (enable) {
      updateCurationSettings({ sourcesLocalFiles: true })
        .then(s => setCurationStatus(s))
        .catch(err => console.error('Failed to enable local files:', err))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await curateLibraryNow()
      await fetchWorkspaces()
      await fetchStatus()
    } catch (err) {
      console.error('Failed to curate now:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handlePromote = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation()
    try {
      await promoteWorkspace(uuid)
      await fetchWorkspaces()
    } catch (err) {
      console.error('Failed to promote workspace:', err)
    }
  }

  const handleWipeLibrary = async () => {
    if (!confirm(
      'This will permanently delete all auto-curated collections and their documents. ' +
      'Your synced emails, calendar, and files are not affected. Continue?',
    )) return
    const includeManual = confirm(
      'Also delete your manually-created collections? Click Cancel to keep them.',
    )
    try {
      await wipeLibrary(includeManual)
      await fetchWorkspaces()
      await fetchStatus()
    } catch (err) {
      console.error('Failed to wipe library:', err)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const res = await createWorkspace(newName.trim(), newDescription.trim() || undefined)
      if (res.success && res.data) {
        setWorkspaces(prev => [res.data!, ...prev])
        setShowCreateModal(false)
        setNewName('')
        setNewDescription('')
      }
    } catch (err) {
      console.error('Failed to create workspace:', err)
    }
  }

  const handleNextActionClick = (e: React.MouseEvent, action: string, workspace: Workspace) => {
    e.stopPropagation()
    // Build a richer prompt so the chat has context about who/what this is about.
    const subject = workspace.entityType === 'person' ? workspace.name : `the ${workspace.name} project`
    const prompt = `Regarding ${subject}: ${action}`
    window.dispatchEvent(new CustomEvent('clawd-focus-chat'))
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('clawd-send-user', { detail: prompt }))
    }, 100)
  }

  const handleDelete = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this collection and all its documents?')) return
    try {
      const res = await deleteWorkspace(uuid)
      if (res.success) {
        setWorkspaces(prev => prev.filter(w => w.uuid !== uuid))
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err)
    }
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  /** Collect the top auto-tags across all documents in a workspace. */
  const getTopTags = (workspace: Workspace, max = 4): string[] => {
    const tagCounts = new Map<string, number>()
    for (const doc of workspace.documents ?? []) {
      for (const tag of parseTags(doc.autoTags)) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
      for (const tag of parseTags(doc.tags)) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }
    return [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([tag]) => tag)
  }

  /** Count saved chat outputs in a workspace. */
  const chatOutputCount = (workspace: Workspace): number =>
    (workspace.documents ?? []).filter(d => d.documentType === 'chat_output').length

  /** Source-mix label for an auto-curated collection card. */
  const sourceMixLabel = (workspace: Workspace): string => {
    const counts = new Map<string, number>()
    for (const doc of workspace.documents ?? []) {
      const t = doc.sourceType ?? doc.documentType ?? 'doc'
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    const labelFor: Record<string, string> = {
      email: 'email',
      calendar: 'meeting',
      meeting: 'meeting',
      drive: 'doc',
      local_file: 'file',
      chat_output: 'saved chat',
      manual: 'doc',
      doc: 'doc',
    }
    const parts: string[] = []
    for (const [type, count] of counts) {
      const label = labelFor[type] ?? type
      parts.push(`${count} ${label}${count !== 1 ? 's' : ''}`)
    }
    return parts.join(' · ')
  }

  // Group workspaces by entity type for the three sections.
  const { peopleWorkspaces, projectWorkspaces, manualWorkspaces } = useMemo(() => {
    const people: Workspace[] = []
    const projects: Workspace[] = []
    const manual: Workspace[] = []
    for (const ws of workspaces) {
      if (ws.autoCurated && ws.entityType === 'person') people.push(ws)
      else if (ws.autoCurated && ws.entityType === 'project') projects.push(ws)
      else manual.push(ws)
    }
    return { peopleWorkspaces: people, projectWorkspaces: projects, manualWorkspaces: manual }
  }, [workspaces])

  const lastRunLabel = curationStatus?.lastRunAt
    ? `Last refreshed ${formatDate(curationStatus.lastRunAt)}`
    : 'Never refreshed'

  const renderCard = (workspace: Workspace, opts: { auto: boolean }) => {
    const topTags = getTopTags(workspace)
    const savedAnswers = chatOutputCount(workspace)
    const mixLabel = opts.auto ? sourceMixLabel(workspace) : ''
    const aiSummary = cardSummaries.get(workspace.uuid)

    return (
      <div
        key={workspace.uuid}
        className="border border-gray-200 rounded-lg min-h-52 w-64 flex flex-col justify-between p-4 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
        onClick={() => onWorkspaceOpen(workspace)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{workspace.icon || '\uD83D\uDCC1'}</span>
            <span className="font-semibold text-lg truncate">{workspace.name}</span>
            {opts.auto && (
              <span title="Auto-curated by Knapsack" className="text-xs">✨</span>
            )}
          </div>
          {aiSummary ? (
            <>
              <div className="text-sm text-gray-600 mt-0.5">
                {aiSummary.summary}
              </div>
              {aiSummary.nextAction && (
                <button
                  className="text-xs text-left text-blue-600 bg-blue-50 hover:bg-blue-100 rounded px-2 py-1 mt-1 transition-colors"
                  onClick={e => handleNextActionClick(e, aiSummary.nextAction, workspace)}
                  title="Send to Chat"
                >
                  → {aiSummary.nextAction}
                </button>
              )}
            </>
          ) : (
            <>
              {workspace.description && (
                <div className="text-sm text-gray-500">
                  {workspace.description}
                </div>
              )}
              {opts.auto && generatingSummaries && (
                <div className="text-xs text-gray-400 italic mt-1">Generating summary…</div>
              )}
            </>
          )}
          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {topTags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 truncate max-w-[120px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-400 truncate">
            {opts.auto && mixLabel ? mixLabel : `${workspace.documents?.length ?? 0} doc${(workspace.documents?.length ?? 0) !== 1 ? 's' : ''}`}
            {savedAnswers > 0 && ` · ${savedAnswers} saved`}
          </div>
          {opts.auto ? (
            <button
              className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              onClick={e => handlePromote(e, workspace.uuid)}
              title="Pin so the curator won't overwrite it"
            >
              Pin
            </button>
          ) : (
            <button
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              onClick={e => handleDelete(e, workspace.uuid)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderSection = (title: string, items: Workspace[], opts: { auto: boolean }, extra?: React.ReactNode) => {
    if (items.length === 0 && !extra) return null
    return (
      <div className="mb-8">
        <div className="font-semibold text-base text-gray-700 mb-3">{title}</div>
        <div className="flex flex-row flex-wrap gap-4">
          {items.map(ws => renderCard(ws, opts))}
          {extra}
        </div>
      </div>
    )
  }

  const isBuilding = loading && workspaces.length === 0
  const totalAuto = peopleWorkspaces.length + projectWorkspaces.length

  return (
    <div className="flex flex-col p-6 pl-10">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-2xl">Your Library</div>
          <div className="font-medium text-lg text-gray-500">
            Collect documents, save answers, and build your personal knowledge base.
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <div className="text-xs text-gray-400">{lastRunLabel}</div>
        </div>
      </div>

      {showPrivacyBanner && (
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-4">
          <div>
            🔒 Knapsack is private. Your library is stored locally on this device — nothing here is uploaded except what's needed to generate tags and summaries.
            {' '}
            <button
              className="underline hover:text-red-600"
              onClick={handleWipeLibrary}
            >
              Delete my library
            </button>
          </div>
          <button
            className="ml-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPrivacyBanner(false)}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {showLocalFilesPrompt && (
        <div className="flex items-center justify-between text-sm bg-blue-50 border border-blue-200 rounded-md px-4 py-3 mb-6">
          <div>
            <div className="font-semibold text-blue-900">Include local files in your library?</div>
            <div className="text-blue-700 mt-0.5">
              Knapsack will index files in your Documents folder and Desktop. You can disable this anytime in settings.
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => dismissLocalFilesPrompt(true)}
            >
              Enable
            </button>
            <button
              className="px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 rounded-md"
              onClick={() => dismissLocalFilesPrompt(false)}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {showGDrivePrompt && (
        <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-md px-4 py-3 mb-6">
          <div>
            <div className="font-semibold text-green-900">Enrich your library with Google Drive</div>
            <div className="text-green-700 mt-0.5">
              Connect your Google account in Settings → Connections, then enable Drive below to automatically import your docs and files into collections.
            </div>
          </div>
          <div className="flex gap-2 ml-4 flex-shrink-0">
            <button
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={() => dismissGDrivePrompt(true)}
            >
              Enable
            </button>
            <button
              className="px-3 py-1.5 text-sm text-green-700 hover:bg-green-100 rounded-md"
              onClick={() => dismissGDrivePrompt(false)}
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {isBuilding && (
        <div className="text-gray-400 text-sm mb-6">
          Building your library… this may take a minute on first launch.
        </div>
      )}

      {totalAuto === 0 && !isBuilding && curationStatus?.enabled && (
        <div className="text-sm text-gray-500 mb-6">
          No auto-collections yet. They'll appear here as Knapsack indexes your email and calendar.
        </div>
      )}

      {renderSection(
        'Your Collections',
        manualWorkspaces,
        { auto: false },
        <div
          key="__create__"
          className="border border-dashed border-gray-300 rounded-lg h-52 w-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="text-3xl text-gray-400 mb-2">+</div>
          <div className="font-semibold text-gray-600">Create Collection</div>
          <div className="text-sm text-gray-400 text-center px-4 mt-1">
            Add documents for project-specific search.
          </div>
        </div>,
      )}
      {renderSection('People', peopleWorkspaces, { auto: true })}
      {renderSection('Projects', projectWorkspaces, { auto: true })}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="font-semibold text-lg mb-4">Create Collection</div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Project Alpha"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What is this collection about?"
                rows={3}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewName('')
                  setNewDescription('')
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

async function generateCardSummary(workspace: Workspace, topTags: string[], userEmail: string): Promise<CardSummary | null> {
  const docs = workspace.documents ?? []
  const docTitles = docs
    .slice(0, 12)
    .map(d => d.documentName)
    .join(', ')

  const isPerson = workspace.entityType === 'person'

  const contextLines = [
    `Name: ${workspace.name}`,
    isPerson ? 'Type: Person (contact)' : 'Type: Project',
    topTags.length > 0 ? `Key topics: ${topTags.join(', ')}` : '',
    docTitles ? `Recent document titles: ${docTitles}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const prompt = isPerson
    ? `You are a personal CRM assistant. Based on the document titles and topics below, infer:\n` +
      `1. Who this person likely is (role, company, or relationship — e.g. "Your accountant at Sage Financial", "Engineering lead at Acme", "Investor contact"). Do NOT restate email/meeting counts.\n` +
      `2. What you're actively working on together right now, based on the most recent document titles.\n` +
      `3. One specific, actionable next step.\n\n` +
      `${contextLines}\n\n` +
      `Reply ONLY with JSON, no other text:\n` +
      `{"summary": "1-2 sentences about who they are and what you're working on together", "nextAction": "one concrete next step"}`
    : `Based on this project from my knowledge base, give me:\n` +
      `1. A 1-2 sentence description of what this project is about (infer from document titles and topics, not stats)\n` +
      `2. One specific next action I should take\n\n` +
      `${contextLines}\n\n` +
      `Reply ONLY with JSON, no other text:\n` +
      `{"summary": "your description here", "nextAction": "your suggested action here"}`

  try {
    const response = await fetch(KN_API_STREAM_LLM_COMPLETE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: userEmail,
        user_name: '',
        prompt,
        semantic_search_query: null,
        documents: [],
        is_local: false,
      }),
    })

    if (!response.ok) {
      console.error(`[Library] LLM returned ${response.status} for ${workspace.name}`)
      return null
    }
    if (!response.body) {
      console.error(`[Library] LLM returned no body for ${workspace.name}`)
      return null
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let text = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue
        if (line.trim() === 'data: [DONE]') break
        try {
          text += JSON.parse(line.slice(6)).choices[0].text
        } catch {
          // malformed chunk
        }
      }
    }

    console.log(`[Library] LLM raw for ${workspace.name}:`, text.slice(0, 300))

    // Extract JSON — handle markdown fences and extra text.
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error(`[Library] no JSON found in LLM response for ${workspace.name}`)
      return null
    }

    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
    if (parsed.summary && parsed.nextAction) {
      return { summary: parsed.summary, nextAction: parsed.nextAction }
    }
    console.error(`[Library] JSON missing expected fields for ${workspace.name}:`, parsed)
    return null
  } catch (err) {
    console.error(`[Library] generateCardSummary error for ${workspace.name}:`, err)
    return null
  }
}

export default WorkspacesList
