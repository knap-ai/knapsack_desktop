import { T as parseAgentSessionKey } from "./session-key-D7XpmyVq.js";
import { i as loadSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { Gt as getTaskById, Jt as markTaskLostById, Kt as listTaskRecords, Ut as deleteTaskRecordById, Wt as ensureTaskRegistryReady, Xt as resolveTaskForLookupToken, Yt as maybeDeliverTaskTerminalUpdate, Zt as setTaskCleanupAfterById, pn as readAcpSessionEntry } from "./pi-embedded-BYdcxQ5A.js";
import { n as summarizeTaskRecords } from "./task-registry.summary-DqH4Nyhq.js";
import { t as createEmptyTaskAuditSummary } from "./task-registry.audit.shared-BKY02E9N.js";
//#region src/tasks/task-registry.audit.ts
const DEFAULT_STALE_QUEUED_MS = 10 * 6e4;
const DEFAULT_STALE_RUNNING_MS = 30 * 6e4;
function createFinding(params) {
	return {
		severity: params.severity,
		code: params.code,
		task: params.task,
		detail: params.detail,
		...typeof params.ageMs === "number" ? { ageMs: params.ageMs } : {}
	};
}
function taskReferenceAt(task) {
	return task.lastEventAt ?? task.startedAt ?? task.createdAt;
}
function findTimestampInconsistency(task) {
	if (task.startedAt && task.startedAt < task.createdAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		task,
		detail: "startedAt is earlier than createdAt"
	});
	if (task.endedAt && task.startedAt && task.endedAt < task.startedAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		task,
		detail: "endedAt is earlier than startedAt"
	});
	if ((task.status === "queued" || task.status === "running") && task.endedAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		task,
		detail: `${task.status} task should not already have endedAt`
	});
	return null;
}
function compareFindings(left, right) {
	const severityRank = (severity) => severity === "error" ? 0 : 1;
	const severityDiff = severityRank(left.severity) - severityRank(right.severity);
	if (severityDiff !== 0) return severityDiff;
	const leftAge = left.ageMs ?? -1;
	const rightAge = right.ageMs ?? -1;
	if (leftAge !== rightAge) return rightAge - leftAge;
	return left.task.createdAt - right.task.createdAt;
}
function listTaskAuditFindings(options = {}) {
	const tasks = options.tasks ?? reconcileInspectableTasks();
	const now = options.now ?? Date.now();
	const staleQueuedMs = options.staleQueuedMs ?? DEFAULT_STALE_QUEUED_MS;
	const staleRunningMs = options.staleRunningMs ?? DEFAULT_STALE_RUNNING_MS;
	const findings = [];
	for (const task of tasks) {
		const referenceAt = taskReferenceAt(task);
		const ageMs = Math.max(0, now - referenceAt);
		if (task.status === "queued" && ageMs >= staleQueuedMs) findings.push(createFinding({
			severity: "warn",
			code: "stale_queued",
			task,
			ageMs,
			detail: "queued task has not advanced recently"
		}));
		if (task.status === "running" && ageMs >= staleRunningMs) findings.push(createFinding({
			severity: "error",
			code: "stale_running",
			task,
			ageMs,
			detail: "running task appears stuck"
		}));
		if (task.status === "lost") findings.push(createFinding({
			severity: "error",
			code: "lost",
			task,
			ageMs,
			detail: task.error?.trim() || "task lost its backing session"
		}));
		if (task.deliveryStatus === "failed" && task.notifyPolicy !== "silent") findings.push(createFinding({
			severity: "warn",
			code: "delivery_failed",
			task,
			ageMs,
			detail: "terminal update delivery failed"
		}));
		if (task.status !== "lost" && task.status !== "queued" && task.status !== "running" && typeof task.cleanupAfter !== "number") findings.push(createFinding({
			severity: "warn",
			code: "missing_cleanup",
			task,
			ageMs,
			detail: "terminal task is missing cleanupAfter"
		}));
		const inconsistency = findTimestampInconsistency(task);
		if (inconsistency) findings.push(inconsistency);
	}
	return findings.toSorted(compareFindings);
}
function summarizeTaskAuditFindings(findings) {
	const summary = createEmptyTaskAuditSummary();
	for (const finding of findings) {
		summary.total += 1;
		summary.byCode[finding.code] += 1;
		if (finding.severity === "error") summary.errors += 1;
		else summary.warnings += 1;
	}
	return summary;
}
//#endregion
//#region src/tasks/task-registry.maintenance.ts
const TASK_RECONCILE_GRACE_MS = 5 * 6e4;
const TASK_RETENTION_MS = 10080 * 6e4;
const TASK_SWEEP_INTERVAL_MS = 6e4;
/**
* Number of tasks to process before yielding to the event loop.
* Keeps the main thread responsive during large sweeps.
*/
const SWEEP_YIELD_BATCH_SIZE = 25;
let sweeper = null;
let deferredSweep = null;
let sweepInProgress = false;
function findSessionEntryByKey(store, sessionKey) {
	const direct = store[sessionKey];
	if (direct) return direct;
	const normalized = sessionKey.toLowerCase();
	for (const [key, entry] of Object.entries(store)) if (key.toLowerCase() === normalized) return entry;
}
function isActiveTask(task) {
	return task.status === "queued" || task.status === "running";
}
function isTerminalTask(task) {
	return !isActiveTask(task);
}
function hasLostGraceExpired(task, now) {
	return now - (task.lastEventAt ?? task.startedAt ?? task.createdAt) >= TASK_RECONCILE_GRACE_MS;
}
function hasBackingSession(task) {
	const childSessionKey = task.childSessionKey?.trim();
	if (!childSessionKey) return true;
	if (task.runtime === "acp") {
		const acpEntry = readAcpSessionEntry({ sessionKey: childSessionKey });
		if (!acpEntry || acpEntry.storeReadFailed) return true;
		return Boolean(acpEntry.entry);
	}
	if (task.runtime === "subagent" || task.runtime === "cli") {
		const agentId = parseAgentSessionKey(childSessionKey)?.agentId;
		const store = loadSessionStore(resolveStorePath(void 0, { agentId }));
		return Boolean(findSessionEntryByKey(store, childSessionKey));
	}
	return true;
}
function shouldMarkLost(task, now) {
	if (!isActiveTask(task)) return false;
	if (!hasLostGraceExpired(task, now)) return false;
	return !hasBackingSession(task);
}
function shouldPruneTerminalTask(task, now) {
	if (!isTerminalTask(task)) return false;
	if (typeof task.cleanupAfter === "number") return now >= task.cleanupAfter;
	return now - (task.endedAt ?? task.lastEventAt ?? task.createdAt) >= TASK_RETENTION_MS;
}
function shouldStampCleanupAfter(task) {
	return isTerminalTask(task) && typeof task.cleanupAfter !== "number";
}
function resolveCleanupAfter(task) {
	return (task.endedAt ?? task.lastEventAt ?? task.createdAt) + TASK_RETENTION_MS;
}
function markTaskLost(task, now) {
	const cleanupAfter = task.cleanupAfter ?? projectTaskLost(task, now).cleanupAfter;
	const updated = markTaskLostById({
		taskId: task.taskId,
		endedAt: task.endedAt ?? now,
		lastEventAt: now,
		error: task.error ?? "backing session missing",
		cleanupAfter
	}) ?? task;
	maybeDeliverTaskTerminalUpdate(updated.taskId);
	return updated;
}
function projectTaskLost(task, now) {
	const projected = {
		...task,
		status: "lost",
		endedAt: task.endedAt ?? now,
		lastEventAt: now,
		error: task.error ?? "backing session missing"
	};
	return {
		...projected,
		...typeof projected.cleanupAfter === "number" ? {} : { cleanupAfter: resolveCleanupAfter(projected) }
	};
}
function reconcileTaskRecordForOperatorInspection(task) {
	const now = Date.now();
	if (!shouldMarkLost(task, now)) return task;
	return projectTaskLost(task, now);
}
function reconcileInspectableTasks() {
	ensureTaskRegistryReady();
	return listTaskRecords().map((task) => reconcileTaskRecordForOperatorInspection(task));
}
function getInspectableTaskRegistrySummary() {
	return summarizeTaskRecords(reconcileInspectableTasks());
}
function getInspectableTaskAuditSummary() {
	return summarizeTaskAuditFindings(listTaskAuditFindings({ tasks: reconcileInspectableTasks() }));
}
function reconcileTaskLookupToken(token) {
	ensureTaskRegistryReady();
	const task = resolveTaskForLookupToken(token);
	return task ? reconcileTaskRecordForOperatorInspection(task) : void 0;
}
function previewTaskRegistryMaintenance() {
	ensureTaskRegistryReady();
	const now = Date.now();
	let reconciled = 0;
	let cleanupStamped = 0;
	let pruned = 0;
	for (const task of listTaskRecords()) {
		if (shouldMarkLost(task, now)) {
			reconciled += 1;
			continue;
		}
		if (shouldPruneTerminalTask(task, now)) {
			pruned += 1;
			continue;
		}
		if (shouldStampCleanupAfter(task)) cleanupStamped += 1;
	}
	return {
		reconciled,
		cleanupStamped,
		pruned
	};
}
/**
* Yield control back to the event loop so that pending I/O callbacks,
* timers, and incoming requests can be processed between batches of
* synchronous task-registry maintenance work.
*/
function yieldToEventLoop() {
	return new Promise((resolve) => setImmediate(resolve));
}
function startScheduledSweep() {
	if (sweepInProgress) return;
	sweepInProgress = true;
	sweepTaskRegistry().finally(() => {
		sweepInProgress = false;
	});
}
async function runTaskRegistryMaintenance() {
	ensureTaskRegistryReady();
	const now = Date.now();
	let reconciled = 0;
	let cleanupStamped = 0;
	let pruned = 0;
	const tasks = listTaskRecords();
	let processed = 0;
	for (const task of tasks) {
		const current = getTaskById(task.taskId);
		if (!current) continue;
		if (shouldMarkLost(current, now)) {
			if (markTaskLost(current, now).status === "lost") reconciled += 1;
			processed += 1;
			if (processed % SWEEP_YIELD_BATCH_SIZE === 0) await yieldToEventLoop();
			continue;
		}
		if (shouldPruneTerminalTask(current, now) && deleteTaskRecordById(current.taskId)) {
			pruned += 1;
			processed += 1;
			if (processed % SWEEP_YIELD_BATCH_SIZE === 0) await yieldToEventLoop();
			continue;
		}
		if (shouldStampCleanupAfter(current) && setTaskCleanupAfterById({
			taskId: current.taskId,
			cleanupAfter: resolveCleanupAfter(current)
		})) cleanupStamped += 1;
		processed += 1;
		if (processed % SWEEP_YIELD_BATCH_SIZE === 0) await yieldToEventLoop();
	}
	return {
		reconciled,
		cleanupStamped,
		pruned
	};
}
async function sweepTaskRegistry() {
	return runTaskRegistryMaintenance();
}
function startTaskRegistryMaintenance() {
	ensureTaskRegistryReady();
	deferredSweep = setTimeout(() => {
		deferredSweep = null;
		startScheduledSweep();
	}, 5e3);
	deferredSweep.unref?.();
	if (sweeper) return;
	sweeper = setInterval(startScheduledSweep, TASK_SWEEP_INTERVAL_MS);
	sweeper.unref?.();
}
function stopTaskRegistryMaintenanceForTests() {
	if (deferredSweep) {
		clearTimeout(deferredSweep);
		deferredSweep = null;
	}
	if (sweeper) {
		clearInterval(sweeper);
		sweeper = null;
	}
	sweepInProgress = false;
}
function getReconciledTaskById(taskId) {
	const task = getTaskById(taskId);
	return task ? reconcileTaskRecordForOperatorInspection(task) : void 0;
}
//#endregion
export { reconcileInspectableTasks as a, runTaskRegistryMaintenance as c, sweepTaskRegistry as d, listTaskAuditFindings as f, previewTaskRegistryMaintenance as i, startTaskRegistryMaintenance as l, getInspectableTaskRegistrySummary as n, reconcileTaskLookupToken as o, summarizeTaskAuditFindings as p, getReconciledTaskById as r, reconcileTaskRecordForOperatorInspection as s, getInspectableTaskAuditSummary as t, stopTaskRegistryMaintenanceForTests as u };
