import { t as CommandLane } from "./lanes-CU7Ll8dR.js";
//#region src/agents/lanes.ts
const AGENT_LANE_NESTED = CommandLane.Nested;
const AGENT_LANE_SUBAGENT = CommandLane.Subagent;
function resolveNestedAgentLane(lane) {
	const trimmed = lane?.trim();
	if (!trimmed || trimmed === "cron") return AGENT_LANE_NESTED;
	return trimmed;
}
//#endregion
export { AGENT_LANE_SUBAGENT as n, resolveNestedAgentLane as r, AGENT_LANE_NESTED as t };
