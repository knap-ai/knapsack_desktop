// Release gates stay false until live recovery, key custody and transport are validated.
// Native commands independently reject every consequential operation in default builds.
export const ACCOUNT_CONTINUITY_ENABLED = false
export const OWNER_REMINDER_DELIVERY_ENABLED = false

// Separate gate: selected-record sync does not enable experimental backup features.
export const SHARED_CONTEXT_ENABLED = false
