import { T as parseAgentSessionKey } from "./session-key-D7XpmyVq.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { c as resolveSessionStoreEntry, d as updateSessionStore, i as loadSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { Dt as markSubagentRunTerminated, Fr as resolveInternalSessionKey, Ir as resolveMainSessionAlias, Tt as listSubagentRunsForController, fn as getAcpSessionManager, rr as abortEmbeddedPiRun, xt as getLatestSubagentRunByChildSessionKey } from "./pi-embedded-BYdcxQ5A.js";
import { i as clearSessionQueues } from "./queue-CrmMgtZc.js";
import { i as setAbortMemory, n as isAbortRequestText } from "./abort-primitives-BdKXAi1U.js";
import { o as stripMentions, s as stripStructuralPrefixes } from "./mentions-Bfkn0E5p.js";
import { t as resolveCommandAuthorization } from "./command-auth-BeHp6PUO.js";
import { a as shouldPersistAbortCutoff, i as resolveAbortCutoffFromContext, t as applyAbortCutoffToSessionEntry } from "./abort-cutoff-C4TVKBVn.js";
const abortDeps = {
	getAcpSessionManager,
	abortEmbeddedPiRun,
	getLatestSubagentRunByChildSessionKey,
	listSubagentRunsForController,
	markSubagentRunTerminated
};
function formatAbortReplyText(stoppedSubagents) {
	if (typeof stoppedSubagents !== "number" || stoppedSubagents <= 0) return "⚙️ Agent was aborted.";
	return `⚙️ Agent was aborted. Stopped ${stoppedSubagents} ${stoppedSubagents === 1 ? "sub-agent" : "sub-agents"}.`;
}
function resolveSessionEntryForKey(store, sessionKey) {
	if (!store || !sessionKey) return {};
	const resolved = resolveSessionStoreEntry({
		store,
		sessionKey
	});
	if (resolved.existing) return resolved.legacyKeys.length > 0 ? {
		entry: resolved.existing,
		key: resolved.normalizedKey,
		legacyKeys: resolved.legacyKeys
	} : {
		entry: resolved.existing,
		key: resolved.normalizedKey
	};
	return {};
}
function resolveAbortTargetKey(ctx) {
	const target = ctx.CommandTargetSessionKey?.trim();
	if (target) return target;
	return ctx.SessionKey?.trim() || void 0;
}
function normalizeRequesterSessionKey(cfg, key) {
	const cleaned = key?.trim();
	if (!cleaned) return;
	const { mainKey, alias } = resolveMainSessionAlias(cfg);
	return resolveInternalSessionKey({
		key: cleaned,
		alias,
		mainKey
	});
}
function stopSubagentsForRequester(params) {
	const requesterKey = normalizeRequesterSessionKey(params.cfg, params.requesterSessionKey);
	if (!requesterKey) return { stopped: 0 };
	const dedupedRunsByChildKey = /* @__PURE__ */ new Map();
	for (const run of abortDeps.listSubagentRunsForController(requesterKey)) {
		const childKey = run.childSessionKey?.trim();
		if (!childKey) continue;
		const latest = abortDeps.getLatestSubagentRunByChildSessionKey(childKey);
		const latestControllerSessionKey = latest?.controllerSessionKey?.trim() || latest?.requesterSessionKey?.trim();
		if (!latest || latest.runId !== run.runId || latestControllerSessionKey !== requesterKey) continue;
		const existing = dedupedRunsByChildKey.get(childKey);
		if (!existing || run.createdAt >= existing.createdAt) dedupedRunsByChildKey.set(childKey, run);
	}
	const runs = Array.from(dedupedRunsByChildKey.values());
	if (runs.length === 0) return { stopped: 0 };
	const storeCache = /* @__PURE__ */ new Map();
	const seenChildKeys = /* @__PURE__ */ new Set();
	let stopped = 0;
	for (const run of runs) {
		const childKey = run.childSessionKey?.trim();
		if (!childKey || seenChildKeys.has(childKey)) continue;
		seenChildKeys.add(childKey);
		if (!run.endedAt) {
			const cleared = clearSessionQueues([childKey]);
			const parsed = parseAgentSessionKey(childKey);
			const storePath = resolveStorePath(params.cfg.session?.store, { agentId: parsed?.agentId });
			let store = storeCache.get(storePath);
			if (!store) {
				store = loadSessionStore(storePath);
				storeCache.set(storePath, store);
			}
			const sessionId = store[childKey]?.sessionId;
			const aborted = sessionId ? abortDeps.abortEmbeddedPiRun(sessionId) : false;
			if (abortDeps.markSubagentRunTerminated({
				runId: run.runId,
				childSessionKey: childKey,
				reason: "killed"
			}) > 0 || aborted || cleared.followupCleared > 0 || cleared.laneCleared > 0) stopped += 1;
		}
		const cascadeResult = stopSubagentsForRequester({
			cfg: params.cfg,
			requesterSessionKey: childKey
		});
		stopped += cascadeResult.stopped;
	}
	if (stopped > 0) logVerbose(`abort: stopped ${stopped} subagent run(s) for ${requesterKey}`);
	return { stopped };
}
async function tryFastAbortFromMessage(params) {
	const { ctx, cfg } = params;
	const targetKey = resolveAbortTargetKey(ctx);
	const agentId = resolveSessionAgentId({
		sessionKey: targetKey ?? ctx.SessionKey ?? "",
		config: cfg
	});
	const raw = stripStructuralPrefixes(ctx.CommandBody ?? ctx.RawBody ?? ctx.Body ?? "");
	if (!isAbortRequestText(ctx.ChatType?.trim().toLowerCase() === "group" ? stripMentions(raw, ctx, cfg, agentId) : raw)) return {
		handled: false,
		aborted: false
	};
	const commandAuthorized = ctx.CommandAuthorized;
	const auth = resolveCommandAuthorization({
		ctx,
		cfg,
		commandAuthorized
	});
	if (!auth.isAuthorizedSender) return {
		handled: false,
		aborted: false
	};
	const abortKey = targetKey ?? auth.from ?? auth.to;
	const requesterSessionKey = targetKey ?? ctx.SessionKey ?? abortKey;
	if (targetKey) {
		const storePath = resolveStorePath(cfg.session?.store, { agentId });
		const store = loadSessionStore(storePath);
		const { entry, key, legacyKeys } = resolveSessionEntryForKey(store, targetKey);
		const resolvedTargetKey = key ?? targetKey;
		const acpManager = abortDeps.getAcpSessionManager();
		if (acpManager.resolveSession({
			cfg,
			sessionKey: resolvedTargetKey
		}).kind !== "none") try {
			await acpManager.cancelSession({
				cfg,
				sessionKey: resolvedTargetKey,
				reason: "fast-abort"
			});
		} catch (error) {
			logVerbose(`abort: ACP cancel failed for ${resolvedTargetKey}: ${error instanceof Error ? error.message : String(error)}`);
		}
		const sessionId = entry?.sessionId;
		const aborted = sessionId ? abortDeps.abortEmbeddedPiRun(sessionId) : false;
		const cleared = clearSessionQueues([resolvedTargetKey, sessionId]);
		if (cleared.followupCleared > 0 || cleared.laneCleared > 0) logVerbose(`abort: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
		const abortCutoff = shouldPersistAbortCutoff({
			commandSessionKey: ctx.SessionKey,
			targetSessionKey: resolvedTargetKey
		}) ? resolveAbortCutoffFromContext(ctx) : void 0;
		if (entry && key) {
			entry.abortedLastRun = true;
			applyAbortCutoffToSessionEntry(entry, abortCutoff);
			entry.updatedAt = Date.now();
			store[key] = entry;
			for (const legacyKey of legacyKeys ?? []) if (legacyKey !== key) delete store[legacyKey];
			await updateSessionStore(storePath, (nextStore) => {
				const nextEntry = nextStore[key] ?? entry;
				if (!nextEntry) return;
				nextEntry.abortedLastRun = true;
				applyAbortCutoffToSessionEntry(nextEntry, abortCutoff);
				nextEntry.updatedAt = Date.now();
				nextStore[key] = nextEntry;
				for (const legacyKey of legacyKeys ?? []) if (legacyKey !== key) delete nextStore[legacyKey];
			});
		} else if (abortKey) setAbortMemory(abortKey, true);
		const { stopped } = stopSubagentsForRequester({
			cfg,
			requesterSessionKey
		});
		return {
			handled: true,
			aborted,
			stoppedSubagents: stopped
		};
	}
	if (abortKey) setAbortMemory(abortKey, true);
	const { stopped } = stopSubagentsForRequester({
		cfg,
		requesterSessionKey
	});
	return {
		handled: true,
		aborted: false,
		stoppedSubagents: stopped
	};
}
//#endregion
export { tryFastAbortFromMessage as i, resolveSessionEntryForKey as n, stopSubagentsForRequester as r, formatAbortReplyText as t };
