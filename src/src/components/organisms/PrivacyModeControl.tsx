import { useEffect, useState } from 'react'

import PrivacySetup from 'src/pages/onboarding/PrivacySetup'
import { initializePrivacyMode, privacyModeStatus, setPrivacyMode } from 'src/utils/privacyMode'

import { Dialog } from 'src/components/molecules/Dialog'

import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

import LocalSpeechSetup from './LocalSpeechSetup'

const privacyResources = [
  { id: 'zdr', label: 'ZDR explained (OpenAgreements)', url: 'https://openagreements.org/practice-guides/ai-vendors/zdr-cross-provider-comparison' },
  { id: 'on-device', label: 'On-device AI (Ollama FAQ)', url: 'https://docs.ollama.com/faq' },
  { id: 'inference', label: 'Cloud and on-device inference (Google Cloud guide)', url: 'https://cloud.google.com/discover/what-is-ai-inference' },
] as const
type PrivacyResource = typeof privacyResources[number]

function PrivacyResourceLink({ resource }: { resource: PrivacyResource }) {
  const [attempted, setAttempted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  return (
    <li>
      <a className="underline" href={resource.url} onClick={event => {
        event.preventDefault()
        setAttempted(true)
        setFeedback('')
        void invoke('open_privacy_reference', { reference: resource.id }).catch(() =>
          setFeedback('Could not open the reference. Copy the link to open it yourself.'),
        )
      }}>
        {resource.label} ↗
      </a>
      {attempted && <button type="button" className="ml-2 underline" onClick={async () => {
        try {
          await navigator.clipboard.writeText(resource.url)
          setShowUrl(false)
          setFeedback('Link copied.')
        } catch {
          setShowUrl(true)
          setFeedback('Could not copy automatically. Select and copy the link below.')
        }
      }}>Copy link</button>}
      {feedback && <p role="status" className="text-xs">{feedback}</p>}
      {showUrl && <input className="w-full text-xs" aria-label={`${resource.label} URL`} readOnly
        value={resource.url} onFocus={event => event.currentTarget.select()} />}
    </li>
  )
}

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
    initializePrivacyMode().catch(() => setError('Could not read AI privacy settings. Your current policy was not changed.')).finally(() => setBusy(false))
    return () => {
      window.removeEventListener('privacy-mode-changed', update)
      window.removeEventListener('open-privacy-setup', openSetup)
    }
  }, [])
  const save = async (enabled: boolean, nextMode: Mode = mode, confirmGroq?: boolean) => {
    setBusy(true)
    setError('')
    try {
      await setPrivacyMode(enabled, nextMode, confirmGroq)
    } catch (e) {
      setError(String(e))
      throw e
    } finally {
      setBusy(false)
    }
  }
  const selectCloudProvider = async (provider: 'trustedrouter' | 'groq' | 'knapsack') => {
    setBusy(true)
    setError('')
    try {
      const connections = await fetch(
        'http://127.0.0.1:8897/api/clawd/service/api-key-status',
      ).then(response => {
        if (!response.ok) throw new Error('Could not check connected providers. Try again.')
        return response.json()
      })
      if (
        !connections[
          provider === 'knapsack'
            ? 'has_knapsack'
            : provider === 'groq'
              ? 'has_groq_key'
              : 'has_trustedrouter_key'
        ]
      ) {
        throw new Error('Connect this provider in AI Provider settings first, then return here.')
      }
      await setPrivacyMode(
        true,
        'zero-retention',
        provider === 'groq' ? groqConfirmed : undefined,
        false,
      )
      const response = await fetch('http://127.0.0.1:8897/api/clawd/service/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          key: '',
          model:
            provider === 'knapsack'
              ? 'auto'
              : provider === 'trustedrouter'
                ? 'trustedrouter/zdr'
                : 'openai/gpt-oss-120b',
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error('Connect this provider in AI Provider settings first, then return here.')
      localStorage.setItem('moltbot_active_provider', provider)
      window.dispatchEvent(new Event('provider-settings-changed'))
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => setSetup(true)}
        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.enabled ? 'bg-white text-zinc-700 border-zinc-200' : 'bg-white text-zinc-700'}`}
      >
        Privacy: {status.enabled ? (mode === 'local-only' ? 'On-device' : 'ZDR') : 'Off'}
      </button>
      <Dialog
        isOpen={setup}
        onClose={() => setSetup(false)}
        dismissable
        className="flex items-center justify-center w-[calc(100vw-2rem)] max-w-2xl"
      >
        <div className="bg-white rounded-xl max-h-[85vh] overflow-y-auto w-full max-w-2xl p-5 sm:p-6 space-y-4">
          <header className="pr-8 space-y-1">
            <h1 className="text-2xl font-semibold font-Lora">AI privacy</h1>
            <p className="text-sm text-zinc-600">Choose where AI runs.</p>
          </header>
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            role="group"
            aria-label="Privacy level"
          >
            <button
              disabled={busy}
              aria-pressed={status.enabled && mode === 'zero-retention'}
              className="rounded-lg border px-3 py-3 text-left aria-pressed:bg-green-50 aria-pressed:border-green-600"
              onClick={() => void save(true, 'zero-retention').catch(() => undefined)}
            >
              <span className="block font-semibold">ZDR</span>
              <span className="block text-xs text-zinc-600">Zero data retention</span>
            </button>
            <button
              disabled={busy}
              aria-pressed={status.enabled && mode === 'local-only'}
              className="rounded-lg border px-3 py-3 text-left aria-pressed:bg-green-50 aria-pressed:border-green-600"
              onClick={() => void save(true, 'local-only').catch(() => undefined)}
            >
              <span className="block font-semibold">On-device</span>
              <span className="block text-xs text-zinc-600">Local AI with Ollama</span>
            </button>
            <button
              disabled={busy}
              aria-pressed={!status.enabled}
              className="rounded-lg border px-3 py-3 text-left aria-pressed:bg-green-50 aria-pressed:border-green-600"
              onClick={() => void save(false).catch(() => undefined)}
            >
              <span className="block font-semibold">Off</span>
              <span className="block text-xs text-zinc-600">Your provider’s standard policy</span>
            </button>
          </div>
          {status.enabled && mode === 'zero-retention' && (
            <section aria-label="ZDR setup" className="rounded-lg border p-4 space-y-3">
              <p className="text-sm text-zinc-600">
                Prompts and responses go to an eligible cloud provider without being retained under
                its policy. Usage and billing records may remain. AI stays blocked if no eligible
                route is available.
              </p>
              <button
                className="rounded border px-3 py-2"
                disabled={busy}
                onClick={() => void selectCloudProvider('knapsack')}
              >
                Use Knapsack
              </button>
              <p className="text-xs text-zinc-500">Uses your connected Knapsack account.</p>
              <details className="text-sm space-y-3">
                <summary className="cursor-pointer font-semibold">Other cloud providers</summary>
                <div className="pt-3 space-y-2">
                  <button
                    disabled={busy}
                    className="rounded border px-3 py-2"
                    onClick={() => void selectCloudProvider('trustedrouter')}
                  >
                    Use TrustedRouter ZDR
                  </button>
                  <p className="text-xs text-zinc-600">Uses its dedicated ZDR route, not Auto.</p>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <h2 className="font-semibold">Groq</h2>
                  <button
                    className="underline text-sm"
                    onClick={() =>
                      void open('https://console.groq.com/docs/your-data').catch(e =>
                        setError(String(e)),
                      )
                    }
                  >
                    Enable ZDR in Groq
                  </button>
                  <label className="flex gap-2 text-sm items-start">
                    <input
                      type="checkbox"
                      checked={groqConfirmed}
                      onChange={e => setGroqConfirmed(e.target.checked)}
                    />
                    I enabled ZDR for AI and speech in the Groq organization for this connected key.
                  </label>
                  <p className="text-xs text-zinc-600">
                    This is your confirmation; Knapsack cannot verify it. Confirm again after
                    changing keys. Groq hosted-tool models are excluded.
                  </p>
                  <button
                    disabled={busy || !groqConfirmed}
                    className="rounded border px-3 py-2"
                    onClick={() => void selectCloudProvider('groq')}
                  >
                    Confirm and use Groq
                  </button>
                </div>
              </details>
            </section>
          )}
          {status.enabled && mode === 'local-only' && (
            <section className="space-y-3" aria-label="On-device setup">
              <p className="text-sm text-zinc-600">
                AI runs on this computer with Ollama. Analytics are off.
              </p>
              <details className="rounded-lg border p-3">
                <summary className="cursor-pointer font-semibold text-sm">
                  Set up on-device AI and speech
                </summary>
                <div className="pt-3 space-y-4">
                  <LocalSpeechSetup />
                  <PrivacySetup
                    embedded
                    onNext={() => setSetup(false)}
                    onLearnMore={() => undefined}
                  />
                </div>
              </details>
            </section>
          )}
          {!status.enabled && (
            <p className="text-sm text-zinc-600">
              Your chosen provider’s standard data policy applies. Analytics may be enabled.
            </p>
          )}
          <p className="text-xs text-zinc-600">
            Backups are separate: if enabled in Settings, they may upload and retain encrypted data.
          </p>
          <details className="text-sm text-zinc-600 space-y-2">
            <summary className="cursor-pointer font-semibold">Privacy details</summary>
            <p>
              These modes control AI processing and analytics, not connected services. Email,
              calendar, Slack and websites still contact their services when used. Changing AI
              privacy does not change backup settings.
            </p>
            <p>
              Analytics are off in ZDR and On-device modes. Restart Knapsack to stop native crash
              reporting for this session.
            </p>
            <p>
              Background media analysis, generated audio and remote memory embeddings wait for an
              approved private route. ZDR voice input can use your confirmed Groq connection; spoken
              replies use this device’s voice. On-device speech requires the downloaded speech
              model.
            </p>
          </details>
          <nav aria-label="Privacy resources" className="text-sm space-y-2">
            <p className="font-semibold">Learn more</p>
            <p className="text-xs text-zinc-600">
              In ZDR, the model provider processes your request in the cloud but doesn’t keep the
              inputs or outputs afterward. Usage records and notes you save are separate.
            </p>
            <ul className="space-y-1">
              {privacyResources.map(resource => <PrivacyResourceLink key={resource.id} resource={resource} />)}
            </ul>
            <p className="text-xs text-zinc-500">
              General references, not guarantees for your Knapsack route. Each provider’s policy and
              eligible features apply.
            </p>
          </nav>
          {status.provider_selection && (
            <p role="status" className="text-sm text-zinc-600">
              AI provider:{' '}
              {status.provider_selection === 'ollama'
                ? 'On-device Ollama'
                : status.provider_selection}
              .
            </p>
          )}
          {status.provider_selection === null && (
            <p role="status" className="text-sm text-zinc-600">
              Privacy saved. Set up an eligible AI provider to continue.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button className="rounded border px-4 py-2" onClick={() => setSetup(false)}>
            Done
          </button>
        </div>
      </Dialog>
    </>
  )
}
