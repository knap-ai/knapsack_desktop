CREATE TABLE IF NOT EXISTS mcp_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    command TEXT NOT NULL,
    args TEXT,
    env_vars TEXT,
    icon TEXT,
    author TEXT,
    version TEXT,
    source_url TEXT,
    is_installed INTEGER NOT NULL DEFAULT 0,
    is_enabled INTEGER NOT NULL DEFAULT 0,
    config_json TEXT,
    installed_at INTEGER,
    created_at INTEGER
);

-- Pre-populate with popular MCP servers
INSERT INTO mcp_servers (uuid, name, description, category, command, args, icon, author, version, source_url, created_at) VALUES
('mcp-filesystem', 'Filesystem', 'Read, write, and manage local files and directories', 'Productivity', 'npx', '["@modelcontextprotocol/server-filesystem"]', 'folder', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-brave-search', 'Brave Search', 'Web search using the Brave Search API', 'Search', 'npx', '["@modelcontextprotocol/server-brave-search"]', 'search', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-github', 'GitHub', 'Interact with GitHub repositories, issues, and pull requests', 'Developer', 'npx', '["@modelcontextprotocol/server-github"]', 'code', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-slack', 'Slack', 'Read and send messages in Slack workspaces', 'Communication', 'npx', '["@modelcontextprotocol/server-slack"]', 'chat', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-postgres', 'PostgreSQL', 'Query and manage PostgreSQL databases', 'Database', 'npx', '["@modelcontextprotocol/server-postgres"]', 'database', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-sqlite', 'SQLite', 'Query and manage SQLite databases', 'Database', 'npx', '["@modelcontextprotocol/server-sqlite"]', 'database', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-puppeteer', 'Puppeteer', 'Browser automation and web scraping', 'Developer', 'npx', '["@modelcontextprotocol/server-puppeteer"]', 'browser', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-memory', 'Memory', 'Persistent memory storage using a knowledge graph', 'AI', 'npx', '["@modelcontextprotocol/server-memory"]', 'brain', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now')),
('mcp-notion', 'Notion', 'Access and manage Notion pages and databases', 'Productivity', 'npx', '["@notionhq/mcp-server"]', 'document', 'Notion', '1.0.0', 'https://github.com/notionhq/notion-mcp-server', strftime('%s','now')),
('mcp-google-drive', 'Google Drive', 'Search and access Google Drive files', 'Productivity', 'npx', '["@anthropic/mcp-server-gdrive"]', 'drive', 'Anthropic', '1.0.0', 'https://github.com/modelcontextprotocol/servers', strftime('%s','now'));
