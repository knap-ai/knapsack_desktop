import {
  parseTags,
  type RelationshipSource,
  type Workspace,
  type WorkspaceDocument,
} from 'src/api/workspaces'

export function workspaceDisplayName(
  workspace: Pick<Workspace, 'name' | 'entityType'>,
  resolved?: string | null,
): string {
  for (const value of [workspace.name, resolved]) {
    const name = value
      ?.trim()
      .replace(/^(.+?)\s*<[^>]+@[^>]+>$/, '$1')
      .trim()
    if (name && !name.includes('@') && !/^Unnamed contact$/i.test(name)) return name
  }
  return workspace.entityType === 'person' ? 'Unnamed contact' : 'Untitled project'
}

export interface RelationshipMilestone {
  id: string
  title: string
  summary: string | null
  date: number | null
  dateKind: RelationshipSource['dateKind']
  significance: 'major' | 'notable' | 'touchpoint'
  sources: { document: WorkspaceDocument; evidence: RelationshipSource }[]
}

/** Suggested visual weight, never a claim that a proposed deal actually closed. */
function significance(doc: WorkspaceDocument): RelationshipMilestone['significance'] {
  const text = [doc.documentName, ...parseTags(doc.tags), ...parseTags(doc.autoTags)].join(' ')
  if (
    /\b(kick[ -]?off|signed|launch|milestone|agreement|partnership|approved|contract|decision|handover)\b/i.test(
      text,
    )
  )
    return 'major'
  if (/\b(review|proposal|planning|introduction|roadmap|workshop|budget|qbr)\b/i.test(text))
    return 'notable'
  return 'touchpoint'
}

export function buildRelationshipTimeline(
  documents: WorkspaceDocument[],
  evidence: RelationshipSource[],
): RelationshipMilestone[] {
  const byId = new Map(evidence.map(source => [source.documentId, source]))
  const seen = new Set<string>()
  const groups = new Map<string, RelationshipMilestone>()
  const weight = { touchpoint: 0, notable: 1, major: 2 }
  for (const doc of documents) {
    if (doc.id == null) continue
    const source = byId.get(doc.id)
    if (!source) continue
    const identity = `${doc.sourceType || 'manual'}:${doc.sourceId || doc.id}:${source.account || ''}`
    if (seen.has(identity)) continue
    seen.add(identity)
    const date = source.occurredAt && Number.isFinite(source.occurredAt) ? source.occurredAt : null
    const title = doc.documentName.trim() || 'Untitled saved item'
    const topic = title
      .replace(/^(?:(?:re|fw|fwd):\s*)+/i, '')
      .trim()
      .toLowerCase()
    // Only exact subjects in the same local calendar week cluster. No fuzzy
    // entity inference, cross-week recurring-meeting merge, or invented narrative.
    const week = date ? new Date(date * 1000) : null
    if (week) {
      week.setHours(0, 0, 0, 0)
      week.setDate(week.getDate() - ((week.getDay() + 6) % 7))
    }
    // Strong provider-thread identity, partitioned by account and month.
    const mailThread = source.kind === 'email' && source.url?.includes('mail.google.com/')
      ? source.url.match(/#all\/([^/?#]+)$/)?.[1] : null
    const month = date ? new Date(date * 1000).toISOString().slice(0, 7) : ''
    const key = mailThread && source.account && month
      ? `mail:${source.account}:${mailThread}:${month}`
      : date && topic.split(/\s+/).length >= 2 ? `${source.account || ''}:${week?.getTime()}:${topic}` : `document:${doc.id}`
    const rank = significance(doc)
    const current = groups.get(key)
    if (current) {
      current.sources.push({ document: doc, evidence: source })
      if (date && (!current.date || date < current.date)) current.date = date
      if (weight[rank] > weight[current.significance]) current.significance = rank
      if (!current.summary && doc.summary) current.summary = doc.summary
    } else
      groups.set(key, {
        id: key,
        title: title.replace(/^(?:(?:re|fw|fwd):\s*)+/i, ''),
        summary: doc.summary,
        date,
        dateKind: source.dateKind,
        significance: rank,
        sources: [{ document: doc, evidence: source }],
      })
  }
  for (const chapter of groups.values()) {
    const summaries = [...chapter.sources]
      .sort((a, b) => (a.evidence.occurredAt || 0) - (b.evidence.occurredAt || 0))
      .map(item => item.evidence.meetingSummary?.trim() || item.document.summary?.trim()).filter((value): value is string => !!value)
    const distinct = [...new Set(summaries)]
    // Source-grounded extractive prose; never infer a deal outcome.
    const selected: string[] = []
    for (const summary of distinct) {
      if (selected.length === 3) break
      if ([...selected, summary].join(' ').length <= 1000) selected.push(summary)
    }
    chapter.summary = selected.length ? selected.join(' ') : null
  }
  return [...groups.values()].sort(
    (a, b) => (a.date ?? Infinity) - (b.date ?? Infinity) || a.id.localeCompare(b.id),
  )
}

export function safeTimelineDestination(
  value: string | null,
  documentType?: string | null,
): { kind: 'web' | 'file'; value: string } | null {
  if (!value || Array.from(value).some(char => char.charCodeAt(0) < 32)) return null
  try {
    const url = new URL(value)
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      /^(?:localhost|127\.|0\.|\[?::1\]?)/i.test(url.hostname)
    )
      return null
    return { kind: 'web', value: url.href }
  } catch {
    /* Local documents open only on an explicit click. */
  }
  if (
    (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)) &&
    (documentType === 'folder' ||
      /\.(?:pdf|docx?|xlsx?|pptx?|txt|md|csv|rtf|png|jpe?g)$/i.test(value))
  )
    return { kind: 'file', value }
  return null
}
