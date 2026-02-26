import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

/**
 * Opens a URL in the default browser, then repositions the browser window
 * to fill the screen space beside the Knapsack app (if the app is in
 * narrow/notification mode). A no-op on non-macOS platforms.
 */
export async function openBesideApp(url: string) {
  await open(url)
  setTimeout(() => {
    invoke('position_browser_beside_app').catch(() => {})
  }, 800)
}
