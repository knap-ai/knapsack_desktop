import { l as escapeRegExp } from "./utils-CS0Ikux6.js";
import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { t as resolveAccountEntry } from "./account-lookup-C4CvUou_.js";
import "./message-channel-BliByQBl.js";
import MarkdownIt from "markdown-it";
//#region src/markdown/fences.ts
function parseFenceSpans(buffer) {
	const spans = [];
	let open;
	let offset = 0;
	while (offset <= buffer.length) {
		const nextNewline = buffer.indexOf("\n", offset);
		const lineEnd = nextNewline === -1 ? buffer.length : nextNewline;
		const line = buffer.slice(offset, lineEnd);
		const match = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
		if (match) {
			const indent = match[1];
			const marker = match[2];
			const markerChar = marker[0];
			const markerLen = marker.length;
			if (!open) open = {
				start: offset,
				markerChar,
				markerLen,
				openLine: line,
				marker,
				indent
			};
			else if (open.markerChar === markerChar && markerLen >= open.markerLen) {
				const end = lineEnd;
				spans.push({
					start: open.start,
					end,
					openLine: open.openLine,
					marker: open.marker,
					indent: open.indent
				});
				open = void 0;
			}
		}
		if (nextNewline === -1) break;
		offset = nextNewline + 1;
	}
	if (open) spans.push({
		start: open.start,
		end: buffer.length,
		openLine: open.openLine,
		marker: open.marker,
		indent: open.indent
	});
	return spans;
}
function findFenceSpanAt(spans, index) {
	let low = 0;
	let high = spans.length - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const span = spans[mid];
		if (!span) break;
		if (index <= span.start) {
			high = mid - 1;
			continue;
		}
		if (index >= span.end) {
			low = mid + 1;
			continue;
		}
		return span;
	}
}
function isSafeFenceBreak(spans, index) {
	return !findFenceSpanAt(spans, index);
}
//#endregion
//#region src/shared/text/code-regions.ts
function findCodeRegions(text) {
	const regions = [];
	for (const match of text.matchAll(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2(?:\n|$)|$)/g)) {
		const start = (match.index ?? 0) + match[1].length;
		regions.push({
			start,
			end: start + match[0].length - match[1].length
		});
	}
	for (const match of text.matchAll(/`+[^`]+`+/g)) {
		const start = match.index ?? 0;
		const end = start + match[0].length;
		if (!regions.some((r) => start >= r.start && end <= r.end)) regions.push({
			start,
			end
		});
	}
	regions.sort((a, b) => a.start - b.start);
	return regions;
}
function isInsideCode(pos, regions) {
	return regions.some((r) => pos >= r.start && pos < r.end);
}
//#endregion
//#region src/shared/text/reasoning-tags.ts
const QUICK_TAG_RE = /<\s*\/?\s*(?:think(?:ing)?|thought|antthinking|final)\b/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>/gi;
function applyTrim(value, mode) {
	if (mode === "none") return value;
	if (mode === "start") return value.trimStart();
	return value.trim();
}
function stripReasoningTagsFromText(text, options) {
	if (!text) return text;
	if (!QUICK_TAG_RE.test(text)) return text;
	const mode = options?.mode ?? "strict";
	const trimMode = options?.trim ?? "both";
	let cleaned = text;
	if (FINAL_TAG_RE.test(cleaned)) {
		FINAL_TAG_RE.lastIndex = 0;
		const finalMatches = [];
		const preCodeRegions = findCodeRegions(cleaned);
		for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
			const start = match.index ?? 0;
			finalMatches.push({
				start,
				length: match[0].length,
				inCode: isInsideCode(start, preCodeRegions)
			});
		}
		for (let i = finalMatches.length - 1; i >= 0; i--) {
			const m = finalMatches[i];
			if (!m.inCode) cleaned = cleaned.slice(0, m.start) + cleaned.slice(m.start + m.length);
		}
	} else FINAL_TAG_RE.lastIndex = 0;
	const codeRegions = findCodeRegions(cleaned);
	THINKING_TAG_RE.lastIndex = 0;
	let result = "";
	let lastIndex = 0;
	let inThinking = false;
	for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
		const idx = match.index ?? 0;
		const isClose = match[1] === "/";
		if (isInsideCode(idx, codeRegions)) continue;
		if (!inThinking) {
			result += cleaned.slice(lastIndex, idx);
			if (!isClose) inThinking = true;
		} else if (isClose) inThinking = false;
		lastIndex = idx + match[0].length;
	}
	if (!inThinking || mode === "preserve") result += cleaned.slice(lastIndex);
	return applyTrim(result, trimMode);
}
//#endregion
//#region src/shared/string-sample.ts
function summarizeStringEntries(params) {
	const entries = params.entries ?? [];
	if (entries.length === 0) return params.emptyText ?? "";
	const limit = Math.max(1, Math.floor(params.limit ?? 6));
	const sample = entries.slice(0, limit);
	const suffix = entries.length > sample.length ? ` (+${entries.length - sample.length})` : "";
	return `${sample.join(", ")}${suffix}`;
}
//#endregion
//#region src/shared/text-chunking.ts
function chunkTextByBreakResolver(text, limit, resolveBreakIndex) {
	if (!text) return [];
	if (limit <= 0 || text.length <= limit) return [text];
	const chunks = [];
	let remaining = text;
	while (remaining.length > limit) {
		const candidateBreak = resolveBreakIndex(remaining.slice(0, limit));
		const breakIdx = Number.isFinite(candidateBreak) && candidateBreak > 0 && candidateBreak <= limit ? candidateBreak : limit;
		const chunk = remaining.slice(0, breakIdx).trimEnd();
		if (chunk.length > 0) chunks.push(chunk);
		const brokeOnSeparator = breakIdx < remaining.length && /\s/.test(remaining[breakIdx]);
		const nextStart = Math.min(remaining.length, breakIdx + (brokeOnSeparator ? 1 : 0));
		remaining = remaining.slice(nextStart).trimStart();
	}
	if (remaining.length) chunks.push(remaining);
	return chunks;
}
//#endregion
//#region src/auto-reply/chunk.ts
const DEFAULT_CHUNK_LIMIT = 4e3;
const DEFAULT_CHUNK_MODE = "length";
function resolveChunkLimitForProvider(cfgSection, accountId) {
	if (!cfgSection) return;
	const normalizedAccountId = normalizeAccountId(accountId);
	const accounts = cfgSection.accounts;
	if (accounts && typeof accounts === "object") {
		const direct = resolveAccountEntry(accounts, normalizedAccountId);
		if (typeof direct?.textChunkLimit === "number") return direct.textChunkLimit;
	}
	return cfgSection.textChunkLimit;
}
function resolveTextChunkLimit(cfg, provider, accountId, opts) {
	const fallback = typeof opts?.fallbackLimit === "number" && opts.fallbackLimit > 0 ? opts.fallbackLimit : DEFAULT_CHUNK_LIMIT;
	const providerOverride = (() => {
		if (!provider || provider === "webchat") return;
		return resolveChunkLimitForProvider((cfg?.channels)?.[provider] ?? cfg?.[provider], accountId);
	})();
	if (typeof providerOverride === "number" && providerOverride > 0) return providerOverride;
	return fallback;
}
function resolveChunkModeForProvider(cfgSection, accountId) {
	if (!cfgSection) return;
	const normalizedAccountId = normalizeAccountId(accountId);
	const accounts = cfgSection.accounts;
	if (accounts && typeof accounts === "object") {
		const direct = resolveAccountEntry(accounts, normalizedAccountId);
		if (direct?.chunkMode) return direct.chunkMode;
	}
	return cfgSection.chunkMode;
}
function resolveChunkMode(cfg, provider, accountId) {
	if (!provider || provider === "webchat") return DEFAULT_CHUNK_MODE;
	return resolveChunkModeForProvider((cfg?.channels)?.[provider] ?? cfg?.[provider], accountId) ?? DEFAULT_CHUNK_MODE;
}
/**
* Split text on newlines, trimming line whitespace.
* Blank lines are folded into the next non-empty line as leading "\n" prefixes.
* Long lines can be split by length (default) or kept intact via splitLongLines:false.
*/
function chunkByNewline(text, maxLineLength, opts) {
	if (!text) return [];
	if (maxLineLength <= 0) return text.trim() ? [text] : [];
	const splitLongLines = opts?.splitLongLines !== false;
	const trimLines = opts?.trimLines !== false;
	const lines = splitByNewline(text, opts?.isSafeBreak);
	const chunks = [];
	let pendingBlankLines = 0;
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) {
			pendingBlankLines += 1;
			continue;
		}
		const maxPrefix = Math.max(0, maxLineLength - 1);
		const cappedBlankLines = pendingBlankLines > 0 ? Math.min(pendingBlankLines, maxPrefix) : 0;
		const prefix = cappedBlankLines > 0 ? "\n".repeat(cappedBlankLines) : "";
		pendingBlankLines = 0;
		const lineValue = trimLines ? trimmed : line;
		if (!splitLongLines || lineValue.length + prefix.length <= maxLineLength) {
			chunks.push(prefix + lineValue);
			continue;
		}
		const firstLimit = Math.max(1, maxLineLength - prefix.length);
		const first = lineValue.slice(0, firstLimit);
		chunks.push(prefix + first);
		const remaining = lineValue.slice(firstLimit);
		if (remaining) chunks.push(...chunkText(remaining, maxLineLength));
	}
	if (pendingBlankLines > 0 && chunks.length > 0) chunks[chunks.length - 1] += "\n".repeat(pendingBlankLines);
	return chunks;
}
/**
* Split text into chunks on paragraph boundaries (blank lines), preserving lists and
* single-newline line wraps inside paragraphs.
*
* - Only breaks at paragraph separators ("\n\n" or more, allowing whitespace on blank lines)
* - Packs multiple paragraphs into a single chunk up to `limit`
* - Falls back to length-based splitting when a single paragraph exceeds `limit`
*   (unless `splitLongParagraphs` is disabled)
*/
function chunkByParagraph(text, limit, opts) {
	if (!text) return [];
	if (limit <= 0) return [text];
	const splitLongParagraphs = opts?.splitLongParagraphs !== false;
	const normalized = text.replace(/\r\n?/g, "\n");
	if (!/\n[\t ]*\n+/.test(normalized)) {
		if (normalized.length <= limit) return [normalized];
		if (!splitLongParagraphs) return [normalized];
		return chunkText(normalized, limit);
	}
	const spans = parseFenceSpans(normalized);
	const parts = [];
	const re = /\n[\t ]*\n+/g;
	let lastIndex = 0;
	for (const match of normalized.matchAll(re)) {
		const idx = match.index ?? 0;
		if (!isSafeFenceBreak(spans, idx)) continue;
		parts.push(normalized.slice(lastIndex, idx));
		lastIndex = idx + match[0].length;
	}
	parts.push(normalized.slice(lastIndex));
	const chunks = [];
	for (const part of parts) {
		const paragraph = part.replace(/\s+$/g, "");
		if (!paragraph.trim()) continue;
		if (paragraph.length <= limit) chunks.push(paragraph);
		else if (!splitLongParagraphs) chunks.push(paragraph);
		else chunks.push(...chunkText(paragraph, limit));
	}
	return chunks;
}
/**
* Unified chunking function that dispatches based on mode.
*/
function chunkTextWithMode(text, limit, mode) {
	if (mode === "newline") return chunkByParagraph(text, limit);
	return chunkText(text, limit);
}
function chunkMarkdownTextWithMode(text, limit, mode) {
	if (mode === "newline") {
		const paragraphChunks = chunkByParagraph(text, limit, { splitLongParagraphs: false });
		const out = [];
		for (const chunk of paragraphChunks) {
			const nested = chunkMarkdownText(chunk, limit);
			if (!nested.length && chunk) out.push(chunk);
			else out.push(...nested);
		}
		return out;
	}
	return chunkMarkdownText(text, limit);
}
function splitByNewline(text, isSafeBreak = () => true) {
	const lines = [];
	let start = 0;
	for (let i = 0; i < text.length; i++) if (text[i] === "\n" && isSafeBreak(i)) {
		lines.push(text.slice(start, i));
		start = i + 1;
	}
	lines.push(text.slice(start));
	return lines;
}
function resolveChunkEarlyReturn(text, limit) {
	if (!text) return [];
	if (limit <= 0) return [text];
	if (text.length <= limit) return [text];
}
function chunkText(text, limit) {
	const early = resolveChunkEarlyReturn(text, limit);
	if (early) return early;
	return chunkTextByBreakResolver(text, limit, (window) => {
		const { lastNewline, lastWhitespace } = scanParenAwareBreakpoints(window, 0, window.length);
		return lastNewline > 0 ? lastNewline : lastWhitespace;
	});
}
function chunkMarkdownText(text, limit) {
	const early = resolveChunkEarlyReturn(text, limit);
	if (early) return early;
	const chunks = [];
	const spans = parseFenceSpans(text);
	let start = 0;
	let reopenFence;
	while (start < text.length) {
		const reopenPrefix = reopenFence ? `${reopenFence.openLine}\n` : "";
		const contentLimit = Math.max(1, limit - reopenPrefix.length);
		if (text.length - start <= contentLimit) {
			const finalChunk = `${reopenPrefix}${text.slice(start)}`;
			if (finalChunk.length > 0) chunks.push(finalChunk);
			break;
		}
		const windowEnd = Math.min(text.length, start + contentLimit);
		const softBreak = pickSafeBreakIndex(text, start, windowEnd, spans);
		let breakIdx = softBreak > start ? softBreak : windowEnd;
		const initialFence = isSafeFenceBreak(spans, breakIdx) ? void 0 : findFenceSpanAt(spans, breakIdx);
		let fenceToSplit = initialFence;
		if (initialFence) {
			const closeLine = `${initialFence.indent}${initialFence.marker}`;
			const maxIdxIfNeedNewline = start + (contentLimit - (closeLine.length + 1));
			if (maxIdxIfNeedNewline <= start) {
				fenceToSplit = void 0;
				breakIdx = windowEnd;
			} else {
				const minProgressIdx = Math.min(text.length, Math.max(start + 1, initialFence.start + initialFence.openLine.length + 2));
				const maxIdxIfAlreadyNewline = start + (contentLimit - closeLine.length);
				let pickedNewline = false;
				let lastNewline = text.lastIndexOf("\n", Math.max(start, maxIdxIfAlreadyNewline - 1));
				while (lastNewline >= start) {
					const candidateBreak = lastNewline + 1;
					if (candidateBreak < minProgressIdx) break;
					const candidateFence = findFenceSpanAt(spans, candidateBreak);
					if (candidateFence && candidateFence.start === initialFence.start) {
						breakIdx = candidateBreak;
						pickedNewline = true;
						break;
					}
					lastNewline = text.lastIndexOf("\n", lastNewline - 1);
				}
				if (!pickedNewline) if (minProgressIdx > maxIdxIfAlreadyNewline) {
					fenceToSplit = void 0;
					breakIdx = windowEnd;
				} else breakIdx = Math.max(minProgressIdx, maxIdxIfNeedNewline);
			}
			const fenceAtBreak = findFenceSpanAt(spans, breakIdx);
			fenceToSplit = fenceAtBreak && fenceAtBreak.start === initialFence.start ? fenceAtBreak : void 0;
		}
		const rawContent = text.slice(start, breakIdx);
		if (!rawContent) break;
		let rawChunk = `${reopenPrefix}${rawContent}`;
		const brokeOnSeparator = breakIdx < text.length && /\s/.test(text[breakIdx]);
		let nextStart = Math.min(text.length, breakIdx + (brokeOnSeparator ? 1 : 0));
		if (fenceToSplit) {
			const closeLine = `${fenceToSplit.indent}${fenceToSplit.marker}`;
			rawChunk = rawChunk.endsWith("\n") ? `${rawChunk}${closeLine}` : `${rawChunk}\n${closeLine}`;
			reopenFence = fenceToSplit;
		} else {
			nextStart = skipLeadingNewlines(text, nextStart);
			reopenFence = void 0;
		}
		chunks.push(rawChunk);
		start = nextStart;
	}
	return chunks;
}
function skipLeadingNewlines(value, start = 0) {
	let i = start;
	while (i < value.length && value[i] === "\n") i++;
	return i;
}
function pickSafeBreakIndex(text, start, end, spans) {
	const { lastNewline, lastWhitespace } = scanParenAwareBreakpoints(text, start, end, (index) => isSafeFenceBreak(spans, index));
	if (lastNewline > start) return lastNewline;
	if (lastWhitespace > start) return lastWhitespace;
	return -1;
}
function scanParenAwareBreakpoints(text, start, end, isAllowed = () => true) {
	let lastNewline = -1;
	let lastWhitespace = -1;
	let depth = 0;
	for (let i = start; i < end; i++) {
		if (!isAllowed(i)) continue;
		const char = text[i];
		if (char === "(") {
			depth += 1;
			continue;
		}
		if (char === ")" && depth > 0) {
			depth -= 1;
			continue;
		}
		if (depth !== 0) continue;
		if (char === "\n") lastNewline = i;
		else if (/\s/.test(char)) lastWhitespace = i;
	}
	return {
		lastNewline,
		lastWhitespace
	};
}
//#endregion
//#region src/markdown/ir.ts
function createMarkdownIt(options) {
	const md = new MarkdownIt({
		html: false,
		linkify: options.linkify ?? true,
		breaks: false,
		typographer: false
	});
	md.enable("strikethrough");
	if (options.tableMode && options.tableMode !== "off") md.enable("table");
	else md.disable("table");
	if (options.autolink === false) md.disable("autolink");
	return md;
}
function getAttr(token, name) {
	if (token.attrGet) return token.attrGet(name);
	if (token.attrs) {
		for (const [key, value] of token.attrs) if (key === name) return value;
	}
	return null;
}
function createTextToken(base, content) {
	return {
		...base,
		type: "text",
		content,
		children: void 0
	};
}
function applySpoilerTokens(tokens) {
	for (const token of tokens) if (token.children && token.children.length > 0) token.children = injectSpoilersIntoInline(token.children);
}
function injectSpoilersIntoInline(tokens) {
	let totalDelims = 0;
	for (const token of tokens) {
		if (token.type !== "text") continue;
		const content = token.content ?? "";
		let i = 0;
		while (i < content.length) {
			const next = content.indexOf("||", i);
			if (next === -1) break;
			totalDelims += 1;
			i = next + 2;
		}
	}
	if (totalDelims < 2) return tokens;
	const usableDelims = totalDelims - totalDelims % 2;
	const result = [];
	const state = { spoilerOpen: false };
	let consumedDelims = 0;
	for (const token of tokens) {
		if (token.type !== "text") {
			result.push(token);
			continue;
		}
		const content = token.content ?? "";
		if (!content.includes("||")) {
			result.push(token);
			continue;
		}
		let index = 0;
		while (index < content.length) {
			const next = content.indexOf("||", index);
			if (next === -1) {
				if (index < content.length) result.push(createTextToken(token, content.slice(index)));
				break;
			}
			if (consumedDelims >= usableDelims) {
				result.push(createTextToken(token, content.slice(index)));
				break;
			}
			if (next > index) result.push(createTextToken(token, content.slice(index, next)));
			consumedDelims += 1;
			state.spoilerOpen = !state.spoilerOpen;
			result.push({ type: state.spoilerOpen ? "spoiler_open" : "spoiler_close" });
			index = next + 2;
		}
	}
	return result;
}
function initRenderTarget() {
	return {
		text: "",
		styles: [],
		openStyles: [],
		links: [],
		linkStack: []
	};
}
function resolveRenderTarget(state) {
	return state.table?.currentCell ?? state;
}
function appendText(state, value) {
	if (!value) return;
	const target = resolveRenderTarget(state);
	target.text += value;
}
function openStyle(state, style) {
	const target = resolveRenderTarget(state);
	target.openStyles.push({
		style,
		start: target.text.length
	});
}
function closeStyle(state, style) {
	const target = resolveRenderTarget(state);
	for (let i = target.openStyles.length - 1; i >= 0; i -= 1) if (target.openStyles[i]?.style === style) {
		const start = target.openStyles[i].start;
		target.openStyles.splice(i, 1);
		const end = target.text.length;
		if (end > start) target.styles.push({
			start,
			end,
			style
		});
		return;
	}
}
function appendParagraphSeparator(state) {
	if (state.env.listStack.length > 0) return;
	if (state.table) return;
	state.text += "\n\n";
}
function appendListPrefix(state) {
	const stack = state.env.listStack;
	const top = stack[stack.length - 1];
	if (!top) return;
	top.index += 1;
	const indent = "  ".repeat(Math.max(0, stack.length - 1));
	const prefix = top.type === "ordered" ? `${top.index}. ` : "• ";
	state.text += `${indent}${prefix}`;
}
function renderInlineCode(state, content) {
	if (!content) return;
	const target = resolveRenderTarget(state);
	const start = target.text.length;
	target.text += content;
	target.styles.push({
		start,
		end: start + content.length,
		style: "code"
	});
}
function renderCodeBlock(state, content) {
	let code = content ?? "";
	if (!code.endsWith("\n")) code = `${code}\n`;
	const target = resolveRenderTarget(state);
	const start = target.text.length;
	target.text += code;
	target.styles.push({
		start,
		end: start + code.length,
		style: "code_block"
	});
	if (state.env.listStack.length === 0) target.text += "\n";
}
function handleLinkClose(state) {
	const target = resolveRenderTarget(state);
	const link = target.linkStack.pop();
	if (!link?.href) return;
	const href = link.href.trim();
	if (!href) return;
	const start = link.labelStart;
	const end = target.text.length;
	if (end <= start) {
		target.links.push({
			start,
			end,
			href
		});
		return;
	}
	target.links.push({
		start,
		end,
		href
	});
}
function initTableState() {
	return {
		headers: [],
		rows: [],
		currentRow: [],
		currentCell: null,
		inHeader: false
	};
}
function finishTableCell(cell) {
	closeRemainingStyles(cell);
	return {
		text: cell.text,
		styles: cell.styles,
		links: cell.links
	};
}
function trimCell(cell) {
	const text = cell.text;
	let start = 0;
	let end = text.length;
	while (start < end && /\s/.test(text[start] ?? "")) start += 1;
	while (end > start && /\s/.test(text[end - 1] ?? "")) end -= 1;
	if (start === 0 && end === text.length) return cell;
	const trimmedText = text.slice(start, end);
	const trimmedLength = trimmedText.length;
	const trimmedStyles = [];
	for (const span of cell.styles) {
		const sliceStart = Math.max(0, span.start - start);
		const sliceEnd = Math.min(trimmedLength, span.end - start);
		if (sliceEnd > sliceStart) trimmedStyles.push({
			start: sliceStart,
			end: sliceEnd,
			style: span.style
		});
	}
	const trimmedLinks = [];
	for (const span of cell.links) {
		const sliceStart = Math.max(0, span.start - start);
		const sliceEnd = Math.min(trimmedLength, span.end - start);
		if (sliceEnd > sliceStart) trimmedLinks.push({
			start: sliceStart,
			end: sliceEnd,
			href: span.href
		});
	}
	return {
		text: trimmedText,
		styles: trimmedStyles,
		links: trimmedLinks
	};
}
function appendCell(state, cell) {
	if (!cell.text) return;
	const start = state.text.length;
	state.text += cell.text;
	for (const span of cell.styles) state.styles.push({
		start: start + span.start,
		end: start + span.end,
		style: span.style
	});
	for (const link of cell.links) state.links.push({
		start: start + link.start,
		end: start + link.end,
		href: link.href
	});
}
function appendCellTextOnly(state, cell) {
	if (!cell.text) return;
	state.text += cell.text;
}
function appendTableBulletValue(state, params) {
	const { header, value, columnIndex, includeColumnFallback } = params;
	if (!value?.text) return;
	state.text += "• ";
	if (header?.text) {
		appendCell(state, header);
		state.text += ": ";
	} else if (includeColumnFallback) state.text += `Column ${columnIndex}: `;
	appendCell(state, value);
	state.text += "\n";
}
function renderTableAsBullets(state) {
	if (!state.table) return;
	const headers = state.table.headers.map(trimCell);
	const rows = state.table.rows.map((row) => row.map(trimCell));
	if (headers.length === 0 && rows.length === 0) return;
	if (headers.length > 1 && rows.length > 0) for (const row of rows) {
		if (row.length === 0) continue;
		const rowLabel = row[0];
		if (rowLabel?.text) {
			const labelStart = state.text.length;
			appendCell(state, rowLabel);
			const labelEnd = state.text.length;
			if (labelEnd > labelStart) state.styles.push({
				start: labelStart,
				end: labelEnd,
				style: "bold"
			});
			state.text += "\n";
		}
		for (let i = 1; i < row.length; i++) appendTableBulletValue(state, {
			header: headers[i],
			value: row[i],
			columnIndex: i,
			includeColumnFallback: true
		});
		state.text += "\n";
	}
	else for (const row of rows) {
		for (let i = 0; i < row.length; i++) appendTableBulletValue(state, {
			header: headers[i],
			value: row[i],
			columnIndex: i,
			includeColumnFallback: false
		});
		state.text += "\n";
	}
}
function renderTableAsCode(state) {
	if (!state.table) return;
	const headers = state.table.headers.map(trimCell);
	const rows = state.table.rows.map((row) => row.map(trimCell));
	const columnCount = Math.max(headers.length, ...rows.map((row) => row.length));
	if (columnCount === 0) return;
	const widths = Array.from({ length: columnCount }, () => 0);
	const updateWidths = (cells) => {
		for (let i = 0; i < columnCount; i += 1) {
			const width = cells[i]?.text.length ?? 0;
			if (widths[i] < width) widths[i] = width;
		}
	};
	updateWidths(headers);
	for (const row of rows) updateWidths(row);
	const codeStart = state.text.length;
	const appendRow = (cells) => {
		state.text += "|";
		for (let i = 0; i < columnCount; i += 1) {
			state.text += " ";
			const cell = cells[i];
			if (cell) appendCellTextOnly(state, cell);
			const pad = widths[i] - (cell?.text.length ?? 0);
			if (pad > 0) state.text += " ".repeat(pad);
			state.text += " |";
		}
		state.text += "\n";
	};
	const appendDivider = () => {
		state.text += "|";
		for (let i = 0; i < columnCount; i += 1) {
			const dashCount = Math.max(3, widths[i]);
			state.text += ` ${"-".repeat(dashCount)} |`;
		}
		state.text += "\n";
	};
	appendRow(headers);
	appendDivider();
	for (const row of rows) appendRow(row);
	const codeEnd = state.text.length;
	if (codeEnd > codeStart) state.styles.push({
		start: codeStart,
		end: codeEnd,
		style: "code_block"
	});
	if (state.env.listStack.length === 0) state.text += "\n";
}
function renderTokens(tokens, state) {
	for (const token of tokens) switch (token.type) {
		case "inline":
			if (token.children) renderTokens(token.children, state);
			break;
		case "text":
			appendText(state, token.content ?? "");
			break;
		case "em_open":
			openStyle(state, "italic");
			break;
		case "em_close":
			closeStyle(state, "italic");
			break;
		case "strong_open":
			openStyle(state, "bold");
			break;
		case "strong_close":
			closeStyle(state, "bold");
			break;
		case "s_open":
			openStyle(state, "strikethrough");
			break;
		case "s_close":
			closeStyle(state, "strikethrough");
			break;
		case "code_inline":
			renderInlineCode(state, token.content ?? "");
			break;
		case "spoiler_open":
			if (state.enableSpoilers) openStyle(state, "spoiler");
			break;
		case "spoiler_close":
			if (state.enableSpoilers) closeStyle(state, "spoiler");
			break;
		case "link_open": {
			const href = getAttr(token, "href") ?? "";
			const target = resolveRenderTarget(state);
			target.linkStack.push({
				href,
				labelStart: target.text.length
			});
			break;
		}
		case "link_close":
			handleLinkClose(state);
			break;
		case "image":
			appendText(state, token.content ?? "");
			break;
		case "softbreak":
		case "hardbreak":
			appendText(state, "\n");
			break;
		case "paragraph_close":
			appendParagraphSeparator(state);
			break;
		case "heading_open":
			if (state.headingStyle === "bold") openStyle(state, "bold");
			break;
		case "heading_close":
			if (state.headingStyle === "bold") closeStyle(state, "bold");
			appendParagraphSeparator(state);
			break;
		case "blockquote_open":
			if (state.blockquotePrefix) state.text += state.blockquotePrefix;
			openStyle(state, "blockquote");
			break;
		case "blockquote_close":
			closeStyle(state, "blockquote");
			break;
		case "bullet_list_open":
			if (state.env.listStack.length > 0) state.text += "\n";
			state.env.listStack.push({
				type: "bullet",
				index: 0
			});
			break;
		case "bullet_list_close":
			state.env.listStack.pop();
			if (state.env.listStack.length === 0) state.text += "\n";
			break;
		case "ordered_list_open": {
			if (state.env.listStack.length > 0) state.text += "\n";
			const start = Number(getAttr(token, "start") ?? "1");
			state.env.listStack.push({
				type: "ordered",
				index: start - 1
			});
			break;
		}
		case "ordered_list_close":
			state.env.listStack.pop();
			if (state.env.listStack.length === 0) state.text += "\n";
			break;
		case "list_item_open":
			appendListPrefix(state);
			break;
		case "list_item_close":
			if (!state.text.endsWith("\n")) state.text += "\n";
			break;
		case "code_block":
		case "fence":
			renderCodeBlock(state, token.content ?? "");
			break;
		case "html_block":
		case "html_inline":
			appendText(state, token.content ?? "");
			break;
		case "table_open":
			if (state.tableMode !== "off") {
				state.table = initTableState();
				state.hasTables = true;
			}
			break;
		case "table_close":
			if (state.table) {
				if (state.tableMode === "bullets") renderTableAsBullets(state);
				else if (state.tableMode === "code") renderTableAsCode(state);
			}
			state.table = null;
			break;
		case "thead_open":
			if (state.table) state.table.inHeader = true;
			break;
		case "thead_close":
			if (state.table) state.table.inHeader = false;
			break;
		case "tbody_open":
		case "tbody_close": break;
		case "tr_open":
			if (state.table) state.table.currentRow = [];
			break;
		case "tr_close":
			if (state.table) {
				if (state.table.inHeader) state.table.headers = state.table.currentRow;
				else state.table.rows.push(state.table.currentRow);
				state.table.currentRow = [];
			}
			break;
		case "th_open":
		case "td_open":
			if (state.table) state.table.currentCell = initRenderTarget();
			break;
		case "th_close":
		case "td_close":
			if (state.table?.currentCell) {
				state.table.currentRow.push(finishTableCell(state.table.currentCell));
				state.table.currentCell = null;
			}
			break;
		case "hr":
			state.text += "───\n\n";
			break;
		default:
			if (token.children) renderTokens(token.children, state);
			break;
	}
}
function closeRemainingStyles(target) {
	for (let i = target.openStyles.length - 1; i >= 0; i -= 1) {
		const open = target.openStyles[i];
		const end = target.text.length;
		if (end > open.start) target.styles.push({
			start: open.start,
			end,
			style: open.style
		});
	}
	target.openStyles = [];
}
function clampStyleSpans(spans, maxLength) {
	const clamped = [];
	for (const span of spans) {
		const start = Math.max(0, Math.min(span.start, maxLength));
		const end = Math.max(start, Math.min(span.end, maxLength));
		if (end > start) clamped.push({
			start,
			end,
			style: span.style
		});
	}
	return clamped;
}
function clampLinkSpans(spans, maxLength) {
	const clamped = [];
	for (const span of spans) {
		const start = Math.max(0, Math.min(span.start, maxLength));
		const end = Math.max(start, Math.min(span.end, maxLength));
		if (end > start) clamped.push({
			start,
			end,
			href: span.href
		});
	}
	return clamped;
}
function mergeStyleSpans(spans) {
	const sorted = [...spans].toSorted((a, b) => {
		if (a.start !== b.start) return a.start - b.start;
		if (a.end !== b.end) return a.end - b.end;
		return a.style.localeCompare(b.style);
	});
	const merged = [];
	for (const span of sorted) {
		const prev = merged[merged.length - 1];
		if (prev && prev.style === span.style && (span.start < prev.end || span.start === prev.end && span.style !== "blockquote")) {
			prev.end = Math.max(prev.end, span.end);
			continue;
		}
		merged.push({ ...span });
	}
	return merged;
}
function resolveSliceBounds(span, start, end) {
	const sliceStart = Math.max(span.start, start);
	const sliceEnd = Math.min(span.end, end);
	if (sliceEnd <= sliceStart) return null;
	return {
		start: sliceStart,
		end: sliceEnd
	};
}
function sliceStyleSpans(spans, start, end) {
	if (spans.length === 0) return [];
	const sliced = [];
	for (const span of spans) {
		const bounds = resolveSliceBounds(span, start, end);
		if (!bounds) continue;
		sliced.push({
			start: bounds.start - start,
			end: bounds.end - start,
			style: span.style
		});
	}
	return mergeStyleSpans(sliced);
}
function sliceLinkSpans(spans, start, end) {
	if (spans.length === 0) return [];
	const sliced = [];
	for (const span of spans) {
		const bounds = resolveSliceBounds(span, start, end);
		if (!bounds) continue;
		sliced.push({
			start: bounds.start - start,
			end: bounds.end - start,
			href: span.href
		});
	}
	return sliced;
}
function markdownToIR(markdown, options = {}) {
	return markdownToIRWithMeta(markdown, options).ir;
}
function markdownToIRWithMeta(markdown, options = {}) {
	const env = { listStack: [] };
	const tokens = createMarkdownIt(options).parse(markdown ?? "", env);
	if (options.enableSpoilers) applySpoilerTokens(tokens);
	const tableMode = options.tableMode ?? "off";
	const state = {
		text: "",
		styles: [],
		openStyles: [],
		links: [],
		linkStack: [],
		env,
		headingStyle: options.headingStyle ?? "none",
		blockquotePrefix: options.blockquotePrefix ?? "",
		enableSpoilers: options.enableSpoilers ?? false,
		tableMode,
		table: null,
		hasTables: false
	};
	renderTokens(tokens, state);
	closeRemainingStyles(state);
	const trimmedLength = state.text.trimEnd().length;
	let codeBlockEnd = 0;
	for (const span of state.styles) {
		if (span.style !== "code_block") continue;
		if (span.end > codeBlockEnd) codeBlockEnd = span.end;
	}
	const finalLength = Math.max(trimmedLength, codeBlockEnd);
	return {
		ir: {
			text: finalLength === state.text.length ? state.text : state.text.slice(0, finalLength),
			styles: mergeStyleSpans(clampStyleSpans(state.styles, finalLength)),
			links: clampLinkSpans(state.links, finalLength)
		},
		hasTables: state.hasTables
	};
}
function chunkMarkdownIR(ir, limit) {
	if (!ir.text) return [];
	if (limit <= 0 || ir.text.length <= limit) return [ir];
	const chunks = chunkText(ir.text, limit);
	const results = [];
	let cursor = 0;
	chunks.forEach((chunk, index) => {
		if (!chunk) return;
		if (index > 0) while (cursor < ir.text.length && /\s/.test(ir.text[cursor] ?? "")) cursor += 1;
		const start = cursor;
		const end = Math.min(ir.text.length, start + chunk.length);
		results.push({
			text: chunk,
			styles: sliceStyleSpans(ir.styles, start, end),
			links: sliceLinkSpans(ir.links, start, end)
		});
		cursor = end;
	});
	return results;
}
//#endregion
//#region src/markdown/render.ts
const STYLE_RANK = new Map([
	"blockquote",
	"code_block",
	"code",
	"bold",
	"italic",
	"strikethrough",
	"spoiler"
].map((style, index) => [style, index]));
function sortStyleSpans(spans) {
	return [...spans].toSorted((a, b) => {
		if (a.start !== b.start) return a.start - b.start;
		if (a.end !== b.end) return b.end - a.end;
		return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
	});
}
function renderMarkdownWithMarkers(ir, options) {
	const text = ir.text ?? "";
	if (!text) return "";
	const styleMarkers = options.styleMarkers;
	const styled = sortStyleSpans(ir.styles.filter((span) => Boolean(styleMarkers[span.style])));
	const boundaries = /* @__PURE__ */ new Set();
	boundaries.add(0);
	boundaries.add(text.length);
	const startsAt = /* @__PURE__ */ new Map();
	for (const span of styled) {
		if (span.start === span.end) continue;
		boundaries.add(span.start);
		boundaries.add(span.end);
		const bucket = startsAt.get(span.start);
		if (bucket) bucket.push(span);
		else startsAt.set(span.start, [span]);
	}
	for (const spans of startsAt.values()) spans.sort((a, b) => {
		if (a.end !== b.end) return b.end - a.end;
		return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
	});
	const linkStarts = /* @__PURE__ */ new Map();
	if (options.buildLink) for (const link of ir.links) {
		if (link.start === link.end) continue;
		const rendered = options.buildLink(link, text);
		if (!rendered) continue;
		boundaries.add(rendered.start);
		boundaries.add(rendered.end);
		const openBucket = linkStarts.get(rendered.start);
		if (openBucket) openBucket.push(rendered);
		else linkStarts.set(rendered.start, [rendered]);
	}
	const points = [...boundaries].toSorted((a, b) => a - b);
	const stack = [];
	let out = "";
	for (let i = 0; i < points.length; i += 1) {
		const pos = points[i];
		while (stack.length && stack[stack.length - 1]?.end === pos) {
			const item = stack.pop();
			if (item) out += item.close;
		}
		const openingItems = [];
		const openingLinks = linkStarts.get(pos);
		if (openingLinks && openingLinks.length > 0) for (const [index, link] of openingLinks.entries()) openingItems.push({
			end: link.end,
			open: link.open,
			close: link.close,
			kind: "link",
			index
		});
		const openingStyles = startsAt.get(pos);
		if (openingStyles) for (const [index, span] of openingStyles.entries()) {
			const marker = styleMarkers[span.style];
			if (!marker) continue;
			openingItems.push({
				end: span.end,
				open: marker.open,
				close: marker.close,
				kind: "style",
				style: span.style,
				index
			});
		}
		if (openingItems.length > 0) {
			openingItems.sort((a, b) => {
				if (a.end !== b.end) return b.end - a.end;
				if (a.kind !== b.kind) return a.kind === "link" ? -1 : 1;
				if (a.kind === "style" && b.kind === "style") return (STYLE_RANK.get(a.style) ?? 0) - (STYLE_RANK.get(b.style) ?? 0);
				return a.index - b.index;
			});
			for (const item of openingItems) {
				out += item.open;
				stack.push({
					close: item.close,
					end: item.end
				});
			}
		}
		const next = points[i + 1];
		if (next === void 0) break;
		if (next > pos) out += options.escapeText(text.slice(pos, next));
	}
	return out;
}
//#endregion
//#region src/markdown/tables.ts
const MARKDOWN_STYLE_MARKERS = {
	bold: {
		open: "**",
		close: "**"
	},
	italic: {
		open: "_",
		close: "_"
	},
	strikethrough: {
		open: "~~",
		close: "~~"
	},
	code: {
		open: "`",
		close: "`"
	},
	code_block: {
		open: "```\n",
		close: "```"
	}
};
function convertMarkdownTables(markdown, mode) {
	if (!markdown || mode === "off") return markdown;
	const { ir, hasTables } = markdownToIRWithMeta(markdown, {
		linkify: false,
		autolink: false,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: mode
	});
	if (!hasTables) return markdown;
	return renderMarkdownWithMarkers(ir, {
		styleMarkers: MARKDOWN_STYLE_MARKERS,
		escapeText: (text) => text,
		buildLink: (link, text) => {
			const href = link.href.trim();
			if (!href) return null;
			if (!text.slice(link.start, link.end)) return null;
			return {
				start: link.start,
				end: link.end,
				open: "[",
				close: `](${href})`
			};
		}
	});
}
//#endregion
//#region src/markdown/whatsapp.ts
/**
* Convert standard Markdown formatting to WhatsApp-compatible markup.
*
* WhatsApp uses its own formatting syntax:
*   bold:          *text*
*   italic:        _text_
*   strikethrough: ~text~
*   monospace:     ```text```
*
* Standard Markdown uses:
*   bold:          **text** or __text__
*   italic:        *text* or _text_
*   strikethrough: ~~text~~
*   code:          `text` (inline) or ```text``` (block)
*
* The conversion preserves fenced code blocks and inline code,
* then converts bold and strikethrough markers.
*/
/** Placeholder tokens used during conversion to protect code spans. */
const FENCE_PLACEHOLDER = "\0FENCE";
const INLINE_CODE_PLACEHOLDER = "\0CODE";
/**
* Convert standard Markdown bold/italic/strikethrough to WhatsApp formatting.
*
* Order of operations matters:
* 1. Protect fenced code blocks (```...```) — already WhatsApp-compatible
* 2. Protect inline code (`...`) — leave as-is
* 3. Convert **bold** → *bold* and __bold__ → *bold*
* 4. Convert ~~strike~~ → ~strike~
* 5. Restore protected spans
*
* Italic *text* and _text_ are left alone since WhatsApp uses _text_ for italic
* and single * is already WhatsApp bold — no conversion needed for single markers.
*/
function markdownToWhatsApp(text) {
	if (!text) return text;
	const fences = [];
	let result = text.replace(/```[\s\S]*?```/g, (match) => {
		fences.push(match);
		return `${FENCE_PLACEHOLDER}${fences.length - 1}`;
	});
	const inlineCodes = [];
	result = result.replace(/`[^`\n]+`/g, (match) => {
		inlineCodes.push(match);
		return `${INLINE_CODE_PLACEHOLDER}${inlineCodes.length - 1}`;
	});
	result = result.replace(/\*\*(.+?)\*\*/g, "*$1*");
	result = result.replace(/__(.+?)__/g, "*$1*");
	result = result.replace(/~~(.+?)~~/g, "~$1~");
	result = result.replace(new RegExp(`${escapeRegExp(INLINE_CODE_PLACEHOLDER)}(\\d+)`, "g"), (_, idx) => inlineCodes[Number(idx)] ?? "");
	result = result.replace(new RegExp(`${escapeRegExp(FENCE_PLACEHOLDER)}(\\d+)`, "g"), (_, idx) => fences[Number(idx)] ?? "");
	return result;
}
//#endregion
//#region src/shared/scoped-expiring-id-cache.ts
function createScopedExpiringIdCache(options) {
	const ttlMs = Math.max(0, options.ttlMs);
	const cleanupThreshold = Math.max(1, Math.floor(options.cleanupThreshold));
	function cleanupExpired(scopeKey, entry, now) {
		for (const [id, timestamp] of entry) if (now - timestamp > ttlMs) entry.delete(id);
		if (entry.size === 0) options.store.delete(scopeKey);
	}
	return {
		record: (scope, id, now = Date.now()) => {
			const scopeKey = String(scope);
			const idKey = String(id);
			let entry = options.store.get(scopeKey);
			if (!entry) {
				entry = /* @__PURE__ */ new Map();
				options.store.set(scopeKey, entry);
			}
			entry.set(idKey, now);
			if (entry.size > cleanupThreshold) cleanupExpired(scopeKey, entry, now);
		},
		has: (scope, id, now = Date.now()) => {
			const scopeKey = String(scope);
			const idKey = String(id);
			const entry = options.store.get(scopeKey);
			if (!entry) return false;
			cleanupExpired(scopeKey, entry, now);
			return entry.has(idKey);
		},
		clear: () => {
			options.store.clear();
		}
	};
}
//#endregion
//#region src/shared/text/assistant-visible-text.ts
const MEMORY_TAG_RE = /<\s*(\/?)\s*relevant[-_]memories\b[^<>]*>/gi;
const MEMORY_TAG_QUICK_RE = /<\s*\/?\s*relevant[-_]memories\b/i;
function stripRelevantMemoriesTags(text) {
	if (!text || !MEMORY_TAG_QUICK_RE.test(text)) return text;
	MEMORY_TAG_RE.lastIndex = 0;
	const codeRegions = findCodeRegions(text);
	let result = "";
	let lastIndex = 0;
	let inMemoryBlock = false;
	for (const match of text.matchAll(MEMORY_TAG_RE)) {
		const idx = match.index ?? 0;
		if (isInsideCode(idx, codeRegions)) continue;
		const isClose = match[1] === "/";
		if (!inMemoryBlock) {
			result += text.slice(lastIndex, idx);
			if (!isClose) inMemoryBlock = true;
		} else if (isClose) inMemoryBlock = false;
		lastIndex = idx + match[0].length;
	}
	if (!inMemoryBlock) result += text.slice(lastIndex);
	return result;
}
function stripAssistantInternalScaffolding(text) {
	return stripRelevantMemoriesTags(stripReasoningTagsFromText(text, {
		mode: "preserve",
		trim: "start"
	})).trimStart();
}
const FILE_REF_EXTENSIONS_WITH_TLD = new Set([
	"md",
	"go",
	"py",
	"pl",
	"sh",
	"am",
	"at",
	"be",
	"cc"
]);
function isAutoLinkedFileRef(href, label) {
	if (href.replace(/^https?:\/\//i, "") !== label) return false;
	const dotIndex = label.lastIndexOf(".");
	if (dotIndex < 1) return false;
	const ext = label.slice(dotIndex + 1).toLowerCase();
	if (!FILE_REF_EXTENSIONS_WITH_TLD.has(ext)) return false;
	const segments = label.split("/");
	if (segments.length > 1) {
		for (let i = 0; i < segments.length - 1; i += 1) if (segments[i]?.includes(".")) return false;
	}
	return true;
}
//#endregion
//#region src/shared/text/strip-markdown.ts
/**
* Strip lightweight markdown formatting from text while preserving readable
* plain-text structure for TTS and channel fallbacks.
*/
function stripMarkdown(text) {
	let result = text;
	result = result.replace(/\*\*(.+?)\*\*/g, "$1");
	result = result.replace(/__(.+?)__/g, "$1");
	result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1");
	result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "$1");
	result = result.replace(/~~(.+?)~~/g, "$1");
	result = result.replace(/^#{1,6}\s+(.+)$/gm, "$1");
	result = result.replace(/^>\s?(.*)$/gm, "$1");
	result = result.replace(/^[-*_]{3,}$/gm, "");
	result = result.replace(/`([^`]+)`/g, "$1");
	result = result.replace(/\n{3,}/g, "\n\n");
	return result.trim();
}
//#endregion
//#region src/utils/chunk-items.ts
function chunkItems(items, size) {
	if (size <= 0) return [Array.from(items)];
	const rows = [];
	for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
	return rows;
}
//#endregion
//#region src/utils/reaction-level.ts
const LEVELS = new Set([
	"off",
	"ack",
	"minimal",
	"extensive"
]);
function parseLevel(value) {
	if (value === void 0 || value === null) return { kind: "missing" };
	if (typeof value !== "string") return { kind: "invalid" };
	const trimmed = value.trim();
	if (!trimmed) return { kind: "missing" };
	if (LEVELS.has(trimmed)) return {
		kind: "ok",
		value: trimmed
	};
	return { kind: "invalid" };
}
function resolveReactionLevel(params) {
	const parsed = parseLevel(params.value);
	switch (parsed.kind === "ok" ? parsed.value : parsed.kind === "missing" ? params.defaultLevel : params.invalidFallback) {
		case "off": return {
			level: "off",
			ackEnabled: false,
			agentReactionsEnabled: false
		};
		case "ack": return {
			level: "ack",
			ackEnabled: true,
			agentReactionsEnabled: false
		};
		case "minimal": return {
			level: "minimal",
			ackEnabled: false,
			agentReactionsEnabled: true,
			agentReactionGuidance: "minimal"
		};
		case "extensive": return {
			level: "extensive",
			ackEnabled: false,
			agentReactionsEnabled: true,
			agentReactionGuidance: "extensive"
		};
		default: return {
			level: "minimal",
			ackEnabled: false,
			agentReactionsEnabled: true,
			agentReactionGuidance: "minimal"
		};
	}
}
//#endregion
//#region src/utils/with-timeout.ts
function withTimeout(promise, timeoutMs) {
	if (!timeoutMs || timeoutMs <= 0) return promise;
	let timer = null;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), timeoutMs);
	});
	return Promise.race([promise, timeout]).finally(() => {
		if (timer) clearTimeout(timer);
	});
}
//#endregion
export { parseFenceSpans as A, chunkTextByBreakResolver as C, isInsideCode as D, findCodeRegions as E, findFenceSpanAt as O, resolveTextChunkLimit as S, stripReasoningTagsFromText as T, chunkMarkdownText as _, FILE_REF_EXTENSIONS_WITH_TLD as a, chunkTextWithMode as b, createScopedExpiringIdCache as c, renderMarkdownWithMarkers as d, chunkMarkdownIR as f, chunkByParagraph as g, chunkByNewline as h, stripMarkdown as i, isSafeFenceBreak as k, markdownToWhatsApp as l, markdownToIRWithMeta as m, resolveReactionLevel as n, isAutoLinkedFileRef as o, markdownToIR as p, chunkItems as r, stripAssistantInternalScaffolding as s, withTimeout as t, convertMarkdownTables as u, chunkMarkdownTextWithMode as v, summarizeStringEntries as w, resolveChunkMode as x, chunkText as y };
