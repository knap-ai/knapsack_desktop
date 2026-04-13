/** Custom events for chat <-> developer panel communication. */

import { sendRemoteCommand } from 'src/api/dev_remote'

/** Dispatched when chat detects a build intent -- tells the dev panel to populate. */
export function dispatchDevPopulate(description: string) {
  window.dispatchEvent(
    new CustomEvent('clawd-dev-populate', { detail: description }),
  )

  // Also persist server-side so channels can see the state
  sendRemoteCommand({
    action: 'set_project',
    channel: 'webchat',
    description,
  }).catch(() => {
    // Best-effort — don't block the UI
  })
}

/** Dispatched to open the developer panel from chat. */
export function dispatchOpenDevPanel() {
  window.dispatchEvent(new CustomEvent('clawd-open-dev-panel'))
}

/** Enable developer mode both locally and server-side. */
export function enableDevModeRemote(description?: string) {
  sendRemoteCommand({
    action: 'enable',
    channel: 'webchat',
    description,
  }).catch(() => {})
}
