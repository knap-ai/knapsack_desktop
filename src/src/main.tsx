import React from 'react'

import ReactDOM from 'react-dom/client'

import App from './App'

import './main.css'

// DEV ONLY: test helper — call window.testNotification() from the browser console
import { invoke } from '@tauri-apps/api/tauri'
;(window as any).testNotification = (opts?: { title?: string; time?: string; buttonConfigs?: any[] }) => {
  invoke('show_notification_window', {
    eventId: 'test-' + Date.now(),
    title: opts?.title ?? 'Action: Apple Dev account change',
    time: opts?.time ?? 'Apple Developer: Account Holder changed. Team admin role has been reassigned. Verify team access and renew certificates. See invoice thread FYI.',
    buttonConfigs: opts?.buttonConfigs ?? [
      { buttonText: 'View Details', buttonHandler: 'view_details' },
      { buttonText: 'Dismiss', buttonHandler: 'dismiss' },
    ],
  })
}

import * as Sentry from '@sentry/react'
import { BrowserRouter } from 'react-router-dom'

import { RecordingProvider } from 'src/components/organisms/MeetingNotesMode/RecordingContext'

import { ErrorPage } from './pages/error'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

const myFallback = <ErrorPage />

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
      <BrowserRouter>
        <RecordingProvider>
          <App />
        </RecordingProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
