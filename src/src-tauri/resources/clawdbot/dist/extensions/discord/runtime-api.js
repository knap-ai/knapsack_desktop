import { i as stringEnum } from "../../typebox-DqutihVq.js";
import { g as formatThreadBindingDurationLabel, m as resolveThreadBindingsEnabled, v as resolveThreadBindingIntroText, y as resolveThreadBindingThreadName } from "../../thread-bindings-policy-ypJ47uk9.js";
import { a as listTokenSourcedAccounts, i as createUnionActionGate } from "../../channel-actions-DVMcrs0t.js";
import { r as listEnabledDiscordAccounts, t as createDiscordActionGate } from "../../accounts-7Ym6HIvs.js";
import { c as resolveDiscordCommandAuthorized, h as shouldEmitDiscordReactionNotification, i as normalizeDiscordSlug, l as resolveDiscordGuildEntry, m as resolveGroupDmAllow, n as isDiscordGroupAllowedByPolicy, o as resolveDiscordChannelConfig, p as resolveDiscordShouldRequireMention, r as normalizeDiscordAllowList, s as resolveDiscordChannelConfigWithFallback, t as allowListMatches } from "../../allow-list-qE0AJ4XV.js";
import { a as listDiscordDirectoryGroupsLive, o as listDiscordDirectoryPeersLive, t as resolveDiscordOutboundSessionRoute } from "../../runtime-api-B2wCPqWw.js";
import { A as hasAnyGuildPermissionDiscord, D as fetchChannelPermissionsDiscord, E as DiscordSendError, O as fetchMemberGuildPermissionsDiscord, k as hasAllGuildPermissionsDiscord, n as registerBuiltDiscordComponentMessage, r as sendDiscordComponentMessage, t as editDiscordComponentMessage } from "../../send.components-sVt5Smd7.js";
import { A as listScheduledEventsDiscord, B as removeChannelPermissionDiscord, C as createScheduledEventDiscord, D as fetchVoiceStatusDiscord, E as fetchRoleInfoDiscord, F as uploadStickerDiscord, I as createChannelDiscord, L as deleteChannelDiscord, M as timeoutMemberDiscord, N as listGuildEmojisDiscord, O as kickMemberDiscord, P as uploadEmojiDiscord, R as editChannelDiscord, S as banMemberDiscord, T as fetchMemberInfoDiscord, V as setChannelPermissionDiscord, _ as pinMessageDiscord, a as sendTypingDiscord, b as unpinMessageDiscord, c as sendStickerDiscord, d as createThreadDiscord, f as deleteMessageDiscord, g as listThreadsDiscord, h as listPinsDiscord, i as removeReactionDiscord, j as removeRoleDiscord, k as listGuildChannelsDiscord, l as sendVoiceMessageDiscord, m as fetchMessageDiscord, n as reactMessageDiscord, o as sendMessageDiscord, p as editMessageDiscord, r as removeOwnReactionsDiscord, s as sendPollDiscord, t as fetchReactionsDiscord, u as sendWebhookMessageDiscord, v as readMessagesDiscord, w as fetchChannelInfoDiscord, x as addRoleDiscord, y as searchMessagesDiscord, z as moveChannelDiscord } from "../../send-BP9-Jzzy.js";
import { n as collectDiscordAuditChannelIds, t as auditDiscordChannelPermissions } from "../../audit-RyARLatx.js";
import { t as resolveDiscordUserAllowlist } from "../../resolve-users-QVP1LD60.js";
import { D as resolveThreadBindingInactivityExpiresAt, E as resolveThreadBindingIdleTimeoutMs, L as resolveThreadBindingPersona, O as resolveThreadBindingMaxAgeExpiresAt, R as resolveThreadBindingPersonaFromRecord, g as isRecentlyUnboundThreadWebhookMessage, k as resolveThreadBindingMaxAgeMs } from "../../thread-bindings.discord-api-WOO9VoBT.js";
import { a as setThreadBindingIdleTimeoutBySessionKey, c as __testing, d as getThreadBindingManager, f as resolveDiscordThreadBindingIdleTimeoutMs, i as reconcileAcpThreadBindingsOnStartup, l as createNoopThreadBindingManager, n as listThreadBindingsBySessionKey, o as setThreadBindingMaxAgeBySessionKey, p as resolveDiscordThreadBindingMaxAgeMs, r as listThreadBindingsForAccount, s as unbindThreadBindingsBySessionKey, t as autoBindSpawnedDiscordSubagent, u as createThreadBindingManager } from "../../thread-bindings-DGck9pdd.js";
import { a as clearPresences, c as setPresence, i as unregisterGateway, n as getGateway, o as getPresence, r as registerGateway, s as presenceCacheSize, t as clearGateways } from "../../gateway-registry-CHn1fno4.js";
import { a as readDiscordParentIdParam, i as requiredGuildPermissionForModerationAction, n as isDiscordModerationAction, r as readDiscordModerationCommand, t as handleDiscordAction } from "../../action-runtime-api-DD-76vf1.js";
import { t as handleDiscordMessageAction } from "../../handle-action-ZUjyJIMN.js";
import { a as resolveDiscordPrivilegedIntentsFromFlags, i as probeDiscord, n as fetchDiscordApplicationSummary, r as parseApplicationIdFromToken, t as fetchDiscordApplicationId } from "../../probe-DgkjlFQq.js";
import { a as createDiscordGatewayPlugin, i as registerDiscordListener, o as resolveDiscordGatewayIntents, r as createDiscordNativeCommand, t as monitorDiscordProvider } from "../../provider-BjLY5Kwt.js";
import { a as isAbortError, c as normalizeDiscordListenerTimeoutMs, i as DISCORD_DEFAULT_LISTENER_TIMEOUT_MS, l as runDiscordTaskWithTimeout, n as DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS, o as mergeAbortSignals, r as DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS, s as normalizeDiscordInboundWorkerTimeoutMs, t as DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS } from "../../timeouts-Rxac5izA.js";
import { d as buildDiscordMediaPayload, o as resolveDiscordReplyTarget, u as sanitizeDiscordThreadName } from "../../threading-CBvj7nks.js";
import { t as resolveDiscordChannelAllowlist } from "../../resolve-channels-BjmdxRGt.js";
import { t as createDiscordMessageHandler } from "../../message-handler-BBH57I8c.js";
import { Type } from "@sinclair/typebox";
//#region extensions/discord/src/message-tool-schema.ts
const discordComponentEmojiSchema = Type.Object({
	name: Type.String(),
	id: Type.Optional(Type.String()),
	animated: Type.Optional(Type.Boolean())
});
const discordComponentOptionSchema = Type.Object({
	label: Type.String(),
	value: Type.String(),
	description: Type.Optional(Type.String()),
	emoji: Type.Optional(discordComponentEmojiSchema),
	default: Type.Optional(Type.Boolean())
});
const discordComponentButtonSchema = Type.Object({
	label: Type.String(),
	style: Type.Optional(stringEnum([
		"primary",
		"secondary",
		"success",
		"danger",
		"link"
	])),
	url: Type.Optional(Type.String()),
	emoji: Type.Optional(discordComponentEmojiSchema),
	disabled: Type.Optional(Type.Boolean()),
	allowedUsers: Type.Optional(Type.Array(Type.String({ description: "Discord user ids or names allowed to interact with this button." })))
});
const discordComponentSelectSchema = Type.Object({
	type: Type.Optional(stringEnum([
		"string",
		"user",
		"role",
		"mentionable",
		"channel"
	])),
	placeholder: Type.Optional(Type.String()),
	minValues: Type.Optional(Type.Number()),
	maxValues: Type.Optional(Type.Number()),
	options: Type.Optional(Type.Array(discordComponentOptionSchema))
});
const discordComponentBlockSchema = Type.Object({
	type: Type.String(),
	text: Type.Optional(Type.String()),
	texts: Type.Optional(Type.Array(Type.String())),
	accessory: Type.Optional(Type.Object({
		type: Type.String(),
		url: Type.Optional(Type.String()),
		button: Type.Optional(discordComponentButtonSchema)
	})),
	spacing: Type.Optional(stringEnum(["small", "large"])),
	divider: Type.Optional(Type.Boolean()),
	buttons: Type.Optional(Type.Array(discordComponentButtonSchema)),
	select: Type.Optional(discordComponentSelectSchema),
	items: Type.Optional(Type.Array(Type.Object({
		url: Type.String(),
		description: Type.Optional(Type.String()),
		spoiler: Type.Optional(Type.Boolean())
	}))),
	file: Type.Optional(Type.String()),
	spoiler: Type.Optional(Type.Boolean())
});
const discordComponentModalFieldSchema = Type.Object({
	type: Type.String(),
	name: Type.Optional(Type.String()),
	label: Type.String(),
	description: Type.Optional(Type.String()),
	placeholder: Type.Optional(Type.String()),
	required: Type.Optional(Type.Boolean()),
	options: Type.Optional(Type.Array(discordComponentOptionSchema)),
	minValues: Type.Optional(Type.Number()),
	maxValues: Type.Optional(Type.Number()),
	minLength: Type.Optional(Type.Number()),
	maxLength: Type.Optional(Type.Number()),
	style: Type.Optional(stringEnum(["short", "paragraph"]))
});
const discordComponentModalSchema = Type.Object({
	title: Type.String(),
	triggerLabel: Type.Optional(Type.String()),
	triggerStyle: Type.Optional(stringEnum([
		"primary",
		"secondary",
		"success",
		"danger",
		"link"
	])),
	fields: Type.Array(discordComponentModalFieldSchema)
});
function createDiscordMessageToolComponentsSchema() {
	return Type.Object({
		text: Type.Optional(Type.String()),
		reusable: Type.Optional(Type.Boolean({ description: "Allow components to be used multiple times until they expire." })),
		container: Type.Optional(Type.Object({
			accentColor: Type.Optional(Type.String()),
			spoiler: Type.Optional(Type.Boolean())
		})),
		blocks: Type.Optional(Type.Array(discordComponentBlockSchema)),
		modal: Type.Optional(discordComponentModalSchema)
	}, { description: "Discord components v2 payload. Set reusable=true to keep buttons, selects, and forms active until expiry." });
}
//#endregion
//#region extensions/discord/src/channel-actions.ts
function resolveDiscordActionDiscovery(cfg) {
	const accounts = listTokenSourcedAccounts(listEnabledDiscordAccounts(cfg));
	if (accounts.length === 0) return null;
	const unionGate = createUnionActionGate(accounts, (account) => createDiscordActionGate({
		cfg,
		accountId: account.accountId
	}));
	return { isEnabled: (key, defaultValue = true) => unionGate(key, defaultValue) };
}
function describeDiscordMessageTool({ cfg }) {
	const discovery = resolveDiscordActionDiscovery(cfg);
	if (!discovery) return {
		actions: [],
		capabilities: [],
		schema: null
	};
	const actions = new Set(["send"]);
	if (discovery.isEnabled("polls")) actions.add("poll");
	if (discovery.isEnabled("reactions")) {
		actions.add("react");
		actions.add("reactions");
		actions.add("emoji-list");
	}
	if (discovery.isEnabled("messages")) {
		actions.add("read");
		actions.add("edit");
		actions.add("delete");
	}
	if (discovery.isEnabled("pins")) {
		actions.add("pin");
		actions.add("unpin");
		actions.add("list-pins");
	}
	if (discovery.isEnabled("permissions")) actions.add("permissions");
	if (discovery.isEnabled("threads")) {
		actions.add("thread-create");
		actions.add("thread-list");
		actions.add("thread-reply");
	}
	if (discovery.isEnabled("search")) actions.add("search");
	if (discovery.isEnabled("stickers")) actions.add("sticker");
	if (discovery.isEnabled("memberInfo")) actions.add("member-info");
	if (discovery.isEnabled("roleInfo")) actions.add("role-info");
	if (discovery.isEnabled("emojiUploads")) actions.add("emoji-upload");
	if (discovery.isEnabled("stickerUploads")) actions.add("sticker-upload");
	if (discovery.isEnabled("roles", false)) {
		actions.add("role-add");
		actions.add("role-remove");
	}
	if (discovery.isEnabled("channelInfo")) {
		actions.add("channel-info");
		actions.add("channel-list");
	}
	if (discovery.isEnabled("channels")) {
		actions.add("channel-create");
		actions.add("channel-edit");
		actions.add("channel-delete");
		actions.add("channel-move");
		actions.add("category-create");
		actions.add("category-edit");
		actions.add("category-delete");
	}
	if (discovery.isEnabled("voiceStatus")) actions.add("voice-status");
	if (discovery.isEnabled("events")) {
		actions.add("event-list");
		actions.add("event-create");
	}
	if (discovery.isEnabled("moderation", false)) {
		actions.add("timeout");
		actions.add("kick");
		actions.add("ban");
	}
	if (discovery.isEnabled("presence", false)) actions.add("set-presence");
	return {
		actions: Array.from(actions),
		capabilities: ["interactive", "components"],
		schema: { properties: { components: Type.Optional(createDiscordMessageToolComponentsSchema()) } }
	};
}
const discordMessageActions = {
	describeMessageTool: describeDiscordMessageTool,
	extractToolSend: ({ args }) => {
		const action = typeof args.action === "string" ? args.action.trim() : "";
		if (action === "sendMessage") {
			const to = typeof args.to === "string" ? args.to : void 0;
			return to ? { to } : null;
		}
		if (action === "threadReply") {
			const channelId = typeof args.channelId === "string" ? args.channelId.trim() : "";
			return channelId ? { to: `channel:${channelId}` } : null;
		}
		return null;
	},
	handleAction: async ({ action, params, cfg, accountId, requesterSenderId, toolContext, mediaLocalRoots }) => {
		return await handleDiscordMessageAction({
			action,
			params,
			cfg,
			accountId,
			requesterSenderId,
			toolContext,
			mediaLocalRoots
		});
	}
};
//#endregion
export { DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS, DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS, DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS, DISCORD_DEFAULT_LISTENER_TIMEOUT_MS, DiscordSendError, __testing, addRoleDiscord, allowListMatches, auditDiscordChannelPermissions, autoBindSpawnedDiscordSubagent, banMemberDiscord, buildDiscordMediaPayload, clearGateways, clearPresences, collectDiscordAuditChannelIds, createChannelDiscord, createDiscordGatewayPlugin, createDiscordMessageHandler, createDiscordNativeCommand, createNoopThreadBindingManager, createScheduledEventDiscord, createThreadBindingManager, createThreadDiscord, deleteChannelDiscord, deleteMessageDiscord, discordMessageActions, editChannelDiscord, editDiscordComponentMessage, editMessageDiscord, fetchChannelInfoDiscord, fetchChannelPermissionsDiscord, fetchDiscordApplicationId, fetchDiscordApplicationSummary, fetchMemberGuildPermissionsDiscord, fetchMemberInfoDiscord, fetchMessageDiscord, fetchReactionsDiscord, fetchRoleInfoDiscord, fetchVoiceStatusDiscord, formatThreadBindingDurationLabel, getGateway, getPresence, getThreadBindingManager, handleDiscordAction, hasAllGuildPermissionsDiscord, hasAnyGuildPermissionDiscord, isAbortError, isDiscordGroupAllowedByPolicy, isDiscordModerationAction, isRecentlyUnboundThreadWebhookMessage, kickMemberDiscord, listDiscordDirectoryGroupsLive, listDiscordDirectoryPeersLive, listGuildChannelsDiscord, listGuildEmojisDiscord, listPinsDiscord, listScheduledEventsDiscord, listThreadBindingsBySessionKey, listThreadBindingsForAccount, listThreadsDiscord, mergeAbortSignals, monitorDiscordProvider, moveChannelDiscord, normalizeDiscordAllowList, normalizeDiscordInboundWorkerTimeoutMs, normalizeDiscordListenerTimeoutMs, normalizeDiscordSlug, parseApplicationIdFromToken, pinMessageDiscord, presenceCacheSize, probeDiscord, reactMessageDiscord, readDiscordModerationCommand, readDiscordParentIdParam, readMessagesDiscord, reconcileAcpThreadBindingsOnStartup, registerBuiltDiscordComponentMessage, registerDiscordListener, registerGateway, removeChannelPermissionDiscord, removeOwnReactionsDiscord, removeReactionDiscord, removeRoleDiscord, requiredGuildPermissionForModerationAction, resolveDiscordChannelAllowlist, resolveDiscordChannelConfig, resolveDiscordChannelConfigWithFallback, resolveDiscordCommandAuthorized, resolveDiscordGatewayIntents, resolveDiscordGuildEntry, resolveDiscordOutboundSessionRoute, resolveDiscordPrivilegedIntentsFromFlags, resolveDiscordReplyTarget, resolveDiscordShouldRequireMention, resolveDiscordThreadBindingIdleTimeoutMs, resolveDiscordThreadBindingMaxAgeMs, resolveDiscordUserAllowlist, resolveGroupDmAllow, resolveThreadBindingIdleTimeoutMs, resolveThreadBindingInactivityExpiresAt, resolveThreadBindingIntroText, resolveThreadBindingMaxAgeExpiresAt, resolveThreadBindingMaxAgeMs, resolveThreadBindingPersona, resolveThreadBindingPersonaFromRecord, resolveThreadBindingThreadName, resolveThreadBindingsEnabled, runDiscordTaskWithTimeout, sanitizeDiscordThreadName, searchMessagesDiscord, sendDiscordComponentMessage, sendMessageDiscord, sendPollDiscord, sendStickerDiscord, sendTypingDiscord, sendVoiceMessageDiscord, sendWebhookMessageDiscord, setChannelPermissionDiscord, setPresence, setThreadBindingIdleTimeoutBySessionKey, setThreadBindingMaxAgeBySessionKey, shouldEmitDiscordReactionNotification, timeoutMemberDiscord, unbindThreadBindingsBySessionKey, unpinMessageDiscord, unregisterGateway, uploadEmojiDiscord, uploadStickerDiscord };
