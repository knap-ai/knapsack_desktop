import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import {
  Workspace,
  WorkspaceDocument,
  SearchResultItem,
  getWorkspace,
  updateWorkspace,
  addDocumentToWorkspace,
  removeDocumentFromWorkspace,
  searchWorkspace,
  parseTags,
} from '../../../api/workspaces'

interface WorkspaceViewProps {
  workspace: Workspace
  onBack: () => void
}

function WorkspaceView({ workspace, onBack }: WorkspaceViewProps) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(workspace)
  const [documents, setDocuments] = useState<WorkspaceDocument[]>(workspace.documents ?? [])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(workspace.name)
  const [editDescription, setEditDescription] = useState(workspace.description ?? '')
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null)
  const [expandedSummary, setExpandedSummary] = useState<number | null>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const refreshWorkspace = useCallback(async () => {
    try {
      const res = await getWorkspace(currentWorkspace.uuid)
      if (res.success && res.data) {
        setCurrentWorkspace(res.data)
        setDocuments(res.data.documents ?? [])
      }
    } catch (err) {
      console.error('Failed to refresh workspace:', err)
    }
  }, [currentWorkspace.uuid])

  useEffect(() => {
    refreshWorkspace()
  }, [refreshWorkspace])

  /** Collect all unique tags across documents for the filter bar. */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const doc of documents) {
      for (const tag of parseTags(doc.autoTags)) tagSet.add(tag)
      for (const tag of parseTags(doc.tags)) tagSet.add(tag)
    }
    return [...tagSet].sort()
  }, [documents])

  /** Filter documents by active tag. */
  const filteredDocuments = useMemo(() => {
    if (!activeTagFilter) return documents
    return documents.filter(doc => {
      const docTags = [...parseTags(doc.autoTags), ...parseTags(doc.tags)]
      return docTags.includes(activeTagFilter)
    })
  }, [documents, activeTagFilter])

  const handleAddFiles = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'Documents',
            extensions: ['pdf', 'txt', 'md', 'doc', 'docx', 'csv', 'json', 'html', 'xml', 'rtf'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      })

      if (!selected) return

      const files = Array.isArray(selected) ? selected : [selected]
      for (const filePath of files) {
        const fileName = filePath.split(/[/\\]/).pop() ?? filePath
        const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
        await addDocumentToWorkspace(currentWorkspace.uuid, fileName, filePath, ext)
      }
      await refreshWorkspace()
    } catch (err) {
      console.error('Failed to add files:', err)
    }
  }

  const handleAddFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      })

      if (!selected || typeof selected !== 'string') return

      // Add the folder path as a document entry
      const folderName = selected.split(/[/\\]/).pop() ?? selected
      await addDocumentToWorkspace(currentWorkspace.uuid, folderName, selected, 'folder')
      await refreshWorkspace()
    } catch (err) {
      console.error('Failed to add folder:', err)
    }
  }

  const handleRemoveDocument = async (docId: number) => {
    try {
      const res = await removeDocumentFromWorkspace(currentWorkspace.uuid, docId)
      if (res.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      }
    } catch (err) {
      console.error('Failed to remove document:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const res = await searchWorkspace(currentWorkspace.uuid, searchQuery.trim())
      if (res.success) {
        setSearchResults(res.results)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      const res = await updateWorkspace(
        currentWorkspace.uuid,
        editName.trim(),
        editDescription.trim() || undefined,
      )
      if (res.success && res.data) {
        setCurrentWorkspace(res.data)
      }
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update workspace:', err)
    }
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length === 0) return

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
        await addDocumentToWorkspace(
          currentWorkspace.uuid,
          file.name,
          (file as any).path ?? undefined,
          ext,
        )
      }
      await refreshWorkspace()
    },
    [currentWorkspace.uuid, refreshWorkspace],
  )

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return ''
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  /** Icon for document type. */
  const docIcon = (doc: WorkspaceDocument) => {
    if (doc.documentType === 'chat_output') return '\uD83D\uDCAC' // speech bubble
    if (doc.documentType === 'folder') return '\uD83D\uDCC2' // open folder
    return '\uD83D\uDCC4' // page
  }

  return (
    <div className="flex flex-col p-6 pl-10 h-full">
      {/* Back button and header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
          onClick={onBack}
        >
          &larr; Back
        </button>
      </div>

      {/* Workspace header */}
      {isEditing ? (
        <div className="mb-6">
          <input
            type="text"
            className="font-semibold text-2xl border border-gray-300 rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            autoFocus
          />
          <textarea
            className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2 mt-2">
            <button
              className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => {
                setIsEditing(false)
                setEditName(currentWorkspace.name)
                setEditDescription(currentWorkspace.description ?? '')
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentWorkspace.icon || '\uD83D\uDCC1'}</span>
            <h1 className="font-semibold text-2xl">{currentWorkspace.name}</h1>
            <button
              className="text-xs text-gray-400 hover:text-gray-600 ml-2 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          </div>
          {currentWorkspace.description && (
            <p className="text-sm text-gray-500 mt-1 ml-10">
              {currentWorkspace.description}
            </p>
          )}
        </div>
      )}

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              !activeTagFilter
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setActiveTagFilter(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                activeTagFilter === tag
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search within this collection..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-3 border border-gray-200 rounded-md divide-y divide-gray-100">
            {searchResults.map((result, idx) => (
              <div key={result.id || idx} className="p-3">
                <div className="text-sm font-medium">
                  Score: {result.score.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {JSON.stringify(result.payload, null, 2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={handleAddFiles}
        >
          + Add Files
        </button>
        <button
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={handleAddFolder}
        >
          + Add Folder
        </button>
      </div>

      {/* Document list with drop zone */}
      <div
        ref={dropRef}
        className={`flex-1 border-2 rounded-lg p-4 transition-colors min-h-[200px] ${
          isDragging
            ? 'border-blue-400 bg-blue-50/50 border-dashed'
            : 'border-gray-200 border-solid'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-sm font-medium text-gray-700 mb-3">
          Documents ({filteredDocuments.length}{activeTagFilter ? ` of ${documents.length}` : ''})
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            {activeTagFilter ? (
              <>
                <div className="text-sm">No documents matching tag &quot;{activeTagFilter}&quot;</div>
                <button
                  className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                  onClick={() => setActiveTagFilter(null)}
                >
                  Clear filter
                </button>
              </>
            ) : (
              <>
                <div className="text-lg mb-1">Drop files here</div>
                <div className="text-sm">
                  or use the &quot;Add Files&quot; button above
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map(doc => {
              const autoTags = parseTags(doc.autoTags)
              const userTags = parseTags(doc.tags)
              const hasSummary = !!doc.summary
              const isExpanded = expandedSummary === doc.id

              return (
                <div
                  key={doc.id}
                  className="border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-400 text-sm flex-shrink-0">
                        {docIcon(doc)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{doc.documentName}</div>
                        {doc.documentPath && (
                          <div className="text-xs text-gray-400 truncate">{doc.documentPath}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {hasSummary && (
                        <button
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setExpandedSummary(isExpanded ? null : doc.id)}
                          title={isExpanded ? 'Hide summary' : 'Show summary'}
                        >
                          {isExpanded ? 'Hide' : 'Summary'}
                        </button>
                      )}
                      {doc.createdAt && (
                        <span className="text-xs text-gray-400">
                          {formatDate(doc.createdAt)}
                        </span>
                      )}
                      <button
                        className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-red-50"
                        onClick={() => doc.id && handleRemoveDocument(doc.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Tags row */}
                  {(autoTags.length > 0 || userTags.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-8">
                      {autoTags.map(tag => (
                        <span
                          key={`auto-${tag}`}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                        >
                          {tag}
                        </span>
                      ))}
                      {userTags.map(tag => (
                        <span
                          key={`user-${tag}`}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable summary */}
                  {isExpanded && doc.summary && (
                    <div className="mt-2 ml-8 text-xs text-gray-500 bg-gray-50 rounded-md p-2">
                      {doc.summary}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceView
