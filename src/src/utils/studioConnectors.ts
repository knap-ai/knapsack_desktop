export type StudioConnector = {
  id: string
  scope?: string
  name: string
  icon: string
  description: string
  keywords: string[]
  category?: string
}

export type StudioConnectorSuggestion = {
  label: string
  description: string
  connectors: StudioConnector[]
}

// Compatibility metadata for older Studio deployments. The live catalog from
// `/api/composio/auth/catalog` is authoritative; only configured Composio ids
// from this fallback are offered when that endpoint is unavailable.
export const STUDIO_CONNECTORS: StudioConnector[] = [
  { id: 'google_gmail_modify', name: 'Gmail', icon: '📧', description: 'Search, read, draft, and send Gmail', keywords: ['gmail'] },
  { id: 'microsoft_outlook_read', name: 'Outlook', icon: '📨', description: 'Search, read, draft, and send Outlook email', keywords: ['outlook'] },
  { id: 'google_calendar_read', name: 'Google Calendar', icon: '📅', description: 'View and manage Google Calendar events', keywords: ['google calendar', 'gcal'] },
  { id: 'microsoft_calendar_read', name: 'Microsoft Calendar', icon: '🗓️', description: 'View and manage Microsoft calendar events', keywords: ['microsoft calendar', 'outlook calendar'] },
  { id: 'google_drive_read', name: 'Google Drive', icon: '📁', description: 'Find and read Google Drive files', keywords: ['google drive', 'gdrive'] },
  { id: 'microsoft_onedrive_read', name: 'OneDrive', icon: '☁️', description: 'Find and read OneDrive files', keywords: ['onedrive', 'one drive'] },
  { id: 'microsoft_sharepoint_read', name: 'SharePoint', icon: '🗂️', description: 'Access SharePoint sites and documents', keywords: ['sharepoint'] },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', description: 'Access and manage Dropbox files', keywords: ['dropbox'] },
  { id: 'box', name: 'Box', icon: '📥', description: 'Access and manage Box files', keywords: ['box.com', 'box files'] },
  { id: 'googledocs', name: 'Google Docs', icon: '📄', description: 'Create and edit Google Docs', keywords: ['google docs', 'google doc'] },
  { id: 'googlesheets', name: 'Google Sheets', icon: '📊', description: 'Read and update Google Sheets', keywords: ['google sheets', 'google sheet'] },
  { id: 'notion', name: 'Notion', icon: '📝', description: 'Search and update Notion workspaces', keywords: ['notion'] },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Read and send Slack messages', keywords: ['slack'] },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Work with Salesforce CRM records', keywords: ['salesforce'] },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', description: 'Work with HubSpot CRM records', keywords: ['hubspot', 'hub spot'] },
  { id: 'wealthbox', name: 'Wealthbox', icon: '💼', description: 'Work with Wealthbox CRM records', keywords: ['wealthbox'] },
  { id: 'zoho', name: 'Zoho CRM', icon: '🔄', description: 'Work with Zoho CRM records', keywords: ['zoho crm', 'zoho'] },
  { id: 'zoho_desk', name: 'Zoho Desk', icon: '🎫', description: 'Work with Zoho Desk tickets', keywords: ['zoho desk'] },
  { id: 'sevanta', name: 'Sevanta Dealflow', icon: '🤝', description: 'Access Sevanta deal and relationship data', keywords: ['sevanta', 'dealflow', 'mydealflow'] },
  { id: 'copper', name: 'Copper', icon: '🔗', description: 'Work with Copper CRM records', keywords: ['copper crm', 'copper'] },
  { id: 'dynamics', name: 'Microsoft Dynamics 365', icon: '🏢', description: 'Work with Dynamics 365 records', keywords: ['dynamics 365', 'microsoft dynamics', 'dataverse'] },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🟢', description: 'Work with Pipedrive deals and contacts', keywords: ['pipedrive', 'pipe drive'] },
  { id: 'jira', name: 'Jira', icon: '🔵', description: 'Work with Jira issues and projects', keywords: ['jira'] },
  { id: 'confluence', name: 'Confluence', icon: '📖', description: 'Search and update Confluence spaces', keywords: ['confluence'] },
  { id: 'asana', name: 'Asana', icon: '✅', description: 'Work with Asana tasks and projects', keywords: ['asana'] },
  { id: 'linear', name: 'Linear', icon: '⚡', description: 'Work with Linear issues and projects', keywords: ['linear app', 'linear issue', 'linear project'] },
  { id: 'airtable', name: 'Airtable', icon: '🗂️', description: 'Read and update Airtable bases', keywords: ['airtable', 'air table'] },
  { id: 'zendesk', name: 'Zendesk', icon: '🎧', description: 'Work with Zendesk support tickets', keywords: ['zendesk', 'zen desk'] },
  { id: 'intercom', name: 'Intercom', icon: '💬', description: 'Work with Intercom conversations and customers', keywords: ['intercom'] },
  { id: 'github', name: 'GitHub', icon: '🐙', description: 'Work with GitHub repositories, issues, and pull requests', keywords: ['github', 'git hub'] },
  { id: 'monday', name: 'Monday.com', icon: '📋', description: 'Work with Monday.com boards and tasks', keywords: ['monday.com', 'monday board'] },
  { id: 'trello', name: 'Trello', icon: '🃏', description: 'Work with Trello boards and cards', keywords: ['trello'] },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🌿', description: 'Work with Freshdesk support tickets', keywords: ['freshdesk', 'fresh desk'] },
  { id: 'activecampaign', name: 'ActiveCampaign', icon: '⚙️', description: 'Work with ActiveCampaign marketing and CRM data', keywords: ['activecampaign', 'active campaign'] },
  { id: 'apollo', name: 'Apollo.io', icon: '🚀', description: 'Work with Apollo sales intelligence and outreach', keywords: ['apollo.io', 'apollo sales'] },
  { id: 'clickup', name: 'ClickUp', icon: '🟣', description: 'Work with ClickUp tasks and docs', keywords: ['clickup', 'click up'] },
  { id: 'readai', name: 'Read.ai', icon: '🎙️', description: 'Use Read.ai meeting transcripts and summaries', keywords: ['read.ai', 'read ai'] },
  { id: 'granola', name: 'Granola', icon: '📝', description: 'Use Granola meeting notes and transcripts', keywords: ['granola notes', 'granola meeting'] },
  { id: 'snowflake', name: 'Snowflake', icon: '❄️', description: 'Query connected Snowflake data', keywords: ['snowflake'] },
  { id: 'databricks', name: 'Databricks', icon: '⚡', description: 'Query connected Databricks data', keywords: ['databricks', 'data bricks'] },
  { id: 'metabase', name: 'Metabase', icon: '📈', description: 'Access Metabase analytics', keywords: ['metabase'] },
]

const COMPOSIO_CONNECTOR_IDS = new Set([
  'notion', 'zoho', 'slack', 'hubspot', 'googlesheets', 'pipedrive', 'box',
  'zoho_desk', 'metabase', 'databricks', 'snowflake', 'jira', 'confluence',
  'asana', 'linear', 'airtable', 'zendesk', 'intercom', 'monday', 'trello',
  'freshdesk', 'activecampaign', 'apollo', 'clickup', 'github',
])

const FALLBACK_CATEGORIES: Record<string, string> = {
  slack: 'communication', googlesheets: 'files', box: 'files', notion: 'knowledge',
  confluence: 'knowledge', zoho: 'crm', hubspot: 'crm', pipedrive: 'crm',
  activecampaign: 'crm', apollo: 'crm', zoho_desk: 'support', zendesk: 'support',
  intercom: 'support', freshdesk: 'support', jira: 'projects', asana: 'projects',
  linear: 'projects', monday: 'projects', trello: 'projects', clickup: 'projects',
  github: 'projects', metabase: 'data', databricks: 'data', snowflake: 'data',
  airtable: 'data',
}

export const FALLBACK_COMPOSIO_CONNECTORS = STUDIO_CONNECTORS
  .filter(connector => COMPOSIO_CONNECTOR_IDS.has(connector.id))
  .map(connector => ({
    ...connector,
    scope: connector.id,
    category: FALLBACK_CATEGORIES[connector.id] || 'other',
  }))

const fallbackConnectorById = new Map(STUDIO_CONNECTORS.map(connector => [connector.id, connector]))

export function normalizeStudioConnectorCatalog(
  catalog: Array<Partial<StudioConnector>> | undefined,
): StudioConnector[] {
  if (!Array.isArray(catalog)) return FALLBACK_COMPOSIO_CONNECTORS
  const normalized = catalog.flatMap(raw => {
    const id = raw.id?.trim()
    const name = raw.name?.trim()
    if (!id || !name) return []
    const fallback = fallbackConnectorById.get(id)
    const rawCategory = (raw.category || fallback?.category || FALLBACK_CATEGORIES[id] || 'other').toLowerCase()
    const category = rawCategory.includes('project') || rawCategory.includes('developer')
      ? 'projects'
      : rawCategory.includes('customer') || rawCategory.includes('support')
        ? 'support'
        : rawCategory.includes('sales') || rawCategory.includes('crm')
          ? 'crm'
          : rawCategory.includes('data') || rawCategory.includes('analytics')
            ? 'data'
            : rawCategory.includes('file') || rawCategory.includes('storage')
              ? 'files'
              : rawCategory
    return [{
      id,
      scope: raw.scope?.trim() || id,
      name,
      icon: raw.icon || fallback?.icon || '🔌',
      description: raw.description?.trim() || fallback?.description || `Connect ${name}`,
      keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(Boolean) as string[] : (fallback?.keywords || []),
      category,
    }]
  })
  // A successful empty catalog is authoritative: Studio may have disabled
  // every connector for this deployment. Only a missing/unavailable catalog
  // (undefined above) uses the compatibility list.
  return normalized
}

const suggestionGroups: Array<{
  label: string
  description: string
  keywords: string[]
  connectorIds: string[]
}> = [
  {
    label: 'Connect email?',
    description: 'Give this agent access to the inbox you want to use.',
    keywords: ['email', 'inbox', 'mail', 'draft', 'reply', 'unread', 'attachment'],
    connectorIds: ['google_gmail_modify', 'microsoft_outlook_read'],
  },
  {
    label: 'Connect a calendar?',
    description: 'Let this agent work with your meetings and availability.',
    keywords: ['calendar', 'schedule', 'availability', 'appointment', 'meeting invite'],
    connectorIds: ['google_calendar_read', 'microsoft_calendar_read'],
  },
  {
    label: 'Connect file storage?',
    description: 'Choose where the files you want this agent to use live.',
    keywords: ['cloud files', 'file storage', 'shared files', 'folder', 'documents'],
    connectorIds: ['google_drive_read', 'microsoft_onedrive_read', 'microsoft_sharepoint_read', 'dropbox', 'box'],
  },
  {
    label: 'Connect a CRM?',
    description: 'Choose the system that holds your customer and pipeline data.',
    keywords: ['crm', 'pipeline', 'deal', 'client records', 'customer records'],
    connectorIds: ['salesforce', 'hubspot', 'wealthbox', 'zoho', 'sevanta', 'copper', 'dynamics', 'pipedrive'],
  },
  {
    label: 'Connect a data source?',
    description: 'Let this agent query your connected analytics platform.',
    keywords: ['data warehouse', 'analytics database', 'business intelligence', 'query our data'],
    connectorIds: ['snowflake', 'databricks', 'metabase'],
  },
  {
    label: 'Connect project work?',
    description: 'Choose where your team tracks projects, issues, and tasks.',
    keywords: ['project management', 'issue tracker', 'task tracker', 'project tasks'],
    connectorIds: ['jira', 'linear', 'asana', 'monday', 'trello', 'clickup', 'github'],
  },
  {
    label: 'Connect customer support?',
    description: 'Choose the system that holds your support conversations and tickets.',
    keywords: ['support tickets', 'customer support', 'help desk', 'helpdesk'],
    connectorIds: ['zendesk', 'intercom', 'freshdesk', 'zoho_desk'],
  },
  {
    label: 'Connect meeting notes?',
    description: 'Choose the meeting assistant that has the notes or transcript you need.',
    keywords: ['meeting notes', 'meeting transcript', 'call transcript'],
    connectorIds: ['readai', 'granola'],
  },
]

const includesKeyword = (text: string, keyword: string) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
}

/** True when the user is explicitly asking to start or repair a connection. */
export function isStudioConnectIntent(text: string): boolean {
  return /\b(connect|reconnect|link|authorize|authenticate|sign[ -]?in|set[ -]?up)\b/i.test(text)
}

/** True when an agent response says the requested integration is unavailable. */
export function reportsMissingStudioConnector(text: string): boolean {
  if (/\b(not (?:currently )?connected|isn't connected|need(?:s)? to connect|connect .+ first|reconnect studio|sign[ -]?in expired)\b/i.test(text)) {
    return true
  }
  return /\b(connector|integration|studio connection|oauth connection|account connection)\b.{0,100}\b(is not available|unavailable)\b|\b(is not available|unavailable)\b.{0,100}\b(connector|integration|studio connection|oauth connection|account connection)\b/i.test(text)
}

export function detectStudioConnectorSuggestion(
  text: string,
  connectedIds: Iterable<string>,
  dismissedIds: Iterable<string>,
  catalog: StudioConnector[] = FALLBACK_COMPOSIO_CONNECTORS,
  allowConnectedExplicit = false,
): StudioConnectorSuggestion | null {
  const normalized = text.toLowerCase()
  const connected = new Set(connectedIds)
  const dismissed = new Set(dismissedIds)
  const available = (connector: StudioConnector | undefined): connector is StudioConnector =>
    Boolean(
      connector
      && !connected.has(connector.scope || connector.id)
      && !dismissed.has(connector.id),
    )
  const explicitAvailable = (connector: StudioConnector): boolean =>
    !dismissed.has(connector.id)
    && (allowConnectedExplicit || !connected.has(connector.scope || connector.id))

  const explicit = catalog.find(connector =>
    [connector.name, connector.id, ...(connector.keywords || [])]
      .some(keyword => includesKeyword(normalized, keyword.replace(/_/g, ' '))),
  )
  if (explicit) {
    if (!explicitAvailable(explicit)) return null
    return {
      label: connected.has(explicit.scope || explicit.id)
        ? `Reconnect ${explicit.name}?`
        : `Connect ${explicit.name}?`,
      description: explicit.description,
      connectors: [explicit],
    }
  }

  for (const group of suggestionGroups) {
    if (!group.keywords.some(keyword => includesKeyword(normalized, keyword))) continue
    const categoryByGroup: Record<string, string> = {
      'Connect file storage?': 'files',
      'Connect a CRM?': 'crm',
      'Connect a data source?': 'data',
      'Connect project work?': 'projects',
      'Connect customer support?': 'support',
    }
    const category = categoryByGroup[group.label]
    const connectors = (category
      ? catalog.filter(connector => connector.category === category)
      : group.connectorIds.map(id => catalog.find(connector => connector.id === id)))
      .filter(available)
      .slice(0, 5)
    if (connectors.length > 0) {
      return { label: group.label, description: group.description, connectors }
    }
  }

  return null
}
