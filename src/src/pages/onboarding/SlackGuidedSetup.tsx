import { lazy, Suspense, useState } from 'react'
import { createPortal } from 'react-dom'
import EmbeddedBrowserSidebar from 'src/components/organisms/EmbeddedBrowserSidebar'
import { SLACK_GUIDED_SETUP_PROMPT } from 'src/utils/slackGuidedSetup'
const ClawdChat = lazy(() => import('src/components/organisms/ClawdChat'))

export default function SlackGuidedSetup({ onClose }: { onClose: () => void }) {
  const [signedIn, setSignedIn] = useState(false)
  const [started, setStarted] = useState(false)
  const [busy, setBusy] = useState(false)
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
            Sign in on the right. Knapsack uses your selected AI engine; connect one in the chat
            panel if needed.
          </p>
        </div>
        <button
          disabled={busy}
          className="border rounded px-3 py-2 disabled:opacity-50"
          onClick={onClose}
        >
          {busy ? 'Stop the task in chat to close' : 'Back to onboarding'}
        </button>
      </div>
      <div className="flex flex-wrap gap-3 items-center py-3">
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={signedIn}
            disabled={started}
            onChange={(e) => setSignedIn(e.target.checked)}
          />
          I am signed into api.slack.com/apps in the browser shown here.
        </label>
        <button
          disabled={!signedIn || started}
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
            />
          </Suspense>
        </div>
        <div className="min-w-0 min-h-[420px] h-full">
          <EmbeddedBrowserSidebar
            requestedUrl="https://api.slack.com/apps"
            browserProfile="openclaw"
            onClose={() => {
              if (!busy) onClose()
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
