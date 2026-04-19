import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeChatChannelId } from "./ids-CYPyP4SY.js";
import { a as normalizeAnyChannelId, o as normalizeChannelId } from "./registry-CENZffQG.js";
import { i as normalizeChannelId$1, t as getChannelPlugin } from "./registry-Delpa74L.js";
import "./plugins-D4ODSIPT.js";
import { t as getActivePluginChannelRegistry } from "./runtime-BB1a2aCy.js";
import { t as resolveConversationIdFromTargets } from "./conversation-id-CFhO6sXb.js";
//#region src/channels/plugins/target-parsing.ts
function parseWithPlugin(getPlugin, rawChannel, rawTarget) {
	const channel = normalizeChatChannelId(rawChannel) ?? normalizeChannelId$1(rawChannel);
	if (!channel) return null;
	return getPlugin(channel)?.messaging?.parseExplicitTarget?.({ raw: rawTarget }) ?? null;
}
function parseExplicitTargetForChannel(channel, rawTarget) {
	return parseWithPlugin(getChannelPlugin, channel, rawTarget);
}
//#endregion
//#region src/channels/conversation-binding-context.ts
const CANONICAL_TARGET_PREFIXES = [
	"user:",
	"channel:",
	"conversation:",
	"group:",
	"room:",
	"dm:",
	"spaces/"
];
function getLoadedChannelPlugin(rawChannel) {
	const normalized = normalizeAnyChannelId(rawChannel) ?? normalizeOptionalString(rawChannel);
	if (!normalized) return;
	return getActivePluginChannelRegistry()?.channels.find((entry) => entry.plugin.id === normalized)?.plugin;
}
function shouldDefaultParentConversationToSelf(plugin) {
	return plugin?.bindings?.selfParentConversationByDefault === true;
}
function resolveBindingAccountId(params) {
	return normalizeOptionalString(params.rawAccountId) || normalizeOptionalString(params.plugin?.config.defaultAccountId?.(params.cfg)) || "default";
}
function resolveChannelTargetId(params) {
	const target = normalizeOptionalString(params.target);
	if (!target) return;
	const lower = normalizeLowercaseStringOrEmpty(target);
	const channelPrefix = `${params.channel}:`;
	if (lower.startsWith(channelPrefix)) return resolveChannelTargetId({
		channel: params.channel,
		target: target.slice(channelPrefix.length)
	});
	if (CANONICAL_TARGET_PREFIXES.some((prefix) => lower.startsWith(prefix))) return target;
	const parsedTarget = normalizeOptionalString(parseExplicitTargetForChannel(params.channel, target)?.to);
	if (parsedTarget) return resolveConversationIdFromTargets({ targets: [parsedTarget] }) ?? parsedTarget;
	return resolveConversationIdFromTargets({ targets: [target] }) ?? target;
}
function buildThreadingContext(params) {
	const to = normalizeOptionalString(params.originatingTo) ?? normalizeOptionalString(params.fallbackTo);
	return {
		...to ? { To: to } : {},
		...params.from ? { From: params.from } : {},
		...params.chatType ? { ChatType: params.chatType } : {},
		...params.threadId ? { MessageThreadId: params.threadId } : {},
		...params.nativeChannelId ? { NativeChannelId: params.nativeChannelId } : {}
	};
}
function resolveConversationBindingContext(params) {
	const channel = normalizeAnyChannelId(params.channel) ?? normalizeChannelId(params.channel) ?? normalizeOptionalLowercaseString(params.channel);
	if (!channel) return null;
	const loadedPlugin = getLoadedChannelPlugin(channel);
	const accountId = resolveBindingAccountId({
		rawAccountId: params.accountId,
		plugin: loadedPlugin,
		cfg: params.cfg
	});
	const threadId = normalizeOptionalString(params.threadId != null ? String(params.threadId) : void 0);
	const resolvedByProvider = loadedPlugin?.bindings?.resolveCommandConversation?.({
		accountId,
		threadId,
		threadParentId: normalizeOptionalString(params.threadParentId),
		senderId: normalizeOptionalString(params.senderId),
		sessionKey: normalizeOptionalString(params.sessionKey),
		parentSessionKey: normalizeOptionalString(params.parentSessionKey),
		from: normalizeOptionalString(params.from),
		chatType: normalizeOptionalString(params.chatType),
		originatingTo: params.originatingTo ?? void 0,
		commandTo: params.commandTo ?? void 0,
		fallbackTo: params.fallbackTo ?? void 0
	});
	if (resolvedByProvider?.conversationId) {
		const providerConversationId = normalizeOptionalString(resolvedByProvider.conversationId);
		if (!providerConversationId) return null;
		const providerParentConversationId = normalizeOptionalString(resolvedByProvider.parentConversationId);
		const resolvedParentConversationId = shouldDefaultParentConversationToSelf(loadedPlugin) && !threadId && !providerParentConversationId ? providerConversationId : providerParentConversationId;
		return {
			channel,
			accountId,
			conversationId: providerConversationId,
			...resolvedParentConversationId ? { parentConversationId: resolvedParentConversationId } : {},
			...threadId ? { threadId } : {}
		};
	}
	const focusedBinding = loadedPlugin?.threading?.resolveFocusedBinding?.({
		cfg: params.cfg,
		accountId,
		context: buildThreadingContext({
			fallbackTo: params.fallbackTo ?? void 0,
			originatingTo: params.originatingTo ?? void 0,
			threadId,
			from: normalizeOptionalString(params.from),
			chatType: normalizeOptionalString(params.chatType),
			nativeChannelId: normalizeOptionalString(params.nativeChannelId)
		})
	});
	if (focusedBinding?.conversationId) {
		const focusedConversationId = normalizeOptionalString(focusedBinding.conversationId);
		if (!focusedConversationId) return null;
		const focusedParentConversationId = normalizeOptionalString(focusedBinding.parentConversationId);
		return {
			channel,
			accountId,
			conversationId: focusedConversationId,
			...focusedParentConversationId ? { parentConversationId: focusedParentConversationId } : {},
			...threadId ? { threadId } : {}
		};
	}
	const baseConversationId = resolveChannelTargetId({
		channel,
		target: params.originatingTo
	}) ?? resolveChannelTargetId({
		channel,
		target: params.commandTo
	}) ?? resolveChannelTargetId({
		channel,
		target: params.fallbackTo
	});
	const parentConversationId = resolveChannelTargetId({
		channel,
		target: params.threadParentId
	}) ?? (threadId && baseConversationId && baseConversationId !== threadId ? baseConversationId : void 0);
	const conversationId = threadId || baseConversationId;
	if (!conversationId) return null;
	const normalizedParentConversationId = shouldDefaultParentConversationToSelf(loadedPlugin) && !threadId && !parentConversationId ? conversationId : parentConversationId;
	return {
		channel,
		accountId,
		conversationId,
		...normalizedParentConversationId ? { parentConversationId: normalizedParentConversationId } : {},
		...threadId ? { threadId } : {}
	};
}
//#endregion
export { resolveConversationBindingContext as t };
