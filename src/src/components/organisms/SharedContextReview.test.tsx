// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { sharedContextStatus } from 'src/api/sharedContext'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, expect, it, vi } from 'vitest'

import SharedContextReview, { type ContextReviewProps } from './SharedContextReview'

vi.mock('@tauri-apps/api/tauri', () => ({ invoke: vi.fn() }))
afterEach(cleanup)
const candidate = {
  id: 'record-a',
  kind: 'curated_context' as const,
  title: 'Reviewed note',
  sourceLabel: 'This device',
  previewText: 'Historical planning context',
  revision: 3,
  digest: 'a'.repeat(64),
}
function fixture(overrides: Partial<ContextReviewProps> = {}) {
  const props: ContextReviewProps = {
    bindingKey: 'account-a/device-a/epoch-1',
    candidates: [candidate],
    accountLabel: 'Account A',
    deviceLabel: 'Device A',
    verifiedIdentity: true,
    enrolledDevice: true,
    state: 'review',
    onSelect: vi.fn(async () => undefined),
    onCancel: vi.fn(),
    onDiscardLocal: vi.fn(async () => undefined),
    ...overrides,
  }
  return props
}
function consent() {
  fireEvent.click(screen.getByLabelText(/Reviewed note/))
  fireEvent.click(screen.getByLabelText(/Share only these reviewed records/))
  fireEvent.click(screen.getByLabelText(/Enable the selected scope/))
}
it('requires both explicit consents, preserves source preview, and submits exact revision/digest once', async () => {
  const props = fixture()
  render(<SharedContextReview {...props} />)
  expect(screen.getByText(/Knapsack can recover/)).toBeTruthy()
  expect(screen.getByText('Historical planning context')).toBeTruthy()
  expect((screen.getByText('Confirm selected sharing') as HTMLButtonElement).disabled).toBe(true)
  consent()
  act(() => {
    screen.getByText('Confirm selected sharing').click()
    screen.getByText('Confirm selected sharing').click()
  })
  await waitFor(() =>
    expect(props.onSelect).toHaveBeenCalledExactlyOnceWith([
      { recordId: 'record-a', expectedLocalRevision: 3, expectedDigest: 'a'.repeat(64) },
    ]),
  )
})
it('changing the reviewed body clears consent even if ID and binding stay the same', () => {
  const props = fixture()
  const view = render(<SharedContextReview {...props} />)
  consent()
  view.rerender(
    <SharedContextReview
      {...props}
      candidates={[
        { ...candidate, previewText: 'Changed draft', revision: 4, digest: 'b'.repeat(64) },
      ]}
    />,
  )
  expect((screen.getByText('Confirm selected sharing') as HTMLButtonElement).disabled).toBe(true)
  expect(props.onSelect).not.toHaveBeenCalled()
})
it('A pending selection is cancelled by A callback before switching to B', async () => {
  let finish!: () => void
  const first = fixture({
    onSelect: vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    ),
  })
  const second = fixture({ bindingKey: 'account-b/device-b/epoch-1', accountLabel: 'Account B' })
  const view = render(<SharedContextReview {...first} />)
  consent()
  fireEvent.click(screen.getByText('Confirm selected sharing'))
  view.rerender(<SharedContextReview {...second} />)
  expect(first.onCancel).toHaveBeenCalled()
  expect(second.onSelect).not.toHaveBeenCalled()
  await act(async () => finish())
  expect((screen.getByText('Confirm selected sharing') as HTMLButtonElement).disabled).toBe(true)
})
it('profile changes, cancellation and revoked state cannot keep consent', () => {
  const props = fixture()
  const view = render(<SharedContextReview {...props} />)
  consent()
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  expect(props.onCancel).toHaveBeenCalled()
  expect(screen.queryByText('Confirm selected sharing')).toBeNull()
  expect(screen.queryByText('Historical planning context')).toBeNull()
  view.unmount()
  render(<SharedContextReview {...props} state="revoked" />)
  expect(screen.getByRole('status').textContent).toMatch(/revoked/)
})
it('conflict discard requires full body review and exact current remote revision/local mutation', async () => {
  const conflict = {
    recordId: 'record-a',
    revision: 4,
    localTitle: 'Same title',
    remoteTitle: 'Same title',
    localText: 'Local body',
    remoteText: 'Different remote body',
    localSource: 'Device A',
    remoteSource: 'Device B',
    localMutationId: 'mutation-a',
    deleted: false,
  }
  const props = fixture({ state: 'conflict', conflict })
  const view = render(<SharedContextReview {...props} />)
  expect(screen.getByText('Local body')).toBeTruthy()
  expect(screen.getByText('Different remote body')).toBeTruthy()
  fireEvent.click(screen.getByLabelText(/I reviewed both versions/))
  view.rerender(
    <SharedContextReview
      {...props}
      conflict={{ ...conflict, remoteText: 'New remote body', revision: 5 }}
    />,
  )
  expect((screen.getByText('Keep remote version') as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByLabelText(/I reviewed both versions/))
  fireEvent.click(screen.getByText('Keep remote version'))
  await waitFor(() =>
    expect(props.onDiscardLocal).toHaveBeenCalledExactlyOnceWith('record-a', 5, 'mutation-a'),
  )
})
it('dormant release status never invokes native operations or changes inference', async () => {
  const { invoke } = await import('@tauri-apps/api/tauri')
  const status = await sharedContextStatus()
  expect(status.feature_available).toBe(false)
  expect(status.sync_enabled).toBe(false)
  expect(invoke).not.toHaveBeenCalled()
})

it('revocation during a pending selection invalidates the native consent fence and requires fresh review', async () => {
  let finish!: () => void
  const props = fixture({
    onSelect: vi.fn(
      () =>
        new Promise<void>(resolve => {
          finish = resolve
        }),
    ),
  })
  const view = render(<SharedContextReview {...props} />)
  consent()
  fireEvent.click(screen.getByText('Confirm selected sharing'))
  view.rerender(<SharedContextReview {...props} state="revoked" />)
  expect(props.onCancel).toHaveBeenCalled()
  expect(screen.queryByText('Historical planning context')).toBeNull()
  await act(async () => finish())
  view.rerender(<SharedContextReview {...props} state="review" />)
  expect(screen.queryByText('Confirm selected sharing')).toBeNull()
  expect(props.onSelect).toHaveBeenCalledTimes(1)
})
