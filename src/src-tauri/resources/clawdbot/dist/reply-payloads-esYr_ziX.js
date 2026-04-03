import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { i as hasReplyPayloadContent } from "./payload-CLtYAQwf.js";
import { t as parseInlineDirectives } from "./directive-tags-DiTMItsK.js";
import "./reply-payloads-dedupe-vIPnaLe1.js";
//#region src/auto-reply/reply/reply-tags.ts
function extractReplyToTag(text, currentMessageId) {
	const result = parseInlineDirectives(text, {
		currentMessageId,
		stripAudioTag: false
	});
	return {
		cleaned: result.text,
		replyToId: result.replyToId,
		replyToCurrent: result.replyToCurrent,
		hasTag: result.hasReplyTag
	};
}
//#endregion
//#region src/auto-reply/reply/reply-threading.ts
function resolveReplyToMode(cfg, channel, accountId, chatType) {
	const provider = normalizeChannelId(channel);
	if (!provider) return "all";
	return getChannelPlugin(provider)?.threading?.resolveReplyToMode?.({
		cfg,
		accountId,
		chatType
	}) ?? "all";
}
function createReplyToModeFilter(mode, opts = {}) {
	let hasThreaded = false;
	return (payload) => {
		if (!payload.replyToId) return payload;
		if (mode === "off") {
			const isExplicit = Boolean(payload.replyToTag) || Boolean(payload.replyToCurrent);
			if (opts.allowExplicitReplyTagsWhenOff && isExplicit && !payload.isCompactionNotice) return payload;
			return {
				...payload,
				replyToId: void 0
			};
		}
		if (mode === "all") return payload;
		if (hasThreaded) {
			if (payload.isCompactionNotice) return payload;
			return {
				...payload,
				replyToId: void 0
			};
		}
		if (!payload.isCompactionNotice) hasThreaded = true;
		return payload;
	};
}
function createReplyToModeFilterForChannel(mode, channel) {
	const provider = normalizeChannelId(channel);
	const isWebchat = (typeof channel === "string" ? channel.trim().toLowerCase() : void 0) === "webchat";
	const threading = provider ? getChannelPlugin(provider)?.threading : void 0;
	return createReplyToModeFilter(mode, { allowExplicitReplyTagsWhenOff: provider ? threading?.allowExplicitReplyTagsWhenOff ?? threading?.allowTagsWhenOff ?? true : isWebchat });
}
//#endregion
//#region src/auto-reply/reply/reply-payloads-base.ts
function formatBtwTextForExternalDelivery(payload) {
	const text = payload.text?.trim();
	if (!text) return payload.text;
	const question = payload.btw?.question?.trim();
	if (!question) return payload.text;
	const formatted = `BTW\nQuestion: ${question}\n\n${text}`;
	return text === formatted || text.startsWith("BTW\nQuestion:") ? text : formatted;
}
function resolveReplyThreadingForPayload(params) {
	const implicitReplyToId = params.implicitReplyToId?.trim() || void 0;
	const currentMessageId = params.currentMessageId?.trim() || void 0;
	let resolved = params.payload.replyToId || params.payload.replyToCurrent === false || !implicitReplyToId ? params.payload : {
		...params.payload,
		replyToId: implicitReplyToId
	};
	if (typeof resolved.text === "string" && resolved.text.includes("[[")) {
		const { cleaned, replyToId, replyToCurrent, hasTag } = extractReplyToTag(resolved.text, currentMessageId);
		resolved = {
			...resolved,
			text: cleaned ? cleaned : void 0,
			replyToId: replyToId ?? resolved.replyToId,
			replyToTag: hasTag || resolved.replyToTag,
			replyToCurrent: replyToCurrent || resolved.replyToCurrent
		};
	}
	if (resolved.replyToCurrent && !resolved.replyToId && currentMessageId) resolved = {
		...resolved,
		replyToId: currentMessageId
	};
	return resolved;
}
function applyReplyTagsToPayload(payload, currentMessageId) {
	return resolveReplyThreadingForPayload({
		payload,
		currentMessageId
	});
}
function isRenderablePayload(payload) {
	return hasReplyPayloadContent(payload, { extraContent: payload.audioAsVoice });
}
function shouldSuppressReasoningPayload(payload) {
	return payload.isReasoning === true;
}
function applyReplyThreading(params) {
	const { payloads, replyToMode, replyToChannel, currentMessageId } = params;
	const applyReplyToMode = createReplyToModeFilterForChannel(replyToMode, replyToChannel);
	const implicitReplyToId = currentMessageId?.trim() || void 0;
	return payloads.map((payload) => resolveReplyThreadingForPayload({
		payload,
		implicitReplyToId,
		currentMessageId
	})).filter(isRenderablePayload).map(applyReplyToMode);
}
//#endregion
export { shouldSuppressReasoningPayload as a, isRenderablePayload as i, applyReplyThreading as n, createReplyToModeFilterForChannel as o, formatBtwTextForExternalDelivery as r, resolveReplyToMode as s, applyReplyTagsToPayload as t };
