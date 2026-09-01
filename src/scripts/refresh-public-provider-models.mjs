#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const WRITE = process.argv.includes('--write')
const CHECK = process.argv.includes('--check') || !WRITE

const ANTHROPIC_SOURCE_URLS = [
  'https://docs.anthropic.com/en/api/models-list',
  'https://docs.anthropic.com/en/docs/about-claude/models/overview',
]
const GEMINI_SOURCE_URL = 'https://ai.google.dev/gemini-api/docs/models'

const FAMILY_ORDER = ['fable', 'opus', 'sonnet', 'haiku']
const FAMILY_RANK = new Map(FAMILY_ORDER.map((family, index) => [family, index]))
const ANTHROPIC_MODEL_ID_PATTERN = /\bclaude-(fable|opus|sonnet|haiku)-\d[\da-z.-]*\b/gi

const ANTHROPIC_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/anthropicModels.ts')
const GEMINI_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/geminiModels.ts')
const OPENROUTER_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/openRouterModels.ts')
const XAI_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/xaiModels.ts')

function escapeSingleQuotes(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'knapsack-model-refresh/1.0',
      accept: 'text/html,application/xhtml+xml',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'knapsack-model-refresh/1.0',
      accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function canonicalAnthropicModelIdsFromHtml(html) {
  const ids = new Set()
  for (const match of html.matchAll(ANTHROPIC_MODEL_ID_PATTERN)) {
    const normalized = normalizeAnthropicModelId(match[0].toLowerCase())
    if (normalized) ids.add(normalized)
  }
  return ids
}

function anthropicFamilyFromModelId(modelId) {
  return modelId.split('-')[1] ?? 'opus'
}

function normalizeAnthropicModelId(modelId) {
  let normalized = modelId.toLowerCase()
  normalized = normalized.replace(/-v\d+$/, '')

  const family = anthropicFamilyFromModelId(normalized)
  const prefix = `claude-${family}-`
  const rest = normalized.slice(prefix.length)

  if (rest.includes('and-') || rest.includes('introductory-pricing')) {
    return null
  }

  if (family === 'fable') {
    if (!/^\d+(?:-\d+)?$/.test(rest)) return null
    return normalized
  }

  if (family === 'sonnet') {
    if (!/^\d+(?:-\d+)?(?:-\d{8})?$/.test(rest)) return null
  } else if (family === 'opus' || family === 'haiku') {
    if (!/^\d+-\d+(?:-\d{8})?$/.test(rest)) return null
  } else {
    return null
  }

  const datedAlias = rest.match(/^(\d+(?:-\d+)?)-\d{8}$/)
  if (datedAlias) {
    return `${prefix}${datedAlias[1]}`
  }

  return normalized
}

function anthropicNumericVersionParts(modelId) {
  const family = anthropicFamilyFromModelId(modelId)
  const withoutPrefix = modelId.replace(`claude-${family}-`, '')
  return withoutPrefix.split('-').map((segment) => {
    if (/^\d+$/.test(segment)) return Number(segment)
    const digits = segment.replace(/\D+/g, '')
    return digits ? Number(digits) : -1
  })
}

function compareAnthropicModelIds(a, b) {
  const familyDelta = (FAMILY_RANK.get(anthropicFamilyFromModelId(a)) ?? 99) - (FAMILY_RANK.get(anthropicFamilyFromModelId(b)) ?? 99)
  if (familyDelta !== 0) return familyDelta

  const aParts = anthropicNumericVersionParts(a)
  const bParts = anthropicNumericVersionParts(b)
  const maxLength = Math.max(aParts.length, bParts.length)
  for (let index = 0; index < maxLength; index += 1) {
    const delta = (bParts[index] ?? -1) - (aParts[index] ?? -1)
    if (delta !== 0) return delta
  }
  return a.localeCompare(b)
}

function anthropicDisplayVersion(modelId) {
  const family = anthropicFamilyFromModelId(modelId)
  const segments = modelId.replace(`claude-${family}-`, '').split('-')
  if (segments.length > 2 && /^\d{8}$/.test(segments.at(-1) ?? '')) {
    segments.pop()
  }
  return segments.join('.')
}

function anthropicDisplayName(modelId) {
  const family = anthropicFamilyFromModelId(modelId)
  const familyName = family.charAt(0).toUpperCase() + family.slice(1)
  return `Claude ${familyName} ${anthropicDisplayVersion(modelId)}`
}

function anthropicModelDescription(modelId, rankWithinFamily) {
  const family = anthropicFamilyFromModelId(modelId)
  if (family === 'fable') {
    return rankWithinFamily === 0
      ? 'Anthropic frontier flagship for advanced coding and long-running agentic work'
      : 'Earlier Fable release, still excellent for high-end agentic workloads'
  }
  if (family === 'opus') {
    return rankWithinFamily === 0
      ? 'Current Opus flagship, excellent for complex coding, reasoning, and vision'
      : 'Earlier Opus release, still excellent for complex tasks'
  }
  if (family === 'sonnet') {
    return rankWithinFamily === 0
      ? 'Best balance of speed and intelligence for most everyday work'
      : 'Earlier Sonnet release, strong for balanced coding and reasoning'
  }
  return rankWithinFamily === 0
    ? 'Fastest and most affordable Anthropic model'
    : 'Earlier Haiku release, optimized for low-latency affordable tasks'
}

function anthropicFamilyHeadline(ids, family) {
  const modelId = ids.find((candidate) => anthropicFamilyFromModelId(candidate) === family)
  if (!modelId) return null
  const familyName = family.charAt(0).toUpperCase() + family.slice(1)
  return `${familyName} ${anthropicDisplayVersion(modelId)}`
}

function buildAnthropicSource(ids) {
  const idsByFamily = new Map()
  for (const modelId of ids) {
    const family = anthropicFamilyFromModelId(modelId)
    const existing = idsByFamily.get(family) ?? []
    existing.push(modelId)
    idsByFamily.set(family, existing)
  }

  const anthropicModels = ids.map((modelId) => {
    const family = anthropicFamilyFromModelId(modelId)
    const familyIds = idsByFamily.get(family) ?? []
    return {
      id: modelId,
      name: anthropicDisplayName(modelId),
      description: anthropicModelDescription(modelId, familyIds.indexOf(modelId)),
      vision: true,
    }
  })

  const latestOpus = idsByFamily.get('opus')?.[0] ?? anthropicModels[0]?.id ?? 'claude-opus-4-8'
  const latestSonnet = idsByFamily.get('sonnet')?.[0] ?? 'claude-sonnet-5'
  const latestHaiku = idsByFamily.get('haiku')?.[0] ?? 'claude-haiku-4-5'
  const providerDescription = `Claude ${FAMILY_ORDER.map((family) => anthropicFamilyHeadline(ids, family)).filter(Boolean).join(', ')}`

  return `// AUTO-GENERATED by scripts/refresh-public-provider-models.mjs
// Do not edit this file by hand.

export type AnthropicModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export type KnapsackTierModelOption = {
  id: string
  name: string
  description: string
}

export const ANTHROPIC_MODELS: AnthropicModelOption[] = [
${anthropicModels.map((model) => `  { id: '${escapeSingleQuotes(model.id)}', name: '${escapeSingleQuotes(model.name)}', description: '${escapeSingleQuotes(model.description)}', vision: true },`).join('\n')}
]

export const DEFAULT_ANTHROPIC_MODEL = '${escapeSingleQuotes(latestOpus)}'

export const ANTHROPIC_PROVIDER_DESCRIPTION = '${escapeSingleQuotes(providerDescription)}'

export const KNAPSACK_ANTHROPIC_TIER_MODELS: KnapsackTierModelOption[] = [
  { id: 'anthropic/${escapeSingleQuotes(latestHaiku)}', name: 'Standard', description: 'Fast, efficient — great for everyday tasks' },
  { id: 'anthropic/${escapeSingleQuotes(latestSonnet)}', name: 'Plus', description: 'Balanced performance and capability' },
  { id: 'anthropic/${escapeSingleQuotes(latestOpus)}', name: 'Premium', description: 'Most powerful — best for complex work' },
]

export const DEFAULT_KNAPSACK_ANTHROPIC_MODEL = 'anthropic/${escapeSingleQuotes(latestHaiku)}'
`
}

const GEMINI_MODEL_ID_PATTERN = /\bgemini-\d+(?:\.\d+)?-(?:flash-lite|flash|pro)(?:-preview)?\b/gi

function geminiVersionParts(modelId) {
  const match = modelId.match(/^gemini-(\d+(?:\.\d+)?)-/)
  return (match?.[1] ?? '0').split('.').map(Number)
}

function compareGeminiVersions(a, b) {
  const aParts = geminiVersionParts(a)
  const bParts = geminiVersionParts(b)
  const length = Math.max(aParts.length, bParts.length)
  for (let index = 0; index < length; index += 1) {
    const delta = (bParts[index] ?? 0) - (aParts[index] ?? 0)
    if (delta !== 0) return delta
  }
  return a.localeCompare(b)
}

function geminiFamily(modelId) {
  if (modelId.includes('-flash-lite')) return 'flash-lite'
  if (modelId.includes('-flash')) return 'flash'
  return 'pro'
}

function geminiVersionNumber(modelId) {
  const [major = 0, minor = 0] = geminiVersionParts(modelId)
  return major + minor / 10
}

export function canonicalGeminiModelIdsFromHtml(html) {
  const discovered = new Set([...html.matchAll(GEMINI_MODEL_ID_PATTERN)].map((match) => match[0].toLowerCase()))

  const flash = [...discovered]
    .filter((id) => geminiFamily(id) === 'flash' && !id.endsWith('-preview') && geminiVersionNumber(id) >= 3.5)
    .sort(compareGeminiVersions)
    .slice(0, 3)
  const flashLite = [...discovered]
    .filter((id) => geminiFamily(id) === 'flash-lite' && !id.endsWith('-preview') && geminiVersionNumber(id) >= 3.1)
    .sort(compareGeminiVersions)
    .slice(0, 2)

  const proByVersion = new Map()
  for (const id of [...discovered]
    .filter((candidate) => geminiFamily(candidate) === 'pro' && geminiVersionNumber(candidate) >= 3.1)
    .sort(compareGeminiVersions)) {
    const version = geminiVersionParts(id).join('.')
    const existing = proByVersion.get(version)
    if (!existing || id.endsWith('-preview')) proByVersion.set(version, id)
  }
  const pro = [...proByVersion.values()].sort(compareGeminiVersions).slice(0, 1)

  const fallbacks = ['gemini-2.5-pro', 'gemini-2.5-flash'].filter((id) => discovered.has(id))
  return [...flash, ...pro, ...flashLite, ...fallbacks]
}

function geminiDisplayName(modelId) {
  const version = geminiVersionParts(modelId).join('.')
  const family = geminiFamily(modelId)
  const familyName = family === 'flash-lite' ? 'Flash Lite' : family === 'flash' ? 'Flash' : 'Pro'
  return `Gemini ${version} ${familyName}`
}

function geminiDescription(modelId, rankWithinFamily) {
  const family = geminiFamily(modelId)
  if (family === 'pro') return 'Most capable Gemini reasoning model for complex work'
  if (family === 'flash-lite') return rankWithinFamily === 0
    ? 'Latest cost-efficient Gemini model for high-volume tasks'
    : 'Earlier efficient Gemini model for high-volume tasks'
  if (geminiVersionNumber(modelId) === 2.5) return 'Stable, fast, and efficient with thinking'
  return rankWithinFamily === 0
    ? 'Latest fast Gemini model for general work and agent tasks'
    : 'Recent fast Gemini model for general work and agent tasks'
}

export function buildGeminiSource(ids) {
  const familyRanks = new Map()
  const models = ids.map((id) => {
    const family = geminiFamily(id)
    const rank = familyRanks.get(family) ?? 0
    familyRanks.set(family, rank + 1)
    return {
      id,
      name: geminiDisplayName(id),
      description: geminiDescription(id, rank),
    }
  })
  const providerDescription = models.slice(0, 4).map((model) => model.name.replace('Gemini ', '')).join(', ')

  return `// AUTO-GENERATED by scripts/refresh-public-provider-models.mjs
// Do not edit this file by hand.

export type GeminiModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export const GEMINI_MODELS: GeminiModelOption[] = [
${models.map((model) => `  { id: '${escapeSingleQuotes(model.id)}', name: '${escapeSingleQuotes(model.name)}', description: '${escapeSingleQuotes(model.description)}', vision: true },`).join('\n')}
]

export const GEMINI_PROVIDER_DESCRIPTION = 'Gemini ${escapeSingleQuotes(providerDescription)}'
`
}

function pickPresent(ids, candidates, fallback) {
  for (const candidate of candidates) {
    if (ids.has(candidate)) return candidate
  }
  return fallback
}

function buildOpenRouterSource(ids) {
  const choices = [
    {
      id: 'openrouter/auto',
      name: 'Auto (Smart Routing)',
      description: 'Automatically picks the best model for each request',
      vision: true,
    },
    {
      id: pickPresent(ids, ['openai/gpt-oss-120b:free', 'openai/gpt-oss-20b:free'], 'openai/gpt-oss-120b:free'),
      name: 'GPT-OSS (Free)',
      description: 'Free open-weight flagship with strong coding and tool use',
    },
    {
      id: pickPresent(ids, ['qwen/qwen3-coder:free', 'qwen/qwen3-next-80b-a3b-instruct:free'], 'qwen/qwen3-coder:free'),
      name: 'Qwen Coder (Free)',
      description: 'Free open-source coding model via OpenRouter',
    },
    {
      id: pickPresent(ids, ['meta-llama/llama-3.3-70b-instruct:free'], 'meta-llama/llama-3.3-70b-instruct:free'),
      name: 'Llama 3.3 70B (Free)',
      description: 'Free, versatile general-purpose open model',
    },
    {
      id: pickPresent(ids, ['deepseek/deepseek-v4-pro'], 'deepseek/deepseek-v4-pro'),
      name: 'DeepSeek V4 Pro (Paid)',
      description: 'Paid, strong open model for complex reasoning and coding',
    },
    {
      id: pickPresent(ids, ['deepseek/deepseek-v4-flash'], 'deepseek/deepseek-v4-flash'),
      name: 'DeepSeek V4 Flash (Paid)',
      description: 'Paid, fast 1M-context variant for agent loops',
    },
    {
      id: pickPresent(ids, ['anthropic/claude-opus-4.8', 'anthropic/claude-opus-4.7'], 'anthropic/claude-opus-4.8'),
      name: 'Claude Opus (Paid)',
      description: 'Paid Anthropic flagship via OpenRouter',
      vision: true,
    },
    {
      id: pickPresent(ids, ['openai/gpt-5.5', 'openai/gpt-5.4'], 'openai/gpt-5.5'),
      name: 'GPT-5 (Paid)',
      description: 'Paid OpenAI frontier model via OpenRouter',
      vision: true,
    },
  ]

  return `// AUTO-GENERATED by scripts/refresh-public-provider-models.mjs
// Do not edit this file by hand.

export type OpenRouterModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export const OPENROUTER_MODELS: OpenRouterModelOption[] = [
${choices.map((model) => `  { id: '${escapeSingleQuotes(model.id)}', name: '${escapeSingleQuotes(model.name)}', description: '${escapeSingleQuotes(model.description)}'${model.vision ? ', vision: true' : ''} },`).join('\n')}
]

export const DEFAULT_OPENROUTER_MODEL = '${escapeSingleQuotes(choices[1]?.id ?? 'openai/gpt-oss-120b:free')}'
`
}

function buildXaiSource(html) {
  const has = (needle) => html.includes(needle)
  const choices = [
    {
      id: has('grok-4.20-beta-latest-reasoning') ? 'grok-4.20-beta-latest-reasoning' : 'grok-4.20-reasoning-latest',
      name: 'Grok 4.20 Reasoning',
      description: 'Newest Grok reasoning model for complex work',
      vision: true,
    },
    {
      id: has('grok-4.20-beta-latest-non-reasoning') ? 'grok-4.20-beta-latest-non-reasoning' : 'grok-4.20-non-reasoning-latest',
      name: 'Grok 4.20 Fast',
      description: 'Fast Grok 4.20 variant for everyday tasks',
      vision: true,
    },
    {
      id: has('grok-code-fast-1') ? 'grok-code-fast-1' : 'grok-code-fast',
      name: 'Grok Code Fast 1',
      description: 'xAI coding model for fast agentic code work',
    },
    {
      id: has('grok-4.3-latest') ? 'grok-4.3-latest' : 'grok-4',
      name: 'Grok 4.3',
      description: 'Latest flagship general-purpose Grok model',
      vision: true,
    },
    {
      id: 'grok-4',
      name: 'Grok 4',
      description: 'Stable flagship Grok fallback',
    },
  ]

  return `// AUTO-GENERATED by scripts/refresh-public-provider-models.mjs
// Do not edit this file by hand.

export type XaiModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export const XAI_MODELS: XaiModelOption[] = [
${choices.map((model) => `  { id: '${escapeSingleQuotes(model.id)}', name: '${escapeSingleQuotes(model.name)}', description: '${escapeSingleQuotes(model.description)}'${model.vision ? ', vision: true' : ''} },`).join('\n')}
]
`
}

async function ensureFileContent(outputPath, nextSource) {
  const currentSource = await fs.readFile(outputPath, 'utf8').catch(() => '')
  if (CHECK) {
    if (currentSource !== nextSource) {
      console.error(`${path.basename(outputPath)} is out of date. Run: node scripts/refresh-public-provider-models.mjs --write`)
      process.exitCode = 1
      return
    }
    console.log(`${path.relative(process.cwd(), outputPath)} is up to date.`)
    return
  }

  await fs.writeFile(outputPath, nextSource)
  console.log(`Updated ${path.relative(process.cwd(), outputPath)}.`)
}

async function main() {
  const anthropicIds = new Set()
  for (const url of ANTHROPIC_SOURCE_URLS) {
    const html = await fetchHtml(url)
    for (const modelId of canonicalAnthropicModelIdsFromHtml(html)) {
      anthropicIds.add(modelId)
    }
  }
  const sortedAnthropicIds = [...anthropicIds].sort(compareAnthropicModelIds)
  if (sortedAnthropicIds.length === 0) {
    throw new Error('No Anthropic model ids were discovered from public docs')
  }

  const openRouterData = await fetchJson('https://openrouter.ai/api/v1/models')
  const openRouterIds = new Set((openRouterData.data ?? []).map((model) => model.id).filter(Boolean))

  const xaiHtml = await fetchHtml('https://docs.x.ai/developers/models')
  const geminiHtml = await fetchHtml(GEMINI_SOURCE_URL)
  // Google's docs are occasionally served from staggered CDN revisions. Merge
  // the checked-in catalog so a transient older page can add new models but
  // cannot silently remove a model that was already verified and shipped.
  const existingGeminiSource = await fs.readFile(GEMINI_OUTPUT_PATH, 'utf8').catch(() => '')
  const geminiIds = canonicalGeminiModelIdsFromHtml(`${geminiHtml}\n${existingGeminiSource}`)
  if (geminiIds.length === 0) {
    throw new Error('No Gemini model ids were discovered from public docs')
  }

  await ensureFileContent(ANTHROPIC_OUTPUT_PATH, buildAnthropicSource(sortedAnthropicIds))
  await ensureFileContent(GEMINI_OUTPUT_PATH, buildGeminiSource(geminiIds))
  await ensureFileContent(OPENROUTER_OUTPUT_PATH, buildOpenRouterSource(openRouterIds))
  await ensureFileContent(XAI_OUTPUT_PATH, buildXaiSource(xaiHtml))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
