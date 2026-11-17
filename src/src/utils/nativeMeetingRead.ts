import { invoke } from '@tauri-apps/api/tauri'

export type MeetingReadOwner = { email: string; uuid: string }
export async function readNativeMeeting<T>(
  command: 'read_saved_notes_transcript' | 'read_saved_meeting_notes',
  threadId: number,
  owner: MeetingReadOwner | undefined,
  kind: 'transcript' | 'notes',
): Promise<T> {
  if (!owner?.email || !owner.uuid)
    throw new Error('Account changed before the saved meeting could be read.')
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      invoke<T>(command, { threadId, expectedEmail: owner.email, expectedUuid: owner.uuid }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                `Reading the saved ${kind} timed out. Your recording is preserved. Retry ${kind === 'notes' ? 'loading' : 'notes'}.`,
              ),
            ),
          15000,
        )
      }),
    ])
  } catch (error) {
    if (
      error instanceof Error &&
      /^Reading the saved (transcript|notes) timed out\./.test(error.message)
    )
      throw error
    throw new Error(`Could not read the saved meeting ${kind}. Your recording is preserved.`)
  } finally {
    if (timer) clearTimeout(timer)
  }
}
