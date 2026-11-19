import { expect, it } from 'vitest'
import { notificationBrief } from './notificationBrief'
it('keeps complete context and an actionable point without a clipped thought', () => {
  expect(notificationBrief('## Context\nThe pilot needs a decision.\n- Confirm the launch owner.\n- Review scope.')).toBe('The pilot needs a decision. Confirm the launch owner.')
})
it('skips overlong material rather than adding an ellipsis, preserving Unicode', () => {
  const result = notificationBrief('Long '+ 'word '.repeat(100) + '.\nConfirm José’s review.'); expect(result).toBe('Confirm José’s review.'); expect(result).not.toContain('…')
})
it('does not expose conferencing credentials or invent prep when content is absent', () => {
  expect(notificationBrief('Join https://example.test\nPasscode: synthetic\nMeeting ID: 123')).toBe('')
  expect(notificationBrief('')).toBe('')
})
