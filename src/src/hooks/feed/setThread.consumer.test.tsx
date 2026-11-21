// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FeedItem } from 'src/api/feed_items'
import { ThreadType, type IThread } from 'src/api/threads'
import {
  assertNotesTemplateChangeAllowed,
  runNotesGenerationOnce,
  withNotesTemplateWrite,
} from 'src/utils/notesGenerationAdmission'
import { HttpError } from 'src/utils/retryUtils'
import ts from 'typescript'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('src/pages/onboarding/template', () => ({
  OnboardingPrimaryButton: () => null,
  OnboardingTemplate: () => null,
}))
afterEach(cleanup)
// Execute the real hook's producer with React state setters, without mounting its
// unrelated calendar/email effects. Do not duplicate the producer implementation.
const source = readFileSync(resolve(process.cwd(), 'src/hooks/feed/useFeed.tsx'), 'utf8')
const start = source.indexOf('  const setThread = async'),
  end = source.indexOf('\n  const updateFeedItemTitle', start)
if (start < 0 || end < start) throw Error('Real feed producer not found')
const code = ts.transpileModule(source.slice(start, end), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const factory = new Function(
  'setFeedContent',
  'setSelectedFeedItem',
  'updateThread',
  'HttpError',
  'logError',
  'handleErrorContact',
  'FeedItem',
  'withNotesTemplateWrite',
  code + '\nreturn setThread',
) as (
  feed: Dispatch<SetStateAction<Record<string, FeedItem[]>>>,
  selected: Dispatch<SetStateAction<FeedItem | null>>,
  update: ReturnType<typeof vi.fn>,
  http: typeof HttpError,
  log: ReturnType<typeof vi.fn>,
  error: ReturnType<typeof vi.fn>,
  item: typeof FeedItem,
  reserve: typeof withNotesTemplateWrite,
) => (thread: IThread, id?: number, current?: () => boolean) => Promise<boolean>
function fixture(fail = false) {
  const originalThread: IThread = {
    id: 8701,
    date: new Date(),
    messages: [],
    hideFollowUp: false,
    threadType: ThreadType.MEETING_NOTES,
    promptTemplate: 'INTERNAL_MEETING',
  }
  const original = new FeedItem({
    id: 871,
    timestamp: new Date(),
    threads: [originalThread],
    title: 'Synthetic meeting',
  })
  original.deleted = false
  const other = new FeedItem({
    id: 872,
    timestamp: new Date(),
    threads: [],
    title: 'Other synthetic meeting',
  })
  const update = vi.fn(async () => {
      if (fail) throw new HttpError(500, 'Synthetic failure')
      return true
    }),
    jobs = vi.fn(),
    error = vi.fn(),
    log = vi.fn()
  let pending: Promise<boolean> | undefined
  let guardedUpdate!: (current: () => boolean) => Promise<boolean>
  let seen: FeedItem | null = null
  let timeline: Record<string, FeedItem[]> = {}
  function Harness() {
    const [feed, setFeed] = useState<Record<string, FeedItem[]>>({ fixture: [original, other] }),
      [selected, setSelected] = useState<FeedItem | null>(original),
      [feedback, setFeedback] = useState('')
    const previous = useRef(selected?.threads?.[0].promptTemplate)
    seen = selected
    timeline = feed
    const setThread = factory(
      setFeed,
      setSelected,
      update,
      HttpError,
      log,
      error,
      FeedItem,
      withNotesTemplateWrite,
    )
    guardedUpdate = current =>
      setThread(
        { ...originalThread, promptTemplate: 'CLIENT_DISCOVERY_MEETING' },
        original.id,
        current,
      )
    const template = selected?.threads?.[0].promptTemplate
    useEffect(() => {
      if (previous.current !== template) jobs(template)
      previous.current = template
    }, [template])
    const select = () => {
      try {
        assertNotesTemplateChangeAllowed(originalThread.id)
        pending = setThread(
          { ...originalThread, promptTemplate: 'CLIENT_DISCOVERY_MEETING' },
          original.id,
        )
      } catch (e) {
        setFeedback(String(e))
      }
    }
    return (
      <>
        <button onClick={select}>Select B</button>
        <output>{selected?.threads?.[0].promptTemplate}</output>
        {feedback && <p role="alert">{feedback}</p>}
      </>
    )
  }
  const view = render(<Harness />)
  return {
    original,
    originalThread,
    other,
    update,
    jobs,
    error,
    log,
    view,
    selected: () => seen,
    timeline: () => timeline,
    done: async () => {
      await pending
    },
    guardedUpdate: (current: () => boolean) => guardedUpdate(current),
    invalid: async () => {
      const f = factory(
        vi.fn(),
        vi.fn(),
        update,
        HttpError,
        log,
        error,
        FeedItem,
        withNotesTemplateWrite,
      )
      await f(originalThread, undefined)
    },
  }
}
it('real setThread delivers a cloned template to both timeline and selected consumer exactly once', async () => {
  const f = fixture()
  fireEvent.click(screen.getByText('Select B'))
  await act(f.done)
  await waitFor(() => expect(screen.getByText('CLIENT_DISCOVERY_MEETING')).toBeTruthy())
  expect(f.timeline().fixture[0].threads?.[0].promptTemplate).toBe('CLIENT_DISCOVERY_MEETING')
  expect(f.jobs).toHaveBeenCalledExactlyOnceWith('CLIENT_DISCOVERY_MEETING')
  expect(f.update).toHaveBeenCalledOnce()
  expect(f.selected()).toBeInstanceOf(FeedItem)
  expect(f.selected()?.getTitle()).toBe('Synthetic meeting')
  expect(f.selected()?.deleted).toBe(false)
  expect(f.original.threads?.[0]).toBe(f.originalThread)
  expect(f.originalThread.promptTemplate).toBe('INTERNAL_MEETING')
  expect(f.timeline().fixture[1]).toBe(f.other)
})
it('busy refusal reaches neither the real producer state nor backend; later explicit selection works', async () => {
  const f = fixture()
  let finish!: () => void
  const active = runNotesGenerationOnce(
    f.originalThread.id,
    'synthetic',
    () =>
      new Promise<void>(r => {
        finish = r
      }),
    'A',
  )
  await act(async () => undefined)
  fireEvent.click(screen.getByText('Select B'))
  expect(f.update).not.toHaveBeenCalled()
  expect(f.selected()).toBe(f.original)
  expect(f.jobs).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toBeTruthy()
  await act(async () => {
    finish()
    await active
  })
  fireEvent.click(screen.getByText('Select B'))
  await act(f.done)
  expect(f.jobs).toHaveBeenCalledOnce()
})
it('keeps invalid-input no-write behavior and existing HttpError reporting without mutating original snapshots', async () => {
  const f = fixture(true)
  await f.invalid()
  expect(f.update).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText('Select B'))
  await act(f.done)
  expect(f.update).toHaveBeenCalledOnce()
  expect(f.error).toHaveBeenCalledExactlyOnceWith('Error updating Thread, please try again.')
  expect(f.selected()).toBe(f.original)
  expect(f.jobs).not.toHaveBeenCalled()
  expect(f.originalThread.promptTemplate).toBe('INTERNAL_MEETING')
})

it('a pending thread write is reserved until acknowledgement even for a remounted caller', async () => {
  const f = fixture()
  let resolve!: (value: boolean) => void
  f.update.mockImplementationOnce(
    () =>
      new Promise<boolean>(r => {
        resolve = r
      }),
  )
  const first = f.guardedUpdate(() => true)
  await act(async () => undefined)
  const second = await f.guardedUpdate(() => true)
  expect(second).toBe(false)
  expect(f.update).toHaveBeenCalledOnce()
  await act(async () => {
    resolve(true)
    await first
  })
})
it('scope invalidation while backend acknowledgement is pending refuses local publication', async () => {
  const f = fixture()
  let resolve!: (value: boolean) => void,
    current = true
  f.update.mockImplementationOnce(
    () =>
      new Promise<boolean>(r => {
        resolve = r
      }),
  )
  const write = f.guardedUpdate(() => current)
  await act(async () => undefined)
  current = false
  let saved: boolean | undefined
  await act(async () => {
    resolve(true)
    saved = await write
  })
  expect(saved).toBe(false)
  expect(f.update).toHaveBeenCalledOnce()
  expect(f.selected()).toBe(f.original)
  expect(f.jobs).not.toHaveBeenCalled()
})
