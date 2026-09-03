import { listen } from '@tauri-apps/api/event'

/**
 * Onboarding intent carried in from the website.
 *
 * A visitor who clicks the Executive Assistant ad and lands on
 * /executive-assistant should meet the Executive Assistant on first launch, not
 * a four-way picker. The website's thank-you page opens
 * knapsack://onboard?role=executive-assistant&attr_id=... after the download; the Rust side
 * forwards that URL as a "deep-link-received" event and this module turns it
 * into a stored intent the onboarding screens can read.
 *
 * The intent is persisted because the deep link usually arrives before the
 * onboarding UI has mounted.
 */

const STORAGE_KEY = 'ks_onboarding_intent'
const ACTIVATION_TRACKED_KEY = 'ks_paid_activation_tracked'
export const ONBOARDING_INTENT_EVENT = 'knapsack-onboarding-intent'

/** Landing-page role slug -> agent template id in agentTemplates.ts. */
export const ROLE_TO_TEMPLATE: Record<string, string> = {
  'executive-assistant': 'scout',
  'enterprise-sdr': 'atlas',
  'daily-coach': 'coach',
  'email-autopilot': 'polly',
  // Roles below have landing pages but no agent template yet. Left unmapped on
  // purpose: preselecting the wrong worker is worse than showing the picker.
}

export interface OnboardingIntent {
  /** Agent template id to preselect, e.g. "scout". */
  templateId?: string
  /** Original landing-page slug, kept for analytics. */
  role?: string
  /** Ad attribution id set by the website, for joining this install to a click. */
  attrId?: string
  gclid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  receivedAt: number
}

function read(): OnboardingIntent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OnboardingIntent) : null
  } catch {
    return null
  }
}

function write(intent: OnboardingIntent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intent))
  } catch {
    /* storage unavailable; the picker just shows its default */
  }
}

export interface ActivationAttribution {
  role?: string
  attr_id?: string
  gclid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  attribution_age_seconds: number
}

/** Parses knapsack://onboard?role=…&attr_id=… into an intent. */
export function parseDeepLink(url: string): OnboardingIntent | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'knapsack:' || parsed.hostname !== 'onboard') return null

    const params = parsed.searchParams
    const role = params.get('role') || undefined
    const templateId = role ? ROLE_TO_TEMPLATE[role] : undefined

    if (!templateId && !role) return null

    return {
      templateId,
      role,
      attrId: params.get('attr_id') || undefined,
      gclid: params.get('gclid') || undefined,
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      receivedAt: Date.now(),
    }
  } catch {
    return null
  }
}

/**
 * Starts listening for deep links. Call once at app startup.
 * Returns an unlisten function.
 */
export async function initOnboardingIntent(): Promise<() => void> {
  return listen<string | string[]>('deep-link-received', event => {
    const payload = event.payload
    const url = Array.isArray(payload) ? payload[0] : payload
    if (typeof url !== 'string') return

    const intent = parseDeepLink(url)
    if (intent) {
      write(intent)
      window.dispatchEvent(
        new CustomEvent<OnboardingIntent>(ONBOARDING_INTENT_EVENT, { detail: intent }),
      )
    }
  })
}

/** The stored intent, if the app was opened from a role page. */
export function getOnboardingIntent(): OnboardingIntent | null {
  return read()
}

function activationTrackingKey(intent: OnboardingIntent): string | null {
  if (intent.gclid) return intent.gclid
  if (intent.attrId) return intent.attrId

  const isGoogleCpc =
    intent.utmSource?.toLowerCase() === 'google' && intent.utmMedium?.toLowerCase() === 'cpc'
  if (!isGoogleCpc) return null

  // A stable key for the stored deep-link intent prevents a UTM-only campaign
  // from reporting every successful inference as another first activation.
  return [intent.utmSource, intent.utmMedium, intent.utmCampaign || 'unknown', intent.receivedAt].join(
    ':',
  )
}

/**
 * Returns ad attribution for the first successful inference, if it has not
 * already been reported for this click. The role-selection intent deliberately
 * survives onboarding so the activation event can be joined back to the web
 * visit and download.
 */
export function getActivationAttribution(): ActivationAttribution | null {
  const intent = read()
  if (!intent) return null

  const attributionId = activationTrackingKey(intent)
  if (!attributionId) return null

  try {
    const trackedId = localStorage.getItem(ACTIVATION_TRACKED_KEY)
    if (trackedId && trackedId === attributionId) return null
  } catch {
    /* storage unavailable; returning the attribution is safer than dropping it */
  }

  return {
    role: intent.role,
    attr_id: intent.attrId,
    gclid: intent.gclid,
    utm_source: intent.utmSource,
    utm_medium: intent.utmMedium,
    utm_campaign: intent.utmCampaign,
    attribution_age_seconds: Math.max(0, Math.round((Date.now() - intent.receivedAt) / 1000)),
  }
}

/** Marks this attributed install after its first successful inference event. */
export function markActivationTracked() {
  const intent = read()
  const attributionId = intent ? activationTrackingKey(intent) : null
  if (!attributionId) return

  try {
    localStorage.setItem(ACTIVATION_TRACKED_KEY, attributionId)
  } catch {
    /* best-effort deduplication */
  }
}

/** Clears the intent when an explicit reset is required. */
export function clearOnboardingIntent() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to do */
  }
}
