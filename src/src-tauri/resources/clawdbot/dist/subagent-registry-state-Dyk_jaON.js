import { d as readStringValue } from "./string-coerce-BUSzWgUA.js";
import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { n as saveJsonFile, t as loadJsonFile } from "./json-file-DAv7R9GL.js";
import { i as normalizeDeliveryContext } from "./delivery-context.shared-EClQPjt-.js";
import "./delivery-context-CToOfUqJ.js";
import path from "node:path";
import os from "node:os";
//#region src/agents/subagent-registry-memory.ts
const subagentRuns = /* @__PURE__ */ new Map();
//#endregion
//#region src/agents/subagent-registry-queries.ts
function resolveControllerSessionKey(entry) {
	return entry.controllerSessionKey?.trim() || entry.requesterSessionKey;
}
function findRunIdsByChildSessionKeyFromRuns(runs, childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return [];
	const runIds = [];
	for (const [runId, entry] of runs.entries()) if (entry.childSessionKey === key) runIds.push(runId);
	return runIds;
}
function listRunsForRequesterFromRuns(runs, requesterSessionKey, options) {
	const key = requesterSessionKey.trim();
	if (!key) return [];
	const requesterRunId = options?.requesterRunId?.trim();
	const requesterRun = requesterRunId ? runs.get(requesterRunId) : void 0;
	const requesterRunMatchesScope = requesterRun && requesterRun.childSessionKey === key ? requesterRun : void 0;
	const lowerBound = requesterRunMatchesScope?.startedAt ?? requesterRunMatchesScope?.createdAt;
	const upperBound = requesterRunMatchesScope?.endedAt;
	return [...runs.values()].filter((entry) => {
		if (entry.requesterSessionKey !== key) return false;
		if (typeof lowerBound === "number" && entry.createdAt < lowerBound) return false;
		if (typeof upperBound === "number" && entry.createdAt > upperBound) return false;
		return true;
	});
}
function listRunsForControllerFromRuns(runs, controllerSessionKey) {
	const key = controllerSessionKey.trim();
	if (!key) return [];
	return [...runs.values()].filter((entry) => resolveControllerSessionKey(entry) === key);
}
function findLatestRunForChildSession(runs, childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return;
	let latest;
	for (const entry of runs.values()) {
		if (entry.childSessionKey !== key) continue;
		if (!latest || entry.createdAt > latest.createdAt) latest = entry;
	}
	return latest;
}
function resolveRequesterForChildSessionFromRuns(runs, childSessionKey) {
	const latest = findLatestRunForChildSession(runs, childSessionKey);
	if (!latest) return null;
	return {
		requesterSessionKey: latest.requesterSessionKey,
		requesterOrigin: latest.requesterOrigin
	};
}
function shouldIgnorePostCompletionAnnounceForSessionFromRuns(runs, childSessionKey) {
	const latest = findLatestRunForChildSession(runs, childSessionKey);
	return Boolean(latest && latest.spawnMode !== "session" && typeof latest.endedAt === "number" && typeof latest.cleanupCompletedAt === "number" && latest.cleanupCompletedAt >= latest.endedAt);
}
function countActiveRunsForSessionFromRuns(runs, controllerSessionKey) {
	const key = controllerSessionKey.trim();
	if (!key) return 0;
	const pendingDescendantCache = /* @__PURE__ */ new Map();
	const pendingDescendantCount = (sessionKey) => {
		if (pendingDescendantCache.has(sessionKey)) return pendingDescendantCache.get(sessionKey) ?? 0;
		const pending = countPendingDescendantRunsInternal(runs, sessionKey);
		pendingDescendantCache.set(sessionKey, pending);
		return pending;
	};
	const latestByChildSessionKey = /* @__PURE__ */ new Map();
	for (const entry of runs.values()) {
		if (resolveControllerSessionKey(entry) !== key) continue;
		const existing = latestByChildSessionKey.get(entry.childSessionKey);
		if (!existing || entry.createdAt > existing.createdAt) latestByChildSessionKey.set(entry.childSessionKey, entry);
	}
	let count = 0;
	for (const entry of latestByChildSessionKey.values()) {
		if (typeof entry.endedAt !== "number") {
			count += 1;
			continue;
		}
		if (pendingDescendantCount(entry.childSessionKey) > 0) count += 1;
	}
	return count;
}
function forEachDescendantRun(runs, rootSessionKey, visitor) {
	const root = rootSessionKey.trim();
	if (!root) return false;
	const pending = [root];
	const visited = new Set([root]);
	for (let index = 0; index < pending.length; index += 1) {
		const requester = pending[index];
		if (!requester) continue;
		const latestByChildSessionKey = /* @__PURE__ */ new Map();
		for (const [runId, entry] of runs.entries()) {
			if (entry.requesterSessionKey !== requester) continue;
			const childKey = entry.childSessionKey.trim();
			const existing = latestByChildSessionKey.get(childKey);
			if (!existing || entry.createdAt > existing[1].createdAt) latestByChildSessionKey.set(childKey, [runId, entry]);
		}
		for (const [runId, entry] of latestByChildSessionKey.values()) {
			const latestForChildSession = findLatestRunForChildSession(runs, entry.childSessionKey);
			if (!latestForChildSession || latestForChildSession.runId !== runId || latestForChildSession.requesterSessionKey !== requester) continue;
			visitor(runId, entry);
			const childKey = entry.childSessionKey.trim();
			if (!childKey || visited.has(childKey)) continue;
			visited.add(childKey);
			pending.push(childKey);
		}
	}
	return true;
}
function countActiveDescendantRunsFromRuns(runs, rootSessionKey) {
	let count = 0;
	if (!forEachDescendantRun(runs, rootSessionKey, (_runId, entry) => {
		if (typeof entry.endedAt !== "number") count += 1;
	})) return 0;
	return count;
}
function countPendingDescendantRunsInternal(runs, rootSessionKey, excludeRunId) {
	const excludedRunId = excludeRunId?.trim();
	let count = 0;
	if (!forEachDescendantRun(runs, rootSessionKey, (runId, entry) => {
		const runEnded = typeof entry.endedAt === "number";
		const cleanupCompleted = typeof entry.cleanupCompletedAt === "number";
		if ((!runEnded || !cleanupCompleted) && runId !== excludedRunId) count += 1;
	})) return 0;
	return count;
}
function countPendingDescendantRunsFromRuns(runs, rootSessionKey) {
	return countPendingDescendantRunsInternal(runs, rootSessionKey);
}
function countPendingDescendantRunsExcludingRunFromRuns(runs, rootSessionKey, excludeRunId) {
	return countPendingDescendantRunsInternal(runs, rootSessionKey, excludeRunId);
}
function listDescendantRunsForRequesterFromRuns(runs, rootSessionKey) {
	const descendants = [];
	if (!forEachDescendantRun(runs, rootSessionKey, (_runId, entry) => {
		descendants.push(entry);
	})) return [];
	return descendants;
}
//#endregion
//#region src/agents/subagent-registry.store.ts
const REGISTRY_VERSION = 2;
function resolveSubagentStateDir(env = process.env) {
	if (env.OPENCLAW_STATE_DIR?.trim()) return resolveStateDir(env);
	if (env.VITEST || env.NODE_ENV === "test") return path.join(os.tmpdir(), "openclaw-test-state", String(process.pid));
	return resolveStateDir(env);
}
function resolveSubagentRegistryPath() {
	return path.join(resolveSubagentStateDir(process.env), "subagents", "runs.json");
}
function loadSubagentRegistryFromDisk() {
	const raw = loadJsonFile(resolveSubagentRegistryPath());
	if (!raw || typeof raw !== "object") return /* @__PURE__ */ new Map();
	const record = raw;
	if (record.version !== 1 && record.version !== 2) return /* @__PURE__ */ new Map();
	const runsRaw = record.runs;
	if (!runsRaw || typeof runsRaw !== "object") return /* @__PURE__ */ new Map();
	const out = /* @__PURE__ */ new Map();
	const isLegacy = record.version === 1;
	let migrated = false;
	for (const [runId, entry] of Object.entries(runsRaw)) {
		if (!entry || typeof entry !== "object") continue;
		const typed = entry;
		if (!typed.runId || typeof typed.runId !== "string") continue;
		const legacyCompletedAt = isLegacy && typeof typed.announceCompletedAt === "number" ? typed.announceCompletedAt : void 0;
		const cleanupCompletedAt = typeof typed.cleanupCompletedAt === "number" ? typed.cleanupCompletedAt : legacyCompletedAt;
		const cleanupHandled = typeof typed.cleanupHandled === "boolean" ? typed.cleanupHandled : isLegacy ? Boolean(typed.announceHandled ?? cleanupCompletedAt) : void 0;
		const requesterOrigin = normalizeDeliveryContext(typed.requesterOrigin ?? {
			channel: readStringValue(typed.requesterChannel),
			accountId: readStringValue(typed.requesterAccountId)
		});
		const childSessionKey = readStringValue(typed.childSessionKey)?.trim() ?? "";
		const requesterSessionKey = readStringValue(typed.requesterSessionKey)?.trim() ?? "";
		const controllerSessionKey = readStringValue(typed.controllerSessionKey)?.trim() || requesterSessionKey;
		if (!childSessionKey || !requesterSessionKey) continue;
		const { announceCompletedAt: _announceCompletedAt, announceHandled: _announceHandled, requesterChannel: _channel, requesterAccountId: _accountId, ...rest } = typed;
		out.set(runId, {
			...rest,
			childSessionKey,
			requesterSessionKey,
			controllerSessionKey,
			requesterOrigin,
			cleanupCompletedAt,
			cleanupHandled,
			spawnMode: typed.spawnMode === "session" ? "session" : "run"
		});
		if (isLegacy) migrated = true;
	}
	if (migrated) try {
		saveSubagentRegistryToDisk(out);
	} catch {}
	return out;
}
function saveSubagentRegistryToDisk(runs) {
	const pathname = resolveSubagentRegistryPath();
	const serialized = {};
	for (const [runId, entry] of runs.entries()) serialized[runId] = entry;
	saveJsonFile(pathname, {
		version: REGISTRY_VERSION,
		runs: serialized
	});
}
//#endregion
//#region src/agents/subagent-registry-state.ts
function persistSubagentRunsToDisk(runs) {
	try {
		saveSubagentRegistryToDisk(runs);
	} catch {}
}
function restoreSubagentRunsFromDisk(params) {
	const restored = loadSubagentRegistryFromDisk();
	if (restored.size === 0) return 0;
	let added = 0;
	for (const [runId, entry] of restored.entries()) {
		if (!runId || !entry) continue;
		if (params.mergeOnly && params.runs.has(runId)) continue;
		params.runs.set(runId, entry);
		added += 1;
	}
	return added;
}
function getSubagentRunsSnapshotForRead(inMemoryRuns) {
	const merged = /* @__PURE__ */ new Map();
	if (process.env.OPENCLAW_TEST_READ_SUBAGENT_RUNS_FROM_DISK === "1" || !(process.env.VITEST || false)) try {
		for (const [runId, entry] of loadSubagentRegistryFromDisk().entries()) merged.set(runId, entry);
	} catch {}
	for (const [runId, entry] of inMemoryRuns.entries()) merged.set(runId, entry);
	return merged;
}
//#endregion
export { countActiveRunsForSessionFromRuns as a, findRunIdsByChildSessionKeyFromRuns as c, listRunsForRequesterFromRuns as d, resolveRequesterForChildSessionFromRuns as f, countActiveDescendantRunsFromRuns as i, listDescendantRunsForRequesterFromRuns as l, subagentRuns as m, persistSubagentRunsToDisk as n, countPendingDescendantRunsExcludingRunFromRuns as o, shouldIgnorePostCompletionAnnounceForSessionFromRuns as p, restoreSubagentRunsFromDisk as r, countPendingDescendantRunsFromRuns as s, getSubagentRunsSnapshotForRead as t, listRunsForControllerFromRuns as u };
