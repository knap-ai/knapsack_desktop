import { E as setOutboundAudioPort, _ as sendVoice, c as isMediaPayload, g as sendVideoMsg, h as sendPhoto, l as parseQQBotPayload, m as sendDocument, o as encodePayloadForCron, r as sendMedia, s as isCronReminderPayload, u as normalizeMediaTags, v as resolveUserFacingMediaError, w as DEFAULT_MEDIA_SEND_ERROR } from "./outbound-Bf1CsgyS.js";
import { c as getPlatformAdapter, i as normalizeOptionalString, n as normalizeLowercaseStringOrEmpty, o as readStringField, s as sanitizeFileName, t as asOptionalObjectRecord } from "./string-normalize-Ci6NM5DE.js";
import { d as setBridgeLogger, l as ensurePlatformAdapter, s as resolveAccountBase } from "./resolve-D_06fV6-.js";
import { i as parseApprovalButtonData } from "./approval-cg0SVahb.js";
import { t as toGatewayAccount } from "./narrowing-BoieBTIU.js";
import { B as StreamInputState, C as debugLog, E as getNextMsgSeq, I as formatDuration, L as formatErrorMessage, N as getImageMimeType, P as getMaxUploadSize, R as StreamContentType, S as debugError, a as createRawInputNotifyFn, b as withTokenRetry, c as getMessageApi, d as initSender, f as onMessageSent, g as sendText, h as sendMedia$1, i as clearTokenCache, j as formatFileSize, k as downloadFile, l as getPluginUserAgent, m as sendInputNotify, n as acknowledgeInteraction, o as getAccessToken, p as registerAccount, r as buildDeliveryTarget, s as getGatewayUrl, t as accountToCreds, u as initApiConfig, v as startBackgroundTokenRefresh, w as debugWarn, x as openLocalFile, y as stopBackgroundTokenRefresh, z as StreamInputMode } from "./sender-C4B08bDl.js";
import { n as getQQBotRuntimeForEngine, t as getQQBotRuntime } from "./runtime-DfUSfqc5.js";
import { a as detectFfmpeg, c as getQQBotDataDir, d as getTempDir, f as isLocalPath, h as resolveQQBotPayloadLocalFilePath, i as checkSilkWasmAvailable, l as getQQBotDataPath, m as normalizePath$1, o as getHomeDir, p as isWindows, s as getPlatform, u as getQQBotMediaDir } from "./target-parser-CqH_T7ny.js";
import { a as getPluginVersion, i as getFrameworkVersion, n as runWithRequestContext, o as initCommands, s as matchSlashCommand } from "./request-context-CMzqY91g.js";
import * as fs$1 from "node:fs";
import fs from "node:fs";
import * as os$1 from "node:os";
import crypto from "node:crypto";
import * as path$1 from "node:path";
import path from "node:path";
import { execFile } from "node:child_process";
import { resolveRuntimeServiceVersion } from "openclaw/plugin-sdk/cli-runtime";
import WebSocket from "ws";
import { Buffer as Buffer$1 } from "node:buffer";
import { fileURLToPath } from "node:url";
import { implicitMentionKindWhen, resolveInboundMentionDecision } from "openclaw/plugin-sdk/channel-mention-gating";
import { buildPendingHistoryContextFromMap, clearHistoryEntriesIfEnabled, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
//#region extensions/qqbot/src/engine/group/activation.ts
/**
* Group activation mode — how the bot decides whether to respond in a group.
*
* Resolution chain:
*   1. session store override (`/activation` command writes per-session
*      `groupActivation` value) — highest priority
*   2. per-group `requireMention` config
*   3. `"mention"` default (require @-bot to respond)
*
* File I/O is isolated in the default node-based reader so the gating
* logic itself stays a pure function, testable without touching disk.
*
* Note: the implicit-mention predicate (quoting a bot message counts as
* @-ing the bot) lives in `./mention.ts` alongside the other mention
* helpers — see `resolveImplicitMention` there.
*/
/**
* Resolve the effective activation mode for one inbound message.
*
* Order of precedence:
*   1. `store[sessionKey].groupActivation` (read via the injected reader)
*   2. config-level `requireMention` (maps to `"mention"` / `"always"`)
*   3. `"mention"` (safe default)
*/
function resolveGroupActivation(params) {
	const fallback = params.configRequireMention ? "mention" : "always";
	const store = params.sessionStoreReader?.read({
		cfg: params.cfg,
		agentId: params.agentId
	});
	if (!store) return fallback;
	const entry = store[params.sessionKey];
	if (!entry?.groupActivation) return fallback;
	const normalized = entry.groupActivation.trim().toLowerCase();
	if (normalized === "mention" || normalized === "always") return normalized;
	return fallback;
}
/**
* Resolve the on-disk path to the agent-sessions file.
*
* Priority:
*   1. `cfg.session.store` (supports `{agentId}` placeholder and `~` expansion)
*   2. `$OPENCLAW_STATE_DIR` / `$CLAWDBOT_STATE_DIR`
*   3. `~/.openclaw/agents/{agentId}/sessions/sessions.json`
*/
function resolveSessionStorePath(cfg, agentId) {
	const resolvedAgentId = agentId || "default";
	const session = typeof cfg.session === "object" && cfg.session !== null ? cfg.session : void 0;
	const rawStore = typeof session?.store === "string" ? session.store : void 0;
	if (rawStore) {
		let expanded = rawStore;
		if (expanded.includes("{agentId}")) expanded = expanded.replaceAll("{agentId}", resolvedAgentId);
		if (expanded.startsWith("~")) {
			const home = process.env.HOME || process.env.USERPROFILE || "";
			expanded = expanded.replace(/^~/, home);
		}
		return path.resolve(expanded);
	}
	const stateDir = process.env.OPENCLAW_STATE_DIR?.trim() || process.env.CLAWDBOT_STATE_DIR?.trim() || path.join(process.env.HOME || process.env.USERPROFILE || "", ".openclaw");
	return path.join(stateDir, "agents", resolvedAgentId, "sessions", "sessions.json");
}
/**
* Create the default, production-ready session-store reader.
*
* Reads the file synchronously on every call. The overhead is acceptable
* because activation mode is only resolved once per group message and
* the sessions file is typically a handful of kilobytes.
*
* Any I/O or JSON error is swallowed and returned as `null` so the
* gating pipeline falls back to the config default.
*/
function createNodeSessionStoreReader() {
	return { read: ({ cfg, agentId }) => {
		try {
			const storePath = resolveSessionStorePath(cfg, agentId);
			if (!fs.existsSync(storePath)) return null;
			const raw = fs.readFileSync(storePath, "utf-8");
			return JSON.parse(raw);
		} catch {
			return null;
		}
	} };
}
//#endregion
//#region extensions/qqbot/src/engine/utils/attachment-tags.ts
/** Human-readable labels for transcript provenance (prompt contract). */
const TRANSCRIPT_SOURCE_LABELS = {
	stt: "local STT",
	asr: "platform ASR",
	tts: "TTS source",
	fallback: "fallback text"
};
/**
* Render a list of attachments into an LLM-facing tag string.
*
* Shared grammar (both modes):
*
* ```
* attachment_with_source  := "MEDIA:" SOURCE [voice_suffix]
* voice_suffix            := ' (transcript: "' TEXT '")' [source_suffix]
* attachment_no_source    := "[" TYPE_LABEL [": " FILENAME] [voice_suffix_bare] "]" [source_suffix_bare]
* voice_suffix_bare       := ' (transcript: "' TEXT '")'
* source_suffix           := " [source: " LABEL "]"   ← ref mode only
* source_suffix_bare      := " [source: " LABEL "]"   ← ref mode only
* TYPE_LABEL              := "image" | "voice" | "video" | "file" | "attachment"
* ```
*
* The **only** mode-dependent decoration is the `source_suffix` (present
* in `ref`, absent in `inline`). Every other token is identical.
*/
function renderAttachmentTags(attachments, options) {
	if (!attachments?.length) return options.emptyFallback ?? "";
	const parts = [];
	for (const att of attachments) parts.push(renderOne(att, options.mode));
	const separator = options.separator ?? (options.mode === "ref" ? " " : "\n");
	return parts.join(separator);
}
/**
* Shorthand for `renderAttachmentTags(attachments, { mode: "inline" })`.
*
* Kept as the primary entry point for group history / current-turn
* rendering where the terse inline form is always wanted.
*/
function formatAttachmentTags(attachments) {
	return renderAttachmentTags(attachments, { mode: "inline" });
}
/**
* Render a single attachment.
*
* The function is split into two orthogonal concerns:
*   - `renderBody`: the shared "MEDIA:{source}…" or "[type…]" string.
*   - `renderSourceSuffix`: ref-mode-only `" [source: …]"` tail.
*
* Both consumers produce the same body; only the suffix differs.
*/
function renderOne(att, mode) {
	return renderBody(att) + (mode === "ref" ? renderSourceSuffix(att) : "");
}
/** Shared, mode-agnostic body of the tag. */
function renderBody(att) {
	const source = att.localPath || att.url;
	const voiceSuffix = att.type === "voice" && att.transcript ? ` (transcript: "${att.transcript}")` : "";
	if (source) return `MEDIA:${source}${voiceSuffix}`;
	return `[${labelForType(att.type)}${att.filename ? `: ${att.filename}` : ""}${voiceSuffix}]`;
}
/**
* Ref-mode-only tail that records where a voice transcript came from.
* Empty string when the attachment isn't a transcribed voice message.
*/
function renderSourceSuffix(att) {
	if (att.type !== "voice" || !att.transcript || !att.transcriptSource) return "";
	return ` [source: ${TRANSCRIPT_SOURCE_LABELS[att.transcriptSource] ?? att.transcriptSource}]`;
}
/** Canonical single-word label for each attachment type. */
function labelForType(type) {
	switch (type) {
		case "image": return "image";
		case "voice": return "voice";
		case "video": return "video";
		case "file": return "file";
		default: return "attachment";
	}
}
//#endregion
//#region extensions/qqbot/src/engine/ref/format-ref-entry.ts
/**
* Format a ref-index entry into text suitable for model context.
*
* Delegates all attachment rendering to the shared
* `utils/attachment-tags.ts::renderAttachmentTags` (with `mode: "ref"`)
* so the quoted-message preview and the current-message history use
* identical wording for identical attachment types.
*/
/** Format a ref-index entry into text suitable for model context. */
function formatRefEntryForAgent(entry) {
	const parts = [];
	if (entry.content.trim()) parts.push(entry.content);
	const attachmentTags = renderAttachmentTags(entry.attachments, { mode: "ref" });
	if (attachmentTags) parts.push(attachmentTags);
	return parts.join(" ") || "[empty message]";
}
//#endregion
//#region extensions/qqbot/src/engine/ref/store.ts
/**
* Ref-index store — JSONL file-based store for message reference index.
*
* Migrated from src/ref-index-store.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
const MAX_ENTRIES = 5e4;
const TTL_MS = 10080 * 60 * 1e3;
const COMPACT_THRESHOLD_RATIO = 2;
let cache = null;
let totalLinesOnDisk = 0;
function getRefIndexFile() {
	return path.join(getQQBotDataPath("data"), "ref-index.jsonl");
}
function loadFromFile() {
	if (cache !== null) return cache;
	cache = /* @__PURE__ */ new Map();
	totalLinesOnDisk = 0;
	try {
		const refIndexFile = getRefIndexFile();
		if (!fs.existsSync(refIndexFile)) return cache;
		const lines = fs.readFileSync(refIndexFile, "utf-8").split("\n");
		const now = Date.now();
		let expired = 0;
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			totalLinesOnDisk++;
			try {
				const entry = JSON.parse(trimmed);
				if (!entry.k || !entry.v || !entry.t) continue;
				if (now - entry.t > TTL_MS) {
					expired++;
					continue;
				}
				cache.set(entry.k, {
					...entry.v,
					_createdAt: entry.t
				});
			} catch {}
		}
		debugLog(`[ref-index-store] Loaded ${cache.size} entries from ${totalLinesOnDisk} lines (${expired} expired)`);
		if (shouldCompact()) compactFile();
	} catch (err) {
		debugError(`[ref-index-store] Failed to load: ${formatErrorMessage(err)}`);
		cache = /* @__PURE__ */ new Map();
	}
	return cache;
}
function ensureDir$2() {
	getQQBotDataDir("data");
}
function appendLine(line) {
	try {
		ensureDir$2();
		fs.appendFileSync(getRefIndexFile(), JSON.stringify(line) + "\n", "utf-8");
		totalLinesOnDisk++;
	} catch (err) {
		debugError(`[ref-index-store] Failed to append: ${formatErrorMessage(err)}`);
	}
}
function shouldCompact() {
	return !!cache && totalLinesOnDisk > cache.size * COMPACT_THRESHOLD_RATIO && totalLinesOnDisk > 1e3;
}
function compactFile() {
	if (!cache) return;
	const before = totalLinesOnDisk;
	try {
		ensureDir$2();
		const refIndexFile = getRefIndexFile();
		const tmpPath = refIndexFile + ".tmp";
		const lines = [];
		for (const [key, entry] of cache) lines.push(JSON.stringify({
			k: key,
			v: {
				content: entry.content,
				senderId: entry.senderId,
				senderName: entry.senderName,
				timestamp: entry.timestamp,
				isBot: entry.isBot,
				attachments: entry.attachments
			},
			t: entry._createdAt
		}));
		fs.writeFileSync(tmpPath, lines.join("\n") + "\n", "utf-8");
		fs.renameSync(tmpPath, refIndexFile);
		totalLinesOnDisk = cache.size;
		debugLog(`[ref-index-store] Compacted: ${before} lines → ${totalLinesOnDisk} lines`);
	} catch (err) {
		debugError(`[ref-index-store] Compact failed: ${formatErrorMessage(err)}`);
	}
}
function evictIfNeeded() {
	if (!cache || cache.size < MAX_ENTRIES) return;
	const now = Date.now();
	for (const [key, entry] of cache) if (now - entry._createdAt > TTL_MS) cache.delete(key);
	if (cache.size >= MAX_ENTRIES) {
		const toRemove = [...cache.entries()].toSorted((a, b) => a[1]._createdAt - b[1]._createdAt).slice(0, cache.size - MAX_ENTRIES + 1e3);
		for (const [key] of toRemove) cache.delete(key);
		debugLog(`[ref-index-store] Evicted ${toRemove.length} oldest entries`);
	}
}
/** Persist a refIdx mapping for one message. */
function setRefIndex(refIdx, entry) {
	const store = loadFromFile();
	evictIfNeeded();
	const now = Date.now();
	store.set(refIdx, {
		...entry,
		_createdAt: now
	});
	appendLine({
		k: refIdx,
		v: {
			content: entry.content,
			senderId: entry.senderId,
			senderName: entry.senderName,
			timestamp: entry.timestamp,
			isBot: entry.isBot,
			attachments: entry.attachments
		},
		t: now
	});
	if (shouldCompact()) compactFile();
}
/** Look up one quoted message by refIdx. */
function getRefIndex(refIdx) {
	const store = loadFromFile();
	const entry = store.get(refIdx);
	if (!entry) return null;
	if (Date.now() - entry._createdAt > TTL_MS) {
		store.delete(refIdx);
		return null;
	}
	return {
		content: entry.content,
		senderId: entry.senderId,
		senderName: entry.senderName,
		timestamp: entry.timestamp,
		isBot: entry.isBot,
		attachments: entry.attachments
	};
}
/** Compact the store before process exit when needed. */
function flushRefIndex() {
	if (cache && shouldCompact()) compactFile();
}
//#endregion
//#region extensions/qqbot/src/engine/utils/diagnostics.ts
/**
* Gateway startup diagnostics — extracted from utils/platform.ts.
*
* Depends on utils/platform.ts for detection functions, but no plugin-sdk.
*/
/**
* Run startup diagnostics and return an environment report.
* Called during gateway startup to log environment details and warnings.
*/
async function runDiagnostics() {
	const warnings = [];
	const platform = `${process.platform} (${os$1.release()})`;
	const arch = process.arch;
	const nodeVersion = process.version;
	const homeDir = getHomeDir();
	const tempDir = getTempDir();
	const dataDir = getQQBotDataDir();
	const ffmpegPath = await detectFfmpeg();
	if (!ffmpegPath) warnings.push(isWindows() ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with choco install ffmpeg, scoop install ffmpeg, or from https://ffmpeg.org." : getPlatform() === "darwin" ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with brew install ffmpeg." : "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with sudo apt install ffmpeg or sudo yum install ffmpeg.");
	const silkWasm = await checkSilkWasmAvailable();
	if (!silkWasm) warnings.push("⚠️ silk-wasm is unavailable. QQ voice send/receive will not work. Ensure Node.js >= 16 and WASM support are available.");
	try {
		const testFile = path$1.join(dataDir, ".write-test");
		fs$1.writeFileSync(testFile, "test");
		fs$1.unlinkSync(testFile);
	} catch {
		warnings.push(`⚠️ Data directory is not writable: ${dataDir}. Check filesystem permissions.`);
	}
	if (isWindows()) {
		if (/[\u4e00-\u9fa5]/.test(homeDir) || homeDir.includes(" ")) warnings.push(`⚠️ Home directory contains Chinese characters or spaces: ${homeDir}. Some tools may fail. Consider setting QQBOT_DATA_DIR to an ASCII-only path.`);
	}
	const report = {
		platform,
		arch,
		nodeVersion,
		homeDir,
		tempDir,
		dataDir,
		ffmpeg: ffmpegPath,
		silkWasm,
		warnings
	};
	debugLog("=== QQBot Environment Diagnostics ===");
	debugLog(`  Platform: ${platform} (${arch})`);
	debugLog(`  Node: ${nodeVersion}`);
	debugLog(`  Home: ${homeDir}`);
	debugLog(`  Data dir: ${dataDir}`);
	debugLog(`  ffmpeg: ${ffmpegPath ?? "not installed"}`);
	debugLog(`  silk-wasm: ${silkWasm ? "available" : "unavailable"}`);
	if (warnings.length > 0) {
		debugLog("  --- Warnings ---");
		for (const w of warnings) debugLog(`  ${w}`);
	}
	debugLog("======================");
	return report;
}
//#endregion
//#region extensions/qqbot/src/engine/commands/slash-command-handler.ts
const URGENT_COMMANDS = ["/stop"];
/**
* Check if the message is a slash command and handle it.
*
* @returns `true` if handled (command executed or enqueued as urgent),
*          `false` if the message should be queued for normal processing.
*/
async function trySlashCommand(msg, ctx) {
	const { account, log } = ctx;
	const content = (msg.content ?? "").trim();
	if (!content.startsWith("/")) return "enqueue";
	const contentLower = content.toLowerCase();
	if (URGENT_COMMANDS.some((cmd) => contentLower === cmd.toLowerCase() || contentLower.startsWith(cmd.toLowerCase() + " "))) {
		log?.info(`Urgent command detected: ${content.slice(0, 20)}`);
		return "urgent";
	}
	const receivedAt = Date.now();
	const peerId = ctx.getMessagePeerId(msg);
	const cmdCtx = {
		type: msg.type,
		senderId: msg.senderId,
		senderName: msg.senderName,
		messageId: msg.messageId,
		eventTimestamp: msg.timestamp,
		receivedAt,
		rawContent: content,
		args: "",
		channelId: msg.channelId,
		groupOpenid: msg.groupOpenid,
		accountId: account.accountId,
		appId: account.appId,
		accountConfig: account.config,
		commandAuthorized: true,
		queueSnapshot: ctx.getQueueSnapshot(peerId)
	};
	try {
		const reply = await matchSlashCommand(cmdCtx);
		if (reply === null) return "enqueue";
		log?.debug?.(`Slash command matched: ${content}`);
		const isFileResult = typeof reply === "object" && reply !== null && "filePath" in reply;
		const replyText = isFileResult ? reply.text : reply;
		const replyFile = isFileResult ? reply.filePath : null;
		if (msg.type === "c2c" || msg.type === "group" || msg.type === "dm" || msg.type === "guild") await sendText(buildDeliveryTarget(msg), replyText, accountToCreds(account), { msgId: msg.messageId });
		if (replyFile) try {
			await sendDocument({
				targetType: msg.type === "group" ? "group" : msg.type === "dm" ? "dm" : msg.type === "c2c" ? "c2c" : "channel",
				targetId: msg.type === "group" ? msg.groupOpenid || msg.senderId : msg.type === "dm" ? msg.guildId || msg.senderId : msg.type === "c2c" ? msg.senderId : msg.channelId || msg.senderId,
				account,
				replyToId: msg.messageId
			}, replyFile);
		} catch (fileErr) {
			log?.error(`Failed to send slash command file: ${String(fileErr)}`);
		}
		return "handled";
	} catch (err) {
		log?.error(`Slash command error: ${String(err)}`);
		return "enqueue";
	}
}
//#endregion
//#region extensions/qqbot/src/engine/session/known-users.ts
/**
* Known user tracking — JSON file-based store.
*
* Migrated from src/known-users.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
let usersCache = null;
const SAVE_THROTTLE_MS$1 = 5e3;
let saveTimer = null;
let isDirty = false;
function ensureDir$1() {
	getQQBotDataDir("data");
}
function getKnownUsersFile() {
	return path.join(getQQBotDataPath("data"), "known-users.json");
}
function makeUserKey(user) {
	const base = `${user.accountId}:${user.type}:${user.openid}`;
	return user.type === "group" && user.groupOpenid ? `${base}:${user.groupOpenid}` : base;
}
function loadUsersFromFile() {
	if (usersCache !== null) return usersCache;
	usersCache = /* @__PURE__ */ new Map();
	try {
		const knownUsersFile = getKnownUsersFile();
		if (fs.existsSync(knownUsersFile)) {
			const data = fs.readFileSync(knownUsersFile, "utf-8");
			const users = JSON.parse(data);
			for (const user of users) usersCache.set(makeUserKey(user), user);
			debugLog(`[known-users] Loaded ${usersCache.size} users`);
		}
	} catch (err) {
		debugError(`[known-users] Failed to load users: ${formatErrorMessage(err)}`);
		usersCache = /* @__PURE__ */ new Map();
	}
	return usersCache;
}
function saveUsersToFile() {
	if (!isDirty || saveTimer) return;
	saveTimer = setTimeout(() => {
		saveTimer = null;
		doSaveUsersToFile();
	}, SAVE_THROTTLE_MS$1);
}
function doSaveUsersToFile() {
	if (!usersCache || !isDirty) return;
	try {
		ensureDir$1();
		fs.writeFileSync(getKnownUsersFile(), JSON.stringify(Array.from(usersCache.values()), null, 2), "utf-8");
		isDirty = false;
	} catch (err) {
		debugError(`[known-users] Failed to save users: ${formatErrorMessage(err)}`);
	}
}
/** Flush pending writes immediately, typically during shutdown. */
function flushKnownUsers() {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	doSaveUsersToFile();
}
/** Record a known user whenever a message is received. */
function recordKnownUser(user) {
	const cache = loadUsersFromFile();
	const key = makeUserKey(user);
	const now = Date.now();
	const existing = cache.get(key);
	if (existing) {
		existing.lastSeenAt = now;
		existing.interactionCount++;
		if (user.nickname && user.nickname !== existing.nickname) existing.nickname = user.nickname;
	} else {
		cache.set(key, {
			openid: user.openid,
			type: user.type,
			nickname: user.nickname,
			groupOpenid: user.groupOpenid,
			accountId: user.accountId,
			firstSeenAt: now,
			lastSeenAt: now,
			interactionCount: 1
		});
		debugLog(`[known-users] New user: ${user.openid} (${user.type})`);
	}
	isDirty = true;
	saveUsersToFile();
}
//#endregion
//#region extensions/qqbot/src/engine/session/session-store.ts
/**
* Gateway session persistence — JSONL file-based store.
*
* Migrated from src/session-store.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
const SESSION_EXPIRE_TIME = 300 * 1e3;
const SAVE_THROTTLE_MS = 1e3;
const throttleState = /* @__PURE__ */ new Map();
function ensureDir() {
	getQQBotDataDir("sessions");
}
function getSessionDir() {
	return getQQBotDataPath("sessions");
}
function encodeAccountIdForFileName(accountId) {
	return Buffer.from(accountId, "utf8").toString("base64url");
}
function getLegacySessionPath(accountId) {
	const safeId = accountId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(getSessionDir(), `session-${safeId}.json`);
}
function getSessionPath(accountId) {
	const encodedId = encodeAccountIdForFileName(accountId);
	return path.join(getSessionDir(), `session-${encodedId}.json`);
}
function getCandidateSessionPaths(accountId) {
	const primaryPath = getSessionPath(accountId);
	const legacyPath = getLegacySessionPath(accountId);
	return primaryPath === legacyPath ? [primaryPath] : [primaryPath, legacyPath];
}
/** Load a saved session, rejecting expired or mismatched appId entries. */
function loadSession(accountId, expectedAppId) {
	try {
		let filePath = null;
		for (const candidatePath of getCandidateSessionPaths(accountId)) if (fs.existsSync(candidatePath)) {
			filePath = candidatePath;
			break;
		}
		if (!filePath) return null;
		const data = fs.readFileSync(filePath, "utf-8");
		const state = JSON.parse(data);
		const now = Date.now();
		if (now - state.savedAt > SESSION_EXPIRE_TIME) {
			debugLog(`[session-store] Session expired for ${accountId}, age: ${Math.round((now - state.savedAt) / 1e3)}s`);
			try {
				fs.unlinkSync(filePath);
			} catch {}
			return null;
		}
		if (expectedAppId && state.appId && state.appId !== expectedAppId) {
			debugLog(`[session-store] appId mismatch for ${accountId}: saved=${state.appId}, current=${expectedAppId}. Discarding stale session.`);
			try {
				fs.unlinkSync(filePath);
			} catch {}
			return null;
		}
		if (!state.sessionId || state.lastSeq === null || state.lastSeq === void 0) {
			debugLog(`[session-store] Invalid session data for ${accountId}`);
			return null;
		}
		debugLog(`[session-store] Loaded session for ${accountId}: sessionId=${state.sessionId}, lastSeq=${state.lastSeq}, appId=${state.appId ?? "unknown"}, age=${Math.round((now - state.savedAt) / 1e3)}s`);
		return state;
	} catch (err) {
		debugError(`[session-store] Failed to load session for ${accountId}: ${formatErrorMessage(err)}`);
		return null;
	}
}
/** Save session state with throttling. */
function saveSession(state) {
	const { accountId } = state;
	let throttle = throttleState.get(accountId);
	if (!throttle) {
		throttle = {
			pendingState: null,
			lastSaveTime: 0,
			throttleTimer: null
		};
		throttleState.set(accountId, throttle);
	}
	const now = Date.now();
	const timeSinceLastSave = now - throttle.lastSaveTime;
	if (timeSinceLastSave >= SAVE_THROTTLE_MS) {
		doSaveSession(state);
		throttle.lastSaveTime = now;
		throttle.pendingState = null;
		if (throttle.throttleTimer) {
			clearTimeout(throttle.throttleTimer);
			throttle.throttleTimer = null;
		}
	} else {
		throttle.pendingState = state;
		if (!throttle.throttleTimer) {
			const delay = SAVE_THROTTLE_MS - timeSinceLastSave;
			throttle.throttleTimer = setTimeout(() => {
				const t = throttleState.get(accountId);
				if (t?.pendingState) {
					doSaveSession(t.pendingState);
					t.lastSaveTime = Date.now();
					t.pendingState = null;
				}
				if (t) t.throttleTimer = null;
			}, delay);
		}
	}
}
function doSaveSession(state) {
	const filePath = getSessionPath(state.accountId);
	const legacyPath = getLegacySessionPath(state.accountId);
	try {
		ensureDir();
		const stateToSave = {
			...state,
			savedAt: Date.now()
		};
		fs.writeFileSync(filePath, JSON.stringify(stateToSave, null, 2), "utf-8");
		if (legacyPath !== filePath && fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
		debugLog(`[session-store] Saved session for ${state.accountId}: sessionId=${state.sessionId}, lastSeq=${state.lastSeq}`);
	} catch (err) {
		debugError(`[session-store] Failed to save session for ${state.accountId}: ${formatErrorMessage(err)}`);
	}
}
/** Clear a saved session and any pending throttle state. */
function clearSession(accountId) {
	const throttle = throttleState.get(accountId);
	if (throttle) {
		if (throttle.throttleTimer) clearTimeout(throttle.throttleTimer);
		throttleState.delete(accountId);
	}
	try {
		let cleared = false;
		for (const filePath of getCandidateSessionPaths(accountId)) if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			cleared = true;
		}
		if (cleared) debugLog(`[session-store] Cleared session for ${accountId}`);
	} catch (err) {
		debugError(`[session-store] Failed to clear session for ${accountId}: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/codec.ts
/**
* Gateway message decoding utilities.
*
* Extracted from `gateway.ts` — handles the various data formats that
* the QQ Bot WebSocket can deliver (string, Buffer, Buffer[], ArrayBuffer).
*
* Zero external dependencies beyond Node.js built-ins.
*/
/**
* Decode raw WebSocket `data` into a UTF-8 string.
*
* The QQ Bot gateway can send data as a plain string, a single Buffer,
* an array of Buffer chunks, an ArrayBuffer, or a typed array view.
*/
function decodeGatewayMessageData(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (Array.isArray(data) && data.every((chunk) => Buffer.isBuffer(chunk))) return Buffer.concat(data).toString("utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
	return "";
}
/**
* Read the optional `message_scene.ext` array from an event payload.
*
* Guild, C2C, and Group events may carry a `message_scene` object
* with an `ext` string array used for ref-index parsing.
*/
function readOptionalMessageSceneExt(event) {
	if (!("message_scene" in event)) return;
	return event.message_scene?.ext;
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/constants.ts
/**
* QQ Bot WebSocket Gateway protocol constants.
*
* Extracted from `gateway.ts` to share between both plugin versions.
* Zero external dependencies.
*/
/** QQ Bot WebSocket intents grouped by permission level. */
const INTENTS = {
	GUILDS: 1,
	GUILD_MEMBERS: 2,
	PUBLIC_GUILD_MESSAGES: 1 << 30,
	DIRECT_MESSAGE: 4096,
	GROUP_AND_C2C: 1 << 25,
	/** Button interaction callbacks (INTERACTION_CREATE). */
	INTERACTION: 1 << 26
};
/** Full intent mask: groups + DMs + channels + interaction. */
const FULL_INTENTS = INTENTS.PUBLIC_GUILD_MESSAGES | INTENTS.DIRECT_MESSAGE | INTENTS.GROUP_AND_C2C | INTENTS.INTERACTION;
/** Exponential backoff delays for reconnection attempts (ms). */
const RECONNECT_DELAYS = [
	1e3,
	2e3,
	5e3,
	1e4,
	3e4,
	6e4
];
/** Delay after receiving a rate-limit close code (ms). */
const RATE_LIMIT_DELAY = 6e4;
/** Gateway opcodes used by the QQ Bot WebSocket protocol. */
const GatewayOp = {
	/** Server → Client: Dispatch event (type + data). */
	DISPATCH: 0,
	/** Client → Server: Heartbeat. */
	HEARTBEAT: 1,
	/** Client → Server: Identify (initial auth). */
	IDENTIFY: 2,
	/** Client → Server: Resume a dropped session. */
	RESUME: 6,
	/** Server → Client: Request client to reconnect. */
	RECONNECT: 7,
	/** Server → Client: Invalid session. */
	INVALID_SESSION: 9,
	/** Server → Client: Hello (heartbeat interval). */
	HELLO: 10,
	/** Server → Client: Heartbeat ACK. */
	HEARTBEAT_ACK: 11
};
/** WebSocket close codes used by the QQ Gateway. */
const GatewayCloseCode = {
	/** Normal closure — do not reconnect. */
	NORMAL: 1e3,
	/** Authentication failed — refresh token then reconnect. */
	AUTH_FAILED: 4004,
	/** Session invalid — clear session, refresh token, reconnect. */
	INVALID_SESSION: 4006,
	/** Sequence number out of range — clear session, refresh token, reconnect. */
	SEQ_OUT_OF_RANGE: 4007,
	/** Rate limited — wait before reconnecting. */
	RATE_LIMITED: 4008,
	/** Session timed out — clear session, refresh token, reconnect. */
	SESSION_TIMEOUT: 4009,
	/** Server internal error (range start) — clear session, refresh token, reconnect. */
	SERVER_ERROR_START: 4900,
	/** Server internal error (range end). */
	SERVER_ERROR_END: 4913,
	/** Insufficient intents — fatal, do not reconnect. */
	INSUFFICIENT_INTENTS: 4914,
	/** Disallowed intents — fatal, do not reconnect. */
	DISALLOWED_INTENTS: 4915
};
/** Event type strings dispatched under opcode 0 (DISPATCH). */
const GatewayEvent = {
	READY: "READY",
	RESUMED: "RESUMED",
	C2C_MESSAGE_CREATE: "C2C_MESSAGE_CREATE",
	AT_MESSAGE_CREATE: "AT_MESSAGE_CREATE",
	DIRECT_MESSAGE_CREATE: "DIRECT_MESSAGE_CREATE",
	/** Group message that explicitly @-mentions the bot. */
	GROUP_AT_MESSAGE_CREATE: "GROUP_AT_MESSAGE_CREATE",
	/**
	* Group message that does NOT mention the bot. Still dispatched to the
	* pipeline so the group history buffer and the `requireMention=false`
	* path can observe it.
	*/
	GROUP_MESSAGE_CREATE: "GROUP_MESSAGE_CREATE",
	INTERACTION_CREATE: "INTERACTION_CREATE"
};
/** Interaction sub-types carried in `InteractionEvent.data.type`. */
const InteractionType = {
	/** Remote config query — bot reports its current claw_cfg snapshot. */
	CONFIG_QUERY: 2001,
	/** Remote config update — caller pushes new settings. */
	CONFIG_UPDATE: 2002
};
//#endregion
//#region extensions/qqbot/src/engine/utils/text-parsing.ts
const INTERNAL_MARKER_RE = /\[internal:?\s*[^\]]*\]|\[debug:?\s*[^\]]*\]|\[system:?\s*[^\]]*\]/gi;
/** Remove internal markers like `[internal:...]`, `[debug:...]`, `[system:...]`. */
function filterInternalMarkers(text) {
	if (!text) return "";
	return text.replace(INTERNAL_MARKER_RE, "").trim();
}
/**
* Parse message_scene.ext to extract refMsgIdx and msgIdx.
*
* Supports both ext prefix formats:
* - `ref_msg_idx=` / `msg_idx=` (platform native format)
* - `refMsgIdx:` / `msgIdx:` (legacy internal format)
*
* When `messageType` equals `MSG_TYPE_QUOTE` (103) and `msgElements` is
* provided, `msgElements[0].msg_idx` takes precedence over the ext-parsed
* `refMsgIdx` value — the element-level index is more authoritative for
* quote messages.
*/
function parseRefIndices(ext, messageType, msgElements) {
	let refMsgIdx;
	let msgIdx;
	if (ext && ext.length > 0) for (const item of ext) {
		if (typeof item !== "string") continue;
		if (item.startsWith("ref_msg_idx=")) refMsgIdx = item.slice(12).trim();
		else if (item.startsWith("msg_idx=")) msgIdx = item.slice(8).trim();
		else if (item.startsWith("refMsgIdx:")) refMsgIdx = item.slice(10).trim();
		else if (item.startsWith("msgIdx:")) msgIdx = item.slice(7).trim();
	}
	if (messageType === 103) {
		const refElement = msgElements?.[0];
		if (refElement?.msg_idx) refMsgIdx = refElement.msg_idx;
	}
	return {
		refMsgIdx,
		msgIdx
	};
}
const MAX_FACE_EXT_BYTES = 64 * 1024;
/** Estimate Base64 decoded byte size (replaces plugin-sdk estimateBase64DecodedBytes). */
function estimateBase64Size(base64) {
	const len = base64.length;
	const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
	return Math.ceil(len * 3 / 4) - padding;
}
/** Replace QQ face tags with readable text labels. */
function parseFaceTags(text) {
	if (!text) return "";
	return text.replace(/<faceType=\d+,faceId="[^"]*",ext="([^"]*)">/g, (_match, ext) => {
		try {
			if (estimateBase64Size(ext) > MAX_FACE_EXT_BYTES) return "[Emoji: unknown emoji]";
			const decoded = Buffer.from(ext, "base64").toString("utf-8");
			return `[Emoji: ${JSON.parse(decoded).text || "unknown emoji"}]`;
		} catch {
			return _match;
		}
	});
}
/** Lowercase a string safely (replaces plugin-sdk normalizeLowercaseStringOrEmpty). */
function lc(s) {
	return (s ?? "").toLowerCase();
}
/** Build attachment summaries for ref-index caching. */
function buildAttachmentSummaries(attachments, localPaths) {
	if (!attachments || attachments.length === 0) return;
	return attachments.map((att, idx) => {
		const ct = lc(att.content_type);
		let type = "unknown";
		if (ct.startsWith("image/")) type = "image";
		else if (ct === "voice" || ct.startsWith("audio/") || ct.includes("silk") || ct.includes("amr")) type = "voice";
		else if (ct.startsWith("video/")) type = "video";
		else if (ct.startsWith("application/") || ct.startsWith("text/")) type = "file";
		return {
			type,
			filename: att.filename,
			contentType: att.content_type,
			localPath: localPaths?.[idx] ?? void 0
		};
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/event-dispatcher.ts
/**
* Event dispatcher — convert raw WebSocket op=0 events into QueuedMessage objects.
*
* Pure mapping logic with zero side effects (except known-user recording).
* Independently testable.
*/
/**
* Map a raw op=0 event into a structured dispatch result.
*
* Returns "message" for events that should be queued for processing,
* "ready"/"resumed" for session lifecycle events, and "ignore" otherwise.
*/
function dispatchEvent(eventType, data, accountId, _log) {
	if (eventType === GatewayEvent.READY) return {
		action: "ready",
		data,
		sessionId: data.session_id
	};
	if (eventType === GatewayEvent.RESUMED) return {
		action: "resumed",
		data
	};
	if (eventType === GatewayEvent.C2C_MESSAGE_CREATE) {
		const ev = data;
		recordKnownUser({
			openid: ev.author.user_openid,
			type: "c2c",
			accountId
		});
		const refs = parseRefIndices(ev.message_scene?.ext, ev.message_type, ev.msg_elements);
		return {
			action: "message",
			msg: {
				type: "c2c",
				senderId: ev.author.user_openid,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx,
				msgType: ev.message_type,
				msgElements: ev.msg_elements
			}
		};
	}
	if (eventType === GatewayEvent.AT_MESSAGE_CREATE) {
		const ev = data;
		const refs = parseRefIndices(readOptionalMessageSceneExt(ev));
		return {
			action: "message",
			msg: {
				type: "guild",
				senderId: ev.author.id,
				senderName: ev.author.username,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				channelId: ev.channel_id,
				guildId: ev.guild_id,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx
			}
		};
	}
	if (eventType === GatewayEvent.DIRECT_MESSAGE_CREATE) {
		const ev = data;
		const refs = parseRefIndices(readOptionalMessageSceneExt(ev));
		return {
			action: "message",
			msg: {
				type: "dm",
				senderId: ev.author.id,
				senderName: ev.author.username,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				guildId: ev.guild_id,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx
			}
		};
	}
	if (eventType === GatewayEvent.GROUP_AT_MESSAGE_CREATE) return {
		action: "message",
		msg: buildGroupQueuedMessage(data, accountId, eventType)
	};
	if (eventType === GatewayEvent.GROUP_MESSAGE_CREATE) return {
		action: "message",
		msg: buildGroupQueuedMessage(data, accountId, eventType)
	};
	if (eventType === GatewayEvent.INTERACTION_CREATE) return {
		action: "interaction",
		event: data
	};
	return { action: "ignore" };
}
/**
* Build a {@link QueuedMessage} from a raw QQ group event payload.
*
* Used for both `GROUP_AT_MESSAGE_CREATE` (bot was @-ed) and
* `GROUP_MESSAGE_CREATE` (non-@ background chatter). The only difference
* between the two is the carried `eventType` — downstream gating uses
* that to decide whether to treat the message as a bot-directed turn.
*/
function buildGroupQueuedMessage(data, accountId, eventType) {
	const ev = data;
	recordKnownUser({
		openid: ev.author.member_openid,
		type: "group",
		groupOpenid: ev.group_openid,
		accountId
	});
	const refs = parseRefIndices(ev.message_scene?.ext, ev.message_type, ev.msg_elements);
	return {
		type: "group",
		senderId: ev.author.member_openid,
		senderName: ev.author.username,
		senderIsBot: ev.author.bot,
		content: ev.content,
		messageId: ev.id,
		timestamp: ev.timestamp,
		groupOpenid: ev.group_openid,
		attachments: ev.attachments,
		refMsgIdx: refs.refMsgIdx,
		msgIdx: refs.msgIdx,
		msgType: ev.message_type,
		msgElements: ev.msg_elements,
		eventType,
		mentions: ev.mentions,
		messageScene: ev.message_scene
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/message-queue.ts
/**
* Per-user concurrent message queue.
*
* Messages are serialized per **peer** (one DM user, one group, one guild
* channel) and processed in parallel across peers up to
* {@link DEFAULT_MAX_CONCURRENT_USERS}.
*
* Group-specific enhancements (added when merging from the standalone build):
*   - Group peers have a larger queue cap ({@link DEFAULT_GROUP_QUEUE_SIZE})
*     because groups can burst more chatter than a single DM.
*   - When a group's queue overflows, bot-authored messages are evicted
*     preferentially so human messages don't get dropped.
*   - When draining a group peer with more than one queued message, the
*     non-command messages are **merged** into one logical turn (see
*     {@link mergeGroupMessages}). Slash commands are always processed
*     individually to avoid conflating a "/stop" with surrounding chatter.
*
* The module is self-contained: the only injected dependency is the
* logger / abort probe supplied via {@link MessageQueueContext}.
*/
/** Global cap across all peers. */
const DEFAULT_GLOBAL_QUEUE_SIZE = 1e3;
/** Per-DM / per-channel cap. */
const DEFAULT_PER_PEER_QUEUE_SIZE = 20;
/** Per-group cap — larger because groups burst more. */
const DEFAULT_GROUP_QUEUE_SIZE = 50;
/** Parallel fanout across peers. */
const DEFAULT_MAX_CONCURRENT_USERS = 10;
/** Convenience predicate: is this a merged multi-message turn? */
function isMergedTurn(msg) {
	return (msg.merge?.count ?? 0) > 1;
}
/** Return true when the peer id refers to a group-like conversation. */
function isGroupPeer(peerId) {
	return peerId.startsWith("group:") || peerId.startsWith("guild:");
}
/** Slash-command test used by {@link drainGroupBatch}. */
function isSlashCommand(msg) {
	return (msg.content ?? "").trim().startsWith("/");
}
/**
* Merge several queued group messages into one representative message.
*
* Merge semantics:
*   - `content` is joined with newlines; each line prefixed with `[sender]`
*     so the downstream formatter can attribute speakers.
*   - `attachments` is concatenated.
*   - `mentions` is deduplicated by member/user openid; if *any* source
*     message was a `GROUP_AT_MESSAGE_CREATE`, the merged result inherits
*     that eventType (the merged turn effectively @-s the bot).
*   - `messageId`, `msgIdx`, `timestamp` come from the last message — the
*     most recent identity is what the outbound reply should quote.
*   - `refMsgIdx` (the message that the user quoted) comes from the FIRST
*     message in the batch because the first quote anchors the topic.
*   - `senderIsBot` is true only when every source message was authored
*     by a bot. Any human participation flips the flag.
*
* A single-message batch is returned unchanged (no merge overhead).
*/
function mergeGroupMessages(batch) {
	if (batch.length === 0) throw new Error("mergeGroupMessages: empty batch");
	if (batch.length === 1) return batch[0];
	const first = batch[0];
	const last = batch[batch.length - 1];
	const mergedContent = batch.map((m) => `[${m.senderName ?? m.senderId}]: ${m.content}`).join("\n");
	const mergedAttachments = [];
	for (const m of batch) if (m.attachments?.length) mergedAttachments.push(...m.attachments);
	const seenMentionIds = /* @__PURE__ */ new Set();
	const mergedMentions = [];
	let anyAtYouEvent = false;
	for (const m of batch) {
		if (m.eventType === "GROUP_AT_MESSAGE_CREATE") anyAtYouEvent = true;
		if (m.mentions) for (const mt of m.mentions) {
			const key = mt.member_openid ?? mt.id ?? mt.user_openid ?? "";
			if (key && seenMentionIds.has(key)) continue;
			if (key) seenMentionIds.add(key);
			mergedMentions.push(mt);
		}
	}
	const allFromBot = batch.every((m) => m.senderIsBot);
	return {
		type: last.type,
		senderId: last.senderId,
		senderName: last.senderName,
		senderIsBot: allFromBot,
		content: mergedContent,
		messageId: last.messageId,
		timestamp: last.timestamp,
		channelId: last.channelId,
		guildId: last.guildId,
		groupOpenid: last.groupOpenid,
		attachments: mergedAttachments.length > 0 ? mergedAttachments : void 0,
		refMsgIdx: first.refMsgIdx,
		msgIdx: last.msgIdx,
		eventType: anyAtYouEvent ? "GROUP_AT_MESSAGE_CREATE" : last.eventType,
		mentions: mergedMentions.length > 0 ? mergedMentions : void 0,
		messageScene: last.messageScene,
		merge: {
			count: batch.length,
			messages: batch
		}
	};
}
/**
* Create a per-user concurrent queue with built-in group enhancements.
*/
function createMessageQueue(ctx) {
	const { accountId: _accountId, log } = ctx;
	const globalQueueSize = ctx.globalQueueSize ?? DEFAULT_GLOBAL_QUEUE_SIZE;
	const peerQueueSize = ctx.peerQueueSize ?? DEFAULT_PER_PEER_QUEUE_SIZE;
	const groupQueueSize = ctx.groupQueueSize ?? DEFAULT_GROUP_QUEUE_SIZE;
	const maxConcurrentUsers = ctx.maxConcurrentUsers ?? DEFAULT_MAX_CONCURRENT_USERS;
	const userQueues = /* @__PURE__ */ new Map();
	const activeUsers = /* @__PURE__ */ new Set();
	let handleMessageFnRef = null;
	let totalEnqueued = 0;
	const getMessagePeerId = (msg) => {
		if (msg.type === "guild") return `guild:${msg.channelId ?? "unknown"}`;
		if (msg.type === "group") return `group:${msg.groupOpenid ?? "unknown"}`;
		return `dm:${msg.senderId}`;
	};
	/**
	* Evict one message from an over-full queue.
	*
	* For group peers we prefer to drop a bot-authored message so human
	* input never gets lost. Falling back to dropping the oldest keeps the
	* queue bounded when all members are bots.
	*/
	const evictOne = (queue, isGroup) => {
		if (isGroup) {
			const botIdx = queue.findIndex((m) => m.senderIsBot);
			if (botIdx >= 0) return queue.splice(botIdx, 1)[0];
		}
		return queue.shift();
	};
	/** Run a single message, capturing errors in the log. */
	const processOne = async (msg, peerId, label) => {
		try {
			await handleMessageFnRef(msg);
		} catch (err) {
			log?.error(`${label} error for ${peerId}: ${formatErrorMessage(err)}`);
		}
	};
	/**
	* Drain a group's batch:
	*   - slash commands are processed one by one (order preserved);
	*   - the remaining messages are merged into a single turn.
	*/
	const drainGroupBatch = async (batch, peerId) => {
		const commands = [];
		const normal = [];
		for (const m of batch) if (isSlashCommand(m)) commands.push(m);
		else normal.push(m);
		for (const cmd of commands) {
			log?.debug?.(`Processing command independently for ${peerId}: ${(cmd.content ?? "").trim().slice(0, 50)}`);
			await processOne(cmd, peerId, "Command processor");
		}
		if (normal.length > 0) {
			const merged = mergeGroupMessages(normal);
			if (normal.length > 1) log?.debug?.(`Merged ${normal.length} queued group messages for ${peerId} into one`);
			await processOne(merged, peerId, `Message processor (merged batch of ${normal.length})`);
		}
	};
	/** Process one peer's queue serially. */
	const drainUserQueue = async (peerId) => {
		if (activeUsers.has(peerId)) return;
		if (activeUsers.size >= maxConcurrentUsers) {
			log?.debug?.(`Max concurrent users (${maxConcurrentUsers}) reached, ${peerId} will wait`);
			return;
		}
		const queue = userQueues.get(peerId);
		if (!queue || queue.length === 0) {
			userQueues.delete(peerId);
			return;
		}
		activeUsers.add(peerId);
		const isGroup = isGroupPeer(peerId);
		try {
			while (queue.length > 0 && !ctx.isAborted()) {
				if (isGroup && queue.length > 1 && handleMessageFnRef) {
					const batch = queue.splice(0);
					totalEnqueued = Math.max(0, totalEnqueued - batch.length);
					await drainGroupBatch(batch, peerId);
					continue;
				}
				const msg = queue.shift();
				totalEnqueued = Math.max(0, totalEnqueued - 1);
				if (handleMessageFnRef) await processOne(msg, peerId, "Message processor");
			}
		} finally {
			activeUsers.delete(peerId);
			userQueues.delete(peerId);
			for (const [waitingPeerId, waitingQueue] of userQueues) {
				if (activeUsers.size >= maxConcurrentUsers) break;
				if (waitingQueue.length > 0 && !activeUsers.has(waitingPeerId)) drainUserQueue(waitingPeerId);
			}
		}
	};
	const enqueue = (msg) => {
		const peerId = getMessagePeerId(msg);
		const isGroup = isGroupPeer(peerId);
		let queue = userQueues.get(peerId);
		if (!queue) {
			queue = [];
			userQueues.set(peerId, queue);
		}
		const maxSize = isGroup ? groupQueueSize : peerQueueSize;
		if (queue.length >= maxSize) {
			const dropped = evictOne(queue, isGroup);
			totalEnqueued = Math.max(0, totalEnqueued - 1);
			if (isGroup && dropped?.senderIsBot) log?.info(`Queue full for ${peerId}, dropping bot message ${dropped.messageId}`, {
				accountId: ctx.accountId,
				peerId,
				droppedMessageId: dropped.messageId,
				reason: "queue_full_evict_bot"
			});
			else log?.error(`Queue full for ${peerId}, dropping oldest message ${dropped?.messageId}`, {
				accountId: ctx.accountId,
				peerId,
				droppedMessageId: dropped?.messageId,
				reason: "queue_full_evict_oldest"
			});
		}
		totalEnqueued++;
		if (totalEnqueued > globalQueueSize) log?.error(`Global queue limit reached (${totalEnqueued}), message from ${peerId} may be delayed`, {
			accountId: ctx.accountId,
			peerId,
			totalEnqueued,
			globalQueueSize
		});
		queue.push(msg);
		log?.debug?.(`Message enqueued for ${peerId}, user queue: ${queue.length}, active users: ${activeUsers.size}`);
		drainUserQueue(peerId);
	};
	const startProcessor = (handleMessageFn) => {
		handleMessageFnRef = handleMessageFn;
		log?.debug?.(`Message processor started (per-user concurrency, max ${maxConcurrentUsers} users)`);
	};
	const getSnapshot = (senderPeerId) => {
		let totalPending = 0;
		for (const [, q] of userQueues) totalPending += q.length;
		const senderQueue = userQueues.get(senderPeerId);
		return {
			totalPending,
			activeUsers: activeUsers.size,
			maxConcurrentUsers,
			senderPending: senderQueue ? senderQueue.length : 0
		};
	};
	const clearUserQueue = (peerId) => {
		const queue = userQueues.get(peerId);
		if (!queue || queue.length === 0) return 0;
		const droppedCount = queue.length;
		queue.length = 0;
		totalEnqueued = Math.max(0, totalEnqueued - droppedCount);
		return droppedCount;
	};
	const executeImmediate = (msg) => {
		if (handleMessageFnRef) handleMessageFnRef(msg).catch((err) => {
			log?.error(`Immediate execution error: ${err}`);
		});
	};
	return {
		enqueue,
		startProcessor,
		getSnapshot,
		getMessagePeerId,
		clearUserQueue,
		executeImmediate
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/reconnect.ts
/**
* Reconnection state machine.
*
* Usage:
* ```ts
* const rs = new ReconnectState('account-1', log);
* // On successful connect:
* rs.onConnected();
* // On close:
* const action = rs.handleClose(code);
* if (action.shouldReconnect) {
*   const delay = rs.getNextDelay(action.reconnectDelay);
*   setTimeout(connect, delay);
* }
* ```
*/
var ReconnectState = class {
	constructor(accountId, log) {
		this.accountId = accountId;
		this.log = log;
		this.attempts = 0;
		this.lastConnectTime = 0;
		this.quickDisconnectCount = 0;
	}
	/** Call when a WebSocket connection is successfully established. */
	onConnected() {
		this.attempts = 0;
		this.lastConnectTime = Date.now();
	}
	/** Whether reconnection attempts are exhausted. */
	isExhausted() {
		return this.attempts >= 100;
	}
	/**
	* Compute the next reconnect delay and increment the attempt counter.
	*
	* @param customDelay Override from `CloseAction.reconnectDelay`.
	* @returns Delay in milliseconds.
	*/
	getNextDelay(customDelay) {
		const delay = customDelay ?? RECONNECT_DELAYS[Math.min(this.attempts, RECONNECT_DELAYS.length - 1)];
		this.attempts++;
		this.log?.debug?.(`Reconnecting in ${delay}ms (attempt ${this.attempts})`);
		return delay;
	}
	/**
	* Interpret a WebSocket close code and return the appropriate action.
	*/
	handleClose(code, isAborted) {
		if (code === GatewayCloseCode.INSUFFICIENT_INTENTS || code === GatewayCloseCode.DISALLOWED_INTENTS) {
			const reason = code === GatewayCloseCode.INSUFFICIENT_INTENTS ? "offline/sandbox-only" : "banned";
			this.log?.error(`Bot is ${reason}. Please contact QQ platform.`);
			return {
				shouldReconnect: false,
				clearSession: false,
				refreshToken: false,
				fatal: true,
				reason
			};
		}
		if (code === GatewayCloseCode.AUTH_FAILED) {
			this.log?.info(`Invalid token (4004), will refresh token and reconnect`);
			return {
				shouldReconnect: !isAborted,
				clearSession: false,
				refreshToken: true,
				fatal: false,
				reason: "invalid token (4004)"
			};
		}
		if (code === GatewayCloseCode.RATE_LIMITED) {
			this.log?.info(`Rate limited (4008), waiting ${RATE_LIMIT_DELAY}ms`);
			return {
				shouldReconnect: !isAborted,
				reconnectDelay: RATE_LIMIT_DELAY,
				clearSession: false,
				refreshToken: false,
				fatal: false,
				reason: "rate limited (4008)"
			};
		}
		if (code === GatewayCloseCode.INVALID_SESSION || code === GatewayCloseCode.SEQ_OUT_OF_RANGE || code === GatewayCloseCode.SESSION_TIMEOUT) {
			const codeDesc = {
				[GatewayCloseCode.INVALID_SESSION]: "session no longer valid",
				[GatewayCloseCode.SEQ_OUT_OF_RANGE]: "invalid seq on resume",
				[GatewayCloseCode.SESSION_TIMEOUT]: "session timed out"
			};
			this.log?.info(`Error ${code} (${codeDesc[code]}), will re-identify`);
			return {
				shouldReconnect: !isAborted,
				clearSession: true,
				refreshToken: true,
				fatal: false,
				reason: codeDesc[code]
			};
		}
		if (code >= GatewayCloseCode.SERVER_ERROR_START && code <= GatewayCloseCode.SERVER_ERROR_END) {
			this.log?.info(`Internal error (${code}), will re-identify`);
			return {
				shouldReconnect: !isAborted && code !== GatewayCloseCode.NORMAL,
				clearSession: true,
				refreshToken: true,
				fatal: false,
				reason: `internal error (${code})`
			};
		}
		const connectionDuration = Date.now() - this.lastConnectTime;
		if (connectionDuration < 5e3 && this.lastConnectTime > 0) {
			this.quickDisconnectCount++;
			this.log?.debug?.(`Quick disconnect detected (${connectionDuration}ms), count: ${this.quickDisconnectCount}`);
			if (this.quickDisconnectCount >= 3) {
				this.log?.error(`Too many quick disconnects. This may indicate a permission issue.`);
				this.quickDisconnectCount = 0;
				return {
					shouldReconnect: !isAborted && code !== 1e3,
					reconnectDelay: RATE_LIMIT_DELAY,
					clearSession: false,
					refreshToken: false,
					fatal: false,
					reason: "too many quick disconnects"
				};
			}
		} else this.quickDisconnectCount = 0;
		return {
			shouldReconnect: !isAborted && code !== GatewayCloseCode.NORMAL,
			clearSession: false,
			refreshToken: false,
			fatal: false,
			reason: `close code ${code}`
		};
	}
};
//#endregion
//#region extensions/qqbot/src/engine/gateway/gateway-connection.ts
/**
* GatewayConnection — WebSocket lifecycle, heartbeat, reconnect, and session persistence.
*
* Encapsulates all connection state as class fields (replaces 11 closure variables).
* Event handling and message processing are delegated to injected handlers.
*/
var GatewayConnection = class {
	constructor(ctx) {
		this.isAborted = false;
		this.currentWs = null;
		this.heartbeatInterval = null;
		this.sessionId = null;
		this.lastSeq = null;
		this.isConnecting = false;
		this.reconnectTimer = null;
		this.shouldRefreshToken = false;
		this.ctx = ctx;
		this.reconnect = new ReconnectState(ctx.account.accountId, ctx.log);
		this.msgQueue = createMessageQueue({
			accountId: ctx.account.accountId,
			log: ctx.log,
			isAborted: () => this.isAborted
		});
	}
	/** Start the connection loop. Resolves when abortSignal fires. */
	async start() {
		this.restoreSession();
		this.registerAbortHandler();
		await this.connect();
		return new Promise((resolve) => {
			this.ctx.abortSignal.addEventListener("abort", () => resolve());
		});
	}
	restoreSession() {
		const { account, log } = this.ctx;
		const saved = loadSession(account.accountId, account.appId);
		if (saved) {
			this.sessionId = saved.sessionId;
			this.lastSeq = saved.lastSeq;
			log?.info(`Restored session: sessionId=${this.sessionId}, lastSeq=${this.lastSeq}`);
		}
	}
	saveCurrentSession() {
		const { account } = this.ctx;
		if (!this.sessionId) return;
		saveSession({
			sessionId: this.sessionId,
			lastSeq: this.lastSeq,
			lastConnectedAt: Date.now(),
			intentLevelIndex: 0,
			accountId: account.accountId,
			savedAt: Date.now(),
			appId: account.appId
		});
	}
	registerAbortHandler() {
		const { account, abortSignal, log: _log } = this.ctx;
		abortSignal.addEventListener("abort", () => {
			this.isAborted = true;
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}
			this.cleanup();
			stopBackgroundTokenRefresh(account.appId);
			flushKnownUsers();
			flushRefIndex();
		});
	}
	cleanup() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
		if (this.currentWs && (this.currentWs.readyState === WebSocket.OPEN || this.currentWs.readyState === WebSocket.CONNECTING)) this.currentWs.close();
		this.currentWs = null;
	}
	scheduleReconnect(customDelay) {
		const { account: _account, log } = this.ctx;
		if (this.isAborted || this.reconnect.isExhausted()) {
			log?.error(`Max reconnect attempts reached or aborted`);
			return;
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		const delay = this.reconnect.getNextDelay(customDelay);
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			if (!this.isAborted) this.connect();
		}, delay);
	}
	async connect() {
		const { account, log } = this.ctx;
		if (this.isConnecting) {
			log?.debug?.(`Already connecting, skip`);
			return;
		}
		this.isConnecting = true;
		try {
			this.cleanup();
			if (this.shouldRefreshToken) {
				log?.debug?.(`Refreshing token...`);
				clearTokenCache(account.appId);
				this.shouldRefreshToken = false;
			}
			const accessToken = await getAccessToken(account.appId, account.clientSecret);
			log?.info(`✅ Access token obtained successfully`);
			const gatewayUrl = await getGatewayUrl(accessToken, account.appId);
			log?.info(`Connecting to ${gatewayUrl}`);
			const ws = new WebSocket(gatewayUrl, { headers: { "User-Agent": getPluginUserAgent() } });
			this.currentWs = ws;
			const slashCtx = {
				account,
				log,
				getMessagePeerId: (msg) => this.msgQueue.getMessagePeerId(msg),
				getQueueSnapshot: (peerId) => this.msgQueue.getSnapshot(peerId)
			};
			const trySlashCommandOrEnqueue = async (msg) => {
				const result = await trySlashCommand(msg, slashCtx);
				if (result === "enqueue") this.msgQueue.enqueue(msg);
				else if (result === "urgent") {
					const peerId = this.msgQueue.getMessagePeerId(msg);
					this.msgQueue.clearUserQueue(peerId);
					this.msgQueue.executeImmediate(msg);
				}
			};
			ws.on("open", () => {
				log?.info(`WebSocket connected`);
				this.isConnecting = false;
				this.reconnect.onConnected();
				this.msgQueue.startProcessor(this.ctx.handleMessage);
				startBackgroundTokenRefresh(account.appId, account.clientSecret, { log });
			});
			ws.on("message", async (data) => {
				try {
					const rawData = decodeGatewayMessageData(data);
					const { op, d, s, t } = JSON.parse(rawData);
					if (s) {
						this.lastSeq = s;
						this.saveCurrentSession();
					}
					switch (op) {
						case GatewayOp.HELLO:
							this.handleHello(ws, d, accessToken);
							break;
						case GatewayOp.DISPATCH: {
							log?.debug?.(`Dispatch event: t=${t}, d=${JSON.stringify(d)}`);
							const result = dispatchEvent(t ?? "", d, account.accountId, log);
							if (result.action === "ready") {
								this.sessionId = result.sessionId;
								this.saveCurrentSession();
								this.ctx.onReady?.(result.data);
							} else if (result.action === "resumed") {
								(this.ctx.onResumed ?? this.ctx.onReady)?.(result.data);
								this.saveCurrentSession();
							} else if (result.action === "interaction") this.ctx.onInteraction?.(result.event);
							else if (result.action === "message") trySlashCommandOrEnqueue(result.msg);
							break;
						}
						case GatewayOp.HEARTBEAT_ACK: break;
						case GatewayOp.RECONNECT:
							this.cleanup();
							this.scheduleReconnect();
							break;
						case GatewayOp.INVALID_SESSION:
							if (!d) {
								this.sessionId = null;
								this.lastSeq = null;
								clearSession(account.accountId);
								this.shouldRefreshToken = true;
							}
							this.cleanup();
							this.scheduleReconnect(3e3);
							break;
					}
				} catch (err) {
					log?.error(`Message parse error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
			ws.on("close", (code, reason) => {
				log?.info(`WebSocket closed: ${code} ${reason.toString()}`);
				this.isConnecting = false;
				this.handleClose(code);
			});
			ws.on("error", (err) => {
				log?.error(`WebSocket error: ${err.message}`);
				this.ctx.onError?.(err);
			});
		} catch (err) {
			this.isConnecting = false;
			const errMsg = err instanceof Error ? err.message : String(err);
			log?.error(`Connection failed: ${errMsg}`);
			if (errMsg.includes("Too many requests") || errMsg.includes("100001")) this.scheduleReconnect(RATE_LIMIT_DELAY);
			else this.scheduleReconnect();
		}
	}
	handleHello(ws, d, accessToken) {
		if (this.sessionId && this.lastSeq !== null) ws.send(JSON.stringify({
			op: GatewayOp.RESUME,
			d: {
				token: `QQBot ${accessToken}`,
				session_id: this.sessionId,
				seq: this.lastSeq
			}
		}));
		else ws.send(JSON.stringify({
			op: GatewayOp.IDENTIFY,
			d: {
				token: `QQBot ${accessToken}`,
				intents: FULL_INTENTS,
				shard: [0, 1]
			}
		}));
		const interval = d.heartbeat_interval;
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
		this.heartbeatInterval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
				op: GatewayOp.HEARTBEAT,
				d: this.lastSeq
			}));
		}, interval);
	}
	handleClose(code) {
		const { account } = this.ctx;
		const action = this.reconnect.handleClose(code, this.isAborted);
		if (action.clearSession) {
			this.sessionId = null;
			this.lastSeq = null;
			clearSession(account.accountId);
		}
		if (action.refreshToken) this.shouldRefreshToken = true;
		this.cleanup();
		if (action.fatal) return;
		if (action.shouldReconnect) this.scheduleReconnect(action.reconnectDelay);
	}
};
//#endregion
//#region extensions/qqbot/src/engine/utils/stt.ts
/**
* OpenAI-compatible STT (Speech-to-Text) configuration and transcription.
*
* Migrated from `src/stt.ts` — uses core/utils/string-normalize instead
* of openclaw/plugin-sdk/text-runtime.
*/
/** Resolve the STT configuration from the nested config object. */
function resolveSTTConfig(cfg) {
	const channelStt = asOptionalObjectRecord(asOptionalObjectRecord(asOptionalObjectRecord(cfg.channels)?.qqbot)?.stt);
	const providers = asOptionalObjectRecord(asOptionalObjectRecord(cfg.models)?.providers);
	if (channelStt && channelStt.enabled !== false) {
		const providerId = readStringField(channelStt, "provider") ?? "openai";
		const providerCfg = asOptionalObjectRecord(providers?.[providerId]);
		const baseUrl = readStringField(channelStt, "baseUrl") ?? readStringField(providerCfg, "baseUrl");
		const apiKey = readStringField(channelStt, "apiKey") ?? readStringField(providerCfg, "apiKey");
		const model = readStringField(channelStt, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	const audioModels = asOptionalObjectRecord(asOptionalObjectRecord(asOptionalObjectRecord(cfg.tools)?.media)?.audio)?.models;
	const audioModelEntry = Array.isArray(audioModels) ? asOptionalObjectRecord(audioModels[0]) : void 0;
	if (audioModelEntry) {
		const providerId = readStringField(audioModelEntry, "provider") ?? "openai";
		const providerCfg = asOptionalObjectRecord(providers?.[providerId]);
		const baseUrl = readStringField(audioModelEntry, "baseUrl") ?? readStringField(providerCfg, "baseUrl");
		const apiKey = readStringField(audioModelEntry, "apiKey") ?? readStringField(providerCfg, "apiKey");
		const model = readStringField(audioModelEntry, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	return null;
}
/** Send audio to an OpenAI-compatible STT endpoint and return the transcript. */
async function transcribeAudio(audioPath, cfg) {
	const sttCfg = resolveSTTConfig(cfg);
	if (!sttCfg) return null;
	const fileBuffer = fs$1.readFileSync(audioPath);
	const fileName = sanitizeFileName(path.basename(audioPath));
	const mime = fileName.endsWith(".wav") ? "audio/wav" : fileName.endsWith(".mp3") ? "audio/mpeg" : fileName.endsWith(".ogg") ? "audio/ogg" : "application/octet-stream";
	const form = new FormData();
	form.append("file", new Blob([fileBuffer], { type: mime }), fileName);
	form.append("model", sttCfg.model);
	const resp = await fetch(`${sttCfg.baseUrl}/audio/transcriptions`, {
		method: "POST",
		headers: { Authorization: `Bearer ${sttCfg.apiKey}` },
		body: form
	});
	if (!resp.ok) {
		const detail = await resp.text().catch(() => "");
		throw new Error(`STT failed (HTTP ${resp.status}): ${detail.slice(0, 300)}`);
	}
	return normalizeOptionalString((await resp.json()).text) ?? null;
}
//#endregion
//#region extensions/qqbot/src/engine/utils/voice-text.ts
/**
* Voice transcript formatting utility.
*
* Zero external dependencies — pure string formatting.
*/
/** Format voice transcripts into user-visible text. */
function formatVoiceText(transcripts) {
	if (transcripts.length === 0) return "";
	return transcripts.length === 1 ? `[Voice message] ${transcripts[0]}` : transcripts.map((t, i) => `[Voice ${i + 1}] ${t}`).join("\n");
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/inbound-attachments.ts
const EMPTY_RESULT = {
	attachmentInfo: "",
	imageUrls: [],
	imageMediaTypes: [],
	voiceAttachmentPaths: [],
	voiceAttachmentUrls: [],
	voiceAsrReferTexts: [],
	voiceTranscripts: [],
	voiceTranscriptSources: [],
	attachmentLocalPaths: []
};
/** Download, convert, transcribe, and classify inbound attachments. */
async function processAttachments(attachments, ctx) {
	if (!attachments?.length) return EMPTY_RESULT;
	const { accountId: _accountId, cfg, log, audioConvert } = ctx;
	const downloadDir = getQQBotMediaDir("downloads");
	const imageUrls = [];
	const imageMediaTypes = [];
	const voiceAttachmentPaths = [];
	const voiceAttachmentUrls = [];
	const voiceAsrReferTexts = [];
	const voiceTranscripts = [];
	const voiceTranscriptSources = [];
	const attachmentLocalPaths = [];
	const otherAttachments = [];
	const downloadTasks = attachments.map(async (att) => {
		const attUrl = att.url?.startsWith("//") ? `https:${att.url}` : att.url;
		const isVoice = audioConvert.isVoiceAttachment(att);
		const wavUrl = isVoice && att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
		let localPath = null;
		let audioPath = null;
		if (isVoice && wavUrl) {
			const wavLocalPath = await downloadFile(wavUrl, downloadDir);
			if (wavLocalPath) {
				localPath = wavLocalPath;
				audioPath = wavLocalPath;
				log?.debug?.(`Voice attachment: ${att.filename}, downloaded WAV directly (skip SILK→WAV)`);
			} else log?.error(`Failed to download voice_wav_url, falling back to original URL`);
		}
		if (!localPath) localPath = await downloadFile(attUrl, downloadDir, att.filename);
		return {
			att,
			attUrl,
			isVoice,
			localPath,
			audioPath
		};
	});
	const processTasks = (await Promise.all(downloadTasks)).map(async ({ att, attUrl, isVoice, localPath, audioPath }) => {
		const asrReferText = normalizeOptionalString(att.asr_refer_text) ?? "";
		const voiceSourceUrl = (isVoice && att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "") || attUrl;
		const meta = {
			voiceUrl: isVoice && voiceSourceUrl ? voiceSourceUrl : void 0,
			asrReferText: isVoice && asrReferText ? asrReferText : void 0
		};
		if (localPath) {
			if (att.content_type?.startsWith("image/")) {
				log?.debug?.(`Downloaded attachment to: ${localPath}`);
				return {
					localPath,
					type: "image",
					contentType: att.content_type,
					meta
				};
			}
			if (isVoice) {
				log?.debug?.(`Downloaded attachment to: ${localPath}`);
				return processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, audioConvert, log);
			}
			log?.debug?.(`Downloaded attachment to: ${localPath}`);
			return {
				localPath,
				type: "other",
				filename: att.filename,
				meta
			};
		}
		log?.error(`Failed to download: ${attUrl}`);
		if (att.content_type?.startsWith("image/")) return {
			localPath: null,
			type: "image-fallback",
			attUrl,
			contentType: att.content_type,
			meta
		};
		if (isVoice && asrReferText) {
			log?.info(`Voice attachment download failed, using asr_refer_text fallback`);
			return {
				localPath: null,
				type: "voice-fallback",
				transcript: asrReferText,
				meta
			};
		}
		return {
			localPath: null,
			type: "other-fallback",
			filename: att.filename ?? att.content_type,
			meta
		};
	});
	const processResults = await Promise.all(processTasks);
	for (const result of processResults) {
		if (result.meta.voiceUrl) voiceAttachmentUrls.push(result.meta.voiceUrl);
		if (result.meta.asrReferText) voiceAsrReferTexts.push(result.meta.asrReferText);
		if (result.type === "image" && result.localPath) {
			imageUrls.push(result.localPath);
			imageMediaTypes.push(result.contentType);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "voice" && result.localPath) {
			voiceAttachmentPaths.push(result.localPath);
			voiceTranscripts.push(result.transcript);
			voiceTranscriptSources.push(result.transcriptSource);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "other" && result.localPath) {
			otherAttachments.push(`[Attachment: ${result.localPath}]`);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "image-fallback") {
			imageUrls.push(result.attUrl);
			imageMediaTypes.push(result.contentType);
			attachmentLocalPaths.push(null);
		} else if (result.type === "voice-fallback") {
			voiceTranscripts.push(result.transcript);
			voiceTranscriptSources.push("asr");
			attachmentLocalPaths.push(null);
		} else if (result.type === "other-fallback") {
			otherAttachments.push(`[Attachment: ${result.filename}] (download failed)`);
			attachmentLocalPaths.push(null);
		}
	}
	return {
		attachmentInfo: otherAttachments.length > 0 ? "\n" + otherAttachments.join("\n") : "",
		imageUrls,
		imageMediaTypes,
		voiceAttachmentPaths,
		voiceAttachmentUrls,
		voiceAsrReferTexts,
		voiceTranscripts,
		voiceTranscriptSources,
		attachmentLocalPaths
	};
}
async function processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, audioConvert, log) {
	const wavUrl = att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
	const attUrl = att.url?.startsWith("//") ? `https:${att.url}` : att.url;
	const meta = {
		voiceUrl: wavUrl || attUrl || void 0,
		asrReferText: asrReferText || void 0
	};
	if (!resolveSTTConfig(cfg)) {
		if (asrReferText) {
			log?.debug?.(`Voice attachment: ${att.filename} (STT not configured, using asr_refer_text fallback)`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.debug?.(`Voice attachment: ${att.filename} (STT not configured, skipping transcription)`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription unavailable because STT is not configured]",
			transcriptSource: "fallback",
			meta
		};
	}
	if (!audioPath) {
		log?.debug?.(`Voice attachment: ${att.filename}, converting SILK→WAV...`);
		try {
			const wavResult = await audioConvert.convertSilkToWav(localPath, downloadDir);
			if (wavResult) {
				audioPath = wavResult.wavPath;
				log?.debug?.(`Voice converted: ${wavResult.wavPath} (${audioConvert.formatDuration(wavResult.duration)})`);
			} else audioPath = localPath;
		} catch (convertErr) {
			log?.error(`Voice conversion failed: ${convertErr instanceof Error ? convertErr.message : JSON.stringify(convertErr)}`);
			if (asrReferText) return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
			return {
				localPath,
				type: "voice",
				transcript: "[Voice message - format conversion failed]",
				transcriptSource: "fallback",
				meta
			};
		}
	}
	try {
		const transcript = await transcribeAudio(audioPath, cfg);
		if (transcript) {
			log?.debug?.(`STT transcript: ${transcript.slice(0, 100)}...`);
			return {
				localPath,
				type: "voice",
				transcript,
				transcriptSource: "stt",
				meta
			};
		}
		if (asrReferText) {
			log?.debug?.(`STT returned empty result, using asr_refer_text fallback`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.debug?.(`STT returned empty result`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription returned an empty result]",
			transcriptSource: "fallback",
			meta
		};
	} catch (sttErr) {
		log?.error(`STT failed: ${sttErr instanceof Error ? sttErr.message : JSON.stringify(sttErr)}`);
		if (asrReferText) return {
			localPath,
			type: "voice",
			transcript: asrReferText,
			transcriptSource: "asr",
			meta
		};
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription failed]",
			transcriptSource: "fallback",
			meta
		};
	}
}
//#endregion
//#region extensions/qqbot/src/engine/access/resolve-policy.ts
function hasRealRestriction(list) {
	if (!list || list.length === 0) return false;
	return !list.every((entry) => String(entry).trim() === "*");
}
/**
* Derive the effective dmPolicy and groupPolicy applied at runtime.
*
* Caller should pass the raw `QQBotAccountConfig`. The resolver does
* not look at `groups[id]` overrides — per-group overrides are layered
* on top elsewhere (see `inbound-pipeline` mention gating).
*/
function resolveQQBotEffectivePolicies(input) {
	const allowFromRestricted = hasRealRestriction(input.allowFrom);
	const groupAllowFromRestricted = hasRealRestriction(input.groupAllowFrom);
	return {
		dmPolicy: input.dmPolicy ?? (allowFromRestricted ? "allowlist" : "open"),
		groupPolicy: input.groupPolicy ?? (groupAllowFromRestricted || allowFromRestricted ? "allowlist" : "open")
	};
}
//#endregion
//#region extensions/qqbot/src/engine/access/sender-match.ts
/**
* QQBot sender normalization and allowlist matching.
*
* Keeps QQ-specific quirks (the `qqbot:` prefix, uppercase-insensitive
* comparison) localized to this module so the policy engine itself can
* stay channel-agnostic.
*/
/** Normalize a single entry (openid): strip `qqbot:` prefix, uppercase, trim. */
function normalizeQQBotSenderId(raw) {
	if (typeof raw !== "string" && typeof raw !== "number") return "";
	return String(raw).trim().replace(/^qqbot:/i, "").toUpperCase();
}
/** Normalize an entire allowFrom list, dropping empty entries. */
function normalizeQQBotAllowFrom(list) {
	if (!list || list.length === 0) return [];
	const out = [];
	for (const entry of list) {
		const normalized = normalizeQQBotSenderId(entry);
		if (normalized) out.push(normalized);
	}
	return out;
}
/**
* Build a matcher closure suitable for passing to the policy engine's
* `isSenderAllowed` callback. The caller supplies the sender once, and
* the returned function can be invoked against different allowlists
* (DM allowlist vs group allowlist) without repeating normalization.
*/
function createQQBotSenderMatcher(senderId) {
	const normalizedSender = normalizeQQBotSenderId(senderId);
	return (allowFrom) => {
		if (allowFrom.length === 0) return false;
		if (allowFrom.includes("*")) return true;
		if (!normalizedSender) return false;
		return allowFrom.some((entry) => normalizeQQBotSenderId(entry) === normalizedSender);
	};
}
//#endregion
//#region extensions/qqbot/src/engine/access/types.ts
/** Structured reason codes used in logs and metrics. */
const QQBOT_ACCESS_REASON = {
	DM_POLICY_OPEN: "dm_policy_open",
	DM_POLICY_DISABLED: "dm_policy_disabled",
	DM_POLICY_ALLOWLISTED: "dm_policy_allowlisted",
	DM_POLICY_NOT_ALLOWLISTED: "dm_policy_not_allowlisted",
	DM_POLICY_EMPTY_ALLOWLIST: "dm_policy_empty_allowlist",
	GROUP_POLICY_ALLOWED: "group_policy_allowed",
	GROUP_POLICY_DISABLED: "group_policy_disabled",
	GROUP_POLICY_EMPTY_ALLOWLIST: "group_policy_empty_allowlist",
	GROUP_POLICY_NOT_ALLOWLISTED: "group_policy_not_allowlisted",
	BOT_SELF_ECHO: "bot_self_echo"
};
//#endregion
//#region extensions/qqbot/src/engine/access/access-control.ts
/**
* QQBot inbound access decision.
*
* This module is the single place where the QQBot engine decides
* whether an inbound message from a given sender is allowed to
* proceed into the outbound pipeline. The implementation mirrors the
* semantics of the framework-wide `resolveDmGroupAccessDecision`
* (`src/security/dm-policy-shared.ts`) but is kept standalone so the
* `engine/` layer does not pull in `openclaw/plugin-sdk/*` modules —
* a hard constraint shared with the standalone `openclaw-qqbot` build.
*
* If in the future we lift the zero-dependency rule in the engine
* layer, this file can be replaced by a thin adapter around the
* framework API with identical semantics.
*/
/**
* Evaluate the inbound access policy.
*
* Semantics (aligned with `resolveDmGroupAccessDecision`):
*   - Group message:
*     - `groupPolicy=disabled` → block
*     - `groupPolicy=open`     → allow
*     - `groupPolicy=allowlist`:
*         - empty effectiveGroupAllowFrom → block (empty_allowlist)
*         - sender not in list            → block (not_allowlisted)
*         - otherwise                     → allow
*   - Direct message:
*     - `dmPolicy=disabled`    → block
*     - `dmPolicy=open`        → allow
*     - `dmPolicy=allowlist`:
*         - empty effectiveAllowFrom → block (empty_allowlist)
*         - sender not in list       → block (not_allowlisted)
*         - otherwise                → allow
*
* The function never throws; callers can rely on the returned
* `decision`/`reasonCode` pair for branching.
*/
function resolveQQBotAccess(input) {
	const { dmPolicy, groupPolicy } = resolveQQBotEffectivePolicies(input);
	const rawGroupAllowFrom = input.groupAllowFrom && input.groupAllowFrom.length > 0 ? input.groupAllowFrom : input.allowFrom ?? [];
	const effectiveAllowFrom = normalizeQQBotAllowFrom(input.allowFrom);
	const effectiveGroupAllowFrom = normalizeQQBotAllowFrom(rawGroupAllowFrom);
	const isSenderAllowed = createQQBotSenderMatcher(input.senderId);
	if (input.isGroup) return evaluateGroupDecision({
		groupPolicy,
		dmPolicy,
		effectiveAllowFrom,
		effectiveGroupAllowFrom,
		isSenderAllowed
	});
	return evaluateDmDecision({
		groupPolicy,
		dmPolicy,
		effectiveAllowFrom,
		effectiveGroupAllowFrom,
		isSenderAllowed
	});
}
function evaluateGroupDecision(ctx) {
	const base = buildResultBase(ctx);
	if (ctx.groupPolicy === "disabled") return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_DISABLED,
		reason: "groupPolicy=disabled"
	};
	if (ctx.groupPolicy === "open") return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_ALLOWED,
		reason: "groupPolicy=open"
	};
	if (ctx.effectiveGroupAllowFrom.length === 0) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST,
		reason: "groupPolicy=allowlist (empty allowlist)"
	};
	if (!ctx.isSenderAllowed(ctx.effectiveGroupAllowFrom)) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_NOT_ALLOWLISTED,
		reason: "groupPolicy=allowlist (not allowlisted)"
	};
	return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_ALLOWED,
		reason: "groupPolicy=allowlist (allowlisted)"
	};
}
function evaluateDmDecision(ctx) {
	const base = buildResultBase(ctx);
	if (ctx.dmPolicy === "disabled") return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_DISABLED,
		reason: "dmPolicy=disabled"
	};
	if (ctx.dmPolicy === "open") return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_OPEN,
		reason: "dmPolicy=open"
	};
	if (ctx.effectiveAllowFrom.length === 0) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_EMPTY_ALLOWLIST,
		reason: "dmPolicy=allowlist (empty allowlist)"
	};
	if (!ctx.isSenderAllowed(ctx.effectiveAllowFrom)) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_NOT_ALLOWLISTED,
		reason: "dmPolicy=allowlist (not allowlisted)"
	};
	return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_ALLOWLISTED,
		reason: "dmPolicy=allowlist (allowlisted)"
	};
}
function buildResultBase(ctx) {
	return {
		effectiveAllowFrom: ctx.effectiveAllowFrom,
		effectiveGroupAllowFrom: ctx.effectiveGroupAllowFrom,
		dmPolicy: ctx.dmPolicy,
		groupPolicy: ctx.groupPolicy
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/stub-contexts.ts
/** Build an {@link InboundContext} with all non-routing fields cleared. */
function emptyInboundContext(fields) {
	return {
		event: fields.event,
		route: fields.route,
		isGroupChat: fields.isGroupChat,
		peerId: fields.peerId,
		qualifiedTarget: fields.qualifiedTarget,
		fromAddress: fields.fromAddress,
		parsedContent: "",
		userContent: "",
		quotePart: "",
		dynamicCtx: "",
		userMessage: "",
		agentBody: "",
		body: "",
		systemPrompts: [],
		groupSystemPrompt: void 0,
		attachments: {
			attachmentInfo: "",
			imageUrls: [],
			imageMediaTypes: [],
			voiceAttachmentPaths: [],
			voiceAttachmentUrls: [],
			voiceAsrReferTexts: [],
			voiceTranscripts: [],
			voiceTranscriptSources: [],
			attachmentLocalPaths: []
		},
		localMediaPaths: [],
		localMediaTypes: [],
		remoteMediaUrls: [],
		remoteMediaTypes: [],
		uniqueVoicePaths: [],
		uniqueVoiceUrls: [],
		uniqueVoiceAsrReferTexts: [],
		voiceMediaTypes: [],
		hasAsrReferFallback: false,
		voiceTranscriptSources: [],
		replyTo: void 0,
		commandAuthorized: false,
		group: void 0,
		blocked: false,
		skipped: false,
		typing: { keepAlive: null },
		inputNotifyRefIdx: void 0
	};
}
/**
* Build an {@link InboundContext} that represents a message blocked by
* access control (policy denial, allowlist mismatch, etc.).
*/
function buildBlockedInboundContext(params) {
	return {
		...emptyInboundContext(params),
		blocked: true,
		blockReason: params.access.reason,
		blockReasonCode: params.access.reasonCode,
		accessDecision: params.access.decision
	};
}
/**
* Build an {@link InboundContext} that represents a message stopped by
* the group gate (drop_other_mention, block_unauthorized_command,
* skip_no_mention). Any history side-effects have already been applied
* by the gate stage.
*/
function buildSkippedInboundContext(params) {
	return {
		...emptyInboundContext(params),
		group: params.group,
		skipped: true,
		skipReason: params.skipReason,
		accessDecision: params.access.decision,
		typing: params.typing,
		inputNotifyRefIdx: params.inputNotifyRefIdx
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/access-stage.ts
/**
* Access stage — resolves routing target + runs access control.
*
* Split from the pipeline so it is trivially unit-testable: given a raw
* event and the runtime's routing info, the stage returns either:
*   - `{ kind: "allow", ... }` — proceed through the rest of the pipeline
*   - `{ kind: "block", context }` — short-circuit; the caller returns
*     `context` directly to its own caller.
*/
/**
* Resolve the routing target, walk the access policy, and decide whether
* the inbound message should proceed to the rest of the pipeline.
*/
function runAccessStage(event, deps) {
	const { account, cfg, runtime, log } = deps;
	const isGroupChat = event.type === "guild" || event.type === "group";
	const peerId = resolvePeerId(event, isGroupChat);
	const qualifiedTarget = buildQualifiedTarget(event, isGroupChat);
	const route = runtime.channel.routing.resolveAgentRoute({
		cfg,
		channel: "qqbot",
		accountId: account.accountId,
		peer: {
			kind: isGroupChat ? "group" : "direct",
			id: peerId
		}
	});
	const access = resolveQQBotAccess({
		isGroup: isGroupChat,
		senderId: event.senderId,
		allowFrom: account.config?.allowFrom,
		groupAllowFrom: account.config?.groupAllowFrom,
		dmPolicy: account.config?.dmPolicy,
		groupPolicy: account.config?.groupPolicy
	});
	if (access.decision !== "allow") {
		log?.info(`Blocked qqbot inbound: decision=${access.decision} reasonCode=${access.reasonCode} reason=${access.reason} senderId=${event.senderId} accountId=${account.accountId} isGroup=${isGroupChat}`);
		return {
			kind: "block",
			context: buildBlockedInboundContext({
				event,
				route,
				isGroupChat,
				peerId,
				qualifiedTarget,
				fromAddress: qualifiedTarget,
				access
			})
		};
	}
	return {
		kind: "allow",
		isGroupChat,
		peerId,
		qualifiedTarget,
		fromAddress: qualifiedTarget,
		route,
		access
	};
}
function resolvePeerId(event, isGroupChat) {
	if (event.type === "guild") return event.channelId ?? "unknown";
	if (event.type === "group") return event.groupOpenid ?? "unknown";
	if (isGroupChat) return "unknown";
	return event.senderId;
}
function buildQualifiedTarget(event, isGroupChat) {
	if (isGroupChat) return event.type === "guild" ? `qqbot:channel:${event.channelId}` : `qqbot:group:${event.groupOpenid}`;
	return event.type === "dm" ? `qqbot:dm:${event.guildId}` : `qqbot:c2c:${event.senderId}`;
}
/**
* Decide whether the access decision permits running text-based control
* commands. Placed in the access stage because the rule is an
* access-policy derivative, not a gate derivative.
*/
function resolveCommandAuthorized(access) {
	return access.reasonCode === "dm_policy_open" || access.reasonCode === "dm_policy_allowlisted" || access.reasonCode === "group_policy_allowed" && access.effectiveGroupAllowFrom.length > 0 && access.groupPolicy === "allowlist";
}
//#endregion
//#region extensions/qqbot/src/engine/group/mention.ts
/** Regex detecting `<@openid>` / `<@!openid>` mention tags in raw content. */
const MENTION_TAG_RE = /<@!?\w+>/;
/**
* Detect whether the inbound message explicitly targets the bot.
*
* Priority order:
*   1. `mentions[].is_you === true`           (most reliable)
*   2. `eventType === "GROUP_AT_MESSAGE_CREATE"` (QQ-level @bot event)
*   3. regex match on any of `mentionPatterns` (fallback, e.g. "@bot-name")
*
* Returns `false` for direct messages or when no signal is found.
*/
function detectWasMentioned(input) {
	const { eventType, mentions, content, mentionPatterns } = input;
	if (mentions?.some((m) => m.is_you)) return true;
	if (eventType === "GROUP_AT_MESSAGE_CREATE") return true;
	if (mentionPatterns?.length && content) for (const pattern of mentionPatterns) {
		if (!pattern) continue;
		try {
			if (new RegExp(pattern, "i").test(content)) return true;
		} catch {}
	}
	return false;
}
/**
* Report whether the message contains **any** @mention (not necessarily @bot).
*
* Used by the gating layer to decide whether to bypass mention requirements
* for control commands. A control command like `/stop` that also @-s another
* user should NOT bypass the mention gate — the `@other-user` prefix is a
* strong signal that the command wasn't addressed to the bot.
*/
function hasAnyMention(input) {
	if (input.mentions && input.mentions.length > 0) return true;
	if (input.content && MENTION_TAG_RE.test(input.content)) return true;
	return false;
}
/**
* Clean up `<@openid>` mention tags in raw QQ group content.
*
* - For the bot's own mention (`is_you === true`): the tag is removed
*   outright so prompts don't contain visible `<@BOTID>` garbage.
* - For other mentioned users: the tag is replaced with `@nickname` (or
*   `@username`) for readability. Entries without a display name are left
*   as-is (rare in practice).
*
* Returns the original text unchanged when `text` or `mentions` is empty.
*/
function stripMentionText(text, mentions) {
	if (!text || !mentions?.length) return text;
	let cleaned = text;
	for (const m of mentions) {
		const openid = m.member_openid ?? m.id ?? m.user_openid;
		if (!openid) continue;
		const tagRe = new RegExp(`<@!?${escapeRegex$1(openid)}>`, "g");
		if (m.is_you) cleaned = cleaned.replace(tagRe, "").trim();
		else {
			const displayName = m.nickname ?? m.username;
			if (displayName) cleaned = cleaned.replace(tagRe, `@${displayName}`);
		}
	}
	return cleaned;
}
/** Escape characters that carry regex meaning. */
function escapeRegex$1(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* Decide whether a quoted-reply should count as an implicit @bot.
*
* When the user quotes an earlier bot message, we treat the new message
* as if it @-ed the bot, even without a literal mention. This lives in
* the mention module (rather than with activation) because semantically
* it answers the same question as `detectWasMentioned`:
* "was the bot addressed by this message?".
*
* The `getRefEntry` callback is injected so this function does not
* depend on the ref-index store implementation — any lookup that
* returns `{ isBot?: boolean }` works.
*/
function resolveImplicitMention(params) {
	if (!params.refMsgIdx) return false;
	return params.getRefEntry(params.refMsgIdx)?.isBot === true;
}
//#endregion
//#region extensions/qqbot/src/engine/group/history.ts
/** Tags wrapping merged sub-messages from the queue. */
const MERGED_CTX_START = "[Merged earlier messages — CONTEXT ONLY]";
const MERGED_CTX_END = "[CURRENT MESSAGE — reply using the context above]";
/** Map a raw QQ content-type string onto the normalized attachment type. */
function inferAttachmentType(contentType) {
	const ct = (contentType ?? "").toLowerCase();
	if (ct.startsWith("image/")) return "image";
	if (ct === "voice" || ct.startsWith("audio/") || ct.includes("silk") || ct.includes("amr")) return "voice";
	if (ct.startsWith("video/")) return "video";
	if (ct.startsWith("application/") || ct.startsWith("text/")) return "file";
	return "unknown";
}
/**
* Convert raw QQ-event attachments into `AttachmentSummary` entries.
*
* When `localPaths` is provided (from `ProcessedAttachments.attachmentLocalPaths`),
* each summary is enriched with the local file path so that history context
* renders the downloaded path instead of the ephemeral QQ CDN URL.
*
* Returns `undefined` (rather than `[]`) when no attachments are provided
* so that callers can omit the field from their result objects.
*/
function toAttachmentSummaries(attachments, localPaths) {
	if (!attachments?.length) return;
	return attachments.map((att, i) => ({
		type: inferAttachmentType(att.content_type),
		filename: att.filename,
		transcript: att.asr_refer_text || void 0,
		localPath: localPaths?.[i] || void 0,
		url: att.url || void 0
	}));
}
/**
* Format one sub-message: emoji parsing → mention cleanup → attachment tags.
*
* Used for the merged-message path where several queued messages are
* rendered together. `parseFaceTags` and `stripMentionText` are imported
* directly — both are pure utilities inside the same engine and do not
* warrant DI overhead.
*/
function formatMessageContent(params) {
	let msgContent = parseFaceTags(params.content);
	if (params.chatType === "group" && params.mentions?.length) msgContent = stripMentionText(msgContent, params.mentions);
	if (params.attachments?.length) {
		const attachmentDesc = formatAttachmentTags(toAttachmentSummaries(params.attachments));
		if (attachmentDesc) msgContent = `${msgContent} ${attachmentDesc}`;
	}
	return msgContent;
}
/**
* Wrap a batch of merged messages with begin/end tags and append the
* current user turn at the bottom.
*
* When `precedingParts` is empty, `currentMessage` is returned unchanged.
*/
function buildMergedMessageContext(params) {
	const { precedingParts, currentMessage } = params;
	if (precedingParts.length === 0) return currentMessage;
	const lineBreak = params.lineBreak ?? "\n";
	return [
		MERGED_CTX_START,
		precedingParts.join(lineBreak),
		MERGED_CTX_END,
		currentMessage
	].join(lineBreak);
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/assembly-stage.ts
/**
* Assembly stage — build the user-turn string the AI sees.
*
* Responsible for:
*   - Rendering merged turns (preceding messages in a begin/end block
*     + a "current" message).
*   - Attaching the sender label + (@you) suffix for group chat.
*   - Prepending the group's buffered history via
*     {@link buildPendingHistoryContext} when the current turn is
*     `@`-activated.
*   - Handing out the plain `agentBody` for DM-style turns.
*
* The envelope rendering (Web UI body + dynamic ctx block) lives in
* `envelope-stage.ts`; this stage only produces text that the model
* sees directly.
*/
/**
* Compose the user-turn string. For merged group turns, renders a
* preceding block and a current-message suffix; for single turns,
* prefixes the sender label and (@you) suffix as appropriate.
*/
function buildUserMessage(input) {
	const { event, userContent, quotePart, isGroupChat, groupInfo } = input;
	if (groupInfo?.isMerged && groupInfo.mergedMessages?.length) {
		const preceding = groupInfo.mergedMessages.slice(0, -1);
		const lastMsg = groupInfo.mergedMessages[groupInfo.mergedMessages.length - 1];
		const atYouTag = groupInfo.gate.effectiveWasMentioned ? " (@you)" : "";
		return buildMergedMessageContext({
			precedingParts: preceding.map((m) => `[${formatSenderLabel(m)}] ${formatSub(m)}`),
			currentMessage: `[${formatSenderLabel(lastMsg)}] ${formatSub(lastMsg)}${atYouTag}`
		});
	}
	const isAtYouTag = isGroupChat ? groupInfo?.gate.effectiveWasMentioned ? " (@you)" : "" : "";
	const senderPrefix = event.type === "group" ? `[${formatSenderLabelFrom(event.senderName, event.senderId)}] ` : "";
	return senderPrefix ? `${senderPrefix}${quotePart}${userContent}${isAtYouTag}` : `${quotePart}${userContent}`;
}
/**
* Compose the final `agentBody` the AI receives.
*
* Prepends buffered non-@ chatter via
* {@link buildPendingHistoryContext} when the current turn is
* `@`-activated in a group. Slash-commands bypass all decoration so
* the command parser sees verbatim input.
*/
function buildAgentBody(input) {
	const { event, userContent, userMessage, dynamicCtx, groupInfo, deps } = input;
	if (userContent.startsWith("/")) return userContent;
	const base = `${dynamicCtx}${userMessage}`;
	if (event.type !== "group" || !event.groupOpenid || !deps.groupHistories || !groupInfo) return base;
	const envelopeOpts = deps.runtime.channel.reply.resolveEnvelopeFormatOptions(deps.cfg);
	return deps.adapters.history.buildPendingHistoryContext({
		historyMap: deps.groupHistories,
		historyKey: event.groupOpenid,
		limit: groupInfo.historyLimit,
		currentMessage: base,
		formatEntry: (entry) => formatHistoryEntry(entry, deps, envelopeOpts)
	});
}
function formatSub(m) {
	return formatMessageContent({
		content: m.content ?? "",
		chatType: m.type,
		mentions: m.mentions,
		attachments: m.attachments
	});
}
function formatSenderLabel(m) {
	return formatSenderLabelFrom(m.senderName, m.senderId);
}
/**
* Render a "Nick (openid)" label. When `name` already includes `id`
* (e.g. the label was pre-formatted upstream), avoid double-wrapping.
*/
function formatSenderLabelFrom(name, id) {
	if (!name) return id;
	return name.includes(id) ? name : `${name} (${id})`;
}
function formatHistoryEntry(entry, deps, envelopeOpts) {
	const attachmentDesc = formatAttachmentTags(entry.attachments);
	const bodyWithAttachments = attachmentDesc ? `${entry.body} ${attachmentDesc}` : entry.body;
	return deps.runtime.channel.reply.formatInboundEnvelope({
		channel: "qqbot",
		from: entry.sender,
		timestamp: entry.timestamp,
		body: bodyWithAttachments,
		chatType: "group",
		envelope: envelopeOpts
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/content-stage.ts
/**
* Content stage — build the user-visible message body.
*
* Responsible for:
*   1. Parsing QQ emoji tags (`<faceType=...>` → `[Emoji: name]`)
*   2. Appending attachment info + voice transcripts
*   3. Stripping `<@openid>` mention tags in group messages
*   4. Replacing `<@openid>` → `@nickname` in DMs (best-effort)
*
* Pure function: same input → same output, no I/O.
*/
/**
* Build both the raw-parsed content and the fully composed user-visible
* body that downstream stages feed to the AI and to the envelope.
*/
function buildUserContent(input) {
	const { event, attachmentInfo, voiceTranscripts } = input;
	const parsedContent = parseFaceTags(event.content);
	const voiceText = formatVoiceText(voiceTranscripts);
	let userContent = voiceText ? (parsedContent.trim() ? `${parsedContent}\n${voiceText}` : voiceText) + attachmentInfo : parsedContent + attachmentInfo;
	if (event.type === "group" && event.mentions?.length) userContent = stripMentionText(userContent, event.mentions) ?? userContent;
	else if (event.mentions?.length) userContent = replaceMentionsWithNicknames(userContent, event.mentions);
	return {
		parsedContent,
		userContent
	};
}
function replaceMentionsWithNicknames(text, mentions) {
	let out = text;
	for (const m of mentions) if (m.member_openid && m.username) out = out.replace(new RegExp(`<@${escapeRegex(m.member_openid)}>`, "g"), `@${m.username}`);
	return out;
}
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/envelope-stage.ts
/** Format the inbound envelope (Web UI body). */
function buildBody(input) {
	const { event, deps, userContent, isGroupChat, imageUrls } = input;
	const envelopeOptions = deps.runtime.channel.reply.resolveEnvelopeFormatOptions(deps.cfg);
	return deps.runtime.channel.reply.formatInboundEnvelope({
		channel: "qqbot",
		from: event.senderName ?? event.senderId,
		timestamp: new Date(event.timestamp).getTime(),
		body: userContent,
		chatType: isGroupChat ? "group" : "direct",
		sender: {
			id: event.senderId,
			name: event.senderName
		},
		envelope: envelopeOptions,
		...imageUrls.length > 0 ? { imageUrls } : {}
	});
}
/** Render the `[Quoted message begins]...[ends]` block (empty if no reply-to). */
function buildQuotePart(replyTo) {
	if (!replyTo) return "";
	return replyTo.body ? `[Quoted message begins]\n${replyTo.body}\n[Quoted message ends]\n` : `[Quoted message begins]\nOriginal content unavailable\n[Quoted message ends]\n`;
}
/** Render the per-message dynamic metadata block (images / voice / ASR). */
function buildDynamicCtx(input) {
	const lines = [];
	if (input.imageUrls.length > 0) lines.push(`- Images: ${input.imageUrls.join(", ")}`);
	if (input.uniqueVoicePaths.length > 0 || input.uniqueVoiceUrls.length > 0) lines.push(`- Voice: ${[...input.uniqueVoicePaths, ...input.uniqueVoiceUrls].join(", ")}`);
	if (input.uniqueVoiceAsrReferTexts.length > 0) lines.push(`- ASR: ${input.uniqueVoiceAsrReferTexts.join(" | ")}`);
	return lines.length > 0 ? lines.join("\n") + "\n\n" : "";
}
/** Combine account-level system prompt with group-specific prompts. */
function buildGroupSystemPrompt(accountSystemInstruction, groupInfo) {
	const parts = [];
	if (accountSystemInstruction) parts.push(accountSystemInstruction);
	if (groupInfo?.display.introHint) parts.push(groupInfo.display.introHint);
	if (groupInfo?.display.behaviorPrompt) parts.push(groupInfo.display.behaviorPrompt);
	return parts.filter(Boolean).join("\n") || void 0;
}
/** Classify image URLs into local vs remote and de-duplicate voice arrays. */
function classifyMedia(processed) {
	const localMediaPaths = [];
	const localMediaTypes = [];
	const remoteMediaUrls = [];
	const remoteMediaTypes = [];
	for (let i = 0; i < processed.imageUrls.length; i++) {
		const u = processed.imageUrls[i];
		const t = processed.imageMediaTypes[i] ?? "image/png";
		if (u.startsWith("http://") || u.startsWith("https://")) {
			remoteMediaUrls.push(u);
			remoteMediaTypes.push(t);
		} else {
			localMediaPaths.push(u);
			localMediaTypes.push(t);
		}
	}
	const uniqueVoicePaths = [...new Set(processed.voiceAttachmentPaths)];
	const uniqueVoiceUrls = [...new Set(processed.voiceAttachmentUrls)];
	const voiceMediaTypes = [...uniqueVoicePaths, ...uniqueVoiceUrls].map(() => "audio/wav");
	return {
		localMediaPaths,
		localMediaTypes,
		remoteMediaUrls,
		remoteMediaTypes,
		uniqueVoicePaths,
		uniqueVoiceUrls,
		uniqueVoiceAsrReferTexts: [...new Set(processed.voiceAsrReferTexts)].filter(Boolean),
		voiceMediaTypes,
		hasAsrReferFallback: processed.voiceTranscriptSources.includes("asr"),
		voiceTranscriptSources: processed.voiceTranscriptSources
	};
}
const DEFAULT_GROUP_CONFIG = {
	requireMention: true,
	ignoreOtherMentions: false,
	toolPolicy: "restricted",
	name: "",
	historyLimit: 50
};
/** Read a named account's raw `groups` map from an OpenClawConfig. */
function readGroupsMap(cfg, accountId) {
	const groups = asOptionalObjectRecord(resolveAccountBase(cfg, accountId).config.groups);
	if (!groups) return {};
	const normalized = {};
	for (const [key, value] of Object.entries(groups)) {
		const sub = asOptionalObjectRecord(value);
		if (sub) normalized[key] = sub;
	}
	return normalized;
}
function readBoolean(obj, key) {
	const v = obj[key];
	return typeof v === "boolean" ? v : void 0;
}
function readString(obj, key) {
	const v = obj[key];
	return typeof v === "string" && v.length > 0 ? v : void 0;
}
function readToolPolicy(obj, key) {
	const v = obj[key];
	return v === "full" || v === "restricted" || v === "none" ? v : void 0;
}
function readHistoryLimit(obj, key) {
	const v = obj[key];
	if (typeof v !== "number" || !Number.isFinite(v)) return;
	return Math.max(0, Math.floor(v));
}
/**
* Resolve per-group configuration with `specific > "*" > default` precedence.
*
* When `groupOpenid` is not provided, only the wildcard/default values are
* returned. This lets callers query the "default" behaviour for new groups.
*/
function resolveGroupConfig(cfg, groupOpenid, accountId) {
	const groups = readGroupsMap(cfg, accountId);
	const wildcard = groups["*"] ?? {};
	const specific = groupOpenid ? groups[groupOpenid] ?? {} : {};
	return {
		requireMention: readBoolean(specific, "requireMention") ?? readBoolean(wildcard, "requireMention") ?? DEFAULT_GROUP_CONFIG.requireMention,
		ignoreOtherMentions: readBoolean(specific, "ignoreOtherMentions") ?? readBoolean(wildcard, "ignoreOtherMentions") ?? DEFAULT_GROUP_CONFIG.ignoreOtherMentions,
		toolPolicy: readToolPolicy(specific, "toolPolicy") ?? readToolPolicy(wildcard, "toolPolicy") ?? DEFAULT_GROUP_CONFIG.toolPolicy,
		name: readString(specific, "name") ?? readString(wildcard, "name") ?? DEFAULT_GROUP_CONFIG.name,
		prompt: readString(specific, "prompt") ?? readString(wildcard, "prompt"),
		historyLimit: readHistoryLimit(specific, "historyLimit") ?? readHistoryLimit(wildcard, "historyLimit") ?? DEFAULT_GROUP_CONFIG.historyLimit
	};
}
/**
* Resolve all per-inbound group-related settings in one pass.
*
* Prefer this over calling `resolveHistoryLimit` / `resolveRequireMention`
* / etc. individually in hot paths — each of those currently re-walks
* the config tree on its own.
*/
function resolveGroupSettings(params) {
	const config = resolveGroupConfig(params.cfg, params.groupOpenid, params.accountId);
	return {
		config,
		name: config.name || params.groupOpenid.slice(0, 8),
		mentionPatterns: resolveMentionPatterns(params.cfg, params.agentId)
	};
}
/**
* Resolve mentionPatterns with `agent > global > []` precedence.
*
* Mirrors the framework's `messages.groupChat.mentionPatterns` / per-agent
* `agents.list[].groupChat.mentionPatterns` chain.
*/
function resolveMentionPatterns(cfg, agentId) {
	if (agentId) {
		const agents = asOptionalObjectRecord(cfg.agents);
		const agentGroupChat = (Array.isArray(agents?.list) ? agents?.list : []).find((a) => typeof a.id === "string" && a.id.trim().toLowerCase() === agentId.trim().toLowerCase())?.groupChat;
		if (agentGroupChat && Object.hasOwn(agentGroupChat, "mentionPatterns")) {
			const patterns = agentGroupChat.mentionPatterns;
			return Array.isArray(patterns) ? patterns.filter((p) => typeof p === "string") : [];
		}
	}
	const globalGroupChat = asOptionalObjectRecord(asOptionalObjectRecord(cfg.messages)?.groupChat);
	if (globalGroupChat && Object.hasOwn(globalGroupChat, "mentionPatterns")) {
		const patterns = globalGroupChat.mentionPatterns;
		return Array.isArray(patterns) ? patterns.filter((p) => typeof p === "string") : [];
	}
	return [];
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/group-gate-stage.ts
/**
* Group-gate stage — for `type === "group"` inbound events, decide
* whether the message should pass to AI dispatch or be intercepted.
*
* Three possible outcomes:
*   - `{ kind: "pass", groupInfo }` — continue the pipeline
*   - `{ kind: "skip", groupInfo, skipReason }` — buffered to history
*     (if applicable) and short-circuit
*   - No group info at all — returned when the event isn't a group event
*     (caller should treat as a straight pass-through)
*
* Consolidates the control-command auth check, session-store
* activation override, mention detection, and the unified
* {@link resolveGroupMessageGate} call. Delegates all pure logic to
* existing `engine/group/*` modules so this stage remains a thin
* orchestrator.
*/
/**
* Run the group-gate stage.
*
* Precondition: `event.type === "group"` && `event.groupOpenid` is set.
* The caller (pipeline) enforces this; the stage doesn't re-check.
*
* On `skip` outcomes the stage records the message into the group's
* history buffer when the skip reason is one that should preserve
* context (drop / skip_no_mention), then returns. `block` skip
* reasons do NOT write history — they are silent rejects.
*/
function runGroupGateStage(input) {
	const { event, deps, accountId, agentId, sessionKey, userContent, processedAttachments } = input;
	const groupOpenid = event.groupOpenid;
	const cfg = deps.cfg ?? {};
	const settings = resolveGroupSettings({
		cfg,
		groupOpenid,
		accountId,
		agentId
	});
	const { historyLimit, requireMention, ignoreOtherMentions } = settings.config;
	const behaviorPrompt = settings.config.prompt ?? "If the sender is a bot, respond only when they explicitly @mention you to ask a question or request assistance with a specific task; keep your replies concise and clear, avoiding the urge to race other bots to answer or engage in lengthy, unproductive exchanges. In group chats, prioritize responding to messages from human users; bots should maintain a collaborative rather than competitive dynamic to ensure the conversation remains orderly and does not result in message flooding.";
	const groupName = settings.name;
	const explicitWasMentioned = detectWasMentioned({
		eventType: event.eventType,
		mentions: event.mentions,
		content: event.content,
		mentionPatterns: settings.mentionPatterns
	});
	const anyMention = hasAnyMention({
		mentions: event.mentions,
		content: event.content
	});
	const implicitMention = resolveImplicitMention({
		refMsgIdx: event.refMsgIdx,
		getRefEntry: (idx) => getRefIndex(idx) ?? null
	});
	const activation = resolveGroupActivation({
		cfg,
		agentId: agentId ?? "default",
		sessionKey,
		configRequireMention: requireMention,
		sessionStoreReader: deps.sessionStoreReader
	});
	const content = (event.content ?? "").trim();
	const isControlCommand = Boolean(deps.isControlCommand?.(content));
	const commandAuthorized = deps.allowTextCommands !== false && isSenderAllowedForCommands(event.senderId, deps);
	const gate = resolveGateWithPort({
		mentionGatePort: deps.adapters.mentionGate,
		ignoreOtherMentions,
		hasAnyMention: anyMention,
		wasMentioned: explicitWasMentioned,
		implicitMention,
		allowTextCommands: deps.allowTextCommands !== false,
		isControlCommand,
		commandAuthorized,
		requireMention: activation === "mention"
	});
	const introHint = deps.resolveGroupIntroHint?.({
		cfg,
		accountId,
		groupId: groupOpenid
	});
	const senderLabel = event.senderName ? `${event.senderName} (${event.senderId})` : event.senderId;
	const groupInfo = {
		gate,
		activation,
		historyLimit,
		isMerged: isMergedTurn(event),
		mergedMessages: event.merge?.messages,
		display: {
			groupName,
			senderLabel,
			introHint,
			behaviorPrompt
		}
	};
	if (gate.action === "pass") return {
		kind: "pass",
		groupInfo
	};
	if (gate.action === "drop_other_mention" || gate.action === "skip_no_mention") recordGroupHistory({
		historyMap: deps.groupHistories,
		groupOpenid,
		historyLimit,
		event,
		userContent,
		historyPort: deps.adapters.history,
		localPaths: processedAttachments?.attachmentLocalPaths
	});
	return {
		kind: "skip",
		groupInfo,
		skipReason: gate.action
	};
}
/**
* Resolve the gate using the SDK MentionGatePort adapter.
*
* Layer 1 (ignoreOtherMentions) is QQ-specific and handled here.
* Layers 2+3 delegate to the SDK's `resolveInboundMentionDecision`.
*/
function resolveGateWithPort(params) {
	if (params.ignoreOtherMentions && params.hasAnyMention && !params.wasMentioned && !params.implicitMention) return {
		action: "drop_other_mention",
		effectiveWasMentioned: false,
		shouldBypassMention: false
	};
	const decision = params.mentionGatePort.resolveInboundMentionDecision({
		facts: {
			canDetectMention: true,
			wasMentioned: params.wasMentioned,
			hasAnyMention: params.hasAnyMention,
			implicitMentionKinds: params.implicitMention ? ["reply_to_bot"] : []
		},
		policy: {
			isGroup: true,
			requireMention: params.requireMention,
			allowTextCommands: params.allowTextCommands,
			hasControlCommand: params.isControlCommand,
			commandAuthorized: params.commandAuthorized
		}
	});
	if (params.allowTextCommands && params.isControlCommand && !params.commandAuthorized) return {
		action: "block_unauthorized_command",
		effectiveWasMentioned: false,
		shouldBypassMention: false
	};
	if (decision.shouldSkip) return {
		action: "skip_no_mention",
		effectiveWasMentioned: decision.effectiveWasMentioned,
		shouldBypassMention: decision.shouldBypassMention
	};
	return {
		action: "pass",
		effectiveWasMentioned: decision.effectiveWasMentioned,
		shouldBypassMention: decision.shouldBypassMention
	};
}
/**
* Test whether the sender is on the DM `allowFrom` list.
*/
function isSenderAllowedForCommands(senderId, deps) {
	const raw = deps.account.config?.allowFrom;
	if (!Array.isArray(raw) || raw.length === 0) return true;
	const normalized = normalizeQQBotAllowFrom(raw);
	return createQQBotSenderMatcher(senderId)(normalized);
}
function recordGroupHistory(params) {
	const { historyMap, groupOpenid, historyLimit, event, userContent, historyPort, localPaths } = params;
	if (!historyMap || historyLimit <= 0) return;
	const entry = {
		sender: event.senderName ? `${event.senderName} (${event.senderId})` : event.senderId,
		body: userContent,
		timestamp: new Date(event.timestamp).getTime(),
		messageId: event.messageId,
		attachments: toAttachmentSummaries(event.attachments, localPaths)
	};
	historyPort.recordPendingHistoryEntry({
		historyMap,
		historyKey: groupOpenid,
		limit: historyLimit,
		entry
	});
}
//#endregion
//#region extensions/qqbot/src/engine/ref/format-message-ref.ts
/**
* Format a quoted message reference into human-readable text for model context.
*
* This mirrors the independent version's `formatMessageReferenceForAgent` —
* processing attachments (download + STT) and combining them with parsed text.
*
* @param ref - The msg_elements[0] data from the QQ push event.
* @param ctx - Context containing appId, peerId, config, and logger.
* @param processor - Injected attachment processor (download + voice transcription).
*/
async function formatMessageReferenceForAgent(ref, ctx, processor) {
	if (!ref) return "";
	const { attachmentInfo, voiceTranscripts, voiceTranscriptSources, attachmentLocalPaths } = await processor.processAttachments(ref.attachments, ctx);
	const voiceText = processor.formatVoiceText(voiceTranscripts);
	const parsedContent = parseFaceTags(ref.content ?? "");
	const userContent = voiceText ? (parsedContent.trim() ? `${parsedContent}\n${voiceText}` : voiceText) + attachmentInfo : parsedContent + attachmentInfo;
	const attSummaries = buildAttachmentSummaries(ref.attachments, attachmentLocalPaths);
	if (attSummaries && voiceTranscripts.length > 0) {
		let voiceIdx = 0;
		for (const att of attSummaries) if (att.type === "voice" && voiceIdx < voiceTranscripts.length) {
			att.transcript = voiceTranscripts[voiceIdx];
			if (voiceIdx < voiceTranscriptSources.length) att.transcriptSource = voiceTranscriptSources[voiceIdx];
			voiceIdx++;
		}
	}
	const formattedAttachments = formatRefEntryForAgent({
		content: userContent.trim(),
		senderId: "",
		timestamp: Date.now(),
		attachments: attSummaries
	});
	if (formattedAttachments !== "[empty message]") return formattedAttachments;
	return userContent.trim() || "";
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/quote-stage.ts
/**
* Quote stage — resolve the quoted-reply (`refMsgIdx`) if any.
*
* Three-level fallback mirrors the standalone build:
*   1. RefIndex cache hit → rich ReplyToInfo
*   2. `msg_elements[0]` present → re-process the quoted body
*   3. Otherwise → id-only placeholder so the pipeline still knows it's a reply
*/
/**
* Resolve the quote metadata for an inbound event.
*
* Returns `undefined` when the event is not a reply at all.
*/
async function resolveQuote(event, deps) {
	if (!event.refMsgIdx) return;
	const { account, log } = deps;
	const refEntry = getRefIndex(event.refMsgIdx);
	if (refEntry) {
		log?.debug?.(`Quote detected via refMsgIdx cache: refMsgIdx=${event.refMsgIdx}, sender=${refEntry.senderName ?? refEntry.senderId}`);
		return {
			id: event.refMsgIdx,
			body: formatRefEntryForAgent(refEntry),
			sender: refEntry.senderName ?? refEntry.senderId,
			isQuote: true
		};
	}
	if (event.msgType === 103 && event.msgElements?.[0]) try {
		const refElement = event.msgElements[0];
		const refData = {
			content: refElement.content ?? "",
			attachments: refElement.attachments
		};
		const attachmentProcessor = {
			processAttachments: async (atts, refCtx) => {
				const result = await processAttachments(atts, {
					accountId: account.accountId,
					cfg: refCtx.cfg,
					audioConvert: deps.adapters.audioConvert,
					log: refCtx.log
				});
				return {
					attachmentInfo: result.attachmentInfo,
					voiceTranscripts: result.voiceTranscripts,
					voiceTranscriptSources: result.voiceTranscriptSources,
					attachmentLocalPaths: result.attachmentLocalPaths
				};
			},
			formatVoiceText: (transcripts) => formatVoiceText(transcripts)
		};
		const refPeerId = event.type === "group" && event.groupOpenid ? event.groupOpenid : event.senderId;
		const refBody = await formatMessageReferenceForAgent(refData, {
			appId: account.appId,
			peerId: refPeerId,
			cfg: account.config,
			log
		}, attachmentProcessor);
		log?.debug?.(`Quote detected via msg_elements[0] (cache miss): id=${event.refMsgIdx}, content="${(refBody ?? "").slice(0, 80)}..."`);
		return {
			id: event.refMsgIdx,
			body: refBody || void 0,
			isQuote: true
		};
	} catch (refErr) {
		log?.error(`Failed to format quoted message from msg_elements: ${String(refErr)}`);
	}
	else log?.debug?.(`Quote detected but no cache and msgType=${event.msgType}: refMsgIdx=${event.refMsgIdx}`);
	return {
		id: event.refMsgIdx,
		isQuote: true
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/stages/refidx-stage.ts
/**
* RefIdx persistence stage — writes the current message into the shared
* `refIndex` cache so future quote resolutions can find it.
*
* The stage also attaches voice transcripts (and their source) onto the
* cached attachment summaries so replies-to-this-message can render the
* original audio content inline instead of just a file handle.
*
* Pure data pipeline (no network I/O). Sync return value.
*/
/**
* Cache the current message under `msgIdx` (or the fallback `refIdx`
* returned by the typing-indicator call) so later quotes resolve.
*
* No-op when neither id is available.
*/
function writeRefIndex(params) {
	const { event, parsedContent, processed, inputNotifyRefIdx } = params;
	const currentMsgIdx = event.msgIdx ?? inputNotifyRefIdx;
	if (!currentMsgIdx) return;
	const attSummaries = buildAttachmentSummaries(event.attachments, processed.attachmentLocalPaths);
	if (attSummaries && processed.voiceTranscripts.length > 0) {
		let voiceIdx = 0;
		for (const att of attSummaries) if (att.type === "voice" && voiceIdx < processed.voiceTranscripts.length) {
			att.transcript = processed.voiceTranscripts[voiceIdx];
			if (voiceIdx < processed.voiceTranscriptSources.length) att.transcriptSource = processed.voiceTranscriptSources[voiceIdx];
			voiceIdx++;
		}
	}
	setRefIndex(currentMsgIdx, {
		content: parsedContent,
		senderId: event.senderId,
		senderName: event.senderName,
		timestamp: new Date(event.timestamp).getTime(),
		attachments: attSummaries
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/inbound-pipeline.ts
/**
* Process a raw queued message through the full inbound pipeline.
*
* Returns an {@link InboundContext} with `blocked` / `skipped` set when
* the message should not reach the AI dispatcher.
*/
async function buildInboundContext(event, deps) {
	const { account, log } = deps;
	const accessResult = runAccessStage(event, deps);
	if (accessResult.kind === "block") return accessResult.context;
	const { isGroupChat, peerId, qualifiedTarget, fromAddress, route, access } = accessResult;
	const typingPromise = deps.startTyping(event);
	const processed = await processAttachments(event.attachments, {
		accountId: account.accountId,
		cfg: deps.cfg,
		audioConvert: deps.adapters.audioConvert,
		log
	});
	const { parsedContent, userContent } = buildUserContent({
		event,
		attachmentInfo: processed.attachmentInfo,
		voiceTranscripts: processed.voiceTranscripts
	});
	const replyTo = await resolveQuote(event, deps);
	const typingResult = await typingPromise;
	writeRefIndex({
		event,
		parsedContent,
		processed,
		inputNotifyRefIdx: typingResult.refIdx
	});
	let groupInfo;
	if (event.type === "group" && event.groupOpenid) {
		const gateOutcome = runGroupGateStage({
			event,
			deps,
			accountId: account.accountId,
			agentId: route.agentId,
			sessionKey: route.sessionKey,
			userContent,
			processedAttachments: processed
		});
		if (gateOutcome.kind === "skip") {
			typingResult.keepAlive?.stop();
			return buildSkippedInboundContext({
				event,
				route,
				isGroupChat: true,
				peerId,
				qualifiedTarget,
				fromAddress,
				group: gateOutcome.groupInfo,
				skipReason: gateOutcome.skipReason,
				access,
				typing: { keepAlive: typingResult.keepAlive },
				inputNotifyRefIdx: typingResult.refIdx
			});
		}
		groupInfo = gateOutcome.groupInfo;
	}
	const body = buildBody({
		event,
		deps,
		userContent,
		isGroupChat,
		imageUrls: processed.imageUrls
	});
	const quotePart = buildQuotePart(replyTo);
	const media = classifyMedia(processed);
	const dynamicCtx = buildDynamicCtx({
		imageUrls: processed.imageUrls,
		uniqueVoicePaths: media.uniqueVoicePaths,
		uniqueVoiceUrls: media.uniqueVoiceUrls,
		uniqueVoiceAsrReferTexts: media.uniqueVoiceAsrReferTexts
	});
	const userMessage = buildUserMessage({
		event,
		userContent,
		quotePart,
		isGroupChat,
		groupInfo
	});
	const agentBody = buildAgentBody({
		event,
		userContent,
		userMessage,
		dynamicCtx,
		isGroupChat,
		groupInfo,
		deps
	});
	const systemPrompts = [];
	if (account.systemPrompt) systemPrompts.push(account.systemPrompt);
	const groupSystemPrompt = buildGroupSystemPrompt(systemPrompts.length > 0 ? systemPrompts.join("\n") : "", groupInfo);
	const commandAuthorized = resolveCommandAuthorized(access);
	return {
		event,
		route,
		isGroupChat,
		peerId,
		qualifiedTarget,
		fromAddress,
		parsedContent,
		userContent,
		quotePart,
		dynamicCtx,
		userMessage,
		agentBody,
		body,
		systemPrompts,
		groupSystemPrompt,
		attachments: processed,
		localMediaPaths: media.localMediaPaths,
		localMediaTypes: media.localMediaTypes,
		remoteMediaUrls: media.remoteMediaUrls,
		remoteMediaTypes: media.remoteMediaTypes,
		uniqueVoicePaths: media.uniqueVoicePaths,
		uniqueVoiceUrls: media.uniqueVoiceUrls,
		uniqueVoiceAsrReferTexts: media.uniqueVoiceAsrReferTexts,
		voiceMediaTypes: media.voiceMediaTypes,
		hasAsrReferFallback: media.hasAsrReferFallback,
		voiceTranscriptSources: media.voiceTranscriptSources,
		replyTo,
		commandAuthorized,
		group: groupInfo,
		blocked: false,
		skipped: false,
		accessDecision: access.decision,
		typing: { keepAlive: typingResult.keepAlive },
		inputNotifyRefIdx: typingResult.refIdx
	};
}
/**
* Clear a group's pending history buffer. Exposed so the gateway can
* call it in its `finally` block after a reply attempt.
*/
function clearGroupPendingHistory(params) {
	if (!params.historyMap || !params.groupOpenid) return;
	params.historyPort.clearPendingHistory({
		historyMap: params.historyMap,
		historyKey: params.groupOpenid,
		limit: params.historyLimit
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/interaction-handler.ts
/**
* INTERACTION_CREATE event handler.
*
* Handles three interaction branches:
*
* 1. **Config query**  (type=2001) — reads config, ACKs with `claw_cfg`.
* 2. **Config update** (type=2002) — writes config, ACKs with updated snapshot.
* 3. **Approval button** (other)   — ACKs, resolves approval via PlatformAdapter.
*
* Config query/update require `runtime.config`. When unavailable, those
* branches fall through to a bare ACK (backward-compatible).
*/
/**
* Build the canonical `claw_cfg` snapshot returned in interaction ACKs.
*
* Pure function — all resolution helpers live in engine/config/.
*/
function buildClawCfgSnapshot(cfg, accountId, groupOpenid, runtime) {
	const groupCfg = groupOpenid ? resolveGroupConfig(cfg, groupOpenid, accountId) : null;
	const acctCfg = resolveAccountBase(cfg, accountId).config;
	const policies = resolveQQBotEffectivePolicies({
		allowFrom: acctCfg.allowFrom,
		groupAllowFrom: acctCfg.groupAllowFrom,
		dmPolicy: acctCfg.dmPolicy,
		groupPolicy: acctCfg.groupPolicy
	});
	const requireMentionMode = groupCfg?.requireMention ?? true ? "mention" : "always";
	const interactionAgentId = groupOpenid ? runtime.channel.routing.resolveAgentRoute({
		cfg,
		channel: "qqbot",
		accountId,
		peer: {
			kind: "group",
			id: groupOpenid
		}
	})?.agentId : void 0;
	return {
		channel_type: "qqbot",
		channel_ver: getPluginVersion(),
		claw_type: "openclaw",
		claw_ver: getFrameworkVersion(),
		require_mention: requireMentionMode,
		group_policy: policies.groupPolicy,
		mention_patterns: resolveMentionPatterns(cfg, interactionAgentId).join(","),
		online_state: "online"
	};
}
/** Apply a config-update interaction and return the updated claw_cfg. */
async function applyConfigUpdate(event, accountId, runtime, log) {
	const configApi = runtime.config;
	if (!configApi) throw new Error("runtime.config not available");
	const clawCfgUpdate = (event.data?.resolved)?.claw_cfg;
	const groupOpenid = event.group_openid ?? "";
	const currentCfg = structuredClone(configApi.current());
	let changed = false;
	if (clawCfgUpdate?.require_mention !== void 0 && groupOpenid) {
		applyRequireMentionUpdate(currentCfg, accountId, groupOpenid, clawCfgUpdate);
		changed = true;
	}
	if (changed) {
		await configApi.replaceConfigFile({
			nextConfig: currentCfg,
			afterWrite: { mode: "auto" }
		});
		log?.info(`Config updated via interaction ${event.id}: require_mention=${String(clawCfgUpdate?.require_mention)}, group=${groupOpenid}`);
	}
	return buildClawCfgSnapshot(changed ? configApi.current() : currentCfg, accountId, groupOpenid, runtime);
}
/** Mutate `cfg` in place to apply a require_mention update for a group. */
function applyRequireMentionUpdate(cfg, accountId, groupOpenid, update) {
	const requireMentionBool = update.require_mention === "mention";
	const qqbot = (cfg.channels ?? {}).qqbot ?? {};
	if (accountId !== "default" && Boolean(qqbot.accounts?.[accountId])) {
		const accounts = qqbot.accounts ?? {};
		const acct = accounts[accountId] ?? {};
		const groups = acct.groups ?? {};
		groups[groupOpenid] = {
			...groups[groupOpenid],
			requireMention: requireMentionBool
		};
		acct.groups = groups;
		accounts[accountId] = acct;
		qqbot.accounts = accounts;
	} else {
		const groups = qqbot.groups ?? {};
		groups[groupOpenid] = {
			...groups[groupOpenid],
			requireMention: requireMentionBool
		};
		qqbot.groups = groups;
	}
}
/**
* Create the INTERACTION_CREATE event handler.
*
* Returns a fire-and-forget callback that `GatewayConnection` calls
* on every `action: "interaction"` dispatch result.
*/
function createInteractionHandler(account, runtime, log) {
	return (event) => {
		const creds = accountToCreds(account);
		const type = event.data?.type;
		if (type === InteractionType.CONFIG_QUERY && runtime.config) {
			handleWithAck(creds, event, log, "CONFIG_QUERY", () => {
				return buildClawCfgSnapshot(runtime.config.current(), account.accountId, event.group_openid ?? "", runtime);
			});
			return;
		}
		if (type === InteractionType.CONFIG_UPDATE && runtime.config) {
			handleWithAck(creds, event, log, "CONFIG_UPDATE", () => applyConfigUpdate(event, account.accountId, runtime, log));
			return;
		}
		acknowledgeInteraction(creds, event.id).catch((err) => {
			log?.error(`Interaction ACK failed: ${err instanceof Error ? err.message : String(err)}`);
		});
		const parsed = parseApprovalButtonData(event.data?.resolved?.button_data ?? "");
		if (!parsed) return;
		const adapter = getPlatformAdapter();
		if (!adapter.resolveApproval) {
			log?.error("resolveApproval not available on PlatformAdapter");
			return;
		}
		adapter.resolveApproval(parsed.approvalId, parsed.decision).then((ok) => {
			if (ok) log?.info(`Approval resolved: id=${parsed.approvalId}, decision=${parsed.decision}`);
			else log?.error(`Approval resolve failed: id=${parsed.approvalId}`);
		});
	};
}
/** Execute an async handler, ACK with the result, and handle errors. */
async function handleWithAck(creds, event, log, label, handler) {
	try {
		const clawCfg = await handler();
		await acknowledgeInteraction(creds, event.id, 0, { claw_cfg: clawCfg });
		log?.info(`Interaction ACK (${label}) sent: ${event.id}`);
	} catch (err) {
		log?.error(`${label} interaction failed: ${err instanceof Error ? err.message : String(err)}`);
		acknowledgeInteraction(creds, event.id).catch(() => {});
	}
}
//#endregion
//#region extensions/qqbot/src/engine/utils/image-size.ts
/**
* Image dimension helpers for QQ Bot markdown image syntax.
*
* QQ Bot markdown images use `![#widthpx #heightpx](url)`.
*/
/** Default dimensions used when probing fails. */
const DEFAULT_IMAGE_SIZE = {
	width: 512,
	height: 512
};
/**
* Parse image dimensions from the PNG header.
*/
function parsePngSize(buffer) {
	if (buffer.length < 24) return null;
	if (buffer[0] !== 137 || buffer[1] !== 80 || buffer[2] !== 78 || buffer[3] !== 71) return null;
	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	};
}
/** Parse image dimensions from JPEG SOF0/SOF2 markers. */
function parseJpegSize(buffer) {
	if (buffer.length < 4) return null;
	if (buffer[0] !== 255 || buffer[1] !== 216) return null;
	let offset = 2;
	while (offset < buffer.length - 9) {
		if (buffer[offset] !== 255) {
			offset++;
			continue;
		}
		const marker = buffer[offset + 1];
		if (marker === 192 || marker === 194) {
			if (offset + 9 <= buffer.length) {
				const height = buffer.readUInt16BE(offset + 5);
				return {
					width: buffer.readUInt16BE(offset + 7),
					height
				};
			}
		}
		if (offset + 3 < buffer.length) {
			const blockLength = buffer.readUInt16BE(offset + 2);
			offset += 2 + blockLength;
		} else break;
	}
	return null;
}
/** Parse image dimensions from the GIF header. */
function parseGifSize(buffer) {
	if (buffer.length < 10) return null;
	const signature = buffer.toString("ascii", 0, 6);
	if (signature !== "GIF87a" && signature !== "GIF89a") return null;
	return {
		width: buffer.readUInt16LE(6),
		height: buffer.readUInt16LE(8)
	};
}
/** Parse image dimensions from WebP headers. */
function parseWebpSize(buffer) {
	if (buffer.length < 30) return null;
	const riff = buffer.toString("ascii", 0, 4);
	const webp = buffer.toString("ascii", 8, 12);
	if (riff !== "RIFF" || webp !== "WEBP") return null;
	const chunkType = buffer.toString("ascii", 12, 16);
	if (chunkType === "VP8 ") {
		if (buffer.length >= 30 && buffer[23] === 157 && buffer[24] === 1 && buffer[25] === 42) return {
			width: buffer.readUInt16LE(26) & 16383,
			height: buffer.readUInt16LE(28) & 16383
		};
	}
	if (chunkType === "VP8L") {
		if (buffer.length >= 25 && buffer[20] === 47) {
			const bits = buffer.readUInt32LE(21);
			return {
				width: (bits & 16383) + 1,
				height: (bits >> 14 & 16383) + 1
			};
		}
	}
	if (chunkType === "VP8X") {
		if (buffer.length >= 30) return {
			width: (buffer[24] | buffer[25] << 8 | buffer[26] << 16) + 1,
			height: (buffer[27] | buffer[28] << 8 | buffer[29] << 16) + 1
		};
	}
	return null;
}
/** Parse image dimensions from raw image bytes. */
function parseImageSize(buffer) {
	return parsePngSize(buffer) ?? parseJpegSize(buffer) ?? parseGifSize(buffer) ?? parseWebpSize(buffer);
}
/**
* SSRF policy for image-dimension probing.  Generic public-network-only blocking
* (no hostname allowlist) because markdown image URLs can legitimately point to
* any public host, not just QQ-owned CDNs.
*/
const IMAGE_PROBE_SSRF_POLICY = {};
/**
* Fetch image dimensions from a public URL using only the first 64 KB.
*
* Uses {@link fetchRemoteMedia} with SSRF guard to block probes against
* private/reserved/loopback/link-local/metadata destinations.
*/
async function getImageSizeFromUrl(url, timeoutMs = 5e3) {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const { buffer } = await getPlatformAdapter().fetchMedia({
				url,
				maxBytes: 65536,
				maxRedirects: 0,
				ssrfPolicy: IMAGE_PROBE_SSRF_POLICY,
				requestInit: {
					signal: controller.signal,
					headers: {
						Range: "bytes=0-65535",
						"User-Agent": "QQBot-Image-Size-Detector/1.0"
					}
				}
			});
			const size = parseImageSize(buffer);
			if (size) debugLog(`[image-size] Got size from URL: ${size.width}x${size.height} - ${url.slice(0, 60)}...`);
			return size;
		} finally {
			clearTimeout(timeoutId);
		}
	} catch (err) {
		debugLog(`[image-size] Error fetching ${url.slice(0, 60)}...: ${formatErrorMessage(err)}`);
		return null;
	}
}
/** Parse image dimensions from a Base64 data URL. */
function getImageSizeFromDataUrl(dataUrl) {
	try {
		const matches = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
		if (!matches) return null;
		const base64Data = matches[1];
		const size = parseImageSize(Buffer$1.from(base64Data, "base64"));
		if (size) debugLog(`[image-size] Got size from Base64: ${size.width}x${size.height}`);
		return size;
	} catch (err) {
		debugLog(`[image-size] Error parsing Base64: ${formatErrorMessage(err)}`);
		return null;
	}
}
/**
* Resolve image dimensions from either an HTTP URL or a Base64 data URL.
*/
async function getImageSize(source) {
	if (source.startsWith("data:")) return getImageSizeFromDataUrl(source);
	if (source.startsWith("http://") || source.startsWith("https://")) return getImageSizeFromUrl(source);
	return null;
}
/** Format a markdown image with QQ Bot width/height annotations. */
function formatQQBotMarkdownImage(url, size) {
	const { width, height } = size ?? DEFAULT_IMAGE_SIZE;
	return `![#${width}px #${height}px](${url})`;
}
/** Return true when markdown already contains QQ Bot size annotations. */
function hasQQBotImageSize(markdownImage) {
	return /!\[#\d+px\s+#\d+px\]/.test(markdownImage);
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/decode-media-path.ts
/**
* Normalize a file path by expanding `~` to the home directory and trimming.
*
* This is a minimal re-implementation of `utils/platform.ts#normalizePath`
* so that `core/` remains self-contained.
*/
function normalizePath(p) {
	let result = p.trim();
	if (result.startsWith("~/") || result === "~") {
		const home = typeof process !== "undefined" ? process.env.HOME ?? process.env.USERPROFILE : void 0;
		if (home) result = result === "~" ? home : `${home}${result.slice(1)}`;
	}
	return result;
}
/**
* Decode a media path by stripping `MEDIA:`, expanding `~`, and unescaping
* octal/UTF-8 byte sequences.
*
* @param raw - Raw path string from a media tag.
* @param log - Optional logger for decode diagnostics.
* @returns The decoded, normalized media path.
*/
function decodeMediaPath(raw, log) {
	let mediaPath = raw;
	if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
	mediaPath = normalizePath(mediaPath);
	mediaPath = mediaPath.replace(/\\\\/g, "\\");
	const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
	try {
		const hasOctal = /\\[0-7]{1,3}/.test(mediaPath);
		const hasNonASCII = /[\u0080-\u00FF]/.test(mediaPath);
		if (!isWinLocal && (hasOctal || hasNonASCII)) {
			log?.debug?.(`Decoding path with mixed encoding: ${mediaPath}`);
			const decoded = mediaPath.replace(/\\([0-7]{1,3})/g, (_, octal) => {
				return String.fromCharCode(Number.parseInt(octal, 8));
			});
			const bytes = [];
			for (let i = 0; i < decoded.length; i++) {
				const code = decoded.charCodeAt(i);
				if (code <= 255) bytes.push(code);
				else {
					const charBytes = Buffer.from(decoded[i], "utf8");
					bytes.push(...charBytes);
				}
			}
			const utf8Decoded = Buffer.from(bytes).toString("utf8");
			if (!utf8Decoded.includes("�") || utf8Decoded.length < decoded.length) {
				mediaPath = utf8Decoded;
				log?.debug?.(`Successfully decoded path: ${mediaPath}`);
			}
		}
	} catch (decodeErr) {
		log?.error(`Path decode error: ${String(decodeErr)}`);
	}
	return mediaPath;
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/outbound-deliver.ts
/** Maximum text length for a single QQ Bot message. */
const TEXT_CHUNK_LIMIT = 5e3;
function resolveMediaTargetContext(event, account) {
	return {
		targetType: event.type === "c2c" ? "c2c" : event.type === "group" ? "group" : event.type === "dm" ? "dm" : "channel",
		targetId: event.type === "c2c" ? event.senderId : event.type === "group" ? event.groupOpenid : event.type === "dm" ? event.guildId : event.channelId,
		account,
		replyToId: event.messageId
	};
}
async function autoMediaBatch(params) {
	for (const mediaUrl of params.mediaUrls) try {
		const result = await params.mediaSender.sendMedia({
			to: params.qualifiedTarget,
			text: "",
			mediaUrl,
			accountId: params.account.accountId,
			replyToId: params.replyToId,
			account: params.account
		});
		if (result.error) {
			params.log?.error(params.onResultError(mediaUrl, result.error));
			continue;
		}
		const successMessage = params.onSuccess?.(mediaUrl);
		if (successMessage) params.log?.info(successMessage);
	} catch (err) {
		params.log?.error(params.onThrownError(mediaUrl, formatErrorMessage(err)));
	}
}
async function sendTextChunkToTarget(params) {
	const { account, event, text, consumeQuoteRef, allowDm } = params;
	const ref = consumeQuoteRef();
	const target = buildDeliveryTarget(event);
	if (target.type === "dm" && !allowDm) return;
	return await sendText(target, text, accountToCreds(account), {
		msgId: event.messageId,
		messageReference: ref
	});
}
async function sendTextChunks(text, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	await sendTextChunksWithRetry({
		account,
		event,
		chunks: deps.chunkText(text, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `Sent text chunk (${chunk.length}/${text.length} chars): ${chunk.slice(0, 50)}...`,
		onError: (err) => `Failed to send text chunk: ${formatErrorMessage(err)}`
	});
}
async function sendTextChunksWithRetry(params) {
	const { account, event, chunks, sendWithRetry, consumeQuoteRef, allowDm, log } = params;
	for (const chunk of chunks) try {
		await sendWithRetry((token) => sendTextChunkToTarget({
			account,
			event,
			token,
			text: chunk,
			consumeQuoteRef,
			allowDm
		}));
		log?.info(params.onSuccess(chunk));
	} catch (err) {
		log?.error(params.onError(err));
	}
}
async function sendWithResultLogging(params) {
	try {
		const result = await params.run();
		if (result.error) {
			params.log?.error(params.onError(result.error));
			return;
		}
		const successMessage = params.onSuccess?.();
		if (successMessage) params.log?.info(successMessage);
	} catch (err) {
		params.log?.error(params.onError(formatErrorMessage(err)));
	}
}
async function sendPhotoWithLogging(params) {
	await sendWithResultLogging({
		run: async () => await params.mediaSender.sendPhoto(params.target, params.imageUrl),
		log: params.log,
		onSuccess: params.onSuccess ? () => params.onSuccess?.(params.imageUrl) : void 0,
		onError: params.onError
	});
}
/** Send voice with a 45s timeout guard. */
async function sendVoiceWithTimeout(target, voicePath, account, mediaSender, log) {
	const uploadFormats = account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats;
	const transcodeEnabled = account.config?.audioFormatPolicy?.transcodeEnabled !== false;
	const voiceTimeout = 45e3;
	const ac = new AbortController();
	try {
		const result = await Promise.race([mediaSender.sendVoice(target, voicePath, uploadFormats, transcodeEnabled).then((r) => {
			if (ac.signal.aborted) {
				log?.debug?.(`sendVoice completed after timeout, suppressing late delivery`);
				return {
					channel: "qqbot",
					error: "Voice send completed after timeout (suppressed)"
				};
			}
			return r;
		}), new Promise((resolve) => setTimeout(() => {
			ac.abort();
			resolve({
				channel: "qqbot",
				error: "Voice send timed out and was skipped"
			});
		}, voiceTimeout))]);
		if (result.error) log?.error(`sendVoice error: ${result.error}`);
	} catch (err) {
		log?.error(`sendVoice unexpected error: ${formatErrorMessage(err)}`);
	}
}
/**
* Parse media tags from the reply text and send them in order.
*
* @returns `true` when media tags were found and handled; `false` when the caller
* should continue through the plain-text pipeline.
*/
async function parseAndSendMediaTags(replyText, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const text = normalizeMediaTags(replyText);
	const mediaTagMatches = [...text.matchAll(/<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi)];
	if (mediaTagMatches.length === 0) return {
		handled: false,
		normalizedText: text
	};
	const tagCounts = mediaTagMatches.reduce((acc, m) => {
		const t = normalizeLowercaseStringOrEmpty(m[1]);
		acc[t] = (acc[t] ?? 0) + 1;
		return acc;
	}, {});
	log?.debug?.(`Detected media tags: ${Object.entries(tagCounts).map(([k, v]) => `${v} <${k}>`).join(", ")}`);
	const sendQueue = [];
	let lastIndex = 0;
	const regex2 = /<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi;
	let match;
	while ((match = regex2.exec(text)) !== null) {
		const textBefore = text.slice(lastIndex, match.index).replace(/\n{3,}/g, "\n\n").trim();
		if (textBefore) sendQueue.push({
			type: "text",
			content: filterInternalMarkers(textBefore)
		});
		const tagName = normalizeLowercaseStringOrEmpty(match[1]);
		const mediaPath = decodeMediaPath(normalizeOptionalString(match[2]) ?? "", log);
		if (mediaPath) {
			const itemType = {
				qqmedia: "media",
				qqvoice: "voice",
				qqvideo: "video",
				qqfile: "file"
			}[tagName] ?? "image";
			sendQueue.push({
				type: itemType,
				content: mediaPath
			});
			log?.debug?.(`Found ${itemType} in <${tagName}>: ${mediaPath}`);
		}
		lastIndex = match.index + match[0].length;
	}
	const textAfter = text.slice(lastIndex).replace(/\n{3,}/g, "\n\n").trim();
	if (textAfter) sendQueue.push({
		type: "text",
		content: filterInternalMarkers(textAfter)
	});
	log?.debug?.(`Send queue: ${sendQueue.map((item) => item.type).join(" -> ")}`);
	const mediaTarget = resolveMediaTargetContext(event, account);
	for (const item of sendQueue) if (item.type === "text") await sendTextChunks(item.content, event, actx, sendWithRetry, consumeQuoteRef, deps);
	else if (item.type === "image") await sendPhotoWithLogging({
		target: mediaTarget,
		imageUrl: item.content,
		mediaSender: deps.mediaSender,
		log,
		onError: (error) => `sendPhoto error: ${error}`
	});
	else if (item.type === "voice") await sendVoiceWithTimeout(mediaTarget, item.content, account, deps.mediaSender, log);
	else if (item.type === "video") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendVideoMsg(mediaTarget, item.content),
		log,
		onError: (error) => `sendVideoMsg error: ${error}`
	});
	else if (item.type === "file") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendDocument(mediaTarget, item.content),
		log,
		onError: (error) => `sendDocument error: ${error}`
	});
	else if (item.type === "media") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendMedia({
			to: actx.qualifiedTarget,
			text: "",
			mediaUrl: item.content,
			accountId: account.accountId,
			replyToId: event.messageId,
			account
		}),
		log,
		onError: (error) => `sendMedia(auto) error: ${error}`
	});
	return {
		handled: true,
		normalizedText: text
	};
}
/**
* Send a reply that does not contain structured media tags.
* Handles markdown image embeds, Base64 media, plain-text chunking, and local media routing.
*/
async function sendPlainReply(payload, replyText, event, actx, sendWithRetry, consumeQuoteRef, toolMediaUrls, deps) {
	const { account, qualifiedTarget, log } = actx;
	const collectedImageUrls = [];
	const localMediaToSend = [];
	const collectImageUrl = (url) => {
		if (!url) return false;
		const isHttpUrl = url.startsWith("http://") || url.startsWith("https://");
		const isDataUrl = url.startsWith("data:image/");
		if (isHttpUrl || isDataUrl) {
			if (!collectedImageUrls.includes(url)) {
				collectedImageUrls.push(url);
				log?.debug?.(`Collected ${isDataUrl ? "Base64" : "media URL"}: ${isDataUrl ? `(length: ${url.length})` : url.slice(0, 80) + "..."}`);
			}
			return true;
		}
		if (isLocalPath(url)) {
			if (!localMediaToSend.includes(url)) {
				localMediaToSend.push(url);
				log?.debug?.(`Collected local media for auto-routing: ${url}`);
			}
			return true;
		}
		return false;
	};
	if (payload.mediaUrls?.length) for (const url of payload.mediaUrls) collectImageUrl(url);
	if (payload.mediaUrl) collectImageUrl(payload.mediaUrl);
	const mdMatches = [...replyText.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/gi)];
	for (const m of mdMatches) {
		const url = m[2]?.trim();
		if (url && !collectedImageUrls.includes(url)) {
			if (url.startsWith("http://") || url.startsWith("https://")) {
				collectedImageUrls.push(url);
				log?.debug?.(`Extracted HTTP image from markdown: ${url.slice(0, 80)}...`);
			} else if (isLocalPath(url)) {
				if (!localMediaToSend.includes(url)) {
					localMediaToSend.push(url);
					log?.debug?.(`Collected local media from markdown for auto-routing: ${url}`);
				}
			}
		}
	}
	const bareUrlMatches = [...replyText.matchAll(/(?<![(["'])(https?:\/\/[^\s)"'<>]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s"'<>]*)?)/gi)];
	for (const m of bareUrlMatches) {
		const url = m[1];
		if (url && !collectedImageUrls.includes(url)) {
			collectedImageUrls.push(url);
			log?.debug?.(`Extracted bare image URL: ${url.slice(0, 80)}...`);
		}
	}
	const useMarkdown = account.markdownSupport;
	log?.debug?.(`Markdown mode: ${useMarkdown}, images: ${collectedImageUrls.length}`);
	let textWithoutImages = filterInternalMarkers(replyText);
	for (const m of mdMatches) {
		const url = m[2]?.trim();
		if (url && !url.startsWith("http://") && !url.startsWith("https://") && !isLocalPath(url)) textWithoutImages = textWithoutImages.replace(m[0], "").trim();
	}
	if (useMarkdown) await sendMarkdownReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps);
	else await sendPlainTextReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps);
	if (localMediaToSend.length > 0) {
		log?.debug?.(`Sending ${localMediaToSend.length} local media via sendMedia auto-routing`);
		await autoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: localMediaToSend,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (mediaPath) => `Sent local media: ${mediaPath}`,
			onResultError: (mediaPath, error) => `sendMedia(auto) error for ${mediaPath}: ${error}`,
			onThrownError: (mediaPath, error) => `sendMedia(auto) failed for ${mediaPath}: ${error}`
		});
	}
	if (toolMediaUrls.length > 0) {
		log?.debug?.(`Forwarding ${toolMediaUrls.length} tool-collected media URL(s) after block deliver`);
		await autoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: toolMediaUrls,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (mediaUrl) => `Forwarded tool media: ${mediaUrl.slice(0, 80)}...`,
			onResultError: (_mediaUrl, error) => `Tool media forward error: ${error}`,
			onThrownError: (_mediaUrl, error) => `Tool media forward failed: ${error}`
		});
		toolMediaUrls.length = 0;
	}
}
async function sendMarkdownReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const httpImageUrls = [];
	const base64ImageUrls = [];
	for (const url of imageUrls) if (url.startsWith("data:image/")) base64ImageUrls.push(url);
	else if (url.startsWith("http://") || url.startsWith("https://")) httpImageUrls.push(url);
	log?.debug?.(`Image classification: httpUrls=${httpImageUrls.length}, base64=${base64ImageUrls.length}`);
	if (base64ImageUrls.length > 0) {
		log?.debug?.(`Sending ${base64ImageUrls.length} image(s) via Rich Media API...`);
		for (const imageUrl of base64ImageUrls) try {
			const target = buildDeliveryTarget(event);
			const creds = accountToCreds(account);
			if (target.type === "c2c" || target.type === "group") await withTokenRetry(creds, async () => {
				await sendMedia$1({
					target,
					creds,
					kind: "image",
					source: { url: imageUrl },
					msgId: event.messageId
				});
			});
			else log?.debug?.(`${target.type} does not support rich media, skipping Base64 image`);
			log?.debug?.(`Sent Base64 image via Rich Media API (size: ${imageUrl.length} chars)`);
		} catch (imgErr) {
			log?.error(`Failed to send Base64 image via Rich Media API: ${String(imgErr)}`);
		}
	}
	const existingMdUrls = new Set(mdMatches.map((m) => m[2]));
	const imagesToAppend = [];
	for (const url of httpImageUrls) if (!existingMdUrls.has(url)) try {
		const size = await getImageSize(url);
		imagesToAppend.push(formatQQBotMarkdownImage(url, size));
		log?.debug?.(`Formatted HTTP image: ${size ? `${size.width}x${size.height}` : "default size"} - ${url.slice(0, 60)}...`);
	} catch (err) {
		log?.debug?.(`Failed to get image size, using default: ${formatErrorMessage(err)}`);
		imagesToAppend.push(formatQQBotMarkdownImage(url, null));
	}
	let result = textWithoutImages;
	for (const m of mdMatches) {
		const fullMatch = m[0];
		const imgUrl = m[2];
		if ((imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) && !hasQQBotImageSize(fullMatch)) try {
			const size = await getImageSize(imgUrl);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, size));
			log?.debug?.(`Updated image with size: ${size ? `${size.width}x${size.height}` : "default"} - ${imgUrl.slice(0, 60)}...`);
		} catch (err) {
			log?.debug?.(`Failed to get image size for existing md, using default: ${formatErrorMessage(err)}`);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, null));
		}
	}
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (imagesToAppend.length > 0) {
		result = result.trim();
		result = result ? result + "\n\n" + imagesToAppend.join("\n") : imagesToAppend.join("\n");
	}
	if (result.trim()) await sendTextChunksWithRetry({
		account,
		event,
		chunks: deps.chunkText(result, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `Sent markdown chunk (${chunk.length}/${result.length} chars) with ${httpImageUrls.length} HTTP images (${event.type})`,
		onError: (err) => `Failed to send markdown message chunk: ${formatErrorMessage(err)}`
	});
}
async function sendPlainTextReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const imgMediaTarget = resolveMediaTargetContext(event, account);
	let result = textWithoutImages;
	for (const m of mdMatches) result = result.replace(m[0], "").trim();
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (result && event.type !== "c2c") result = result.replace(/([a-zA-Z0-9])\.([a-zA-Z0-9])/g, "$1_$2");
	try {
		for (const imageUrl of imageUrls) await sendPhotoWithLogging({
			target: imgMediaTarget,
			imageUrl,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (nextImageUrl) => `Sent image via sendPhoto: ${nextImageUrl.slice(0, 80)}...`,
			onError: (error) => `Failed to send image: ${error}`
		});
		if (result.trim()) await sendTextChunksWithRetry({
			account,
			event,
			chunks: deps.chunkText(result, TEXT_CHUNK_LIMIT),
			sendWithRetry,
			consumeQuoteRef,
			allowDm: false,
			log,
			onSuccess: (chunk) => `Sent text chunk (${chunk.length}/${result.length} chars) (${event.type})`,
			onError: (err) => `Send failed: ${formatErrorMessage(err)}`
		});
	} catch (err) {
		log?.error(`Send failed: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/reply-dispatcher.ts
/**
* Reply dispatcher — structured payload handling and text routing.
*
* Uses the unified `sender.ts` business function layer for all message
* sending. TTS is injected via `ReplyDispatcherDeps`.
*/
/** Send a message and retry once if the token appears to have expired. */
async function sendWithTokenRetry(appId, clientSecret, sendFn, log, accountId) {
	return withTokenRetry({
		appId,
		clientSecret
	}, sendFn, log, accountId);
}
/** Route a text message to the correct QQ target type. */
async function sendTextToTarget(ctx, text, refIdx) {
	const { target, account } = ctx;
	const deliveryTarget = buildDeliveryTarget(target);
	const creds = accountToCreds(account);
	await withTokenRetry(creds, async () => {
		await sendText(deliveryTarget, text, creds, {
			msgId: target.messageId,
			messageReference: refIdx
		});
	}, ctx.log, account.accountId);
}
/** Best-effort delivery for error text back to the user. */
async function sendErrorToTarget(ctx, errorText) {
	try {
		await sendTextToTarget(ctx, errorText);
	} catch (sendErr) {
		ctx.log?.error(`Failed to send error message: ${String(sendErr)}`);
	}
}
/**
* Handle a structured payload prefixed with `QQBOT_PAYLOAD:`.
* Returns true when the reply was handled here, otherwise false.
*/
async function handleStructuredPayload(ctx, replyText, recordActivity, deps) {
	const { account: _account, log } = ctx;
	const payloadResult = parseQQBotPayload(replyText);
	if (!payloadResult.isPayload) return false;
	if (payloadResult.error) {
		log?.error(`Payload parse error: ${payloadResult.error}`);
		return true;
	}
	if (!payloadResult.payload) return true;
	const parsedPayload = payloadResult.payload;
	const unknownPayload = payloadResult.payload;
	log?.info(`Detected structured payload, type: ${parsedPayload.type}`);
	if (isCronReminderPayload(parsedPayload)) {
		log?.debug?.(`Processing cron_reminder payload`);
		const cronMessage = encodePayloadForCron(parsedPayload);
		const confirmText = `⏰ Reminder scheduled. It will be sent at the configured time: "${parsedPayload.content}"`;
		try {
			await sendTextToTarget(ctx, confirmText);
			log?.debug?.(`Cron reminder confirmation sent, cronMessage: ${cronMessage}`);
		} catch (err) {
			log?.error(`Failed to send cron confirmation: ${formatErrorMessage(err)}`);
		}
		recordActivity();
		return true;
	}
	if (isMediaPayload(parsedPayload)) {
		log?.debug?.(`Processing media payload, mediaType: ${parsedPayload.mediaType}`);
		if (parsedPayload.mediaType === "image") await handleImagePayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "audio") await handleAudioPayload(ctx, parsedPayload, deps);
		else if (parsedPayload.mediaType === "video") await handleVideoPayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "file") await handleFilePayload(ctx, parsedPayload);
		else log?.error(`Unknown media type: ${JSON.stringify(parsedPayload.mediaType)}`);
		recordActivity();
		return true;
	}
	const payloadType = typeof unknownPayload === "object" && unknownPayload !== null && "type" in unknownPayload && typeof unknownPayload.type === "string" ? unknownPayload.type : "unknown";
	log?.error(`Unknown payload type: ${payloadType}`);
	return true;
}
function formatMediaTypeLabel(mediaType) {
	return mediaType[0].toUpperCase() + mediaType.slice(1);
}
function validateStructuredPayloadLocalPath(ctx, payloadPath, mediaType) {
	const allowedPath = resolveQQBotPayloadLocalFilePath(payloadPath);
	if (allowedPath) return allowedPath;
	ctx.log?.error(`Blocked ${mediaType} payload local path outside QQ Bot media storage`);
	return null;
}
function isRemoteHttpUrl(p) {
	return p.startsWith("http://") || p.startsWith("https://");
}
function isInlineImageDataUrl(p) {
	return /^data:image\/[^;]+;base64,/i.test(p);
}
function resolveStructuredPayloadPath(ctx, payload, mediaType) {
	const originalPath = payload.path ?? "";
	const normalizedPath = normalizePath$1(originalPath);
	const isHttpUrl = isRemoteHttpUrl(normalizedPath);
	const resolvedPath = isHttpUrl ? normalizedPath : validateStructuredPayloadLocalPath(ctx, originalPath, mediaType);
	if (!resolvedPath) return null;
	if (!resolvedPath.trim()) {
		ctx.log?.error(`[qqbot:${ctx.account.accountId}] ${formatMediaTypeLabel(mediaType)} missing path`);
		return null;
	}
	return {
		path: resolvedPath,
		isHttpUrl
	};
}
function sanitizeForLog(value, maxLen = 200) {
	return value.replace(/[\r\n\t]/g, " ").replaceAll("\0", " ").slice(0, maxLen);
}
function describeMediaTargetForLog(pathValue, isHttpUrl) {
	if (!isHttpUrl) return "<local-file>";
	try {
		const url = new URL(pathValue);
		url.username = "";
		url.password = "";
		const urlId = crypto.createHash("sha256").update(url.toString()).digest("hex").slice(0, 12);
		return sanitizeForLog(`${url.protocol}//${url.host}#${urlId}`);
	} catch {
		return "<invalid-url>";
	}
}
/**
* Read a local file into memory for image base64 inlining.
*
* Non-image media (video / file) should pass `source: { localPath }` to
* `sender.sendMedia` directly — the sender pipeline handles chunked
* routing once this function validates the per-type ceiling.
*/
async function readLocalFileForInlineBase64(filePath, fileType) {
	const opened = await openLocalFile(filePath, { maxSize: getMaxUploadSize(fileType) });
	try {
		return await opened.handle.readFile();
	} finally {
		await opened.close();
	}
}
/**
* Enforce the per-{@link MediaFileType} upload ceiling before handing a
* local path to `sender.sendMedia`. The sender's internal `normalizeSource`
* uses an unlimited cap so it can accept whatever size the policy layer
* (outbound / reply-dispatcher) approves; the policy gate lives here.
*
* Returns the validated byte size. Throws via {@link openLocalFile} with a
* human-readable "File is too large" message when exceeding the ceiling.
*/
async function assertLocalFileWithinTypeLimit(filePath, fileType) {
	const opened = await openLocalFile(filePath, { maxSize: getMaxUploadSize(fileType) });
	try {
		return opened.size;
	} finally {
		await opened.close();
	}
}
async function handleImagePayload(ctx, payload) {
	const { target, account, log } = ctx;
	const normalizedPath = normalizePath$1(payload.path);
	let imageUrl;
	if (payload.source === "file") imageUrl = validateStructuredPayloadLocalPath(ctx, normalizedPath, "image");
	else if (isRemoteHttpUrl(normalizedPath) || isInlineImageDataUrl(normalizedPath)) imageUrl = normalizedPath;
	else {
		log?.error(`Image payload URL must use http(s) or data:image/: ${sanitizeForLog(payload.path)}`);
		return;
	}
	if (!imageUrl) return;
	const originalImagePath = payload.source === "file" ? imageUrl : void 0;
	if (payload.source === "file") try {
		const fileBuffer = await readLocalFileForInlineBase64(imageUrl, 1);
		const base64Data = fileBuffer.toString("base64");
		const mimeType = getImageMimeType(imageUrl);
		if (!mimeType) {
			const ext = normalizeLowercaseStringOrEmpty(path.extname(imageUrl));
			log?.error(`Unsupported image format: ${ext}`);
			return;
		}
		imageUrl = `data:${mimeType};base64,${base64Data}`;
		log?.debug?.(`Converted local image to Base64 (size: ${formatFileSize(fileBuffer.length)})`);
	} catch (readErr) {
		log?.error(`Failed to read local image: ${readErr instanceof Error ? readErr.message : JSON.stringify(readErr)}`);
		return;
	}
	try {
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		await withTokenRetry(creds, async () => {
			if (deliveryTarget.type === "c2c" || deliveryTarget.type === "group") await sendMedia$1({
				target: deliveryTarget,
				creds,
				kind: "image",
				source: { url: imageUrl },
				msgId: target.messageId,
				localPathForMeta: originalImagePath
			});
			else if (deliveryTarget.type === "dm") await sendText(deliveryTarget, `![](${payload.path})`, creds, { msgId: target.messageId });
			else await sendText(deliveryTarget, `![](${payload.path})`, creds, { msgId: target.messageId });
		}, log, account.accountId);
		log?.debug?.(`Sent image via media payload`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		log?.error(`Failed to send image: ${formatErrorMessage(err)}`);
	}
}
async function handleAudioPayload(ctx, payload, deps) {
	await sendTextAsVoiceReply(ctx, payload.caption || payload.path, deps);
}
async function sendTextAsVoiceReply(ctx, text, deps) {
	const { target, account, cfg, log } = ctx;
	if (!deps) {
		log?.error(`TTS deps not provided, cannot handle audio payload`);
		return false;
	}
	try {
		const ttsText = text;
		if (!ttsText?.trim()) {
			log?.error(`Voice missing text`);
			return false;
		}
		log?.debug?.(`TTS: "${ttsText.slice(0, 50)}..."`);
		const ttsResult = await deps.tts.textToSpeech({
			text: ttsText,
			cfg,
			channel: "qqbot",
			accountId: account.accountId
		});
		if (!ttsResult.success || !ttsResult.audioPath) {
			log?.error(`TTS failed: ${ttsResult.error ?? "unknown"}`);
			return false;
		}
		const providerLabel = ttsResult.provider ?? "unknown";
		log?.debug?.(`TTS returned: provider=${providerLabel}, format=${ttsResult.outputFormat}, path=${ttsResult.audioPath}`);
		const silkBase64 = await deps.tts.audioFileToSilkBase64(ttsResult.audioPath);
		if (!silkBase64) {
			log?.error(`Failed to convert TTS audio to SILK`);
			return false;
		}
		const silkPath = ttsResult.audioPath;
		log?.debug?.(`TTS done (${providerLabel}), file: ${silkPath}`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		await withTokenRetry(creds, async () => {
			if (deliveryTarget.type === "c2c" || deliveryTarget.type === "group") await sendMedia$1({
				target: deliveryTarget,
				creds,
				kind: "voice",
				source: { base64: silkBase64 },
				msgId: target.messageId,
				ttsText,
				localPathForMeta: silkPath
			});
			else {
				log?.error(`Voice not supported in ${deliveryTarget.type}, sending text fallback`);
				await sendText(deliveryTarget, ttsText, creds, { msgId: target.messageId });
			}
		}, log, account.accountId);
		log?.debug?.(`Voice message sent`);
		return true;
	} catch (err) {
		log?.error(`TTS/voice send failed: ${formatErrorMessage(err)}`);
		return false;
	}
}
async function handleVideoPayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const resolved = resolveStructuredPayloadPath(ctx, payload, "video");
		if (!resolved) return;
		const videoPath = resolved.path;
		const isHttpUrl = resolved.isHttpUrl;
		log?.debug?.(`Video send: ${describeMediaTargetForLog(videoPath, isHttpUrl)}`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		if (deliveryTarget.type !== "c2c" && deliveryTarget.type !== "group") {
			log?.error(`Video not supported in ${deliveryTarget.type}`);
			return;
		}
		await withTokenRetry(creds, async () => {
			if (isHttpUrl) await sendMedia$1({
				target: deliveryTarget,
				creds,
				kind: "video",
				source: { url: videoPath },
				msgId: target.messageId
			});
			else {
				const size = await assertLocalFileWithinTypeLimit(videoPath, 2);
				log?.debug?.(`Video local (${formatFileSize(size)}): ${describeMediaTargetForLog(videoPath, false)}`);
				await sendMedia$1({
					target: deliveryTarget,
					creds,
					kind: "video",
					source: { localPath: videoPath },
					msgId: target.messageId,
					localPathForMeta: videoPath
				});
			}
		}, log, account.accountId);
		log?.debug?.(`Video message sent`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		log?.error(`Video send failed: ${formatErrorMessage(err)}`);
	}
}
async function handleFilePayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const resolved = resolveStructuredPayloadPath(ctx, payload, "file");
		if (!resolved) return;
		const filePath = resolved.path;
		const isHttpUrl = resolved.isHttpUrl;
		const fileName = sanitizeFileName(path.basename(filePath));
		log?.debug?.(`File send: ${describeMediaTargetForLog(filePath, isHttpUrl)} (${isHttpUrl ? "URL" : "local"})`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		if (deliveryTarget.type !== "c2c" && deliveryTarget.type !== "group") {
			log?.error(`File not supported in ${deliveryTarget.type}`);
			return;
		}
		await withTokenRetry(creds, async () => {
			if (isHttpUrl) await sendMedia$1({
				target: deliveryTarget,
				creds,
				kind: "file",
				source: { url: filePath },
				msgId: target.messageId,
				fileName
			});
			else {
				const size = await assertLocalFileWithinTypeLimit(filePath, 4);
				log?.debug?.(`File local (${formatFileSize(size)}): ${describeMediaTargetForLog(filePath, false)}`);
				await sendMedia$1({
					target: deliveryTarget,
					creds,
					kind: "file",
					source: { localPath: filePath },
					msgId: target.messageId,
					fileName,
					localPathForMeta: filePath
				});
			}
		}, log, account.accountId);
		log?.debug?.(`File message sent`);
	} catch (err) {
		log?.error(`File send failed: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/streaming-media-send.ts
function formatStreamSendErr(e) {
	return e instanceof Error ? e.message : String(e);
}
/** 统一的媒体标签正则 — 匹配标准化后的 6 种标签 */
const MEDIA_TAG_REGEX = /<(qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi;
/** 创建一个新的全局标签正则实例（每次调用 reset lastIndex） */
function createMediaTagRegex() {
	return new RegExp(MEDIA_TAG_REGEX.source, MEDIA_TAG_REGEX.flags);
}
/**
* 修复路径编码问题（双反斜杠、八进制转义、UTF-8 双重编码）
*
* 这是由于 LLM 输出路径时可能引入的编码问题：
* - Markdown 转义导致双反斜杠
* - 八进制转义序列（来自某些 shell 工具的输出）
* - UTF-8 双重编码（中文路径经过多层处理后的乱码）
*
* 此方法在 gateway.ts deliver 回调、outbound.ts sendText、
* streaming.ts sendMediaQueue 中共用。
*/
function fixPathEncoding(mediaPath, log) {
	let result = mediaPath.replace(/\\\\/g, "\\");
	const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
	try {
		const hasOctal = /\\[0-7]{1,3}/.test(result);
		const hasNonASCII = /[\u0080-\u00FF]/.test(result);
		if (!isWinLocal && (hasOctal || hasNonASCII)) {
			log?.debug?.(`Decoding path with mixed encoding: ${result}`);
			let decoded = result.replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
			const bytes = [];
			for (let i = 0; i < decoded.length; i++) {
				const code = decoded.charCodeAt(i);
				if (code <= 255) bytes.push(code);
				else {
					const charBytes = Buffer.from(decoded[i], "utf8");
					bytes.push(...charBytes);
				}
			}
			const utf8Decoded = Buffer.from(bytes).toString("utf8");
			if (!utf8Decoded.includes("�") || utf8Decoded.length < decoded.length) {
				result = utf8Decoded;
				log?.debug?.(`Successfully decoded path: ${result}`);
			}
		}
	} catch (decodeErr) {
		log?.error?.(`Path decode error: ${formatStreamSendErr(decodeErr)}`);
	}
	return result;
}
/**
* 判断文本中给定位置是否处于围栏代码块内（``` 块）。
*
* 围栏代码块：行首 ``` 开始，到下一个行首 ``` 结束（或文本末尾）
*
* @param text 完整文本
* @param position 要检测的位置（字符索引）
* @returns 如果 position 在围栏代码块内返回 true
*/
function isInsideCodeBlock(text, position) {
	const fenceRegex = /^(`{3,})[^\n]*$/gm;
	let fenceMatch;
	let openFence = null;
	while ((fenceMatch = fenceRegex.exec(text)) !== null) {
		const ticks = fenceMatch[1].length;
		if (!openFence) openFence = {
			pos: fenceMatch.index,
			ticks
		};
		else if (ticks >= openFence.ticks) {
			if (position >= openFence.pos && position < fenceMatch.index + fenceMatch[0].length) return true;
			openFence = null;
		}
	}
	if (openFence && position >= openFence.pos) return true;
	return false;
}
/**
* 在文本中查找**第一个**完整闭合的媒体标签
*
* 与 splitByMediaTags 不同，此函数只匹配一个标签就停止，
* 用于流式场景的"循环消费"模式：每次处理一个标签，更新偏移，再找下一个。
*
* @param text 待检查的文本（应已 normalize 过）
* @returns 第一个闭合标签的信息，没有则返回 null
*/
function findFirstClosedMediaTag(text, log) {
	const regex = createMediaTagRegex();
	let match;
	while ((match = regex.exec(text)) !== null) {
		if (isInsideCodeBlock(text, match.index)) {
			log?.debug?.(`findFirstClosedMediaTag: skipping <${match[1]}> at index ${match.index} (inside code block)`);
			continue;
		}
		const textBefore = text.slice(0, match.index);
		const tagName = match[1].toLowerCase();
		let mediaPath = match[2]?.trim() ?? "";
		if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
		mediaPath = normalizePath$1(mediaPath);
		mediaPath = fixPathEncoding(mediaPath, log);
		return {
			textBefore,
			tagName,
			mediaPath,
			tagEndIndex: match.index + match[0].length,
			itemType: {
				qqimg: "image",
				qqvoice: "voice",
				qqvideo: "video",
				qqfile: "file",
				qqmedia: "media"
			}[tagName] ?? "image"
		};
	}
	return null;
}
/**
* 统一执行发送队列
*
* 遍历 sendQueue，按类型调用对应的发送函数。
* 文本项通过 onSendText 回调处理（不同场景的文本发送方式不同）。
* 媒体发送失败时，通过 onSendText 发送兜底文本通知用户。
*/
async function executeSendQueue(queue, ctx, options = {}) {
	const { mediaTarget, qualifiedTarget, account, replyToId, log } = ctx;
	const prefix = mediaTarget.logPrefix ?? `[qqbot:${account.accountId}]`;
	/** 媒体发送失败时的兜底：通过 onSendText 发送错误文本给用户 */
	const sendFallbackText = async (errorMsg) => {
		if (!options.onSendText) {
			log?.info(`${prefix} executeSendQueue: no onSendText handler, cannot send fallback text`);
			return;
		}
		try {
			await options.onSendText(errorMsg);
		} catch (fallbackErr) {
			log?.error(`${prefix} executeSendQueue: fallback text send failed: ${formatStreamSendErr(fallbackErr)}`);
		}
	};
	for (const item of queue) try {
		if (item.type === "text") {
			if (options.skipInterTagText) {
				log?.info(`${prefix} executeSendQueue: skipping inter-tag text (${item.content.length} chars)`);
				continue;
			}
			if (options.onSendText) await options.onSendText(item.content);
			else log?.info(`${prefix} executeSendQueue: no onSendText handler, skipping text`);
			continue;
		}
		log?.info(`${prefix} executeSendQueue: sending ${item.type}: ${item.content.slice(0, 80)}...`);
		if (item.type === "image") {
			const result = await sendPhoto(mediaTarget, item.content);
			if (result.error) {
				log?.error(`${prefix} sendPhoto error: ${result.error}`);
				await sendFallbackText(resolveUserFacingMediaError(result));
			}
		} else if (item.type === "voice") {
			const uploadFormats = account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats;
			const transcodeEnabled = account.config?.audioFormatPolicy?.transcodeEnabled !== false;
			const voiceTimeout = 45e3;
			try {
				const result = await Promise.race([sendVoice(mediaTarget, item.content, uploadFormats, transcodeEnabled), new Promise((resolve) => setTimeout(() => resolve({
					channel: "qqbot",
					error: "语音发送超时，已跳过"
				}), voiceTimeout))]);
				if (result.error) {
					log?.error(`${prefix} sendVoice error: ${result.error}`);
					await sendFallbackText(resolveUserFacingMediaError(result));
				}
			} catch (err) {
				log?.error(`${prefix} sendVoice unexpected error: ${formatStreamSendErr(err)}`);
				await sendFallbackText(DEFAULT_MEDIA_SEND_ERROR);
			}
		} else if (item.type === "video") {
			const result = await sendVideoMsg(mediaTarget, item.content);
			if (result.error) {
				log?.error(`${prefix} sendVideoMsg error: ${result.error}`);
				await sendFallbackText(resolveUserFacingMediaError(result));
			}
		} else if (item.type === "file") {
			const result = await sendDocument(mediaTarget, item.content);
			if (result.error) {
				log?.error(`${prefix} sendDocument error: ${result.error}`);
				await sendFallbackText(resolveUserFacingMediaError(result));
			}
		} else if (item.type === "media") {
			const result = await sendMedia({
				to: qualifiedTarget,
				text: "",
				mediaUrl: item.content,
				accountId: account.accountId,
				replyToId,
				account
			});
			if (result.error) {
				log?.error(`${prefix} sendMedia(auto) error: ${result.error}`);
				await sendFallbackText(resolveUserFacingMediaError(result));
			}
		}
	} catch (err) {
		log?.error(`${prefix} executeSendQueue: failed to send ${item.type}: ${formatStreamSendErr(err)}`);
		await sendFallbackText(DEFAULT_MEDIA_SEND_ERROR);
	}
}
/**
* 检测文本中是否有未闭合的媒体标签，如果有则截断到安全位置。
*
* 流式输出中 LLM 逐 token 吐出媒体标签，中间态不应直接发给用户。
* 只检查最后一行，从右到左扫描 `<`，找到第一个有意义的媒体标签片段并判断是否完整。
*
* 核心原则：截断只能截到**开标签**前面；闭合标签前缀若找不到对应开标签则原样返回。
*/
function stripIncompleteMediaTag(text) {
	if (!text) return [text, false];
	const lastNL = text.lastIndexOf("\n");
	const lastLine = lastNL === -1 ? text : text.slice(lastNL + 1);
	if (!lastLine) return [text, false];
	const lineStart = lastNL === -1 ? 0 : lastNL + 1;
	const MEDIA_NAMES = [
		"qq",
		"img",
		"image",
		"pic",
		"photo",
		"voice",
		"audio",
		"video",
		"file",
		"doc",
		"media",
		"attach",
		"send",
		"document",
		"picture",
		"qqvoice",
		"qqaudio",
		"qqvideo",
		"qqimg",
		"qqimage",
		"qqfile",
		"qqpic",
		"qqphoto",
		"qqmedia",
		"qqattach",
		"qqsend",
		"qqdocument",
		"qqpicture"
	];
	const isMedia = (n) => MEDIA_NAMES.includes(n.toLowerCase());
	const couldBeMedia = (n) => {
		const l = n.toLowerCase();
		return MEDIA_NAMES.some((m) => m.startsWith(l));
	};
	/** 截断到 lastLine 中位置 pos 之前，返回 [safe, true] */
	const cutAt = (pos) => [text.slice(0, lineStart + pos).trimEnd(), true];
	/** 检查 lastLine 中位置 pos 处的媒体开标签后面是否有完整闭合标签 */
	const hasClosingAfter = (pos, name) => {
		const rest = lastLine.slice(pos + 1);
		const gt = rest.search(/[>＞]/);
		if (gt < 0) return false;
		const after = rest.slice(gt + 1);
		return new RegExp(`[<\uFF1C]/${name}\\s*[>\uFF1E]`, "i").test(after);
	};
	let searchTag = null;
	let searchIsClosing = false;
	let fallbackPos = -1;
	for (let i = lastLine.length - 1; i >= 0; i--) {
		const ch = lastLine[i];
		if (ch !== "<" && ch !== "＜") continue;
		const after = lastLine.slice(i + 1);
		const isClosing = after.startsWith("/");
		const nameStr = isClosing ? after.slice(1) : after;
		const nameMatch = nameStr.match(/^(\w+)/);
		if (searchTag) {
			if (!nameMatch || isClosing) continue;
			const cand = nameMatch[1].toLowerCase();
			if (!isMedia(cand)) continue;
			if (hasClosingAfter(i, cand)) continue;
			if (searchTag === "*") return cutAt(i);
			const t = searchTag.toLowerCase();
			if (cand === t || cand.startsWith(t)) return cutAt(i);
			continue;
		}
		if (!nameMatch) {
			if (!after) {
				if (fallbackPos < 0) fallbackPos = i;
				searchTag = "*";
				searchIsClosing = false;
			} else if (after === "/") {
				if (fallbackPos < 0) fallbackPos = i;
				searchTag = "*";
				searchIsClosing = true;
			}
			continue;
		}
		const tag = nameMatch[1];
		const restAfterName = nameStr.slice(tag.length);
		const hasGT = /[>＞]/.test(restAfterName);
		if (!isMedia(tag) && !(couldBeMedia(tag) && !hasGT)) continue;
		if (!hasGT) {
			if (isClosing) {
				if (fallbackPos < 0) fallbackPos = i;
				searchTag = tag;
				searchIsClosing = true;
				continue;
			}
			return cutAt(i);
		}
		if (isClosing) return [text, false];
		if (hasClosingAfter(i, tag)) return [text, false];
		return cutAt(i);
	}
	if (searchTag) {
		if (!searchIsClosing) return cutAt(fallbackPos);
		return [text, true];
	}
	return [text, false];
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/streaming-c2c.ts
/**
* QQ Bot Streaming Message Controller
*
* Core principles:
* 1. Never mutate original content (no trim, no strip) to avoid PREFIX MISMATCH.
* 2. Media tags are sent synchronously — wait for completion before proceeding.
* 3. When a rich-media tag (including an unclosed prefix) is encountered,
*    terminate the active streaming session first, then handle the media.
* 4. Whitespace-only chunk handling:
*    - First chunk is whitespace → defer sending (do not open a stream), but retain content.
*    - Interrupted by a media tag or ended while still whitespace-only → skip sending.
*    - Ended with an active streaming session (prior non-whitespace chunks exist) → send the whitespace chunk.
* 5. Reply boundary detection uses prefix matching (not just length reduction):
*    if the new text is not a prefix continuation of the last processed text,
*    it is treated as a new message.
*/
function formatStreamErr(e) {
	return e instanceof Error ? e.message : String(e);
}
/** 流式消息节流常量（毫秒） */
const THROTTLE_CONSTANTS = {
	/** 默认节流间隔 */
	DEFAULT_MS: 500,
	/** 最小节流间隔 */
	MIN_MS: 300,
	/** 长间隔阈值：超过此时间后的首次 flush 延迟处理 */
	LONG_GAP_THRESHOLD_MS: 2e3,
	/** 长间隔后的批处理窗口 */
	BATCH_AFTER_GAP_MS: 300
};
/** 终态集合 */
const TERMINAL_PHASES = new Set(["completed", "aborted"]);
/** 允许的状态转换 */
const PHASE_TRANSITIONS = {
	idle: new Set(["streaming", "aborted"]),
	streaming: new Set([
		"idle",
		"completed",
		"aborted"
	]),
	completed: /* @__PURE__ */ new Set(),
	aborted: /* @__PURE__ */ new Set()
};
/**
* 节流刷新控制器（纯调度原语，不含业务逻辑）
*/
var FlushController = class {
	constructor(doFlush) {
		this.flushInProgress = false;
		this.flushResolvers = [];
		this.needsReflush = false;
		this.pendingFlushTimer = null;
		this.lastUpdateTime = 0;
		this.isCompleted = false;
		this._ready = false;
		this.doFlush = doFlush;
	}
	/** 标记为已完成 —— 当前 flush 之后不再调度新 flush */
	complete() {
		this.isCompleted = true;
	}
	/** 取消待执行的延迟 flush */
	cancelPendingFlush() {
		if (this.pendingFlushTimer) {
			clearTimeout(this.pendingFlushTimer);
			this.pendingFlushTimer = null;
		}
	}
	/** 等待当前进行中的 flush 完成 */
	waitForFlush() {
		if (!this.flushInProgress) return Promise.resolve();
		return new Promise((resolve) => this.flushResolvers.push(resolve));
	}
	/** 取消所有 pending timer + 等待正在执行的 flush 完成，确保 flush 活动彻底停止 */
	async cancelPendingAndWait() {
		this.cancelPendingFlush();
		this.needsReflush = false;
		await this.waitForFlush();
		this.cancelPendingFlush();
		this.needsReflush = false;
	}
	/** 标记流式会话就绪（首次 API 调用成功后） */
	setReady(ready) {
		this._ready = ready;
		if (ready) this.lastUpdateTime = Date.now();
	}
	get ready() {
		return this._ready;
	}
	/** 重置为初始状态（用于流式会话恢复） */
	reset(doFlush) {
		this.cancelPendingFlush();
		this.doFlush = doFlush;
		this.flushInProgress = false;
		this.flushResolvers = [];
		this.needsReflush = false;
		this.lastUpdateTime = 0;
		this.isCompleted = false;
		this._ready = false;
	}
	/** 执行一次 flush（互斥锁 + 冲突时 reflush） */
	async flush() {
		if (!this._ready || this.flushInProgress || this.isCompleted) {
			if (this.flushInProgress && !this.isCompleted) this.needsReflush = true;
			return;
		}
		this.flushInProgress = true;
		this.needsReflush = false;
		this.lastUpdateTime = Date.now();
		try {
			await this.doFlush();
			this.lastUpdateTime = Date.now();
		} finally {
			this.flushInProgress = false;
			const resolvers = this.flushResolvers;
			this.flushResolvers = [];
			for (const resolve of resolvers) resolve();
			if (this.needsReflush && !this.isCompleted && !this.pendingFlushTimer) {
				this.needsReflush = false;
				this.pendingFlushTimer = setTimeout(() => {
					this.pendingFlushTimer = null;
					this.flush();
				}, 0);
			}
		}
	}
	/** 节流入口：根据 throttleMs 控制 flush 频率 */
	async throttledUpdate(throttleMs) {
		if (!this._ready) return;
		const now = Date.now();
		const elapsed = now - this.lastUpdateTime;
		if (elapsed >= throttleMs) {
			this.cancelPendingFlush();
			if (elapsed > THROTTLE_CONSTANTS.LONG_GAP_THRESHOLD_MS) {
				this.lastUpdateTime = now;
				this.pendingFlushTimer = setTimeout(() => {
					this.pendingFlushTimer = null;
					this.flush();
				}, THROTTLE_CONSTANTS.BATCH_AFTER_GAP_MS);
			} else await this.flush();
		} else if (!this.pendingFlushTimer) {
			const delay = throttleMs - elapsed;
			this.pendingFlushTimer = setTimeout(() => {
				this.pendingFlushTimer = null;
				this.flush();
			}, delay);
		}
	}
};
/**
* QQ Bot 流式消息控制器
*
* 管理 C2C 流式消息的完整生命周期：
* 1. idle: 初始状态，等待首次文本
* 2. streaming: 流式发送中，通过 API 逐步更新消息内容
* 3. completed: 正常完成，已发送 input_state="10"
* 4. aborted: 中止（进程退出/错误）
*
* 富媒体标签处理流程：
* 当检测到富媒体标签时：
* 1. 将标签前的文本通过流式发完 → 结束当前流式会话 (input_state="10")
* 2. 同步等待媒体发送完成
* 3. 创建新的流式会话 → 继续发送标签后的剩余文本
*/
var StreamingController = class {
	/**
	* 尝试获取回调互斥锁。
	* - 尚未锁定 → 锁定为 source，返回 true
	* - 已锁定且来源相同 → 返回 true
	* - 已锁定且来源不同 → 返回 false（调用方应跳过）
	*/
	acquireCallbackLock(source) {
		if (this.firstCallbackSource === null) {
			this.firstCallbackSource = source;
			this.logInfo(`acquireCallbackLock: locked to "${source}"`);
			return true;
		}
		if (this.firstCallbackSource === source) return true;
		this.logDebug(`acquireCallbackLock: rejected "${source}" (locked by "${this.firstCallbackSource}")`);
		return false;
	}
	constructor(deps) {
		this.phase = "idle";
		this.lastNormalizedFull = "";
		this.lastRawFull = "";
		this._boundaryPrefix = null;
		this.sentIndex = 0;
		this.streamMsgId = null;
		this.msgSeq = null;
		this.streamIndex = 0;
		this.dispatchFullyComplete = false;
		this._callbackChain = Promise.resolve();
		this.firstCallbackSource = null;
		this.sentStreamChunkCount = 0;
		this.sentMediaCount = 0;
		this.startingPromise = null;
		this._pendingSessionText = null;
		this.deps = deps;
		this.flush = new FlushController(() => this.performFlush());
		this.throttleMs = THROTTLE_CONSTANTS.DEFAULT_MS;
		if (this.throttleMs < THROTTLE_CONSTANTS.MIN_MS) this.throttleMs = THROTTLE_CONSTANTS.MIN_MS;
	}
	get isTerminalPhase() {
		return TERMINAL_PHASES.has(this.phase);
	}
	get currentPhase() {
		return this.phase;
	}
	/**
	* 是否应降级到非流式（普通消息）发送
	*
	* 条件：流式会话进入终态，且从未成功发出过任何一个流式分片或媒体
	*/
	get shouldFallbackToStatic() {
		return this.isTerminalPhase && this.sentStreamChunkCount === 0;
	}
	/** debug 用：暴露发送计数给 gateway 日志 */
	get sentChunkCount_debug() {
		return this.sentStreamChunkCount;
	}
	transition(to, source, reason) {
		const from = this.phase;
		if (from === to) return false;
		if (!PHASE_TRANSITIONS[from].has(to)) {
			this.logWarn(`phase transition rejected: ${from} → ${to} (source: ${source})`);
			return false;
		}
		this.phase = to;
		this.logInfo(`phase: ${from} → ${to} (source: ${source}${reason ? `, reason: ${reason}` : ""})`);
		if (TERMINAL_PHASES.has(to)) this.onEnterTerminalPhase();
		return true;
	}
	onEnterTerminalPhase() {
		this.flush.cancelPendingFlush();
		this.flush.complete();
	}
	get prefix() {
		return this.deps.logPrefix ?? "[qqbot:streaming]";
	}
	logInfo(msg) {
		const m = `${this.prefix} ${msg}`;
		const engineLog = this.deps.log;
		if (engineLog) engineLog.info?.(m);
		else console.log(m);
	}
	logError(msg) {
		const m = `${this.prefix} ${msg}`;
		const engineLog = this.deps.log;
		if (engineLog) engineLog.error?.(m);
		else console.error(m);
	}
	logWarn(msg) {
		const m = `${this.prefix} ${msg}`;
		const engineLog = this.deps.log;
		if (engineLog) if (engineLog.warn) engineLog.warn(m);
		else engineLog.info?.(m);
		else console.warn(m);
	}
	logDebug(msg) {
		const m = `${this.prefix} ${msg}`;
		const engineLog = this.deps.log;
		if (engineLog) engineLog.debug?.(m);
		else console.debug(m);
	}
	/**
	* 处理 onPartialReply 回调（流式文本全量更新）
	*
	* ★ 通过 Promise 链严格串行化：前一次处理完成后才执行下一次，
	*   避免并发交叉导致的状态不一致。
	*
	* payload.text 是从头到尾的完整当前文本（每次回调都是全量）。
	* 核心逻辑：normalize → 更新 lastNormalizedFull → 从 sentIndex 开始 processMediaTags
	*/
	async onPartialReply(payload) {
		if (this.isTerminalPhase) return;
		if (!payload.text) return;
		if (!this.acquireCallbackLock("partial")) return;
		this._callbackChain = this._callbackChain.then(() => this._doPartialReply(payload), (err) => {
			this.logError(`onPartialReply chain error: ${formatStreamErr(err)}`);
			return this._doPartialReply(payload);
		});
		return this._callbackChain;
	}
	/** onPartialReply 的实际逻辑（由 _callbackChain 保证串行调用） */
	async _doPartialReply(payload) {
		this.logDebug(`onPartialReply: rawLen=${payload.text?.length ?? 0}, phase=${this.phase}, streamMsgId=${this.streamMsgId}, sentIndex=${this.sentIndex}, firstCB=${this.firstCallbackSource}`);
		if (this.isTerminalPhase) {
			this.logDebug(`onPartialReply: skipped (terminal phase)`);
			return;
		}
		const text = payload.text ?? "";
		if (!text) {
			this.logDebug(`onPartialReply: skipped (empty text)`);
			return;
		}
		const fullText = this._boundaryPrefix !== null ? this._boundaryPrefix + text : text;
		if (this.lastRawFull && fullText.length > 0 && !fullText.startsWith(this.lastRawFull)) {
			this.logInfo(`onPartialReply: reply boundary detected — raw prefix mismatch (new len=${fullText.length}, prev len=${this.lastRawFull.length}), appending with separator`);
			this._boundaryPrefix = this.lastRawFull + "\n\n";
			const merged = this._boundaryPrefix + text;
			this.lastRawFull = merged;
			this.lastNormalizedFull = normalizeMediaTags(merged);
			await this.processMediaTags(this.lastNormalizedFull);
			return;
		}
		this.lastRawFull = fullText;
		this.lastNormalizedFull = normalizeMediaTags(fullText);
		await this.processMediaTags(this.lastNormalizedFull);
	}
	/**
	* 处理 deliver 回调
	*
	* ★ 与 onPartialReply 互斥：首先到达的回调锁定控制权，后到的被忽略。
	*/
	async onDeliver(payload) {
		const rawLen = payload.text?.length ?? 0;
		const preview = (payload.text ?? "").slice(0, 60).replace(/\n/g, "\\n");
		this.logDebug(`onDeliver: rawLen=${rawLen}, phase=${this.phase}, streamMsgId=${this.streamMsgId}, sentIndex=${this.sentIndex}, sentChunks=${this.sentStreamChunkCount}, firstCB=${this.firstCallbackSource}, preview="${preview}"`);
		if (this.isTerminalPhase) {
			this.logDebug(`onDeliver: skipped (terminal phase)`);
			return;
		}
		if (!(payload.text ?? "").trim()) {
			this.logDebug(`onDeliver: skipped (empty text)`);
			return;
		}
		if (!this.acquireCallbackLock("deliver")) return;
		this.logInfo(`onDeliver: deliver in control, falling back to static`);
		this.transition("aborted", "onDeliver", "deliver_arrived_first_fallback_to_static");
	}
	/**
	* 处理 onIdle 回调（分发完成时调用）
	*
	* ★ 挂到 _callbackChain 上，保证在所有 onPartialReply 执行完之后才执行。
	*
	* onIdle 会传入最终的全量文本。如果该文本**包含**之前存储的 lastNormalizedFull，
	* 说明一致，继续处理剩余内容；否则忽略（防止 onIdle 修改文本导致的不一致）。
	*/
	async onIdle(payload) {
		if (!this.dispatchFullyComplete) {
			this.logDebug(`onIdle: skipped (dispatch not fully complete)`);
			return;
		}
		if (this.isTerminalPhase) return;
		this._callbackChain = this._callbackChain.then(() => this._doIdle(payload), (err) => {
			this.logError(`onIdle chain error: ${formatStreamErr(err)}`);
			return this._doIdle(payload);
		});
		return this._callbackChain;
	}
	/** onIdle 的实际逻辑（由 _callbackChain 保证在 onPartialReply 之后执行） */
	async _doIdle(payload) {
		this.logDebug(`onIdle: dispatchFullyComplete=${this.dispatchFullyComplete}, phase=${this.phase}, streamChunks=${this.sentStreamChunkCount}, mediaCount=${this.sentMediaCount}, sentIndex=${this.sentIndex}`);
		if (this.isTerminalPhase) {
			this.logDebug(`onIdle: skipped (terminal phase)`);
			return;
		}
		if (payload?.text) {
			const idleNormalized = normalizeMediaTags(payload.text);
			if (idleNormalized.includes(this.lastNormalizedFull)) {
				this.logDebug(`onIdle: text contains lastNormalizedFull, updating (${this.lastNormalizedFull.length} → ${idleNormalized.length})`);
				this.lastNormalizedFull = idleNormalized;
			} else if (this.lastNormalizedFull.includes(idleNormalized)) this.logDebug(`onIdle: lastNormalizedFull contains idle text, keeping current`);
			else {
				this.logWarn(`onIdle: text mismatch with lastNormalizedFull, ignoring onIdle (idle len=${idleNormalized.length}, last len=${this.lastNormalizedFull.length})`);
				await this.finalizeOnIdle();
				return;
			}
		}
		const remaining = this.lastNormalizedFull.slice(this.sentIndex);
		if (remaining) {
			if (findFirstClosedMediaTag(remaining)) {
				this.logDebug(`onIdle: unprocessed media tags in remaining text, processing now`);
				await this.processMediaTags(this.lastNormalizedFull);
				if (this.isTerminalPhase) return;
			}
		}
		await this.finalizeOnIdle();
	}
	/**
	* onIdle 的终结逻辑：终结流式会话或标记完成/降级
	*/
	async finalizeOnIdle() {
		if (this.startingPromise) {
			this.logDebug(`finalizeOnIdle: waiting for pending stream start`);
			await this.startingPromise;
		}
		if (this.isTerminalPhase) return;
		await this.flush.waitForFlush();
		if (this.streamMsgId) {
			this.transition("completed", "onIdle", "normal");
			try {
				const [safeText] = stripIncompleteMediaTag(this.lastNormalizedFull.slice(this.sentIndex));
				this.logDebug(`finalizeOnIdle: sending DONE chunk, len=${safeText.length}`);
				await this.sendStreamChunk(safeText, StreamInputState.DONE, "onIdle");
				this.logInfo(`streaming completed, final text length: ${safeText.length}`);
			} catch (err) {
				this.logError(`failed to send final stream chunk: ${formatStreamErr(err)}`);
			}
		} else if (this.sentStreamChunkCount > 0) {
			this.logInfo(`finalizeOnIdle: no active stream session, but sent ${this.sentStreamChunkCount} chunks (including ${this.sentMediaCount} media), marking completed`);
			this.transition("completed", "onIdle", "no_active_session_but_sent");
		} else {
			this.logInfo(`no chunk or media sent, marking fallback to static`);
			this.transition("aborted", "onIdle", "fallback_to_static_nothing_sent");
		}
	}
	/**
	* 处理错误
	*/
	async onError(err) {
		this.logError(`reply error: ${formatStreamErr(err)}`);
		if (this.isTerminalPhase) return;
		if (this.startingPromise) {
			this.logDebug(`onError: waiting for pending stream start`);
			await this.startingPromise;
		}
		if (this.isTerminalPhase) return;
		if (this.sentStreamChunkCount === 0) {
			this.logInfo(`no chunk or media sent, marking fallback to static for error handling`);
			this.transition("aborted", "onError", "fallback_to_static_error");
			return;
		}
		if (this.streamMsgId) try {
			const [safeText] = stripIncompleteMediaTag(this.lastNormalizedFull.slice(this.sentIndex));
			const errorText = safeText ? `${safeText}\n\n---\n**Error**: 生成响应时发生错误。` : "**Error**: 生成响应时发生错误。";
			await this.sendStreamChunk(errorText, StreamInputState.DONE, "onError");
		} catch (sendErr) {
			this.logError(`failed to send error stream chunk: ${formatStreamErr(sendErr)}`);
		}
		this.transition("completed", "onError", "error");
		await this.flush.waitForFlush();
	}
	/** 标记分发已全部完成 */
	markFullyComplete() {
		this.dispatchFullyComplete = true;
	}
	/** 中止流式消息 */
	async abortStreaming() {
		if (!this.transition("aborted", "abortStreaming", "abort")) return;
		await this.flush.waitForFlush();
		if (this.streamMsgId) try {
			const [safeText] = stripIncompleteMediaTag(this.lastNormalizedFull.slice(this.sentIndex));
			const abortText = safeText || "（已中止）";
			await this.sendStreamChunk(abortText, StreamInputState.DONE, "abortStreaming");
			this.logInfo(`streaming aborted, sent final chunk`);
		} catch (err) {
			this.logError(`abort send failed: ${formatStreamErr(err)}`);
		}
	}
	/**
	* 处理富媒体标签（循环消费模型）
	*
	* 从 sentIndex 开始，对增量文本：
	* 1. 优先找闭合标签 → 终结当前流式 → 同步发媒体 → 推进 sentIndex → reset → 继续
	* 2. 没有闭合标签但有未闭合前缀 → 标签前的安全文本仍需通过流式发送 → 推进 sentIndex → 等待标签闭合
	* 3. 纯文本 → 触发流式发送（performFlush 会动态计算要发的内容）
	*/
	async processMediaTags(normalizedFull) {
		try {
			while (true) {
				if (this.isTerminalPhase) return;
				const found = findFirstClosedMediaTag(normalizedFull.slice(this.sentIndex));
				if (!found) break;
				this.logInfo(`processMediaTags: found <${found.tagName}> at offset ${this.sentIndex}, textBefore="${found.textBefore.slice(0, 40)}"`);
				const textBeforeEndInFull = this.sentIndex + found.textBefore.length;
				await this.endCurrentStreamIfNeeded("processMediaTags:closedTag", textBeforeEndInFull);
				if (this.isTerminalPhase) return;
				if (found.mediaPath && this.deps.mediaContext) {
					const item = {
						type: found.itemType,
						content: found.mediaPath
					};
					this.logDebug(`processMediaTags: sending ${found.itemType}: ${found.mediaPath.slice(0, 80)}`);
					await sendMediaQueue([item], this.deps.mediaContext);
					this.sentMediaCount++;
					this.sentStreamChunkCount++;
					this.logDebug(`processMediaTags: media sent, sentMediaCount=${this.sentMediaCount}, sentStreamChunkCount=${this.sentStreamChunkCount}`);
				} else if (found.mediaPath && !this.deps.mediaContext) this.logWarn(`processMediaTags: no mediaContext provided, cannot send ${found.itemType}`);
				this.sentIndex += found.tagEndIndex;
				this.logDebug(`processMediaTags: sentIndex updated to ${this.sentIndex}`);
				this.resetStreamSession();
			}
			const remaining = normalizedFull.slice(this.sentIndex);
			if (!remaining) {
				this.logDebug(`processMediaTags: no remaining text after media tags`);
				return;
			}
			const [safeText, hasIncomplete] = stripIncompleteMediaTag(remaining);
			if (hasIncomplete) this.logDebug(`processMediaTags: incomplete tag detected, safe text len=${safeText.length}, remaining len=${remaining.length}`);
			this.logDebug(`processMediaTags: ${hasIncomplete ? "incomplete tag, sending safe text" : "pure text"}, remaining len=${remaining.length}`);
			if (!remaining.trim()) {
				this.logDebug(`processMediaTags: pure whitespace, skipping stream start`);
				return;
			}
			await this.ensureStreamingStarted(normalizedFull.length);
			if (this.isTerminalPhase) return;
			await this.flush.throttledUpdate(this.throttleMs);
		} catch (err) {
			this.logError(`processMediaTags failed: ${formatStreamErr(err)}`);
		}
	}
	/**
	* 终结当前流式会话（如果有的话）
	*
	* @param caller 调用者标识（日志用）
	* @param textEndInFull 本次终结需要发送到的全量文本位置（不含）。
	*   终结分片的内容 = lastNormalizedFull.slice(sentIndex, textEndInFull)
	*
	* 逻辑：
	* - 有活跃 streamMsgId → 等待 flush 完成 → 发 DONE 分片终结
	* - 没有 streamMsgId 但有非空白文本 → 启动流式 → 立即终结
	* - 纯空白且无活跃流式 → 不发送
	*/
	async endCurrentStreamIfNeeded(caller, textEndInFull) {
		if (this.startingPromise) {
			this.logDebug(`${caller}: waiting for pending stream start`);
			await this.startingPromise;
		}
		await this.flush.cancelPendingAndWait();
		const [safeText] = stripIncompleteMediaTag(this.lastNormalizedFull.slice(this.sentIndex, textEndInFull));
		if (this.streamMsgId) try {
			await this.sendStreamChunk(safeText, StreamInputState.DONE, caller);
			this.logDebug(`${caller}: current stream session ended`);
		} catch (err) {
			this.logError(`${caller}: failed to end stream: ${formatStreamErr(err)}`);
		}
		else if (safeText && safeText.trim()) {
			this._pendingSessionText = safeText;
			await this.ensureStreamingStarted(textEndInFull);
			this._pendingSessionText = null;
			if (this.isTerminalPhase) return;
			if (this.startingPromise) await this.startingPromise;
			if (this.streamMsgId) try {
				await this.sendStreamChunk(safeText, StreamInputState.DONE, caller);
				this.logDebug(`${caller}: started and ended stream for pre-tag text`);
			} catch (err) {
				this.logError(`${caller}: failed to send pre-tag text: ${formatStreamErr(err)}`);
			}
		}
	}
	/**
	* 重置流式会话状态（用于媒体中断后恢复）
	*
	* 只重置会话相关状态，不重置 sentIndex 和 dispatch 标记。
	* 新流式会话从当前 sentIndex 开始（performFlush 动态计算内容）。
	*/
	resetStreamSession() {
		const prevPhase = this.phase;
		this.phase = "idle";
		this.logDebug(`phase: ${prevPhase} → idle (source: resetStreamSession, forced reset for media resume)`);
		this.streamMsgId = null;
		this.streamIndex = 0;
		this.msgSeq = null;
		this.startingPromise = null;
		this.flush.reset(() => this.performFlush());
	}
	/** 确保流式会话已开始（首次调用创建；并发调用者会等待首次完成） */
	async ensureStreamingStarted(textEndInFull) {
		if (this.streamMsgId || this.isTerminalPhase) return;
		if (this.startingPromise) {
			this.logDebug(`ensureStreamingStarted: waiting for pending start request`);
			await this.startingPromise;
			return;
		}
		if (!this.transition("streaming", "ensureStreamingStarted")) return;
		this.startingPromise = this.doStartStreaming(textEndInFull);
		try {
			await this.startingPromise;
		} finally {
			this.startingPromise = null;
		}
	}
	/** 实际执行流式启动逻辑 */
	async doStartStreaming(textEndInFull) {
		try {
			const [safeText] = stripIncompleteMediaTag(this._pendingSessionText ?? this.lastNormalizedFull.slice(this.sentIndex, textEndInFull));
			if (!safeText?.trim()) {
				this.logDebug(`doStartStreaming: skipped (session text is empty or whitespace-only)`);
				this.transition("idle", "doStartStreaming", "whitespace_only_text");
				return;
			}
			const firstText = safeText;
			const resp = await this.sendStreamChunk(firstText, StreamInputState.GENERATING, "doStartStreaming");
			if (!resp.id) throw new Error(`Stream API returned no id: ${JSON.stringify(resp)}`);
			this.streamMsgId = resp.id;
			this.flush.setReady(true);
			this.logInfo(`stream started, stream_msg_id=${resp.id}`);
		} catch (err) {
			this.logError(`failed to start streaming: ${formatStreamErr(err)}`);
			this.transition("idle", "doStartStreaming", "start_failed_will_retry");
		}
	}
	/** 发送一个流式分片（不做任何文本修改） */
	async sendStreamChunk(content, inputState, caller) {
		this.logDebug(`sendStreamChunk: caller=${caller}, inputState=${inputState}, contentLen=${content.length}, streamMsgId=${this.streamMsgId}, index=${this.streamIndex}`);
		if (this.msgSeq === null) this.msgSeq = getNextMsgSeq(this.deps.replyToMsgId);
		const currentIndex = this.streamIndex++;
		const api = getMessageApi(this.deps.account.appId);
		const creds = {
			appId: this.deps.account.appId,
			clientSecret: this.deps.account.clientSecret
		};
		const resp = await api.sendC2CStreamMessage(creds, this.deps.userId, {
			input_mode: StreamInputMode.REPLACE,
			input_state: inputState,
			content_type: StreamContentType.MARKDOWN,
			content_raw: content,
			event_id: this.deps.eventId,
			msg_id: this.deps.replyToMsgId,
			stream_msg_id: this.streamMsgId ?? void 0,
			msg_seq: this.msgSeq,
			index: currentIndex
		});
		this.sentStreamChunkCount++;
		return resp;
	}
	/** 执行一次实际的流式内容更新 */
	async performFlush() {
		this.logDebug(`performFlush: phase=${this.phase}, streamMsgId=${this.streamMsgId}, sentIndex=${this.sentIndex}`);
		if (!this.streamMsgId || this.isTerminalPhase) {
			this.logDebug(`performFlush: skipped (streamMsgId=${this.streamMsgId}, terminal=${this.isTerminalPhase})`);
			return;
		}
		const sessionText = this.lastNormalizedFull.slice(this.sentIndex);
		if (!sessionText) {
			this.logDebug(`performFlush: skipped (empty session text)`);
			return;
		}
		const [safeText, hasIncomplete] = stripIncompleteMediaTag(sessionText);
		if (hasIncomplete) this.logDebug(`flush: detected incomplete media tag, sending safe text (${safeText.length}/${sessionText.length} chars)`);
		if (!safeText) {
			this.logDebug(`performFlush: skipped (safeText empty after stripIncompleteMediaTag)`);
			return;
		}
		this.logDebug(`performFlush: sending chunk, safeText len=${safeText.length}`);
		try {
			await this.sendStreamChunk(safeText, StreamInputState.GENERATING, "performFlush");
			this.logDebug(`performFlush: chunk sent OK, sentStreamChunks=${this.sentStreamChunkCount}`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			this.logError(`stream flush failed, will retry on next scheduled flush: ${msg}`);
		}
	}
};
/**
* 将 StreamingMediaContext 转换为公共的 MediaSendContext
*/
function toMediaSendContext(ctx) {
	const { account, event, log } = ctx;
	return {
		mediaTarget: {
			targetType: event.type,
			targetId: event.type === "c2c" ? event.senderId : event.type === "group" ? event.groupOpenid : event.channelId,
			account,
			replyToId: event.messageId,
			logPrefix: `[qqbot:${account.accountId}]`
		},
		qualifiedTarget: event.type === "group" ? `qqbot:group:${event.groupOpenid}` : `qqbot:c2c:${event.senderId}`,
		account,
		replyToId: event.messageId,
		log
	};
}
/**
* 按顺序发送媒体队列中的所有项（流式场景专用）
*/
async function sendMediaQueue(queue, ctx) {
	await executeSendQueue(queue, toMediaSendContext(ctx), { skipInterTagText: true });
}
/**
* 是否对私聊走 QQ 官方 C2C `stream_messages` 流式 API。
* - `streaming: true` 等效于 `mode: "partial"` 且 `c2cStreamApi: true`。
* - 仍支持对象里显式设 `c2cStreamApi: true` 以兼容旧配置；仅 C2C 场景生效。
*/
function shouldUseOfficialC2cStream(account, targetType) {
	if (targetType !== "c2c") return false;
	const s = account.config?.streaming;
	if (s === true) return true;
	if (s && typeof s === "object" && s.c2cStreamApi === true) return true;
	return false;
}
//#endregion
//#region extensions/qqbot/src/engine/utils/audio.ts
/**
* Audio format conversion utilities.
* 音频格式转换工具。
*
* Handles SILK ↔ PCM ↔ WAV ↔ MP3 conversions for QQ Bot voice messaging.
* Prefers ffmpeg when available; falls back to WASM decoders (silk-wasm,
* mpg123-decoder) for environments without native tooling.
*
* Self-contained within engine/ — no framework SDK dependency.
*/
let _silkWasmPromise = null;
/** Lazy-load the silk-wasm module (singleton cache; returns null on failure). */
function loadSilkWasm() {
	if (_silkWasmPromise) return _silkWasmPromise;
	_silkWasmPromise = import("silk-wasm").catch((err) => {
		debugWarn(`[audio-convert] silk-wasm not available; SILK encode/decode disabled (${formatErrorMessage(err)})`);
		return null;
	});
	return _silkWasmPromise;
}
/** Wrap raw PCM s16le data into a standard WAV file. */
function pcmToWav(pcmData, sampleRate, channels = 1, bitsPerSample = 16) {
	const byteRate = sampleRate * channels * (bitsPerSample / 8);
	const blockAlign = channels * (bitsPerSample / 8);
	const dataSize = pcmData.length;
	const headerSize = 44;
	const fileSize = headerSize + dataSize;
	const buffer = Buffer.alloc(fileSize);
	buffer.write("RIFF", 0);
	buffer.writeUInt32LE(fileSize - 8, 4);
	buffer.write("WAVE", 8);
	buffer.write("fmt ", 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(channels, 22);
	buffer.writeUInt32LE(sampleRate, 24);
	buffer.writeUInt32LE(byteRate, 28);
	buffer.writeUInt16LE(blockAlign, 32);
	buffer.writeUInt16LE(bitsPerSample, 34);
	buffer.write("data", 36);
	buffer.writeUInt32LE(dataSize, 40);
	Buffer.from(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength).copy(buffer, headerSize);
	return buffer;
}
/** Strip the AMR header that may be present in QQ voice payloads. */
function stripAmrHeader(buf) {
	const AMR_HEADER = Buffer.from("#!AMR\n");
	if (buf.length > 6 && buf.subarray(0, 6).equals(AMR_HEADER)) return buf.subarray(6);
	return buf;
}
/** Convert a SILK or AMR voice file to WAV format. */
async function convertSilkToWav(inputPath, outputDir) {
	if (!fs$1.existsSync(inputPath)) return null;
	const strippedBuf = stripAmrHeader(fs$1.readFileSync(inputPath));
	const rawData = new Uint8Array(strippedBuf.buffer, strippedBuf.byteOffset, strippedBuf.byteLength);
	const silk = await loadSilkWasm();
	if (!silk || !silk.isSilk(rawData)) return null;
	const sampleRate = 24e3;
	const result = await silk.decode(rawData, sampleRate);
	const wavBuffer = pcmToWav(result.data, sampleRate);
	const dir = outputDir || path$1.dirname(inputPath);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	const baseName = path$1.basename(inputPath, path$1.extname(inputPath));
	const wavPath = path$1.join(dir, `${baseName}.wav`);
	fs$1.writeFileSync(wavPath, wavBuffer);
	return {
		wavPath,
		duration: result.duration
	};
}
/** Check whether an attachment is a voice file (by MIME type or extension). */
function isVoiceAttachment(att) {
	if (att.content_type === "voice" || att.content_type?.startsWith("audio/")) return true;
	const ext = att.filename ? normalizeLowercaseStringOrEmpty(path$1.extname(att.filename)) : "";
	return [
		".amr",
		".silk",
		".slk",
		".slac"
	].includes(ext);
}
/** Check whether a file path is a known audio format. */
function isAudioFile(filePath, mimeType) {
	if (mimeType) {
		if (mimeType === "voice" || mimeType.startsWith("audio/")) return true;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	return [
		".silk",
		".slk",
		".amr",
		".wav",
		".mp3",
		".ogg",
		".opus",
		".aac",
		".flac",
		".m4a",
		".wma",
		".pcm"
	].includes(ext);
}
const QQ_NATIVE_VOICE_MIMES = new Set([
	"audio/silk",
	"audio/amr",
	"audio/wav",
	"audio/wave",
	"audio/x-wav",
	"audio/mpeg",
	"audio/mp3"
]);
const QQ_NATIVE_VOICE_EXTS = new Set([
	".silk",
	".slk",
	".amr",
	".wav",
	".mp3"
]);
/** Check whether a voice file needs transcoding for upload (QQ-native formats skip it). */
function shouldTranscodeVoice(filePath, mimeType) {
	if (mimeType && QQ_NATIVE_VOICE_MIMES.has(normalizeLowercaseStringOrEmpty(mimeType))) return false;
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	if (QQ_NATIVE_VOICE_EXTS.has(ext)) return false;
	return isAudioFile(filePath, mimeType);
}
const QQ_NATIVE_UPLOAD_FORMATS = [
	".wav",
	".mp3",
	".silk"
];
function normalizeFormats(formats) {
	return formats.map((f) => {
		const lower = normalizeLowercaseStringOrEmpty(f);
		return lower.startsWith(".") ? lower : `.${lower}`;
	});
}
/**
* Convert a local audio file to Base64-encoded SILK for QQ API upload.
*
* Attempts conversion via ffmpeg → WASM decoders → null fallback chain.
*/
async function audioFileToSilkBase64(filePath, directUploadFormats) {
	if (!fs$1.existsSync(filePath)) return null;
	const buf = fs$1.readFileSync(filePath);
	if (buf.length === 0) {
		debugError(`[audio-convert] file is empty: ${filePath}`);
		return null;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	if ((directUploadFormats ? normalizeFormats(directUploadFormats) : QQ_NATIVE_UPLOAD_FORMATS).includes(ext)) {
		debugLog(`[audio-convert] direct upload (QQ native format): ${ext} (${buf.length} bytes)`);
		return buf.toString("base64");
	}
	if ([".slk", ".slac"].includes(ext)) {
		const stripped = stripAmrHeader(buf);
		const raw = new Uint8Array(stripped.buffer, stripped.byteOffset, stripped.byteLength);
		if ((await loadSilkWasm())?.isSilk(raw)) {
			debugLog(`[audio-convert] SILK file, direct use: ${filePath} (${buf.length} bytes)`);
			return buf.toString("base64");
		}
	}
	const rawCheck = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
	const strippedCheck = stripAmrHeader(buf);
	const strippedRaw = new Uint8Array(strippedCheck.buffer, strippedCheck.byteOffset, strippedCheck.byteLength);
	const silkForCheck = await loadSilkWasm();
	if (silkForCheck?.isSilk(rawCheck) || silkForCheck?.isSilk(strippedRaw)) {
		debugLog(`[audio-convert] SILK detected by header: ${filePath} (${buf.length} bytes)`);
		return buf.toString("base64");
	}
	const targetRate = 24e3;
	const ffmpegCmd = await detectFfmpeg();
	if (ffmpegCmd) try {
		debugLog(`[audio-convert] ffmpeg (${ffmpegCmd}): converting ${ext} (${buf.length} bytes) → PCM s16le ${targetRate}Hz`);
		const pcmBuf = await ffmpegToPCM(ffmpegCmd, filePath, targetRate);
		if (pcmBuf.length === 0) {
			debugError(`[audio-convert] ffmpeg produced empty PCM output`);
			return null;
		}
		const { silkBuffer } = await pcmToSilk(pcmBuf, targetRate);
		debugLog(`[audio-convert] ffmpeg: ${ext} → SILK done (${silkBuffer.length} bytes)`);
		return silkBuffer.toString("base64");
	} catch (err) {
		debugError(`[audio-convert] ffmpeg conversion failed: ${formatErrorMessage(err)}`);
	}
	debugLog(`[audio-convert] fallback: trying WASM decoders for ${ext}`);
	if (ext === ".pcm") {
		const { silkBuffer } = await pcmToSilk(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength), targetRate);
		return silkBuffer.toString("base64");
	}
	if (ext === ".wav" || buf.length >= 4 && buf.toString("ascii", 0, 4) === "RIFF") {
		const wavInfo = parseWavFallback(buf);
		if (wavInfo) {
			const { silkBuffer } = await pcmToSilk(wavInfo, targetRate);
			return silkBuffer.toString("base64");
		}
	}
	if (ext === ".mp3" || ext === ".mpeg") {
		const pcmBuf = await wasmDecodeMp3ToPCM(buf, targetRate);
		if (pcmBuf) {
			const { silkBuffer } = await pcmToSilk(pcmBuf, targetRate);
			debugLog(`[audio-convert] WASM: MP3 → SILK done (${silkBuffer.length} bytes)`);
			return silkBuffer.toString("base64");
		}
	}
	debugError(`[audio-convert] unsupported format: ${ext} (no ffmpeg available). ${isWindows() ? "Install ffmpeg with choco install ffmpeg, scoop install ffmpeg, or from https://ffmpeg.org" : process.platform === "darwin" ? "Install ffmpeg with brew install ffmpeg" : "Install ffmpeg with sudo apt install ffmpeg or sudo yum install ffmpeg"}`);
	return null;
}
/**
* Wait for a file to appear and stabilize, then return its final size.
*
* Polls at `pollMs` intervals; returns 0 on timeout or persistent empty file.
*/
async function waitForFile(filePath, timeoutMs = 3e4, pollMs = 500) {
	const start = Date.now();
	let lastSize = -1;
	let stableCount = 0;
	let fileExists = false;
	let fileAppearedAt = 0;
	let pollCount = 0;
	const emptyGiveUpMs = 1e4;
	const noFileGiveUpMs = 15e3;
	while (Date.now() - start < timeoutMs) {
		pollCount++;
		try {
			const stat = fs$1.statSync(filePath);
			if (!fileExists) {
				fileExists = true;
				fileAppearedAt = Date.now();
				debugLog(`[audio-convert] waitForFile: file appeared (${stat.size} bytes, after ${Date.now() - start}ms): ${path$1.basename(filePath)}`);
			}
			if (stat.size > 0) {
				if (stat.size === lastSize) {
					stableCount++;
					if (stableCount >= 2) {
						debugLog(`[audio-convert] waitForFile: ready (${stat.size} bytes, waited ${Date.now() - start}ms, polls=${pollCount})`);
						return stat.size;
					}
				} else stableCount = 0;
				lastSize = stat.size;
			} else if (Date.now() - fileAppearedAt > emptyGiveUpMs) {
				debugError(`[audio-convert] waitForFile: file still empty after ${emptyGiveUpMs}ms, giving up: ${path$1.basename(filePath)}`);
				return 0;
			}
		} catch {
			if (!fileExists && Date.now() - start > noFileGiveUpMs) {
				debugError(`[audio-convert] waitForFile: file never appeared after ${noFileGiveUpMs}ms, giving up: ${path$1.basename(filePath)}`);
				return 0;
			}
		}
		await new Promise((r) => setTimeout(r, pollMs));
	}
	try {
		const finalStat = fs$1.statSync(filePath);
		if (finalStat.size > 0) {
			debugWarn(`[audio-convert] waitForFile: timeout but file has data (${finalStat.size} bytes), using it`);
			return finalStat.size;
		}
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file exists but empty (0 bytes): ${path$1.basename(filePath)}`);
	} catch {
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file never appeared: ${path$1.basename(filePath)}`);
	}
	return 0;
}
/** Encode PCM s16le data into SILK format. */
async function pcmToSilk(pcmBuffer, sampleRate) {
	const silk = await loadSilkWasm();
	if (!silk) throw new Error("silk-wasm is not available; cannot encode PCM to SILK");
	const pcmData = new Uint8Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength);
	const result = await silk.encode(pcmData, sampleRate);
	return {
		silkBuffer: Buffer.from(result.data.buffer, result.data.byteOffset, result.data.byteLength),
		duration: result.duration
	};
}
/** Use ffmpeg to convert any audio to mono 24 kHz PCM s16le. */
function ffmpegToPCM(ffmpegCmd, inputPath, sampleRate = 24e3) {
	return new Promise((resolve, reject) => {
		execFile(ffmpegCmd, [
			"-i",
			inputPath,
			"-f",
			"s16le",
			"-ar",
			String(sampleRate),
			"-ac",
			"1",
			"-acodec",
			"pcm_s16le",
			"-v",
			"error",
			"pipe:1"
		], {
			maxBuffer: 50 * 1024 * 1024,
			encoding: "buffer",
			...isWindows() ? { windowsHide: true } : {}
		}, (err, stdout) => {
			if (err) {
				reject(/* @__PURE__ */ new Error(`ffmpeg failed: ${err.message}`));
				return;
			}
			resolve(stdout);
		});
	});
}
/** Decode MP3 to PCM via mpg123-decoder WASM (fallback when ffmpeg is unavailable). */
async function wasmDecodeMp3ToPCM(buf, targetRate) {
	try {
		const { MPEGDecoder } = await import("mpg123-decoder");
		debugLog(`[audio-convert] WASM MP3 decode: size=${buf.length} bytes`);
		const decoder = new MPEGDecoder();
		await decoder.ready;
		const decoded = decoder.decode(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
		decoder.free();
		if (decoded.samplesDecoded === 0 || decoded.channelData.length === 0) {
			debugError(`[audio-convert] WASM MP3 decode: no samples (samplesDecoded=${decoded.samplesDecoded})`);
			return null;
		}
		debugLog(`[audio-convert] WASM MP3 decode: samples=${decoded.samplesDecoded}, sampleRate=${decoded.sampleRate}, channels=${decoded.channelData.length}`);
		let floatMono;
		if (decoded.channelData.length === 1) floatMono = decoded.channelData[0];
		else {
			floatMono = new Float32Array(decoded.samplesDecoded);
			const channels = decoded.channelData.length;
			for (let i = 0; i < decoded.samplesDecoded; i++) {
				let sum = 0;
				for (let ch = 0; ch < channels; ch++) sum += decoded.channelData[ch][i];
				floatMono[i] = sum / channels;
			}
		}
		const s16 = new Uint8Array(floatMono.length * 2);
		const view = new DataView(s16.buffer);
		for (let i = 0; i < floatMono.length; i++) {
			const clamped = Math.max(-1, Math.min(1, floatMono[i]));
			const val = clamped < 0 ? clamped * 32768 : clamped * 32767;
			view.setInt16(i * 2, Math.round(val), true);
		}
		let pcm = s16;
		if (decoded.sampleRate !== targetRate) {
			const inputSamples = s16.length / 2;
			const outputSamples = Math.round(inputSamples * targetRate / decoded.sampleRate);
			const output = new Uint8Array(outputSamples * 2);
			const inView = new DataView(s16.buffer, s16.byteOffset, s16.byteLength);
			const outView = new DataView(output.buffer, output.byteOffset, output.byteLength);
			for (let i = 0; i < outputSamples; i++) {
				const srcIdx = i * decoded.sampleRate / targetRate;
				const idx0 = Math.floor(srcIdx);
				const idx1 = Math.min(idx0 + 1, inputSamples - 1);
				const frac = srcIdx - idx0;
				const s0 = inView.getInt16(idx0 * 2, true);
				const s1 = inView.getInt16(idx1 * 2, true);
				const sample = Math.round(s0 + (s1 - s0) * frac);
				outView.setInt16(i * 2, Math.max(-32768, Math.min(32767, sample)), true);
			}
			pcm = output;
		}
		return Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
	} catch (err) {
		debugError(`[audio-convert] WASM MP3 decode failed: ${formatErrorMessage(err)}`);
		if (err instanceof Error && err.stack) debugError(`[audio-convert] stack: ${err.stack}`);
		return null;
	}
}
/** Parse a standard PCM WAV and extract mono 24 kHz PCM data (fallback without ffmpeg). */
function parseWavFallback(buf) {
	if (buf.length < 44) return null;
	if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
	if (buf.toString("ascii", 8, 12) !== "WAVE") return null;
	if (buf.toString("ascii", 12, 16) !== "fmt ") return null;
	if (buf.readUInt16LE(20) !== 1) return null;
	const channels = buf.readUInt16LE(22);
	const sampleRate = buf.readUInt32LE(24);
	if (buf.readUInt16LE(34) !== 16) return null;
	let offset = 36;
	while (offset < buf.length - 8) {
		const chunkId = buf.toString("ascii", offset, offset + 4);
		const chunkSize = buf.readUInt32LE(offset + 4);
		if (chunkId === "data") {
			const dataStart = offset + 8;
			const dataEnd = Math.min(dataStart + chunkSize, buf.length);
			let pcm = new Uint8Array(buf.buffer, buf.byteOffset + dataStart, dataEnd - dataStart);
			if (channels > 1) {
				const samplesPerCh = pcm.length / (2 * channels);
				const mono = new Uint8Array(samplesPerCh * 2);
				const inV = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
				const outV = new DataView(mono.buffer, mono.byteOffset, mono.byteLength);
				for (let i = 0; i < samplesPerCh; i++) {
					let sum = 0;
					for (let ch = 0; ch < channels; ch++) sum += inV.getInt16((i * channels + ch) * 2, true);
					outV.setInt16(i * 2, Math.max(-32768, Math.min(32767, Math.round(sum / channels))), true);
				}
				pcm = mono;
			}
			const targetRate = 24e3;
			if (sampleRate !== targetRate) {
				const inSamples = pcm.length / 2;
				const outSamples = Math.round(inSamples * targetRate / sampleRate);
				const out = new Uint8Array(outSamples * 2);
				const inV = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
				const outV = new DataView(out.buffer, out.byteOffset, out.byteLength);
				for (let i = 0; i < outSamples; i++) {
					const src = i * sampleRate / targetRate;
					const i0 = Math.floor(src);
					const i1 = Math.min(i0 + 1, inSamples - 1);
					const f = src - i0;
					const s0 = inV.getInt16(i0 * 2, true);
					const s1 = inV.getInt16(i1 * 2, true);
					outV.setInt16(i * 2, Math.max(-32768, Math.min(32767, Math.round(s0 + (s1 - s0) * f))), true);
				}
				pcm = out;
			}
			return Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
		}
		offset += 8 + chunkSize;
	}
	return null;
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/outbound-dispatch.ts
/**
* Outbound dispatcher — manage AI reply delivery, tool fallback, and timeouts.
*
* Responsibilities:
* 1. Build ctxPayload and call runtime.dispatchReply
* 2. Tool deliver collection + fallback timeout
* 3. Block deliver pipeline (consumeQuoteRef → media tags → structured payload → plain text)
* 4. Timeout / error handling
*
* Separated from gateway.ts for testability and to keep handleMessage thin.
*/
const RESPONSE_TIMEOUT = 12e4;
const TOOL_ONLY_TIMEOUT = 6e4;
const MAX_TOOL_RENEWALS = 3;
const TOOL_MEDIA_SEND_TIMEOUT = 45e3;
/**
* Dispatch the AI reply for the given inbound context.
*
* Handles tool deliver collection, block deliver pipeline, and timeouts.
* The caller is responsible for stopping typing.keepAlive in `finally`.
*/
async function dispatchOutbound(inbound, deps) {
	const { runtime, cfg, account, log } = deps;
	const { event, qualifiedTarget } = inbound;
	const replyCtx = {
		target: {
			type: event.type,
			senderId: event.senderId,
			messageId: event.messageId,
			channelId: event.channelId,
			guildId: event.guildId,
			groupOpenid: event.groupOpenid
		},
		account,
		cfg,
		log
	};
	const sendWithRetry = (sendFn) => sendWithTokenRetry(account.appId, account.clientSecret, sendFn, log, account.accountId);
	const sendErrorMessage = (errorText) => sendErrorToTarget(replyCtx, errorText);
	const ctxPayload = buildCtxPayload(inbound, runtime);
	let hasResponse = false;
	let hasBlockResponse = false;
	let toolDeliverCount = 0;
	const toolTexts = [];
	const toolMediaUrls = [];
	let toolFallbackSent = false;
	let toolRenewalCount = 0;
	let timeoutId = null;
	let toolOnlyTimeoutId = null;
	const sendToolFallback = async () => {
		if (toolMediaUrls.length > 0) {
			for (const mediaUrl of toolMediaUrls) {
				const ac = new AbortController();
				try {
					const result = await Promise.race([sendMedia({
						to: qualifiedTarget,
						text: "",
						mediaUrl,
						accountId: account.accountId,
						replyToId: event.messageId,
						account
					}).then((r) => {
						if (ac.signal.aborted) return {
							channel: "qqbot",
							error: "suppressed"
						};
						return r;
					}), new Promise((resolve) => setTimeout(() => {
						ac.abort();
						resolve({
							channel: "qqbot",
							error: "timeout"
						});
					}, TOOL_MEDIA_SEND_TIMEOUT))]);
					if (result.error) log?.error(`Tool fallback error: ${result.error}`);
				} catch (err) {
					log?.error(`Tool fallback failed: ${String(err)}`);
				}
			}
			return;
		}
		if (toolTexts.length > 0) await sendErrorMessage(toolTexts.slice(-3).join("\n---\n").slice(0, 2e3));
	};
	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			if (!hasResponse) reject(/* @__PURE__ */ new Error("Response timeout"));
		}, RESPONSE_TIMEOUT);
	});
	const deliverDeps = {
		mediaSender: {
			sendPhoto: (target, imageUrl) => sendPhoto(target, imageUrl),
			sendVoice: (target, voicePath, uploadFormats, transcodeEnabled) => sendVoice(target, voicePath, uploadFormats, transcodeEnabled),
			sendVideoMsg: (target, videoPath) => sendVideoMsg(target, videoPath),
			sendDocument: (target, filePath) => sendDocument(target, filePath),
			sendMedia: (opts) => sendMedia(opts)
		},
		chunkText: (text, limit) => runtime.channel.text.chunkMarkdownText(text, limit)
	};
	const replyDeps = { tts: {
		textToSpeech: (params) => runtime.tts.textToSpeech(params),
		audioFileToSilkBase64: async (p) => await audioFileToSilkBase64(p) ?? void 0
	} };
	const recordOutbound = () => runtime.channel.activity.record({
		channel: "qqbot",
		accountId: account.accountId,
		direction: "outbound"
	});
	const messagesConfig = runtime.channel.reply.resolveEffectiveMessagesConfig(cfg, inbound.route.agentId);
	const useOfficialC2cStream = shouldUseOfficialC2cStream(account, event.type === "c2c" ? "c2c" : event.type === "group" ? "group" : "channel");
	let streamingController = null;
	if (useOfficialC2cStream) streamingController = new StreamingController({
		account,
		userId: event.senderId,
		replyToMsgId: event.messageId,
		eventId: event.messageId,
		logPrefix: `[qqbot:${account.accountId}:streaming]`,
		log,
		mediaContext: {
			account,
			event: {
				type: event.type,
				senderId: event.senderId,
				messageId: event.messageId,
				groupOpenid: event.groupOpenid,
				channelId: event.channelId
			},
			log
		}
	});
	const dispatchPromise = runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
		ctx: ctxPayload,
		cfg,
		dispatcherOptions: {
			responsePrefix: messagesConfig.responsePrefix,
			deliver: async (payload, info) => {
				hasResponse = true;
				if (info.kind === "tool") {
					toolDeliverCount++;
					const toolText = (payload.text ?? "").trim();
					if (toolText) toolTexts.push(toolText);
					if (payload.mediaUrls?.length) toolMediaUrls.push(...payload.mediaUrls);
					if (payload.mediaUrl && !toolMediaUrls.includes(payload.mediaUrl)) toolMediaUrls.push(payload.mediaUrl);
					if (hasBlockResponse && toolMediaUrls.length > 0) {
						const urlsToSend = [...toolMediaUrls];
						toolMediaUrls.length = 0;
						for (const mediaUrl of urlsToSend) try {
							await sendMedia({
								to: qualifiedTarget,
								text: "",
								mediaUrl,
								accountId: account.accountId,
								replyToId: event.messageId,
								account
							});
						} catch {}
						return;
					}
					if (toolFallbackSent) return;
					if (toolOnlyTimeoutId) if (toolRenewalCount < MAX_TOOL_RENEWALS) {
						clearTimeout(toolOnlyTimeoutId);
						toolRenewalCount++;
					} else return;
					toolOnlyTimeoutId = setTimeout(async () => {
						if (!hasBlockResponse && !toolFallbackSent) {
							toolFallbackSent = true;
							try {
								await sendToolFallback();
							} catch {}
						}
					}, TOOL_ONLY_TIMEOUT);
					return;
				}
				hasBlockResponse = true;
				inbound.typing.keepAlive?.stop();
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
				if (toolOnlyTimeoutId) {
					clearTimeout(toolOnlyTimeoutId);
					toolOnlyTimeoutId = null;
				}
				if (streamingController && !streamingController.isTerminalPhase) {
					try {
						await streamingController.onDeliver(payload);
					} catch (err) {
						log?.error(`Streaming deliver error: ${err instanceof Error ? err.message : String(err)}`);
					}
					const replyPreview = (payload.text ?? "").trim();
					if (event.type === "group" && (replyPreview === "NO_REPLY" || replyPreview === "[SKIP]")) {
						log?.info(`Model decided to skip group message (${replyPreview}) from ${event.senderId}`);
						return;
					}
					if (streamingController.shouldFallbackToStatic) log?.info("Streaming API unavailable, falling back to static for this deliver");
					else {
						recordOutbound();
						return;
					}
				}
				const quoteRef = event.msgIdx;
				let quoteRefUsed = false;
				const consumeQuoteRef = () => {
					if (quoteRef && !quoteRefUsed) {
						quoteRefUsed = true;
						return quoteRef;
					}
				};
				let replyText = payload.text ?? "";
				const deliverEvent = {
					type: event.type,
					senderId: event.senderId,
					messageId: event.messageId,
					channelId: event.channelId,
					groupOpenid: event.groupOpenid,
					msgIdx: event.msgIdx
				};
				const deliverActx = {
					account,
					qualifiedTarget,
					log
				};
				const mediaResult = await parseAndSendMediaTags(replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef, deliverDeps);
				if (mediaResult.handled) {
					recordOutbound();
					return;
				}
				replyText = mediaResult.normalizedText;
				if (await handleStructuredPayload(replyCtx, replyText, recordOutbound, replyDeps)) return;
				if (payload.audioAsVoice === true && !payload.mediaUrl && !payload.mediaUrls?.length) {
					if (await sendTextAsVoiceReply(replyCtx, replyText, replyDeps)) {
						recordOutbound();
						return;
					}
				}
				await sendPlainReply(payload, replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef, toolMediaUrls, deliverDeps);
				recordOutbound();
			},
			onError: async (err) => {
				if (streamingController && !streamingController.isTerminalPhase) {
					try {
						await streamingController.onError(err);
					} catch (streamErr) {
						const streamErrMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
						log?.error(`Streaming onError failed: ${streamErrMsg}`);
					}
					if (!streamingController.shouldFallbackToStatic) return;
				}
				const errMsg = err instanceof Error ? err.message : String(err);
				log?.error(`Dispatch error: ${errMsg}`);
				hasResponse = true;
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
			}
		},
		replyOptions: {
			disableBlockStreaming: useOfficialC2cStream ? true : (() => {
				const s = account.config?.streaming;
				if (s === false) return true;
				return typeof s === "object" && s !== null && s.mode === "off";
			})(),
			...streamingController ? { onPartialReply: async (payload) => {
				try {
					await streamingController.onPartialReply(payload);
				} catch (partialErr) {
					log?.error(`Streaming onPartialReply error: ${partialErr instanceof Error ? partialErr.message : String(partialErr)}`);
				}
			} } : {}
		}
	});
	try {
		await Promise.race([dispatchPromise, timeoutPromise]);
	} catch {
		if (timeoutId) clearTimeout(timeoutId);
	} finally {
		if (toolOnlyTimeoutId) {
			clearTimeout(toolOnlyTimeoutId);
			toolOnlyTimeoutId = null;
		}
		if (toolDeliverCount > 0 && !hasBlockResponse && !toolFallbackSent) {
			toolFallbackSent = true;
			await sendToolFallback();
		}
		if (streamingController && !streamingController.isTerminalPhase) try {
			streamingController.markFullyComplete();
			await streamingController.onIdle();
		} catch (finalizeErr) {
			log?.error(`Streaming finalization error: ${finalizeErr instanceof Error ? finalizeErr.message : String(finalizeErr)}`);
			try {
				await streamingController.abortStreaming();
			} catch {}
		}
	}
}
function buildCtxPayload(inbound, runtime) {
	const { event } = inbound;
	return runtime.channel.reply.finalizeInboundContext({
		Body: inbound.body,
		BodyForAgent: inbound.agentBody,
		RawBody: event.content,
		CommandBody: event.content,
		From: inbound.fromAddress,
		To: inbound.fromAddress,
		SessionKey: inbound.route.sessionKey,
		AccountId: inbound.route.accountId,
		ChatType: inbound.isGroupChat ? "group" : "direct",
		GroupSystemPrompt: inbound.groupSystemPrompt,
		SenderId: event.senderId,
		SenderName: event.senderName,
		Provider: "qqbot",
		Surface: "qqbot",
		MessageSid: event.messageId,
		Timestamp: new Date(event.timestamp).getTime(),
		OriginatingChannel: "qqbot",
		OriginatingTo: inbound.fromAddress,
		QQChannelId: event.channelId,
		QQGuildId: event.guildId,
		QQGroupOpenid: event.groupOpenid,
		QQVoiceAsrReferAvailable: inbound.hasAsrReferFallback,
		QQVoiceTranscriptSources: inbound.voiceTranscriptSources,
		QQVoiceAttachmentPaths: inbound.uniqueVoicePaths,
		QQVoiceAttachmentUrls: inbound.uniqueVoiceUrls,
		QQVoiceAsrReferTexts: inbound.uniqueVoiceAsrReferTexts,
		QQVoiceInputStrategy: "prefer_audio_stt_then_asr_fallback",
		CommandAuthorized: inbound.commandAuthorized,
		...inbound.voiceMediaTypes.length > 0 ? {
			MediaTypes: inbound.voiceMediaTypes,
			MediaType: inbound.voiceMediaTypes[0]
		} : {},
		...inbound.localMediaPaths.length > 0 ? {
			MediaPaths: inbound.localMediaPaths,
			MediaPath: inbound.localMediaPaths[0],
			MediaTypes: inbound.localMediaTypes,
			MediaType: inbound.localMediaTypes[0]
		} : {},
		...inbound.remoteMediaUrls.length > 0 ? {
			MediaUrls: inbound.remoteMediaUrls,
			MediaUrl: inbound.remoteMediaUrls[0]
		} : {},
		...inbound.replyTo ? {
			ReplyToId: inbound.replyTo.id,
			ReplyToBody: inbound.replyTo.body,
			ReplyToSender: inbound.replyTo.sender,
			ReplyToIsQuote: inbound.replyTo.isQuote
		} : {}
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/typing-keepalive.ts
/**
* Periodically refresh C2C typing state while a response is in progress.
*
* All I/O operations are injected via constructor parameters so this
* module has zero external dependencies and can run in both plugin versions.
*/
/** Refresh every 50s for the QQ API's 60s input-notify window. */
const TYPING_INTERVAL_MS = 5e4;
var TypingKeepAlive = class {
	constructor(getToken, clearCache, sendInputNotify, openid, msgId, log) {
		this.getToken = getToken;
		this.clearCache = clearCache;
		this.sendInputNotify = sendInputNotify;
		this.openid = openid;
		this.msgId = msgId;
		this.log = log;
		this.timer = null;
		this.stopped = false;
	}
	/** Start periodic keep-alive sends. */
	start() {
		if (this.stopped) return;
		this.timer = setInterval(() => {
			if (this.stopped) {
				this.stop();
				return;
			}
			this.send().catch(() => {});
		}, TYPING_INTERVAL_MS);
	}
	/** Stop periodic keep-alive sends. */
	stop() {
		this.stopped = true;
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
	async send() {
		try {
			const token = await this.getToken();
			await this.sendInputNotify(token, this.openid, this.msgId, 60);
			this.log?.debug?.(`Typing keep-alive sent to ${this.openid}`);
		} catch (err) {
			try {
				this.clearCache();
				const token = await this.getToken();
				await this.sendInputNotify(token, this.openid, this.msgId, 60);
			} catch {
				this.log?.debug?.(`Typing keep-alive failed for ${this.openid}: ${formatErrorMessage(err)}`);
			}
		}
	}
};
//#endregion
//#region extensions/qqbot/src/engine/gateway/gateway.ts
/**
* Core gateway entry point — thin shell that wires together:
*
* - GatewayConnection: WebSocket lifecycle, heartbeat, reconnect
* - buildInboundContext: content building, attachments, quote resolution
* - dispatchOutbound: AI dispatch, deliver callbacks, timeouts
*
* The only responsibilities of this file are:
* 1. Initialize adapters from EngineAdapters
* 2. Initialize API config + refIdx cache hook
* 3. Create the message handler (inbound → outbound pipeline)
* 4. Start GatewayConnection
*/
/**
* Start the Gateway WebSocket connection with automatic reconnect support.
*/
async function startGateway$1(ctx) {
	const { account, log, runtime, adapters } = ctx;
	setOutboundAudioPort(adapters.outboundAudio);
	initCommands(adapters.commands);
	if (!account.appId || !account.clientSecret) throw new Error("QQBot not configured (missing appId or clientSecret)");
	const diag = await runDiagnostics();
	if (diag.warnings.length > 0) for (const w of diag.warnings) log?.info(w);
	initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
	log?.debug?.(`API config: markdownSupport=${account.markdownSupport}`);
	onMessageSent(account.appId, (refIdx, meta) => {
		log?.info(`onMessageSent called: refIdx=${refIdx}, mediaType=${meta.mediaType}, ttsText=${meta.ttsText?.slice(0, 30)}`);
		const attachments = [];
		if (meta.mediaType) {
			const localPath = meta.mediaLocalPath;
			const filename = localPath ? path.basename(localPath) : void 0;
			const attachment = {
				type: meta.mediaType,
				...localPath ? { localPath } : {},
				...filename ? { filename } : {},
				...meta.mediaUrl ? { url: meta.mediaUrl } : {}
			};
			if (meta.mediaType === "voice" && meta.ttsText) {
				attachment.transcript = meta.ttsText;
				attachment.transcriptSource = "tts";
			}
			attachments.push(attachment);
		}
		setRefIndex(refIdx, {
			content: meta.text ?? "",
			senderId: account.accountId,
			senderName: account.accountId,
			timestamp: Date.now(),
			isBot: true,
			...attachments.length > 0 ? { attachments } : {}
		});
	});
	const groupOpts = {
		enabled: ctx.group?.enabled ?? true,
		allowTextCommands: ctx.group?.allowTextCommands,
		isControlCommand: ctx.group?.isControlCommand,
		resolveIntroHint: ctx.group?.resolveIntroHint,
		sessionStoreReader: ctx.group?.sessionStoreReader
	};
	const groupChatEnabled = groupOpts.enabled;
	const groupHistories = groupChatEnabled ? /* @__PURE__ */ new Map() : void 0;
	const sessionStoreReader = groupChatEnabled ? groupOpts.sessionStoreReader ?? createNodeSessionStoreReader() : void 0;
	const handleMessage = async (event) => {
		log?.info(`Processing message from ${event.senderId}: ${event.content}`, {
			accountId: account.accountId,
			messageId: event.messageId,
			senderId: event.senderId,
			type: event.type,
			groupOpenid: event.groupOpenid
		});
		runtime.channel.activity.record({
			channel: "qqbot",
			accountId: account.accountId,
			direction: "inbound"
		});
		const inbound = await buildInboundContext(event, {
			account,
			cfg: ctx.cfg,
			log,
			runtime,
			startTyping: (ev) => startTypingForEvent(ev, account, log),
			groupHistories,
			sessionStoreReader,
			allowTextCommands: groupOpts.allowTextCommands,
			isControlCommand: groupOpts.isControlCommand,
			resolveGroupIntroHint: groupOpts.resolveIntroHint,
			adapters
		});
		if (inbound.blocked) {
			log?.info(`Dropped inbound qqbot message: ${inbound.blockReason ?? "blocked by allowFrom"}`, {
				accountId: account.accountId,
				messageId: event.messageId,
				blockReason: inbound.blockReason
			});
			inbound.typing.keepAlive?.stop();
			return;
		}
		if (inbound.skipped) {
			log?.info(`Skipped group inbound: reason=${inbound.skipReason ?? "unknown"} group=${event.groupOpenid ?? ""}`, {
				accountId: account.accountId,
				messageId: event.messageId,
				skipReason: inbound.skipReason,
				groupOpenid: event.groupOpenid
			});
			inbound.typing.keepAlive?.stop();
			return;
		}
		try {
			await runWithRequestContext({
				accountId: account.accountId,
				target: inbound.qualifiedTarget,
				targetId: inbound.peerId,
				chatType: event.type
			}, () => dispatchOutbound(inbound, {
				runtime,
				cfg: ctx.cfg,
				account,
				log
			}));
		} catch (err) {
			log?.error(`Message processing failed: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			inbound.typing.keepAlive?.stop();
			if (event.type === "group" && event.groupOpenid && inbound.group) clearGroupPendingHistory({
				historyMap: groupHistories,
				groupOpenid: event.groupOpenid,
				historyLimit: inbound.group.historyLimit,
				historyPort: adapters.history
			});
		}
	};
	const handleInteraction = createInteractionHandler(account, ctx.runtime, log);
	await new GatewayConnection({
		account,
		abortSignal: ctx.abortSignal,
		cfg: ctx.cfg,
		log,
		runtime,
		onReady: ctx.onReady,
		onResumed: ctx.onResumed,
		onError: ctx.onError,
		onInteraction: handleInteraction,
		handleMessage
	}).start();
}
/**
* Start typing indicator for a C2C event.
* Returns the refIdx from InputNotify and a TypingKeepAlive handle.
*/
async function startTypingForEvent(event, account, log) {
	if (!(event.type === "c2c" || event.type === "dm")) return { keepAlive: null };
	try {
		const creds = accountToCreds(account);
		const rawNotifyFn = createRawInputNotifyFn(account.appId);
		try {
			const resp = await sendInputNotify({
				openid: event.senderId,
				creds,
				msgId: event.messageId,
				inputSecond: 60
			});
			const keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), rawNotifyFn, event.senderId, event.messageId, log);
			keepAlive.start();
			return {
				refIdx: resp.refIdx,
				keepAlive
			};
		} catch (notifyErr) {
			const errMsg = String(notifyErr);
			if (errMsg.includes("token") || errMsg.includes("401") || errMsg.includes("11244")) {
				clearTokenCache(account.appId);
				const resp = await sendInputNotify({
					openid: event.senderId,
					creds,
					msgId: event.messageId,
					inputSecond: 60
				});
				const keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), rawNotifyFn, event.senderId, event.messageId, log);
				keepAlive.start();
				return {
					refIdx: resp.refIdx,
					keepAlive
				};
			}
			throw notifyErr;
		}
	} catch (err) {
		log?.error(`sendInputNotify error: ${err instanceof Error ? err.message : String(err)}`);
		return { keepAlive: null };
	}
}
//#endregion
//#region extensions/qqbot/src/bridge/plugin-version.ts
/**
* QQBot plugin version resolver.
*
* Reads the version field from this plugin's own `package.json` by
* walking up the directory tree starting from `import.meta.url` of the
* caller until a `package.json` whose `name` field matches the plugin
* package id is located.
*
* Why not a hardcoded relative path?
*   - The source file can live at different depths depending on whether
*     we run from raw sources (`src/bridge/gateway.ts`) or a future
*     compiled output. Hardcoding `"../../package.json"` breaks as soon
*     as the source layout changes, which is what caused the previous
*     `vunknown` regression.
*   - A `name` guard prevents accidentally reading the parent
*     `openclaw/package.json` (the framework root) when the plugin
*     lives inside the monorepo.
*
* The lookup is performed only once per process at startup, so the
* synchronous file I/O is negligible.
*/
/** `name` field in this plugin's `package.json`. */
const QQBOT_PLUGIN_PKG_NAME = "@openclaw/qqbot";
/** Sentinel used when the version cannot be resolved. */
const QQBOT_PLUGIN_VERSION_UNKNOWN = "unknown";
/**
* Resolve the QQBot plugin version from `package.json`.
*
* @param startUrl — pass `import.meta.url` from the call site so the
*   lookup begins at the caller's file regardless of where this helper
*   itself lives. Falls back to this module's own location when omitted.
*/
function resolveQQBotPluginVersion(startUrl) {
	const entryUrl = startUrl ?? import.meta.url;
	let dir;
	try {
		dir = path.dirname(fileURLToPath(entryUrl));
	} catch {
		return QQBOT_PLUGIN_VERSION_UNKNOWN;
	}
	const root = path.parse(dir).root;
	while (dir && dir !== root) {
		const candidate = path.join(dir, "package.json");
		if (fs.existsSync(candidate)) {
			const version = readQQBotVersionFromManifest(candidate);
			if (version) return version;
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return QQBOT_PLUGIN_VERSION_UNKNOWN;
}
/**
* Read the `version` field from a `package.json` file and return it
* only when the manifest describes the QQBot plugin itself.
*
* Returning `null` for mismatched or malformed manifests lets the
* caller keep walking up the directory tree until the correct package
* boundary is located.
*/
function readQQBotVersionFromManifest(manifestPath) {
	let raw;
	try {
		raw = fs.readFileSync(manifestPath, "utf8");
	} catch {
		return null;
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!parsed || typeof parsed !== "object") return null;
	const manifest = parsed;
	if (manifest.name !== QQBOT_PLUGIN_PKG_NAME) return null;
	if (typeof manifest.version !== "string" || manifest.version.length === 0) return null;
	return manifest.version;
}
//#endregion
//#region extensions/qqbot/src/bridge/sdk-adapter.ts
/**
* SDK adapter — binds engine port interfaces to the framework's shared
* SDK implementations.
*
* This file lives in bridge/ (not engine/) because it imports from
* `openclaw/plugin-sdk/*`. The engine layer stays zero-SDK-dependency;
* only the bridge layer couples to the framework.
*/
function asSdkMap(map) {
	return map;
}
/**
* History adapter backed by SDK `reply-history`.
*
* Delegates record/build/clear to the SDK's shared implementation so
* the engine benefits from SDK improvements (e.g. future visibility
* filtering) without code duplication.
*/
function createSdkHistoryAdapter() {
	return {
		recordPendingHistoryEntry(params) {
			return recordPendingHistoryEntryIfEnabled({
				historyMap: asSdkMap(params.historyMap),
				historyKey: params.historyKey,
				entry: params.entry,
				limit: params.limit
			});
		},
		buildPendingHistoryContext(params) {
			return buildPendingHistoryContextFromMap({
				historyMap: asSdkMap(params.historyMap),
				historyKey: params.historyKey,
				limit: params.limit,
				currentMessage: params.currentMessage,
				formatEntry: params.formatEntry,
				lineBreak: params.lineBreak
			});
		},
		clearPendingHistory(params) {
			clearHistoryEntriesIfEnabled({
				historyMap: asSdkMap(params.historyMap),
				historyKey: params.historyKey,
				limit: params.limit
			});
		}
	};
}
/**
* MentionGate adapter backed by SDK `channel-mention-gating`.
*
* Maps the engine's mention facts/policy to the SDK's
* `resolveInboundMentionDecision` call, normalizing the implicit
* mention boolean into the SDK's typed `ImplicitMentionKind[]`.
*/
function createSdkMentionGateAdapter() {
	return { resolveInboundMentionDecision(params) {
		const result = resolveInboundMentionDecision({
			facts: {
				canDetectMention: params.facts.canDetectMention,
				wasMentioned: params.facts.wasMentioned,
				hasAnyMention: params.facts.hasAnyMention,
				implicitMentionKinds: params.facts.implicitMentionKinds ?? implicitMentionKindWhen("reply_to_bot", false)
			},
			policy: {
				isGroup: params.policy.isGroup,
				requireMention: params.policy.requireMention,
				allowTextCommands: params.policy.allowTextCommands,
				hasControlCommand: params.policy.hasControlCommand,
				commandAuthorized: params.policy.commandAuthorized
			}
		});
		return {
			effectiveWasMentioned: result.effectiveWasMentioned,
			shouldSkip: result.shouldSkip,
			shouldBypassMention: result.shouldBypassMention,
			implicitMention: result.implicitMention
		};
	} };
}
//#endregion
//#region extensions/qqbot/src/bridge/gateway.ts
/**
* Gateway entry point — thin bridge shell that constructs
* {@link EngineAdapters} and passes them to the engine's
* `startGateway`.
*
* All adapter dependencies are assembled here in one place.
*/
const _pluginVersion = resolveQQBotPluginVersion(import.meta.url);
initSender({
	pluginVersion: _pluginVersion,
	openclawVersion: resolveRuntimeServiceVersion()
});
/**
* Create the full set of engine adapters from the bridge layer.
*
* This is the **single assembly point** — all SDK → engine binding
* happens here. The engine receives a fully-populated
* {@link EngineAdapters} object with zero global singletons.
*/
function createEngineAdapters(_runtime) {
	return {
		history: createSdkHistoryAdapter(),
		mentionGate: createSdkMentionGateAdapter(),
		audioConvert: {
			convertSilkToWav,
			isVoiceAttachment,
			formatDuration
		},
		outboundAudio: {
			audioFileToSilkBase64: async (p, f) => await audioFileToSilkBase64(p, f) ?? void 0,
			isAudioFile: (p, m) => isAudioFile(p, m),
			shouldTranscodeVoice: (p) => shouldTranscodeVoice(p),
			waitForFile: (p, ms) => waitForFile(p, ms)
		},
		commands: {
			resolveVersion: resolveRuntimeServiceVersion,
			pluginVersion: _pluginVersion,
			approveRuntimeGetter: () => {
				return { config: getQQBotRuntime().config };
			}
		}
	};
}
/**
* Start the Gateway WebSocket connection.
*
* Assembles all adapters and passes them to the engine's core gateway.
*/
async function startGateway(ctx) {
	ensurePlatformAdapter();
	const runtime = getQQBotRuntimeForEngine();
	const accountLogger = createAccountLogger(ctx.log, ctx.account.accountId);
	registerAccount(ctx.account.appId, {
		logger: accountLogger,
		markdownSupport: ctx.account.markdownSupport
	});
	setBridgeLogger(accountLogger);
	if (ctx.channelRuntime) {
		accountLogger.info("Registering approval.native runtime context");
		const lease = ctx.channelRuntime.runtimeContexts.register({
			channelId: "qqbot",
			accountId: ctx.account.accountId,
			capability: "approval.native",
			context: { account: ctx.account },
			abortSignal: ctx.abortSignal
		});
		accountLogger.info(`approval.native context registered (lease=${!!lease})`);
	} else accountLogger.info("No channelRuntime — skipping approval.native registration");
	return startGateway$1({
		account: toGatewayAccount(ctx.account),
		abortSignal: ctx.abortSignal,
		cfg: ctx.cfg,
		onReady: ctx.onReady,
		onResumed: ctx.onResumed,
		onError: ctx.onError,
		log: accountLogger,
		runtime,
		adapters: createEngineAdapters(runtime)
	});
}
function createAccountLogger(raw, accountId) {
	const prefix = `[${accountId}]`;
	const withMeta = (msg, meta) => meta && Object.keys(meta).length > 0 ? `${msg} ${JSON.stringify(meta)}` : msg;
	if (!raw) return {
		info: (msg, meta) => debugLog(`${prefix} ${withMeta(msg, meta)}`),
		error: (msg, meta) => debugError(`${prefix} ${withMeta(msg, meta)}`),
		warn: (msg, meta) => debugError(`${prefix} ${withMeta(msg, meta)}`),
		debug: (msg, meta) => debugLog(`${prefix} ${withMeta(msg, meta)}`)
	};
	return {
		info: (msg, meta) => raw.info(`${prefix} ${withMeta(msg, meta)}`),
		error: (msg, meta) => raw.error(`${prefix} ${withMeta(msg, meta)}`),
		warn: (msg, meta) => raw.error(`${prefix} ${withMeta(msg, meta)}`),
		debug: (msg, meta) => raw.debug?.(`${prefix} ${withMeta(msg, meta)}`)
	};
}
//#endregion
export { startGateway };
