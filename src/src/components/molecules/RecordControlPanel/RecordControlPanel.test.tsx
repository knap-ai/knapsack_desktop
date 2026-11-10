// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import RecordControlPanel from './index'

const defaults = {
  isRecording: false,
  isDisabled: false,
  isPaused: false,
  isSynthesizing: false,
  onClickJoin: vi.fn(),
  onClickRecord: vi.fn(),
  onClickPause: vi.fn(),
  onClickResume: vi.fn(),
  onClickEnd: vi.fn(),
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('keeps combined and record-only actions separate and explicit', () => {
  render(<RecordControlPanel {...defaults} />)
  fireEvent.click(screen.getByRole('button', { name: 'Record' }))
  expect(defaults.onClickRecord).toHaveBeenCalledOnce()
  expect(defaults.onClickJoin).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Join & record' }))
  expect(defaults.onClickJoin).toHaveBeenCalledOnce()
})
it.each([{ isDisabled: true }, { isStarting: true }])(
  'never invokes a disabled recording action %s',
  flags => {
    render(<RecordControlPanel {...defaults} {...flags} />)
    for (const button of screen.getAllByRole('button')) fireEvent.click(button)
    expect(defaults.onClickJoin).not.toHaveBeenCalled()
    expect(defaults.onClickRecord).not.toHaveBeenCalled()
  },
)
it('only offers lifecycle actions during an active recording', () => {
  render(<RecordControlPanel {...defaults} isRecording />)
  expect(screen.queryByRole('button', { name: 'Record' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
  expect(defaults.onClickEnd).toHaveBeenCalledOnce()
})
