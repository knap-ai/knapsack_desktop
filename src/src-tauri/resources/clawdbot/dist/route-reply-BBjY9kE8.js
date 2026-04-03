import { v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { r as resolveEffectiveMessagesConfig } from "./identity-BVAU5Jb3.js";
import { i as hasReplyPayloadContent } from "./payload-CLtYAQwf.js";
import { a as shouldSuppressReasoningPayload, r as formatBtwTextForExternalDelivery } from "./reply-payloads-esYr_ziX.js";
import { t as buildOutboundSessionContext } from "./session-context-Be2O9afs.js";
import { t as normalizeReplyPayload } from "./normalize-reply-OmOn1Pmu.js";
//#region src/auto-reply/reply/route-reply.ts
/**
* Provider-agnostic reply router.
*
* Routes replies to the originating channel based on OriginatingChannel/OriginatingTo
* instead of using the session's lastChannel. This ensures replies go back to the
* provider where the message originated, even when the main session is shared
* across multiple providers.
*/
let deliverRuntimePromise = null;
function loadDeliverRuntime() {
	deliverRuntimePromise ??= import("./deliver-runtime-f1I-jaHP.js");
	return deliverRuntimePromise;
}
/**
* Routes a reply payload to the specified channel.
*
* This function provides a unified interface for sending messages to any
* supported provider. It's used by the followup queue to route replies
* back to the originating channel when OriginatingChannel/OriginatingTo
* are set.
*/
async function routeReply(params) {
	const { payload, channel, to, accountId, threadId, cfg, abortSignal } = params;
	if (shouldSuppressReasoningPayload(payload)) return { ok: true };
	const normalizedChannel = normalizeMessageChannel(channel);
	const channelId = normalizeChannelId(channel) ?? null;
	const plugin = channelId ? getChannelPlugin(channelId) : void 0;
	const resolvedAgentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: cfg
	}) : void 0;
	const normalized = normalizeReplyPayload(payload, {
		responsePrefix: params.sessionKey ? resolveEffectiveMessagesConfig(cfg, resolvedAgentId ?? resolveSessionAgentId({ config: cfg }), {
			channel: normalizedChannel,
			accountId
		}).responsePrefix : cfg.messages?.responsePrefix === "auto" ? void 0 : cfg.messages?.responsePrefix,
		enableSlackInteractiveReplies: plugin?.messaging?.enableInteractiveReplies?.({
			cfg,
			accountId
		})
	});
	if (!normalized) return { ok: true };
	const externalPayload = {
		...normalized,
		text: formatBtwTextForExternalDelivery(normalized)
	};
	let text = externalPayload.text ?? "";
	let mediaUrls = (externalPayload.mediaUrls?.filter(Boolean) ?? []).length ? externalPayload.mediaUrls?.filter(Boolean) : externalPayload.mediaUrl ? [externalPayload.mediaUrl] : [];
	const replyToId = externalPayload.replyToId;
	const hasChannelData = plugin?.messaging?.hasStructuredReplyPayload?.({ payload: externalPayload });
	if (!hasReplyPayloadContent({
		...externalPayload,
		text,
		mediaUrls
	}, { hasChannelData })) return { ok: true };
	if (channel === "webchat") return {
		ok: false,
		error: "Webchat routing not supported for queued replies"
	};
	if (!channelId) return {
		ok: false,
		error: `Unknown channel: ${String(channel)}`
	};
	if (abortSignal?.aborted) return {
		ok: false,
		error: "Reply routing aborted"
	};
	const replyTransport = plugin?.threading?.resolveReplyTransport?.({
		cfg,
		accountId,
		threadId,
		replyToId
	}) ?? null;
	const resolvedReplyToId = replyTransport?.replyToId ?? replyToId ?? ((channelId === "slack" || channelId === "mattermost") && threadId != null && threadId !== "" ? String(threadId) : void 0);
	const resolvedThreadId = replyTransport?.threadId ?? (channelId === "slack" ? null : threadId ?? null);
	try {
		const { deliverOutboundPayloads } = await loadDeliverRuntime();
		const outboundSession = buildOutboundSessionContext({
			cfg,
			agentId: resolvedAgentId,
			sessionKey: params.sessionKey
		});
		return {
			ok: true,
			messageId: (await deliverOutboundPayloads({
				cfg,
				channel: channelId,
				to,
				accountId: accountId ?? void 0,
				payloads: [externalPayload],
				replyToId: resolvedReplyToId ?? null,
				threadId: resolvedThreadId,
				session: outboundSession,
				abortSignal,
				mirror: params.mirror !== false && params.sessionKey ? {
					sessionKey: params.sessionKey,
					agentId: resolvedAgentId,
					text,
					mediaUrls,
					...params.isGroup != null ? { isGroup: params.isGroup } : {},
					...params.groupId ? { groupId: params.groupId } : {}
				} : void 0
			})).at(-1)?.messageId
		};
	} catch (err) {
		return {
			ok: false,
			error: `Failed to route reply to ${channel}: ${err instanceof Error ? err.message : String(err)}`
		};
	}
}
/**
* Checks if a channel type is routable via routeReply.
*
* Some channels (webchat) require special handling and cannot be routed through
* this generic interface.
*/
function isRoutableChannel(channel) {
	if (!channel || channel === "webchat") return false;
	return normalizeChannelId(channel) !== null;
}
//#endregion
export { routeReply as n, isRoutableChannel as t };
