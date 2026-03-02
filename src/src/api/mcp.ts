import {
  KN_API_MCP_SERVERS,
  KN_API_MCP_SERVERS_INSTALLED,
  KN_API_MCP_SERVERS_CUSTOM,
} from '../utils/constants'

export interface McpServer {
  id: number | null
  uuid: string
  name: string
  description: string | null
  category: string | null
  command: string
  args: string | null
  envVars: string | null
  icon: string | null
  author: string | null
  version: string | null
  sourceUrl: string | null
  isInstalled: boolean
  isEnabled: boolean
  configJson: string | null
  installedAt: number | null
  createdAt: number | null
}

export interface NewMcpServer {
  uuid: string
  name: string
  description?: string
  category?: string
  command: string
  args?: string
  envVars?: string
  icon?: string
  author?: string
  version?: string
  sourceUrl?: string
  configJson?: string
}

export async function getMcpServers(category?: string): Promise<McpServer[]> {
  const url = category
    ? `${KN_API_MCP_SERVERS}?category=${encodeURIComponent(category)}`
    : KN_API_MCP_SERVERS
  const response = await fetch(url)
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to fetch MCP servers')
  }
  return data.data as McpServer[]
}

export async function getMcpServer(uuid: string): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}`)
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to fetch MCP server')
  }
  return data.data as McpServer
}

export async function getInstalledMcpServers(): Promise<McpServer[]> {
  const response = await fetch(KN_API_MCP_SERVERS_INSTALLED)
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to fetch installed MCP servers')
  }
  return data.data as McpServer[]
}

export async function installMcpServer(uuid: string): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}/install`, {
    method: 'POST',
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to install MCP server')
  }
  return data.data as McpServer
}

export async function uninstallMcpServer(uuid: string): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}/uninstall`, {
    method: 'POST',
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to uninstall MCP server')
  }
  return data.data as McpServer
}

export async function enableMcpServer(uuid: string): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}/enable`, {
    method: 'POST',
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to enable MCP server')
  }
  return data.data as McpServer
}

export async function disableMcpServer(uuid: string): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}/disable`, {
    method: 'POST',
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to disable MCP server')
  }
  return data.data as McpServer
}

export async function updateMcpServerConfig(
  uuid: string,
  configJson: string,
): Promise<McpServer> {
  const response = await fetch(`${KN_API_MCP_SERVERS}/${uuid}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config_json: configJson }),
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to update MCP server config')
  }
  return data.data as McpServer
}

export async function addCustomMcpServer(server: NewMcpServer): Promise<McpServer> {
  const response = await fetch(KN_API_MCP_SERVERS_CUSTOM, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(server),
  })
  const data = await response.json()
  if (!data || data.success !== true) {
    throw new Error('Failed to add custom MCP server')
  }
  return data.data as McpServer
}
