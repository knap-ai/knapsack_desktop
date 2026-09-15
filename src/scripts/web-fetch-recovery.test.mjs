import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  buildDocumentHandoffText,
  buildReaderProxyRecoveryFailureMessage,
  isDocumentContentType,
  isLikelyDocumentUrl,
  isReaderProxyAccessFailure,
  resolveReaderProxyTarget,
} from '../src-tauri/resources/clawdbot/dist/knapsack-web-fetch-recovery.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const runtimePath = path.join(
  dirname,
  '../src-tauri/resources/clawdbot/dist/openclaw-tools-QeySpphx.js',
)

test('unwraps the reproduced Connecticut PDF reader URL without losing its query', () => {
  const proxy =
    'https://r.jina.ai/http://portal.ct.gov/-/media/dob/newsroom/block-inc-backgrounder_1-14-25.pdf?hash=FE5FE88AA829392189709D37756A8119&rev=d5a6b388d17540bea2ba73ff185991c0'
  assert.equal(
    resolveReaderProxyTarget(proxy),
    'https://portal.ct.gov/-/media/dob/newsroom/block-inc-backgrounder_1-14-25.pdf?hash=FE5FE88AA829392189709D37756A8119&rev=d5a6b388d17540bea2ba73ff185991c0',
  )
})

test('only unwraps the exact HTTPS Jina Reader host', () => {
  assert.equal(resolveReaderProxyTarget('https://r.jina.ai/https://example.com/report.pdf'), 'https://example.com/report.pdf')
  assert.equal(resolveReaderProxyTarget('http://r.jina.ai/https://example.com/report.pdf'), undefined)
  assert.equal(resolveReaderProxyTarget('https://r.jina.ai.evil.test/https://example.com/report.pdf'), undefined)
  assert.equal(resolveReaderProxyTarget('https://example.com/report.pdf'), undefined)
})

test('recognizes document URLs, document responses, and proxy access failures', () => {
  assert.equal(isLikelyDocumentUrl('https://example.com/report.PDF?download=1'), true)
  assert.equal(isLikelyDocumentUrl('https://example.com/article'), false)
  assert.equal(isDocumentContentType('application/pdf; charset=binary'), true)
  assert.equal(isDocumentContentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), true)
  assert.equal(isDocumentContentType('text/html'), false)
  assert.equal(isReaderProxyAccessFailure(401), true)
  assert.equal(isReaderProxyAccessFailure(403), true)
  assert.equal(isReaderProxyAccessFailure(429), false)
})

test('document handoff is actionable and fallback failure stays concise', () => {
  assert.match(buildDocumentHandoffText('https://example.com/report.pdf', 'application/pdf'), /Use the pdf tool/)
  const failure = buildReaderProxyRecoveryFailureMessage()
  assert.match(failure, /Open it in Browser or attach the file/)
  assert.doesNotMatch(failure, /r\.jina\.ai|https?:\/\//)
})

test('vendored web fetch runtime prefers direct documents and retries proxy 401 or 403', () => {
  const runtime = fs.readFileSync(runtimePath, 'utf8')
  assert.match(runtime, /resolveReaderProxyTarget\(url\)/)
  assert.match(runtime, /readerProxyTarget && isLikelyDocumentUrl\(readerProxyTarget\) \? readerProxyTarget : url/)
  assert.match(runtime, /params\.readerProxyTarget && isReaderProxyAccessFailure\(res\.status\)/)
  assert.match(runtime, /url: params\.readerProxyTarget,[\s\S]*?recoveryAttempted: true/)
  assert.match(runtime, /extractor = "document-handoff"/)
  assert.match(runtime, /buildReaderProxyRecoveryFailureMessage\(\)/)
})
