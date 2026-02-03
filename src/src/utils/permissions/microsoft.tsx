import { open } from '@tauri-apps/api/shell'
import { invoke } from '@tauri-apps/api/tauri'

export const openMicrosoftAuthScreen = async (scope: string, scopeKeys: string[]) => {
  const authorizationUrl: string = await invoke('start_oauth', { scope, scopeKeys })
  await open(authorizationUrl)
}
