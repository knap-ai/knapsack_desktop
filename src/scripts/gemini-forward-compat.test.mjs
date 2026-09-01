import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const providerModelsPath = new URL('../src-tauri/resources/clawdbot/dist/provider-models-Di4zgFzI.js', import.meta.url)
const providerModelsSource = fs.readFileSync(providerModelsPath, 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace(/^export \{.*\};\n?$/gm, '')

const resolveGoogleGeminiForwardCompatModel = new Function(`
  const normalizeOptionalLowercaseString = (value) => typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : undefined;
  const cloneFirstTemplateModel = ({ providerId, modelId, templateIds, ctx, patch }) => {
    for (const templateId of templateIds) {
      const template = ctx.modelRegistry.find(providerId, templateId);
      if (template) return { ...template, id: modelId, name: modelId, ...patch };
    }
  };
  ${providerModelsSource}
  return resolveGoogleGeminiForwardCompatModel;
`)()

const template = {
  id: 'gemini-3-flash-preview',
  name: 'Gemini 3 Flash',
  provider: 'google',
  api: 'google-generative-ai',
  contextWindow: 1_000_000,
  maxTokens: 65_536,
  reasoning: true,
  input: ['text', 'image'],
}

function resolve(modelId) {
  return resolveGoogleGeminiForwardCompatModel({
    providerId: 'google',
    ctx: {
      modelId,
      modelRegistry: {
        find: (_providerId, templateId) => templateId === template.id ? template : undefined,
      },
    },
  })
}

test('bundled runtime resolves Gemini 3.7 Flash from the Gemini Flash family', () => {
  const model = resolve('gemini-3.7-flash')
  assert.equal(model?.id, 'gemini-3.7-flash')
  assert.equal(model?.provider, 'google')
  assert.equal(model?.api, 'google-generative-ai')
})

test('bundled runtime keeps future Gemini 3.x Flash versions forward compatible', () => {
  assert.equal(resolve('gemini-3.8-flash')?.id, 'gemini-3.8-flash')
})
