import { KNLocalStorage } from 'src/utils/KNLocalStorage'
import { getProfileRevision } from 'src/utils/profileScope'
import { KN_SERVER_HOST } from 'src/utils/constants'
import type { SlackNotesBlock } from 'src/utils/slackMeetingNotes'

export type SlackNotesWorkspace = {
  accountId: string
  teamId: string
  name: string
  unavailable?: boolean
  source?: 'gateway' | 'studio'
}
export type SlackNotesChannel = { id: string; name: string; private: boolean }
export type SlackNotesDestination = {
  owner: string
  accountId: string
  teamId: string
  channelId: string
}
async function request<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(
    `${KN_SERVER_HOST}/api/clawd/slack-notes/${path}`,
    body
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal,
        }
      : { signal },
  )
  const value = await response.json()
  if (!response.ok || !value.success)
    throw new Error(value.error || 'Slack sharing failed. No alternate destination was used.')
  return value.data
}
export const slackNotesWorkspaces = (signal?: AbortSignal) =>
  request<{ owner: string; accounts: SlackNotesWorkspace[]; warnings?: string[] }>('workspaces', undefined, signal)
export const slackNotesChannels = (destination: Omit<SlackNotesDestination, 'channelId'>, signal?: AbortSignal) =>
  request<{ channels: SlackNotesChannel[]; warnings?: string[] }>('channels', destination, signal)
export const sendSlackNotes = (
  destination: SlackNotesDestination,
  message: { text: string; blocks: SlackNotesBlock[] },
  requestId: string,
) =>
  request<{ state: string; channelId: string; teamId: string; ts: string }>('send', {
    ...destination,
    ...message,
    requestId,
  })
/** Warm a previously confirmed exact target for the active meeting. No stored names or channel inventory. */
export type WarmSlackNotesSuggestion = {
  scope: string
  destination: SlackNotesDestination
  workspace: SlackNotesWorkspace
  channel: SlackNotesChannel
  inventory: Awaited<ReturnType<typeof slackNotesWorkspaces>>
  listed: Awaited<ReturnType<typeof slackNotesChannels>>
  validatedAt: number
}
export const SLACK_SUGGESTION_TTL = 30_000
const warmInflight = new Map<string, Promise<WarmSlackNotesSuggestion | undefined>>()
export function slackSuggestionScope(threadId: number, email?: string, calendarEmail?: string) {
  return JSON.stringify([getProfileRevision(), threadId, email || '', calendarEmail?.trim().toLowerCase() || ''])
}
export function freshSlackSuggestion(value: WarmSlackNotesSuggestion | undefined, scope: string) {
  return value?.scope === scope && Date.now() - value.validatedAt >= 0 &&
    Date.now() - value.validatedAt < SLACK_SUGGESTION_TTL ? value : undefined
}
async function hashLocalKey(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}
export function warmSlackSuggestion(threadId: number, email?: string, calendarEmail?: string) {
  const scope = slackSuggestionScope(threadId, email, calendarEmail)
  if (!email || !calendarEmail?.trim()) return Promise.resolve(undefined)
  const existing = warmInflight.get(scope)
  if (existing) return existing
  const work = (async () => {
    // This hash only finds local history. The backend separately attests the account on inventory.
    const expectedOwner = await hashLocalKey(email)
    const hint = await confirmedSlackDestination(expectedOwner, calendarEmail)
    const current = () => slackSuggestionScope(threadId, email, calendarEmail) === scope
    if (!hint || !current()) return
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), 15_000)
    try {
      const inventory = await slackNotesWorkspaces(abort.signal)
      if (abort.signal.aborted || !current() || inventory.owner !== expectedOwner) return
      const matches = inventory.accounts.filter(w => w.accountId === hint.accountId)
      if (matches.length !== 1 || matches[0].unavailable || matches[0].teamId !== hint.teamId) return
      const listed = await slackNotesChannels({ owner: hint.owner, accountId: hint.accountId, teamId: hint.teamId }, abort.signal)
      if (abort.signal.aborted || !current()) return
      const channel = listed.channels.find(channel => channel.id === hint.channelId)
      if (channel) return { scope, destination: hint, workspace: matches[0], channel, inventory, listed, validatedAt: Date.now() }
    } finally {
      clearTimeout(timer)
    }
  })().catch(() => undefined)
  warmInflight.set(scope, work)
  void work.then(() => { if (warmInflight.get(scope) === work) warmInflight.delete(scope) })
  return work
}
// Calendar email is a local lookup key only, never a Slack identity query.
async function confirmedDestinationKey(owner: string, calendarEmail?: string) {
  const email = calendarEmail?.trim().toLowerCase()
  if (!owner || !email) return undefined
  const revision = getProfileRevision()
  const profile = await KNLocalStorage.getItem('KN_PROFILE')
  if (typeof profile?.uuid !== 'string' || !profile.uuid ||
      typeof profile.email !== 'string' || await hashLocalKey(profile.email) !== owner) return undefined
  const key = await hashLocalKey(JSON.stringify([owner, profile.uuid, email]))
  return revision === getProfileRevision() ? `slack-notes-confirmed:v2:${key}` : undefined
}
export async function confirmedSlackDestination(owner: string, calendarEmail?: string): Promise<SlackNotesDestination | undefined> {
  try {
    const key = await confirmedDestinationKey(owner, calendarEmail)
    if (!key) return undefined
    const v = JSON.parse(localStorage.getItem(key) || 'null')
    if (v?.owner === owner && [v.accountId, v.teamId, v.channelId].every(x => typeof x === 'string' && x.length > 0)) {
      return { owner, accountId: v.accountId, teamId: v.teamId, channelId: v.channelId }
    }
  } catch { /* Optional suggestion; sharing remains available. */ }
}
export async function rememberConfirmedSlackDestination(
  dest: SlackNotesDestination, calendarEmail: string | undefined,
  receipt: { state: string; teamId: string; channelId: string; ts: string },
  current: () => boolean,
) {
  if (receipt.state !== 'sent' || receipt.teamId !== dest.teamId || receipt.channelId !== dest.channelId ||
    typeof receipt.ts !== 'string' || !receipt.ts.trim()) return
  const key = await confirmedDestinationKey(dest.owner, calendarEmail)
  if (key && current()) localStorage.setItem(key, JSON.stringify(dest))
}
export async function slackNotesSendId(destination: SlackNotesDestination, message: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify({ destination, message }))
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  const key = `slack-notes-send:v1:${destination.owner}:${hash}`
  const previous = localStorage.getItem(key)
  if (previous) return previous
  const id = crypto.randomUUID()
  localStorage.setItem(key, id)
  return id
}
