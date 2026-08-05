import React from 'react'

import ReactDOM from 'react-dom/client'

import OverlayPanel from './components/organisms/OverlayPanel'

import { getCurrent } from '@tauri-apps/api/window'
import { installDesktopApiAuth } from './utils/desktopApiAuth'
import './notification.css'

installDesktopApiAuth()

const currentWindow = getCurrent()
if (currentWindow.label === 'overlay') {
  const titlebar = document.querySelector('.titlebar')
  if (titlebar) {
    ;(titlebar as HTMLElement).style.display = 'none'
  }
}

ReactDOM.createRoot(document.getElementById('overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <OverlayPanel />
  </React.StrictMode>,
)
