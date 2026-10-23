import { describe, expect, it } from 'vitest'

import { buildFollowUpEmailBody } from './emails'

describe('meeting follow-up email quality', () => {
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

    expect(body).toContain('For next steps:')
    expect(body).toContain('I’ll send revised pricing by Friday.')
  })

  it('keeps sparse drafts sendable without fabricating details', () => {
    const body = buildFollowUpEmailBody('# Meeting Notes', undefined, 'Alex')
    expect(body).toContain('Thanks again for the conversation.')
    expect(body).toContain('Let me know if I missed anything.')
    expect(body).not.toMatch(/I(?:’|')ll|deadline|next steps separately/i)
  })
})
