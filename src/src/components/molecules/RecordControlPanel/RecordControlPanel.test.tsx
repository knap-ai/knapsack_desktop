// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

// Keep the real controls/tooltip behavior; the public icon is a browser asset,
// not a Node module (root-relative file URLs are invalid on Windows runners).
vi.mock('/assets/images/questionMark.svg', () => ({ default: '/synthetic-help.svg' }))

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
it('keeps pause, resume and end separate without starting another recording', () => {
  const view = render(<RecordControlPanel {...defaults} isRecording />)
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
  expect(defaults.onClickPause).toHaveBeenCalledOnce()
  view.rerender(<RecordControlPanel {...defaults} isRecording isPaused />)
  expect(screen.queryByRole('button', { name: 'Join & record' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
  fireEvent.click(screen.getByRole('button', { name: 'End' }))
  expect(defaults.onClickResume).toHaveBeenCalledOnce()
  expect(defaults.onClickEnd).toHaveBeenCalledOnce()
  expect(defaults.onClickRecord).not.toHaveBeenCalled()
  expect(defaults.onClickJoin).not.toHaveBeenCalled()
})
