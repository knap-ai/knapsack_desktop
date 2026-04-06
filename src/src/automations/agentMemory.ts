const MEMORY_KEY_PREFIX = 'kn_agent_memory_'
const MAX_ENTRIES = 10

interface MemoryEntry {
  timestamp: string
  summary: string
}

export function getAgentMemory(agentId: string): MemoryEntry[] {
  const raw = localStorage.getItem(`${MEMORY_KEY_PREFIX}${agentId}`)
  return raw ? JSON.parse(raw) : []
}

export function saveAgentMemory(agentId: string, fullReply: string): void {
  const entries = getAgentMemory(agentId)
  entries.push({ timestamp: new Date().toISOString(), summary: fullReply.slice(0, 500) })
  localStorage.setItem(
    `${MEMORY_KEY_PREFIX}${agentId}`,
    JSON.stringify(entries.slice(-MAX_ENTRIES)),
  )
}

export function clearAgentMemory(agentId: string): void {
  localStorage.removeItem(`${MEMORY_KEY_PREFIX}${agentId}`)
}
