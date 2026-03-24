import { i as getChildLogger } from "./logger-kwZIqwuw.js";
import { a as logVerbose, l as shouldLogVerbose, t as danger } from "./globals-DBUMOBZ8.js";
import { E as truncateUtf16Safe } from "./utils-CS0Ikux6.js";
import { _ as normalizeAccountId, d as resolveThreadSessionKeys } from "./session-key-DAhnzjyr.js";
import { t as logDebug } from "./logger-BmpSCz93.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { k as resolveDiscordPreviewStreamMode } from "./zod-schema.providers-core-COy5nBQ0.js";
import { t as resolveAccountEntry } from "./account-lookup-C4CvUou_.js";
import { i as readSessionUpdatedAt } from "./store-C5UK26Ce.js";
import { n as formatAllowlistMatchMeta } from "./plugins-B09-vgme.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { i as resolveHumanDelayConfig, t as resolveAckReaction } from "./identity-Dp-UIak4.js";
import { $r as resolveDiscordSystemLocation, Bi as ChannelType, Dv as resolveEnvelopeFormatOptions, En as sendDiscordComponentMessage, Gr as resolveDiscordMemberAccessState, Hr as resolveDiscordChannelConfigWithFallback, IS as EmbeddedBlockChunker, Ji as Routes, Jr as resolveDiscordShouldRequireMention, Kn as sendMessageDiscord, Kr as resolveDiscordOwnerAccess, Lr as isDiscordGroupAllowedByPolicy, Pv as dispatchInboundMessage, Qr as formatDiscordUserTag, Sn as removeReactionDiscord, Tv as formatInboundEnvelope, Un as buildDiscordInteractiveComponents, Wi as MessageType, Wr as resolveDiscordGuildEntry, Xn as sendWebhookMessageDiscord, Yr as resolveGroupDmAllow, _v as hasControlCommand, ab as recordChannelActivity, bn as reactMessageDiscord, di as chunkDiscordTextWithMode, eC as resolveDiscordMaxLinesPerMessage, ei as resolveTimestampMs, en as fetchPluralKitMessageInfo, er as editMessageDiscord, gv as shouldDebounceTextInbound, hv as createChannelInboundDebouncer, mv as resolveMentionGatingWithBypass, qn as sendPollDiscord, rn as normalizeDiscordOutboundTarget, zr as normalizeDiscordSlug, zv as createReplyDispatcherWithTyping } from "./pi-embedded-CbCYZxIb.js";
import { t as buildAgentSessionKey } from "./resolve-route-DwFWP4JW.js";
import { r as resolveOutboundSendDep } from "./outbound-runtime-m-y0nd6F.js";
import { S as resolveTextChunkLimit, T as stripReasoningTagsFromText, u as convertMarkdownTables, x as resolveChunkMode } from "./text-runtime-DVXt5xhi.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-Bj6YmEFK.js";
import { i as resolveOpenProviderRuntimeGroupPolicy } from "./runtime-group-policy-D8ugNNDZ.js";
import { W as getSessionBindingService, c as ensureConfiguredBindingRouteReady, j as isPluginOwnedSessionBindingRecord, l as resolveConfiguredBindingRoute, s as recordInboundSession } from "./conversation-runtime-nmWgJSXS.js";
import { i as createAttachedChannelResultAdapter, t as attachChannelToResult } from "./channel-send-result-DDWpviAF.js";
import { n as buildPairingReply } from "./pairing-challenge-BNorDUO6.js";
import { u as resolveControlCommandGate } from "./dm-policy-shared-DtcQProI.js";
import { l as resolveMarkdownTableMode } from "./config-runtime-BYNizC50.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-BQW4HoPt.js";
import { t as createDedupeCache } from "./dedupe-DML1ACVm.js";
import { a as createStatusReactionController, c as logInboundDrop, l as logTypingFailure, r as DEFAULT_TIMING, s as logAckFailure } from "./channel-feedback-BSaFwmB3.js";
import { i as formatDurationSeconds } from "./format-duration-DwyQDycT.js";
import { r as enqueueSystemEvent } from "./system-events-BU_NYynX.js";
import { b as sendTextMediaPayload, f as resolvePayloadMediaUrls, p as resolveSendableOutboundReplyParts, v as sendPayloadMediaSequenceOrFallback } from "./reply-payload-CiQ7TPgp.js";
import { E as finalizeInboundContext } from "./templating-BDXRiJUh.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-BxH4-AP2.js";
import { a as buildPendingHistoryContextFromMap, f as buildMentionRegexes, m as matchesMentionWithExplicit, s as clearHistoryEntriesIfEnabled, u as recordPendingHistoryEntryIfEnabled } from "./reply-history-n7nOPLta.js";
import { y as shouldHandleTextCommands } from "./commands-registry-Bh9pJ817.js";
import { o as getAgentScopedMediaLocalRoots } from "./web-media-PKy3RbRG.js";
import { n as shouldAckReaction } from "./ack-reactions-Dqv2kG4v.js";
import { c as createFinalizableDraftLifecycle, o as createRunStateMachine } from "./channel-lifecycle-DmiShiUP.js";
import { C as hasDiscordMessageStickers, D as resolveForwardedMediaList, E as resolveDiscordMessageText, O as resolveMediaList, S as buildDiscordMediaPayload, T as resolveDiscordMessageChannelId, _ as resolveReplyContext, a as handleDiscordDmCommandDecision, c as resolveDiscordAutoThreadReplyPlan, d as resolveDiscordThreadParentInfo, f as resolveDiscordThreadStarter, g as buildGuildLabel, h as buildDirectLabel, i as resolveDiscordEffectiveRoute, m as deliverDiscordReply, o as resolveDiscordDmCommandAccess, r as resolveDiscordConversationRoute, s as sendTyping, t as buildDiscordRoutePeer, u as resolveDiscordThreadChannel, v as resolveDiscordSenderIdentity, w as resolveDiscordChannelInfo, x as buildDiscordInboundAccessContext, y as resolveDiscordWebhookId } from "./route-resolution-C9XDTDsW.js";
import { g as isRecentlyUnboundThreadWebhookMessage } from "./thread-bindings.messages-C6WRAx05.js";
import { a as normalizeDiscordInboundWorkerTimeoutMs, s as runDiscordTaskWithTimeout } from "./timeouts-BnOxp0oI.js";
import { d as getThreadBindingManager } from "./thread-bindings-neFAVWsT.js";
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
//#region extensions/discord/src/outbound-adapter.ts
const DISCORD_TEXT_CHUNK_LIMIT = 2e3;
function resolveDiscordOutboundTarget(params) {
	if (params.threadId == null) return params.to;
	const threadId = String(params.threadId).trim();
	if (!threadId) return params.to;
	return `channel:${threadId}`;
}
function resolveDiscordWebhookIdentity(params) {
	const usernameRaw = params.identity?.name?.trim();
	const fallbackUsername = params.binding.label?.trim() || params.binding.agentId;
	return {
		username: (usernameRaw || fallbackUsername || "").slice(0, 80) || void 0,
		avatarUrl: params.identity?.avatarUrl?.trim() || void 0
	};
}
async function maybeSendDiscordWebhookText(params) {
	if (params.threadId == null) return null;
	const threadId = String(params.threadId).trim();
	if (!threadId) return null;
	const manager = getThreadBindingManager(params.accountId ?? void 0);
	if (!manager) return null;
	const binding = manager.getByThreadId(threadId);
	if (!binding?.webhookId || !binding?.webhookToken) return null;
	const persona = resolveDiscordWebhookIdentity({
		identity: params.identity,
		binding
	});
	return await sendWebhookMessageDiscord(params.text, {
		webhookId: binding.webhookId,
		webhookToken: binding.webhookToken,
		accountId: binding.accountId,
		threadId: binding.threadId,
		cfg: params.cfg,
		replyTo: params.replyToId ?? void 0,
		username: persona.username,
		avatarUrl: persona.avatarUrl
	});
}
const discordOutbound = {
	deliveryMode: "direct",
	chunker: null,
	textChunkLimit: DISCORD_TEXT_CHUNK_LIMIT,
	pollMaxOptions: 10,
	resolveTarget: ({ to }) => normalizeDiscordOutboundTarget(to),
	sendPayload: async (ctx) => {
		const payload = {
			...ctx.payload,
			text: ctx.payload.text ?? ""
		};
		const rawComponentSpec = (payload.channelData?.discord)?.components ?? buildDiscordInteractiveComponents(payload.interactive);
		const componentSpec = rawComponentSpec ? rawComponentSpec.text ? rawComponentSpec : {
			...rawComponentSpec,
			text: payload.text?.trim() ? payload.text : void 0
		} : void 0;
		if (!componentSpec) return await sendTextMediaPayload({
			channel: "discord",
			ctx: {
				...ctx,
				payload
			},
			adapter: discordOutbound
		});
		const send = resolveOutboundSendDep(ctx.deps, "discord") ?? sendMessageDiscord;
		const target = resolveDiscordOutboundTarget({
			to: ctx.to,
			threadId: ctx.threadId
		});
		const mediaUrls = resolvePayloadMediaUrls(payload);
		return attachChannelToResult("discord", await sendPayloadMediaSequenceOrFallback({
			text: payload.text ?? "",
			mediaUrls,
			fallbackResult: {
				messageId: "",
				channelId: target
			},
			sendNoMedia: async () => await sendDiscordComponentMessage(target, componentSpec, {
				replyTo: ctx.replyToId ?? void 0,
				accountId: ctx.accountId ?? void 0,
				silent: ctx.silent ?? void 0,
				cfg: ctx.cfg
			}),
			send: async ({ text, mediaUrl, isFirst }) => {
				if (isFirst) return await sendDiscordComponentMessage(target, componentSpec, {
					mediaUrl,
					mediaLocalRoots: ctx.mediaLocalRoots,
					replyTo: ctx.replyToId ?? void 0,
					accountId: ctx.accountId ?? void 0,
					silent: ctx.silent ?? void 0,
					cfg: ctx.cfg
				});
				return await send(target, text, {
					verbose: false,
					mediaUrl,
					mediaLocalRoots: ctx.mediaLocalRoots,
					replyTo: ctx.replyToId ?? void 0,
					accountId: ctx.accountId ?? void 0,
					silent: ctx.silent ?? void 0,
					cfg: ctx.cfg
				});
			}
		}));
	},
	...createAttachedChannelResultAdapter({
		channel: "discord",
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, identity, silent }) => {
			if (!silent) {
				const webhookResult = await maybeSendDiscordWebhookText({
					cfg,
					text,
					threadId,
					accountId,
					identity,
					replyToId
				}).catch(() => null);
				if (webhookResult) return webhookResult;
			}
			return await (resolveOutboundSendDep(deps, "discord") ?? sendMessageDiscord)(resolveDiscordOutboundTarget({
				to,
				threadId
			}), text, {
				verbose: false,
				replyTo: replyToId ?? void 0,
				accountId: accountId ?? void 0,
				silent: silent ?? void 0,
				cfg
			});
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, threadId, silent }) => {
			return await (resolveOutboundSendDep(deps, "discord") ?? sendMessageDiscord)(resolveDiscordOutboundTarget({
				to,
				threadId
			}), text, {
				verbose: false,
				mediaUrl,
				mediaLocalRoots,
				replyTo: replyToId ?? void 0,
				accountId: accountId ?? void 0,
				silent: silent ?? void 0,
				cfg
			});
		},
		sendPoll: async ({ cfg, to, poll, accountId, threadId, silent }) => await sendPollDiscord(resolveDiscordOutboundTarget({
			to,
			threadId
		}), poll, {
			accountId: accountId ?? void 0,
			silent: silent ?? void 0,
			cfg
		})
	})
};
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
function isProcessAborted(abortSignal) {
	return Boolean(abortSignal?.aborted);
}
async function processDiscordMessage(ctx) {
	const { cfg, discordConfig, accountId, token, runtime, guildHistories, historyLimit, mediaMaxBytes, textLimit, replyToMode, ackReactionScope, message, author, sender, data, client, channelInfo, channelName, messageChannelId, isGuildMessage, isDirectMessage, isGroupDm, baseText, messageText, shouldRequireMention, canDetectMention, effectiveWasMentioned, shouldBypassMention, threadChannel, threadParentId, threadParentName, threadParentType, threadName, displayChannelSlug, guildInfo, guildSlug, channelConfig, baseSessionKey, boundSessionKey, threadBindings, route, commandAuthorized, discordRestFetch, abortSignal } = ctx;
	if (isProcessAborted(abortSignal)) return;
	const ssrfPolicy = cfg.browser?.ssrfPolicy;
	const mediaList = await resolveMediaList(message, mediaMaxBytes, discordRestFetch, ssrfPolicy);
	if (isProcessAborted(abortSignal)) return;
	const forwardedMediaList = await resolveForwardedMediaList(message, mediaMaxBytes, discordRestFetch, ssrfPolicy);
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
		baseText: baseText ?? "",
		combinedBody,
		replyToMode,
		agentId: route.agentId,
		channel: route.channel
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
						await editMessageDiscord(deliverChannelId, previewMessageId, { content: previewFinalText }, { rest: client.rest });
						finalizedViaPreviewMessage = true;
						replyReference.markSent();
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
						await editMessageDiscord(deliverChannelId, messageIdAfterStop, { content: previewFinalText }, { rest: client.rest });
						finalizedViaPreviewMessage = true;
						replyReference.markSent();
						return;
					} catch (err) {
						logVerbose(`discord: post-stop preview edit failed; falling back to standard send (${String(err)})`);
					}
				}
				if (!finalizedViaPreviewMessage) await draftStream.clear();
			}
			if (isProcessAborted(abortSignal)) return;
			const replyToId = replyReference.use();
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
	await runDiscordTaskWithTimeout({
		run: async (abortSignal) => {
			await processDiscordMessage(materializeDiscordInboundJob(params.job, abortSignal));
		},
		timeoutMs,
		abortSignals: [params.job.runtime.abortSignal, params.lifecycleSignal],
		onTimeout: (resolvedTimeoutMs) => {
			params.runtime.error?.(danger(`discord inbound worker timed out after ${formatDurationSeconds(resolvedTimeoutMs, {
				decimals: 1,
				unit: "seconds"
			})}${contextSuffix}`));
		},
		onErrorAfterTimeout: (error) => {
			params.runtime.error?.(danger(`discord inbound worker failed after timeout: ${String(error)}${contextSuffix}`));
		}
	});
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
						runTimeoutMs: params.runTimeoutMs
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
//#region extensions/discord/src/monitor/preflight-audio.ts
function collectAudioAttachments(attachments) {
	if (!Array.isArray(attachments)) return [];
	return attachments.filter((att) => att.content_type?.startsWith("audio/"));
}
async function resolveDiscordPreflightAudioMentionContext(params) {
	const audioAttachments = collectAudioAttachments(params.message.attachments);
	const hasAudioAttachment = audioAttachments.length > 0;
	const hasTypedText = Boolean(params.message.content?.trim());
	const needsPreflightTranscription = !params.isDirectMessage && params.shouldRequireMention && hasAudioAttachment && !hasTypedText && params.mentionRegexes.length > 0;
	let transcript;
	if (needsPreflightTranscription) {
		if (params.abortSignal?.aborted) return {
			hasAudioAttachment,
			hasTypedText
		};
		try {
			const { transcribeFirstAudio } = await import("./preflight-audio.runtime-B09o3116.js");
			if (params.abortSignal?.aborted) return {
				hasAudioAttachment,
				hasTypedText
			};
			const audioUrls = audioAttachments.map((att) => att.url).filter((url) => typeof url === "string" && url.length > 0);
			if (audioUrls.length > 0) {
				transcript = await transcribeFirstAudio({
					ctx: {
						MediaUrls: audioUrls,
						MediaTypes: audioAttachments.map((att) => att.content_type).filter((contentType) => Boolean(contentType))
					},
					cfg: params.cfg,
					agentDir: void 0
				});
				if (params.abortSignal?.aborted) transcript = void 0;
			}
		} catch (err) {
			logVerbose(`discord: audio preflight transcription failed: ${String(err)}`);
		}
	}
	return {
		hasAudioAttachment,
		hasTypedText,
		transcript
	};
}
//#endregion
//#region extensions/discord/src/monitor/system-events.ts
function resolveDiscordSystemEvent(message, location) {
	switch (message.type) {
		case MessageType.ChannelPinnedMessage: return buildDiscordSystemEvent(message, location, "pinned a message");
		case MessageType.RecipientAdd: return buildDiscordSystemEvent(message, location, "added a recipient");
		case MessageType.RecipientRemove: return buildDiscordSystemEvent(message, location, "removed a recipient");
		case MessageType.UserJoin: return buildDiscordSystemEvent(message, location, "user joined");
		case MessageType.GuildBoost: return buildDiscordSystemEvent(message, location, "boosted the server");
		case MessageType.GuildBoostTier1: return buildDiscordSystemEvent(message, location, "boosted the server (Tier 1 reached)");
		case MessageType.GuildBoostTier2: return buildDiscordSystemEvent(message, location, "boosted the server (Tier 2 reached)");
		case MessageType.GuildBoostTier3: return buildDiscordSystemEvent(message, location, "boosted the server (Tier 3 reached)");
		case MessageType.ThreadCreated: return buildDiscordSystemEvent(message, location, "created a thread");
		case MessageType.AutoModerationAction: return buildDiscordSystemEvent(message, location, "auto moderation action");
		case MessageType.GuildIncidentAlertModeEnabled: return buildDiscordSystemEvent(message, location, "raid protection enabled");
		case MessageType.GuildIncidentAlertModeDisabled: return buildDiscordSystemEvent(message, location, "raid protection disabled");
		case MessageType.GuildIncidentReportRaid: return buildDiscordSystemEvent(message, location, "raid reported");
		case MessageType.GuildIncidentReportFalseAlarm: return buildDiscordSystemEvent(message, location, "raid report marked false alarm");
		case MessageType.StageStart: return buildDiscordSystemEvent(message, location, "stage started");
		case MessageType.StageEnd: return buildDiscordSystemEvent(message, location, "stage ended");
		case MessageType.StageSpeaker: return buildDiscordSystemEvent(message, location, "stage speaker updated");
		case MessageType.StageTopic: return buildDiscordSystemEvent(message, location, "stage topic updated");
		case MessageType.PollResult: return buildDiscordSystemEvent(message, location, "poll results posted");
		case MessageType.PurchaseNotification: return buildDiscordSystemEvent(message, location, "purchase notification");
		default: return null;
	}
}
function buildDiscordSystemEvent(message, location, action) {
	const authorLabel = message.author ? formatDiscordUserTag(message.author) : "";
	return `Discord system: ${authorLabel ? `${authorLabel} ` : ""}${action} in ${location}`;
}
//#endregion
//#region extensions/discord/src/monitor/message-handler.preflight.ts
const DISCORD_BOUND_THREAD_SYSTEM_PREFIXES = [
	"⚙️",
	"🤖",
	"🧰"
];
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
						await sendMessageDiscord(`user:${author.id}`, buildPairingReply({
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
	threadBinding = getSessionBindingService().resolveByConversation({
		channel: "discord",
		accountId: params.accountId,
		conversationId: bindingConversationId,
		parentConversationId: earlyThreadParentId
	}) ?? void 0;
	const configuredRoute = threadBinding == null ? resolveConfiguredBindingRoute({
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
	const boundSessionKey = isPluginOwnedSessionBindingRecord(threadBinding) ? "" : threadBinding?.targetSessionKey?.trim();
	const effectiveRoute = resolveDiscordEffectiveRoute({
		route,
		boundSessionKey,
		configuredRoute,
		matchedBy: "binding.channel"
	});
	const boundAgentId = boundSessionKey ? effectiveRoute.agentId : void 0;
	const isBoundThreadSession = Boolean(threadBinding && earlyThreadChannel);
	const bypassMentionRequirement = isBoundThreadSession || Boolean(configuredBinding);
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
	const { hasAccessRestrictions, memberAllowed } = resolveDiscordMemberAccessState({
		channelConfig,
		guildInfo,
		memberRoleIds,
		sender,
		allowNameMatching
	});
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
	if (isGuildMessage && hasAccessRestrictions && !memberAllowed) {
		logDebug(`[discord-preflight] drop: member not allowed`);
		logVerbose(`Blocked discord guild sender ${sender.id} (not in users/roles allowlist)`);
		return null;
	}
	const systemLocation = resolveDiscordSystemLocation({
		isDirectMessage,
		isGroupDm,
		guild: params.data.guild ?? void 0,
		channelName: channelName ?? messageChannelId
	});
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
		const ensured = await ensureConfiguredBindingRouteReady({
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
	const inboundWorker = createDiscordInboundWorker({
		runtime: params.runtime,
		setStatus: params.setStatus,
		abortSignal: params.abortSignal,
		runTimeoutMs: params.workerRunTimeoutMs
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
				const ctx = await preflightDiscordMessage({
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
			const ctx = await preflightDiscordMessage({
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
