// Filesystem-only unit tests under the established compiled QA identity. No app launch.
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const { testPlan } = require('./qa-gateway-rust-tests.cjs')
const plan = testPlan()
plan.args[2] = 'meeting_notes_revision'
fs.mkdirSync(plan.options.env.HOME, { recursive: true, mode: 0o700 })
const result = spawnSync(plan.command, plan.args, plan.options)
if (result.error) console.error(result.error.message)
process.exitCode = result.status ?? 1
