import { invoke } from '@tauri-apps/api/tauri'

export type SharedMessage = { id: string; role: 'user' | 'assistant'; text: string; ts: number }
export type SharedConversation = {
  schemaVersion: 1
  conversationId: string
  title: string
  messages: SharedMessage[]
}
export type SharedReceipt = {
  conversation_id: string
  revision: number
  mutation_id: string
  source_device_id: string
  key_version: string
  sha256: string
  updated_at: number
}
export type SharedRead = {
  account_id: string
  receipt: SharedReceipt
  document: SharedConversation
}
export type SharedDirectory = {
  account_id: string
  conversations: SharedReceipt[]
  execution_location: 'local'
  remote_execution_available: false
  automatic_sync_available: false
}
export const listAccountConversations = (expectedAccountId: string) =>
  invoke<SharedDirectory>('kn_account_conversations', { expectedAccountId })
export const readAccountConversation = (expectedAccountId: string, conversationId: string) =>
  invoke<SharedRead>('kn_account_conversation_read', { expectedAccountId, conversationId })
export const publishAccountConversation = (
  expectedAccountId: string,
  expectedRevision: number,
  document: SharedConversation,
  confirmShare: boolean,
) =>
  invoke<SharedReceipt>('kn_account_conversation_publish', {
    expectedAccountId,
    expectedRevision,
    document,
    confirmShare,
  })
export const revokeAccountDevice = (
  expectedAccountId: string,
  deviceId: string,
  expectedEpoch: number,
  confirmRevoke: boolean,
) =>
  invoke<void>('kn_account_device_revoke', {
    expectedAccountId,
    deviceId,
    expectedEpoch,
    confirmRevoke,
  })
