import { selectPrivacyProvider } from './privacyProviderSelection'
import * as Sentry from '@sentry/react'

import { invoke } from '@tauri-apps/api/tauri'

import KNAnalytics from './KNAnalytics'

export type PrivacyModeStatus = {
  enabled: boolean
  policy_version: number
  inference: 'local-only' | 'zero-retention' | 'normal'
  selected_mode?: 'local-only' | 'zero-retention'
  groq_zdr_confirmed?: boolean
  telemetry: 'disabled' | 'normal'
  provider_selection?: string | null
  manifest_sha256: string
}

let status: PrivacyModeStatus = {
  enabled: true,
  policy_version: 1,
  inference: 'local-only',
  telemetry: 'disabled',
  manifest_sha256: '',
}

export const privacyModeStatus = () => status
export const telemetryAllowed = () => !status.enabled

export async function initializePrivacyMode(): Promise<PrivacyModeStatus> {
  try {
    status = await invoke<PrivacyModeStatus>('get_privacy_mode_status')
  } catch {
    // Fail closed until the native policy can be read.
  }
  KNAnalytics.setPrivacyMode(status.enabled)
  if (status.enabled) Sentry.close()
  window.dispatchEvent(new Event('privacy-mode-changed'))
  return status
}

export async function setPrivacyMode(enabled: boolean, mode?: 'local-only' | 'zero-retention', confirmGroqZdr?: boolean, autoSelect = true): Promise<PrivacyModeStatus> {
  status = await invoke<PrivacyModeStatus>('set_privacy_mode', { enabled, mode, confirmGroqZdr })
  KNAnalytics.setPrivacyMode(status.enabled)
  if (status.enabled) Sentry.close()
  window.dispatchEvent(new Event('privacy-mode-changed'))
  if (autoSelect) status = { ...status, provider_selection: await selectPrivacyProvider(status.inference) }
  window.dispatchEvent(new Event('privacy-mode-changed'))
  return status
}
