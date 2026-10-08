import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/api/shell'
import { Dialog } from 'src/components/molecules/Dialog'
import LocalSpeechSetup from './LocalSpeechSetup'
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
    const openSetup = () => setSetup(true)
    window.addEventListener('open-privacy-setup', openSetup)
    initializePrivacyMode().finally(() => setBusy(false))
    return () => { window.removeEventListener('privacy-mode-changed', update); window.removeEventListener('open-privacy-setup', openSetup) }
  }, [])
  const save = async (enabled: boolean, nextMode: Mode = mode, confirmGroq?: boolean) => {
    setBusy(true); setError('')
    try { await setPrivacyMode(enabled, nextMode, confirmGroq) }
    catch (e) { setError(String(e)); throw e }
    finally { setBusy(false) }
  }
  const useCloud = async (provider: 'trustedrouter' | 'groq' | 'knapsack') => {
    setBusy(true); setError('')
    try {
      const connections = await fetch('http://127.0.0.1:8897/api/clawd/service/api-key-status').then(response => {
        if (!response.ok) throw new Error('Could not check connected providers. Try again.')
        return response.json()
      })
      if (!connections[provider === 'knapsack' ? 'has_knapsack' : provider === 'groq' ? 'has_groq_key' : 'has_trustedrouter_key']) {
        throw new Error('Connect this provider in AI Provider settings first, then return here.')
      }
      await setPrivacyMode(true, 'zero-retention', provider === 'groq' ? groqConfirmed : undefined, false)
      const response = await fetch('http://127.0.0.1:8897/api/clawd/service/set-api-key', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: '', model: provider === 'knapsack' ? 'auto' : provider === 'trustedrouter' ? 'trustedrouter/zdr' : 'openai/gpt-oss-120b' }),
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
        <h1 className="text-2xl font-semibold font-Lora pr-8">Choose your privacy level</h1>
        <p>Use a zero-retention cloud provider, or keep AI inference on this device with Ollama.</p>
        <p className="text-sm text-zinc-600">These controls cover AI inference and telemetry. Encrypted GBrain account backup is a separate opt-in in Settings: it can upload and retain ciphertext, even with Privacy Mode enabled. Changing privacy levels does not enable or disable backups.</p>
        <div className="flex flex-wrap gap-3" role="group" aria-label="Privacy level">
          <button disabled={busy} aria-pressed={status.enabled && mode === 'zero-retention'} className="rounded border px-3 py-2 aria-pressed:bg-green-50 aria-pressed:border-green-600" onClick={() => void save(true, 'zero-retention').catch(() => {})}>Zero-retention cloud</button>
          <button disabled={busy} aria-pressed={status.enabled && mode === 'local-only'} className="rounded border px-3 py-2 aria-pressed:bg-green-50 aria-pressed:border-green-600" onClick={() => void save(true, 'local-only').catch(() => {})}>On-device only</button>
          <button disabled={busy} aria-pressed={!status.enabled} className="rounded border px-3 py-2 aria-pressed:bg-green-50 aria-pressed:border-green-600" onClick={() => void save(false).catch(() => {})}>Off</button>
        </div>
        {status.enabled && mode === 'zero-retention' && <div className="space-y-3 rounded border p-4">
          <p>Requests leave your device. Eligible routes do not retain prompts and responses under their policy; usage and billing metadata may remain. If no eligible route is available, the request stops.</p>

          <button disabled={busy} className="rounded border px-3 py-2" onClick={() => void useCloud('trustedrouter')}>Use connected TrustedRouter ZDR</button>
          <p className="text-sm">TrustedRouter’s dedicated ZDR route enforces the retention requirement. Its general Auto route is not used in this mode.</p>
          <button className="underline text-sm" onClick={() => void open('https://console.groq.com/docs/your-data').catch(e => setError(String(e)))}>Enable ZDR in Groq Data Controls</button>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={groqConfirmed} onChange={e => setGroqConfirmed(e.target.checked)} />I enabled ZDR for inference and speech in the Groq organization associated with my connected key.</label>
          <button disabled={busy || !groqConfirmed} className="rounded border px-3 py-2" onClick={() => void useCloud('groq')}>Confirm and use Groq GPT-OSS</button>
          <p className="text-sm">This is your confirmation, not an automatic account verification. Changing the API key requires confirmation again. Groq hosted-tool models are excluded.</p>
          <button disabled={busy} className="rounded border px-3 py-2" onClick={() => void useCloud('knapsack')}>Use Knapsack</button>
          <p className="text-sm">Knapsack provides end-to-end zero-retention inference through your signed-in account.</p>
        </div>}
        {status.enabled && mode === 'local-only' && <><LocalSpeechSetup /><PrivacySetup embedded onNext={() => setSetup(false)} onLearnMore={() => {}} /></>}
        <details className="text-sm text-zinc-600 space-y-2">
          <summary className="cursor-pointer font-semibold">What Privacy Mode covers</summary>
          <p>Connected email, calendar, Slack and websites still contact their services when you use them. Privacy Mode disables analytics; restart Knapsack to stop native crash reporting for this session.</p>
          <p>Background media analysis, generated audio and remote memory embeddings stop until they have an approved private route. In zero-retention mode, desktop voice transcription can use your confirmed Groq connection; spoken replies use your device’s voice. On-device voice input and meeting transcription use the downloaded speech model.</p>
        </details>
        {status.provider_selection && <p role="status">AI provider selected: {status.provider_selection === 'ollama' ? 'On-device Ollama' : status.provider_selection}.</p>}
        {status.provider_selection === null && <p role="status">Privacy settings saved. Set up an eligible provider here to start using AI.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="rounded border px-4 py-2" onClick={() => setSetup(false)}>Done</button>
      </div>
    </Dialog>
  </>
}
