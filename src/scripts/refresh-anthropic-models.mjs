#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const SOURCE_URLS = [
  'https://docs.anthropic.com/en/api/models-list',
  'https://docs.anthropic.com/en/docs/about-claude/models/overview',
]

const FAMILY_ORDER = ['fable', 'opus', 'sonnet', 'haiku']
const FAMILY_RANK = new Map(FAMILY_ORDER.map((family, index) => [family, index]))
const MODEL_ID_PATTERN = /\bclaude-(fable|opus|sonnet|haiku)-\d[\da-z.-]*\b/gi

const WRITE = process.argv.includes('--write')
const CHECK = process.argv.includes('--check') || !WRITE

const OUTPUT_PATH = path.resolve(process.cwd(), 'src/utils/anthropicModels.ts')

function canonicalModelIdsFromHtml(html) {
  const ids = new Set()
  for (const match of html.matchAll(MODEL_ID_PATTERN)) {
    const normalized = normalizeModelId(match[0].toLowerCase())
    if (normalized) ids.add(normalized)
  }
  return ids
}

function familyFromModelId(modelId) {
  return modelId.split('-')[1] ?? 'opus'
}

function normalizeModelId(modelId) {
  let normalized = modelId.toLowerCase()
  normalized = normalized.replace(/-v\d+$/, '')

  const family = familyFromModelId(normalized)
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

function numericVersionParts(modelId) {
  const family = familyFromModelId(modelId)
  const withoutPrefix = modelId.replace(`claude-${family}-`, '')
  return withoutPrefix.split('-').map((segment) => {
    if (/^\d+$/.test(segment)) return Number(segment)
    const digits = segment.replace(/\D+/g, '')
    return digits ? Number(digits) : -1
  })
}

function compareModelIds(a, b) {
  const familyDelta = (FAMILY_RANK.get(familyFromModelId(a)) ?? 99) - (FAMILY_RANK.get(familyFromModelId(b)) ?? 99)
  if (familyDelta !== 0) return familyDelta

  const aParts = numericVersionParts(a)
  const bParts = numericVersionParts(b)
  const maxLength = Math.max(aParts.length, bParts.length)
  for (let i = 0; i < maxLength; i += 1) {
    const delta = (bParts[i] ?? -1) - (aParts[i] ?? -1)
    if (delta !== 0) return delta
  }
  return a.localeCompare(b)
}

function displayVersion(modelId) {
  const family = familyFromModelId(modelId)
  const segments = modelId.replace(`claude-${family}-`, '').split('-')
  if (segments.length > 2 && /^\d{8}$/.test(segments.at(-1) ?? '')) {
    segments.pop()
  }
  return segments.join('.')
}

function displayName(modelId) {
  const family = familyFromModelId(modelId)
  const familyName = family.charAt(0).toUpperCase() + family.slice(1)
  return `Claude ${familyName} ${displayVersion(modelId)}`
}

function modelDescription(modelId, rankWithinFamily) {
  const family = familyFromModelId(modelId)
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

function familyHeadline(ids, family) {
  const modelId = ids.find((candidate) => familyFromModelId(candidate) === family)
  if (!modelId) return null
  const familyName = family.charAt(0).toUpperCase() + family.slice(1)
  return `${familyName} ${displayVersion(modelId)}`
}

function buildSource(ids) {
  const idsByFamily = new Map()
  for (const modelId of ids) {
    const family = familyFromModelId(modelId)
    const existing = idsByFamily.get(family) ?? []
    existing.push(modelId)
    idsByFamily.set(family, existing)
  }

  const anthropicModels = ids.map((modelId) => {
    const family = familyFromModelId(modelId)
    const familyIds = idsByFamily.get(family) ?? []
    return {
      id: modelId,
      name: displayName(modelId),
      description: modelDescription(modelId, familyIds.indexOf(modelId)),
      vision: true,
    }
  })

  const latestOpus = idsByFamily.get('opus')?.[0] ?? anthropicModels[0]?.id ?? 'claude-opus-4-8'
  const latestSonnet = idsByFamily.get('sonnet')?.[0] ?? 'claude-sonnet-5'
  const latestHaiku = idsByFamily.get('haiku')?.[0] ?? 'claude-haiku-4-5-20251001'

  const descriptionParts = FAMILY_ORDER
    .map((family) => familyHeadline(ids, family))
    .filter(Boolean)
  const providerDescription = `Claude ${descriptionParts.join(', ')}`

  return `// AUTO-GENERATED by scripts/refresh-anthropic-models.mjs
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
${anthropicModels.map((model) => `  { id: '${model.id}', name: '${model.name}', description: '${model.description}', vision: true },`).join('\n')}
]

export const DEFAULT_ANTHROPIC_MODEL = '${latestOpus}'

export const ANTHROPIC_PROVIDER_DESCRIPTION = '${providerDescription}'

export const KNAPSACK_ANTHROPIC_TIER_MODELS: KnapsackTierModelOption[] = [
  { id: 'anthropic/${latestHaiku}', name: 'Standard', description: 'Fast, efficient — great for everyday tasks' },
  { id: 'anthropic/${latestSonnet}', name: 'Plus', description: 'Balanced performance and capability' },
  { id: 'anthropic/${latestOpus}', name: 'Premium', description: 'Most powerful — best for complex work' },
]

export const DEFAULT_KNAPSACK_ANTHROPIC_MODEL = 'anthropic/${latestHaiku}'
`
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

async function main() {
  const ids = new Set()
  for (const url of SOURCE_URLS) {
    const html = await fetchHtml(url)
    for (const modelId of canonicalModelIdsFromHtml(html)) {
      ids.add(modelId)
    }
  }

  const sortedIds = [...ids].sort(compareModelIds)
  if (sortedIds.length === 0) {
    throw new Error('No Anthropic model ids were discovered from public docs')
  }

  const nextSource = buildSource(sortedIds)
  const currentSource = await fs.readFile(OUTPUT_PATH, 'utf8').catch(() => '')

  if (CHECK) {
    if (currentSource !== nextSource) {
      console.error(`Anthropic model catalog is out of date. Run: node scripts/refresh-anthropic-models.mjs --write`)
      process.exitCode = 1
      return
    }
    console.log('Anthropic model catalog is up to date.')
    return
  }

  await fs.writeFile(OUTPUT_PATH, nextSource)
  console.log(`Updated ${path.relative(process.cwd(), OUTPUT_PATH)} with ${sortedIds.length} models.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
