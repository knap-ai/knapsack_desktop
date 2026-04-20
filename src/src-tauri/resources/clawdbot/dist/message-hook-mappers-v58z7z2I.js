import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as logVerbose } from "./globals-De6QTwLG.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-Delpa74L.js";
import "./plugins-D4ODSIPT.js";
//#region src/hooks/fire-and-forget.ts
function fireAndForgetHook(task, label, logger = logVerbose) {
	task.catch((err) => {
		logger(`${label}: ${String(err)}`);
	});
}
//#endregion
//#region src/hooks/message-hook-mappers.ts
function deriveInboundMessageHookContext(ctx, overrides) {
	const content = overrides?.content ?? (typeof ctx.BodyForCommands === "string" ? ctx.BodyForCommands : typeof ctx.RawBody === "string" ? ctx.RawBody : typeof ctx.Body === "string" ? ctx.Body : "");
	const channelId = normalizeLowercaseStringOrEmpty(ctx.OriginatingChannel ?? ctx.Surface ?? ctx.Provider ?? "");
	const conversationId = ctx.OriginatingTo ?? ctx.To ?? ctx.From ?? void 0;
	const isGroup = Boolean(ctx.GroupSubject || ctx.GroupChannel);
	const mediaPaths = Array.isArray(ctx.MediaPaths) ? ctx.MediaPaths.filter((value) => typeof value === "string" && value.length > 0) : void 0;
	const mediaTypes = Array.isArray(ctx.MediaTypes) ? ctx.MediaTypes.filter((value) => typeof value === "string" && value.length > 0) : void 0;
	return {
		from: ctx.From ?? "",
		to: ctx.To,
		content,
		body: ctx.Body,
		bodyForAgent: ctx.BodyForAgent,
		transcript: ctx.Transcript,
		timestamp: typeof ctx.Timestamp === "number" && Number.isFinite(ctx.Timestamp) ? ctx.Timestamp : void 0,
		channelId,
		accountId: ctx.AccountId,
		conversationId,
		messageId: overrides?.messageId ?? ctx.MessageSidFull ?? ctx.MessageSid ?? ctx.MessageSidFirst ?? ctx.MessageSidLast,
		senderId: ctx.SenderId,
		senderName: ctx.SenderName,
		senderUsername: ctx.SenderUsername,
		senderE164: ctx.SenderE164,
		provider: ctx.Provider,
		surface: ctx.Surface,
		threadId: ctx.MessageThreadId,
		mediaPath: ctx.MediaPath ?? mediaPaths?.[0],
		mediaType: ctx.MediaType ?? mediaTypes?.[0],
		mediaPaths,
		mediaTypes,
		originatingChannel: ctx.OriginatingChannel,
		originatingTo: ctx.OriginatingTo,
		guildId: ctx.GroupSpace,
		channelName: ctx.GroupChannel,
		isGroup,
		groupId: isGroup ? conversationId : void 0,
		topicName: ctx.TopicName
	};
}
function buildCanonicalSentMessageHookContext(params) {
	return {
		to: params.to,
		content: params.content,
		success: params.success,
		error: params.error,
		channelId: params.channelId,
		accountId: params.accountId,
		conversationId: params.conversationId ?? params.to,
		messageId: params.messageId,
		isGroup: params.isGroup,
		groupId: params.groupId
	};
}
function toPluginMessageContext(canonical) {
	return {
		channelId: canonical.channelId,
		accountId: canonical.accountId,
		conversationId: canonical.conversationId
	};
}
function stripChannelPrefix(value, channelId) {
	if (!value) return;
	for (const prefix of [
		"channel:",
		"chat:",
		"user:"
	]) if (value.startsWith(prefix)) return value.slice(prefix.length);
	const prefix = `${channelId}:`;
	return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}
function resolveInboundConversation(canonical) {
	const channelId = normalizeChannelId(canonical.channelId);
	const pluginResolved = channelId ? getChannelPlugin(channelId)?.messaging?.resolveInboundConversation?.({
		from: canonical.from,
		to: canonical.to ?? canonical.originatingTo,
		conversationId: canonical.conversationId,
		threadId: canonical.threadId,
		isGroup: canonical.isGroup
	}) : null;
	if (pluginResolved) return {
		conversationId: normalizeOptionalString(pluginResolved.conversationId),
		parentConversationId: normalizeOptionalString(pluginResolved.parentConversationId)
	};
	return { conversationId: stripChannelPrefix(canonical.to ?? canonical.originatingTo ?? canonical.conversationId, canonical.channelId) };
}
function toPluginInboundClaimContext(canonical) {
	const conversation = resolveInboundConversation(canonical);
	return {
		channelId: canonical.channelId,
		accountId: canonical.accountId,
		conversationId: conversation.conversationId,
		parentConversationId: conversation.parentConversationId,
		senderId: canonical.senderId,
		messageId: canonical.messageId
	};
}
function toPluginInboundClaimEvent(canonical, extras) {
	const context = toPluginInboundClaimContext(canonical);
	return {
		content: canonical.content,
		body: canonical.body,
		bodyForAgent: canonical.bodyForAgent,
		transcript: canonical.transcript,
		timestamp: canonical.timestamp,
		channel: canonical.channelId,
		accountId: canonical.accountId,
		conversationId: context.conversationId,
		parentConversationId: context.parentConversationId,
		senderId: canonical.senderId,
		senderName: canonical.senderName,
		senderUsername: canonical.senderUsername,
		threadId: canonical.threadId,
		messageId: canonical.messageId,
		isGroup: canonical.isGroup,
		commandAuthorized: extras?.commandAuthorized,
		wasMentioned: extras?.wasMentioned,
		metadata: {
			from: canonical.from,
			to: canonical.to,
			provider: canonical.provider,
			surface: canonical.surface,
			originatingChannel: canonical.originatingChannel,
			originatingTo: canonical.originatingTo,
			senderE164: canonical.senderE164,
			mediaPath: canonical.mediaPath,
			mediaType: canonical.mediaType,
			mediaPaths: canonical.mediaPaths,
			mediaTypes: canonical.mediaTypes,
			guildId: canonical.guildId,
			channelName: canonical.channelName,
			groupId: canonical.groupId,
			topicName: canonical.topicName
		}
	};
}
function toPluginMessageReceivedEvent(canonical) {
	return {
		from: canonical.from,
		content: canonical.content,
		timestamp: canonical.timestamp,
		metadata: {
			to: canonical.to,
			provider: canonical.provider,
			surface: canonical.surface,
			threadId: canonical.threadId,
			originatingChannel: canonical.originatingChannel,
			originatingTo: canonical.originatingTo,
			messageId: canonical.messageId,
			senderId: canonical.senderId,
			senderName: canonical.senderName,
			senderUsername: canonical.senderUsername,
			senderE164: canonical.senderE164,
			guildId: canonical.guildId,
			channelName: canonical.channelName,
			topicName: canonical.topicName
		}
	};
}
function toPluginMessageSentEvent(canonical) {
	return {
		to: canonical.to,
		content: canonical.content,
		success: canonical.success,
		...canonical.error ? { error: canonical.error } : {}
	};
}
function toInternalMessageReceivedContext(canonical) {
	return {
		from: canonical.from,
		content: canonical.content,
		timestamp: canonical.timestamp,
		channelId: canonical.channelId,
		accountId: canonical.accountId,
		conversationId: canonical.conversationId,
		messageId: canonical.messageId,
		metadata: {
			to: canonical.to,
			provider: canonical.provider,
			surface: canonical.surface,
			threadId: canonical.threadId,
			senderId: canonical.senderId,
			senderName: canonical.senderName,
			senderUsername: canonical.senderUsername,
			senderE164: canonical.senderE164,
			guildId: canonical.guildId,
			channelName: canonical.channelName,
			topicName: canonical.topicName
		}
	};
}
function toInternalMessageTranscribedContext(canonical, cfg) {
	return {
		...toInternalInboundMessageHookContextBase(canonical),
		transcript: canonical.transcript ?? "",
		cfg
	};
}
function toInternalMessagePreprocessedContext(canonical, cfg) {
	return {
		...toInternalInboundMessageHookContextBase(canonical),
		transcript: canonical.transcript,
		isGroup: canonical.isGroup,
		groupId: canonical.groupId,
		cfg
	};
}
function toInternalInboundMessageHookContextBase(canonical) {
	return {
		from: canonical.from,
		to: canonical.to,
		body: canonical.body,
		bodyForAgent: canonical.bodyForAgent,
		timestamp: canonical.timestamp,
		channelId: canonical.channelId,
		conversationId: canonical.conversationId,
		messageId: canonical.messageId,
		senderId: canonical.senderId,
		senderName: canonical.senderName,
		senderUsername: canonical.senderUsername,
		provider: canonical.provider,
		surface: canonical.surface,
		mediaPath: canonical.mediaPath,
		mediaType: canonical.mediaType
	};
}
function toInternalMessageSentContext(canonical) {
	return {
		to: canonical.to,
		content: canonical.content,
		success: canonical.success,
		...canonical.error ? { error: canonical.error } : {},
		channelId: canonical.channelId,
		accountId: canonical.accountId,
		conversationId: canonical.conversationId,
		messageId: canonical.messageId,
		...canonical.isGroup != null ? { isGroup: canonical.isGroup } : {},
		...canonical.groupId ? { groupId: canonical.groupId } : {}
	};
}
//#endregion
export { toInternalMessageSentContext as a, toPluginInboundClaimEvent as c, toPluginMessageSentEvent as d, fireAndForgetHook as f, toInternalMessageReceivedContext as i, toPluginMessageContext as l, deriveInboundMessageHookContext as n, toInternalMessageTranscribedContext as o, toInternalMessagePreprocessedContext as r, toPluginInboundClaimContext as s, buildCanonicalSentMessageHookContext as t, toPluginMessageReceivedEvent as u };
