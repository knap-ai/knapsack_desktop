import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildGeminiSource,
  canonicalGeminiModelIdsFromHtml,
} from './refresh-public-provider-models.mjs'

test('Gemini refresh selects recent text models and excludes specialized variants', () => {
  const html = `
    gemini-2.5-pro gemini-2.5-flash gemini-2.5-flash-image
    gemini-3.1-pro gemini-3.1-pro-preview
    gemini-3.1-flash-lite gemini-3.1-flash-live-preview
    gemini-3.5-flash gemini-3.5-flash-lite gemini-3.5-transcribe
    gemini-3.6-flash gemini-3.7-flash gemini-3.7-flash-image
    gemini-2.15-flash gemini-2.15-flash-lite
  `

  assert.deepEqual(canonicalGeminiModelIdsFromHtml(html), [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
  ])
})

test('generated Gemini catalog exposes 3.7 Flash and provider summary', () => {
  const source = buildGeminiSource([
    'gemini-3.7-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-flash',
  ])

  assert.match(source, /id: 'gemini-3\.7-flash'/)
  assert.match(source, /name: 'Gemini 3\.7 Flash'/)
  assert.match(source, /GEMINI_PROVIDER_DESCRIPTION = 'Gemini 3\.7 Flash, 3\.1 Pro, 2\.5 Flash'/)
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
