import { useEffect, useMemo, useState } from 'react'

import { FeedItem } from 'src/api/feed_items'
import { Workspace, curateLibraryNow, listWorkspaces, parseTags } from 'src/api/workspaces'
import { IFeed, STATIONARY_ITEMS } from 'src/hooks/feed/useFeed'
import KNDateUtils from 'src/utils/KNDateUtils'
import { KN_SERVER_HOST } from 'src/utils/constants'
import { ThreadType } from 'src/api/threads'

import './style.scss'

type GBrainTab = 'feed' | 'skills' | 'brain'
type FeedFilter = 'all' | 'meetings' | 'automations' | 'notes'

interface SkillInfo {
  name: string
  emoji?: string
  description?: string
  source?: string
  eligible?: boolean
  enabled?: boolean
}

interface GBrainProps {
  feed: IFeed
  onOpenFeedItem: (item: FeedItem, key: string) => void
  onOpenWorkspace: (workspace: Workspace) => void
}

interface FeedSignal {
  item: FeedItem
  key: string
  title: string
  subtitle: string
  kind: 'meeting' | 'automation' | 'note' | 'email' | 'memory'
  timestamp: Date
  status: string
}

const kindLabel: Record<FeedSignal['kind'], string> = {
  meeting: 'Meeting',
  automation: 'Automation',
  note: 'Notes',
  email: 'Email',
  memory: 'Memory',
}

const kindTone: Record<FeedSignal['kind'], string> = {
  meeting: 'blue',
  automation: 'amber',
  note: 'green',
  email: 'violet',
  memory: 'slate',
}

function GBrain({
  feed,
  onOpenFeedItem,
  onOpenWorkspace,
}: GBrainProps) {
  const [activeTab, setActiveTab] = useState<GBrainTab>('feed')
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadWorkspaces = async () => {
    setLoadingWorkspaces(true)
    try {
      const res = await listWorkspaces()
      if (res.success) setWorkspaces(res.data)
    } catch (err) {
      console.error('[GBrain] failed to load workspaces', err)
    } finally {
      setLoadingWorkspaces(false)
    }
  }

  useEffect(() => {
    loadWorkspaces()
  }, [])

  useEffect(() => {
    fetch(`${KN_SERVER_HOST}/api/clawd/skills/status`)
      .then(res => res.json())
      .then(data => {
        const raw = Array.isArray(data.skills) ? data.skills : (data.skills?.skills ?? [])
        setSkills(raw)
      })
      .catch(err => {
        console.error('[GBrain] failed to load skills', err)
        setSkills([])
      })
  }, [])

  const signals = useMemo(() => {
    const rows: FeedSignal[] = []
    Object.entries(feed.feedContent ?? {}).forEach(([key, items]) => {
      if (key === STATIONARY_ITEMS) return
      items.forEach(item => {
        rows.push(toFeedSignal(item, key))
      })
    })
    return rows.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [feed.feedContent])

  const filteredSignals = useMemo(() => {
    if (feedFilter === 'all') return signals
    if (feedFilter === 'meetings') return signals.filter(s => s.kind === 'meeting')
    if (feedFilter === 'automations') return signals.filter(s => s.kind === 'automation')
    return signals.filter(s => s.kind === 'note')
  }, [signals, feedFilter])

  const people = workspaces.filter(ws => ws.autoCurated && ws.entityType === 'person')
  const projects = workspaces.filter(ws => ws.autoCurated && ws.entityType === 'project')
  const collections = workspaces.filter(ws => !ws.autoCurated)
  const enabledSkills = skills.filter(s => s.eligible || s.enabled)
  const availableSkills = skills.filter(s => !s.eligible && !s.enabled)
  const sourceCount = new Set(
    workspaces.flatMap(ws => (ws.documents ?? []).map(doc => doc.sourceType ?? doc.documentType ?? 'doc')),
  ).size

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await feed.refreshFeedItems()
      await curateLibraryNow()
      await loadWorkspaces()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="GBrain">
      <header className="GBrainHeader">
        <div>
          <div className="GBrainBrand">
            <span className="GBrainMark" aria-hidden="true">🧠</span>
            <span>GBrain</span>
          </div>
          <div className="GBrainSubhead">
            Persistent memory for meetings, people, projects, skills, and agent work.
          </div>
        </div>

        <nav className="GBrainTabs" aria-label="GBrain views">
          {(['feed', 'skills', 'brain'] as GBrainTab[]).map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <section className="GBrainStats">
        <Stat label="Signals" value={signals.length} detail="feed items" />
        <Stat label="People" value={people.length} detail="auto-curated" />
        <Stat label="Projects" value={projects.length} detail="active workstreams" />
        <Stat label="Skills" value={skills.length} detail={`${enabledSkills.length} ready`} />
        <Stat label="Sources" value={sourceCount} detail="indexed types" />
      </section>

      {activeTab === 'feed' && (
        <main className="GBrainPanel">
          <div className="GBrainPanelHead">
            <div>
              <h2>Signal Timeline</h2>
              <p>Everything your brain has touched, not just the calendar.</p>
            </div>
            <div className="GBrainActions">
              {(['all', 'meetings', 'automations', 'notes'] as FeedFilter[]).map(filter => (
                <button
                  key={filter}
                  className={feedFilter === filter ? 'active' : ''}
                  onClick={() => setFeedFilter(filter)}
                >
                  {filter[0].toUpperCase() + filter.slice(1)}
                </button>
              ))}
              <button onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="GBrainTimeline">
            {filteredSignals.length === 0 ? (
              <EmptyState
                title="No signals yet"
                body="Connect calendar, email, Drive, or run an automation to start building memory."
              />
            ) : (
              filteredSignals.map(signal => (
                <button
                  key={`${signal.key}-${signal.item.id ?? signal.title}-${signal.timestamp.getTime()}`}
                  className="GBrainSignal"
                  onClick={() => onOpenFeedItem(signal.item, signal.key)}
                >
                  <span className={`GBrainSignalIcon tone-${kindTone[signal.kind]}`}>
                    {kindLabel[signal.kind][0]}
                  </span>
                  <span className="GBrainSignalMain">
                    <span className="GBrainSignalTitle">
                      {signal.title}
                      <span>{relativeTime(signal.timestamp)}</span>
                    </span>
                    <span className="GBrainSignalMeta">
                      {kindLabel[signal.kind]} · {signal.subtitle || signal.status}
                    </span>
                  </span>
                  <span className="GBrainSignalAction">Open</span>
                </button>
              ))
            )}
          </div>
        </main>
      )}

      {activeTab === 'skills' && (
        <main className="GBrainPanel">
          <div className="GBrainPanelHead">
            <div>
              <h2>Skills</h2>
              <p>Agent workflows and tools. People and projects live in Brain.</p>
            </div>
          </div>
          <div className="GBrainSkillGrid">
            {(enabledSkills.length ? enabledSkills : skills).map(skill => (
              <div key={skill.name} className="GBrainSkill">
                <div className="GBrainSkillTop">
                  <span>{skill.emoji || '•'}</span>
                  <strong>{skill.name}</strong>
                  <em>{skill.eligible || skill.enabled ? 'Ready' : 'Available'}</em>
                </div>
                <p>{skill.description || 'Workflow available to the agent.'}</p>
                <small>{skill.source || 'Knapsack'}</small>
              </div>
            ))}
            {availableSkills.slice(0, 8).map(skill => (
              <div key={`available-${skill.name}`} className="GBrainSkill is-muted">
                <div className="GBrainSkillTop">
                  <span>{skill.emoji || '•'}</span>
                  <strong>{skill.name}</strong>
                  <em>Installable</em>
                </div>
                <p>{skill.description || 'Optional skill.'}</p>
                <small>{skill.source || 'OpenClaw'}</small>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'brain' && (
        <main className="GBrainPanel">
          <div className="GBrainPanelHead">
            <div>
              <h2>Brain</h2>
              <p>People, projects, and collections wired from your Library.</p>
            </div>
            <div className="GBrainActions">
              <button onClick={handleRefresh} disabled={refreshing || loadingWorkspaces}>
                {refreshing ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          {loadingWorkspaces ? (
            <EmptyState title="Loading brain" body="Reading the local Library index." />
          ) : (
            <div className="GBrainBrainGrid">
              {renderWorkspaceSection('People', people, onOpenWorkspace)}
              {renderWorkspaceSection('Projects', projects, onOpenWorkspace)}
              {renderWorkspaceSection('Collections', collections, onOpenWorkspace)}
            </div>
          )}
        </main>
      )}
    </div>
  )
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="GBrainStat">
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="GBrainEmpty">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  )
}

function renderWorkspaceSection(
  title: string,
  items: Workspace[],
  onOpenWorkspace: (workspace: Workspace) => void,
) {
  return (
    <section className="GBrainBrainSection">
      <div className="GBrainSectionTitle">
        <span>{title}</span>
        <small>{items.length}</small>
      </div>
      {items.length === 0 ? (
        <div className="GBrainMiniEmpty">Nothing here yet.</div>
      ) : (
        <div className="GBrainWorkspaceList">
          {items.map(workspace => {
            const tags = topTags(workspace)
            return (
              <button
                key={workspace.uuid}
                className="GBrainWorkspace"
                onClick={() => onOpenWorkspace(workspace)}
              >
                <span className="GBrainWorkspaceIcon">{workspace.icon || workspace.name.slice(0, 1)}</span>
                <span>
                  <strong>{workspace.name}</strong>
                  <small>
                    {(workspace.documents ?? []).length} docs
                    {tags.length > 0 ? ` · ${tags.join(', ')}` : ''}
                  </small>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

function toFeedSignal(item: FeedItem, key: string): FeedSignal {
  const title = item.getTitle?.() || item.title || 'Untitled signal'
  const automationName = item.automation?.name
  const hasMeetingNotes = item.threads?.some(thread => thread.threadType === ThreadType.MEETING_NOTES)
  const kind: FeedSignal['kind'] = automationName
    ? automationName === 'Email Autopilot' ? 'email' : 'automation'
    : hasMeetingNotes
      ? 'note'
      : item.calendarEvent
        ? 'meeting'
        : 'memory'
  const attendees = item.calendarEvent?.participants
    ?.map(participant => participant.name || participant.email)
    .filter(Boolean)
    .slice(0, 4)
    .join(', ')
  const subtitle = automationName || attendees || item.threads?.[0]?.title || key
  const status = item.isLoading ? 'Working' : item.run?.executionDate ? 'Complete' : 'Ready'
  return { item, key, title, subtitle, kind, timestamp: item.timestamp, status }
}

function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const abs = Math.abs(diff)
  if (abs < 60_000) return 'just now'
  if (abs < 3_600_000) return `${Math.floor(abs / 60_000)}m ${diff < 0 ? 'from now' : 'ago'}`
  if (abs < 86_400_000) return `${Math.floor(abs / 3_600_000)}h ${diff < 0 ? 'from now' : 'ago'}`
  if (abs < 604_800_000) return `${Math.floor(abs / 86_400_000)}d ${diff < 0 ? 'from now' : 'ago'}`
  return KNDateUtils.formatDate(date, 'MMM D')
}

function topTags(workspace: Workspace) {
  const counts = new Map<string, number>()
  for (const doc of workspace.documents ?? []) {
    for (const tag of [...parseTags(doc.autoTags), ...parseTags(doc.tags)]) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag)
}

export default GBrain
