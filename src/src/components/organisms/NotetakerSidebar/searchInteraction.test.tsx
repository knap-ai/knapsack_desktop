// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { TabChoices } from 'src/components/TabBar'

import NotetakerSidebar from './index'

vi.mock('src/hooks/feed/useFeed', () => ({ STATIONARY_ITEMS: 'stationary' }))
vi.mock('src/utils/relationshipTimeline', () => ({
  workspaceDisplayName: (ws: { name: string }) => ws.name,
}))
vi.mock('./useScopedLibrarySearch', () => ({
  useScopedLibrarySearch: () => ({
    results: [{ uuid: 'person-one', name: 'Synthetic person' }],
    loading: false,
    error: false,
  }),
}))
vi.mock('src/agents/teamRoster', () => ({
  getPrimaryScout: () => ({ id: 'scout', name: 'Scout', emoji: 'S' }),
  createTeamAgent: vi.fn(),
  createTeamGroup: vi.fn(),
  saveTeamGroups: vi.fn(),
  saveTeamRoster: vi.fn(),
  nextCustomAgentBrowserProfile: vi.fn(),
}))
vi.mock('src/api/connections', () => ({ hasCalendarCapability: () => false }))
vi.mock('./MeetingChatAvailableButton', () => ({
  default: () => null,
  findStoredMeetingChatThreadId: () => undefined,
}))
vi.mock('src/api/recording', () => ({ isRecordingStatus: () => false }))
class SearchPointerEvent extends MouseEvent {
  isPrimary = true
}
beforeEach(() => vi.stubGlobal('PointerEvent', SearchPointerEvent))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
function setup() {
  const selectFeedItem = vi.fn(),
    onTabChange = vi.fn(),
    onLibraryWorkspaceOpen = vi.fn()
  const item = {
    id: 42,
    title: 'Synthetic meeting',
    timestamp: new Date('2026-11-20T18:00:00Z'),
    threads: [],
    getTitle: () => 'Synthetic meeting',
    getSubtitle: () => '',
  }
  render(
    <>
      <NotetakerSidebar
        feed={
          {
            feedContent: { '2026-11-20': [item] },
            currentFeedItem: () => undefined,
            selectFeedItem,
          } as never
        }
        connections={{}}
        currentTab={TabChoices.Openclaw}
        onTabChange={onTabChange}
        onQuickNote={vi.fn()}
        onConnectCalendar={vi.fn()}
        onLibraryWorkspaceOpen={onLibraryWorkspaceOpen}
      />
      <button>Outside</button>
    </>,
  )
  const input = screen.getByRole('textbox', {
    name: 'Search meetings and library',
  }) as HTMLInputElement
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: 'Synthetic' } })
  return {
    input,
    region: screen.getByRole('region', { name: 'Search results' }),
    selectFeedItem,
    onTabChange,
    onLibraryWorkspaceOpen,
  }
}
for (const kind of ['meeting', 'person'])
  it(`delivers actual ${kind} navigation after down, null blur, up and click`, () => {
    const s = setup(),
      button = within(s.region).getByRole('button', { name: new RegExp('Synthetic ' + kind) })
    const defaultAllowed = fireEvent.mouseDown(button, { button: 0, clientX: 10, clientY: 10 })
    fireEvent.blur(s.input, { relatedTarget: null })
    expect(button.isConnected).toBe(true)
    expect(defaultAllowed).toBe(false)
    expect(s.onTabChange).not.toHaveBeenCalled()
    fireEvent.mouseUp(button, { button: 0 })
    fireEvent.click(button, { button: 0, detail: 1 })
    if (kind === 'meeting') {
      expect(s.selectFeedItem).toHaveBeenCalledExactlyOnceWith('2026-11-20', 42)
      expect(s.onTabChange).toHaveBeenCalledExactlyOnceWith(TabChoices.Meeting, 'meetings')
    } else {
      expect(s.onLibraryWorkspaceOpen).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ uuid: 'person-one' }),
      )
      expect(s.onTabChange).toHaveBeenCalledExactlyOnceWith(TabChoices.Library)
    }
    expect(s.input.value).toBe('')
    expect(screen.queryByRole('region', { name: 'Search results' })).toBeNull()
  })
it.each(['drag', 'scroll', 'wheel', 'secondary', 'controlClick', 'cancel'])(
  'does not activate on %s',
  kind => {
    const s = setup(),
      button = within(s.region).getByRole('button', { name: /Synthetic meeting/ })
    fireEvent.mouseDown(button, {
      button: kind === 'secondary' ? 2 : 0,
      clientX: 10,
      clientY: 10,
      ctrlKey: kind === 'controlClick',
    })
    if (kind === 'drag') fireEvent.mouseMove(document, { clientX: 40, clientY: 10 })
    if (kind === 'scroll') fireEvent.scroll(s.region)
    if (kind === 'wheel') fireEvent.wheel(s.region)
    if (kind === 'cancel') fireEvent.pointerCancel(button)
    fireEvent.mouseUp(button)
    fireEvent.click(button, {
      button: kind === 'secondary' ? 2 : 0,
      ctrlKey: kind === 'controlClick',
      detail: 1,
    })
    expect(s.selectFeedItem).not.toHaveBeenCalled()
    expect(s.onLibraryWorkspaceOpen).not.toHaveBeenCalled()
    expect(s.input.value).toBe('Synthetic')
  },
)
it('retains Escape, focus-leave/outside dismissal, typed query and keyboard/AT activation', () => {
  const s = setup()
  fireEvent.keyDown(s.input, { key: 'ArrowDown' })
  const first = within(s.region).getAllByRole('button')[0]
  expect(document.activeElement).toBe(first)
  fireEvent.keyDown(first, { key: 'Escape' })
  expect(screen.queryByRole('region', { name: 'Search results' })).toBeNull()
  expect(s.input.value).toBe('Synthetic')
  fireEvent.focus(s.input)
  fireEvent.blur(s.input, { relatedTarget: screen.getByRole('button', { name: 'Outside' }) })
  expect(screen.queryByRole('region', { name: 'Search results' })).toBeNull()
  fireEvent.focus(s.input)
  fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
  expect(screen.queryByRole('region', { name: 'Search results' })).toBeNull()
  fireEvent.focus(s.input)
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search results' })).getByRole('button', {
      name: /Synthetic person/,
    }),
    { detail: 0 },
  )
  expect(s.onLibraryWorkspaceOpen).toHaveBeenCalledOnce()
})

it('supports touch pointer focus transfer without preventing scrolling', () => {
  class FixturePointerEvent extends MouseEvent {
    isPrimary: boolean
    pointerType: string
    constructor(
      type: string,
      init: MouseEventInit & { isPrimary?: boolean; pointerType?: string } = {},
    ) {
      super(type, init)
      this.isPrimary = init.isPrimary ?? true
      this.pointerType = init.pointerType ?? 'touch'
    }
  }
  vi.stubGlobal('PointerEvent', FixturePointerEvent)
  try {
    const s = setup(),
      button = within(s.region).getByRole('button', { name: /Synthetic person/ })
    expect(
      fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10, pointerType: 'touch' }),
    ).toBe(true)
    fireEvent.blur(s.input, { relatedTarget: null })
    expect(button.isConnected).toBe(true)
    fireEvent.pointerUp(button, { button: 0 })
    fireEvent.click(button, { button: 0, detail: 1 })
    expect(s.onLibraryWorkspaceOpen).toHaveBeenCalledOnce()
  } finally {
    vi.unstubAllGlobals()
  }
})

it('compatibility mouse after cancelled pointer gesture must not activate', () => {
  const s = setup(),
    button = within(s.region).getByRole('button', { name: /Synthetic meeting/ })
  fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10 })
  fireEvent.scroll(s.region)
  fireEvent.pointerUp(button, { button: 0 })
  fireEvent.mouseDown(button, { button: 0, clientX: 10, clientY: 10 })
  fireEvent.mouseUp(button, { button: 0 })
  fireEvent.click(button, { button: 0, detail: 1 })
  expect(s.selectFeedItem).not.toHaveBeenCalled()
})

it('genuine new pointerdown resets prior cancellation', () => {
  class FixturePointerEvent extends MouseEvent {
    isPrimary = true
  }
  vi.stubGlobal('PointerEvent', FixturePointerEvent)
  const s = setup(),
    button = within(s.region).getByRole('button', { name: /Synthetic meeting/ })
  fireEvent.pointerDown(button, { button: 0 })
  fireEvent.scroll(s.region)
  fireEvent.pointerUp(button, { button: 0 })
  fireEvent.mouseDown(button, { button: 0 })
  fireEvent.mouseUp(button, { button: 0 })
  fireEvent.click(button, { button: 0, detail: 1 })
  expect(s.selectFeedItem).not.toHaveBeenCalled()
  fireEvent.pointerDown(button, { button: 0 })
  fireEvent.mouseDown(button, { button: 0 })
  fireEvent.pointerUp(button, { button: 0 })
  fireEvent.mouseUp(button, { button: 0 })
  fireEvent.click(button, { button: 0, detail: 1 })
  expect(s.selectFeedItem).toHaveBeenCalledExactlyOnceWith('2026-11-20', 42)
  vi.unstubAllGlobals()
})
