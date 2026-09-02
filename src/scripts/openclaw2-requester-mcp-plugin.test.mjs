import assert from "node:assert/strict";
import plugin, {
  normalizeHeaderValue,
  requesterBridgeUrl,
  requesterHeaders,
} from "../src-tauri/resources/clawdbot/dist/extensions/knapsack-requester-mcp/index.js";

const originalEnv = { ...process.env };
try {
  process.env.KNAPSACK_DESKTOP_API_TOKEN = "desktop-secret";
  delete process.env.KNAPSACK_DESKTOP_API_BASE;

  assert.equal(normalizeHeaderValue(" requester "), "requester");
  assert.equal(normalizeHeaderValue("bad\r\nheader"), undefined);
  assert.equal(requesterBridgeUrl("studio"), "http://127.0.0.1:8897/api/clawd/requester-mcp/studio");

  const registrations = [];
  plugin.register({
    registerMcpServerConnectionResolver(registration) {
      registrations.push(registration);
    },
  });
  assert.deepEqual(registrations.map((registration) => registration.serverName), ["studio", "snowflake"]);

  const resolved = registrations[0].resolve({
    requesterSenderId: "U0123456789",
    agentAccountId: "bankaya",
    messageChannel: "slack",
  });
  assert.deepEqual(resolved, {
    url: "http://127.0.0.1:8897/api/clawd/requester-mcp/studio",
    headers: {
      "x-knapsack-api-token": "desktop-secret",
      "x-knapsack-requester-sender-id": "U0123456789",
      "x-knapsack-requester-account-id": "bankaya",
      "x-knapsack-requester-channel": "slack",
    },
  });

  assert.equal(registrations[0].resolve({ messageChannel: "slack" }), undefined);
  delete process.env.KNAPSACK_DESKTOP_API_TOKEN;
  assert.equal(requesterHeaders({ requesterSenderId: "U0123456789" }), undefined);

  let legacyLog = "";
  assert.doesNotThrow(() => plugin.register({ logger: { info: (message) => { legacyLog = message; } } }));
  assert.match(legacyLog, /legacy stdio MCP unchanged/);

  process.env.KNAPSACK_DESKTOP_API_TOKEN = "desktop-secret";
  process.env.KNAPSACK_DESKTOP_API_BASE = "https://example.com";
  assert.equal(requesterBridgeUrl("studio"), undefined);
} finally {
  process.env = originalEnv;
}

console.log("OpenClaw 2 requester MCP plugin tests passed");
