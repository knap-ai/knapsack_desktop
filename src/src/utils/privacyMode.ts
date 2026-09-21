import * as Sentry from '@sentry/react'

import { invoke } from '@tauri-apps/api/tauri'

import KNAnalytics from './KNAnalytics'

export type PrivacyModeStatus = {
  enabled: boolean
  policy_version: number
  inference: 'local-only' | 'normal'
  telemetry: 'disabled' | 'normal'
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
  return status
}

export async function setPrivacyMode(enabled: boolean): Promise<PrivacyModeStatus> {
  status = await invoke<PrivacyModeStatus>('set_privacy_mode', { enabled })
  KNAnalytics.setPrivacyMode(status.enabled)
  if (status.enabled) Sentry.close()
  return status
}
