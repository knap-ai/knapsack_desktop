import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import "./plugins-D4ODSIPT.js";
import "./delivery-context.shared-EClQPjt-.js";
//#region src/utils/delivery-context.ts
function formatConversationTarget(params) {
	const channel = typeof params.channel === "string" ? normalizeMessageChannel(params.channel) ?? params.channel.trim() : void 0;
	const conversationId = typeof params.conversationId === "number" && Number.isFinite(params.conversationId) ? String(Math.trunc(params.conversationId)) : typeof params.conversationId === "string" ? normalizeOptionalString(params.conversationId) : void 0;
	if (!channel || !conversationId) return;
	const parentConversationId = typeof params.parentConversationId === "number" && Number.isFinite(params.parentConversationId) ? String(Math.trunc(params.parentConversationId)) : typeof params.parentConversationId === "string" ? normalizeOptionalString(params.parentConversationId) : void 0;
	const pluginTarget = normalizeChannelId(channel) ? getChannelPlugin(normalizeChannelId(channel))?.messaging?.resolveDeliveryTarget?.({
		conversationId,
		parentConversationId
	}) : null;
	if (pluginTarget?.to?.trim()) return pluginTarget.to.trim();
	return `channel:${conversationId}`;
}
function resolveConversationDeliveryTarget(params) {
	const channel = typeof params.channel === "string" ? normalizeMessageChannel(params.channel) ?? params.channel.trim() : void 0;
	const conversationId = typeof params.conversationId === "number" && Number.isFinite(params.conversationId) ? String(Math.trunc(params.conversationId)) : typeof params.conversationId === "string" ? normalizeOptionalString(params.conversationId) : void 0;
	const parentConversationId = typeof params.parentConversationId === "number" && Number.isFinite(params.parentConversationId) ? String(Math.trunc(params.parentConversationId)) : typeof params.parentConversationId === "string" ? normalizeOptionalString(params.parentConversationId) : void 0;
	if (channel && conversationId && parentConversationId && parentConversationId !== conversationId) {
		if (channel === "matrix") return {
			to: `room:${parentConversationId}`,
			threadId: conversationId
		};
		if (channel === "slack" || channel === "mattermost" || channel === "telegram") return {
			to: `channel:${parentConversationId}`,
			threadId: conversationId
		};
	}
	const pluginTarget = channel && conversationId ? getChannelPlugin(normalizeChannelId(channel) ?? channel)?.messaging?.resolveDeliveryTarget?.({
		conversationId,
		parentConversationId
	}) : null;
	if (pluginTarget) return {
		...pluginTarget.to?.trim() ? { to: pluginTarget.to.trim() } : {},
		...pluginTarget.threadId?.trim() ? { threadId: pluginTarget.threadId.trim() } : {}
	};
	return { to: formatConversationTarget(params) };
}
//#endregion
export { resolveConversationDeliveryTarget as n, formatConversationTarget as t };
