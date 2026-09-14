const assert = require('node:assert/strict')
const test = require('node:test')
const { qaEnv } = require('./qa-dev-run.cjs')

test('gateway-free dev QA enables frontend safety guards', () => {
  const previous = process.env.KNAPSACK_QA_SKIP_GATEWAY
  try {
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '1'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '1')
    process.env.KNAPSACK_QA_SKIP_GATEWAY = '0'
    assert.equal(qaEnv().VITE_KNAPSACK_LOCAL_QA_SAFE, '0')
  } finally {
    if (previous === undefined) delete process.env.KNAPSACK_QA_SKIP_GATEWAY
    else process.env.KNAPSACK_QA_SKIP_GATEWAY = previous
  }
})
