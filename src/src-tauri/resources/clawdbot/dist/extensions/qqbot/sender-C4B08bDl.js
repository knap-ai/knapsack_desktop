import { c as getPlatformAdapter, i as normalizeOptionalString, n as normalizeLowercaseStringOrEmpty, s as sanitizeFileName } from "./string-normalize-Ci6NM5DE.js";
import * as fs$1 from "node:fs";
import os from "node:os";
import * as crypto$1 from "node:crypto";
import crypto from "node:crypto";
import * as path$1 from "node:path";
//#region extensions/qqbot/src/engine/types.ts
/**
* Core API layer public types.
*
* These types are independent of the root `src/types.ts` and only define
* what the `core/api/` modules need.  The old `src/types.ts` remains
* untouched for backward compatibility.
*/
/**
* Structured API error with HTTP status, path, and optional business error code.
*
* Compared to the old `api.ts` which throws plain `Error`, this carries
* machine-readable fields for downstream retry/fallback decisions.
*/
var ApiError = class extends Error {
	constructor(message, httpStatus, path, bizCode, bizMessage) {
		super(message);
		this.httpStatus = httpStatus;
		this.path = path;
		this.bizCode = bizCode;
		this.bizMessage = bizMessage;
		this.name = "ApiError";
	}
};
/** Stream message input mode (C2C stream_messages API). */
const StreamInputMode = { 
/** Each chunk replaces full message content. */
REPLACE: "replace" };
/** Stream message input state (numeric per QQ Open Platform). */
const StreamInputState = {
	GENERATING: 1,
	DONE: 10
};
/** Stream message content type. */
const StreamContentType = { MARKDOWN: "markdown" };
//#endregion
//#region extensions/qqbot/src/engine/utils/format.ts
/**
* General formatting and string utilities.
* 通用格式化与字符串工具。
*
* Pure utility functions with zero external dependencies.
* Replaces `openclaw/plugin-sdk/error-runtime` and `text-runtime`
* helpers for use inside engine/.
*
* NOTE: The framework `formatErrorMessage` also applies `redactSensitiveText()`
* for token masking. We intentionally omit that here — the framework's log
* pipeline handles redaction at a higher level.
*/
/**
* Format any error object into a readable string.
* 将任意错误对象格式化为可读字符串。
*
* Traverses the `.cause` chain for nested Error objects to include
* the full error context (e.g. network errors wrapped inside HTTP errors).
*/
function formatErrorMessage(err) {
	if (err instanceof Error) {
		let formatted = err.message || err.name || "Error";
		let cause = err.cause;
		const seen = new Set([err]);
		while (cause && !seen.has(cause)) {
			seen.add(cause);
			if (cause instanceof Error) {
				if (cause.message) formatted += ` | ${cause.message}`;
				cause = cause.cause;
			} else if (typeof cause === "string") {
				formatted += ` | ${cause}`;
				break;
			} else break;
		}
		return formatted;
	}
	if (typeof err === "string") return err;
	if (err === null || err === void 0 || typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") return String(err);
	try {
		return JSON.stringify(err);
	} catch {
		return Object.prototype.toString.call(err);
	}
}
/** Format a millisecond duration into a human-readable string (e.g. "5m 30s"). */
function formatDuration(durationMs) {
	const seconds = Math.round(durationMs / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainSeconds = seconds % 60;
	return remainSeconds > 0 ? `${minutes}m ${remainSeconds}s` : `${minutes}m`;
}
//#endregion
//#region extensions/qqbot/src/engine/api/api-client.ts
/**
* Core HTTP client for the QQ Open Platform REST API.
*
* Key improvements over the old `src/api.ts#apiRequest`:
* - `ApiClient` is an **instance** — config (baseUrl, timeout, logger, UA)
*   is injected via the constructor, eliminating module-level globals.
* - Throws structured `ApiError` with httpStatus, bizCode, and path fields.
* - Detects HTML error pages from CDN/gateway and returns user-friendly messages.
* - `redactBodyKeys` replaces the hardcoded `file_data` redaction.
*/
const DEFAULT_BASE_URL = "https://api.sgroup.qq.com";
const DEFAULT_TIMEOUT_MS = 3e4;
const FILE_UPLOAD_TIMEOUT_MS = 12e4;
/**
* Stateful HTTP client for the QQ Open Platform.
*
* Usage:
* ```ts
* const client = new ApiClient({ logger, userAgent: 'QQBotPlugin/1.0' });
* const data = await client.request<{ url: string }>(token, 'GET', '/gateway');
* ```
*/
var ApiClient = class {
	constructor(config = {}) {
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
		this.defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
		this.fileUploadTimeoutMs = config.fileUploadTimeoutMs ?? FILE_UPLOAD_TIMEOUT_MS;
		this.logger = config.logger;
		const ua = config.userAgent ?? "QQBotPlugin/unknown";
		this.resolveUserAgent = typeof ua === "function" ? ua : () => ua;
	}
	/**
	* Send an authenticated JSON request to the QQ Open Platform.
	*
	* @param accessToken - Bearer token (`QQBot {token}`).
	* @param method - HTTP method.
	* @param path - API path (appended to baseUrl).
	* @param body - Optional JSON body.
	* @param options - Optional request overrides.
	* @returns Parsed JSON response.
	* @throws {ApiError} On HTTP or parse errors.
	*/
	async request(accessToken, method, path, body, options) {
		const url = `${this.baseUrl}${path}`;
		const headers = {
			Authorization: `QQBot ${accessToken}`,
			"Content-Type": "application/json",
			"User-Agent": this.resolveUserAgent()
		};
		const isFileUpload = options?.uploadRequest === true || path.includes("/files") || path.includes("/upload_prepare") || path.includes("/upload_part_finish");
		const timeout = options?.timeoutMs ?? (isFileUpload ? this.fileUploadTimeoutMs : this.defaultTimeoutMs);
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		const fetchInit = {
			method,
			headers,
			signal: controller.signal
		};
		if (body) fetchInit.body = JSON.stringify(body);
		this.logger?.debug?.(`[qqbot:api] >>> ${method} ${url} (timeout: ${timeout}ms)`);
		if (body && this.logger?.debug) {
			const logBody = { ...body };
			for (const key of options?.redactBodyKeys ?? ["file_data"]) if (typeof logBody[key] === "string") logBody[key] = `<redacted ${logBody[key].length} chars>`;
			this.logger.debug(`[qqbot:api] >>> Body: ${JSON.stringify(logBody)}`);
		}
		let res;
		try {
			res = await fetch(url, fetchInit);
		} catch (err) {
			clearTimeout(timeoutId);
			if (err instanceof Error && err.name === "AbortError") {
				this.logger?.error?.(`[qqbot:api] <<< Timeout after ${timeout}ms`);
				throw new ApiError(`Request timeout [${path}]: exceeded ${timeout}ms`, 0, path);
			}
			this.logger?.error?.(`[qqbot:api] <<< Network error: ${formatErrorMessage(err)}`);
			throw new ApiError(`Network error [${path}]: ${formatErrorMessage(err)}`, 0, path);
		} finally {
			clearTimeout(timeoutId);
		}
		const traceId = res.headers.get("x-tps-trace-id") ?? "";
		this.logger?.info?.(`[qqbot:api] <<< Status: ${res.status} ${res.statusText}${traceId ? ` | TraceId: ${traceId}` : ""}`);
		let rawBody;
		try {
			rawBody = await res.text();
		} catch (err) {
			throw new ApiError(`Failed to read response [${path}]: ${formatErrorMessage(err)}`, res.status, path);
		}
		this.logger?.debug?.(`[qqbot:api] <<< Body: ${rawBody}`);
		const isHtmlResponse = (res.headers.get("content-type") ?? "").includes("text/html") || rawBody.trimStart().startsWith("<");
		if (!res.ok) {
			if (isHtmlResponse) throw new ApiError(`${res.status === 502 || res.status === 503 || res.status === 504 ? "调用发生异常，请稍候重试" : res.status === 429 ? "请求过于频繁，已被限流" : `开放平台返回 HTTP ${res.status}`}（${path}），请稍后重试`, res.status, path);
			try {
				const error = JSON.parse(rawBody);
				const bizCode = error.code ?? error.err_code;
				throw new ApiError(`API Error [${path}]: ${error.message ?? rawBody}`, res.status, path, bizCode, error.message);
			} catch (parseErr) {
				if (parseErr instanceof ApiError) throw parseErr;
				throw new ApiError(`API Error [${path}] HTTP ${res.status}: ${rawBody.slice(0, 200)}`, res.status, path);
			}
		}
		if (isHtmlResponse) throw new ApiError(`QQ 服务端返回了非 JSON 响应（${path}），可能是临时故障，请稍后重试`, res.status, path);
		try {
			return JSON.parse(rawBody);
		} catch {
			throw new ApiError(`开放平台响应格式异常（${path}），请稍后重试`, res.status, path);
		}
	}
};
//#endregion
//#region extensions/qqbot/src/engine/utils/file-utils.ts
/** Maximum file size accepted by the QQ Bot one-shot upload API (base64 direct). */
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
/**
* Per-{@link MediaFileType} upload metadata: the QQ Open Platform size
* ceiling and the Chinese display name used in user-facing error messages.
*
* Keyed by the enum value so call sites read as
* `MEDIA_FILE_TYPE_INFO[MediaFileType.IMAGE].maxSize`, and adding a new
* type forces both fields to be supplied in a single place.
*/
const MEDIA_FILE_TYPE_INFO = {
	[1]: {
		maxSize: 30 * 1024 * 1024,
		name: "图片"
	},
	[2]: {
		maxSize: 100 * 1024 * 1024,
		name: "视频"
	},
	[3]: {
		maxSize: 20 * 1024 * 1024,
		name: "语音"
	},
	[4]: {
		maxSize: 100 * 1024 * 1024,
		name: "文件"
	}
};
/** Return the Chinese display name for a media file type code. Defaults to "文件". */
function getFileTypeName(fileType) {
	return MEDIA_FILE_TYPE_INFO[fileType]?.name ?? "文件";
}
/** Return the upload ceiling for a given media file type. Defaults to 100MB. */
function getMaxUploadSize(fileType) {
	return MEDIA_FILE_TYPE_INFO[fileType]?.maxSize ?? 104857600;
}
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
/** Infer a MIME type from the file extension. */
function getMimeType(filePath) {
	return MIME_TYPES[normalizeLowercaseStringOrEmpty(path$1.extname(filePath))] ?? "application/octet-stream";
}
/** Canonical ext → MIME table. Single source of truth. */
const MIME_TYPES = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".bmp": "image/bmp",
	".mp4": "video/mp4",
	".mov": "video/quicktime",
	".avi": "video/x-msvideo",
	".mkv": "video/x-matroska",
	".webm": "video/webm",
	".pdf": "application/pdf",
	".doc": "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xls": "application/vnd.ms-excel",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".zip": "application/zip",
	".tar": "application/x-tar",
	".gz": "application/gzip",
	".txt": "text/plain"
};
/** Extensions accepted as image uploads by the QQ Bot media pipeline. */
const IMAGE_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
	".bmp"
]);
/**
* Return the image MIME type for a local file path, or `null` if the
* extension is not in the supported image whitelist.
*
* Use this instead of `getMimeType` when the caller must enforce
* "image formats only" as a business rule (e.g. constructing a
* `data:image/...;base64,` URL).
*/
function getImageMimeType(filePath) {
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	if (!IMAGE_EXTENSIONS.has(ext)) return null;
	return MIME_TYPES[ext] ?? null;
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
		const fetched = await getPlatformAdapter().fetchMedia({
			url: parsedUrl.toString(),
			filePathHint: originalFilename,
			ssrfPolicy: QQBOT_MEDIA_SSRF_POLICY
		});
		let filename = normalizeOptionalString(originalFilename) ?? "";
		if (!filename) filename = (normalizeOptionalString(fetched.fileName) ?? path$1.basename(parsedUrl.pathname)) || "download";
		const ts = Date.now();
		const ext = path$1.extname(filename);
		const safeFilename = `${path$1.basename(filename, ext) || "file"}_${ts}_${crypto.randomBytes(3).toString("hex")}${ext}`;
		const destPath = path$1.join(destDir, safeFilename);
		await fs$1.promises.writeFile(destPath, fetched.buffer);
		return destPath;
	} catch (err) {
		console.error(`[qqbot:downloadFile] FAILED url=${url.slice(0, 120)} error=${err instanceof Error ? err.message : String(err)}`);
		if (err instanceof Error && err.stack) console.error(`[qqbot:downloadFile] stack=${err.stack.split("\n").slice(0, 3).join(" | ")}`);
		if (err instanceof Error && err.cause) console.error(`[qqbot:downloadFile] cause=${formatErrorMessage(err.cause)}`);
		return null;
	}
}
//#endregion
//#region extensions/qqbot/src/engine/api/retry.ts
/**
* Execute an async operation with configurable retry semantics.
*
* @param fn - The async operation to retry.
* @param policy - Standard retry configuration.
* @param persistentPolicy - Optional persistent retry for specific error codes.
* @param logger - Optional logger for retry diagnostics.
* @returns The result of the first successful invocation.
*/
async function withRetry(fn, policy, persistentPolicy, logger) {
	let lastError = null;
	for (let attempt = 0; attempt <= policy.maxRetries; attempt++) try {
		return await fn();
	} catch (err) {
		lastError = err instanceof Error ? err : new Error(formatErrorMessage(err));
		if (persistentPolicy?.shouldPersistRetry(lastError)) {
			(logger?.warn ?? logger?.error)?.(`[qqbot:retry] Hit persistent-retry trigger, entering persistent loop (timeout=${persistentPolicy.timeoutMs / 1e3}s)`);
			return await persistentRetryLoop(fn, persistentPolicy, logger);
		}
		if (policy.shouldRetry?.(lastError, attempt) === false) throw lastError;
		if (attempt < policy.maxRetries) {
			const delay = policy.backoff === "exponential" ? policy.baseDelayMs * 2 ** attempt : policy.baseDelayMs;
			logger?.debug?.(`[qqbot:retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms: ${lastError.message.slice(0, 100)}`);
			await sleep$1(delay);
		}
	}
	throw lastError;
}
/**
* Persistent retry loop: fixed-interval retries bounded by a total timeout.
*
* Used for `upload_part_finish` when the server returns specific business
* error codes indicating the backend is still processing.
*/
async function persistentRetryLoop(fn, policy, logger) {
	const deadline = Date.now() + policy.timeoutMs;
	let attempt = 0;
	let lastError = null;
	while (Date.now() < deadline) try {
		const result = await fn();
		logger?.debug?.(`[qqbot:retry] Persistent retry succeeded after ${attempt} retries`);
		return result;
	} catch (err) {
		lastError = err instanceof Error ? err : new Error(formatErrorMessage(err));
		if (!policy.shouldPersistRetry(lastError)) {
			logger?.error?.(`[qqbot:retry] Persistent retry: error is no longer retryable, aborting`);
			throw lastError;
		}
		attempt++;
		const remaining = deadline - Date.now();
		if (remaining <= 0) break;
		const actualDelay = Math.min(policy.intervalMs, remaining);
		(logger?.warn ?? logger?.error)?.(`[qqbot:retry] Persistent retry #${attempt}: retrying in ${actualDelay}ms (remaining=${Math.round(remaining / 1e3)}s)`);
		await sleep$1(actualDelay);
	}
	logger?.error?.(`[qqbot:retry] Persistent retry timed out after ${policy.timeoutMs / 1e3}s (${attempt} attempts)`);
	throw lastError ?? /* @__PURE__ */ new Error(`Persistent retry timed out (${policy.timeoutMs / 1e3}s)`);
}
function sleep$1(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/** Standard upload retry: exponential backoff, skip 400/401/timeout errors. */
const UPLOAD_RETRY_POLICY = {
	maxRetries: 2,
	baseDelayMs: 1e3,
	backoff: "exponential",
	shouldRetry: (error) => {
		const msg = error.message;
		return !(msg.includes("400") || msg.includes("401") || msg.includes("Invalid") || msg.includes("timeout") || msg.includes("Timeout"));
	}
};
/** Complete-upload retry: unconditional retry with exponential backoff. */
const COMPLETE_UPLOAD_RETRY_POLICY = {
	maxRetries: 2,
	baseDelayMs: 2e3,
	backoff: "exponential"
};
/** Part-finish standard retry policy. */
const PART_FINISH_RETRY_POLICY = {
	maxRetries: 2,
	baseDelayMs: 1e3,
	backoff: "exponential"
};
/**
* Build a persistent retry policy for part-finish with a specific timeout.
*
* @param retryTimeoutMs - Total timeout (defaults to 2 minutes).
* @param retryableCodes - Business error codes that trigger persistent retry.
*/
function buildPartFinishPersistentPolicy(retryTimeoutMs, retryableCodes = PART_FINISH_RETRYABLE_CODES) {
	return {
		timeoutMs: retryTimeoutMs ?? 120 * 1e3,
		intervalMs: 1e3,
		shouldPersistRetry: (error) => {
			if (retryableCodes.size === 0) return false;
			if ("bizCode" in error && typeof error.bizCode === "number") return retryableCodes.has(error.bizCode);
			return false;
		}
	};
}
/** Business error codes that trigger persistent part-finish retry. */
const PART_FINISH_RETRYABLE_CODES = new Set([40093001]);
/** upload_prepare error code indicating daily limit exceeded. */
const UPLOAD_PREPARE_FALLBACK_CODE = 40093002;
//#endregion
//#region extensions/qqbot/src/engine/api/routes.ts
/**
* Build the message-send path for C2C or Group.
*
* - C2C:   `/v2/users/{id}/messages`
* - Group: `/v2/groups/{id}/messages`
*/
function messagePath(scope, targetId) {
	return scope === "c2c" ? `/v2/users/${targetId}/messages` : `/v2/groups/${targetId}/messages`;
}
/** Channel message path. */
function channelMessagePath(channelId) {
	return `/channels/${channelId}/messages`;
}
/** DM (direct message inside a guild) path. */
function dmMessagePath(guildId) {
	return `/dms/${guildId}/messages`;
}
/**
* Build the media upload (small-file) path for C2C or Group.
*
* - C2C:   `/v2/users/{id}/files`
* - Group: `/v2/groups/{id}/files`
*/
function mediaUploadPath(scope, targetId) {
	return scope === "c2c" ? `/v2/users/${targetId}/files` : `/v2/groups/${targetId}/files`;
}
/**
* Build the upload_prepare path for C2C or Group.
*
* - C2C:   `/v2/users/{id}/upload_prepare`
* - Group: `/v2/groups/{id}/upload_prepare`
*/
function uploadPreparePath(scope, targetId) {
	return scope === "c2c" ? `/v2/users/${targetId}/upload_prepare` : `/v2/groups/${targetId}/upload_prepare`;
}
/**
* Build the upload_part_finish path for C2C or Group.
*/
function uploadPartFinishPath(scope, targetId) {
	return scope === "c2c" ? `/v2/users/${targetId}/upload_part_finish` : `/v2/groups/${targetId}/upload_part_finish`;
}
/**
* Build the complete-upload (files) path for C2C or Group.
* (Same as mediaUploadPath — the complete endpoint reuses the files path.)
*/
function uploadCompletePath(scope, targetId) {
	return mediaUploadPath(scope, targetId);
}
/** Stream message path (C2C only). */
function streamMessagePath(openid) {
	return `/v2/users/${openid}/stream_messages`;
}
/** Gateway URL path. */
function gatewayPath() {
	return "/gateway";
}
/** Interaction acknowledgement path. */
function interactionPath(interactionId) {
	return `/interactions/${interactionId}`;
}
/**
* Generate a message sequence number in the 0..65535 range.
*
* Used by both `messages.ts` and `media.ts` to avoid duplicate definitions.
*/
function getNextMsgSeq(_msgId) {
	return (Date.now() % 1e8 ^ Math.floor(Math.random() * 65536)) % 65536;
}
//#endregion
//#region extensions/qqbot/src/engine/api/media-chunked.ts
/**
* Chunked media upload for the QQ Open Platform.
*
* ## Flow (mirrors the upload sequence diagram)
*
* 1. `upload_prepare` — submit file metadata + (md5 / sha1 / md5_10m) hashes,
*    receive `{ upload_id, block_size, parts[], concurrency?, retry_timeout? }`.
* 2. For every part (parallelized under a bounded concurrency):
*    a. Read the part bytes (stream from disk or slice in-memory buffer).
*    b. PUT the bytes to the pre-signed COS URL.
*    c. POST `upload_part_finish { upload_id, part_index, block_size, md5 }`,
*       retrying under {@link PART_FINISH_RETRY_POLICY} + the persistent
*       retry loop for {@link PART_FINISH_RETRYABLE_CODES}.
* 3. POST `complete_upload { upload_id }` — returns `{ file_uuid, file_info,
*    ttl }` identical to the one-shot path.
* 4. If `upload_prepare` returns {@link UPLOAD_PREPARE_FALLBACK_CODE}
*    (`40093002` — daily upload quota exceeded), throw
*    {@link UploadDailyLimitExceededError} so the upper layer can surface a
*    user-facing message. The dispatcher is responsible for the fallback
*    (there is no server path that will accept the file at this point).
*
* ## Why a class
*
* Mirrors {@link MediaApi}: injects {@link ApiClient}, {@link TokenManager},
* the upload cache adapter, an optional filename sanitizer, and a logger.
* Keeping the client singleton plumbing consistent means only one place
* manages UA / baseUrl / file-upload timeouts.
*
* ## Upload cache integration
*
* Chunked uploads participate in the same `file_info` cache as
* {@link MediaApi.uploadMedia}. The cache key is derived from the full-file
* md5 (already computed for `upload_prepare`) so repeat sends of the same
* large file hit the cache before we even talk to `upload_prepare`.
*/
/**
* Raised when `upload_prepare` returns {@link UPLOAD_PREPARE_FALLBACK_CODE}
* (40093002). Carries enough context for the outbound layer to render a
* user-facing fallback message (file name, size, and the originating
* local path when available).
*/
var UploadDailyLimitExceededError = class extends Error {
	constructor(filePath, fileSize, originalMessage) {
		super(originalMessage);
		this.filePath = filePath;
		this.fileSize = fileSize;
		this.name = "UploadDailyLimitExceededError";
	}
};
/** Default concurrency when the server does not specify one. */
const DEFAULT_CONCURRENT_PARTS = 1;
/** Hard cap on per-upload concurrency regardless of what the server returns. */
const MAX_CONCURRENT_PARTS = 10;
/**
* Upper bound on the persistent-retry window for `upload_part_finish`.
*
* The server may suggest `retry_timeout` via `upload_prepare` — we honor
* it but clamp to 10 minutes so a runaway server can't hold the caller
* hostage.
*/
const MAX_PART_FINISH_RETRY_TIMEOUT_MS = 600 * 1e3;
/** Per-part PUT timeout (5 minutes). Matches the low-bandwidth tolerance. */
const PART_UPLOAD_TIMEOUT_MS = 3e5;
/**
* Boundary used by `md5_10m` — first 10,002,432 bytes.
*
* Files smaller than this return the whole-file md5 for `md5_10m` (per the
* server contract).
*/
const MD5_10M_SIZE = 10002432;
/**
* Chunked upload module. Stateless across calls — see
* {@link ChunkedMediaApi.uploadChunked} for the main entry.
*/
var ChunkedMediaApi = class {
	constructor(client, tokenManager, config = {}) {
		this.client = client;
		this.tokenManager = tokenManager;
		this.logger = config.logger;
		this.cache = config.uploadCache;
		this.sanitize = config.sanitizeFileName ?? ((n) => n);
	}
	/**
	* Upload a {@link MediaSource} via the chunked endpoint. Only `localPath`
	* and `buffer` sources are accepted — `url` / `base64` must fall through
	* to {@link MediaApi.uploadMedia}.
	*
	* @throws {UploadDailyLimitExceededError} when `upload_prepare` returns
	*   {@link UPLOAD_PREPARE_FALLBACK_CODE}.
	*/
	async uploadChunked(opts) {
		const prefix = opts.logPrefix ?? "[qqbot:chunked-upload]";
		const input = resolveSource(opts.source, opts.fileName);
		const displayName = input.fileName;
		const fileSize = input.size;
		const pathLabel = input.kind === "localPath" ? input.path : "<buffer>";
		this.logger?.info?.(`${prefix} Start: file=${displayName} size=${formatFileSize(fileSize)} type=${opts.fileType}`);
		const hashes = await computeHashes(input);
		this.logger?.debug?.(`${prefix} hashes: md5=${hashes.md5} sha1=${hashes.sha1} md5_10m=${hashes.md5_10m}`);
		if (this.cache) {
			const cached = this.cache.get(hashes.md5, opts.scope, opts.targetId, opts.fileType);
			if (cached) {
				this.logger?.info?.(`${prefix} cache HIT (md5=${hashes.md5.slice(0, 8)}) — skipping chunked upload`);
				return {
					file_uuid: "",
					file_info: cached,
					ttl: 0
				};
			}
		}
		const fileNameForPrepare = opts.fileType === 4 ? this.sanitize(displayName) : displayName;
		const prepareResp = await this.callUploadPrepare(opts, fileNameForPrepare, fileSize, hashes, pathLabel);
		const { upload_id, parts } = prepareResp;
		const block_size = prepareResp.block_size;
		const maxConcurrent = Math.min(prepareResp.concurrency ? prepareResp.concurrency : DEFAULT_CONCURRENT_PARTS, MAX_CONCURRENT_PARTS);
		const retryTimeoutMs = prepareResp.retry_timeout ? Math.min(prepareResp.retry_timeout * 1e3, MAX_PART_FINISH_RETRY_TIMEOUT_MS) : void 0;
		this.logger?.info?.(`${prefix} prepared: upload_id=${upload_id} block=${formatFileSize(block_size)} parts=${parts.length} concurrency=${maxConcurrent}`);
		let completedParts = 0;
		let uploadedBytes = 0;
		const uploadPart = async (part) => {
			const partIndex = part.index;
			const offset = (partIndex - 1) * block_size;
			const length = Math.min(block_size, fileSize - offset);
			const partBuffer = await readPart(input, offset, length);
			const md5Hex = crypto$1.createHash("md5").update(partBuffer).digest("hex");
			this.logger?.debug?.(`${prefix} part ${partIndex}/${parts.length}: ${formatFileSize(length)} offset=${offset} md5=${md5Hex}`);
			await putToPresignedUrl(part.presigned_url, partBuffer, partIndex, parts.length, this.logger, prefix);
			await this.callUploadPartFinish(opts, upload_id, partIndex, length, md5Hex, retryTimeoutMs);
			completedParts++;
			uploadedBytes += length;
			this.logger?.info?.(`${prefix} part ${partIndex}/${parts.length} done (${completedParts}/${parts.length})`);
			opts.onProgress?.({
				completedParts,
				totalParts: parts.length,
				uploadedBytes,
				totalBytes: fileSize
			});
		};
		try {
			await runWithConcurrency(parts.map((part) => () => uploadPart(part)), maxConcurrent);
		} finally {}
		this.logger?.info?.(`${prefix} all parts uploaded, completing...`);
		const result = await this.callCompleteUpload(opts, upload_id);
		this.logger?.info?.(`${prefix} completed: file_uuid=${result.file_uuid} ttl=${result.ttl}s`);
		if (this.cache && result.file_info && result.ttl > 0) this.cache.set(hashes.md5, opts.scope, opts.targetId, opts.fileType, result.file_info, result.file_uuid, result.ttl);
		return result;
	}
	async callUploadPrepare(opts, fileName, fileSize, hashes, pathLabel) {
		const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
		const path = uploadPreparePath(opts.scope, opts.targetId);
		try {
			return await this.client.request(token, "POST", path, {
				file_type: opts.fileType,
				file_name: fileName,
				file_size: fileSize,
				md5: hashes.md5,
				sha1: hashes.sha1,
				md5_10m: hashes.md5_10m
			}, { uploadRequest: true });
		} catch (err) {
			if (err instanceof ApiError && err.bizCode === 40093002) throw new UploadDailyLimitExceededError(pathLabel, fileSize, err.message);
			throw err;
		}
	}
	async callUploadPartFinish(opts, uploadId, partIndex, blockSize, md5, retryTimeoutMs) {
		const persistentPolicy = buildPartFinishPersistentPolicy(retryTimeoutMs);
		const path = uploadPartFinishPath(opts.scope, opts.targetId);
		await withRetry(async () => {
			const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
			return this.client.request(token, "POST", path, {
				upload_id: uploadId,
				part_index: partIndex,
				block_size: blockSize,
				md5
			}, { uploadRequest: true });
		}, PART_FINISH_RETRY_POLICY, persistentPolicy, this.logger);
	}
	async callCompleteUpload(opts, uploadId) {
		const path = uploadCompletePath(opts.scope, opts.targetId);
		return withRetry(async () => {
			const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
			return this.client.request(token, "POST", path, { upload_id: uploadId }, { uploadRequest: true });
		}, COMPLETE_UPLOAD_RETRY_POLICY, void 0, this.logger);
	}
};
function resolveSource(source, fileNameOverride) {
	if (source.kind === "localPath") {
		const inferredName = source.path.split(/[/\\]/).pop() || "file";
		return {
			kind: "localPath",
			path: source.path,
			size: source.size,
			fileName: fileNameOverride ?? inferredName
		};
	}
	if (source.kind === "buffer") return {
		kind: "buffer",
		buffer: source.buffer,
		size: source.buffer.length,
		fileName: fileNameOverride ?? source.fileName ?? "file"
	};
	throw new Error(`ChunkedMediaApi: unsupported source kind '${source.kind}'. Chunked upload only supports 'localPath' and 'buffer'; route 'url'/'base64' through the one-shot uploader.`);
}
async function readPart(input, offset, length) {
	if (input.kind === "buffer") return input.buffer.subarray(offset, offset + length);
	const handle = await fs$1.promises.open(input.path, "r");
	try {
		const buf = Buffer.alloc(length);
		const { bytesRead } = await handle.read(buf, 0, length, offset);
		return bytesRead < length ? buf.subarray(0, bytesRead) : buf;
	} finally {
		await handle.close();
	}
}
/**
* Stream the source once to compute md5 + sha1 + md5_10m.
*
* For buffer inputs the three hashes are computed in a single pass over
* the existing memory. For localPath inputs a ReadStream drives the
* hashers so memory use stays constant.
*/
async function computeHashes(input) {
	if (input.kind === "buffer") {
		const md5 = crypto$1.createHash("md5").update(input.buffer).digest("hex");
		return {
			md5,
			sha1: crypto$1.createHash("sha1").update(input.buffer).digest("hex"),
			md5_10m: input.size > MD5_10M_SIZE ? crypto$1.createHash("md5").update(input.buffer.subarray(0, MD5_10M_SIZE)).digest("hex") : md5
		};
	}
	return new Promise((resolve, reject) => {
		const md5 = crypto$1.createHash("md5");
		const sha1 = crypto$1.createHash("sha1");
		const md5_10m = crypto$1.createHash("md5");
		let consumed = 0;
		const needsMd5_10m = input.size > MD5_10M_SIZE;
		const stream = fs$1.createReadStream(input.path);
		stream.on("data", (chunk) => {
			const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
			md5.update(buf);
			sha1.update(buf);
			if (needsMd5_10m) {
				const remaining = MD5_10M_SIZE - consumed;
				if (remaining > 0) md5_10m.update(remaining >= buf.length ? buf : buf.subarray(0, remaining));
			}
			consumed += buf.length;
		});
		stream.on("end", () => {
			const md5Hex = md5.digest("hex");
			resolve({
				md5: md5Hex,
				sha1: sha1.digest("hex"),
				md5_10m: needsMd5_10m ? md5_10m.digest("hex") : md5Hex
			});
		});
		stream.on("error", reject);
	});
}
/** Per-part retry budget for the COS PUT call (exponential backoff). */
const PART_UPLOAD_MAX_RETRIES = 2;
async function putToPresignedUrl(presignedUrl, data, partIndex, totalParts, logger, prefix) {
	let lastError = null;
	for (let attempt = 0; attempt <= PART_UPLOAD_MAX_RETRIES; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), PART_UPLOAD_TIMEOUT_MS);
		try {
			const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
			const startTime = Date.now();
			const response = await fetch(presignedUrl, {
				method: "PUT",
				body: new Blob([ab]),
				headers: { "Content-Length": String(data.length) },
				signal: controller.signal
			});
			const elapsed = Date.now() - startTime;
			const requestId = response.headers.get("x-cos-request-id") ?? "-";
			const etag = response.headers.get("ETag") ?? "-";
			if (!response.ok) {
				const body = await response.text().catch(() => "");
				logger?.error?.(`${prefix} PUT part ${partIndex}/${totalParts}: HTTP ${response.status} ${response.statusText} (${elapsed}ms, requestId=${requestId}) body=${body.slice(0, 160)}`);
				throw new Error(`COS PUT failed: ${response.status} ${response.statusText} - ${body.slice(0, 120)}`);
			}
			logger?.debug?.(`${prefix} PUT part ${partIndex}/${totalParts} OK (${elapsed}ms ETag=${etag} requestId=${requestId})`);
			return;
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));
			if (lastError.name === "AbortError") lastError = /* @__PURE__ */ new Error(`Part ${partIndex}/${totalParts} upload timeout after ${PART_UPLOAD_TIMEOUT_MS}ms`);
			if (attempt < PART_UPLOAD_MAX_RETRIES) {
				const delay = 1e3 * 2 ** attempt;
				(logger?.warn ?? logger?.error)?.(`${prefix} PUT part ${partIndex}/${totalParts} attempt ${attempt + 1} failed (${lastError.message.slice(0, 120)}), retrying in ${delay}ms`);
				await sleep(delay);
			}
		} finally {
			clearTimeout(timeoutId);
		}
	}
	throw lastError ?? /* @__PURE__ */ new Error(`Part ${partIndex}/${totalParts} upload failed`);
}
/**
* Batch-mode concurrency limiter. Deliberately simple: dispatch N tasks at
* a time and wait for the whole batch to settle before the next batch.
*
* A pool / queue implementation would recover some throughput when tasks
* have heavy variance, but part uploads are size-uniform (last part can be
* short) so the extra complexity is not worth it.
*/
async function runWithConcurrency(tasks, maxConcurrent) {
	for (let i = 0; i < tasks.length; i += maxConcurrent) {
		const batch = tasks.slice(i, i + maxConcurrent);
		await Promise.all(batch.map((task) => task()));
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
//#endregion
//#region extensions/qqbot/src/engine/api/media.ts
/**
* Media upload API for the QQ Open Platform (small-file direct upload).
*
* Key improvements:
* - Unified `uploadMedia(scope, ...)` replaces `uploadC2CMedia` + `uploadGroupMedia`.
* - Upload cache integration via composition (passed in constructor).
* - Uses `withRetry` from the shared retry engine.
*
* Chunked upload for files above `LARGE_FILE_THRESHOLD` is tracked by
* {@link ./media-chunked.ts}; this module currently handles only the
* one-shot path.
*/
/**
* Small-file media upload module.
*
* Handles base64 and URL-based uploads with optional caching and retry.
*/
var MediaApi = class {
	constructor(client, tokenManager, config = {}) {
		this.client = client;
		this.tokenManager = tokenManager;
		this.logger = config.logger;
		this.cache = config.uploadCache;
		this.sanitize = config.sanitizeFileName ?? ((n) => n);
	}
	/**
	* Upload media via base64, URL, buffer, or local file path to a C2C or Group target.
	*
	* The `localPath` and `buffer` branches are equivalent to `fileData` for the
	* current one-shot implementation — the file is read and base64-encoded
	* synchronously. They exist as first-class inputs so that a future chunked
	* upload implementation can consume them without interface churn.
	*
	* @param scope - `'c2c'` or `'group'`.
	* @param targetId - User openid or group openid.
	* @param fileType - Media file type code.
	* @param creds - Authentication credentials.
	* @param opts - Upload options. Exactly one of `url`/`fileData`/`buffer`/`localPath`
	*   must be supplied.
	* @returns Upload result containing `file_info` for subsequent message sends.
	*/
	async uploadMedia(scope, targetId, fileType, creds, opts) {
		const sources = [
			opts.url,
			opts.fileData,
			opts.buffer,
			opts.localPath
		].filter((v) => v !== void 0);
		if (sources.length === 0) throw new Error(`uploadMedia: one of url/fileData/buffer/localPath is required`);
		if (sources.length > 1) throw new Error(`uploadMedia: url/fileData/buffer/localPath are mutually exclusive (got ${sources.length})`);
		let fileData = opts.fileData;
		if (opts.buffer) fileData = opts.buffer.toString("base64");
		else if (opts.localPath) fileData = (await fs$1.promises.readFile(opts.localPath)).toString("base64");
		if (fileData && this.cache) {
			const hash = this.cache.computeHash(fileData);
			const cached = this.cache.get(hash, scope, targetId, fileType);
			if (cached) return {
				file_uuid: "",
				file_info: cached,
				ttl: 0
			};
		}
		const body = {
			file_type: fileType,
			srv_send_msg: opts.srvSendMsg ?? false
		};
		if (opts.url) body.url = opts.url;
		else if (fileData) body.file_data = fileData;
		if (fileType === 4 && opts.fileName) body.file_name = this.sanitize(opts.fileName);
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const path = mediaUploadPath(scope, targetId);
		const result = await withRetry(() => this.client.request(token, "POST", path, body, {
			redactBodyKeys: ["file_data"],
			uploadRequest: true
		}), UPLOAD_RETRY_POLICY, void 0, this.logger);
		if (fileData && result.file_info && result.ttl > 0 && this.cache) {
			const hash = this.cache.computeHash(fileData);
			this.cache.set(hash, scope, targetId, fileType, result.file_info, result.file_uuid, result.ttl);
		}
		return result;
	}
	/**
	* Send a media message (upload result → message) to a C2C or Group target.
	*
	* @param scope - `'c2c'` or `'group'`.
	* @param targetId - User openid or group openid.
	* @param fileInfo - `file_info` from a prior upload.
	* @param creds - Authentication credentials.
	* @param opts - Message options.
	*/
	async sendMediaMessage(scope, targetId, fileInfo, creds, opts) {
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const msgSeq = opts?.msgId ? getNextMsgSeq(opts.msgId) : 1;
		const path = messagePath(scope, targetId);
		return this.client.request(token, "POST", path, {
			msg_type: 7,
			media: { file_info: fileInfo },
			msg_seq: msgSeq,
			...opts?.content ? { content: opts.content } : {},
			...opts?.msgId ? { msg_id: opts.msgId } : {}
		});
	}
};
//#endregion
//#region extensions/qqbot/src/engine/api/messages.ts
/**
* Message sending module.
*
* Usage:
* ```ts
* const api = new MessageApi(client, tokenMgr, { markdownSupport: true });
* await api.sendMessage('c2c', openid, 'Hello!', { appId, clientSecret, msgId });
* ```
*/
var MessageApi = class {
	constructor(client, tokenManager, config) {
		this.messageSentHook = null;
		this.client = client;
		this.tokenManager = tokenManager;
		this.markdownSupport = config.markdownSupport;
		this.logger = config.logger;
	}
	/** Register a callback invoked when a sent message returns a ref_idx. */
	onMessageSent(callback) {
		this.messageSentHook = callback;
	}
	/**
	* Notify the registered hook about a sent message.
	* Use this for media sends that bypass `sendAndNotify`.
	*/
	notifyMessageSent(refIdx, meta) {
		if (this.messageSentHook) try {
			this.messageSentHook(refIdx, meta);
		} catch (err) {
			this.logger?.error?.(`[qqbot:messages] onMessageSent hook error: ${formatErrorMessage(err)}`);
		}
	}
	/**
	* Send a text message to a C2C or Group target.
	*
	* Automatically constructs the correct path, body format (markdown vs plain),
	* and message sequence number.
	*/
	async sendMessage(scope, targetId, content, creds, opts) {
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const msgSeq = opts?.msgId ? getNextMsgSeq(opts.msgId) : 1;
		const body = this.buildMessageBody(content, opts?.msgId, msgSeq, opts?.messageReference, opts?.inlineKeyboard);
		const path = messagePath(scope, targetId);
		return this.sendAndNotify(creds.appId, token, "POST", path, body, { text: content });
	}
	/** Send a proactive (no msgId) message to a C2C or Group target. */
	async sendProactiveMessage(scope, targetId, content, creds) {
		if (!content?.trim()) throw new Error("Proactive message content must not be empty");
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const body = this.buildProactiveBody(content);
		const path = messagePath(scope, targetId);
		return this.sendAndNotify(creds.appId, token, "POST", path, body, { text: content });
	}
	/** Send a channel message. */
	async sendChannelMessage(opts) {
		const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
		return this.client.request(token, "POST", channelMessagePath(opts.channelId), {
			content: opts.content,
			...opts.msgId ? { msg_id: opts.msgId } : {}
		});
	}
	/** Send a DM (guild direct message). */
	async sendDmMessage(opts) {
		const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
		return this.client.request(token, "POST", dmMessagePath(opts.guildId), {
			content: opts.content,
			...opts.msgId ? { msg_id: opts.msgId } : {}
		});
	}
	/** Send a typing indicator to a C2C user. */
	async sendInputNotify(opts) {
		const inputSecond = opts.inputSecond ?? 60;
		const token = await this.tokenManager.getAccessToken(opts.creds.appId, opts.creds.clientSecret);
		const msgSeq = opts.msgId ? getNextMsgSeq(opts.msgId) : 1;
		return { refIdx: (await this.client.request(token, "POST", messagePath("c2c", opts.openid), {
			msg_type: 6,
			input_notify: {
				input_type: 1,
				input_second: inputSecond
			},
			msg_seq: msgSeq,
			...opts.msgId ? { msg_id: opts.msgId } : {}
		})).ext_info?.ref_idx };
	}
	/** Acknowledge an INTERACTION_CREATE event. */
	async acknowledgeInteraction(interactionId, creds, code = 0) {
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		await this.client.request(token, "PUT", interactionPath(interactionId), { code });
	}
	/** Get the WebSocket gateway URL. */
	async getGatewayUrl(creds) {
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		return (await this.client.request(token, "GET", gatewayPath())).url;
	}
	/**
	* Send a C2C stream message chunk (`/v2/users/{openid}/stream_messages`).
	* Only supported for one-to-one chats.
	*/
	async sendC2CStreamMessage(creds, openid, req) {
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const path = streamMessagePath(openid);
		const body = {
			input_mode: req.input_mode,
			input_state: req.input_state,
			content_type: req.content_type,
			content_raw: req.content_raw,
			event_id: req.event_id,
			msg_id: req.msg_id,
			msg_seq: req.msg_seq,
			index: req.index
		};
		if (req.stream_msg_id) body.stream_msg_id = req.stream_msg_id;
		return this.client.request(token, "POST", path, body);
	}
	async sendAndNotify(appId, accessToken, method, path, body, meta) {
		const result = await this.client.request(accessToken, method, path, body);
		if (result.ext_info?.ref_idx && this.messageSentHook) try {
			this.messageSentHook(result.ext_info.ref_idx, meta);
		} catch (err) {
			this.logger?.error?.(`[qqbot:messages] onMessageSent hook error: ${formatErrorMessage(err)}`);
		}
		return result;
	}
	buildMessageBody(content, msgId, msgSeq, messageReference, inlineKeyboard) {
		const body = this.markdownSupport ? {
			markdown: { content },
			msg_type: 2,
			msg_seq: msgSeq
		} : {
			content,
			msg_type: 0,
			msg_seq: msgSeq
		};
		if (msgId) body.msg_id = msgId;
		if (messageReference && !this.markdownSupport) body.message_reference = { message_id: messageReference };
		if (inlineKeyboard) body.keyboard = inlineKeyboard;
		return body;
	}
	buildProactiveBody(content) {
		return this.markdownSupport ? {
			markdown: { content },
			msg_type: 2
		} : {
			content,
			msg_type: 0
		};
	}
};
//#endregion
//#region extensions/qqbot/src/engine/api/token.ts
const TOKEN_URL = "https://bots.qq.com/app/getAppAccessToken";
/**
* Per-appId token manager with caching, singleflight, and background refresh.
*
* Usage:
* ```ts
* const tm = new TokenManager({ logger, userAgent: 'QQBotPlugin/1.0' });
* const token = await tm.getAccessToken('appId', 'secret');
* ```
*/
var TokenManager = class {
	constructor(config) {
		this.cache = /* @__PURE__ */ new Map();
		this.fetchPromises = /* @__PURE__ */ new Map();
		this.refreshControllers = /* @__PURE__ */ new Map();
		this.logger = config?.logger;
		const ua = config?.userAgent ?? "QQBotPlugin/unknown";
		this.resolveUserAgent = typeof ua === "function" ? ua : () => ua;
	}
	/**
	* Obtain an access token with caching and singleflight semantics.
	*
	* When multiple callers request a token for the same appId concurrently,
	* only one actual HTTP request is made — the others await the same promise.
	*/
	async getAccessToken(appId, clientSecret) {
		const normalizedId = appId.trim();
		const cached = this.cache.get(normalizedId);
		const refreshAheadMs = cached ? Math.min(300 * 1e3, (cached.expiresAt - Date.now()) / 3) : 0;
		if (cached && Date.now() < cached.expiresAt - refreshAheadMs) return cached.token;
		let pending = this.fetchPromises.get(normalizedId);
		if (pending) {
			this.logger?.debug?.(`[qqbot:token:${normalizedId}] Fetch in progress, reusing promise`);
			return pending;
		}
		pending = (async () => {
			try {
				return await this.doFetchToken(normalizedId, clientSecret);
			} finally {
				this.fetchPromises.delete(normalizedId);
			}
		})();
		this.fetchPromises.set(normalizedId, pending);
		return pending;
	}
	/** Clear the cached token for one appId, or all. */
	clearCache(appId) {
		if (appId) {
			this.cache.delete(appId.trim());
			this.logger?.debug?.(`[qqbot:token:${appId}] Cache cleared`);
		} else {
			this.cache.clear();
			this.logger?.debug?.(`[token] All caches cleared`);
		}
	}
	/** Return token status for diagnostics. */
	getStatus(appId) {
		if (this.fetchPromises.has(appId)) return {
			status: "refreshing",
			expiresAt: this.cache.get(appId)?.expiresAt ?? null
		};
		const cached = this.cache.get(appId);
		if (!cached) return {
			status: "none",
			expiresAt: null
		};
		const remaining = cached.expiresAt - Date.now();
		return {
			status: remaining > Math.min(300 * 1e3, remaining / 3) ? "valid" : "expired",
			expiresAt: cached.expiresAt
		};
	}
	/** Start a background token refresh loop for one appId. */
	startBackgroundRefresh(appId, clientSecret, options) {
		if (this.refreshControllers.has(appId)) {
			this.logger?.info?.(`[qqbot:token:${appId}] Background refresh already running`);
			return;
		}
		const { refreshAheadMs = 300 * 1e3, randomOffsetMs = 30 * 1e3, minRefreshIntervalMs = 60 * 1e3, retryDelayMs = 5 * 1e3 } = options ?? {};
		const controller = new AbortController();
		this.refreshControllers.set(appId, controller);
		const { signal } = controller;
		const loop = async () => {
			this.logger?.info?.(`[qqbot:token:${appId}] Background refresh started`);
			while (!signal.aborted) try {
				await this.getAccessToken(appId, clientSecret);
				const cached = this.cache.get(appId);
				if (cached) {
					const expiresIn = cached.expiresAt - Date.now();
					const randomOffset = Math.random() * randomOffsetMs;
					const refreshIn = Math.max(expiresIn - refreshAheadMs - randomOffset, minRefreshIntervalMs);
					this.logger?.debug?.(`[qqbot:token:${appId}] Next refresh in ${Math.round(refreshIn / 1e3)}s`);
					await this.abortableSleep(refreshIn, signal);
				} else await this.abortableSleep(minRefreshIntervalMs, signal);
			} catch (err) {
				if (signal.aborted) break;
				this.logger?.error?.(`[qqbot:token:${appId}] Background refresh failed: ${formatErrorMessage(err)}`);
				await this.abortableSleep(retryDelayMs, signal);
			}
			this.refreshControllers.delete(appId);
			this.logger?.info?.(`[qqbot:token:${appId}] Background refresh stopped`);
		};
		loop().catch((err) => {
			this.refreshControllers.delete(appId);
			this.logger?.error?.(`[qqbot:token:${appId}] Background refresh crashed: ${err}`);
		});
	}
	/** Stop background refresh for one appId, or all. */
	stopBackgroundRefresh(appId) {
		if (appId) {
			const ctrl = this.refreshControllers.get(appId);
			if (ctrl) {
				ctrl.abort();
				this.refreshControllers.delete(appId);
			}
		} else {
			for (const ctrl of this.refreshControllers.values()) ctrl.abort();
			this.refreshControllers.clear();
		}
	}
	/** Check whether background refresh is running. */
	isBackgroundRefreshRunning(appId) {
		if (appId) return this.refreshControllers.has(appId);
		return this.refreshControllers.size > 0;
	}
	async doFetchToken(appId, clientSecret) {
		this.logger?.debug?.(`[qqbot:token:${appId}] >>> POST ${TOKEN_URL}`);
		let response;
		try {
			response = await fetch(TOKEN_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"User-Agent": this.resolveUserAgent()
				},
				body: JSON.stringify({
					appId,
					clientSecret
				})
			});
		} catch (err) {
			this.logger?.error?.(`[qqbot:token:${appId}] Network error: ${formatErrorMessage(err)}`);
			throw new Error(`Network error getting access_token: ${formatErrorMessage(err)}`, { cause: err });
		}
		const traceId = response.headers.get("x-tps-trace-id") ?? "";
		this.logger?.debug?.(`[qqbot:token:${appId}] <<< ${response.status}${traceId ? ` | TraceId: ${traceId}` : ""}`);
		let data;
		try {
			const rawBody = await response.text();
			const logBody = rawBody.replace(/"access_token"\s*:\s*"[^"]+"/g, "\"access_token\": \"***\"");
			this.logger?.debug?.(`[qqbot:token:${appId}] <<< Body: ${logBody}`);
			data = JSON.parse(rawBody);
		} catch (err) {
			throw new Error(`Failed to parse access_token response: ${formatErrorMessage(err)}`, { cause: err });
		}
		if (!data.access_token) throw new Error(`Failed to get access_token: ${JSON.stringify(data)}`);
		const expiresAt = Date.now() + (data.expires_in ?? 7200) * 1e3;
		this.cache.set(appId, {
			token: data.access_token,
			expiresAt,
			appId
		});
		this.logger?.debug?.(`[qqbot:token:${appId}] Cached, expires at: ${new Date(expiresAt).toISOString()}`);
		return data.access_token;
	}
	abortableSleep(ms, signal) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(resolve, ms);
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
		});
	}
};
//#endregion
//#region extensions/qqbot/src/engine/utils/log.ts
/**
* QQBot debug logging utilities.
* QQBot 调试日志工具。
*
* Only outputs when the QQBOT_DEBUG environment variable is set,
* preventing user message content from leaking in production logs.
*
* Self-contained within engine/ — no framework SDK dependency.
*/
const isDebug = () => !!process.env.QQBOT_DEBUG;
/** Debug-level log; only outputs when QQBOT_DEBUG is enabled. */
function debugLog(...args) {
	if (isDebug()) console.log(...args);
}
/** Debug-level warning; only outputs when QQBOT_DEBUG is enabled. */
function debugWarn(...args) {
	if (isDebug()) console.warn(...args);
}
/** Debug-level error; only outputs when QQBOT_DEBUG is enabled. */
function debugError(...args) {
	if (isDebug()) console.error(...args);
}
//#endregion
//#region extensions/qqbot/src/engine/utils/upload-cache.ts
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
//#region extensions/qqbot/src/engine/messaging/media-source.ts
/**
* Unified media-source abstraction for the QQ Bot upload pipeline.
*
* All rich-media entry points (sender.ts#sendMedia, outbound.ts#send*,
* reply-dispatcher.ts#handle*Payload) funnel through {@link normalizeSource}
* before reaching the low-level {@link MediaApi}.
*
* ## Why four branches?
*
* - `url` — remote http(s) URL that the QQ server can fetch directly.
* - `base64` — in-memory base64 string (typically from a `data:` URL).
* - `localPath` — on-disk file; kept as a path so a future chunked-upload
*   implementation can stream it via `fs.createReadStream` without the 4/3×
*   base64 memory overhead.
* - `buffer` — in-memory raw bytes (e.g. TTS output, downloaded url-fallback).
*
* ## Security baseline (localPath branch)
*
* `openLocalFile` is the single canonical implementation of "safely open a
* local file for upload" across the plugin. It merges the previously
* inconsistent strategies from `reply-dispatcher.ts` (O_NOFOLLOW + size check)
* and `outbound.ts` (realpath + root containment). Callers are still
* responsible for *root-whitelist* validation (via
* `resolveQQBotPayloadLocalFilePath` / `resolveOutboundMediaPath`) before
* passing the path in; this function enforces *file-level* safety only.
*
* Chunked upload is not implemented in this PR, but the contract here already
* returns `size` metadata so `sendMediaInternal` can route by size without
* reading the whole file first.
*/
const DATA_URL_RE = /^data:([^;,]+);base64,(.+)$/i;
/**
* Parse a `data:<mime>;base64,<payload>` URL.
*
* Returns `null` when the string is not a data URL or does not declare
* base64 encoding. Non-base64 data URLs are intentionally rejected because
* the QQ upload API ingests raw base64, not arbitrary URL-encoded payloads.
*/
function tryParseDataUrl(value) {
	if (!value.startsWith("data:")) return null;
	const m = value.match(DATA_URL_RE);
	if (!m) return null;
	return {
		mime: m[1],
		data: m[2]
	};
}
/**
* Open a local file for upload with defense-in-depth:
*
* 1. `O_NOFOLLOW` refuses to traverse symlinks (prevents post-whitelist
*    symlink swaps / TOCTOU attacks).
* 2. `fstat` on the opened descriptor — NOT `fs.stat` on the path —
*    so the size check applies to the exact byte stream we will read.
* 3. Rejects non-regular files (sockets / devices / directories).
* 4. Enforces a caller-specified `maxSize` (default {@link MAX_UPLOAD_SIZE})
*    at open time, so oversized files fail fast without allocating a
*    full buffer. Chunked upload callers should pass a larger ceiling
*    (e.g. `CHUNKED_UPLOAD_MAX_SIZE` from `utils/file-utils.js`).
*
* The caller receives the open handle plus validated size and is expected
* to either {@link OpenedLocalFile.handle.readFile} (one-shot path) or
* stream via `fs.createReadStream` (chunked path).
*/
async function openLocalFile(filePath, opts = {}) {
	const maxSize = opts.maxSize ?? 20971520;
	const openFlags = fs$1.constants.O_RDONLY | ("O_NOFOLLOW" in fs$1.constants ? fs$1.constants.O_NOFOLLOW : 0);
	const handle = await fs$1.promises.open(filePath, openFlags);
	try {
		const stat = await handle.stat();
		if (!stat.isFile()) throw new Error("Path is not a regular file");
		if (stat.size > maxSize) throw new Error(`File is too large (${formatFileSize(stat.size)}); QQ Bot API limit is ${formatFileSize(maxSize)}`);
		return {
			handle,
			size: stat.size,
			close: () => handle.close()
		};
	} catch (err) {
		await handle.close().catch(() => void 0);
		throw err;
	}
}
/**
* Normalize a {@link RawMediaSource} into a {@link MediaSource}.
*
* - Strings passed via `{ url }` that start with `data:` are auto-resolved
*   to a `base64` branch (this is the unified `data:` URL support that was
*   previously only implemented in `sendImage`).
* - `localPath` branches open the file with {@link openLocalFile} solely to
*   validate size / regular-file / O_NOFOLLOW invariants. The handle is
*   closed immediately — actual reading is deferred to the uploader so
*   the chunked path can stream without double-reading.
* - `buffer` branches enforce the same ceiling inline.
*
* `maxSize` defaults to {@link MAX_UPLOAD_SIZE} (20MB, one-shot upload limit).
* Callers that dispatch to the chunked uploader should pass a larger ceiling
* (e.g. `CHUNKED_UPLOAD_MAX_SIZE`, or a value derived from
* `getMaxUploadSize(fileType)`).
*
* NOTE: Root-whitelist validation (i.e. "this path must live under the
* allowed QQ Bot media directory") is a caller concern. This function
* assumes the path has already passed such checks.
*/
async function normalizeSource(raw, opts = {}) {
	const maxSize = opts.maxSize ?? 20971520;
	if ("url" in raw) {
		const parsed = tryParseDataUrl(raw.url);
		if (parsed) return {
			kind: "base64",
			data: parsed.data,
			mime: parsed.mime
		};
		return {
			kind: "url",
			url: raw.url
		};
	}
	if ("base64" in raw) return {
		kind: "base64",
		data: raw.base64,
		mime: raw.mime
	};
	if ("localPath" in raw) {
		const opened = await openLocalFile(raw.localPath, { maxSize });
		try {
			return {
				kind: "localPath",
				path: raw.localPath,
				size: opened.size,
				mime: getMimeType(raw.localPath)
			};
		} finally {
			await opened.close();
		}
	}
	if (raw.buffer.length > maxSize) throw new Error(`Buffer is too large (${formatFileSize(raw.buffer.length)}); QQ Bot API limit is ${formatFileSize(maxSize)}`);
	return {
		kind: "buffer",
		buffer: raw.buffer,
		fileName: raw.fileName,
		mime: raw.mime
	};
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/sender.ts
/**
* Unified message sender — per-account resource management + business function layer.
*
* This module is the **single entry point** for all QQ Bot API operations.
*
* ## Architecture
*
* Each account gets its own isolated resource stack:
*
* ```
* _accountRegistry: Map<appId, AccountContext>
*
* AccountContext {
*   logger      — per-account prefixed logger
*   client      — per-account ApiClient
*   tokenMgr    — per-account TokenManager
*   mediaApi    — per-account MediaApi
*   messageApi  — per-account MessageApi
* }
* ```
*
* Upper-layer callers (gateway, outbound, reply-dispatcher, proactive)
* always go through exported functions that resolve the correct
* `AccountContext` by appId.
*/
let _pluginVersion = "unknown";
let _openclawVersion = "unknown";
/** Build the User-Agent string from the current plugin and framework versions. */
function buildUserAgent() {
	return `QQBotPlugin/${_pluginVersion} (Node/${process.versions.node}; ${os.platform()}; OpenClaw/${_openclawVersion})`;
}
/** Return the current User-Agent string. */
function getPluginUserAgent() {
	return buildUserAgent();
}
/**
* Initialize sender with the plugin version.
* Must be called once during startup before any API calls.
*/
function initSender(options) {
	if (options.pluginVersion) _pluginVersion = options.pluginVersion;
	if (options.openclawVersion) _openclawVersion = options.openclawVersion;
}
/** Update the OpenClaw framework version in the User-Agent (called after runtime injection). */
function setOpenClawVersion(version) {
	if (version) _openclawVersion = version;
}
/** Per-appId account registry — each account owns all its resources. */
const _accountRegistry = /* @__PURE__ */ new Map();
/** Fallback logger for unregistered accounts (CLI / test scenarios). */
const _fallbackLogger = {
	info: (msg) => debugLog(msg),
	error: (msg) => debugError(msg),
	warn: (msg) => debugWarn(msg),
	debug: (msg) => debugLog(msg)
};
/**
* Build a full resource stack for a given logger.
*
* Shared by both `registerAccount` (explicit registration) and
* `resolveAccount` (lazy fallback for unregistered accounts).
*/
function buildAccountContext(logger, markdownSupport) {
	const client = new ApiClient({
		logger,
		userAgent: buildUserAgent
	});
	const tokenMgr = new TokenManager({
		logger,
		userAgent: buildUserAgent
	});
	const sharedUploadCache = {
		computeHash: computeFileHash,
		get: (hash, scope, targetId, fileType) => getCachedFileInfo(hash, scope, targetId, fileType),
		set: (hash, scope, targetId, fileType, fileInfo, fileUuid, ttl) => setCachedFileInfo(hash, scope, targetId, fileType, fileInfo, fileUuid, ttl)
	};
	return {
		logger,
		client,
		tokenMgr,
		mediaApi: new MediaApi(client, tokenMgr, {
			logger,
			uploadCache: sharedUploadCache,
			sanitizeFileName
		}),
		chunkedMediaApi: new ChunkedMediaApi(client, tokenMgr, {
			logger,
			uploadCache: sharedUploadCache,
			sanitizeFileName
		}),
		messageApi: new MessageApi(client, tokenMgr, {
			markdownSupport,
			logger
		}),
		markdownSupport
	};
}
/**
* Register an account — atomically sets up all per-appId resources.
*
* Must be called once per account during gateway startup.
* Creates a complete isolated resource stack (ApiClient, TokenManager,
* MediaApi, MessageApi) with the per-account logger.
*/
function registerAccount(appId, options) {
	const key = appId.trim();
	const md = options.markdownSupport === true;
	_accountRegistry.set(key, buildAccountContext(options.logger, md));
}
/**
* Initialize per-app API behavior such as markdown support.
*
* If the account was already registered via `registerAccount()`, updates its
* MessageApi with the new markdown setting while preserving the existing
* logger and resource stack. Otherwise creates a new context.
*/
function initApiConfig(appId, options) {
	const key = appId.trim();
	const md = options.markdownSupport === true;
	const existing = _accountRegistry.get(key);
	if (existing) {
		existing.messageApi = new MessageApi(existing.client, existing.tokenMgr, {
			markdownSupport: md,
			logger: existing.logger
		});
		existing.markdownSupport = md;
	} else _accountRegistry.set(key, buildAccountContext(_fallbackLogger, md));
}
/**
* Resolve the AccountContext for a given appId.
*
* If the account was registered via `registerAccount()`, returns the
* pre-built context. Otherwise lazily creates a fallback context.
*/
function resolveAccount(appId) {
	const key = appId.trim();
	let ctx = _accountRegistry.get(key);
	if (!ctx) {
		ctx = buildAccountContext(_fallbackLogger, false);
		_accountRegistry.set(key, ctx);
	}
	return ctx;
}
/** Get the MessageApi instance for the given appId. */
function getMessageApi(appId) {
	return resolveAccount(appId).messageApi;
}
/** Register an outbound-message hook scoped to one appId. */
function onMessageSent(appId, callback) {
	resolveAccount(appId).messageApi.onMessageSent(callback);
}
async function getAccessToken(appId, clientSecret) {
	return resolveAccount(appId).tokenMgr.getAccessToken(appId, clientSecret);
}
function clearTokenCache(appId) {
	if (appId) resolveAccount(appId).tokenMgr.clearCache(appId);
	else for (const ctx of _accountRegistry.values()) ctx.tokenMgr.clearCache();
}
function startBackgroundTokenRefresh(appId, clientSecret, options) {
	resolveAccount(appId).tokenMgr.startBackgroundRefresh(appId, clientSecret, options);
}
function stopBackgroundTokenRefresh(appId) {
	if (appId) resolveAccount(appId).tokenMgr.stopBackgroundRefresh(appId);
	else for (const ctx of _accountRegistry.values()) ctx.tokenMgr.stopBackgroundRefresh();
}
async function getGatewayUrl(accessToken, appId) {
	return (await resolveAccount(appId).client.request(accessToken, "GET", "/gateway")).url;
}
/** Acknowledge an INTERACTION_CREATE event via PUT /interactions/{id}. */
async function acknowledgeInteraction(creds, interactionId, code = 0, data) {
	const ctx = resolveAccount(creds.appId);
	const token = await ctx.tokenMgr.getAccessToken(creds.appId, creds.clientSecret);
	await ctx.client.request(token, "PUT", `/interactions/${interactionId}`, {
		code,
		...data ? { data } : {}
	});
}
/**
* Execute an API call with automatic token-retry on 401 errors.
*
* Primary signal is structured: `ApiError.httpStatus === 401`. A string
* fallback remains for non-`ApiError` paths (e.g. synthetic errors from
* custom adapters), but logs a warning so such cases can be surfaced.
*/
async function withTokenRetry(creds, sendFn, log, _accountId) {
	try {
		return await sendFn(await getAccessToken(creds.appId, creds.clientSecret));
	} catch (err) {
		if (err instanceof ApiError && err.httpStatus === 401) {
			log?.debug?.(`Token expired (ApiError 401), refreshing...`);
			clearTokenCache(creds.appId);
			return await sendFn(await getAccessToken(creds.appId, creds.clientSecret));
		}
		const errMsg = formatErrorMessage(err);
		if (errMsg.includes("401") || errMsg.includes("token") || errMsg.includes("access_token")) {
			log?.warn?.(`Token retry triggered by string heuristic (err is not ApiError). Consider propagating ApiError end-to-end. msg=${errMsg.slice(0, 120)}`);
			clearTokenCache(creds.appId);
			return await sendFn(await getAccessToken(creds.appId, creds.clientSecret));
		}
		throw err;
	}
}
/**
* Notify the MessageApi onMessageSent hook after a media send.
*/
function notifyMediaHook(appId, result, meta) {
	const refIdx = result.ext_info?.ref_idx;
	if (refIdx) resolveAccount(appId).messageApi.notifyMessageSent(refIdx, meta);
}
/**
* Send a text message to any QQ target type.
*
* Automatically routes to the correct API method based on target type.
* Handles passive (with msgId) and proactive (without msgId) modes.
*/
async function sendText(target, content, creds, opts) {
	const api = resolveAccount(creds.appId).messageApi;
	const c = {
		appId: creds.appId,
		clientSecret: creds.clientSecret
	};
	if (target.type === "c2c" || target.type === "group") {
		const scope = target.type;
		if (opts?.msgId) return api.sendMessage(scope, target.id, content, c, {
			msgId: opts.msgId,
			messageReference: opts.messageReference
		});
		return api.sendProactiveMessage(scope, target.id, content, c);
	}
	if (target.type === "dm") return api.sendDmMessage({
		guildId: target.id,
		content,
		creds: c,
		msgId: opts?.msgId
	});
	return api.sendChannelMessage({
		channelId: target.id,
		content,
		creds: c,
		msgId: opts?.msgId
	});
}
/**
* Send a typing indicator to a C2C user.
*/
async function sendInputNotify(opts) {
	const api = resolveAccount(opts.creds.appId).messageApi;
	const c = {
		appId: opts.creds.appId,
		clientSecret: opts.creds.clientSecret
	};
	return api.sendInputNotify({
		openid: opts.openid,
		creds: c,
		msgId: opts.msgId,
		inputSecond: opts.inputSecond
	});
}
/**
* Raw-token input notify — compatible with TypingKeepAlive's callback signature.
*/
function createRawInputNotifyFn(appId) {
	return async (token, openid, msgId, inputSecond) => {
		const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
		return resolveAccount(appId).client.request(token, "POST", `/v2/users/${openid}/messages`, {
			msg_type: 6,
			input_notify: {
				input_type: 1,
				input_second: inputSecond
			},
			msg_seq: msgSeq,
			...msgId ? { msg_id: msgId } : {}
		});
	};
}
/** Map a {@link MediaKind} to the wire-level {@link MediaFileType} code. */
const KIND_TO_FILE_TYPE = {
	image: 1,
	voice: 3,
	video: 2,
	file: 4
};
/**
* Upload and send a rich-media message to any C2C or Group target.
*
* This is the **single** rich-media entry point for the plugin. All adapter
* layers (outbound.ts, reply-dispatcher.ts, outbound-deliver.ts,
* bridge/commands, gateway/outbound-dispatch.ts) funnel through here.
*
* Dispatch structure:
*
* ```
* sendMedia(opts)
*   └─ sendMediaInternal(ctx, opts)
*        ├─ normalizeSource  ← unified data:URL parsing + O_NOFOLLOW file safety
*        ├─ uploadOnce       ← one-shot upload via MediaApi (chunked hook TBD)
*        ├─ sendMediaMessage
*        └─ notifyMediaHook  ← meta assembled per kind
* ```
*
* Future chunked upload will slot into the dispatch without touching callers.
*/
async function sendMedia(opts) {
	if (!supportsRichMedia(opts.target.type)) throw new Error(`Media sending not supported for target type: ${opts.target.type}`);
	return sendMediaInternal(resolveAccount(opts.creds.appId), opts);
}
/**
* Assemble an {@link OutboundMeta} record from the normalized source and the
* caller-provided overrides.
*
* The meta layout is identical across kinds except:
* - `image` / `video` carry `text` (the accompanying content string).
* - `voice` carries `ttsText` (original TTS input, if any).
*/
function buildOutboundMeta(opts, source) {
	const meta = { mediaType: opts.kind };
	if (opts.kind === "image" || opts.kind === "video") {
		if (opts.content) meta.text = opts.content;
	}
	if (opts.kind === "voice" && opts.ttsText) meta.ttsText = opts.ttsText;
	const inferredUrl = source.kind === "url" ? source.url : void 0;
	const mediaUrl = opts.origUrlForMeta ?? inferredUrl;
	if (mediaUrl) meta.mediaUrl = mediaUrl;
	const inferredLocal = source.kind === "localPath" ? source.path : void 0;
	const mediaLocalPath = opts.localPathForMeta ?? inferredLocal;
	if (mediaLocalPath) meta.mediaLocalPath = mediaLocalPath;
	return meta;
}
/**
* Core dispatch for rich media. Not exported — callers must go through
* {@link sendMedia}.
*
* Upload dispatch lives in {@link dispatchUpload}: sources smaller than
* {@link LARGE_FILE_THRESHOLD} (or not supporting chunked transport, i.e.
* url/base64) go to {@link MediaApi.uploadMedia}; larger `localPath` /
* `buffer` sources go to {@link ChunkedMediaApi.uploadChunked}.
*/
async function sendMediaInternal(ctx, opts) {
	const scope = opts.target.type;
	const c = {
		appId: opts.creds.appId,
		clientSecret: opts.creds.clientSecret
	};
	const source = await normalizeSource(opts.source, { maxSize: Number.MAX_SAFE_INTEGER });
	const uploadResult = await dispatchUpload(ctx, scope, opts.target.id, KIND_TO_FILE_TYPE[opts.kind], source, c, opts.fileName);
	const msgContent = opts.kind === "image" || opts.kind === "video" ? opts.content : void 0;
	const result = await ctx.mediaApi.sendMediaMessage(scope, opts.target.id, uploadResult.file_info, c, {
		msgId: opts.msgId,
		content: msgContent
	});
	notifyMediaHook(opts.creds.appId, result, buildOutboundMeta(opts, source));
	return result;
}
/**
* Upload a {@link MediaSource} via the one-shot or chunked path, chosen by
* size + kind.
*
* Routing rules (kept here as the single source of truth so callers need
* not know which endpoint was used):
*
* - `url` / `base64`: always one-shot — the server accepts these directly
*   and the chunked endpoint has no representation for them.
* - `localPath` / `buffer` with `size >= LARGE_FILE_THRESHOLD`: chunked.
* - Everything else: one-shot.
*/
async function dispatchUpload(ctx, scope, targetId, fileType, source, creds, fileName) {
	switch (source.kind) {
		case "url": return ctx.mediaApi.uploadMedia(scope, targetId, fileType, creds, {
			url: source.url,
			fileName
		});
		case "base64": return ctx.mediaApi.uploadMedia(scope, targetId, fileType, creds, {
			fileData: source.data,
			fileName
		});
		case "localPath":
			if (source.size >= 5242880) return ctx.chunkedMediaApi.uploadChunked({
				scope,
				targetId,
				fileType,
				source,
				creds,
				fileName
			});
			return ctx.mediaApi.uploadMedia(scope, targetId, fileType, creds, {
				localPath: source.path,
				fileName
			});
		case "buffer":
			if (source.buffer.length >= 5242880) return ctx.chunkedMediaApi.uploadChunked({
				scope,
				targetId,
				fileType,
				source,
				creds,
				fileName: fileName ?? source.fileName
			});
			return ctx.mediaApi.uploadMedia(scope, targetId, fileType, creds, {
				buffer: source.buffer,
				fileName: fileName ?? source.fileName
			});
		default: throw new Error(`dispatchUpload: unsupported MediaSource kind: ${JSON.stringify(source)}`);
	}
}
/** Build a DeliveryTarget from event context fields. */
function buildDeliveryTarget(event) {
	switch (event.type) {
		case "c2c": return {
			type: "c2c",
			id: event.senderId
		};
		case "group": return {
			type: "group",
			id: event.groupOpenid
		};
		case "dm": return {
			type: "dm",
			id: event.guildId
		};
		default: return {
			type: "channel",
			id: event.channelId
		};
	}
}
/** Build AccountCreds from a GatewayAccount. */
function accountToCreds(account) {
	return {
		appId: account.appId,
		clientSecret: account.clientSecret
	};
}
/** Check whether a target type supports rich media (C2C and Group only). */
function supportsRichMedia(targetType) {
	return targetType === "c2c" || targetType === "group";
}
//#endregion
export { fileExistsAsync as A, StreamInputState as B, debugLog as C, UPLOAD_PREPARE_FALLBACK_CODE as D, getNextMsgSeq as E, readFileAsync as F, formatDuration as I, formatErrorMessage as L, getFileTypeName as M, getImageMimeType as N, checkFileSize as O, getMaxUploadSize as P, StreamContentType as R, debugError as S, UploadDailyLimitExceededError as T, setOpenClawVersion as _, createRawInputNotifyFn as a, withTokenRetry as b, getMessageApi as c, initSender as d, onMessageSent as f, sendText as g, sendMedia as h, clearTokenCache as i, formatFileSize as j, downloadFile as k, getPluginUserAgent as l, sendInputNotify as m, acknowledgeInteraction as n, getAccessToken as o, registerAccount as p, buildDeliveryTarget as r, getGatewayUrl as s, accountToCreds as t, initApiConfig as u, startBackgroundTokenRefresh as v, debugWarn as w, openLocalFile as x, stopBackgroundTokenRefresh as y, StreamInputMode as z };
