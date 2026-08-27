/**
 * Bind Knapsack's identity-sensitive MCP tools to the gateway runtime that is
 * executing the current turn. These values are applied after model argument
 * generation, so model output cannot select or override another session.
 */
export function bindKnapsackSessionContext(params) {
  const input = params.input !== null && typeof params.input === "object" && !Array.isArray(params.input)
    ? params.input
    : {};
  const requiresBinding =
    (params.serverName === "snowflake" && params.toolName === "snowflake_query") ||
    (params.serverName === "studio" &&
      (params.toolName === "list_connector_tools" || params.toolName === "call_connector_tool"));
  if (!requiresBinding) return input;
  const sessionId = typeof params.runtime.sessionId === "string" ? params.runtime.sessionId.trim() : "";
  const sessionKey = typeof params.runtime.sessionKey === "string" ? params.runtime.sessionKey.trim() : "";
  if (!sessionId || !sessionKey) throw new Error("Knapsack tool requires trusted gateway session context");
  const bound = {
    ...input,
    _knapsack_session_id: sessionId,
    _knapsack_scope_key: sessionKey,
  };
  // Never preserve model-supplied Slack identity fields. A non-Slack turn has
  // no trusted event sender to overwrite them with, so leaving them in place
  // would let model output manufacture Slack authorization context.
  delete bound._knapsack_slack_user_id;
  delete bound._knapsack_slack_account_id;
  delete bound._knapsack_slack_workspace_id;
  const slackUserId = typeof params.slackUserId === "string" ? params.slackUserId.trim() : "";
  const slackAccountId = typeof params.slackAccountId === "string" ? params.slackAccountId.trim() : "";
  const slackWorkspaceId = typeof params.slackWorkspaceId === "string" ? params.slackWorkspaceId.trim() : "";
  if (slackUserId) bound._knapsack_slack_user_id = slackUserId;
  if (slackAccountId) bound._knapsack_slack_account_id = slackAccountId;
  if (slackWorkspaceId) bound._knapsack_slack_workspace_id = slackWorkspaceId;
  return bound;
}
