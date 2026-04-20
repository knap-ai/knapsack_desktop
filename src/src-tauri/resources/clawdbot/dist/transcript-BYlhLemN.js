import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { n as normalizeStoreSessionKey } from "./store-DFXcceZJ.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, o as resolveSessionTranscriptPath, r as resolveDefaultSessionStorePath } from "./paths-CZMxg3hs.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-CdRuhFsO.js";
import { t as resolveAndPersistSessionFile } from "./session-file-B_37cdL1.js";
import { t as parseSessionThreadInfo } from "./thread-info-DA0w7q1W.js";
import fs from "node:fs";
import path from "node:path";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/config/sessions/transcript-mirror.ts
function stripQuery(value) {
	const noHash = value.split("#")[0] ?? value;
	return noHash.split("?")[0] ?? noHash;
}
function extractFileNameFromMediaUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const cleaned = stripQuery(trimmed);
	try {
		const parsed = new URL(cleaned);
		const base = path.basename(parsed.pathname);
		if (!base) return null;
		try {
			return decodeURIComponent(base);
		} catch {
			return base;
		}
	} catch {
		const base = path.basename(cleaned);
		if (!base || base === "/" || base === ".") return null;
		return base;
	}
}
function resolveMirroredTranscriptText(params) {
	const mediaUrls = params.mediaUrls?.filter((url) => url && url.trim()) ?? [];
	if (mediaUrls.length > 0) {
		const names = mediaUrls.map((url) => extractFileNameFromMediaUrl(url)).filter((name) => Boolean(name && name.trim()));
		if (names.length > 0) return names.join(", ");
		return "media";
	}
	const trimmed = (params.text ?? "").trim();
	return trimmed ? trimmed : null;
}
//#endregion
//#region src/config/sessions/transcript.ts
async function ensureSessionHeader(params) {
	if (fs.existsSync(params.sessionFile)) return;
	await fs.promises.mkdir(path.dirname(params.sessionFile), { recursive: true });
	const header = {
		type: "session",
		version: CURRENT_SESSION_VERSION,
		id: params.sessionId,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		cwd: process.cwd()
	};
	await fs.promises.writeFile(params.sessionFile, `${JSON.stringify(header)}\n`, {
		encoding: "utf-8",
		mode: 384
	});
}
async function resolveSessionTranscriptFile(params) {
	const sessionPathOpts = resolveSessionFilePathOptions({
		agentId: params.agentId,
		storePath: params.storePath
	});
	let sessionFile = resolveSessionFilePath(params.sessionId, params.sessionEntry, sessionPathOpts);
	let sessionEntry = params.sessionEntry;
	if (params.sessionStore && params.storePath) {
		const threadIdFromSessionKey = parseSessionThreadInfo(params.sessionKey).threadId;
		const fallbackSessionFile = !sessionEntry?.sessionFile ? resolveSessionTranscriptPath(params.sessionId, params.agentId, params.threadId ?? threadIdFromSessionKey) : void 0;
		const resolvedSessionFile = await resolveAndPersistSessionFile({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionStore: params.sessionStore,
			storePath: params.storePath,
			sessionEntry,
			agentId: sessionPathOpts?.agentId,
			sessionsDir: sessionPathOpts?.sessionsDir,
			fallbackSessionFile
		});
		sessionFile = resolvedSessionFile.sessionFile;
		sessionEntry = resolvedSessionFile.sessionEntry;
	}
	return {
		sessionFile,
		sessionEntry
	};
}
async function appendAssistantMessageToSessionTranscript(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		reason: "missing sessionKey"
	};
	const mirrorText = resolveMirroredTranscriptText({
		text: params.text,
		mediaUrls: params.mediaUrls
	});
	if (!mirrorText) return {
		ok: false,
		reason: "empty text"
	};
	return appendExactAssistantMessageToSessionTranscript({
		agentId: params.agentId,
		sessionKey,
		storePath: params.storePath,
		idempotencyKey: params.idempotencyKey,
		updateMode: params.updateMode,
		message: {
			role: "assistant",
			content: [{
				type: "text",
				text: mirrorText
			}],
			api: "openai-responses",
			provider: "openclaw",
			model: "delivery-mirror",
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
			stopReason: "stop",
			timestamp: Date.now()
		}
	});
}
async function appendExactAssistantMessageToSessionTranscript(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		reason: "missing sessionKey"
	};
	if (params.message.role !== "assistant") return {
		ok: false,
		reason: "message role must be assistant"
	};
	const storePath = params.storePath ?? resolveDefaultSessionStorePath(params.agentId);
	const store = loadSessionStore(storePath, { skipCache: true });
	const entry = store[normalizeStoreSessionKey(sessionKey)] ?? store[sessionKey];
	if (!entry?.sessionId) return {
		ok: false,
		reason: `unknown sessionKey: ${sessionKey}`
	};
	let sessionFile;
	try {
		sessionFile = (await resolveAndPersistSessionFile({
			sessionId: entry.sessionId,
			sessionKey,
			sessionStore: store,
			storePath,
			sessionEntry: entry,
			agentId: params.agentId,
			sessionsDir: path.dirname(storePath)
		})).sessionFile;
	} catch (err) {
		return {
			ok: false,
			reason: formatErrorMessage(err)
		};
	}
	await ensureSessionHeader({
		sessionFile,
		sessionId: entry.sessionId
	});
	const explicitIdempotencyKey = params.idempotencyKey ?? params.message.idempotencyKey;
	const existingMessageId = explicitIdempotencyKey ? await transcriptHasIdempotencyKey(sessionFile, explicitIdempotencyKey) : void 0;
	if (existingMessageId) return {
		ok: true,
		sessionFile,
		messageId: existingMessageId
	};
	const latestEquivalentAssistantId = isRedundantDeliveryMirror(params.message) ? await findLatestEquivalentAssistantMessageId(sessionFile, params.message) : void 0;
	if (latestEquivalentAssistantId) return {
		ok: true,
		sessionFile,
		messageId: latestEquivalentAssistantId
	};
	const message = {
		...params.message,
		...explicitIdempotencyKey ? { idempotencyKey: explicitIdempotencyKey } : {}
	};
	const messageId = SessionManager.open(sessionFile).appendMessage(message);
	switch (params.updateMode ?? "inline") {
		case "inline":
			emitSessionTranscriptUpdate({
				sessionFile,
				sessionKey,
				message,
				messageId
			});
			break;
		case "file-only":
			emitSessionTranscriptUpdate(sessionFile);
			break;
		case "none": break;
	}
	return {
		ok: true,
		sessionFile,
		messageId
	};
}
async function transcriptHasIdempotencyKey(transcriptPath, idempotencyKey) {
	try {
		const raw = await fs.promises.readFile(transcriptPath, "utf-8");
		for (const line of raw.split(/\r?\n/)) {
			if (!line.trim()) continue;
			try {
				const parsed = JSON.parse(line);
				if (parsed.message?.idempotencyKey === idempotencyKey && typeof parsed.id === "string" && parsed.id) return parsed.id;
			} catch {
				continue;
			}
		}
	} catch {
		return;
	}
}
function isRedundantDeliveryMirror(message) {
	return message.provider === "openclaw" && message.model === "delivery-mirror";
}
function extractAssistantMessageText(message) {
	if (!Array.isArray(message.content)) return null;
	const parts = message.content.filter((part) => part.type === "text" && typeof part.text === "string" && part.text.trim().length > 0).map((part) => part.text.trim());
	return parts.length > 0 ? parts.join("\n").trim() : null;
}
async function findLatestEquivalentAssistantMessageId(transcriptPath, message) {
	const expectedText = extractAssistantMessageText(message);
	if (!expectedText) return;
	try {
		const lines = (await fs.promises.readFile(transcriptPath, "utf-8")).split(/\r?\n/);
		for (let index = lines.length - 1; index >= 0; index -= 1) {
			const line = lines[index];
			if (!line.trim()) continue;
			try {
				const parsed = JSON.parse(line);
				const candidate = parsed.message;
				if (!candidate || candidate.role !== "assistant") continue;
				if (extractAssistantMessageText(candidate) !== expectedText) return;
				if (typeof parsed.id === "string" && parsed.id) return parsed.id;
				return;
			} catch {
				continue;
			}
		}
	} catch {
		return;
	}
}
//#endregion
export { resolveMirroredTranscriptText as i, appendExactAssistantMessageToSessionTranscript as n, resolveSessionTranscriptFile as r, appendAssistantMessageToSessionTranscript as t };
