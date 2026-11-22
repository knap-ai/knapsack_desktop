/** Only use the provider-declared given name for the exact draft sender. */
export function followUpSenderGivenName(
  profile: { email?: string; given_name?: string } | undefined,
  senderEmail: string | undefined,
): string | undefined {
  if (
    !senderEmail?.trim() ||
    !profile?.email?.trim() ||
    senderEmail.trim().toLowerCase() !== profile.email.trim().toLowerCase()
  )
    return
  const givenName = typeof profile.given_name === 'string' ? profile.given_name.trim() : ''
  return givenName || undefined
}
