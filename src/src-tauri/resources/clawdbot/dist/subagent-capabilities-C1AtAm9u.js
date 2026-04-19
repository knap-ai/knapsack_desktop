import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { b as isSubagentSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import "./sessions-vP2E4vs-.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as normalizeSubagentSessionKey, t as getSubagentDepthFromSessionStore } from "./subagent-depth-MKErRZ8H.js";
//#region src/agents/subagent-capabilities.ts
const SUBAGENT_SESSION_ROLES = [
	"main",
	"orchestrator",
	"leaf"
];
const SUBAGENT_CONTROL_SCOPES = ["children", "none"];
function normalizeSubagentRole(value) {
	const trimmed = normalizeOptionalLowercaseString(value);
	return SUBAGENT_SESSION_ROLES.find((entry) => entry === trimmed);
}
function normalizeSubagentControlScope(value) {
	const trimmed = normalizeOptionalLowercaseString(value);
	return SUBAGENT_CONTROL_SCOPES.find((entry) => entry === trimmed);
}
function readSessionStore(storePath) {
	try {
		return loadSessionStore(storePath);
	} catch {
		return {};
	}
}
function findEntryBySessionId(store, sessionId) {
	const normalizedSessionId = normalizeSubagentSessionKey(sessionId);
	if (!normalizedSessionId) return;
	for (const entry of Object.values(store)) if (normalizeSubagentSessionKey(entry?.sessionId) === normalizedSessionId) return entry;
}
function resolveSessionCapabilityEntry(params) {
	if (params.store) return params.store[params.sessionKey] ?? findEntryBySessionId(params.store, params.sessionKey);
	if (!params.cfg) return;
	const parsed = parseAgentSessionKey(params.sessionKey);
	if (!parsed?.agentId) return;
	const store = readSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: parsed.agentId }));
	return store[params.sessionKey] ?? findEntryBySessionId(store, params.sessionKey);
}
function resolveSubagentRoleForDepth(params) {
	const depth = Number.isInteger(params.depth) ? Math.max(0, params.depth) : 0;
	const maxSpawnDepth = typeof params.maxSpawnDepth === "number" && Number.isFinite(params.maxSpawnDepth) ? Math.max(1, Math.floor(params.maxSpawnDepth)) : 1;
	if (depth <= 0) return "main";
	return depth < maxSpawnDepth ? "orchestrator" : "leaf";
}
function resolveSubagentControlScopeForRole(role) {
	return role === "leaf" ? "none" : "children";
}
function resolveSubagentCapabilities(params) {
	const role = resolveSubagentRoleForDepth(params);
	const controlScope = resolveSubagentControlScopeForRole(role);
	return {
		depth: Math.max(0, Math.floor(params.depth)),
		role,
		controlScope,
		canSpawn: role === "main" || role === "orchestrator",
		canControlChildren: controlScope === "children"
	};
}
function resolveStoredSubagentCapabilities(sessionKey, opts) {
	const normalizedSessionKey = normalizeSubagentSessionKey(sessionKey);
	const maxSpawnDepth = opts?.cfg?.agents?.defaults?.subagents?.maxSpawnDepth ?? 1;
	const depth = getSubagentDepthFromSessionStore(normalizedSessionKey, {
		cfg: opts?.cfg,
		store: opts?.store
	});
	if (!normalizedSessionKey || !isSubagentSessionKey(normalizedSessionKey)) return resolveSubagentCapabilities({
		depth,
		maxSpawnDepth
	});
	const entry = resolveSessionCapabilityEntry({
		sessionKey: normalizedSessionKey,
		cfg: opts?.cfg,
		store: opts?.store
	});
	const storedRole = normalizeSubagentRole(entry?.subagentRole);
	const storedControlScope = normalizeSubagentControlScope(entry?.subagentControlScope);
	const fallback = resolveSubagentCapabilities({
		depth,
		maxSpawnDepth
	});
	const role = storedRole ?? fallback.role;
	const controlScope = storedControlScope ?? resolveSubagentControlScopeForRole(role);
	return {
		depth,
		role,
		controlScope,
		canSpawn: role === "main" || role === "orchestrator",
		canControlChildren: controlScope === "children"
	};
}
//#endregion
export { resolveSubagentCapabilities as n, resolveStoredSubagentCapabilities as t };
