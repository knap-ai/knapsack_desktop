import { invoke } from '@tauri-apps/api/tauri'

export interface CommitmentProposal { action: string; owner: string; quote: string; draft: string }
export interface FollowThrough {
  id: string; runId: string; proposal: CommitmentProposal
  status: 'proposed' | 'tracking' | 'attention' | 'reply_received' | 'resolved' | 'paused' | 'dismissed'
  dueAt?: number; account?: string; recipient?: string; sentId?: string; threadId?: string
  replyId?: string; lastCheckedAt?: number; nextCheckAt?: number; checkError?: string
}
export const listFollowThrough = (brainRoot = '') => invoke<FollowThrough[]>('kn_follow_through_list', { brainRoot })
export const proposeFollowThrough = (runId: string, proposals: CommitmentProposal[], brainRoot = '') =>
  invoke<FollowThrough[]>('kn_follow_through_propose', { brainRoot, runId, proposals })
export const decideFollowThrough = (id: string, decision: string, dueAt?: number, brainRoot = '') =>
  invoke<FollowThrough>('kn_follow_through_decide', { brainRoot, id, decision, dueAt })
export const linkFollowThrough = (id: string, account: string, recipient: string, sentId: string, brainRoot = '') =>
  invoke<FollowThrough>('kn_follow_through_link', { brainRoot, id, account, recipient, sentId })
export const checkFollowThrough = (brainRoot = '') => invoke<FollowThrough[]>('kn_follow_through_check', { brainRoot })

export const extractFollowThrough = (runId: string, brainRoot = '') => invoke<FollowThrough[]>('kn_follow_through_extract', { brainRoot, runId })

export const saveFollowThroughDraft = (id: string, draft: string, brainRoot = '') => invoke<FollowThrough>('kn_follow_through_save_draft', { brainRoot, id, draft })
