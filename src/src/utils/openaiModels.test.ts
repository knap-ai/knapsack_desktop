import { describe, expect, it } from 'vitest'

import { DEFAULT_OPENAI_MODEL, normalizeOpenAIModelSelection } from './openaiModels'

describe('OpenAI desktop model migration', () => {
  it.each(['gpt-6.1', 'gpt-6.1-sol', 'openai/gpt-6.1', 'openai/gpt-6.1-sol'])(
    'migrates persisted unsupported model %s to the supported default',
    model => {
      expect(normalizeOpenAIModelSelection(model)).toBe(DEFAULT_OPENAI_MODEL)
    },
  )

  it('preserves supported selections and defaults missing values', () => {
    expect(normalizeOpenAIModelSelection('gpt-6-astra')).toBe('gpt-6-astra')
    expect(normalizeOpenAIModelSelection(null)).toBe(DEFAULT_OPENAI_MODEL)
  })
})
