import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

import type { RelationshipSource, Workspace } from 'src/api/workspaces'
import { personChatContext } from 'src/utils/personChatContext'

import MeetingChatPanel from '../MeetingNotesMode/MeetingChatPanel'
import WorkspaceView from '../WorkspaceView'

type Props = {
  workspace: Workspace
  userEmail: string
  userName?: string
  onBack: () => void
  onOpenCalendarSource?: (source: RelationshipSource) => Promise<void>
}
/** Owned, visible person chat; opening the view never sends a prompt. */
export default function PersonWorkspace(props: Props) {
  const scope = JSON.stringify([
    props.userEmail.trim().toLowerCase(),
    props.workspace.uuid,
    props.workspace.entityType,
  ])
  // Reset cached identity, visibility and draft ownership synchronously on a
  // scope change. A name edit keeps this key stable and preserves the draft.
  return <ScopedPersonWorkspace key={scope} {...props} />
}

function ScopedPersonWorkspace({
  workspace,
  userEmail,
  userName,
  onBack,
  onOpenCalendarSource,
}: Props) {
  const [opened, setOpened] = useState(false),
    [showChat, setShowChat] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspace)
  const context = personChatContext(selectedWorkspace, userEmail)
  const launcher = useRef<HTMLElement | null>(null)
  const drag = useRef<{ id: number; y: number; height: number } | null>(null)
  const didDrag = useRef(false)
  const [height, setHeight] = useState(460)
  const [resizing, setResizing] = useState(false)
  const [busy, setBusy] = useState(false)
  const clamp = (value: number) => Math.max(240, Math.min(window.innerHeight - 120, value))
  const minimize = () => {
    drag.current = null
    setResizing(false)
    setShowChat(false)
    if (launcher.current?.isConnected) launcher.current.focus()
  }
  const resizeStart = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    drag.current = { id: event.pointerId, y: event.clientY, height }
    didDrag.current = false
    setResizing(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const resizeMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.id !== event.pointerId) return
    const delta = drag.current.y - event.clientY
    if (Math.abs(delta) > 3) didDrag.current = true
    setHeight(clamp(drag.current.height + delta))
  }
  const resizeEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current && drag.current.id !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    drag.current = null
    setResizing(false)
  }
  const resizeKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next =
      event.key === 'ArrowUp'
        ? height + 40
        : event.key === 'ArrowDown'
          ? height - 40
          : event.key === 'Home'
            ? 280
            : event.key === 'End'
              ? window.innerHeight - 120
              : null
    if (next === null) return
    event.preventDefault()
    setHeight(clamp(next))
  }
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="contents">
        <WorkspaceView
          workspace={workspace}
          onBack={onBack}
          onOpenCalendarSource={onOpenCalendarSource}
          onOpenPersonChat={
            context
              ? (currentWorkspace, origin) => {
                  // Accept only this selected person's saved snapshot. Do not
                  // carry an old account/person's cached identity into a new scope.
                  if (
                    currentWorkspace.uuid !== workspace.uuid ||
                    !personChatContext(currentWorkspace, userEmail)
                  )
                    return
                  launcher.current =
                    origin ||
                    (document.activeElement instanceof HTMLElement ? document.activeElement : null)
                  setSelectedWorkspace(currentWorkspace)
                  setOpened(true)
                  setShowChat(true)
                }
              : undefined
          }
        />
      </div>
      {busy && !showChat && (
        <span className="sr-only" role="status">
          Person chat is still working
        </span>
      )}
      {opened && context && (
        <MeetingChatPanel
          label="Person chat"
          className="person-chat-overlay"
          height={height}
          minimized={!showChat}
          resizing={resizing}
          onMinimize={minimize}
          onResizePointerDown={resizeStart}
          onResizePointerMove={resizeMove}
          onResizePointerUp={resizeEnd}
          onResizeClick={() => {
            if (didDrag.current) {
              didDrag.current = false
              return
            }
            setHeight(clamp(height > 460 ? 280 : window.innerHeight - 120))
          }}
          onResizeKeyDown={resizeKey}
          onBusyChange={setBusy}
          chatProps={{
            chatId: context.chatId,
            sessionId: context.sessionId,
            title: context.title,
            contextPrefix: context.contextPrefix,
            userEmail,
            userName,
            compact: true,
            active: true,
          }}
        />
      )}
    </div>
  )
}
