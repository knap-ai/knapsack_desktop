import './style.scss'

import { useEffect, useMemo, useState, useCallback, memo, useRef, type ReactNode } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { openBesideApp } from 'src/utils/openBesideApp'
import { emit, listen as tauriListen } from '@tauri-apps/api/event'
import { open as shellOpen } from '@tauri-apps/api/shell'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import dayjs from 'dayjs'
import { QRCodeSVG } from 'qrcode.react'
import WorkspacePicker from '../../molecules/WorkspacePicker'
import { useChannelStatus } from 'src/hooks/channels/useChannelStatus'
import type { ChannelStatus } from 'src/api/channels'
import { checkSignalCli, installSignalCli, signalLink, signalRegister, signalVerify, type SignalCliStatus, getChannelAllowlist, updateChannelAllowlist } from 'src/api/channels'
import DataFetcher, { getCalendarEvents } from 'src/utils/data_fetch'
import { INITIAL_BRIEFING_INSTRUCTIONS } from 'src/prompts'
import { DeveloperModePanel } from 'src/components/organisms/DeveloperModePanel'
import { TokenCostsView } from 'src/components/organisms/ActivityPanel'
import { detectBuildIntent, extractProjectDescription } from 'src/utils/devIntentDetector'
import { dispatchDevPopulate, dispatchOpenDevPanel } from 'src/utils/devModeEvents'
import { getAgentMemory, saveAgentMemory } from 'src/automations/agentMemory'

// Prompt action prefix used by the AI to embed executable actions in messages.
// Format in raw AI text: [Label](knapsack://prompt/Detailed instruction)
// We strip these from the markdown and render them as numbered clickable buttons.
// NOTE: A simple regex like /\[...\]\(knapsack:\/\/prompt\/([^)]*)\)/ breaks when
// the prompt text contains parentheses (e.g. "(1) do X, (2) do Y").
// Instead we parse with balanced-parenthesis counting.

type PromptAction = { label: string; prompt: string }

// All recognized prompt link prefixes — the AI may use any of these forms
const PROMPT_MARKERS = ['knapsack://prompt/', 'knapsack://prompt=', 'knapsack://prompt(']

// Check if string starts with any prompt marker, return the matched marker or null
function matchPromptMarker(s: string): string | null {
  for (const m of PROMPT_MARKERS) {
    if (s.startsWith(m)) return m
  }
  return null
}

// Extract prompt actions from message text and return cleaned markdown + actions.
// Handles prompts that contain literal parentheses by counting nesting depth.
function extractPromptActions(md: string): { cleaned: string; actions: PromptAction[] } {
  const actions: PromptAction[] = []
  let result = ''
  let i = 0

  while (i < md.length) {
    // Look for "[" that might start a markdown link
    const bracketOpen = md.indexOf('[', i)
    if (bracketOpen === -1) {
      result += md.slice(i)
      break
    }

    // Append everything before this bracket
    result += md.slice(i, bracketOpen)

    // Find matching "]"
    const bracketClose = md.indexOf(']', bracketOpen + 1)
    if (bracketClose === -1) {
      result += md.slice(bracketOpen)
      break
    }

    // Check for "](knapsack://prompt/" or "](knapsack://prompt=" after "]"
    // Allow optional whitespace/newlines between "]" and "("
    const afterBracket = md.slice(bracketClose + 1)
    const wsMatch = afterBracket.match(/^(\s*)\(/)
    const wsLen = wsMatch ? wsMatch[1].length : -1
    // Must start with optional whitespace + "(" then a prompt marker
    const markerContent = wsLen >= 0 ? afterBracket.slice(wsLen + 1) : ''
    const matchedMarker = matchPromptMarker(markerContent)
    if (!matchedMarker) {
      // Not a prompt link — emit the bracket and continue
      result += md[bracketOpen]
      i = bracketOpen + 1
      continue
    }

    // Extract label
    const label = md.slice(bracketOpen + 1, bracketClose)

    // Find the closing ")" with balanced parentheses
    const parenStart = bracketClose + 1 + wsLen // position of "(" (skip any whitespace)
    let depth = 0
    let j = parenStart
    let parenEnd = -1
    while (j < md.length) {
      if (md[j] === '(') {
        depth++
      } else if (md[j] === ')') {
        depth--
        if (depth === 0) {
          parenEnd = j
          break
        }
      }
      j++
    }

    if (parenEnd === -1) {
      // Unbalanced — fall back: take everything to end of line or end of string
      const lineEnd = md.indexOf('\n', parenStart)
      parenEnd = lineEnd === -1 ? md.length - 1 : lineEnd - 1
    }

    // Extract prompt (everything after the matched marker and before closing ")")
    let prompt = md.slice(parenStart + 1 + matchedMarker.length, parenEnd)

    // When the AI uses knapsack://prompt(...) (function-call style), the "(" in
    // the marker opens a paren whose matching ")" is still in the extracted text.
    // Strip that trailing ")".
    if (matchedMarker === 'knapsack://prompt(' && prompt.endsWith(')')) {
      prompt = prompt.slice(0, -1)
    }

    // If the prompt contains raw tool calls (send_email(...), run_command(...), etc.)
    // or raw HTML tags, convert to a clean natural-language instruction using the label.
    if (/<[a-z]+[>\s/]/.test(prompt) || /^(send_email|run_command|navigate|click|type)\s*\(/.test(prompt)) {
      prompt = label
    }

    actions.push({ label, prompt })
    // Don't insert inline text — actions render as clickable buttons below the message
    i = parenEnd + 1
  }

  // Collapse runs of 3+ newlines left after stripping prompt links
  let cleaned = result.replace(/\n{3,}/g, '\n\n').trim()

  // Deduplicate: if the cleaned text ends with (or equals) an action label,
  // the AI repeated the suggestion both inline and as a prompt link — strip it.
  for (const action of actions) {
    const label = action.label.trim()
    if (!label) continue
    // Check if cleaned text ends with the label (possibly followed by punctuation/whitespace)
    const idx = cleaned.lastIndexOf(label)
    if (idx !== -1) {
      const before = cleaned.slice(0, idx).trim()
      const after = cleaned.slice(idx + label.length).trim()
      // Only strip if the remaining "after" portion is empty or just punctuation
      if (!after || /^[?.!]+$/.test(after)) {
        cleaned = before
      }
    }
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  // Safety net: if cleaned text still contains raw knapsack://prompt links that
  // weren't extracted (e.g., malformed markdown), strip those lines entirely.
  cleaned = cleaned.replace(/\[([^\]]*)\]\s*\(knapsack:\/\/prompt[^)]*\)/g, '').trim()
  cleaned = cleaned.replace(/knapsack:\/\/prompt\S*/g, '').trim()
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()

  return { cleaned, actions }
}

// Convert raw API/JSON error messages into user-friendly text
function getActiveModelLabel(): string {
  // Default to 'anthropic' — it is the primary onboarding provider.
  // 'openai' as fallback caused Anthropic-only users to see "openai/gpt-5.4 rate limited".
  const provider = localStorage.getItem('moltbot_active_provider') || 'anthropic'
  const modelKeys: Record<string, string> = {
    openai: 'moltbot_openai_model',
    anthropic: 'moltbot_anthropic_model',
    gemini: 'moltbot_gemini_model',
    knapsack: KNAPSACK_MODEL_STORAGE,
    groq: 'moltbot_groq_model',
    openrouter: 'moltbot_openrouter_model',
    ollama: 'moltbot_ollama_model',
    xai: 'moltbot_xai_model',
  }
  const model = localStorage.getItem(modelKeys[provider] || '') || ''
  if (model) return `${provider}/${model}`
  return provider
}

function friendlyError(raw: string, activeModel?: string): string {
  if (!raw) return 'Something went wrong. Please try again.'
  const lower = raw.toLowerCase()
  if (!activeModel) activeModel = getActiveModelLabel()
  const switchProviderAction = `[Switch to a different model](knapsack://prompt/__open_provider_settings__)`
  const addApiKeyAction = `[Add a backup provider](knapsack://prompt/__open_provider_settings__)`
  const fixApiKeyAction = `[Fix API key in Settings](knapsack://prompt/__open_provider_settings__)`

  // All providers failed (fallback exhausted)
  if (lower.includes('all fallback providers also failed')) {
    return `⚠️ **All AI providers are unavailable** (active: \`${activeModel}\`). Your primary provider hit its credit/rate limit and no fallback provider could handle the request. Add additional API keys in Settings for automatic failover.\n\n${addApiKeyAction}`
  }
  // OpenAI quota / billing errors
  if (lower.includes('insufficient_quota') || lower.includes('exceeded your current quota')) {
    return `⚠️ **API quota exceeded** (active: \`${activeModel}\`). Your OpenAI account has run out of credits or hit its spending limit. Add another provider's API key in Settings for automatic failover, or check your billing at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing).\n\n${addApiKeyAction}`
  }
  // Anthropic credit errors
  if (lower.includes('anthropic') && (lower.includes('credit') || lower.includes('billing') || lower.includes('exceeded'))) {
    return `⚠️ **Anthropic credit limit reached** (active: \`${activeModel}\`). Add another provider's API key in Settings for automatic failover, or check your Anthropic billing at [console.anthropic.com](https://console.anthropic.com).\n\n${addApiKeyAction}`
  }
  // Gemini monthly spending cap (429 with budget exhausted — different from a per-minute rate limit)
  if (lower.includes('spending cap') || lower.includes('monthly spending') || (lower.includes('exceeded') && lower.includes('ai studio'))) {
    return `⚠️ **Gemini monthly spending cap reached** (active: \`${activeModel}\`). Your Google AI Studio project has hit its monthly budget limit. [Manage your spending cap at ai.studio/spend](https://ai.studio/spend), or switch to a different provider in Settings → Provider.\n\n${switchProviderAction}`
  }
  // No API key configured for provider (must check before 429 — gateway wraps this as "HTTP 429: No API key found")
  if (lower.includes('no api key found') || lower.includes('no api key for') || lower.includes('configure auth for this agent')) {
    return `🔑 **No API key configured for \`${activeModel}\`.** Add your API key in Settings → Provider.\n\n${fixApiKeyAction}`
  }
  // Rate limit (but not quota, and not a missing-key auth error)
  if (lower.includes('rate_limit') || lower.includes('rate limit') || (lower.includes('429') && !lower.includes('insufficient_quota') && !lower.includes('api key'))) {
    return `⏳ **Rate limited** (active: \`${activeModel}\`). Too many requests — please wait a moment and try again, or switch to a different model in Settings → Provider.\n\n${switchProviderAction}`
  }
  // Invalid API key
  if (lower.includes('invalid_api_key') || lower.includes('incorrect api key')) {
    return `🔑 **Invalid API key** (active: \`${activeModel}\`). Please check your key in Settings and try again.\n\n${fixApiKeyAction}`
  }
  // Auth error
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return `🔒 **Authentication failed** (active: \`${activeModel}\`). Your API key may be invalid or expired. Update it in Settings.\n\n${fixApiKeyAction}`
  }
  // Model not found / access
  if (lower.includes('model_not_found') || lower.includes('does not exist') || lower.includes('no access')) {
    return `⚠️ **Model not available** (active: \`${activeModel}\`). Your API key may not have access to this model. Try switching to a different model in Settings.\n\n${switchProviderAction}`
  }
  // Playwright / snapshot not available in gateway build
  if (lower.includes('playwright') || lower.includes('snapshot() is unsupported') || lower.includes('not available in this gateway build')) {
    return '📸 **Screenshot unavailable.** The browser screenshot feature (Playwright) is not installed in the current gateway build. Reinstall Knapsack to get the latest gateway version, then try again.'
  }
  // Ollama context size exceeded
  if (lower.includes('exceed_context_size_error') || lower.includes('exceeds the available context size') || (lower.includes('n_ctx') && lower.includes('n_prompt_tokens'))) {
    const ctxMatch = raw.match(/"n_ctx"\s*:\s*(\d+)/)
    const tokMatch = raw.match(/"n_prompt_tokens"\s*:\s*(\d+)/)
    const ctx = ctxMatch ? parseInt(ctxMatch[1]).toLocaleString() : null
    const tok = tokMatch ? parseInt(tokMatch[1]).toLocaleString() : null
    const detail = ctx && tok ? ` The conversation is ${tok} tokens but this Ollama model only supports ${ctx}.` : ''
    return `⚠️ **Ollama context limit reached** (active: \`${activeModel}\`).${detail} To fix: start a new conversation to reduce context, or switch to a model with a larger context window in Settings → Provider.\n\n${switchProviderAction}`
  }
  // Context / prompt too large for model
  if (lower.includes('context overflow') || lower.includes('prompt too large') || (lower.includes('too large') && lower.includes('model'))) {
    return `⚠️ **Context overflow** (active: \`${activeModel}\`). The conversation is too long for this model. Start a new conversation to reduce context size, or switch to a model with a larger context window in Settings → Provider.\n\n${switchProviderAction}`
  }
  // Browser automation errors
  if (lower.includes('browser control server') || lower.includes('browser not running') || lower.includes('clawdbot base_url is not configured')) {
    return '🌐 **Browser not available.** The browser assistant is not running. Go to Settings and enable Clawd, then try again.'
  }
  if (lower.includes('no pages available') || lower.includes('tab not found') || lower.includes('no tabs')) {
    return '🌐 **No browser tab found.** Open a URL first (e.g. "open https://example.com") and try again.'
  }
  if (lower.includes('no supported browser found') || lower.includes('chrome') && lower.includes('not found')) {
    return '🌐 **Chrome not found.** Install Google Chrome or Chromium and try again.'
  }
  if (lower.includes('failed to start chrome cdp')) {
    return '🌐 **Browser failed to start.** Chrome could not launch. Check the logs for details or try restarting.'
  }
  // Network / connection errors
  // WebKit raises "TypeError: Load failed" when the AI request is blocked
  // (context window overflow, oversized payload, or DNS/network hang).
  // The most common cause is a conversation that's grown too long for the model.
  if (lower.includes('load failed') && !lower.includes('model')) {
    return `⚠️ **Message too large** (active: \`${activeModel}\`). The conversation or payload exceeded what this model can handle. Start a new conversation to reduce context size${activeModel ? `, or switch to a larger-context model in Settings → Provider` : ''}.\n\n${switchProviderAction}`
  }
  if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('fetch failed')) {
    return `🌐 **Connection error** (active: \`${activeModel}\`). Unable to reach the AI service. Check your internet connection and try again.`
  }
  // Timeout
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return `⏰ **Request timed out** (active: \`${activeModel}\`). The AI took too long to respond. Try a simpler request or try again.`
  }
  // Tool loop exceeded
  if (lower.includes('tool loop exceeded')) {
    return `🔄 **Task too complex** (active: \`${activeModel}\`). The AI hit its action limit for this request. Try breaking it into smaller steps.`
  }
  // Image/vision not supported by model (e.g. Groq non-vision models)
  if (lower.includes('content must be a string') || lower.includes('does not support images')) {
    return `🖼️ **This model (\`${activeModel}\`) does not support image attachments.** Remove the image from your message, or switch to a vision-capable model in Settings → Provider.`
  }
  // Model doesn't support tool/function calling (e.g. deepseek-r1, some Ollama models)
  if (lower.includes('does not support tools') || lower.includes('does not support function') || lower.includes('tool use is not supported')) {
    return `🔧 **This model (\`${activeModel}\`) does not support tool use.** Knapsack needs tool calling to run actions like browsing, reading files, and executing commands. Switch to a model that supports tools (e.g. Llama 3.1, Qwen 2.5, or Mistral) in Settings.`
  }
  // Unsupported parameter value (e.g. temperature on reasoning models)
  if (lower.includes('unsupported value') && lower.includes('temperature')) {
    return `⚠️ **Parameter not supported by \`${activeModel}\`.** This is a reasoning model that doesn't allow custom temperature. This has been fixed — please try again.`
  }
  // If it looks like raw JSON, extract the meaningful part
  if (raw.includes('"message"') && raw.includes('"error"')) {
    try {
      const parsed = JSON.parse(raw)
      const msg = parsed?.error?.message || parsed?.message || parsed?.error
      if (msg && typeof msg === 'string') return `⚠️ ${msg}`
    } catch { /* not JSON, fall through */ }
  }
  // Strip common prefixes that leak internals
  const cleaned = raw
    .replace(/^OpenAI error:?\s*/i, '')
    .replace(/^OpenAI error after \d+ retries:?\s*/i, '')
    .replace(/^OpenAI HTTP \d+[^:]*:?\s*/i, '')
    .replace(/^Anthropic error:?\s*/i, '')
    .replace(/^Anthropic error after \d+ retries:?\s*/i, '')
    .replace(/^Anthropic HTTP \d+[^:]*:?\s*/i, '')
    .replace(/^Gemini error:?\s*/i, '')
    .replace(/^Gemini error after \d+ retries:?\s*/i, '')
    .replace(/^Gemini HTTP \d+[^:]*:?\s*/i, '')
    .replace(/^groq error:?\s*/i, '')
    .replace(/^groq error after \d+ retries:?\s*/i, '')
    .replace(/^groq HTTP \d+[^:]*:?\s*/i, '')
  // After prefix stripping, the remainder may be parseable JSON from the provider
  if (cleaned.includes('{')) {
    try {
      const parsed = JSON.parse(cleaned)
      const msg = parsed?.error?.message || parsed?.message || parsed?.error
      if (msg && typeof msg === 'string') return `⚠️ ${msg} (active: \`${activeModel}\`)`
    } catch { /* not valid JSON, fall through */ }
  }
  // If still very long, truncate rather than hiding the error entirely
  if (cleaned.length > 200) {
    return `⚠️ ${cleaned.slice(0, 180)}… (active: \`${activeModel}\`)`
  }
  return `⚠️ ${cleaned} (active: \`${activeModel}\`)`
}

type Role = 'system' | 'user' | 'assistant'

type Msg = {
  id: string
  role: Role
  text: string
  ts: number
  isClickable?: boolean
  model?: string // model used for this response (e.g. "gpt-4o-mini")
  promptActions?: PromptAction[] // pre-defined actions (skip extractPromptActions parsing)
  replyTo?: string // ID of the message this is a reply to
  confirmedActionPrompts?: string[] // prompts whose action buttons have been resolved inline
}

type ServiceStatus = {
  success: boolean
  installed: boolean
  running: boolean
  label: string
  message: string
}

type ServiceHealth = {
  success: boolean
  gateway_ok: boolean
  browser_ok: boolean
  message: string
  diagnostic_type?: string
}

const HEALTH_POLL_INTERVAL_MS = 3000
const GATEWAY_HEADER_GRACE_POLLS = 5 // ~15s: soft status can say reconnecting
const BROWSER_HEADER_GRACE_POLLS = 5 // ~15s: soft status can say browser starting
const GATEWAY_CARD_GRACE_POLLS = 30 // ~90s: avoid scary cards during normal restarts
const BROWSER_CARD_GRACE_POLLS = 40 // ~120s: Chrome/CDP often warms up after gateway

type Tab = {
  targetId: string
  url?: string
  title?: string
}

type TabsResponse = {
  success: boolean
  running: boolean
  tabs: Tab[]
  message?: string
}

type ApiKeyStatus = {
  success: boolean
  has_key: boolean
  message?: string
  model?: string
  active_provider?: string
  has_openai_key?: boolean
  has_anthropic_key?: boolean
  has_gemini_key?: boolean
  has_groq_key?: boolean
  has_xai_key?: boolean
  has_openrouter_key?: boolean
  has_knapsack?: boolean
  knapsack_email?: string
  knapsack_model?: string
  openai_key_hint?: string
  anthropic_key_hint?: string
  gemini_key_hint?: string
  groq_key_hint?: string
  xai_key_hint?: string
  openrouter_key_hint?: string
  ollama_enabled?: boolean
  ollama_model?: string
  ollama_base_url?: string
  extra_providers?: Array<{ env_var: string; has_key: boolean; key_hint?: string }>
  preferred_coding_agent?: string
}

type SkillInfo = {
  name: string
  description?: string
  emoji?: string
  eligible?: boolean
  enabled?: boolean
  source?: string // built-in, OpenClaw, managed, workspace, extra
  macOnly?: boolean
  missing?: string[] // missing requirements
  installOptions?: Array<{ id: string; label: string; command?: string }>
  primaryEnv?: string
  userInvocable?: boolean
  externalApi?: boolean // true if this skill sends data to external APIs
  homepage?: string // URL for skill detail page (from gateway)
}

type Provider = 'knapsack' | 'openai' | 'anthropic' | 'gemini' | 'groq' | 'xai' | 'openrouter' | 'ollama'

type ProviderOption = {
  id: Provider
  name: string
  description: string
  keyPrefix: string
  helpUrl: string
}

const KNAPSACK_MODELS = [
  { id: 'auto', name: 'Auto', description: 'Knapsack selects the best available model for your account' },
]
const KNAPSACK_MODEL_STORAGE = 'knapsack_knapsack_model'

const PROVIDERS: ProviderOption[] = [
  { id: 'knapsack', name: 'Knapsack', description: 'Powered by Knapsack — no API key needed', keyPrefix: '', helpUrl: 'https://studio.knapsack.ai' },
  { id: 'openai', name: 'OpenAI', description: 'GPT-5.5, GPT-5.4, o3', keyPrefix: 'sk-', helpUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude Fable 5, Opus 4.7, Sonnet 4.6, Haiku 4.5', keyPrefix: 'sk-ant-', helpUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'gemini', name: 'Google', description: 'Gemini 3.1 Pro, 3.5 Flash, 3 Flash, 2.5 Pro', keyPrefix: 'AI', helpUrl: 'https://aistudio.google.com/apikey' },
  { id: 'groq', name: 'Groq', description: 'GPT-OSS, Llama 4, Kimi K2 — ultra-fast', keyPrefix: 'gsk_', helpUrl: 'https://console.groq.com/keys' },
  { id: 'xai', name: 'Grok (xAI)', description: 'Grok 4.20, Grok 4 Fast, Grok Code Fast', keyPrefix: 'xai-', helpUrl: 'https://console.x.ai/' },
  { id: 'openrouter', name: 'OpenRouter', description: 'Free & paid models from many providers', keyPrefix: 'sk-or-', helpUrl: 'https://openrouter.ai/keys' },
  { id: 'ollama', name: 'Ollama', description: 'Local models — free, private, no API key', keyPrefix: '', helpUrl: 'https://ollama.com' },
]

type AnthropicModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const ANTHROPIC_MODELS: AnthropicModelOption[] = [
  { id: 'claude-fable-5', name: 'Claude Fable 5', description: 'Latest Anthropic flagship, upgraded reasoning and coding', vision: true },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', description: 'Latest flagship, best coding and vision (May 2026)', vision: true },
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: 'Previous flagship, excellent for agents and coding', vision: true },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: 'Best balance of speed and intelligence', vision: true },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest, near-frontier at low cost', vision: true },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Previous Sonnet, still excellent', vision: true },
  { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', description: 'Older flagship, excellent for long tasks', vision: true },
]

type GeminiModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const GEMINI_MODELS: GeminiModelOption[] = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', description: 'Most intelligent, state-of-the-art reasoning', vision: true },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Fast, broadly capable default for general work', vision: true },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast frontier-class performance', vision: true },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Cost-efficient for high-volume tasks', vision: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Stable, excellent reasoning and coding', vision: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient with thinking', vision: true },
]

type GroqModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const GROQ_MODELS: GroqModelOption[] = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', description: 'OpenAI open-weight flagship, tools built-in' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', description: 'Multimodal MoE, 10M context window', vision: true },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick', description: 'Largest Llama 4, 128 experts, 1M context', vision: true },
  { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2', description: '1T params, agentic coding, 256K context' },
  { id: 'qwen/qwen-3-32b', name: 'Qwen 3 32B', description: 'Latest Qwen, strong reasoning' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill', description: 'Reasoning model, great for logic' },
  { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', description: 'Reasoning model, chain-of-thought' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Versatile general-purpose model' },
]

type XaiModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const XAI_MODELS: XaiModelOption[] = [
  { id: 'grok-4.20-beta-latest-reasoning', name: 'Grok 4.20 Reasoning', description: 'Newest Grok reasoning model for complex work', vision: true },
  { id: 'grok-4.20-beta-latest-non-reasoning', name: 'Grok 4.20 Fast', description: 'Fast Grok 4.20 variant for everyday tasks', vision: true },
  { id: 'grok-code-fast-1', name: 'Grok Code Fast 1', description: 'xAI coding model for fast agentic code work' },
  { id: 'grok-4-1-fast', name: 'Grok 4.1 Fast', description: 'Fast Grok with tool-calling support', vision: true },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', description: 'Low-latency Grok 4 for general tasks', vision: true },
  { id: 'grok-4', name: 'Grok 4', description: 'Flagship Grok model' },
]

type OpenRouterModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const OPENROUTER_MODELS: OpenRouterModelOption[] = [
  { id: 'openrouter/auto', name: 'Auto (Smart Routing)', description: 'Automatically picks the best model for each request', vision: true },
  { id: 'qwen/qwen3-coder-480b-a35b-instruct:free', name: 'Qwen3 Coder 480B (Free)', description: 'Free, best open-source coding model, 262K context' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', description: 'Free, top open-source reasoning model' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', description: 'Free, great for everyday questions' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (Free)', description: 'Free, good for coding and reasoning' },
  { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro (Paid)', description: 'Paid, SOTA open-source, 1T params, rivals GPT-5.5 at 10x lower cost' },
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash (Paid)', description: 'Paid, 1M context, fast MoE, excellent for agentic loops' },
  { id: 'anthropic/claude-opus-4-7', name: 'Claude Opus 4.7 (Paid)', description: 'Paid, Anthropic latest flagship via OpenRouter', vision: true },
  { id: 'openai/gpt-5.5', name: 'GPT-5.5 (Paid)', description: 'Paid, OpenAI newest frontier via OpenRouter', vision: true },
]

// Recommended models to offer for download when Ollama has none installed
type OllamaModelSuggestion = { id: string; name: string; description: string; size: string }
const OLLAMA_SUGGESTED_MODELS: OllamaModelSuggestion[] = [
  { id: 'hf.co/tunedailabs/knapsack-causal-7b-merged', name: 'Knapsack 7B', description: 'Knapsack-tuned causal model, optimized for this app', size: '~4.1 GB' },
  { id: 'llama3.1:8b', name: 'Llama 3.1 8B', description: 'Great all-rounder, fast on most hardware', size: '~4.7 GB' },
  { id: 'gemma3:4b', name: 'Gemma 3 4B', description: 'Google model, compact and capable', size: '~3.3 GB' },
  { id: 'mistral:7b', name: 'Mistral 7B', description: 'Excellent reasoning, low resource usage', size: '~4.1 GB' },
  { id: 'qwen3:8b', name: 'Qwen 3 8B', description: 'Strong multilingual, thinking capabilities', size: '~4.9 GB' },
  { id: 'phi4-mini:3.8b', name: 'Phi-4 Mini 3.8B', description: 'Microsoft, tiny but surprisingly smart', size: '~2.2 GB' },
  { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', description: 'Reasoning model with chain-of-thought', size: '~4.9 GB' },
]

// In Tauri dev, the UI runs on Vite (1420) while the Rust server listens on 8897.
// In production, the UI is loaded from file:// but the Rust server is still 8897.
const API_BASE = 'http://127.0.0.1:8897'


// API key is now stored server-side in tokens.json (not localStorage) for security.
// This in-memory cache avoids repeated backend calls during a single session.
let _cachedApiKey: string | null = null

async function getOpenAIKey(): Promise<string | null> {
  if (_cachedApiKey) return _cachedApiKey
  // Migrate: if there's a legacy localStorage key, push it to backend and clear it
  const legacyKey = localStorage.getItem('moltbot_openai_key')
  if (legacyKey) {
    try {
      await apiPost('/api/clawd/service/set-api-key', { key: legacyKey })
    } catch { /* backend might already have it */ }
    localStorage.removeItem('moltbot_openai_key')
  }
  try {
    const resp = await apiGet<{ success: boolean; key?: string; model?: string }>('/api/clawd/service/get-api-key')
    if (resp.key) {
      _cachedApiKey = resp.key
      return resp.key
    }
  } catch { /* backend not reachable */ }
  return null
}

const OPENAI_MODEL_STORAGE = 'moltbot_openai_model'
const ANTHROPIC_MODEL_STORAGE = 'moltbot_anthropic_model'
const GEMINI_MODEL_STORAGE = 'moltbot_gemini_model'
const GROQ_MODEL_STORAGE = 'moltbot_groq_model'
const XAI_MODEL_STORAGE = 'moltbot_xai_model'
const OPENROUTER_MODEL_STORAGE = 'moltbot_openrouter_model'
const OLLAMA_MODEL_STORAGE = 'moltbot_ollama_model'
const TONE_STORAGE = 'moltbot_tone'
const VOICE_MODE_STORAGE = 'moltbot_voice_mode'
const CHAT_HISTORY_STORAGE = 'moltbot_chat_history'
const AUTONOMY_MODE_STORAGE = 'moltbot_autonomy_mode'
const PROACTIVE_MODE_STORAGE = 'moltbot_proactive_mode'
const ADVANCED_MODE_STORAGE = 'moltbot_advanced_mode'
const DEVELOPER_MODE_STORAGE = 'moltbot_developer_mode'
const ACTIVE_PROVIDER_STORAGE = 'moltbot_active_provider'
const CODING_AGENT_STORAGE = 'knapsack_coding_agent_pref'
const ONBOARDING_VERSION_STORAGE = 'moltbot_onboarding_version'

// The current app version — bump this when you want to re-show the key prompt
const APP_VERSION = '0.9.600'

// Available OpenAI models
type OpenAIModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

const OPENAI_MODELS: OpenAIModelOption[] = [
  {
    id: 'gpt-5.5',
    name: 'GPT-5.5',
    description: 'Newest frontier model, best for complex professional work',
    vision: true,
  },
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    description: 'Highly capable, great balance of performance and cost',
    vision: true,
  },
  {
    id: 'gpt-5.4-pro',
    name: 'GPT-5.4 Pro',
    description: 'GPT-5.4 with extended thinking',
    vision: true,
  },
  {
    id: 'o3',
    name: 'o3 (Reasoning)',
    description: 'Reasoning model for complex logic',
    vision: true,
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'Fast and affordable',
    vision: true,
  },
]

// Autonomy modes - controls how independent the agent is
type AutonomyMode = 'assist' | 'autonomous'

type AutonomyModeOption = {
  id: AutonomyMode
  name: string
  shortName: string
  description: string
}

const AUTONOMY_OPTIONS: AutonomyModeOption[] = [
  {
    id: 'assist',
    name: 'Assist Mode',
    shortName: 'Assist',
    description: 'I check in with you frequently and ask before taking actions',
  },
  {
    id: 'autonomous',
    name: 'Take Care of It',
    shortName: 'Auto',
    description: 'I work independently and only check in for critical actions (money, sending messages)',
  },
]

// Channels removed - gateway-based messaging (WhatsApp, iMessage, voice calls) not available in this version

type ToneOption = {
  id: string
  name: string
  description: string
  systemPromptAddition: string
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clear, concise, and business-appropriate',
    systemPromptAddition: 'Communicate in a professional, business-appropriate tone. Be clear, concise, and efficient. Focus on delivering actionable information with precision.',
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Friendly, supportive, and encouraging',
    systemPromptAddition: 'Communicate in a warm, friendly, and supportive tone. Be encouraging and personable. Show genuine interest in helping the user succeed.',
  },
  {
    id: 'snarky',
    name: 'Snarky',
    description: 'Witty, playful, with a bit of attitude',
    systemPromptAddition: 'Communicate with a snarky, witty tone. Be playful and clever with a bit of attitude. Add humor and personality while still being helpful. Think sarcastic but lovable assistant.',
  },
]

function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  if (!path.startsWith('/')) path = '/' + path
  return API_BASE + path
}

type ApiFetchOptions = {
  timeoutMs?: number
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs?: number): Promise<Response> {
  if (!timeoutMs || timeoutMs <= 0) return fetch(input, init)

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeout)
  }
}

async function apiGet<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const res = await fetchWithTimeout(apiUrl(path), {}, options.timeoutMs)
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function apiGetText(path: string): Promise<string> {
  const res = await fetch(apiUrl(path))
  const t = await res.text().catch(() => '')
  if (!res.ok) throw new Error(t || `HTTP ${res.status}`)
  return t
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function apiPostText(path: string, body: any): Promise<string> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const t = await res.text().catch(() => '')
  if (!res.ok) throw new Error(t || `HTTP ${res.status}`)
  return t
}

function formatMaybeJson(text: string, maxChars = 8000): string {
  let out = text
  try {
    const parsed = JSON.parse(text)
    out = JSON.stringify(parsed, null, 2)
  } catch {
    // not json
  }
  if (out.length > maxChars) {
    return out.slice(0, maxChars) + `\n\n...(truncated, ${out.length} chars)`
  }
  return out
}

// The smart prompts that auto-execute
const SMART_PROMPT = 'Check my email and calendar and tell me what I should focus on today'
const NO_AUTH_PROMPT = 'Search the web for the latest AI news and give me a summary'
const BUILD_WEBSITE_PROMPT = `Build a personal website about me`

// Check for freshly onboarded agents and build a personalized intro prompt
function getOnboardingAgentsPrompt(): { prompt: string; agents: { name: string; emoji: string; personality: string }[] } | null {
  try {
    const raw = localStorage.getItem('kn_onboarding_agents')
    if (!raw) return null
    const agents = JSON.parse(raw) as { name: string; emoji: string; personality: string }[]
    if (!agents?.length) return null

    const agentList = agents.map(a => `- ${a.emoji} **${a.name}**: ${a.personality}`).join('\n')
    const prompt = `I just finished setting up Knapsack and activated ${agents.length} AI agent${agents.length > 1 ? 's' : ''}. Here's my team:\n\n${agentList}\n\nPlease:\n1. Welcome me and introduce each agent by name with a brief, warm description of what they'll do for me and when they'll run\n2. Ask me a few quick personalization questions to make these agents work better for me — things like what time I start my day, what my biggest priorities are this week, what kind of communication style I prefer, and anything else that would help you tailor the agents to my workflow\n3. Let me know I can rename any agent, change their schedule, or ask you to create new ones anytime\n\nKeep it conversational and make it feel like I'm meeting my new team, not configuring software.`

    return { prompt, agents }
  } catch {
    return null
  }
}

function clearOnboardingAgents() {
  localStorage.removeItem('kn_onboarding_agents')
}

const GATEWAY_DIAGNOSE_PROMPT = `The Knapsack gateway appears to be having connectivity issues. Please help me diagnose and fix this. Run these checks in order:

0. Define a JSON pretty-printer helper (works even if python3/jq are missing):
   JSON_PP='python3 -m json.tool 2>/dev/null || python -m json.tool 2>/dev/null || jq . 2>/dev/null || cat'

1. Check the gateway service status:
   curl -s http://127.0.0.1:8897/api/clawd/service/health | sh -c "$JSON_PP"
2. Check startup readiness:
   curl -s http://127.0.0.1:8897/api/clawd/service/startup-ready | sh -c "$JSON_PP"
3. Check if ports are listening without printing process environments:
   lsof -nP -iTCP:18789 -iTCP:18791 -sTCP:LISTEN 2>/dev/null
4. Check the current Knapsack gateway logs, filtering stale/noisy lines:
   tail -80 ~/Library/Logs/Knapsack/knapsack-clawdbot.err.log 2>/dev/null | grep -Ev "security warning|model-pricing|socket-mode:SlackWebSocket|slack.*socket disconnected|bonjour|CIAO|staging bundled runtime deps" || true
5. Check browser tabs through Knapsack:
   curl -s http://127.0.0.1:8897/api/clawd/browser/tabs | sh -c "$JSON_PP"

Based on the results, tell me:
- Whether the gateway process is running
- Whether the browser (Chrome CDP) is connected
- Any specific errors you see in the logs (like permission denied, port conflicts, session expired, version mismatch)
- The recommended fix based on actual evidence found (e.g. restart the gateway, kill stale processes, re-link a channel)
- Treat live /service/health and /startup-ready as authoritative over old chat messages or stale log lines.
- Never run ps/pgrep with full command lines or environment output, because provider keys can appear there.
IMPORTANT:
- Only suggest Full Disk Access if you see an explicit permission-denied error in the logs (absence of logs is not evidence).
- If the logs mention an OpenClaw version guard (config written by a different/newer version, unknown config key like plugins.bundledDiscovery), treat that as a version mismatch and recommend updating/repairing the bundled gateway rather than generic permission fixes.`

const GATEWAY_RESTART_PROMPT = `Please restart the Knapsack gateway service. Run this command:
JSON_PP='python3 -m json.tool 2>/dev/null || python -m json.tool 2>/dev/null || jq . 2>/dev/null || cat'
curl -s http://127.0.0.1:8897/api/clawd/service/startup-ready | sh -c "$JSON_PP"
Then check if it recovered:
curl -s http://127.0.0.1:8897/api/clawd/service/health | sh -c "$JSON_PP"
Tell me whether the gateway and browser are now healthy.`

const GATEWAY_VIEW_LOGS_PROMPT = `Show me the recent Knapsack gateway error logs to help diagnose connectivity issues. Run:
tail -80 ~/Library/Logs/Knapsack/knapsack-clawdbot.err.log 2>/dev/null | grep -Ev "security warning|model-pricing|socket-mode:SlackWebSocket|slack.*socket disconnected|bonjour|CIAO|staging bundled runtime deps" || echo "No relevant gateway error log lines found"
Then compare against live health:
JSON_PP='python3 -m json.tool 2>/dev/null || python -m json.tool 2>/dev/null || jq . 2>/dev/null || cat'
curl -s http://127.0.0.1:8897/api/clawd/service/health | sh -c "$JSON_PP"
Summarize only recurring current errors, especially related to: gateway connectivity, browser/CDP failures, channel errors (WhatsApp, iMessage), or port conflicts.
IMPORTANT: Treat live health as authoritative over stale log lines. If the log is empty or not found, do NOT speculate about Full Disk Access or other permissions — the absence of logs does not imply a permission issue.`

function buildWebsiteInstructions(userName: string, userEmail: string): string {
  const namePart = userName ? `My name is ${userName}.` : ''
  const emailPart = userEmail ? `My email is ${userEmail}.` : ''
  const linkedinHint = userName
    ? `Search the web for my LinkedIn profile (try "${userName}" on LinkedIn) and use what you find (job title, company, skills, summary, experience) to populate the website content.`
    : userEmail
      ? `Search the web for my LinkedIn profile using my email or name from my email address and use what you find to populate the website content.`
      : ''
  const emailContextHint = userEmail
    ? `Also use my email domain to infer my company/organization.`
    : ''

  return `Build a personal website about me. Do NOT ask me any questions — gather all the information you need automatically.

${namePart} ${emailPart}

Here is how to gather info about me:
1. ${linkedinHint} ${emailContextHint}
2. Check my recent emails for additional context about what I do, my role, and my interests.
3. Use any information you already know about me from our conversation context.

Then:
1. Enable advanced node/exec tools if not already enabled
2. Check which tools and API keys are available (Claude, OpenAI, etc.) and use them
3. Create a beautiful, responsive single-page website about me using HTML, CSS, and JavaScript
4. Save it to my Desktop as "my-website/index.html"
5. Open it in the browser so I can see it

Make it look professional with a modern design, smooth animations, and sections for: hero/intro, about me, skills/interests, and a contact section.
Use real information you gathered — do not use placeholder text. If you couldn't find certain details, make reasonable inferences or leave those sections minimal rather than using obviously fake content.`
}

// Slash commands that trigger Tauri events instead of hitting the LLM
const SLASH_COMMANDS: Record<string, string> = {
  '/morning': 'kn_trigger_morning_briefing',
  '/emails': 'kn_trigger_email_check',
  '/prep': 'kn_trigger_meeting_prep',
  '/fu': 'kn_trigger_post_meeting',
  '/testnotif': 'kn_trigger_test_notification',
  '/autopilot': 'kn_trigger_autopilot',
}

/**
 * Pre-fetch recent emails and today's calendar events from Knapsack's backend APIs.
 * Returns a formatted context string, or empty string if no data is available.
 * This avoids browser emulation — data is fetched directly via authenticated APIs.
 */
async function fetchEmailCalendarContext(): Promise<string> {
  const dataFetcher = new DataFetcher()
  const contextParts: string[] = []

  // Fetch recent emails (last 2 days, up to 15)
  try {
    const emails = await dataFetcher.getRecentGmailMessages(2, 15)
    if (emails?.length) {
      contextParts.push('## Recent Emails\n')
      for (const email of emails.slice(0, 10)) {
        const dateStr = new Date(email.date * 1000).toLocaleString()
        const preview = (email.summary || email.body || '').slice(0, 200)
        contextParts.push(
          `- **From:** ${email.sender} | **Subject:** ${email.subject} | **Date:** ${dateStr}\n  ${preview}\n`,
        )
      }
    }
  } catch (err) {
    console.warn('[ClawdChat] Failed to pre-fetch emails:', err)
  }

  // Fetch today's calendar events
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayEvents = await getCalendarEvents(
      Math.floor(todayStart.getTime() / 1000),
      Math.floor(todayEnd.getTime() / 1000),
    )

    if (todayEvents?.length) {
      contextParts.push('\n## Today\'s Calendar\n')
      for (const event of todayEvents) {
        const startTime = event.start
          ? dayjs(event.start * 1000).format('h:mm A')
          : 'TBD'
        const endTime = event.end
          ? dayjs(event.end * 1000).format('h:mm A')
          : 'TBD'
        const attendees = event.attendees_json
          ? JSON.parse(event.attendees_json)
              .map((a: any) => a.name || a.email || a)
              .join(', ')
          : 'N/A'
        contextParts.push(
          `- **${event.title || 'Untitled'}** (${startTime} - ${endTime}) | Attendees: ${attendees}\n`,
        )
      }
    }
  } catch (err) {
    console.warn('[ClawdChat] Failed to pre-fetch calendar:', err)
  }

  // Fetch upcoming meetings (next 3)
  try {
    const upcomingMeetings = await dataFetcher.getRecentCalendarEvents()
    if (upcomingMeetings?.length) {
      contextParts.push('\n## Upcoming Meetings\n')
      for (const meeting of upcomingMeetings) {
        const startStr = dayjs(meeting.start).format('ddd MMM D, h:mm A')
        const participants = meeting.participants?.map((p: any) => p.name || p.email || p).join(', ') || 'N/A'
        contextParts.push(
          `- **${meeting.title}** at ${startStr} | Participants: ${participants}\n`,
        )
      }
    }
  } catch (err) {
    console.warn('[ClawdChat] Failed to pre-fetch upcoming meetings:', err)
  }

  return contextParts.join('\n')
}

// Maps skill names to keywords that indicate the skill would be useful.
// Checked against each user message; the first match whose skill isn't yet
// installed is surfaced as an inline suggestion below the AI response.
const SKILL_KEYWORD_MAP: Array<{ skill: string; keywords: string[] }> = [
  { skill: 'Persistent Memory', keywords: ['remember this', 'remember for next time', 'forget', 'recall from last', 'previous session', 'context across sessions', 'store this for later'] },
  { skill: 'Code Review',       keywords: ['code review', 'review my code', 'review this code', 'check my code', 'code quality', 'find bugs', 'analyze this code'] },
  { skill: 'Data Analyst',      keywords: ['analyze data', 'csv', 'dataset', 'dataframe', 'statistical', 'statistics', 'eda', 'data analysis', 'visualize data', 'plot this data', 'pandas'] },
  { skill: 'PDF Extractor',     keywords: ['from this pdf', 'extract pdf', 'parse pdf', 'pdf content', 'pdf file', 'from the pdf', 'in this pdf'] },
  { skill: 'Web Scraper',       keywords: ['scrape', 'web scraping', 'extract from website', 'extract data from', 'crawl the', 'harvest data'] },
  { skill: 'Market Research',   keywords: ['market research', 'competitor analysis', 'competitive analysis', 'swot analysis', 'market sizing', 'market analysis', 'competitive landscape'] },
  { skill: 'GitHub PR Review',  keywords: ['pr review', 'pull request review', 'review this pr', 'review the pr', 'review pull request', 'github code review'] },
  { skill: 'Database Ops',      keywords: ['sql query', 'write a query', 'database query', 'query the db', 'database schema', 'database migration', 'postgres', 'mysql', 'sqlite'] },
  { skill: 'Security Scanner',  keywords: ['security scan', 'vulnerability scan', 'find vulnerabilities', 'security audit', 'security check', 'cve', 'penetration test'] },
  { skill: 'Image Generation',  keywords: ['generate an image', 'create an image', 'make an image', 'generate a picture', 'create a picture', 'ai image', 'image generation', 'create visual'] },
  { skill: 'notion',            keywords: ['add to notion', 'save to notion', 'notion page', 'notion database', 'update notion'] },
  { skill: 'slack',             keywords: ['send to slack', 'post to slack', 'slack message', 'slack channel', 'notify slack'] },
  { skill: 'github',            keywords: ['open a pr', 'create pr', 'create a pull request', 'push to github', 'github issue', 'open github'] },
  { skill: 'obsidian',          keywords: ['obsidian vault', 'obsidian note', 'add to obsidian'] },
  { skill: 'summarize',         keywords: ['summarize this article', 'summarize this url', 'youtube video summary', 'tl;dr', 'tldr this'] },
  { skill: 'gemini',            keywords: ['entire codebase', 'million tokens', 'very long document', 'large context'] },
]

function findRelevantSkill(text: string, skills: SkillInfo[], dismissed: Set<string>): SkillInfo | null {
  const lower = text.toLowerCase()
  const candidates = skills.filter(s => !s.eligible && !dismissed.has(s.name))
  for (const { skill: skillName, keywords } of SKILL_KEYWORD_MAP) {
    if (keywords.some(kw => lower.includes(kw))) {
      const match = candidates.find(s => s.name === skillName)
      if (match) return match
    }
  }
  return null
}

// Static skills catalog — used as fallback when gateway/backend is unreachable
const FALLBACK_SKILLS: SkillInfo[] = [
  {name:"Web Search",emoji:"🔍",description:"Search the web",source:"built-in",eligible:true,enabled:true},
  {name:"Browser Control",emoji:"🌐",description:"Navigate and interact with web pages",source:"built-in",eligible:true,enabled:true},
  {name:"Email",emoji:"📧",description:"Read, draft, and manage emails via Gmail",source:"built-in",eligible:true,enabled:true},
  {name:"Calendar",emoji:"📅",description:"View and manage Google Calendar events",source:"built-in",eligible:true,enabled:true},
  {name:"File Reader",emoji:"📄",description:"Read and analyze local files and PDFs",source:"built-in",eligible:true,enabled:true},
  {name:"File Writer",emoji:"✏️",description:"Create and edit local files",source:"built-in",eligible:true,enabled:true},
  {name:"Python Scripts",emoji:"🐍",description:"Run Python for data analysis and automation",source:"built-in",eligible:true,enabled:true},
  {name:"Shell Commands",emoji:"⚡",description:"Execute shell commands (Advanced Mode)",source:"built-in",eligible:true,enabled:true},
  {name:"Screenshot",emoji:"📸",description:"Capture screenshots of web pages",source:"built-in",eligible:true,enabled:true},
  {name:"gog",emoji:"📊",description:"Google Workspace — Gmail, Calendar, Drive, Sheets, Docs",source:"OpenClaw",eligible:false},
  {name:"notion",emoji:"📝",description:"Read and edit Notion pages and databases",source:"OpenClaw",eligible:false},
  {name:"slack",emoji:"💬",description:"Team communication via Slack",source:"OpenClaw",eligible:false},
  {name:"computer-use",emoji:"🖥️",description:"Desktop automation via Codex Computer Use for local app and UI control",source:"OpenClaw",eligible:false,installOptions:[{id:"default",label:"Enable"}]},
  {name:"peekaboo",emoji:"👁️",description:"macOS UI automation via PeekabooBridge — screenshot, click, and inspect any app",source:"OpenClaw",eligible:false,macOnly:true,installOptions:[{id:"default",label:"Enable"}]},
  {name:"apple-notes",emoji:"🍎",description:"Create and manage macOS Notes",source:"OpenClaw",eligible:false},
  {name:"apple-reminders",emoji:"⏰",description:"Manage macOS Reminders",source:"OpenClaw",eligible:false},
  {name:"things-mac",emoji:"✅",description:"Things 3 task management for macOS",source:"OpenClaw",eligible:false},
  {name:"himalaya",emoji:"📬",description:"Email via IMAP/SMTP",source:"OpenClaw",eligible:false},
  {name:"trello",emoji:"📋",description:"Trello project management boards and cards",source:"OpenClaw",eligible:false},
  {name:"obsidian",emoji:"💎",description:"Obsidian knowledge management vaults",source:"OpenClaw",eligible:false},
  {name:"bear-notes",emoji:"🐻",description:"Bear notes management",source:"OpenClaw",eligible:false},
  {name:"summarize",emoji:"📑",description:"Summarize URLs, articles, PDFs, and YouTube videos",source:"OpenClaw",eligible:false},
  {name:"github",emoji:"🐙",description:"GitHub CLI for PRs, code review, and branching",source:"OpenClaw",eligible:false},
  {name:"spotify-player",emoji:"🎵",description:"Spotify playback and search",source:"OpenClaw",eligible:false},
  {name:"weather",emoji:"🌤️",description:"Weather forecasts (no API key required)",source:"OpenClaw",eligible:false},
  {name:"skill-creator",emoji:"🛠️",description:"Create custom skills",source:"OpenClaw",eligible:false},
  {name:"clawhub",emoji:"🏪",description:"Discover and install skills from ClawHub",source:"OpenClaw",eligible:false},
  {name:"ClawSweeper",emoji:"🧩",description:"Triages issues and PRs every week. Tells you what to close, and why.",source:"OpenClaw",eligible:false},
  {name:"Crabbox",emoji:"🧩",description:"Warm a sandbox, sync the diff, run the suite. Disposable dev boxes.",source:"OpenClaw",eligible:false},
  {name:"Octopool",emoji:"🧩",description:"Shared, org-authenticated GitHub read relay and cache. One token to rule them all.",source:"OpenClaw",eligible:false},
  {name:"Crabfleet",emoji:"🧩",description:"Mission control for fleets of agent runs. Spawn, watch, intervene.",source:"OpenClaw",eligible:false},
  {name:"ClickClack",emoji:"🧩",description:"The chat app with claws. Talk to your claws, your way.",source:"OpenClaw",eligible:false},
  {name:"Lobster",emoji:"🧩",description:"OpenClaw-native workflow shell. Compose skills and tools into typed local-first pipelines.",source:"OpenClaw",eligible:false},
  {name:"discrawl",emoji:"🧩",description:"Discord archive into SQLite. Search, threads, DMs, summaries.",source:"OpenClaw",eligible:false},
  {name:"gitcrawl",emoji:"🧩",description:"Local-first GitHub issue and PR crawler for maintainer triage.",source:"OpenClaw",eligible:false},
  {name:"slacrawl",emoji:"🧩",description:"Slack archive with threads, DMs, full-text search. Terminal app included.",source:"OpenClaw",eligible:false},
  {name:"wacrawl",emoji:"🧩",description:"WhatsApp Desktop archive: import, search, slice, back up.",source:"OpenClaw",eligible:false},
  {name:"notcrawl",emoji:"🧩",description:"Local-first Notion crawler into SQLite and normalized Markdown.",source:"OpenClaw",eligible:false},
  {name:"telecrawl",emoji:"🧩",description:"Telegram archive for claws — read history, search threads.",source:"OpenClaw",eligible:false},
  {name:"graincrawl",emoji:"🧩",description:"Local-first Granola notes archive with SQLite, Markdown export, snapshots, TUI.",source:"OpenClaw",eligible:false},
  {name:"crawlkit",emoji:"🧩",description:"Shared Go infrastructure that every crawler is built on.",source:"OpenClaw",eligible:false},
  {name:"crawlbar",emoji:"🧩",description:"Menu bar control plane for local-first crawl apps.",source:"OpenClaw",eligible:false},
  {name:"acpx",emoji:"🧩",description:"Headless CLI client for stateful Agent Client Protocol (ACP) sessions.",source:"OpenClaw",eligible:false},
  {name:"Tachikoma",emoji:"🧩",description:"One interface, every AI model. Swift SDK to interface with AI providers.",source:"OpenClaw",eligible:false},
  {name:"clawpatch",emoji:"🧩",description:"Review code. Patch bugs. Land PRs.",source:"OpenClaw",eligible:false},
  {name:"clawbench",emoji:"🧩",description:"Agent benchmark that scores the full stack — harness, config, model — not just the LLM.",source:"OpenClaw",eligible:false},
  {name:"agent-skills",emoji:"🧩",description:"Canonical public OpenClaw shared skills used across agents.",source:"OpenClaw",eligible:false},
  {name:"plugin-inspector",emoji:"🧩",description:"Offline compatibility inspector for mocking OpenClaw and testing plugins.",source:"OpenClaw",eligible:false},
  {name:"cookbook",emoji:"🧩",description:"Example apps for the OpenClaw SDK. Copy, adapt, ship.",source:"OpenClaw",eligible:false},
  {name:"rastermill",emoji:"🧩",description:"Fast, portable image processing for Node agents.",source:"OpenClaw",eligible:false},
  {name:"fs-safe",emoji:"🧩",description:"Race-resistant root-bounded filesystem primitives for Node.",source:"OpenClaw",eligible:false},
  {name:"proxyline",emoji:"🧩",description:"Process-global proxy routing for Node.",source:"OpenClaw",eligible:false},
  {name:"libopus-wasm",emoji:"🧩",description:"Modern WASM bindings for libopus raw packet encode/decode.",source:"OpenClaw",eligible:false},
  {name:"clawpdf",emoji:"🧩",description:"PDF parsing and rendering tools for claws.",source:"OpenClaw",eligible:false},
  {name:"AXorcist",emoji:"🧩",description:"Swift wrapper for macOS Accessibility — chainable, fuzzy-matched UI queries.",source:"OpenClaw",eligible:false},
  {name:"remindctl",emoji:"🧩",description:"CLI for Apple Reminders. Scriptable task plumbing.",source:"OpenClaw",eligible:false},
  {name:"gogcli",emoji:"🧩",description:"Google Workspace in your terminal.",source:"OpenClaw",eligible:false},
  {name:"spogo",emoji:"🧩",description:"Spotify in your terminal. Power CLI driven by web cookies.",source:"OpenClaw",eligible:false},
  {name:"songsee",emoji:"🧩",description:"Pretty FFT for your audio — spectrograms, mel, chroma.",source:"OpenClaw",eligible:false},
  {name:"nix-openclaw",emoji:"🧩",description:"Packages OpenClaw for Nix.",source:"OpenClaw",eligible:false},
  {name:"clawdinators",emoji:"🧩",description:"Declarative infra + NixOS modules for CLAWTINATOR hosts.",source:"OpenClaw",eligible:false},
  {name:"openclaw-ansible",emoji:"🧩",description:"Hardened Clawdbot install: Tailscale, UFW, Docker isolation.",source:"OpenClaw",eligible:false},
  {name:"casa",emoji:"🧩",description:"Expose your home base to Clawdbot.",source:"OpenClaw",eligible:false},
  {name:"crabline",emoji:"🧩",description:"CLI using Vercel Chat SDK to test message channels against OpenClaw.",source:"OpenClaw",eligible:false},
  {name:"clawgo",emoji:"🧩",description:"Clawd node in Go.",source:"OpenClaw",eligible:false},
  {name:"esp-openclaw-node",emoji:"🧩",description:"ESP-based OpenClaw node — hardware claws.",source:"OpenClaw",eligible:false},
  {name:"Kova",emoji:"🧩",description:"OpenClaw runtime validation lab.","source":"OpenClaw",eligible:false},
  {name:"Swabble",emoji:"🧩",description:"Swift version of brabble.dev.",source:"OpenClaw",eligible:false},
  {name:"caclawphony",emoji:"🧩",description:"Symphony: isolated, autonomous implementation runs.",source:"OpenClaw",eligible:false},
  {name:"clownfish",emoji:"🧩",description:"Maintainer codex harness for resolving issue clusters at scale.",source:"OpenClaw",eligible:false},
  {name:"openclaw-rtt",emoji:"🧩",description:"RTT timing measurements across OpenClaw npm releases.",source:"OpenClaw",eligible:false},
  {name:"openclaw-windows-node",emoji:"🧩",description:"Windows Hub companion: tray app, setup, chat, and agent-controlled node mode.",source:"OpenClaw",eligible:false},
  {name:"clawdex",emoji:"🧩",description:"Contacts for claws.",source:"OpenClaw",eligible:false},
  {name:"crabpot",emoji:"🧩",description:"Compatibility testbed for community plugins and plugin seams.",source:"OpenClaw",eligible:false},
  {name:"kitchen-sink",emoji:"🧩",description:"Credential-free plugin fixture covering the public plugin API.",source:"OpenClaw",eligible:false},
  {name:"ask-molty",emoji:"🧩",description:"Documentation builder for docs.openclaw.ai.",source:"OpenClaw",eligible:false},
  {name:"docs",emoji:"🧩",description:"OpenClaw documentation + translation source.",source:"OpenClaw",eligible:false},
  {name:"community",emoji:"🧩",description:"Policies and documentation for the OpenClaw Discord server.",source:"OpenClaw",eligible:false},
  {name:"rfcs",emoji:"🧩",description:"Public design proposals and architecture discussions.",source:"OpenClaw",eligible:false},
  {name:"releases",emoji:"🧩",description:"Release automation and evidence ledger for OpenClaw.",source:"OpenClaw",eligible:false},
  {name:"homebrew-tap",emoji:"🧩",description:"Homebrew formulas for OpenClaw CLI tools.",source:"OpenClaw",eligible:false},
  {name:"Claude Code",emoji:"🤖",description:"Anthropic's autonomous AI coding agent — edits files, runs tests, and manages git",source:"Anthropic",eligible:false,externalApi:true,homepage:"https://claude.ai/code"},
  {name:"Codex",emoji:"🧪",description:"OpenAI's autonomous coding agent — edits files, runs tests, and manages git",source:"OpenAI",eligible:false,externalApi:true,homepage:"https://github.com/openai/codex"},
  {name:"Gemini CLI",emoji:"♊",description:"Google's open-source terminal AI agent — headless coding with the Gemini API",source:"Google",eligible:false,externalApi:true,homepage:"https://github.com/google-gemini/gemini-cli"},
  {name:"Claude API",emoji:"✨",description:"Use Claude models directly in your own apps and scripts via the Anthropic API",source:"Anthropic",eligible:false,externalApi:true,homepage:"https://console.anthropic.com"},
  {name:"Persistent Memory",emoji:"🧠",description:"Remember decisions, context, and past work across sessions with semantic search",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/memory-search-for-claude"},
  {name:"Code Review",emoji:"🔎",description:"Severity-ranked AI code review with security, performance, and architecture findings",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/advanced-code-review-agent"},
  {name:"Data Analyst",emoji:"📊",description:"End-to-end data processing — cleaning, statistical analysis, EDA, and visual reports",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/data-analyst"},
  {name:"PDF Extractor",emoji:"📑",description:"Transform complex PDFs into structured markdown — text, tables, and images",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/pdf-extractor-analyzer"},
  {name:"Web Scraper",emoji:"🕷️",description:"Extract structured data from any website at scale with intelligent parsing",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/categories/web-scraping-data-collection"},
  {name:"Market Research",emoji:"📈",description:"Automated competitive intelligence — trend analysis, SWOT, and market sizing",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/market-research-orchestrator"},
  {name:"GitHub PR Review",emoji:"🐙",description:"Multi-agent AI swarm for exhaustive GitHub PR analysis — security, perf, architecture",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/github-ai-code-review-swarm-2"},
  {name:"Database Ops",emoji:"🗄️",description:"Natural-language SQL queries, schema management, and database migrations",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/categories/database-management"},
  {name:"Security Scanner",emoji:"🔒",description:"Automated static analysis, CVE detection, and vulnerability remediation guidance",source:"MCP Market",eligible:false,homepage:"https://mcpmarket.com/tools/skills/categories/security-testing"},
  {name:"Image Generation",emoji:"🎨",description:"Create professional visual assets with AI image models and brand-specific context",source:"MCP Market",eligible:false,externalApi:true,homepage:"https://mcpmarket.com/tools/skills/image-generation"},
]

// Map file extension to MIME type (used by Tauri file-drop handler)
function getMimeTypeFromExt(ext: string): string {
  const types: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', ico: 'image/x-icon',
    pdf: 'application/pdf', txt: 'text/plain', md: 'text/markdown',
    json: 'application/json', csv: 'text/csv', html: 'text/html', xml: 'text/xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return types[ext] || 'application/octet-stream'
}

// Isolated input component — owns its own `input` state so keystrokes
// only re-render this small component instead of the entire chat body.
type ChatInputBarProps = {
  busy: boolean
  hasQueuedMessage: boolean
  isRecording: boolean
  isTranscribing: boolean
  voiceEnabled: boolean
  attachedFiles: Array<{ name: string; type: string; content: string; preview?: string }>
  onSend: (text: string) => void
  onQueue: (text: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onStartRecording: () => void
  onStopRecording: () => void
  onToggleVoice: () => void
  onStopGeneration: () => void
  replyToMsg?: Msg | null
  onCancelReply?: () => void
  initialValue?: string
}

// ── Memoized single-message renderer ──────────────────────────────────
// Prevents ReactMarkdown from re-parsing unchanged messages on every
// parent re-render (status polling, channel status, etc.).
type ChatMessageProps = {
  msg: Msg
  cleaned: string
  actions: PromptAction[]
  mdPlugins: any[]
  mdComponents: Components
  onExampleClick?: (e: React.MouseEvent, text: string) => void
  onAction?: (prompt: string, srcMsgId?: string) => void
  onReply?: (msg: Msg) => void
  replyToMsg?: Msg | null
  onScrollToMsg?: (id: string) => void
  serviceHealthy?: boolean
}

const ChatMessage = memo(function ChatMessage({
  msg: m, cleaned, actions, mdPlugins, mdComponents, onExampleClick, onAction, onReply, replyToMsg, onScrollToMsg, serviceHealthy,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showSavePicker, setShowSavePicker] = useState(false)
  const [savedToast, setSavedToast] = useState<string | null>(null)
  const staleGatewayDiagnostic = Boolean(
    serviceHealthy
    && m.role === 'assistant'
    && (
      /gateway connectivity issue/i.test(m.text)
      || /browser is not responding/i.test(m.text)
      || /gateway is repeatedly crashing/i.test(m.text)
      || (/recommended fix/i.test(m.text) && /gateway/i.test(m.text))
    ),
  )
  const visibleActions = staleGatewayDiagnostic ? [] : actions

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(m.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [m.text])

  const handleReply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onReply?.(m)
  }, [m, onReply])

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSavePicker(prev => !prev)
  }, [])

  const handleSaved = useCallback((workspaceName: string) => {
    setSavedToast(workspaceName)
    setTimeout(() => setSavedToast(null), 2500)
  }, [])

  const handleScrollToReply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (m.replyTo) onScrollToMsg?.(m.replyTo)
  }, [m.replyTo, onScrollToMsg])

  return (
    <div
      className={`ClawdMsg ClawdMsg-${m.role} ${m.isClickable ? 'ClawdMsg-clickable' : ''}`}
      onClick={m.isClickable && onExampleClick ? (e) => onExampleClick(e, m.text) : undefined}
    >
      <div className="ClawdBubble">
        {/* Quoted reply block — shown when this message replies to another */}
        {replyToMsg && (
          <div
            className={`ClawdQuotedReply ClawdQuotedReply--${replyToMsg.role}`}
            onClick={handleScrollToReply}
            title="Jump to original message"
          >
            <div className="ClawdQuotedReply__bar" />
            <div className="ClawdQuotedReply__body">
              <span className="ClawdQuotedReply__author">
                {replyToMsg.role === 'user' ? 'You' : 'Knapsack'}
              </span>
              <span className="ClawdQuotedReply__text">
                {replyToMsg.text.replace(/\n/g, ' ').slice(0, 120)}{replyToMsg.text.length > 120 ? '…' : ''}
              </span>
            </div>
          </div>
        )}
        {m.isClickable ? (
          <p>{m.text}</p>
        ) : (
          <ReactMarkdown remarkPlugins={mdPlugins} components={mdComponents}>{cleaned}</ReactMarkdown>
        )}
        {staleGatewayDiagnostic && (
          <div className="ClawdStaleDiagnosticNote">
            Live status is healthy now. This older diagnostic may be stale, so its recovery actions are hidden.
          </div>
        )}
        {visibleActions.length > 0 && (
          <div className="ClawdPromptActions">
            {visibleActions.map((action, i) => {
              const isConfirmed = m.confirmedActionPrompts?.includes(action.prompt)
              if (isConfirmed) {
                const isAdvancedMode = action.prompt.startsWith('__enable_advanced_and_resend__')
                return (
                  <div key={i} className="ClawdPromptActionConfirmed">
                    {isAdvancedMode ? '⚡ Advanced mode enabled' : `✓ ${action.label}`}
                  </div>
                )
              }
              return (
                <button
                  key={i}
                  className="ClawdPromptAction"
                  onClick={(e) => { e.stopPropagation(); onAction?.(action.prompt, m.id) }}
                >
                  <span className="ClawdPromptActionNum">{i + 1}</span>
                  {action.label}
                </button>
              )
            })}
          </div>
        )}
        {m.model && m.role === 'assistant' && (
          <div className="ClawdMsgModel">via {m.model}</div>
        )}
        {!m.isClickable && (
          <>
            <button
              className="ClawdReplyBtn"
              onClick={handleReply}
              title="Reply to this message"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
            </button>
            <button
              className={`ClawdCopyBtn ${copied ? 'ClawdCopyBtn--copied' : ''}`}
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy message'}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
            {m.role === 'assistant' && (
              <div className="ClawdSaveBtn-wrap">
                <button
                  className={`ClawdSaveBtn ${savedToast ? 'ClawdSaveBtn--saved' : ''}`}
                  onClick={handleSaveClick}
                  title={savedToast ? `Saved to ${savedToast}` : 'Save to Library'}
                >
                  {savedToast ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </button>
                {showSavePicker && (
                  <WorkspacePicker
                    text={m.text}
                    onClose={() => setShowSavePicker(false)}
                    onSaved={handleSaved}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}, (prev, next) =>
  prev.msg.id === next.msg.id &&
  prev.msg.text === next.msg.text &&
  prev.cleaned === next.cleaned &&
  prev.actions === next.actions &&
  prev.mdPlugins === next.mdPlugins &&
  prev.mdComponents === next.mdComponents &&
  prev.replyToMsg?.id === next.replyToMsg?.id &&
  prev.onReply === next.onReply &&
  prev.onScrollToMsg === next.onScrollToMsg &&
  prev.serviceHealthy === next.serviceHealthy
)

const ChatInputBar = memo(function ChatInputBar(props: ChatInputBarProps) {
  const {
    busy, hasQueuedMessage: _hasQueuedMessage, isRecording, isTranscribing, voiceEnabled,
    attachedFiles, onSend, onQueue, onFileSelect, onRemoveFile,
    onStartRecording, onStopRecording, onToggleVoice, onStopGeneration,
    replyToMsg, onCancelReply, initialValue,
  } = props
  const [input, setInput] = useState('')
  const debugPerf = useMemo(() => localStorage.getItem('KS_DEBUG_CHAT_PERF') === 'true', [])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-focus textarea on mount so users can start typing immediately
  useEffect(() => {
    // Small delay to ensure layout is complete after tab switch
    const timer = setTimeout(() => textareaRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue)
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [initialValue])

  const handleSend = () => {
    const text = input.trim()
    if (!text && attachedFiles.length === 0) return

    onSend(text)
    setInput('')
    // Reset textarea height after send
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Auto-resize textarea to fit content.
  // Deferred to next animation frame to avoid synchronous layout reflow
  // during the keystroke event handler (reduces input latency).
  const resizeRaf = useRef(0)
  const autoResize = useCallback(() => {
    cancelAnimationFrame(resizeRaf.current)
    resizeRaf.current = requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      ta.style.height = 'auto'
      const next = Math.min(ta.scrollHeight, 160) + 'px'
      if (ta.style.height !== next) ta.style.height = next
    })
  }, [])

  // Allow parent to trigger send with specific text (for prompt actions, voice, etc.)
  // via the onSend callback directly — the parent calls onSend(text).

  return (
    <>
      {/* Reply preview bar — shown when replying to a message */}
      {replyToMsg && (
        <div className="ClawdReplyPreview">
          <div className={`ClawdReplyPreview__bar ClawdReplyPreview__bar--${replyToMsg.role}`} />
          <div className="ClawdReplyPreview__content">
            <span className="ClawdReplyPreview__author">
              {replyToMsg.role === 'user' ? 'You' : 'Knapsack'}
            </span>
            <span className="ClawdReplyPreview__text">
              {replyToMsg.text.replace(/\n/g, ' ').slice(0, 100)}{replyToMsg.text.length > 100 ? '…' : ''}
            </span>
          </div>
          <button
            className="ClawdReplyPreview__cancel"
            onClick={onCancelReply}
            title="Cancel reply"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="ClawdAttachments">
          {attachedFiles.map((file, index) => (
            <div key={index} className="ClawdAttachment">
              {file.preview ? (
                <img src={file.preview} alt={file.name} className="ClawdAttachmentPreview" />
              ) : (
                <div className="ClawdAttachmentIcon">📄</div>
              )}
              <span className="ClawdAttachmentName">{file.name}</span>
              <button
                className="ClawdAttachmentRemove"
                onClick={() => onRemoveFile(index)}
                title="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="ClawdChatInput">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          multiple
          accept="image/*,.pdf,.txt,.md,.json,.csv,.html,.xml,.doc,.docx"
          style={{ display: 'none' }}
        />
        <button
          className="ClawdFileBtn"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          title="Attach files or images"
        >
          📎
        </button>
        <div className="ClawdInputWrapper">
          <textarea
            ref={textareaRef}
            data-testid="qa-clawd-chat-input"
            value={input}
            onChange={e => {
              if (debugPerf) performance.mark('ks:chatInput:onChange:start')
              setInput(e.target.value)
              autoResize()
              if (debugPerf) {
                performance.mark('ks:chatInput:onChange:end')
                performance.measure('ks:chatInput:onChange', 'ks:chatInput:onChange:start', 'ks:chatInput:onChange:end')
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (busy) {
                  // Queue the message to send after current request completes
                  if (input.trim()) {
                    onQueue(input.trim())
                    setInput('')
                    autoResize()
                  }
                } else {
                  handleSend()
                }
              }
            }}
            placeholder={isRecording ? '🎤 Listening...' : busy ? 'Type your next message (Enter to queue)...' : 'Ask me to browse, search, read pages, or automate tasks...'}
            disabled={isRecording}
            rows={1}
          />
          {/* Voice mode toggle - always visible inside input like ChatGPT */}
          <button
            className={`ClawdVoiceToggle ${voiceEnabled ? 'active' : ''} ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
            onClick={isRecording ? onStopRecording : voiceEnabled ? onStartRecording : onToggleVoice}
            disabled={busy || isTranscribing}
            title={
              !voiceEnabled
                ? 'Enable voice mode'
                : isRecording
                  ? 'Stop recording'
                  : isTranscribing
                    ? 'Transcribing...'
                    : 'Click to speak (or click again to disable voice mode)'
            }
          >
            {isTranscribing ? '⏳' : isRecording ? '⏹️' : voiceEnabled ? '🎤' : '🎙️'}
          </button>
        </div>
        {busy ? (
          <>
            <button className="ClawdStopBtn" onClick={onStopGeneration}>
              ⏹️ Stop
            </button>
            <button
              disabled={!input.trim()}
              onClick={() => {
                if (input.trim()) {
                  onQueue(input.trim())
                  setInput('')
                  autoResize()
                }
              }}
              title="Queue this message to send after current response"
            >
              📋 Queue
            </button>
          </>
        ) : (
          <button disabled={!input.trim() && attachedFiles.length === 0} onClick={handleSend}>
            Send
          </button>
        )}
      </div>
    </>
  )
})

// ── Allowlist management section (rendered inside each connected channel) ──

const DM_POLICIES = [
  { id: 'allowlist', label: 'Allowlist only', description: 'Only approved contacts can message' },
  { id: 'pairing', label: 'Pairing code', description: 'Unknown senders get a code you must approve' },
  { id: 'open', label: 'Open', description: 'Anyone can message (not recommended)' },
  { id: 'disabled', label: 'Disabled', description: 'Block all inbound DMs' },
]

function ChannelAllowlistSection({ channel, isConnected }: { channel: string; isConnected: boolean }) {
  const [dmPolicy, setDmPolicy] = useState('allowlist')
  const [allowFrom, setAllowFrom] = useState<string[]>([])
  const [newContact, setNewContact] = useState('')
  const [, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const fetchAllowlist = useCallback(async () => {
    if (!isConnected) return
    setLoading(true)
    try {
      const res = await getChannelAllowlist(channel)
      if (res.success) {
        setDmPolicy(res.dmPolicy || 'allowlist')
        setAllowFrom(res.allowFrom || [])
      }
    } catch { /* gateway not reachable */ }
    finally { setLoading(false); setLoaded(true) }
  }, [channel, isConnected])

  useEffect(() => { fetchAllowlist() }, [fetchAllowlist])

  const save = async (policy: string, contacts: string[]) => {
    setSaving(true)
    setError(null)
    try {
      const res = await updateChannelAllowlist(channel, { dmPolicy: policy, allowFrom: contacts })
      if (!res.success) setError(res.message || 'Failed to save')
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handlePolicyChange = async (newPolicy: string) => {
    setDmPolicy(newPolicy)
    await save(newPolicy, allowFrom)
  }

  const addContact = async () => {
    const trimmed = newContact.trim()
    if (!trimmed || allowFrom.includes(trimmed)) return
    const updated = [...allowFrom, trimmed]
    setAllowFrom(updated)
    setNewContact('')
    await save(dmPolicy, updated)
  }

  const removeContact = async (contact: string) => {
    const updated = allowFrom.filter(c => c !== contact)
    setAllowFrom(updated)
    await save(dmPolicy, updated)
  }

  if (!isConnected || !loaded) return null

  const allowlistCopy = channel === 'whatsapp'
    ? 'Only these contacts can reach the AI. Your linked WhatsApp number is added automatically after connection:'
    : channel === 'imessage'
      ? 'Only these contacts can reach the AI. Your Knapsack email is added when available; add the phone number or Apple ID email you will message from:'
      : 'Only these contacts can reach the AI:'
  const pairingCopy = channel === 'imessage'
    ? 'Pairing sends approval codes into real iMessage conversations. Use allowlist mode unless you are deliberately approving a new sender.'
    : 'Pre-approved contacts (skip pairing code):'
  const contactPlaceholder = channel === 'discord'
    ? 'User ID'
    : channel === 'slack'
      ? 'User ID'
      : channel === 'telegram'
        ? '@username or user ID'
        : channel === 'imessage'
          ? '+1234567890 or appleid@example.com'
          : '+1234567890'

  return (
    <div className="ClawdChannelGuide" style={{ borderTop: '1px solid #e2e8f0', marginTop: 8 }}>
      <div className="ClawdChannelGuideTitle">Who can message</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {DM_POLICIES.map(p => (
          <button
            key={p.id}
            disabled={saving}
            onClick={() => handlePolicyChange(p.id)}
            title={p.description}
            style={{
              padding: '3px 10px',
              fontSize: 11,
              borderRadius: 12,
              border: dmPolicy === p.id ? '1.5px solid #3b82f6' : '1px solid #d1d5db',
              background: dmPolicy === p.id ? '#eff6ff' : '#fff',
              color: dmPolicy === p.id ? '#1d4ed8' : '#374151',
              cursor: 'pointer',
              fontWeight: dmPolicy === p.id ? 600 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {(dmPolicy === 'allowlist' || dmPolicy === 'pairing') && (
        <>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            {dmPolicy === 'allowlist' ? allowlistCopy : pairingCopy}
          </div>

          {allowFrom.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
              {allowFrom.filter(c => c !== '*').map(contact => (
                <div key={contact} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <code style={{ flex: 1, padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: 11 }}>{contact}</code>
                  <button
                    onClick={() => removeContact(contact)}
                    disabled={saving}
                    style={{ padding: '1px 6px', fontSize: 11, color: '#ef4444', background: 'none', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={newContact}
              onChange={e => setNewContact(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addContact() }}
              placeholder={contactPlaceholder}
              style={{ flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <button
              onClick={addContact}
              disabled={!newContact.trim() || saving}
              style={{ padding: '4px 10px', fontSize: 11, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !newContact.trim() || saving ? 0.5 : 1 }}
            >
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </>
      )}

      {dmPolicy === 'open' && (
        <div style={{ fontSize: 11, color: '#d97706', background: '#fffbeb', padding: '6px 10px', borderRadius: 6, marginTop: 4 }}>
          Warning: Open mode lets anyone message your AI. Your assistant will respond to all incoming messages.
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</div>
      )}
    </div>
  )
}

interface ClawdChatProps {
  showActivityPanel?: boolean
  onToggleActivity?: () => void
  onCloseActivity?: () => void
  userEmail?: string
  userName?: string
  onBusyChange?: (busy: boolean) => void
  /** When set to a truthy value, opens the AI provider sidebar. Increment to re-trigger. */
  openProviderPanel?: number
  /** Pre-fills the chat input field when set. */
  initialInput?: string
  /** Extra context prepended to model/gateway requests without displaying it as the user's message. */
  contextPrefix?: string
  /** Render with a tighter header for embedded surfaces. */
  compact?: boolean
  title?: string
}

export default function ClawdChat({ showActivityPanel: externalActivityPanel, onToggleActivity, onCloseActivity, userEmail, userName, onBusyChange, openProviderPanel, initialInput, contextPrefix, compact = false, title = 'Knapsack Chat' }: ClawdChatProps = {}) {
  // Load chat history from localStorage on mount
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    const stored = localStorage.getItem(CHAT_HISTORY_STORAGE)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Msg[]
        // Strip old-format clickable welcome prompts so fresh ones render
        const cleaned = parsed.filter(m => m.id !== 'smart-prompt' && m.id !== 'no-auth-prompt')
        // If only welcome shells remain, start fresh
        if (cleaned.every(m => m.id.startsWith('welcome-'))) return []
        if (cleaned.length > 0) return cleaned
      } catch {
        // Invalid stored data, ignore
      }
    }
    return []
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => { onBusyChange?.(busy) }, [busy, onBusyChange])

  // Queued messages — when user presses Enter while busy, queue messages to send after each request completes
  const queuedMessagesRef = useRef<string[]>([])
  const [hasQueuedMessage, setHasQueuedMessage] = useState(false)
  const [queuedMessageTexts, setQueuedMessageTexts] = useState<string[]>([])
  const [editingQueuedIndex, setEditingQueuedIndex] = useState<number | null>(null)
  const [editingQueuedText, setEditingQueuedText] = useState('')

  // Abort controller for stopping generation — stored in a ref for synchronous access.
  // Using state here would cause stopGeneration to see a stale null value during the
  // brief window between setAbortController(controller) being called and React committing
  // the state update, leaving busy=true stuck forever if the user clicks Stop too fast.
  const abortControllerRef = useRef<AbortController | null>(null)
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [health, setHealth] = useState<ServiceHealth | null>(null)
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null)

  // Onboarding state
  const [showKeyPrompt, setShowKeyPrompt] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [editingProviderKey, setEditingProviderKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(OPENAI_MODEL_STORAGE) || 'gpt-5-mini'
  })
  const [selectedAnthropicModel, setSelectedAnthropicModel] = useState<string>(() => {
    return localStorage.getItem(ANTHROPIC_MODEL_STORAGE) || 'claude-sonnet-4-5-20250929'
  })
  const [selectedGeminiModel, setSelectedGeminiModel] = useState<string>(() => {
    return localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-2.5-flash'
  })
  const [selectedGroqModel, setSelectedGroqModel] = useState<string>(() => {
    return localStorage.getItem(GROQ_MODEL_STORAGE) || 'meta-llama/llama-4-scout-17b-16e-instruct'
  })
  const [selectedXaiModel, setSelectedXaiModel] = useState<string>(() => {
    return localStorage.getItem(XAI_MODEL_STORAGE) || 'grok-code-fast-1'
  })
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] = useState<string>(() => {
    return localStorage.getItem(OPENROUTER_MODEL_STORAGE) || 'meta-llama/llama-3.3-70b-instruct:free'
  })
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>(() => {
    return localStorage.getItem(OLLAMA_MODEL_STORAGE) || ''
  })
  const [selectedKnapsackModel, setSelectedKnapsackModel] = useState<string>(() => {
    const stored = localStorage.getItem(KNAPSACK_MODEL_STORAGE)
    return KNAPSACK_MODELS.some(model => model.id === stored) ? stored! : 'auto'
  })
  const [knapsackEmail, setKnapsackEmail] = useState<string>('')
  const [isKnapsackConnecting, setIsKnapsackConnecting] = useState(false)
  const [knapsackConnectError, setKnapsackConnectError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider>(() => {
    return (localStorage.getItem(ACTIVE_PROVIDER_STORAGE) as Provider) || 'openai'
  })
  // Tracks the backend-confirmed active provider separately from selectedProvider,
  // which also changes when the user opens an accordion (before any save).
  const [confirmedProvider, setConfirmedProvider] = useState<Provider>(() => {
    return (localStorage.getItem(ACTIVE_PROVIDER_STORAGE) as Provider) || 'openai'
  })
  const [savingKey, setSavingKey] = useState(false)

  // Model picker tab state: 'providers' or 'costs'
  const [modelPickerTab, setModelPickerTab] = useState<'providers' | 'costs'>('providers')

  // Background AI (heartbeat) state
  const [backgroundAiEnabled, setBackgroundAiEnabled] = useState<boolean | null>(null)
  const [backgroundAiLoading, setBackgroundAiLoading] = useState(false)

  // Ollama state
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null)
  const [ollamaModels, setOllamaModels] = useState<Array<{ name: string; parameter_size?: string }>>([])
  const [ollamaPulling, setOllamaPulling] = useState(false)
  const [ollamaPullProgress, setOllamaPullProgress] = useState('')
  const [ollamaPullPercent, setOllamaPullPercent] = useState<number | null>(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [keyHints, setKeyHints] = useState<Record<string, string | undefined>>({})
  const [savedProviderKeys, setSavedProviderKeys] = useState<Record<string, boolean>>({})
  // Extra providers (MiniMax, ZAI, HuggingFace) state
  const [extraProviderStatuses, setExtraProviderStatuses] = useState<Record<string, { has_key?: boolean; key_hint?: string }>>({})
  const [editingExtraProvider, setEditingExtraProvider] = useState<string | null>(null)
  const [extraProviderKey, setExtraProviderKey] = useState('')
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up thinking interval on unmount to prevent leaked intervals
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
      }
    }
  }, [])

  // Claude Code / Codex activity tracking — shows indicator when a coding agent is running
  const [claudeCodeActive, setClaudeCodeActive] = useState(false)
  const [claudeCodePrompt, setClaudeCodePrompt] = useState<string | null>(null)
  const [codingAgentName, setCodingAgentName] = useState('Claude Code')

  // Preferred coding agent: "claude" | "codex" | "gemini" | "" (auto-detect from API keys)
  const [preferredCodingAgent, setPreferredCodingAgent] = useState<string>(() => {
    return localStorage.getItem(CODING_AGENT_STORAGE) || ''
  })

  // Tone selection
  const [selectedTone, setSelectedTone] = useState<string>(() => {
    return localStorage.getItem(TONE_STORAGE) || 'snarky'
  })
  const [showToneSelector, setShowToneSelector] = useState(false)

  // Open provider sidebar when triggered externally (e.g. from Settings dialog)
  useEffect(() => {
    if (openProviderPanel) {
      setShowKeyPrompt(true)
      setShowChannelsPanel(false)
      setShowSkillsPanel(false)
    }
  }, [openProviderPanel])

  // Autonomy mode - how independent the agent is
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>(() => {
    const stored = localStorage.getItem(AUTONOMY_MODE_STORAGE)
    return (stored === 'assist' || stored === 'autonomous') ? stored : 'autonomous'
  })

  // Proactive mode — controls whether background notifications fire automatically
  const [proactiveMode, setProactiveMode] = useState(() => {
    const stored = localStorage.getItem(PROACTIVE_MODE_STORAGE)
    return stored === null ? false : stored === 'true' // off by default (Reactive mode)
  })
  const [showProactiveModal, setShowProactiveModal] = useState(false)
  const [pendingProactiveState, setPendingProactiveState] = useState<boolean>(false)

  // Advanced mode - allows shell command execution
  const [advancedMode, setAdvancedMode] = useState(() => {
    return localStorage.getItem(ADVANCED_MODE_STORAGE) === 'true'
  })
  const [showAdvancedWarning, setShowAdvancedWarning] = useState(false)

  // Developer mode - beyond Advanced: scans Sentry reports and error logs, initiates Claude Code sessions/PRs
  const [developerMode, setDeveloperMode] = useState(() => {
    return localStorage.getItem(DEVELOPER_MODE_STORAGE) === 'true'
  })
  const [showDeveloperWarning, setShowDeveloperWarning] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)

  // Activity panel is now controlled by parent via props

  // Skills panel state
  const [showSkillsPanel, setShowSkillsPanel] = useState(false)
  const [showChannelsPanel, setShowChannelsPanel] = useState(false)
  const [channelBusy, setChannelBusy] = useState<string | null>(null)
  const [channelError, setChannelError] = useState<string | null>(null)
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [showTelegramInput, setShowTelegramInput] = useState(false)
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('')
  const [whatsappPhoneLinking, setWhatsappPhoneLinking] = useState(false)
  // Generic channel credential inputs
  const [slackBotToken, setSlackBotToken] = useState('')
  const [slackAppToken, setSlackAppToken] = useState('')
  const [discordBotToken, setDiscordBotToken] = useState('')
  const [signalPhoneNumber, setSignalPhoneNumber] = useState('')
  const [signalCliStatus, setSignalCliStatus] = useState<SignalCliStatus | null>(null)
  const [signalCliInstalling, setSignalCliInstalling] = useState(false)
  const [signalRegMode, setSignalRegMode] = useState<'choose' | 'link' | 'sms'>('choose')
  const [signalLinkUri, setSignalLinkUri] = useState<string | null>(null)
  const [signalLinking, setSignalLinking] = useState(false)
  const [signalRegistering, setSignalRegistering] = useState(false)
  const [signalVerifying, setSignalVerifying] = useState(false)
  const [signalVerifyCode, setSignalVerifyCode] = useState('')
  const [signalCaptchaToken, setSignalCaptchaToken] = useState('')
  const [signalNeedsCaptcha, setSignalNeedsCaptcha] = useState(false)
  const [, setSignalRegDone] = useState(false)
  // Tracks how many consecutive polls have seen gateway_ok=true but browser_ok=false.
  // The "browser not responding" card waits ~2 minutes so normal Chrome/CDP
  // warmup or a single restart does not look like a user-actionable failure.
  const [browserNotReadyPolls, setBrowserNotReadyPolls] = useState(0)
  // The "gateway down" card waits ~90 seconds. Header status changes earlier,
  // but the large recovery card is reserved for sustained outages.
  const [gatewayDownPolls, setGatewayDownPolls] = useState(0)
  const [ircConfig, setIrcConfig] = useState({ server: '', nick: '', channel: '' })
  const [googleChatWebhook, setGoogleChatWebhook] = useState('')
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)
  const [skillSuggestion, setSkillSuggestion] = useState<SkillInfo | null>(null)
  const skillSuggestionRef = useRef<SkillInfo | null>(null)
  const [dismissedSkillNames, setDismissedSkillNames] = useState<Set<string>>(new Set())
  const pendingSkillSuggestionRef = useRef<SkillInfo | null>(null)

  // Channels removed - gateway-based messaging not available in this version

  // Voice input state
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem(VOICE_MODE_STORAGE) === 'true'
  })
  const audioChunksRef = useRef<Blob[]>([])
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Audio device selection - using system defaults (setters kept for future device picker UI)
  const [selectedInputDevice, _setSelectedInputDevice] = useState<string>('')
  const [selectedOutputDevice, _setSelectedOutputDevice] = useState<string>('')

  // File upload state
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; type: string; content: string; preview?: string }>>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  // Chat auto-scroll ref and state
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const isNearBottomRef = useRef(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Message threading (reply-to) state
  const [replyToMsg, setReplyToMsg] = useState<Msg | null>(null)
  const msgRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  // Voice silence detection refs
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Refs for callbacks that need to be called from other callbacks (avoids circular dependency)
  const doSendRef = useRef<((text: string) => Promise<void>) | null>(null)
  const pushAssistantRef = useRef<((text: string) => void) | null>(null)
  const handleSendWithTextRef = useRef<((text: string) => Promise<void>) | null>(null)

  // Auto-briefing: track whether we've already triggered the initial briefing this session
  const autoTriggeredBriefingRef = useRef(false)

  // Timer for auto-follow-up after "Run in Terminal" so the AI reads the output
  const runInTerminalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thinkingMessageRef = useRef(thinkingMessage)
  thinkingMessageRef.current = thinkingMessage

  // Gateway service state — channel connection status
  const channelStatus = useChannelStatus(true, 15_000)
  const hasAnyChannel = !!(channelStatus.whatsapp?.linked || channelStatus.imessage?.configured || channelStatus.telegram?.configured)
  const hasAnyGenericChannel = !!(
    channelStatus.genericChannels.slack?.configured ||
    channelStatus.genericChannels.discord?.configured ||
    channelStatus.genericChannels.signal?.configured ||
    channelStatus.genericChannels.irc?.configured ||
    channelStatus.genericChannels.googlechat?.configured
  )
  const showChannelBanner = hasCompletedOnboarding && msgs.every(m => m.id.startsWith('welcome-')) && !hasAnyChannel && !hasAnyGenericChannel

  // Build channel status tooltip and button color class
  const channelButtonInfo = useMemo(() => {
    const lines: string[] = []
    let hasError = false
    let hasConnected = false

    // Gateway status
    if (channelStatus.gatewayHealthy === false) {
      lines.push(channelStatus.gatewayStarting ? 'Gateway: starting...' : 'Gateway: down')
      if (!channelStatus.gatewayStarting) hasError = true
    } else if (channelStatus.gatewayHealthy === true) {
      lines.push('Gateway: OK')
    }

    // Per-channel status
    const addChannel = (name: string, status: ChannelStatus | null, errorKey: string, connectedKey: 'linked' | 'configured') => {
      if (!status) return
      const err = channelStatus.channelErrors[errorKey]
      if (status[connectedKey]) {
        lines.push(`${name}: connected`)
        hasConnected = true
        if (err) { lines.push(`  ⚠ ${err}`); hasError = true }
      } else if (status.enabled) {
        lines.push(`${name}: enabled — not linked`)
      }
    }

    addChannel('WhatsApp', channelStatus.whatsapp, 'whatsapp', 'linked')
    addChannel('iMessage', channelStatus.imessage, 'imessage', 'configured')
    addChannel('Telegram', channelStatus.telegram, 'telegram', 'configured')

    const genericNames: Record<string, string> = { slack: 'Slack', discord: 'Discord', signal: 'Signal', irc: 'IRC', googlechat: 'Google Chat' }
    for (const [key, label] of Object.entries(genericNames)) {
      const gs = channelStatus.genericChannels[key as keyof typeof channelStatus.genericChannels]
      addChannel(label, gs, key, 'configured')
    }

    if (!hasConnected && !hasError && channelStatus.gatewayHealthy !== false) {
      lines.push('No channels connected')
    }

    // Determine color class: ok (green), warn (orange), down (red)
    let colorClass = 'channels-none'
    if (hasError || channelStatus.gatewayHealthy === false && !channelStatus.gatewayStarting) {
      colorClass = 'channels-error'
    } else if (channelStatus.gatewayStarting) {
      colorClass = 'channels-starting'
    } else if (hasConnected) {
      colorClass = 'channels-connected'
    }

    return { tooltip: lines.join('\n'), colorClass }
  }, [channelStatus.whatsapp, channelStatus.imessage, channelStatus.telegram, channelStatus.genericChannels, channelStatus.channelErrors, channelStatus.gatewayHealthy, channelStatus.gatewayStarting])

  const onboardingAgentsData = useMemo(() => getOnboardingAgentsPrompt(), [])

  const welcomeMessages = useMemo(
    () => {
      // If the user just onboarded with agents, show a team-oriented welcome
      if (onboardingAgentsData) {
        const agentNames = onboardingAgentsData.agents
          .map(a => `${a.emoji} ${a.name}`)
          .join(', ')
        return [
          {
            id: 'welcome-1',
            role: 'assistant' as Role,
            text: `Your team is ready! You activated ${onboardingAgentsData.agents.length} agents: ${agentNames}. Let me introduce you to each one and get them dialed in for how you work.`,
            ts: Date.now(),
          },
          {
            id: 'welcome-2',
            role: 'assistant' as Role,
            text: "Let's personalize your agents so they work exactly how you need them.",
            ts: Date.now() + 1,
            promptActions: [
              { label: 'Introduce my team & personalize', prompt: onboardingAgentsData.prompt },
              { label: 'Skip intro — check my email & calendar', prompt: SMART_PROMPT },
            ],
          },
        ]
      }

      return [
      {
        id: 'welcome-1',
        role: 'assistant' as Role,
        text: "Hi! I'm your AI browser assistant. I can browse the web for you, read pages, click buttons, fill forms, and more — all through natural conversation.",
        ts: Date.now(),
      },
      {
        id: 'welcome-2',
        role: 'assistant' as Role,
        text: "I have access to your connected email and calendar. Let me check what you should focus on today — or pick an option below.",
        ts: Date.now() + 1,
        promptActions: [
          { label: 'Check my email & calendar to get started', prompt: SMART_PROMPT },
          { label: 'Check the latest AI news', prompt: NO_AUTH_PROMPT },
          { label: 'Build a website about me', prompt: BUILD_WEBSITE_PROMPT },
        ],
      },
    ]},
    [onboardingAgentsData],
  )

  const checkAndPromptForKey = useCallback(async () => {
    // Check if user already completed onboarding for THIS version
    const onboardedVersion = localStorage.getItem(ONBOARDING_VERSION_STORAGE)

    // Check backend for a valid key (single source of truth)
    try {
      const keyStatus = await apiGet<ApiKeyStatus>('/api/clawd/service/api-key-status')
        if (keyStatus.has_key) {
          setHasCompletedOnboarding(true)
        if (keyStatus.model && keyStatus.active_provider) {
          // Only use backend model if the user hasn't made a local choice yet.
          const activeProvider = keyStatus.active_provider as Provider
          const backendModel = keyStatus.model
          if (activeProvider === 'openai') {
            const localModel = localStorage.getItem(OPENAI_MODEL_STORAGE)
            if (!localModel) {
              setSelectedModel(backendModel)
              localStorage.setItem(OPENAI_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'anthropic') {
            const localModel = localStorage.getItem(ANTHROPIC_MODEL_STORAGE)
            if (!localModel) {
              setSelectedAnthropicModel(backendModel)
              localStorage.setItem(ANTHROPIC_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'gemini') {
            const localModel = localStorage.getItem(GEMINI_MODEL_STORAGE)
            if (!localModel) {
              setSelectedGeminiModel(backendModel)
              localStorage.setItem(GEMINI_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'groq') {
            const localModel = localStorage.getItem(GROQ_MODEL_STORAGE)
            if (!localModel) {
              setSelectedGroqModel(backendModel)
              localStorage.setItem(GROQ_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'xai') {
            const localModel = localStorage.getItem(XAI_MODEL_STORAGE)
            if (!localModel) {
              setSelectedXaiModel(backendModel)
              localStorage.setItem(XAI_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'openrouter') {
            const localModel = localStorage.getItem(OPENROUTER_MODEL_STORAGE)
            if (!localModel) {
              setSelectedOpenRouterModel(backendModel)
              localStorage.setItem(OPENROUTER_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'ollama') {
            const localModel = localStorage.getItem(OLLAMA_MODEL_STORAGE)
            if (!localModel) {
              setSelectedOllamaModel(backendModel)
              localStorage.setItem(OLLAMA_MODEL_STORAGE, backendModel)
            }
          } else if (activeProvider === 'knapsack') {
            const localModel = localStorage.getItem(KNAPSACK_MODEL_STORAGE)
            if (!localModel) {
              setSelectedKnapsackModel(backendModel)
              localStorage.setItem(KNAPSACK_MODEL_STORAGE, backendModel)
            }
          }
        }
        if (keyStatus.active_provider) {
          setSelectedProvider(keyStatus.active_provider as Provider)
          setConfirmedProvider(keyStatus.active_provider as Provider)
          localStorage.setItem(ACTIVE_PROVIDER_STORAGE, keyStatus.active_provider)
        }
        // Store masked key hints for placeholders
        setKeyHints({
          openai: keyStatus.openai_key_hint,
          anthropic: keyStatus.anthropic_key_hint,
          gemini: keyStatus.gemini_key_hint,
          groq: keyStatus.groq_key_hint,
          xai: keyStatus.xai_key_hint,
          openrouter: keyStatus.openrouter_key_hint,
        })
        // Track which providers have saved keys
        setSavedProviderKeys({
          knapsack: !!keyStatus.has_knapsack,
          openai: !!keyStatus.has_openai_key,
          anthropic: !!keyStatus.has_anthropic_key,
          gemini: !!keyStatus.has_gemini_key,
          groq: !!keyStatus.has_groq_key,
          xai: !!keyStatus.has_xai_key,
          openrouter: !!keyStatus.has_openrouter_key,
        })
        if (keyStatus.knapsack_email) {
          setKnapsackEmail(keyStatus.knapsack_email)
        }
        if (keyStatus.knapsack_model) {
          const knapsackModel = KNAPSACK_MODELS.some(model => model.id === keyStatus.knapsack_model) ? keyStatus.knapsack_model : 'auto'
          setSelectedKnapsackModel(knapsackModel)
          localStorage.setItem(KNAPSACK_MODEL_STORAGE, knapsackModel)
        }
        // Restore Ollama model from backend if Ollama is the active provider
        if (keyStatus.ollama_enabled && keyStatus.ollama_model) {
          setSelectedOllamaModel(keyStatus.ollama_model)
          localStorage.setItem(OLLAMA_MODEL_STORAGE, keyStatus.ollama_model)
        }
        // Restore coding agent preference from backend
        if (keyStatus.preferred_coding_agent) {
          setPreferredCodingAgent(keyStatus.preferred_coding_agent)
          localStorage.setItem(CODING_AGENT_STORAGE, keyStatus.preferred_coding_agent)
        }
        // Fetch extra provider statuses
        if (keyStatus.extra_providers) {
          const epMap: Record<string, { has_key?: boolean; key_hint?: string }> = {}
          for (const ep of keyStatus.extra_providers as Array<{ env_var: string; has_key: boolean; key_hint?: string }>) {
            const id = ep.env_var === 'MINIMAX_API_KEY' ? 'minimax'
              : ep.env_var === 'ZAI_API_KEY' ? 'zai'
              : ep.env_var === 'HF_TOKEN' ? 'huggingface'
              : null
            if (id) epMap[id] = { has_key: ep.has_key, key_hint: ep.key_hint }
          }
          setExtraProviderStatuses(epMap)
        }
        // Also sync provider-specific models from the backend
        try {
          const fullKeys = await apiGet<{
            success: boolean
            anthropic_model?: string
            gemini_model?: string
            groq_model?: string
            xai_model?: string
            openrouter_model?: string
          }>('/api/clawd/service/get-api-key')
          if (fullKeys.anthropic_model) {
            setSelectedAnthropicModel(fullKeys.anthropic_model)
            localStorage.setItem(ANTHROPIC_MODEL_STORAGE, fullKeys.anthropic_model)
          }
          if (fullKeys.gemini_model) {
            setSelectedGeminiModel(fullKeys.gemini_model)
            localStorage.setItem(GEMINI_MODEL_STORAGE, fullKeys.gemini_model)
          }
          if (fullKeys.groq_model) {
            setSelectedGroqModel(fullKeys.groq_model)
            localStorage.setItem(GROQ_MODEL_STORAGE, fullKeys.groq_model)
          }
          if (fullKeys.xai_model) {
            setSelectedXaiModel(fullKeys.xai_model)
            localStorage.setItem(XAI_MODEL_STORAGE, fullKeys.xai_model)
          }
          if (fullKeys.openrouter_model) {
            setSelectedOpenRouterModel(fullKeys.openrouter_model)
            localStorage.setItem(OPENROUTER_MODEL_STORAGE, fullKeys.openrouter_model)
          }
        } catch { /* ignore */ }
        // If this version was already onboarded, skip the prompt
        if (onboardedVersion === APP_VERSION) {
          return true
        }
        // Has keys but hasn't seen the prompt for this version — show it
        // so they can review/change settings on upgrade
        setShowKeyPrompt(true)
        return false
      }
    } catch { /* backend not reachable, fall through */ }

    // Legacy check
    const key = await getOpenAIKey()
    if (key) {
      setHasCompletedOnboarding(true)
      if (onboardedVersion === APP_VERSION) return true
      setShowKeyPrompt(true)
      return false
    }

    // No valid key found, always show prompt
    setShowKeyPrompt(true)
    return false
  }, [])

  const handleToneChange = useCallback((toneId: string) => {
    setSelectedTone(toneId)
    localStorage.setItem(TONE_STORAGE, toneId)
    setShowToneSelector(false)
    const tone = TONE_OPTIONS.find(t => t.id === toneId)
    if (tone) {
      pushAssistant(`Got it! I'll communicate in a ${tone.name.toLowerCase()} tone from now on.`)
    }
  }, [])

  const toggleAutonomyMode = useCallback(() => {
    const newMode: AutonomyMode = autonomyMode === 'assist' ? 'autonomous' : 'assist'
    setAutonomyMode(newMode)
    localStorage.setItem(AUTONOMY_MODE_STORAGE, newMode)
    const modeOption = AUTONOMY_OPTIONS.find(m => m.id === newMode)
    if (modeOption) {
      pushAssistant(newMode === 'autonomous'
        ? "🚀 **Take Care of It mode enabled.** I'll work independently and only check in for critical actions like spending money or sending messages."
        : "🤝 **Assist mode enabled.** I'll check in with you more frequently and ask before taking actions."
      )
    }
  }, [autonomyMode])

  // Proactive mode toggle — shows modal explaining implications
  const toggleProactiveMode = useCallback(() => {
    const newState = !proactiveMode
    setPendingProactiveState(newState)
    setShowProactiveModal(true)
  }, [proactiveMode])

  const confirmProactiveToggle = useCallback(() => {
    setProactiveMode(pendingProactiveState)
    localStorage.setItem(PROACTIVE_MODE_STORAGE, String(pendingProactiveState))
    setShowProactiveModal(false)
    pushAssistant(pendingProactiveState
      ? "🔔 **Proactive mode enabled.** I'll keep you in the loop throughout the day — morning briefings, meeting prep, email alerts, and proactive check-ins. If you have channels connected (WhatsApp, iMessage), I'll be more conversational there too, offering to help and flagging things worth your attention."
      : "🔕 **Reactive mode enabled.** Background notifications and heartbeat monitoring are off. I'll only respond when you ask. You can still trigger notifications manually with /morning, /emails, /prep, or /fu."
    )

    // Sync heartbeat config with proactive mode
    fetch('http://127.0.0.1:8897/api/knapsack/heartbeat/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: pendingProactiveState }),
    }).catch(e => console.warn('[proactive] Failed to sync heartbeat config:', e))

    // Fire a welcome notification so the user can see it works immediately
    if (pendingProactiveState) {
      emit('kn_trigger_proactive_welcome')
    }
  }, [pendingProactiveState])

  // Advanced mode toggle — shows warning dialog before enabling
  const toggleAdvancedMode = useCallback(() => {
    if (!advancedMode) {
      setShowAdvancedWarning(true)
    } else {
      setAdvancedMode(false)
      localStorage.setItem(ADVANCED_MODE_STORAGE, 'false')
      pushAssistant('Standard mode restored. Shell command execution is disabled.')
    }
  }, [advancedMode])

  const confirmAdvancedMode = useCallback(() => {
    setAdvancedMode(true)
    localStorage.setItem(ADVANCED_MODE_STORAGE, 'true')
    setShowAdvancedWarning(false)
    pushAssistant('⚡ **Advanced mode enabled.** I can now run shell commands to install software, check versions, and execute scripts. Dangerous commands are blocked for safety.')
  }, [])

  // Developer mode toggle — requires Advanced mode, adds Sentry/error log scanning & auto-PR
  const toggleDeveloperMode = useCallback(() => {
    if (!developerMode) {
      // Enabling developer mode also enables advanced mode
      if (!advancedMode) {
        setAdvancedMode(true)
        localStorage.setItem(ADVANCED_MODE_STORAGE, 'true')
      }
      setShowDeveloperWarning(true)
    } else {
      setDeveloperMode(false)
      setShowDevPanel(false)
      localStorage.setItem(DEVELOPER_MODE_STORAGE, 'false')
      pushAssistant('Developer mode disabled. Sentry scanning and auto-PR features turned off. Advanced mode remains active.')
    }
  }, [developerMode, advancedMode])

  const confirmDeveloperMode = useCallback(() => {
    setDeveloperMode(true)
    localStorage.setItem(DEVELOPER_MODE_STORAGE, 'true')
    setShowDeveloperWarning(false)
    setShowDevPanel(true)
    pushAssistant('{} **Developer mode enabled.** I will now scan your email for Sentry error reports and local error logs. When bugs are found, I can automatically initiate Claude Code sessions and create PRs to fix them in the knapsack-desktop project.')
  }, [])

  // Handle initiating a Claude Code session from the Developer panel
  const handleDevSessionInitiate = useCallback((prompt: string) => {
    // Enable advanced mode if not already (needed for shell commands)
    if (!advancedMode) {
      setAdvancedMode(true)
      localStorage.setItem(ADVANCED_MODE_STORAGE, 'true')
    }
    // Send the prompt as a new message
    if (doSendRef.current) {
      doSendRef.current(prompt)
    }
  }, [advancedMode])

  // Skills panel — fetch from backend, fall back to static catalog
  const fetchSkills = useCallback(async () => {
    setSkillsLoading(true)
    setSkillsError(null)
    try {
      const resp = await apiGet<{ success: boolean; skills?: any; error?: string }>('/api/clawd/skills/status')
      if (resp.success && resp.skills) {
        const raw = Array.isArray(resp.skills) ? resp.skills : (resp.skills?.skills || [])
        const normalized = (raw as any[]).map((s: any) => {
          const skill = { ...s }
          if (!skill.installOptions && skill.install) {
            skill.installOptions = skill.install
          }
          if (skill.missing && !Array.isArray(skill.missing)) {
            const m = skill.missing
            skill.missing = [
              ...(m.bins || []),
              ...(m.anyBins || []),
              ...(m.env || []),
              ...(m.config || []),
              ...(m.os || []),
            ]
          }
          return skill
        })
        setSkills(normalized as SkillInfo[])
      } else {
        // Backend returned error — use static catalog
        setSkills(FALLBACK_SKILLS)
      }
    } catch {
      // Backend unreachable — use static catalog
      setSkills(FALLBACK_SKILLS)
    } finally {
      setSkillsLoading(false)
    }
  }, [])

  const handleSkillInstallRef = useRef<(skillName: string, installId: string) => Promise<void>>(async () => {})
  const handleSkillInstall = useCallback(async (skillName: string, installId: string) => {
    try {
      pushAssistant(`Installing ${skillName}...`)
      const resp = await apiPost<{ success: boolean; error?: string }>('/api/clawd/skills/install', { name: skillName, installId })
      if (resp.success) {
        pushAssistant(`${skillName} installed successfully.`)
        await fetchSkills()
      } else {
        pushAssistant(`Could not install ${skillName}: ${resp.error || 'Gateway unavailable. OpenClaw skills require the ClawdBot gateway — check Activity panel for status.'}`)
      }
    } catch {
      pushAssistant(`Could not install ${skillName}. OpenClaw skills require the ClawdBot gateway to be running — check the Activity panel for status.`)
    }
  }, [fetchSkills])
  handleSkillInstallRef.current = handleSkillInstall

  const handleSkillToggle = useCallback(async (skillKey: string, enabled: boolean) => {
    try {
      const resp = await apiPost<{ success: boolean; error?: string }>('/api/clawd/skills/update', { skillKey, enabled })
      if (resp.success) {
        await fetchSkills()
      } else {
        pushAssistant(`Could not update skill: ${resp.error || 'Gateway unavailable.'}`)
      }
    } catch {
      pushAssistant(`Could not update skill. The ClawdBot gateway needs to be running — check the Activity panel for status.`)
    }
  }, [fetchSkills])

  // Channel handlers removed - gateway-based messaging not available in this version

  // Audio device loading removed - uses system defaults for now
  // To re-add device selection UI, restore loadAudioDevices and use setAudioInputDevices/setAudioOutputDevices

  // Stop any currently playing audio
  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }
  }, [])

  // Voice input handlers with silence detection (auto-submit after 1.5s silence)
  const SILENCE_THRESHOLD = 0.01 // Audio level considered silence
  const SILENCE_DURATION = 1500 // ms of silence before auto-submit
  const MIN_RECORDING_TIME = 500 // ms minimum recording before silence detection kicks in

  const startRecording = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedInputDevice ? { deviceId: { exact: selectedInputDevice } } : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Find a supported mime type that OpenAI Whisper accepts
      // Whisper supports: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
      // Safari prefers mp4/m4a, Chrome/Firefox prefer webm
      const mimeTypesWithExtensions: Array<{ mimeType: string; extension: string }> = [
        { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
        { mimeType: 'audio/webm', extension: 'webm' },
        { mimeType: 'audio/mp4', extension: 'm4a' },
        { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
        { mimeType: 'audio/ogg', extension: 'ogg' },
        { mimeType: 'audio/wav', extension: 'wav' },
      ]
      let selectedMimeType = 'audio/webm'
      let selectedExtension = 'webm'
      for (const { mimeType, extension } of mimeTypesWithExtensions) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          selectedExtension = extension
          break
        }
      }
      console.log('[Voice] Using mime type:', selectedMimeType, 'extension:', selectedExtension)

      // Store extension in a ref so onstop can access it
      const recordingExtension = selectedExtension

      const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType })
      audioChunksRef.current = []

      // Set up Web Audio API for silence detection
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const recordingStartTime = Date.now()
      let lastSoundTime = Date.now()

      // Monitor audio levels for silence detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkSilence = () => {
        if (!analyserRef.current || recorder.state === 'inactive') return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255

        if (average > SILENCE_THRESHOLD) {
          // Sound detected, reset silence timer
          lastSoundTime = Date.now()
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
            silenceTimeoutRef.current = null
          }
        } else {
          // Silence detected
          const timeSinceLastSound = Date.now() - lastSoundTime
          const timeSinceStart = Date.now() - recordingStartTime

          // Only auto-stop if we've been recording for a bit and there's prolonged silence
          if (timeSinceStart > MIN_RECORDING_TIME && timeSinceLastSound >= SILENCE_DURATION) {
            if (!silenceTimeoutRef.current) {
              // Auto-stop recording after silence
              silenceTimeoutRef.current = setTimeout(() => {
                if (recorder.state !== 'inactive') {
                  recorder.stop()
                  setIsRecording(false)
                }
              }, 100) // Small delay to ensure we capture the last bits
            }
          }
        }

        // Continue monitoring if still recording
        if (recorder.state === 'recording') {
          requestAnimationFrame(checkSilence)
        }
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = async () => {
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        analyserRef.current = null
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = null
        }
        stream.getTracks().forEach(track => track.stop())

        // Use the extension we determined at recording start
        console.log('[Voice] Recording stopped, using extension:', recordingExtension)

        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType })
        await transcribeAudio(audioBlob, recordingExtension)
      }

      recorder.start(100) // Collect data every 100ms for smoother silence detection
      setMediaRecorder(recorder)
      setIsRecording(true)

      // Start silence detection
      requestAnimationFrame(checkSilence)
    } catch (e: any) {
      pushAssistant(`🎤 Microphone access denied: ${e?.message || String(e)}`)
    }
  }, [selectedInputDevice])

  const stopRecording = useCallback(() => {
    // Clean up silence detection
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }, [mediaRecorder])

  const transcribeAudio = useCallback(async (audioBlob: Blob, extension: string = 'webm') => {
    setIsTranscribing(true)
    try {
      // Get the API key from backend
      const storedKey = await getOpenAIKey()
      if (!storedKey) {
        pushAssistantRef.current?.('🎤 Please set your OpenAI API key first to use voice input.')
        setShowKeyPrompt(true)
        return
      }

      console.log('[Voice] Sending transcription request, format:', extension, 'size:', audioBlob.size)

      // Send to OpenAI Whisper API
      const formData = new FormData()
      formData.append('file', audioBlob, `recording.${extension}`)
      formData.append('model', 'whisper-1')

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedKey}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(errorText || `Whisper API error: ${res.status}`)
      }

      const data = await res.json()
      if (data.text && data.text.trim()) {
        // Auto-send the transcribed text — queues if chat is busy mid-inference
        handleSendWithTextRef.current?.(data.text)
      }
    } catch (e: any) {
      pushAssistantRef.current?.(`🎤 Transcription failed: ${e?.message || String(e)}`)
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  // Check whether the currently selected model supports vision (image attachments)
  const currentModelSupportsVision = useCallback((): { supported: boolean; modelName: string; visionModels: string[] } => {
    if (selectedProvider === 'knapsack') {
      const currentId = selectedKnapsackModel || 'auto'
      return {
        supported: true,
        modelName: KNAPSACK_MODELS.find(m => m.id === currentId)?.name || currentId,
        visionModels: [],
      }
    }
    const allModels = selectedProvider === 'openai' ? OPENAI_MODELS
      : selectedProvider === 'anthropic' ? ANTHROPIC_MODELS
      : selectedProvider === 'gemini' ? GEMINI_MODELS
      : selectedProvider === 'groq' ? GROQ_MODELS
      : selectedProvider === 'xai' ? XAI_MODELS
      : selectedProvider === 'openrouter' ? OPENROUTER_MODELS
      : []
    const currentId = selectedProvider === 'openai' ? selectedModel
      : selectedProvider === 'anthropic' ? selectedAnthropicModel
      : selectedProvider === 'gemini' ? selectedGeminiModel
      : selectedProvider === 'groq' ? selectedGroqModel
      : selectedProvider === 'xai' ? selectedXaiModel
      : selectedProvider === 'openrouter' ? selectedOpenRouterModel
      : ''
    const current = allModels.find(m => m.id === currentId)
    // Ollama: we don't know model capabilities, assume supported
    if (selectedProvider === 'ollama') return { supported: true, modelName: '', visionModels: [] }
    const modelName = current?.name || currentId
    const supported = current?.vision ?? false
    const visionModels = allModels.filter(m => m.vision).map(m => m.name)
    return { supported, modelName, visionModels }
  }, [selectedProvider, selectedModel, selectedAnthropicModel, selectedGeminiModel, selectedGroqModel, selectedXaiModel, selectedOpenRouterModel, selectedKnapsackModel])

  // File upload handlers
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: Array<{ name: string; type: string; content: string; preview?: string }> = []

    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/')) {
          // For images, read as data URL then compress to avoid oversized payloads
          const rawDataUrl = await readFileAsDataURL(file)
          const dataUrl = await compressImage(rawDataUrl)
          newFiles.push({
            name: file.name,
            type: dataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : file.type,
            content: dataUrl,
            preview: dataUrl,
          })
        } else if (file.type === 'application/pdf') {
          // PDFs are binary - read as base64 and let the backend handle extraction
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({
            name: file.name,
            type: file.type,
            content: dataUrl,
          })
        } else if (file.type.startsWith('text/') ||
                   file.name.endsWith('.md') || file.name.endsWith('.json') ||
                   file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          // For text files, read as text
          const text = await readFileAsText(file)
          newFiles.push({
            name: file.name,
            type: file.type || 'text/plain',
            content: text,
          })
        } else {
          // For other files, read as base64
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({
            name: file.name,
            type: file.type || 'application/octet-stream',
            content: dataUrl,
          })
        }
      } catch (err: any) {
        pushAssistant(`📎 Failed to read file ${file.name}: ${err?.message || String(err)}`)
      }
    }

    setAttachedFiles(prev => [...prev, ...newFiles])

    // Warn if attaching images with a model that doesn't support vision
    const hasImages = newFiles.some(f => f.type.startsWith('image/'))
    if (hasImages) {
      const { supported, modelName, visionModels } = currentModelSupportsVision()
      if (!supported) {
        const visionList = visionModels.length > 0
          ? ` Vision-capable models on this provider: **${visionModels.slice(0, 3).join('**, **')}**${visionModels.length > 3 ? ` (+${visionModels.length - 3} more)` : ''}.`
          : ''
        pushAssistant(`⚠️ **${modelName}** does not support image analysis — the image was attached but will be ignored.${visionList} Switch models in the provider settings to enable vision.`)
      }
    }

    // Reset input
    if (e.target) e.target.value = ''
  }, [currentModelSupportsVision])

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  // Resize large images to prevent "Load failed" errors from oversized fetch payloads.
  // macOS screenshots (Retina) can be 5-10+ MB; this resizes to max 1600px and
  // re-encodes as JPEG to keep the base64 payload under ~1 MB.
  const compressImage = (dataUrl: string, maxDim = 1600, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        // Skip compression for small images (< 500 KB base64 ≈ 375 KB raw)
        if (dataUrl.length < 500_000) {
          resolve(dataUrl)
          return
        }
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(dataUrl) // Fall back to original on error
      img.src = dataUrl
    })
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  const removeAttachedFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Drag-and-drop file upload handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const newFiles: Array<{ name: string; type: string; content: string; preview?: string }> = []

    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/')) {
          const rawDataUrl = await readFileAsDataURL(file)
          const dataUrl = await compressImage(rawDataUrl)
          newFiles.push({ name: file.name, type: dataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : file.type, content: dataUrl, preview: dataUrl })
        } else if (file.type === 'application/pdf') {
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({ name: file.name, type: file.type, content: dataUrl })
        } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const text = await readFileAsText(file)
          newFiles.push({ name: file.name, type: file.type || 'text/plain', content: text })
        } else {
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({ name: file.name, type: file.type || 'application/octet-stream', content: dataUrl })
        }
      } catch (err) {
        console.error(`Error reading dropped file ${file.name}:`, err)
      }
    }

    setAttachedFiles(prev => [...prev, ...newFiles])

    // Warn if dropping images with a model that doesn't support vision
    const hasImages = newFiles.some(f => f.type.startsWith('image/'))
    if (hasImages) {
      const { supported, modelName, visionModels } = currentModelSupportsVision()
      if (!supported) {
        const visionList = visionModels.length > 0
          ? ` Vision-capable models on this provider: **${visionModels.slice(0, 3).join('**, **')}**${visionModels.length > 3 ? ` (+${visionModels.length - 3} more)` : ''}.`
          : ''
        pushAssistant(`⚠️ **${modelName}** does not support image analysis — the image was attached but will be ignored.${visionList} Switch models in the provider settings to enable vision.`)
      }
    }
  }, [currentModelSupportsVision])

  // Listen for Tauri native file-drop events — the webview in Tauri does not
  // forward file data through the browser's drop event, so we handle drops
  // via Tauri's event system to actually attach the files.
  useEffect(() => {
    let cancelled = false
    const cleanups: Array<() => void> = []

    ;(async () => {
      const unlistenDrop = await tauriListen<string[]>('tauri://file-drop', async (event) => {
        if (cancelled) return
        setIsDragOver(false)
        dragCounter.current = 0

        const paths = event.payload
        if (!paths || paths.length === 0) return

        const newFiles: Array<{ name: string; type: string; content: string; preview?: string }> = []

        for (const filePath of paths) {
          try {
            const fileName = filePath.split(/[/\\]/).pop() || 'file'
            const ext = fileName.split('.').pop()?.toLowerCase() || ''
            const mimeType = getMimeTypeFromExt(ext)

            const assetUrl = convertFileSrc(filePath)
            const response = await fetch(assetUrl)
            const blob = await response.blob()

            if (mimeType.startsWith('text/') || ['txt', 'md', 'json', 'csv'].includes(ext)) {
              const text = await blob.text()
              newFiles.push({ name: fileName, type: mimeType, content: text })
            } else {
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => reject(reader.error)
                reader.readAsDataURL(blob)
              })
              if (mimeType.startsWith('image/')) {
                const compressed = await compressImage(dataUrl)
                newFiles.push({ name: fileName, type: compressed.startsWith('data:image/jpeg') ? 'image/jpeg' : mimeType, content: compressed, preview: compressed })
              } else {
                newFiles.push({ name: fileName, type: mimeType, content: dataUrl })
              }
            }
          } catch (err) {
            console.error(`Error reading dropped file:`, err)
          }
        }

        if (newFiles.length > 0) {
          setAttachedFiles(prev => [...prev, ...newFiles])

          // Warn if dropping images with a model that doesn't support vision
          const hasImages = newFiles.some(f => f.type.startsWith('image/'))
          if (hasImages) {
            const { supported, modelName, visionModels } = currentModelSupportsVision()
            if (!supported) {
              const visionList = visionModels.length > 0
                ? ` Vision-capable models on this provider: **${visionModels.slice(0, 3).join('**, **')}**${visionModels.length > 3 ? ` (+${visionModels.length - 3} more)` : ''}.`
                : ''
              pushAssistant(`⚠️ **${modelName}** does not support image analysis — the image was attached but will be ignored.${visionList} Switch models in the provider settings to enable vision.`)
            }
          }
        }
      })
      cleanups.push(unlistenDrop)

      const unlistenHover = await tauriListen<string[]>('tauri://file-drop-hover', () => {
        if (cancelled) return
        setIsDragOver(true)
      })
      cleanups.push(unlistenHover)

      const unlistenCancel = await tauriListen('tauri://file-drop-cancelled', () => {
        if (cancelled) return
        setIsDragOver(false)
        dragCounter.current = 0
      })
      cleanups.push(unlistenCancel)
    })()

    return () => {
      cancelled = true
      cleanups.forEach(fn => fn())
    }
  }, [])

  // Listen for Claude Code started/exited events to auto-open Activity Panel
  // and show an indicator in the chat while it's running.
  const onToggleActivityRef = useRef(onToggleActivity)
  onToggleActivityRef.current = onToggleActivity
  const externalActivityPanelRef = useRef(externalActivityPanel)
  externalActivityPanelRef.current = externalActivityPanel

  useEffect(() => {
    let cancelled = false
    const cleanups: Array<() => void> = []

    ;(async () => {
      const unlistenStarted = await tauriListen<{ processId: string; sessionId: string; prompt: string; cwd: string; agent?: string }>(
        'claude-code-started',
        (event) => {
          if (cancelled) return
          setClaudeCodeActive(true)
          setClaudeCodePrompt(event.payload.prompt)
          const a = event.payload.agent
          setCodingAgentName(a === 'codex' ? 'Codex' : a === 'gemini' ? 'Gemini CLI' : a === 'opencode' ? 'OpenCode' : 'Claude Code')
          // Auto-open Activity Panel if not already open
          if (!externalActivityPanelRef.current && onToggleActivityRef.current) {
            onToggleActivityRef.current()
          }
        },
      )
      cleanups.push(unlistenStarted)

      const unlistenExit = await tauriListen<{ processId: string; sessionId: string; exitCode: number }>(
        'streaming-exit',
        (event) => {
          if (cancelled) return
          // Only handle exits from the claude-code session
          if (event.payload.sessionId === 'claude-code') {
            setClaudeCodeActive(false)
            setClaudeCodePrompt(null)
          }
        },
      )
      cleanups.push(unlistenExit)

      // Listen for open-activity-panel events from the AI agent
      const unlistenOpenPanel = await tauriListen<Record<string, never>>(
        'open-activity-panel',
        () => {
          if (cancelled) return
          if (!externalActivityPanelRef.current && onToggleActivityRef.current) {
            onToggleActivityRef.current()
          }
        },
      )
      cleanups.push(unlistenOpenPanel)

      // Forward compose-email-ready events to the window so Home.tsx can switch tabs
      const unlistenCompose = await tauriListen<Record<string, unknown>>(
        'compose-email-ready',
        (event) => {
          if (cancelled) return
          window.dispatchEvent(new CustomEvent('clawd-email-draft-ready', { detail: event.payload }))
        },
      )
      cleanups.push(unlistenCompose)

      // Knapsack deep-link auth callback from the OS URL scheme handler
      const unlistenKnapsackConnected = await tauriListen<{ email: string }>(
        'knapsack-connected',
        (event) => {
          if (cancelled) return
          const { email } = event.payload
          setKnapsackEmail(email)
          setIsKnapsackConnecting(false)
          setKnapsackConnectError(null)
          setSelectedProvider('knapsack')
          setConfirmedProvider('knapsack')
          localStorage.setItem(ACTIVE_PROVIDER_STORAGE, 'knapsack')
          setSavedProviderKeys(prev => ({ ...prev, knapsack: true }))
          pushAssistant(`Connected to Knapsack as **${email}**.`)
        },
      )
      cleanups.push(unlistenKnapsackConnected)

      const unlistenKnapsackError = await tauriListen<{ error: string }>(
        'knapsack-auth-error',
        (event) => {
          if (cancelled) return
          setIsKnapsackConnecting(false)
          setKnapsackConnectError(event.payload.error || 'Connection failed')
        },
      )
      cleanups.push(unlistenKnapsackError)
    })()

    return () => {
      cancelled = true
      cleanups.forEach(fn => fn())
    }
  }, [])

  // Gateway service handler removed - channels UI removed in this version

  // ── Ollama auto-detect ────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedProvider !== 'ollama' || !showKeyPrompt) return
    setOllamaRunning(null)
    const checkOllama = async () => {
      try {
        const s = await apiGet<{ running: boolean }>('/api/knapsack/ollama/status')
        setOllamaRunning(s.running)
        if (s.running) {
          const m = await apiGet<{ success: boolean; models: Array<{ name: string; parameter_size?: string }> }>('/api/knapsack/ollama/models')
          if (m.success) {
            setOllamaModels(m.models)
            if (m.models.length > 0 && !selectedOllamaModel) {
              setSelectedOllamaModel(m.models[0].name)
            }
          }
        }
      } catch {
        setOllamaRunning(false)
      }
    }
    checkOllama()
  }, [selectedProvider, showKeyPrompt])

  // ── Background AI (heartbeat) config fetch ─────────────────────────────
  useEffect(() => {
    if (!showKeyPrompt) return
    apiGet<{ success: boolean; data: { enabled: boolean } }>('/api/knapsack/heartbeat/config')
      .then(data => { if (data.success) setBackgroundAiEnabled(data.data.enabled) })
      .catch(() => {})
  }, [showKeyPrompt])

  const toggleBackgroundAi = useCallback(async () => {
    const newVal = !backgroundAiEnabled
    setBackgroundAiLoading(true)
    try {
      const resp = await fetch(apiUrl('/api/knapsack/heartbeat/config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newVal }),
      })
      const data = await resp.json()
      if (data.success) setBackgroundAiEnabled(newVal)
    } catch {}
    setBackgroundAiLoading(false)
  }, [backgroundAiEnabled])

  const pullOllamaModel = useCallback(async (modelId: string) => {
    setOllamaPulling(true)
    setOllamaPullProgress('Starting download...')
    setOllamaPullPercent(null)
    try {
      const resp = await fetch(apiUrl('/api/knapsack/ollama/pull'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: 'Pull failed' }))
        setOllamaPullProgress(`Error: ${err.message}`)
        return
      }
      const reader = resp.body?.getReader()
      if (!reader) { setOllamaPullProgress('Error: no response stream'); return }
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        // Parse newline-delimited JSON
        const lines = buf.split('\n')
        buf = lines.pop() || '' // keep incomplete line in buffer
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.status) {
              setOllamaPullProgress(msg.status)
            }
            if (msg.total && msg.completed) {
              setOllamaPullPercent(Math.round((msg.completed / msg.total) * 100))
            }
          } catch { /* ignore malformed lines */ }
        }
      }
      // Pull complete — refresh model list
      setOllamaPullProgress('Download complete!')
      setOllamaPullPercent(100)
      const m = await apiGet<{ success: boolean; models: Array<{ name: string; parameter_size?: string }> }>('/api/knapsack/ollama/models')
      if (m.success) {
        setOllamaModels(m.models)
        // Auto-select the model we just pulled
        const pulled = m.models.find(mod => mod.name.startsWith(modelId.split(':')[0]))
        if (pulled) setSelectedOllamaModel(pulled.name)
      }
    } catch (e: any) {
      setOllamaPullProgress(`Error: ${e?.message || String(e)}`)
    } finally {
      setOllamaPulling(false)
    }
  }, [])

  // Ollama uses a separate save flow (ollama/configure endpoint, no API key)
  const saveOllamaProvider = useCallback(async () => {
    if (!selectedOllamaModel) return
    setSavingKey(true)
    try {
      await apiPost('/api/knapsack/ollama/configure', {
        enabled: true,
        model: selectedOllamaModel,
      })
      localStorage.setItem(OLLAMA_MODEL_STORAGE, selectedOllamaModel)
      setConfirmedProvider('ollama')
      localStorage.setItem(ACTIVE_PROVIDER_STORAGE, 'ollama')
      setShowKeyPrompt(false)
      setHasCompletedOnboarding(true)
      localStorage.setItem(ONBOARDING_VERSION_STORAGE, APP_VERSION)
      try {
        await apiPost('/api/clawd/service/enable', { enabled: true })
        await refreshStatus()
        pushAssistant(`Great! I'm all set up with Ollama (${selectedOllamaModel}) running locally. No API costs! Try asking me to browse a website!`)
      } catch {
        pushAssistant('Ollama enabled! You can now use local AI models.')
      }
    } catch (e: any) {
      pushAssistant(`Failed to enable Ollama: ${e?.message || String(e)}. Please try again.`)
    } finally {
      setSavingKey(false)
    }
  }, [selectedOllamaModel])

  const saveApiKey = useCallback(async () => {
    if (selectedProvider === 'ollama') { saveOllamaProvider(); return }
    if (!apiKey.trim()) return

    setSavingKey(true)
    try {
      const modelForProvider = selectedProvider === 'openai' ? selectedModel
        : selectedProvider === 'anthropic' ? selectedAnthropicModel
        : selectedProvider === 'gemini' ? selectedGeminiModel
        : selectedProvider === 'groq' ? selectedGroqModel
        : selectedProvider === 'xai' ? selectedXaiModel
        : selectedProvider === 'openrouter' ? selectedOpenRouterModel
        : selectedProvider === 'knapsack' ? selectedKnapsackModel
        : undefined
      await apiPost('/api/clawd/service/set-api-key', {
        key: apiKey.trim(),
        model: modelForProvider,
        provider: selectedProvider,
      })
      if (selectedProvider === 'openai') {
        _cachedApiKey = apiKey.trim() // Update in-memory cache for voice/TTS
        localStorage.setItem(OPENAI_MODEL_STORAGE, selectedModel)
      } else if (selectedProvider === 'anthropic') {
        localStorage.setItem(ANTHROPIC_MODEL_STORAGE, selectedAnthropicModel)
      } else if (selectedProvider === 'gemini') {
        localStorage.setItem(GEMINI_MODEL_STORAGE, selectedGeminiModel)
      } else if (selectedProvider === 'groq') {
        localStorage.setItem(GROQ_MODEL_STORAGE, selectedGroqModel)
      } else if (selectedProvider === 'xai') {
        localStorage.setItem(XAI_MODEL_STORAGE, selectedXaiModel)
      } else if (selectedProvider === 'openrouter') {
        localStorage.setItem(OPENROUTER_MODEL_STORAGE, selectedOpenRouterModel)
      } else if (selectedProvider === 'knapsack') {
        localStorage.setItem(KNAPSACK_MODEL_STORAGE, selectedKnapsackModel)
      }
      setConfirmedProvider(selectedProvider)
      localStorage.setItem(ACTIVE_PROVIDER_STORAGE, selectedProvider)
      setShowKeyPrompt(false)
      setEditingProviderKey(false)
      setHasCompletedOnboarding(true)
      localStorage.setItem(ONBOARDING_VERSION_STORAGE, APP_VERSION)
      // Mark this provider as having a saved key
      setSavedProviderKeys(prev => ({ ...prev, [selectedProvider]: true }))
      setKeyHints(prev => ({ ...prev, [selectedProvider]: apiKey.trim().slice(0, 6) + '...' + apiKey.trim().slice(-4) }))

      // Auto-enable the service after key is saved
      try {
        await apiPost('/api/clawd/service/enable', { enabled: true })
        await refreshStatus()
        const providerInfo = PROVIDERS.find(p => p.id === selectedProvider)
        let modelName: string
        if (selectedProvider === 'openai') {
          modelName = OPENAI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel
        } else if (selectedProvider === 'anthropic') {
          modelName = ANTHROPIC_MODELS.find(m => m.id === selectedAnthropicModel)?.name || selectedAnthropicModel
        } else if (selectedProvider === 'groq') {
          modelName = GROQ_MODELS.find(m => m.id === selectedGroqModel)?.name || selectedGroqModel
        } else if (selectedProvider === 'xai') {
          modelName = XAI_MODELS.find(m => m.id === selectedXaiModel)?.name || selectedXaiModel
        } else if (selectedProvider === 'openrouter') {
          modelName = OPENROUTER_MODELS.find(m => m.id === selectedOpenRouterModel)?.name || selectedOpenRouterModel
        } else if (selectedProvider === 'knapsack') {
          modelName = KNAPSACK_MODELS.find(m => m.id === selectedKnapsackModel)?.name || selectedKnapsackModel
        } else {
          modelName = GEMINI_MODELS.find(m => m.id === selectedGeminiModel)?.name || selectedGeminiModel
        }
        pushAssistant(`Great! I'm all set up with ${providerInfo?.name || selectedProvider} (${modelName}) and ready to help. Try asking me to browse a website!`)
      } catch (e: any) {
        pushAssistant(
          'API key saved! You can now enable the browser assistant using the Enable button below.',
        )
      }
    } catch (e: any) {
      pushAssistant(`Failed to save API key: ${e?.message || String(e)}. Please try again.`)
    } finally {
      setSavingKey(false)
    }
  }, [apiKey, selectedModel, selectedAnthropicModel, selectedGeminiModel, selectedGroqModel, selectedXaiModel, selectedOpenRouterModel, selectedKnapsackModel, selectedOllamaModel, selectedProvider, saveOllamaProvider])

  // Switch to a provider that already has a saved key (no new key needed)
  const switchProviderModel = useCallback(async (providerId: Provider, alreadyActive = false) => {
    // Ollama uses its own configure endpoint
    if (providerId === 'ollama') {
      saveOllamaProvider()
      return
    }
    setSavingKey(true)
    try {
      const modelForProvider = providerId === 'openai' ? selectedModel
        : providerId === 'anthropic' ? selectedAnthropicModel
        : providerId === 'gemini' ? selectedGeminiModel
        : providerId === 'groq' ? selectedGroqModel
        : providerId === 'xai' ? selectedXaiModel
        : providerId === 'openrouter' ? selectedOpenRouterModel
        : providerId === 'knapsack' ? selectedKnapsackModel
        : undefined
      await apiPost('/api/clawd/service/set-api-key', {
        provider: providerId,
        model: modelForProvider,
        // No key — backend keeps existing key for this provider
      })
      if (providerId === 'openai') {
        localStorage.setItem(OPENAI_MODEL_STORAGE, selectedModel)
      } else if (providerId === 'anthropic') {
        localStorage.setItem(ANTHROPIC_MODEL_STORAGE, selectedAnthropicModel)
      } else if (providerId === 'gemini') {
        localStorage.setItem(GEMINI_MODEL_STORAGE, selectedGeminiModel)
      } else if (providerId === 'groq') {
        localStorage.setItem(GROQ_MODEL_STORAGE, selectedGroqModel)
      } else if (providerId === 'xai') {
        localStorage.setItem(XAI_MODEL_STORAGE, selectedXaiModel)
      } else if (providerId === 'openrouter') {
        localStorage.setItem(OPENROUTER_MODEL_STORAGE, selectedOpenRouterModel)
      } else if (providerId === 'knapsack') {
        localStorage.setItem(KNAPSACK_MODEL_STORAGE, selectedKnapsackModel)
      }
      setSelectedProvider(providerId)
      localStorage.setItem(ACTIVE_PROVIDER_STORAGE, providerId)
      setShowKeyPrompt(false)
      try {
        await apiPost('/api/clawd/service/enable', { enabled: true })
        await refreshStatus()
      } catch {}
      const providerInfo = PROVIDERS.find(p => p.id === providerId)
      const models = providerId === 'openai' ? OPENAI_MODELS
        : providerId === 'anthropic' ? ANTHROPIC_MODELS
        : providerId === 'gemini' ? GEMINI_MODELS
        : providerId === 'xai' ? XAI_MODELS
        : providerId === 'knapsack' ? KNAPSACK_MODELS
        : providerId === 'openrouter' ? OPENROUTER_MODELS
        : GROQ_MODELS
      const mv = providerId === 'openai' ? selectedModel
        : providerId === 'anthropic' ? selectedAnthropicModel
        : providerId === 'gemini' ? selectedGeminiModel
        : providerId === 'xai' ? selectedXaiModel
        : providerId === 'knapsack' ? selectedKnapsackModel
        : providerId === 'openrouter' ? selectedOpenRouterModel
        : selectedGroqModel
      const modelName = models.find(m => m.id === mv)?.name || mv
      if (!alreadyActive) {
        pushAssistant(`Switched to ${providerInfo?.name || providerId} (${modelName}).`)
      }
    } catch (e: any) {
      pushAssistant(`Failed to switch provider: ${e?.message || String(e)}`)
    } finally {
      setSavingKey(false)
    }
  }, [selectedModel, selectedAnthropicModel, selectedGeminiModel, selectedGroqModel, selectedXaiModel, selectedOpenRouterModel, selectedKnapsackModel])

  useEffect(() => {
    const init = async () => {
      // Only show welcome messages if no chat history exists
      if (msgs.length === 0) {
        setMsgs(welcomeMessages)
      }

      // Start the service on launch — only enable if not already running.
      // Avoid cycling (disable+enable) because SIGTERMing a healthy gateway
      // causes the browser to disconnect and triggers the restart loop.
      // Retry up to 3 times with backoff because in dev mode the Rust backend
      // may not be ready when the React app mounts.
      try {
        let s: ServiceStatus | null = null
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            s = await apiGet<ServiceStatus>('/api/clawd/service/status')
            break
          } catch {
            // Backend not ready yet — wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          }
        }
        if (!s) {
          // All retries failed — try one last time without catching
          s = await apiGet<ServiceStatus>('/api/clawd/service/status')
        }
        setStatus(s)

        if (!s.running) {
          // Service is not running — start it (retry once on failure)
          try {
            await apiPost('/api/clawd/service/enable', { enabled: true })
          } catch {
            // First enable attempt failed — wait and retry
            await new Promise(resolve => setTimeout(resolve, 2000))
            await apiPost('/api/clawd/service/enable', { enabled: true })
          }
          // Wait for gateway to become healthy (with exponential backoff on backend).
          // The startup-ready endpoint polls until the gateway responds or 30s elapses.
          try {
            await fetch('http://127.0.0.1:8897/api/clawd/service/startup-ready')
          } catch {
            // Backend might not be reachable yet — fall back to a short delay
            await new Promise(resolve => setTimeout(resolve, 4000))
          }
        }

        // Refresh status after enabling
        await refreshStatus()

        // Poll for gateway/browser health — update the status indicators.
        // The LaunchAgent has KeepAlive=true so macOS restarts clawdbot
        // automatically if it crashes.  We detect disconnect within 3s and
        // show "Reconnecting..." while the gateway comes back.
        let wasHealthy = false
        let consecutiveDownPolls = 0
        // Separate counter for gateway_ok && !browser_ok polls so we can gate
        // the troubleshooting banner without conflating gateway-down polls.
        let browserNotReadyCount = 0
        let lastHealthJson = ''
        let lastStatusJson = ''
        // Exponential backoff for the catch branch (HTTP backend itself unreachable).
        // Starts at 1s, doubles each failure up to 15s max.
        let catchBackoffMs = 1000
        const pollGateway = async () => {
          try {
            const h = await apiGet<ServiceHealth>('/api/clawd/service/health', { timeoutMs: 6500 })
            const hJson = JSON.stringify(h)
            if (hJson !== lastHealthJson) {
              lastHealthJson = hJson
              setHealth(h)
            }
            // Also refresh service status periodically
            const s2 = await apiGet<ServiceStatus>('/api/clawd/service/status', { timeoutMs: 6500 })
            const s2Json = JSON.stringify(s2)
            if (s2Json !== lastStatusJson) {
              lastStatusJson = s2Json
              setStatus(s2)
            }

            // Reset catch-backoff whenever the HTTP backend is reachable
            catchBackoffMs = 1000

            const isHealthy = h.gateway_ok && h.browser_ok

            if (isHealthy) {
              // Fully healthy — reset reconnect state and slow-poll to detect drops
              wasHealthy = true
              consecutiveDownPolls = 0
              browserNotReadyCount = 0
              setBrowserNotReadyPolls(0)
              setGatewayDownPolls(0)
              setTimeout(pollGateway, 5000)
            } else if (h.gateway_ok && !h.browser_ok) {
              // Gateway is up but browser is still starting or not reachable.
              // Poll every 3s so we detect browser readiness quickly.
              // (Backend sends a one-time /start nudge automatically.)
              consecutiveDownPolls++
              browserNotReadyCount++
              setBrowserNotReadyPolls(browserNotReadyCount)
              setGatewayDownPolls(0)
              setTimeout(pollGateway, HEALTH_POLL_INTERVAL_MS)
            } else {
              // Gateway is down (reconnecting state).
              // Health-check-driven reconnect: poll every 3s so the UI transitions
              // from "reconnecting" to "connected" within 3s of the gateway recovering,
              // regardless of how long it has been down (no slow-down after N attempts).
              consecutiveDownPolls++
              // Reset browser-not-ready counter when gateway goes down so we don't
              // inherit stale counts into the next startup cycle.
              browserNotReadyCount = 0
              setBrowserNotReadyPolls(0)
              setGatewayDownPolls(consecutiveDownPolls)

              // Nudge the backend to restart the gateway if it stays down.
              if (wasHealthy && consecutiveDownPolls === 3) {
                // Was healthy before — kick a restart after ~9s of downtime,
                // but keep the large user-facing card hidden until the longer
                // sustained-outage threshold below.
                fetch('http://127.0.0.1:8897/api/clawd/service/startup-ready').catch(() => {})
              }
              if (!wasHealthy && consecutiveDownPolls === 6) {
                // Initial startup — nudge after several failed startup polls
                fetch('http://127.0.0.1:8897/api/clawd/service/startup-ready').catch(() => {})
              }
              if (!wasHealthy && consecutiveDownPolls > 6 && consecutiveDownPolls % 6 === 0) {
                // Periodic nudge for extended outages
                fetch('http://127.0.0.1:8897/api/clawd/service/startup-ready').catch(() => {})
              }

              setTimeout(pollGateway, HEALTH_POLL_INTERVAL_MS)
            }
          } catch {
            // HTTP backend itself is unreachable — back off exponentially (1s→15s)
            // so we don't hammer it while it's starting up or restarting.
            consecutiveDownPolls++
            setGatewayDownPolls(consecutiveDownPolls)
            // After 2 consecutive backend-unreachable errors, clear the stale health
            // state so the status bar doesn't show "Gateway: OK" from the last poll.
            if (consecutiveDownPolls >= 2) {
              const downHealth: ServiceHealth = { success: false, gateway_ok: false, browser_ok: false, message: 'Service unreachable' }
              const downJson = JSON.stringify(downHealth)
              if (downJson !== lastHealthJson) {
                lastHealthJson = downJson
                setHealth(downHealth)
              }
            }
            setTimeout(pollGateway, catchBackoffMs)
            catchBackoffMs = Math.min(catchBackoffMs * 2, 15000)
          }
        }
        // Start polling after 500ms — gives the gateway a moment to start
        // before the first check (handles the startup race condition).
        setTimeout(pollGateway, 500)
      } catch (e) {
        console.error('Failed to auto-enable service:', e)
      }

      // Check for API key after a short delay to let status load
      setTimeout(() => {
        checkAndPromptForKey()
      }, 500)

      // Fetch skills status after gateway has time to connect
      setTimeout(() => {
        fetchSkills()
      }, 6000)
    }
    init()
  }, [])

  // Track whether user is near the bottom of the chat
  const handleChatScroll = useCallback(() => {
    const el = chatBodyRef.current
    if (!el) return
    const threshold = 100 // px from bottom
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    isNearBottomRef.current = atBottom
    if (atBottom) setShowScrollButton(false)
  }, [])

  // Attach scroll listener to chat body
  useEffect(() => {
    const el = chatBodyRef.current
    if (!el) return
    el.addEventListener('scroll', handleChatScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleChatScroll)
  }, [handleChatScroll])

  // When the AI finishes responding, surface any pending skill suggestion.
  const prevThinkingRef = useRef<string | null>(null)
  useEffect(() => {
    const wasThinking = prevThinkingRef.current
    prevThinkingRef.current = thinkingMessage
    if (wasThinking && !thinkingMessage && pendingSkillSuggestionRef.current) {
      setSkillSuggestion(pendingSkillSuggestionRef.current)
      skillSuggestionRef.current = pendingSkillSuggestionRef.current
      pendingSkillSuggestionRef.current = null
    }
  }, [thinkingMessage])

  // Keep ref in sync so the stable handleSendWithText callback can read it.
  useEffect(() => {
    skillSuggestionRef.current = skillSuggestion
  }, [skillSuggestion])

  // Auto-scroll to bottom when messages change, but only if user is near the bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      if (isNearBottomRef.current) {
        requestAnimationFrame(() => {
          if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
          }
        })
      } else {
        setShowScrollButton(true)
      }
    }
  }, [msgs, thinkingMessage, queuedMessageTexts])

  const scrollToBottom = useCallback(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' })
    }
    setShowScrollButton(false)
  }, [])

  // Scroll to a specific message and briefly highlight it (for reply navigation)
  const scrollToMsg = useCallback((id: string) => {
    const el = msgRefsMap.current.get(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ClawdMsg--highlighted')
    setTimeout(() => el.classList.remove('ClawdMsg--highlighted'), 1400)
  }, [])

  // Save chat history to localStorage whenever msgs change (excluding welcome messages)
  useEffect(() => {
    // Only save if we have messages beyond the initial welcome
    const nonWelcomeMsgs = msgs.filter(m => !m.id.startsWith('welcome-') && !m.id.startsWith('example-'))
    if (nonWelcomeMsgs.length > 0) {
      localStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(msgs))
    }
  }, [msgs])


  const refreshStatus = async () => {
    try {
      const s = await apiGet<ServiceStatus>('/api/clawd/service/status')
      setStatus(s)
    } catch {
      // ignore
    }

    try {
      const h = await apiGet<ServiceHealth>('/api/clawd/service/health')
      setHealth(h)
    } catch {
      // ignore
    }
  }

  const pushAssistant = useCallback(async (text: string) => {
    setMsgs(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'assistant', text, ts: Date.now() },
    ])
    // Speak the response if voice output is enabled using OpenAI TTS
    if (voiceEnabled) {
      // Stop any currently playing audio first
      stopCurrentAudio()

      // Strip markdown formatting for cleaner speech
      const cleanText = text
        .replace(/[*_~`#]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .slice(0, 4000) // TTS has a 4096 char limit

      // Use OpenAI TTS API for better quality
      const storedKey = await getOpenAIKey()
      if (storedKey && cleanText.length > 0) {
        fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${storedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: cleanText,
            voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
            speed: 1.0,
          }),
        })
          .then(res => {
            if (!res.ok) throw new Error('TTS failed')
            return res.blob()
          })
          .then(blob => {
            const audio = new Audio(URL.createObjectURL(blob))
            // Set output device if supported and selected
            if (selectedOutputDevice && 'setSinkId' in audio) {
              (audio as any).setSinkId(selectedOutputDevice).catch(() => {})
            }
            currentAudioRef.current = audio
            audio.play()
            audio.onended = () => {
              if (currentAudioRef.current === audio) {
                currentAudioRef.current = null
              }
            }
          })
          .catch(err => {
            console.error('TTS error:', err)
          })
      }
    }
  }, [voiceEnabled, stopCurrentAudio, selectedOutputDevice])

  // Keep pushAssistantRef updated for callbacks defined earlier
  pushAssistantRef.current = pushAssistant

  // Listen for notification insight messages from App.tsx notification handlers.
  // Uses pushAssistantRef (not pushAssistant) to avoid re-subscribing on every
  // render, which causes typing latency in the input box.
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (text) pushAssistantRef.current?.(text)
    }
    window.addEventListener('clawd-push-assistant', handler)
    return () => window.removeEventListener('clawd-push-assistant', handler)
  }, [])

  // Listen for suggested action triggers from notification handlers.
  // When the user clicks the primary action button on a notification,
  // the handler pushes the analysis to chat and then dispatches this event
  // to auto-execute the suggested action prompt.
  // handleSendWithText queues automatically if the chat is busy mid-inference.
  const busyRef = useRef(false)
  busyRef.current = busy
  const queueMessageRef = useRef<(text: string) => void>(() => {})
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (text) handleSendWithTextRef.current?.(text)
    }
    window.addEventListener('clawd-send-user', handler)
    return () => window.removeEventListener('clawd-send-user', handler)
  }, [])

  // Listen for requests to open the developer panel from chat intent detection
  useEffect(() => {
    const handler = () => {
      if (developerMode) setShowDevPanel(true)
    }
    window.addEventListener('clawd-open-dev-panel', handler)
    return () => window.removeEventListener('clawd-open-dev-panel', handler)
  }, [developerMode])

  const pushUser = (text: string, replyToId?: string) => {
    setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text, ts: Date.now(), ...(replyToId ? { replyTo: replyToId } : {}) }])
    // Detect a relevant not-yet-installed skill from the user's message.
    // Stored in a ref so the post-response effect can read the latest value.
    const allSkills = skills.length > 0 ? skills : FALLBACK_SKILLS
    pendingSkillSuggestionRef.current = findRelevantSkill(text, allSkills, dismissedSkillNames)
  }

  // Stop current generation
  const stopGeneration = useCallback(() => {
    const hadController = !!abortControllerRef.current
    const hadInterval = !!thinkingIntervalRef.current
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current)
      thinkingIntervalRef.current = null
    }
    if (hadController || hadInterval) {
      setBusy(false)
      setThinkingMessage(null)
      pushAssistant('⏹️ Generation stopped.')
    }
  }, [pushAssistant])

  // Clear chat history and start fresh
  const clearHistory = useCallback(() => {
    localStorage.removeItem(CHAT_HISTORY_STORAGE)
    setMsgs(welcomeMessages)
    autoTriggeredBriefingRef.current = false
  }, [welcomeMessages])

  // Auto-trigger initial briefing for onboarded users with email/calendar connected.
  // Fires once per session when: onboarding is complete, gateway is healthy,
  // and only welcome messages are showing (no prior chat history).
  useEffect(() => {
    if (
      hasCompletedOnboarding &&
      health?.gateway_ok &&
      !autoTriggeredBriefingRef.current &&
      !busy &&
      !advancedMode &&
      !developerMode &&
      autonomyMode === 'assist' &&
      msgs.length > 0 &&
      msgs.every(m => m.id.startsWith('welcome-'))
    ) {
      autoTriggeredBriefingRef.current = true
      // Short delay to let the UI settle after initialization
      const timer = setTimeout(() => {
        // If agents were just onboarded, auto-trigger the team intro instead
        const agentsData = getOnboardingAgentsPrompt()
        if (agentsData) {
          clearOnboardingAgents()
          handleSendWithTextRef.current?.(agentsData.prompt)
          return
        }
        handleSendWithTextRef.current?.(SMART_PROMPT)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding, health?.gateway_ok, busy, advancedMode, developerMode, autonomyMode, msgs])

  const enableAssistant = async (enabled: boolean) => {
    setBusy(true)
    try {
      await apiPost('/api/clawd/service/enable', { enabled })
      await refreshStatus()
      pushAssistant(enabled ? 'Browser assistant enabled.' : 'Browser assistant disabled.')
    } catch (e: any) {
      pushAssistant(`Couldn't update browser assistant: ${e?.message || String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const getTabs = async (): Promise<Tab[]> => {
    const res = await apiGet<TabsResponse>('/api/clawd/browser/tabs')
    if (!res.success) throw new Error(res.message || 'tabs failed')
    return res.tabs || []
  }

  // Send with specific text (for prompt action clicks, example clicks, voice auto-send)
  // If the chat is busy (mid-inference), queue the message to send after completion.
  const handleSendWithText = useCallback(async (text: string, srcMsgId?: string) => {
    if (!text.trim()) return

    // If a skill nudge is showing and the user types a short affirmative, install it.
    const AFFIRMATIVES = new Set(['yes', 'yep', 'yeah', 'sure', 'ok', 'okay', 'do it', 'install it', 'install', 'go ahead', 'sounds good', 'yes please'])
    if (skillSuggestionRef.current && AFFIRMATIVES.has(text.trim().toLowerCase())) {
      const skill = skillSuggestionRef.current
      setSkillSuggestion(null)
      pendingSkillSuggestionRef.current = null
      if (skill.source === 'OpenClaw') {
        pushUser(text)
        await handleSkillInstallRef.current(skill.name, skill.installOptions?.[0]?.id ?? 'default')
      } else if (skill.homepage) {
        // External skills (Anthropic, MCP Market) can't be auto-installed — open the page
        pushUser(text)
        pushAssistantRef.current?.(`I can't install **${skill.name}** automatically — it's hosted externally. [Click here to get it](${skill.homepage})`)
      }
      return
    }

    // Handle "open provider settings" action — opens the AI provider sidebar directly
    if (text === '__open_provider_settings__') {
      setShowKeyPrompt(true)
      setShowChannelsPanel(false)
      setShowSkillsPanel(false)
      return
    }

    // Handle special "enable advanced and resend" action
    const advPrefix = '__enable_advanced_and_resend__'
    if (text.startsWith(advPrefix)) {
      const originalPrompt = decodeURIComponent(text.slice(advPrefix.length))
      // Enable advanced mode directly (skip warning dialog since user clicked the suggestion)
      setAdvancedMode(true)
      localStorage.setItem(ADVANCED_MODE_STORAGE, 'true')
      // Replace the action button with an inline confirmation in the source message
      if (srcMsgId) {
        setMsgs(prev => prev.map(m =>
          m.id === srcMsgId
            ? { ...m, confirmedActionPrompts: [...(m.confirmedActionPrompts ?? []), text] }
            : m
        ))
      }
      // Use doSendRef so the re-send picks up the new advancedMode=true state after re-render
      setTimeout(() => doSendRef.current?.(originalPrompt), 100)
      return
    }

    // Queue the message if chat is busy instead of interrupting current inference
    if (busyRef.current) {
      queueMessageRef.current(text.trim())
      return
    }

    await doSend(text.trim())
  }, [])

  // Keep handleSendWithTextRef updated for the clawd-send-user event listener
  handleSendWithTextRef.current = handleSendWithText

  const handleExampleClick = useCallback((e: React.MouseEvent, text: string) => {
    // Prevent any default link behavior (URLs in text might be auto-linked)
    e.preventDefault()
    e.stopPropagation()
    // Extract the prompt - handle both quoted and marked-up formats
    let prompt = text
    // Remove markdown bold markers and quotes
    prompt = prompt.replace(/\*\*/g, '').replace(/^.*?[""]/, '').replace(/[""].*$/, '')
    // Also try simple quote removal
    prompt = prompt.replace(/^"|"$/g, '').trim()
    // If it still has "Click to get started:" prefix, extract just the prompt
    if (prompt.includes(':')) {
      const parts = prompt.split(':')
      if (parts.length > 1) {
        prompt = parts.slice(1).join(':').trim().replace(/^[""]|[""]$/g, '').trim()
      }
    }
    // Final fallback - use the smart prompt constant
    if (!prompt || prompt.length < 5) {
      prompt = SMART_PROMPT
    }
    // Auto-execute immediately without requiring send
    handleSendWithText(prompt)
  }, [handleSendWithText])

  // Custom link component for external URLs only (prompt actions are rendered separately)
  const ChatLink: Components['a'] = useCallback(({ href, children }: any) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (href && href.startsWith('http')) {
        openBesideApp(href).catch(err => console.error('Failed to open link:', err))
      }
    }
    return (
      <a href={href} onClick={handleClick} style={{ cursor: 'pointer' }}>
        {children}
      </a>
    )
  }, []) as Components['a']

  // Custom code block renderer with Copy + Run in Terminal buttons
  const ChatCodeBlock: Components['pre'] = useCallback(({ children }: any) => {
    const codeText = (() => {
      // ReactMarkdown wraps code in <pre><code>...
      // children is the <code> element; extract its text content
      try {
        const codeChild = children?.props?.children
        if (typeof codeChild === 'string') return codeChild
        if (Array.isArray(codeChild)) return codeChild.join('')
      } catch { /* fallback */ }
      return ''
    })()

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(codeText)
    }

    const handleRunInTerminal = (e: React.MouseEvent) => {
      e.stopPropagation()
      const panelWasClosed = !externalActivityPanelRef.current
      // Auto-open Activity Panel if not already open
      if (panelWasClosed && onToggleActivityRef.current) {
        onToggleActivityRef.current()
      }
      // Strip comment lines before sending — shells may not treat # as
      // a comment in all modes, and markdown headings (## Step N) cause
      // "command not found: #" errors.
      const command = codeText.trim()
        .split('\n')
        .filter(line => !line.trimStart().startsWith('#'))
        .join('\n')
        .trim()
      const dispatchRun = () => window.dispatchEvent(new CustomEvent('run-in-terminal', { detail: { command } }))
      // If the panel just opened, its useEffect listener hasn't mounted yet.
      // Delay dispatch one frame so the panel can register before the event fires.
      if (panelWasClosed) {
        setTimeout(dispatchRun, 150)
      } else {
        dispatchRun()
      }

      // Auto-follow-up: after a delay, send a message so the AI reads
      // terminal output and continues without the user having to ask.
      if (runInTerminalTimerRef.current) {
        clearTimeout(runInTerminalTimerRef.current)
      }
      runInTerminalTimerRef.current = setTimeout(() => {
        runInTerminalTimerRef.current = null
        // Don't auto-send if the AI is already generating a response
        if (thinkingMessageRef.current) return
        window.dispatchEvent(
          new CustomEvent('clawd-send-user', {
            detail: `I ran \`${command}\` in the terminal. Check the terminal output and continue with the next step.`,
          }),
        )
      }, 3000)
    }

    return (
      <div className="ClawdCodeBlockWrapper">
        <div className="ClawdCodeBlockActions">
          <button className="ClawdCodeBlockBtn" onClick={handleCopy} title="Copy to clipboard">
            Copy
          </button>
          <button className="ClawdCodeBlockBtn ClawdCodeBlockBtn--run" onClick={handleRunInTerminal} title="Run in terminal">
            Run in Terminal
          </button>
        </div>
        <pre>{children}</pre>
      </div>
    )
  }, []) as Components['pre']

  // Stable references for ReactMarkdown props — avoids re-parsing all messages
  // on parent re-renders (e.g. during health polling).
  const mdPlugins = useMemo(() => [remarkGfm], [])
  const mdComponents = useMemo(() => ({ a: ChatLink, pre: ChatCodeBlock }), [ChatLink, ChatCodeBlock])

  // Toggle voice mode - stop audio when disabling
  const toggleVoiceOutput = useCallback(() => {
    const newValue = !voiceEnabled
    if (voiceEnabled) {
      // Turning off - stop any playing audio
      stopCurrentAudio()
    }
    setVoiceEnabled(newValue)
    localStorage.setItem(VOICE_MODE_STORAGE, String(newValue))
  }, [voiceEnabled, stopCurrentAudio])

  const doSend = async (text: string) => {

    // Cancel any pending "Run in Terminal" auto-follow-up since the user
    // (or another trigger) is already sending a message.
    if (runInTerminalTimerRef.current) {
      clearTimeout(runInTerminalTimerRef.current)
      runInTerminalTimerRef.current = null
    }

    // Handle developer mode activation via prompt action
    if (text.trim() === '__ENABLE_DEV_MODE__') {
      toggleDeveloperMode()
      return
    }

    // Intercept slash commands before any LLM processing
    const slashEvent = SLASH_COMMANDS[text.trim().toLowerCase()]
    if (slashEvent) {
      console.log(`🔔 Triggering command: ${text}`)
      await emit(slashEvent, {})
      return
    }

    // Check if we need to prompt for API key first
    if (!hasCompletedOnboarding) {
      const hasKey = await checkAndPromptForKey()
      if (!hasKey) {
        pushUser(text || '(files attached)')
        pushAssistant('Please set up an AI provider first. Add an API key or enable Ollama in Settings to get started.')
        return
      }
    }

    // Capture and clear reply context before any async work
    const currentReplyTo = replyToMsg
    setReplyToMsg(null)

    // Capture current attachments and clear them
    const currentAttachments = [...attachedFiles]
    setAttachedFiles([])

    // Show user message with attachment indicators
    const attachmentSummary = currentAttachments.length > 0
      ? `\n\n📎 *Attached: ${currentAttachments.map(f => f.name).join(', ')}*`
      : ''
    pushUser(text + attachmentSummary, currentReplyTo?.id)

    // --- Developer mode intent detection ---
    if (!developerMode && detectBuildIntent(text)) {
      // User is talking about building but dev mode is off — suggest it
      setTimeout(() => {
        pushAssistantRef.current?.(
          "It sounds like you're building something! **Developer mode** can help you move faster with:\n\n" +
          '- **Business context gathering** from meetings, emails, and docs\n' +
          '- **Agent team** (PM, Frontend Dev, Backend Dev, QA) working in parallel\n' +
          '- **Automated QA** with smoke tests, accessibility, and visual regression\n\n' +
          '[Enable Developer Mode](knapsack://prompt/__ENABLE_DEV_MODE__)'
        )
      }, 500)
    } else if (developerMode && detectBuildIntent(text)) {
      // Dev mode is on — populate the panel with this description
      dispatchDevPopulate(extractProjectDescription(text))
      dispatchOpenDevPanel()
    }

    // Parse "command args..." form
    const [rawCmd, ...rest] = text.split(/\s+/)
    const cmd = rawCmd.toLowerCase()

    setBusy(true)

    // Snapshot the active model label from React state at request time so error
    // messages reflect the model that was actually selected when sent, not the
    // model in localStorage (which can lag behind UI state changes).
    const activeModelAtSend = (() => {
      if (selectedProvider === 'knapsack') return `knapsack/${selectedKnapsackModel}`
      const m = selectedProvider === 'ollama'
        ? selectedOllamaModel
        : selectedProvider === 'anthropic'
        ? selectedAnthropicModel
        : selectedProvider === 'gemini'
        ? selectedGeminiModel
        : selectedProvider === 'groq'
        ? selectedGroqModel
        : selectedProvider === 'xai'
        ? selectedXaiModel
        : selectedProvider === 'openrouter'
        ? selectedOpenRouterModel
        : selectedModel
      return m ? `${selectedProvider}/${m}` : selectedProvider
    })()
    const selectedModelForProvider = activeModelAtSend.includes('/')
      ? activeModelAtSend.split('/').slice(1).join('/')
      : ''

    try {
      if (cmd === 'enable') {
        await enableAssistant(true)
        return
      }
      if (cmd === 'disable') {
        await enableAssistant(false)
        return
      }
      if (cmd === 'status') {
        await refreshStatus()
        pushAssistant('Refreshed status.')
        return
      }
      if (cmd === '/logs' || cmd === '/log') {
        const stream = (rest[0] || 'stderr').toLowerCase()
        const logs = await apiGet<{ success: boolean; text: string }>(
          `/api/clawd/service/logs?stream=${encodeURIComponent(stream)}&lines=250`,
        )
        const text = logs.text || '(no logs)'
        const maxChars = 20000
        const display =
          text.length > maxChars
            ? `...(${text.length - maxChars} chars omitted from start)\n\n` + text.slice(-maxChars)
            : text
        pushAssistant(display)
        return
      }

      // If the prompt is clearly "open <url>" or just a bare URL, open it in the
      // system browser immediately so the user doesn't have to wait for the LLM
      // round-trip (which may fail if the gateway can't control Chrome).
      // The message still goes to the LLM so the agent can summarize the page, etc.
      {
        // Only match when the word after "open/go to/..." contains a dot (looks like a domain)
        const openMatch = text.match(/^(?:open|go to|navigate to|visit)\s+(https?:\/\/\S+|\S+\.\S+)/i)
        const bareUrl = text.match(/^(https?:\/\/\S+)$/i) || text.match(/^([a-z0-9][-a-z0-9]*\.[a-z]{2,}(?:\/\S*)?)$/i)
        const urlToOpen = openMatch?.[1] || bareUrl?.[1]
        if (urlToOpen) {
          const fullUrl = urlToOpen.startsWith('http') ? urlToOpen : `https://${urlToOpen}`
          openBesideApp(fullUrl).catch(err => console.error('[chat] Failed to open URL:', err))
        }
      }

      if (cmd === 'tabs') {
        const tabs = await getTabs()
        if (!tabs.length) {
          pushAssistant('No tabs (or browser not running). Try: open https://example.com')
          return
        }
        const lines = tabs.map((t, i) => {
          const title = t.title ? ` - ${t.title}` : ''
          const url = t.url ? ` (${t.url})` : ''
          const mark = currentTargetId && t.targetId === currentTargetId ? ' *' : ''
          return `${i}: ${t.targetId}${mark}${title}${url}`
        })
        pushAssistant(lines.join('\n'))
        return
      }

      if (cmd === 'focus') {
        const idx = Number(rest[0])
        if (!Number.isFinite(idx)) {
          pushAssistant('Usage: focus <n>  (run `tabs` to see indices)')
          return
        }
        const tabs = await getTabs()
        const t = tabs[idx]
        if (!t) {
          pushAssistant(`No tab at index ${idx}. Run: tabs`)
          return
        }
        const resText = await apiPostText('/api/clawd/browser/focus', { targetId: t.targetId })
        setCurrentTargetId(t.targetId)
        pushAssistant(formatMaybeJson(resText))
        return
      }

      if (cmd === 'snapshot') {
        const targetId = currentTargetId || undefined
        const qs = new URLSearchParams()
        if (targetId) qs.set('targetId', targetId)
        qs.set('format', 'ai')
        qs.set('refs', 'aria')
        const snap = await apiGetText(`/api/clawd/browser/snapshot?${qs.toString()}`)
        pushAssistant(formatMaybeJson(snap, 12000))
        return
      }

      if (cmd === 'screenshot') {
        const targetId = currentTargetId || undefined
        const body: any = { type: 'png' }
        if (targetId) body.targetId = targetId
        const out = await apiPostText('/api/clawd/browser/screenshot', body)
        pushAssistant(formatMaybeJson(out))
        return
      }

      if (cmd === 'click') {
        // click <ref>
        const ref = rest[0]
        if (!ref) {
          pushAssistant('Usage: click <ref>  (get refs from `snapshot`)')
          return
        }
        const out = await apiPostText('/api/clawd/browser/act', {
          kind: 'click',
          targetId: currentTargetId || undefined,
          ref,
        })
        pushAssistant(formatMaybeJson(out))
        return
      }

      if (cmd === 'type') {
        // type <ref> <text...>
        const ref = rest[0]
        const t = rest.slice(1).join(' ')
        if (!ref || !t) {
          pushAssistant('Usage: type <ref> <text>')
          return
        }
        const out = await apiPostText('/api/clawd/browser/act', {
          kind: 'type',
          targetId: currentTargetId || undefined,
          ref,
          text: t,
        })
        pushAssistant(formatMaybeJson(out))
        return
      }

      // If it's not a known command, treat it as natural language and let the agent handle it.

      // Suggest advanced mode if the prompt looks like it needs shell/system access
      if (!advancedMode) {
        const lower = text.toLowerCase()
        const advancedPatterns = [
          // Install / package management
          /\b(install|uninstall|upgrade|update)\b.*\b(brew|npm|pip|apt|cargo|gem|yarn|pnpm|conda|poetry)\b/,
          /\b(brew|npm|pip|apt|cargo|gem|yarn|pnpm|conda|poetry)\b.*\b(install|uninstall|upgrade|update)\b/,
          // Run/execute commands
          /\b(run|execute|launch|start)\b.*\b(command|script|terminal|shell|bash|server|process)\b/,
          /\b(command|script|terminal|shell|bash)\b.*\b(run|execute|launch|start)\b/,
          // File system operations
          /\b(create|make|build|compile|deploy|publish)\b.*\b(project|app|site|page|repo|directory|folder|file)\b/,
          /\b(git|docker|ssh|curl|wget|node|python|ruby|java|go|rust)\b/,
          // System tasks
          /\b(check|show|what)\b.*\b(version|installed|running|process|port)\b/,
          /\b(set up|setup|configure|init|initialize)\b.*\b(project|environment|dev|server|database)\b/,
          /\b(kill|stop|restart)\b.*\b(process|server|service|port)\b/,
          /\b(download|fetch|clone|pull|push|commit)\b/,
          /\b(chmod|chown|mkdir|rmdir|mv|cp)\b/,
          /\bpublish\b.*\b(web|page|site|github)\b/,
        ]
        if (advancedPatterns.some(p => p.test(lower))) {
          pushAssistant('💡 **Tip:** This looks like it might need shell access. [Enable Advanced Mode](knapsack://prompt/__enable_advanced_and_resend__' + encodeURIComponent(text) + ') to let me run commands for tasks like this.')
        }
      }

      // Show context-relevant thinking messages while processing
      const baseThinkingMessages = [
        // General exploration
        '🔍 Scanning the digital landscape...',
        '🧠 Neurons firing in mysterious ways...',
        '🌐 Diving into the web...',
        '📖 Reading the digital tea leaves...',
        '🎯 Locking onto target...',
        '⚡ Channeling browser powers...',
        '🔮 Consulting the DOM spirits...',
        '🕵️ Investigating the situation...',
        '🧩 Piecing together the puzzle...',
        '🚀 Almost there, hang tight...',
        '✨ Sprinkling some AI magic...',
        '🤔 Pondering the possibilities...',
        '🎭 Getting into character...',
        '🌟 Focusing the lens...',
        '🔬 Analyzing the elements...',
        '🎨 Painting the picture...',
        '🧪 Running the experiments...',
        '📡 Tuning the frequency...',
        '🎲 Rolling the dice...',
        '🔗 Connecting the dots...',
        '🌊 Riding the data waves...',
        '🎵 Finding the rhythm...',
        '🔧 Tightening the bolts...',
        '🎪 Juggling the tasks...',
        '🏃 Making good progress...',
        '💫 Working some magic...',
        '🔥 Heating things up...',
        '🌈 Chasing the rainbow...',
        '🎯 Zeroing in...',
        '🧭 Following the compass...',
      ]

      // Context-specific messages based on query
      const lowerText = text.toLowerCase()
      const contextMessages: string[] = []

      if (lowerText.includes('email') || lowerText.includes('gmail') || lowerText.includes('inbox')) {
        contextMessages.push(
          '📧 Scanning your inbox...',
          '✉️ Sorting through messages...',
          '📬 Checking the mailbox...',
          '📨 Processing emails...',
          '📥 Fetching your mail...',
          '💌 Reading between the lines...',
        )
      }
      if (lowerText.includes('linkedin')) {
        contextMessages.push(
          '💼 Networking on LinkedIn...',
          '🤝 Checking professional updates...',
          '📊 Analyzing your connections...',
          '👔 Browsing the business world...',
        )
      }
      if (lowerText.includes('calendar') || lowerText.includes('schedule') || lowerText.includes('meeting')) {
        contextMessages.push(
          '📅 Checking your calendar...',
          '⏰ Looking at your schedule...',
          '🗓️ Finding available slots...',
          '📆 Organizing your time...',
        )
      }
      if (lowerText.includes('task') || lowerText.includes('todo') || lowerText.includes('remind')) {
        contextMessages.push(
          '✅ Reviewing your tasks...',
          '📝 Checking your to-do list...',
          '📋 Organizing priorities...',
          '🎯 Focusing on what matters...',
        )
      }
      if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look')) {
        contextMessages.push(
          '🔍 Searching far and wide...',
          '🔎 Magnifying the details...',
          '🗺️ Mapping out the search...',
          '🧭 Following the trail...',
        )
      }
      if (lowerText.includes('write') || lowerText.includes('draft') || lowerText.includes('compose')) {
        contextMessages.push(
          '✍️ Crafting the words...',
          '📝 Drafting your message...',
          '🖊️ Composing thoughtfully...',
          '📄 Writing it up...',
        )
      }
      if (lowerText.includes('summarize') || lowerText.includes('summary') || lowerText.includes('recap')) {
        contextMessages.push(
          '📊 Distilling the essence...',
          '📋 Condensing the information...',
          '🎯 Extracting key points...',
          '📑 Summarizing findings...',
        )
      }
      if (lowerText.includes('click') || lowerText.includes('button') || lowerText.includes('form')) {
        contextMessages.push(
          '👆 Clicking carefully...',
          '🖱️ Navigating the interface...',
          '📝 Filling in the form...',
          '🎛️ Adjusting the controls...',
        )
      }
      if (lowerText.includes('prose') || lowerText.includes('workflow') || lowerText.includes('automate')) {
        contextMessages.push(
          '🪶 Orchestrating the workflow...',
          '⚙️ Setting up automation...',
          '🔄 Configuring the process...',
          '🎭 Directing the agents...',
        )
      }
      if (lowerText.includes('image') || lowerText.includes('photo') || lowerText.includes('picture')) {
        contextMessages.push(
          '🖼️ Examining the image...',
          '📸 Processing the photo...',
          '🎨 Analyzing the visuals...',
          '👁️ Looking closely...',
        )
      }
      if (lowerText.includes('pdf') || lowerText.includes('document') || lowerText.includes('file')) {
        contextMessages.push(
          '📄 Reading the document...',
          '📑 Parsing the contents...',
          '📂 Extracting information...',
          '🔖 Bookmarking key sections...',
        )
      }

      // Combine base messages with context-specific ones (prioritize context)
      const thinkingMessages = contextMessages.length > 0
        ? [...contextMessages, ...baseThinkingMessages.slice(0, 10)]
        : baseThinkingMessages

      // Shuffle and pick random messages for variety
      const shuffled = [...thinkingMessages].sort(() => Math.random() - 0.5)
      let thinkingIndex = 0
      setThinkingMessage(shuffled[0])

      // Clear any previously leaked interval before starting a new one
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
      thinkingIntervalRef.current = setInterval(() => {
        thinkingIndex = (thinkingIndex + 1) % shuffled.length
        setThinkingMessage(shuffled[thinkingIndex])
      }, 2500)

      // Create abort controller for this request
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        // Get the current tone's system prompt addition
        const currentTone = TONE_OPTIONS.find(t => t.id === selectedTone)
        const tonePrompt = currentTone?.systemPromptAddition || ''

        // For the smart prompt, pre-fetch email/calendar data from Knapsack's APIs
        // so the agent can analyze it directly without browser emulation.
        const isSmartPrompt = text === SMART_PROMPT
        const isBuildWebsitePrompt = text === BUILD_WEBSITE_PROMPT
        let actualText = text

        // For the build website prompt, inject user info so the AI can auto-populate
        // the website without asking the user a bunch of questions.
        if (isBuildWebsitePrompt) {
          actualText = buildWebsiteInstructions(userName || '', userEmail || '')
        }

        if (isSmartPrompt) {
          try {
            const context = await fetchEmailCalendarContext()
            if (context) {
              actualText = INITIAL_BRIEFING_INSTRUCTIONS + context
            } else {
              // No data available — fall back to letting the agent browse
              actualText = `${text}\n\nAfter checking my email and calendar, recommend 5 specific things I should do based on what you find.`
            }
          } catch {
            // If pre-fetch fails, fall back to original behavior
            actualText = `${text}\n\nAfter checking my email and calendar, recommend 5 specific things I should do based on what you find.`
          }
        }

        if (contextPrefix?.trim()) {
          actualText = `${contextPrefix.trim()}

---
User message:
${actualText}`
        }

        // Auto-include recent terminal output as context so the AI can see
        // what the user is working on without requiring copy-paste
        if (!isSmartPrompt) {
          try {
            const termRes = await fetch(apiUrl('/api/clawd/terminal/output?max_lines=30'))
            if (termRes.ok) {
              const termData = await termRes.json() as { ok?: boolean; sessions?: Record<string, string[]> }
              if (termData.ok && termData.sessions) {
                const entries = Object.entries(termData.sessions).filter(([, lines]) => lines.length > 0)
                if (entries.length > 0) {
                  let termContext = '\n\n---\n[Terminal context — recent output from built-in terminal]\n'
                  for (const [sid, lines] of entries) {
                    termContext += `[Session: ${sid}]\n${lines.join('\n')}\n`
                  }
                  termContext += '---'
                  actualText += termContext
                }
              }
            }
          } catch {
            // Terminal context is best-effort, don't fail the request
          }
        }

        // Prepend quoted reply context so the AI knows which message is being replied to
        if (currentReplyTo) {
          const quotedText = currentReplyTo.text.slice(0, 500).replace(/\n/g, '\n> ')
          actualText = `> ${quotedText}\n\n${actualText}`
        }

        // Build request with optional attachments
        const requestBody: Record<string, any> = {
          provider: selectedProvider,
          model: selectedModelForProvider,
          text: actualText || 'Please analyze the attached files.',
          sessionId: 'ui',
          tone: selectedTone,
          tonePrompt,
          voiceMode: voiceEnabled, // Signal backend to be more concise for voice output
          autonomyMode, // 'assist' or 'autonomous' - controls how independent the agent is
          advancedMode, // When true, enables run_command tool for shell execution
          developerMode, // When true, enables Sentry scanning, error log analysis, and auto-PR creation
          userEmail: userEmail || '', // For direct email sending via send_email tool
          userName: userName || '', // Sender display name for emails
          memoryNotes: getAgentMemory('knapsack-chat'), // Persistent cross-session context
        }

        // Add attachments if present
        if (currentAttachments.length > 0) {
          requestBody.attachments = currentAttachments.map(f => ({
            name: f.name,
            type: f.type,
            content: f.content,
          }))
        }

        // Try gateway agent-chat first (shared session with Telegram/WhatsApp/iMessage),
        // fall back to direct chat if gateway is unavailable.
        // Keep the frontend timeout longer than the backend request budget.
        // If the shared gateway session is slow or poisoned, the backend falls
        // back to direct chat so desktop users still get a timely answer.
        let useDirectChat = false

        if (!useDirectChat) {
        const agentTimeout = AbortController.prototype ? new AbortController() : null
        const agentTimerId = agentTimeout ? setTimeout(() => {
          console.warn('[chat] agent-chat timed out after 300s, falling back to direct chat')
          agentTimeout.abort()
        }, 300_000) : null
        // Combine user abort + timeout abort. Fallback to user signal so stop
        // always works in environments where AbortSignal.any is unavailable.
        const agentSignal = agentTimeout
          ? (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal
              ? (AbortSignal as any).any([controller.signal, agentTimeout.signal])
              : controller.signal)
          : controller.signal
        try {
          const agentRes = await fetch(apiUrl('/api/clawd/agent-chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: selectedProvider,
              model: selectedModelForProvider,
              text: requestBody.text,
              advancedMode,
              userEmail: userEmail || '',
              userName: userName || '',
              ...(currentAttachments.length > 0 && {
                attachments: currentAttachments.map(f => ({
                  name: f.name,
                  type: f.type,
                  content: f.content,
                }))
              }),
            }),
            signal: agentSignal,
          })
          if (agentTimerId) clearTimeout(agentTimerId)
          if (agentRes.ok) {
            const agentOut = await agentRes.json() as { ok?: boolean; reply?: string; message?: string; fallback?: boolean; gateway?: boolean; model?: string; noFallback?: boolean }
            console.log('[chat] agent-chat response:', { ok: agentOut.ok, hasReply: !!agentOut.reply, gateway: agentOut.gateway, fallback: agentOut.fallback, message: agentOut.message })
            if (agentOut.ok && agentOut.reply) {
              // Accept replies from both gateway and direct-chat fallback.
              // The backend already called open_first_url_in_reply, so the
              // browser should have opened if the reply contained a URL.
              // Defense-in-depth: if the gateway reply looks like a raw HTTP error
              // (e.g. "401 Missing Authentication header"), fall back to direct chat
              // so friendlyError can surface a helpful message instead.
              // No length cap — verbose gateway errors (>250 chars) must also be caught.
              const rawReply = agentOut.reply.trim()
              const httpErrorMatch = /^([345]\d{2}) /.test(rawReply)
              if (agentOut.gateway && httpErrorMatch) {
                console.warn('[chat] Gateway returned HTTP error reply, falling back to direct chat:', rawReply.slice(0, 100))
                useDirectChat = true
              } else {
                console.log('[chat] Using agent-chat response:', { gateway: agentOut.gateway })
                let displayText = agentOut.reply!
                // When the gateway surfaces an error (rate limit, auth, key), enrich the message
                if (agentOut.gateway) {
                  const lowerReply = displayText.toLowerCase()
                  if (lowerReply.includes('rate limit') || lowerReply.includes('rate_limit') ||
                      lowerReply.includes('spending cap') || lowerReply.includes('no api key found') ||
                      lowerReply.includes('configure auth for this agent')) {
                    displayText = friendlyError(displayText, getActiveModelLabel())
                  }
                }
                setMsgs(prev => [
                  ...prev,
                  { id: crypto.randomUUID(), role: 'assistant', text: displayText, ts: Date.now(), model: agentOut.gateway ? 'gateway' : agentOut.model ?? 'direct' },
                ])
              }
            } else {
              if (agentOut.noFallback) {
                throw new Error(agentOut.message || 'The gateway agent did not finish in time. Please try again in a moment.')
              }
              // No reply at all — fall back to direct chat from the frontend
              console.warn('[chat] agent-chat returned no reply, using direct chat. Response:', JSON.stringify(agentOut))
              useDirectChat = true
            }
          } else {
            console.warn('[chat] agent-chat HTTP error:', agentRes.status)
            useDirectChat = true
          }
        } catch (agentErr: any) {
          if (agentTimerId) clearTimeout(agentTimerId)
          // Only re-throw if this was the USER's abort (not our timeout)
          if (agentErr.name === 'AbortError' && controller.signal.aborted) throw agentErr
          // If this was our timeout abort, the gateway already has the user
          // message committed to its session.  Falling back to direct chat
          // would send the same message through a separate path, leaving an
          // orphaned user turn in the gateway session.  Show an error instead.
          if (agentErr.name === 'AbortError' && agentTimeout?.signal.aborted) {
            console.warn('[chat] agent-chat timed out — not falling back to direct chat to avoid orphaned gateway message')
            throw new Error('The request timed out. The agent may still be processing — please try again in a moment.')
          }
          // Non-timeout error (network failure, gateway down) — safe to fall
          // back because the gateway never received the message.
          console.warn('[chat] Gateway agent-chat unavailable, using direct chat:', agentErr.message)
          useDirectChat = true
        }
        } // end if (!useDirectChat)

        // Fallback: direct LLM chat (no shared session with channels)
        const maxRetries = 3
        let lastError = ''
        let succeeded = !useDirectChat // Already succeeded if gateway worked

        if (useDirectChat) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const res = await fetch(apiUrl('/api/clawd/chat'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            })

            if (!res.ok) {
              const errorText = await res.text().catch(() => '')
              const retryable = [429, 500, 502, 503, 504].includes(res.status)
              if (retryable && attempt < maxRetries - 1) {
                const wait = Math.pow(2, attempt + 1) * 1000
                console.warn(`[chat] HTTP ${res.status} (attempt ${attempt + 1}/${maxRetries}), retrying in ${wait}ms...`)
                lastError = errorText || `HTTP ${res.status}`
                await new Promise(r => setTimeout(r, wait))
                continue
              }
              throw new Error(errorText || `HTTP ${res.status}`)
            }

            const out = await res.json() as { ok?: boolean; reply?: string; error?: string; message?: string; model?: string; usage?: { inputTokens?: number; outputTokens?: number; costUsd?: number } }
            if (out.reply) {
              setMsgs(prev => [
                ...prev,
                { id: crypto.randomUUID(), role: 'assistant', text: out.reply!, ts: Date.now(), model: out.model },
              ])
              // Persist a summary so future sessions have cross-session context.
              saveAgentMemory('knapsack-chat', out.reply)
            } else {
              pushAssistant(friendlyError(out.message || out.error || 'No reply', activeModelAtSend))
            }
            succeeded = true
            break
          } catch (fetchErr: any) {
            if (fetchErr.name === 'AbortError') throw fetchErr
            // Retry on network errors (fetch failed, connection reset, etc.)
            const isNetworkError = fetchErr.message?.includes('fetch') || fetchErr.message?.includes('network') || fetchErr.message?.includes('ECONNR')
            if (isNetworkError && attempt < maxRetries - 1) {
              const wait = Math.pow(2, attempt + 1) * 1000
              console.warn(`[chat] Network error (attempt ${attempt + 1}/${maxRetries}), retrying in ${wait}ms...`)
              lastError = fetchErr.message
              await new Promise(r => setTimeout(r, wait))
              continue
            }
            throw fetchErr
          }
        }
        if (!succeeded && lastError) {
          throw new Error(lastError)
        }
        } // end if (useDirectChat)
      } catch (e: any) {
        if (e.name === 'AbortError') {
          // User cancelled - already handled in stopGeneration
          return
        }
        throw e
      } finally {
        if (thinkingIntervalRef.current) {
          clearInterval(thinkingIntervalRef.current)
          thinkingIntervalRef.current = null
        }
        setThinkingMessage(null)
        abortControllerRef.current = null
      }
    } catch (e: any) {
      pushAssistant(friendlyError(e?.message || String(e), activeModelAtSend))
    } finally {
      // Safety net: always clear thinking state when request ends, even if inner
      // finally was skipped due to an error thrown between setting thinkingMessage
      // and entering the inner try block.
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
      }
      setThinkingMessage(null)
      setBusy(false)
    }
  }

  // Keep doSendRef updated so the stable callback always invokes the latest doSend.
  // This avoids re-creating the callback identity on every render, which would
  // defeat React.memo on ChatInputBar and cause input lag during polling re-renders.
  doSendRef.current = doSend

  // Stable-identity wrapper — passed to ChatInputBar instead of doSend directly.
  const stableDoSend = useCallback((text: string) => {
    return doSendRef.current?.(text) ?? Promise.resolve()
  }, [])

  // Same ref-based stability pattern for other ChatInputBar callbacks whose
  // dependencies change during normal operation (voice toggle, abort controller).
  const stopGenerationRef = useRef(stopGeneration)
  stopGenerationRef.current = stopGeneration
  const stableStopGeneration = useCallback(() => { stopGenerationRef.current() }, [])

  // Queue a message to send after the current request completes
  const stableQueueMessage = useCallback((text: string) => {
    queuedMessagesRef.current = [...queuedMessagesRef.current, text]
    setHasQueuedMessage(true)
    setQueuedMessageTexts(prev => [...prev, text])
  }, [])
  // Keep queueMessageRef updated so handleSendWithText can queue mid-inference
  queueMessageRef.current = stableQueueMessage

  // Drain queued messages one at a time when busy transitions from true → false
  const prevBusyRef = useRef(false)
  useEffect(() => {
    if (prevBusyRef.current && !busy && queuedMessagesRef.current.length > 0) {
      const [next, ...rest] = queuedMessagesRef.current
      queuedMessagesRef.current = rest
      setQueuedMessageTexts(rest)
      setHasQueuedMessage(rest.length > 0)
      // Short delay to let UI settle before sending next message
      const timer = setTimeout(() => doSendRef.current?.(next), 150)
      return () => clearTimeout(timer)
    }
    prevBusyRef.current = busy
  }, [busy])

  // Keyboard shortcuts
  const clearHistoryRef = useRef(clearHistory)
  clearHistoryRef.current = clearHistory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopGenerationRef.current()
      const mod = e.metaKey || e.ctrlKey
      // Cmd/Ctrl+Shift+Backspace — clear chat history
      if (mod && e.shiftKey && e.key === 'Backspace') {
        e.preventDefault()
        clearHistoryRef.current()
      }
      // Cmd/Ctrl+L — focus chat input
      if (mod && !e.shiftKey && e.key === 'l') {
        e.preventDefault()
        document.querySelector<HTMLTextAreaElement>('.ClawdChatInput textarea')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Number-key shortcuts for gateway/browser troubleshooting banners
  useEffect(() => {
    const handleBannerKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      // Don't intercept when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const gatewayDown = health && !health.gateway_ok && !channelStatus.gatewayStarting
      const browserDown = health && health.gateway_ok && !health.browser_ok && !channelStatus.gatewayStarting

      let prompt: string | undefined
      if (gatewayDown) {
        if (e.key === '1') prompt = GATEWAY_DIAGNOSE_PROMPT
        else if (e.key === '2') prompt = GATEWAY_RESTART_PROMPT
        else if (e.key === '3') prompt = GATEWAY_VIEW_LOGS_PROMPT
      } else if (browserDown) {
        if (e.key === '1') prompt = GATEWAY_DIAGNOSE_PROMPT
        else if (e.key === '2') prompt = GATEWAY_VIEW_LOGS_PROMPT
      }

      if (prompt) {
        e.preventDefault()
        handleSendWithTextRef.current?.(prompt)
      }
    }
    window.addEventListener('keydown', handleBannerKey)
    return () => window.removeEventListener('keydown', handleBannerKey)
  }, [health, channelStatus.gatewayStarting])

  const toggleVoiceOutputRef = useRef(toggleVoiceOutput)
  toggleVoiceOutputRef.current = toggleVoiceOutput
  const stableToggleVoiceOutput = useCallback(() => { toggleVoiceOutputRef.current() }, [])

  const statusLine = useMemo(() => {
    if (!status && !health) return <span>Checking Openclaw...</span>
    const parts: ReactNode[] = []
    if (status) {
      parts.push(
        <span key="svc" className={status.running ? 'status-ok' : 'status-warn'}>
          {status.running ? 'Service: running' : status.installed ? 'Service: installed' : 'Service: off'}
        </span>,
      )
    }
    if (health) {
      const gwStarting = channelStatus.gatewayStarting
      // Extract a short diagnostic hint from the health message when gateway is down.
      // The full message (with stderr tail) is still available in the tooltip.
      // Header labels can move to a soft warning after a short grace period,
      // but the large recovery cards below wait much longer.
      const gwPastGrace = gatewayDownPolls >= GATEWAY_HEADER_GRACE_POLLS
      const brPastGrace = browserNotReadyPolls >= BROWSER_HEADER_GRACE_POLLS
      let gwLabel = 'Gateway: OK'
      if (!health.gateway_ok && gwPastGrace) {
        if (gwStarting) {
          gwLabel = 'Gateway: starting...'
        } else if (health.message?.includes('plist not found')) {
          gwLabel = 'Gateway: not enabled'
        } else if (health.message?.includes('not loaded')) {
          gwLabel = 'Gateway: not loaded — re-enable in Settings'
        } else {
          gwLabel = 'Gateway: reconnecting...'
        }
      }
      const gwOkForDisplay = health.gateway_ok || !gwPastGrace
      const brOkForDisplay = health.browser_ok || (!health.gateway_ok && !gwPastGrace) || (health.gateway_ok && !brPastGrace)
      parts.push(
        <span key="gw" className={gwOkForDisplay ? 'status-ok' : gwStarting ? 'status-warn' : 'status-down'}
          title={!health.gateway_ok && gwPastGrace && health.message ? health.message : undefined}>
          {gwLabel}
        </span>,
      )
      parts.push(
        <span key="br" className={brOkForDisplay ? 'status-ok' : gwStarting ? 'status-warn' : 'status-down'}
          title={!health.browser_ok && (gwPastGrace || brPastGrace) && health.message ? health.message : undefined}>
          {brOkForDisplay ? 'Browser: OK' : gwStarting ? 'Browser: starting...' : health.gateway_ok ? 'Browser: starting...' : 'Browser: waiting for gateway'}
        </span>,
      )
    } else if (status?.running) {
      // Health not loaded yet but service is running — show checking state
      parts.push(<span key="gw" className="status-warn">Gateway: starting...</span>)
      parts.push(<span key="br" className="status-warn">Browser: starting...</span>)
    } else if (!status?.running && !status?.installed) {
      // Service not installed — give clear direction
      parts.push(<span key="gw" className="status-down">Gateway: not installed</span>)
    }
    if (currentTargetId) parts.push(<span key="tab">Tab: {currentTargetId.slice(0, 12)}...</span>)
    return parts.reduce<ReactNode[]>((acc, part, i) => {
      if (i > 0) acc.push(<span key={`sep-${i}`}> | </span>)
      acc.push(part)
      return acc
    }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, health, channelStatus.gatewayStarting, gatewayDownPolls, browserNotReadyPolls, currentTargetId])

  // Memoize message parsing so extractPromptActions only re-runs when msgs change,
  // not on every re-render from status/health polling.
  const parsedMsgs = useMemo(() =>
    msgs.map(m => {
      if (m.promptActions) {
        return { msg: m, cleaned: m.text, actions: m.promptActions }
      }
      const { cleaned, actions } = m.isClickable ? { cleaned: m.text, actions: [] as PromptAction[] } : extractPromptActions(m.text)
      return { msg: m, cleaned, actions }
    }),
    [msgs],
  )

  // Fast id→Msg lookup for reply-to resolution
  const msgsById = useMemo(() => {
    const map = new Map<string, Msg>()
    for (const m of msgs) map.set(m.id, m)
    return map
  }, [msgs])

  return (
    <div className={`ClawdChatRoot ${compact ? 'ClawdChatRoot--compact' : ''}`}>
      <div className="ClawdChatHeader">
        <div className="ClawdChatTitleRow">
          <img src="/assets/images/knap-logo-medium.png" alt="Knapsack" className="ClawdChatLogo" />
          <div className="ClawdChatTitleGroup">
            <h1 className="ClawdChatTitle">{title}</h1>
            {/* Attribution moved to Settings */}
            <div className="ClawdChatStatus">{statusLine}</div>
          </div>
        </div>
        <div className="ClawdChatActions">
          <button
            disabled={busy}
            onClick={() => enableAssistant(!status?.running)}
            className={status?.running ? 'toggle-on' : 'toggle-off'}
          >
            {status?.running ? '✓ Enabled' : '○ Disabled'}
          </button>
          <button
            onClick={() => { setShowChannelsPanel(prev => !prev); setShowSkillsPanel(false); setShowKeyPrompt(false); if (externalActivityPanel && onCloseActivity) onCloseActivity() }}
            className={`${showChannelsPanel ? 'toggle-on' : ''} ${channelButtonInfo.colorClass}`}
            title={channelButtonInfo.tooltip}
          >
            💬 Channels
          </button>
          <button
            disabled={busy}
            onClick={toggleAutonomyMode}
            className={autonomyMode === 'autonomous' ? 'toggle-autonomy-on' : 'toggle-autonomy-off'}
            title={autonomyMode === 'autonomous'
              ? 'Autonomous mode: works independently. Click to switch to Assist.'
              : 'Assist mode: checks in with you. Click to switch to Autonomous.'}
          >
            {autonomyMode === 'autonomous' ? '🚀 Autonomous' : '🤝 Assist'}
          </button>
          <button
            disabled={busy}
            onClick={toggleProactiveMode}
            className={proactiveMode ? 'toggle-proactive-on' : 'toggle-proactive-off'}
            title={proactiveMode
              ? 'Proactive mode: background notifications enabled. Click to switch to Reactive.'
              : 'Reactive mode: notifications off. Click to switch to Proactive.'}
          >
            {proactiveMode ? '🔔 Proactive' : '🔕 Reactive'}
          </button>
          <button disabled={busy} onClick={() => { const opening = !showKeyPrompt; setShowKeyPrompt(opening); setShowSkillsPanel(false); setShowChannelsPanel(false); if (opening && externalActivityPanel && onCloseActivity) onCloseActivity() }} className={showKeyPrompt ? 'toggle-on' : ''} title="Change AI provider, API key, or model">
            {confirmedProvider === 'anthropic' ? (ANTHROPIC_MODELS.find(m => m.id === selectedAnthropicModel)?.name || selectedAnthropicModel || 'Anthropic')
              : confirmedProvider === 'gemini' ? (GEMINI_MODELS.find(m => m.id === selectedGeminiModel)?.name || selectedGeminiModel || 'Gemini')
              : confirmedProvider === 'groq' ? (GROQ_MODELS.find(m => m.id === selectedGroqModel)?.name || selectedGroqModel || 'Groq')
              : confirmedProvider === 'xai' ? (XAI_MODELS.find(m => m.id === selectedXaiModel)?.name || selectedXaiModel || 'Grok')
              : confirmedProvider === 'ollama' ? (selectedOllamaModel || 'Ollama')
              : confirmedProvider === 'openrouter' ? (OPENROUTER_MODELS.find(m => m.id === selectedOpenRouterModel)?.name || selectedOpenRouterModel || 'OpenRouter')
              : confirmedProvider === 'knapsack' ? 'Knapsack'
              : (OPENAI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel || 'OpenAI')}
          </button>
          <button disabled={busy} onClick={() => setShowToneSelector(true)}>
            Tone: {TONE_OPTIONS.find(t => t.id === selectedTone)?.name || 'Select'}
          </button>
          <button
            disabled={busy}
            onClick={developerMode ? toggleDeveloperMode : toggleAdvancedMode}
            className={developerMode ? 'toggle-developer-on' : advancedMode ? 'toggle-advanced-on' : 'toggle-advanced-off'}
            title={developerMode
              ? 'Developer mode ON — Sentry scanning + auto-PR enabled. Click to disable.'
              : advancedMode
              ? 'Advanced mode ON — shell commands enabled. Click to disable.'
              : 'Standard mode — click to enable shell commands.'}
          >
            {developerMode ? '{} Developer' : advancedMode ? '⚡ Advanced' : '▸ Standard'}
          </button>
          {advancedMode && !developerMode && (
            <button
              disabled={busy}
              onClick={toggleDeveloperMode}
              className="toggle-developer-off"
              title="Enable Developer mode — scan Sentry reports and auto-create PRs for bugs."
            >
              {} Dev
            </button>
          )}
          {developerMode && (
            <button
              disabled={busy}
              onClick={() => { setShowDevPanel(p => !p); setShowSkillsPanel(false); setShowChannelsPanel(false); setShowKeyPrompt(false) }}
              className={showDevPanel ? 'toggle-on' : ''}
              title="Open Developer panel — view Sentry issues and error logs"
            >
              Bugs
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => { setShowSkillsPanel(true); setShowChannelsPanel(false); setShowKeyPrompt(false); if (externalActivityPanel && onCloseActivity) onCloseActivity(); fetchSkills() }}
            title="Manage skills and extensions"
          >
            Skills
          </button>
          <button
            onClick={() => { if (onToggleActivity) { onToggleActivity(); setShowSkillsPanel(false); setShowChannelsPanel(false); setShowKeyPrompt(false) } }}
            className={externalActivityPanel ? 'toggle-on' : ''}
            title="View live activity — tool calls, commands, and browser actions"
          >
            Activity
          </button>
          <button disabled={busy} onClick={clearHistory} title="Clear chat history and start fresh">
            Clear
          </button>
          {voiceEnabled && (
            <button
              className="voice-enabled"
              onClick={toggleVoiceOutput}
              title="Voice mode ON - click to disable"
            >
              🔊
            </button>
          )}
        </div>
      </div>

      {showToneSelector && (
        <div className="ClawdToneSelector">
          <div className="ClawdToneSelectorContent">
            <h3>Choose Your Tone</h3>
            <p>Select how Openclaw should communicate with you:</p>
            <div className="ClawdToneOptions">
              {TONE_OPTIONS.map(tone => (
                <button
                  key={tone.id}
                  className={`ClawdToneOption ${selectedTone === tone.id ? 'selected' : ''}`}
                  onClick={() => handleToneChange(tone.id)}
                >
                  <span className="ClawdToneName">{tone.name}</span>
                  <span className="ClawdToneDesc">{tone.description}</span>
                </button>
              ))}
            </div>
            <button className="ClawdToneCancel" onClick={() => setShowToneSelector(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAdvancedWarning && (
        <div className="ClawdAdvancedWarning">
          <div className="ClawdAdvancedWarningContent">
            <h3>Enable Advanced Mode?</h3>
            <p>Advanced mode allows Openclaw to execute shell commands on your computer. This means it can:</p>
            <ul>
              <li>Install software via brew, npm, pip, etc.</li>
              <li>Run scripts and CLI tools</li>
              <li>Check system information and versions</li>
              <li>Execute automation commands</li>
            </ul>
            <div className="ClawdAdvancedSafety">
              <strong>Safety:</strong> Dangerous commands (rm -rf, format disk, etc.) are blocked. Commands have a 60-second timeout. You can disable this anytime.
            </div>
            <div className="ClawdAdvancedWarningActions">
              <button onClick={() => setShowAdvancedWarning(false)}>Cancel</button>
              <button onClick={confirmAdvancedMode}>Enable Advanced Mode</button>
            </div>
          </div>
        </div>
      )}

      {showDeveloperWarning && (
        <div className="ClawdDeveloperWarning">
          <div className="ClawdDeveloperWarningContent">
            <h3>Enable Developer Mode?</h3>
            <p>Developer mode goes beyond Advanced mode. It actively monitors for bugs and can automatically create fixes:</p>
            <ul>
              <li><strong>Sentry email scanning</strong> — reads your email for Sentry error reports and alerts</li>
              <li><strong>Local error logs</strong> — monitors browser console errors, app logs, Tauri backend logs, and Rust panic traces</li>
              <li><strong>Frontend Sentry events</strong> — captures React error boundary reports and unhandled rejections</li>
              <li><strong>Backend Sentry events</strong> — reads Rust-side captured errors and panics</li>
              <li><strong>Auto-investigation</strong> — initiates Claude Code sessions to search the codebase, diagnose bugs, and implement fixes</li>
              <li><strong>PR creation</strong> — automatically creates pull requests for discovered bugs in knapsack-desktop</li>
            </ul>
            <div className="ClawdDeveloperNote">
              <strong>Requires:</strong> Advanced mode (auto-enabled), connected email account (for Sentry alerts), and a configured AI provider. Token usage will increase due to automated code analysis sessions.
            </div>
            <div className="ClawdDeveloperWarningActions">
              <button onClick={() => setShowDeveloperWarning(false)}>Cancel</button>
              <button onClick={confirmDeveloperMode}>Enable Developer Mode</button>
            </div>
          </div>
        </div>
      )}

      {showProactiveModal && (
        <div className="ClawdProactiveModal">
          <div className="ClawdProactiveModalContent">
            <h3>{pendingProactiveState ? 'Enable Proactive Mode?' : 'Switch to Reactive Mode?'}</h3>
            {pendingProactiveState ? (
              <>
                <p>Proactive mode lets Knapsack work in the background and notify you automatically. This includes:</p>
                <ul>
                  <li><strong>Morning briefings</strong> — a summary of your day, emails, and upcoming meetings</li>
                  <li><strong>Email alerts</strong> — flagged when something important lands in your inbox</li>
                  <li><strong>Meeting prep</strong> — context and attendee info before your next meeting</li>
                  <li><strong>Post-meeting follow-ups</strong> — action items and notes after calls</li>
                </ul>
                <div className="ClawdProactiveNote">
                  <strong>Token usage:</strong> Each background notification uses LLM tokens to analyze your emails and calendar. Expect roughly 4–8 notifications per day during work hours.
                </div>
              </>
            ) : (
              <>
                <p>Reactive mode turns off all automatic background notifications. Knapsack will only respond when you ask it something directly.</p>
                <ul>
                  <li>No morning briefings, email alerts, or meeting prep</li>
                  <li>No automatic token usage in the background</li>
                  <li>You can still trigger any notification manually with slash commands: <strong>/morning</strong>, <strong>/emails</strong>, <strong>/prep</strong>, <strong>/fu</strong></li>
                </ul>
                <div className="ClawdProactiveNote">
                  <strong>Saves tokens:</strong> Reactive mode eliminates background LLM calls entirely. Use this if you want full control over when Knapsack uses your API quota.
                </div>
              </>
            )}
            <div className="ClawdProactiveModalActions">
              <button onClick={() => setShowProactiveModal(false)}>Cancel</button>
              <button onClick={confirmProactiveToggle}>
                {pendingProactiveState ? 'Enable Proactive' : 'Switch to Reactive'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ClawdChatContent">
      <div
        className={`ClawdChatMain ${isDragOver ? 'drag-over' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
      {isDragOver && (
        <div className="ClawdDropOverlay">
          <div className="ClawdDropOverlayContent">
            <span className="ClawdDropIcon">+</span>
            <span>Drop files here to attach</span>
          </div>
        </div>
      )}

      {/* Channels UI removed - voice controls are now inline in the input area */}

      <div className="ClawdChatBody" ref={el => { chatBodyRef.current = el }}>
        {parsedMsgs.map(({ msg: m, cleaned, actions }) => (
          <div
            key={m.id}
            ref={el => {
              if (el) msgRefsMap.current.set(m.id, el)
              else msgRefsMap.current.delete(m.id)
            }}
          >
            <ChatMessage
              msg={m}
              cleaned={cleaned}
              actions={actions}
              mdPlugins={mdPlugins}
              mdComponents={mdComponents}
              onExampleClick={handleExampleClick}
              onAction={handleSendWithText}
              onReply={setReplyToMsg}
              replyToMsg={m.replyTo ? (msgsById.get(m.replyTo) ?? null) : null}
              onScrollToMsg={scrollToMsg}
              serviceHealthy={Boolean(health?.gateway_ok && health?.browser_ok)}
            />
          </div>
        ))}
        {/* Skills suggestion chips — shown in welcome area when eligible skills exist */}
        {skills.filter(s => s.eligible && s.enabled !== false).length > 0 &&
          msgs.every(m => m.id.startsWith('welcome-')) && (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble">
              <p><strong>Available skills:</strong></p>
              <div className="ClawdSkillChips">
                {skills.filter(s => s.eligible && s.enabled !== false).map(skill => (
                  <button
                    key={skill.name}
                    className="ClawdSkillChip"
                    onClick={() => handleSendWithText(skill.description || `Use the ${skill.name} skill`)}
                  >
                    <span className="ClawdSkillChipEmoji">{skill.emoji || '🔧'}</span>
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* API key setup banner — shown on first launch until an API key is saved */}
        {!hasCompletedOnboarding && msgs.every(m => m.id.startsWith('welcome-')) && (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble ClawdApiKeyBanner">
              <p className="ClawdApiKeyBannerTitle">One more step to get started</p>
              <p className="ClawdApiKeyBannerDesc">
                Add an API key from Anthropic, OpenAI, Gemini, or another provider to start chatting. Your key is stored locally and never shared.
              </p>
              <button
                className="ClawdApiKeyBannerBtn"
                onClick={() => { setShowKeyPrompt(true); setShowSkillsPanel(false); setShowChannelsPanel(false) }}
              >
                Add API Key
              </button>
            </div>
          </div>
        )}
        {/* Channel connection banner — shown in welcome area when no channels are connected */}
        {showChannelBanner && (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble ClawdChannelBanner">
              <p className="ClawdChannelBannerTitle">Connect a messaging channel</p>
              <p className="ClawdChannelBannerDesc">
                Link your WhatsApp, iMessage, or Telegram so your AI assistant can send and receive messages on your behalf.
              </p>
              <div className="ClawdChannelBannerButtons">
                <button
                  className="ClawdChannelBtn ClawdChannelBtn--whatsapp"
                  onClick={async () => {
                    try { await channelStatus.connectWhatsApp() } catch {}
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Connect WhatsApp
                </button>
                <button
                  className="ClawdChannelBtn ClawdChannelBtn--imessage"
                  onClick={async () => {
                    try { await channelStatus.connectIMessage() } catch {}
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
                  Connect iMessage
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Gateway troubleshooting card — shown only after a sustained outage (~90s)
            so normal restarts and sleep/wake blips don't surface a scary error.
            Suppressed entirely until an API key is saved — the gateway status is
            irrelevant and alarming when the user hasn't set up a key yet. */}
        {hasCompletedOnboarding && health && !health.gateway_ok && gatewayDownPolls >= GATEWAY_CARD_GRACE_POLLS && !channelStatus.gatewayStarting && (() => {
          const healthMessage = (health.message || '').toLowerCase()
          const missingService =
            health.diagnostic_type === 'service_not_installed' ||
            health.diagnostic_type === 'service_not_loaded' ||
            healthMessage.includes('launchagent plist not found') ||
            healthMessage.includes('service is registering') ||
            healthMessage.includes('service is not loaded')
          const versionMismatch = health.diagnostic_type === 'version_mismatch' && !missingService
          const bannerTitle = missingService
            ? 'Gateway background service is missing'
            : versionMismatch
              ? 'OpenClaw version mismatch'
              : 'Gateway connectivity issue'
          const bannerDesc = missingService
            ? 'Knapsack cannot find its background gateway service right now. This usually means the LaunchAgent was removed or did not load after restart. Try restarting the gateway below to reinstall it.'
            : versionMismatch
              ? 'An OpenClaw version mismatch was detected in the gateway logs. Knapsack keeps its own gateway active and does not uninstall any software — it just ignores stale writes from older/newer OpenClaw installs and attempts automatic recovery.'
              : 'The gateway isn\'t responding. This can happen after a crash, permission change, or system sleep. Try one of these:'
          return (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble ClawdGatewayBanner">
              <p className="ClawdGatewayBannerTitle">
                {bannerTitle}
              </p>
              <p className="ClawdGatewayBannerDesc">
                {bannerDesc}
              </p>
              <div className="ClawdPromptActions">
                <button
                  className="ClawdPromptAction"
                  onClick={() => handleSendWithText(GATEWAY_DIAGNOSE_PROMPT)}
                >
                  <span className="ClawdPromptActionNum">1</span>
                  Diagnose the issue
                </button>
                <button
                  className="ClawdPromptAction"
                  onClick={() => handleSendWithText(GATEWAY_RESTART_PROMPT)}
                >
                  <span className="ClawdPromptActionNum">2</span>
                  Restart the gateway
                </button>
                <button
                  className="ClawdPromptAction"
                  onClick={() => handleSendWithText(GATEWAY_VIEW_LOGS_PROMPT)}
                >
                  <span className="ClawdPromptActionNum">3</span>
                  View error logs
                </button>
              </div>
            </div>
          </div>
          )
        })()}
        {/* Browser-only issue card — gateway OK but browser not responding for ~2 minutes. */}
        {hasCompletedOnboarding && health && health.gateway_ok && !health.browser_ok && !channelStatus.gatewayStarting && browserNotReadyPolls >= BROWSER_CARD_GRACE_POLLS && (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble ClawdGatewayBanner ClawdGatewayBanner--warn">
              <p className="ClawdGatewayBannerTitle">Browser is not responding</p>
              <p className="ClawdGatewayBannerDesc">
                The gateway is running but the browser (Chrome CDP) isn't connecting. This usually resolves on its own, but if it persists:
              </p>
              <div className="ClawdPromptActions">
                <button
                  className="ClawdPromptAction"
                  onClick={() => handleSendWithText(GATEWAY_DIAGNOSE_PROMPT)}
                >
                  <span className="ClawdPromptActionNum">1</span>
                  Diagnose the issue
                </button>
                <button
                  className="ClawdPromptAction"
                  onClick={() => handleSendWithText(GATEWAY_VIEW_LOGS_PROMPT)}
                >
                  <span className="ClawdPromptActionNum">2</span>
                  View error logs
                </button>
              </div>
            </div>
          </div>
        )}
        {thinkingMessage && (
          <div className="ClawdMsg ClawdMsg-assistant ClawdMsg-thinking">
            <div className="ClawdBubble">
              <ReactMarkdown remarkPlugins={mdPlugins} components={mdComponents}>{thinkingMessage}</ReactMarkdown>
            </div>
          </div>
        )}
        {queuedMessageTexts.map((qText, i) => (
          <div key={`queued-${i}`} className="ClawdMsg ClawdMsg-user ClawdMsg-queued">
            {editingQueuedIndex === i ? (
              <div className="ClawdQueuedEdit">
                <textarea
                  className="ClawdQueuedEdit__textarea"
                  value={editingQueuedText}
                  onChange={e => setEditingQueuedText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      const trimmed = editingQueuedText.trim()
                      if (trimmed) {
                        const updated = [...queuedMessagesRef.current]
                        updated[i] = trimmed
                        queuedMessagesRef.current = updated
                        setQueuedMessageTexts(updated)
                      }
                      setEditingQueuedIndex(null)
                    } else if (e.key === 'Escape') {
                      setEditingQueuedIndex(null)
                    }
                  }}
                  autoFocus
                />
                <div className="ClawdQueuedEdit__actions">
                  <button
                    className="ClawdQueuedEdit__save"
                    onClick={() => {
                      const trimmed = editingQueuedText.trim()
                      if (trimmed) {
                        const updated = [...queuedMessagesRef.current]
                        updated[i] = trimmed
                        queuedMessagesRef.current = updated
                        setQueuedMessageTexts(updated)
                      }
                      setEditingQueuedIndex(null)
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="ClawdQueuedEdit__cancel"
                    onClick={() => setEditingQueuedIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="ClawdBubble">
                <ReactMarkdown remarkPlugins={mdPlugins} components={mdComponents}>{qText}</ReactMarkdown>
              </div>
            )}
            <div className="ClawdQueuedFooter">
              <span className="ClawdQueuedLabel">Queued{queuedMessageTexts.length > 1 ? ` (${i + 1} of ${queuedMessageTexts.length})` : ''}</span>
              {editingQueuedIndex !== i && (
                <div className="ClawdQueuedActions">
                  <button
                    className="ClawdQueuedActions__btn"
                    title="Edit queued message"
                    onClick={() => {
                      setEditingQueuedText(qText)
                      setEditingQueuedIndex(i)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="ClawdQueuedActions__btn ClawdQueuedActions__btn--remove"
                    title="Remove queued message"
                    onClick={() => {
                      const updated = queuedMessagesRef.current.filter((_, idx) => idx !== i)
                      queuedMessagesRef.current = updated
                      setQueuedMessageTexts(updated)
                      setHasQueuedMessage(updated.length > 0)
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {claudeCodeActive && (
          <div className="ClawdMsg ClawdMsg-assistant ClawdMsg-claude-code">
            <div className="ClawdBubble ClawdBubble--claude-code">
              <div className="ClawdClaudeCodeIndicator">
                <span className="ClawdClaudeCodeIndicator__pulse" />
                <span className="ClawdClaudeCodeIndicator__label">{codingAgentName} is working</span>
                {claudeCodePrompt && (
                  <span className="ClawdClaudeCodeIndicator__prompt">{claudeCodePrompt.length > 80 ? claudeCodePrompt.slice(0, 80) + '...' : claudeCodePrompt}</span>
                )}
                <button
                  className="ClawdClaudeCodeIndicator__btn"
                  onClick={() => {
                    if (!externalActivityPanel && onToggleActivity) onToggleActivity()
                  }}
                >
                  View in Terminal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showScrollButton && (
        <button className="ClawdScrollToBottom" onClick={scrollToBottom}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          New messages
        </button>
      )}

      {/* Inline skill suggestion — appears after an AI response when a relevant
          not-yet-installed skill was detected in the user's message */}
      {skillSuggestion && (
        <div className="ClawdSkillNudge">
          <span className="ClawdSkillNudgeEmoji">{skillSuggestion.emoji || '💡'}</span>
          <div className="ClawdSkillNudgeBody">
            <span className="ClawdSkillNudgeName">{skillSuggestion.name}</span>
            <span className="ClawdSkillNudgeDesc">{skillSuggestion.description}</span>
          </div>
          {skillSuggestion.source === 'OpenClaw' ? (
            <button
              className="ClawdSkillNudgeAction"
              onClick={async () => {
                const skill = skillSuggestion
                setSkillSuggestion(null)
                await handleSkillInstall(skill.name, skill.installOptions?.[0]?.id ?? 'default')
              }}
            >
              Install
            </button>
          ) : skillSuggestion.homepage ? (
            <a
              className="ClawdSkillNudgeAction"
              href={skillSuggestion.homepage}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSkillSuggestion(null)}
            >
              {skillSuggestion.source === 'Anthropic' ? 'Learn more' : 'Get skill'}
            </a>
          ) : (
            <button
              className="ClawdSkillNudgeAction"
              onClick={() => { setShowSkillsPanel(true); setSkillSuggestion(null) }}
            >
              View skills
            </button>
          )}
          <button
            className="ClawdSkillNudgeDismiss"
            onClick={() => {
              setDismissedSkillNames(prev => new Set([...prev, skillSuggestion.name]))
              setSkillSuggestion(null)
            }}
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <ChatInputBar
        busy={busy}
        hasQueuedMessage={hasQueuedMessage}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        voiceEnabled={voiceEnabled}
        attachedFiles={attachedFiles}
        onSend={stableDoSend}
        onQueue={stableQueueMessage}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeAttachedFile}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onToggleVoice={stableToggleVoiceOutput}
        onStopGeneration={stableStopGeneration}
        replyToMsg={replyToMsg}
        onCancelReply={() => setReplyToMsg(null)}
        initialValue={initialInput}
      />
      </div>
      </div>{/* end ClawdChatContent */}

      {/* ── Drawer panels (absolutely positioned within ClawdChatRoot) ── */}

      {showDevPanel && developerMode && (
        <div className="ClawdDevPanel">
          <div className="ClawdDevPanelHeader">
            <h3>{'{}'} Developer</h3>
            <button onClick={() => setShowDevPanel(false)}>&times;</button>
          </div>
          <DeveloperModePanel
            onInitiateSession={handleDevSessionInitiate}
            userEmail={userEmail}
            proactiveMode={proactiveMode}
          />
        </div>
      )}

      {showSkillsPanel && (
        <div className="ClawdSkillsPanel">
          <div className="ClawdSkillsPanelHeader">
            <h3>Skills</h3>
            <button onClick={() => setShowSkillsPanel(false)}>×</button>
          </div>
          {skillsLoading ? (
            <div className="ClawdSkillsLoading">Loading skills...</div>
          ) : skillsError ? (
            <div className="ClawdSkillsError">{skillsError}<br /><button onClick={fetchSkills} style={{marginTop: 8, fontSize: 12, cursor: 'pointer'}}>Retry</button></div>
          ) : (
            <>
              <div className="ClawdSkillsSummary">
                {skills.filter(s => s.eligible).length} skills ready
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'Anthropic').length > 0 &&
                  `, ${skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'Anthropic').length} from Anthropic`}
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'MCP Market').length > 0 &&
                  `, ${skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'MCP Market').length} from MCP Market`}
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'OpenClaw').length > 0 &&
                  `, ${skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'OpenClaw').length} available from OpenClaw`}
                {skills.filter(s => !s.eligible && s.installOptions?.length).length > 0 &&
                  `, ${skills.filter(s => !s.eligible && s.installOptions?.length).length} need setup`}
              </div>
              <div className="ClawdSkillsList">
                {/* Ready skills */}
                {skills.filter(s => s.eligible && s.enabled !== false).length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Ready</h4>
                    {skills.filter(s => s.eligible && s.enabled !== false).map(skill => (
                      <div className="ClawdSkillCard" key={skill.name}>
                        <div className="ClawdSkillStatus ready" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          <div className="ClawdSkillMeta">
                            {skill.source === 'OpenClaw' ? (
                              <a className="ClawdSkillSource ClawdSkillSource--link" href={skill.homepage || `https://clawhub.ai/steipete/${skill.name}`} target="_blank" rel="noopener noreferrer">OpenClaw</a>
                            ) : skill.source ? (
                              <span className="ClawdSkillSource">{skill.source}</span>
                            ) : null}
                            {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                          </div>
                        </div>
                        <div className="ClawdSkillActions">
                          <button className="ClawdSkillToggleBtn" onClick={() => handleSkillToggle(skill.name, false)}>Disable</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Needs Setup skills */}
                {skills.filter(s => !s.eligible && s.installOptions?.length).length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Needs Setup</h4>
                    {skills.filter(s => !s.eligible && s.installOptions?.length).map(skill => (
                      <div className="ClawdSkillCard" key={skill.name}>
                        <div className="ClawdSkillStatus needs-setup" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          {skill.missing && skill.missing.length > 0 && (
                            <div className="ClawdSkillDesc" style={{color: '#e67e22'}}>Missing: {skill.missing.join(', ')}</div>
                          )}
                          <div className="ClawdSkillMeta">
                            {skill.source === 'OpenClaw' ? (
                              <a className="ClawdSkillSource ClawdSkillSource--link" href={skill.homepage || `https://clawhub.ai/steipete/${skill.name}`} target="_blank" rel="noopener noreferrer">OpenClaw</a>
                            ) : skill.source ? (
                              <span className="ClawdSkillSource">{skill.source}</span>
                            ) : null}
                            {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                          </div>
                        </div>
                        <div className="ClawdSkillActions">
                          {skill.installOptions?.map(opt => (
                            <button key={opt.id} className="ClawdSkillInstallBtn" onClick={() => handleSkillInstall(skill.name, opt.id)}>
                              {opt.label || 'Install'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Available from Anthropic */}
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'Anthropic').length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Available from Anthropic</h4>
                    {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'Anthropic').map(skill => (
                      <div className="ClawdSkillCard ClawdSkillCard--available" key={skill.name}>
                        <div className="ClawdSkillStatus available" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          <div className="ClawdSkillMeta">
                            <span className="ClawdSkillSource">Anthropic</span>
                            {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                          </div>
                        </div>
                        <div className="ClawdSkillActions">
                          <a
                            className="ClawdSkillInstallLink"
                            href={skill.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Learn more
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Available from MCP Market */}
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'MCP Market').length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Available from MCP Market</h4>
                    <div className="ClawdSkillsDisclaimer">
                      Provided by <a href="https://mcpmarket.com/tools/skills" target="_blank" rel="noopener noreferrer">MCP Market</a> — community-maintained Claude Code skills.
                    </div>
                    {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'MCP Market').map(skill => (
                      <div className="ClawdSkillCard ClawdSkillCard--available" key={skill.name}>
                        <div className="ClawdSkillStatus available" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          <div className="ClawdSkillMeta">
                            <a className="ClawdSkillSource ClawdSkillSource--link" href="https://mcpmarket.com/tools/skills" target="_blank" rel="noopener noreferrer">MCP Market</a>
                            {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                          </div>
                        </div>
                        <div className="ClawdSkillActions">
                          <a
                            className="ClawdSkillInstallLink"
                            href={skill.homepage || 'https://mcpmarket.com/tools/skills'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Get skill
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Available from OpenClaw */}
                {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'OpenClaw').length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Available from OpenClaw</h4>
                    <div className="ClawdSkillsDisclaimer">
                      Provided by <a href="https://openclawskills.org/" target="_blank" rel="noopener noreferrer">OpenClaw</a>, curated by Knapsack. Community-maintained — use at your own risk.
                    </div>
                    {skills.filter(s => !s.eligible && !s.installOptions?.length && s.source === 'OpenClaw').map(skill => (
                      <div className="ClawdSkillCard ClawdSkillCard--available" key={skill.name}>
                        <div className="ClawdSkillStatus available" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          <div className="ClawdSkillMeta">
                            <a className="ClawdSkillSource ClawdSkillSource--link" href={skill.homepage || `https://clawhub.ai/steipete/${skill.name}`} target="_blank" rel="noopener noreferrer">OpenClaw</a>
                            {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                          </div>
                        </div>
                        <div className="ClawdSkillActions">
                          <a
                            className="ClawdSkillInstallLink"
                            href={skill.homepage || `https://clawhub.ai/steipete/${skill.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Set up on ClawHub
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Disabled skills */}
                {skills.filter(s => s.enabled === false).length > 0 && (
                  <div className="ClawdSkillsGroup">
                    <h4>Disabled</h4>
                    {skills.filter(s => s.enabled === false).map(skill => (
                      <div className="ClawdSkillCard" key={skill.name}>
                        <div className="ClawdSkillStatus disabled" />
                        <div className="ClawdSkillEmoji">{skill.emoji || '🔧'}</div>
                        <div className="ClawdSkillInfo">
                          <div className="ClawdSkillName">{skill.name}</div>
                          {skill.description && <div className="ClawdSkillDesc">{skill.description}</div>}
                          {skill.externalApi && <span className="ClawdSkillExternalBadge">External API</span>}
                        </div>
                        <div className="ClawdSkillActions">
                          <button className="ClawdSkillToggleBtn" onClick={() => handleSkillToggle(skill.name, true)}>Enable</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {skills.length === 0 && (
                  <div className="ClawdSkillsLoading">No skills found. Make sure the gateway is running.</div>
                )}
              </div>
              <div className="ClawdSkillsFooter">
                Add more skills by placing SKILL.md directories in <code>~/clawd/skills/</code><br />
                Browse community skills at{' '}
                <a href="https://openclawskills.org/" target="_blank" rel="noopener noreferrer">OpenClaw Skills</a>
                {', '}
                <a href="https://moltdirectory.com/" target="_blank" rel="noopener noreferrer">Molt Directory</a>
                {', and '}
                <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer">ClawHub</a>
              </div>
            </>
          )}
        </div>
      )}

      {showChannelsPanel && (
        <div className="ClawdChannelsPanel">
          <div className="ClawdChannelsPanelHeader">
            <h3>Messaging Channels</h3>
            <button onClick={() => setShowChannelsPanel(false)}>×</button>
          </div>
          <div className="ClawdChannelsPanelBody">
            <p className="ClawdChannelsPanelIntro">
              Connect a messaging app so your AI assistant can send and receive messages on your behalf.
            </p>

            <div className="ClawdChannelAccordion">
              {/* ── WhatsApp ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'whatsapp' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.whatsapp?.linked ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'whatsapp' ? null : 'whatsapp')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--whatsapp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">WhatsApp</div>
                  {channelStatus.whatsapp?.linked && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.whatsapp?.linked ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : channelStatus.whatsapp?.enabled ? (
                      <div className="ClawdChannelCardStatus">Enabled — scan QR code to link</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {channelStatus.whatsapp?.linked && (
                        <button
                          className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                          disabled={channelBusy === 'whatsapp'}
                          onClick={async () => {
                            setChannelBusy('whatsapp')
                            setChannelError(null)
                            try {
                              await channelStatus.relinkWhatsApp()
                            } catch (err: any) {
                              const msg = err?.message || String(err)
                              console.error('[Channels] WhatsApp relink error:', msg)
                              setChannelError(`WhatsApp relink: ${msg}`)
                            } finally { setChannelBusy(null) }
                          }}
                        >
                          {channelBusy === 'whatsapp' ? 'Relinking...' : 'Relink'}
                        </button>
                      )}
                      <button
                        className={`ClawdChannelCardAction ${(channelStatus.whatsapp?.linked || channelStatus.whatsapp?.enabled) ? 'ClawdChannelCardAction--disconnect' : 'ClawdChannelCardAction--connect'}`}
                        disabled={channelBusy === 'whatsapp'}
                        onClick={async () => {
                          setChannelBusy('whatsapp')
                          setChannelError(null)
                          try {
                            if (channelStatus.whatsapp?.linked || (channelStatus.whatsapp?.enabled && !channelStatus.whatsappLinking && !channelStatus.whatsappQrUrl)) {
                              await channelStatus.disconnectWhatsApp()
                            } else {
                              await channelStatus.connectWhatsApp()
                            }
                          } catch (err: any) {
                            const msg = err?.message || String(err)
                            console.error('[Channels] WhatsApp error:', msg)
                            setChannelError(`WhatsApp: ${msg}`)
                          } finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'whatsapp'
                          ? (channelStatus.whatsappLinking ? 'Starting WhatsApp...' : 'Working...')
                          : (channelStatus.whatsapp?.linked || (channelStatus.whatsapp?.enabled && !channelStatus.whatsappLinking && !channelStatus.whatsappQrUrl))
                            ? 'Disconnect'
                            : 'Connect'}
                      </button>
                    </div>
                  </div>
                  {channelStatus.whatsappLinking && !channelStatus.whatsappQrUrl && !channelStatus.whatsappPairingCode && (
                    <div className="ClawdChannelGuide" style={{ textAlign: 'center', padding: '20px 16px' }}>
                      <div style={{ fontSize: 14, color: '#64748b' }}>{whatsappPhoneLinking ? 'Requesting pairing code...' : 'Starting WhatsApp service and generating QR code...'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>This can take up to 10 seconds while the gateway restarts.</div>
                    </div>
                  )}
                  {channelStatus.whatsapp?.linked ? (
                    <>
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to use WhatsApp</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Open <strong>WhatsApp</strong> on your phone and send a message to your own number (or have someone message you).</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>Your Knapsack AI assistant will automatically read incoming messages and reply on your behalf.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span>You can also ask your assistant in this chat: <em>"Send a WhatsApp message to [name/number]"</em>.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        Messages are processed locally. Your assistant uses the linked WhatsApp session — just like WhatsApp Web.
                      </div>
                    </div>
                    <ChannelAllowlistSection channel="whatsapp" isConnected={true} />
                    </>
                  ) : (
                    <div className="ClawdChannelGuide">
                      {channelStatus.whatsappPairingCode && (
                        <div style={{ textAlign: 'center', margin: '12px 0' }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Enter this code on your phone:</div>
                          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4, fontFamily: 'monospace', color: '#1e293b', padding: '12px 20px', background: '#f1f5f9', borderRadius: 8, display: 'inline-block' }}>
                            {channelStatus.whatsappPairingCode}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>WhatsApp → Linked Devices → Link a Device → <strong>Link with phone number instead</strong></div>
                        </div>
                      )}
                      {channelStatus.whatsappQrUrl && !channelStatus.whatsappPairingCode && (
                        <div style={{ textAlign: 'center', margin: '12px 0' }}>
                          <img src={channelStatus.whatsappQrUrl} alt="WhatsApp QR Code" style={{ width: 200, height: 200, imageRendering: 'pixelated', borderRadius: 8 }} />
                        </div>
                      )}
                      <div className="ClawdChannelGuideTitle">How to connect WhatsApp</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Click <strong>Connect</strong> above. Knapsack will enable the WhatsApp channel and start the login flow.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>{channelStatus.whatsappQrUrl ? 'Scan the QR code above.' : channelStatus.whatsappPairingCode ? 'Enter the code above on your phone.' : 'A QR code will appear above.'} On your phone, open <strong>WhatsApp → Settings → Linked Devices → Link a Device</strong>.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span>{channelStatus.whatsappPairingCode ? 'Tap "Link with phone number instead" and enter the code.' : 'Scan the QR code with your phone camera.'} Once linked, this panel will update automatically.</span>
                        </li>
                      </ol>
                      {/* Phone number linking alternative */}
                      {!channelStatus.whatsappPairingCode && (
                        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12 }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Can't scan QR? Link with phone number instead:</div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="tel"
                              value={whatsappPhoneInput}
                              onChange={e => setWhatsappPhoneInput(e.target.value)}
                              placeholder="+1 (234) 567-8900"
                              disabled={whatsappPhoneLinking || channelStatus.whatsappLinking}
                              style={{ flex: 1, padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }}
                            />
                            <button
                              disabled={!whatsappPhoneInput.trim() || whatsappPhoneLinking || channelStatus.whatsappLinking}
                              style={{ padding: '4px 12px', fontSize: 12, background: '#25d366', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !whatsappPhoneInput.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
                              onClick={async () => {
                                setWhatsappPhoneLinking(true)
                                setChannelError(null)
                                try {
                                  await channelStatus.loginWithPhone(whatsappPhoneInput.trim())
                                  setWhatsappPhoneInput('')
                                } catch (err: any) {
                                  const msg = err?.message || String(err)
                                  console.error('[Channels] WhatsApp phone link error:', msg)
                                  setChannelError(`WhatsApp: ${msg}`)
                                } finally { setWhatsappPhoneLinking(false) }
                              }}
                            >
                              {whatsappPhoneLinking ? 'Linking...' : 'Get code'}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="ClawdChannelGuideNote">
                        Knapsack doesn't need your phone number — it links as a companion device, just like WhatsApp Web.
                        Your phone stays the primary device.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── iMessage ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'imessage' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.imessage?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'imessage' ? null : 'imessage')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--imessage">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">iMessage</div>
                  {channelStatus.imessage?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.imessage?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : channelStatus.imessage?.enabled ? (
                      <div className="ClawdChannelCardStatus">Enabled — needs Full Disk Access</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected (macOS only)</div>
                    )}
                    <button
                      className={`ClawdChannelCardAction ${channelStatus.imessage?.configured ? 'ClawdChannelCardAction--disconnect' : 'ClawdChannelCardAction--connect'}`}
                      disabled={channelBusy === 'imessage'}
                      onClick={async () => {
                        setChannelBusy('imessage')
                        setChannelError(null)
                        try {
                          if (channelStatus.imessage?.configured) {
                            await channelStatus.disconnectIMessage()
                          } else {
                            await channelStatus.connectIMessage()
                          }
                        } catch (err: any) {
                          const msg = err?.message || String(err)
                          console.error('[Channels] iMessage error:', msg)
                          setChannelError(`iMessage: ${msg}`)
                        } finally { setChannelBusy(null) }
                      }}
                    >
                      {channelBusy === 'imessage' ? 'Working...' : channelStatus.imessage?.configured ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                  {channelStatus.imessage?.configured ? (
                    <>
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to use iMessage</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>From Messages on your iPhone, send an iMessage to yourself or to this Mac. Your assistant will see incoming messages and reply automatically.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>Only allowlisted senders can reach the AI. Add the phone number or Apple ID email you will message from below if it is not already listed.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span>You can also ask your assistant in this chat: <em>"Send an iMessage to [name/number]"</em>.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        iMessage works locally on macOS only. Knapsack reads the Messages database on your Mac — nothing leaves your machine.
                      </div>
                    </div>
                    <ChannelAllowlistSection channel="imessage" isConnected={true} />
                    </>
                  ) : (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to connect iMessage</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Click <strong>Connect</strong> above. If Full Disk Access hasn't been granted yet, System Settings will open automatically.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>In System Settings, find <strong>Knapsack</strong> in the Full Disk Access list and toggle it <strong>ON</strong>. If Knapsack isn't listed, click the <strong>+</strong> button to add it.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span><strong>Quit and reopen Knapsack</strong> — macOS requires a restart for the new permission to take effect.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">4</span>
                          <span>Open this panel again and click <strong>Connect</strong>. It should now show <strong>Connected</strong>.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        iMessage works locally on macOS only. Knapsack reads the Messages database on your Mac — nothing leaves your machine.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Telegram ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'telegram' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.telegram?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'telegram' ? null : 'telegram')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--telegram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">Telegram</div>
                  {channelStatus.telegram?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.channelErrors?.telegram ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--error" title={channelStatus.channelErrors.telegram}>Gateway error — try restarting the service</div>
                    ) : channelStatus.telegram?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : channelStatus.telegram?.enabled ? (
                      <div className="ClawdChannelCardStatus">Enabled — needs bot token</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    <button
                      className={`ClawdChannelCardAction ${channelStatus.telegram?.configured ? 'ClawdChannelCardAction--disconnect' : 'ClawdChannelCardAction--connect'}`}
                      disabled={channelBusy === 'telegram'}
                      onClick={async () => {
                        if (channelBusy) return
                        if (channelStatus.telegram?.configured) {
                          setChannelBusy('telegram')
                          setChannelError(null)
                          try {
                            await channelStatus.disconnectTelegram()
                          } catch (err: any) {
                            const msg = err?.message || String(err)
                            console.error('[Channels] Telegram error:', msg)
                            setChannelError(`Telegram: ${msg}`)
                          } finally { setChannelBusy(null) }
                        } else {
                          setShowTelegramInput(prev => !prev)
                        }
                      }}
                    >
                      {channelBusy === 'telegram'
                        ? 'Working...'
                        : channelStatus.telegram?.configured
                          ? 'Disconnect'
                          : showTelegramInput
                            ? 'Cancel'
                            : 'Connect'}
                    </button>
                  </div>
                  {channelStatus.telegram?.configured ? (
                    <>
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to use Telegram</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Open <strong>Telegram</strong> and send a message to your bot. Your Knapsack AI assistant will automatically read and reply.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>You can also ask your assistant in this chat: <em>"Send a Telegram message to [username]"</em>.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        Messages are routed through your Telegram bot. Your assistant processes everything locally.
                      </div>
                    </div>
                    <ChannelAllowlistSection channel="telegram" isConnected={true} />
                    </>
                  ) : (
                    <div className="ClawdChannelGuide">
                      {showTelegramInput && (() => {
                        const tokenTrimmed = telegramBotToken.trim()
                        const tokenValid = !tokenTrimmed || /^\d+:[A-Za-z0-9_-]+$/.test(tokenTrimmed)
                        return (
                        <div style={{ padding: '12px 0' }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                            Enter your Telegram bot token from @BotFather:
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text"
                              value={telegramBotToken}
                              onChange={e => setTelegramBotToken(e.target.value)}
                              placeholder="123456:ABC-DEF..."
                              style={{
                                flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4,
                                border: tokenTrimmed && !tokenValid ? '1px solid #ef4444' : '1px solid #ccc',
                              }}
                            />
                            <button
                              disabled={!tokenTrimmed || !tokenValid || channelBusy === 'telegram'}
                              onClick={async () => {
                                setChannelBusy('telegram')
                                setChannelError(null)
                                try {
                                  await channelStatus.connectTelegram(tokenTrimmed)
                                  setShowTelegramInput(false)
                                  setTelegramBotToken('')
                                } catch (err: any) {
                                  const msg = err?.message || String(err)
                                  setChannelError(`Telegram: ${msg}`)
                                } finally { setChannelBusy(null) }
                              }}
                              style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !tokenTrimmed || !tokenValid ? 0.5 : 1 }}
                            >
                              {channelBusy === 'telegram' ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                          {tokenTrimmed && !tokenValid && (
                            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                              Token format should be <code>123456789:ABCdefGHI...</code> (number, colon, alphanumeric string)
                            </div>
                          )}
                        </div>
                        )
                      })()}
                      <div className="ClawdChannelGuideTitle">How to connect Telegram</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Open Telegram and message <strong>@BotFather</strong>. Send <code>/newbot</code> and follow the prompts to create a bot.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>Copy the <strong>bot token</strong> BotFather gives you (e.g. <code>123456:ABC-DEF...</code>).</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span>Click <strong>Connect</strong> above and paste the token. Once saved, the bot will be active.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        Knapsack connects as your Telegram bot. Messages are processed locally on your machine.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Slack ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'slack' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.genericChannels.slack?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'slack' ? null : 'slack')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--slack">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">Slack</div>
                  {channelStatus.genericChannels.slack?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.genericChannels.slack?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    {channelStatus.genericChannels.slack?.configured && (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--disconnect"
                        disabled={channelBusy === 'slack'}
                        onClick={async () => {
                          setChannelBusy('slack')
                          setChannelError(null)
                          try { await channelStatus.disconnectGenericChannel('slack') }
                          catch (err: any) { setChannelError(`Slack: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'slack' ? 'Working...' : 'Disconnect'}
                      </button>
                    )}
                  </div>
                  {!channelStatus.genericChannels.slack?.configured && (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">Connect Slack</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        Slack requires both a <strong>Bot Token</strong> and an <strong>App-Level Token</strong>.
                      </div>
                      {(() => {
                        const botTrimmed = slackBotToken.trim()
                        const appTrimmed = slackAppToken.trim()
                        const botValid = !botTrimmed || botTrimmed.startsWith('xoxb-')
                        const appValid = !appTrimmed || appTrimmed.startsWith('xapp-')
                        const canSave = botTrimmed && appTrimmed && botValid && appValid
                        return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <label style={{ fontSize: 11, color: '#64748b', width: 70, flexShrink: 0 }}>Bot Token</label>
                          <input type="text" value={slackBotToken} onChange={e => setSlackBotToken(e.target.value)} placeholder="xoxb-..." style={{ flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: botTrimmed && !botValid ? '1px solid #ef4444' : '1px solid #ccc' }} />
                        </div>
                        {botTrimmed && !botValid && (
                          <div style={{ fontSize: 11, color: '#ef4444', marginLeft: 78 }}>Bot token must start with <code>xoxb-</code></div>
                        )}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <label style={{ fontSize: 11, color: '#64748b', width: 70, flexShrink: 0 }}>App Token</label>
                          <input type="text" value={slackAppToken} onChange={e => setSlackAppToken(e.target.value)} placeholder="xapp-..." style={{ flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: appTrimmed && !appValid ? '1px solid #ef4444' : '1px solid #ccc' }} />
                        </div>
                        {appTrimmed && !appValid && (
                          <div style={{ fontSize: 11, color: '#ef4444', marginLeft: 78 }}>App token must start with <code>xapp-</code></div>
                        )}
                        <button
                          disabled={!canSave || channelBusy === 'slack'}
                          onClick={async () => {
                            setChannelBusy('slack')
                            setChannelError(null)
                            try {
                              await channelStatus.connectGenericChannel('slack', { botToken: botTrimmed, appToken: appTrimmed })
                              setSlackBotToken('')
                              setSlackAppToken('')
                            } catch (err: any) { setChannelError(`Slack: ${err?.message || err}`) }
                            finally { setChannelBusy(null) }
                          }}
                          style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', alignSelf: 'flex-end', opacity: !canSave ? 0.5 : 1 }}
                        >
                          {channelBusy === 'slack' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                        )
                      })()}
                      <div className="ClawdChannelGuideNote">
                        Create a Slack App at <strong>api.slack.com/apps</strong>. Under <em>OAuth &amp; Permissions</em>, add bot scopes and install to get the Bot Token (<code style={{ fontSize: 11 }}>xoxb-</code>). Under <em>Basic Information &gt; App-Level Tokens</em>, create a token with <code style={{ fontSize: 11 }}>connections:write</code> scope to get the App Token (<code style={{ fontSize: 11 }}>xapp-</code>).
                      </div>
                    </div>
                  )}
                  {channelStatus.genericChannels.slack?.configured && (
                    <ChannelAllowlistSection channel="slack" isConnected={true} />
                  )}
                </div>
              </div>

              {/* ── Discord ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'discord' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.genericChannels.discord?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'discord' ? null : 'discord')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--discord">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">Discord</div>
                  {channelStatus.genericChannels.discord?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.genericChannels.discord?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    {channelStatus.genericChannels.discord?.configured && (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--disconnect"
                        disabled={channelBusy === 'discord'}
                        onClick={async () => {
                          setChannelBusy('discord')
                          setChannelError(null)
                          try { await channelStatus.disconnectGenericChannel('discord') }
                          catch (err: any) { setChannelError(`Discord: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'discord' ? 'Working...' : 'Disconnect'}
                      </button>
                    )}
                  </div>
                  {!channelStatus.genericChannels.discord?.configured && (() => {
                    const discordTrimmed = discordBotToken.trim()
                    // Discord tokens are 3 base64 segments separated by dots, typically 50+ chars
                    const discordValid = !discordTrimmed || (discordTrimmed.length >= 50 && discordTrimmed.includes('.'))
                    return (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">Connect Discord</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        Enter your Discord Bot Token:
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" value={discordBotToken} onChange={e => setDiscordBotToken(e.target.value)} placeholder="MTIz..." style={{ flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: discordTrimmed && !discordValid ? '1px solid #ef4444' : '1px solid #ccc' }} />
                        <button
                          disabled={!discordTrimmed || !discordValid || channelBusy === 'discord'}
                          onClick={async () => {
                            setChannelBusy('discord')
                            setChannelError(null)
                            try {
                              await channelStatus.connectGenericChannel('discord', { token: discordTrimmed })
                              setDiscordBotToken('')
                            } catch (err: any) { setChannelError(`Discord: ${err?.message || err}`) }
                            finally { setChannelBusy(null) }
                          }}
                          style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !discordTrimmed || !discordValid ? 0.5 : 1 }}
                        >
                          {channelBusy === 'discord' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      {discordTrimmed && !discordValid && (
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                          This doesn't look like a Discord bot token. Tokens are long strings with dots (e.g. MTIz...abc.def.ghi).
                        </div>
                      )}
                      <div className="ClawdChannelGuideNote">
                        Create a bot at <strong>discord.com/developers/applications</strong>, enable Message Content Intent, then copy the bot token.
                      </div>
                    </div>
                    )
                  })()}
                  {channelStatus.genericChannels.discord?.configured && (
                    <ChannelAllowlistSection channel="discord" isConnected={true} />
                  )}
                </div>
              </div>

              {/* ── Signal ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'signal' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.genericChannels.signal?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'signal' ? null : 'signal')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--signal">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">Signal</div>
                  {channelStatus.genericChannels.signal?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.genericChannels.signal?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    {channelStatus.genericChannels.signal?.configured ? (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--disconnect"
                        disabled={channelBusy === 'signal'}
                        onClick={async () => {
                          setChannelBusy('signal')
                          setChannelError(null)
                          try { await channelStatus.disconnectGenericChannel('signal') }
                          catch (err: any) { setChannelError(`Signal: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'signal' ? 'Working...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                        disabled={channelBusy === 'signal' || signalLinking}
                        onClick={async () => {
                          setChannelBusy('signal')
                          setChannelError(null)
                          try {
                            // Auto-check and install signal-cli if needed
                            let cliStatus = signalCliStatus
                            if (!cliStatus) {
                              cliStatus = await checkSignalCli()
                              setSignalCliStatus(cliStatus)
                            }
                            if (!cliStatus.installed) {
                              setSignalCliInstalling(true)
                              cliStatus = await installSignalCli()
                              setSignalCliStatus(cliStatus)
                              setSignalCliInstalling(false)
                              if (!cliStatus.installed) {
                                setChannelError(`Signal: ${cliStatus.message || 'Failed to install signal-cli'}`)
                                return
                              }
                            }
                            // Auto-generate QR link
                            setSignalLinking(true)
                            setSignalRegMode('link')
                            const result = await signalLink(cliStatus.cli_path || 'signal-cli')
                            if (result.success && result.link_uri) {
                              setSignalLinkUri(result.link_uri)
                            } else {
                              setChannelError(`Signal: ${result.message || 'Failed to generate QR link'}`)
                            }
                          } catch (err: any) {
                            setChannelError(`Signal: ${err?.message || err}`)
                          } finally {
                            setChannelBusy(null)
                            setSignalLinking(false)
                            setSignalCliInstalling(false)
                          }
                        }}
                      >
                        {signalCliInstalling ? 'Installing signal-cli...' : signalLinking ? 'Generating QR...' : channelBusy === 'signal' ? 'Working...' : 'Connect'}
                      </button>
                    )}
                  </div>

                  {/* QR code shown inline immediately after clicking Connect */}
                  {signalLinkUri && !channelStatus.genericChannels.signal?.configured && (
                    <div className="ClawdChannelGuide" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: '#334155', marginBottom: 8, fontWeight: 500 }}>
                        Scan with Signal on your phone
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textAlign: 'left' }}>
                        Open Signal &rarr; <strong>Settings</strong> &rarr; <strong>Linked Devices</strong> &rarr; <strong>Link New Device</strong>, then scan:
                      </div>
                      <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                        <QRCodeSVG value={signalLinkUri} size={200} level="M" />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textAlign: 'left' }}>
                          After scanning, enter your Signal phone number to finish setup:
                        </div>
                        {(() => {
                          const phoneTrimmed = signalPhoneNumber.trim()
                          const phoneValid = !phoneTrimmed || /^\+\d{7,15}$/.test(phoneTrimmed)
                          return (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input
                                type="text"
                                value={signalPhoneNumber}
                                onChange={e => setSignalPhoneNumber(e.target.value)}
                                placeholder="+1234567890"
                                style={{ flex: 1, padding: '6px 10px', fontSize: 13, borderRadius: 4, border: phoneTrimmed && !phoneValid ? '1px solid #ef4444' : '1px solid #ccc' }}
                              />
                              <button
                                disabled={!phoneTrimmed || !phoneValid || channelBusy === 'signal'}
                                onClick={async () => {
                                  setChannelBusy('signal')
                                  setChannelError(null)
                                  try {
                                    await channelStatus.connectGenericChannel('signal', {
                                      phoneNumber: phoneTrimmed,
                                      cliPath: signalCliStatus!.cli_path || 'signal-cli',
                                    })
                                    setSignalPhoneNumber('')
                                    setSignalRegMode('choose')
                                    setSignalRegDone(false)
                                    setSignalLinkUri(null)
                                  } catch (err: any) { setChannelError(`Signal: ${err?.message || err}`) }
                                  finally { setChannelBusy(null) }
                                }}
                                style={{ padding: '6px 16px', fontSize: 13, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 500, opacity: !phoneTrimmed || !phoneValid ? 0.5 : 1 }}
                              >
                                {channelBusy === 'signal' ? 'Connecting...' : 'Done'}
                              </button>
                            </div>
                          )
                        })()}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => { navigator.clipboard.writeText(signalLinkUri!); }}
                          style={{ padding: '4px 10px', fontSize: 11, background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                          Copy Link URI
                        </button>
                        <button
                          onClick={() => { setSignalRegMode('sms'); setSignalLinkUri(null); }}
                          style={{ padding: '4px 10px', fontSize: 11, background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
                        >
                          Register new number instead
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SMS registration flow (alternative) */}
                  {signalRegMode === 'sms' && !channelStatus.genericChannels.signal?.configured && (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">Register via SMS</div>
                      {!signalVerifying ? (
                        <div>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                            Enter a phone number to register as a new Signal account.
                            {signalNeedsCaptcha && (
                              <span style={{ color: '#f59e0b' }}>
                                {' '}Captcha required — complete the captcha and paste the token below.
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                            <input type="text" value={signalPhoneNumber} onChange={e => setSignalPhoneNumber(e.target.value)} placeholder="+1234567890" style={{ flex: 1, padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }} />
                          </div>
                          {signalNeedsCaptcha && (
                            <div style={{ marginBottom: 6 }}>
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                                1. Open <a href="https://signalcaptchas.org/registration/generate.html" target="_blank" rel="noopener" style={{ color: '#2563eb' }}>signalcaptchas.org</a> in your browser<br />
                                2. Complete the captcha<br />
                                3. Right-click "Open Signal" and copy the link (starts with signalcaptcha://)
                              </div>
                              <input type="text" value={signalCaptchaToken} onChange={e => setSignalCaptchaToken(e.target.value)} placeholder="signalcaptcha://..." style={{ width: '100%', padding: '4px 8px', fontSize: 11, border: '1px solid #ccc', borderRadius: 4, fontFamily: 'monospace' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              disabled={!signalPhoneNumber.trim() || signalRegistering || (signalNeedsCaptcha && !signalCaptchaToken.trim())}
                              onClick={async () => {
                                setSignalRegistering(true)
                                setChannelError(null)
                                try {
                                  const result = await signalRegister(signalCliStatus!.cli_path || 'signal-cli', signalPhoneNumber.trim(), signalNeedsCaptcha ? signalCaptchaToken.trim() : undefined)
                                  if (result.success) {
                                    if (result.captcha_required) { setSignalNeedsCaptcha(true) }
                                    else { setSignalVerifying(true); setSignalNeedsCaptcha(false) }
                                  } else { setChannelError(`Signal: ${result.message || 'Registration failed'}`) }
                                } catch (err: any) { setChannelError(`Signal: ${err?.message || err}`) }
                                finally { setSignalRegistering(false) }
                              }}
                              style={{ padding: '4px 12px', fontSize: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !signalPhoneNumber.trim() ? 0.5 : 1 }}
                            >
                              {signalRegistering ? 'Sending SMS...' : 'Send verification SMS'}
                            </button>
                            <button onClick={() => { setSignalRegMode('link'); setSignalNeedsCaptcha(false); setSignalCaptchaToken('') }} style={{ padding: '4px 12px', fontSize: 12, background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}>
                              Back to QR link
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 11, color: '#4caf50', marginBottom: 6 }}>SMS sent to {signalPhoneNumber}. Enter the verification code:</div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                            <input type="text" value={signalVerifyCode} onChange={e => setSignalVerifyCode(e.target.value)} placeholder="123-456" style={{ flex: 1, padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, fontFamily: 'monospace', letterSpacing: 2 }} />
                            <button
                              disabled={!signalVerifyCode.trim() || channelBusy === 'signal'}
                              onClick={async () => {
                                setChannelBusy('signal')
                                setChannelError(null)
                                try {
                                  const result = await signalVerify(signalCliStatus!.cli_path || 'signal-cli', signalPhoneNumber.trim(), signalVerifyCode.trim().replace(/-/g, ''))
                                  if (result.success) {
                                    // After SMS verify, auto-connect the channel
                                    await channelStatus.connectGenericChannel('signal', { phoneNumber: signalPhoneNumber.trim(), cliPath: signalCliStatus!.cli_path || 'signal-cli' })
                                    setSignalVerifyCode('')
                                    setSignalRegMode('choose')
                                    setSignalVerifying(false)
                                  } else { setChannelError(`Signal: ${result.message || 'Verification failed'}`) }
                                } catch (err: any) { setChannelError(`Signal: ${err?.message || err}`) }
                                finally { setChannelBusy(null) }
                              }}
                              style={{ padding: '4px 12px', fontSize: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !signalVerifyCode.trim() ? 0.5 : 1 }}
                            >
                              {channelBusy === 'signal' ? 'Verifying...' : 'Verify & Connect'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* How-to guide when not connected and no QR showing */}
                  {!channelStatus.genericChannels.signal?.configured && !signalLinkUri && signalRegMode !== 'sms' && (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to connect Signal</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Click <strong>Connect</strong> above. Knapsack will install signal-cli (if needed) and show a QR code.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>On your phone, open <strong>Signal &rarr; Settings &rarr; Linked Devices &rarr; Link New Device</strong> and scan the QR code.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">3</span>
                          <span>Enter your phone number and click <strong>Done</strong>.</span>
                        </li>
                      </ol>
                      <div className="ClawdChannelGuideNote">
                        Knapsack links as a companion device, just like Signal Desktop. Your phone stays the primary device.
                      </div>
                    </div>
                  )}

                  {channelStatus.genericChannels.signal?.configured && (
                    <>
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">How to use Signal</div>
                      <ol className="ClawdChannelGuideSteps">
                        <li>
                          <span className="ClawdChannelGuideNum">1</span>
                          <span>Send a message to yourself on Signal, or have someone message you.</span>
                        </li>
                        <li>
                          <span className="ClawdChannelGuideNum">2</span>
                          <span>Your Knapsack AI assistant will automatically read and reply.</span>
                        </li>
                      </ol>
                    </div>
                    <ChannelAllowlistSection channel="signal" isConnected={true} />
                    </>
                  )}
                </div>
              </div>

              {/* ── IRC ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'irc' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.genericChannels.irc?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'irc' ? null : 'irc')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--irc">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-3 12H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1zm0-3H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">IRC</div>
                  {channelStatus.genericChannels.irc?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.genericChannels.irc?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    {channelStatus.genericChannels.irc?.configured && (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--disconnect"
                        disabled={channelBusy === 'irc'}
                        onClick={async () => {
                          setChannelBusy('irc')
                          setChannelError(null)
                          try { await channelStatus.disconnectGenericChannel('irc') }
                          catch (err: any) { setChannelError(`IRC: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'irc' ? 'Working...' : 'Disconnect'}
                      </button>
                    )}
                  </div>
                  {!channelStatus.genericChannels.irc?.configured && (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">Connect IRC</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                        <input type="text" value={ircConfig.server} onChange={e => setIrcConfig(c => ({ ...c, server: e.target.value }))} placeholder="Server (e.g. irc.libera.chat)" style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }} />
                        <input type="text" value={ircConfig.nick} onChange={e => setIrcConfig(c => ({ ...c, nick: e.target.value }))} placeholder="Nickname" style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }} />
                        <input type="text" value={ircConfig.channel} onChange={e => setIrcConfig(c => ({ ...c, channel: e.target.value }))} placeholder="Channel (e.g. #general)" style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4 }} />
                      </div>
                      <button
                        disabled={!ircConfig.server.trim() || !ircConfig.nick.trim() || channelBusy === 'irc'}
                        onClick={async () => {
                          setChannelBusy('irc')
                          setChannelError(null)
                          try {
                            await channelStatus.connectGenericChannel('irc', {
                              server: ircConfig.server.trim(),
                              nick: ircConfig.nick.trim(),
                              channels: ircConfig.channel.trim() ? [ircConfig.channel.trim()] : [],
                            })
                            setIrcConfig({ server: '', nick: '', channel: '' })
                          } catch (err: any) { setChannelError(`IRC: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                        style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !ircConfig.server.trim() || !ircConfig.nick.trim() ? 0.5 : 1 }}
                      >
                        {channelBusy === 'irc' ? 'Saving...' : 'Save'}
                      </button>
                      <div className="ClawdChannelGuideNote">
                        Connects to an IRC server. Your assistant will join the specified channel and respond to messages.
                      </div>
                    </div>
                  )}
                  {channelStatus.genericChannels.irc?.configured && (
                    <ChannelAllowlistSection channel="irc" isConnected={true} />
                  )}
                </div>
              </div>

              {/* ── Google Chat ── */}
              <div className={`ClawdAccordionItem ${expandedChannel === 'googlechat' ? 'ClawdAccordionItem--open' : ''} ${channelStatus.genericChannels.googlechat?.configured ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => setExpandedChannel(expandedChannel === 'googlechat' ? null : 'googlechat')}>
                  <div className="ClawdChannelCardIcon ClawdChannelCardIcon--googlechat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.74.5 3.37 1.35 4.77L2 22l5.23-1.35C8.63 21.5 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                  </div>
                  <div className="ClawdAccordionTitle">Google Chat</div>
                  {channelStatus.genericChannels.googlechat?.configured && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdAccordionActions">
                    {channelStatus.genericChannels.googlechat?.configured ? (
                      <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                    ) : (
                      <div className="ClawdChannelCardStatus">Not connected</div>
                    )}
                    {channelStatus.genericChannels.googlechat?.configured && (
                      <button
                        className="ClawdChannelCardAction ClawdChannelCardAction--disconnect"
                        disabled={channelBusy === 'googlechat'}
                        onClick={async () => {
                          setChannelBusy('googlechat')
                          setChannelError(null)
                          try { await channelStatus.disconnectGenericChannel('googlechat') }
                          catch (err: any) { setChannelError(`Google Chat: ${err?.message || err}`) }
                          finally { setChannelBusy(null) }
                        }}
                      >
                        {channelBusy === 'googlechat' ? 'Working...' : 'Disconnect'}
                      </button>
                    )}
                  </div>
                  {!channelStatus.genericChannels.googlechat?.configured && (
                    <div className="ClawdChannelGuide">
                      <div className="ClawdChannelGuideTitle">Connect Google Chat</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        Enter your Google Chat webhook URL:
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={googleChatWebhook}
                          onChange={e => setGoogleChatWebhook(e.target.value)}
                          placeholder="https://chat.googleapis.com/v1/spaces/..."
                          style={{
                            flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4,
                            border: googleChatWebhook.trim() && !googleChatWebhook.trim().startsWith('https://chat.googleapis.com/')
                              ? '1px solid #ef4444' : '1px solid #ccc',
                          }}
                        />
                        <button
                          disabled={!googleChatWebhook.trim() || channelBusy === 'googlechat' || (!!googleChatWebhook.trim() && !googleChatWebhook.trim().startsWith('https://chat.googleapis.com/'))}
                          onClick={async () => {
                            setChannelBusy('googlechat')
                            setChannelError(null)
                            try {
                              await channelStatus.connectGenericChannel('googlechat', { webhookUrl: googleChatWebhook.trim() })
                              setGoogleChatWebhook('')
                            } catch (err: any) { setChannelError(`Google Chat: ${err?.message || err}`) }
                            finally { setChannelBusy(null) }
                          }}
                          style={{ padding: '4px 12px', fontSize: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !googleChatWebhook.trim() || (googleChatWebhook.trim() && !googleChatWebhook.trim().startsWith('https://chat.googleapis.com/')) ? 0.5 : 1 }}
                        >
                          {channelBusy === 'googlechat' ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      {googleChatWebhook.trim() && !googleChatWebhook.trim().startsWith('https://chat.googleapis.com/') && (
                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                          URL must start with https://chat.googleapis.com/
                        </div>
                      )}
                      <div className="ClawdChannelGuideNote">
                        Create a webhook in Google Chat: open a Space, click the dropdown arrow, select <strong>Manage webhooks</strong>, then copy the webhook URL.
                      </div>
                    </div>
                  )}
                  {channelStatus.genericChannels.googlechat?.configured && (
                    <ChannelAllowlistSection channel="googlechat" isConnected={true} />
                  )}
                </div>
              </div>
            </div>

            {channelError && (
              <div className="ClawdChannelsPanelError">
                {channelError}
                <button className="ClawdChannelErrorDismiss" onClick={() => setChannelError(null)}>×</button>
              </div>
            )}
            {channelStatus.error && (
              <div className="ClawdChannelsPanelError">{channelStatus.error}</div>
            )}
          </div>
          <div className="ClawdChannelsPanelFooter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>All messaging credentials stay on your device. Nothing is sent to external servers.</span>
            <button
              style={{ fontSize: 11, color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
              onClick={async () => {
                try {
                  const { runChannelDiagnostics } = await import('src/api/channels')
                  const diag = await runChannelDiagnostics()
                  const parts: string[] = []
                  parts.push(`Model: ${diag.model ?? 'NOT SET'}`)
                  parts.push(`API Key: ${diag.hasApiKey ? diag.apiKeyProvider : 'NONE'}`)
                  parts.push(`Channels in config: ${diag.configuredChannels.join(', ') || 'none'}`)
                  if (diag.issues.length) parts.push(`\nIssues:\n  - ${diag.issues.join('\n  - ')}`)
                  if (diag.repairs.length) parts.push(`\nAuto-repairs:\n  - ${diag.repairs.join('\n  - ')}`)
                  if (!diag.issues.length && !diag.repairs.length) parts.push('\nNo issues found.')
                  alert(parts.join('\n'))
                  if (diag.repairs.length) channelStatus.refresh()
                } catch (e: any) {
                  alert(`Diagnostics failed: ${e.message}`)
                }
              }}
            >Diagnose</button>
          </div>
        </div>
      )}

      {showKeyPrompt && (
        <div className="ClawdChannelsPanel">
          <div className="ClawdChannelsPanelHeader">
            <h3>{hasCompletedOnboarding ? 'AI Provider Settings' : 'Welcome to Knapsack'}</h3>
            <button onClick={() => {
              setShowKeyPrompt(false)
              localStorage.setItem(ONBOARDING_VERSION_STORAGE, APP_VERSION)
            }}>×</button>
          </div>

          {/* ── Tab bar: Providers | Token Costs ── */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
            <button
              onClick={() => setModelPickerTab('providers')}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: modelPickerTab === 'providers' ? 600 : 400,
                color: modelPickerTab === 'providers' ? '#1e293b' : '#94a3b8', background: 'none', border: 'none',
                borderBottom: modelPickerTab === 'providers' ? '2px solid #6366f1' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}
            >
              Providers
            </button>
            <button
              onClick={() => setModelPickerTab('costs')}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: modelPickerTab === 'costs' ? 600 : 400,
                color: modelPickerTab === 'costs' ? '#1e293b' : '#94a3b8', background: 'none', border: 'none',
                borderBottom: modelPickerTab === 'costs' ? '2px solid #6366f1' : '2px solid transparent',
                cursor: 'pointer', marginBottom: -1,
              }}
            >
              Token Costs
            </button>
          </div>

          {/* ── Token Costs tab ── */}
          {modelPickerTab === 'costs' && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <TokenCostsView />
            </div>
          )}

          {/* ── Providers tab ── */}
          {modelPickerTab === 'providers' && (
          <div className="ClawdChannelsPanelBody">
            <p className="ClawdChannelsPanelIntro">
              {hasCompletedOnboarding
                ? 'Review or change your AI provider and API key.'
                : 'Choose your AI provider and enter your API key to get started.'}
              {' '}Your key is stored locally and never shared.
            </p>

            <div className="ClawdChannelAccordion">
              {/* ── Cloud providers ── */}
              {PROVIDERS.filter(p => p.id !== 'ollama').map(p => {
                const isOpen = selectedProvider === p.id
                const isConfirmedActive = confirmedProvider === p.id

                // ── Knapsack (no API key — uses Knapsack account) ──
                if (p.id === 'knapsack') {
                  return (
                    <div key="knapsack" className={`ClawdAccordionItem ${isOpen ? 'ClawdAccordionItem--open' : ''} ${isConfirmedActive ? 'ClawdAccordionItem--connected' : ''}`}>
                      <button className="ClawdAccordionHeader" onClick={() => setSelectedProvider('knapsack')}>
                        <div className="ClawdAccordionTitle">{p.name}</div>
                        <span className="ClawdAccordionDesc">{p.description}</span>
                        {isConfirmedActive && (
                          <span className="ClawdAccordionCheck">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                        )}
                        <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <div className="ClawdAccordionBody">
                        {knapsackEmail ? (
                          <>
                            <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>
                              Signed in as <strong>{knapsackEmail}</strong>
                            </p>
                            <div className="ClawdAccordionActions">
                              <button
                                className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                                onClick={async () => {
                                  if (confirmedProvider === 'knapsack') return
                                  setSavingKey(true)
                                  try {
                                    await apiPost('/api/clawd/service/set-api-key', {
                                      provider: 'knapsack',
                                      key: '',
                                    })
                                    setSelectedProvider('knapsack')
                                    setConfirmedProvider('knapsack')
                                    localStorage.setItem(ACTIVE_PROVIDER_STORAGE, 'knapsack')
                                    setSavedProviderKeys(prev => ({ ...prev, knapsack: true }))
                                    pushAssistant('Switched to Knapsack.')
                                  } catch {}
                                  setSavingKey(false)
                                }}
                                disabled={savingKey || confirmedProvider === 'knapsack'}
                              >
                                {savingKey ? 'Switching...' : confirmedProvider === 'knapsack' ? 'Active' : 'Use Knapsack'}
                              </button>
                              <button
                                className="ClawdChannelCardAction"
                                style={{ marginLeft: 8, opacity: 0.7 }}
                                onClick={async () => {
                                  try {
                                    const res = await apiPost<{ ok: boolean; fallback_provider?: string }>(
                                      '/api/clawd/service/knapsack-disconnect', {}
                                    )
                                    const next = (res?.fallback_provider || 'openai') as Provider
                                    setSelectedProvider(next)
                                    setConfirmedProvider(next)
                                    localStorage.setItem(ACTIVE_PROVIDER_STORAGE, next)
                                  } catch {}
                                  setKnapsackEmail('')
                                  setKnapsackConnectError(null)
                                }}
                                disabled={savingKey}
                              >
                                Disconnect
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {knapsackConnectError && (
                              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '8px 10px' }}>
                                {knapsackConnectError}
                              </p>
                            )}
                            {isKnapsackConnecting ? (
                              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                                Waiting for sign-in from your browser…{' '}
                                <button
                                  style={{ background: 'none', border: 'none', color: '#c54841', cursor: 'pointer', padding: 0, fontSize: 12, textDecoration: 'underline' }}
                                  onClick={() => setIsKnapsackConnecting(false)}
                                >
                                  Cancel
                                </button>
                              </p>
                            ) : (
                              <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                                Sign in with your Knapsack account to use the cloud AI — no API key needed.
                              </p>
                            )}
                            <div className="ClawdAccordionActions">
                              <button
                                className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                                disabled={isKnapsackConnecting}
                                onClick={() => {
                                  setIsKnapsackConnecting(true)
                                  setKnapsackConnectError(null)
                                  const callbackUrl = encodeURIComponent('http://127.0.0.1:8897/api/auth/knapsack-callback')
                                  const studioBase = import.meta.env.VITE_KN_STUDIO_SERVER || 'https://studio.knapsack.ai'
                                  const studioUrl = `${studioBase}/desktop-connect?callback=${callbackUrl}`
                                  shellOpen(studioUrl).catch(() => {
                                    window.open(studioUrl, '_blank')
                                  })
                                }}
                              >
                                {isKnapsackConnecting ? 'Waiting…' : 'Connect with Knapsack'}
                              </button>
                            </div>
                            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>
                              A browser window will open. Sign in and click "Connect Desktop" — you'll be redirected back automatically.
                            </p>
                          </>
                        )}
                        <label className="ClawdKeyPromptLabel">Model tier</label>
                        <div className="ClawdModelSelector">
                          {KNAPSACK_MODELS.map(model => (
                            <button
                              key={model.id}
                              className={`ClawdModelOption${selectedKnapsackModel === model.id ? ' selected' : ''}`}
                              onClick={() => {
                                setSelectedKnapsackModel(model.id)
                                localStorage.setItem(KNAPSACK_MODEL_STORAGE, model.id)
                              }}
                              disabled={savingKey}
                            >
                              <span className="ClawdModelName">{model.name}</span>
                              <span className="ClawdModelDesc">{model.description}</span>
                            </button>
                          ))}
                        </div>
                        <div className="ClawdAccordionActions">
                          <button
                            className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                            onClick={async () => {
                              setSavingKey(true)
                              try {
                                await apiPost('/api/clawd/service/set-api-key', { provider: 'knapsack', key: knapsackEmail || '', model: selectedKnapsackModel })
                                setSelectedProvider('knapsack')
                                setConfirmedProvider('knapsack')
                                localStorage.setItem(ACTIVE_PROVIDER_STORAGE, 'knapsack')
                                setSavedProviderKeys(prev => ({ ...prev, knapsack: true }))
                                pushAssistant(`Switched to Knapsack (${KNAPSACK_MODELS.find(m => m.id === selectedKnapsackModel)?.name || selectedKnapsackModel}).`)
                              } catch {}
                              setSavingKey(false)
                            }}
                            disabled={savingKey}
                          >
                            {savingKey ? 'Switching...' : isConfirmedActive ? 'Active' : 'Use Knapsack'}
                          </button>
                        </div>
                        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>
                          Need credits?{' '}
                          <a href="https://studio.knapsack.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#c54841' }}>
                            studio.knapsack.ai
                          </a>
                        </p>
                      </div>
                    </div>
                  )
                }

                const models = p.id === 'openai' ? OPENAI_MODELS
                  : p.id === 'anthropic' ? ANTHROPIC_MODELS
                  : p.id === 'gemini' ? GEMINI_MODELS
                  : p.id === 'xai' ? XAI_MODELS
                  : p.id === 'openrouter' ? OPENROUTER_MODELS
                  : GROQ_MODELS
                const modelValue = p.id === 'openai' ? selectedModel
                  : p.id === 'anthropic' ? selectedAnthropicModel
                  : p.id === 'gemini' ? selectedGeminiModel
                  : p.id === 'xai' ? selectedXaiModel
                  : p.id === 'openrouter' ? selectedOpenRouterModel
                  : selectedGroqModel
                const setModelValue = p.id === 'openai' ? setSelectedModel
                  : p.id === 'anthropic' ? setSelectedAnthropicModel
                  : p.id === 'gemini' ? setSelectedGeminiModel
                  : p.id === 'xai' ? setSelectedXaiModel
                  : p.id === 'openrouter' ? setSelectedOpenRouterModel
                  : setSelectedGroqModel

                return (
                  <div key={p.id} className={`ClawdAccordionItem ${isOpen ? 'ClawdAccordionItem--open' : ''} ${isConfirmedActive ? 'ClawdAccordionItem--connected' : ''}`}>
                    <button className="ClawdAccordionHeader" onClick={() => { setSelectedProvider(p.id); setApiKey(''); setEditingProviderKey(false) }}>
                      <div className="ClawdAccordionTitle">{p.name}</div>
                      <span className="ClawdAccordionDesc">{p.description}</span>
                      {isConfirmedActive && (
                        <span className="ClawdAccordionCheck">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      )}
                      <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div className="ClawdAccordionBody">
                      {savedProviderKeys[p.id] && !apiKey.trim() && !editingProviderKey ? (
                        <>
                          <div className="ClawdKeySavedRow">
                            <span className="ClawdKeySavedBadge">Key saved</span>
                            <span className="ClawdKeySavedHint">{keyHints[p.id] || p.keyPrefix + '...'}</span>
                          </div>
                          <label className="ClawdKeyPromptLabel">Model</label>
                          <div className="ClawdModelSelector">
                            {models.map(model => (
                              <button
                                key={model.id}
                                className={`ClawdModelOption${modelValue === model.id ? ' selected' : ''}`}
                                onClick={async () => {
                                  const newModel = model.id
                                  setModelValue(newModel)
                                  const storageKey = p.id === 'openai' ? OPENAI_MODEL_STORAGE
                                    : p.id === 'anthropic' ? ANTHROPIC_MODEL_STORAGE
                                    : p.id === 'gemini' ? GEMINI_MODEL_STORAGE
                                    : p.id === 'xai' ? XAI_MODEL_STORAGE
                                    : p.id === 'openrouter' ? OPENROUTER_MODEL_STORAGE
                                    : GROQ_MODEL_STORAGE
                                  localStorage.setItem(storageKey, newModel)
                                  if (isConfirmedActive) {
                                    try {
                                      await apiPost('/api/clawd/service/set-api-key', { provider: p.id, model: newModel })
                                      const modelName = models.find(m => m.id === newModel)?.name || newModel
                                      pushAssistant(`Switched to ${modelName}.`)
                                    } catch {}
                                  }
                                }}
                                disabled={savingKey}
                              >
                                <span className="ClawdModelName">{model.name}</span>
                                <span className="ClawdModelDesc">{model.description}</span>
                              </button>
                            ))}
                          </div>
                          <div className="ClawdAccordionActions">
                            <button
                              className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                              onClick={() => switchProviderModel(p.id, isConfirmedActive)}
                              disabled={savingKey}
                            >
                              {savingKey ? 'Switching...' : isConfirmedActive ? 'Active' : 'Select ' + p.name}
                            </button>
                            <button
                              className="ClawdChannelCardAction ClawdChannelCardAction--secondary"
                              onClick={() => { setApiKey(''); setEditingProviderKey(true) }}
                            >
                              Change Key
                            </button>
                          </div>
                          <p className="ClawdKeyPromptHelp">
                            Get your API key at{' '}
                            <a href={p.helpUrl} target="_blank" rel="noopener noreferrer">
                              {p.helpUrl.replace('https://', '')}
                            </a>
                          </p>
                        </>
                      ) : (
                        <>
                          <label className="ClawdKeyPromptLabel">{p.name} API Key</label>
                          <input
                            type="password"
                            value={apiKey.trim()}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder={keyHints[p.id] || p.keyPrefix + '...'}
                            disabled={savingKey}
                            className="ClawdAccordionInput"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') saveApiKey() }}
                          />
                          <label className="ClawdKeyPromptLabel">Model</label>
                          <div className="ClawdModelSelector">
                            {models.map(model => (
                              <button
                                key={model.id}
                                className={`ClawdModelOption${modelValue === model.id ? ' selected' : ''}`}
                                onClick={() => setModelValue(model.id)}
                                disabled={savingKey}
                              >
                                <span className="ClawdModelName">{model.name}</span>
                                <span className="ClawdModelDesc">{model.description}</span>
                              </button>
                            ))}
                          </div>
                          <div className="ClawdAccordionActions">
                            <button
                              className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                              onClick={saveApiKey}
                              disabled={savingKey || !apiKey.trim()}
                            >
                              {savingKey ? 'Saving...' : 'Save & Enable'}
                            </button>
                            {savedProviderKeys[p.id] && (
                              <button
                                className="ClawdChannelCardAction ClawdChannelCardAction--secondary"
                                onClick={() => { setApiKey(''); setEditingProviderKey(false) }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <p className="ClawdKeyPromptHelp">
                            Get your API key at{' '}
                            <a href={p.helpUrl} target="_blank" rel="noopener noreferrer">
                              {p.helpUrl.replace('https://', '')}
                            </a>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* ── Ollama (local) ── */}
              <div className={`ClawdAccordionItem ${selectedProvider === 'ollama' ? 'ClawdAccordionItem--open' : ''} ${selectedProvider === 'ollama' ? 'ClawdAccordionItem--connected' : ''}`}>
                <button className="ClawdAccordionHeader" onClick={() => { setSelectedProvider('ollama'); setApiKey(''); setEditingProviderKey(false) }}>
                  <div className="ClawdAccordionTitle">Ollama</div>
                  <span className="ClawdAccordionDesc">Local models — free, private</span>
                  {selectedProvider === 'ollama' && (
                    <span className="ClawdAccordionCheck">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                  <svg className="ClawdAccordionChevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="ClawdAccordionBody">
                  <div className="ClawdOllamaStatus">
                    {ollamaRunning === null ? (
                      <span className="ClawdOllamaStatusChecking">Checking for Ollama...</span>
                    ) : ollamaRunning ? (
                      <span className="ClawdOllamaStatusOk">
                        <span className="ClawdOllamaStatusDot ok" />
                        Ollama is running
                      </span>
                    ) : (
                      <span className="ClawdOllamaStatusErr">
                        <span className="ClawdOllamaStatusDot err" />
                        Ollama not detected
                      </span>
                    )}
                  </div>

                  {ollamaRunning === false && (
                    <div className="ClawdOllamaInstall">
                      <p>Ollama runs AI models locally on your machine — free, private, no API key needed.</p>
                      <a href="https://ollama.com/download" target="_blank" rel="noopener noreferrer" className="ClawdOllamaInstallBtn">Download Ollama</a>
                      <p className="ClawdOllamaInstallHint">
                        After installing, launch Ollama and come back here.{' '}
                        <button className="ClawdOllamaRetry" onClick={() => {
                          setOllamaRunning(null)
                          apiGet<{ running: boolean }>('/api/knapsack/ollama/status')
                            .then(s => {
                              setOllamaRunning(s.running)
                              if (s.running) {
                                apiGet<{ success: boolean; models: Array<{ name: string; parameter_size?: string }> }>('/api/knapsack/ollama/models')
                                  .then(m => { if (m.success) setOllamaModels(m.models) })
                              }
                            })
                            .catch(() => setOllamaRunning(false))
                        }}>Check again</button>
                      </p>
                    </div>
                  )}

                  {ollamaRunning && ollamaModels.length > 0 && (
                    <>
                      <label className="ClawdKeyPromptLabel">Your Models</label>
                      <div className="ClawdModelSelector">
                        {ollamaModels.map(model => (
                          <button
                            key={model.name}
                            className={`ClawdModelOption${selectedOllamaModel === model.name ? ' selected' : ''}`}
                            onClick={() => setSelectedOllamaModel(model.name)}
                            disabled={savingKey}
                          >
                            <span className="ClawdModelName">{model.name}</span>
                            <span className="ClawdModelDesc">{model.parameter_size || 'Local model'}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {ollamaRunning && ollamaModels.length === 0 && !ollamaPulling && (
                    <>
                      <label className="ClawdKeyPromptLabel">Download a Model</label>
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>No models installed yet. Pick one to download:</p>
                      <div className="ClawdModelSelector">
                        {OLLAMA_SUGGESTED_MODELS.map(model => (
                          <button key={model.id} className="ClawdModelOption" onClick={() => pullOllamaModel(model.id)}>
                            <span className="ClawdModelName">{model.name}</span>
                            <span className="ClawdModelDesc">{model.description} ({model.size})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {ollamaPulling && (
                    <div className="ClawdOllamaPullProgress">
                      <label className="ClawdKeyPromptLabel">Downloading...</label>
                      <div className="ClawdOllamaProgressBar">
                        <div className="ClawdOllamaProgressFill" style={{ width: `${ollamaPullPercent ?? 0}%` }} />
                      </div>
                      <span className="ClawdOllamaProgressText">
                        {ollamaPullPercent !== null ? `${ollamaPullPercent}% — ` : ''}{ollamaPullProgress}
                      </span>
                    </div>
                  )}

                  {ollamaRunning && ollamaModels.length > 0 && !ollamaPulling && (
                    <>
                      <label className="ClawdKeyPromptLabel" style={{ marginTop: 8 }}>Download More Models</label>
                      <div className="ClawdModelSelector">
                        {OLLAMA_SUGGESTED_MODELS
                          .filter(s => !ollamaModels.some(m => m.name.startsWith(s.id.split(':')[0])))
                          .map(model => (
                          <button key={model.id} className="ClawdModelOption" onClick={() => pullOllamaModel(model.id)}>
                            <span className="ClawdModelName">{model.name}</span>
                            <span className="ClawdModelDesc">{model.description} ({model.size})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="ClawdAccordionActions">
                    <button
                      className="ClawdChannelCardAction ClawdChannelCardAction--connect"
                      onClick={saveOllamaProvider}
                      disabled={savingKey || !ollamaRunning || !selectedOllamaModel}
                    >
                      {savingKey ? 'Saving...' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Extra Providers (env-var based) ── */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>More Providers</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Models auto-selected by OpenClaw</span>
              </div>
              {[
                { id: 'minimax', name: 'MiniMax', description: 'M2.5 (SOTA coding + agents), M2.1', envVar: 'MINIMAX_API_KEY', helpUrl: 'https://platform.minimax.io' },
                { id: 'zai', name: 'ZAI (GLM)', description: 'GLM-5 (745B, SOTA open-source), GLM-4.7', envVar: 'ZAI_API_KEY', helpUrl: 'https://open.bigmodel.cn' },
                { id: 'huggingface', name: 'Hugging Face', description: '200K+ models via Inference API', envVar: 'HF_TOKEN', helpUrl: 'https://huggingface.co/settings/tokens' },
              ].map(ep => {
                const epStatus = extraProviderStatuses[ep.id]
                const isEditing = editingExtraProvider === ep.id
                return (
                  <div key={ep.id} style={{ padding: '8px 4px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{ep.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{ep.description}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {epStatus?.has_key && (
                          <span style={{ fontSize: 10, padding: '2px 6px', background: '#dcfce7', color: '#16a34a', borderRadius: 8, fontWeight: 500 }}>Connected</span>
                        )}
                        {epStatus?.has_key && !isEditing && (
                          <button
                            onClick={async () => {
                              try {
                                await apiPost('/api/clawd/service/delete-extra-provider-key', { env_var: ep.envVar })
                                setExtraProviderStatuses(prev => ({ ...prev, [ep.id]: { has_key: false } }))
                              } catch { /* ignore */ }
                            }}
                            style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        )}
                        {!isEditing ? (
                          <button
                            onClick={() => { setEditingExtraProvider(ep.id); setExtraProviderKey('') }}
                            style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {epStatus?.has_key ? 'Change key' : 'Add key'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingExtraProvider(null)}
                            style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <input
                          type="password"
                          value={extraProviderKey}
                          onChange={e => setExtraProviderKey(e.target.value)}
                          placeholder="Paste your API key..."
                          onKeyDown={e => {
                            if (e.key === 'Enter' && extraProviderKey.trim()) {
                              (async () => {
                                try {
                                  await apiPost('/api/clawd/service/set-api-key', { key: extraProviderKey.trim(), provider: ep.id, env_var: ep.envVar })
                                  setExtraProviderStatuses(prev => ({ ...prev, [ep.id]: { has_key: true, key_hint: extraProviderKey.trim().slice(-4) } }))
                                  setEditingExtraProvider(null)
                                  setExtraProviderKey('')
                                } catch { /* ignore */ }
                              })()
                            }
                          }}
                          style={{ flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid #ccc' }}
                          autoFocus
                        />
                        <button
                          disabled={!extraProviderKey.trim()}
                          onClick={async () => {
                            try {
                              await apiPost('/api/clawd/service/set-api-key', { key: extraProviderKey.trim(), provider: ep.id, env_var: ep.envVar })
                              setExtraProviderStatuses(prev => ({ ...prev, [ep.id]: { has_key: true, key_hint: extraProviderKey.trim().slice(-4) } }))
                              setEditingExtraProvider(null)
                              setExtraProviderKey('')
                            } catch { /* ignore */ }
                          }}
                          style={{ padding: '4px 10px', fontSize: 11, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: !extraProviderKey.trim() ? 0.5 : 1 }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                    {isEditing && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        Get your key at{' '}
                        <a href={ep.helpUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                          {ep.helpUrl.replace('https://', '')}
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Coding Agent preference ── */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 16, paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Coding Agent</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, maxWidth: 280 }}>
                    Which CLI to use for autonomous coding tasks. "Auto" picks based on which API key is saved.
                  </div>
                </div>
                <select
                  value={preferredCodingAgent}
                  onChange={async e => {
                    const val = e.target.value
                    setPreferredCodingAgent(val)
                    localStorage.setItem(CODING_AGENT_STORAGE, val)
                    try {
                      await apiPost('/api/clawd/service/set-api-key', { key: '', preferred_coding_agent: val || null })
                    } catch { /* ignore — preference is still stored locally */ }
                  }}
                  style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Auto-detect</option>
                  <option value="claude">Claude Code (Anthropic)</option>
                  <option value="codex">Codex (OpenAI)</option>
                  <option value="gemini">Gemini CLI (Google)</option>
                  <option value="grok">Grok Code Fast (xAI)</option>
                  <option value="opencode">OpenCode</option>
                </select>
              </div>
            </div>

            {/* ── Background AI toggle ── */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 16, paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Background AI</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, maxWidth: 280 }}>
                    Proactive notifications (email reminders, meeting alerts). Always uses the cheapest model for your provider. Does not affect chat or messaging channels.
                  </div>
                </div>
                <button
                  onClick={toggleBackgroundAi}
                  disabled={backgroundAiLoading || backgroundAiEnabled === null}
                  style={{
                    position: 'relative', width: 36, height: 20, borderRadius: 10, border: 'none',
                    background: backgroundAiEnabled ? '#22c55e' : '#d1d5db', cursor: 'pointer',
                    transition: 'background 0.2s', flexShrink: 0,
                    opacity: backgroundAiLoading ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    display: 'block', width: 14, height: 14, borderRadius: 7, background: '#fff',
                    transition: 'transform 0.2s',
                    transform: backgroundAiEnabled ? 'translateX(18px)' : 'translateX(3px)',
                    marginTop: 3,
                  }} />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

    </div>
  )
}
