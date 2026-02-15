import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import { _ as resolveMarkdownTableMode, i as markdownToIR, r as chunkMarkdownIR, t as loadWebMedia } from "./media-EWF5qDpT.js";
import { S as mediaKindFromMime } from "./image-ops-BuOO2fiP.js";
import { a as fetchWithTimeout } from "./fetch-CiM7YqYo.js";
import { r as saveMediaBuffer } from "./store-C2n2K571.js";
import { n as resolveSignalAccount } from "./accounts-Ur53Qha2.js";
import { t as resolveFetch } from "./fetch-Bpep0-d-.js";
import { randomUUID } from "node:crypto";

//#region src/signal/client.ts
const DEFAULT_TIMEOUT_MS = 1e4;
function normalizeBaseUrl(url) {
	const trimmed = url.trim();
	if (!trimmed) throw new Error("Signal base URL is required");
	if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
	return `http://${trimmed}`.replace(/\/+$/, "");
}
function getRequiredFetch() {
	const fetchImpl = resolveFetch();
	if (!fetchImpl) throw new Error("fetch is not available");
	return fetchImpl;
}
async function signalRpcRequest(method, params, opts) {
	const baseUrl = normalizeBaseUrl(opts.baseUrl);
	const id = randomUUID();
	const body = JSON.stringify({
		jsonrpc: "2.0",
		method,
		params,
		id
	});
	const res = await fetchWithTimeout(`${baseUrl}/api/v1/rpc`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body
	}, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS, getRequiredFetch());
	if (res.status === 201) return;
	const text = await res.text();
	if (!text) throw new Error(`Signal RPC empty response (status ${res.status})`);
	const parsed = JSON.parse(text);
	if (parsed.error) {
		const code = parsed.error.code ?? "unknown";
		const msg = parsed.error.message ?? "Signal RPC error";
		throw new Error(`Signal RPC ${code}: ${msg}`);
	}
	return parsed.result;
}
async function signalCheck(baseUrl, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const normalized = normalizeBaseUrl(baseUrl);
	try {
		const res = await fetchWithTimeout(`${normalized}/api/v1/check`, { method: "GET" }, timeoutMs, getRequiredFetch());
		if (!res.ok) return {
			ok: false,
			status: res.status,
			error: `HTTP ${res.status}`
		};
		return {
			ok: true,
			status: res.status,
			error: null
		};
	} catch (err) {
		return {
			ok: false,
			status: null,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
async function streamSignalEvents(params) {
	const baseUrl = normalizeBaseUrl(params.baseUrl);
	const url = new URL(`${baseUrl}/api/v1/events`);
	if (params.account) url.searchParams.set("account", params.account);
	const fetchImpl = resolveFetch();
	if (!fetchImpl) throw new Error("fetch is not available");
	const res = await fetchImpl(url, {
		method: "GET",
		headers: { Accept: "text/event-stream" },
		signal: params.abortSignal
	});
	if (!res.ok || !res.body) throw new Error(`Signal SSE failed (${res.status} ${res.statusText || "error"})`);
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let currentEvent = {};
	const flushEvent = () => {
		if (!currentEvent.data && !currentEvent.event && !currentEvent.id) return;
		params.onEvent({
			event: currentEvent.event,
			data: currentEvent.data,
			id: currentEvent.id
		});
		currentEvent = {};
	};
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		let lineEnd = buffer.indexOf("\n");
		while (lineEnd !== -1) {
			let line = buffer.slice(0, lineEnd);
			buffer = buffer.slice(lineEnd + 1);
			if (line.endsWith("\r")) line = line.slice(0, -1);
			if (line === "") {
				flushEvent();
				lineEnd = buffer.indexOf("\n");
				continue;
			}
			if (line.startsWith(":")) {
				lineEnd = buffer.indexOf("\n");
				continue;
			}
			const [rawField, ...rest] = line.split(":");
			const field = rawField.trim();
			const rawValue = rest.join(":");
			const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;
			if (field === "event") currentEvent.event = value;
			else if (field === "data") currentEvent.data = currentEvent.data ? `${currentEvent.data}\n${value}` : value;
			else if (field === "id") currentEvent.id = value;
			lineEnd = buffer.indexOf("\n");
		}
	}
	flushEvent();
}

//#endregion
//#region src/signal/format.ts
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
	for (const insertion of sortedInsertions) {
		const next = [];
		for (const span of updated) {
			if (span.end <= insertion.pos) {
				next.push(span);
				continue;
			}
			if (span.start >= insertion.pos) {
				next.push({
					start: span.start + insertion.length,
					end: span.end + insertion.length,
					style: span.style
				});
				continue;
			}
			if (span.start < insertion.pos && span.end > insertion.pos) {
				if (insertion.pos > span.start) next.push({
					start: span.start,
					end: insertion.pos,
					style: span.style
				});
				const shiftedStart = insertion.pos + insertion.length;
				const shiftedEnd = span.end + insertion.length;
				if (shiftedEnd > shiftedStart) next.push({
					start: shiftedStart,
					end: shiftedEnd,
					style: span.style
				});
			}
		}
		updated = next;
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
		const comparableHref = href.startsWith("mailto:") ? href.slice(7) : href;
		if (href) {
			if (!trimmedLabel) {
				out += href;
				insertions.push({
					pos: link.end,
					length: href.length
				});
			} else if (trimmedLabel !== href && trimmedLabel !== comparableHref) {
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
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: options.tableMode
	}));
}
function markdownToSignalTextChunks(markdown, limit, options = {}) {
	return chunkMarkdownIR(markdownToIR(markdown ?? "", {
		linkify: true,
		enableSpoilers: true,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: options.tableMode
	}), limit).map((chunk) => renderSignalText(chunk));
}

//#endregion
//#region src/signal/send.ts
var send_exports = /* @__PURE__ */ __exportAll({
	sendMessageSignal: () => sendMessageSignal,
	sendReadReceiptSignal: () => sendReadReceiptSignal,
	sendTypingSignal: () => sendTypingSignal
});
function parseTarget(raw) {
	let value = raw.trim();
	if (!value) throw new Error("Signal recipient is required");
	if (value.toLowerCase().startsWith("signal:")) value = value.slice(7).trim();
	const normalized = value.toLowerCase();
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
function resolveSignalRpcContext(opts, accountInfo) {
	const hasBaseUrl = Boolean(opts.baseUrl?.trim());
	const hasAccount = Boolean(opts.account?.trim());
	const resolvedAccount = accountInfo || (!hasBaseUrl || !hasAccount ? resolveSignalAccount({
		cfg: loadConfig(),
		accountId: opts.accountId
	}) : void 0);
	const baseUrl = opts.baseUrl?.trim() || resolvedAccount?.baseUrl;
	if (!baseUrl) throw new Error("Signal base URL is required");
	return {
		baseUrl,
		account: opts.account?.trim() || resolvedAccount?.config.account?.trim()
	};
}
async function resolveAttachment(mediaUrl, maxBytes) {
	const media = await loadWebMedia(mediaUrl, maxBytes);
	const saved = await saveMediaBuffer(media.buffer, media.contentType ?? void 0, "outbound", maxBytes);
	return {
		path: saved.path,
		contentType: saved.contentType
	};
}
async function sendMessageSignal(to, text, opts = {}) {
	const cfg = loadConfig();
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
		const resolved = await resolveAttachment(opts.mediaUrl.trim(), maxBytes);
		attachments = [resolved.path];
		const kind = mediaKindFromMime(resolved.contentType ?? void 0);
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
	const { baseUrl, account } = resolveSignalRpcContext(opts);
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
	const { baseUrl, account } = resolveSignalRpcContext(opts);
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
export { markdownToSignalTextChunks as a, streamSignalEvents as c, send_exports as i, sendReadReceiptSignal as n, signalCheck as o, sendTypingSignal as r, signalRpcRequest as s, sendMessageSignal as t };