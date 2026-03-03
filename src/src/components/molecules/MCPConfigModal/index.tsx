import React, { useState, useEffect } from 'react'
import { Dialog } from '../Dialog'
import type { McpServer } from '../../../api/mcp'

interface EnvVar {
  key: string
  value: string
}

interface MCPConfigModalProps {
  server: McpServer | null
  isOpen: boolean
  onClose: () => void
  onSave: (uuid: string, configJson: string) => void
}

const MCPConfigModal: React.FC<MCPConfigModalProps> = ({ server, isOpen, onClose, onSave }) => {
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [customArgs, setCustomArgs] = useState<string>('')

  useEffect(() => {
    if (server) {
      // Parse existing config
      if (server.configJson) {
        try {
          const config = JSON.parse(server.configJson)
          if (config.envVars && typeof config.envVars === 'object') {
            setEnvVars(
              Object.entries(config.envVars).map(([key, value]) => ({
                key,
                value: value as string,
              })),
            )
          } else {
            setEnvVars([])
          }
          if (config.args) {
            setCustomArgs(config.args)
          } else {
            setCustomArgs('')
          }
        } catch {
          setEnvVars([])
          setCustomArgs('')
        }
      } else {
        setEnvVars([])
        setCustomArgs('')
      }
    }
  }, [server])

  if (!server) return null

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }])
  }

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const handleEnvVarChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...envVars]
    updated[index] = { ...updated[index], [field]: val }
    setEnvVars(updated)
  }

  const handleSave = () => {
    const envVarsObj: Record<string, string> = {}
    envVars.forEach(({ key, value }) => {
      if (key.trim()) {
        envVarsObj[key.trim()] = value
      }
    })

    const config: Record<string, unknown> = {}
    if (Object.keys(envVarsObj).length > 0) {
      config.envVars = envVarsObj
    }
    if (customArgs.trim()) {
      config.args = customArgs.trim()
    }

    onSave(server.uuid, JSON.stringify(config))
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="bg-white w-[520px] max-h-[80vh] p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Configure {server.name}</h2>
          {server.description && (
            <p className="text-sm text-gray-500 mt-1">{server.description}</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Command
              </label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded text-sm text-gray-700 font-mono">
                {server.command}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Arguments
              </label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded text-sm text-gray-700 font-mono break-all">
                {server.args || 'None'}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Additional Arguments
              </label>
              <input
                type="text"
                value={customArgs}
                onChange={e => setCustomArgs(e.target.value)}
                placeholder="e.g., /path/to/directory"
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Environment Variables
            </label>
            <button
              onClick={handleAddEnvVar}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Variable
            </button>
          </div>

          {envVars.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No environment variables configured.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {envVars.map((envVar, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={envVar.key}
                    onChange={e => handleEnvVarChange(index, 'key', e.target.value)}
                    placeholder="KEY"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <span className="text-gray-400">=</span>
                  <input
                    type="text"
                    value={envVar.value}
                    onChange={e => handleEnvVarChange(index, 'value', e.target.value)}
                    placeholder="value"
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleRemoveEnvVar(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove variable"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {server.sourceUrl && (
          <div className="border-t border-gray-100 pt-3">
            <a
              href={server.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
            >
              View source on GitHub
            </a>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default MCPConfigModal
