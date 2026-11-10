/** Calendar metadata can name the remote audio channel only for an unambiguous
 * two-person roster that includes a known signed-in user address. */
export function oneToOneParticipantName(
  participants: { email?: string; name?: string }[] | undefined,
  selfEmails: ReadonlySet<string>,
): string | undefined {
  if (!participants?.length || !selfEmails.size) return undefined
  const roster = new Map<string, { email?: string; name?: string }>()
  for (const participant of participants) {
    const email = participant.email?.trim().toLowerCase()
    if (!email || !email.includes('@')) return undefined
    roster.set(email, participant)
  }
  if (roster.size !== 2) return undefined
  const self = [...roster.keys()].filter(email => selfEmails.has(email))
  if (self.length !== 1) return undefined
  const other = [...roster.entries()].find(([email]) => email !== self[0])?.[1]
  return other?.name?.trim() || undefined
}
