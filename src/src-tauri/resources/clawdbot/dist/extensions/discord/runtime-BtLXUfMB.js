import { a as resolveDefaultDiscordAccountId, t as createDiscordActionGate } from "./accounts-zcI4mtzH.js";
import { r as resolveDiscordChannelId } from "./chunk-BWZe6zUn.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, g as withNormalizedTimestamp, h as resolvePollMaxSelections, l as parseAvailableTags, m as readStringParam, p as readStringArrayParam, r as sendDiscordComponentMessage, s as assertMediaNotDataUrl, u as readBooleanParam } from "./send.components-szoAn9vw.js";
import { n as getGateway, o as getPresence } from "./gateway-registry-BKG4KIVC.js";
import { D as hasAnyGuildPermissionDiscord, M as createDiscordRuntimeAccountContext, h as resolveDiscordTargetChannelId, w as fetchChannelPermissionsDiscord } from "./send.shared-G5HPu1EM.js";
import { A as listGuildEmojisDiscord, C as fetchVoiceStatusDiscord, D as removeRoleDiscord, E as listScheduledEventsDiscord, F as editChannelDiscord, I as moveChannelDiscord, L as removeChannelPermissionDiscord, M as uploadStickerDiscord, N as createChannelDiscord, O as resolveEventCoverImage, P as deleteChannelDiscord, R as setChannelPermissionDiscord, S as fetchRoleInfoDiscord, T as listGuildChannelsDiscord, _ as addRoleDiscord, a as removeReactionDiscord, b as fetchChannelInfoDiscord, c as deleteMessageDiscord, d as listPinsDiscord, f as listThreadsDiscord, g as unpinMessageDiscord, h as searchMessagesDiscord, i as removeOwnReactionsDiscord, j as uploadEmojiDiscord, k as timeoutMemberDiscord, l as editMessageDiscord, m as readMessagesDiscord, n as fetchReactionsDiscord, p as pinMessageDiscord, r as reactMessageDiscord, s as createThreadDiscord, u as fetchMessageDiscord, v as banMemberDiscord, w as kickMemberDiscord, x as fetchMemberInfoDiscord, y as createScheduledEventDiscord } from "./send-C92oy8jh.js";
import { i as sendVoiceMessageDiscord, n as sendPollDiscord, r as sendStickerDiscord, t as sendMessageDiscord } from "./send.outbound-BTnNj5k_.js";
import { c as readDiscordComponentSpec } from "./components-AfY8KcWW.js";
import "./targets-CDuIC7Ms.js";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { PermissionFlagsBits } from "discord-api-types/v10";
//#region extensions/discord/src/actions/runtime.shared.ts
function readDiscordParentIdParam(params) {
	if (params.clearParent === true) return null;
	if (params.parentId === null) return null;
	return readStringParam(params, "parentId");
}
function readDiscordBooleanParam(params, key) {
	return typeof params[key] === "boolean" ? params[key] : void 0;
}
function readDiscordChannelCreateParams(params) {
	const parentId = readDiscordParentIdParam(params);
	return {
		guildId: readStringParam(params, "guildId", { required: true }),
		name: readStringParam(params, "name", { required: true }),
		type: readNumberParam(params, "type", { integer: true }) ?? void 0,
		parentId: parentId ?? void 0,
		topic: readStringParam(params, "topic") ?? void 0,
		position: readNumberParam(params, "position", { integer: true }) ?? void 0,
		nsfw: readDiscordBooleanParam(params, "nsfw")
	};
}
function readDiscordChannelEditParams(params) {
	const parentId = readDiscordParentIdParam(params);
	return {
		channelId: readStringParam(params, "channelId", { required: true }),
		name: readStringParam(params, "name") ?? void 0,
		topic: readStringParam(params, "topic") ?? void 0,
		position: readNumberParam(params, "position", { integer: true }) ?? void 0,
		parentId: parentId === void 0 ? void 0 : parentId,
		nsfw: readDiscordBooleanParam(params, "nsfw"),
		rateLimitPerUser: readNumberParam(params, "rateLimitPerUser", { integer: true }) ?? void 0,
		archived: readDiscordBooleanParam(params, "archived"),
		locked: readDiscordBooleanParam(params, "locked"),
		autoArchiveDuration: readNumberParam(params, "autoArchiveDuration", { integer: true }) ?? void 0,
		availableTags: parseAvailableTags(params.availableTags)
	};
}
function readDiscordChannelMoveParams(params) {
	const parentId = readDiscordParentIdParam(params);
	return {
		guildId: readStringParam(params, "guildId", { required: true }),
		channelId: readStringParam(params, "channelId", { required: true }),
		parentId: parentId === void 0 ? void 0 : parentId,
		position: readNumberParam(params, "position", { integer: true }) ?? void 0
	};
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
	await params.mutate({
		guildId,
		userId,
		roleId
	}, {
		...params.cfgOptions,
		...params.accountId ? { accountId: params.accountId } : {}
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
	if (!cfg) throw new Error("Discord guild actions require a resolved runtime config.");
	const cfgOptions = { cfg };
	const withOpts = (extra) => ({
		...cfgOptions,
		...accountId ? { accountId } : {},
		...extra
	});
	switch (action) {
		case "memberInfo": {
			if (!isActionEnabled("memberInfo")) throw new Error("Discord member info is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const userId = readStringParam(params, "userId", { required: true });
			const effectiveAccountId = accountId ?? resolveDefaultDiscordAccountId(cfg);
			const member = effectiveAccountId ? await discordGuildActionRuntime.fetchMemberInfoDiscord(guildId, userId, {
				...cfgOptions,
				accountId: effectiveAccountId
			}) : await discordGuildActionRuntime.fetchMemberInfoDiscord(guildId, userId, cfgOptions);
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
				roles: await discordGuildActionRuntime.fetchRoleInfoDiscord(guildId, withOpts())
			});
		}
		case "emojiList": {
			if (!isActionEnabled("reactions")) throw new Error("Discord reactions are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				emojis: await discordGuildActionRuntime.listGuildEmojisDiscord(guildId, withOpts())
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
				emoji: await discordGuildActionRuntime.uploadEmojiDiscord({
					guildId,
					name,
					mediaUrl,
					roleIds: roleIds?.length ? roleIds : void 0
				}, withOpts())
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
				sticker: await discordGuildActionRuntime.uploadStickerDiscord({
					guildId,
					name,
					description,
					tags,
					mediaUrl
				}, withOpts())
			});
		}
		case "roleAdd":
			if (!isActionEnabled("roles", false)) throw new Error("Discord role changes are disabled.");
			await runRoleMutation({
				cfgOptions,
				accountId,
				values: params,
				mutate: discordGuildActionRuntime.addRoleDiscord
			});
			return jsonResult({ ok: true });
		case "roleRemove":
			if (!isActionEnabled("roles", false)) throw new Error("Discord role changes are disabled.");
			await runRoleMutation({
				cfgOptions,
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
				channel: await discordGuildActionRuntime.fetchChannelInfoDiscord(channelId, withOpts())
			});
		}
		case "channelList": {
			if (!isActionEnabled("channelInfo")) throw new Error("Discord channel info is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				channels: await discordGuildActionRuntime.listGuildChannelsDiscord(guildId, withOpts())
			});
		}
		case "voiceStatus": {
			if (!isActionEnabled("voiceStatus")) throw new Error("Discord voice status is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const userId = readStringParam(params, "userId", { required: true });
			return jsonResult({
				ok: true,
				voice: await discordGuildActionRuntime.fetchVoiceStatusDiscord(guildId, userId, withOpts())
			});
		}
		case "eventList": {
			if (!isActionEnabled("events")) throw new Error("Discord events are disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			return jsonResult({
				ok: true,
				events: await discordGuildActionRuntime.listScheduledEventsDiscord(guildId, withOpts())
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
				event: await discordGuildActionRuntime.createScheduledEventDiscord(guildId, payload, withOpts())
			});
		}
		case "channelCreate":
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			return jsonResult({
				ok: true,
				channel: await discordGuildActionRuntime.createChannelDiscord(readDiscordChannelCreateParams(params), withOpts())
			});
		case "channelEdit":
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			return jsonResult({
				ok: true,
				channel: await discordGuildActionRuntime.editChannelDiscord(readDiscordChannelEditParams(params), withOpts())
			});
		case "channelDelete": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const channelId = readStringParam(params, "channelId", { required: true });
			return jsonResult(await discordGuildActionRuntime.deleteChannelDiscord(channelId, withOpts()));
		}
		case "channelMove":
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			await discordGuildActionRuntime.moveChannelDiscord(readDiscordChannelMoveParams(params), withOpts());
			return jsonResult({ ok: true });
		case "categoryCreate": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const guildId = readStringParam(params, "guildId", { required: true });
			const name = readStringParam(params, "name", { required: true });
			const position = readNumberParam(params, "position", { integer: true });
			return jsonResult({
				ok: true,
				category: await discordGuildActionRuntime.createChannelDiscord({
					guildId,
					name,
					type: 4,
					position: position ?? void 0
				}, withOpts())
			});
		}
		case "categoryEdit": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const categoryId = readStringParam(params, "categoryId", { required: true });
			const name = readStringParam(params, "name");
			const position = readNumberParam(params, "position", { integer: true });
			return jsonResult({
				ok: true,
				category: await discordGuildActionRuntime.editChannelDiscord({
					channelId: categoryId,
					name: name ?? void 0,
					position: position ?? void 0
				}, withOpts())
			});
		}
		case "categoryDelete": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const categoryId = readStringParam(params, "categoryId", { required: true });
			return jsonResult(await discordGuildActionRuntime.deleteChannelDiscord(categoryId, withOpts()));
		}
		case "channelPermissionSet": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const { channelId, targetId } = readChannelPermissionTarget(params);
			const targetType = readStringParam(params, "targetType", { required: true }) === "member" ? 1 : 0;
			const allow = readStringParam(params, "allow");
			const deny = readStringParam(params, "deny");
			await discordGuildActionRuntime.setChannelPermissionDiscord({
				channelId,
				targetId,
				targetType,
				allow: allow ?? void 0,
				deny: deny ?? void 0
			}, withOpts());
			return jsonResult({ ok: true });
		}
		case "channelPermissionRemove": {
			if (!isActionEnabled("channels")) throw new Error("Discord channel management is disabled.");
			const { channelId, targetId } = readChannelPermissionTarget(params);
			await discordGuildActionRuntime.removeChannelPermissionDiscord(channelId, targetId, withOpts());
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
	resolveDiscordReactionTargetChannelId,
	resolveDiscordChannelId,
	searchMessagesDiscord,
	sendDiscordComponentMessage,
	sendMessageDiscord,
	sendPollDiscord,
	sendStickerDiscord,
	sendVoiceMessageDiscord,
	unpinMessageDiscord
};
async function resolveDiscordReactionTargetChannelId(params) {
	try {
		return resolveDiscordChannelId(params.target);
	} catch {
		return (await resolveDiscordTargetChannelId(params.target, {
			cfg: params.cfg,
			accountId: params.accountId
		})).channelId;
	}
}
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
async function handleDiscordMessagingAction(action, params, isActionEnabled, cfg, options) {
	const resolveChannelId = () => discordMessagingActionRuntime.resolveDiscordChannelId(readStringParam(params, "channelId", { required: true }));
	const accountId = readStringParam(params, "accountId");
	if (!cfg) throw new Error("Discord messaging actions require a resolved runtime config.");
	const cfgOptions = { cfg };
	const resolvedReactionAccountId = accountId ?? resolveDefaultDiscordAccountId(cfg);
	const resolveReactionChannelId = async () => {
		const target = readStringParam(params, "channelId") ?? readStringParam(params, "to", { required: true });
		return await discordMessagingActionRuntime.resolveDiscordReactionTargetChannelId({
			target,
			cfg,
			accountId: resolvedReactionAccountId
		});
	};
	const reactionRuntimeOptions = resolvedReactionAccountId ? createDiscordRuntimeAccountContext({
		cfg,
		accountId: resolvedReactionAccountId
	}) : cfgOptions;
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
			const channelId = await resolveReactionChannelId();
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
			const channelId = await resolveReactionChannelId();
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
	if (!await discordModerationActionRuntime.hasAnyGuildPermissionDiscord(params.guildId, params.senderUserId, [params.requiredPermission], {
		...params.cfgOptions,
		...params.accountId ? { accountId: params.accountId } : {}
	})) throw new Error("Sender does not have required permissions for this moderation action.");
}
async function handleDiscordModerationAction(action, params, isActionEnabled, cfg) {
	if (!isDiscordModerationAction(action)) throw new Error(`Unknown action: ${action}`);
	if (!isActionEnabled("moderation", false)) throw new Error("Discord moderation is disabled.");
	if (!cfg) throw new Error("Discord moderation actions require a resolved runtime config.");
	const cfgOptions = { cfg };
	const command = readDiscordModerationCommand(action, params);
	const accountId = readStringParam(params, "accountId");
	const senderUserId = readStringParam(params, "senderUserId");
	const withOpts = () => ({
		...cfgOptions,
		...accountId ? { accountId } : {}
	});
	await verifySenderModerationPermission({
		guildId: command.guildId,
		senderUserId,
		requiredPermission: requiredGuildPermissionForModerationAction(command.action),
		accountId,
		cfgOptions
	});
	switch (command.action) {
		case "timeout": return jsonResult({
			ok: true,
			member: await discordModerationActionRuntime.timeoutMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				durationMinutes: command.durationMinutes,
				until: command.until,
				reason: command.reason
			}, withOpts())
		});
		case "kick":
			await discordModerationActionRuntime.kickMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason
			}, withOpts());
			return jsonResult({ ok: true });
		case "ban":
			await discordModerationActionRuntime.banMemberDiscord({
				guildId: command.guildId,
				userId: command.userId,
				reason: command.reason,
				deleteMessageDays: command.deleteMessageDays
			}, withOpts());
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
		activities: activities.map((a) => Object.assign({
			type: a.type,
			name: a.name
		}, a.url ? { url: a.url } : {}, a.state ? { state: a.state } : {}))
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
	if (messagingActions.has(action)) return await handleDiscordMessagingAction(action, params, isActionEnabled, cfg, options);
	if (guildActions.has(action)) return await handleDiscordGuildAction(action, params, isActionEnabled, cfg, options);
	if (moderationActions.has(action)) return await handleDiscordModerationAction(action, params, isActionEnabled, cfg);
	if (presenceActions.has(action)) return await handleDiscordPresenceAction(action, params, isActionEnabled);
	throw new Error(`Unknown action: ${action}`);
}
//#endregion
export { readDiscordChannelCreateParams as a, readDiscordParentIdParam as c, requiredGuildPermissionForModerationAction as i, isDiscordModerationAction as n, readDiscordChannelEditParams as o, readDiscordModerationCommand as r, readDiscordChannelMoveParams as s, handleDiscordAction as t };
