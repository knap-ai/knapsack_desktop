import { buildMessagingTarget, parseMentionPrefixOrAtUserTarget, requireTargetKind } from "openclaw/plugin-sdk/messaging-targets";
import { chunkMarkdownTextWithMode } from "openclaw/plugin-sdk/reply-chunking";
//#region extensions/discord/src/target-parsing.ts
function parseDiscordTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const userTarget = parseMentionPrefixOrAtUserTarget({
		raw: trimmed,
		mentionPattern: /^<@!?(\d+)>$/,
		prefixes: [
			{
				prefix: "user:",
				kind: "user"
			},
			{
				prefix: "channel:",
				kind: "channel"
			},
			{
				prefix: "discord:",
				kind: "user"
			}
		],
		atUserPattern: /^\d+$/,
		atUserErrorMessage: "Discord DMs require a user id (use user:<id> or a <@id> mention)"
	});
	if (userTarget) return userTarget;
	if (/^\d+$/.test(trimmed)) {
		if (options.defaultKind) return buildMessagingTarget(options.defaultKind, trimmed, trimmed);
		throw new Error(options.ambiguousMessage ?? `Ambiguous Discord recipient "${trimmed}". Use "user:${trimmed}" for DMs or "channel:${trimmed}" for channel messages.`);
	}
	return buildMessagingTarget("channel", trimmed, trimmed);
}
function resolveDiscordChannelId(raw) {
	return requireTargetKind({
		platform: "Discord",
		target: parseDiscordTarget(raw, { defaultKind: "channel" }),
		kind: "channel"
	});
}
//#endregion
//#region extensions/discord/src/chunk.ts
const DEFAULT_MAX_CHARS = 2e3;
const DEFAULT_MAX_LINES = 17;
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
function countLines(text) {
	if (!text) return 0;
	return text.split("\n").length;
}
function parseFenceLine(line) {
	const match = line.match(FENCE_RE);
	if (!match) return null;
	const indent = match[1] ?? "";
	const marker = match[2] ?? "";
	return {
		indent,
		markerChar: marker[0] ?? "`",
		markerLen: marker.length,
		openLine: line
	};
}
function closeFenceLine(openFence) {
	return `${openFence.indent}${openFence.markerChar.repeat(openFence.markerLen)}`;
}
function closeFenceIfNeeded(text, openFence) {
	if (!openFence) return text;
	const closeLine = closeFenceLine(openFence);
	if (!text) return closeLine;
	if (!text.endsWith("\n")) return `${text}\n${closeLine}`;
	return `${text}${closeLine}`;
}
function splitLongLine(line, maxChars, opts) {
	const limit = Math.max(1, Math.floor(maxChars));
	if (line.length <= limit) return [line];
	const out = [];
	let remaining = line;
	while (remaining.length > limit) {
		if (opts.preserveWhitespace) {
			out.push(remaining.slice(0, limit));
			remaining = remaining.slice(limit);
			continue;
		}
		const window = remaining.slice(0, limit);
		let breakIdx = -1;
		for (let i = window.length - 1; i >= 0; i--) if (/\s/.test(window[i])) {
			breakIdx = i;
			break;
		}
		if (breakIdx <= 0) breakIdx = limit;
		out.push(remaining.slice(0, breakIdx));
		remaining = remaining.slice(breakIdx);
	}
	if (remaining.length) out.push(remaining);
	return out;
}
/**
* Chunks outbound Discord text by both character count and (soft) line count,
* while keeping fenced code blocks balanced across chunks.
*/
function chunkDiscordText(text, opts = {}) {
	const maxChars = Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS));
	const maxLines = Math.max(1, Math.floor(opts.maxLines ?? DEFAULT_MAX_LINES));
	const body = text ?? "";
	if (!body) return [];
	if (body.length <= maxChars && countLines(body) <= maxLines) return [body];
	const lines = body.split("\n");
	const chunks = [];
	let current = "";
	let currentLines = 0;
	let openFence = null;
	const flush = () => {
		if (!current) return;
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
		current = "";
		currentLines = 0;
		if (openFence) {
			current = openFence.openLine;
			currentLines = 1;
		}
	};
	for (const originalLine of lines) {
		const fenceInfo = parseFenceLine(originalLine);
		const wasInsideFence = openFence !== null;
		let nextOpenFence = openFence;
		if (fenceInfo) {
			if (!openFence) nextOpenFence = fenceInfo;
			else if (openFence.markerChar === fenceInfo.markerChar && fenceInfo.markerLen >= openFence.markerLen) nextOpenFence = null;
		}
		const reserveChars = nextOpenFence ? closeFenceLine(nextOpenFence).length + 1 : 0;
		const reserveLines = nextOpenFence ? 1 : 0;
		const effectiveMaxChars = maxChars - reserveChars;
		const effectiveMaxLines = maxLines - reserveLines;
		const charLimit = effectiveMaxChars > 0 ? effectiveMaxChars : maxChars;
		const lineLimit = effectiveMaxLines > 0 ? effectiveMaxLines : maxLines;
		const prefixLen = current.length > 0 ? current.length + 1 : 0;
		const segments = splitLongLine(originalLine, Math.max(1, charLimit - prefixLen), { preserveWhitespace: wasInsideFence });
		for (let segIndex = 0; segIndex < segments.length; segIndex++) {
			const segment = segments[segIndex];
			const isLineContinuation = segIndex > 0;
			const addition = `${isLineContinuation ? "" : current.length > 0 ? "\n" : ""}${segment}`;
			const nextLen = current.length + addition.length;
			const nextLines = currentLines + (isLineContinuation ? 0 : 1);
			if ((nextLen > charLimit || nextLines > lineLimit) && current.length > 0) flush();
			if (current.length > 0) {
				current += addition;
				if (!isLineContinuation) currentLines += 1;
			} else {
				current = segment;
				currentLines = 1;
			}
		}
		openFence = nextOpenFence;
	}
	if (current.length) {
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
	}
	return rebalanceReasoningItalics(text, chunks);
}
function chunkDiscordTextWithMode(text, opts) {
	if ((opts.chunkMode ?? "length") !== "newline") return chunkDiscordText(text, opts);
	const lineChunks = chunkMarkdownTextWithMode(text, Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS)), "newline");
	const chunks = [];
	for (const line of lineChunks) {
		const nested = chunkDiscordText(line, opts);
		if (!nested.length && line) {
			chunks.push(line);
			continue;
		}
		chunks.push(...nested);
	}
	return chunks;
}
function rebalanceReasoningItalics(source, chunks) {
	if (chunks.length <= 1) return chunks;
	if (!(source.startsWith("Reasoning:\n_") && source.trimEnd().endsWith("_"))) return chunks;
	const adjusted = [...chunks];
	for (let i = 0; i < adjusted.length; i++) {
		const isLast = i === adjusted.length - 1;
		const current = adjusted[i];
		if (!current.trimEnd().endsWith("_")) adjusted[i] = `${current}_`;
		if (isLast) break;
		const next = adjusted[i + 1];
		const leadingWhitespaceLen = next.length - next.trimStart().length;
		const leadingWhitespace = next.slice(0, leadingWhitespaceLen);
		const nextBody = next.slice(leadingWhitespaceLen);
		if (!nextBody.startsWith("_")) adjusted[i + 1] = `${leadingWhitespace}_${nextBody}`;
	}
	return adjusted;
}
//#endregion
export { parseDiscordTarget as n, resolveDiscordChannelId as r, chunkDiscordTextWithMode as t };
