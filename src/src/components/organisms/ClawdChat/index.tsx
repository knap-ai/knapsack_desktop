import './style.scss'

import { useEffect, useMemo, useState, useCallback, memo, useRef, type ReactNode } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { open } from '@tauri-apps/api/shell'
import { emit, listen as tauriListen } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { useChannelStatus } from 'src/hooks/channels/useChannelStatus'

// Prompt action prefix used by the AI to embed executable actions in messages.
// Format in raw AI text: [Label](knapsack://prompt/Detailed instruction)
// We strip these from the markdown and render them as numbered clickable buttons.
// NOTE: A simple regex like /\[...\]\(knapsack:\/\/prompt\/([^)]*)\)/ breaks when
// the prompt text contains parentheses (e.g. "(1) do X, (2) do Y").
// Instead we parse with balanced-parenthesis counting.

type PromptAction = { label: string; prompt: string }

// All recognized prompt link prefixes — the AI may use any of these forms
const PROMPT_MARKERS = ['knapsack://prompt/', 'knapsack://prompt=']

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

    // Check for "](knapsack://prompt/" or "](knapsack://prompt=" immediately after "]"
    const afterBracket = md.slice(bracketClose + 1)
    // Must start with "(" then a prompt marker
    const markerContent = afterBracket.startsWith('(') ? afterBracket.slice(1) : ''
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
    const parenStart = bracketClose + 1 // position of "("
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
    const prompt = md.slice(parenStart + 1 + matchedMarker.length, parenEnd)

    actions.push({ label, prompt })
    result += `**▶ ${actions.length}. ${label}**`
    i = parenEnd + 1
  }

  return { cleaned: result, actions }
}

// Convert raw API/JSON error messages into user-friendly text
function friendlyError(raw: string): string {
  if (!raw) return 'Something went wrong. Please try again.'
  const lower = raw.toLowerCase()
  // OpenAI quota / billing errors
  if (lower.includes('insufficient_quota') || lower.includes('exceeded your current quota')) {
    return '⚠️ **API quota exceeded.** Your OpenAI account has run out of credits or hit its spending limit. Check your billing at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing).'
  }
  // Rate limit (but not quota)
  if (lower.includes('rate_limit') || (lower.includes('429') && !lower.includes('insufficient_quota'))) {
    return '⏳ **Rate limited.** Too many requests — please wait a moment and try again.'
  }
  // Invalid API key
  if (lower.includes('invalid_api_key') || lower.includes('incorrect api key')) {
    return '🔑 **Invalid API key.** Please check your key in Settings and try again.'
  }
  // Auth error
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return '🔒 **Authentication failed.** Your API key may be invalid or expired. Update it in Settings.'
  }
  // Model not found / access
  if (lower.includes('model_not_found') || lower.includes('does not exist') || lower.includes('no access')) {
    return '⚠️ **Model not available.** Your API key may not have access to this model. Try switching to a different model in Settings.'
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
  if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('fetch failed')) {
    return '🌐 **Connection error.** Unable to reach the AI service. Check your internet connection and try again.'
  }
  // Timeout
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return '⏰ **Request timed out.** The AI took too long to respond. Try a simpler request or try again.'
  }
  // Tool loop exceeded
  if (lower.includes('tool loop exceeded')) {
    return '🔄 **Task too complex.** The AI hit its action limit for this request. Try breaking it into smaller steps.'
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
  // If still very long or contains raw JSON, truncate
  if (cleaned.length > 200 || cleaned.includes('{')) {
    return '⚠️ Something went wrong with the AI request. Please try again or check your API key in Settings.'
  }
  return cleaned
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
}

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
  openai_key_hint?: string
  anthropic_key_hint?: string
  gemini_key_hint?: string
}

type SkillInfo = {
  name: string
  description?: string
  emoji?: string
  eligible?: boolean
  enabled?: boolean
  source?: string // built-in, OpenClaw, managed, workspace, extra
  missing?: string[] // missing requirements
  installOptions?: Array<{ id: string; label: string; command?: string }>
  primaryEnv?: string
  userInvocable?: boolean
  externalApi?: boolean // true if this skill sends data to external APIs
  homepage?: string // URL for skill detail page (from gateway)
}

type Provider = 'openai' | 'anthropic' | 'gemini' | 'groq'

type ProviderOption = {
  id: Provider
  name: string
  description: string
  keyPrefix: string
  helpUrl: string
}

const PROVIDERS: ProviderOption[] = [
  { id: 'openai', name: 'OpenAI', description: 'GPT-5.2, GPT-4o, o3', keyPrefix: 'sk-', helpUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude Opus 4.6, Sonnet 4.5, Haiku 4.5', keyPrefix: 'sk-ant-', helpUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'gemini', name: 'Google', description: 'Gemini 3 Pro, 3 Flash, 2.5 Pro', keyPrefix: 'AI', helpUrl: 'https://aistudio.google.com/apikey' },
  { id: 'groq', name: 'Groq', description: 'Llama 4, Kimi K2, DeepSeek R1 — ultra-fast', keyPrefix: 'gsk_', helpUrl: 'https://console.groq.com/keys' },
]

type AnthropicModelOption = {
  id: string
  name: string
  description: string
}

const ANTHROPIC_MODELS: AnthropicModelOption[] = [
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: 'Most intelligent, best for agents and coding' },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Best balance of speed and intelligence' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest, near-frontier at low cost' },
  { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', description: 'Previous flagship, excellent for long tasks' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Reliable legacy model' },
]

type GeminiModelOption = {
  id: string
  name: string
  description: string
}

const GEMINI_MODELS: GeminiModelOption[] = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Most intelligent, state-of-the-art reasoning' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast frontier-class performance' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Stable, excellent reasoning and coding' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient with thinking' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Optimized for speed and low cost' },
]

type GroqModelOption = {
  id: string
  name: string
  description: string
}

const GROQ_MODELS: GroqModelOption[] = [
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', description: 'Multimodal MoE, 10M context window' },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick', description: 'Largest Llama 4, 128 experts, 1M context' },
  { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2', description: '1T params, agentic coding, 256K context' },
  { id: 'qwen/qwen-3-32b', name: 'Qwen 3 32B', description: 'Latest Qwen, strong reasoning' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill', description: 'Reasoning model, great for logic' },
  { id: 'qwen-qwq-32b', name: 'Qwen QwQ 32B', description: 'Reasoning model, chain-of-thought' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Versatile general-purpose model' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Ultra-fast, lightweight' },
]

// In Tauri dev, the UI runs on Vite (1420) while the Rust server listens on 8897.
// In production, the UI is loaded from file:// but the Rust server is still 8897.
const API_BASE = 'http://localhost:8897'


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
const TONE_STORAGE = 'moltbot_tone'
const VOICE_MODE_STORAGE = 'moltbot_voice_mode'
const CHAT_HISTORY_STORAGE = 'moltbot_chat_history'
const AUTONOMY_MODE_STORAGE = 'moltbot_autonomy_mode'
const PROACTIVE_MODE_STORAGE = 'moltbot_proactive_mode'
const ADVANCED_MODE_STORAGE = 'moltbot_advanced_mode'
const ONBOARDING_VERSION_STORAGE = 'moltbot_onboarding_version'

// The current app version — bump this when you want to re-show the key prompt
const APP_VERSION = '0.9.46'

// Available OpenAI models
type OpenAIModelOption = {
  id: string
  name: string
  description: string
}

const OPENAI_MODELS: OpenAIModelOption[] = [
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    description: 'Most intelligent model, best for complex tasks',
  },
  {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    description: 'Extended thinking for harder problems',
  },
  {
    id: 'o3',
    name: 'o3 (Reasoning)',
    description: 'Reasoning model for complex logic',
  },
  {
    id: 'o3-mini',
    name: 'o3 Mini',
    description: 'Fast reasoning model',
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

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path))
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
  isRecording: boolean
  isTranscribing: boolean
  voiceEnabled: boolean
  attachedFiles: Array<{ name: string; type: string; content: string; preview?: string }>
  onSend: (text: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onStartRecording: () => void
  onStopRecording: () => void
  onToggleVoice: () => void
  onStopGeneration: () => void
}

const ChatInputBar = memo(function ChatInputBar(props: ChatInputBarProps) {
  const {
    busy, isRecording, isTranscribing, voiceEnabled,
    attachedFiles, onSend, onFileSelect, onRemoveFile,
    onStartRecording, onStopRecording, onToggleVoice, onStopGeneration,
  } = props
  const [input, setInput] = useState('')
  const debugPerf = useMemo(() => localStorage.getItem('KS_DEBUG_CHAT_PERF') === 'true', [])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Easter egg commands supported in chat input
  const CHAT_COMMANDS: Record<string, string> = {
    '/morning': 'kn_trigger_morning_briefing',
    '/emails': 'kn_trigger_email_check',
    '/prep': 'kn_trigger_meeting_prep',
    '/fu': 'kn_trigger_post_meeting',
    '/testnotif': 'kn_trigger_test_notification',
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text && attachedFiles.length === 0) return

    // Intercept slash commands before sending to LLM
    const cmd = CHAT_COMMANDS[text.toLowerCase()]
    if (cmd) {
      console.log(`🔔 Triggering command: ${text}`)
      emit(cmd, {})
      setInput('')
      return
    }

    onSend(text)
    setInput('')
    // Reset textarea height after send
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Auto-resize textarea to fit content
  const autoResize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [])

  // Allow parent to trigger send with specific text (for prompt actions, voice, etc.)
  // via the onSend callback directly — the parent calls onSend(text).

  return (
    <>
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
                handleSend()
              }
            }}
            placeholder={isRecording ? '🎤 Listening...' : 'Ask me to browse, search, read pages, or automate tasks...'}
            disabled={busy || isRecording}
            rows={1}
          />
          {/* Voice mode toggle - always visible inside input like ChatGPT */}
          <button
            className={`ClawdVoiceToggle ${voiceEnabled ? 'active' : ''} ${isRecording ? 'recording' : ''} ${isTranscribing ? 'transcribing' : ''}`}
            onClick={voiceEnabled && !isRecording ? (isRecording ? onStopRecording : onStartRecording) : onToggleVoice}
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
          <button className="ClawdStopBtn" onClick={onStopGeneration}>
            ⏹️ Stop
          </button>
        ) : (
          <button disabled={!input.trim() && attachedFiles.length === 0} onClick={handleSend}>
            Send
          </button>
        )}
      </div>
    </>
  )
})

interface ClawdChatProps {
  showActivityPanel?: boolean
  onToggleActivity?: () => void
  onCloseActivity?: () => void
}

export default function ClawdChat({ showActivityPanel: externalActivityPanel, onToggleActivity, onCloseActivity }: ClawdChatProps = {}) {
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

  // Abort controller for stopping generation
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [health, setHealth] = useState<ServiceHealth | null>(null)
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null)

  // Onboarding state
  const [showKeyPrompt, setShowKeyPrompt] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(OPENAI_MODEL_STORAGE) || 'gpt-5.2'
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
  const [selectedProvider, setSelectedProvider] = useState<Provider>('openai')
  const [savingKey, setSavingKey] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [keyHints, setKeyHints] = useState<Record<string, string | undefined>>({})
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null)

  // Claude Code activity tracking — shows indicator when Claude Code is running
  const [claudeCodeActive, setClaudeCodeActive] = useState(false)
  const [claudeCodePrompt, setClaudeCodePrompt] = useState<string | null>(null)

  // Tone selection
  const [selectedTone, setSelectedTone] = useState<string>(() => {
    return localStorage.getItem(TONE_STORAGE) || 'snarky'
  })
  const [showToneSelector, setShowToneSelector] = useState(false)

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

  // Activity panel is now controlled by parent via props

  // Skills panel state
  const [showSkillsPanel, setShowSkillsPanel] = useState(false)
  const [showChannelsPanel, setShowChannelsPanel] = useState(false)
  const [channelBusy, setChannelBusy] = useState<string | null>(null)
  const [channelError, setChannelError] = useState<string | null>(null)
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)

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

  // Chat auto-scroll ref
  const chatBodyRef = useRef<HTMLDivElement | null>(null)

  // Voice silence detection refs
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Refs for callbacks that need to be called from other callbacks (avoids circular dependency)
  const doSendRef = useRef<((text: string) => Promise<void>) | null>(null)
  const pushAssistantRef = useRef<((text: string) => void) | null>(null)

  // Gateway service state — channel connection status
  const channelStatus = useChannelStatus(true, 15_000)
  const hasAnyChannel = !!(channelStatus.whatsapp?.linked || channelStatus.imessage?.configured)
  const showChannelBanner = msgs.every(m => m.id.startsWith('welcome-')) && !hasAnyChannel

  const welcomeMessages = useMemo(
    () => [
      {
        id: 'welcome-1',
        role: 'assistant' as Role,
        text: "Hi! I'm your AI browser assistant, powered by OpenClaw. I can browse the web for you, read pages, click buttons, fill forms, and more — all through natural conversation.",
        ts: Date.now(),
      },
      {
        id: 'welcome-2',
        role: 'assistant' as Role,
        text: "For your privacy and security: I always open a fresh browser instance. This means you'll need to sign in to any accounts you want me to access (Gmail, LinkedIn, etc). Your credentials are never stored or shared.",
        ts: Date.now() + 1,
        promptActions: [
          { label: 'Check my email & calendar to get started', prompt: SMART_PROMPT },
          { label: 'Check the latest AI news', prompt: NO_AUTH_PROMPT },
        ],
      },
    ],
    [],
  )

  const checkAndPromptForKey = useCallback(async () => {
    // Check if user already completed onboarding for THIS version
    const onboardedVersion = localStorage.getItem(ONBOARDING_VERSION_STORAGE)

    // Check backend for a valid key (single source of truth)
    try {
      const keyStatus = await apiGet<ApiKeyStatus>('/api/clawd/service/api-key-status')
      if (keyStatus.has_key) {
        setHasCompletedOnboarding(true)
        if (keyStatus.model) {
          setSelectedModel(keyStatus.model)
          localStorage.setItem(OPENAI_MODEL_STORAGE, keyStatus.model)
        }
        if (keyStatus.active_provider) {
          setSelectedProvider(keyStatus.active_provider as Provider)
        }
        // Store masked key hints for placeholders
        setKeyHints({
          openai: keyStatus.openai_key_hint,
          anthropic: keyStatus.anthropic_key_hint,
          gemini: keyStatus.gemini_key_hint,
        })
        // Also sync provider-specific models from the backend
        try {
          const fullKeys = await apiGet<{
            success: boolean
            anthropic_model?: string
            gemini_model?: string
            groq_model?: string
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
      ? "🔔 **Proactive mode enabled.** I'll send you background notifications — morning briefings, email alerts, meeting prep, and post-meeting follow-ups."
      : "🔕 **Reactive mode enabled.** Background notifications are off. I'll only respond when you ask. You can still trigger notifications manually with /morning, /emails, /prep, or /fu."
    )

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
        // Auto-send the transcribed text directly via doSend
        doSendRef.current?.(data.text)
      }
    } catch (e: any) {
      pushAssistantRef.current?.(`🎤 Transcription failed: ${e?.message || String(e)}`)
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  // File upload handlers
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: Array<{ name: string; type: string; content: string; preview?: string }> = []

    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/')) {
          // For images, create a base64 data URL for preview and content
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({
            name: file.name,
            type: file.type,
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
    // Reset input
    if (e.target) e.target.value = ''
  }, [])

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
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
          const dataUrl = await readFileAsDataURL(file)
          newFiles.push({ name: file.name, type: file.type, content: dataUrl, preview: dataUrl })
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
  }, [])

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
                newFiles.push({ name: fileName, type: mimeType, content: dataUrl, preview: dataUrl })
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
      const unlistenStarted = await tauriListen<{ processId: string; sessionId: string; prompt: string; cwd: string }>(
        'claude-code-started',
        (event) => {
          if (cancelled) return
          setClaudeCodeActive(true)
          setClaudeCodePrompt(event.payload.prompt)
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
    })()

    return () => {
      cancelled = true
      cleanups.forEach(fn => fn())
    }
  }, [])

  // Gateway service handler removed - channels UI removed in this version

  const saveApiKey = useCallback(async () => {
    if (!apiKey.trim()) return

    setSavingKey(true)
    try {
      const modelForProvider = selectedProvider === 'openai' ? selectedModel
        : selectedProvider === 'anthropic' ? selectedAnthropicModel
        : selectedProvider === 'gemini' ? selectedGeminiModel
        : selectedProvider === 'groq' ? selectedGroqModel
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
      }
      setShowKeyPrompt(false)
      setHasCompletedOnboarding(true)
      localStorage.setItem(ONBOARDING_VERSION_STORAGE, APP_VERSION)

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
        } else {
          modelName = GEMINI_MODELS.find(m => m.id === selectedGeminiModel)?.name || selectedGeminiModel
        }
        pushAssistant(`Great! I'm all set up with ${providerInfo?.name || selectedProvider} (${modelName}) and ready to help. Try asking me to browse a website!`)
      } catch (e: any) {
        pushAssistant(
          'API key saved! You can now enable the browser assistant using the Enable button above.',
        )
      }
    } catch (e: any) {
      pushAssistant(`Failed to save API key: ${e?.message || String(e)}. Please try again.`)
    } finally {
      setSavingKey(false)
    }
  }, [apiKey, selectedModel, selectedAnthropicModel, selectedGeminiModel, selectedGroqModel, selectedProvider])

  useEffect(() => {
    const init = async () => {
      // Only show welcome messages if no chat history exists
      if (msgs.length === 0) {
        setMsgs(welcomeMessages)
      }

      // Start the service on launch — only enable if not already running.
      // Avoid cycling (disable+enable) because SIGTERMing a healthy gateway
      // causes the browser to disconnect and triggers the restart loop.
      try {
        const s = await apiGet<ServiceStatus>('/api/clawd/service/status')
        setStatus(s)

        if (!s.running) {
          // Service is not running — start it
          await apiPost('/api/clawd/service/enable', { enabled: true })
          // Wait for service to start (browser Chrome process needs extra time)
          await new Promise(resolve => setTimeout(resolve, 4000))
        }

        // Refresh status after enabling
        await refreshStatus()

        // Poll for gateway/browser health — update the status indicators.
        // No auto-recovery: the LaunchAgent has KeepAlive=true so macOS
        // restarts clawdbot automatically if it crashes. Frontend-driven
        // cycling (disable+enable) was causing a SIGTERM restart loop.
        let gatewayAttempts = 0
        const maxFastAttempts = 20
        let lastHealthJson = ''
        let lastStatusJson = ''
        const pollGateway = async () => {
          gatewayAttempts++
          try {
            const h = await apiGet<ServiceHealth>('/api/clawd/service/health')
            const hJson = JSON.stringify(h)
            if (hJson !== lastHealthJson) {
              lastHealthJson = hJson
              setHealth(h)
            }
            // Also refresh service status periodically
            const s2 = await apiGet<ServiceStatus>('/api/clawd/service/status')
            const s2Json = JSON.stringify(s2)
            if (s2Json !== lastStatusJson) {
              lastStatusJson = s2Json
              setStatus(s2)
            }

            const isHealthy = h.gateway_ok && h.browser_ok
            if (!isHealthy && gatewayAttempts < maxFastAttempts) {
              // Gateway or browser not ready yet, retry quickly
              setTimeout(pollGateway, 1500)
            } else {
              // Connected or gave up fast polling - continue slow polling every 15s
              setTimeout(pollGateway, 15000)
            }
          } catch {
            if (gatewayAttempts < maxFastAttempts) {
              setTimeout(pollGateway, 1500)
            } else {
              setTimeout(pollGateway, 15000)
            }
          }
        }
        // Start polling for gateway
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [msgs, thinkingMessage])

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

  // Listen for notification insight messages from App.tsx notification handlers
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (text) pushAssistant(text)
    }
    window.addEventListener('clawd-push-assistant', handler)
    return () => window.removeEventListener('clawd-push-assistant', handler)
  }, [pushAssistant])

  const pushUser = (text: string) => {
    setMsgs(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text, ts: Date.now() }])
  }

  // Stop current generation
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setBusy(false)
      setThinkingMessage(null)
      pushAssistant('⏹️ Generation stopped.')
    }
  }, [abortController, pushAssistant])

  // Clear chat history and start fresh
  const clearHistory = useCallback(() => {
    localStorage.removeItem(CHAT_HISTORY_STORAGE)
    setMsgs(welcomeMessages)
  }, [welcomeMessages])

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
  const handleSendWithText = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Handle special "enable advanced and resend" action
    const advPrefix = '__enable_advanced_and_resend__'
    if (text.startsWith(advPrefix)) {
      const originalPrompt = decodeURIComponent(text.slice(advPrefix.length))
      // Enable advanced mode directly (skip warning dialog since user clicked the suggestion)
      setAdvancedMode(true)
      localStorage.setItem(ADVANCED_MODE_STORAGE, 'true')
      pushAssistant('⚡ **Advanced mode enabled.** Re-sending your request with shell access...')
      // Small delay to let state update, then re-send original prompt
      setTimeout(() => doSend(originalPrompt), 100)
      return
    }

    await doSend(text.trim())
  }, [])

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
        open(href).catch(err => console.error('Failed to open link:', err))
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
      // Auto-open Activity Panel if not already open
      if (!externalActivityPanelRef.current && onToggleActivityRef.current) {
        onToggleActivityRef.current()
      }
      window.dispatchEvent(new CustomEvent('run-in-terminal', { detail: { command: codeText.trim() } }))
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

  // Called by ChatInputBar (via onSend) or by handleSendWithText (prompt actions, voice)
  // Slash commands that trigger Tauri events instead of hitting the LLM
  const SLASH_COMMANDS: Record<string, string> = {
    '/morning': 'kn_trigger_morning_briefing',
    '/emails': 'kn_trigger_email_check',
    '/prep': 'kn_trigger_meeting_prep',
    '/fu': 'kn_trigger_post_meeting',
    '/testnotif': 'kn_trigger_test_notification',
  }

  const doSend = async (text: string) => {

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
        pushAssistant('Please enter your OpenAI API key first to get started.')
        return
      }
    }

    // Capture current attachments and clear them
    const currentAttachments = [...attachedFiles]
    setAttachedFiles([])

    // Show user message with attachment indicators
    const attachmentSummary = currentAttachments.length > 0
      ? `\n\n📎 *Attached: ${currentAttachments.map(f => f.name).join(', ')}*`
      : ''
    pushUser(text + attachmentSummary)

    // Parse "command args..." form
    const [rawCmd, ...rest] = text.split(/\s+/)
    const cmd = rawCmd.toLowerCase()

    setBusy(true)
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
      if (cmd === 'logs' || cmd === 'log') {
        const stream = (rest[0] || 'stderr').toLowerCase()
        const logs = await apiGet<{ success: boolean; text: string }>(
          `/api/clawd/service/logs?stream=${encodeURIComponent(stream)}&lines=250`,
        )
        pushAssistant(formatMaybeJson(logs.text || '(no logs)'))
        return
      }

      // NOTE: URLs are now passed through the LLM instead of being opened directly.
      // The LLM has navigate() and open_url() tools to handle URLs intelligently.
      // This allows users to say "go to google.com and search for X" and have it work.

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

      const thinkingInterval = setInterval(() => {
        thinkingIndex = (thinkingIndex + 1) % shuffled.length
        setThinkingMessage(shuffled[thinkingIndex])
      }, 2500)

      // Create abort controller for this request
      const controller = new AbortController()
      setAbortController(controller)

      try {
        // Get the current tone's system prompt addition
        const currentTone = TONE_OPTIONS.find(t => t.id === selectedTone)
        const tonePrompt = currentTone?.systemPromptAddition || ''

        // Check if this is the smart prompt - add skill recommendation request
        const isSmartPrompt = text === SMART_PROMPT
        const actualText = isSmartPrompt
          ? `${text}\n\nAfter checking my email and calendar, recommend 5 specific things I should do based on what you find. For each recommendation, include an action using this exact format: [Short Label](knapsack://prompt/Detailed instruction for what to do). These will be rendered as clickable buttons the user can tap to execute.`
          : text

        // Build request with optional attachments
        const requestBody: Record<string, any> = {
          text: actualText || 'Please analyze the attached files.',
          sessionId: 'ui',
          tone: selectedTone,
          tonePrompt,
          voiceMode: voiceEnabled, // Signal backend to be more concise for voice output
          autonomyMode, // 'assist' or 'autonomous' - controls how independent the agent is
          advancedMode, // When true, enables run_command tool for shell execution
        }

        // Add attachments if present
        if (currentAttachments.length > 0) {
          requestBody.attachments = currentAttachments.map(f => ({
            name: f.name,
            type: f.type,
            content: f.content,
          }))
        }

        const res = await fetch(apiUrl('/api/clawd/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        })

        if (!res.ok) {
          const errorText = await res.text().catch(() => '')
          throw new Error(errorText || `HTTP ${res.status}`)
        }

        const out = await res.json() as { ok?: boolean; reply?: string; error?: string; message?: string; model?: string; usage?: { inputTokens?: number; outputTokens?: number; costUsd?: number } }
        if (out.reply) {
          // Include model info so the user can see which model handled their request
          setMsgs(prev => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', text: out.reply!, ts: Date.now(), model: out.model },
          ])
        } else {
          pushAssistant(friendlyError(out.message || out.error || 'No reply'))
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          // User cancelled - already handled in stopGeneration
          return
        }
        throw e
      } finally {
        clearInterval(thinkingInterval)
        setThinkingMessage(null)
        setAbortController(null)
      }
    } catch (e: any) {
      pushAssistant(friendlyError(e?.message || String(e)))
    } finally {
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

  const statusLine = useMemo(() => {
    if (!status && !health) return <span>Checking Moltbot...</span>
    const parts: ReactNode[] = []
    if (status) {
      parts.push(
        <span key="svc" className={status.running ? 'status-ok' : 'status-warn'}>
          {status.running ? 'Service: running' : status.installed ? 'Service: installed' : 'Service: off'}
        </span>,
      )
    }
    if (health) {
      parts.push(
        <span key="gw" className={health.gateway_ok ? 'status-ok' : 'status-down'}>
          {health.gateway_ok ? 'Gateway: OK' : 'Gateway: down'}
        </span>,
      )
      parts.push(
        <span key="br" className={health.browser_ok ? 'status-ok' : 'status-down'}>
          {health.browser_ok ? 'Browser: OK' : 'Browser: down'}
        </span>,
      )
    } else if (status?.running) {
      // Health not loaded yet but service is running — show checking state
      parts.push(<span key="gw" className="status-warn">Gateway: checking...</span>)
      parts.push(<span key="br" className="status-warn">Browser: checking...</span>)
    }
    if (currentTargetId) parts.push(<span key="tab">Tab: {currentTargetId.slice(0, 12)}...</span>)
    return parts.reduce<ReactNode[]>((acc, part, i) => {
      if (i > 0) acc.push(<span key={`sep-${i}`}> | </span>)
      acc.push(part)
      return acc
    }, [])
  }, [status, health, currentTargetId])

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

  return (
    <div className="ClawdChatRoot">
      <div className="ClawdChatHeader">
        <div className="ClawdChatTitleRow">
          <img src="/assets/images/knap-logo-medium.png" alt="Knapsack" className="ClawdChatLogo" />
          <div className="ClawdChatTitleGroup">
            <h1 className="ClawdChatTitle">Knapsack Chat</h1>
            <p className="ClawdChatSubtitle">AI assistant powered by OpenClaw</p>
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
            className={`${showChannelsPanel ? 'toggle-on' : ''} ${hasAnyChannel ? 'channels-connected' : 'channels-disconnected'}`}
            title="Connect WhatsApp or iMessage"
          >
            {hasAnyChannel ? '💬 Channels' : '💬 Channels'}
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
          <button disabled={busy} onClick={() => { const opening = !showKeyPrompt; setShowKeyPrompt(opening); setShowSkillsPanel(false); if (opening && externalActivityPanel && onCloseActivity) onCloseActivity() }} className={showKeyPrompt ? 'toggle-on' : ''} title="Change AI provider, API key, or model">
            {selectedProvider === 'anthropic' ? (ANTHROPIC_MODELS.find(m => m.id === selectedAnthropicModel)?.name || 'Anthropic')
              : selectedProvider === 'gemini' ? (GEMINI_MODELS.find(m => m.id === selectedGeminiModel)?.name || 'Gemini')
              : selectedProvider === 'groq' ? (GROQ_MODELS.find(m => m.id === selectedGroqModel)?.name || 'Groq')
              : OPENAI_MODELS.find(m => m.id === selectedModel)?.name || 'OpenAI'}
          </button>
          <button disabled={busy} onClick={() => setShowToneSelector(true)}>
            Tone: {TONE_OPTIONS.find(t => t.id === selectedTone)?.name || 'Select'}
          </button>
          <button
            disabled={busy}
            onClick={toggleAdvancedMode}
            className={advancedMode ? 'toggle-advanced-on' : 'toggle-advanced-off'}
            title={advancedMode
              ? 'Advanced mode ON — shell commands enabled. Click to disable.'
              : 'Standard mode — click to enable shell commands.'}
          >
            {advancedMode ? '⚡ Advanced' : '▸ Standard'}
          </button>
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
            <p>Select how Moltbot should communicate with you:</p>
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
            <p>Advanced mode allows Moltbot to execute shell commands on your computer. This means it can:</p>
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
              className={`ClawdMsg ClawdMsg-${m.role} ${m.isClickable ? 'ClawdMsg-clickable' : ''}`}
              onClick={m.isClickable ? (e) => handleExampleClick(e, m.text) : undefined}
            >
              <div className="ClawdBubble">
                {m.isClickable ? (
                  <p>{m.text}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ChatLink, pre: ChatCodeBlock }}>{cleaned}</ReactMarkdown>
                )}
                {actions.length > 0 && (
                  <div className="ClawdPromptActions">
                    {actions.map((action, i) => (
                      <button
                        key={i}
                        className="ClawdPromptAction"
                        onClick={(e) => { e.stopPropagation(); handleSendWithText(action.prompt) }}
                      >
                        <span className="ClawdPromptActionNum">{i + 1}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                {m.model && m.role === 'assistant' && (
                  <div className="ClawdMsgModel">via {m.model}</div>
                )}
              </div>
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
        {/* Channel connection banner — shown in welcome area when no channels are connected */}
        {showChannelBanner && (
          <div className="ClawdMsg ClawdMsg-assistant">
            <div className="ClawdBubble ClawdChannelBanner">
              <p className="ClawdChannelBannerTitle">Connect a messaging channel</p>
              <p className="ClawdChannelBannerDesc">
                Link your WhatsApp or iMessage so your AI assistant can send and receive messages on your behalf.
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
        {thinkingMessage && (
          <div className="ClawdMsg ClawdMsg-assistant ClawdMsg-thinking">
            <div className="ClawdBubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ChatLink }}>{thinkingMessage}</ReactMarkdown>
            </div>
          </div>
        )}
        {claudeCodeActive && (
          <div className="ClawdMsg ClawdMsg-assistant ClawdMsg-claude-code">
            <div className="ClawdBubble ClawdBubble--claude-code">
              <div className="ClawdClaudeCodeIndicator">
                <span className="ClawdClaudeCodeIndicator__pulse" />
                <span className="ClawdClaudeCodeIndicator__label">Claude Code is working</span>
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

      <ChatInputBar
        busy={busy}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        voiceEnabled={voiceEnabled}
        attachedFiles={attachedFiles}
        onSend={stableDoSend}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeAttachedFile}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onToggleVoice={toggleVoiceOutput}
        onStopGeneration={stopGeneration}
      />
      </div>

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

            {/* ── WhatsApp ── */}
            <div className={`ClawdChannelCard ${channelStatus.whatsapp?.linked ? 'ClawdChannelCard--connected' : ''}`}>
              <div className="ClawdChannelCardIcon ClawdChannelCardIcon--whatsapp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div className="ClawdChannelCardInfo">
                <div className="ClawdChannelCardName">WhatsApp</div>
                {channelStatus.whatsapp?.linked ? (
                  <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                ) : channelStatus.whatsapp?.enabled ? (
                  <div className="ClawdChannelCardStatus">Enabled — scan QR code to link</div>
                ) : (
                  <div className="ClawdChannelCardStatus">Not connected</div>
                )}
              </div>
              <button
                className={`ClawdChannelCardAction ${channelStatus.whatsapp?.linked ? 'ClawdChannelCardAction--disconnect' : 'ClawdChannelCardAction--connect'}`}
                disabled={channelBusy === 'whatsapp'}
                onClick={async () => {
                  setChannelBusy('whatsapp')
                  setChannelError(null)
                  try {
                    if (channelStatus.whatsapp?.linked) {
                      await channelStatus.toggleWhatsApp(false)
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
                  : channelStatus.whatsapp?.linked ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            {channelStatus.whatsappLinking && !channelStatus.whatsappQrUrl && (
              <div className="ClawdChannelGuide" style={{ textAlign: 'center', padding: '20px 16px' }}>
                <div style={{ fontSize: 14, color: '#888' }}>Starting WhatsApp service and generating QR code...</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>This can take up to 10 seconds while the gateway restarts.</div>
              </div>
            )}
            {channelStatus.whatsapp?.linked ? (
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
            ) : (
              <div className="ClawdChannelGuide">
                {channelStatus.whatsappQrUrl && (
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
                    <span>{channelStatus.whatsappQrUrl ? 'Scan the QR code above.' : 'A QR code will appear above.'} On your phone, open <strong>WhatsApp → Settings → Linked Devices → Link a Device</strong>.</span>
                  </li>
                  <li>
                    <span className="ClawdChannelGuideNum">3</span>
                    <span>Scan the QR code with your phone camera. Once linked, this panel will update automatically.</span>
                  </li>
                </ol>
                <div className="ClawdChannelGuideNote">
                  Knapsack doesn't need your phone number — it links as a companion device, just like WhatsApp Web.
                  Your phone stays the primary device.
                </div>
              </div>
            )}

            {/* ── iMessage ── */}
            <div className={`ClawdChannelCard ${channelStatus.imessage?.configured ? 'ClawdChannelCard--connected' : ''}`}>
              <div className="ClawdChannelCardIcon ClawdChannelCardIcon--imessage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
              </div>
              <div className="ClawdChannelCardInfo">
                <div className="ClawdChannelCardName">iMessage</div>
                {channelStatus.imessage?.configured ? (
                  <div className="ClawdChannelCardStatus ClawdChannelCardStatus--ok">Connected</div>
                ) : channelStatus.imessage?.enabled ? (
                  <div className="ClawdChannelCardStatus">Enabled — needs Full Disk Access</div>
                ) : (
                  <div className="ClawdChannelCardStatus">Not connected (macOS only)</div>
                )}
              </div>
              <button
                className={`ClawdChannelCardAction ${channelStatus.imessage?.configured ? 'ClawdChannelCardAction--disconnect' : 'ClawdChannelCardAction--connect'}`}
                disabled={channelBusy === 'imessage'}
                onClick={async () => {
                  setChannelBusy('imessage')
                  setChannelError(null)
                  try {
                    if (channelStatus.imessage?.configured) {
                      await channelStatus.toggleIMessage(false)
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
              <div className="ClawdChannelGuide">
                <div className="ClawdChannelGuideTitle">How to use iMessage</div>
                <ol className="ClawdChannelGuideSteps">
                  <li>
                    <span className="ClawdChannelGuideNum">1</span>
                    <span>Send an iMessage to this Mac from any Apple device. Your assistant will see incoming messages and reply automatically.</span>
                  </li>
                  <li>
                    <span className="ClawdChannelGuideNum">2</span>
                    <span>You can also ask your assistant in this chat: <em>"Send an iMessage to [name/number]"</em>.</span>
                  </li>
                </ol>
                <div className="ClawdChannelGuideNote">
                  iMessage works locally on macOS only. Knapsack reads the Messages database on your Mac — nothing leaves your machine.
                </div>
              </div>
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
          <div className="ClawdChannelsPanelFooter">
            All messaging credentials stay on your Mac. Nothing is sent to external servers.
          </div>
        </div>
      )}

      {showKeyPrompt && (
        <div className="ClawdKeyPrompt">
          <div className="ClawdKeyPromptHeader">
            <h3>{hasCompletedOnboarding ? 'AI Provider Settings' : 'Welcome to Knapsack'}</h3>
            <button onClick={() => {
              setShowKeyPrompt(false)
              localStorage.setItem(ONBOARDING_VERSION_STORAGE, APP_VERSION)
            }}>×</button>
          </div>
          <div className="ClawdKeyPromptContent">
            <p>
              {hasCompletedOnboarding
                ? 'Review or change your AI provider and API key.'
                : 'Choose your AI provider and enter your API key to get started.'}
              {' '}Your key is stored locally and never shared.
            </p>

            <div className="ClawdProviderTabs">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  className={`ClawdProviderTab ${selectedProvider === p.id ? 'active' : ''}`}
                  onClick={() => { setSelectedProvider(p.id); setApiKey('') }}
                  disabled={savingKey}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <label className="ClawdKeyPromptLabel">
              {PROVIDERS.find(p => p.id === selectedProvider)?.name} API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={keyHints[selectedProvider] || PROVIDERS.find(p => p.id === selectedProvider)?.keyPrefix + '...'}
              disabled={savingKey}
              onKeyDown={e => {
                if (e.key === 'Enter') saveApiKey()
              }}
            />

            {selectedProvider === 'openai' && (
              <>
                <label className="ClawdKeyPromptLabel">Model</label>
                <div className="ClawdModelSelector">
                  {OPENAI_MODELS.map(model => (
                    <button
                      key={model.id}
                      className={`ClawdModelOption ${selectedModel === model.id ? 'selected' : ''}`}
                      onClick={() => setSelectedModel(model.id)}
                      disabled={savingKey}
                    >
                      <span className="ClawdModelName">{model.name}</span>
                      <span className="ClawdModelDesc">{model.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedProvider === 'anthropic' && (
              <>
                <label className="ClawdKeyPromptLabel">Model</label>
                <div className="ClawdModelSelector">
                  {ANTHROPIC_MODELS.map(model => (
                    <button
                      key={model.id}
                      className={`ClawdModelOption ${selectedAnthropicModel === model.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAnthropicModel(model.id)}
                      disabled={savingKey}
                    >
                      <span className="ClawdModelName">{model.name}</span>
                      <span className="ClawdModelDesc">{model.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedProvider === 'gemini' && (
              <>
                <label className="ClawdKeyPromptLabel">Model</label>
                <div className="ClawdModelSelector">
                  {GEMINI_MODELS.map(model => (
                    <button
                      key={model.id}
                      className={`ClawdModelOption ${selectedGeminiModel === model.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGeminiModel(model.id)}
                      disabled={savingKey}
                    >
                      <span className="ClawdModelName">{model.name}</span>
                      <span className="ClawdModelDesc">{model.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedProvider === 'groq' && (
              <>
                <label className="ClawdKeyPromptLabel">Model</label>
                <div className="ClawdModelSelector">
                  {GROQ_MODELS.map(model => (
                    <button
                      key={model.id}
                      className={`ClawdModelOption ${selectedGroqModel === model.id ? 'selected' : ''}`}
                      onClick={() => setSelectedGroqModel(model.id)}
                      disabled={savingKey}
                    >
                      <span className="ClawdModelName">{model.name}</span>
                      <span className="ClawdModelDesc">{model.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="ClawdKeyPromptActions">
              <button onClick={saveApiKey} disabled={savingKey || !apiKey.trim()}>
                {savingKey ? 'Saving...' : 'Save & Enable'}
              </button>
            </div>
            <p className="ClawdKeyPromptHelp">
              Get your API key at{' '}
              <a
                href={PROVIDERS.find(p => p.id === selectedProvider)?.helpUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedProvider === 'openai' && 'platform.openai.com/api-keys'}
                {selectedProvider === 'anthropic' && 'console.anthropic.com/settings/keys'}
                {selectedProvider === 'gemini' && 'aistudio.google.com/apikey'}
                {selectedProvider === 'groq' && 'console.groq.com/keys'}
              </a>
            </p>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
