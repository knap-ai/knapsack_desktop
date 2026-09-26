const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')

test('Ollama Cloud uses the hosted endpoint and an authenticated provider configuration', () => {
  const service = read('src-tauri/src/clawd/service.rs')
  assert.match(service, /OLLAMA_CLOUD_BASE_URL: &str = "https:\/\/ollama\.com"/)
  assert.match(service, /pub cloud: Option<bool>/)
  assert.match(service, /unwrap_or_else\(\|\| tokens\.ollama_cloud_enabled\.unwrap_or\(false\)\)/)
  assert.match(service, /ollama_cloud_api_key/)
  assert.match(service, /tokens\.ollama_cloud_enabled = Some\(cloud\)/)
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
  assert.match(chat, /ollama\/status\?cloud=false/)
  assert.match(chat, /ollama\/models\?cloud=false/)
  assert.match(chat, /kimi-k2\.5:cloud/)
  assert.match(chat, /setOllamaMode\('local'\); setSelectedOllamaModel\(''\)/)
  assert.match(chat, /setOllamaMode\('cloud'\); setSelectedOllamaModel\('kimi-k2\.5:cloud'\)/)
})

test('local probes do not inherit a saved Cloud endpoint', () => {
  const service = read('src-tauri/src/clawd/service.rs')
  assert.match(service, /pub struct OllamaRuntimeQuery/)
  assert.match(service, /fn local_ollama_base_url/)
  assert.match(service, /query\.cloud/)
  assert.match(service, /let base_url = local_ollama_base_url\(tokens\.as_ref\(\)\);/)
})

test('Settings recognizes an enabled Cloud configuration without a local daemon', () => {
  const settings = read('src/components/templates/Home/components/SettingsDialog/index.tsx')
  assert.match(settings, /ollama_cloud_enabled\?: boolean/)
  assert.match(settings, /const ollamaCloudActive = !!providerStatus\?\.ollama_cloud_enabled/)
  assert.match(settings, /\?cloud=true/)
  assert.match(settings, /Ollama Cloud connected/)
  assert.match(settings, /cloud: ollamaCloudActive/)
})

test('ordinary Cloud chat uses the saved Cloud credential instead of the local marker', () => {
  const browser = read('src-tauri/src/clawd/browser.rs')
  assert.match(browser, /fn ollama_api_key\(app_handle: &tauri::AppHandle\) -> Option<String>/)
  assert.match(browser, /tokens\.ollama_cloud_enabled\.unwrap_or\(false\)/)
  assert.match(browser, /ollama_cloud_api_key/)
  assert.match(browser, /Some\("ollama-local"\.to_string\(\)\)/)
  assert.match(browser, /"Ollama Cloud API key is not set/)
})

test('Cloud chats retain hosted capabilities and use Ollama native tool calling', () => {
  const browser = read('src-tauri/src/clawd/browser.rs')
  const agent = read('src-tauri/src/clawd/chat_agent.rs')
  assert.match(browser, /fn ollama_cloud_is_active/)
  assert.match(browser, /provider == "ollama" && !ollama_cloud_is_active/)
  assert.match(browser, /chat_agent::ollama_native_chat\(key, model, ollama_base, msgs, tls\)/)
  assert.match(agent, /pub async fn ollama_native_chat/)
  assert.match(agent, /\/api\/chat/)
  assert.match(agent, /"tool_calls"/)
})
