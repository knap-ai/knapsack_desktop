import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { g as getSubagentDepth, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as parseJsonWithJson5Fallback } from "./parse-json-compat-fs1eUPUx.js";
import fs from "node:fs";
//#region src/agents/subagent-session-key.ts
const normalizeSubagentSessionKey = normalizeOptionalString;
//#endregion
//#region src/agents/subagent-depth.ts
function normalizeSpawnDepth(value) {
	if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : void 0;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return;
		const numeric = Number(trimmed);
		return Number.isInteger(numeric) && numeric >= 0 ? numeric : void 0;
	}
}
function readSessionStore(storePath) {
	try {
		const parsed = parseJsonWithJson5Fallback(fs.readFileSync(storePath, "utf-8"));
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
	} catch {}
	return {};
}
function buildKeyCandidates(rawKey, cfg) {
	if (!cfg) return [rawKey];
	if (rawKey === "global" || rawKey === "unknown") return [rawKey];
	if (parseAgentSessionKey(rawKey)) return [rawKey];
	const prefixed = `agent:${resolveDefaultAgentId(cfg)}:${rawKey}`;
	return prefixed === rawKey ? [rawKey] : [rawKey, prefixed];
}
function findEntryBySessionId(store, sessionId) {
	const normalizedSessionId = normalizeSubagentSessionKey(sessionId);
	if (!normalizedSessionId) return;
	for (const entry of Object.values(store)) {
		const candidateSessionId = normalizeSubagentSessionKey(entry?.sessionId);
		if (candidateSessionId && candidateSessionId === normalizedSessionId) return entry;
	}
}
function resolveEntryForSessionKey(params) {
	const candidates = buildKeyCandidates(params.sessionKey, params.cfg);
	if (params.store) {
		for (const key of candidates) {
			const entry = params.store[key];
			if (entry) return entry;
		}
		return findEntryBySessionId(params.store, params.sessionKey);
	}
	if (!params.cfg) return;
	for (const key of candidates) {
		const parsed = parseAgentSessionKey(key);
		if (!parsed?.agentId) continue;
		const storePath = resolveStorePath(params.cfg.session?.store, { agentId: parsed.agentId });
		let store = params.cache.get(storePath);
		if (!store) {
			store = readSessionStore(storePath);
			params.cache.set(storePath, store);
		}
		const entry = store[key] ?? findEntryBySessionId(store, params.sessionKey);
		if (entry) return entry;
	}
}
function getSubagentDepthFromSessionStore(sessionKey, opts) {
	const raw = (sessionKey ?? "").trim();
	const fallbackDepth = getSubagentDepth(raw);
	if (!raw) return fallbackDepth;
	const cache = /* @__PURE__ */ new Map();
	const visited = /* @__PURE__ */ new Set();
	const depthFromStore = (key) => {
		const normalizedKey = normalizeSubagentSessionKey(key);
		if (!normalizedKey) return;
		if (visited.has(normalizedKey)) return;
		visited.add(normalizedKey);
		const entry = resolveEntryForSessionKey({
			sessionKey: normalizedKey,
			cfg: opts?.cfg,
			store: opts?.store,
			cache
		});
		const storedDepth = normalizeSpawnDepth(entry?.spawnDepth);
		if (storedDepth !== void 0) return storedDepth;
		const spawnedBy = normalizeSubagentSessionKey(entry?.spawnedBy);
		if (!spawnedBy) return;
		const parentDepth = depthFromStore(spawnedBy);
		if (parentDepth !== void 0) return parentDepth + 1;
		return getSubagentDepth(spawnedBy) + 1;
	};
	return depthFromStore(raw) ?? fallbackDepth;
}
//#endregion
export { normalizeSubagentSessionKey as n, getSubagentDepthFromSessionStore as t };
