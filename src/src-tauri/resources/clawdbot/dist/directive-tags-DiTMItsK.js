//#region src/utils/directive-tags.ts
const AUDIO_TAG_RE = /\[\[\s*audio_as_voice\s*\]\]/gi;
const REPLY_TAG_RE = /\[\[\s*(?:reply_to_current|reply_to\s*:\s*([^\]\n]+))\s*\]\]/gi;
const INLINE_DIRECTIVE_TAG_WITH_PADDING_RE = /\s*(?:\[\[\s*audio_as_voice\s*\]\]|\[\[\s*(?:reply_to_current|reply_to\s*:\s*[^\]\n]+)\s*\]\])\s*/gi;
function replacementPreservesWordBoundary(source, offset, length) {
	const before = source[offset - 1];
	const after = source[offset + length];
	return before && after && !/\s/u.test(before) && !/\s/u.test(after) ? " " : "";
}
function normalizeDirectiveWhitespace(text) {
	return text.replace(/\r\n/g, "\n").replace(/([^\s])[ \t]{2,}([^\s])/g, "$1 $2").replace(/^\n+/, "").replace(/^[ \t](?=\S)/, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}
function stripInlineDirectiveTagsForDisplay(text) {
	if (!text) return {
		text,
		changed: false
	};
	const stripped = text.replace(AUDIO_TAG_RE, "").replace(REPLY_TAG_RE, "");
	return {
		text: stripped,
		changed: stripped !== text
	};
}
function stripInlineDirectiveTagsForDelivery(text) {
	if (!text) return {
		text,
		changed: false
	};
	const stripped = text.replace(INLINE_DIRECTIVE_TAG_WITH_PADDING_RE, " ");
	const changed = stripped !== text;
	return {
		text: changed ? stripped.trim() : text,
		changed
	};
}
function isMessageTextPart(part) {
	return Boolean(part) && part?.type === "text" && typeof part.text === "string";
}
/**
* Strips inline directive tags from message text blocks while preserving message shape.
* Empty post-strip text stays empty-string to preserve caller semantics.
*/
function stripInlineDirectiveTagsFromMessageForDisplay(message) {
	if (!message) return message;
	if (!Array.isArray(message.content)) return message;
	const cleaned = message.content.map((part) => {
		if (!part || typeof part !== "object") return part;
		const record = part;
		if (!isMessageTextPart(record)) return part;
		return {
			...record,
			text: stripInlineDirectiveTagsForDisplay(record.text).text
		};
	});
	return {
		...message,
		content: cleaned
	};
}
function parseInlineDirectives(text, options = {}) {
	const { currentMessageId, stripAudioTag = true, stripReplyTags = true } = options;
	if (!text) return {
		text: "",
		audioAsVoice: false,
		replyToCurrent: false,
		hasAudioTag: false,
		hasReplyTag: false
	};
	if (!text.includes("[[")) return {
		text: normalizeDirectiveWhitespace(text),
		audioAsVoice: false,
		replyToCurrent: false,
		hasAudioTag: false,
		hasReplyTag: false
	};
	let cleaned = text;
	let audioAsVoice = false;
	let hasAudioTag = false;
	let hasReplyTag = false;
	let sawCurrent = false;
	let lastExplicitId;
	cleaned = cleaned.replace(AUDIO_TAG_RE, (match, offset, source) => {
		audioAsVoice = true;
		hasAudioTag = true;
		return stripAudioTag ? replacementPreservesWordBoundary(source, offset, match.length) : match;
	});
	cleaned = cleaned.replace(REPLY_TAG_RE, (match, idRaw, offset, source) => {
		hasReplyTag = true;
		if (idRaw === void 0) sawCurrent = true;
		else {
			const id = idRaw.trim();
			if (id) lastExplicitId = id;
		}
		return stripReplyTags ? replacementPreservesWordBoundary(source, offset, match.length) : match;
	});
	cleaned = normalizeDirectiveWhitespace(cleaned);
	const replyToId = lastExplicitId ?? (sawCurrent ? currentMessageId?.trim() || void 0 : void 0);
	return {
		text: cleaned,
		audioAsVoice,
		replyToId,
		replyToExplicitId: lastExplicitId,
		replyToCurrent: sawCurrent,
		hasAudioTag,
		hasReplyTag
	};
}
//#endregion
export { stripInlineDirectiveTagsFromMessageForDisplay as i, stripInlineDirectiveTagsForDelivery as n, stripInlineDirectiveTagsForDisplay as r, parseInlineDirectives as t };
