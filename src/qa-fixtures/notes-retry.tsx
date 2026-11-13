// Synthetic layout/keyboard fixture. No backend, native capture or provider calls.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import NotesGenerationRetry from 'src/components/organisms/MeetingNotesMode/NotesGenerationRetry'
import 'src/main.css'
function Fixture() {
  const [width, setWidth] = useState(900)
  const [attempts, setAttempts] = useState(0)
  return <main style={{ padding: 20, color: '#302D2C', background: '#FAFAFA' }}>
    <h1>Synthetic note-generation recovery</h1>
    <div>{[900, 560, 320].map(value => <button key={value} style={{ margin: 8 }} onClick={() => setWidth(value)}>{value}px</button>)}</div>
    <div aria-label="Recovery fixture" style={{ width, maxWidth: '100%' }}>
      <NotesGenerationRetry onRetry={() => setAttempts(value => value + 1)} />
      <output aria-live="polite">Synthetic retry activations: {attempts}</output>
    </div>
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
