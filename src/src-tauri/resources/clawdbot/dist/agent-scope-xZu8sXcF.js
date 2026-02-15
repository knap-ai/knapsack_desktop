import { s as resolveStateDir } from "./paths-BZtyHNCi.js";
import { _ as DEFAULT_AGENT_ID, j as parseAgentSessionKey, p as resolveDefaultAgentWorkspaceDir, w as normalizeAgentId } from "./workspace-CUznpDHg.js";
import { B as resolveUserPath } from "./exec-DBtWJ4Ld.js";
import path from "node:path";

//#region src/agents/agent-scope.ts
let defaultAgentWarned = false;
function listAgents(cfg) {
	const list = cfg.agents?.list;
	if (!Array.isArray(list)) return [];
	return list.filter((entry) => Boolean(entry && typeof entry === "object"));
}
function listAgentIds(cfg) {
	const agents = listAgents(cfg);
	if (agents.length === 0) return [DEFAULT_AGENT_ID];
	const seen = /* @__PURE__ */ new Set();
	const ids = [];
	for (const entry of agents) {
		const id = normalizeAgentId(entry?.id);
		if (seen.has(id)) continue;
		seen.add(id);
		ids.push(id);
	}
	return ids.length > 0 ? ids : [DEFAULT_AGENT_ID];
}
function resolveDefaultAgentId(cfg) {
	const agents = listAgents(cfg);
	if (agents.length === 0) return DEFAULT_AGENT_ID;
	const defaults = agents.filter((agent) => agent?.default);
	if (defaults.length > 1 && !defaultAgentWarned) {
		defaultAgentWarned = true;
		console.warn("Multiple agents marked default=true; using the first entry as default.");
	}
	const chosen = (defaults[0] ?? agents[0])?.id?.trim();
	return normalizeAgentId(chosen || DEFAULT_AGENT_ID);
}
function resolveSessionAgentIds(params) {
	const defaultAgentId = resolveDefaultAgentId(params.config ?? {});
	const sessionKey = params.sessionKey?.trim();
	const normalizedSessionKey = sessionKey ? sessionKey.toLowerCase() : void 0;
	const parsed = normalizedSessionKey ? parseAgentSessionKey(normalizedSessionKey) : null;
	return {
		defaultAgentId,
		sessionAgentId: parsed?.agentId ? normalizeAgentId(parsed.agentId) : defaultAgentId
	};
}
function resolveSessionAgentId(params) {
	return resolveSessionAgentIds(params).sessionAgentId;
}
function resolveAgentEntry(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	return listAgents(cfg).find((entry) => normalizeAgentId(entry.id) === id);
}
function resolveAgentConfig(cfg, agentId) {
	const entry = resolveAgentEntry(cfg, normalizeAgentId(agentId));
	if (!entry) return;
	return {
		name: typeof entry.name === "string" ? entry.name : void 0,
		workspace: typeof entry.workspace === "string" ? entry.workspace : void 0,
		agentDir: typeof entry.agentDir === "string" ? entry.agentDir : void 0,
		model: typeof entry.model === "string" || entry.model && typeof entry.model === "object" ? entry.model : void 0,
		skills: Array.isArray(entry.skills) ? entry.skills : void 0,
		memorySearch: entry.memorySearch,
		humanDelay: entry.humanDelay,
		heartbeat: entry.heartbeat,
		identity: entry.identity,
		groupChat: entry.groupChat,
		subagents: typeof entry.subagents === "object" && entry.subagents ? entry.subagents : void 0,
		sandbox: entry.sandbox,
		tools: entry.tools
	};
}
function resolveAgentSkillsFilter(cfg, agentId) {
	const raw = resolveAgentConfig(cfg, agentId)?.skills;
	if (!raw) return;
	const normalized = raw.map((entry) => String(entry).trim()).filter(Boolean);
	return normalized.length > 0 ? normalized : [];
}
function resolveAgentModelPrimary(cfg, agentId) {
	const raw = resolveAgentConfig(cfg, agentId)?.model;
	if (!raw) return;
	if (typeof raw === "string") return raw.trim() || void 0;
	return raw.primary?.trim() || void 0;
}
function resolveAgentModelFallbacksOverride(cfg, agentId) {
	const raw = resolveAgentConfig(cfg, agentId)?.model;
	if (!raw || typeof raw === "string") return;
	if (!Object.hasOwn(raw, "fallbacks")) return;
	return Array.isArray(raw.fallbacks) ? raw.fallbacks : void 0;
}
function resolveAgentWorkspaceDir(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	const configured = resolveAgentConfig(cfg, id)?.workspace?.trim();
	if (configured) return resolveUserPath(configured);
	if (id === resolveDefaultAgentId(cfg)) {
		const fallback = cfg.agents?.defaults?.workspace?.trim();
		if (fallback) return resolveUserPath(fallback);
		return resolveDefaultAgentWorkspaceDir(process.env);
	}
	const stateDir = resolveStateDir(process.env);
	return path.join(stateDir, `workspace-${id}`);
}
function resolveAgentDir(cfg, agentId) {
	const id = normalizeAgentId(agentId);
	const configured = resolveAgentConfig(cfg, id)?.agentDir?.trim();
	if (configured) return resolveUserPath(configured);
	const root = resolveStateDir(process.env);
	return path.join(root, "agents", id, "agent");
}

//#endregion
export { resolveAgentModelPrimary as a, resolveDefaultAgentId as c, resolveAgentModelFallbacksOverride as i, resolveSessionAgentId as l, resolveAgentConfig as n, resolveAgentSkillsFilter as o, resolveAgentDir as r, resolveAgentWorkspaceDir as s, listAgentIds as t, resolveSessionAgentIds as u };