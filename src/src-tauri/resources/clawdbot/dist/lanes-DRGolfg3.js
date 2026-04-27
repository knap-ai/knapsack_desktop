//#region src/agents/lanes.ts
const AGENT_LANE_NESTED = "nested";
const AGENT_LANE_SUBAGENT = "subagent";
const NESTED_LANE = "nested";
const NESTED_LANE_PREFIX = `${NESTED_LANE}:`;
function resolveNestedAgentLane(lane) {
	const trimmed = lane?.trim();
	if (!trimmed || trimmed === "cron") return AGENT_LANE_NESTED;
	return trimmed;
}
function resolveNestedAgentLaneForSession(sessionKey) {
	const trimmed = sessionKey?.trim();
	if (!trimmed) return AGENT_LANE_NESTED;
	return `${NESTED_LANE_PREFIX}${trimmed}`;
}
function isNestedAgentLane(lane) {
	if (!lane) return false;
	return lane === NESTED_LANE || lane.startsWith(NESTED_LANE_PREFIX);
}
//#endregion
export { resolveNestedAgentLaneForSession as i, isNestedAgentLane as n, resolveNestedAgentLane as r, AGENT_LANE_SUBAGENT as t };
