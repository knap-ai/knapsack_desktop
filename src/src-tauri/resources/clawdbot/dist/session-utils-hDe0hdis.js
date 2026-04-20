import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DXLy_w6L.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { c as normalizeAgentId, l as normalizeMainKey, v as isCronRunSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { t as resolveAgentModelFallbackValues } from "./model-input-DFbXtnkw.js";
import { b as resolveAgentWorkspaceDir, n as resolveAgentEffectiveModelPrimary, s as resolveAgentModelFallbacksOverride, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { d as resolveAvatarMime, i as isAvatarHttpUrl, l as isWorkspaceRelativeAvatarPath, o as isPathWithinRoot, r as isAvatarDataUrl, t as AVATAR_MAX_BYTES } from "./avatar-policy-DEMOzJv4.js";
import "./config-Q9XZc_2I.js";
import { m as parseModelRef } from "./model-selection-cli-_3Gn8Wcd.js";
import { _ as resolvePersistedSelectedModelRef, c as normalizeStoredOverrideModel, d as resolveConfiguredModelRef, f as resolveDefaultModelForAgent, o as inferUniqueProviderFromConfiguredModels } from "./model-selection-CTdyYoio.js";
import { x as buildGroupDisplayName } from "./store-DFXcceZJ.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-DtefsIzj.js";
import "./sessions-vP2E4vs-.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { o as resolveFreshSessionTotalTokens } from "./types-KCfeTvaK.js";
import { a as normalizeSessionDeliveryFields } from "./delivery-context.shared-EClQPjt-.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as resolveAllAgentSessionStoreTargetsSync } from "./targets-Cxfatkj9.js";
import { a as resolveContextTokensForModel, i as lookupContextTokens } from "./context-D6_2eK-b.js";
import { n as getSubagentSessionStartedAt, r as resolveSubagentSessionStatus, t as getSubagentSessionRuntimeMs } from "./subagent-session-metrics-Bd5dqOSd.js";
import { a as listSubagentRunsForController, r as getSessionDisplaySubagentRunByChildSessionKey } from "./subagent-registry-read-DayKoqcW.js";
import { a as resolveModelCostConfig, n as estimateUsageCost } from "./usage-format-2BthAt-J.js";
import { o as readSessionTitleFieldsFromTranscript, r as readLatestSessionUsageFromTranscript } from "./session-utils.fs-BtTrNS1L.js";
import fs from "node:fs";
import path from "node:path";
//#region src/gateway/session-store-key.ts
function canonicalizeSessionKeyForAgent(agentId, key) {
	const lowered = normalizeLowercaseStringOrEmpty(key);
	if (lowered === "global" || lowered === "unknown") return lowered;
	if (lowered.startsWith("agent:")) return lowered;
	return `agent:${normalizeAgentId(agentId)}:${lowered}`;
}
function resolveDefaultStoreAgentId(cfg) {
	return normalizeAgentId(resolveDefaultAgentId(cfg));
}
function resolveSessionStoreKey(params) {
	const raw = normalizeOptionalString(params.sessionKey) ?? "";
	if (!raw) return raw;
	const rawLower = normalizeLowercaseStringOrEmpty(raw);
	if (rawLower === "global" || rawLower === "unknown") return rawLower;
	const parsed = parseAgentSessionKey(raw);
	if (parsed) {
		const agentId = normalizeAgentId(parsed.agentId);
		const lowered = normalizeLowercaseStringOrEmpty(raw);
		const canonical = canonicalizeMainSessionAlias({
			cfg: params.cfg,
			agentId,
			sessionKey: lowered
		});
		if (canonical !== lowered) return canonical;
		return lowered;
	}
	const lowered = normalizeLowercaseStringOrEmpty(raw);
	const rawMainKey = normalizeMainKey(params.cfg.session?.mainKey);
	if (lowered === "main" || lowered === rawMainKey) return resolveMainSessionKey(params.cfg);
	return canonicalizeSessionKeyForAgent(resolveDefaultStoreAgentId(params.cfg), lowered);
}
function resolveSessionStoreAgentId(cfg, canonicalKey) {
	if (canonicalKey === "global" || canonicalKey === "unknown") return resolveDefaultStoreAgentId(cfg);
	const parsed = parseAgentSessionKey(canonicalKey);
	if (parsed?.agentId) return normalizeAgentId(parsed.agentId);
	return resolveDefaultStoreAgentId(cfg);
}
function canonicalizeSpawnedByForAgent(cfg, agentId, spawnedBy) {
	const raw = normalizeOptionalString(spawnedBy) ?? "";
	if (!raw) return;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	if (lower === "global" || lower === "unknown") return lower;
	let result;
	if (lower.startsWith("agent:")) result = lower;
	else result = `agent:${normalizeAgentId(agentId)}:${lower}`;
	const parsed = parseAgentSessionKey(result);
	return canonicalizeMainSessionAlias({
		cfg,
		agentId: parsed?.agentId ? normalizeAgentId(parsed.agentId) : agentId,
		sessionKey: result
	});
}
//#endregion
//#region src/gateway/session-utils.ts
const DERIVED_TITLE_MAX_LEN = 60;
function tryResolveExistingPath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return null;
	}
}
function resolveIdentityAvatarUrl(cfg, agentId, avatar) {
	if (!avatar) return;
	const trimmed = normalizeOptionalString(avatar) ?? "";
	if (!trimmed) return;
	if (isAvatarDataUrl(trimmed) || isAvatarHttpUrl(trimmed)) return trimmed;
	if (!isWorkspaceRelativeAvatarPath(trimmed)) return;
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	const workspaceRoot = tryResolveExistingPath(workspaceDir) ?? path.resolve(workspaceDir);
	const resolvedCandidate = path.resolve(workspaceRoot, trimmed);
	if (!isPathWithinRoot(workspaceRoot, resolvedCandidate)) return;
	try {
		const opened = openBoundaryFileSync({
			absolutePath: resolvedCandidate,
			rootPath: workspaceRoot,
			rootRealPath: workspaceRoot,
			boundaryLabel: "workspace root",
			maxBytes: AVATAR_MAX_BYTES,
			skipLexicalRootCheck: true
		});
		if (!opened.ok) return;
		try {
			const buffer = fs.readFileSync(opened.fd);
			return `data:${resolveAvatarMime(resolvedCandidate)};base64,${buffer.toString("base64")}`;
		} finally {
			fs.closeSync(opened.fd);
		}
	} catch {
		return;
	}
}
function formatSessionIdPrefix(sessionId, updatedAt) {
	const prefix = sessionId.slice(0, 8);
	if (updatedAt && updatedAt > 0) return `${prefix} (${new Date(updatedAt).toISOString().slice(0, 10)})`;
	return prefix;
}
function truncateTitle(text, maxLen) {
	if (text.length <= maxLen) return text;
	const cut = text.slice(0, maxLen - 1);
	const lastSpace = cut.lastIndexOf(" ");
	if (lastSpace > maxLen * .6) return cut.slice(0, lastSpace) + "…";
	return cut + "…";
}
function deriveSessionTitle(entry, firstUserMessage) {
	if (!entry) return;
	if (normalizeOptionalString(entry.displayName)) return normalizeOptionalString(entry.displayName);
	if (normalizeOptionalString(entry.subject)) return normalizeOptionalString(entry.subject);
	if (firstUserMessage?.trim()) return truncateTitle(firstUserMessage.replace(/\s+/g, " ").trim(), DERIVED_TITLE_MAX_LEN);
	if (entry.sessionId) return formatSessionIdPrefix(entry.sessionId, entry.updatedAt);
}
function resolveSessionRuntimeMs(run, now) {
	return getSubagentSessionRuntimeMs(run, now);
}
function resolvePositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function resolveNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function resolveLatestCompactionCheckpoint(entry) {
	const checkpoints = entry?.compactionCheckpoints;
	if (!Array.isArray(checkpoints) || checkpoints.length === 0) return;
	return checkpoints.reduce((latest, checkpoint) => !latest || checkpoint.createdAt > latest.createdAt ? checkpoint : latest);
}
function resolveEstimatedSessionCostUsd(params) {
	const explicitCostUsd = resolveNonNegativeNumber(params.explicitCostUsd ?? params.entry?.estimatedCostUsd);
	if (explicitCostUsd !== void 0) return explicitCostUsd;
	const input = resolvePositiveNumber(params.entry?.inputTokens);
	const output = resolvePositiveNumber(params.entry?.outputTokens);
	const cacheRead = resolvePositiveNumber(params.entry?.cacheRead);
	const cacheWrite = resolvePositiveNumber(params.entry?.cacheWrite);
	if (input === void 0 && output === void 0 && cacheRead === void 0 && cacheWrite === void 0) return;
	const cost = resolveModelCostConfig({
		provider: params.provider,
		model: params.model,
		config: params.cfg
	});
	if (!cost) return;
	return resolveNonNegativeNumber(estimateUsageCost({
		usage: {
			...input !== void 0 ? { input } : {},
			...output !== void 0 ? { output } : {},
			...cacheRead !== void 0 ? { cacheRead } : {},
			...cacheWrite !== void 0 ? { cacheWrite } : {}
		},
		cost
	}));
}
function resolveChildSessionKeys(controllerSessionKey, store) {
	const childSessionKeys = /* @__PURE__ */ new Set();
	for (const entry of listSubagentRunsForController(controllerSessionKey)) {
		const childSessionKey = normalizeOptionalString(entry.childSessionKey);
		if (!childSessionKey) continue;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(childSessionKey);
		if ((normalizeOptionalString(latest?.controllerSessionKey) || normalizeOptionalString(latest?.requesterSessionKey)) !== controllerSessionKey) continue;
		childSessionKeys.add(childSessionKey);
	}
	for (const [key, entry] of Object.entries(store)) {
		if (!entry || key === controllerSessionKey) continue;
		const spawnedBy = normalizeOptionalString(entry.spawnedBy);
		const parentSessionKey = normalizeOptionalString(entry.parentSessionKey);
		if (spawnedBy !== controllerSessionKey && parentSessionKey !== controllerSessionKey) continue;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(key);
		if (latest) {
			if ((normalizeOptionalString(latest.controllerSessionKey) || normalizeOptionalString(latest.requesterSessionKey)) !== controllerSessionKey) continue;
		}
		childSessionKeys.add(key);
	}
	const childSessions = Array.from(childSessionKeys);
	return childSessions.length > 0 ? childSessions : void 0;
}
function resolveTranscriptUsageFallback(params) {
	const entry = params.entry;
	if (!entry?.sessionId) return null;
	const parsed = parseAgentSessionKey(params.key);
	const agentId = parsed?.agentId ? normalizeAgentId(parsed.agentId) : resolveDefaultAgentId(params.cfg);
	const snapshot = readLatestSessionUsageFromTranscript(entry.sessionId, params.storePath, entry.sessionFile, agentId);
	if (!snapshot) return null;
	const modelProvider = snapshot.modelProvider ?? params.fallbackProvider;
	const model = snapshot.model ?? params.fallbackModel;
	const contextTokens = resolveContextTokensForModel({
		cfg: params.cfg,
		provider: modelProvider,
		model,
		allowAsyncLoad: false
	});
	const estimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg: params.cfg,
		provider: modelProvider,
		model,
		explicitCostUsd: snapshot.costUsd,
		entry: {
			inputTokens: snapshot.inputTokens,
			outputTokens: snapshot.outputTokens,
			cacheRead: snapshot.cacheRead,
			cacheWrite: snapshot.cacheWrite
		}
	});
	return {
		modelProvider,
		model,
		totalTokens: resolvePositiveNumber(snapshot.totalTokens),
		totalTokensFresh: snapshot.totalTokensFresh === true,
		contextTokens: resolvePositiveNumber(contextTokens),
		estimatedCostUsd
	};
}
function loadSessionEntry(sessionKey) {
	const cfg = loadConfig();
	const canonicalKey = resolveSessionStoreKey({
		cfg,
		sessionKey
	});
	const agentId = resolveSessionStoreAgentId(cfg, canonicalKey);
	const { storePath, store } = resolveGatewaySessionStoreLookup({
		cfg,
		key: normalizeOptionalString(sessionKey) ?? "",
		canonicalKey,
		agentId
	});
	const freshestMatch = resolveFreshestSessionStoreMatchFromStoreKeys(store, resolveGatewaySessionStoreTarget({
		cfg,
		key: normalizeOptionalString(sessionKey) ?? "",
		store
	}).storeKeys);
	const legacyKey = freshestMatch?.key !== canonicalKey ? freshestMatch?.key : void 0;
	return {
		cfg,
		storePath,
		store,
		entry: freshestMatch?.entry,
		canonicalKey,
		legacyKey
	};
}
function resolveFreshestSessionStoreMatchFromStoreKeys(store, storeKeys) {
	const matches = storeKeys.map((key) => {
		const entry = store[key];
		return entry ? {
			key,
			entry
		} : void 0;
	}).filter((match) => match !== void 0);
	if (matches.length === 0) return;
	if (matches.length === 1) return matches[0];
	return [...matches].toSorted((a, b) => (b.entry.updatedAt ?? 0) - (a.entry.updatedAt ?? 0))[0];
}
function resolveFreshestSessionEntryFromStoreKeys(store, storeKeys) {
	return resolveFreshestSessionStoreMatchFromStoreKeys(store, storeKeys)?.entry;
}
function findFreshestStoreMatch(store, ...candidates) {
	const matches = /* @__PURE__ */ new Map();
	for (const candidate of candidates) {
		const trimmed = normalizeOptionalString(candidate) ?? "";
		if (!trimmed) continue;
		const exact = store[trimmed];
		if (exact) matches.set(trimmed, {
			entry: exact,
			key: trimmed
		});
		for (const key of findStoreKeysIgnoreCase(store, trimmed)) {
			const entry = store[key];
			if (entry) matches.set(key, {
				entry,
				key
			});
		}
	}
	if (matches.size === 0) return;
	return [...matches.values()].toSorted((a, b) => (b.entry.updatedAt ?? 0) - (a.entry.updatedAt ?? 0))[0];
}
/**
* Find all on-disk store keys that match the given key case-insensitively.
* Returns every key from the store whose lowercased form equals the target's lowercased form.
*/
function findStoreKeysIgnoreCase(store, targetKey) {
	const lowered = normalizeLowercaseStringOrEmpty(targetKey);
	const matches = [];
	for (const key of Object.keys(store)) if (normalizeLowercaseStringOrEmpty(key) === lowered) matches.push(key);
	return matches;
}
/**
* Remove legacy key variants for one canonical session key.
* Candidates can include aliases (for example, "agent:ops:main" when canonical is "agent:ops:work").
*/
function pruneLegacyStoreKeys(params) {
	const keysToDelete = /* @__PURE__ */ new Set();
	for (const candidate of params.candidates) {
		const trimmed = normalizeOptionalString(candidate ?? "") ?? "";
		if (!trimmed) continue;
		if (trimmed !== params.canonicalKey) keysToDelete.add(trimmed);
		for (const match of findStoreKeysIgnoreCase(params.store, trimmed)) if (match !== params.canonicalKey) keysToDelete.add(match);
	}
	for (const key of keysToDelete) delete params.store[key];
}
function migrateAndPruneGatewaySessionStoreKey(params) {
	const target = resolveGatewaySessionStoreTarget({
		cfg: params.cfg,
		key: params.key,
		store: params.store
	});
	const primaryKey = target.canonicalKey;
	const freshestMatch = resolveFreshestSessionStoreMatchFromStoreKeys(params.store, target.storeKeys);
	if (freshestMatch) {
		const currentPrimary = params.store[primaryKey];
		if (!currentPrimary || (freshestMatch.entry.updatedAt ?? 0) > (currentPrimary.updatedAt ?? 0)) params.store[primaryKey] = freshestMatch.entry;
	}
	pruneLegacyStoreKeys({
		store: params.store,
		canonicalKey: primaryKey,
		candidates: target.storeKeys
	});
	return {
		target,
		primaryKey,
		entry: params.store[primaryKey]
	};
}
function classifySessionKey(key, entry) {
	if (key === "global") return "global";
	if (key === "unknown") return "unknown";
	if (entry?.chatType === "group" || entry?.chatType === "channel") return "group";
	if (key.includes(":group:") || key.includes(":channel:")) return "group";
	return "direct";
}
function parseGroupKey(key) {
	const parts = (parseAgentSessionKey(key)?.rest ?? key).split(":").filter(Boolean);
	if (parts.length >= 3) {
		const [channel, kind, ...rest] = parts;
		if (kind === "group" || kind === "channel") return {
			channel,
			kind,
			id: rest.join(":")
		};
	}
	return null;
}
function isStorePathTemplate(store) {
	return typeof store === "string" && store.includes("{agentId}");
}
function listExistingAgentIdsFromDisk() {
	const root = resolveStateDir();
	const agentsDir = path.join(root, "agents");
	try {
		return fs.readdirSync(agentsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => normalizeAgentId(entry.name)).filter(Boolean);
	} catch {
		return [];
	}
}
function listConfiguredAgentIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	ids.add(defaultId);
	for (const entry of cfg.agents?.list ?? []) if (entry?.id) ids.add(normalizeAgentId(entry.id));
	for (const id of listExistingAgentIdsFromDisk()) ids.add(id);
	const sorted = Array.from(ids).filter(Boolean);
	sorted.sort((a, b) => a.localeCompare(b));
	return sorted.includes(defaultId) ? [defaultId, ...sorted.filter((id) => id !== defaultId)] : sorted;
}
function normalizeFallbackList(values) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of values) {
		const trimmed = value.trim();
		if (!trimmed) continue;
		const key = normalizeLowercaseStringOrEmpty(trimmed);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(trimmed);
	}
	return out;
}
function resolveGatewayAgentModel(cfg, agentId) {
	const primary = resolveAgentEffectiveModelPrimary(cfg, agentId)?.trim();
	const fallbackOverride = resolveAgentModelFallbacksOverride(cfg, agentId);
	const defaultFallbacks = resolveAgentModelFallbackValues(cfg.agents?.defaults?.model);
	const fallbacks = normalizeFallbackList(fallbackOverride ?? defaultFallbacks);
	if (!primary && fallbacks.length === 0) return;
	return {
		...primary ? { primary } : {},
		...fallbacks.length > 0 ? { fallbacks } : {}
	};
}
function listAgentsForGateway(cfg) {
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const scope = cfg.session?.scope ?? "per-sender";
	const configuredById = /* @__PURE__ */ new Map();
	for (const entry of cfg.agents?.list ?? []) {
		if (!entry?.id) continue;
		const identity = entry.identity ? {
			name: normalizeOptionalString(entry.identity.name),
			theme: normalizeOptionalString(entry.identity.theme),
			emoji: normalizeOptionalString(entry.identity.emoji),
			avatar: normalizeOptionalString(entry.identity.avatar),
			avatarUrl: resolveIdentityAvatarUrl(cfg, normalizeAgentId(entry.id), normalizeOptionalString(entry.identity.avatar))
		} : void 0;
		configuredById.set(normalizeAgentId(entry.id), {
			name: normalizeOptionalString(entry.name),
			identity
		});
	}
	const explicitIds = new Set((cfg.agents?.list ?? []).map((entry) => entry?.id ? normalizeAgentId(entry.id) : "").filter(Boolean));
	const allowedIds = explicitIds.size > 0 ? new Set([...explicitIds, defaultId]) : null;
	let agentIds = listConfiguredAgentIds(cfg).filter((id) => allowedIds ? allowedIds.has(id) : true);
	if (mainKey && !agentIds.includes(mainKey) && (!allowedIds || allowedIds.has(mainKey))) agentIds = [...agentIds, mainKey];
	return {
		defaultId,
		mainKey,
		scope,
		agents: agentIds.map((id) => {
			const meta = configuredById.get(id);
			const model = resolveGatewayAgentModel(cfg, id);
			return {
				id,
				name: meta?.name,
				identity: meta?.identity,
				workspace: resolveAgentWorkspaceDir(cfg, id),
				...model ? { model } : {}
			};
		})
	};
}
function buildGatewaySessionStoreScanTargets(params) {
	const targets = /* @__PURE__ */ new Set();
	if (params.canonicalKey) targets.add(params.canonicalKey);
	if (params.key && params.key !== params.canonicalKey) targets.add(params.key);
	if (params.canonicalKey === "global" || params.canonicalKey === "unknown") return [...targets];
	const agentMainKey = resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	});
	if (params.canonicalKey === agentMainKey) targets.add(`agent:${params.agentId}:main`);
	return [...targets];
}
function resolveGatewaySessionStoreCandidates(cfg, agentId) {
	const storeConfig = cfg.session?.store;
	const defaultTarget = {
		agentId,
		storePath: resolveStorePath(storeConfig, { agentId })
	};
	if (!isStorePathTemplate(storeConfig)) return [defaultTarget];
	const targets = /* @__PURE__ */ new Map();
	targets.set(defaultTarget.storePath, defaultTarget);
	for (const target of resolveAllAgentSessionStoreTargetsSync(cfg)) if (target.agentId === agentId) targets.set(target.storePath, target);
	return [...targets.values()];
}
function resolveGatewaySessionStoreLookup(params) {
	const scanTargets = buildGatewaySessionStoreScanTargets(params);
	const candidates = resolveGatewaySessionStoreCandidates(params.cfg, params.agentId);
	const fallback = candidates[0] ?? {
		agentId: params.agentId,
		storePath: resolveStorePath(params.cfg.session?.store, { agentId: params.agentId })
	};
	let selectedStorePath = fallback.storePath;
	let selectedStore = params.initialStore ?? loadSessionStore(fallback.storePath);
	let selectedMatch = findFreshestStoreMatch(selectedStore, ...scanTargets);
	let selectedUpdatedAt = selectedMatch?.entry.updatedAt ?? Number.NEGATIVE_INFINITY;
	for (let index = 1; index < candidates.length; index += 1) {
		const candidate = candidates[index];
		if (!candidate) continue;
		const store = loadSessionStore(candidate.storePath);
		const match = findFreshestStoreMatch(store, ...scanTargets);
		if (!match) continue;
		const updatedAt = match.entry.updatedAt ?? 0;
		if (!selectedMatch || updatedAt >= selectedUpdatedAt) {
			selectedStorePath = candidate.storePath;
			selectedStore = store;
			selectedMatch = match;
			selectedUpdatedAt = updatedAt;
		}
	}
	return {
		storePath: selectedStorePath,
		store: selectedStore,
		match: selectedMatch
	};
}
function resolveGatewaySessionStoreTarget(params) {
	const key = normalizeOptionalString(params.key) ?? "";
	const canonicalKey = resolveSessionStoreKey({
		cfg: params.cfg,
		sessionKey: key
	});
	const agentId = resolveSessionStoreAgentId(params.cfg, canonicalKey);
	const { storePath, store } = resolveGatewaySessionStoreLookup({
		cfg: params.cfg,
		key,
		canonicalKey,
		agentId,
		initialStore: params.store
	});
	if (canonicalKey === "global" || canonicalKey === "unknown") return {
		agentId,
		storePath,
		canonicalKey,
		storeKeys: key && key !== canonicalKey ? [canonicalKey, key] : [key]
	};
	const storeKeys = /* @__PURE__ */ new Set();
	storeKeys.add(canonicalKey);
	if (key && key !== canonicalKey) storeKeys.add(key);
	if (params.scanLegacyKeys !== false) {
		const scanTargets = buildGatewaySessionStoreScanTargets({
			cfg: params.cfg,
			key,
			canonicalKey,
			agentId
		});
		for (const seed of scanTargets) for (const legacyKey of findStoreKeysIgnoreCase(store, seed)) storeKeys.add(legacyKey);
	}
	return {
		agentId,
		storePath,
		canonicalKey,
		storeKeys: Array.from(storeKeys)
	};
}
function mergeSessionEntryIntoCombined(params) {
	const { cfg, combined, entry, agentId, canonicalKey } = params;
	const existing = combined[canonicalKey];
	if (existing && (existing.updatedAt ?? 0) > (entry.updatedAt ?? 0)) combined[canonicalKey] = {
		...entry,
		...existing,
		spawnedBy: canonicalizeSpawnedByForAgent(cfg, agentId, existing.spawnedBy ?? entry.spawnedBy)
	};
	else combined[canonicalKey] = {
		...existing,
		...entry,
		spawnedBy: canonicalizeSpawnedByForAgent(cfg, agentId, entry.spawnedBy ?? existing?.spawnedBy)
	};
}
function loadCombinedSessionStoreForGateway(cfg) {
	const storeConfig = cfg.session?.store;
	if (storeConfig && !isStorePathTemplate(storeConfig)) {
		const storePath = resolveStorePath(storeConfig);
		const defaultAgentId = normalizeAgentId(resolveDefaultAgentId(cfg));
		const store = loadSessionStore(storePath);
		const combined = {};
		for (const [key, entry] of Object.entries(store)) mergeSessionEntryIntoCombined({
			cfg,
			combined,
			entry,
			agentId: defaultAgentId,
			canonicalKey: canonicalizeSessionKeyForAgent(defaultAgentId, key)
		});
		return {
			storePath,
			store: combined
		};
	}
	const targets = resolveAllAgentSessionStoreTargetsSync(cfg);
	const combined = {};
	for (const target of targets) {
		const agentId = target.agentId;
		const storePath = target.storePath;
		const store = loadSessionStore(storePath);
		for (const [key, entry] of Object.entries(store)) mergeSessionEntryIntoCombined({
			cfg,
			combined,
			entry,
			agentId,
			canonicalKey: canonicalizeSessionKeyForAgent(agentId, key)
		});
	}
	return {
		storePath: typeof storeConfig === "string" && storeConfig.trim() ? storeConfig.trim() : "(multiple)",
		store: combined
	};
}
function getSessionDefaults(cfg) {
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const contextTokens = cfg.agents?.defaults?.contextTokens ?? lookupContextTokens(resolved.model, { allowAsyncLoad: false }) ?? 2e5;
	return {
		modelProvider: resolved.provider ?? null,
		model: resolved.model ?? null,
		contextTokens: contextTokens ?? null
	};
}
function resolveSessionModelRef(cfg, entry, agentId) {
	const resolved = agentId ? resolveDefaultModelForAgent({
		cfg,
		agentId
	}) : resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const normalizedOverride = normalizeStoredOverrideModel({
		providerOverride: entry?.providerOverride,
		modelOverride: entry?.modelOverride
	});
	const persisted = resolvePersistedSelectedModelRef({
		defaultProvider: resolved.provider || "openai",
		runtimeProvider: entry?.modelProvider,
		runtimeModel: entry?.model,
		overrideProvider: normalizedOverride.providerOverride,
		overrideModel: normalizedOverride.modelOverride
	});
	if (persisted) return persisted;
	return resolved;
}
async function resolveGatewayModelSupportsImages(params) {
	if (!params.model) return true;
	try {
		const modelEntry = (await params.loadGatewayModelCatalog()).find((entry) => entry.id === params.model && (!params.provider || entry.provider === params.provider));
		const normalizedProvider = normalizeOptionalLowercaseString(params.provider);
		const normalizedCandidates = [normalizeLowercaseStringOrEmpty(params.model), normalizeLowercaseStringOrEmpty(modelEntry?.name)].filter(Boolean);
		if (modelEntry) {
			if (modelEntry.input?.includes("image")) return true;
			if (normalizedProvider === "microsoft-foundry" && normalizedCandidates.some((candidate) => candidate.startsWith("gpt-") || candidate.startsWith("o1") || candidate.startsWith("o3") || candidate.startsWith("o4") || candidate === "computer-use-preview")) return true;
			if (normalizedProvider === "claude-cli" && normalizedCandidates.some((candidate) => candidate === "opus" || candidate === "sonnet" || candidate === "haiku" || candidate.startsWith("claude-"))) return true;
			return false;
		}
		if (normalizedProvider === "claude-cli" && normalizedCandidates.some((candidate) => candidate === "opus" || candidate === "sonnet" || candidate === "haiku" || candidate.startsWith("claude-"))) return true;
		return false;
	} catch {
		return false;
	}
}
function resolveSessionModelIdentityRef(cfg, entry, agentId, fallbackModelRef) {
	const runtimeModel = entry?.model?.trim();
	const runtimeProvider = entry?.modelProvider?.trim();
	if (runtimeModel) {
		if (runtimeProvider) return {
			provider: runtimeProvider,
			model: runtimeModel
		};
		const inferredProvider = inferUniqueProviderFromConfiguredModels({
			cfg,
			model: runtimeModel
		});
		if (inferredProvider) return {
			provider: inferredProvider,
			model: runtimeModel
		};
		if (runtimeModel.includes("/")) {
			const parsedRuntime = parseModelRef(runtimeModel, DEFAULT_PROVIDER);
			if (parsedRuntime) return {
				provider: parsedRuntime.provider,
				model: parsedRuntime.model
			};
			return { model: runtimeModel };
		}
		return { model: runtimeModel };
	}
	const fallbackRef = fallbackModelRef?.trim();
	if (fallbackRef) {
		const parsedFallback = parseModelRef(fallbackRef, DEFAULT_PROVIDER);
		if (parsedFallback) return {
			provider: parsedFallback.provider,
			model: parsedFallback.model
		};
		const inferredProvider = inferUniqueProviderFromConfiguredModels({
			cfg,
			model: fallbackRef
		});
		if (inferredProvider) return {
			provider: inferredProvider,
			model: fallbackRef
		};
		return { model: fallbackRef };
	}
	const resolved = resolveSessionModelRef(cfg, entry, agentId);
	return {
		provider: resolved.provider,
		model: resolved.model
	};
}
function buildGatewaySessionRow(params) {
	const { cfg, storePath, store, key, entry } = params;
	const now = params.now ?? Date.now();
	const updatedAt = entry?.updatedAt ?? null;
	const parsed = parseGroupKey(key);
	const channel = entry?.channel ?? parsed?.channel;
	const subject = entry?.subject;
	const groupChannel = entry?.groupChannel;
	const space = entry?.space;
	const id = parsed?.id;
	const origin = entry?.origin;
	const originLabel = origin?.label;
	const displayName = entry?.displayName ?? (channel ? buildGroupDisplayName({
		provider: channel,
		subject,
		groupChannel,
		space,
		id,
		key
	}) : void 0) ?? entry?.label ?? originLabel;
	const deliveryFields = normalizeSessionDeliveryFields(entry);
	const sessionAgentId = normalizeAgentId(parseAgentSessionKey(key)?.agentId ?? resolveDefaultAgentId(cfg));
	const subagentRun = getSessionDisplaySubagentRunByChildSessionKey(key);
	const subagentOwner = normalizeOptionalString(subagentRun?.controllerSessionKey) || normalizeOptionalString(subagentRun?.requesterSessionKey);
	const subagentStatus = subagentRun ? resolveSubagentSessionStatus(subagentRun) : void 0;
	const subagentStartedAt = subagentRun ? getSubagentSessionStartedAt(subagentRun) : void 0;
	const subagentEndedAt = subagentRun ? subagentRun.endedAt : void 0;
	const subagentRuntimeMs = subagentRun ? resolveSessionRuntimeMs(subagentRun, now) : void 0;
	const selectedModel = entry?.modelOverride?.trim() ? resolveSessionModelRef(cfg, entry, sessionAgentId) : null;
	const resolvedModel = resolveSessionModelIdentityRef(cfg, entry, sessionAgentId, subagentRun?.model);
	const runtimeModelPresent = Boolean(entry?.model?.trim()) || Boolean(entry?.modelProvider?.trim());
	const needsTranscriptTotalTokens = resolvePositiveNumber(resolveFreshSessionTotalTokens(entry)) === void 0;
	const needsTranscriptContextTokens = resolvePositiveNumber(entry?.contextTokens) === void 0;
	const needsTranscriptEstimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg,
		provider: resolvedModel.provider,
		model: resolvedModel.model ?? "gpt-5.4",
		entry
	}) === void 0;
	const transcriptUsage = needsTranscriptTotalTokens || needsTranscriptContextTokens || needsTranscriptEstimatedCostUsd ? resolveTranscriptUsageFallback({
		cfg,
		key,
		entry,
		storePath,
		fallbackProvider: resolvedModel.provider,
		fallbackModel: resolvedModel.model ?? "gpt-5.4"
	}) : null;
	const preferLiveSubagentModelIdentity = Boolean(subagentRun?.model?.trim()) && subagentStatus === "running";
	const shouldUseTranscriptModelIdentity = runtimeModelPresent && !preferLiveSubagentModelIdentity && (needsTranscriptTotalTokens || needsTranscriptContextTokens);
	const resolvedModelIdentity = {
		provider: resolvedModel.provider,
		model: resolvedModel.model ?? "gpt-5.4"
	};
	const { provider: modelProvider, model } = shouldUseTranscriptModelIdentity ? {
		provider: transcriptUsage?.modelProvider ?? resolvedModelIdentity.provider,
		model: transcriptUsage?.model ?? resolvedModelIdentity.model
	} : resolvedModelIdentity;
	const totalTokens = resolvePositiveNumber(resolveFreshSessionTotalTokens(entry)) ?? resolvePositiveNumber(transcriptUsage?.totalTokens);
	const totalTokensFresh = typeof totalTokens === "number" && Number.isFinite(totalTokens) && totalTokens > 0 ? true : transcriptUsage?.totalTokensFresh === true;
	const childSessions = resolveChildSessionKeys(key, store);
	const latestCompactionCheckpoint = resolveLatestCompactionCheckpoint(entry);
	const estimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg,
		provider: modelProvider,
		model,
		entry
	}) ?? resolveNonNegativeNumber(transcriptUsage?.estimatedCostUsd);
	const contextTokens = resolvePositiveNumber(entry?.contextTokens) ?? resolvePositiveNumber(transcriptUsage?.contextTokens) ?? resolvePositiveNumber(resolveContextTokensForModel({
		cfg,
		provider: modelProvider,
		model,
		allowAsyncLoad: false
	}));
	let derivedTitle;
	let lastMessagePreview;
	if (entry?.sessionId && (params.includeDerivedTitles || params.includeLastMessage)) {
		const fields = readSessionTitleFieldsFromTranscript(entry.sessionId, storePath, entry.sessionFile, sessionAgentId);
		if (params.includeDerivedTitles) derivedTitle = deriveSessionTitle(entry, fields.firstUserMessage);
		if (params.includeLastMessage && fields.lastMessagePreview) lastMessagePreview = fields.lastMessagePreview;
	}
	return {
		key,
		spawnedBy: subagentOwner || entry?.spawnedBy,
		spawnedWorkspaceDir: entry?.spawnedWorkspaceDir,
		forkedFromParent: entry?.forkedFromParent,
		spawnDepth: entry?.spawnDepth,
		subagentRole: entry?.subagentRole,
		subagentControlScope: entry?.subagentControlScope,
		kind: classifySessionKey(key, entry),
		label: entry?.label,
		displayName,
		derivedTitle,
		lastMessagePreview,
		channel,
		subject,
		groupChannel,
		space,
		chatType: entry?.chatType,
		origin,
		updatedAt,
		sessionId: entry?.sessionId,
		systemSent: entry?.systemSent,
		abortedLastRun: entry?.abortedLastRun,
		thinkingLevel: entry?.thinkingLevel,
		fastMode: entry?.fastMode,
		verboseLevel: entry?.verboseLevel,
		traceLevel: entry?.traceLevel,
		reasoningLevel: entry?.reasoningLevel,
		elevatedLevel: entry?.elevatedLevel,
		sendPolicy: entry?.sendPolicy,
		inputTokens: entry?.inputTokens,
		outputTokens: entry?.outputTokens,
		totalTokens,
		totalTokensFresh,
		estimatedCostUsd,
		status: subagentRun ? subagentStatus : entry?.status,
		startedAt: subagentRun ? subagentStartedAt : entry?.startedAt,
		endedAt: subagentRun ? subagentEndedAt : entry?.endedAt,
		runtimeMs: subagentRun ? subagentRuntimeMs : entry?.runtimeMs,
		parentSessionKey: subagentOwner || entry?.parentSessionKey,
		childSessions,
		responseUsage: entry?.responseUsage,
		modelProvider: selectedModel?.provider ?? modelProvider,
		model: selectedModel?.model ?? model,
		contextTokens,
		deliveryContext: deliveryFields.deliveryContext,
		lastChannel: deliveryFields.lastChannel ?? entry?.lastChannel,
		lastTo: deliveryFields.lastTo ?? entry?.lastTo,
		lastAccountId: deliveryFields.lastAccountId ?? entry?.lastAccountId,
		lastThreadId: deliveryFields.lastThreadId ?? entry?.lastThreadId,
		compactionCheckpointCount: entry?.compactionCheckpoints?.length,
		latestCompactionCheckpoint
	};
}
function loadGatewaySessionRow(sessionKey, options) {
	const { cfg, storePath, store, entry, canonicalKey } = loadSessionEntry(sessionKey);
	if (!entry) return null;
	return buildGatewaySessionRow({
		cfg,
		storePath,
		store,
		key: canonicalKey,
		entry,
		now: options?.now,
		includeDerivedTitles: options?.includeDerivedTitles,
		includeLastMessage: options?.includeLastMessage
	});
}
function listSessionsFromStore(params) {
	const { cfg, storePath, store, opts } = params;
	const now = Date.now();
	const includeGlobal = opts.includeGlobal === true;
	const includeUnknown = opts.includeUnknown === true;
	const includeDerivedTitles = opts.includeDerivedTitles === true;
	const includeLastMessage = opts.includeLastMessage === true;
	const spawnedBy = typeof opts.spawnedBy === "string" ? opts.spawnedBy : "";
	const label = normalizeOptionalString(opts.label) ?? "";
	const agentId = typeof opts.agentId === "string" ? normalizeAgentId(opts.agentId) : "";
	const search = normalizeLowercaseStringOrEmpty(opts.search);
	const activeMinutes = typeof opts.activeMinutes === "number" && Number.isFinite(opts.activeMinutes) ? Math.max(1, Math.floor(opts.activeMinutes)) : void 0;
	let sessions = Object.entries(store).filter(([key]) => {
		if (isCronRunSessionKey(key)) return false;
		if (!includeGlobal && key === "global") return false;
		if (!includeUnknown && key === "unknown") return false;
		if (agentId) {
			if (key === "global" || key === "unknown") return false;
			const parsed = parseAgentSessionKey(key);
			if (!parsed) return false;
			return normalizeAgentId(parsed.agentId) === agentId;
		}
		return true;
	}).filter(([key, entry]) => {
		if (!spawnedBy) return true;
		if (key === "unknown" || key === "global") return false;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(key);
		if (latest) return (normalizeOptionalString(latest.controllerSessionKey) || normalizeOptionalString(latest.requesterSessionKey)) === spawnedBy;
		return entry?.spawnedBy === spawnedBy || entry?.parentSessionKey === spawnedBy;
	}).filter(([, entry]) => {
		if (!label) return true;
		return entry?.label === label;
	}).map(([key, entry]) => buildGatewaySessionRow({
		cfg,
		storePath,
		store,
		key,
		entry,
		now,
		includeDerivedTitles,
		includeLastMessage
	})).toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	if (search) sessions = sessions.filter((s) => {
		return [
			s.displayName,
			s.label,
			s.subject,
			s.sessionId,
			s.key
		].some((f) => typeof f === "string" && normalizeLowercaseStringOrEmpty(f).includes(search));
	});
	if (activeMinutes !== void 0) {
		const cutoff = now - activeMinutes * 6e4;
		sessions = sessions.filter((s) => (s.updatedAt ?? 0) >= cutoff);
	}
	if (typeof opts.limit === "number" && Number.isFinite(opts.limit)) {
		const limit = Math.max(1, Math.floor(opts.limit));
		sessions = sessions.slice(0, limit);
	}
	return {
		ts: now,
		path: storePath,
		count: sessions.length,
		defaults: getSessionDefaults(cfg),
		sessions
	};
}
//#endregion
export { loadSessionEntry as a, resolveFreshestSessionEntryFromStoreKeys as c, resolveSessionModelIdentityRef as d, resolveSessionModelRef as f, loadGatewaySessionRow as i, resolveGatewayModelSupportsImages as l, listSessionsFromStore as n, migrateAndPruneGatewaySessionStoreKey as o, canonicalizeSpawnedByForAgent as p, loadCombinedSessionStoreForGateway as r, pruneLegacyStoreKeys as s, listAgentsForGateway as t, resolveGatewaySessionStoreTarget as u };
