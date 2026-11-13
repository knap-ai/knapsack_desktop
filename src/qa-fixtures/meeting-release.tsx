import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'src/main.css'
if (import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE !== '1') throw new Error('Synthetic QA requires the isolated server')
const state = { sends: [] as unknown[], removals: [] as number[], chats: [] as string[], failMail: false, failRemoval: false }
;(window as any).releaseQA = state
// Synthetic-only hotkey allows the same open modal to recover from rejection.
// No real provider is imported: all sends still terminate in the fixture IPC above.
window.addEventListener('keydown', event => {
  if (event.altKey && event.shiftKey && event.code === 'KeyF') {
    event.preventDefault()
    state.failMail = !state.failMail
    state.failRemoval = state.failMail
    const status = document.getElementById('synthetic-failure-status')
    if (status) status.textContent = `Synthetic failures: ${state.failMail ? 'on' : 'off'}`
  }
})
;(window as any).__knapsackQaTransport__ = ({ cmd, callback, error }: any) => {
  if (cmd === 'kn_send_composed_email') {
    state.sends.push(cmd)
    queueMicrotask(() => (window as any)[`_${state.failMail ? error : callback}`]?.(state.failMail ? 'Synthetic send rejection' : null))
    return
  }
  queueMicrotask(() => (window as any)[`_${callback}`]?.(null))
}
window.fetch = async () => new Response(JSON.stringify({ success: true, data: [], connections: [] }), { headers: { 'Content-Type': 'application/json' } })
Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => Promise.reject(new Error('Synthetic QA blocks audio')) } })
Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: () => false })
const [{ ChatInputBar }, { default: EmailComposeDrawer }, { ConnectionGrantRemove }, { useSettingsConnectionRemoval }, { buildFollowUpEmailBody }, { groupSettingsGoogleConnections }] = await Promise.all([
  import('src/components/organisms/ClawdChat'), import('src/components/molecules/EmailComposeDrawer'),
  import('src/components/templates/Home/components/SettingsDialog/ConnectionGrantRemove'), import('src/hooks/useSettingsConnectionRemoval'),
  import('src/utils/emails'), import('src/utils/settingsConnections'),
])
const baseGrants = [
  { id: 101, key: 'google_gmail_modify', calendarAccountEmail: 'work@example.test', ownerEmail: 'profile-a@example.test' },
  { id: 102, key: 'google_gmail_modify', calendarAccountEmail: 'WORK@example.test', ownerEmail: 'profile-b@example.test' },
  { id: 103, key: 'google_calendar_read', calendarAccountEmail: 'work@example.test', ownerEmail: 'profile-a@example.test' },
] as any[]
function App() {
  const [tab, setTab] = useState('Composer'), [width, setWidth] = useState(760), [busy, setBusy] = useState(false), [review, setReview] = useState(true)
  const [grants, setGrants] = useState(baseGrants), [showEmail, setShowEmail] = useState(true)
  const remove = useSettingsConnectionRemoval({
    deleteConnection: async id => { state.removals.push(id); if (state.failRemoval) throw new Error('Synthetic removal failure') },
    onRemoved: row => setGrants(all => all.filter(item => item.id !== row.id)), refreshApp: async () => {}, refreshSettings: async () => {},
  })
  return <main style={{ padding: 12, color: '#222' }}>
    <output id="synthetic-failure-status" aria-live="polite">Synthetic failures: off (Option+Shift+F toggles while a modal is open)</output>
    <nav>{['Composer', 'Connections', 'Email'].map(name => <button key={name} onClick={() => { setTab(name); setShowEmail(true) }}>{name}</button>)}
      {[560, 760, 1200].map(value => <button key={value} onClick={() => setWidth(value)}>{value}px</button>)}
      <button onClick={() => { state.failRemoval = !state.failRemoval; state.failMail = !state.failMail }}>Toggle synthetic failures</button>
    </nav>
    <div data-testid="release-fixture" style={{ position: 'relative', width, maxWidth: '100%', height: 560, border: '1px solid #ccc', marginTop: 12 }}>
      {tab === 'Composer' && <>
        <button onClick={() => setBusy(value => !value)}>Toggle busy</button><button onClick={() => setReview(value => !value)}>Toggle review</button>
        <section aria-label="Meeting chat fixture" className="notetaker-note__chat-overlay" style={{ height: 460 }}>
          {review && <section aria-label="Proposed edit fixture" style={{ padding: 12 }}>A synthetic review with enough text to occupy a row.<p>Apply and Cancel remain separate actions.</p></section>}
          <div className="ClawdChatRoot ClawdChatRoot--compact"><header className="ClawdChatHeader">Scout · Meeting chat</header>
            <div className="ClawdChatContent"><div className="ClawdChatMain">
              <div className="ClawdChatBody">{Array.from({ length: 30 }, (_, i) => <p key={i}>Synthetic message {i + 1} with enough context to scroll.</p>)}</div>
              <ChatInputBar busy={busy} providerReady hasQueuedMessage={false} isRecording={false} isStartingRecording={false} isTranscribing={false} voiceEnabled={false} attachedFiles={[]}
                onSend={text => state.chats.push(text)} onQueue={text => state.chats.push(text)} onFileSelect={() => {}} onRemoveFile={() => {}} onStartRecording={() => {}} onStopRecording={() => {}} onStopGeneration={() => setBusy(false)} />
            </div></div>
          </div>
        </section>
      </>}
      {tab === 'Connections' && <section aria-label="Connected accounts fixture" style={{ padding: 12, height: '100%', overflow: 'auto' }}>
        {groupSettingsGoogleConnections(Object.fromEntries(grants.map(row => [row.id, row])), '').map(account => <section key={account.accountEmail}><h2>{account.accountEmail}</h2>
          {account.services.map(({ service, grants: rows }) => <section key={service}><h3>{service}</h3>{rows.map(row => <div key={row.id} data-grant-id={row.id}>Profile: {row.ownerEmail}<ConnectionGrantRemove connection={row} service={service} busy={remove.removingId !== null} onRemove={remove.remove} /></div>)}</section>)}
        </section>)}{remove.error && <p role="alert">{remove.error}</p>}
      </section>}
      {tab === 'Email' && showEmail && <EmailComposeDrawer draft={{ to: 'sam@example.test', subject: 'Next steps: Synthetic pilot review', body: buildFollowUpEmailBody('## Summary\nWe discussed pilot feedback and API readiness.\n## Action Items\n- You — Share the pilot brief — Due: Not specified\n- Jo — Review API readiness by Friday', 'Pilot review', 'Alex', 'Sam') }}
        userEmail="primary@example.test" senders={[{ id: 'gmail|work|profile-a', provider: 'gmail', accountEmail: 'work@example.test', ownerEmail: 'profile-a@example.test', requiresSelection: true }]} onDismiss={() => setShowEmail(false)} />}
    </div>
  </main>
}
createRoot(document.getElementById('root')!).render(<App />)
