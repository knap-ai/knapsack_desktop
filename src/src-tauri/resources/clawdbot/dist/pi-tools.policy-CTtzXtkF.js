import { b as resolveThreadParentSessionKey, d as resolveAgentIdFromSessionKey } from "./session-key-DVvxnFKg.js";
import { n as resolveAgentConfig } from "./agent-scope-Bu62UIQZ.js";
import { r as normalizeChannelId } from "./plugins-DsHRVW6o.js";
import { l as normalizeMessageChannel } from "./message-channel-D-iPIX3C.js";
import { F as getChannelDock, z as resolveChannelGroupToolsPolicy } from "./sessions-DGtM0qOW.js";
import { _ as normalizeToolName, g as expandToolGroups } from "./sandbox-yPHyBnUy.js";

//#region src/config/commands.ts
function resolveAutoDefault(providerId) {
	const id = normalizeChannelId(providerId);
	if (!id) return false;
	if (id === "discord" || id === "telegram") return true;
	if (id === "slack") return false;
	return false;
}
function resolveNativeSkillsEnabled(params) {
	const { providerId, providerSetting, globalSetting } = params;
	const setting = providerSetting === void 0 ? globalSetting : providerSetting;
	if (setting === true) return true;
	if (setting === false) return false;
	return resolveAutoDefault(providerId);
}
function resolveNativeCommandsEnabled(params) {
	const { providerId, providerSetting, globalSetting } = params;
	const setting = providerSetting === void 0 ? globalSetting : providerSetting;
	if (setting === true) return true;
	if (setting === false) return false;
	return resolveAutoDefault(providerId);
}
function isNativeCommandsExplicitlyDisabled(params) {
	const { providerSetting, globalSetting } = params;
	if (providerSetting === false) return true;
	if (providerSetting === void 0) return globalSetting === false;
	return false;
}

//#endregion
//#region src/agents/pi-tools.policy.ts
function compilePattern(pattern) {
	const normalized = normalizeToolName(pattern);
	if (!normalized) return {
		kind: "exact",
		value: ""
	};
	if (normalized === "*") return { kind: "all" };
	if (!normalized.includes("*")) return {
		kind: "exact",
		value: normalized
	};
	const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return {
		kind: "regex",
		value: new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`)
	};
}
function compilePatterns(patterns) {
	if (!Array.isArray(patterns)) return [];
	return expandToolGroups(patterns).map(compilePattern).filter((pattern) => pattern.kind !== "exact" || pattern.value);
}
function matchesAny(name, patterns) {
	for (const pattern of patterns) {
		if (pattern.kind === "all") return true;
		if (pattern.kind === "exact" && name === pattern.value) return true;
		if (pattern.kind === "regex" && pattern.value.test(name)) return true;
	}
	return false;
}
function makeToolPolicyMatcher(policy) {
	const deny = compilePatterns(policy.deny);
	const allow = compilePatterns(policy.allow);
	return (name) => {
		const normalized = normalizeToolName(name);
		if (matchesAny(normalized, deny)) return false;
		if (allow.length === 0) return true;
		if (matchesAny(normalized, allow)) return true;
		if (normalized === "apply_patch" && matchesAny("exec", allow)) return true;
		return false;
	};
}
const DEFAULT_SUBAGENT_TOOL_DENY = [
	"sessions_list",
	"sessions_history",
	"sessions_send",
	"sessions_spawn",
	"gateway",
	"agents_list",
	"whatsapp_login",
	"session_status",
	"cron",
	"memory_search",
	"memory_get"
];
function resolveSubagentToolPolicy(cfg) {
	const configured = cfg?.tools?.subagents?.tools;
	const deny = [...DEFAULT_SUBAGENT_TOOL_DENY, ...Array.isArray(configured?.deny) ? configured.deny : []];
	return {
		allow: Array.isArray(configured?.allow) ? configured.allow : void 0,
		deny
	};
}
function isToolAllowedByPolicyName(name, policy) {
	if (!policy) return true;
	return makeToolPolicyMatcher(policy)(name);
}
function filterToolsByPolicy(tools, policy) {
	if (!policy) return tools;
	const matcher = makeToolPolicyMatcher(policy);
	return tools.filter((tool) => matcher(tool.name));
}
function unionAllow(base, extra) {
	if (!Array.isArray(extra) || extra.length === 0) return base;
	if (!Array.isArray(base) || base.length === 0) return Array.from(new Set(["*", ...extra]));
	return Array.from(new Set([...base, ...extra]));
}
function pickToolPolicy(config) {
	if (!config) return;
	const allow = Array.isArray(config.allow) ? unionAllow(config.allow, config.alsoAllow) : Array.isArray(config.alsoAllow) && config.alsoAllow.length > 0 ? unionAllow(void 0, config.alsoAllow) : void 0;
	const deny = Array.isArray(config.deny) ? config.deny : void 0;
	if (!allow && !deny) return;
	return {
		allow,
		deny
	};
}
function normalizeProviderKey(value) {
	return value.trim().toLowerCase();
}
function resolveGroupContextFromSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return {};
	const parts = (resolveThreadParentSessionKey(raw) ?? raw).split(":").filter(Boolean);
	let body = parts[0] === "agent" ? parts.slice(2) : parts;
	if (body[0] === "subagent") body = body.slice(1);
	if (body.length < 3) return {};
	const [channel, kind, ...rest] = body;
	if (kind !== "group" && kind !== "channel") return {};
	const groupId = rest.join(":").trim();
	if (!groupId) return {};
	return {
		channel: channel.trim().toLowerCase(),
		groupId
	};
}
function resolveProviderToolPolicy(params) {
	const provider = params.modelProvider?.trim();
	if (!provider || !params.byProvider) return;
	const entries = Object.entries(params.byProvider);
	if (entries.length === 0) return;
	const lookup = /* @__PURE__ */ new Map();
	for (const [key, value] of entries) {
		const normalized = normalizeProviderKey(key);
		if (!normalized) continue;
		lookup.set(normalized, value);
	}
	const normalizedProvider = normalizeProviderKey(provider);
	const rawModelId = params.modelId?.trim().toLowerCase();
	const fullModelId = rawModelId && !rawModelId.includes("/") ? `${normalizedProvider}/${rawModelId}` : rawModelId;
	const candidates = [...fullModelId ? [fullModelId] : [], normalizedProvider];
	for (const key of candidates) {
		const match = lookup.get(key);
		if (match) return match;
	}
}
function resolveEffectiveToolPolicy(params) {
	const agentId = params.sessionKey ? resolveAgentIdFromSessionKey(params.sessionKey) : void 0;
	const agentTools = (params.config && agentId ? resolveAgentConfig(params.config, agentId) : void 0)?.tools;
	const globalTools = params.config?.tools;
	const profile = agentTools?.profile ?? globalTools?.profile;
	const providerPolicy = resolveProviderToolPolicy({
		byProvider: globalTools?.byProvider,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	const agentProviderPolicy = resolveProviderToolPolicy({
		byProvider: agentTools?.byProvider,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	return {
		agentId,
		globalPolicy: pickToolPolicy(globalTools),
		globalProviderPolicy: pickToolPolicy(providerPolicy),
		agentPolicy: pickToolPolicy(agentTools),
		agentProviderPolicy: pickToolPolicy(agentProviderPolicy),
		profile,
		providerProfile: agentProviderPolicy?.profile ?? providerPolicy?.profile,
		profileAlsoAllow: Array.isArray(agentTools?.alsoAllow) ? agentTools?.alsoAllow : Array.isArray(globalTools?.alsoAllow) ? globalTools?.alsoAllow : void 0,
		providerProfileAlsoAllow: Array.isArray(agentProviderPolicy?.alsoAllow) ? agentProviderPolicy?.alsoAllow : Array.isArray(providerPolicy?.alsoAllow) ? providerPolicy?.alsoAllow : void 0
	};
}
function resolveGroupToolPolicy(params) {
	if (!params.config) return;
	const sessionContext = resolveGroupContextFromSessionKey(params.sessionKey);
	const spawnedContext = resolveGroupContextFromSessionKey(params.spawnedBy);
	const groupId = params.groupId ?? sessionContext.groupId ?? spawnedContext.groupId;
	if (!groupId) return;
	const channel = normalizeMessageChannel(params.messageProvider ?? sessionContext.channel ?? spawnedContext.channel);
	if (!channel) return;
	let dock;
	try {
		dock = getChannelDock(channel);
	} catch {
		dock = void 0;
	}
	return pickToolPolicy(dock?.groups?.resolveToolPolicy?.({
		cfg: params.config,
		groupId,
		groupChannel: params.groupChannel,
		groupSpace: params.groupSpace,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	}) ?? resolveChannelGroupToolsPolicy({
		cfg: params.config,
		channel,
		groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	}));
}
function isToolAllowedByPolicies(name, policies) {
	return policies.every((policy) => isToolAllowedByPolicyName(name, policy));
}

//#endregion
export { resolveSubagentToolPolicy as a, resolveNativeSkillsEnabled as c, resolveGroupToolPolicy as i, isToolAllowedByPolicies as n, isNativeCommandsExplicitlyDisabled as o, resolveEffectiveToolPolicy as r, resolveNativeCommandsEnabled as s, filterToolsByPolicy as t };