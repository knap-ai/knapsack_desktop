import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  buildOpenAISource,
  buildGeminiSource,
  canonicalAnthropicModelIdsFromHtml,
  canonicalGeminiModelIdsFromHtml,
  canonicalOpenAIModelIdsFromHtml,
} from './refresh-public-provider-models.mjs'

test('Gemini refresh selects recent text models and excludes specialized variants', () => {
  const html = `
    gemini-2.5-pro gemini-2.5-flash gemini-2.5-flash-image
    gemini-3.1-pro gemini-3.1-pro-preview
    gemini-3.1-flash-lite gemini-3.1-flash-live-preview
    gemini-3.5-flash gemini-3.5-flash-lite gemini-3.5-transcribe
    gemini-3.6-flash gemini-3.7-flash gemini-3.8-flash gemini-3.7-flash-image
    gemini-38-flash
    gemini-2.15-flash gemini-2.15-flash-lite
  `

  assert.deepEqual(canonicalGeminiModelIdsFromHtml(html), [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.1-pro-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
  ])
})

test('generated Gemini catalog exposes 3.8 Flash and provider summary', () => {
  const source = buildGeminiSource([
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-flash',
  ])

  assert.match(source, /id: 'gemini-3\.8-flash'/)
  assert.match(source, /name: 'Gemini 3\.8 Flash'/)
  assert.match(source, /GEMINI_PROVIDER_DESCRIPTION = 'Gemini 3\.8 Flash, 3\.7 Flash, 3\.1 Pro, 2\.5 Flash'/)
})

test('OpenAI refresh includes Astra without dropping established supported models', () => {
  const ids = canonicalOpenAIModelIdsFromHtml(
    'gpt-6-astra gpt-6 gpt-5.6 gpt-5.5 gpt-5.4 gpt-5-mini o3 gpt-6-astra-preview',
  )

  assert.deepEqual(ids, [
    'gpt-6-astra',
    'gpt-6',
    'gpt-5.6',
    'gpt-5.5',
    'gpt-5.4',
    'gpt-5-mini',
    'o3',
  ])
  const source = buildOpenAISource(ids)
  assert.match(source, /id: 'gpt-6-astra'/)
  assert.match(source, /DEFAULT_OPENAI_MODEL = 'gpt-5-mini'/)
})

test('Anthropic catalog parser recognizes Fable 5.1 from dedicated launch content', () => {
  assert.deepEqual(
    [...canonicalAnthropicModelIdsFromHtml('claude-fable-5-1 claude-fable-5')],
    ['claude-fable-5-1', 'claude-fable-5'],
  )
})

test('both provider settings surfaces consume the generated OpenAI and Gemini catalogs', () => {
  const chat = fs.readFileSync(new URL('../src/components/organisms/ClawdChat/index.tsx', import.meta.url), 'utf8')
  const settings = fs.readFileSync(new URL('../src/components/templates/Home/components/ProviderSignInDialog/index.tsx', import.meta.url), 'utf8')

  for (const source of [chat, settings]) {
    assert.match(source, /src\/utils\/openaiModels/)
    assert.match(source, /src\/utils\/geminiModels/)
  }
  assert.doesNotMatch(settings, /models:\s*\[\s*\{ id: 'gpt-/)
  assert.doesNotMatch(settings, /models:\s*\[\s*\{ id: 'gemini\//)
  assert.doesNotMatch(settings, /setSelectedModel\('gemini\/gemini-/)
})

test('specialized Gemini ids cannot create nonexistent text-model entries', () => {
  const ids = canonicalGeminiModelIdsFromHtml(`
    gemini-3.8-flash-image
    gemini-3.9-flash-live-preview
    gemini-4.0-pro-preview-tts
    gemini-3.7-flash
  `)

  assert.deepEqual(ids, ['gemini-3.7-flash'])
})
