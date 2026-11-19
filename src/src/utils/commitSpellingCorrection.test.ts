import { expect, it, vi } from 'vitest'
import { commitSpellingCorrection } from './commitSpellingCorrection'
it('does not delete a newer manual draft or replace its UI when an earlier save completes', async () => {
  let resolve!: () => void; let revision=0; let draft=''; const commit=vi.fn(), clear=vi.fn()
  const pending = commitSpellingCorrection({ markdown:'correction A', current:()=>revision===0, save:()=>new Promise<void>(r=>{resolve=r}), keepDraft:text=>{draft=text}, clearMatchingDraft:clear, commit })
  draft='manual B'; revision++; resolve()
  await expect(pending).rejects.toThrow('newer draft is preserved')
  expect(draft).toBe('manual B'); expect(clear).not.toHaveBeenCalled(); expect(commit).not.toHaveBeenCalled()
})
it('keeps a retryable draft on write failure and commits only after acknowledgement', async () => {
  const commit=vi.fn(), keep=vi.fn(), clear=vi.fn()
  await expect(commitSpellingCorrection({ markdown:'A',current:()=>true,save:async()=>{throw Error('disk')},keepDraft:keep,clearMatchingDraft:clear,commit })).rejects.toThrow('kept on this device')
  expect(keep).toHaveBeenCalledWith('A');expect(clear).not.toHaveBeenCalled();expect(commit).not.toHaveBeenCalled()
})
