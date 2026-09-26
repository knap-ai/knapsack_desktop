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
  'https://www.anthropic.com/claude/fable',
]
const GEMINI_SOURCE_URLS = [
  'https://ai.google.dev/gemini-api/docs/models',
  'https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash',
]
const OPENAI_SOURCE_URLS = [
  'https://developers.openai.com/api/docs/models',
  'https://developers.openai.com/api/docs/models/gpt-6-astra',
]
const BASELINE_OPENAI_MODEL_IDS = ['gpt-5.5', 'gpt-5.4', 'o3', 'gpt-5-mini']

const FAMILY_ORDER = ['fable', 'opus', 'sonnet', 'haiku']
const FAMILY_RANK = new Map(FAMILY_ORDER.map((family, index) => [family, index]))
const ANTHROPIC_MODEL_ID_PATTERN = /\bclaude-(fable|opus|sonnet|haiku)-\d[\da-z.-]*\b/gi

const ANTHROPIC_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/anthropicModels.ts')
const GEMINI_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/geminiModels.ts')
const OPENAI_OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/openaiModels.ts')
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

export function canonicalAnthropicModelIdsFromHtml(html) {
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

const OPENAI_MODEL_ID_PATTERN = /\b(?:gpt-\d+(?:\.\d+)?(?:-astra|-mini)?|o3)\b/gi

function openAIVersionParts(modelId) {
  const match = modelId.match(/^gpt-(\d+(?:\.\d+)?)/)
  return (match?.[1] ?? '0').split('.').map(Number)
}

function compareOpenAIModelIds(a, b) {
  const aAstra = a.endsWith('-astra')
  const bAstra = b.endsWith('-astra')
  if (aAstra !== bAstra) return aAstra ? -1 : 1
  const aGpt = a.startsWith('gpt-')
  const bGpt = b.startsWith('gpt-')
  if (aGpt !== bGpt) return aGpt ? -1 : 1
  const aParts = openAIVersionParts(a)
  const bParts = openAIVersionParts(b)
  for (let index = 0; index < Math.max(aParts.length, bParts.length); index += 1) {
    const delta = (bParts[index] ?? 0) - (aParts[index] ?? 0)
    if (delta !== 0) return delta
  }
  const aMini = a.endsWith('-mini')
  const bMini = b.endsWith('-mini')
  if (aMini !== bMini) return aMini ? 1 : -1
  return a.localeCompare(b)
}

export function canonicalOpenAIModelIdsFromHtml(html) {
  const ids = new Set([...html.matchAll(OPENAI_MODEL_ID_PATTERN)].map((match) => match[0].toLowerCase()))
  return [...ids]
    .filter((id) => id === 'o3' || id === 'gpt-5-mini' || /^gpt-\d+(?:\.\d+)?(?:-astra)?$/.test(id))
    .sort(compareOpenAIModelIds)
}

function openAIDisplayName(modelId) {
  if (modelId === 'o3') return 'o3 (Reasoning)'
  const [, version, variant] = modelId.match(/^gpt-([\d.]+)(?:-(.+))?$/) ?? []
  const suffix = variant ? ` ${variant.charAt(0).toUpperCase()}${variant.slice(1)}` : ''
  return version ? `GPT-${version}${suffix}` : modelId
}

function openAIModelDescription(modelId) {
  if (modelId.endsWith('-astra')) return 'Latest agentic model for complex professional work'
  if (modelId === 'o3') return 'Reasoning model for complex logic'
  if (modelId.endsWith('-mini')) return 'Fast and affordable'
  return 'Highly capable general-purpose model'
}

export function buildOpenAISource(ids) {
  const models = ids.map((id) => ({
    id,
    name: openAIDisplayName(id),
    description: openAIModelDescription(id),
  }))
  const providerDescription = models.slice(0, 4).map((model) => model.name).join(', ')

  return `// AUTO-GENERATED by scripts/refresh-public-provider-models.mjs
// Do not edit this file by hand.

export type OpenAIModelOption = {
  id: string
  name: string
  description: string
  vision?: boolean
}

export const OPENAI_MODELS: OpenAIModelOption[] = [
${models.map((model) => `  { id: '${escapeSingleQuotes(model.id)}', name: '${escapeSingleQuotes(model.name)}', description: '${escapeSingleQuotes(model.description)}', vision: true },`).join('\n')}
]

export const OPENAI_PROVIDER_DESCRIPTION = '${escapeSingleQuotes(providerDescription)}'
export const DEFAULT_OPENAI_MODEL = '${ids.includes('gpt-5-mini') ? 'gpt-5-mini' : escapeSingleQuotes(ids[0] ?? 'gpt-5-mini')}'
`
}

const GEMINI_MODEL_ID_PATTERN = /\bgemini-\d+(?:\.\d+)?-(?:flash-lite|flash|pro)(?:-preview)?(?![\da-z-])/gi

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

function geminiVersionAtLeast(modelId, minimumMajor, minimumMinor) {
  const [major = 0, minor = 0] = geminiVersionParts(modelId)
  return major > minimumMajor || (major === minimumMajor && minor >= minimumMinor)
}

export function canonicalGeminiModelIdsFromHtml(html) {
  const discovered = new Set(
    [...html.matchAll(GEMINI_MODEL_ID_PATTERN)]
      .map((match) => match[0].toLowerCase())
      .filter((id) => geminiVersionParts(id)[0] <= 9),
  )

  const flash = [...discovered]
    .filter(
      (id) =>
        geminiFamily(id) === 'flash' &&
        !id.endsWith('-preview') &&
        geminiVersionAtLeast(id, 3, 5),
    )
    .sort(compareGeminiVersions)
    .slice(0, 3)
  const flashLite = [...discovered]
    .filter(
      (id) =>
        geminiFamily(id) === 'flash-lite' &&
        !id.endsWith('-preview') &&
        geminiVersionAtLeast(id, 3, 1),
    )
    .sort(compareGeminiVersions)
    .slice(0, 2)

  const proByVersion = new Map()
  for (const id of [...discovered]
    .filter(
      (candidate) =>
        geminiFamily(candidate) === 'pro' && geminiVersionAtLeast(candidate, 3, 1),
    )
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
  if (geminiVersionParts(modelId).join('.') === '2.5') {
    return 'Stable, fast, and efficient with thinking'
  }
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
      id: pickPresent(ids, ['qwen/qwen3.8-27b:free', 'openai/gpt-oss-120b:free'], 'qwen/qwen3.8-27b:free'),
      name: 'Qwen 3.8 27B (Free)',
      description: 'Current free reasoning model with tool use and structured output',
    },
    {
      id: pickPresent(ids, ['openai/gpt-5.6-sol', 'openai/gpt-5.5'], 'openai/gpt-5.6-sol'),
      name: 'GPT-5.6 Sol',
      description: 'OpenAI frontier model for demanding coding and reasoning',
      vision: true,
    },
    {
      id: pickPresent(ids, ['anthropic/claude-opus-5.5', 'anthropic/claude-opus-4.8'], 'anthropic/claude-opus-5.5'),
      name: 'Claude Opus',
      description: 'Anthropic flagship via OpenRouter',
      vision: true,
    },
    {
      id: pickPresent(ids, ['google/gemini-3.8-flash', 'google/gemini-3.7-flash'], 'google/gemini-3.8-flash'),
      name: 'Gemini 3.8 Flash',
      description: 'Google’s newest stable Flash model for agentic work',
      vision: true,
    },
    {
      id: pickPresent(ids, ['x-ai/grok-4.7', 'x-ai/grok-4.3'], 'x-ai/grok-4.7'),
      name: 'Grok 4.7',
      description: 'xAI flagship for tool calling and agentic work',
      vision: true,
    },
    {
      id: pickPresent(ids, ['deepseek/deepseek-v4.1-flash', 'deepseek/deepseek-v4-flash'], 'deepseek/deepseek-v4.1-flash'),
      name: 'DeepSeek V4.1 Flash',
      description: 'Fast long-context open model for agent loops',
    },
    {
      id: pickPresent(ids, ['z-ai/glm-5.3-flash', 'z-ai/glm-5.2'], 'z-ai/glm-5.3-flash'),
      name: 'GLM 5.3 Flash',
      description: 'Fast open model for coding and agentic workflows',
    },
    {
      id: pickPresent(ids, ['moonshotai/kimi-k3', 'moonshotai/kimi-k2.7-code'], 'moonshotai/kimi-k3'),
      name: 'Kimi K3',
      description: 'Moonshot’s current long-context reasoning model',
    },
    {
      id: pickPresent(ids, ['minimax/minimax-m3', 'minimax/minimax-m2.7'], 'minimax/minimax-m3'),
      name: 'MiniMax M3',
      description: 'Current MiniMax model for coding and autonomous work',
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

export const DEFAULT_OPENROUTER_MODEL = '${escapeSingleQuotes(choices[1]?.id ?? 'qwen/qwen3.8-27b:free')}'
`
}

function buildXaiSource(html) {
  const has = (needle) => html.includes(needle)
  const choices = [
    {
      id: has('grok-4.7') ? 'grok-4.7' : 'grok-4.3',
      name: 'Grok 4.7',
      description: 'Current xAI flagship for code, tool calling, and general work',
      vision: true,
    },
    {
      id: has('grok-build-0.1') ? 'grok-build-0.1' : 'grok-4.3',
      name: 'Grok Build 0.1',
      description: 'Specialized xAI model for agentic coding and web development',
      vision: true,
    },
    {
      id: 'grok-4.3',
      name: 'Grok 4.3',
      description: 'Prior stable Grok option for compatibility',
      vision: true,
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
  // Public indexes can lag dedicated launch pages. Keep previously verified
  // entries so a temporary source disagreement never removes a shipped model.
  const existingAnthropicSource = await fs.readFile(ANTHROPIC_OUTPUT_PATH, 'utf8').catch(() => '')
  for (const modelId of canonicalAnthropicModelIdsFromHtml(existingAnthropicSource)) {
    anthropicIds.add(modelId)
  }
  const sortedAnthropicIds = [...anthropicIds].sort(compareAnthropicModelIds)
  if (sortedAnthropicIds.length === 0) {
    throw new Error('No Anthropic model ids were discovered from public docs')
  }

  const openRouterData = await fetchJson('https://openrouter.ai/api/v1/models')
  const openRouterIds = new Set((openRouterData.data ?? []).map((model) => model.id).filter(Boolean))

  const xaiHtml = await fetchHtml('https://docs.x.ai/developers/models')
  const geminiPages = await Promise.all(GEMINI_SOURCE_URLS.map(fetchHtml))
  // Google's docs are occasionally served from staggered CDN revisions. Merge
  // the checked-in catalog so a transient older page can add new models but
  // cannot silently remove a model that was already verified and shipped.
  const existingGeminiSource = await fs.readFile(GEMINI_OUTPUT_PATH, 'utf8').catch(() => '')
  const geminiIds = canonicalGeminiModelIdsFromHtml(`${geminiPages.join('\n')}\n${existingGeminiSource}`)
  if (geminiIds.length === 0) {
    throw new Error('No Gemini model ids were discovered from public docs')
  }

  const openAIPages = await Promise.all(OPENAI_SOURCE_URLS.map(fetchHtml))
  const existingOpenAISource = await fs.readFile(OPENAI_OUTPUT_PATH, 'utf8').catch(() => '')
  const openAIIds = canonicalOpenAIModelIdsFromHtml(
    `${openAIPages.join('\n')}\n${existingOpenAISource}\n${BASELINE_OPENAI_MODEL_IDS.join(' ')}`,
  )
  if (openAIIds.length === 0) {
    throw new Error('No OpenAI model ids were discovered from public docs')
  }

  await ensureFileContent(ANTHROPIC_OUTPUT_PATH, buildAnthropicSource(sortedAnthropicIds))
  await ensureFileContent(GEMINI_OUTPUT_PATH, buildGeminiSource(geminiIds))
  await ensureFileContent(OPENAI_OUTPUT_PATH, buildOpenAISource(openAIIds))
  await ensureFileContent(OPENROUTER_OUTPUT_PATH, buildOpenRouterSource(openRouterIds))
  await ensureFileContent(XAI_OUTPUT_PATH, buildXaiSource(xaiHtml))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
