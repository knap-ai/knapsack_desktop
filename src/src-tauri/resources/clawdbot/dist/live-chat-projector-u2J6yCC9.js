import { s as resolveAssistantEventPhase } from "./chat-message-content-yS6GJLKi.js";
import { i as stripInlineDirectiveTagsForDisplay } from "./directive-tags-B2h2NkjE.js";
import { a as stripInternalRuntimeContext } from "./internal-runtime-context-DrkxFr3e.js";
import { n as SILENT_REPLY_TOKEN, o as startsWithSilentToken, s as stripLeadingSilentToken } from "./tokens-D3yEVrkk.js";
import { n as isSuppressedControlReplyText, t as isSuppressedControlReplyLeadFragment } from "./control-reply-text-Dq5DFXNv.js";
//#region src/gateway/live-chat-projector.ts
function appendUniqueSuffix(base, suffix) {
	if (!suffix) return base;
	if (!base) return suffix;
	if (base.endsWith(suffix)) return base;
	const maxOverlap = Math.min(base.length, suffix.length);
	for (let overlap = maxOverlap; overlap > 0; overlap -= 1) if (base.slice(-overlap) === suffix.slice(0, overlap)) return base + suffix.slice(overlap);
	return base + suffix;
}
function resolveMergedAssistantText(params) {
	const { previousText, nextText, nextDelta } = params;
	if (nextText && previousText) {
		if (nextText.startsWith(previousText)) return nextText;
		if (previousText.startsWith(nextText) && !nextDelta) return previousText;
	}
	if (nextDelta) return appendUniqueSuffix(previousText, nextDelta);
	if (nextText) return nextText;
	return previousText;
}
function normalizeLiveAssistantEventText(params) {
	return {
		text: stripInternalRuntimeContext(stripInlineDirectiveTagsForDisplay(params.text).text),
		delta: typeof params.delta === "string" ? stripInternalRuntimeContext(stripInlineDirectiveTagsForDisplay(params.delta).text) : ""
	};
}
function projectLiveAssistantBufferedText(rawText, options) {
	if (!rawText) return {
		text: "",
		suppress: true,
		pendingLeadFragment: false
	};
	if (isSuppressedControlReplyText(rawText)) return {
		text: "",
		suppress: true,
		pendingLeadFragment: false
	};
	if (options?.suppressLeadFragments !== false && isSuppressedControlReplyLeadFragment(rawText)) return {
		text: rawText,
		suppress: true,
		pendingLeadFragment: true
	};
	const text = startsWithSilentToken(rawText, "NO_REPLY") ? stripLeadingSilentToken(rawText, SILENT_REPLY_TOKEN) : rawText;
	if (!text || isSuppressedControlReplyText(text)) return {
		text: "",
		suppress: true,
		pendingLeadFragment: false
	};
	if (options?.suppressLeadFragments !== false && isSuppressedControlReplyLeadFragment(text)) return {
		text,
		suppress: true,
		pendingLeadFragment: true
	};
	return {
		text,
		suppress: false,
		pendingLeadFragment: false
	};
}
function shouldSuppressAssistantEventForLiveChat(data) {
	return resolveAssistantEventPhase(data) === "commentary";
}
//#endregion
export { shouldSuppressAssistantEventForLiveChat as i, projectLiveAssistantBufferedText as n, resolveMergedAssistantText as r, normalizeLiveAssistantEventText as t };
