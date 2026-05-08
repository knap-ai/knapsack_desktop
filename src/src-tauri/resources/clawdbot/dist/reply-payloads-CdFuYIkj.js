import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as parseInlineDirectives } from "./directive-tags-B2h2NkjE.js";
import { a as hasReplyPayloadContent } from "./payload-Can1Co80.js";
import { r as resolveImplicitCurrentMessageReplyAllowance, t as createReplyToModeFilterForChannel } from "./reply-threading-BA5HnoRq.js";
import "./reply-payloads-dedupe-CL3jxgxf.js";
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
//#region src/auto-reply/reply/reply-payloads-base.ts
function formatBtwTextForExternalDelivery(payload) {
	const text = normalizeOptionalString(payload.text);
	if (!text) return payload.text;
	const question = normalizeOptionalString(payload.btw?.question);
	if (!question) return payload.text;
	const formatted = `BTW\nQuestion: ${question}\n\n${text}`;
	return text === formatted || text.startsWith("BTW\nQuestion:") ? text : formatted;
}
function resolveReplyThreadingForPayload(params) {
	const implicitReplyToId = normalizeOptionalString(params.implicitReplyToId);
	const currentMessageId = normalizeOptionalString(params.currentMessageId);
	const allowImplicitReplyToCurrentMessage = resolveImplicitCurrentMessageReplyAllowance(params.replyToMode, params.replyThreading);
	let resolved = params.payload.replyToId || params.payload.replyToCurrent === false || !implicitReplyToId || !allowImplicitReplyToCurrentMessage ? params.payload : {
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
	const { payloads, replyToMode, replyToChannel, currentMessageId, replyThreading } = params;
	const applyReplyToMode = createReplyToModeFilterForChannel(replyToMode, replyToChannel);
	const implicitReplyToId = normalizeOptionalString(currentMessageId);
	return payloads.map((payload) => resolveReplyThreadingForPayload({
		payload,
		replyToMode,
		implicitReplyToId,
		currentMessageId,
		replyThreading
	})).filter(isRenderablePayload).map(applyReplyToMode);
}
//#endregion
export { shouldSuppressReasoningPayload as a, isRenderablePayload as i, applyReplyThreading as n, formatBtwTextForExternalDelivery as r, applyReplyTagsToPayload as t };
