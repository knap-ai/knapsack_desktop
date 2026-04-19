import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { c as normalizeAgentId, u as resolveAgentIdFromSessionKey } from "./session-key-Bh1lMwK5.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { p as resolveSessionAgentId } from "./agent-scope-KFH9bkHi.js";
import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES, s as isDeliverableMessageChannel, u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { a as actionHasTarget, o as actionRequiresTarget, r as applyTargetToParams } from "./channel-target-Du58lo8P.js";
import "./plugins-D4ODSIPT.js";
import { i as recordSessionMetaFromInbound } from "./store-DFXcceZJ.js";
import "./sessions-vP2E4vs-.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { t as appendAssistantMessageToSessionTranscript } from "./transcript-BYlhLemN.js";
import { n as extensionForMime } from "./mime-B6nXlmtY.js";
import { i as resolveChannelMessageToolMediaSourceParamKeys } from "./message-action-discovery-BTz8VrH1.js";
import { l as throwIfAborted, u as parseReplyDirectives } from "./deliver-BNvlWd4P.js";
import { a as normalizeTargetForProvider, i as normalizeChannelTargetInput, n as looksLikeTargetId, o as resolveNormalizedTargetInput, r as maybeResolvePluginMessagingTarget, t as buildTargetResolverSignature } from "./target-normalization-j5fHpTkf.js";
import { b as resolveSnakeCaseParamKey, d as readNumberParam, h as readStringParam, p as readStringArrayParam, y as readSnakeCaseParamRaw } from "./common-BWtun2If.js";
import { a as createRootScopedReadFile } from "./fs-safe-B7mHodgb.js";
import { n as basenameFromMediaSource } from "./local-file-access-CpkF4sBk.js";
import { a as resolveSandboxedMediaSource, t as assertMediaNotDataUrl } from "./sandbox-paths-C5p25GeS.js";
import { t as resolveAgentScopedOutboundMediaAccess } from "./read-capability-KJ3-uRH6.js";
import { r as getAgentScopedMediaLocalRoots } from "./local-roots-BrPriMlc.js";
import { t as loadWebMedia } from "./web-media-B2LIgj-X.js";
import { i as hasReplyPayloadContent, t as hasInteractiveReplyBlocks } from "./payload-CS7dEmmu.js";
import { r as resolvePollMaxSelections } from "./polls-C5l4CbhI.js";
import { t as buildChannelAccountBindings } from "./bindings-uP5iyfKc.js";
import { n as resolveOutboundChannelPlugin$1 } from "./channel-resolution-DhbJUhMK.js";
import { n as resolveMessageChannelSelection, t as listConfiguredMessageChannels } from "./channel-selection-CnZBjflX.js";
import { n as resolveOutboundMediaAccess, r as resolveOutboundMediaLocalRoots, t as buildOutboundMediaLoadOptions } from "./load-options-u_-v12gr.js";
import { t as readBooleanParam$1 } from "./boolean-param-DB-5zaBR.js";
import { r as unknownTargetError, t as ambiguousTargetError } from "./target-errors-YQMrxctE.js";
import { t as maybeResolveIdLikeTarget } from "./target-id-resolution-B8eetcJ_.js";
import { n as sendPoll, t as sendMessage } from "./message-BYwqZVIO.js";
import { t as extractToolPayload } from "./tool-payload-me2TXyhW.js";
import "./inbound.runtime-DBKJb8gw.js";
import { t as buildAgentSessionKey } from "./resolve-route-ByaGTmFk.js";
//#region src/channels/plugins/message-action-dispatch.ts
function requiresTrustedRequesterSender(ctx) {
	const plugin = getChannelPlugin(ctx.channel);
	return Boolean(plugin?.actions?.requiresTrustedRequesterSender?.({
		action: ctx.action,
		toolContext: ctx.toolContext
	}));
}
async function dispatchChannelMessageAction(ctx) {
	if (requiresTrustedRequesterSender(ctx) && !ctx.requesterSenderId?.trim()) throw new Error(`Trusted sender identity is required for ${ctx.channel}:${ctx.action} in tool-driven contexts.`);
	const plugin = getChannelPlugin(ctx.channel);
	if (!plugin?.actions?.handleAction) return null;
	if (plugin.actions.supportsAction && !plugin.actions.supportsAction({ action: ctx.action })) return null;
	return await plugin.actions.handleAction(ctx);
}
//#endregion
//#region src/poll-params.ts
const SHARED_POLL_CREATION_PARAM_DEFS = {
	pollQuestion: { kind: "string" },
	pollOption: { kind: "stringArray" },
	pollDurationHours: { kind: "number" },
	pollMulti: { kind: "boolean" }
};
const TELEGRAM_POLL_CREATION_PARAM_DEFS = {
	pollDurationSeconds: { kind: "number" },
	pollAnonymous: { kind: "boolean" },
	pollPublic: { kind: "boolean" }
};
const POLL_CREATION_PARAM_DEFS = {
	...SHARED_POLL_CREATION_PARAM_DEFS,
	...TELEGRAM_POLL_CREATION_PARAM_DEFS
};
const POLL_CREATION_PARAM_NAMES = Object.keys(POLL_CREATION_PARAM_DEFS);
const SHARED_POLL_CREATION_PARAM_NAMES = Object.keys(SHARED_POLL_CREATION_PARAM_DEFS);
function readPollParamRaw(params, key) {
	return readSnakeCaseParamRaw(params, key);
}
function hasPollCreationParams(params) {
	for (const key of POLL_CREATION_PARAM_NAMES) {
		const def = POLL_CREATION_PARAM_DEFS[key];
		const value = readPollParamRaw(params, key);
		if (def.kind === "string" && typeof value === "string" && value.trim().length > 0) return true;
		if (def.kind === "stringArray") {
			if (Array.isArray(value) && value.some((entry) => typeof entry === "string" && entry.trim())) return true;
			if (typeof value === "string" && value.trim().length > 0) return true;
		}
		if (def.kind === "number") {
			if (typeof value === "number" && Number.isFinite(value) && value !== 0) return true;
			if (typeof value === "string") {
				const trimmed = value.trim();
				const parsed = Number(trimmed);
				if (trimmed.length > 0 && Number.isFinite(parsed) && parsed !== 0) return true;
			}
		}
		if (def.kind === "boolean") {
			if (value === true) return true;
			if (typeof value === "string" && normalizeLowercaseStringOrEmpty(value) === "true") return true;
		}
	}
	return false;
}
//#endregion
//#region src/infra/outbound/message-action-normalization.ts
function normalizeMessageActionInput(params) {
	const normalizedArgs = { ...params.args };
	const { action, toolContext } = params;
	const explicitChannel = normalizeOptionalString(normalizedArgs.channel) ?? "";
	const inferredChannel = explicitChannel || normalizeMessageChannel(toolContext?.currentChannelProvider) || "";
	const explicitTarget = normalizeOptionalString(normalizedArgs.target) ?? "";
	const hasLegacyTargetFields = typeof normalizedArgs.to === "string" || typeof normalizedArgs.channelId === "string";
	const hasLegacyTarget = (normalizeOptionalString(normalizedArgs.to) ?? "").length > 0 || (normalizeOptionalString(normalizedArgs.channelId) ?? "").length > 0;
	if (explicitTarget && hasLegacyTargetFields) {
		delete normalizedArgs.to;
		delete normalizedArgs.channelId;
	}
	if (!explicitTarget && !hasLegacyTarget && actionRequiresTarget(action) && !actionHasTarget(action, normalizedArgs, { channel: inferredChannel })) {
		const inferredTarget = normalizeOptionalString(toolContext?.currentChannelId);
		if (inferredTarget) normalizedArgs.target = inferredTarget;
	}
	if (!explicitTarget && actionRequiresTarget(action) && hasLegacyTarget) {
		const legacyTo = normalizeOptionalString(normalizedArgs.to) ?? "";
		const legacyChannelId = normalizeOptionalString(normalizedArgs.channelId) ?? "";
		const legacyTarget = legacyTo || legacyChannelId;
		if (legacyTarget) {
			normalizedArgs.target = legacyTarget;
			delete normalizedArgs.to;
			delete normalizedArgs.channelId;
		}
	}
	if (!explicitChannel) {
		if (inferredChannel && isDeliverableMessageChannel(inferredChannel)) normalizedArgs.channel = inferredChannel;
	}
	applyTargetToParams({
		action,
		args: normalizedArgs
	});
	if (actionRequiresTarget(action) && !actionHasTarget(action, normalizedArgs, { channel: inferredChannel })) throw new Error(`Action ${action} requires a target.`);
	return normalizedArgs;
}
//#endregion
//#region src/infra/outbound/message-action-params.ts
const readBooleanParam = readBooleanParam$1;
const BASE_ACTION_MEDIA_SOURCE_PARAM_KEYS = [
	"media",
	"path",
	"filePath",
	"mediaUrl",
	"fileUrl",
	"image"
];
function readMediaParam(args, key) {
	return readStringParam(args, key, { trim: false });
}
function resolveMediaParamEntry(args, key) {
	const resolvedKey = resolveSnakeCaseParamKey(args, key);
	if (!resolvedKey) return;
	const value = readMediaParam(args, key);
	if (!value) return;
	return {
		key: resolvedKey,
		value
	};
}
function buildActionMediaSourceParamKeys(extraParamKeys) {
	const keys = new Set(BASE_ACTION_MEDIA_SOURCE_PARAM_KEYS);
	extraParamKeys?.forEach((key) => keys.add(key));
	return Array.from(keys);
}
function resolveExtraActionMediaSourceParamKeys(params) {
	return resolveChannelMessageToolMediaSourceParamKeys({
		cfg: params.cfg,
		action: params.action,
		channel: params.channel,
		accountId: params.accountId,
		sessionKey: params.sessionKey,
		sessionId: params.sessionId,
		agentId: params.agentId,
		requesterSenderId: params.requesterSenderId,
		senderIsOwner: params.senderIsOwner
	});
}
function collectActionMediaSourceHints(args, extraParamKeys) {
	const sources = [];
	for (const key of buildActionMediaSourceParamKeys(extraParamKeys)) {
		const entry = resolveMediaParamEntry(args, key);
		if (entry && normalizeOptionalString(entry.value)) sources.push(entry.value);
	}
	return sources;
}
function readAttachmentMediaHint(args) {
	return readMediaParam(args, "media") ?? readMediaParam(args, "mediaUrl");
}
function readAttachmentFileHint(args) {
	return readMediaParam(args, "path") ?? readMediaParam(args, "filePath") ?? readMediaParam(args, "fileUrl");
}
function resolveAttachmentMaxBytes(params) {
	const accountId = typeof params.accountId === "string" ? params.accountId.trim() : "";
	const channelCfg = params.cfg.channels?.[params.channel];
	const channelObj = channelCfg && typeof channelCfg === "object" ? channelCfg : void 0;
	const channelMediaMax = typeof channelObj?.mediaMaxMb === "number" ? channelObj.mediaMaxMb : void 0;
	const accountsObj = channelObj?.accounts && typeof channelObj.accounts === "object" ? channelObj.accounts : void 0;
	const accountCfg = accountId && accountsObj ? accountsObj[accountId] : void 0;
	const accountMediaMax = accountCfg && typeof accountCfg === "object" ? accountCfg.mediaMaxMb : void 0;
	const limitMb = (typeof accountMediaMax === "number" ? accountMediaMax : void 0) ?? channelMediaMax ?? params.cfg.agents?.defaults?.mediaMaxMb;
	return typeof limitMb === "number" ? limitMb * 1024 * 1024 : void 0;
}
function inferAttachmentFilename(params) {
	const mediaHint = params.mediaHint?.trim();
	if (mediaHint) {
		const base = basenameFromMediaSource(mediaHint);
		if (base) return base;
	}
	const ext = params.contentType ? extensionForMime(params.contentType) : void 0;
	return ext ? `attachment${ext}` : "attachment";
}
function normalizeBase64Payload(params) {
	if (!params.base64) return {
		base64: params.base64,
		contentType: params.contentType
	};
	const match = /^data:([^;]+);base64,(.*)$/i.exec(params.base64.trim());
	if (!match) return {
		base64: params.base64,
		contentType: params.contentType
	};
	const [, mime, payload] = match;
	return {
		base64: payload,
		contentType: params.contentType ?? mime
	};
}
function resolveAttachmentMediaPolicy(params) {
	const sandboxRoot = params.sandboxRoot?.trim();
	if (sandboxRoot) return {
		mode: "sandbox",
		sandboxRoot
	};
	const explicitLocalRoots = resolveOutboundMediaLocalRoots(params.mediaLocalRoots);
	return {
		mode: "host",
		mediaAccess: resolveOutboundMediaAccess({
			mediaAccess: params.mediaAccess,
			mediaLocalRoots: explicitLocalRoots === "any" ? void 0 : explicitLocalRoots,
			mediaReadFile: params.mediaAccess?.readFile ? void 0 : params.mediaReadFile
		}),
		...explicitLocalRoots !== void 0 ? { mediaLocalRoots: explicitLocalRoots } : {},
		...params.mediaAccess?.readFile ? {} : params.mediaReadFile ? { mediaReadFile: params.mediaReadFile } : {}
	};
}
function buildAttachmentMediaLoadOptions(params) {
	if (params.policy.mode === "sandbox") {
		const readSandboxFile = createRootScopedReadFile({ rootDir: params.policy.sandboxRoot.trim() });
		return {
			maxBytes: params.maxBytes,
			sandboxValidated: true,
			readFile: readSandboxFile
		};
	}
	return buildOutboundMediaLoadOptions({
		maxBytes: params.maxBytes,
		mediaAccess: params.policy.mediaAccess,
		mediaLocalRoots: params.policy.mediaLocalRoots,
		mediaReadFile: params.policy.mediaReadFile
	});
}
async function hydrateAttachmentPayload(params) {
	const contentTypeParam = params.contentTypeParam ?? void 0;
	const rawBuffer = readStringParam(params.args, "buffer", { trim: false });
	const normalized = normalizeBase64Payload({
		base64: rawBuffer,
		contentType: contentTypeParam ?? void 0
	});
	if (normalized.base64 !== rawBuffer && normalized.base64) {
		params.args.buffer = normalized.base64;
		if (normalized.contentType && !contentTypeParam) params.args.contentType = normalized.contentType;
	}
	const filename = readStringParam(params.args, "filename");
	const mediaSource = (params.mediaHint ?? void 0) || (params.fileHint ?? void 0);
	if (!params.dryRun && !readStringParam(params.args, "buffer", { trim: false }) && mediaSource) {
		const maxBytes = resolveAttachmentMaxBytes({
			cfg: params.cfg,
			channel: params.channel,
			accountId: params.accountId
		});
		const media = await loadWebMedia(mediaSource, buildAttachmentMediaLoadOptions({
			policy: params.mediaPolicy,
			maxBytes
		}));
		params.args.buffer = media.buffer.toString("base64");
		if (!contentTypeParam && media.contentType) params.args.contentType = media.contentType;
		if (!filename) params.args.filename = inferAttachmentFilename({
			mediaHint: media.fileName ?? mediaSource,
			contentType: media.contentType ?? contentTypeParam ?? void 0
		});
	} else if (!filename) params.args.filename = inferAttachmentFilename({
		mediaHint: mediaSource,
		contentType: contentTypeParam ?? void 0
	});
}
async function normalizeSandboxMediaParams(params) {
	const sandboxRoot = params.mediaPolicy.mode === "sandbox" ? params.mediaPolicy.sandboxRoot.trim() : void 0;
	for (const key of buildActionMediaSourceParamKeys(params.extraParamKeys)) {
		const entry = resolveMediaParamEntry(params.args, key);
		if (!entry) continue;
		assertMediaNotDataUrl(entry.value);
		if (!sandboxRoot) continue;
		const normalized = await resolveSandboxedMediaSource({
			media: entry.value,
			sandboxRoot
		});
		if (normalized !== entry.value) params.args[entry.key] = normalized;
	}
}
async function normalizeSandboxMediaList(params) {
	const sandboxRoot = params.sandboxRoot?.trim();
	const normalized = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of params.values) {
		const raw = value?.trim();
		if (!raw) continue;
		assertMediaNotDataUrl(raw);
		const resolved = sandboxRoot ? await resolveSandboxedMediaSource({
			media: raw,
			sandboxRoot
		}) : raw;
		if (seen.has(resolved)) continue;
		seen.add(resolved);
		normalized.push(resolved);
	}
	return normalized;
}
async function hydrateAttachmentActionPayload(params) {
	const mediaHint = readAttachmentMediaHint(params.args);
	const fileHint = readAttachmentFileHint(params.args);
	const contentTypeParam = readStringParam(params.args, "contentType") ?? readStringParam(params.args, "mimeType");
	if (params.allowMessageCaptionFallback) {
		const caption = readStringParam(params.args, "caption", { allowEmpty: true })?.trim();
		const message = readStringParam(params.args, "message", { allowEmpty: true })?.trim();
		if (!caption && message) params.args.caption = message;
	}
	await hydrateAttachmentPayload({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		args: params.args,
		dryRun: params.dryRun,
		contentTypeParam,
		mediaHint,
		fileHint,
		mediaPolicy: params.mediaPolicy
	});
}
async function hydrateAttachmentParamsForAction(params) {
	const shouldHydrateUploadFile = params.action === "upload-file";
	if (params.action !== "sendAttachment" && params.action !== "setGroupIcon" && !shouldHydrateUploadFile) return;
	await hydrateAttachmentActionPayload({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		args: params.args,
		dryRun: params.dryRun,
		mediaPolicy: params.mediaPolicy,
		allowMessageCaptionFallback: params.action === "sendAttachment" || shouldHydrateUploadFile
	});
}
function parseButtonsParam(params) {
	const raw = params.buttons;
	if (typeof raw !== "string") return;
	const trimmed = raw.trim();
	if (!trimmed) {
		delete params.buttons;
		return;
	}
	try {
		params.buttons = JSON.parse(trimmed);
	} catch {
		throw new Error("--buttons must be valid JSON");
	}
}
function parseCardParam(params) {
	const raw = params.card;
	if (typeof raw !== "string") return;
	const trimmed = raw.trim();
	if (!trimmed) {
		delete params.card;
		return;
	}
	try {
		params.card = JSON.parse(trimmed);
	} catch {
		throw new Error("--card must be valid JSON");
	}
}
function parseComponentsParam(params) {
	const raw = params.components;
	if (typeof raw !== "string") return;
	const trimmed = raw.trim();
	if (!trimmed) {
		delete params.components;
		return;
	}
	try {
		params.components = JSON.parse(trimmed);
	} catch {
		throw new Error("--components must be valid JSON");
	}
}
function parseInteractiveParam(params) {
	const raw = params.interactive;
	if (typeof raw !== "string") return;
	const trimmed = raw.trim();
	if (!trimmed) {
		delete params.interactive;
		return;
	}
	try {
		params.interactive = JSON.parse(trimmed);
	} catch {
		throw new Error("--interactive must be valid JSON");
	}
}
//#endregion
//#region src/infra/outbound/message-action-threading.ts
function resolveAndApplyOutboundThreadId(actionParams, context) {
	const resolved = readStringParam(actionParams, "threadId") ?? context.resolveAutoThreadId?.({
		cfg: context.cfg,
		accountId: context.accountId,
		to: context.to,
		toolContext: context.toolContext,
		replyToId: readStringParam(actionParams, "replyTo")
	});
	if (resolved && !actionParams.threadId) actionParams.threadId = resolved;
	return resolved ?? void 0;
}
async function prepareOutboundMirrorRoute(params) {
	const replyToId = readStringParam(params.actionParams, "replyTo");
	const resolvedThreadId = resolveAndApplyOutboundThreadId(params.actionParams, {
		cfg: params.cfg,
		to: params.to,
		accountId: params.accountId,
		toolContext: params.toolContext,
		resolveAutoThreadId: params.resolveAutoThreadId
	});
	const outboundRoute = params.agentId && !params.dryRun ? await params.resolveOutboundSessionRoute({
		cfg: params.cfg,
		channel: params.channel,
		agentId: params.agentId,
		accountId: params.accountId,
		target: params.to,
		currentSessionKey: params.currentSessionKey,
		resolvedTarget: params.resolvedTarget,
		replyToId,
		threadId: resolvedThreadId
	}) : null;
	if (outboundRoute && params.agentId && !params.dryRun) await params.ensureOutboundSessionEntry({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		route: outboundRoute
	});
	if (outboundRoute && !params.dryRun) params.actionParams.__sessionKey = outboundRoute.sessionKey;
	if (params.agentId) params.actionParams.__agentId = params.agentId;
	return {
		resolvedThreadId,
		outboundRoute
	};
}
//#endregion
//#region src/infra/outbound/channel-adapters.ts
const DEFAULT_ADAPTER = { supportsComponentsV2: false };
function getChannelMessageAdapter(channel) {
	const adapter = getChannelPlugin(channel)?.messaging?.buildCrossContextComponents;
	if (adapter) return {
		supportsComponentsV2: true,
		buildCrossContextComponents: adapter
	};
	return DEFAULT_ADAPTER;
}
//#endregion
//#region src/infra/outbound/directory-cache.ts
function buildDirectoryCacheKey(key) {
	const signature = key.signature ?? "default";
	return `${key.channel}:${key.accountId ?? "default"}:${key.kind}:${key.source}:${signature}`;
}
var DirectoryCache = class {
	constructor(ttlMs, maxSize = 2e3) {
		this.ttlMs = ttlMs;
		this.cache = /* @__PURE__ */ new Map();
		this.lastConfigRef = null;
		this.maxSize = Math.max(1, Math.floor(maxSize));
	}
	get(key, cfg) {
		this.resetIfConfigChanged(cfg);
		this.pruneExpired(Date.now());
		const entry = this.cache.get(key);
		if (!entry) return;
		return entry.value;
	}
	set(key, value, cfg) {
		this.resetIfConfigChanged(cfg);
		const now = Date.now();
		this.pruneExpired(now);
		if (this.cache.has(key)) this.cache.delete(key);
		this.cache.set(key, {
			value,
			fetchedAt: now
		});
		this.evictToMaxSize();
	}
	clearMatching(match) {
		for (const key of this.cache.keys()) if (match(key)) this.cache.delete(key);
	}
	clear(cfg) {
		this.cache.clear();
		if (cfg) this.lastConfigRef = cfg;
	}
	resetIfConfigChanged(cfg) {
		if (this.lastConfigRef && this.lastConfigRef !== cfg) this.cache.clear();
		this.lastConfigRef = cfg;
	}
	pruneExpired(now) {
		if (this.ttlMs <= 0) return;
		for (const [cacheKey, entry] of this.cache.entries()) if (now - entry.fetchedAt > this.ttlMs) this.cache.delete(cacheKey);
	}
	evictToMaxSize() {
		while (this.cache.size > this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			if (typeof oldestKey !== "string") break;
			this.cache.delete(oldestKey);
		}
	}
};
//#endregion
//#region src/infra/outbound/target-resolver.ts
function asResolvedMessagingTarget(target) {
	return target;
}
async function resolveChannelTarget(params) {
	return resolveMessagingTarget(params);
}
const directoryCache = new DirectoryCache(1800 * 1e3);
function resetDirectoryCache(params) {
	if (!params?.channel) {
		directoryCache.clear();
		return;
	}
	const channelKey = params.channel;
	const accountKey = params.accountId ?? "default";
	directoryCache.clearMatching((key) => {
		if (!key.startsWith(`${channelKey}:`)) return false;
		if (!params.accountId) return true;
		return key.startsWith(`${channelKey}:${accountKey}:`);
	});
}
function normalizeQuery(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function stripTargetPrefixes(value) {
	return value.replace(/^(channel|user):/i, "").replace(/^[@#]/, "").trim();
}
function formatTargetDisplay(params) {
	const plugin = getChannelPlugin(params.channel);
	if (plugin?.messaging?.formatTargetDisplay) return plugin.messaging.formatTargetDisplay({
		target: params.target,
		display: params.display,
		kind: params.kind
	});
	const trimmedTarget = params.target.trim();
	const lowered = normalizeLowercaseStringOrEmpty(trimmedTarget);
	const display = params.display?.trim();
	const kind = params.kind ?? (lowered.startsWith("user:") ? "user" : lowered.startsWith("channel:") ? "group" : void 0);
	if (display) {
		if (display.startsWith("#") || display.startsWith("@")) return display;
		if (kind === "user") return `@${display}`;
		if (kind === "group" || kind === "channel") return `#${display}`;
		return display;
	}
	if (!trimmedTarget) return trimmedTarget;
	if (trimmedTarget.startsWith("#") || trimmedTarget.startsWith("@")) return trimmedTarget;
	const channelPrefix = `${params.channel}:`;
	const withoutProvider = lowered.startsWith(channelPrefix) ? trimmedTarget.slice(channelPrefix.length) : trimmedTarget;
	if (/^channel:/i.test(withoutProvider)) return `#${withoutProvider.replace(/^channel:/i, "")}`;
	if (/^user:/i.test(withoutProvider)) return `@${withoutProvider.replace(/^user:/i, "")}`;
	return withoutProvider;
}
function detectTargetKind(channel, raw, preferred) {
	if (preferred) return preferred;
	const trimmed = raw.trim();
	if (!trimmed) return "group";
	const inferredChatType = getChannelPlugin(channel)?.messaging?.inferTargetChatType?.({ to: raw });
	if (inferredChatType === "direct") return "user";
	if (inferredChatType === "channel") return "channel";
	if (inferredChatType === "group") return "group";
	if (trimmed.startsWith("@") || /^<@!?/.test(trimmed) || /^user:/i.test(trimmed)) return "user";
	if (trimmed.startsWith("#") || /^channel:/i.test(trimmed)) return "group";
	return "group";
}
function normalizeDirectoryEntryId(channel, entry) {
	return normalizeTargetForProvider(channel, entry.id) ?? entry.id.trim();
}
function matchesDirectoryEntry(params) {
	const query = normalizeQuery(params.query);
	if (!query) return false;
	return [
		stripTargetPrefixes(normalizeDirectoryEntryId(params.channel, params.entry)),
		params.entry.name ? stripTargetPrefixes(params.entry.name) : "",
		params.entry.handle ? stripTargetPrefixes(params.entry.handle) : ""
	].map((value) => normalizeQuery(value)).filter(Boolean).some((value) => value === query || value.includes(query));
}
function resolveMatch(params) {
	const matches = params.entries.filter((entry) => matchesDirectoryEntry({
		channel: params.channel,
		entry,
		query: params.query
	}));
	if (matches.length === 0) return { kind: "none" };
	if (matches.length === 1) return {
		kind: "single",
		entry: matches[0]
	};
	return {
		kind: "ambiguous",
		entries: matches
	};
}
async function listDirectoryEntries(params) {
	const directory = getChannelPlugin(params.channel)?.directory;
	if (!directory) return [];
	const runtime = params.runtime ?? defaultRuntime;
	const useLive = params.source === "live";
	const fn = params.kind === "user" ? useLive ? directory.listPeersLive ?? directory.listPeers : directory.listPeers : useLive ? directory.listGroupsLive ?? directory.listGroups : directory.listGroups;
	if (!fn) return [];
	return await fn({
		cfg: params.cfg,
		accountId: params.accountId ?? void 0,
		query: params.query ?? void 0,
		limit: void 0,
		runtime
	});
}
async function getDirectoryEntries(params) {
	const signature = buildTargetResolverSignature(params.channel);
	const listParams = {
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		kind: params.kind,
		query: params.query,
		runtime: params.runtime
	};
	const cacheKey = buildDirectoryCacheKey({
		channel: params.channel,
		accountId: params.accountId,
		kind: params.kind,
		source: "cache",
		signature
	});
	const cached = directoryCache.get(cacheKey, params.cfg);
	if (cached) return cached;
	const entries = await listDirectoryEntries({
		...listParams,
		source: "cache"
	});
	if (entries.length > 0 || !params.preferLiveOnMiss) {
		directoryCache.set(cacheKey, entries, params.cfg);
		return entries;
	}
	const liveKey = buildDirectoryCacheKey({
		channel: params.channel,
		accountId: params.accountId,
		kind: params.kind,
		source: "live",
		signature
	});
	const liveEntries = await listDirectoryEntries({
		...listParams,
		source: "live"
	});
	directoryCache.set(liveKey, liveEntries, params.cfg);
	directoryCache.set(cacheKey, liveEntries, params.cfg);
	return liveEntries;
}
function buildNormalizedResolveResult(params) {
	return {
		ok: true,
		target: {
			to: params.normalized,
			kind: params.kind,
			display: stripTargetPrefixes(params.normalized),
			source: "normalized"
		}
	};
}
function pickAmbiguousMatch(entries, mode) {
	if (entries.length === 0) return null;
	if (mode === "first") return entries[0] ?? null;
	const ranked = entries.map((entry) => ({
		entry,
		rank: typeof entry.rank === "number" ? entry.rank : 0
	}));
	const bestRank = Math.max(...ranked.map((item) => item.rank));
	return ranked.find((item) => item.rank === bestRank)?.entry ?? entries[0] ?? null;
}
async function resolveMessagingTarget(params) {
	const raw = normalizeChannelTargetInput(params.input);
	if (!raw) return {
		ok: false,
		error: /* @__PURE__ */ new Error("Target is required")
	};
	const plugin = getChannelPlugin(params.channel);
	const providerLabel = plugin?.meta?.label ?? params.channel;
	const hint = plugin?.messaging?.targetResolver?.hint;
	const kind = detectTargetKind(params.channel, raw, params.preferredKind);
	const normalizedInput = resolveNormalizedTargetInput(params.channel, raw);
	const normalized = normalizedInput?.normalized ?? raw;
	if (normalizedInput && looksLikeTargetId({
		channel: params.channel,
		raw: normalizedInput.raw,
		normalized
	})) {
		const resolvedIdLikeTarget = await maybeResolveIdLikeTarget({
			cfg: params.cfg,
			channel: params.channel,
			input: raw,
			accountId: params.accountId,
			preferredKind: params.preferredKind
		});
		if (resolvedIdLikeTarget) return {
			ok: true,
			target: resolvedIdLikeTarget
		};
		return buildNormalizedResolveResult({
			normalized,
			kind
		});
	}
	const query = stripTargetPrefixes(raw);
	const entries = await getDirectoryEntries({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		kind: kind === "user" ? "user" : "group",
		query,
		runtime: params.runtime,
		preferLiveOnMiss: true
	});
	const match = resolveMatch({
		channel: params.channel,
		entries,
		query
	});
	if (match.kind === "single") {
		const entry = match.entry;
		return {
			ok: true,
			target: {
				to: normalizeDirectoryEntryId(params.channel, entry),
				kind,
				display: entry.name ?? entry.handle ?? stripTargetPrefixes(entry.id),
				source: "directory"
			}
		};
	}
	if (match.kind === "ambiguous") {
		const mode = params.resolveAmbiguous ?? "error";
		if (mode !== "error") {
			const best = pickAmbiguousMatch(match.entries, mode);
			if (best) return {
				ok: true,
				target: {
					to: normalizeDirectoryEntryId(params.channel, best),
					kind,
					display: best.name ?? best.handle ?? stripTargetPrefixes(best.id),
					source: "directory"
				}
			};
		}
		return {
			ok: false,
			error: ambiguousTargetError(providerLabel, raw, hint),
			candidates: match.entries
		};
	}
	const resolvedFallbackTarget = asResolvedMessagingTarget(await maybeResolvePluginMessagingTarget({
		cfg: params.cfg,
		channel: params.channel,
		input: raw,
		accountId: params.accountId,
		preferredKind: params.preferredKind
	}));
	if (resolvedFallbackTarget) return {
		ok: true,
		target: resolvedFallbackTarget
	};
	return {
		ok: false,
		error: unknownTargetError(providerLabel, raw, hint)
	};
}
async function lookupDirectoryDisplay(params) {
	const normalized = normalizeTargetForProvider(params.channel, params.targetId) ?? params.targetId;
	const [groups, users] = await Promise.all([getDirectoryEntries({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		kind: "group",
		runtime: params.runtime,
		preferLiveOnMiss: false
	}), getDirectoryEntries({
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		kind: "user",
		runtime: params.runtime,
		preferLiveOnMiss: false
	})]);
	const findMatch = (candidates) => candidates.find((candidate) => normalizeDirectoryEntryId(params.channel, candidate) === normalized);
	const entry = findMatch(groups) ?? findMatch(users);
	return entry?.name ?? entry?.handle ?? void 0;
}
//#endregion
//#region src/infra/outbound/outbound-policy.ts
const CONTEXT_GUARDED_ACTIONS = new Set([
	"send",
	"poll",
	"reply",
	"sendWithEffect",
	"sendAttachment",
	"upload-file",
	"thread-create",
	"thread-reply",
	"sticker"
]);
const CONTEXT_MARKER_ACTIONS = new Set([
	"send",
	"poll",
	"reply",
	"sendWithEffect",
	"sendAttachment",
	"upload-file",
	"thread-reply",
	"sticker"
]);
function resolveContextGuardTarget(action, params) {
	if (!CONTEXT_GUARDED_ACTIONS.has(action)) return;
	if (action === "thread-reply" || action === "thread-create") {
		if (typeof params.channelId === "string") return params.channelId;
		if (typeof params.to === "string") return params.to;
		return;
	}
	if (typeof params.to === "string") return params.to;
	if (typeof params.channelId === "string") return params.channelId;
}
function normalizeTarget(channel, raw) {
	return normalizeTargetForProvider(channel, raw) ?? raw.trim();
}
function isCrossContextTarget(params) {
	const currentTarget = params.toolContext?.currentChannelId?.trim();
	if (!currentTarget) return false;
	const normalizedTarget = normalizeTarget(params.channel, params.target);
	const normalizedCurrent = normalizeTarget(params.channel, currentTarget);
	if (!normalizedTarget || !normalizedCurrent) return false;
	return normalizedTarget !== normalizedCurrent;
}
function enforceCrossContextPolicy(params) {
	const currentTarget = params.toolContext?.currentChannelId?.trim();
	if (!currentTarget) return;
	if (!CONTEXT_GUARDED_ACTIONS.has(params.action)) return;
	if (params.cfg.tools?.message?.allowCrossContextSend) return;
	const currentProvider = params.toolContext?.currentChannelProvider;
	const allowWithinProvider = params.cfg.tools?.message?.crossContext?.allowWithinProvider !== false;
	const allowAcrossProviders = params.cfg.tools?.message?.crossContext?.allowAcrossProviders === true;
	if (currentProvider && currentProvider !== params.channel) {
		if (!allowAcrossProviders) throw new Error(`Cross-context messaging denied: action=${params.action} target provider "${params.channel}" while bound to "${currentProvider}".`);
		return;
	}
	if (allowWithinProvider) return;
	const target = resolveContextGuardTarget(params.action, params.args);
	if (!target) return;
	if (!isCrossContextTarget({
		channel: params.channel,
		target,
		toolContext: params.toolContext
	})) return;
	throw new Error(`Cross-context messaging denied: action=${params.action} target="${target}" while bound to "${currentTarget}" (channel=${params.channel}).`);
}
async function buildCrossContextDecoration(params) {
	if (!params.toolContext?.currentChannelId) return null;
	if (params.toolContext.skipCrossContextDecoration) return null;
	if (!isCrossContextTarget(params)) return null;
	const markerConfig = params.cfg.tools?.message?.crossContext?.marker;
	if (markerConfig?.enabled === false) return null;
	const currentName = await lookupDirectoryDisplay({
		cfg: params.cfg,
		channel: params.channel,
		targetId: params.toolContext.currentChannelId,
		accountId: params.accountId ?? void 0
	}) ?? params.toolContext.currentChannelId;
	const originLabel = formatTargetDisplay({
		channel: params.channel,
		target: params.toolContext.currentChannelId,
		display: currentName
	});
	const prefixTemplate = markerConfig?.prefix ?? "[from {channel}] ";
	const suffixTemplate = markerConfig?.suffix ?? "";
	const prefix = prefixTemplate.replaceAll("{channel}", originLabel);
	const suffix = suffixTemplate.replaceAll("{channel}", originLabel);
	const adapter = getChannelMessageAdapter(params.channel);
	return {
		prefix,
		suffix,
		componentsBuilder: adapter.supportsComponentsV2 ? adapter.buildCrossContextComponents ? (message) => adapter.buildCrossContextComponents({
			originLabel,
			message,
			cfg: params.cfg,
			accountId: params.accountId ?? void 0
		}) : void 0 : void 0
	};
}
function shouldApplyCrossContextMarker(action) {
	return CONTEXT_MARKER_ACTIONS.has(action);
}
function applyCrossContextDecoration(params) {
	if (params.preferComponents && params.decoration.componentsBuilder) return {
		message: params.message,
		componentsBuilder: params.decoration.componentsBuilder,
		usedComponents: true
	};
	return {
		message: `${params.decoration.prefix}${params.message}${params.decoration.suffix}`,
		usedComponents: false
	};
}
//#endregion
//#region src/infra/outbound/outbound-send-service.ts
function collectActionMediaSources(params) {
	const sources = [];
	for (const key of [
		"media",
		"mediaUrl",
		"path",
		"filePath",
		"fileUrl"
	]) {
		const value = params[key];
		if (typeof value === "string" && value.trim()) sources.push(value);
	}
	return sources;
}
async function tryHandleWithPluginAction(params) {
	if (params.ctx.dryRun) return null;
	const mediaAccess = resolveAgentScopedOutboundMediaAccess({
		cfg: params.ctx.cfg,
		agentId: params.ctx.agentId ?? params.ctx.mirror?.agentId,
		mediaSources: collectActionMediaSources(params.ctx.params),
		sessionKey: params.ctx.sessionKey,
		messageProvider: params.ctx.sessionKey ? void 0 : params.ctx.channel,
		accountId: (params.ctx.sessionKey ? params.ctx.requesterAccountId ?? params.ctx.accountId : params.ctx.accountId) ?? void 0,
		requesterSenderId: params.ctx.requesterSenderId,
		requesterSenderName: params.ctx.requesterSenderName,
		requesterSenderUsername: params.ctx.requesterSenderUsername,
		requesterSenderE164: params.ctx.requesterSenderE164,
		mediaAccess: params.ctx.mediaAccess,
		mediaReadFile: params.ctx.mediaReadFile
	});
	const handled = await dispatchChannelMessageAction({
		channel: params.ctx.channel,
		action: params.action,
		cfg: params.ctx.cfg,
		params: params.ctx.params,
		mediaAccess,
		mediaLocalRoots: mediaAccess.localRoots,
		mediaReadFile: mediaAccess.readFile,
		accountId: params.ctx.accountId ?? void 0,
		gateway: params.ctx.gateway,
		toolContext: params.ctx.toolContext,
		dryRun: params.ctx.dryRun
	});
	if (!handled) return null;
	await params.onHandled?.();
	return {
		handledBy: "plugin",
		payload: extractToolPayload(handled),
		toolResult: handled
	};
}
async function executeSendAction(params) {
	throwIfAborted(params.ctx.abortSignal);
	const pluginHandled = await tryHandleWithPluginAction({
		ctx: params.ctx,
		action: "send",
		onHandled: async () => {
			if (!params.ctx.mirror) return;
			const mirrorText = params.ctx.mirror.text ?? params.message;
			const mirrorMediaUrls = params.ctx.mirror.mediaUrls ?? params.mediaUrls ?? (params.mediaUrl ? [params.mediaUrl] : void 0);
			await appendAssistantMessageToSessionTranscript({
				agentId: params.ctx.mirror.agentId,
				sessionKey: params.ctx.mirror.sessionKey,
				text: mirrorText,
				mediaUrls: mirrorMediaUrls,
				idempotencyKey: params.ctx.mirror.idempotencyKey
			});
		}
	});
	if (pluginHandled) return pluginHandled;
	throwIfAborted(params.ctx.abortSignal);
	const result = await sendMessage({
		cfg: params.ctx.cfg,
		to: params.to,
		content: params.message,
		agentId: params.ctx.agentId,
		requesterSessionKey: params.ctx.sessionKey,
		requesterAccountId: params.ctx.requesterAccountId ?? params.ctx.accountId ?? void 0,
		requesterSenderId: params.ctx.requesterSenderId,
		requesterSenderName: params.ctx.requesterSenderName,
		requesterSenderUsername: params.ctx.requesterSenderUsername,
		requesterSenderE164: params.ctx.requesterSenderE164,
		mediaUrl: params.mediaUrl || void 0,
		mediaUrls: params.mediaUrls,
		channel: params.ctx.channel || void 0,
		accountId: params.ctx.accountId ?? void 0,
		replyToId: params.replyToId,
		threadId: params.threadId,
		gifPlayback: params.gifPlayback,
		forceDocument: params.forceDocument,
		dryRun: params.ctx.dryRun,
		bestEffort: params.bestEffort ?? void 0,
		deps: params.ctx.deps,
		gateway: params.ctx.gateway,
		mirror: params.ctx.mirror,
		abortSignal: params.ctx.abortSignal,
		silent: params.ctx.silent
	});
	return {
		handledBy: "core",
		payload: result,
		sendResult: result
	};
}
async function executePollAction(params) {
	const pluginHandled = await tryHandleWithPluginAction({
		ctx: params.ctx,
		action: "poll"
	});
	if (pluginHandled) return pluginHandled;
	const corePoll = params.resolveCorePoll();
	const result = await sendPoll({
		cfg: params.ctx.cfg,
		to: corePoll.to,
		question: corePoll.question,
		options: corePoll.options,
		maxSelections: corePoll.maxSelections,
		durationSeconds: corePoll.durationSeconds ?? void 0,
		durationHours: corePoll.durationHours ?? void 0,
		channel: params.ctx.channel,
		accountId: params.ctx.accountId ?? void 0,
		threadId: corePoll.threadId ?? void 0,
		silent: params.ctx.silent ?? void 0,
		isAnonymous: corePoll.isAnonymous ?? void 0,
		dryRun: params.ctx.dryRun,
		gateway: params.ctx.gateway
	});
	return {
		handledBy: "core",
		payload: result,
		pollResult: result
	};
}
//#endregion
//#region src/infra/outbound/outbound-session.ts
function resolveOutboundChannelPlugin(channel) {
	return getChannelPlugin(channel);
}
function stripProviderPrefix(raw, channel) {
	const trimmed = raw.trim();
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	const prefix = `${normalizeLowercaseStringOrEmpty(channel)}:`;
	if (lower.startsWith(prefix)) return trimmed.slice(prefix.length).trim();
	return trimmed;
}
function stripKindPrefix(raw) {
	return raw.replace(/^(user|channel|group|conversation|room|dm):/i, "").trim();
}
function inferPeerKind(params) {
	const resolvedKind = params.resolvedTarget?.kind;
	if (resolvedKind === "user") return "direct";
	if (resolvedKind === "channel") return "channel";
	if (resolvedKind === "group") {
		const chatTypes = resolveOutboundChannelPlugin(params.channel)?.capabilities?.chatTypes ?? [];
		const supportsChannel = chatTypes.includes("channel");
		const supportsGroup = chatTypes.includes("group");
		if (supportsChannel && !supportsGroup) return "channel";
		return "group";
	}
	return "direct";
}
function buildBaseSessionKey(params) {
	return buildAgentSessionKey({
		agentId: params.agentId,
		channel: params.channel,
		accountId: params.accountId,
		peer: params.peer,
		dmScope: params.cfg.session?.dmScope ?? "main",
		identityLinks: params.cfg.session?.identityLinks
	});
}
function resolveFallbackSession(params) {
	const trimmed = stripProviderPrefix(params.target, params.channel).trim();
	if (!trimmed) return null;
	const peerKind = inferPeerKind({
		channel: params.channel,
		resolvedTarget: params.resolvedTarget
	});
	const peerId = stripKindPrefix(trimmed);
	if (!peerId) return null;
	const peer = {
		kind: peerKind,
		id: peerId
	};
	const baseSessionKey = buildBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: params.channel,
		accountId: params.accountId,
		peer
	});
	return {
		sessionKey: baseSessionKey,
		baseSessionKey,
		peer,
		chatType: peerKind === "direct" ? "direct" : peerKind === "channel" ? "channel" : "group",
		from: peerKind === "direct" ? `${params.channel}:${peerId}` : `${params.channel}:${peerKind}:${peerId}`,
		to: `${peerKind === "direct" ? "user" : "channel"}:${peerId}`
	};
}
async function resolveOutboundSessionRoute(params) {
	const target = params.target.trim();
	if (!target) return null;
	const nextParams = {
		...params,
		target
	};
	const resolver = resolveOutboundChannelPlugin(params.channel)?.messaging?.resolveOutboundSessionRoute;
	if (resolver) return await resolver(nextParams);
	return resolveFallbackSession(nextParams);
}
async function ensureOutboundSessionEntry(params) {
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId: resolveAgentIdFromSessionKey(params.route.sessionKey) });
	const ctx = {
		From: params.route.from,
		To: params.route.to,
		SessionKey: params.route.sessionKey,
		AccountId: params.accountId ?? void 0,
		ChatType: params.route.chatType,
		Provider: params.channel,
		Surface: params.channel,
		MessageThreadId: params.route.threadId,
		OriginatingChannel: params.channel,
		OriginatingTo: params.route.to
	};
	try {
		await recordSessionMetaFromInbound({
			storePath,
			sessionKey: params.route.sessionKey,
			ctx
		});
	} catch {}
}
//#endregion
//#region src/infra/outbound/message-action-runner.ts
let messageActionGatewayRuntimePromise = null;
function loadMessageActionGatewayRuntime() {
	messageActionGatewayRuntimePromise ??= import("./message.gateway.runtime-CEEohoxV.js");
	return messageActionGatewayRuntimePromise;
}
function getToolResult(result) {
	return "toolResult" in result ? result.toolResult : void 0;
}
function resolveGatewayActionOptions(gateway) {
	return {
		url: gateway?.url,
		token: gateway?.token,
		timeoutMs: typeof gateway?.timeoutMs === "number" && Number.isFinite(gateway.timeoutMs) ? Math.max(1, Math.floor(gateway.timeoutMs)) : 1e4,
		clientName: gateway?.clientName ?? GATEWAY_CLIENT_NAMES.CLI,
		clientDisplayName: gateway?.clientDisplayName,
		mode: gateway?.mode ?? GATEWAY_CLIENT_MODES.CLI
	};
}
async function callGatewayMessageAction(params) {
	const { callGatewayLeastPrivilege } = await loadMessageActionGatewayRuntime();
	const gateway = resolveGatewayActionOptions(params.gateway);
	return await callGatewayLeastPrivilege({
		url: gateway.url,
		token: gateway.token,
		method: "message.action",
		params: params.actionParams,
		timeoutMs: gateway.timeoutMs,
		clientName: gateway.clientName,
		clientDisplayName: gateway.clientDisplayName,
		mode: gateway.mode
	});
}
async function resolveGatewayActionIdempotencyKey(idempotencyKey) {
	if (idempotencyKey) return idempotencyKey;
	const { randomIdempotencyKey } = await loadMessageActionGatewayRuntime();
	return randomIdempotencyKey();
}
function applyCrossContextMessageDecoration({ params, message, decoration, preferComponents }) {
	const applied = applyCrossContextDecoration({
		message,
		decoration,
		preferComponents
	});
	params.message = applied.message;
	if (applied.componentsBuilder) params.components = applied.componentsBuilder;
	return applied.message;
}
async function maybeApplyCrossContextMarker(params) {
	if (!shouldApplyCrossContextMarker(params.action) || !params.toolContext) return params.message;
	const decoration = await buildCrossContextDecoration({
		cfg: params.cfg,
		channel: params.channel,
		target: params.target,
		toolContext: params.toolContext,
		accountId: params.accountId ?? void 0
	});
	if (!decoration) return params.message;
	return applyCrossContextMessageDecoration({
		params: params.args,
		message: params.message,
		decoration,
		preferComponents: params.preferComponents
	});
}
async function resolveChannel(cfg, params, toolContext) {
	const selection = await resolveMessageChannelSelection({
		cfg,
		channel: readStringParam(params, "channel"),
		fallbackChannel: toolContext?.currentChannelProvider
	});
	if (selection.source === "tool-context-fallback") params.channel = selection.channel;
	return selection.channel;
}
async function resolveActionTarget(params) {
	let resolvedTarget;
	const toRaw = normalizeOptionalString(params.args.to) ?? "";
	if (toRaw) {
		const resolved = await resolveResolvedTargetOrThrow({
			cfg: params.cfg,
			channel: params.channel,
			input: toRaw,
			accountId: params.accountId ?? void 0
		});
		params.args.to = resolved.to;
		resolvedTarget = resolved;
	}
	const channelIdRaw = normalizeOptionalString(params.args.channelId) ?? "";
	if (channelIdRaw) {
		const resolved = await resolveResolvedTargetOrThrow({
			cfg: params.cfg,
			channel: params.channel,
			input: channelIdRaw,
			accountId: params.accountId ?? void 0,
			preferredKind: "group",
			validateResolvedTarget: (target) => target.kind === "user" ? `Channel id "${channelIdRaw}" resolved to a user target.` : void 0
		});
		params.args.channelId = sanitizeGroupTargetId(resolved.to);
	}
	return resolvedTarget;
}
function sanitizeGroupTargetId(target) {
	return target.replace(/^(channel|group):/i, "");
}
async function resolveResolvedTargetOrThrow(params) {
	const resolved = await resolveChannelTarget({
		cfg: params.cfg,
		channel: params.channel,
		input: params.input,
		accountId: params.accountId,
		preferredKind: params.preferredKind
	});
	if (!resolved.ok) throw resolved.error;
	const validationError = params.validateResolvedTarget?.(resolved.target);
	if (validationError) throw new Error(validationError);
	return resolved.target;
}
function resolveGateway(input) {
	if (!input.gateway) return;
	return {
		url: input.gateway.url,
		token: input.gateway.token,
		timeoutMs: input.gateway.timeoutMs,
		clientName: input.gateway.clientName,
		clientDisplayName: input.gateway.clientDisplayName,
		mode: input.gateway.mode
	};
}
async function handleBroadcastAction(input, params) {
	throwIfAborted(input.abortSignal);
	if (!(input.cfg.tools?.message?.broadcast?.enabled !== false)) throw new Error("Broadcast is disabled. Set tools.message.broadcast.enabled to true.");
	const rawTargets = readStringArrayParam(params, "targets", { required: true });
	if (rawTargets.length === 0) throw new Error("Broadcast requires at least one target in --targets.");
	const channelHint = readStringParam(params, "channel");
	const targetChannels = channelHint && normalizeOptionalLowercaseString(channelHint) !== "all" ? [await resolveChannel(input.cfg, { channel: channelHint }, input.toolContext)] : await (async () => {
		const configured = await listConfiguredMessageChannels(input.cfg);
		if (configured.length === 0) throw new Error("Broadcast requires at least one configured channel.");
		return configured;
	})();
	const results = [];
	const isAbortError = (err) => err instanceof Error && err.name === "AbortError";
	for (const targetChannel of targetChannels) {
		throwIfAborted(input.abortSignal);
		for (const target of rawTargets) {
			throwIfAborted(input.abortSignal);
			try {
				const resolved = await resolveResolvedTargetOrThrow({
					cfg: input.cfg,
					channel: targetChannel,
					input: target
				});
				const sendResult = await runMessageAction({
					...input,
					action: "send",
					params: {
						...params,
						channel: targetChannel,
						target: resolved.to
					}
				});
				results.push({
					channel: targetChannel,
					to: resolved.to,
					ok: true,
					result: sendResult.kind === "send" ? sendResult.sendResult : void 0
				});
			} catch (err) {
				if (isAbortError(err)) throw err;
				results.push({
					channel: targetChannel,
					to: target,
					ok: false,
					error: formatErrorMessage(err)
				});
			}
		}
	}
	return {
		kind: "broadcast",
		channel: targetChannels[0] ?? normalizeOptionalLowercaseString(channelHint) ?? "unknown",
		action: "broadcast",
		handledBy: input.dryRun ? "dry-run" : "core",
		payload: { results },
		dryRun: Boolean(input.dryRun)
	};
}
async function handleSendAction(ctx) {
	const { cfg, params, channel, accountId, dryRun, gateway, input, agentId, resolvedTarget, abortSignal } = ctx;
	throwIfAborted(abortSignal);
	const action = "send";
	const to = readStringParam(params, "to", { required: true });
	const mediaHint = readStringParam(params, "media", { trim: false }) ?? readStringParam(params, "mediaUrl", { trim: false }) ?? readStringParam(params, "path", { trim: false }) ?? readStringParam(params, "filePath", { trim: false }) ?? readStringParam(params, "fileUrl", { trim: false });
	const hasButtons = Array.isArray(params.buttons) && params.buttons.length > 0;
	const hasCard = params.card != null && typeof params.card === "object";
	const hasComponents = params.components != null && typeof params.components === "object";
	const hasInteractive = hasInteractiveReplyBlocks(params.interactive);
	const hasBlocks = Array.isArray(params.blocks) && params.blocks.length > 0 || typeof params.blocks === "string" && params.blocks.trim().length > 0;
	const caption = readStringParam(params, "caption", { allowEmpty: true }) ?? "";
	let message = readStringParam(params, "message", {
		required: !mediaHint && !hasButtons && !hasCard && !hasComponents && !hasInteractive && !hasBlocks,
		allowEmpty: true
	}) ?? "";
	if (message.includes("\\n")) message = message.replaceAll("\\n", "\n");
	if (!message.trim() && caption.trim()) message = caption;
	const parsed = parseReplyDirectives(message);
	const mergedMediaUrls = [];
	const seenMedia = /* @__PURE__ */ new Set();
	const pushMedia = (value) => {
		const trimmed = normalizeOptionalString(value);
		if (!trimmed) return;
		if (seenMedia.has(trimmed)) return;
		seenMedia.add(trimmed);
		mergedMediaUrls.push(trimmed);
	};
	pushMedia(mediaHint);
	for (const url of parsed.mediaUrls ?? []) pushMedia(url);
	pushMedia(parsed.mediaUrl);
	const normalizedMediaUrls = await normalizeSandboxMediaList({
		values: mergedMediaUrls,
		sandboxRoot: input.sandboxRoot
	});
	mergedMediaUrls.length = 0;
	mergedMediaUrls.push(...normalizedMediaUrls);
	message = parsed.text;
	params.message = message;
	if (!params.replyTo && parsed.replyToId) params.replyTo = parsed.replyToId;
	if (!params.media) params.media = mergedMediaUrls[0] || void 0;
	message = await maybeApplyCrossContextMarker({
		cfg,
		channel,
		action,
		target: to,
		toolContext: input.toolContext,
		accountId,
		args: params,
		message,
		preferComponents: true
	});
	const mediaUrl = readStringParam(params, "media", { trim: false });
	if (!hasReplyPayloadContent({
		text: message,
		mediaUrl,
		mediaUrls: mergedMediaUrls,
		interactive: params.interactive
	}, { extraContent: hasButtons || hasCard || hasComponents || hasBlocks })) throw new Error("send requires text or media");
	params.message = message;
	const gifPlayback = readBooleanParam(params, "gifPlayback") ?? false;
	const forceDocument = readBooleanParam(params, "forceDocument") ?? readBooleanParam(params, "asDocument") ?? false;
	const bestEffort = readBooleanParam(params, "bestEffort");
	const silent = readBooleanParam(params, "silent");
	const replyToId = readStringParam(params, "replyTo");
	const { resolvedThreadId, outboundRoute } = await prepareOutboundMirrorRoute({
		cfg,
		channel,
		to,
		actionParams: params,
		accountId,
		toolContext: input.toolContext,
		agentId,
		currentSessionKey: input.sessionKey,
		dryRun,
		resolvedTarget,
		resolveAutoThreadId: getChannelPlugin(channel)?.threading?.resolveAutoThreadId,
		resolveOutboundSessionRoute,
		ensureOutboundSessionEntry
	});
	const mirrorMediaUrls = mergedMediaUrls.length > 0 ? mergedMediaUrls : mediaUrl ? [mediaUrl] : void 0;
	throwIfAborted(abortSignal);
	const send = await executeSendAction({
		ctx: {
			cfg,
			channel,
			params,
			agentId,
			sessionKey: input.sessionKey,
			requesterAccountId: input.requesterAccountId ?? void 0,
			requesterSenderId: input.requesterSenderId ?? void 0,
			requesterSenderName: input.requesterSenderName ?? void 0,
			requesterSenderUsername: input.requesterSenderUsername ?? void 0,
			requesterSenderE164: input.requesterSenderE164 ?? void 0,
			mediaAccess: ctx.mediaAccess,
			accountId: accountId ?? void 0,
			gateway,
			toolContext: input.toolContext,
			deps: input.deps,
			dryRun,
			mirror: outboundRoute && !dryRun ? {
				sessionKey: outboundRoute.sessionKey,
				agentId,
				text: message,
				mediaUrls: mirrorMediaUrls
			} : void 0,
			abortSignal,
			silent: silent ?? void 0
		},
		to,
		message,
		mediaUrl: mediaUrl || void 0,
		mediaUrls: mergedMediaUrls.length ? mergedMediaUrls : void 0,
		gifPlayback,
		forceDocument,
		bestEffort: bestEffort ?? void 0,
		replyToId: replyToId ?? void 0,
		threadId: resolvedThreadId ?? void 0
	});
	return {
		kind: "send",
		channel,
		action,
		to,
		handledBy: send.handledBy,
		payload: send.payload,
		toolResult: send.toolResult,
		sendResult: send.sendResult,
		dryRun
	};
}
async function handlePollAction(ctx) {
	const { cfg, params, channel, accountId, dryRun, gateway, input, abortSignal } = ctx;
	throwIfAborted(abortSignal);
	const action = "poll";
	const to = readStringParam(params, "to", { required: true });
	const silent = readBooleanParam(params, "silent");
	const resolvedThreadId = resolveAndApplyOutboundThreadId(params, {
		cfg,
		to,
		accountId,
		toolContext: input.toolContext,
		resolveAutoThreadId: getChannelPlugin(channel)?.threading?.resolveAutoThreadId
	});
	const base = typeof params.message === "string" ? params.message : "";
	await maybeApplyCrossContextMarker({
		cfg,
		channel,
		action,
		target: to,
		toolContext: input.toolContext,
		accountId,
		args: params,
		message: base,
		preferComponents: false
	});
	const poll = await executePollAction({
		ctx: {
			cfg,
			channel,
			params,
			accountId: accountId ?? void 0,
			gateway,
			toolContext: input.toolContext,
			dryRun,
			silent: silent ?? void 0
		},
		resolveCorePoll: () => {
			const question = readStringParam(params, "pollQuestion", { required: true });
			const options = readStringArrayParam(params, "pollOption", { required: true });
			if (options.length < 2) throw new Error("pollOption requires at least two values");
			const allowMultiselect = readBooleanParam(params, "pollMulti") ?? false;
			const durationHours = readNumberParam(params, "pollDurationHours", {
				integer: true,
				strict: true
			});
			return {
				to,
				question,
				options,
				maxSelections: resolvePollMaxSelections(options.length, allowMultiselect),
				durationHours: durationHours ?? void 0,
				threadId: resolvedThreadId ?? void 0
			};
		}
	});
	return {
		kind: "poll",
		channel,
		action,
		to,
		handledBy: poll.handledBy,
		payload: poll.payload,
		toolResult: poll.toolResult,
		pollResult: poll.pollResult,
		dryRun
	};
}
async function handlePluginAction(ctx) {
	const { cfg, params, channel, mediaAccess, accountId, dryRun, gateway, input, abortSignal, agentId } = ctx;
	throwIfAborted(abortSignal);
	const action = input.action;
	if (dryRun) return {
		kind: "action",
		channel,
		action,
		handledBy: "dry-run",
		payload: {
			ok: true,
			dryRun: true,
			channel,
			action
		},
		dryRun: true
	};
	const plugin = resolveOutboundChannelPlugin$1({
		channel,
		cfg
	});
	if (!plugin?.actions?.handleAction) throw new Error(`Channel ${channel} is unavailable for message actions (plugin not loaded).`);
	if ((plugin.actions.resolveExecutionMode?.({ action }) ?? "local") === "gateway" && gateway) return {
		kind: "action",
		channel,
		action,
		handledBy: "plugin",
		payload: await callGatewayMessageAction({
			gateway,
			actionParams: {
				channel,
				action,
				params,
				accountId: accountId ?? void 0,
				requesterSenderId: input.requesterSenderId ?? void 0,
				senderIsOwner: input.senderIsOwner,
				sessionKey: input.sessionKey,
				sessionId: input.sessionId,
				agentId,
				toolContext: input.toolContext,
				idempotencyKey: await resolveGatewayActionIdempotencyKey(normalizeOptionalString(params.idempotencyKey))
			}
		}),
		dryRun
	};
	const handled = await dispatchChannelMessageAction({
		channel,
		action,
		cfg,
		params,
		mediaAccess,
		mediaLocalRoots: mediaAccess.localRoots,
		mediaReadFile: mediaAccess.readFile,
		accountId: accountId ?? void 0,
		requesterSenderId: input.requesterSenderId ?? void 0,
		senderIsOwner: input.senderIsOwner,
		sessionKey: input.sessionKey,
		sessionId: input.sessionId,
		agentId,
		gateway,
		toolContext: input.toolContext,
		dryRun
	});
	if (!handled) throw new Error(`Message action ${action} not supported for channel ${channel}.`);
	return {
		kind: "action",
		channel,
		action,
		handledBy: "plugin",
		payload: extractToolPayload(handled),
		toolResult: handled,
		dryRun
	};
}
async function runMessageAction(input) {
	const cfg = input.cfg;
	let params = { ...input.params };
	const resolvedAgentId = input.agentId ?? (input.sessionKey ? resolveSessionAgentId({
		sessionKey: input.sessionKey,
		config: cfg
	}) : void 0);
	parseButtonsParam(params);
	parseCardParam(params);
	parseComponentsParam(params);
	parseInteractiveParam(params);
	const action = input.action;
	if (action === "broadcast") return handleBroadcastAction(input, params);
	params = normalizeMessageActionInput({
		action,
		args: params,
		toolContext: input.toolContext
	});
	const channel = await resolveChannel(cfg, params, input.toolContext);
	let accountId = readStringParam(params, "accountId") ?? input.defaultAccountId;
	if (!accountId && resolvedAgentId) {
		const boundAccountIds = buildChannelAccountBindings(cfg).get(channel)?.get(normalizeAgentId(resolvedAgentId));
		if (boundAccountIds && boundAccountIds.length > 0) accountId = boundAccountIds[0];
	}
	if (accountId) params.accountId = accountId;
	const dryRun = Boolean(input.dryRun ?? readBooleanParam(params, "dryRun"));
	const normalizationPolicy = resolveAttachmentMediaPolicy({
		sandboxRoot: input.sandboxRoot,
		mediaLocalRoots: getAgentScopedMediaLocalRoots(cfg, resolvedAgentId)
	});
	const extraActionMediaSourceParamKeys = resolveExtraActionMediaSourceParamKeys({
		cfg,
		action,
		channel,
		accountId,
		sessionKey: input.sessionKey,
		sessionId: input.sessionId,
		agentId: resolvedAgentId,
		requesterSenderId: input.requesterSenderId,
		senderIsOwner: input.senderIsOwner
	});
	await normalizeSandboxMediaParams({
		args: params,
		mediaPolicy: normalizationPolicy,
		extraParamKeys: extraActionMediaSourceParamKeys
	});
	const mediaAccess = resolveAgentScopedOutboundMediaAccess({
		cfg,
		agentId: resolvedAgentId,
		mediaSources: collectActionMediaSourceHints(params, extraActionMediaSourceParamKeys),
		sessionKey: input.sessionKey,
		messageProvider: input.sessionKey ? void 0 : channel,
		accountId: input.sessionKey ? input.requesterAccountId ?? accountId : accountId,
		requesterSenderId: input.requesterSenderId,
		requesterSenderName: input.requesterSenderName,
		requesterSenderUsername: input.requesterSenderUsername,
		requesterSenderE164: input.requesterSenderE164
	});
	const mediaPolicy = resolveAttachmentMediaPolicy({
		sandboxRoot: input.sandboxRoot,
		mediaAccess
	});
	await hydrateAttachmentParamsForAction({
		cfg,
		channel,
		accountId,
		args: params,
		action,
		dryRun,
		mediaPolicy
	});
	const resolvedTarget = await resolveActionTarget({
		cfg,
		channel,
		action,
		args: params,
		accountId
	});
	enforceCrossContextPolicy({
		channel,
		action,
		args: params,
		toolContext: input.toolContext,
		cfg
	});
	if (action === "send" && hasPollCreationParams(params)) throw new Error("Poll fields require action \"poll\"; use action \"poll\" instead of \"send\".");
	const gateway = resolveGateway(input);
	if (action === "send") return handleSendAction({
		cfg,
		params,
		channel,
		mediaAccess,
		accountId,
		dryRun,
		gateway,
		input,
		agentId: resolvedAgentId,
		resolvedTarget,
		abortSignal: input.abortSignal
	});
	if (action === "poll") return handlePollAction({
		cfg,
		params,
		channel,
		mediaAccess,
		accountId,
		dryRun,
		gateway,
		input,
		abortSignal: input.abortSignal
	});
	return handlePluginAction({
		cfg,
		params,
		channel,
		mediaAccess,
		accountId,
		dryRun,
		gateway,
		input,
		agentId: resolvedAgentId,
		abortSignal: input.abortSignal
	});
}
//#endregion
export { formatTargetDisplay as a, SHARED_POLL_CREATION_PARAM_NAMES as c, resolveOutboundSessionRoute as i, dispatchChannelMessageAction as l, runMessageAction as n, resetDirectoryCache as o, ensureOutboundSessionEntry as r, POLL_CREATION_PARAM_DEFS as s, getToolResult as t };
