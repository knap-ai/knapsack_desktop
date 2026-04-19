import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import "./config-Q9XZc_2I.js";
import { n as authorizeOperatorScopesForMethod } from "./method-scopes-D3xbsVVt.js";
import "./sessions-vP2E4vs-.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as onSessionTranscriptUpdate } from "./transcript-events-CdRuhFsO.js";
import { c as resolveFreshestSessionEntryFromStoreKeys, u as resolveGatewaySessionStoreTarget } from "./session-utils-hDe0hdis.js";
import { i as readSessionMessages, t as attachOpenClawTranscriptMeta } from "./session-utils.fs-BtTrNS1L.js";
import { a as resolveSessionTranscriptCandidates } from "./session-transcript-files.fs-bPixE_A8.js";
import { S as setSseHeaders, a as getHeader, b as sendMethodNotAllowed, p as resolveTrustedHttpOperatorScopes, r as authorizeGatewayHttpRequestOrReply, v as sendInvalidRequest, y as sendJson } from "./http-utils-C26ZfE50.js";
import { r as sanitizeChatHistoryMessages, t as DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS } from "./chat-CMSNlsvD.js";
import fs from "node:fs";
import path from "node:path";
//#region src/gateway/session-history-state.ts
function resolveCursorSeq(cursor) {
	if (!cursor) return;
	const normalized = cursor.startsWith("seq:") ? cursor.slice(4) : cursor;
	const value = Number.parseInt(normalized, 10);
	return Number.isFinite(value) && value > 0 ? value : void 0;
}
function toSessionHistoryMessages(messages) {
	return messages.filter((message) => Boolean(message) && typeof message === "object" && !Array.isArray(message));
}
function buildPaginatedSessionHistory(params) {
	return {
		items: params.messages,
		messages: params.messages,
		hasMore: params.hasMore,
		...params.nextCursor ? { nextCursor: params.nextCursor } : {}
	};
}
function resolveMessageSeq(message) {
	const seq = message?.__openclaw?.seq;
	return typeof seq === "number" && Number.isFinite(seq) && seq > 0 ? seq : void 0;
}
function paginateSessionMessages(messages, limit, cursor) {
	const cursorSeq = resolveCursorSeq(cursor);
	let endExclusive = messages.length;
	if (typeof cursorSeq === "number") {
		endExclusive = messages.findIndex((message, index) => {
			const seq = resolveMessageSeq(message);
			if (typeof seq === "number") return seq >= cursorSeq;
			return index + 1 >= cursorSeq;
		});
		if (endExclusive < 0) endExclusive = messages.length;
	}
	const start = typeof limit === "number" && limit > 0 ? Math.max(0, endExclusive - limit) : 0;
	const paginatedMessages = messages.slice(start, endExclusive);
	const firstSeq = resolveMessageSeq(paginatedMessages[0]);
	return buildPaginatedSessionHistory({
		messages: paginatedMessages,
		hasMore: start > 0,
		...start > 0 && typeof firstSeq === "number" ? { nextCursor: String(firstSeq) } : {}
	});
}
function buildSessionHistorySnapshot(params) {
	const history = paginateSessionMessages(toSessionHistoryMessages(sanitizeChatHistoryMessages(params.rawMessages, params.maxChars ?? 8e3)), params.limit, params.cursor);
	const rawHistoryMessages = toSessionHistoryMessages(params.rawMessages);
	return {
		history,
		rawTranscriptSeq: resolveMessageSeq(rawHistoryMessages.at(-1)) ?? rawHistoryMessages.length
	};
}
var SessionHistorySseState = class SessionHistorySseState {
	static fromRawSnapshot(params) {
		return new SessionHistorySseState({
			target: params.target,
			maxChars: params.maxChars,
			limit: params.limit,
			cursor: params.cursor,
			initialRawMessages: params.rawMessages
		});
	}
	constructor(params) {
		this.target = params.target;
		this.maxChars = params.maxChars ?? 8e3;
		this.limit = params.limit;
		this.cursor = params.cursor;
		const snapshot = buildSessionHistorySnapshot({
			rawMessages: params.initialRawMessages ?? this.readRawMessages(),
			maxChars: this.maxChars,
			limit: this.limit,
			cursor: this.cursor
		});
		this.sentHistory = snapshot.history;
		this.rawTranscriptSeq = snapshot.rawTranscriptSeq;
	}
	snapshot() {
		return this.sentHistory;
	}
	appendInlineMessage(update) {
		if (this.limit !== void 0 || this.cursor !== void 0) return null;
		this.rawTranscriptSeq += 1;
		const sanitized = sanitizeChatHistoryMessages([attachOpenClawTranscriptMeta(update.message, {
			...typeof update.messageId === "string" ? { id: update.messageId } : {},
			seq: this.rawTranscriptSeq
		})], this.maxChars);
		if (sanitized.length === 0) return null;
		const [sanitizedMessage] = toSessionHistoryMessages(sanitized);
		if (!sanitizedMessage) return null;
		this.sentHistory = buildPaginatedSessionHistory({
			messages: [...this.sentHistory.messages, sanitizedMessage],
			hasMore: false
		});
		return {
			message: sanitizedMessage,
			messageSeq: resolveMessageSeq(sanitizedMessage)
		};
	}
	refresh() {
		const snapshot = buildSessionHistorySnapshot({
			rawMessages: this.readRawMessages(),
			maxChars: this.maxChars,
			limit: this.limit,
			cursor: this.cursor
		});
		this.rawTranscriptSeq = snapshot.rawTranscriptSeq;
		this.sentHistory = snapshot.history;
		return snapshot.history;
	}
	readRawMessages() {
		return readSessionMessages(this.target.sessionId, this.target.storePath, this.target.sessionFile);
	}
};
//#endregion
//#region src/gateway/sessions-history-http.ts
const MAX_SESSION_HISTORY_LIMIT = 1e3;
function resolveSessionHistoryPath(req) {
	const match = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`).pathname.match(/^\/sessions\/([^/]+)\/history$/);
	if (!match) return null;
	try {
		return normalizeOptionalString(decodeURIComponent(match[1] ?? "")) ?? null;
	} catch {
		return "";
	}
}
function shouldStreamSse(req) {
	return normalizeLowercaseStringOrEmpty(getHeader(req, "accept")).includes("text/event-stream");
}
function getRequestUrl(req) {
	return new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
}
function resolveLimit(req) {
	const raw = getRequestUrl(req).searchParams.get("limit");
	if (raw == null || raw.trim() === "") return;
	const value = Number.parseInt(raw, 10);
	if (!Number.isFinite(value) || value < 1) return 1;
	return Math.min(MAX_SESSION_HISTORY_LIMIT, Math.max(1, value));
}
function canonicalizePath(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	const resolved = path.resolve(trimmed);
	try {
		return fs.realpathSync(resolved);
	} catch {
		return resolved;
	}
}
function sseWrite(res, event, payload) {
	res.write(`event: ${event}\n`);
	res.write(`data: ${JSON.stringify(payload)}\n\n`);
}
async function handleSessionHistoryHttpRequest(req, res, opts) {
	const sessionKey = resolveSessionHistoryPath(req);
	if (sessionKey === null) return false;
	if (!sessionKey) {
		sendInvalidRequest(res, "invalid session key");
		return true;
	}
	if (req.method !== "GET") {
		sendMethodNotAllowed(res, "GET");
		return true;
	}
	const cfg = loadConfig();
	const requestAuth = await authorizeGatewayHttpRequestOrReply({
		req,
		res,
		auth: opts.auth,
		trustedProxies: opts.trustedProxies ?? cfg.gateway?.trustedProxies,
		allowRealIpFallback: opts.allowRealIpFallback ?? cfg.gateway?.allowRealIpFallback,
		rateLimiter: opts.rateLimiter
	});
	if (!requestAuth) return true;
	const scopeAuth = authorizeOperatorScopesForMethod("chat.history", resolveTrustedHttpOperatorScopes(req, requestAuth));
	if (!scopeAuth.allowed) {
		sendJson(res, 403, {
			ok: false,
			error: {
				type: "forbidden",
				message: `missing scope: ${scopeAuth.missingScope}`
			}
		});
		return true;
	}
	const target = resolveGatewaySessionStoreTarget({
		cfg,
		key: sessionKey
	});
	const entry = resolveFreshestSessionEntryFromStoreKeys(loadSessionStore(target.storePath), target.storeKeys);
	if (!entry?.sessionId) {
		sendJson(res, 404, {
			ok: false,
			error: {
				type: "not_found",
				message: `Session not found: ${sessionKey}`
			}
		});
		return true;
	}
	const limit = resolveLimit(req);
	const cursor = normalizeOptionalString(getRequestUrl(req).searchParams.get("cursor"));
	const effectiveMaxChars = typeof cfg.gateway?.webchat?.chatHistoryMaxChars === "number" ? cfg.gateway.webchat.chatHistoryMaxChars : DEFAULT_CHAT_HISTORY_TEXT_MAX_CHARS;
	const rawSnapshot = entry?.sessionId ? readSessionMessages(entry.sessionId, target.storePath, entry.sessionFile) : [];
	const history = buildSessionHistorySnapshot({
		rawMessages: rawSnapshot,
		maxChars: effectiveMaxChars,
		limit,
		cursor
	}).history;
	if (!shouldStreamSse(req)) {
		sendJson(res, 200, {
			sessionKey: target.canonicalKey,
			...history
		});
		return true;
	}
	const transcriptCandidates = entry?.sessionId ? new Set(resolveSessionTranscriptCandidates(entry.sessionId, target.storePath, entry.sessionFile, target.agentId).map((candidate) => canonicalizePath(candidate)).filter((candidate) => typeof candidate === "string")) : /* @__PURE__ */ new Set();
	let sentHistory = history;
	const sseState = SessionHistorySseState.fromRawSnapshot({
		target: {
			sessionId: entry.sessionId,
			storePath: target.storePath,
			sessionFile: entry.sessionFile
		},
		rawMessages: rawSnapshot,
		maxChars: effectiveMaxChars,
		limit,
		cursor
	});
	sentHistory = sseState.snapshot();
	setSseHeaders(res);
	res.write("retry: 1000\n\n");
	sseWrite(res, "history", {
		sessionKey: target.canonicalKey,
		...sentHistory
	});
	const heartbeat = setInterval(() => {
		if (!res.writableEnded) res.write(": keepalive\n\n");
	}, 15e3);
	const unsubscribe = onSessionTranscriptUpdate((update) => {
		if (res.writableEnded || !entry?.sessionId) return;
		const updatePath = canonicalizePath(update.sessionFile);
		if (!updatePath || !transcriptCandidates.has(updatePath)) return;
		if (update.message !== void 0) {
			if (limit === void 0 && cursor === void 0) {
				const nextEvent = sseState.appendInlineMessage({
					message: update.message,
					messageId: update.messageId
				});
				if (!nextEvent) return;
				sentHistory = sseState.snapshot();
				sseWrite(res, "message", {
					sessionKey: target.canonicalKey,
					message: nextEvent.message,
					...typeof update.messageId === "string" ? { messageId: update.messageId } : {},
					messageSeq: nextEvent.messageSeq
				});
				return;
			}
		}
		sentHistory = sseState.refresh();
		sseWrite(res, "history", {
			sessionKey: target.canonicalKey,
			...sentHistory
		});
	});
	const cleanup = () => {
		clearInterval(heartbeat);
		unsubscribe();
	};
	req.on("close", cleanup);
	res.on("close", cleanup);
	res.on("finish", cleanup);
	return true;
}
//#endregion
export { handleSessionHistoryHttpRequest };
