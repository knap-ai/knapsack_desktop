const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { tmpdir } = require('node:os')
const { join, resolve } = require('node:path')
const { pathToFileURL } = require('node:url')
const http = require('node:http')

test('bundled transport enforces changing desktop policy before a real loopback upload', async () => {
  const dist = resolve(__dirname, '../src-tauri/resources/clawdbot/dist')
  const sandbox = await fs.mkdtemp(join(tmpdir(), 'knapsack-privacy-transport-'))
  const config = join(sandbox, 'privacy-mode.json')
  const helperPath = join(sandbox, 'privacy-policy.mjs')
  let uploads = 0
  const server = http.createServer((req, res) => {
    uploads++
    if (req.url === '/redirect') { res.writeHead(307, { Location: '/redirect-target' }); res.end(); return }
    req.resume()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ choices: [{ message: { content: 'local response' } }] }))
  })
  try {
    // Redirect only the policy location in this isolated module copy. Never
    // change the owner's settings, HOME, API keys, or production gateway.
    const helper = (await fs.readFile(join(dist, 'knapsack-privacy-policy.js'), 'utf8'))
      .replace('join(homedir(), ".knapsack", "privacy-mode.json")', JSON.stringify(config))
    await fs.writeFile(helperPath, helper)
    await fs.symlink(resolve(dist, '../node_modules'), join(sandbox, 'node_modules'), 'dir')
    const source = (await fs.readFile(join(dist, 'openai-transport-stream-Pgx5hpN7.js'), 'utf8'))
      .replace(/from "([^\"]+)"/g, (full, specifier) => {
        if (!specifier.startsWith('.')) return full
        const target = specifier === './knapsack-privacy-policy.js' ? helperPath : resolve(dist, specifier)
        return `from ${JSON.stringify(pathToFileURL(target).href)}`
      })
    const transport = join(sandbox, 'transport.mjs')
    await fs.writeFile(transport, source)
    const { E: buildFetch } = await import(pathToFileURL(transport).href)
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const endpoint = `http://127.0.0.1:${server.address().port}/v1`
    const model = { provider: 'ollama', api: 'openai-completions', id: 'qwen3:8b', baseUrl: endpoint }
    const send = buildFetch(model, 2000, { sanitizeSse: false })
    const request = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.id, messages: [] }) }
    await fs.writeFile(config, JSON.stringify({ version: 2, enabled: true, mode: 'local-only' }))
    const response = await send(`${endpoint}/chat/completions`, request)
    assert.equal(response.status, 200)
    await response.text()
    assert.equal(uploads, 1)
    const cloud = buildFetch({ ...model, provider: 'openai' }, 2000)
    await assert.rejects(cloud(`${endpoint}/chat/completions`, request), /Privacy Mode/)
    assert.equal(uploads, 1)
    await fs.writeFile(config, JSON.stringify({ version: 2, enabled: false }))
    const ordinary = await cloud(`${endpoint}/chat/completions`, request)
    await ordinary.text()
    assert.equal(uploads, 2)
    await fs.writeFile(config, JSON.stringify({ version: 2, enabled: true, mode: 'local-only' }))
    await assert.rejects(cloud(`${endpoint}/chat/completions`, request), /Privacy Mode/)
    assert.equal(uploads, 2)
    await fs.writeFile(config, '{broken')
    await assert.rejects(cloud(`${endpoint}/chat/completions`, request), /Privacy Mode/)
    assert.equal(uploads, 2)
    await assert.rejects(send(`${endpoint}/chat/completions`, { ...request, body: JSON.stringify({ model: 'qwen3:cloud' }) }), /Privacy Mode/)
    assert.equal(uploads, 2)
    await fs.writeFile(config, JSON.stringify({ version: 2, enabled: true, mode: 'local-only' }))
    await assert.rejects(send(`http://127.0.0.1:${server.address().port}/redirect`, request), /redirect/i)
    assert.equal(uploads, 3, 'only the approved original endpoint receives the request')
  } finally {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    await fs.rm(sandbox, { recursive: true, force: true })
  }
})
