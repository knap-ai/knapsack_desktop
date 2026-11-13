import { describe, expect, it } from 'vitest'

import { oneToOneParticipantName } from './oneToOneParticipant'

const self = new Set(['me@example.test', 'alias@example.test'])
const me = { email: 'ME@example.test', name: 'Me' }
const other = { email: 'other@example.test', name: 'Alex Example' }
describe('one-to-one transcript participant', () => {
  it('uses an explicit name only for a two-person roster containing self', () => {
    expect(oneToOneParticipantName([me, other], self)).toBe('Alex Example')
    expect(oneToOneParticipantName([other, me, other], self)).toBe('Alex Example')
    expect(oneToOneParticipantName([{ email: 'alias@example.test' }, other], self)).toBe(
      'Alex Example',
    )
  })
  it('retains generic labels for missing self, groups, unnamed or ambiguous rosters', () => {
    for (const roster of [
      [other],
      [me, other, { email: 'third@example.test' }],
      [me, { email: 'other@example.test' }],
      [me, { name: 'Alex' }],
    ]) {
      expect(oneToOneParticipantName(roster, self)).toBeUndefined()
    }
    expect(oneToOneParticipantName([me, other], new Set())).toBeUndefined()
  })
})
