import { x as isAcpSessionKey } from "./session-key-D7XpmyVq.js";
import { t as getActivePluginChannelRegistry } from "./runtime-DZz1f0_h.js";
import { a as normalizeAnyChannelId, o as normalizeChannelId } from "./registry-DTO_OK4F.js";
import { t as normalizeConversationText } from "./conversation-id-BY-PeLYS.js";
import { r as getSessionBindingService } from "./session-binding-service-CAxmjUEJ.js";
import { r as resolveConversationIdFromTargets } from "./content-blocks-CWb2xgCb.js";
import { n as parseExplicitTargetForChannel } from "./target-parsing-CYsOfnR5.js";
import { n as listAcpBindings } from "./bindings-DwYMv--S.js";
import { o as buildConfiguredAcpSessionKey, r as resolveConfiguredBindingRecord, s as normalizeBindingConfig } from "./binding-registry-D0ByHSyN.js";
//#region src/auto-reply/reply/acp-reset-target.ts
const acpResetTargetDeps = {
	getSessionBindingService,
	listAcpBindings,
	resolveConfiguredBindingRecord
};
function normalizeText$1(value) {
	return value?.trim() ?? "";
}
function resolveRawConfiguredAcpSessionKey(params) {
	for (const binding of acpResetTargetDeps.listAcpBindings(params.cfg)) {
		const bindingChannel = normalizeText$1(binding.match.channel).toLowerCase();
		if (!bindingChannel || bindingChannel !== params.channel) continue;
		const bindingAccountId = normalizeText$1(binding.match.accountId);
		if (bindingAccountId && bindingAccountId !== "*" && bindingAccountId !== params.accountId) continue;
		const peerId = normalizeText$1(binding.match.peer?.id);
		const matchedConversationId = peerId === params.conversationId ? params.conversationId : peerId && peerId === params.parentConversationId ? params.parentConversationId : void 0;
		if (!matchedConversationId) continue;
		const acp = normalizeBindingConfig(binding.acp);
		return buildConfiguredAcpSessionKey({
			channel: params.channel,
			accountId: bindingAccountId && bindingAccountId !== "*" ? bindingAccountId : params.accountId,
			conversationId: matchedConversationId,
			...params.parentConversationId ? { parentConversationId: params.parentConversationId } : {},
			agentId: binding.agentId,
			mode: acp.mode === "oneshot" ? "oneshot" : "persistent",
			...acp.cwd ? { cwd: acp.cwd } : {},
			...acp.backend ? { backend: acp.backend } : {},
			...acp.label ? { label: acp.label } : {}
		});
	}
}
function resolveEffectiveResetTargetSessionKey(params) {
	const activeSessionKey = normalizeText$1(params.activeSessionKey);
	const activeAcpSessionKey = activeSessionKey && isAcpSessionKey(activeSessionKey) ? activeSessionKey : void 0;
	const activeIsNonAcp = Boolean(activeSessionKey) && !activeAcpSessionKey;
	const channel = normalizeText$1(params.channel).toLowerCase();
	const conversationId = normalizeText$1(params.conversationId);
	if (!channel || !conversationId) return activeAcpSessionKey;
	const accountId = normalizeText$1(params.accountId) || "default";
	const parentConversationId = normalizeText$1(params.parentConversationId) || void 0;
	const allowNonAcpBindingSessionKey = Boolean(params.allowNonAcpBindingSessionKey);
	const serviceBinding = acpResetTargetDeps.getSessionBindingService().resolveByConversation({
		channel,
		accountId,
		conversationId,
		parentConversationId
	});
	const serviceSessionKey = serviceBinding?.targetKind === "session" ? serviceBinding.targetSessionKey.trim() : "";
	if (serviceSessionKey) {
		if (allowNonAcpBindingSessionKey) return serviceSessionKey;
		return isAcpSessionKey(serviceSessionKey) ? serviceSessionKey : void 0;
	}
	if (activeIsNonAcp && params.skipConfiguredFallbackWhenActiveSessionNonAcp) return;
	const configuredBinding = acpResetTargetDeps.resolveConfiguredBindingRecord({
		cfg: params.cfg,
		channel,
		accountId,
		conversationId,
		parentConversationId
	});
	const configuredSessionKey = configuredBinding?.record.targetKind === "session" ? configuredBinding.record.targetSessionKey.trim() : "";
	if (configuredSessionKey) {
		if (allowNonAcpBindingSessionKey) return configuredSessionKey;
		return isAcpSessionKey(configuredSessionKey) ? configuredSessionKey : void 0;
	}
	const rawConfiguredSessionKey = resolveRawConfiguredAcpSessionKey({
		cfg: params.cfg,
		channel,
		accountId,
		conversationId,
		...parentConversationId ? { parentConversationId } : {}
	});
	if (rawConfiguredSessionKey) return rawConfiguredSessionKey;
	if (params.fallbackToActiveAcpWhenUnbound === false) return;
	return activeAcpSessionKey;
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
function normalizeText(value) {
	return normalizeConversationText(value) || void 0;
}
function getLoadedChannelPlugin(rawChannel) {
	const normalized = normalizeAnyChannelId(rawChannel) ?? normalizeText(rawChannel);
	if (!normalized) return;
	return getActivePluginChannelRegistry()?.channels.find((entry) => entry.plugin.id === normalized)?.plugin;
}
function resolveChannelTargetId(params) {
	const target = normalizeText(params.target);
	if (!target) return;
	const lower = target.toLowerCase();
	const channelPrefix = `${params.channel}:`;
	if (lower.startsWith(channelPrefix)) return resolveChannelTargetId({
		channel: params.channel,
		target: target.slice(channelPrefix.length)
	});
	if (CANONICAL_TARGET_PREFIXES.some((prefix) => lower.startsWith(prefix))) return target;
	const parsedTarget = normalizeText(parseExplicitTargetForChannel(params.channel, target)?.to);
	if (parsedTarget) return resolveConversationIdFromTargets({ targets: [parsedTarget] }) ?? parsedTarget;
	return resolveConversationIdFromTargets({ targets: [target] }) ?? target;
}
function buildThreadingContext(params) {
	const to = normalizeText(params.originatingTo) ?? normalizeText(params.fallbackTo);
	return {
		...to ? { To: to } : {},
		...params.from ? { From: params.from } : {},
		...params.chatType ? { ChatType: params.chatType } : {},
		...params.threadId ? { MessageThreadId: params.threadId } : {},
		...params.nativeChannelId ? { NativeChannelId: params.nativeChannelId } : {}
	};
}
function resolveConversationBindingContext(params) {
	const channel = normalizeAnyChannelId(params.channel) ?? normalizeChannelId(params.channel) ?? normalizeText(params.channel)?.toLowerCase();
	if (!channel) return null;
	const accountId = normalizeText(params.accountId) || "default";
	const threadId = normalizeText(params.threadId != null ? String(params.threadId) : void 0);
	const loadedPlugin = getLoadedChannelPlugin(channel);
	const resolvedByProvider = loadedPlugin?.bindings?.resolveCommandConversation?.({
		accountId,
		threadId,
		threadParentId: normalizeText(params.threadParentId),
		senderId: normalizeText(params.senderId),
		sessionKey: normalizeText(params.sessionKey),
		parentSessionKey: normalizeText(params.parentSessionKey),
		originatingTo: params.originatingTo ?? void 0,
		commandTo: params.commandTo ?? void 0,
		fallbackTo: params.fallbackTo ?? void 0
	});
	if (resolvedByProvider?.conversationId) {
		const resolvedParentConversationId = channel === "telegram" && !threadId && !resolvedByProvider.parentConversationId ? resolvedByProvider.conversationId : resolvedByProvider.parentConversationId;
		return {
			channel,
			accountId,
			conversationId: resolvedByProvider.conversationId,
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
			from: normalizeText(params.from),
			chatType: normalizeText(params.chatType),
			nativeChannelId: normalizeText(params.nativeChannelId)
		})
	});
	if (focusedBinding?.conversationId) return {
		channel,
		accountId,
		conversationId: focusedBinding.conversationId,
		...focusedBinding.parentConversationId ? { parentConversationId: focusedBinding.parentConversationId } : {},
		...threadId ? { threadId } : {}
	};
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
	const normalizedParentConversationId = channel === "telegram" && !threadId && !parentConversationId ? conversationId : parentConversationId;
	return {
		channel,
		accountId,
		conversationId,
		...normalizedParentConversationId ? { parentConversationId: normalizedParentConversationId } : {},
		...threadId ? { threadId } : {}
	};
}
//#endregion
//#region src/auto-reply/reply/conversation-binding-input.ts
function resolveBindingChannel(ctx, commandChannel) {
	return normalizeConversationText(ctx.OriginatingChannel ?? commandChannel ?? ctx.Surface ?? ctx.Provider).toLowerCase();
}
function resolveBindingAccountId(ctx) {
	return normalizeConversationText(ctx.AccountId) || "default";
}
function resolveBindingThreadId(threadId) {
	return (threadId != null ? normalizeConversationText(String(threadId)) : void 0) || void 0;
}
function resolveConversationBindingContextFromMessage(params) {
	return resolveConversationBindingContext({
		cfg: params.cfg,
		channel: resolveBindingChannel(params.ctx),
		accountId: resolveBindingAccountId(params.ctx),
		chatType: params.ctx.ChatType,
		threadId: resolveBindingThreadId(params.ctx.MessageThreadId),
		threadParentId: params.ctx.ThreadParentId,
		senderId: params.senderId ?? params.ctx.SenderId,
		sessionKey: params.sessionKey ?? params.ctx.SessionKey,
		parentSessionKey: params.parentSessionKey ?? params.ctx.ParentSessionKey,
		originatingTo: params.ctx.OriginatingTo,
		commandTo: params.commandTo,
		fallbackTo: params.ctx.To,
		from: params.ctx.From,
		nativeChannelId: params.ctx.NativeChannelId
	});
}
function resolveConversationBindingContextFromAcpCommand(params) {
	return resolveConversationBindingContextFromMessage({
		cfg: params.cfg,
		ctx: params.ctx,
		senderId: params.command.senderId,
		sessionKey: params.sessionKey,
		parentSessionKey: params.ctx.ParentSessionKey,
		commandTo: params.command.to
	});
}
function resolveConversationBindingChannelFromMessage(ctx, commandChannel) {
	return resolveBindingChannel(ctx, commandChannel);
}
function resolveConversationBindingAccountIdFromMessage(ctx) {
	return resolveBindingAccountId(ctx);
}
function resolveConversationBindingThreadIdFromMessage(ctx) {
	return resolveBindingThreadId(ctx.MessageThreadId);
}
//#endregion
export { resolveConversationBindingThreadIdFromMessage as a, resolveConversationBindingContextFromMessage as i, resolveConversationBindingChannelFromMessage as n, resolveEffectiveResetTargetSessionKey as o, resolveConversationBindingContextFromAcpCommand as r, resolveConversationBindingAccountIdFromMessage as t };
