import { a as resolveDefaultDiscordAccountId, t as createDiscordActionGate } from "./accounts-zcI4mtzH.js";
import { n as resolveDiscordChannelId } from "./target-parsing-BSCe_ffC.js";
import { c as parseAvailableTags, d as readReactionParams, f as readStringArrayParam, h as withNormalizedTimestamp, l as readBooleanParam, m as resolvePollMaxSelections, o as assertMediaNotDataUrl, p as readStringParam, r as sendDiscordComponentMessage, s as jsonResult, u as readNumberParam } from "./send.components-74kaqy38.js";
import { n as getGateway, o as getPresence } from "./gateway-registry-BKG4KIVC.js";
import { C as fetchChannelPermissionsDiscord, E as hasAnyGuildPermissionDiscord, k as createDiscordRuntimeAccountContext } from "./send.shared-DIBQaUs5.js";
import { A as fetchVoiceStatusDiscord, B as createChannelDiscord, C as unpinMessageDiscord, D as fetchChannelInfoDiscord, E as createScheduledEventDiscord, F as resolveEventCoverImage, G as setChannelPermissionDiscord, H as editChannelDiscord, I as timeoutMemberDiscord, L as listGuildEmojisDiscord, M as listGuildChannelsDiscord, N as listScheduledEventsDiscord, O as fetchMemberInfoDiscord, P as removeRoleDiscord, R as uploadEmojiDiscord, S as searchMessagesDiscord, T as banMemberDiscord, U as moveChannelDiscord, V as deleteChannelDiscord, W as removeChannelPermissionDiscord, _ as fetchMessageDiscord, a as removeReactionDiscord, b as pinMessageDiscord, c as sendPollDiscord, g as editMessageDiscord, h as deleteMessageDiscord, i as removeOwnReactionsDiscord, j as kickMemberDiscord, k as fetchRoleInfoDiscord, l as sendStickerDiscord, m as createThreadDiscord, n as fetchReactionsDiscord, r as reactMessageDiscord, s as sendMessageDiscord, u as sendVoiceMessageDiscord, v as listPinsDiscord, w as addRoleDiscord, x as readMessagesDiscord, y as listThreadsDiscord, z as uploadStickerDiscord } from "./send-DrbFKdd7.js";
import { c as readDiscordComponentSpec } from "./components-D-Smrfec.js";
import "./targets-CkPEAzVf.js";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { PermissionFlagsBits } from "discord-api-types/v10";
//#region extensions/discord/src/actions/runtime.shared.ts
function readDiscordParentIdParam(params) {
	if (params.clearParent === true) return null;
	if (params.parentId === null) return null;
	return readStringParam(params, "parentId");
}
//#endregion
//#region extensions/discord/src/actions/runtime.guild.ts
const discordGuildActionRuntime = {
	addRoleDiscord,
	createChannelDiscord,
	createScheduledEventDiscord,
	resolveEventCoverImage,
	deleteChannelDiscord,
	editChannelDiscord,
	fetchChannelInfoDiscord,
	fetchMemberInfoDiscord,
	fetchRoleInfoDiscord,
	fetchVoiceStatusDiscord,
	listGuildChannelsDiscord,
	listGuildEmojisDiscord,
	listScheduledEventsDiscord,
	moveChannelDiscord,
	removeChannelPermissionDiscord,
	removeRoleDiscord,
	setChannelPermissionDiscord,
	uploadEmojiDiscord,
	uploadStickerDiscord
};
async function runRoleMutation(params) {
	const guildId = readStringParam(params.values, "guildId", { required: true });
	const userId = readStringParam(params.values, "userId", { required: true });
	const roleId = readStringParam(params.values, "roleId", { required: true });
	if (params.accountId) {
		await params.mutate({
			guildId,
			userId,
			roleId
		}, { accountId: params.accountId });
		return;
	}
	await params.mutate({
		guildId,
		userId,
		roleId
	});
}
function readChannelPermissionTarget(params) {
	return {
		channelId: readStringParam(params, "channelId", { required: true }),
		targetId: readStringParam(params, "targetId", { required: true })
	};
}
async function handleDiscordGuildAction(action, params, isActionEnabled, cfg, options) {
	const accountId = readStringParam(params, "accountId");
	switch (action) {
		case "memberInfo": {
			if (!isActionEnabled("memberInfo")) throw new Error("Discord member info is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const userId = readStringParam(params, "userId", { required: true });
			const effectiveAccountId = accountId ?? (cfg ? resolveDefaultDiscordAccountId(cfg) : void 0);
			const member = effectiveAccountId ? await discordGuildActionRuntime.fetchMemberInfoDiscord(guildId, userId, { accountId: effectiveAccountId }) : await discordGuildActionRuntime.fetchMemberInfoDiscord(guildId, userId);
			const presence = getPresence(effectiveAccountId, userId);
			const activities = presence?.activities ?? void 0;
			const status = presence?.status ?? void 0;
			return jsonResult({
				ok: true,
				member,
				...presence ? {
					status,
					activities
				} : {}
			});
		}
		case "roleInfo": {
			if (!isActionEnabled("roleInfo")) throw new Error("Discord role info is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				roles: accountId ? await discordGuildActionRuntime.fetchRoleInfoDiscord(guildId, { accountId }) : await discordGuildActionRuntime.fetchRoleInfoDiscord(guildId)
			});
		}
		case "emojiList": {
			if (!isActionEnabled("reactions")) throw new Error("Discord reactions are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				emojis: accountId ? await discordGuildActionRuntime.listGuildEmojisDiscord(guildId, { accountId }) : await discordGuildActionRuntime.listGuildEmojisDiscord(guildId)
			});
		}
		case "emojiUpload": {
			if (!isActionEnabled("emojiUploads")) throw new Error("Discord emoji uploads are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const mediaUrl = readStringParam(params, "mediaUrl", { required: true });
			const roleIds = readStringArrayParam(params, "roleIds");
			return jsonResult({
				ok: true,
				emoji: accountId ? await discordGuildActionRuntime.uploadEmojiDiscord({
					guildId,
					name,
					mediaUrl,
					roleIds: roleIds?.length ? roleIds : void 0
				}, { accountId }) : await discordGuildActionRuntime.uploadEmojiDiscord({
					guildId,
					name,
					mediaUrl,
					roleIds: roleIds?.length ? roleIds : void 0
				})
			});
		}
		case "stickerUpload": {
			if (!isActionEnabled("stickerUploads")) throw new Error("Discord sticker uploads are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const description = readStringParam(params, "description", { required: true });
			const tags = readStringParam(params, "tags", { required: true });
			const mediaUrl = readStringParam(params, "mediaUrl", { required: true });
			return jsonResult({
				ok: true,
				sticker: accountId ? await discordGuildActionRuntime.uploadStickerDiscord({
					guildId,
					name,
					description,
					tags,
					mediaUrl
				}, { accountId }) : await discordGuildActionRuntime.uploadStickerDiscord({
					guildId,
					name,
					description,
					tags,
					mediaUrl
				})
			});
		}
		case "roleAdd":
			if (!isActionEnabled("roles", false)) throw new Error("Discord role changes are disabled.");
			await runRoleMutation({
				accountId,
				values: params,
				mutate: discordGuildActionRuntime.addRoleDiscord
			});
			return jsonResult({ ok: true });
		case "roleRemove":
			if (!isActionEnabled("roles", false)) throw new Error("Discord role changes are disabled.");
			await runRoleMutation({
				accountId,
				values: params,
				mutate: discordGuildActionRuntime.removeRoleDiscord
			});
			return jsonResult({ ok: true });
		case "channelInfo": {
			if (!isActionEnabled("channelInfo")) throw new Error("Discord channel info is disabled.");
			const channelId = readStringParam(params, "channelId", { required: true });
			return jsonResult({
				ok: true,
				channel: accountId ? await discordGuildActionRuntime.fetchChannelInfoDiscord(channelId, { accountId }) : await discordGuildActionRuntime.fetchChannelInfoDiscord(channelId)
			});
		}
		case "channelList": {
			if (!isActionEnabled("channelInfo")) throw new Error("Discord channel info is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				channels: accountId ? await discordGuildActionRuntime.listGuildChannelsDiscord(guildId, { accountId }) : await discordGuildActionRuntime.listGuildChannelsDiscord(guildId)
			});
		}
		case "voiceStatus": {
			if (!isActionEnabled("voiceStatus")) throw new Error("Discord voice status is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const userId = readStringParam(params, "userId", { required: true });
			return jsonResult({
				ok: true,
				voice: accountId ? await discordGuildActionRuntime.fetchVoiceStatusDiscord(guildId, userId, { accountId }) : await discordGuildActionRuntime.fetchVoiceStatusDiscord(guildId, userId)
			});
		}
		case "eventList": {
			if (!isActionEnabled("events")) throw new Error("Discord events are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				events: accountId ? await discordGuildActionRuntime.listScheduledEventsDiscord(guildId, { accountId }) : await discordGuildActionRuntime.listScheduledEventsDiscord(guildId)
			});
		}
		case "eventCreate": {
			if (!isActionEnabled("events")) throw new Error("Discord events are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const startTime = readStringParam(params, "startTime", { required: true });
			const endTime = readStringParam(params, "endTime");
			const description = readStringParam(params, "description");
			const channelId = readStringParam(params, "channelId");
			const location = readStringParam(params, "location");
			const imageUrl = readStringParam(params, "image", { trim: false });
			const entityTypeRaw = readStringParam(params, "entityType");
			const entityType = entityTypeRaw === "stage" ? 1 : entityTypeRaw === "external" ? 3 : 2;
			const image = imageUrl ? await discordGuildActionRuntime.resolveEventCoverImage(imageUrl, { localRoots: options?.mediaLocalRoots }) : void 0;
			const payload = {
				name,
				description,
				scheduled_start_time: startTime,
				scheduled_end_time: endTime,
				entity_type: entityType,
				channel_id: channelId,
				entity_metadata: entityType === 3 && location ? { location } : void 0,
				image,
				privacy_level: 2
			};
			return jsonResult({
				ok: true,
				event: accountId ? await discordGuildActionRuntime.createScheduledEventDiscord(guildId, payload, { accountId }) : await discordGuildActionRuntime.createScheduledEventDiscord(guildId, payload)
			});
		}
		case "channelCreate": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const type = readNumberParam(params, "type", { integer: true });
			const parentId = readDiscordParentIdParam(params);
			const topic = readStringParam(params, "topic");
			const position = readNumberParam(params, "position", { integer: true });
			const nsfw = params.nsfw;
			return jsonResult({
				ok: true,
				channel: accountId ? await discordGuildActionRuntime.createChannelDiscord({
					guildId,
					name,
					type: type ?? void 0,
					parentId: parentId ?? void 0,
					topic: topic ?? void 0,
					position: position ?? void 0,
					nsfw
				}, { accountId }) : await discordGuildActionRuntime.createChannelDiscord({
					guildId,
					name,
					type: type ?? void 0,
					parentId: parentId ?? void 0,
					topic: topic ?? void 0,
					position: position ?? void 0,
					nsfw
				})
			});
		}
		case "channelEdit": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const channelId = readStringParam(params, "channelId", { required: true });
			const name = readStringParam(params, "name");
			const topic = readStringParam(params, "topic");
			const position = readNumberParam(params, "position", { integer: true });
			const parentId = readDiscordParentIdParam(params);
			const nsfw = params.nsfw;
			const rateLimitPerUser = readNumberParam(params, "rateLimitPerUser", { integer: true });
			const archived = typeof params.archived === "boolean" ? params.archived : void 0;
			const locked = typeof params.locked === "boolean" ? params.locked : void 0;
			const autoArchiveDuration = readNumberParam(params, "autoArchiveDuration", { integer: true });
			const availableTags = parseAvailableTags(params.availableTags);
			const editPayload = {
				channelId,
				name: name ?? void 0,
				topic: topic ?? void 0,
				position: position ?? void 0,
				parentId,
				nsfw,
				rateLimitPerUser: rateLimitPerUser ?? void 0,
				archived,
				locked,
				autoArchiveDuration: autoArchiveDuration ?? void 0,
				availableTags
			};
			return jsonResult({
				ok: true,
				channel: accountId ? await discordGuildActionRuntime.editChannelDiscord(editPayload, { accountId }) : await discordGuildActionRuntime.editChannelDiscord(editPayload)
			});
		}
		case "channelDelete": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const channelId = readStringParam(params, "channelId", { required: true });
			return jsonResult(accountId ? await discordGuildActionRuntime.deleteChannelDiscord(channelId, { accountId }) : await discordGuildActionRuntime.deleteChannelDiscord(channelId));
		}
		case "channelMove": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const channelId = readStringParam(params, "channelId", { required: true });
			const parentId = readDiscordParentIdParam(params);
			const position = readNumberParam(params, "position", { integer: true });
			if (accountId) await discordGuildActionRuntime.moveChannelDiscord({
				guildId,
				channelId,
				parentId,
				position: position ?? void 0
			}, { accountId });
			else await discordGuildActionRuntime.moveChannelDiscord({
				guildId,
				channelId,
				parentId,
				position: position ?? void 0
			});
			return jsonResult({ ok: true });
		}
		case "categoryCreate": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const position = readNumberParam(params, "position", { integer: true });
			return jsonResult({
				ok: true,
				category: accountId ? await discordGuildActionRuntime.createChannelDiscord({
					guildId,
					name,
					type: 4,
					position: position ?? void 0
				}, { accountId }) : await discordGuildActionRuntime.createChannelDiscord({
					guildId,
					name,
					type: 4,
					position: position ?? void 0
				})
			});
		}
		case "categoryEdit": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const categoryId = readStringParam(params, "categoryId", { required: true });
			const name = readStringParam(params, "name");
			const position = readNumberParam(params, "position", { integer: true });
			return jsonResult({
				ok: true,
				category: accountId ? await discordGuildActionRuntime.editChannelDiscord({
					channelId: categoryId,
					name: name ?? void 0,
					position: position ?? void 0
				}, { accountId }) : await discordGuildActionRuntime.editChannelDiscord({
					channelId: categoryId,
					name: name ?? void 0,
					position: position ?? void 0
				})
			});
		}
		case "categoryDelete": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const categoryId = readStringParam(params, "categoryId", { required: true });
			return jsonResult(accountId ? await discordGuildActionRuntime.deleteChannelDiscord(categoryId, { accountId }) : await discordGuildActionRuntime.deleteChannelDiscord(categoryId));
		}
		case "channelPermissionSet": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const { channelId, targetId } = readChannelPermissionTarget(params);
			const targetType = readStringParam(params, "targetType", { required: true }) === "member" ? 1 : 0;
			const allow = readStringParam(params, "allow");
			const deny = readStringParam(params, "deny");
			if (accountId) await discordGuildActionRuntime.setChannelPermissionDiscord({
				channelId,
				targetId,
				targetType,
				allow: allow ?? void 0,
				deny: deny ?? void 0
			}, { accountId });
			else await discordGuildActionRuntime.setChannelPermissionDiscord({
				channelId,
				targetId,
				targetType,
				allow: allow ?? void 0,
				deny: deny ?? void 0
			});
			return jsonResult({ ok: true });
		}
		case "channelPermissionRemove": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const { channelId, targetId } = readChannelPermissionTarget(params);
			if (accountId) await discordGuildActionRuntime.removeChannelPermissionDiscord(channelId, targetId, { accountId });
			else await discordGuildActionRuntime.removeChannelPermissionDiscord(channelId, targetId);
			return jsonResult({ ok: true });
		}
		default: throw new Error(`Unknown action: ${action}`);
	}
}
//#endregion
//#region extensions/discord/src/actions/runtime.messaging.ts
const discordMessagingActionRuntime = {
	createThreadDiscord,
	deleteMessageDiscord,
	editMessageDiscord,
	fetchChannelPermissionsDiscord,
	fetchMessageDiscord,
	fetchReactionsDiscord,
	listPinsDiscord,
	listThreadsDiscord,
	pinMessageDiscord,
	reactMessageDiscord,
	readDiscordComponentSpec,
	readMessagesDiscord,
	removeOwnReactionsDiscord,
	removeReactionDiscord,
	resolveDiscordChannelId,
	searchMessagesDiscord,
	sendDiscordComponentMessage,
	sendMessageDiscord,
	sendPollDiscord,
	sendStickerDiscord,
	sendVoiceMessageDiscord,
	unpinMessageDiscord
};
function hasDiscordComponentObjectKeys(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}
function parseDiscordMessageLink(link) {
	const match = link.trim().match(/^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)(?:\/?|\?.*)$/i);
	if (!match) throw new Error("Invalid Discord message link. Expected https://discord.com/channels/<guildId>/<channelId>/<messageId>.");
	return {
		guildId: match[1],
		channelId: match[2],
		messageId: match[3]
	};
}
async function handleDiscordMessagingAction(action, params, isActionEnabled, options, cfg) {
	const resolveChannelId = () => discordMessagingActionRuntime.resolveDiscordChannelId(readStringParam(params, "channelId", { required: true }));
	const accountId = readStringParam(params, "accountId");
	const cfgOptions = cfg ? { cfg } : {};
	const reactionRuntimeOptions = cfg ? createDiscordRuntimeAccountContext({
		cfg,
		accountId: accountId ?? resolveDefaultDiscordAccountId(cfg)
	}) : accountId ? { accountId } : void 0;
	const withReactionRuntimeOptions = (extra) => ({
		...reactionRuntimeOptions ?? cfgOptions,
		...extra
	});
	const normalizeMessage = (message) => {
		if (!message || typeof message !== "object") return message;
		return withNormalizedTimestamp(message, message.timestamp);
	};
	switch (action) {
		case "react": {
			if (!isActionEnabled("reactions")) throw new Error("Discord reactions are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a Discord reaction." });
			if (remove) {
				await discordMessagingActionRuntime.removeReactionDiscord(channelId, messageId, emoji, withReactionRuntimeOptions());
				return jsonResult({
					ok: true,
					removed: emoji
				});
			}
			if (isEmpty) return jsonResult({
				ok: true,
				removed: (await discordMessagingActionRuntime.removeOwnReactionsDiscord(channelId, messageId, withReactionRuntimeOptions())).removed
			});
			await discordMessagingActionRuntime.reactMessageDiscord(channelId, messageId, emoji, withReactionRuntimeOptions());
			return jsonResult({
				ok: true,
				added: emoji
			});
		}
		case "reactions": {
			if (!isActionEnabled("reactions")) throw new Error("Discord reactions are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			const limit = readNumberParam(params, "limit");
			return jsonResult({
				ok: true,
				reactions: await discordMessagingActionRuntime.fetchReactionsDiscord(channelId, messageId, withReactionRuntimeOptions({ limit }))
			});
		}
		case "sticker": {
			if (!isActionEnabled("stickers")) throw new Error("Discord stickers are disabled.");
			const to = readStringParam(params, "to", { required: true });
			const content = readStringParam(params, "content");
			const stickerIds = readStringArrayParam(params, "stickerIds", {
				required: true,
				label: "stickerIds"
			});
			await discordMessagingActionRuntime.sendStickerDiscord(to, stickerIds, {
				...cfgOptions,
				...accountId ? { accountId } : {},
				content
			});
			return jsonResult({ ok: true });
		}
		case "poll": {
			if (!isActionEnabled("polls")) throw new Error("Discord polls are disabled.");
			const to = readStringParam(params, "to", { required: true });
			const content = readStringParam(params, "content");
			const question = readStringParam(params, "question", { required: true });
			const answers = readStringArrayParam(params, "answers", {
				required: true,
				label: "answers"
			});
			const allowMultiselect = readBooleanParam(params, "allowMultiselect");
			const durationHours = readNumberParam(params, "durationHours");
			const maxSelections = resolvePollMaxSelections(answers.length, allowMultiselect);
			await discordMessagingActionRuntime.sendPollDiscord(to, {
				question,
				options: answers,
				maxSelections,
				durationHours
			}, {
				...cfgOptions,
				...accountId ? { accountId } : {},
				content
			});
			return jsonResult({ ok: true });
		}
		case "permissions": {
			if (!isActionEnabled("permissions")) throw new Error("Discord permissions are disabled.");
			const channelId = resolveChannelId();
			return jsonResult({
				ok: true,
				permissions: accountId ? await discordMessagingActionRuntime.fetchChannelPermissionsDiscord(channelId, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.fetchChannelPermissionsDiscord(channelId, cfgOptions)
			});
		}
		case "fetchMessage": {
			if (!isActionEnabled("messages")) throw new Error("Discord message reads are disabled.");
			const messageLink = readStringParam(params, "messageLink");
			let guildId = readStringParam(params, "guildId");
			let channelId = readStringParam(params, "channelId");
			let messageId = readStringParam(params, "messageId");
			if (messageLink) {
				const parsed = parseDiscordMessageLink(messageLink);
				guildId = parsed.guildId;
				channelId = parsed.channelId;
				messageId = parsed.messageId;
			}
			if (!guildId || !channelId || !messageId) throw new Error("Discord message fetch requires guildId, channelId, and messageId (or a valid messageLink).");
			return jsonResult({
				ok: true,
				message: normalizeMessage(accountId ? await discordMessagingActionRuntime.fetchMessageDiscord(channelId, messageId, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.fetchMessageDiscord(channelId, messageId, cfgOptions)),
				guildId,
				channelId,
				messageId
			});
		}
		case "readMessages": {
			if (!isActionEnabled("messages")) throw new Error("Discord message reads are disabled.");
			const channelId = resolveChannelId();
			const query = {
				limit: readNumberParam(params, "limit"),
				before: readStringParam(params, "before"),
				after: readStringParam(params, "after"),
				around: readStringParam(params, "around")
			};
			return jsonResult({
				ok: true,
				messages: (accountId ? await discordMessagingActionRuntime.readMessagesDiscord(channelId, query, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.readMessagesDiscord(channelId, query, cfgOptions)).map((message) => normalizeMessage(message))
			});
		}
		case "sendMessage": {
			if (!isActionEnabled("messages")) throw new Error("Discord message sends are disabled.");
			const to = readStringParam(params, "to", { required: true });
			const asVoice = params.asVoice === true;
			const silent = params.silent === true;
			const rawComponents = params.components;
			const componentSpec = hasDiscordComponentObjectKeys(rawComponents) ? discordMessagingActionRuntime.readDiscordComponentSpec(rawComponents) : null;
			const components = Array.isArray(rawComponents) || typeof rawComponents === "function" ? rawComponents : void 0;
			const content = readStringParam(params, "content", {
				required: !asVoice && !componentSpec && !components,
				allowEmpty: true
			});
			const mediaUrl = readStringParam(params, "mediaUrl", { trim: false }) ?? readStringParam(params, "path", { trim: false }) ?? readStringParam(params, "filePath", { trim: false });
			const filename = readStringParam(params, "filename");
			const replyTo = readStringParam(params, "replyTo");
			const rawEmbeds = params.embeds;
			const embeds = Array.isArray(rawEmbeds) ? rawEmbeds : void 0;
			const sessionKey = readStringParam(params, "__sessionKey");
			const agentId = readStringParam(params, "__agentId");
			if (componentSpec) {
				if (asVoice) throw new Error("Discord components cannot be sent as voice messages.");
				if (embeds?.length) throw new Error("Discord components cannot include embeds.");
				const normalizedContent = content?.trim() ? content : void 0;
				const payload = componentSpec.text ? componentSpec : {
					...componentSpec,
					text: normalizedContent
				};
				return jsonResult({
					ok: true,
					result: await discordMessagingActionRuntime.sendDiscordComponentMessage(to, payload, {
						...cfgOptions,
						...accountId ? { accountId } : {},
						silent,
						replyTo: replyTo ?? void 0,
						sessionKey: sessionKey ?? void 0,
						agentId: agentId ?? void 0,
						mediaUrl: mediaUrl ?? void 0,
						filename: filename ?? void 0
					}),
					components: true
				});
			}
			if (asVoice) {
				if (!mediaUrl) throw new Error("Voice messages require a media file reference (mediaUrl, path, or filePath).");
				if (content && content.trim()) throw new Error("Voice messages cannot include text content (Discord limitation). Remove the content parameter.");
				assertMediaNotDataUrl(mediaUrl);
				return jsonResult({
					ok: true,
					result: await discordMessagingActionRuntime.sendVoiceMessageDiscord(to, mediaUrl, {
						...cfgOptions,
						...accountId ? { accountId } : {},
						replyTo,
						silent
					}),
					voiceMessage: true
				});
			}
			return jsonResult({
				ok: true,
				result: await discordMessagingActionRuntime.sendMessageDiscord(to, content ?? "", {
					...cfgOptions,
					...accountId ? { accountId } : {},
					mediaUrl,
					filename: filename ?? void 0,
					mediaLocalRoots: options?.mediaLocalRoots,
					mediaReadFile: options?.mediaReadFile,
					replyTo,
					components,
					embeds,
					silent
				})
			});
		}
		case "editMessage": {
			if (!isActionEnabled("messages")) throw new Error("Discord message edits are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			const content = readStringParam(params, "content", { required: true });
			return jsonResult({
				ok: true,
				message: accountId ? await discordMessagingActionRuntime.editMessageDiscord(channelId, messageId, { content }, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.editMessageDiscord(channelId, messageId, { content }, cfgOptions)
			});
		}
		case "deleteMessage": {
			if (!isActionEnabled("messages")) throw new Error("Discord message deletes are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			if (accountId) await discordMessagingActionRuntime.deleteMessageDiscord(channelId, messageId, {
				...cfgOptions,
				accountId
			});
			else await discordMessagingActionRuntime.deleteMessageDiscord(channelId, messageId, cfgOptions);
			return jsonResult({ ok: true });
		}
		case "threadCreate": {
			if (!isActionEnabled("threads")) throw new Error("Discord threads are disabled.");
			const channelId = resolveChannelId();
			const name = readStringParam(params, "name", { required: true });
			const messageId = readStringParam(params, "messageId");
			const content = readStringParam(params, "content");
			const payload = {
				name,
				messageId,
				autoArchiveMinutes: readNumberParam(params, "autoArchiveMinutes"),
				content,
				appliedTags: readStringArrayParam(params, "appliedTags") ?? void 0
			};
			return jsonResult({
				ok: true,
				thread: accountId ? await discordMessagingActionRuntime.createThreadDiscord(channelId, payload, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.createThreadDiscord(channelId, payload, cfgOptions)
			});
		}
		case "threadList": {
			if (!isActionEnabled("threads")) throw new Error("Discord threads are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const channelId = readStringParam(params, "channelId");
			const includeArchived = readBooleanParam(params, "includeArchived");
			const before = readStringParam(params, "before");
			const limit = readNumberParam(params, "limit");
			return jsonResult({
				ok: true,
				threads: accountId ? await discordMessagingActionRuntime.listThreadsDiscord({
					guildId,
					channelId,
					includeArchived,
					before,
					limit
				}, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.listThreadsDiscord({
					guildId,
					channelId,
					includeArchived,
					before,
					limit
				}, cfgOptions)
			});
		}
		case "threadReply": {
			if (!isActionEnabled("threads")) throw new Error("Discord threads are disabled.");
			const channelId = resolveChannelId();
			const content = readStringParam(params, "content", { required: true });
			const mediaUrl = readStringParam(params, "mediaUrl");
			const replyTo = readStringParam(params, "replyTo");
			return jsonResult({
				ok: true,
				result: await discordMessagingActionRuntime.sendMessageDiscord(`channel:${channelId}`, content, {
					...cfgOptions,
					...accountId ? { accountId } : {},
					mediaUrl,
					mediaLocalRoots: options?.mediaLocalRoots,
					mediaReadFile: options?.mediaReadFile,
					replyTo
				})
			});
		}
		case "pinMessage": {
			if (!isActionEnabled("pins")) throw new Error("Discord pins are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			if (accountId) await discordMessagingActionRuntime.pinMessageDiscord(channelId, messageId, {
				...cfgOptions,
				accountId
			});
			else await discordMessagingActionRuntime.pinMessageDiscord(channelId, messageId, cfgOptions);
			return jsonResult({ ok: true });
		}
		case "unpinMessage": {
			if (!isActionEnabled("pins")) throw new Error("Discord pins are disabled.");
			const channelId = resolveChannelId();
			const messageId = readStringParam(params, "messageId", { required: true });
			if (accountId) await discordMessagingActionRuntime.unpinMessageDiscord(channelId, messageId, {
				...cfgOptions,
				accountId
			});
			else await discordMessagingActionRuntime.unpinMessageDiscord(channelId, messageId, cfgOptions);
			return jsonResult({ ok: true });
		}
		case "listPins": {
			if (!isActionEnabled("pins")) throw new Error("Discord pins are disabled.");
			const channelId = resolveChannelId();
			return jsonResult({
				ok: true,
				pins: (accountId ? await discordMessagingActionRuntime.listPinsDiscord(channelId, {
					...cfgOptions,
					accountId
				}) : await discordMessagingActionRuntime.listPinsDiscord(channelId, cfgOptions)).map((pin) => normalizeMessage(pin))
			});
		}
		case "searchMessages": {
			if (!isActionEnabled("search")) throw new Error("Discord search is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const content = readStringParam(params, "content", { required: true });
			const channelId = readStringParam(params, "channelId");
			const channelIds = readStringArrayParam(params, "channelIds");
			const authorId = readStringParam(params, "authorId");
			const authorIds = readStringArrayParam(params, "authorIds");
			const limit = readNumberParam(params, "limit");
			const channelIdList = [...channelIds ?? [], ...channelId ? [channelId] : []];
			const authorIdList = [...authorIds ?? [], ...authorId ? [authorId] : []];
			const results = accountId ? await discordMessagingActionRuntime.searchMessagesDiscord({
				guildId,
				content,
				channelIds: channelIdList.length ? channelIdList : void 0,
				authorIds: authorIdList.length ? authorIdList : void 0,
				limit
			}, {
				...cfgOptions,
				accountId
			}) : await discordMessagingActionRuntime.searchMessagesDiscord({
				guildId,
				content,
				channelIds: channelIdList.length ? channelIdList : void 0,
				authorIds: authorIdList.length ? authorIdList : void 0,
				limit
			}, cfgOptions);
			if (!results || typeof results !== "object") return jsonResult({
				ok: true,
				results
			});
			const resultsRecord = results;
			const messages = resultsRecord.messages;
			const normalizedMessages = Array.isArray(messages) ? messages.map((group) => Array.isArray(group) ? group.map((msg) => normalizeMessage(msg)) : group) : messages;
			return jsonResult({
				ok: true,
				results: {
					...resultsRecord,
					messages: normalizedMessages
				}
			});
		}
		default: throw new Error(`Unknown action: ${action}`);
	}
}
//#endregion
//#region extensions/discord/src/actions/runtime.moderation-shared.ts
const moderationPermissions = {
	timeout: PermissionFlagsBits.ModerateMembers,
	kick: PermissionFlagsBits.KickMembers,
	ban: PermissionFlagsBits.BanMembers
};
function isDiscordModerationAction(action) {
	return action === "timeout" || action === "kick" || action === "ban";
}
function requiredGuildPermissionForModerationAction(action) {
	return moderationPermissions[action];
}
function readDiscordModerationCommand(action, params) {
	if (!isDiscordModerationAction(action)) throw new Error(`Unsupported Discord moderation action: ${action}`);
	return {
		action,
		guildId: readStringParam(params, "guildId", { required: true }),
		userId: readStringParam(params, "userId", { required: true }),
		durationMinutes: readNumberParam(params, "durationMinutes", { integer: true }),
		until: readStringParam(params, "until"),
		reason: readStringParam(params, "reason"),
		deleteMessageDays: readNumberParam(params, "deleteMessageDays", { integer: true })
	};
}
//#endregion
//#region extensions/discord/src/actions/runtime.moderation.ts
const discordModerationActionRuntime = {
	banMemberDiscord,
	hasAnyGuildPermissionDiscord,
	kickMemberDiscord,
	timeoutMemberDiscord
};
async function verifySenderModerationPermission(params) {
	if (!params.senderUserId) return;
	if (!await discordModerationActionRuntime.hasAnyGuildPermissionDiscord(params.guildId, params.senderUserId, [params.requiredPermission], params.accountId ? { accountId: params.accountId } : void 0)) throw new Error("Sender does not have required permissions for this moderation action.");
}
async function handleDiscordModerationAction(action, params, isActionEnabled) {
	if (!isDiscordModerationAction(action)) throw new Error(`Unknown action: ${action}`);
	if (!isActionEnabled("moderation", false)) throw new Error("Discord moderation is disabled.");
	const command = readDiscordModerationCommand(action, params);
	const accountId = readStringParam(params, "accountId");
	const senderUserId = readStringParam(params, "senderUserId");
	await verifySenderModerationPermission({
		guildId: command.guildId,
		senderUserId,
		requiredPermission: requiredGuildPermissionForModerationAction(command.action),
		accountId
	});
	switch (command.action) {
		case "timeout": return jsonResult({
			ok: true,
			member: accountId ? await discordModerationActionRuntime.timeoutMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				durationMinutes: command.durationMinutes,
				until: command.until,
				reason: command.reason
			}, { accountId }) : await discordModerationActionRuntime.timeoutMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				durationMinutes: command.durationMinutes,
				until: command.until,
				reason: command.reason
			})
		});
		case "kick":
			if (accountId) await discordModerationActionRuntime.kickMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason
			}, { accountId });
			else await discordModerationActionRuntime.kickMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason
			});
			return jsonResult({ ok: true });
		case "ban":
			if (accountId) await discordModerationActionRuntime.banMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason,
				deleteMessageDays: command.deleteMessageDays
			}, { accountId });
			else await discordModerationActionRuntime.banMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason,
				deleteMessageDays: command.deleteMessageDays
			});
			return jsonResult({ ok: true });
	}
	throw new Error("Unsupported Discord moderation action");
}
//#endregion
//#region extensions/discord/src/actions/runtime.presence.ts
const ACTIVITY_TYPE_MAP = {
	playing: 0,
	streaming: 1,
	listening: 2,
	watching: 3,
	custom: 4,
	competing: 5
};
const VALID_STATUSES = new Set([
	"online",
	"dnd",
	"idle",
	"invisible"
]);
async function handleDiscordPresenceAction(action, params, isActionEnabled) {
	if (action !== "setPresence") throw new Error(`Unknown presence action: ${action}`);
	if (!isActionEnabled("presence", false)) throw new Error("Discord presence changes are disabled.");
	const accountId = readStringParam(params, "accountId");
	const gateway = getGateway(accountId);
	if (!gateway) throw new Error(`Discord gateway not available${accountId ? ` for account "${accountId}"` : ""}. The bot may not be connected.`);
	if (!gateway.isConnected) throw new Error(`Discord gateway is not connected${accountId ? ` for account "${accountId}"` : ""}.`);
	const statusRaw = readStringParam(params, "status") ?? "online";
	if (!VALID_STATUSES.has(statusRaw)) throw new Error(`Invalid status "${statusRaw}". Must be one of: ${[...VALID_STATUSES].join(", ")}`);
	const status = statusRaw;
	const activityTypeRaw = readStringParam(params, "activityType");
	const activityName = readStringParam(params, "activityName");
	const activities = [];
	if (activityTypeRaw || activityName) {
		if (!activityTypeRaw) throw new Error(`activityType is required when activityName is provided. Valid types: ${Object.keys(ACTIVITY_TYPE_MAP).join(", ")}`);
		const typeNum = ACTIVITY_TYPE_MAP[normalizeLowercaseStringOrEmpty(activityTypeRaw)];
		if (typeNum === void 0) throw new Error(`Invalid activityType "${activityTypeRaw}". Must be one of: ${Object.keys(ACTIVITY_TYPE_MAP).join(", ")}`);
		const activity = {
			name: activityName ?? "",
			type: typeNum
		};
		if (typeNum === 1) {
			const url = readStringParam(params, "activityUrl");
			if (url) activity.url = url;
		}
		const state = readStringParam(params, "activityState");
		if (state) activity.state = state;
		activities.push(activity);
	}
	const presenceData = {
		since: null,
		activities,
		status,
		afk: false
	};
	gateway.updatePresence(presenceData);
	return jsonResult({
		ok: true,
		status,
		activities: activities.map((a) => ({
			type: a.type,
			name: a.name,
			...a.url ? { url: a.url } : {},
			...a.state ? { state: a.state } : {}
		}))
	});
}
//#endregion
//#region extensions/discord/src/actions/runtime.ts
const messagingActions = new Set([
	"react",
	"reactions",
	"sticker",
	"poll",
	"permissions",
	"fetchMessage",
	"readMessages",
	"sendMessage",
	"editMessage",
	"deleteMessage",
	"threadCreate",
	"threadList",
	"threadReply",
	"pinMessage",
	"unpinMessage",
	"listPins",
	"searchMessages"
]);
const guildActions = new Set([
	"memberInfo",
	"roleInfo",
	"emojiList",
	"emojiUpload",
	"stickerUpload",
	"roleAdd",
	"roleRemove",
	"channelInfo",
	"channelList",
	"voiceStatus",
	"eventList",
	"eventCreate",
	"channelCreate",
	"channelEdit",
	"channelDelete",
	"channelMove",
	"categoryCreate",
	"categoryEdit",
	"categoryDelete",
	"channelPermissionSet",
	"channelPermissionRemove"
]);
const moderationActions = new Set([
	"timeout",
	"kick",
	"ban"
]);
const presenceActions = new Set(["setPresence"]);
async function handleDiscordAction(params, cfg, options) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createDiscordActionGate({
		cfg,
		accountId: readStringParam(params, "accountId")
	});
	if (messagingActions.has(action)) return await handleDiscordMessagingAction(action, params, isActionEnabled, options, cfg);
	if (guildActions.has(action)) return await handleDiscordGuildAction(action, params, isActionEnabled, cfg, options);
	if (moderationActions.has(action)) return await handleDiscordModerationAction(action, params, isActionEnabled);
	if (presenceActions.has(action)) return await handleDiscordPresenceAction(action, params, isActionEnabled);
	throw new Error(`Unknown action: ${action}`);
}
//#endregion
export { readDiscordParentIdParam as a, requiredGuildPermissionForModerationAction as i, isDiscordModerationAction as n, readDiscordModerationCommand as r, handleDiscordAction as t };
