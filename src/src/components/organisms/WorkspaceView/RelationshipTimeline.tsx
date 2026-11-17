import { useMemo, useState } from 'react'

import type {
  RelationshipEvidence,
  RelationshipSource,
  WorkspaceDocument,
} from 'src/api/workspaces'
import { buildRelationshipTimeline, safeTimelineDestination } from 'src/utils/relationshipTimeline'

import { open as openSource } from '@tauri-apps/api/shell'

import './relationshipTimeline.scss'

export default function RelationshipTimeline({
  documents,
  person = true,
  evidence,
  loading,
  error,
  onRetry,
  onOpenCalendar,
}: {
  person?: boolean
  documents: WorkspaceDocument[]
  evidence: RelationshipEvidence | null
  loading: boolean
  error: boolean
  onRetry: () => void
  onOpenCalendar?: (source: RelationshipSource) => Promise<void>
}) {
  const [highlights, setHighlights] = useState(false)
  const [newest, setNewest] = useState(false)
  const [limit, setLimit] = useState(12)
  const [sourceError, setSourceError] = useState<string | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const milestones = useMemo(
    () => buildRelationshipTimeline(documents, evidence?.sources || []),
    [documents, evidence],
  )
  const filtered = milestones.filter(item => !highlights || item.significance === 'major')
  const sorted = newest
    ? [...filtered.filter(item => item.date != null)]
        .reverse()
        .concat(filtered.filter(item => item.date == null))
    : filtered
  const dates = milestones.flatMap(item => (item.date ? [item.date] : []))
  const date = (value: number) =>
    new Date(value * 1000).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  const sourceLabel = (kind: string) =>
    ({
      email: 'Email',
      calendar: 'Calendar event',
      meeting: 'Meeting notes',
      drive: 'Document',
      local_file: 'Document',
      manual: 'Document',
      chat_output: 'Saved conversation',
    })[kind] || 'Saved source'
  if (loading)
    return (
      <div className="relationship-story__state" role="status">
        Building the timeline from saved sources…
      </div>
    )
  if (error)
    return (
      <div className="relationship-story__state" role="alert">
        <p>
          The timeline could not load its sources. Your documents are still available in Documents.
        </p>
        <button type="button" onClick={onRetry}>
          Retry timeline
        </button>
      </div>
    )
  return (
    <section className="relationship-story" aria-label={person ? 'Relationship timeline' : 'Timeline'}>
      <div className="relationship-story__intro">
        <div>
          <p className="relationship-story__eyebrow">{person ? 'The story so far' : 'Project timeline'}</p>
          <h2>Moments that moved things forward</h2>
          <p>
            {dates.length ? `${date(Math.min(...dates))} — ${date(Math.max(...dates))} · ` : ''}
            {milestones.length} {milestones.length === 1 ? 'moment' : 'moments'} from saved evidence
          </p>
        </div>
        <div className="relationship-story__controls">
          <label>
            <input
              type="checkbox"
              checked={highlights}
              onChange={event => {
                setHighlights(event.target.checked)
                setLimit(12)
              }}
            />{' '}
            Highlights only
          </label>
          <button
            type="button"
            onClick={() => {
              setNewest(value => !value)
              setLimit(12)
            }}
          >
            {newest ? 'Newest first ↓' : 'Oldest first ↑'}
          </button>
        </div>
      </div>
      <p className="relationship-story__caption">
        Larger cards highlight suggested milestones from source titles and tags. Saved summaries are
        context, not verified outcomes. Open the evidence to see the full story.
      </p>
      {evidence?.truncated && (
        <p role="status">
          This view is limited to 2,000 saved sources. Other documents remain in Documents.
        </p>
      )}
      {sourceError && (
        <p role="alert" className="relationship-story__error">
          {sourceError}
        </p>
      )}
      {!sorted.length ? (
        <p className="relationship-story__state">
          {highlights
            ? 'No suggested highlights match these filters. Turn off Highlights only to see every saved moment.'
            : 'No saved sources match these filters yet.'}
        </p>
      ) : (
        <ol className="relationship-story__line">
          {sorted.slice(0, limit).map(item => (
            <li
              key={item.id}
              className={`relationship-story__event relationship-story__event--${item.significance}`}
            >
              <span className="relationship-story__pin" aria-hidden="true" />
              <article className="relationship-story__card">
                <div className="relationship-story__date">
                  {item.date ? (
                    <time dateTime={new Date(item.date * 1000).toISOString()}>
                      {item.dateKind === 'added' ? 'Added · ' : ''}
                      {date(item.date)}
                    </time>
                  ) : (
                    'Date unavailable'
                  )}
                  {item.date && item.date * 1000 > Date.now() ? <span>Upcoming</span> : item.significance === 'major' && <span>Milestone</span>}
                </div>
                <h3>{item.title}</h3>
                {item.summary && <p className="relationship-story__summary">{item.summary}</p>}
                <div
                  className="relationship-story__sources"
                  aria-label={`Sources for ${item.title}`}
                >
                  {item.sources.map(({ document, evidence: source }, index) => {
                    const destination = safeTimelineDestination(source.url, document.documentType)
                    const key = `${source.kind}:${source.documentId}`
                    const label = `${sourceLabel(source.kind)}${item.sources.length > 1 ? ` ${index + 1}` : ''}`
                    const isCalendar =
                      source.kind === 'calendar' && source.available && Boolean(onOpenCalendar)
                    const activate = async () => {
                      if (opening) return
                      setOpening(key)
                      setSourceError(null)
                      try {
                        if (isCalendar && onOpenCalendar) await onOpenCalendar(source)
                        else if (destination) await openSource(destination.value)
                      } catch {
                        setSourceError(
                          'The saved source could not be opened. Your timeline has not changed. Try again from its source link.',
                        )
                      } finally {
                        setOpening(null)
                      }
                    }
                    const title = [document.documentName, source.account]
                      .filter(Boolean)
                      .join(' · ')
                    return destination?.kind === 'web' ? (
                      <a
                        key={key}
                        href={destination.value}
                        title={title}
                        aria-busy={opening === key}
                        onClick={event => {
                          event.preventDefault()
                          void activate()
                        }}
                      >
                        {label} ↗
                      </a>
                    ) : isCalendar || destination ? (
                      <button
                        type="button"
                        key={key}
                        title={title}
                        disabled={opening !== null}
                        onClick={() => void activate()}
                      >
                        {opening === key ? 'Opening…' : `${label} ↗`}
                      </button>
                    ) : (
                      <span
                        key={key}
                        className="relationship-story__unavailable"
                        title="The original source is unavailable; its saved metadata remains here."
                      >
                        {label} · unavailable
                      </span>
                    )
                  })}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      {sorted.length > limit && (
        <button
          type="button"
          className="relationship-story__more"
          onClick={() => setLimit(value => value + 12)}
        >
          Continue the story · {sorted.length - limit} more
        </button>
      )}
    </section>
  )
}
