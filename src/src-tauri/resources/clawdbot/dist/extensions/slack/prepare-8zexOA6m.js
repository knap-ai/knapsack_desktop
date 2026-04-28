import { o as resolveSlackReplyToMode } from "./accounts-pcULq2gv.js";
import { i as normalizeSlackAllowOwnerEntry, o as resolveSlackAllowListMatch, r as normalizeAllowListLower, s as resolveSlackUserAllowed } from "./allow-list-GR9Gx-es.js";
import { t as sendMessageSlack } from "./send-DnkzdggQ.js";
import { i as resolveSlackThreadStarter, o as formatSlackFileReference, r as resolveSlackThreadHistory } from "./media-DS7HTKWp.js";
import { l as reactSlackMessage } from "./actions-DpDpdBDT.js";
import { n as hasSlackThreadParticipation } from "./sent-thread-cache-CfB-Fl5Q.js";
import { D as stripSlackMentionsForCommandDetection, S as resolveStorePath, a as recordInboundSession, f as normalizeSlackChannelType, l as resolveSlackEffectiveAllowFrom, m as resolveSlackChannelConfig, n as authorizeSlackDirectMessage, o as resolveConversationLabel$1, p as resolveSlackChatType, t as resolveSlackRoomContextHints, v as readSessionUpdatedAt, y as resolveChannelContextVisibilityMode } from "./room-context-B0-np1vF.js";
import "./send.runtime-BYEFP6IH.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { resolveAgentRoute, resolveThreadSessionKeys } from "openclaw/plugin-sdk/routing";
import { enqueueSystemEvent, runTasksWithConcurrency } from "openclaw/plugin-sdk/infra-runtime";
import { logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { resolveRuntimeConversationBindingRoute } from "openclaw/plugin-sdk/conversation-runtime";
import { buildPendingHistoryContextFromMap, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { filterSupplementalContextItems, resolvePinnedMainDmOwnerFromAllowlist, shouldIncludeSupplementalContext } from "openclaw/plugin-sdk/security-runtime";
import { buildMentionRegexes, formatInboundEnvelope, implicitMentionKindWhen, logInboundDrop, matchesMentionWithExplicit, resolveEnvelopeFormatOptions, resolveInboundMentionDecision } from "openclaw/plugin-sdk/channel-inbound";
import { resolveAckReaction, shouldAckReaction } from "openclaw/plugin-sdk/channel-feedback";
import { hasControlCommand } from "openclaw/plugin-sdk/command-detection";
import { resolveControlCommandGate } from "openclaw/plugin-sdk/command-gating";
import { shouldHandleTextCommands } from "openclaw/plugin-sdk/command-surface";
import { finalizeInboundContext } from "openclaw/plugin-sdk/reply-dispatch-runtime";
//#region extensions/slack/src/monitor/message-handler/prepare-content.ts
const SLACK_MENTION_RESOLUTION_CONCURRENCY = 4;
const SLACK_MENTION_RESOLUTION_MAX_LOOKUPS_PER_MESSAGE = 20;
let slackMediaModulePromise$1;
function loadSlackMediaModule$1() {
	slackMediaModulePromise$1 ??= import("./media-DS7HTKWp.js").then((n) => n.t);
	return slackMediaModulePromise$1;
}
function collectUniqueSlackMentionIds(texts) {
	const seen = /* @__PURE__ */ new Set();
	const mentionIds = [];
	for (const text of texts) {
		if (!text) continue;
		for (const match of text.matchAll(/<@([A-Z0-9]+)(?:\|[^>]+)?>/gi)) {
			const userId = match[1];
			if (!userId || seen.has(userId)) continue;
			seen.add(userId);
			mentionIds.push(userId);
		}
	}
	return mentionIds;
}
function renderSlackUserMentions(text, renderedMentions) {
	if (!text || renderedMentions.size === 0) return text;
	return text.replace(/<@([A-Z0-9]+)(?:\|[^>]+)?>/gi, (full, userId) => {
		return renderedMentions.get(userId) ?? full;
	});
}
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
	const media = ownFiles && ownFiles.length > 0 ? await (async () => {
		const { resolveSlackMedia } = await loadSlackMediaModule$1();
		return resolveSlackMedia({
			files: ownFiles,
			token: params.botToken,
			maxBytes: params.mediaMaxBytes
		});
	})() : null;
	const attachmentContent = params.message.attachments && params.message.attachments.length > 0 ? await (async () => {
		const { resolveSlackAttachmentContent } = await loadSlackMediaModule$1();
		return resolveSlackAttachmentContent({
			attachments: params.message.attachments,
			token: params.botToken,
			maxBytes: params.mediaMaxBytes
		});
	})() : null;
	const mergedMedia = [...media ?? [], ...attachmentContent?.media ?? []];
	const effectiveDirectMedia = mergedMedia.length > 0 ? mergedMedia : null;
	const mediaPlaceholder = effectiveDirectMedia ? effectiveDirectMedia.map((item) => item.placeholder).join(" ") : void 0;
	const fallbackFiles = ownFiles ?? [];
	const fileOnlyFallback = !mediaPlaceholder && fallbackFiles.length > 0 ? fallbackFiles.slice(0, 8).map((file) => formatSlackFileReference(file)).join(", ") : void 0;
	const fileOnlyPlaceholder = fileOnlyFallback ? `[Slack file: ${fileOnlyFallback}]` : void 0;
	const botAttachmentText = params.isBotMessage && !attachmentContent?.text ? (params.message.attachments ?? []).map((attachment) => normalizeOptionalString(attachment.text) ?? normalizeOptionalString(attachment.fallback)).filter(Boolean).join("\n") : void 0;
	const textParts = [
		normalizeOptionalString(params.message.text),
		attachmentContent?.text,
		botAttachmentText
	];
	const renderedMentions = /* @__PURE__ */ new Map();
	const resolveUserName = params.resolveUserName;
	if (resolveUserName) {
		const mentionIds = collectUniqueSlackMentionIds(textParts);
		const lookupIds = mentionIds.slice(0, SLACK_MENTION_RESOLUTION_MAX_LOOKUPS_PER_MESSAGE);
		const skippedLookups = mentionIds.length - lookupIds.length;
		if (skippedLookups > 0) logVerbose(`slack: skipping ${skippedLookups} mention lookup(s) beyond per-message cap (${SLACK_MENTION_RESOLUTION_MAX_LOOKUPS_PER_MESSAGE})`);
		const { results } = await runTasksWithConcurrency({
			tasks: lookupIds.map((userId) => async () => {
				const renderedName = normalizeOptionalString((await resolveUserName(userId))?.name);
				return {
					userId,
					rendered: renderedName ? `<@${userId}> (${renderedName})` : null
				};
			}),
			limit: SLACK_MENTION_RESOLUTION_CONCURRENCY
		});
		for (const result of results) {
			if (!result) continue;
			renderedMentions.set(result.userId, result.rendered);
		}
	}
	const rawBody = [
		renderSlackUserMentions(textParts[0], renderedMentions),
		renderSlackUserMentions(textParts[1], renderedMentions),
		renderSlackUserMentions(textParts[2], renderedMentions),
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
//#region extensions/slack/src/monitor/message-handler/prepare-routing.ts
function resolveSlackBaseConversationId(params) {
	return params.isDirectMessage ? `user:${params.message.user ?? "unknown"}` : params.message.channel;
}
function resolveSlackInitialAgentRoute(params) {
	return resolveAgentRoute({
		cfg: params.ctx.cfg,
		channel: "slack",
		accountId: params.account.accountId,
		teamId: params.ctx.teamId || void 0,
		peer: {
			kind: params.isDirectMessage ? "direct" : params.isRoom ? "channel" : "group",
			id: params.isDirectMessage ? params.message.user ?? "unknown" : params.message.channel
		}
	});
}
function resolveSlackRoutingContext(params) {
	const { ctx, account, message, isDirectMessage, isGroupDm, isRoom, isRoomish, seedTopLevelRoomThread } = params;
	let route = resolveSlackInitialAgentRoute({
		ctx,
		account,
		message,
		isDirectMessage,
		isRoom
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
	const seedCandidateThreadId = threadContext.incomingThreadTs ?? threadContext.messageTs;
	const routedThreadId = (isRoomish ? isThreadReply && threadTs ? threadTs : void 0 : isThreadReply ? threadTs : autoThreadId) ?? (isRoomish ? !isThreadReply && isRoom && seedTopLevelRoomThread && replyToMode !== "off" && seedCandidateThreadId ? seedCandidateThreadId : void 0 : void 0);
	const baseConversationId = resolveSlackBaseConversationId({
		message,
		isDirectMessage
	});
	const boundThreadRoute = routedThreadId ? resolveRuntimeConversationBindingRoute({
		route,
		conversation: {
			channel: "slack",
			accountId: account.accountId,
			conversationId: routedThreadId,
			parentConversationId: baseConversationId
		}
	}) : null;
	const runtimeRoute = boundThreadRoute?.boundSessionKey || boundThreadRoute?.bindingRecord ? boundThreadRoute : resolveRuntimeConversationBindingRoute({
		route,
		conversation: {
			channel: "slack",
			accountId: account.accountId,
			conversationId: baseConversationId
		}
	});
	route = runtimeRoute.route;
	const threadKeys = runtimeRoute.boundSessionKey ? {
		sessionKey: route.sessionKey,
		parentSessionKey: void 0
	} : resolveThreadSessionKeys({
		baseSessionKey: route.sessionKey,
		threadId: routedThreadId,
		parentSessionKey: routedThreadId && ctx.threadInheritParent ? route.sessionKey : void 0
	});
	const sessionKey = threadKeys.sessionKey;
	const historyKey = isThreadReply && ctx.threadHistoryScope === "thread" ? sessionKey : message.channel;
	return {
		route,
		runtimeBinding: runtimeRoute.bindingRecord,
		runtimeBoundSessionKey: runtimeRoute.boundSessionKey,
		chatType,
		replyToMode,
		threadContext,
		threadTs,
		isThreadReply,
		threadKeys,
		sessionKey,
		historyKey
	};
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/prepare-thread-context.ts
let slackMediaModulePromise;
function loadSlackMediaModule() {
	slackMediaModulePromise ??= import("./media-DS7HTKWp.js").then((n) => n.t);
	return slackMediaModulePromise;
}
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
	const isCurrentBotAuthor = (author) => Boolean(params.ctx.botUserId && author.userId && author.userId === params.ctx.botUserId || params.ctx.botId && author.botId && author.botId === params.ctx.botId);
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
	const starterIsCurrentBot = Boolean(starter && isCurrentBotAuthor({
		userId: starter.userId,
		botId: starter.botId
	}));
	const starterAllowed = !starter || !starterIsCurrentBot && isSlackThreadContextSenderAllowed({
		allowFromLower: params.allowFromLower,
		allowNameMatching: params.allowNameMatching,
		userId: starter.userId,
		userName: starterSenderName,
		botId: starter.botId
	});
	const includeStarterContext = !starter || !starterIsCurrentBot && shouldIncludeSupplementalContext({
		mode: params.contextVisibilityMode,
		kind: "thread",
		senderAllowed: starterAllowed
	});
	if (starter?.text && includeStarterContext) {
		threadStarterBody = starter.text;
		const snippet = starter.text.replace(/\s+/g, " ").slice(0, 80);
		threadLabel = `Slack thread ${params.roomLabel}${snippet ? `: ${snippet}` : ""}`;
		if (!params.effectiveDirectMedia && starter.files && starter.files.length > 0) {
			const { resolveSlackMedia } = await loadSlackMediaModule();
			threadStarterMedia = await resolveSlackMedia({
				files: starter.files,
				token: params.ctx.botToken,
				maxBytes: params.ctx.mediaMaxBytes
			});
			if (threadStarterMedia) logVerbose(`slack: hydrated thread starter file ${threadStarterMedia.map((item) => item.placeholder).join(", ")} from root message`);
		}
	} else threadLabel = `Slack thread ${params.roomLabel}`;
	if (starter?.text && starterIsCurrentBot) logVerbose("slack: omitted current-bot thread starter from context");
	else if (starter?.text && !includeStarterContext) logVerbose(`slack: omitted thread starter from context (mode=${params.contextVisibilityMode}, sender_allowed=${starterAllowed ? "yes" : "no"})`);
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
			const threadHistoryWithoutCurrentBot = threadHistory.filter((historyMsg) => !isCurrentBotAuthor({
				userId: historyMsg.userId,
				botId: historyMsg.botId
			}));
			const omittedCurrentBotHistoryCount = threadHistory.length - threadHistoryWithoutCurrentBot.length;
			const uniqueUserIds = [...new Set(threadHistoryWithoutCurrentBot.map((item) => item.userId).filter((id) => Boolean(id)))];
			const userMap = /* @__PURE__ */ new Map();
			await Promise.all(uniqueUserIds.map(async (id) => {
				const user = await params.ctx.resolveUserName(id);
				if (user) userMap.set(id, user);
			}));
			const { items: filteredThreadHistory, omitted: omittedHistoryCount } = filterSupplementalContextItems({
				items: threadHistoryWithoutCurrentBot,
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
			if (omittedHistoryCount > 0 || omittedCurrentBotHistoryCount > 0) logVerbose(`slack: omitted ${omittedHistoryCount + omittedCurrentBotHistoryCount} thread message(s) from context (mode=${params.contextVisibilityMode})`);
			const historyParts = [];
			for (const historyMsg of filteredThreadHistory) {
				const msgUser = historyMsg.userId ? userMap.get(historyMsg.userId) : null;
				const isBot = Boolean(historyMsg.botId);
				const msgSenderName = msgUser?.name ?? (isBot ? `Bot (${historyMsg.botId})` : "Unknown");
				const role = isBot ? "assistant" : "user";
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
					cfg: ctx.cfg,
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
	const hasAnyMention = /<@[^>]+>/.test(message.text ?? "");
	const explicitlyMentioned = Boolean(ctx.botUserId && message.text?.includes(`<@${ctx.botUserId}>`));
	const seedTopLevelRoomThreadBySource = opts.source === "app_mention" || opts.wasMentioned === true || explicitlyMentioned;
	let routing = resolveSlackRoutingContext({
		ctx,
		account,
		message,
		isDirectMessage,
		isGroupDm,
		isRoom,
		isRoomish,
		seedTopLevelRoomThread: seedTopLevelRoomThreadBySource
	});
	const resolveWasMentioned = (mentionRegexes) => opts.wasMentioned ?? (!isDirectMessage && matchesMentionWithExplicit({
		text: message.text ?? "",
		mentionRegexes,
		explicit: {
			hasAnyMention,
			isExplicitlyMentioned: explicitlyMentioned,
			canResolveExplicit: Boolean(ctx.botUserId)
		}
	}));
	let mentionRegexes = resolveCachedMentionRegexes(ctx, routing.route.agentId);
	let wasMentioned = resolveWasMentioned(mentionRegexes);
	const hasRuntimeBoundSession = Boolean(routing.runtimeBoundSessionKey);
	if (!seedTopLevelRoomThreadBySource && wasMentioned && isRoom && !routing.isThreadReply && !hasRuntimeBoundSession) {
		routing = resolveSlackRoutingContext({
			ctx,
			account,
			message,
			isDirectMessage,
			isGroupDm,
			isRoom,
			isRoomish,
			seedTopLevelRoomThread: true
		});
		mentionRegexes = resolveCachedMentionRegexes(ctx, routing.route.agentId);
		wasMentioned = resolveWasMentioned(mentionRegexes);
	}
	const { route, runtimeBinding, replyToMode, threadContext, threadTs, isThreadReply, threadKeys, sessionKey, historyKey } = routing;
	if (runtimeBinding && shouldLogVerbose()) logVerbose(`slack: routed via bound conversation ${runtimeBinding.conversation.conversationId} -> ${runtimeBinding.targetSessionKey}`);
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
		const fallbackFile = message.files?.length ? `[Slack file: ${formatSlackFileReference(message.files[0])}]` : "";
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
		mediaMaxBytes: ctx.mediaMaxBytes,
		resolveUserName: ctx.resolveUserName
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
		logVerbose(`slack react failed for channel ${message.channel}: ${formatErrorMessage(err)}`);
		return false;
	}) : statusReactionsWillHandle ? Promise.resolve(true) : null;
	const roomLabel = channelName ? `#${channelName}` : `#${message.channel}`;
	const senderName = await resolveSenderName();
	const chatType = resolveSlackChatType(conversation.resolvedChannelType);
	const preview = rawBody.replace(/\s+/g, " ").slice(0, 160);
	const inboundLabel = isDirectMessage ? `Slack DM from ${senderName}` : `Slack message in ${roomLabel} from ${senderName}`;
	const slackFrom = isDirectMessage ? `slack:${message.user}` : isRoom ? `slack:channel:${message.channel}` : `slack:group:${message.channel}`;
	enqueueSystemEvent(`${inboundLabel}: ${preview}`, {
		sessionKey,
		contextKey: `slack:message:${message.channel}:${message.ts ?? "unknown"}`
	});
	const envelopeFrom = resolveConversationLabel$1({
		ChatType: chatType,
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
		chatType,
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
		ChatType: chatType,
		ConversationLabel: envelopeFrom,
		GroupSubject: isRoomish ? roomLabel : void 0,
		GroupSpace: ctx.teamId || void 0,
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
				error: formatErrorMessage(err),
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
export { resolveSlackThreadTargets as n, prepareSlackMessage as t };
