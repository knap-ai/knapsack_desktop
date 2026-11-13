import { useState } from 'react'

import type { Workspace } from 'src/api/workspaces'
import { personChatContext } from 'src/utils/personChatContext'

import ClawdChat from '../ClawdChat'
import WorkspaceView from '../WorkspaceView'

type Props = { workspace: Workspace; userEmail: string; userName?: string; onBack: () => void }
/** Owned, visible person chat; opening the view never sends a prompt. */
export default function PersonWorkspace({ workspace, userEmail, userName, onBack }: Props) {
  const [opened, setOpened] = useState(false),
    [showChat, setShowChat] = useState(false)
  const scope = JSON.stringify([userEmail.trim().toLowerCase(), workspace.uuid])
  const [chatTarget, setChatTarget] = useState<{ scope: string; workspace: Workspace }>()
  const selectedWorkspace = chatTarget?.scope === scope ? chatTarget.workspace : workspace
  const context = personChatContext(selectedWorkspace, userEmail)
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={showChat ? 'hidden' : 'contents'}>
        <WorkspaceView
          workspace={workspace}
          onBack={onBack}
          onOpenPersonChat={
            context
              ? currentWorkspace => {
                  // Accept only this selected person's saved snapshot. Do not
                  // carry an old account/person's cached identity into a new scope.
                  if (currentWorkspace.uuid !== workspace.uuid || !personChatContext(currentWorkspace, userEmail)) return
                  setChatTarget({ scope, workspace: currentWorkspace })
                  setOpened(true)
                  setShowChat(true)
                }
              : undefined
          }
        />
      </div>
      {opened && context && (
        <div
          className={showChat ? 'flex h-full min-h-0 flex-col' : 'hidden'}
          aria-hidden={!showChat}
        >
          <button
            type="button"
            className="self-start px-4 py-2 text-sm underline"
            onClick={() => setShowChat(false)}
          >
            Back to {selectedWorkspace.name}
          </button>
          <div className="min-h-0 flex-1">
            <ClawdChat
              key={context.chatId}
              chatId={context.chatId}
              sessionId={context.sessionId}
              title={context.title}
              contextPrefix={context.contextPrefix}
              userEmail={userEmail}
              userName={userName}
              active={showChat}
              foregroundActive={showChat}
            />
          </div>
        </div>
      )}
    </div>
  )
}
