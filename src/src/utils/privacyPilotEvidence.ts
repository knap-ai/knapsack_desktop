export const PRIVACY_PILOT_RECEIPT_PREFIX = 'ks_privacy_pilot_receipt:'

export type PrivacyPilotConnectedDataSource =
  | 'local_file_attachment'
  | 'native_google_email_calendar'

export type PrivacyPilotEvidenceInput = {
  trackingId: string
  experimentId: string
  landingVariant: string
  role: string
  receivedAt: number
  experimentWeek: number
  inferenceSurface: 'agent_chat' | 'direct_chat'
  privacyModeEnabled: boolean
  gclid?: string
  attrId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  connectedDataSources?: PrivacyPilotConnectedDataSource[]
  now?: number
}

export type PrivacyPilotReceipt = {
  schema_version: 1
  experiment_id: string
  landing_variant: string
  role: string
  attribution: {
    tracking_id: string
    gclid?: string
    attr_id?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    received_at: string
  }
  privacy_mode: true
  first_successful_inference_at: string
  last_successful_inference_at: string
  inference_surfaces: Array<'agent_chat' | 'direct_chat'>
  connected_data_usage: Array<{
    source: PrivacyPilotConnectedDataSource
    first_used_at: string
  }>
  active_weeks: number[]
}

function storageKey(trackingId: string) {
  return `${PRIVACY_PILOT_RECEIPT_PREFIX}${trackingId}`
}

export function readPrivacyPilotReceipt(trackingId: string): PrivacyPilotReceipt | null {
  try {
    const raw = localStorage.getItem(storageKey(trackingId))
    return raw ? (JSON.parse(raw) as PrivacyPilotReceipt) : null
  } catch {
    return null
  }
}

export function recordPrivacyPilotEvidence(
  input: PrivacyPilotEvidenceInput,
): PrivacyPilotReceipt | null {
  if (!input.privacyModeEnabled || !input.trackingId || input.experimentWeek < 0) return null

  const now = new Date(input.now ?? Date.now()).toISOString()
  const existing = readPrivacyPilotReceipt(input.trackingId)
  const receipt: PrivacyPilotReceipt = existing ?? {
    schema_version: 1,
    experiment_id: input.experimentId,
    landing_variant: input.landingVariant,
    role: input.role,
    attribution: {
      tracking_id: input.trackingId,
      ...(input.gclid ? { gclid: input.gclid } : {}),
      ...(input.attrId ? { attr_id: input.attrId } : {}),
      ...(input.utmSource ? { utm_source: input.utmSource } : {}),
      ...(input.utmMedium ? { utm_medium: input.utmMedium } : {}),
      ...(input.utmCampaign ? { utm_campaign: input.utmCampaign } : {}),
      received_at: new Date(input.receivedAt).toISOString(),
    },
    privacy_mode: true,
    first_successful_inference_at: now,
    last_successful_inference_at: now,
    inference_surfaces: [],
    connected_data_usage: [],
    active_weeks: [],
  }

  receipt.last_successful_inference_at = now
  if (!receipt.inference_surfaces.includes(input.inferenceSurface)) {
    receipt.inference_surfaces.push(input.inferenceSurface)
  }
  if (!receipt.active_weeks.includes(input.experimentWeek)) {
    receipt.active_weeks.push(input.experimentWeek)
    receipt.active_weeks.sort((a, b) => a - b)
  }
  for (const source of input.connectedDataSources ?? []) {
    if (!receipt.connected_data_usage.some(item => item.source === source)) {
      receipt.connected_data_usage.push({
        source,
        first_used_at: now,
      })
    }
  }

  try {
    localStorage.setItem(storageKey(input.trackingId), JSON.stringify(receipt))
    return receipt
  } catch {
    return null
  }
}

export function formatPrivacyPilotReceipt(receipt: PrivacyPilotReceipt): string {
  return JSON.stringify(receipt, null, 2)
}
