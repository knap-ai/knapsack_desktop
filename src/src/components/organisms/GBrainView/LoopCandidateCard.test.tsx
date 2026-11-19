// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { LoopCandidate } from 'src/api/loops'
import { afterEach, expect, it, vi } from 'vitest'

import LoopCandidateCard from './LoopCandidateCard'

afterEach(cleanup)
const candidate: LoopCandidate = {
  id: 'synthetic',
  loopId: 'starter-inbox-observation',
  signalId: 'synthetic-source',
  signalType: 'inbound_email_document_review',
  title: 'Review project documents',
  reason: 'Portal: “Please review the uploaded documents by Friday”.',
  confidence: 0.84,
  context:
    'From: portal@example.test\nSubject: Project documents\nPlease review the uploaded documents by Friday.',
  accountIdentity: 'owner@example.test',
  targetIdentity: 'portal@example.test',
  status: 'proposed',
  observedAt: 1,
  updatedAt: 1,
}
it('shows source-grounded review with inspectable evidence and an observation-only action', () => {
  const observe = vi.fn()
  render(
    <LoopCandidateCard
      candidate={candidate}
      pending={false}
      onDismiss={vi.fn()}
      onObserve={observe}
    />,
  )
  expect(screen.getByRole('heading', { name: 'Review project documents' })).toBeTruthy()
  expect(screen.queryByText(/84%/)).toBeNull()
  expect(screen.queryByRole('button', { name: 'Observe & prepare' })).toBeNull()
  fireEvent.click(screen.getByText('Source email'))
  expect(screen.getByText(/From: portal@example.test/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /^Observe$/ }))
  expect(observe).toHaveBeenCalledOnce()
})
it('keeps explicit reply preparation distinct and disables duplicate pending action', () => {
  const observe = vi.fn()
  render(
    <LoopCandidateCard
      candidate={{
        ...candidate,
        loopId: 'starter-inbox-response',
        signalType: 'inbound_email_needs_response',
      }}
      pending
      onDismiss={vi.fn()}
      onObserve={observe}
    />,
  )
  const button = screen.getByRole('button', { name: 'Preparing…' })
  expect(button.hasAttribute('disabled')).toBe(true)
  fireEvent.click(button)
  expect(observe).not.toHaveBeenCalled()
})
