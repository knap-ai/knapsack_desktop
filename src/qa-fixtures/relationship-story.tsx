// Synthetic-only presentation fixture. No account, database or provider requests.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import RelationshipTimeline from 'src/components/organisms/WorkspaceView/RelationshipTimeline'
import type { WorkspaceDocument, RelationshipSource } from 'src/api/workspaces'
import 'src/main.css'
const titles = ['First introduction', 'Partnership kickoff', 'Weekly check-in', 'Proposal review', 'Agreement signed', 'Launch planning', 'Project launch']
const documents = titles.map((title, index) => ({ id: index, documentName: title, sourceType: index % 2 ? 'email' : 'calendar', sourceId: String(index), summary: ['An introduction to the team and the opportunity ahead.', 'The team aligned on the initial scope and next steps.', 'A brief progress update and the next conversation.', 'Reviewed the proposal, open questions and options.', 'Saved evidence of the agreement and its next steps.', 'Planning for launch readiness across the team.', 'A new chapter for the partnership.'][index], tags: null, autoTags: null })) as WorkspaceDocument[]
const sources = documents.map((doc, index) => ({ documentId: index, sourceId: String(index), kind: doc.sourceType, occurredAt: Date.UTC(2026, index + 3, 12) / 1000, dateKind: 'occurred', url: null, account: 'synthetic@example.test', available: true })) as RelationshipSource[]
function Fixture() {
  const [width, setWidth] = useState(1100), [project, setProject] = useState(false)
  return <main style={{ padding: 24, background: '#faf9f7', minHeight: '100vh' }}>
    <nav style={{ display: 'flex', gap: 16, marginBottom: 24 }}>{[1100, 650, 360].map(size => <button key={size} onClick={() => setWidth(size)}>{size}px</button>)}<button onClick={() => setProject(value => !value)}>Switch person / project</button></nav>
    <section style={{ width, maxWidth: '100%', margin: '0 auto' }}><h1 style={{ fontSize: 28, fontWeight: 600 }}>{project ? 'North Star partnership' : 'Alex Rivera'}</h1><p style={{ color: '#82756f', marginBottom: 30 }}>{project ? 'Project story' : 'alex@example.test'}</p>
    <RelationshipTimeline documents={documents} evidence={{ displayName: 'Alex Rivera', sources, truncated: false }} loading={false} error={false} onRetry={() => {}} onOpenCalendar={async () => {}} /></section>
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
