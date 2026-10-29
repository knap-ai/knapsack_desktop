// Synthetic formatter/destination/receipt tests only. Never launch Desktop or Slack.
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const { testPlan } = require('./qa-gateway-rust-tests.cjs')
const plan = testPlan()
plan.args[2] = 'slack_notes'
fs.mkdirSync(plan.options.env.HOME, { recursive: true, mode: 0o700 })
const result = spawnSync(plan.command, plan.args, plan.options)
if (result.error) console.error(result.error.message)
process.exitCode = result.status ?? 1
