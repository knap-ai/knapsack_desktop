import { NotesGeneration, serializeNotesWrite, waitForAbort } from './notesGeneration'
import { getProfileRevision, PROFILE_CHANGED_EVENT } from './profileScope'

export type NotesSaveProfile = { uuid?: string; email?: string; sharing_permission?: number }
export type BoundNotesSave = ((
  threadId: number,
  notes: string,
  generation?: NotesGeneration,
) => Promise<void>) & { isCurrent: () => boolean }
export type NotesSaveDependencies = {
  readProfile: () => Promise<NotesSaveProfile | null>
  tokenForEmail: (email: string) => Promise<string>
  canShare: (permission?: number) => boolean
  fetcher: typeof fetch
  localUrl: string
  metadataUrl: string
  serverUrl: string
  reportCloudFailure?: (error: Error) => void
  bindingCurrent: () => boolean
  expectedEmail?: string
}
const uploads = new Map<number, Promise<void>>()
function serializeUpload(threadId: number, work: () => Promise<void>): Promise<void> {
  const pending = (uploads.get(threadId) || Promise.resolve())
    .catch(() => {
      /* Cancellation/failure is observed by the original save promise. */
    })
    .then(work)
  uploads.set(threadId, pending)
  void pending
    .finally(() => {
      if (uploads.get(threadId) === pending) uploads.delete(threadId)
    })
    .catch(() => {
      /* Cancellation/failure is observed by the original save promise. */
    })
  return pending
}
const identity = (profile: NotesSaveProfile | null) =>
  JSON.stringify([profile?.uuid || '', profile?.email?.toLowerCase() || ''])

/** Capture ownership before debounce/serialization, never after a local save.
 * Local writes and outbound dispatch each remain ordered. Submitted requests cannot be undone.
 */
export function bindNotesSave(deps: NotesSaveDependencies): BoundNotesSave {
  const revision = getProfileRevision()
  const origin = deps.readProfile().then(profile =>
    profile
      ? {
          uuid: profile.uuid,
          email: profile.email,
          sharing_permission: profile.sharing_permission,
        }
      : null,
  )
  void origin.catch(() => {
    /* Cancellation/failure is observed by the original save promise. */
  }) // A superseded debounce may never invoke this binding.
  let invalidated = false
  const current = () => !invalidated && revision === getProfileRevision() && deps.bindingCurrent()
  const save = async (threadId: number, notes: string, generation?: NotesGeneration) => {
    const controller = new AbortController()
    const changed = () => {
      invalidated = true
      controller.abort(
        new Error('Account changed. This note save was cancelled; the local draft was kept.'),
      )
    }
    if (typeof window !== 'undefined') window.addEventListener(PROFILE_CHANGED_EVENT, changed)
    const generationAborted = () =>
      controller.abort(generation?.signal.reason || new Error('Note generation cancelled.'))
    generation?.signal.addEventListener('abort', generationAborted, { once: true })
    const guard = () => {
      generation?.check()
      if (!current()) changed()
      if (controller.signal.aborted) throw controller.signal.reason
    }
    const check = async () => {
      guard()
      const owner = await waitForAbort(origin, controller.signal)
      guard()
      if (
        deps.expectedEmail !== undefined &&
        (!deps.expectedEmail ||
          !owner?.uuid ||
          owner.email?.toLowerCase() !== deps.expectedEmail.toLowerCase())
      ) {
        invalidated = true
        throw new Error('The originating account is unavailable. The local draft was kept.')
      }
      const active = await waitForAbort(deps.readProfile(), controller.signal)
      guard()
      if (identity(owner) !== identity(active)) {
        changed()
        guard()
      }
      return { owner, active }
    }
    const localSave = async () => {
      await check()
      // Do not abort or release the ordering barrier for an already-submitted
      // local write. A later save waits for its actual acknowledgement.
      const response = await deps.fetcher(deps.localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, notes }),
      })
      const local = await response.json()
      if (!response.ok || local?.success !== true) throw new Error('Failed saving notes locally')
    }
    const outbound = async () => {
      const { owner, active } = await check()
      if (
        !owner?.uuid ||
        !owner.email ||
        !notes ||
        !deps.canShare(owner.sharing_permission) ||
        !deps.canShare(active?.sharing_permission)
      )
        return
      const metadataResponse = await waitForAbort(
        deps.fetcher(`${deps.metadataUrl}/${threadId}`, {
          method: 'GET',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          signal: controller.signal,
        }),
        controller.signal,
      )
      const metadata = await waitForAbort(metadataResponse.json(), controller.signal)
      const permitted = await check()
      if (!deps.canShare(permitted.active?.sharing_permission)) return
      if (!metadataResponse.ok || metadata?.success !== true) return
      const transcript = metadata.data || {}
      const token = await waitForAbort(deps.tokenForEmail(owner.email), controller.signal)
      const latest = await check()
      if (!deps.canShare(latest.active?.sharing_permission)) return
      const body = {
        thread_id: threadId,
        notes,
        uuid: owner.uuid,
        metadata: transcript.filename
          ? {
              uuid: owner.uuid,
              participants: transcript.participants ? String(transcript.participants) : '[]',
              start_time: transcript.startTime ? String(transcript.startTime) : '',
              end_time: transcript.endTime ? String(transcript.endTime) : '',
              filename: transcript.filename,
              thread_id: String(threadId),
            }
          : {},
      }
      const uploaded = await waitForAbort(
        deps.fetcher(`${deps.serverUrl}/api/files/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
          signal: controller.signal,
        }),
        controller.signal,
      )
      await check() // A stale completion must not acknowledge/clear another draft.
      if (!uploaded.ok)
        deps.reportCloudFailure?.(new Error('Notes were saved locally but the server save failed.'))
    }
    try {
      guard()
      const local = generation
        ? generation.write(localSave)
        : serializeNotesWrite(threadId, localSave)
      void local.catch(() => {
        /* Cancellation/failure is observed by the original save promise. */
      })
      // Reserve outbound order at admission, while keeping future local autosaves
      // independent of cloud latency. Each outbound slot waits for its own local ack.
      await serializeUpload(threadId, async () => {
        await local
        await outbound()
      })
    } finally {
      if (typeof window !== 'undefined') window.removeEventListener(PROFILE_CHANGED_EVENT, changed)
      generation?.signal.removeEventListener('abort', generationAborted)
    }
  }
  return Object.assign(save, { isCurrent: current })
}
