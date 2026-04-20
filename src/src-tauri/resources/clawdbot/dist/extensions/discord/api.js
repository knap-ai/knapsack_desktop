import { a as resolveDefaultDiscordAccountId, c as resolveDiscordMaxLinesPerMessage, i as mergeDiscordAccountConfig, n as listDiscordAccountIds, o as resolveDiscordAccount, r as listEnabledDiscordAccounts, s as resolveDiscordAccountConfig, t as createDiscordActionGate } from "./accounts-zcI4mtzH.js";
import { t as inspectDiscordAccount } from "./account-inspect-BNdqsthq.js";
import { n as resolveDiscordChannelId, t as parseDiscordTarget } from "./target-parsing-BSCe_ffC.js";
import { p as resolveDiscordTarget } from "./send-DrbFKdd7.js";
import { a as readDiscordParentIdParam, n as isDiscordModerationAction, r as readDiscordModerationCommand, t as handleDiscordAction } from "./runtime-C5OGQnQA.js";
import { _ as parseDiscordModalCustomId, c as readDiscordComponentSpec, d as DISCORD_COMPONENT_CUSTOM_ID_KEY, f as DISCORD_MODAL_CUSTOM_ID_KEY, g as parseDiscordComponentCustomIdForCarbon, h as parseDiscordComponentCustomId, i as buildDiscordComponentMessageFlags, l as resolveDiscordComponentAttachmentName, m as buildDiscordModalCustomId, n as DiscordFormModal, o as createDiscordFormModal, p as buildDiscordComponentCustomId, r as buildDiscordComponentMessage, s as formatDiscordComponentEventText, t as DISCORD_COMPONENT_ATTACHMENT_PREFIX, u as buildDiscordInteractiveComponents, v as parseDiscordModalCustomIdForCarbon } from "./components-D-Smrfec.js";
import "./targets-CkPEAzVf.js";
import "./action-runtime-api.js";
import { a as isDiscordExecApprovalClientEnabled, i as isDiscordExecApprovalApprover, o as shouldSuppressLocalDiscordExecApprovalPrompt, r as getDiscordExecApprovalApprovers } from "./ui-BxLG13MU.js";
import { i as resolveDiscordGroupToolPolicy, n as collectDiscordStatusIssues, r as resolveDiscordGroupRequireMention, t as discordPlugin } from "./channel-o0mosQGD.js";
import { n as normalizeDiscordMessagingTarget, r as normalizeDiscordOutboundTarget, t as looksLikeDiscordTargetId } from "./normalize-BMKcRSTT.js";
import { t as normalizeExplicitDiscordSessionKey } from "./session-key-normalization-gXrjj2uh.js";
import { t as discordSetupPlugin } from "./channel.setup-DxMc4ZQw.js";
import { n as handleDiscordSubagentEnded, r as handleDiscordSubagentSpawning, t as handleDiscordSubagentDeliveryTarget } from "./subagent-hooks-CNegolKO.js";
import { n as listDiscordDirectoryGroupsFromConfig, r as listDiscordDirectoryPeersFromConfig } from "./directory-config--yWHiRvI.js";
import { t as fetchPluralKitMessageInfo } from "./pluralkit-CGjt16no.js";
import { a as resolveDiscordPrivilegedIntentsFromFlags, i as probeDiscord, n as fetchDiscordApplicationSummary, r as parseApplicationIdFromToken, t as fetchDiscordApplicationId } from "./probe-9b8bVbqv.js";
import { t as collectDiscordSecurityAuditFindings } from "./security-audit-vfHJi3h7.js";
import { i as DISCORD_DEFAULT_LISTENER_TIMEOUT_MS, r as DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS } from "./timeouts-DFBGDirT.js";
import { normalizeOptionalString, normalizeOptionalStringifiedId } from "openclaw/plugin-sdk/text-runtime";
import { resolveReactionMessageId } from "openclaw/plugin-sdk/channel-actions";
import { readBooleanParam } from "openclaw/plugin-sdk/boolean-param";
import { normalizeInteractiveReply } from "openclaw/plugin-sdk/interactive-runtime";
import { parseAvailableTags, readNumberParam, readStringArrayParam, readStringParam } from "openclaw/plugin-sdk/agent-runtime";
import { resolveOpenProviderRuntimeGroupPolicy as resolveDiscordRuntimeGroupPolicy } from "openclaw/plugin-sdk/runtime-group-policy";
//#region extensions/discord/src/actions/handle-action.guild-admin.ts
async function tryHandleDiscordMessageActionGuildAdmin(params) {
	const { ctx, resolveChannelId, readParentIdParam } = params;
	const { action, params: actionParams, cfg } = ctx;
	const accountId = ctx.accountId ?? readStringParam(actionParams, "accountId");
	if (action === "member-info") {
		const userId = readStringParam(actionParams, "userId", { required: true });
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		return await handleDiscordAction({
			action: "memberInfo",
			accountId: accountId ?? void 0,
			guildId,
			userId
		}, cfg);
	}
	if (action === "role-info") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		return await handleDiscordAction({
			action: "roleInfo",
			accountId: accountId ?? void 0,
			guildId
		}, cfg);
	}
	if (action === "emoji-list") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		return await handleDiscordAction({
			action: "emojiList",
			accountId: accountId ?? void 0,
			guildId
		}, cfg);
	}
	if (action === "emoji-upload") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const name = readStringParam(actionParams, "emojiName", { required: true });
		const mediaUrl = readStringParam(actionParams, "media", {
			required: true,
			trim: false
		});
		const roleIds = readStringArrayParam(actionParams, "roleIds");
		return await handleDiscordAction({
			action: "emojiUpload",
			accountId: accountId ?? void 0,
			guildId,
			name,
			mediaUrl,
			roleIds
		}, cfg);
	}
	if (action === "sticker-upload") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const name = readStringParam(actionParams, "stickerName", { required: true });
		const description = readStringParam(actionParams, "stickerDesc", { required: true });
		const tags = readStringParam(actionParams, "stickerTags", { required: true });
		const mediaUrl = readStringParam(actionParams, "media", {
			required: true,
			trim: false
		});
		return await handleDiscordAction({
			action: "stickerUpload",
			accountId: accountId ?? void 0,
			guildId,
			name,
			description,
			tags,
			mediaUrl
		}, cfg);
	}
	if (action === "role-add" || action === "role-remove") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const userId = readStringParam(actionParams, "userId", { required: true });
		const roleId = readStringParam(actionParams, "roleId", { required: true });
		return await handleDiscordAction({
			action: action === "role-add" ? "roleAdd" : "roleRemove",
			accountId: accountId ?? void 0,
			guildId,
			userId,
			roleId
		}, cfg);
	}
	if (action === "channel-info") {
		const channelId = readStringParam(actionParams, "channelId", { required: true });
		return await handleDiscordAction({
			action: "channelInfo",
			accountId: accountId ?? void 0,
			channelId
		}, cfg);
	}
	if (action === "channel-list") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		return await handleDiscordAction({
			action: "channelList",
			accountId: accountId ?? void 0,
			guildId
		}, cfg);
	}
	if (action === "channel-create") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const name = readStringParam(actionParams, "name", { required: true });
		const type = readNumberParam(actionParams, "type", { integer: true });
		const parentId = readParentIdParam(actionParams);
		const topic = readStringParam(actionParams, "topic");
		const position = readNumberParam(actionParams, "position", { integer: true });
		const nsfw = typeof actionParams.nsfw === "boolean" ? actionParams.nsfw : void 0;
		return await handleDiscordAction({
			action: "channelCreate",
			accountId: accountId ?? void 0,
			guildId,
			name,
			type: type ?? void 0,
			parentId: parentId ?? void 0,
			topic: topic ?? void 0,
			position: position ?? void 0,
			nsfw
		}, cfg);
	}
	if (action === "channel-edit") {
		const channelId = readStringParam(actionParams, "channelId", { required: true });
		const name = readStringParam(actionParams, "name");
		const topic = readStringParam(actionParams, "topic");
		const position = readNumberParam(actionParams, "position", { integer: true });
		const parentId = readParentIdParam(actionParams);
		const nsfw = typeof actionParams.nsfw === "boolean" ? actionParams.nsfw : void 0;
		const rateLimitPerUser = readNumberParam(actionParams, "rateLimitPerUser", { integer: true });
		const archived = typeof actionParams.archived === "boolean" ? actionParams.archived : void 0;
		const locked = typeof actionParams.locked === "boolean" ? actionParams.locked : void 0;
		const autoArchiveDuration = readNumberParam(actionParams, "autoArchiveDuration", { integer: true });
		const availableTags = parseAvailableTags(actionParams.availableTags);
		return await handleDiscordAction({
			action: "channelEdit",
			accountId: accountId ?? void 0,
			channelId,
			name: name ?? void 0,
			topic: topic ?? void 0,
			position: position ?? void 0,
			parentId: parentId === void 0 ? void 0 : parentId,
			nsfw,
			rateLimitPerUser: rateLimitPerUser ?? void 0,
			archived,
			locked,
			autoArchiveDuration: autoArchiveDuration ?? void 0,
			availableTags
		}, cfg);
	}
	if (action === "channel-delete") {
		const channelId = readStringParam(actionParams, "channelId", { required: true });
		return await handleDiscordAction({
			action: "channelDelete",
			accountId: accountId ?? void 0,
			channelId
		}, cfg);
	}
	if (action === "channel-move") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const channelId = readStringParam(actionParams, "channelId", { required: true });
		const parentId = readParentIdParam(actionParams);
		const position = readNumberParam(actionParams, "position", { integer: true });
		return await handleDiscordAction({
			action: "channelMove",
			accountId: accountId ?? void 0,
			guildId,
			channelId,
			parentId: parentId === void 0 ? void 0 : parentId,
			position: position ?? void 0
		}, cfg);
	}
	if (action === "category-create") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const name = readStringParam(actionParams, "name", { required: true });
		const position = readNumberParam(actionParams, "position", { integer: true });
		return await handleDiscordAction({
			action: "categoryCreate",
			accountId: accountId ?? void 0,
			guildId,
			name,
			position: position ?? void 0
		}, cfg);
	}
	if (action === "category-edit") {
		const categoryId = readStringParam(actionParams, "categoryId", { required: true });
		const name = readStringParam(actionParams, "name");
		const position = readNumberParam(actionParams, "position", { integer: true });
		return await handleDiscordAction({
			action: "categoryEdit",
			accountId: accountId ?? void 0,
			categoryId,
			name: name ?? void 0,
			position: position ?? void 0
		}, cfg);
	}
	if (action === "category-delete") {
		const categoryId = readStringParam(actionParams, "categoryId", { required: true });
		return await handleDiscordAction({
			action: "categoryDelete",
			accountId: accountId ?? void 0,
			categoryId
		}, cfg);
	}
	if (action === "voice-status") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const userId = readStringParam(actionParams, "userId", { required: true });
		return await handleDiscordAction({
			action: "voiceStatus",
			accountId: accountId ?? void 0,
			guildId,
			userId
		}, cfg);
	}
	if (action === "event-list") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		return await handleDiscordAction({
			action: "eventList",
			accountId: accountId ?? void 0,
			guildId
		}, cfg);
	}
	if (action === "event-create") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const name = readStringParam(actionParams, "eventName", { required: true });
		const startTime = readStringParam(actionParams, "startTime", { required: true });
		const endTime = readStringParam(actionParams, "endTime");
		const description = readStringParam(actionParams, "desc");
		const channelId = readStringParam(actionParams, "channelId");
		const location = readStringParam(actionParams, "location");
		const entityType = readStringParam(actionParams, "eventType");
		const image = readStringParam(actionParams, "image", { trim: false });
		return await handleDiscordAction({
			action: "eventCreate",
			accountId: accountId ?? void 0,
			guildId,
			name,
			startTime,
			endTime,
			description,
			channelId,
			location,
			entityType,
			image
		}, cfg, { mediaLocalRoots: ctx.mediaLocalRoots });
	}
	if (isDiscordModerationAction(action)) {
		const moderation = readDiscordModerationCommand(action, {
			...actionParams,
			durationMinutes: readNumberParam(actionParams, "durationMin", { integer: true }),
			deleteMessageDays: readNumberParam(actionParams, "deleteDays", { integer: true })
		});
		const senderUserId = normalizeOptionalString(ctx.requesterSenderId);
		return await handleDiscordAction({
			action: moderation.action,
			accountId: accountId ?? void 0,
			guildId: moderation.guildId,
			userId: moderation.userId,
			durationMinutes: moderation.durationMinutes,
			until: moderation.until,
			reason: moderation.reason,
			deleteMessageDays: moderation.deleteMessageDays,
			senderUserId
		}, cfg);
	}
	if (action === "thread-list") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const channelId = readStringParam(actionParams, "channelId");
		const includeArchived = typeof actionParams.includeArchived === "boolean" ? actionParams.includeArchived : void 0;
		const before = readStringParam(actionParams, "before");
		const limit = readNumberParam(actionParams, "limit", { integer: true });
		return await handleDiscordAction({
			action: "threadList",
			accountId: accountId ?? void 0,
			guildId,
			channelId,
			includeArchived,
			before,
			limit
		}, cfg);
	}
	if (action === "thread-reply") {
		const content = readStringParam(actionParams, "message", { required: true });
		const mediaUrl = readStringParam(actionParams, "media", { trim: false });
		const replyTo = readStringParam(actionParams, "replyTo");
		const channelId = readStringParam(actionParams, "threadId") ?? resolveChannelId();
		return await handleDiscordAction({
			action: "threadReply",
			accountId: accountId ?? void 0,
			channelId,
			content,
			mediaUrl: mediaUrl ?? void 0,
			replyTo: replyTo ?? void 0
		}, cfg);
	}
	if (action === "search") {
		const guildId = readStringParam(actionParams, "guildId", { required: true });
		const query = readStringParam(actionParams, "query", { required: true });
		return await handleDiscordAction({
			action: "searchMessages",
			accountId: accountId ?? void 0,
			guildId,
			content: query,
			channelId: readStringParam(actionParams, "channelId"),
			channelIds: readStringArrayParam(actionParams, "channelIds"),
			authorId: readStringParam(actionParams, "authorId"),
			authorIds: readStringArrayParam(actionParams, "authorIds"),
			limit: readNumberParam(actionParams, "limit", { integer: true })
		}, cfg);
	}
}
//#endregion
//#region extensions/discord/src/actions/handle-action.ts
const providerId = "discord";
async function handleDiscordMessageAction(ctx) {
	const { action, params, cfg } = ctx;
	const accountId = ctx.accountId ?? readStringParam(params, "accountId");
	const actionOptions = {
		mediaAccess: ctx.mediaAccess,
		mediaLocalRoots: ctx.mediaLocalRoots,
		mediaReadFile: ctx.mediaReadFile
	};
	const resolveChannelId = () => resolveDiscordChannelId(readStringParam(params, "channelId") ?? readStringParam(params, "to", { required: true }));
	if (action === "send") {
		const to = readStringParam(params, "to", { required: true });
		const asVoice = readBooleanParam(params, "asVoice") === true;
		const rawComponents = params.components ?? buildDiscordInteractiveComponents(normalizeInteractiveReply(params.interactive));
		const hasComponents = Boolean(rawComponents) && (typeof rawComponents === "function" || typeof rawComponents === "object");
		const components = hasComponents ? rawComponents : void 0;
		const content = readStringParam(params, "message", {
			required: !asVoice && !hasComponents,
			allowEmpty: true
		});
		const mediaUrl = readStringParam(params, "media", { trim: false }) ?? readStringParam(params, "path", { trim: false }) ?? readStringParam(params, "filePath", { trim: false });
		const filename = readStringParam(params, "filename");
		const replyTo = readStringParam(params, "replyTo");
		const rawEmbeds = params.embeds;
		const embeds = Array.isArray(rawEmbeds) ? rawEmbeds : void 0;
		const silent = readBooleanParam(params, "silent") === true;
		const sessionKey = readStringParam(params, "__sessionKey");
		const agentId = readStringParam(params, "__agentId");
		return await handleDiscordAction({
			action: "sendMessage",
			accountId: accountId ?? void 0,
			to,
			content,
			mediaUrl: mediaUrl ?? void 0,
			filename: filename ?? void 0,
			replyTo: replyTo ?? void 0,
			components,
			embeds,
			asVoice,
			silent,
			__sessionKey: sessionKey ?? void 0,
			__agentId: agentId ?? void 0
		}, cfg, actionOptions);
	}
	if (action === "poll") {
		const to = readStringParam(params, "to", { required: true });
		const question = readStringParam(params, "pollQuestion", { required: true });
		const answers = readStringArrayParam(params, "pollOption", { required: true });
		const allowMultiselect = readBooleanParam(params, "pollMulti");
		const durationHours = readNumberParam(params, "pollDurationHours", {
			integer: true,
			strict: true
		});
		return await handleDiscordAction({
			action: "poll",
			accountId: accountId ?? void 0,
			to,
			question,
			answers,
			allowMultiselect,
			durationHours: durationHours ?? void 0,
			content: readStringParam(params, "message")
		}, cfg, actionOptions);
	}
	if (action === "react") {
		const messageId = normalizeOptionalStringifiedId(resolveReactionMessageId({
			args: params,
			toolContext: ctx.toolContext
		})) ?? "";
		if (!messageId) throw new Error("messageId required. Provide messageId explicitly or react to the current inbound message.");
		const emoji = readStringParam(params, "emoji", { allowEmpty: true });
		const remove = readBooleanParam(params, "remove");
		return await handleDiscordAction({
			action: "react",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			messageId,
			emoji,
			remove
		}, cfg, actionOptions);
	}
	if (action === "reactions") {
		const messageId = readStringParam(params, "messageId", { required: true });
		const limit = readNumberParam(params, "limit", { integer: true });
		return await handleDiscordAction({
			action: "reactions",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			messageId,
			limit
		}, cfg, actionOptions);
	}
	if (action === "read") {
		const limit = readNumberParam(params, "limit", { integer: true });
		return await handleDiscordAction({
			action: "readMessages",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			limit,
			before: readStringParam(params, "before"),
			after: readStringParam(params, "after"),
			around: readStringParam(params, "around")
		}, cfg, actionOptions);
	}
	if (action === "edit") {
		const messageId = readStringParam(params, "messageId", { required: true });
		const content = readStringParam(params, "message", { required: true });
		return await handleDiscordAction({
			action: "editMessage",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			messageId,
			content
		}, cfg, actionOptions);
	}
	if (action === "delete") {
		const messageId = readStringParam(params, "messageId", { required: true });
		return await handleDiscordAction({
			action: "deleteMessage",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			messageId
		}, cfg, actionOptions);
	}
	if (action === "pin" || action === "unpin" || action === "list-pins") {
		const messageId = action === "list-pins" ? void 0 : readStringParam(params, "messageId", { required: true });
		return await handleDiscordAction({
			action: action === "pin" ? "pinMessage" : action === "unpin" ? "unpinMessage" : "listPins",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			messageId
		}, cfg, actionOptions);
	}
	if (action === "permissions") return await handleDiscordAction({
		action: "permissions",
		accountId: accountId ?? void 0,
		channelId: resolveChannelId()
	}, cfg, actionOptions);
	if (action === "thread-create") {
		const name = readStringParam(params, "threadName", { required: true });
		const messageId = readStringParam(params, "messageId");
		const content = readStringParam(params, "message");
		const autoArchiveMinutes = readNumberParam(params, "autoArchiveMin", { integer: true });
		const appliedTags = readStringArrayParam(params, "appliedTags");
		return await handleDiscordAction({
			action: "threadCreate",
			accountId: accountId ?? void 0,
			channelId: resolveChannelId(),
			name,
			messageId,
			content,
			autoArchiveMinutes,
			appliedTags: appliedTags ?? void 0
		}, cfg, actionOptions);
	}
	if (action === "sticker") {
		const stickerIds = readStringArrayParam(params, "stickerId", {
			required: true,
			label: "sticker-id"
		}) ?? [];
		return await handleDiscordAction({
			action: "sticker",
			accountId: accountId ?? void 0,
			to: readStringParam(params, "to", { required: true }),
			stickerIds,
			content: readStringParam(params, "message")
		}, cfg, actionOptions);
	}
	if (action === "set-presence") return await handleDiscordAction({
		action: "setPresence",
		accountId: accountId ?? void 0,
		status: readStringParam(params, "status"),
		activityType: readStringParam(params, "activityType"),
		activityName: readStringParam(params, "activityName"),
		activityUrl: readStringParam(params, "activityUrl"),
		activityState: readStringParam(params, "activityState")
	}, cfg, actionOptions);
	const adminResult = await tryHandleDiscordMessageActionGuildAdmin({
		ctx,
		resolveChannelId,
		readParentIdParam: readDiscordParentIdParam
	});
	if (adminResult !== void 0) return adminResult;
	throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
}
//#endregion
export { DISCORD_COMPONENT_ATTACHMENT_PREFIX, DISCORD_COMPONENT_CUSTOM_ID_KEY, DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS, DISCORD_DEFAULT_LISTENER_TIMEOUT_MS, DISCORD_MODAL_CUSTOM_ID_KEY, DiscordFormModal, buildDiscordComponentCustomId, buildDiscordComponentMessage, buildDiscordComponentMessageFlags, buildDiscordInteractiveComponents, buildDiscordModalCustomId, collectDiscordSecurityAuditFindings, collectDiscordStatusIssues, createDiscordActionGate, createDiscordFormModal, discordPlugin, discordSetupPlugin, fetchDiscordApplicationId, fetchDiscordApplicationSummary, fetchPluralKitMessageInfo, formatDiscordComponentEventText, getDiscordExecApprovalApprovers, handleDiscordMessageAction, handleDiscordSubagentDeliveryTarget, handleDiscordSubagentEnded, handleDiscordSubagentSpawning, inspectDiscordAccount, isDiscordExecApprovalApprover, isDiscordExecApprovalClientEnabled, listDiscordAccountIds, listDiscordDirectoryGroupsFromConfig, listDiscordDirectoryPeersFromConfig, listEnabledDiscordAccounts, looksLikeDiscordTargetId, mergeDiscordAccountConfig, normalizeDiscordMessagingTarget, normalizeDiscordOutboundTarget, normalizeExplicitDiscordSessionKey, parseApplicationIdFromToken, parseDiscordComponentCustomId, parseDiscordComponentCustomIdForCarbon, parseDiscordModalCustomId, parseDiscordModalCustomIdForCarbon, parseDiscordTarget, probeDiscord, readDiscordComponentSpec, resolveDefaultDiscordAccountId, resolveDiscordAccount, resolveDiscordAccountConfig, resolveDiscordChannelId, resolveDiscordComponentAttachmentName, resolveDiscordGroupRequireMention, resolveDiscordGroupToolPolicy, resolveDiscordMaxLinesPerMessage, resolveDiscordPrivilegedIntentsFromFlags, resolveDiscordRuntimeGroupPolicy, resolveDiscordTarget, shouldSuppressLocalDiscordExecApprovalPrompt, tryHandleDiscordMessageActionGuildAdmin };
