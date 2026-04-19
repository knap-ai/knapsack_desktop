//#region src/agents/subagent-lifecycle-events.ts
const SUBAGENT_TARGET_KIND_SUBAGENT = "subagent";
const SUBAGENT_ENDED_REASON_COMPLETE = "subagent-complete";
const SUBAGENT_ENDED_REASON_ERROR = "subagent-error";
const SUBAGENT_ENDED_REASON_KILLED = "subagent-killed";
const SUBAGENT_ENDED_OUTCOME_ERROR = "error";
const SUBAGENT_ENDED_OUTCOME_TIMEOUT = "timeout";
const SUBAGENT_ENDED_OUTCOME_KILLED = "killed";
//#endregion
//#region src/agents/subagent-session-metrics.ts
function resolveSubagentSessionStartedAtInternal(entry) {
	if (typeof entry.sessionStartedAt === "number" && Number.isFinite(entry.sessionStartedAt)) return entry.sessionStartedAt;
	if (typeof entry.startedAt === "number" && Number.isFinite(entry.startedAt)) return entry.startedAt;
	return typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt) ? entry.createdAt : void 0;
}
function getSubagentSessionStartedAt(entry) {
	return entry ? resolveSubagentSessionStartedAtInternal(entry) : void 0;
}
function getSubagentSessionRuntimeMs(entry, now = Date.now()) {
	if (!entry) return;
	const accumulatedRuntimeMs = typeof entry.accumulatedRuntimeMs === "number" && Number.isFinite(entry.accumulatedRuntimeMs) ? Math.max(0, entry.accumulatedRuntimeMs) : 0;
	if (typeof entry.startedAt !== "number" || !Number.isFinite(entry.startedAt)) return entry.accumulatedRuntimeMs != null ? accumulatedRuntimeMs : void 0;
	const currentRunEndedAt = typeof entry.endedAt === "number" && Number.isFinite(entry.endedAt) ? entry.endedAt : now;
	return Math.max(0, accumulatedRuntimeMs + Math.max(0, currentRunEndedAt - entry.startedAt));
}
function resolveSubagentSessionStatus(entry) {
	if (!entry) return;
	if (!entry.endedAt) return "running";
	if (entry.endedReason === "subagent-killed") return "killed";
	const status = entry.outcome?.status;
	if (status === "error") return "failed";
	if (status === "timeout") return "timeout";
	return "done";
}
//#endregion
export { SUBAGENT_ENDED_OUTCOME_KILLED as a, SUBAGENT_ENDED_REASON_ERROR as c, SUBAGENT_ENDED_OUTCOME_ERROR as i, SUBAGENT_ENDED_REASON_KILLED as l, getSubagentSessionStartedAt as n, SUBAGENT_ENDED_OUTCOME_TIMEOUT as o, resolveSubagentSessionStatus as r, SUBAGENT_ENDED_REASON_COMPLETE as s, getSubagentSessionRuntimeMs as t, SUBAGENT_TARGET_KIND_SUBAGENT as u };
