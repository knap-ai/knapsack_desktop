import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { s as kindFromMime } from "./mime-B6nXlmtY.js";
import { i as markdownToIR } from "./tables-D6dozHvf.js";
import { o as renderMarkdownIRChunksWithinLimit } from "./text-runtime-DTMxvodz.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-zB1bGV-D.js";
import "./config-runtime-Bh8MKSv2.js";
import { t as resolveOutboundAttachmentFromUrl } from "./outbound-attachment-Dc2tDWj8.js";
import "./media-runtime-M1ED8IU3.js";
import { i as resolveSignalAccount } from "./accounts-DMNa8l5m.js";
import { n as signalRpcRequest } from "./client-BAtpRmSb.js";
import { t as resolveSignalRpcContext } from "./rpc-context-CZ9iEd2t.js";
//#region extensions/signal/src/format.ts
function normalizeUrlForComparison(url) {
	let normalized = normalizeLowercaseStringOrEmpty(url);
	normalized = normalized.replace(/^https?:\/\//, "");
	normalized = normalized.replace(/^www\./, "");
	normalized = normalized.replace(/\/+$/, "");
	return normalized;
}
function mapStyle(style) {
	switch (style) {
		case "bold": return "BOLD";
		case "italic": return "ITALIC";
		case "strikethrough": return "STRIKETHROUGH";
		case "code":
		case "code_block": return "MONOSPACE";
		case "spoiler": return "SPOILER";
		default: return null;
	}
}
function mergeStyles(styles) {
	const sorted = [...styles].toSorted((a, b) => {
		if (a.start !== b.start) return a.start - b.start;
		if (a.length !== b.length) return a.length - b.length;
		return a.style.localeCompare(b.style);
	});
	const merged = [];
	for (const style of sorted) {
		const prev = merged[merged.length - 1];
		if (prev && prev.style === style.style && style.start <= prev.start + prev.length) {
			const prevEnd = prev.start + prev.length;
			prev.length = Math.max(prevEnd, style.start + style.length) - prev.start;
			continue;
		}
		merged.push({ ...style });
	}
	return merged;
}
function clampStyles(styles, maxLength) {
	const clamped = [];
	for (const style of styles) {
		const start = Math.max(0, Math.min(style.start, maxLength));
		const length = Math.min(style.start + style.length, maxLength) - start;
		if (length > 0) clamped.push({
			start,
			length,
			style: style.style
		});
	}
	return clamped;
}
function applyInsertionsToStyles(spans, insertions) {
	if (insertions.length === 0) return spans;
	const sortedInsertions = [...insertions].toSorted((a, b) => a.pos - b.pos);
	let updated = spans;
	let cumulativeShift = 0;
	for (const insertion of sortedInsertions) {
		const insertionPos = insertion.pos + cumulativeShift;
		const next = [];
		for (const span of updated) {
			if (span.end <= insertionPos) {
				next.push(span);
				continue;
			}
			if (span.start >= insertionPos) {
				next.push({
					start: span.start + insertion.length,
					end: span.end + insertion.length,
					style: span.style
				});
				continue;
			}
			if (span.start < insertionPos && span.end > insertionPos) {
				if (insertionPos > span.start) next.push({
					start: span.start,
					end: insertionPos,
					style: span.style
				});
				const shiftedStart = insertionPos + insertion.length;
				const shiftedEnd = span.end + insertion.length;
				if (shiftedEnd > shiftedStart) next.push({
					start: shiftedStart,
					end: shiftedEnd,
					style: span.style
				});
			}
		}
		updated = next;
		cumulativeShift += insertion.length;
	}
	return updated;
}
function renderSignalText(ir) {
	const text = ir.text ?? "";
	if (!text) return {
		text: "",
		styles: []
	};
	const sortedLinks = [...ir.links].toSorted((a, b) => a.start - b.start);
	let out = "";
	let cursor = 0;
	const insertions = [];
	for (const link of sortedLinks) {
		if (link.start < cursor) continue;
		out += text.slice(cursor, link.end);
		const href = link.href.trim();
		const trimmedLabel = text.slice(link.start, link.end).trim();
		if (href) if (!trimmedLabel) {
			out += href;
			insertions.push({
				pos: link.end,
				length: href.length
			});
		} else {
			const normalizedLabel = normalizeUrlForComparison(trimmedLabel);
			let comparableHref = href;
			if (href.startsWith("mailto:")) comparableHref = href.slice(7);
			if (normalizedLabel !== normalizeUrlForComparison(comparableHref)) {
				const addition = ` (${href})`;
				out += addition;
				insertions.push({
					pos: link.end,
					length: addition.length
				});
			}
		}
		cursor = link.end;
	}
	out += text.slice(cursor);
	const adjusted = applyInsertionsToStyles(ir.styles.map((span) => {
		const mapped = mapStyle(span.style);
		if (!mapped) return null;
		return {
			start: span.start,
			end: span.end,
			style: mapped
		};
	}).filter((span) => span !== null), insertions);
	const trimmedText = out.trimEnd();
	const trimmedLength = trimmedText.length;
	return {
		text: trimmedText,
		styles: mergeStyles(clampStyles(adjusted.map((span) => ({
			start: span.start,
			length: span.end - span.start,
			style: span.style
		})), trimmedLength))
	};
}
function markdownToSignalText(markdown, options = {}) {
	return renderSignalText(markdownToIR(markdown ?? "", {
		linkify: true,
		enableSpoilers: true,
		headingStyle: "bold",
		blockquotePrefix: "> ",
		tableMode: options.tableMode
	}));
}
function markdownToSignalTextChunks(markdown, limit, options = {}) {
	return renderMarkdownIRChunksWithinLimit({
		ir: markdownToIR(markdown ?? "", {
			linkify: true,
			enableSpoilers: true,
			headingStyle: "bold",
			blockquotePrefix: "> ",
			tableMode: options.tableMode
		}),
		limit,
		renderChunk: renderSignalText,
		measureRendered: (rendered) => rendered.text.length
	}).map(({ rendered }) => rendered);
}
//#endregion
//#region extensions/signal/src/send.ts
let signalConfigRuntimePromise;
async function loadSignalConfigRuntime() {
	signalConfigRuntimePromise ??= import("./plugin-sdk/config-runtime.js");
	return await signalConfigRuntimePromise;
}
async function resolveSignalRpcAccountInfo(opts) {
	if (opts.baseUrl?.trim() && opts.account?.trim()) return;
	return resolveSignalAccount({
		cfg: opts.cfg ?? (await loadSignalConfigRuntime()).loadConfig(),
		accountId: opts.accountId
	});
}
function parseTarget(raw) {
	let value = raw.trim();
	if (!value) throw new Error("Signal recipient is required");
	if (normalizeLowercaseStringOrEmpty(value).startsWith("signal:")) value = value.slice(7).trim();
	const normalized = normalizeLowercaseStringOrEmpty(value);
	if (normalized.startsWith("group:")) return {
		type: "group",
		groupId: value.slice(6).trim()
	};
	if (normalized.startsWith("username:")) return {
		type: "username",
		username: value.slice(9).trim()
	};
	if (normalized.startsWith("u:")) return {
		type: "username",
		username: value.trim()
	};
	return {
		type: "recipient",
		recipient: value
	};
}
function buildTargetParams(target, allow) {
	if (target.type === "recipient") {
		if (!allow.recipient) return null;
		return { recipient: [target.recipient] };
	}
	if (target.type === "group") {
		if (!allow.group) return null;
		return { groupId: target.groupId };
	}
	if (target.type === "username") {
		if (!allow.username) return null;
		return { username: [target.username] };
	}
	return null;
}
async function sendMessageSignal(to, text, opts = {}) {
	const cfg = opts.cfg ?? loadConfig();
	const accountInfo = resolveSignalAccount({
		cfg,
		accountId: opts.accountId
	});
	const { baseUrl, account } = resolveSignalRpcContext(opts, accountInfo);
	const target = parseTarget(to);
	let message = text ?? "";
	let messageFromPlaceholder = false;
	let textStyles = [];
	const textMode = opts.textMode ?? "markdown";
	const maxBytes = (() => {
		if (typeof opts.maxBytes === "number") return opts.maxBytes;
		if (typeof accountInfo.config.mediaMaxMb === "number") return accountInfo.config.mediaMaxMb * 1024 * 1024;
		if (typeof cfg.agents?.defaults?.mediaMaxMb === "number") return cfg.agents.defaults.mediaMaxMb * 1024 * 1024;
		return 8 * 1024 * 1024;
	})();
	let attachments;
	if (opts.mediaUrl?.trim()) {
		const resolved = await resolveOutboundAttachmentFromUrl(opts.mediaUrl.trim(), maxBytes, {
			mediaAccess: opts.mediaAccess,
			localRoots: opts.mediaLocalRoots,
			readFile: opts.mediaReadFile
		});
		attachments = [resolved.path];
		const kind = kindFromMime(resolved.contentType ?? void 0);
		if (!message && kind) {
			message = kind === "image" ? "<media:image>" : `<media:${kind}>`;
			messageFromPlaceholder = true;
		}
	}
	if (message.trim() && !messageFromPlaceholder) if (textMode === "plain") textStyles = opts.textStyles ?? [];
	else {
		const tableMode = resolveMarkdownTableMode({
			cfg,
			channel: "signal",
			accountId: accountInfo.accountId
		});
		const formatted = markdownToSignalText(message, { tableMode });
		message = formatted.text;
		textStyles = formatted.styles;
	}
	if (!message.trim() && (!attachments || attachments.length === 0)) throw new Error("Signal send requires text or media");
	const params = { message };
	if (textStyles.length > 0) params["text-style"] = textStyles.map((style) => `${style.start}:${style.length}:${style.style}`);
	if (account) params.account = account;
	if (attachments && attachments.length > 0) params.attachments = attachments;
	const targetParams = buildTargetParams(target, {
		recipient: true,
		group: true,
		username: true
	});
	if (!targetParams) throw new Error("Signal recipient is required");
	Object.assign(params, targetParams);
	const timestamp = (await signalRpcRequest("send", params, {
		baseUrl,
		timeoutMs: opts.timeoutMs
	}))?.timestamp;
	return {
		messageId: timestamp ? String(timestamp) : "unknown",
		timestamp
	};
}
async function sendTypingSignal(to, opts = {}) {
	const { baseUrl, account } = resolveSignalRpcContext(opts, await resolveSignalRpcAccountInfo(opts));
	const targetParams = buildTargetParams(parseTarget(to), {
		recipient: true,
		group: true
	});
	if (!targetParams) return false;
	const params = { ...targetParams };
	if (account) params.account = account;
	if (opts.stop) params.stop = true;
	await signalRpcRequest("sendTyping", params, {
		baseUrl,
		timeoutMs: opts.timeoutMs
	});
	return true;
}
async function sendReadReceiptSignal(to, targetTimestamp, opts = {}) {
	if (!Number.isFinite(targetTimestamp) || targetTimestamp <= 0) return false;
	const { baseUrl, account } = resolveSignalRpcContext(opts, await resolveSignalRpcAccountInfo(opts));
	const targetParams = buildTargetParams(parseTarget(to), { recipient: true });
	if (!targetParams) return false;
	const params = {
		...targetParams,
		targetTimestamp,
		type: opts.type ?? "read"
	};
	if (account) params.account = account;
	await signalRpcRequest("sendReceipt", params, {
		baseUrl,
		timeoutMs: opts.timeoutMs
	});
	return true;
}
//#endregion
export { markdownToSignalTextChunks as a, markdownToSignalText as i, sendReadReceiptSignal as n, sendTypingSignal as r, sendMessageSignal as t };
