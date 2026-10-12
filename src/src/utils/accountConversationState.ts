import type { SharedConversation, SharedMessage, SharedRead } from 'src/api/accountConversations'

export type SharingBinding = { accountId: string; conversationId: string; revision: number }
export const cacheKey = (account: string, chat: string) =>
  `knapsack:account-conversation:v1:${account}:${encodeURIComponent(chat)}`
/** Strict text projection: runtime approvals, attachments, actions, system prompts and welcome shells never travel. */
export function projectSharedMessages(
  messages: readonly { id: string; role: string; text: string; ts: number }[],
): SharedMessage[] {
  const eligible = messages.filter(
    message =>
      (message.role === 'user' || message.role === 'assistant') &&
      !/^(welcome-|example-|smart-prompt$|no-auth-prompt$)/.test(message.id),
  )
  if (eligible.length > 500) throw Error('Conversation exceeds the sharing message limit')
  const ids = new Set<string>()
  return eligible.map(message => {
    if (
      !message.id ||
      message.id.length > 128 ||
      Array.from(message.id).some(
        char => char.charCodeAt(0) < 32 || (char.charCodeAt(0) >= 127 && char.charCodeAt(0) < 160),
      ) ||
      ids.has(message.id) ||
      !Number.isSafeInteger(message.ts) ||
      message.ts < 0 ||
      new TextEncoder().encode(message.text).length > 32768
    )
      throw Error('Conversation contains invalid or oversized messages')
    ids.add(message.id)
    return {
      id: message.id,
      role: message.role as SharedMessage['role'],
      text: message.text,
      ts: message.ts,
    }
  })
}
export function conversationDocument(
  messages: Parameters<typeof projectSharedMessages>[0],
  id: string,
  title: string,
): SharedConversation {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    throw Error('Invalid shared conversation ID')
  return {
    schemaVersion: 1,
    conversationId: id,
    title: title.slice(0, 128) || 'Conversation',
    messages: projectSharedMessages(messages),
  }
}
/** Server revisions are compared before adoption; local edits remain intact on conflict. */
export function reviewedConversation(
  record: SharedRead,
  account: string,
  selected: string,
): SharedRead {
  if (
    record.account_id !== account ||
    record.receipt.conversation_id !== selected ||
    record.document.conversationId !== selected ||
    !Number.isSafeInteger(record.receipt.revision) ||
    record.receipt.revision < 1 ||
    record.document.schemaVersion !== 1
  )
    throw Error('Account or conversation changed; review again')
  return {
    ...record,
    document: conversationDocument(record.document.messages, selected, record.document.title),
  }
}
export function mergeSharedConversation(
  remote: SharedConversation,
  local: SharedConversation,
): SharedConversation {
  if (remote.conversationId !== local.conversationId)
    throw Error('Review matching conversations before merging')
  const combined = new Map(remote.messages.map(message => [message.id, message]))
  for (const message of local.messages) {
    const existing = combined.get(message.id)
    if (existing && JSON.stringify(existing) !== JSON.stringify(message))
      throw Error(
        'The same message was edited on both computers. Preserve a separate conversation and review manually.',
      )
    combined.set(message.id, message)
  }
  return conversationDocument(
    [...combined.values()].sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id)),
    remote.conversationId,
    remote.title,
  )
}
