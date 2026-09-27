// Curated first-party chat models.  Keep this list limited to models that can
// power a conversational agent; image, audio, embedding, and batch-only IDs
// belong in their specialized product surfaces.

import { XAI_MODELS as GENERATED_XAI_MODELS } from './xaiModels'

export type ProviderModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export { OPENAI_MODELS, DEFAULT_OPENAI_MODEL } from './openaiModels'
export { GEMINI_MODELS } from './geminiModels'
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash'

export const GROQ_MODELS: ProviderModelOption[] = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', description: 'Groq’s strongest general-purpose open-weight model with tool use' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', description: 'Very fast, cost-efficient tool-capable open model' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', description: 'Fast reasoning, JSON mode, and parallel tool use' },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', description: 'Large-context agentic coding model on Groq' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Reliable general-purpose option with tool use' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Lowest-latency Groq option for simple tasks' },
  { id: 'groq/compound', name: 'Groq Compound', description: 'Groq-managed system that can selectively use built-in tools' },
  { id: 'groq/compound-mini', name: 'Groq Compound Mini', description: 'Faster Groq-managed system for concise tool-assisted work' },
]

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b'

export const XAI_MODELS: ProviderModelOption[] = GENERATED_XAI_MODELS

export const DEFAULT_XAI_MODEL = 'grok-4.7'

export const TRUSTEDROUTER_MODELS: ProviderModelOption[] = [
  { id: 'trustedrouter/auto', name: 'Auto', description: 'Selects the best healthy route for each request', vision: true },
  { id: 'trustedrouter/zdr', name: 'Zero Data Retention', description: 'Prioritizes providers with zero-retention policies', vision: true },
  { id: 'trustedrouter/e2e', name: 'End-to-End Encrypted', description: 'Routes to end-to-end encrypted provider paths', vision: true },
  { id: 'trustedrouter/eu', name: 'EU Route', description: 'Prioritizes EU-focused eligible routes', vision: true },
  { id: 'trustedrouter/fast', name: 'Fast', description: 'Low-latency route for quick agent loops' },
  { id: 'trustedrouter/cheap', name: 'Cheap', description: 'Cost-conscious route for lightweight work' },
  { id: 'trustedrouter/synth', name: 'Synth', description: 'Panel synthesis across multiple models' },
  { id: 'trustedrouter/socrates-1.1', name: 'Socrates', description: 'Deliberative research and synthesis route' },
  { id: 'trustedrouter/prometheus-1.0', name: 'Prometheus', description: 'Strong open route for deep technical analysis' },
]

export const DEFAULT_TRUSTEDROUTER_MODEL = 'trustedrouter/auto'
