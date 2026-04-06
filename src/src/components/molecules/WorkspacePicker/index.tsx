import { useEffect, useRef, useState } from 'react'
import { Workspace, listWorkspaces, saveChatToWorkspace } from '../../../api/workspaces'

interface WorkspacePickerProps {
  /** The chat message text to save. */
  text: string
  /** Called when the popover should close. */
  onClose: () => void
  /** Called after a successful save with the workspace name. */
  onSaved?: (workspaceName: string) => void
}

function WorkspacePicker({ text, onClose, onSaved }: WorkspacePickerProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(() => {
    // Default title: first line of text, truncated
    const firstLine = text.split('\n')[0] || 'Saved answer'
    return firstLine.slice(0, 80)
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listWorkspaces()
      .then(res => {
        if (res.success) setWorkspaces(res.data)
      })
      .catch(err => console.error('Failed to load workspaces:', err))
      .finally(() => setLoading(false))
  }, [])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleSave = async (workspace: Workspace) => {
    if (saving) return
    setSaving(true)
    try {
      const res = await saveChatToWorkspace(workspace.uuid, text, title.trim() || 'Saved answer')
      if (res.success) {
        onSaved?.(workspace.name)
        onClose()
      }
    } catch (err) {
      console.error('Failed to save to workspace:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-8 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64 overflow-hidden"
      style={{ maxHeight: 320 }}
    >
      <div className="p-3 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500 mb-2">Save to collection</div>
        <input
          type="text"
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
        {loading && (
          <div className="p-3 text-xs text-gray-400">Loading...</div>
        )}

        {!loading && workspaces.length === 0 && (
          <div className="p-3 text-xs text-gray-400">
            No collections yet. Create one in the Library tab.
          </div>
        )}

        {workspaces.map(ws => (
          <button
            key={ws.uuid}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            onClick={() => handleSave(ws)}
            disabled={saving}
          >
            <span className="text-sm">{ws.icon || '\uD83D\uDCC1'}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{ws.name}</div>
              <div className="text-xs text-gray-400">
                {ws.documents?.length ?? 0} doc{(ws.documents?.length ?? 0) !== 1 ? 's' : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WorkspacePicker
