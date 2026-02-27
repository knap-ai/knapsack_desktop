import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getMcpServers,
  installMcpServer,
  uninstallMcpServer,
  enableMcpServer,
  disableMcpServer,
  updateMcpServerConfig,
  addCustomMcpServer,
  type McpServer,
  type NewMcpServer,
} from '../../../api/mcp'
import MCPServerCard from '../../molecules/MCPServerCard'
import MCPConfigModal from '../../molecules/MCPConfigModal'
import { Dialog } from '../../molecules/Dialog'

const CATEGORIES = ['All', 'Productivity', 'Developer', 'Database', 'Search', 'Communication', 'AI']

const MCPMarketplace: React.FC = () => {
  const [servers, setServers] = useState<McpServer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [loadingUuid, setLoadingUuid] = useState<string | null>(null)
  const [configServer, setConfigServer] = useState<McpServer | null>(null)
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Custom server form state
  const [customName, setCustomName] = useState('')
  const [customCommand, setCustomCommand] = useState('')
  const [customArgs, setCustomArgs] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  const fetchServers = useCallback(async () => {
    try {
      const data = await getMcpServers()
      setServers(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch MCP servers:', err)
      setError('Failed to load MCP servers. Please try again.')
    }
  }, [])

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  const filteredServers = useMemo(() => {
    let result = servers

    if (activeCategory !== 'All') {
      result = result.filter(s => s.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.author && s.author.toLowerCase().includes(query)),
      )
    }

    return result
  }, [servers, activeCategory, searchQuery])

  const installedCount = useMemo(() => servers.filter(s => s.isInstalled).length, [servers])

  const handleInstall = async (uuid: string) => {
    setLoadingUuid(uuid)
    try {
      await installMcpServer(uuid)
      await fetchServers()
    } catch (err) {
      console.error('Failed to install MCP server:', err)
    } finally {
      setLoadingUuid(null)
    }
  }

  const handleUninstall = async (uuid: string) => {
    setLoadingUuid(uuid)
    try {
      await uninstallMcpServer(uuid)
      await fetchServers()
    } catch (err) {
      console.error('Failed to uninstall MCP server:', err)
    } finally {
      setLoadingUuid(null)
    }
  }

  const handleEnable = async (uuid: string) => {
    setLoadingUuid(uuid)
    try {
      await enableMcpServer(uuid)
      await fetchServers()
    } catch (err) {
      console.error('Failed to enable MCP server:', err)
    } finally {
      setLoadingUuid(null)
    }
  }

  const handleDisable = async (uuid: string) => {
    setLoadingUuid(uuid)
    try {
      await disableMcpServer(uuid)
      await fetchServers()
    } catch (err) {
      console.error('Failed to disable MCP server:', err)
    } finally {
      setLoadingUuid(null)
    }
  }

  const handleSaveConfig = async (uuid: string, configJson: string) => {
    try {
      await updateMcpServerConfig(uuid, configJson)
      await fetchServers()
    } catch (err) {
      console.error('Failed to save MCP server config:', err)
    }
  }

  const handleAddCustomServer = async () => {
    if (!customName.trim() || !customCommand.trim()) return

    const newServer: NewMcpServer = {
      uuid: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: customName.trim(),
      command: customCommand.trim(),
      args: customArgs.trim() || undefined,
      description: customDescription.trim() || undefined,
      category: customCategory.trim() || 'Custom',
      author: 'Custom',
      version: '1.0.0',
      icon: 'tool',
    }

    try {
      await addCustomMcpServer(newServer)
      await fetchServers()
      setShowAddCustom(false)
      setCustomName('')
      setCustomCommand('')
      setCustomArgs('')
      setCustomDescription('')
      setCustomCategory('')
    } catch (err) {
      console.error('Failed to add custom MCP server:', err)
    }
  }

  return (
    <div className="flex flex-col p-6 pl-10 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-semibold text-2xl text-gray-900">MCP Marketplace</h1>
          <p className="font-medium text-sm text-gray-400 mt-1">
            Discover and install MCP servers to extend your AI agent's capabilities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {installedCount > 0 && (
            <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
              {installedCount} installed
            </span>
          )}
          <button
            onClick={() => setShowAddCustom(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            + Add Custom Server
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mt-4 mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search MCP servers..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Server cards grid */}
      {filteredServers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-50"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="text-sm">No MCP servers found.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServers.map(server => (
            <MCPServerCard
              key={server.uuid}
              server={server}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              onEnable={handleEnable}
              onDisable={handleDisable}
              onConfigure={setConfigServer}
              loading={loadingUuid === server.uuid}
            />
          ))}
        </div>
      )}

      {/* Config Modal */}
      <MCPConfigModal
        server={configServer}
        isOpen={configServer !== null}
        onClose={() => setConfigServer(null)}
        onSave={handleSaveConfig}
      />

      {/* Add Custom Server Modal */}
      <Dialog
        isOpen={showAddCustom}
        onClose={() => setShowAddCustom(false)}
        className="bg-white w-[480px] p-6"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Custom MCP Server</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="My Custom Server"
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Command <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customCommand}
                onChange={e => setCustomCommand(e.target.value)}
                placeholder="npx, node, python, etc."
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Arguments
              </label>
              <input
                type="text"
                value={customArgs}
                onChange={e => setCustomArgs(e.target.value)}
                placeholder='["@your/mcp-server"]'
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">JSON array format, e.g. ["arg1", "arg2"]</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                placeholder="What does this MCP server do?"
                rows={2}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Category
              </label>
              <select
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowAddCustom(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomServer}
              disabled={!customName.trim() || !customCommand.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Server
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default MCPMarketplace
