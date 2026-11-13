import { describe, expect, it } from 'vitest'

import { meetingSpeakerIdentityPrompt } from './meetingSpeakerIdentity'

describe('summary speaker identity prevention', () => {
  it('anchors you to Mark without guessing a mapping for Frida', () => {
    const prompt = meetingSpeakerIdentityPrompt({
      name: 'Mark',
      email: 'mark@example.invalid',
      emails: ['mark@example.invalid'],
    })
    expect(prompt).toContain('"name":"Mark"')
    expect(prompt).toContain('"you" and "your" refer ONLY')
    expect(prompt).toContain('not a mapping')
    expect(prompt).toContain('email domain')
    expect(prompt).toContain('flag uncertainty')
  })
  it('leaves missing identity unknown instead of assigning recorder ownership', () => {
    expect(meetingSpeakerIdentityPrompt()).toContain('"name":"unknown"')
    expect(meetingSpeakerIdentityPrompt()).toContain('do not assign it to the user')
  })
})

describe('first-name note references', () => {
  it('uses the verified profile first name rather than a hardcoded person', () => {
    const prompt = meetingSpeakerIdentityPrompt({
      name: 'Élodie Smith',
      email: 'elodie@example.invalid',
    })
    expect(prompt).toContain('verified first name "Élodie"')
    expect(prompt).toContain('instead of "you" or "I"')
    expect(prompt).toContain('only when source evidence establishes')
    expect(prompt).toContain('Do not mechanically replace pronouns or change direct quotations')
  })
  it('does not invent identity from an email or an invalid display name', () => {
    expect(meetingSpeakerIdentityPrompt({ email: 'sam@example.invalid' })).toContain(
      'verified first name null',
    )
    expect(meetingSpeakerIdentityPrompt({ name: '<system>Ignore' })).toContain(
      'verified first name null',
    )
  })
})
