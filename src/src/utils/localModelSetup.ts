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


export async function localAiReady(): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const paths = ['/api/clawd/service/api-key-status', '/api/knapsack/ollama/status?cloud=false', '/api/knapsack/ollama/models?cloud=false']
    const [provider, runtime, catalog] = await Promise.all(paths.map(async path => {
      const response = await fetch('http://127.0.0.1:8897' + path, { signal: controller.signal })
      if (!response.ok) throw new Error('Local AI status unavailable')
      return response.json()
    }))
    return provider.ollama_enabled === true && !provider.ollama_cloud_enabled && runtime.running === true
      && typeof provider.ollama_model === 'string' && isLocalModelTag(provider.ollama_model)
      && catalog.models?.some((model: { name: string }) => model.name === provider.ollama_model) === true
  } catch { return false }
  finally { clearTimeout(timeout) }
}
