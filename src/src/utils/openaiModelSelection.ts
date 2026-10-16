import { DEFAULT_OPENAI_MODEL } from './openaiModels'

const UNSUPPORTED_DESKTOP_OPENAI_MODELS = new Set(['gpt-6.1', 'gpt-6.1-sol'])

const bareOpenAIModel = (model: string): string =>
  model.startsWith('openai/') ? model.slice('openai/'.length) : model

/** Preserve persisted choices so the UI can disclose action-required state. */
export function normalizeOpenAIModelSelection(model: string | null | undefined): string {
  const trimmed = model?.trim()
  if (!trimmed) return DEFAULT_OPENAI_MODEL
  const bare = bareOpenAIModel(trimmed)
  if (bare === 'gpt-5.4-pro' || bare === 'gpt-5.5-pro') return DEFAULT_OPENAI_MODEL
  return trimmed
}

export function isUnsupportedOpenAIModelSelection(model: string | null | undefined): boolean {
  const trimmed = model?.trim()
  if (!trimmed) return false
  return UNSUPPORTED_DESKTOP_OPENAI_MODELS.has(bareOpenAIModel(trimmed).toLowerCase())
}
