export type SpeechAuth = { provider: 'openai' | 'groq'; apiKey: string; model: string; endpoint: string }

export function speechCandidates(keys: { openai_key?: string; groq_key?: string }): SpeechAuth[] {
  const candidates: SpeechAuth[] = []
  if (keys.openai_key?.trim()) candidates.push({ provider: 'openai', apiKey: keys.openai_key.trim(), model: 'whisper-1', endpoint: 'https://api.openai.com/v1/audio/transcriptions' })
  if (keys.groq_key?.trim()) candidates.push({ provider: 'groq', apiKey: keys.groq_key.trim(), model: 'whisper-large-v3-turbo', endpoint: 'https://api.groq.com/openai/v1/audio/transcriptions' })
  return candidates
}

export async function transcribeWithFallback(
  audio: Blob, extension: string, candidates: SpeechAuth[], signal: AbortSignal,
  privacyEnabled: () => boolean, timeoutMs = 20_000,
  authorize?: (auth: SpeechAuth) => Promise<void>,
): Promise<{ text: string; auth: SpeechAuth }> {
  const errors: string[] = []
  for (const auth of candidates) {
    if (signal.aborted) throw new Error('Transcription cancelled')
    if (privacyEnabled()) throw new Error('Cloud transcription is disabled in Privacy Mode')
    try { await authorize?.(auth) } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Privacy policy rejected this provider')
      continue
    }
    if (signal.aborted || privacyEnabled()) throw new Error('Transcription cancelled by Privacy Mode')
    const attempt = new AbortController()
    const cancel = () => attempt.abort()
    signal.addEventListener('abort', cancel, { once: true })
    const timeout = setTimeout(cancel, timeoutMs)
    try {
      const body = new FormData()
      body.append('file', audio, `recording.${extension}`)
      body.append('model', auth.model)
      const response = await fetch(auth.endpoint, { method: 'POST', redirect: 'error', signal: attempt.signal, headers: { Authorization: `Bearer ${auth.apiKey}` }, body })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (typeof data.text !== 'string') throw new Error('Invalid transcription response')
      return { text: data.text, auth }
    } catch (error) {
      if (signal.aborted) throw error
      errors.push(`${auth.provider}: ${error instanceof Error ? error.message : 'Request failed'}`)
    } finally {
      clearTimeout(timeout)
      signal.removeEventListener('abort', cancel)
    }
  }
  throw new Error(errors.join('; ') || 'No speech provider connected')
}
