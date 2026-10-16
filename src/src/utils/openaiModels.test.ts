import { describe, expect, it } from 'vitest'

import { DEFAULT_OPENAI_MODEL } from './openaiModels'
import {
  isUnsupportedOpenAIModelSelection,
  normalizeOpenAIModelSelection,
} from './openaiModelSelection'

describe('OpenAI desktop model migration', () => {
  it.each(['gpt-6.1', 'gpt-6.1-sol', 'openai/gpt-6.1', 'openai/gpt-6.1-sol'])(
    'preserves persisted unsupported model %s and marks it action-required',
    model => {
      expect(normalizeOpenAIModelSelection(model)).toBe(model)
      expect(isUnsupportedOpenAIModelSelection(model)).toBe(true)
    },
  )

  it('preserves supported selections and defaults missing values', () => {
    expect(normalizeOpenAIModelSelection('gpt-6-astra')).toBe('gpt-6-astra')
    expect(isUnsupportedOpenAIModelSelection('gpt-6-astra')).toBe(false)
    expect(normalizeOpenAIModelSelection(null)).toBe(DEFAULT_OPENAI_MODEL)
  })
})
