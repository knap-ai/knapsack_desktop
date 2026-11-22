import { describe, expect, it } from 'vitest'

import { buildFollowUpEmailBody } from './emails'
import { followUpSenderGivenName } from './followUpSender'

describe('meeting follow-up email quality', () => {
  it('uses visible bullets and cleans internal deadline fields without adding commitments', () => {
    const body = buildFollowUpEmailBody(
      '## Action Items\n- You — Share the pilot notes — Due: Not specified\n- Jo — Review API readiness — Due: Friday',
      'Acme <> Example',
      undefined,
      'Sam',
    )
    expect(body).toContain('Acme and Example')
    expect(body).toContain('list-style-type:disc')
    expect(body).toContain('I’ll share the pilot notes.')
    expect(body).toContain('Jo will review API readiness; timing: Friday.')
    expect(body).not.toMatch(/Due:|Not specified|Best(?: regards)?,/)
  })
  it('uses grounded meeting content without inventing a future commitment', () => {
    const body = buildFollowUpEmailBody(
      '# Meeting Notes\n\nWe discussed the pilot feedback and pricing questions.',
      'Pilot review',
      'Alex',
      'Sam',
    )

    expect(body).toContain('Hi Sam')
    expect(body).toContain('We discussed the pilot feedback and pricing questions.')
    expect(body).not.toMatch(/I(?:’|')ll send|once they are confirmed|agreed next steps/i)
  })

  it('includes a commitment only when the notes assign it to the sender', () => {
    const body = buildFollowUpEmailBody(
      '# Meeting Notes\n\n## Action Items\n- [ ] You — Send revised pricing by Friday',
      'Pricing review',
      'Alex',
      'Sam',
    )

    expect(body).toContain('<strong>Next steps</strong>')
    expect(body).toContain('I’ll send revised pricing by Friday.')
  })

  it('keeps sparse drafts sendable without fabricating details', () => {
    const body = buildFollowUpEmailBody('# Meeting Notes', undefined, 'Alex')
    expect(body).toContain('Thank you for the discussion.')
    expect(body).toContain('Please let me know if anything needs correcting')
    expect(body).not.toMatch(/I(?:’|')ll|deadline|next steps separately/i)
  })
})

describe('generated meeting signoff identity', () => {
  it('uses the verified sender given name without changing body names', () => {
    const given = followUpSenderGivenName(
      { email: 'alex@example.invalid', given_name: 'Alex' },
      'ALEX@example.invalid',
    )
    const body = buildFollowUpEmailBody('Alex Rivera reviewed the plan.', 'Review', given)
    expect(body).toContain('Best regards,<br>Alex</p>')
    expect(body).toContain('Alex Rivera reviewed the plan.')
  })
  it.each(['Mary Jane', '小明', 'Renée'])(
    'preserves the complete provider-declared given name %s',
    given_name => {
      const given = followUpSenderGivenName(
        { email: 'sender@example.invalid', given_name },
        'sender@example.invalid',
      )
      expect(buildFollowUpEmailBody('# Notes', undefined, given)).toContain(
        `Best regards,<br>${given_name}</p>`,
      )
    },
  )
  it('never guesses from email and omits an unavailable signoff name', () => {
    const given = followUpSenderGivenName(
      { email: 'alex.rivera@example.invalid' },
      'alex.rivera@example.invalid',
    )
    expect(given).toBeUndefined()
    expect(buildFollowUpEmailBody('# Notes', undefined, given)).not.toContain('Best regards')
  })
  it('does not borrow another account name', () => {
    expect(
      followUpSenderGivenName(
        { email: 'a@example.invalid', given_name: 'Alex' },
        'b@example.invalid',
      ),
    ).toBeUndefined()
    expect(followUpSenderGivenName(undefined, 'a@example.invalid')).toBeUndefined()
    expect(
      followUpSenderGivenName({ email: 'a@example.invalid', given_name: ' ' }, 'a@example.invalid'),
    ).toBeUndefined()
  })
})
