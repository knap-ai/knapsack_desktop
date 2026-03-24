import { l as escapeRegExp } from "./utils-CS0Ikux6.js";
//#region src/auto-reply/tokens.ts
const HEARTBEAT_TOKEN = "HEARTBEAT_OK";
const SILENT_REPLY_TOKEN = "NO_REPLY";
const silentExactRegexByToken = /* @__PURE__ */ new Map();
const silentTrailingRegexByToken = /* @__PURE__ */ new Map();
function getSilentExactRegex(token) {
	const cached = silentExactRegexByToken.get(token);
	if (cached) return cached;
	const escaped = escapeRegExp(token);
	const regex = new RegExp(`^\\s*${escaped}\\s*$`);
	silentExactRegexByToken.set(token, regex);
	return regex;
}
function getSilentTrailingRegex(token) {
	const cached = silentTrailingRegexByToken.get(token);
	if (cached) return cached;
	const escaped = escapeRegExp(token);
	const regex = new RegExp(`(?:^|\\s+|\\*+)${escaped}\\s*$`);
	silentTrailingRegexByToken.set(token, regex);
	return regex;
}
function isSilentReplyText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	return getSilentExactRegex(token).test(text);
}
/**
* Strip a trailing silent reply token from mixed-content text.
* Returns the remaining text with the token removed (trimmed).
* If the result is empty, the entire message should be treated as silent.
*/
function stripSilentToken(text, token = SILENT_REPLY_TOKEN) {
	return text.replace(getSilentTrailingRegex(token), "").trim();
}
function isSilentReplyPrefixText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	const trimmed = text.trimStart();
	if (!trimmed) return false;
	if (trimmed !== trimmed.toUpperCase()) return false;
	const normalized = trimmed.toUpperCase();
	if (!normalized) return false;
	if (normalized.length < 2) return false;
	if (/[^A-Z_]/.test(normalized)) return false;
	const tokenUpper = token.toUpperCase();
	if (!tokenUpper.startsWith(normalized)) return false;
	if (normalized.includes("_")) return true;
	return tokenUpper === "NO_REPLY" && normalized === "NO";
}
//#endregion
//#region src/auto-reply/heartbeat.ts
const HEARTBEAT_PROMPT = "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.";
const DEFAULT_HEARTBEAT_ACK_MAX_CHARS = 300;
/**
* Check if HEARTBEAT.md content is "effectively empty" - meaning it has no actionable tasks.
* This allows skipping heartbeat API calls when no tasks are configured.
*
* A file is considered effectively empty if it contains only:
* - Whitespace
* - Comment lines (lines starting with #)
* - Empty lines
*
* Note: A missing file returns false (not effectively empty) so the LLM can still
* decide what to do. This function is only for when the file exists but has no content.
*/
function isHeartbeatContentEffectivelyEmpty(content) {
	if (content === void 0 || content === null) return false;
	if (typeof content !== "string") return false;
	const lines = content.split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		if (/^#+(\s|$)/.test(trimmed)) continue;
		if (/^[-*+]\s*(\[[\sXx]?\]\s*)?$/.test(trimmed)) continue;
		return false;
	}
	return true;
}
function resolveHeartbeatPrompt(raw) {
	return (typeof raw === "string" ? raw.trim() : "") || "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.";
}
function stripTokenAtEdges(raw) {
	let text = raw.trim();
	if (!text) return {
		text: "",
		didStrip: false
	};
	const token = HEARTBEAT_TOKEN;
	const tokenAtEndWithOptionalTrailingPunctuation = new RegExp(`${escapeRegExp(token)}[^\\w]{0,4}$`);
	if (!text.includes(token)) return {
		text,
		didStrip: false
	};
	let didStrip = false;
	let changed = true;
	while (changed) {
		changed = false;
		const next = text.trim();
		if (next.startsWith(token)) {
			text = next.slice(12).trimStart();
			didStrip = true;
			changed = true;
			continue;
		}
		if (tokenAtEndWithOptionalTrailingPunctuation.test(next)) {
			const idx = next.lastIndexOf(token);
			const before = next.slice(0, idx).trimEnd();
			if (!before) text = "";
			else text = `${before}${next.slice(idx + 12).trimStart()}`.trimEnd();
			didStrip = true;
			changed = true;
		}
	}
	return {
		text: text.replace(/\s+/g, " ").trim(),
		didStrip
	};
}
function stripHeartbeatToken(raw, opts = {}) {
	if (!raw) return {
		shouldSkip: true,
		text: "",
		didStrip: false
	};
	const trimmed = raw.trim();
	if (!trimmed) return {
		shouldSkip: true,
		text: "",
		didStrip: false
	};
	const mode = opts.mode ?? "message";
	const maxAckCharsRaw = opts.maxAckChars;
	const parsedAckChars = typeof maxAckCharsRaw === "string" ? Number(maxAckCharsRaw) : maxAckCharsRaw;
	const maxAckChars = Math.max(0, typeof parsedAckChars === "number" && Number.isFinite(parsedAckChars) ? parsedAckChars : 300);
	const stripMarkup = (text) => text.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/^[*`~_]+/, "").replace(/[*`~_]+$/, "");
	const trimmedNormalized = stripMarkup(trimmed);
	if (!(trimmed.includes("HEARTBEAT_OK") || trimmedNormalized.includes("HEARTBEAT_OK"))) return {
		shouldSkip: false,
		text: trimmed,
		didStrip: false
	};
	const strippedOriginal = stripTokenAtEdges(trimmed);
	const strippedNormalized = stripTokenAtEdges(trimmedNormalized);
	const picked = strippedOriginal.didStrip && strippedOriginal.text ? strippedOriginal : strippedNormalized;
	if (!picked.didStrip) return {
		shouldSkip: false,
		text: trimmed,
		didStrip: false
	};
	if (!picked.text) return {
		shouldSkip: true,
		text: "",
		didStrip: true
	};
	const rest = picked.text.trim();
	if (mode === "heartbeat") {
		if (rest.length <= maxAckChars) return {
			shouldSkip: true,
			text: "",
			didStrip: true
		};
	}
	return {
		shouldSkip: false,
		text: rest,
		didStrip: true
	};
}
//#endregion
export { stripHeartbeatToken as a, isSilentReplyPrefixText as c, resolveHeartbeatPrompt as i, isSilentReplyText as l, HEARTBEAT_PROMPT as n, HEARTBEAT_TOKEN as o, isHeartbeatContentEffectivelyEmpty as r, SILENT_REPLY_TOKEN as s, DEFAULT_HEARTBEAT_ACK_MAX_CHARS as t, stripSilentToken as u };
