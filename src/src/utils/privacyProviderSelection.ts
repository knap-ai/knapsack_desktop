import { invoke } from '@tauri-apps/api/tauri'
import { isLocalModelTag } from './localModelSetup'

const BASE = 'http://127.0.0.1:8897'
async function api(path: string, body?: object) {
  const response = await fetch(BASE + path, { ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30_000) })
  const result = await response.json()
  if (!response.ok || result.success === false) throw new Error(result.message || 'Could not select an AI provider.')
  return result
}
export async function selectPrivacyProvider(inference: string): Promise<string | null> {
  const candidates = await invoke<Array<{ provider: string; model: string }>>('privacy_provider_candidates')
  // Selecting a stricter policy takes effect first. Failure to find a route
  // leaves inference blocked; it must never roll back the privacy choice.
  if (inference === 'local-only' && !candidates.some(c => c.provider === 'ollama')) {
    try {
      const catalog = await api('/api/knapsack/ollama/models?cloud=false')
      for (const item of catalog.models || []) {
        if (isLocalModelTag(item.name)) candidates.push({ provider: 'ollama', model: item.name })
      }
    } catch { /* Setup UI offers installation/download when Ollama is absent. */ }
  }
  for (const candidate of candidates) {
    try {
      if (candidate.provider === 'ollama') {
        await api('/api/knapsack/ollama/configure', { enabled: true, cloud: false, model: candidate.model, base_url: 'http://127.0.0.1:11434' })
      }
      await api('/api/clawd/service/set-api-key', { ...candidate, key: '' })
      localStorage.setItem('moltbot_active_provider', candidate.provider)
      window.dispatchEvent(new Event('provider-settings-changed'))
      return candidate.provider
    } catch { /* A stale or unavailable candidate must not hide another eligible route. */ }
  }
  return null
}
