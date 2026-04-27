import { c as resolveDiscordMaxLinesPerMessage } from "./accounts-zcI4mtzH.js";
import { t as chunkDiscordTextWithMode } from "./chunk-BWZe6zUn.js";
import { M as createDiscordRuntimeAccountContext, j as createDiscordRestClient } from "./send.shared-G5HPu1EM.js";
import { i as resolveTimestampMs } from "./format-DUBG2sP4.js";
import { i as normalizeDiscordSlug } from "./allow-list-CuKLSnAf.js";
import { a as removeReactionDiscord, l as editMessageDiscord, r as reactMessageDiscord } from "./send-C92oy8jh.js";
import { t as resolveDiscordConversationIdentity } from "./conversation-identity-CDGuG1Sg.js";
import { t as DISCORD_TEXT_CHUNK_LIMIT } from "./outbound-adapter-BYJSnkBS.js";
import { t as resolveDiscordPreviewStreamMode } from "./preview-streaming-BSJjH2oo.js";
import { n as DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS, t as DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS } from "./timeouts-DDxjtlnF.js";
import { c as resolveForwardedMediaList, l as resolveMediaList, s as resolveDiscordMessageText, t as buildDiscordMediaPayload } from "./message-utils-CJUMRDQq.js";
import { a as resolveDiscordThreadStarter, t as resolveDiscordAutoThreadReplyPlan } from "./threading-CrYVZmM2.js";
import { n as buildDiscordInboundAccessContext, r as createDiscordSupplementalContextAccessChecker } from "./inbound-context-BauDdPGn.js";
import { n as buildGuildLabel, r as resolveReplyContext, t as buildDirectLabel } from "./reply-context-BFfmXmVL.js";
import { t as deliverDiscordReply } from "./reply-delivery-1yqnujqr.js";
import { sendTyping } from "./typing-BIcid9wQ.js";
import { convertMarkdownTables, stripInlineDirectiveTagsForDelivery, stripReasoningTagsFromText, truncateUtf16Safe } from "openclaw/plugin-sdk/text-runtime";
import { buildAgentSessionKey, normalizeAccountId, resolveAccountEntry, resolveThreadSessionKeys } from "openclaw/plugin-sdk/routing";
import { Routes } from "discord-api-types/v10";
import { ChannelType as ChannelType$1 } from "@buape/carbon";
import { getAgentScopedMediaLocalRoots } from "openclaw/plugin-sdk/media-runtime";
import { resolveSendableOutboundReplyParts } from "openclaw/plugin-sdk/reply-payload";
import { resolveChunkMode, resolveTextChunkLimit } from "openclaw/plugin-sdk/reply-chunking";
import { danger, logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { recordInboundSession } from "openclaw/plugin-sdk/conversation-runtime";
import { EmbeddedBlockChunker, resolveAckReaction, resolveHumanDelayConfig } from "openclaw/plugin-sdk/agent-runtime";
import { isDangerousNameMatchingEnabled } from "openclaw/plugin-sdk/dangerous-name-runtime";
import { evaluateSupplementalContextVisibility } from "openclaw/plugin-sdk/security-runtime";
import { formatInboundEnvelope, resolveEnvelopeFormatOptions } from "openclaw/plugin-sdk/channel-inbound";
import { createFinalizableDraftLifecycle, deliverFinalizableDraftPreview } from "openclaw/plugin-sdk/channel-lifecycle";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { resolveChannelStreamingBlockEnabled, resolveChannelStreamingPreviewChunk, resolveChannelStreamingPreviewToolProgress } from "openclaw/plugin-sdk/channel-streaming";
import { finalizeInboundContext } from "openclaw/plugin-sdk/reply-dispatch-runtime";
import { resolveMarkdownTableMode } from "openclaw/plugin-sdk/markdown-table-runtime";
import { readSessionUpdatedAt, resolveStorePath } from "openclaw/plugin-sdk/session-store-runtime";
import { buildPendingHistoryContextFromMap, clearHistoryEntriesIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { DEFAULT_TIMING, createStatusReactionController, logAckFailure, logTypingFailure, shouldAckReaction } from "openclaw/plugin-sdk/channel-feedback";
import { resolveChannelContextVisibilityMode } from "openclaw/plugin-sdk/context-visibility-runtime";
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
const DISCORD_PREVIEW_ALLOWED_MENTIONS = { parse: [] };
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
				await rest.patch(Routes.channelMessage(channelId, streamMessageId), { body: {
					content: trimmed,
					allowed_mentions: DISCORD_PREVIEW_ALLOWED_MENTIONS
				} });
				return true;
			}
			const replyToMessageId = resolveReplyToMessageId()?.trim();
			const messageReference = replyToMessageId ? {
				message_id: replyToMessageId,
				fail_if_not_exists: false
			} : void 0;
			const sentMessageId = (await rest.post(Routes.channelMessages(channelId), { body: {
				content: trimmed,
				allowed_mentions: DISCORD_PREVIEW_ALLOWED_MENTIONS,
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
	const { loop, update, stop, clear, discardPending, seal } = createFinalizableDraftLifecycle({
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
		discardPending,
		seal,
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
function formatDiscordReplyDeliveryFailure(params) {
	const context = [`target=${params.target}`, params.sessionKey ? `session=${params.sessionKey}` : void 0].filter(Boolean).join(" ");
	return `discord ${params.kind} reply failed (${context}): ${String(params.err)}`;
}
async function processDiscordMessage(ctx, observer) {
	const { cfg, discordConfig, accountId, token, runtime, guildHistories, historyLimit, mediaMaxBytes, textLimit, replyToMode, ackReactionScope, message, author, sender, data, client, channelInfo, channelName, messageChannelId, isGuildMessage, isDirectMessage, isGroupDm, baseText, messageText, shouldRequireMention, canDetectMention, effectiveWasMentioned, shouldBypassMention, threadChannel, threadParentId, threadParentName, threadParentType, threadName, displayChannelSlug, guildInfo, guildSlug, memberRoleIds, channelConfig, baseSessionKey, boundSessionKey, threadBindings, route, commandAuthorized, discordRestFetch, abortSignal } = ctx;
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
	const threadParentInheritanceEnabled = discordConfig?.thread?.inheritParent ?? false;
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
		if (!threadParentInheritanceEnabled) parentSessionKey = void 0;
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
		cfg,
		threadParentInheritanceEnabled
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
		MemberRoleIds: memberRoleIds,
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
	const draftReplyToMessageId = () => replyReference.peek();
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
	let draftFinalDeliveryHandled = false;
	const previewToolProgressEnabled = Boolean(draftStream) && resolveChannelStreamingPreviewToolProgress(discordConfig);
	let previewToolProgressSuppressed = false;
	let previewToolProgressLines = [];
	const pushPreviewToolProgress = (line) => {
		if (!draftStream || !previewToolProgressEnabled || previewToolProgressSuppressed) return;
		const normalized = line?.replace(/\s+/g, " ").trim();
		if (!normalized) return;
		if (previewToolProgressLines.at(-1) === normalized) return;
		previewToolProgressLines = [...previewToolProgressLines, normalized].slice(-8);
		const previewText = ["Working…", ...previewToolProgressLines.map((entry) => `• ${entry}`)].join("\n");
		lastPartialText = previewText;
		draftText = previewText;
		hasStreamedMessage = true;
		draftChunker?.reset();
		draftStream.update(previewText);
	};
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
		previewToolProgressSuppressed = true;
		previewToolProgressLines = [];
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
				draftFinalDeliveryHandled = true;
				const hasMedia = resolveSendableOutboundReplyParts(payload).hasMedia;
				const finalText = payload.text;
				const previewFinalText = resolvePreviewFinalText(finalText);
				const hasExplicitReplyDirective = Boolean(payload.replyToTag || payload.replyToCurrent) || typeof finalText === "string" && /\[\[\s*reply_to(?:_current|\s*:)/i.test(finalText);
				if (await deliverFinalizableDraftPreview({
					kind: info.kind,
					payload,
					draft: {
						flush: flushDraft,
						clear: draftStream.clear,
						discardPending: draftStream.discardPending,
						seal: draftStream.seal,
						id: draftStream.messageId
					},
					buildFinalEdit: () => {
						if (finalizedViaPreviewMessage || hasMedia || typeof previewFinalText !== "string" || hasExplicitReplyDirective || payload.isError) return;
						return { content: previewFinalText };
					},
					editFinal: async (previewMessageId, edit) => {
						if (isProcessAborted(abortSignal)) throw new Error("process aborted");
						notifyFinalReplyStart();
						await editMessageDiscord(deliverChannelId, previewMessageId, edit, {
							cfg,
							accountId,
							rest: deliveryRest
						});
					},
					deliverNormally: async () => {
						if (isProcessAborted(abortSignal)) return false;
						const replyToId = replyReference.use();
						notifyFinalReplyStart();
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
						observer?.onFinalReplyDelivered?.();
						return true;
					},
					onPreviewFinalized: () => {
						finalizedViaPreviewMessage = true;
						replyReference.markSent();
						observer?.onFinalReplyDelivered?.();
					},
					logPreviewEditFailure: (err) => {
						logVerbose(`discord: preview final edit failed; falling back to standard send (${String(err)})`);
					}
				}) !== "normal-skipped") return;
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
			runtime.error?.(danger(formatDiscordReplyDeliveryFailure({
				kind: info.kind,
				err,
				target: deliverTarget,
				sessionKey: ctxPayload.SessionKey
			})));
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
					previewToolProgressSuppressed = false;
					previewToolProgressLines = [];
				} : void 0,
				onReasoningEnd: draftStream ? () => {
					if (shouldSplitPreviewMessages && hasStreamedMessage) {
						logVerbose("discord: calling forceNewMessage() for draft stream");
						draftStream.forceNewMessage();
					}
					lastPartialText = "";
					draftText = "";
					draftChunker?.reset();
					previewToolProgressSuppressed = false;
					previewToolProgressLines = [];
				} : void 0,
				onModelSelected,
				suppressDefaultToolProgressMessages: previewToolProgressEnabled ? true : void 0,
				onReasoningStream: async () => {
					await statusReactions.setThinking();
				},
				onToolStart: async (payload) => {
					if (isProcessAborted(abortSignal)) return;
					await statusReactions.setTool(payload.name);
					pushPreviewToolProgress(payload.name ? `tool: ${payload.name}` : "tool running");
				},
				onItemEvent: async (payload) => {
					pushPreviewToolProgress(payload.progressText ?? payload.summary ?? payload.title ?? payload.name);
				},
				onPlanUpdate: async (payload) => {
					if (payload.phase !== "update") return;
					pushPreviewToolProgress(payload.explanation ?? payload.steps?.[0] ?? "planning");
				},
				onApprovalEvent: async (payload) => {
					if (payload.phase !== "requested") return;
					pushPreviewToolProgress(payload.command ? `approval: ${payload.command}` : "approval requested");
				},
				onCommandOutput: async (payload) => {
					if (payload.phase !== "end") return;
					pushPreviewToolProgress(payload.name ? `${payload.name}${payload.exitCode === 0 ? " ✓" : payload.exitCode != null ? ` (exit ${payload.exitCode})` : ""}` : payload.title);
				},
				onPatchSummary: async (payload) => {
					if (payload.phase !== "end") return;
					pushPreviewToolProgress(payload.summary ?? payload.title ?? "patch applied");
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
			if (!draftFinalDeliveryHandled) await draftStream?.discardPending();
			if (!draftFinalDeliveryHandled && !finalizedViaPreviewMessage && draftStream?.messageId()) await draftStream?.clear();
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
export { processDiscordMessage };
