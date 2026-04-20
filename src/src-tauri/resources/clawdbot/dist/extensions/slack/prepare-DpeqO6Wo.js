import { o as resolveSlackReplyToMode } from "./accounts-DJiceqJx.js";
import { a as normalizeSlackSlug, i as normalizeSlackAllowOwnerEntry, n as normalizeAllowList, o as resolveSlackAllowListMatch, r as normalizeAllowListLower, s as resolveSlackUserAllowed, t as allowListMatches } from "./allow-list-GR9Gx-es.js";
import { t as sendMessageSlack } from "./send-a7txocw9.js";
import { _ as resolveSlackThreadHistory, g as resolveSlackMedia, h as resolveSlackAttachmentContent, l as reactSlackMessage, v as resolveSlackThreadStarter } from "./actions-uj3tq0FI.js";
import { n as hasSlackThreadParticipation } from "./sent-thread-cache-Bq-r8qPc.js";
import { o as finalizeInboundContext } from "./send.runtime-D3zICEBW.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { createChannelPairingChallengeIssuer } from "openclaw/plugin-sdk/channel-pairing";
import { resolveAgentRoute, resolveThreadSessionKeys } from "openclaw/plugin-sdk/routing";
import { createDedupeCache, enqueueSystemEvent } from "openclaw/plugin-sdk/infra-runtime";
import { formatAllowlistMatchMeta } from "openclaw/plugin-sdk/allow-from";
import { buildPluginBindingResolvedText, parsePluginBindingApprovalCustomId, recordInboundSession, resolveConversationLabel as resolveConversationLabel$1, resolvePluginConversationBindingApproval, upsertChannelPairingRequest } from "openclaw/plugin-sdk/conversation-runtime";
import { isDangerousNameMatchingEnabled, loadConfig as loadConfig$1, readSessionUpdatedAt, resolveChannelContextVisibilityMode, resolveDefaultGroupPolicy, resolveOpenProviderRuntimeGroupPolicy, resolveSessionKey, resolveStorePath, updateLastRoute, warnMissingProviderGroupPolicyFallbackOnce } from "openclaw/plugin-sdk/config-runtime";
import { getChildLogger, logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { buildPendingHistoryContextFromMap, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { applyChannelMatchMeta, buildChannelKeyCandidates, resolveChannelEntryMatchWithFallback } from "openclaw/plugin-sdk/channel-targets";
import { evaluateGroupRouteAccessForPolicy } from "openclaw/plugin-sdk/group-access";
import { buildUntrustedChannelMetadata, filterSupplementalContextItems, readStoreAllowFromForDmPolicy, resolvePinnedMainDmOwnerFromAllowlist, shouldIncludeSupplementalContext } from "openclaw/plugin-sdk/security-runtime";
import { buildMentionRegexes, formatInboundEnvelope, implicitMentionKindWhen, logInboundDrop, matchesMentionWithExplicit, resolveEnvelopeFormatOptions, resolveInboundMentionDecision } from "openclaw/plugin-sdk/channel-inbound";
import { resolveAckReaction } from "openclaw/plugin-sdk/agent-runtime";
import { shouldAckReaction } from "openclaw/plugin-sdk/channel-feedback";
import { hasControlCommand, resolveControlCommandGate, shouldHandleTextCommands } from "openclaw/plugin-sdk/command-auth";
//#region extensions/slack/src/monitor/commands.ts
/**
* Strip Slack mentions (<@U123>, <@U123|name>) so command detection works on
* normalized text. Use in both prepare and debounce gate for consistency.
*/
function stripSlackMentionsForCommandDetection(text) {
	return (text ?? "").replace(/<@[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeSlackSlashCommandName(raw) {
	return raw.replace(/^\/+/, "");
}
function resolveSlackSlashCommandConfig(raw) {
	const name = normalizeSlackSlashCommandName(normalizeOptionalString(raw?.name) ?? "openclaw") || "openclaw";
	return {
		enabled: raw?.enabled === true,
		name,
		sessionPrefix: normalizeOptionalString(raw?.sessionPrefix) ?? "slack:slash",
		ephemeral: raw?.ephemeral !== false
	};
}
function buildSlackSlashCommandMatcher(name) {
	const escaped = normalizeSlackSlashCommandName(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return new RegExp(`^/?${escaped}$`);
}
//#endregion
//#region extensions/slack/src/monitor/channel-config.ts
function firstDefined(...values) {
	for (const value of values) if (typeof value !== "undefined") return value;
}
function resolveSlackChannelLabel(params) {
	const channelName = params.channelName?.trim();
	if (channelName) return `#${normalizeSlackSlug(channelName) || channelName}`;
	const channelId = params.channelId?.trim();
	return channelId ? `#${channelId}` : "unknown channel";
}
function resolveSlackChannelConfig(params) {
	const { channelId, channelName, channels, channelKeys, defaultRequireMention, allowNameMatching } = params;
	const entries = channels ?? {};
	const keys = channelKeys ?? Object.keys(entries);
	const normalizedName = channelName ? normalizeSlackSlug(channelName) : "";
	const directName = channelName ? channelName.trim() : "";
	const channelIdLower = normalizeLowercaseStringOrEmpty(channelId);
	const channelIdUpper = channelId.toUpperCase();
	const match = resolveChannelEntryMatchWithFallback({
		entries,
		keys: buildChannelKeyCandidates(channelId, channelIdLower !== channelId ? channelIdLower : void 0, channelIdUpper !== channelId ? channelIdUpper : void 0, allowNameMatching ? channelName ? `#${directName}` : void 0 : void 0, allowNameMatching ? directName : void 0, allowNameMatching ? normalizedName : void 0),
		wildcardKey: "*"
	});
	const { entry: matched, wildcardEntry: fallback } = match;
	const requireMentionDefault = defaultRequireMention ?? true;
	if (keys.length === 0) return {
		allowed: true,
		requireMention: requireMentionDefault
	};
	if (!matched && !fallback) return {
		allowed: false,
		requireMention: requireMentionDefault
	};
	const resolved = matched ?? fallback ?? {};
	return applyChannelMatchMeta({
		allowed: firstDefined(resolved.enabled, fallback?.enabled, true) ?? true,
		requireMention: firstDefined(resolved.requireMention, fallback?.requireMention, requireMentionDefault) ?? requireMentionDefault,
		allowBots: firstDefined(resolved.allowBots, fallback?.allowBots),
		users: firstDefined(resolved.users, fallback?.users),
		skills: firstDefined(resolved.skills, fallback?.skills),
		systemPrompt: firstDefined(resolved.systemPrompt, fallback?.systemPrompt)
	}, match);
}
//#endregion
//#region extensions/slack/src/monitor/channel-type.ts
function inferSlackChannelType(channelId) {
	const trimmed = channelId?.trim();
	if (!trimmed) return;
	if (trimmed.startsWith("D")) return "im";
	if (trimmed.startsWith("C")) return "channel";
	if (trimmed.startsWith("G")) return "group";
}
function normalizeSlackChannelType(channelType, channelId) {
	const normalized = normalizeOptionalLowercaseString(channelType);
	const inferred = inferSlackChannelType(channelId);
	if (normalized === "im" || normalized === "mpim" || normalized === "channel" || normalized === "group") {
		if (inferred === "im" && normalized !== "im") return "im";
		return normalized;
	}
	return inferred ?? "channel";
}
//#endregion
//#region extensions/slack/src/monitor/policy.ts
function isSlackChannelAllowedByPolicy(params) {
	return evaluateGroupRouteAccessForPolicy({
		groupPolicy: params.groupPolicy,
		routeAllowlistConfigured: params.channelAllowlistConfigured,
		routeMatched: params.channelAllowed
	}).allowed;
}
//#endregion
//#region extensions/slack/src/monitor/context.ts
function createSlackMonitorContext(params) {
	const channelHistories = /* @__PURE__ */ new Map();
	const logger = getChildLogger({ module: "slack-auto-reply" });
	const channelCache = /* @__PURE__ */ new Map();
	const userCache = /* @__PURE__ */ new Map();
	const seenMessages = createDedupeCache({
		ttlMs: 6e4,
		maxSize: 500
	});
	const allowFrom = normalizeAllowList(params.allowFrom);
	const groupDmChannels = normalizeAllowList(params.groupDmChannels);
	const groupDmChannelsLower = normalizeAllowListLower(groupDmChannels);
	const defaultRequireMention = params.defaultRequireMention ?? true;
	const hasChannelAllowlistConfig = Object.keys(params.channelsConfig ?? {}).length > 0;
	const channelsConfigKeys = Object.keys(params.channelsConfig ?? {});
	const markMessageSeen = (channelId, ts) => {
		if (!channelId || !ts) return false;
		return seenMessages.check(`${channelId}:${ts}`);
	};
	const releaseSeenMessage = (channelId, ts) => {
		if (!channelId || !ts) return;
		seenMessages.delete(`${channelId}:${ts}`);
	};
	const resolveSlackSystemEventSessionKey = (p) => {
		const channelId = normalizeOptionalString(p.channelId) ?? "";
		if (!channelId) return params.mainKey;
		const channelType = normalizeSlackChannelType(p.channelType, channelId);
		const isDirectMessage = channelType === "im";
		const isGroup = channelType === "mpim";
		const from = isDirectMessage ? `slack:${channelId}` : isGroup ? `slack:group:${channelId}` : `slack:channel:${channelId}`;
		const chatType = isDirectMessage ? "direct" : isGroup ? "group" : "channel";
		const senderId = normalizeOptionalString(p.senderId) ?? "";
		try {
			const peerKind = isDirectMessage ? "direct" : isGroup ? "group" : "channel";
			const peerId = isDirectMessage ? senderId : channelId;
			if (peerId) return resolveAgentRoute({
				cfg: params.cfg,
				channel: "slack",
				accountId: params.accountId,
				teamId: params.teamId,
				peer: {
					kind: peerKind,
					id: peerId
				}
			}).sessionKey;
		} catch {}
		return resolveSessionKey(params.sessionScope, {
			From: from,
			ChatType: chatType,
			Provider: "slack"
		}, params.mainKey);
	};
	const resolveChannelName = async (channelId) => {
		const cached = channelCache.get(channelId);
		if (cached) return cached;
		try {
			const info = await params.app.client.conversations.info({
				token: params.botToken,
				channel: channelId
			});
			const name = info.channel && "name" in info.channel ? info.channel.name : void 0;
			const channel = info.channel ?? void 0;
			const entry = {
				name,
				type: channel?.is_im ? "im" : channel?.is_mpim ? "mpim" : channel?.is_channel ? "channel" : channel?.is_group ? "group" : void 0,
				topic: channel && "topic" in channel ? channel.topic?.value ?? void 0 : void 0,
				purpose: channel && "purpose" in channel ? channel.purpose?.value ?? void 0 : void 0
			};
			channelCache.set(channelId, entry);
			return entry;
		} catch {
			return {};
		}
	};
	const resolveUserName = async (userId) => {
		const cached = userCache.get(userId);
		if (cached) return cached;
		try {
			const info = await params.app.client.users.info({
				token: params.botToken,
				user: userId
			});
			const profile = info.user?.profile;
			const entry = { name: profile?.display_name || profile?.real_name || info.user?.name || void 0 };
			userCache.set(userId, entry);
			return entry;
		} catch {
			return {};
		}
	};
	const setSlackThreadStatus = async (p) => {
		if (!p.threadTs) return;
		try {
			await params.app.client.assistant.threads.setStatus({
				token: params.botToken,
				channel_id: p.channelId,
				thread_ts: p.threadTs,
				status: p.status
			});
		} catch (err) {
			logVerbose(`slack status update failed for channel ${p.channelId}: ${String(err)}`);
		}
	};
	const isChannelAllowed = (p) => {
		const channelType = normalizeSlackChannelType(p.channelType, p.channelId);
		const isDirectMessage = channelType === "im";
		const isGroupDm = channelType === "mpim";
		const isRoom = channelType === "channel" || channelType === "group";
		if (isDirectMessage && !params.dmEnabled) return false;
		if (isGroupDm && !params.groupDmEnabled) return false;
		if (isGroupDm && groupDmChannels.length > 0) {
			const candidates = [
				p.channelId,
				p.channelName ? `#${p.channelName}` : void 0,
				p.channelName,
				p.channelName ? normalizeSlackSlug(p.channelName) : void 0
			].filter((value) => Boolean(value)).map((value) => normalizeLowercaseStringOrEmpty(value));
			if (!(groupDmChannelsLower.includes("*") || candidates.some((candidate) => groupDmChannelsLower.includes(candidate)))) return false;
		}
		if (isRoom && p.channelId) {
			const channelConfig = resolveSlackChannelConfig({
				channelId: p.channelId,
				channelName: p.channelName,
				channels: params.channelsConfig,
				channelKeys: channelsConfigKeys,
				defaultRequireMention,
				allowNameMatching: params.allowNameMatching
			});
			const channelMatchMeta = formatAllowlistMatchMeta(channelConfig);
			const channelAllowed = channelConfig?.allowed !== false;
			const channelAllowlistConfigured = hasChannelAllowlistConfig;
			if (!isSlackChannelAllowedByPolicy({
				groupPolicy: params.groupPolicy,
				channelAllowlistConfigured,
				channelAllowed
			})) {
				logVerbose(`slack: drop channel ${p.channelId} (groupPolicy=${params.groupPolicy}, ${channelMatchMeta})`);
				return false;
			}
			const hasExplicitConfig = Boolean(channelConfig?.matchSource);
			if (!channelAllowed && (params.groupPolicy !== "open" || hasExplicitConfig)) {
				logVerbose(`slack: drop channel ${p.channelId} (${channelMatchMeta})`);
				return false;
			}
			logVerbose(`slack: allow channel ${p.channelId} (${channelMatchMeta})`);
		}
		return true;
	};
	const shouldDropMismatchedSlackEvent = (body) => {
		if (!body || typeof body !== "object") return false;
		const raw = body;
		const incomingApiAppId = typeof raw.api_app_id === "string" ? raw.api_app_id : "";
		const incomingTeamId = typeof raw.team_id === "string" ? raw.team_id : typeof raw.team?.id === "string" ? raw.team.id : "";
		if (params.apiAppId && incomingApiAppId && incomingApiAppId !== params.apiAppId) {
			logVerbose(`slack: drop event with api_app_id=${incomingApiAppId} (expected ${params.apiAppId})`);
			return true;
		}
		if (params.teamId && incomingTeamId && incomingTeamId !== params.teamId) {
			logVerbose(`slack: drop event with team_id=${incomingTeamId} (expected ${params.teamId})`);
			return true;
		}
		return false;
	};
	return {
		cfg: params.cfg,
		accountId: params.accountId,
		botToken: params.botToken,
		app: params.app,
		runtime: params.runtime,
		botUserId: params.botUserId,
		teamId: params.teamId,
		apiAppId: params.apiAppId,
		historyLimit: params.historyLimit,
		channelHistories,
		sessionScope: params.sessionScope,
		mainKey: params.mainKey,
		dmEnabled: params.dmEnabled,
		dmPolicy: params.dmPolicy,
		allowFrom,
		allowNameMatching: params.allowNameMatching,
		groupDmEnabled: params.groupDmEnabled,
		groupDmChannels,
		defaultRequireMention,
		channelsConfig: params.channelsConfig,
		channelsConfigKeys,
		groupPolicy: params.groupPolicy,
		useAccessGroups: params.useAccessGroups,
		reactionMode: params.reactionMode,
		reactionAllowlist: params.reactionAllowlist,
		replyToMode: params.replyToMode,
		threadHistoryScope: params.threadHistoryScope,
		threadInheritParent: params.threadInheritParent,
		threadRequireExplicitMention: params.threadRequireExplicitMention,
		slashCommand: params.slashCommand,
		textLimit: params.textLimit,
		ackReactionScope: params.ackReactionScope,
		typingReaction: params.typingReaction,
		mediaMaxBytes: params.mediaMaxBytes,
		removeAckAfterReply: params.removeAckAfterReply,
		logger,
		markMessageSeen,
		releaseSeenMessage,
		shouldDropMismatchedSlackEvent,
		resolveSlackSystemEventSessionKey,
		isChannelAllowed,
		resolveChannelName,
		resolveUserName,
		setSlackThreadStatus
	};
}
//#endregion
//#region extensions/slack/src/monitor/auth.ts
let slackAllowFromCache = /* @__PURE__ */ new WeakMap();
const DEFAULT_PAIRING_ALLOW_FROM_CACHE_TTL_MS = 5e3;
function getPairingAllowFromCacheTtlMs() {
	const raw = process.env.OPENCLAW_SLACK_PAIRING_ALLOWFROM_CACHE_TTL_MS?.trim();
	if (!raw) return DEFAULT_PAIRING_ALLOW_FROM_CACHE_TTL_MS;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return DEFAULT_PAIRING_ALLOW_FROM_CACHE_TTL_MS;
	return Math.max(0, Math.floor(parsed));
}
function getAllowFromCacheState(ctx) {
	const existing = slackAllowFromCache.get(ctx);
	if (existing) return existing;
	const next = {};
	slackAllowFromCache.set(ctx, next);
	return next;
}
function buildBaseAllowFrom(ctx) {
	const allowFrom = normalizeAllowList(ctx.allowFrom);
	return {
		allowFrom,
		allowFromLower: normalizeAllowListLower(allowFrom)
	};
}
async function resolveSlackEffectiveAllowFrom(ctx, options) {
	const includePairingStore = options?.includePairingStore === true;
	const cache = getAllowFromCacheState(ctx);
	const baseSignature = JSON.stringify(ctx.allowFrom);
	if (cache.baseSignature !== baseSignature || !cache.base) {
		cache.baseSignature = baseSignature;
		cache.base = buildBaseAllowFrom(ctx);
		cache.pairing = void 0;
		cache.pairingKey = void 0;
		cache.pairingExpiresAtMs = void 0;
		cache.pairingPending = void 0;
	}
	if (!includePairingStore) return cache.base;
	const ttlMs = getPairingAllowFromCacheTtlMs();
	const nowMs = Date.now();
	const pairingKey = `${ctx.accountId}:${ctx.dmPolicy}`;
	if (ttlMs > 0 && cache.pairing && cache.pairingKey === pairingKey && (cache.pairingExpiresAtMs ?? 0) >= nowMs) return cache.pairing;
	if (cache.pairingPending && cache.pairingKey === pairingKey) return await cache.pairingPending;
	const pairingPending = (async () => {
		let storeAllowFrom = [];
		try {
			const resolved = await readStoreAllowFromForDmPolicy({
				provider: "slack",
				accountId: ctx.accountId,
				dmPolicy: ctx.dmPolicy
			});
			storeAllowFrom = Array.isArray(resolved) ? resolved : [];
		} catch {
			storeAllowFrom = [];
		}
		const allowFrom = normalizeAllowList([...cache.base?.allowFrom ?? [], ...storeAllowFrom]);
		return {
			allowFrom,
			allowFromLower: normalizeAllowListLower(allowFrom)
		};
	})();
	cache.pairingKey = pairingKey;
	cache.pairingPending = pairingPending;
	try {
		const resolved = await pairingPending;
		if (ttlMs > 0) {
			cache.pairing = resolved;
			cache.pairingExpiresAtMs = nowMs + ttlMs;
		} else {
			cache.pairing = void 0;
			cache.pairingExpiresAtMs = void 0;
		}
		return resolved;
	} finally {
		if (cache.pairingPending === pairingPending) cache.pairingPending = void 0;
	}
}
function isSlackSenderAllowListed(params) {
	const { allowListLower, senderId, senderName, allowNameMatching } = params;
	return allowListLower.length === 0 || allowListMatches({
		allowList: allowListLower,
		id: senderId,
		name: senderName,
		allowNameMatching
	});
}
async function authorizeSlackSystemEventSender(params) {
	const senderId = params.senderId?.trim();
	if (!senderId) return {
		allowed: false,
		reason: "missing-sender"
	};
	const expectedSenderId = params.expectedSenderId?.trim();
	if (expectedSenderId && expectedSenderId !== senderId) return {
		allowed: false,
		reason: "sender-mismatch"
	};
	if (params.interactiveEvent && !expectedSenderId) return {
		allowed: false,
		reason: "missing-expected-sender"
	};
	const channelId = params.channelId?.trim();
	let channelType = normalizeSlackChannelType(params.channelType, channelId);
	let channelName;
	if (channelId) {
		const info = await params.ctx.resolveChannelName(channelId).catch(() => ({}));
		channelName = info.name;
		const resolvedTypeSource = params.channelType ?? info.type;
		channelType = normalizeSlackChannelType(resolvedTypeSource, channelId);
		if (!params.ctx.isChannelAllowed({
			channelId,
			channelName,
			channelType
		})) return {
			allowed: false,
			reason: "channel-not-allowed",
			channelType,
			channelName
		};
		if (params.interactiveEvent) {
			const inferredFromId = inferSlackChannelType(channelId);
			const sourceNormalized = typeof resolvedTypeSource === "string" ? resolvedTypeSource.toLowerCase().trim() : void 0;
			if (inferredFromId === void 0 && !(sourceNormalized === "im" || sourceNormalized === "mpim" || sourceNormalized === "channel" || sourceNormalized === "group")) return {
				allowed: false,
				reason: "ambiguous-channel-type",
				channelType,
				channelName
			};
		}
	}
	const senderName = (await params.ctx.resolveUserName(senderId).catch(() => ({}))).name;
	const resolveAllowFromLower = async (includePairingStore = false) => (await resolveSlackEffectiveAllowFrom(params.ctx, { includePairingStore })).allowFromLower;
	if (channelType === "im") {
		if (!params.ctx.dmEnabled || params.ctx.dmPolicy === "disabled") return {
			allowed: false,
			reason: "dm-disabled",
			channelType,
			channelName
		};
		if (params.ctx.dmPolicy !== "open") {
			if (!isSlackSenderAllowListed({
				allowListLower: await resolveAllowFromLower(true),
				senderId,
				senderName,
				allowNameMatching: params.ctx.allowNameMatching
			})) return {
				allowed: false,
				reason: "sender-not-allowlisted",
				channelType,
				channelName
			};
		}
	} else if (!channelId) {
		const allowFromLower = await resolveAllowFromLower(false);
		if (allowFromLower.length > 0) {
			if (!isSlackSenderAllowListed({
				allowListLower: allowFromLower,
				senderId,
				senderName,
				allowNameMatching: params.ctx.allowNameMatching
			})) return {
				allowed: false,
				reason: "sender-not-allowlisted"
			};
		}
	} else {
		const allowFromLower = await resolveAllowFromLower(false);
		const ownerAllowlistConfigured = allowFromLower.length > 0;
		const allowFromLowerWithoutWildcard = allowFromLower.filter((entry) => entry !== "*");
		const channelConfig = resolveSlackChannelConfig({
			channelId,
			channelName,
			channels: params.ctx.channelsConfig,
			channelKeys: params.ctx.channelsConfigKeys,
			defaultRequireMention: params.ctx.defaultRequireMention,
			allowNameMatching: params.ctx.allowNameMatching
		});
		const channelUsersAllowlistConfigured = Array.isArray(channelConfig?.users) && channelConfig.users.length > 0;
		const ownerAllowed = (ownerAllowlistConfigured ? resolveSlackAllowListMatch({
			allowList: allowFromLower,
			id: senderId,
			name: senderName,
			allowNameMatching: params.ctx.allowNameMatching
		}) : { allowed: false }).allowed;
		const ownerExplicitlyAllowed = allowFromLowerWithoutWildcard.length > 0 && resolveSlackAllowListMatch({
			allowList: allowFromLowerWithoutWildcard,
			id: senderId,
			name: senderName,
			allowNameMatching: params.ctx.allowNameMatching
		}).allowed;
		if (channelUsersAllowlistConfigured) {
			if (resolveSlackUserAllowed({
				allowList: channelConfig?.users,
				userId: senderId,
				userName: senderName,
				allowNameMatching: params.ctx.allowNameMatching
			}) || params.interactiveEvent && ownerExplicitlyAllowed) return {
				allowed: true,
				channelType,
				channelName
			};
			return {
				allowed: false,
				reason: params.interactiveEvent && ownerAllowlistConfigured ? "sender-not-authorized" : "sender-not-channel-allowed",
				channelType,
				channelName
			};
		}
		if (params.interactiveEvent && ownerAllowed) return {
			allowed: true,
			channelType,
			channelName
		};
		if (params.interactiveEvent && ownerAllowlistConfigured) return {
			allowed: false,
			reason: "sender-not-allowlisted",
			channelType,
			channelName
		};
	}
	return {
		allowed: true,
		channelType,
		channelName
	};
}
//#endregion
//#region extensions/slack/src/threading.ts
function resolveSlackThreadContext(params) {
	const incomingThreadTs = params.message.thread_ts;
	const eventTs = params.message.event_ts;
	const messageTs = params.message.ts ?? eventTs;
	const isThreadReply = typeof incomingThreadTs === "string" && incomingThreadTs.length > 0 && (incomingThreadTs !== messageTs || Boolean(params.message.parent_user_id));
	return {
		incomingThreadTs,
		messageTs,
		isThreadReply,
		replyToId: incomingThreadTs ?? messageTs,
		messageThreadId: isThreadReply ? incomingThreadTs : params.replyToMode === "all" ? messageTs : void 0
	};
}
/**
* Resolves Slack thread targeting for replies and status indicators.
*
* @returns replyThreadTs - Thread timestamp for reply messages
* @returns statusThreadTs - Thread timestamp for status indicators (typing, etc.)
* @returns isThreadReply - true if this is a genuine user reply in a thread,
*                          false if thread_ts comes from a bot status message (e.g. typing indicator)
*/
function resolveSlackThreadTargets(params) {
	const { incomingThreadTs, messageTs, isThreadReply } = resolveSlackThreadContext(params);
	const replyThreadTs = isThreadReply ? incomingThreadTs : params.replyToMode === "all" ? messageTs : void 0;
	return {
		replyThreadTs,
		statusThreadTs: replyThreadTs,
		isThreadReply
	};
}
//#endregion
//#region extensions/slack/src/monitor/dm-auth.ts
async function authorizeSlackDirectMessage(params) {
	if (!params.ctx.dmEnabled || params.ctx.dmPolicy === "disabled") {
		await params.onDisabled();
		return false;
	}
	if (params.ctx.dmPolicy === "open") return true;
	const senderName = (await params.resolveSenderName(params.senderId))?.name ?? void 0;
	const allowMatch = resolveSlackAllowListMatch({
		allowList: params.allowFromLower,
		id: params.senderId,
		name: senderName,
		allowNameMatching: params.ctx.allowNameMatching
	});
	const allowMatchMeta = formatAllowlistMatchMeta(allowMatch);
	if (allowMatch.allowed) return true;
	if (params.ctx.dmPolicy === "pairing") {
		await createChannelPairingChallengeIssuer({
			channel: "slack",
			upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
				channel: "slack",
				id,
				accountId: params.accountId,
				meta
			})
		})({
			senderId: params.senderId,
			senderIdLine: `Your Slack user id: ${params.senderId}`,
			meta: { name: senderName },
			sendPairingReply: params.sendPairingReply,
			onCreated: () => {
				params.log(`slack pairing request sender=${params.senderId} name=${senderName ?? "unknown"} (${allowMatchMeta})`);
			},
			onReplyError: (err) => {
				params.log(`slack pairing reply failed for ${params.senderId}: ${String(err)}`);
			}
		});
		return false;
	}
	await params.onUnauthorized({
		allowMatchMeta,
		senderName
	});
	return false;
}
//#endregion
//#region extensions/slack/src/monitor/room-context.ts
function resolveSlackRoomContextHints(params) {
	const untrustedChannelMetadata = params.isRoomish ? buildUntrustedChannelMetadata({
		source: "slack",
		label: "Slack channel description",
		entries: [params.channelInfo?.topic, params.channelInfo?.purpose]
	}) : void 0;
	const systemPromptParts = [params.isRoomish ? normalizeOptionalString(params.channelConfig?.systemPrompt) ?? null : null].filter((entry) => Boolean(entry));
	return {
		untrustedChannelMetadata,
		groupSystemPrompt: systemPromptParts.length > 0 ? systemPromptParts.join("\n\n") : void 0
	};
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/prepare-content.ts
function filterInheritedParentFiles(params) {
	const { files, isThreadReply, threadStarter } = params;
	if (!isThreadReply || !files?.length) return files;
	if (!threadStarter?.files?.length) return files;
	const starterFileIds = new Set(threadStarter.files.map((file) => file.id));
	const filtered = files.filter((file) => !file.id || !starterFileIds.has(file.id));
	if (filtered.length < files.length) logVerbose(`slack: filtered ${files.length - filtered.length} inherited parent file(s) from thread reply`);
	return filtered.length > 0 ? filtered : void 0;
}
async function resolveSlackMessageContent(params) {
	const ownFiles = filterInheritedParentFiles({
		files: params.message.files,
		isThreadReply: params.isThreadReply,
		threadStarter: params.threadStarter
	});
	const media = await resolveSlackMedia({
		files: ownFiles,
		token: params.botToken,
		maxBytes: params.mediaMaxBytes
	});
	const attachmentContent = await resolveSlackAttachmentContent({
		attachments: params.message.attachments,
		token: params.botToken,
		maxBytes: params.mediaMaxBytes
	});
	const mergedMedia = [...media ?? [], ...attachmentContent?.media ?? []];
	const effectiveDirectMedia = mergedMedia.length > 0 ? mergedMedia : null;
	const mediaPlaceholder = effectiveDirectMedia ? effectiveDirectMedia.map((item) => item.placeholder).join(" ") : void 0;
	const fallbackFiles = ownFiles ?? [];
	const fileOnlyFallback = !mediaPlaceholder && fallbackFiles.length > 0 ? fallbackFiles.slice(0, 8).map((file) => normalizeOptionalString(file.name) ?? "file").join(", ") : void 0;
	const fileOnlyPlaceholder = fileOnlyFallback ? `[Slack file: ${fileOnlyFallback}]` : void 0;
	const botAttachmentText = params.isBotMessage && !attachmentContent?.text ? (params.message.attachments ?? []).map((attachment) => normalizeOptionalString(attachment.text) ?? normalizeOptionalString(attachment.fallback)).filter(Boolean).join("\n") : void 0;
	const rawBody = [
		normalizeOptionalString(params.message.text),
		attachmentContent?.text,
		botAttachmentText,
		mediaPlaceholder,
		fileOnlyPlaceholder
	].filter(Boolean).join("\n") || "";
	if (!rawBody) return null;
	return {
		rawBody,
		effectiveDirectMedia
	};
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/prepare-thread-context.ts
function isSlackThreadContextSenderAllowed(params) {
	if (params.allowFromLower.length === 0 || params.botId) return true;
	if (!params.userId) return false;
	return resolveSlackAllowListMatch({
		allowList: params.allowFromLower,
		id: params.userId,
		name: params.userName,
		allowNameMatching: params.allowNameMatching
	}).allowed;
}
async function resolveSlackThreadContextData(params) {
	let threadStarterBody;
	let threadHistoryBody;
	let threadSessionPreviousTimestamp;
	let threadLabel;
	let threadStarterMedia = null;
	if (!params.isThreadReply || !params.threadTs) return {
		threadStarterBody,
		threadHistoryBody,
		threadSessionPreviousTimestamp,
		threadLabel,
		threadStarterMedia
	};
	const starter = params.threadStarter;
	const starterSenderName = params.allowNameMatching && starter?.userId ? (await params.ctx.resolveUserName(starter.userId))?.name : void 0;
	const starterAllowed = !starter || isSlackThreadContextSenderAllowed({
		allowFromLower: params.allowFromLower,
		allowNameMatching: params.allowNameMatching,
		userId: starter.userId,
		userName: starterSenderName,
		botId: starter.botId
	});
	const includeStarterContext = !starter || shouldIncludeSupplementalContext({
		mode: params.contextVisibilityMode,
		kind: "thread",
		senderAllowed: starterAllowed
	});
	if (starter?.text && includeStarterContext) {
		threadStarterBody = starter.text;
		const snippet = starter.text.replace(/\s+/g, " ").slice(0, 80);
		threadLabel = `Slack thread ${params.roomLabel}${snippet ? `: ${snippet}` : ""}`;
		if (!params.effectiveDirectMedia && starter.files && starter.files.length > 0) {
			threadStarterMedia = await resolveSlackMedia({
				files: starter.files,
				token: params.ctx.botToken,
				maxBytes: params.ctx.mediaMaxBytes
			});
			if (threadStarterMedia) logVerbose(`slack: hydrated thread starter file ${threadStarterMedia.map((item) => item.placeholder).join(", ")} from root message`);
		}
	} else threadLabel = `Slack thread ${params.roomLabel}`;
	if (starter?.text && !includeStarterContext) logVerbose(`slack: omitted thread starter from context (mode=${params.contextVisibilityMode}, sender_allowed=${starterAllowed ? "yes" : "no"})`);
	const threadInitialHistoryLimit = params.account.config?.thread?.initialHistoryLimit ?? 20;
	threadSessionPreviousTimestamp = readSessionUpdatedAt({
		storePath: params.storePath,
		sessionKey: params.sessionKey
	});
	if (threadInitialHistoryLimit > 0 && !threadSessionPreviousTimestamp) {
		const threadHistory = await resolveSlackThreadHistory({
			channelId: params.message.channel,
			threadTs: params.threadTs,
			client: params.ctx.app.client,
			currentMessageTs: params.message.ts,
			limit: threadInitialHistoryLimit
		});
		if (threadHistory.length > 0) {
			const uniqueUserIds = [...new Set(threadHistory.map((item) => item.userId).filter((id) => Boolean(id)))];
			const userMap = /* @__PURE__ */ new Map();
			await Promise.all(uniqueUserIds.map(async (id) => {
				const user = await params.ctx.resolveUserName(id);
				if (user) userMap.set(id, user);
			}));
			const { items: filteredThreadHistory, omitted: omittedHistoryCount } = filterSupplementalContextItems({
				items: threadHistory,
				mode: params.contextVisibilityMode,
				kind: "thread",
				isSenderAllowed: (historyMsg) => {
					const msgUser = historyMsg.userId ? userMap.get(historyMsg.userId) : null;
					return isSlackThreadContextSenderAllowed({
						allowFromLower: params.allowFromLower,
						allowNameMatching: params.allowNameMatching,
						userId: historyMsg.userId,
						userName: msgUser?.name,
						botId: historyMsg.botId
					});
				}
			});
			if (omittedHistoryCount > 0) logVerbose(`slack: omitted ${omittedHistoryCount} thread message(s) from context (mode=${params.contextVisibilityMode})`);
			const historyParts = [];
			for (const historyMsg of filteredThreadHistory) {
				const msgSenderName = (historyMsg.userId ? userMap.get(historyMsg.userId) : null)?.name ?? (historyMsg.botId ? `Bot (${historyMsg.botId})` : "Unknown");
				const role = Boolean(historyMsg.botId) ? "assistant" : "user";
				const msgWithId = `${historyMsg.text}\n[slack message id: ${historyMsg.ts ?? "unknown"} channel: ${params.message.channel}]`;
				historyParts.push(formatInboundEnvelope({
					channel: "Slack",
					from: `${msgSenderName} (${role})`,
					timestamp: historyMsg.ts ? Math.round(Number(historyMsg.ts) * 1e3) : void 0,
					body: msgWithId,
					chatType: "channel",
					envelope: params.envelopeOptions
				}));
			}
			if (historyParts.length > 0) {
				threadHistoryBody = historyParts.join("\n\n");
				logVerbose(`slack: populated thread history with ${filteredThreadHistory.length} messages for new session`);
			}
		}
	}
	return {
		threadStarterBody,
		threadHistoryBody,
		threadSessionPreviousTimestamp,
		threadLabel,
		threadStarterMedia
	};
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/prepare.ts
const mentionRegexCache = /* @__PURE__ */ new WeakMap();
function resolveCachedMentionRegexes(ctx, agentId) {
	const key = normalizeOptionalString(agentId) ?? "__default__";
	let byAgent = mentionRegexCache.get(ctx);
	if (!byAgent) {
		byAgent = /* @__PURE__ */ new Map();
		mentionRegexCache.set(ctx, byAgent);
	}
	const cached = byAgent.get(key);
	if (cached) return cached;
	const built = buildMentionRegexes(ctx.cfg, agentId);
	byAgent.set(key, built);
	return built;
}
async function resolveSlackConversationContext(params) {
	const { ctx, account, message } = params;
	const cfg = ctx.cfg;
	let channelInfo = {};
	let resolvedChannelType = normalizeSlackChannelType(message.channel_type, message.channel);
	if (resolvedChannelType !== "im" && (!message.channel_type || message.channel_type !== "im")) {
		channelInfo = await ctx.resolveChannelName(message.channel);
		resolvedChannelType = normalizeSlackChannelType(message.channel_type ?? channelInfo.type, message.channel);
	}
	const channelName = channelInfo?.name;
	const isDirectMessage = resolvedChannelType === "im";
	const isGroupDm = resolvedChannelType === "mpim";
	const isRoom = resolvedChannelType === "channel" || resolvedChannelType === "group";
	const isRoomish = isRoom || isGroupDm;
	const channelConfig = isRoom ? resolveSlackChannelConfig({
		channelId: message.channel,
		channelName,
		channels: ctx.channelsConfig,
		channelKeys: ctx.channelsConfigKeys,
		defaultRequireMention: ctx.defaultRequireMention,
		allowNameMatching: ctx.allowNameMatching
	}) : null;
	const allowBots = channelConfig?.allowBots ?? account.config?.allowBots ?? cfg.channels?.slack?.allowBots ?? false;
	return {
		channelInfo,
		channelName,
		resolvedChannelType,
		isDirectMessage,
		isGroupDm,
		isRoom,
		isRoomish,
		channelConfig,
		allowBots,
		isBotMessage: Boolean(message.bot_id)
	};
}
async function authorizeSlackInboundMessage(params) {
	const { ctx, account, message, conversation } = params;
	const { isDirectMessage, channelName, resolvedChannelType, isBotMessage, allowBots } = conversation;
	if (isBotMessage) {
		if (message.user && ctx.botUserId && message.user === ctx.botUserId) return null;
		if (!allowBots) {
			logVerbose(`slack: drop bot message ${message.bot_id ?? "unknown"} (allowBots=false)`);
			return null;
		}
	}
	if (isDirectMessage && !message.user) {
		logVerbose("slack: drop dm message (missing user id)");
		return null;
	}
	const senderId = message.user ?? (isBotMessage ? message.bot_id : void 0);
	if (!senderId) {
		logVerbose("slack: drop message (missing sender id)");
		return null;
	}
	if (!ctx.isChannelAllowed({
		channelId: message.channel,
		channelName,
		channelType: resolvedChannelType
	})) {
		logVerbose("slack: drop message (channel not allowed)");
		return null;
	}
	const { allowFromLower } = await resolveSlackEffectiveAllowFrom(ctx, { includePairingStore: isDirectMessage });
	if (isDirectMessage) {
		const directUserId = message.user;
		if (!directUserId) {
			logVerbose("slack: drop dm message (missing user id)");
			return null;
		}
		if (!await authorizeSlackDirectMessage({
			ctx,
			accountId: account.accountId,
			senderId: directUserId,
			allowFromLower,
			resolveSenderName: ctx.resolveUserName,
			sendPairingReply: async (text) => {
				await sendMessageSlack(message.channel, text, {
					token: ctx.botToken,
					client: ctx.app.client,
					accountId: account.accountId
				});
			},
			onDisabled: () => {
				logVerbose("slack: drop dm (dms disabled)");
			},
			onUnauthorized: ({ allowMatchMeta }) => {
				logVerbose(`Blocked unauthorized slack sender ${message.user} (dmPolicy=${ctx.dmPolicy}, ${allowMatchMeta})`);
			},
			log: logVerbose
		})) return null;
	}
	return {
		senderId,
		allowFromLower
	};
}
function resolveSlackRoutingContext(params) {
	const { ctx, account, message, isDirectMessage, isGroupDm, isRoom, isRoomish } = params;
	const route = resolveAgentRoute({
		cfg: ctx.cfg,
		channel: "slack",
		accountId: account.accountId,
		teamId: ctx.teamId || void 0,
		peer: {
			kind: isDirectMessage ? "direct" : isRoom ? "channel" : "group",
			id: isDirectMessage ? message.user ?? "unknown" : message.channel
		}
	});
	const chatType = isDirectMessage ? "direct" : isGroupDm ? "group" : "channel";
	const replyToMode = resolveSlackReplyToMode(account, chatType);
	const threadContext = resolveSlackThreadContext({
		message,
		replyToMode
	});
	const threadTs = threadContext.incomingThreadTs;
	const isThreadReply = threadContext.isThreadReply;
	const autoThreadId = !isThreadReply && replyToMode === "all" && threadContext.messageTs ? threadContext.messageTs : void 0;
	const canonicalThreadId = isRoomish ? isThreadReply && threadTs ? threadTs : void 0 : isThreadReply ? threadTs : autoThreadId;
	const threadKeys = resolveThreadSessionKeys({
		baseSessionKey: route.sessionKey,
		threadId: canonicalThreadId,
		parentSessionKey: canonicalThreadId && ctx.threadInheritParent ? route.sessionKey : void 0
	});
	const sessionKey = threadKeys.sessionKey;
	return {
		route,
		chatType,
		replyToMode,
		threadContext,
		threadTs,
		isThreadReply,
		threadKeys,
		sessionKey,
		historyKey: isThreadReply && ctx.threadHistoryScope === "thread" ? sessionKey : message.channel
	};
}
async function prepareSlackMessage(params) {
	const { ctx, account, message, opts } = params;
	const cfg = ctx.cfg;
	const conversation = await resolveSlackConversationContext({
		ctx,
		account,
		message
	});
	const { channelInfo, channelName, isDirectMessage, isGroupDm, isRoom, isRoomish, channelConfig, isBotMessage } = conversation;
	const authorization = await authorizeSlackInboundMessage({
		ctx,
		account,
		message,
		conversation
	});
	if (!authorization) return null;
	const { senderId, allowFromLower } = authorization;
	const { route, replyToMode, threadContext, threadTs, isThreadReply, threadKeys, sessionKey, historyKey } = resolveSlackRoutingContext({
		ctx,
		account,
		message,
		isDirectMessage,
		isGroupDm,
		isRoom,
		isRoomish
	});
	const mentionRegexes = resolveCachedMentionRegexes(ctx, route.agentId);
	const hasAnyMention = /<@[^>]+>/.test(message.text ?? "");
	const explicitlyMentioned = Boolean(ctx.botUserId && message.text?.includes(`<@${ctx.botUserId}>`));
	const wasMentioned = opts.wasMentioned ?? (!isDirectMessage && matchesMentionWithExplicit({
		text: message.text ?? "",
		mentionRegexes,
		explicit: {
			hasAnyMention,
			isExplicitlyMentioned: explicitlyMentioned,
			canResolveExplicit: Boolean(ctx.botUserId)
		}
	}));
	const implicitMentionKinds = isDirectMessage || !ctx.botUserId || !message.thread_ts ? [] : [...implicitMentionKindWhen("reply_to_bot", message.parent_user_id === ctx.botUserId), ...implicitMentionKindWhen("bot_thread_participant", hasSlackThreadParticipation(account.accountId, message.channel, message.thread_ts))];
	let resolvedSenderName = normalizeOptionalString(message.username);
	const resolveSenderName = async () => {
		if (resolvedSenderName) return resolvedSenderName;
		if (message.user) {
			const normalized = normalizeOptionalString((await ctx.resolveUserName(message.user))?.name);
			if (normalized) {
				resolvedSenderName = normalized;
				return resolvedSenderName;
			}
		}
		resolvedSenderName = message.user ?? message.bot_id ?? "unknown";
		return resolvedSenderName;
	};
	const senderNameForAuth = ctx.allowNameMatching ? await resolveSenderName() : void 0;
	const channelUserAuthorized = isRoom ? resolveSlackUserAllowed({
		allowList: channelConfig?.users,
		userId: senderId,
		userName: senderNameForAuth,
		allowNameMatching: ctx.allowNameMatching
	}) : true;
	if (isRoom && !channelUserAuthorized) {
		logVerbose(`Blocked unauthorized slack sender ${senderId} (not in channel users)`);
		return null;
	}
	const allowTextCommands = shouldHandleTextCommands({
		cfg,
		surface: "slack"
	});
	const textForCommandDetection = stripSlackMentionsForCommandDetection(message.text ?? "");
	const hasControlCommandInMessage = hasControlCommand(textForCommandDetection, cfg);
	const ownerAuthorized = resolveSlackAllowListMatch({
		allowList: allowFromLower,
		id: senderId,
		name: senderNameForAuth,
		allowNameMatching: ctx.allowNameMatching
	}).allowed;
	const channelUsersAllowlistConfigured = isRoom && Array.isArray(channelConfig?.users) && channelConfig.users.length > 0;
	const threadContextAllowFromLower = isRoom ? channelUsersAllowlistConfigured ? normalizeAllowListLower(channelConfig?.users) : [] : isDirectMessage ? ctx.dmPolicy === "open" ? [] : allowFromLower : [];
	const contextVisibilityMode = resolveChannelContextVisibilityMode({
		cfg: ctx.cfg,
		channel: "slack",
		accountId: account.accountId
	});
	const channelCommandAuthorized = isRoom && channelUsersAllowlistConfigured ? resolveSlackUserAllowed({
		allowList: channelConfig?.users,
		userId: senderId,
		userName: senderNameForAuth,
		allowNameMatching: ctx.allowNameMatching
	}) : false;
	const commandGate = resolveControlCommandGate({
		useAccessGroups: ctx.useAccessGroups,
		authorizers: [{
			configured: allowFromLower.length > 0,
			allowed: ownerAuthorized
		}, {
			configured: channelUsersAllowlistConfigured,
			allowed: channelCommandAuthorized
		}],
		allowTextCommands,
		hasControlCommand: hasControlCommandInMessage
	});
	const commandAuthorized = commandGate.commandAuthorized;
	if (isRoomish && commandGate.shouldBlock) {
		logInboundDrop({
			log: logVerbose,
			channel: "slack",
			reason: "control command (unauthorized)",
			target: senderId
		});
		return null;
	}
	const shouldRequireMention = isRoom ? channelConfig?.requireMention ?? ctx.defaultRequireMention : false;
	const canDetectMention = Boolean(ctx.botUserId) || mentionRegexes.length > 0;
	const mentionDecision = resolveInboundMentionDecision({
		facts: {
			canDetectMention,
			wasMentioned,
			hasAnyMention,
			implicitMentionKinds
		},
		policy: {
			isGroup: isRoom,
			requireMention: shouldRequireMention,
			allowedImplicitMentionKinds: ctx.threadRequireExplicitMention ? [] : void 0,
			allowTextCommands,
			hasControlCommand: hasControlCommandInMessage,
			commandAuthorized
		}
	});
	const effectiveWasMentioned = mentionDecision.effectiveWasMentioned;
	if (isRoom && shouldRequireMention && mentionDecision.shouldSkip) {
		ctx.logger.info({
			channel: message.channel,
			reason: "no-mention"
		}, "skipping channel message");
		const pendingText = (message.text ?? "").trim();
		const fallbackFile = message.files?.[0]?.name ? `[Slack file: ${message.files[0].name}]` : message.files?.length ? "[Slack file]" : "";
		const pendingBody = pendingText || fallbackFile;
		recordPendingHistoryEntryIfEnabled({
			historyMap: ctx.channelHistories,
			historyKey,
			limit: ctx.historyLimit,
			entry: pendingBody ? {
				sender: await resolveSenderName(),
				body: pendingBody,
				timestamp: message.ts ? Math.round(Number(message.ts) * 1e3) : void 0,
				messageId: message.ts
			} : null
		});
		return null;
	}
	const threadStarter = isThreadReply && threadTs ? await resolveSlackThreadStarter({
		channelId: message.channel,
		threadTs,
		client: ctx.app.client
	}) : null;
	const resolvedMessageContent = await resolveSlackMessageContent({
		message,
		isThreadReply,
		threadStarter,
		isBotMessage,
		botToken: ctx.botToken,
		mediaMaxBytes: ctx.mediaMaxBytes
	});
	if (!resolvedMessageContent) return null;
	const { rawBody, effectiveDirectMedia } = resolvedMessageContent;
	const ackReaction = resolveAckReaction(cfg, route.agentId, {
		channel: "slack",
		accountId: account.accountId
	});
	const ackReactionValue = ackReaction ?? "";
	const shouldAckReaction$1 = () => Boolean(ackReaction && shouldAckReaction({
		scope: ctx.ackReactionScope,
		isDirect: isDirectMessage,
		isGroup: isRoomish,
		isMentionableGroup: isRoom,
		requireMention: shouldRequireMention,
		canDetectMention,
		effectiveWasMentioned,
		shouldBypassMention: mentionDecision.shouldBypassMention
	}));
	const ackReactionMessageTs = message.ts;
	const statusReactionsWillHandle = Boolean(ackReactionMessageTs) && cfg.messages?.statusReactions?.enabled !== false && shouldAckReaction$1();
	const ackReactionPromise = !statusReactionsWillHandle && shouldAckReaction$1() && ackReactionMessageTs && ackReactionValue ? reactSlackMessage(message.channel, ackReactionMessageTs, ackReactionValue, {
		token: ctx.botToken,
		client: ctx.app.client
	}).then(() => true, (err) => {
		logVerbose(`slack react failed for channel ${message.channel}: ${String(err)}`);
		return false;
	}) : statusReactionsWillHandle ? Promise.resolve(true) : null;
	const roomLabel = channelName ? `#${channelName}` : `#${message.channel}`;
	const senderName = await resolveSenderName();
	const preview = rawBody.replace(/\s+/g, " ").slice(0, 160);
	const inboundLabel = isDirectMessage ? `Slack DM from ${senderName}` : `Slack message in ${roomLabel} from ${senderName}`;
	const slackFrom = isDirectMessage ? `slack:${message.user}` : isRoom ? `slack:channel:${message.channel}` : `slack:group:${message.channel}`;
	enqueueSystemEvent(`${inboundLabel}: ${preview}`, {
		sessionKey,
		contextKey: `slack:message:${message.channel}:${message.ts ?? "unknown"}`
	});
	const envelopeFrom = resolveConversationLabel$1({
		ChatType: isDirectMessage ? "direct" : "channel",
		SenderName: senderName,
		GroupSubject: isRoomish ? roomLabel : void 0,
		From: slackFrom
	}) ?? (isDirectMessage ? senderName : roomLabel);
	const threadInfo = isThreadReply && threadTs ? ` thread_ts: ${threadTs}${message.parent_user_id ? ` parent_user_id: ${message.parent_user_id}` : ""}` : "";
	const textWithId = `${rawBody}\n[slack message id: ${message.ts} channel: ${message.channel}${threadInfo}]`;
	const storePath = resolveStorePath(ctx.cfg.session?.store, { agentId: route.agentId });
	const envelopeOptions = resolveEnvelopeFormatOptions(ctx.cfg);
	const previousTimestamp = readSessionUpdatedAt({
		storePath,
		sessionKey
	});
	let combinedBody = formatInboundEnvelope({
		channel: "Slack",
		from: envelopeFrom,
		timestamp: message.ts ? Math.round(Number(message.ts) * 1e3) : void 0,
		body: textWithId,
		chatType: isDirectMessage ? "direct" : "channel",
		sender: {
			name: senderName,
			id: senderId
		},
		previousTimestamp,
		envelope: envelopeOptions
	});
	if (isRoomish && ctx.historyLimit > 0) combinedBody = buildPendingHistoryContextFromMap({
		historyMap: ctx.channelHistories,
		historyKey,
		limit: ctx.historyLimit,
		currentMessage: combinedBody,
		formatEntry: (entry) => formatInboundEnvelope({
			channel: "Slack",
			from: roomLabel,
			timestamp: entry.timestamp,
			body: `${entry.body}${entry.messageId ? ` [id:${entry.messageId} channel:${message.channel}]` : ""}`,
			chatType: "channel",
			senderLabel: entry.sender,
			envelope: envelopeOptions
		})
	});
	const slackTo = isDirectMessage ? `user:${message.user}` : `channel:${message.channel}`;
	const { untrustedChannelMetadata, groupSystemPrompt } = resolveSlackRoomContextHints({
		isRoomish,
		channelInfo,
		channelConfig
	});
	const { threadStarterBody, threadHistoryBody, threadSessionPreviousTimestamp, threadLabel, threadStarterMedia } = await resolveSlackThreadContextData({
		ctx,
		account,
		message,
		isThreadReply,
		threadTs,
		threadStarter,
		roomLabel,
		storePath,
		sessionKey,
		allowFromLower: threadContextAllowFromLower,
		allowNameMatching: ctx.allowNameMatching,
		contextVisibilityMode,
		envelopeOptions,
		effectiveDirectMedia
	});
	const effectiveMedia = effectiveDirectMedia ?? threadStarterMedia;
	const firstMedia = effectiveMedia?.[0];
	const inboundHistory = isRoomish && ctx.historyLimit > 0 ? (ctx.channelHistories.get(historyKey) ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
	const commandBody = textForCommandDetection.trim();
	const ctxPayload = finalizeInboundContext({
		Body: combinedBody,
		BodyForAgent: rawBody,
		InboundHistory: inboundHistory,
		RawBody: rawBody,
		CommandBody: commandBody,
		BodyForCommands: commandBody,
		From: slackFrom,
		To: slackTo,
		SessionKey: sessionKey,
		AccountId: route.accountId,
		ChatType: isDirectMessage ? "direct" : "channel",
		ConversationLabel: envelopeFrom,
		GroupSubject: isRoomish ? roomLabel : void 0,
		GroupSystemPrompt: groupSystemPrompt,
		UntrustedContext: untrustedChannelMetadata ? [untrustedChannelMetadata] : void 0,
		SenderName: senderName,
		SenderId: senderId,
		Provider: "slack",
		Surface: "slack",
		MessageSid: message.ts,
		ReplyToId: threadContext.replyToId,
		MessageThreadId: threadContext.messageThreadId,
		ParentSessionKey: threadKeys.parentSessionKey,
		ThreadStarterBody: !threadSessionPreviousTimestamp ? threadStarterBody : void 0,
		ThreadHistoryBody: threadHistoryBody,
		IsFirstThreadTurn: isThreadReply && threadTs && !threadSessionPreviousTimestamp ? true : void 0,
		ThreadLabel: threadLabel,
		Timestamp: message.ts ? Math.round(Number(message.ts) * 1e3) : void 0,
		WasMentioned: isRoomish ? effectiveWasMentioned : void 0,
		MediaPath: firstMedia?.path,
		MediaType: firstMedia?.contentType,
		MediaUrl: firstMedia?.path,
		MediaPaths: effectiveMedia && effectiveMedia.length > 0 ? effectiveMedia.map((m) => m.path) : void 0,
		MediaUrls: effectiveMedia && effectiveMedia.length > 0 ? effectiveMedia.map((m) => m.path) : void 0,
		MediaTypes: effectiveMedia && effectiveMedia.length > 0 ? effectiveMedia.map((m) => m.contentType ?? "") : void 0,
		CommandAuthorized: commandAuthorized,
		OriginatingChannel: "slack",
		OriginatingTo: slackTo,
		NativeChannelId: message.channel
	});
	const pinnedMainDmOwner = isDirectMessage ? resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: cfg.session?.dmScope,
		allowFrom: ctx.allowFrom,
		normalizeEntry: normalizeSlackAllowOwnerEntry
	}) : null;
	await recordInboundSession({
		storePath,
		sessionKey,
		ctx: ctxPayload,
		updateLastRoute: isDirectMessage ? {
			sessionKey: route.mainSessionKey,
			channel: "slack",
			to: `user:${message.user}`,
			accountId: route.accountId,
			threadId: threadContext.messageThreadId,
			mainDmOwnerPin: pinnedMainDmOwner && message.user ? {
				ownerRecipient: pinnedMainDmOwner,
				senderRecipient: normalizeLowercaseStringOrEmpty(message.user),
				onSkip: ({ ownerRecipient, senderRecipient }) => {
					logVerbose(`slack: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
				}
			} : void 0
		} : void 0,
		onRecordError: (err) => {
			ctx.logger.warn({
				error: String(err),
				storePath,
				sessionKey
			}, "failed updating session meta");
		}
	});
	const replyTarget = isDirectMessage ? `channel:${message.channel}` : ctxPayload.To ?? void 0;
	if (!replyTarget) return null;
	if (shouldLogVerbose()) logVerbose(`slack inbound: channel=${message.channel} from=${slackFrom} preview="${preview}"`);
	return {
		ctx,
		account,
		message,
		route,
		channelConfig,
		replyTarget,
		ctxPayload,
		replyToMode,
		isDirectMessage,
		isRoomish,
		historyKey,
		preview,
		ackReactionMessageTs,
		ackReactionValue,
		ackReactionPromise
	};
}
//#endregion
export { resolveSlackSlashCommandConfig as C, buildSlackSlashCommandMatcher as S, resolveDefaultGroupPolicy as _, buildPluginBindingResolvedText as a, updateLastRoute as b, authorizeSlackSystemEventSender as c, isSlackChannelAllowedByPolicy as d, normalizeSlackChannelType as f, loadConfig$1 as g, isDangerousNameMatchingEnabled as h, resolveSlackThreadTargets as i, resolveSlackEffectiveAllowFrom as l, resolveSlackChannelLabel as m, resolveSlackRoomContextHints as n, parsePluginBindingApprovalCustomId as o, resolveSlackChannelConfig as p, authorizeSlackDirectMessage as r, resolvePluginConversationBindingApproval as s, prepareSlackMessage as t, createSlackMonitorContext as u, resolveOpenProviderRuntimeGroupPolicy as v, stripSlackMentionsForCommandDetection as w, warnMissingProviderGroupPolicyFallbackOnce as x, resolveStorePath as y };
