import { describe, expect, it } from 'vitest'

import { googleAccountConnectPresentation } from './accountConnectionPresentation'

describe('Google account connection presentation', () => {
  it('matches Slack wording for an already-connected account', () => {
    expect(googleAccountConnectPresentation(2, false, true, false)).toMatchObject({
      buttonLabel: 'Connect another',
      ariaLabel: 'Connect another Google account',
      disabled: false,
      messageRole: 'status',
    })
  })

  it('uses a provider-specific action for the empty state', () => {
    expect(googleAccountConnectPresentation(0, false, true, false)).toMatchObject({
      buttonLabel: 'Connect Google',
      ariaLabel: 'Connect Google account',
      disabled: false,
    })
  })

  it('locks and labels the control while OAuth opens', () => {
    expect(googleAccountConnectPresentation(1, true, true, false)).toMatchObject({
      buttonLabel: 'Opening…',
      disabled: true,
    })
  })

  it('exposes an accessible error role and color', () => {
    expect(googleAccountConnectPresentation(1, false, true, true)).toMatchObject({
      messageRole: 'alert',
      messageClassName: 'text-xs text-red-600',
    })
  })
})
