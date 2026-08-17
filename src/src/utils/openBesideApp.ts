import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

const BACKEND = 'http://127.0.0.1:8897'

/**
 * Lets the opted-in embedded browser handle URLs in place. When it is disabled
 * or unavailable, keep the existing managed-Chrome/system fallback.
 */
export async function openBesideApp(url: string, profile = 'openclaw') {
  const isIsolatedAgentProfile = profile.startsWith('agent-')
  const embeddedEvent = new CustomEvent('knapsack:open-browser', {
    detail: { url, profile },
    cancelable: true,
  })
  const handledInApp = !window.dispatchEvent(embeddedEvent)
  if (handledInApp) return

  try {
    const res = await fetch(
      `${BACKEND}/api/clawd/browser/open?${new URLSearchParams({ url, profile }).toString()}`,
    )
    if (!res.ok) {
      if (isIsolatedAgentProfile) {
        throw new Error(`Agent browser profile ${profile} is unavailable`)
      }
      await open(url)
    }
  } catch (error) {
    if (isIsolatedAgentProfile) throw error
    await open(url)
  }
  setTimeout(() => {
    invoke('position_browser_beside_app').catch(() => undefined)
  }, 800)
}
