import { a as isRecord$1, c as readString, l as buildFeishuCommentTarget, n as encodeQuery, o as normalizeString, r as extractReplyText, s as parseCommentContentElements, u as normalizeCommentFileType } from "./comment-shared-BhUvGfra.js";
import { a as createFeishuClient, f as resolveFeishuAccount, i as createEventDispatcher, l as listEnabledFeishuAccounts, n as raceWithTimeoutAndAbort, o as createFeishuWSClient, p as resolveFeishuRuntimeAccount, r as waitForAbortableDelay, s as getFeishuUserAgent, t as probeFeishu } from "./probe-DftphXPF.js";
import { h as resolveReceiveIdType, i as createCommentTypingReactionLifecycle, t as deliverCommentThreadText } from "./drive-qXTyBlIh.js";
import { a as resolveFeishuReplyPolicy, c as createFeishuCardInteractionEnvelope, l as decodeFeishuCardAction, n as resolveFeishuAllowlistMatch, r as resolveFeishuGroupConfig, s as buildFeishuCardActionTextFallback, t as isFeishuGroupAllowed } from "./policy-DZXBlv3U.js";
import { t as buildFeishuConversationId } from "./conversation-id-MY-s6hH3.js";
import { t as getFeishuRuntime } from "./runtime-C8BytrqV.js";
import { n as createFeishuThreadBindingManager } from "./thread-bindings-Cns_pzNK.js";
import { buildAgentMediaPayload, createDedupeCache, createPersistentDedupe, createReplyPrefixContext, evaluateSupplementalContextVisibility, filterSupplementalContextItems, loadSessionStore, normalizeAgentId, resolveChannelContextVisibilityMode, resolveSessionStoreEntry } from "./runtime-api.js";
import { a as sendCardFeishu, c as sendStructuredCardFeishu, d as extractMentionTargets, f as isMentionForwardRequest, h as normalizeFeishuExternalKey, i as resolveFeishuCardTemplate, l as parsePostContent, m as sendMediaFeishu, n as getMessageFeishu, p as downloadMessageResourceFeishu, r as listFeishuThreadMessages, s as sendMessageFeishu, u as buildMentionedCardContent } from "./send-CBFYvmL7.js";
import { createChannelPairingController, createChannelPairingController as createChannelPairingController$1 } from "openclaw/plugin-sdk/channel-pairing";
import { ensureConfiguredBindingRouteReady, getSessionBindingService, resolveConfiguredBindingRoute } from "openclaw/plugin-sdk/conversation-runtime";
import { resolveAgentOutboundIdentity } from "openclaw/plugin-sdk/outbound-runtime";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import * as Lark from "@larksuiteoapi/node-sdk";
import { fetchWithSsrFGuard } from "openclaw/plugin-sdk/ssrf-runtime";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deriveLastRoutePolicy, resolveAgentIdFromSessionKey } from "openclaw/plugin-sdk/routing";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { WEBHOOK_ANOMALY_COUNTER_DEFAULTS, WEBHOOK_RATE_LIMIT_DEFAULTS, applyBasicWebhookRequestGuards, createFixedWindowRateLimiter, createWebhookAnomalyTracker } from "openclaw/plugin-sdk/webhook-ingress";
import * as crypto$1 from "crypto";
import { DEFAULT_GROUP_HISTORY_LIMIT, buildPendingHistoryContextFromMap, clearHistoryEntriesIfEnabled, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { resolveDefaultGroupPolicy, resolveOpenProviderRuntimeGroupPolicy, warnMissingProviderGroupPolicyFallbackOnce } from "openclaw/plugin-sdk/runtime-group-policy";
import { logTypingFailure } from "openclaw/plugin-sdk/channel-feedback";
import { resolveSendableOutboundReplyParts, resolveTextChunksWithFallback, sendMediaWithLeadingCaption } from "openclaw/plugin-sdk/reply-payload";
import * as http from "http";
import crypto from "node:crypto";
import { safeEqualSecret } from "openclaw/plugin-sdk/browser-security-runtime";
import { installRequestBodyLimitGuard, readWebhookBodyOrReject } from "openclaw/plugin-sdk/webhook-request-guards";
import { isAbortRequestText, isBtwRequestText } from "openclaw/plugin-sdk/reply-runtime";
//#region extensions/feishu/src/bot-content.ts
function resolveFeishuGroupSession(params) {
	const { chatId, senderOpenId, messageId, rootId, threadId, groupConfig, feishuCfg } = params;
	const normalizedThreadId = threadId?.trim();
	const normalizedRootId = rootId?.trim();
	const threadReply = Boolean(normalizedThreadId || normalizedRootId);
	const replyInThread = (groupConfig?.replyInThread ?? feishuCfg?.replyInThread ?? "disabled") === "enabled" || threadReply;
	const legacyTopicSessionMode = groupConfig?.topicSessionMode ?? feishuCfg?.topicSessionMode ?? "disabled";
	const groupSessionScope = groupConfig?.groupSessionScope ?? feishuCfg?.groupSessionScope ?? (legacyTopicSessionMode === "enabled" ? "group_topic" : "group");
	const topicScope = groupSessionScope === "group_topic" || groupSessionScope === "group_topic_sender" ? normalizedRootId ?? normalizedThreadId ?? (replyInThread ? messageId : null) : null;
	let peerId = chatId;
	switch (groupSessionScope) {
		case "group_sender":
			peerId = buildFeishuConversationId({
				chatId,
				scope: "group_sender",
				senderOpenId
			});
			break;
		case "group_topic":
			peerId = topicScope ? buildFeishuConversationId({
				chatId,
				scope: "group_topic",
				topicId: topicScope
			}) : chatId;
			break;
		case "group_topic_sender":
			peerId = topicScope ? buildFeishuConversationId({
				chatId,
				scope: "group_topic_sender",
				topicId: topicScope,
				senderOpenId
			}) : buildFeishuConversationId({
				chatId,
				scope: "group_sender",
				senderOpenId
			});
			break;
		default:
			peerId = chatId;
			break;
	}
	return {
		peerId,
		parentPeer: topicScope && (groupSessionScope === "group_topic" || groupSessionScope === "group_topic_sender") ? {
			kind: "group",
			id: chatId
		} : null,
		groupSessionScope,
		replyInThread,
		threadReply
	};
}
function parseMessageContent(content, messageType) {
	if (messageType === "post") return parsePostContent(content).textContent;
	try {
		const parsed = JSON.parse(content);
		if (messageType === "text") return parsed.text || "";
		if (messageType === "share_chat") {
			if (parsed && typeof parsed === "object") {
				const share = parsed;
				if (typeof share.body === "string" && share.body.trim()) return share.body.trim();
				if (typeof share.summary === "string" && share.summary.trim()) return share.summary.trim();
				if (typeof share.share_chat_id === "string" && share.share_chat_id.trim()) return `[Forwarded message: ${share.share_chat_id.trim()}]`;
			}
			return "[Forwarded message]";
		}
		if (messageType === "merge_forward") return "[Merged and Forwarded Message - loading...]";
		return content;
	} catch {
		return content;
	}
}
function formatSubMessageContent(content, contentType) {
	try {
		const parsed = JSON.parse(content);
		switch (contentType) {
			case "text": return parsed.text || content;
			case "post": return parsePostContent(content).textContent;
			case "image": return "[Image]";
			case "file": return `[File: ${parsed.file_name || "unknown"}]`;
			case "audio": return "[Audio]";
			case "video": return "[Video]";
			case "sticker": return "[Sticker]";
			case "merge_forward": return "[Nested Merged Forward]";
			default: return `[${contentType}]`;
		}
	} catch {
		return content;
	}
}
function parseMergeForwardContent(params) {
	const { content, log } = params;
	const maxMessages = 50;
	log?.("feishu: parsing merge_forward sub-messages from API response");
	let items;
	try {
		items = JSON.parse(content);
	} catch {
		log?.("feishu: merge_forward items parse failed");
		return "[Merged and Forwarded Message - parse error]";
	}
	if (!Array.isArray(items) || items.length === 0) return "[Merged and Forwarded Message - no sub-messages]";
	const subMessages = items.filter((item) => item.upper_message_id);
	if (subMessages.length === 0) return "[Merged and Forwarded Message - no sub-messages found]";
	log?.(`feishu: merge_forward contains ${subMessages.length} sub-messages`);
	subMessages.sort((a, b) => parseInt(a.create_time || "0", 10) - parseInt(b.create_time || "0", 10));
	const lines = ["[Merged and Forwarded Messages]"];
	for (const item of subMessages.slice(0, maxMessages)) lines.push(`- ${formatSubMessageContent(item.body?.content || "", item.msg_type || "text")}`);
	if (subMessages.length > maxMessages) lines.push(`... and ${subMessages.length - maxMessages} more messages`);
	return lines.join("\n");
}
function checkBotMentioned(event, botOpenId) {
	if (!botOpenId) return false;
	if ((event.message.content ?? "").includes("@_all")) return true;
	const mentions = event.message.mentions ?? [];
	if (mentions.length > 0) return mentions.some((mention) => mention.id.open_id === botOpenId);
	if (event.message.message_type === "post") return parsePostContent(event.message.content).mentionedOpenIds.some((id) => id === botOpenId);
	return false;
}
function normalizeMentions(text, mentions, botStripId) {
	if (!mentions || mentions.length === 0) return text;
	const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const escapeName = (value) => value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	let result = text;
	for (const mention of mentions) {
		const mentionId = mention.id.open_id;
		const replacement = botStripId && mentionId === botStripId ? "" : mentionId ? `<at user_id="${mentionId}">${escapeName(mention.name)}</at>` : `@${mention.name}`;
		result = result.replace(new RegExp(escaped(mention.key), "g"), () => replacement).trim();
	}
	return result;
}
function normalizeFeishuCommandProbeBody(text) {
	if (!text) return "";
	return text.replace(/<at\b[^>]*>[^<]*<\/at>/giu, " ").replace(/(^|\s)@[^/\s]+(?=\s|$|\/)/gu, "$1").replace(/\s+/g, " ").trim();
}
function parseMediaKeys(content, messageType) {
	try {
		const parsed = JSON.parse(content);
		const imageKey = normalizeFeishuExternalKey(parsed.image_key);
		const fileKey = normalizeFeishuExternalKey(parsed.file_key);
		switch (messageType) {
			case "image": return {
				imageKey,
				fileName: parsed.file_name
			};
			case "file":
			case "audio":
			case "sticker": return {
				fileKey,
				fileName: parsed.file_name
			};
			case "video":
			case "media": return {
				fileKey,
				imageKey,
				fileName: parsed.file_name
			};
			default: return {};
		}
	} catch {
		return {};
	}
}
function toMessageResourceType(messageType) {
	return messageType === "image" ? "image" : "file";
}
function inferPlaceholder(messageType) {
	switch (messageType) {
		case "image": return "<media:image>";
		case "file": return "<media:document>";
		case "audio": return "<media:audio>";
		case "video":
		case "media": return "<media:video>";
		case "sticker": return "<media:sticker>";
		default: return "<media:document>";
	}
}
async function resolveFeishuMediaList(params) {
	const { cfg, messageId, messageType, content, maxBytes, log, accountId } = params;
	if (![
		"image",
		"file",
		"audio",
		"video",
		"media",
		"sticker",
		"post"
	].includes(messageType)) return [];
	const out = [];
	const core = getFeishuRuntime();
	if (messageType === "post") {
		const { imageKeys, mediaKeys } = parsePostContent(content);
		if (imageKeys.length === 0 && mediaKeys.length === 0) return [];
		if (imageKeys.length > 0) log?.(`feishu: post message contains ${imageKeys.length} embedded image(s)`);
		if (mediaKeys.length > 0) log?.(`feishu: post message contains ${mediaKeys.length} embedded media file(s)`);
		for (const imageKey of imageKeys) try {
			const result = await downloadMessageResourceFeishu({
				cfg,
				messageId,
				fileKey: imageKey,
				type: "image",
				accountId
			});
			const contentType = result.contentType ?? await core.media.detectMime({ buffer: result.buffer });
			const saved = await core.channel.media.saveMediaBuffer(result.buffer, contentType, "inbound", maxBytes);
			out.push({
				path: saved.path,
				contentType: saved.contentType,
				placeholder: "<media:image>"
			});
			log?.(`feishu: downloaded embedded image ${imageKey}, saved to ${saved.path}`);
		} catch (err) {
			log?.(`feishu: failed to download embedded image ${imageKey}: ${String(err)}`);
		}
		for (const media of mediaKeys) try {
			const result = await downloadMessageResourceFeishu({
				cfg,
				messageId,
				fileKey: media.fileKey,
				type: "file",
				accountId
			});
			const contentType = result.contentType ?? await core.media.detectMime({ buffer: result.buffer });
			const saved = await core.channel.media.saveMediaBuffer(result.buffer, contentType, "inbound", maxBytes);
			out.push({
				path: saved.path,
				contentType: saved.contentType,
				placeholder: "<media:video>"
			});
			log?.(`feishu: downloaded embedded media ${media.fileKey}, saved to ${saved.path}`);
		} catch (err) {
			log?.(`feishu: failed to download embedded media ${media.fileKey}: ${String(err)}`);
		}
		return out;
	}
	const mediaKeys = parseMediaKeys(content, messageType);
	if (!mediaKeys.imageKey && !mediaKeys.fileKey) return [];
	try {
		const fileKey = mediaKeys.fileKey || mediaKeys.imageKey;
		if (!fileKey) return [];
		const result = await downloadMessageResourceFeishu({
			cfg,
			messageId,
			fileKey,
			type: toMessageResourceType(messageType),
			accountId
		});
		const contentType = result.contentType ?? await core.media.detectMime({ buffer: result.buffer });
		const saved = await core.channel.media.saveMediaBuffer(result.buffer, contentType, "inbound", maxBytes, result.fileName || mediaKeys.fileName);
		out.push({
			path: saved.path,
			contentType: saved.contentType,
			placeholder: inferPlaceholder(messageType)
		});
		log?.(`feishu: downloaded ${messageType} media, saved to ${saved.path}`);
	} catch (err) {
		log?.(`feishu: failed to download ${messageType} media: ${String(err)}`);
	}
	return out;
}
//#endregion
//#region extensions/feishu/src/bot-sender-name.ts
const IGNORED_PERMISSION_SCOPE_TOKENS = ["contact:contact.base:readonly"];
const FEISHU_SCOPE_CORRECTIONS = { "contact:contact.base:readonly": "contact:user.base:readonly" };
const SENDER_NAME_TTL_MS = 600 * 1e3;
const senderNameCache = /* @__PURE__ */ new Map();
function correctFeishuScopeInUrl(url) {
	let corrected = url;
	for (const [wrong, right] of Object.entries(FEISHU_SCOPE_CORRECTIONS)) {
		corrected = corrected.replaceAll(encodeURIComponent(wrong), encodeURIComponent(right));
		corrected = corrected.replaceAll(wrong, right);
	}
	return corrected;
}
function shouldSuppressPermissionErrorNotice(permissionError) {
	const message = normalizeLowercaseStringOrEmpty(permissionError.message);
	return IGNORED_PERMISSION_SCOPE_TOKENS.some((token) => message.includes(token));
}
function extractPermissionError(err) {
	if (!err || typeof err !== "object") return null;
	const data = err.response?.data;
	if (!data || typeof data !== "object") return null;
	const feishuErr = data;
	if (feishuErr.code !== 99991672) return null;
	const msg = feishuErr.msg ?? "";
	const urlMatch = msg.match(/https:\/\/[^\s,]+\/app\/[^\s,]+/);
	return {
		code: feishuErr.code,
		message: msg,
		grantUrl: urlMatch?.[0] ? correctFeishuScopeInUrl(urlMatch[0]) : void 0
	};
}
function resolveSenderLookupIdType(senderId) {
	const trimmed = senderId.trim();
	if (trimmed.startsWith("ou_")) return "open_id";
	if (trimmed.startsWith("on_")) return "union_id";
	return "user_id";
}
async function resolveFeishuSenderName(params) {
	const { account, senderId, log } = params;
	if (!account.configured) return {};
	const normalizedSenderId = senderId.trim();
	if (!normalizedSenderId) return {};
	const cached = senderNameCache.get(normalizedSenderId);
	const now = Date.now();
	if (cached && cached.expireAt > now) return { name: cached.name };
	try {
		const client = createFeishuClient(account);
		const userIdType = resolveSenderLookupIdType(normalizedSenderId);
		const user = (await client.contact.user.get({
			path: { user_id: normalizedSenderId },
			params: { user_id_type: userIdType }
		})).data?.user;
		const name = user?.name ?? user?.nickname ?? user?.en_name;
		if (name) {
			senderNameCache.set(normalizedSenderId, {
				name,
				expireAt: now + SENDER_NAME_TTL_MS
			});
			return { name };
		}
		return {};
	} catch (err) {
		const permErr = extractPermissionError(err);
		if (permErr) {
			if (shouldSuppressPermissionErrorNotice(permErr)) {
				log(`feishu: ignoring stale permission scope error: ${permErr.message}`);
				return {};
			}
			log(`feishu: permission error resolving sender name: code=${permErr.code}`);
			return { permissionError: permErr };
		}
		log(`feishu: failed to resolve sender name for ${normalizedSenderId}: ${String(err)}`);
		return {};
	}
}
//#endregion
//#region extensions/feishu/src/dedup.ts
const DEDUP_TTL_MS = 1440 * 60 * 1e3;
const MEMORY_MAX_SIZE = 1e3;
const FILE_MAX_ENTRIES = 1e4;
const processingClaims = createDedupeCache({
	ttlMs: 300 * 1e3,
	maxSize: 2e3
});
function resolveStateDirFromEnv(env = process.env) {
	const stateOverride = env.OPENCLAW_STATE_DIR?.trim();
	if (stateOverride) return stateOverride;
	if (env.VITEST || env.NODE_ENV === "test") return path.join(os.tmpdir(), ["openclaw-vitest", String(process.pid)].join("-"));
	return path.join(os.homedir(), ".openclaw");
}
function resolveNamespaceFilePath(namespace) {
	const safe = namespace.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(resolveStateDirFromEnv(), "feishu", "dedup", `${safe}.json`);
}
const persistentDedupe = createPersistentDedupe({
	ttlMs: DEDUP_TTL_MS,
	memoryMaxSize: MEMORY_MAX_SIZE,
	fileMaxEntries: FILE_MAX_ENTRIES,
	resolveFilePath: resolveNamespaceFilePath
});
function resolveEventDedupeKey(namespace, messageId) {
	const trimmed = messageId?.trim();
	if (!trimmed) return null;
	return `${namespace}:${trimmed}`;
}
function normalizeMessageId(messageId) {
	const trimmed = messageId?.trim();
	return trimmed ? trimmed : null;
}
function tryBeginFeishuMessageProcessing(messageId, namespace = "global") {
	return !processingClaims.check(resolveEventDedupeKey(namespace, messageId));
}
function releaseFeishuMessageProcessing(messageId, namespace = "global") {
	processingClaims.delete(resolveEventDedupeKey(namespace, messageId));
}
async function claimUnprocessedFeishuMessage(params) {
	const { messageId, namespace = "global", log } = params;
	const normalizedMessageId = normalizeMessageId(messageId);
	if (!normalizedMessageId) return "invalid";
	if (await hasProcessedFeishuMessage(normalizedMessageId, namespace, log)) return "duplicate";
	if (!tryBeginFeishuMessageProcessing(normalizedMessageId, namespace)) return "inflight";
	return "claimed";
}
async function finalizeFeishuMessageProcessing(params) {
	const { messageId, namespace = "global", log, claimHeld = false } = params;
	const normalizedMessageId = normalizeMessageId(messageId);
	if (!normalizedMessageId) return false;
	if (!claimHeld && !tryBeginFeishuMessageProcessing(normalizedMessageId, namespace)) return false;
	if (!await tryRecordMessagePersistent(normalizedMessageId, namespace, log)) {
		releaseFeishuMessageProcessing(normalizedMessageId, namespace);
		return false;
	}
	return true;
}
async function recordProcessedFeishuMessage(messageId, namespace = "global", log) {
	const normalizedMessageId = normalizeMessageId(messageId);
	if (!normalizedMessageId) return false;
	return await tryRecordMessagePersistent(normalizedMessageId, namespace, log);
}
async function hasProcessedFeishuMessage(messageId, namespace = "global", log) {
	const normalizedMessageId = normalizeMessageId(messageId);
	if (!normalizedMessageId) return false;
	return hasRecordedMessagePersistent(normalizedMessageId, namespace, log);
}
async function tryRecordMessagePersistent(messageId, namespace = "global", log) {
	return persistentDedupe.checkAndRecord(messageId, {
		namespace,
		onDiskError: (error) => {
			log?.(`feishu-dedup: disk error, falling back to memory: ${String(error)}`);
		}
	});
}
async function hasRecordedMessagePersistent(messageId, namespace = "global", log) {
	return persistentDedupe.hasRecent(messageId, {
		namespace,
		onDiskError: (error) => {
			log?.(`feishu-dedup: persistent peek failed: ${String(error)}`);
		}
	});
}
async function warmupDedupFromDisk(namespace, log) {
	return persistentDedupe.warmup(namespace, (error) => {
		log?.(`feishu-dedup: warmup disk error: ${String(error)}`);
	});
}
//#endregion
//#region extensions/feishu/src/dynamic-agent.ts
/**
* Check if a dynamic agent should be created for a DM user and create it if needed.
* This creates a unique agent instance with its own workspace for each DM user.
*/
async function maybeCreateDynamicAgent(params) {
	const { cfg, runtime, senderOpenId, dynamicCfg, log } = params;
	const existingBindings = cfg.bindings ?? [];
	if (existingBindings.some((b) => b.match?.channel === "feishu" && b.match?.peer?.kind === "direct" && b.match?.peer?.id === senderOpenId)) return {
		created: false,
		updatedCfg: cfg
	};
	if (dynamicCfg.maxAgents !== void 0) {
		if ((cfg.agents?.list ?? []).filter((a) => a.id.startsWith("feishu-")).length >= dynamicCfg.maxAgents) {
			log(`feishu: maxAgents limit (${dynamicCfg.maxAgents}) reached, not creating agent for ${senderOpenId}`);
			return {
				created: false,
				updatedCfg: cfg
			};
		}
	}
	const agentId = `feishu-${senderOpenId}`;
	if ((cfg.agents?.list ?? []).find((a) => a.id === agentId)) {
		log(`feishu: agent "${agentId}" exists, adding missing binding for ${senderOpenId}`);
		const updatedCfg = {
			...cfg,
			bindings: [...existingBindings, {
				agentId,
				match: {
					channel: "feishu",
					peer: {
						kind: "direct",
						id: senderOpenId
					}
				}
			}]
		};
		await runtime.config.writeConfigFile(updatedCfg);
		return {
			created: true,
			updatedCfg,
			agentId
		};
	}
	const workspaceTemplate = dynamicCfg.workspaceTemplate ?? "~/.openclaw/workspace-{agentId}";
	const agentDirTemplate = dynamicCfg.agentDirTemplate ?? "~/.openclaw/agents/{agentId}/agent";
	const workspace = resolveUserPath(workspaceTemplate.replace("{userId}", senderOpenId).replace("{agentId}", agentId));
	const agentDir = resolveUserPath(agentDirTemplate.replace("{userId}", senderOpenId).replace("{agentId}", agentId));
	log(`feishu: creating dynamic agent "${agentId}" for user ${senderOpenId}`);
	log(`  workspace: ${workspace}`);
	log(`  agentDir: ${agentDir}`);
	await fs.promises.mkdir(workspace, { recursive: true });
	await fs.promises.mkdir(agentDir, { recursive: true });
	const updatedCfg = {
		...cfg,
		agents: {
			...cfg.agents,
			list: [...cfg.agents?.list ?? [], {
				id: agentId,
				workspace,
				agentDir
			}]
		},
		bindings: [...existingBindings, {
			agentId,
			match: {
				channel: "feishu",
				peer: {
					kind: "direct",
					id: senderOpenId
				}
			}
		}]
	};
	await runtime.config.writeConfigFile(updatedCfg);
	return {
		created: true,
		updatedCfg,
		agentId
	};
}
/**
* Resolve a path that may start with ~ to the user's home directory.
*/
function resolveUserPath(p) {
	if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
	return p;
}
//#endregion
//#region extensions/feishu/src/reasoning-preview.ts
function resolveFeishuReasoningPreviewEnabled(params) {
	if (!params.sessionKey) return false;
	try {
		return resolveSessionStoreEntry({
			store: loadSessionStore(params.storePath, { skipCache: true }),
			sessionKey: params.sessionKey
		}).existing?.reasoningLevel === "stream";
	} catch {
		return false;
	}
}
//#endregion
//#region extensions/feishu/src/streaming-card.ts
const tokenCache = /* @__PURE__ */ new Map();
function resolveApiBase(domain) {
	if (domain === "lark") return "https://open.larksuite.com/open-apis";
	if (domain && domain !== "feishu" && domain.startsWith("http")) return `${domain.replace(/\/+$/, "")}/open-apis`;
	return "https://open.feishu.cn/open-apis";
}
function resolveAllowedHostnames(domain) {
	if (domain === "lark") return ["open.larksuite.com"];
	if (domain && domain !== "feishu" && domain.startsWith("http")) try {
		return [new URL(domain).hostname];
	} catch {
		return [];
	}
	return ["open.feishu.cn"];
}
async function getToken(creds) {
	const key = `${creds.domain ?? "feishu"}|${creds.appId}`;
	const cached = tokenCache.get(key);
	if (cached && cached.expiresAt > Date.now() + 6e4) return cached.token;
	const { response, release } = await fetchWithSsrFGuard({
		url: `${resolveApiBase(creds.domain)}/auth/v3/tenant_access_token/internal`,
		init: {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"User-Agent": getFeishuUserAgent()
			},
			body: JSON.stringify({
				app_id: creds.appId,
				app_secret: creds.appSecret
			})
		},
		policy: { allowedHostnames: resolveAllowedHostnames(creds.domain) },
		auditContext: "feishu.streaming-card.token"
	});
	if (!response.ok) {
		await release();
		throw new Error(`Token request failed with HTTP ${response.status}`);
	}
	const data = await response.json();
	await release();
	if (data.code !== 0 || !data.tenant_access_token) throw new Error(`Token error: ${data.msg}`);
	tokenCache.set(key, {
		token: data.tenant_access_token,
		expiresAt: Date.now() + (data.expire ?? 7200) * 1e3
	});
	return data.tenant_access_token;
}
function truncateSummary(text, max = 50) {
	if (!text) return "";
	const clean = text.replace(/\n/g, " ").trim();
	return clean.length <= max ? clean : clean.slice(0, max - 3) + "...";
}
function mergeStreamingText(previousText, nextText) {
	const previous = typeof previousText === "string" ? previousText : "";
	const next = typeof nextText === "string" ? nextText : "";
	if (!next) return previous;
	if (!previous || next === previous) return next;
	if (next.startsWith(previous)) return next;
	if (previous.startsWith(next)) return previous;
	if (next.includes(previous)) return next;
	if (previous.includes(next)) return previous;
	const maxOverlap = Math.min(previous.length, next.length);
	for (let overlap = maxOverlap; overlap > 0; overlap -= 1) if (previous.slice(-overlap) === next.slice(0, overlap)) return `${previous}${next.slice(overlap)}`;
	return `${previous}${next}`;
}
function resolveStreamingCardSendMode(options) {
	if (options?.replyToMessageId) return "reply";
	if (options?.rootId) return "root_create";
	return "create";
}
/** Streaming card session manager */
var FeishuStreamingSession = class {
	constructor(client, creds, log) {
		this.state = null;
		this.queue = Promise.resolve();
		this.closed = false;
		this.lastUpdateTime = 0;
		this.pendingText = null;
		this.flushTimer = null;
		this.updateThrottleMs = 100;
		this.client = client;
		this.creds = creds;
		this.log = log;
	}
	async start(receiveId, receiveIdType = "chat_id", options) {
		if (this.state) return;
		const apiBase = resolveApiBase(this.creds.domain);
		const elements = [{
			tag: "markdown",
			content: "⏳ Thinking...",
			element_id: "content"
		}];
		if (options?.note) {
			elements.push({ tag: "hr" });
			elements.push({
				tag: "markdown",
				content: `<font color='grey'>${options.note}</font>`,
				element_id: "note"
			});
		}
		const cardJson = {
			schema: "2.0",
			config: {
				streaming_mode: true,
				summary: { content: "[Generating...]" },
				streaming_config: {
					print_frequency_ms: { default: 50 },
					print_step: { default: 1 }
				}
			},
			body: { elements }
		};
		if (options?.header) cardJson.header = {
			title: {
				tag: "plain_text",
				content: options.header.title
			},
			template: resolveFeishuCardTemplate(options.header.template) ?? "blue"
		};
		const { response: createRes, release: releaseCreate } = await fetchWithSsrFGuard({
			url: `${apiBase}/cardkit/v1/cards`,
			init: {
				method: "POST",
				headers: {
					Authorization: `Bearer ${await getToken(this.creds)}`,
					"Content-Type": "application/json",
					"User-Agent": getFeishuUserAgent()
				},
				body: JSON.stringify({
					type: "card_json",
					data: JSON.stringify(cardJson)
				})
			},
			policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
			auditContext: "feishu.streaming-card.create"
		});
		if (!createRes.ok) {
			await releaseCreate();
			throw new Error(`Create card request failed with HTTP ${createRes.status}`);
		}
		const createData = await createRes.json();
		await releaseCreate();
		if (createData.code !== 0 || !createData.data?.card_id) throw new Error(`Create card failed: ${createData.msg}`);
		const cardId = createData.data.card_id;
		const cardContent = JSON.stringify({
			type: "card",
			data: { card_id: cardId }
		});
		let sendRes;
		const sendOptions = options ?? {};
		const sendMode = resolveStreamingCardSendMode(sendOptions);
		if (sendMode === "reply") sendRes = await this.client.im.message.reply({
			path: { message_id: sendOptions.replyToMessageId },
			data: {
				msg_type: "interactive",
				content: cardContent,
				...sendOptions.replyInThread ? { reply_in_thread: true } : {}
			}
		});
		else if (sendMode === "root_create") sendRes = await this.client.im.message.create({
			params: { receive_id_type: receiveIdType },
			data: Object.assign({
				receive_id: receiveId,
				msg_type: "interactive",
				content: cardContent
			}, { root_id: sendOptions.rootId })
		});
		else sendRes = await this.client.im.message.create({
			params: { receive_id_type: receiveIdType },
			data: {
				receive_id: receiveId,
				msg_type: "interactive",
				content: cardContent
			}
		});
		if (sendRes.code !== 0 || !sendRes.data?.message_id) throw new Error(`Send card failed: ${sendRes.msg}`);
		this.state = {
			cardId,
			messageId: sendRes.data.message_id,
			sequence: 1,
			currentText: "",
			hasNote: !!options?.note
		};
		this.log?.(`Started streaming: cardId=${cardId}, messageId=${sendRes.data.message_id}`);
	}
	async updateCardContent(text, onError) {
		if (!this.state) return;
		const apiBase = resolveApiBase(this.creds.domain);
		this.state.sequence += 1;
		await fetchWithSsrFGuard({
			url: `${apiBase}/cardkit/v1/cards/${this.state.cardId}/elements/content/content`,
			init: {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${await getToken(this.creds)}`,
					"Content-Type": "application/json",
					"User-Agent": getFeishuUserAgent()
				},
				body: JSON.stringify({
					content: text,
					sequence: this.state.sequence,
					uuid: `s_${this.state.cardId}_${this.state.sequence}`
				})
			},
			policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
			auditContext: "feishu.streaming-card.update"
		}).then(async ({ release }) => {
			await release();
		}).catch((error) => onError?.(error));
	}
	async update(text) {
		if (!this.state || this.closed) return;
		const mergedInput = mergeStreamingText(this.pendingText ?? this.state.currentText, text);
		if (!mergedInput || mergedInput === this.state.currentText) return;
		const now = Date.now();
		if (now - this.lastUpdateTime < this.updateThrottleMs) {
			this.pendingText = mergedInput;
			return;
		}
		this.pendingText = null;
		this.lastUpdateTime = now;
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}
		this.queue = this.queue.then(async () => {
			if (!this.state || this.closed) return;
			const mergedText = mergeStreamingText(this.state.currentText, mergedInput);
			if (!mergedText || mergedText === this.state.currentText) return;
			this.state.currentText = mergedText;
			await this.updateCardContent(mergedText, (e) => this.log?.(`Update failed: ${String(e)}`));
		});
		await this.queue;
	}
	async updateNoteContent(note) {
		if (!this.state || !this.state.hasNote) return;
		const apiBase = resolveApiBase(this.creds.domain);
		this.state.sequence += 1;
		await fetchWithSsrFGuard({
			url: `${apiBase}/cardkit/v1/cards/${this.state.cardId}/elements/note/content`,
			init: {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${await getToken(this.creds)}`,
					"Content-Type": "application/json",
					"User-Agent": getFeishuUserAgent()
				},
				body: JSON.stringify({
					content: `<font color='grey'>${note}</font>`,
					sequence: this.state.sequence,
					uuid: `n_${this.state.cardId}_${this.state.sequence}`
				})
			},
			policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
			auditContext: "feishu.streaming-card.note-update"
		}).then(async ({ release }) => {
			await release();
		}).catch((e) => this.log?.(`Note update failed: ${String(e)}`));
	}
	async close(finalText, options) {
		if (!this.state || this.closed) return;
		this.closed = true;
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}
		await this.queue;
		const pendingMerged = mergeStreamingText(this.state.currentText, this.pendingText ?? void 0);
		const text = finalText ? mergeStreamingText(pendingMerged, finalText) : pendingMerged;
		const apiBase = resolveApiBase(this.creds.domain);
		if (text && text !== this.state.currentText) {
			await this.updateCardContent(text);
			this.state.currentText = text;
		}
		if (options?.note) await this.updateNoteContent(options.note);
		this.state.sequence += 1;
		await fetchWithSsrFGuard({
			url: `${apiBase}/cardkit/v1/cards/${this.state.cardId}/settings`,
			init: {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${await getToken(this.creds)}`,
					"Content-Type": "application/json; charset=utf-8",
					"User-Agent": getFeishuUserAgent()
				},
				body: JSON.stringify({
					settings: JSON.stringify({ config: {
						streaming_mode: false,
						summary: { content: truncateSummary(text) }
					} }),
					sequence: this.state.sequence,
					uuid: `c_${this.state.cardId}_${this.state.sequence}`
				})
			},
			policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
			auditContext: "feishu.streaming-card.close"
		}).then(async ({ release }) => {
			await release();
		}).catch((e) => this.log?.(`Close failed: ${String(e)}`));
		const finalState = this.state;
		this.state = null;
		this.pendingText = null;
		this.log?.(`Closed streaming: cardId=${finalState.cardId}`);
	}
	isActive() {
		return this.state !== null && !this.closed;
	}
};
//#endregion
//#region extensions/feishu/src/typing.ts
const TYPING_EMOJI = "Typing";
/**
* Feishu API error codes that indicate the caller should back off.
* These must propagate to the typing circuit breaker so the keepalive loop
* can trip and stop retrying.
*
* - 99991400: Rate limit (too many requests per second)
* - 99991403: Monthly API call quota exceeded
* - 429: Standard HTTP 429 returned as a Feishu SDK error code
*
* @see https://open.feishu.cn/document/server-docs/api-call-guide/generic-error-code
*/
const FEISHU_BACKOFF_CODES = new Set([
	99991400,
	99991403,
	429
]);
/**
* Custom error class for Feishu backoff conditions detected from non-throwing
* SDK responses. Carries a numeric `.code` so that `isFeishuBackoffError()`
* recognises it when the error is caught downstream.
*/
var FeishuBackoffError = class extends Error {
	constructor(code) {
		super(`Feishu API backoff: code ${code}`);
		this.name = "FeishuBackoffError";
		this.code = code;
	}
};
/**
* Check whether an error represents a rate-limit or quota-exceeded condition
* from the Feishu API that should stop the typing keepalive loop.
*
* Handles two shapes:
* 1. AxiosError with `response.status` and `response.data.code`
* 2. Feishu SDK error with a top-level `code` property
*/
function isFeishuBackoffError(err) {
	if (typeof err !== "object" || err === null) return false;
	const response = err.response;
	if (response) {
		if (response.status === 429) return true;
		if (typeof response.data?.code === "number" && FEISHU_BACKOFF_CODES.has(response.data.code)) return true;
	}
	const code = err.code;
	if (typeof code === "number" && FEISHU_BACKOFF_CODES.has(code)) return true;
	return false;
}
/**
* Check whether a Feishu SDK response object contains a backoff error code.
*
* The Feishu SDK sometimes returns a normal response (no throw) with an
* API-level error code in the response body. This must be detected so the
* circuit breaker can trip. See codex review on #28157.
*/
function getBackoffCodeFromResponse(response) {
	if (typeof response !== "object" || response === null) return;
	const code = response.code;
	if (typeof code === "number" && FEISHU_BACKOFF_CODES.has(code)) return code;
}
/**
* Add a typing indicator (reaction) to a message.
*
* Rate-limit and quota errors are re-thrown so the circuit breaker in
* `createTypingCallbacks` (typing-start-guard) can trip and stop the
* keepalive loop. See #28062.
*
* Also checks for backoff codes in non-throwing SDK responses (#28157).
*/
async function addTypingIndicator(params) {
	const { cfg, messageId, accountId, runtime } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) return {
		messageId,
		reactionId: null
	};
	const client = createFeishuClient(account);
	try {
		const response = await client.im.messageReaction.create({
			path: { message_id: messageId },
			data: { reaction_type: { emoji_type: TYPING_EMOJI } }
		});
		const backoffCode = getBackoffCodeFromResponse(response);
		if (backoffCode !== void 0) {
			if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.(`[feishu] typing indicator response contains backoff code ${backoffCode}, stopping keepalive`);
			throw new FeishuBackoffError(backoffCode);
		}
		return {
			messageId,
			reactionId: response.data?.reaction_id ?? null
		};
	} catch (err) {
		if (isFeishuBackoffError(err)) {
			if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.("[feishu] typing indicator hit rate-limit/quota, stopping keepalive");
			throw err;
		}
		if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.(`[feishu] failed to add typing indicator: ${String(err)}`);
		return {
			messageId,
			reactionId: null
		};
	}
}
/**
* Remove a typing indicator (reaction) from a message.
*
* Rate-limit and quota errors are re-thrown for the same reason as above.
*/
async function removeTypingIndicator(params) {
	const { cfg, state, accountId, runtime } = params;
	if (!state.reactionId) return;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) return;
	const client = createFeishuClient(account);
	try {
		const backoffCode = getBackoffCodeFromResponse(await client.im.messageReaction.delete({ path: {
			message_id: state.messageId,
			reaction_id: state.reactionId
		} }));
		if (backoffCode !== void 0) {
			if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.(`[feishu] typing indicator removal response contains backoff code ${backoffCode}, stopping keepalive`);
			throw new FeishuBackoffError(backoffCode);
		}
	} catch (err) {
		if (isFeishuBackoffError(err)) {
			if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.("[feishu] typing indicator removal hit rate-limit/quota, stopping keepalive");
			throw err;
		}
		if (getFeishuRuntime().logging.shouldLogVerbose()) runtime?.log?.(`[feishu] failed to remove typing indicator: ${String(err)}`);
	}
}
//#endregion
//#region extensions/feishu/src/reply-dispatcher.ts
/** Detect if text contains markdown elements that benefit from card rendering */
function shouldUseCard(text) {
	return /```[\s\S]*?```/.test(text) || /\|.+\|[\r\n]+\|[-:| ]+\|/.test(text);
}
/** Maximum age (ms) for a message to receive a typing indicator reaction.
* Messages older than this are likely replays after context compaction (#30418). */
const TYPING_INDICATOR_MAX_AGE_MS = 2 * 6e4;
const MS_EPOCH_MIN = 0xe8d4a51000;
function normalizeEpochMs(timestamp) {
	if (!Number.isFinite(timestamp) || timestamp === void 0 || timestamp <= 0) return;
	return timestamp < MS_EPOCH_MIN ? timestamp * 1e3 : timestamp;
}
/** Build a card header from agent identity config. */
function resolveCardHeader(agentId, identity) {
	const name = identity?.name?.trim() || agentId;
	const emoji = identity?.emoji?.trim();
	return {
		title: emoji ? `${emoji} ${name}` : name,
		template: identity?.theme ?? "blue"
	};
}
/** Build a card note footer from agent identity and model context. */
function resolveCardNote(agentId, identity, prefixCtx) {
	const parts = [`Agent: ${identity?.name?.trim() || agentId}`];
	if (prefixCtx.model) parts.push(`Model: ${prefixCtx.model}`);
	if (prefixCtx.provider) parts.push(`Provider: ${prefixCtx.provider}`);
	return parts.join(" | ");
}
function createFeishuReplyDispatcher(params) {
	const core = getFeishuRuntime();
	const { cfg, agentId, chatId, replyToMessageId, skipReplyToInMessages, replyInThread, threadReply, rootId, mentionTargets, accountId, identity } = params;
	const sendReplyToMessageId = skipReplyToInMessages ? void 0 : replyToMessageId;
	const threadReplyMode = threadReply === true;
	const effectiveReplyInThread = threadReplyMode ? true : replyInThread;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	const prefixContext = createReplyPrefixContext({
		cfg,
		agentId
	});
	let typingState = null;
	const { typingCallbacks } = createChannelReplyPipeline({
		cfg,
		agentId,
		channel: "feishu",
		accountId,
		typing: {
			start: async () => {
				if (!(account.config.typingIndicator ?? true)) return;
				if (!replyToMessageId) return;
				const messageCreateTimeMs = normalizeEpochMs(params.messageCreateTimeMs);
				if (messageCreateTimeMs !== void 0 && Date.now() - messageCreateTimeMs > TYPING_INDICATOR_MAX_AGE_MS) return;
				if (typingState?.reactionId) return;
				typingState = await addTypingIndicator({
					cfg,
					messageId: replyToMessageId,
					accountId,
					runtime: params.runtime
				});
			},
			stop: async () => {
				if (!typingState) return;
				await removeTypingIndicator({
					cfg,
					state: typingState,
					accountId,
					runtime: params.runtime
				});
				typingState = null;
			},
			onStartError: (err) => logTypingFailure({
				log: (message) => params.runtime.log?.(message),
				channel: "feishu",
				action: "start",
				error: err
			}),
			onStopError: (err) => logTypingFailure({
				log: (message) => params.runtime.log?.(message),
				channel: "feishu",
				action: "stop",
				error: err
			})
		}
	});
	const textChunkLimit = core.channel.text.resolveTextChunkLimit(cfg, "feishu", accountId, { fallbackLimit: 4e3 });
	const chunkMode = core.channel.text.resolveChunkMode(cfg, "feishu");
	const tableMode = core.channel.text.resolveMarkdownTableMode({
		cfg,
		channel: "feishu"
	});
	const renderMode = account.config?.renderMode ?? "auto";
	const streamingEnabled = !threadReplyMode && account.config?.streaming !== false && renderMode !== "raw";
	const reasoningPreviewEnabled = streamingEnabled && params.allowReasoningPreview === true;
	let streaming = null;
	let streamText = "";
	let lastPartial = "";
	let reasoningText = "";
	const deliveredFinalTexts = /* @__PURE__ */ new Set();
	let partialUpdateQueue = Promise.resolve();
	let streamingStartPromise = null;
	const formatReasoningPrefix = (thinking) => {
		if (!thinking) return "";
		return `> 💭 **Thinking**\n${thinking.replace(/^Reasoning:\n/, "").replace(/^_(.*)_$/gm, "$1").split("\n").map((line) => `> ${line}`).join("\n")}`;
	};
	const buildCombinedStreamText = (thinking, answer) => {
		const parts = [];
		if (thinking) parts.push(formatReasoningPrefix(thinking));
		if (thinking && answer) parts.push("\n\n---\n\n");
		if (answer) parts.push(answer);
		return parts.join("");
	};
	const flushStreamingCardUpdate = (combined) => {
		partialUpdateQueue = partialUpdateQueue.then(async () => {
			if (streamingStartPromise) await streamingStartPromise;
			if (streaming?.isActive()) await streaming.update(combined);
		});
	};
	const queueStreamingUpdate = (nextText, options) => {
		if (!nextText) return;
		if (options?.dedupeWithLastPartial && nextText === lastPartial) return;
		if (options?.dedupeWithLastPartial) lastPartial = nextText;
		streamText = (options?.mode ?? "snapshot") === "delta" ? `${streamText}${nextText}` : mergeStreamingText(streamText, nextText);
		flushStreamingCardUpdate(buildCombinedStreamText(reasoningText, streamText));
	};
	const queueReasoningUpdate = (nextThinking) => {
		if (!nextThinking) return;
		reasoningText = nextThinking;
		flushStreamingCardUpdate(buildCombinedStreamText(reasoningText, streamText));
	};
	const startStreaming = () => {
		if (!streamingEnabled || streamingStartPromise || streaming) return;
		streamingStartPromise = (async () => {
			const creds = account.appId && account.appSecret ? {
				appId: account.appId,
				appSecret: account.appSecret,
				domain: account.domain
			} : null;
			if (!creds) return;
			streaming = new FeishuStreamingSession(createFeishuClient(account), creds, (message) => params.runtime.log?.(`feishu[${account.accountId}] ${message}`));
			try {
				const cardHeader = resolveCardHeader(agentId, identity);
				const cardNote = resolveCardNote(agentId, identity, prefixContext.prefixContext);
				await streaming.start(chatId, resolveReceiveIdType(chatId), {
					replyToMessageId,
					replyInThread: effectiveReplyInThread,
					rootId,
					header: cardHeader,
					note: cardNote
				});
			} catch (error) {
				params.runtime.error?.(`feishu: streaming start failed: ${String(error)}`);
				streaming = null;
				streamingStartPromise = null;
			}
		})();
	};
	const closeStreaming = async () => {
		if (streamingStartPromise) await streamingStartPromise;
		await partialUpdateQueue;
		if (streaming?.isActive()) {
			let text = buildCombinedStreamText(reasoningText, streamText);
			if (mentionTargets?.length) text = buildMentionedCardContent(mentionTargets, text);
			const finalNote = resolveCardNote(agentId, identity, prefixContext.prefixContext);
			await streaming.close(text, { note: finalNote });
		}
		streaming = null;
		streamingStartPromise = null;
		streamText = "";
		lastPartial = "";
		reasoningText = "";
	};
	const sendChunkedTextReply = async (params) => {
		const chunkSource = params.useCard ? params.text : core.channel.text.convertMarkdownTables(params.text, tableMode);
		const chunks = resolveTextChunksWithFallback(chunkSource, core.channel.text.chunkTextWithMode(chunkSource, textChunkLimit, chunkMode));
		for (const [index, chunk] of chunks.entries()) await params.sendChunk({
			chunk,
			isFirst: index === 0
		});
		if (params.infoKind === "final") deliveredFinalTexts.add(params.text);
	};
	const sendMediaReplies = async (payload) => {
		await sendMediaWithLeadingCaption({
			mediaUrls: resolveSendableOutboundReplyParts(payload).mediaUrls,
			caption: "",
			send: async ({ mediaUrl }) => {
				await sendMediaFeishu({
					cfg,
					to: chatId,
					mediaUrl,
					replyToMessageId: sendReplyToMessageId,
					replyInThread: effectiveReplyInThread,
					accountId
				});
			}
		});
	};
	const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
		responsePrefix: prefixContext.responsePrefix,
		responsePrefixContextProvider: prefixContext.responsePrefixContextProvider,
		humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, agentId),
		onReplyStart: async () => {
			deliveredFinalTexts.clear();
			if (streamingEnabled && renderMode === "card") startStreaming();
			await typingCallbacks?.onReplyStart?.();
		},
		deliver: async (payload, info) => {
			const reply = resolveSendableOutboundReplyParts(payload);
			const text = reply.text;
			const hasText = reply.hasText;
			const hasMedia = reply.hasMedia;
			const skipTextForDuplicateFinal = info?.kind === "final" && hasText && deliveredFinalTexts.has(text);
			const shouldDeliverText = hasText && !skipTextForDuplicateFinal;
			if (!shouldDeliverText && !hasMedia) return;
			if (shouldDeliverText) {
				const useCard = renderMode === "card" || renderMode === "auto" && shouldUseCard(text);
				if (info?.kind === "block") {
					if (!(streamingEnabled && useCard)) return;
					startStreaming();
					if (streamingStartPromise) await streamingStartPromise;
				}
				if (info?.kind === "final" && streamingEnabled && useCard) {
					startStreaming();
					if (streamingStartPromise) await streamingStartPromise;
				}
				if (streaming?.isActive()) {
					if (info?.kind === "block") queueStreamingUpdate(text, { mode: "delta" });
					if (info?.kind === "final") {
						streamText = mergeStreamingText(streamText, text);
						await closeStreaming();
						deliveredFinalTexts.add(text);
					}
					if (hasMedia) await sendMediaReplies(payload);
					return;
				}
				if (useCard) {
					const cardHeader = resolveCardHeader(agentId, identity);
					const cardNote = resolveCardNote(agentId, identity, prefixContext.prefixContext);
					await sendChunkedTextReply({
						text,
						useCard: true,
						infoKind: info?.kind,
						sendChunk: async ({ chunk, isFirst }) => {
							await sendStructuredCardFeishu({
								cfg,
								to: chatId,
								text: chunk,
								replyToMessageId: sendReplyToMessageId,
								replyInThread: effectiveReplyInThread,
								mentions: isFirst ? mentionTargets : void 0,
								accountId,
								header: cardHeader,
								note: cardNote
							});
						}
					});
				} else await sendChunkedTextReply({
					text,
					useCard: false,
					infoKind: info?.kind,
					sendChunk: async ({ chunk, isFirst }) => {
						await sendMessageFeishu({
							cfg,
							to: chatId,
							text: chunk,
							replyToMessageId: sendReplyToMessageId,
							replyInThread: effectiveReplyInThread,
							mentions: isFirst ? mentionTargets : void 0,
							accountId
						});
					}
				});
			}
			if (hasMedia) await sendMediaReplies(payload);
		},
		onError: async (error, info) => {
			params.runtime.error?.(`feishu[${account.accountId}] ${info.kind} reply failed: ${String(error)}`);
			await closeStreaming();
			typingCallbacks?.onIdle?.();
		},
		onIdle: async () => {
			await closeStreaming();
			typingCallbacks?.onIdle?.();
		},
		onCleanup: () => {
			typingCallbacks?.onCleanup?.();
		}
	});
	return {
		dispatcher,
		replyOptions: {
			...replyOptions,
			onModelSelected: prefixContext.onModelSelected,
			disableBlockStreaming: true,
			onPartialReply: streamingEnabled ? (payload) => {
				if (!payload.text) return;
				queueStreamingUpdate(payload.text, {
					dedupeWithLastPartial: true,
					mode: "snapshot"
				});
			} : void 0,
			onReasoningStream: reasoningPreviewEnabled ? (payload) => {
				if (!payload.text) return;
				startStreaming();
				queueReasoningUpdate(payload.text);
			} : void 0,
			onReasoningEnd: reasoningPreviewEnabled ? () => {} : void 0
		},
		markDispatchIdle
	};
}
//#endregion
//#region extensions/feishu/src/bot.ts
const permissionErrorNotifiedAt = /* @__PURE__ */ new Map();
const PERMISSION_ERROR_COOLDOWN_MS = 300 * 1e3;
function resolveBroadcastAgents(cfg, peerId) {
	const broadcast = cfg.broadcast;
	if (!broadcast || typeof broadcast !== "object") return null;
	const agents = broadcast[peerId];
	if (!Array.isArray(agents) || agents.length === 0) return null;
	return agents;
}
function buildBroadcastSessionKey(baseSessionKey, originalAgentId, targetAgentId) {
	const prefix = `agent:${originalAgentId}:`;
	if (baseSessionKey.startsWith(prefix)) return `agent:${targetAgentId}:${baseSessionKey.slice(prefix.length)}`;
	return baseSessionKey;
}
/**
* Build media payload for inbound context.
* Similar to Discord's buildDiscordMediaPayload().
*/
function parseFeishuMessageEvent(event, botOpenId, _botName) {
	const rawContent = parseMessageContent(event.message.content, event.message.message_type);
	const mentionedBot = checkBotMentioned(event, botOpenId);
	const hasAnyMention = (event.message.mentions?.length ?? 0) > 0;
	const content = normalizeMentions(rawContent, event.message.mentions, botOpenId);
	const senderOpenId = event.sender.sender_id.open_id?.trim();
	const senderUserId = event.sender.sender_id.user_id?.trim();
	const senderFallbackId = senderOpenId || senderUserId || "";
	const ctx = {
		chatId: event.message.chat_id,
		messageId: event.message.message_id,
		senderId: senderUserId || senderOpenId || "",
		senderOpenId: senderFallbackId,
		chatType: event.message.chat_type,
		mentionedBot,
		hasAnyMention,
		rootId: event.message.root_id || void 0,
		parentId: event.message.parent_id || void 0,
		threadId: event.message.thread_id || void 0,
		content,
		contentType: event.message.message_type
	};
	if (isMentionForwardRequest(event, botOpenId)) {
		const mentionTargets = extractMentionTargets(event, botOpenId);
		if (mentionTargets.length > 0) ctx.mentionTargets = mentionTargets;
	}
	return ctx;
}
function buildFeishuAgentBody(params) {
	const { ctx, quotedContent, permissionErrorForAgent, botOpenId } = params;
	let messageBody = ctx.content;
	if (quotedContent) messageBody = `[Replying to: "${quotedContent}"]\n\n${ctx.content}`;
	messageBody = `${ctx.senderName ?? ctx.senderOpenId}: ${messageBody}`;
	if (ctx.hasAnyMention) {
		const botIdHint = botOpenId?.trim();
		messageBody += "\n\n[System: The content may include mention tags in the form <at user_id=\"...\">name</at>. Treat these as real mentions of Feishu entities (users or bots).]";
		if (botIdHint) messageBody += `\n[System: If user_id is "${botIdHint}", that mention refers to you.]`;
	}
	if (ctx.mentionTargets && ctx.mentionTargets.length > 0) {
		const targetNames = ctx.mentionTargets.map((t) => t.name).join(", ");
		messageBody += `\n\n[System: Your reply will automatically @mention: ${targetNames}. Do not write @xxx yourself.]`;
	}
	messageBody = `[message_id: ${ctx.messageId}]\n${messageBody}`;
	if (permissionErrorForAgent) {
		const grantUrl = permissionErrorForAgent.grantUrl ?? "";
		messageBody += `\n\n[System: The bot encountered a Feishu API permission error. Please inform the user about this issue and provide the permission grant URL for the admin to authorize. Permission grant URL: ${grantUrl}]`;
	}
	return messageBody;
}
function isFetchedGroupContextSenderAllowed(params) {
	if (!params.isGroup || params.allowFrom.length === 0) return true;
	if (params.senderType === "app") return true;
	const senderId = params.senderId?.trim();
	return !!senderId && isFeishuGroupAllowed({
		groupPolicy: "allowlist",
		allowFrom: params.allowFrom,
		senderId,
		senderName: void 0
	});
}
function shouldIncludeFetchedGroupContextMessage(params) {
	const senderAllowed = isFetchedGroupContextSenderAllowed({
		isGroup: params.isGroup,
		allowFrom: params.allowFrom,
		senderId: params.senderId,
		senderType: params.senderType
	});
	return evaluateSupplementalContextVisibility({
		mode: params.mode,
		kind: params.kind,
		senderAllowed
	}).include;
}
function filterFetchedGroupContextMessages(messages, params) {
	return filterSupplementalContextItems({
		items: messages,
		mode: params.mode,
		kind: params.kind,
		isSenderAllowed: (message) => isFetchedGroupContextSenderAllowed({
			isGroup: params.isGroup,
			allowFrom: params.allowFrom,
			senderId: message.senderId,
			senderType: message.senderType
		})
	}).items;
}
async function handleFeishuMessage(params) {
	const { cfg, event, botOpenId, botName, runtime, chatHistories, accountId, processingClaimHeld = false } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	const feishuCfg = account.config;
	const log = runtime?.log ?? console.log;
	const error = runtime?.error ?? console.error;
	const messageId = event.message.message_id;
	if (!await finalizeFeishuMessageProcessing({
		messageId,
		namespace: account.accountId,
		log,
		claimHeld: processingClaimHeld
	})) {
		log(`feishu: skipping duplicate message ${messageId}`);
		return;
	}
	let ctx = parseFeishuMessageEvent(event, botOpenId, botName);
	const isGroup = ctx.chatType === "group";
	const isDirect = !isGroup;
	const senderUserId = normalizeOptionalString(event.sender.sender_id.user_id);
	if (event.message.message_type === "merge_forward") {
		log(`feishu[${account.accountId}]: processing merge_forward message, fetching full content via API`);
		try {
			const response = await createFeishuClient(account).im.message.get({ path: { message_id: event.message.message_id } });
			if (response.code === 0 && response.data?.items && response.data.items.length > 0) {
				log(`feishu[${account.accountId}]: merge_forward API returned ${response.data.items.length} items`);
				const expandedContent = parseMergeForwardContent({
					content: JSON.stringify(response.data.items),
					log
				});
				ctx = {
					...ctx,
					content: expandedContent
				};
			} else {
				log(`feishu[${account.accountId}]: merge_forward API returned no items`);
				ctx = {
					...ctx,
					content: "[Merged and Forwarded Message - could not fetch]"
				};
			}
		} catch (err) {
			log(`feishu[${account.accountId}]: merge_forward fetch failed: ${String(err)}`);
			ctx = {
				...ctx,
				content: "[Merged and Forwarded Message - fetch error]"
			};
		}
	}
	let permissionErrorForAgent;
	if (feishuCfg?.resolveSenderNames ?? true) {
		const senderResult = await resolveFeishuSenderName({
			account,
			senderId: ctx.senderOpenId,
			log
		});
		if (senderResult.name) ctx = {
			...ctx,
			senderName: senderResult.name
		};
		if (senderResult.permissionError) {
			const appKey = account.appId ?? "default";
			const now = Date.now();
			if (now - (permissionErrorNotifiedAt.get(appKey) ?? 0) > PERMISSION_ERROR_COOLDOWN_MS) {
				permissionErrorNotifiedAt.set(appKey, now);
				permissionErrorForAgent = senderResult.permissionError;
			}
		}
	}
	log(`feishu[${account.accountId}]: received message from ${ctx.senderOpenId} in ${ctx.chatId} (${ctx.chatType})`);
	if (ctx.mentionTargets && ctx.mentionTargets.length > 0) {
		const names = ctx.mentionTargets.map((t) => t.name).join(", ");
		log(`feishu[${account.accountId}]: detected @ forward request, targets: [${names}]`);
	}
	const historyLimit = Math.max(0, feishuCfg?.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? DEFAULT_GROUP_HISTORY_LIMIT);
	const groupConfig = isGroup ? resolveFeishuGroupConfig({
		cfg: feishuCfg,
		groupId: ctx.chatId
	}) : void 0;
	const effectiveGroupSenderAllowFrom = isGroup ? (groupConfig?.allowFrom?.length ?? 0) > 0 ? groupConfig?.allowFrom ?? [] : feishuCfg?.groupSenderAllowFrom ?? [] : [];
	const groupSession = isGroup ? resolveFeishuGroupSession({
		chatId: ctx.chatId,
		senderOpenId: ctx.senderOpenId,
		messageId: ctx.messageId,
		rootId: ctx.rootId,
		threadId: ctx.threadId,
		groupConfig,
		feishuCfg
	}) : null;
	const groupHistoryKey = isGroup ? groupSession?.peerId ?? ctx.chatId : void 0;
	const dmPolicy = feishuCfg?.dmPolicy ?? "pairing";
	const configAllowFrom = feishuCfg?.allowFrom ?? [];
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const rawBroadcastAgents = isGroup ? resolveBroadcastAgents(cfg, ctx.chatId) : null;
	const broadcastAgents = rawBroadcastAgents ? [...new Set(rawBroadcastAgents.map((id) => normalizeAgentId(id)))] : null;
	const messageCreateTimeMs = event.message.create_time ? parseInt(event.message.create_time, 10) : Date.now();
	let requireMention = false;
	if (isGroup) {
		if (groupConfig?.enabled === false) {
			log(`feishu[${account.accountId}]: group ${ctx.chatId} is disabled`);
			return;
		}
		const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
		const { groupPolicy, providerMissingFallbackApplied } = resolveOpenProviderRuntimeGroupPolicy({
			providerConfigPresent: cfg.channels?.feishu !== void 0,
			groupPolicy: feishuCfg?.groupPolicy,
			defaultGroupPolicy
		});
		warnMissingProviderGroupPolicyFallbackOnce({
			providerMissingFallbackApplied,
			providerKey: "feishu",
			accountId: account.accountId,
			log
		});
		if (!isFeishuGroupAllowed({
			groupPolicy,
			allowFrom: feishuCfg?.groupAllowFrom ?? [],
			senderId: ctx.chatId,
			senderName: void 0
		})) {
			log(`feishu[${account.accountId}]: group ${ctx.chatId} not in groupAllowFrom (groupPolicy=${groupPolicy})`);
			return;
		}
		if (effectiveGroupSenderAllowFrom.length > 0) {
			if (!isFeishuGroupAllowed({
				groupPolicy: "allowlist",
				allowFrom: effectiveGroupSenderAllowFrom,
				senderId: ctx.senderOpenId,
				senderIds: [senderUserId],
				senderName: ctx.senderName
			})) {
				log(`feishu: sender ${ctx.senderOpenId} not in group ${ctx.chatId} sender allowlist`);
				return;
			}
		}
		({requireMention} = resolveFeishuReplyPolicy({
			isDirectMessage: false,
			cfg,
			accountId: account.accountId,
			groupId: ctx.chatId,
			groupPolicy
		}));
		if (requireMention && !ctx.mentionedBot) {
			log(`feishu[${account.accountId}]: message in group ${ctx.chatId} did not mention bot`);
			if (!broadcastAgents && chatHistories && groupHistoryKey) recordPendingHistoryEntryIfEnabled({
				historyMap: chatHistories,
				historyKey: groupHistoryKey,
				limit: historyLimit,
				entry: {
					sender: ctx.senderOpenId,
					body: `${ctx.senderName ?? ctx.senderOpenId}: ${ctx.content}`,
					timestamp: messageCreateTimeMs,
					messageId: ctx.messageId
				}
			});
			return;
		}
	}
	try {
		const core = getFeishuRuntime();
		const pairing = createChannelPairingController({
			core,
			channel: "feishu",
			accountId: account.accountId
		});
		const commandProbeBody = isGroup ? normalizeFeishuCommandProbeBody(ctx.content) : ctx.content;
		const shouldComputeCommandAuthorized = core.channel.commands.shouldComputeCommandAuthorized(commandProbeBody, cfg);
		const storeAllowFrom = !isGroup && dmPolicy !== "allowlist" && (dmPolicy !== "open" || shouldComputeCommandAuthorized) ? await pairing.readAllowFromStore().catch(() => []) : [];
		const effectiveDmAllowFrom = [...configAllowFrom, ...storeAllowFrom];
		const dmAllowed = resolveFeishuAllowlistMatch({
			allowFrom: effectiveDmAllowFrom,
			senderId: ctx.senderOpenId,
			senderIds: [senderUserId],
			senderName: ctx.senderName
		}).allowed;
		if (isDirect && dmPolicy !== "open" && !dmAllowed) {
			if (dmPolicy === "pairing") await pairing.issueChallenge({
				senderId: ctx.senderOpenId,
				senderIdLine: `Your Feishu user id: ${ctx.senderOpenId}`,
				meta: { name: ctx.senderName },
				onCreated: () => {
					log(`feishu[${account.accountId}]: pairing request sender=${ctx.senderOpenId}`);
				},
				sendPairingReply: async (text) => {
					await sendMessageFeishu({
						cfg,
						to: `chat:${ctx.chatId}`,
						text,
						accountId: account.accountId
					});
				},
				onReplyError: (err) => {
					log(`feishu[${account.accountId}]: pairing reply failed for ${ctx.senderOpenId}: ${String(err)}`);
				}
			});
			else log(`feishu[${account.accountId}]: blocked unauthorized sender ${ctx.senderOpenId} (dmPolicy=${dmPolicy})`);
			return;
		}
		const commandAllowFrom = isGroup ? groupConfig?.allowFrom ?? configAllowFrom : effectiveDmAllowFrom;
		const senderAllowedForCommands = resolveFeishuAllowlistMatch({
			allowFrom: commandAllowFrom,
			senderId: ctx.senderOpenId,
			senderIds: [senderUserId],
			senderName: ctx.senderName
		}).allowed;
		const commandAuthorized = shouldComputeCommandAuthorized ? core.channel.commands.resolveCommandAuthorizedFromAuthorizers({
			useAccessGroups,
			authorizers: [{
				configured: commandAllowFrom.length > 0,
				allowed: senderAllowedForCommands
			}]
		}) : void 0;
		const feishuFrom = `feishu:${ctx.senderOpenId}`;
		const feishuTo = isGroup ? `chat:${ctx.chatId}` : `user:${ctx.senderOpenId}`;
		const peerId = isGroup ? groupSession?.peerId ?? ctx.chatId : ctx.senderOpenId;
		const parentPeer = isGroup ? groupSession?.parentPeer ?? null : null;
		const replyInThread = isGroup ? groupSession?.replyInThread ?? false : false;
		const feishuAcpConversationSupported = !isGroup || groupSession?.groupSessionScope === "group_topic" || groupSession?.groupSessionScope === "group_topic_sender";
		if (isGroup && groupSession) log(`feishu[${account.accountId}]: group session scope=${groupSession.groupSessionScope}, peer=${peerId}`);
		let route = core.channel.routing.resolveAgentRoute({
			cfg,
			channel: "feishu",
			accountId: account.accountId,
			peer: {
				kind: isGroup ? "group" : "direct",
				id: peerId
			},
			parentPeer
		});
		let effectiveCfg = cfg;
		if (!isGroup && route.matchedBy === "default") {
			const dynamicCfg = feishuCfg?.dynamicAgentCreation;
			if (dynamicCfg?.enabled) {
				const result = await maybeCreateDynamicAgent({
					cfg,
					runtime: getFeishuRuntime(),
					senderOpenId: ctx.senderOpenId,
					dynamicCfg,
					log: (msg) => log(msg)
				});
				if (result.created) {
					effectiveCfg = result.updatedCfg;
					route = core.channel.routing.resolveAgentRoute({
						cfg: result.updatedCfg,
						channel: "feishu",
						accountId: account.accountId,
						peer: {
							kind: "direct",
							id: ctx.senderOpenId
						}
					});
					log(`feishu[${account.accountId}]: dynamic agent created, new route: ${route.sessionKey}`);
				}
			}
		}
		const currentConversationId = peerId;
		const parentConversationId = isGroup ? parentPeer?.id ?? ctx.chatId : void 0;
		let configuredBinding = null;
		if (feishuAcpConversationSupported) {
			const configuredRoute = resolveConfiguredBindingRoute({
				cfg: effectiveCfg,
				route,
				conversation: {
					channel: "feishu",
					accountId: account.accountId,
					conversationId: currentConversationId,
					parentConversationId
				}
			});
			configuredBinding = configuredRoute.bindingResolution;
			route = configuredRoute.route;
			const threadBinding = getSessionBindingService().resolveByConversation({
				channel: "feishu",
				accountId: account.accountId,
				conversationId: currentConversationId,
				...parentConversationId ? { parentConversationId } : {}
			});
			const boundSessionKey = threadBinding?.targetSessionKey?.trim();
			if (threadBinding && boundSessionKey) {
				route = {
					...route,
					sessionKey: boundSessionKey,
					agentId: resolveAgentIdFromSessionKey(boundSessionKey) || route.agentId,
					lastRoutePolicy: deriveLastRoutePolicy({
						sessionKey: boundSessionKey,
						mainSessionKey: route.mainSessionKey
					}),
					matchedBy: "binding.channel"
				};
				configuredBinding = null;
				getSessionBindingService().touch(threadBinding.bindingId);
				log(`feishu[${account.accountId}]: routed via bound conversation ${currentConversationId} -> ${boundSessionKey}`);
			}
		}
		if (configuredBinding) {
			const ensured = await ensureConfiguredBindingRouteReady({
				cfg: effectiveCfg,
				bindingResolution: configuredBinding
			});
			if (!ensured.ok) {
				const replyTargetMessageId = isGroup && (groupSession?.groupSessionScope === "group_topic" || groupSession?.groupSessionScope === "group_topic_sender") ? ctx.rootId ?? ctx.messageId : ctx.messageId;
				await sendMessageFeishu({
					cfg: effectiveCfg,
					to: `chat:${ctx.chatId}`,
					text: `⚠️ Failed to initialize the configured ACP session for this Feishu conversation: ${ensured.error}`,
					replyToMessageId: replyTargetMessageId,
					replyInThread: isGroup ? groupSession?.replyInThread ?? false : false,
					accountId: account.accountId
				}).catch((err) => {
					log(`feishu[${account.accountId}]: failed to send ACP init error reply: ${String(err)}`);
				});
				return;
			}
		}
		const preview = ctx.content.replace(/\s+/g, " ").slice(0, 160);
		const inboundLabel = isGroup ? `Feishu[${account.accountId}] message in group ${ctx.chatId}` : `Feishu[${account.accountId}] DM from ${ctx.senderOpenId}`;
		const contextVisibilityMode = resolveChannelContextVisibilityMode({
			cfg: effectiveCfg,
			channel: "feishu",
			accountId: account.accountId
		});
		log(`feishu[${account.accountId}]: ${inboundLabel}: ${preview}`);
		const mediaMaxBytes = (feishuCfg?.mediaMaxMb ?? 30) * 1024 * 1024;
		const mediaPayload = buildAgentMediaPayload(await resolveFeishuMediaList({
			cfg,
			messageId: ctx.messageId,
			messageType: event.message.message_type,
			content: event.message.content,
			maxBytes: mediaMaxBytes,
			log,
			accountId: account.accountId
		}));
		let quotedMessageInfo = null;
		let quotedContent;
		if (ctx.parentId) try {
			quotedMessageInfo = await getMessageFeishu({
				cfg,
				messageId: ctx.parentId,
				accountId: account.accountId
			});
			if (quotedMessageInfo && shouldIncludeFetchedGroupContextMessage({
				isGroup,
				allowFrom: effectiveGroupSenderAllowFrom,
				mode: contextVisibilityMode,
				kind: "quote",
				senderId: quotedMessageInfo.senderId,
				senderType: quotedMessageInfo.senderType
			})) {
				quotedContent = quotedMessageInfo.content;
				log(`feishu[${account.accountId}]: fetched quoted message: ${quotedContent?.slice(0, 100)}`);
			} else if (quotedMessageInfo) log(`feishu[${account.accountId}]: skipped quoted message from sender ${quotedMessageInfo.senderId ?? "unknown"} (mode=${contextVisibilityMode})`);
		} catch (err) {
			log(`feishu[${account.accountId}]: failed to fetch quoted message: ${String(err)}`);
		}
		const isTopicSessionForThread = isGroup && (groupSession?.groupSessionScope === "group_topic" || groupSession?.groupSessionScope === "group_topic_sender");
		const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(cfg);
		const messageBody = buildFeishuAgentBody({
			ctx,
			quotedContent,
			permissionErrorForAgent,
			botOpenId
		});
		const envelopeFrom = isGroup ? `${ctx.chatId}:${ctx.senderOpenId}` : ctx.senderOpenId;
		if (permissionErrorForAgent) log(`feishu[${account.accountId}]: appending permission error notice to message body`);
		let combinedBody = core.channel.reply.formatAgentEnvelope({
			channel: "Feishu",
			from: envelopeFrom,
			timestamp: /* @__PURE__ */ new Date(),
			envelope: envelopeOptions,
			body: messageBody
		});
		const historyKey = groupHistoryKey;
		if (isGroup && historyKey && chatHistories) combinedBody = buildPendingHistoryContextFromMap({
			historyMap: chatHistories,
			historyKey,
			limit: historyLimit,
			currentMessage: combinedBody,
			formatEntry: (entry) => core.channel.reply.formatAgentEnvelope({
				channel: "Feishu",
				from: `${ctx.chatId}:${entry.sender}`,
				timestamp: entry.timestamp,
				body: entry.body,
				envelope: envelopeOptions
			})
		});
		const inboundHistory = isGroup && historyKey && historyLimit > 0 && chatHistories ? (chatHistories.get(historyKey) ?? []).map((entry) => ({
			sender: entry.sender,
			body: entry.body,
			timestamp: entry.timestamp
		})) : void 0;
		const threadContextBySessionKey = /* @__PURE__ */ new Map();
		let rootMessageInfo;
		let rootMessageThreadId;
		let rootMessageFetched = false;
		const getRootMessageInfo = async () => {
			if (!ctx.rootId) return null;
			if (!rootMessageFetched) {
				rootMessageFetched = true;
				if (ctx.rootId === ctx.parentId && quotedMessageInfo) rootMessageInfo = quotedMessageInfo;
				else try {
					rootMessageInfo = await getMessageFeishu({
						cfg,
						messageId: ctx.rootId,
						accountId: account.accountId
					});
				} catch (err) {
					log(`feishu[${account.accountId}]: failed to fetch root message: ${String(err)}`);
					rootMessageInfo = null;
				}
				rootMessageThreadId = rootMessageInfo?.threadId;
				if (rootMessageInfo && !shouldIncludeFetchedGroupContextMessage({
					isGroup,
					allowFrom: effectiveGroupSenderAllowFrom,
					mode: contextVisibilityMode,
					kind: "thread",
					senderId: rootMessageInfo.senderId,
					senderType: rootMessageInfo.senderType
				})) {
					log(`feishu[${account.accountId}]: skipped thread starter from sender ${rootMessageInfo.senderId ?? "unknown"} (mode=${contextVisibilityMode})`);
					rootMessageInfo = null;
				}
			}
			return rootMessageInfo ?? null;
		};
		const resolveThreadContextForAgent = async (agentId, agentSessionKey) => {
			const cached = threadContextBySessionKey.get(agentSessionKey);
			if (cached) return cached;
			const threadContext = { threadLabel: (ctx.rootId || ctx.threadId) && isTopicSessionForThread ? `Feishu thread in ${ctx.chatId}` : void 0 };
			if (!(ctx.rootId || ctx.threadId) || !isTopicSessionForThread) {
				threadContextBySessionKey.set(agentSessionKey, threadContext);
				return threadContext;
			}
			const storePath = core.channel.session.resolveStorePath(cfg.session?.store, { agentId });
			if (core.channel.session.readSessionUpdatedAt({
				storePath,
				sessionKey: agentSessionKey
			})) {
				log(`feishu[${account.accountId}]: skipping thread bootstrap for existing session ${agentSessionKey}`);
				threadContextBySessionKey.set(agentSessionKey, threadContext);
				return threadContext;
			}
			const rootMsg = await getRootMessageInfo();
			let feishuThreadId = ctx.threadId ?? rootMessageThreadId ?? rootMsg?.threadId;
			if (feishuThreadId) log(`feishu[${account.accountId}]: resolved thread ID: ${feishuThreadId}`);
			if (!feishuThreadId) {
				log(`feishu[${account.accountId}]: no threadId found for root message ${ctx.rootId ?? "none"}, skipping thread history`);
				threadContextBySessionKey.set(agentSessionKey, threadContext);
				return threadContext;
			}
			try {
				const threadMessages = await listFeishuThreadMessages({
					cfg,
					threadId: feishuThreadId,
					currentMessageId: ctx.messageId,
					rootMessageId: ctx.rootId,
					limit: 20,
					accountId: account.accountId
				});
				const senderScoped = groupSession?.groupSessionScope === "group_topic_sender";
				const senderIds = new Set([ctx.senderOpenId, senderUserId].map((id) => id?.trim()).filter((id) => id !== void 0 && id.length > 0));
				const allowlistedMessages = filterFetchedGroupContextMessages(threadMessages, {
					isGroup,
					allowFrom: effectiveGroupSenderAllowFrom,
					mode: contextVisibilityMode,
					kind: "history"
				});
				const relevantMessages = (senderScoped ? allowlistedMessages.filter((msg) => msg.senderType === "app" || msg.senderId !== void 0 && senderIds.has(msg.senderId.trim())) : allowlistedMessages) ?? [];
				const threadStarterBody = rootMsg?.content ?? relevantMessages[0]?.content;
				const historyMessages = Boolean(rootMsg?.content || ctx.rootId) ? relevantMessages : relevantMessages.slice(1);
				const historyParts = historyMessages.map((msg) => {
					const role = msg.senderType === "app" ? "assistant" : "user";
					return core.channel.reply.formatAgentEnvelope({
						channel: "Feishu",
						from: `${msg.senderId ?? "Unknown"} (${role})`,
						timestamp: msg.createTime,
						body: msg.content,
						envelope: envelopeOptions
					});
				});
				threadContext.threadStarterBody = threadStarterBody;
				threadContext.threadHistoryBody = historyParts.length > 0 ? historyParts.join("\n\n") : void 0;
				log(`feishu[${account.accountId}]: populated thread bootstrap with starter=${threadStarterBody ? "yes" : "no"} history=${historyMessages.length}`);
			} catch (err) {
				log(`feishu[${account.accountId}]: failed to fetch thread history: ${String(err)}`);
			}
			threadContextBySessionKey.set(agentSessionKey, threadContext);
			return threadContext;
		};
		const buildCtxPayloadForAgent = async (agentId, agentSessionKey, agentAccountId, wasMentioned) => {
			const threadContext = await resolveThreadContextForAgent(agentId, agentSessionKey);
			return core.channel.reply.finalizeInboundContext({
				Body: combinedBody,
				BodyForAgent: messageBody,
				InboundHistory: inboundHistory,
				ReplyToId: ctx.parentId,
				RootMessageId: ctx.rootId,
				RawBody: ctx.content,
				CommandBody: ctx.content,
				From: feishuFrom,
				To: feishuTo,
				SessionKey: agentSessionKey,
				AccountId: agentAccountId,
				ChatType: isGroup ? "group" : "direct",
				GroupSubject: isGroup ? ctx.chatId : void 0,
				SenderName: ctx.senderName ?? ctx.senderOpenId,
				SenderId: ctx.senderOpenId,
				Provider: "feishu",
				Surface: "feishu",
				MessageSid: ctx.messageId,
				ReplyToBody: quotedContent ?? void 0,
				ThreadStarterBody: threadContext.threadStarterBody,
				ThreadHistoryBody: threadContext.threadHistoryBody,
				ThreadLabel: threadContext.threadLabel,
				MessageThreadId: ctx.rootId && isTopicSessionForThread ? ctx.rootId : void 0,
				Timestamp: messageCreateTimeMs,
				WasMentioned: wasMentioned,
				CommandAuthorized: commandAuthorized,
				OriginatingChannel: "feishu",
				OriginatingTo: feishuTo,
				GroupSystemPrompt: isGroup ? normalizeOptionalString(groupConfig?.systemPrompt) : void 0,
				...mediaPayload
			});
		};
		const isTopicSession = isGroup && (groupSession?.groupSessionScope === "group_topic" || groupSession?.groupSessionScope === "group_topic_sender");
		const configReplyInThread = isGroup && (groupConfig?.replyInThread ?? feishuCfg?.replyInThread ?? "disabled") === "enabled";
		const replyTargetMessageId = isTopicSession || configReplyInThread ? ctx.rootId ?? ctx.messageId : ctx.messageId;
		const threadReply = isGroup ? groupSession?.threadReply ?? false : false;
		if (broadcastAgents) {
			if (!await tryRecordMessagePersistent(ctx.messageId, "broadcast", log)) {
				log(`feishu[${account.accountId}]: broadcast already claimed by another account for message ${ctx.messageId}; skipping`);
				return;
			}
			const strategy = cfg.broadcast?.strategy === "sequential" ? "sequential" : "parallel";
			const activeAgentId = ctx.mentionedBot || !requireMention ? normalizeAgentId(route.agentId) : null;
			const agentIds = (cfg.agents?.list ?? []).map((a) => normalizeAgentId(a.id));
			const hasKnownAgents = agentIds.length > 0;
			log(`feishu[${account.accountId}]: broadcasting to ${broadcastAgents.length} agents (strategy=${strategy}, active=${activeAgentId ?? "none"})`);
			const dispatchForAgent = async (agentId) => {
				if (hasKnownAgents && !agentIds.includes(normalizeAgentId(agentId))) {
					log(`feishu[${account.accountId}]: broadcast agent ${agentId} not found in agents.list; skipping`);
					return;
				}
				const agentSessionKey = buildBroadcastSessionKey(route.sessionKey, route.agentId, agentId);
				const allowReasoningPreview = resolveFeishuReasoningPreviewEnabled({
					storePath: core.channel.session.resolveStorePath(cfg.session?.store, { agentId }),
					sessionKey: agentSessionKey
				});
				const agentCtx = await buildCtxPayloadForAgent(agentId, agentSessionKey, route.accountId, ctx.mentionedBot && agentId === activeAgentId);
				if (agentId === activeAgentId) {
					const identity = resolveAgentOutboundIdentity(cfg, agentId);
					const { dispatcher, replyOptions, markDispatchIdle } = createFeishuReplyDispatcher({
						cfg,
						agentId,
						runtime,
						chatId: ctx.chatId,
						allowReasoningPreview,
						replyToMessageId: replyTargetMessageId,
						skipReplyToInMessages: !isGroup,
						replyInThread,
						rootId: ctx.rootId,
						threadReply,
						mentionTargets: ctx.mentionTargets,
						accountId: account.accountId,
						identity,
						messageCreateTimeMs
					});
					log(`feishu[${account.accountId}]: broadcast active dispatch agent=${agentId} (session=${agentSessionKey})`);
					await core.channel.reply.withReplyDispatcher({
						dispatcher,
						onSettled: () => markDispatchIdle(),
						run: () => core.channel.reply.dispatchReplyFromConfig({
							ctx: agentCtx,
							cfg,
							dispatcher,
							replyOptions
						})
					});
				} else {
					delete agentCtx.CommandAuthorized;
					const noopDispatcher = {
						sendToolResult: () => false,
						sendBlockReply: () => false,
						sendFinalReply: () => false,
						waitForIdle: async () => {},
						getQueuedCounts: () => ({
							tool: 0,
							block: 0,
							final: 0
						}),
						getFailedCounts: () => ({
							tool: 0,
							block: 0,
							final: 0
						}),
						markComplete: () => {}
					};
					log(`feishu[${account.accountId}]: broadcast observer dispatch agent=${agentId} (session=${agentSessionKey})`);
					await core.channel.reply.withReplyDispatcher({
						dispatcher: noopDispatcher,
						run: () => core.channel.reply.dispatchReplyFromConfig({
							ctx: agentCtx,
							cfg,
							dispatcher: noopDispatcher
						})
					});
				}
			};
			if (strategy === "sequential") for (const agentId of broadcastAgents) try {
				await dispatchForAgent(agentId);
			} catch (err) {
				log(`feishu[${account.accountId}]: broadcast dispatch failed for agent=${agentId}: ${String(err)}`);
			}
			else {
				const results = await Promise.allSettled(broadcastAgents.map(dispatchForAgent));
				for (let i = 0; i < results.length; i++) if (results[i].status === "rejected") log(`feishu[${account.accountId}]: broadcast dispatch failed for agent=${broadcastAgents[i]}: ${String(results[i].reason)}`);
			}
			if (isGroup && historyKey && chatHistories) clearHistoryEntriesIfEnabled({
				historyMap: chatHistories,
				historyKey,
				limit: historyLimit
			});
			log(`feishu[${account.accountId}]: broadcast dispatch complete for ${broadcastAgents.length} agents`);
		} else {
			const ctxPayload = await buildCtxPayloadForAgent(route.agentId, route.sessionKey, route.accountId, ctx.mentionedBot);
			const identity = resolveAgentOutboundIdentity(cfg, route.agentId);
			const allowReasoningPreview = resolveFeishuReasoningPreviewEnabled({
				storePath: core.channel.session.resolveStorePath(cfg.session?.store, { agentId: route.agentId }),
				sessionKey: route.sessionKey
			});
			const { dispatcher, replyOptions, markDispatchIdle } = createFeishuReplyDispatcher({
				cfg,
				agentId: route.agentId,
				runtime,
				chatId: ctx.chatId,
				allowReasoningPreview,
				replyToMessageId: replyTargetMessageId,
				skipReplyToInMessages: !isGroup,
				replyInThread,
				rootId: ctx.rootId,
				threadReply,
				mentionTargets: ctx.mentionTargets,
				accountId: account.accountId,
				identity,
				messageCreateTimeMs
			});
			log(`feishu[${account.accountId}]: dispatching to agent (session=${route.sessionKey})`);
			const { queuedFinal, counts } = await core.channel.reply.withReplyDispatcher({
				dispatcher,
				onSettled: () => {
					markDispatchIdle();
				},
				run: () => core.channel.reply.dispatchReplyFromConfig({
					ctx: ctxPayload,
					cfg,
					dispatcher,
					replyOptions
				})
			});
			if (isGroup && historyKey && chatHistories) clearHistoryEntriesIfEnabled({
				historyMap: chatHistories,
				historyKey,
				limit: historyLimit
			});
			log(`feishu[${account.accountId}]: dispatch complete (queuedFinal=${queuedFinal}, replies=${counts.final})`);
		}
	} catch (err) {
		error(`feishu[${account.accountId}]: failed to dispatch message: ${String(err)}`);
	}
}
//#endregion
//#region extensions/feishu/src/card-ux-shared.ts
function buildFeishuCardButton(params) {
	return {
		tag: "button",
		text: {
			tag: "plain_text",
			content: params.label
		},
		type: params.type ?? "default",
		value: params.value
	};
}
function buildFeishuCardInteractionContext(params) {
	return {
		u: params.operatorOpenId,
		...params.chatId ? { h: params.chatId } : {},
		...params.sessionKey ? { s: params.sessionKey } : {},
		e: params.expiresAt,
		...params.chatType ? { t: params.chatType } : {}
	};
}
//#endregion
//#region extensions/feishu/src/card-ux-approval.ts
const FEISHU_APPROVAL_REQUEST_ACTION = "feishu.quick_actions.request_approval";
const FEISHU_APPROVAL_CONFIRM_ACTION = "feishu.approval.confirm";
const FEISHU_APPROVAL_CANCEL_ACTION = "feishu.approval.cancel";
function createApprovalCard(params) {
	const context = buildFeishuCardInteractionContext(params);
	return {
		schema: "2.0",
		config: { width_mode: "fill" },
		header: {
			title: {
				tag: "plain_text",
				content: "Confirm action"
			},
			template: "orange"
		},
		body: { elements: [{
			tag: "markdown",
			content: params.prompt
		}, {
			tag: "action",
			actions: [buildFeishuCardButton({
				label: params.confirmLabel ?? "Confirm",
				type: "primary",
				value: createFeishuCardInteractionEnvelope({
					k: "quick",
					a: FEISHU_APPROVAL_CONFIRM_ACTION,
					q: params.command,
					c: context
				})
			}), buildFeishuCardButton({
				label: params.cancelLabel ?? "Cancel",
				value: createFeishuCardInteractionEnvelope({
					k: "button",
					a: FEISHU_APPROVAL_CANCEL_ACTION,
					c: context
				})
			})]
		}] }
	};
}
//#endregion
//#region extensions/feishu/src/card-action.ts
const FEISHU_APPROVAL_CARD_TTL_MS = 5 * 6e4;
const FEISHU_CARD_ACTION_TOKEN_TTL_MS = 15 * 6e4;
const processedCardActionTokens = /* @__PURE__ */ new Map();
var FeishuRetryableCardActionError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "FeishuRetryableCardActionError";
	}
};
function pruneProcessedCardActionTokens(now) {
	for (const [key, entry] of processedCardActionTokens.entries()) if (entry.expiresAt <= now) processedCardActionTokens.delete(key);
}
function beginFeishuCardActionToken(params) {
	const now = params.now ?? Date.now();
	pruneProcessedCardActionTokens(now);
	const normalizedToken = params.token.trim();
	if (!normalizedToken) return false;
	const key = `${params.accountId}:${normalizedToken}`;
	const existing = processedCardActionTokens.get(key);
	if (existing && existing.expiresAt > now) return false;
	processedCardActionTokens.set(key, {
		status: "inflight",
		expiresAt: now + FEISHU_CARD_ACTION_TOKEN_TTL_MS
	});
	return true;
}
function completeFeishuCardActionToken(params) {
	const now = params.now ?? Date.now();
	const normalizedToken = params.token.trim();
	if (!normalizedToken) return;
	processedCardActionTokens.set(`${params.accountId}:${normalizedToken}`, {
		status: "completed",
		expiresAt: now + FEISHU_CARD_ACTION_TOKEN_TTL_MS
	});
}
function releaseFeishuCardActionToken(params) {
	const normalizedToken = params.token.trim();
	if (!normalizedToken) return;
	processedCardActionTokens.delete(`${params.accountId}:${normalizedToken}`);
}
function buildSyntheticMessageEvent(event, content, chatType) {
	return {
		sender: { sender_id: {
			open_id: event.operator.open_id,
			user_id: event.operator.user_id,
			union_id: event.operator.union_id
		} },
		message: {
			message_id: `card-action-${event.token}`,
			chat_id: event.context.chat_id || event.operator.open_id,
			chat_type: chatType ?? (event.context.chat_id ? "group" : "p2p"),
			message_type: "text",
			content: JSON.stringify({ text: content })
		}
	};
}
function resolveCallbackTarget(event) {
	const chatId = event.context.chat_id?.trim();
	if (chatId) return `chat:${chatId}`;
	return `user:${event.operator.open_id}`;
}
async function dispatchSyntheticCommand(params) {
	await handleFeishuMessage({
		cfg: params.cfg,
		event: buildSyntheticMessageEvent(params.event, params.command, params.chatType),
		botOpenId: params.botOpenId,
		runtime: params.runtime,
		accountId: params.accountId
	});
}
async function sendInvalidInteractionNotice(params) {
	const reasonText = params.reason === "stale" ? "This card action has expired. Open a fresh launcher card and try again." : params.reason === "wrong_user" ? "This card action belongs to a different user." : params.reason === "wrong_conversation" ? "This card action belongs to a different conversation." : "This card action payload is invalid.";
	await sendMessageFeishu({
		cfg: params.cfg,
		to: resolveCallbackTarget(params.event),
		text: `⚠️ ${reasonText}`,
		accountId: params.accountId
	});
}
async function handleFeishuCardAction(params) {
	const { cfg, event, runtime, accountId } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	const log = runtime?.log ?? console.log;
	if (!event.token.trim()) {
		log(`feishu[${account.accountId}]: rejected card action from ${event.operator.open_id}: missing token`);
		return;
	}
	const decoded = decodeFeishuCardAction({ event });
	if (!beginFeishuCardActionToken({
		token: event.token,
		accountId: account.accountId
	})) {
		log(`feishu[${account.accountId}]: skipping duplicate card action token ${event.token}`);
		return;
	}
	try {
		if (decoded.kind === "invalid") {
			log(`feishu[${account.accountId}]: rejected card action from ${event.operator.open_id}: ${decoded.reason}`);
			await sendInvalidInteractionNotice({
				cfg,
				event,
				reason: decoded.reason,
				accountId
			});
			completeFeishuCardActionToken({
				token: event.token,
				accountId: account.accountId
			});
			return;
		}
		if (decoded.kind === "structured") {
			const { envelope } = decoded;
			log(`feishu[${account.accountId}]: handling structured card action ${envelope.a} from ${event.operator.open_id}`);
			if (envelope.a === "feishu.quick_actions.request_approval") {
				const command = typeof envelope.m?.command === "string" ? envelope.m.command.trim() : "";
				if (!command) {
					await sendInvalidInteractionNotice({
						cfg,
						event,
						reason: "malformed",
						accountId
					});
					completeFeishuCardActionToken({
						token: event.token,
						accountId: account.accountId
					});
					return;
				}
				const prompt = typeof envelope.m?.prompt === "string" && envelope.m.prompt.trim() ? envelope.m.prompt : `Run \`${command}\` in this Feishu conversation?`;
				await sendCardFeishu({
					cfg,
					to: resolveCallbackTarget(event),
					card: createApprovalCard({
						operatorOpenId: event.operator.open_id,
						chatId: event.context.chat_id || void 0,
						command,
						prompt,
						sessionKey: envelope.c?.s,
						expiresAt: Date.now() + FEISHU_APPROVAL_CARD_TTL_MS,
						chatType: envelope.c?.t ?? (event.context.chat_id ? "group" : "p2p"),
						confirmLabel: command === "/reset" ? "Reset" : "Confirm"
					}),
					accountId
				});
				completeFeishuCardActionToken({
					token: event.token,
					accountId: account.accountId
				});
				return;
			}
			if (envelope.a === "feishu.approval.cancel") {
				await sendMessageFeishu({
					cfg,
					to: resolveCallbackTarget(event),
					text: "Cancelled.",
					accountId
				});
				completeFeishuCardActionToken({
					token: event.token,
					accountId: account.accountId
				});
				return;
			}
			if (envelope.a === "feishu.approval.confirm" || envelope.k === "quick") {
				const command = envelope.q?.trim();
				if (!command) {
					await sendInvalidInteractionNotice({
						cfg,
						event,
						reason: "malformed",
						accountId
					});
					completeFeishuCardActionToken({
						token: event.token,
						accountId: account.accountId
					});
					return;
				}
				await dispatchSyntheticCommand({
					cfg,
					event,
					command,
					botOpenId: params.botOpenId,
					runtime,
					accountId,
					chatType: envelope.c?.t ?? (event.context.chat_id ? "group" : "p2p")
				});
				completeFeishuCardActionToken({
					token: event.token,
					accountId: account.accountId
				});
				return;
			}
			await sendInvalidInteractionNotice({
				cfg,
				event,
				reason: "malformed",
				accountId
			});
			completeFeishuCardActionToken({
				token: event.token,
				accountId: account.accountId
			});
			return;
		}
		const content = buildFeishuCardActionTextFallback(event);
		log(`feishu[${account.accountId}]: handling card action from ${event.operator.open_id}: ${content}`);
		await dispatchSyntheticCommand({
			cfg,
			event,
			command: content,
			botOpenId: params.botOpenId,
			runtime,
			accountId
		});
		completeFeishuCardActionToken({
			token: event.token,
			accountId: account.accountId
		});
	} catch (err) {
		if (err instanceof FeishuRetryableCardActionError) releaseFeishuCardActionToken({
			token: event.token,
			accountId: account.accountId
		});
		else completeFeishuCardActionToken({
			token: event.token,
			accountId: account.accountId
		});
		throw err;
	}
}
//#endregion
//#region extensions/feishu/src/card-ux-launcher.ts
const FEISHU_QUICK_ACTION_CARD_TTL_MS = 10 * 6e4;
const QUICK_ACTION_MENU_KEYS = new Set([
	"quick-actions",
	"quick_actions",
	"launcher"
]);
function isFeishuQuickActionMenuEventKey(eventKey) {
	return QUICK_ACTION_MENU_KEYS.has(normalizeOptionalLowercaseString(eventKey) ?? "");
}
function createQuickActionLauncherCard(params) {
	const context = buildFeishuCardInteractionContext(params);
	return {
		schema: "2.0",
		config: { width_mode: "fill" },
		header: {
			title: {
				tag: "plain_text",
				content: "Quick actions"
			},
			template: "indigo"
		},
		body: { elements: [{
			tag: "markdown",
			content: "Run common actions without typing raw commands."
		}, {
			tag: "action",
			actions: [
				buildFeishuCardButton({
					label: "Help",
					value: createFeishuCardInteractionEnvelope({
						k: "quick",
						a: "feishu.quick_actions.help",
						q: "/help",
						c: context
					})
				}),
				buildFeishuCardButton({
					label: "New session",
					type: "primary",
					value: createFeishuCardInteractionEnvelope({
						k: "meta",
						a: FEISHU_APPROVAL_REQUEST_ACTION,
						m: {
							command: "/new",
							prompt: "Start a fresh session? This will reset the current chat context."
						},
						c: context
					})
				}),
				buildFeishuCardButton({
					label: "Reset",
					type: "danger",
					value: createFeishuCardInteractionEnvelope({
						k: "meta",
						a: FEISHU_APPROVAL_REQUEST_ACTION,
						m: {
							command: "/reset",
							prompt: "Reset this session now? Any active conversation state will be cleared."
						},
						c: context
					})
				})
			]
		}] }
	};
}
async function maybeHandleFeishuQuickActionMenu(params) {
	if (!isFeishuQuickActionMenuEventKey(params.eventKey)) return false;
	const expiresAt = (params.now ?? Date.now()) + FEISHU_QUICK_ACTION_CARD_TTL_MS;
	try {
		await sendCardFeishu({
			cfg: params.cfg,
			to: `user:${params.operatorOpenId}`,
			card: createQuickActionLauncherCard({
				operatorOpenId: params.operatorOpenId,
				expiresAt,
				chatType: "p2p"
			}),
			accountId: params.accountId
		});
	} catch (err) {
		params.runtime?.log?.(`feishu[${params.accountId ?? "default"}]: failed to open quick-action launcher for ${params.operatorOpenId}: ${String(err)}`);
		return false;
	}
	params.runtime?.log?.(`feishu[${params.accountId ?? "default"}]: opened quick-action launcher for ${params.operatorOpenId}`);
	return true;
}
//#endregion
//#region extensions/feishu/src/comment-dispatcher.ts
function createFeishuCommentReplyDispatcher(params) {
	const core = getFeishuRuntime();
	const prefixContext = createReplyPrefixContext({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "feishu",
		accountId: params.accountId
	});
	const client = createFeishuClient(resolveFeishuRuntimeAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}));
	const textChunkLimit = core.channel.text.resolveTextChunkLimit(params.cfg, "feishu", params.accountId, { fallbackLimit: 4e3 });
	const chunkMode = core.channel.text.resolveChunkMode(params.cfg, "feishu");
	const typingReaction = createCommentTypingReactionLifecycle({
		cfg: params.cfg,
		fileToken: params.fileToken,
		fileType: params.fileType,
		replyId: params.replyId,
		accountId: params.accountId,
		runtime: params.runtime
	});
	const { dispatcher, replyOptions, markDispatchIdle, markRunComplete } = core.channel.reply.createReplyDispatcherWithTyping({
		responsePrefix: prefixContext.responsePrefix,
		responsePrefixContextProvider: prefixContext.responsePrefixContextProvider,
		humanDelay: core.channel.reply.resolveHumanDelayConfig(params.cfg, params.agentId),
		onReplyStart: async () => {
			await typingReaction.start();
		},
		deliver: async (payload, info) => {
			if (info.kind !== "final") return;
			const reply = resolveSendableOutboundReplyParts(payload);
			if (!reply.hasText) {
				if (reply.hasMedia) params.runtime.log?.(`feishu[${params.accountId ?? "default"}]: comment reply ignored media-only payload for comment=${params.commentId}`);
				return;
			}
			const chunks = core.channel.text.chunkTextWithMode(reply.text, textChunkLimit, chunkMode);
			for (const chunk of chunks) await deliverCommentThreadText(client, {
				file_token: params.fileToken,
				file_type: params.fileType,
				comment_id: params.commentId,
				content: chunk,
				is_whole_comment: params.isWholeComment
			});
		},
		onError: (err, info) => {
			params.runtime.error?.(`feishu[${params.accountId ?? "default"}]: comment dispatcher failed kind=${info.kind} comment=${params.commentId}: ${String(err)}`);
		},
		onCleanup: () => {
			typingReaction.cleanup();
		}
	});
	return {
		dispatcher,
		replyOptions,
		markDispatchIdle,
		markRunComplete,
		startTypingReaction: typingReaction.start,
		cleanupTypingReaction: typingReaction.cleanup
	};
}
//#endregion
//#region extensions/feishu/src/monitor.comment.ts
const FEISHU_COMMENT_VERIFY_TIMEOUT_MS = 3e3;
const FEISHU_COMMENT_LIST_PAGE_SIZE = 100;
const FEISHU_COMMENT_LIST_PAGE_LIMIT = 5;
const FEISHU_COMMENT_REPLY_PAGE_SIZE = 100;
const FEISHU_COMMENT_REPLY_PAGE_LIMIT = 5;
const FEISHU_COMMENT_REPLY_MISS_RETRY_DELAY_MS = 1e3;
const FEISHU_COMMENT_REPLY_MISS_RETRY_LIMIT = 6;
const FEISHU_COMMENT_THREAD_PROMPT_LIMIT = 20;
const FEISHU_WHOLE_COMMENT_PROMPT_LIMIT = 12;
const FEISHU_PROMPT_TEXT_LIMIT = 220;
function readBoolean(value) {
	return typeof value === "boolean" ? value : void 0;
}
function safeJsonStringify(value) {
	try {
		return JSON.stringify(value);
	} catch (error) {
		return JSON.stringify({ error: formatErrorMessage(error) });
	}
}
function truncatePromptText(text, maxLength = FEISHU_PROMPT_TEXT_LIMIT) {
	const normalized = normalizeString(text);
	if (!normalized) return "";
	return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}
function formatPromptTextValue(text) {
	return safeJsonStringify(truncatePromptText(text) || "");
}
function formatPromptBoolean(value) {
	return value === true ? "yes" : "no";
}
function buildDriveCommentsListUrl(params) {
	return `/open-apis/drive/v1/files/${encodeURIComponent(params.fileToken)}/comments` + encodeQuery({
		file_type: params.fileType,
		is_whole: params.isWholeOnly === true ? "true" : void 0,
		page_size: String(FEISHU_COMMENT_LIST_PAGE_SIZE),
		page_token: params.pageToken,
		user_id_type: "open_id"
	});
}
function compareCommentTimelineEntries(left, right) {
	const leftTime = left.createTime ?? Number.MAX_SAFE_INTEGER;
	const rightTime = right.createTime ?? Number.MAX_SAFE_INTEGER;
	if (leftTime !== rightTime) return leftTime - rightTime;
	return (left.stableId ?? "").localeCompare(right.stableId ?? "");
}
function formatLinkedDocumentInline(link) {
	return [
		`raw_url=${link.rawUrl}`,
		`url_kind=${link.urlKind}`,
		link.wikiNodeToken ? `wiki_node_token=${link.wikiNodeToken}` : null,
		`resolved_type=${link.resolvedObjType ?? "UNKNOWN"}`,
		`resolved_token=${link.resolvedObjToken ?? "UNKNOWN"}`,
		`same_as_current_document=${formatPromptBoolean(link.isCurrentDocument)}`
	].filter((part) => Boolean(part)).join(" ");
}
function formatLinkedDocumentsPromptLines(params) {
	if (params.linkedDocuments.length === 0) return [];
	return [params.title, ...params.linkedDocuments.map((link, index) => `- [${index + 1}] ${formatLinkedDocumentInline(link)}`)];
}
function formatLinkedDocumentsInlineSummary(linkedDocuments) {
	if (linkedDocuments.length === 0) return "none";
	return linkedDocuments.map((link) => `${link.resolvedObjType ?? link.urlKind}:${link.resolvedObjToken ?? link.wikiNodeToken ?? "UNKNOWN"}`).join(",");
}
function summarizeCommentRepliesForLog(replies) {
	return safeJsonStringify(replies.map((reply) => ({
		reply_id: reply.reply_id,
		text_len: extractReplyText(reply)?.length ?? 0
	})));
}
async function resolveParsedCommentContent(params) {
	const parsed = parseCommentContentElements({
		elements: params.elements,
		botOpenIds: params.botOpenIds,
		currentDocument: params.currentDocument
	});
	if (!parsed.linkedDocuments.some((link) => link.urlKind === "wiki" && link.wikiNodeToken)) return parsed;
	const resolvedLinkedDocuments = await Promise.all(parsed.linkedDocuments.map(async (link) => {
		if (link.urlKind !== "wiki" || !link.wikiNodeToken) return link;
		let pending = params.wikiCache.get(link.wikiNodeToken);
		if (!pending) {
			pending = params.client.wiki.space.getNode({ params: { token: link.wikiNodeToken } }).then((response) => {
				if (response.code !== 0) {
					params.logger?.(`feishu[${params.accountId}]: wiki link resolution failed token=${link.wikiNodeToken} code=${response.code ?? "unknown"} msg=${response.msg ?? "unknown"}`);
					return null;
				}
				const objType = normalizeCommentFileType(response.data?.node?.obj_type);
				const objToken = normalizeString(response.data?.node?.obj_token);
				if (!objType || !objToken) return null;
				return {
					resolvedObjType: objType,
					resolvedObjToken: objToken
				};
			}).catch((error) => {
				params.logger?.(`feishu[${params.accountId}]: wiki link resolution threw token=${link.wikiNodeToken} error=${formatErrorMessage(error)}`);
				return null;
			});
			params.wikiCache.set(link.wikiNodeToken, pending);
		}
		const resolved = await pending;
		if (!resolved) return link;
		return {
			...link,
			resolvedObjType: resolved.resolvedObjType,
			resolvedObjToken: resolved.resolvedObjToken,
			isCurrentDocument: resolved.resolvedObjType === params.currentDocument.fileType && resolved.resolvedObjToken === params.currentDocument.fileToken
		};
	}));
	return {
		...parsed,
		linkedDocuments: resolvedLinkedDocuments
	};
}
async function delayMs(ms) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
function buildDriveCommentTargetUrl(params) {
	return `/open-apis/drive/v1/files/${encodeURIComponent(params.fileToken)}/comments/batch_query` + encodeQuery({
		file_type: params.fileType,
		user_id_type: "open_id"
	});
}
function buildDriveCommentRepliesUrl(params) {
	return `/open-apis/drive/v1/files/${encodeURIComponent(params.fileToken)}/comments/${encodeURIComponent(params.commentId)}/replies` + encodeQuery({
		file_type: params.fileType,
		page_token: params.pageToken,
		page_size: String(FEISHU_COMMENT_REPLY_PAGE_SIZE),
		user_id_type: "open_id"
	});
}
async function fetchDriveComments(params) {
	const comments = [];
	let pageToken;
	for (let page = 0; page < FEISHU_COMMENT_LIST_PAGE_LIMIT; page += 1) {
		const response = await requestFeishuOpenApi({
			client: params.client,
			method: "GET",
			url: buildDriveCommentsListUrl({
				fileToken: params.fileToken,
				fileType: params.fileType,
				isWholeOnly: params.isWholeOnly,
				pageToken
			}),
			timeoutMs: params.timeoutMs,
			logger: params.logger,
			errorLabel: `feishu[${params.accountId}]: failed to list drive comments for ${params.fileToken}`
		});
		if (response?.code !== 0) {
			if (response) params.logger?.(`feishu[${params.accountId}]: failed to list drive comments for ${params.fileToken}: ${response.msg ?? "unknown error"} log_id=${response.log_id?.trim() || "unknown"}`);
			break;
		}
		comments.push(...response.data?.items ?? []);
		if (response.data?.has_more !== true || !response.data.page_token?.trim()) break;
		pageToken = response.data.page_token.trim();
	}
	return comments;
}
async function requestFeishuOpenApi(params) {
	const formatErrorDetails = (error) => {
		if (!isRecord$1(error)) return typeof error === "string" ? error : JSON.stringify(error);
		const response = isRecord$1(error.response) ? error.response : void 0;
		const responseData = isRecord$1(response?.data) ? response?.data : void 0;
		return safeJsonStringify({
			message: typeof error.message === "string" ? error.message : typeof error === "string" ? error : JSON.stringify(error),
			code: readString(error.code),
			method: readString(isRecord$1(error.config) ? error.config.method : void 0),
			url: readString(isRecord$1(error.config) ? error.config.url : void 0),
			http_status: typeof response?.status === "number" ? response.status : void 0,
			feishu_code: typeof responseData?.code === "number" ? responseData.code : readString(responseData?.code),
			feishu_msg: readString(responseData?.msg),
			feishu_log_id: readString(responseData?.log_id)
		});
	};
	const result = await raceWithTimeoutAndAbort(params.client.request({
		method: params.method,
		url: params.url,
		data: params.data ?? {},
		timeout: params.timeoutMs
	}), { timeoutMs: params.timeoutMs }).then((resolved) => resolved.status === "resolved" ? resolved.value : null).catch((error) => {
		params.logger?.(`${params.errorLabel}: ${formatErrorDetails(error)}`);
		return null;
	});
	if (!result) params.logger?.(`${params.errorLabel}: request timed out or returned no data`);
	return result;
}
async function fetchDriveCommentReplies(params) {
	const replies = [];
	const logIds = [];
	let pageToken;
	for (let page = 0; page < FEISHU_COMMENT_REPLY_PAGE_LIMIT; page += 1) {
		const response = await requestFeishuOpenApi({
			client: params.client,
			method: "GET",
			url: buildDriveCommentRepliesUrl({
				fileToken: params.fileToken,
				commentId: params.commentId,
				fileType: params.fileType,
				pageToken
			}),
			timeoutMs: params.timeoutMs,
			logger: params.logger,
			errorLabel: `feishu[${params.accountId}]: failed to fetch comment replies for ${params.commentId}`
		});
		if (response?.log_id?.trim()) logIds.push(response.log_id.trim());
		if (response?.code !== 0) {
			if (response) params.logger?.(`feishu[${params.accountId}]: failed to fetch comment replies for ${params.commentId}: ${response.msg ?? "unknown error"} log_id=${response.log_id?.trim() || "unknown"}`);
			break;
		}
		replies.push(...response.data?.items ?? []);
		if (response.data?.has_more !== true || !response.data.page_token?.trim()) break;
		pageToken = response.data.page_token.trim();
	}
	return {
		replies,
		logIds
	};
}
async function resolveCommentReplyContext(params) {
	const userId = normalizeString(params.reply.user_id);
	const normalizedBotOpenIds = new Set(Array.from(params.botOpenIds ?? []).map((botId) => normalizeString(botId)).filter((botId) => Boolean(botId)));
	return {
		replyId: normalizeString(params.reply.reply_id),
		userId,
		createTime: typeof params.reply.create_time === "number" ? params.reply.create_time : void 0,
		isBotAuthored: typeof userId === "string" && normalizedBotOpenIds.has(userId),
		content: await resolveParsedCommentContent({
			elements: isRecord$1(params.reply.content) ? params.reply.content.elements : void 0,
			botOpenIds: params.botOpenIds,
			currentDocument: params.currentDocument,
			client: params.client,
			wikiCache: params.wikiCache,
			logger: params.logger,
			accountId: params.accountId
		})
	};
}
function selectCommentThreadPromptReplies(replies, targetReplyId) {
	if (replies.length <= FEISHU_COMMENT_THREAD_PROMPT_LIMIT) return replies;
	const targetIndex = replies.findIndex((reply) => reply.replyId === targetReplyId);
	const currentIndex = targetIndex >= 0 ? targetIndex : replies.length - 1;
	const selected = new Set([
		0,
		currentIndex,
		replies.length - 1
	]);
	for (let radius = 1; selected.size < FEISHU_COMMENT_THREAD_PROMPT_LIMIT; radius += 1) {
		const before = currentIndex - radius;
		const after = currentIndex + radius;
		if (before >= 0) selected.add(before);
		if (selected.size >= FEISHU_COMMENT_THREAD_PROMPT_LIMIT) break;
		if (after < replies.length) selected.add(after);
		if (before < 0 && after >= replies.length) break;
	}
	return [...selected].toSorted((left, right) => left - right).map((index) => replies[index]).filter((reply) => Boolean(reply));
}
function formatCommentThreadPromptLines(params) {
	return selectCommentThreadPromptReplies(params.replies, params.targetReplyId).map((reply, index) => {
		const text = reply.content.semanticText ?? reply.content.plainText;
		return `- [${index + 1}] author=${reply.isBotAuthored ? "assistant" : "user"} user_id=${reply.userId ?? "UNKNOWN"} reply_id=${reply.replyId ?? "UNKNOWN"} current_event=${reply.replyId === params.targetReplyId ? "yes" : "no"} text=${formatPromptTextValue(text)} referenced_docs=${formatLinkedDocumentsInlineSummary(reply.content.linkedDocuments)}`;
	});
}
function findNearestBotTimelineEntry(params) {
	const step = params.direction === "after" ? 1 : -1;
	for (let index = params.currentIndex + step; index >= 0 && index < params.entries.length; index += step) {
		const candidate = params.entries[index];
		if (candidate?.isBotAuthored) return candidate;
	}
}
function selectWholeCommentTimelineEntries(params) {
	if (params.entries.length <= FEISHU_WHOLE_COMMENT_PROMPT_LIMIT) return params.entries;
	const currentIndex = params.entries.findIndex((entry) => entry.commentId === params.currentCommentId);
	if (currentIndex < 0) return params.entries.slice(-FEISHU_WHOLE_COMMENT_PROMPT_LIMIT);
	const selected = new Set([currentIndex]);
	const nearestBotAfter = params.entries.findIndex((entry, index) => index > currentIndex && entry.isBotAuthored);
	if (nearestBotAfter >= 0) selected.add(nearestBotAfter);
	for (let index = currentIndex - 1; index >= 0; index -= 1) if (params.entries[index]?.isBotAuthored) {
		selected.add(index);
		break;
	}
	for (let radius = 1; selected.size < FEISHU_WHOLE_COMMENT_PROMPT_LIMIT; radius += 1) {
		const before = currentIndex - radius;
		const after = currentIndex + radius;
		if (before >= 0) selected.add(before);
		if (selected.size >= FEISHU_WHOLE_COMMENT_PROMPT_LIMIT) break;
		if (after < params.entries.length) selected.add(after);
		if (before < 0 && after >= params.entries.length) break;
	}
	return [...selected].toSorted((left, right) => left - right).map((index) => params.entries[index]).filter((entry) => Boolean(entry));
}
function formatWholeCommentTimelinePromptLines(params) {
	return selectWholeCommentTimelineEntries(params).map((entry, index) => {
		const text = entry.content.semanticText ?? entry.content.plainText;
		return `- [${index + 1}] create_time=${entry.createTime ?? "UNKNOWN"} comment_id=${entry.commentId} author=${entry.isBotAuthored ? "assistant" : "user"} user_id=${entry.userId ?? "UNKNOWN"} current_comment=${entry.commentId === params.currentCommentId ? "yes" : "no"} text=${formatPromptTextValue(text)} referenced_docs=${formatLinkedDocumentsInlineSummary(entry.content.linkedDocuments)}`;
	});
}
async function fetchDriveCommentContext(params) {
	const [metaResponse, commentResponse] = await Promise.all([requestFeishuOpenApi({
		client: params.client,
		method: "POST",
		url: "/open-apis/drive/v1/metas/batch_query",
		data: {
			request_docs: [{
				doc_token: params.fileToken,
				doc_type: params.fileType
			}],
			with_url: true
		},
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		errorLabel: `feishu[${params.accountId}]: failed to fetch drive metadata for ${params.fileToken}`
	}), requestFeishuOpenApi({
		client: params.client,
		method: "POST",
		url: buildDriveCommentTargetUrl({
			fileToken: params.fileToken,
			fileType: params.fileType
		}),
		data: { comment_ids: [params.commentId] },
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		errorLabel: `feishu[${params.accountId}]: failed to fetch drive comment ${params.commentId}`
	})]);
	const wikiCache = /* @__PURE__ */ new Map();
	const commentCard = commentResponse?.code === 0 ? (commentResponse.data?.items ?? []).find((item) => item.comment_id?.trim() === params.commentId) : void 0;
	const embeddedReplies = commentCard?.reply_list?.replies ?? [];
	params.logger?.(`feishu[${params.accountId}]: embedded comment replies comment=${params.commentId} count=${embeddedReplies.length} summary=${summarizeCommentRepliesForLog(embeddedReplies)}`);
	const embeddedTargetReply = params.replyId ? embeddedReplies.find((reply) => reply.reply_id?.trim() === params.replyId?.trim()) : embeddedReplies.at(-1);
	let replies = embeddedReplies;
	let fetchedMatchedReply = params.replyId ? replies.find((reply) => reply.reply_id?.trim() === params.replyId?.trim()) : void 0;
	if (!embeddedTargetReply || replies.length === 0 || commentCard?.has_more === true) {
		params.logger?.(`feishu[${params.accountId}]: fetching extra comment replies comment=${params.commentId} requested_reply=${params.replyId ?? "none"} embedded_count=${embeddedReplies.length} embedded_hit=${embeddedTargetReply ? "yes" : "no"} embedded_has_more=${commentCard?.has_more === true ? "yes" : "no"}`);
		const fetched = await fetchDriveCommentReplies(params);
		if (fetched.replies.length > 0) {
			params.logger?.(`feishu[${params.accountId}]: fetched extra comment replies comment=${params.commentId} count=${fetched.replies.length} log_ids=${safeJsonStringify(fetched.logIds)} summary=${summarizeCommentRepliesForLog(fetched.replies)}`);
			replies = fetched.replies;
			fetchedMatchedReply = params.replyId ? replies.find((reply) => reply.reply_id?.trim() === params.replyId?.trim()) : void 0;
		}
		if (params.replyId && !embeddedTargetReply && !fetchedMatchedReply) for (let attempt = 1; attempt <= FEISHU_COMMENT_REPLY_MISS_RETRY_LIMIT; attempt += 1) {
			params.logger?.(`feishu[${params.accountId}]: retrying comment reply lookup comment=${params.commentId} requested_reply=${params.replyId} attempt=${attempt}/${FEISHU_COMMENT_REPLY_MISS_RETRY_LIMIT} delay_ms=${FEISHU_COMMENT_REPLY_MISS_RETRY_DELAY_MS}`);
			await params.waitMs(FEISHU_COMMENT_REPLY_MISS_RETRY_DELAY_MS);
			const retried = await fetchDriveCommentReplies(params);
			if (retried.replies.length > 0) {
				params.logger?.(`feishu[${params.accountId}]: fetched retried comment replies comment=${params.commentId} attempt=${attempt} count=${retried.replies.length} log_ids=${safeJsonStringify(retried.logIds)} summary=${summarizeCommentRepliesForLog(retried.replies)}`);
				replies = retried.replies;
			}
			fetchedMatchedReply = replies.find((reply) => reply.reply_id?.trim() === params.replyId);
			if (fetchedMatchedReply) break;
		}
	}
	const rootReply = replies[0] ?? embeddedReplies[0];
	const targetReply = params.replyId ? embeddedTargetReply ?? fetchedMatchedReply ?? void 0 : replies.at(-1) ?? embeddedTargetReply ?? rootReply;
	const matchSource = params.replyId ? embeddedTargetReply ? "embedded" : fetchedMatchedReply ? "fetched" : "miss" : targetReply === rootReply ? "fallback_root" : targetReply === embeddedTargetReply ? "embedded_latest" : "fetched_latest";
	params.logger?.(`feishu[${params.accountId}]: comment reply resolution comment=${params.commentId} requested_reply=${params.replyId ?? "none"} match_source=${matchSource} root=${safeJsonStringify({
		reply_id: rootReply?.reply_id,
		text_len: extractReplyText(rootReply)?.length ?? 0
	})} target=${safeJsonStringify({
		reply_id: targetReply?.reply_id,
		text_len: extractReplyText(targetReply)?.length ?? 0
	})}`);
	const meta = metaResponse?.code === 0 ? metaResponse.data?.metas?.[0] : void 0;
	const currentDocument = {
		fileType: params.fileType,
		fileToken: params.fileToken
	};
	const resolvedReplies = await Promise.all(replies.map((reply) => resolveCommentReplyContext({
		reply,
		botOpenIds: params.botOpenIds,
		currentDocument,
		client: params.client,
		wikiCache,
		logger: params.logger,
		accountId: params.accountId
	})));
	resolvedReplies.sort((left, right) => compareCommentTimelineEntries({
		createTime: left.createTime,
		stableId: left.replyId
	}, {
		createTime: right.createTime,
		stableId: right.replyId
	}));
	const rootReplyContext = resolvedReplies.find((reply) => reply.replyId === normalizeString(rootReply?.reply_id)) ?? resolvedReplies[0];
	const targetReplyContext = resolvedReplies.find((reply) => reply.replyId === normalizeString(targetReply?.reply_id)) ?? (params.replyId ? void 0 : resolvedReplies.at(-1) ?? rootReplyContext);
	let wholeCommentTimeline = [];
	if (commentCard?.is_whole === true) {
		const wholeComments = (await fetchDriveComments({
			client: params.client,
			fileToken: params.fileToken,
			fileType: params.fileType,
			isWholeOnly: true,
			timeoutMs: params.timeoutMs,
			logger: params.logger,
			accountId: params.accountId
		})).filter((comment) => comment.is_whole === true);
		wholeCommentTimeline = await Promise.all(wholeComments.map(async (comment) => {
			const rootWholeReply = comment.reply_list?.replies?.[0];
			const normalizedBotOpenIds = new Set(Array.from(params.botOpenIds ?? []).map((botId) => normalizeString(botId)).filter((botId) => Boolean(botId)));
			const content = await resolveParsedCommentContent({
				elements: isRecord$1(rootWholeReply?.content) ? rootWholeReply.content.elements : void 0,
				botOpenIds: params.botOpenIds,
				currentDocument,
				client: params.client,
				wikiCache,
				logger: params.logger,
				accountId: params.accountId
			});
			const commentUserId = normalizeString(rootWholeReply?.user_id) || normalizeString(comment.user_id);
			return {
				commentId: normalizeString(comment.comment_id) ?? "",
				userId: commentUserId,
				createTime: typeof comment.create_time === "number" ? comment.create_time : typeof rootWholeReply?.create_time === "number" ? rootWholeReply.create_time : void 0,
				isCurrentComment: normalizeString(comment.comment_id) === params.commentId,
				isBotAuthored: typeof commentUserId === "string" && normalizedBotOpenIds.has(commentUserId),
				content
			};
		}));
		wholeCommentTimeline = wholeCommentTimeline.filter((entry) => Boolean(entry.commentId)).toSorted((left, right) => compareCommentTimelineEntries({
			createTime: left.createTime,
			stableId: left.commentId
		}, {
			createTime: right.createTime,
			stableId: right.commentId
		}));
	}
	const currentWholeCommentIndex = wholeCommentTimeline.findIndex((entry) => entry.commentId === params.commentId);
	return {
		documentTitle: normalizeString(meta?.title),
		documentUrl: normalizeString(meta?.url),
		isWholeComment: commentCard?.is_whole,
		quoteText: normalizeString(commentCard?.quote),
		rootCommentText: rootReplyContext?.content.semanticText ?? rootReplyContext?.content.plainText,
		targetReplyText: targetReplyContext?.content.semanticText ?? targetReplyContext?.content.plainText,
		rootCommentContent: rootReplyContext?.content,
		targetReplyContent: targetReplyContext?.content,
		currentCommentThreadReplies: resolvedReplies,
		wholeCommentTimeline,
		nearestBotWholeCommentAfter: currentWholeCommentIndex >= 0 ? findNearestBotTimelineEntry({
			entries: wholeCommentTimeline,
			currentIndex: currentWholeCommentIndex,
			direction: "after"
		}) : void 0,
		nearestBotWholeCommentBefore: currentWholeCommentIndex >= 0 ? findNearestBotTimelineEntry({
			entries: wholeCommentTimeline,
			currentIndex: currentWholeCommentIndex,
			direction: "before"
		}) : void 0
	};
}
function buildDriveCommentSurfacePrompt(params) {
	const documentLabel = params.documentTitle ? `"${params.documentTitle}"` : `${params.fileType} document ${params.fileToken}`;
	const lines = [`The user added a ${params.noticeType === "add_reply" ? "reply" : "comment"} in ${documentLabel}.`];
	if (params.targetReplyText) lines.push(`Current user comment text: ${formatPromptTextValue(params.targetReplyText)}`);
	if (params.noticeType === "add_reply" && params.rootCommentText && params.rootCommentText !== params.targetReplyText) lines.push(`Original comment text: ${formatPromptTextValue(params.rootCommentText)}`);
	if (params.quoteText) lines.push(`Quoted content: ${formatPromptTextValue(params.quoteText)}`);
	if (params.isMentioned === true) lines.push("This comment mentioned you.");
	if (params.documentUrl) lines.push(`Document link: ${params.documentUrl}`);
	lines.push("Current commented document:", `- file_type=${params.fileType}`, `- file_token=${params.fileToken}`);
	if (params.documentTitle) lines.push(`- title=${params.documentTitle}`);
	if (params.documentUrl) lines.push(`- url=${params.documentUrl}`);
	lines.push(`Event type: ${params.noticeType}`, `file_token: ${params.fileToken}`, `file_type: ${params.fileType}`, `comment_id: ${params.commentId}`);
	if (params.isWholeComment === true) lines.push("This is a whole-document comment.");
	if (params.replyId?.trim()) lines.push(`reply_id: ${params.replyId.trim()}`);
	if (params.targetReplyContent?.semanticText) lines.push(`Current user comment semantic text: ${formatPromptTextValue(params.targetReplyContent.semanticText)}`);
	if (params.targetReplyContent?.botMentioned) lines.push("Bot routing mention detected in the current user comment. Treat that mention as routing only, not task content.");
	const nonBotMentions = (params.targetReplyContent?.mentions ?? []).filter((mention) => !mention.isBotMention).map((mention) => mention.displayText);
	if (nonBotMentions.length > 0) lines.push(`Other mentioned users in current comment: ${nonBotMentions.join(", ")}`);
	lines.push(...formatLinkedDocumentsPromptLines({
		title: "Referenced documents from current user comment:",
		linkedDocuments: params.targetReplyContent?.linkedDocuments ?? []
	}));
	if (!params.isWholeComment && params.currentCommentThreadReplies.length > 0) lines.push("Current comment card timeline (primary context for follow-ups on this comment card):", ...formatCommentThreadPromptLines({
		replies: params.currentCommentThreadReplies,
		targetReplyId: params.replyId
	}), "For this non-whole comment, use the current comment card timeline above as the primary source for phrases like 'above', 'previous result', 'that summary', or 'insert it'.", "Document-level session history is auxiliary background only. Do not use another comment card's recent output as the primary referent.");
	if (params.isWholeComment && params.wholeCommentTimeline.length > 0) {
		lines.push("Whole-document comment timeline (primary context for whole-comment follow-ups):", ...formatWholeCommentTimelinePromptLines({
			entries: params.wholeCommentTimeline,
			currentCommentId: params.commentId
		}));
		if (params.nearestBotWholeCommentAfter) lines.push(`Nearest bot-authored whole-comment after the current comment: comment_id=${params.nearestBotWholeCommentAfter.commentId} text=${formatPromptTextValue(params.nearestBotWholeCommentAfter.content.semanticText ?? params.nearestBotWholeCommentAfter.content.plainText)}`);
		if (params.nearestBotWholeCommentBefore) lines.push(`Nearest bot-authored whole-comment before the current comment: comment_id=${params.nearestBotWholeCommentBefore.commentId} text=${formatPromptTextValue(params.nearestBotWholeCommentBefore.content.semanticText ?? params.nearestBotWholeCommentBefore.content.plainText)}`);
		lines.push("For this whole-document comment, use the whole-comment timeline above as the primary source for phrases like 'just now', 'previous result', 'that summary', or 'write it back'.", "Document-level session history is auxiliary background only. Do not resolve whole-comment follow-ups by blindly using the most recent document-session output.");
	}
	lines.push("This is a Feishu document comment thread.", "It is not a Feishu IM chat.", "Your final text reply will be posted to the current comment thread automatically.", "Use the thread timeline above as the main context for follow-up requests.", "Do not use another comment card or document-session output as the main reference.", "If you need comment thread context, use feishu_drive.list_comments or feishu_drive.list_comment_replies.", "If you modify the document, post a user-visible follow-up in the comment thread.", "Use feishu_drive.reply_comment or feishu_drive.add_comment for that follow-up.", "Whole-document comments do not support direct replies.", "For whole-document comments, use feishu_drive.add_comment.", "Only treat URLs listed under \"Referenced documents from current user comment\" as structured Feishu document references.", "URLs that appear only in comment text are plain links unless you verify them.", "If the user asks about a linked Feishu document or wiki page, treat that linked document as the read target.", "If the user asks you to use a linked document as guidance, treat the linked document as the reference source and the current commented document as the edit target.", "If a referenced document resolves to the same file_token and file_type as the current commented document, treat it as the current document.", "If the user asks you to modify document content, you must use feishu_doc to make the change.", "Do not reply with only \"done\", \"I'll handle it\", or a restated plan without calling tools.", "If the comment quotes document content, treat the quoted content as the main anchor.", "For requests like \"insert xxx below this content\", locate the quoted content first, then edit the document.", "For requests like \"summarize the content below\", \"explain this section\", or \"continue writing from here\", use the quoted content as the main target.", "If the quote is not enough, use feishu_doc.read or feishu_doc.list_blocks to read nearby context.", "Do not guess document content from the comment alone.", "Do not give a vague answer before reading enough context.", "Unless the user asks for the whole document, handle only the local content around the quoted anchor.", "If document edits are involved, read the anchor first, then edit.", "If the edit fails or the anchor cannot be found, say so clearly.", "If this is a reading task, such as summarization, explanation, or extraction, you may output the final answer directly after confirming the context.", "Use the same language as the user's comment or reply, unless the user asks for another language.", "Use plain text only.", "Do not use Markdown.", "Do not use headings.", "Do not use bullet lists.", "Do not use numbered lists.", "Do not use tables.", "Do not use blockquotes.", "Do not use code blocks.", "Do not show reasoning.", "Do not show analysis.", "Do not show chain-of-thought.", "Do not show scratch work.", "Do not describe your plan.", "Do not describe your steps.", "Do not describe tool use.", "Do not start with phrases like \"I will\", \"I’ll first\", \"I need to\", \"The user wants\", or \"I have updated\".", "Output only the final user-facing reply.", "If you already sent the user-visible reply with feishu_drive.reply_comment or feishu_drive.add_comment, output exactly NO_REPLY.", "If no user-visible reply is needed, output exactly NO_REPLY.", "Be concise.", "Do not omit requested content.");
	lines.push("Choose one outcome: output the final plain-text reply, edit the document and then post a user-visible follow-up in the comment thread, or output exactly NO_REPLY.");
	return lines.join("\n");
}
async function resolveDriveCommentEventCore(params) {
	const { cfg, accountId, event, botOpenId, createClient = (account) => createFeishuClient(account), verificationTimeoutMs = FEISHU_COMMENT_VERIFY_TIMEOUT_MS, logger, waitMs = delayMs } = params;
	const eventId = event.event_id?.trim();
	const commentId = event.comment_id?.trim();
	const replyId = event.reply_id?.trim();
	const noticeType = event.notice_meta?.notice_type?.trim();
	const fileToken = event.notice_meta?.file_token?.trim();
	const fileType = normalizeCommentFileType(event.notice_meta?.file_type);
	const senderId = event.notice_meta?.from_user_id?.open_id?.trim();
	const senderUserId = normalizeString(event.notice_meta?.from_user_id?.user_id);
	if (!eventId || !commentId || !noticeType || !fileToken || !fileType || !senderId) {
		logger?.(`feishu[${accountId}]: drive comment notice missing required fields event=${eventId ?? "unknown"} comment=${commentId ?? "unknown"}`);
		return null;
	}
	if (noticeType !== "add_comment" && noticeType !== "add_reply") {
		logger?.(`feishu[${accountId}]: unsupported drive comment notice type ${noticeType}`);
		return null;
	}
	if (!botOpenId) {
		logger?.(`feishu[${accountId}]: skipping drive comment notice because bot open_id is unavailable event=${eventId}`);
		return null;
	}
	if (senderId === botOpenId) {
		logger?.(`feishu[${accountId}]: ignoring self-authored drive comment notice event=${eventId} sender=${senderId}`);
		return null;
	}
	const context = await fetchDriveCommentContext({
		client: createClient(resolveFeishuAccount({
			cfg,
			accountId
		})),
		fileToken,
		fileType,
		commentId,
		replyId,
		botOpenIds: [botOpenId, event.notice_meta?.to_user_id?.open_id],
		timeoutMs: verificationTimeoutMs,
		logger,
		accountId,
		waitMs
	});
	return {
		eventId,
		commentId,
		replyId,
		noticeType,
		fileToken,
		fileType,
		isWholeComment: context.isWholeComment,
		senderId,
		senderUserId,
		timestamp: event.timestamp,
		isMentioned: event.is_mentioned,
		context
	};
}
function parseFeishuDriveCommentNoticeEventPayload(value) {
	if (!isRecord$1(value) || !isRecord$1(value.notice_meta)) return null;
	const noticeMeta = value.notice_meta;
	const fromUserId = isRecord$1(noticeMeta.from_user_id) ? noticeMeta.from_user_id : void 0;
	const toUserId = isRecord$1(noticeMeta.to_user_id) ? noticeMeta.to_user_id : void 0;
	return {
		comment_id: readString(value.comment_id),
		event_id: readString(value.event_id),
		is_mentioned: readBoolean(value.is_mentioned),
		notice_meta: {
			file_token: readString(noticeMeta.file_token),
			file_type: readString(noticeMeta.file_type),
			from_user_id: fromUserId ? {
				open_id: readString(fromUserId.open_id),
				user_id: readString(fromUserId.user_id),
				union_id: readString(fromUserId.union_id)
			} : void 0,
			notice_type: readString(noticeMeta.notice_type),
			to_user_id: toUserId ? {
				open_id: readString(toUserId.open_id),
				user_id: readString(toUserId.user_id),
				union_id: readString(toUserId.union_id)
			} : void 0
		},
		reply_id: readString(value.reply_id),
		timestamp: readString(value.timestamp),
		type: readString(value.type)
	};
}
async function resolveDriveCommentEventTurn(params) {
	const resolved = await resolveDriveCommentEventCore(params);
	if (!resolved) return null;
	const prompt = buildDriveCommentSurfacePrompt({
		noticeType: resolved.noticeType,
		fileType: resolved.fileType,
		fileToken: resolved.fileToken,
		commentId: resolved.commentId,
		replyId: resolved.replyId,
		isWholeComment: resolved.isWholeComment,
		isMentioned: resolved.isMentioned,
		documentTitle: resolved.context.documentTitle,
		documentUrl: resolved.context.documentUrl,
		quoteText: resolved.context.quoteText,
		rootCommentText: resolved.context.rootCommentText,
		targetReplyText: resolved.context.targetReplyText,
		rootCommentContent: resolved.context.rootCommentContent,
		targetReplyContent: resolved.context.targetReplyContent,
		currentCommentThreadReplies: resolved.context.currentCommentThreadReplies,
		wholeCommentTimeline: resolved.context.wholeCommentTimeline,
		nearestBotWholeCommentAfter: resolved.context.nearestBotWholeCommentAfter,
		nearestBotWholeCommentBefore: resolved.context.nearestBotWholeCommentBefore
	});
	const preview = prompt.replace(/\s+/g, " ").slice(0, 160);
	return {
		eventId: resolved.eventId,
		messageId: `drive-comment:${resolved.eventId}`,
		commentId: resolved.commentId,
		replyId: resolved.replyId,
		noticeType: resolved.noticeType,
		fileToken: resolved.fileToken,
		fileType: resolved.fileType,
		isWholeComment: resolved.isWholeComment,
		senderId: resolved.senderId,
		senderUserId: resolved.senderUserId,
		timestamp: resolved.timestamp,
		isMentioned: resolved.isMentioned,
		documentTitle: resolved.context.documentTitle,
		documentUrl: resolved.context.documentUrl,
		quoteText: resolved.context.quoteText,
		rootCommentText: resolved.context.rootCommentText,
		targetReplyText: resolved.context.targetReplyText,
		prompt,
		preview
	};
}
//#endregion
//#region extensions/feishu/src/comment-handler.ts
function buildCommentSessionKey(params) {
	return params.core.channel.routing.buildAgentSessionKey({
		agentId: params.route.agentId,
		channel: "feishu",
		accountId: params.route.accountId,
		peer: {
			kind: "direct",
			id: `comment-doc:${params.fileType}:${params.fileToken}`
		},
		dmScope: "per-account-channel-peer"
	});
}
function parseTimestampMs(value) {
	const parsed = value ? Number.parseInt(value, 10) : NaN;
	return Number.isFinite(parsed) ? parsed : Date.now();
}
async function handleFeishuCommentEvent(params) {
	const account = resolveFeishuRuntimeAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const feishuCfg = account.config;
	const core = getFeishuRuntime();
	const log = params.runtime?.log ?? console.log;
	const error = params.runtime?.error ?? console.error;
	const runtime = params.runtime ?? {
		log,
		error
	};
	const turn = await resolveDriveCommentEventTurn({
		cfg: params.cfg,
		accountId: account.accountId,
		event: params.event,
		botOpenId: params.botOpenId,
		logger: log
	});
	if (!turn) {
		log(`feishu[${account.accountId}]: drive comment notice skipped event=${params.event.event_id ?? "unknown"} comment=${params.event.comment_id ?? "unknown"}`);
		return;
	}
	const commentTarget = buildFeishuCommentTarget({
		fileType: turn.fileType,
		fileToken: turn.fileToken,
		commentId: turn.commentId
	});
	const dmPolicy = feishuCfg?.dmPolicy ?? "pairing";
	const configAllowFrom = feishuCfg?.allowFrom ?? [];
	const pairing = createChannelPairingController$1({
		core,
		channel: "feishu",
		accountId: account.accountId
	});
	const storeAllowFrom = dmPolicy !== "allowlist" && dmPolicy !== "open" ? await pairing.readAllowFromStore().catch(() => []) : [];
	const senderAllowed = resolveFeishuAllowlistMatch({
		allowFrom: [...configAllowFrom, ...storeAllowFrom],
		senderId: turn.senderId,
		senderIds: [turn.senderUserId]
	}).allowed;
	if (dmPolicy !== "open" && !senderAllowed) {
		if (dmPolicy === "pairing") {
			const client = createFeishuClient(account);
			await pairing.issueChallenge({
				senderId: turn.senderId,
				senderIdLine: `Your Feishu user id: ${turn.senderId}`,
				meta: { name: turn.senderId },
				onCreated: ({ code }) => {
					log(`feishu[${account.accountId}]: comment pairing request sender=${turn.senderId} code=${code}`);
				},
				sendPairingReply: async (text) => {
					await deliverCommentThreadText(client, {
						file_token: turn.fileToken,
						file_type: turn.fileType,
						comment_id: turn.commentId,
						content: text,
						is_whole_comment: turn.isWholeComment
					});
				},
				onReplyError: (err) => {
					log(`feishu[${account.accountId}]: comment pairing reply failed for ${turn.senderId}: ${String(err)}`);
				}
			});
		} else log(`feishu[${account.accountId}]: blocked unauthorized comment sender ${turn.senderId} (dmPolicy=${dmPolicy}, comment=${turn.commentId})`);
		return;
	}
	let effectiveCfg = params.cfg;
	let route = core.channel.routing.resolveAgentRoute({
		cfg: params.cfg,
		channel: "feishu",
		accountId: account.accountId,
		peer: {
			kind: "direct",
			id: turn.senderId
		}
	});
	if (route.matchedBy === "default") {
		const dynamicCfg = feishuCfg?.dynamicAgentCreation;
		if (dynamicCfg?.enabled) {
			const dynamicResult = await maybeCreateDynamicAgent({
				cfg: params.cfg,
				runtime: core,
				senderOpenId: turn.senderId,
				dynamicCfg,
				log: (message) => log(message)
			});
			if (dynamicResult.created) {
				effectiveCfg = dynamicResult.updatedCfg;
				route = core.channel.routing.resolveAgentRoute({
					cfg: dynamicResult.updatedCfg,
					channel: "feishu",
					accountId: account.accountId,
					peer: {
						kind: "direct",
						id: turn.senderId
					}
				});
				log(`feishu[${account.accountId}]: dynamic agent created for comment flow, route=${route.sessionKey}`);
			}
		}
	}
	const commentSessionKey = buildCommentSessionKey({
		core,
		route,
		fileType: turn.fileType,
		fileToken: turn.fileToken
	});
	const bodyForAgent = `[message_id: ${turn.messageId}]\n${turn.prompt}`;
	const ctxPayload = core.channel.reply.finalizeInboundContext({
		Body: bodyForAgent,
		BodyForAgent: bodyForAgent,
		RawBody: turn.targetReplyText ?? turn.rootCommentText ?? turn.prompt,
		CommandBody: turn.targetReplyText ?? turn.rootCommentText ?? turn.prompt,
		From: `feishu:${turn.senderId}`,
		To: commentTarget,
		SessionKey: commentSessionKey,
		AccountId: route.accountId,
		ChatType: "direct",
		ConversationLabel: turn.documentTitle ? `Feishu comment · ${turn.documentTitle}` : "Feishu comment",
		SenderName: turn.senderId,
		SenderId: turn.senderId,
		Provider: "feishu",
		Surface: "feishu-comment",
		MessageSid: turn.messageId,
		MessageThreadId: turn.replyId,
		Timestamp: parseTimestampMs(turn.timestamp),
		WasMentioned: turn.isMentioned,
		CommandAuthorized: false,
		OriginatingChannel: "feishu",
		OriginatingTo: commentTarget
	});
	const storePath = core.channel.session.resolveStorePath(effectiveCfg.session?.store, { agentId: route.agentId });
	await core.channel.session.recordInboundSession({
		storePath,
		sessionKey: commentSessionKey,
		ctx: ctxPayload,
		onRecordError: (err) => {
			error(`feishu[${account.accountId}]: failed to record comment inbound session ${commentSessionKey}: ${String(err)}`);
		}
	});
	const { dispatcher, replyOptions, markDispatchIdle, markRunComplete, cleanupTypingReaction } = createFeishuCommentReplyDispatcher({
		cfg: effectiveCfg,
		agentId: route.agentId,
		runtime,
		accountId: account.accountId,
		fileToken: turn.fileToken,
		fileType: turn.fileType,
		commentId: turn.commentId,
		replyId: turn.replyId,
		isWholeComment: turn.isWholeComment
	});
	try {
		log(`feishu[${account.accountId}]: dispatching drive comment to agent (session=${commentSessionKey} comment=${turn.commentId} type=${turn.noticeType})`);
		const { queuedFinal, counts } = await core.channel.reply.withReplyDispatcher({
			dispatcher,
			run: () => core.channel.reply.dispatchReplyFromConfig({
				ctx: ctxPayload,
				cfg: effectiveCfg,
				dispatcher,
				replyOptions
			})
		});
		log(`feishu[${account.accountId}]: drive comment dispatch complete (queuedFinal=${queuedFinal}, replies=${counts.final}, session=${commentSessionKey})`);
	} finally {
		markRunComplete();
		markDispatchIdle();
		cleanupTypingReaction();
	}
}
//#endregion
//#region extensions/feishu/src/monitor.startup.ts
const FEISHU_STARTUP_BOT_INFO_TIMEOUT_DEFAULT_MS = 3e4;
const FEISHU_STARTUP_BOT_INFO_TIMEOUT_ENV = "OPENCLAW_FEISHU_STARTUP_PROBE_TIMEOUT_MS";
function resolveStartupProbeTimeoutMs() {
	const raw = process.env[FEISHU_STARTUP_BOT_INFO_TIMEOUT_ENV];
	if (raw) {
		const parsed = Number(raw);
		if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
		console.warn(`[feishu] ${FEISHU_STARTUP_BOT_INFO_TIMEOUT_ENV}="${raw}" is invalid; using default ${FEISHU_STARTUP_BOT_INFO_TIMEOUT_DEFAULT_MS}ms`);
	}
	return FEISHU_STARTUP_BOT_INFO_TIMEOUT_DEFAULT_MS;
}
const FEISHU_STARTUP_BOT_INFO_TIMEOUT_MS = resolveStartupProbeTimeoutMs();
function isTimeoutErrorMessage(message) {
	const lower = normalizeLowercaseStringOrEmpty(message);
	return lower.includes("timeout") || lower.includes("timed out");
}
function isAbortErrorMessage(message) {
	return normalizeLowercaseStringOrEmpty(message).includes("aborted");
}
async function fetchBotIdentityForMonitor(account, options = {}) {
	if (options.abortSignal?.aborted) return {};
	const timeoutMs = options.timeoutMs ?? FEISHU_STARTUP_BOT_INFO_TIMEOUT_MS;
	const result = await probeFeishu(account, {
		timeoutMs,
		abortSignal: options.abortSignal
	});
	if (result.ok) return {
		botOpenId: result.botOpenId,
		botName: result.botName
	};
	const probeError = result.error ?? void 0;
	if (options.abortSignal?.aborted || isAbortErrorMessage(probeError)) return {};
	if (isTimeoutErrorMessage(probeError)) (options.runtime?.error ?? console.error)(`feishu[${account.accountId}]: bot info probe timed out after ${timeoutMs}ms; continuing startup`);
	return {};
}
//#endregion
//#region extensions/feishu/src/monitor.state.ts
const wsClients = /* @__PURE__ */ new Map();
const httpServers = /* @__PURE__ */ new Map();
const botOpenIds = /* @__PURE__ */ new Map();
const botNames = /* @__PURE__ */ new Map();
const FEISHU_WEBHOOK_MAX_BODY_BYTES = 64 * 1024;
const FEISHU_WEBHOOK_BODY_TIMEOUT_MS = 5e3;
const FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS = {
	windowMs: 6e4,
	maxRequests: 120,
	maxTrackedKeys: 4096
};
const FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS = {
	maxTrackedKeys: 4096,
	ttlMs: 360 * 6e4,
	logEvery: 25
};
function coercePositiveInt(value, fallback) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const normalized = Math.floor(value);
	return normalized > 0 ? normalized : fallback;
}
function resolveFeishuWebhookRateLimitDefaultsForTest(defaults) {
	const resolved = defaults;
	return {
		windowMs: coercePositiveInt(resolved?.windowMs, FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.windowMs),
		maxRequests: coercePositiveInt(resolved?.maxRequests, FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.maxRequests),
		maxTrackedKeys: coercePositiveInt(resolved?.maxTrackedKeys, FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.maxTrackedKeys)
	};
}
function resolveFeishuWebhookAnomalyDefaultsForTest(defaults) {
	const resolved = defaults;
	return {
		maxTrackedKeys: coercePositiveInt(resolved?.maxTrackedKeys, FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.maxTrackedKeys),
		ttlMs: coercePositiveInt(resolved?.ttlMs, FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.ttlMs),
		logEvery: coercePositiveInt(resolved?.logEvery, FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.logEvery)
	};
}
const feishuWebhookRateLimitDefaults = resolveFeishuWebhookRateLimitDefaultsForTest(WEBHOOK_RATE_LIMIT_DEFAULTS);
const feishuWebhookAnomalyDefaults = resolveFeishuWebhookAnomalyDefaultsForTest(WEBHOOK_ANOMALY_COUNTER_DEFAULTS);
const feishuWebhookRateLimiter = createFixedWindowRateLimiter({
	windowMs: feishuWebhookRateLimitDefaults.windowMs,
	maxRequests: feishuWebhookRateLimitDefaults.maxRequests,
	maxTrackedKeys: feishuWebhookRateLimitDefaults.maxTrackedKeys
});
const feishuWebhookAnomalyTracker = createWebhookAnomalyTracker({
	maxTrackedKeys: feishuWebhookAnomalyDefaults.maxTrackedKeys,
	ttlMs: feishuWebhookAnomalyDefaults.ttlMs,
	logEvery: feishuWebhookAnomalyDefaults.logEvery
});
function recordWebhookStatus(runtime, accountId, path, statusCode) {
	feishuWebhookAnomalyTracker.record({
		key: `${accountId}:${path}:${statusCode}`,
		statusCode,
		log: runtime?.log ?? console.log,
		message: (count) => `feishu[${accountId}]: webhook anomaly path=${path} status=${statusCode} count=${count}`
	});
}
//#endregion
//#region extensions/feishu/src/monitor.bot-identity.ts
const BOT_IDENTITY_RETRY_DELAYS_MS = [
	6e4,
	12e4,
	3e5,
	6e5,
	9e5
];
function applyBotIdentityState(accountId, identity) {
	const botOpenId = normalizeOptionalString(identity.botOpenId);
	const botName = normalizeOptionalString(identity.botName);
	botOpenIds.set(accountId, botOpenId ?? "");
	if (botName) botNames.set(accountId, botName);
	else botNames.delete(accountId);
	return {
		botOpenId,
		botName
	};
}
async function retryBotIdentityProbe(account, accountId, runtime, abortSignal) {
	const log = runtime?.log ?? console.log;
	const error = runtime?.error ?? console.error;
	for (let i = 0; i < BOT_IDENTITY_RETRY_DELAYS_MS.length; i += 1) {
		if (abortSignal?.aborted) return;
		if (!await waitForAbortableDelay(BOT_IDENTITY_RETRY_DELAYS_MS[i], abortSignal)) return;
		const resolved = applyBotIdentityState(accountId, await fetchBotIdentityForMonitor(account, {
			runtime,
			abortSignal
		}));
		if (resolved.botOpenId) {
			log(`feishu[${accountId}]: bot open_id recovered via background retry: ${resolved.botOpenId}`);
			return;
		}
		const nextDelay = BOT_IDENTITY_RETRY_DELAYS_MS[i + 1];
		error(`feishu[${accountId}]: bot identity background retry ${i + 1}/${BOT_IDENTITY_RETRY_DELAYS_MS.length} failed` + (nextDelay ? `; next attempt in ${nextDelay / 1e3}s` : ""));
	}
	error(`feishu[${accountId}]: bot identity background retry exhausted; requireMention group messages may be skipped until restart`);
}
function startBotIdentityRecovery(params) {
	const { account, accountId, runtime, abortSignal } = params;
	const log = runtime?.log ?? console.log;
	log(`feishu[${accountId}]: bot open_id unknown; starting background retry (delays: ${BOT_IDENTITY_RETRY_DELAYS_MS.map((delay) => `${delay / 1e3}s`).join(", ")})`);
	log(`feishu[${accountId}]: requireMention group messages stay gated until bot identity recovery succeeds`);
	retryBotIdentityProbe(account, accountId, runtime, abortSignal);
}
//#endregion
//#region extensions/feishu/src/monitor.transport.ts
function isFeishuWebhookPayload(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function buildFeishuWebhookEnvelope(req, payload) {
	return Object.assign(Object.create({ headers: req.headers }), payload);
}
function parseFeishuWebhookPayload(rawBody) {
	try {
		const parsed = JSON.parse(rawBody);
		return isFeishuWebhookPayload(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
function isFeishuWebhookSignatureValid(params) {
	const encryptKey = params.encryptKey?.trim();
	if (!encryptKey) return false;
	const timestampHeader = params.headers["x-lark-request-timestamp"];
	const nonceHeader = params.headers["x-lark-request-nonce"];
	const signatureHeader = params.headers["x-lark-signature"];
	const timestamp = Array.isArray(timestampHeader) ? timestampHeader[0] : timestampHeader;
	const nonce = Array.isArray(nonceHeader) ? nonceHeader[0] : nonceHeader;
	const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
	if (!timestamp || !nonce || !signature) return false;
	return safeEqualSecret(crypto.createHash("sha256").update(timestamp + nonce + encryptKey + params.rawBody).digest("hex"), signature);
}
function respondText(res, statusCode, body) {
	res.statusCode = statusCode;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.end(body);
}
async function monitorWebSocket({ account, accountId, runtime, abortSignal, eventDispatcher }) {
	const log = runtime?.log ?? console.log;
	const error = runtime?.error ?? console.error;
	log(`feishu[${accountId}]: starting WebSocket connection...`);
	const wsClient = await createFeishuWSClient(account);
	wsClients.set(accountId, wsClient);
	return new Promise((resolve, reject) => {
		let cleanedUp = false;
		const cleanup = () => {
			if (cleanedUp) return;
			cleanedUp = true;
			abortSignal?.removeEventListener("abort", handleAbort);
			try {
				wsClient.close();
			} catch (err) {
				error(`feishu[${accountId}]: error closing WebSocket client: ${String(err)}`);
			} finally {
				wsClients.delete(accountId);
				botOpenIds.delete(accountId);
				botNames.delete(accountId);
			}
		};
		function handleAbort() {
			log(`feishu[${accountId}]: abort signal received, stopping`);
			cleanup();
			resolve();
		}
		if (abortSignal?.aborted) {
			cleanup();
			resolve();
			return;
		}
		abortSignal?.addEventListener("abort", handleAbort, { once: true });
		try {
			wsClient.start({ eventDispatcher });
			log(`feishu[${accountId}]: WebSocket client started`);
		} catch (err) {
			cleanup();
			reject(err);
		}
	});
}
async function monitorWebhook({ account, accountId, runtime, abortSignal, eventDispatcher }) {
	const log = runtime?.log ?? console.log;
	const error = runtime?.error ?? console.error;
	const encryptKey = account.encryptKey?.trim();
	if (!encryptKey) throw new Error(`Feishu account "${accountId}" webhook mode requires encryptKey`);
	const port = account.config.webhookPort ?? 3e3;
	const path = account.config.webhookPath ?? "/feishu/events";
	const host = account.config.webhookHost ?? "127.0.0.1";
	log(`feishu[${accountId}]: starting Webhook server on ${host}:${port}, path ${path}...`);
	const server = http.createServer();
	server.on("request", (req, res) => {
		res.on("finish", () => {
			recordWebhookStatus(runtime, accountId, path, res.statusCode);
		});
		if (!applyBasicWebhookRequestGuards({
			req,
			res,
			rateLimiter: feishuWebhookRateLimiter,
			rateLimitKey: `${accountId}:${path}:${req.socket.remoteAddress ?? "unknown"}`,
			nowMs: Date.now(),
			requireJsonContentType: true
		})) return;
		const guard = installRequestBodyLimitGuard(req, res, {
			maxBytes: FEISHU_WEBHOOK_MAX_BODY_BYTES,
			timeoutMs: FEISHU_WEBHOOK_BODY_TIMEOUT_MS,
			responseFormat: "text"
		});
		if (guard.isTripped()) return;
		(async () => {
			try {
				const body = await readWebhookBodyOrReject({
					req,
					res,
					maxBytes: FEISHU_WEBHOOK_MAX_BODY_BYTES,
					timeoutMs: FEISHU_WEBHOOK_BODY_TIMEOUT_MS,
					profile: "pre-auth"
				});
				if (!body.ok || res.writableEnded) return;
				if (guard.isTripped()) return;
				const rawBody = body.value;
				if (!isFeishuWebhookSignatureValid({
					headers: req.headers,
					rawBody,
					encryptKey
				})) {
					respondText(res, 401, "Invalid signature");
					return;
				}
				const payload = parseFeishuWebhookPayload(rawBody);
				if (!payload) {
					respondText(res, 400, "Invalid JSON");
					return;
				}
				const { isChallenge, challenge } = Lark.generateChallenge(payload, { encryptKey });
				if (isChallenge) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.end(JSON.stringify(challenge));
					return;
				}
				const value = await eventDispatcher.invoke(buildFeishuWebhookEnvelope(req, payload), { needCheck: false });
				if (!res.headersSent) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.end(JSON.stringify(value));
				}
			} catch (err) {
				error(`feishu[${accountId}]: webhook handler error: ${String(err)}`);
				if (!res.headersSent) respondText(res, 500, "Internal Server Error");
			} finally {
				guard.dispose();
			}
		})();
	});
	httpServers.set(accountId, server);
	return new Promise((resolve, reject) => {
		const cleanup = () => {
			server.close();
			httpServers.delete(accountId);
			botOpenIds.delete(accountId);
			botNames.delete(accountId);
		};
		const handleAbort = () => {
			log(`feishu[${accountId}]: abort signal received, stopping Webhook server`);
			cleanup();
			resolve();
		};
		if (abortSignal?.aborted) {
			cleanup();
			resolve();
			return;
		}
		abortSignal?.addEventListener("abort", handleAbort, { once: true });
		server.listen(port, host, () => {
			log(`feishu[${accountId}]: Webhook server listening on ${host}:${port}`);
		});
		server.on("error", (err) => {
			error(`feishu[${accountId}]: Webhook server error: ${err}`);
			abortSignal?.removeEventListener("abort", handleAbort);
			reject(err);
		});
	});
}
//#endregion
//#region extensions/feishu/src/sequential-key.ts
function getFeishuSequentialKey(params) {
	const { accountId, event, botOpenId, botName } = params;
	const baseKey = `feishu:${accountId}:${event.message.chat_id?.trim() || "unknown"}`;
	const text = parseFeishuMessageEvent(event, botOpenId, botName).content.trim();
	if (isAbortRequestText(text)) return `${baseKey}:control`;
	if (isBtwRequestText(text)) return `${baseKey}:btw`;
	return baseKey;
}
//#endregion
//#region extensions/feishu/src/sequential-queue.ts
function createSequentialQueue() {
	const queues = /* @__PURE__ */ new Map();
	return (key, task) => {
		const next = (queues.get(key) ?? Promise.resolve()).then(task, task);
		queues.set(key, next);
		const cleanup = () => {
			if (queues.get(key) === next) queues.delete(key);
		};
		next.then(cleanup, cleanup);
		return next;
	};
}
//#endregion
//#region extensions/feishu/src/monitor.account.ts
const FEISHU_REACTION_VERIFY_TIMEOUT_MS = 1500;
var FeishuRetryableSyntheticEventError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "FeishuRetryableSyntheticEventError";
	}
};
function isFeishuRetryableSyntheticEventError(error) {
	return error instanceof FeishuRetryableSyntheticEventError || typeof error === "object" && error !== null && "name" in error && error.name === "FeishuRetryableSyntheticEventError";
}
async function resolveReactionSyntheticEvent(params) {
	const { cfg, accountId, event, botOpenId, fetchMessage = getMessageFeishu, verificationTimeoutMs = FEISHU_REACTION_VERIFY_TIMEOUT_MS, logger, uuid = () => crypto$1.randomUUID(), action = "created" } = params;
	const emoji = event.reaction_type?.emoji_type;
	const messageId = event.message_id;
	const senderId = event.user_id?.open_id;
	const senderUserId = event.user_id?.user_id;
	if (!emoji || !messageId || !senderId) return null;
	const reactionNotifications = resolveFeishuAccount({
		cfg,
		accountId
	}).config.reactionNotifications ?? "own";
	if (reactionNotifications === "off") return null;
	if (event.operator_type === "app" || senderId === botOpenId) return null;
	if (emoji === "Typing") return null;
	if (reactionNotifications === "own" && !botOpenId) {
		logger?.(`feishu[${accountId}]: bot open_id unavailable, skipping reaction ${emoji} on ${messageId}`);
		return null;
	}
	const reactedMsg = await raceWithTimeoutAndAbort(fetchMessage({
		cfg,
		messageId,
		accountId
	}), { timeoutMs: verificationTimeoutMs }).then((result) => result.status === "resolved" ? result.value : null).catch(() => null);
	const isBotMessage = reactedMsg?.senderType === "app" || reactedMsg?.senderOpenId === botOpenId;
	if (!reactedMsg || reactionNotifications === "own" && !isBotMessage) {
		logger?.(`feishu[${accountId}]: ignoring reaction on non-bot/unverified message ${messageId} (sender: ${reactedMsg?.senderOpenId ?? "unknown"})`);
		return null;
	}
	const fallbackChatType = reactedMsg.chatType;
	const resolvedChatType = normalizeFeishuChatType(event.chat_type) ?? fallbackChatType;
	if (!resolvedChatType) {
		logger?.(`feishu[${accountId}]: skipping reaction ${emoji} on ${messageId} without chat type context`);
		return null;
	}
	const syntheticChatIdRaw = event.chat_id ?? reactedMsg.chatId;
	const syntheticChatId = syntheticChatIdRaw?.trim() ? syntheticChatIdRaw : `p2p:${senderId}`;
	const syntheticChatType = resolvedChatType;
	return {
		sender: {
			sender_id: {
				open_id: senderId,
				...senderUserId ? { user_id: senderUserId } : {}
			},
			sender_type: "user"
		},
		message: {
			message_id: `${messageId}:reaction:${emoji}:${uuid()}`,
			chat_id: syntheticChatId,
			chat_type: syntheticChatType,
			message_type: "text",
			content: JSON.stringify({ text: action === "deleted" ? `[removed reaction ${emoji} from message ${messageId}]` : `[reacted with ${emoji} to message ${messageId}]` })
		}
	};
}
function normalizeFeishuChatType(value) {
	return value === "group" || value === "private" || value === "p2p" ? value : void 0;
}
function readStringOrNumber(value) {
	return typeof value === "string" || typeof value === "number" ? value : void 0;
}
function parseFeishuMessageEventPayload(value) {
	if (!isRecord$1(value)) return null;
	const sender = value.sender;
	const message = value.message;
	if (!isRecord$1(sender) || !isRecord$1(message)) return null;
	const senderId = sender.sender_id;
	if (!isRecord$1(senderId)) return null;
	const messageId = readString(message.message_id);
	const chatId = readString(message.chat_id);
	const chatType = normalizeFeishuChatType(message.chat_type);
	const messageType = readString(message.message_type);
	const content = readString(message.content);
	if (!messageId || !chatId || !chatType || !messageType || !content) return null;
	return value;
}
function parseFeishuBotAddedEventPayload(value) {
	if (!isRecord$1(value) || !readString(value.chat_id) || !isRecord$1(value.operator_id)) return null;
	return value;
}
function parseFeishuBotRemovedChatId(value) {
	if (!isRecord$1(value)) return null;
	return readString(value.chat_id) ?? null;
}
function parseFeishuBotMenuEvent(value) {
	if (!isRecord$1(value)) return null;
	const operator = value.operator;
	if (operator !== void 0 && !isRecord$1(operator)) return null;
	return {
		event_key: readString(value.event_key),
		timestamp: readStringOrNumber(value.timestamp),
		operator: operator ? {
			operator_name: readString(operator.operator_name),
			operator_id: isRecord$1(operator.operator_id) ? {
				open_id: readString(operator.operator_id.open_id),
				user_id: readString(operator.operator_id.user_id),
				union_id: readString(operator.operator_id.union_id)
			} : void 0
		} : void 0
	};
}
function parseFeishuCardActionEventPayload(value) {
	if (!isRecord$1(value)) return null;
	const operator = value.operator;
	const action = value.action;
	const context = value.context;
	if (!isRecord$1(operator) || !isRecord$1(action) || !isRecord$1(context)) return null;
	const token = readString(value.token);
	const openId = readString(operator.open_id);
	const userId = readString(operator.user_id);
	const unionId = readString(operator.union_id);
	const tag = readString(action.tag);
	const actionValue = action.value;
	const contextOpenId = readString(context.open_id);
	const contextUserId = readString(context.user_id);
	const chatId = readString(context.chat_id);
	if (!token || !openId || !userId || !unionId || !tag || !isRecord$1(actionValue) || !contextOpenId || !contextUserId || !chatId) return null;
	return {
		operator: {
			open_id: openId,
			user_id: userId,
			union_id: unionId
		},
		token,
		action: {
			value: actionValue,
			tag
		},
		context: {
			open_id: contextOpenId,
			user_id: contextUserId,
			chat_id: chatId
		}
	};
}
function buildCommentNoticeQueueKey(event) {
	return `comment-doc:${event.notice_meta?.file_type?.trim() || "unknown"}:${event.notice_meta?.file_token?.trim() || "unknown"}`;
}
function mergeFeishuDebounceMentions(entries) {
	const merged = /* @__PURE__ */ new Map();
	for (const entry of entries) for (const mention of entry.message.mentions ?? []) {
		const stableId = mention.id.open_id?.trim() || mention.id.user_id?.trim() || mention.id.union_id?.trim();
		const mentionName = mention.name?.trim();
		const mentionKey = mention.key?.trim();
		const fallback = mentionName && mentionKey ? `${mentionName}|${mentionKey}` : mentionName || mentionKey;
		const key = stableId || fallback;
		if (!key || merged.has(key)) continue;
		merged.set(key, mention);
	}
	if (merged.size === 0) return;
	return Array.from(merged.values());
}
function dedupeFeishuDebounceEntriesByMessageId(entries) {
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const entry of entries) {
		const messageId = entry.message.message_id?.trim();
		if (!messageId) {
			deduped.push(entry);
			continue;
		}
		if (seen.has(messageId)) continue;
		seen.add(messageId);
		deduped.push(entry);
	}
	return deduped;
}
function resolveFeishuDebounceMentions(params) {
	const { entries, botOpenId } = params;
	if (entries.length === 0) return;
	for (let index = entries.length - 1; index >= 0; index -= 1) {
		const entry = entries[index];
		if (isMentionForwardRequest(entry, botOpenId)) return mergeFeishuDebounceMentions([entry]);
	}
	const merged = mergeFeishuDebounceMentions(entries);
	if (!merged) return;
	const normalizedBotOpenId = botOpenId?.trim();
	if (!normalizedBotOpenId) return;
	const botMentions = merged.filter((mention) => mention.id.open_id?.trim() === normalizedBotOpenId);
	return botMentions.length > 0 ? botMentions : void 0;
}
function registerEventHandlers(eventDispatcher, context) {
	const { cfg, accountId, runtime, chatHistories, fireAndForget } = context;
	const core = getFeishuRuntime();
	const inboundDebounceMs = core.channel.debounce.resolveInboundDebounceMs({
		cfg,
		channel: "feishu"
	});
	const log = runtime?.log ?? console.log;
	const error = runtime?.error ?? console.error;
	const enqueue = createSequentialQueue();
	const runFeishuHandler = async (params) => {
		if (fireAndForget) {
			params.task().catch((err) => {
				error(`${params.errorMessage}: ${String(err)}`);
			});
			return;
		}
		try {
			await params.task();
		} catch (err) {
			error(`${params.errorMessage}: ${String(err)}`);
		}
	};
	const dispatchFeishuMessage = async (event) => {
		const sequentialKey = getFeishuSequentialKey({
			accountId,
			event,
			botOpenId: botOpenIds.get(accountId),
			botName: botNames.get(accountId)
		});
		const task = () => handleFeishuMessage({
			cfg,
			event,
			botOpenId: botOpenIds.get(accountId),
			botName: botNames.get(accountId),
			runtime,
			chatHistories,
			accountId,
			processingClaimHeld: true
		});
		await enqueue(sequentialKey, task);
	};
	const resolveSenderDebounceId = (event) => {
		return event.sender.sender_id.open_id?.trim() || event.sender.sender_id.user_id?.trim() || void 0;
	};
	const resolveDebounceText = (event) => {
		return parseFeishuMessageEvent(event, botOpenIds.get(accountId), botNames.get(accountId)).content.trim();
	};
	const recordSuppressedMessageIds = async (entries, dispatchMessageId) => {
		const keepMessageId = dispatchMessageId?.trim();
		const suppressedIds = new Set(entries.map((entry) => entry.message.message_id?.trim()).filter((id) => Boolean(id) && (!keepMessageId || id !== keepMessageId)));
		if (suppressedIds.size === 0) return;
		for (const messageId of suppressedIds) try {
			await recordProcessedFeishuMessage(messageId, accountId, log);
		} catch (err) {
			error(`feishu[${accountId}]: failed to record merged dedupe id ${messageId}: ${String(err)}`);
		}
	};
	const isMessageAlreadyProcessed = async (entry) => {
		return await hasProcessedFeishuMessage(entry.message.message_id, accountId, log);
	};
	const inboundDebouncer = core.channel.debounce.createInboundDebouncer({
		debounceMs: inboundDebounceMs,
		buildKey: (event) => {
			const chatId = event.message.chat_id?.trim();
			const senderId = resolveSenderDebounceId(event);
			if (!chatId || !senderId) return null;
			const rootId = event.message.root_id?.trim();
			return `feishu:${accountId}:${chatId}:${rootId ? `thread:${rootId}` : "chat"}:${senderId}`;
		},
		shouldDebounce: (event) => {
			if (event.message.message_type !== "text") return false;
			const text = resolveDebounceText(event);
			if (!text) return false;
			return !core.channel.text.hasControlCommand(text, cfg);
		},
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			if (entries.length === 1) {
				await dispatchFeishuMessage(last);
				return;
			}
			const dedupedEntries = dedupeFeishuDebounceEntriesByMessageId(entries);
			const freshEntries = [];
			for (const entry of dedupedEntries) if (!await isMessageAlreadyProcessed(entry)) freshEntries.push(entry);
			const dispatchEntry = freshEntries.at(-1);
			if (!dispatchEntry) return;
			await recordSuppressedMessageIds(dedupedEntries, dispatchEntry.message.message_id);
			const combinedText = freshEntries.map((entry) => resolveDebounceText(entry)).filter(Boolean).join("\n");
			const mergedMentions = resolveFeishuDebounceMentions({
				entries: freshEntries,
				botOpenId: botOpenIds.get(accountId)
			});
			if (!combinedText.trim()) {
				await dispatchFeishuMessage({
					...dispatchEntry,
					message: {
						...dispatchEntry.message,
						mentions: mergedMentions ?? dispatchEntry.message.mentions
					}
				});
				return;
			}
			await dispatchFeishuMessage({
				...dispatchEntry,
				message: {
					...dispatchEntry.message,
					message_type: "text",
					content: JSON.stringify({ text: combinedText }),
					mentions: mergedMentions ?? dispatchEntry.message.mentions
				}
			});
		},
		onError: (err, entries) => {
			for (const entry of entries) releaseFeishuMessageProcessing(entry.message.message_id, accountId);
			error(`feishu[${accountId}]: inbound debounce flush failed: ${String(err)}`);
		}
	});
	eventDispatcher.register({
		"im.message.receive_v1": async (data) => {
			const event = parseFeishuMessageEventPayload(data);
			if (!event) {
				error(`feishu[${accountId}]: ignoring malformed message event payload`);
				return;
			}
			const messageId = event.message?.message_id?.trim();
			if (!tryBeginFeishuMessageProcessing(messageId, accountId)) {
				log(`feishu[${accountId}]: dropping duplicate event for message ${messageId}`);
				return;
			}
			const processMessage = async () => {
				await inboundDebouncer.enqueue(event);
			};
			if (fireAndForget) {
				processMessage().catch((err) => {
					releaseFeishuMessageProcessing(messageId, accountId);
					error(`feishu[${accountId}]: error handling message: ${String(err)}`);
				});
				return;
			}
			try {
				await processMessage();
			} catch (err) {
				releaseFeishuMessageProcessing(messageId, accountId);
				error(`feishu[${accountId}]: error handling message: ${String(err)}`);
			}
		},
		"im.message.message_read_v1": async () => {},
		"im.chat.member.bot.added_v1": async (data) => {
			try {
				const event = parseFeishuBotAddedEventPayload(data);
				if (!event) return;
				log(`feishu[${accountId}]: bot added to chat ${event.chat_id}`);
			} catch (err) {
				error(`feishu[${accountId}]: error handling bot added event: ${String(err)}`);
			}
		},
		"im.chat.member.bot.deleted_v1": async (data) => {
			try {
				const chatId = parseFeishuBotRemovedChatId(data);
				if (!chatId) return;
				log(`feishu[${accountId}]: bot removed from chat ${chatId}`);
			} catch (err) {
				error(`feishu[${accountId}]: error handling bot removed event: ${String(err)}`);
			}
		},
		"drive.notice.comment_add_v1": async (data) => {
			await runFeishuHandler({
				errorMessage: `feishu[${accountId}]: error handling drive comment notice`,
				task: async () => {
					const event = parseFeishuDriveCommentNoticeEventPayload(data);
					if (!event) {
						error(`feishu[${accountId}]: ignoring malformed drive comment notice payload`);
						return;
					}
					const eventId = event.event_id?.trim();
					const syntheticMessageId = eventId ? `drive-comment:${eventId}` : void 0;
					if (syntheticMessageId) {
						const claim = await claimUnprocessedFeishuMessage({
							messageId: syntheticMessageId,
							namespace: accountId,
							log
						});
						if (claim === "duplicate") {
							log(`feishu[${accountId}]: dropping duplicate comment event ${syntheticMessageId}`);
							return;
						}
						if (claim === "inflight") {
							log(`feishu[${accountId}]: dropping in-flight comment event ${syntheticMessageId}`);
							return;
						}
					}
					log(`feishu[${accountId}]: received drive comment notice event=${event.event_id ?? "unknown"} type=${event.notice_meta?.notice_type ?? "unknown"} file=${event.notice_meta?.file_type ?? "unknown"}:${event.notice_meta?.file_token ?? "unknown"} comment=${event.comment_id ?? "unknown"} reply=${event.reply_id ?? "none"} from=${event.notice_meta?.from_user_id?.open_id ?? "unknown"} mentioned=${event.is_mentioned === true ? "yes" : "no"}`);
					try {
						await enqueue(buildCommentNoticeQueueKey(event), async () => {
							await handleFeishuCommentEvent({
								cfg,
								accountId,
								event,
								botOpenId: botOpenIds.get(accountId),
								runtime
							});
						});
						if (syntheticMessageId) await recordProcessedFeishuMessage(syntheticMessageId, accountId, log);
					} catch (err) {
						if (syntheticMessageId && !isFeishuRetryableSyntheticEventError(err)) await recordProcessedFeishuMessage(syntheticMessageId, accountId, log);
						throw err;
					} finally {
						if (syntheticMessageId) releaseFeishuMessageProcessing(syntheticMessageId, accountId);
					}
				}
			});
		},
		"im.message.reaction.created_v1": async (data) => {
			await runFeishuHandler({
				errorMessage: `feishu[${accountId}]: error handling reaction event`,
				task: async () => {
					const event = data;
					const myBotId = botOpenIds.get(accountId);
					const syntheticEvent = await resolveReactionSyntheticEvent({
						cfg,
						accountId,
						event,
						botOpenId: myBotId,
						logger: log
					});
					if (!syntheticEvent) return;
					await handleFeishuMessage({
						cfg,
						event: syntheticEvent,
						botOpenId: myBotId,
						botName: botNames.get(accountId),
						runtime,
						chatHistories,
						accountId
					});
				}
			});
		},
		"im.message.reaction.deleted_v1": async (data) => {
			await runFeishuHandler({
				errorMessage: `feishu[${accountId}]: error handling reaction removal event`,
				task: async () => {
					const event = data;
					const myBotId = botOpenIds.get(accountId);
					const syntheticEvent = await resolveReactionSyntheticEvent({
						cfg,
						accountId,
						event,
						botOpenId: myBotId,
						logger: log,
						action: "deleted"
					});
					if (!syntheticEvent) return;
					await handleFeishuMessage({
						cfg,
						event: syntheticEvent,
						botOpenId: myBotId,
						botName: botNames.get(accountId),
						runtime,
						chatHistories,
						accountId
					});
				}
			});
		},
		"application.bot.menu_v6": async (data) => {
			try {
				const event = parseFeishuBotMenuEvent(data);
				if (!event) return;
				const operatorOpenId = event.operator?.operator_id?.open_id?.trim();
				const eventKey = event.event_key?.trim();
				if (!operatorOpenId || !eventKey) return;
				const syntheticEvent = {
					sender: {
						sender_id: {
							open_id: operatorOpenId,
							user_id: event.operator?.operator_id?.user_id,
							union_id: event.operator?.operator_id?.union_id
						},
						sender_type: "user"
					},
					message: {
						message_id: `bot-menu:${eventKey}:${event.timestamp ?? Date.now()}`,
						chat_id: `p2p:${operatorOpenId}`,
						chat_type: "p2p",
						message_type: "text",
						content: JSON.stringify({ text: `/menu ${eventKey}` })
					}
				};
				const syntheticMessageId = syntheticEvent.message.message_id;
				const claim = await claimUnprocessedFeishuMessage({
					messageId: syntheticMessageId,
					namespace: accountId,
					log
				});
				if (claim === "duplicate") {
					log(`feishu[${accountId}]: dropping duplicate bot-menu event for ${syntheticMessageId}`);
					return;
				}
				if (claim === "inflight") {
					log(`feishu[${accountId}]: dropping in-flight bot-menu event for ${syntheticMessageId}`);
					return;
				}
				const handleLegacyMenu = () => handleFeishuMessage({
					cfg,
					event: syntheticEvent,
					botOpenId: botOpenIds.get(accountId),
					botName: botNames.get(accountId),
					runtime,
					chatHistories,
					accountId,
					processingClaimHeld: true
				});
				const promise = maybeHandleFeishuQuickActionMenu({
					cfg,
					eventKey,
					operatorOpenId,
					runtime,
					accountId
				}).then(async (handledMenu) => {
					if (handledMenu) {
						await recordProcessedFeishuMessage(syntheticMessageId, accountId, log);
						releaseFeishuMessageProcessing(syntheticMessageId, accountId);
						return;
					}
					return await handleLegacyMenu();
				}).catch(async (err) => {
					if (isFeishuRetryableSyntheticEventError(err)) releaseFeishuMessageProcessing(syntheticMessageId, accountId);
					else await recordProcessedFeishuMessage(syntheticMessageId, accountId, log);
					throw err;
				});
				if (fireAndForget) {
					promise.catch((err) => {
						error(`feishu[${accountId}]: error handling bot menu event: ${String(err)}`);
					});
					return;
				}
				await promise;
			} catch (err) {
				error(`feishu[${accountId}]: error handling bot menu event: ${String(err)}`);
			}
		},
		"card.action.trigger": async (data) => {
			try {
				const event = parseFeishuCardActionEventPayload(data);
				if (!event) {
					error(`feishu[${accountId}]: ignoring malformed card action payload`);
					return;
				}
				const promise = handleFeishuCardAction({
					cfg,
					event,
					botOpenId: botOpenIds.get(accountId),
					runtime,
					accountId
				});
				if (fireAndForget) promise.catch((err) => {
					error(`feishu[${accountId}]: error handling card action: ${String(err)}`);
				});
				else await promise;
			} catch (err) {
				error(`feishu[${accountId}]: error handling card action: ${String(err)}`);
			}
		}
	});
}
async function monitorSingleAccount(params) {
	const { cfg, account, runtime, abortSignal } = params;
	const { accountId } = account;
	const log = runtime?.log ?? console.log;
	const botOpenIdSource = params.botOpenIdSource ?? { kind: "fetch" };
	const { botOpenId } = applyBotIdentityState(accountId, botOpenIdSource.kind === "prefetched" ? {
		botOpenId: botOpenIdSource.botOpenId,
		botName: botOpenIdSource.botName
	} : await fetchBotIdentityForMonitor(account, {
		runtime,
		abortSignal
	}));
	log(`feishu[${accountId}]: bot open_id resolved: ${botOpenId ?? "unknown"}`);
	if (!botOpenId && !abortSignal?.aborted) startBotIdentityRecovery({
		account,
		accountId,
		runtime,
		abortSignal
	});
	const connectionMode = account.config.connectionMode ?? "websocket";
	if (connectionMode === "webhook" && !account.verificationToken?.trim()) throw new Error(`Feishu account "${accountId}" webhook mode requires verificationToken`);
	if (connectionMode === "webhook" && !account.encryptKey?.trim()) throw new Error(`Feishu account "${accountId}" webhook mode requires encryptKey`);
	const warmupCount = await warmupDedupFromDisk(accountId, log);
	if (warmupCount > 0) log(`feishu[${accountId}]: dedup warmup loaded ${warmupCount} entries from disk`);
	let threadBindingManager = null;
	try {
		const eventDispatcher = createEventDispatcher(account);
		const chatHistories = /* @__PURE__ */ new Map();
		threadBindingManager = createFeishuThreadBindingManager({
			accountId,
			cfg
		});
		registerEventHandlers(eventDispatcher, {
			cfg,
			accountId,
			runtime,
			chatHistories,
			fireAndForget: true
		});
		if (connectionMode === "webhook") return await monitorWebhook({
			account,
			accountId,
			runtime,
			abortSignal,
			eventDispatcher
		});
		return await monitorWebSocket({
			account,
			accountId,
			runtime,
			abortSignal,
			eventDispatcher
		});
	} finally {
		threadBindingManager?.stop();
	}
}
//#endregion
//#region extensions/feishu/src/monitor.ts
async function monitorFeishuProvider(opts = {}) {
	const cfg = opts.config;
	if (!cfg) throw new Error("Config is required for Feishu monitor");
	const log = opts.runtime?.log ?? console.log;
	if (opts.accountId) {
		const account = resolveFeishuRuntimeAccount({
			cfg,
			accountId: opts.accountId
		}, { requireEventSecrets: true });
		if (!account.enabled || !account.configured) throw new Error(`Feishu account "${opts.accountId}" not configured or disabled`);
		return monitorSingleAccount({
			cfg,
			account,
			runtime: opts.runtime,
			abortSignal: opts.abortSignal
		});
	}
	const accounts = listEnabledFeishuAccounts(cfg);
	if (accounts.length === 0) throw new Error("No enabled Feishu accounts configured");
	log(`feishu: starting ${accounts.length} account(s): ${accounts.map((a) => a.accountId).join(", ")}`);
	const monitorPromises = [];
	for (const account of accounts) {
		if (opts.abortSignal?.aborted) {
			log("feishu: abort signal received during startup preflight; stopping startup");
			break;
		}
		const { botOpenId, botName } = await fetchBotIdentityForMonitor(account, {
			runtime: opts.runtime,
			abortSignal: opts.abortSignal
		});
		if (opts.abortSignal?.aborted) {
			log("feishu: abort signal received during startup preflight; stopping startup");
			break;
		}
		monitorPromises.push(monitorSingleAccount({
			cfg,
			account,
			runtime: opts.runtime,
			abortSignal: opts.abortSignal,
			botOpenIdSource: {
				kind: "prefetched",
				botOpenId,
				botName
			}
		}));
	}
	await Promise.all(monitorPromises);
}
//#endregion
export { monitorFeishuProvider };
