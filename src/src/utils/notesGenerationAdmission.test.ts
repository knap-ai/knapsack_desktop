import { expect, it, vi } from 'vitest'

import { runNotesGenerationOnce } from './notesGenerationAdmission'

it('joins duplicate work, preserves account boundaries, and admits retry after settlement', async () => {
  let finish!: () => void
  const work = vi.fn(
    () =>
      new Promise<void>(resolve => {
        finish = resolve
      }),
  )
  const a = runNotesGenerationOnce(900, 'profile-a:revision-1', work),
    b = runNotesGenerationOnce(900, 'profile-a:revision-1', work)
  expect(a).toBe(b)
  await Promise.resolve()
  expect(work).toHaveBeenCalledOnce()
  await expect(runNotesGenerationOnce(900, 'profile-b:revision-2', work)).rejects.toThrow(
    'different account context',
  )
  await expect(
    runNotesGenerationOnce(900, 'profile-a:revision-1', work, 'changed-template'),
  ).rejects.toThrow('different notes request')
  finish()
  await a
  const next = vi.fn(async () => {})
  await runNotesGenerationOnce(900, 'profile-b:revision-2', next)
  expect(next).toHaveBeenCalledOnce()
})
it('releases failed work without automatically retrying it', async () => {
  const work = vi.fn(async () => {
    throw new Error('Synthetic transport failure')
  })
  await expect(runNotesGenerationOnce(901, 'profile-a', work)).rejects.toThrow(
    'Synthetic transport failure',
  )
  expect(work).toHaveBeenCalledOnce()
  const retry = vi.fn(async () => {})
  await runNotesGenerationOnce(901, 'profile-a', retry)
  expect(retry).toHaveBeenCalledOnce()
})
