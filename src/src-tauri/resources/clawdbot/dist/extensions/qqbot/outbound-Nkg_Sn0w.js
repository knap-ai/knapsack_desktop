import { createRequire } from "node:module";
import * as os$1 from "node:os";
import os from "node:os";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { fetchWithSsrFGuard } from "openclaw/plugin-sdk/ssrf-runtime";
import { asOptionalObjectRecord, normalizeLowercaseStringOrEmpty, normalizeOptionalString, readStringField } from "openclaw/plugin-sdk/text-runtime";
import { execFile } from "node:child_process";
import * as fs$1 from "node:fs";
import * as path$2 from "node:path";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
import * as crypto$1 from "node:crypto";
import crypto from "node:crypto";
import * as path$1 from "path";
import { fetchRemoteMedia } from "openclaw/plugin-sdk/media-runtime";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __require = /* @__PURE__ */ createRequire(import.meta.url);
//#endregion
//#region extensions/qqbot/src/utils/debug-log.ts
/**
* Debug logging utility for QQBot plugin.
*
* Only outputs when QQBOT_DEBUG environment variable is set.
* Prevents leaking user message content in production logs.
*/
const isDebug = () => !!process.env.QQBOT_DEBUG;
function debugLog(...args) {
	if (isDebug()) console.log(...args);
}
function debugWarn(...args) {
	if (isDebug()) console.warn(...args);
}
function debugError(...args) {
	if (isDebug()) console.error(...args);
}
//#endregion
//#region extensions/qqbot/src/utils/platform.ts
/**
* Cross-platform compatibility helpers.
*
* This module centralizes home/temp directory discovery, local-path checks,
* ffmpeg/ffprobe lookup, native-module compatibility checks, and startup diagnostics.
*/
function getPlatform() {
	const p = process.platform;
	if (p === "darwin" || p === "linux" || p === "win32") return p;
	return "other";
}
function isWindows() {
	return process.platform === "win32";
}
/**
* Resolve the current user's home directory safely across platforms.
*
* Priority:
* 1. `os.homedir()`
* 2. `$HOME` or `%USERPROFILE%`
* 3. the OpenClaw temp directory as a last resort
*/
function getHomeDir() {
	try {
		const home = os$1.homedir();
		if (home && fs$1.existsSync(home)) return home;
	} catch {}
	const envHome = process.env.HOME || process.env.USERPROFILE;
	if (envHome && fs$1.existsSync(envHome)) return envHome;
	return resolvePreferredOpenClawTmpDir();
}
/**
* Return a path under `~/.openclaw/qqbot`, creating it on demand.
*/
function getQQBotDataDir(...subPaths) {
	const dir = path$2.join(getHomeDir(), ".openclaw", "qqbot", ...subPaths);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	return dir;
}
/**
* Return a path under `~/.openclaw/media/qqbot`, creating it on demand.
*
* Unlike `getQQBotDataDir`, this lives under OpenClaw's core media allowlist so
* downloaded images and audio can be accessed by framework media tooling.
*/
function getQQBotMediaDir(...subPaths) {
	const dir = path$2.join(getHomeDir(), ".openclaw", "media", "qqbot", ...subPaths);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	return dir;
}
/** Return the preferred OpenClaw temp directory. */
function getTempDir() {
	return resolvePreferredOpenClawTmpDir();
}
/**
* Expand `~` to the current user's home directory.
*
* Supports `~` and `~/...`. Other forms are returned unchanged.
*/
function expandTilde(p) {
	if (!p) return p;
	if (p === "~") return getHomeDir();
	if (p.startsWith("~/") || p.startsWith("~\\")) return path$2.join(getHomeDir(), p.slice(2));
	return p;
}
/**
* Normalize a user-provided path by trimming, stripping `file://`, and expanding `~`.
*/
function normalizePath(p) {
	let result = p.trim();
	if (result.startsWith("file://")) {
		result = result.slice(7);
		try {
			result = decodeURIComponent(result);
		} catch {}
	}
	return expandTilde(result);
}
function isPathWithinRoot$1(candidate, root) {
	const relative = path$2.relative(root, candidate);
	return relative === "" || !relative.startsWith("..") && !path$2.isAbsolute(relative);
}
/**
* Remap legacy or hallucinated QQ Bot local media paths to real files when possible.
*/
function resolveQQBotLocalMediaPath(p) {
	const normalized = normalizePath(p);
	if (!isLocalPath(normalized) || fs$1.existsSync(normalized)) return normalized;
	const homeDir = getHomeDir();
	const mediaRoot = getQQBotMediaDir();
	const dataRoot = getQQBotDataDir();
	const candidateRoots = [
		{
			from: path$2.join(homeDir, ".openclaw", "workspace", "qqbot"),
			to: mediaRoot
		},
		{
			from: dataRoot,
			to: mediaRoot
		},
		{
			from: mediaRoot,
			to: dataRoot
		}
	];
	for (const { from, to } of candidateRoots) {
		if (!isPathWithinRoot$1(normalized, from)) continue;
		const relative = path$2.relative(from, normalized);
		const candidate = path$2.join(to, relative);
		if (fs$1.existsSync(candidate)) {
			debugWarn(`[platform] Remapped missing QQBot media path ${normalized} -> ${candidate}`);
			return candidate;
		}
	}
	return normalized;
}
/**
* Resolve a structured-payload local file path and enforce that it stays within
* QQ Bot-owned storage roots.
*/
function resolveQQBotPayloadLocalFilePath(p) {
	const candidate = resolveQQBotLocalMediaPath(p);
	if (!candidate.trim()) return null;
	const resolvedCandidate = path$2.resolve(candidate);
	if (!fs$1.existsSync(resolvedCandidate)) return null;
	const canonicalCandidate = fs$1.realpathSync(resolvedCandidate);
	const allowedRoots = [getQQBotMediaDir()];
	for (const root of allowedRoots) {
		const resolvedRoot = path$2.resolve(root);
		if (isPathWithinRoot$1(canonicalCandidate, fs$1.existsSync(resolvedRoot) ? fs$1.realpathSync(resolvedRoot) : resolvedRoot)) return canonicalCandidate;
	}
	return null;
}
/**
* Normalize filenames into a UTF-8 form that the QQ Bot API accepts reliably.
*
* This decodes percent-escaped names, converts Unicode to NFC, and strips ASCII
* control characters.
*/
function sanitizeFileName(name) {
	if (!name) return name;
	let result = name.trim();
	if (result.includes("%")) try {
		result = decodeURIComponent(result);
	} catch {}
	result = result.normalize("NFC");
	result = result.replace(/\p{Cc}/gu, "");
	return result;
}
/**
* Return true when the string looks like a local filesystem path rather than a URL.
*/
function isLocalPath(p) {
	if (!p) return false;
	if (p.startsWith("file://")) return true;
	if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) return true;
	if (p.startsWith("/")) return true;
	if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
	if (p.startsWith("\\\\")) return true;
	if (p.startsWith("./") || p.startsWith("../")) return true;
	if (p.startsWith(".\\") || p.startsWith("..\\")) return true;
	return false;
}
let _ffmpegPath;
let _ffmpegCheckPromise = null;
/** Detect ffmpeg and return an executable path when available. */
function detectFfmpeg() {
	if (_ffmpegPath !== void 0) return Promise.resolve(_ffmpegPath);
	if (_ffmpegCheckPromise) return _ffmpegCheckPromise;
	_ffmpegCheckPromise = (async () => {
		const envPath = process.env.FFMPEG_PATH;
		if (envPath) {
			if (await testExecutable(envPath, ["-version"])) {
				_ffmpegPath = envPath;
				debugLog(`[platform] ffmpeg found via FFMPEG_PATH: ${envPath}`);
				return _ffmpegPath;
			}
			debugWarn(`[platform] FFMPEG_PATH set but not working: ${envPath}`);
		}
		const cmd = isWindows() ? "ffmpeg.exe" : "ffmpeg";
		if (await testExecutable(cmd, ["-version"])) {
			_ffmpegPath = cmd;
			debugLog(`[platform] ffmpeg detected in PATH`);
			return _ffmpegPath;
		}
		const commonPaths = isWindows() ? [
			"C:\\ffmpeg\\bin\\ffmpeg.exe",
			path$2.join(process.env.LOCALAPPDATA || "", "Programs", "ffmpeg", "bin", "ffmpeg.exe"),
			path$2.join(process.env.ProgramFiles || "", "ffmpeg", "bin", "ffmpeg.exe")
		] : [
			"/usr/local/bin/ffmpeg",
			"/opt/homebrew/bin/ffmpeg",
			"/usr/bin/ffmpeg",
			"/snap/bin/ffmpeg"
		];
		for (const p of commonPaths) if (p && fs$1.existsSync(p)) {
			if (await testExecutable(p, ["-version"])) {
				_ffmpegPath = p;
				debugLog(`[platform] ffmpeg found at: ${p}`);
				return _ffmpegPath;
			}
		}
		_ffmpegPath = null;
		return null;
	})().finally(() => {
		_ffmpegCheckPromise = null;
	});
	return _ffmpegCheckPromise;
}
/** Return true when an executable responds successfully to the given args. */
function testExecutable(cmd, args) {
	return new Promise((resolve) => {
		execFile(cmd, args, { timeout: 5e3 }, (err) => {
			resolve(!err);
		});
	});
}
let _silkWasmAvailable = null;
/** Check whether silk-wasm can run in the current environment. */
async function checkSilkWasmAvailable() {
	if (_silkWasmAvailable !== null) return _silkWasmAvailable;
	try {
		const { isSilk } = await import("silk-wasm");
		isSilk(new Uint8Array(0));
		_silkWasmAvailable = true;
		debugLog("[platform] silk-wasm: available");
	} catch (err) {
		_silkWasmAvailable = false;
		debugWarn(`[platform] silk-wasm: NOT available (${formatErrorMessage(err)})`);
	}
	return _silkWasmAvailable;
}
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
		const testFile = path$2.join(dataDir, ".write-test");
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
//#region extensions/qqbot/src/utils/upload-cache.ts
/**
* Cache `file_info` values returned by the QQ Bot API so identical uploads can be reused
* before the server-side TTL expires.
*/
const cache = /* @__PURE__ */ new Map();
const MAX_CACHE_SIZE = 500;
/** Compute an MD5 hash used as part of the cache key. */
function computeFileHash(data) {
	const content = typeof data === "string" ? data : data;
	return crypto$1.createHash("md5").update(content).digest("hex");
}
/** Build the in-memory cache key. */
function buildCacheKey(contentHash, scope, targetId, fileType) {
	return `${contentHash}:${scope}:${targetId}:${fileType}`;
}
/** Look up a cached `file_info` value. */
function getCachedFileInfo(contentHash, scope, targetId, fileType) {
	const key = buildCacheKey(contentHash, scope, targetId, fileType);
	const entry = cache.get(key);
	if (!entry) return null;
	if (Date.now() >= entry.expiresAt) {
		cache.delete(key);
		return null;
	}
	debugLog(`[upload-cache] Cache HIT: key=${key.slice(0, 40)}..., fileUuid=${entry.fileUuid}`);
	return entry.fileInfo;
}
/** Store an upload result in the cache. */
function setCachedFileInfo(contentHash, scope, targetId, fileType, fileInfo, fileUuid, ttl) {
	if (cache.size >= MAX_CACHE_SIZE) {
		const now = Date.now();
		for (const [k, v] of cache) if (now >= v.expiresAt) cache.delete(k);
		if (cache.size >= MAX_CACHE_SIZE) {
			const keys = Array.from(cache.keys());
			for (let i = 0; i < keys.length / 2; i++) cache.delete(keys[i]);
		}
	}
	const key = buildCacheKey(contentHash, scope, targetId, fileType);
	const effectiveTtl = Math.max(ttl - 60, 10);
	cache.set(key, {
		fileInfo,
		fileUuid,
		expiresAt: Date.now() + effectiveTtl * 1e3
	});
	debugLog(`[upload-cache] Cache SET: key=${key.slice(0, 40)}..., ttl=${effectiveTtl}s, uuid=${fileUuid}`);
}
//#endregion
//#region extensions/qqbot/src/api.ts
const API_BASE = "https://api.sgroup.qq.com";
const TOKEN_URL = "https://bots.qq.com/app/getAppAccessToken";
const _require = createRequire(import.meta.url);
const PACKAGE_JSON_CANDIDATES = [
	"../package.json",
	"./package.json",
	"../../package.json"
];
function readPluginVersion() {
	for (const candidate of PACKAGE_JSON_CANDIDATES) try {
		const version = _require(candidate).version;
		if (typeof version === "string" && version.trim().length > 0) return version;
	} catch {}
	return "unknown";
}
const PLUGIN_USER_AGENT = `QQBotPlugin/${readPluginVersion()} (Node/${process.versions.node}; ${os.platform()})`;
const markdownSupportMap = /* @__PURE__ */ new Map();
const onMessageSentHookMap = /* @__PURE__ */ new Map();
/** Register an outbound-message hook scoped to one appId. */
function onMessageSent(appId, callback) {
	onMessageSentHookMap.set(normalizeOptionalString(appId) ?? "", callback);
}
/** Initialize per-app API behavior such as markdown support. */
function initApiConfig(appId, options) {
	markdownSupportMap.set(normalizeOptionalString(appId) ?? "", options.markdownSupport === true);
}
/** Return whether markdown is enabled for the given appId. */
function isMarkdownSupport(appId) {
	return markdownSupportMap.get(normalizeOptionalString(appId) ?? "") ?? false;
}
const tokenCacheMap = /* @__PURE__ */ new Map();
const tokenFetchPromises = /* @__PURE__ */ new Map();
/**
* Resolve an access token with caching and singleflight semantics.
*/
async function getAccessToken(appId, clientSecret) {
	const normalizedAppId = normalizeOptionalString(appId) ?? "";
	const cachedToken = tokenCacheMap.get(normalizedAppId);
	const REFRESH_AHEAD_MS = cachedToken ? Math.min(300 * 1e3, (cachedToken.expiresAt - Date.now()) / 3) : 0;
	if (cachedToken && Date.now() < cachedToken.expiresAt - REFRESH_AHEAD_MS) return cachedToken.token;
	let fetchPromise = tokenFetchPromises.get(normalizedAppId);
	if (fetchPromise) {
		debugLog(`[qqbot-api:${normalizedAppId}] Token fetch in progress, waiting for existing request...`);
		return fetchPromise;
	}
	fetchPromise = (async () => {
		try {
			return await doFetchToken(normalizedAppId, clientSecret);
		} finally {
			tokenFetchPromises.delete(normalizedAppId);
		}
	})();
	tokenFetchPromises.set(normalizedAppId, fetchPromise);
	return fetchPromise;
}
/** Perform the token fetch request. */
async function doFetchToken(appId, clientSecret) {
	const requestBody = {
		appId,
		clientSecret
	};
	const requestHeaders = {
		"Content-Type": "application/json",
		"User-Agent": PLUGIN_USER_AGENT
	};
	debugLog(`[qqbot-api:${appId}] >>> POST ${TOKEN_URL}`);
	let response;
	let release = async () => {};
	try {
		const guarded = await fetchWithSsrFGuard({
			url: TOKEN_URL,
			init: {
				method: "POST",
				headers: requestHeaders,
				body: JSON.stringify(requestBody)
			},
			auditContext: "qqbot.token"
		});
		response = guarded.response;
		release = guarded.release;
	} catch (err) {
		debugError(`[qqbot-api:${appId}] <<< Network error:`, err);
		throw new Error(`Network error getting access_token: ${formatErrorMessage(err)}`, { cause: err });
	}
	try {
		const responseHeaders = {};
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value;
		});
		const tokenTraceId = response.headers.get("x-tps-trace-id") ?? "";
		debugLog(`[qqbot-api:${appId}] <<< Status: ${response.status} ${response.statusText}${tokenTraceId ? ` | TraceId: ${tokenTraceId}` : ""}`);
		let data;
		let rawBody;
		try {
			rawBody = await response.text();
			const logBody = rawBody.replace(/"access_token"\s*:\s*"[^"]+"/g, "\"access_token\": \"***\"");
			debugLog(`[qqbot-api:${appId}] <<< Body:`, logBody);
			data = JSON.parse(rawBody);
		} catch (err) {
			debugError(`[qqbot-api:${appId}] <<< Parse error:`, err);
			throw new Error(`Failed to parse access_token response: ${formatErrorMessage(err)}`, { cause: err });
		}
		if (!data.access_token) throw new Error(`Failed to get access_token: ${JSON.stringify(data)}`);
		const expiresAt = Date.now() + (data.expires_in ?? 7200) * 1e3;
		tokenCacheMap.set(appId, {
			token: data.access_token,
			expiresAt,
			appId
		});
		debugLog(`[qqbot-api:${appId}] Token cached, expires at: ${new Date(expiresAt).toISOString()}`);
		return data.access_token;
	} finally {
		await release();
	}
}
/** Clear one token cache or all token caches. */
function clearTokenCache(appId) {
	if (appId) {
		const normalizedAppId = normalizeOptionalString(appId) ?? "";
		tokenCacheMap.delete(normalizedAppId);
		debugLog(`[qqbot-api:${normalizedAppId}] Token cache cleared manually.`);
	} else {
		tokenCacheMap.clear();
		debugLog(`[qqbot-api] All token caches cleared.`);
	}
}
/** Generate a message sequence in the 0..65535 range. */
function getNextMsgSeq(_msgId) {
	return (Date.now() % 1e8 ^ Math.floor(Math.random() * 65536)) % 65536;
}
const DEFAULT_API_TIMEOUT = 3e4;
const FILE_UPLOAD_TIMEOUT = 12e4;
/** Shared API request wrapper. */
async function apiRequest(accessToken, method, path, body, timeoutMs) {
	const url = `${API_BASE}${path}`;
	const headers = {
		Authorization: `QQBot ${accessToken}`,
		"Content-Type": "application/json",
		"User-Agent": PLUGIN_USER_AGENT
	};
	const isFileUpload = path.includes("/files");
	const timeout = timeoutMs ?? (isFileUpload ? FILE_UPLOAD_TIMEOUT : DEFAULT_API_TIMEOUT);
	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		controller.abort();
	}, timeout);
	const options = {
		method,
		headers,
		signal: controller.signal
	};
	if (body) options.body = JSON.stringify(body);
	debugLog(`[qqbot-api] >>> ${method} ${url} (timeout: ${timeout}ms)`);
	if (body) {
		const logBody = { ...body };
		if (typeof logBody.file_data === "string") logBody.file_data = `<base64 ${logBody.file_data.length} chars>`;
		debugLog(`[qqbot-api] >>> Body:`, JSON.stringify(logBody));
	}
	let res;
	let release = async () => {};
	try {
		const guarded = await fetchWithSsrFGuard({
			url,
			init: options,
			auditContext: `qqbot.api${path}`
		});
		res = guarded.response;
		release = guarded.release;
	} catch (err) {
		clearTimeout(timeoutId);
		if (err instanceof Error && err.name === "AbortError") {
			debugError(`[qqbot-api] <<< Request timeout after ${timeout}ms`);
			throw new Error(`Request timeout[${path}]: exceeded ${timeout}ms`, { cause: err });
		}
		debugError(`[qqbot-api] <<< Network error:`, err);
		throw new Error(`Network error [${path}]: ${formatErrorMessage(err)}`, { cause: err });
	} finally {
		clearTimeout(timeoutId);
	}
	const responseHeaders = {};
	res.headers.forEach((value, key) => {
		responseHeaders[key] = value;
	});
	const traceId = res.headers.get("x-tps-trace-id") ?? "";
	debugLog(`[qqbot-api] <<< Status: ${res.status} ${res.statusText}${traceId ? ` | TraceId: ${traceId}` : ""}`);
	try {
		let data;
		const rawBody = await res.text();
		debugLog(`[qqbot-api] <<< Body:`, rawBody);
		data = JSON.parse(rawBody);
		if (!res.ok) throw new Error(`API Error [${path}]: ${data.message ?? JSON.stringify(data)}`);
		return data;
	} catch (err) {
		throw new Error(`Failed to parse response[${path}]: ${formatErrorMessage(err)}`, { cause: err });
	} finally {
		await release();
	}
}
const UPLOAD_MAX_RETRIES = 2;
const UPLOAD_BASE_DELAY_MS = 1e3;
async function apiRequestWithRetry(accessToken, method, path, body, maxRetries = UPLOAD_MAX_RETRIES) {
	let lastError = null;
	for (let attempt = 0; attempt <= maxRetries; attempt++) try {
		return await apiRequest(accessToken, method, path, body);
	} catch (err) {
		lastError = err instanceof Error ? err : new Error(String(err));
		const errMsg = lastError.message;
		if (errMsg.includes("400") || errMsg.includes("401") || errMsg.includes("Invalid") || errMsg.includes("upload timeout") || errMsg.includes("timeout") || errMsg.includes("Timeout")) throw lastError;
		if (attempt < maxRetries) {
			const delay = UPLOAD_BASE_DELAY_MS * Math.pow(2, attempt);
			debugLog(`[qqbot-api] Upload attempt ${attempt + 1} failed, retrying in ${delay}ms: ${errMsg.slice(0, 100)}`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	throw lastError;
}
async function getGatewayUrl(accessToken) {
	return (await apiRequest(accessToken, "GET", "/gateway")).url;
}
/**
* Send a message and invoke the refIdx hook when QQ returns one.
*/
async function sendAndNotify(appId, accessToken, method, path, body, meta) {
	const result = await apiRequest(accessToken, method, path, body);
	const hook = onMessageSentHookMap.get(normalizeOptionalString(appId) ?? "");
	if (result.ext_info?.ref_idx && hook) try {
		hook(result.ext_info.ref_idx, meta);
	} catch (err) {
		debugError(`[qqbot-api:${appId}] onMessageSent hook error: ${String(err)}`);
	}
	return result;
}
function buildMessageBody(appId, content, msgId, msgSeq, messageReference) {
	const md = isMarkdownSupport(appId);
	const body = md ? {
		markdown: { content },
		msg_type: 2,
		msg_seq: msgSeq
	} : {
		content,
		msg_type: 0,
		msg_seq: msgSeq
	};
	if (msgId) body.msg_id = msgId;
	if (messageReference && !md) body.message_reference = { message_id: messageReference };
	return body;
}
async function sendC2CMessage(appId, accessToken, openid, content, msgId, messageReference) {
	const body = buildMessageBody(appId, content, msgId, msgId ? getNextMsgSeq(msgId) : 1, messageReference);
	return sendAndNotify(appId, accessToken, "POST", `/v2/users/${openid}/messages`, body, { text: content });
}
async function sendC2CInputNotify(accessToken, openid, msgId, inputSecond = 60) {
	const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
	const body = {
		msg_type: 6,
		input_notify: {
			input_type: 1,
			input_second: inputSecond
		},
		msg_seq: msgSeq,
		...msgId ? { msg_id: msgId } : {}
	};
	return { refIdx: (await apiRequest(accessToken, "POST", `/v2/users/${openid}/messages`, body)).ext_info?.ref_idx };
}
async function sendChannelMessage(accessToken, channelId, content, msgId) {
	return apiRequest(accessToken, "POST", `/channels/${channelId}/messages`, {
		content,
		...msgId ? { msg_id: msgId } : {}
	});
}
/** Send a direct-message payload inside a guild DM session. */
async function sendDmMessage(accessToken, guildId, content, msgId) {
	return apiRequest(accessToken, "POST", `/dms/${guildId}/messages`, {
		content,
		...msgId ? { msg_id: msgId } : {}
	});
}
async function sendGroupMessage(appId, accessToken, groupOpenid, content, msgId) {
	const body = buildMessageBody(appId, content, msgId, msgId ? getNextMsgSeq(msgId) : 1);
	return sendAndNotify(appId, accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body, { text: content });
}
function buildProactiveMessageBody(appId, content) {
	if (!content || content.trim().length === 0) throw new Error("Proactive message content must not be empty (markdown.content is empty)");
	if (isMarkdownSupport(appId)) return {
		markdown: { content },
		msg_type: 2
	};
	else return {
		content,
		msg_type: 0
	};
}
async function sendProactiveC2CMessage(appId, accessToken, openid, content) {
	const body = buildProactiveMessageBody(appId, content);
	return sendAndNotify(appId, accessToken, "POST", `/v2/users/${openid}/messages`, body, { text: content });
}
async function sendProactiveGroupMessage(appId, accessToken, groupOpenid, content) {
	const body = buildProactiveMessageBody(appId, content);
	return sendAndNotify(appId, accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body, { text: content });
}
let MediaFileType = /* @__PURE__ */ function(MediaFileType) {
	MediaFileType[MediaFileType["IMAGE"] = 1] = "IMAGE";
	MediaFileType[MediaFileType["VIDEO"] = 2] = "VIDEO";
	MediaFileType[MediaFileType["VOICE"] = 3] = "VOICE";
	MediaFileType[MediaFileType["FILE"] = 4] = "FILE";
	return MediaFileType;
}({});
async function uploadC2CMedia(accessToken, openid, fileType, url, fileData, srvSendMsg = false, fileName) {
	if (!url && !fileData) throw new Error("uploadC2CMedia: url or fileData is required");
	if (fileData) {
		const cachedInfo = getCachedFileInfo(computeFileHash(fileData), "c2c", openid, fileType);
		if (cachedInfo) return {
			file_uuid: "",
			file_info: cachedInfo,
			ttl: 0
		};
	}
	const body = {
		file_type: fileType,
		srv_send_msg: srvSendMsg
	};
	if (url) body.url = url;
	else if (fileData) body.file_data = fileData;
	if (fileType === MediaFileType.FILE && fileName) body.file_name = sanitizeFileName(fileName);
	const result = await apiRequestWithRetry(accessToken, "POST", `/v2/users/${openid}/files`, body);
	if (fileData && result.file_info && result.ttl > 0) setCachedFileInfo(computeFileHash(fileData), "c2c", openid, fileType, result.file_info, result.file_uuid, result.ttl);
	return result;
}
async function uploadGroupMedia(accessToken, groupOpenid, fileType, url, fileData, srvSendMsg = false, fileName) {
	if (!url && !fileData) throw new Error("uploadGroupMedia: url or fileData is required");
	if (fileData) {
		const cachedInfo = getCachedFileInfo(computeFileHash(fileData), "group", groupOpenid, fileType);
		if (cachedInfo) return {
			file_uuid: "",
			file_info: cachedInfo,
			ttl: 0
		};
	}
	const body = {
		file_type: fileType,
		srv_send_msg: srvSendMsg
	};
	if (url) body.url = url;
	else if (fileData) body.file_data = fileData;
	if (fileType === MediaFileType.FILE && fileName) body.file_name = sanitizeFileName(fileName);
	const result = await apiRequestWithRetry(accessToken, "POST", `/v2/groups/${groupOpenid}/files`, body);
	if (fileData && result.file_info && result.ttl > 0) setCachedFileInfo(computeFileHash(fileData), "group", groupOpenid, fileType, result.file_info, result.file_uuid, result.ttl);
	return result;
}
async function sendC2CMediaMessage(appId, accessToken, openid, fileInfo, msgId, content, meta) {
	const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
	return sendAndNotify(appId, accessToken, "POST", `/v2/users/${openid}/messages`, {
		msg_type: 7,
		media: { file_info: fileInfo },
		msg_seq: msgSeq,
		...content ? { content } : {},
		...msgId ? { msg_id: msgId } : {}
	}, meta ?? { text: content });
}
async function sendGroupMediaMessage(accessToken, groupOpenid, fileInfo, msgId, content) {
	const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
	return apiRequest(accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, {
		msg_type: 7,
		media: { file_info: fileInfo },
		msg_seq: msgSeq,
		...content ? { content } : {},
		...msgId ? { msg_id: msgId } : {}
	});
}
async function sendC2CImageMessage(appId, accessToken, openid, imageUrl, msgId, content, localPath) {
	let uploadResult;
	const isBase64 = imageUrl.startsWith("data:");
	if (isBase64) {
		const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
		if (!matches) throw new Error("Invalid Base64 Data URL format");
		uploadResult = await uploadC2CMedia(accessToken, openid, MediaFileType.IMAGE, void 0, matches[2], false);
	} else uploadResult = await uploadC2CMedia(accessToken, openid, MediaFileType.IMAGE, imageUrl, void 0, false);
	const meta = {
		text: content,
		mediaType: "image",
		...!isBase64 ? { mediaUrl: imageUrl } : {},
		...localPath ? { mediaLocalPath: localPath } : {}
	};
	return sendC2CMediaMessage(appId, accessToken, openid, uploadResult.file_info, msgId, content, meta);
}
async function sendGroupImageMessage(appId, accessToken, groupOpenid, imageUrl, msgId, content) {
	let uploadResult;
	if (imageUrl.startsWith("data:")) {
		const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
		if (!matches) throw new Error("Invalid Base64 Data URL format");
		uploadResult = await uploadGroupMedia(accessToken, groupOpenid, MediaFileType.IMAGE, void 0, matches[2], false);
	} else uploadResult = await uploadGroupMedia(accessToken, groupOpenid, MediaFileType.IMAGE, imageUrl, void 0, false);
	return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId, content);
}
async function sendC2CVoiceMessage(appId, accessToken, openid, voiceBase64, voiceUrl, msgId, ttsText, filePath) {
	return sendC2CMediaMessage(appId, accessToken, openid, (await uploadC2CMedia(accessToken, openid, MediaFileType.VOICE, voiceUrl, voiceBase64, false)).file_info, msgId, void 0, {
		mediaType: "voice",
		...ttsText ? { ttsText } : {},
		...filePath ? { mediaLocalPath: filePath } : {}
	});
}
async function sendGroupVoiceMessage(appId, accessToken, groupOpenid, voiceBase64, voiceUrl, msgId) {
	return sendGroupMediaMessage(accessToken, groupOpenid, (await uploadGroupMedia(accessToken, groupOpenid, MediaFileType.VOICE, voiceUrl, voiceBase64, false)).file_info, msgId);
}
async function sendC2CFileMessage(appId, accessToken, openid, fileBase64, fileUrl, msgId, fileName, localFilePath) {
	return sendC2CMediaMessage(appId, accessToken, openid, (await uploadC2CMedia(accessToken, openid, MediaFileType.FILE, fileUrl, fileBase64, false, fileName)).file_info, msgId, void 0, {
		mediaType: "file",
		mediaUrl: fileUrl,
		mediaLocalPath: localFilePath ?? fileName
	});
}
async function sendGroupFileMessage(appId, accessToken, groupOpenid, fileBase64, fileUrl, msgId, fileName) {
	return sendGroupMediaMessage(accessToken, groupOpenid, (await uploadGroupMedia(accessToken, groupOpenid, MediaFileType.FILE, fileUrl, fileBase64, false, fileName)).file_info, msgId);
}
async function sendC2CVideoMessage(appId, accessToken, openid, videoUrl, videoBase64, msgId, content, localPath) {
	return sendC2CMediaMessage(appId, accessToken, openid, (await uploadC2CMedia(accessToken, openid, MediaFileType.VIDEO, videoUrl, videoBase64, false)).file_info, msgId, content, {
		text: content,
		mediaType: "video",
		...videoUrl ? { mediaUrl: videoUrl } : {},
		...localPath ? { mediaLocalPath: localPath } : {}
	});
}
async function sendGroupVideoMessage(appId, accessToken, groupOpenid, videoUrl, videoBase64, msgId, content) {
	return sendGroupMediaMessage(accessToken, groupOpenid, (await uploadGroupMedia(accessToken, groupOpenid, MediaFileType.VIDEO, videoUrl, videoBase64, false)).file_info, msgId, content);
}
const backgroundRefreshControllers = /* @__PURE__ */ new Map();
function startBackgroundTokenRefresh(appId, clientSecret, options) {
	if (backgroundRefreshControllers.has(appId)) {
		debugLog(`[qqbot-api:${appId}] Background token refresh already running`);
		return;
	}
	const { refreshAheadMs = 300 * 1e3, randomOffsetMs = 30 * 1e3, minRefreshIntervalMs = 60 * 1e3, retryDelayMs = 5 * 1e3, log } = options ?? {};
	const controller = new AbortController();
	backgroundRefreshControllers.set(appId, controller);
	const signal = controller.signal;
	const refreshLoop = async () => {
		log?.info?.(`[qqbot-api:${appId}] Background token refresh started`);
		while (!signal.aborted) try {
			await getAccessToken(appId, clientSecret);
			const cached = tokenCacheMap.get(appId);
			if (cached) {
				const expiresIn = cached.expiresAt - Date.now();
				const randomOffset = Math.random() * randomOffsetMs;
				const refreshIn = Math.max(expiresIn - refreshAheadMs - randomOffset, minRefreshIntervalMs);
				log?.debug?.(`[qqbot-api:${appId}] Token valid, next refresh in ${Math.round(refreshIn / 1e3)}s`);
				await sleep(refreshIn, signal);
			} else {
				log?.debug?.(`[qqbot-api:${appId}] No cached token, retrying soon`);
				await sleep(minRefreshIntervalMs, signal);
			}
		} catch (err) {
			if (signal.aborted) break;
			log?.error?.(`[qqbot-api:${appId}] Background token refresh failed: ${String(err)}`);
			await sleep(retryDelayMs, signal);
		}
		backgroundRefreshControllers.delete(appId);
		log?.info?.(`[qqbot-api:${appId}] Background token refresh stopped`);
	};
	refreshLoop().catch((err) => {
		backgroundRefreshControllers.delete(appId);
		log?.error?.(`[qqbot-api:${appId}] Background token refresh crashed: ${err}`);
	});
}
/**
* Stop background token refresh.
* @param appId Optional appId to stop a single account instead of all refresh loops.
*/
function stopBackgroundTokenRefresh(appId) {
	if (appId) {
		const controller = backgroundRefreshControllers.get(appId);
		if (controller) {
			controller.abort();
			backgroundRefreshControllers.delete(appId);
		}
	} else {
		for (const controller of backgroundRefreshControllers.values()) controller.abort();
		backgroundRefreshControllers.clear();
	}
}
async function sleep(ms, signal) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, ms);
		if (signal) {
			if (signal.aborted) {
				clearTimeout(timer);
				reject(/* @__PURE__ */ new Error("Aborted"));
				return;
			}
			const onAbort = () => {
				clearTimeout(timer);
				reject(/* @__PURE__ */ new Error("Aborted"));
			};
			signal.addEventListener("abort", onAbort, { once: true });
		}
	});
}
//#endregion
//#region extensions/qqbot/src/config-record-shared.ts
const asRecord = asOptionalObjectRecord;
const readString = readStringField;
//#endregion
//#region extensions/qqbot/src/utils/audio-convert.ts
let _silkWasmPromise = null;
function loadSilkWasm() {
	if (_silkWasmPromise) return _silkWasmPromise;
	_silkWasmPromise = import("silk-wasm").catch((err) => {
		debugWarn(`[audio-convert] silk-wasm not available; SILK encode/decode disabled (${formatErrorMessage(err)})`);
		return null;
	});
	return _silkWasmPromise;
}
/** Wrap PCM s16le bytes in a WAV container. */
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
/** Strip a leading AMR header from QQ voice payloads when present. */
function stripAmrHeader(buf) {
	const AMR_HEADER = Buffer.from("#!AMR\n");
	if (buf.length > 6 && buf.subarray(0, 6).equals(AMR_HEADER)) return buf.subarray(6);
	return buf;
}
/** Convert SILK or AMR voice files into WAV. */
async function convertSilkToWav(inputPath, outputDir) {
	if (!fs$1.existsSync(inputPath)) return null;
	const strippedBuf = stripAmrHeader(fs$1.readFileSync(inputPath));
	const rawData = new Uint8Array(strippedBuf.buffer, strippedBuf.byteOffset, strippedBuf.byteLength);
	const silk = await loadSilkWasm();
	if (!silk || !silk.isSilk(rawData)) return null;
	const sampleRate = 24e3;
	const result = await silk.decode(rawData, sampleRate);
	const wavBuffer = pcmToWav(result.data, sampleRate);
	const dir = outputDir || path$2.dirname(inputPath);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	const baseName = path$2.basename(inputPath, path$2.extname(inputPath));
	const wavPath = path$2.join(dir, `${baseName}.wav`);
	fs$1.writeFileSync(wavPath, wavBuffer);
	return {
		wavPath,
		duration: result.duration
	};
}
/** Return true when an attachment looks like a voice file. */
function isVoiceAttachment(att) {
	if (att.content_type === "voice" || att.content_type?.startsWith("audio/")) return true;
	const ext = att.filename ? normalizeLowercaseStringOrEmpty(path$2.extname(att.filename)) : "";
	return [
		".amr",
		".silk",
		".slk",
		".slac"
	].includes(ext);
}
/** Format a duration as a user-readable string. */
function formatDuration(durationMs) {
	const seconds = Math.round(durationMs / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainSeconds = seconds % 60;
	return remainSeconds > 0 ? `${minutes}m ${remainSeconds}s` : `${minutes}m`;
}
function isAudioFile(filePath, mimeType) {
	if (mimeType) {
		if (mimeType === "voice" || mimeType.startsWith("audio/")) return true;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$2.extname(filePath));
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
/** Voice MIME types the QQ platform accepts without transcoding. */
const QQ_NATIVE_VOICE_MIMES = new Set([
	"audio/silk",
	"audio/amr",
	"audio/wav",
	"audio/wave",
	"audio/x-wav",
	"audio/mpeg",
	"audio/mp3"
]);
/** Voice extensions the QQ platform accepts without transcoding. */
const QQ_NATIVE_VOICE_EXTS = new Set([
	".silk",
	".slk",
	".amr",
	".wav",
	".mp3"
]);
/**
* Return true when voice input must be transcoded before upload.
*/
function shouldTranscodeVoice(filePath, mimeType) {
	if (mimeType && QQ_NATIVE_VOICE_MIMES.has(normalizeLowercaseStringOrEmpty(mimeType))) return false;
	const ext = normalizeLowercaseStringOrEmpty(path$2.extname(filePath));
	if (QQ_NATIVE_VOICE_EXTS.has(ext)) return false;
	return isAudioFile(filePath, mimeType);
}
function readNumber(record, key) {
	const value = record?.[key];
	return typeof value === "number" ? value : void 0;
}
function readStringMap(value) {
	const record = asRecord(value);
	if (!record) return {};
	return Object.fromEntries(Object.entries(record).flatMap(([key, entryValue]) => typeof entryValue === "string" ? [[key, entryValue]] : []));
}
function resolveTTSFromBlock(block, providerCfg) {
	const baseUrl = readString(block, "baseUrl") ?? readString(providerCfg, "baseUrl");
	const apiKey = readString(block, "apiKey") ?? readString(providerCfg, "apiKey");
	const model = readString(block, "model") ?? "tts-1";
	const voice = readString(block, "voice") ?? "alloy";
	if (!baseUrl || !apiKey) return null;
	const authStyle = (readString(block, "authStyle") ?? readString(providerCfg, "authStyle")) === "api-key" ? "api-key" : "bearer";
	const queryParams = {
		...readStringMap(providerCfg?.queryParams),
		...readStringMap(block.queryParams)
	};
	const speed = readNumber(block, "speed");
	return {
		baseUrl: baseUrl.replace(/\/+$/, ""),
		apiKey,
		model,
		voice,
		authStyle,
		...Object.keys(queryParams).length > 0 ? { queryParams } : {},
		...speed !== void 0 ? { speed } : {}
	};
}
function resolveTTSConfig(cfg) {
	const providers = asRecord(asRecord(cfg.models)?.providers);
	const channelTts = asRecord(asRecord(asRecord(cfg.channels)?.qqbot)?.tts);
	if (channelTts && channelTts.enabled !== false) {
		const providerId = readString(channelTts, "provider") ?? "openai";
		const result = resolveTTSFromBlock(channelTts, asRecord(providers?.[providerId]));
		if (result) return result;
	}
	const msgTts = asRecord(asRecord(cfg.messages)?.tts);
	const autoMode = readString(msgTts, "auto");
	if (msgTts && autoMode !== "off" && autoMode !== "disabled") {
		const providerId = readString(msgTts, "provider") ?? "openai";
		const result = resolveTTSFromBlock(asRecord(msgTts[providerId]) ?? {}, asRecord(providers?.[providerId]));
		if (result) return result;
	}
	return null;
}
/**
* Check whether global TTS is potentially available by inspecting the
* framework-level `messages.tts` config.  This mirrors the resolution logic
* in the core `resolveTtsConfig`: when `auto` is set it must not be `"off"`;
* when only the legacy `enabled` boolean is present it must be truthy;
* when neither is set TTS defaults to off.
*
* This does NOT guarantee a specific provider is registered/configured – it
* only checks that TTS is not explicitly (or implicitly) disabled.
*/
function isGlobalTTSAvailable(cfg) {
	const msgTts = cfg.messages?.tts;
	if (!msgTts) return false;
	if (msgTts.auto) return msgTts.auto !== "off";
	return msgTts.enabled === true;
}
/** Build the TTS endpoint URL and auth headers. */
function buildTTSRequest(ttsCfg) {
	let url = `${ttsCfg.baseUrl}/audio/speech`;
	if (ttsCfg.queryParams && Object.keys(ttsCfg.queryParams).length > 0) {
		const qs = new URLSearchParams(ttsCfg.queryParams).toString();
		url += `?${qs}`;
	}
	const headers = { "Content-Type": "application/json" };
	if (ttsCfg.authStyle === "api-key") headers["api-key"] = ttsCfg.apiKey;
	else headers["Authorization"] = `Bearer ${ttsCfg.apiKey}`;
	return {
		url,
		headers
	};
}
async function textToSpeechPCM(text, ttsCfg) {
	const sampleRate = 24e3;
	const { url, headers } = buildTTSRequest(ttsCfg);
	debugLog(`[tts] Request: model=${ttsCfg.model}, voice=${ttsCfg.voice}, authStyle=${ttsCfg.authStyle ?? "bearer"}, url=${url}`);
	debugLog(`[tts] Input text (${text.length} chars): "${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"`);
	const formats = [{
		format: "pcm",
		needsDecode: false
	}, {
		format: "mp3",
		needsDecode: true
	}];
	let lastError = null;
	const startTime = Date.now();
	for (const { format, needsDecode } of formats) {
		const controller = new AbortController();
		const ttsTimeout = setTimeout(() => controller.abort(), 12e4);
		try {
			const body = {
				model: ttsCfg.model,
				input: text,
				voice: ttsCfg.voice,
				response_format: format,
				...format === "pcm" ? { sample_rate: sampleRate } : {},
				...ttsCfg.speed !== void 0 ? { speed: ttsCfg.speed } : {}
			};
			debugLog(`[tts] Trying format=${format}...`);
			const fetchStart = Date.now();
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
				signal: controller.signal
			}).finally(() => clearTimeout(ttsTimeout));
			const fetchMs = Date.now() - fetchStart;
			if (!resp.ok) {
				const detail = await resp.text().catch(() => "");
				debugLog(`[tts] HTTP ${resp.status} for format=${format} (${fetchMs}ms): ${detail.slice(0, 200)}`);
				if (format === "pcm" && (resp.status === 400 || resp.status === 422)) {
					debugLog(`[tts] PCM format not supported, falling back to mp3`);
					lastError = /* @__PURE__ */ new Error(`TTS PCM not supported: ${detail.slice(0, 200)}`);
					continue;
				}
				throw new Error(`TTS failed (HTTP ${resp.status}): ${detail.slice(0, 300)}`);
			}
			const arrayBuffer = await resp.arrayBuffer();
			const rawBuffer = Buffer.from(arrayBuffer);
			debugLog(`[tts] Response OK: format=${format}, size=${rawBuffer.length} bytes, latency=${fetchMs}ms`);
			if (!needsDecode) {
				debugLog(`[tts] Done: PCM direct, ${rawBuffer.length} bytes, total=${Date.now() - startTime}ms`);
				return {
					pcmBuffer: rawBuffer,
					sampleRate
				};
			}
			debugLog(`[tts] Decoding mp3 response (${rawBuffer.length} bytes) to PCM...`);
			const tmpDir = path$2.join(fs$1.mkdtempSync(path$2.join(__require("node:os").tmpdir(), "tts-")));
			const tmpMp3 = path$2.join(tmpDir, "tts.mp3");
			fs$1.writeFileSync(tmpMp3, rawBuffer);
			try {
				const ffmpegCmd = await checkFfmpeg();
				if (ffmpegCmd) {
					const pcmBuf = await ffmpegToPCM(ffmpegCmd, tmpMp3, sampleRate);
					debugLog(`[tts] Done: mp3→PCM (ffmpeg), ${pcmBuf.length} bytes, total=${Date.now() - startTime}ms`);
					return {
						pcmBuffer: pcmBuf,
						sampleRate
					};
				}
				const pcmBuf = await wasmDecodeMp3ToPCM(rawBuffer, sampleRate);
				if (pcmBuf) {
					debugLog(`[tts] Done: mp3→PCM (wasm), ${pcmBuf.length} bytes, total=${Date.now() - startTime}ms`);
					return {
						pcmBuffer: pcmBuf,
						sampleRate
					};
				}
				throw new Error("No decoder available for mp3 (install ffmpeg for best compatibility)");
			} finally {
				try {
					fs$1.unlinkSync(tmpMp3);
					fs$1.rmdirSync(tmpDir);
				} catch {}
			}
		} catch (err) {
			clearTimeout(ttsTimeout);
			lastError = err instanceof Error ? err : new Error(String(err));
			debugLog(`[tts] Error for format=${format}: ${lastError.message.slice(0, 200)}`);
			if (format === "pcm") continue;
			throw lastError;
		}
	}
	debugLog(`[tts] All formats exhausted after ${Date.now() - startTime}ms`);
	throw lastError ?? /* @__PURE__ */ new Error("TTS failed: all formats exhausted");
}
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
async function textToSilk(text, ttsCfg, outputDir) {
	const { pcmBuffer, sampleRate } = await textToSpeechPCM(text, ttsCfg);
	const { silkBuffer, duration } = await pcmToSilk(pcmBuffer, sampleRate);
	if (!fs$1.existsSync(outputDir)) fs$1.mkdirSync(outputDir, { recursive: true });
	const silkPath = path$2.join(outputDir, `tts-${Date.now()}.silk`);
	fs$1.writeFileSync(silkPath, silkBuffer);
	return {
		silkPath,
		silkBase64: silkBuffer.toString("base64"),
		duration
	};
}
/** Upload formats accepted directly by the QQ Bot API. */
const QQ_NATIVE_UPLOAD_FORMATS = [
	".wav",
	".mp3",
	".silk"
];
/**
* Convert a local audio file into an uploadable Base64 payload.
*/
async function audioFileToSilkBase64(filePath, directUploadFormats) {
	if (!fs$1.existsSync(filePath)) return null;
	const buf = fs$1.readFileSync(filePath);
	if (buf.length === 0) {
		debugError(`[audio-convert] file is empty: ${filePath}`);
		return null;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$2.extname(filePath));
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
	const ffmpegCmd = await checkFfmpeg();
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
* Wait until a file exists and its size has stabilized.
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
				debugLog(`[audio-convert] waitForFile: file appeared (${stat.size} bytes, after ${Date.now() - start}ms): ${path$2.basename(filePath)}`);
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
				debugError(`[audio-convert] waitForFile: file still empty after ${emptyGiveUpMs}ms, giving up: ${path$2.basename(filePath)}`);
				return 0;
			}
		} catch {
			if (!fileExists && Date.now() - start > noFileGiveUpMs) {
				debugError(`[audio-convert] waitForFile: file never appeared after ${noFileGiveUpMs}ms, giving up: ${path$2.basename(filePath)}`);
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
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file exists but empty (0 bytes): ${path$2.basename(filePath)}`);
	} catch {
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file never appeared: ${path$2.basename(filePath)}`);
	}
	return 0;
}
/** Delegate ffmpeg detection to the platform helper. */
async function checkFfmpeg() {
	return detectFfmpeg();
}
/** Convert arbitrary audio into mono 24 kHz PCM s16le with ffmpeg. */
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
/** Decode MP3 into PCM through mpg123-decoder when ffmpeg is unavailable. */
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
/** Normalize file extensions to lowercased dotted form. */
function normalizeFormats(formats) {
	return formats.map((f) => {
		const lower = normalizeLowercaseStringOrEmpty(f);
		return lower.startsWith(".") ? lower : `.${lower}`;
	});
}
/** Parse standard PCM WAV as a no-ffmpeg fallback. */
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
//#region extensions/qqbot/src/utils/file-utils.ts
/** Maximum file size accepted by the QQ Bot API. */
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const QQBOT_MEDIA_SSRF_POLICY = {
	hostnameAllowlist: [
		"*.qpic.cn",
		"*.qq.com",
		"*.weiyun.com",
		"*.qq.com.cn",
		"*.ugcimg.cn",
		"*.myqcloud.com",
		"*.tencentcos.cn",
		"*.tencentcos.com"
	],
	allowRfc2544BenchmarkRange: true
};
/** Validate that a file is within the allowed upload size. */
function checkFileSize(filePath, maxSize = MAX_UPLOAD_SIZE) {
	try {
		const stat = fs$1.statSync(filePath);
		if (stat.size > maxSize) {
			const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
			const limitMB = (maxSize / (1024 * 1024)).toFixed(0);
			return {
				ok: false,
				size: stat.size,
				error: `File is too large (${sizeMB}MB); QQ Bot API limit is ${limitMB}MB`
			};
		}
		return {
			ok: true,
			size: stat.size
		};
	} catch (err) {
		return {
			ok: false,
			size: 0,
			error: `Failed to read file metadata: ${formatErrorMessage(err)}`
		};
	}
}
/** Read file contents asynchronously. */
async function readFileAsync(filePath) {
	return fs$1.promises.readFile(filePath);
}
/** Check file readability asynchronously. */
async function fileExistsAsync(filePath) {
	try {
		await fs$1.promises.access(filePath, fs$1.constants.R_OK);
		return true;
	} catch {
		return false;
	}
}
/** Format a byte count into a human-readable size string. */
function formatFileSize(bytes) {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
/** Download a remote file into a local directory. */
async function downloadFile(url, destDir, originalFilename) {
	try {
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			return null;
		}
		if (parsedUrl.protocol !== "https:") return null;
		if (!fs$1.existsSync(destDir)) fs$1.mkdirSync(destDir, { recursive: true });
		const fetched = await fetchRemoteMedia({
			url: parsedUrl.toString(),
			filePathHint: originalFilename,
			ssrfPolicy: QQBOT_MEDIA_SSRF_POLICY
		});
		let filename = normalizeOptionalString(originalFilename) ?? "";
		if (!filename) filename = (normalizeOptionalString(fetched.fileName) ?? path$2.basename(parsedUrl.pathname)) || "download";
		const ts = Date.now();
		const ext = path$2.extname(filename);
		const safeFilename = `${path$2.basename(filename, ext) || "file"}_${ts}_${crypto.randomBytes(3).toString("hex")}${ext}`;
		const destPath = path$2.join(destDir, safeFilename);
		await fs$1.promises.writeFile(destPath, fetched.buffer);
		return destPath;
	} catch {
		return null;
	}
}
//#endregion
//#region extensions/qqbot/src/utils/media-tags.ts
const VALID_TAGS = [
	"qqimg",
	"qqvoice",
	"qqvideo",
	"qqfile",
	"qqmedia"
];
const TAG_ALIASES = {
	qq_img: "qqimg",
	qqimage: "qqimg",
	qq_image: "qqimg",
	qqpic: "qqimg",
	qq_pic: "qqimg",
	qqpicture: "qqimg",
	qq_picture: "qqimg",
	qqphoto: "qqimg",
	qq_photo: "qqimg",
	img: "qqimg",
	image: "qqimg",
	pic: "qqimg",
	picture: "qqimg",
	photo: "qqimg",
	qq_voice: "qqvoice",
	qqaudio: "qqvoice",
	qq_audio: "qqvoice",
	voice: "qqvoice",
	audio: "qqvoice",
	qq_video: "qqvideo",
	video: "qqvideo",
	qq_file: "qqfile",
	qqdoc: "qqfile",
	qq_doc: "qqfile",
	file: "qqfile",
	doc: "qqfile",
	document: "qqfile",
	qq_media: "qqmedia",
	media: "qqmedia",
	attachment: "qqmedia",
	attach: "qqmedia",
	qqattachment: "qqmedia",
	qq_attachment: "qqmedia",
	qqsend: "qqmedia",
	qq_send: "qqmedia",
	send: "qqmedia"
};
const ALL_TAG_NAMES = [...VALID_TAGS, ...Object.keys(TAG_ALIASES)];
ALL_TAG_NAMES.sort((a, b) => b.length - a.length);
const TAG_NAME_PATTERN = ALL_TAG_NAMES.join("|");
const LEFT_BRACKET = "(?:[<＜<]|&lt;)";
/** Match self-closing media-tag syntax with file/src/path/url attributes. */
const SELF_CLOSING_TAG_REGEX = new RegExp("`?" + LEFT_BRACKET + "\\s*(" + TAG_NAME_PATTERN + ")(?:\\s+(?!file|src|path|url)[a-z_-]+\\s*=\\s*[\"']?[^\"'\\s＜<>＞>]*?[\"']?)*\\s+(?:file|src|path|url)\\s*=\\s*[\"']?([^\"'\\s>＞]+?)[\"']?(?:\\s+[a-z_-]+\\s*=\\s*[\"']?[^\"'\\s＜<>＞>]*?[\"']?)*\\s*/?\\s*(?:[>＞>]|&gt;)`?", "gi");
/** Match malformed wrapped media tags that should be normalized. */
const FUZZY_MEDIA_TAG_REGEX = new RegExp("`?" + LEFT_BRACKET + "\\s*(" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;)[\"']?\\s*([^<＜<＞>\"'`]+?)\\s*[\"']?(?:[<＜<]|&lt;)\\s*/?\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;)`?", "gi");
/** Normalize a raw tag name into the canonical tag set. */
function resolveTagName(raw) {
	const lower = normalizeLowercaseStringOrEmpty(raw);
	if (VALID_TAGS.includes(lower)) return lower;
	return TAG_ALIASES[lower] ?? "qqimg";
}
/** Match wrapped tags whose bodies need newline and tab cleanup. */
const MULTILINE_TAG_CLEANUP = new RegExp("(" + LEFT_BRACKET + "\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;))([\\s\\S]*?)((?:[<＜<]|&lt;)\\s*/?\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;))", "gi");
/** Normalize malformed media-tag output into canonical wrapped tags. */
function normalizeMediaTags(text) {
	let cleaned = text.replace(SELF_CLOSING_TAG_REGEX, (_match, rawTag, content) => {
		const tag = resolveTagName(rawTag);
		const trimmed = content.trim();
		if (!trimmed) return _match;
		return `<${tag}>${expandTilde(trimmed)}</${tag}>`;
	});
	cleaned = cleaned.replace(MULTILINE_TAG_CLEANUP, (_m, open, body, close) => {
		return open + body.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ") + close;
	});
	return cleaned.replace(FUZZY_MEDIA_TAG_REGEX, (_match, rawTag, content) => {
		const tag = resolveTagName(rawTag);
		const trimmed = content.trim();
		if (!trimmed) return _match;
		return `<${tag}>${expandTilde(trimmed)}</${tag}>`;
	});
}
//#endregion
//#region extensions/qqbot/src/utils/payload.ts
const PAYLOAD_PREFIX = "QQBOT_PAYLOAD:";
const CRON_PREFIX = "QQBOT_CRON:";
/** Parse model output that may start with the QQ Bot structured payload prefix. */
function parseQQBotPayload(text) {
	const trimmedText = text.trim();
	if (!trimmedText.startsWith(PAYLOAD_PREFIX)) return {
		isPayload: false,
		text
	};
	const jsonContent = trimmedText.slice(14).trim();
	if (!jsonContent) return {
		isPayload: true,
		error: "Payload body is empty"
	};
	try {
		const payload = JSON.parse(jsonContent);
		if (!payload.type) return {
			isPayload: true,
			error: "Payload is missing the type field"
		};
		if (payload.type === "cron_reminder") {
			if (!payload.content || !payload.targetType || !payload.targetAddress) return {
				isPayload: true,
				error: "cron_reminder payload is missing required fields (content, targetType, targetAddress)"
			};
		} else if (payload.type === "media") {
			if (!payload.mediaType || !payload.source || !payload.path) return {
				isPayload: true,
				error: "media payload is missing required fields (mediaType, source, path)"
			};
		}
		return {
			isPayload: true,
			payload
		};
	} catch (e) {
		return {
			isPayload: true,
			error: `Failed to parse JSON: ${formatErrorMessage(e)}`
		};
	}
}
/** Encode a cron reminder payload into the stored cron-message format. */
function encodePayloadForCron(payload) {
	const jsonString = JSON.stringify(payload);
	return `${CRON_PREFIX}${Buffer.from(jsonString, "utf-8").toString("base64")}`;
}
/** Decode a stored cron payload. */
function decodeCronPayload(message) {
	const trimmedMessage = message.trim();
	if (!trimmedMessage.startsWith(CRON_PREFIX)) return { isCronPayload: false };
	const base64Content = trimmedMessage.slice(11);
	if (!base64Content) return {
		isCronPayload: true,
		error: "Cron payload body is empty"
	};
	try {
		const jsonString = Buffer.from(base64Content, "base64").toString("utf-8");
		const payload = JSON.parse(jsonString);
		if (payload.type !== "cron_reminder") return {
			isCronPayload: true,
			error: `Expected type cron_reminder but got ${String(payload.type)}`
		};
		if (!payload.content || !payload.targetType || !payload.targetAddress) return {
			isCronPayload: true,
			error: "Cron payload is missing required fields"
		};
		return {
			isCronPayload: true,
			payload
		};
	} catch (e) {
		return {
			isCronPayload: true,
			error: `Failed to decode cron payload: ${formatErrorMessage(e)}`
		};
	}
}
/** Type guard for cron reminder payloads. */
function isCronReminderPayload(payload) {
	return payload.type === "cron_reminder";
}
/** Type guard for media payloads. */
function isMediaPayload(payload) {
	return payload.type === "media";
}
//#endregion
//#region extensions/qqbot/src/outbound.ts
var outbound_exports = /* @__PURE__ */ __exportAll({
	checkMessageReplyLimit: () => checkMessageReplyLimit,
	getMessageReplyConfig: () => getMessageReplyConfig,
	getMessageReplyStats: () => getMessageReplyStats,
	recordMessageReply: () => recordMessageReply,
	sendCronMessage: () => sendCronMessage,
	sendDocument: () => sendDocument,
	sendMedia: () => sendMedia,
	sendPhoto: () => sendPhoto,
	sendProactiveMessage: () => sendProactiveMessage,
	sendText: () => sendText,
	sendVideoMsg: () => sendVideoMsg,
	sendVoice: () => sendVoice
});
const MESSAGE_REPLY_LIMIT = 4;
const MESSAGE_REPLY_TTL = 3600 * 1e3;
const messageReplyTracker = /* @__PURE__ */ new Map();
function getRefIdx(result) {
	return result.ext_info?.ref_idx;
}
/** Check whether a message can still receive a passive reply. */
function checkMessageReplyLimit(messageId) {
	const now = Date.now();
	const record = messageReplyTracker.get(messageId);
	if (messageReplyTracker.size > 1e4) {
		for (const [id, rec] of messageReplyTracker) if (now - rec.firstReplyAt > MESSAGE_REPLY_TTL) messageReplyTracker.delete(id);
	}
	if (!record) return {
		allowed: true,
		remaining: MESSAGE_REPLY_LIMIT,
		shouldFallbackToProactive: false
	};
	if (now - record.firstReplyAt > MESSAGE_REPLY_TTL) return {
		allowed: false,
		remaining: 0,
		shouldFallbackToProactive: true,
		fallbackReason: "expired",
		message: "Message is older than 1 hour; sending as a proactive message instead"
	};
	const remaining = MESSAGE_REPLY_LIMIT - record.count;
	if (remaining <= 0) return {
		allowed: false,
		remaining: 0,
		shouldFallbackToProactive: true,
		fallbackReason: "limit_exceeded",
		message: `Passive reply limit reached (${MESSAGE_REPLY_LIMIT} per hour); sending proactively instead`
	};
	return {
		allowed: true,
		remaining,
		shouldFallbackToProactive: false
	};
}
/** Record one passive reply against a message. */
function recordMessageReply(messageId) {
	const now = Date.now();
	const record = messageReplyTracker.get(messageId);
	if (!record) messageReplyTracker.set(messageId, {
		count: 1,
		firstReplyAt: now
	});
	else if (now - record.firstReplyAt > MESSAGE_REPLY_TTL) messageReplyTracker.set(messageId, {
		count: 1,
		firstReplyAt: now
	});
	else record.count++;
	debugLog(`[qqbot] recordMessageReply: ${messageId}, count=${messageReplyTracker.get(messageId)?.count}`);
}
/** Return reply-tracker stats for diagnostics. */
function getMessageReplyStats() {
	let totalReplies = 0;
	for (const record of messageReplyTracker.values()) totalReplies += record.count;
	return {
		trackedMessages: messageReplyTracker.size,
		totalReplies
	};
}
/** Return the passive-reply configuration. */
function getMessageReplyConfig() {
	return {
		limit: MESSAGE_REPLY_LIMIT,
		ttlMs: MESSAGE_REPLY_TTL,
		ttlHours: MESSAGE_REPLY_TTL / (3600 * 1e3)
	};
}
/** Parse a qqbot target into a structured delivery target. */
function parseTarget(to) {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	debugLog(`[${timestamp}] [qqbot] parseTarget: input=${to}`);
	let id = to.replace(/^qqbot:/i, "");
	if (id.startsWith("c2c:")) {
		const userId = id.slice(4);
		if (!userId || userId.length === 0) {
			const error = `Invalid c2c target format: ${to} - missing user ID`;
			debugError(`[${timestamp}] [qqbot] parseTarget: ${error}`);
			throw new Error(error);
		}
		debugLog(`[${timestamp}] [qqbot] parseTarget: c2c target, user ID=${userId}`);
		return {
			type: "c2c",
			id: userId
		};
	}
	if (id.startsWith("group:")) {
		const groupId = id.slice(6);
		if (!groupId || groupId.length === 0) {
			const error = `Invalid group target format: ${to} - missing group ID`;
			debugError(`[${timestamp}] [qqbot] parseTarget: ${error}`);
			throw new Error(error);
		}
		debugLog(`[${timestamp}] [qqbot] parseTarget: group target, group ID=${groupId}`);
		return {
			type: "group",
			id: groupId
		};
	}
	if (id.startsWith("channel:")) {
		const channelId = id.slice(8);
		if (!channelId || channelId.length === 0) {
			const error = `Invalid channel target format: ${to} - missing channel ID`;
			debugError(`[${timestamp}] [qqbot] parseTarget: ${error}`);
			throw new Error(error);
		}
		debugLog(`[${timestamp}] [qqbot] parseTarget: channel target, channel ID=${channelId}`);
		return {
			type: "channel",
			id: channelId
		};
	}
	if (!id || id.length === 0) {
		const error = `Invalid target format: ${to} - empty ID after removing qqbot: prefix`;
		debugError(`[${timestamp}] [qqbot] parseTarget: ${error}`);
		throw new Error(error);
	}
	debugLog(`[${timestamp}] [qqbot] parseTarget: default c2c target, ID=${id}`);
	return {
		type: "c2c",
		id
	};
}
/** Build a media target from a normal outbound context. */
function buildMediaTarget(ctx, logPrefix) {
	const target = parseTarget(ctx.to);
	return {
		targetType: target.type,
		targetId: target.id,
		account: ctx.account,
		replyToId: ctx.replyToId ?? void 0,
		logPrefix
	};
}
/** Resolve an authenticated access token for the account. */
async function getToken(account) {
	if (!account.appId || !account.clientSecret) throw new Error("QQBot not configured (missing appId or clientSecret)");
	return getAccessToken(account.appId, account.clientSecret);
}
/** Return true when public URLs should be passed through directly. */
function shouldDirectUploadUrl(account) {
	return account.config?.urlDirectUpload !== false;
}
const qqBotMediaKindLabel = {
	image: "Image",
	voice: "Voice",
	video: "Video",
	file: "File",
	media: "Media"
};
function isHttpOrDataSource(pathValue) {
	return pathValue.startsWith("http://") || pathValue.startsWith("https://") || pathValue.startsWith("data:");
}
function isPathWithinRoot(candidate, root) {
	const relative = path$1.relative(root, candidate);
	return relative === "" || !relative.startsWith("..") && !path$1.isAbsolute(relative);
}
function resolveMissingPathWithinMediaRoot(normalizedPath) {
	const resolvedCandidate = path$1.resolve(normalizedPath);
	if (fs$1.existsSync(resolvedCandidate)) return null;
	const allowedRoot = path$1.resolve(getQQBotMediaDir());
	let canonicalAllowedRoot;
	try {
		canonicalAllowedRoot = fs$1.realpathSync(allowedRoot);
	} catch {
		return null;
	}
	const missingSegments = [];
	let cursor = resolvedCandidate;
	while (!fs$1.existsSync(cursor)) {
		const parent = path$1.dirname(cursor);
		if (parent === cursor) break;
		missingSegments.unshift(path$1.basename(cursor));
		cursor = parent;
	}
	if (!fs$1.existsSync(cursor)) return null;
	let canonicalCursor;
	try {
		canonicalCursor = fs$1.realpathSync(cursor);
	} catch {
		return null;
	}
	const canonicalCandidate = missingSegments.length > 0 ? path$1.join(canonicalCursor, ...missingSegments) : canonicalCursor;
	return isPathWithinRoot(canonicalCandidate, canonicalAllowedRoot) ? canonicalCandidate : null;
}
function resolveExistingPathWithinRoots(normalizedPath, allowedRoots) {
	const resolvedCandidate = path$1.resolve(normalizedPath);
	if (!fs$1.existsSync(resolvedCandidate)) return null;
	let canonicalCandidate;
	try {
		canonicalCandidate = fs$1.realpathSync(resolvedCandidate);
	} catch {
		return null;
	}
	for (const root of allowedRoots) {
		const resolvedRoot = path$1.resolve(root);
		const canonicalRoot = fs$1.existsSync(resolvedRoot) ? fs$1.realpathSync(resolvedRoot) : resolvedRoot;
		if (isPathWithinRoot(canonicalCandidate, canonicalRoot)) return canonicalCandidate;
	}
	return null;
}
function resolveOutboundMediaPath(rawPath, prefix, mediaKind, options = {}) {
	const normalizedPath = normalizePath(rawPath);
	if (isHttpOrDataSource(normalizedPath)) return {
		ok: true,
		mediaPath: normalizedPath
	};
	const allowedPath = resolveQQBotPayloadLocalFilePath(normalizedPath);
	if (allowedPath) return {
		ok: true,
		mediaPath: allowedPath
	};
	if (options.extraLocalRoots && options.extraLocalRoots.length > 0) {
		const extraAllowedPath = resolveExistingPathWithinRoots(normalizedPath, options.extraLocalRoots);
		if (extraAllowedPath) return {
			ok: true,
			mediaPath: extraAllowedPath
		};
	}
	if (options.allowMissingLocalPath) {
		const allowedMissingPath = resolveMissingPathWithinMediaRoot(normalizedPath);
		if (allowedMissingPath) return {
			ok: true,
			mediaPath: allowedMissingPath
		};
	}
	debugWarn(`${prefix} blocked local ${mediaKind} path outside QQ Bot media storage`);
	return {
		ok: false,
		error: `${qqBotMediaKindLabel[mediaKind]} path must be inside QQ Bot media storage`
	};
}
/**
* Send a photo from a local file, public URL, or Base64 data URL.
*/
async function sendPhoto(ctx, imagePath) {
	const prefix = ctx.logPrefix ?? "[qqbot]";
	const resolvedMediaPath = resolveOutboundMediaPath(imagePath, prefix, "image");
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isLocal = isLocalPath(mediaPath);
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	const isData = mediaPath.startsWith("data:");
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`${prefix} sendPhoto: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendPhoto");
		if (localFile) return await sendPhoto(ctx, localFile);
		return {
			channel: "qqbot",
			error: `Failed to download image: ${mediaPath.slice(0, 80)}`
		};
	}
	let imageUrl = mediaPath;
	if (isLocal) {
		if (!await fileExistsAsync(mediaPath)) return {
			channel: "qqbot",
			error: "Image not found"
		};
		const sizeCheck = checkFileSize(mediaPath);
		if (!sizeCheck.ok) return {
			channel: "qqbot",
			error: sizeCheck.error
		};
		const fileBuffer = await readFileAsync(mediaPath);
		const ext = normalizeLowercaseStringOrEmpty(path$1.extname(mediaPath));
		const mimeType = {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".webp": "image/webp",
			".bmp": "image/bmp"
		}[ext];
		if (!mimeType) return {
			channel: "qqbot",
			error: `Unsupported image format: ${ext}`
		};
		imageUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
		debugLog(`${prefix} sendPhoto: local → Base64 (${formatFileSize(fileBuffer.length)})`);
	} else if (!isHttp && !isData) return {
		channel: "qqbot",
		error: `Unsupported image source: ${mediaPath.slice(0, 50)}`
	};
	try {
		const token = await getToken(ctx.account);
		const localPath = isLocal ? mediaPath : void 0;
		if (ctx.targetType === "c2c") {
			const r = await sendC2CImageMessage(ctx.account.appId, token, ctx.targetId, imageUrl, ctx.replyToId, void 0, localPath);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupImageMessage(ctx.account.appId, token, ctx.targetId, imageUrl, ctx.replyToId);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			if (isHttp) {
				const r = await sendChannelMessage(token, ctx.targetId, `![](${mediaPath})`, ctx.replyToId);
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			}
			debugLog(`${prefix} sendPhoto: channel does not support local/Base64 images`);
			return {
				channel: "qqbot",
				error: "Channel does not support local/Base64 images"
			};
		}
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp && !isData) {
			debugWarn(`${prefix} sendPhoto: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const retryResult = await downloadAndRetrySendPhoto(ctx, mediaPath, prefix);
			if (retryResult) return retryResult;
		}
		debugError(`${prefix} sendPhoto failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Download a remote image locally and retry `sendPhoto` through the local-file path. */
async function downloadAndRetrySendPhoto(ctx, httpUrl, prefix) {
	try {
		const localFile = await downloadFile(httpUrl, getQQBotMediaDir("downloads", "url-fallback"));
		if (!localFile) {
			debugError(`${prefix} sendPhoto fallback: download also failed for ${httpUrl.slice(0, 80)}`);
			return null;
		}
		debugLog(`${prefix} sendPhoto fallback: downloaded → ${localFile}, retrying as Base64`);
		return await sendPhoto(ctx, localFile);
	} catch (err) {
		debugError(`${prefix} sendPhoto fallback error:`, err);
		return null;
	}
}
/**
* Send voice from either a local file or a public URL.
*
* URL handling respects `urlDirectUpload`, and local files are transcoded when needed.
*/
async function sendVoice(ctx, voicePath, directUploadFormats, transcodeEnabled = true) {
	const prefix = ctx.logPrefix ?? "[qqbot]";
	const resolvedMediaPath = resolveOutboundMediaPath(voicePath, prefix, "voice", { allowMissingLocalPath: true });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
		if (shouldDirectUploadUrl(ctx.account)) try {
			const token = await getToken(ctx.account);
			if (ctx.targetType === "c2c") {
				const r = await sendC2CVoiceMessage(ctx.account.appId, token, ctx.targetId, void 0, mediaPath, ctx.replyToId);
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			} else if (ctx.targetType === "group") {
				const r = await sendGroupVoiceMessage(ctx.account.appId, token, ctx.targetId, void 0, mediaPath, ctx.replyToId);
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			} else {
				debugLog(`${prefix} sendVoice: voice not supported in channel`);
				return {
					channel: "qqbot",
					error: "Voice not supported in channel"
				};
			}
		} catch (err) {
			debugWarn(`${prefix} sendVoice: URL direct upload failed (${formatErrorMessage(err)}), downloading locally and retrying...`);
		}
		else debugLog(`${prefix} sendVoice: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendVoice");
		if (localFile) return await sendVoiceFromLocal(ctx, localFile, directUploadFormats, transcodeEnabled, prefix);
		return {
			channel: "qqbot",
			error: `Failed to download audio: ${mediaPath.slice(0, 80)}`
		};
	}
	return await sendVoiceFromLocal(ctx, mediaPath, directUploadFormats, transcodeEnabled, prefix);
}
/** Send voice from a local file. */
async function sendVoiceFromLocal(ctx, mediaPath, directUploadFormats, transcodeEnabled, prefix) {
	const fileSize = await waitForFile(mediaPath);
	if (fileSize === 0) return {
		channel: "qqbot",
		error: "Voice generate failed"
	};
	const safeMediaPath = resolveQQBotPayloadLocalFilePath(mediaPath);
	if (!safeMediaPath) {
		debugWarn(`${prefix} sendVoice: blocked local voice path outside QQ Bot media storage`);
		return {
			channel: "qqbot",
			error: "Voice path must be inside QQ Bot media storage"
		};
	}
	if (shouldTranscodeVoice(safeMediaPath) && !transcodeEnabled) {
		const ext = normalizeLowercaseStringOrEmpty(path$1.extname(safeMediaPath));
		debugLog(`${prefix} sendVoice: transcode disabled, format ${ext} needs transcode, returning error for fallback`);
		return {
			channel: "qqbot",
			error: `Voice transcoding is disabled and format ${ext} cannot be uploaded directly`
		};
	}
	try {
		let uploadBase64 = await audioFileToSilkBase64(safeMediaPath, directUploadFormats);
		if (!uploadBase64) {
			const buf = await readFileAsync(safeMediaPath);
			uploadBase64 = buf.toString("base64");
			debugLog(`${prefix} sendVoice: SILK conversion failed, uploading raw (${formatFileSize(buf.length)})`);
		} else debugLog(`${prefix} sendVoice: SILK ready (${fileSize} bytes)`);
		const token = await getToken(ctx.account);
		if (ctx.targetType === "c2c") {
			const r = await sendC2CVoiceMessage(ctx.account.appId, token, ctx.targetId, uploadBase64, void 0, ctx.replyToId, void 0, safeMediaPath);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupVoiceMessage(ctx.account.appId, token, ctx.targetId, uploadBase64, void 0, ctx.replyToId);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			debugLog(`${prefix} sendVoice: voice not supported in channel`);
			return {
				channel: "qqbot",
				error: "Voice not supported in channel"
			};
		}
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`${prefix} sendVoice (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send video from either a public URL or a local file. */
async function sendVideoMsg(ctx, videoPath) {
	const prefix = ctx.logPrefix ?? "[qqbot]";
	const resolvedMediaPath = resolveOutboundMediaPath(videoPath, prefix, "video");
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`${prefix} sendVideoMsg: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendVideoMsg");
		if (localFile) return await sendVideoFromLocal(ctx, localFile, prefix);
		return {
			channel: "qqbot",
			error: `Failed to download video: ${mediaPath.slice(0, 80)}`
		};
	}
	try {
		const token = await getToken(ctx.account);
		if (isHttp) if (ctx.targetType === "c2c") {
			const r = await sendC2CVideoMessage(ctx.account.appId, token, ctx.targetId, mediaPath, void 0, ctx.replyToId);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupVideoMessage(ctx.account.appId, token, ctx.targetId, mediaPath, void 0, ctx.replyToId);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			debugLog(`${prefix} sendVideoMsg: video not supported in channel`);
			return {
				channel: "qqbot",
				error: "Video not supported in channel"
			};
		}
		return await sendVideoFromLocal(ctx, mediaPath, prefix);
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp) {
			debugWarn(`${prefix} sendVideoMsg: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendVideoMsg");
			if (localFile) return await sendVideoFromLocal(ctx, localFile, prefix);
		}
		debugError(`${prefix} sendVideoMsg failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send video from a local file. */
async function sendVideoFromLocal(ctx, mediaPath, prefix) {
	if (!await fileExistsAsync(mediaPath)) return {
		channel: "qqbot",
		error: "Video not found"
	};
	const sizeCheck = checkFileSize(mediaPath);
	if (!sizeCheck.ok) return {
		channel: "qqbot",
		error: sizeCheck.error
	};
	const fileBuffer = await readFileAsync(mediaPath);
	const videoBase64 = fileBuffer.toString("base64");
	debugLog(`${prefix} sendVideoMsg: local video (${formatFileSize(fileBuffer.length)})`);
	try {
		const token = await getToken(ctx.account);
		if (ctx.targetType === "c2c") {
			const r = await sendC2CVideoMessage(ctx.account.appId, token, ctx.targetId, void 0, videoBase64, ctx.replyToId, void 0, mediaPath);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupVideoMessage(ctx.account.appId, token, ctx.targetId, void 0, videoBase64, ctx.replyToId);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			debugLog(`${prefix} sendVideoMsg: video not supported in channel`);
			return {
				channel: "qqbot",
				error: "Video not supported in channel"
			};
		}
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`${prefix} sendVideoMsg (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send a file from a local path or public URL. */
async function sendDocument(ctx, filePath, options = {}) {
	const prefix = ctx.logPrefix ?? "[qqbot]";
	const resolvedMediaPath = resolveOutboundMediaPath(filePath, prefix, "file", { extraLocalRoots: options.allowQQBotDataDownloads ? [getQQBotDataDir("downloads")] : void 0 });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	const fileName = sanitizeFileName(path$1.basename(mediaPath));
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`${prefix} sendDocument: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendDocument");
		if (localFile) return await sendDocumentFromLocal(ctx, localFile, prefix);
		return {
			channel: "qqbot",
			error: `Failed to download file: ${mediaPath.slice(0, 80)}`
		};
	}
	try {
		const token = await getToken(ctx.account);
		if (isHttp) if (ctx.targetType === "c2c") {
			const r = await sendC2CFileMessage(ctx.account.appId, token, ctx.targetId, void 0, mediaPath, ctx.replyToId, fileName);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupFileMessage(ctx.account.appId, token, ctx.targetId, void 0, mediaPath, ctx.replyToId, fileName);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			debugLog(`${prefix} sendDocument: file not supported in channel`);
			return {
				channel: "qqbot",
				error: "File not supported in channel"
			};
		}
		return await sendDocumentFromLocal(ctx, mediaPath, prefix);
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp) {
			debugWarn(`${prefix} sendDocument: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const localFile = await downloadToFallbackDir(mediaPath, prefix, "sendDocument");
			if (localFile) return await sendDocumentFromLocal(ctx, localFile, prefix);
		}
		debugError(`${prefix} sendDocument failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send a file from local storage. */
async function sendDocumentFromLocal(ctx, mediaPath, prefix) {
	const fileName = sanitizeFileName(path$1.basename(mediaPath));
	if (!await fileExistsAsync(mediaPath)) return {
		channel: "qqbot",
		error: "File not found"
	};
	const sizeCheck = checkFileSize(mediaPath);
	if (!sizeCheck.ok) return {
		channel: "qqbot",
		error: sizeCheck.error
	};
	const fileBuffer = await readFileAsync(mediaPath);
	if (fileBuffer.length === 0) return {
		channel: "qqbot",
		error: `File is empty: ${mediaPath}`
	};
	const fileBase64 = fileBuffer.toString("base64");
	debugLog(`${prefix} sendDocument: local file (${formatFileSize(fileBuffer.length)})`);
	try {
		const token = await getToken(ctx.account);
		if (ctx.targetType === "c2c") {
			const r = await sendC2CFileMessage(ctx.account.appId, token, ctx.targetId, fileBase64, void 0, ctx.replyToId, fileName, mediaPath);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else if (ctx.targetType === "group") {
			const r = await sendGroupFileMessage(ctx.account.appId, token, ctx.targetId, fileBase64, void 0, ctx.replyToId, fileName);
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		} else {
			debugLog(`${prefix} sendDocument: file not supported in channel`);
			return {
				channel: "qqbot",
				error: "File not supported in channel"
			};
		}
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`${prefix} sendDocument (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Download a remote file into the fallback media directory. */
async function downloadToFallbackDir(httpUrl, prefix, caller) {
	try {
		const localFile = await downloadFile(httpUrl, getQQBotMediaDir("downloads", "url-fallback"));
		if (!localFile) {
			debugError(`${prefix} ${caller} fallback: download also failed for ${httpUrl.slice(0, 80)}`);
			return null;
		}
		debugLog(`${prefix} ${caller} fallback: downloaded → ${localFile}`);
		return localFile;
	} catch (err) {
		debugError(`${prefix} ${caller} fallback download error:`, err);
		return null;
	}
}
/**
* Send text, optionally falling back from passive reply mode to proactive mode.
*
* Also supports inline media tags such as `<qqimg>...</qqimg>`.
*/
async function sendText(ctx) {
	const { to, account } = ctx;
	let { text, replyToId } = ctx;
	let fallbackToProactive = false;
	debugLog("[qqbot] sendText ctx:", JSON.stringify({
		to,
		text: text?.slice(0, 50),
		replyToId,
		accountId: account.accountId
	}, null, 2));
	if (replyToId) {
		const limitCheck = checkMessageReplyLimit(replyToId);
		if (!limitCheck.allowed) if (limitCheck.shouldFallbackToProactive) {
			debugWarn(`[qqbot] sendText: passive reply unavailable, falling back to proactive send - ${limitCheck.message}`);
			fallbackToProactive = true;
			replyToId = null;
		} else {
			debugError(`[qqbot] sendText: passive reply was blocked without a fallback path - ${limitCheck.message}`);
			return {
				channel: "qqbot",
				error: limitCheck.message
			};
		}
		else debugLog(`[qqbot] sendText: remaining passive replies for ${replyToId}: ${limitCheck.remaining}/${MESSAGE_REPLY_LIMIT}`);
	}
	text = normalizeMediaTags(text);
	const mediaTagMatches = text.match(/<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi);
	if (mediaTagMatches && mediaTagMatches.length > 0) {
		debugLog(`[qqbot] sendText: Detected ${mediaTagMatches.length} media tag(s), processing...`);
		const sendQueue = [];
		let lastIndex = 0;
		const mediaTagRegexWithIndex = /<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi;
		let match;
		while ((match = mediaTagRegexWithIndex.exec(text)) !== null) {
			const textBefore = text.slice(lastIndex, match.index).replace(/\n{3,}/g, "\n\n").trim();
			if (textBefore) sendQueue.push({
				type: "text",
				content: textBefore
			});
			const tagName = normalizeLowercaseStringOrEmpty(match[1]);
			let mediaPath = normalizeOptionalString(match[2]) ?? "";
			if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
			mediaPath = normalizePath(mediaPath);
			mediaPath = mediaPath.replace(/\\\\/g, "\\");
			const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
			try {
				const hasOctal = /\\[0-7]{1,3}/.test(mediaPath);
				const hasNonASCII = /[\u0080-\u00FF]/.test(mediaPath);
				if (!isWinLocal && (hasOctal || hasNonASCII)) {
					debugLog(`[qqbot] sendText: Decoding path with mixed encoding: ${mediaPath}`);
					let decoded = mediaPath.replace(/\\([0-7]{1,3})/g, (_, octal) => {
						return String.fromCharCode(parseInt(octal, 8));
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
						debugLog(`[qqbot] sendText: Successfully decoded path: ${mediaPath}`);
					}
				}
			} catch (decodeErr) {
				debugError(`[qqbot] sendText: Path decode error: ${decodeErr instanceof Error ? decodeErr.message : JSON.stringify(decodeErr)}`);
			}
			if (mediaPath) if (tagName === "qqmedia") {
				sendQueue.push({
					type: "media",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found auto-detect media in <qqmedia>: ${mediaPath}`);
			} else if (tagName === "qqvoice") {
				sendQueue.push({
					type: "voice",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found voice path in <qqvoice>: ${mediaPath}`);
			} else if (tagName === "qqvideo") {
				sendQueue.push({
					type: "video",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found video URL in <qqvideo>: ${mediaPath}`);
			} else if (tagName === "qqfile") {
				sendQueue.push({
					type: "file",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found file path in <qqfile>: ${mediaPath}`);
			} else {
				sendQueue.push({
					type: "image",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found image path in <qqimg>: ${mediaPath}`);
			}
			lastIndex = match.index + match[0].length;
		}
		const textAfter = text.slice(lastIndex).replace(/\n{3,}/g, "\n\n").trim();
		if (textAfter) sendQueue.push({
			type: "text",
			content: textAfter
		});
		debugLog(`[qqbot] sendText: Send queue: ${sendQueue.map((item) => item.type).join(" -> ")}`);
		const mediaTarget = buildMediaTarget({
			to,
			account,
			replyToId
		}, "[qqbot:sendText]");
		let lastResult = { channel: "qqbot" };
		for (const item of sendQueue) try {
			if (item.type === "text") {
				if (replyToId) {
					const accessToken = await getToken(account);
					const target = parseTarget(to);
					if (target.type === "c2c") {
						const result = await sendC2CMessage(account.appId, accessToken, target.id, item.content, replyToId);
						recordMessageReply(replyToId);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: result.ext_info?.ref_idx
						};
					} else if (target.type === "group") {
						const result = await sendGroupMessage(account.appId, accessToken, target.id, item.content, replyToId);
						recordMessageReply(replyToId);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: result.ext_info?.ref_idx
						};
					} else {
						const result = await sendChannelMessage(accessToken, target.id, item.content, replyToId);
						recordMessageReply(replyToId);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: getRefIdx(result)
						};
					}
				} else {
					const accessToken = await getToken(account);
					const target = parseTarget(to);
					if (target.type === "c2c") {
						const result = await sendProactiveC2CMessage(account.appId, accessToken, target.id, item.content);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: getRefIdx(result)
						};
					} else if (target.type === "group") {
						const result = await sendProactiveGroupMessage(account.appId, accessToken, target.id, item.content);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: getRefIdx(result)
						};
					} else {
						const result = await sendChannelMessage(accessToken, target.id, item.content);
						lastResult = {
							channel: "qqbot",
							messageId: result.id,
							timestamp: result.timestamp,
							refIdx: getRefIdx(result)
						};
					}
				}
				debugLog(`[qqbot] sendText: Sent text part: ${item.content.slice(0, 30)}...`);
			} else if (item.type === "image") lastResult = await sendPhoto(mediaTarget, item.content);
			else if (item.type === "voice") lastResult = await sendVoice(mediaTarget, item.content, void 0, account.config?.audioFormatPolicy?.transcodeEnabled !== false);
			else if (item.type === "video") lastResult = await sendVideoMsg(mediaTarget, item.content);
			else if (item.type === "file") lastResult = await sendDocument(mediaTarget, item.content);
			else if (item.type === "media") lastResult = await sendMedia({
				to,
				text: "",
				mediaUrl: item.content,
				accountId: account.accountId,
				replyToId,
				account
			});
		} catch (err) {
			const errMsg = formatErrorMessage(err);
			debugError(`[qqbot] sendText: Failed to send ${item.type}: ${errMsg}`);
			lastResult = {
				channel: "qqbot",
				error: errMsg
			};
		}
		return lastResult;
	}
	if (!replyToId) {
		if (!text || text.trim().length === 0) {
			debugError("[qqbot] sendText error: proactive message content cannot be empty");
			return {
				channel: "qqbot",
				error: "Proactive messages require non-empty content (--message cannot be empty)"
			};
		}
		if (fallbackToProactive) debugLog(`[qqbot] sendText: [fallback] sending proactive message to ${to}, length=${text.length}`);
		else debugLog(`[qqbot] sendText: sending proactive message to ${to}, length=${text.length}`);
	}
	if (!account.appId || !account.clientSecret) return {
		channel: "qqbot",
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		const target = parseTarget(to);
		debugLog("[qqbot] sendText target:", JSON.stringify(target));
		if (!replyToId) {
			let outResult;
			if (target.type === "c2c") {
				const result = await sendProactiveC2CMessage(account.appId, accessToken, target.id, text);
				outResult = {
					channel: "qqbot",
					messageId: result.id,
					timestamp: result.timestamp,
					refIdx: getRefIdx(result)
				};
			} else if (target.type === "group") {
				const result = await sendProactiveGroupMessage(account.appId, accessToken, target.id, text);
				outResult = {
					channel: "qqbot",
					messageId: result.id,
					timestamp: result.timestamp,
					refIdx: getRefIdx(result)
				};
			} else {
				const result = await sendChannelMessage(accessToken, target.id, text);
				outResult = {
					channel: "qqbot",
					messageId: result.id,
					timestamp: result.timestamp,
					refIdx: getRefIdx(result)
				};
			}
			return outResult;
		}
		if (target.type === "c2c") {
			const result = await sendC2CMessage(account.appId, accessToken, target.id, text, replyToId);
			recordMessageReply(replyToId);
			return {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: result.ext_info?.ref_idx
			};
		} else if (target.type === "group") {
			const result = await sendGroupMessage(account.appId, accessToken, target.id, text, replyToId);
			recordMessageReply(replyToId);
			return {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: result.ext_info?.ref_idx
			};
		} else {
			const result = await sendChannelMessage(accessToken, target.id, text, replyToId);
			recordMessageReply(replyToId);
			return {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: getRefIdx(result)
			};
		}
	} catch (err) {
		return {
			channel: "qqbot",
			error: formatErrorMessage(err)
		};
	}
}
/** Send a proactive message without a replyToId. */
async function sendProactiveMessage(account, to, text) {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	if (!account.appId || !account.clientSecret) {
		const errorMsg = "QQBot not configured (missing appId or clientSecret)";
		debugError(`[${timestamp}] [qqbot] sendProactiveMessage: ${errorMsg}`);
		return {
			channel: "qqbot",
			error: errorMsg
		};
	}
	debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: starting, to=${to}, text length=${text.length}, accountId=${account.accountId}`);
	try {
		debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: getting access token for appId=${account.appId}`);
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: parsing target=${to}`);
		const target = parseTarget(to);
		debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: target parsed, type=${target.type}, id=${target.id}`);
		let outResult;
		if (target.type === "c2c") {
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: sending proactive C2C message to user=${target.id}`);
			const result = await sendProactiveC2CMessage(account.appId, accessToken, target.id, text);
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: proactive C2C message sent successfully, messageId=${result.id}`);
			outResult = {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: getRefIdx(result)
			};
		} else if (target.type === "group") {
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: sending proactive group message to group=${target.id}`);
			const result = await sendProactiveGroupMessage(account.appId, accessToken, target.id, text);
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: proactive group message sent successfully, messageId=${result.id}`);
			outResult = {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: getRefIdx(result)
			};
		} else {
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: sending channel message to channel=${target.id}`);
			const result = await sendChannelMessage(accessToken, target.id, text);
			debugLog(`[${timestamp}] [qqbot] sendProactiveMessage: channel message sent successfully, messageId=${result.id}`);
			outResult = {
				channel: "qqbot",
				messageId: result.id,
				timestamp: result.timestamp,
				refIdx: getRefIdx(result)
			};
		}
		return outResult;
	} catch (err) {
		const errorMessage = formatErrorMessage(err);
		debugError(`[${timestamp}] [qqbot] sendProactiveMessage: error: ${errorMessage}`);
		debugError(`[${timestamp}] [qqbot] sendProactiveMessage: error stack: ${err instanceof Error ? err.stack : "No stack trace"}`);
		return {
			channel: "qqbot",
			error: errorMessage
		};
	}
}
/** Send rich media, auto-routing by media type and source. */
async function sendMedia(ctx) {
	const { to, text, replyToId, account, mimeType } = ctx;
	if (!account.appId || !account.clientSecret) return {
		channel: "qqbot",
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	if (!ctx.mediaUrl) return {
		channel: "qqbot",
		error: "mediaUrl is required for sendMedia"
	};
	const resolvedMediaPath = resolveOutboundMediaPath(ctx.mediaUrl, "[qqbot:sendMedia]", "media", { allowMissingLocalPath: true });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaUrl = resolvedMediaPath.mediaPath;
	const target = buildMediaTarget({
		to,
		account,
		replyToId
	}, "[qqbot:sendMedia]");
	if (isAudioFile(mediaUrl, mimeType)) {
		const result = await sendVoice(target, mediaUrl, account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats, account.config?.audioFormatPolicy?.transcodeEnabled !== false);
		if (!result.error) {
			if (text?.trim()) await sendTextAfterMedia(target, text);
			return result;
		}
		const voiceError = result.error;
		debugWarn(`[qqbot] sendMedia: sendVoice failed (${voiceError}), falling back to sendDocument`);
		const fallback = await sendDocument(target, mediaUrl);
		if (!fallback.error) {
			if (text?.trim()) await sendTextAfterMedia(target, text);
			return fallback;
		}
		return {
			channel: "qqbot",
			error: `voice: ${voiceError} | fallback file: ${fallback.error}`
		};
	}
	if (isVideoFile(mediaUrl, mimeType)) {
		const result = await sendVideoMsg(target, mediaUrl);
		if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
		return result;
	}
	if (!isImageFile(mediaUrl, mimeType) && !isAudioFile(mediaUrl, mimeType) && !isVideoFile(mediaUrl, mimeType)) {
		const result = await sendDocument(target, mediaUrl);
		if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
		return result;
	}
	const result = await sendPhoto(target, mediaUrl);
	if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
	return result;
}
/** Send text after media when the transport supports a follow-up text message. */
async function sendTextAfterMedia(ctx, text) {
	try {
		const token = await getToken(ctx.account);
		if (ctx.targetType === "c2c") await sendC2CMessage(ctx.account.appId, token, ctx.targetId, text, ctx.replyToId);
		else if (ctx.targetType === "group") await sendGroupMessage(ctx.account.appId, token, ctx.targetId, text, ctx.replyToId);
		else if (ctx.targetType === "channel") await sendChannelMessage(token, ctx.targetId, text, ctx.replyToId);
		else if (ctx.targetType === "dm") await sendDmMessage(token, ctx.targetId, text, ctx.replyToId);
	} catch (err) {
		debugError(`[qqbot] sendTextAfterMedia failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
	}
}
/** Extract a lowercase extension from a path or URL, ignoring query and hash segments. */
function getCleanExt(filePath) {
	const cleanPath = filePath.split("?")[0].split("#")[0];
	return normalizeLowercaseStringOrEmpty(path$1.extname(cleanPath));
}
/** Check whether a file is an image using MIME first and extension as fallback. */
function isImageFile(filePath, mimeType) {
	if (mimeType) {
		if (mimeType.startsWith("image/")) return true;
	}
	const ext = getCleanExt(filePath);
	return [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".bmp"
	].includes(ext);
}
/** Check whether a file or URL is a video using MIME first and extension as fallback. */
function isVideoFile(filePath, mimeType) {
	if (mimeType) {
		if (mimeType.startsWith("video/")) return true;
	}
	const ext = getCleanExt(filePath);
	return [
		".mp4",
		".mov",
		".avi",
		".mkv",
		".webm",
		".flv",
		".wmv"
	].includes(ext);
}
/**
* Send a message emitted by an OpenClaw cron task.
*
* Cron output may be either:
* 1. A `QQBOT_CRON:{base64}` structured payload that includes target metadata.
* 2. Plain text that should be sent directly to the provided fallback target.
*
* @param account Resolved account configuration.
* @param to Fallback target address when the payload does not include one.
* @param message Message content, either `QQBOT_CRON:` payload or plain text.
* @returns Send result.
*
* @example
* ```typescript
* // Structured payload
* const result = await sendCronMessage(
*   account,
*   "user_openid",
*   "QQBOT_CRON:eyJ0eXBlIjoiY3Jvbl9yZW1pbmRlciIs..."
* );
*
* // Plain text
* const result = await sendCronMessage(account, "user_openid", "This is a plain reminder message.");
* ```
*/
async function sendCronMessage(account, to, message) {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	debugLog(`[${timestamp}] [qqbot] sendCronMessage: to=${to}, message length=${message.length}`);
	const cronResult = decodeCronPayload(message);
	if (cronResult.isCronPayload) {
		if (cronResult.error) {
			debugError(`[${timestamp}] [qqbot] sendCronMessage: cron payload decode error: ${cronResult.error}`);
			return {
				channel: "qqbot",
				error: `Failed to decode cron payload: ${cronResult.error}`
			};
		}
		if (cronResult.payload) {
			const payload = cronResult.payload;
			debugLog(`[${timestamp}] [qqbot] sendCronMessage: decoded cron payload, targetType=${payload.targetType}, targetAddress=${payload.targetAddress}, content length=${payload.content.length}`);
			const targetTo = payload.targetType === "group" ? `group:${payload.targetAddress}` : payload.targetAddress;
			debugLog(`[${timestamp}] [qqbot] sendCronMessage: sending proactive message to targetTo=${targetTo}`);
			const result = await sendProactiveMessage(account, targetTo, payload.content);
			if (result.error) debugError(`[${timestamp}] [qqbot] sendCronMessage: proactive message failed, error=${result.error}`);
			else debugLog(`[${timestamp}] [qqbot] sendCronMessage: proactive message sent successfully`);
			return result;
		}
	}
	debugLog(`[${timestamp}] [qqbot] sendCronMessage: plain text message, sending to ${to}`);
	return await sendProactiveMessage(account, to, message);
}
//#endregion
export { stopBackgroundTokenRefresh as $, readString as A, sendC2CMessage as B, convertSilkToWav as C, resolveTTSConfig as D, isVoiceAttachment as E, initApiConfig as F, sendGroupFileMessage as G, sendC2CVoiceMessage as H, onMessageSent as I, sendGroupVideoMessage as J, sendGroupImageMessage as K, sendC2CFileMessage as L, clearTokenCache as M, getAccessToken as N, textToSilk as O, getGatewayUrl as P, startBackgroundTokenRefresh as Q, sendC2CImageMessage as R, audioFileToSilkBase64 as S, isGlobalTTSAvailable as T, sendChannelMessage as U, sendC2CVideoMessage as V, sendDmMessage as W, sendProactiveC2CMessage as X, sendGroupVoiceMessage as Y, sendProactiveGroupMessage as Z, parseQQBotPayload as _, recordMessageReply as a, normalizePath as at, downloadFile as b, sendMedia as c, sanitizeFileName as ct, sendText as d, getHomeDir as et, sendVideoMsg as f, isMediaPayload as g, isCronReminderPayload as h, outbound_exports as i, isWindows as it, PLUGIN_USER_AGENT as j, asRecord as k, sendPhoto as l, debugError as lt, encodePayloadForCron as m, getMessageReplyConfig as n, getQQBotMediaDir as nt, sendCronMessage as o, resolveQQBotPayloadLocalFilePath as ot, sendVoice as p, sendGroupMessage as q, getMessageReplyStats as r, isLocalPath as rt, sendDocument as s, runDiagnostics as st, checkMessageReplyLimit as t, getQQBotDataDir as tt, sendProactiveMessage as u, debugLog as ut, normalizeMediaTags as v, formatDuration as w, formatFileSize as x, MAX_UPLOAD_SIZE as y, sendC2CInputNotify as z };
