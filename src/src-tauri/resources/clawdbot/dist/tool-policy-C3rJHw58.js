import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
//#region src/agents/tool-description-presets.ts
const EXEC_TOOL_DISPLAY_SUMMARY = "Run shell commands that start now.";
const PROCESS_TOOL_DISPLAY_SUMMARY = "Inspect and control running exec sessions.";
const CRON_TOOL_DISPLAY_SUMMARY = "Schedule cron jobs, reminders, and wake events.";
const SESSIONS_LIST_TOOL_DISPLAY_SUMMARY = "List visible sessions and optional recent messages.";
const SESSIONS_HISTORY_TOOL_DISPLAY_SUMMARY = "Read sanitized message history for a visible session.";
const SESSIONS_SEND_TOOL_DISPLAY_SUMMARY = "Send a message to another visible session.";
const SESSIONS_SPAWN_TOOL_DISPLAY_SUMMARY = "Spawn sub-agent or ACP sessions.";
const SESSION_STATUS_TOOL_DISPLAY_SUMMARY = "Show session status, usage, and model state.";
const UPDATE_PLAN_TOOL_DISPLAY_SUMMARY = "Track a short structured work plan.";
function describeSessionsListTool() {
	return ["List visible sessions with optional filters for kind, recent activity, and last messages.", "Use this to discover a target session before calling sessions_history or sessions_send."].join(" ");
}
function describeSessionsHistoryTool() {
	return ["Fetch sanitized message history for a visible session.", "Supports limits and optional tool messages; use this to inspect another session before replying, debugging, or resuming work."].join(" ");
}
function describeSessionsSendTool() {
	return ["Send a message into another visible session by sessionKey or label.", "Use this to delegate follow-up work to an existing session; waits for the target run and returns the updated assistant reply when available."].join(" ");
}
function describeSessionsSpawnTool() {
	return [
		"Spawn an isolated session with `runtime=\"subagent\"` or `runtime=\"acp\"`.",
		"`mode=\"run\"` is one-shot and `mode=\"session\"` is persistent or thread-bound.",
		"Subagents inherit the parent workspace directory automatically.",
		"Use this when the work should happen in a fresh child session instead of the current one."
	].join(" ");
}
function describeSessionStatusTool() {
	return [
		"Show a /status-equivalent session status card for the current or another visible session, including usage, time, cost when available, and linked background task context.",
		"Optional `model` sets a per-session model override; `model=default` resets overrides.",
		"Use this for questions like what model is active or how a session is configured."
	].join(" ");
}
function describeUpdatePlanTool() {
	return [
		"Update the current structured work plan for this run.",
		"Use this for non-trivial multi-step work so the plan stays current while execution continues.",
		"Keep steps short, mark at most one step as `in_progress`, and skip this tool for simple one-step tasks."
	].join(" ");
}
//#endregion
//#region src/agents/tool-catalog.ts
const CORE_TOOL_SECTION_ORDER = [
	{
		id: "fs",
		label: "Files"
	},
	{
		id: "runtime",
		label: "Runtime"
	},
	{
		id: "web",
		label: "Web"
	},
	{
		id: "memory",
		label: "Memory"
	},
	{
		id: "sessions",
		label: "Sessions"
	},
	{
		id: "ui",
		label: "UI"
	},
	{
		id: "messaging",
		label: "Messaging"
	},
	{
		id: "automation",
		label: "Automation"
	},
	{
		id: "nodes",
		label: "Nodes"
	},
	{
		id: "agents",
		label: "Agents"
	},
	{
		id: "media",
		label: "Media"
	}
];
const CORE_TOOL_DEFINITIONS = [
	{
		id: "read",
		label: "read",
		description: "Read file contents",
		sectionId: "fs",
		profiles: ["coding"]
	},
	{
		id: "write",
		label: "write",
		description: "Create or overwrite files",
		sectionId: "fs",
		profiles: ["coding"]
	},
	{
		id: "edit",
		label: "edit",
		description: "Make precise edits",
		sectionId: "fs",
		profiles: ["coding"]
	},
	{
		id: "apply_patch",
		label: "apply_patch",
		description: "Patch files",
		sectionId: "fs",
		profiles: ["coding"]
	},
	{
		id: "exec",
		label: "exec",
		description: EXEC_TOOL_DISPLAY_SUMMARY,
		sectionId: "runtime",
		profiles: ["coding"]
	},
	{
		id: "process",
		label: "process",
		description: PROCESS_TOOL_DISPLAY_SUMMARY,
		sectionId: "runtime",
		profiles: ["coding"]
	},
	{
		id: "code_execution",
		label: "code_execution",
		description: "Run sandboxed remote analysis",
		sectionId: "runtime",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "web_search",
		label: "web_search",
		description: "Search the web",
		sectionId: "web",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "web_fetch",
		label: "web_fetch",
		description: "Fetch web content",
		sectionId: "web",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "x_search",
		label: "x_search",
		description: "Search X posts",
		sectionId: "web",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "memory_search",
		label: "memory_search",
		description: "Semantic search",
		sectionId: "memory",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "memory_get",
		label: "memory_get",
		description: "Read memory files",
		sectionId: "memory",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "sessions_list",
		label: "sessions_list",
		description: SESSIONS_LIST_TOOL_DISPLAY_SUMMARY,
		sectionId: "sessions",
		profiles: ["coding", "messaging"],
		includeInOpenClawGroup: true
	},
	{
		id: "sessions_history",
		label: "sessions_history",
		description: SESSIONS_HISTORY_TOOL_DISPLAY_SUMMARY,
		sectionId: "sessions",
		profiles: ["coding", "messaging"],
		includeInOpenClawGroup: true
	},
	{
		id: "sessions_send",
		label: "sessions_send",
		description: SESSIONS_SEND_TOOL_DISPLAY_SUMMARY,
		sectionId: "sessions",
		profiles: ["coding", "messaging"],
		includeInOpenClawGroup: true
	},
	{
		id: "sessions_spawn",
		label: "sessions_spawn",
		description: SESSIONS_SPAWN_TOOL_DISPLAY_SUMMARY,
		sectionId: "sessions",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "sessions_yield",
		label: "sessions_yield",
		description: "End turn to receive sub-agent results",
		sectionId: "sessions",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "subagents",
		label: "subagents",
		description: "Manage sub-agents",
		sectionId: "sessions",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "session_status",
		label: "session_status",
		description: SESSION_STATUS_TOOL_DISPLAY_SUMMARY,
		sectionId: "sessions",
		profiles: [
			"minimal",
			"coding",
			"messaging"
		],
		includeInOpenClawGroup: true
	},
	{
		id: "browser",
		label: "browser",
		description: "Control web browser",
		sectionId: "ui",
		profiles: [],
		includeInOpenClawGroup: true
	},
	{
		id: "canvas",
		label: "canvas",
		description: "Control canvases",
		sectionId: "ui",
		profiles: [],
		includeInOpenClawGroup: true
	},
	{
		id: "message",
		label: "message",
		description: "Send messages",
		sectionId: "messaging",
		profiles: ["messaging"],
		includeInOpenClawGroup: true
	},
	{
		id: "cron",
		label: "cron",
		description: CRON_TOOL_DISPLAY_SUMMARY,
		sectionId: "automation",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "gateway",
		label: "gateway",
		description: "Gateway control",
		sectionId: "automation",
		profiles: [],
		includeInOpenClawGroup: true
	},
	{
		id: "nodes",
		label: "nodes",
		description: "Nodes + devices",
		sectionId: "nodes",
		profiles: [],
		includeInOpenClawGroup: true
	},
	{
		id: "agents_list",
		label: "agents_list",
		description: "List agents",
		sectionId: "agents",
		profiles: [],
		includeInOpenClawGroup: true
	},
	{
		id: "update_plan",
		label: "update_plan",
		description: UPDATE_PLAN_TOOL_DISPLAY_SUMMARY,
		sectionId: "agents",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "image",
		label: "image",
		description: "Image understanding",
		sectionId: "media",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "image_generate",
		label: "image_generate",
		description: "Image generation",
		sectionId: "media",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "music_generate",
		label: "music_generate",
		description: "Music generation",
		sectionId: "media",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "video_generate",
		label: "video_generate",
		description: "Video generation",
		sectionId: "media",
		profiles: ["coding"],
		includeInOpenClawGroup: true
	},
	{
		id: "tts",
		label: "tts",
		description: "Text-to-speech conversion",
		sectionId: "media",
		profiles: [],
		includeInOpenClawGroup: true
	}
];
const CORE_TOOL_BY_ID = new Map(CORE_TOOL_DEFINITIONS.map((tool) => [tool.id, tool]));
function listCoreToolIdsForProfile(profile) {
	return CORE_TOOL_DEFINITIONS.filter((tool) => tool.profiles.includes(profile)).map((tool) => tool.id);
}
const CORE_TOOL_PROFILES = {
	minimal: { allow: listCoreToolIdsForProfile("minimal") },
	coding: { allow: listCoreToolIdsForProfile("coding") },
	messaging: { allow: listCoreToolIdsForProfile("messaging") },
	full: {}
};
function buildCoreToolGroupMap() {
	const sectionToolMap = /* @__PURE__ */ new Map();
	for (const tool of CORE_TOOL_DEFINITIONS) {
		const groupId = `group:${tool.sectionId}`;
		const list = sectionToolMap.get(groupId) ?? [];
		list.push(tool.id);
		sectionToolMap.set(groupId, list);
	}
	const openclawTools = CORE_TOOL_DEFINITIONS.filter((tool) => tool.includeInOpenClawGroup).map((tool) => tool.id);
	return {
		"group:openclaw": openclawTools,
		...Object.fromEntries(sectionToolMap.entries())
	};
}
const CORE_TOOL_GROUPS = buildCoreToolGroupMap();
const PROFILE_OPTIONS = [
	{
		id: "minimal",
		label: "Minimal"
	},
	{
		id: "coding",
		label: "Coding"
	},
	{
		id: "messaging",
		label: "Messaging"
	},
	{
		id: "full",
		label: "Full"
	}
];
function resolveCoreToolProfilePolicy(profile) {
	if (!profile) return;
	const resolved = CORE_TOOL_PROFILES[profile];
	if (!resolved) return;
	if (!resolved.allow && !resolved.deny) return;
	return {
		allow: resolved.allow ? [...resolved.allow] : void 0,
		deny: resolved.deny ? [...resolved.deny] : void 0
	};
}
function listCoreToolSections() {
	return CORE_TOOL_SECTION_ORDER.map((section) => ({
		id: section.id,
		label: section.label,
		tools: CORE_TOOL_DEFINITIONS.filter((tool) => tool.sectionId === section.id).map((tool) => ({
			id: tool.id,
			label: tool.label,
			description: tool.description
		}))
	})).filter((section) => section.tools.length > 0);
}
function resolveCoreToolProfiles(toolId) {
	const tool = CORE_TOOL_BY_ID.get(toolId);
	if (!tool) return [];
	return [...tool.profiles];
}
function isKnownCoreToolId(toolId) {
	return CORE_TOOL_BY_ID.has(toolId);
}
//#endregion
//#region src/agents/tool-policy-shared.ts
const TOOL_NAME_ALIASES = {
	bash: "exec",
	"apply-patch": "apply_patch"
};
const TOOL_GROUPS = { ...CORE_TOOL_GROUPS };
function normalizeToolName(name) {
	const normalized = normalizeLowercaseStringOrEmpty(name);
	return TOOL_NAME_ALIASES[normalized] ?? normalized;
}
function normalizeToolList(list) {
	if (!list) return [];
	return list.map(normalizeToolName).filter(Boolean);
}
function expandToolGroups(list) {
	const normalized = normalizeToolList(list);
	const expanded = [];
	for (const value of normalized) {
		const group = TOOL_GROUPS[value];
		if (group) {
			expanded.push(...group);
			continue;
		}
		expanded.push(value);
	}
	return Array.from(new Set(expanded));
}
function resolveToolProfilePolicy(profile) {
	return resolveCoreToolProfilePolicy(profile);
}
//#endregion
//#region src/agents/tool-policy.ts
function wrapOwnerOnlyToolExecution(tool, senderIsOwner) {
	if (tool.ownerOnly !== true || senderIsOwner || !tool.execute) return tool;
	return {
		...tool,
		execute: async () => {
			throw new Error("Tool restricted to owner senders.");
		}
	};
}
const OWNER_ONLY_TOOL_APPROVAL_CLASS_FALLBACKS = new Map([
	["whatsapp_login", "interactive"],
	["cron", "control_plane"],
	["gateway", "control_plane"],
	["nodes", "exec_capable"]
]);
function resolveOwnerOnlyToolApprovalClass(name) {
	return OWNER_ONLY_TOOL_APPROVAL_CLASS_FALLBACKS.get(normalizeToolName(name));
}
function isOwnerOnlyToolName(name) {
	return resolveOwnerOnlyToolApprovalClass(name) !== void 0;
}
function isOwnerOnlyTool(tool) {
	return tool.ownerOnly === true || isOwnerOnlyToolName(tool.name);
}
function applyOwnerOnlyToolPolicy(tools, senderIsOwner) {
	const withGuard = tools.map((tool) => {
		if (!isOwnerOnlyTool(tool)) return tool;
		return wrapOwnerOnlyToolExecution(tool, senderIsOwner);
	});
	if (senderIsOwner) return withGuard;
	return withGuard.filter((tool) => !isOwnerOnlyTool(tool));
}
function collectExplicitAllowlist(policies) {
	const entries = [];
	for (const policy of policies) {
		if (!policy?.allow) continue;
		for (const value of policy.allow) {
			if (typeof value !== "string") continue;
			const trimmed = value.trim();
			if (trimmed) entries.push(trimmed);
		}
	}
	return entries;
}
function buildPluginToolGroups(params) {
	const all = [];
	const byPlugin = /* @__PURE__ */ new Map();
	for (const tool of params.tools) {
		const meta = params.toolMeta(tool);
		if (!meta) continue;
		const name = normalizeToolName(tool.name);
		all.push(name);
		const pluginId = normalizeOptionalLowercaseString(meta.pluginId);
		if (!pluginId) continue;
		const list = byPlugin.get(pluginId) ?? [];
		list.push(name);
		byPlugin.set(pluginId, list);
	}
	return {
		all,
		byPlugin
	};
}
function expandPluginGroups(list, groups) {
	if (!list || list.length === 0) return list;
	const expanded = [];
	for (const entry of list) {
		const normalized = normalizeToolName(entry);
		if (normalized === "group:plugins") {
			if (groups.all.length > 0) expanded.push(...groups.all);
			else expanded.push(normalized);
			continue;
		}
		const tools = groups.byPlugin.get(normalized);
		if (tools && tools.length > 0) {
			expanded.push(...tools);
			continue;
		}
		expanded.push(normalized);
	}
	return Array.from(new Set(expanded));
}
function expandPolicyWithPluginGroups(policy, groups) {
	if (!policy) return;
	return {
		allow: expandPluginGroups(policy.allow, groups),
		deny: expandPluginGroups(policy.deny, groups)
	};
}
function analyzeAllowlistByToolType(policy, groups, coreTools) {
	if (!policy?.allow || policy.allow.length === 0) return {
		policy,
		unknownAllowlist: [],
		pluginOnlyAllowlist: false
	};
	const normalized = normalizeToolList(policy.allow);
	if (normalized.length === 0) return {
		policy,
		unknownAllowlist: [],
		pluginOnlyAllowlist: false
	};
	const pluginIds = new Set(groups.byPlugin.keys());
	const pluginTools = new Set(groups.all);
	const unknownAllowlist = [];
	let hasOnlyPluginEntries = true;
	for (const entry of normalized) {
		if (entry === "*") {
			hasOnlyPluginEntries = false;
			continue;
		}
		const isPluginEntry = entry === "group:plugins" || pluginIds.has(entry) || pluginTools.has(entry);
		const isCoreEntry = expandToolGroups([entry]).some((tool) => coreTools.has(tool));
		if (!isPluginEntry) hasOnlyPluginEntries = false;
		if (!isCoreEntry && !isPluginEntry) unknownAllowlist.push(entry);
	}
	const pluginOnlyAllowlist = hasOnlyPluginEntries;
	return {
		policy,
		unknownAllowlist: Array.from(new Set(unknownAllowlist)),
		pluginOnlyAllowlist
	};
}
function mergeAlsoAllowPolicy(policy, alsoAllow) {
	if (!policy?.allow || !Array.isArray(alsoAllow) || alsoAllow.length === 0) return policy;
	return {
		...policy,
		allow: Array.from(new Set([...policy.allow, ...alsoAllow]))
	};
}
//#endregion
export { UPDATE_PLAN_TOOL_DISPLAY_SUMMARY as C, describeSessionsSendTool as D, describeSessionsListTool as E, describeSessionsSpawnTool as O, SESSION_STATUS_TOOL_DISPLAY_SUMMARY as S, describeSessionsHistoryTool as T, PROCESS_TOOL_DISPLAY_SUMMARY as _, expandPolicyWithPluginGroups as a, SESSIONS_SEND_TOOL_DISPLAY_SUMMARY as b, expandToolGroups as c, PROFILE_OPTIONS as d, isKnownCoreToolId as f, EXEC_TOOL_DISPLAY_SUMMARY as g, CRON_TOOL_DISPLAY_SUMMARY as h, collectExplicitAllowlist as i, describeUpdatePlanTool as k, normalizeToolName as l, resolveCoreToolProfiles as m, applyOwnerOnlyToolPolicy as n, mergeAlsoAllowPolicy as o, listCoreToolSections as p, buildPluginToolGroups as r, resolveOwnerOnlyToolApprovalClass as s, analyzeAllowlistByToolType as t, resolveToolProfilePolicy as u, SESSIONS_HISTORY_TOOL_DISPLAY_SUMMARY as v, describeSessionStatusTool as w, SESSIONS_SPAWN_TOOL_DISPLAY_SUMMARY as x, SESSIONS_LIST_TOOL_DISPLAY_SUMMARY as y };
