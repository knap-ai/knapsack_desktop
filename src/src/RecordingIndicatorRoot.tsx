import React from 'react'

import ReactDOM from 'react-dom/client'

import RecordingIndicator from './components/molecules/RecordingIndicator'

import { getCurrent } from '@tauri-apps/api/window'
import { installDesktopApiAuth } from './utils/desktopApiAuth'

installDesktopApiAuth()

const currentWindow = getCurrent()
if (currentWindow.label === 'recording-indicator') {
  const titlebar = document.querySelector('.titlebar')
  if (titlebar) {
    ;(titlebar as HTMLElement).style.display = 'none'
  }
}

ReactDOM.createRoot(document.getElementById('recording-indicator-root') as HTMLElement).render(
  <React.StrictMode>
    <RecordingIndicator />
  </React.StrictMode>,
)
