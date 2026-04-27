import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { A as createDiscordClient, C as DiscordSendError, D as hasAnyGuildPermissionDiscord, E as hasAllGuildPermissionsDiscord, P as resolveDiscordRest, S as DISCORD_MAX_STICKER_BYTES, T as fetchMemberGuildPermissionsDiscord, a as buildReactionIdentifier, b as DISCORD_MAX_EMOJI_BYTES, c as normalizeEmojiName, l as normalizeReactionEmoji, o as formatReactionEmoji, w as fetchChannelPermissionsDiscord, x as DISCORD_MAX_EVENT_COVER_BYTES } from "./send.shared-G5HPu1EM.js";
import { a as sendWebhookMessageDiscord, i as sendVoiceMessageDiscord, n as sendPollDiscord, r as sendStickerDiscord, t as sendMessageDiscord } from "./send.outbound-BTnNj5k_.js";
import { normalizeOptionalLowercaseString } from "openclaw/plugin-sdk/text-runtime";
import { ChannelType, Routes } from "discord-api-types/v10";
import { requireRuntimeConfig } from "openclaw/plugin-sdk/config-runtime";
import { loadWebMediaRaw } from "openclaw/plugin-sdk/web-media";
//#region extensions/discord/src/send.channels.ts
async function createChannelDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const body = { name: payload.name };
	if (payload.type !== void 0) body.type = payload.type;
	if (payload.parentId) body.parent_id = payload.parentId;
	if (payload.topic) body.topic = payload.topic;
	if (payload.position !== void 0) body.position = payload.position;
	if (payload.nsfw !== void 0) body.nsfw = payload.nsfw;
	return await rest.post(Routes.guildChannels(payload.guildId), { body });
}
async function editChannelDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const body = {};
	if (payload.name !== void 0) body.name = payload.name;
	if (payload.topic !== void 0) body.topic = payload.topic;
	if (payload.position !== void 0) body.position = payload.position;
	if (payload.parentId !== void 0) body.parent_id = payload.parentId;
	if (payload.nsfw !== void 0) body.nsfw = payload.nsfw;
	if (payload.rateLimitPerUser !== void 0) body.rate_limit_per_user = payload.rateLimitPerUser;
	if (payload.archived !== void 0) body.archived = payload.archived;
	if (payload.locked !== void 0) body.locked = payload.locked;
	if (payload.autoArchiveDuration !== void 0) body.auto_archive_duration = payload.autoArchiveDuration;
	if (payload.availableTags !== void 0) body.available_tags = payload.availableTags.map((t) => ({
		...t.id !== void 0 && { id: t.id },
		name: t.name,
		...t.moderated !== void 0 && { moderated: t.moderated },
		...t.emoji_id !== void 0 && { emoji_id: t.emoji_id },
		...t.emoji_name !== void 0 && { emoji_name: t.emoji_name }
	}));
	return await rest.patch(Routes.channel(payload.channelId), { body });
}
async function deleteChannelDiscord(channelId, opts) {
	await resolveDiscordRest(opts).delete(Routes.channel(channelId));
	return {
		ok: true,
		channelId
	};
}
async function moveChannelDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const body = [{
		id: payload.channelId,
		...payload.parentId !== void 0 && { parent_id: payload.parentId },
		...payload.position !== void 0 && { position: payload.position }
	}];
	await rest.patch(Routes.guildChannels(payload.guildId), { body });
	return { ok: true };
}
async function setChannelPermissionDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const body = { type: payload.targetType };
	if (payload.allow !== void 0) body.allow = payload.allow;
	if (payload.deny !== void 0) body.deny = payload.deny;
	await rest.put(`/channels/${payload.channelId}/permissions/${payload.targetId}`, { body });
	return { ok: true };
}
async function removeChannelPermissionDiscord(channelId, targetId, opts) {
	await resolveDiscordRest(opts).delete(`/channels/${channelId}/permissions/${targetId}`);
	return { ok: true };
}
//#endregion
//#region extensions/discord/src/send.emojis-stickers.ts
async function listGuildEmojisDiscord(guildId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildEmojis(guildId));
}
async function uploadEmojiDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const media = await loadWebMediaRaw(payload.mediaUrl, DISCORD_MAX_EMOJI_BYTES);
	const contentType = normalizeOptionalLowercaseString(media.contentType);
	if (!contentType || ![
		"image/png",
		"image/jpeg",
		"image/jpg",
		"image/gif"
	].includes(contentType)) throw new Error("Discord emoji uploads require a PNG, JPG, or GIF image");
	const image = `data:${contentType};base64,${media.buffer.toString("base64")}`;
	const roleIds = (payload.roleIds ?? []).map((id) => id.trim()).filter(Boolean);
	return await rest.post(Routes.guildEmojis(payload.guildId), { body: {
		name: normalizeEmojiName(payload.name, "Emoji name"),
		image,
		roles: roleIds.length ? roleIds : void 0
	} });
}
async function uploadStickerDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const media = await loadWebMediaRaw(payload.mediaUrl, DISCORD_MAX_STICKER_BYTES);
	const contentType = normalizeOptionalLowercaseString(media.contentType);
	if (!contentType || ![
		"image/png",
		"image/apng",
		"application/json"
	].includes(contentType)) throw new Error("Discord sticker uploads require a PNG, APNG, or Lottie JSON file");
	return await rest.post(Routes.guildStickers(payload.guildId), { body: {
		name: normalizeEmojiName(payload.name, "Sticker name"),
		description: normalizeEmojiName(payload.description, "Sticker description"),
		tags: normalizeEmojiName(payload.tags, "Sticker tags"),
		files: [{
			data: media.buffer,
			name: media.fileName ?? "sticker",
			contentType
		}]
	} });
}
//#endregion
//#region extensions/discord/src/send.guild.ts
async function fetchMemberInfoDiscord(guildId, userId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildMember(guildId, userId));
}
async function fetchRoleInfoDiscord(guildId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildRoles(guildId));
}
async function addRoleDiscord(payload, opts) {
	await resolveDiscordRest(opts).put(Routes.guildMemberRole(payload.guildId, payload.userId, payload.roleId));
	return { ok: true };
}
async function removeRoleDiscord(payload, opts) {
	await resolveDiscordRest(opts).delete(Routes.guildMemberRole(payload.guildId, payload.userId, payload.roleId));
	return { ok: true };
}
async function fetchChannelInfoDiscord(channelId, opts) {
	return await resolveDiscordRest(opts).get(Routes.channel(channelId));
}
async function listGuildChannelsDiscord(guildId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildChannels(guildId));
}
async function fetchVoiceStatusDiscord(guildId, userId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildVoiceState(guildId, userId));
}
async function listScheduledEventsDiscord(guildId, opts) {
	return await resolveDiscordRest(opts).get(Routes.guildScheduledEvents(guildId));
}
const ALLOWED_EVENT_COVER_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/gif"
]);
async function resolveEventCoverImage(imageUrl, opts) {
	const media = await loadWebMediaRaw(imageUrl, DISCORD_MAX_EVENT_COVER_BYTES, { localRoots: opts?.localRoots });
	const contentType = normalizeOptionalLowercaseString(media.contentType);
	if (!contentType || !ALLOWED_EVENT_COVER_TYPES.has(contentType)) throw new Error(`Discord event cover images must be PNG, JPG, or GIF (got ${contentType ?? "unknown"})`);
	return `data:${contentType};base64,${media.buffer.toString("base64")}`;
}
async function createScheduledEventDiscord(guildId, payload, opts) {
	return await resolveDiscordRest(opts).post(Routes.guildScheduledEvents(guildId), { body: payload });
}
async function timeoutMemberDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	let until = payload.until;
	if (!until && payload.durationMinutes) {
		const ms = payload.durationMinutes * 60 * 1e3;
		until = new Date(Date.now() + ms).toISOString();
	}
	return await rest.patch(Routes.guildMember(payload.guildId, payload.userId), {
		body: { communication_disabled_until: until ?? null },
		headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0
	});
}
async function kickMemberDiscord(payload, opts) {
	await resolveDiscordRest(opts).delete(Routes.guildMember(payload.guildId, payload.userId), { headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0 });
	return { ok: true };
}
async function banMemberDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	const deleteMessageDays = typeof payload.deleteMessageDays === "number" && Number.isFinite(payload.deleteMessageDays) ? Math.min(Math.max(Math.floor(payload.deleteMessageDays), 0), 7) : void 0;
	await rest.put(Routes.guildBan(payload.guildId, payload.userId), {
		body: deleteMessageDays !== void 0 ? { delete_message_days: deleteMessageDays } : void 0,
		headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0
	});
	return { ok: true };
}
//#endregion
//#region extensions/discord/src/send.messages.ts
async function readMessagesDiscord(channelId, query = {}, opts) {
	const rest = resolveDiscordRest(opts);
	const limit = typeof query.limit === "number" && Number.isFinite(query.limit) ? Math.min(Math.max(Math.floor(query.limit), 1), 100) : void 0;
	const params = {};
	if (limit) params.limit = limit;
	if (query.before) params.before = query.before;
	if (query.after) params.after = query.after;
	if (query.around) params.around = query.around;
	return await rest.get(Routes.channelMessages(channelId), params);
}
async function fetchMessageDiscord(channelId, messageId, opts) {
	return await resolveDiscordRest(opts).get(Routes.channelMessage(channelId, messageId));
}
async function editMessageDiscord(channelId, messageId, payload, opts) {
	return await resolveDiscordRest(opts).patch(Routes.channelMessage(channelId, messageId), { body: { content: payload.content } });
}
async function deleteMessageDiscord(channelId, messageId, opts) {
	await resolveDiscordRest(opts).delete(Routes.channelMessage(channelId, messageId));
	return { ok: true };
}
async function pinMessageDiscord(channelId, messageId, opts) {
	await resolveDiscordRest(opts).put(Routes.channelPin(channelId, messageId));
	return { ok: true };
}
async function unpinMessageDiscord(channelId, messageId, opts) {
	await resolveDiscordRest(opts).delete(Routes.channelPin(channelId, messageId));
	return { ok: true };
}
async function listPinsDiscord(channelId, opts) {
	return await resolveDiscordRest(opts).get(Routes.channelPins(channelId));
}
async function createThreadDiscord(channelId, payload, opts) {
	const rest = resolveDiscordRest(opts);
	const body = { name: payload.name };
	if (payload.autoArchiveMinutes) body.auto_archive_duration = payload.autoArchiveMinutes;
	if (!payload.messageId && payload.type !== void 0) body.type = payload.type;
	let channelType;
	if (!payload.messageId) try {
		channelType = (await rest.get(Routes.channel(channelId)))?.type;
	} catch {
		channelType = void 0;
	}
	const isForumLike = channelType === ChannelType.GuildForum || channelType === ChannelType.GuildMedia;
	if (isForumLike) {
		body.message = { content: payload.content?.trim() ? payload.content : payload.name };
		if (payload.appliedTags?.length) body.applied_tags = payload.appliedTags;
	}
	if (!payload.messageId && !isForumLike && body.type === void 0) body.type = ChannelType.PublicThread;
	const route = payload.messageId ? Routes.threads(channelId, payload.messageId) : Routes.threads(channelId);
	const thread = await rest.post(route, { body });
	if (!isForumLike && payload.content?.trim()) await rest.post(Routes.channelMessages(thread.id), { body: { content: payload.content } });
	return thread;
}
async function listThreadsDiscord(payload, opts) {
	const rest = resolveDiscordRest(opts);
	if (payload.includeArchived) {
		if (!payload.channelId) throw new Error("channelId required to list archived threads");
		const params = {};
		if (payload.before) params.before = payload.before;
		if (payload.limit) params.limit = payload.limit;
		return await rest.get(Routes.channelThreads(payload.channelId, "public"), params);
	}
	return await rest.get(Routes.guildActiveThreads(payload.guildId));
}
async function searchMessagesDiscord(query, opts) {
	const rest = resolveDiscordRest(opts);
	const params = new URLSearchParams();
	params.set("content", query.content);
	if (query.channelIds?.length) for (const channelId of query.channelIds) params.append("channel_id", channelId);
	if (query.authorIds?.length) for (const authorId of query.authorIds) params.append("author_id", authorId);
	if (query.limit) {
		const limit = Math.min(Math.max(Math.floor(query.limit), 1), 25);
		params.set("limit", String(limit));
	}
	return await rest.get(`/guilds/${query.guildId}/messages/search?${params.toString()}`);
}
//#endregion
//#region extensions/discord/src/send.typing.ts
async function sendTypingDiscord(channelId, opts) {
	await resolveDiscordRest(opts).post(Routes.channelTyping(channelId));
	return {
		ok: true,
		channelId
	};
}
//#endregion
//#region extensions/discord/src/send.reactions.ts
function createDiscordReactionRuntimeClient(opts) {
	return createDiscordClient(opts);
}
function resolveDiscordReactionClient(opts) {
	if (!opts.cfg) throw new Error("Discord reactions requires a resolved runtime config. Load and resolve config at the command or gateway boundary, then pass cfg through the runtime path.");
	const cfg = requireRuntimeConfig(opts.cfg, "Discord reactions");
	return createDiscordClient({
		...opts,
		cfg
	});
}
function isDiscordReactionRuntimeContext(opts) {
	return Boolean(opts.rest && opts.cfg && opts.accountId);
}
async function reactMessageDiscord(channelId, messageId, emoji, opts) {
	const { rest, request } = isDiscordReactionRuntimeContext(opts) ? createDiscordReactionRuntimeClient(opts) : resolveDiscordReactionClient(opts);
	const encoded = normalizeReactionEmoji(emoji);
	await request(() => rest.put(Routes.channelMessageOwnReaction(channelId, messageId, encoded)), "react");
	return { ok: true };
}
async function removeReactionDiscord(channelId, messageId, emoji, opts) {
	const { rest } = isDiscordReactionRuntimeContext(opts) ? createDiscordReactionRuntimeClient(opts) : resolveDiscordReactionClient(opts);
	const encoded = normalizeReactionEmoji(emoji);
	await rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, encoded));
	return { ok: true };
}
async function removeOwnReactionsDiscord(channelId, messageId, opts) {
	const { rest } = isDiscordReactionRuntimeContext(opts) ? createDiscordReactionRuntimeClient(opts) : resolveDiscordReactionClient(opts);
	const message = await rest.get(Routes.channelMessage(channelId, messageId));
	const identifiers = /* @__PURE__ */ new Set();
	for (const reaction of message.reactions ?? []) {
		const identifier = buildReactionIdentifier(reaction.emoji);
		if (identifier) identifiers.add(identifier);
	}
	if (identifiers.size === 0) return {
		ok: true,
		removed: []
	};
	const removed = [];
	await Promise.allSettled(Array.from(identifiers, (identifier) => {
		removed.push(identifier);
		return rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, normalizeReactionEmoji(identifier)));
	}));
	return {
		ok: true,
		removed
	};
}
async function fetchReactionsDiscord(channelId, messageId, opts) {
	const { rest } = isDiscordReactionRuntimeContext(opts) ? createDiscordReactionRuntimeClient(opts) : resolveDiscordReactionClient(opts);
	const reactions = (await rest.get(Routes.channelMessage(channelId, messageId))).reactions ?? [];
	if (reactions.length === 0) return [];
	const limit = typeof opts.limit === "number" && Number.isFinite(opts.limit) ? Math.min(Math.max(Math.floor(opts.limit), 1), 100) : 100;
	const summaries = [];
	for (const reaction of reactions) {
		const identifier = buildReactionIdentifier(reaction.emoji);
		if (!identifier) continue;
		const encoded = encodeURIComponent(identifier);
		const users = await rest.get(Routes.channelMessageReaction(channelId, messageId, encoded), { limit });
		summaries.push({
			emoji: {
				id: reaction.emoji.id ?? null,
				name: reaction.emoji.name ?? null,
				raw: formatReactionEmoji(reaction.emoji)
			},
			count: reaction.count,
			users: users.map((user) => ({
				id: user.id,
				username: user.username,
				tag: user.username && user.discriminator ? `${user.username}#${user.discriminator}` : user.username
			}))
		});
	}
	return summaries;
}
//#endregion
//#region extensions/discord/src/send.ts
var send_exports = /* @__PURE__ */ __exportAll({
	DiscordSendError: () => DiscordSendError,
	addRoleDiscord: () => addRoleDiscord,
	banMemberDiscord: () => banMemberDiscord,
	createChannelDiscord: () => createChannelDiscord,
	createScheduledEventDiscord: () => createScheduledEventDiscord,
	createThreadDiscord: () => createThreadDiscord,
	deleteChannelDiscord: () => deleteChannelDiscord,
	deleteMessageDiscord: () => deleteMessageDiscord,
	editChannelDiscord: () => editChannelDiscord,
	editMessageDiscord: () => editMessageDiscord,
	fetchChannelInfoDiscord: () => fetchChannelInfoDiscord,
	fetchChannelPermissionsDiscord: () => fetchChannelPermissionsDiscord,
	fetchMemberGuildPermissionsDiscord: () => fetchMemberGuildPermissionsDiscord,
	fetchMemberInfoDiscord: () => fetchMemberInfoDiscord,
	fetchMessageDiscord: () => fetchMessageDiscord,
	fetchReactionsDiscord: () => fetchReactionsDiscord,
	fetchRoleInfoDiscord: () => fetchRoleInfoDiscord,
	fetchVoiceStatusDiscord: () => fetchVoiceStatusDiscord,
	hasAllGuildPermissionsDiscord: () => hasAllGuildPermissionsDiscord,
	hasAnyGuildPermissionDiscord: () => hasAnyGuildPermissionDiscord,
	kickMemberDiscord: () => kickMemberDiscord,
	listGuildChannelsDiscord: () => listGuildChannelsDiscord,
	listGuildEmojisDiscord: () => listGuildEmojisDiscord,
	listPinsDiscord: () => listPinsDiscord,
	listScheduledEventsDiscord: () => listScheduledEventsDiscord,
	listThreadsDiscord: () => listThreadsDiscord,
	moveChannelDiscord: () => moveChannelDiscord,
	pinMessageDiscord: () => pinMessageDiscord,
	reactMessageDiscord: () => reactMessageDiscord,
	readMessagesDiscord: () => readMessagesDiscord,
	removeChannelPermissionDiscord: () => removeChannelPermissionDiscord,
	removeOwnReactionsDiscord: () => removeOwnReactionsDiscord,
	removeReactionDiscord: () => removeReactionDiscord,
	removeRoleDiscord: () => removeRoleDiscord,
	resolveEventCoverImage: () => resolveEventCoverImage,
	searchMessagesDiscord: () => searchMessagesDiscord,
	sendMessageDiscord: () => sendMessageDiscord,
	sendPollDiscord: () => sendPollDiscord,
	sendStickerDiscord: () => sendStickerDiscord,
	sendTypingDiscord: () => sendTypingDiscord,
	sendVoiceMessageDiscord: () => sendVoiceMessageDiscord,
	sendWebhookMessageDiscord: () => sendWebhookMessageDiscord,
	setChannelPermissionDiscord: () => setChannelPermissionDiscord,
	timeoutMemberDiscord: () => timeoutMemberDiscord,
	unpinMessageDiscord: () => unpinMessageDiscord,
	uploadEmojiDiscord: () => uploadEmojiDiscord,
	uploadStickerDiscord: () => uploadStickerDiscord
});
//#endregion
export { listGuildEmojisDiscord as A, fetchVoiceStatusDiscord as C, removeRoleDiscord as D, listScheduledEventsDiscord as E, editChannelDiscord as F, moveChannelDiscord as I, removeChannelPermissionDiscord as L, uploadStickerDiscord as M, createChannelDiscord as N, resolveEventCoverImage as O, deleteChannelDiscord as P, setChannelPermissionDiscord as R, fetchRoleInfoDiscord as S, listGuildChannelsDiscord as T, addRoleDiscord as _, removeReactionDiscord as a, fetchChannelInfoDiscord as b, deleteMessageDiscord as c, listPinsDiscord as d, listThreadsDiscord as f, unpinMessageDiscord as g, searchMessagesDiscord as h, removeOwnReactionsDiscord as i, uploadEmojiDiscord as j, timeoutMemberDiscord as k, editMessageDiscord as l, readMessagesDiscord as m, fetchReactionsDiscord as n, sendTypingDiscord as o, pinMessageDiscord as p, reactMessageDiscord as r, createThreadDiscord as s, send_exports as t, fetchMessageDiscord as u, banMemberDiscord as v, kickMemberDiscord as w, fetchMemberInfoDiscord as x, createScheduledEventDiscord as y };
