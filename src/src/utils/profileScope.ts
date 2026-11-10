/** Identity invalidation signal only. Never carries profile data or credentials. */
export const PROFILE_CHANGED_EVENT = 'kn-authenticated-profile-changed'

// Monotonic invalidation survives component unmounts and A→B→A transitions.
let profileRevision = 0
if (typeof window !== 'undefined') {
  window.addEventListener(PROFILE_CHANGED_EVENT, () => {
    profileRevision++
  })
}
export const getProfileRevision = () => profileRevision
