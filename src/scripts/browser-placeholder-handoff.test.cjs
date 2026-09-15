const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const serverImplPath = path.join(
  __dirname,
  '../src-tauri/resources/clawdbot/dist/server.impl-BCpatfdp.js',
)

function loadPlaceholderFactory(createNetServer) {
  const source = fs.readFileSync(serverImplPath, 'utf8')
  const start = source.indexOf('function startDesktopBrowserControlPlaceholder')
  const end = source.indexOf('function startDesktopManagedBrowserControlService', start)
  assert.notEqual(start, -1, 'placeholder function should exist in the bundled runtime')
  assert.notEqual(end, -1, 'managed browser-control function should follow the placeholder')
  return new Function(
    'createNetServer',
    `${source.slice(start, end)}; return startDesktopBrowserControlPlaceholder`,
  )(createNetServer)
}

test('desktop browser placeholder destroys accepted raw TCP probes during handoff', async () => {
  const previousManaged = process.env.OPENCLAW_DESKTOP_MANAGED_GATEWAY
  const previousSkip = process.env.OPENCLAW_SKIP_BROWSER_CONTROL_SERVER
  const previousPlaceholder = globalThis.__openclawDesktopBrowserControlPlaceholder
  process.env.OPENCLAW_DESKTOP_MANAGED_GATEWAY = '1'
  delete process.env.OPENCLAW_SKIP_BROWSER_CONTROL_SERVER

  let connectionHandler
  let closeCallback
  let socketClosed = false
  let socketDestroyed = false
  const closeListeners = []
  const fakeSocket = {
    on() {},
    once(event, listener) {
      if (event === 'close') closeListeners.push(listener)
    },
    end() {},
    destroy() {
      socketDestroyed = true
      socketClosed = true
      for (const listener of closeListeners) listener()
      closeCallback?.()
    },
  }
  const fakeServer = {
    once() {},
    listen() {
      connectionHandler(fakeSocket)
    },
    close(callback) {
      closeCallback = callback
      if (socketClosed) callback()
    },
  }

  try {
    const startPlaceholder = loadPlaceholderFactory((handler) => {
      connectionHandler = handler
      return fakeServer
    })
    startPlaceholder()
    const closePromise = globalThis.__openclawDesktopBrowserControlPlaceholder.close()
    await Promise.race([
      closePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('handoff remained blocked')), 100)),
    ])
    assert.equal(socketDestroyed, true)
    assert.equal(globalThis.__openclawDesktopBrowserControlPlaceholder, undefined)
  } finally {
    if (previousManaged === undefined) delete process.env.OPENCLAW_DESKTOP_MANAGED_GATEWAY
    else process.env.OPENCLAW_DESKTOP_MANAGED_GATEWAY = previousManaged
    if (previousSkip === undefined) delete process.env.OPENCLAW_SKIP_BROWSER_CONTROL_SERVER
    else process.env.OPENCLAW_SKIP_BROWSER_CONTROL_SERVER = previousSkip
    globalThis.__openclawDesktopBrowserControlPlaceholder = previousPlaceholder
  }
})
