import { d as resolveThreadSessionKeys, f as sanitizeAgentId, r as buildAgentMainSessionKey, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose } from "./globals-BJZkpw-q.js";
import { r as getSessionBindingService } from "./session-binding-service-CAxmjUEJ.js";
import { u as isPluginOwnedSessionBindingRecord } from "./conversation-binding-oQzcUiHT.js";
import { t as resolveAckReaction } from "./identity-BVAU5Jb3.js";
import { i as resolveAgentRoute, n as deriveLastRoutePolicy, t as buildAgentSessionKey } from "./resolve-route-DID7K3Jm.js";
import { p as normalizeCommandBody } from "./commands-registry-dA2_ExHR.js";
import "./routing-Br1fEo8A.js";
import { t as hasControlCommand } from "./command-detection-Bz_HOEgu.js";
import { a as resolveEnvelopeFormatOptions, r as formatInboundEnvelope } from "./envelope-CTj2Ympv.js";
import { i as matchesMentionWithExplicit, n as buildMentionRegexes } from "./mentions-Bfkn0E5p.js";
import { n as shouldAckReaction } from "./ack-reactions-cTTW0IRo.js";
import { n as resolveControlCommandGate } from "./command-gating-Ch_OhMao.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { t as firstDefined } from "./allow-from-B0YDSOuL.js";
import { a as buildPendingHistoryContextFromMap, u as recordPendingHistoryEntryIfEnabled } from "./history-5RBVRj2e.js";
import "./reply-history-D4cGNH0x.js";
import "./runtime-env-CoykX19-.js";
import { i as resolveConfiguredBindingRoute } from "./conversation-runtime-DIsQmaYR.js";
import "./agent-runtime-B7ucOTD-.js";
import { n as logInboundDrop } from "./logging-N7W67_op.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import "./command-auth-native-m2se5Aky.js";
import "./command-detection-CmLKK9NS.js";
import "./command-surface-oDSqSOMi.js";
import { n as DEFAULT_EMOJIS } from "./channel-feedback-CeI9SuZx.js";
import "./channel-inbound-BTUonbdp.js";
import { n as resolveMentionGatingWithBypass } from "./mention-gating-DzHPTjeG.js";
import { n as toLocationContext, t as formatLocationText } from "./location-ZVNxeZlc.js";
import { A as hasBotMention, C as resolveTelegramThreadSpec, D as expandTextLinks, E as buildSenderName, I as isSenderAllowed, L as normalizeAllowFrom, M as resolveTelegramMediaPlaceholder, O as extractTelegramLocation, R as normalizeDmAllowFromWithStore, T as buildSenderLabel, _ as resolveTelegramDirectPeerId, c as buildGroupLabel, d as buildTelegramParentPeer, g as extractTelegramForumFlag, h as describeReplyTarget, i as renderTelegramHtmlText, j as normalizeForwardedContext, k as getTelegramTextParts, l as buildTelegramGroupFrom, m as buildTypingThreadParams, s as withTelegramApiErrorLogging, u as buildTelegramGroupPeerId, v as resolveTelegramForumFlag, z as resolveSenderAllowMatch } from "./format-DqAjfaGj.js";
import { t as evaluateTelegramGroupBaseAccess } from "./group-access-Cggb-vdS.js";
//#region extensions/telegram/src/forum-service-message.ts
/** Telegram forum-topic service-message fields (Bot API). */
const TELEGRAM_FORUM_SERVICE_FIELDS = [
	"forum_topic_created",
	"forum_topic_edited",
	"forum_topic_closed",
	"forum_topic_reopened",
	"general_forum_topic_hidden",
	"general_forum_topic_unhidden"
];
/**
* Returns `true` when the message is a Telegram forum service message (e.g.
* "Topic created"). These auto-generated messages carry one of the
* `forum_topic_*` / `general_forum_topic_*` fields and should not count as
* regular bot replies for implicit-mention purposes.
*/
function isTelegramForumServiceMessage(msg) {
	if (!msg || typeof msg !== "object") return false;
	const messageRecord = msg;
	return TELEGRAM_FORUM_SERVICE_FIELDS.some((field) => field in messageRecord && messageRecord[field] != null);
}
//#endregion
//#region extensions/telegram/src/bot-message-context.body.ts
async function resolveStickerVisionSupport(params) {
	try {
		const { resolveStickerVisionSupportRuntime } = await import("./sticker-vision.runtime-Ba9_7JJs.js");
		return await resolveStickerVisionSupportRuntime(params);
	} catch {
		return false;
	}
}
async function resolveTelegramInboundBody(params) {
	const { cfg, primaryCtx, msg, allMedia, isGroup, chatId, senderId, senderUsername, resolvedThreadId, routeAgentId, effectiveGroupAllow, effectiveDmAllow, groupConfig, topicConfig, requireMention, options, groupHistories, historyLimit, logger } = params;
	const botUsername = primaryCtx.me?.username?.toLowerCase();
	const mentionRegexes = buildMentionRegexes(cfg, routeAgentId);
	const messageTextParts = getTelegramTextParts(msg);
	const allowForCommands = isGroup ? effectiveGroupAllow : effectiveDmAllow;
	const senderAllowedForCommands = isSenderAllowed({
		allow: allowForCommands,
		senderId,
		senderUsername
	});
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const hasControlCommandInMessage = hasControlCommand(messageTextParts.text, cfg, { botUsername });
	const commandGate = resolveControlCommandGate({
		useAccessGroups,
		authorizers: [{
			configured: allowForCommands.hasEntries,
			allowed: senderAllowedForCommands
		}],
		allowTextCommands: true,
		hasControlCommand: hasControlCommandInMessage
	});
	const commandAuthorized = commandGate.commandAuthorized;
	const historyKey = isGroup ? buildTelegramGroupPeerId(chatId, resolvedThreadId) : void 0;
	let placeholder = resolveTelegramMediaPlaceholder(msg) ?? "";
	const cachedStickerDescription = allMedia[0]?.stickerMetadata?.cachedDescription;
	const stickerSupportsVision = msg.sticker ? await resolveStickerVisionSupport({
		cfg,
		agentId: routeAgentId
	}) : false;
	const stickerCacheHit = Boolean(cachedStickerDescription) && !stickerSupportsVision;
	if (stickerCacheHit) {
		const emoji = allMedia[0]?.stickerMetadata?.emoji;
		const setName = allMedia[0]?.stickerMetadata?.setName;
		const stickerContext = [emoji, setName ? `from "${setName}"` : null].filter(Boolean).join(" ");
		placeholder = `[Sticker${stickerContext ? ` ${stickerContext}` : ""}] ${cachedStickerDescription}`;
	}
	const locationData = extractTelegramLocation(msg);
	const locationText = locationData ? formatLocationText(locationData) : void 0;
	const rawText = expandTextLinks(messageTextParts.text, messageTextParts.entities).trim();
	const hasUserText = Boolean(rawText || locationText);
	let rawBody = [rawText, locationText].filter(Boolean).join("\n").trim();
	if (!rawBody) rawBody = placeholder;
	if (!rawBody && allMedia.length === 0) return null;
	let bodyText = rawBody;
	const hasAudio = allMedia.some((media) => media.contentType?.startsWith("audio/"));
	const disableAudioPreflight = (topicConfig?.disableAudioPreflight ?? groupConfig?.disableAudioPreflight) === true;
	const senderAllowedForAudioPreflight = !useAccessGroups || !allowForCommands.hasEntries || senderAllowedForCommands;
	let preflightTranscript;
	if (isGroup && requireMention && hasAudio && !hasUserText && mentionRegexes.length > 0 && !disableAudioPreflight && senderAllowedForAudioPreflight) try {
		const { transcribeFirstAudio } = await import("./media-understanding.runtime-Do94PAOJ.js");
		preflightTranscript = await transcribeFirstAudio({
			ctx: {
				MediaPaths: allMedia.length > 0 ? allMedia.map((m) => m.path) : void 0,
				MediaTypes: allMedia.length > 0 ? allMedia.map((m) => m.contentType).filter(Boolean) : void 0
			},
			cfg,
			agentDir: void 0
		});
	} catch (err) {
		logVerbose(`telegram: audio preflight transcription failed: ${String(err)}`);
	}
	if (hasAudio && bodyText === "<media:audio>" && preflightTranscript) bodyText = preflightTranscript;
	if (!bodyText && allMedia.length > 0) if (hasAudio) bodyText = preflightTranscript || "<media:audio>";
	else bodyText = `<media:image>${allMedia.length > 1 ? ` (${allMedia.length} images)` : ""}`;
	const hasAnyMention = messageTextParts.entities.some((ent) => ent.type === "mention");
	const explicitlyMentioned = botUsername ? hasBotMention(msg, botUsername) : false;
	const computedWasMentioned = matchesMentionWithExplicit({
		text: messageTextParts.text,
		mentionRegexes,
		explicit: {
			hasAnyMention,
			isExplicitlyMentioned: explicitlyMentioned,
			canResolveExplicit: Boolean(botUsername)
		},
		transcript: preflightTranscript
	});
	const wasMentioned = options?.forceWasMentioned === true ? true : computedWasMentioned;
	if (isGroup && commandGate.shouldBlock) {
		logInboundDrop({
			log: logVerbose,
			channel: "telegram",
			reason: "control command (unauthorized)",
			target: senderId ?? "unknown"
		});
		return null;
	}
	const botId = primaryCtx.me?.id;
	const replyFromId = msg.reply_to_message?.from?.id;
	const replyToBotMessage = botId != null && replyFromId === botId;
	const isReplyToServiceMessage = replyToBotMessage && isTelegramForumServiceMessage(msg.reply_to_message);
	const implicitMention = replyToBotMessage && !isReplyToServiceMessage;
	const canDetectMention = Boolean(botUsername) || mentionRegexes.length > 0;
	const mentionGate = resolveMentionGatingWithBypass({
		isGroup,
		requireMention: Boolean(requireMention),
		canDetectMention,
		wasMentioned,
		implicitMention: isGroup && Boolean(requireMention) && implicitMention,
		hasAnyMention,
		allowTextCommands: true,
		hasControlCommand: hasControlCommandInMessage,
		commandAuthorized
	});
	const effectiveWasMentioned = mentionGate.effectiveWasMentioned;
	if (isGroup && requireMention && canDetectMention && mentionGate.shouldSkip) {
		logger.info({
			chatId,
			reason: "no-mention"
		}, "skipping group message");
		recordPendingHistoryEntryIfEnabled({
			historyMap: groupHistories,
			historyKey: historyKey ?? "",
			limit: historyLimit,
			entry: historyKey ? {
				sender: buildSenderLabel(msg, senderId || chatId),
				body: rawBody,
				timestamp: msg.date ? msg.date * 1e3 : void 0,
				messageId: typeof msg.message_id === "number" ? String(msg.message_id) : void 0
			} : null
		});
		return null;
	}
	return {
		bodyText,
		rawBody,
		historyKey,
		commandAuthorized,
		effectiveWasMentioned,
		canDetectMention,
		shouldBypassMention: mentionGate.shouldBypassMention,
		stickerCacheHit,
		locationData: locationData ?? void 0
	};
}
//#endregion
//#region extensions/telegram/src/group-config-helpers.ts
function resolveTelegramGroupPromptSettings(params) {
	const skillFilter = firstDefined(params.topicConfig?.skills, params.groupConfig?.skills);
	const systemPromptParts = [params.groupConfig?.systemPrompt?.trim() || null, params.topicConfig?.systemPrompt?.trim() || null].filter((entry) => Boolean(entry));
	return {
		skillFilter,
		groupSystemPrompt: systemPromptParts.length > 0 ? systemPromptParts.join("\n\n") : void 0
	};
}
//#endregion
//#region extensions/telegram/src/bot-message-context.session.ts
async function buildTelegramInboundContextPayload(params) {
	const { cfg, primaryCtx, msg, allMedia, replyMedia, isGroup, isForum, chatId, senderId, senderUsername, resolvedThreadId, dmThreadId, threadSpec, route, rawBody, bodyText, historyKey, historyLimit, groupHistories, groupConfig, topicConfig, stickerCacheHit, effectiveWasMentioned, commandAuthorized, locationData, options, dmAllowFrom } = params;
	const replyTarget = describeReplyTarget(msg);
	const forwardOrigin = normalizeForwardedContext(msg);
	const replyForwardAnnotation = replyTarget?.forwardedFrom ? `[Forwarded from ${replyTarget.forwardedFrom.from}${replyTarget.forwardedFrom.date ? ` at ${(/* @__PURE__ */ new Date(replyTarget.forwardedFrom.date * 1e3)).toISOString()}` : ""}]\n` : "";
	const replySuffix = replyTarget ? replyTarget.kind === "quote" ? `\n\n[Quoting ${replyTarget.sender}${replyTarget.id ? ` id:${replyTarget.id}` : ""}]\n${replyForwardAnnotation}"${replyTarget.body}"\n[/Quoting]` : `\n\n[Replying to ${replyTarget.sender}${replyTarget.id ? ` id:${replyTarget.id}` : ""}]\n${replyForwardAnnotation}${replyTarget.body}\n[/Replying]` : "";
	const forwardPrefix = forwardOrigin ? `[Forwarded from ${forwardOrigin.from}${forwardOrigin.date ? ` at ${(/* @__PURE__ */ new Date(forwardOrigin.date * 1e3)).toISOString()}` : ""}]\n` : "";
	const groupLabel = isGroup ? buildGroupLabel(msg, chatId, resolvedThreadId) : void 0;
	const senderName = buildSenderName(msg);
	const conversationLabel = isGroup ? groupLabel ?? `group:${chatId}` : buildSenderLabel(msg, senderId || chatId);
	const sessionRuntime = await import("./bot-message-context.session.runtime-BR_Lwefy.js");
	const storePath = sessionRuntime.resolveStorePath(cfg.session?.store, { agentId: route.agentId });
	const envelopeOptions = resolveEnvelopeFormatOptions(cfg);
	const previousTimestamp = sessionRuntime.readSessionUpdatedAt({
		storePath,
		sessionKey: route.sessionKey
	});
	const body = formatInboundEnvelope({
		channel: "Telegram",
		from: conversationLabel,
		timestamp: msg.date ? msg.date * 1e3 : void 0,
		body: `${forwardPrefix}${bodyText}${replySuffix}`,
		chatType: isGroup ? "group" : "direct",
		sender: {
			name: senderName,
			username: senderUsername || void 0,
			id: senderId || void 0
		},
		previousTimestamp,
		envelope: envelopeOptions
	});
	let combinedBody = body;
	if (isGroup && historyKey && historyLimit > 0) combinedBody = buildPendingHistoryContextFromMap({
		historyMap: groupHistories,
		historyKey,
		limit: historyLimit,
		currentMessage: combinedBody,
		formatEntry: (entry) => formatInboundEnvelope({
			channel: "Telegram",
			from: groupLabel ?? `group:${chatId}`,
			timestamp: entry.timestamp,
			body: `${entry.body} [id:${entry.messageId ?? "unknown"} chat:${chatId}]`,
			chatType: "group",
			senderLabel: entry.sender,
			envelope: envelopeOptions
		})
	});
	const { skillFilter, groupSystemPrompt } = resolveTelegramGroupPromptSettings({
		groupConfig,
		topicConfig
	});
	const commandBody = normalizeCommandBody(rawBody, { botUsername: primaryCtx.me?.username?.toLowerCase() });
	const inboundHistory = isGroup && historyKey && historyLimit > 0 ? (groupHistories.get(historyKey) ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
	const contextMedia = [...stickerCacheHit ? [] : allMedia, ...replyMedia];
	const ctxPayload = sessionRuntime.finalizeInboundContext({
		Body: combinedBody,
		BodyForAgent: bodyText,
		InboundHistory: inboundHistory,
		RawBody: rawBody,
		CommandBody: commandBody,
		From: isGroup ? buildTelegramGroupFrom(chatId, resolvedThreadId) : `telegram:${chatId}`,
		To: `telegram:${chatId}`,
		SessionKey: route.sessionKey,
		AccountId: route.accountId,
		ChatType: isGroup ? "group" : "direct",
		ConversationLabel: conversationLabel,
		GroupSubject: isGroup ? msg.chat.title ?? void 0 : void 0,
		GroupSystemPrompt: isGroup || !isGroup && groupConfig ? groupSystemPrompt : void 0,
		SenderName: senderName,
		SenderId: senderId || void 0,
		SenderUsername: senderUsername || void 0,
		Provider: "telegram",
		Surface: "telegram",
		BotUsername: primaryCtx.me?.username ?? void 0,
		MessageSid: options?.messageIdOverride ?? String(msg.message_id),
		ReplyToId: replyTarget?.id,
		ReplyToBody: replyTarget?.body,
		ReplyToSender: replyTarget?.sender,
		ReplyToIsQuote: replyTarget?.kind === "quote" ? true : void 0,
		ReplyToForwardedFrom: replyTarget?.forwardedFrom?.from,
		ReplyToForwardedFromType: replyTarget?.forwardedFrom?.fromType,
		ReplyToForwardedFromId: replyTarget?.forwardedFrom?.fromId,
		ReplyToForwardedFromUsername: replyTarget?.forwardedFrom?.fromUsername,
		ReplyToForwardedFromTitle: replyTarget?.forwardedFrom?.fromTitle,
		ReplyToForwardedDate: replyTarget?.forwardedFrom?.date ? replyTarget.forwardedFrom.date * 1e3 : void 0,
		ForwardedFrom: forwardOrigin?.from,
		ForwardedFromType: forwardOrigin?.fromType,
		ForwardedFromId: forwardOrigin?.fromId,
		ForwardedFromUsername: forwardOrigin?.fromUsername,
		ForwardedFromTitle: forwardOrigin?.fromTitle,
		ForwardedFromSignature: forwardOrigin?.fromSignature,
		ForwardedFromChatType: forwardOrigin?.fromChatType,
		ForwardedFromMessageId: forwardOrigin?.fromMessageId,
		ForwardedDate: forwardOrigin?.date ? forwardOrigin.date * 1e3 : void 0,
		Timestamp: msg.date ? msg.date * 1e3 : void 0,
		WasMentioned: isGroup ? effectiveWasMentioned : void 0,
		MediaPath: contextMedia.length > 0 ? contextMedia[0]?.path : void 0,
		MediaType: contextMedia.length > 0 ? contextMedia[0]?.contentType : void 0,
		MediaUrl: contextMedia.length > 0 ? contextMedia[0]?.path : void 0,
		MediaPaths: contextMedia.length > 0 ? contextMedia.map((m) => m.path) : void 0,
		MediaUrls: contextMedia.length > 0 ? contextMedia.map((m) => m.path) : void 0,
		MediaTypes: contextMedia.length > 0 ? contextMedia.map((m) => m.contentType).filter(Boolean) : void 0,
		Sticker: allMedia[0]?.stickerMetadata,
		StickerMediaIncluded: allMedia[0]?.stickerMetadata ? !stickerCacheHit : void 0,
		...locationData ? toLocationContext(locationData) : void 0,
		CommandAuthorized: commandAuthorized,
		CommandSource: options?.commandSource,
		MessageThreadId: threadSpec.id,
		IsForum: isForum,
		OriginatingChannel: "telegram",
		OriginatingTo: `telegram:${chatId}`
	});
	const pinnedMainDmOwner = !isGroup ? sessionRuntime.resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: cfg.session?.dmScope,
		allowFrom: dmAllowFrom,
		normalizeEntry: (entry) => normalizeAllowFrom([entry]).entries[0]
	}) : null;
	const updateLastRouteSessionKey = sessionRuntime.resolveInboundLastRouteSessionKey({
		route,
		sessionKey: route.sessionKey
	});
	const shouldPersistGroupLastRouteThread = isGroup && route.matchedBy !== "binding.channel";
	const updateLastRouteThreadId = isGroup ? shouldPersistGroupLastRouteThread && resolvedThreadId != null ? String(resolvedThreadId) : void 0 : dmThreadId != null ? String(dmThreadId) : void 0;
	await sessionRuntime.recordInboundSession({
		storePath,
		sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
		ctx: ctxPayload,
		updateLastRoute: !isGroup || updateLastRouteThreadId != null ? {
			sessionKey: updateLastRouteSessionKey,
			channel: "telegram",
			to: isGroup && updateLastRouteThreadId != null ? `telegram:${chatId}:topic:${updateLastRouteThreadId}` : `telegram:${chatId}`,
			accountId: route.accountId,
			threadId: updateLastRouteThreadId,
			mainDmOwnerPin: !isGroup && updateLastRouteSessionKey === route.mainSessionKey && pinnedMainDmOwner && senderId ? {
				ownerRecipient: pinnedMainDmOwner,
				senderRecipient: senderId,
				onSkip: ({ ownerRecipient, senderRecipient }) => {
					logVerbose(`telegram: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
				}
			} : void 0
		} : void 0,
		onRecordError: (err) => {
			logVerbose(`telegram: failed updating session meta: ${String(err)}`);
		}
	});
	if (replyTarget && shouldLogVerbose()) {
		const preview = replyTarget.body.replace(/\s+/g, " ").slice(0, 120);
		logVerbose(`telegram reply-context: replyToId=${replyTarget.id} replyToSender=${replyTarget.sender} replyToBody="${preview}"`);
	}
	if (forwardOrigin && shouldLogVerbose()) logVerbose(`telegram forward-context: forwardedFrom="${forwardOrigin.from}" type=${forwardOrigin.fromType}`);
	if (shouldLogVerbose()) {
		const preview = body.slice(0, 200).replace(/\n/g, "\\n");
		const mediaInfo = allMedia.length > 1 ? ` mediaCount=${allMedia.length}` : "";
		const topicInfo = resolvedThreadId != null ? ` topic=${resolvedThreadId}` : "";
		logVerbose(`telegram inbound: chatId=${chatId} from=${ctxPayload.From} len=${body.length}${mediaInfo}${topicInfo} preview="${preview}"`);
	}
	return {
		ctxPayload,
		skillFilter
	};
}
//#endregion
//#region extensions/telegram/src/conversation-route.ts
function resolveTelegramConversationRoute(params) {
	const peerId = params.isGroup ? buildTelegramGroupPeerId(params.chatId, params.resolvedThreadId) : resolveTelegramDirectPeerId({
		chatId: params.chatId,
		senderId: params.senderId
	});
	const parentPeer = buildTelegramParentPeer({
		isGroup: params.isGroup,
		resolvedThreadId: params.resolvedThreadId,
		chatId: params.chatId
	});
	let route = resolveAgentRoute({
		cfg: params.cfg,
		channel: "telegram",
		accountId: params.accountId,
		peer: {
			kind: params.isGroup ? "group" : "direct",
			id: peerId
		},
		parentPeer
	});
	const rawTopicAgentId = params.topicAgentId?.trim();
	if (rawTopicAgentId) {
		const topicAgentId = sanitizeAgentId(rawTopicAgentId);
		route = {
			...route,
			agentId: topicAgentId,
			sessionKey: buildAgentSessionKey({
				agentId: topicAgentId,
				channel: "telegram",
				accountId: params.accountId,
				peer: {
					kind: params.isGroup ? "group" : "direct",
					id: peerId
				},
				dmScope: params.cfg.session?.dmScope,
				identityLinks: params.cfg.session?.identityLinks
			}).toLowerCase(),
			mainSessionKey: buildAgentMainSessionKey({ agentId: topicAgentId }).toLowerCase(),
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: buildAgentSessionKey({
					agentId: topicAgentId,
					channel: "telegram",
					accountId: params.accountId,
					peer: {
						kind: params.isGroup ? "group" : "direct",
						id: peerId
					},
					dmScope: params.cfg.session?.dmScope,
					identityLinks: params.cfg.session?.identityLinks
				}).toLowerCase(),
				mainSessionKey: buildAgentMainSessionKey({ agentId: topicAgentId }).toLowerCase()
			})
		};
		logVerbose(`telegram: topic route override: topic=${params.resolvedThreadId ?? params.replyThreadId} agent=${topicAgentId} sessionKey=${route.sessionKey}`);
	}
	const configuredRoute = resolveConfiguredBindingRoute({
		cfg: params.cfg,
		route,
		conversation: {
			channel: "telegram",
			accountId: params.accountId,
			conversationId: peerId,
			parentConversationId: params.isGroup ? String(params.chatId) : void 0
		}
	});
	let configuredBinding = configuredRoute.bindingResolution;
	let configuredBindingSessionKey = configuredRoute.boundSessionKey ?? "";
	route = configuredRoute.route;
	const threadBindingConversationId = params.replyThreadId != null ? `${params.chatId}:topic:${params.replyThreadId}` : !params.isGroup ? String(params.chatId) : void 0;
	if (threadBindingConversationId) {
		const threadBinding = getSessionBindingService().resolveByConversation({
			channel: "telegram",
			accountId: params.accountId,
			conversationId: threadBindingConversationId
		});
		const boundSessionKey = threadBinding?.targetSessionKey?.trim();
		if (threadBinding && boundSessionKey) {
			if (!isPluginOwnedSessionBindingRecord(threadBinding)) route = {
				...route,
				sessionKey: boundSessionKey,
				agentId: resolveAgentIdFromSessionKey(boundSessionKey),
				lastRoutePolicy: deriveLastRoutePolicy({
					sessionKey: boundSessionKey,
					mainSessionKey: route.mainSessionKey
				}),
				matchedBy: "binding.channel"
			};
			configuredBinding = null;
			configuredBindingSessionKey = "";
			getSessionBindingService().touch(threadBinding.bindingId);
			logVerbose(isPluginOwnedSessionBindingRecord(threadBinding) ? `telegram: plugin-bound conversation ${threadBindingConversationId}` : `telegram: routed via bound conversation ${threadBindingConversationId} -> ${boundSessionKey}`);
		}
	}
	return {
		route,
		configuredBinding,
		configuredBindingSessionKey
	};
}
function resolveTelegramConversationBaseSessionKey(params) {
	if (!(params.route.accountId !== "default" && params.route.matchedBy === "default") || params.isGroup) return params.route.sessionKey;
	return buildAgentSessionKey({
		agentId: params.route.agentId,
		channel: "telegram",
		accountId: params.route.accountId,
		peer: {
			kind: "direct",
			id: resolveTelegramDirectPeerId({
				chatId: params.chatId,
				senderId: params.senderId
			})
		},
		dmScope: "per-account-channel-peer",
		identityLinks: params.cfg.session?.identityLinks
	}).toLowerCase();
}
//#endregion
//#region extensions/telegram/src/dm-access.ts
function resolveTelegramSenderIdentity(msg, chatId) {
	const from = msg.from;
	const userId = from?.id != null ? String(from.id) : null;
	return {
		username: from?.username ?? "",
		userId,
		candidateId: userId ?? String(chatId),
		firstName: from?.first_name,
		lastName: from?.last_name
	};
}
async function enforceTelegramDmAccess(params) {
	const { isGroup, dmPolicy, msg, chatId, effectiveDmAllow, accountId, bot, logger, upsertPairingRequest } = params;
	if (isGroup) return true;
	if (dmPolicy === "disabled") return false;
	if (dmPolicy === "open") return true;
	const sender = resolveTelegramSenderIdentity(msg, chatId);
	const allowMatch = resolveSenderAllowMatch({
		allow: effectiveDmAllow,
		senderId: sender.candidateId,
		senderUsername: sender.username
	});
	const allowMatchMeta = `matchKey=${allowMatch.matchKey ?? "none"} matchSource=${allowMatch.matchSource ?? "none"}`;
	if (effectiveDmAllow.hasWildcard || effectiveDmAllow.hasEntries && allowMatch.allowed) return true;
	if (dmPolicy === "pairing") {
		try {
			const telegramUserId = sender.userId ?? sender.candidateId;
			await createChannelPairingChallengeIssuer({
				channel: "telegram",
				upsertPairingRequest: async ({ id, meta }) => await (upsertPairingRequest ?? upsertChannelPairingRequest)({
					channel: "telegram",
					id,
					accountId,
					meta
				})
			})({
				senderId: telegramUserId,
				senderIdLine: `Your Telegram user id: ${telegramUserId}`,
				meta: {
					username: sender.username || void 0,
					firstName: sender.firstName,
					lastName: sender.lastName
				},
				onCreated: () => {
					logger.info({
						chatId: String(chatId),
						senderUserId: sender.userId ?? void 0,
						username: sender.username || void 0,
						firstName: sender.firstName,
						lastName: sender.lastName,
						matchKey: allowMatch.matchKey ?? "none",
						matchSource: allowMatch.matchSource ?? "none"
					}, "telegram pairing request");
				},
				sendPairingReply: async (text) => {
					const html = renderTelegramHtmlText(text);
					await withTelegramApiErrorLogging({
						operation: "sendMessage",
						fn: () => bot.api.sendMessage(chatId, html, { parse_mode: "HTML" })
					});
				},
				onReplyError: (err) => {
					logVerbose(`telegram pairing reply failed for chat ${chatId}: ${String(err)}`);
				}
			});
		} catch (err) {
			logVerbose(`telegram pairing reply failed for chat ${chatId}: ${String(err)}`);
		}
		return false;
	}
	logVerbose(`Blocked unauthorized telegram sender ${sender.candidateId} (dmPolicy=${dmPolicy}, ${allowMatchMeta})`);
	return false;
}
//#endregion
//#region extensions/telegram/src/status-reaction-variants.ts
const TELEGRAM_GENERIC_REACTION_FALLBACKS = [
	"👍",
	"👀",
	"🔥"
];
const TELEGRAM_SUPPORTED_REACTION_EMOJIS = new Set([
	"❤",
	"👍",
	"👎",
	"🔥",
	"🥰",
	"👏",
	"😁",
	"🤔",
	"🤯",
	"😱",
	"🤬",
	"😢",
	"🎉",
	"🤩",
	"🤮",
	"💩",
	"🙏",
	"👌",
	"🕊",
	"🤡",
	"🥱",
	"🥴",
	"😍",
	"🐳",
	"❤‍🔥",
	"🌚",
	"🌭",
	"💯",
	"🤣",
	"⚡",
	"🍌",
	"🏆",
	"💔",
	"🤨",
	"😐",
	"🍓",
	"🍾",
	"💋",
	"🖕",
	"😈",
	"😴",
	"😭",
	"🤓",
	"👻",
	"👨‍💻",
	"👀",
	"🎃",
	"🙈",
	"😇",
	"😨",
	"🤝",
	"✍",
	"🤗",
	"🫡",
	"🎅",
	"🎄",
	"☃",
	"💅",
	"🤪",
	"🗿",
	"🆒",
	"💘",
	"🙉",
	"🦄",
	"😘",
	"💊",
	"🙊",
	"😎",
	"👾",
	"🤷‍♂",
	"🤷",
	"🤷‍♀",
	"😡"
]);
const TELEGRAM_STATUS_REACTION_VARIANTS = {
	queued: [
		"👀",
		"👍",
		"🔥"
	],
	thinking: [
		"🤔",
		"🤓",
		"👀"
	],
	tool: [
		"🔥",
		"⚡",
		"👍"
	],
	coding: [
		"👨‍💻",
		"🔥",
		"⚡"
	],
	web: [
		"⚡",
		"🔥",
		"👍"
	],
	done: [
		"👍",
		"🎉",
		"💯"
	],
	error: [
		"😱",
		"😨",
		"🤯"
	],
	stallSoft: [
		"🥱",
		"😴",
		"🤔"
	],
	stallHard: [
		"😨",
		"😱",
		"⚡"
	],
	compacting: [
		"✍",
		"🤔",
		"🤯"
	]
};
const STATUS_REACTION_EMOJI_KEYS = [
	"queued",
	"thinking",
	"tool",
	"coding",
	"web",
	"done",
	"error",
	"stallSoft",
	"stallHard",
	"compacting"
];
function normalizeEmoji(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function toUniqueNonEmpty(values) {
	return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
function resolveTelegramStatusReactionEmojis(params) {
	const { overrides } = params;
	const queuedFallback = normalizeEmoji(params.initialEmoji) ?? DEFAULT_EMOJIS.queued;
	return {
		queued: normalizeEmoji(overrides?.queued) ?? queuedFallback,
		thinking: normalizeEmoji(overrides?.thinking) ?? DEFAULT_EMOJIS.thinking,
		tool: normalizeEmoji(overrides?.tool) ?? DEFAULT_EMOJIS.tool,
		coding: normalizeEmoji(overrides?.coding) ?? DEFAULT_EMOJIS.coding,
		web: normalizeEmoji(overrides?.web) ?? DEFAULT_EMOJIS.web,
		done: normalizeEmoji(overrides?.done) ?? DEFAULT_EMOJIS.done,
		error: normalizeEmoji(overrides?.error) ?? DEFAULT_EMOJIS.error,
		stallSoft: normalizeEmoji(overrides?.stallSoft) ?? DEFAULT_EMOJIS.stallSoft,
		stallHard: normalizeEmoji(overrides?.stallHard) ?? DEFAULT_EMOJIS.stallHard,
		compacting: normalizeEmoji(overrides?.compacting) ?? DEFAULT_EMOJIS.compacting
	};
}
function buildTelegramStatusReactionVariants(emojis) {
	const variantsByRequested = /* @__PURE__ */ new Map();
	for (const key of STATUS_REACTION_EMOJI_KEYS) {
		const requested = normalizeEmoji(emojis[key]);
		if (!requested) continue;
		const candidates = toUniqueNonEmpty([requested, ...TELEGRAM_STATUS_REACTION_VARIANTS[key] ?? []]);
		variantsByRequested.set(requested, candidates);
	}
	return variantsByRequested;
}
function isTelegramSupportedReactionEmoji(emoji) {
	return TELEGRAM_SUPPORTED_REACTION_EMOJIS.has(emoji);
}
function extractTelegramAllowedEmojiReactions(chat) {
	if (!chat) return;
	const availableReactions = chat.available_reactions;
	if (typeof availableReactions === "undefined") return;
	if (availableReactions == null) return null;
	if (!Array.isArray(availableReactions)) return /* @__PURE__ */ new Set();
	const allowed = /* @__PURE__ */ new Set();
	for (const reaction of availableReactions) {
		if (reaction.type !== "emoji") continue;
		const emoji = reaction.emoji.trim();
		if (emoji && isTelegramSupportedReactionEmoji(emoji)) allowed.add(emoji);
	}
	return allowed;
}
async function resolveTelegramAllowedEmojiReactions(params) {
	const fromMessage = extractTelegramAllowedEmojiReactions(params.chat);
	if (fromMessage !== void 0) return fromMessage;
	if (params.getChat) try {
		const fromLookup = extractTelegramAllowedEmojiReactions(await params.getChat(params.chatId));
		if (fromLookup !== void 0) return fromLookup;
	} catch {
		return null;
	}
	return null;
}
function resolveTelegramReactionVariant(params) {
	const requestedEmoji = normalizeEmoji(params.requestedEmoji);
	if (!requestedEmoji) return;
	const variants = toUniqueNonEmpty([...params.variantsByRequestedEmoji.get(requestedEmoji) ?? [requestedEmoji], ...TELEGRAM_GENERIC_REACTION_FALLBACKS]);
	for (const candidate of variants) {
		if (!isTelegramSupportedReactionEmoji(candidate)) continue;
		if (params.allowedEmojiReactions == null || params.allowedEmojiReactions.has(candidate)) return candidate;
	}
}
//#endregion
//#region extensions/telegram/src/bot-message-context.ts
let telegramMessageContextRuntimePromise;
async function loadTelegramMessageContextRuntime() {
	telegramMessageContextRuntimePromise ??= import("./bot-message-context.runtime-BonAUduW.js");
	return await telegramMessageContextRuntimePromise;
}
const buildTelegramMessageContext = async ({ primaryCtx, allMedia, replyMedia = [], storeAllowFrom, options, bot, cfg, account, historyLimit, groupHistories, dmPolicy, allowFrom, groupAllowFrom, ackReactionScope, logger, resolveGroupActivation, resolveGroupRequireMention, resolveTelegramGroupConfig, loadFreshConfig, upsertPairingRequest, sendChatActionHandler }) => {
	const msg = primaryCtx.message;
	const chatId = msg.chat.id;
	const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
	const senderId = msg.from?.id ? String(msg.from.id) : "";
	const messageThreadId = msg.message_thread_id;
	const reactionApi = typeof bot.api.setMessageReaction === "function" ? bot.api.setMessageReaction.bind(bot.api) : null;
	const getChatApi = typeof bot.api.getChat === "function" ? bot.api.getChat.bind(bot.api) : void 0;
	const isForum = await resolveTelegramForumFlag({
		chatId,
		chatType: msg.chat.type,
		isGroup,
		isForum: extractTelegramForumFlag(msg.chat),
		getChat: getChatApi
	});
	const threadSpec = resolveTelegramThreadSpec({
		isGroup,
		isForum,
		messageThreadId
	});
	const resolvedThreadId = threadSpec.scope === "forum" ? threadSpec.id : void 0;
	const replyThreadId = threadSpec.id;
	const dmThreadId = threadSpec.scope === "dm" ? threadSpec.id : void 0;
	const { groupConfig, topicConfig } = resolveTelegramGroupConfig(chatId, resolvedThreadId ?? dmThreadId);
	const effectiveDmPolicy = !isGroup && groupConfig && "dmPolicy" in groupConfig ? groupConfig.dmPolicy ?? dmPolicy : dmPolicy;
	const freshCfg = loadFreshConfig?.() ?? (await loadTelegramMessageContextRuntime()).loadConfig();
	let { route, configuredBinding, configuredBindingSessionKey } = resolveTelegramConversationRoute({
		cfg: freshCfg,
		accountId: account.accountId,
		chatId,
		isGroup,
		resolvedThreadId,
		replyThreadId,
		senderId,
		topicAgentId: topicConfig?.agentId
	});
	const requiresExplicitAccountBinding = (candidate) => candidate.accountId !== "default" && candidate.matchedBy === "default";
	if (requiresExplicitAccountBinding(route) && isGroup) {
		logInboundDrop({
			log: logVerbose,
			channel: "telegram",
			reason: "non-default account requires explicit binding",
			target: route.accountId
		});
		return null;
	}
	const groupAllowOverride = firstDefined(topicConfig?.allowFrom, groupConfig?.allowFrom);
	const dmAllowFrom = groupAllowOverride ?? allowFrom;
	const effectiveDmAllow = normalizeDmAllowFromWithStore({
		allowFrom: dmAllowFrom,
		storeAllowFrom,
		dmPolicy: effectiveDmPolicy
	});
	const effectiveGroupAllow = normalizeAllowFrom(groupAllowOverride ?? groupAllowFrom);
	const hasGroupAllowOverride = typeof groupAllowOverride !== "undefined";
	const senderUsername = msg.from?.username ?? "";
	const baseAccess = evaluateTelegramGroupBaseAccess({
		isGroup,
		groupConfig,
		topicConfig,
		hasGroupAllowOverride,
		effectiveGroupAllow,
		senderId,
		senderUsername,
		enforceAllowOverride: true,
		requireSenderForAllowOverride: false
	});
	if (!baseAccess.allowed) {
		if (baseAccess.reason === "group-disabled") {
			logVerbose(`Blocked telegram group ${chatId} (group disabled)`);
			return null;
		}
		if (baseAccess.reason === "topic-disabled") {
			logVerbose(`Blocked telegram topic ${chatId} (${resolvedThreadId ?? "unknown"}) (topic disabled)`);
			return null;
		}
		logVerbose(isGroup ? `Blocked telegram group sender ${senderId || "unknown"} (group allowFrom override)` : `Blocked telegram DM sender ${senderId || "unknown"} (DM allowFrom override)`);
		return null;
	}
	const requireTopic = groupConfig?.requireTopic;
	if (!isGroup && requireTopic === true && dmThreadId == null) {
		logVerbose(`Blocked telegram DM ${chatId}: requireTopic=true but no topic present`);
		return null;
	}
	const sendTyping = async () => {
		await withTelegramApiErrorLogging({
			operation: "sendChatAction",
			fn: () => sendChatActionHandler.sendChatAction(chatId, "typing", buildTypingThreadParams(replyThreadId))
		});
	};
	const sendRecordVoice = async () => {
		try {
			await withTelegramApiErrorLogging({
				operation: "sendChatAction",
				fn: () => sendChatActionHandler.sendChatAction(chatId, "record_voice", buildTypingThreadParams(replyThreadId))
			});
		} catch (err) {
			logVerbose(`telegram record_voice cue failed for chat ${chatId}: ${String(err)}`);
		}
	};
	if (!await enforceTelegramDmAccess({
		isGroup,
		dmPolicy: effectiveDmPolicy,
		msg,
		chatId,
		effectiveDmAllow,
		accountId: account.accountId,
		bot,
		logger,
		upsertPairingRequest
	})) return null;
	const ensureConfiguredBindingReady = async () => {
		if (!configuredBinding) return true;
		const { ensureConfiguredBindingRouteReady } = await loadTelegramMessageContextRuntime();
		const ensured = await ensureConfiguredBindingRouteReady({
			cfg: freshCfg,
			bindingResolution: configuredBinding
		});
		if (ensured.ok) {
			logVerbose(`telegram: using configured ACP binding for ${configuredBinding.record.conversation.conversationId} -> ${configuredBindingSessionKey}`);
			return true;
		}
		logVerbose(`telegram: configured ACP binding unavailable for ${configuredBinding.record.conversation.conversationId}: ${ensured.error}`);
		logInboundDrop({
			log: logVerbose,
			channel: "telegram",
			reason: "configured ACP binding unavailable",
			target: configuredBinding.record.conversation.conversationId
		});
		return false;
	};
	const baseSessionKey = resolveTelegramConversationBaseSessionKey({
		cfg: freshCfg,
		route,
		chatId,
		isGroup,
		senderId
	});
	const sessionKey = (dmThreadId != null ? resolveThreadSessionKeys({
		baseSessionKey,
		threadId: `${chatId}:${dmThreadId}`
	}) : null)?.sessionKey ?? baseSessionKey;
	route = {
		...route,
		sessionKey,
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey,
			mainSessionKey: route.mainSessionKey
		})
	};
	const activationOverride = resolveGroupActivation({
		chatId,
		messageThreadId: resolvedThreadId,
		sessionKey,
		agentId: route.agentId
	});
	const baseRequireMention = resolveGroupRequireMention(chatId);
	const requireMention = firstDefined(activationOverride, topicConfig?.requireMention, groupConfig?.requireMention, baseRequireMention);
	(await loadTelegramMessageContextRuntime()).recordChannelActivity({
		channel: "telegram",
		accountId: account.accountId,
		direction: "inbound"
	});
	const bodyResult = await resolveTelegramInboundBody({
		cfg,
		primaryCtx,
		msg,
		allMedia,
		isGroup,
		chatId,
		senderId,
		senderUsername,
		resolvedThreadId,
		routeAgentId: route.agentId,
		effectiveGroupAllow,
		effectiveDmAllow,
		groupConfig,
		topicConfig,
		requireMention,
		options,
		groupHistories,
		historyLimit,
		logger
	});
	if (!bodyResult) return null;
	if (!await ensureConfiguredBindingReady()) return null;
	const ackReaction = resolveAckReaction(cfg, route.agentId, {
		channel: "telegram",
		accountId: account.accountId
	});
	const ackReactionEmoji = ackReaction && isTelegramSupportedReactionEmoji(ackReaction) ? ackReaction : void 0;
	const removeAckAfterReply = cfg.messages?.removeAckAfterReply ?? false;
	const shouldAckReaction$1 = () => Boolean(ackReaction && shouldAckReaction({
		scope: ackReactionScope,
		isDirect: !isGroup,
		isGroup,
		isMentionableGroup: isGroup,
		requireMention: Boolean(requireMention),
		canDetectMention: bodyResult.canDetectMention,
		effectiveWasMentioned: bodyResult.effectiveWasMentioned,
		shouldBypassMention: bodyResult.shouldBypassMention
	}));
	const statusReactionsConfig = cfg.messages?.statusReactions;
	const statusReactionsEnabled = statusReactionsConfig?.enabled === true && Boolean(reactionApi) && shouldAckReaction$1();
	const resolvedStatusReactionEmojis = resolveTelegramStatusReactionEmojis({
		initialEmoji: ackReaction,
		overrides: statusReactionsConfig?.emojis
	});
	const statusReactionVariantsByEmoji = buildTelegramStatusReactionVariants(resolvedStatusReactionEmojis);
	let allowedStatusReactionEmojisPromise = null;
	const statusReactionController = statusReactionsEnabled && msg.message_id ? (await loadTelegramMessageContextRuntime()).createStatusReactionController({
		enabled: true,
		adapter: { setReaction: async (emoji) => {
			if (reactionApi) {
				if (!allowedStatusReactionEmojisPromise) allowedStatusReactionEmojisPromise = resolveTelegramAllowedEmojiReactions({
					chat: msg.chat,
					chatId,
					getChat: getChatApi ?? void 0
				}).catch((err) => {
					logVerbose(`telegram status-reaction available_reactions lookup failed for chat ${chatId}: ${String(err)}`);
					return null;
				});
				const resolvedEmoji = resolveTelegramReactionVariant({
					requestedEmoji: emoji,
					variantsByRequestedEmoji: statusReactionVariantsByEmoji,
					allowedEmojiReactions: await allowedStatusReactionEmojisPromise
				});
				if (!resolvedEmoji) return;
				await reactionApi(chatId, msg.message_id, [{
					type: "emoji",
					emoji: resolvedEmoji
				}]);
			}
		} },
		initialEmoji: ackReaction,
		emojis: resolvedStatusReactionEmojis,
		timing: statusReactionsConfig?.timing,
		onError: (err) => {
			logVerbose(`telegram status-reaction error for chat ${chatId}: ${String(err)}`);
		}
	}) : null;
	const ackReactionPromise = statusReactionController ? shouldAckReaction$1() ? Promise.resolve(statusReactionController.setQueued()).then(() => true, () => false) : null : shouldAckReaction$1() && msg.message_id && reactionApi && ackReactionEmoji ? withTelegramApiErrorLogging({
		operation: "setMessageReaction",
		fn: () => reactionApi(chatId, msg.message_id, [{
			type: "emoji",
			emoji: ackReactionEmoji
		}])
	}).then(() => true, (err) => {
		logVerbose(`telegram react failed for chat ${chatId}: ${String(err)}`);
		return false;
	}) : null;
	const { ctxPayload, skillFilter } = await buildTelegramInboundContextPayload({
		cfg,
		primaryCtx,
		msg,
		allMedia,
		replyMedia,
		isGroup,
		isForum,
		chatId,
		senderId,
		senderUsername,
		resolvedThreadId,
		dmThreadId,
		threadSpec,
		route,
		rawBody: bodyResult.rawBody,
		bodyText: bodyResult.bodyText,
		historyKey: bodyResult.historyKey ?? "",
		historyLimit,
		groupHistories,
		groupConfig,
		topicConfig,
		stickerCacheHit: bodyResult.stickerCacheHit,
		effectiveWasMentioned: bodyResult.effectiveWasMentioned,
		locationData: bodyResult.locationData,
		options,
		dmAllowFrom,
		commandAuthorized: bodyResult.commandAuthorized
	});
	return {
		ctxPayload,
		primaryCtx,
		msg,
		chatId,
		isGroup,
		groupConfig,
		topicConfig,
		resolvedThreadId,
		threadSpec,
		replyThreadId,
		isForum,
		historyKey: bodyResult.historyKey ?? "",
		historyLimit,
		groupHistories,
		route,
		skillFilter,
		sendTyping,
		sendRecordVoice,
		ackReactionPromise,
		reactionApi,
		removeAckAfterReply,
		statusReactionController,
		accountId: account.accountId
	};
};
//#endregion
export { resolveTelegramGroupPromptSettings as a, resolveTelegramConversationRoute as i, enforceTelegramDmAccess as n, resolveTelegramConversationBaseSessionKey as r, buildTelegramMessageContext as t };
