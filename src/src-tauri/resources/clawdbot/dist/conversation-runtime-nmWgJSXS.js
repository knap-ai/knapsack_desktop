import { v as expandHomePrefix } from "./paths-ViKUYWUK.js";
import { a as logVerbose } from "./globals-DBUMOBZ8.js";
import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { n as resolveGlobalSingleton, t as resolveGlobalMap } from "./global-singleton-D9TlHTN5.js";
import { _ as normalizeAccountId, f as sanitizeAgentId, u as resolveAgentIdFromSessionKey } from "./session-key-DAhnzjyr.js";
import { i as resolveAgentConfig, m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { a as recordSessionMetaFromInbound, c as updateLastRoute } from "./store-C5UK26Ce.js";
import { r as getActivePluginRegistryVersion, t as getActivePluginRegistry } from "./runtime-Iz8uZ7EU.js";
import { s as getChannelPlugin } from "./plugins-B09-vgme.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { r as writeJsonAtomic } from "./json-files-2-D1jkJB.js";
import { r as listConfiguredBindings } from "./bindings-YfRKkWOL.js";
import { n as deriveLastRoutePolicy, r as pickFirstExistingAgentId } from "./resolve-route-DwFWP4JW.js";
import { m as resolveAcpAgentFromSessionKey, n as readAcpSessionEntry, t as getAcpSessionManager } from "./manager-Bw8JrihM.js";
import { r as prefixSystemMessage } from "./system-message-C205nJsr.js";
import fs from "node:fs";
import path from "node:path";
import crypto, { createHash } from "node:crypto";
//#region src/channels/plugins/threading-helpers.ts
function createStaticReplyToModeResolver(mode) {
	return () => mode;
}
function createTopLevelChannelReplyToModeResolver(channelId) {
	return ({ cfg }) => {
		return (cfg.channels?.[channelId])?.replyToMode ?? "off";
	};
}
function createScopedAccountReplyToModeResolver(params) {
	return ({ cfg, accountId, chatType }) => params.resolveReplyToMode(params.resolveAccount(cfg, accountId), chatType) ?? params.fallback ?? "off";
}
//#endregion
//#region src/infra/outbound/session-binding-service.ts
var SessionBindingError = class extends Error {
	constructor(code, message, details) {
		super(message);
		this.code = code;
		this.details = details;
		this.name = "SessionBindingError";
	}
};
function isSessionBindingError(error) {
	return error instanceof SessionBindingError;
}
function normalizeConversationRef(ref) {
	return {
		channel: ref.channel.trim().toLowerCase(),
		accountId: normalizeAccountId(ref.accountId),
		conversationId: ref.conversationId.trim(),
		parentConversationId: ref.parentConversationId?.trim() || void 0
	};
}
function toAdapterKey(params) {
	return `${params.channel.trim().toLowerCase()}:${normalizeAccountId(params.accountId)}`;
}
function normalizePlacement(raw) {
	return raw === "current" || raw === "child" ? raw : void 0;
}
function inferDefaultPlacement(ref) {
	return ref.conversationId ? "current" : "child";
}
function resolveAdapterPlacements(adapter) {
	const placements = (adapter.capabilities?.placements?.map((value) => normalizePlacement(value)))?.filter((value) => Boolean(value));
	if (placements && placements.length > 0) return [...new Set(placements)];
	return ["current", "child"];
}
function resolveAdapterCapabilities(adapter) {
	if (!adapter) return {
		adapterAvailable: false,
		bindSupported: false,
		unbindSupported: false,
		placements: []
	};
	const bindSupported = adapter.capabilities?.bindSupported ?? Boolean(adapter.bind);
	return {
		adapterAvailable: true,
		bindSupported,
		unbindSupported: adapter.capabilities?.unbindSupported ?? Boolean(adapter.unbind),
		placements: bindSupported ? resolveAdapterPlacements(adapter) : []
	};
}
const ADAPTERS_BY_CHANNEL_ACCOUNT = resolveGlobalMap(Symbol.for("openclaw.sessionBinding.adapters"));
function getActiveAdapterForKey(key) {
	return ADAPTERS_BY_CHANNEL_ACCOUNT.get(key)?.[0]?.normalizedAdapter ?? null;
}
function registerSessionBindingAdapter(adapter) {
	const normalizedAdapter = {
		...adapter,
		channel: adapter.channel.trim().toLowerCase(),
		accountId: normalizeAccountId(adapter.accountId)
	};
	const key = toAdapterKey({
		channel: normalizedAdapter.channel,
		accountId: normalizedAdapter.accountId
	});
	const existing = ADAPTERS_BY_CHANNEL_ACCOUNT.get(key);
	const registrations = existing ? [...existing] : [];
	registrations.push({
		adapter,
		normalizedAdapter
	});
	ADAPTERS_BY_CHANNEL_ACCOUNT.set(key, registrations);
}
function unregisterSessionBindingAdapter(params) {
	const key = toAdapterKey(params);
	const registrations = ADAPTERS_BY_CHANNEL_ACCOUNT.get(key);
	if (!registrations || registrations.length === 0) return;
	const nextRegistrations = [...registrations];
	if (params.adapter) {
		const registrationIndex = nextRegistrations.findLastIndex((registration) => registration.adapter === params.adapter);
		if (registrationIndex < 0) return;
		nextRegistrations.splice(registrationIndex, 1);
	} else nextRegistrations.pop();
	if (nextRegistrations.length === 0) {
		ADAPTERS_BY_CHANNEL_ACCOUNT.delete(key);
		return;
	}
	ADAPTERS_BY_CHANNEL_ACCOUNT.set(key, nextRegistrations);
}
function resolveAdapterForConversation(ref) {
	return resolveAdapterForChannelAccount({
		channel: ref.channel,
		accountId: ref.accountId
	});
}
function resolveAdapterForChannelAccount(params) {
	return getActiveAdapterForKey(toAdapterKey({
		channel: params.channel,
		accountId: params.accountId
	}));
}
function getActiveRegisteredAdapters() {
	return [...ADAPTERS_BY_CHANNEL_ACCOUNT.values()].map((registrations) => registrations[0]?.normalizedAdapter ?? null).filter((adapter) => Boolean(adapter));
}
function dedupeBindings(records) {
	const byId = /* @__PURE__ */ new Map();
	for (const record of records) {
		if (!record?.bindingId) continue;
		byId.set(record.bindingId, record);
	}
	return [...byId.values()];
}
function createDefaultSessionBindingService() {
	return {
		bind: async (input) => {
			const normalizedConversation = normalizeConversationRef(input.conversation);
			const adapter = resolveAdapterForConversation(normalizedConversation);
			if (!adapter) throw new SessionBindingError("BINDING_ADAPTER_UNAVAILABLE", `Session binding adapter unavailable for ${normalizedConversation.channel}:${normalizedConversation.accountId}`, {
				channel: normalizedConversation.channel,
				accountId: normalizedConversation.accountId
			});
			if (!adapter.bind) throw new SessionBindingError("BINDING_CAPABILITY_UNSUPPORTED", `Session binding adapter does not support binding for ${normalizedConversation.channel}:${normalizedConversation.accountId}`, {
				channel: normalizedConversation.channel,
				accountId: normalizedConversation.accountId
			});
			const placement = normalizePlacement(input.placement) ?? inferDefaultPlacement(normalizedConversation);
			if (!resolveAdapterPlacements(adapter).includes(placement)) throw new SessionBindingError("BINDING_CAPABILITY_UNSUPPORTED", `Session binding placement "${placement}" is not supported for ${normalizedConversation.channel}:${normalizedConversation.accountId}`, {
				channel: normalizedConversation.channel,
				accountId: normalizedConversation.accountId,
				placement
			});
			const bound = await adapter.bind({
				...input,
				conversation: normalizedConversation,
				placement
			});
			if (!bound) throw new SessionBindingError("BINDING_CREATE_FAILED", "Session binding adapter failed to bind target conversation", {
				channel: normalizedConversation.channel,
				accountId: normalizedConversation.accountId,
				placement
			});
			return bound;
		},
		getCapabilities: (params) => {
			return resolveAdapterCapabilities(resolveAdapterForChannelAccount({
				channel: params.channel,
				accountId: params.accountId
			}));
		},
		listBySession: (targetSessionKey) => {
			const key = targetSessionKey.trim();
			if (!key) return [];
			const results = [];
			for (const adapter of getActiveRegisteredAdapters()) {
				const entries = adapter.listBySession(key);
				if (entries.length > 0) results.push(...entries);
			}
			return dedupeBindings(results);
		},
		resolveByConversation: (ref) => {
			const normalized = normalizeConversationRef(ref);
			if (!normalized.channel || !normalized.conversationId) return null;
			const adapter = resolveAdapterForConversation(normalized);
			if (!adapter) return null;
			return adapter.resolveByConversation(normalized);
		},
		touch: (bindingId, at) => {
			const normalizedBindingId = bindingId.trim();
			if (!normalizedBindingId) return;
			for (const adapter of getActiveRegisteredAdapters()) adapter.touch?.(normalizedBindingId, at);
		},
		unbind: async (input) => {
			const removed = [];
			for (const adapter of getActiveRegisteredAdapters()) {
				if (!adapter.unbind) continue;
				const entries = await adapter.unbind(input);
				if (entries.length > 0) removed.push(...entries);
			}
			return dedupeBindings(removed);
		}
	};
}
const DEFAULT_SESSION_BINDING_SERVICE = createDefaultSessionBindingService();
function getSessionBindingService() {
	return DEFAULT_SESSION_BINDING_SERVICE;
}
//#endregion
//#region src/bindings/records.ts
async function createConversationBindingRecord(input) {
	return await getSessionBindingService().bind(input);
}
function getConversationBindingCapabilities(params) {
	return getSessionBindingService().getCapabilities(params);
}
function listSessionBindingRecords(targetSessionKey) {
	return getSessionBindingService().listBySession(targetSessionKey);
}
function resolveConversationBindingRecord(conversation) {
	return getSessionBindingService().resolveByConversation(conversation);
}
function touchConversationBindingRecord(bindingId, at) {
	const service = getSessionBindingService();
	if (typeof at === "number") {
		service.touch(bindingId, at);
		return;
	}
	service.touch(bindingId);
}
async function unbindConversationBindingRecord(input) {
	return await getSessionBindingService().unbind(input);
}
//#endregion
//#region src/plugins/conversation-binding.ts
const log = createSubsystemLogger("plugins/binding");
const APPROVALS_PATH = "~/.openclaw/plugin-binding-approvals.json";
const PLUGIN_BINDING_CUSTOM_ID_PREFIX = "pluginbind";
const PLUGIN_BINDING_OWNER = "plugin";
const PLUGIN_BINDING_SESSION_PREFIX = "plugin-binding";
const LEGACY_CODEX_PLUGIN_SESSION_PREFIXES = ["openclaw-app-server:thread:", "openclaw-codex-app-server:thread:"];
const pendingRequests = resolveGlobalMap(Symbol.for("openclaw.pluginBindingPendingRequests"));
const pluginBindingGlobalState = resolveGlobalSingleton(Symbol.for("openclaw.plugins.binding.global-state"), () => ({
	fallbackNoticeBindingIds: /* @__PURE__ */ new Set(),
	approvalsCache: null,
	approvalsLoaded: false
}));
function getPluginBindingGlobalState() {
	return pluginBindingGlobalState;
}
function resolveApprovalsPath() {
	return expandHomePrefix(APPROVALS_PATH);
}
function normalizeChannel(value) {
	return value.trim().toLowerCase();
}
function normalizeConversation(params) {
	return {
		channel: normalizeChannel(params.channel),
		accountId: params.accountId.trim() || "default",
		conversationId: params.conversationId.trim(),
		parentConversationId: params.parentConversationId?.trim() || void 0,
		threadId: typeof params.threadId === "number" ? Math.trunc(params.threadId) : params.threadId?.toString().trim() || void 0
	};
}
function toConversationRef(params) {
	const normalized = normalizeConversation(params);
	if (normalized.channel === "telegram") {
		const threadId = typeof normalized.threadId === "number" || typeof normalized.threadId === "string" ? String(normalized.threadId).trim() : "";
		if (threadId) {
			const parent = normalized.parentConversationId?.trim() || normalized.conversationId;
			return {
				channel: "telegram",
				accountId: normalized.accountId,
				conversationId: `${parent}:topic:${threadId}`
			};
		}
	}
	return {
		channel: normalized.channel,
		accountId: normalized.accountId,
		conversationId: normalized.conversationId,
		...normalized.parentConversationId ? { parentConversationId: normalized.parentConversationId } : {}
	};
}
function buildApprovalScopeKey(params) {
	return [
		params.pluginRoot,
		normalizeChannel(params.channel),
		params.accountId.trim() || "default"
	].join("::");
}
function buildPluginBindingSessionKey(params) {
	const hash = crypto.createHash("sha256").update(JSON.stringify({
		pluginId: params.pluginId,
		channel: normalizeChannel(params.channel),
		accountId: params.accountId,
		conversationId: params.conversationId
	})).digest("hex").slice(0, 24);
	return `${PLUGIN_BINDING_SESSION_PREFIX}:${params.pluginId}:${hash}`;
}
function isLegacyPluginBindingRecord(params) {
	if (!params.record || isPluginOwnedBindingMetadata(params.record.metadata)) return false;
	const targetSessionKey = params.record.targetSessionKey.trim();
	return targetSessionKey.startsWith(`${PLUGIN_BINDING_SESSION_PREFIX}:`) || LEGACY_CODEX_PLUGIN_SESSION_PREFIXES.some((prefix) => targetSessionKey.startsWith(prefix));
}
function buildApprovalInteractiveReply(approvalId) {
	return { blocks: [{
		type: "buttons",
		buttons: [
			{
				label: "Allow once",
				value: buildPluginBindingApprovalCustomId(approvalId, "allow-once"),
				style: "success"
			},
			{
				label: "Always allow",
				value: buildPluginBindingApprovalCustomId(approvalId, "allow-always"),
				style: "primary"
			},
			{
				label: "Deny",
				value: buildPluginBindingApprovalCustomId(approvalId, "deny"),
				style: "danger"
			}
		]
	}] };
}
function createApprovalRequestId() {
	return crypto.randomBytes(9).toString("base64url");
}
function loadApprovalsFromDisk() {
	const filePath = resolveApprovalsPath();
	try {
		if (!fs.existsSync(filePath)) return {
			version: 1,
			approvals: []
		};
		const raw = fs.readFileSync(filePath, "utf8");
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed.approvals)) return {
			version: 1,
			approvals: []
		};
		return {
			version: 1,
			approvals: parsed.approvals.filter((entry) => Boolean(entry && typeof entry === "object")).map((entry) => ({
				pluginRoot: typeof entry.pluginRoot === "string" ? entry.pluginRoot : "",
				pluginId: typeof entry.pluginId === "string" ? entry.pluginId : "",
				pluginName: typeof entry.pluginName === "string" ? entry.pluginName : void 0,
				channel: typeof entry.channel === "string" ? normalizeChannel(entry.channel) : "",
				accountId: typeof entry.accountId === "string" ? entry.accountId.trim() || "default" : "default",
				approvedAt: typeof entry.approvedAt === "number" && Number.isFinite(entry.approvedAt) ? Math.floor(entry.approvedAt) : Date.now()
			})).filter((entry) => entry.pluginRoot && entry.pluginId && entry.channel)
		};
	} catch (error) {
		log.warn(`plugin binding approvals load failed: ${String(error)}`);
		return {
			version: 1,
			approvals: []
		};
	}
}
async function saveApprovals(file) {
	const filePath = resolveApprovalsPath();
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const state = getPluginBindingGlobalState();
	state.approvalsCache = file;
	state.approvalsLoaded = true;
	await writeJsonAtomic(filePath, file, {
		mode: 384,
		trailingNewline: true
	});
}
function getApprovals() {
	const state = getPluginBindingGlobalState();
	if (!state.approvalsLoaded || !state.approvalsCache) {
		state.approvalsCache = loadApprovalsFromDisk();
		state.approvalsLoaded = true;
	}
	return state.approvalsCache;
}
function hasPersistentApproval(params) {
	const key = buildApprovalScopeKey(params);
	return getApprovals().approvals.some((entry) => buildApprovalScopeKey({
		pluginRoot: entry.pluginRoot,
		channel: entry.channel,
		accountId: entry.accountId
	}) === key);
}
async function addPersistentApproval(entry) {
	const file = getApprovals();
	const key = buildApprovalScopeKey(entry);
	const approvals = file.approvals.filter((existing) => buildApprovalScopeKey({
		pluginRoot: existing.pluginRoot,
		channel: existing.channel,
		accountId: existing.accountId
	}) !== key);
	approvals.push(entry);
	await saveApprovals({
		version: 1,
		approvals
	});
}
function buildBindingMetadata(params) {
	return {
		pluginBindingOwner: PLUGIN_BINDING_OWNER,
		pluginId: params.pluginId,
		pluginName: params.pluginName,
		pluginRoot: params.pluginRoot,
		summary: params.summary?.trim() || void 0,
		detachHint: params.detachHint?.trim() || void 0
	};
}
function isPluginOwnedBindingMetadata(metadata) {
	if (!metadata || typeof metadata !== "object") return false;
	const record = metadata;
	return record.pluginBindingOwner === PLUGIN_BINDING_OWNER && typeof record.pluginId === "string" && typeof record.pluginRoot === "string";
}
function isPluginOwnedSessionBindingRecord(record) {
	return isPluginOwnedBindingMetadata(record?.metadata);
}
function toPluginConversationBinding(record) {
	if (!record || !isPluginOwnedBindingMetadata(record.metadata)) return null;
	const metadata = record.metadata;
	return {
		bindingId: record.bindingId,
		pluginId: metadata.pluginId,
		pluginName: metadata.pluginName,
		pluginRoot: metadata.pluginRoot,
		channel: record.conversation.channel,
		accountId: record.conversation.accountId,
		conversationId: record.conversation.conversationId,
		parentConversationId: record.conversation.parentConversationId,
		boundAt: record.boundAt,
		summary: metadata.summary,
		detachHint: metadata.detachHint
	};
}
async function bindConversationNow(params) {
	const ref = toConversationRef(params.conversation);
	const binding = toPluginConversationBinding(await createConversationBindingRecord({
		targetSessionKey: buildPluginBindingSessionKey({
			pluginId: params.identity.pluginId,
			channel: ref.channel,
			accountId: ref.accountId,
			conversationId: ref.conversationId
		}),
		targetKind: "session",
		conversation: ref,
		placement: "current",
		metadata: buildBindingMetadata({
			pluginId: params.identity.pluginId,
			pluginName: params.identity.pluginName,
			pluginRoot: params.identity.pluginRoot,
			summary: params.summary,
			detachHint: params.detachHint
		})
	}));
	if (!binding) throw new Error("plugin binding was created without plugin metadata");
	return {
		...binding,
		parentConversationId: params.conversation.parentConversationId,
		threadId: params.conversation.threadId
	};
}
function buildApprovalMessage(request) {
	const lines = [
		`Plugin bind approval required`,
		`Plugin: ${request.pluginName ?? request.pluginId}`,
		`Channel: ${request.conversation.channel}`,
		`Account: ${request.conversation.accountId}`
	];
	if (request.summary?.trim()) lines.push(`Request: ${request.summary.trim()}`);
	else lines.push("Request: Bind this conversation so future plain messages route to the plugin.");
	lines.push("Choose whether to allow this plugin to bind the current conversation.");
	return lines.join("\n");
}
function resolvePluginBindingDisplayName(binding) {
	return binding.pluginName?.trim() || binding.pluginId;
}
function buildDetachHintSuffix(detachHint) {
	const trimmed = detachHint?.trim();
	return trimmed ? ` To detach this conversation, use ${trimmed}.` : "";
}
function buildPluginBindingUnavailableText(binding) {
	return `The bound plugin ${resolvePluginBindingDisplayName(binding)} is not currently loaded. Routing this message to OpenClaw instead.${buildDetachHintSuffix(binding.detachHint)}`;
}
function buildPluginBindingDeclinedText(binding) {
	return `The bound plugin ${resolvePluginBindingDisplayName(binding)} did not handle this message. This conversation is still bound to that plugin.${buildDetachHintSuffix(binding.detachHint)}`;
}
function buildPluginBindingErrorText(binding) {
	return `The bound plugin ${resolvePluginBindingDisplayName(binding)} hit an error handling this message. This conversation is still bound to that plugin.${buildDetachHintSuffix(binding.detachHint)}`;
}
function hasShownPluginBindingFallbackNotice(bindingId) {
	const normalized = bindingId.trim();
	if (!normalized) return false;
	return getPluginBindingGlobalState().fallbackNoticeBindingIds.has(normalized);
}
function markPluginBindingFallbackNoticeShown(bindingId) {
	const normalized = bindingId.trim();
	if (!normalized) return;
	getPluginBindingGlobalState().fallbackNoticeBindingIds.add(normalized);
}
function buildPendingReply(request) {
	return {
		text: buildApprovalMessage(request),
		interactive: buildApprovalInteractiveReply(request.id)
	};
}
function encodeCustomIdValue(value) {
	return encodeURIComponent(value);
}
function decodeCustomIdValue(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function buildPluginBindingApprovalCustomId(approvalId, decision) {
	const decisionCode = decision === "allow-once" ? "o" : decision === "allow-always" ? "a" : "d";
	return `${PLUGIN_BINDING_CUSTOM_ID_PREFIX}:${encodeCustomIdValue(approvalId)}:${decisionCode}`;
}
function parsePluginBindingApprovalCustomId(value) {
	const trimmed = value.trim();
	if (!trimmed.startsWith(`${PLUGIN_BINDING_CUSTOM_ID_PREFIX}:`)) return null;
	const body = trimmed.slice(`${PLUGIN_BINDING_CUSTOM_ID_PREFIX}:`.length);
	const separator = body.lastIndexOf(":");
	if (separator <= 0 || separator === body.length - 1) return null;
	const rawId = body.slice(0, separator).trim();
	const rawDecisionCode = body.slice(separator + 1).trim();
	if (!rawId) return null;
	const rawDecision = rawDecisionCode === "o" ? "allow-once" : rawDecisionCode === "a" ? "allow-always" : rawDecisionCode === "d" ? "deny" : null;
	if (!rawDecision) return null;
	return {
		approvalId: decodeCustomIdValue(rawId),
		decision: rawDecision
	};
}
async function requestPluginConversationBinding(params) {
	const conversation = normalizeConversation(params.conversation);
	const ref = toConversationRef(conversation);
	const existing = resolveConversationBindingRecord(ref);
	const existingPluginBinding = toPluginConversationBinding(existing);
	const existingLegacyPluginBinding = isLegacyPluginBindingRecord({ record: existing });
	if (existing && !existingPluginBinding) if (existingLegacyPluginBinding) log.info(`plugin binding migrating legacy record plugin=${params.pluginId} root=${params.pluginRoot} channel=${ref.channel} account=${ref.accountId} conversation=${ref.conversationId}`);
	else return {
		status: "error",
		message: "This conversation is already bound by core routing and cannot be claimed by a plugin."
	};
	if (existingPluginBinding && existingPluginBinding.pluginRoot !== params.pluginRoot) return {
		status: "error",
		message: `This conversation is already bound by plugin "${existingPluginBinding.pluginName ?? existingPluginBinding.pluginId}".`
	};
	if (existingPluginBinding && existingPluginBinding.pluginRoot === params.pluginRoot) {
		const rebound = await bindConversationNow({
			identity: {
				pluginId: params.pluginId,
				pluginName: params.pluginName,
				pluginRoot: params.pluginRoot
			},
			conversation,
			summary: params.binding?.summary,
			detachHint: params.binding?.detachHint
		});
		log.info(`plugin binding auto-refresh plugin=${params.pluginId} root=${params.pluginRoot} channel=${ref.channel} account=${ref.accountId} conversation=${ref.conversationId}`);
		return {
			status: "bound",
			binding: rebound
		};
	}
	if (hasPersistentApproval({
		pluginRoot: params.pluginRoot,
		channel: ref.channel,
		accountId: ref.accountId
	})) {
		const bound = await bindConversationNow({
			identity: {
				pluginId: params.pluginId,
				pluginName: params.pluginName,
				pluginRoot: params.pluginRoot
			},
			conversation,
			summary: params.binding?.summary,
			detachHint: params.binding?.detachHint
		});
		log.info(`plugin binding auto-approved plugin=${params.pluginId} root=${params.pluginRoot} channel=${ref.channel} account=${ref.accountId} conversation=${ref.conversationId}`);
		return {
			status: "bound",
			binding: bound
		};
	}
	const request = {
		id: createApprovalRequestId(),
		pluginId: params.pluginId,
		pluginName: params.pluginName,
		pluginRoot: params.pluginRoot,
		conversation,
		requestedAt: Date.now(),
		requestedBySenderId: params.requestedBySenderId?.trim() || void 0,
		summary: params.binding?.summary?.trim() || void 0,
		detachHint: params.binding?.detachHint?.trim() || void 0
	};
	pendingRequests.set(request.id, request);
	log.info(`plugin binding requested plugin=${params.pluginId} root=${params.pluginRoot} channel=${ref.channel} account=${ref.accountId} conversation=${ref.conversationId}`);
	return {
		status: "pending",
		approvalId: request.id,
		reply: buildPendingReply(request)
	};
}
async function getCurrentPluginConversationBinding(params) {
	const binding = toPluginConversationBinding(resolveConversationBindingRecord(toConversationRef(params.conversation)));
	if (!binding || binding.pluginRoot !== params.pluginRoot) return null;
	return {
		...binding,
		parentConversationId: params.conversation.parentConversationId,
		threadId: params.conversation.threadId
	};
}
async function detachPluginConversationBinding(params) {
	const binding = toPluginConversationBinding(resolveConversationBindingRecord(toConversationRef(params.conversation)));
	if (!binding || binding.pluginRoot !== params.pluginRoot) return { removed: false };
	await unbindConversationBindingRecord({
		bindingId: binding.bindingId,
		reason: "plugin-detach"
	});
	log.info(`plugin binding detached plugin=${binding.pluginId} root=${binding.pluginRoot} channel=${binding.channel} account=${binding.accountId} conversation=${binding.conversationId}`);
	return { removed: true };
}
async function resolvePluginConversationBindingApproval(params) {
	const request = pendingRequests.get(params.approvalId);
	if (!request) return { status: "expired" };
	if (request.requestedBySenderId && params.senderId?.trim() && request.requestedBySenderId !== params.senderId.trim()) return { status: "expired" };
	pendingRequests.delete(params.approvalId);
	if (params.decision === "deny") {
		dispatchPluginConversationBindingResolved({
			status: "denied",
			decision: "deny",
			request
		});
		log.info(`plugin binding denied plugin=${request.pluginId} root=${request.pluginRoot} channel=${request.conversation.channel} account=${request.conversation.accountId} conversation=${request.conversation.conversationId}`);
		return {
			status: "denied",
			request
		};
	}
	if (params.decision === "allow-always") await addPersistentApproval({
		pluginRoot: request.pluginRoot,
		pluginId: request.pluginId,
		pluginName: request.pluginName,
		channel: request.conversation.channel,
		accountId: request.conversation.accountId,
		approvedAt: Date.now()
	});
	const binding = await bindConversationNow({
		identity: {
			pluginId: request.pluginId,
			pluginName: request.pluginName,
			pluginRoot: request.pluginRoot
		},
		conversation: request.conversation,
		summary: request.summary,
		detachHint: request.detachHint
	});
	log.info(`plugin binding approved plugin=${request.pluginId} root=${request.pluginRoot} decision=${params.decision} channel=${request.conversation.channel} account=${request.conversation.accountId} conversation=${request.conversation.conversationId}`);
	dispatchPluginConversationBindingResolved({
		status: "approved",
		binding,
		decision: params.decision,
		request
	});
	return {
		status: "approved",
		binding,
		request,
		decision: params.decision
	};
}
function dispatchPluginConversationBindingResolved(params) {
	queueMicrotask(() => {
		notifyPluginConversationBindingResolved(params).catch((error) => {
			log.warn(`plugin binding resolved dispatch failed: ${String(error)}`);
		});
	});
}
async function notifyPluginConversationBindingResolved(params) {
	const registrations = getActivePluginRegistry()?.conversationBindingResolvedHandlers ?? [];
	for (const registration of registrations) {
		if (registration.pluginId !== params.request.pluginId) continue;
		const registeredRoot = registration.pluginRoot?.trim();
		if (registeredRoot && registeredRoot !== params.request.pluginRoot) continue;
		try {
			const event = {
				status: params.status,
				binding: params.binding,
				decision: params.decision,
				request: {
					summary: params.request.summary,
					detachHint: params.request.detachHint,
					requestedBySenderId: params.request.requestedBySenderId,
					conversation: params.request.conversation
				}
			};
			await registration.handler(event);
		} catch (error) {
			log.warn(`plugin binding resolved callback failed plugin=${registration.pluginId} root=${registration.pluginRoot ?? "<none>"}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
function buildPluginBindingResolvedText(params) {
	if (params.status === "expired") return "That plugin bind approval expired. Retry the bind command.";
	if (params.status === "denied") return `Denied plugin bind request for ${params.request.pluginName ?? params.request.pluginId}.`;
	const summarySuffix = params.request.summary?.trim() ? ` ${params.request.summary.trim()}` : "";
	if (params.decision === "allow-always") return `Allowed ${params.request.pluginName ?? params.request.pluginId} to bind this conversation.${summarySuffix}`;
	return `Allowed ${params.request.pluginName ?? params.request.pluginId} to bind this conversation once.${summarySuffix}`;
}
//#endregion
//#region src/acp/persistent-bindings.types.ts
function normalizeText(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeMode(value) {
	return normalizeText(value)?.toLowerCase() === "oneshot" ? "oneshot" : "persistent";
}
function normalizeBindingConfig(raw) {
	if (!raw || typeof raw !== "object") return {};
	const shape = raw;
	const mode = normalizeText(shape.mode);
	return {
		mode: mode ? normalizeMode(mode) : void 0,
		cwd: normalizeText(shape.cwd),
		backend: normalizeText(shape.backend),
		label: normalizeText(shape.label)
	};
}
function buildBindingHash(params) {
	return createHash("sha256").update(`${params.channel}:${params.accountId}:${params.conversationId}`).digest("hex").slice(0, 16);
}
function buildConfiguredAcpSessionKey(spec) {
	const hash = buildBindingHash({
		channel: spec.channel,
		accountId: spec.accountId,
		conversationId: spec.conversationId
	});
	return `agent:${sanitizeAgentId(spec.agentId)}:acp:binding:${spec.channel}:${spec.accountId}:${hash}`;
}
function toConfiguredAcpBindingRecord(spec) {
	return {
		bindingId: `config:acp:${spec.channel}:${spec.accountId}:${spec.conversationId}`,
		targetSessionKey: buildConfiguredAcpSessionKey(spec),
		targetKind: "session",
		conversation: {
			channel: spec.channel,
			accountId: spec.accountId,
			conversationId: spec.conversationId,
			parentConversationId: spec.parentConversationId
		},
		status: "active",
		boundAt: 0,
		metadata: {
			source: "config",
			mode: spec.mode,
			agentId: spec.agentId,
			...spec.acpAgentId ? { acpAgentId: spec.acpAgentId } : {},
			label: spec.label,
			...spec.backend ? { backend: spec.backend } : {},
			...spec.cwd ? { cwd: spec.cwd } : {}
		}
	};
}
function parseConfiguredAcpSessionKey(sessionKey) {
	const trimmed = sessionKey.trim();
	if (!trimmed.startsWith("agent:")) return null;
	const rest = trimmed.slice(trimmed.indexOf(":") + 1);
	const nextSeparator = rest.indexOf(":");
	if (nextSeparator === -1) return null;
	const tokens = rest.slice(nextSeparator + 1).split(":");
	if (tokens.length !== 5 || tokens[0] !== "acp" || tokens[1] !== "binding") return null;
	const channel = tokens[2]?.trim().toLowerCase();
	if (!channel) return null;
	return {
		channel,
		accountId: normalizeAccountId(tokens[3] ?? "default")
	};
}
function resolveConfiguredAcpBindingSpecFromRecord(record) {
	if (record.targetKind !== "session") return null;
	const conversationId = record.conversation.conversationId.trim();
	if (!conversationId) return null;
	const agentId = normalizeText(record.metadata?.agentId) ?? resolveAgentIdFromSessionKey(record.targetSessionKey);
	if (!agentId) return null;
	return {
		channel: record.conversation.channel,
		accountId: normalizeAccountId(record.conversation.accountId),
		conversationId,
		parentConversationId: normalizeText(record.conversation.parentConversationId),
		agentId,
		acpAgentId: normalizeText(record.metadata?.acpAgentId),
		mode: normalizeMode(record.metadata?.mode),
		cwd: normalizeText(record.metadata?.cwd),
		backend: normalizeText(record.metadata?.backend),
		label: normalizeText(record.metadata?.label)
	};
}
function toResolvedConfiguredAcpBinding(record) {
	const spec = resolveConfiguredAcpBindingSpecFromRecord(record);
	if (!spec) return null;
	return {
		spec,
		record
	};
}
//#endregion
//#region src/channels/plugins/acp-configured-binding-consumer.ts
function resolveAgentRuntimeAcpDefaults(params) {
	const agent = params.cfg.agents?.list?.find((entry) => entry.id?.trim().toLowerCase() === params.ownerAgentId.toLowerCase());
	if (!agent || agent.runtime?.type !== "acp") return {};
	return {
		acpAgentId: normalizeText(agent.runtime.acp?.agent),
		mode: normalizeText(agent.runtime.acp?.mode),
		cwd: normalizeText(agent.runtime.acp?.cwd),
		backend: normalizeText(agent.runtime.acp?.backend)
	};
}
function resolveConfiguredBindingWorkspaceCwd(params) {
	if (normalizeText(resolveAgentConfig(params.cfg, params.agentId)?.workspace)) return resolveAgentWorkspaceDir(params.cfg, params.agentId);
	if (params.agentId === resolveDefaultAgentId(params.cfg)) {
		if (normalizeText(params.cfg.agents?.defaults?.workspace)) return resolveAgentWorkspaceDir(params.cfg, params.agentId);
	}
}
function buildConfiguredAcpSpec(params) {
	return {
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversation.conversationId,
		parentConversationId: params.conversation.parentConversationId,
		agentId: params.agentId,
		acpAgentId: params.acpAgentId,
		mode: params.mode,
		cwd: params.cwd,
		backend: params.backend,
		label: params.label
	};
}
function buildAcpTargetFactory(params) {
	if (params.binding.type !== "acp") return null;
	const runtimeDefaults = resolveAgentRuntimeAcpDefaults({
		cfg: params.cfg,
		ownerAgentId: params.agentId
	});
	const bindingOverrides = normalizeBindingConfig(params.binding.acp);
	const mode = normalizeMode(bindingOverrides.mode ?? runtimeDefaults.mode);
	const cwd = bindingOverrides.cwd ?? runtimeDefaults.cwd ?? resolveConfiguredBindingWorkspaceCwd({
		cfg: params.cfg,
		agentId: params.agentId
	});
	const backend = bindingOverrides.backend ?? runtimeDefaults.backend;
	const label = bindingOverrides.label;
	const acpAgentId = normalizeText(runtimeDefaults.acpAgentId);
	return {
		driverId: "acp",
		materialize: ({ accountId, conversation }) => {
			const spec = buildConfiguredAcpSpec({
				channel: params.channel,
				accountId,
				conversation,
				agentId: params.agentId,
				acpAgentId,
				mode,
				cwd,
				backend,
				label
			});
			return {
				record: toConfiguredAcpBindingRecord(spec),
				statefulTarget: {
					kind: "stateful",
					driverId: "acp",
					sessionKey: buildConfiguredAcpSessionKey(spec),
					agentId: params.agentId,
					...label ? { label } : {}
				}
			};
		}
	};
}
const acpConfiguredBindingConsumer = {
	id: "acp",
	supports: (binding) => binding.type === "acp",
	buildTargetFactory: (params) => buildAcpTargetFactory({
		cfg: params.cfg,
		binding: params.binding,
		channel: params.channel,
		agentId: params.agentId
	}),
	parseSessionKey: ({ sessionKey }) => parseConfiguredAcpSessionKey(sessionKey),
	matchesSessionKey: ({ sessionKey, materializedTarget }) => materializedTarget.record.targetSessionKey === sessionKey
};
//#endregion
//#region src/channels/plugins/configured-binding-consumers.ts
const registeredConfiguredBindingConsumers = /* @__PURE__ */ new Map();
function listConfiguredBindingConsumers() {
	return [...registeredConfiguredBindingConsumers.values()];
}
function resolveConfiguredBindingConsumer(binding) {
	for (const consumer of listConfiguredBindingConsumers()) if (consumer.supports(binding)) return consumer;
	return null;
}
function registerConfiguredBindingConsumer(consumer) {
	const id = consumer.id.trim();
	if (!id) throw new Error("Configured binding consumer id is required");
	if (registeredConfiguredBindingConsumers.get(id)) return;
	registeredConfiguredBindingConsumers.set(id, {
		...consumer,
		id
	});
}
//#endregion
//#region src/channels/plugins/configured-binding-builtins.ts
function ensureConfiguredBindingBuiltinsRegistered() {
	registerConfiguredBindingConsumer(acpConfiguredBindingConsumer);
}
//#endregion
//#region src/channels/plugins/binding-provider.ts
function resolveChannelConfiguredBindingProvider(plugin) {
	return plugin?.bindings;
}
//#endregion
//#region src/channels/plugins/configured-binding-compiler.ts
const compiledRegistryCache = /* @__PURE__ */ new WeakMap();
function findChannelPlugin(params) {
	return params.registry?.channels?.find((entry) => entry?.plugin?.id === params.channel)?.plugin ?? void 0;
}
function resolveLoadedChannelPlugin(channel) {
	const normalized = channel.trim().toLowerCase();
	if (!normalized) return;
	const current = getChannelPlugin(normalized);
	if (current) return current;
	return findChannelPlugin({
		registry: getActivePluginRegistry(),
		channel: normalized
	});
}
function resolveConfiguredBindingAdapter(channel) {
	const normalized = channel.trim().toLowerCase();
	if (!normalized) return null;
	const plugin = resolveLoadedChannelPlugin(normalized);
	const provider = resolveChannelConfiguredBindingProvider(plugin);
	if (!plugin || !provider || !provider.compileConfiguredBinding || !provider.matchInboundConversation) return null;
	return {
		channel: plugin.id,
		provider
	};
}
function resolveBindingConversationId(binding) {
	const id = binding.match?.peer?.id?.trim();
	return id ? id : null;
}
function compileConfiguredBindingTarget(params) {
	return params.provider.compileConfiguredBinding({
		binding: params.binding,
		conversationId: params.conversationId
	});
}
function compileConfiguredBindingRule(params) {
	const agentId = pickFirstExistingAgentId(params.cfg, params.binding.agentId ?? "main");
	const consumer = resolveConfiguredBindingConsumer(params.binding);
	if (!consumer) return null;
	const targetFactory = consumer.buildTargetFactory({
		cfg: params.cfg,
		binding: params.binding,
		channel: params.channel,
		agentId,
		target: params.target,
		bindingConversationId: params.bindingConversationId
	});
	if (!targetFactory) return null;
	return {
		channel: params.channel,
		accountPattern: params.binding.match.accountId?.trim() || void 0,
		binding: params.binding,
		bindingConversationId: params.bindingConversationId,
		target: params.target,
		agentId,
		provider: params.provider,
		targetFactory
	};
}
function pushCompiledRule(target, rule) {
	const existing = target.get(rule.channel);
	if (existing) {
		existing.push(rule);
		return;
	}
	target.set(rule.channel, [rule]);
}
function compileConfiguredBindingRegistry(params) {
	const rulesByChannel = /* @__PURE__ */ new Map();
	for (const binding of listConfiguredBindings(params.cfg)) {
		const bindingConversationId = resolveBindingConversationId(binding);
		if (!bindingConversationId) continue;
		const resolvedChannel = resolveConfiguredBindingAdapter(binding.match.channel);
		if (!resolvedChannel) continue;
		const target = compileConfiguredBindingTarget({
			provider: resolvedChannel.provider,
			binding,
			conversationId: bindingConversationId
		});
		if (!target) continue;
		const rule = compileConfiguredBindingRule({
			cfg: params.cfg,
			channel: resolvedChannel.channel,
			binding,
			target,
			bindingConversationId,
			provider: resolvedChannel.provider
		});
		if (!rule) continue;
		pushCompiledRule(rulesByChannel, rule);
	}
	return { rulesByChannel };
}
function resolveCompiledBindingRegistry(cfg) {
	const registryVersion = getActivePluginRegistryVersion();
	const cached = compiledRegistryCache.get(cfg);
	if (cached?.registryVersion === registryVersion) return cached.registry;
	const registry = compileConfiguredBindingRegistry({ cfg });
	compiledRegistryCache.set(cfg, {
		registryVersion,
		registry
	});
	return registry;
}
function primeCompiledBindingRegistry(cfg) {
	const registry = compileConfiguredBindingRegistry({ cfg });
	compiledRegistryCache.set(cfg, {
		registryVersion: getActivePluginRegistryVersion(),
		registry
	});
	return registry;
}
function countCompiledBindingRegistry(registry) {
	return {
		bindingCount: [...registry.rulesByChannel.values()].reduce((sum, rules) => sum + rules.length, 0),
		channelCount: registry.rulesByChannel.size
	};
}
//#endregion
//#region src/channels/plugins/configured-binding-match.ts
function resolveAccountMatchPriority(match, actual) {
	const trimmed = (match ?? "").trim();
	if (!trimmed) return actual === "default" ? 2 : 0;
	if (trimmed === "*") return 1;
	return normalizeAccountId(trimmed) === actual ? 2 : 0;
}
function matchCompiledBindingConversation(params) {
	return params.rule.provider.matchInboundConversation({
		binding: params.rule.binding,
		compiledBinding: params.rule.target,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
}
function resolveCompiledBindingChannel(raw) {
	const normalized = raw.trim().toLowerCase();
	return normalized ? normalized : null;
}
function toConfiguredBindingConversationRef(conversation) {
	const channel = resolveCompiledBindingChannel(conversation.channel);
	const conversationId = conversation.conversationId.trim();
	if (!channel || !conversationId) return null;
	return {
		channel,
		accountId: normalizeAccountId(conversation.accountId),
		conversationId,
		parentConversationId: conversation.parentConversationId?.trim() || void 0
	};
}
function materializeConfiguredBindingRecord(params) {
	return params.rule.targetFactory.materialize({
		accountId: normalizeAccountId(params.accountId),
		conversation: params.conversation
	});
}
function resolveMatchingConfiguredBinding(params) {
	if (!params.conversation) return null;
	let wildcardMatch = null;
	let exactMatch = null;
	for (const rule of params.rules) {
		const accountMatchPriority = resolveAccountMatchPriority(rule.accountPattern, params.conversation.accountId);
		if (accountMatchPriority === 0) continue;
		const match = matchCompiledBindingConversation({
			rule,
			conversationId: params.conversation.conversationId,
			parentConversationId: params.conversation.parentConversationId
		});
		if (!match) continue;
		const matchPriority = match.matchPriority ?? 0;
		if (accountMatchPriority === 2) {
			if (!exactMatch || matchPriority > (exactMatch.match.matchPriority ?? 0)) exactMatch = {
				rule,
				match
			};
			continue;
		}
		if (!wildcardMatch || matchPriority > (wildcardMatch.match.matchPriority ?? 0)) wildcardMatch = {
			rule,
			match
		};
	}
	return exactMatch ?? wildcardMatch;
}
//#endregion
//#region src/channels/plugins/configured-binding-session-lookup.ts
function resolveConfiguredBindingRecordBySessionKeyFromRegistry(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	for (const consumer of listConfiguredBindingConsumers()) {
		const parsed = consumer.parseSessionKey?.({ sessionKey });
		if (!parsed) continue;
		const channel = resolveCompiledBindingChannel(parsed.channel);
		if (!channel) continue;
		const rules = params.registry.rulesByChannel.get(channel);
		if (!rules || rules.length === 0) continue;
		let wildcardMatch = null;
		let exactMatch = null;
		for (const rule of rules) {
			if (rule.targetFactory.driverId !== consumer.id) continue;
			const accountMatchPriority = resolveAccountMatchPriority(rule.accountPattern, parsed.accountId);
			if (accountMatchPriority === 0) continue;
			const materializedTarget = materializeConfiguredBindingRecord({
				rule,
				accountId: parsed.accountId,
				conversation: rule.target
			});
			if (consumer.matchesSessionKey?.({
				sessionKey,
				compiledBinding: rule,
				accountId: parsed.accountId,
				materializedTarget
			}) ?? materializedTarget.record.targetSessionKey === sessionKey) {
				if (accountMatchPriority === 2) {
					exactMatch = materializedTarget;
					break;
				}
				wildcardMatch = materializedTarget;
			}
		}
		if (exactMatch) return exactMatch;
		if (wildcardMatch) return wildcardMatch;
	}
	return null;
}
//#endregion
//#region src/channels/plugins/configured-binding-registry.ts
function primeConfiguredBindingRegistry$1(params) {
	return countCompiledBindingRegistry(primeCompiledBindingRegistry(params.cfg));
}
function resolveConfiguredBindingRecord$1(params) {
	const conversation = toConfiguredBindingConversationRef({
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
	if (!conversation) return null;
	return resolveConfiguredBindingRecordForConversation$1({
		cfg: params.cfg,
		conversation
	});
}
function resolveConfiguredBindingRecordForConversation$1(params) {
	const conversation = toConfiguredBindingConversationRef(params.conversation);
	if (!conversation) return null;
	const rules = resolveCompiledBindingRegistry(params.cfg).rulesByChannel.get(conversation.channel);
	if (!rules || rules.length === 0) return null;
	const resolved = resolveMatchingConfiguredBinding({
		rules,
		conversation
	});
	if (!resolved) return null;
	return materializeConfiguredBindingRecord({
		rule: resolved.rule,
		accountId: conversation.accountId,
		conversation: resolved.match
	});
}
function resolveConfiguredBinding$1(params) {
	const conversation = toConfiguredBindingConversationRef(params.conversation);
	if (!conversation) return null;
	const rules = resolveCompiledBindingRegistry(params.cfg).rulesByChannel.get(conversation.channel);
	if (!rules || rules.length === 0) return null;
	const resolved = resolveMatchingConfiguredBinding({
		rules,
		conversation
	});
	if (!resolved) return null;
	const materializedTarget = materializeConfiguredBindingRecord({
		rule: resolved.rule,
		accountId: conversation.accountId,
		conversation: resolved.match
	});
	return {
		conversation,
		compiledBinding: resolved.rule,
		match: resolved.match,
		...materializedTarget
	};
}
function resolveConfiguredBindingRecordBySessionKey$1(params) {
	return resolveConfiguredBindingRecordBySessionKeyFromRegistry({
		registry: resolveCompiledBindingRegistry(params.cfg),
		sessionKey: params.sessionKey
	});
}
//#endregion
//#region src/channels/plugins/binding-registry.ts
function primeConfiguredBindingRegistry(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return primeConfiguredBindingRegistry$1(...args);
}
function resolveConfiguredBindingRecord(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecord$1(...args);
}
function resolveConfiguredBindingRecordForConversation(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecordForConversation$1(...args);
}
function resolveConfiguredBinding(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBinding$1(...args);
}
function resolveConfiguredBindingRecordBySessionKey(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecordBySessionKey$1(...args);
}
//#endregion
//#region src/acp/persistent-bindings.resolve.ts
function resolveConfiguredAcpBindingRecord(params) {
	const resolved = resolveConfiguredBindingRecord(params);
	return resolved ? toResolvedConfiguredAcpBinding(resolved.record) : null;
}
function resolveConfiguredAcpBindingSpecBySessionKey(params) {
	const resolved = resolveConfiguredBindingRecordBySessionKey(params);
	return resolved ? resolveConfiguredAcpBindingSpecFromRecord(resolved.record) : null;
}
//#endregion
//#region src/acp/persistent-bindings.lifecycle.ts
function sessionMatchesConfiguredBinding(params) {
	const desiredAgent = (params.spec.acpAgentId ?? params.spec.agentId).trim().toLowerCase();
	const currentAgent = (params.meta.agent ?? "").trim().toLowerCase();
	if (!currentAgent || currentAgent !== desiredAgent) return false;
	if (params.meta.mode !== params.spec.mode) return false;
	const desiredBackend = params.spec.backend?.trim() || params.cfg.acp?.backend?.trim() || "";
	if (desiredBackend) {
		const currentBackend = (params.meta.backend ?? "").trim();
		if (!currentBackend || currentBackend !== desiredBackend) return false;
	}
	const desiredCwd = params.spec.cwd?.trim();
	if (desiredCwd !== void 0) {
		if (desiredCwd !== (params.meta.runtimeOptions?.cwd ?? params.meta.cwd ?? "").trim()) return false;
	}
	return true;
}
async function ensureConfiguredAcpBindingSession(params) {
	const sessionKey = buildConfiguredAcpSessionKey(params.spec);
	const acpManager = getAcpSessionManager();
	try {
		const resolution = acpManager.resolveSession({
			cfg: params.cfg,
			sessionKey
		});
		if (resolution.kind === "ready" && sessionMatchesConfiguredBinding({
			cfg: params.cfg,
			spec: params.spec,
			meta: resolution.meta
		})) return {
			ok: true,
			sessionKey
		};
		if (resolution.kind !== "none") await acpManager.closeSession({
			cfg: params.cfg,
			sessionKey,
			reason: "config-binding-reconfigure",
			clearMeta: false,
			allowBackendUnavailable: true,
			requireAcpSession: false
		});
		await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent: params.spec.acpAgentId ?? params.spec.agentId,
			mode: params.spec.mode,
			cwd: params.spec.cwd,
			backendId: params.spec.backend
		});
		return {
			ok: true,
			sessionKey
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logVerbose(`acp-configured-binding: failed ensuring ${params.spec.channel}:${params.spec.accountId}:${params.spec.conversationId} -> ${sessionKey}: ${message}`);
		return {
			ok: false,
			sessionKey,
			error: message
		};
	}
}
async function ensureConfiguredAcpBindingReady(params) {
	if (!params.configuredBinding) return { ok: true };
	const ensured = await ensureConfiguredAcpBindingSession({
		cfg: params.cfg,
		spec: params.configuredBinding.spec
	});
	if (ensured.ok) return { ok: true };
	return {
		ok: false,
		error: ensured.error ?? "unknown error"
	};
}
async function resetAcpSessionInPlace(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		skipped: true
	};
	const meta = readAcpSessionEntry({
		cfg: params.cfg,
		sessionKey
	})?.acp;
	const configuredBinding = !meta || !normalizeText(meta.agent) ? resolveConfiguredAcpBindingSpecBySessionKey({
		cfg: params.cfg,
		sessionKey
	}) : null;
	if (!meta) {
		if (configuredBinding) {
			const ensured = await ensureConfiguredAcpBindingSession({
				cfg: params.cfg,
				spec: configuredBinding
			});
			if (ensured.ok) return { ok: true };
			return {
				ok: false,
				error: ensured.error
			};
		}
		return {
			ok: false,
			skipped: true
		};
	}
	const acpManager = getAcpSessionManager();
	const agent = normalizeText(meta.agent) ?? configuredBinding?.acpAgentId ?? configuredBinding?.agentId ?? resolveAcpAgentFromSessionKey(sessionKey, "main");
	const mode = meta.mode === "oneshot" ? "oneshot" : "persistent";
	const runtimeOptions = { ...meta.runtimeOptions };
	const cwd = normalizeText(runtimeOptions.cwd ?? meta.cwd);
	try {
		await acpManager.closeSession({
			cfg: params.cfg,
			sessionKey,
			reason: `${params.reason}-in-place-reset`,
			clearMeta: false,
			allowBackendUnavailable: true,
			requireAcpSession: false
		});
		await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent,
			mode,
			cwd,
			backendId: normalizeText(meta.backend) ?? normalizeText(params.cfg.acp?.backend)
		});
		const runtimeOptionsPatch = Object.fromEntries(Object.entries(runtimeOptions).filter(([, value]) => value !== void 0));
		if (runtimeOptionsPatch && Object.keys(runtimeOptionsPatch).length > 0) await acpManager.updateSessionRuntimeOptions({
			cfg: params.cfg,
			sessionKey,
			patch: runtimeOptionsPatch
		});
		return { ok: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logVerbose(`acp-configured-binding: failed reset for ${sessionKey}: ${message}`);
		return {
			ok: false,
			error: message
		};
	}
}
//#endregion
//#region src/channels/plugins/acp-stateful-target-driver.ts
function toAcpStatefulBindingTargetDescriptor(params) {
	const metaAgentId = (readAcpSessionEntry(params)?.acp)?.agent?.trim();
	if (metaAgentId) return {
		kind: "stateful",
		driverId: "acp",
		sessionKey: params.sessionKey,
		agentId: metaAgentId
	};
	const spec = resolveConfiguredAcpBindingSpecBySessionKey(params);
	if (!spec) return null;
	return {
		kind: "stateful",
		driverId: "acp",
		sessionKey: params.sessionKey,
		agentId: spec.agentId,
		...spec.label ? { label: spec.label } : {}
	};
}
async function ensureAcpTargetReady(params) {
	const configuredBinding = resolveConfiguredAcpBindingSpecFromRecord(params.bindingResolution.record);
	if (!configuredBinding) return {
		ok: false,
		error: "Configured ACP binding unavailable"
	};
	return await ensureConfiguredAcpBindingReady({
		cfg: params.cfg,
		configuredBinding: {
			spec: configuredBinding,
			record: params.bindingResolution.record
		}
	});
}
async function ensureAcpTargetSession(params) {
	const spec = resolveConfiguredAcpBindingSpecFromRecord(params.bindingResolution.record);
	if (!spec) return {
		ok: false,
		sessionKey: params.bindingResolution.statefulTarget.sessionKey,
		error: "Configured ACP binding unavailable"
	};
	return await ensureConfiguredAcpBindingSession({
		cfg: params.cfg,
		spec
	});
}
async function resetAcpTargetInPlace(params) {
	return await resetAcpSessionInPlace(params);
}
const acpStatefulBindingTargetDriver = {
	id: "acp",
	ensureReady: ensureAcpTargetReady,
	ensureSession: ensureAcpTargetSession,
	resolveTargetBySessionKey: toAcpStatefulBindingTargetDescriptor,
	resetInPlace: resetAcpTargetInPlace
};
//#endregion
//#region src/channels/plugins/stateful-target-drivers.ts
const registeredStatefulBindingTargetDrivers = /* @__PURE__ */ new Map();
function listStatefulBindingTargetDrivers() {
	return [...registeredStatefulBindingTargetDrivers.values()];
}
function registerStatefulBindingTargetDriver(driver) {
	const id = driver.id.trim();
	if (!id) throw new Error("Stateful binding target driver id is required");
	const normalized = {
		...driver,
		id
	};
	if (registeredStatefulBindingTargetDrivers.get(id)) return;
	registeredStatefulBindingTargetDrivers.set(id, normalized);
}
function getStatefulBindingTargetDriver(id) {
	const normalizedId = id.trim();
	if (!normalizedId) return null;
	return registeredStatefulBindingTargetDrivers.get(normalizedId) ?? null;
}
function resolveStatefulBindingTargetBySessionKey(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	for (const driver of listStatefulBindingTargetDrivers()) {
		const bindingTarget = driver.resolveTargetBySessionKey?.({
			cfg: params.cfg,
			sessionKey
		});
		if (bindingTarget) return {
			driver,
			bindingTarget
		};
	}
	return null;
}
//#endregion
//#region src/channels/plugins/stateful-target-builtins.ts
function ensureStatefulTargetBuiltinsRegistered() {
	registerStatefulBindingTargetDriver(acpStatefulBindingTargetDriver);
}
//#endregion
//#region src/channels/plugins/binding-targets.ts
async function ensureConfiguredBindingTargetReady(params) {
	ensureStatefulTargetBuiltinsRegistered();
	if (!params.bindingResolution) return { ok: true };
	const driver = getStatefulBindingTargetDriver(params.bindingResolution.statefulTarget.driverId);
	if (!driver) return {
		ok: false,
		error: `Configured binding target driver unavailable: ${params.bindingResolution.statefulTarget.driverId}`
	};
	return await driver.ensureReady({
		cfg: params.cfg,
		bindingResolution: params.bindingResolution
	});
}
async function resetConfiguredBindingTargetInPlace(params) {
	ensureStatefulTargetBuiltinsRegistered();
	const resolved = resolveStatefulBindingTargetBySessionKey({
		cfg: params.cfg,
		sessionKey: params.sessionKey
	});
	if (!resolved?.driver.resetInPlace) return {
		ok: false,
		skipped: true
	};
	return await resolved.driver.resetInPlace({
		...params,
		bindingTarget: resolved.bindingTarget
	});
}
async function ensureConfiguredBindingTargetSession(params) {
	ensureStatefulTargetBuiltinsRegistered();
	const driver = getStatefulBindingTargetDriver(params.bindingResolution.statefulTarget.driverId);
	if (!driver) return {
		ok: false,
		sessionKey: params.bindingResolution.statefulTarget.sessionKey,
		error: `Configured binding target driver unavailable: ${params.bindingResolution.statefulTarget.driverId}`
	};
	return await driver.ensureSession({
		cfg: params.cfg,
		bindingResolution: params.bindingResolution
	});
}
//#endregion
//#region src/channels/plugins/binding-routing.ts
function resolveConfiguredBindingConversationRef(params) {
	if ("conversation" in params) return params.conversation;
	return {
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	};
}
function resolveConfiguredBindingRoute(params) {
	const bindingResolution = resolveConfiguredBinding({
		cfg: params.cfg,
		conversation: resolveConfiguredBindingConversationRef(params)
	}) ?? null;
	if (!bindingResolution) return {
		bindingResolution: null,
		route: params.route
	};
	const boundSessionKey = bindingResolution.statefulTarget.sessionKey.trim();
	if (!boundSessionKey) return {
		bindingResolution,
		route: params.route
	};
	const boundAgentId = resolveAgentIdFromSessionKey(boundSessionKey) || bindingResolution.statefulTarget.agentId;
	return {
		bindingResolution,
		boundSessionKey,
		boundAgentId,
		route: {
			...params.route,
			sessionKey: boundSessionKey,
			agentId: boundAgentId,
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: boundSessionKey,
				mainSessionKey: params.route.mainSessionKey
			}),
			matchedBy: "binding.channel"
		}
	};
}
async function ensureConfiguredBindingRouteReady(params) {
	return await ensureConfiguredBindingTargetReady(params);
}
//#endregion
//#region src/channels/session.ts
function normalizeSessionStoreKey(sessionKey) {
	return sessionKey.trim().toLowerCase();
}
function shouldSkipPinnedMainDmRouteUpdate(pin) {
	if (!pin) return false;
	const owner = pin.ownerRecipient.trim().toLowerCase();
	const sender = pin.senderRecipient.trim().toLowerCase();
	if (!owner || !sender || owner === sender) return false;
	pin.onSkip?.({
		ownerRecipient: pin.ownerRecipient,
		senderRecipient: pin.senderRecipient
	});
	return true;
}
async function recordInboundSession(params) {
	const { storePath, sessionKey, ctx, groupResolution, createIfMissing } = params;
	const canonicalSessionKey = normalizeSessionStoreKey(sessionKey);
	recordSessionMetaFromInbound({
		storePath,
		sessionKey: canonicalSessionKey,
		ctx,
		groupResolution,
		createIfMissing
	}).catch(params.onRecordError);
	const update = params.updateLastRoute;
	if (!update) return;
	if (shouldSkipPinnedMainDmRouteUpdate(update.mainDmOwnerPin)) return;
	const targetSessionKey = normalizeSessionStoreKey(update.sessionKey);
	await updateLastRoute({
		storePath,
		sessionKey: targetSessionKey,
		deliveryContext: {
			channel: update.channel,
			to: update.to,
			accountId: update.accountId,
			threadId: update.threadId
		},
		ctx: targetSessionKey === canonicalSessionKey ? ctx : void 0,
		groupResolution
	});
}
//#endregion
//#region src/channels/session-meta.ts
async function recordInboundSessionMetaSafe(params) {
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId: params.agentId });
	try {
		await recordSessionMetaFromInbound({
			storePath,
			sessionKey: params.sessionKey,
			ctx: params.ctx
		});
	} catch (err) {
		params.onError?.(err);
	}
}
//#endregion
//#region src/channels/thread-binding-id.ts
function resolveThreadBindingConversationIdFromBindingId(params) {
	const bindingId = params.bindingId?.trim();
	if (!bindingId) return;
	const prefix = `${params.accountId}:`;
	if (!bindingId.startsWith(prefix)) return;
	return bindingId.slice(prefix.length).trim() || void 0;
}
//#endregion
//#region src/channels/thread-bindings-messages.ts
const DEFAULT_THREAD_BINDING_FAREWELL_TEXT = "Session ended. Messages here will no longer be routed.";
function normalizeThreadBindingDurationMs(raw) {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return 0;
	const durationMs = Math.floor(raw);
	if (durationMs < 0) return 0;
	return durationMs;
}
function formatThreadBindingDurationLabel(durationMs) {
	if (durationMs <= 0) return "disabled";
	if (durationMs < 6e4) return "<1m";
	const totalMinutes = Math.floor(durationMs / 6e4);
	if (totalMinutes % 60 === 0) return `${Math.floor(totalMinutes / 60)}h`;
	return `${totalMinutes}m`;
}
function resolveThreadBindingThreadName(params) {
	return `🤖 ${params.label?.trim() || params.agentId?.trim() || "agent"}`.replace(/\s+/g, " ").trim().slice(0, 100);
}
function resolveThreadBindingIntroText(params) {
	const normalized = (params.label?.trim() || params.agentId?.trim() || "agent").replace(/\s+/g, " ").trim().slice(0, 100) || "agent";
	const idleTimeoutMs = normalizeThreadBindingDurationMs(params.idleTimeoutMs);
	const maxAgeMs = normalizeThreadBindingDurationMs(params.maxAgeMs);
	const cwd = params.sessionCwd?.trim();
	const details = (params.sessionDetails ?? []).map((entry) => entry.trim()).filter((entry) => entry.length > 0);
	if (cwd) details.unshift(`cwd: ${cwd}`);
	const lifecycle = [];
	if (idleTimeoutMs > 0) lifecycle.push(`idle auto-unfocus after ${formatThreadBindingDurationLabel(idleTimeoutMs)} inactivity`);
	if (maxAgeMs > 0) lifecycle.push(`max age ${formatThreadBindingDurationLabel(maxAgeMs)}`);
	const intro = lifecycle.length > 0 ? `${normalized} session active (${lifecycle.join("; ")}). Messages here go directly to this session.` : `${normalized} session active. Messages here go directly to this session.`;
	if (details.length === 0) return prefixSystemMessage(intro);
	return prefixSystemMessage(`${intro}\n${details.join("\n")}`);
}
function resolveThreadBindingFarewellText(params) {
	const custom = params.farewellText?.trim();
	if (custom) return prefixSystemMessage(custom);
	if (params.reason === "idle-expired") return prefixSystemMessage(`Session ended automatically after ${formatThreadBindingDurationLabel(normalizeThreadBindingDurationMs(params.idleTimeoutMs))} of inactivity. Messages here will no longer be routed.`);
	if (params.reason === "max-age-expired") return prefixSystemMessage(`Session ended automatically at max age of ${formatThreadBindingDurationLabel(normalizeThreadBindingDurationMs(params.maxAgeMs))}. Messages here will no longer be routed.`);
	return prefixSystemMessage(DEFAULT_THREAD_BINDING_FAREWELL_TEXT);
}
//#endregion
export { isPluginOwnedBindingMetadata as A, resolveConversationBindingRecord as B, buildPluginBindingDeclinedText as C, detachPluginConversationBinding as D, buildPluginBindingUnavailableText as E, resolvePluginConversationBindingApproval as F, isSessionBindingError as G, unbindConversationBindingRecord as H, toPluginConversationBinding as I, createScopedAccountReplyToModeResolver as J, registerSessionBindingAdapter as K, createConversationBindingRecord as L, markPluginBindingFallbackNoticeShown as M, parsePluginBindingApprovalCustomId as N, getCurrentPluginConversationBinding as O, requestPluginConversationBinding as P, getConversationBindingCapabilities as R, buildPluginBindingApprovalCustomId as S, buildPluginBindingResolvedText as T, SessionBindingError as U, touchConversationBindingRecord as V, getSessionBindingService as W, createTopLevelChannelReplyToModeResolver as X, createStaticReplyToModeResolver as Y, resolveConfiguredBindingRecord as _, resolveThreadBindingConversationIdFromBindingId as a, buildConfiguredAcpSessionKey as b, ensureConfiguredBindingRouteReady as c, ensureConfiguredBindingTargetSession as d, resetConfiguredBindingTargetInPlace as f, resolveConfiguredBinding as g, primeConfiguredBindingRegistry as h, resolveThreadBindingThreadName as i, isPluginOwnedSessionBindingRecord as j, hasShownPluginBindingFallbackNotice as k, resolveConfiguredBindingRoute as l, resolveConfiguredAcpBindingRecord as m, resolveThreadBindingFarewellText as n, recordInboundSessionMetaSafe as o, ensureConfiguredAcpBindingReady as p, unregisterSessionBindingAdapter as q, resolveThreadBindingIntroText as r, recordInboundSession as s, formatThreadBindingDurationLabel as t, ensureConfiguredBindingTargetReady as u, resolveConfiguredBindingRecordBySessionKey as v, buildPluginBindingErrorText as w, normalizeBindingConfig as x, resolveConfiguredBindingRecordForConversation as y, listSessionBindingRecords as z };
