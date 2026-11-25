// @vitest-environment jsdom
import { webcrypto } from 'node:crypto'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { LLMParams } from 'src/App'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import RecoveredCopy, { type Copy, type Receipt, type Request } from './RecoveredCopy'

type TestParams = { input?: Request; version?: number; requestId?: string }

const state = vi.hoisted(() => ({
  owner: { uuid: 'A', email: 'a@example.invalid' },
  calls: [] as { cmd: string; p: TestParams }[],
  copies: [] as Copy[],
  receipt: new Map<string, Receipt>(),
  lose: false,
  loseRestore: false,
  bad: false,
  sourceConflict: false,
  sourceMissing: false,
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: async () => state.owner },
}))
const scope = { threadId: 10, ownerUuid: 'A', ownerEmail: 'a@example.invalid' }
const saved = 'Priority: reconcile sandbox totals before pilot invites. Who owns demo?\n'
const draft = 'Manual draft: keep exact punctuation?\n'
const transcript = 'CSV import test Friday. Riley prepares sample.\n'
const body =
  'CSV import test Friday; Riley prepares sample. Priority: reconcile sandbox totals before pilot invites. Open question: who owns demo?'
async function digest(s: string) {
  return Buffer.from(
    await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(s)),
  ).toString('hex')
}
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: async (cmd: string, p: TestParams) => {
    state.calls.push({ cmd, p: structuredClone(p) })
    if (cmd === 'desktop_recovered_list') return structuredClone(state.copies)
    if (cmd === 'desktop_recovered_prepare')
      return {
        scope,
        snapshot: 'synthetic-snapshot',
        savedNotes: state.sourceMissing ? null : saved,
        transcript: {
          id: 3,
          filename: 'synthetic.txt',
          hash: 'a'.repeat(64),
          content: transcript,
        },
      }
    if (cmd === 'desktop_recovered_save') {
      if (state.sourceConflict) throw 'RECOVERY_SOURCE_CHANGED'
      const r = p.input
      if (!r) throw Error('missing synthetic request')
      if (r.expectedUuid !== state.owner.uuid) throw Error('owner refused')
      if (!state.receipt.has(r.requestId)) {
        const copy = {
          version: state.copies.length + 1,
          body: r.body,
          bodyHash: await digest(r.body),
          savedManual: state.sourceMissing ? null : saved,
          draftManual: r.draftManual,
          transcriptId: 3,
          transcriptHash: 'a'.repeat(64),
          restoredFrom: null,
        }
        state.copies.unshift(copy)
        state.receipt.set(r.requestId, {
          scope,
          requestId: r.requestId,
          version: copy.version,
          bodyHash: copy.bodyHash,
          desktopOnly: true,
        })
      }
      if (state.lose) {
        state.lose = false
        state.loseRestore = false
        throw Error('synthetic response lost')
      }
      return {
        ...state.receipt.get(r.requestId),
        ...(state.bad ? { requestId: 'wrong' } : {}),
      }
    }
    if (cmd === 'desktop_recovered_restore') {
      const { version, requestId } = p
      if (version === undefined || requestId === undefined) throw Error('missing synthetic restore')
      if (!state.receipt.has(requestId)) {
        const old = state.copies.find(v => v.version === version)
        if (!old) throw Error('missing synthetic version')
        const copy = {
          ...old,
          version: state.copies.length + 1,
          restoredFrom: version,
        }
        state.copies.unshift(copy)
        state.receipt.set(requestId, {
          scope,
          requestId: requestId,
          version: copy.version,
          bodyHash: copy.bodyHash,
          desktopOnly: true,
        })
      }
      if (state.loseRestore) {
        state.loseRestore = false
        throw Error('synthetic lost restore receipt')
      }
      return state.receipt.get(requestId)
    }
    throw Error('Unexpected synthetic IPC')
  },
}))
beforeEach(() => {
  state.owner = { uuid: 'A', email: 'a@example.invalid' }
  state.calls = []
  state.copies = []
  state.receipt = new Map()
  state.lose = false
  state.loseRestore = false
  state.bad = false
  state.sourceConflict = false
  state.sourceMissing = false
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('fetch', () => {
    throw Error('External IO forbidden')
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
function fixture(missingSavedNotes = false) {
  const jobs: LLMParams[] = [],
    queue = vi.fn((p: LLMParams) => jobs.push(p))
  const ui = render(
    <RecoveredCopy
      threadId={10}
      accountEmail={state.owner.email}
      manualDraft={draft}
      missingSavedNotes={missingSavedNotes}
      disabled={false}
      queue={queue}
    />,
  )
  return { jobs, queue, ui }
}
async function open() {
  fireEvent.click(screen.getByRole('button', { name: 'Recovered notes · Desktop only' }))
  await screen.findByRole('button', { name: 'Preview recovered notes' })
}
async function generate(f: ReturnType<typeof fixture>) {
  fireEvent.click(screen.getByRole('button', { name: 'Preview recovered notes' }))
  await waitFor(() => expect(f.jobs.length).toBeGreaterThan(0))
  await act(async () => {
    const job = f.jobs[f.jobs.length - 1]
    if (!job) throw Error('missing synthetic model job')
    await job.messageFinishCallback?.(body)
  })
  await screen.findByRole('button', { name: 'Save recovered copy' })
}
it('explicit save persists/reopens separately and includes exact manual and transcript inputs', async () => {
  const f = fixture()
  expect(globalThis.fetch).toBeTruthy()
  expect(state.calls).toEqual([])
  await open()
  await generate(f)
  expect(f.jobs[0].additionalDocuments).toEqual([
    { title: 'Verified saved transcript', content: transcript },
    {
      title: 'Original saved notes (may include manual notes)',
      content: saved,
    },
    { title: 'Current editor manual draft', content: draft },
  ])
  expect(f.jobs[0].requestKind).toBe('notes')
  expect(f.jobs[0].threadId).toBeUndefined()
  expect(f.jobs[0].documents).toEqual([])
  expect(f.jobs[0].semanticSearchQuery).toBe('')
  expect(f.jobs[0].prompt).toContain('Agenda questions remain open questions')
  expect(state.calls.some(v => v.cmd === 'desktop_recovered_save')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(
    'Recovered copy saved on this Desktop. Original notes and transcript unchanged.',
  )
  expect(screen.getByText('Original saved notes')).toBeTruthy()
  expect(screen.getByText('Editor input at preview')).toBeTruthy()
  expect(state.copies[0].draftManual).toBe(draft)
  expect(state.copies[0].savedManual).toBe(saved)
  f.ui.unmount()
  fixture()
  await open()
  expect(screen.getByText(body)).toBeTruthy()
  expect(state.calls.every(v => v.cmd.startsWith('desktop_recovered_'))).toBe(true)
})
it('dismissal leaves no saved copy and manual changes refuse saving the old preview', async () => {
  const f = fixture()
  await open()
  await generate(f)
  f.ui.rerender(
    <RecoveredCopy
      threadId={10}
      accountEmail={state.owner.email}
      manualDraft={draft + 'new edit'}
      disabled={false}
      queue={f.queue}
    />,
  )
  expect(
    (
      screen.getByRole('button', {
        name: 'Save recovered copy',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss preview' }))
  expect(screen.queryByRole('region', { name: 'Recovered copy preview' })).toBeNull()
  expect(state.copies).toEqual([])
})
it('response loss retries the same request ID and verifies exact receipt/readback', async () => {
  const f = fixture()
  await open()
  await generate(f)
  state.lose = true
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(/Not confirmed/)
  expect(state.copies.length).toBe(1)
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(/Recovered copy saved on this Desktop/)
  const saves = state.calls.filter(v => v.cmd === 'desktop_recovered_save')
  expect(saves).toHaveLength(2)
  expect(saves[0].p.input?.requestId).toBe(saves[1].p.input?.requestId)
  expect(state.copies).toHaveLength(1)
})
it('mismatched acknowledgment never claims success and retains review draft', async () => {
  const f = fixture()
  await open()
  await generate(f)
  state.bad = true
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(/Not confirmed/)
  expect(screen.getByRole('button', { name: 'Save recovered copy' })).toBeTruthy()
  expect(screen.queryByText(/Recovered copy saved on this Desktop/)).toBeNull()
})
it('account change during generation clears the preview and never saves', async () => {
  const f = fixture()
  await open()
  fireEvent.click(screen.getByRole('button', { name: 'Preview recovered notes' }))
  await waitFor(() => expect(f.jobs).toHaveLength(1))
  await act(async () => {
    state.owner = { uuid: 'B', email: 'b@example.invalid' }
    window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
  })
  await act(async () => {
    await f.jobs[0].messageFinishCallback?.(body)
  })
  expect(screen.queryByText(body)).toBeNull()
  expect(state.calls.some(v => v.cmd === 'desktop_recovered_save')).toBe(false)
})
it('provider failure preserves sources and performs no save or completion processing', async () => {
  const f = fixture()
  await open()
  fireEvent.click(screen.getByRole('button', { name: 'Preview recovered notes' }))
  await waitFor(() => expect(f.jobs).toHaveLength(1))
  await act(async () => {
    f.jobs[0].errorCallback?.(Error('synthetic failure'))
  })
  await screen.findByText(/Not confirmed/)
  expect(state.copies).toEqual([])
  expect(state.calls.map(v => v.cmd)).toEqual([
    'desktop_recovered_list',
    'desktop_recovered_prepare',
  ])
})
it('restore creates a new recovered version while keeping the old version', async () => {
  const f = fixture()
  await open()
  await generate(f)
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(/Recovered copy saved on this Desktop/)
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Restore this as a new recovered copy',
    }),
  )
  await screen.findByText(/Previous copy restored as a new Desktop-only version/)
  expect(state.copies).toHaveLength(2)
  expect(state.copies[0].restoredFrom).toBe(1)
  expect(state.copies[0].body).toBe(state.copies[1].body)
})

it('restore response loss keeps a single request and version on retry', async () => {
  const f = fixture()
  await open()
  await generate(f)
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText(/Recovered copy saved on this Desktop/)
  state.loseRestore = true
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Restore this as a new recovered copy',
    }),
  )
  await screen.findByText(/Not confirmed/)
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Restore this as a new recovered copy',
    }),
  )
  await screen.findByText(/Previous copy restored as a new Desktop-only version/)
  const requests = state.calls.filter(v => v.cmd === 'desktop_recovered_restore')
  expect(requests).toHaveLength(2)
  expect(requests[0].p.requestId).toBe(requests[1].p.requestId)
  expect(state.copies).toHaveLength(2)
})

it('native source conflict requires a fresh preview rather than claiming a save', async () => {
  const f = fixture()
  await open()
  await generate(f)
  state.sourceConflict = true
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText('Source changed. Preview again before saving; originals are unchanged.')
  expect(screen.queryByRole('button', { name: 'Save recovered copy' })).toBeNull()
  expect(state.copies).toHaveLength(0)
})

it('after reopening a transcript-only meeting, explicitly previews one job and saves a separate copy', async () => {
  state.sourceMissing = true
  const first = fixture(true)
  expect(screen.getByRole('button', { name: 'Create notes from saved transcript' })).toBeTruthy()
  expect(first.queue).not.toHaveBeenCalled()
  first.ui.unmount()

  const reopened = fixture(true)
  expect(screen.getByText(/Transcript saved. No original notes are saved/)).toBeTruthy()
  expect(reopened.queue).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Create notes from saved transcript' }))
  await screen.findByRole('button', { name: 'Preview recovered notes' })
  expect(reopened.queue).not.toHaveBeenCalled()
  await generate(reopened)
  expect(reopened.queue).toHaveBeenCalledTimes(1)
  expect(reopened.jobs[0].requestKind).toBe('notes')
  expect(reopened.jobs[0].additionalDocuments).toEqual([
    { title: 'Verified saved transcript', content: transcript },
    { title: 'Original saved notes (may include manual notes)', content: '' },
    { title: 'Current editor manual draft', content: draft },
  ])
  expect(state.calls.some(v => v.cmd === 'desktop_recovered_save')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Save recovered copy' }))
  await screen.findByText('Recovered copy saved on this Desktop. Original notes and transcript unchanged.')
  expect(state.copies[0].savedManual).toBeNull()
  expect(state.copies[0].draftManual).toBe(draft)
  reopened.ui.unmount()

  const third = fixture(true)
  fireEvent.click(screen.getByRole('button', { name: 'Create notes from saved transcript' }))
  await screen.findByText(body)
  expect(third.queue).not.toHaveBeenCalled()
  expect(state.copies).toHaveLength(1)
})
