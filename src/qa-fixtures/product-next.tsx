// Synthetic production-component fixture. No native/account/provider/send access.
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import 'src/main.css'
let mockPrivacy: 'normal' | 'local-only' | 'zero-retention' = 'normal'
const ipc = ({ callback, cmd }: { callback: number; cmd: string }) => {
  const value = cmd === 'get_privacy_mode_status' ? { enabled: mockPrivacy !== 'normal', selected_mode: mockPrivacy === 'normal' ? 'local-only' : mockPrivacy, telemetry_disabled: mockPrivacy !== 'normal' } : 0
  queueMicrotask(() => (window as any)[`_${callback}`](value))
}
;(window as any).__knapsackQaTransport__ = ipc
;(window as any).__TAURI_IPC__ = ipc
window.fetch = async () => new Response(JSON.stringify({ success: true, has_knapsack: false, data: [] }), { headers: { 'Content-Type': 'application/json' } })
const { initializePrivacyMode } = await import('src/utils/privacyMode')
const { Header } = await import('src/components/organisms/Header')
const { default: Privacy } = await import('src/components/organisms/PrivacyModeControl')
const { default: Drawer } = await import('src/components/molecules/EmailNotificationDrawer')
const { default: Inference } = await import('src/pages/onboarding/InferenceSetup')
const { KNLocalStorage } = await import('src/utils/KNLocalStorage')
await KNLocalStorage.setItem('KN_PROFILE', { uuid: 'synthetic', email: 'synthetic@example.invalid' })
const email = { draftedReply: 'Synthetic saved draft. Never send.', message: { recipients: ['synthetic@example.invalid'], cc: [], receivedDate: new Date().toISOString(), emailUid: 'synthetic', accountEmail: 'synthetic@example.invalid', sender: 'Example Person', subject: 'Synthetic planning request', body: 'Synthetic body' }, classification: { classification: 'IMPORTANT_NEEDS_RESPONSE', summary: ['A representative longer summary. '.repeat(35)], actionRequired: 'Decide whether to express interest, request more information or make an introduction to qualified candidates in your network' } }
const feed = { classifiedEmails: { IMPORTANT_NEEDS_RESPONSE: [email] }, emailAutopilotStatus: { status: 'complete' }, classificationActions: {}, updateClassificationActions: () => {}, takeEmailAction: () => {} } as any
function Fixture() {
  const [popup, setPopup] = useState(false), [inference, setInference] = useState(false)
  return <main className="bg-white h-screen flex flex-col">
    <Header centeredComponent={<Privacy />} leftComponent={<button className="rounded border px-3 py-1">Synthetic recording controls</button>} rightComponent={<button className="rounded border p-2" aria-label="Settings">⚙</button>} />
    <div className="p-4 flex gap-4 flex-wrap">{(['normal','local-only','zero-retention'] as const).map(mode => <button key={mode} onClick={() => { mockPrivacy = mode; void initializePrivacyMode() }}>{mode}</button>)}<button onClick={() => setPopup(true)}>Open synthetic popup</button><button onClick={() => setInference(value => !value)}>Toggle AI setup</button></div>
    {inference && <Inference onContinue={() => setInference(false)} onBack={() => setInference(false)} />}
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}><Drawer feed={feed} userEmail="synthetic@example.invalid" userName="Synthetic" onGoToEmail={() => {}} forceOpen={popup} onForceOpenHandled={() => setPopup(false)} /></div>
  </main>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
