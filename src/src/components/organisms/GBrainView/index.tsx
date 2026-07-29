import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Markdown from 'marked-react'
import { FeedItem, getFeedItems } from 'src/api/feed_items'
import { listWorkspaces, Workspace, WorkspaceDocument } from 'src/api/workspaces'
import { CalendarEvents, serializeCalendarEventToMeeting } from 'src/hooks/dataSources/useCalendar'
import { IFeed } from 'src/hooks/feed/useFeed'
import { KN_SERVER_HOST } from 'src/utils/constants'

import { invoke } from '@tauri-apps/api/tauri'

import './style.scss'

interface Attendee {
  name: string
  email: string
}

interface BrainSearchResult {
  title: string
  relPath: string
  snippet: string
  score: number
}

interface BrainAnswer {
  question: string
  text: string
}

type View = 'ask' | 'today' | 'memory'

const SUGGESTED_QUESTIONS = [
  'What have I promised people recently?',
  'Catch me up on my most active project.',
  'Who have I not followed up with?',
]

const formatTime = (unix: number) =>
  new Date(unix * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const formatDay = (unix: number) => {
  const value = new Date(unix * 1000)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (value.toDateString() === today.toDateString()) return 'Today'
  if (value.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return value.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

const relativeTime = (date: Date) => {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 2) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const parseAttendees = (json: string): Attendee[] => {
  try {
    const value = JSON.parse(json)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const errorMessage = (reason: unknown) => {
  if (reason instanceof Error) return reason.message
  return typeof reason === 'string' ? reason : ''
}

const sourceLabel = (sourceType: string | null) => {
  const labels: Record<string, string> = {
    calendar: 'Calendar',
    drive: 'Google Drive',
    email: 'Email',
    meeting: 'Meetings',
    local_file: 'Local files',
    chat_output: 'Conversations',
    manual: 'Saved notes',
  }
  return labels[sourceType ?? ''] ?? 'Library'
}

const topDocuments = (workspaces: Workspace[], query: string, limit = 12) => {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter(term => term.length > 2)
  return workspaces
    .flatMap(workspace => (workspace.documents ?? []).map(document => ({ workspace, document })))
    .map(row => {
      const text = [
        row.workspace.name,
        row.workspace.description,
        row.document.documentName,
        row.document.summary,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0)
      return { ...row, score }
    })
    .filter(row => row.score > 0 || terms.length === 0)
    .sort((a, b) => b.score - a.score || (b.document.createdAt ?? 0) - (a.document.createdAt ?? 0))
    .slice(0, limit)
}

const documentContext = (workspace: Workspace, document: WorkspaceDocument) =>
  [
    `Source: ${document.documentName || workspace.name}`,
    `Collection: ${workspace.name}`,
    `Kind: ${sourceLabel(document.sourceType)}`,
    document.summary ? `Summary: ${document.summary}` : '',
  ]
    .filter(Boolean)
    .join('\n')

const feedTitle = (item: FeedItem) => item.getTitle?.() || item.title || 'Untitled activity'

const activityLabel = (item: FeedItem) => {
  if (item.automation?.name) return item.automation.name
  if (item.calendarEvent) return 'Meeting'
  return 'New memory'
}

const safeSlug = (text: string) => {
  const value = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return value || 'note'
}

const captureLinks = (text: string, workspaces: Workspace[]) =>
  workspaces
    .filter(workspace => text.toLowerCase().includes(workspace.name.toLowerCase()))
    .slice(0, 8)
    .map(workspace => {
      const folder = workspace.entityType === 'person' ? 'people' : 'projects'
      return `[[${folder}/${safeSlug(workspace.name)}]]`
    })

const GBrainView: React.FC<{
  feed?: IFeed
  onOpenMeeting?: () => void
  onOpenWorkspace?: (workspace: Workspace) => void
}> = ({ feed, onOpenMeeting, onOpenWorkspace }) => {
  const [view, setView] = useState<View>('ask')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<BrainAnswer | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capture, setCapture] = useState('')
  const [captureState, setCaptureState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [meetings, setMeetings] = useState<CalendarEvents[]>([])
  const [activity, setActivity] = useState<FeedItem[]>([])
  const [brainRoot, setBrainRoot] = useState('')
  const [savedPages, setSavedPages] = useState<BrainSearchResult[]>([])
  const [selectedPage, setSelectedPage] = useState<BrainSearchResult | null>(null)
  const [selectedPageContent, setSelectedPageContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const people = useMemo(
    () =>
      workspaces.filter(workspace => workspace.autoCurated && workspace.entityType === 'person'),
    [workspaces],
  )
  const projects = useMemo(
    () =>
      workspaces.filter(workspace => workspace.autoCurated && workspace.entityType === 'project'),
    [workspaces],
  )
  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>()
    workspaces.forEach(workspace =>
      (workspace.documents ?? []).forEach(document => {
        const label = sourceLabel(document.sourceType)
        counts.set(label, (counts.get(label) ?? 0) + 1)
      }),
    )
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [workspaces])

  const refresh = useCallback(async () => {
    setLoading(true)
    const now = Math.floor(Date.now() / 1000)
    const [workspaceResult, activityResult, meetingResult, root] = await Promise.all([
      listWorkspaces().catch(() => ({ success: false, data: [] as Workspace[] })),
      getFeedItems().catch(() => [] as FeedItem[]),
      fetch(`${KN_SERVER_HOST}/api/knapsack/calendar/get_events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_timestamp: now, end_timestamp: now + 60 * 60 * 24 * 7 }),
      })
        .then(response => (response.ok ? response.json() : []))
        .catch(() => []),
      invoke<string>('kn_brain_default_root').catch(() => ''),
    ])

    setWorkspaces(workspaceResult.success ? workspaceResult.data : [])
    setActivity(
      (activityResult as FeedItem[])
        .filter(item => item.run || item.calendarEvent || item.automation)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8),
    )
    setMeetings(
      (Array.isArray(meetingResult) ? meetingResult : [])
        .filter((event: CalendarEvents) => event.start > now)
        .sort((a: CalendarEvents, b: CalendarEvents) => a.start - b.start)
        .slice(0, 8),
    )
    setBrainRoot(root)
    if (root) {
      const pages = await invoke<BrainSearchResult[]>('kn_brain_search', {
        brainRoot: root,
        query: '',
        limit: 12,
      }).catch(() => [])
      setSavedPages(pages)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const askBrain = useCallback(
    async (rawQuestion: string) => {
      const text = rawQuestion.trim()
      if (!text || running) return
      setQuestion(text)
      setRunning(true)
      setError(null)
      setAnswer(null)

      try {
        const [brainPages, libraryRows] = await Promise.all([
          brainRoot
            ? invoke<BrainSearchResult[]>('kn_brain_search', {
                brainRoot,
                query: text,
                limit: 10,
              }).catch(() => [])
            : Promise.resolve([]),
          Promise.resolve(topDocuments(workspaces, text)),
        ])

        const localContext = [
          ...brainPages.map(
            page =>
              `Saved brain page: ${page.title}\nPage: ${page.relPath}\nExcerpt: ${page.snippet}`,
          ),
          ...libraryRows.map(row => documentContext(row.workspace, row.document)),
        ].join('\n\n---\n\n')

        const prompt = [
          'You are the synthesis layer for my private, local knowledge brain.',
          'Answer the user directly in plain language. Search local memory first when tools are available.',
          'Use the supplied local context as evidence. Do not invent facts or pretend an empty source says something.',
          'Connect relevant people, projects, meetings, and decisions into one useful answer.',
          'Cite each important claim using the exact source or page name in parentheses.',
          'End with a short section titled "What your brain may be missing" that names stale, conflicting, uncited, or absent context. If nothing material is missing, say so.',
          '',
          `Question: ${text}`,
          '',
          localContext
            ? `Local context:\n${localContext}`
            : 'Local context: No matching saved context was found. Be explicit that the brain cannot answer yet.',
        ].join('\n')

        const response = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: prompt, channel: 'webchat', agentId: 'main' }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.ok || !data.reply) {
          throw new Error(data.message || 'Your local agent is not ready.')
        }
        setAnswer({ question: text, text: data.reply })
      } catch (reason: unknown) {
        const message = errorMessage(reason)
        setError(
          message === 'Gateway not available'
            ? 'Your brain is saved locally, but the answer service is not running. Start Knapsack Chat, then try again.'
            : message || 'Your brain could not answer right now.',
        )
      } finally {
        setRunning(false)
      }
    },
    [brainRoot, running, workspaces],
  )

  const remember = useCallback(async () => {
    const text = capture.trim()
    if (!text || captureState === 'saving') return
    setCaptureState('saving')
    setError(null)
    try {
      const root = brainRoot || (await invoke<string>('kn_brain_default_root'))
      const now = new Date()
      const title =
        text
          .split(/[.!?\n]/)[0]
          .trim()
          .slice(0, 80) || 'Saved note'
      const links = captureLinks(text, workspaces)
      const relPath = `inbox/${now.toISOString().slice(0, 10)}-${safeSlug(title)}-${now.getTime().toString().slice(-6)}.md`
      const content = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        'type: note',
        `captured_at: ${now.toISOString()}`,
        'source: knapsack',
        '---',
        '',
        `# ${title}`,
        '',
        text,
        links.length ? `\n## Related\n${links.map(link => `- ${link}`).join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      await invoke('kn_brain_write_page', { brainRoot: root, relPath, content })
      setBrainRoot(root)
      setCapture('')
      setCaptureState('saved')
      const pages = await invoke<BrainSearchResult[]>('kn_brain_search', {
        brainRoot: root,
        query: '',
        limit: 12,
      }).catch(() => [])
      setSavedPages(pages)
      window.setTimeout(() => setCaptureState('idle'), 2500)
    } catch (reason: unknown) {
      setCaptureState('idle')
      setError(errorMessage(reason) || 'That note could not be saved.')
    }
  }, [brainRoot, capture, captureState, workspaces])

  const prepMeeting = useCallback(
    (event: CalendarEvents) => {
      const attendees = parseAttendees(event.attendees_json)
        .map(attendee => attendee.name || attendee.email)
        .filter(Boolean)
        .join(', ')
      const prompt = [
        `Prepare me for "${event.title}" on ${formatDay(event.start)} at ${formatTime(event.start)}.`,
        attendees ? `People: ${attendees}.` : '',
        'Tell me what matters, the open loops, useful context about the people, and what the brain may be missing.',
      ]
        .filter(Boolean)
        .join(' ')
      setView('ask')
      askBrain(prompt)
    },
    [askBrain],
  )

  const openMeeting = useCallback(
    async (event: CalendarEvents) => {
      if (!feed) return
      await feed.openCalendarEvent(serializeCalendarEventToMeeting(event))
      onOpenMeeting?.()
    },
    [feed, onOpenMeeting],
  )

  const openPage = useCallback(
    async (page: BrainSearchResult) => {
      setSelectedPage(page)
      setSelectedPageContent(null)
      const content = await invoke<string>('kn_brain_read_page', {
        brainRoot,
        relPath: page.relPath,
      }).catch(() => '> This memory could not be opened.')
      setSelectedPageContent(content)
    },
    [brainRoot],
  )

  return (
    <div className="Brain" data-testid="qa-gbrain-panel">
      <header className="BrainHeader">
        <div>
          <p className="BrainEyebrow">Your private knowledge</p>
          <h1>Brain</h1>
          <p className="BrainSubtitle">
            Ask what you know. Save what matters. Walk into the day prepared.
          </p>
        </div>
        <nav className="BrainNav" aria-label="Brain views">
          {(
            [
              ['ask', 'Ask'],
              ['today', 'Today'],
              ['memory', 'Memory'],
            ] as [View, string][]
          ).map(([id, label]) => (
            <button key={id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <div className="BrainNotice BrainNotice--error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {view === 'ask' && (
        <main className="BrainMain BrainMain--ask">
          <section className="BrainAsk">
            <label htmlFor="brain-question">What do you want to know?</label>
            <div className="BrainAskBox">
              <textarea
                id="brain-question"
                rows={3}
                value={question}
                onChange={event => setQuestion(event.target.value)}
                onKeyDown={event => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') askBrain(question)
                }}
                placeholder="Ask about a person, project, decision, or something you may have forgotten…"
              />
              <button disabled={running || !question.trim()} onClick={() => askBrain(question)}>
                {running ? 'Thinking…' : 'Ask my brain'}
              </button>
            </div>
            {!answer && !running && (
              <div className="BrainSuggestions">
                {SUGGESTED_QUESTIONS.map(suggestion => (
                  <button key={suggestion} onClick={() => askBrain(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </section>

          {running && (
            <section className="BrainAnswer BrainAnswer--loading" aria-live="polite">
              <span />
              <div>
                <strong>Connecting the dots…</strong>
                <p>Reading your saved context and checking what may be missing.</p>
              </div>
            </section>
          )}

          {answer && !running && (
            <section className="BrainAnswer">
              <p className="BrainAnswerQuestion">{answer.question}</p>
              <div className="BrainMarkdown">
                <Markdown>{answer.text}</Markdown>
              </div>
            </section>
          )}

          <section className="BrainCapture">
            <div>
              <h2>Remember something</h2>
              <p>
                Drop in a decision, idea, promise, or useful detail. Your brain will connect it
                later.
              </p>
            </div>
            <div className="BrainCaptureBox">
              <textarea
                rows={2}
                value={capture}
                onChange={event => setCapture(event.target.value)}
                placeholder="Example: I promised Maya a revised proposal by Friday."
              />
              <button disabled={!capture.trim() || captureState === 'saving'} onClick={remember}>
                {captureState === 'saving'
                  ? 'Saving…'
                  : captureState === 'saved'
                    ? 'Saved'
                    : 'Remember this'}
              </button>
            </div>
          </section>
        </main>
      )}

      {view === 'today' && (
        <main className="BrainMain">
          <div className="BrainSectionHeading">
            <div>
              <p className="BrainEyebrow">Your next moves</p>
              <h2>Be ready before you need to be</h2>
            </div>
            <button className="BrainTextButton" onClick={refresh}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="BrainEmpty">Loading today…</div>
          ) : meetings.length === 0 ? (
            <div className="BrainEmpty">
              <strong>No upcoming meetings found</strong>
              <span>
                When your calendar has something coming up, your brain will offer prep here.
              </span>
            </div>
          ) : (
            <section className="BrainMeetingList">
              {meetings.map(event => {
                const attendees = parseAttendees(event.attendees_json)
                return (
                  <article className="BrainMeeting" key={event.id}>
                    <div className="BrainMeetingTime">
                      <strong>{formatTime(event.start)}</strong>
                      <span>{formatDay(event.start)}</span>
                    </div>
                    <div className="BrainMeetingBody">
                      <h3>{event.title}</h3>
                      <p>
                        {attendees
                          .slice(0, 3)
                          .map(person => person.name || person.email)
                          .filter(Boolean)
                          .join(', ') || 'No attendees listed'}
                      </p>
                    </div>
                    <div className="BrainMeetingActions">
                      <button onClick={() => openMeeting(event)} disabled={!feed}>
                        Open
                      </button>
                      <button className="is-primary" onClick={() => prepMeeting(event)}>
                        Prepare me
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

          <section className="BrainQuickActions">
            <button
              onClick={() => {
                setView('ask')
                askBrain('What open loops and promises should I handle today?')
              }}
            >
              <strong>Find my open loops</strong>
              <span>Promises, follow-ups, and loose ends</span>
            </button>
            <button
              onClick={() => {
                setView('ask')
                askBrain('What changed recently across my active projects?')
              }}
            >
              <strong>Catch me up</strong>
              <span>Recent changes across active work</span>
            </button>
          </section>

          <section className="BrainActivity">
            <div className="BrainSectionHeading">
              <h2>Recently learned</h2>
            </div>
            {activity.length === 0 ? (
              <div className="BrainEmpty BrainEmpty--compact">
                Your recent meetings and agent work will appear here.
              </div>
            ) : (
              activity.map(item => (
                <div className="BrainActivityRow" key={item.id ?? item.timestamp.getTime()}>
                  <div>
                    <strong>{feedTitle(item)}</strong>
                    <span>{activityLabel(item)}</span>
                  </div>
                  <time>{relativeTime(item.timestamp)}</time>
                </div>
              ))
            )}
          </section>
        </main>
      )}

      {view === 'memory' && (
        <main className="BrainMain">
          <div className="BrainSectionHeading">
            <div>
              <p className="BrainEyebrow">What your brain knows</p>
              <h2>People, projects, and source material</h2>
            </div>
            <button className="BrainTextButton" onClick={refresh}>
              Refresh
            </button>
          </div>

          <section className="BrainSummary">
            <div>
              <strong>{people.length}</strong>
              <span>People</span>
            </div>
            <div>
              <strong>{projects.length}</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>{sourceCounts.reduce((sum, [, count]) => sum + count, 0)}</strong>
              <span>Source items</span>
            </div>
            <div>
              <strong>{savedPages.length}</strong>
              <span>Saved notes</span>
            </div>
          </section>

          <section className="BrainMemoryGrid">
            <div className="BrainMemoryColumn">
              <div className="BrainSectionHeading">
                <h2>People</h2>
              </div>
              {people.length === 0 ? (
                <div className="BrainEmpty BrainEmpty--compact">
                  People appear as your meetings, email, and notes connect.
                </div>
              ) : (
                people.slice(0, 12).map(person => (
                  <button
                    className="BrainEntity"
                    key={person.uuid}
                    onClick={() => onOpenWorkspace?.(person)}
                  >
                    <strong>{person.name}</strong>
                    <span>
                      {person.description || `${(person.documents ?? []).length} related items`}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="BrainMemoryColumn">
              <div className="BrainSectionHeading">
                <h2>Projects</h2>
              </div>
              {projects.length === 0 ? (
                <div className="BrainEmpty BrainEmpty--compact">
                  Projects take shape as related work accumulates.
                </div>
              ) : (
                projects.slice(0, 12).map(project => (
                  <button
                    className="BrainEntity"
                    key={project.uuid}
                    onClick={() => onOpenWorkspace?.(project)}
                  >
                    <strong>{project.name}</strong>
                    <span>
                      {project.description || `${(project.documents ?? []).length} related items`}
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="BrainSources">
            <div className="BrainSectionHeading">
              <h2>Learning from</h2>
            </div>
            {sourceCounts.length === 0 ? (
              <div className="BrainEmpty BrainEmpty--compact">
                Connect email, calendar, Drive, or local files to give your brain context.
              </div>
            ) : (
              <div className="BrainSourceList">
                {sourceCounts.map(([source, count]) => (
                  <div key={source}>
                    <strong>{source}</strong>
                    <span>{count} items</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="BrainSaved">
            <div className="BrainSectionHeading">
              <h2>Saved notes</h2>
            </div>
            <div className="BrainSavedLayout">
              <div className="BrainSavedList">
                {savedPages.length === 0 ? (
                  <div className="BrainEmpty BrainEmpty--compact">
                    Use “Remember something” and your notes will show up here.
                  </div>
                ) : (
                  savedPages.map(page => (
                    <button
                      className={selectedPage?.relPath === page.relPath ? 'is-active' : ''}
                      key={page.relPath}
                      onClick={() => openPage(page)}
                    >
                      <strong>{page.title}</strong>
                      <span>{page.snippet || 'Saved memory'}</span>
                    </button>
                  ))
                )}
              </div>
              <div className="BrainSavedPreview">
                {selectedPageContent === null ? (
                  <div className="BrainEmpty BrainEmpty--compact">Choose a note to read it.</div>
                ) : (
                  <div className="BrainMarkdown">
                    <Markdown>{selectedPageContent}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default GBrainView
