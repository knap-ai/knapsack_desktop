export type LocalHardware = {
  memory_bytes: number
  available_memory_bytes: number
  architecture: string
  cpu: string
}
export function recommendLocalModel(hardware: LocalHardware | null) {
  // Conservative RAM guidance; model weights are only part of runtime memory.
  const gb = (hardware?.memory_bytes ?? 0) / 2 ** 30
  return gb >= 32 ? 'qwen3:14b' : gb >= 16 ? 'qwen3:8b' : 'qwen3:4b'
}
export function isLocalModelTag(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/.test(value) && !/(?:^|[:/-])cloud(?:$|[:/-])/i.test(value)
}
export async function readPullProgress(response: Response, update: (message: string) => void) {
  if (!response.ok || !response.body)
    throw new Error('Could not download the model. Check that Ollama is running and try again.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = '',
    complete = false
  const consume = (line: string) => {
    if (!line.trim()) return
    const data = JSON.parse(line)
    if (data.error) throw new Error(data.error)
    if (data.status === 'success') complete = true
    const percent =
      data.total > 0 ? ` ${Math.round((100 * (data.completed || 0)) / data.total)}%` : ''
    update(`${data.status || 'Downloading'}${percent}`)
  }
  try {
    while (true) {
      const { done, value } = await reader.read()
      pending += decoder.decode(value, { stream: !done })
      const lines = pending.split('\n')
      pending = lines.pop() || ''
      lines.forEach(consume)
      if (done) break
    }
    consume(pending)
    if (!complete) throw new Error('Download ended before completion. Try again to resume.')
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
