import { S as sleep } from "./utils-CE3P21nG.js";
import { T as parseAgentSessionKey } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose } from "./globals-BJZkpw-q.js";
import { v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import { c as resolveSessionStoreEntry, i as loadSessionStore } from "./store-BGmy-Wot.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { n as parseSessionThreadInfo } from "./delivery-info-C75W__fH.js";
import { n as getGlobalPluginRegistry, t as getGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-_6bbS8VC.js";
import { a as buildPluginBindingUnavailableText, b as touchConversationBindingRecord, c as hasShownPluginBindingFallbackNotice, d as markPluginBindingFallbackNoticeShown, h as toPluginConversationBinding, n as buildPluginBindingDeclinedText, r as buildPluginBindingErrorText, u as isPluginOwnedSessionBindingRecord, y as resolveConversationBindingRecord } from "./conversation-binding-oQzcUiHT.js";
import { n as createInternalHookEvent, p as triggerInternalHook } from "./internal-hooks-LWzilokd.js";
import { r as generateSecureInt } from "./secure-random-CzuMrSfY.js";
import { n as isDiagnosticsEnabled } from "./diagnostic-events-ROhwFcx1.js";
import { l as logSessionStateChange, o as logMessageProcessed, s as logMessageQueued } from "./diagnostic-vmeqdUnS.js";
import { p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { c as toPluginInboundClaimEvent, f as fireAndForgetHook, i as toInternalMessageReceivedContext, l as toPluginMessageContext, n as deriveInboundMessageHookContext, s as toPluginInboundClaimContext, u as toPluginMessageReceivedEvent } from "./message-hook-mappers-DkZ6SgzR.js";
import { t as normalizeReplyPayload } from "./normalize-reply-OmOn1Pmu.js";
import { n as normalizeTtsAutoMode } from "./tts-auto-mode-CRt1wYQ7.js";
import { t as getReplyPayloadMetadata } from "./types-rWyytj3v.js";
import { n as resolveSendPolicy } from "./send-policy-DGmd7hOX.js";
import { t as resolveRunTypingPolicy } from "./typing-policy-cXECg39T.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
//#region src/acp/session-interaction-mode.ts
function normalizeText(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function resolveAcpSessionInteractionMode(entry) {
	if (entry?.acp?.mode !== "oneshot") return "interactive";
	if (normalizeText(entry.spawnedBy) || normalizeText(entry.parentSessionKey)) return "parent-owned-background";
	return "interactive";
}
function isParentOwnedBackgroundAcpSession(entry) {
	return resolveAcpSessionInteractionMode(entry) === "parent-owned-background";
}
//#endregion
//#region src/channels/plugins/exec-approval-local.ts
function shouldSuppressLocalExecApprovalPrompt(params) {
	const channel = params.channel ? normalizeChannelId(params.channel) : null;
	if (!channel) return false;
	return getChannelPlugin(channel)?.outbound?.shouldSuppressLocalPayloadPrompt?.({
		cfg: params.cfg,
		accountId: params.accountId,
		payload: params.payload,
		hint: {
			kind: "approval-pending",
			approvalKind: "exec"
		}
	}) ?? false;
}
//#endregion
//#region src/tts/tts-config.ts
function resolveConfiguredTtsMode(cfg) {
	return cfg.messages?.tts?.mode ?? "final";
}
//#endregion
//#region src/auto-reply/reply/inbound-dedupe.ts
const inboundDedupeCache = resolveGlobalDedupeCache(Symbol.for("openclaw.inboundDedupeCache"), {
	ttlMs: 20 * 6e4,
	maxSize: 5e3
});
const normalizeProvider = (value) => value?.trim().toLowerCase() || "";
const resolveInboundPeerId = (ctx) => ctx.OriginatingTo ?? ctx.To ?? ctx.From ?? ctx.SessionKey;
function resolveInboundDedupeSessionScope(ctx) {
	const sessionKey = (ctx.CommandSource === "native" ? ctx.CommandTargetSessionKey : void 0)?.trim() || ctx.SessionKey?.trim() || "";
	if (!sessionKey) return "";
	const parsed = parseAgentSessionKey(sessionKey);
	if (!parsed) return sessionKey;
	return `agent:${parsed.agentId}`;
}
function buildInboundDedupeKey(ctx) {
	const provider = normalizeProvider(ctx.OriginatingChannel ?? ctx.Provider ?? ctx.Surface);
	const messageId = ctx.MessageSid?.trim();
	if (!provider || !messageId) return null;
	const peerId = resolveInboundPeerId(ctx);
	if (!peerId) return null;
	const sessionScope = resolveInboundDedupeSessionScope(ctx);
	return [
		provider,
		ctx.AccountId?.trim() ?? "",
		sessionScope,
		peerId,
		ctx.MessageThreadId !== void 0 && ctx.MessageThreadId !== null ? String(ctx.MessageThreadId) : "",
		messageId
	].filter(Boolean).join("|");
}
function shouldSkipDuplicateInbound(ctx, opts) {
	const key = buildInboundDedupeKey(ctx);
	if (!key) return false;
	const skipped = (opts?.cache ?? inboundDedupeCache).check(key, opts?.now);
	if (skipped && shouldLogVerbose()) logVerbose(`inbound dedupe: skipped ${key}`);
	return skipped;
}
function resetInboundDedupe() {
	inboundDedupeCache.clear();
}
//#endregion
//#region src/auto-reply/reply/routing-policy.ts
function resolveReplyRoutingDecision(params) {
	const originatingChannel = normalizeMessageChannel(params.originatingChannel);
	const providerChannel = normalizeMessageChannel(params.provider);
	const surfaceChannel = normalizeMessageChannel(params.surface);
	const currentSurface = providerChannel ?? surfaceChannel;
	const isInternalWebchatTurn = currentSurface === "webchat" && (surfaceChannel === "webchat" || !surfaceChannel) && params.explicitDeliverRoute !== true;
	const shouldRouteToOriginating = Boolean(!params.suppressDirectUserDelivery && !isInternalWebchatTurn && params.isRoutableChannel(originatingChannel) && params.originatingTo && originatingChannel !== currentSurface);
	return {
		originatingChannel,
		currentSurface,
		isInternalWebchatTurn,
		shouldRouteToOriginating,
		shouldSuppressTyping: params.suppressDirectUserDelivery === true || shouldRouteToOriginating || originatingChannel === "webchat"
	};
}
//#endregion
//#region src/auto-reply/reply/dispatch-from-config.ts
let routeReplyRuntimePromise = null;
let getReplyFromConfigRuntimePromise = null;
let abortRuntimePromise = null;
let dispatchAcpRuntimePromise = null;
let ttsRuntimePromise = null;
function loadRouteReplyRuntime() {
	routeReplyRuntimePromise ??= import("./route-reply.runtime-DJvhLCil.js");
	return routeReplyRuntimePromise;
}
function loadGetReplyFromConfigRuntime() {
	getReplyFromConfigRuntimePromise ??= import("./get-reply-from-config.runtime-DoAjy_en.js");
	return getReplyFromConfigRuntimePromise;
}
function loadAbortRuntime() {
	abortRuntimePromise ??= import("./abort.runtime-DT2D8k_Q.js");
	return abortRuntimePromise;
}
function loadDispatchAcpRuntime() {
	dispatchAcpRuntimePromise ??= import("./dispatch-acp.runtime-Dd4wa23g.js");
	return dispatchAcpRuntimePromise;
}
function loadTtsRuntime() {
	ttsRuntimePromise ??= import("./tts.runtime-D1CNz8_M.js");
	return ttsRuntimePromise;
}
const AUDIO_PLACEHOLDER_RE = /^<media:audio>(\s*\([^)]*\))?$/i;
const AUDIO_HEADER_RE = /^\[Audio\b/i;
const normalizeMediaType = (value) => value.split(";")[0]?.trim().toLowerCase();
const isInboundAudioContext = (ctx) => {
	if ([typeof ctx.MediaType === "string" ? ctx.MediaType : void 0, ...Array.isArray(ctx.MediaTypes) ? ctx.MediaTypes : []].filter(Boolean).map((type) => normalizeMediaType(type)).some((type) => type === "audio" || type.startsWith("audio/"))) return true;
	const trimmed = (typeof ctx.BodyForCommands === "string" ? ctx.BodyForCommands : typeof ctx.CommandBody === "string" ? ctx.CommandBody : typeof ctx.RawBody === "string" ? ctx.RawBody : typeof ctx.Body === "string" ? ctx.Body : "").trim();
	if (!trimmed) return false;
	if (AUDIO_PLACEHOLDER_RE.test(trimmed)) return true;
	return AUDIO_HEADER_RE.test(trimmed);
};
const resolveSessionStoreLookup = (ctx, cfg) => {
	const sessionKey = ((ctx.CommandSource === "native" ? ctx.CommandTargetSessionKey?.trim() : void 0) ?? ctx.SessionKey)?.trim();
	if (!sessionKey) return {};
	const agentId = resolveSessionAgentId({
		sessionKey,
		config: cfg
	});
	const storePath = resolveStorePath(cfg.session?.store, { agentId });
	try {
		return {
			sessionKey,
			entry: resolveSessionStoreEntry({
				store: loadSessionStore(storePath),
				sessionKey
			}).existing
		};
	} catch {
		return { sessionKey };
	}
};
async function dispatchReplyFromConfig(params) {
	const { ctx, cfg, dispatcher } = params;
	const diagnosticsEnabled = isDiagnosticsEnabled(cfg);
	const channel = String(ctx.Surface ?? ctx.Provider ?? "unknown").toLowerCase();
	const chatId = ctx.To ?? ctx.From;
	const messageId = ctx.MessageSid ?? ctx.MessageSidFirst ?? ctx.MessageSidLast;
	const sessionKey = ctx.SessionKey;
	const startTime = diagnosticsEnabled ? Date.now() : 0;
	const canTrackSession = diagnosticsEnabled && Boolean(sessionKey);
	const recordProcessed = (outcome, opts) => {
		if (!diagnosticsEnabled) return;
		logMessageProcessed({
			channel,
			chatId,
			messageId,
			sessionKey,
			durationMs: Date.now() - startTime,
			outcome,
			reason: opts?.reason,
			error: opts?.error
		});
	};
	const markProcessing = () => {
		if (!canTrackSession || !sessionKey) return;
		logMessageQueued({
			sessionKey,
			channel,
			source: "dispatch"
		});
		logSessionStateChange({
			sessionKey,
			state: "processing",
			reason: "message_start"
		});
	};
	const markIdle = (reason) => {
		if (!canTrackSession || !sessionKey) return;
		logSessionStateChange({
			sessionKey,
			state: "idle",
			reason
		});
	};
	if (shouldSkipDuplicateInbound(ctx)) {
		recordProcessed("skipped", { reason: "duplicate" });
		return {
			queuedFinal: false,
			counts: dispatcher.getQueuedCounts()
		};
	}
	const sessionStoreEntry = resolveSessionStoreLookup(ctx, cfg);
	const acpDispatchSessionKey = sessionStoreEntry.sessionKey ?? sessionKey;
	const routeThreadId = ctx.MessageThreadId ?? parseSessionThreadInfo(acpDispatchSessionKey).threadId;
	const inboundAudio = isInboundAudioContext(ctx);
	const sessionTtsAuto = normalizeTtsAutoMode(sessionStoreEntry.entry?.ttsAuto);
	const hookRunner = getGlobalHookRunner();
	const timestamp = typeof ctx.Timestamp === "number" && Number.isFinite(ctx.Timestamp) ? ctx.Timestamp : void 0;
	const hookContext = deriveInboundMessageHookContext(ctx, { messageId: ctx.MessageSidFull ?? ctx.MessageSid ?? ctx.MessageSidFirst ?? ctx.MessageSidLast });
	const { isGroup, groupId } = hookContext;
	const inboundClaimContext = toPluginInboundClaimContext(hookContext);
	const inboundClaimEvent = toPluginInboundClaimEvent(hookContext, {
		commandAuthorized: typeof ctx.CommandAuthorized === "boolean" ? ctx.CommandAuthorized : void 0,
		wasMentioned: typeof ctx.WasMentioned === "boolean" ? ctx.WasMentioned : void 0
	});
	const suppressAcpChildUserDelivery = isParentOwnedBackgroundAcpSession(sessionStoreEntry.entry);
	const routeReplyRuntime = await loadRouteReplyRuntime();
	const { originatingChannel, currentSurface, shouldRouteToOriginating, shouldSuppressTyping } = resolveReplyRoutingDecision({
		provider: ctx.Provider,
		surface: ctx.Surface,
		explicitDeliverRoute: ctx.ExplicitDeliverRoute,
		originatingChannel: ctx.OriginatingChannel,
		originatingTo: ctx.OriginatingTo,
		suppressDirectUserDelivery: suppressAcpChildUserDelivery,
		isRoutableChannel: routeReplyRuntime.isRoutableChannel
	});
	const originatingTo = ctx.OriginatingTo;
	const ttsChannel = shouldRouteToOriginating ? originatingChannel : currentSurface;
	/**
	* Helper to send a payload via route-reply (async).
	* Only used when actually routing to a different provider.
	* Note: Only called when shouldRouteToOriginating is true, so
	* originatingChannel and originatingTo are guaranteed to be defined.
	*/
	const sendPayloadAsync = async (payload, abortSignal, mirror) => {
		if (!originatingChannel || !originatingTo) return;
		if (abortSignal?.aborted) return;
		const result = await routeReplyRuntime.routeReply({
			payload,
			channel: originatingChannel,
			to: originatingTo,
			sessionKey: ctx.SessionKey,
			accountId: ctx.AccountId,
			threadId: routeThreadId,
			cfg,
			abortSignal,
			mirror,
			isGroup,
			groupId
		});
		if (!result.ok) logVerbose(`dispatch-from-config: route-reply failed: ${result.error ?? "unknown error"}`);
	};
	const sendBindingNotice = async (payload, mode) => {
		if (shouldRouteToOriginating && originatingChannel && originatingTo) {
			const result = await routeReplyRuntime.routeReply({
				payload,
				channel: originatingChannel,
				to: originatingTo,
				sessionKey: ctx.SessionKey,
				accountId: ctx.AccountId,
				threadId: routeThreadId,
				cfg,
				isGroup,
				groupId
			});
			if (!result.ok) logVerbose(`dispatch-from-config: route-reply (plugin binding notice) failed: ${result.error ?? "unknown error"}`);
			return result.ok;
		}
		return mode === "additive" ? dispatcher.sendToolResult(payload) : dispatcher.sendFinalReply(payload);
	};
	const pluginOwnedBindingRecord = inboundClaimContext.conversationId && inboundClaimContext.channelId ? resolveConversationBindingRecord({
		channel: inboundClaimContext.channelId,
		accountId: inboundClaimContext.accountId ?? "default",
		conversationId: inboundClaimContext.conversationId,
		parentConversationId: inboundClaimContext.parentConversationId
	}) : null;
	const pluginOwnedBinding = isPluginOwnedSessionBindingRecord(pluginOwnedBindingRecord) ? toPluginConversationBinding(pluginOwnedBindingRecord) : null;
	let pluginFallbackReason;
	if (pluginOwnedBinding) {
		touchConversationBindingRecord(pluginOwnedBinding.bindingId);
		logVerbose(`plugin-bound inbound routed to ${pluginOwnedBinding.pluginId} conversation=${pluginOwnedBinding.conversationId}`);
		const targetedClaimOutcome = hookRunner?.runInboundClaimForPluginOutcome ? await hookRunner.runInboundClaimForPluginOutcome(pluginOwnedBinding.pluginId, inboundClaimEvent, inboundClaimContext) : getGlobalPluginRegistry()?.plugins.some((plugin) => plugin.id === pluginOwnedBinding.pluginId && plugin.status === "loaded") ?? false ? { status: "no_handler" } : { status: "missing_plugin" };
		switch (targetedClaimOutcome.status) {
			case "handled":
				markIdle("plugin_binding_dispatch");
				recordProcessed("completed", { reason: "plugin-bound-handled" });
				return {
					queuedFinal: false,
					counts: dispatcher.getQueuedCounts()
				};
			case "missing_plugin":
			case "no_handler":
				pluginFallbackReason = targetedClaimOutcome.status === "missing_plugin" ? "plugin-bound-fallback-missing-plugin" : "plugin-bound-fallback-no-handler";
				if (!hasShownPluginBindingFallbackNotice(pluginOwnedBinding.bindingId)) {
					if (await sendBindingNotice({ text: buildPluginBindingUnavailableText(pluginOwnedBinding) }, "additive")) markPluginBindingFallbackNoticeShown(pluginOwnedBinding.bindingId);
				}
				break;
			case "declined":
				await sendBindingNotice({ text: buildPluginBindingDeclinedText(pluginOwnedBinding) }, "terminal");
				markIdle("plugin_binding_declined");
				recordProcessed("completed", { reason: "plugin-bound-declined" });
				return {
					queuedFinal: false,
					counts: dispatcher.getQueuedCounts()
				};
			case "error":
				logVerbose(`plugin-bound inbound claim failed for ${pluginOwnedBinding.pluginId}: ${targetedClaimOutcome.error}`);
				await sendBindingNotice({ text: buildPluginBindingErrorText(pluginOwnedBinding) }, "terminal");
				markIdle("plugin_binding_error");
				recordProcessed("completed", { reason: "plugin-bound-error" });
				return {
					queuedFinal: false,
					counts: dispatcher.getQueuedCounts()
				};
		}
	}
	if (hookRunner?.hasHooks("message_received")) fireAndForgetHook(hookRunner.runMessageReceived(toPluginMessageReceivedEvent(hookContext), toPluginMessageContext(hookContext)), "dispatch-from-config: message_received plugin hook failed");
	if (sessionKey) fireAndForgetHook(triggerInternalHook(createInternalHookEvent("message", "received", sessionKey, {
		...toInternalMessageReceivedContext(hookContext),
		timestamp
	})), "dispatch-from-config: message_received internal hook failed");
	markProcessing();
	try {
		const abortRuntime = await loadAbortRuntime();
		const fastAbort = await abortRuntime.tryFastAbortFromMessage({
			ctx,
			cfg
		});
		if (fastAbort.handled) {
			const payload = { text: abortRuntime.formatAbortReplyText(fastAbort.stoppedSubagents) };
			let queuedFinal = false;
			let routedFinalCount = 0;
			if (shouldRouteToOriginating && originatingChannel && originatingTo) {
				const result = await routeReplyRuntime.routeReply({
					payload,
					channel: originatingChannel,
					to: originatingTo,
					sessionKey: ctx.SessionKey,
					accountId: ctx.AccountId,
					threadId: routeThreadId,
					cfg,
					isGroup,
					groupId
				});
				queuedFinal = result.ok;
				if (result.ok) routedFinalCount += 1;
				if (!result.ok) logVerbose(`dispatch-from-config: route-reply (abort) failed: ${result.error ?? "unknown error"}`);
			} else queuedFinal = dispatcher.sendFinalReply(payload);
			const counts = dispatcher.getQueuedCounts();
			counts.final += routedFinalCount;
			recordProcessed("completed", { reason: "fast_abort" });
			markIdle("message_completed");
			return {
				queuedFinal,
				counts
			};
		}
		const dispatchAcpRuntime = await loadDispatchAcpRuntime();
		const bypassAcpForCommand = dispatchAcpRuntime.shouldBypassAcpDispatchForCommand(ctx, cfg);
		if (resolveSendPolicy({
			cfg,
			entry: sessionStoreEntry.entry,
			sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
			channel: sessionStoreEntry.entry?.channel ?? ctx.OriginatingChannel ?? ctx.Surface ?? ctx.Provider ?? void 0,
			chatType: sessionStoreEntry.entry?.chatType
		}) === "deny" && !bypassAcpForCommand) {
			logVerbose(`Send blocked by policy for session ${sessionStoreEntry.sessionKey ?? sessionKey ?? "unknown"}`);
			const counts = dispatcher.getQueuedCounts();
			recordProcessed("completed", { reason: "send_policy_deny" });
			markIdle("message_completed");
			return {
				queuedFinal: false,
				counts
			};
		}
		const { maybeApplyTtsToPayload } = await loadTtsRuntime();
		const sendFinalPayload = async (payload) => {
			const ttsPayload = await maybeApplyTtsToPayload({
				payload,
				cfg,
				channel: ttsChannel,
				kind: "final",
				inboundAudio,
				ttsAuto: sessionTtsAuto
			});
			if (shouldRouteToOriginating && originatingChannel && originatingTo) {
				const result = await routeReplyRuntime.routeReply({
					payload: ttsPayload,
					channel: originatingChannel,
					to: originatingTo,
					sessionKey: ctx.SessionKey,
					accountId: ctx.AccountId,
					threadId: routeThreadId,
					cfg,
					isGroup,
					groupId
				});
				if (!result.ok) logVerbose(`dispatch-from-config: route-reply (final) failed: ${result.error ?? "unknown error"}`);
				return {
					queuedFinal: result.ok,
					routedFinalCount: result.ok ? 1 : 0
				};
			}
			return {
				queuedFinal: dispatcher.sendFinalReply(ttsPayload),
				routedFinalCount: 0
			};
		};
		if (hookRunner?.hasHooks("before_dispatch")) {
			const beforeDispatchResult = await hookRunner.runBeforeDispatch({
				content: hookContext.content,
				body: hookContext.bodyForAgent ?? hookContext.body,
				channel: hookContext.channelId,
				sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
				senderId: hookContext.senderId,
				isGroup: hookContext.isGroup,
				timestamp: hookContext.timestamp
			}, {
				channelId: hookContext.channelId,
				accountId: hookContext.accountId,
				conversationId: inboundClaimContext.conversationId,
				sessionKey: sessionStoreEntry.sessionKey ?? sessionKey,
				senderId: hookContext.senderId
			});
			if (beforeDispatchResult?.handled) {
				const text = beforeDispatchResult.text;
				let queuedFinal = false;
				let routedFinalCount = 0;
				if (text) {
					const handledReply = await sendFinalPayload({ text });
					queuedFinal = handledReply.queuedFinal;
					routedFinalCount += handledReply.routedFinalCount;
				}
				const counts = dispatcher.getQueuedCounts();
				counts.final += routedFinalCount;
				recordProcessed("completed", { reason: "before_dispatch_handled" });
				markIdle("message_completed");
				return {
					queuedFinal,
					counts
				};
			}
		}
		const shouldSendToolSummaries = (ctx.ChatType !== "group" || ctx.IsForum === true) && ctx.CommandSource !== "native";
		const acpDispatch = await dispatchAcpRuntime.tryDispatchAcpReply({
			ctx,
			cfg,
			dispatcher,
			runId: params.replyOptions?.runId,
			sessionKey: acpDispatchSessionKey,
			abortSignal: params.replyOptions?.abortSignal,
			inboundAudio,
			sessionTtsAuto,
			ttsChannel,
			suppressUserDelivery: suppressAcpChildUserDelivery,
			shouldRouteToOriginating,
			originatingChannel,
			originatingTo,
			shouldSendToolSummaries,
			bypassForCommand: bypassAcpForCommand,
			onReplyStart: params.replyOptions?.onReplyStart,
			recordProcessed,
			markIdle
		});
		if (acpDispatch) return acpDispatch;
		let accumulatedBlockText = "";
		let blockCount = 0;
		const resolveToolDeliveryPayload = (payload) => {
			if (shouldSuppressLocalExecApprovalPrompt({
				channel: normalizeMessageChannel(ctx.Surface ?? ctx.Provider),
				cfg,
				accountId: ctx.AccountId,
				payload
			})) return null;
			if (shouldSendToolSummaries) return payload;
			const execApproval = payload.channelData && typeof payload.channelData === "object" && !Array.isArray(payload.channelData) ? payload.channelData.execApproval : void 0;
			if (execApproval && typeof execApproval === "object" && !Array.isArray(execApproval)) return payload;
			if (!resolveSendableOutboundReplyParts(payload).hasMedia) return null;
			return {
				...payload,
				text: void 0
			};
		};
		const typing = resolveRunTypingPolicy({
			requestedPolicy: params.replyOptions?.typingPolicy,
			suppressTyping: params.replyOptions?.suppressTyping === true || shouldSuppressTyping,
			originatingChannel,
			systemEvent: shouldRouteToOriginating
		});
		const replyResult = await (params.replyResolver ?? (await loadGetReplyFromConfigRuntime()).getReplyFromConfig)(ctx, {
			...params.replyOptions,
			typingPolicy: typing.typingPolicy,
			suppressTyping: typing.suppressTyping,
			onToolResult: (payload) => {
				const run = async () => {
					const deliveryPayload = resolveToolDeliveryPayload(await maybeApplyTtsToPayload({
						payload,
						cfg,
						channel: ttsChannel,
						kind: "tool",
						inboundAudio,
						ttsAuto: sessionTtsAuto
					}));
					if (!deliveryPayload) return;
					if (shouldRouteToOriginating) await sendPayloadAsync(deliveryPayload, void 0, false);
					else dispatcher.sendToolResult(deliveryPayload);
				};
				return run();
			},
			onBlockReply: (payload, context) => {
				const run = async () => {
					if (payload.isReasoning === true) return;
					if (payload.text && !payload.isCompactionNotice) {
						if (accumulatedBlockText.length > 0) accumulatedBlockText += "\n";
						accumulatedBlockText += payload.text;
						blockCount++;
					}
					const payloadMetadata = getReplyPayloadMetadata(payload);
					const queuedContext = payloadMetadata?.assistantMessageIndex !== void 0 ? {
						...context,
						assistantMessageIndex: payloadMetadata.assistantMessageIndex
					} : context;
					await params.replyOptions?.onBlockReplyQueued?.(payload, queuedContext);
					const ttsPayload = await maybeApplyTtsToPayload({
						payload,
						cfg,
						channel: ttsChannel,
						kind: "block",
						inboundAudio,
						ttsAuto: sessionTtsAuto
					});
					if (shouldRouteToOriginating) await sendPayloadAsync(ttsPayload, context?.abortSignal, false);
					else dispatcher.sendBlockReply(ttsPayload);
				};
				return run();
			}
		}, params.configOverride);
		if (ctx.AcpDispatchTailAfterReset === true) {
			ctx.AcpDispatchTailAfterReset = false;
			const acpTailDispatch = await dispatchAcpRuntime.tryDispatchAcpReply({
				ctx,
				cfg,
				dispatcher,
				runId: params.replyOptions?.runId,
				sessionKey: acpDispatchSessionKey,
				abortSignal: params.replyOptions?.abortSignal,
				inboundAudio,
				sessionTtsAuto,
				ttsChannel,
				shouldRouteToOriginating,
				originatingChannel,
				originatingTo,
				shouldSendToolSummaries,
				bypassForCommand: false,
				onReplyStart: params.replyOptions?.onReplyStart,
				recordProcessed,
				markIdle
			});
			if (acpTailDispatch) return acpTailDispatch;
		}
		const replies = replyResult ? Array.isArray(replyResult) ? replyResult : [replyResult] : [];
		let queuedFinal = false;
		let routedFinalCount = 0;
		for (const reply of replies) {
			if (reply.isReasoning === true) continue;
			const finalReply = await sendFinalPayload(reply);
			queuedFinal = finalReply.queuedFinal || queuedFinal;
			routedFinalCount += finalReply.routedFinalCount;
		}
		if (resolveConfiguredTtsMode(cfg) === "final" && replies.length === 0 && blockCount > 0 && accumulatedBlockText.trim()) try {
			const ttsSyntheticReply = await maybeApplyTtsToPayload({
				payload: { text: accumulatedBlockText },
				cfg,
				channel: ttsChannel,
				kind: "final",
				inboundAudio,
				ttsAuto: sessionTtsAuto
			});
			if (ttsSyntheticReply.mediaUrl) {
				const ttsOnlyPayload = {
					mediaUrl: ttsSyntheticReply.mediaUrl,
					audioAsVoice: ttsSyntheticReply.audioAsVoice
				};
				if (shouldRouteToOriginating && originatingChannel && originatingTo) {
					const result = await routeReplyRuntime.routeReply({
						payload: ttsOnlyPayload,
						channel: originatingChannel,
						to: originatingTo,
						sessionKey: ctx.SessionKey,
						accountId: ctx.AccountId,
						threadId: routeThreadId,
						cfg,
						isGroup,
						groupId
					});
					queuedFinal = result.ok || queuedFinal;
					if (result.ok) routedFinalCount += 1;
					if (!result.ok) logVerbose(`dispatch-from-config: route-reply (tts-only) failed: ${result.error ?? "unknown error"}`);
				} else queuedFinal = dispatcher.sendFinalReply(ttsOnlyPayload) || queuedFinal;
			}
		} catch (err) {
			logVerbose(`dispatch-from-config: accumulated block TTS failed: ${err instanceof Error ? err.message : String(err)}`);
		}
		const counts = dispatcher.getQueuedCounts();
		counts.final += routedFinalCount;
		recordProcessed("completed", pluginFallbackReason ? { reason: pluginFallbackReason } : void 0);
		markIdle("message_completed");
		return {
			queuedFinal,
			counts
		};
	} catch (err) {
		recordProcessed("error", { error: String(err) });
		markIdle("message_error");
		throw err;
	}
}
//#endregion
//#region src/auto-reply/reply/dispatcher-registry.ts
const activeDispatchers = /* @__PURE__ */ new Set();
let nextId = 0;
/**
* Register a reply dispatcher for global tracking.
* Returns an unregister function to call when the dispatcher is no longer needed.
*/
function registerDispatcher(dispatcher) {
	const id = `dispatcher-${++nextId}`;
	const tracked = {
		id,
		pending: dispatcher.pending,
		waitForIdle: dispatcher.waitForIdle
	};
	activeDispatchers.add(tracked);
	const unregister = () => {
		activeDispatchers.delete(tracked);
	};
	return {
		id,
		unregister
	};
}
/**
* Get the total number of pending replies across all dispatchers.
*/
function getTotalPendingReplies() {
	let total = 0;
	for (const dispatcher of activeDispatchers) total += dispatcher.pending();
	return total;
}
//#endregion
//#region src/auto-reply/reply/reply-dispatcher.ts
const DEFAULT_HUMAN_DELAY_MIN_MS = 800;
const DEFAULT_HUMAN_DELAY_MAX_MS = 2500;
/** Generate a random delay within the configured range. */
function getHumanDelay(config) {
	const mode = config?.mode ?? "off";
	if (mode === "off") return 0;
	const min = mode === "custom" ? config?.minMs ?? DEFAULT_HUMAN_DELAY_MIN_MS : DEFAULT_HUMAN_DELAY_MIN_MS;
	const max = mode === "custom" ? config?.maxMs ?? DEFAULT_HUMAN_DELAY_MAX_MS : DEFAULT_HUMAN_DELAY_MAX_MS;
	if (max <= min) return min;
	return min + generateSecureInt(max - min + 1);
}
function normalizeReplyPayloadInternal(payload, opts) {
	const prefixContext = opts.responsePrefixContextProvider?.() ?? opts.responsePrefixContext;
	return normalizeReplyPayload(payload, {
		responsePrefix: opts.responsePrefix,
		enableSlackInteractiveReplies: opts.enableSlackInteractiveReplies,
		responsePrefixContext: prefixContext,
		onHeartbeatStrip: opts.onHeartbeatStrip,
		onSkip: opts.onSkip
	});
}
function createReplyDispatcher(options) {
	let sendChain = Promise.resolve();
	let pending = 1;
	let completeCalled = false;
	let sentFirstBlock = false;
	const queuedCounts = {
		tool: 0,
		block: 0,
		final: 0
	};
	const failedCounts = {
		tool: 0,
		block: 0,
		final: 0
	};
	const { unregister } = registerDispatcher({
		pending: () => pending,
		waitForIdle: () => sendChain
	});
	const enqueue = (kind, payload) => {
		const normalized = normalizeReplyPayloadInternal(payload, {
			responsePrefix: options.responsePrefix,
			enableSlackInteractiveReplies: options.enableSlackInteractiveReplies,
			responsePrefixContext: options.responsePrefixContext,
			responsePrefixContextProvider: options.responsePrefixContextProvider,
			onHeartbeatStrip: options.onHeartbeatStrip,
			onSkip: (reason) => options.onSkip?.(payload, {
				kind,
				reason
			})
		});
		if (!normalized) return false;
		queuedCounts[kind] += 1;
		pending += 1;
		const shouldDelay = kind === "block" && sentFirstBlock;
		if (kind === "block") sentFirstBlock = true;
		sendChain = sendChain.then(async () => {
			if (shouldDelay) {
				const delayMs = getHumanDelay(options.humanDelay);
				if (delayMs > 0) await sleep(delayMs);
			}
			await options.deliver(normalized, { kind });
		}).catch((err) => {
			failedCounts[kind] += 1;
			options.onError?.(err, { kind });
		}).finally(() => {
			pending -= 1;
			if (pending === 1 && completeCalled) pending -= 1;
			if (pending === 0) {
				unregister();
				options.onIdle?.();
			}
		});
		return true;
	};
	const markComplete = () => {
		if (completeCalled) return;
		completeCalled = true;
		Promise.resolve().then(() => {
			if (pending === 1 && completeCalled) {
				pending -= 1;
				if (pending === 0) {
					unregister();
					options.onIdle?.();
				}
			}
		});
	};
	return {
		sendToolResult: (payload) => enqueue("tool", payload),
		sendBlockReply: (payload) => enqueue("block", payload),
		sendFinalReply: (payload) => enqueue("final", payload),
		waitForIdle: () => sendChain,
		getQueuedCounts: () => ({ ...queuedCounts }),
		getFailedCounts: () => ({ ...failedCounts }),
		markComplete
	};
}
function createReplyDispatcherWithTyping(options) {
	const { typingCallbacks, onReplyStart, onIdle, onCleanup, ...dispatcherOptions } = options;
	const resolvedOnReplyStart = onReplyStart ?? typingCallbacks?.onReplyStart;
	const resolvedOnIdle = onIdle ?? typingCallbacks?.onIdle;
	const resolvedOnCleanup = onCleanup ?? typingCallbacks?.onCleanup;
	let typingController;
	return {
		dispatcher: createReplyDispatcher({
			...dispatcherOptions,
			onIdle: () => {
				typingController?.markDispatchIdle();
				resolvedOnIdle?.();
			}
		}),
		replyOptions: {
			onReplyStart: resolvedOnReplyStart,
			onTypingCleanup: resolvedOnCleanup,
			onTypingController: (typing) => {
				typingController = typing;
			}
		},
		markDispatchIdle: () => {
			typingController?.markDispatchIdle();
			resolvedOnIdle?.();
		},
		markRunComplete: () => {
			typingController?.markRunComplete();
		}
	};
}
//#endregion
//#region src/auto-reply/dispatch.ts
async function withReplyDispatcher(params) {
	try {
		return await params.run();
	} finally {
		params.dispatcher.markComplete();
		try {
			await params.dispatcher.waitForIdle();
		} finally {
			await params.onSettled?.();
		}
	}
}
async function dispatchInboundMessage(params) {
	const finalized = finalizeInboundContext(params.ctx);
	return await withReplyDispatcher({
		dispatcher: params.dispatcher,
		run: () => dispatchReplyFromConfig({
			ctx: finalized,
			cfg: params.cfg,
			dispatcher: params.dispatcher,
			replyOptions: params.replyOptions,
			replyResolver: params.replyResolver
		})
	});
}
async function dispatchInboundMessageWithBufferedDispatcher(params) {
	const { dispatcher, replyOptions, markDispatchIdle, markRunComplete } = createReplyDispatcherWithTyping(params.dispatcherOptions);
	try {
		return await dispatchInboundMessage({
			ctx: params.ctx,
			cfg: params.cfg,
			dispatcher,
			replyResolver: params.replyResolver,
			replyOptions: {
				...params.replyOptions,
				...replyOptions
			}
		});
	} finally {
		markRunComplete();
		markDispatchIdle();
	}
}
async function dispatchInboundMessageWithDispatcher(params) {
	const dispatcher = createReplyDispatcher(params.dispatcherOptions);
	return await dispatchInboundMessage({
		ctx: params.ctx,
		cfg: params.cfg,
		dispatcher,
		replyResolver: params.replyResolver,
		replyOptions: params.replyOptions
	});
}
//#endregion
export { createReplyDispatcher as a, dispatchReplyFromConfig as c, withReplyDispatcher as i, resetInboundDedupe as l, dispatchInboundMessageWithBufferedDispatcher as n, createReplyDispatcherWithTyping as o, dispatchInboundMessageWithDispatcher as r, getTotalPendingReplies as s, dispatchInboundMessage as t };
