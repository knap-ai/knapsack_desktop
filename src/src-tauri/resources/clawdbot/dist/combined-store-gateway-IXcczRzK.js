import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { o as parseAgentSessionKey } from "./session-key-utils-naHBWFyS.js";
import { c as normalizeAgentId, l as normalizeMainKey } from "./session-key-hxP9B3Or.js";
import { S as resolveDefaultAgentId, _ as listAgentIds } from "./agent-scope-i10se9ty.js";
import { i as resolveMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-JXLAAy4Q.js";
import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import { n as resolveAllAgentSessionStoreTargetsSync } from "./targets-DHc_LF06.js";
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
function shouldRemapLegacyDefaultMainAlias(cfg, parsed, options) {
	if (normalizeAgentId(parsed.agentId) !== "main" || listAgentIds(cfg).includes("main")) return false;
	const defaultAgentId = resolveDefaultStoreAgentId(cfg);
	if (options?.storeAgentId && normalizeAgentId(options.storeAgentId) !== defaultAgentId) return false;
	const rest = normalizeLowercaseStringOrEmpty(parsed.rest);
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	return rest === "main" || rest === mainKey;
}
function resolveParsedSessionStoreKey(cfg, raw, parsed, options) {
	if (!shouldRemapLegacyDefaultMainAlias(cfg, parsed, options)) return {
		agentId: normalizeAgentId(parsed.agentId),
		sessionKey: normalizeLowercaseStringOrEmpty(raw)
	};
	const agentId = resolveDefaultStoreAgentId(cfg);
	return {
		agentId,
		sessionKey: `agent:${agentId}:${normalizeLowercaseStringOrEmpty(parsed.rest)}`
	};
}
function resolveSessionStoreKey(params) {
	const raw = normalizeOptionalString(params.sessionKey) ?? "";
	if (!raw) return raw;
	const rawLower = normalizeLowercaseStringOrEmpty(raw);
	if (rawLower === "global" || rawLower === "unknown") return rawLower;
	const parsed = parseAgentSessionKey(raw);
	if (parsed) {
		const resolved = resolveParsedSessionStoreKey(params.cfg, raw, parsed, { storeAgentId: params.storeAgentId });
		const canonical = canonicalizeMainSessionAlias({
			cfg: params.cfg,
			agentId: resolved.agentId,
			sessionKey: resolved.sessionKey
		});
		if (canonical !== resolved.sessionKey) return canonical;
		return resolved.sessionKey;
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
function resolveStoredSessionKeyForAgentStore(params) {
	const raw = normalizeOptionalString(params.sessionKey) ?? "";
	if (!raw) return raw;
	const lowered = normalizeLowercaseStringOrEmpty(raw);
	if (lowered === "global" || lowered === "unknown") return lowered;
	const key = parseAgentSessionKey(raw) ? raw : canonicalizeSessionKeyForAgent(params.agentId, raw);
	return resolveSessionStoreKey({
		cfg: params.cfg,
		sessionKey: key,
		storeAgentId: params.agentId
	});
}
function resolveStoredSessionOwnerAgentId(params) {
	const canonicalKey = resolveStoredSessionKeyForAgentStore(params);
	if (canonicalKey === "global" || canonicalKey === "unknown") return null;
	return resolveSessionStoreAgentId(params.cfg, canonicalKey);
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
//#region src/config/sessions/combined-store-gateway.ts
function isStorePathTemplate(store) {
	return typeof store === "string" && store.includes("{agentId}");
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
			canonicalKey: resolveStoredSessionKeyForAgentStore({
				cfg,
				agentId: defaultAgentId,
				sessionKey: key
			})
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
			canonicalKey: resolveStoredSessionKeyForAgentStore({
				cfg,
				agentId,
				sessionKey: key
			})
		});
	}
	return {
		storePath: typeof storeConfig === "string" && storeConfig.trim() ? storeConfig.trim() : "(multiple)",
		store: combined
	};
}
//#endregion
export { resolveStoredSessionKeyForAgentStore as a, resolveSessionStoreKey as i, canonicalizeSpawnedByForAgent as n, resolveStoredSessionOwnerAgentId as o, resolveSessionStoreAgentId as r, loadCombinedSessionStoreForGateway as t };
