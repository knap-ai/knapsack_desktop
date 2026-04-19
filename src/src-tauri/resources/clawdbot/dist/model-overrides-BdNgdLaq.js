import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { C as parseThreadSessionSuffix, S as parseRawSessionConversationRef } from "./session-key-Bh1lMwK5.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { a as resolveChannelEntryMatchWithFallback, n as buildChannelKeyCandidates, r as normalizeChannelSlug } from "./channel-config-DBnJYaTV.js";
import { t as normalizeChatType } from "./chat-type-DFnPOWna.js";
import { n as resolveSessionConversationRef, t as resolveSessionConversation } from "./session-conversation-BkRPri5o.js";
//#region src/channels/model-overrides.ts
function resolveProviderEntry(modelByChannel, channel) {
	const normalized = normalizeMessageChannel(channel) ?? normalizeOptionalLowercaseString(channel) ?? "";
	return modelByChannel?.[normalized] ?? modelByChannel?.[Object.keys(modelByChannel ?? {}).find((key) => {
		return (normalizeMessageChannel(key) ?? normalizeOptionalLowercaseString(key) ?? "") === normalized;
	}) ?? ""];
}
function buildChannelCandidates(params) {
	const normalizedChannel = normalizeMessageChannel(params.channel ?? "") ?? normalizeOptionalLowercaseString(params.channel);
	const groupId = normalizeOptionalString(params.groupId);
	const sessionConversation = resolveSessionConversationRef(params.parentSessionKey);
	const feishuParentOverrideFallbacks = normalizedChannel === "feishu" ? buildFeishuParentOverrideCandidates(sessionConversation?.rawId) : [];
	const parentOverrideFallbacks = (normalizedChannel ? getChannelPlugin(normalizedChannel)?.conversationBindings?.buildModelOverrideParentCandidates?.({ parentConversationId: sessionConversation?.rawId }) : null) ?? [];
	const groupConversationKind = normalizeChatType(params.groupChatType ?? void 0) === "channel" ? "channel" : sessionConversation?.kind === "channel" ? "channel" : "group";
	const groupConversation = resolveSessionConversation({
		channel: normalizedChannel ?? "",
		kind: groupConversationKind,
		rawId: groupId ?? ""
	});
	const groupChannel = normalizeOptionalString(params.groupChannel);
	const groupSubject = normalizeOptionalString(params.groupSubject);
	const channelBare = groupChannel ? groupChannel.replace(/^#/, "") : void 0;
	const subjectBare = groupSubject ? groupSubject.replace(/^#/, "") : void 0;
	const channelSlug = channelBare ? normalizeChannelSlug(channelBare) : void 0;
	const subjectSlug = subjectBare ? normalizeChannelSlug(subjectBare) : void 0;
	return {
		keys: buildChannelKeyCandidates(groupId, sessionConversation?.rawId, ...groupConversation?.parentConversationCandidates ?? [], ...sessionConversation?.parentConversationCandidates ?? [], ...feishuParentOverrideFallbacks, ...parentOverrideFallbacks),
		parentKeys: buildChannelKeyCandidates(groupChannel, channelBare, channelSlug, groupSubject, subjectBare, subjectSlug)
	};
}
function buildGenericParentOverrideCandidates(sessionKey) {
	const raw = parseRawSessionConversationRef(sessionKey);
	if (!raw) return [];
	const { baseSessionKey, threadId } = parseThreadSessionSuffix(raw.rawId);
	return buildChannelKeyCandidates(threadId ? baseSessionKey : raw.rawId);
}
function buildFeishuParentOverrideCandidates(rawId) {
	const value = normalizeOptionalString(rawId);
	if (!value) return [];
	const topicSenderMatch = value.match(/^(.+):topic:([^:]+):sender:([^:]+)$/i);
	if (topicSenderMatch) {
		const chatId = normalizeOptionalLowercaseString(topicSenderMatch[1]);
		return [`${chatId}:topic:${normalizeOptionalLowercaseString(topicSenderMatch[2])}`, chatId].filter((entry) => Boolean(entry));
	}
	const topicMatch = value.match(/^(.+):topic:([^:]+)$/i);
	if (topicMatch) {
		const chatId = normalizeOptionalLowercaseString(topicMatch[1]);
		return [`${chatId}:topic:${normalizeOptionalLowercaseString(topicMatch[2])}`, chatId].filter((entry) => Boolean(entry));
	}
	const senderMatch = value.match(/^(.+):sender:([^:]+)$/i);
	if (senderMatch) {
		const chatId = normalizeOptionalLowercaseString(senderMatch[1]);
		return chatId ? [chatId] : [];
	}
	return [];
}
function resolveDirectChannelModelMatch(params) {
	const rawParent = parseRawSessionConversationRef(params.parentSessionKey);
	const directKeys = buildChannelKeyCandidates(params.groupId, ...buildGenericParentOverrideCandidates(params.parentSessionKey), ...normalizeOptionalLowercaseString(params.channel) === "feishu" ? buildFeishuParentOverrideCandidates(rawParent?.rawId) : []);
	if (directKeys.length === 0) return null;
	const match = resolveChannelEntryMatchWithFallback({
		entries: params.providerEntries,
		keys: directKeys,
		parentKeys: [],
		wildcardKey: "*",
		normalizeKey: (value) => normalizeOptionalLowercaseString(value) ?? ""
	});
	const raw = match.entry ?? match.wildcardEntry;
	if (typeof raw !== "string") return null;
	const model = normalizeOptionalString(raw);
	if (!model) return null;
	return {
		model,
		matchKey: match.matchKey,
		matchSource: match.matchSource
	};
}
function resolveChannelModelOverride(params) {
	const channel = normalizeOptionalString(params.channel);
	if (!channel) return null;
	const modelByChannel = params.cfg.channels?.modelByChannel;
	if (!modelByChannel) return null;
	const providerEntries = resolveProviderEntry(modelByChannel, channel);
	if (!providerEntries) return null;
	const directMatch = resolveDirectChannelModelMatch({
		channel,
		providerEntries,
		groupId: params.groupId,
		parentSessionKey: params.parentSessionKey
	});
	if (directMatch) return {
		channel: normalizeMessageChannel(channel) ?? normalizeOptionalLowercaseString(channel) ?? "",
		model: directMatch.model,
		matchKey: directMatch.matchKey,
		matchSource: directMatch.matchSource
	};
	const { keys, parentKeys } = buildChannelCandidates(params);
	if (keys.length === 0 && parentKeys.length === 0) return null;
	const match = resolveChannelEntryMatchWithFallback({
		entries: providerEntries,
		keys,
		parentKeys,
		wildcardKey: "*",
		normalizeKey: (value) => normalizeOptionalLowercaseString(value) ?? ""
	});
	const raw = match.entry ?? match.wildcardEntry;
	if (typeof raw !== "string") return null;
	const model = normalizeOptionalString(raw);
	if (!model) return null;
	return {
		channel: normalizeMessageChannel(channel) ?? normalizeOptionalLowercaseString(channel) ?? "",
		model,
		matchKey: match.matchKey,
		matchSource: match.matchSource
	};
}
//#endregion
export { resolveChannelModelOverride as t };
