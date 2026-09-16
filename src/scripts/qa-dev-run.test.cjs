const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { qaEnv } = require('./qa-dev-run.cjs')

test('all dev QA modes enable frontend safety guards', () => {
  const previous = process.env.KNAPSACK_QA_SKIP_GATEWAY
  try {
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '1'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '0'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
  } finally {
    if (previous === undefined) delete process.env.KNAPSACK_QA_SKIP_GATEWAY
    else process.env.KNAPSACK_QA_SKIP_GATEWAY = previous
  }
})

test('macOS dev QA creates a self-contained signed app bundle', () => {
  const launcher = fs.readFileSync(path.join(__dirname, 'qa-dev-run.cjs'), 'utf8')

  assert.match(
    launcher,
    /fs\.cpSync\(debugResources, path\.join\(resourcesDir, "resources"\), \{\s*recursive: true,/,
  )
  assert.doesNotMatch(
    launcher,
    /fs\.symlinkSync\(debugResources, path\.join\(resourcesDir, "resources"\)\)/,
  )
  assert.match(
    launcher,
    /spawnSync\(\s*"codesign",\s*\["--force", "--deep", "--sign", "-", qaAppBundle\]/,
  )
  assert.match(launcher, /if \(signResult\.status !== 0\) \{\s*throw new Error\(/)
})
