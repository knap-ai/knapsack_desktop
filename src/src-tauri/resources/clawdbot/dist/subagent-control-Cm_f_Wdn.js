import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { r as logVerbose } from "./globals-De6QTwLG.js";
import { b as isSubagentSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import "./message-channel-CBqCPFa_.js";
import { r as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-core-BIZsQ6dr.js";
import { c as updateSessionStore } from "./store-DFXcceZJ.js";
import "./sessions-vP2E4vs-.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { m as subagentRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-Dyk_jaON.js";
import { a as listSubagentRunsForController, n as getLatestSubagentRunByChildSessionKey } from "./subagent-registry-read-DayKoqcW.js";
import { r as callGateway } from "./call-BA3do6C0.js";
import { l as resolveInternalSessionKey, u as resolveMainSessionAlias } from "./sessions-helpers-CBIn5ORF.js";
import { t as resolveStoredSubagentCapabilities } from "./subagent-capabilities-C1AtAm9u.js";
import { f as replaceSubagentRunAfterSteer, i as countPendingDescendantRuns, l as markSubagentRunForSteerRestart, t as clearSubagentRunSteerRestart, u as markSubagentRunTerminated } from "./subagent-registry-BrNWizSY.js";
import { r as clearSessionQueues } from "./queue-bNmQjdDV.js";
import { t as abortEmbeddedPiRun } from "./runs-D-CeEXwD.js";
import { n as AGENT_LANE_SUBAGENT } from "./lanes-CJ0uhThr.js";
import { i as waitForAgentRunAndReadUpdatedAssistantReply, n as readLatestAssistantReplySnapshot } from "./run-wait-DHbbCT29.js";
import { c as sortSubagentRuns, o as resolveSubagentLabel, s as resolveSubagentTargetFromRuns } from "./subagents-format-BNFotQVC.js";
import { a as resolveSessionEntryForKey, t as buildLatestSubagentRunIndex } from "./subagent-list-2HAHfbtl.js";
import crypto from "node:crypto";
const MAX_RECENT_MINUTES = 1440;
const MAX_STEER_MESSAGE_CHARS = 4e3;
const STEER_ABORT_SETTLE_TIMEOUT_MS = 5e3;
const SUBAGENT_REPLY_HISTORY_LIMIT = 50;
const steerRateLimit = /* @__PURE__ */ new Map();
let subagentControlDeps = { callGateway };
function resolveSubagentController(params) {
	const { mainKey, alias } = resolveMainSessionAlias(params.cfg);
	const callerSessionKey = resolveInternalSessionKey({
		key: params.agentSessionKey?.trim() || alias,
		alias,
		mainKey
	});
	if (!isSubagentSessionKey(callerSessionKey)) return {
		controllerSessionKey: callerSessionKey,
		callerSessionKey,
		callerIsSubagent: false,
		controlScope: "children"
	};
	return {
		controllerSessionKey: callerSessionKey,
		callerSessionKey,
		callerIsSubagent: true,
		controlScope: resolveStoredSubagentCapabilities(callerSessionKey, { cfg: params.cfg }).controlScope
	};
}
function listControlledSubagentRuns(controllerSessionKey) {
	const key = controllerSessionKey.trim();
	if (!key) return [];
	const latestByChildSessionKey = buildLatestSubagentRunIndex(getSubagentRunsSnapshotForRead(subagentRuns)).latestByChildSessionKey;
	return sortSubagentRuns(Array.from(latestByChildSessionKey.values()).filter((entry) => {
		return (entry.controllerSessionKey?.trim() || entry.requesterSessionKey?.trim()) === key;
	}));
}
function ensureControllerOwnsRun(params) {
	if ((params.entry.controllerSessionKey?.trim() || params.entry.requesterSessionKey) === params.controller.controllerSessionKey) return;
	return "Subagents can only control runs spawned from their own session.";
}
async function killSubagentRun(params) {
	if (params.entry.endedAt) return { killed: false };
	const childSessionKey = params.entry.childSessionKey;
	const resolved = resolveSessionEntryForKey({
		cfg: params.cfg,
		key: childSessionKey,
		cache: params.cache
	});
	const sessionId = resolved.entry?.sessionId;
	const aborted = sessionId ? abortEmbeddedPiRun(sessionId) : false;
	const cleared = clearSessionQueues([childSessionKey, sessionId]);
	if (cleared.followupCleared > 0 || cleared.laneCleared > 0) logVerbose(`subagents control kill: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
	if (resolved.entry) try {
		await updateSessionStore(resolved.storePath, (store) => {
			const current = store[childSessionKey];
			if (!current) return;
			current.abortedLastRun = true;
			current.updatedAt = Date.now();
			store[childSessionKey] = current;
		});
	} catch (error) {
		logVerbose(`subagents control kill: failed to persist abortedLastRun for ${childSessionKey}: ${formatErrorMessage(error)}`);
	}
	return {
		killed: markSubagentRunTerminated({
			runId: params.entry.runId,
			childSessionKey,
			reason: "killed"
		}) > 0 || aborted || cleared.followupCleared > 0 || cleared.laneCleared > 0,
		sessionId
	};
}
async function cascadeKillChildren(params) {
	const childRunsBySessionKey = /* @__PURE__ */ new Map();
	for (const run of listSubagentRunsForController(params.parentChildSessionKey)) {
		const childKey = run.childSessionKey?.trim();
		if (!childKey) continue;
		const latest = getLatestSubagentRunByChildSessionKey(childKey);
		const latestControllerSessionKey = latest?.controllerSessionKey?.trim() || latest?.requesterSessionKey?.trim();
		if (!latest || latest.runId !== run.runId || latestControllerSessionKey !== params.parentChildSessionKey) continue;
		const existing = childRunsBySessionKey.get(childKey);
		if (!existing || run.createdAt >= existing.createdAt) childRunsBySessionKey.set(childKey, run);
	}
	const childRuns = Array.from(childRunsBySessionKey.values());
	const seenChildSessionKeys = params.seenChildSessionKeys ?? /* @__PURE__ */ new Set();
	let killed = 0;
	const labels = [];
	for (const run of childRuns) {
		const childKey = run.childSessionKey?.trim();
		if (!childKey || seenChildSessionKeys.has(childKey)) continue;
		seenChildSessionKeys.add(childKey);
		if (!run.endedAt) {
			if ((await killSubagentRun({
				cfg: params.cfg,
				entry: run,
				cache: params.cache
			})).killed) {
				killed += 1;
				labels.push(resolveSubagentLabel(run));
			}
		}
		const cascade = await cascadeKillChildren({
			cfg: params.cfg,
			parentChildSessionKey: childKey,
			cache: params.cache,
			seenChildSessionKeys
		});
		killed += cascade.killed;
		labels.push(...cascade.labels);
	}
	return {
		killed,
		labels
	};
}
async function killAllControlledSubagentRuns(params) {
	if (params.controller.controlScope !== "children") return {
		status: "forbidden",
		error: "Leaf subagents cannot control other sessions.",
		killed: 0,
		labels: []
	};
	const cache = /* @__PURE__ */ new Map();
	const seenChildSessionKeys = /* @__PURE__ */ new Set();
	const killedLabels = [];
	let killed = 0;
	for (const entry of params.runs) {
		const childKey = entry.childSessionKey?.trim();
		if (!childKey || seenChildSessionKeys.has(childKey)) continue;
		const currentEntry = getLatestSubagentRunByChildSessionKey(childKey);
		if (!currentEntry || currentEntry.runId !== entry.runId) continue;
		seenChildSessionKeys.add(childKey);
		if (!currentEntry.endedAt) {
			if ((await killSubagentRun({
				cfg: params.cfg,
				entry: currentEntry,
				cache
			})).killed) {
				killed += 1;
				killedLabels.push(resolveSubagentLabel(currentEntry));
			}
		}
		const cascade = await cascadeKillChildren({
			cfg: params.cfg,
			parentChildSessionKey: childKey,
			cache,
			seenChildSessionKeys
		});
		killed += cascade.killed;
		killedLabels.push(...cascade.labels);
	}
	return {
		status: "ok",
		killed,
		labels: killedLabels
	};
}
async function killControlledSubagentRun(params) {
	const ownershipError = ensureControllerOwnsRun({
		controller: params.controller,
		entry: params.entry
	});
	if (ownershipError) return {
		status: "forbidden",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		error: ownershipError
	};
	if (params.controller.controlScope !== "children") return {
		status: "forbidden",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		error: "Leaf subagents cannot control other sessions."
	};
	const currentEntry = getLatestSubagentRunByChildSessionKey(params.entry.childSessionKey);
	if (!currentEntry || currentEntry.runId !== params.entry.runId) return {
		status: "done",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		label: resolveSubagentLabel(params.entry),
		text: `${resolveSubagentLabel(params.entry)} is already finished.`
	};
	const killCache = /* @__PURE__ */ new Map();
	const stopResult = await killSubagentRun({
		cfg: params.cfg,
		entry: currentEntry,
		cache: killCache
	});
	const seenChildSessionKeys = /* @__PURE__ */ new Set();
	const targetChildKey = params.entry.childSessionKey?.trim();
	if (targetChildKey) seenChildSessionKeys.add(targetChildKey);
	const cascade = await cascadeKillChildren({
		cfg: params.cfg,
		parentChildSessionKey: params.entry.childSessionKey,
		cache: killCache,
		seenChildSessionKeys
	});
	if (!stopResult.killed && cascade.killed === 0) return {
		status: "done",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		label: resolveSubagentLabel(params.entry),
		text: `${resolveSubagentLabel(params.entry)} is already finished.`
	};
	const cascadeText = cascade.killed > 0 ? ` (+ ${cascade.killed} descendant${cascade.killed === 1 ? "" : "s"})` : "";
	return {
		status: "ok",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		label: resolveSubagentLabel(params.entry),
		cascadeKilled: cascade.killed,
		cascadeLabels: cascade.killed > 0 ? cascade.labels : void 0,
		text: stopResult.killed ? `killed ${resolveSubagentLabel(params.entry)}${cascadeText}.` : `killed ${cascade.killed} descendant${cascade.killed === 1 ? "" : "s"} of ${resolveSubagentLabel(params.entry)}.`
	};
}
async function killSubagentRunAdmin(params) {
	const targetSessionKey = params.sessionKey.trim();
	if (!targetSessionKey) return {
		found: false,
		killed: false
	};
	const entry = getLatestSubagentRunByChildSessionKey(targetSessionKey);
	if (!entry) return {
		found: false,
		killed: false
	};
	const killCache = /* @__PURE__ */ new Map();
	const stopResult = await killSubagentRun({
		cfg: params.cfg,
		entry,
		cache: killCache
	});
	const seenChildSessionKeys = new Set([targetSessionKey]);
	const cascade = await cascadeKillChildren({
		cfg: params.cfg,
		parentChildSessionKey: targetSessionKey,
		cache: killCache,
		seenChildSessionKeys
	});
	return {
		found: true,
		killed: stopResult.killed || cascade.killed > 0,
		runId: entry.runId,
		sessionKey: entry.childSessionKey,
		cascadeKilled: cascade.killed,
		cascadeLabels: cascade.killed > 0 ? cascade.labels : void 0
	};
}
async function steerControlledSubagentRun(params) {
	const ownershipError = ensureControllerOwnsRun({
		controller: params.controller,
		entry: params.entry
	});
	if (ownershipError) return {
		status: "forbidden",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		error: ownershipError
	};
	if (params.controller.controlScope !== "children") return {
		status: "forbidden",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		error: "Leaf subagents cannot control other sessions."
	};
	const targetHasPendingDescendants = countPendingDescendantRuns(params.entry.childSessionKey) > 0;
	if (params.entry.endedAt && !targetHasPendingDescendants) return {
		status: "done",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		text: `${resolveSubagentLabel(params.entry)} is already finished.`
	};
	if (params.controller.callerSessionKey === params.entry.childSessionKey) return {
		status: "forbidden",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		error: "Subagents cannot steer themselves."
	};
	const currentEntry = getLatestSubagentRunByChildSessionKey(params.entry.childSessionKey);
	const currentHasPendingDescendants = currentEntry && countPendingDescendantRuns(currentEntry.childSessionKey) > 0;
	if (!currentEntry || currentEntry.runId !== params.entry.runId || currentEntry.endedAt && !currentHasPendingDescendants) return {
		status: "done",
		runId: params.entry.runId,
		sessionKey: params.entry.childSessionKey,
		text: `${resolveSubagentLabel(params.entry)} is already finished.`
	};
	const rateKey = `${params.controller.callerSessionKey}:${params.entry.childSessionKey}`;
	if (process.env.VITEST !== "true") {
		const now = Date.now();
		if (now - (steerRateLimit.get(rateKey) ?? 0) < 2e3) return {
			status: "rate_limited",
			runId: params.entry.runId,
			sessionKey: params.entry.childSessionKey,
			error: "Steer rate limit exceeded. Wait a moment before sending another steer."
		};
		steerRateLimit.set(rateKey, now);
	}
	markSubagentRunForSteerRestart(params.entry.runId);
	const targetSession = resolveSessionEntryForKey({
		cfg: params.cfg,
		key: params.entry.childSessionKey,
		cache: /* @__PURE__ */ new Map()
	});
	const sessionId = typeof targetSession.entry?.sessionId === "string" && targetSession.entry.sessionId.trim() ? targetSession.entry.sessionId.trim() : void 0;
	if (sessionId) abortEmbeddedPiRun(sessionId);
	const cleared = clearSessionQueues([params.entry.childSessionKey, sessionId]);
	if (cleared.followupCleared > 0 || cleared.laneCleared > 0) logVerbose(`subagents control steer: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
	try {
		await subagentControlDeps.callGateway({
			method: "agent.wait",
			params: {
				runId: params.entry.runId,
				timeoutMs: STEER_ABORT_SETTLE_TIMEOUT_MS
			},
			timeoutMs: STEER_ABORT_SETTLE_TIMEOUT_MS + 2e3
		});
	} catch {}
	const idempotencyKey = crypto.randomUUID();
	let runId = idempotencyKey;
	try {
		const response = await subagentControlDeps.callGateway({
			method: "agent",
			params: {
				message: params.message,
				sessionKey: params.entry.childSessionKey,
				sessionId,
				idempotencyKey,
				deliver: false,
				channel: INTERNAL_MESSAGE_CHANNEL,
				lane: AGENT_LANE_SUBAGENT,
				timeout: 0
			},
			timeoutMs: 1e4
		});
		if (typeof response?.runId === "string" && response.runId) runId = response.runId;
	} catch (err) {
		clearSubagentRunSteerRestart(params.entry.runId);
		const error = formatErrorMessage(err);
		return {
			status: "error",
			runId,
			sessionKey: params.entry.childSessionKey,
			sessionId,
			error
		};
	}
	if (!replaceSubagentRunAfterSteer({
		previousRunId: params.entry.runId,
		nextRunId: runId,
		fallback: params.entry,
		runTimeoutSeconds: params.entry.runTimeoutSeconds ?? 0
	})) {
		clearSubagentRunSteerRestart(params.entry.runId);
		return {
			status: "error",
			runId,
			sessionKey: params.entry.childSessionKey,
			sessionId,
			error: "failed to replace steered subagent run"
		};
	}
	return {
		status: "accepted",
		runId,
		sessionKey: params.entry.childSessionKey,
		sessionId,
		mode: "restart",
		label: resolveSubagentLabel(params.entry),
		text: `steered ${resolveSubagentLabel(params.entry)}.`
	};
}
async function sendControlledSubagentMessage(params) {
	const ownershipError = ensureControllerOwnsRun({
		controller: params.controller,
		entry: params.entry
	});
	if (ownershipError) return {
		status: "forbidden",
		error: ownershipError
	};
	if (params.controller.controlScope !== "children") return {
		status: "forbidden",
		error: "Leaf subagents cannot control other sessions."
	};
	const currentEntry = getLatestSubagentRunByChildSessionKey(params.entry.childSessionKey);
	if (!currentEntry || currentEntry.runId !== params.entry.runId) return {
		status: "done",
		runId: params.entry.runId,
		text: `${resolveSubagentLabel(params.entry)} is already finished.`
	};
	const targetSessionKey = params.entry.childSessionKey;
	const parsed = parseAgentSessionKey(targetSessionKey);
	const targetSessionEntry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: parsed?.agentId }))[targetSessionKey];
	const targetSessionId = typeof targetSessionEntry?.sessionId === "string" && targetSessionEntry.sessionId.trim() ? targetSessionEntry.sessionId.trim() : void 0;
	const idempotencyKey = crypto.randomUUID();
	let runId = idempotencyKey;
	try {
		const baselineReply = await readLatestAssistantReplySnapshot({
			sessionKey: targetSessionKey,
			limit: SUBAGENT_REPLY_HISTORY_LIMIT,
			callGateway: subagentControlDeps.callGateway
		});
		const response = await subagentControlDeps.callGateway({
			method: "agent",
			params: {
				message: params.message,
				sessionKey: targetSessionKey,
				sessionId: targetSessionId,
				idempotencyKey,
				deliver: false,
				channel: INTERNAL_MESSAGE_CHANNEL,
				lane: AGENT_LANE_SUBAGENT,
				timeout: 0
			},
			timeoutMs: 1e4
		});
		const responseRunId = typeof response?.runId === "string" ? response.runId : void 0;
		if (responseRunId) runId = responseRunId;
		const result = await waitForAgentRunAndReadUpdatedAssistantReply({
			runId,
			sessionKey: targetSessionKey,
			timeoutMs: 3e4,
			limit: SUBAGENT_REPLY_HISTORY_LIMIT,
			baseline: baselineReply,
			callGateway: subagentControlDeps.callGateway
		});
		if (result.status === "timeout") return {
			status: "timeout",
			runId
		};
		if (result.status === "error") return {
			status: "error",
			runId,
			error: result.error ?? "unknown error"
		};
		return {
			status: "ok",
			runId,
			replyText: result.replyText
		};
	} catch (err) {
		const error = formatErrorMessage(err);
		return {
			status: "error",
			runId,
			error
		};
	}
}
function resolveControlledSubagentTarget(runs, token, options) {
	return resolveSubagentTargetFromRuns({
		runs,
		token,
		recentWindowMinutes: options?.recentMinutes ?? 30,
		label: (entry) => resolveSubagentLabel(entry),
		isActive: options?.isActive,
		errors: {
			missingTarget: "Missing subagent target.",
			invalidIndex: (value) => `Invalid subagent index: ${value}`,
			unknownSession: (value) => `Unknown subagent session: ${value}`,
			ambiguousLabel: (value) => `Ambiguous subagent label: ${value}`,
			ambiguousLabelPrefix: (value) => `Ambiguous subagent label prefix: ${value}`,
			ambiguousRunIdPrefix: (value) => `Ambiguous subagent run id prefix: ${value}`,
			unknownTarget: (value) => `Unknown subagent target: ${value}`
		}
	});
}
//#endregion
export { killSubagentRunAdmin as a, resolveSubagentController as c, killControlledSubagentRun as i, sendControlledSubagentMessage as l, MAX_STEER_MESSAGE_CHARS as n, listControlledSubagentRuns as o, killAllControlledSubagentRuns as r, resolveControlledSubagentTarget as s, MAX_RECENT_MINUTES as t, steerControlledSubagentRun as u };
