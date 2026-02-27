import React from 'react'
import type { McpServer } from '../../../api/mcp'

const iconMap: Record<string, string> = {
  folder: '\uD83D\uDCC1',
  search: '\uD83D\uDD0D',
  code: '\uD83D\uDCBB',
  chat: '\uD83D\uDCAC',
  database: '\uD83D\uDDC4\uFE0F',
  browser: '\uD83C\uDF10',
  brain: '\uD83E\uDDE0',
  document: '\uD83D\uDCC4',
  drive: '\u2601\uFE0F',
  tool: '\uD83D\uDD27',
}

function getIconEmoji(icon: string | null): string {
  if (!icon) return '\uD83D\uDD0C'
  return iconMap[icon] || '\uD83D\uDD0C'
}

interface MCPServerCardProps {
  server: McpServer
  onInstall: (uuid: string) => void
  onUninstall: (uuid: string) => void
  onEnable: (uuid: string) => void
  onDisable: (uuid: string) => void
  onConfigure: (server: McpServer) => void
  loading?: boolean
}

const MCPServerCard: React.FC<MCPServerCardProps> = ({
  server,
  onInstall,
  onUninstall,
  onEnable,
  onDisable,
  onConfigure,
  loading = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-[220px]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={server.icon || 'plugin'}>
              {getIconEmoji(server.icon)}
            </span>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 leading-tight">{server.name}</h3>
              {server.author && (
                <span className="text-xs text-gray-400">by {server.author}</span>
              )}
            </div>
          </div>
          {server.version && (
            <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
              v{server.version}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
          {server.description || 'No description available.'}
        </p>
        {server.category && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full self-start mt-0.5">
            {server.category}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {server.isInstalled ? (
          <>
            <button
              onClick={() => onUninstall(server.uuid)}
              disabled={loading}
              className="flex-1 text-xs font-medium py-1.5 px-3 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Uninstall
            </button>
            <button
              onClick={() => (server.isEnabled ? onDisable(server.uuid) : onEnable(server.uuid))}
              disabled={loading}
              className={`flex-1 text-xs font-medium py-1.5 px-3 rounded border transition-colors disabled:opacity-50 ${
                server.isEnabled
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {server.isEnabled ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={() => onConfigure(server)}
              disabled={loading}
              className="text-xs font-medium py-1.5 px-3 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Configure"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => onInstall(server.uuid)}
            disabled={loading}
            className="w-full text-xs font-medium py-1.5 px-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Installing...' : 'Install'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MCPServerCard
