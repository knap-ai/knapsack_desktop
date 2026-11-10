// @vitest-environment jsdom
import { useState } from 'react'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NameCorrection } from 'src/utils/nameCorrections'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { useNotesEditReview } from './useNotesEditReview'

function fixture(count: number, override?: { mappings: NameCorrection[]; notes: string }) {
  const letters = (n: number) => String.fromCharCode(97 + Math.floor(n / 26), 97 + (n % 26))
  const mappings: NameCorrection[] =
    override?.mappings ||
    Array.from({ length: count }, (_, i) => ({
      from: `N${letters(i)}`,
      to: `P${letters(i)}`,
      enabled: true,
      source: 'explicit',
      createdAt: 1,
    }))
  const original = override?.notes ?? mappings.map(v => `${v.from} owns review.`).join('\n\n')
  let notes = original,
    revision = 'r0',
    counter = 0,
    memory = JSON.stringify(mappings),
    api: ReturnType<typeof useNotesEditReview>
  const archives = new Map<string, { notes: string; revision: string }>()
  const writes: Record<string, string>[] = []
  const queue = vi.fn()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method)
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { thread_id: 42, exists: true, notes, revision },
          }),
        }
      const request = JSON.parse(String(init.body))
      writes.push(request)
      if (request.expected_revision !== revision)
        return {
          ok: false,
          json: async () => ({ success: false, error: 'Backend revision changed.' }),
        }
      const before = { notes, revision }
      if (request.restore_revision) {
        const old = archives.get(request.restore_revision)!
        notes = old.notes
        revision = old.revision
      } else {
        notes = request.notes
        revision = `r${++counter}`
      }
      const revision_id = `archive${archives.size}`
      archives.set(revision_id, before)
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: { thread_id: 42, notes, revision, revision_id },
        }),
      }
    }),
  )
  function Harness({ context = 'meeting' }: { context?: string }) {
    const [editor, setEditor] = useState(notes)
    api = useNotesEditReview({
      accountScope: 'synthetic', threadId: 42,
      completed: true,
      notes: editor,
      context,
      queue,
      flush: async () => {},
      saved: setEditor,
      spellings: () => memory,
    })
    return (
      <>
        {api.review}
        <output aria-label="Saved editor">{editor}</output>
      </>
    )
  }
  let ui = render(<Harness />)
  return {
    original,
    remount: () => {
      ui.unmount()
      ui = render(<Harness />)
    },
    mappings,
    writes,
    queue,
    prepare: () => api.prepareSpellings(mappings),
    saved: () => notes,
    disable: () => {
      memory = '[]'
    },
    contextChange: () => ui.rerender(<Harness context="changed" />),
    externalEdit: () => {
      revision = 'external'
    },
  }
}
beforeEach(() => localStorage.clear())
afterEach(cleanup)
it.each([30, 31, 100])(
  'supports %i mappings through fresh selectable batches and can undo every applied batch',
  async count => {
    const f = fixture(count)
    await act(async () => {
      await f.prepare()
    })
    expect(screen.getAllByRole('checkbox')).toHaveLength(Math.min(30, count))
    let batches = 0
    while (screen.queryByText('Apply to saved notes')) {
      fireEvent.click(screen.getByText('Apply to saved notes'))
      batches++
      await waitFor(() => expect(f.writes).toHaveLength(batches))
      await waitFor(() => expect(screen.queryByText('Apply to saved notes')).toBeNull())
      const next = screen.queryByText('Review next spelling batch')
      if (next) {
        fireEvent.click(next)
        await waitFor(() => expect(screen.getByText('Apply to saved notes')).toBeTruthy())
      } else break
    }
    expect(batches).toBe(Math.ceil(count / 30))
    expect(f.saved()).toBe(f.mappings.map(v => `${v.to} owns review.`).join('\n\n'))
    for (let i = 0; i < batches; i++) {
      fireEvent.click(screen.getByText('Undo notes edit'))
      await waitFor(() => expect(f.writes).toHaveLength(batches + i + 1))
      await waitFor(() =>
        expect(screen.queryByText('Preparing or saving notes revision…')).toBeNull(),
      )
    }
    expect(f.saved()).toBe(f.original)
    expect(f.queue).not.toHaveBeenCalled()
  },
)
it('preserves unchecked occurrences, shows context and a remaining count, then offers them in the next batch', async () => {
  const f = fixture(31)
  await act(async () => {
    await f.prepare()
  })
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  expect(screen.getByText(/29 selected in this batch; 2 remaining/)).toBeTruthy()
  expect(screen.getAllByText(/owns review/).length).toBeGreaterThan(1)
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  expect(f.saved()).toContain(f.mappings[0].from)
  fireEvent.click(screen.getByText('Review next spelling batch'))
  await waitFor(() => expect(screen.getAllByRole('checkbox')).toHaveLength(2))
})
it.each(['mapping', 'context', 'backend'])(
  'rechecks stale %s state before applying a follow-on batch',
  async kind => {
    const f = fixture(31)
    await act(async () => {
      await f.prepare()
    })
    fireEvent.click(screen.getByText('Apply to saved notes'))
    await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
    fireEvent.click(screen.getByText('Review next spelling batch'))
    await waitFor(() => expect(screen.getByText('Apply to saved notes')).toBeTruthy())
    if (kind === 'mapping') f.disable()
    else if (kind === 'context') f.contextChange()
    else f.externalEdit()
    fireEvent.click(screen.getByText('Apply to saved notes'))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/changed/i))
    expect(f.saved()).toContain(f.mappings[30].from)
    expect(f.writes).toHaveLength(kind === 'backend' ? 2 : 1)
  },
)
it('can inspect and select a later batch without applying unwanted earlier matches', async () => {
  const f = fixture(100)
  await act(async () => {
    await f.prepare()
  })
  for (let page = 0; page < 3; page++) fireEvent.click(screen.getByText('Review later matches'))
  expect(screen.getAllByRole('checkbox')).toHaveLength(10)
  expect(screen.getByText(/Showing occurrences 91–100 of 100/)).toBeTruthy()
  expect(f.writes).toHaveLength(0)
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  expect(screen.getByText(/9 selected in this batch; 91 remaining/)).toBeTruthy()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  for (let i = 0; i <= 90; i++) expect(f.saved()).toContain(f.mappings[i].from)
  for (let i = 91; i < 100; i++) expect(f.saved()).toContain(f.mappings[i].to)
  fireEvent.click(screen.getByText('Undo notes edit'))
  await waitFor(() => expect(f.saved()).toBe(f.original))
})

it('discards legacy spelling proposals that could contain unsafe Markdown replacements', () => {
  const original = '    Jhon.run()'
  localStorage.setItem(
    'meeting-notes-edit:synthetic:42',
    JSON.stringify({
      accountScope: 'synthetic', threadId: 42,
      request: 'Review remembered name spellings',
      base: original,
      revision: 'base',
      editor: original,
      context: 'meeting',
      spellings: JSON.stringify([
        { from: 'Jhon', to: 'John', enabled: true, source: 'explicit', createdAt: 1 },
      ]),
      proposal: {
        edits: [{ before: 'Jhon', after: 'John', reason: 'old preview' }],
        ambiguities: [],
        notes: '    John.run()',
      },
    }),
  )
  function Harness() {
    return useNotesEditReview({
      accountScope: 'synthetic', threadId: 42,
      completed: true,
      notes: original,
      context: 'meeting',
      queue: vi.fn(),
      flush: async () => {},
      saved: vi.fn(),
    }).review
  }
  render(<Harness />)
  expect(screen.queryByText('Apply to saved notes')).toBeNull()
})

it('rebuilds restored parsed previews and retains successive batch undo across remounts', async () => {
  const f = fixture(31)
  await act(async () => {
    await f.prepare()
  })
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  fireEvent.click(screen.getByText('Review next spelling batch'))
  await waitFor(() => expect(screen.getAllByRole('checkbox')).toHaveLength(1))
  f.remount()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(f.writes).toHaveLength(2))
  await waitFor(() => expect(screen.queryByText('Apply to saved notes')).toBeNull())
  f.remount()
  for (let i = 0; i < 2; i++) {
    fireEvent.click(screen.getByText('Undo notes edit'))
    await waitFor(() => expect(f.writes).toHaveLength(3 + i))
    await waitFor(() =>
      expect(screen.queryByText('Preparing or saving notes revision…')).toBeNull(),
    )
  }
  expect(f.saved()).toBe(f.original)
})

it.each([
  ['Anne', 'Anne Marie'],
  ['Anne', 'Marie Anne'],
  ['Anne Marie', 'Anne Marie Smith'],
  ['Anne Marie', 'Dr Anne Marie'],
  ['Anne Marie', 'Anne'],
  ['knapsack', 'Knapsack'],
])('keeps %s → %s idempotent through apply, re-preview, next batch and undo', async (from, to) => {
  const mappings: NameCorrection[] = [{ from, to, enabled: true, source: 'explicit', createdAt: 1 }]
  const f = fixture(0, {
    mappings,
    notes: `${from} owns review. ${to} owns pricing. ${from} follows up.`,
  })
  await act(async () => {
    await f.prepare()
  })
  expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  fireEvent.click(screen.getAllByRole('checkbox')[1])
  expect(screen.getByText(/1 selected in this batch; 1 remaining/)).toBeTruthy()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(screen.getByText('Review next spelling batch')).toBeTruthy())
  expect(f.saved()).toBe(`${to} owns review. ${to} owns pricing. ${from} follows up.`)
  fireEvent.click(screen.getByText('Review next spelling batch'))
  await waitFor(() => expect(screen.getAllByRole('checkbox')).toHaveLength(1))
  expect(screen.getByText(/1 selected in this batch; 0 remaining/)).toBeTruthy()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(f.writes).toHaveLength(2))
  await waitFor(() => expect(screen.queryByText('Apply to saved notes')).toBeNull())
  expect(f.saved()).toBe(`${to} owns review. ${to} owns pricing. ${to} follows up.`)
  expect(screen.queryByText('Review next spelling batch')).toBeNull()
  await act(async () => {
    await f.prepare()
  })
  expect(screen.queryByText('Apply to saved notes')).toBeNull()
  expect(f.writes).toHaveLength(2)
  for (let i = 0; i < 2; i++) {
    fireEvent.click(screen.getByText('Undo notes edit'))
    await waitFor(() => expect(f.writes).toHaveLength(3 + i))
    await waitFor(() =>
      expect(screen.queryByText('Preparing or saving notes revision…')).toBeNull(),
    )
  }
  expect(f.saved()).toBe(f.original)
})
it('does not offer a false follow-on batch for the single Anne expansion example', async () => {
  const mappings: NameCorrection[] = [
    { from: 'Anne', to: 'Anne Marie', enabled: true, source: 'explicit', createdAt: 1 },
  ]
  const f = fixture(0, { mappings, notes: 'Anne owns review.' })
  await act(async () => {
    await f.prepare()
  })
  expect(screen.getByText(/1 selected in this batch; 0 remaining/)).toBeTruthy()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(f.saved()).toBe('Anne Marie owns review.'))
  expect(screen.queryByText('Review next spelling batch')).toBeNull()
  await act(async () => {
    await f.prepare()
  })
  expect(screen.queryByText('Apply to saved notes')).toBeNull()
  expect(f.writes).toHaveLength(1)
  fireEvent.click(screen.getByText('Undo notes edit'))
  await waitFor(() => expect(f.saved()).toBe('Anne owns review.'))
})
it('uses whole rendered names and full sentence context in the actual review UI', async () => {
  const mappings: NameCorrection[] = [
    { from: 'Jhon', to: 'John', enabled: true, source: 'explicit', createdAt: 1 },
  ]
  const f = fixture(0, { mappings, notes: '🚀 Met **Jhon** yesterday. **Jhon**son owns review.' })
  await act(async () => {
    await f.prepare()
  })
  expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  const description = screen.getByRole('checkbox').getAttribute('aria-describedby')!
  expect(document.getElementById(description)?.textContent).toContain(
    '🚀 Met Jhon → John yesterday. Jhonson owns review.',
  )
  expect(document.getElementById(description)?.textContent).toContain('Source line 1, column')
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() => expect(f.saved()).toBe('🚀 Met **John** yesterday. **Jhon**son owns review.'))
  expect(screen.queryByText('Review next spelling batch')).toBeNull()
  fireEvent.click(screen.getByText('Undo notes edit'))
  await waitFor(() => expect(f.saved()).toBe(f.original))
})
it('keeps canonical possessive names out of proposed and follow-on batches', async () => {
  const mappings: NameCorrection[] = [
    { from: 'Anne', to: 'Anne Marie', enabled: true, source: 'explicit', createdAt: 1 },
  ]
  const f = fixture(0, { mappings, notes: 'Anne owns review. Anne Marie’s pricing is ready.' })
  await act(async () => {
    await f.prepare()
  })
  expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  expect(screen.getByText(/1 selected in this batch; 0 remaining/)).toBeTruthy()
  fireEvent.click(screen.getByText('Apply to saved notes'))
  await waitFor(() =>
    expect(f.saved()).toBe('Anne Marie owns review. Anne Marie’s pricing is ready.'),
  )
  expect(screen.queryByText('Review next spelling batch')).toBeNull()
  fireEvent.click(screen.getByText('Undo notes edit'))
  await waitFor(() => expect(f.saved()).toBe(f.original))
})
