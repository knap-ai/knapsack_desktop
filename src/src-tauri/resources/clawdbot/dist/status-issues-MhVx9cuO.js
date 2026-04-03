import { u as isRecord } from "./utils-CE3P21nG.js";
import { a as resolveEnabledConfiguredAccountId, n as asString, t as appendMatchMetadata } from "./shared-CJJtMTbb.js";
import "./status-helpers-CtpWf3f1.js";
import { f as resolvePayloadMediaUrls, v as sendPayloadMediaSequenceOrFallback } from "./reply-payload-SzVz53hc.js";
import { o as resolveInteractiveTextFallback } from "./payload-CLtYAQwf.js";
import { t as resolveOutboundSendDep } from "./send-deps-DLS-OK3u.js";
import { g as mapAllowFromEntries } from "./channel-config-helpers-B0S2z66F.js";
import { n as resolveChannelGroupRequireMention, r as resolveChannelGroupToolsPolicy } from "./group-policy-B1uRyci5.js";
import "./channel-policy-Dqo0XdDX.js";
import "./directory-runtime-Rwkajwwt.js";
import { r as createInspectedDirectoryEntriesLister } from "./directory-config-helpers-C_EYixJ2.js";
import "./outbound-runtime-D_hcnwUl.js";
import { i as createAttachedChannelResultAdapter, t as attachChannelToResult } from "./channel-send-result-COXGPSxL.js";
import { i as parseTelegramTarget, r as normalizeTelegramLookupTarget } from "./targets-CxxizSi5.js";
import { F as parseTelegramThreadId, P as parseTelegramReplyToMessageId, r as markdownToTelegramHtmlChunks } from "./format-DqAjfaGj.js";
import { t as resolveTelegramInlineButtons } from "./button-types-BhHJDvdC.js";
import { g as sendMessageTelegram } from "./sticker-cache-Cf0p9p0n.js";
import { t as inspectTelegramAccount } from "./account-inspect-Bn51pMYf.js";
//#region extensions/telegram/src/action-threading.ts
function resolveTelegramAutoThreadId(params) {
	const context = params.toolContext;
	if (!context?.currentThreadTs || !context.currentChannelId) return;
	const parsedTo = parseTelegramTarget(params.to);
	const parsedChannel = parseTelegramTarget(context.currentChannelId);
	if (parsedTo.chatId.toLowerCase() !== parsedChannel.chatId.toLowerCase()) return;
	return context.currentThreadTs;
}
//#endregion
//#region extensions/telegram/src/directory-config.ts
const listTelegramDirectoryPeersFromConfig = createInspectedDirectoryEntriesLister({
	kind: "user",
	inspectAccount: (cfg, accountId) => inspectTelegramAccount({
		cfg,
		accountId
	}),
	resolveSources: (account) => [mapAllowFromEntries(account.config.allowFrom), Object.keys(account.config.dms ?? {})],
	normalizeId: (entry) => {
		const trimmed = entry.replace(/^(telegram|tg):/i, "").trim();
		if (!trimmed) return null;
		if (/^-?\d+$/.test(trimmed)) return trimmed;
		return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
	}
});
const listTelegramDirectoryGroupsFromConfig = createInspectedDirectoryEntriesLister({
	kind: "group",
	inspectAccount: (cfg, accountId) => inspectTelegramAccount({
		cfg,
		accountId
	}),
	resolveSources: (account) => [Object.keys(account.config.groups ?? {})],
	normalizeId: (entry) => entry.trim() || null
});
//#endregion
//#region extensions/telegram/src/group-policy.ts
function parseTelegramGroupId(value) {
	const raw = value?.trim() ?? "";
	if (!raw) return {
		chatId: void 0,
		topicId: void 0
	};
	const parts = raw.split(":").filter(Boolean);
	if (parts.length >= 3 && parts[1] === "topic" && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) return {
		chatId: parts[0],
		topicId: parts[2]
	};
	if (parts.length >= 2 && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return {
		chatId: parts[0],
		topicId: parts[1]
	};
	return {
		chatId: raw,
		topicId: void 0
	};
}
function resolveTelegramRequireMention(params) {
	const { cfg, chatId, topicId } = params;
	if (!chatId) return;
	const groupConfig = cfg.channels?.telegram?.groups?.[chatId];
	const groupDefault = cfg.channels?.telegram?.groups?.["*"];
	const topicConfig = topicId && groupConfig?.topics ? groupConfig.topics[topicId] : void 0;
	const defaultTopicConfig = topicId && groupDefault?.topics ? groupDefault.topics[topicId] : void 0;
	if (typeof topicConfig?.requireMention === "boolean") return topicConfig.requireMention;
	if (typeof defaultTopicConfig?.requireMention === "boolean") return defaultTopicConfig.requireMention;
	if (typeof groupConfig?.requireMention === "boolean") return groupConfig.requireMention;
	if (typeof groupDefault?.requireMention === "boolean") return groupDefault.requireMention;
}
function resolveTelegramGroupRequireMention(params) {
	const { chatId, topicId } = parseTelegramGroupId(params.groupId);
	const requireMention = resolveTelegramRequireMention({
		cfg: params.cfg,
		chatId,
		topicId
	});
	if (typeof requireMention === "boolean") return requireMention;
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId
	});
}
function resolveTelegramGroupToolPolicy(params) {
	const { chatId } = parseTelegramGroupId(params.groupId);
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
//#endregion
//#region extensions/telegram/src/normalize.ts
const TELEGRAM_PREFIX_RE = /^(telegram|tg):/i;
function normalizeTelegramTargetBody(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const prefixStripped = trimmed.replace(TELEGRAM_PREFIX_RE, "").trim();
	if (!prefixStripped) return;
	const parsed = parseTelegramTarget(trimmed);
	const normalizedChatId = normalizeTelegramLookupTarget(parsed.chatId);
	if (!normalizedChatId) return;
	const keepLegacyGroupPrefix = /^group:/i.test(prefixStripped);
	const hasTopicSuffix = /:topic:\d+$/i.test(prefixStripped);
	const chatSegment = keepLegacyGroupPrefix ? `group:${normalizedChatId}` : normalizedChatId;
	if (parsed.messageThreadId == null) return chatSegment;
	return `${chatSegment}${hasTopicSuffix ? `:topic:${parsed.messageThreadId}` : `:${parsed.messageThreadId}`}`;
}
function normalizeTelegramMessagingTarget(raw) {
	const normalizedBody = normalizeTelegramTargetBody(raw);
	if (!normalizedBody) return;
	return `telegram:${normalizedBody}`.toLowerCase();
}
function looksLikeTelegramTargetId(raw) {
	return normalizeTelegramTargetBody(raw) !== void 0;
}
//#endregion
//#region extensions/telegram/src/outbound-adapter.ts
const TELEGRAM_TEXT_CHUNK_LIMIT = 4e3;
function resolveTelegramSendContext(params) {
	return {
		send: resolveOutboundSendDep(params.deps, "telegram") ?? sendMessageTelegram,
		baseOpts: {
			verbose: false,
			textMode: "html",
			cfg: params.cfg,
			messageThreadId: parseTelegramThreadId(params.threadId),
			replyToMessageId: parseTelegramReplyToMessageId(params.replyToId),
			accountId: params.accountId ?? void 0,
			gatewayClientScopes: params.gatewayClientScopes
		}
	};
}
async function sendTelegramPayloadMessages(params) {
	const telegramData = params.payload.channelData?.telegram;
	const quoteText = typeof telegramData?.quoteText === "string" ? telegramData.quoteText : void 0;
	const text = resolveInteractiveTextFallback({
		text: params.payload.text,
		interactive: params.payload.interactive
	}) ?? "";
	const mediaUrls = resolvePayloadMediaUrls(params.payload);
	const buttons = resolveTelegramInlineButtons({
		buttons: telegramData?.buttons,
		interactive: params.payload.interactive
	});
	const payloadOpts = {
		...params.baseOpts,
		quoteText
	};
	return await sendPayloadMediaSequenceOrFallback({
		text,
		mediaUrls,
		fallbackResult: {
			messageId: "unknown",
			chatId: params.to
		},
		sendNoMedia: async () => await params.send(params.to, text, {
			...payloadOpts,
			buttons
		}),
		send: async ({ text, mediaUrl, isFirst }) => await params.send(params.to, text, {
			...payloadOpts,
			mediaUrl,
			...isFirst ? { buttons } : {}
		})
	});
}
const telegramOutbound = {
	deliveryMode: "direct",
	chunker: markdownToTelegramHtmlChunks,
	chunkerMode: "markdown",
	textChunkLimit: TELEGRAM_TEXT_CHUNK_LIMIT,
	shouldSkipPlainTextSanitization: ({ payload }) => Boolean(payload.channelData),
	resolveEffectiveTextChunkLimit: ({ fallbackLimit }) => typeof fallbackLimit === "number" ? Math.min(fallbackLimit, 4096) : 4096,
	...createAttachedChannelResultAdapter({
		channel: "telegram",
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, gatewayClientScopes }) => {
			const { send, baseOpts } = resolveTelegramSendContext({
				cfg,
				deps,
				accountId,
				replyToId,
				threadId,
				gatewayClientScopes
			});
			return await send(to, text, { ...baseOpts });
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, forceDocument, gatewayClientScopes }) => {
			const { send, baseOpts } = resolveTelegramSendContext({
				cfg,
				deps,
				accountId,
				replyToId,
				threadId,
				gatewayClientScopes
			});
			return await send(to, text, {
				...baseOpts,
				mediaUrl,
				mediaLocalRoots,
				mediaReadFile,
				forceDocument: forceDocument ?? false
			});
		}
	}),
	sendPayload: async ({ cfg, to, payload, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, forceDocument, gatewayClientScopes }) => {
		const { send, baseOpts } = resolveTelegramSendContext({
			cfg,
			deps,
			accountId,
			replyToId,
			threadId,
			gatewayClientScopes
		});
		return attachChannelToResult("telegram", await sendTelegramPayloadMessages({
			send,
			to,
			payload,
			baseOpts: {
				...baseOpts,
				mediaLocalRoots,
				mediaReadFile,
				forceDocument: forceDocument ?? false
			}
		}));
	}
};
//#endregion
//#region extensions/telegram/src/status-issues.ts
function readTelegramAccountStatus(value) {
	if (!isRecord(value)) return null;
	return {
		accountId: value.accountId,
		enabled: value.enabled,
		configured: value.configured,
		allowUnmentionedGroups: value.allowUnmentionedGroups,
		audit: value.audit
	};
}
function readTelegramGroupMembershipAuditSummary(value) {
	if (!isRecord(value)) return {};
	const unresolvedGroups = typeof value.unresolvedGroups === "number" && Number.isFinite(value.unresolvedGroups) ? value.unresolvedGroups : void 0;
	const hasWildcardUnmentionedGroups = typeof value.hasWildcardUnmentionedGroups === "boolean" ? value.hasWildcardUnmentionedGroups : void 0;
	const groupsRaw = value.groups;
	return {
		unresolvedGroups,
		hasWildcardUnmentionedGroups,
		groups: Array.isArray(groupsRaw) ? groupsRaw.map((entry) => {
			if (!isRecord(entry)) return null;
			const chatId = asString(entry.chatId);
			if (!chatId) return null;
			return {
				chatId,
				ok: typeof entry.ok === "boolean" ? entry.ok : void 0,
				status: asString(entry.status) ?? null,
				error: asString(entry.error) ?? null,
				matchKey: asString(entry.matchKey) ?? void 0,
				matchSource: asString(entry.matchSource) ?? void 0
			};
		}).filter(Boolean) : void 0
	};
}
function collectTelegramStatusIssues(accounts) {
	const issues = [];
	for (const entry of accounts) {
		const account = readTelegramAccountStatus(entry);
		if (!account) continue;
		const accountId = resolveEnabledConfiguredAccountId(account);
		if (!accountId) continue;
		if (account.allowUnmentionedGroups === true) issues.push({
			channel: "telegram",
			accountId,
			kind: "config",
			message: "Config allows unmentioned group messages (requireMention=false). Telegram Bot API privacy mode will block most group messages unless disabled.",
			fix: "In BotFather run /setprivacy → Disable for this bot (then restart the gateway)."
		});
		const audit = readTelegramGroupMembershipAuditSummary(account.audit);
		if (audit.hasWildcardUnmentionedGroups === true) issues.push({
			channel: "telegram",
			accountId,
			kind: "config",
			message: "Telegram groups config uses \"*\" with requireMention=false; membership probing is not possible without explicit group IDs.",
			fix: "Add explicit numeric group ids under channels.telegram.groups (or per-account groups) to enable probing."
		});
		if (audit.unresolvedGroups && audit.unresolvedGroups > 0) issues.push({
			channel: "telegram",
			accountId,
			kind: "config",
			message: `Some configured Telegram groups are not numeric IDs (unresolvedGroups=${audit.unresolvedGroups}). Membership probe can only check numeric group IDs.`,
			fix: "Use numeric chat IDs (e.g. -100...) as keys in channels.telegram.groups for requireMention=false groups."
		});
		for (const group of audit.groups ?? []) {
			if (group.ok === true) continue;
			const status = group.status ? ` status=${group.status}` : "";
			const err = group.error ? `: ${group.error}` : "";
			const baseMessage = `Group ${group.chatId} not reachable by bot.${status}${err}`;
			issues.push({
				channel: "telegram",
				accountId,
				kind: "runtime",
				message: appendMatchMetadata(baseMessage, {
					matchKey: group.matchKey,
					matchSource: group.matchSource
				}),
				fix: "Invite the bot to the group, then DM the bot once (/start) and restart the gateway."
			});
		}
	}
	return issues;
}
//#endregion
export { looksLikeTelegramTargetId as a, resolveTelegramGroupToolPolicy as c, resolveTelegramAutoThreadId as d, telegramOutbound as i, listTelegramDirectoryGroupsFromConfig as l, TELEGRAM_TEXT_CHUNK_LIMIT as n, normalizeTelegramMessagingTarget as o, sendTelegramPayloadMessages as r, resolveTelegramGroupRequireMention as s, collectTelegramStatusIssues as t, listTelegramDirectoryPeersFromConfig as u };
