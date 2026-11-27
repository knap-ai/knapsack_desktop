// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { TokenCostsView } from './index'
import { useTokenCosts } from './useTokenCosts'

vi.mock('@tauri-apps/api/tauri', () => ({ invoke: vi.fn() }))
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn() }))
vi.mock('./useTokenCosts', () => ({ useTokenCosts: vi.fn() }))

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => undefined)),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const state = {
  summary: null,
  records: null,
  budget: null,
  days: 30,
  setDays: vi.fn(),
  isLoading: true,
  error: '',
  fetchData: vi.fn(),
}
it('does not claim zero spend or an empty ledger while loading', () => {
  vi.mocked(useTokenCosts).mockReturnValue(state)
  render(<TokenCostsView />)
  expect(screen.queryByText('$0.0000')).toBeNull()
  expect(screen.queryByText('No token usage recorded yet')).toBeNull()
  expect(screen.getByText('Loading token usage…')).toBeTruthy()
})
it('offers retry and exposes bounded failure without claiming an empty ledger', () => {
  vi.mocked(useTokenCosts).mockReturnValue({
    ...state,
    isLoading: false,
    error: 'Some token usage could not be loaded.',
  })
  render(<TokenCostsView />)
  expect(screen.getByRole('alert').textContent).toContain('could not be loaded')
  expect(screen.getByRole('button', { name: 'Refresh' }).hasAttribute('disabled')).toBe(false)
  expect(screen.queryByText('No token usage recorded yet')).toBeNull()
})
it('shows genuine successful zero totals and empty history', () => {
  vi.mocked(useTokenCosts).mockReturnValue({
    ...state,
    isLoading: false,
    records: [],
    summary: {
      totalCostUsd: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      byModel: [],
    },
    budget: { dailyCostUsd: 0, monthlyCostUsd: 0 },
  })
  render(<TokenCostsView />)
  expect(screen.getByText('No token usage recorded yet')).toBeTruthy()
  expect(screen.getAllByText('$0.0000').length).toBe(2)
})
