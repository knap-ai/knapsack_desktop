import assert from 'node:assert/strict'
import test from 'node:test'

import { getPaidActivationId } from '../src/utils/activationAttribution.ts'

test('uses a gclid as the paid activation deduplication key', () => {
  assert.equal(getPaidActivationId({ gclid: 'google-click-123' }), 'google-click-123')
})

test('uses an install attribution id for a Google CPC visit', () => {
  assert.equal(
    getPaidActivationId({
      attrId: 'install-123',
      utmSource: 'Google',
      utmMedium: 'CPC',
    }),
    'install-123',
  )
})

test('rejects UTM-only visits because they cannot be deduplicated', () => {
  assert.equal(
    getPaidActivationId({ utmSource: 'google', utmMedium: 'cpc' }),
    null,
  )
})

test('does not count an organic install attribution id as paid activation', () => {
  assert.equal(getPaidActivationId({ attrId: 'install-123' }), null)
})
