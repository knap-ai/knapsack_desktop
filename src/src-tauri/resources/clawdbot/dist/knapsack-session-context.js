/**
 * Bind Knapsack's dedicated Snowflake tool to the gateway runtime that is
 * executing the current turn. These values are applied after model argument
 * generation, so model output cannot select or override another session.
 */
export function bindKnapsackSessionContext(params) {
  const input = params.input !== null && typeof params.input === "object" && !Array.isArray(params.input)
    ? params.input
    : {};
  if (params.serverName !== "snowflake" || params.toolName !== "snowflake_query") return input;
  const sessionId = typeof params.runtime.sessionId === "string" ? params.runtime.sessionId.trim() : "";
  const sessionKey = typeof params.runtime.sessionKey === "string" ? params.runtime.sessionKey.trim() : "";
  if (!sessionId || !sessionKey) throw new Error("Snowflake requires trusted gateway session context");
  return {
    ...input,
    _knapsack_session_id: sessionId,
    _knapsack_scope_key: sessionKey,
  };
}
