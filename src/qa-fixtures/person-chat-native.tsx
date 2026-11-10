// Actual production person/chat components; all external/native effects terminate here.
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Workspace } from 'src/api/workspaces'
import 'src/main.css'
export async function createPersonScoutFixture(container: HTMLElement) {
  const sealed = {
    fetch: globalThis.fetch,
    open: window.open,
    xhr: window.XMLHttpRequest,
    websocket: window.WebSocket,
    eventSource: window.EventSource,
    transport: (window as any).__knapsackQaTransport__,
    media: Object.getOwnPropertyDescriptor(navigator, 'mediaDevices'),
    beacon: Object.getOwnPropertyDescriptor(navigator, 'sendBeacon'),
  }
  if (
    import.meta.env.VITE_KNAPSACK_LOCAL_QA_SAFE !== '1' ||
    !['127.0.0.1', 'localhost'].includes(location.hostname)
  )
    throw Error('Isolated synthetic server required')
  const people = [
    {
      id: 901,
      uuid: 'qa-alex',
      entityType: 'person',
      entityKey: 'alex@example.test',
      name: 'Alex Example',
      documents: [],
    },
    {
      id: 902,
      uuid: 'qa-jo',
      entityType: 'person',
      entityKey: 'jo@example.test',
      name: 'Jo Example',
      documents: [],
    },
  ] as unknown as Workspace[]
  const state = {
    requests: [] as { path: string; body: Record<string, unknown> }[],
    blocked: [] as string[],
    calls: [] as string[],
    listeners: new Map<number, { event: string; handler: number }>(),
    sequence: 0,
    hold: false,
    pending: 0,
    aborted: 0,
    completed: 0,
  }
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  const deny = (reason: string): never => {
    state.blocked.push(reason)
    throw Error('Synthetic boundary blocked: ' + reason)
  }
  const callback = (id: number, value: unknown) =>
    (window as unknown as Record<string, (value: unknown) => void>)[`_${id}`]?.(
      value,
    )
  ;(window as any).__knapsackQaTransport__ = (p: any) => {
    const m = p.message
    if (p.cmd === 'tauri' && p.__tauriModule === 'Event') {
      if (m?.cmd === 'listen') {
        const id = ++state.sequence
        state.listeners.set(id, { event: m.event, handler: m.handler })
        callback(p.callback, id)
        return
      }
      if (m?.cmd === 'unlisten') {
        state.listeners.delete(m.eventId)
        callback(p.callback, null)
        return
      }
    }
    deny('IPC ' + p.cmd + '/' + p.__tauriModule + '/' + m?.cmd)
  }
  globalThis.fetch = window.fetch = async (input, init) => {
    const u = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
      location.href,
    )
    if (u.origin !== 'http://127.0.0.1:8897') return deny('origin ' + u.origin)
    const path = u.pathname
    const method = init?.method || 'GET'
    state.calls.push(method + ' ' + path)
    if (
      method === 'POST' &&
      ['/api/clawd/agent-chat', '/api/clawd/chat'].includes(path)
    ) {
      const body = JSON.parse(String(init?.body))
      state.requests.push({ path, body })
      if (state.hold) {
        state.pending++
        try {
          await new Promise<void>((resolve, reject) => {
            const id = setTimeout(resolve, 10000)
            init?.signal?.addEventListener(
              'abort',
              () => {
                clearTimeout(id)
                state.aborted++
                reject(new DOMException('Synthetic stopped', 'AbortError'))
              },
              { once: true },
            )
          })
        } finally {
          state.pending--
        }
      }
      state.completed++
      return json({
        ok: true,
        reply:
          'Synthetic reply for ' +
          String(body.sessionId || body.userEmail || 'chat'),
        model: 'synthetic',
      })
    }
    if (method !== 'GET') return deny(method + ' ' + path)
    if (path.startsWith('/api/knapsack/workspaces/'))
      return json({
        success: true,
        data: people.find((p) => path.endsWith(p.uuid)) || people[0],
      })
    if (path === '/api/clawd/skills/status')
      return json({ success: true, skills: [] })
    if (path === '/api/clawd/service/status')
      return json({
        success: true,
        installed: true,
        running: true,
        label: 'Synthetic',
        message: 'Ready',
      })
    if (path === '/api/clawd/service/health')
      return json({
        success: true,
        gateway_ok: true,
        browser_ok: true,
        message: 'Synthetic only',
      })
    if (path === '/api/clawd/service/api-key-status')
      return json({
        success: true,
        has_key: true,
        has_openai_key: true,
        active_provider: 'openai',
        model: 'gpt-5-mini',
        openai_model: 'gpt-5-mini',
        advanced_mode: false,
        developer_mode: false,
      })
    if (path === '/api/clawd/service/get-api-key')
      return json({
        success: true,
        active_provider: 'openai',
        openai_model: 'gpt-5-mini',
        openai_key: 'synthetic-fixture-not-a-credential',
      })
    if (path === '/api/clawd/service/studio-connections')
      return json({ success: true, connected: [], available: [] })
    if (path === '/api/clawd/browser/tabs')
      return json({ success: true, running: true, tabs: [] })
    if (path === '/api/knapsack/heartbeat/config')
      return json({ success: true, data: { enabled: false } })
    if (path === '/api/knapsack/ollama/status') return json({ running: false })
    if (path === '/api/knapsack/ollama/models')
      return json({ success: true, models: [] })
    if (
      /^\/api\/clawd\/channels\/(whatsapp|imessage|telegram|generic\/[a-z]+)\/status$/.test(
        path,
      )
    )
      return json({
        success: true,
        configured: false,
        enabled: false,
        linked: false,
        active: false,
      })
    if (path === '/api/clawd/channels/slack/accounts')
      return json({ success: true, accounts: [] })
    return deny('unrecognized GET ' + path)
  }
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: async () => deny('audio capture') },
  })
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    value: () => false,
  })
  window.open = () => deny('window.open')
  globalThis.XMLHttpRequest = window.XMLHttpRequest = class {
    constructor() {
      deny('XHR')
    }
  } as unknown as typeof XMLHttpRequest
  globalThis.WebSocket = window.WebSocket = class {
    constructor() {
      deny('WebSocket')
    }
  } as unknown as typeof WebSocket
  globalThis.EventSource = window.EventSource = class {
    constructor() {
      deny('EventSource')
    }
  } as unknown as typeof EventSource
  localStorage.setItem('moltbot_onboarding_version', '0.9.600')
  localStorage.setItem('moltbot_active_provider', 'openai')
  localStorage.setItem('moltbot_openai_model', 'gpt-5-mini')
  localStorage.setItem('moltbot_autonomy_mode', 'assist')
  const [{ default: PersonWorkspace }, { default: ClawdChat }] =
    await Promise.all([
      import('src/components/organisms/PersonWorkspace'),
      import('src/components/organisms/ClawdChat'),
    ])
  function App() {
    const [owner, setOwner] = useState('owner-a@example.test'),
      [person, setPerson] = useState(0),
      [width, setWidth] = useState(560),
      [, setTick] = useState(0)
    useEffect(() => {
      const id = setInterval(() => setTick((v) => v + 1), 250)
      return () => clearInterval(id)
    }, [])
    const last = state.requests[state.requests.length - 1]
    return (
      <main
        style={{
          padding: 12,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <nav aria-label="Synthetic fixture controls">
          <a href="/qa-fixtures/meeting-notes.html?nativeClipboard=1">
            Notes fixture
          </a>{' '}
          |{' '}
          {[900, 680, 560, 320].map((w) => (
            <button key={w} onClick={() => setWidth(w)}>
              {w}px
            </button>
          ))}{' '}
          |{' '}
          <button
            onClick={() =>
              setOwner((v) =>
                v === 'owner-a@example.test'
                  ? 'owner-b@example.test'
                  : 'owner-a@example.test',
              )
            }
          >
            Switch synthetic owner
          </button>{' '}
          <button onClick={() => setPerson((v) => 1 - v)}>
            Switch synthetic person
          </button>{' '}
          <button
            onClick={() => {
              state.hold = !state.hold
              setTick((v) => v + 1)
            }}
          >
            Toggle synthetic slow reply
          </button>
        </nav>
        <output
          aria-label="Synthetic boundaries"
          style={{ font: '12px monospace' }}
        >
          Owner: {owner}; Person: {people[person].name}; Sends:{' '}
          {state.requests.length}; File-drop listeners:{' '}
          {
            [...state.listeners.values()].filter(
              (v) => v.event === 'tauri://file-drop',
            ).length
          }
          ; Slow: {String(state.hold)}; Pending: {state.pending}; Aborted:{' '}
          {state.aborted}; Completed: {state.completed}; Blocked:{' '}
          {state.blocked.join('; ') || 'none'}
        </output>
        <output
          aria-label="Last synthetic request"
          style={{ font: '12px monospace' }}
        >
          Last sender: {String(last?.body.userEmail || 'none')}; Session:{' '}
          {String(last?.body.sessionId || 'none')}; Text:{' '}
          {String(last?.body.userText || last?.body.text || 'none').slice(
            0,
            500,
          )}
          ; Context: {String(last?.body.text || 'none').slice(0, 460)}
        </output>
        <section
          aria-label="Actual person workspace"
          style={{
            width,
            maxWidth: '100%',
            flex: 1,
            minHeight: 0,
            border: '1px solid #ddd',
          }}
        >
          <PersonWorkspace
            workspace={people[person]}
            userEmail={owner}
            userName="Synthetic Owner"
            onBack={() => {}}
          />
        </section>
        <div hidden aria-hidden="true">
          <ClawdChat
            chatId="synthetic-background"
            sessionId="synthetic-background"
            title="Hidden background chat"
            userEmail="background@example.test"
            active
            foregroundActive={false}
          />
        </div>
      </main>
    )
  }
  const root = createRoot(container)
  root.render(<App />)
  return {
    state,
    dispose() {
      root.unmount()
      globalThis.fetch = window.fetch = sealed.fetch
      window.open = sealed.open
      globalThis.XMLHttpRequest = window.XMLHttpRequest = sealed.xhr
      globalThis.WebSocket = window.WebSocket = sealed.websocket
      globalThis.EventSource = window.EventSource = sealed.eventSource
      ;(window as any).__knapsackQaTransport__ = sealed.transport
      for (const [key, value] of [
        ['mediaDevices', sealed.media],
        ['sendBeacon', sealed.beacon],
      ] as const) {
        if (value) Object.defineProperty(navigator, key, value)
        else Reflect.deleteProperty(navigator, key)
      }
    },
  }
}
if (location.pathname === '/qa-fixtures/person-chat-native.html') {
  void createPersonScoutFixture(document.getElementById('root')!)
}
