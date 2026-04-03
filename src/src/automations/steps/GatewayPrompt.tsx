import { SourceDocument } from 'src/utils/SourceDocument'
import { serializeWebSearchToLLMAdditionalDocuments, WebSearchResponse } from 'src/App'
import { KN_SERVER_HOST } from 'src/utils/constants'

import { getAgentMemory, saveAgentMemory } from '../agentMemory'
import BaseStep, { StepExecuteContext, StepExecuteHelpers } from './Base'

export default class GatewayPrompt extends BaseStep {
  private userPrompt: string

  constructor({ userPrompt }: { userPrompt: string }) {
    super({ sources: [], argsJSON: JSON.stringify({ userPrompt }) })
    this.userPrompt = userPrompt
  }

  async execute(context: StepExecuteContext, helpers: StepExecuteHelpers) {
    const identity = context.agentIdentity
    const agentId = identity?.displayName?.toLowerCase() ?? 'unknown'

    // Soul prefix
    const soulPrefix = identity?.soul
      ? `[You are ${identity.displayName}. Personality: ${identity.soul}]\n\n`
      : ''

    // Memory context from previous runs
    const memory = getAgentMemory(agentId)
    const memoryBlock =
      memory.length > 0
        ? `[Previous run summaries:\n${memory.map(m => `- ${m.timestamp}: ${m.summary}`).join('\n')}\n]\n\n`
        : ''

    // Search context from prior SemanticSearch step
    const searchResults = context.semanticSearchResults as SourceDocument[] | undefined
    const webResponse = context.webResponse as WebSearchResponse | null | undefined
    let contextBlock = ''
    if (searchResults?.length) {
      contextBlock += searchResults.map(d => d.summary ?? '').join('\n---\n')
    }
    if (webResponse) {
      const webDocs = serializeWebSearchToLLMAdditionalDocuments(webResponse)
      contextBlock += webDocs.map(d => `\n---\n${d.title}\n${d.content}`).join('')
    }

    const fullMessage = `${soulPrefix}${memoryBlock}${contextBlock ? `[Context:\n${contextBlock}\n]\n\n` : ''}${this.userPrompt}`

    const res = await fetch(`${KN_SERVER_HOST}/api/clawd/agent-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullMessage, channel: 'automation' }),
    })
    const data = await res.json()

    if (!data.ok || !data.reply) {
      throw new Error(`Agent run failed: ${data.message ?? 'no reply'}`)
    }

    saveAgentMemory(agentId, data.reply)

    const docIds = searchResults?.map(r => r.documentId) ?? []

    return super.execute(
      {
        ...context,
        gatewayReply: data.reply,
        userPrompt: this.userPrompt,
        userPromptFacade: this.userPrompt,
        documents: docIds,
      },
      helpers,
    )
  }

  static getName(): string {
    return 'gateway-prompt'
  }

  static create(args_json: string | null) {
    const args = JSON.parse(args_json ?? '{}') as ConstructorParameters<typeof GatewayPrompt>[0]
    return new GatewayPrompt(args)
  }
}
