import { afterEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ invoke: vi.fn() }))
vi.mock('@tauri-apps/api/tauri', () => ({ invoke: mocks.invoke }))
import { selectPrivacyProvider } from './privacyProviderSelection'
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks() })
it('synthetic UI never discovers, fetches or auto-configures a provider', async () => {
  vi.stubEnv('VITE_KNAPSACK_LOCAL_QA_SAFE', '1')
  const fetch = vi.fn()
  vi.stubGlobal('fetch', fetch)
  for (const mode of ['local-only', 'zero-retention', 'normal']) {
    expect(await selectPrivacyProvider(mode)).toBeNull()
  }
  expect(mocks.invoke).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})
