import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_KNAPSACK_ANTHROPIC_MODEL } from 'src/utils/anthropicModels'
import { DEFAULT_OPENAI_MODEL } from 'src/utils/openaiModels'
import { initializePrivacyMode } from 'src/utils/privacyMode'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { DEFAULT_TRUSTEDROUTER_MODEL } from 'src/utils/providerModels'

import { open } from '@tauri-apps/api/shell'

const BASE = 'http://127.0.0.1:8897'
type Provider = 'knapsack' | 'openai' | 'trustedrouter'
async function localRequest(path: string, parent: AbortSignal | undefined, init?: RequestInit) {
  const abort = new AbortController()
  const cancel = () => abort.abort()
  if (parent?.aborted) abort.abort()
  parent?.addEventListener('abort', cancel, { once: true })
  const timeout = window.setTimeout(cancel, 15000)
  try {
    const response = await fetch(BASE + path, { ...init, signal: abort.signal })
    const data = await response.json()
    if (!response.ok || data.success !== true)
      throw new Error('Provider setup was not confirmed. Check Settings before retrying.')
    return data
  } finally {
    clearTimeout(timeout)
    parent?.removeEventListener('abort', cancel)
  }
}

const MODELS = {
  knapsack: DEFAULT_KNAPSACK_ANTHROPIC_MODEL,
  openai: DEFAULT_OPENAI_MODEL,
  trustedrouter: DEFAULT_TRUSTEDROUTER_MODEL,
}

export default function InferenceSetup({
  onContinue,
  onBack,
}: {
  onContinue: () => void
  onBack: () => void
}) {
  const [privacy, setPrivacy] = useState<'loading' | 'local-only' | 'zero-retention' | 'normal'>(
    'loading',
  )
  const [provider, setProvider] = useState<Provider>('knapsack')
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [accountEmail, setAccountEmail] = useState('')
  const studioIdentity = useRef('')
  const model = useRef<string>(MODELS.knapsack)
  const [hasSavedKey, setHasSavedKey] = useState(false)
  const [busy, setBusy] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const active = useRef(true)
  const lock = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    const request = generation.current
    const status = await localRequest(
      '/api/clawd/service/api-key-status',
      controller.current?.signal,
    )
    if (!active.current || request !== generation.current) return false
    if (status.success !== true) throw new Error('Provider status unavailable.')
    const email =
      typeof status.knapsack_email === 'string' ? status.knapsack_email.trim().toLowerCase() : ''
    const verified =
      status.has_knapsack === true && status.knapsack_auth_expired !== true && !!email
    studioIdentity.current = verified ? email : ''
    setAccountEmail(studioIdentity.current)
    setAuthenticated(verified)
    const savedModel =
      provider === 'knapsack'
        ? status.knapsack_model
        : status.active_provider === provider
          ? status.model
          : undefined
    model.current =
      typeof savedModel === 'string' && savedModel.trim() ? savedModel : MODELS[provider]
    setHasSavedKey(
      provider === 'openai'
        ? status.has_openai_key === true
        : provider === 'trustedrouter'
          ? status.has_trustedrouter_key === true
          : false,
    )
    return verified
  }, [provider])
  useEffect(() => {
    active.current = true
    generation.current++
    setAuthenticated(false)
    setHasSavedKey(false)
    controller.current = new AbortController()
    initializePrivacyMode()
      .then(status => {
        if (active.current)
          setPrivacy(status.enabled ? (status.selected_mode ?? 'local-only') : 'normal')
      })
      .catch(() => {
        if (active.current) setError('Could not read privacy settings. Cloud setup is unavailable.')
      })
    refresh().catch(() => {
      if (active.current) setError('Could not read provider status. Try again.')
    })
    const invalidate = () => {
      active.current = false
      generation.current++
      controller.current?.abort()
      setKey('')
      setAuthenticated(false)
      setPrivacy('loading')
      setError('Account changed. Go back and reopen AI setup.')
    }
    window.addEventListener(PROFILE_CHANGED_EVENT, invalidate)
    return () => {
      active.current = false
      controller.current?.abort()
      window.removeEventListener(PROFILE_CHANGED_EVENT, invalidate)
    }
  }, [provider, refresh])
  // An existing system-browser sign-in updates status. There is no embedded webview or email-to-token shortcut.
  useEffect(() => {
    if (!connecting) return
    const timer = window.setInterval(() => {
      refresh().catch(() => undefined)
    }, 2500)
    const timeout = window.setTimeout(() => {
      setConnecting(false)
      setError('Sign-in timed out. You can try again or set up AI later.')
    }, 300000)
    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [connecting, refresh])
  useEffect(() => {
    if (authenticated) setConnecting(false)
  }, [authenticated])
  const connect = async () => {
    if (lock.current || connecting) return
    setError('')
    setConnecting(true)
    const base = import.meta.env.VITE_KN_STUDIO_SERVER || 'https://studio.knapsack.ai'
    try {
      const url = new URL('/desktop-connect', base)
      if (url.protocol !== 'https:') throw new Error('Secure Studio sign-in is unavailable.')
      url.searchParams.set('callback', BASE + '/api/auth/knapsack-callback')
      await open(url.toString())
    } catch {
      if (active.current) {
        setConnecting(false)
        setError('Could not open secure sign-in. Try again.')
      }
    }
  }
  const save = async () => {
    if (lock.current || privacy === 'loading' || privacy === 'local-only') return
    if (provider === 'knapsack' && !authenticated) return
    if (provider !== 'knapsack' && !key.trim() && !hasSavedKey) return
    const expectedStudioIdentity = studioIdentity.current
    lock.current = true
    setBusy(true)
    setError('')
    try {
      // Re-read privacy immediately before selection. Never change it as a side effect of connecting a provider.
      const policy = await initializePrivacyMode()
      if (
        policy.enabled &&
        (policy.selected_mode === 'local-only' ||
          (policy.selected_mode === 'zero-retention' && provider === 'openai'))
      )
        throw new Error('This provider is unavailable under your current privacy setting.')
      if (!active.current) return
      const verified = await refresh()
      if (!active.current) return
      if (
        provider === 'knapsack' &&
        (!verified || !expectedStudioIdentity || studioIdentity.current !== expectedStudioIdentity)
      )
        throw new Error('Sign in to Knapsack before choosing this provider.')
      if (provider !== 'knapsack' && key.trim()) {
        const validation = await localRequest(
          '/api/clawd/service/validate-api-key',
          controller.current?.signal,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, key: key.trim() }),
          },
        )
        if (validation.valid !== true)
          throw new Error('The provider could not validate this key. Check it and try again.')
        if (!active.current) return
      }
      await localRequest('/api/clawd/service/set-api-key', controller.current?.signal, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.current?.signal,
        body: JSON.stringify({
          provider,
          key: provider === 'knapsack' ? '' : key.trim(),
          model: model.current,
        }),
      })
      if (active.current) {
        setKey('')
        setSaved(true)
        window.dispatchEvent(new Event('provider-settings-changed'))
      }
    } catch (e) {
      if (active.current)
        setError(e instanceof Error ? e.message : 'Provider setup was not confirmed.')
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  return (
    <section
      className="w-full max-w-xl mx-auto h-full min-h-0 p-6 flex flex-col"
      aria-label="Set up AI"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <h1 className="text-3xl font-Lora mb-3">Connect your AI</h1>
        <p className="mb-4">
          Choose how Knapsack processes your requests. Connecting email does not sign you into
          Studio. Connecting AI does not enable context sharing.
        </p>
        {privacy === 'loading' ? (
          <p>Checking privacy settings…</p>
        ) : privacy === 'local-only' ? (
          <p>
            Your AI stays on this device. Keep the local model you selected; cloud setup is
            disabled.
          </p>
        ) : (
          <>
            <label className="block">
              AI provider
              <select
                className="block border rounded p-2 my-2"
                value={provider}
                disabled={busy || connecting}
                onChange={event => {
                  setKey('')
                  setSaved(false)
                  setError('')
                  setProvider(event.target.value as Provider)
                }}
              >
                <option value="knapsack">Knapsack</option>
                <option value="trustedrouter">TrustedRouter</option>
                {privacy === 'normal' && <option value="openai">OpenAI</option>}
              </select>
            </label>
            {provider === 'knapsack' ? (
              authenticated ? (
                <p>
                  Studio credentials are connected as {accountEmail}. Choose Use Knapsack to select
                  it for AI.
                </p>
              ) : (
                <div>
                  <p>
                    Sign in securely in your browser. This does not enable context sharing or select
                    a new AI provider.
                  </p>
                  <button
                    type="button"
                    className="rounded border border-ks-warm-grey-300 px-4 py-2 my-2 disabled:opacity-50"
                    disabled={connecting || busy}
                    onClick={() => void connect()}
                  >
                    {connecting ? 'Waiting for sign-in…' : 'Connect Knapsack'}
                  </button>
                  {connecting && (
                    <button
                      type="button"
                      className="ml-3 underline"
                      onClick={() => setConnecting(false)}
                    >
                      Cancel waiting
                    </button>
                  )}
                </div>
              )
            ) : (
              <label className="block">
                API key {hasSavedKey && '(leave blank to use the saved key)'}
                <input
                  className="block border rounded p-2 my-2 w-full"
                  type="password"
                  autoComplete="off"
                  value={key}
                  disabled={busy}
                  onChange={event => setKey(event.target.value)}
                />
              </label>
            )}
            <p className="text-sm my-3">
              {privacy === 'zero-retention'
                ? 'Only approved zero-retention inference routes are available. Requests leave this device; provider usage metadata may remain.'
                : 'Requests you submit to this provider leave this device under its data policy.'}{' '}
              Provider credentials are stored on this device and used only with the selected
              provider. Saving a new key checks it with the provider without sending your notes or
              email. More providers are available in Settings.
            </p>
            <button
              type="button"
              className="rounded bg-ks-red-600 text-white px-4 py-2"
              disabled={
                busy ||
                saved ||
                (provider === 'knapsack' ? !authenticated : !key.trim() && !hasSavedKey)
              }
              onClick={() => void save()}
            >
              {busy
                ? 'Connecting…'
                : saved
                  ? 'Provider connected'
                  : provider === 'knapsack'
                    ? 'Use Knapsack'
                    : 'Save and use provider'}
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="my-3">
            {error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 justify-between pt-4 gap-3">
        <button
          type="button"
          className="rounded border px-4 py-2 disabled:opacity-50"
          disabled={busy}
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded px-4 py-2 bg-ks-red-600 text-white disabled:opacity-50"
          disabled={busy}
          onClick={onContinue}
        >
          {saved || privacy === 'local-only' ? 'Continue' : 'Set up later'}
        </button>
      </div>
    </section>
  )
}
