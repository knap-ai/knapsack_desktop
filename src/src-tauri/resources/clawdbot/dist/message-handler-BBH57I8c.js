import { i as getChildLogger } from "./logger-BCzP_yik.js";
import { T as truncateUtf16Safe } from "./utils-CE3P21nG.js";
import { _ as normalizeAccountId, d as resolveThreadSessionKeys } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose, t as danger } from "./globals-BJZkpw-q.js";
import { t as logDebug } from "./logger-Dr2uNJI4.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { S as resolveDiscordPreviewStreamMode } from "./zod-schema.providers-core-BJorTsd7.js";
import { t as resolveAccountEntry } from "./account-lookup-DI_0omIr.js";
import { o as readSessionUpdatedAt } from "./store-BGmy-Wot.js";
import { n as formatAllowlistMatchMeta } from "./allowlist-match-3bw5mXHZ.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { t as createDedupeCache } from "./dedupe-_6bbS8VC.js";
import { i as resolveOpenProviderRuntimeGroupPolicy } from "./runtime-group-policy-Dj5ka44z.js";
import { i as resolveHumanDelayConfig, t as resolveAckReaction } from "./identity-BVAU5Jb3.js";
import { s as EmbeddedBlockChunker } from "./pi-embedded-BYdcxQ5A.js";
import { r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { c as resolveTextChunkLimit, s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { n as getAgentScopedMediaLocalRoots } from "./local-roots-CaV3b967.js";
import { i as formatDurationSeconds } from "./format-duration-C_A6mVzb.js";
import { t as stripReasoningTagsFromText } from "./reasoning-tags-D1eMJn9V.js";
import { t as buildAgentSessionKey } from "./resolve-route-DID7K3Jm.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-BkMLZAw9.js";
import { y as shouldHandleTextCommands } from "./commands-registry-dA2_ExHR.js";
import "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import { t as hasControlCommand } from "./command-detection-Bz_HOEgu.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope } from "./envelope-CTj2Ympv.js";
import { i as matchesMentionWithExplicit, n as buildMentionRegexes } from "./mentions-Bfkn0E5p.js";
import { n as shouldAckReaction } from "./ack-reactions-cTTW0IRo.js";
import { n as resolveControlCommandGate } from "./command-gating-Ch_OhMao.js";
import { t as recordInboundSession } from "./session-BiguA5nC.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { c as recordChannelActivity } from "./heartbeat-visibility-CIk_o9BM.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import { a as buildPendingHistoryContextFromMap, s as clearHistoryEntriesIfEnabled, u as recordPendingHistoryEntryIfEnabled } from "./history-5RBVRj2e.js";
import "./reply-history-D4cGNH0x.js";
import "./runtime-env-CoykX19-.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-B1150NOt.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-runtime-DxFWfQpm.js";
import "./reply-dispatch-runtime-ChRff2BZ.js";
import "./reply-chunking-CIe6J6dn.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-S26JmiPz.js";
import "./channel-runtime-BQArgtty.js";
import "./media-runtime-DdCWeFPm.js";
import "./conversation-runtime-DIsQmaYR.js";
import "./text-runtime-B0ZpmkER.js";
import "./agent-runtime-B7ucOTD-.js";
import { n as logInboundDrop, r as logTypingFailure, t as logAckFailure } from "./logging-N7W67_op.js";
import "./command-auth-native-m2se5Aky.js";
import "./command-detection-CmLKK9NS.js";
import "./command-surface-oDSqSOMi.js";
import { a as createStatusReactionController, r as DEFAULT_TIMING } from "./channel-feedback-CeI9SuZx.js";
import { n as shouldDebounceTextInbound, t as createChannelInboundDebouncer } from "./channel-inbound-BTUonbdp.js";
import { n as resolveMentionGatingWithBypass } from "./mention-gating-DzHPTjeG.js";
import { i as createFinalizableDraftLifecycle, n as createRunStateMachine } from "./channel-lifecycle-BW1n4hjx.js";
import { c as resolveDiscordMaxLinesPerMessage } from "./accounts-7Ym6HIvs.js";
import { i as resolveTimestampMs, n as formatDiscordUserTag, r as resolveDiscordSystemLocation } from "./format-CviHuUx2.js";
import { d as resolveDiscordOwnerAccess, i as normalizeDiscordSlug, l as resolveDiscordGuildEntry, m as resolveGroupDmAllow, n as isDiscordGroupAllowedByPolicy, p as resolveDiscordShouldRequireMention, s as resolveDiscordChannelConfigWithFallback, u as resolveDiscordMemberAccessState } from "./allow-list-qE0AJ4XV.js";
import { o as Routes } from "./v10-BAfWMthH.js";
import { F as chunkDiscordTextWithMode } from "./send.components-sVt5Smd7.js";
import { i as removeReactionDiscord, n as reactMessageDiscord, p as editMessageDiscord } from "./send-BP9-Jzzy.js";
import { g as isRecentlyUnboundThreadWebhookMessage } from "./thread-bindings.discord-api-WOO9VoBT.js";
import "./thread-bindings-DGck9pdd.js";
import { l as runDiscordTaskWithTimeout, n as DISCORD_ATTACHMENT_TOTAL_TIMEOUT_MS, s as normalizeDiscordInboundWorkerTimeoutMs, t as DISCORD_ATTACHMENT_IDLE_TIMEOUT_MS } from "./timeouts-Rxac5izA.js";
import { _ as resolveMediaList, a as resolveDiscordReplyDeliveryPlan, d as buildDiscordMediaPayload, f as hasDiscordMessageStickers, g as resolveForwardedMediaList, h as resolveDiscordMessageText, i as resolveDiscordAutoThreadReplyPlan, l as resolveDiscordThreadStarter, m as resolveDiscordMessageChannelId, p as resolveDiscordChannelInfo } from "./threading-CBvj7nks.js";
import { a as handleDiscordDmCommandDecision, c as buildDirectLabel, d as resolveDiscordSenderIdentity, f as resolveDiscordWebhookId, i as resolveDiscordEffectiveRoute, l as buildGuildLabel, o as resolveDiscordDmCommandAccess, r as resolveDiscordConversationRoute, s as deliverDiscordReply, t as buildDiscordRoutePeer, u as resolveReplyContext } from "./route-resolution-CuU5jWRE.js";
import { n as buildDiscordInboundAccessContext } from "./inbound-context-CHsCnazv.js";
import { t as DISCORD_TEXT_CHUNK_LIMIT } from "./outbound-adapter-DiShbjMH.js";
import { t as sendTyping } from "./typing-CuMKBuPY.js";
import { ChannelType, MessageType } from "@buape/carbon";
//#region extensions/discord/src/monitor/inbound-job.ts
function resolveDiscordInboundJobQueueKey(ctx) {
	const sessionKey = ctx.route.sessionKey?.trim();
	if (sessionKey) return sessionKey;
	const baseSessionKey = ctx.baseSessionKey?.trim();
	if (baseSessionKey) return baseSessionKey;
	return ctx.messageChannelId;
}
function buildDiscordInboundJob(ctx) {
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
		}
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
	const draftCfg = resolveAccountEntry(cfg?.channels?.discord?.accounts, normalizedAccountId)?.draftChunk ?? cfg?.channels?.discord?.draftChunk;
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
			params.warn?.(`discord stream preview failed: ${err instanceof Error ? err.message : String(err)}`);
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
//#region extensions/discord/src/monitor/message-handler.process.ts
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
const DISCORD_TYPING_MAX_DURATION_MS = 20 * 6e4;
let replyRuntimePromise;
async function loadReplyRuntime() {
	replyRuntimePromise ??= import("./plugin-sdk/reply-runtime.js");
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
		requireMention: Boolean(shouldRequireMention),
		canDetectMention,
		effectiveWasMentioned,
		shouldBypassMention
	}));
	const statusReactionsEnabled = shouldAckReaction$1();
	const discordRest = client.rest;
	const statusReactions = createStatusReactionController({
		enabled: statusReactionsEnabled,
		adapter: {
			setReaction: async (emoji) => {
				await reactMessageDiscord(messageChannelId, message.id, emoji, { rest: discordRest });
			},
			removeReaction: async (emoji) => {
				await removeReactionDiscord(messageChannelId, message.id, emoji, { rest: discordRest });
			}
		},
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
	if (statusReactionsEnabled) statusReactions.setQueued();
	const { createReplyDispatcherWithTyping, dispatchInboundMessage } = await loadReplyRuntime();
	const fromLabel = isDirectMessage ? buildDirectLabel(author) : buildGuildLabel({
		guild: data.guild ?? void 0,
		channelName: channelName ?? messageChannelId,
		channelId: messageChannelId
	});
	const senderLabel = sender.label;
	const isForumParent = threadParentType === ChannelType.GuildForum || threadParentType === ChannelType.GuildMedia;
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
			if (starter?.text) threadStarterBody = starter.text;
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
	const lastRouteTo = isDirectMessage ? `user:${author.id}` : effectiveTo;
	const inboundHistory = shouldIncludeChannelHistory && historyLimit > 0 ? (guildHistories.get(messageChannelId) ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
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
		ReplyToId: replyContext?.id,
		ReplyToBody: replyContext?.body,
		ReplyToSender: replyContext?.sender,
		ParentSessionKey: autoThreadContext?.ParentSessionKey ?? threadKeys.parentSessionKey,
		MessageThreadId: threadChannel?.id ?? autoThreadContext?.createdThreadId ?? void 0,
		ThreadStarterBody: threadStarterBody,
		ThreadLabel: threadLabel,
		Timestamp: resolveTimestampMs(message.timestamp),
		...mediaPayload,
		CommandAuthorized: commandAuthorized,
		CommandSource: "text",
		OriginatingChannel: "discord",
		OriginatingTo: autoThreadContext?.OriginatingTo ?? replyTarget
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
				client,
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
	const accountBlockStreamingEnabled = typeof discordConfig?.blockStreaming === "boolean" ? discordConfig.blockStreaming : cfg.agents?.defaults?.blockStreamingDefault === "on";
	const canStreamDraft = discordStreamMode !== "off" && !accountBlockStreamingEnabled;
	const draftReplyToMessageId = () => replyReference.use();
	const deliverChannelId = deliverTarget.startsWith("channel:") ? deliverTarget.slice(8) : messageChannelId;
	const draftStream = canStreamDraft ? createDiscordDraftStream({
		rest: client.rest,
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
		const formatted = convertMarkdownTables(text, tableMode);
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
		const cleaned = stripReasoningTagsFromText(text, {
			mode: "strict",
			trim: "both"
		});
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
				const previewMessageId = draftStream.messageId();
				if (!finalizedViaPreviewMessage && !hasMedia && typeof previewFinalText === "string" && typeof previewMessageId === "string" && !payload.isError) {
					await draftStream.stop();
					if (isProcessAborted(abortSignal)) return;
					try {
						notifyFinalReplyStart();
						await editMessageDiscord(deliverChannelId, previewMessageId, { content: previewFinalText }, { rest: client.rest });
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
					if (typeof messageIdAfterStop === "string" && typeof previewFinalText === "string" && !hasMedia && !payload.isError) try {
						notifyFinalReplyStart();
						await editMessageDiscord(deliverChannelId, messageIdAfterStop, { content: previewFinalText }, { rest: client.rest });
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
				rest: client.rest,
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
				disableBlockStreaming: disableBlockStreamingForDraft ?? (typeof discordConfig?.blockStreaming === "boolean" ? !discordConfig.blockStreaming : void 0),
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
					createdThreadId = resolved.createdThreadId?.trim() || void 0;
					sessionKey = resolved.sessionKey?.trim() || void 0;
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
	conversationRuntimePromise ??= import("./plugin-sdk/conversation-runtime.js");
	return await conversationRuntimePromise;
}
async function loadPluralKitRuntime() {
	pluralkitRuntimePromise ??= import("./pluralkit-BDs7r0jC.js");
	return await pluralkitRuntimePromise;
}
async function loadDiscordSendRuntime() {
	discordSendRuntimePromise ??= import("./send-uXtYA5rg.js");
	return await discordSendRuntimePromise;
}
async function loadPreflightAudioRuntime() {
	preflightAudioRuntimePromise ??= import("./preflight-audio-CDSwpAqt.js");
	return await preflightAudioRuntimePromise;
}
async function loadSystemEventsRuntime() {
	systemEventsRuntimePromise ??= import("./system-events-CAZXEVc7.js");
	return await systemEventsRuntimePromise;
}
async function loadDiscordThreadingRuntime() {
	discordThreadingRuntimePromise ??= import("./threading-BHWUujRF.js");
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
function resolvePreflightMentionRequirement(params) {
	if (!params.shouldRequireMention) return false;
	return !params.bypassMentionRequirement;
}
function shouldIgnoreBoundThreadWebhookMessage(params) {
	const webhookId = params.webhookId?.trim() || "";
	if (!webhookId) return false;
	const boundWebhookId = typeof params.threadBinding?.metadata?.webhookId === "string" ? params.threadBinding.metadata.webhookId.trim() : "";
	if (!boundWebhookId) {
		const threadId = params.threadId?.trim() || "";
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
	const referencedMessage = fetched.referenced_message ? {
		...base.referencedMessage ?? {},
		...fetched.referenced_message,
		mentionedUsers: Array.isArray(fetched.referenced_message.mentions) ? fetched.referenced_message.mentions.map((mention) => ({
			...mention,
			globalName: mention.global_name ?? void 0
		})) : baseReferenced?.mentionedUsers ?? [],
		mentionedRoles: fetched.referenced_message.mention_roles ?? baseReferenced?.mentionedRoles ?? [],
		mentionedEveryone: fetched.referenced_message.mention_everyone ?? baseReferenced?.mentionedEveryone ?? false
	} : base.referencedMessage;
	const rawData = {
		...base.rawData ?? {},
		message_snapshots: fetched.message_snapshots ?? base.rawData?.message_snapshots,
		sticker_items: fetched.sticker_items ?? base.rawData?.sticker_items
	};
	return {
		...base,
		...fetched,
		content: fetched.content ?? base.content,
		attachments: fetched.attachments ?? base.attachments,
		embeds: fetched.embeds ?? base.embeds,
		stickers: fetched.stickers ?? fetched.sticker_items ?? base.stickers,
		mentionedUsers: fetchedMentions ?? base.mentionedUsers,
		mentionedRoles: fetched.mention_roles ?? base.mentionedRoles,
		mentionedEveryone: fetched.mention_everyone ?? base.mentionedEveryone,
		referencedMessage,
		rawData
	};
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
	const isDirectMessage = channelInfo?.type === ChannelType.DM;
	const isGroupDm = channelInfo?.type === ChannelType.GroupDM;
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
	const resolvedAccountId = params.accountId ?? "default";
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
	const messageText = resolveDiscordMessageText(message, { includeForwarded: true });
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
	const memberRoleIds = Array.isArray(params.data.rawMember?.roles) ? params.data.rawMember.roles.map((roleId) => String(roleId)) : [];
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
	const bindingConversationId = isDirectMessage ? `user:${author.id}` : messageChannelId;
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
	const hasUserOrRoleMention = Boolean(!isDirectMessage && ((message.mentionedUsers?.length ?? 0) > 0 || (message.mentionedRoles?.length ?? 0) > 0));
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
	const wasMentioned = !isDirectMessage && matchesMentionWithExplicit({
		text: hasTypedText ? baseText : "",
		mentionRegexes,
		explicit: {
			hasAnyMention,
			isExplicitlyMentioned: explicitlyMentioned,
			canResolveExplicit: Boolean(botId)
		},
		transcript: preflightTranscript
	});
	const implicitMention = Boolean(!isDirectMessage && botId && message.referencedMessage?.author?.id && message.referencedMessage.author.id === botId);
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
	const mentionGate = resolveMentionGatingWithBypass({
		isGroup: isGuildMessage,
		requireMention: Boolean(shouldRequireMention),
		canDetectMention,
		wasMentioned,
		implicitMention,
		hasAnyMention,
		allowTextCommands,
		hasControlCommand: hasControlCommandInMessage,
		commandAuthorized
	});
	const effectiveWasMentioned = mentionGate.effectiveWasMentioned;
	logDebug(`[discord-preflight] shouldRequireMention=${shouldRequireMention} baseRequireMention=${shouldRequireMentionByConfig} boundThreadSession=${isBoundThreadSession} mentionGate.shouldSkip=${mentionGate.shouldSkip} wasMentioned=${wasMentioned}`);
	if (isGuildMessage && shouldRequireMention) {
		if (botId && mentionGate.shouldSkip) {
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
		if (!(isDirectMessage || wasMentioned || implicitMention)) {
			logDebug(`[discord-preflight] drop: bot message missing mention (allowBots=mentions)`);
			logVerbose("discord: drop bot message (allowBots=mentions, missing mention)");
			return null;
		}
	}
	const ignoreOtherMentions = channelConfig?.ignoreOtherMentions ?? guildInfo?.ignoreOtherMentions ?? false;
	if (isGuildMessage && ignoreOtherMentions && hasUserOrRoleMention && !wasMentioned && !implicitMention) {
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
		shouldBypassMention: mentionGate.shouldBypassMention,
		effectiveWasMentioned,
		canDetectMention,
		historyEntry,
		threadBindings: params.threadBindings,
		discordRestFetch: params.discordRestFetch
	};
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.ts
const RECENT_DISCORD_MESSAGE_TTL_MS = 5 * 6e4;
const RECENT_DISCORD_MESSAGE_MAX = 5e3;
function buildDiscordInboundDedupeKey(params) {
	const messageId = params.data.message?.id?.trim();
	if (!messageId) return null;
	const channelId = resolveDiscordMessageChannelId({
		message: params.data.message,
		eventChannelId: params.data.channel_id
	});
	if (!channelId) return null;
	return `${params.accountId}:${channelId}:${messageId}`;
}
function createDiscordMessageHandler(params) {
	const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.cfg.channels?.discord !== void 0,
		groupPolicy: params.discordConfig?.groupPolicy,
		defaultGroupPolicy: params.cfg.channels?.defaults?.groupPolicy
	});
	const ackReactionScope = params.discordConfig?.ackReactionScope ?? params.cfg.messages?.ackReactionScope ?? "group-mentions";
	const preflightDiscordMessageImpl = params.__testing?.preflightDiscordMessage ?? preflightDiscordMessage;
	const inboundWorker = createDiscordInboundWorker({
		runtime: params.runtime,
		setStatus: params.setStatus,
		abortSignal: params.abortSignal,
		runTimeoutMs: params.workerRunTimeoutMs,
		__testing: params.__testing
	});
	const recentInboundMessages = createDedupeCache({
		ttlMs: RECENT_DISCORD_MESSAGE_TTL_MS,
		maxSize: RECENT_DISCORD_MESSAGE_MAX
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
			const abortSignal = last.abortSignal;
			if (abortSignal?.aborted) return;
			if (entries.length === 1) {
				const ctx = await preflightDiscordMessageImpl({
					...params,
					ackReactionScope,
					groupPolicy,
					abortSignal,
					data: last.data,
					client: last.client
				});
				if (!ctx) return;
				inboundWorker.enqueue(buildDiscordInboundJob(ctx));
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
			if (!ctx) return;
			if (entries.length > 1) {
				const ids = entries.map((entry) => entry.data.message?.id).filter(Boolean);
				if (ids.length > 0) {
					const ctxBatch = ctx;
					ctxBatch.MessageSids = ids;
					ctxBatch.MessageSidFirst = ids[0];
					ctxBatch.MessageSidLast = ids[ids.length - 1];
				}
			}
			inboundWorker.enqueue(buildDiscordInboundJob(ctx));
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
			const dedupeKey = buildDiscordInboundDedupeKey({
				accountId: params.accountId,
				data
			});
			if (dedupeKey && recentInboundMessages.check(dedupeKey)) return;
			await debouncer.enqueue({
				data,
				client,
				abortSignal: options?.abortSignal
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
