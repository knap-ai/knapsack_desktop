/** Custom events for chat <-> developer panel communication. */

/** Dispatched when chat detects a build intent -- tells the dev panel to populate. */
export function dispatchDevPopulate(description: string) {
  window.dispatchEvent(
    new CustomEvent('clawd-dev-populate', { detail: description }),
  )
}

/** Dispatched to open the developer panel from chat. */
export function dispatchOpenDevPanel() {
  window.dispatchEvent(new CustomEvent('clawd-open-dev-panel'))
}
