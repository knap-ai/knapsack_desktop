import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as buildTaskStatusSnapshot } from "./task-status-DdxMiKkn.js";
import { _ as markTaskTerminalById, a as findTaskByRunId, o as getTaskById, p as listTasksForRelatedSessionKey, w as updateTaskNotifyPolicyById, x as resolveTaskForLookupToken } from "./task-registry-BO2EMqj7.js";
//#region src/tasks/task-owner-access.ts
function canOwnerAccessTask(task, callerOwnerKey) {
	return task.scopeKind === "session" && normalizeOptionalString(task.ownerKey) === normalizeOptionalString(callerOwnerKey);
}
function getTaskByIdForOwner(params) {
	const task = getTaskById(params.taskId);
	return task && canOwnerAccessTask(task, params.callerOwnerKey) ? task : void 0;
}
function findTaskByRunIdForOwner(params) {
	const task = findTaskByRunId(params.runId);
	return task && canOwnerAccessTask(task, params.callerOwnerKey) ? task : void 0;
}
/** Update an owner-visible task's notification policy. */
function updateTaskNotifyPolicyForOwner(params) {
	const task = getTaskByIdForOwner({
		taskId: params.taskId,
		callerOwnerKey: params.callerOwnerKey
	});
	if (!task) return null;
	return updateTaskNotifyPolicyById({
		taskId: task.taskId,
		notifyPolicy: params.notifyPolicy
	});
}
/** Mark an owner-visible task as cancelled with a caller-provided summary. */
function cancelTaskByIdForOwner(params) {
	const task = getTaskByIdForOwner({
		taskId: params.taskId,
		callerOwnerKey: params.callerOwnerKey
	});
	if (!task) return null;
	return markTaskTerminalById({
		taskId: task.taskId,
		status: "cancelled",
		endedAt: params.endedAt,
		terminalSummary: params.terminalSummary
	});
}
function listTasksForRelatedSessionKeyForOwner(params) {
	return listTasksForRelatedSessionKey(params.relatedSessionKey).filter((task) => canOwnerAccessTask(task, params.callerOwnerKey));
}
function buildTaskStatusSnapshotForRelatedSessionKeyForOwner(params) {
	return buildTaskStatusSnapshot(listTasksForRelatedSessionKeyForOwner({
		relatedSessionKey: params.relatedSessionKey,
		callerOwnerKey: params.callerOwnerKey
	}));
}
function findLatestTaskForRelatedSessionKeyForOwner(params) {
	return listTasksForRelatedSessionKeyForOwner(params)[0];
}
function resolveTaskForLookupTokenForOwner(params) {
	const direct = getTaskByIdForOwner({
		taskId: params.token,
		callerOwnerKey: params.callerOwnerKey
	});
	if (direct) return direct;
	const byRun = findTaskByRunIdForOwner({
		runId: params.token,
		callerOwnerKey: params.callerOwnerKey
	});
	if (byRun) return byRun;
	const related = findLatestTaskForRelatedSessionKeyForOwner({
		relatedSessionKey: params.token,
		callerOwnerKey: params.callerOwnerKey
	});
	if (related) return related;
	const raw = resolveTaskForLookupToken(params.token);
	return raw && canOwnerAccessTask(raw, params.callerOwnerKey) ? raw : void 0;
}
//#endregion
export { getTaskByIdForOwner as a, updateTaskNotifyPolicyForOwner as c, findTaskByRunIdForOwner as i, cancelTaskByIdForOwner as n, listTasksForRelatedSessionKeyForOwner as o, findLatestTaskForRelatedSessionKeyForOwner as r, resolveTaskForLookupTokenForOwner as s, buildTaskStatusSnapshotForRelatedSessionKeyForOwner as t };
