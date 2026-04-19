import { a as resolveDefaultDiscordAccountId, c as resolveDiscordMaxLinesPerMessage } from "./accounts-zcI4mtzH.js";
import { L as chunkDiscordTextWithMode, O as createDiscordRestClient, k as createDiscordRuntimeAccountContext } from "./send.shared-DIBQaUs5.js";
import { a as removeReactionDiscord, g as editMessageDiscord, r as reactMessageDiscord } from "./send-DrbFKdd7.js";
import { i as resolveTimestampMs, n as formatDiscordUserTag, r as resolveDiscordSystemLocation } from "./format-XDPCvGK4.js";
import { d as resolveDiscordMemberAccessState, g as resolveGroupDmAllow, h as resolveDiscordShouldRequireMention, i as normalizeDiscordSlug, n as isDiscordGroupAllowedByPolicy, p as resolveDiscordOwnerAccess, s as resolveDiscordChannelConfigWithFallback, u as resolveDiscordGuildEntry } from "./allow-list-MMNtJoJ7.js";
import { n as resolveDiscordConversationIdentity } from "./media-detection-Cmvt7HIM.js";
import { l as isRecentlyUnboundThreadWebhookMessage } from "./thread-bindings.state-DjhhQWW0.js";
import { t as resolveDiscordPreviewStreamMode } from "./preview-streaming-DqJ3SGWf.js";
import "./thread-bindings-BIJS3lxs.js";
import { l as runDiscordTaskWithTimeout, n as DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS, s as normalizeDiscordInboundWorkerTimeoutMs, t as DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS } from "./timeouts-DFBGDirT.js";
import { a as resolveDiscordThreadStarter, c as buildDiscordMediaPayload, d as resolveDiscordMessageChannelId, f as resolveDiscordMessageText, l as hasDiscordMessageStickers, m as resolveMediaList, n as resolveDiscordReplyDeliveryPlan, p as resolveForwardedMediaList, t as resolveDiscordAutoThreadReplyPlan, u as resolveDiscordChannelInfo } from "./threading-rB6oooGZ.js";
import { t as DISCORD_TEXT_CHUNK_LIMIT } from "./outbound-adapter-bhTRyGb7.js";
import { n as buildDiscordInboundAccessContext, r as createDiscordSupplementalContextAccessChecker } from "./inbound-context-DouSdifA.js";
import { a as handleDiscordDmCommandDecision, c as buildDirectLabel, d as resolveDiscordSenderIdentity, f as resolveDiscordWebhookId, i as resolveDiscordEffectiveRoute, l as buildGuildLabel, o as resolveDiscordDmCommandAccess, r as resolveDiscordConversationRoute, s as deliverDiscordReply, t as buildDiscordRoutePeer, u as resolveReplyContext } from "./route-resolution-BShArSf5.js";
import { t as sendTyping } from "./typing-YgMqya3F.js";
import { convertMarkdownTables, logDebug, normalizeOptionalString, stripInlineDirectiveTagsForDelivery, stripReasoningTagsFromText, truncateUtf16Safe } from "openclaw/plugin-sdk/text-runtime";
import { buildAgentSessionKey, normalizeAccountId, resolveAccountEntry, resolveThreadSessionKeys } from "openclaw/plugin-sdk/routing";
import { Routes } from "discord-api-types/v10";
import { ChannelType as ChannelType$1, MessageType } from "@buape/carbon";
import { getAgentScopedMediaLocalRoots } from "openclaw/plugin-sdk/media-runtime";
import { resolveSendableOutboundReplyParts } from "openclaw/plugin-sdk/reply-payload";
import { resolveChunkMode, resolveTextChunkLimit } from "openclaw/plugin-sdk/reply-chunking";
import { isDangerousNameMatchingEnabled, loadConfig, readSessionUpdatedAt, resolveChannelContextVisibilityMode, resolveMarkdownTableMode, resolveOpenProviderRuntimeGroupPolicy, resolveStorePath } from "openclaw/plugin-sdk/config-runtime";
import { enqueueSystemEvent, recordChannelActivity } from "openclaw/plugin-sdk/infra-runtime";
import { danger, formatDurationSeconds, getChildLogger, logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { formatAllowlistMatchMeta } from "openclaw/plugin-sdk/allow-from";
import { recordInboundSession } from "openclaw/plugin-sdk/conversation-runtime";
import { EmbeddedBlockChunker, resolveAckReaction, resolveHumanDelayConfig } from "openclaw/plugin-sdk/agent-runtime";
import { evaluateSupplementalContextVisibility } from "openclaw/plugin-sdk/security-runtime";
import { buildMentionRegexes, createChannelInboundDebouncer, formatInboundEnvelope, implicitMentionKindWhen, logInboundDrop, matchesMentionWithExplicit, resolveEnvelopeFormatOptions, resolveInboundMentionDecision, shouldDebounceTextInbound } from "openclaw/plugin-sdk/channel-inbound";
import { createClaimableDedupe } from "openclaw/plugin-sdk/persistent-dedupe";
import { createFinalizableDraftLifecycle, createRunStateMachine } from "openclaw/plugin-sdk/channel-lifecycle";
import { KeyedAsyncQueue } from "openclaw/plugin-sdk/keyed-async-queue";
import { DEFAULT_TIMING, createStatusReactionController, logAckFailure, logTypingFailure, shouldAckReaction } from "openclaw/plugin-sdk/channel-feedback";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { resolveChannelStreamingBlockEnabled, resolveChannelStreamingPreviewChunk } from "openclaw/plugin-sdk/channel-streaming";
import { finalizeInboundContext } from "openclaw/plugin-sdk/reply-dispatch-runtime";
import { buildPendingHistoryContextFromMap, clearHistoryEntriesIfEnabled, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { resolveBatchedReplyThreadingPolicy } from "openclaw/plugin-sdk/reply-reference";
import { resolveControlCommandGate } from "openclaw/plugin-sdk/command-auth-native";
import { hasControlCommand } from "openclaw/plugin-sdk/command-detection";
import { shouldHandleTextCommands } from "openclaw/plugin-sdk/command-surface";
//#region extensions/discord/src/monitor/inbound-dedupe.ts
const RECENT_DISCORD_MESSAGE_TTL_MS = 5 * 6e4;
const RECENT_DISCORD_MESSAGE_MAX = 5e3;
function createDiscordInboundReplayGuard() {
	return createClaimableDedupe({
		ttlMs: RECENT_DISCORD_MESSAGE_TTL_MS,
		memoryMaxSize: RECENT_DISCORD_MESSAGE_MAX
	});
}
var DiscordRetryableInboundError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "DiscordRetryableInboundError";
	}
};
function buildDiscordInboundReplayKey(params) {
	const messageId = params.data.message?.id?.trim();
	if (!messageId) return null;
	const channelId = resolveDiscordMessageChannelId({
		message: params.data.message,
		eventChannelId: params.data.channel_id
	});
	if (!channelId) return null;
	return `${params.accountId}:${channelId}:${messageId}`;
}
async function claimDiscordInboundReplay(params) {
	const replayKey = params.replayKey?.trim();
	if (!replayKey) return true;
	return (await params.replayGuard.claim(replayKey)).kind === "claimed";
}
async function commitDiscordInboundReplay(params) {
	const replayKeys = normalizeDiscordInboundReplayKeys(params.replayKeys);
	await Promise.all(replayKeys.map((replayKey) => params.replayGuard.commit(replayKey)));
}
function releaseDiscordInboundReplay(params) {
	normalizeDiscordInboundReplayKeys(params.replayKeys).forEach((replayKey) => params.replayGuard.release(replayKey, { error: params.error }));
}
function normalizeDiscordInboundReplayKeys(replayKeys) {
	return [...new Set((replayKeys ?? []).map((replayKey) => replayKey?.trim()).filter((replayKey) => Boolean(replayKey)))];
}
//#endregion
//#region extensions/discord/src/monitor/inbound-job.ts
function resolveDiscordInboundJobQueueKey(ctx) {
	const sessionKey = ctx.route.sessionKey?.trim();
	if (sessionKey) return sessionKey;
	const baseSessionKey = ctx.baseSessionKey?.trim();
	if (baseSessionKey) return baseSessionKey;
	return ctx.messageChannelId;
}
function buildDiscordInboundJob(ctx, options) {
	const { runtime, abortSignal, guildHistories, client, threadBindings, discordRestFetch, message, data, threadChannel, ...payload } = ctx;
	const sanitizedMessage = sanitizeDiscordInboundMessage(message);
	return {
		queueKey: resolveDiscordInboundJobQueueKey(ctx),
		payload: {
			...payload,
			message: sanitizedMessage,
			data: {
				...data,
				message: sanitizedMessage
			},
			threadChannel: normalizeDiscordThreadChannel(threadChannel)
		},
		runtime: {
			runtime,
			abortSignal,
			guildHistories,
			client,
			threadBindings,
			discordRestFetch
		},
		replayKeys: options?.replayKeys ? [...options.replayKeys] : void 0
	};
}
function materializeDiscordInboundJob(job, abortSignal) {
	return {
		...job.payload,
		...job.runtime,
		abortSignal: abortSignal ?? job.runtime.abortSignal
	};
}
function sanitizeDiscordInboundMessage(message) {
	const descriptors = Object.getOwnPropertyDescriptors(message);
	delete descriptors.channel;
	return Object.create(Object.getPrototypeOf(message), descriptors);
}
function normalizeDiscordThreadChannel(threadChannel) {
	if (!threadChannel) return null;
	return {
		id: threadChannel.id,
		name: threadChannel.name,
		parentId: threadChannel.parentId,
		parent: threadChannel.parent ? {
			id: threadChannel.parent.id,
			name: threadChannel.parent.name
		} : void 0,
		ownerId: threadChannel.ownerId
	};
}
//#endregion
//#region extensions/discord/src/draft-chunking.ts
const DEFAULT_DISCORD_DRAFT_STREAM_MIN = 200;
const DEFAULT_DISCORD_DRAFT_STREAM_MAX = 800;
function resolveDiscordDraftStreamingChunking(cfg, accountId) {
	const textLimit = resolveTextChunkLimit(cfg, "discord", accountId, { fallbackLimit: DISCORD_TEXT_CHUNK_LIMIT });
	const normalizedAccountId = normalizeAccountId(accountId);
	const draftCfg = resolveChannelStreamingPreviewChunk(resolveAccountEntry(cfg?.channels?.discord?.accounts, normalizedAccountId)) ?? resolveChannelStreamingPreviewChunk(cfg?.channels?.discord);
	const maxRequested = Math.max(1, Math.floor(draftCfg?.maxChars ?? DEFAULT_DISCORD_DRAFT_STREAM_MAX));
	const maxChars = Math.max(1, Math.min(maxRequested, textLimit));
	const minRequested = Math.max(1, Math.floor(draftCfg?.minChars ?? DEFAULT_DISCORD_DRAFT_STREAM_MIN));
	return {
		minChars: Math.min(minRequested, maxChars),
		maxChars,
		breakPreference: draftCfg?.breakPreference === "newline" || draftCfg?.breakPreference === "sentence" ? draftCfg.breakPreference : "paragraph"
	};
}
//#endregion
//#region extensions/discord/src/draft-stream.ts
/** Discord messages cap at 2000 characters. */
const DISCORD_STREAM_MAX_CHARS = 2e3;
const DEFAULT_THROTTLE_MS = 1200;
function createDiscordDraftStream(params) {
	const maxChars = Math.min(params.maxChars ?? DISCORD_STREAM_MAX_CHARS, DISCORD_STREAM_MAX_CHARS);
	const throttleMs = Math.max(250, params.throttleMs ?? DEFAULT_THROTTLE_MS);
	const minInitialChars = params.minInitialChars;
	const channelId = params.channelId;
	const rest = params.rest;
	const resolveReplyToMessageId = () => typeof params.replyToMessageId === "function" ? params.replyToMessageId() : params.replyToMessageId;
	const streamState = {
		stopped: false,
		final: false
	};
	let streamMessageId;
	let lastSentText = "";
	const sendOrEditStreamMessage = async (text) => {
		if (streamState.stopped && !streamState.final) return false;
		const trimmed = text.trimEnd();
		if (!trimmed) return false;
		if (trimmed.length > maxChars) {
			streamState.stopped = true;
			params.warn?.(`discord stream preview stopped (text length ${trimmed.length} > ${maxChars})`);
			return false;
		}
		if (trimmed === lastSentText) return true;
		if (streamMessageId === void 0 && minInitialChars != null && !streamState.final) {
			if (trimmed.length < minInitialChars) return false;
		}
		lastSentText = trimmed;
		try {
			if (streamMessageId !== void 0) {
				await rest.patch(Routes.channelMessage(channelId, streamMessageId), { body: { content: trimmed } });
				return true;
			}
			const replyToMessageId = resolveReplyToMessageId()?.trim();
			const messageReference = replyToMessageId ? {
				message_id: replyToMessageId,
				fail_if_not_exists: false
			} : void 0;
			const sentMessageId = (await rest.post(Routes.channelMessages(channelId), { body: {
				content: trimmed,
				...messageReference ? { message_reference: messageReference } : {}
			} }))?.id;
			if (typeof sentMessageId !== "string" || !sentMessageId) {
				streamState.stopped = true;
				params.warn?.("discord stream preview stopped (missing message id from send)");
				return false;
			}
			streamMessageId = sentMessageId;
			return true;
		} catch (err) {
			streamState.stopped = true;
			params.warn?.(`discord stream preview failed: ${formatErrorMessage(err)}`);
			return false;
		}
	};
	const readMessageId = () => streamMessageId;
	const clearMessageId = () => {
		streamMessageId = void 0;
	};
	const isValidStreamMessageId = (value) => typeof value === "string";
	const deleteStreamMessage = async (messageId) => {
		await rest.delete(Routes.channelMessage(channelId, messageId));
	};
	const { loop, update, stop, clear } = createFinalizableDraftLifecycle({
		throttleMs,
		state: streamState,
		sendOrEditStreamMessage,
		readMessageId,
		clearMessageId,
		isValidMessageId: isValidStreamMessageId,
		deleteMessage: deleteStreamMessage,
		warn: params.warn,
		warnPrefix: "discord stream preview cleanup failed"
	});
	const forceNewMessage = () => {
		streamMessageId = void 0;
		lastSentText = "";
		loop.resetPending();
	};
	params.log?.(`discord stream preview ready (maxChars=${maxChars}, throttleMs=${throttleMs})`);
	return {
		update,
		flush: loop.flush,
		messageId: () => streamMessageId,
		clear,
		stop,
		forceNewMessage
	};
}
//#endregion
//#region extensions/discord/src/monitor/ack-reactions.ts
function createDiscordAckReactionContext(params) {
	return {
		rest: params.rest,
		...createDiscordRuntimeAccountContext({
			cfg: params.cfg,
			accountId: params.accountId
		})
	};
}
function createDiscordAckReactionAdapter(params) {
	return {
		setReaction: async (emoji) => {
			await reactMessageDiscord(params.channelId, params.messageId, emoji, params.reactionContext);
		},
		removeReaction: async (emoji) => {
			await removeReactionDiscord(params.channelId, params.messageId, emoji, params.reactionContext);
		}
	};
}
function queueInitialDiscordAckReaction(params) {
	if (params.enabled) {
		params.statusReactions.setQueued();
		return;
	}
	if (!params.shouldSendAckReaction || !params.ackReaction) return;
	params.reactionAdapter.setReaction(params.ackReaction).catch((err) => {
		logAckFailure({
			log: logVerbose,
			channel: "discord",
			target: params.target,
			error: err
		});
	});
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.process.ts
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
const DISCORD_TYPING_MAX_DURATION_MS = 20 * 6e4;
let replyRuntimePromise;
async function loadReplyRuntime() {
	replyRuntimePromise ??= import("openclaw/plugin-sdk/reply-runtime");
	return await replyRuntimePromise;
}
function isProcessAborted(abortSignal) {
	return Boolean(abortSignal?.aborted);
}
async function processDiscordMessage(ctx, observer) {
	const { cfg, discordConfig, accountId, token, runtime, guildHistories, historyLimit, mediaMaxBytes, textLimit, replyToMode, ackReactionScope, message, author, sender, data, client, channelInfo, channelName, messageChannelId, isGuildMessage, isDirectMessage, isGroupDm, baseText, messageText, shouldRequireMention, canDetectMention, effectiveWasMentioned, shouldBypassMention, threadChannel, threadParentId, threadParentName, threadParentType, threadName, displayChannelSlug, guildInfo, guildSlug, channelConfig, baseSessionKey, boundSessionKey, threadBindings, route, commandAuthorized, discordRestFetch, abortSignal } = ctx;
	if (isProcessAborted(abortSignal)) return;
	const mediaResolveOptions = {
		fetchImpl: discordRestFetch,
		ssrfPolicy: cfg.browser?.ssrfPolicy,
		readIdleTimeoutMs: DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS,
		totalTimeoutMs: DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS,
		abortSignal
	};
	const mediaList = await resolveMediaList(message, mediaMaxBytes, mediaResolveOptions);
	if (isProcessAborted(abortSignal)) return;
	const forwardedMediaList = await resolveForwardedMediaList(message, mediaMaxBytes, mediaResolveOptions);
	if (isProcessAborted(abortSignal)) return;
	mediaList.push(...forwardedMediaList);
	const text = messageText;
	if (!text) {
		logVerbose("discord: drop message " + message.id + " (empty content)");
		return;
	}
	const boundThreadId = ctx.threadBinding?.conversation?.conversationId?.trim();
	if (boundThreadId && typeof threadBindings.touchThread === "function") threadBindings.touchThread({ threadId: boundThreadId });
	const ackReaction = resolveAckReaction(cfg, route.agentId, {
		channel: "discord",
		accountId
	});
	const removeAckAfterReply = cfg.messages?.removeAckAfterReply ?? false;
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, route.agentId);
	const shouldAckReaction$1 = () => Boolean(ackReaction && shouldAckReaction({
		scope: ackReactionScope,
		isDirect: isDirectMessage,
		isGroup: isGuildMessage || isGroupDm,
		isMentionableGroup: isGuildMessage,
		requireMention: shouldRequireMention,
		canDetectMention,
		effectiveWasMentioned,
		shouldBypassMention
	}));
	const shouldSendAckReaction = shouldAckReaction$1();
	const statusReactionsEnabled = shouldSendAckReaction && cfg.messages?.statusReactions?.enabled !== false;
	const feedbackRest = createDiscordRestClient({
		cfg,
		token,
		accountId
	}).rest;
	const deliveryRest = createDiscordRestClient({
		cfg,
		token,
		accountId
	}).rest;
	const ackReactionContext = createDiscordAckReactionContext({
		rest: feedbackRest,
		cfg,
		accountId
	});
	const discordAdapter = createDiscordAckReactionAdapter({
		channelId: messageChannelId,
		messageId: message.id,
		reactionContext: ackReactionContext
	});
	const statusReactions = createStatusReactionController({
		enabled: statusReactionsEnabled,
		adapter: discordAdapter,
		initialEmoji: ackReaction,
		emojis: cfg.messages?.statusReactions?.emojis,
		timing: cfg.messages?.statusReactions?.timing,
		onError: (err) => {
			logAckFailure({
				log: logVerbose,
				channel: "discord",
				target: `${messageChannelId}/${message.id}`,
				error: err
			});
		}
	});
	queueInitialDiscordAckReaction({
		enabled: statusReactionsEnabled,
		shouldSendAckReaction,
		ackReaction,
		statusReactions,
		reactionAdapter: discordAdapter,
		target: `${messageChannelId}/${message.id}`
	});
	const { createReplyDispatcherWithTyping, dispatchInboundMessage } = await loadReplyRuntime();
	const fromLabel = isDirectMessage ? buildDirectLabel(author) : buildGuildLabel({
		guild: data.guild ?? void 0,
		channelName: channelName ?? messageChannelId,
		channelId: messageChannelId
	});
	const senderLabel = sender.label;
	const isForumParent = threadParentType === ChannelType$1.GuildForum || threadParentType === ChannelType$1.GuildMedia;
	const forumParentSlug = isForumParent && threadParentName ? normalizeDiscordSlug(threadParentName) : "";
	const threadChannelId = threadChannel?.id;
	const forumContextLine = Boolean(threadChannelId && isForumParent && forumParentSlug) && message.id === threadChannelId ? `[Forum parent: #${forumParentSlug}]` : null;
	const groupChannel = isGuildMessage && displayChannelSlug ? `#${displayChannelSlug}` : void 0;
	const groupSubject = isDirectMessage ? void 0 : groupChannel;
	const senderName = sender.isPluralKit ? sender.name ?? author.username : data.member?.nickname ?? author.globalName ?? author.username;
	const senderUsername = sender.isPluralKit ? sender.tag ?? sender.name ?? author.username : author.username;
	const senderTag = sender.tag;
	const { groupSystemPrompt, ownerAllowFrom, untrustedContext } = buildDiscordInboundAccessContext({
		channelConfig,
		guildInfo,
		sender: {
			id: sender.id,
			name: sender.name,
			tag: sender.tag
		},
		allowNameMatching: isDangerousNameMatchingEnabled(discordConfig),
		isGuild: isGuildMessage,
		channelTopic: channelInfo?.topic,
		messageBody: text
	});
	const contextVisibilityMode = resolveChannelContextVisibilityMode({
		cfg,
		channel: "discord",
		accountId
	});
	const isSupplementalContextSenderAllowed = createDiscordSupplementalContextAccessChecker({
		channelConfig,
		guildInfo,
		allowNameMatching: isDangerousNameMatchingEnabled(discordConfig),
		isGuild: isGuildMessage
	});
	const storePath = resolveStorePath(cfg.session?.store, { agentId: route.agentId });
	const envelopeOptions = resolveEnvelopeFormatOptions(cfg);
	const previousTimestamp = readSessionUpdatedAt({
		storePath,
		sessionKey: route.sessionKey
	});
	let combinedBody = formatInboundEnvelope({
		channel: "Discord",
		from: fromLabel,
		timestamp: resolveTimestampMs(message.timestamp),
		body: text,
		chatType: isDirectMessage ? "direct" : "channel",
		senderLabel,
		previousTimestamp,
		envelope: envelopeOptions
	});
	const shouldIncludeChannelHistory = !isDirectMessage && !(isGuildMessage && channelConfig?.autoThread && !threadChannel);
	if (shouldIncludeChannelHistory) combinedBody = buildPendingHistoryContextFromMap({
		historyMap: guildHistories,
		historyKey: messageChannelId,
		limit: historyLimit,
		currentMessage: combinedBody,
		formatEntry: (entry) => formatInboundEnvelope({
			channel: "Discord",
			from: fromLabel,
			timestamp: entry.timestamp,
			body: `${entry.body} [id:${entry.messageId ?? "unknown"} channel:${messageChannelId}]`,
			chatType: "channel",
			senderLabel: entry.sender,
			envelope: envelopeOptions
		})
	});
	const replyContext = resolveReplyContext(message, resolveDiscordMessageText);
	const replyVisibility = replyContext ? evaluateSupplementalContextVisibility({
		mode: contextVisibilityMode,
		kind: "quote",
		senderAllowed: isSupplementalContextSenderAllowed({
			id: replyContext.senderId,
			name: replyContext.senderName,
			tag: replyContext.senderTag,
			memberRoleIds: replyContext.memberRoleIds
		})
	}) : null;
	const filteredReplyContext = replyContext && replyVisibility?.include ? replyContext : null;
	if (replyContext && !filteredReplyContext && isGuildMessage) logVerbose(`discord: drop reply context (mode=${contextVisibilityMode})`);
	if (forumContextLine) combinedBody = `${combinedBody}\n${forumContextLine}`;
	let threadStarterBody;
	let threadLabel;
	let parentSessionKey;
	if (threadChannel) {
		if (channelConfig?.includeThreadStarter !== false) {
			const starter = await resolveDiscordThreadStarter({
				channel: threadChannel,
				client,
				parentId: threadParentId,
				parentType: threadParentType,
				resolveTimestampMs
			});
			if (starter?.text) if (evaluateSupplementalContextVisibility({
				mode: contextVisibilityMode,
				kind: "thread",
				senderAllowed: isSupplementalContextSenderAllowed({
					id: starter.authorId,
					name: starter.authorName ?? starter.author,
					tag: starter.authorTag,
					memberRoleIds: starter.memberRoleIds
				})
			}).include) threadStarterBody = starter.text;
			else logVerbose(`discord: drop thread starter context (mode=${contextVisibilityMode})`);
		}
		const parentName = threadParentName ?? "parent";
		threadLabel = threadName ? `Discord thread #${normalizeDiscordSlug(parentName)} › ${threadName}` : `Discord thread #${normalizeDiscordSlug(parentName)}`;
		if (threadParentId) parentSessionKey = buildAgentSessionKey({
			agentId: route.agentId,
			channel: route.channel,
			peer: {
				kind: "channel",
				id: threadParentId
			}
		});
	}
	const mediaPayload = buildDiscordMediaPayload(mediaList);
	const threadKeys = resolveThreadSessionKeys({
		baseSessionKey,
		threadId: threadChannel ? messageChannelId : void 0,
		parentSessionKey,
		useSuffix: false
	});
	const replyPlan = await resolveDiscordAutoThreadReplyPlan({
		client,
		message,
		messageChannelId,
		isGuildMessage,
		channelConfig,
		threadChannel,
		channelType: channelInfo?.type,
		channelName: channelInfo?.name,
		channelDescription: channelInfo?.topic,
		baseText: baseText ?? "",
		combinedBody,
		replyToMode,
		agentId: route.agentId,
		channel: route.channel,
		cfg
	});
	const deliverTarget = replyPlan.deliverTarget;
	const replyTarget = replyPlan.replyTarget;
	const replyReference = replyPlan.replyReference;
	const autoThreadContext = replyPlan.autoThreadContext;
	const effectiveFrom = isDirectMessage ? `discord:${author.id}` : autoThreadContext?.From ?? `discord:channel:${messageChannelId}`;
	const effectiveTo = autoThreadContext?.To ?? replyTarget;
	if (!effectiveTo) {
		runtime.error?.(danger("discord: missing reply target"));
		return;
	}
	const dmConversationTarget = isDirectMessage ? resolveDiscordConversationIdentity({
		isDirectMessage,
		userId: author.id
	}) : void 0;
	const lastRouteTo = dmConversationTarget ?? effectiveTo;
	const inboundHistory = shouldIncludeChannelHistory && historyLimit > 0 ? (guildHistories.get(messageChannelId) ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
	const originatingTo = autoThreadContext?.OriginatingTo ?? dmConversationTarget ?? replyTarget;
	const ctxPayload = finalizeInboundContext({
		Body: combinedBody,
		BodyForAgent: baseText ?? text,
		InboundHistory: inboundHistory,
		RawBody: baseText,
		CommandBody: baseText,
		From: effectiveFrom,
		To: effectiveTo,
		SessionKey: boundSessionKey ?? autoThreadContext?.SessionKey ?? threadKeys.sessionKey,
		AccountId: route.accountId,
		ChatType: isDirectMessage ? "direct" : "channel",
		ConversationLabel: fromLabel,
		SenderName: senderName,
		SenderId: sender.id,
		SenderUsername: senderUsername,
		SenderTag: senderTag,
		GroupSubject: groupSubject,
		GroupChannel: groupChannel,
		UntrustedContext: untrustedContext,
		GroupSystemPrompt: isGuildMessage ? groupSystemPrompt : void 0,
		GroupSpace: isGuildMessage ? (guildInfo?.id ?? guildSlug) || void 0 : void 0,
		OwnerAllowFrom: ownerAllowFrom,
		Provider: "discord",
		Surface: "discord",
		WasMentioned: effectiveWasMentioned,
		MessageSid: message.id,
		ReplyToId: filteredReplyContext?.id,
		ReplyToBody: filteredReplyContext?.body,
		ReplyToSender: filteredReplyContext?.sender,
		ParentSessionKey: autoThreadContext?.ParentSessionKey ?? threadKeys.parentSessionKey,
		MessageThreadId: threadChannel?.id ?? autoThreadContext?.createdThreadId ?? void 0,
		ThreadStarterBody: threadStarterBody,
		ThreadLabel: threadLabel,
		Timestamp: resolveTimestampMs(message.timestamp),
		...mediaPayload,
		CommandAuthorized: commandAuthorized,
		CommandSource: "text",
		OriginatingChannel: "discord",
		OriginatingTo: originatingTo
	});
	const persistedSessionKey = ctxPayload.SessionKey ?? route.sessionKey;
	observer?.onReplyPlanResolved?.({
		createdThreadId: replyPlan.createdThreadId,
		sessionKey: persistedSessionKey
	});
	await recordInboundSession({
		storePath,
		sessionKey: persistedSessionKey,
		ctx: ctxPayload,
		updateLastRoute: {
			sessionKey: persistedSessionKey,
			channel: "discord",
			to: lastRouteTo,
			accountId: route.accountId
		},
		onRecordError: (err) => {
			logVerbose(`discord: failed updating session meta: ${String(err)}`);
		}
	});
	if (shouldLogVerbose()) {
		const preview = truncateUtf16Safe(combinedBody, 200).replace(/\n/g, "\\n");
		logVerbose(`discord inbound: channel=${messageChannelId} deliver=${deliverTarget} from=${ctxPayload.From} preview="${preview}"`);
	}
	const typingChannelId = deliverTarget.startsWith("channel:") ? deliverTarget.slice(8) : messageChannelId;
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg,
		agentId: route.agentId,
		channel: "discord",
		accountId: route.accountId,
		typing: {
			start: () => sendTyping({
				rest: feedbackRest,
				channelId: typingChannelId
			}),
			onStartError: (err) => {
				logTypingFailure({
					log: logVerbose,
					channel: "discord",
					target: typingChannelId,
					error: err
				});
			},
			maxDurationMs: DISCORD_TYPING_MAX_DURATION_MS
		}
	});
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "discord",
		accountId
	});
	const maxLinesPerMessage = resolveDiscordMaxLinesPerMessage({
		cfg,
		discordConfig,
		accountId
	});
	const chunkMode = resolveChunkMode(cfg, "discord", accountId);
	const discordStreamMode = resolveDiscordPreviewStreamMode(discordConfig);
	const draftMaxChars = Math.min(textLimit, 2e3);
	const accountBlockStreamingEnabled = resolveChannelStreamingBlockEnabled(discordConfig) ?? cfg.agents?.defaults?.blockStreamingDefault === "on";
	const canStreamDraft = discordStreamMode !== "off" && !accountBlockStreamingEnabled;
	const draftReplyToMessageId = () => replyReference.use();
	const deliverChannelId = deliverTarget.startsWith("channel:") ? deliverTarget.slice(8) : messageChannelId;
	const draftStream = canStreamDraft ? createDiscordDraftStream({
		rest: deliveryRest,
		channelId: deliverChannelId,
		maxChars: draftMaxChars,
		replyToMessageId: draftReplyToMessageId,
		minInitialChars: 30,
		throttleMs: 1200,
		log: logVerbose,
		warn: logVerbose
	}) : void 0;
	const draftChunking = draftStream && discordStreamMode === "block" ? resolveDiscordDraftStreamingChunking(cfg, accountId) : void 0;
	const shouldSplitPreviewMessages = discordStreamMode === "block";
	const draftChunker = draftChunking ? new EmbeddedBlockChunker(draftChunking) : void 0;
	let lastPartialText = "";
	let draftText = "";
	let hasStreamedMessage = false;
	let finalizedViaPreviewMessage = false;
	const resolvePreviewFinalText = (text) => {
		if (typeof text !== "string") return;
		const formatted = convertMarkdownTables(stripInlineDirectiveTagsForDelivery(text).text, tableMode);
		const chunks = chunkDiscordTextWithMode(formatted, {
			maxChars: draftMaxChars,
			maxLines: maxLinesPerMessage,
			chunkMode
		});
		if (!chunks.length && formatted) chunks.push(formatted);
		if (chunks.length !== 1) return;
		const trimmed = chunks[0].trim();
		if (!trimmed) return;
		const currentPreviewText = discordStreamMode === "block" ? draftText : lastPartialText;
		if (currentPreviewText && currentPreviewText.startsWith(trimmed) && trimmed.length < currentPreviewText.length) return;
		return trimmed;
	};
	const updateDraftFromPartial = (text) => {
		if (!draftStream || !text) return;
		const cleaned = stripInlineDirectiveTagsForDelivery(stripReasoningTagsFromText(text, {
			mode: "strict",
			trim: "both"
		})).text;
		if (!cleaned || cleaned.startsWith("Reasoning:\n")) return;
		if (cleaned === lastPartialText) return;
		hasStreamedMessage = true;
		if (discordStreamMode === "partial") {
			if (lastPartialText && lastPartialText.startsWith(cleaned) && cleaned.length < lastPartialText.length) return;
			lastPartialText = cleaned;
			draftStream.update(cleaned);
			return;
		}
		let delta = cleaned;
		if (cleaned.startsWith(lastPartialText)) delta = cleaned.slice(lastPartialText.length);
		else {
			draftChunker?.reset();
			draftText = "";
		}
		lastPartialText = cleaned;
		if (!delta) return;
		if (!draftChunker) {
			draftText = cleaned;
			draftStream.update(draftText);
			return;
		}
		draftChunker.append(delta);
		draftChunker.drain({
			force: false,
			emit: (chunk) => {
				draftText += chunk;
				draftStream.update(draftText);
			}
		});
	};
	const flushDraft = async () => {
		if (!draftStream) return;
		if (draftChunker?.hasBuffered()) {
			draftChunker.drain({
				force: true,
				emit: (chunk) => {
					draftText += chunk;
				}
			});
			draftChunker.reset();
			if (draftText) draftStream.update(draftText);
		}
		await draftStream.flush();
	};
	const disableBlockStreamingForDraft = draftStream ? true : void 0;
	let finalReplyStartNotified = false;
	const notifyFinalReplyStart = () => {
		if (finalReplyStartNotified) return;
		finalReplyStartNotified = true;
		observer?.onFinalReplyStart?.();
	};
	const { dispatcher, replyOptions, markDispatchIdle, markRunComplete } = createReplyDispatcherWithTyping({
		...replyPipeline,
		humanDelay: resolveHumanDelayConfig(cfg, route.agentId),
		deliver: async (payload, info) => {
			if (isProcessAborted(abortSignal)) return;
			const isFinal = info.kind === "final";
			if (payload.isReasoning) return;
			if (draftStream && isFinal) {
				await flushDraft();
				const hasMedia = resolveSendableOutboundReplyParts(payload).hasMedia;
				const finalText = payload.text;
				const previewFinalText = resolvePreviewFinalText(finalText);
				const hasExplicitReplyDirective = Boolean(payload.replyToTag || payload.replyToCurrent) || typeof finalText === "string" && /\[\[\s*reply_to(?:_current|\s*:)/i.test(finalText);
				const previewMessageId = draftStream.messageId();
				if (!finalizedViaPreviewMessage && !hasMedia && typeof previewFinalText === "string" && typeof previewMessageId === "string" && !hasExplicitReplyDirective && !payload.isError) {
					await draftStream.stop();
					if (isProcessAborted(abortSignal)) return;
					try {
						notifyFinalReplyStart();
						await editMessageDiscord(deliverChannelId, previewMessageId, { content: previewFinalText }, { rest: deliveryRest });
						finalizedViaPreviewMessage = true;
						replyReference.markSent();
						observer?.onFinalReplyDelivered?.();
						return;
					} catch (err) {
						logVerbose(`discord: preview final edit failed; falling back to standard send (${String(err)})`);
					}
				}
				if (!finalizedViaPreviewMessage) {
					await draftStream.stop();
					if (isProcessAborted(abortSignal)) return;
					const messageIdAfterStop = draftStream.messageId();
					if (typeof messageIdAfterStop === "string" && typeof previewFinalText === "string" && !hasMedia && !hasExplicitReplyDirective && !payload.isError) try {
						notifyFinalReplyStart();
						await editMessageDiscord(deliverChannelId, messageIdAfterStop, { content: previewFinalText }, { rest: deliveryRest });
						finalizedViaPreviewMessage = true;
						replyReference.markSent();
						observer?.onFinalReplyDelivered?.();
						return;
					} catch (err) {
						logVerbose(`discord: post-stop preview edit failed; falling back to standard send (${String(err)})`);
					}
				}
				if (!finalizedViaPreviewMessage) await draftStream.clear();
			}
			if (isProcessAborted(abortSignal)) return;
			const replyToId = replyReference.use();
			if (isFinal) notifyFinalReplyStart();
			await deliverDiscordReply({
				cfg,
				replies: [payload],
				target: deliverTarget,
				token,
				accountId,
				rest: deliveryRest,
				runtime,
				replyToId,
				replyToMode,
				textLimit,
				maxLinesPerMessage,
				tableMode,
				chunkMode,
				sessionKey: ctxPayload.SessionKey,
				threadBindings,
				mediaLocalRoots
			});
			replyReference.markSent();
			if (isFinal) observer?.onFinalReplyDelivered?.();
		},
		onError: (err, info) => {
			runtime.error?.(danger(`discord ${info.kind} reply failed: ${String(err)}`));
		},
		onReplyStart: async () => {
			if (isProcessAborted(abortSignal)) return;
			await replyPipeline.typingCallbacks?.onReplyStart();
			await statusReactions.setThinking();
		}
	});
	const resolvedBlockStreamingEnabled = resolveChannelStreamingBlockEnabled(discordConfig);
	let dispatchResult = null;
	let dispatchError = false;
	let dispatchAborted = false;
	try {
		if (isProcessAborted(abortSignal)) {
			dispatchAborted = true;
			return;
		}
		dispatchResult = await dispatchInboundMessage({
			ctx: ctxPayload,
			cfg,
			dispatcher,
			replyOptions: {
				...replyOptions,
				abortSignal,
				skillFilter: channelConfig?.skills,
				disableBlockStreaming: disableBlockStreamingForDraft ?? (typeof resolvedBlockStreamingEnabled === "boolean" ? !resolvedBlockStreamingEnabled : void 0),
				onPartialReply: draftStream ? (payload) => updateDraftFromPartial(payload.text) : void 0,
				onAssistantMessageStart: draftStream ? () => {
					if (shouldSplitPreviewMessages && hasStreamedMessage) {
						logVerbose("discord: calling forceNewMessage() for draft stream");
						draftStream.forceNewMessage();
					}
					lastPartialText = "";
					draftText = "";
					draftChunker?.reset();
				} : void 0,
				onReasoningEnd: draftStream ? () => {
					if (shouldSplitPreviewMessages && hasStreamedMessage) {
						logVerbose("discord: calling forceNewMessage() for draft stream");
						draftStream.forceNewMessage();
					}
					lastPartialText = "";
					draftText = "";
					draftChunker?.reset();
				} : void 0,
				onModelSelected,
				onReasoningStream: async () => {
					await statusReactions.setThinking();
				},
				onToolStart: async (payload) => {
					if (isProcessAborted(abortSignal)) return;
					await statusReactions.setTool(payload.name);
				},
				onCompactionStart: async () => {
					if (isProcessAborted(abortSignal)) return;
					await statusReactions.setCompacting();
				},
				onCompactionEnd: async () => {
					if (isProcessAborted(abortSignal)) return;
					statusReactions.cancelPending();
					await statusReactions.setThinking();
				}
			}
		});
		if (isProcessAborted(abortSignal)) {
			dispatchAborted = true;
			return;
		}
	} catch (err) {
		if (isProcessAborted(abortSignal)) {
			dispatchAborted = true;
			return;
		}
		dispatchError = true;
		throw err;
	} finally {
		try {
			await draftStream?.stop();
			if (!finalizedViaPreviewMessage) await draftStream?.clear();
		} catch (err) {
			logVerbose(`discord: draft cleanup failed: ${String(err)}`);
		} finally {
			markRunComplete();
			markDispatchIdle();
		}
		if (statusReactionsEnabled) if (dispatchAborted) if (removeAckAfterReply) statusReactions.clear();
		else statusReactions.restoreInitial();
		else {
			if (dispatchError) await statusReactions.setError();
			else await statusReactions.setDone();
			if (removeAckAfterReply) (async () => {
				await sleep(dispatchError ? DEFAULT_TIMING.errorHoldMs : DEFAULT_TIMING.doneHoldMs);
				await statusReactions.clear();
			})();
			else statusReactions.restoreInitial();
		}
		else if (shouldSendAckReaction && ackReaction && removeAckAfterReply) removeReactionDiscord(messageChannelId, message.id, ackReaction, ackReactionContext).catch((err) => {
			logAckFailure({
				log: logVerbose,
				channel: "discord",
				target: `${messageChannelId}/${message.id}`,
				error: err
			});
		});
	}
	if (dispatchAborted) return;
	if (!dispatchResult?.queuedFinal) {
		if (isGuildMessage) clearHistoryEntriesIfEnabled({
			historyMap: guildHistories,
			historyKey: messageChannelId,
			limit: historyLimit
		});
		return;
	}
	if (shouldLogVerbose()) {
		const finalCount = dispatchResult.counts.final;
		logVerbose(`discord: delivered ${finalCount} reply${finalCount === 1 ? "" : "ies"} to ${replyTarget}`);
	}
	if (isGuildMessage) clearHistoryEntriesIfEnabled({
		historyMap: guildHistories,
		historyKey: messageChannelId,
		limit: historyLimit
	});
}
//#endregion
//#region extensions/discord/src/monitor/inbound-worker.ts
function formatDiscordRunContextSuffix(job) {
	const channelId = job.payload.messageChannelId?.trim();
	const messageId = job.payload.data?.message?.id?.trim();
	const details = [channelId ? `channelId=${channelId}` : null, messageId ? `messageId=${messageId}` : null].filter((entry) => Boolean(entry));
	if (details.length === 0) return "";
	return ` (${details.join(", ")})`;
}
async function processDiscordInboundJob(params) {
	const timeoutMs = normalizeDiscordInboundWorkerTimeoutMs(params.runTimeoutMs);
	const contextSuffix = formatDiscordRunContextSuffix(params.job);
	let finalReplyStarted = false;
	let createdThreadId;
	let sessionKey;
	const processDiscordMessageImpl = params.testing?.processDiscordMessage ?? processDiscordMessage;
	try {
		await runDiscordTaskWithTimeout({
			run: async (abortSignal) => {
				await processDiscordMessageImpl(materializeDiscordInboundJob(params.job, abortSignal), {
					onFinalReplyStart: () => {
						finalReplyStarted = true;
					},
					onFinalReplyDelivered: () => {
						finalReplyStarted = true;
					},
					onReplyPlanResolved: (resolved) => {
						createdThreadId = normalizeOptionalString(resolved.createdThreadId);
						sessionKey = normalizeOptionalString(resolved.sessionKey);
					}
				});
			},
			timeoutMs,
			abortSignals: [params.job.runtime.abortSignal, params.lifecycleSignal],
			onTimeout: async (resolvedTimeoutMs) => {
				params.runtime.error?.(danger(`discord inbound worker timed out after ${formatDurationSeconds(resolvedTimeoutMs, {
					decimals: 1,
					unit: "seconds"
				})}${contextSuffix}`));
				if (finalReplyStarted) return;
				await sendDiscordInboundWorkerTimeoutReply({
					job: params.job,
					runtime: params.runtime,
					contextSuffix,
					createdThreadId,
					sessionKey,
					deliverDiscordReplyImpl: params.testing?.deliverDiscordReply
				});
			},
			onErrorAfterTimeout: (error) => {
				params.runtime.error?.(danger(`discord inbound worker failed after timeout: ${String(error)}${contextSuffix}`));
			}
		});
		await commitDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			replayGuard: params.replayGuard
		});
	} catch (error) {
		if (error instanceof DiscordRetryableInboundError) releaseDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			error,
			replayGuard: params.replayGuard
		});
		else await commitDiscordInboundReplay({
			replayKeys: params.job.replayKeys,
			replayGuard: params.replayGuard
		});
		throw error;
	}
}
async function sendDiscordInboundWorkerTimeoutReply(params) {
	const messageChannelId = params.job.payload.messageChannelId?.trim();
	const messageId = params.job.payload.message?.id?.trim();
	const token = params.job.payload.token?.trim();
	if (!messageChannelId || !messageId || !token) {
		params.runtime.error?.(danger(`discord inbound worker timeout reply skipped: missing reply target${params.contextSuffix}`));
		return;
	}
	const deliveryPlan = resolveDiscordReplyDeliveryPlan({
		replyTarget: `channel:${params.job.payload.threadChannel?.id ?? messageChannelId}`,
		replyToMode: params.job.payload.replyToMode,
		messageId,
		threadChannel: params.job.payload.threadChannel,
		createdThreadId: params.createdThreadId
	});
	try {
		await (params.deliverDiscordReplyImpl ?? deliverDiscordReply)({
			cfg: params.job.payload.cfg,
			replies: [{
				text: "Discord inbound worker timed out.",
				isError: true
			}],
			target: deliveryPlan.deliverTarget,
			token,
			accountId: params.job.payload.accountId,
			runtime: params.runtime,
			textLimit: params.job.payload.textLimit,
			maxLinesPerMessage: params.job.payload.discordConfig?.maxLinesPerMessage,
			replyToId: deliveryPlan.replyReference.use(),
			replyToMode: params.job.payload.replyToMode,
			sessionKey: params.sessionKey ?? params.job.payload.route.sessionKey ?? params.job.payload.baseSessionKey,
			threadBindings: params.job.runtime.threadBindings
		});
	} catch (error) {
		params.runtime.error?.(danger(`discord inbound worker timeout reply failed: ${String(error)}${params.contextSuffix}`));
	}
}
function createDiscordInboundWorker(params) {
	const runQueue = new KeyedAsyncQueue();
	const runState = createRunStateMachine({
		setStatus: params.setStatus,
		abortSignal: params.abortSignal
	});
	const replayGuard = params.replayGuard ?? createDiscordInboundReplayGuard();
	return {
		enqueue(job) {
			runQueue.enqueue(job.queueKey, async () => {
				if (!runState.isActive()) return;
				runState.onRunStart();
				try {
					if (!runState.isActive()) return;
					await processDiscordInboundJob({
						job,
						runtime: params.runtime,
						lifecycleSignal: params.abortSignal,
						runTimeoutMs: params.runTimeoutMs,
						replayGuard,
						testing: params.__testing
					});
				} finally {
					runState.onRunEnd();
				}
			}).catch((error) => {
				params.runtime.error?.(danger(`discord inbound worker failed: ${String(error)}`));
			});
		},
		deactivate: runState.deactivate
	};
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.batch-gate.ts
function applyImplicitReplyBatchGate(ctx, replyToMode, isBatched) {
	const replyThreading = resolveBatchedReplyThreadingPolicy(replyToMode, isBatched);
	if (!replyThreading) return;
	ctx.ReplyThreading = replyThreading;
}
//#endregion
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
	pluralkitRuntimePromise ??= import("./pluralkit-CGjt16no.js").then((n) => n.n);
	return await pluralkitRuntimePromise;
}
async function loadDiscordSendRuntime() {
	discordSendRuntimePromise ??= import("./send-DrbFKdd7.js").then((n) => n.t);
	return await discordSendRuntimePromise;
}
async function loadPreflightAudioRuntime() {
	preflightAudioRuntimePromise ??= import("./preflight-audio-BSlujLwd.js");
	return await preflightAudioRuntimePromise;
}
async function loadSystemEventsRuntime() {
	systemEventsRuntimePromise ??= import("./system-events-x8yXlN2N.js");
	return await systemEventsRuntimePromise;
}
async function loadDiscordThreadingRuntime() {
	discordThreadingRuntimePromise ??= import("./threading-rB6oooGZ.js").then((n) => n.s);
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
async function hydrateDiscordMessageIfEmpty(params) {
	if (resolveDiscordMessageText(params.message, { includeForwarded: true })) return params.message;
	const rest = params.client.rest;
	if (typeof rest?.get !== "function") return params.message;
	try {
		const fetched = await rest.get(Routes.channelMessage(params.messageChannelId, params.message.id));
		if (!fetched) return params.message;
		logVerbose(`discord: hydrated empty inbound payload via REST for ${params.message.id}`);
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
	message = await hydrateDiscordMessageIfEmpty({
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
	const channelName = channelInfo?.name ?? ((isGuildMessage || isGroupDm) && message.channel && "name" in message.channel ? message.channel.name : void 0);
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
	const freshCfg = loadConfig();
	const conversationRuntime = await loadConversationRuntime();
	const route = resolveDiscordConversationRoute({
		cfg: freshCfg,
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
	threadBinding = conversationRuntime.getSessionBindingService().resolveByConversation({
		channel: "discord",
		accountId: params.accountId,
		conversationId: bindingConversationId,
		parentConversationId: earlyThreadParentId
	}) ?? void 0;
	const configuredRoute = threadBinding == null ? conversationRuntime.resolveConfiguredBindingRoute({
		cfg: freshCfg,
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
	const boundSessionKey = conversationRuntime.isPluginOwnedSessionBindingRecord(threadBinding) ? "" : threadBinding?.targetSessionKey?.trim();
	const effectiveRoute = resolveDiscordEffectiveRoute({
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
	const threadOwnerId = threadChannel ? threadChannel.ownerId ?? channelInfo?.ownerId : void 0;
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
			cfg: freshCfg,
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
//#region extensions/discord/src/monitor/message-handler.ts
function isNonEmptyString(value) {
	return typeof value === "string" && value.length > 0;
}
function createDiscordMessageHandler(params) {
	const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.cfg.channels?.discord !== void 0,
		groupPolicy: params.discordConfig?.groupPolicy,
		defaultGroupPolicy: params.cfg.channels?.defaults?.groupPolicy
	});
	const ackReactionScope = params.discordConfig?.ackReactionScope ?? params.cfg.messages?.ackReactionScope ?? "group-mentions";
	const preflightDiscordMessageImpl = params.__testing?.preflightDiscordMessage ?? preflightDiscordMessage;
	const replayGuard = createDiscordInboundReplayGuard();
	const inboundWorker = createDiscordInboundWorker({
		runtime: params.runtime,
		setStatus: params.setStatus,
		abortSignal: params.abortSignal,
		runTimeoutMs: params.workerRunTimeoutMs,
		replayGuard,
		__testing: params.__testing
	});
	const { debouncer } = createChannelInboundDebouncer({
		cfg: params.cfg,
		channel: "discord",
		buildKey: (entry) => {
			const message = entry.data.message;
			const authorId = entry.data.author?.id;
			if (!message || !authorId) return null;
			const channelId = resolveDiscordMessageChannelId({
				message,
				eventChannelId: entry.data.channel_id
			});
			if (!channelId) return null;
			return `discord:${params.accountId}:${channelId}:${authorId}`;
		},
		shouldDebounce: (entry) => {
			const message = entry.data.message;
			if (!message) return false;
			return shouldDebounceTextInbound({
				text: resolveDiscordMessageText(message, { includeForwarded: false }),
				cfg: params.cfg,
				hasMedia: Boolean(message.attachments && message.attachments.length > 0 || hasDiscordMessageStickers(message))
			});
		},
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			const replayKeys = entries.map((entry) => entry.replayKey).filter(isNonEmptyString);
			const abortSignal = last.abortSignal;
			if (abortSignal?.aborted) {
				releaseDiscordInboundReplay({
					replayKeys,
					error: abortSignal.reason,
					replayGuard
				});
				return;
			}
			try {
				if (entries.length === 1) {
					const ctx = await preflightDiscordMessageImpl({
						...params,
						ackReactionScope,
						groupPolicy,
						abortSignal,
						data: last.data,
						client: last.client
					});
					if (!ctx) {
						await commitDiscordInboundReplay({
							replayKeys,
							replayGuard
						});
						return;
					}
					applyImplicitReplyBatchGate(ctx, params.replyToMode, false);
					inboundWorker.enqueue(buildDiscordInboundJob(ctx, { replayKeys }));
					return;
				}
				const combinedBaseText = entries.map((entry) => resolveDiscordMessageText(entry.data.message, { includeForwarded: false })).filter(Boolean).join("\n");
				const syntheticMessage = {
					...last.data.message,
					content: combinedBaseText,
					attachments: [],
					message_snapshots: last.data.message.message_snapshots,
					messageSnapshots: last.data.message.messageSnapshots,
					rawData: { ...last.data.message.rawData }
				};
				const syntheticData = {
					...last.data,
					message: syntheticMessage
				};
				const ctx = await preflightDiscordMessageImpl({
					...params,
					ackReactionScope,
					groupPolicy,
					abortSignal,
					data: syntheticData,
					client: last.client
				});
				if (!ctx) {
					await commitDiscordInboundReplay({
						replayKeys,
						replayGuard
					});
					return;
				}
				applyImplicitReplyBatchGate(ctx, params.replyToMode, true);
				if (entries.length > 1) {
					const ids = entries.map((entry) => entry.data.message?.id).filter(isNonEmptyString);
					if (ids.length > 0) {
						const ctxBatch = ctx;
						ctxBatch.MessageSids = ids;
						ctxBatch.MessageSidFirst = ids[0];
						ctxBatch.MessageSidLast = ids[ids.length - 1];
					}
				}
				inboundWorker.enqueue(buildDiscordInboundJob(ctx, { replayKeys }));
			} catch (error) {
				if (error instanceof DiscordRetryableInboundError) releaseDiscordInboundReplay({
					replayKeys,
					error,
					replayGuard
				});
				else await commitDiscordInboundReplay({
					replayKeys,
					replayGuard
				});
				throw error;
			}
		},
		onError: (err) => {
			params.runtime.error?.(danger(`discord debounce flush failed: ${String(err)}`));
		}
	});
	const handler = async (data, client, options) => {
		try {
			if (options?.abortSignal?.aborted) return;
			const msgAuthorId = data.message?.author?.id ?? data.author?.id;
			if (params.botUserId && msgAuthorId === params.botUserId) return;
			const replayKey = buildDiscordInboundReplayKey({
				accountId: params.accountId,
				data
			});
			if (!await claimDiscordInboundReplay({
				replayKey,
				replayGuard
			})) return;
			await debouncer.enqueue({
				data,
				client,
				abortSignal: options?.abortSignal,
				replayKey: replayKey ?? void 0
			});
		} catch (err) {
			params.runtime.error?.(danger(`handler failed: ${String(err)}`));
		}
	};
	handler.deactivate = inboundWorker.deactivate;
	return handler;
}
//#endregion
export { createDiscordMessageHandler as t };
