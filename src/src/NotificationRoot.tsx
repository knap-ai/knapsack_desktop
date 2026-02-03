import React from 'react'

import ReactDOM from 'react-dom/client'

import NotificationWindow from './components/molecules/MeetingNotification'

import { getCurrent } from '@tauri-apps/api/window'
import './notification.css'

const currentWindow = getCurrent()
if (currentWindow.label === 'notification') {
  const titlebar = document.querySelector('.titlebar')
  if (titlebar) {
    ;(titlebar as HTMLElement).style.display = 'none'
  }
}
ReactDOM.createRoot(document.getElementById('notification-root') as HTMLElement).render(
  <React.StrictMode>
    <NotificationWindow />
  </React.StrictMode>,
)
