import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { c as normalizeAgentId, l as normalizeMainKey, m as toAgentRequestSessionKey, u as resolveAgentIdFromSessionKey } from "./session-key-Bh1lMwK5.js";
import { g as listAgentIds } from "./agent-scope-KFH9bkHi.js";
import { c as normalizeThinkLevel, d as normalizeVerboseLevel } from "./thinking.shared-CAbk7EZs.js";
import { _ as resolvePersistedSelectedModelRef, c as normalizeStoredOverrideModel, f as resolveDefaultModelForAgent } from "./model-selection-CTdyYoio.js";
import { c as updateSessionStore } from "./store-DFXcceZJ.js";
import { r as resolveExplicitAgentSessionKey } from "./main-session-DtefsIzj.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { c as resolveSessionResetPolicy, n as resolveChannelResetConfig, o as evaluateSessionFreshness, r as resolveSessionResetType } from "./reset-CkBotYFL.js";
import { n as resolveSessionKey } from "./session-key-DhT_3w6M.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as clearBootstrapSnapshotOnSessionRollover } from "./bootstrap-cache-DunTQvFV.js";
import "./runs-D-CeEXwD.js";
import crypto from "node:crypto";
//#region src/sessions/session-id-resolution.ts
function compareNormalizedUpdatedAtDescending(a, b) {
	return (b.entry?.updatedAt ?? 0) - (a.entry?.updatedAt ?? 0);
}
function compareStoreKeys(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}
function normalizeSessionIdMatches(matches, normalizedSessionId) {
	return matches.map(([sessionKey, entry]) => {
		const normalizedSessionKey = normalizeLowercaseStringOrEmpty(sessionKey);
		const normalizedRequestKey = normalizeLowercaseStringOrEmpty(toAgentRequestSessionKey(sessionKey) ?? sessionKey);
		return {
			sessionKey,
			entry,
			normalizedSessionKey,
			normalizedRequestKey,
			isCanonicalSessionKey: sessionKey === normalizedSessionKey,
			isStructural: normalizedSessionKey.endsWith(`:${normalizedSessionId}`) || normalizedRequestKey === normalizedSessionId || normalizedRequestKey.endsWith(`:${normalizedSessionId}`)
		};
	});
}
function collapseAliasMatches(matches) {
	const grouped = /* @__PURE__ */ new Map();
	for (const match of matches) {
		const bucket = grouped.get(match.normalizedRequestKey);
		if (bucket) bucket.push(match);
		else grouped.set(match.normalizedRequestKey, [match]);
	}
	return Array.from(grouped.values(), (group) => {
		if (group.length === 1) return group[0];
		return [...group].toSorted((a, b) => {
			const timeDiff = compareNormalizedUpdatedAtDescending(a, b);
			if (timeDiff !== 0) return timeDiff;
			if (a.isCanonicalSessionKey !== b.isCanonicalSessionKey) return a.isCanonicalSessionKey ? -1 : 1;
			return compareStoreKeys(a.normalizedSessionKey, b.normalizedSessionKey);
		})[0];
	});
}
function selectFreshestUniqueMatch(matches) {
	if (matches.length === 1) return matches[0];
	const [freshest, secondFreshest] = [...matches].toSorted(compareNormalizedUpdatedAtDescending);
	if ((freshest?.entry?.updatedAt ?? 0) > (secondFreshest?.entry?.updatedAt ?? 0)) return freshest;
}
function resolveSessionIdMatchSelection(matches, sessionId) {
	if (matches.length === 0) return { kind: "none" };
	const canonicalMatches = collapseAliasMatches(normalizeSessionIdMatches(matches, normalizeLowercaseStringOrEmpty(sessionId)));
	if (canonicalMatches.length === 1) return {
		kind: "selected",
		sessionKey: canonicalMatches[0].sessionKey
	};
	const structuralMatches = canonicalMatches.filter((match) => match.isStructural);
	const selectedStructuralMatch = selectFreshestUniqueMatch(structuralMatches);
	if (selectedStructuralMatch) return {
		kind: "selected",
		sessionKey: selectedStructuralMatch.sessionKey
	};
	if (structuralMatches.length > 1) return {
		kind: "ambiguous",
		sessionKeys: structuralMatches.map((match) => match.sessionKey)
	};
	const selectedCanonicalMatch = selectFreshestUniqueMatch(canonicalMatches);
	if (selectedCanonicalMatch) return {
		kind: "selected",
		sessionKey: selectedCanonicalMatch.sessionKey
	};
	return {
		kind: "ambiguous",
		sessionKeys: canonicalMatches.map((match) => match.sessionKey)
	};
}
function resolvePreferredSessionKeyForSessionIdMatches(matches, sessionId) {
	const selection = resolveSessionIdMatchSelection(matches, sessionId);
	return selection.kind === "selected" ? selection.sessionKey : void 0;
}
//#endregion
//#region src/agents/command/session.ts
function buildExplicitSessionIdSessionKey(params) {
	return `agent:${normalizeAgentId(params.agentId)}:explicit:${params.sessionId.trim()}`;
}
function collectSessionIdMatchesForRequest(opts) {
	const matches = [];
	const primaryStoreMatches = [];
	const storeByKey = /* @__PURE__ */ new Map();
	const addMatches = (candidateStore, candidateStorePath, options) => {
		for (const [candidateKey, candidateEntry] of Object.entries(candidateStore)) {
			if (candidateEntry?.sessionId !== opts.sessionId) continue;
			matches.push([candidateKey, candidateEntry]);
			if (options?.primary) primaryStoreMatches.push([candidateKey, candidateEntry]);
			storeByKey.set(candidateKey, {
				sessionKey: candidateKey,
				sessionStore: candidateStore,
				storePath: candidateStorePath
			});
		}
	};
	addMatches(opts.sessionStore, opts.storePath, { primary: true });
	for (const agentId of listAgentIds(opts.cfg)) {
		if (agentId === opts.storeAgentId) continue;
		const candidateStorePath = resolveStorePath(opts.cfg.session?.store, { agentId });
		addMatches(loadSessionStore(candidateStorePath), candidateStorePath);
	}
	return {
		matches,
		primaryStoreMatches,
		storeByKey
	};
}
/**
* Resolve an existing stored session key for a session id from a specific agent store.
* This scopes the lookup to the target store without implicitly converting `agentId`
* into that agent's main session key.
*/
function resolveStoredSessionKeyForSessionId(opts) {
	const sessionId = opts.sessionId.trim();
	const storeAgentId = opts.agentId?.trim() ? normalizeAgentId(opts.agentId) : void 0;
	const storePath = resolveStorePath(opts.cfg.session?.store, { agentId: storeAgentId });
	const sessionStore = loadSessionStore(storePath);
	if (!sessionId) return {
		sessionKey: void 0,
		sessionStore,
		storePath
	};
	const selection = resolveSessionIdMatchSelection(Object.entries(sessionStore).filter(([, entry]) => entry?.sessionId === sessionId), sessionId);
	return {
		sessionKey: selection.kind === "selected" ? selection.sessionKey : void 0,
		sessionStore,
		storePath
	};
}
function resolveSessionKeyForRequest(opts) {
	const sessionCfg = opts.cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const mainKey = normalizeMainKey(sessionCfg?.mainKey);
	const explicitSessionKey = opts.sessionKey?.trim() || resolveExplicitAgentSessionKey({
		cfg: opts.cfg,
		agentId: opts.agentId
	});
	const storeAgentId = resolveAgentIdFromSessionKey(explicitSessionKey);
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: storeAgentId });
	const sessionStore = loadSessionStore(storePath);
	const ctx = opts.to?.trim() ? { From: opts.to } : void 0;
	let sessionKey = explicitSessionKey ?? (ctx ? resolveSessionKey(scope, ctx, mainKey) : void 0);
	if (opts.sessionId && !explicitSessionKey && (!sessionKey || sessionStore[sessionKey]?.sessionId !== opts.sessionId)) {
		const { matches, primaryStoreMatches, storeByKey } = collectSessionIdMatchesForRequest({
			cfg: opts.cfg,
			sessionStore,
			storePath,
			storeAgentId,
			sessionId: opts.sessionId
		});
		const preferredSelection = resolveSessionIdMatchSelection(matches, opts.sessionId);
		const currentStoreSelection = preferredSelection.kind === "selected" ? preferredSelection : resolveSessionIdMatchSelection(primaryStoreMatches, opts.sessionId);
		if (currentStoreSelection.kind === "selected") {
			const preferred = storeByKey.get(currentStoreSelection.sessionKey);
			if (preferred) return preferred;
			sessionKey = currentStoreSelection.sessionKey;
		}
	}
	if (opts.sessionId && !sessionKey) sessionKey = buildExplicitSessionIdSessionKey({
		sessionId: opts.sessionId,
		agentId: opts.agentId
	});
	return {
		sessionKey,
		sessionStore,
		storePath
	};
}
function resolveSession(opts) {
	const sessionCfg = opts.cfg.session;
	const { sessionKey, sessionStore, storePath } = resolveSessionKeyForRequest({
		cfg: opts.cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: opts.agentId
	});
	const now = Date.now();
	const sessionEntry = sessionKey ? sessionStore[sessionKey] : void 0;
	const resetPolicy = resolveSessionResetPolicy({
		sessionCfg,
		resetType: resolveSessionResetType({ sessionKey }),
		resetOverride: resolveChannelResetConfig({
			sessionCfg,
			channel: sessionEntry?.lastChannel ?? sessionEntry?.channel ?? sessionEntry?.origin?.provider
		})
	});
	const fresh = sessionEntry ? evaluateSessionFreshness({
		updatedAt: sessionEntry.updatedAt,
		now,
		policy: resetPolicy
	}).fresh : false;
	const sessionId = opts.sessionId?.trim() || (fresh ? sessionEntry?.sessionId : void 0) || crypto.randomUUID();
	const isNewSession = !fresh && !opts.sessionId;
	clearBootstrapSnapshotOnSessionRollover({
		sessionKey,
		previousSessionId: isNewSession ? sessionEntry?.sessionId : void 0
	});
	return {
		sessionId,
		sessionKey,
		sessionEntry,
		sessionStore,
		storePath,
		isNewSession,
		persistedThinking: fresh && sessionEntry?.thinkingLevel ? normalizeThinkLevel(sessionEntry.thinkingLevel) : void 0,
		persistedVerbose: fresh && sessionEntry?.verboseLevel ? normalizeVerboseLevel(sessionEntry.verboseLevel) : void 0
	};
}
//#endregion
//#region src/agents/live-model-switch.ts
function resolveLiveSessionModelSelection(params) {
	const sessionKey = normalizeOptionalString(params.sessionKey);
	const cfg = params.cfg;
	if (!cfg || !sessionKey) return null;
	const agentId = normalizeOptionalString(params.agentId);
	const defaultModelRef = agentId ? resolveDefaultModelForAgent({
		cfg,
		agentId
	}) : {
		provider: params.defaultProvider,
		model: params.defaultModel
	};
	const entry = loadSessionStore(resolveStorePath(cfg.session?.store, { agentId }), { skipCache: true })[sessionKey];
	const normalizedSelection = normalizeStoredOverrideModel({
		providerOverride: entry?.providerOverride,
		modelOverride: entry?.modelOverride
	});
	const persisted = resolvePersistedSelectedModelRef({
		defaultProvider: defaultModelRef.provider,
		runtimeProvider: entry?.modelProvider,
		runtimeModel: entry?.model,
		overrideProvider: normalizedSelection.providerOverride,
		overrideModel: normalizedSelection.modelOverride
	});
	const provider = persisted?.provider ?? normalizedSelection.providerOverride ?? entry?.providerOverride?.trim() ?? defaultModelRef.provider;
	const model = persisted?.model ?? defaultModelRef.model;
	const authProfileId = normalizeOptionalString(entry?.authProfileOverride);
	return {
		provider,
		model,
		authProfileId,
		authProfileIdSource: authProfileId ? entry?.authProfileOverrideSource : void 0
	};
}
function hasDifferentLiveSessionModelSelection(current, next) {
	if (!next) return false;
	return current.provider !== next.provider || current.model !== next.model || normalizeOptionalString(current.authProfileId) !== next.authProfileId || (normalizeOptionalString(current.authProfileId) ? current.authProfileIdSource : void 0) !== next.authProfileIdSource;
}
/**
* Check whether a user-initiated live model switch is pending for the given
* session.  Returns the persisted model selection when the session's
* `liveModelSwitchPending` flag is `true` AND the persisted selection differs
* from the currently running model; otherwise returns `undefined`.
*
* When the flag is set but the current model already matches the persisted
* selection (e.g. the switch was applied as an override and the current
* attempt is already using the new model), the flag is consumed (cleared)
* eagerly to prevent it from persisting as stale state.
*
* **Deferral semantics:** The caller in `run.ts` only acts on the returned
* selection when `canRestartForLiveSwitch` is `true`.  If the run cannot
* restart (e.g. a tool call is in progress), the flag intentionally remains
* set so the switch fires on the next clean retry opportunity — even if that
* falls into a subsequent user turn.
*
* This replaces the previous approach that used an in-memory map
* (`consumeEmbeddedRunModelSwitch`) which could not distinguish between
* user-initiated `/model` switches and system-initiated fallback rotations.
*/
function shouldSwitchToLiveModel(params) {
	const sessionKey = params.sessionKey?.trim();
	const cfg = params.cfg;
	if (!cfg || !sessionKey) return;
	if (!loadSessionStore(resolveStorePath(cfg.session?.store, { agentId: params.agentId?.trim() }), { skipCache: true })[sessionKey]?.liveModelSwitchPending) return;
	const persisted = resolveLiveSessionModelSelection({
		cfg,
		sessionKey,
		agentId: params.agentId,
		defaultProvider: params.defaultProvider,
		defaultModel: params.defaultModel
	});
	if (!hasDifferentLiveSessionModelSelection({
		provider: params.currentProvider,
		model: params.currentModel,
		authProfileId: params.currentAuthProfileId,
		authProfileIdSource: params.currentAuthProfileIdSource
	}, persisted)) {
		clearLiveModelSwitchPending({
			cfg,
			sessionKey,
			agentId: params.agentId
		}).catch(() => {});
		return;
	}
	return persisted ?? void 0;
}
/**
* Clear the `liveModelSwitchPending` flag from the session entry on disk so
* subsequent retry iterations do not re-trigger the switch.
*/
async function clearLiveModelSwitchPending(params) {
	const sessionKey = params.sessionKey?.trim();
	const cfg = params.cfg;
	if (!cfg || !sessionKey) return;
	const storePath = resolveStorePath(cfg.session?.store, { agentId: params.agentId?.trim() });
	if (!storePath) return;
	await updateSessionStore(storePath, (store) => {
		const entry = store[sessionKey];
		if (entry) delete entry.liveModelSwitchPending;
	});
}
//#endregion
export { resolveStoredSessionKeyForSessionId as a, resolveSessionKeyForRequest as i, shouldSwitchToLiveModel as n, resolvePreferredSessionKeyForSessionIdMatches as o, resolveSession as r, clearLiveModelSwitchPending as t };
