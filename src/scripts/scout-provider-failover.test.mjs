import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const classifierPath = new URL(
  '../src-tauri/resources/clawdbot/dist/result-fallback-classifier-BJuIbeJo.js',
  import.meta.url,
)
const classifierSource = fs.readFileSync(classifierPath, 'utf8')
const classifierFunction = classifierSource.match(
  /function classifyEmbeddedPiRunResultForModelFallback[\s\S]*?\n}(?=\n\/\/\#endregion)/,
)?.[0]
assert.ok(classifierFunction)
assert.match(classifierSource, /import \{ t as classifyFailoverReason \} from "\.\/errors-DYND-qcd\.js";/)

const classifyEmbeddedPiRunResultForModelFallback = new Function(`
  const isEmbeddedPiRunResult = (value) => Boolean(value?.meta);
  const hasVisibleAgentPayload = (result, options) => result.payloads?.some(
    (payload) => typeof payload?.text === 'string' && payload.text.trim() &&
      (!payload.isError || options.includeErrorPayloads) &&
      (!payload.isReasoning || options.includeReasoningPayloads)
  ) ?? false;
  const hasOutboundDeliveryEvidence = () => false;
  const classifyHarnessResult = () => null;
  const classifyFailoverReason = (text) => /^400\\b/.test(text.trim()) ? 'format' : null;
  const isGpt5ModelId = () => false;
  const hasDeliberateSilentTerminalReply = () => false;
  const EMPTY_TERMINAL_REPLY_RE = /Agent couldn't generate a response/i;
  const PLAN_ONLY_TERMINAL_REPLY_RE = /Agent stopped after repeated plan-only turns/i;
  ${classifierFunction}
  return classifyEmbeddedPiRunResultForModelFallback;
`)()

const anthropicWorkspaceError =
  '400 {"type":"error","error":{"type":"invalid_request_error","message":"This API key is not scoped to a workspace, so this request must include the anthropic-workspace-id header."}}'

test('Scout falls back when Anthropic returns a workspace-scoping error as an error payload', () => {
  const classification = classifyEmbeddedPiRunResultForModelFallback({
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    result: {
      meta: {},
      payloads: [{ text: anthropicWorkspaceError, isError: true }],
    },
  })

  assert.equal(classification?.reason, 'format')
  assert.equal(classification?.code, 'provider_error_result')
  assert.match(classification?.message ?? '', /anthropic-workspace-id/)
})

test('Scout falls back when a provider error is embedded in run metadata', () => {
  const classification = classifyEmbeddedPiRunResultForModelFallback({
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    result: {
      meta: { error: new Error(anthropicWorkspaceError) },
      payloads: [],
    },
  })

  assert.equal(classification?.reason, 'format')
  assert.equal(classification?.code, 'provider_error_result')
})

test('Scout accepts a successful Anthropic response without invoking fallback', () => {
  const classification = classifyEmbeddedPiRunResultForModelFallback({
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    result: {
      meta: {},
      payloads: [{ text: 'Anthropic is working.', isError: false }],
    },
  })

  assert.equal(classification, null)
})
