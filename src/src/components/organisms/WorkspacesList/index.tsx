import { useEffect, useState } from 'react'
import {
  Workspace,
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from '../../../api/workspaces'

interface WorkspacesListProps {
  onWorkspaceOpen: (workspace: Workspace) => void
}

function WorkspacesList({ onWorkspaceOpen }: WorkspacesListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const res = await listWorkspaces()
      if (res.success) {
        setWorkspaces(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const res = await createWorkspace(newName.trim(), newDescription.trim() || undefined)
      if (res.success && res.data) {
        setWorkspaces(prev => [res.data!, ...prev])
        setShowCreateModal(false)
        setNewName('')
        setNewDescription('')
      }
    } catch (err) {
      console.error('Failed to create workspace:', err)
    }
  }

  const handleDelete = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this workspace and all its documents?')) return
    try {
      const res = await deleteWorkspace(uuid)
      if (res.success) {
        setWorkspaces(prev => prev.filter(w => w.uuid !== uuid))
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err)
    }
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className="flex flex-col p-6 pl-10">
      <div className="font-semibold text-2xl">Knowledge Bases</div>
      <div className="font-medium text-lg mb-8 text-gray-500">
        Create project-specific knowledge bases by adding documents.
      </div>

      <div className="flex flex-row flex-wrap gap-4">
        {loading && workspaces.length === 0 && (
          <div className="text-gray-400 text-sm">Loading...</div>
        )}

        {workspaces.map(workspace => (
          <div
            key={workspace.uuid}
            className="border border-gray-200 rounded-lg h-48 w-64 flex flex-col justify-between p-4 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
            onClick={() => onWorkspaceOpen(workspace)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{workspace.icon || '\uD83D\uDCC1'}</span>
                <span className="font-semibold text-lg truncate">{workspace.name}</span>
              </div>
              {workspace.description && (
                <div className="text-sm text-gray-500 line-clamp-2">
                  {workspace.description}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {workspace.documents?.length ?? 0} doc{(workspace.documents?.length ?? 0) !== 1 ? 's' : ''}
                {workspace.createdAt ? ` - ${formatDate(workspace.createdAt)}` : ''}
              </div>
              <button
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                onClick={(e) => handleDelete(e, workspace.uuid)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Create new workspace card */}
        <div
          className="border border-dashed border-gray-300 rounded-lg h-48 w-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <div className="text-3xl text-gray-400 mb-2">+</div>
          <div className="font-semibold text-gray-600">Create Knowledge Base</div>
          <div className="text-sm text-gray-400 text-center px-4 mt-1">
            Add documents for project-specific search.
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="font-semibold text-lg mb-4">Create Knowledge Base</div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Project Alpha"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What is this knowledge base about?"
                rows={3}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewName('')
                  setNewDescription('')
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkspacesList
