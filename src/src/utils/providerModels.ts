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

export const OPENAI_MODELS: ProviderModelOption[] = [
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', description: 'Frontier reasoning and coding for complex professional work', vision: true },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', description: 'Best balance of intelligence, speed, and cost for most work', vision: true },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', description: 'Fast, economical model for high-volume everyday tasks', vision: true },
]

export const DEFAULT_OPENAI_MODEL = 'gpt-5.6-terra'

export const GEMINI_MODELS: ProviderModelOption[] = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Newest stable Flash model for agents, coding, and complex enterprise work', vision: true },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', description: 'Previous-generation stable Flash model for reliable multi-step work', vision: true },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'Stable Flash option for production compatibility', vision: true },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Fast, broadly capable model for general work', vision: true },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', description: 'Lowest-cost current Gemini option for high-volume tasks', vision: true },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', description: 'Advanced reasoning and agentic coding for evaluation workloads', vision: true },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', description: 'Preview frontier-class Flash performance', vision: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', description: 'Earlier low-cost Gemini 3 option', vision: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Legacy access for existing projects that already use Gemini 2.5', vision: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Legacy access for existing projects that already use Gemini 2.5', vision: true },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Legacy low-cost option for existing Gemini 2.5 projects', vision: true },
]

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
