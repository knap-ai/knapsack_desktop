const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const suites = {
  'src/utils/meetingSpeakerIdentity.test.ts': 4,
  'src/utils/meetingNotesEdits.test.ts': 18,
  'src/components/organisms/MeetingNotesMode/useNotesEditReview.test.tsx': 12,
  'src/components/organisms/MeetingsTabView/templatePersistence.test.tsx': 17,
  'src/hooks/feed/setThread.consumer.test.tsx': 5,
}
function validateReport(report) {
  if (!report || !Array.isArray(report.testResults) || report.numPendingTests || report.numTodoTests || report.numFailedTests || report.numFailedTestSuites) throw new Error('Focused regression tests failed, were skipped, or produced no valid report.')
  for (const [file, minimum] of Object.entries(suites)) {
    const suite = report.testResults.find(row => row.name?.replace(/\\/g, '/').endsWith('/' + file))
    if (!suite || suite.status !== 'passed' || !Array.isArray(suite.assertionResults) || suite.assertionResults.length < minimum || suite.assertionResults.some(test => test.status !== 'passed')) throw new Error(`Missing, filtered, skipped or failed regression coverage: ${file} (minimum ${minimum})`)
  }
  const minimum = Object.values(suites).reduce((sum, count) => sum + count, 0)
  if (report.numTotalTests < minimum || report.numPassedTests !== report.numTotalTests) throw new Error('Incomplete focused regression test totals.')
  return { files: Object.keys(suites).length, tests: report.numTotalTests }
}
function main() {
  const root = path.resolve(__dirname, '..')
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'knapsack-notes-tests-'))
  const reportPath = path.join(folder, 'results.json')
  try {
    const result = spawnSync(process.execPath, [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', path.join(__dirname, 'meeting-notes-vitest.config.mjs'), '--reporter=default', '--reporter=json', `--outputFile.json=${reportPath}`, ...Object.keys(suites)], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true })
    if (result.error || result.status !== 0) throw result.error || new Error(`Focused regression runner exited ${result.status}`)
    const coverage = validateReport(JSON.parse(fs.readFileSync(reportPath, 'utf8')))
    console.log(`Required focused coverage passed: ${coverage.files} files, ${coverage.tests} tests; none skipped.`)
  } finally { fs.rmSync(folder, { recursive: true, force: true }) }
}
if (require.main === module) { try { main() } catch (error) { console.error(error.message); process.exitCode = 1 } }
module.exports = { suites, validateReport }
