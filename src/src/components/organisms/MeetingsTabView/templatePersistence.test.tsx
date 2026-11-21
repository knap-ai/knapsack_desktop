// @vitest-environment jsdom
import type { ComponentProps } from 'react'

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ThreadType, type IThread } from 'src/api/threads'
import { NotesGeneration } from 'src/utils/notesGeneration'
import { runNotesGenerationOnce } from 'src/utils/notesGenerationAdmission'
import { PROFILE_CHANGED_EVENT } from 'src/utils/profileScope'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import CenterWorkspace from '../CenterWorkspace'
import MeetingsTabView from './index'

// Onboarding is an irrelevant transitive child of these parents. Its root-relative
// logo import is not portable in the Windows test loader; keep it outside this fixture.
vi.mock('src/pages/onboarding/template', () => ({
  OnboardingPrimaryButton: () => null,
  OnboardingTemplate: () => null,
}))
vi.mock('@tauri-apps/api/event', () => ({ listen: async () => () => undefined, emit: vi.fn() }))
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(async () => ({ all_granted: true, microphone: true, screen_recording: true })),
}))
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: vi.fn(async () => null), setItem: vi.fn() },
}))
vi.mock('src/components/organisms/MeetingNotesMode', () => ({
  default: (p: { thread: IThread; handleOpenTemplates: (thread: IThread) => Promise<void> }) => (
    <div>
      <p>Saved notes from A</p>
      <output aria-label="Persisted template">{p.thread.promptTemplate}</output>
      <button onClick={() => p.handleOpenTemplates(p.thread)}>Notes template picker</button>
    </div>
  ),
}))
vi.mock('src/components/organisms/TranscriptView', () => ({ default: () => null }))
vi.mock('src/components/organisms/InsightsView', () => ({ default: () => null }))
let nextId = 9200
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
afterEach(cleanup)
function fixture(legacy = false) {
  const id = nextId++,
    snapshot: IThread = {
      id,
      date: new Date(),
      messages: [],
      hideFollowUp: false,
      promptTemplate: 'INTERNAL_MEETING',
      threadType: ThreadType.MEETING_NOTES,
      recorded: true,
    }
  const item = {
    id: 22,
    threads: [{ ...snapshot }],
    timestamp: new Date(),
    getCalendarEvent: () => undefined,
  }
  const originalThread = item.threads[0]
  const persist = vi.fn((thread: IThread) => {
    Object.assign(snapshot, thread)
    item.threads = [{ ...snapshot }]
  })
  const feed = {
    currentFeedItem: () => item,
    setThread: persist,
    feedContent: {},
    meetings: {},
    classifiedEmails: {},
    loggedEmailAutopilot: true,
    subTab: 'Workspace',
  }
  const props = {
    feed,
    recordingHandlers: { isRecording: () => false },
    addToLLMQueue: vi.fn(),
    copyToClipboard: vi.fn(),
    handleErrorContact: vi.fn(),
    userEmail: 'fixture@example.invalid',
  } as unknown as ComponentProps<typeof MeetingsTabView> & ComponentProps<typeof CenterWorkspace>
  const Screen = legacy ? CenterWorkspace : MeetingsTabView
  let view = render(<Screen {...props} />)
  const remount = () => {
    view.unmount()
    item.threads = [{ ...snapshot }]
    view = render(<Screen {...props} />)
  }
  return {
    id,
    persist,
    snapshot,
    originalThread,
    props,
    remount,
    changeMeeting: () => {
      item.threads = [{ ...snapshot, id: 9999 }]
    },
    get view() {
      return view
    },
  }
}
async function open(entry: string) {
  fireEvent.click(
    entry === 'header'
      ? screen.getByTitle('Choose summary template')
      : screen.getByText('Notes template picker'),
  )
  await screen.findByText('Client Discovery Meeting')
}
async function chooseB() {
  fireEvent.click(screen.getByText('Client Discovery Meeting'))
  await act(async () => undefined)
}
it.each(['header', 'notes'])(
  'refuses a persisted selection from %s while A is admitted, including remount and failed A',
  async entry => {
    const f = fixture()
    await open(entry)
    let reject!: (e: Error) => void
    const work = runNotesGenerationOnce(
      f.id,
      'fixture-owner',
      () =>
        new Promise<void>((_r, j) => {
          reject = j
        }),
      'A',
    )
    void work.catch(() => undefined)
    await act(async () => undefined)
    await chooseB()
    expect(f.persist).not.toHaveBeenCalled()
    expect(
      screen
        .getByPlaceholderText('Add any specific instructions here...')
        .closest('.cursor-pointer')?.textContent,
    ).toContain('Internal Meeting')
    expect(f.snapshot.promptTemplate).toBe('INTERNAL_MEETING')
    expect(screen.getByRole('alert').textContent).toMatch(/generation.*running/i)
    f.remount()
    expect(screen.getByLabelText('Persisted template').textContent).toBe('INTERNAL_MEETING')
    await act(async () => {
      reject(Error('Synthetic A failure'))
      await work.catch(() => undefined)
    })
    await open(entry)
    await chooseB()
    expect(f.persist).toHaveBeenCalledOnce()
    expect(f.snapshot.promptTemplate).toBe('CLIENT_DISCOVERY_MEETING')
  },
)
it('refuses an account change after the picker opened', async () => {
  const f = fixture()
  await open('header')
  act(() => window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT)))
  await chooseB()
  expect(f.persist).not.toHaveBeenCalled()
  expect(f.snapshot.promptTemplate).toBe('INTERNAL_MEETING')
  expect(screen.getByRole('alert')).toBeTruthy()
})
it('persists a new thread object after an idle selection', async () => {
  const f = fixture()
  await open('notes')
  await chooseB()
  expect(f.persist).toHaveBeenCalledOnce()
  expect(f.snapshot.promptTemplate).toBe('CLIENT_DISCOVERY_MEETING')
  expect(f.originalThread.promptTemplate).toBe('INTERNAL_MEETING')
})

it('refuses persisted selection and remount while a submitted save outlives generation', async () => {
  const f = fixture()
  let finish!: () => void
  const generation = new NotesGeneration(f.id)
  const commit = new Promise<void>(r => {
    finish = r
  })
  const write = generation.write(() => commit)
  void write.catch(() => undefined)
  await act(async () => undefined)
  generation.cancel(new Error('Synthetic view closed'))
  generation.finish()
  await act(async () => {
    await write.catch(() => undefined)
  })
  await open('header')
  await chooseB()
  expect(f.persist).not.toHaveBeenCalled()
  f.remount()
  expect(screen.getByLabelText('Persisted template').textContent).toBe('INTERNAL_MEETING')
  await open('notes')
  await chooseB()
  expect(f.persist).not.toHaveBeenCalled()
  await act(async () => {
    finish()
    await commit
  })
  await chooseB()
  expect(f.persist).toHaveBeenCalledOnce()
})
it('pre-existing limitation: idle B persists before its later generation outcome is known', async () => {
  const f = fixture()
  await open('header')
  await chooseB()
  // The old and new parents receive no generation success result. This characterizes
  // the pre-existing idle-selection contract, not the active-generation regression.
  const failed = runNotesGenerationOnce(
    f.id,
    'fixture-owner',
    () => Promise.reject(Error('Synthetic idle B failure')),
    'B',
  )
  await act(async () => {
    await failed.catch(() => undefined)
  })
  f.remount()
  expect(f.snapshot.promptTemplate).toBe('CLIENT_DISCOVERY_MEETING')
  expect(screen.getByText('Saved notes from A')).toBeTruthy()
})

it('the legacy parent also refuses persistence through its notes picker until generation settles', async () => {
  const f = fixture(true)
  await open('notes')
  let finish!: () => void
  const work = runNotesGenerationOnce(
    f.id,
    'fixture-owner',
    () =>
      new Promise<void>(r => {
        finish = r
      }),
    'A',
  )
  await act(async () => undefined)
  await chooseB()
  expect(f.persist).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toBeTruthy()
  await act(async () => {
    finish()
    await work
  })
  await chooseB()
  expect(f.persist).toHaveBeenCalledOnce()
})

it('refuses a stale picker after the current meeting changes', async () => {
  const f = fixture()
  await open('header')
  f.changeMeeting()
  await chooseB()
  expect(f.persist).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toBeTruthy()
})

it('does not block a different thread merely because another generation is running', async () => {
  const f = fixture()
  let finish!: () => void
  const work = runNotesGenerationOnce(
    f.id + 100000,
    'fixture-owner',
    () =>
      new Promise<void>(r => {
        finish = r
      }),
    'A',
  )
  await act(async () => undefined)
  await open('header')
  await chooseB()
  expect(f.persist).toHaveBeenCalledOnce()
  await act(async () => {
    finish()
    await work
  })
})

it('blocks before the admitted generation preflight has even started', async () => {
  const f = fixture()
  await open('header')
  let finish!: () => void
  const workBody = vi.fn(
    () =>
      new Promise<void>(r => {
        finish = r
      }),
  )
  const work = runNotesGenerationOnce(f.id, 'fixture-owner', workBody, 'A')
  expect(workBody).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('Client Discovery Meeting'))
  expect(f.persist).not.toHaveBeenCalled()
  await act(async () => undefined)
  expect(screen.getByRole('alert')).toBeTruthy()
  await act(async () => {
    finish()
    await work
  })
})
