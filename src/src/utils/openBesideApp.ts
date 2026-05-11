import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

const BACKEND = 'http://127.0.0.1:8897'

/**
 * Opens a URL in the gateway-managed openclaw browser profile, then repositions
 * the browser window beside the Knapsack app. Falls back to the system default
 * browser only if the backend is completely unreachable.
 */
export async function openBesideApp(url: string) {
  try {
    const res = await fetch(
      `${BACKEND}/api/clawd/browser/open?${new URLSearchParams({ url }).toString()}`,
    )
    if (!res.ok) {
      await open(url)
    }
  } catch (_e) {
    await open(url)
  }
  setTimeout(() => {
    invoke('position_browser_beside_app').catch(() => {})
  }, 800)
}
