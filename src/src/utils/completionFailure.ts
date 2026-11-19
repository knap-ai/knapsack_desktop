import {
  CHAT_COMPLETION_ERROR_MESSAGES_MAPPING,
  ChatCompletionError,
} from './exceptions/chat_completion'

/** Decode bounded native metadata; never display or log a provider's raw response body. */
export async function completionFailure(response: Response): Promise<ChatCompletionError> {
  let code: unknown
  const reader = response.body?.getReader()
  if (reader) {
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      for (;;) {
        const part = await reader.read()
        if (part.done) break
        size += part.value.byteLength
        if (size > 8192) {
          await reader.cancel()
          break
        }
        chunks.push(part.value)
      }
      if (size <= 8192) {
        const bytes = new Uint8Array(size)
        let offset = 0
        for (const chunk of chunks) {
          bytes.set(chunk, offset)
          offset += chunk.length
        }
        const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
        if (parsed && typeof parsed === 'object' && 'error_code' in parsed) code = parsed.error_code
      }
    } catch (error) {
      if (
        error !== null &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'AbortError'
      )
        throw error
    } finally {
      reader.releaseLock()
    }
  }
  if (
    typeof code === 'string' &&
    Object.prototype.hasOwnProperty.call(CHAT_COMPLETION_ERROR_MESSAGES_MAPPING, code)
  ) {
    const ErrorType =
      CHAT_COMPLETION_ERROR_MESSAGES_MAPPING[
        code as keyof typeof CHAT_COMPLETION_ERROR_MESSAGES_MAPPING
      ]
    return new ErrorType()
  }
  const message =
    response.status === 401 || response.status === 403
      ? `The AI request was not authorized (HTTP ${response.status}). Existing content was not changed.`
      : response.status === 402
        ? 'The current AI account requires credits. Existing content was not changed.'
        : response.status === 429
          ? 'The current AI service is busy. Existing content was not changed; retry later.'
          : response.status === 408 || response.status === 504
            ? 'The AI service timed out. Existing content was not changed.'
            : `The AI request failed (HTTP ${response.status}). Existing content was not changed.`
  return new ChatCompletionError(message)
}

/** Notes and briefs submit once even when a legacy caller has no generation signal. */
export async function fetchCompletionOnce(
  url: string,
  init: RequestInit,
  signal?: AbortSignal,
): Promise<Response> {
  const controller = signal ? undefined : new AbortController()
  const timeout = controller ? setTimeout(() => controller.abort(), 180000) : undefined
  try {
    return await fetch(url, { ...init, signal: signal || controller?.signal })
  } finally {
    if (timeout !== undefined) clearTimeout(timeout)
  }
}
