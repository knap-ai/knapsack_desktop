import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const source = readFileSync(fileURLToPath(new URL('../src/utils/devIntentDetector.ts', import.meta.url)), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { detectBuildIntent } = await import(`data:text/javascript,${encodeURIComponent(compiled)}`)

test('offers developer mode for explicit software work', () => {
  for (const request of [
    'Build a mobile app for our customers',
    'Implement an API endpoint for calendar sync',
    'Fix the bug in the codebase',
    'Fix the login bug in the mobile app',
    'Debug this website',
    'Add a software feature to the app',
  ]) assert.equal(detectBuildIntent(request), true, request)
})

test('does not interrupt ordinary executive and meeting work', () => {
  for (const request of [
    'Write feedback in the relevant Notion page and get back to Diego',
    'Help me build data-backed consensus with the team',
    'Create a meeting note and record the conversation',
    'What should I ask this candidate?',
    'Fix the app calendar so it shows my meetings',
    'Summarize the product strategy and make a plan',
    'I am working on the Bankaya project',
  ]) assert.equal(detectBuildIntent(request), false, request)
})
