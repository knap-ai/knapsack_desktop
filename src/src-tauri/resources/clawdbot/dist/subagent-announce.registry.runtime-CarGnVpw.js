import { i as normalizeDeliveryContext } from "./delivery-context.shared-EClQPjt-.js";
import { c as findRunIdsByChildSessionKeyFromRuns, d as listRunsForRequesterFromRuns, f as resolveRequesterForChildSessionFromRuns, m as subagentRuns, o as countPendingDescendantRunsExcludingRunFromRuns, p as shouldIgnorePostCompletionAnnounceForSessionFromRuns, s as countPendingDescendantRunsFromRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-Dyk_jaON.js";
import "./delivery-context-CToOfUqJ.js";
import { n as getLatestSubagentRunByChildSessionKey, t as countActiveDescendantRuns } from "./subagent-registry-read-DayKoqcW.js";
import { n as replaceSubagentRunAfterSteer } from "./subagent-registry-steer-runtime-Yr_gCN69.js";
//#region src/agents/subagent-registry-announce-read.ts
function resolveRequesterForChildSession(childSessionKey) {
	const resolved = resolveRequesterForChildSessionFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), childSessionKey);
	if (!resolved) return null;
	return {
		requesterSessionKey: resolved.requesterSessionKey,
		requesterOrigin: normalizeDeliveryContext(resolved.requesterOrigin)
	};
}
function isSubagentSessionRunActive(childSessionKey) {
	const runIds = findRunIdsByChildSessionKeyFromRuns(subagentRuns, childSessionKey);
	let latest;
	for (const runId of runIds) {
		const entry = subagentRuns.get(runId);
		if (!entry) continue;
		if (!latest || entry.createdAt > latest.createdAt) latest = entry;
	}
	return Boolean(latest && typeof latest.endedAt !== "number");
}
function shouldIgnorePostCompletionAnnounceForSession(childSessionKey) {
	return shouldIgnorePostCompletionAnnounceForSessionFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), childSessionKey);
}
function listSubagentRunsForRequester(requesterSessionKey, options) {
	return listRunsForRequesterFromRuns(subagentRuns, requesterSessionKey, options);
}
function countPendingDescendantRuns(rootSessionKey) {
	return countPendingDescendantRunsFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), rootSessionKey);
}
function countPendingDescendantRunsExcludingRun(rootSessionKey, excludeRunId) {
	return countPendingDescendantRunsExcludingRunFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), rootSessionKey, excludeRunId);
}
//#endregion
export { countActiveDescendantRuns, countPendingDescendantRuns, countPendingDescendantRunsExcludingRun, getLatestSubagentRunByChildSessionKey, isSubagentSessionRunActive, listSubagentRunsForRequester, replaceSubagentRunAfterSteer, resolveRequesterForChildSession, shouldIgnorePostCompletionAnnounceForSession };
