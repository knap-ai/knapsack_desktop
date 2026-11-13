// Fixed real-component scenarios, callable only from the isolated QA harness.
import { createPersonScoutFixture } from '../../qa-fixtures/person-chat-native'
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
function assert(value: unknown, label: string): asserts value {
  if (!value) throw Error('person_scout_' + label)
}
async function until(test: () => boolean, label: string) {
  const end = Date.now() + 900
  while (!test()) {
    assert(Date.now() < end, label)
    await pause()
  }
}
export async function runPersonScoutProbe(container: HTMLElement) {
  const host = document.createElement('div')
  container.append(host)
  const fixture = await createPersonScoutFixture(host)
  const visible = (el: Element) =>
    !el.closest('[hidden],.hidden,[aria-hidden="true"]')
  const button = (label: string) => {
    const el = Array.from(
      host.querySelectorAll<HTMLButtonElement>('button'),
    ).find(
      (el) =>
        visible(el) &&
        (el.getAttribute('aria-label') || el.textContent?.trim()) === label,
    )
    assert(el, 'button_' + label)
    return el
  }
  const click = (label: string) => button(label).click()
  const draft = () => {
    const el = Array.from(
      host.querySelectorAll<HTMLTextAreaElement>('textarea'),
    ).find(visible)
    assert(el, 'composer')
    return el
  }
  const type = (value: string) => {
    const el = draft()
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )!.set!.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const ready = () =>
    until(
      () =>
        Array.from(host.querySelectorAll('button')).some(
          (el) => visible(el) && el.textContent?.trim() === 'Send',
        ) &&
        Array.from(host.querySelectorAll('textarea')).some(
          (el) => visible(el) && !el.disabled,
        ) &&
        host.textContent?.includes('Gateway: OK') === true,
      'ready',
    )
  const visibleText = () =>
    Array.from(host.querySelectorAll('.ClawdChatRoot'))
      .filter(visible)
      .map((el) => el.textContent || '')
      .join(' ')
  const fileListeners = () =>
    [...fixture.state.listeners.values()].filter(
      (row) => row.event === 'tauri://file-drop',
    ).length
  const openScopedPerson = async (name: string, expectedRequests: number) => {
    await until(() => fileListeners() === 0, 'scope_listener_cleanup')
    assert(!Array.from(host.querySelectorAll('textarea')).some(visible), 'scope_requires_explicit_open')
    assert(Number(fixture.state.requests.length) === expectedRequests, 'scope_no_automatic_send')
    click('Chat about ' + name)
    await ready()
    await until(() => fileListeners() === 1, 'scope_single_foreground')
    assert(Number(fixture.state.requests.length) === expectedRequests, 'scope_open_does_not_send')
  }
  try {
    await until(
      () => host.textContent?.includes('Chat about Alex Example') === true,
      'person_view',
    )
    assert(Number(fixture.state.requests.length) === 0, 'no_open_send')
    assert(fileListeners() === 0, 'background_not_foreground')
    click('Chat about Alex Example')
    await ready()
    await until(() => fileListeners() === 1, 'single_foreground')
    type('Unsent native person draft')
    await pause()
    click('Back to Alex Example')
    await until(() => fileListeners() === 0, 'hidden_unsubscribed')
    click('Chat about Alex Example')
    await ready()
    assert(
      draft().value === 'Unsent native person draft',
      'back_draft_retained',
    )
    click('320px')
    await pause()
    const options = button('Scout options')
    options.focus()
    options.click()
    await pause()
    assert(options.getAttribute('aria-expanded') === 'true', 'options_expanded')
    const menu = host.querySelector<HTMLElement>('.ClawdChatActions--open')
    assert(menu, 'menu')
    if (globalThis.CSS?.supports?.('container-type', 'inline-size')) {
      assert(
        getComputedStyle(options).display !== 'none',
        'narrow_disclosure_visible',
      )
      const chat = options.closest('.ClawdChatRoot')!
      assert(
        menu.getBoundingClientRect().right <=
          chat.getBoundingClientRect().right + 2,
        'narrow_no_overflow',
      )
    }
    button('Tone: Snarky').click()
    await pause()
    assert(host.querySelector('.ClawdToneSelector'), 'nested_tone_open')
    click('Cancel')
    await pause()
    options.focus()
    if (options.getAttribute('aria-expanded') !== 'true') options.click()
    await pause()
    const first = menu.querySelector<HTMLButtonElement>('button')
    assert(first, 'first_option')
    first.focus()
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await pause()
    assert(options.getAttribute('aria-expanded') === 'false', 'escape_closes')
    assert(document.activeElement === options, 'escape_returns_focus')
    options.click()
    await pause()
    host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await pause()
    assert(options.getAttribute('aria-expanded') === 'false', 'outside_closes')
    click('900px')
    await pause()
    if (globalThis.CSS?.supports?.('container-type', 'inline-size'))
      assert(
        getComputedStyle(options).display === 'none',
        'wide_disclosure_hidden',
      )
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'l', metaKey: true, bubbles: true }),
    )
    assert(document.activeElement === draft(), 'foreground_shortcut')
    type('Native A Alex question')
    await pause()
    click('Send')
    await until(
      () =>
        Number(fixture.state.requests.length) === 1 &&
        visibleText().includes('Synthetic reply'),
      'explicit_send',
    )
    const request = fixture.state.requests[0].body
    assert(
      request.userEmail === 'owner-a@example.test' &&
        request.sessionId === 'person:owner-a%40example.test:qa-alex' &&
        String(request.text).includes('alex@example.test'),
      'exact_owner_person_payload',
    )
    click('Switch synthetic owner')
    await pause()
    await openScopedPerson('Alex Example', 1)
    assert(
      !visibleText().includes('Native A Alex question') && draft().value === '',
      'owner_history_isolated',
    )
    assert(Number(fixture.state.requests.length) === 1, 'no_switch_send')
    type('Native B Alex question')
    await pause()
    click('Send')
    await until(
      () =>
        Number(fixture.state.requests.length) === 2 &&
        visibleText().includes('Native B Alex question'),
      'owner_b_send',
    )
    click('Switch synthetic person')
    await pause()
    await openScopedPerson('Jo Example', 2)
    assert(
      !visibleText().includes('Native B Alex question') && draft().value === '',
      'person_history_isolated',
    )
    click('Switch synthetic person')
    await pause()
    await openScopedPerson('Alex Example', 2)
    assert(
      visibleText().includes('Native B Alex question') &&
        !visibleText().includes('Native A Alex question'),
      'same_person_history_restored',
    )
    click('Toggle synthetic slow reply')
    type('Native B pending')
    await pause()
    click('Send')
    await until(() => fixture.state.pending === 1, 'pending_request')
    click('Switch synthetic owner')
    await pause()
    await openScopedPerson('Alex Example', 3)
    await until(
      () => fixture.state.pending === 0 && fixture.state.aborted === 1,
      'old_owner_request_cancelled',
    )
    assert(
      visibleText().includes('Native A Alex question') &&
        !visibleText().includes('Native B Alex question') &&
        !visibleText().includes('Native B pending'),
      'return_owner_history_isolated',
    )
    assert(Number(fixture.state.requests.length) === 3, 'no_unapproved_retry')
    assert(fixture.state.blocked.length === 0, 'no_boundary_escape')
  } catch (error) {
    console.error(
      'Synthetic person probe failure',
      JSON.stringify({
        requests: fixture.state.requests.map((r) => ({
          user: r.body.userEmail,
          text: r.body.userText,
        })),
        blocked: fixture.state.blocked,
        visible: visibleText().slice(-900),
      }),
    )
    throw error
  } finally {
    fixture.dispose()
    host.remove()
    await pause()
  }
}
