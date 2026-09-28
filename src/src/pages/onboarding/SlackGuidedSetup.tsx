import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import EmbeddedBrowserSidebar from 'src/components/organisms/EmbeddedBrowserSidebar'
import { SLACK_GUIDED_SETUP_PROMPT, verifySlackSetupEngine } from 'src/utils/slackGuidedSetup'
const ClawdChat = lazy(() => import('src/components/organisms/ClawdChat'))

export default function SlackGuidedSetup({ onClose }: { onClose: () => void }) {
  const [signedIn, setSignedIn] = useState(false)
  const [started, setStarted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [engine, setEngine] = useState<{ provider: string; model: string } | null>(null)
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const verification = useRef<AbortController | null>(null)
  useEffect(() => {
    setVerified(false)
    setStarted(false)
    setSignedIn(false)
    setChecking(false)
    setError('')
    return () => {
      verification.current?.abort()
      verification.current = null
    }
  }, [engine?.provider, engine?.model])
  const verify = async () => {
    if (!engine) return
    const controller = new AbortController()
    verification.current = controller
    const timeout = setTimeout(() => controller.abort(), 45000)
    setChecking(true)
    setVerified(false)
    setSignedIn(false)
    setStarted(false)
    setError('')
    try {
      await verifySlackSetupEngine(engine, controller.signal)
      if (!controller.signal.aborted) setVerified(true)
    } catch (e: any) {
      if (verification.current !== controller) return
      setError(
        e.name === 'AbortError'
          ? 'AI check timed out. Check the selected engine and try again.'
          : e.message || String(e),
      )
    } finally {
      clearTimeout(timeout)
      if (verification.current === controller) setChecking(false)
    }
  }
  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-white flex flex-col p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Guided Slack setup"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-xl font-semibold">Set up Scout on Slack</h2>
          <p className="text-sm text-gray-600">
            First connect and check an AI engine. Then sign into Slack and request setup.
          </p>
        </div>
        <button
          disabled={busy || checking}
          className="border rounded px-3 py-2 disabled:opacity-50"
          onClick={onClose}
        >
          {busy ? 'Stop the task in chat to close' : 'Back to onboarding'}
        </button>
      </div>
      <div className="border-b py-3 space-y-2">
        <p className="font-semibold">1. Get AI ready</p>
        <p className="text-sm">
          {engine
            ? `Selected: ${engine.provider} / ${engine.model}`
            : 'Connect Knapsack AI in the panel below, or choose your own provider. Privacy Mode requires a downloaded local Ollama model.'}
        </p>
        <button
          className="border rounded px-3 py-2 disabled:opacity-50"
          disabled={!engine || checking || busy}
          onClick={() => void verify()}
        >
          {checking
            ? 'Checking AI…'
            : verified
              ? 'AI verified — check again'
              : 'Verify AI connection'}
        </button>
        {error && (
          <p role="alert" className="text-red-700 text-sm">
            {error}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-center py-3">
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={signedIn}
            disabled={!verified || started}
            onChange={(e) => setSignedIn(e.target.checked)}
          />
          I am signed into api.slack.com/apps in the browser shown here.
        </label>
        <button
          disabled={!verified || !signedIn || started}
          className="bg-[#913631] text-white rounded px-4 py-2 disabled:opacity-50"
          onClick={() => setStarted(true)}
        >
          {started ? 'Setup requested' : 'Set up Slack for me'}
        </button>
        <p className="text-sm text-gray-600">
          You may need workspace admin approval. No messages will be sent during setup.
        </p>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-auto">
        <div className="min-w-0 min-h-[420px] h-full">
          <Suspense fallback={<p>Loading setup assistant…</p>}>
            <ClawdChat
              compact
              chatId="onboarding-slack"
              sessionId="onboarding-slack"
              title="Slack setup"
              browserProfile="openclaw"
              setupTask={started ? SLACK_GUIDED_SETUP_PROMPT : undefined}
              onBusyChange={setBusy}
              onInferenceReadyChange={setEngine}
            />
          </Suspense>
        </div>
        <div className="min-w-0 min-h-[420px] h-full">
          {verified ? (
            <EmbeddedBrowserSidebar
              requestedUrl="https://api.slack.com/apps"
              browserProfile="openclaw"
              onClose={() => {
                if (!busy) onClose()
              }}
            />
          ) : (
            <div className="border rounded-xl p-6 text-gray-600">
              2. Sign into Slack
              <br />
              The shared browser opens here after your AI connection passes its check.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
