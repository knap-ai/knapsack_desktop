export interface TranscriptClipboard {
  writeText: (text: string) => Promise<void>
}

export const transcriptBodyForClipboard = (raw: string): string => {
  const parts = raw.split(/\n{3,}/).map(part => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join('\n\n') : raw.trim()
}

export async function copyTranscriptText(
  text: string,
  clipboard: TranscriptClipboard | undefined = navigator.clipboard,
): Promise<void> {
  const transcript = text.trim()
  if (!transcript) throw new Error('No transcript is available to copy.')
  if (!clipboard?.writeText) throw new Error('Clipboard access is unavailable.')
  await clipboard.writeText(transcript)
}
