import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

const BACKEND = 'http://127.0.0.1:8897'

/**
 * Lets the opted-in embedded browser handle URLs in place. When it is disabled
 * or unavailable, keep the existing managed-Chrome/system fallback.
 */
export async function openBesideApp(url: string) {
  const embeddedEvent = new CustomEvent('knapsack:open-browser', {
    detail: { url },
    cancelable: true,
  })
  const handledInApp = !window.dispatchEvent(embeddedEvent)
  if (handledInApp) return

  try {
    const res = await fetch(
      `${BACKEND}/api/clawd/browser/open?${new URLSearchParams({ url }).toString()}`,
    )
    if (!res.ok) {
      await open(url)
    }
  } catch {
    await open(url)
  }
  setTimeout(() => {
    invoke('position_browser_beside_app').catch(() => undefined)
  }, 800)
}
