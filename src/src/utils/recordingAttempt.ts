/** A delayed poll acknowledges only the still-current attempt and native thread. */
export async function confirmRecordingAttempt(
  threadId: number,
  current: () => boolean,
  read: () => Promise<false | { isRecording: boolean; threadId: number | null }>,
): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 300))
  if (!current()) return false
  const status = await read()
  return current() && !!status && status.isRecording && status.threadId === threadId
}
