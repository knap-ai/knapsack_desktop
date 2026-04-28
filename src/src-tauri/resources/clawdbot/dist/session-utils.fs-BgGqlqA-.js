import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { r as hasInterSessionUserProvenance } from "./input-provenance-DhG5f54s.js";
import { r as extractAssistantVisibleText } from "./chat-message-content-yS6GJLKi.js";
import { i as hasNonzeroUsage, o as normalizeUsage, r as deriveSessionTotalTokens } from "./usage-7Pk1eenJ.js";
import { i as stripInlineDirectiveTagsForDisplay } from "./directive-tags-B2h2NkjE.js";
import { a as stripInternalRuntimeContext } from "./internal-runtime-context-DrkxFr3e.js";
import { n as stripInboundMetadata, t as extractInboundSenderLabel } from "./strip-inbound-meta-DIrNhXW1.js";
import { a as resolveSessionTranscriptCandidates } from "./session-transcript-files.fs-CzArr0l-.js";
import fs from "node:fs";
//#region src/infra/json-utf8-bytes.ts
function jsonUtf8Bytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return Buffer.byteLength(String(value), "utf8");
	}
}
function jsonUtf8BytesOrInfinity(value) {
	try {
		const serialized = JSON.stringify(value);
		return typeof serialized === "string" ? Buffer.byteLength(serialized, "utf8") : Number.POSITIVE_INFINITY;
	} catch {
		return Number.POSITIVE_INFINITY;
	}
}
function jsonStringByteLengthUpToLimit(value, remainingBytes) {
	if (value.length + 2 > remainingBytes) return remainingBytes + 1;
	return jsonUtf8BytesOrInfinity(value);
}
function* enumerableOwnEntries(value) {
	const record = value;
	for (const key in record) if (Object.prototype.propertyIsEnumerable.call(record, key)) yield [key, record[key]];
}
function firstEnumerableOwnKeys(value, maxKeys) {
	const keys = [];
	for (const key in value) {
		if (!Object.prototype.propertyIsEnumerable.call(value, key)) continue;
		keys.push(key);
		if (keys.length >= maxKeys) break;
	}
	return keys;
}
function boundedJsonUtf8Bytes(value, maxBytes) {
	let bytes = 0;
	const seen = /* @__PURE__ */ new WeakSet();
	const add = (amount) => {
		bytes += amount;
		if (bytes > maxBytes) throw new Error("json_byte_limit_exceeded");
	};
	const visit = (entry, inArray) => {
		if (entry === null) {
			add(4);
			return;
		}
		switch (typeof entry) {
			case "string":
				add(jsonStringByteLengthUpToLimit(entry, maxBytes - bytes));
				return;
			case "number":
				add(jsonUtf8BytesOrInfinity(Number.isFinite(entry) ? entry : null));
				return;
			case "boolean":
				add(entry ? 4 : 5);
				return;
			case "undefined":
			case "function":
			case "symbol":
				if (inArray) add(4);
				return;
			case "bigint": throw new Error("json_byte_length_unsupported");
			case "object": break;
		}
		const objectEntry = entry;
		if (seen.has(objectEntry)) throw new Error("json_byte_length_circular");
		if (typeof objectEntry.toJSON === "function" && !(objectEntry instanceof Date)) throw new Error("json_byte_length_custom_to_json");
		seen.add(objectEntry);
		try {
			if (objectEntry instanceof Date) {
				visit(objectEntry.toJSON(), inArray);
				return;
			}
			if (Array.isArray(objectEntry)) {
				add(1);
				for (let index = 0; index < objectEntry.length; index += 1) {
					if (index > 0) add(1);
					visit(objectEntry[index], true);
				}
				add(1);
				return;
			}
			add(1);
			let wroteField = false;
			for (const [key, field] of enumerableOwnEntries(objectEntry)) {
				if (field === void 0 || typeof field === "function" || typeof field === "symbol") continue;
				if (wroteField) add(1);
				wroteField = true;
				add(jsonStringByteLengthUpToLimit(key, maxBytes - bytes));
				add(1);
				visit(field, false);
			}
			add(1);
		} finally {
			seen.delete(objectEntry);
		}
	};
	try {
		visit(value, false);
		return {
			bytes,
			complete: true
		};
	} catch {
		return {
			bytes: Math.max(bytes, maxBytes + 1),
			complete: false
		};
	}
}
//#endregion
//#region src/utils/transcript-tools.ts
const TOOL_CALL_TYPES = new Set([
	"tool_use",
	"toolcall",
	"tool_call"
]);
const TOOL_RESULT_TYPES = new Set(["tool_result", "tool_result_error"]);
const normalizeType = (value) => {
	return typeof value === "string" ? normalizeOptionalLowercaseString(value) ?? "" : "";
};
const extractToolCallNames = (message) => {
	const names = /* @__PURE__ */ new Set();
	const toolNameRaw = message.toolName ?? message.tool_name;
	const toolName = typeof toolNameRaw === "string" ? normalizeOptionalString(toolNameRaw) : void 0;
	if (toolName) names.add(toolName);
	const content = message.content;
	if (!Array.isArray(content)) return Array.from(names);
	for (const entry of content) {
		if (!entry || typeof entry !== "object") continue;
		const block = entry;
		const type = normalizeType(block.type);
		if (!TOOL_CALL_TYPES.has(type)) continue;
		const name = typeof block.name === "string" ? normalizeOptionalString(block.name) : void 0;
		if (name) names.add(name);
	}
	return Array.from(names);
};
const hasToolCall = (message) => extractToolCallNames(message).length > 0;
const countToolResults = (message) => {
	const content = message.content;
	if (!Array.isArray(content)) return {
		total: 0,
		errors: 0
	};
	let total = 0;
	let errors = 0;
	for (const entry of content) {
		if (!entry || typeof entry !== "object") continue;
		const block = entry;
		const type = normalizeType(block.type);
		if (!TOOL_RESULT_TYPES.has(type)) continue;
		total += 1;
		if (block.is_error === true) errors += 1;
	}
	return {
		total,
		errors
	};
};
//#endregion
//#region src/shared/chat-envelope.ts
const ENVELOPE_PREFIX = /^\[([^\]]+)\]\s*/;
const ENVELOPE_CHANNELS = [
	"WebChat",
	"WhatsApp",
	"Telegram",
	"Signal",
	"Slack",
	"Discord",
	"Google Chat",
	"iMessage",
	"Teams",
	"Matrix",
	"Zalo",
	"Zalo Personal",
	"BlueBubbles"
];
const MESSAGE_ID_LINE = /^\s*\[message_id:\s*[^\]]+\]\s*$/i;
function looksLikeEnvelopeHeader(header) {
	if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\b/.test(header)) return true;
	if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}\b/.test(header)) return true;
	return ENVELOPE_CHANNELS.some((label) => header.startsWith(`${label} `));
}
function stripEnvelope(text) {
	const match = text.match(ENVELOPE_PREFIX);
	if (!match) return text;
	if (!looksLikeEnvelopeHeader(match[1] ?? "")) return text;
	return text.slice(match[0].length);
}
function stripMessageIdHints(text) {
	if (!/\[message_id:/i.test(text)) return text;
	const lines = text.split(/\r?\n/);
	const filtered = lines.filter((line) => !MESSAGE_ID_LINE.test(line));
	return filtered.length === lines.length ? text : filtered.join("\n");
}
//#endregion
//#region src/gateway/chat-sanitize.ts
function extractMessageSenderLabel(entry) {
	if (typeof entry.senderLabel === "string" && entry.senderLabel.trim()) return entry.senderLabel.trim();
	if (typeof entry.content === "string") return extractInboundSenderLabel(entry.content);
	if (Array.isArray(entry.content)) for (const item of entry.content) {
		if (!item || typeof item !== "object") continue;
		const text = item.text;
		if (typeof text !== "string") continue;
		const senderLabel = extractInboundSenderLabel(text);
		if (senderLabel) return senderLabel;
	}
	if (typeof entry.text === "string") return extractInboundSenderLabel(entry.text);
	return null;
}
function stripEnvelopeFromContentWithRole(content, stripUserEnvelope) {
	let changed = false;
	return {
		content: content.map((item) => {
			if (!item || typeof item !== "object") return item;
			const entry = item;
			if (entry.type !== "text" || typeof entry.text !== "string") return item;
			const inboundStripped = stripInboundMetadata(stripInternalRuntimeContext(entry.text));
			const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
			if (stripped === entry.text) return item;
			changed = true;
			return {
				...entry,
				text: stripped
			};
		}),
		changed
	};
}
function stripEnvelopeFromMessage(message) {
	if (!message || typeof message !== "object") return message;
	const entry = message;
	const stripUserEnvelope = (typeof entry.role === "string" ? normalizeLowercaseStringOrEmpty(entry.role) : "") === "user";
	let changed = false;
	const next = { ...entry };
	const senderLabel = stripUserEnvelope ? extractMessageSenderLabel(entry) : null;
	if (senderLabel && entry.senderLabel !== senderLabel) {
		next.senderLabel = senderLabel;
		changed = true;
	}
	if (typeof entry.content === "string") {
		const inboundStripped = stripInboundMetadata(stripInternalRuntimeContext(entry.content));
		const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
		if (stripped !== entry.content) {
			next.content = stripped;
			changed = true;
		}
	} else if (Array.isArray(entry.content)) {
		const updated = stripEnvelopeFromContentWithRole(entry.content, stripUserEnvelope);
		if (updated.changed) {
			next.content = updated.content;
			changed = true;
		}
	} else if (typeof entry.text === "string") {
		const inboundStripped = stripInboundMetadata(stripInternalRuntimeContext(entry.text));
		const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
		if (stripped !== entry.text) {
			next.text = stripped;
			changed = true;
		}
	}
	return changed ? next : message;
}
function stripEnvelopeFromMessages(messages) {
	if (messages.length === 0) return messages;
	let changed = false;
	const next = messages.map((message) => {
		const stripped = stripEnvelopeFromMessage(message);
		if (stripped !== message) changed = true;
		return stripped;
	});
	return changed ? next : messages;
}
//#endregion
//#region src/gateway/session-utils.fs.ts
const sessionTitleFieldsCache = /* @__PURE__ */ new Map();
const MAX_SESSION_TITLE_FIELDS_CACHE_ENTRIES = 5e3;
function readSessionTitleFieldsCacheKey(filePath, opts) {
	return `${filePath}\t${opts?.includeInterSession === true ? "1" : "0"}`;
}
function getCachedSessionTitleFields(cacheKey, stat) {
	const cached = sessionTitleFieldsCache.get(cacheKey);
	if (!cached) return null;
	if (cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size) {
		sessionTitleFieldsCache.delete(cacheKey);
		return null;
	}
	sessionTitleFieldsCache.delete(cacheKey);
	sessionTitleFieldsCache.set(cacheKey, cached);
	return {
		firstUserMessage: cached.firstUserMessage,
		lastMessagePreview: cached.lastMessagePreview
	};
}
function setCachedSessionTitleFields(cacheKey, stat, value) {
	sessionTitleFieldsCache.set(cacheKey, {
		...value,
		mtimeMs: stat.mtimeMs,
		size: stat.size
	});
	while (sessionTitleFieldsCache.size > MAX_SESSION_TITLE_FIELDS_CACHE_ENTRIES) {
		const oldestKey = sessionTitleFieldsCache.keys().next().value;
		if (typeof oldestKey !== "string" || !oldestKey) break;
		sessionTitleFieldsCache.delete(oldestKey);
	}
}
function attachOpenClawTranscriptMeta(message, meta) {
	if (!message || typeof message !== "object" || Array.isArray(message)) return message;
	const record = message;
	const existing = record.__openclaw && typeof record.__openclaw === "object" && !Array.isArray(record.__openclaw) ? record.__openclaw : {};
	return {
		...record,
		__openclaw: {
			...existing,
			...meta
		}
	};
}
function readSessionMessages(sessionId, storePath, sessionFile) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile).find((p) => fs.existsSync(p));
	if (!filePath) return [];
	const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
	const messages = [];
	let messageSeq = 0;
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const parsed = JSON.parse(line);
			if (parsed?.message) {
				messageSeq += 1;
				messages.push(attachOpenClawTranscriptMeta(parsed.message, {
					...typeof parsed.id === "string" ? { id: parsed.id } : {},
					seq: messageSeq
				}));
				continue;
			}
			if (parsed?.type === "compaction") {
				const ts = typeof parsed.timestamp === "string" ? Date.parse(parsed.timestamp) : NaN;
				const timestamp = Number.isFinite(ts) ? ts : Date.now();
				messageSeq += 1;
				messages.push({
					role: "system",
					content: [{
						type: "text",
						text: "Compaction"
					}],
					timestamp,
					__openclaw: {
						kind: "compaction",
						id: typeof parsed.id === "string" ? parsed.id : void 0,
						seq: messageSeq
					}
				});
			}
		} catch {}
	}
	return messages;
}
function capArrayByJsonBytes(items, maxBytes) {
	if (items.length === 0) return {
		items,
		bytes: 2
	};
	const parts = items.map((item) => jsonUtf8Bytes(item));
	let bytes = 2 + parts.reduce((a, b) => a + b, 0) + (items.length - 1);
	let start = 0;
	while (bytes > maxBytes && start < items.length - 1) {
		bytes -= parts[start] + 1;
		start += 1;
	}
	return {
		items: start > 0 ? items.slice(start) : items,
		bytes
	};
}
const MAX_LINES_TO_SCAN = 10;
function readSessionTitleFieldsFromTranscript(sessionId, storePath, sessionFile, agentId, opts) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fs.existsSync(p));
	if (!filePath) return {
		firstUserMessage: null,
		lastMessagePreview: null
	};
	let stat;
	try {
		stat = fs.statSync(filePath);
	} catch {
		return {
			firstUserMessage: null,
			lastMessagePreview: null
		};
	}
	const cacheKey = readSessionTitleFieldsCacheKey(filePath, opts);
	const cached = getCachedSessionTitleFields(cacheKey, stat);
	if (cached) return cached;
	if (stat.size === 0) {
		const empty = {
			firstUserMessage: null,
			lastMessagePreview: null
		};
		setCachedSessionTitleFields(cacheKey, stat, empty);
		return empty;
	}
	let fd = null;
	try {
		fd = fs.openSync(filePath, "r");
		const size = stat.size;
		let firstUserMessage = null;
		try {
			const chunk = readTranscriptHeadChunk(fd);
			if (chunk) firstUserMessage = extractFirstUserMessageFromTranscriptChunk(chunk, opts);
		} catch {}
		let lastMessagePreview = null;
		try {
			lastMessagePreview = readLastMessagePreviewFromOpenTranscript({
				fd,
				size
			});
		} catch {}
		const result = {
			firstUserMessage,
			lastMessagePreview
		};
		setCachedSessionTitleFields(cacheKey, stat, result);
		return result;
	} catch {
		return {
			firstUserMessage: null,
			lastMessagePreview: null
		};
	} finally {
		if (fd !== null) try {
			fs.closeSync(fd);
		} catch {}
	}
}
function extractTextFromContent(content) {
	if (typeof content === "string") return stripInlineDirectiveTagsForDisplay(content).text.trim() || null;
	if (!Array.isArray(content)) return null;
	for (const part of content) {
		if (!part || typeof part.text !== "string") continue;
		if (part.type === "text" || part.type === "output_text" || part.type === "input_text") {
			const normalized = stripInlineDirectiveTagsForDisplay(part.text).text.trim();
			if (normalized) return normalized;
		}
	}
	return null;
}
function readTranscriptHeadChunk(fd, maxBytes = 8192) {
	const buf = Buffer.alloc(maxBytes);
	const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
	if (bytesRead <= 0) return null;
	return buf.toString("utf-8", 0, bytesRead);
}
function extractFirstUserMessageFromTranscriptChunk(chunk, opts) {
	const lines = chunk.split(/\r?\n/).slice(0, MAX_LINES_TO_SCAN);
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const msg = JSON.parse(line)?.message;
			if (msg?.role !== "user") continue;
			if (opts?.includeInterSession !== true && hasInterSessionUserProvenance(msg)) continue;
			const text = extractTextFromContent(msg.content);
			if (text) return text;
		} catch {}
	}
	return null;
}
function findExistingTranscriptPath(sessionId, storePath, sessionFile, agentId) {
	return resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fs.existsSync(p)) ?? null;
}
function withOpenTranscriptFd(filePath, read) {
	let fd = null;
	try {
		fd = fs.openSync(filePath, "r");
		return read(fd);
	} catch {} finally {
		if (fd !== null) fs.closeSync(fd);
	}
	return null;
}
const LAST_MSG_MAX_BYTES = 16384;
const LAST_MSG_MAX_LINES = 20;
function readLastMessagePreviewFromOpenTranscript(params) {
	const readStart = Math.max(0, params.size - LAST_MSG_MAX_BYTES);
	const readLen = Math.min(params.size, LAST_MSG_MAX_BYTES);
	const buf = Buffer.alloc(readLen);
	fs.readSync(params.fd, buf, 0, readLen, readStart);
	const tailLines = buf.toString("utf-8").split(/\r?\n/).filter((l) => l.trim()).slice(-LAST_MSG_MAX_LINES);
	for (let i = tailLines.length - 1; i >= 0; i--) {
		const line = tailLines[i];
		try {
			const msg = JSON.parse(line)?.message;
			if (msg?.role !== "user" && msg?.role !== "assistant") continue;
			const text = extractTextFromContent(msg.content);
			if (text) return text;
		} catch {}
	}
	return null;
}
function extractTranscriptUsageCost(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const cost = raw.cost;
	if (!cost || typeof cost !== "object" || Array.isArray(cost)) return;
	const total = cost.total;
	return typeof total === "number" && Number.isFinite(total) && total >= 0 ? total : void 0;
}
function resolvePositiveUsageNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function extractLatestUsageFromTranscriptChunk(chunk) {
	const lines = chunk.split(/\r?\n/).filter((line) => line.trim().length > 0);
	const snapshot = {};
	let sawSnapshot = false;
	let inputTokens = 0;
	let outputTokens = 0;
	let cacheRead = 0;
	let cacheWrite = 0;
	let sawInputTokens = false;
	let sawOutputTokens = false;
	let sawCacheRead = false;
	let sawCacheWrite = false;
	let costUsdTotal = 0;
	let sawCost = false;
	for (const line of lines) try {
		const parsed = JSON.parse(line);
		const message = parsed.message && typeof parsed.message === "object" && !Array.isArray(parsed.message) ? parsed.message : void 0;
		if (!message) continue;
		const role = typeof message.role === "string" ? message.role : void 0;
		if (role && role !== "assistant") continue;
		const usageRaw = message.usage && typeof message.usage === "object" && !Array.isArray(message.usage) ? message.usage : parsed.usage && typeof parsed.usage === "object" && !Array.isArray(parsed.usage) ? parsed.usage : void 0;
		const usage = normalizeUsage(usageRaw);
		const totalTokens = resolvePositiveUsageNumber(deriveSessionTotalTokens({ usage }));
		const costUsd = extractTranscriptUsageCost(usageRaw);
		const modelProvider = typeof message.provider === "string" ? message.provider.trim() : typeof parsed.provider === "string" ? parsed.provider.trim() : void 0;
		const model = typeof message.model === "string" ? message.model.trim() : typeof parsed.model === "string" ? parsed.model.trim() : void 0;
		const isDeliveryMirror = modelProvider === "openclaw" && model === "delivery-mirror";
		const hasMeaningfulUsage = hasNonzeroUsage(usage) || typeof totalTokens === "number" || typeof costUsd === "number" && Number.isFinite(costUsd);
		if (!hasMeaningfulUsage && !Boolean(modelProvider || model)) continue;
		if (isDeliveryMirror && !hasMeaningfulUsage) continue;
		sawSnapshot = true;
		if (!isDeliveryMirror) {
			if (modelProvider) snapshot.modelProvider = modelProvider;
			if (model) snapshot.model = model;
		}
		if (typeof usage?.input === "number" && Number.isFinite(usage.input)) {
			inputTokens += usage.input;
			sawInputTokens = true;
		}
		if (typeof usage?.output === "number" && Number.isFinite(usage.output)) {
			outputTokens += usage.output;
			sawOutputTokens = true;
		}
		if (typeof usage?.cacheRead === "number" && Number.isFinite(usage.cacheRead)) {
			cacheRead += usage.cacheRead;
			sawCacheRead = true;
		}
		if (typeof usage?.cacheWrite === "number" && Number.isFinite(usage.cacheWrite)) {
			cacheWrite += usage.cacheWrite;
			sawCacheWrite = true;
		}
		if (typeof totalTokens === "number") {
			snapshot.totalTokens = totalTokens;
			snapshot.totalTokensFresh = true;
		}
		if (typeof costUsd === "number" && Number.isFinite(costUsd)) {
			costUsdTotal += costUsd;
			sawCost = true;
		}
	} catch {}
	if (!sawSnapshot) return null;
	if (sawInputTokens) snapshot.inputTokens = inputTokens;
	if (sawOutputTokens) snapshot.outputTokens = outputTokens;
	if (sawCacheRead) snapshot.cacheRead = cacheRead;
	if (sawCacheWrite) snapshot.cacheWrite = cacheWrite;
	if (sawCost) snapshot.costUsd = costUsdTotal;
	return snapshot;
}
function readLatestSessionUsageFromTranscript(sessionId, storePath, sessionFile, agentId) {
	const filePath = findExistingTranscriptPath(sessionId, storePath, sessionFile, agentId);
	if (!filePath) return null;
	return withOpenTranscriptFd(filePath, (fd) => {
		if (fs.fstatSync(fd).size === 0) return null;
		return extractLatestUsageFromTranscriptChunk(fs.readFileSync(fd, "utf-8"));
	});
}
const PREVIEW_READ_SIZES = [
	64 * 1024,
	256 * 1024,
	1024 * 1024
];
const PREVIEW_MAX_LINES = 200;
function normalizeRole(role, isTool) {
	if (isTool) return "tool";
	switch (normalizeLowercaseStringOrEmpty(role)) {
		case "user": return "user";
		case "assistant": return "assistant";
		case "system": return "system";
		case "tool": return "tool";
		default: return "other";
	}
}
function truncatePreviewText(text, maxChars) {
	if (maxChars <= 0 || text.length <= maxChars) return text;
	if (maxChars <= 3) return text.slice(0, maxChars);
	return `${text.slice(0, maxChars - 3)}...`;
}
function extractPreviewText(message) {
	if (normalizeLowercaseStringOrEmpty(message.role) === "assistant") {
		const assistantText = extractAssistantVisibleText(message);
		if (assistantText) {
			const normalized = stripInlineDirectiveTagsForDisplay(assistantText).text.trim();
			return normalized ? normalized : null;
		}
		return null;
	}
	if (typeof message.content === "string") {
		const normalized = stripInlineDirectiveTagsForDisplay(message.content).text.trim();
		return normalized ? normalized : null;
	}
	if (Array.isArray(message.content)) {
		const parts = message.content.map((entry) => typeof entry?.text === "string" ? stripInlineDirectiveTagsForDisplay(entry.text).text : "").filter((text) => text.trim().length > 0);
		if (parts.length > 0) return parts.join("\n").trim();
	}
	if (typeof message.text === "string") {
		const normalized = stripInlineDirectiveTagsForDisplay(message.text).text.trim();
		return normalized ? normalized : null;
	}
	return null;
}
function isToolCall(message) {
	return hasToolCall(message);
}
function extractToolNames(message) {
	return extractToolCallNames(message);
}
function extractMediaSummary(message) {
	if (!Array.isArray(message.content)) return null;
	for (const entry of message.content) {
		const raw = normalizeLowercaseStringOrEmpty(entry?.type);
		if (!raw || raw === "text" || raw === "toolcall" || raw === "tool_call") continue;
		return `[${raw}]`;
	}
	return null;
}
function buildPreviewItems(messages, maxItems, maxChars) {
	const items = [];
	for (const message of messages) {
		const toolCall = isToolCall(message);
		const role = normalizeRole(message.role, toolCall);
		let text = extractPreviewText(message);
		if (!text) {
			const toolNames = extractToolNames(message);
			if (toolNames.length > 0) {
				const shown = toolNames.slice(0, 2);
				const overflow = toolNames.length - shown.length;
				text = `call ${shown.join(", ")}`;
				if (overflow > 0) text += ` +${overflow}`;
			}
		}
		if (!text) text = extractMediaSummary(message);
		if (!text) continue;
		let trimmed = text.trim();
		if (!trimmed) continue;
		if (role === "user") trimmed = stripEnvelope(trimmed);
		trimmed = truncatePreviewText(trimmed, maxChars);
		items.push({
			role,
			text: trimmed
		});
	}
	if (items.length <= maxItems) return items;
	return items.slice(-maxItems);
}
function readRecentMessagesFromTranscript(filePath, maxMessages, readBytes) {
	let fd = null;
	try {
		fd = fs.openSync(filePath, "r");
		const size = fs.fstatSync(fd).size;
		if (size === 0) return [];
		const readStart = Math.max(0, size - readBytes);
		const readLen = Math.min(size, readBytes);
		const buf = Buffer.alloc(readLen);
		fs.readSync(fd, buf, 0, readLen, readStart);
		const tailLines = buf.toString("utf-8").split(/\r?\n/).filter((l) => l.trim()).slice(-PREVIEW_MAX_LINES);
		const collected = [];
		for (let i = tailLines.length - 1; i >= 0; i--) {
			const line = tailLines[i];
			try {
				const msg = JSON.parse(line)?.message;
				if (msg && typeof msg === "object") {
					collected.push(msg);
					if (collected.length >= maxMessages) break;
				}
			} catch {}
		}
		return collected.toReversed();
	} catch {
		return [];
	} finally {
		if (fd !== null) fs.closeSync(fd);
	}
}
function readSessionPreviewItemsFromTranscript(sessionId, storePath, sessionFile, agentId, maxItems, maxChars) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fs.existsSync(p));
	if (!filePath) return [];
	const boundedItems = Math.max(1, Math.min(maxItems, 50));
	const boundedChars = Math.max(20, Math.min(maxChars, 2e3));
	for (const readSize of PREVIEW_READ_SIZES) {
		const messages = readRecentMessagesFromTranscript(filePath, boundedItems, readSize);
		if (messages.length > 0 || readSize === PREVIEW_READ_SIZES[PREVIEW_READ_SIZES.length - 1]) return buildPreviewItems(messages, boundedItems, boundedChars);
	}
	return [];
}
//#endregion
export { readSessionPreviewItemsFromTranscript as a, stripEnvelopeFromMessages as c, countToolResults as d, extractToolCallNames as f, jsonUtf8BytesOrInfinity as g, jsonUtf8Bytes as h, readSessionMessages as i, stripEnvelope as l, firstEnumerableOwnKeys as m, capArrayByJsonBytes as n, readSessionTitleFieldsFromTranscript as o, boundedJsonUtf8Bytes as p, readLatestSessionUsageFromTranscript as r, stripEnvelopeFromMessage as s, attachOpenClawTranscriptMeta as t, stripMessageIdHints as u };
