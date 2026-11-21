const test = require('node:test')
const assert = require('node:assert/strict')
const { suites, validateReport } = require('./test-meeting-notes-edit.cjs')
function report(windows = false) {
  const total = Object.values(suites).reduce((sum, count) => sum + count, 0)
  return { numTotalTests: total, numPassedTests: total, numPendingTests: 0, numTodoTests: 0, numFailedTests: 0, numFailedTestSuites: 0, testResults: Object.entries(suites).map(([file, count]) => ({ name: windows ? 'C:\\qa\\' + file.replace(/\//g, '\\') : '/qa/' + file, status: 'passed', assertionResults: Array.from({ length: count }, () => ({ status: 'passed' })) })) }
}
test('all required suites and assertions are checked on POSIX and Windows paths', () => {
  assert.deepEqual(validateReport(report()), { files: 5, tests: 56 })
  assert.deepEqual(validateReport(report(true)), { files: 5, tests: 56 })
})
test('zero collection, missing suite and partial .only-style collection fail loudly', () => {
  assert.throws(() => validateReport({ testResults: [] }), /coverage/)
  const missing = report(); missing.testResults.pop(); assert.throws(() => validateReport(missing), /coverage/)
  const partial = report(); partial.testResults.at(-1).assertionResults.pop(); assert.throws(() => validateReport(partial), /coverage/)
})
test('skipped, todo, failed assertions and failed collection cannot pass', () => {
  for (const status of ['pending', 'skipped', 'todo', 'failed']) {
    const value = report(); value.testResults[3].assertionResults[0].status = status
    assert.throws(() => validateReport(value), /coverage/)
  }
  const pending = report(); pending.numPendingTests = 1; assert.throws(() => validateReport(pending), /skipped/)
  const failed = report(); failed.numFailedTestSuites = 1; assert.throws(() => validateReport(failed), /failed/)
})
