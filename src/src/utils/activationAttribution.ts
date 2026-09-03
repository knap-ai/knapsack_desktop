export interface PaidActivationIntent {
  attrId?: string
  gclid?: string
  utmSource?: string
  utmMedium?: string
}

/**
 * Paid activation events must have a durable click/install identifier so they
 * can be joined to the web funnel and deduplicated after the first inference.
 */
export function getPaidActivationId(intent: PaidActivationIntent): string | null {
  const isGoogleCpc = intent.utmSource?.toLowerCase() === 'google'
    && intent.utmMedium?.toLowerCase() === 'cpc'

  if (!intent.gclid && !intent.attrId) return null
  if (!intent.gclid && !isGoogleCpc) return null

  return intent.gclid || intent.attrId || null
}
