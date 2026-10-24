export interface HomeEscapeActions {
  preserveMeetingSelection: boolean
  errorCallback: () => void
  stopLLMExecution: () => void | Promise<void>
  unselectFeedItem: () => void
  showWelcome: () => void
}

export const handleHomeEscape = (event: KeyboardEvent, actions: HomeEscapeActions) => {
  if (event.key !== 'Escape') return false

  // A minimized meeting chat stays mounted so submitted and queued work can
  // finish. Clearing the selected meeting here would unmount that chat and
  // discard its in-memory request/result state.
  if (actions.preserveMeetingSelection) return false

  actions.errorCallback()
  event.preventDefault()
  void actions.stopLLMExecution()
  actions.unselectFeedItem()
  actions.showWelcome()
  return true
}
