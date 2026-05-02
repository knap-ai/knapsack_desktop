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

// ── Types ──

interface Skill {
  name: string
  emoji: string
  description: string
  source: string
  eligible: boolean
  enabled?: boolean
  externalApi?: boolean
  homepage?: string
}

type ViewMode = 'all' | 'skills' | 'mcp'

const MCP_CATEGORIES = ['All', 'Productivity', 'Developer', 'Database', 'Search', 'Communication', 'AI']

// ── Skill card ──

const SkillCard: React.FC<{
  skill: Skill
  onInstall: (name: string) => void
  installing: boolean
}> = ({ skill, onInstall, installing }) => {
  const isBuiltIn = skill.source === 'built-in'
  const isAvailable = skill.eligible

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{skill.emoji}</span>
          <div>
            <div className="font-medium text-sm text-gray-900">{skill.name}</div>
            <div className="text-xs text-gray-400">
              {isBuiltIn ? 'Built-in' : skill.source === 'Anthropic' ? 'Anthropic' : 'OpenClaw'}
              {skill.externalApi && ' \u00b7 Requires API key'}
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 flex-1">{skill.description}</p>
      <div className="flex items-center justify-between pt-1">
        {isBuiltIn && skill.enabled ? (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            Active
          </span>
        ) : isAvailable ? (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            Installed
          </span>
        ) : skill.source === 'Anthropic' && skill.homepage ? (
          <a
            href={skill.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Learn more
          </a>
        ) : (
          <button
            onClick={() => onInstall(skill.name)}
            disabled={installing}
            className="text-xs font-medium px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {installing ? 'Installing...' : 'Install'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ──

const ExtensionsView: React.FC = () => {
  // Skills state
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [installingSkill, setInstallingSkill] = useState<string | null>(null)

  // MCP state
  const [servers, setServers] = useState<McpServer[]>([])
  const [mcpLoading, setMcpLoading] = useState(true)
  const [loadingUuid, setLoadingUuid] = useState<string | null>(null)
  const [configServer, setConfigServer] = useState<McpServer | null>(null)
  const [showAddCustom, setShowAddCustom] = useState(false)

  // Shared state
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [mcpCategory, setMcpCategory] = useState('All')
  const [error, setError] = useState<string | null>(null)

  // Custom server form state
  const [customName, setCustomName] = useState('')
  const [customCommand, setCustomCommand] = useState('')
  const [customArgs, setCustomArgs] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customCategory, setCustomCategory] = useState('')

  // ── Fetch data ──

  const fetchSkills = useCallback(async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8897/api/clawd/service/skills/status')
      const data = await resp.json()
      if (data.catalog) {
        setSkills(data.catalog)
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err)
    } finally {
      setSkillsLoading(false)
    }
  }, [])

  const fetchServers = useCallback(async () => {
    try {
      const data = await getMcpServers()
      setServers(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch MCP servers:', err)
      setError('Failed to load MCP servers.')
    } finally {
      setMcpLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSkills()
    fetchServers()
  }, [fetchSkills, fetchServers])

  // ── Filtering ──

  const filteredSkills = useMemo(() => {
    if (viewMode === 'mcp') return []
    if (!searchQuery.trim()) return skills
    const q = searchQuery.toLowerCase()
    return skills.filter(
      s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    )
  }, [skills, searchQuery, viewMode])

  const filteredServers = useMemo(() => {
    if (viewMode === 'skills') return []
    let result = servers
    if (mcpCategory !== 'All') {
      result = result.filter(s => s.category === mcpCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)),
      )
    }
    return result
  }, [servers, mcpCategory, searchQuery, viewMode])

  const installedCount = useMemo(() => {
    const skillsInstalled = skills.filter(s => s.eligible || s.enabled).length
    const mcpInstalled = servers.filter(s => s.isInstalled).length
    return skillsInstalled + mcpInstalled
  }, [skills, servers])

  // ── Skill actions ──

  const handleInstallSkill = async (name: string) => {
    setInstallingSkill(name)
    try {
      await fetch('http://127.0.0.1:8897/api/clawd/service/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: name }),
      })
      await fetchSkills()
    } catch (err) {
      console.error('Failed to install skill:', err)
    } finally {
      setInstallingSkill(null)
    }
  }

  // ── MCP actions ──

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
      uuid: `custom-${crypto.randomUUID()}`,
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

  // ── Render ──

  const loading = skillsLoading || mcpLoading

  return (
    <div className="flex flex-col p-6 pl-10 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-semibold text-2xl text-gray-900">Skills & MCPs</h1>
          <p className="font-medium text-sm text-gray-400 mt-1">
            Everything that extends what your AI agent can do.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {installedCount > 0 && (
            <span className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
              {installedCount} active
            </span>
          )}
          <button
            onClick={() => setShowAddCustom(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            + Add Custom
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
            placeholder="Search extensions..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'skills', 'mcp'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              viewMode === mode
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {mode === 'all' ? `All (${skills.length + servers.length})` : mode === 'skills' ? `Skills (${skills.length})` : `MCP Servers (${servers.length})`}
          </button>
        ))}
      </div>

      {/* MCP category filters (only when viewing MCP or all) */}
      {viewMode !== 'skills' && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {MCP_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setMcpCategory(cat)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                mcpCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-400 animate-pulse py-8 text-center">Loading extensions...</div>
      )}

      {/* Skills section */}
      {!loading && viewMode !== 'mcp' && filteredSkills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Skills
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Built-in capabilities that run inside Knapsack. They work immediately with no setup.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSkills.map(skill => (
              <SkillCard
                key={skill.name}
                skill={skill}
                onInstall={handleInstallSkill}
                installing={installingSkill === skill.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* MCP Servers section */}
      {!loading && viewMode !== 'skills' && filteredServers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
            MCP Servers
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            External plugins that connect to third-party services (GitHub, Slack, databases, etc.) via the Model Context Protocol. Each one runs as a separate process and may need configuration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredSkills.length === 0 && filteredServers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-sm">No extensions found.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              Clear search
            </button>
          )}
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
              <p className="mt-1 text-xs text-gray-400">Allowed: npx, node, python, python3, uvx, docker</p>
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
              <p className="mt-1 text-xs text-gray-400">JSON array format</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={customDescription}
                onChange={e => setCustomDescription(e.target.value)}
                placeholder="What does this server do?"
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
                {MCP_CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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

export default ExtensionsView
