import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as setVerbose } from "./global-state-LrCGCReA.js";
import { n as defaultRuntime, r as writeRuntimeJson } from "./runtime-Dx7oeLYq.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { n as isRich, r as theme } from "./theme-D5sxSdHD.js";
import { n as info } from "./globals-De6QTwLG.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { t as sanitizeTerminalText } from "./safe-text-BfEU6V1V.js";
import "./config-Q9XZc_2I.js";
import { c as updateSessionStore, f as pruneStaleEntries, g as enforceSessionDiskBudget, p as resolveMaintenanceConfig, u as capEntryCount } from "./store-DFXcceZJ.js";
import "./sessions-vP2E4vs-.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { D as deleteTaskFlowRecordById, I as resolveTaskFlowForLookupToken, M as getTaskFlowRegistryRestoreFailure, N as listTaskFlowRecords, d as listTasksForFlowId, j as getTaskFlowById, o as getTaskById, t as cancelTaskById, w as updateTaskNotifyPolicyById, z as updateFlowRecordByIdExpectedRevision } from "./task-registry-BO2EMqj7.js";
import { n as summarizeTaskRecords } from "./task-registry.summary-Ccv1tBd5.js";
import "./runtime-internal-tfNsv16F.js";
import { s as getFlowTaskSummary, t as cancelFlowById } from "./task-executor-ZyzAPL-M.js";
import { n as runCommandWithRuntime } from "./cli-utils-PbJDKJWK.js";
import { t as formatHelpExamples } from "./help-format-DfEzE9Kd.js";
import { n as parsePositiveIntOrUndefined } from "./helpers-DYyz93KC.js";
import { r as healthCommand } from "./health-DkBRBZ7f.js";
import { a as formatSessionModelCell, c as resolveSessionDisplayModel, i as formatSessionKeyCell, l as resolveSessionStoreTargetsOrExit, n as formatSessionAgeCell, o as toSessionDisplayRows, r as formatSessionFlagsCell, s as resolveSessionDisplayDefaults, t as sessionsCommand } from "./sessions-Dq1x4WhM.js";
import { t as statusCommand } from "./status-EfLmpl9m.js";
import { _ as listTaskAuditFindings, a as reconcileInspectableTasks, i as previewTaskRegistryMaintenance, l as runTaskRegistryMaintenance, n as getInspectableTaskRegistrySummary, o as reconcileTaskLookupToken, t as getInspectableTaskAuditSummary, v as summarizeTaskAuditFindings } from "./task-registry.maintenance-0PRPxfex.js";
import fs from "node:fs";
//#region src/commands/flows.ts
const ID_PAD$1 = 10;
const STATUS_PAD$1 = 10;
const MODE_PAD = 14;
const REV_PAD = 6;
const CTRL_PAD = 20;
function truncate$1(value, maxChars) {
	if (value.length <= maxChars) return value;
	if (maxChars <= 1) return value.slice(0, maxChars);
	return `${value.slice(0, maxChars - 1)}…`;
}
function safeFlowDisplayText(value, maxChars) {
	const sanitized = sanitizeTerminalText(value ?? "").trim();
	if (!sanitized) return "n/a";
	return typeof maxChars === "number" ? truncate$1(sanitized, maxChars) : sanitized;
}
function shortToken$1(value, maxChars = ID_PAD$1) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return "n/a";
	return truncate$1(trimmed, maxChars);
}
function formatFlowStatusCell(status, rich) {
	const padded = status.padEnd(STATUS_PAD$1);
	if (!rich) return padded;
	if (status === "succeeded") return theme.success(padded);
	if (status === "failed" || status === "lost") return theme.error(padded);
	if (status === "running") return theme.accentBright(padded);
	if (status === "blocked") return theme.warn(padded);
	return theme.muted(padded);
}
function formatFlowRows(flows, rich) {
	const header = [
		"TaskFlow".padEnd(ID_PAD$1),
		"Mode".padEnd(MODE_PAD),
		"Status".padEnd(STATUS_PAD$1),
		"Rev".padEnd(REV_PAD),
		"Controller".padEnd(CTRL_PAD),
		"Tasks".padEnd(14),
		"Goal"
	].join(" ");
	const lines = [rich ? theme.heading(header) : header];
	for (const flow of flows) {
		const taskSummary = getFlowTaskSummary(flow.flowId);
		const counts = `${taskSummary.active} active/${taskSummary.total} total`;
		lines.push([
			shortToken$1(flow.flowId).padEnd(ID_PAD$1),
			flow.syncMode.padEnd(MODE_PAD),
			formatFlowStatusCell(flow.status, rich),
			String(flow.revision).padEnd(REV_PAD),
			safeFlowDisplayText(flow.controllerId, CTRL_PAD).padEnd(CTRL_PAD),
			counts.padEnd(14),
			safeFlowDisplayText(flow.goal, 80)
		].join(" "));
	}
	return lines;
}
function formatFlowListSummary(flows) {
	return `${flows.filter((flow) => flow.status === "queued" || flow.status === "running").length} active · ${flows.filter((flow) => flow.status === "blocked").length} blocked · ${flows.filter((flow) => flow.cancelRequestedAt != null).length} cancel-requested · ${flows.length} total`;
}
function summarizeWait(flow) {
	if (flow.waitJson == null) return "n/a";
	if (typeof flow.waitJson === "string" || typeof flow.waitJson === "number" || typeof flow.waitJson === "boolean") return String(flow.waitJson);
	if (Array.isArray(flow.waitJson)) return `array(${flow.waitJson.length})`;
	return Object.keys(flow.waitJson).toSorted().join(", ") || "object";
}
function summarizeFlowState(flow) {
	if (flow.status === "blocked") {
		if (flow.blockedSummary) return flow.blockedSummary;
		if (flow.blockedTaskId) return `blocked by ${flow.blockedTaskId}`;
		return "blocked";
	}
	if (flow.status === "waiting" && flow.waitJson != null) return summarizeWait(flow);
	return null;
}
async function flowsListCommand(opts, runtime) {
	const statusFilter = opts.status?.trim();
	const flows = listTaskFlowRecords().filter((flow) => {
		if (statusFilter && flow.status !== statusFilter) return false;
		return true;
	});
	if (opts.json) {
		runtime.log(JSON.stringify({
			count: flows.length,
			status: statusFilter ?? null,
			flows: flows.map((flow) => ({
				...flow,
				tasks: listTasksForFlowId(flow.flowId),
				taskSummary: getFlowTaskSummary(flow.flowId)
			}))
		}, null, 2));
		return;
	}
	runtime.log(info(`TaskFlows: ${flows.length}`));
	runtime.log(info(`TaskFlow pressure: ${formatFlowListSummary(flows)}`));
	if (statusFilter) runtime.log(info(`Status filter: ${statusFilter}`));
	if (flows.length === 0) {
		runtime.log("No TaskFlows found.");
		return;
	}
	const rich = isRich();
	for (const line of formatFlowRows(flows, rich)) runtime.log(line);
}
async function flowsShowCommand(opts, runtime) {
	const flow = resolveTaskFlowForLookupToken(opts.lookup);
	if (!flow) {
		runtime.error(`TaskFlow not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const tasks = listTasksForFlowId(flow.flowId);
	const taskSummary = getFlowTaskSummary(flow.flowId);
	const stateSummary = summarizeFlowState(flow);
	if (opts.json) {
		runtime.log(JSON.stringify({
			...flow,
			tasks,
			taskSummary
		}, null, 2));
		return;
	}
	const lines = [
		"TaskFlow:",
		`flowId: ${flow.flowId}`,
		`status: ${flow.status}`,
		`goal: ${safeFlowDisplayText(flow.goal)}`,
		`currentStep: ${safeFlowDisplayText(flow.currentStep)}`,
		`owner: ${safeFlowDisplayText(flow.ownerKey)}`,
		`notify: ${flow.notifyPolicy}`,
		...stateSummary ? [`state: ${safeFlowDisplayText(stateSummary)}`] : [],
		...flow.cancelRequestedAt ? [`cancelRequestedAt: ${new Date(flow.cancelRequestedAt).toISOString()}`] : [],
		`createdAt: ${new Date(flow.createdAt).toISOString()}`,
		`updatedAt: ${new Date(flow.updatedAt).toISOString()}`,
		`endedAt: ${flow.endedAt ? new Date(flow.endedAt).toISOString() : "n/a"}`,
		`tasks: ${taskSummary.total} total · ${taskSummary.active} active · ${taskSummary.failures} issues`
	];
	for (const line of lines) runtime.log(line);
	if (tasks.length === 0) {
		runtime.log("Linked tasks: none");
		return;
	}
	runtime.log("Linked tasks:");
	for (const task of tasks) {
		const safeLabel = safeFlowDisplayText(task.label ?? task.task);
		runtime.log(`- ${task.taskId} ${task.status} ${task.runId ?? "n/a"} ${safeLabel}`);
	}
}
async function flowsCancelCommand(opts, runtime) {
	const flow = resolveTaskFlowForLookupToken(opts.lookup);
	if (!flow) {
		runtime.error(`Flow not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const result = await cancelFlowById({
		cfg: loadConfig(),
		flowId: flow.flowId
	});
	if (!result.found) {
		runtime.error(result.reason ?? `Flow not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	if (!result.cancelled) {
		runtime.error(result.reason ?? `Could not cancel TaskFlow: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const updated = getTaskFlowById(flow.flowId) ?? result.flow ?? flow;
	runtime.log(`Cancelled ${updated.flowId} (${updated.syncMode}) with status ${updated.status}.`);
}
//#endregion
//#region src/commands/sessions-cleanup.ts
const ACTION_PAD = 12;
function resolveSessionCleanupAction(params) {
	if (params.missingKeys.has(params.key)) return "prune-missing";
	if (params.staleKeys.has(params.key)) return "prune-stale";
	if (params.cappedKeys.has(params.key)) return "cap-overflow";
	if (params.budgetEvictedKeys.has(params.key)) return "evict-budget";
	return "keep";
}
function formatCleanupActionCell(action, rich) {
	const label = action.padEnd(ACTION_PAD);
	if (!rich) return label;
	if (action === "keep") return theme.muted(label);
	if (action === "prune-missing") return theme.error(label);
	if (action === "prune-stale") return theme.warn(label);
	if (action === "cap-overflow") return theme.accentBright(label);
	return theme.error(label);
}
function buildActionRows(params) {
	return toSessionDisplayRows(params.beforeStore).map((row) => ({
		...row,
		action: resolveSessionCleanupAction({
			key: row.key,
			missingKeys: params.missingKeys,
			staleKeys: params.staleKeys,
			cappedKeys: params.cappedKeys,
			budgetEvictedKeys: params.budgetEvictedKeys
		})
	}));
}
function pruneMissingTranscriptEntries(params) {
	const sessionPathOpts = resolveSessionFilePathOptions({ storePath: params.storePath });
	let removed = 0;
	for (const [key, entry] of Object.entries(params.store)) {
		if (!entry?.sessionId) continue;
		const transcriptPath = resolveSessionFilePath(entry.sessionId, entry, sessionPathOpts);
		if (!fs.existsSync(transcriptPath)) {
			delete params.store[key];
			removed += 1;
			params.onPruned?.(key);
		}
	}
	return removed;
}
async function previewStoreCleanup(params) {
	const maintenance = resolveMaintenanceConfig();
	const beforeStore = loadSessionStore(params.target.storePath, { skipCache: true });
	const previewStore = structuredClone(beforeStore);
	const staleKeys = /* @__PURE__ */ new Set();
	const cappedKeys = /* @__PURE__ */ new Set();
	const missingKeys = /* @__PURE__ */ new Set();
	const missing = params.fixMissing === true ? pruneMissingTranscriptEntries({
		store: previewStore,
		storePath: params.target.storePath,
		onPruned: (key) => {
			missingKeys.add(key);
		}
	}) : 0;
	const pruned = pruneStaleEntries(previewStore, maintenance.pruneAfterMs, {
		log: false,
		onPruned: ({ key }) => {
			staleKeys.add(key);
		}
	});
	const capped = capEntryCount(previewStore, maintenance.maxEntries, {
		log: false,
		onCapped: ({ key }) => {
			cappedKeys.add(key);
		}
	});
	const beforeBudgetStore = structuredClone(previewStore);
	const diskBudget = await enforceSessionDiskBudget({
		store: previewStore,
		storePath: params.target.storePath,
		activeSessionKey: params.activeKey,
		maintenance,
		warnOnly: false,
		dryRun: true
	});
	const budgetEvictedKeys = /* @__PURE__ */ new Set();
	for (const key of Object.keys(beforeBudgetStore)) if (!Object.hasOwn(previewStore, key)) budgetEvictedKeys.add(key);
	const beforeCount = Object.keys(beforeStore).length;
	const afterPreviewCount = Object.keys(previewStore).length;
	const wouldMutate = missing > 0 || pruned > 0 || capped > 0 || (diskBudget?.removedEntries ?? 0) > 0 || (diskBudget?.removedFiles ?? 0) > 0;
	return {
		summary: {
			agentId: params.target.agentId,
			storePath: params.target.storePath,
			mode: params.mode,
			dryRun: params.dryRun,
			beforeCount,
			afterCount: afterPreviewCount,
			missing,
			pruned,
			capped,
			diskBudget,
			wouldMutate
		},
		actionRows: buildActionRows({
			beforeStore,
			staleKeys,
			cappedKeys,
			budgetEvictedKeys,
			missingKeys
		})
	};
}
function renderStoreDryRunPlan(params) {
	const rich = isRich();
	if (params.showAgentHeader) params.runtime.log(`Agent: ${params.summary.agentId}`);
	params.runtime.log(`Session store: ${params.summary.storePath}`);
	params.runtime.log(`Maintenance mode: ${params.summary.mode}`);
	params.runtime.log(`Entries: ${params.summary.beforeCount} -> ${params.summary.afterCount} (remove ${params.summary.beforeCount - params.summary.afterCount})`);
	params.runtime.log(`Would prune missing transcripts: ${params.summary.missing}`);
	params.runtime.log(`Would prune stale: ${params.summary.pruned}`);
	params.runtime.log(`Would cap overflow: ${params.summary.capped}`);
	if (params.summary.diskBudget) params.runtime.log(`Would enforce disk budget: ${params.summary.diskBudget.totalBytesBefore} -> ${params.summary.diskBudget.totalBytesAfter} bytes (files ${params.summary.diskBudget.removedFiles}, entries ${params.summary.diskBudget.removedEntries})`);
	if (params.actionRows.length === 0) return;
	params.runtime.log("");
	params.runtime.log("Planned session actions:");
	const header = [
		"Action".padEnd(ACTION_PAD),
		"Key".padEnd(26),
		"Age".padEnd(9),
		"Model".padEnd(14),
		"Flags"
	].join(" ");
	params.runtime.log(rich ? theme.heading(header) : header);
	for (const actionRow of params.actionRows) {
		const model = resolveSessionDisplayModel(params.cfg, actionRow);
		const line = [
			formatCleanupActionCell(actionRow.action, rich),
			formatSessionKeyCell(actionRow.key, rich),
			formatSessionAgeCell(actionRow.updatedAt, rich),
			formatSessionModelCell(model, rich),
			formatSessionFlagsCell(actionRow, rich)
		].join(" ");
		params.runtime.log(line.trimEnd());
	}
}
async function sessionsCleanupCommand(opts, runtime) {
	const cfg = loadConfig();
	const displayDefaults = resolveSessionDisplayDefaults(cfg);
	const mode = opts.enforce ? "enforce" : resolveMaintenanceConfig().mode;
	const targets = resolveSessionStoreTargetsOrExit({
		cfg,
		opts: {
			store: opts.store,
			agent: opts.agent,
			allAgents: opts.allAgents
		},
		runtime
	});
	if (!targets) return;
	const previewResults = [];
	for (const target of targets) {
		const result = await previewStoreCleanup({
			target,
			mode,
			dryRun: Boolean(opts.dryRun),
			activeKey: opts.activeKey,
			fixMissing: Boolean(opts.fixMissing)
		});
		previewResults.push(result);
	}
	if (opts.dryRun) {
		if (opts.json) {
			if (previewResults.length === 1) {
				writeRuntimeJson(runtime, previewResults[0]?.summary ?? {});
				return;
			}
			writeRuntimeJson(runtime, {
				allAgents: true,
				mode,
				dryRun: true,
				stores: previewResults.map((result) => result.summary)
			});
			return;
		}
		for (let i = 0; i < previewResults.length; i += 1) {
			const result = previewResults[i];
			if (i > 0) runtime.log("");
			renderStoreDryRunPlan({
				cfg,
				summary: result.summary,
				actionRows: result.actionRows,
				displayDefaults,
				runtime,
				showAgentHeader: previewResults.length > 1
			});
		}
		return;
	}
	const appliedSummaries = [];
	for (const target of targets) {
		const appliedReportRef = { current: null };
		const missingApplied = await updateSessionStore(target.storePath, async (store) => {
			if (!opts.fixMissing) return 0;
			return pruneMissingTranscriptEntries({
				store,
				storePath: target.storePath
			});
		}, {
			activeSessionKey: opts.activeKey,
			maintenanceOverride: { mode },
			onMaintenanceApplied: (report) => {
				appliedReportRef.current = report;
			}
		});
		const afterStore = loadSessionStore(target.storePath, { skipCache: true });
		const preview = previewResults.find((result) => result.summary.storePath === target.storePath);
		const appliedReport = appliedReportRef.current;
		const summary = appliedReport === null ? {
			...preview?.summary ?? {
				agentId: target.agentId,
				storePath: target.storePath,
				mode,
				dryRun: false,
				beforeCount: 0,
				afterCount: 0,
				missing: 0,
				pruned: 0,
				capped: 0,
				diskBudget: null,
				wouldMutate: false
			},
			dryRun: false,
			applied: true,
			appliedCount: Object.keys(afterStore).length
		} : {
			agentId: target.agentId,
			storePath: target.storePath,
			mode: appliedReport.mode,
			dryRun: false,
			beforeCount: appliedReport.beforeCount,
			afterCount: appliedReport.afterCount,
			missing: missingApplied,
			pruned: appliedReport.pruned,
			capped: appliedReport.capped,
			diskBudget: appliedReport.diskBudget,
			wouldMutate: missingApplied > 0 || appliedReport.pruned > 0 || appliedReport.capped > 0 || (appliedReport.diskBudget?.removedEntries ?? 0) > 0 || (appliedReport.diskBudget?.removedFiles ?? 0) > 0,
			applied: true,
			appliedCount: Object.keys(afterStore).length
		};
		appliedSummaries.push(summary);
	}
	if (opts.json) {
		if (appliedSummaries.length === 1) {
			writeRuntimeJson(runtime, appliedSummaries[0] ?? {});
			return;
		}
		writeRuntimeJson(runtime, {
			allAgents: true,
			mode,
			dryRun: false,
			stores: appliedSummaries
		});
		return;
	}
	for (let i = 0; i < appliedSummaries.length; i += 1) {
		const summary = appliedSummaries[i];
		if (i > 0) runtime.log("");
		if (appliedSummaries.length > 1) runtime.log(`Agent: ${summary.agentId}`);
		runtime.log(`Session store: ${summary.storePath}`);
		runtime.log(`Applied maintenance. Current entries: ${summary.appliedCount ?? 0}`);
	}
}
//#endregion
//#region src/tasks/task-flow-registry.audit.ts
const DEFAULT_STALE_RUNNING_MS = 30 * 6e4;
const DEFAULT_STALE_WAITING_MS = 30 * 6e4;
const DEFAULT_STALE_BLOCKED_MS = 30 * 6e4;
const DEFAULT_CANCEL_STUCK_MS = 5 * 6e4;
function createFinding(params) {
	return {
		severity: params.severity,
		code: params.code,
		detail: params.detail,
		...typeof params.ageMs === "number" ? { ageMs: params.ageMs } : {},
		...params.flow ? { flow: params.flow } : {}
	};
}
function severityRank(severity) {
	return severity === "error" ? 0 : 1;
}
function compareFindings(left, right) {
	const severityDiff = severityRank(left.severity) - severityRank(right.severity);
	if (severityDiff !== 0) return severityDiff;
	const leftAge = left.ageMs ?? -1;
	const rightAge = right.ageMs ?? -1;
	if (leftAge !== rightAge) return rightAge - leftAge;
	return (left.flow?.createdAt ?? 0) - (right.flow?.createdAt ?? 0);
}
function getReferenceAt(flow) {
	return flow.updatedAt ?? flow.createdAt;
}
function getLinkedTasks(flowId) {
	return listTasksForFlowId(flowId);
}
function hasBlockingMetadata(flow) {
	return Boolean(flow.blockedTaskId?.trim() || flow.blockedSummary?.trim() || flow.waitJson != null);
}
function findTimestampInconsistency(flow) {
	if (flow.updatedAt < flow.createdAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		flow,
		detail: "updatedAt is earlier than createdAt"
	});
	if (flow.endedAt && flow.endedAt < flow.createdAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		flow,
		detail: "endedAt is earlier than createdAt"
	});
	if (flow.endedAt && flow.endedAt < flow.updatedAt) return createFinding({
		severity: "warn",
		code: "inconsistent_timestamps",
		flow,
		detail: "endedAt is earlier than updatedAt"
	});
	return null;
}
function createEmptyTaskFlowAuditSummary() {
	return {
		total: 0,
		warnings: 0,
		errors: 0,
		byCode: {
			restore_failed: 0,
			stale_running: 0,
			stale_waiting: 0,
			stale_blocked: 0,
			cancel_stuck: 0,
			missing_linked_tasks: 0,
			blocked_task_missing: 0,
			inconsistent_timestamps: 0
		}
	};
}
function listTaskFlowAuditFindings(options = {}) {
	const flows = options.flows ?? listTaskFlowRecords();
	const now = options.now ?? Date.now();
	const staleRunningMs = options.staleRunningMs ?? DEFAULT_STALE_RUNNING_MS;
	const staleWaitingMs = options.staleWaitingMs ?? DEFAULT_STALE_WAITING_MS;
	const staleBlockedMs = options.staleBlockedMs ?? DEFAULT_STALE_BLOCKED_MS;
	const cancelStuckMs = options.cancelStuckMs ?? DEFAULT_CANCEL_STUCK_MS;
	const findings = [];
	const restoreFailure = getTaskFlowRegistryRestoreFailure();
	if (restoreFailure) findings.push(createFinding({
		severity: "error",
		code: "restore_failed",
		detail: `task-flow registry restore failed: ${restoreFailure}`
	}));
	for (const flow of flows) {
		const referenceAt = getReferenceAt(flow);
		const ageMs = Math.max(0, now - referenceAt);
		const linkedTasks = getLinkedTasks(flow.flowId);
		const activeTasks = linkedTasks.filter((task) => task.status === "queued" || task.status === "running");
		if (flow.status === "running" && ageMs >= staleRunningMs) findings.push(createFinding({
			severity: "error",
			code: "stale_running",
			flow,
			ageMs,
			detail: "running TaskFlow has not advanced recently"
		}));
		if (flow.status === "waiting" && ageMs >= staleWaitingMs) findings.push(createFinding({
			severity: "warn",
			code: "stale_waiting",
			flow,
			ageMs,
			detail: "waiting TaskFlow has not advanced recently"
		}));
		if (flow.status === "blocked" && ageMs >= staleBlockedMs) findings.push(createFinding({
			severity: "warn",
			code: "stale_blocked",
			flow,
			ageMs,
			detail: "blocked TaskFlow has not advanced recently"
		}));
		if (flow.cancelRequestedAt != null && flow.status !== "cancelled" && flow.status !== "failed" && flow.status !== "succeeded" && flow.status !== "lost" && activeTasks.length === 0 && now - flow.cancelRequestedAt >= cancelStuckMs) findings.push(createFinding({
			severity: "warn",
			code: "cancel_stuck",
			flow,
			ageMs: Math.max(0, now - flow.cancelRequestedAt),
			detail: "cancel-requested TaskFlow has no active child tasks but is still nonterminal"
		}));
		if (flow.syncMode === "managed" && (flow.status === "running" || flow.status === "waiting" || flow.status === "blocked") && ageMs >= (flow.status === "running" ? staleRunningMs : flow.status === "waiting" ? staleWaitingMs : staleBlockedMs) && linkedTasks.length === 0 && !hasBlockingMetadata(flow)) findings.push(createFinding({
			severity: flow.status === "running" ? "error" : "warn",
			code: "missing_linked_tasks",
			flow,
			ageMs,
			detail: "managed TaskFlow has no linked tasks or wait state"
		}));
		if (flow.blockedTaskId?.trim()) {
			const blockedTaskId = flow.blockedTaskId.trim();
			if (!linkedTasks.some((task) => task.taskId === blockedTaskId)) findings.push(createFinding({
				severity: "warn",
				code: "blocked_task_missing",
				flow,
				ageMs,
				detail: `blocked TaskFlow points at missing task ${blockedTaskId}`
			}));
		}
		const inconsistency = findTimestampInconsistency(flow);
		if (inconsistency) findings.push(inconsistency);
	}
	return findings.toSorted(compareFindings);
}
function summarizeTaskFlowAuditFindings(findings) {
	const summary = createEmptyTaskFlowAuditSummary();
	for (const finding of findings) {
		summary.total += 1;
		summary.byCode[finding.code] += 1;
		if (finding.severity === "error") summary.errors += 1;
		else summary.warnings += 1;
	}
	return summary;
}
//#endregion
//#region src/tasks/task-flow-registry.maintenance.ts
const TASK_FLOW_RETENTION_MS = 10080 * 6e4;
function isTerminalFlow(flow) {
	return flow.status === "succeeded" || flow.status === "failed" || flow.status === "cancelled" || flow.status === "lost";
}
function hasActiveLinkedTasks(flowId) {
	return listTasksForFlowId(flowId).some((task) => task.status === "queued" || task.status === "running");
}
function resolveTerminalAt(flow) {
	return flow.endedAt ?? flow.updatedAt ?? flow.createdAt;
}
function shouldPruneFlow(flow, now) {
	if (!isTerminalFlow(flow)) return false;
	if (hasActiveLinkedTasks(flow.flowId)) return false;
	return now - resolveTerminalAt(flow) >= TASK_FLOW_RETENTION_MS;
}
function shouldFinalizeCancelledFlow(flow) {
	if (flow.syncMode !== "managed") return false;
	if (flow.cancelRequestedAt == null || isTerminalFlow(flow)) return false;
	return !hasActiveLinkedTasks(flow.flowId);
}
function finalizeCancelledFlow(flow, now) {
	let current = flow;
	for (let attempt = 0; attempt < 2; attempt += 1) {
		const endedAt = Math.max(now, current.updatedAt, current.cancelRequestedAt ?? now);
		const result = updateFlowRecordByIdExpectedRevision({
			flowId: current.flowId,
			expectedRevision: current.revision,
			patch: {
				status: "cancelled",
				blockedTaskId: null,
				blockedSummary: null,
				waitJson: null,
				endedAt,
				updatedAt: endedAt
			}
		});
		if (result.applied) return true;
		if (result.reason === "not_found" || !result.current) return false;
		current = result.current;
		if (!shouldFinalizeCancelledFlow(current)) return false;
	}
	return false;
}
function getInspectableTaskFlowAuditSummary() {
	return summarizeTaskFlowAuditFindings(listTaskFlowAuditFindings());
}
function previewTaskFlowRegistryMaintenance() {
	const now = Date.now();
	let reconciled = 0;
	let pruned = 0;
	for (const flow of listTaskFlowRecords()) {
		if (shouldFinalizeCancelledFlow(flow)) {
			reconciled += 1;
			continue;
		}
		if (shouldPruneFlow(flow, now)) pruned += 1;
	}
	return {
		reconciled,
		pruned
	};
}
async function runTaskFlowRegistryMaintenance() {
	const now = Date.now();
	let reconciled = 0;
	let pruned = 0;
	for (const flow of listTaskFlowRecords()) {
		const current = getTaskFlowById(flow.flowId);
		if (!current) continue;
		if (shouldFinalizeCancelledFlow(current)) {
			if (finalizeCancelledFlow(current, now)) reconciled += 1;
			continue;
		}
		if (shouldPruneFlow(current, now) && deleteTaskFlowRecordById(current.flowId)) pruned += 1;
	}
	return {
		reconciled,
		pruned
	};
}
//#endregion
//#region src/commands/tasks.ts
const RUNTIME_PAD = 8;
const STATUS_PAD = 10;
const DELIVERY_PAD = 14;
const ID_PAD = 10;
const RUN_PAD = 10;
function truncate(value, maxChars) {
	if (value.length <= maxChars) return value;
	if (maxChars <= 1) return value.slice(0, maxChars);
	return `${value.slice(0, maxChars - 1)}…`;
}
function shortToken(value, maxChars = ID_PAD) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return "n/a";
	return truncate(trimmed, maxChars);
}
function formatTaskStatusCell(status, rich) {
	const padded = status.padEnd(STATUS_PAD);
	if (!rich) return padded;
	if (status === "succeeded") return theme.success(padded);
	if (status === "failed" || status === "lost" || status === "timed_out") return theme.error(padded);
	if (status === "running") return theme.accentBright(padded);
	return theme.muted(padded);
}
function formatTaskRows(tasks, rich) {
	const header = [
		"Task".padEnd(ID_PAD),
		"Kind".padEnd(RUNTIME_PAD),
		"Status".padEnd(STATUS_PAD),
		"Delivery".padEnd(DELIVERY_PAD),
		"Run".padEnd(RUN_PAD),
		"Child Session",
		"Summary"
	].join(" ");
	const lines = [rich ? theme.heading(header) : header];
	for (const task of tasks) {
		const summary = truncate(normalizeOptionalString(task.terminalSummary) || normalizeOptionalString(task.progressSummary) || normalizeOptionalString(task.label) || task.task.trim(), 80);
		const line = [
			shortToken(task.taskId).padEnd(ID_PAD),
			task.runtime.padEnd(RUNTIME_PAD),
			formatTaskStatusCell(task.status, rich),
			task.deliveryStatus.padEnd(DELIVERY_PAD),
			shortToken(task.runId, RUN_PAD).padEnd(RUN_PAD),
			truncate(normalizeOptionalString(task.childSessionKey) || "n/a", 36).padEnd(36),
			summary
		].join(" ");
		lines.push(line.trimEnd());
	}
	return lines;
}
function formatTaskListSummary(tasks) {
	const summary = summarizeTaskRecords(tasks);
	return `${summary.byStatus.queued} queued · ${summary.byStatus.running} running · ${summary.failures} issues`;
}
function formatAgeMs(ageMs) {
	if (typeof ageMs !== "number" || ageMs < 1e3) return "fresh";
	const totalSeconds = Math.floor(ageMs / 1e3);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor(totalSeconds % 86400 / 3600);
	const minutes = Math.floor(totalSeconds % 3600 / 60);
	if (days > 0) return `${days}d${hours}h`;
	if (hours > 0) return `${hours}h${minutes}m`;
	if (minutes > 0) return `${minutes}m`;
	return `${totalSeconds}s`;
}
function compareSystemAuditFindings(left, right) {
	const severityRank = (severity) => severity === "error" ? 0 : 1;
	const severityDiff = severityRank(left.severity) - severityRank(right.severity);
	if (severityDiff !== 0) return severityDiff;
	const leftAge = left.ageMs ?? -1;
	const rightAge = right.ageMs ?? -1;
	if (leftAge !== rightAge) return rightAge - leftAge;
	return (left.task?.createdAt ?? left.flow?.createdAt ?? 0) - (right.task?.createdAt ?? right.flow?.createdAt ?? 0);
}
function formatAuditRows(findings, rich) {
	const header = [
		"Scope".padEnd(8),
		"Severity".padEnd(8),
		"Code".padEnd(22),
		"Item".padEnd(ID_PAD),
		"Status".padEnd(STATUS_PAD),
		"Age".padEnd(8),
		"Detail"
	].join(" ");
	const lines = [rich ? theme.heading(header) : header];
	for (const finding of findings) {
		const severity = finding.severity.padEnd(8);
		const status = formatTaskStatusCell(finding.status ?? "n/a", rich);
		const severityCell = !rich ? severity : finding.severity === "error" ? theme.error(severity) : theme.warn(severity);
		const scope = finding.kind === "task" ? "Task" : "TaskFlow";
		lines.push([
			scope.padEnd(8),
			severityCell,
			finding.code.padEnd(22),
			shortToken(finding.token).padEnd(ID_PAD),
			status,
			formatAgeMs(finding.ageMs).padEnd(8),
			truncate(finding.detail, 88)
		].join(" ").trimEnd());
	}
	return lines;
}
function toSystemAuditFindings(params) {
	const taskFindings = listTaskAuditFindings();
	const flowFindings = listTaskFlowAuditFindings();
	const allFindings = [...taskFindings.map((finding) => ({
		kind: "task",
		severity: finding.severity,
		code: finding.code,
		detail: finding.detail,
		ageMs: finding.ageMs,
		status: finding.task.status,
		token: finding.task.taskId,
		task: finding.task
	})), ...flowFindings.map((finding) => ({
		kind: "task_flow",
		severity: finding.severity,
		code: finding.code,
		detail: finding.detail,
		ageMs: finding.ageMs,
		status: finding.flow?.status ?? "n/a",
		token: finding.flow?.flowId,
		...finding.flow ? { flow: finding.flow } : {}
	}))];
	const filteredFindings = allFindings.filter((finding) => {
		if (params.severityFilter && finding.severity !== params.severityFilter) return false;
		if (params.codeFilter && finding.code !== params.codeFilter) return false;
		return true;
	}).toSorted(compareSystemAuditFindings);
	const sortedAllFindings = [...allFindings].toSorted(compareSystemAuditFindings);
	return {
		allFindings: sortedAllFindings,
		filteredFindings,
		taskFindings,
		flowFindings,
		summary: {
			total: sortedAllFindings.length,
			errors: sortedAllFindings.filter((finding) => finding.severity === "error").length,
			warnings: sortedAllFindings.filter((finding) => finding.severity !== "error").length,
			tasks: summarizeTaskAuditFindings(taskFindings),
			taskFlows: summarizeTaskFlowAuditFindings(flowFindings)
		}
	};
}
async function tasksListCommand(opts, runtime) {
	const runtimeFilter = opts.runtime?.trim();
	const statusFilter = opts.status?.trim();
	const tasks = reconcileInspectableTasks().filter((task) => {
		if (runtimeFilter && task.runtime !== runtimeFilter) return false;
		if (statusFilter && task.status !== statusFilter) return false;
		return true;
	});
	if (opts.json) {
		runtime.log(JSON.stringify({
			count: tasks.length,
			runtime: runtimeFilter ?? null,
			status: statusFilter ?? null,
			tasks
		}, null, 2));
		return;
	}
	runtime.log(info(`Background tasks: ${tasks.length}`));
	runtime.log(info(`Task pressure: ${formatTaskListSummary(tasks)}`));
	if (runtimeFilter) runtime.log(info(`Runtime filter: ${runtimeFilter}`));
	if (statusFilter) runtime.log(info(`Status filter: ${statusFilter}`));
	if (tasks.length === 0) {
		runtime.log("No background tasks found.");
		return;
	}
	const rich = isRich();
	for (const line of formatTaskRows(tasks, rich)) runtime.log(line);
}
async function tasksShowCommand(opts, runtime) {
	const task = reconcileTaskLookupToken(opts.lookup);
	if (!task) {
		runtime.error(`Task not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	if (opts.json) {
		runtime.log(JSON.stringify(task, null, 2));
		return;
	}
	const lines = [
		"Background task:",
		`taskId: ${task.taskId}`,
		`kind: ${task.runtime}`,
		`sourceId: ${task.sourceId ?? "n/a"}`,
		`status: ${task.status}`,
		`result: ${task.terminalOutcome ?? "n/a"}`,
		`delivery: ${task.deliveryStatus}`,
		`notify: ${task.notifyPolicy}`,
		`ownerKey: ${task.ownerKey}`,
		`childSessionKey: ${task.childSessionKey ?? "n/a"}`,
		`parentTaskId: ${task.parentTaskId ?? "n/a"}`,
		`agentId: ${task.agentId ?? "n/a"}`,
		`runId: ${task.runId ?? "n/a"}`,
		`label: ${task.label ?? "n/a"}`,
		`task: ${task.task}`,
		`createdAt: ${new Date(task.createdAt).toISOString()}`,
		`startedAt: ${task.startedAt ? new Date(task.startedAt).toISOString() : "n/a"}`,
		`endedAt: ${task.endedAt ? new Date(task.endedAt).toISOString() : "n/a"}`,
		`lastEventAt: ${task.lastEventAt ? new Date(task.lastEventAt).toISOString() : "n/a"}`,
		`cleanupAfter: ${task.cleanupAfter ? new Date(task.cleanupAfter).toISOString() : "n/a"}`,
		...task.error ? [`error: ${task.error}`] : [],
		...task.progressSummary ? [`progressSummary: ${task.progressSummary}`] : [],
		...task.terminalSummary ? [`terminalSummary: ${task.terminalSummary}`] : []
	];
	for (const line of lines) runtime.log(line);
}
async function tasksNotifyCommand(opts, runtime) {
	const task = reconcileTaskLookupToken(opts.lookup);
	if (!task) {
		runtime.error(`Task not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const updated = updateTaskNotifyPolicyById({
		taskId: task.taskId,
		notifyPolicy: opts.notify
	});
	if (!updated) {
		runtime.error(`Task not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	runtime.log(`Updated ${updated.taskId} notify policy to ${updated.notifyPolicy}.`);
}
async function tasksCancelCommand(opts, runtime) {
	const task = reconcileTaskLookupToken(opts.lookup);
	if (!task) {
		runtime.error(`Task not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const result = await cancelTaskById({
		cfg: loadConfig(),
		taskId: task.taskId
	});
	if (!result.found) {
		runtime.error(result.reason ?? `Task not found: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	if (!result.cancelled) {
		runtime.error(result.reason ?? `Could not cancel task: ${opts.lookup}`);
		runtime.exit(1);
		return;
	}
	const updated = getTaskById(task.taskId);
	runtime.log(`Cancelled ${updated?.taskId ?? task.taskId} (${updated?.runtime ?? task.runtime})${updated?.runId ? ` run ${updated.runId}` : ""}.`);
}
async function tasksAuditCommand(opts, runtime) {
	const severityFilter = opts.severity?.trim();
	const codeFilter = opts.code?.trim();
	const { allFindings, filteredFindings, taskFindings, summary } = toSystemAuditFindings({
		severityFilter,
		codeFilter
	});
	const limit = typeof opts.limit === "number" && opts.limit > 0 ? opts.limit : void 0;
	const displayed = limit ? filteredFindings.slice(0, limit) : filteredFindings;
	if (opts.json) {
		const legacySummary = summarizeTaskAuditFindings(taskFindings);
		runtime.log(JSON.stringify({
			count: allFindings.length,
			filteredCount: filteredFindings.length,
			displayed: displayed.length,
			filters: {
				severity: severityFilter ?? null,
				code: codeFilter ?? null,
				limit: limit ?? null
			},
			summary: {
				...legacySummary,
				taskFlows: summary.taskFlows,
				combined: {
					total: summary.total,
					errors: summary.errors,
					warnings: summary.warnings
				}
			},
			findings: displayed
		}, null, 2));
		return;
	}
	runtime.log(info(`Tasks audit: ${summary.total} findings · ${summary.errors} errors · ${summary.warnings} warnings`));
	if (severityFilter || codeFilter) runtime.log(info(`Showing ${filteredFindings.length} matching findings.`));
	if (severityFilter) runtime.log(info(`Severity filter: ${severityFilter}`));
	if (codeFilter) runtime.log(info(`Code filter: ${codeFilter}`));
	if (limit) runtime.log(info(`Limit: ${limit}`));
	runtime.log(info(`Task findings: ${summary.tasks.total} · TaskFlow findings: ${summary.taskFlows.total}`));
	if (displayed.length === 0) {
		runtime.log("No tasks audit findings.");
		return;
	}
	const rich = isRich();
	for (const line of formatAuditRows(displayed, rich)) runtime.log(line);
}
async function tasksMaintenanceCommand(opts, runtime) {
	const auditBefore = getInspectableTaskAuditSummary();
	const flowAuditBefore = getInspectableTaskFlowAuditSummary();
	const taskMaintenance = opts.apply ? await runTaskRegistryMaintenance() : previewTaskRegistryMaintenance();
	const flowMaintenance = opts.apply ? await runTaskFlowRegistryMaintenance() : previewTaskFlowRegistryMaintenance();
	const summary = getInspectableTaskRegistrySummary();
	const auditAfter = opts.apply ? getInspectableTaskAuditSummary() : auditBefore;
	const flowAuditAfter = opts.apply ? getInspectableTaskFlowAuditSummary() : flowAuditBefore;
	if (opts.json) {
		runtime.log(JSON.stringify({
			mode: opts.apply ? "apply" : "preview",
			maintenance: {
				tasks: taskMaintenance,
				taskFlows: flowMaintenance
			},
			tasks: summary,
			auditBefore: {
				...auditBefore,
				taskFlows: flowAuditBefore
			},
			auditAfter: {
				...auditAfter,
				taskFlows: flowAuditAfter
			}
		}, null, 2));
		return;
	}
	runtime.log(info(`Tasks maintenance (${opts.apply ? "applied" : "preview"}): tasks ${taskMaintenance.reconciled} reconcile · ${taskMaintenance.cleanupStamped} cleanup stamp · ${taskMaintenance.pruned} prune; task-flows ${flowMaintenance.reconciled} reconcile · ${flowMaintenance.pruned} prune`));
	runtime.log(info(`${opts.apply ? "Tasks health after apply" : "Tasks health"}: ${summary.byStatus.queued} queued · ${summary.byStatus.running} running · ${auditAfter.errors + flowAuditAfter.errors} audit errors · ${auditAfter.warnings + flowAuditAfter.warnings} audit warnings`));
	if (opts.apply) runtime.log(info(`Tasks health before apply: ${auditBefore.errors + flowAuditBefore.errors} audit errors · ${auditBefore.warnings + flowAuditBefore.warnings} audit warnings`));
	if (!opts.apply) runtime.log("Dry run only. Re-run with `openclaw tasks maintenance --apply` to write changes.");
}
//#endregion
//#region src/cli/program/register.status-health-sessions.ts
function resolveVerbose(opts) {
	return Boolean(opts.verbose || opts.debug);
}
function parseTimeoutMs(timeout) {
	const parsed = parsePositiveIntOrUndefined(timeout);
	if (timeout !== void 0 && parsed === void 0) {
		defaultRuntime.error("--timeout must be a positive integer (milliseconds)");
		defaultRuntime.exit(1);
		return null;
	}
	return parsed;
}
async function runWithVerboseAndTimeout(opts, action) {
	const verbose = resolveVerbose(opts);
	setVerbose(verbose);
	const timeoutMs = parseTimeoutMs(opts.timeout);
	if (timeoutMs === null) return;
	await runCommandWithRuntime(defaultRuntime, async () => {
		await action({
			verbose,
			timeoutMs
		});
	});
}
function registerStatusHealthSessionsCommands(program) {
	program.command("status").description("Show channel health and recent session recipients").option("--json", "Output JSON instead of text", false).option("--all", "Full diagnosis (read-only, pasteable)", false).option("--usage", "Show model provider usage/quota snapshots", false).option("--deep", "Probe channels (WhatsApp Web + Telegram + Discord + Slack + Signal)", false).option("--timeout <ms>", "Probe timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw status", "Show channel health + session summary."],
		["openclaw status --all", "Full diagnosis (read-only)."],
		["openclaw status --json", "Machine-readable output."],
		["openclaw status --usage", "Show model provider usage/quota snapshots."],
		["openclaw status --deep", "Run channel probes (WA + Telegram + Discord + Slack + Signal)."],
		["openclaw status --deep --timeout 5000", "Tighten probe timeout."]
	])}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/status", "docs.openclaw.ai/cli/status")}\n`).action(async (opts) => {
		await runWithVerboseAndTimeout(opts, async ({ verbose, timeoutMs }) => {
			await statusCommand({
				json: Boolean(opts.json),
				all: Boolean(opts.all),
				deep: Boolean(opts.deep),
				usage: Boolean(opts.usage),
				timeoutMs,
				verbose
			}, defaultRuntime);
		});
	});
	program.command("health").description("Fetch health from the running gateway").option("--json", "Output JSON instead of text", false).option("--timeout <ms>", "Connection timeout in milliseconds", "10000").option("--verbose", "Verbose logging", false).option("--debug", "Alias for --verbose", false).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/health", "docs.openclaw.ai/cli/health")}\n`).action(async (opts) => {
		await runWithVerboseAndTimeout(opts, async ({ verbose, timeoutMs }) => {
			await healthCommand({
				json: Boolean(opts.json),
				timeoutMs,
				verbose
			}, defaultRuntime);
		});
	});
	const sessionsCmd = program.command("sessions").description("List stored conversation sessions").option("--json", "Output as JSON", false).option("--verbose", "Verbose logging", false).option("--store <path>", "Path to session store (default: resolved from config)").option("--agent <id>", "Agent id to inspect (default: configured default agent)").option("--all-agents", "Aggregate sessions across all configured agents", false).option("--active <minutes>", "Only show sessions updated within the past N minutes").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw sessions", "List all sessions."],
		["openclaw sessions --agent work", "List sessions for one agent."],
		["openclaw sessions --all-agents", "Aggregate sessions across agents."],
		["openclaw sessions --active 120", "Only last 2 hours."],
		["openclaw sessions --json", "Machine-readable output."],
		["openclaw sessions --store ./tmp/sessions.json", "Use a specific session store."]
	])}\n\n${theme.muted("Shows token usage per session when the agent reports it; set agents.defaults.contextTokens to cap the window and show %.")}`).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/sessions", "docs.openclaw.ai/cli/sessions")}\n`).action(async (opts) => {
		setVerbose(Boolean(opts.verbose));
		await sessionsCommand({
			json: Boolean(opts.json),
			store: opts.store,
			agent: opts.agent,
			allAgents: Boolean(opts.allAgents),
			active: opts.active
		}, defaultRuntime);
	});
	sessionsCmd.enablePositionalOptions();
	sessionsCmd.command("cleanup").description("Run session-store maintenance now").option("--store <path>", "Path to session store (default: resolved from config)").option("--agent <id>", "Agent id to maintain (default: configured default agent)").option("--all-agents", "Run maintenance across all configured agents", false).option("--dry-run", "Preview maintenance actions without writing", false).option("--enforce", "Apply maintenance even when configured mode is warn", false).option("--fix-missing", "Remove store entries whose transcript files are missing (bypasses age/count retention)", false).option("--active-key <key>", "Protect this session key from budget-eviction").option("--json", "Output JSON", false).addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw sessions cleanup --dry-run", "Preview stale/cap cleanup."],
		["openclaw sessions cleanup --dry-run --fix-missing", "Also preview pruning entries with missing transcript files."],
		["openclaw sessions cleanup --enforce", "Apply maintenance now."],
		["openclaw sessions cleanup --agent work --dry-run", "Preview one agent store."],
		["openclaw sessions cleanup --all-agents --dry-run", "Preview all agent stores."],
		["openclaw sessions cleanup --enforce --store ./tmp/sessions.json", "Use a specific store."]
	])}`).action(async (opts, command) => {
		const parentOpts = command.parent?.opts();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await sessionsCleanupCommand({
				store: opts.store ?? parentOpts?.store,
				agent: opts.agent ?? parentOpts?.agent,
				allAgents: Boolean(opts.allAgents || parentOpts?.allAgents),
				dryRun: Boolean(opts.dryRun),
				enforce: Boolean(opts.enforce),
				fixMissing: Boolean(opts.fixMissing),
				activeKey: opts.activeKey,
				json: Boolean(opts.json || parentOpts?.json)
			}, defaultRuntime);
		});
	});
	const tasksCmd = program.command("tasks").description("Inspect durable background tasks and TaskFlow state").option("--json", "Output as JSON", false).option("--runtime <name>", "Filter by kind (subagent, acp, cron, cli)").option("--status <name>", "Filter by status (queued, running, succeeded, failed, timed_out, cancelled, lost)").action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksListCommand({
				json: Boolean(opts.json),
				runtime: opts.runtime,
				status: opts.status
			}, defaultRuntime);
		});
	});
	tasksCmd.enablePositionalOptions();
	tasksCmd.command("list").description("List tracked background tasks").option("--json", "Output as JSON", false).option("--runtime <name>", "Filter by kind (subagent, acp, cron, cli)").option("--status <name>", "Filter by status (queued, running, succeeded, failed, timed_out, cancelled, lost)").action(async (opts, command) => {
		const parentOpts = command.parent?.opts();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksListCommand({
				json: Boolean(opts.json || parentOpts?.json),
				runtime: opts.runtime ?? parentOpts?.runtime,
				status: opts.status ?? parentOpts?.status
			}, defaultRuntime);
		});
	});
	tasksCmd.command("audit").description("Show stale or broken background tasks and TaskFlows").option("--json", "Output as JSON", false).option("--severity <level>", "Filter by severity (warn, error)").option("--code <name>", "Filter by finding code (stale_queued, stale_running, lost, delivery_failed, missing_cleanup, inconsistent_timestamps, restore_failed, stale_waiting, stale_blocked, cancel_stuck, missing_linked_tasks, blocked_task_missing)").option("--limit <n>", "Limit displayed findings").action(async (opts, command) => {
		const parentOpts = command.parent?.opts();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksAuditCommand({
				json: Boolean(opts.json || parentOpts?.json),
				severity: opts.severity,
				code: opts.code,
				limit: parsePositiveIntOrUndefined(opts.limit)
			}, defaultRuntime);
		});
	});
	tasksCmd.command("maintenance").description("Preview or apply tasks and TaskFlow maintenance").option("--json", "Output as JSON", false).option("--apply", "Apply reconciliation, cleanup stamping, and pruning", false).action(async (opts, command) => {
		const parentOpts = command.parent?.opts();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksMaintenanceCommand({
				json: Boolean(opts.json || parentOpts?.json),
				apply: Boolean(opts.apply)
			}, defaultRuntime);
		});
	});
	tasksCmd.command("show").description("Show one background task by task id, run id, or session key").argument("<lookup>", "Task id, run id, or session key").option("--json", "Output as JSON", false).action(async (lookup, opts, command) => {
		const parentOpts = command.parent?.opts();
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksShowCommand({
				lookup,
				json: Boolean(opts.json || parentOpts?.json)
			}, defaultRuntime);
		});
	});
	tasksCmd.command("notify").description("Set task notify policy").argument("<lookup>", "Task id, run id, or session key").argument("<notify>", "Notify policy (done_only, state_changes, silent)").action(async (lookup, notify) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksNotifyCommand({
				lookup,
				notify
			}, defaultRuntime);
		});
	});
	tasksCmd.command("cancel").description("Cancel a running background task").argument("<lookup>", "Task id, run id, or session key").action(async (lookup) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await tasksCancelCommand({ lookup }, defaultRuntime);
		});
	});
	const tasksFlowCmd = tasksCmd.command("flow").description("Inspect durable TaskFlow state under tasks");
	tasksFlowCmd.command("list").description("List tracked TaskFlows").option("--json", "Output as JSON", false).option("--status <name>", "Filter by status (queued, running, waiting, blocked, succeeded, failed, cancelled, lost)").action(async (opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await flowsListCommand({
				json: Boolean(opts.json),
				status: opts.status
			}, defaultRuntime);
		});
	});
	tasksFlowCmd.command("show").description("Show one TaskFlow by flow id or owner key").argument("<lookup>", "Flow id or owner key").option("--json", "Output as JSON", false).action(async (lookup, opts) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await flowsShowCommand({
				lookup,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
	tasksFlowCmd.command("cancel").description("Cancel a running TaskFlow").argument("<lookup>", "Flow id or owner key").action(async (lookup) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			await flowsCancelCommand({ lookup }, defaultRuntime);
		});
	});
}
//#endregion
export { registerStatusHealthSessionsCommands };
