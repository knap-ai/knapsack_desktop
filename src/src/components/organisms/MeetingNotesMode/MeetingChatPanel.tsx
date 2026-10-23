import type { ComponentProps, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'

import ClawdChat from 'src/components/organisms/ClawdChat'

interface MeetingChatPanelProps {
  height: number
  minimized: boolean
  resizing: boolean
  onMinimize: () => void
  onResizeClick: () => void
  onResizePointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onResizePointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onResizePointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
  onResizeKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void
  onBusyChange: (busy: boolean) => void
  chatProps: Omit<ComponentProps<typeof ClawdChat>, 'onBusyChange'>
}

const MeetingChatPanel = ({
  height,
  minimized,
  resizing,
  onMinimize,
  onResizeClick,
  onResizePointerDown,
  onResizePointerMove,
  onResizePointerUp,
  onResizeKeyDown,
  onBusyChange,
  chatProps,
}: MeetingChatPanelProps) => (
  <section
    className={`notetaker-note__chat-overlay ${resizing ? 'notetaker-note__chat-overlay--resizing' : ''}`}
    aria-label="Meeting chat"
    style={{ height: `${height}px` }}
    hidden={minimized}
  >
    <button
      type="button"
      className="notetaker-note__chat-overlay-handle"
      aria-label="Resize meeting chat. Drag up to expand or down to collapse."
      aria-expanded={height > 460}
      title="Drag to resize · Click to expand or collapse"
      onPointerDown={onResizePointerDown}
      onPointerMove={onResizePointerMove}
      onPointerUp={onResizePointerUp}
      onPointerCancel={onResizePointerUp}
      onClick={onResizeClick}
      onKeyDown={onResizeKeyDown}
    />
    <button
      type="button"
      className="notetaker-note__chat-overlay-close"
      onClick={onMinimize}
      title="Minimize meeting chat"
      aria-label="Minimize meeting chat"
    >
      <span aria-hidden="true">—</span>
    </button>
    <ClawdChat {...chatProps} onBusyChange={onBusyChange} />
  </section>
)

export default MeetingChatPanel
