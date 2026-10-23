import { describe, expect, it } from 'vitest'

import {
  initialMeetingChatLifecycle,
  meetingChatLauncherLabel,
  meetingChatLifecycleReducer,
} from './meetingChatLifecycle'

describe('meeting chat minimize lifecycle', () => {
  it('keeps an in-flight chat mounted and busy while minimized, then restores it', () => {
    let state = meetingChatLifecycleReducer(initialMeetingChatLifecycle, { type: 'open' })
    state = meetingChatLifecycleReducer(state, { type: 'set-busy', busy: true })
    state = meetingChatLifecycleReducer(state, { type: 'minimize' })

    expect(state).toEqual({ mounted: true, minimized: true, busy: true })
    expect(meetingChatLauncherLabel(state)).toBe('Meeting chat is still working — reopen')

    state = meetingChatLifecycleReducer(state, { type: 'open' })
    expect(state).toEqual({ mounted: true, minimized: false, busy: true })
  })

  it('retains a completed or cancelled result while minimized and tolerates repeated actions', () => {
    let state = meetingChatLifecycleReducer(initialMeetingChatLifecycle, { type: 'open' })
    state = meetingChatLifecycleReducer(state, { type: 'set-busy', busy: true })
    state = meetingChatLifecycleReducer(state, { type: 'minimize' })
    const alreadyMinimized = meetingChatLifecycleReducer(state, { type: 'minimize' })
    expect(alreadyMinimized).toBe(state)

    state = meetingChatLifecycleReducer(state, { type: 'set-busy', busy: false })
    expect(state.mounted).toBe(true)
    expect(state.minimized).toBe(true)
    expect(meetingChatLauncherLabel(state)).toBe('Meeting chat minimized — reopen')

    state = meetingChatLifecycleReducer(state, { type: 'open' })
    expect(meetingChatLifecycleReducer(state, { type: 'open' })).toBe(state)
  })
})
