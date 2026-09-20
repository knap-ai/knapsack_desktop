const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')

test('Ollama Cloud uses the hosted endpoint and an authenticated provider configuration', () => {
  const service = read('src-tauri/src/clawd/service.rs')
  assert.match(service, /OLLAMA_CLOUD_BASE_URL: &str = "https:\/\/ollama\.com"/)
  assert.match(service, /pub cloud: bool/)
  assert.match(service, /ollama_cloud_api_key/)
  assert.match(service, /request = request\.bearer_auth\(key\)/)
  assert.match(service, /upsert_ollama_provider_config\([\s\S]*?api_key/)
})

test('the provider chooser distinguishes local Ollama from Ollama Cloud without exposing saved keys', () => {
  const chat = read('src/components/organisms/ClawdChat/index.tsx')
  assert.match(chat, /ollamaMode.*'local' \| 'cloud'/)
  assert.match(chat, /Ollama Cloud/)
  assert.match(chat, /Your key stays on this device/)
  assert.match(chat, /type="password"/)
  assert.match(chat, /Use Ollama Cloud/)
})
