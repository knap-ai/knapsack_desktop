import { a as resolveDefaultDiscordAccountId } from "./accounts-zcI4mtzH.js";
import { i as resolveTimestampMs, n as formatDiscordUserTag, r as resolveDiscordSystemLocation } from "./format-DUBG2sP4.js";
import { d as resolveDiscordMemberAccessState, g as resolveGroupDmAllow, h as resolveDiscordShouldRequireMention, i as normalizeDiscordSlug, n as isDiscordGroupAllowedByPolicy, p as resolveDiscordOwnerAccess, s as resolveDiscordChannelConfigWithFallback, u as resolveDiscordGuildEntry } from "./allow-list-CuKLSnAf.js";
import { t as resolveDiscordConversationIdentity } from "./conversation-identity-CDGuG1Sg.js";
import { l as isRecentlyUnboundThreadWebhookMessage } from "./thread-bindings.state-DuxVx5Uu.js";
import "./thread-bindings-C4r9FA8X.js";
import { d as resolveDiscordChannelInfoSafe, f as resolveDiscordChannelNameSafe, o as resolveDiscordMessageChannelId, r as resolveDiscordChannelInfo, s as resolveDiscordMessageText } from "./message-utils-CJUMRDQq.js";
import { a as handleDiscordDmCommandDecision, i as resolveDiscordEffectiveRoute, o as resolveDiscordDmCommandAccess, r as resolveDiscordConversationRoute, t as buildDiscordRoutePeer } from "./route-resolution-DbV7TvS1.js";
import { n as resolveDiscordWebhookId, t as resolveDiscordSenderIdentity } from "./sender-identity-C3SQAEOO.js";
import { logDebug, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { Routes } from "discord-api-types/v10";
import { ChannelType as ChannelType$1, MessageType } from "@buape/carbon";
import { isDangerousNameMatchingEnabled } from "openclaw/plugin-sdk/config-runtime";
import { enqueueSystemEvent, recordChannelActivity } from "openclaw/plugin-sdk/infra-runtime";
import { getChildLogger, logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { formatAllowlistMatchMeta } from "openclaw/plugin-sdk/allow-from";
import { buildMentionRegexes, implicitMentionKindWhen, logInboundDrop, matchesMentionWithExplicit, resolveInboundMentionDecision } from "openclaw/plugin-sdk/channel-inbound";
import { resolveControlCommandGate } from "openclaw/plugin-sdk/command-auth-native";
import { hasControlCommand } from "openclaw/plugin-sdk/command-detection";
import { shouldHandleTextCommands } from "openclaw/plugin-sdk/command-surface";
import { recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
//#region extensions/discord/src/monitor/message-handler.preflight.ts
const DISCORD_BOUND_THREAD_SYSTEM_PREFIXES = [
	"⚙️",
	"🤖",
	"🧰"
];
let conversationRuntimePromise;
let pluralkitRuntimePromise;
let discordSendRuntimePromise;
let preflightAudioRuntimePromise;
let systemEventsRuntimePromise;
let discordThreadingRuntimePromise;
async function loadConversationRuntime() {
	conversationRuntimePromise ??= import("openclaw/plugin-sdk/conversation-binding-runtime");
	return await conversationRuntimePromise;
}
async function loadPluralKitRuntime() {
	pluralkitRuntimePromise ??= import("./pluralkit-AF_sGygZ.js").then((n) => n.n);
	return await pluralkitRuntimePromise;
}
async function loadDiscordSendRuntime() {
	discordSendRuntimePromise ??= import("./send-C92oy8jh.js").then((n) => n.t);
	return await discordSendRuntimePromise;
}
async function loadPreflightAudioRuntime() {
	preflightAudioRuntimePromise ??= import("./preflight-audio-BfIfX8EU.js");
	return await preflightAudioRuntimePromise;
}
async function loadSystemEventsRuntime() {
	systemEventsRuntimePromise ??= import("./system-events-lLFT-mGt.js");
	return await systemEventsRuntimePromise;
}
async function loadDiscordThreadingRuntime() {
	discordThreadingRuntimePromise ??= import("./threading-CrYVZmM2.js").then((n) => n.s);
	return await discordThreadingRuntimePromise;
}
function isPreflightAborted(abortSignal) {
	return Boolean(abortSignal?.aborted);
}
function isBoundThreadBotSystemMessage(params) {
	if (!params.isBoundThreadSession || !params.isBotAuthor) return false;
	const text = params.text?.trim();
	if (!text) return false;
	return DISCORD_BOUND_THREAD_SYSTEM_PREFIXES.some((prefix) => text.startsWith(prefix));
}
function isDiscordThreadChannelType(type) {
	return type === ChannelType$1.PublicThread || type === ChannelType$1.PrivateThread || type === ChannelType$1.AnnouncementThread;
}
function isDiscordThreadChannelMessage(params) {
	if (!params.isGuildMessage) return false;
	const channel = "channel" in params.message ? params.message.channel : void 0;
	return Boolean(channel && typeof channel === "object" && "isThread" in channel && typeof channel.isThread === "function" && channel.isThread() || isDiscordThreadChannelType(params.channelInfo?.type));
}
function resolveInjectedBoundThreadLookupRecord(params) {
	const getByThreadId = params.threadBindings.getByThreadId;
	if (typeof getByThreadId !== "function") return;
	const binding = getByThreadId(params.threadId);
	return binding && typeof binding === "object" ? binding : void 0;
}
function resolveDiscordMentionState(params) {
	if (params.isDirectMessage) return {
		implicitMentionKinds: [],
		wasMentioned: false
	};
	const wasMentioned = params.mentionedEveryone && (!params.authorIsBot || params.senderIsPluralKit) || matchesMentionWithExplicit({
		text: params.mentionText,
		mentionRegexes: params.mentionRegexes,
		explicit: {
			hasAnyMention: params.hasAnyMention,
			isExplicitlyMentioned: params.isExplicitlyMentioned,
			canResolveExplicit: Boolean(params.botId)
		},
		transcript: params.transcript
	});
	return {
		implicitMentionKinds: implicitMentionKindWhen("reply_to_bot", Boolean(params.botId) && Boolean(params.referencedAuthorId) && params.referencedAuthorId === params.botId),
		wasMentioned
	};
}
function resolvePreflightMentionRequirement(params) {
	if (!params.shouldRequireMention) return false;
	return !params.bypassMentionRequirement;
}
function shouldIgnoreBoundThreadWebhookMessage(params) {
	const webhookId = normalizeOptionalString(params.webhookId) ?? "";
	if (!webhookId) return false;
	const boundWebhookId = normalizeOptionalString(params.threadBinding?.webhookId) ?? normalizeOptionalString(params.threadBinding?.metadata?.webhookId) ?? "";
	if (!boundWebhookId) {
		const threadId = normalizeOptionalString(params.threadId) ?? "";
		if (!threadId) return false;
		return isRecentlyUnboundThreadWebhookMessage({
			accountId: params.accountId,
			threadId,
			webhookId
		});
	}
	return webhookId === boundWebhookId;
}
function mergeFetchedDiscordMessage(base, fetched) {
	const baseReferenced = base.referencedMessage;
	const fetchedMentions = Array.isArray(fetched.mentions) ? fetched.mentions.map((mention) => ({
		...mention,
		globalName: mention.global_name ?? void 0
	})) : void 0;
	const assignWithPrototype = (baseObject, ...sources) => Object.assign(Object.create(Object.getPrototypeOf(baseObject) ?? Object.prototype), baseObject, ...sources);
	const referencedMessage = fetched.referenced_message ? assignWithPrototype(base.referencedMessage ?? {}, fetched.referenced_message, {
		mentionedUsers: Array.isArray(fetched.referenced_message.mentions) ? fetched.referenced_message.mentions.map((mention) => ({
			...mention,
			globalName: mention.global_name ?? void 0
		})) : baseReferenced?.mentionedUsers ?? [],
		mentionedRoles: fetched.referenced_message.mention_roles ?? baseReferenced?.mentionedRoles ?? [],
		mentionedEveryone: fetched.referenced_message.mention_everyone ?? baseReferenced?.mentionedEveryone ?? false
	}) : base.referencedMessage;
	const baseRawData = base.rawData;
	const rawData = {
		...base.rawData,
		message_snapshots: fetched.message_snapshots ?? base.rawData?.message_snapshots,
		sticker_items: fetched.sticker_items ?? baseRawData?.sticker_items
	};
	return assignWithPrototype(base, fetched, {
		content: fetched.content ?? base.content,
		attachments: fetched.attachments ?? base.attachments,
		embeds: fetched.embeds ?? base.embeds,
		stickers: fetched.stickers ?? fetched.sticker_items ?? base.stickers,
		mentionedUsers: fetchedMentions ?? base.mentionedUsers,
		mentionedRoles: fetched.mention_roles ?? base.mentionedRoles,
		mentionedEveryone: fetched.mention_everyone ?? base.mentionedEveryone,
		referencedMessage,
		rawData
	});
}
function shouldHydrateDiscordMessage(params) {
	const currentText = resolveDiscordMessageText(params.message, { includeForwarded: true });
	if (!currentText) return true;
	if ((params.message.mentionedUsers?.length ?? 0) > 0 || (params.message.mentionedRoles?.length ?? 0) > 0 || params.message.mentionedEveryone) return false;
	return /<@!?\d+>|<@&\d+>|@everyone|@here/u.test(currentText);
}
async function hydrateDiscordMessageIfNeeded(params) {
	if (!shouldHydrateDiscordMessage({ message: params.message })) return params.message;
	const rest = params.client.rest;
	if (typeof rest?.get !== "function") return params.message;
	try {
		const fetched = await rest.get(Routes.channelMessage(params.messageChannelId, params.message.id));
		if (!fetched) return params.message;
		logVerbose(`discord: hydrated inbound payload via REST for ${params.message.id}`);
		return mergeFetchedDiscordMessage(params.message, fetched);
	} catch (err) {
		logVerbose(`discord: failed to hydrate message ${params.message.id}: ${String(err)}`);
		return params.message;
	}
}
async function preflightDiscordMessage(params) {
	if (isPreflightAborted(params.abortSignal)) return null;
	const logger = getChildLogger({ module: "discord-auto-reply" });
	let message = params.data.message;
	const author = params.data.author;
	if (!author) return null;
	const messageChannelId = resolveDiscordMessageChannelId({
		message,
		eventChannelId: params.data.channel_id
	});
	if (!messageChannelId) {
		logVerbose(`discord: drop message ${message.id} (missing channel id)`);
		return null;
	}
	const allowBotsSetting = params.discordConfig?.allowBots;
	const allowBotsMode = allowBotsSetting === "mentions" ? "mentions" : allowBotsSetting === true ? "all" : "off";
	if (params.botUserId && author.id === params.botUserId) return null;
	message = await hydrateDiscordMessageIfNeeded({
		client: params.client,
		message,
		messageChannelId
	});
	if (isPreflightAborted(params.abortSignal)) return null;
	const pluralkitConfig = params.discordConfig?.pluralkit;
	const webhookId = resolveDiscordWebhookId(message);
	const shouldCheckPluralKit = Boolean(pluralkitConfig?.enabled) && !webhookId;
	let pluralkitInfo = null;
	if (shouldCheckPluralKit) try {
		const { fetchPluralKitMessageInfo } = await loadPluralKitRuntime();
		pluralkitInfo = await fetchPluralKitMessageInfo({
			messageId: message.id,
			config: pluralkitConfig
		});
		if (isPreflightAborted(params.abortSignal)) return null;
	} catch (err) {
		logVerbose(`discord: pluralkit lookup failed for ${message.id}: ${String(err)}`);
	}
	const sender = resolveDiscordSenderIdentity({
		author,
		member: params.data.member,
		pluralkitInfo
	});
	if (author.bot) {
		if (allowBotsMode === "off" && !sender.isPluralKit) {
			logVerbose("discord: drop bot message (allowBots=false)");
			return null;
		}
	}
	const isGuildMessage = Boolean(params.data.guild_id);
	const channelInfo = await resolveDiscordChannelInfo(params.client, messageChannelId);
	if (isPreflightAborted(params.abortSignal)) return null;
	const isDirectMessage = channelInfo?.type === ChannelType$1.DM;
	const isGroupDm = channelInfo?.type === ChannelType$1.GroupDM;
	const messageText = resolveDiscordMessageText(message, { includeForwarded: true });
	const injectedBoundThreadBinding = !isDirectMessage && !isGroupDm ? resolveInjectedBoundThreadLookupRecord({
		threadBindings: params.threadBindings,
		threadId: messageChannelId
	}) : void 0;
	if (shouldIgnoreBoundThreadWebhookMessage({
		accountId: params.accountId,
		threadId: messageChannelId,
		webhookId,
		threadBinding: injectedBoundThreadBinding
	})) {
		logVerbose(`discord: drop bound-thread webhook echo message ${message.id}`);
		return null;
	}
	if (isBoundThreadBotSystemMessage({
		isBoundThreadSession: Boolean(injectedBoundThreadBinding) && isDiscordThreadChannelMessage({
			isGuildMessage,
			message,
			channelInfo
		}),
		isBotAuthor: Boolean(author.bot),
		text: messageText
	})) {
		logVerbose(`discord: drop bound-thread bot system message ${message.id}`);
		return null;
	}
	const data = message === params.data.message ? params.data : {
		...params.data,
		message
	};
	logDebug(`[discord-preflight] channelId=${messageChannelId} guild_id=${params.data.guild_id} channelType=${channelInfo?.type} isGuild=${isGuildMessage} isDM=${isDirectMessage} isGroupDm=${isGroupDm}`);
	if (isGroupDm && !params.groupDmEnabled) {
		logVerbose("discord: drop group dm (group dms disabled)");
		return null;
	}
	if (isDirectMessage && !params.dmEnabled) {
		logVerbose("discord: drop dm (dms disabled)");
		return null;
	}
	const dmPolicy = params.discordConfig?.dmPolicy ?? params.discordConfig?.dm?.policy ?? "pairing";
	const useAccessGroups = params.cfg.commands?.useAccessGroups !== false;
	const resolvedAccountId = params.accountId ?? resolveDefaultDiscordAccountId(params.cfg);
	const allowNameMatching = isDangerousNameMatchingEnabled(params.discordConfig);
	let commandAuthorized = true;
	if (isDirectMessage) {
		if (dmPolicy === "disabled") {
			logVerbose("discord: drop dm (dmPolicy: disabled)");
			return null;
		}
		const dmAccess = await resolveDiscordDmCommandAccess({
			accountId: resolvedAccountId,
			dmPolicy,
			configuredAllowFrom: params.allowFrom ?? [],
			sender: {
				id: sender.id,
				name: sender.name,
				tag: sender.tag
			},
			allowNameMatching,
			useAccessGroups
		});
		if (isPreflightAborted(params.abortSignal)) return null;
		commandAuthorized = dmAccess.commandAuthorized;
		if (dmAccess.decision !== "allow") {
			const allowMatchMeta = formatAllowlistMatchMeta(dmAccess.allowMatch.allowed ? dmAccess.allowMatch : void 0);
			await handleDiscordDmCommandDecision({
				dmAccess,
				accountId: resolvedAccountId,
				sender: {
					id: author.id,
					tag: formatDiscordUserTag(author),
					name: author.username ?? void 0
				},
				onPairingCreated: async (code) => {
					logVerbose(`discord pairing request sender=${author.id} tag=${formatDiscordUserTag(author)} (${allowMatchMeta})`);
					try {
						const conversationRuntime = await loadConversationRuntime();
						const { sendMessageDiscord } = await loadDiscordSendRuntime();
						await sendMessageDiscord(`user:${author.id}`, conversationRuntime.buildPairingReply({
							channel: "discord",
							idLine: `Your Discord user id: ${author.id}`,
							code
						}), {
							cfg: params.cfg,
							token: params.token,
							rest: params.client.rest,
							accountId: params.accountId
						});
					} catch (err) {
						logVerbose(`discord pairing reply failed for ${author.id}: ${String(err)}`);
					}
				},
				onUnauthorized: async () => {
					logVerbose(`Blocked unauthorized discord sender ${sender.id} (dmPolicy=${dmPolicy}, ${allowMatchMeta})`);
				}
			});
			return null;
		}
	}
	const botId = params.botUserId;
	const baseText = resolveDiscordMessageText(message, { includeForwarded: false });
	if (!isDirectMessage && baseText && hasControlCommand(baseText, params.cfg)) {
		logVerbose(`discord: drop text-based slash command ${message.id} (intercepted at gateway)`);
		return null;
	}
	recordChannelActivity({
		channel: "discord",
		accountId: params.accountId,
		direction: "inbound"
	});
	const channelName = channelInfo?.name ?? (isGuildMessage || isGroupDm ? resolveDiscordChannelNameSafe(message.channel) : void 0);
	const { resolveDiscordThreadChannel, resolveDiscordThreadParentInfo } = await loadDiscordThreadingRuntime();
	const earlyThreadChannel = resolveDiscordThreadChannel({
		isGuildMessage,
		message,
		channelInfo,
		messageChannelId
	});
	let earlyThreadParentId;
	let earlyThreadParentName;
	let earlyThreadParentType;
	if (earlyThreadChannel) {
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: params.client,
			threadChannel: earlyThreadChannel,
			channelInfo
		});
		if (isPreflightAborted(params.abortSignal)) return null;
		earlyThreadParentId = parentInfo.id;
		earlyThreadParentName = parentInfo.name;
		earlyThreadParentType = parentInfo.type;
	}
	const memberRoleIds = Array.isArray(params.data.rawMember?.roles) ? params.data.rawMember.roles : [];
	const conversationRuntime = await loadConversationRuntime();
	const route = resolveDiscordConversationRoute({
		cfg: params.cfg,
		accountId: params.accountId,
		guildId: params.data.guild_id ?? void 0,
		memberRoleIds,
		peer: buildDiscordRoutePeer({
			isDirectMessage,
			isGroupDm,
			directUserId: author.id,
			conversationId: messageChannelId
		}),
		parentConversationId: earlyThreadParentId
	});
	const bindingConversationId = isDirectMessage ? resolveDiscordConversationIdentity({
		isDirectMessage,
		userId: author.id
	}) ?? `user:${author.id}` : messageChannelId;
	let threadBinding;
	const runtimeRoute = conversationRuntime.resolveRuntimeConversationBindingRoute({
		route,
		conversation: {
			channel: "discord",
			accountId: params.accountId,
			conversationId: bindingConversationId,
			parentConversationId: earlyThreadParentId
		}
	});
	threadBinding = runtimeRoute.bindingRecord ?? void 0;
	const configuredRoute = threadBinding == null ? conversationRuntime.resolveConfiguredBindingRoute({
		cfg: params.cfg,
		route,
		conversation: {
			channel: "discord",
			accountId: params.accountId,
			conversationId: messageChannelId,
			parentConversationId: earlyThreadParentId
		}
	}) : null;
	const configuredBinding = configuredRoute?.bindingResolution ?? null;
	if (!threadBinding && configuredBinding) threadBinding = configuredBinding.record;
	if (shouldIgnoreBoundThreadWebhookMessage({
		accountId: params.accountId,
		threadId: messageChannelId,
		webhookId,
		threadBinding
	})) {
		logVerbose(`discord: drop bound-thread webhook echo message ${message.id}`);
		return null;
	}
	const boundSessionKey = conversationRuntime.isPluginOwnedSessionBindingRecord(threadBinding) ? "" : runtimeRoute.boundSessionKey ?? threadBinding?.targetSessionKey?.trim();
	const effectiveRoute = runtimeRoute.boundSessionKey ? runtimeRoute.route : resolveDiscordEffectiveRoute({
		route,
		boundSessionKey,
		configuredRoute,
		matchedBy: "binding.channel"
	});
	const boundAgentId = boundSessionKey ? effectiveRoute.agentId : void 0;
	const isBoundThreadSession = Boolean(threadBinding && earlyThreadChannel);
	const bypassMentionRequirement = isBoundThreadSession;
	if (isBoundThreadBotSystemMessage({
		isBoundThreadSession,
		isBotAuthor: Boolean(author.bot),
		text: messageText
	})) {
		logVerbose(`discord: drop bound-thread bot system message ${message.id}`);
		return null;
	}
	const mentionRegexes = buildMentionRegexes(params.cfg, effectiveRoute.agentId);
	const explicitlyMentioned = Boolean(botId && message.mentionedUsers?.some((user) => user.id === botId));
	const hasAnyMention = Boolean(!isDirectMessage && ((message.mentionedUsers?.length ?? 0) > 0 || (message.mentionedRoles?.length ?? 0) > 0 || message.mentionedEveryone && (!author.bot || sender.isPluralKit)));
	const hasUserOrRoleMention = !isDirectMessage && ((message.mentionedUsers?.length ?? 0) > 0 || (message.mentionedRoles?.length ?? 0) > 0);
	if (isGuildMessage && (message.type === MessageType.ChatInputCommand || message.type === MessageType.ContextMenuCommand)) {
		logVerbose("discord: drop channel command message");
		return null;
	}
	const guildInfo = isGuildMessage ? resolveDiscordGuildEntry({
		guild: params.data.guild ?? void 0,
		guildId: params.data.guild_id ?? void 0,
		guildEntries: params.guildEntries
	}) : null;
	logDebug(`[discord-preflight] guild_id=${params.data.guild_id} guild_obj=${!!params.data.guild} guild_obj_id=${params.data.guild?.id} guildInfo=${!!guildInfo} guildEntries=${params.guildEntries ? Object.keys(params.guildEntries).join(",") : "none"}`);
	if (isGuildMessage && params.guildEntries && Object.keys(params.guildEntries).length > 0 && !guildInfo) {
		logDebug(`[discord-preflight] guild blocked: guild_id=${params.data.guild_id} guildEntries keys=${Object.keys(params.guildEntries).join(",")}`);
		logVerbose(`Blocked discord guild ${params.data.guild_id ?? "unknown"} (not in discord.guilds)`);
		return null;
	}
	const threadChannel = earlyThreadChannel;
	const threadParentId = earlyThreadParentId;
	const threadParentName = earlyThreadParentName;
	const threadParentType = earlyThreadParentType;
	const threadName = threadChannel?.name;
	const configChannelName = threadParentName ?? channelName;
	const configChannelSlug = configChannelName ? normalizeDiscordSlug(configChannelName) : "";
	const displayChannelName = threadName ?? channelName;
	const displayChannelSlug = displayChannelName ? normalizeDiscordSlug(displayChannelName) : "";
	const guildSlug = guildInfo?.slug || (params.data.guild?.name ? normalizeDiscordSlug(params.data.guild.name) : "");
	const threadChannelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const threadParentSlug = threadParentName ? normalizeDiscordSlug(threadParentName) : "";
	const baseSessionKey = effectiveRoute.sessionKey;
	const channelConfig = isGuildMessage ? resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: messageChannelId,
		channelName,
		channelSlug: threadChannelSlug,
		parentId: threadParentId ?? void 0,
		parentName: threadParentName ?? void 0,
		parentSlug: threadParentSlug,
		scope: threadChannel ? "thread" : "channel"
	}) : null;
	const channelMatchMeta = formatAllowlistMatchMeta(channelConfig);
	if (shouldLogVerbose()) logDebug(`[discord-preflight] channelConfig=${channelConfig ? `allowed=${channelConfig.allowed} enabled=${channelConfig.enabled ?? "unset"} requireMention=${channelConfig.requireMention ?? "unset"} ignoreOtherMentions=${channelConfig.ignoreOtherMentions ?? "unset"} matchKey=${channelConfig.matchKey ?? "none"} matchSource=${channelConfig.matchSource ?? "none"} users=${channelConfig.users?.length ?? 0} roles=${channelConfig.roles?.length ?? 0} skills=${channelConfig.skills?.length ?? 0}` : "none"} channelMatchMeta=${channelMatchMeta} channelId=${messageChannelId}`);
	if (isGuildMessage && channelConfig?.enabled === false) {
		logDebug(`[discord-preflight] drop: channel disabled`);
		logVerbose(`Blocked discord channel ${messageChannelId} (channel disabled, ${channelMatchMeta})`);
		return null;
	}
	const groupDmAllowed = isGroupDm && resolveGroupDmAllow({
		channels: params.groupDmChannels,
		channelId: messageChannelId,
		channelName: displayChannelName,
		channelSlug: displayChannelSlug
	});
	if (isGroupDm && !groupDmAllowed) return null;
	const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
	const channelAllowed = channelConfig?.allowed !== false;
	if (isGuildMessage && !isDiscordGroupAllowedByPolicy({
		groupPolicy: params.groupPolicy,
		guildAllowlisted: Boolean(guildInfo),
		channelAllowlistConfigured,
		channelAllowed
	})) {
		if (params.groupPolicy === "disabled") {
			logDebug(`[discord-preflight] drop: groupPolicy disabled`);
			logVerbose(`discord: drop guild message (groupPolicy: disabled, ${channelMatchMeta})`);
		} else if (!channelAllowlistConfigured) {
			logDebug(`[discord-preflight] drop: groupPolicy allowlist, no channel allowlist configured`);
			logVerbose(`discord: drop guild message (groupPolicy: allowlist, no channel allowlist, ${channelMatchMeta})`);
		} else {
			logDebug(`[discord] Ignored message from channel ${messageChannelId} (not in guild allowlist). Add to guilds.<guildId>.channels to enable.`);
			logVerbose(`Blocked discord channel ${messageChannelId} not in guild channel allowlist (groupPolicy: allowlist, ${channelMatchMeta})`);
		}
		return null;
	}
	if (isGuildMessage && channelConfig?.allowed === false) {
		logDebug(`[discord-preflight] drop: channelConfig.allowed===false`);
		logVerbose(`Blocked discord channel ${messageChannelId} not in guild channel allowlist (${channelMatchMeta})`);
		return null;
	}
	if (isGuildMessage) {
		logDebug(`[discord-preflight] pass: channel allowed`);
		logVerbose(`discord: allow channel ${messageChannelId} (${channelMatchMeta})`);
	}
	const textForHistory = resolveDiscordMessageText(message, { includeForwarded: true });
	const historyEntry = isGuildMessage && params.historyLimit > 0 && textForHistory ? {
		sender: sender.label,
		body: textForHistory,
		timestamp: resolveTimestampMs(message.timestamp),
		messageId: message.id
	} : void 0;
	const threadOwnerId = threadChannel ? resolveDiscordChannelInfoSafe(threadChannel).ownerId ?? channelInfo?.ownerId : void 0;
	const shouldRequireMentionByConfig = resolveDiscordShouldRequireMention({
		isGuildMessage,
		isThread: Boolean(threadChannel),
		botId,
		threadOwnerId,
		channelConfig,
		guildInfo
	});
	const shouldRequireMention = resolvePreflightMentionRequirement({
		shouldRequireMention: shouldRequireMentionByConfig,
		bypassMentionRequirement
	});
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds,
		sender,
		allowNameMatching
	});
	if (isGuildMessage && hasAccessRestrictions && !memberAllowed) {
		logDebug(`[discord-preflight] drop: member not allowed`);
		logVerbose("Blocked discord guild sender (not in users/roles allowlist)");
		return null;
	}
	const { resolveDiscordPreflightAudioMentionContext } = await loadPreflightAudioRuntime();
	const { hasTypedText, transcript: preflightTranscript } = await resolveDiscordPreflightAudioMentionContext({
		message,
		isDirectMessage,
		shouldRequireMention,
		mentionRegexes,
		cfg: params.cfg,
		abortSignal: params.abortSignal
	});
	if (isPreflightAborted(params.abortSignal)) return null;
	const mentionText = hasTypedText ? baseText : "";
	const { implicitMentionKinds, wasMentioned } = resolveDiscordMentionState({
		authorIsBot: Boolean(author.bot),
		botId,
		hasAnyMention,
		isDirectMessage,
		isExplicitlyMentioned: explicitlyMentioned,
		mentionRegexes,
		mentionText,
		mentionedEveryone: Boolean(message.mentionedEveryone),
		referencedAuthorId: message.referencedMessage?.author?.id,
		senderIsPluralKit: sender.isPluralKit,
		transcript: preflightTranscript
	});
	if (shouldLogVerbose()) logVerbose(`discord: inbound id=${message.id} guild=${params.data.guild_id ?? "dm"} channel=${messageChannelId} mention=${wasMentioned ? "yes" : "no"} type=${isDirectMessage ? "dm" : isGroupDm ? "group-dm" : "guild"} content=${messageText ? "yes" : "no"}`);
	const allowTextCommands = shouldHandleTextCommands({
		cfg: params.cfg,
		surface: "discord"
	});
	const hasControlCommandInMessage = hasControlCommand(baseText, params.cfg);
	if (!isDirectMessage) {
		const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
			allowFrom: params.allowFrom,
			sender: {
				id: sender.id,
				name: sender.name,
				tag: sender.tag
			},
			allowNameMatching
		});
		const commandGate = resolveControlCommandGate({
			useAccessGroups,
			authorizers: [{
				configured: ownerAllowList != null,
				allowed: ownerOk
			}, {
				configured: hasAccessRestrictions,
				allowed: memberAllowed
			}],
			modeWhenAccessGroupsOff: "configured",
			allowTextCommands,
			hasControlCommand: hasControlCommandInMessage
		});
		commandAuthorized = commandGate.commandAuthorized;
		if (commandGate.shouldBlock) {
			logInboundDrop({
				log: logVerbose,
				channel: "discord",
				reason: "control command (unauthorized)",
				target: sender.id
			});
			return null;
		}
	}
	const canDetectMention = Boolean(botId) || mentionRegexes.length > 0;
	const mentionDecision = resolveInboundMentionDecision({
		facts: {
			canDetectMention,
			wasMentioned,
			hasAnyMention,
			implicitMentionKinds
		},
		policy: {
			isGroup: isGuildMessage,
			requireMention: shouldRequireMention,
			allowTextCommands,
			hasControlCommand: hasControlCommandInMessage,
			commandAuthorized
		}
	});
	const effectiveWasMentioned = mentionDecision.effectiveWasMentioned;
	logDebug(`[discord-preflight] shouldRequireMention=${shouldRequireMention} baseRequireMention=${shouldRequireMentionByConfig} boundThreadSession=${isBoundThreadSession} mentionDecision.shouldSkip=${mentionDecision.shouldSkip} wasMentioned=${wasMentioned}`);
	if (isGuildMessage && shouldRequireMention) {
		if (botId && mentionDecision.shouldSkip) {
			logDebug(`[discord-preflight] drop: no-mention`);
			logVerbose(`discord: drop guild message (mention required, botId=${botId})`);
			logger.info({
				channelId: messageChannelId,
				reason: "no-mention"
			}, "discord: skipping guild message");
			recordPendingHistoryEntryIfEnabled({
				historyMap: params.guildHistories,
				historyKey: messageChannelId,
				limit: params.historyLimit,
				entry: historyEntry ?? null
			});
			return null;
		}
	}
	if (author.bot && !sender.isPluralKit && allowBotsMode === "mentions") {
		if (!(isDirectMessage || wasMentioned || mentionDecision.implicitMention)) {
			logDebug(`[discord-preflight] drop: bot message missing mention (allowBots=mentions)`);
			logVerbose("discord: drop bot message (allowBots=mentions, missing mention)");
			return null;
		}
	}
	const ignoreOtherMentions = channelConfig?.ignoreOtherMentions ?? guildInfo?.ignoreOtherMentions ?? false;
	if (isGuildMessage && ignoreOtherMentions && hasUserOrRoleMention && !wasMentioned && !mentionDecision.implicitMention) {
		logDebug(`[discord-preflight] drop: other-mention`);
		logVerbose(`discord: drop guild message (another user/role mentioned, ignoreOtherMentions=true, botId=${botId})`);
		recordPendingHistoryEntryIfEnabled({
			historyMap: params.guildHistories,
			historyKey: messageChannelId,
			limit: params.historyLimit,
			entry: historyEntry ?? null
		});
		return null;
	}
	const systemLocation = resolveDiscordSystemLocation({
		isDirectMessage,
		isGroupDm,
		guild: params.data.guild ?? void 0,
		channelName: channelName ?? messageChannelId
	});
	const { resolveDiscordSystemEvent } = await loadSystemEventsRuntime();
	const systemText = resolveDiscordSystemEvent(message, systemLocation);
	if (systemText) {
		logDebug(`[discord-preflight] drop: system event`);
		enqueueSystemEvent(systemText, {
			sessionKey: effectiveRoute.sessionKey,
			contextKey: `discord:system:${messageChannelId}:${message.id}`
		});
		return null;
	}
	if (!messageText) {
		logDebug(`[discord-preflight] drop: empty content`);
		logVerbose(`discord: drop message ${message.id} (empty content)`);
		return null;
	}
	if (configuredBinding) {
		const ensured = await conversationRuntime.ensureConfiguredBindingRouteReady({
			cfg: params.cfg,
			bindingResolution: configuredBinding
		});
		if (!ensured.ok) {
			logVerbose(`discord: configured ACP binding unavailable for channel ${configuredBinding.record.conversation.conversationId}: ${ensured.error}`);
			return null;
		}
	}
	logDebug(`[discord-preflight] success: route=${effectiveRoute.agentId} sessionKey=${effectiveRoute.sessionKey}`);
	return {
		cfg: params.cfg,
		discordConfig: params.discordConfig,
		accountId: params.accountId,
		token: params.token,
		runtime: params.runtime,
		botUserId: params.botUserId,
		abortSignal: params.abortSignal,
		guildHistories: params.guildHistories,
		historyLimit: params.historyLimit,
		mediaMaxBytes: params.mediaMaxBytes,
		textLimit: params.textLimit,
		replyToMode: params.replyToMode,
		ackReactionScope: params.ackReactionScope,
		groupPolicy: params.groupPolicy,
		data,
		client: params.client,
		message,
		messageChannelId,
		author,
		sender,
		memberRoleIds,
		channelInfo,
		channelName,
		isGuildMessage,
		isDirectMessage,
		isGroupDm,
		commandAuthorized,
		baseText,
		messageText,
		wasMentioned,
		route: effectiveRoute,
		threadBinding,
		boundSessionKey: boundSessionKey || void 0,
		boundAgentId,
		guildInfo,
		guildSlug,
		threadChannel,
		threadParentId,
		threadParentName,
		threadParentType,
		threadName,
		configChannelName,
		configChannelSlug,
		displayChannelName,
		displayChannelSlug,
		baseSessionKey,
		channelConfig,
		channelAllowlistConfigured,
		channelAllowed,
		shouldRequireMention,
		hasAnyMention,
		allowTextCommands,
		shouldBypassMention: mentionDecision.shouldBypassMention,
		effectiveWasMentioned,
		canDetectMention,
		historyEntry,
		threadBindings: params.threadBindings,
		discordRestFetch: params.discordRestFetch
	};
}
//#endregion
export { preflightDiscordMessage, resolvePreflightMentionRequirement, shouldIgnoreBoundThreadWebhookMessage };
