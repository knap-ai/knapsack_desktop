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

test("shared-channel call is bound to the exact trusted Slack event sender", async () => {
  const { bindKnapsackSessionContext } = await loadBinding();
  const bound = bindKnapsackSessionContext({
    serverName: "snowflake",
    toolName: "snowflake_query",
    runtime: fakeRuntime({
      sessionId: "channel-session",
      sessionKey: "agent:main:slack:channel:c0blhtjkd2p:thread:1787860245.552869",
    }),
    slackUserId: "U0ASEDSQP8F",
    slackAccountId: "default",
    slackWorkspaceId: "TPWGB3059",
    input: {
      query: "SELECT CURRENT_VERSION();",
      _knapsack_slack_user_id: "UATTACKER",
      _knapsack_slack_account_id: "attacker",
      _knapsack_slack_workspace_id: "TATTACKER",
    },
  });
  assert.equal(bound._knapsack_session_id, "channel-session");
  assert.equal(bound._knapsack_slack_user_id, "U0ASEDSQP8F");
  assert.equal(bound._knapsack_slack_account_id, "default");
  assert.equal(bound._knapsack_slack_workspace_id, "TPWGB3059");
});

test("non-Slack calls strip model-supplied Slack identity fields", async () => {
  const { bindKnapsackSessionContext } = await loadBinding();
  const bound = bindKnapsackSessionContext({
    serverName: "snowflake",
    toolName: "snowflake_query",
    runtime: fakeRuntime({ sessionId: "local-session", sessionKey: "agent:main:main" }),
    input: {
      query: "SELECT CURRENT_VERSION();",
      _knapsack_slack_user_id: "UATTACKER",
      _knapsack_slack_account_id: "attacker",
      _knapsack_slack_workspace_id: "TATTACKER",
    },
  });
  assert.equal(bound._knapsack_session_id, "local-session");
  assert.equal(bound._knapsack_scope_key, "agent:main:main");
  assert.equal(Object.hasOwn(bound, "_knapsack_slack_user_id"), false);
  assert.equal(Object.hasOwn(bound, "_knapsack_slack_account_id"), false);
  assert.equal(Object.hasOwn(bound, "_knapsack_slack_workspace_id"), false);
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

for (const toolName of ["list_connector_tools", "call_connector_tool"]) {
  test(`Studio ${toolName} is bound to trusted gateway session and scope`, async () => {
    const { bindKnapsackSessionContext } = await loadBinding();
    const bound = bindKnapsackSessionContext({
      serverName: "studio",
      toolName,
      runtime: fakeRuntime(),
      input: {
        connector: "googledocs",
        _knapsack_session_id: "attacker-session",
        _knapsack_scope_key: "attacker-scope",
      },
    });
    assert.equal(bound._knapsack_session_id, "session-mark");
    assert.equal(bound._knapsack_scope_key, "agent:main:slack:default:direct:u0asedsqp8f");
  });
}

test("Studio call fails closed without gateway session context", async () => {
  const { bindKnapsackSessionContext } = await loadBinding();
  assert.throws(
    () => bindKnapsackSessionContext({
      serverName: "studio",
      toolName: "call_connector_tool",
      runtime: fakeRuntime({ sessionId: undefined }),
      input: { connector: "googledocs" },
    }),
    /trusted gateway session context/,
  );
});
