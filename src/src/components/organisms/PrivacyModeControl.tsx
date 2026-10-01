import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/api/shell'
import { Dialog } from 'src/components/molecules/Dialog'
import PrivacySetup from 'src/pages/onboarding/PrivacySetup'
import { initializePrivacyMode, privacyModeStatus, setPrivacyMode } from 'src/utils/privacyMode'

type Mode = 'local-only' | 'zero-retention'
export default function PrivacyModeControl() {
  const [status, setStatus] = useState(privacyModeStatus())
  const [busy, setBusy] = useState(true)
  const [setup, setSetup] = useState(false)
  const [error, setError] = useState('')
  const [groqConfirmed, setGroqConfirmed] = useState(false)
  const mode = status.selected_mode || 'local-only'
  useEffect(() => {
    const update = () => setStatus(privacyModeStatus())
    window.addEventListener('privacy-mode-changed', update)
    initializePrivacyMode().finally(() => setBusy(false))
    return () => window.removeEventListener('privacy-mode-changed', update)
  }, [])
  const save = async (enabled: boolean, nextMode: Mode = mode, confirmGroq?: boolean) => {
    setBusy(true); setError('')
    try { await setPrivacyMode(enabled, nextMode, confirmGroq) }
    catch (e) { setError(String(e)); throw e }
    finally { setBusy(false) }
  }
  const useCloud = async (provider: 'trustedrouter' | 'groq') => {
    setBusy(true); setError('')
    try {
      await setPrivacyMode(true, 'zero-retention', provider === 'groq' ? groqConfirmed : undefined)
      const response = await fetch('http://127.0.0.1:8897/api/clawd/service/set-api-key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: '', ...(provider === 'trustedrouter' ? { model: 'trustedrouter/zdr' } : {}) }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error('Connect this provider in AI Provider settings first, then return here.')
      localStorage.setItem('moltbot_active_provider', provider)
      window.dispatchEvent(new Event('provider-settings-changed'))
    } catch (e) { setError(String(e)) }
    finally { setBusy(false) }
  }
  return <>
    <button aria-haspopup="dialog" disabled={busy} onClick={() => setSetup(true)}
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${status.enabled ? 'bg-green-50 text-green-800 border-green-600' : 'bg-white text-zinc-700'}`}>
      Privacy: {status.enabled ? mode === 'local-only' ? 'On-device' : 'Zero retention' : 'Off'}
    </button>
    <Dialog isOpen={setup} onClose={() => setSetup(false)} dismissable className="flex items-center justify-center">
      <div className="bg-white rounded-xl max-h-[85vh] overflow-y-auto w-full max-w-2xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold font-Lora">Choose your privacy level</h1>
        <p>Private cloud AI sends your request to an eligible provider for processing without retaining prompts and responses under that route’s policy. Usage and billing metadata may remain.</p>
        <p className="text-sm text-zinc-600">Want inference to stay on your computer? Choose on-device AI with Ollama. Connected email, calendar, Slack and websites still contact their services when you use them. Privacy Mode disables analytics; restart Knapsack to stop native crash reporting for this session.</p>
        <div className="flex flex-wrap gap-3" role="group" aria-label="Privacy level">
          <button disabled={busy} aria-pressed={status.enabled && mode === 'zero-retention'} className="rounded border px-3 py-2" onClick={() => void save(true, 'zero-retention').catch(() => {})}>Zero-retention cloud</button>
          <button disabled={busy} aria-pressed={status.enabled && mode === 'local-only'} className="rounded border px-3 py-2" onClick={() => void save(true, 'local-only').catch(() => {})}>On-device only</button>
          <button disabled={busy} aria-pressed={!status.enabled} className="rounded border px-3 py-2" onClick={() => void save(false).catch(() => {})}>Off</button>
        </div>
        {status.enabled && mode === 'zero-retention' && <div className="space-y-3 rounded border p-4">
          <p>Fallbacks must meet the same privacy level. If no eligible route is available, the request stops.</p>
          <p className="text-sm">Background media analysis, generated audio and remote memory embeddings are unavailable in Privacy Mode until they have an approved route. Desktop voice transcription can use your confirmed Groq connection; spoken replies use your device’s voice.</p>
          <button disabled={busy} className="rounded border px-3 py-2" onClick={() => void useCloud('trustedrouter')}>Use connected TrustedRouter ZDR</button>
          <p className="text-sm">TrustedRouter’s dedicated ZDR route enforces the retention requirement. Its general Auto route is not used in this mode.</p>
          <button className="underline text-sm" onClick={() => void open('https://console.groq.com/docs/your-data').catch(e => setError(String(e)))}>Enable ZDR in Groq Data Controls</button>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={groqConfirmed} onChange={e => setGroqConfirmed(e.target.checked)} />I enabled ZDR for inference and speech in the Groq organization associated with my connected key.</label>
          <button disabled={busy || !groqConfirmed} className="rounded border px-3 py-2" onClick={() => void useCloud('groq')}>Confirm and use connected Groq</button>
          <p className="text-sm">This is your confirmation, not an automatic account verification. Changing the API key requires confirmation again. Groq hosted-tool models are excluded.</p>
          <p className="text-sm">Knapsack cloud: zero-retention eligibility has not yet been verified. It is unavailable in this mode.</p>
        </div>}
        {status.enabled && mode === 'local-only' && <PrivacySetup embedded onNext={() => setSetup(false)} onLearnMore={() => {}} />}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="rounded border px-4 py-2" onClick={() => setSetup(false)}>Done</button>
      </div>
    </Dialog>
  </>
}
