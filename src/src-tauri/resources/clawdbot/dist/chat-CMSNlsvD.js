import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { d as readStringValue, i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { p as resolveSessionAgentId } from "./agent-scope-KFH9bkHi.js";
import { _ as hasGatewayClientCap, g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES, n as isGatewayCliClient, o as isWebchatClient, p as GATEWAY_CLIENT_CAPS, u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { r as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-core-BIZsQ6dr.js";
import { _ as validateChatSendParams, g as validateChatInjectParams, h as validateChatHistoryParams, m as validateChatAbortParams, nn as ErrorCodes, rn as errorShape, t as formatValidationErrors } from "./protocol-C6T5DFc8.js";
import { a as normalizeInputProvenance } from "./input-provenance-BIw3ISWS.js";
import { o as ADMIN_SCOPE } from "./method-scopes-D3xbsVVt.js";
import { x as resolveThinkingDefault } from "./model-selection-CTdyYoio.js";
import "./sessions-vP2E4vs-.js";
import { i as resolveSessionFilePath } from "./paths-CZMxg3hs.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-CdRuhFsO.js";
import { a as loadSessionEntry, f as resolveSessionModelRef, l as resolveGatewayModelSupportsImages } from "./session-utils-hDe0hdis.js";
import { c as stripEnvelopeFromMessages, i as readSessionMessages, l as jsonUtf8Bytes, n as capArrayByJsonBytes, s as stripEnvelopeFromMessage, t as attachOpenClawTranscriptMeta } from "./session-utils.fs-BtTrNS1L.js";
import { o as parseAssistantTextSignature, s as resolveAssistantMessagePhase } from "./chat-message-content-BsffCIGz.js";
import { i as stripInlineDirectiveTagsFromMessageForDisplay, r as stripInlineDirectiveTagsForDisplay } from "./directive-tags-_9B0F8vD.js";
import { n as stripInboundMetadata } from "./strip-inbound-meta-FgJYIXvo.js";
import { a as isSilentReplyText, n as SILENT_REPLY_TOKEN } from "./tokens-CKM4Lddu.js";
import { a as isAudioFileName } from "./mime-B6nXlmtY.js";
import { p as resolveSendableOutboundReplyParts } from "./reply-payload-Db_8BQiX.js";
import { a as safeFileURLToPath, t as assertNoWindowsNetworkPath } from "./local-file-access-CpkF4sBk.js";
import { r as getAgentScopedMediaLocalRoots } from "./local-roots-BrPriMlc.js";
import { l as saveMediaBuffer } from "./store-CFeRgpZO.js";
import { n as assertLocalMediaAllowed, t as LocalMediaAccessError } from "./local-media-access-BjcJKJws.js";
import { t as resolveAgentTimeoutMs } from "./timeout-CxW3WOrq.js";
import { t as rewriteTranscriptEntriesInSessionFile } from "./transcript-rewrite-DHjUPkJL.js";
import { i as resolveUserTimezone } from "./date-time-CH5CpFpu.js";
import { n as formatZonedTimestamp } from "./format-datetime-CljomMGY.js";
import { n as isAbortRequestText } from "./abort-primitives-BG-J_PnY.js";
import { i as createReplyDispatcher, t as dispatchInboundMessage } from "./dispatch-JNo_iJw5.js";
import { n as resolveSendPolicy } from "./send-policy-DyHi525p.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-DHFpjrzi.js";
import { t as formatForLog } from "./ws-log-DHlv01OL.js";
import { n as MediaOffloadError, r as parseMessageWithAttachments, t as normalizeRpcAttachmentsToChatAttachments } from "./attachment-normalize-fsjzmyqL.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/gateway/server-methods/agent-timestamp.ts
/**
* Cron jobs inject "Current time: ..." into their messages.
* Skip injection for those.
*/
const CRON_TIME_PATTERN = /Current time: /;
/**
* Matches a leading `[... YYYY-MM-DD HH:MM ...]` envelope — either from
* channel plugins or from a previous injection. Uses the same YYYY-MM-DD
* HH:MM format as {@link formatZonedTimestamp}, so detection stays in sync
* with the formatting.
*/
const TIMESTAMP_ENVELOPE_PATTERN = /^\[.*\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
/**
* Injects a compact timestamp prefix into a message if one isn't already
* present. Uses the same `YYYY-MM-DD HH:MM TZ` format as channel envelope
* timestamps ({@link formatZonedTimestamp}), keeping token cost low (~7
* tokens) and format consistent across all agent contexts.
*
* Used by the gateway `agent` and `chat.send` handlers to give TUI, web,
* spawned subagents, `sessions_send`, and heartbeat wake events date/time
* awareness — without modifying the system prompt (which is cached).
*
* Channel messages (Discord, Telegram, etc.) already have timestamps via
* envelope formatting and take a separate code path — they never reach
* these handlers, so there is no double-stamping risk. The detection
* pattern is a safety net for edge cases.
*
* @see https://github.com/openclaw/openclaw/issues/3658
*/
function injectTimestamp(message, opts) {
	if (!message.trim()) return message;
	if (TIMESTAMP_ENVELOPE_PATTERN.test(message)) return message;
	if (CRON_TIME_PATTERN.test(message)) return message;
	const now = opts?.now ?? /* @__PURE__ */ new Date();
	const timezone = opts?.timezone ?? "UTC";
	const formatted = formatZonedTimestamp(now, { timeZone: timezone });
	if (!formatted) return message;
	return `[${new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		weekday: "short"
	}).format(now)} ${formatted}] ${message}`;
}
/**
* Build TimestampInjectionOptions from an OpenClawConfig.
*/
function timestampOptsFromConfig(cfg) {
	return { timezone: resolveUserTimezone(cfg.agents?.defaults?.userTimezone) };
}
//#endregion
//#region src/gateway/server-methods/agent-wait-dedupe.ts
const AGENT_WAITERS_BY_RUN_ID = /* @__PURE__ */ new Map();
function parseRunIdFromDedupeKey(key) {
	if (key.startsWith("agent:")) return key.slice(6) || null;
	if (key.startsWith("chat:")) return key.slice(5) || null;
	return null;
}
function asFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function removeWaiter(runId, waiter) {
	const waiters = AGENT_WAITERS_BY_RUN_ID.get(runId);
	if (!waiters) return;
	waiters.delete(waiter);
	if (waiters.size === 0) AGENT_WAITERS_BY_RUN_ID.delete(runId);
}
function addWaiter(runId, waiter) {
	const normalizedRunId = runId.trim();
	if (!normalizedRunId) return () => {};
	const existing = AGENT_WAITERS_BY_RUN_ID.get(normalizedRunId);
	if (existing) {
		existing.add(waiter);
		return () => removeWaiter(normalizedRunId, waiter);
	}
	AGENT_WAITERS_BY_RUN_ID.set(normalizedRunId, new Set([waiter]));
	return () => removeWaiter(normalizedRunId, waiter);
}
function notifyWaiters(runId) {
	const normalizedRunId = runId.trim();
	if (!normalizedRunId) return;
	const waiters = AGENT_WAITERS_BY_RUN_ID.get(normalizedRunId);
	if (!waiters || waiters.size === 0) return;
	for (const waiter of waiters) waiter();
}
function readTerminalSnapshotFromDedupeEntry(entry) {
	const payload = entry.payload;
	const status = typeof payload?.status === "string" ? payload.status : void 0;
	if (status === "accepted" || status === "started" || status === "in_flight") return null;
	const startedAt = asFiniteNumber(payload?.startedAt);
	const endedAt = asFiniteNumber(payload?.endedAt) ?? entry.ts;
	const errorMessage = typeof payload?.error === "string" ? payload.error : typeof payload?.summary === "string" ? payload.summary : entry.error?.message;
	if (status === "ok" || status === "timeout") return {
		status,
		startedAt,
		endedAt,
		error: status === "timeout" ? errorMessage : void 0
	};
	if (status === "error" || !entry.ok) return {
		status: "error",
		startedAt,
		endedAt,
		error: errorMessage
	};
	return null;
}
function readTerminalSnapshotFromGatewayDedupe(params) {
	if (params.ignoreAgentTerminalSnapshot) {
		const chatEntry = params.dedupe.get(`chat:${params.runId}`);
		if (!chatEntry) return null;
		return readTerminalSnapshotFromDedupeEntry(chatEntry);
	}
	const chatEntry = params.dedupe.get(`chat:${params.runId}`);
	const chatSnapshot = chatEntry ? readTerminalSnapshotFromDedupeEntry(chatEntry) : null;
	const agentEntry = params.dedupe.get(`agent:${params.runId}`);
	const agentSnapshot = agentEntry ? readTerminalSnapshotFromDedupeEntry(agentEntry) : null;
	if (agentEntry) {
		if (!agentSnapshot) {
			if (chatSnapshot && chatEntry && chatEntry.ts > agentEntry.ts) return chatSnapshot;
			return null;
		}
	}
	if (agentSnapshot && chatSnapshot && agentEntry && chatEntry) return chatEntry.ts > agentEntry.ts ? chatSnapshot : agentSnapshot;
	return agentSnapshot ?? chatSnapshot;
}
async function waitForTerminalGatewayDedupe(params) {
	const initial = readTerminalSnapshotFromGatewayDedupe(params);
	if (initial) return initial;
	if (params.timeoutMs <= 0 || params.signal?.aborted) return null;
	return await new Promise((resolve) => {
		let settled = false;
		let timeoutHandle;
		let onAbort;
		let removeWaiter;
		const finish = (snapshot) => {
			if (settled) return;
			settled = true;
			if (timeoutHandle) clearTimeout(timeoutHandle);
			if (onAbort) params.signal?.removeEventListener("abort", onAbort);
			removeWaiter?.();
			resolve(snapshot);
		};
		const onWake = () => {
			const snapshot = readTerminalSnapshotFromGatewayDedupe(params);
			if (snapshot) finish(snapshot);
		};
		removeWaiter = addWaiter(params.runId, onWake);
		onWake();
		if (settled) return;
		const timeoutDelayMs = Math.max(1, Math.min(Math.floor(params.timeoutMs), 2147483647));
		timeoutHandle = setTimeout(() => finish(null), timeoutDelayMs);
		timeoutHandle.unref?.();
		onAbort = () => finish(null);
		params.signal?.addEventListener("abort", onAbort, { once: true });
	});
}
function setGatewayDedupeEntry(params) {
	params.dedupe.set(params.key, params.entry);
	const runId = parseRunIdFromDedupeKey(params.key);
	if (!runId) return;
	if (!readTerminalSnapshotFromDedupeEntry(params.entry)) return;
	notifyWaiters(runId);
}
//#endregion
//#region src/chat/canvas-render.ts
function tryParseJsonRecord(value) {
	if (typeof value !== "string") return;
	try {
		const parsed = JSON.parse(value);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : void 0;
	} catch {
		return;
	}
}
function getRecordStringField(record, key) {
	const value = record?.[key];
	return typeof value === "string" && value.trim() ? value : void 0;
}
function getRecordNumberField(record, key) {
	const value = record?.[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function getNestedRecord(record, key) {
	const value = record?.[key];
	return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function normalizeSurface(value) {
	return value === "assistant_message" ? value : void 0;
}
function normalizePreferredHeight(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 160 ? Math.min(Math.trunc(value), 1200) : void 0;
}
function coerceCanvasPreview(record) {
	if (!record) return;
	if (getRecordStringField(record, "kind")?.trim().toLowerCase() !== "canvas") return;
	const presentation = getNestedRecord(record, "presentation");
	const view = getNestedRecord(record, "view");
	const source = getNestedRecord(record, "source");
	const requestedSurface = getRecordStringField(presentation, "target") ?? getRecordStringField(record, "target");
	const surface = requestedSurface ? normalizeSurface(requestedSurface) : "assistant_message";
	if (!surface) return;
	const title = getRecordStringField(presentation, "title") ?? getRecordStringField(view, "title");
	const preferredHeight = normalizePreferredHeight(getRecordNumberField(presentation, "preferred_height") ?? getRecordNumberField(presentation, "preferredHeight") ?? getRecordNumberField(view, "preferred_height") ?? getRecordNumberField(view, "preferredHeight"));
	const className = getRecordStringField(presentation, "class_name") ?? getRecordStringField(presentation, "className");
	const style = getRecordStringField(presentation, "style");
	const viewUrl = getRecordStringField(view, "url") ?? getRecordStringField(view, "entryUrl");
	const viewId = getRecordStringField(view, "id") ?? getRecordStringField(view, "docId");
	if (viewUrl) return {
		kind: "canvas",
		surface,
		render: "url",
		url: viewUrl,
		...viewId ? { viewId } : {},
		...title ? { title } : {},
		...preferredHeight ? { preferredHeight } : {},
		...className ? { className } : {},
		...style ? { style } : {}
	};
	if (getRecordStringField(source, "type")?.trim().toLowerCase() === "url") {
		const url = getRecordStringField(source, "url");
		if (!url) return;
		return {
			kind: "canvas",
			surface,
			render: "url",
			url,
			...title ? { title } : {},
			...preferredHeight ? { preferredHeight } : {},
			...className ? { className } : {},
			...style ? { style } : {}
		};
	}
}
function extractCanvasFromText(outputText, _toolName) {
	return coerceCanvasPreview(tryParseJsonRecord(outputText));
}
//#endregion
//#region src/gateway/chat-abort.ts
function isChatStopCommandText(text) {
	return isAbortRequestText(text);
}
function resolveChatRunExpiresAtMs(params) {
	const { now, timeoutMs, graceMs = 6e4, minMs = 2 * 6e4, maxMs = 1440 * 6e4 } = params;
	const target = now + Math.max(0, timeoutMs) + graceMs;
	const min = now + minMs;
	const max = now + maxMs;
	return Math.min(max, Math.max(min, target));
}
function broadcastChatAborted(ops, params) {
	const { runId, sessionKey, stopReason, partialText } = params;
	const payload = {
		runId,
		sessionKey,
		seq: (ops.agentRunSeq.get(runId) ?? 0) + 1,
		state: "aborted",
		stopReason,
		message: partialText ? {
			role: "assistant",
			content: [{
				type: "text",
				text: partialText
			}],
			timestamp: Date.now()
		} : void 0
	};
	ops.broadcast("chat", payload);
	ops.nodeSendToSession(sessionKey, "chat", payload);
}
function abortChatRunById(ops, params) {
	const { runId, sessionKey, stopReason } = params;
	const active = ops.chatAbortControllers.get(runId);
	if (!active) return { aborted: false };
	if (active.sessionKey !== sessionKey) return { aborted: false };
	const bufferedText = ops.chatRunBuffers.get(runId);
	const partialText = bufferedText && bufferedText.trim() ? bufferedText : void 0;
	ops.chatAbortedRuns.set(runId, Date.now());
	active.controller.abort();
	ops.chatAbortControllers.delete(runId);
	ops.chatRunBuffers.delete(runId);
	ops.chatDeltaSentAt.delete(runId);
	ops.chatDeltaLastBroadcastLen.delete(runId);
	const removed = ops.removeChatRun(runId, runId, sessionKey);
	broadcastChatAborted(ops, {
		runId,
		sessionKey,
		stopReason,
		partialText
	});
	ops.agentRunSeq.delete(runId);
	if (removed?.clientRunId) ops.agentRunSeq.delete(removed.clientRunId);
	return { aborted: true };
}
//#endregion
//#region src/chat/tool-content.ts
function normalizeToolContentType(value) {
	return typeof value === "string" ? value.toLowerCase() : "";
}
function isToolCallContentType(value) {
	const type = normalizeToolContentType(value);
	return type === "toolcall" || type === "tool_call" || type === "tooluse" || type === "tool_use";
}
function isToolResultContentType(value) {
	const type = normalizeToolContentType(value);
	return type === "toolresult" || type === "tool_result";
}
function isToolCallBlock(block) {
	return isToolCallContentType(block.type);
}
function isToolResultBlock(block) {
	return isToolResultContentType(block.type);
}
function resolveToolUseId(block) {
	return typeof block.id === "string" && block.id.trim() || typeof block.tool_use_id === "string" && block.tool_use_id.trim() || typeof block.toolUseId === "string" && block.toolUseId.trim() || void 0;
}
//#endregion
//#region src/gateway/cli-session-history.claude.ts
const CLAUDE_CLI_PROVIDER = "claude-cli";
const CLAUDE_PROJECTS_RELATIVE_DIR = path.join(".claude", "projects");
function resolveHistoryHomeDir(homeDir) {
	return normalizeOptionalString(homeDir) || process.env.HOME || os.homedir();
}
function resolveClaudeProjectsDir(homeDir) {
	return path.join(resolveHistoryHomeDir(homeDir), CLAUDE_PROJECTS_RELATIVE_DIR);
}
function resolveClaudeCliBindingSessionId(entry) {
	const bindingSessionId = normalizeOptionalString(entry?.cliSessionBindings?.[CLAUDE_CLI_PROVIDER]?.sessionId);
	if (bindingSessionId) return bindingSessionId;
	const legacyMapSessionId = normalizeOptionalString(entry?.cliSessionIds?.[CLAUDE_CLI_PROVIDER]);
	if (legacyMapSessionId) return legacyMapSessionId;
	return normalizeOptionalString(entry?.claudeCliSessionId) || void 0;
}
function resolveFiniteNumber$1(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function resolveTimestampMs(value) {
	if (typeof value !== "string") return;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : void 0;
}
function resolveClaudeCliUsage(raw) {
	if (!raw || typeof raw !== "object") return;
	const input = resolveFiniteNumber$1(raw.input_tokens);
	const output = resolveFiniteNumber$1(raw.output_tokens);
	const cacheRead = resolveFiniteNumber$1(raw.cache_read_input_tokens);
	const cacheWrite = resolveFiniteNumber$1(raw.cache_creation_input_tokens);
	if (input === void 0 && output === void 0 && cacheRead === void 0 && cacheWrite === void 0) return;
	return {
		...input !== void 0 ? { input } : {},
		...output !== void 0 ? { output } : {},
		...cacheRead !== void 0 ? { cacheRead } : {},
		...cacheWrite !== void 0 ? { cacheWrite } : {}
	};
}
function cloneJsonValue(value) {
	return JSON.parse(JSON.stringify(value));
}
function normalizeClaudeCliContent(content, toolNameRegistry) {
	if (!Array.isArray(content)) return cloneJsonValue(content);
	const normalized = [];
	for (const item of content) {
		if (!item || typeof item !== "object") {
			normalized.push(cloneJsonValue(item));
			continue;
		}
		const block = cloneJsonValue(item);
		const type = typeof block.type === "string" ? block.type : "";
		if (type === "tool_use") {
			const id = normalizeOptionalString(block.id) ?? "";
			const name = normalizeOptionalString(block.name) ?? "";
			if (id && name) toolNameRegistry.set(id, name);
			if (block.input !== void 0 && block.arguments === void 0) block.arguments = cloneJsonValue(block.input);
			block.type = "toolcall";
			delete block.input;
			normalized.push(block);
			continue;
		}
		if (type === "tool_result") {
			const toolUseId = resolveToolUseId(block);
			if (!block.name && toolUseId) {
				const toolName = toolNameRegistry.get(toolUseId);
				if (toolName) block.name = toolName;
			}
			normalized.push(block);
			continue;
		}
		normalized.push(block);
	}
	return normalized;
}
function getMessageBlocks(message) {
	if (!message || typeof message !== "object") return null;
	const content = message.content;
	return Array.isArray(content) ? content : null;
}
function isAssistantToolCallMessage(message) {
	if (!message || typeof message !== "object") return false;
	if (message.role !== "assistant") return false;
	const blocks = getMessageBlocks(message);
	return Boolean(blocks && blocks.length > 0 && blocks.every(isToolCallBlock));
}
function isUserToolResultMessage(message) {
	if (!message || typeof message !== "object") return false;
	if (message.role !== "user") return false;
	const blocks = getMessageBlocks(message);
	return Boolean(blocks && blocks.length > 0 && blocks.every(isToolResultBlock));
}
function coalesceClaudeCliToolMessages(messages) {
	const coalesced = [];
	for (let index = 0; index < messages.length; index += 1) {
		const current = messages[index];
		const next = messages[index + 1];
		if (!isAssistantToolCallMessage(current) || !isUserToolResultMessage(next)) {
			coalesced.push(current);
			continue;
		}
		const callBlocks = getMessageBlocks(current) ?? [];
		const resultBlocks = getMessageBlocks(next) ?? [];
		const callIds = new Set(callBlocks.map(resolveToolUseId).filter((id) => Boolean(id)));
		if (!(resultBlocks.length > 0 && resultBlocks.every((block) => {
			const toolUseId = resolveToolUseId(block);
			return Boolean(toolUseId && callIds.has(toolUseId));
		}))) {
			coalesced.push(current);
			continue;
		}
		coalesced.push({
			...current,
			content: [...callBlocks.map(cloneJsonValue), ...resultBlocks.map(cloneJsonValue)]
		});
		index += 1;
	}
	return coalesced;
}
function parseClaudeCliHistoryEntry(entry, cliSessionId, toolNameRegistry) {
	if (entry.isSidechain === true || !entry.message || typeof entry.message !== "object") return null;
	const type = typeof entry.type === "string" ? entry.type : void 0;
	const role = typeof entry.message.role === "string" ? entry.message.role : void 0;
	if (type !== "user" && type !== "assistant" || role !== type) return null;
	const timestamp = resolveTimestampMs(entry.timestamp);
	const baseMeta = {
		importedFrom: CLAUDE_CLI_PROVIDER,
		cliSessionId,
		...normalizeOptionalString(entry.uuid) ? { externalId: entry.uuid } : {}
	};
	const content = typeof entry.message.content === "string" || Array.isArray(entry.message.content) ? normalizeClaudeCliContent(entry.message.content, toolNameRegistry) : void 0;
	if (content === void 0) return null;
	if (type === "user") return attachOpenClawTranscriptMeta({
		role: "user",
		content,
		...timestamp !== void 0 ? { timestamp } : {}
	}, baseMeta);
	return attachOpenClawTranscriptMeta({
		role: "assistant",
		content,
		api: "anthropic-messages",
		provider: CLAUDE_CLI_PROVIDER,
		...normalizeOptionalString(entry.message.model) ? { model: entry.message.model } : {},
		...normalizeOptionalString(entry.message.stop_reason) ? { stopReason: entry.message.stop_reason } : {},
		...resolveClaudeCliUsage(entry.message.usage) ? { usage: resolveClaudeCliUsage(entry.message.usage) } : {},
		...timestamp !== void 0 ? { timestamp } : {}
	}, baseMeta);
}
function resolveClaudeCliSessionFilePath(params) {
	const projectsDir = resolveClaudeProjectsDir(params.homeDir);
	let projectEntries;
	try {
		projectEntries = fs.readdirSync(projectsDir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of projectEntries) {
		if (!entry.isDirectory()) continue;
		const candidate = path.join(projectsDir, entry.name, `${params.cliSessionId}.jsonl`);
		if (fs.existsSync(candidate)) return candidate;
	}
}
function readClaudeCliSessionMessages(params) {
	const filePath = resolveClaudeCliSessionFilePath(params);
	if (!filePath) return [];
	let content;
	try {
		content = fs.readFileSync(filePath, "utf-8");
	} catch {
		return [];
	}
	const messages = [];
	const toolNameRegistry = /* @__PURE__ */ new Map();
	for (const line of content.split(/\r?\n/)) {
		if (!line.trim()) continue;
		try {
			const message = parseClaudeCliHistoryEntry(JSON.parse(line), params.cliSessionId, toolNameRegistry);
			if (message) messages.push(message);
		} catch {}
	}
	return coalesceClaudeCliToolMessages(messages);
}
//#endregion
//#region src/gateway/cli-session-history.merge.ts
const DEDUPE_TIMESTAMP_WINDOW_MS = 300 * 1e3;
function extractComparableText(message) {
	if (!message || typeof message !== "object") return;
	const record = message;
	const role = readStringValue(record.role);
	const parts = [];
	const text = readStringValue(record.text);
	if (text !== void 0) parts.push(text);
	const content = readStringValue(record.content);
	if (content !== void 0) parts.push(content);
	else if (Array.isArray(record.content)) {
		for (const block of record.content) if (block && typeof block === "object" && "text" in block) {
			const blockText = readStringValue(block.text);
			if (blockText !== void 0) parts.push(blockText);
		}
	}
	if (parts.length === 0) return;
	const joined = parts.join("\n").trim();
	if (!joined) return;
	return (role === "user" ? stripInboundMetadata(joined) : joined).replace(/\s+/g, " ").trim() || void 0;
}
function resolveFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function resolveComparableTimestamp(message) {
	if (!message || typeof message !== "object") return;
	return resolveFiniteNumber(message.timestamp);
}
function resolveComparableRole(message) {
	if (!message || typeof message !== "object") return;
	return readStringValue(message.role);
}
function resolveImportedExternalId(message) {
	if (!message || typeof message !== "object") return;
	return normalizeOptionalString(("__openclaw" in message && message.__openclaw && typeof message.__openclaw === "object" ? message.__openclaw ?? {} : void 0)?.externalId);
}
function isEquivalentImportedMessage(existing, imported) {
	const importedExternalId = resolveImportedExternalId(imported);
	if (importedExternalId && resolveImportedExternalId(existing) === importedExternalId) return true;
	const existingRole = resolveComparableRole(existing);
	const importedRole = resolveComparableRole(imported);
	if (!existingRole || existingRole !== importedRole) return false;
	const existingText = extractComparableText(existing);
	const importedText = extractComparableText(imported);
	if (!existingText || !importedText || existingText !== importedText) return false;
	const existingTimestamp = resolveComparableTimestamp(existing);
	const importedTimestamp = resolveComparableTimestamp(imported);
	if (existingTimestamp === void 0 || importedTimestamp === void 0) return true;
	return Math.abs(existingTimestamp - importedTimestamp) <= DEDUPE_TIMESTAMP_WINDOW_MS;
}
function compareHistoryMessages(a, b) {
	const aTimestamp = resolveComparableTimestamp(a.message);
	const bTimestamp = resolveComparableTimestamp(b.message);
	if (aTimestamp !== void 0 && bTimestamp !== void 0 && aTimestamp !== bTimestamp) return aTimestamp - bTimestamp;
	if (aTimestamp !== void 0 && bTimestamp === void 0) return -1;
	if (aTimestamp === void 0 && bTimestamp !== void 0) return 1;
	return a.order - b.order;
}
function mergeImportedChatHistoryMessages(params) {
	if (params.importedMessages.length === 0) return params.localMessages;
	const merged = params.localMessages.map((message, index) => ({
		message,
		order: index
	}));
	let nextOrder = merged.length;
	for (const imported of params.importedMessages) {
		if (merged.some((existing) => isEquivalentImportedMessage(existing.message, imported))) continue;
		merged.push({
			message: imported,
			order: nextOrder
		});
		nextOrder += 1;
	}
	merged.sort(compareHistoryMessages);
	return merged.map((entry) => entry.message);
}
//#endregion
//#region src/gateway/cli-session-history.ts
function augmentChatHistoryWithCliSessionImports(params) {
	const cliSessionId = resolveClaudeCliBindingSessionId(params.entry);
	if (!cliSessionId) return params.localMessages;
	const normalizedProvider = normalizeProviderId(params.provider ?? "");
	if (normalizedProvider && normalizedProvider !== "claude-cli" && params.localMessages.length > 0) return params.localMessages;
	const importedMessages = readClaudeCliSessionMessages({
		cliSessionId,
		homeDir: params.homeDir
	});
	return mergeImportedChatHistoryMessages({
		localMessages: params.localMessages,
		importedMessages
	});
}
//#endregion
//#region src/gateway/control-reply-text.ts
const SUPPRESSED_CONTROL_REPLY_TOKENS = [
	SILENT_REPLY_TOKEN,
	"ANNOUNCE_SKIP",
	"REPLY_SKIP"
];
const MIN_BARE_PREFIX_LENGTH_BY_TOKEN = {
	[SILENT_REPLY_TOKEN]: 2,
	ANNOUNCE_SKIP: 3,
	REPLY_SKIP: 3
};
function normalizeSuppressedControlReplyFragment(text) {
	const trimmed = text.trim();
	if (!trimmed) return "";
	const normalized = trimmed.toUpperCase();
	if (/[^A-Z_]/.test(normalized)) return "";
	return normalized;
}
/**
* Return true when a chat-visible reply is exactly an internal control token.
*/
function isSuppressedControlReplyText(text) {
	const normalized = text.trim();
	return SUPPRESSED_CONTROL_REPLY_TOKENS.some((token) => isSilentReplyText(normalized, token));
}
/**
* Return true when streamed assistant text looks like the leading fragment of a control token.
*/
function isSuppressedControlReplyLeadFragment(text) {
	const trimmed = text.trim();
	const normalized = normalizeSuppressedControlReplyFragment(text);
	if (!normalized) return false;
	return SUPPRESSED_CONTROL_REPLY_TOKENS.some((token) => {
		const tokenUpper = token.toUpperCase();
		if (normalized === tokenUpper) return false;
		if (!tokenUpper.startsWith(normalized)) return false;
		if (normalized.includes("_")) return true;
		if (token !== "NO_REPLY" && trimmed !== trimmed.toUpperCase()) return false;
		return normalized.length >= MIN_BARE_PREFIX_LENGTH_BY_TOKEN[token];
	});
}
//#endregion
//#region src/gateway/server-constants.ts
const MAX_PAYLOAD_BYTES = 25 * 1024 * 1024;
const MAX_BUFFERED_BYTES = 50 * 1024 * 1024;
const MAX_PREAUTH_PAYLOAD_BYTES = 64 * 1024;
let maxChatHistoryMessagesBytes = 6 * 1024 * 1024;
const getMaxChatHistoryMessagesBytes = () => maxChatHistoryMessagesBytes;
const TICK_INTERVAL_MS = 3e4;
const HEALTH_REFRESH_INTERVAL_MS = 6e4;
const DEDUPE_TTL_MS = 5 * 6e4;
const DEDUPE_MAX = 1e3;
//#endregion
//#region src/gateway/server-methods/chat-transcript-inject.ts
function resolveInjectedAssistantContent(params) {
	const labelPrefix = params.label ? `[${params.label}]\n\n` : "";
	if (params.content && params.content.length > 0) {
		if (!labelPrefix) return params.content;
		const first = params.content[0];
		if (first && typeof first === "object" && first.type === "text" && typeof first.text === "string") return [{
			...first,
			text: `${labelPrefix}${first.text}`
		}, ...params.content.slice(1)];
		return [{
			type: "text",
			text: labelPrefix.trim()
		}, ...params.content];
	}
	return [{
		type: "text",
		text: `${labelPrefix}${params.message}`
	}];
}
function appendInjectedAssistantMessageToTranscript(params) {
	const now = params.now ?? Date.now();
	const messageBody = {
		role: "assistant",
		content: resolveInjectedAssistantContent({
			message: params.message,
			label: params.label,
			content: params.content
		}),
		timestamp: now,
		stopReason: "stop",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				total: 0
			}
		},
		api: "openai-responses",
		provider: "openclaw",
		model: "gateway-injected",
		...params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {},
		...params.abortMeta ? { openclawAbort: {
			aborted: true,
			origin: params.abortMeta.origin,
			runId: params.abortMeta.runId
		} } : {}
	};
	try {
		const messageId = SessionManager.open(params.transcriptPath).appendMessage(messageBody);
		emitSessionTranscriptUpdate({
			sessionFile: params.transcriptPath,
			message: messageBody,
			messageId
		});
		return {
			ok: true,
			messageId,
			message: messageBody
		};
	} catch (err) {
		return {
			ok: false,
			error: formatErrorMessage(err)
		};
	}
}
//#endregion
//#region src/gateway/server-methods/chat-webchat-media.ts
/** Cap embedded audio size to avoid multi‑MB payloads on the chat WebSocket. */
const MAX_WEBCHAT_AUDIO_BYTES = 15 * 1024 * 1024;
const MIME_BY_EXT = {
	".aac": "audio/aac",
	".m4a": "audio/mp4",
	".mp3": "audio/mpeg",
	".oga": "audio/ogg",
	".ogg": "audio/ogg",
	".opus": "audio/opus",
	".wav": "audio/wav",
	".webm": "audio/webm"
};
/** Map `mediaUrl` strings to an absolute filesystem path for local embedding (plain paths or `file:` URLs). */
function resolveLocalMediaPathForEmbedding(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	if (/^data:/i.test(trimmed)) return null;
	if (/^https?:/i.test(trimmed)) return null;
	if (trimmed.startsWith("file:")) try {
		const p = safeFileURLToPath(trimmed);
		if (!path.isAbsolute(p)) return null;
		return p;
	} catch {
		return null;
	}
	if (!path.isAbsolute(trimmed)) return null;
	try {
		assertNoWindowsNetworkPath(trimmed, "Local media path");
	} catch {
		return null;
	}
	return trimmed;
}
/** Returns a readable local file path when it is a regular file and within the size cap (single stat before read). */
async function resolveLocalAudioFileForEmbedding(raw, options) {
	const resolved = resolveLocalMediaPathForEmbedding(raw);
	if (!resolved) return null;
	if (!isAudioFileName(resolved)) return null;
	try {
		await assertLocalMediaAllowed(resolved, options?.localRoots);
		const st = fs.statSync(resolved);
		if (!st.isFile() || st.size > MAX_WEBCHAT_AUDIO_BYTES) return null;
		return resolved;
	} catch (err) {
		if (err instanceof LocalMediaAccessError) options?.onLocalAudioAccessDenied?.(err);
		return null;
	}
}
function mimeTypeForPath(filePath) {
	return MIME_BY_EXT[normalizeLowercaseStringOrEmpty(path.extname(filePath))] ?? "audio/mpeg";
}
/**
* Build Control UI / transcript `content` blocks for local TTS (or other) audio files
* referenced by slash-command / agent replies when the webchat path only had text aggregation.
*/
async function buildWebchatAudioContentBlocksFromReplyPayloads(payloads, options) {
	const seen = /* @__PURE__ */ new Set();
	const blocks = [];
	for (const payload of payloads) {
		const parts = resolveSendableOutboundReplyParts(payload);
		for (const raw of parts.mediaUrls) {
			const url = raw.trim();
			if (!url) continue;
			const resolved = await resolveLocalAudioFileForEmbedding(url, options);
			if (!resolved || seen.has(resolved)) continue;
			seen.add(resolved);
			const block = tryReadLocalAudioContentBlock(resolved);
			if (block) blocks.push(block);
		}
	}
	return blocks;
}
function tryReadLocalAudioContentBlock(filePath) {
	try {
		const buf = fs.readFileSync(filePath);
		if (buf.length > MAX_WEBCHAT_AUDIO_BYTES) return null;
		return {
			type: "audio",
			source: {
				type: "base64",
				media_type: mimeTypeForPath(filePath),
				data: buf.toString("base64")
			}
		};
	} catch {
		return null;
	}
}
//#endregion
//#region src/gateway/server-methods/chat.ts
/** True when a reply payload carries at least one media reference (mediaUrl or mediaUrls). */
function isMediaBearingPayload(payload) {
	if (payload.mediaUrl?.trim()) return true;
	if (payload.mediaUrls?.some((url) => url.trim())) return true;
	return false;
}
async function buildWebchatAudioOnlyAssistantMessage(payloads, options) {
	const audioBlocks = await buildWebchatAudioContentBlocksFromReplyPayloads(payloads, {
		localRoots: options?.localRoots,
		onLocalAudioAccessDenied: (err) => {
			options?.onLocalAudioAccessDenied?.(formatForLog(err));
		}
	});
	if (audioBlocks.length === 0) return null;
	return {
		transcriptText: "Audio reply",
		content: [{
			type: "text",
			text: "Audio reply"
		}, ...audioBlocks]
	};
}
const DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS = 8e3;
const CHAT_HISTORY_MAX_SINGLE_MESSAGE_BYTES = 128 * 1024;
const CHAT_HISTORY_OVERSIZED_PLACEHOLDER = "[chat.history omitted: message too large]";
let chatHistoryPlaceholderEmitCount = 0;
const CHANNEL_AGNOSTIC_SESSION_SCOPES = new Set([
	"main",
	"direct",
	"dm",
	"group",
	"channel",
	"cron",
	"run",
	"subagent",
	"acp",
	"thread",
	"topic"
]);
const CHANNEL_SCOPED_SESSION_SHAPES = new Set([
	"direct",
	"dm",
	"group",
	"channel"
]);
function resolveEffectiveChatHistoryMaxChars(cfg, maxChars) {
	if (typeof maxChars === "number") return maxChars;
	if (typeof cfg.gateway?.webchat?.chatHistoryMaxChars === "number") return cfg.gateway.webchat.chatHistoryMaxChars;
	return DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS;
}
function buildTranscriptReplyText(payloads) {
	return payloads.map((payload) => {
		const parts = resolveSendableOutboundReplyParts(payload);
		const lines = [];
		if (typeof payload.replyToId === "string" && payload.replyToId.trim()) lines.push(`[[reply_to:${payload.replyToId.trim()}]]`);
		else if (payload.replyToCurrent) lines.push("[[reply_to_current]]");
		const text = payload.text?.trim();
		if (text && !isSuppressedControlReplyText(text)) lines.push(text);
		for (const mediaUrl of parts.mediaUrls) {
			const trimmed = mediaUrl.trim();
			if (trimmed) lines.push(`MEDIA:${trimmed}`);
		}
		if (payload.audioAsVoice && parts.mediaUrls.some((mediaUrl) => isAudioFileName(mediaUrl))) lines.push("[[audio_as_voice]]");
		return lines.join("\n").trim();
	}).filter(Boolean).join("\n\n").trim();
}
function resolveChatSendOriginatingRoute(params) {
	if (params.explicitOrigin?.originatingChannel && params.explicitOrigin.originatingTo) return {
		originatingChannel: params.explicitOrigin.originatingChannel,
		originatingTo: params.explicitOrigin.originatingTo,
		...params.explicitOrigin.accountId ? { accountId: params.explicitOrigin.accountId } : {},
		...params.explicitOrigin.messageThreadId ? { messageThreadId: params.explicitOrigin.messageThreadId } : {},
		explicitDeliverRoute: params.deliver === true
	};
	if (!(params.deliver === true)) return {
		originatingChannel: INTERNAL_MESSAGE_CHANNEL,
		explicitDeliverRoute: false
	};
	const routeChannelCandidate = normalizeMessageChannel(params.entry?.deliveryContext?.channel ?? params.entry?.lastChannel ?? params.entry?.origin?.provider);
	const routeToCandidate = params.entry?.deliveryContext?.to ?? params.entry?.lastTo;
	const routeAccountIdCandidate = params.entry?.deliveryContext?.accountId ?? params.entry?.lastAccountId ?? params.entry?.origin?.accountId ?? void 0;
	const routeThreadIdCandidate = params.entry?.deliveryContext?.threadId ?? params.entry?.lastThreadId ?? params.entry?.origin?.threadId;
	if (params.sessionKey.length > 512) return {
		originatingChannel: INTERNAL_MESSAGE_CHANNEL,
		explicitDeliverRoute: false
	};
	const sessionScopeParts = (parseAgentSessionKey(params.sessionKey)?.rest ?? params.sessionKey).split(":", 3).filter(Boolean);
	const sessionScopeHead = sessionScopeParts[0];
	const sessionChannelHint = normalizeMessageChannel(sessionScopeHead);
	const normalizedSessionScopeHead = (sessionScopeHead ?? "").trim().toLowerCase();
	const sessionPeerShapeCandidates = [sessionScopeParts[1], sessionScopeParts[2]].map((part) => (part ?? "").trim().toLowerCase()).filter(Boolean);
	const isChannelAgnosticSessionScope = CHANNEL_AGNOSTIC_SESSION_SCOPES.has(normalizedSessionScopeHead);
	const isChannelScopedSession = sessionPeerShapeCandidates.some((part) => CHANNEL_SCOPED_SESSION_SHAPES.has(part));
	const hasLegacyChannelPeerShape = !isChannelScopedSession && typeof sessionScopeParts[1] === "string" && sessionChannelHint === routeChannelCandidate;
	const isFromWebchatClient = isWebchatClient(params.client);
	const isFromGatewayCliClient = isGatewayCliClient(params.client);
	const hasClientMetadata = typeof params.client?.mode === "string" && params.client.mode.trim().length > 0 || typeof params.client?.id === "string" && params.client.id.trim().length > 0;
	const configuredMainKey = (params.mainKey ?? "main").trim().toLowerCase();
	const canInheritConfiguredMainRoute = normalizedSessionScopeHead.length > 0 && normalizedSessionScopeHead === configuredMainKey && params.hasConnectedClient && (isFromGatewayCliClient || !hasClientMetadata);
	if (!(Boolean(!isFromWebchatClient && sessionChannelHint && sessionChannelHint !== "webchat" && (!isChannelAgnosticSessionScope && (isChannelScopedSession || hasLegacyChannelPeerShape) || canInheritConfiguredMainRoute)) && routeChannelCandidate && routeChannelCandidate !== "webchat" && typeof routeToCandidate === "string" && routeToCandidate.trim().length > 0)) return {
		originatingChannel: INTERNAL_MESSAGE_CHANNEL,
		explicitDeliverRoute: false
	};
	return {
		originatingChannel: routeChannelCandidate,
		originatingTo: routeToCandidate,
		accountId: routeAccountIdCandidate,
		messageThreadId: routeThreadIdCandidate,
		explicitDeliverRoute: true
	};
}
function stripDisallowedChatControlChars(message) {
	let output = "";
	for (const char of message) {
		const code = char.charCodeAt(0);
		if (code === 9 || code === 10 || code === 13 || code >= 32 && code !== 127) output += char;
	}
	return output;
}
function sanitizeChatSendMessageInput(message) {
	const normalized = message.normalize("NFC");
	if (normalized.includes("\0")) return {
		ok: false,
		error: "message must not contain null bytes"
	};
	return {
		ok: true,
		message: stripDisallowedChatControlChars(normalized)
	};
}
function normalizeOptionalChatSystemReceipt(value) {
	if (value == null) return { ok: true };
	if (typeof value !== "string") return {
		ok: false,
		error: "systemProvenanceReceipt must be a string"
	};
	const sanitized = sanitizeChatSendMessageInput(value);
	if (!sanitized.ok) return sanitized;
	return {
		ok: true,
		receipt: sanitized.message.trim() || void 0
	};
}
function isAcpBridgeClient(client) {
	const info = client?.connect?.client;
	return info?.id === GATEWAY_CLIENT_NAMES.CLI && info?.mode === GATEWAY_CLIENT_MODES.CLI && info?.displayName === "ACP" && info?.version === "acp";
}
function canInjectSystemProvenance(client) {
	return (Array.isArray(client?.connect?.scopes) ? client.connect.scopes : []).includes(ADMIN_SCOPE);
}
async function persistChatSendImages(params) {
	if (params.images.length === 0 && params.offloadedRefs.length === 0 || isAcpBridgeClient(params.client)) return [];
	const inlineSaved = [];
	for (const img of params.images) try {
		inlineSaved.push(await saveMediaBuffer(Buffer.from(img.data, "base64"), img.mimeType, "inbound"));
	} catch (err) {
		params.logGateway.warn(`chat.send: failed to persist inbound image (${img.mimeType}): ${formatForLog(err)}`);
	}
	const offloadedSaved = params.offloadedRefs.map((ref) => ({
		id: ref.id,
		path: ref.path,
		size: 0,
		contentType: ref.mimeType
	}));
	if (params.imageOrder.length === 0) return [...inlineSaved, ...offloadedSaved];
	const saved = [];
	let inlineIndex = 0;
	let offloadedIndex = 0;
	for (const entry of params.imageOrder) {
		if (entry === "inline") {
			const inline = inlineSaved[inlineIndex++];
			if (inline) saved.push(inline);
			continue;
		}
		const offloaded = offloadedSaved[offloadedIndex++];
		if (offloaded) saved.push(offloaded);
	}
	for (; inlineIndex < inlineSaved.length; inlineIndex++) {
		const inline = inlineSaved[inlineIndex];
		if (inline) saved.push(inline);
	}
	for (; offloadedIndex < offloadedSaved.length; offloadedIndex++) {
		const offloaded = offloadedSaved[offloadedIndex];
		if (offloaded) saved.push(offloaded);
	}
	return saved;
}
function buildChatSendTranscriptMessage(params) {
	const mediaFields = resolveChatSendTranscriptMediaFields(params.savedImages);
	return {
		role: "user",
		content: params.message,
		timestamp: params.timestamp,
		...mediaFields
	};
}
function resolveChatSendTranscriptMediaFields(savedImages) {
	const mediaPaths = savedImages.map((entry) => entry.path);
	if (mediaPaths.length === 0) return {};
	const mediaTypes = savedImages.map((entry) => entry.contentType ?? "application/octet-stream");
	return {
		MediaPath: mediaPaths[0],
		MediaPaths: mediaPaths,
		MediaType: mediaTypes[0],
		MediaTypes: mediaTypes
	};
}
function extractTranscriptUserText(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return;
	const textBlocks = content.map((block) => block && typeof block === "object" && "text" in block ? block.text : void 0).filter((text) => typeof text === "string");
	return textBlocks.length > 0 ? textBlocks.join("") : void 0;
}
async function rewriteChatSendUserTurnMediaPaths(params) {
	const mediaFields = resolveChatSendTranscriptMediaFields(params.savedImages);
	if (!("MediaPath" in mediaFields)) return;
	const target = [...SessionManager.open(params.transcriptPath).getBranch()].toReversed().find((entry) => {
		if (entry.type !== "message" || entry.message.role !== "user") return false;
		const existingPaths = Array.isArray(entry.message.MediaPaths) ? entry.message.MediaPaths : void 0;
		if (typeof entry.message.MediaPath === "string" && entry.message.MediaPath || existingPaths && existingPaths.length > 0) return false;
		return extractTranscriptUserText(entry.message.content) === params.message;
	});
	if (!target || target.type !== "message") return;
	const rewrittenMessage = {
		...target.message,
		...mediaFields
	};
	await rewriteTranscriptEntriesInSessionFile({
		sessionFile: params.transcriptPath,
		sessionKey: params.sessionKey,
		request: { replacements: [{
			entryId: target.id,
			message: rewrittenMessage
		}] }
	});
}
function truncateChatHistoryText(text, maxChars = DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS) {
	if (text.length <= maxChars) return {
		text,
		truncated: false
	};
	return {
		text: `${text.slice(0, maxChars)}\n...(truncated)...`,
		truncated: true
	};
}
function isToolHistoryBlockType(type) {
	if (typeof type !== "string") return false;
	const normalized = type.trim().toLowerCase();
	return normalized === "toolcall" || normalized === "tool_call" || normalized === "tooluse" || normalized === "tool_use" || normalized === "toolresult" || normalized === "tool_result";
}
function extractChatHistoryBlockText(message) {
	if (!message || typeof message !== "object") return;
	const entry = message;
	if (typeof entry.content === "string") return entry.content;
	if (typeof entry.text === "string") return entry.text;
	if (!Array.isArray(entry.content)) return;
	const textParts = entry.content.map((block) => {
		if (!block || typeof block !== "object") return;
		const typed = block;
		return typeof typed.text === "string" ? typed.text : void 0;
	}).filter((value) => typeof value === "string");
	return textParts.length > 0 ? textParts.join("\n") : void 0;
}
function sanitizeChatHistoryContentBlock(block, opts) {
	if (!block || typeof block !== "object") return {
		block,
		changed: false
	};
	const entry = { ...block };
	let changed = false;
	const preserveExactToolPayload = opts?.preserveExactToolPayload === true || isToolHistoryBlockType(entry.type);
	const maxChars = opts?.maxChars ?? 8e3;
	if (typeof entry.text === "string") {
		const stripped = stripInlineDirectiveTagsForDisplay(entry.text);
		if (preserveExactToolPayload) {
			entry.text = stripped.text;
			changed ||= stripped.changed;
		} else {
			const res = truncateChatHistoryText(stripped.text, maxChars);
			entry.text = res.text;
			changed ||= stripped.changed || res.truncated;
		}
	}
	if (typeof entry.content === "string") {
		const stripped = stripInlineDirectiveTagsForDisplay(entry.content);
		if (preserveExactToolPayload) {
			entry.content = stripped.text;
			changed ||= stripped.changed;
		} else {
			const res = truncateChatHistoryText(stripped.text, maxChars);
			entry.content = res.text;
			changed ||= stripped.changed || res.truncated;
		}
	}
	if (typeof entry.partialJson === "string") {
		if (!preserveExactToolPayload) {
			const res = truncateChatHistoryText(entry.partialJson, maxChars);
			entry.partialJson = res.text;
			changed ||= res.truncated;
		}
	}
	if (typeof entry.arguments === "string") {
		if (!preserveExactToolPayload) {
			const res = truncateChatHistoryText(entry.arguments, maxChars);
			entry.arguments = res.text;
			changed ||= res.truncated;
		}
	}
	if (typeof entry.thinking === "string") {
		const res = truncateChatHistoryText(entry.thinking, maxChars);
		entry.thinking = res.text;
		changed ||= res.truncated;
	}
	if ("thinkingSignature" in entry) {
		delete entry.thinkingSignature;
		changed = true;
	}
	if ((typeof entry.type === "string" ? entry.type : "") === "image" && typeof entry.data === "string") {
		const bytes = Buffer.byteLength(entry.data, "utf8");
		delete entry.data;
		entry.omitted = true;
		entry.bytes = bytes;
		changed = true;
	}
	return {
		block: changed ? entry : block,
		changed
	};
}
function sanitizeAssistantPhasedContentBlocks(content) {
	if (!content.some((block) => {
		if (!block || typeof block !== "object") return false;
		const entry = block;
		return entry.type === "text" && Boolean(parseAssistantTextSignature(entry.textSignature)?.phase);
	})) return {
		content,
		changed: false
	};
	const filtered = content.filter((block) => {
		if (!block || typeof block !== "object") return true;
		const entry = block;
		if (entry.type !== "text") return true;
		return parseAssistantTextSignature(entry.textSignature)?.phase === "final_answer";
	});
	return {
		content: filtered,
		changed: filtered.length !== content.length
	};
}
/**
* Validate that a value is a finite number, returning undefined otherwise.
*/
function toFiniteNumber(x) {
	return typeof x === "number" && Number.isFinite(x) ? x : void 0;
}
/**
* Sanitize usage metadata to ensure only finite numeric fields are included.
* Prevents UI crashes from malformed transcript JSON.
*/
function sanitizeUsage(raw) {
	if (!raw || typeof raw !== "object") return;
	const u = raw;
	const out = {};
	for (const k of [
		"input",
		"output",
		"totalTokens",
		"inputTokens",
		"outputTokens",
		"cacheRead",
		"cacheWrite",
		"cache_read_input_tokens",
		"cache_creation_input_tokens"
	]) {
		const n = toFiniteNumber(u[k]);
		if (n !== void 0) out[k] = n;
	}
	if ("cost" in u && u.cost != null && typeof u.cost === "object") {
		const sanitizedCost = sanitizeCost(u.cost);
		if (sanitizedCost) out.cost = sanitizedCost;
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
/**
* Sanitize cost metadata to ensure only finite numeric fields are included.
* Prevents UI crashes from calling .toFixed() on non-numbers.
*/
function sanitizeCost(raw) {
	if (!raw || typeof raw !== "object") return;
	const total = toFiniteNumber(raw.total);
	return total !== void 0 ? { total } : void 0;
}
function sanitizeChatHistoryMessage(message, maxChars = DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS) {
	if (!message || typeof message !== "object") return {
		message,
		changed: false
	};
	const entry = { ...message };
	let changed = false;
	const role = typeof entry.role === "string" ? entry.role.toLowerCase() : "";
	const preserveExactToolPayload = role === "toolresult" || role === "tool_result" || role === "tool" || role === "function" || typeof entry.toolName === "string" || typeof entry.tool_name === "string" || typeof entry.toolCallId === "string" || typeof entry.tool_call_id === "string";
	if ("details" in entry) {
		delete entry.details;
		changed = true;
	}
	if (entry.role !== "assistant") {
		if ("usage" in entry) {
			delete entry.usage;
			changed = true;
		}
		if ("cost" in entry) {
			delete entry.cost;
			changed = true;
		}
	} else {
		if ("usage" in entry) {
			const sanitized = sanitizeUsage(entry.usage);
			if (sanitized) entry.usage = sanitized;
			else delete entry.usage;
			changed = true;
		}
		if ("cost" in entry) {
			const sanitized = sanitizeCost(entry.cost);
			if (sanitized) entry.cost = sanitized;
			else delete entry.cost;
			changed = true;
		}
	}
	if (typeof entry.content === "string") {
		const stripped = stripInlineDirectiveTagsForDisplay(entry.content);
		if (preserveExactToolPayload) {
			entry.content = stripped.text;
			changed ||= stripped.changed;
		} else {
			const res = truncateChatHistoryText(stripped.text, maxChars);
			entry.content = res.text;
			changed ||= stripped.changed || res.truncated;
		}
	} else if (Array.isArray(entry.content)) {
		const updated = entry.content.map((block) => sanitizeChatHistoryContentBlock(block, {
			preserveExactToolPayload,
			maxChars
		}));
		if (updated.some((item) => item.changed)) {
			entry.content = updated.map((item) => item.block);
			changed = true;
		}
		if (entry.role === "assistant" && Array.isArray(entry.content)) {
			const sanitizedPhases = sanitizeAssistantPhasedContentBlocks(entry.content);
			if (sanitizedPhases.changed) {
				entry.content = sanitizedPhases.content;
				changed = true;
			}
		}
	}
	if (typeof entry.text === "string") {
		const stripped = stripInlineDirectiveTagsForDisplay(entry.text);
		if (preserveExactToolPayload) {
			entry.text = stripped.text;
			changed ||= stripped.changed;
		} else {
			const res = truncateChatHistoryText(stripped.text, maxChars);
			entry.text = res.text;
			changed ||= stripped.changed || res.truncated;
		}
	}
	return {
		message: changed ? entry : message,
		changed
	};
}
/**
* Extract the visible text from an assistant history message for silent-token checks.
* Returns `undefined` for non-assistant messages or messages with no extractable text.
* When `entry.text` is present it takes precedence over `entry.content` to avoid
* dropping messages that carry real text alongside a stale `content: "NO_REPLY"`.
*/
function extractAssistantTextForSilentCheck(message) {
	if (!message || typeof message !== "object") return;
	const entry = message;
	if (entry.role !== "assistant") return;
	if (typeof entry.text === "string") return entry.text;
	if (typeof entry.content === "string") return entry.content;
	if (!Array.isArray(entry.content) || entry.content.length === 0) return;
	const texts = [];
	for (const block of entry.content) {
		if (!block || typeof block !== "object") return;
		const typed = block;
		if (typed.type !== "text" || typeof typed.text !== "string") return;
		texts.push(typed.text);
	}
	return texts.length > 0 ? texts.join("\n") : void 0;
}
function hasAssistantNonTextContent(message) {
	if (!message || typeof message !== "object") return false;
	const content = message.content;
	if (!Array.isArray(content)) return false;
	return content.some((block) => block && typeof block === "object" && block.type !== "text");
}
function shouldDropAssistantHistoryMessage(message) {
	if (!message || typeof message !== "object") return false;
	if (message.role !== "assistant") return false;
	if (resolveAssistantMessagePhase(message) === "commentary") return true;
	const text = extractAssistantTextForSilentCheck(message);
	if (text === void 0 || !isSuppressedControlReplyText(text)) return false;
	return !hasAssistantNonTextContent(message);
}
function sanitizeChatHistoryMessages(messages, maxChars = DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS) {
	if (messages.length === 0) return messages;
	let changed = false;
	const next = [];
	for (const message of messages) {
		if (shouldDropAssistantHistoryMessage(message)) {
			changed = true;
			continue;
		}
		const res = sanitizeChatHistoryMessage(message, maxChars);
		changed ||= res.changed;
		if (shouldDropAssistantHistoryMessage(res.message)) {
			changed = true;
			continue;
		}
		next.push(res.message);
	}
	return changed ? next : messages;
}
function appendCanvasBlockToAssistantHistoryMessage(params) {
	const preview = params.preview;
	if (!preview || !params.message || typeof params.message !== "object") return params.message;
	const entry = params.message;
	const baseContent = Array.isArray(entry.content) ? [...entry.content] : typeof entry.content === "string" ? [{
		type: "text",
		text: entry.content
	}] : typeof entry.text === "string" ? [{
		type: "text",
		text: entry.text
	}] : [];
	if (!baseContent.some((block) => {
		if (!block || typeof block !== "object") return false;
		const typed = block;
		return typed.type === "canvas" && typed.preview && typeof typed.preview === "object" && (typed.preview.viewId && typed.preview.viewId === preview.viewId || typed.preview.url && typed.preview.url === preview.url);
	})) baseContent.push({
		type: "canvas",
		preview,
		rawText: params.rawText
	});
	return {
		...entry,
		content: baseContent
	};
}
function messageContainsToolHistoryContent(message) {
	if (!message || typeof message !== "object") return false;
	const entry = message;
	if (typeof entry.toolCallId === "string" || typeof entry.tool_call_id === "string" || typeof entry.toolName === "string" || typeof entry.tool_name === "string") return true;
	if (!Array.isArray(entry.content)) return false;
	return entry.content.some((block) => {
		if (!block || typeof block !== "object") return false;
		return isToolHistoryBlockType(block.type);
	});
}
function augmentChatHistoryWithCanvasBlocks(messages) {
	if (messages.length === 0) return messages;
	const next = [...messages];
	let changed = false;
	let lastAssistantIndex = -1;
	let lastRenderableAssistantIndex = -1;
	const pending = [];
	for (let index = 0; index < next.length; index++) {
		const message = next[index];
		if (!message || typeof message !== "object") continue;
		const entry = message;
		if ((typeof entry.role === "string" ? entry.role.toLowerCase() : "") === "assistant") {
			lastAssistantIndex = index;
			if (!messageContainsToolHistoryContent(entry)) {
				lastRenderableAssistantIndex = index;
				if (pending.length > 0) {
					let target = next[index];
					for (const item of pending) target = appendCanvasBlockToAssistantHistoryMessage({
						message: target,
						preview: item.preview,
						rawText: item.rawText
					});
					next[index] = target;
					pending.length = 0;
					changed = true;
				}
			}
			continue;
		}
		if (!messageContainsToolHistoryContent(entry)) continue;
		const toolName = typeof entry.toolName === "string" ? entry.toolName : typeof entry.tool_name === "string" ? entry.tool_name : void 0;
		const text = extractChatHistoryBlockText(entry);
		const preview = extractCanvasFromText(text, toolName);
		if (!preview) continue;
		pending.push({
			preview,
			rawText: text ?? null
		});
	}
	if (pending.length > 0) {
		const targetIndex = lastRenderableAssistantIndex >= 0 ? lastRenderableAssistantIndex : lastAssistantIndex;
		if (targetIndex >= 0) {
			let target = next[targetIndex];
			for (const item of pending) target = appendCanvasBlockToAssistantHistoryMessage({
				message: target,
				preview: item.preview,
				rawText: item.rawText
			});
			next[targetIndex] = target;
			changed = true;
		}
	}
	return changed ? next : messages;
}
function buildOversizedHistoryPlaceholder(message) {
	return {
		role: message && typeof message === "object" && typeof message.role === "string" ? message.role : "assistant",
		timestamp: message && typeof message === "object" && typeof message.timestamp === "number" ? message.timestamp : Date.now(),
		content: [{
			type: "text",
			text: CHAT_HISTORY_OVERSIZED_PLACEHOLDER
		}],
		__openclaw: {
			truncated: true,
			reason: "oversized"
		}
	};
}
function replaceOversizedChatHistoryMessages(params) {
	const { messages, maxSingleMessageBytes } = params;
	if (messages.length === 0) return {
		messages,
		replacedCount: 0
	};
	let replacedCount = 0;
	const next = messages.map((message) => {
		if (jsonUtf8Bytes(message) <= maxSingleMessageBytes) return message;
		replacedCount += 1;
		return buildOversizedHistoryPlaceholder(message);
	});
	return {
		messages: replacedCount > 0 ? next : messages,
		replacedCount
	};
}
function enforceChatHistoryFinalBudget(params) {
	const { messages, maxBytes } = params;
	if (messages.length === 0) return {
		messages,
		placeholderCount: 0
	};
	if (jsonUtf8Bytes(messages) <= maxBytes) return {
		messages,
		placeholderCount: 0
	};
	const last = messages.at(-1);
	if (last && jsonUtf8Bytes([last]) <= maxBytes) return {
		messages: [last],
		placeholderCount: 0
	};
	const placeholder = buildOversizedHistoryPlaceholder(last);
	if (jsonUtf8Bytes([placeholder]) <= maxBytes) return {
		messages: [placeholder],
		placeholderCount: 1
	};
	return {
		messages: [],
		placeholderCount: 0
	};
}
function resolveTranscriptPath(params) {
	const { sessionId, storePath, sessionFile, agentId } = params;
	if (!storePath && !sessionFile) return null;
	try {
		const sessionsDir = storePath ? path.dirname(storePath) : void 0;
		return resolveSessionFilePath(sessionId, sessionFile ? { sessionFile } : void 0, sessionsDir || agentId ? {
			sessionsDir,
			agentId
		} : void 0);
	} catch {
		return null;
	}
}
function ensureTranscriptFile(params) {
	if (fs.existsSync(params.transcriptPath)) return { ok: true };
	try {
		fs.mkdirSync(path.dirname(params.transcriptPath), { recursive: true });
		const header = {
			type: "session",
			version: CURRENT_SESSION_VERSION,
			id: params.sessionId,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			cwd: process.cwd()
		};
		fs.writeFileSync(params.transcriptPath, `${JSON.stringify(header)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function transcriptHasIdempotencyKey(transcriptPath, idempotencyKey) {
	try {
		const lines = fs.readFileSync(transcriptPath, "utf-8").split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;
			if (JSON.parse(line)?.message?.idempotencyKey === idempotencyKey) return true;
		}
		return false;
	} catch {
		return false;
	}
}
function appendAssistantTranscriptMessage(params) {
	const transcriptPath = resolveTranscriptPath({
		sessionId: params.sessionId,
		storePath: params.storePath,
		sessionFile: params.sessionFile,
		agentId: params.agentId
	});
	if (!transcriptPath) return {
		ok: false,
		error: "transcript path not resolved"
	};
	if (!fs.existsSync(transcriptPath)) {
		if (!params.createIfMissing) return {
			ok: false,
			error: "transcript file not found"
		};
		const ensured = ensureTranscriptFile({
			transcriptPath,
			sessionId: params.sessionId
		});
		if (!ensured.ok) return {
			ok: false,
			error: ensured.error ?? "failed to create transcript file"
		};
	}
	if (params.idempotencyKey && transcriptHasIdempotencyKey(transcriptPath, params.idempotencyKey)) return { ok: true };
	return appendInjectedAssistantMessageToTranscript({
		transcriptPath,
		message: params.message,
		label: params.label,
		content: params.content,
		idempotencyKey: params.idempotencyKey,
		abortMeta: params.abortMeta
	});
}
function collectSessionAbortPartials(params) {
	const out = [];
	for (const [runId, active] of params.chatAbortControllers) {
		if (!params.runIds.has(runId)) continue;
		const text = params.chatRunBuffers.get(runId);
		if (!text || !text.trim()) continue;
		out.push({
			runId,
			sessionId: active.sessionId,
			text,
			abortOrigin: params.abortOrigin
		});
	}
	return out;
}
function persistAbortedPartials(params) {
	if (params.snapshots.length === 0) return;
	const { storePath, entry } = loadSessionEntry(params.sessionKey);
	for (const snapshot of params.snapshots) {
		const sessionId = entry?.sessionId ?? snapshot.sessionId ?? snapshot.runId;
		const appended = appendAssistantTranscriptMessage({
			message: snapshot.text,
			sessionId,
			storePath,
			sessionFile: entry?.sessionFile,
			createIfMissing: true,
			idempotencyKey: `${snapshot.runId}:assistant`,
			abortMeta: {
				aborted: true,
				origin: snapshot.abortOrigin,
				runId: snapshot.runId
			}
		});
		if (!appended.ok) params.context.logGateway.warn(`chat.abort transcript append failed: ${appended.error ?? "unknown error"}`);
	}
}
function createChatAbortOps(context) {
	return {
		chatAbortControllers: context.chatAbortControllers,
		chatRunBuffers: context.chatRunBuffers,
		chatDeltaSentAt: context.chatDeltaSentAt,
		chatDeltaLastBroadcastLen: context.chatDeltaLastBroadcastLen,
		chatAbortedRuns: context.chatAbortedRuns,
		removeChatRun: context.removeChatRun,
		agentRunSeq: context.agentRunSeq,
		broadcast: context.broadcast,
		nodeSendToSession: context.nodeSendToSession
	};
}
function normalizeOptionalText(value) {
	return value?.trim() || void 0;
}
function normalizeExplicitChatSendOrigin(params) {
	const originatingChannel = normalizeOptionalText(params.originatingChannel);
	const originatingTo = normalizeOptionalText(params.originatingTo);
	const accountId = normalizeOptionalText(params.accountId);
	const messageThreadId = normalizeOptionalText(params.messageThreadId);
	if (!Boolean(originatingChannel || originatingTo || accountId || messageThreadId)) return { ok: true };
	const normalizedChannel = normalizeMessageChannel(originatingChannel);
	if (!normalizedChannel) return {
		ok: false,
		error: "originatingChannel is required when using originating route fields"
	};
	if (!originatingTo) return {
		ok: false,
		error: "originatingTo is required when using originating route fields"
	};
	return {
		ok: true,
		value: {
			originatingChannel: normalizedChannel,
			originatingTo,
			...accountId ? { accountId } : {},
			...messageThreadId ? { messageThreadId } : {}
		}
	};
}
function resolveChatAbortRequester(client) {
	const scopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
	return {
		connId: normalizeOptionalText(client?.connId),
		deviceId: normalizeOptionalText(client?.connect?.device?.id),
		isAdmin: scopes.includes(ADMIN_SCOPE)
	};
}
function canRequesterAbortChatRun(entry, requester) {
	if (requester.isAdmin) return true;
	const ownerDeviceId = normalizeOptionalText(entry.ownerDeviceId);
	const ownerConnId = normalizeOptionalText(entry.ownerConnId);
	if (!ownerDeviceId && !ownerConnId) return true;
	if (ownerDeviceId && requester.deviceId && ownerDeviceId === requester.deviceId) return true;
	if (ownerConnId && requester.connId && ownerConnId === requester.connId) return true;
	return false;
}
function resolveAuthorizedRunIdsForSession(params) {
	const authorizedRunIds = [];
	let matchedSessionRuns = 0;
	for (const [runId, active] of params.chatAbortControllers) {
		if (active.sessionKey !== params.sessionKey) continue;
		matchedSessionRuns += 1;
		if (canRequesterAbortChatRun(active, params.requester)) authorizedRunIds.push(runId);
	}
	return {
		matchedSessionRuns,
		authorizedRunIds
	};
}
function abortChatRunsForSessionKeyWithPartials(params) {
	const { matchedSessionRuns, authorizedRunIds } = resolveAuthorizedRunIdsForSession({
		chatAbortControllers: params.context.chatAbortControllers,
		sessionKey: params.sessionKey,
		requester: params.requester
	});
	if (authorizedRunIds.length === 0) return {
		aborted: false,
		runIds: [],
		unauthorized: matchedSessionRuns > 0
	};
	const authorizedRunIdSet = new Set(authorizedRunIds);
	const snapshots = collectSessionAbortPartials({
		chatAbortControllers: params.context.chatAbortControllers,
		chatRunBuffers: params.context.chatRunBuffers,
		runIds: authorizedRunIdSet,
		abortOrigin: params.abortOrigin
	});
	const runIds = [];
	for (const runId of authorizedRunIds) if (abortChatRunById(params.ops, {
		runId,
		sessionKey: params.sessionKey,
		stopReason: params.stopReason
	}).aborted) runIds.push(runId);
	const res = {
		aborted: runIds.length > 0,
		runIds,
		unauthorized: false
	};
	if (res.aborted) persistAbortedPartials({
		context: params.context,
		sessionKey: params.sessionKey,
		snapshots
	});
	return res;
}
function nextChatSeq(context, runId) {
	const next = (context.agentRunSeq.get(runId) ?? 0) + 1;
	context.agentRunSeq.set(runId, next);
	return next;
}
function broadcastChatFinal(params) {
	const seq = nextChatSeq({ agentRunSeq: params.context.agentRunSeq }, params.runId);
	const strippedEnvelopeMessage = stripEnvelopeFromMessage(params.message);
	const payload = {
		runId: params.runId,
		sessionKey: params.sessionKey,
		seq,
		state: "final",
		message: stripInlineDirectiveTagsFromMessageForDisplay(strippedEnvelopeMessage)
	};
	params.context.broadcast("chat", payload);
	params.context.nodeSendToSession(params.sessionKey, "chat", payload);
	params.context.agentRunSeq.delete(params.runId);
}
function isBtwReplyPayload(payload) {
	return typeof payload?.btw?.question === "string" && payload.btw.question.trim().length > 0 && typeof payload.text === "string" && payload.text.trim().length > 0;
}
function broadcastSideResult(params) {
	const seq = nextChatSeq({ agentRunSeq: params.context.agentRunSeq }, params.payload.runId);
	params.context.broadcast("chat.side_result", {
		...params.payload,
		seq
	});
	params.context.nodeSendToSession(params.payload.sessionKey, "chat.side_result", {
		...params.payload,
		seq
	});
}
function broadcastChatError(params) {
	const seq = nextChatSeq({ agentRunSeq: params.context.agentRunSeq }, params.runId);
	const payload = {
		runId: params.runId,
		sessionKey: params.sessionKey,
		seq,
		state: "error",
		errorMessage: params.errorMessage
	};
	params.context.broadcast("chat", payload);
	params.context.nodeSendToSession(params.sessionKey, "chat", payload);
	params.context.agentRunSeq.delete(params.runId);
}
const chatHandlers = {
	"chat.history": async ({ params, respond, context }) => {
		if (!validateChatHistoryParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.history params: ${formatValidationErrors(validateChatHistoryParams.errors)}`));
			return;
		}
		const { sessionKey, limit, maxChars } = params;
		const { cfg, storePath, entry } = loadSessionEntry(sessionKey);
		const sessionId = entry?.sessionId;
		const resolvedSessionModel = resolveSessionModelRef(cfg, entry, resolveSessionAgentId({
			sessionKey,
			config: cfg
		}));
		const localMessages = sessionId && storePath ? readSessionMessages(sessionId, storePath, entry?.sessionFile) : [];
		const rawMessages = augmentChatHistoryWithCliSessionImports({
			entry,
			provider: resolvedSessionModel.provider,
			localMessages
		});
		const max = Math.min(1e3, typeof limit === "number" ? limit : 200);
		const effectiveMaxChars = resolveEffectiveChatHistoryMaxChars(cfg, maxChars);
		const normalized = augmentChatHistoryWithCanvasBlocks(sanitizeChatHistoryMessages(stripEnvelopeFromMessages(rawMessages.length > max ? rawMessages.slice(-max) : rawMessages), effectiveMaxChars));
		const maxHistoryBytes = getMaxChatHistoryMessagesBytes();
		const replaced = replaceOversizedChatHistoryMessages({
			messages: normalized,
			maxSingleMessageBytes: Math.min(CHAT_HISTORY_MAX_SINGLE_MESSAGE_BYTES, maxHistoryBytes)
		});
		const capped = capArrayByJsonBytes(replaced.messages, maxHistoryBytes).items;
		const bounded = enforceChatHistoryFinalBudget({
			messages: capped,
			maxBytes: maxHistoryBytes
		});
		const placeholderCount = replaced.replacedCount + bounded.placeholderCount;
		if (placeholderCount > 0) {
			chatHistoryPlaceholderEmitCount += placeholderCount;
			context.logGateway.debug(`chat.history omitted oversized payloads placeholders=${placeholderCount} total=${chatHistoryPlaceholderEmitCount}`);
		}
		let thinkingLevel = entry?.thinkingLevel;
		if (!thinkingLevel) {
			const catalog = await context.loadGatewayModelCatalog();
			thinkingLevel = resolveThinkingDefault({
				cfg,
				provider: resolvedSessionModel.provider,
				model: resolvedSessionModel.model,
				catalog
			});
		}
		const verboseLevel = entry?.verboseLevel ?? cfg.agents?.defaults?.verboseDefault;
		respond(true, {
			sessionKey,
			sessionId,
			messages: bounded.messages,
			thinkingLevel,
			fastMode: entry?.fastMode,
			verboseLevel
		});
	},
	"chat.abort": ({ params, respond, context, client }) => {
		if (!validateChatAbortParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.abort params: ${formatValidationErrors(validateChatAbortParams.errors)}`));
			return;
		}
		const { sessionKey: rawSessionKey, runId } = params;
		const ops = createChatAbortOps(context);
		const requester = resolveChatAbortRequester(client);
		if (!runId) {
			const res = abortChatRunsForSessionKeyWithPartials({
				context,
				ops,
				sessionKey: rawSessionKey,
				abortOrigin: "rpc",
				stopReason: "rpc",
				requester
			});
			if (res.unauthorized) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unauthorized"));
				return;
			}
			respond(true, {
				ok: true,
				aborted: res.aborted,
				runIds: res.runIds
			});
			return;
		}
		const active = context.chatAbortControllers.get(runId);
		if (!active) {
			respond(true, {
				ok: true,
				aborted: false,
				runIds: []
			});
			return;
		}
		if (active.sessionKey !== rawSessionKey) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "runId does not match sessionKey"));
			return;
		}
		if (!canRequesterAbortChatRun(active, requester)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unauthorized"));
			return;
		}
		const partialText = context.chatRunBuffers.get(runId);
		const res = abortChatRunById(ops, {
			runId,
			sessionKey: rawSessionKey,
			stopReason: "rpc"
		});
		if (res.aborted && partialText && partialText.trim()) persistAbortedPartials({
			context,
			sessionKey: rawSessionKey,
			snapshots: [{
				runId,
				sessionId: active.sessionId,
				text: partialText,
				abortOrigin: "rpc"
			}]
		});
		respond(true, {
			ok: true,
			aborted: res.aborted,
			runIds: res.aborted ? [runId] : []
		});
	},
	"chat.send": async ({ params, respond, context, client }) => {
		if (!validateChatSendParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.send params: ${formatValidationErrors(validateChatSendParams.errors)}`));
			return;
		}
		const p = params;
		const explicitOriginResult = normalizeExplicitChatSendOrigin({
			originatingChannel: p.originatingChannel,
			originatingTo: p.originatingTo,
			accountId: p.originatingAccountId,
			messageThreadId: p.originatingThreadId
		});
		if (!explicitOriginResult.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, explicitOriginResult.error));
			return;
		}
		if ((p.systemInputProvenance || p.systemProvenanceReceipt || explicitOriginResult.value) && !canInjectSystemProvenance(client)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, p.systemInputProvenance || p.systemProvenanceReceipt ? "system provenance fields require admin scope" : "originating route fields require admin scope"));
			return;
		}
		const sanitizedMessageResult = sanitizeChatSendMessageInput(p.message);
		if (!sanitizedMessageResult.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, sanitizedMessageResult.error));
			return;
		}
		const systemReceiptResult = normalizeOptionalChatSystemReceipt(p.systemProvenanceReceipt);
		if (!systemReceiptResult.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, systemReceiptResult.error));
			return;
		}
		const inboundMessage = sanitizedMessageResult.message;
		const systemInputProvenance = normalizeInputProvenance(p.systemInputProvenance);
		const systemProvenanceReceipt = systemReceiptResult.receipt;
		const stopCommand = isChatStopCommandText(inboundMessage);
		const normalizedAttachments = normalizeRpcAttachmentsToChatAttachments(p.attachments);
		if (!inboundMessage.trim() && normalizedAttachments.length === 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "message or attachment required"));
			return;
		}
		const rawSessionKey = p.sessionKey;
		const { cfg, entry, canonicalKey: sessionKey } = loadSessionEntry(rawSessionKey);
		const agentId = resolveSessionAgentId({
			sessionKey,
			config: cfg
		});
		let parsedMessage = inboundMessage;
		let parsedImages = [];
		let imageOrder = [];
		let offloadedRefs = [];
		const timeoutMs = resolveAgentTimeoutMs({
			cfg,
			overrideMs: p.timeoutMs
		});
		const now = Date.now();
		const clientRunId = p.idempotencyKey;
		if (resolveSendPolicy({
			cfg,
			entry,
			sessionKey,
			channel: entry?.channel,
			chatType: entry?.chatType
		}) === "deny") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "send blocked by session policy"));
			return;
		}
		if (stopCommand) {
			const res = abortChatRunsForSessionKeyWithPartials({
				context,
				ops: createChatAbortOps(context),
				sessionKey: rawSessionKey,
				abortOrigin: "stop-command",
				stopReason: "stop",
				requester: resolveChatAbortRequester(client)
			});
			if (res.unauthorized) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unauthorized"));
				return;
			}
			respond(true, {
				ok: true,
				aborted: res.aborted,
				runIds: res.runIds
			});
			return;
		}
		const cached = context.dedupe.get(`chat:${clientRunId}`);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		if (context.chatAbortControllers.get(clientRunId)) {
			respond(true, {
				runId: clientRunId,
				status: "in_flight"
			}, void 0, {
				cached: true,
				runId: clientRunId
			});
			return;
		}
		if (normalizedAttachments.length > 0) {
			const modelRef = resolveSessionModelRef(cfg, entry, agentId);
			const supportsImages = await resolveGatewayModelSupportsImages({
				loadGatewayModelCatalog: context.loadGatewayModelCatalog,
				provider: modelRef.provider,
				model: modelRef.model
			});
			try {
				const parsed = await parseMessageWithAttachments(inboundMessage, normalizedAttachments, {
					maxBytes: 5e6,
					log: context.logGateway,
					supportsImages
				});
				parsedMessage = parsed.message;
				parsedImages = parsed.images;
				imageOrder = parsed.imageOrder;
				offloadedRefs = parsed.offloadedRefs;
			} catch (err) {
				respond(false, void 0, errorShape(err instanceof MediaOffloadError ? ErrorCodes.UNAVAILABLE : ErrorCodes.INVALID_REQUEST, String(err)));
				return;
			}
		}
		try {
			const abortController = new AbortController();
			context.chatAbortControllers.set(clientRunId, {
				controller: abortController,
				sessionId: entry?.sessionId ?? clientRunId,
				sessionKey: rawSessionKey,
				startedAtMs: now,
				expiresAtMs: resolveChatRunExpiresAtMs({
					now,
					timeoutMs
				}),
				ownerConnId: normalizeOptionalText(client?.connId),
				ownerDeviceId: normalizeOptionalText(client?.connect?.device?.id)
			});
			respond(true, {
				runId: clientRunId,
				status: "started"
			}, void 0, { runId: clientRunId });
			const persistedImagesPromise = persistChatSendImages({
				images: parsedImages,
				imageOrder,
				offloadedRefs,
				client,
				logGateway: context.logGateway
			});
			const trimmedMessage = parsedMessage.trim();
			const commandBody = Boolean(p.thinking && trimmedMessage && !trimmedMessage.startsWith("/")) ? `/think ${p.thinking} ${parsedMessage}` : parsedMessage;
			const messageForAgent = systemProvenanceReceipt ? [systemProvenanceReceipt, parsedMessage].filter(Boolean).join("\n\n") : parsedMessage;
			const clientInfo = client?.connect?.client;
			const { originatingChannel, originatingTo, accountId, messageThreadId, explicitDeliverRoute } = resolveChatSendOriginatingRoute({
				client: clientInfo,
				deliver: p.deliver,
				entry,
				explicitOrigin: explicitOriginResult.value,
				hasConnectedClient: client?.connect !== void 0,
				mainKey: cfg.session?.mainKey,
				sessionKey
			});
			const ctx = {
				Body: messageForAgent,
				BodyForAgent: injectTimestamp(messageForAgent, timestampOptsFromConfig(cfg)),
				BodyForCommands: commandBody,
				RawBody: parsedMessage,
				CommandBody: commandBody,
				InputProvenance: systemInputProvenance,
				SessionKey: sessionKey,
				Provider: INTERNAL_MESSAGE_CHANNEL,
				Surface: INTERNAL_MESSAGE_CHANNEL,
				OriginatingChannel: originatingChannel,
				OriginatingTo: originatingTo,
				ExplicitDeliverRoute: explicitDeliverRoute,
				AccountId: accountId,
				MessageThreadId: messageThreadId,
				ChatType: "direct",
				CommandAuthorized: true,
				MessageSid: clientRunId,
				SenderId: clientInfo?.id,
				SenderName: clientInfo?.displayName,
				SenderUsername: clientInfo?.displayName,
				GatewayClientScopes: client?.connect?.scopes ?? []
			};
			const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
				cfg,
				agentId,
				channel: INTERNAL_MESSAGE_CHANNEL
			});
			const deliveredReplies = [];
			let appendedWebchatAgentAudio = false;
			let userTranscriptUpdatePromise = null;
			const emitUserTranscriptUpdate = async () => {
				if (userTranscriptUpdatePromise) {
					await userTranscriptUpdatePromise;
					return;
				}
				userTranscriptUpdatePromise = (async () => {
					const { storePath: latestStorePath, entry: latestEntry } = loadSessionEntry(sessionKey);
					const resolvedSessionId = latestEntry?.sessionId ?? entry?.sessionId;
					if (!resolvedSessionId) return;
					const transcriptPath = resolveTranscriptPath({
						sessionId: resolvedSessionId,
						storePath: latestStorePath,
						sessionFile: latestEntry?.sessionFile ?? entry?.sessionFile,
						agentId
					});
					if (!transcriptPath) return;
					const persistedImages = await persistedImagesPromise;
					emitSessionTranscriptUpdate({
						sessionFile: transcriptPath,
						sessionKey,
						message: buildChatSendTranscriptMessage({
							message: parsedMessage,
							savedImages: persistedImages,
							timestamp: now
						})
					});
				})();
				await userTranscriptUpdatePromise;
			};
			let transcriptMediaRewriteDone = false;
			const rewriteUserTranscriptMedia = async () => {
				if (transcriptMediaRewriteDone) return;
				const { storePath: latestStorePath, entry: latestEntry } = loadSessionEntry(sessionKey);
				const resolvedSessionId = latestEntry?.sessionId ?? entry?.sessionId;
				if (!resolvedSessionId) return;
				const transcriptPath = resolveTranscriptPath({
					sessionId: resolvedSessionId,
					storePath: latestStorePath,
					sessionFile: latestEntry?.sessionFile ?? entry?.sessionFile,
					agentId
				});
				if (!transcriptPath) return;
				transcriptMediaRewriteDone = true;
				await rewriteChatSendUserTurnMediaPaths({
					transcriptPath,
					sessionKey,
					message: parsedMessage,
					savedImages: await persistedImagesPromise
				});
			};
			const appendWebchatAgentAudioTranscriptIfNeeded = async (payload) => {
				if (!agentRunStarted || appendedWebchatAgentAudio || !isMediaBearingPayload(payload)) return;
				const audioMessage = await buildWebchatAudioOnlyAssistantMessage([payload], {
					localRoots: getAgentScopedMediaLocalRoots(cfg, agentId),
					onLocalAudioAccessDenied: (message) => {
						context.logGateway.warn(`webchat audio embedding denied local path: ${message}`);
					}
				});
				if (!audioMessage) return;
				const { storePath: latestStorePath, entry: latestEntry } = loadSessionEntry(sessionKey);
				const sessionId = latestEntry?.sessionId ?? entry?.sessionId ?? clientRunId;
				const appended = appendAssistantTranscriptMessage({
					message: audioMessage.transcriptText,
					content: audioMessage.content,
					sessionId,
					storePath: latestStorePath,
					sessionFile: latestEntry?.sessionFile,
					agentId,
					createIfMissing: true,
					idempotencyKey: `${clientRunId}:assistant-audio`
				});
				if (appended.ok) {
					appendedWebchatAgentAudio = true;
					return;
				}
				context.logGateway.warn(`webchat transcript append failed for audio reply: ${appended.error ?? "unknown error"}`);
			};
			const dispatcher = createReplyDispatcher({
				...replyPipeline,
				onError: (err) => {
					context.logGateway.warn(`webchat dispatch failed: ${formatForLog(err)}`);
				},
				deliver: async (payload, info) => {
					switch (info.kind) {
						case "block":
						case "final":
							deliveredReplies.push({
								payload,
								kind: info.kind
							});
							await appendWebchatAgentAudioTranscriptIfNeeded(payload);
							break;
						case "tool":
							if (isMediaBearingPayload(payload)) deliveredReplies.push({
								payload: {
									...payload,
									text: void 0
								},
								kind: "final"
							});
							break;
					}
				}
			});
			emitUserTranscriptUpdate().catch((transcriptErr) => {
				context.logGateway.warn(`webchat eager user transcript update failed: ${formatForLog(transcriptErr)}`);
			});
			let agentRunStarted = false;
			dispatchInboundMessage({
				ctx,
				cfg,
				dispatcher,
				replyOptions: {
					runId: clientRunId,
					abortSignal: abortController.signal,
					images: parsedImages.length > 0 ? parsedImages : void 0,
					imageOrder: imageOrder.length > 0 ? imageOrder : void 0,
					onAgentRunStart: (runId) => {
						agentRunStarted = true;
						emitUserTranscriptUpdate();
						const connId = typeof client?.connId === "string" ? client.connId : void 0;
						const wantsToolEvents = hasGatewayClientCap(client?.connect?.caps, GATEWAY_CLIENT_CAPS.TOOL_EVENTS);
						if (connId && wantsToolEvents) {
							context.registerToolEventRecipient(runId, connId);
							for (const [activeRunId, active] of context.chatAbortControllers) if (activeRunId !== runId && active.sessionKey === p.sessionKey) context.registerToolEventRecipient(activeRunId, connId);
						}
					},
					onModelSelected
				}
			}).then(async () => {
				await rewriteUserTranscriptMedia();
				if (!agentRunStarted) {
					await emitUserTranscriptUpdate();
					const btwReplies = deliveredReplies.map((entry) => entry.payload).filter(isBtwReplyPayload);
					const btwText = btwReplies.map((payload) => payload.text.trim()).filter(Boolean).join("\n\n").trim();
					if (btwReplies.length > 0 && btwText) {
						broadcastSideResult({
							context,
							payload: {
								kind: "btw",
								runId: clientRunId,
								sessionKey,
								question: btwReplies[0].btw.question.trim(),
								text: btwText,
								isError: btwReplies.some((payload) => payload.isError),
								ts: Date.now()
							}
						});
						broadcastChatFinal({
							context,
							runId: clientRunId,
							sessionKey
						});
					} else {
						const combinedReply = buildTranscriptReplyText(deliveredReplies.filter((entry) => entry.kind === "final").map((entry) => entry.payload));
						let message;
						if (combinedReply) {
							const { storePath: latestStorePath, entry: latestEntry } = loadSessionEntry(sessionKey);
							const appended = appendAssistantTranscriptMessage({
								message: combinedReply,
								sessionId: latestEntry?.sessionId ?? entry?.sessionId ?? clientRunId,
								storePath: latestStorePath,
								sessionFile: latestEntry?.sessionFile,
								agentId,
								createIfMissing: true
							});
							if (appended.ok) message = appended.message;
							else {
								context.logGateway.warn(`webchat transcript append failed: ${appended.error ?? "unknown error"}`);
								message = {
									role: "assistant",
									content: [{
										type: "text",
										text: combinedReply
									}],
									timestamp: Date.now(),
									stopReason: "stop",
									usage: {
										input: 0,
										output: 0,
										totalTokens: 0
									}
								};
							}
						}
						broadcastChatFinal({
							context,
							runId: clientRunId,
							sessionKey,
							message
						});
					}
				} else emitUserTranscriptUpdate();
				setGatewayDedupeEntry({
					dedupe: context.dedupe,
					key: `chat:${clientRunId}`,
					entry: {
						ts: Date.now(),
						ok: true,
						payload: {
							runId: clientRunId,
							status: "ok"
						}
					}
				});
			}).catch((err) => {
				rewriteUserTranscriptMedia().catch((rewriteErr) => {
					context.logGateway.warn(`webchat transcript media rewrite failed after error: ${formatForLog(rewriteErr)}`);
				});
				emitUserTranscriptUpdate().catch((transcriptErr) => {
					context.logGateway.warn(`webchat user transcript update failed after error: ${formatForLog(transcriptErr)}`);
				});
				const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
				setGatewayDedupeEntry({
					dedupe: context.dedupe,
					key: `chat:${clientRunId}`,
					entry: {
						ts: Date.now(),
						ok: false,
						payload: {
							runId: clientRunId,
							status: "error",
							summary: String(err)
						},
						error
					}
				});
				broadcastChatError({
					context,
					runId: clientRunId,
					sessionKey,
					errorMessage: String(err)
				});
			}).finally(() => {
				context.chatAbortControllers.delete(clientRunId);
			});
		} catch (err) {
			const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
			const payload = {
				runId: clientRunId,
				status: "error",
				summary: String(err)
			};
			setGatewayDedupeEntry({
				dedupe: context.dedupe,
				key: `chat:${clientRunId}`,
				entry: {
					ts: Date.now(),
					ok: false,
					payload,
					error
				}
			});
			respond(false, payload, error, {
				runId: clientRunId,
				error: formatForLog(err)
			});
		}
	},
	"chat.inject": async ({ params, respond, context }) => {
		if (!validateChatInjectParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.inject params: ${formatValidationErrors(validateChatInjectParams.errors)}`));
			return;
		}
		const p = params;
		const rawSessionKey = p.sessionKey;
		const { cfg, storePath, entry, canonicalKey: sessionKey } = loadSessionEntry(rawSessionKey);
		const sessionId = entry?.sessionId;
		if (!sessionId || !storePath) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "session not found"));
			return;
		}
		const appended = appendAssistantTranscriptMessage({
			message: p.message,
			label: p.label,
			sessionId,
			storePath,
			sessionFile: entry?.sessionFile,
			agentId: resolveSessionAgentId({
				sessionKey,
				config: cfg
			}),
			createIfMissing: true
		});
		if (!appended.ok || !appended.messageId || !appended.message) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `failed to write transcript: ${appended.error ?? "unknown error"}`));
			return;
		}
		const chatPayload = {
			runId: `inject-${appended.messageId}`,
			sessionKey,
			seq: 0,
			state: "final",
			message: stripInlineDirectiveTagsFromMessageForDisplay(stripEnvelopeFromMessage(appended.message))
		};
		context.broadcast("chat", chatPayload);
		context.nodeSendToSession(sessionKey, "chat", chatPayload);
		respond(true, {
			ok: true,
			messageId: appended.messageId
		});
	}
};
//#endregion
export { injectTimestamp as _, DEDUPE_TTL_MS as a, MAX_PAYLOAD_BYTES as c, isSuppressedControlReplyLeadFragment as d, isSuppressedControlReplyText as f, waitForTerminalGatewayDedupe as g, setGatewayDedupeEntry as h, DEDUPE_MAX as i, MAX_PREAUTH_PAYLOAD_BYTES as l, readTerminalSnapshotFromGatewayDedupe as m, chatHandlers as n, HEALTH_REFRESH_INTERVAL_MS as o, abortChatRunById as p, sanitizeChatHistoryMessages as r, MAX_BUFFERED_BYTES as s, DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS as t, TICK_INTERVAL_MS as u, timestampOptsFromConfig as v };
