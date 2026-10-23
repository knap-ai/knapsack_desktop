import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  buildOpenAISource,
  buildAnthropicSource,
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
    gemini-4-argon gemini-4-pro gemini-4-flash
    gemini-38-flash
    gemini-2.15-flash gemini-2.15-flash-lite
  `

  assert.deepEqual(canonicalGeminiModelIdsFromHtml(html), [
    'gemini-4-argon',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ])
})

test('generated Gemini catalog exposes the exact paid-tier Argon id without changing the Flash default', () => {
  const source = buildGeminiSource([
    'gemini-4-argon',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
  ])

  assert.match(source, /id: 'gemini-4-argon'/)
  assert.match(source, /paid Gemini API tier/)
  assert.match(source, /id: 'gemini-3\.8-flash'/)
  assert.match(source, /name: 'Gemini 3\.8 Flash'/)
  assert.match(source, /GEMINI_PROVIDER_DESCRIPTION = 'Gemini 4 Argon, 3\.8 Flash, 3\.6 Flash, 3\.5 Flash Lite'/)
})

test('OpenAI refresh excludes GPT-6.1 until the desktop route supports it', () => {
  const ids = canonicalOpenAIModelIdsFromHtml(
    'gpt-6-astra GPT-6.1 Sol gpt-6.1-sol gpt-6.2 gpt-6.2-sol gpt-6 gpt-5.6 gpt-5.5 gpt-5.4 gpt-5-mini o3 gpt-6-astra-preview',
  )

  assert.deepEqual(ids, [
    'gpt-6-astra',
    'gpt-6.2',
    'gpt-6',
    'gpt-5.6',
    'gpt-5.5',
    'gpt-5.4',
    'gpt-5-mini',
    'o3',
  ])
  const source = buildOpenAISource(ids)
  assert.match(source, /id: 'gpt-6-astra'/)
  assert.doesNotMatch(source, /id: 'gpt-6\.1'/)
  assert.doesNotMatch(source, /id: 'gpt-6\.1-sol'/)
  assert.match(source, /id: 'gpt-6\.2'/)
  assert.doesNotMatch(source, /id: 'gpt-6\.2-sol'/)
  assert.match(source, /DEFAULT_OPENAI_MODEL = 'gpt-5-mini'/)
})

test('OpenAI refresh preserves unrelated bare families when docs mention Sol variants', () => {
  assert.deepEqual(
    canonicalOpenAIModelIdsFromHtml('gpt-6 gpt-6-sol gpt-5.6 gpt-5.6-sol'),
    ['gpt-6', 'gpt-5.6'],
  )
  assert.deepEqual(canonicalOpenAIModelIdsFromHtml('gpt-6.2-sol'), [])
})

test('checked-in OpenAI catalog round-trips through its generator', () => {
  const catalog = fs.readFileSync(
    new URL('../src/utils/openaiModels.ts', import.meta.url),
    'utf8',
  )
  const ids = [...catalog.matchAll(/\{ id: '([^']+)'/g)].map(match => match[1])
  assert.equal(buildOpenAISource(ids), catalog)
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

  assert.deepEqual(ids, [])
})

test('new public catalog choices do not change hosted Knapsack tiers', () => {
  const source = buildAnthropicSource(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'])
  assert.match(source, /id: 'claude-sonnet-5-5'/)
  assert.match(source, /id: 'claude-haiku-5-5'/)
  assert.match(source, /id: 'anthropic\/claude-haiku-4-5', name: 'Standard'/)
  assert.match(source, /id: 'anthropic\/claude-sonnet-5', name: 'Plus'/)
  assert.match(source, /DEFAULT_KNAPSACK_ANTHROPIC_MODEL = 'anthropic\/claude-haiku-4-5'/)
})
