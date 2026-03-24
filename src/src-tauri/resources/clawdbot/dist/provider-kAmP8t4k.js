import { o as __toESM } from "./chunk-DORXReHP.js";
import { i as testRegexWithBoundedInput, t as compileSafeRegex } from "./safe-regex-tLlDZYfM.js";
import { r as formatErrorMessage } from "./errors-BxyFnvP3.js";
import { C as resolveRequiredHomeDir, _ as resolveStateDir } from "./paths-ViKUYWUK.js";
import { a as logVerbose, d as warn, l as shouldLogVerbose, r as isVerbose, t as danger } from "./globals-DBUMOBZ8.js";
import { p as createNonExitingRuntime, t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { a as clearExpiredCooldowns, f as resolveProfilesUnavailableReason, s as isProfileInCooldown } from "./auth-profiles-DRuJBw5y.js";
import { _ as normalizeAccountId, u as resolveAgentIdFromSessionKey } from "./session-key-DAhnzjyr.js";
import { r as normalizeStringEntries } from "./string-normalization-CohoSMRS.js";
import { n as logError, t as logDebug } from "./logger-BmpSCz93.js";
import { r as normalizeProviderId } from "./provider-id-Cjha-r0T.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { r as withFileLock } from "./file-lock-DEiVq2ow.js";
import { c as ensureAuthProfileStore } from "./profiles-COPO-hHI.js";
import { l as normalizeMessageChannel } from "./message-channel-BliByQBl.js";
import { i as readSessionUpdatedAt, l as updateSessionStore, n as loadSessionStore } from "./store-C5UK26Ce.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { a as resolveNativeSkillsEnabled, i as resolveNativeCommandsEnabled, n as isNativeCommandsExplicitlyDisabled } from "./commands-C6oAw_H-.js";
import { i as resolveHumanDelayConfig } from "./identity-Dp-UIak4.js";
import { $i as setPresence, $y as resolveExecApprovalCommandDisplay, Ai as UserSelectMenu, Ar as stripUndefinedFields, Bi as ChannelType, Bn as parseDiscordModalCustomIdForCarbon, Br as resolveDiscordAllowListMatch, Ci as ReadyListener, Co as buildModelsProviderData, Di as ListenerEvent, Dv as resolveEnvelopeFormatOptions, Ei as VoiceStateUpdateListener, El as dispatchReplyWithDispatcher, Et as dispatchPluginInteractiveHandler, Fb as canonicalizeAllowlistWithResolvedIds, Fi as Command, Fn as createDiscordFormModal, Gi as ApplicationCommandOptionType, Gn as resolveDiscordModalEntry, Gr as resolveDiscordMemberAccessState, Hi as GatewayIntentBits, Hr as resolveDiscordChannelConfigWithFallback, Ii as ChannelSelectMenu, In as formatDiscordComponentEventText, Ji as Routes, Ki as ButtonStyle, Kr as resolveDiscordOwnerAccess, Lb as patchAllowlistUsersInConfigEntries, Li as Button, Ln as parseDiscordComponentCustomId, Lr as isDiscordGroupAllowedByPolicy, Mi as RoleSelectMenu, Nb as addAllowlistUserEntriesFromConfigEntry, Ni as MentionableSelectMenu, Oi as Client, Pb as buildAllowlistResolutionSummary, Pi as CommandWithSubcommands, QS as resolveDiscordAccount, Qr as formatDiscordUserTag, Rb as summarizeMapping, Ri as Plugin, Rn as parseDiscordComponentCustomIdForCarbon, Rr as normalizeDiscordAllowList, Si as PresenceUpdateListener, Ti as VoiceServerUpdateListener, Tl as dispatchReplyWithBufferedBlockDispatcher, Tv as formatInboundEnvelope, Ui as GatewayOpcodes$1, Vi as GatewayCloseCodes$1, Vy as wrapFetchWithAbortSignal, Wn as resolveDiscordComponentEntry, Wr as resolveDiscordGuildEntry, Xr as shouldEmitDiscordReactionNotification, Yr as resolveGroupDmAllow, Zn as formatMention, Zr as formatDiscordReactionEmoji, Zy as getExecApprovalApproverDmNoticeText, _i as GuildDeleteListener, bi as MessageReactionAddListener, ci as createDiscordClient, dh as executePluginCommand, di as chunkDiscordTextWithMode, eC as resolveDiscordMaxLinesPerMessage, fi as Separator, gi as Modal, hi as Row, ji as StringSelectMenu, ki as RateLimitError, lv as resolveNativeCommandSessionTargets, mi as Container, mn as unregisterGateway, ph as matchPluginCommand, pi as TextDisplay, pn as registerGateway, qi as ChannelType$1, tC as normalizeDiscordToken, vi as InteractionCreateListener, wi as ThreadUpdateListener, wl as createReplyReferencePlanner, wn as editDiscordComponentMessage, xi as MessageReactionRemoveListener, yh as getPluginCommandSpecs, yi as MessageCreateListener, zi as serializePayload, zn as parseDiscordModalCustomId, zr as normalizeDiscordSlug } from "./pi-embedded-CbCYZxIb.js";
import { i as resolveAgentRoute } from "./resolve-route-DwFWP4JW.js";
import { S as resolveTextChunkLimit, r as chunkItems, t as withTimeout, w as summarizeStringEntries, x as resolveChunkMode } from "./text-runtime-DVXt5xhi.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, i as resolveOpenProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "./runtime-group-policy-D8ugNNDZ.js";
import { F as resolvePluginConversationBindingApproval, N as parsePluginBindingApprovalCustomId, T as buildPluginBindingResolvedText, c as ensureConfiguredBindingRouteReady, l as resolveConfiguredBindingRoute, s as recordInboundSession, t as formatThreadBindingDurationLabel } from "./conversation-runtime-nmWgJSXS.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-BGKLrjo6.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "./json-store--JDX3zNL.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-BrG9NqjP.js";
import { n as buildPairingReply } from "./pairing-challenge-BNorDUO6.js";
import { c as resolvePinnedMainDmOwnerFromAllowlist, l as resolveCommandAuthorizedFromAuthorizers, n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-DtcQProI.js";
import { l as resolveMarkdownTableMode } from "./config-runtime-BYNizC50.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-BQW4HoPt.js";
import { o as resolveStoredModelOverride } from "./level-overrides-DzIzQ3ZY.js";
import { i as formatDurationSeconds } from "./format-duration-DwyQDycT.js";
import { r as enqueueSystemEvent } from "./system-events-BU_NYynX.js";
import { m as resolveTextChunksWithFallback, p as resolveSendableOutboundReplyParts } from "./reply-payload-CiQ7TPgp.js";
import { E as finalizeInboundContext } from "./templating-BDXRiJUh.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-BxH4-AP2.js";
import { c as listChatCommands, d as listNativeCommandSpecsForConfig, g as resolveCommandArgMenu, h as resolveCommandArgChoices, m as parseCommandArgs, n as buildCommandTextFromArgs, r as findCommandByNativeName, v as serializeCommandArgs } from "./commands-registry-Bh9pJ817.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-D73dGR_l.js";
import { o as getAgentScopedMediaLocalRoots, t as loadWebMedia } from "./web-media-PKy3RbRG.js";
import { n as createConnectedChannelStatusPatch, t as createOperatorApprovalsGatewayClient } from "./gateway-runtime-Dn2qAGY7.js";
import { a as createArmableStallWatchdog } from "./channel-lifecycle-DmiShiUP.js";
import { a as handleDiscordDmCommandDecision, b as buildDiscordGroupSystemPrompt, d as resolveDiscordThreadParentInfo, g as buildGuildLabel, h as buildDirectLabel, i as resolveDiscordEffectiveRoute, m as deliverDiscordReply, n as resolveDiscordBoundConversationRoute, o as resolveDiscordDmCommandAccess, s as sendTyping, v as resolveDiscordSenderIdentity, w as resolveDiscordChannelInfo, x as buildDiscordInboundAccessContext } from "./route-resolution-C9XDTDsW.js";
import { a as isThreadArchived } from "./thread-bindings.messages-C6WRAx05.js";
import { o as normalizeDiscordListenerTimeoutMs, s as runDiscordTaskWithTimeout } from "./timeouts-BnOxp0oI.js";
import { n as fetchDiscordApplicationId, t as DiscordUiContainer } from "./ui-BU9Tv965.js";
import { t as require_src } from "./src-VVAfbRUn.js";
import { t as resolveDiscordUserAllowlist } from "./resolve-users-D9S1NRZ1.js";
import { t as resolveDiscordChannelAllowlist } from "./resolve-channels-Cx3FRWkT.js";
import path from "node:path";
import os from "node:os";
import { inspect } from "node:util";
import WebSocket from "ws";
import { EventEmitter } from "node:events";
import { ProxyAgent, fetch as fetch$1 } from "undici";
import * as http from "http";
import { Agent as Agent$1 } from "https";
import { URL as URL$1 } from "url";
import assert from "assert";
import * as net from "net";
import * as tls from "tls";
//#region extensions/discord/src/monitor/thread-session-close.ts
/**
* Marks every session entry in the store whose key contains {@link threadId}
* as "reset" by setting `updatedAt` to 0.
*
* This mirrors how the daily / idle session reset works: zeroing `updatedAt`
* makes `evaluateSessionFreshness` treat the session as stale on the next
* inbound message, so the bot starts a fresh conversation without deleting
* any on-disk transcript history.
*/
async function closeDiscordThreadSessions(params) {
	const { cfg, accountId, threadId } = params;
	const normalizedThreadId = threadId.trim().toLowerCase();
	if (!normalizedThreadId) return 0;
	const segmentRe = new RegExp(`:${normalizedThreadId}(?::|$)`, "i");
	function sessionKeyContainsThreadId(key) {
		return segmentRe.test(key);
	}
	const storePath = resolveStorePath(cfg.session?.store, { agentId: accountId });
	let resetCount = 0;
	await updateSessionStore(storePath, (store) => {
		for (const [key, entry] of Object.entries(store)) {
			if (!entry || !sessionKeyContainsThreadId(key)) continue;
			if (entry.updatedAt === 0) continue;
			entry.updatedAt = 0;
			resetCount += 1;
		}
		return resetCount;
	});
	return resetCount;
}
//#endregion
//#region extensions/discord/src/monitor/listeners.ts
const DISCORD_SLOW_LISTENER_THRESHOLD_MS = 3e4;
const discordEventQueueLog = createSubsystemLogger("discord/event-queue");
function formatListenerContextValue(value) {
	if (value === void 0 || value === null) return null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
	return null;
}
function formatListenerContextSuffix(context) {
	if (!context) return "";
	const entries = Object.entries(context).flatMap(([key, value]) => {
		const formatted = formatListenerContextValue(value);
		return formatted ? [`${key}=${formatted}`] : [];
	});
	if (entries.length === 0) return "";
	return ` (${entries.join(" ")})`;
}
function logSlowDiscordListener(params) {
	if (params.durationMs < DISCORD_SLOW_LISTENER_THRESHOLD_MS) return;
	const duration = formatDurationSeconds(params.durationMs, {
		decimals: 1,
		unit: "seconds"
	});
	const message = `Slow listener detected: ${params.listener} took ${duration} for event ${params.event}`;
	(params.logger ?? discordEventQueueLog).warn("Slow listener detected", {
		listener: params.listener,
		event: params.event,
		durationMs: params.durationMs,
		duration,
		...params.context,
		consoleMessage: `${message}${formatListenerContextSuffix(params.context)}`
	});
}
async function runDiscordListenerWithSlowLog(params) {
	const startedAt = Date.now();
	const timeoutMs = normalizeDiscordListenerTimeoutMs(params.timeoutMs);
	const logger = params.logger ?? discordEventQueueLog;
	let timedOut = false;
	try {
		timedOut = await runDiscordTaskWithTimeout({
			run: params.run,
			timeoutMs,
			onTimeout: (resolvedTimeoutMs) => {
				logger.error(danger(`discord handler timed out after ${formatDurationSeconds(resolvedTimeoutMs, {
					decimals: 1,
					unit: "seconds"
				})}${formatListenerContextSuffix(params.context)}`));
			},
			onAbortAfterTimeout: () => {
				logger.warn(`discord handler canceled after timeout${formatListenerContextSuffix(params.context)}`);
			},
			onErrorAfterTimeout: (err) => {
				logger.error(danger(`discord handler failed after timeout: ${String(err)}${formatListenerContextSuffix(params.context)}`));
			}
		});
		if (timedOut) return;
	} catch (err) {
		if (params.onError) {
			params.onError(err);
			return;
		}
		throw err;
	} finally {
		if (!timedOut) logSlowDiscordListener({
			logger: params.logger,
			listener: params.listener,
			event: params.event,
			durationMs: Date.now() - startedAt,
			context: params.context
		});
	}
}
function registerDiscordListener(listeners, listener) {
	if (listeners.some((existing) => existing.constructor === listener.constructor)) return false;
	listeners.push(listener);
	return true;
}
var DiscordMessageListener = class extends MessageCreateListener {
	constructor(handler, logger, onEvent, _options) {
		super();
		this.handler = handler;
		this.logger = logger;
		this.onEvent = onEvent;
	}
	async handle(data, client) {
		this.onEvent?.();
		Promise.resolve().then(() => this.handler(data, client)).catch((err) => {
			(this.logger ?? discordEventQueueLog).error(danger(`discord handler failed: ${String(err)}`));
		});
	}
};
var DiscordReactionListener = class extends MessageReactionAddListener {
	constructor(params) {
		super();
		this.params = params;
	}
	async handle(data, client) {
		this.params.onEvent?.();
		await runDiscordReactionHandler({
			data,
			client,
			action: "added",
			handlerParams: this.params,
			listener: this.constructor.name,
			event: this.type
		});
	}
};
var DiscordReactionRemoveListener = class extends MessageReactionRemoveListener {
	constructor(params) {
		super();
		this.params = params;
	}
	async handle(data, client) {
		this.params.onEvent?.();
		await runDiscordReactionHandler({
			data,
			client,
			action: "removed",
			handlerParams: this.params,
			listener: this.constructor.name,
			event: this.type
		});
	}
};
async function runDiscordReactionHandler(params) {
	await runDiscordListenerWithSlowLog({
		logger: params.handlerParams.logger,
		listener: params.listener,
		event: params.event,
		run: async () => handleDiscordReactionEvent({
			data: params.data,
			client: params.client,
			action: params.action,
			cfg: params.handlerParams.cfg,
			accountId: params.handlerParams.accountId,
			botUserId: params.handlerParams.botUserId,
			dmEnabled: params.handlerParams.dmEnabled,
			groupDmEnabled: params.handlerParams.groupDmEnabled,
			groupDmChannels: params.handlerParams.groupDmChannels,
			dmPolicy: params.handlerParams.dmPolicy,
			allowFrom: params.handlerParams.allowFrom,
			groupPolicy: params.handlerParams.groupPolicy,
			allowNameMatching: params.handlerParams.allowNameMatching,
			guildEntries: params.handlerParams.guildEntries,
			logger: params.handlerParams.logger
		})
	});
}
async function authorizeDiscordReactionIngress(params) {
	if (params.isDirectMessage && !params.dmEnabled) return {
		allowed: false,
		reason: "dm-disabled"
	};
	if (params.isGroupDm && !params.groupDmEnabled) return {
		allowed: false,
		reason: "group-dm-disabled"
	};
	if (params.isDirectMessage) {
		const storeAllowFrom = await readStoreAllowFromForDmPolicy({
			provider: "discord",
			accountId: params.accountId,
			dmPolicy: params.dmPolicy
		});
		const access = resolveDmGroupAccessWithLists({
			isGroup: false,
			dmPolicy: params.dmPolicy,
			groupPolicy: params.groupPolicy,
			allowFrom: params.allowFrom,
			groupAllowFrom: [],
			storeAllowFrom,
			isSenderAllowed: (allowEntries) => {
				const allowList = normalizeDiscordAllowList(allowEntries, [
					"discord:",
					"user:",
					"pk:"
				]);
				return (allowList ? resolveDiscordAllowListMatch({
					allowList,
					candidate: {
						id: params.user.id,
						name: params.user.username,
						tag: formatDiscordUserTag(params.user)
					},
					allowNameMatching: params.allowNameMatching
				}) : { allowed: false }).allowed;
			}
		});
		if (access.decision !== "allow") return {
			allowed: false,
			reason: access.reason
		};
	}
	if (params.isGroupDm && !resolveGroupDmAllow({
		channels: params.groupDmChannels,
		channelId: params.channelId,
		channelName: params.channelName,
		channelSlug: params.channelSlug
	})) return {
		allowed: false,
		reason: "group-dm-not-allowlisted"
	};
	if (!params.isGuildMessage) return { allowed: true };
	const channelAllowlistConfigured = Boolean(params.guildInfo?.channels) && Object.keys(params.guildInfo?.channels ?? {}).length > 0;
	const channelAllowed = params.channelConfig?.allowed !== false;
	if (!isDiscordGroupAllowedByPolicy({
		groupPolicy: params.groupPolicy,
		guildAllowlisted: Boolean(params.guildInfo),
		channelAllowlistConfigured,
		channelAllowed
	})) return {
		allowed: false,
		reason: "guild-policy"
	};
	if (params.channelConfig?.allowed === false) return {
		allowed: false,
		reason: "guild-channel-denied"
	};
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig: params.channelConfig,
		guildInfo: params.guildInfo,
		memberRoleIds: params.memberRoleIds,
		sender: {
			id: params.user.id,
			name: params.user.username,
			tag: formatDiscordUserTag(params.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	if (hasAccessRestrictions && !memberAllowed) return {
		allowed: false,
		reason: "guild-member-denied"
	};
	return { allowed: true };
}
async function handleDiscordReactionEvent(params) {
	try {
		const { data, client, action, botUserId, guildEntries } = params;
		if (!("user" in data)) return;
		const user = data.user;
		if (!user || user.bot) return;
		if (botUserId && user.id === botUserId) return;
		const isGuildMessage = Boolean(data.guild_id);
		const guildInfo = isGuildMessage ? resolveDiscordGuildEntry({
			guild: data.guild ?? void 0,
			guildId: data.guild_id ?? void 0,
			guildEntries
		}) : null;
		if (isGuildMessage && guildEntries && Object.keys(guildEntries).length > 0 && !guildInfo) return;
		const channel = await client.fetchChannel(data.channel_id);
		if (!channel) return;
		const channelName = "name" in channel ? channel.name ?? void 0 : void 0;
		const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
		const channelType = "type" in channel ? channel.type : void 0;
		const isDirectMessage = channelType === ChannelType.DM;
		const isGroupDm = channelType === ChannelType.GroupDM;
		const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
		const memberRoleIds = Array.isArray(data.rawMember?.roles) ? data.rawMember.roles.map((roleId) => String(roleId)) : [];
		const reactionIngressBase = {
			accountId: params.accountId,
			user,
			memberRoleIds,
			isDirectMessage,
			isGroupDm,
			isGuildMessage,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			dmEnabled: params.dmEnabled,
			groupDmEnabled: params.groupDmEnabled,
			groupDmChannels: params.groupDmChannels,
			dmPolicy: params.dmPolicy,
			allowFrom: params.allowFrom,
			groupPolicy: params.groupPolicy,
			allowNameMatching: params.allowNameMatching,
			guildInfo
		};
		if (!isGuildMessage) {
			const ingressAccess = await authorizeDiscordReactionIngress(reactionIngressBase);
			if (!ingressAccess.allowed) {
				logVerbose(`discord reaction blocked sender=${user.id} (reason=${ingressAccess.reason})`);
				return;
			}
		}
		let parentId = "parentId" in channel ? channel.parentId ?? void 0 : void 0;
		let parentName;
		let parentSlug = "";
		let reactionBase = null;
		const resolveReactionBase = () => {
			if (reactionBase) return reactionBase;
			const emojiLabel = formatDiscordReactionEmoji(data.emoji);
			reactionBase = {
				baseText: `Discord reaction ${action}: ${emojiLabel} by ${formatDiscordUserTag(user)} on ${guildInfo?.slug || (data.guild?.name ? normalizeDiscordSlug(data.guild.name) : data.guild_id ?? (isGroupDm ? "group-dm" : "dm"))} ${channelSlug ? `#${channelSlug}` : channelName ? `#${normalizeDiscordSlug(channelName)}` : `#${data.channel_id}`} msg ${data.message_id}`,
				contextKey: `discord:reaction:${action}:${data.message_id}:${user.id}:${emojiLabel}`
			};
			return reactionBase;
		};
		const emitReaction = (text, parentPeerId) => {
			const { contextKey } = resolveReactionBase();
			enqueueSystemEvent(text, {
				sessionKey: resolveAgentRoute({
					cfg: params.cfg,
					channel: "discord",
					accountId: params.accountId,
					guildId: data.guild_id ?? void 0,
					memberRoleIds,
					peer: {
						kind: isDirectMessage ? "direct" : isGroupDm ? "group" : "channel",
						id: isDirectMessage ? user.id : data.channel_id
					},
					parentPeer: parentPeerId ? {
						kind: "channel",
						id: parentPeerId
					} : void 0
				}).sessionKey,
				contextKey
			});
		};
		const shouldNotifyReaction = (options) => shouldEmitDiscordReactionNotification({
			mode: options.mode,
			botId: botUserId,
			messageAuthorId: options.messageAuthorId,
			userId: user.id,
			userName: user.username,
			userTag: formatDiscordUserTag(user),
			channelConfig: options.channelConfig,
			guildInfo,
			memberRoleIds,
			allowNameMatching: params.allowNameMatching
		});
		const emitReactionWithAuthor = (message) => {
			const { baseText } = resolveReactionBase();
			const authorLabel = message?.author ? formatDiscordUserTag(message.author) : void 0;
			emitReaction(authorLabel ? `${baseText} from ${authorLabel}` : baseText, parentId);
		};
		const loadThreadParentInfo = async () => {
			if (!parentId) return;
			parentName = (await resolveDiscordChannelInfo(client, parentId))?.name;
			parentSlug = parentName ? normalizeDiscordSlug(parentName) : "";
		};
		const resolveThreadChannelConfig = () => resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			parentId,
			parentName,
			parentSlug,
			scope: "thread"
		});
		const authorizeReactionIngressForChannel = async (channelConfig) => await authorizeDiscordReactionIngress({
			...reactionIngressBase,
			channelConfig
		});
		const resolveThreadChannelAccess = async (channelInfo) => {
			parentId = channelInfo?.parentId;
			await loadThreadParentInfo();
			const channelConfig = resolveThreadChannelConfig();
			return {
				access: await authorizeReactionIngressForChannel(channelConfig),
				channelConfig
			};
		};
		if (isThreadChannel) {
			const reactionMode = guildInfo?.reactionNotifications ?? "own";
			if (reactionMode === "off") return;
			const channelInfoPromise = parentId ? Promise.resolve({ parentId }) : resolveDiscordChannelInfo(client, data.channel_id);
			if (reactionMode === "all" || reactionMode === "allowlist") {
				const { access: threadAccess, channelConfig: threadChannelConfig } = await resolveThreadChannelAccess(await channelInfoPromise);
				if (!threadAccess.allowed) return;
				if (!shouldNotifyReaction({
					mode: reactionMode,
					channelConfig: threadChannelConfig
				})) return;
				const { baseText } = resolveReactionBase();
				emitReaction(baseText, parentId);
				return;
			}
			const messagePromise = data.message.fetch().catch(() => null);
			const [channelInfo, message] = await Promise.all([channelInfoPromise, messagePromise]);
			const { access: threadAccess, channelConfig: threadChannelConfig } = await resolveThreadChannelAccess(channelInfo);
			if (!threadAccess.allowed) return;
			if (!shouldNotifyReaction({
				mode: reactionMode,
				messageAuthorId: message?.author?.id ?? void 0,
				channelConfig: threadChannelConfig
			})) return;
			emitReactionWithAuthor(message);
			return;
		}
		const channelConfig = resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId: data.channel_id,
			channelName,
			channelSlug,
			parentId,
			parentName,
			parentSlug,
			scope: "channel"
		});
		if (isGuildMessage) {
			if (!(await authorizeReactionIngressForChannel(channelConfig)).allowed) return;
		}
		const reactionMode = guildInfo?.reactionNotifications ?? "own";
		if (reactionMode === "off") return;
		if (reactionMode === "all" || reactionMode === "allowlist") {
			if (!shouldNotifyReaction({
				mode: reactionMode,
				channelConfig
			})) return;
			const { baseText } = resolveReactionBase();
			emitReaction(baseText, parentId);
			return;
		}
		const message = await data.message.fetch().catch(() => null);
		if (!shouldNotifyReaction({
			mode: reactionMode,
			messageAuthorId: message?.author?.id ?? void 0,
			channelConfig
		})) return;
		emitReactionWithAuthor(message);
	} catch (err) {
		params.logger.error(danger(`discord reaction handler failed: ${String(err)}`));
	}
}
var DiscordPresenceListener = class extends PresenceUpdateListener {
	constructor(params) {
		super();
		this.logger = params.logger;
		this.accountId = params.accountId;
	}
	async handle(data) {
		try {
			const userId = "user" in data && data.user && typeof data.user === "object" && "id" in data.user ? String(data.user.id) : void 0;
			if (!userId) return;
			setPresence(this.accountId, userId, data);
		} catch (err) {
			(this.logger ?? discordEventQueueLog).error(danger(`discord presence handler failed: ${String(err)}`));
		}
	}
};
var DiscordThreadUpdateListener = class extends ThreadUpdateListener {
	constructor(cfg, accountId, logger) {
		super();
		this.cfg = cfg;
		this.accountId = accountId;
		this.logger = logger;
	}
	async handle(data) {
		await runDiscordListenerWithSlowLog({
			logger: this.logger,
			listener: this.constructor.name,
			event: this.type,
			run: async () => {
				if (!isThreadArchived(data)) return;
				const threadId = "id" in data && typeof data.id === "string" ? data.id : void 0;
				if (!threadId) return;
				const logger = this.logger ?? discordEventQueueLog;
				const count = await closeDiscordThreadSessions({
					cfg: this.cfg,
					accountId: this.accountId,
					threadId
				});
				if (count > 0) logger.info("Discord thread archived — reset sessions", {
					threadId,
					count
				});
			},
			onError: (err) => {
				(this.logger ?? discordEventQueueLog).error(danger(`discord thread-update handler failed: ${String(err)}`));
			}
		});
	}
};
//#endregion
//#region extensions/discord/src/monitor/native-command-context.ts
function buildDiscordNativeCommandContext(params) {
	const conversationLabel = params.isDirectMessage ? params.user.globalName ?? params.user.username : params.channelId;
	const { groupSystemPrompt, ownerAllowFrom, untrustedContext } = buildDiscordInboundAccessContext({
		channelConfig: params.channelConfig,
		guildInfo: params.guildInfo,
		sender: params.sender,
		allowNameMatching: params.allowNameMatching,
		isGuild: params.isGuild,
		channelTopic: params.channelTopic
	});
	return finalizeInboundContext({
		Body: params.prompt,
		BodyForAgent: params.prompt,
		RawBody: params.prompt,
		CommandBody: params.prompt,
		CommandArgs: params.commandArgs,
		From: params.isDirectMessage ? `discord:${params.user.id}` : params.isGroupDm ? `discord:group:${params.channelId}` : `discord:channel:${params.channelId}`,
		To: `slash:${params.user.id}`,
		SessionKey: params.sessionKey,
		CommandTargetSessionKey: params.commandTargetSessionKey,
		AccountId: params.accountId ?? void 0,
		ChatType: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
		ConversationLabel: conversationLabel,
		GroupSubject: params.isGuild ? params.guildName : void 0,
		GroupSystemPrompt: groupSystemPrompt,
		UntrustedContext: untrustedContext,
		OwnerAllowFrom: ownerAllowFrom,
		SenderName: params.user.globalName ?? params.user.username,
		SenderId: params.user.id,
		SenderUsername: params.user.username,
		SenderTag: params.sender.tag,
		Provider: "discord",
		Surface: "discord",
		WasMentioned: true,
		MessageSid: params.interactionId,
		MessageThreadId: params.isThreadChannel ? params.channelId : void 0,
		Timestamp: params.timestampMs ?? Date.now(),
		CommandAuthorized: params.commandAuthorized,
		CommandSource: "native",
		OriginatingChannel: "discord",
		OriginatingTo: params.isDirectMessage ? `user:${params.user.id}` : `channel:${params.channelId}`,
		ThreadParentId: params.isThreadChannel ? params.threadParentId : void 0
	});
}
//#endregion
//#region extensions/discord/src/monitor/model-picker-preferences.ts
const MODEL_PICKER_PREFERENCES_LOCK_OPTIONS = {
	retries: {
		retries: 8,
		factor: 2,
		minTimeout: 50,
		maxTimeout: 5e3,
		randomize: true
	},
	stale: 15e3
};
const DEFAULT_RECENT_LIMIT = 5;
function resolvePreferencesStorePath(env = process.env) {
	const stateDir = resolveStateDir(env, () => resolveRequiredHomeDir(env, os.homedir));
	return path.join(stateDir, "discord", "model-picker-preferences.json");
}
function normalizeId(value) {
	return value?.trim() ?? "";
}
function buildDiscordModelPickerPreferenceKey(scope) {
	const userId = normalizeId(scope.userId);
	if (!userId) return null;
	const accountId = normalizeAccountId(scope.accountId);
	const guildId = normalizeId(scope.guildId);
	if (guildId) return `discord:${accountId}:guild:${guildId}:user:${userId}`;
	return `discord:${accountId}:dm:user:${userId}`;
}
function normalizeModelRef(raw) {
	const value = raw?.trim();
	if (!value) return null;
	const slashIndex = value.indexOf("/");
	if (slashIndex <= 0 || slashIndex >= value.length - 1) return null;
	const provider = normalizeProviderId(value.slice(0, slashIndex));
	const model = value.slice(slashIndex + 1).trim();
	if (!provider || !model) return null;
	return `${provider}/${model}`;
}
function sanitizeRecentModels(models, limit) {
	const deduped = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of models ?? []) {
		const normalized = normalizeModelRef(item);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		deduped.push(normalized);
		if (deduped.length >= limit) break;
	}
	return deduped;
}
async function readPreferencesStore(filePath) {
	const { value } = await readJsonFileWithFallback(filePath, {
		version: 1,
		entries: {}
	});
	if (!value || typeof value !== "object" || value.version !== 1) return {
		version: 1,
		entries: {}
	};
	return {
		version: 1,
		entries: value.entries && typeof value.entries === "object" ? value.entries : {}
	};
}
async function readDiscordModelPickerRecentModels(params) {
	const key = buildDiscordModelPickerPreferenceKey(params.scope);
	if (!key) return [];
	const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_RECENT_LIMIT, 10));
	const entry = (await readPreferencesStore(resolvePreferencesStorePath(params.env))).entries[key];
	const recent = sanitizeRecentModels(entry?.recent, limit);
	if (!params.allowedModelRefs || params.allowedModelRefs.size === 0) return recent;
	return recent.filter((modelRef) => params.allowedModelRefs?.has(modelRef));
}
async function recordDiscordModelPickerRecentModel(params) {
	const key = buildDiscordModelPickerPreferenceKey(params.scope);
	const normalizedModelRef = normalizeModelRef(params.modelRef);
	if (!key || !normalizedModelRef) return;
	const limit = Math.max(1, Math.min(params.limit ?? DEFAULT_RECENT_LIMIT, 10));
	const filePath = resolvePreferencesStorePath(params.env);
	await withFileLock(filePath, MODEL_PICKER_PREFERENCES_LOCK_OPTIONS, async () => {
		const store = await readPreferencesStore(filePath);
		const next = [normalizedModelRef, ...sanitizeRecentModels(store.entries[key]?.recent, limit).filter((entry) => entry !== normalizedModelRef)].slice(0, limit);
		store.entries[key] = {
			recent: next,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await writeJsonFileAtomically(filePath, store);
	});
}
//#endregion
//#region extensions/discord/src/monitor/model-picker.ts
const DISCORD_MODEL_PICKER_CUSTOM_ID_KEY = "mdlpk";
const DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS = 18;
const COMMAND_CONTEXTS = ["model", "models"];
const PICKER_ACTIONS = [
	"open",
	"provider",
	"model",
	"submit",
	"quick",
	"back",
	"reset",
	"cancel",
	"recents"
];
const PICKER_VIEWS = [
	"providers",
	"models",
	"recents"
];
function encodeCustomIdValue$1(value) {
	return encodeURIComponent(value);
}
function decodeCustomIdValue$1(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function isValidCommandContext(value) {
	return COMMAND_CONTEXTS.includes(value);
}
function isValidPickerAction(value) {
	return PICKER_ACTIONS.includes(value);
}
function isValidPickerView(value) {
	return PICKER_VIEWS.includes(value);
}
function normalizePage(value) {
	const numeric = typeof value === "number" ? value : NaN;
	if (!Number.isFinite(numeric)) return 1;
	return Math.max(1, Math.floor(numeric));
}
function parseRawPage(value) {
	if (typeof value === "number") return normalizePage(value);
	if (typeof value === "string" && value.trim()) {
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed)) return normalizePage(parsed);
	}
	return 1;
}
function parseRawPositiveInt(value) {
	if (typeof value !== "string" && typeof value !== "number") return;
	const parsed = Number.parseInt(String(value), 10);
	if (!Number.isFinite(parsed) || parsed < 1) return;
	return Math.floor(parsed);
}
function coerceString(value) {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
function clampPageSize(rawPageSize, max, fallback) {
	if (!Number.isFinite(rawPageSize)) return fallback;
	return Math.min(max, Math.max(1, Math.floor(rawPageSize ?? fallback)));
}
function paginateItems(params) {
	const totalItems = params.items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
	const page = Math.max(1, Math.min(params.page, totalPages));
	const startIndex = (page - 1) * params.pageSize;
	const endIndexExclusive = Math.min(totalItems, startIndex + params.pageSize);
	return {
		items: params.items.slice(startIndex, endIndexExclusive),
		page,
		pageSize: params.pageSize,
		totalPages,
		totalItems,
		hasPrev: page > 1,
		hasNext: page < totalPages
	};
}
function parseCurrentModelRef(raw) {
	const match = (raw?.trim())?.match(/^([^/]+)\/(.+)$/u);
	if (!match) return null;
	const provider = normalizeProviderId(match[1]);
	const model = match[2];
	if (!provider || !model) return null;
	return {
		provider,
		model
	};
}
function formatCurrentModelLine(currentModel) {
	const parsed = parseCurrentModelRef(currentModel);
	if (!parsed) return "Current model: default";
	return `Current model: ${parsed.provider}/${parsed.model}`;
}
function formatProviderButtonLabel(provider) {
	if (provider.length <= DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS) return provider;
	return `${provider.slice(0, DISCORD_PROVIDER_BUTTON_LABEL_MAX_CHARS - 1)}…`;
}
function chunkProvidersForRows(items) {
	if (items.length === 0) return [];
	const rowCount = Math.max(1, Math.ceil(items.length / 5));
	const minPerRow = Math.floor(items.length / rowCount);
	const rowsWithExtraItem = items.length % rowCount;
	const counts = Array.from({ length: rowCount }, (_, index) => index < rowCount - rowsWithExtraItem ? minPerRow : minPerRow + 1);
	const rows = [];
	let cursor = 0;
	for (const count of counts) {
		rows.push(items.slice(cursor, cursor + count));
		cursor += count;
	}
	return rows;
}
function createModelPickerButton(params) {
	class DiscordModelPickerButton extends Button {
		constructor(..._args) {
			super(..._args);
			this.label = params.label;
			this.customId = params.customId;
			this.style = params.style ?? ButtonStyle.Secondary;
			this.disabled = params.disabled ?? false;
		}
	}
	return new DiscordModelPickerButton();
}
function createModelSelect(params) {
	class DiscordModelPickerSelect extends StringSelectMenu {
		constructor(..._args2) {
			super(..._args2);
			this.customId = params.customId;
			this.options = params.options;
			this.minValues = 1;
			this.maxValues = 1;
			this.placeholder = params.placeholder;
			this.disabled = params.disabled ?? false;
		}
	}
	return new DiscordModelPickerSelect();
}
function buildRenderedShell(params) {
	if (params.layout === "classic") return {
		layout: "classic",
		content: [
			params.title,
			...params.detailLines,
			"",
			params.footer
		].filter(Boolean).join("\n"),
		components: params.rows
	};
	const containerComponents = [new TextDisplay(`## ${params.title}`)];
	if (params.detailLines.length > 0) containerComponents.push(new TextDisplay(params.detailLines.join("\n")));
	containerComponents.push(new Separator({
		divider: true,
		spacing: "small"
	}));
	if (params.preRowText) containerComponents.push(new TextDisplay(params.preRowText));
	containerComponents.push(...params.rows);
	if (params.trailingRows && params.trailingRows.length > 0) {
		containerComponents.push(new Separator({
			divider: true,
			spacing: "small"
		}));
		containerComponents.push(...params.trailingRows);
	}
	if (params.footer) {
		containerComponents.push(new Separator({
			divider: false,
			spacing: "small"
		}));
		containerComponents.push(new TextDisplay(`-# ${params.footer}`));
	}
	return {
		layout: "v2",
		components: [new Container(containerComponents)]
	};
}
function buildProviderRows(params) {
	return chunkProvidersForRows(params.page.items).map((providers) => new Row(providers.map((provider) => {
		const style = provider.id === params.currentProvider ? ButtonStyle.Primary : ButtonStyle.Secondary;
		return createModelPickerButton({
			label: formatProviderButtonLabel(provider.id),
			style,
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "provider",
				view: "models",
				provider: provider.id,
				page: params.page.page,
				userId: params.userId
			})
		});
	})));
}
function buildModelRows(params) {
	const parsedCurrentModel = parseCurrentModelRef(params.currentModel);
	const parsedPendingModel = parseCurrentModelRef(params.pendingModel);
	const rows = [];
	const hasQuickModels = (params.quickModels ?? []).length > 0;
	const providerPage = getDiscordModelPickerProviderPage({
		data: params.data,
		page: params.providerPage
	});
	const providerOptions = providerPage.items.map((provider) => ({
		label: provider.id,
		value: provider.id,
		default: provider.id === params.modelPage.provider
	}));
	rows.push(new Row([createModelSelect({
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "provider",
			view: "models",
			provider: params.modelPage.provider,
			page: providerPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		}),
		options: providerOptions,
		placeholder: "Select provider"
	})]));
	const selectedModelRef = parsedPendingModel ?? parsedCurrentModel;
	const modelOptions = params.modelPage.items.map((model) => ({
		label: model,
		value: model,
		default: selectedModelRef ? selectedModelRef.provider === params.modelPage.provider && selectedModelRef.model === model : false
	}));
	rows.push(new Row([createModelSelect({
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "model",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		}),
		options: modelOptions,
		placeholder: `Select ${params.modelPage.provider} model`
	})]));
	const resolvedDefault = params.data.resolvedDefault;
	const shouldDisableReset = Boolean(parsedCurrentModel) && parsedCurrentModel?.provider === resolvedDefault.provider && parsedCurrentModel?.model === resolvedDefault.model;
	const hasPendingSelection = Boolean(parsedPendingModel) && parsedPendingModel?.provider === params.modelPage.provider && typeof params.pendingModelIndex === "number" && params.pendingModelIndex > 0;
	const buttonRowItems = [createModelPickerButton({
		label: "Cancel",
		style: ButtonStyle.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "cancel",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	}), createModelPickerButton({
		label: "Reset to default",
		style: ButtonStyle.Secondary,
		disabled: shouldDisableReset,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "reset",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	})];
	if (hasQuickModels) buttonRowItems.push(createModelPickerButton({
		label: "Recents",
		style: ButtonStyle.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "recents",
			view: "recents",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			userId: params.userId
		})
	}));
	buttonRowItems.push(createModelPickerButton({
		label: "Submit",
		style: ButtonStyle.Primary,
		disabled: !hasPendingSelection,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "submit",
			view: "models",
			provider: params.modelPage.provider,
			page: params.modelPage.page,
			providerPage: providerPage.page,
			modelIndex: params.pendingModelIndex,
			userId: params.userId
		})
	}));
	return {
		rows,
		buttonRow: new Row(buttonRowItems)
	};
}
/**
* Source-of-truth data for Discord picker views. This intentionally reuses the
* same provider/model resolver used by text and Telegram model commands.
*/
async function loadDiscordModelPickerData(cfg, agentId) {
	return buildModelsProviderData(cfg, agentId);
}
function buildDiscordModelPickerCustomId(params) {
	const userId = params.userId.trim();
	if (!userId) throw new Error("Discord model picker custom_id requires userId");
	const page = normalizePage(params.page);
	const providerPage = typeof params.providerPage === "number" && Number.isFinite(params.providerPage) ? Math.max(1, Math.floor(params.providerPage)) : void 0;
	const normalizedProvider = params.provider ? normalizeProviderId(params.provider) : void 0;
	const modelIndex = typeof params.modelIndex === "number" && Number.isFinite(params.modelIndex) ? Math.max(1, Math.floor(params.modelIndex)) : void 0;
	const recentSlot = typeof params.recentSlot === "number" && Number.isFinite(params.recentSlot) ? Math.max(1, Math.floor(params.recentSlot)) : void 0;
	const parts = [
		`${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:c=${encodeCustomIdValue$1(params.command)}`,
		`a=${encodeCustomIdValue$1(params.action)}`,
		`v=${encodeCustomIdValue$1(params.view)}`,
		`u=${encodeCustomIdValue$1(userId)}`,
		`g=${String(page)}`
	];
	if (normalizedProvider) parts.push(`p=${encodeCustomIdValue$1(normalizedProvider)}`);
	if (providerPage) parts.push(`pp=${String(providerPage)}`);
	if (modelIndex) parts.push(`mi=${String(modelIndex)}`);
	if (recentSlot) parts.push(`rs=${String(recentSlot)}`);
	const customId = parts.join(";");
	if (customId.length > 100) throw new Error(`Discord model picker custom_id exceeds 100 chars (${customId.length})`);
	return customId;
}
function parseDiscordModelPickerData(data) {
	if (!data || typeof data !== "object") return null;
	const command = decodeCustomIdValue$1(coerceString(data.c ?? data.cmd));
	const action = decodeCustomIdValue$1(coerceString(data.a ?? data.act));
	const view = decodeCustomIdValue$1(coerceString(data.v ?? data.view));
	const userId = decodeCustomIdValue$1(coerceString(data.u));
	const providerRaw = decodeCustomIdValue$1(coerceString(data.p));
	const page = parseRawPage(data.g ?? data.pg);
	const providerPage = parseRawPositiveInt(data.pp);
	const modelIndex = parseRawPositiveInt(data.mi);
	const recentSlot = parseRawPositiveInt(data.rs);
	if (!isValidCommandContext(command) || !isValidPickerAction(action) || !isValidPickerView(view)) return null;
	const trimmedUserId = userId.trim();
	if (!trimmedUserId) return null;
	return {
		command,
		action,
		view,
		userId: trimmedUserId,
		provider: providerRaw ? normalizeProviderId(providerRaw) : void 0,
		page,
		...typeof providerPage === "number" ? { providerPage } : {},
		...typeof modelIndex === "number" ? { modelIndex } : {},
		...typeof recentSlot === "number" ? { recentSlot } : {}
	};
}
function buildDiscordModelPickerProviderItems(data) {
	return data.providers.map((provider) => ({
		id: provider,
		count: data.byProvider.get(provider)?.size ?? 0
	}));
}
function getDiscordModelPickerProviderPage(params) {
	const items = buildDiscordModelPickerProviderItems(params.data);
	const maxPageSize = items.length <= 25 ? 25 : 20;
	const pageSize = clampPageSize(params.pageSize, maxPageSize, maxPageSize);
	return paginateItems({
		items,
		page: normalizePage(params.page),
		pageSize
	});
}
function getDiscordModelPickerModelPage(params) {
	const provider = normalizeProviderId(params.provider);
	const modelSet = params.data.byProvider.get(provider);
	if (!modelSet) return null;
	const pageSize = clampPageSize(params.pageSize, 25, 25);
	return {
		...paginateItems({
			items: [...modelSet].toSorted(),
			page: normalizePage(params.page),
			pageSize
		}),
		provider
	};
}
function renderDiscordModelPickerProvidersView(params) {
	const page = getDiscordModelPickerProviderPage({
		data: params.data,
		page: params.page
	});
	const parsedCurrent = parseCurrentModelRef(params.currentModel);
	const rows = buildProviderRows({
		command: params.command,
		userId: params.userId,
		page,
		currentProvider: parsedCurrent?.provider
	});
	const detailLines = [formatCurrentModelLine(params.currentModel), `Select a provider (${page.totalItems} available).`];
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Model Picker",
		detailLines,
		rows,
		footer: `All ${page.totalItems} providers shown`
	});
}
function renderDiscordModelPickerModelsView(params) {
	const providerPage = normalizePage(params.providerPage);
	const modelPage = getDiscordModelPickerModelPage({
		data: params.data,
		provider: params.provider,
		page: params.page
	});
	if (!modelPage) {
		const rows = [new Row([createModelPickerButton({
			label: "Back",
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "back",
				view: "providers",
				page: providerPage,
				userId: params.userId
			})
		})])];
		return buildRenderedShell({
			layout: params.layout ?? "v2",
			title: "Model Picker",
			detailLines: [formatCurrentModelLine(params.currentModel), `Provider not found: ${normalizeProviderId(params.provider)}`],
			rows,
			footer: "Choose a different provider."
		});
	}
	const { rows, buttonRow } = buildModelRows({
		command: params.command,
		userId: params.userId,
		data: params.data,
		providerPage,
		modelPage,
		currentModel: params.currentModel,
		pendingModel: params.pendingModel,
		pendingModelIndex: params.pendingModelIndex,
		quickModels: params.quickModels
	});
	const defaultModel = `${params.data.resolvedDefault.provider}/${params.data.resolvedDefault.model}`;
	const pendingLine = params.pendingModel ? `Selected: ${params.pendingModel} (press Submit)` : "Select a model, then press Submit.";
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Model Picker",
		detailLines: [formatCurrentModelLine(params.currentModel), `Default: ${defaultModel}`],
		preRowText: pendingLine,
		rows,
		trailingRows: [buttonRow]
	});
}
function formatRecentsButtonLabel(modelRef, suffix) {
	const maxLen = 80;
	const label = suffix ? `${modelRef} ${suffix}` : modelRef;
	if (label.length <= maxLen) return label;
	return suffix ? `${modelRef.slice(0, maxLen - suffix.length - 2)}… ${suffix}` : `${modelRef.slice(0, maxLen - 1)}…`;
}
function renderDiscordModelPickerRecentsView(params) {
	const defaultModelRef = `${params.data.resolvedDefault.provider}/${params.data.resolvedDefault.model}`;
	const rows = [];
	const dedupedQuickModels = params.quickModels.filter((modelRef) => modelRef !== defaultModelRef);
	rows.push(new Row([createModelPickerButton({
		label: formatRecentsButtonLabel(defaultModelRef, "(default)"),
		style: ButtonStyle.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "submit",
			view: "recents",
			recentSlot: 1,
			provider: params.provider,
			page: params.page,
			providerPage: params.providerPage,
			userId: params.userId
		})
	})]));
	for (let i = 0; i < dedupedQuickModels.length; i++) {
		const modelRef = dedupedQuickModels[i];
		rows.push(new Row([createModelPickerButton({
			label: formatRecentsButtonLabel(modelRef),
			style: ButtonStyle.Secondary,
			customId: buildDiscordModelPickerCustomId({
				command: params.command,
				action: "submit",
				view: "recents",
				recentSlot: i + 2,
				provider: params.provider,
				page: params.page,
				providerPage: params.providerPage,
				userId: params.userId
			})
		})]));
	}
	const backRow = new Row([createModelPickerButton({
		label: "Back",
		style: ButtonStyle.Secondary,
		customId: buildDiscordModelPickerCustomId({
			command: params.command,
			action: "back",
			view: "models",
			provider: params.provider,
			page: params.page,
			providerPage: params.providerPage,
			userId: params.userId
		})
	})]);
	return buildRenderedShell({
		layout: params.layout ?? "v2",
		title: "Recents",
		detailLines: ["Models you've previously selected appear here.", formatCurrentModelLine(params.currentModel)],
		preRowText: "Tap a model to switch.",
		rows,
		trailingRows: [backRow]
	});
}
function toDiscordModelPickerMessagePayload(view) {
	if (view.layout === "classic") return {
		content: view.content,
		components: view.components
	};
	return { components: view.components };
}
//#endregion
//#region extensions/discord/src/monitor/native-command-ui.ts
const DISCORD_COMMAND_ARG_CUSTOM_ID_KEY = "cmdarg";
function createCommandArgsWithValue(params) {
	return { values: { [params.argName]: params.value } };
}
function encodeDiscordCommandArgValue(value) {
	return encodeURIComponent(value);
}
function decodeDiscordCommandArgValue(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function buildDiscordCommandArgCustomId(params) {
	return [
		`${DISCORD_COMMAND_ARG_CUSTOM_ID_KEY}:command=${encodeDiscordCommandArgValue(params.command)}`,
		`arg=${encodeDiscordCommandArgValue(params.arg)}`,
		`value=${encodeDiscordCommandArgValue(params.value)}`,
		`user=${encodeDiscordCommandArgValue(params.userId)}`
	].join(";");
}
function parseDiscordCommandArgData(data) {
	if (!data || typeof data !== "object") return null;
	const coerce = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "";
	const rawCommand = coerce(data.command);
	const rawArg = coerce(data.arg);
	const rawValue = coerce(data.value);
	const rawUser = coerce(data.user);
	if (!rawCommand || !rawArg || !rawValue || !rawUser) return null;
	return {
		command: decodeDiscordCommandArgValue(rawCommand),
		arg: decodeDiscordCommandArgValue(rawArg),
		value: decodeDiscordCommandArgValue(rawValue),
		userId: decodeDiscordCommandArgValue(rawUser)
	};
}
function resolveDiscordModelPickerCommandContext(command) {
	const normalized = (command.nativeName ?? command.key).trim().toLowerCase();
	if (normalized === "model" || normalized === "models") return normalized;
	return null;
}
function resolveCommandArgStringValue(args, key) {
	const value = args?.values?.[key];
	if (typeof value !== "string") return "";
	return value.trim();
}
function shouldOpenDiscordModelPickerFromCommand(params) {
	const context = resolveDiscordModelPickerCommandContext(params.command);
	if (!context) return null;
	const serializedArgs = serializeCommandArgs(params.command, params.commandArgs)?.trim() ?? "";
	if (context === "model") return !resolveCommandArgStringValue(params.commandArgs, "model") && !serializedArgs ? context : null;
	return serializedArgs ? null : context;
}
function buildDiscordModelPickerCurrentModel(defaultProvider, defaultModel) {
	return `${defaultProvider}/${defaultModel}`;
}
function buildDiscordModelPickerAllowedModelRefs(data) {
	const out = /* @__PURE__ */ new Set();
	for (const provider of data.providers) {
		const models = data.byProvider.get(provider);
		if (!models) continue;
		for (const model of models) out.add(`${provider}/${model}`);
	}
	return out;
}
function resolveDiscordModelPickerPreferenceScope(params) {
	return {
		accountId: params.accountId,
		guildId: params.interaction.guild?.id ?? void 0,
		userId: params.userId
	};
}
function buildDiscordModelPickerNoticePayload(message) {
	return { components: [new Container([new TextDisplay(message)])] };
}
async function resolveDiscordModelPickerRoute(params) {
	const { interaction, cfg, accountId } = params;
	const channel = interaction.channel;
	const channelType = channel?.type;
	const isDirectMessage = channelType === ChannelType.DM;
	const isGroupDm = channelType === ChannelType.GroupDM;
	const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
	const rawChannelId = channel?.id ?? "unknown";
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	let threadParentId;
	if (interaction.guild && channel && isThreadChannel && rawChannelId) {
		const channelInfo = await resolveDiscordChannelInfo(interaction.client, rawChannelId);
		threadParentId = (await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: rawChannelId,
				name: "name" in channel ? channel.name : void 0,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0,
				parent: void 0
			},
			channelInfo
		})).id;
	}
	const threadBinding = isThreadChannel ? params.threadBindings.getByThreadId(rawChannelId) : void 0;
	return resolveDiscordBoundConversationRoute({
		cfg,
		accountId,
		guildId: interaction.guild?.id ?? void 0,
		memberRoleIds,
		isDirectMessage,
		isGroupDm,
		directUserId: interaction.user?.id ?? rawChannelId,
		conversationId: rawChannelId,
		parentConversationId: threadParentId,
		boundSessionKey: threadBinding?.targetSessionKey
	});
}
function resolveDiscordModelPickerCurrentModel(params) {
	const fallback = buildDiscordModelPickerCurrentModel(params.data.resolvedDefault.provider, params.data.resolvedDefault.model);
	try {
		const sessionStore = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: params.route.agentId }), { skipCache: true });
		const sessionEntry = sessionStore[params.route.sessionKey];
		const override = resolveStoredModelOverride({
			sessionEntry,
			sessionStore,
			sessionKey: params.route.sessionKey
		});
		if (!override?.model) return fallback;
		const provider = (override.provider || params.data.resolvedDefault.provider).trim();
		if (!provider) return fallback;
		return `${provider}/${override.model}`;
	} catch {
		return fallback;
	}
}
async function replyWithDiscordModelPickerProviders(params) {
	const route = await resolveDiscordModelPickerRoute({
		interaction: params.interaction,
		cfg: params.cfg,
		accountId: params.accountId,
		threadBindings: params.threadBindings
	});
	const data = await loadDiscordModelPickerData(params.cfg, route.agentId);
	const currentModel = resolveDiscordModelPickerCurrentModel({
		cfg: params.cfg,
		route,
		data
	});
	const quickModels = await readDiscordModelPickerRecentModels({
		scope: resolveDiscordModelPickerPreferenceScope({
			interaction: params.interaction,
			accountId: params.accountId,
			userId: params.userId
		}),
		allowedModelRefs: buildDiscordModelPickerAllowedModelRefs(data),
		limit: 5
	});
	const payload = {
		...toDiscordModelPickerMessagePayload(renderDiscordModelPickerModelsView({
			command: params.command,
			userId: params.userId,
			data,
			provider: splitDiscordModelRef(currentModel ?? "")?.provider ?? data.resolvedDefault.provider,
			page: 1,
			providerPage: 1,
			currentModel,
			quickModels
		})),
		ephemeral: true
	};
	await params.safeInteractionCall("model picker reply", async () => {
		if (params.preferFollowUp) {
			await params.interaction.followUp(payload);
			return;
		}
		await params.interaction.reply(payload);
	});
}
function resolveModelPickerSelectionValue(interaction) {
	const rawValues = interaction.values;
	if (!Array.isArray(rawValues) || rawValues.length === 0) return null;
	const first = rawValues[0];
	if (typeof first !== "string") return null;
	return first.trim() || null;
}
function buildDiscordModelPickerSelectionCommand(params) {
	const commandDefinition = findCommandByNativeName("model", "discord") ?? listChatCommands().find((entry) => entry.key === "model");
	if (!commandDefinition) return null;
	const commandArgs = {
		values: { model: params.modelRef },
		raw: params.modelRef
	};
	return {
		command: commandDefinition,
		args: commandArgs,
		prompt: buildCommandTextFromArgs(commandDefinition, commandArgs)
	};
}
function listDiscordModelPickerProviderModels(data, provider) {
	const modelSet = data.byProvider.get(provider);
	if (!modelSet) return [];
	return [...modelSet].toSorted();
}
function resolveDiscordModelPickerModelIndex(params) {
	const models = listDiscordModelPickerProviderModels(params.data, params.provider);
	if (!models.length) return null;
	const index = models.indexOf(params.model);
	if (index < 0) return null;
	return index + 1;
}
function resolveDiscordModelPickerModelByIndex(params) {
	if (!params.modelIndex || params.modelIndex < 1) return null;
	const models = listDiscordModelPickerProviderModels(params.data, params.provider);
	if (!models.length) return null;
	return models[params.modelIndex - 1] ?? null;
}
function splitDiscordModelRef(modelRef) {
	const trimmed = modelRef.trim();
	const slashIndex = trimmed.indexOf("/");
	if (slashIndex <= 0 || slashIndex >= trimmed.length - 1) return null;
	const provider = trimmed.slice(0, slashIndex).trim();
	const model = trimmed.slice(slashIndex + 1).trim();
	if (!provider || !model) return null;
	return {
		provider,
		model
	};
}
async function handleDiscordModelPickerInteraction(params) {
	const { interaction, data, ctx } = params;
	const parsed = parseDiscordModelPickerData(data);
	if (!parsed) {
		await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that model picker interaction is no longer available.")));
		return;
	}
	if (interaction.user?.id && interaction.user.id !== parsed.userId) {
		await params.safeInteractionCall("model picker ack", () => interaction.acknowledge());
		return;
	}
	const route = await resolveDiscordModelPickerRoute({
		interaction,
		cfg: ctx.cfg,
		accountId: ctx.accountId,
		threadBindings: ctx.threadBindings
	});
	const pickerData = await loadDiscordModelPickerData(ctx.cfg, route.agentId);
	const currentModelRef = resolveDiscordModelPickerCurrentModel({
		cfg: ctx.cfg,
		route,
		data: pickerData
	});
	const allowedModelRefs = buildDiscordModelPickerAllowedModelRefs(pickerData);
	const preferenceScope = resolveDiscordModelPickerPreferenceScope({
		interaction,
		accountId: ctx.accountId,
		userId: parsed.userId
	});
	const quickModels = await readDiscordModelPickerRecentModels({
		scope: preferenceScope,
		allowedModelRefs,
		limit: 5
	});
	if (parsed.action === "recents") {
		const rendered = renderDiscordModelPickerRecentsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			quickModels,
			currentModel: currentModelRef,
			provider: parsed.provider,
			page: parsed.page,
			providerPage: parsed.providerPage
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "back" && parsed.view === "providers") {
		const rendered = renderDiscordModelPickerProvidersView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			page: parsed.page,
			currentModel: currentModelRef
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "back" && parsed.view === "models") {
		const provider = parsed.provider ?? splitDiscordModelRef(currentModelRef ?? "")?.provider ?? pickerData.resolvedDefault.provider;
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider,
			page: parsed.page ?? 1,
			providerPage: parsed.providerPage ?? 1,
			currentModel: currentModelRef,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "provider") {
		const selectedProvider = resolveModelPickerSelectionValue(interaction) ?? parsed.provider;
		if (!selectedProvider || !pickerData.byProvider.has(selectedProvider)) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that provider isn't available anymore.")));
			return;
		}
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider: selectedProvider,
			page: 1,
			providerPage: parsed.providerPage ?? parsed.page,
			currentModel: currentModelRef,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "model") {
		const selectedModel = resolveModelPickerSelectionValue(interaction);
		const provider = parsed.provider;
		if (!provider || !selectedModel) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, I couldn't read that model selection.")));
			return;
		}
		const modelIndex = resolveDiscordModelPickerModelIndex({
			data: pickerData,
			provider,
			model: selectedModel
		});
		if (!modelIndex) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, that model isn't available anymore.")));
			return;
		}
		const modelRef = `${provider}/${selectedModel}`;
		const rendered = renderDiscordModelPickerModelsView({
			command: parsed.command,
			userId: parsed.userId,
			data: pickerData,
			provider,
			page: parsed.page,
			providerPage: parsed.providerPage ?? 1,
			currentModel: currentModelRef,
			pendingModel: modelRef,
			pendingModelIndex: modelIndex,
			quickModels
		});
		await params.safeInteractionCall("model picker update", () => interaction.update(toDiscordModelPickerMessagePayload(rendered)));
		return;
	}
	if (parsed.action === "submit" || parsed.action === "reset" || parsed.action === "quick") {
		let modelRef = null;
		if (parsed.action === "reset") modelRef = `${pickerData.resolvedDefault.provider}/${pickerData.resolvedDefault.model}`;
		else if (parsed.action === "quick") {
			const slot = parsed.recentSlot ?? 0;
			modelRef = slot >= 1 ? quickModels[slot - 1] ?? null : null;
		} else if (parsed.view === "recents") {
			const defaultModelRef = `${pickerData.resolvedDefault.provider}/${pickerData.resolvedDefault.model}`;
			const dedupedRecents = quickModels.filter((ref) => ref !== defaultModelRef);
			const slot = parsed.recentSlot ?? 0;
			if (slot === 1) modelRef = defaultModelRef;
			else if (slot >= 2) modelRef = dedupedRecents[slot - 2] ?? null;
		} else {
			const provider = parsed.provider;
			const selectedModel = resolveDiscordModelPickerModelByIndex({
				data: pickerData,
				provider: provider ?? "",
				modelIndex: parsed.modelIndex
			});
			modelRef = provider && selectedModel ? `${provider}/${selectedModel}` : null;
		}
		const parsedModelRef = modelRef ? splitDiscordModelRef(modelRef) : null;
		if (!parsedModelRef || !pickerData.byProvider.get(parsedModelRef.provider)?.has(parsedModelRef.model)) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("That selection expired. Please choose a model again.")));
			return;
		}
		const resolvedModelRef = `${parsedModelRef.provider}/${parsedModelRef.model}`;
		const selectionCommand = buildDiscordModelPickerSelectionCommand({ modelRef: resolvedModelRef });
		if (!selectionCommand) {
			await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload("Sorry, /model is unavailable right now.")));
			return;
		}
		if (await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload(`Applying model change to ${resolvedModelRef}...`))) === null) return;
		try {
			await withTimeout(params.dispatchCommandInteraction({
				interaction,
				prompt: selectionCommand.prompt,
				command: selectionCommand.command,
				commandArgs: selectionCommand.args,
				cfg: ctx.cfg,
				discordConfig: ctx.discordConfig,
				accountId: ctx.accountId,
				sessionPrefix: ctx.sessionPrefix,
				preferFollowUp: true,
				threadBindings: ctx.threadBindings,
				suppressReplies: true
			}), 12e3);
		} catch (error) {
			if (error instanceof Error && error.message === "timeout") {
				await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
					...buildDiscordModelPickerNoticePayload(`⏳ Model change to ${resolvedModelRef} is still processing. Check /status in a few seconds.`),
					ephemeral: true
				}));
				return;
			}
			await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
				...buildDiscordModelPickerNoticePayload(`❌ Failed to apply ${resolvedModelRef}. Try /model ${resolvedModelRef} directly.`),
				ephemeral: true
			}));
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
		const effectiveModelRef = resolveDiscordModelPickerCurrentModel({
			cfg: ctx.cfg,
			route,
			data: pickerData
		});
		const persisted = effectiveModelRef === resolvedModelRef;
		if (!persisted) logVerbose(`discord: model picker override mismatch — expected ${resolvedModelRef} but read ${effectiveModelRef} from session key ${route.sessionKey}`);
		if (persisted) await recordDiscordModelPickerRecentModel({
			scope: preferenceScope,
			modelRef: resolvedModelRef,
			limit: 5
		}).catch(() => void 0);
		await params.safeInteractionCall("model picker follow-up", () => interaction.followUp({
			...buildDiscordModelPickerNoticePayload(persisted ? `✅ Model set to ${resolvedModelRef}.` : `⚠️ Tried to set ${resolvedModelRef}, but current model is ${effectiveModelRef}.`),
			ephemeral: true
		}));
		return;
	}
	if (parsed.action === "cancel") {
		const displayModel = currentModelRef ?? "default";
		await params.safeInteractionCall("model picker update", () => interaction.update(buildDiscordModelPickerNoticePayload(`ℹ️ Model kept as ${displayModel}.`)));
	}
}
async function handleDiscordCommandArgInteraction(params) {
	const { interaction, data, ctx } = params;
	const parsed = parseDiscordCommandArgData(data);
	if (!parsed) {
		await params.safeInteractionCall("command arg update", () => interaction.update({
			content: "Sorry, that selection is no longer available.",
			components: []
		}));
		return;
	}
	if (interaction.user?.id && interaction.user.id !== parsed.userId) {
		await params.safeInteractionCall("command arg ack", () => interaction.acknowledge());
		return;
	}
	const commandDefinition = findCommandByNativeName(parsed.command, "discord") ?? listChatCommands().find((entry) => entry.key === parsed.command);
	if (!commandDefinition) {
		await params.safeInteractionCall("command arg update", () => interaction.update({
			content: "Sorry, that command is no longer available.",
			components: []
		}));
		return;
	}
	if (await params.safeInteractionCall("command arg update", () => interaction.update({
		content: `✅ Selected ${parsed.value}.`,
		components: []
	})) === null) return;
	const commandArgs = createCommandArgsWithValue({
		argName: parsed.arg,
		value: parsed.value
	});
	const commandArgsWithRaw = {
		...commandArgs,
		raw: serializeCommandArgs(commandDefinition, commandArgs)
	};
	const prompt = buildCommandTextFromArgs(commandDefinition, commandArgsWithRaw);
	await params.dispatchCommandInteraction({
		interaction,
		prompt,
		command: commandDefinition,
		commandArgs: commandArgsWithRaw,
		cfg: ctx.cfg,
		discordConfig: ctx.discordConfig,
		accountId: ctx.accountId,
		sessionPrefix: ctx.sessionPrefix,
		preferFollowUp: true,
		threadBindings: ctx.threadBindings
	});
}
var DiscordCommandArgButton = class extends Button {
	constructor(params) {
		super();
		this.style = ButtonStyle.Secondary;
		this.label = params.label;
		this.customId = params.customId;
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordCommandArgInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
function buildDiscordCommandArgMenu(params) {
	const { command, menu, interaction } = params;
	const commandLabel = command.nativeName ?? command.key;
	const userId = interaction.user?.id ?? "";
	const rows = chunkItems(menu.choices, 4).map((choices) => {
		return new Row(choices.map((choice) => new DiscordCommandArgButton({
			label: choice.label,
			customId: buildDiscordCommandArgCustomId({
				command: commandLabel,
				arg: menu.arg.name,
				value: choice.value,
				userId
			}),
			ctx: params.ctx,
			safeInteractionCall: params.safeInteractionCall,
			dispatchCommandInteraction: params.dispatchCommandInteraction
		})));
	});
	return {
		content: menu.title ?? `Choose ${menu.arg.description || menu.arg.name} for /${commandLabel}.`,
		components: rows
	};
}
var DiscordCommandArgFallbackButton = class extends Button {
	constructor(params) {
		super();
		this.label = "cmdarg";
		this.customId = "cmdarg:seed=1";
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordCommandArgInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
var DiscordModelPickerFallbackButton = class extends Button {
	constructor(params) {
		super();
		this.label = "modelpick";
		this.customId = `${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:seed=btn`;
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordModelPickerInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
var DiscordModelPickerFallbackSelect = class extends StringSelectMenu {
	constructor(params) {
		super();
		this.customId = `${DISCORD_MODEL_PICKER_CUSTOM_ID_KEY}:seed=sel`;
		this.options = [];
		this.ctx = params.ctx;
		this.safeInteractionCall = params.safeInteractionCall;
		this.dispatchCommandInteraction = params.dispatchCommandInteraction;
	}
	async run(interaction, data) {
		await handleDiscordModelPickerInteraction({
			interaction,
			data,
			ctx: this.ctx,
			safeInteractionCall: this.safeInteractionCall,
			dispatchCommandInteraction: this.dispatchCommandInteraction
		});
	}
};
function createDiscordCommandArgFallbackButton$1(params) {
	return new DiscordCommandArgFallbackButton(params);
}
function createDiscordModelPickerFallbackButton$1(params) {
	return new DiscordModelPickerFallbackButton(params);
}
function createDiscordModelPickerFallbackSelect$1(params) {
	return new DiscordModelPickerFallbackSelect(params);
}
//#endregion
//#region extensions/discord/src/monitor/native-command.ts
const log = createSubsystemLogger("discord/native-command");
function resolveDiscordNativeCommandAllowlistAccess(params) {
	const commandsAllowFrom = params.cfg.commands?.allowFrom;
	if (!commandsAllowFrom || typeof commandsAllowFrom !== "object") return {
		configured: false,
		allowed: false
	};
	const rawAllowList = Array.isArray(commandsAllowFrom.discord) ? commandsAllowFrom.discord : commandsAllowFrom["*"];
	if (!Array.isArray(rawAllowList)) return {
		configured: false,
		allowed: false
	};
	const allowList = normalizeDiscordAllowList(rawAllowList.map(String), [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return {
		configured: true,
		allowed: false
	};
	return {
		configured: true,
		allowed: resolveDiscordAllowListMatch({
			allowList,
			candidate: params.sender,
			allowNameMatching: false
		}).allowed
	};
}
function buildDiscordCommandOptions(params) {
	const { command, cfg } = params;
	const args = command.args;
	if (!args || args.length === 0) return;
	return args.map((arg) => {
		const required = arg.required ?? false;
		if (arg.type === "number") return {
			name: arg.name,
			description: arg.description,
			type: ApplicationCommandOptionType.Number,
			required
		};
		if (arg.type === "boolean") return {
			name: arg.name,
			description: arg.description,
			type: ApplicationCommandOptionType.Boolean,
			required
		};
		const resolvedChoices = resolveCommandArgChoices({
			command,
			arg,
			cfg
		});
		const autocomplete = arg.preferAutocomplete === true || resolvedChoices.length > 0 && (typeof arg.choices === "function" || resolvedChoices.length > 25) ? async (interaction) => {
			const focused = interaction.options.getFocused();
			const focusValue = typeof focused?.value === "string" ? focused.value.trim().toLowerCase() : "";
			const choices = resolveCommandArgChoices({
				command,
				arg,
				cfg
			});
			const filtered = focusValue ? choices.filter((choice) => choice.label.toLowerCase().includes(focusValue)) : choices;
			await interaction.respond(filtered.slice(0, 25).map((choice) => ({
				name: choice.label,
				value: choice.value
			})));
		} : void 0;
		const choices = resolvedChoices.length > 0 && !autocomplete ? resolvedChoices.slice(0, 25).map((choice) => ({
			name: choice.label,
			value: choice.value
		})) : void 0;
		return {
			name: arg.name,
			description: arg.description,
			type: ApplicationCommandOptionType.String,
			required,
			choices,
			autocomplete
		};
	});
}
function shouldBypassConfiguredAcpEnsure(commandName) {
	const normalized = commandName.trim().toLowerCase();
	return normalized === "acp" || normalized === "new" || normalized === "reset";
}
function readDiscordCommandArgs(interaction, definitions) {
	if (!definitions || definitions.length === 0) return;
	const values = {};
	for (const definition of definitions) {
		let value;
		if (definition.type === "number") value = interaction.options.getNumber(definition.name) ?? null;
		else if (definition.type === "boolean") value = interaction.options.getBoolean(definition.name) ?? null;
		else value = interaction.options.getString(definition.name) ?? null;
		if (value != null) values[definition.name] = value;
	}
	return Object.keys(values).length > 0 ? { values } : void 0;
}
function isDiscordUnknownInteraction(error) {
	if (!error || typeof error !== "object") return false;
	const err = error;
	if (err.discordCode === 10062 || err.rawBody?.code === 10062) return true;
	if (err.status === 404 && /Unknown interaction/i.test(err.message ?? "")) return true;
	if (/Unknown interaction/i.test(err.rawBody?.message ?? "")) return true;
	return false;
}
function hasRenderableReplyPayload(payload) {
	if (resolveSendableOutboundReplyParts(payload).hasContent) return true;
	const discordData = payload.channelData?.discord;
	if (Array.isArray(discordData?.components) && discordData.components.length > 0) return true;
	return false;
}
async function safeDiscordInteractionCall(label, fn) {
	try {
		return await fn();
	} catch (error) {
		if (isDiscordUnknownInteraction(error)) {
			logVerbose(`discord: ${label} skipped (interaction expired)`);
			return null;
		}
		throw error;
	}
}
function createDiscordNativeCommand(params) {
	const { command, cfg, discordConfig, accountId, sessionPrefix, ephemeralDefault, threadBindings } = params;
	const commandDefinition = findCommandByNativeName(command.name, "discord") ?? {
		key: command.name,
		nativeName: command.name,
		description: command.description,
		textAliases: [],
		acceptsArgs: command.acceptsArgs,
		args: command.args,
		argsParsing: "none",
		scope: "native"
	};
	const argDefinitions = commandDefinition.args ?? command.args;
	const commandOptions = buildDiscordCommandOptions({
		command: commandDefinition,
		cfg
	});
	const options = commandOptions ? commandOptions : command.acceptsArgs ? [{
		name: "input",
		description: "Command input",
		type: ApplicationCommandOptionType.String,
		required: false
	}] : void 0;
	return new class extends Command {
		constructor(..._args) {
			super(..._args);
			this.name = command.name;
			this.description = command.description;
			this.defer = true;
			this.ephemeral = ephemeralDefault;
			this.options = options;
		}
		async run(interaction) {
			const commandArgs = argDefinitions?.length ? readDiscordCommandArgs(interaction, argDefinitions) : command.acceptsArgs ? parseCommandArgs(commandDefinition, interaction.options.getString("input") ?? "") : void 0;
			const commandArgsWithRaw = commandArgs ? {
				...commandArgs,
				raw: serializeCommandArgs(commandDefinition, commandArgs) ?? commandArgs.raw
			} : void 0;
			await dispatchDiscordCommandInteraction({
				interaction,
				prompt: buildCommandTextFromArgs(commandDefinition, commandArgsWithRaw),
				command: commandDefinition,
				commandArgs: commandArgsWithRaw,
				cfg,
				discordConfig,
				accountId,
				sessionPrefix,
				preferFollowUp: false,
				threadBindings
			});
		}
	}();
}
async function dispatchDiscordCommandInteraction(params) {
	const { interaction, prompt, command, commandArgs, cfg, discordConfig, accountId, sessionPrefix, preferFollowUp, threadBindings, suppressReplies } = params;
	const respond = async (content, options) => {
		const payload = {
			content,
			...options?.ephemeral !== void 0 ? { ephemeral: options.ephemeral } : {}
		};
		await safeDiscordInteractionCall("interaction reply", async () => {
			if (preferFollowUp) {
				await interaction.followUp(payload);
				return;
			}
			await interaction.reply(payload);
		});
	};
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const user = interaction.user;
	if (!user) return;
	const sender = resolveDiscordSenderIdentity({
		author: user,
		pluralkitInfo: null
	});
	const channel = interaction.channel;
	const channelType = channel?.type;
	const isDirectMessage = channelType === ChannelType.DM;
	const isGroupDm = channelType === ChannelType.GroupDM;
	const isThreadChannel = channelType === ChannelType.PublicThread || channelType === ChannelType.PrivateThread || channelType === ChannelType.AnnouncementThread;
	const channelName = channel && "name" in channel ? channel.name : void 0;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const rawChannelId = channel?.id ?? "";
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	const allowNameMatching = isDangerousNameMatchingEnabled(discordConfig);
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		allowNameMatching
	});
	const commandsAllowFromAccess = resolveDiscordNativeCommandAllowlistAccess({
		cfg,
		accountId,
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		chatType: isDirectMessage ? "direct" : isThreadChannel ? "thread" : interaction.guild ? "channel" : "group",
		conversationId: rawChannelId || void 0
	});
	const guildInfo = resolveDiscordGuildEntry({
		guild: interaction.guild ?? void 0,
		guildId: interaction.guild?.id ?? void 0,
		guildEntries: discordConfig?.guilds
	});
	let threadParentId;
	let threadParentName;
	let threadParentSlug = "";
	if (interaction.guild && channel && isThreadChannel && rawChannelId) {
		const channelInfo = await resolveDiscordChannelInfo(interaction.client, rawChannelId);
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: rawChannelId,
				name: channelName,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0,
				parent: void 0
			},
			channelInfo
		});
		threadParentId = parentInfo.id;
		threadParentName = parentInfo.name;
		threadParentSlug = threadParentName ? normalizeDiscordSlug(threadParentName) : "";
	}
	const channelConfig = interaction.guild ? resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: rawChannelId,
		channelName,
		channelSlug,
		parentId: threadParentId,
		parentName: threadParentName,
		parentSlug: threadParentSlug,
		scope: isThreadChannel ? "thread" : "channel"
	}) : null;
	if (channelConfig?.enabled === false) {
		await respond("This channel is disabled.");
		return;
	}
	if (interaction.guild && channelConfig?.allowed === false) {
		await respond("This channel is not allowed.");
		return;
	}
	if (useAccessGroups && interaction.guild) {
		const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
		const channelAllowed = channelConfig?.allowed !== false;
		const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
			providerConfigPresent: cfg.channels?.discord !== void 0,
			groupPolicy: discordConfig?.groupPolicy,
			defaultGroupPolicy: cfg.channels?.defaults?.groupPolicy
		});
		if (!isDiscordGroupAllowedByPolicy({
			groupPolicy,
			guildAllowlisted: Boolean(guildInfo),
			channelAllowlistConfigured,
			channelAllowed
		})) {
			await respond("This channel is not allowed.");
			return;
		}
	}
	const dmEnabled = discordConfig?.dm?.enabled ?? true;
	const dmPolicy = discordConfig?.dmPolicy ?? discordConfig?.dm?.policy ?? "pairing";
	let commandAuthorized = true;
	if (isDirectMessage) {
		if (!dmEnabled || dmPolicy === "disabled") {
			await respond("Discord DMs are disabled.");
			return;
		}
		const dmAccess = await resolveDiscordDmCommandAccess({
			accountId,
			dmPolicy,
			configuredAllowFrom: discordConfig?.allowFrom ?? discordConfig?.dm?.allowFrom ?? [],
			sender: {
				id: sender.id,
				name: sender.name,
				tag: sender.tag
			},
			allowNameMatching,
			useAccessGroups
		});
		commandAuthorized = dmAccess.commandAuthorized;
		if (dmAccess.decision !== "allow") {
			await handleDiscordDmCommandDecision({
				dmAccess,
				accountId,
				sender: {
					id: user.id,
					tag: sender.tag,
					name: sender.name
				},
				onPairingCreated: async (code) => {
					await respond(buildPairingReply({
						channel: "discord",
						idLine: `Your Discord user id: ${user.id}`,
						code
					}), { ephemeral: true });
				},
				onUnauthorized: async () => {
					await respond("You are not authorized to use this command.", { ephemeral: true });
				}
			});
			return;
		}
	}
	if (!isDirectMessage) {
		const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
			channelConfig,
			guildInfo,
			memberRoleIds,
			sender,
			allowNameMatching
		});
		commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
			useAccessGroups,
			authorizers: useAccessGroups ? [
				{
					configured: commandsAllowFromAccess.configured,
					allowed: commandsAllowFromAccess.allowed
				},
				{
					configured: ownerAllowList != null,
					allowed: ownerOk
				},
				{
					configured: hasAccessRestrictions,
					allowed: memberAllowed
				}
			] : [{
				configured: commandsAllowFromAccess.configured,
				allowed: commandsAllowFromAccess.allowed
			}, {
				configured: hasAccessRestrictions,
				allowed: memberAllowed
			}],
			modeWhenAccessGroupsOff: "configured"
		});
		if (!commandAuthorized) {
			await respond("You are not authorized to use this command.", { ephemeral: true });
			return;
		}
	}
	if (isGroupDm && discordConfig?.dm?.groupEnabled === false) {
		await respond("Discord group DMs are disabled.");
		return;
	}
	const menu = resolveCommandArgMenu({
		command,
		args: commandArgs,
		cfg
	});
	if (menu) {
		const menuPayload = buildDiscordCommandArgMenu({
			command,
			menu,
			interaction,
			ctx: {
				cfg,
				discordConfig,
				accountId,
				sessionPrefix,
				threadBindings
			},
			safeInteractionCall: safeDiscordInteractionCall,
			dispatchCommandInteraction: dispatchDiscordCommandInteraction
		});
		if (preferFollowUp) {
			await safeDiscordInteractionCall("interaction follow-up", () => interaction.followUp({
				content: menuPayload.content,
				components: menuPayload.components,
				ephemeral: true
			}));
			return;
		}
		await safeDiscordInteractionCall("interaction reply", () => interaction.reply({
			content: menuPayload.content,
			components: menuPayload.components,
			ephemeral: true
		}));
		return;
	}
	const pluginMatch = matchPluginCommand(prompt);
	if (pluginMatch) {
		if (suppressReplies) return;
		const channelId = rawChannelId || "unknown";
		const pluginReply = await executePluginCommand({
			command: pluginMatch.command,
			args: pluginMatch.args,
			senderId: sender.id,
			channel: "discord",
			channelId,
			isAuthorizedSender: commandAuthorized,
			commandBody: prompt,
			config: cfg,
			from: isDirectMessage ? `discord:${user.id}` : isGroupDm ? `discord:group:${channelId}` : `discord:channel:${channelId}`,
			to: `slash:${user.id}`,
			accountId
		});
		if (!hasRenderableReplyPayload(pluginReply)) {
			await respond("Done.");
			return;
		}
		await deliverDiscordInteractionReply({
			interaction,
			payload: pluginReply,
			textLimit: resolveTextChunkLimit(cfg, "discord", accountId, { fallbackLimit: 2e3 }),
			maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
				cfg,
				discordConfig,
				accountId
			}),
			preferFollowUp,
			chunkMode: resolveChunkMode(cfg, "discord", accountId)
		});
		return;
	}
	const pickerCommandContext = shouldOpenDiscordModelPickerFromCommand({
		command,
		commandArgs
	});
	if (pickerCommandContext) {
		await replyWithDiscordModelPickerProviders({
			interaction,
			cfg,
			command: pickerCommandContext,
			userId: user.id,
			accountId,
			threadBindings,
			preferFollowUp,
			safeInteractionCall: safeDiscordInteractionCall
		});
		return;
	}
	const isGuild = Boolean(interaction.guild);
	const channelId = rawChannelId || "unknown";
	const interactionId = interaction.rawData.id;
	const route = resolveDiscordBoundConversationRoute({
		cfg,
		accountId,
		guildId: interaction.guild?.id ?? void 0,
		memberRoleIds,
		isDirectMessage,
		isGroupDm,
		directUserId: user.id,
		conversationId: channelId,
		parentConversationId: threadParentId
	});
	const threadBinding = isThreadChannel ? threadBindings.getByThreadId(rawChannelId) : void 0;
	const configuredRoute = threadBinding == null ? resolveConfiguredBindingRoute({
		cfg,
		route,
		conversation: {
			channel: "discord",
			accountId,
			conversationId: channelId,
			parentConversationId: threadParentId
		}
	}) : null;
	const configuredBinding = configuredRoute?.bindingResolution ?? null;
	const commandName = command.nativeName ?? command.key;
	if (configuredBinding && !shouldBypassConfiguredAcpEnsure(commandName)) {
		const ensured = await ensureConfiguredBindingRouteReady({
			cfg,
			bindingResolution: configuredBinding
		});
		if (!ensured.ok) {
			logVerbose(`discord native command: configured ACP binding unavailable for channel ${configuredBinding.record.conversation.conversationId}: ${ensured.error}`);
			await respond("Configured ACP binding is unavailable right now. Please try again.");
			return;
		}
	}
	const configuredBoundSessionKey = configuredRoute?.boundSessionKey?.trim() || void 0;
	const boundSessionKey = threadBinding?.targetSessionKey?.trim() || configuredBoundSessionKey;
	const effectiveRoute = resolveDiscordEffectiveRoute({
		route,
		boundSessionKey,
		configuredRoute,
		matchedBy: configuredBinding ? "binding.channel" : void 0
	});
	const { sessionKey, commandTargetSessionKey } = resolveNativeCommandSessionTargets({
		agentId: effectiveRoute.agentId,
		sessionPrefix,
		userId: user.id,
		targetSessionKey: effectiveRoute.sessionKey,
		boundSessionKey
	});
	const ctxPayload = buildDiscordNativeCommandContext({
		prompt,
		commandArgs: commandArgs ?? {},
		sessionKey,
		commandTargetSessionKey,
		accountId: effectiveRoute.accountId,
		interactionId,
		channelId,
		threadParentId,
		guildName: interaction.guild?.name,
		channelTopic: channel && "topic" in channel ? channel.topic ?? void 0 : void 0,
		channelConfig,
		guildInfo,
		allowNameMatching,
		commandAuthorized,
		isDirectMessage,
		isGroupDm,
		isGuild,
		isThreadChannel,
		user: {
			id: user.id,
			username: user.username,
			globalName: user.globalName
		},
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		}
	});
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg,
		agentId: effectiveRoute.agentId,
		channel: "discord",
		accountId: effectiveRoute.accountId
	});
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, effectiveRoute.agentId);
	let didReply = false;
	const dispatchResult = await dispatchReplyWithDispatcher({
		ctx: ctxPayload,
		cfg,
		dispatcherOptions: {
			...replyPipeline,
			humanDelay: resolveHumanDelayConfig(cfg, effectiveRoute.agentId),
			deliver: async (payload) => {
				if (suppressReplies) return;
				try {
					await deliverDiscordInteractionReply({
						interaction,
						payload,
						mediaLocalRoots,
						textLimit: resolveTextChunkLimit(cfg, "discord", accountId, { fallbackLimit: 2e3 }),
						maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
							cfg,
							discordConfig,
							accountId
						}),
						preferFollowUp: preferFollowUp || didReply,
						chunkMode: resolveChunkMode(cfg, "discord", accountId)
					});
				} catch (error) {
					if (isDiscordUnknownInteraction(error)) {
						logVerbose("discord: interaction reply skipped (interaction expired)");
						return;
					}
					throw error;
				}
				didReply = true;
			},
			onError: (err, info) => {
				const message = err instanceof Error ? err.stack ?? err.message : String(err);
				log.error(`discord slash ${info.kind} reply failed: ${message}`);
			}
		},
		replyOptions: {
			skillFilter: channelConfig?.skills,
			disableBlockStreaming: typeof discordConfig?.blockStreaming === "boolean" ? !discordConfig.blockStreaming : void 0,
			onModelSelected
		}
	});
	if (!suppressReplies && !didReply && dispatchResult.counts.final === 0 && dispatchResult.counts.block === 0 && dispatchResult.counts.tool === 0) await safeDiscordInteractionCall("interaction empty fallback", async () => {
		const payload = {
			content: "✅ Done.",
			ephemeral: true
		};
		if (preferFollowUp) {
			await interaction.followUp(payload);
			return;
		}
		await interaction.reply(payload);
	});
}
function createDiscordCommandArgFallbackButton(params) {
	return createDiscordCommandArgFallbackButton$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
function createDiscordModelPickerFallbackButton(params) {
	return createDiscordModelPickerFallbackButton$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
function createDiscordModelPickerFallbackSelect(params) {
	return createDiscordModelPickerFallbackSelect$1({
		ctx: params,
		safeInteractionCall: safeDiscordInteractionCall,
		dispatchCommandInteraction: dispatchDiscordCommandInteraction
	});
}
async function deliverDiscordInteractionReply(params) {
	const { interaction, payload, textLimit, maxLinesPerMessage, preferFollowUp, chunkMode } = params;
	const reply = resolveSendableOutboundReplyParts(payload);
	const discordData = payload.channelData?.discord;
	let firstMessageComponents = Array.isArray(discordData?.components) && discordData.components.length > 0 ? discordData.components : void 0;
	let hasReplied = false;
	const sendMessage = async (content, files, components) => {
		const payload = files && files.length > 0 ? {
			content,
			...components ? { components } : {},
			files: files.map((file) => {
				if (file.data instanceof Blob) return {
					name: file.name,
					data: file.data
				};
				const arrayBuffer = Uint8Array.from(file.data).buffer;
				return {
					name: file.name,
					data: new Blob([arrayBuffer])
				};
			})
		} : {
			content,
			...components ? { components } : {}
		};
		await safeDiscordInteractionCall("interaction send", async () => {
			if (!preferFollowUp && !hasReplied) {
				await interaction.reply(payload);
				hasReplied = true;
				firstMessageComponents = void 0;
				return;
			}
			await interaction.followUp(payload);
			hasReplied = true;
			firstMessageComponents = void 0;
		});
	};
	if (reply.hasMedia) {
		const media = await Promise.all(reply.mediaUrls.map(async (url) => {
			const loaded = await loadWebMedia(url, { localRoots: params.mediaLocalRoots });
			return {
				name: loaded.fileName ?? "upload",
				data: loaded.buffer
			};
		}));
		const chunks = resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
			maxChars: textLimit,
			maxLines: maxLinesPerMessage,
			chunkMode
		}));
		await sendMessage(chunks[0] ?? "", media, firstMessageComponents);
		for (const chunk of chunks.slice(1)) {
			if (!chunk.trim()) continue;
			await interaction.followUp({ content: chunk });
		}
		return;
	}
	if (!reply.hasText && !firstMessageComponents) return;
	const chunks = reply.text || firstMessageComponents ? resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
		maxChars: textLimit,
		maxLines: maxLinesPerMessage,
		chunkMode
	})) : [];
	for (const chunk of chunks) {
		if (!chunk.trim() && !firstMessageComponents) continue;
		await sendMessage(chunk, void 0, firstMessageComponents);
	}
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/BabyCache.js
var BabyCache = class {
	guildCache = /* @__PURE__ */ new Map();
	maxGuilds;
	ttl;
	constructor(maxGuilds = 5e3, ttl = 864e5) {
		this.maxGuilds = maxGuilds;
		this.ttl = ttl;
	}
	setGuild(guildId, entry) {
		if (this.guildCache.size >= this.maxGuilds && !this.guildCache.has(guildId)) {
			let oldestId = null;
			let oldestTime = Number.POSITIVE_INFINITY;
			for (const [id, guild] of this.guildCache.entries()) if (guild.lastEvent < oldestTime) {
				oldestTime = guild.lastEvent;
				oldestId = id;
			}
			if (oldestId) this.guildCache.delete(oldestId);
		}
		this.guildCache.set(guildId, entry);
	}
	getGuild(guildId) {
		const entry = this.guildCache.get(guildId);
		if (!entry) return void 0;
		if (Date.now() - entry.lastEvent > this.ttl) {
			this.guildCache.delete(guildId);
			return;
		}
		return entry;
	}
	removeGuild(guildId) {
		return this.guildCache.delete(guildId);
	}
	cleanup() {
		const now = Date.now();
		let removed = 0;
		for (const [id, entry] of this.guildCache.entries()) if (now - entry.lastEvent > this.ttl) {
			this.guildCache.delete(id);
			removed++;
		}
		return removed;
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/InteractionEventListener.js
var InteractionEventListener = class extends InteractionCreateListener {
	type = ListenerEvent.InteractionCreate;
	async handle(data, client) {
		await client.handleInteraction(data, {});
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/types.js
const GatewayOpcodes = GatewayOpcodes$1;
const GatewayCloseCodes = GatewayCloseCodes$1;
const GatewayIntents = GatewayIntentBits;
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/heartbeat.js
function startHeartbeat(manager, options) {
	stopHeartbeat(manager);
	manager.lastHeartbeatAck = true;
	const jitter = Math.random();
	const initialDelay = Math.floor(options.interval * jitter);
	const interval = options.interval;
	const sendHeartbeat = () => {
		if (!manager.lastHeartbeatAck) {
			options.reconnectCallback();
			return;
		}
		manager.lastHeartbeatAck = false;
		manager.send({
			op: GatewayOpcodes.Heartbeat,
			d: manager.sequence
		});
	};
	manager.firstHeartbeatTimeout = setTimeout(() => {
		sendHeartbeat();
		manager.heartbeatInterval = setInterval(sendHeartbeat, interval);
	}, initialDelay);
}
function stopHeartbeat(manager) {
	if (manager.firstHeartbeatTimeout) {
		clearTimeout(manager.firstHeartbeatTimeout);
		manager.firstHeartbeatTimeout = void 0;
	}
	if (manager.heartbeatInterval) {
		clearInterval(manager.heartbeatInterval);
		manager.heartbeatInterval = void 0;
	}
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/monitor.js
var ConnectionMonitor = class extends EventEmitter {
	metrics = {
		latency: 0,
		uptime: 0,
		reconnects: 0,
		zombieConnections: 0,
		messagesReceived: 0,
		messagesSent: 0,
		errors: 0
	};
	startTime = Date.now();
	lastHeartbeat = 0;
	metricsInterval;
	config;
	constructor(config = {}) {
		super();
		this.config = {
			interval: config.interval ?? 6e4,
			latencyThreshold: config.latencyThreshold ?? 1e3
		};
		this.metricsInterval = this.createMetricsInterval();
	}
	createMetricsInterval() {
		return setInterval(() => {
			this.metrics.uptime = Date.now() - this.startTime;
			this.emit("metrics", this.getMetrics());
			if (this.metrics.latency > this.config.latencyThreshold) this.emit("warning", `High latency detected: ${this.metrics.latency}ms`);
			const errorRate = (this.metrics.errors / (this.metrics.uptime / 6e4)).toFixed(1);
			if (Number(errorRate) > 5) this.emit("warning", `High error rate detected: ${errorRate} errors/minute`);
		}, this.config.interval);
	}
	recordError() {
		this.metrics.errors++;
	}
	recordZombieConnection() {
		this.metrics.zombieConnections++;
	}
	recordHeartbeat() {
		this.lastHeartbeat = Date.now();
	}
	recordHeartbeatAck() {
		if (this.lastHeartbeat > 0) this.metrics.latency = Date.now() - this.lastHeartbeat;
	}
	recordReconnect() {
		this.metrics.reconnects++;
	}
	recordMessageReceived() {
		this.metrics.messagesReceived++;
	}
	recordMessageSent() {
		this.metrics.messagesSent++;
	}
	resetUptime() {
		clearInterval(this.metricsInterval);
		this.metrics.uptime = 0;
		this.startTime = Date.now();
		this.metricsInterval = this.createMetricsInterval();
	}
	getMetrics() {
		return { ...this.metrics };
	}
	reset() {
		this.metrics = {
			latency: 0,
			uptime: 0,
			reconnects: 0,
			zombieConnections: 0,
			messagesReceived: 0,
			messagesSent: 0,
			errors: 0
		};
		this.startTime = Date.now();
		this.lastHeartbeat = 0;
	}
	destroy() {
		clearInterval(this.metricsInterval);
		this.removeAllListeners();
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/payload.js
function validatePayload(data) {
	try {
		const payload = JSON.parse(data);
		if (!payload || typeof payload !== "object") {
			console.error("[Gateway] Invalid payload: Not an object", { data });
			return null;
		}
		if (!("op" in payload) || typeof payload.op !== "number") {
			console.error("[Gateway] Invalid payload: Missing or invalid op code", { data });
			return null;
		}
		if (!("d" in payload)) {
			console.error("[Gateway] Invalid payload: Missing data field", { data });
			return null;
		}
		return payload;
	} catch (error) {
		console.error("[Gateway] Failed to validate payload:", error, { data });
		return null;
	}
}
function createIdentifyPayload(data) {
	return {
		op: GatewayOpcodes.Identify,
		d: {
			token: data.token,
			properties: data.properties,
			intents: data.intents,
			...data.shard ? { shard: data.shard } : {}
		}
	};
}
function createResumePayload(data) {
	return {
		op: GatewayOpcodes.Resume,
		d: {
			token: data.token,
			session_id: data.sessionId,
			seq: data.sequence
		}
	};
}
function createUpdatePresencePayload(data) {
	return {
		op: GatewayOpcodes.PresenceUpdate,
		d: data
	};
}
function createUpdateVoiceStatePayload(data) {
	return {
		op: GatewayOpcodes.VoiceStateUpdate,
		d: data
	};
}
function createRequestGuildMembersPayload(data) {
	return {
		op: GatewayOpcodes.RequestGuildMembers,
		d: data
	};
}
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/utils/rateLimit.js
var GatewayRateLimit = class {
	events = [];
	config;
	constructor(config = {
		maxEvents: 120,
		windowMs: 6e4
	}) {
		this.config = config;
	}
	/**
	* Check if sending an event would exceed the rate limit
	* @returns true if the event can be sent, false if rate limited
	*/
	canSend() {
		this.cleanupOldEvents();
		return this.events.length < this.config.maxEvents;
	}
	/**
	* Record that an event was sent
	*/
	recordEvent() {
		this.events.push(Date.now());
	}
	/**
	* Get the current number of events in the time window
	*/
	getCurrentEventCount() {
		this.cleanupOldEvents();
		return this.events.length;
	}
	/**
	* Get remaining events before hitting rate limit
	*/
	getRemainingEvents() {
		return Math.max(0, this.config.maxEvents - this.getCurrentEventCount());
	}
	/**
	* Get time until rate limit resets (in milliseconds)
	*/
	getResetTime() {
		this.cleanupOldEvents();
		if (this.events.length === 0) return 0;
		const oldestEvent = this.events[0];
		if (!oldestEvent) return 0;
		return Math.max(0, this.config.windowMs - (Date.now() - oldestEvent));
	}
	/**
	* Remove events outside the current time window
	*/
	cleanupOldEvents() {
		const cutoff = Date.now() - this.config.windowMs;
		this.events = this.events.filter((timestamp) => timestamp > cutoff);
	}
	/**
	* Reset the rate limiter
	*/
	reset() {
		this.events = [];
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/gateway/GatewayPlugin.js
var GatewayPlugin = class extends Plugin {
	id = "gateway";
	client;
	options;
	state;
	ws = null;
	monitor;
	rateLimit;
	heartbeatInterval;
	sequence = null;
	lastHeartbeatAck = true;
	emitter;
	reconnectAttempts = 0;
	shardId;
	totalShards;
	gatewayInfo;
	isConnected = false;
	pings = [];
	babyCache;
	reconnectTimeout;
	isConnecting = false;
	constructor(options, gatewayInfo) {
		super();
		this.options = {
			reconnect: {
				maxAttempts: 5,
				baseDelay: 1e3,
				maxDelay: 3e4
			},
			...options
		};
		this.state = {
			sequence: null,
			sessionId: null,
			resumeGatewayUrl: null
		};
		this.monitor = new ConnectionMonitor();
		this.rateLimit = new GatewayRateLimit();
		this.emitter = new EventEmitter();
		this.gatewayInfo = gatewayInfo;
		this.babyCache = new BabyCache();
		this.monitor.on("metrics", (metrics) => this.emitter.emit("metrics", metrics));
		this.monitor.on("warning", (warning) => this.emitter.emit("warning", warning));
	}
	get ping() {
		return this.pings.length ? this.pings.reduce((a, b) => a + b, 0) / this.pings.length : null;
	}
	async registerClient(client) {
		this.client = client;
		if (!this.gatewayInfo) try {
			this.gatewayInfo = await (await fetch("https://discord.com/api/v10/gateway/bot", { headers: { Authorization: `Bot ${client.options.token}` } })).json();
		} catch (error) {
			throw new Error(`Failed to get gateway information from Discord: ${error instanceof Error ? error.message : String(error)}`);
		}
		if (this.options.shard) {
			client.shardId = this.options.shard[0];
			client.totalShards = this.options.shard[1];
		}
		if (this.options.autoInteractions) this.client?.registerListener(new InteractionEventListener());
		this.connect();
	}
	connect(resume = false) {
		if (this.isConnecting) return;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = void 0;
		}
		this.ws?.close();
		const baseUrl = resume && this.state.resumeGatewayUrl ? this.state.resumeGatewayUrl : this.gatewayInfo?.url ?? this.options.url ?? "wss://gateway.discord.gg/";
		const url = this.ensureGatewayParams(baseUrl);
		this.ws = this.createWebSocket(url);
		this.isConnecting = true;
		this.setupWebSocket();
	}
	disconnect() {
		stopHeartbeat(this);
		this.lastHeartbeatAck = true;
		this.monitor.resetUptime();
		this.ws?.close();
		this.ws = null;
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = void 0;
		}
		this.isConnecting = false;
		this.isConnected = false;
		this.pings = [];
	}
	createWebSocket(url) {
		if (!url) throw new Error("Gateway URL is required");
		return new WebSocket(url);
	}
	setupWebSocket() {
		if (!this.ws) return;
		let closed = false;
		this.ws.on("open", () => {
			this.isConnecting = false;
			this.emitter.emit("debug", "WebSocket connection opened");
		});
		this.ws.on("message", (data) => {
			this.monitor.recordMessageReceived();
			const payload = validatePayload(data.toString());
			if (!payload) {
				this.monitor.recordError();
				this.emitter.emit("error", /* @__PURE__ */ new Error("Invalid gateway payload received"));
				return;
			}
			const { op, d, s, t } = payload;
			if (s !== null && s !== void 0) {
				this.sequence = s;
				this.state.sequence = s;
			}
			switch (op) {
				case GatewayOpcodes.Hello: {
					const interval = d.heartbeat_interval;
					startHeartbeat(this, {
						interval,
						reconnectCallback: () => {
							if (closed) return;
							closed = true;
							this.handleZombieConnection();
						}
					});
					if (this.canResume()) this.resume();
					else this.identify();
					break;
				}
				case GatewayOpcodes.HeartbeatAck: {
					this.lastHeartbeatAck = true;
					this.monitor.recordHeartbeatAck();
					const latency = this.monitor.getMetrics().latency;
					if (latency > 0) {
						this.pings.push(latency);
						if (this.pings.length > 10) this.pings.shift();
					}
					break;
				}
				case GatewayOpcodes.Heartbeat:
					this.lastHeartbeatAck = false;
					this.send({
						op: GatewayOpcodes.Heartbeat,
						d: this.sequence
					});
					break;
				case GatewayOpcodes.Dispatch: {
					const payload1 = payload;
					const t1 = payload1.t;
					try {
						if (!Object.values(ListenerEvent).includes(t1)) break;
						if (t1 === "READY") {
							const readyData = d;
							this.state.sessionId = readyData.session_id;
							this.state.resumeGatewayUrl = readyData.resume_gateway_url;
						}
						if (t1 === "READY" || t1 === "RESUMED") {
							this.isConnected = true;
							this.reconnectAttempts = 0;
						}
						if (t && this.client) {
							if (!this.options.eventFilter || this.options.eventFilter?.(t1)) {
								if (t1 === "READY") d.guilds.forEach((guild) => {
									this.babyCache.setGuild(guild.id, {
										available: false,
										lastEvent: Date.now()
									});
								});
								if (t1 === "GUILD_CREATE") {
									const guildCreateData = d;
									const existingGuild = this.babyCache.getGuild(guildCreateData.id);
									if (existingGuild && !existingGuild.available) {
										this.babyCache.setGuild(guildCreateData.id, {
											available: true,
											lastEvent: Date.now()
										});
										this.client.eventHandler.handleEvent({
											...guildCreateData,
											clientId: this.client.options.clientId
										}, "GUILD_AVAILABLE");
										break;
									}
								}
								if (t1 === "GUILD_DELETE") {
									const guildDeleteData = d;
									if (this.babyCache.getGuild(guildDeleteData.id)?.available && guildDeleteData.unavailable) {
										this.babyCache.setGuild(guildDeleteData.id, {
											available: false,
											lastEvent: Date.now()
										});
										this.client.eventHandler.handleEvent({
											...guildDeleteData,
											clientId: this.client.options.clientId
										}, "GUILD_UNAVAILABLE");
										break;
									}
								}
								this.client.eventHandler.handleEvent({
									...payload1.d,
									clientId: this.client.options.clientId
								}, t1);
							}
						}
					} catch (err) {
						console.error(err);
					}
					break;
				}
				case GatewayOpcodes.InvalidSession: {
					const canResume = Boolean(d);
					setTimeout(() => {
						closed = true;
						if (canResume && this.canResume()) this.connect(true);
						else {
							this.state.sessionId = null;
							this.state.resumeGatewayUrl = null;
							this.state.sequence = null;
							this.sequence = null;
							this.pings = [];
							this.connect(false);
						}
					}, 5e3);
					break;
				}
				case GatewayOpcodes.Reconnect:
					if (closed) return;
					closed = true;
					this.state.sequence = this.sequence;
					this.ws?.close();
					this.handleReconnect();
					break;
			}
		});
		this.ws.on("close", (code, _reason) => {
			this.isConnecting = false;
			this.emitter.emit("debug", `WebSocket connection closed with code ${code}`);
			this.monitor.recordReconnect();
			if (closed) return;
			closed = true;
			this.handleClose(code);
		});
		this.ws.on("error", (error) => {
			this.isConnecting = false;
			this.monitor.recordError();
			this.emitter.emit("error", error);
		});
	}
	handleReconnectionAttempt(options) {
		const { maxAttempts = 5, baseDelay = 1e3, maxDelay = 3e4 } = this.options.reconnect ?? {};
		if (this.reconnectAttempts >= maxAttempts) {
			this.emitter.emit("error", /* @__PURE__ */ new Error(`Max reconnect attempts (${maxAttempts}) reached${options.code ? ` after code ${options.code}` : ""}`));
			this.monitor.destroy();
			return;
		}
		if (options.code) switch (options.code) {
			case GatewayCloseCodes.AuthenticationFailed:
			case GatewayCloseCodes.InvalidAPIVersion:
			case GatewayCloseCodes.InvalidIntents:
			case GatewayCloseCodes.DisallowedIntents:
			case GatewayCloseCodes.ShardingRequired:
				this.emitter.emit("error", /* @__PURE__ */ new Error(`Fatal Gateway error: ${options.code}`));
				this.reconnectAttempts = maxAttempts;
				this.monitor.destroy();
				return;
			case GatewayCloseCodes.InvalidSeq:
			case GatewayCloseCodes.SessionTimedOut:
				this.state.sessionId = null;
				this.state.resumeGatewayUrl = null;
				this.state.sequence = null;
				this.sequence = null;
				this.pings = [];
				options.forceNoResume = true;
				break;
		}
		if (this.reconnectTimeout || this.isConnecting) return;
		if (this.reconnectAttempts >= 3 && this.canResume()) {
			this.emitter.emit("debug", `Session invalidated after ${this.reconnectAttempts} failed resume attempts — forcing fresh IDENTIFY`);
			this.state.sessionId = null;
			this.state.resumeGatewayUrl = null;
			this.state.sequence = null;
			this.sequence = null;
			this.pings = [];
			options.forceNoResume = true;
		}
		this.disconnect();
		const backoffTime = Math.min(baseDelay * 2 ** this.reconnectAttempts, maxDelay);
		this.reconnectAttempts++;
		if (options.isZombieConnection) this.monitor.recordZombieConnection();
		const shouldResume = !options.forceNoResume && this.canResume();
		this.emitter.emit("debug", `${shouldResume ? "Attempting resume" : "Reconnecting"} with backoff: ${backoffTime}ms${options.code ? ` after code ${options.code}` : ""}`);
		this.reconnectTimeout = setTimeout(() => {
			this.reconnectTimeout = void 0;
			this.connect(shouldResume);
		}, backoffTime);
	}
	handleClose(code) {
		this.handleReconnectionAttempt({ code });
	}
	handleZombieConnection() {
		this.handleReconnectionAttempt({ isZombieConnection: true });
	}
	handleReconnect() {
		this.handleReconnectionAttempt({});
	}
	canResume() {
		return Boolean(this.state.sessionId && this.sequence !== null);
	}
	resume() {
		if (!this.client || !this.state.sessionId || this.sequence === null) return;
		const payload = createResumePayload({
			token: this.client.options.token,
			sessionId: this.state.sessionId,
			sequence: this.sequence
		});
		this.send(payload, true);
	}
	send(payload, skipRateLimit = false) {
		if (this.ws && this.ws.readyState === 1) {
			const isEssentialEvent = payload.op === GatewayOpcodes.Heartbeat || payload.op === GatewayOpcodes.Identify || payload.op === GatewayOpcodes.Resume;
			if (!skipRateLimit && !isEssentialEvent && !this.rateLimit.canSend()) throw new Error(`Gateway rate limit exceeded. ${this.rateLimit.getRemainingEvents()} events remaining. Reset in ${this.rateLimit.getResetTime()}ms`);
			this.ws.send(JSON.stringify(payload));
			this.monitor.recordMessageSent();
			if (!isEssentialEvent) this.rateLimit.recordEvent();
			if (payload.op === GatewayOpcodes.Heartbeat) this.monitor.recordHeartbeat();
		}
	}
	identify() {
		if (!this.client) return;
		const payload = createIdentifyPayload({
			token: this.client.options.token,
			intents: this.options.intents,
			properties: {
				os: process.platform,
				browser: "@buape/carbon - https://carbon.buape.com",
				device: "@buape/carbon - https://carbon.buape.com"
			},
			...this.options.shard ? { shard: this.options.shard } : {}
		});
		this.send(payload, true);
	}
	/**
	* Update the bot's presence (status, activity, etc.)
	* @param data Presence data to update
	*/
	updatePresence(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		const payload = createUpdatePresencePayload(data);
		this.send(payload);
	}
	/**
	* Update the bot's voice state
	* @param data Voice state data to update
	*/
	updateVoiceState(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		const payload = createUpdateVoiceStatePayload(data);
		this.send(payload);
	}
	/**
	* Request guild members from Discord. The data will come in through the GUILD_MEMBERS_CHUNK event, not as a return on this function.
	* @param data Guild members request data
	*/
	requestGuildMembers(data) {
		if (!this.isConnected) throw new Error("Gateway is not connected");
		if (!((this.options.intents & GatewayIntents.GuildMembers) !== 0)) throw new Error("GUILD_MEMBERS intent is required for requestGuildMembers operation");
		if (data.presences) {
			if (!((this.options.intents & GatewayIntents.GuildPresences) !== 0)) throw new Error("GUILD_PRESENCES intent is required when requesting presences");
		}
		if (!data.query && data.query !== "" && !data.user_ids) throw new Error("Either 'query' or 'user_ids' field is required for requestGuildMembers");
		const payload = createRequestGuildMembersPayload(data);
		this.send(payload);
	}
	/**
	* Get the current rate limit status
	*/
	getRateLimitStatus() {
		return {
			remainingEvents: this.rateLimit.getRemainingEvents(),
			resetTime: this.rateLimit.getResetTime(),
			currentEventCount: this.rateLimit.getCurrentEventCount()
		};
	}
	/**
	* Get information about optionsured intents
	*/
	getIntentsInfo() {
		return {
			intents: this.options.intents,
			hasGuilds: (this.options.intents & GatewayIntents.Guilds) !== 0,
			hasGuildMembers: (this.options.intents & GatewayIntents.GuildMembers) !== 0,
			hasGuildPresences: (this.options.intents & GatewayIntents.GuildPresences) !== 0,
			hasGuildMessages: (this.options.intents & GatewayIntents.GuildMessages) !== 0,
			hasMessageContent: (this.options.intents & GatewayIntents.MessageContent) !== 0
		};
	}
	/**
	* Check if a specific intent is enabled
	* @param intent The intent to check
	*/
	hasIntent(intent) {
		return (this.options.intents & intent) !== 0;
	}
	ensureGatewayParams(url) {
		try {
			const parsed = new URL(url);
			if (!parsed.searchParams.get("v")) parsed.searchParams.set("v", "10");
			if (!parsed.searchParams.get("encoding")) parsed.searchParams.set("encoding", "json");
			return parsed.toString();
		} catch {
			const hasQuery = url.includes("?");
			const hasV = url.includes("v=");
			const hasEncoding = url.includes("encoding=");
			const separator = hasQuery ? "&" : "?";
			const parts = [];
			if (!hasV) parts.push("v=10");
			if (!hasEncoding) parts.push("encoding=json");
			return parts.length ? `${url}${separator}${parts.join("&")}` : url;
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/GuildDeleteListener.js
var GuildDelete = class extends GuildDeleteListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (voice) {
			const guild_id = data.guild.id;
			voice.adapters.get(guild_id)?.destroy();
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoiceServerUpdateListener.js
/**
* Forwards VOICE_SERVER_UPDATE events to voice adapters.
*/
var VoiceServerUpdate = class extends VoiceServerUpdateListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (!voice) return;
		const guildId = data.guild_id;
		if (guildId) voice.adapters.get(guildId)?.onVoiceServerUpdate(data);
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoiceStateUpdateListener.js
/**
* Forwards VOICE_STATE_UPDATE events to voice adapters.
*/
var VoiceStateUpdate = class extends VoiceStateUpdateListener {
	async handle(data, client) {
		const voice = client.getPlugin("voice");
		if (!voice) return;
		const guildId = data.guild_id;
		if (guildId) {
			const raw = {
				...data,
				member: data.rawMember
			};
			voice.adapters.get(guildId)?.onVoiceStateUpdate(raw);
		}
	}
};
//#endregion
//#region node_modules/@buape/carbon/dist/src/plugins/voice/VoicePlugin.js
var VoicePlugin = class extends Plugin {
	id = "voice";
	client;
	adapters = /* @__PURE__ */ new Map();
	shardingPlugin;
	gatewayPlugin;
	async registerClient(client) {
		this.client = client;
		const sharding = this.client.getPlugin("sharding");
		if (sharding) this.shardingPlugin = sharding;
		const gateway = this.client.getPlugin("gateway");
		if (gateway) this.gatewayPlugin = gateway;
		if (!this.gatewayPlugin && !this.shardingPlugin) throw new Error("Voice cannot be used without a gateway connection.");
		this.client.registerListener(new GuildDelete());
		this.client.registerListener(new VoiceStateUpdate());
		this.client.registerListener(new VoiceServerUpdate());
	}
	getGateway(guild_id) {
		if (this.shardingPlugin) return this.shardingPlugin.getShardForGuild(guild_id);
		return this.gatewayPlugin;
	}
	getGatewayAdapterCreator(guild_id) {
		const gateway = this.getGateway(guild_id);
		if (!gateway) throw new Error("Voice cannot be used without a gateway connection.");
		return (methods) => {
			this.adapters.set(guild_id, methods);
			return {
				sendPayload(payload) {
					try {
						gateway.send(payload, true);
						return true;
					} catch {
						return false;
					}
				},
				destroy: () => {
					this.adapters.delete(guild_id);
				}
			};
		};
	}
};
//#endregion
//#region extensions/discord/src/monitor.gateway.ts
function getDiscordGatewayEmitter(gateway) {
	return gateway?.emitter;
}
async function waitForDiscordGatewayStop(params) {
	const { gateway, abortSignal, onGatewayError, shouldStopOnError } = params;
	const emitter = gateway?.emitter;
	return await new Promise((resolve, reject) => {
		let settled = false;
		const cleanup = () => {
			abortSignal?.removeEventListener("abort", onAbort);
			emitter?.removeListener("error", onGatewayErrorEvent);
		};
		const finishResolve = () => {
			if (settled) return;
			settled = true;
			cleanup();
			try {
				gateway?.disconnect?.();
			} finally {
				resolve();
			}
		};
		const finishReject = (err) => {
			if (settled) return;
			settled = true;
			cleanup();
			try {
				gateway?.disconnect?.();
			} finally {
				reject(err);
			}
		};
		const onAbort = () => {
			finishResolve();
		};
		const onGatewayErrorEvent = (err) => {
			onGatewayError?.(err);
			if (shouldStopOnError?.(err) ?? true) finishReject(err);
		};
		const onForceStop = (err) => {
			finishReject(err);
		};
		if (abortSignal?.aborted) {
			onAbort();
			return;
		}
		abortSignal?.addEventListener("abort", onAbort, { once: true });
		emitter?.on("error", onGatewayErrorEvent);
		params.registerForceStop?.(onForceStop);
	});
}
//#endregion
//#region extensions/discord/src/voice/command.ts
const VOICE_CHANNEL_TYPES = [ChannelType$1.GuildVoice, ChannelType$1.GuildStageVoice];
async function authorizeVoiceCommand(interaction, params, options) {
	const channelOverride = options?.channelOverride;
	const channel = channelOverride ? void 0 : interaction.channel;
	if (!interaction.guild) return {
		ok: false,
		message: "Voice commands are only available in guilds."
	};
	const user = interaction.user;
	if (!user) return {
		ok: false,
		message: "Unable to resolve command user."
	};
	const channelId = channelOverride?.id ?? channel?.id ?? "";
	const rawChannelName = channelOverride?.name ?? (channel && "name" in channel ? channel.name : void 0);
	const rawParentId = channelOverride?.parentId ?? ("parentId" in (channel ?? {}) ? channel.parentId ?? void 0 : void 0);
	const channelInfo = channelId ? await resolveDiscordChannelInfo(interaction.client, channelId) : null;
	const channelName = rawChannelName ?? channelInfo?.name;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const isThreadChannel = channelInfo?.type === ChannelType.PublicThread || channelInfo?.type === ChannelType.PrivateThread || channelInfo?.type === ChannelType.AnnouncementThread;
	let parentId;
	let parentName;
	let parentSlug;
	if (isThreadChannel && channelId) {
		const parentInfo = await resolveDiscordThreadParentInfo({
			client: interaction.client,
			threadChannel: {
				id: channelId,
				name: channelName,
				parentId: rawParentId ?? channelInfo?.parentId,
				parent: void 0
			},
			channelInfo
		});
		parentId = parentInfo.id;
		parentName = parentInfo.name;
		parentSlug = parentName ? normalizeDiscordSlug(parentName) : void 0;
	}
	const guildInfo = resolveDiscordGuildEntry({
		guild: interaction.guild ?? void 0,
		guildId: interaction.guild?.id ?? interaction.rawData.guild_id ?? void 0,
		guildEntries: params.discordConfig.guilds
	});
	const channelConfig = channelId ? resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId,
		channelName,
		channelSlug,
		parentId,
		parentName,
		parentSlug,
		scope: isThreadChannel ? "thread" : "channel"
	}) : null;
	if (channelConfig?.enabled === false) return {
		ok: false,
		message: "This channel is disabled."
	};
	const channelAllowlistConfigured = Boolean(guildInfo?.channels) && Object.keys(guildInfo?.channels ?? {}).length > 0;
	const channelAllowed = channelConfig?.allowed !== false;
	if (!isDiscordGroupAllowedByPolicy({
		groupPolicy: params.groupPolicy,
		guildAllowlisted: Boolean(guildInfo),
		channelAllowlistConfigured,
		channelAllowed
	}) || channelConfig?.allowed === false) {
		const channelId = channelOverride?.id ?? channel?.id;
		return {
			ok: false,
			message: `${channelId ? formatMention({ channelId }) : "This channel"} is not allowlisted for voice commands.`
		};
	}
	const memberRoleIds = Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : [];
	const sender = resolveDiscordSenderIdentity({
		author: user,
		member: interaction.rawData.member
	});
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds,
		sender,
		allowNameMatching: isDangerousNameMatchingEnabled(params.discordConfig)
	});
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: params.discordConfig.allowFrom ?? params.discordConfig.dm?.allowFrom ?? [],
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		allowNameMatching: isDangerousNameMatchingEnabled(params.discordConfig)
	});
	const authorizers = params.useAccessGroups ? [{
		configured: ownerAllowList != null,
		allowed: ownerOk
	}, {
		configured: hasAccessRestrictions,
		allowed: memberAllowed
	}] : [{
		configured: hasAccessRestrictions,
		allowed: memberAllowed
	}];
	if (!resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups: params.useAccessGroups,
		authorizers,
		modeWhenAccessGroupsOff: "configured"
	})) return {
		ok: false,
		message: "You are not authorized to use this command."
	};
	return {
		ok: true,
		guildId: interaction.guild.id
	};
}
async function resolveVoiceCommandRuntimeContext(interaction, params) {
	const guildId = interaction.guild?.id;
	if (!guildId) {
		await interaction.reply({
			content: "Unable to resolve guild for this command.",
			ephemeral: true
		});
		return null;
	}
	const manager = params.getManager();
	if (!manager) {
		await interaction.reply({
			content: "Voice manager is not available yet.",
			ephemeral: true
		});
		return null;
	}
	return {
		guildId,
		manager
	};
}
async function ensureVoiceCommandAccess(params) {
	const access = await authorizeVoiceCommand(params.interaction, params.context, { channelOverride: params.channelOverride });
	if (access.ok) return true;
	await params.interaction.reply({
		content: access.message ?? "Not authorized.",
		ephemeral: true
	});
	return false;
}
function createDiscordVoiceCommand(params) {
	const resolveSessionChannelId = (manager, guildId) => manager.status().find((entry) => entry.guildId === guildId)?.channelId;
	class JoinCommand extends Command {
		constructor(..._args) {
			super(..._args);
			this.name = "join";
			this.description = "Join a voice channel";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
			this.options = [{
				name: "channel",
				description: "Voice channel to join",
				type: ApplicationCommandOptionType.Channel,
				required: true,
				channel_types: VOICE_CHANNEL_TYPES
			}];
		}
		async run(interaction) {
			const channel = await interaction.options.getChannel("channel", true);
			if (!channel || !("id" in channel)) {
				await interaction.reply({
					content: "Voice channel not found.",
					ephemeral: true
				});
				return;
			}
			const access = await authorizeVoiceCommand(interaction, params, { channelOverride: {
				id: channel.id,
				name: "name" in channel ? channel.name : void 0,
				parentId: "parentId" in channel ? channel.parentId ?? void 0 : void 0
			} });
			if (!access.ok) {
				await interaction.reply({
					content: access.message ?? "Not authorized.",
					ephemeral: true
				});
				return;
			}
			if (!isVoiceChannelType(channel.type)) {
				await interaction.reply({
					content: "That is not a voice channel.",
					ephemeral: true
				});
				return;
			}
			const guildId = access.guildId ?? ("guildId" in channel ? channel.guildId : void 0);
			if (!guildId) {
				await interaction.reply({
					content: "Unable to resolve guild for this voice channel.",
					ephemeral: true
				});
				return;
			}
			const manager = params.getManager();
			if (!manager) {
				await interaction.reply({
					content: "Voice manager is not available yet.",
					ephemeral: true
				});
				return;
			}
			const result = await manager.join({
				guildId,
				channelId: channel.id
			});
			await interaction.reply({
				content: result.message,
				ephemeral: true
			});
		}
	}
	class LeaveCommand extends Command {
		constructor(..._args2) {
			super(..._args2);
			this.name = "leave";
			this.description = "Leave the current voice channel";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
		}
		async run(interaction) {
			const runtimeContext = await resolveVoiceCommandRuntimeContext(interaction, params);
			if (!runtimeContext) return;
			const sessionChannelId = resolveSessionChannelId(runtimeContext.manager, runtimeContext.guildId);
			if (!await ensureVoiceCommandAccess({
				interaction,
				context: params,
				channelOverride: sessionChannelId ? { id: sessionChannelId } : void 0
			})) return;
			const result = await runtimeContext.manager.leave({ guildId: runtimeContext.guildId });
			await interaction.reply({
				content: result.message,
				ephemeral: true
			});
		}
	}
	class StatusCommand extends Command {
		constructor(..._args3) {
			super(..._args3);
			this.name = "status";
			this.description = "Show active voice sessions";
			this.defer = true;
			this.ephemeral = params.ephemeralDefault;
		}
		async run(interaction) {
			const runtimeContext = await resolveVoiceCommandRuntimeContext(interaction, params);
			if (!runtimeContext) return;
			const sessions = runtimeContext.manager.status().filter((entry) => entry.guildId === runtimeContext.guildId);
			const sessionChannelId = sessions[0]?.channelId;
			if (!await ensureVoiceCommandAccess({
				interaction,
				context: params,
				channelOverride: sessionChannelId ? { id: sessionChannelId } : void 0
			})) return;
			if (sessions.length === 0) {
				await interaction.reply({
					content: "No active voice sessions.",
					ephemeral: true
				});
				return;
			}
			const lines = sessions.map((entry) => `• ${formatMention({ channelId: entry.channelId })} (guild ${entry.guildId})`);
			await interaction.reply({
				content: lines.join("\n"),
				ephemeral: true
			});
		}
	}
	return new class extends CommandWithSubcommands {
		constructor(..._args4) {
			super(..._args4);
			this.name = "vc";
			this.description = "Voice channel controls";
			this.subcommands = [
				new JoinCommand(),
				new LeaveCommand(),
				new StatusCommand()
			];
		}
	}();
}
function isVoiceChannelType(type) {
	return type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice;
}
//#endregion
//#region extensions/discord/src/monitor/agent-components-helpers.ts
const AGENT_BUTTON_KEY = "agent";
const AGENT_SELECT_KEY = "agentsel";
function formatUsername(user) {
	if (user.discriminator && user.discriminator !== "0") return `${user.username}#${user.discriminator}`;
	return user.username;
}
function isThreadChannelType(channelType) {
	return channelType === ChannelType$1.PublicThread || channelType === ChannelType$1.PrivateThread || channelType === ChannelType$1.AnnouncementThread;
}
function readParsedComponentId(data) {
	if (!data || typeof data !== "object") return;
	return "cid" in data ? data.cid : data.componentId;
}
function normalizeComponentId(value) {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? trimmed : void 0;
	}
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
}
function mapOptionLabels(options, values) {
	if (!options || options.length === 0) return values;
	const map = new Map(options.map((option) => [option.value, option.label]));
	return values.map((value) => map.get(value) ?? value);
}
function resolveAgentComponentRoute(params) {
	return resolveAgentRoute({
		cfg: params.ctx.cfg,
		channel: "discord",
		accountId: params.ctx.accountId,
		guildId: params.rawGuildId,
		memberRoleIds: params.memberRoleIds,
		peer: {
			kind: params.isDirectMessage ? "direct" : "channel",
			id: params.isDirectMessage ? params.userId : params.channelId
		},
		parentPeer: params.parentId ? {
			kind: "channel",
			id: params.parentId
		} : void 0
	});
}
async function ackComponentInteraction(params) {
	try {
		await params.interaction.reply({
			content: "✓",
			...params.replyOpts
		});
	} catch (err) {
		logError(`${params.label}: failed to acknowledge interaction: ${String(err)}`);
	}
}
function resolveDiscordChannelContext(interaction) {
	const channel = interaction.channel;
	const channelName = channel && "name" in channel ? channel.name : void 0;
	const channelSlug = channelName ? normalizeDiscordSlug(channelName) : "";
	const channelType = channel && "type" in channel ? channel.type : void 0;
	const isThread = isThreadChannelType(channelType);
	let parentId;
	let parentName;
	let parentSlug = "";
	if (isThread && channel && "parentId" in channel) {
		parentId = channel.parentId ?? void 0;
		if ("parent" in channel) {
			const parent = channel.parent;
			if (parent?.name) {
				parentName = parent.name;
				parentSlug = normalizeDiscordSlug(parentName);
			}
		}
	}
	return {
		channelName,
		channelSlug,
		channelType,
		isThread,
		parentId,
		parentName,
		parentSlug
	};
}
async function resolveComponentInteractionContext(params) {
	const { interaction, label } = params;
	const channelId = interaction.rawData.channel_id;
	if (!channelId) {
		logError(`${label}: missing channel_id in interaction`);
		return null;
	}
	const user = interaction.user;
	if (!user) {
		logError(`${label}: missing user in interaction`);
		return null;
	}
	const shouldDefer = params.defer !== false && "defer" in interaction;
	let didDefer = false;
	if (shouldDefer) try {
		await interaction.defer({ ephemeral: true });
		didDefer = true;
	} catch (err) {
		logError(`${label}: failed to defer interaction: ${String(err)}`);
	}
	const replyOpts = didDefer ? {} : { ephemeral: true };
	const username = formatUsername(user);
	const userId = user.id;
	const rawGuildId = interaction.rawData.guild_id;
	return {
		channelId,
		user,
		username,
		userId,
		replyOpts,
		rawGuildId,
		isDirectMessage: !rawGuildId,
		memberRoleIds: Array.isArray(interaction.rawData.member?.roles) ? interaction.rawData.member.roles.map((roleId) => String(roleId)) : []
	};
}
async function ensureGuildComponentMemberAllowed(params) {
	const { interaction, guildInfo, channelId, rawGuildId, channelCtx, memberRoleIds, user, replyOpts, componentLabel, unauthorizedReply } = params;
	if (!rawGuildId) return true;
	const { memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig: resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId,
			channelName: channelCtx.channelName,
			channelSlug: channelCtx.channelSlug,
			parentId: channelCtx.parentId,
			parentName: channelCtx.parentName,
			parentSlug: channelCtx.parentSlug,
			scope: channelCtx.isThread ? "thread" : "channel"
		}),
		guildInfo,
		memberRoleIds,
		sender: {
			id: user.id,
			name: user.username,
			tag: user.discriminator ? `${user.username}#${user.discriminator}` : void 0
		},
		allowNameMatching: params.allowNameMatching
	});
	if (memberAllowed) return true;
	logVerbose(`agent ${componentLabel}: blocked user ${user.id} (not in users/roles allowlist)`);
	try {
		await interaction.reply({
			content: unauthorizedReply,
			...replyOpts
		});
	} catch {}
	return false;
}
async function ensureComponentUserAllowed(params) {
	const allowList = normalizeDiscordAllowList(params.entry.allowedUsers, [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return true;
	if (resolveDiscordAllowListMatch({
		allowList,
		candidate: {
			id: params.user.id,
			name: params.user.username,
			tag: formatDiscordUserTag(params.user)
		},
		allowNameMatching: params.allowNameMatching
	}).allowed) return true;
	logVerbose(`discord component ${params.componentLabel}: blocked user ${params.user.id} (not in allowedUsers)`);
	try {
		await params.interaction.reply({
			content: params.unauthorizedReply,
			...params.replyOpts
		});
	} catch {}
	return false;
}
async function ensureAgentComponentInteractionAllowed(params) {
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: params.rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId: params.channelId,
		rawGuildId: params.rawGuildId,
		channelCtx,
		memberRoleIds: params.memberRoleIds,
		user: params.user,
		replyOpts: params.replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply: params.unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig)
	})) return null;
	return { parentId: channelCtx.parentId };
}
function parseAgentComponentData(data) {
	const raw = readParsedComponentId(data);
	const decodeSafe = (value) => {
		if (!value.includes("%")) return value;
		if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;
		try {
			return decodeURIComponent(value);
		} catch {
			return value;
		}
	};
	const componentId = typeof raw === "string" ? decodeSafe(raw) : typeof raw === "number" ? String(raw) : null;
	if (!componentId) return null;
	return { componentId };
}
async function ensureDmComponentAuthorized(params) {
	const { ctx, interaction, user, componentLabel, replyOpts } = params;
	const allowFromPrefixes = [
		"discord:",
		"user:",
		"pk:"
	];
	const resolveAllowMatch = (entries) => {
		const allowList = normalizeDiscordAllowList(entries, allowFromPrefixes);
		return allowList ? resolveDiscordAllowListMatch({
			allowList,
			candidate: {
				id: user.id,
				name: user.username,
				tag: formatDiscordUserTag(user)
			},
			allowNameMatching: isDangerousNameMatchingEnabled(ctx.discordConfig)
		}) : { allowed: false };
	};
	const dmPolicy = ctx.dmPolicy ?? "pairing";
	if (dmPolicy === "disabled") {
		logVerbose(`agent ${componentLabel}: blocked (DM policy disabled)`);
		try {
			await interaction.reply({
				content: "DM interactions are disabled.",
				...replyOpts
			});
		} catch {}
		return false;
	}
	if (dmPolicy === "open") return true;
	if (dmPolicy === "allowlist") {
		if (resolveAllowMatch(ctx.allowFrom ?? []).allowed) return true;
		logVerbose(`agent ${componentLabel}: blocked DM user ${user.id} (not in allowFrom)`);
		try {
			await interaction.reply({
				content: `You are not authorized to use this ${componentLabel}.`,
				...replyOpts
			});
		} catch {}
		return false;
	}
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "discord",
		accountId: ctx.accountId,
		dmPolicy
	});
	if (resolveAllowMatch([...ctx.allowFrom ?? [], ...storeAllowFrom]).allowed) return true;
	if (dmPolicy === "pairing") {
		if (!(await createChannelPairingChallengeIssuer({
			channel: "discord",
			upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
				channel: "discord",
				id,
				accountId: ctx.accountId,
				meta
			})
		})({
			senderId: user.id,
			senderIdLine: `Your Discord user id: ${user.id}`,
			meta: {
				tag: formatDiscordUserTag(user),
				name: user.username
			},
			sendPairingReply: async (text) => {
				await interaction.reply({
					content: text,
					...replyOpts
				});
			}
		})).created) try {
			await interaction.reply({
				content: "Pairing already requested. Ask the bot owner to approve your code.",
				...replyOpts
			});
		} catch {}
		return false;
	}
	logVerbose(`agent ${componentLabel}: blocked DM user ${user.id} (not in allowFrom)`);
	try {
		await interaction.reply({
			content: `You are not authorized to use this ${componentLabel}.`,
			...replyOpts
		});
	} catch {}
	return false;
}
async function resolveInteractionContextWithDmAuth(params) {
	const interactionCtx = await resolveComponentInteractionContext({
		interaction: params.interaction,
		label: params.label,
		defer: params.defer
	});
	if (!interactionCtx) return null;
	if (interactionCtx.isDirectMessage) {
		if (!await ensureDmComponentAuthorized({
			ctx: params.ctx,
			interaction: params.interaction,
			user: interactionCtx.user,
			componentLabel: params.componentLabel,
			replyOpts: interactionCtx.replyOpts
		})) return null;
	}
	return interactionCtx;
}
function parseDiscordComponentData(data, customId) {
	if (!data || typeof data !== "object") return null;
	const rawComponentId = readParsedComponentId(data);
	const rawModalId = "mid" in data ? data.mid : data.modalId;
	let componentId = normalizeComponentId(rawComponentId);
	let modalId = normalizeComponentId(rawModalId);
	if (!componentId && customId) {
		const parsed = parseDiscordComponentCustomId(customId);
		if (parsed) {
			componentId = parsed.componentId;
			modalId = parsed.modalId;
		}
	}
	if (!componentId) return null;
	return {
		componentId,
		modalId
	};
}
function parseDiscordModalId(data, customId) {
	if (data && typeof data === "object") {
		const modalId = normalizeComponentId("mid" in data ? data.mid : data.modalId);
		if (modalId) return modalId;
	}
	if (customId) return parseDiscordModalCustomId(customId);
	return null;
}
function resolveInteractionCustomId(interaction) {
	if (!interaction?.rawData || typeof interaction.rawData !== "object") return;
	if (!("data" in interaction.rawData)) return;
	const customId = interaction.rawData.data?.custom_id;
	if (typeof customId !== "string") return;
	const trimmed = customId.trim();
	return trimmed ? trimmed : void 0;
}
function mapSelectValues(entry, values) {
	if (entry.selectType === "string") return mapOptionLabels(entry.options, values);
	if (entry.selectType === "user") return values.map((value) => `user:${value}`);
	if (entry.selectType === "role") return values.map((value) => `role:${value}`);
	if (entry.selectType === "mentionable") return values.map((value) => `mentionable:${value}`);
	if (entry.selectType === "channel") return values.map((value) => `channel:${value}`);
	return values;
}
function resolveModalFieldValues(field, interaction) {
	const fields = interaction.fields;
	const optionLabels = field.options?.map((option) => ({
		value: option.value,
		label: option.label
	}));
	const required = field.required === true;
	try {
		switch (field.type) {
			case "text": {
				const value = required ? fields.getText(field.id, true) : fields.getText(field.id);
				return value ? [value] : [];
			}
			case "select":
			case "checkbox":
			case "radio": return mapOptionLabels(optionLabels, required ? fields.getStringSelect(field.id, true) : fields.getStringSelect(field.id) ?? []);
			case "role-select": try {
				return (required ? fields.getRoleSelect(field.id, true) : fields.getRoleSelect(field.id) ?? []).map((role) => role.name ?? role.id);
			} catch {
				return required ? fields.getStringSelect(field.id, true) : fields.getStringSelect(field.id) ?? [];
			}
			case "user-select": return (required ? fields.getUserSelect(field.id, true) : fields.getUserSelect(field.id) ?? []).map((user) => formatDiscordUserTag(user));
			default: return [];
		}
	} catch (err) {
		logError(`agent modal: failed to read field ${field.id}: ${String(err)}`);
		return [];
	}
}
function formatModalSubmissionText(entry, interaction) {
	const lines = [`Form "${entry.title}" submitted.`];
	for (const field of entry.fields) {
		const values = resolveModalFieldValues(field, interaction);
		if (values.length === 0) continue;
		lines.push(`- ${field.label}: ${values.join(", ")}`);
	}
	if (lines.length === 1) lines.push("- (no values)");
	return lines.join("\n");
}
function resolveDiscordInteractionId(interaction) {
	const rawId = interaction.rawData && typeof interaction.rawData === "object" && "id" in interaction.rawData ? interaction.rawData.id : void 0;
	if (typeof rawId === "string" && rawId.trim()) return rawId.trim();
	if (typeof rawId === "number" && Number.isFinite(rawId)) return String(rawId);
	return `discord-interaction:${Date.now()}`;
}
function resolveComponentCommandAuthorized(params) {
	const { ctx, interactionCtx, channelConfig, guildInfo } = params;
	if (interactionCtx.isDirectMessage) return true;
	const { ownerAllowList, ownerAllowed: ownerOk } = resolveDiscordOwnerAccess({
		allowFrom: ctx.allowFrom,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: formatDiscordUserTag(interactionCtx.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds: interactionCtx.memberRoleIds,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: formatDiscordUserTag(interactionCtx.user)
		},
		allowNameMatching: params.allowNameMatching
	});
	const useAccessGroups = ctx.cfg.commands?.useAccessGroups !== false;
	return resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups,
		authorizers: useAccessGroups ? [{
			configured: ownerAllowList != null,
			allowed: ownerOk
		}, {
			configured: hasAccessRestrictions,
			allowed: memberAllowed
		}] : [{
			configured: hasAccessRestrictions,
			allowed: memberAllowed
		}],
		modeWhenAccessGroupsOff: "configured"
	});
}
//#endregion
//#region extensions/discord/src/monitor/agent-components.ts
async function dispatchPluginDiscordInteractiveEvent(params) {
	const normalizedConversationId = params.interactionCtx.rawGuildId || params.channelCtx.channelType === ChannelType$1.GroupDM ? `channel:${params.interactionCtx.channelId}` : `user:${params.interactionCtx.userId}`;
	let responded = false;
	let acknowledged = false;
	const updateOriginalMessage = async (input) => {
		const payload = {
			...input.text !== void 0 ? { content: input.text } : {},
			...input.components !== void 0 ? { components: input.components } : {}
		};
		if (acknowledged) {
			await params.interaction.reply(payload);
			return;
		}
		if (!("update" in params.interaction) || typeof params.interaction.update !== "function") throw new Error("Discord interaction cannot update the source message");
		await params.interaction.update(payload);
	};
	const respond = {
		acknowledge: async () => {
			if (responded) return;
			await params.interaction.acknowledge();
			acknowledged = true;
			responded = true;
		},
		reply: async ({ text, ephemeral = true }) => {
			responded = true;
			await params.interaction.reply({
				content: text,
				ephemeral
			});
		},
		followUp: async ({ text, ephemeral = true }) => {
			responded = true;
			await params.interaction.followUp({
				content: text,
				ephemeral
			});
		},
		editMessage: async (input) => {
			const { text, components } = input;
			responded = true;
			await updateOriginalMessage({
				text,
				components
			});
		},
		clearComponents: async (input) => {
			responded = true;
			await updateOriginalMessage({
				text: input?.text,
				components: []
			});
		}
	};
	const pluginBindingApproval = parsePluginBindingApprovalCustomId(params.data);
	if (pluginBindingApproval) {
		try {
			await respond.acknowledge();
		} catch {}
		const resolved = await resolvePluginConversationBindingApproval({
			approvalId: pluginBindingApproval.approvalId,
			decision: pluginBindingApproval.decision,
			senderId: params.interactionCtx.userId
		});
		const approvalMessageId = params.messageId?.trim() || params.interaction.message?.id?.trim();
		if (approvalMessageId) try {
			await editDiscordComponentMessage(normalizedConversationId, approvalMessageId, { text: buildPluginBindingResolvedText(resolved) }, { accountId: params.ctx.accountId });
		} catch (err) {
			logError(`discord plugin binding approval: failed to clear prompt: ${String(err)}`);
		}
		if (resolved.status !== "approved") try {
			await respond.followUp({
				text: buildPluginBindingResolvedText(resolved),
				ephemeral: true
			});
		} catch (err) {
			logError(`discord plugin binding approval: failed to follow up: ${String(err)}`);
		}
		return "handled";
	}
	const dispatched = await dispatchPluginInteractiveHandler({
		channel: "discord",
		data: params.data,
		interactionId: resolveDiscordInteractionId(params.interaction),
		ctx: {
			accountId: params.ctx.accountId,
			interactionId: resolveDiscordInteractionId(params.interaction),
			conversationId: normalizedConversationId,
			parentConversationId: params.channelCtx.parentId,
			guildId: params.interactionCtx.rawGuildId,
			senderId: params.interactionCtx.userId,
			senderUsername: params.interactionCtx.username,
			auth: { isAuthorizedSender: params.isAuthorizedSender },
			interaction: {
				kind: params.kind,
				messageId: params.messageId,
				values: params.values,
				fields: params.fields
			}
		},
		respond,
		onMatched: async () => {
			try {
				await respond.acknowledge();
			} catch {}
		}
	});
	if (!dispatched.matched) return "unmatched";
	if (dispatched.handled) {
		if (!responded) try {
			await respond.acknowledge();
		} catch {}
		return "handled";
	}
	return "unmatched";
}
async function dispatchDiscordComponentEvent(params) {
	const { ctx, interaction, interactionCtx, channelCtx, guildInfo, eventText } = params;
	const runtime = ctx.runtime ?? createNonExitingRuntime();
	const route = resolveAgentRoute({
		cfg: ctx.cfg,
		channel: "discord",
		accountId: ctx.accountId,
		guildId: interactionCtx.rawGuildId,
		memberRoleIds: interactionCtx.memberRoleIds,
		peer: {
			kind: interactionCtx.isDirectMessage ? "direct" : "channel",
			id: interactionCtx.isDirectMessage ? interactionCtx.userId : interactionCtx.channelId
		},
		parentPeer: channelCtx.parentId ? {
			kind: "channel",
			id: channelCtx.parentId
		} : void 0
	});
	const sessionKey = params.routeOverrides?.sessionKey ?? route.sessionKey;
	const agentId = params.routeOverrides?.agentId ?? route.agentId;
	const accountId = params.routeOverrides?.accountId ?? route.accountId;
	const fromLabel = interactionCtx.isDirectMessage ? buildDirectLabel(interactionCtx.user) : buildGuildLabel({
		guild: interaction.guild ?? void 0,
		channelName: channelCtx.channelName ?? interactionCtx.channelId,
		channelId: interactionCtx.channelId
	});
	const senderName = interactionCtx.user.globalName ?? interactionCtx.user.username;
	const senderUsername = interactionCtx.user.username;
	const senderTag = formatDiscordUserTag(interactionCtx.user);
	const groupChannel = !interactionCtx.isDirectMessage && channelCtx.channelSlug ? `#${channelCtx.channelSlug}` : void 0;
	const groupSubject = interactionCtx.isDirectMessage ? void 0 : groupChannel;
	const channelConfig = resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId: interactionCtx.channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug,
		parentId: channelCtx.parentId,
		parentName: channelCtx.parentName,
		parentSlug: channelCtx.parentSlug,
		scope: channelCtx.isThread ? "thread" : "channel"
	});
	const allowNameMatching = isDangerousNameMatchingEnabled(ctx.discordConfig);
	const { ownerAllowFrom } = buildDiscordInboundAccessContext({
		channelConfig,
		guildInfo,
		sender: {
			id: interactionCtx.user.id,
			name: interactionCtx.user.username,
			tag: senderTag
		},
		allowNameMatching,
		isGuild: !interactionCtx.isDirectMessage
	});
	const groupSystemPrompt = buildDiscordGroupSystemPrompt(channelConfig);
	const pinnedMainDmOwner = interactionCtx.isDirectMessage ? resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: ctx.cfg.session?.dmScope,
		allowFrom: channelConfig?.users ?? guildInfo?.users,
		normalizeEntry: (entry) => {
			const candidate = normalizeDiscordAllowList([entry], [
				"discord:",
				"user:",
				"pk:"
			])?.ids.values().next().value;
			return typeof candidate === "string" && /^\d+$/.test(candidate) ? candidate : void 0;
		}
	}) : null;
	const commandAuthorized = resolveComponentCommandAuthorized({
		ctx,
		interactionCtx,
		channelConfig,
		guildInfo,
		allowNameMatching
	});
	const storePath = resolveStorePath(ctx.cfg.session?.store, { agentId });
	const envelopeOptions = resolveEnvelopeFormatOptions(ctx.cfg);
	const previousTimestamp = readSessionUpdatedAt({
		storePath,
		sessionKey
	});
	const timestamp = Date.now();
	const ctxPayload = finalizeInboundContext({
		Body: formatInboundEnvelope({
			channel: "Discord",
			from: fromLabel,
			timestamp,
			body: eventText,
			chatType: interactionCtx.isDirectMessage ? "direct" : "channel",
			senderLabel: senderName,
			previousTimestamp,
			envelope: envelopeOptions
		}),
		BodyForAgent: eventText,
		RawBody: eventText,
		CommandBody: eventText,
		From: interactionCtx.isDirectMessage ? `discord:${interactionCtx.userId}` : `discord:channel:${interactionCtx.channelId}`,
		To: `channel:${interactionCtx.channelId}`,
		SessionKey: sessionKey,
		AccountId: accountId,
		ChatType: interactionCtx.isDirectMessage ? "direct" : "channel",
		ConversationLabel: fromLabel,
		SenderName: senderName,
		SenderId: interactionCtx.userId,
		SenderUsername: senderUsername,
		SenderTag: senderTag,
		GroupSubject: groupSubject,
		GroupChannel: groupChannel,
		GroupSystemPrompt: interactionCtx.isDirectMessage ? void 0 : groupSystemPrompt,
		GroupSpace: guildInfo?.id ?? guildInfo?.slug ?? interactionCtx.rawGuildId ?? void 0,
		OwnerAllowFrom: ownerAllowFrom,
		Provider: "discord",
		Surface: "discord",
		WasMentioned: true,
		CommandAuthorized: commandAuthorized,
		CommandSource: "text",
		MessageSid: interaction.rawData.id,
		Timestamp: timestamp,
		OriginatingChannel: "discord",
		OriginatingTo: `channel:${interactionCtx.channelId}`
	});
	await recordInboundSession({
		storePath,
		sessionKey: ctxPayload.SessionKey ?? sessionKey,
		ctx: ctxPayload,
		updateLastRoute: interactionCtx.isDirectMessage ? {
			sessionKey: route.mainSessionKey,
			channel: "discord",
			to: `user:${interactionCtx.userId}`,
			accountId,
			mainDmOwnerPin: pinnedMainDmOwner ? {
				ownerRecipient: pinnedMainDmOwner,
				senderRecipient: interactionCtx.userId,
				onSkip: ({ ownerRecipient, senderRecipient }) => {
					logVerbose(`discord: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
				}
			} : void 0
		} : void 0,
		onRecordError: (err) => {
			logVerbose(`discord: failed updating component session meta: ${String(err)}`);
		}
	});
	const deliverTarget = `channel:${interactionCtx.channelId}`;
	const typingChannelId = interactionCtx.channelId;
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg: ctx.cfg,
		agentId,
		channel: "discord",
		accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg: ctx.cfg,
		channel: "discord",
		accountId
	});
	const textLimit = resolveTextChunkLimit(ctx.cfg, "discord", accountId, { fallbackLimit: 2e3 });
	const token = ctx.token ?? "";
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(ctx.cfg, agentId);
	const replyToMode = ctx.discordConfig?.replyToMode ?? ctx.cfg.channels?.discord?.replyToMode ?? "off";
	const replyReference = createReplyReferencePlanner({
		replyToMode,
		startId: params.replyToId
	});
	await dispatchReplyWithBufferedBlockDispatcher({
		ctx: ctxPayload,
		cfg: ctx.cfg,
		replyOptions: { onModelSelected },
		dispatcherOptions: {
			...replyPipeline,
			humanDelay: resolveHumanDelayConfig(ctx.cfg, agentId),
			deliver: async (payload) => {
				const replyToId = replyReference.use();
				await deliverDiscordReply({
					cfg: ctx.cfg,
					replies: [payload],
					target: deliverTarget,
					token,
					accountId,
					rest: interaction.client.rest,
					runtime,
					replyToId,
					replyToMode,
					textLimit,
					maxLinesPerMessage: resolveDiscordMaxLinesPerMessage({
						cfg: ctx.cfg,
						discordConfig: ctx.discordConfig,
						accountId
					}),
					tableMode,
					chunkMode: resolveChunkMode(ctx.cfg, "discord", accountId),
					mediaLocalRoots
				});
				replyReference.markSent();
			},
			onReplyStart: async () => {
				try {
					await sendTyping({
						client: interaction.client,
						channelId: typingChannelId
					});
				} catch (err) {
					logVerbose(`discord: typing failed for component reply: ${String(err)}`);
				}
			},
			onError: (err) => {
				logError(`discord component dispatch failed: ${String(err)}`);
			}
		}
	});
}
async function handleDiscordComponentEvent(params) {
	const parsed = parseDiscordComponentData(params.data, resolveInteractionCustomId(params.interaction));
	if (!parsed) {
		logError(`${params.label}: failed to parse component data`);
		try {
			await params.interaction.reply({
				content: "This component is no longer valid.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const entry = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: false
	});
	if (!entry) {
		try {
			await params.interaction.reply({
				content: "This component has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const interactionCtx = await resolveInteractionContextWithDmAuth({
		ctx: params.ctx,
		interaction: params.interaction,
		label: params.label,
		componentLabel: params.componentLabel,
		defer: false
	});
	if (!interactionCtx) return;
	const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	const allowNameMatching = isDangerousNameMatchingEnabled(params.ctx.discordConfig);
	const channelConfig = resolveDiscordChannelConfigWithFallback({
		guildInfo,
		channelId,
		channelName: channelCtx.channelName,
		channelSlug: channelCtx.channelSlug,
		parentId: channelCtx.parentId,
		parentName: channelCtx.parentName,
		parentSlug: channelCtx.parentSlug,
		scope: channelCtx.isThread ? "thread" : "channel"
	});
	const unauthorizedReply = `You are not authorized to use this ${params.componentLabel}.`;
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId,
		rawGuildId,
		channelCtx,
		memberRoleIds,
		user,
		replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply,
		allowNameMatching
	})) return;
	if (!await ensureComponentUserAllowed({
		entry,
		interaction: params.interaction,
		user,
		replyOpts,
		componentLabel: params.componentLabel,
		unauthorizedReply,
		allowNameMatching
	})) return;
	const commandAuthorized = resolveComponentCommandAuthorized({
		ctx: params.ctx,
		interactionCtx,
		channelConfig,
		guildInfo,
		allowNameMatching
	});
	const consumed = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: !entry.reusable
	});
	if (!consumed) {
		try {
			await params.interaction.reply({
				content: "This component has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	if (consumed.kind === "modal-trigger") {
		try {
			await params.interaction.reply({
				content: "This form is no longer available.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const values = params.values ? mapSelectValues(consumed, params.values) : void 0;
	if (consumed.callbackData) {
		if (await dispatchPluginDiscordInteractiveEvent({
			ctx: params.ctx,
			interaction: params.interaction,
			interactionCtx,
			channelCtx,
			isAuthorizedSender: commandAuthorized,
			data: consumed.callbackData,
			kind: consumed.kind === "select" ? "select" : "button",
			values,
			messageId: consumed.messageId ?? params.interaction.message?.id
		}) === "handled") return;
	}
	const eventText = (consumed.kind === "button" ? consumed.callbackData?.trim() : void 0) || formatDiscordComponentEventText({
		kind: consumed.kind === "select" ? "select" : "button",
		label: consumed.label,
		values
	});
	try {
		await params.interaction.reply({
			content: "✓",
			...replyOpts
		});
	} catch (err) {
		logError(`${params.label}: failed to acknowledge interaction: ${String(err)}`);
	}
	await dispatchDiscordComponentEvent({
		ctx: params.ctx,
		interaction: params.interaction,
		interactionCtx,
		channelCtx,
		guildInfo,
		eventText,
		replyToId: consumed.messageId ?? params.interaction.message?.id,
		routeOverrides: {
			sessionKey: consumed.sessionKey,
			agentId: consumed.agentId,
			accountId: consumed.accountId
		}
	});
}
async function handleDiscordModalTrigger(params) {
	const parsed = parseDiscordComponentData(params.data, resolveInteractionCustomId(params.interaction));
	if (!parsed) {
		logError(`${params.label}: failed to parse modal trigger data`);
		try {
			await params.interaction.reply({
				content: "This button is no longer valid.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const entry = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: false
	});
	if (!entry || entry.kind !== "modal-trigger") {
		try {
			await params.interaction.reply({
				content: "This button has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const modalId = entry.modalId ?? parsed.modalId;
	if (!modalId) {
		try {
			await params.interaction.reply({
				content: "This form is no longer available.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const interactionCtx = await resolveInteractionContextWithDmAuth({
		ctx: params.ctx,
		interaction: params.interaction,
		label: params.label,
		componentLabel: "form",
		defer: false
	});
	if (!interactionCtx) return;
	const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
	const guildInfo = resolveDiscordGuildEntry({
		guild: params.interaction.guild ?? void 0,
		guildId: rawGuildId,
		guildEntries: params.ctx.guildEntries
	});
	const channelCtx = resolveDiscordChannelContext(params.interaction);
	const unauthorizedReply = "You are not authorized to use this form.";
	if (!await ensureGuildComponentMemberAllowed({
		interaction: params.interaction,
		guildInfo,
		channelId,
		rawGuildId,
		channelCtx,
		memberRoleIds,
		user,
		replyOpts,
		componentLabel: "form",
		unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig)
	})) return;
	if (!await ensureComponentUserAllowed({
		entry,
		interaction: params.interaction,
		user,
		replyOpts,
		componentLabel: "form",
		unauthorizedReply,
		allowNameMatching: isDangerousNameMatchingEnabled(params.ctx.discordConfig)
	})) return;
	const consumed = resolveDiscordComponentEntry({
		id: parsed.componentId,
		consume: !entry.reusable
	});
	if (!consumed) {
		try {
			await params.interaction.reply({
				content: "This form has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	const modalEntry = resolveDiscordModalEntry({
		id: consumed.modalId ?? modalId,
		consume: false
	});
	if (!modalEntry) {
		try {
			await params.interaction.reply({
				content: "This form has expired.",
				ephemeral: true
			});
		} catch {}
		return;
	}
	try {
		await params.interaction.showModal(createDiscordFormModal(modalEntry));
	} catch (err) {
		logError(`${params.label}: failed to show modal: ${String(err)}`);
	}
}
var AgentComponentButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = AGENT_BUTTON_KEY;
		this.customId = `${AGENT_BUTTON_KEY}:seed=1`;
		this.style = ButtonStyle.Primary;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseAgentComponentData(data);
		if (!parsed) {
			logError("agent button: failed to parse component data");
			try {
				await interaction.reply({
					content: "This button is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const { componentId } = parsed;
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "agent button",
			componentLabel: "button",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, username, userId, replyOpts, rawGuildId, isDirectMessage, memberRoleIds } = interactionCtx;
		const allowed = await ensureAgentComponentInteractionAllowed({
			ctx: this.ctx,
			interaction,
			channelId,
			rawGuildId,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "button",
			unauthorizedReply: "You are not authorized to use this button."
		});
		if (!allowed) return;
		const { parentId } = allowed;
		const route = resolveAgentComponentRoute({
			ctx: this.ctx,
			rawGuildId,
			memberRoleIds,
			isDirectMessage,
			userId,
			channelId,
			parentId
		});
		const eventText = `[Discord component: ${componentId} clicked by ${username} (${userId})]`;
		logDebug(`agent button: enqueuing event for channel ${channelId}: ${eventText}`);
		enqueueSystemEvent(eventText, {
			sessionKey: route.sessionKey,
			contextKey: `discord:agent-button:${channelId}:${componentId}:${userId}`
		});
		await ackComponentInteraction({
			interaction,
			replyOpts,
			label: "agent button"
		});
	}
};
var AgentSelectMenu = class extends StringSelectMenu {
	constructor(ctx) {
		super();
		this.customId = `${AGENT_SELECT_KEY}:seed=1`;
		this.options = [];
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseAgentComponentData(data);
		if (!parsed) {
			logError("agent select: failed to parse component data");
			try {
				await interaction.reply({
					content: "This select menu is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const { componentId } = parsed;
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "agent select",
			componentLabel: "select menu",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, username, userId, replyOpts, rawGuildId, isDirectMessage, memberRoleIds } = interactionCtx;
		const allowed = await ensureAgentComponentInteractionAllowed({
			ctx: this.ctx,
			interaction,
			channelId,
			rawGuildId,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "select",
			unauthorizedReply: "You are not authorized to use this select menu."
		});
		if (!allowed) return;
		const { parentId } = allowed;
		const values = interaction.values ?? [];
		const valuesText = values.length > 0 ? ` (selected: ${values.join(", ")})` : "";
		const route = resolveAgentComponentRoute({
			ctx: this.ctx,
			rawGuildId,
			memberRoleIds,
			isDirectMessage,
			userId,
			channelId,
			parentId
		});
		const eventText = `[Discord select menu: ${componentId} interacted by ${username} (${userId})${valuesText}]`;
		logDebug(`agent select: enqueuing event for channel ${channelId}: ${eventText}`);
		enqueueSystemEvent(eventText, {
			sessionKey: route.sessionKey,
			contextKey: `discord:agent-select:${channelId}:${componentId}:${userId}`
		});
		await ackComponentInteraction({
			interaction,
			replyOpts,
			label: "agent select"
		});
	}
};
var DiscordComponentButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = "component";
		this.customId = "__openclaw_discord_component_button_wildcard__";
		this.style = ButtonStyle.Primary;
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		if (parseDiscordComponentData(data, resolveInteractionCustomId(interaction))?.modalId) {
			await handleDiscordModalTrigger({
				ctx: this.ctx,
				interaction,
				data,
				label: "discord component modal"
			});
			return;
		}
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "button",
			label: "discord component button"
		});
	}
};
var DiscordComponentStringSelect = class extends StringSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_string_select_wildcard__";
		this.options = [];
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "select menu",
			label: "discord component select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentUserSelect = class extends UserSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_user_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "user select",
			label: "discord component user select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentRoleSelect = class extends RoleSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_role_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "role select",
			label: "discord component role select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentMentionableSelect = class extends MentionableSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_mentionable_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "mentionable select",
			label: "discord component mentionable select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentChannelSelect = class extends ChannelSelectMenu {
	constructor(ctx) {
		super();
		this.customId = "__openclaw_discord_component_channel_select_wildcard__";
		this.customIdParser = parseDiscordComponentCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		await handleDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			data,
			componentLabel: "channel select",
			label: "discord component channel select",
			values: interaction.values ?? []
		});
	}
};
var DiscordComponentModal = class extends Modal {
	constructor(ctx) {
		super();
		this.title = "OpenClaw form";
		this.customId = "__openclaw_discord_component_modal_wildcard__";
		this.components = [];
		this.customIdParser = parseDiscordModalCustomIdForCarbon;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const modalId = parseDiscordModalId(data, resolveInteractionCustomId(interaction));
		if (!modalId) {
			logError("discord component modal: missing modal id");
			try {
				await interaction.reply({
					content: "This form is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const modalEntry = resolveDiscordModalEntry({
			id: modalId,
			consume: false
		});
		if (!modalEntry) {
			try {
				await interaction.reply({
					content: "This form has expired.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const interactionCtx = await resolveInteractionContextWithDmAuth({
			ctx: this.ctx,
			interaction,
			label: "discord component modal",
			componentLabel: "form",
			defer: false
		});
		if (!interactionCtx) return;
		const { channelId, user, replyOpts, rawGuildId, memberRoleIds } = interactionCtx;
		const guildInfo = resolveDiscordGuildEntry({
			guild: interaction.guild ?? void 0,
			guildId: rawGuildId,
			guildEntries: this.ctx.guildEntries
		});
		const channelCtx = resolveDiscordChannelContext(interaction);
		const allowNameMatching = isDangerousNameMatchingEnabled(this.ctx.discordConfig);
		const channelConfig = resolveDiscordChannelConfigWithFallback({
			guildInfo,
			channelId,
			channelName: channelCtx.channelName,
			channelSlug: channelCtx.channelSlug,
			parentId: channelCtx.parentId,
			parentName: channelCtx.parentName,
			parentSlug: channelCtx.parentSlug,
			scope: channelCtx.isThread ? "thread" : "channel"
		});
		if (!await ensureGuildComponentMemberAllowed({
			interaction,
			guildInfo,
			channelId,
			rawGuildId,
			channelCtx,
			memberRoleIds,
			user,
			replyOpts,
			componentLabel: "form",
			unauthorizedReply: "You are not authorized to use this form.",
			allowNameMatching
		})) return;
		if (!await ensureComponentUserAllowed({
			entry: {
				id: modalEntry.id,
				kind: "button",
				label: modalEntry.title,
				allowedUsers: modalEntry.allowedUsers
			},
			interaction,
			user,
			replyOpts,
			componentLabel: "form",
			unauthorizedReply: "You are not authorized to use this form.",
			allowNameMatching
		})) return;
		const commandAuthorized = resolveComponentCommandAuthorized({
			ctx: this.ctx,
			interactionCtx,
			channelConfig,
			guildInfo,
			allowNameMatching
		});
		const consumed = resolveDiscordModalEntry({
			id: modalId,
			consume: !modalEntry.reusable
		});
		if (!consumed) {
			try {
				await interaction.reply({
					content: "This form has expired.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		if (consumed.callbackData) {
			const fields = consumed.fields.map((field) => ({
				id: field.id,
				name: field.name,
				values: resolveModalFieldValues(field, interaction)
			}));
			if (await dispatchPluginDiscordInteractiveEvent({
				ctx: this.ctx,
				interaction,
				interactionCtx,
				channelCtx,
				isAuthorizedSender: commandAuthorized,
				data: consumed.callbackData,
				kind: "modal",
				fields,
				messageId: consumed.messageId
			}) === "handled") return;
		}
		try {
			await interaction.acknowledge();
		} catch (err) {
			logError(`discord component modal: failed to acknowledge: ${String(err)}`);
		}
		const eventText = formatModalSubmissionText(consumed, interaction);
		await dispatchDiscordComponentEvent({
			ctx: this.ctx,
			interaction,
			interactionCtx,
			channelCtx,
			guildInfo,
			eventText,
			replyToId: consumed.messageId,
			routeOverrides: {
				sessionKey: consumed.sessionKey,
				agentId: consumed.agentId,
				accountId: consumed.accountId
			}
		});
	}
};
function createAgentComponentButton(ctx) {
	return new AgentComponentButton(ctx);
}
function createAgentSelectMenu(ctx) {
	return new AgentSelectMenu(ctx);
}
function createDiscordComponentButton(ctx) {
	return new DiscordComponentButton(ctx);
}
function createDiscordComponentStringSelect(ctx) {
	return new DiscordComponentStringSelect(ctx);
}
function createDiscordComponentUserSelect(ctx) {
	return new DiscordComponentUserSelect(ctx);
}
function createDiscordComponentRoleSelect(ctx) {
	return new DiscordComponentRoleSelect(ctx);
}
function createDiscordComponentMentionableSelect(ctx) {
	return new DiscordComponentMentionableSelect(ctx);
}
function createDiscordComponentChannelSelect(ctx) {
	return new DiscordComponentChannelSelect(ctx);
}
function createDiscordComponentModal(ctx) {
	return new DiscordComponentModal(ctx);
}
//#endregion
//#region extensions/discord/src/monitor/presence.ts
const DEFAULT_CUSTOM_ACTIVITY_TYPE$1 = 4;
const CUSTOM_STATUS_NAME$1 = "Custom Status";
function resolveDiscordPresenceUpdate(config) {
	const activityText = typeof config.activity === "string" ? config.activity.trim() : "";
	const status = typeof config.status === "string" ? config.status.trim() : "";
	const activityType = config.activityType;
	const activityUrl = typeof config.activityUrl === "string" ? config.activityUrl.trim() : "";
	const hasActivity = Boolean(activityText);
	if (!hasActivity && !Boolean(status)) return {
		since: null,
		activities: [],
		status: "online",
		afk: false
	};
	const activities = [];
	if (hasActivity) {
		const resolvedType = activityType ?? DEFAULT_CUSTOM_ACTIVITY_TYPE$1;
		const activity = resolvedType === DEFAULT_CUSTOM_ACTIVITY_TYPE$1 ? {
			name: CUSTOM_STATUS_NAME$1,
			type: resolvedType,
			state: activityText
		} : {
			name: activityText,
			type: resolvedType
		};
		if (resolvedType === 1 && activityUrl) activity.url = activityUrl;
		activities.push(activity);
	}
	return {
		since: null,
		activities,
		status: status || "online",
		afk: false
	};
}
//#endregion
//#region extensions/discord/src/monitor/auto-presence.ts
const DEFAULT_CUSTOM_ACTIVITY_TYPE = 4;
const CUSTOM_STATUS_NAME = "Custom Status";
const DEFAULT_INTERVAL_MS = 3e4;
const DEFAULT_MIN_UPDATE_INTERVAL_MS = 15e3;
const MIN_INTERVAL_MS = 5e3;
const MIN_UPDATE_INTERVAL_MS = 1e3;
function normalizeOptionalText(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function clampPositiveInt(value, fallback, minValue) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const rounded = Math.round(value);
	if (rounded <= 0) return fallback;
	return Math.max(minValue, rounded);
}
function resolveAutoPresenceConfig(config) {
	const intervalMs = clampPositiveInt(config?.intervalMs, DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS);
	const minUpdateIntervalMs = clampPositiveInt(config?.minUpdateIntervalMs, DEFAULT_MIN_UPDATE_INTERVAL_MS, MIN_UPDATE_INTERVAL_MS);
	return {
		enabled: config?.enabled === true,
		intervalMs,
		minUpdateIntervalMs,
		healthyText: normalizeOptionalText(config?.healthyText),
		degradedText: normalizeOptionalText(config?.degradedText),
		exhaustedText: normalizeOptionalText(config?.exhaustedText)
	};
}
function buildCustomStatusActivity(text) {
	return {
		name: CUSTOM_STATUS_NAME,
		type: DEFAULT_CUSTOM_ACTIVITY_TYPE,
		state: text
	};
}
function renderTemplate(template, vars) {
	const rendered = template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_full, key) => vars[key] ?? "").replace(/\s+/g, " ").trim();
	return rendered.length > 0 ? rendered : void 0;
}
function isExhaustedUnavailableReason(reason) {
	if (!reason) return false;
	return reason === "rate_limit" || reason === "overloaded" || reason === "billing" || reason === "auth" || reason === "auth_permanent";
}
function formatUnavailableReason(reason) {
	if (!reason) return "unknown";
	return reason.replace(/_/g, " ");
}
function resolveAuthAvailability(params) {
	const profileIds = Object.keys(params.store.profiles);
	if (profileIds.length === 0) return {
		state: "degraded",
		unavailableReason: null
	};
	clearExpiredCooldowns(params.store, params.now);
	if (profileIds.some((profileId) => !isProfileInCooldown(params.store, profileId, params.now))) return {
		state: "healthy",
		unavailableReason: null
	};
	const unavailableReason = resolveProfilesUnavailableReason({
		store: params.store,
		profileIds,
		now: params.now
	});
	if (isExhaustedUnavailableReason(unavailableReason)) return {
		state: "exhausted",
		unavailableReason
	};
	return {
		state: "degraded",
		unavailableReason
	};
}
function resolvePresenceActivities(params) {
	const reasonLabel = formatUnavailableReason(params.unavailableReason ?? null);
	if (params.state === "healthy") {
		if (params.cfg.healthyText) return [buildCustomStatusActivity(params.cfg.healthyText)];
		return params.basePresence?.activities ?? [];
	}
	if (params.state === "degraded") {
		const text = renderTemplate(params.cfg.degradedText ?? "runtime degraded", { reason: reasonLabel });
		return text ? [buildCustomStatusActivity(text)] : [];
	}
	const defaultTemplate = isExhaustedUnavailableReason(params.unavailableReason ?? null) ? "token exhausted" : "model unavailable ({reason})";
	const text = renderTemplate(params.cfg.exhaustedText ?? defaultTemplate, { reason: reasonLabel });
	return text ? [buildCustomStatusActivity(text)] : [];
}
function resolvePresenceStatus(state) {
	if (state === "healthy") return "online";
	if (state === "exhausted") return "dnd";
	return "idle";
}
function resolveDiscordAutoPresenceDecision(params) {
	const autoPresence = resolveAutoPresenceConfig(params.discordConfig.autoPresence);
	if (!autoPresence.enabled) return null;
	const now = params.now ?? Date.now();
	const basePresence = resolveDiscordPresenceUpdate(params.discordConfig);
	const availability = resolveAuthAvailability({
		store: params.authStore,
		now
	});
	const state = params.gatewayConnected ? availability.state : "degraded";
	const unavailableReason = params.gatewayConnected ? availability.unavailableReason : availability.unavailableReason ?? "unknown";
	return {
		state,
		unavailableReason,
		presence: {
			since: null,
			activities: resolvePresenceActivities({
				state,
				cfg: autoPresence,
				basePresence,
				unavailableReason
			}),
			status: resolvePresenceStatus(state),
			afk: false
		}
	};
}
function stablePresenceSignature(payload) {
	return JSON.stringify({
		status: payload.status,
		afk: payload.afk,
		since: payload.since,
		activities: payload.activities.map((activity) => ({
			type: activity.type,
			name: activity.name,
			state: activity.state,
			url: activity.url
		}))
	});
}
function createDiscordAutoPresenceController(params) {
	const autoCfg = resolveAutoPresenceConfig(params.discordConfig.autoPresence);
	if (!autoCfg.enabled) return {
		enabled: false,
		start: () => void 0,
		stop: () => void 0,
		refresh: () => void 0,
		runNow: () => void 0
	};
	const loadAuthStore = params.loadAuthStore ?? (() => ensureAuthProfileStore());
	const now = params.now ?? (() => Date.now());
	const setIntervalFn = params.setIntervalFn ?? setInterval;
	const clearIntervalFn = params.clearIntervalFn ?? clearInterval;
	let timer;
	let lastAppliedSignature = null;
	let lastAppliedAt = 0;
	const runEvaluation = (options) => {
		let decision = null;
		try {
			decision = resolveDiscordAutoPresenceDecision({
				discordConfig: params.discordConfig,
				authStore: loadAuthStore(),
				gatewayConnected: params.gateway.isConnected,
				now: now()
			});
		} catch (err) {
			params.log?.(warn(`discord: auto-presence evaluation failed for account ${params.accountId}: ${String(err)}`));
			return;
		}
		if (!decision || !params.gateway.isConnected) return;
		const forceApply = options?.force === true;
		const ts = now();
		const signature = stablePresenceSignature(decision.presence);
		if (!forceApply && signature === lastAppliedSignature) return;
		if (!forceApply && lastAppliedAt > 0 && ts - lastAppliedAt < autoCfg.minUpdateIntervalMs) return;
		params.gateway.updatePresence(decision.presence);
		lastAppliedSignature = signature;
		lastAppliedAt = ts;
	};
	return {
		enabled: true,
		runNow: () => runEvaluation(),
		refresh: () => runEvaluation({ force: true }),
		start: () => {
			if (timer) return;
			runEvaluation({ force: true });
			timer = setIntervalFn(() => runEvaluation(), autoCfg.intervalMs);
		},
		stop: () => {
			if (!timer) return;
			clearIntervalFn(timer);
			timer = void 0;
		}
	};
}
//#endregion
//#region extensions/discord/src/monitor/commands.ts
function resolveDiscordSlashCommandConfig(raw) {
	return { ephemeral: raw?.ephemeral !== false };
}
//#endregion
//#region extensions/discord/src/monitor/exec-approvals.ts
const EXEC_APPROVAL_KEY = "execapproval";
/** Extract Discord channel ID from a session key like "agent:main:discord:channel:123456789" */
function extractDiscordChannelId(sessionKey) {
	if (!sessionKey) return null;
	const match = sessionKey.match(/discord:(?:channel|group):(\d+)/);
	return match ? match[1] : null;
}
function buildDiscordApprovalDmRedirectNotice() {
	return { content: getExecApprovalApproverDmNoticeText() };
}
function encodeCustomIdValue(value) {
	return encodeURIComponent(value);
}
function decodeCustomIdValue(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function buildExecApprovalCustomId(approvalId, action) {
	return [`${EXEC_APPROVAL_KEY}:id=${encodeCustomIdValue(approvalId)}`, `action=${action}`].join(";");
}
function parseExecApprovalData(data) {
	if (!data || typeof data !== "object") return null;
	const coerce = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "";
	const rawId = coerce(data.id);
	const rawAction = coerce(data.action);
	if (!rawId || !rawAction) return null;
	const action = rawAction;
	if (action !== "allow-once" && action !== "allow-always" && action !== "deny") return null;
	return {
		approvalId: decodeCustomIdValue(rawId),
		action
	};
}
var ExecApprovalContainer = class extends DiscordUiContainer {
	constructor(params) {
		const components = [new TextDisplay(`## ${params.title}`)];
		if (params.description) components.push(new TextDisplay(params.description));
		components.push(new Separator({
			divider: true,
			spacing: "small"
		}));
		components.push(new TextDisplay(`### Command\n\`\`\`\n${params.commandPreview}\n\`\`\``));
		if (params.commandSecondaryPreview) components.push(new TextDisplay(`### Shell Preview\n\`\`\`\n${params.commandSecondaryPreview}\n\`\`\``));
		if (params.metadataLines?.length) components.push(new TextDisplay(params.metadataLines.join("\n")));
		if (params.actionRow) components.push(params.actionRow);
		if (params.footer) {
			components.push(new Separator({
				divider: false,
				spacing: "small"
			}));
			components.push(new TextDisplay(`-# ${params.footer}`));
		}
		super({
			cfg: params.cfg,
			accountId: params.accountId,
			components,
			accentColor: params.accentColor
		});
	}
};
var ExecApprovalActionButton = class extends Button {
	constructor(params) {
		super();
		this.customId = buildExecApprovalCustomId(params.approvalId, params.action);
		this.label = params.label;
		this.style = params.style;
	}
};
var ExecApprovalActionRow = class extends Row {
	constructor(approvalId) {
		super([
			new ExecApprovalActionButton({
				approvalId,
				action: "allow-once",
				label: "Allow once",
				style: ButtonStyle.Success
			}),
			new ExecApprovalActionButton({
				approvalId,
				action: "allow-always",
				label: "Always allow",
				style: ButtonStyle.Primary
			}),
			new ExecApprovalActionButton({
				approvalId,
				action: "deny",
				label: "Deny",
				style: ButtonStyle.Danger
			})
		]);
	}
};
function resolveExecApprovalAccountId(params) {
	const sessionKey = params.request.request.sessionKey?.trim();
	if (!sessionKey) return null;
	try {
		const agentId = resolveAgentIdFromSessionKey(sessionKey);
		const entry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId }))[sessionKey];
		const channel = normalizeMessageChannel(entry?.origin?.provider ?? entry?.lastChannel);
		if (channel && channel !== "discord") return null;
		return (entry?.origin?.accountId ?? entry?.lastAccountId)?.trim() || null;
	} catch {
		return null;
	}
}
function buildExecApprovalMetadataLines(request) {
	const lines = [];
	if (request.request.cwd) lines.push(`- Working Directory: ${request.request.cwd}`);
	if (request.request.host) lines.push(`- Host: ${request.request.host}`);
	if (Array.isArray(request.request.envKeys) && request.request.envKeys.length > 0) lines.push(`- Env Overrides: ${request.request.envKeys.join(", ")}`);
	if (request.request.agentId) lines.push(`- Agent: ${request.request.agentId}`);
	return lines;
}
function buildExecApprovalPayload(container) {
	return { components: [container] };
}
function formatCommandPreview(commandText, maxChars) {
	return (commandText.length > maxChars ? `${commandText.slice(0, maxChars)}...` : commandText).replace(/`/g, "​`");
}
function formatOptionalCommandPreview(commandText, maxChars) {
	if (!commandText) return null;
	return formatCommandPreview(commandText, maxChars);
}
function resolveExecApprovalPreviews(request, maxChars, secondaryMaxChars) {
	const { commandText, commandPreview: secondaryPreview } = resolveExecApprovalCommandDisplay(request);
	return {
		commandPreview: formatCommandPreview(commandText, maxChars),
		commandSecondaryPreview: formatOptionalCommandPreview(secondaryPreview, secondaryMaxChars)
	};
}
function createExecApprovalRequestContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 1e3, 500);
	const expiresAtSeconds = Math.max(0, Math.floor(params.request.expiresAtMs / 1e3));
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval Required",
		description: "A command needs your approval.",
		commandPreview,
		commandSecondaryPreview,
		metadataLines: buildExecApprovalMetadataLines(params.request),
		actionRow: params.actionRow,
		footer: `Expires <t:${expiresAtSeconds}:R> · ID: ${params.request.id}`,
		accentColor: "#FFA500"
	});
}
function createResolvedContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 500, 300);
	const decisionLabel = params.decision === "allow-once" ? "Allowed (once)" : params.decision === "allow-always" ? "Allowed (always)" : "Denied";
	const accentColor = params.decision === "deny" ? "#ED4245" : params.decision === "allow-always" ? "#5865F2" : "#57F287";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: `Exec Approval: ${decisionLabel}`,
		description: params.resolvedBy ? `Resolved by ${params.resolvedBy}` : "Resolved",
		commandPreview,
		commandSecondaryPreview,
		footer: `ID: ${params.request.id}`,
		accentColor
	});
}
function createExpiredContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveExecApprovalPreviews(params.request.request, 500, 300);
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval: Expired",
		description: "This approval request has expired.",
		commandPreview,
		commandSecondaryPreview,
		footer: `ID: ${params.request.id}`,
		accentColor: "#99AAB5"
	});
}
var DiscordExecApprovalHandler = class {
	constructor(opts) {
		this.gatewayClient = null;
		this.pending = /* @__PURE__ */ new Map();
		this.requestCache = /* @__PURE__ */ new Map();
		this.started = false;
		this.opts = opts;
	}
	shouldHandle(request) {
		const config = this.opts.config;
		if (!config.enabled) return false;
		if (!config.approvers || config.approvers.length === 0) return false;
		const requestAccountId = resolveExecApprovalAccountId({
			cfg: this.opts.cfg,
			request
		});
		if (requestAccountId) {
			const handlerAccountId = normalizeAccountId(this.opts.accountId);
			if (normalizeAccountId(requestAccountId) !== handlerAccountId) return false;
		}
		if (config.agentFilter?.length) {
			if (!request.request.agentId) return false;
			if (!config.agentFilter.includes(request.request.agentId)) return false;
		}
		if (config.sessionFilter?.length) {
			const session = request.request.sessionKey;
			if (!session) return false;
			if (!config.sessionFilter.some((p) => {
				if (session.includes(p)) return true;
				const regex = compileSafeRegex(p);
				return regex ? testRegexWithBoundedInput(regex, session) : false;
			})) return false;
		}
		return true;
	}
	async start() {
		if (this.started) return;
		this.started = true;
		const config = this.opts.config;
		if (!config.enabled) {
			logDebug("discord exec approvals: disabled");
			return;
		}
		if (!config.approvers || config.approvers.length === 0) {
			logDebug("discord exec approvals: no approvers configured");
			return;
		}
		logDebug("discord exec approvals: starting handler");
		this.gatewayClient = await createOperatorApprovalsGatewayClient({
			config: this.opts.cfg,
			gatewayUrl: this.opts.gatewayUrl,
			clientDisplayName: "Discord Exec Approvals",
			onEvent: (evt) => this.handleGatewayEvent(evt),
			onHelloOk: () => {
				logDebug("discord exec approvals: connected to gateway");
			},
			onConnectError: (err) => {
				logError(`discord exec approvals: connect error: ${err.message}`);
			},
			onClose: (code, reason) => {
				logDebug(`discord exec approvals: gateway closed: ${code} ${reason}`);
			}
		});
		this.gatewayClient.start();
	}
	async stop() {
		if (!this.started) return;
		this.started = false;
		for (const pending of this.pending.values()) clearTimeout(pending.timeoutId);
		this.pending.clear();
		this.requestCache.clear();
		this.gatewayClient?.stop();
		this.gatewayClient = null;
		logDebug("discord exec approvals: stopped");
	}
	handleGatewayEvent(evt) {
		if (evt.event === "exec.approval.requested") {
			const request = evt.payload;
			this.handleApprovalRequested(request);
		} else if (evt.event === "exec.approval.resolved") {
			const resolved = evt.payload;
			this.handleApprovalResolved(resolved);
		}
	}
	async handleApprovalRequested(request) {
		if (!this.shouldHandle(request)) return;
		logDebug(`discord exec approvals: received request ${request.id}`);
		this.requestCache.set(request.id, request);
		const { rest, request: discordRequest } = createDiscordClient({
			token: this.opts.token,
			accountId: this.opts.accountId
		}, this.opts.cfg);
		const actionRow = new ExecApprovalActionRow(request.id);
		const body = stripUndefinedFields(serializePayload(buildExecApprovalPayload(createExecApprovalRequestContainer({
			request,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			actionRow
		}))));
		const target = this.opts.config.target ?? "dm";
		const sendToDm = target === "dm" || target === "both";
		const sendToChannel = target === "channel" || target === "both";
		let fallbackToDm = false;
		const originatingChannelId = request.request.sessionKey && target === "dm" ? extractDiscordChannelId(request.request.sessionKey) : null;
		if (target === "dm" && originatingChannelId) try {
			await discordRequest(() => rest.post(Routes.channelMessages(originatingChannelId), { body: buildDiscordApprovalDmRedirectNotice() }), "send-approval-dm-redirect-notice");
		} catch (err) {
			logError(`discord exec approvals: failed to send DM redirect notice: ${String(err)}`);
		}
		if (sendToChannel) {
			const channelId = extractDiscordChannelId(request.request.sessionKey);
			if (channelId) try {
				const message = await discordRequest(() => rest.post(Routes.channelMessages(channelId), { body }), "send-approval-channel");
				if (message?.id) {
					const timeoutMs = Math.max(0, request.expiresAtMs - Date.now());
					const timeoutId = setTimeout(() => {
						this.handleApprovalTimeout(request.id, "channel");
					}, timeoutMs);
					this.pending.set(`${request.id}:channel`, {
						discordMessageId: message.id,
						discordChannelId: channelId,
						timeoutId
					});
					logDebug(`discord exec approvals: sent approval ${request.id} to channel ${channelId}`);
				}
			} catch (err) {
				logError(`discord exec approvals: failed to send to channel: ${String(err)}`);
			}
			else if (!sendToDm) {
				logError(`discord exec approvals: target is "channel" but could not extract channel id from session key "${request.request.sessionKey ?? "(none)"}" — falling back to DM delivery for approval ${request.id}`);
				fallbackToDm = true;
			} else logDebug("discord exec approvals: could not extract channel id from session key");
		}
		if (sendToDm || fallbackToDm) {
			const approvers = this.opts.config.approvers ?? [];
			for (const approver of approvers) {
				const userId = String(approver);
				try {
					const dmChannel = await discordRequest(() => rest.post(Routes.userChannels(), { body: { recipient_id: userId } }), "dm-channel");
					if (!dmChannel?.id) {
						logError(`discord exec approvals: failed to create DM for user ${userId}`);
						continue;
					}
					const message = await discordRequest(() => rest.post(Routes.channelMessages(dmChannel.id), { body }), "send-approval");
					if (!message?.id) {
						logError(`discord exec approvals: failed to send message to user ${userId}`);
						continue;
					}
					const existingDm = this.pending.get(`${request.id}:dm`);
					if (existingDm) clearTimeout(existingDm.timeoutId);
					const timeoutMs = Math.max(0, request.expiresAtMs - Date.now());
					const timeoutId = setTimeout(() => {
						this.handleApprovalTimeout(request.id, "dm");
					}, timeoutMs);
					this.pending.set(`${request.id}:dm`, {
						discordMessageId: message.id,
						discordChannelId: dmChannel.id,
						timeoutId
					});
					logDebug(`discord exec approvals: sent approval ${request.id} to user ${userId}`);
				} catch (err) {
					logError(`discord exec approvals: failed to notify user ${userId}: ${String(err)}`);
				}
			}
		}
	}
	async handleApprovalResolved(resolved) {
		const request = this.requestCache.get(resolved.id);
		this.requestCache.delete(resolved.id);
		if (!request) return;
		logDebug(`discord exec approvals: resolved ${resolved.id} with ${resolved.decision}`);
		const container = createResolvedContainer({
			request,
			decision: resolved.decision,
			resolvedBy: resolved.resolvedBy,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		});
		for (const suffix of [
			":channel",
			":dm",
			""
		]) {
			const key = `${resolved.id}${suffix}`;
			const pending = this.pending.get(key);
			if (!pending) continue;
			clearTimeout(pending.timeoutId);
			this.pending.delete(key);
			await this.finalizeMessage(pending.discordChannelId, pending.discordMessageId, container);
		}
	}
	async handleApprovalTimeout(approvalId, source) {
		const key = source ? `${approvalId}:${source}` : approvalId;
		const pending = this.pending.get(key);
		if (!pending) return;
		this.pending.delete(key);
		const request = this.requestCache.get(approvalId);
		if (!(this.pending.has(`${approvalId}:channel`) || this.pending.has(`${approvalId}:dm`) || this.pending.has(approvalId))) this.requestCache.delete(approvalId);
		if (!request) return;
		logDebug(`discord exec approvals: timeout for ${approvalId} (${source ?? "default"})`);
		const container = createExpiredContainer({
			request,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId
		});
		await this.finalizeMessage(pending.discordChannelId, pending.discordMessageId, container);
	}
	async finalizeMessage(channelId, messageId, container) {
		if (!this.opts.config.cleanupAfterResolve) {
			await this.updateMessage(channelId, messageId, container);
			return;
		}
		try {
			const { rest, request: discordRequest } = createDiscordClient({
				token: this.opts.token,
				accountId: this.opts.accountId
			}, this.opts.cfg);
			await discordRequest(() => rest.delete(Routes.channelMessage(channelId, messageId)), "delete-approval");
		} catch (err) {
			logError(`discord exec approvals: failed to delete message: ${String(err)}`);
			await this.updateMessage(channelId, messageId, container);
		}
	}
	async updateMessage(channelId, messageId, container) {
		try {
			const { rest, request: discordRequest } = createDiscordClient({
				token: this.opts.token,
				accountId: this.opts.accountId
			}, this.opts.cfg);
			const payload = buildExecApprovalPayload(container);
			await discordRequest(() => rest.patch(Routes.channelMessage(channelId, messageId), { body: stripUndefinedFields(serializePayload(payload)) }), "update-approval");
		} catch (err) {
			logError(`discord exec approvals: failed to update message: ${String(err)}`);
		}
	}
	async resolveApproval(approvalId, decision) {
		if (!this.gatewayClient) {
			logError("discord exec approvals: gateway client not connected");
			return false;
		}
		logDebug(`discord exec approvals: resolving ${approvalId} with ${decision}`);
		try {
			await this.gatewayClient.request("exec.approval.resolve", {
				id: approvalId,
				decision
			});
			logDebug(`discord exec approvals: resolved ${approvalId} successfully`);
			return true;
		} catch (err) {
			logError(`discord exec approvals: resolve failed: ${String(err)}`);
			return false;
		}
	}
	/** Return the list of configured approver IDs. */
	getApprovers() {
		return this.opts.config.approvers ?? [];
	}
};
var ExecApprovalButton = class extends Button {
	constructor(ctx) {
		super();
		this.label = "execapproval";
		this.customId = `${EXEC_APPROVAL_KEY}:seed=1`;
		this.style = ButtonStyle.Primary;
		this.ctx = ctx;
	}
	async run(interaction, data) {
		const parsed = parseExecApprovalData(data);
		if (!parsed) {
			try {
				await interaction.reply({
					content: "This approval is no longer valid.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const approvers = this.ctx.handler.getApprovers();
		const userId = interaction.userId;
		if (!approvers.some((id) => String(id) === userId)) {
			try {
				await interaction.reply({
					content: "⛔ You are not authorized to approve exec requests.",
					ephemeral: true
				});
			} catch {}
			return;
		}
		const decisionLabel = parsed.action === "allow-once" ? "Allowed (once)" : parsed.action === "allow-always" ? "Allowed (always)" : "Denied";
		try {
			await interaction.acknowledge();
		} catch {}
		if (!await this.ctx.handler.resolveApproval(parsed.approvalId, parsed.action)) try {
			await interaction.followUp({
				content: `Failed to submit approval decision for **${decisionLabel}**. The request may have expired or already been resolved.`,
				ephemeral: true
			});
		} catch {}
	}
};
function createExecApprovalButton(ctx) {
	return new ExecApprovalButton(ctx);
}
//#endregion
//#region extensions/discord/src/monitor/gateway-error-guard.ts
function attachEarlyGatewayErrorGuard(client) {
	const pendingErrors = [];
	const emitter = getDiscordGatewayEmitter(client.getPlugin("gateway"));
	if (!emitter) return {
		pendingErrors,
		release: () => {}
	};
	let released = false;
	const onGatewayError = (err) => {
		pendingErrors.push(err);
	};
	emitter.on("error", onGatewayError);
	return {
		pendingErrors,
		release: () => {
			if (released) return;
			released = true;
			emitter.removeListener("error", onGatewayError);
		}
	};
}
//#endregion
//#region extensions/discord/node_modules/agent-base/dist/index.js
const INTERNAL = Symbol("AgentBaseInternalState");
var Agent$2 = class extends http.Agent {
	constructor(opts) {
		super(opts);
		this[INTERNAL] = {};
	}
	/**
	* Determine whether this is an `http` or `https` request.
	*/
	isSecureEndpoint(options) {
		if (options) {
			if (typeof options.secureEndpoint === "boolean") return options.secureEndpoint;
			if (typeof options.protocol === "string") return options.protocol === "https:";
		}
		const { stack } = /* @__PURE__ */ new Error();
		if (typeof stack !== "string") return false;
		return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
	}
	incrementSockets(name) {
		if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) return null;
		if (!this.sockets[name]) this.sockets[name] = [];
		const fakeSocket = new net.Socket({ writable: false });
		this.sockets[name].push(fakeSocket);
		this.totalSocketCount++;
		return fakeSocket;
	}
	decrementSockets(name, socket) {
		if (!this.sockets[name] || socket === null) return;
		const sockets = this.sockets[name];
		const index = sockets.indexOf(socket);
		if (index !== -1) {
			sockets.splice(index, 1);
			this.totalSocketCount--;
			if (sockets.length === 0) delete this.sockets[name];
		}
	}
	getName(options) {
		if (this.isSecureEndpoint(options)) return Agent$1.prototype.getName.call(this, options);
		return super.getName(options);
	}
	createSocket(req, options, cb) {
		const connectOpts = {
			...options,
			secureEndpoint: this.isSecureEndpoint(options)
		};
		const name = this.getName(connectOpts);
		const fakeSocket = this.incrementSockets(name);
		Promise.resolve().then(() => this.connect(req, connectOpts)).then((socket) => {
			this.decrementSockets(name, fakeSocket);
			if (socket instanceof http.Agent) try {
				return socket.addRequest(req, connectOpts);
			} catch (err) {
				return cb(err);
			}
			this[INTERNAL].currentSocket = socket;
			super.createSocket(req, options, cb);
		}, (err) => {
			this.decrementSockets(name, fakeSocket);
			cb(err);
		});
	}
	createConnection() {
		const socket = this[INTERNAL].currentSocket;
		this[INTERNAL].currentSocket = void 0;
		if (!socket) throw new Error("No socket was returned in the `connect()` function");
		return socket;
	}
	get defaultPort() {
		return this[INTERNAL].defaultPort ?? (this.protocol === "https:" ? 443 : 80);
	}
	set defaultPort(v) {
		if (this[INTERNAL]) this[INTERNAL].defaultPort = v;
	}
	get protocol() {
		return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? "https:" : "http:");
	}
	set protocol(v) {
		if (this[INTERNAL]) this[INTERNAL].protocol = v;
	}
};
//#endregion
//#region extensions/discord/node_modules/https-proxy-agent/dist/parse-proxy-response.js
var import_src = /* @__PURE__ */ __toESM(require_src(), 1);
const debug$1 = (0, import_src.default)("https-proxy-agent:parse-proxy-response");
function parseProxyResponse(socket) {
	return new Promise((resolve, reject) => {
		let buffersLength = 0;
		const buffers = [];
		function read() {
			const b = socket.read();
			if (b) ondata(b);
			else socket.once("readable", read);
		}
		function cleanup() {
			socket.removeListener("end", onend);
			socket.removeListener("error", onerror);
			socket.removeListener("readable", read);
		}
		function onend() {
			cleanup();
			debug$1("onend");
			reject(/* @__PURE__ */ new Error("Proxy connection ended before receiving CONNECT response"));
		}
		function onerror(err) {
			cleanup();
			debug$1("onerror %o", err);
			reject(err);
		}
		function ondata(b) {
			buffers.push(b);
			buffersLength += b.length;
			const buffered = Buffer.concat(buffers, buffersLength);
			const endOfHeaders = buffered.indexOf("\r\n\r\n");
			if (endOfHeaders === -1) {
				debug$1("have not received end of HTTP headers yet...");
				read();
				return;
			}
			const headerParts = buffered.slice(0, endOfHeaders).toString("ascii").split("\r\n");
			const firstLine = headerParts.shift();
			if (!firstLine) {
				socket.destroy();
				return reject(/* @__PURE__ */ new Error("No header received from proxy CONNECT response"));
			}
			const firstLineParts = firstLine.split(" ");
			const statusCode = +firstLineParts[1];
			const statusText = firstLineParts.slice(2).join(" ");
			const headers = {};
			for (const header of headerParts) {
				if (!header) continue;
				const firstColon = header.indexOf(":");
				if (firstColon === -1) {
					socket.destroy();
					return reject(/* @__PURE__ */ new Error(`Invalid header from proxy CONNECT response: "${header}"`));
				}
				const key = header.slice(0, firstColon).toLowerCase();
				const value = header.slice(firstColon + 1).trimStart();
				const current = headers[key];
				if (typeof current === "string") headers[key] = [current, value];
				else if (Array.isArray(current)) current.push(value);
				else headers[key] = value;
			}
			debug$1("got proxy server response: %o %o", firstLine, headers);
			cleanup();
			resolve({
				connect: {
					statusCode,
					statusText,
					headers
				},
				buffered
			});
		}
		socket.on("error", onerror);
		socket.on("end", onend);
		read();
	});
}
//#endregion
//#region extensions/discord/node_modules/https-proxy-agent/dist/index.js
const debug = (0, import_src.default)("https-proxy-agent");
const setServernameFromNonIpHost = (options) => {
	if (options.servername === void 0 && options.host && !net.isIP(options.host)) return {
		...options,
		servername: options.host
	};
	return options;
};
/**
* The `HttpsProxyAgent` implements an HTTP Agent subclass that connects to
* the specified "HTTP(s) proxy server" in order to proxy HTTPS requests.
*
* Outgoing HTTP requests are first tunneled through the proxy server using the
* `CONNECT` HTTP request method to establish a connection to the proxy server,
* and then the proxy server connects to the destination target and issues the
* HTTP request from the proxy server.
*
* `https:` requests have their socket connection upgraded to TLS once
* the connection to the proxy server has been established.
*/
var HttpsProxyAgent = class extends Agent$2 {
	constructor(proxy, opts) {
		super(opts);
		this.options = { path: void 0 };
		this.proxy = typeof proxy === "string" ? new URL$1(proxy) : proxy;
		this.proxyHeaders = opts?.headers ?? {};
		debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);
		const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, "");
		const port = this.proxy.port ? parseInt(this.proxy.port, 10) : this.proxy.protocol === "https:" ? 443 : 80;
		this.connectOpts = {
			ALPNProtocols: ["http/1.1"],
			...opts ? omit(opts, "headers") : null,
			host,
			port
		};
	}
	/**
	* Called when the node-core HTTP client library is creating a
	* new HTTP request.
	*/
	async connect(req, opts) {
		const { proxy } = this;
		if (!opts.host) throw new TypeError("No \"host\" provided");
		let socket;
		if (proxy.protocol === "https:") {
			debug("Creating `tls.Socket`: %o", this.connectOpts);
			socket = tls.connect(setServernameFromNonIpHost(this.connectOpts));
		} else {
			debug("Creating `net.Socket`: %o", this.connectOpts);
			socket = net.connect(this.connectOpts);
		}
		const headers = typeof this.proxyHeaders === "function" ? this.proxyHeaders() : { ...this.proxyHeaders };
		const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
		let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r\n`;
		if (proxy.username || proxy.password) {
			const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
			headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString("base64")}`;
		}
		headers.Host = `${host}:${opts.port}`;
		if (!headers["Proxy-Connection"]) headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
		for (const name of Object.keys(headers)) payload += `${name}: ${headers[name]}\r\n`;
		const proxyResponsePromise = parseProxyResponse(socket);
		socket.write(`${payload}\r\n`);
		const { connect, buffered } = await proxyResponsePromise;
		req.emit("proxyConnect", connect);
		this.emit("proxyConnect", connect, req);
		if (connect.statusCode === 200) {
			req.once("socket", resume);
			if (opts.secureEndpoint) {
				debug("Upgrading socket connection to TLS");
				return tls.connect({
					...omit(setServernameFromNonIpHost(opts), "host", "path", "port"),
					socket
				});
			}
			return socket;
		}
		socket.destroy();
		const fakeSocket = new net.Socket({ writable: false });
		fakeSocket.readable = true;
		req.once("socket", (s) => {
			debug("Replaying proxy buffer for failed request");
			assert(s.listenerCount("data") > 0);
			s.push(buffered);
			s.push(null);
		});
		return fakeSocket;
	}
};
HttpsProxyAgent.protocols = ["http", "https"];
function resume(socket) {
	socket.resume();
}
function omit(obj, ...keys) {
	const ret = {};
	let key;
	for (key in obj) if (!keys.includes(key)) ret[key] = obj[key];
	return ret;
}
//#endregion
//#region extensions/discord/src/monitor/gateway-plugin.ts
const DISCORD_GATEWAY_BOT_URL = "https://discord.com/api/v10/gateway/bot";
const DEFAULT_DISCORD_GATEWAY_URL = "wss://gateway.discord.gg/";
const DISCORD_GATEWAY_INFO_TIMEOUT_MS = 1e4;
function resolveDiscordGatewayIntents(intentsConfig) {
	let intents = GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent | GatewayIntents.DirectMessages | GatewayIntents.GuildMessageReactions | GatewayIntents.DirectMessageReactions | GatewayIntents.GuildVoiceStates;
	if (intentsConfig?.presence) intents |= GatewayIntents.GuildPresences;
	if (intentsConfig?.guildMembers) intents |= GatewayIntents.GuildMembers;
	return intents;
}
function summarizeGatewayResponseBody(body) {
	const normalized = body.trim().replace(/\s+/g, " ");
	if (!normalized) return "<empty>";
	return normalized.slice(0, 240);
}
function isTransientDiscordGatewayResponse(status, body) {
	if (status >= 500) return true;
	const normalized = body.toLowerCase();
	return normalized.includes("upstream connect error") || normalized.includes("disconnect/reset before headers") || normalized.includes("reset reason:");
}
function createGatewayMetadataError(params) {
	const error = new Error(params.transient ? "Failed to get gateway information from Discord: fetch failed" : `Failed to get gateway information from Discord: ${params.detail}`, { cause: params.cause ?? (params.transient ? new Error(params.detail) : void 0) });
	Object.defineProperty(error, "transient", {
		value: params.transient,
		enumerable: false
	});
	return error;
}
function isTransientGatewayMetadataError(error) {
	return Boolean(error?.transient);
}
function createDefaultGatewayInfo() {
	return {
		url: DEFAULT_DISCORD_GATEWAY_URL,
		shards: 1,
		session_start_limit: {
			total: 1,
			remaining: 1,
			reset_after: 0,
			max_concurrency: 1
		}
	};
}
async function fetchDiscordGatewayInfo(params) {
	let response;
	try {
		response = await params.fetchImpl(DISCORD_GATEWAY_BOT_URL, {
			...params.fetchInit,
			headers: {
				...params.fetchInit?.headers,
				Authorization: `Bot ${params.token}`
			}
		});
	} catch (error) {
		throw createGatewayMetadataError({
			detail: error instanceof Error ? error.message : String(error),
			transient: true,
			cause: error
		});
	}
	let body;
	try {
		body = await response.text();
	} catch (error) {
		throw createGatewayMetadataError({
			detail: error instanceof Error ? error.message : String(error),
			transient: true,
			cause: error
		});
	}
	const summary = summarizeGatewayResponseBody(body);
	const transient = isTransientDiscordGatewayResponse(response.status, body);
	if (!response.ok) throw createGatewayMetadataError({
		detail: `Discord API /gateway/bot failed (${response.status}): ${summary}`,
		transient
	});
	try {
		const parsed = JSON.parse(body);
		return {
			...parsed,
			url: typeof parsed.url === "string" && parsed.url.trim() ? parsed.url : DEFAULT_DISCORD_GATEWAY_URL
		};
	} catch (error) {
		throw createGatewayMetadataError({
			detail: `Discord API /gateway/bot returned invalid JSON: ${summary}`,
			transient,
			cause: error
		});
	}
}
async function fetchDiscordGatewayInfoWithTimeout(params) {
	const timeoutMs = Math.max(1, params.timeoutMs ?? DISCORD_GATEWAY_INFO_TIMEOUT_MS);
	const abortController = new AbortController();
	let timeoutId;
	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			abortController.abort();
			reject(createGatewayMetadataError({
				detail: `Discord API /gateway/bot timed out after ${timeoutMs}ms`,
				transient: true,
				cause: /* @__PURE__ */ new Error("gateway metadata timeout")
			}));
		}, timeoutMs);
		timeoutId.unref?.();
	});
	try {
		return await Promise.race([fetchDiscordGatewayInfo({
			token: params.token,
			fetchImpl: params.fetchImpl,
			fetchInit: {
				...params.fetchInit,
				signal: abortController.signal
			}
		}), timeoutPromise]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
function resolveGatewayInfoWithFallback(params) {
	if (!isTransientGatewayMetadataError(params.error)) throw params.error;
	const message = params.error instanceof Error ? params.error.message : String(params.error);
	params.runtime?.log?.(`discord: gateway metadata lookup failed transiently; using default gateway url (${message})`);
	return {
		info: createDefaultGatewayInfo(),
		usedFallback: true
	};
}
function createGatewayPlugin(params) {
	class SafeGatewayPlugin extends GatewayPlugin {
		constructor() {
			super(params.options);
			this.gatewayInfoUsedFallback = false;
		}
		async registerClient(client) {
			if (!this.gatewayInfo || this.gatewayInfoUsedFallback) {
				const resolved = await fetchDiscordGatewayInfoWithTimeout({
					token: client.options.token,
					fetchImpl: params.fetchImpl,
					fetchInit: params.fetchInit
				}).then((info) => ({
					info,
					usedFallback: false
				})).catch((error) => resolveGatewayInfoWithFallback({
					runtime: params.runtime,
					error
				}));
				this.gatewayInfo = resolved.info;
				this.gatewayInfoUsedFallback = resolved.usedFallback;
			}
			return super.registerClient(client);
		}
		createWebSocket(url) {
			if (!params.wsAgent) return super.createWebSocket(url);
			return new WebSocket(url, { agent: params.wsAgent });
		}
	}
	return new SafeGatewayPlugin();
}
function createDiscordGatewayPlugin(params) {
	const intents = resolveDiscordGatewayIntents(params.discordConfig?.intents);
	const proxy = params.discordConfig?.proxy?.trim();
	const options = {
		reconnect: { maxAttempts: 50 },
		intents,
		autoInteractions: true
	};
	if (!proxy) return createGatewayPlugin({
		options,
		fetchImpl: (input, init) => fetch(input, init),
		runtime: params.runtime
	});
	try {
		const wsAgent = new HttpsProxyAgent(proxy);
		const fetchAgent = new ProxyAgent(proxy);
		params.runtime.log?.("discord: gateway proxy enabled");
		return createGatewayPlugin({
			options,
			fetchImpl: (input, init) => fetch$1(input, init),
			fetchInit: { dispatcher: fetchAgent },
			wsAgent,
			runtime: params.runtime
		});
	} catch (err) {
		params.runtime.error?.(danger(`discord: invalid gateway proxy: ${String(err)}`));
		return createGatewayPlugin({
			options,
			fetchImpl: (input, init) => fetch(input, init),
			runtime: params.runtime
		});
	}
}
//#endregion
//#region extensions/discord/src/monitor/provider.allowlist.ts
function formatResolutionLogDetails(base, details) {
	const nonEmpty = details.map((value) => value?.trim()).filter((value) => Boolean(value));
	return nonEmpty.length > 0 ? `${base} (${nonEmpty.join("; ")})` : base;
}
function formatDiscordChannelResolved(entry) {
	const target = entry.channelId ? `${entry.guildId}/${entry.channelId}` : entry.guildId;
	return formatResolutionLogDetails(`${entry.input}→${target}`, [
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.channelName ? `channel:${entry.channelName}` : void 0,
		entry.note
	]);
}
function formatDiscordChannelUnresolved(entry) {
	return formatResolutionLogDetails(entry.input, [
		entry.guildName ? `guild:${entry.guildName}` : entry.guildId ? `guildId:${entry.guildId}` : void 0,
		entry.channelName ? `channel:${entry.channelName}` : entry.channelId ? `channelId:${entry.channelId}` : void 0,
		entry.note
	]);
}
function formatDiscordUserResolved(entry) {
	const displayName = entry.name?.trim();
	const target = displayName || entry.id;
	return formatResolutionLogDetails(`${entry.input}→${target}`, [
		displayName && entry.id ? `id:${entry.id}` : void 0,
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.note
	]);
}
function formatDiscordUserUnresolved(entry) {
	return formatResolutionLogDetails(entry.input, [
		entry.name ? `name:${entry.name}` : void 0,
		entry.guildName ? `guild:${entry.guildName}` : void 0,
		entry.note
	]);
}
function toGuildEntries(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const [key, entry] of Object.entries(value)) {
		if (!entry || typeof entry !== "object") continue;
		out[key] = entry;
	}
	return out;
}
function toAllowlistEntries(value) {
	if (!Array.isArray(value)) return;
	return value.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry));
}
function hasGuildEntries(value) {
	return Object.keys(value).length > 0;
}
function collectChannelResolutionInputs(guildEntries) {
	const entries = [];
	for (const [guildKey, guildCfg] of Object.entries(guildEntries)) {
		if (guildKey === "*") continue;
		const channels = guildCfg?.channels ?? {};
		const channelKeys = Object.keys(channels).filter((key) => key !== "*");
		if (channelKeys.length === 0) {
			const input = /^\d+$/.test(guildKey) ? `guild:${guildKey}` : guildKey;
			entries.push({
				input,
				guildKey
			});
			continue;
		}
		for (const channelKey of channelKeys) entries.push({
			input: `${guildKey}/${channelKey}`,
			guildKey,
			channelKey
		});
	}
	return entries;
}
async function resolveGuildEntriesByChannelAllowlist(params) {
	const entries = collectChannelResolutionInputs(params.guildEntries);
	if (entries.length === 0) return params.guildEntries;
	try {
		const resolved = await resolveDiscordChannelAllowlist({
			token: params.token,
			entries: entries.map((entry) => entry.input),
			fetcher: params.fetcher
		});
		const sourceByInput = new Map(entries.map((entry) => [entry.input, entry]));
		const nextGuilds = { ...params.guildEntries };
		const mapping = [];
		const unresolved = [];
		for (const entry of resolved) {
			const source = sourceByInput.get(entry.input);
			if (!source) continue;
			const sourceGuild = params.guildEntries[source.guildKey] ?? {};
			if (!entry.resolved || !entry.guildId) {
				unresolved.push(formatDiscordChannelUnresolved(entry));
				continue;
			}
			mapping.push(formatDiscordChannelResolved(entry));
			const existing = nextGuilds[entry.guildId] ?? {};
			const mergedChannels = {
				...sourceGuild.channels,
				...existing.channels
			};
			const mergedGuild = {
				...sourceGuild,
				...existing,
				channels: mergedChannels
			};
			nextGuilds[entry.guildId] = mergedGuild;
			if (source.channelKey && entry.channelId) {
				const sourceChannel = sourceGuild.channels?.[source.channelKey];
				if (sourceChannel) nextGuilds[entry.guildId] = {
					...mergedGuild,
					channels: {
						...mergedChannels,
						[entry.channelId]: {
							...sourceChannel,
							...mergedChannels[entry.channelId]
						}
					}
				};
			}
		}
		summarizeMapping("discord channels", mapping, unresolved, params.runtime);
		return nextGuilds;
	} catch (err) {
		params.runtime.log?.(`discord channel resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.guildEntries;
	}
}
async function resolveAllowFromByUserAllowlist(params) {
	const allowEntries = normalizeStringEntries(params.allowFrom).filter((entry) => entry !== "*");
	if (allowEntries.length === 0) return params.allowFrom;
	try {
		const { resolvedMap, mapping, unresolved } = buildAllowlistResolutionSummary(await resolveDiscordUserAllowlist({
			token: params.token,
			entries: allowEntries,
			fetcher: params.fetcher
		}), {
			formatResolved: formatDiscordUserResolved,
			formatUnresolved: formatDiscordUserUnresolved
		});
		const allowFrom = canonicalizeAllowlistWithResolvedIds({
			existing: params.allowFrom,
			resolvedMap
		});
		summarizeMapping("discord users", mapping, unresolved, params.runtime);
		return allowFrom;
	} catch (err) {
		params.runtime.log?.(`discord user resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.allowFrom;
	}
}
function collectGuildUserEntries(guildEntries) {
	const userEntries = /* @__PURE__ */ new Set();
	for (const guild of Object.values(guildEntries)) {
		if (!guild || typeof guild !== "object") continue;
		addAllowlistUserEntriesFromConfigEntry(userEntries, guild);
		const channels = guild.channels ?? {};
		for (const channel of Object.values(channels)) addAllowlistUserEntriesFromConfigEntry(userEntries, channel);
	}
	return userEntries;
}
async function resolveGuildEntriesByUserAllowlist(params) {
	const userEntries = collectGuildUserEntries(params.guildEntries);
	if (userEntries.size === 0) return params.guildEntries;
	try {
		const { resolvedMap, mapping, unresolved } = buildAllowlistResolutionSummary(await resolveDiscordUserAllowlist({
			token: params.token,
			entries: Array.from(userEntries),
			fetcher: params.fetcher
		}), {
			formatResolved: formatDiscordUserResolved,
			formatUnresolved: formatDiscordUserUnresolved
		});
		const nextGuilds = { ...params.guildEntries };
		for (const [guildKey, guildConfig] of Object.entries(params.guildEntries)) {
			if (!guildConfig || typeof guildConfig !== "object") continue;
			const nextGuild = { ...guildConfig };
			const users = guildConfig.users;
			if (Array.isArray(users) && users.length > 0) nextGuild.users = canonicalizeAllowlistWithResolvedIds({
				existing: users,
				resolvedMap
			});
			const channels = guildConfig.channels ?? {};
			if (channels && typeof channels === "object") nextGuild.channels = patchAllowlistUsersInConfigEntries({
				entries: channels,
				resolvedMap,
				strategy: "canonicalize"
			});
			nextGuilds[guildKey] = nextGuild;
		}
		summarizeMapping("discord channel users", mapping, unresolved, params.runtime);
		return nextGuilds;
	} catch (err) {
		params.runtime.log?.(`discord channel user resolve failed; using config entries. ${formatErrorMessage(err)}`);
		return params.guildEntries;
	}
}
async function resolveDiscordAllowlistConfig(params) {
	let guildEntries = toGuildEntries(params.guildEntries);
	let allowFrom = toAllowlistEntries(params.allowFrom);
	if (hasGuildEntries(guildEntries)) guildEntries = await resolveGuildEntriesByChannelAllowlist({
		token: params.token,
		guildEntries,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	allowFrom = await resolveAllowFromByUserAllowlist({
		token: params.token,
		allowFrom,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	if (hasGuildEntries(guildEntries)) guildEntries = await resolveGuildEntriesByUserAllowlist({
		token: params.token,
		guildEntries,
		fetcher: params.fetcher,
		runtime: params.runtime
	});
	return {
		guildEntries: hasGuildEntries(guildEntries) ? guildEntries : void 0,
		allowFrom
	};
}
//#endregion
//#region extensions/discord/src/gateway-logging.ts
const INFO_DEBUG_MARKERS = [
	"WebSocket connection closed",
	"Reconnecting with backoff",
	"Attempting resume with backoff"
];
const shouldPromoteGatewayDebug = (message) => INFO_DEBUG_MARKERS.some((marker) => message.includes(marker));
const formatGatewayMetrics = (metrics) => {
	if (metrics === null || metrics === void 0) return String(metrics);
	if (typeof metrics === "string") return metrics;
	if (typeof metrics === "number" || typeof metrics === "boolean" || typeof metrics === "bigint") return String(metrics);
	try {
		return JSON.stringify(metrics);
	} catch {
		return "[unserializable metrics]";
	}
};
function attachDiscordGatewayLogging(params) {
	const { emitter, runtime } = params;
	if (!emitter) return () => {};
	const onGatewayDebug = (msg) => {
		const message = String(msg);
		logVerbose(`discord gateway: ${message}`);
		if (shouldPromoteGatewayDebug(message)) runtime.log?.(`discord gateway: ${message}`);
	};
	const onGatewayWarning = (warning) => {
		logVerbose(`discord gateway warning: ${String(warning)}`);
	};
	const onGatewayMetrics = (metrics) => {
		logVerbose(`discord gateway metrics: ${formatGatewayMetrics(metrics)}`);
	};
	emitter.on("debug", onGatewayDebug);
	emitter.on("warning", onGatewayWarning);
	emitter.on("metrics", onGatewayMetrics);
	return () => {
		emitter.removeListener("debug", onGatewayDebug);
		emitter.removeListener("warning", onGatewayWarning);
		emitter.removeListener("metrics", onGatewayMetrics);
	};
}
//#endregion
//#region extensions/discord/src/monitor/provider.lifecycle.ts
const DISCORD_GATEWAY_READY_TIMEOUT_MS = 15e3;
const DISCORD_GATEWAY_READY_POLL_MS = 250;
async function waitForDiscordGatewayReady(params) {
	const deadlineAt = Date.now() + params.timeoutMs;
	while (!params.abortSignal?.aborted) {
		if (await params.beforePoll?.() === "stop") return "stopped";
		if (params.gateway?.isConnected) return "ready";
		if (Date.now() >= deadlineAt) return "timeout";
		await new Promise((resolve) => {
			setTimeout(resolve, DISCORD_GATEWAY_READY_POLL_MS).unref?.();
		});
	}
	return "stopped";
}
async function runDiscordGatewayLifecycle(params) {
	const HELLO_TIMEOUT_MS = 3e4;
	const HELLO_CONNECTED_POLL_MS = 250;
	const MAX_CONSECUTIVE_HELLO_STALLS = 3;
	const RECONNECT_STALL_TIMEOUT_MS = 5 * 6e4;
	const gateway = params.client.getPlugin("gateway");
	if (gateway) registerGateway(params.accountId, gateway);
	const gatewayEmitter = getDiscordGatewayEmitter(gateway);
	const stopGatewayLogging = attachDiscordGatewayLogging({
		emitter: gatewayEmitter,
		runtime: params.runtime
	});
	let lifecycleStopping = false;
	let forceStopHandler;
	let queuedForceStopError;
	const pushStatus = (patch) => {
		params.statusSink?.(patch);
	};
	const triggerForceStop = (err) => {
		if (forceStopHandler) {
			forceStopHandler(err);
			return;
		}
		queuedForceStopError = err;
	};
	const reconnectStallWatchdog = createArmableStallWatchdog({
		label: `discord:${params.accountId}:reconnect`,
		timeoutMs: RECONNECT_STALL_TIMEOUT_MS,
		abortSignal: params.abortSignal,
		runtime: params.runtime,
		onTimeout: () => {
			if (params.abortSignal?.aborted || lifecycleStopping) return;
			const at = Date.now();
			const error = /* @__PURE__ */ new Error(`discord reconnect watchdog timeout after ${RECONNECT_STALL_TIMEOUT_MS}ms`);
			pushStatus({
				connected: false,
				lastEventAt: at,
				lastDisconnect: {
					at,
					error: error.message
				},
				lastError: error.message
			});
			params.runtime.error?.(danger(`discord: reconnect watchdog timeout after ${RECONNECT_STALL_TIMEOUT_MS}ms; force-stopping monitor task`));
			triggerForceStop(error);
		}
	});
	const onAbort = () => {
		lifecycleStopping = true;
		reconnectStallWatchdog.disarm();
		pushStatus({
			connected: false,
			lastEventAt: Date.now()
		});
		if (!gateway) return;
		gatewayEmitter?.once("error", () => {});
		gateway.options.reconnect = { maxAttempts: 0 };
		gateway.disconnect();
	};
	if (params.abortSignal?.aborted) onAbort();
	else params.abortSignal?.addEventListener("abort", onAbort, { once: true });
	let helloTimeoutId;
	let helloConnectedPollId;
	let consecutiveHelloStalls = 0;
	const clearHelloWatch = () => {
		if (helloTimeoutId) {
			clearTimeout(helloTimeoutId);
			helloTimeoutId = void 0;
		}
		if (helloConnectedPollId) {
			clearInterval(helloConnectedPollId);
			helloConnectedPollId = void 0;
		}
	};
	const resetHelloStallCounter = () => {
		consecutiveHelloStalls = 0;
	};
	const parseGatewayCloseCode = (message) => {
		const match = /code\s+(\d{3,5})/i.exec(message);
		if (!match?.[1]) return;
		const code = Number.parseInt(match[1], 10);
		return Number.isFinite(code) ? code : void 0;
	};
	const clearResumeState = () => {
		const mutableGateway = gateway;
		if (!mutableGateway?.state) return;
		mutableGateway.state.sessionId = null;
		mutableGateway.state.resumeGatewayUrl = null;
		mutableGateway.state.sequence = null;
		mutableGateway.sequence = null;
	};
	const onGatewayDebug = (msg) => {
		const message = String(msg);
		const at = Date.now();
		pushStatus({ lastEventAt: at });
		if (message.includes("WebSocket connection closed")) {
			if (gateway?.isConnected) resetHelloStallCounter();
			reconnectStallWatchdog.arm(at);
			pushStatus({
				connected: false,
				lastDisconnect: {
					at,
					status: parseGatewayCloseCode(message)
				}
			});
			clearHelloWatch();
			return;
		}
		if (!message.includes("WebSocket connection opened")) return;
		reconnectStallWatchdog.disarm();
		clearHelloWatch();
		let sawConnected = gateway?.isConnected === true;
		if (sawConnected) pushStatus({
			...createConnectedChannelStatusPatch(at),
			lastDisconnect: null
		});
		helloConnectedPollId = setInterval(() => {
			if (!gateway?.isConnected) return;
			sawConnected = true;
			resetHelloStallCounter();
			const connectedAt = Date.now();
			reconnectStallWatchdog.disarm();
			pushStatus({
				...createConnectedChannelStatusPatch(connectedAt),
				lastDisconnect: null
			});
			if (helloConnectedPollId) {
				clearInterval(helloConnectedPollId);
				helloConnectedPollId = void 0;
			}
		}, HELLO_CONNECTED_POLL_MS);
		helloTimeoutId = setTimeout(() => {
			if (helloConnectedPollId) {
				clearInterval(helloConnectedPollId);
				helloConnectedPollId = void 0;
			}
			if (sawConnected || gateway?.isConnected) resetHelloStallCounter();
			else {
				consecutiveHelloStalls += 1;
				const forceFreshIdentify = consecutiveHelloStalls >= MAX_CONSECUTIVE_HELLO_STALLS;
				const stalledAt = Date.now();
				reconnectStallWatchdog.arm(stalledAt);
				pushStatus({
					connected: false,
					lastEventAt: stalledAt,
					lastDisconnect: {
						at: stalledAt,
						error: "hello-timeout"
					}
				});
				params.runtime.log?.(danger(forceFreshIdentify ? `connection stalled: no HELLO within ${HELLO_TIMEOUT_MS}ms (${consecutiveHelloStalls}/${MAX_CONSECUTIVE_HELLO_STALLS}); forcing fresh identify` : `connection stalled: no HELLO within ${HELLO_TIMEOUT_MS}ms (${consecutiveHelloStalls}/${MAX_CONSECUTIVE_HELLO_STALLS}); retrying resume`));
				if (forceFreshIdentify) {
					clearResumeState();
					resetHelloStallCounter();
				}
				gateway?.disconnect();
				gateway?.connect(!forceFreshIdentify);
			}
			helloTimeoutId = void 0;
		}, HELLO_TIMEOUT_MS);
	};
	gatewayEmitter?.on("debug", onGatewayDebug);
	let sawDisallowedIntents = false;
	const logGatewayError = (err) => {
		if (params.isDisallowedIntentsError(err)) {
			sawDisallowedIntents = true;
			params.runtime.error?.(danger("discord: gateway closed with code 4014 (missing privileged gateway intents). Enable the required intents in the Discord Developer Portal or disable them in config."));
			return;
		}
		params.runtime.error?.(danger(`discord gateway error: ${String(err)}`));
	};
	const shouldStopOnGatewayError = (err) => {
		const message = String(err);
		return message.includes("Max reconnect attempts") || message.includes("Fatal Gateway error") || params.isDisallowedIntentsError(err);
	};
	const drainPendingGatewayErrors = () => {
		const pendingGatewayErrors = params.pendingGatewayErrors ?? [];
		if (pendingGatewayErrors.length === 0) return "continue";
		const queuedErrors = [...pendingGatewayErrors];
		pendingGatewayErrors.length = 0;
		for (const err of queuedErrors) {
			logGatewayError(err);
			if (!shouldStopOnGatewayError(err)) continue;
			if (params.isDisallowedIntentsError(err)) return "stop";
			throw err;
		}
		return "continue";
	};
	try {
		if (params.execApprovalsHandler) await params.execApprovalsHandler.start();
		if (drainPendingGatewayErrors() === "stop") return;
		if (gateway && !gateway.isConnected && !lifecycleStopping) {
			const initialReady = await waitForDiscordGatewayReady({
				gateway,
				abortSignal: params.abortSignal,
				timeoutMs: DISCORD_GATEWAY_READY_TIMEOUT_MS,
				beforePoll: drainPendingGatewayErrors
			});
			if (initialReady === "stopped" || lifecycleStopping) return;
			if (initialReady === "timeout" && !lifecycleStopping) {
				params.runtime.error?.(danger(`discord: gateway was not ready after ${DISCORD_GATEWAY_READY_TIMEOUT_MS}ms; forcing a fresh reconnect`));
				const startupRetryAt = Date.now();
				pushStatus({
					connected: false,
					lastEventAt: startupRetryAt,
					lastDisconnect: {
						at: startupRetryAt,
						error: "startup-not-ready"
					}
				});
				gateway?.disconnect();
				gateway?.connect(false);
				const reconnected = await waitForDiscordGatewayReady({
					gateway,
					abortSignal: params.abortSignal,
					timeoutMs: DISCORD_GATEWAY_READY_TIMEOUT_MS,
					beforePoll: drainPendingGatewayErrors
				});
				if (reconnected === "stopped" || lifecycleStopping) return;
				if (reconnected === "timeout" && !lifecycleStopping) {
					const error = /* @__PURE__ */ new Error(`discord gateway did not reach READY within ${DISCORD_GATEWAY_READY_TIMEOUT_MS}ms after a forced reconnect`);
					const startupFailureAt = Date.now();
					pushStatus({
						connected: false,
						lastEventAt: startupFailureAt,
						lastDisconnect: {
							at: startupFailureAt,
							error: "startup-reconnect-timeout"
						},
						lastError: error.message
					});
					throw error;
				}
			}
		}
		if (gateway?.isConnected && !lifecycleStopping) pushStatus({
			...createConnectedChannelStatusPatch(Date.now()),
			lastDisconnect: null
		});
		await waitForDiscordGatewayStop({
			gateway: gateway ? {
				emitter: gatewayEmitter,
				disconnect: () => gateway.disconnect()
			} : void 0,
			abortSignal: params.abortSignal,
			onGatewayError: logGatewayError,
			shouldStopOnError: shouldStopOnGatewayError,
			registerForceStop: (forceStop) => {
				forceStopHandler = forceStop;
				if (queuedForceStopError !== void 0) {
					const queued = queuedForceStopError;
					queuedForceStopError = void 0;
					forceStop(queued);
				}
			}
		});
	} catch (err) {
		if (!sawDisallowedIntents && !params.isDisallowedIntentsError(err)) throw err;
	} finally {
		lifecycleStopping = true;
		params.releaseEarlyGatewayErrorGuard?.();
		unregisterGateway(params.accountId);
		stopGatewayLogging();
		reconnectStallWatchdog.stop();
		clearHelloWatch();
		gatewayEmitter?.removeListener("debug", onGatewayDebug);
		params.abortSignal?.removeEventListener("abort", onAbort);
		if (params.voiceManager) {
			await params.voiceManager.destroy();
			params.voiceManagerRef.current = null;
		}
		if (params.execApprovalsHandler) await params.execApprovalsHandler.stop();
		params.threadBindings.stop();
	}
}
//#endregion
//#region extensions/discord/src/monitor/rest-fetch.ts
function resolveDiscordRestFetch(proxyUrl, runtime) {
	const proxy = proxyUrl?.trim();
	if (!proxy) return fetch;
	try {
		const agent = new ProxyAgent(proxy);
		const fetcher = ((input, init) => fetch$1(input, {
			...init,
			dispatcher: agent
		}));
		runtime.log?.("discord: rest proxy enabled");
		return wrapFetchWithAbortSignal(fetcher);
	} catch (err) {
		runtime.error?.(danger(`discord: invalid rest proxy: ${String(err)}`));
		return fetch;
	}
}
//#endregion
//#region extensions/discord/src/monitor/startup-status.ts
function formatDiscordStartupStatusMessage(params) {
	const identitySuffix = params.botIdentity ? ` as ${params.botIdentity}` : "";
	if (params.gatewayReady) return `logged in to discord${identitySuffix}`;
	return `discord client initialized${identitySuffix}; awaiting gateway readiness`;
}
//#endregion
//#region extensions/discord/src/monitor/provider.ts
let discordVoiceRuntimePromise;
let discordProviderSessionRuntimePromise;
async function loadDiscordVoiceRuntime() {
	discordVoiceRuntimePromise ??= import("./manager.runtime-CaFSYL8b.js");
	return await discordVoiceRuntimePromise;
}
async function loadDiscordProviderSessionRuntime() {
	discordProviderSessionRuntimePromise ??= import("./provider-session.runtime-CpNaTnkW.js");
	return await discordProviderSessionRuntimePromise;
}
function formatThreadBindingDurationForConfigLabel(durationMs) {
	const label = formatThreadBindingDurationLabel(durationMs);
	return label === "disabled" ? "off" : label;
}
function appendPluginCommandSpecs(params) {
	const merged = [...params.commandSpecs];
	const existingNames = new Set(merged.map((spec) => spec.name.trim().toLowerCase()).filter(Boolean));
	for (const pluginCommand of getPluginCommandSpecs("discord")) {
		const normalizedName = pluginCommand.name.trim().toLowerCase();
		if (!normalizedName) continue;
		if (existingNames.has(normalizedName)) {
			params.runtime.error?.(danger(`discord: plugin command "/${normalizedName}" duplicates an existing native command. Skipping.`));
			continue;
		}
		existingNames.add(normalizedName);
		merged.push({
			name: pluginCommand.name,
			description: pluginCommand.description,
			acceptsArgs: pluginCommand.acceptsArgs
		});
	}
	return merged;
}
const DISCORD_ACP_STATUS_PROBE_TIMEOUT_MS = 8e3;
const DISCORD_ACP_STALE_RUNNING_ACTIVITY_MS = 120 * 1e3;
function isLegacyMissingSessionError(message) {
	return message.includes("Session is not ACP-enabled") || message.includes("ACP session metadata missing");
}
function classifyAcpStatusProbeError(params) {
	if (params.isAcpRuntimeError(params.error) && params.error.code === "ACP_SESSION_INIT_FAILED") return {
		status: "stale",
		reason: "session-init-failed"
	};
	if (isLegacyMissingSessionError(params.error instanceof Error ? params.error.message : String(params.error))) return {
		status: "stale",
		reason: "session-missing"
	};
	return params.isStaleRunning ? {
		status: "stale",
		reason: "status-error-running-stale"
	} : {
		status: "uncertain",
		reason: "status-error"
	};
}
async function probeDiscordAcpBindingHealth(params) {
	const { getAcpSessionManager, isAcpRuntimeError } = await loadDiscordProviderSessionRuntime();
	const manager = getAcpSessionManager();
	const statusProbeAbortController = new AbortController();
	const statusPromise = manager.getSessionStatus({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		signal: statusProbeAbortController.signal
	}).then((status) => ({
		kind: "status",
		status
	})).catch((error) => ({
		kind: "error",
		error
	}));
	let timeoutTimer = null;
	const timeoutPromise = new Promise((resolve) => {
		timeoutTimer = setTimeout(() => resolve({ kind: "timeout" }), DISCORD_ACP_STATUS_PROBE_TIMEOUT_MS);
		timeoutTimer.unref?.();
	});
	const result = await Promise.race([statusPromise, timeoutPromise]);
	if (timeoutTimer) clearTimeout(timeoutTimer);
	if (result.kind === "timeout") statusProbeAbortController.abort();
	const runningForMs = params.storedState === "running" && Number.isFinite(params.lastActivityAt) ? Date.now() - Math.max(0, Math.floor(params.lastActivityAt ?? 0)) : 0;
	const isStaleRunning = params.storedState === "running" && runningForMs >= DISCORD_ACP_STALE_RUNNING_ACTIVITY_MS;
	if (result.kind === "timeout") return isStaleRunning ? {
		status: "stale",
		reason: "status-timeout-running-stale"
	} : {
		status: "uncertain",
		reason: "status-timeout"
	};
	if (result.kind === "error") return classifyAcpStatusProbeError({
		error: result.error,
		isStaleRunning,
		isAcpRuntimeError
	});
	if (result.status.state === "error") return {
		status: "uncertain",
		reason: "status-error-state"
	};
	return { status: "healthy" };
}
async function deployDiscordCommands(params) {
	if (!params.enabled) return;
	const startupStartedAt = params.startupStartedAt ?? Date.now();
	const accountId = params.accountId ?? "default";
	const maxAttempts = 3;
	const maxRetryDelayMs = 15e3;
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
	const isDailyCreateLimit = (err) => err instanceof RateLimitError && err.discordCode === 30034 && /daily application command creates/i.test(err.message);
	const restClient = params.client.rest;
	const originalPut = restClient.put.bind(restClient);
	const previousQueueRequests = restClient.options?.queueRequests;
	restClient.put = async (path, data, query) => {
		const startedAt = Date.now();
		const body = data && typeof data === "object" && "body" in data ? data.body : void 0;
		const commandCount = Array.isArray(body) ? body.length : void 0;
		const bodyBytes = body === void 0 ? void 0 : Buffer.byteLength(typeof body === "string" ? body : JSON.stringify(body), "utf8");
		if (shouldLogVerbose()) params.runtime.log?.(`discord startup [${accountId}] deploy-rest:put:start ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path}${typeof commandCount === "number" ? ` commands=${commandCount}` : ""}${typeof bodyBytes === "number" ? ` bytes=${bodyBytes}` : ""}`);
		try {
			const result = await originalPut(path, data, query);
			if (shouldLogVerbose()) params.runtime.log?.(`discord startup [${accountId}] deploy-rest:put:done ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path} requestMs=${Date.now() - startedAt}`);
			return result;
		} catch (err) {
			params.runtime.error?.(`discord startup [${accountId}] deploy-rest:put:error ${Math.max(0, Date.now() - startupStartedAt)}ms path=${path} requestMs=${Date.now() - startedAt} error=${formatErrorMessage(err)}`);
			throw err;
		}
	};
	try {
		if (restClient.options) restClient.options.queueRequests = false;
		params.runtime.log?.("discord: native commands using Carbon reconcile path");
		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
			await params.client.handleDeployRequest();
			return;
		} catch (err) {
			if (isDailyCreateLimit(err)) {
				params.runtime.log?.(warn(`discord: native command deploy skipped for ${accountId}; daily application command create limit reached. Existing slash commands stay active until Discord resets the quota.`));
				return;
			}
			if (!(err instanceof RateLimitError) || attempt >= maxAttempts) throw err;
			const retryAfterMs = Math.max(0, Math.ceil(err.retryAfter * 1e3));
			if (retryAfterMs > maxRetryDelayMs) {
				params.runtime.log?.(warn(`discord: native command deploy skipped for ${accountId}; retry_after=${retryAfterMs}ms exceeds startup budget. Existing slash commands stay active.`));
				return;
			}
			if (shouldLogVerbose()) params.runtime.log?.(`discord startup [${accountId}] deploy-retry ${Math.max(0, Date.now() - startupStartedAt)}ms attempt=${attempt}/${maxAttempts - 1} retryAfterMs=${retryAfterMs} scope=${err.scope ?? "unknown"} code=${err.discordCode ?? "unknown"}`);
			await sleep(retryAfterMs);
		}
	} catch (err) {
		const details = formatDiscordDeployErrorDetails(err);
		params.runtime.error?.(danger(`discord: failed to deploy native commands: ${formatErrorMessage(err)}${details}`));
	} finally {
		if (restClient.options) restClient.options.queueRequests = previousQueueRequests;
		restClient.put = originalPut;
	}
}
function formatDiscordStartupGatewayState(gateway) {
	if (!gateway) return "gateway=missing";
	const reconnectAttempts = gateway.reconnectAttempts;
	return `gatewayConnected=${gateway.isConnected ? "true" : "false"} reconnectAttempts=${typeof reconnectAttempts === "number" ? reconnectAttempts : "na"}`;
}
function logDiscordStartupPhase(params) {
	if (!isVerbose()) return;
	const elapsedMs = Math.max(0, Date.now() - params.startAt);
	const suffix = [params.details, formatDiscordStartupGatewayState(params.gateway)].filter((value) => Boolean(value)).join(" ");
	params.runtime.log?.(`discord startup [${params.accountId}] ${params.phase} ${elapsedMs}ms${suffix ? ` ${suffix}` : ""}`);
}
function formatDiscordDeployErrorDetails(err) {
	if (!err || typeof err !== "object") return "";
	const status = err.status;
	const discordCode = err.discordCode;
	const rawBody = err.rawBody;
	const details = [];
	if (typeof status === "number") details.push(`status=${status}`);
	if (typeof discordCode === "number" || typeof discordCode === "string") details.push(`code=${discordCode}`);
	if (rawBody !== void 0) {
		let bodyText = "";
		try {
			bodyText = JSON.stringify(rawBody);
		} catch {
			bodyText = typeof rawBody === "string" ? rawBody : inspect(rawBody, {
				depth: 3,
				breakLength: 120
			});
		}
		if (bodyText) {
			const maxLen = 800;
			const trimmed = bodyText.length > maxLen ? `${bodyText.slice(0, maxLen)}...` : bodyText;
			details.push(`body=${trimmed}`);
		}
	}
	return details.length > 0 ? ` (${details.join(", ")})` : "";
}
const DISCORD_DISALLOWED_INTENTS_CODE = GatewayCloseCodes.DisallowedIntents;
function isDiscordDisallowedIntentsError(err) {
	if (!err) return false;
	return formatErrorMessage(err).includes(String(DISCORD_DISALLOWED_INTENTS_CODE));
}
async function monitorDiscordProvider(opts = {}) {
	const startupStartedAt = Date.now();
	const cfg = opts.config ?? loadConfig();
	const account = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = normalizeDiscordToken(opts.token ?? void 0, "channels.discord.token") ?? account.token;
	if (!token) throw new Error(`Discord bot token missing for account "${account.accountId}" (set discord.accounts.${account.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	const runtime = opts.runtime ?? createNonExitingRuntime();
	const rawDiscordCfg = account.config;
	const discordRootThreadBindings = cfg.channels?.discord?.threadBindings;
	const discordAccountThreadBindings = cfg.channels?.discord?.accounts?.[account.accountId]?.threadBindings;
	const discordRestFetch = resolveDiscordRestFetch(rawDiscordCfg.proxy, runtime);
	const dmConfig = rawDiscordCfg.dm;
	let guildEntries = rawDiscordCfg.guilds;
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.discord !== void 0,
		groupPolicy: rawDiscordCfg.groupPolicy,
		defaultGroupPolicy
	});
	const discordCfg = rawDiscordCfg.groupPolicy === groupPolicy ? rawDiscordCfg : {
		...rawDiscordCfg,
		groupPolicy
	};
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "discord",
		accountId: account.accountId,
		blockedLabel: GROUP_POLICY_BLOCKED_LABEL.guild,
		log: (message) => runtime.log?.(warn(message))
	});
	let allowFrom = discordCfg.allowFrom ?? dmConfig?.allowFrom;
	const mediaMaxBytes = (opts.mediaMaxMb ?? discordCfg.mediaMaxMb ?? 8) * 1024 * 1024;
	const textLimit = resolveTextChunkLimit(cfg, "discord", account.accountId, { fallbackLimit: 2e3 });
	const historyLimit = Math.max(0, opts.historyLimit ?? discordCfg.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? 20);
	const replyToMode = opts.replyToMode ?? discordCfg.replyToMode ?? "off";
	const dmEnabled = dmConfig?.enabled ?? true;
	const dmPolicy = discordCfg.dmPolicy ?? dmConfig?.policy ?? "pairing";
	const discordProviderSessionRuntime = await loadDiscordProviderSessionRuntime();
	const threadBindingIdleTimeoutMs = discordProviderSessionRuntime.resolveThreadBindingIdleTimeoutMs({
		channelIdleHoursRaw: discordAccountThreadBindings?.idleHours ?? discordRootThreadBindings?.idleHours,
		sessionIdleHoursRaw: cfg.session?.threadBindings?.idleHours
	});
	const threadBindingMaxAgeMs = discordProviderSessionRuntime.resolveThreadBindingMaxAgeMs({
		channelMaxAgeHoursRaw: discordAccountThreadBindings?.maxAgeHours ?? discordRootThreadBindings?.maxAgeHours,
		sessionMaxAgeHoursRaw: cfg.session?.threadBindings?.maxAgeHours
	});
	const threadBindingsEnabled = discordProviderSessionRuntime.resolveThreadBindingsEnabled({
		channelEnabledRaw: discordAccountThreadBindings?.enabled ?? discordRootThreadBindings?.enabled,
		sessionEnabledRaw: cfg.session?.threadBindings?.enabled
	});
	const groupDmEnabled = dmConfig?.groupEnabled ?? false;
	const groupDmChannels = dmConfig?.groupChannels;
	const nativeEnabled = resolveNativeCommandsEnabled({
		providerId: "discord",
		providerSetting: discordCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const nativeSkillsEnabled = resolveNativeSkillsEnabled({
		providerId: "discord",
		providerSetting: discordCfg.commands?.nativeSkills,
		globalSetting: cfg.commands?.nativeSkills
	});
	const nativeDisabledExplicit = isNativeCommandsExplicitlyDisabled({
		providerSetting: discordCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const slashCommand = resolveDiscordSlashCommandConfig(discordCfg.slashCommand);
	const sessionPrefix = "discord:slash";
	const ephemeralDefault = slashCommand.ephemeral;
	const voiceEnabled = discordCfg.voice?.enabled !== false;
	const allowlistResolved = await resolveDiscordAllowlistConfig({
		token,
		guildEntries,
		allowFrom,
		fetcher: discordRestFetch,
		runtime
	});
	guildEntries = allowlistResolved.guildEntries;
	allowFrom = allowlistResolved.allowFrom;
	if (shouldLogVerbose()) {
		const allowFromSummary = summarizeStringEntries({
			entries: allowFrom ?? [],
			limit: 4,
			emptyText: "any"
		});
		const groupDmChannelSummary = summarizeStringEntries({
			entries: groupDmChannels ?? [],
			limit: 4,
			emptyText: "any"
		});
		const guildSummary = summarizeStringEntries({
			entries: Object.keys(guildEntries ?? {}),
			limit: 4,
			emptyText: "any"
		});
		logVerbose(`discord: config dm=${dmEnabled ? "on" : "off"} dmPolicy=${dmPolicy} allowFrom=${allowFromSummary} groupDm=${groupDmEnabled ? "on" : "off"} groupDmChannels=${groupDmChannelSummary} groupPolicy=${groupPolicy} guilds=${guildSummary} historyLimit=${historyLimit} mediaMaxMb=${Math.round(mediaMaxBytes / (1024 * 1024))} native=${nativeEnabled ? "on" : "off"} nativeSkills=${nativeSkillsEnabled ? "on" : "off"} accessGroups=${useAccessGroups ? "on" : "off"} threadBindings=${threadBindingsEnabled ? "on" : "off"} threadIdleTimeout=${formatThreadBindingDurationForConfigLabel(threadBindingIdleTimeoutMs)} threadMaxAge=${formatThreadBindingDurationForConfigLabel(threadBindingMaxAgeMs)}`);
	}
	logDiscordStartupPhase({
		runtime,
		accountId: account.accountId,
		phase: "fetch-application-id:start",
		startAt: startupStartedAt
	});
	const applicationId = await fetchDiscordApplicationId(token, 4e3, discordRestFetch);
	if (!applicationId) throw new Error("Failed to resolve Discord application id");
	logDiscordStartupPhase({
		runtime,
		accountId: account.accountId,
		phase: "fetch-application-id:done",
		startAt: startupStartedAt,
		details: `applicationId=${applicationId}`
	});
	const maxDiscordCommands = 100;
	let skillCommands = nativeEnabled && nativeSkillsEnabled ? listSkillCommandsForAgents({ cfg }) : [];
	let commandSpecs = nativeEnabled ? listNativeCommandSpecsForConfig(cfg, {
		skillCommands,
		provider: "discord"
	}) : [];
	if (nativeEnabled) commandSpecs = appendPluginCommandSpecs({
		commandSpecs,
		runtime
	});
	const initialCommandCount = commandSpecs.length;
	if (nativeEnabled && nativeSkillsEnabled && commandSpecs.length > maxDiscordCommands) {
		skillCommands = [];
		commandSpecs = listNativeCommandSpecsForConfig(cfg, {
			skillCommands: [],
			provider: "discord"
		});
		commandSpecs = appendPluginCommandSpecs({
			commandSpecs,
			runtime
		});
		runtime.log?.(warn(`discord: ${initialCommandCount} commands exceeds limit; removing per-skill commands and keeping /skill.`));
	}
	if (nativeEnabled && commandSpecs.length > maxDiscordCommands) runtime.log?.(warn(`discord: ${commandSpecs.length} commands exceeds limit; some commands may fail to deploy.`));
	const voiceManagerRef = { current: null };
	const threadBindings = threadBindingsEnabled ? discordProviderSessionRuntime.createThreadBindingManager({
		accountId: account.accountId,
		token,
		cfg,
		idleTimeoutMs: threadBindingIdleTimeoutMs,
		maxAgeMs: threadBindingMaxAgeMs
	}) : discordProviderSessionRuntime.createNoopThreadBindingManager(account.accountId);
	if (threadBindingsEnabled) {
		const uncertainProbeKeys = /* @__PURE__ */ new Set();
		const reconciliation = await discordProviderSessionRuntime.reconcileAcpThreadBindingsOnStartup({
			cfg,
			accountId: account.accountId,
			sendFarewell: false,
			healthProbe: async ({ sessionKey, session }) => {
				const probe = await probeDiscordAcpBindingHealth({
					cfg,
					sessionKey,
					storedState: session.acp?.state,
					lastActivityAt: session.acp?.lastActivityAt
				});
				if (probe.status === "uncertain") uncertainProbeKeys.add(`${sessionKey}${probe.reason ? ` (${probe.reason})` : ""}`);
				return probe;
			}
		});
		if (reconciliation.removed > 0) logVerbose(`discord: removed ${reconciliation.removed}/${reconciliation.checked} stale ACP thread bindings on startup for account ${account.accountId}: ${reconciliation.staleSessionKeys.join(", ")}`);
		if (uncertainProbeKeys.size > 0) logVerbose(`discord: ACP thread-binding health probe uncertain for account ${account.accountId}: ${[...uncertainProbeKeys].join(", ")}`);
	}
	let lifecycleStarted = false;
	let releaseEarlyGatewayErrorGuard = () => {};
	let deactivateMessageHandler;
	let autoPresenceController = null;
	let earlyGatewayEmitter;
	let onEarlyGatewayDebug;
	try {
		const commands = commandSpecs.map((spec) => createDiscordNativeCommand({
			command: spec,
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			sessionPrefix,
			ephemeralDefault,
			threadBindings
		}));
		if (nativeEnabled && voiceEnabled) commands.push(createDiscordVoiceCommand({
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			groupPolicy,
			useAccessGroups,
			getManager: () => voiceManagerRef.current,
			ephemeralDefault
		}));
		const execApprovalsConfig = discordCfg.execApprovals ?? {};
		const execApprovalsHandler = execApprovalsConfig.enabled ? new DiscordExecApprovalHandler({
			token,
			accountId: account.accountId,
			config: execApprovalsConfig,
			cfg,
			runtime
		}) : null;
		const agentComponentsEnabled = (discordCfg.agentComponents ?? {}).enabled ?? true;
		const components = [
			createDiscordCommandArgFallbackButton({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			}),
			createDiscordModelPickerFallbackButton({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			}),
			createDiscordModelPickerFallbackSelect({
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				sessionPrefix,
				threadBindings
			})
		];
		const modals = [];
		if (execApprovalsHandler) components.push(createExecApprovalButton({ handler: execApprovalsHandler }));
		if (agentComponentsEnabled) {
			const componentContext = {
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				guildEntries,
				allowFrom,
				dmPolicy,
				runtime,
				token
			};
			components.push(createAgentComponentButton(componentContext));
			components.push(createAgentSelectMenu(componentContext));
			components.push(createDiscordComponentButton(componentContext));
			components.push(createDiscordComponentStringSelect(componentContext));
			components.push(createDiscordComponentUserSelect(componentContext));
			components.push(createDiscordComponentRoleSelect(componentContext));
			components.push(createDiscordComponentMentionableSelect(componentContext));
			components.push(createDiscordComponentChannelSelect(componentContext));
			modals.push(createDiscordComponentModal(componentContext));
		}
		class DiscordStatusReadyListener extends ReadyListener {
			async handle(_data, client) {
				if (autoPresenceController?.enabled) {
					autoPresenceController.refresh();
					return;
				}
				const gateway = client.getPlugin("gateway");
				if (!gateway) return;
				const presence = resolveDiscordPresenceUpdate(discordCfg);
				if (!presence) return;
				gateway.updatePresence(presence);
			}
		}
		const clientPlugins = [createDiscordGatewayPlugin({
			discordConfig: discordCfg,
			runtime
		})];
		if (voiceEnabled) clientPlugins.push(new VoicePlugin());
		const eventQueueOpts = {
			listenerTimeout: 12e4,
			...discordCfg.eventQueue
		};
		const client = new Client({
			baseUrl: "http://localhost",
			deploySecret: "a",
			clientId: applicationId,
			publicKey: "a",
			token,
			autoDeploy: false,
			eventQueue: eventQueueOpts
		}, {
			commands,
			listeners: [new DiscordStatusReadyListener()],
			components,
			modals
		}, clientPlugins);
		const earlyGatewayErrorGuard = attachEarlyGatewayErrorGuard(client);
		releaseEarlyGatewayErrorGuard = earlyGatewayErrorGuard.release;
		const lifecycleGateway = client.getPlugin("gateway");
		earlyGatewayEmitter = getDiscordGatewayEmitter(lifecycleGateway);
		onEarlyGatewayDebug = (msg) => {
			if (!isVerbose()) return;
			runtime.log?.(`discord startup [${account.accountId}] gateway-debug ${Math.max(0, Date.now() - startupStartedAt)}ms ${String(msg)}`);
		};
		earlyGatewayEmitter?.on("debug", onEarlyGatewayDebug);
		if (lifecycleGateway) {
			autoPresenceController = createDiscordAutoPresenceController({
				accountId: account.accountId,
				discordConfig: discordCfg,
				gateway: lifecycleGateway,
				log: (message) => runtime.log?.(message)
			});
			autoPresenceController.start();
		}
		logDiscordStartupPhase({
			runtime,
			accountId: account.accountId,
			phase: "deploy-commands:start",
			startAt: startupStartedAt,
			gateway: lifecycleGateway,
			details: `native=${nativeEnabled ? "on" : "off"} reconcile=on commandCount=${commands.length}`
		});
		await deployDiscordCommands({
			client,
			runtime,
			enabled: nativeEnabled,
			accountId: account.accountId,
			startupStartedAt
		});
		logDiscordStartupPhase({
			runtime,
			accountId: account.accountId,
			phase: "deploy-commands:done",
			startAt: startupStartedAt,
			gateway: lifecycleGateway
		});
		const logger = createSubsystemLogger("discord/monitor");
		const guildHistories = /* @__PURE__ */ new Map();
		let botUserId;
		let botUserName;
		let voiceManager = null;
		if (nativeDisabledExplicit) {
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "clear-native-commands:start",
				startAt: startupStartedAt,
				gateway: lifecycleGateway
			});
			await clearDiscordNativeCommands({
				client,
				applicationId,
				runtime
			});
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "clear-native-commands:done",
				startAt: startupStartedAt,
				gateway: lifecycleGateway
			});
		}
		logDiscordStartupPhase({
			runtime,
			accountId: account.accountId,
			phase: "fetch-bot-identity:start",
			startAt: startupStartedAt,
			gateway: lifecycleGateway
		});
		try {
			const botUser = await client.fetchUser("@me");
			botUserId = botUser?.id;
			botUserName = botUser?.username?.trim() || botUser?.globalName?.trim() || void 0;
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "fetch-bot-identity:done",
				startAt: startupStartedAt,
				gateway: lifecycleGateway,
				details: `botUserId=${botUserId ?? "<missing>"} botUserName=${botUserName ?? "<missing>"}`
			});
		} catch (err) {
			runtime.error?.(danger(`discord: failed to fetch bot identity: ${String(err)}`));
			logDiscordStartupPhase({
				runtime,
				accountId: account.accountId,
				phase: "fetch-bot-identity:error",
				startAt: startupStartedAt,
				gateway: lifecycleGateway,
				details: String(err)
			});
		}
		if (voiceEnabled) {
			const { DiscordVoiceManager, DiscordVoiceReadyListener } = await loadDiscordVoiceRuntime();
			voiceManager = new DiscordVoiceManager({
				client,
				cfg,
				discordConfig: discordCfg,
				accountId: account.accountId,
				runtime,
				botUserId
			});
			voiceManagerRef.current = voiceManager;
			registerDiscordListener(client.listeners, new DiscordVoiceReadyListener(voiceManager));
		}
		const messageHandler = discordProviderSessionRuntime.createDiscordMessageHandler({
			cfg,
			discordConfig: discordCfg,
			accountId: account.accountId,
			token,
			runtime,
			setStatus: opts.setStatus,
			abortSignal: opts.abortSignal,
			workerRunTimeoutMs: discordCfg.inboundWorker?.runTimeoutMs,
			botUserId,
			guildHistories,
			historyLimit,
			mediaMaxBytes,
			textLimit,
			replyToMode,
			dmEnabled,
			groupDmEnabled,
			groupDmChannels,
			allowFrom,
			guildEntries,
			threadBindings,
			discordRestFetch
		});
		deactivateMessageHandler = messageHandler.deactivate;
		const trackInboundEvent = opts.setStatus ? () => {
			const at = Date.now();
			opts.setStatus?.({
				lastEventAt: at,
				lastInboundAt: at
			});
		} : void 0;
		registerDiscordListener(client.listeners, new DiscordMessageListener(messageHandler, logger, trackInboundEvent, { timeoutMs: eventQueueOpts.listenerTimeout }));
		const reactionListenerOptions = {
			cfg,
			accountId: account.accountId,
			runtime,
			botUserId,
			dmEnabled,
			groupDmEnabled,
			groupDmChannels: groupDmChannels ?? [],
			dmPolicy,
			allowFrom: allowFrom ?? [],
			groupPolicy,
			allowNameMatching: isDangerousNameMatchingEnabled(discordCfg),
			guildEntries,
			logger,
			onEvent: trackInboundEvent
		};
		registerDiscordListener(client.listeners, new DiscordReactionListener(reactionListenerOptions));
		registerDiscordListener(client.listeners, new DiscordReactionRemoveListener(reactionListenerOptions));
		registerDiscordListener(client.listeners, new DiscordThreadUpdateListener(cfg, account.accountId, logger));
		if (discordCfg.intents?.presence) {
			registerDiscordListener(client.listeners, new DiscordPresenceListener({
				logger,
				accountId: account.accountId
			}));
			runtime.log?.("discord: GuildPresences intent enabled — presence listener registered");
		}
		const botIdentity = botUserId && botUserName ? `${botUserId} (${botUserName})` : botUserId ?? botUserName ?? "";
		runtime.log?.(formatDiscordStartupStatusMessage({
			gatewayReady: lifecycleGateway?.isConnected === true,
			botIdentity: botIdentity || void 0
		}));
		if (lifecycleGateway?.isConnected) opts.setStatus?.(createConnectedChannelStatusPatch());
		lifecycleStarted = true;
		earlyGatewayEmitter?.removeListener("debug", onEarlyGatewayDebug);
		onEarlyGatewayDebug = void 0;
		await runDiscordGatewayLifecycle({
			accountId: account.accountId,
			client,
			runtime,
			abortSignal: opts.abortSignal,
			statusSink: opts.setStatus,
			isDisallowedIntentsError: isDiscordDisallowedIntentsError,
			voiceManager,
			voiceManagerRef,
			execApprovalsHandler,
			threadBindings,
			pendingGatewayErrors: earlyGatewayErrorGuard.pendingErrors,
			releaseEarlyGatewayErrorGuard
		});
	} finally {
		deactivateMessageHandler?.();
		autoPresenceController?.stop();
		opts.setStatus?.({ connected: false });
		if (onEarlyGatewayDebug) earlyGatewayEmitter?.removeListener("debug", onEarlyGatewayDebug);
		releaseEarlyGatewayErrorGuard();
		if (!lifecycleStarted) threadBindings.stop();
	}
}
async function clearDiscordNativeCommands(params) {
	try {
		await params.client.rest.put(Routes.applicationCommands(params.applicationId), { body: [] });
		logVerbose("discord: cleared native commands (commands.native=false)");
	} catch (err) {
		params.runtime.error?.(danger(`discord: failed to clear native commands: ${String(err)}`));
	}
}
//#endregion
export { registerDiscordListener as a, createDiscordNativeCommand as i, createDiscordGatewayPlugin as n, resolveDiscordGatewayIntents as r, monitorDiscordProvider as t };
