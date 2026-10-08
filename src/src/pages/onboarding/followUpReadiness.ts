import { invoke } from '@tauri-apps/api/tauri'
import { initializePrivacyMode } from 'src/utils/privacyMode'
import { localAiReady } from 'src/utils/localModelSetup'

export async function requireFollowUpAiReady(): Promise<void> {
  const policy = await initializePrivacyMode()
  if (policy.inference === 'local-only' && !await localAiReady()) {
    throw new Error('Local AI is not ready. Configure Ollama and an installed model, then retry. No cloud fallback is used.')
  }
  // Execute a no-source probe through the same selected-provider path as extraction.
  // Native policy rejects cloud inference in local-only mode; no fallback chain is used.
  await invoke('kn_follow_through_ready')
}
