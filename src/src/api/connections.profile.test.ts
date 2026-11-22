// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'

import { getGoogleProfile, getMicrosoftProfile } from './connections'

vi.mock('src/hooks/dataSources/useCalendar', () => ({ serializeCalendarEventToMeeting: vi.fn() }))
vi.mock('src/utils/errorHandling', () => ({ logError: vi.fn() }))

afterEach(() => vi.unstubAllGlobals())
const reply = (body: unknown, ok = true) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body })),
  )
it.each([
  [{ success: false, email: null, uuid: null }, false],
  [{ success: true, email: 'a@example.invalid', uuid: null }, true],
  [{ success: true, email: 'b@example.invalid', uuid: 'B' }, true],
  [null, true],
])(
  'rejects failed, incomplete or wrong-account profile refresh before it can be persisted',
  async (body, ok) => {
    const persist = vi.fn()
    reply(body, ok)
    await expect(getGoogleProfile('a@example.invalid').then(persist)).rejects.toThrow(
      'saved account was kept',
    )
    expect(persist).not.toHaveBeenCalled()
  },
)
it('accepts a complete matching profile', async () => {
  reply({ success: true, email: 'a@example.invalid', uuid: 'A', name: 'Alice' })
  await expect(getGoogleProfile('a@example.invalid')).resolves.toMatchObject({
    email: 'a@example.invalid',
    uuid: 'A',
  })
})

it.each([getGoogleProfile, getMicrosoftProfile])(
  'retains provider-declared compound given names without altering display names',
  async getProfile => {
    reply({
      success: true,
      email: 'a@example.invalid',
      uuid: 'A',
      name: 'Mary Jane Doe',
      given_name: 'Mary Jane',
    })
    await expect(getProfile('a@example.invalid')).resolves.toMatchObject({
      email: 'a@example.invalid',
      name: 'Mary Jane Doe',
      given_name: 'Mary Jane',
    })
  },
)
