import { describe, expect, it } from 'vitest'

import { shouldUseDirectMeetingContext } from './meetingContextRouting'

describe('meeting context routing', () => {
  it.each([
    'tell me about our chat with xerpa on 9/24',
    'summarize the meeting notes for Bankaya',
    'what did we decide about the pilot?',
    'read yesterday\'s transcript',
  ])('routes local meeting-history requests to the direct tool loop: %s', prompt => {
    expect(shouldUseDirectMeetingContext(prompt)).toBe(true)
  })

  it.each([
    'draft a Slack message to the team',
    'search the web for Xerpa',
    'what is on my calendar tomorrow?',
    'schedule a meeting with the team',
    'change my recording settings',
    'how do meeting reminders work?',
  ])('keeps unrelated requests on the selected harness: %s', prompt => {
    expect(shouldUseDirectMeetingContext(prompt)).toBe(false)
  })
})
