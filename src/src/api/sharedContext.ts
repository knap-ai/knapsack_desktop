import { SHARED_CONTEXT_ENABLED } from 'src/utils/releaseCapabilities'

import { invoke } from '@tauri-apps/api/tauri'

// Native owns account recovery keys, encryption, durable retries and authority.
// Plaintext is never cached in localStorage or sent directly by this client.
export type ContextKind = 'conversation' | 'curated_context'
export type SharedContextStatus = {
  feature_available: boolean
  sync_enabled: boolean
  inference_policy_is_per_device: true
  account_recoverable_encryption: true
  local_record_limit: 32
  account_lifetime_record_limit: 100
}
export type RecordMetadata = {
  schema_version: 1
  account_id: string
  record_id: string
  kind: ContextKind
  revision: number
  deleted: boolean
  source_device_id: string
  key_version: string
  sequence: number
  mutation_id: string
  sha256: string | null
}
export type ContextChangePage = {
  changes: RecordMetadata[]
  next_cursor: string
  has_more: boolean
}
export type ContextState =
  | 'off'
  | 'review'
  | 'queued'
  | 'syncing'
  | 'uncertain'
  | 'conflict'
  | 'revoked'
export type ContextCandidate = {
  id: string
  kind: ContextKind
  title: string
  sourceLabel: string
  previewText: string
  revision: number
  digest: string
}
export type ReviewedContextSelection = {
  recordId: string
  expectedLocalRevision: number
  expectedDigest: string
}
export type ContextConflict = {
  recordId: string
  revision: number
  localTitle: string
  remoteTitle: string
  deleted: boolean
  localText: string
  remoteText: string
  localSource: string
  remoteSource: string
  localMutationId: string
}
// A distinct historical type: never pass this to active chat history/onAdopt,
// tool invocation, approval restoration or execution-resume APIs.
export type HistoricalContext = Readonly<{
  use: 'historical_context_only'
  sourceDeviceId: string
  revision: number
  title: string
  text: string
}>
export async function sharedContextStatus(): Promise<SharedContextStatus> {
  if (!SHARED_CONTEXT_ENABLED)
    return {
      feature_available: false,
      sync_enabled: false,
      inference_policy_is_per_device: true,
      account_recoverable_encryption: true,
      local_record_limit: 32,
      account_lifetime_record_limit: 100,
    }
  return invoke<SharedContextStatus>('kn_shared_context_status')
}
// Enrollment, mutation and feed IPC deliberately remain unregistered until the
// native verified-key/device-session factory and signed transport are accepted.
// Merely flipping this frontend constant cannot create a network operation.
