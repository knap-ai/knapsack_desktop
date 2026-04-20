import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { b as truncateUtf16Safe } from "./utils-D5DtWkEu.js";
import { c as normalizeThinkLevel } from "./thinking.shared-CAbk7EZs.js";
import "./sanitize-user-facing-text-CQF1CTnZ.js";
import { h as isReasoningConstraintErrorMessage } from "./errors-CJULmF31.js";
import { t as sanitizeContentBlocksImages } from "./tool-images-D6i9LZcG.js";
import path from "node:path";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
//#region src/agents/pi-embedded-helpers/bootstrap.ts
function isBase64Signature(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	const compact = trimmed.replace(/\s+/g, "");
	if (!/^[A-Za-z0-9+/=_-]+$/.test(compact)) return false;
	const isUrl = compact.includes("-") || compact.includes("_");
	try {
		const buf = Buffer.from(compact, isUrl ? "base64url" : "base64");
		if (buf.length === 0) return false;
		const encoded = buf.toString(isUrl ? "base64url" : "base64");
		const normalize = (input) => input.replace(/=+$/g, "");
		return normalize(encoded) === normalize(compact);
	} catch {
		return false;
	}
}
/**
* Strips Claude-style thought_signature fields from content blocks.
*
* Gemini expects thought signatures as base64-encoded bytes, but Claude stores message ids
* like "msg_abc123...". We only strip "msg_*" to preserve any provider-valid signatures.
*/
function stripThoughtSignatures(content, options) {
	if (!Array.isArray(content)) return content;
	const allowBase64Only = options?.allowBase64Only ?? false;
	const includeCamelCase = options?.includeCamelCase ?? false;
	const shouldStripSignature = (value) => {
		if (!allowBase64Only) return typeof value === "string" && value.startsWith("msg_");
		return typeof value !== "string" || !isBase64Signature(value);
	};
	return content.map((block) => {
		if (!block || typeof block !== "object") return block;
		const rec = block;
		const stripSnake = shouldStripSignature(rec.thought_signature);
		const stripCamel = includeCamelCase ? shouldStripSignature(rec.thoughtSignature) : false;
		if (!stripSnake && !stripCamel) return block;
		const next = { ...rec };
		if (stripSnake) delete next.thought_signature;
		if (stripCamel) delete next.thoughtSignature;
		return next;
	});
}
const DEFAULT_BOOTSTRAP_MAX_CHARS = 12e3;
const DEFAULT_BOOTSTRAP_TOTAL_MAX_CHARS = 6e4;
const DEFAULT_BOOTSTRAP_PROMPT_TRUNCATION_WARNING_MODE = "once";
const MIN_BOOTSTRAP_FILE_BUDGET_CHARS = 64;
const BOOTSTRAP_HEAD_RATIO = .7;
const BOOTSTRAP_TAIL_RATIO = .2;
function resolveBootstrapMaxChars(cfg) {
	const raw = cfg?.agents?.defaults?.bootstrapMaxChars;
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
	return DEFAULT_BOOTSTRAP_MAX_CHARS;
}
function resolveBootstrapTotalMaxChars(cfg) {
	const raw = cfg?.agents?.defaults?.bootstrapTotalMaxChars;
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
	return DEFAULT_BOOTSTRAP_TOTAL_MAX_CHARS;
}
function resolveBootstrapPromptTruncationWarningMode(cfg) {
	const raw = cfg?.agents?.defaults?.bootstrapPromptTruncationWarning;
	if (raw === "off" || raw === "once" || raw === "always") return raw;
	return DEFAULT_BOOTSTRAP_PROMPT_TRUNCATION_WARNING_MODE;
}
function trimBootstrapContent(content, fileName, maxChars) {
	const trimmed = content.trimEnd();
	if (trimmed.length <= maxChars) return {
		content: trimmed,
		truncated: false,
		maxChars,
		originalLength: trimmed.length
	};
	const headChars = Math.floor(maxChars * BOOTSTRAP_HEAD_RATIO);
	const tailChars = Math.floor(maxChars * BOOTSTRAP_TAIL_RATIO);
	const head = trimmed.slice(0, headChars);
	const tail = trimmed.slice(-tailChars);
	return {
		content: [
			head,
			[
				"",
				`[...truncated, read ${fileName} for full content...]`,
				`…(truncated ${fileName}: kept ${headChars}+${tailChars} chars of ${trimmed.length})…`,
				""
			].join("\n"),
			tail
		].join("\n"),
		truncated: true,
		maxChars,
		originalLength: trimmed.length
	};
}
function clampToBudget(content, budget) {
	if (budget <= 0) return "";
	if (content.length <= budget) return content;
	if (budget <= 3) return truncateUtf16Safe(content, budget);
	return `${truncateUtf16Safe(content, budget - 1)}…`;
}
async function ensureSessionHeader(params) {
	const file = params.sessionFile;
	try {
		await fs.stat(file);
		return;
	} catch {}
	await fs.mkdir(path.dirname(file), {
		recursive: true,
		mode: 448
	});
	const entry = {
		type: "session",
		version: 2,
		id: params.sessionId,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		cwd: params.cwd
	};
	await fs.writeFile(file, `${JSON.stringify(entry)}\n`, {
		encoding: "utf-8",
		mode: 384
	});
}
function buildBootstrapContextFiles(files, opts) {
	const maxChars = opts?.maxChars ?? 12e3;
	let remainingTotalChars = Math.max(1, Math.floor(opts?.totalMaxChars ?? Math.max(maxChars, 6e4)));
	const result = [];
	for (const file of files) {
		if (remainingTotalChars <= 0) break;
		const pathValue = normalizeOptionalString(file.path) ?? "";
		if (!pathValue) {
			opts?.warn?.(`skipping bootstrap file "${file.name}" — missing or invalid "path" field (hook may have used "filePath" instead)`);
			continue;
		}
		if (file.missing) {
			const cappedMissingText = clampToBudget(`[MISSING] Expected at: ${pathValue}`, remainingTotalChars);
			if (!cappedMissingText) break;
			remainingTotalChars = Math.max(0, remainingTotalChars - cappedMissingText.length);
			result.push({
				path: pathValue,
				content: cappedMissingText
			});
			continue;
		}
		if (remainingTotalChars < MIN_BOOTSTRAP_FILE_BUDGET_CHARS) {
			opts?.warn?.(`remaining bootstrap budget is ${remainingTotalChars} chars (<${MIN_BOOTSTRAP_FILE_BUDGET_CHARS}); skipping additional bootstrap files`);
			break;
		}
		const fileMaxChars = Math.max(1, Math.min(maxChars, remainingTotalChars));
		const trimmed = trimBootstrapContent(file.content ?? "", file.name, fileMaxChars);
		const contentWithinBudget = clampToBudget(trimmed.content, remainingTotalChars);
		if (!contentWithinBudget) continue;
		if (trimmed.truncated || contentWithinBudget.length < trimmed.content.length) opts?.warn?.(`workspace bootstrap file ${file.name} is ${trimmed.originalLength} chars (limit ${trimmed.maxChars}); truncating in injected context`);
		remainingTotalChars = Math.max(0, remainingTotalChars - contentWithinBudget.length);
		result.push({
			path: pathValue,
			content: contentWithinBudget
		});
	}
	return result;
}
function sanitizeGoogleTurnOrdering(messages) {
	const GOOGLE_TURN_ORDER_BOOTSTRAP_TEXT = "(session bootstrap)";
	const first = messages[0];
	const role = first?.role;
	const content = first?.content;
	if (role === "user" && typeof content === "string" && content.trim() === GOOGLE_TURN_ORDER_BOOTSTRAP_TEXT) return messages;
	if (role !== "assistant") return messages;
	return [{
		role: "user",
		content: GOOGLE_TURN_ORDER_BOOTSTRAP_TEXT,
		timestamp: Date.now()
	}, ...messages];
}
//#endregion
//#region src/agents/pi-embedded-helpers/google.ts
function isGoogleModelApi(api) {
	return api === "google-gemini-cli" || api === "google-generative-ai";
}
//#endregion
//#region src/agents/pi-embedded-helpers/openai.ts
function parseOpenAIReasoningSignature(value) {
	if (!value) return null;
	let candidate = null;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
		try {
			candidate = JSON.parse(trimmed);
		} catch {
			return null;
		}
	} else if (typeof value === "object") candidate = value;
	if (!candidate) return null;
	const id = typeof candidate.id === "string" ? candidate.id : "";
	const type = typeof candidate.type === "string" ? candidate.type : "";
	if (!id.startsWith("rs_")) return null;
	if (type === "reasoning" || type.startsWith("reasoning.")) return {
		id,
		type
	};
	return null;
}
function hasFollowingNonThinkingBlock(content, index) {
	for (let i = index + 1; i < content.length; i++) {
		const block = content[i];
		if (!block || typeof block !== "object") return true;
		if (block.type !== "thinking") return true;
	}
	return false;
}
function splitOpenAIFunctionCallPairing(id) {
	const separator = id.indexOf("|");
	if (separator <= 0 || separator >= id.length - 1) return { callId: id };
	return {
		callId: id.slice(0, separator),
		itemId: id.slice(separator + 1)
	};
}
function isOpenAIToolCallType(type) {
	return type === "toolCall" || type === "toolUse" || type === "functionCall";
}
/**
* OpenAI can reject replayed `function_call` items with an `fc_*` id if the
* matching `reasoning` item is absent in the same assistant turn.
*
* When that pairing is missing, strip the `|fc_*` suffix from tool call ids so
* pi-ai omits `function_call.id` on replay.
*/
function downgradeOpenAIFunctionCallReasoningPairs(messages) {
	let changed = false;
	const rewrittenMessages = [];
	let pendingRewrittenIds = null;
	for (const msg of messages) {
		if (!msg || typeof msg !== "object") {
			pendingRewrittenIds = null;
			rewrittenMessages.push(msg);
			continue;
		}
		const role = msg.role;
		if (role === "assistant") {
			const assistantMsg = msg;
			if (!Array.isArray(assistantMsg.content)) {
				pendingRewrittenIds = null;
				rewrittenMessages.push(msg);
				continue;
			}
			const localRewrittenIds = /* @__PURE__ */ new Map();
			let seenReplayableReasoning = false;
			let assistantChanged = false;
			const nextContent = assistantMsg.content.map((block) => {
				if (!block || typeof block !== "object") return block;
				const thinkingBlock = block;
				if (thinkingBlock.type === "thinking" && parseOpenAIReasoningSignature(thinkingBlock.thinkingSignature)) {
					seenReplayableReasoning = true;
					return block;
				}
				const toolCallBlock = block;
				if (!isOpenAIToolCallType(toolCallBlock.type) || typeof toolCallBlock.id !== "string") return block;
				const pairing = splitOpenAIFunctionCallPairing(toolCallBlock.id);
				if (seenReplayableReasoning || !pairing.itemId || !pairing.itemId.startsWith("fc_")) return block;
				assistantChanged = true;
				localRewrittenIds.set(toolCallBlock.id, pairing.callId);
				return {
					...block,
					id: pairing.callId
				};
			});
			pendingRewrittenIds = localRewrittenIds.size > 0 ? localRewrittenIds : null;
			if (!assistantChanged) {
				rewrittenMessages.push(msg);
				continue;
			}
			changed = true;
			rewrittenMessages.push({
				...assistantMsg,
				content: nextContent
			});
			continue;
		}
		if (role === "toolResult" && pendingRewrittenIds && pendingRewrittenIds.size > 0) {
			const toolResult = msg;
			let toolResultChanged = false;
			const updates = {};
			if (typeof toolResult.toolCallId === "string") {
				const nextToolCallId = pendingRewrittenIds.get(toolResult.toolCallId);
				if (nextToolCallId && nextToolCallId !== toolResult.toolCallId) {
					updates.toolCallId = nextToolCallId;
					toolResultChanged = true;
				}
			}
			if (typeof toolResult.toolUseId === "string") {
				const nextToolUseId = pendingRewrittenIds.get(toolResult.toolUseId);
				if (nextToolUseId && nextToolUseId !== toolResult.toolUseId) {
					updates.toolUseId = nextToolUseId;
					toolResultChanged = true;
				}
			}
			if (!toolResultChanged) {
				rewrittenMessages.push(msg);
				continue;
			}
			changed = true;
			rewrittenMessages.push({
				...toolResult,
				...updates
			});
			continue;
		}
		pendingRewrittenIds = null;
		rewrittenMessages.push(msg);
	}
	return changed ? rewrittenMessages : messages;
}
/**
* OpenAI Responses API can reject transcripts that contain a standalone `reasoning` item id
* without the required following item.
*
* OpenClaw persists provider-specific reasoning metadata in `thinkingSignature`; if that metadata
* is incomplete, drop the block to keep history usable.
*/
function downgradeOpenAIReasoningBlocks(messages) {
	const out = [];
	for (const msg of messages) {
		if (!msg || typeof msg !== "object") {
			out.push(msg);
			continue;
		}
		if (msg.role !== "assistant") {
			out.push(msg);
			continue;
		}
		const assistantMsg = msg;
		if (!Array.isArray(assistantMsg.content)) {
			out.push(msg);
			continue;
		}
		let changed = false;
		const nextContent = [];
		for (let i = 0; i < assistantMsg.content.length; i++) {
			const block = assistantMsg.content[i];
			if (!block || typeof block !== "object") {
				nextContent.push(block);
				continue;
			}
			const record = block;
			if (record.type !== "thinking") {
				nextContent.push(block);
				continue;
			}
			if (!parseOpenAIReasoningSignature(record.thinkingSignature)) {
				nextContent.push(block);
				continue;
			}
			if (hasFollowingNonThinkingBlock(assistantMsg.content, i)) {
				nextContent.push(block);
				continue;
			}
			changed = true;
		}
		if (!changed) {
			out.push(msg);
			continue;
		}
		if (nextContent.length === 0) continue;
		out.push({
			...assistantMsg,
			content: nextContent
		});
	}
	return out;
}
//#endregion
//#region src/agents/tool-call-id.ts
const NATIVE_ANTHROPIC_TOOL_USE_ID_RE = /^toolu_[A-Za-z0-9_]+$/;
const REDACTED_SESSIONS_SPAWN_ATTACHMENT_CONTENT = "__OPENCLAW_REDACTED__";
const SESSIONS_SPAWN_ATTACHMENT_METADATA_KEYS = [
	"name",
	"encoding",
	"mimeType"
];
const TOOL_CALL_NAME_MAX_CHARS = 64;
const TOOL_CALL_NAME_RE = /^[A-Za-z0-9_:.-]+$/;
const STRICT9_LEN = 9;
const TOOL_CALL_TYPES = new Set([
	"toolCall",
	"toolUse",
	"functionCall"
]);
/**
* Sanitize a tool call ID to be compatible with various providers.
*
* - "strict" mode: only [a-zA-Z0-9]
* - "strict9" mode: only [a-zA-Z0-9], length 9 (Mistral tool call requirement)
*/
function sanitizeToolCallId(id, mode = "strict") {
	if (!id || typeof id !== "string") {
		if (mode === "strict9") return "defaultid";
		return "defaulttoolid";
	}
	if (mode === "strict9") {
		const alphanumericOnly = id.replace(/[^a-zA-Z0-9]/g, "");
		if (alphanumericOnly.length >= STRICT9_LEN) return alphanumericOnly.slice(0, STRICT9_LEN);
		if (alphanumericOnly.length > 0) return shortHash(alphanumericOnly, STRICT9_LEN);
		return shortHash("sanitized", STRICT9_LEN);
	}
	const alphanumericOnly = id.replace(/[^a-zA-Z0-9]/g, "");
	return alphanumericOnly.length > 0 ? alphanumericOnly : "sanitizedtoolid";
}
function extractToolCallsFromAssistant(msg) {
	const content = msg.content;
	if (!Array.isArray(content)) return [];
	const toolCalls = [];
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const rec = block;
		if (typeof rec.id !== "string" || !rec.id) continue;
		if (typeof rec.type === "string" && TOOL_CALL_TYPES.has(rec.type)) toolCalls.push({
			id: rec.id,
			name: typeof rec.name === "string" ? rec.name : void 0
		});
	}
	return toolCalls;
}
function extractToolResultId(msg) {
	const toolCallId = msg.toolCallId;
	if (typeof toolCallId === "string" && toolCallId) return toolCallId;
	const toolUseId = msg.toolUseId;
	if (typeof toolUseId === "string" && toolUseId) return toolUseId;
	return null;
}
function isThinkingLikeBlock$1(block) {
	if (!block || typeof block !== "object") return false;
	const type = block.type;
	return type === "thinking" || type === "redacted_thinking";
}
function hasToolCallInput(block) {
	const hasInput = "input" in block ? block.input !== void 0 && block.input !== null : false;
	const hasArguments = "arguments" in block ? block.arguments !== void 0 && block.arguments !== null : false;
	return hasInput || hasArguments;
}
function normalizeAllowedToolNames(allowedToolNames) {
	if (!allowedToolNames) return null;
	const normalized = /* @__PURE__ */ new Set();
	for (const name of allowedToolNames) {
		if (typeof name !== "string") continue;
		const trimmed = name.trim();
		if (!trimmed) continue;
		normalized.add(normalizeLowercaseStringOrEmpty(trimmed));
	}
	return normalized.size > 0 ? normalized : null;
}
function isRedactedSessionsSpawnAttachment(item) {
	if (!item || typeof item !== "object") return false;
	const attachment = item;
	if (attachment.content !== REDACTED_SESSIONS_SPAWN_ATTACHMENT_CONTENT) return false;
	for (const key of Object.keys(attachment)) {
		if (key === "content") continue;
		if (!SESSIONS_SPAWN_ATTACHMENT_METADATA_KEYS.includes(key)) return false;
		if (typeof attachment[key] !== "string" || attachment[key].trim().length === 0) return false;
	}
	return true;
}
function toolCallNeedsReplayMutation(block) {
	const rawName = typeof block.name === "string" ? block.name : void 0;
	const trimmedName = rawName?.trim();
	if (rawName && rawName !== trimmedName) return true;
	if (normalizeLowercaseStringOrEmpty(trimmedName) !== "sessions_spawn") return false;
	for (const payload of [block.arguments, block.input]) {
		if (!payload || typeof payload !== "object") continue;
		const attachments = payload.attachments;
		if (!Array.isArray(attachments)) continue;
		for (const attachment of attachments) if (!isRedactedSessionsSpawnAttachment(attachment)) return true;
	}
	return false;
}
function hasReplaySafeToolCallName(block, allowedToolNames) {
	if (typeof block.name !== "string") return false;
	const trimmed = block.name.trim();
	if (!trimmed) return false;
	if (trimmed.length > TOOL_CALL_NAME_MAX_CHARS || !TOOL_CALL_NAME_RE.test(trimmed)) return false;
	if (!allowedToolNames) return true;
	return allowedToolNames.has(normalizeLowercaseStringOrEmpty(trimmed));
}
function isReplaySafeThinkingAssistantMessage(message, allowedToolNames) {
	const content = message.content;
	if (!Array.isArray(content)) return false;
	let sawThinking = false;
	let sawToolCall = false;
	const seenToolCallIds = /* @__PURE__ */ new Set();
	for (const block of content) {
		if (isThinkingLikeBlock$1(block)) {
			sawThinking = true;
			continue;
		}
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (typeof typedBlock.type !== "string" || !TOOL_CALL_TYPES.has(typedBlock.type)) continue;
		sawToolCall = true;
		const toolCallId = typeof typedBlock.id === "string" ? typedBlock.id.trim() : "";
		if (!hasToolCallInput(typedBlock) || !toolCallId || seenToolCallIds.has(toolCallId) || !hasReplaySafeToolCallName(typedBlock, allowedToolNames) || toolCallNeedsReplayMutation(typedBlock)) return false;
		seenToolCallIds.add(toolCallId);
	}
	return sawThinking && sawToolCall;
}
function collectReplaySafeThinkingToolIds(messages, allowedToolNames) {
	const reserved = /* @__PURE__ */ new Set();
	const preservedIndexes = /* @__PURE__ */ new Set();
	for (let index = 0; index < messages.length; index += 1) {
		const message = messages[index];
		if (!message || typeof message !== "object" || message.role !== "assistant") continue;
		const assistant = message;
		if (!isReplaySafeThinkingAssistantMessage(assistant, allowedToolNames)) continue;
		const toolCalls = extractToolCallsFromAssistant(assistant);
		if (toolCalls.some((toolCall) => reserved.has(toolCall.id))) continue;
		preservedIndexes.add(index);
		for (const toolCall of toolCalls) reserved.add(toolCall.id);
	}
	return {
		reservedIds: reserved,
		preservedIndexes
	};
}
function shortHash(text, length = 8) {
	return createHash("sha256").update(text).digest("hex").slice(0, length);
}
function isNativeAnthropicToolUseId(id) {
	return NATIVE_ANTHROPIC_TOOL_USE_ID_RE.test(id);
}
function makeUniqueToolId(params) {
	if (params.mode === "strict9") {
		const base = sanitizeToolCallId(params.id, params.mode);
		const candidate = base.length >= STRICT9_LEN ? base.slice(0, STRICT9_LEN) : "";
		if (candidate && !params.used.has(candidate)) return candidate;
		for (let i = 0; i < 1e3; i += 1) {
			const hashed = shortHash(`${params.id}:${i}`, STRICT9_LEN);
			if (!params.used.has(hashed)) return hashed;
		}
		return shortHash(`${params.id}:${Date.now()}`, STRICT9_LEN);
	}
	const MAX_LEN = 40;
	const base = sanitizeToolCallId(params.id, params.mode).slice(0, MAX_LEN);
	if (!params.used.has(base)) return base;
	const hash = shortHash(params.id);
	const separator = params.mode === "strict" ? "" : "_";
	const maxBaseLen = MAX_LEN - separator.length - hash.length;
	const candidate = `${base.length > maxBaseLen ? base.slice(0, maxBaseLen) : base}${separator}${hash}`;
	if (!params.used.has(candidate)) return candidate;
	for (let i = 2; i < 1e3; i += 1) {
		const suffix = params.mode === "strict" ? `x${i}` : `_${i}`;
		const next = `${candidate.slice(0, MAX_LEN - suffix.length)}${suffix}`;
		if (!params.used.has(next)) return next;
	}
	const ts = params.mode === "strict" ? `t${Date.now()}` : `_${Date.now()}`;
	return `${candidate.slice(0, MAX_LEN - ts.length)}${ts}`;
}
function createOccurrenceAwareResolver(mode, options) {
	const used = new Set(options?.reservedIds ?? []);
	const assistantOccurrences = /* @__PURE__ */ new Map();
	const orphanToolResultOccurrences = /* @__PURE__ */ new Map();
	const pendingByRawId = /* @__PURE__ */ new Map();
	const preserveNativeAnthropicToolUseIds = options?.preserveNativeAnthropicToolUseIds === true;
	const allocate = (seed) => {
		const next = makeUniqueToolId({
			id: seed,
			used,
			mode
		});
		used.add(next);
		return next;
	};
	const allocatePreservingNativeAnthropicId = (id, occurrence) => {
		if (preserveNativeAnthropicToolUseIds && isNativeAnthropicToolUseId(id) && occurrence === 1 && !used.has(id)) {
			used.add(id);
			return id;
		}
		return allocate(occurrence === 1 ? id : `${id}:${occurrence}`);
	};
	const resolveAssistantId = (id) => {
		const occurrence = (assistantOccurrences.get(id) ?? 0) + 1;
		assistantOccurrences.set(id, occurrence);
		const next = allocatePreservingNativeAnthropicId(id, occurrence);
		const pending = pendingByRawId.get(id);
		if (pending) pending.push(next);
		else pendingByRawId.set(id, [next]);
		return next;
	};
	const resolveToolResultId = (id) => {
		const pending = pendingByRawId.get(id);
		if (pending && pending.length > 0) {
			const next = pending.shift();
			if (pending.length === 0) pendingByRawId.delete(id);
			return next;
		}
		const occurrence = (orphanToolResultOccurrences.get(id) ?? 0) + 1;
		orphanToolResultOccurrences.set(id, occurrence);
		if (preserveNativeAnthropicToolUseIds && isNativeAnthropicToolUseId(id) && occurrence === 1 && !used.has(id)) {
			used.add(id);
			return id;
		}
		return allocate(`${id}:tool_result:${occurrence}`);
	};
	const preserveAssistantId = (id) => {
		used.add(id);
		const pending = pendingByRawId.get(id);
		if (pending) pending.push(id);
		else pendingByRawId.set(id, [id]);
		return id;
	};
	return {
		resolveAssistantId,
		resolveToolResultId,
		preserveAssistantId
	};
}
function rewriteAssistantToolCallIds(params) {
	const content = params.message.content;
	if (!Array.isArray(content)) return params.message;
	let changed = false;
	const next = content.map((block) => {
		if (!block || typeof block !== "object") return block;
		const rec = block;
		const type = rec.type;
		const id = rec.id;
		if (type !== "functionCall" && type !== "toolUse" && type !== "toolCall" || typeof id !== "string" || !id) return block;
		const nextId = params.resolveId(id);
		if (nextId === id) return block;
		changed = true;
		return {
			...block,
			id: nextId
		};
	});
	if (!changed) return params.message;
	return {
		...params.message,
		content: next
	};
}
function rewriteToolResultIds(params) {
	const toolCallId = typeof params.message.toolCallId === "string" && params.message.toolCallId ? params.message.toolCallId : void 0;
	const toolUseId = params.message.toolUseId;
	const toolUseIdStr = typeof toolUseId === "string" && toolUseId ? toolUseId : void 0;
	const sharedRawId = toolCallId && toolUseIdStr && toolCallId === toolUseIdStr ? toolCallId : void 0;
	const sharedResolvedId = sharedRawId ? params.resolveId(sharedRawId) : void 0;
	const nextToolCallId = sharedResolvedId ?? (toolCallId ? params.resolveId(toolCallId) : void 0);
	const nextToolUseId = sharedResolvedId ?? (toolUseIdStr ? params.resolveId(toolUseIdStr) : void 0);
	if (nextToolCallId === toolCallId && nextToolUseId === toolUseIdStr) return params.message;
	return {
		...params.message,
		...nextToolCallId && { toolCallId: nextToolCallId },
		...nextToolUseId && { toolUseId: nextToolUseId }
	};
}
/**
* Sanitize tool call IDs for provider compatibility.
*
* @param messages - The messages to sanitize
* @param mode - "strict" (alphanumeric only) or "strict9" (alphanumeric length 9)
*/
function sanitizeToolCallIdsForCloudCodeAssist(messages, mode = "strict", options) {
	const allowedToolNames = normalizeAllowedToolNames(options?.allowedToolNames);
	const replaySafeThinking = options?.preserveReplaySafeThinkingToolCallIds === true ? collectReplaySafeThinkingToolIds(messages, allowedToolNames) : void 0;
	const { resolveAssistantId, resolveToolResultId, preserveAssistantId } = createOccurrenceAwareResolver(mode, {
		...options,
		reservedIds: replaySafeThinking?.reservedIds
	});
	let changed = false;
	const out = messages.map((msg, index) => {
		if (!msg || typeof msg !== "object") return msg;
		const role = msg.role;
		if (role === "assistant") {
			const assistant = msg;
			if (replaySafeThinking?.preservedIndexes.has(index)) {
				for (const toolCall of extractToolCallsFromAssistant(assistant)) preserveAssistantId(toolCall.id);
				return msg;
			}
			const next = rewriteAssistantToolCallIds({
				message: assistant,
				resolveId: resolveAssistantId
			});
			if (next !== msg) changed = true;
			return next;
		}
		if (role === "toolResult") {
			const next = rewriteToolResultIds({
				message: msg,
				resolveId: resolveToolResultId
			});
			if (next !== msg) changed = true;
			return next;
		}
		return msg;
	});
	return changed ? out : messages;
}
//#endregion
//#region src/agents/pi-embedded-helpers/images.ts
function isThinkingOrRedactedBlock(block) {
	if (!block || typeof block !== "object") return false;
	const rec = block;
	return rec.type === "thinking" || rec.type === "redacted_thinking";
}
async function sanitizeSessionMessagesImages(messages, label, options) {
	const allowNonImageSanitization = (options?.sanitizeMode ?? "full") === "full";
	const imageSanitization = {
		maxDimensionPx: options?.maxDimensionPx,
		maxBytes: options?.maxBytes
	};
	const sanitizedIds = options?.sanitizeToolCallIds === true ? sanitizeToolCallIdsForCloudCodeAssist(messages, options.toolCallIdMode, { preserveNativeAnthropicToolUseIds: options?.preserveNativeAnthropicToolUseIds }) : messages;
	const out = [];
	for (const msg of sanitizedIds) {
		if (!msg || typeof msg !== "object") {
			out.push(msg);
			continue;
		}
		const role = msg.role;
		if (role === "toolResult") {
			const toolMsg = msg;
			const nextContent = await sanitizeContentBlocksImages(Array.isArray(toolMsg.content) ? toolMsg.content : [], label, imageSanitization);
			out.push({
				...toolMsg,
				content: nextContent
			});
			continue;
		}
		if (role === "user") {
			const userMsg = msg;
			const content = userMsg.content;
			if (Array.isArray(content)) {
				const nextContent = await sanitizeContentBlocksImages(content, label, imageSanitization);
				out.push({
					...userMsg,
					content: nextContent
				});
				continue;
			}
		}
		if (role === "assistant") {
			const assistantMsg = msg;
			if (assistantMsg.stopReason === "error") {
				const content = assistantMsg.content;
				if (Array.isArray(content)) {
					const nextContent = await sanitizeContentBlocksImages(content, label, imageSanitization);
					out.push({
						...assistantMsg,
						content: nextContent
					});
				} else out.push(assistantMsg);
				continue;
			}
			const content = assistantMsg.content;
			if (Array.isArray(content)) {
				const strippedContent = options?.preserveSignatures ? content : stripThoughtSignatures(content, options?.sanitizeThoughtSignatures);
				if (!allowNonImageSanitization) {
					const nextContent = await sanitizeContentBlocksImages(strippedContent, label, imageSanitization);
					out.push({
						...assistantMsg,
						content: nextContent
					});
					continue;
				}
				const finalContent = await sanitizeContentBlocksImages(options?.preserveSignatures && strippedContent.some((block) => isThinkingOrRedactedBlock(block)) ? strippedContent : strippedContent.filter((block) => {
					if (!block || typeof block !== "object") return true;
					const rec = block;
					if (rec.type !== "text" || typeof rec.text !== "string") return true;
					return rec.text.trim().length > 0;
				}), label, imageSanitization);
				if (finalContent.length === 0) continue;
				out.push({
					...assistantMsg,
					content: finalContent
				});
				continue;
			}
		}
		out.push(msg);
	}
	return out;
}
//#endregion
//#region src/agents/pi-embedded-helpers/messaging-dedupe.ts
const MIN_DUPLICATE_TEXT_LENGTH = 10;
/**
* Normalize text for duplicate comparison.
* - Trims whitespace
* - Lowercases
* - Strips emoji (Emoji_Presentation and Extended_Pictographic)
* - Collapses multiple spaces to single space
*/
function normalizeTextForComparison(text) {
	return normalizeLowercaseStringOrEmpty(text).replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}
function isMessagingToolDuplicateNormalized(normalized, normalizedSentTexts) {
	if (normalizedSentTexts.length === 0) return false;
	if (!normalized || normalized.length < MIN_DUPLICATE_TEXT_LENGTH) return false;
	return normalizedSentTexts.some((normalizedSent) => {
		if (!normalizedSent || normalizedSent.length < MIN_DUPLICATE_TEXT_LENGTH) return false;
		return normalized.includes(normalizedSent) || normalizedSent.includes(normalized);
	});
}
function isMessagingToolDuplicate(text, sentTexts) {
	if (sentTexts.length === 0) return false;
	const normalized = normalizeTextForComparison(text);
	if (!normalized || normalized.length < MIN_DUPLICATE_TEXT_LENGTH) return false;
	return isMessagingToolDuplicateNormalized(normalized, sentTexts.map(normalizeTextForComparison));
}
//#endregion
//#region src/agents/pi-embedded-helpers/thinking.ts
function extractSupportedValues(raw) {
	const match = raw.match(/supported values are:\s*([^\n.]+)/i) ?? raw.match(/supported values:\s*([^\n.]+)/i);
	if (!match?.[1]) return [];
	const fragment = match[1];
	const quoted = Array.from(fragment.matchAll(/['"]([^'"]+)['"]/g)).map((entry) => entry[1]?.trim());
	if (quoted.length > 0) return quoted.filter((entry) => Boolean(entry));
	return fragment.split(/,|\band\b/gi).map((entry) => entry.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "").trim()).filter(Boolean);
}
function pickFallbackThinkingLevel(params) {
	const raw = params.message?.trim();
	if (!raw) return;
	if (isReasoningConstraintErrorMessage(raw) && !params.attempted.has("minimal")) return "minimal";
	const supported = extractSupportedValues(raw);
	if (supported.length === 0) {
		if (/not supported/i.test(raw) && !params.attempted.has("off")) return "off";
		return;
	}
	for (const entry of supported) {
		const normalized = normalizeThinkLevel(entry);
		if (!normalized) continue;
		if (params.attempted.has(normalized)) continue;
		return normalized;
	}
}
//#endregion
//#region src/agents/pi-embedded-helpers/turns.ts
function isToolCallBlock(block) {
	return block.type === "toolUse" || block.type === "toolCall" || block.type === "functionCall";
}
function isThinkingLikeBlock(block) {
	if (!block || typeof block !== "object") return false;
	const type = block.type;
	return type === "thinking" || type === "redacted_thinking";
}
function isAbortedAssistantTurn(message) {
	const stopReason = message.stopReason;
	return stopReason === "aborted" || stopReason === "error";
}
function extractToolResultMatchIds(record) {
	const ids = /* @__PURE__ */ new Set();
	for (const value of [
		record.toolUseId,
		record.toolCallId,
		record.tool_use_id,
		record.tool_call_id,
		record.callId,
		record.call_id
	]) {
		const id = normalizeOptionalString(value);
		if (id) ids.add(id);
	}
	return ids;
}
function extractToolResultMatchName(record) {
	return normalizeOptionalString(record.toolName) ?? normalizeOptionalString(record.name) ?? null;
}
function collectAnyToolResultIds(message) {
	const ids = /* @__PURE__ */ new Set();
	const role = message.role;
	if (role === "toolResult") {
		const toolResultId = extractToolResultId(message);
		if (toolResultId) ids.add(toolResultId);
	} else if (role === "tool") {
		const record = message;
		for (const id of extractToolResultMatchIds(record)) ids.add(id);
	}
	const content = message.content;
	if (!Array.isArray(content)) return ids;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const record = block;
		if (record.type !== "toolResult" && record.type !== "tool") continue;
		for (const id of extractToolResultMatchIds(record)) ids.add(id);
	}
	return ids;
}
function collectTrustedToolResultMatches(message) {
	const matches = /* @__PURE__ */ new Map();
	const role = message.role;
	const addMatch = (ids, toolName) => {
		for (const id of ids) {
			const bucket = matches.get(id) ?? /* @__PURE__ */ new Set();
			if (toolName) bucket.add(toolName);
			matches.set(id, bucket);
		}
	};
	if (role === "toolResult") {
		const record = message;
		addMatch([...extractToolResultMatchIds(record), ...(() => {
			const canonicalId = extractToolResultId(message);
			return canonicalId ? [canonicalId] : [];
		})()], extractToolResultMatchName(record));
	} else if (role === "tool") {
		const record = message;
		addMatch(extractToolResultMatchIds(record), extractToolResultMatchName(record));
	}
	return matches;
}
function collectFutureToolResultMatches(messages, startIndex) {
	const matches = /* @__PURE__ */ new Map();
	for (let index = startIndex + 1; index < messages.length; index += 1) {
		const candidate = messages[index];
		if (!candidate || typeof candidate !== "object") continue;
		if (candidate.role === "assistant") break;
		for (const [id, toolNames] of collectTrustedToolResultMatches(candidate)) {
			const bucket = matches.get(id) ?? /* @__PURE__ */ new Set();
			for (const toolName of toolNames) bucket.add(toolName);
			matches.set(id, bucket);
		}
	}
	return matches;
}
function collectFutureToolResultIds(messages, startIndex) {
	const ids = /* @__PURE__ */ new Set();
	for (let index = startIndex + 1; index < messages.length; index += 1) {
		const candidate = messages[index];
		if (!candidate || typeof candidate !== "object") continue;
		if (candidate.role === "assistant") break;
		for (const id of collectAnyToolResultIds(candidate)) ids.add(id);
	}
	return ids;
}
/**
* Strips dangling tool-call blocks from assistant messages when no later
* tool-result span before the next assistant turn resolves them.
* This fixes the "tool_use ids found without tool_result blocks" error from Anthropic.
*/
function stripDanglingAnthropicToolUses(messages) {
	const result = [];
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		if (!msg || typeof msg !== "object") {
			result.push(msg);
			continue;
		}
		if (msg.role !== "assistant") {
			result.push(msg);
			continue;
		}
		const assistantMsg = msg;
		const originalContent = Array.isArray(assistantMsg.content) ? assistantMsg.content : [];
		if (originalContent.length === 0) {
			result.push(msg);
			continue;
		}
		if (extractToolCallsFromAssistant(msg).length === 0) {
			result.push(msg);
			continue;
		}
		const hasThinking = originalContent.some((block) => isThinkingLikeBlock(block));
		const validToolResultMatches = collectFutureToolResultMatches(messages, i);
		const validToolUseIds = collectFutureToolResultIds(messages, i);
		if (hasThinking) {
			if (originalContent.every((block) => {
				if (!block || !isToolCallBlock(block)) return true;
				const blockId = normalizeOptionalString(block.id);
				const blockName = normalizeOptionalString(block.name);
				if (!blockId || !blockName) return false;
				const matchingToolNames = validToolResultMatches.get(blockId);
				if (!matchingToolNames) return false;
				return matchingToolNames.size === 0 || matchingToolNames.has(blockName);
			})) result.push(msg);
			else result.push({
				...assistantMsg,
				content: isAbortedAssistantTurn(msg) ? [] : [{
					type: "text",
					text: "[tool calls omitted]"
				}]
			});
			continue;
		}
		const filteredContent = originalContent.filter((block) => {
			if (!block) return false;
			if (!isToolCallBlock(block)) return true;
			const blockId = normalizeOptionalString(block.id);
			return blockId ? validToolUseIds.has(blockId) : false;
		});
		if (filteredContent.length === originalContent.length) {
			result.push(msg);
			continue;
		}
		if (originalContent.length > 0 && filteredContent.length === 0) result.push({
			...assistantMsg,
			content: isAbortedAssistantTurn(msg) ? [] : [{
				type: "text",
				text: "[tool calls omitted]"
			}]
		});
		else result.push({
			...assistantMsg,
			content: filteredContent
		});
	}
	return result;
}
function validateTurnsWithConsecutiveMerge(params) {
	const { messages, role, merge } = params;
	if (!Array.isArray(messages) || messages.length === 0) return messages;
	const result = [];
	let lastRole;
	for (const msg of messages) {
		if (!msg || typeof msg !== "object") {
			result.push(msg);
			continue;
		}
		const msgRole = msg.role;
		if (!msgRole) {
			result.push(msg);
			continue;
		}
		if (msgRole === lastRole && lastRole === role) {
			const lastMsg = result[result.length - 1];
			const currentMsg = msg;
			if (lastMsg && typeof lastMsg === "object") {
				const lastTyped = lastMsg;
				result[result.length - 1] = merge(lastTyped, currentMsg);
				continue;
			}
		}
		result.push(msg);
		lastRole = msgRole;
	}
	return result;
}
function mergeConsecutiveAssistantTurns(previous, current) {
	const mergedContent = [...Array.isArray(previous.content) ? previous.content : [], ...Array.isArray(current.content) ? current.content : []];
	return {
		...previous,
		content: mergedContent,
		...current.usage && { usage: current.usage },
		...current.stopReason && { stopReason: current.stopReason },
		...current.errorMessage && { errorMessage: current.errorMessage }
	};
}
/**
* Validates and fixes conversation turn sequences for Gemini API.
* Gemini requires strict alternating user→assistant→tool→user pattern.
* Merges consecutive assistant messages together.
*/
function validateGeminiTurns(messages) {
	return validateTurnsWithConsecutiveMerge({
		messages,
		role: "assistant",
		merge: mergeConsecutiveAssistantTurns
	});
}
function mergeConsecutiveUserTurns(previous, current) {
	const mergedContent = [...Array.isArray(previous.content) ? previous.content : [], ...Array.isArray(current.content) ? current.content : []];
	return {
		...current,
		content: mergedContent,
		timestamp: current.timestamp ?? previous.timestamp
	};
}
/**
* Validates and fixes conversation turn sequences for Anthropic API.
* Anthropic requires strict alternating user→assistant pattern.
* Merges consecutive user messages together.
* Also strips dangling tool_use blocks that lack corresponding tool_result blocks.
*/
function validateAnthropicTurns(messages) {
	return validateTurnsWithConsecutiveMerge({
		messages: stripDanglingAnthropicToolUses(messages),
		role: "user",
		merge: mergeConsecutiveUserTurns
	});
}
//#endregion
export { resolveBootstrapPromptTruncationWarningMode as _, isMessagingToolDuplicateNormalized as a, extractToolCallsFromAssistant as c, downgradeOpenAIFunctionCallReasoningPairs as d, downgradeOpenAIReasoningBlocks as f, resolveBootstrapMaxChars as g, ensureSessionHeader as h, isMessagingToolDuplicate as i, extractToolResultId as l, buildBootstrapContextFiles as m, validateGeminiTurns as n, normalizeTextForComparison as o, isGoogleModelApi as p, pickFallbackThinkingLevel as r, sanitizeSessionMessagesImages as s, validateAnthropicTurns as t, sanitizeToolCallIdsForCloudCodeAssist as u, resolveBootstrapTotalMaxChars as v, sanitizeGoogleTurnOrdering as y };
