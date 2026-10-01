import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/shell'
import { initializePrivacyMode, setPrivacyMode } from 'src/utils/privacyMode'
import {
  isLocalModelTag,
  localAiReady,
  LocalHardware,
  readPullProgress,
  recommendLocalModel,
} from 'src/utils/localModelSetup'

const BASE = 'http://127.0.0.1:8897'
async function api(path: string, body?: object) {
  const response = await fetch(
    BASE + path,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      : undefined,
  )
  const data = await response.json()
  if (!response.ok || data.success === false)
    throw new Error(data.message || 'Could not reach the local service.')
  return data
}

export default function PrivacySetup({
  onNext,
  onLearnMore,
  embedded = false,
}: {
  onNext: () => void
  onLearnMore: () => void
  embedded?: boolean
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [hardware, setHardware] = useState<LocalHardware | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [model, setModel] = useState('')
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const refresh = async () => {
    const status = await api('/api/knapsack/ollama/status?cloud=false')
    setRunning(status.running)
    if (status.running) {
      const result = await api('/api/knapsack/ollama/models?cloud=false')
      setModels(result.models.map((item: { name: string }) => item.name).filter(isLocalModelTag))
    } else setModels([])
    setReady(await localAiReady())
  }
  useEffect(() => {
    initializePrivacyMode().then((status) => setEnabled(status.enabled))
    invoke<LocalHardware>('get_local_model_hardware')
      .then(setHardware)
      .catch(() => {})
  }, [])
  useEffect(() => {
    if (enabled) refresh().catch((e) => setError(String(e.message || e)))
  }, [enabled])
  const toggle = async (value: boolean) => {
    setBusy(true)
    setError('')
    try {
      await setPrivacyMode(value, 'local-only')
      setEnabled(value)
      setReady(false)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }
  const selected = model.trim() || recommendLocalModel(hardware)
  const configure = async () => {
    setBusy(true)
    setError('')
    setReady(false)
    try {
      await api('/api/knapsack/ollama/configure', {
        enabled: true,
        cloud: false,
        model: selected,
        base_url: 'http://127.0.0.1:11434',
      })
      localStorage.setItem('moltbot_active_provider', 'ollama')
      localStorage.setItem('moltbot_ollama_model', selected)
      window.dispatchEvent(new Event('provider-settings-changed'))
      setReady(true)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }
  const pull = async () => {
    setBusy(true)
    setError('')
    setReady(false)
    try {
      await readPullProgress(
        await fetch(BASE + '/api/knapsack/ollama/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: selected }),
        }),
        setProgress,
      )
      await refresh()
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="w-full max-w-2xl px-6 py-8 space-y-5 text-zinc-900">
      {!embedded && <>
      <h1 className="text-3xl font-semibold font-Lora">Choose how your AI runs</h1>
      <p>
        Synced email and calendar data are stored on this device. Cloud AI can receive the context
        needed to answer your requests. On-device Privacy Mode keeps AI inference local and disables analytics
        and crash reporting.
      </p>
      <label className="flex items-center gap-3 rounded-xl border p-4 font-semibold">
        <input
          type="checkbox"
          checked={enabled === true}
          disabled={busy || enabled === null}
          onChange={(event) => void toggle(event.target.checked)}
        />
        Privacy Mode — use AI on this device
      </label>
      <p className="text-sm text-zinc-600">
        Connected services still need internet access. Websites and services you choose to use
        receive those requests.
      </p>
      </>}
      {enabled && (
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <h2 className="font-semibold">Set up local AI</h2>
          <p className="text-sm">
            1. Install and open Ollama. 2. Download a model. 3. Select it for Knapsack.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              className="underline"
              onClick={() =>
                void open('https://ollama.com/download').catch((e) => setError(String(e)))
              }
            >
              Download Ollama
            </button>
            <button
              className="underline"
              disabled={busy}
              onClick={() => void refresh().catch((e) => setError(e.message))}
            >
              Check again
            </button>
            <button
              className="underline"
              onClick={() =>
                void open('https://ollama.com/library?sort=newest').catch((e) =>
                  setError(String(e)),
                )
              }
            >
              Browse latest models
            </button>
          </div>
          <p className="text-sm">
            {hardware
              ? `${Math.round(hardware.memory_bytes / 2 ** 30)} GB RAM · ${hardware.cpu} · ${hardware.architecture}. `
              : ''}
            Suggested starting point: {recommendLocalModel(hardware)}. This is a conservative memory
            estimate, not a speed guarantee; longer conversations need more memory.
          </p>
          <p className="text-sm">
            {running ? 'Ollama is running.' : 'Open Ollama, then check again.'} You can enter any
            local model tag from the current Ollama library. Download again to update that tag.
          </p>
          <label className="block text-sm">
            Local model
            <input
              className="block w-full rounded border p-2 mt-1"
              list="onboarding-local-models"
              value={model}
              placeholder={recommendLocalModel(hardware)}
              disabled={busy}
              onChange={(e) => {
                setModel(e.target.value)
                setReady(false)
              }}
            />
            <datalist id="onboarding-local-models">
              {models.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded border px-3 py-2 disabled:opacity-50"
              disabled={busy || !running || !isLocalModelTag(selected)}
              onClick={() => void pull()}
            >
              Download / update model
            </button>
            <button
              className="rounded border px-3 py-2 disabled:opacity-50"
              disabled={busy || !models.includes(selected) || !isLocalModelTag(selected)}
              onClick={() => void configure()}
            >
              Use this model
            </button>
          </div>
          <p role="status" className="text-sm">
            {ready ? 'Local AI is configured. Privacy Mode is on.' : progress}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {!embedded && <div className="flex flex-wrap gap-4 items-center">
        <button
          className="rounded-lg bg-[#913631] text-white px-5 py-3 disabled:opacity-50"
          disabled={busy || enabled === null}
          onClick={onNext}
        >
          {enabled && !ready ? 'Continue — finish local setup later' : 'Continue'}
        </button>
        <button className="underline text-sm" onClick={onLearnMore}>
          How privacy works
        </button>
      </div>}
      {enabled && !ready && (
        <p className="text-sm text-zinc-600">
          Privacy Mode is already on. AI tasks will wait until a local model is ready; they will not
          fall back to cloud AI.
        </p>
      )}
    </section>
  )
}
