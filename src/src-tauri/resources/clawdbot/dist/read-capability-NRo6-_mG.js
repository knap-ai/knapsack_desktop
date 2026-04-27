import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { m as resolveUserPath } from "./utils-BMRcljdi.js";
import { l as normalizeWindowsPathForComparison } from "./boundary-path-C2iMx2xR.js";
import { c as parseThreadSessionSuffix, s as parseRawSessionConversationRef } from "./session-key-utils-BT0y7mVK.js";
import { c as normalizeAgentId, u as resolveAgentIdFromSessionKey } from "./session-key-EpIbK3Oz.js";
import { n as getLoadedChannelPlugin } from "./registry-B2TRwbJD.js";
import { _ as resolveAgentConfig, b as resolveAgentWorkspaceDir } from "./agent-scope-_6dFncNS.js";
import { u as normalizeMessageChannel } from "./message-channel-C2Lnao8s.js";
import "./plugins-BZ_I3cWH.js";
import { t as resolveSessionConversation } from "./session-conversation-Dm8mOmqO.js";
import { p as normalizeToolName } from "./tool-policy-DArLXMH2.js";
import { d as readLocalFileSafely } from "./fs-safe-CezDxq3P.js";
import { i as resolveSandboxInputPath } from "./sandbox-paths-11MZW8so.js";
import { t as pickSandboxToolPolicy } from "./sandbox-tool-policy-C5pCxrLz.js";
import { n as isToolAllowedByPolicyName, t as isToolAllowedByPolicies } from "./tool-policy-match-D8_CHZdx.js";
import { n as resolveEffectiveToolFsRootExpansionAllowed } from "./tool-fs-policy-rAagG_0W.js";
import { i as getAgentScopedMediaLocalRootsForSources, r as getAgentScopedMediaLocalRoots } from "./local-roots-BT2K9A8q.js";
import { r as resolveChannelGroupToolsPolicy } from "./group-policy-CDJmvoGe.js";
import { i as resolveSubagentCapabilityStore, n as resolveStoredSubagentCapabilities } from "./subagent-capabilities-XxJhf1t-.js";
import path from "node:path";
//#region src/agents/path-policy.ts
function throwPathEscapesBoundary(params) {
	const boundary = params.options?.boundaryLabel ?? "workspace root";
	const suffix = params.options?.includeRootInError ? ` (${params.rootResolved})` : "";
	throw new Error(`Path escapes ${boundary}${suffix}: ${params.candidate}`);
}
function validateRelativePathWithinBoundary(params) {
	if (params.relativePath === "" || params.relativePath === ".") {
		if (params.options?.allowRoot) return "";
		throwPathEscapesBoundary({
			options: params.options,
			rootResolved: params.rootResolved,
			candidate: params.candidate
		});
	}
	if (params.relativePath.startsWith("..") || params.isAbsolutePath(params.relativePath)) throwPathEscapesBoundary({
		options: params.options,
		rootResolved: params.rootResolved,
		candidate: params.candidate
	});
	return params.relativePath;
}
function toRelativePathUnderRoot(params) {
	const resolvedInput = resolveSandboxInputPath(params.candidate, params.options?.cwd ?? params.root);
	if (process.platform === "win32") {
		const rootResolved = path.win32.resolve(params.root);
		const resolvedCandidate = path.win32.resolve(resolvedInput);
		const rootForCompare = normalizeWindowsPathForComparison(rootResolved);
		const targetForCompare = normalizeWindowsPathForComparison(resolvedCandidate);
		return validateRelativePathWithinBoundary({
			relativePath: path.win32.relative(rootForCompare, targetForCompare),
			isAbsolutePath: path.win32.isAbsolute,
			options: params.options,
			rootResolved,
			candidate: params.candidate
		});
	}
	const rootResolved = path.resolve(params.root);
	const resolvedCandidate = path.resolve(resolvedInput);
	return validateRelativePathWithinBoundary({
		relativePath: path.relative(rootResolved, resolvedCandidate),
		isAbsolutePath: path.isAbsolute,
		options: params.options,
		rootResolved,
		candidate: params.candidate
	});
}
function toRelativeBoundaryPath(params) {
	return toRelativePathUnderRoot({
		root: params.root,
		candidate: params.candidate,
		options: {
			allowRoot: params.options?.allowRoot,
			cwd: params.options?.cwd,
			boundaryLabel: params.boundaryLabel,
			includeRootInError: params.includeRootInError
		}
	});
}
function toRelativeWorkspacePath(root, candidate, options) {
	return toRelativeBoundaryPath({
		root,
		candidate,
		options,
		boundaryLabel: "workspace root"
	});
}
function toRelativeSandboxPath(root, candidate, options) {
	return toRelativeBoundaryPath({
		root,
		candidate,
		options,
		boundaryLabel: "sandbox root",
		includeRootInError: true
	});
}
function resolvePathFromInput(filePath, cwd) {
	return path.normalize(resolveSandboxInputPath(filePath, cwd));
}
//#endregion
//#region src/agents/workspace-dir.ts
function normalizeWorkspaceDir(workspaceDir) {
	const trimmed = workspaceDir?.trim();
	if (!trimmed) return null;
	const expanded = trimmed.startsWith("~") ? resolveUserPath(trimmed) : trimmed;
	const resolved = path.resolve(expanded);
	if (resolved === path.parse(resolved).root) return null;
	return resolved;
}
function resolveWorkspaceRoot(workspaceDir) {
	return normalizeWorkspaceDir(workspaceDir) ?? process.cwd();
}
//#endregion
//#region src/agents/pi-tools.policy.ts
/**
* Tools always denied for sub-agents regardless of depth.
* These are system-level or interactive tools that sub-agents should never use.
*/
const SUBAGENT_TOOL_DENY_ALWAYS = [
	"gateway",
	"agents_list",
	"session_status",
	"cron",
	"sessions_send"
];
/**
* Additional tools denied for leaf sub-agents (depth >= maxSpawnDepth).
* These are tools that only make sense for orchestrator sub-agents that can spawn children.
*/
const SUBAGENT_TOOL_DENY_LEAF = [
	"subagents",
	"sessions_list",
	"sessions_history",
	"sessions_spawn"
];
function resolveSubagentDenyListForRole(role) {
	if (role === "leaf") return [...SUBAGENT_TOOL_DENY_ALWAYS, ...SUBAGENT_TOOL_DENY_LEAF];
	return [...SUBAGENT_TOOL_DENY_ALWAYS];
}
function resolveSubagentToolPolicyForSession(cfg, sessionKey, opts) {
	const configured = cfg?.tools?.subagents?.tools;
	const capabilities = resolveStoredSubagentCapabilities(sessionKey, {
		cfg,
		store: resolveSubagentCapabilityStore(sessionKey, {
			cfg,
			store: opts?.store
		})
	});
	const allow = Array.isArray(configured?.allow) ? configured.allow : void 0;
	const alsoAllow = Array.isArray(configured?.alsoAllow) ? configured.alsoAllow : void 0;
	const explicitAllow = new Set([...allow ?? [], ...alsoAllow ?? []].map((toolName) => normalizeToolName(toolName)));
	const deny = [...resolveSubagentDenyListForRole(capabilities.role).filter((toolName) => !explicitAllow.has(normalizeToolName(toolName))), ...Array.isArray(configured?.deny) ? configured.deny : []];
	return {
		allow: allow && alsoAllow ? Array.from(new Set([...allow, ...alsoAllow])) : allow,
		deny
	};
}
function filterToolsByPolicy(tools, policy) {
	if (!policy) return tools;
	return tools.filter((tool) => isToolAllowedByPolicyName(tool.name, policy));
}
function normalizeProviderKey(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function collectUniqueStrings(values) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const value of values) {
		const trimmed = value?.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		resolved.push(trimmed);
	}
	return resolved;
}
function buildScopedGroupIdCandidates(groupId) {
	const raw = groupId?.trim();
	if (!raw) return [];
	const topicSenderMatch = raw.match(/^(.+):topic:([^:]+):sender:([^:]+)$/i);
	if (topicSenderMatch) {
		const [, chatId, topicId] = topicSenderMatch;
		return collectUniqueStrings([
			raw,
			`${chatId}:topic:${topicId}`,
			chatId
		]);
	}
	const topicMatch = raw.match(/^(.+):topic:([^:]+)$/i);
	if (topicMatch) {
		const [, chatId, topicId] = topicMatch;
		return collectUniqueStrings([`${chatId}:topic:${topicId}`, chatId]);
	}
	const senderMatch = raw.match(/^(.+):sender:([^:]+)$/i);
	if (senderMatch) {
		const [, chatId] = senderMatch;
		return collectUniqueStrings([raw, chatId]);
	}
	return [raw];
}
function resolveGroupContextFromSessionKey(sessionKey) {
	const raw = (sessionKey ?? "").trim();
	if (!raw) return {};
	const { baseSessionKey, threadId } = parseThreadSessionSuffix(raw);
	const conversationKey = threadId ? baseSessionKey : raw;
	const conversation = parseRawSessionConversationRef(conversationKey);
	if (conversation) {
		const resolvedConversation = /:(?:sender|thread|topic):/iu.test(conversation.rawId) ? resolveSessionConversation({
			channel: conversation.channel,
			kind: conversation.kind,
			rawId: conversation.rawId
		}) : null;
		return {
			channel: conversation.channel,
			groupIds: collectUniqueStrings([
				...buildScopedGroupIdCandidates(conversation.rawId),
				resolvedConversation?.id,
				resolvedConversation?.baseConversationId,
				...resolvedConversation?.parentConversationCandidates ?? []
			])
		};
	}
	const parts = (conversationKey ?? raw).split(":").filter(Boolean);
	let body = parts[0] === "agent" ? parts.slice(2) : parts;
	if (body[0] === "subagent") body = body.slice(1);
	if (body.length < 3) return {};
	const [channel, kind, ...rest] = body;
	if (kind !== "group" && kind !== "channel") return {};
	const groupId = rest.join(":").trim();
	if (!groupId) return {};
	return {
		channel: normalizeLowercaseStringOrEmpty(channel),
		groupIds: buildScopedGroupIdCandidates(groupId)
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
	const rawModelId = normalizeOptionalLowercaseString(params.modelId);
	const fullModelId = rawModelId && !rawModelId.includes("/") ? `${normalizedProvider}/${rawModelId}` : rawModelId;
	const candidates = [...fullModelId ? [fullModelId] : [], normalizedProvider];
	for (const key of candidates) {
		const match = lookup.get(key);
		if (match) return match;
	}
}
function resolveExplicitProfileAlsoAllow(tools) {
	return Array.isArray(tools?.alsoAllow) ? tools.alsoAllow : void 0;
}
function hasExplicitToolSection(section) {
	return section !== void 0 && section !== null;
}
function resolveImplicitProfileAlsoAllow(params) {
	const implicit = /* @__PURE__ */ new Set();
	if (hasExplicitToolSection(params.agentTools?.exec) || hasExplicitToolSection(params.globalTools?.exec)) {
		implicit.add("exec");
		implicit.add("process");
	}
	if (hasExplicitToolSection(params.agentTools?.fs) || hasExplicitToolSection(params.globalTools?.fs)) {
		implicit.add("read");
		implicit.add("write");
		implicit.add("edit");
	}
	return implicit.size > 0 ? Array.from(implicit) : void 0;
}
function resolveEffectiveToolPolicy(params) {
	const agentId = (typeof params.agentId === "string" && params.agentId.trim() ? normalizeAgentId(params.agentId) : void 0) ?? (params.sessionKey ? resolveAgentIdFromSessionKey(params.sessionKey) : void 0);
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
	const explicitProfileAlsoAllow = resolveExplicitProfileAlsoAllow(agentTools) ?? resolveExplicitProfileAlsoAllow(globalTools);
	const implicitProfileAlsoAllow = resolveImplicitProfileAlsoAllow({
		globalTools,
		agentTools
	});
	const profileAlsoAllow = explicitProfileAlsoAllow || implicitProfileAlsoAllow ? Array.from(new Set([...explicitProfileAlsoAllow ?? [], ...implicitProfileAlsoAllow ?? []])) : void 0;
	return {
		agentId,
		globalPolicy: pickSandboxToolPolicy(globalTools),
		globalProviderPolicy: pickSandboxToolPolicy(providerPolicy),
		agentPolicy: pickSandboxToolPolicy(agentTools),
		agentProviderPolicy: pickSandboxToolPolicy(agentProviderPolicy),
		profile,
		providerProfile: agentProviderPolicy?.profile ?? providerPolicy?.profile,
		profileAlsoAllow,
		providerProfileAlsoAllow: Array.isArray(agentProviderPolicy?.alsoAllow) ? agentProviderPolicy?.alsoAllow : Array.isArray(providerPolicy?.alsoAllow) ? providerPolicy?.alsoAllow : void 0
	};
}
function resolveGroupToolPolicy(params) {
	if (!params.config) return;
	const sessionContext = resolveGroupContextFromSessionKey(params.sessionKey);
	const spawnedContext = resolveGroupContextFromSessionKey(params.spawnedBy);
	const groupIds = collectUniqueStrings([
		...buildScopedGroupIdCandidates(params.groupId),
		...sessionContext.groupIds ?? [],
		...spawnedContext.groupIds ?? []
	]);
	if (groupIds.length === 0) return;
	const channel = normalizeMessageChannel(params.messageProvider ?? sessionContext.channel ?? spawnedContext.channel);
	if (!channel) return;
	let plugin;
	try {
		plugin = getLoadedChannelPlugin(channel);
	} catch {
		plugin = void 0;
	}
	for (const groupId of groupIds) {
		const toolsConfig = plugin?.groups?.resolveToolPolicy?.({
			cfg: params.config,
			groupId,
			groupChannel: params.groupChannel,
			groupSpace: params.groupSpace,
			accountId: params.accountId,
			senderId: params.senderId,
			senderName: params.senderName,
			senderUsername: params.senderUsername,
			senderE164: params.senderE164
		});
		const policy = pickSandboxToolPolicy(toolsConfig);
		if (policy) return policy;
	}
	return pickSandboxToolPolicy(resolveChannelGroupToolsPolicy({
		cfg: params.config,
		channel,
		groupId: groupIds[0],
		groupIdCandidates: groupIds.slice(1),
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	}));
}
//#endregion
//#region src/media/read-capability.ts
function isAgentScopedHostMediaReadAllowed(params) {
	if (!resolveEffectiveToolFsRootExpansionAllowed({
		cfg: params.cfg,
		agentId: params.agentId
	})) return false;
	const groupPolicy = resolveGroupToolPolicy({
		config: params.cfg,
		sessionKey: params.sessionKey,
		messageProvider: params.messageProvider,
		groupId: params.groupId,
		groupChannel: params.groupChannel,
		groupSpace: params.groupSpace,
		accountId: params.accountId,
		senderId: normalizeOptionalString(params.requesterSenderId),
		senderName: normalizeOptionalString(params.requesterSenderName),
		senderUsername: normalizeOptionalString(params.requesterSenderUsername),
		senderE164: normalizeOptionalString(params.requesterSenderE164)
	});
	if (groupPolicy && !isToolAllowedByPolicies("read", [groupPolicy])) return false;
	return true;
}
function createAgentScopedHostMediaReadFile(params) {
	if (!isAgentScopedHostMediaReadAllowed(params)) return;
	const workspaceRoot = resolveWorkspaceRoot(params.workspaceDir ?? (params.agentId ? resolveAgentWorkspaceDir(params.cfg, params.agentId) : void 0));
	return async (filePath) => {
		return (await readLocalFileSafely({ filePath: resolvePathFromInput(filePath, workspaceRoot) })).buffer;
	};
}
function resolveAgentScopedOutboundMediaAccess(params) {
	const hostMediaReadAllowed = isAgentScopedHostMediaReadAllowed(params);
	const localRoots = params.mediaAccess?.localRoots ?? (hostMediaReadAllowed ? getAgentScopedMediaLocalRootsForSources({
		cfg: params.cfg,
		agentId: params.agentId,
		mediaSources: params.mediaSources
	}) : getAgentScopedMediaLocalRoots(params.cfg, params.agentId));
	const resolvedWorkspaceDir = params.workspaceDir ?? params.mediaAccess?.workspaceDir ?? (params.agentId ? resolveAgentWorkspaceDir(params.cfg, params.agentId) : void 0);
	const readFile = params.mediaAccess?.readFile ?? params.mediaReadFile ?? (hostMediaReadAllowed ? createAgentScopedHostMediaReadFile({
		cfg: params.cfg,
		agentId: params.agentId,
		workspaceDir: resolvedWorkspaceDir,
		sessionKey: params.sessionKey,
		messageProvider: params.messageProvider,
		groupId: params.groupId,
		groupChannel: params.groupChannel,
		groupSpace: params.groupSpace,
		accountId: params.accountId,
		requesterSenderId: params.requesterSenderId,
		requesterSenderName: params.requesterSenderName,
		requesterSenderUsername: params.requesterSenderUsername,
		requesterSenderE164: params.requesterSenderE164
	}) : void 0);
	return {
		...localRoots?.length ? { localRoots } : {},
		...readFile ? { readFile } : {},
		...resolvedWorkspaceDir ? { workspaceDir: resolvedWorkspaceDir } : {}
	};
}
//#endregion
export { resolveGroupToolPolicy as a, resolveWorkspaceRoot as c, toRelativeWorkspacePath as d, resolveGroupContextFromSessionKey as i, resolvePathFromInput as l, filterToolsByPolicy as n, resolveSubagentToolPolicyForSession as o, resolveEffectiveToolPolicy as r, normalizeWorkspaceDir as s, resolveAgentScopedOutboundMediaAccess as t, toRelativeSandboxPath as u };
