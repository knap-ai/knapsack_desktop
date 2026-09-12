import type { Workspace, WorkspaceDocument } from 'src/api/workspaces'

export interface RankedBrainDocument {
  workspace: Workspace
  document: WorkspaceDocument
  score: number
  excerpt: string
}

const INTENT_TERMS: Array<{ match: RegExp; terms: string[] }> = [
  {
    match: /promis|commit|owe|follow.?up|action|next step|said i would/i,
    terms: ['i will', "i'll", 'we will', "we'll", 'promise', 'commit', 'follow up', 'next step'],
  },
  {
    match: /decid|decision|agreed/i,
    terms: ['decided', 'decision', 'agreed', 'approved', 'aligned'],
  },
]

const cleanText = (value: string) =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()

const queryTerms = (query: string) => {
  const direct = query
    .toLowerCase()
    .split(/[^a-z0-9@.]+/)
    .filter(
      term => term.length > 2 && !['what', 'have', 'with', 'from', 'that', 'this'].includes(term),
    )
  const inferred = INTENT_TERMS.filter(intent => intent.match.test(query)).flatMap(
    intent => intent.terms,
  )
  return [...new Set([...direct, ...inferred])]
}

const relevantExcerpt = (content: string, terms: string[], limit = 2200) => {
  const text = cleanText(content)
  if (text.length <= limit) return text
  const lower = text.toLowerCase()
  const positions = terms.map(term => lower.indexOf(term)).filter(position => position >= 0)
  const focus = positions.length > 0 ? Math.min(...positions) : 0
  const start = Math.max(0, focus - Math.floor(limit * 0.25))
  const excerpt = text.slice(start, start + limit)
  return `${start > 0 ? '…' : ''}${excerpt}${start + limit < text.length ? '…' : ''}`
}

export const rankBrainDocuments = (
  workspaces: Workspace[],
  query: string,
  limit = 12,
): RankedBrainDocument[] => {
  const terms = queryTerms(query)
  const nowSeconds = Date.now() / 1000

  return workspaces
    .flatMap(workspace => (workspace.documents ?? []).map(document => ({ workspace, document })))
    .map(row => {
      const title =
        `${row.workspace.name} ${row.workspace.description ?? ''} ${row.document.documentName}`.toLowerCase()
      const content = cleanText(row.document.contentHash ?? row.document.summary ?? '')
      const searchable = `${title} ${content}`.toLowerCase()
      const termScore = terms.reduce((total, term) => {
        if (!searchable.includes(term)) return total
        return total + (title.includes(term) ? 5 : 2)
      }, 0)
      const bodyValue = row.document.contentHash?.trim() ? 2 : row.document.summary?.trim() ? 1 : 0
      const ageDays = row.document.createdAt
        ? Math.max(0, (nowSeconds - row.document.createdAt) / 86_400)
        : 365
      const recency = Math.max(0, 2 - ageDays / 30)
      return {
        ...row,
        score: termScore + bodyValue + recency,
        excerpt: relevantExcerpt(row.document.contentHash ?? row.document.summary ?? '', terms),
      }
    })
    .filter(row => row.score > 0 && row.excerpt)
    .sort((a, b) => b.score - a.score || (b.document.createdAt ?? 0) - (a.document.createdAt ?? 0))
    .slice(0, limit)
}

export const formatBrainDocumentContext = ({ workspace, document, excerpt }: RankedBrainDocument) =>
  [
    `Source: ${document.documentName || workspace.name}`,
    `Collection: ${workspace.name}`,
    `Kind: ${document.sourceType ?? 'library'}`,
    document.sourceId ? `Source record: ${document.sourceId}` : '',
    document.createdAt ? `Observed: ${new Date(document.createdAt * 1000).toISOString()}` : '',
    `Content excerpt: ${excerpt}`,
  ]
    .filter(Boolean)
    .join('\n')
