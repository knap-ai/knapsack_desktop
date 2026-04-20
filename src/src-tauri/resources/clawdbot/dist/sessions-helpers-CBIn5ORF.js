import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { _ as isAcpSessionKey, b as isSubagentSessionKey, l as normalizeMainKey, u as resolveAgentIdFromSessionKey } from "./session-key-Bh1lMwK5.js";
import "./config-Q9XZc_2I.js";
import { r as callGateway } from "./call-BA3do6C0.js";
import { n as looksLikeSessionId } from "./session-id-RmePhKuR.js";
import "./chat-history-text-C5anYCs7.js";
let sessionsResolutionDeps = { callGateway };
function resolveMainSessionAlias(cfg) {
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const scope = cfg.session?.scope ?? "per-sender";
	return {
		mainKey,
		alias: scope === "global" ? "global" : mainKey,
		scope
	};
}
function resolveDisplaySessionKey(params) {
	if (params.key === params.alias) return "main";
	if (params.key === params.mainKey) return "main";
	return params.key;
}
function resolveInternalSessionKey(params) {
	if (params.key === "current") return params.requesterInternalKey ?? params.key;
	if (params.key === "main") return params.alias;
	return params.key;
}
async function listSpawnedSessionKeys(params) {
	const limit = typeof params.limit === "number" && Number.isFinite(params.limit) ? Math.max(1, Math.floor(params.limit)) : void 0;
	try {
		const list = await sessionsResolutionDeps.callGateway({
			method: "sessions.list",
			params: {
				includeGlobal: false,
				includeUnknown: false,
				...limit !== void 0 ? { limit } : {},
				spawnedBy: params.requesterSessionKey
			}
		});
		const keys = (Array.isArray(list?.sessions) ? list.sessions : []).map((entry) => normalizeOptionalString(entry?.key) ?? "").filter(Boolean);
		return new Set(keys);
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
async function isRequesterSpawnedSessionVisible(params) {
	if (params.requesterSessionKey === params.targetSessionKey) return true;
	try {
		const resolved = await sessionsResolutionDeps.callGateway({
			method: "sessions.resolve",
			params: {
				key: params.targetSessionKey,
				spawnedBy: params.requesterSessionKey
			}
		});
		if (typeof resolved?.key === "string" && resolved.key.trim() === params.targetSessionKey) return true;
	} catch {}
	return (await listSpawnedSessionKeys({
		requesterSessionKey: params.requesterSessionKey,
		limit: params.limit
	})).has(params.targetSessionKey);
}
function shouldVerifyRequesterSpawnedSessionVisibility(params) {
	return params.restrictToSpawned && !params.resolvedViaSessionId && params.requesterSessionKey !== params.targetSessionKey;
}
async function isResolvedSessionVisibleToRequester(params) {
	if (!shouldVerifyRequesterSpawnedSessionVisibility({
		requesterSessionKey: params.requesterSessionKey,
		targetSessionKey: params.targetSessionKey,
		restrictToSpawned: params.restrictToSpawned,
		resolvedViaSessionId: params.resolvedViaSessionId
	})) return true;
	return await isRequesterSpawnedSessionVisible({
		requesterSessionKey: params.requesterSessionKey,
		targetSessionKey: params.targetSessionKey,
		limit: params.limit
	});
}
function looksLikeSessionKey(value) {
	const raw = normalizeOptionalString(value) ?? "";
	if (!raw) return false;
	if (raw === "main" || raw === "global" || raw === "unknown" || raw === "current") return true;
	if (isAcpSessionKey(raw)) return true;
	if (raw.startsWith("agent:")) return true;
	if (raw.startsWith("cron:") || raw.startsWith("hook:")) return true;
	if (raw.startsWith("node-") || raw.startsWith("node:")) return true;
	if (raw.includes(":group:") || raw.includes(":channel:")) return true;
	return false;
}
function shouldResolveSessionIdInput(value) {
	return looksLikeSessionId(value) || !looksLikeSessionKey(value);
}
function buildResolvedSessionReference(params) {
	return {
		ok: true,
		key: params.key,
		displayKey: resolveDisplaySessionKey({
			key: params.key,
			alias: params.alias,
			mainKey: params.mainKey
		}),
		resolvedViaSessionId: params.resolvedViaSessionId
	};
}
function buildSessionIdResolveParams(params) {
	return {
		sessionId: params.sessionId,
		spawnedBy: params.restrictToSpawned ? params.requesterInternalKey : void 0,
		includeGlobal: !params.restrictToSpawned,
		includeUnknown: !params.restrictToSpawned
	};
}
async function callGatewayResolveSessionId(params) {
	const key = normalizeOptionalString((await sessionsResolutionDeps.callGateway({
		method: "sessions.resolve",
		params: buildSessionIdResolveParams(params)
	}))?.key) ?? "";
	if (!key) throw new Error(`Session not found: ${params.sessionId} (use the full sessionKey from sessions_list)`);
	return key;
}
async function resolveSessionKeyFromSessionId(params) {
	try {
		return buildResolvedSessionReference({
			key: await callGatewayResolveSessionId(params),
			alias: params.alias,
			mainKey: params.mainKey,
			resolvedViaSessionId: true
		});
	} catch (err) {
		if (params.restrictToSpawned) return {
			ok: false,
			status: "forbidden",
			error: `Session not visible from this sandboxed agent session: ${params.sessionId}`
		};
		return {
			ok: false,
			status: "error",
			error: formatErrorMessage(err) || `Session not found: ${params.sessionId} (use the full sessionKey from sessions_list)`
		};
	}
}
async function resolveSessionKeyFromKey(params) {
	try {
		const key = normalizeOptionalString((await sessionsResolutionDeps.callGateway({
			method: "sessions.resolve",
			params: {
				key: params.key,
				spawnedBy: params.restrictToSpawned ? params.requesterInternalKey : void 0
			}
		}))?.key) ?? "";
		if (!key) return null;
		return buildResolvedSessionReference({
			key,
			alias: params.alias,
			mainKey: params.mainKey,
			resolvedViaSessionId: false
		});
	} catch {
		return null;
	}
}
async function tryResolveSessionKeyFromSessionId(params) {
	try {
		return buildResolvedSessionReference({
			key: await callGatewayResolveSessionId(params),
			alias: params.alias,
			mainKey: params.mainKey,
			resolvedViaSessionId: true
		});
	} catch {
		return null;
	}
}
async function resolveSessionReferenceByKeyOrSessionId(params) {
	if (!params.skipKeyLookup) {
		const resolvedByKey = await resolveSessionKeyFromKey({
			key: params.raw,
			alias: params.alias,
			mainKey: params.mainKey,
			requesterInternalKey: params.requesterInternalKey,
			restrictToSpawned: params.restrictToSpawned
		});
		if (resolvedByKey) return resolvedByKey;
	}
	if (!(params.forceSessionIdLookup || shouldResolveSessionIdInput(params.raw))) return null;
	if (params.allowUnresolvedSessionId) return await tryResolveSessionKeyFromSessionId({
		sessionId: params.raw,
		alias: params.alias,
		mainKey: params.mainKey,
		requesterInternalKey: params.requesterInternalKey,
		restrictToSpawned: params.restrictToSpawned
	});
	return await resolveSessionKeyFromSessionId({
		sessionId: params.raw,
		alias: params.alias,
		mainKey: params.mainKey,
		requesterInternalKey: params.requesterInternalKey,
		restrictToSpawned: params.restrictToSpawned
	});
}
async function resolveSessionReference(params) {
	const rawInput = params.sessionKey.trim();
	if (rawInput === "current") {
		const resolvedCurrent = await resolveSessionReferenceByKeyOrSessionId({
			raw: rawInput,
			alias: params.alias,
			mainKey: params.mainKey,
			requesterInternalKey: params.requesterInternalKey,
			restrictToSpawned: params.restrictToSpawned,
			allowUnresolvedSessionId: true,
			skipKeyLookup: params.restrictToSpawned,
			forceSessionIdLookup: true
		});
		if (resolvedCurrent) return resolvedCurrent;
	}
	const raw = rawInput === "current" && params.requesterInternalKey ? params.requesterInternalKey : rawInput;
	if (shouldResolveSessionIdInput(raw)) {
		const resolvedByGateway = await resolveSessionReferenceByKeyOrSessionId({
			raw,
			alias: params.alias,
			mainKey: params.mainKey,
			requesterInternalKey: params.requesterInternalKey,
			restrictToSpawned: params.restrictToSpawned,
			allowUnresolvedSessionId: false
		});
		if (resolvedByGateway) return resolvedByGateway;
	}
	const resolvedKey = resolveInternalSessionKey({
		key: raw,
		alias: params.alias,
		mainKey: params.mainKey,
		requesterInternalKey: params.requesterInternalKey
	});
	return {
		ok: true,
		key: resolvedKey,
		displayKey: resolveDisplaySessionKey({
			key: resolvedKey,
			alias: params.alias,
			mainKey: params.mainKey
		}),
		resolvedViaSessionId: false
	};
}
async function resolveVisibleSessionReference(params) {
	const resolvedKey = params.resolvedSession.key;
	const displayKey = params.resolvedSession.displayKey;
	if (!await isResolvedSessionVisibleToRequester({
		requesterSessionKey: params.requesterSessionKey,
		targetSessionKey: resolvedKey,
		restrictToSpawned: params.restrictToSpawned,
		resolvedViaSessionId: params.resolvedSession.resolvedViaSessionId
	})) return {
		ok: false,
		status: "forbidden",
		error: `Session not visible from this sandboxed agent session: ${params.visibilitySessionKey}`,
		displayKey
	};
	return {
		ok: true,
		key: resolvedKey,
		displayKey
	};
}
//#endregion
//#region src/agents/tools/sessions-access.ts
function resolveSessionToolsVisibility(cfg) {
	const raw = cfg.tools?.sessions?.visibility;
	const value = normalizeLowercaseStringOrEmpty(raw);
	if (value === "self" || value === "tree" || value === "agent" || value === "all") return value;
	return "tree";
}
function resolveEffectiveSessionToolsVisibility(params) {
	const visibility = resolveSessionToolsVisibility(params.cfg);
	if (!params.sandboxed) return visibility;
	if ((params.cfg.agents?.defaults?.sandbox?.sessionToolsVisibility ?? "spawned") === "spawned" && visibility !== "tree") return "tree";
	return visibility;
}
function resolveSandboxSessionToolsVisibility(cfg) {
	return cfg.agents?.defaults?.sandbox?.sessionToolsVisibility ?? "spawned";
}
function resolveSandboxedSessionToolContext(params) {
	const { mainKey, alias } = resolveMainSessionAlias(params.cfg);
	const visibility = resolveSandboxSessionToolsVisibility(params.cfg);
	const requesterSessionKey = normalizeOptionalString(params.agentSessionKey);
	const requesterInternalKey = requesterSessionKey ? resolveInternalSessionKey({
		key: requesterSessionKey,
		alias,
		mainKey
	}) : void 0;
	return {
		mainKey,
		alias,
		visibility,
		requesterInternalKey,
		effectiveRequesterKey: requesterInternalKey ?? alias,
		restrictToSpawned: params.sandboxed === true && visibility === "spawned" && !!requesterInternalKey && !isSubagentSessionKey(requesterInternalKey)
	};
}
function createAgentToAgentPolicy(cfg) {
	const routingA2A = cfg.tools?.agentToAgent;
	const enabled = routingA2A?.enabled === true;
	const allowPatterns = Array.isArray(routingA2A?.allow) ? routingA2A.allow : [];
	const matchesAllow = (agentId) => {
		if (allowPatterns.length === 0) return true;
		return allowPatterns.some((pattern) => {
			const raw = normalizeOptionalString(typeof pattern === "string" ? pattern : String(pattern ?? "")) ?? "";
			if (!raw) return false;
			if (raw === "*") return true;
			if (!raw.includes("*")) return raw === agentId;
			const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			return new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`, "i").test(agentId);
		});
	};
	const isAllowed = (requesterAgentId, targetAgentId) => {
		if (requesterAgentId === targetAgentId) return true;
		if (!enabled) return false;
		return matchesAllow(requesterAgentId) && matchesAllow(targetAgentId);
	};
	return {
		enabled,
		matchesAllow,
		isAllowed
	};
}
function actionPrefix(action) {
	if (action === "history") return "Session history";
	if (action === "send") return "Session send";
	if (action === "status") return "Session status";
	return "Session list";
}
function a2aDisabledMessage(action) {
	if (action === "history") return "Agent-to-agent history is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent access.";
	if (action === "send") return "Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends.";
	if (action === "status") return "Agent-to-agent status is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent access.";
	return "Agent-to-agent listing is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent visibility.";
}
function a2aDeniedMessage(action) {
	if (action === "history") return "Agent-to-agent history denied by tools.agentToAgent.allow.";
	if (action === "send") return "Agent-to-agent messaging denied by tools.agentToAgent.allow.";
	if (action === "status") return "Agent-to-agent status denied by tools.agentToAgent.allow.";
	return "Agent-to-agent listing denied by tools.agentToAgent.allow.";
}
function crossVisibilityMessage(action) {
	if (action === "history") return "Session history visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
	if (action === "send") return "Session send visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
	if (action === "status") return "Session status visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
	return "Session list visibility is restricted. Set tools.sessions.visibility=all to allow cross-agent access.";
}
function selfVisibilityMessage(action) {
	return `${actionPrefix(action)} visibility is restricted to the current session (tools.sessions.visibility=self).`;
}
function treeVisibilityMessage(action) {
	return `${actionPrefix(action)} visibility is restricted to the current session tree (tools.sessions.visibility=tree).`;
}
async function createSessionVisibilityGuard(params) {
	const requesterAgentId = resolveAgentIdFromSessionKey(params.requesterSessionKey);
	const spawnedKeys = params.visibility === "tree" ? await listSpawnedSessionKeys({ requesterSessionKey: params.requesterSessionKey }) : null;
	const check = (targetSessionKey) => {
		const targetAgentId = resolveAgentIdFromSessionKey(targetSessionKey);
		if (targetAgentId !== requesterAgentId) {
			if (params.visibility !== "all") return {
				allowed: false,
				status: "forbidden",
				error: crossVisibilityMessage(params.action)
			};
			if (!params.a2aPolicy.enabled) return {
				allowed: false,
				status: "forbidden",
				error: a2aDisabledMessage(params.action)
			};
			if (!params.a2aPolicy.isAllowed(requesterAgentId, targetAgentId)) return {
				allowed: false,
				status: "forbidden",
				error: a2aDeniedMessage(params.action)
			};
			return { allowed: true };
		}
		if (params.visibility === "self" && targetSessionKey !== params.requesterSessionKey) return {
			allowed: false,
			status: "forbidden",
			error: selfVisibilityMessage(params.action)
		};
		if (params.visibility === "tree" && targetSessionKey !== params.requesterSessionKey && !spawnedKeys?.has(targetSessionKey)) return {
			allowed: false,
			status: "forbidden",
			error: treeVisibilityMessage(params.action)
		};
		return { allowed: true };
	};
	return { check };
}
//#endregion
//#region src/agents/tools/sessions-helpers.ts
function resolveSessionToolContext(opts) {
	const cfg = opts?.config ?? loadConfig();
	return {
		cfg,
		...resolveSandboxedSessionToolContext({
			cfg,
			agentSessionKey: opts?.agentSessionKey,
			sandboxed: opts?.sandboxed
		})
	};
}
function classifySessionKind(params) {
	const key = params.key;
	if (key === params.alias || key === params.mainKey) return "main";
	if (key.startsWith("cron:")) return "cron";
	if (key.startsWith("hook:")) return "hook";
	if (key.startsWith("node-") || key.startsWith("node:")) return "node";
	if (params.gatewayKind === "group") return "group";
	if (key.includes(":group:") || key.includes(":channel:")) return "group";
	return "other";
}
function deriveChannel(params) {
	if (params.kind === "cron" || params.kind === "hook" || params.kind === "node") return "internal";
	const channel = normalizeOptionalString(params.channel ?? void 0);
	if (channel) return channel;
	const lastChannel = normalizeOptionalString(params.lastChannel ?? void 0);
	if (lastChannel) return lastChannel;
	const parts = params.key.split(":").filter(Boolean);
	if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return parts[0];
	return "unknown";
}
//#endregion
export { createSessionVisibilityGuard as a, resolveDisplaySessionKey as c, resolveSessionReference as d, resolveVisibleSessionReference as f, createAgentToAgentPolicy as i, resolveInternalSessionKey as l, deriveChannel as n, resolveEffectiveSessionToolsVisibility as o, shouldResolveSessionIdInput as p, resolveSessionToolContext as r, resolveSandboxedSessionToolContext as s, classifySessionKind as t, resolveMainSessionAlias as u };
