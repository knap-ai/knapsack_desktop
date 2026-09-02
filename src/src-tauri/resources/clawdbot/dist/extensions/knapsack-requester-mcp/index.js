const SERVER_NAMES = ["studio", "snowflake"];
const DEFAULT_DESKTOP_API_BASE = "http://127.0.0.1:8897";
const MAX_HEADER_VALUE_LENGTH = 512;

function normalizeHeaderValue(value) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_HEADER_VALUE_LENGTH) return undefined;
  if (/[^\t\x20-\x7e]/.test(normalized)) return undefined;
  return normalized;
}

function requesterHeaders(ctx) {
  const token = normalizeHeaderValue(process.env.KNAPSACK_DESKTOP_API_TOKEN);
  const senderId = normalizeHeaderValue(ctx?.requesterSenderId);
  if (!token || !senderId) return undefined;

  const headers = {
    "x-knapsack-api-token": token,
    "x-knapsack-requester-sender-id": senderId,
  };
  const accountId = normalizeHeaderValue(ctx?.agentAccountId);
  const channel = normalizeHeaderValue(ctx?.messageChannel);
  if (accountId) headers["x-knapsack-requester-account-id"] = accountId;
  if (channel) headers["x-knapsack-requester-channel"] = channel;
  return headers;
}

function requesterBridgeUrl(serverName) {
  const configured = process.env.KNAPSACK_DESKTOP_API_BASE?.trim();
  let base;
  try {
    base = new URL(configured || DEFAULT_DESKTOP_API_BASE);
  } catch {
    return undefined;
  }
  if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) {
    return undefined;
  }
  base.pathname = `/api/clawd/requester-mcp/${serverName}`;
  base.search = "";
  base.hash = "";
  return base.toString();
}

const plugin = {
  id: "knapsack-requester-mcp",
  name: "Knapsack Requester MCP",
  description: "Requester-aware Knapsack MCP bridge",
  register(api) {
    if (typeof api?.registerMcpServerConnectionResolver !== "function") {
      api?.logger?.info?.("knapsack-requester-mcp: requester-aware MCP API is unavailable; leaving legacy stdio MCP unchanged");
      return;
    }

    for (const serverName of SERVER_NAMES) {
      api.registerMcpServerConnectionResolver({
        serverName,
        resolve(ctx) {
          const headers = requesterHeaders(ctx);
          const url = requesterBridgeUrl(serverName);
          if (!headers || !url) return undefined;
          return { url, headers };
        },
      });
    }
  },
};

export { normalizeHeaderValue, requesterBridgeUrl, requesterHeaders };
export default plugin;
