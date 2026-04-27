import { i as normalizeDeliveryContext } from "./delivery-context.shared-BRwSoIeK.js";
import { A as subagentRuns, f as listRunsForRequesterFromRuns, l as isSubagentSessionRunActiveFromRuns, m as shouldIgnorePostCompletionAnnounceForSessionFromRuns, o as countPendingDescendantRunsExcludingRunFromRuns, p as resolveRequesterForChildSessionFromRuns, s as countPendingDescendantRunsFromRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-BdxY8kqY.js";
import { n as getLatestSubagentRunByChildSessionKey, t as countActiveDescendantRuns } from "./subagent-registry-read-BNOaD8Y-.js";
import { r as replaceSubagentRunAfterSteer } from "./subagent-registry-steer-runtime-DxUH9sbg.js";
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
	return isSubagentSessionRunActiveFromRuns(subagentRuns, childSessionKey);
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
