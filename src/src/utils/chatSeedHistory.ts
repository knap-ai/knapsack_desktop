export function buildChatSeedHistory(messages: readonly { role: string; text: string }[]) {
  let remaining = 16_000
  const history: { role: 'user' | 'assistant'; content: string }[] = []
  for (const message of messages.slice(-12).reverse()) {
    if ((message.role !== 'user' && message.role !== 'assistant') || !message.text.trim()) continue
    const content = message.text.slice(0, Math.min(4000, remaining))
    if (!content) break
    history.unshift({ role: message.role, content })
    remaining -= content.length
  }
  return history
}
