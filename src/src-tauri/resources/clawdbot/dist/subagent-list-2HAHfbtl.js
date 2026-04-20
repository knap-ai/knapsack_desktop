import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { m as subagentRuns, s as countPendingDescendantRunsFromRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-Dyk_jaON.js";
import { n as getSubagentSessionStartedAt, t as getSubagentSessionRuntimeMs } from "./subagent-session-metrics-Bd5dqOSd.js";
import "./subagent-registry-read-DayKoqcW.js";
import { c as sortSubagentRuns, n as resolveTotalTokens, o as resolveSubagentLabel, r as truncateLine, t as formatTokenUsageDisplay } from "./subagents-format-BNFotQVC.js";
import { t as formatDurationCompact } from "./format-duration-D2oH-5yd.js";
import { n as resolveModelDisplayRef, t as resolveModelDisplayName } from "./model-selection-display-CW-ca7Wh.js";
//#region src/agents/subagent-list.ts
function resolveStorePathForKey(cfg, key, parsed) {
	return resolveStorePath(cfg.session?.store, { agentId: parsed?.agentId });
}
function resolveSessionEntryForKey(params) {
	const parsed = parseAgentSessionKey(params.key);
	const storePath = resolveStorePathForKey(params.cfg, params.key, parsed);
	let store = params.cache.get(storePath);
	if (!store) {
		store = loadSessionStore(storePath);
		params.cache.set(storePath, store);
	}
	return {
		storePath,
		entry: store[params.key]
	};
}
function buildLatestSubagentRunIndex(runs) {
	const latestByChildSessionKey = /* @__PURE__ */ new Map();
	for (const entry of runs.values()) {
		const childSessionKey = entry.childSessionKey?.trim();
		if (!childSessionKey) continue;
		const existing = latestByChildSessionKey.get(childSessionKey);
		if (!existing || entry.createdAt > existing.createdAt) latestByChildSessionKey.set(childSessionKey, entry);
	}
	const childSessionsByController = /* @__PURE__ */ new Map();
	for (const [childSessionKey, entry] of latestByChildSessionKey.entries()) {
		const controllerSessionKey = entry.controllerSessionKey?.trim() || entry.requesterSessionKey?.trim();
		if (!controllerSessionKey) continue;
		const existing = childSessionsByController.get(controllerSessionKey);
		if (existing) {
			existing.push(childSessionKey);
			continue;
		}
		childSessionsByController.set(controllerSessionKey, [childSessionKey]);
	}
	for (const childSessions of childSessionsByController.values()) childSessions.sort();
	return {
		latestByChildSessionKey,
		childSessionsByController
	};
}
function createPendingDescendantCounter(runsSnapshot) {
	const pendingDescendantCache = /* @__PURE__ */ new Map();
	return (sessionKey) => {
		if (pendingDescendantCache.has(sessionKey)) return pendingDescendantCache.get(sessionKey) ?? 0;
		const snapshot = runsSnapshot ?? getSubagentRunsSnapshotForRead(subagentRuns);
		const pending = Math.max(0, countPendingDescendantRunsFromRuns(snapshot, sessionKey));
		pendingDescendantCache.set(sessionKey, pending);
		return pending;
	};
}
function isActiveSubagentRun(entry, pendingDescendantCount) {
	return !entry.endedAt || pendingDescendantCount(entry.childSessionKey) > 0;
}
function resolveRunStatus(entry, options) {
	const pendingDescendants = Math.max(0, options?.pendingDescendants ?? 0);
	if (pendingDescendants > 0) return `active (waiting on ${pendingDescendants} ${pendingDescendants === 1 ? "child" : "children"})`;
	if (!entry.endedAt) return "running";
	const status = entry.outcome?.status ?? "done";
	if (status === "ok") return "done";
	if (status === "error") return "failed";
	return status;
}
function resolveModelRef(entry, fallbackModel) {
	return resolveModelDisplayRef({
		runtimeProvider: entry?.modelProvider,
		runtimeModel: entry?.model,
		overrideProvider: entry?.providerOverride,
		overrideModel: entry?.modelOverride,
		fallbackModel
	});
}
function resolveModelDisplay(entry, fallbackModel) {
	return resolveModelDisplayName({
		runtimeProvider: entry?.modelProvider,
		runtimeModel: entry?.model,
		overrideProvider: entry?.providerOverride,
		overrideModel: entry?.modelOverride,
		fallbackModel
	});
}
function buildListText(params) {
	const lines = [];
	lines.push("active subagents:");
	if (params.active.length === 0) lines.push("(none)");
	else lines.push(...params.active.map((entry) => entry.line));
	lines.push("");
	lines.push(`recent (last ${params.recentMinutes}m):`);
	if (params.recent.length === 0) lines.push("(none)");
	else lines.push(...params.recent.map((entry) => entry.line));
	return lines.join("\n");
}
function buildSubagentList(params) {
	const now = Date.now();
	const recentCutoff = now - params.recentMinutes * 6e4;
	const dedupedRuns = [];
	const seenChildSessionKeys = /* @__PURE__ */ new Set();
	for (const entry of sortSubagentRuns(params.runs)) {
		if (seenChildSessionKeys.has(entry.childSessionKey)) continue;
		seenChildSessionKeys.add(entry.childSessionKey);
		dedupedRuns.push(entry);
	}
	const cache = /* @__PURE__ */ new Map();
	const snapshot = getSubagentRunsSnapshotForRead(subagentRuns);
	const { childSessionsByController } = buildLatestSubagentRunIndex(snapshot);
	const pendingDescendantCount = createPendingDescendantCounter(snapshot);
	let index = 1;
	const buildListEntry = (entry, runtimeMs) => {
		const sessionEntry = resolveSessionEntryForKey({
			cfg: params.cfg,
			key: entry.childSessionKey,
			cache
		}).entry;
		const totalTokens = resolveTotalTokens(sessionEntry);
		const usageText = formatTokenUsageDisplay(sessionEntry);
		const pendingDescendants = pendingDescendantCount(entry.childSessionKey);
		const status = resolveRunStatus(entry, { pendingDescendants });
		const childSessions = childSessionsByController.get(entry.childSessionKey) ?? [];
		const runtime = formatDurationCompact(runtimeMs) ?? "n/a";
		const label = truncateLine(resolveSubagentLabel(entry), 48);
		const task = truncateLine(entry.task.trim(), params.taskMaxChars ?? 72);
		const line = `${index}. ${label} (${resolveModelDisplay(sessionEntry, entry.model)}, ${runtime}${usageText ? `, ${usageText}` : ""}) ${status}${normalizeLowercaseStringOrEmpty(task) !== normalizeLowercaseStringOrEmpty(label) ? ` - ${task}` : ""}`;
		const view = {
			index,
			line,
			runId: entry.runId,
			sessionKey: entry.childSessionKey,
			label,
			task,
			status,
			pendingDescendants,
			runtime,
			runtimeMs,
			...childSessions.length > 0 ? { childSessions } : {},
			model: resolveModelRef(sessionEntry, entry.model),
			totalTokens,
			startedAt: getSubagentSessionStartedAt(entry),
			...entry.endedAt ? { endedAt: entry.endedAt } : {}
		};
		index += 1;
		return view;
	};
	const active = dedupedRuns.filter((entry) => isActiveSubagentRun(entry, pendingDescendantCount)).map((entry) => buildListEntry(entry, getSubagentSessionRuntimeMs(entry, now) ?? 0));
	const recent = dedupedRuns.filter((entry) => !isActiveSubagentRun(entry, pendingDescendantCount) && !!entry.endedAt && (entry.endedAt ?? 0) >= recentCutoff).map((entry) => buildListEntry(entry, getSubagentSessionRuntimeMs(entry, entry.endedAt ?? now) ?? 0));
	return {
		total: dedupedRuns.length,
		active,
		recent,
		text: buildListText({
			active,
			recent,
			recentMinutes: params.recentMinutes
		})
	};
}
//#endregion
export { resolveSessionEntryForKey as a, isActiveSubagentRun as i, buildSubagentList as n, createPendingDescendantCounter as r, buildLatestSubagentRunIndex as t };
