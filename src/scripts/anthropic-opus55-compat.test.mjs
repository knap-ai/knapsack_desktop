import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../src-tauri/resources/clawdbot/dist/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
function extract(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, name);
  return source.slice(start, source.indexOf('\n}', start) + 2);
}
const registrySource = read('register.runtime-P0LnjgrC.js');
const resolve = new Function('cloneFirstTemplateModel', `
  const PROVIDER_ID = 'anthropic';
  const ANTHROPIC_OPUS_47_MODEL_ID = 'claude-opus-4-7';
  const ANTHROPIC_OPUS_47_DOT_MODEL_ID = 'claude-opus-4.7';
  const ANTHROPIC_OPUS_46_MODEL_ID = 'claude-opus-4-6';
  const ANTHROPIC_OPUS_46_DOT_MODEL_ID = 'claude-opus-4.6';
  const ANTHROPIC_OPUS_47_TEMPLATE_MODEL_IDS = [];
  const ANTHROPIC_OPUS_TEMPLATE_MODEL_IDS = [];
  const ANTHROPIC_SONNET_46_MODEL_ID = 'claude-sonnet-4-6';
  const ANTHROPIC_SONNET_46_DOT_MODEL_ID = 'claude-sonnet-4.6';
  const ANTHROPIC_SONNET_TEMPLATE_MODEL_IDS = [];
  const resolveAnthropic46ForwardCompatModel = () => undefined;
  ${extract(registrySource, 'resolveAnthropicForwardCompatModel')}
  return resolveAnthropicForwardCompatModel;
`)(({ modelId, templateIds, patch, ctx }) => {
  for (const id of templateIds) {
    const template = ctx.modelRegistry.find('anthropic', id);
    if (template) return { ...template, id: modelId, ...patch };
  }
});
const template = { id: 'claude-opus-4-7', provider: 'anthropic', api: 'anthropic-messages', input: ['text', 'image'] };
for (const modelId of ['claude-opus-5-5', 'claude-opus-5.5']) {
  test(`resolves ${modelId} with canonical API ID and current token limits`, () => {
    const model = resolve({ modelId, modelRegistry: { find: (_p, id) => id === template.id ? template : undefined } });
    assert.equal(model.id, 'claude-opus-5-5');
    assert.equal(model.api, 'anthropic-messages');
    assert.equal(model.contextWindow, 1000000);
    assert.equal(model.maxTokens, 128000);
    assert.equal(model.reasoning, true);
  });
}
const shared = read('provider-stream-shared-jI_a6bxx.js');
const wrapperSource = read('stream-wrappers-CFrR0IZH.js');
const wrap = new Function(`
  ${extract(read('moonshot-thinking-stream-wrappers-D3FMTw1i.js'), 'streamWithPayloadPatch')}
  ${['isAnthropicThinkingEnabled', 'assistantMessageHasAnthropicToolUse', 'stripTrailingAssistantPrefillMessages', 'stripTrailingAnthropicAssistantPrefillWhenThinking'].map(n => extract(shared, n)).join('\n')}
  ${extract(wrapperSource, 'createAnthropicOpus55ThinkingWrapper')}
  return createAnthropicOpus55ThinkingWrapper;
`)();
function request(level, id = 'claude-opus-5-5', api = 'anthropic-messages') {
  const payload = { thinking: { type: level === 'off' ? 'disabled' : 'enabled', budget_tokens: 1024 }, temperature: 1, output_config: { format: { type: 'json_schema' } }, messages: [{ role: 'user', content: 'test' }, { role: 'assistant', content: 'prefill' }] };
  let callbackRan = false;
  const stream = (_model, _context, options) => { options.onPayload?.(payload); return payload; };
  const result = wrap(stream, level)({ id, api }, {}, { onPayload: () => { callbackRan = true; } });
  assert.equal(callbackRan, true);
  return result;
}
for (const [level, effort] of [['off', 'low'], ['minimal', 'low'], ['low', 'low'], ['medium', 'medium'], ['high', 'high'], ['xhigh', 'xhigh'], ['max', 'max'], ['adaptive', 'medium']]) {
  test(`Opus 5.5 ${level} emits adaptive thinking with ${effort} effort`, () => {
    const payload = request(level);
    assert.deepEqual(payload.thinking, { type: 'adaptive' });
    assert.equal(payload.output_config.effort, effort);
    assert.deepEqual(payload.output_config.format, { type: 'json_schema' });
    assert.equal('temperature' in payload, false);
    assert.equal(payload.messages.at(-1).role, 'user');
  });
}
test('older Anthropic models retain their existing thinking payload', () => {
  assert.equal(request('off', 'claude-opus-4-7').thinking.type, 'disabled');
});
test('other transports are not rewritten', () => {
  assert.equal(request('off', 'claude-opus-5-5', 'openai-completions').thinking.type, 'disabled');
});
test('provider composition installs the compatibility wrapper', () => {
  assert.match(extract(wrapperSource, 'wrapAnthropicProviderStream'), /createAnthropicOpus55ThinkingWrapper\(streamFn, ctx.thinkingLevel\)/);
});

test('dot alias is serialized as the canonical Anthropic API ID', () => {
  assert.equal(request('medium', 'claude-opus-5.5').model, 'claude-opus-5-5');
});
test('adaptive normalization preserves assistant tool-use turns', () => {
  const payload = { thinking: { type: 'disabled' }, messages: [{ role: 'assistant', content: [{ type: 'tool_use', id: 'call1', name: 'test', input: {} }] }] };
  const stream = (_model, _context, options) => { options.onPayload(payload); return payload; };
  const result = wrap(stream, 'off')({ id: 'claude-opus-5-5', api: 'anthropic-messages' }, {}, {});
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].content[0].type, 'tool_use');
});
test('Opus 5.5 thinking profile does not advertise unsupported disabled thinking', () => {
  const source = read('provider-model-shared-DtsPmvDx.js');
  const profile = new Function(`
    const normalizeOptionalLowercaseString = value => value?.trim().toLowerCase();
    ${extract(source, 'resolveClaudeThinkingProfile')}
    return resolveClaudeThinkingProfile;
  `)()('claude-opus-5-5');
  assert.equal(profile.defaultLevel, 'adaptive');
  assert.deepEqual(profile.levels.map(x => x.id), ['low', 'medium', 'high', 'xhigh', 'adaptive', 'max']);
});
