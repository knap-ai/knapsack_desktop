import NotetakerSidebar from 'src/components/organisms/NotetakerSidebar'
import { TabChoices } from 'src/components/TabBar'

/** Actual sidebar/search hook. Feed and navigation consumers are synthetic. */
export async function runSearchSidebarProbe(
  container: HTMLElement,
  render: (element: JSX.Element | null) => void,
) {
  const check = (value: unknown) => {
    if (!value) throw new Error('qa_search_assertion')
  }
  const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))
  const until = async (test: () => boolean) => {
    const deadline = Date.now() + 700
    while (!test()) {
      check(Date.now() < deadline)
      await tick()
    }
  }
  const calls: unknown[][] = []
  const item = {
    id: 900201,
    title: 'Fictional search meeting',
    timestamp: new Date('2026-11-20T18:00:00Z'),
    threads: [],
    getTitle: () => 'Fictional search meeting',
    getSubtitle: () => '',
  }
  let serial = 0
  const setup = async () => {
    calls.length = 0
    render(
      <>
        <NotetakerSidebar
          key={++serial}
          feed={
            {
              feedContent: { '2026-11-20': [item] },
              currentFeedItem: () => undefined,
              selectFeedItem: (key: string, id: number) => calls.push(['meeting', key, id]),
            } as never
          }
          teamAgents={[
            {
              id: 'scout',
              name: 'Fictional agent',
              emoji: 'S',
              personality: 'Synthetic',
              soul: 'Synthetic',
              browserProfile: 'qa-only',
              suggestedPrompts: [],
            },
          ]}
          connections={{}}
          currentTab={TabChoices.Openclaw}
          onTabChange={(tab, subview) => calls.push(['tab', tab, subview])}
          onQuickNote={() => {
            throw new Error('qa_unexpected_navigation')
          }}
          onConnectCalendar={() => {
            throw new Error('qa_unexpected_connection')
          }}
          onLibraryWorkspaceOpen={workspace => calls.push(['person', workspace.uuid])}
        />
        <button data-qa="search-outside">Outside search</button>
      </>,
    )
    const input = container.querySelector<HTMLInputElement>(
      'input[aria-label="Search meetings and library"]',
    )
    check(input)
    if (!input) throw new Error('qa_search_input')
    input.focus()
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
      input,
      'Fictional search',
    )
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await until(
      () =>
        !!container.querySelector('[aria-label="Search results"] button[data-search-result]') &&
        container.textContent?.includes('Fictional search person') === true,
    )
    return input
  }
  const result = (kind: 'meeting' | 'person') => {
    const button = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[aria-label="Search results"] button'),
    ).find(button => button.textContent?.includes(`Fictional search ${kind}`))
    check(button)
    if (!button) throw new Error('qa_search_result')
    return button
  }
  const mouse = (target: EventTarget, type: string, options: MouseEventInit = {}) =>
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: 10,
        clientY: 10,
        ...options,
      }),
    )
  const nullBlur = (input: HTMLInputElement) =>
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
  for (const kind of ['meeting', 'person'] as const) {
    const input = await setup(),
      button = result(kind)
    check(mouse(button, 'mousedown') === false)
    nullBlur(input)
    await tick()
    check(button.isConnected && calls.length === 0)
    mouse(button, 'mouseup')
    mouse(button, 'click', { detail: 1 })
    await tick()
    check(
      JSON.stringify(calls) ===
        JSON.stringify(
          kind === 'meeting'
            ? [
                ['meeting', '2026-11-20', 900201],
                ['tab', TabChoices.Meeting, 'meetings'],
              ]
            : [
                ['tab', TabChoices.Library, undefined],
                ['person', 'qa-search-person'],
              ],
        ),
    )
    check(input.value === '' && !container.querySelector('[aria-label="Search results"]'))
  }
  for (const cancellation of ['drag', 'scroll', 'secondary', 'control', 'cancel'] as const) {
    const input = await setup(),
      button = result('meeting')
    mouse(button, 'mousedown', {
      button: cancellation === 'secondary' ? 2 : 0,
      ctrlKey: cancellation === 'control',
    })
    if (cancellation === 'drag') mouse(document, 'mousemove', { clientX: 50 })
    if (cancellation === 'scroll') document.dispatchEvent(new Event('scroll', { bubbles: true }))
    if (cancellation === 'cancel')
      document.dispatchEvent(new Event('pointercancel', { bubbles: true }))
    nullBlur(input)
    mouse(button, 'mouseup')
    mouse(button, 'click', {
      detail: 1,
      button: cancellation === 'secondary' ? 2 : 0,
      ctrlKey: cancellation === 'control',
    })
    await tick()
    check(calls.length === 0 && input.value === 'Fictional search')
  }
  let input = await setup()
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
  )
  check(document.activeElement === result('meeting'))
  // Detail-zero activation is the keyboard/assistive-technology click path.
  result('person').click()
  await tick()
  check(calls.some(call => call[0] === 'person' && call[1] === 'qa-search-person'))
  input = await setup()
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  )
  await tick()
  check(
    !container.querySelector('[aria-label="Search results"]') && input.value === 'Fictional search',
  )
  input = await setup()
  container.querySelector<HTMLButtonElement>('[data-qa="search-outside"]')?.focus()
  await tick()
  check(
    !container.querySelector('[aria-label="Search results"]') &&
      input.value === 'Fictional search' &&
      calls.length === 0,
  )
}
