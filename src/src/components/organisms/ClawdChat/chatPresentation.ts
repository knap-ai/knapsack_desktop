/** Hide only app-generated introductory rows; never modify persisted history. */
export function visibleScopedMessages<T extends { msg: { id: string } }>(
  rows: T[],
  scoped: boolean,
): T[] {
  return scoped
    ? rows.filter(({ msg }) => !msg.id.startsWith('welcome-') && !msg.id.startsWith('example-'))
    : rows
}

/** The user can scroll away between a React update and the next paint. */
export function scheduleChatFollow(element: HTMLElement, shouldFollow: () => boolean): () => void {
  const frame = requestAnimationFrame(() => {
    if (element.isConnected && shouldFollow()) element.scrollTop = element.scrollHeight
  })
  return () => cancelAnimationFrame(frame)
}
