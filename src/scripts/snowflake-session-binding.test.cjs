const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const test = require("node:test");

async function loadBinding() {
  const modulePath = path.join(
    __dirname,
    "..",
    "src-tauri",
    "resources",
    "clawdbot",
    "dist",
    "knapsack-session-context.js",
  );
  return import(pathToFileURL(modulePath).href);
}

function fakeRuntime(overrides = {}) {
  return {
    sessionId: "session-mark",
    sessionKey: "agent:main:slack:default:direct:u0asedsqp8f",
    ...overrides,
  };
}

test("Snowflake call is bound to trusted gateway session and scope", async () => {
  const { bindKnapsackSessionContext } = await loadBinding();
  const runtime = fakeRuntime();
  const bound = bindKnapsackSessionContext({
    serverName: "snowflake",
    toolName: "snowflake_query",
    runtime,
    input: {
      query: "SELECT CURRENT_VERSION();",
      _knapsack_session_id: "attacker-session",
      _knapsack_scope_key: "attacker-scope",
    },
  });
  assert.deepEqual(bound, {
    query: "SELECT CURRENT_VERSION();",
    _knapsack_session_id: "session-mark",
    _knapsack_scope_key: "agent:main:slack:default:direct:u0asedsqp8f",
  });
});

test("Snowflake call fails closed without gateway session context", async () => {
  const { bindKnapsackSessionContext } = await loadBinding();
  const runtime = fakeRuntime({ sessionKey: undefined });
  assert.throws(
    () => bindKnapsackSessionContext({
      serverName: "snowflake",
      toolName: "snowflake_query",
      runtime,
      input: { query: "SELECT 1" },
    }),
    /trusted gateway session context/,
  );
});
