import { s as sanitizeFileName } from "./string-normalize-C6Z4K8Fh.js";
import os from "node:os";
import * as crypto$1 from "node:crypto";
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
		const isFileUpload = path.includes("/files");
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
			await sleep(delay);
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
		await sleep(actualDelay);
	}
	logger?.error?.(`[qqbot:retry] Persistent retry timed out after ${policy.timeoutMs / 1e3}s (${attempt} attempts)`);
	throw lastError ?? /* @__PURE__ */ new Error(`Persistent retry timed out (${policy.timeoutMs / 1e3}s)`);
}
function sleep(ms) {
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
//#region extensions/qqbot/src/engine/api/media.ts
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
	* Upload media via base64 or URL to a C2C or Group target.
	*
	* @param scope - `'c2c'` or `'group'`.
	* @param targetId - User openid or group openid.
	* @param fileType - Media file type code.
	* @param creds - Authentication credentials.
	* @param opts - Upload options.
	* @returns Upload result containing `file_info` for subsequent message sends.
	*/
	async uploadMedia(scope, targetId, fileType, creds, opts) {
		if (!opts.url && !opts.fileData) throw new Error(`uploadMedia: url or fileData is required`);
		if (opts.fileData && this.cache) {
			const hash = this.cache.computeHash(opts.fileData);
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
		else if (opts.fileData) body.file_data = opts.fileData;
		if (fileType === 4 && opts.fileName) body.file_name = this.sanitize(opts.fileName);
		const token = await this.tokenManager.getAccessToken(creds.appId, creds.clientSecret);
		const path = mediaUploadPath(scope, targetId);
		const result = await withRetry(() => this.client.request(token, "POST", path, body, { redactBodyKeys: ["file_data"] }), UPLOAD_RETRY_POLICY, void 0, this.logger);
		if (opts.fileData && result.file_info && result.ttl > 0 && this.cache) {
			const hash = this.cache.computeHash(opts.fileData);
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
		const path = scope === "c2c" ? `/v2/users/${targetId}/messages` : `/v2/groups/${targetId}/messages`;
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
	return {
		logger,
		client,
		tokenMgr,
		mediaApi: new MediaApi(client, tokenMgr, {
			logger,
			uploadCache: {
				computeHash: computeFileHash,
				get: (hash, scope, targetId, fileType) => getCachedFileInfo(hash, scope, targetId, fileType),
				set: (hash, scope, targetId, fileType, fileInfo, fileUuid, ttl) => setCachedFileInfo(hash, scope, targetId, fileType, fileInfo, fileUuid, ttl)
			},
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
async function acknowledgeInteraction(creds, interactionId, code = 0) {
	const ctx = resolveAccount(creds.appId);
	const token = await ctx.tokenMgr.getAccessToken(creds.appId, creds.clientSecret);
	await ctx.client.request(token, "PUT", `/interactions/${interactionId}`, { code });
}
/**
* Execute an API call with automatic token-retry on 401 errors.
*/
async function withTokenRetry(creds, sendFn, log, _accountId) {
	try {
		return await sendFn(await getAccessToken(creds.appId, creds.clientSecret));
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		if (errMsg.includes("401") || errMsg.includes("token") || errMsg.includes("access_token")) {
			log?.debug?.(`Token may be expired, refreshing...`);
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
/**
* Upload and send an image message to any C2C/Group target.
*/
async function sendImage(target, imageUrl, creds, opts) {
	if (target.type !== "c2c" && target.type !== "group") throw new Error(`Image sending not supported for target type: ${target.type}`);
	const ctx = resolveAccount(creds.appId);
	const scope = target.type;
	const c = {
		appId: creds.appId,
		clientSecret: creds.clientSecret
	};
	const isBase64 = imageUrl.startsWith("data:");
	let uploadOpts;
	if (isBase64) {
		const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
		if (!matches) throw new Error("Invalid Base64 Data URL format");
		uploadOpts = { fileData: matches[2] };
	} else uploadOpts = { url: imageUrl };
	const uploadResult = await ctx.mediaApi.uploadMedia(scope, target.id, 1, c, uploadOpts);
	const meta = {
		text: opts?.content,
		mediaType: "image",
		...!isBase64 ? { mediaUrl: imageUrl } : {},
		...opts?.localPath ? { mediaLocalPath: opts.localPath } : {}
	};
	const result = await ctx.mediaApi.sendMediaMessage(scope, target.id, uploadResult.file_info, c, {
		msgId: opts?.msgId,
		content: opts?.content
	});
	notifyMediaHook(creds.appId, result, meta);
	return result;
}
/**
* Upload and send a voice message.
*/
async function sendVoiceMessage(target, creds, opts) {
	if (target.type !== "c2c" && target.type !== "group") throw new Error(`Voice sending not supported for target type: ${target.type}`);
	const ctx = resolveAccount(creds.appId);
	const scope = target.type;
	const c = {
		appId: creds.appId,
		clientSecret: creds.clientSecret
	};
	const uploadResult = await ctx.mediaApi.uploadMedia(scope, target.id, 3, c, {
		url: opts.voiceUrl,
		fileData: opts.voiceBase64
	});
	const result = await ctx.mediaApi.sendMediaMessage(scope, target.id, uploadResult.file_info, c, { msgId: opts.msgId });
	notifyMediaHook(creds.appId, result, {
		mediaType: "voice",
		...opts.ttsText ? { ttsText: opts.ttsText } : {},
		...opts.filePath ? { mediaLocalPath: opts.filePath } : {}
	});
	return result;
}
/**
* Upload and send a video message.
*/
async function sendVideoMessage(target, creds, opts) {
	if (target.type !== "c2c" && target.type !== "group") throw new Error(`Video sending not supported for target type: ${target.type}`);
	const ctx = resolveAccount(creds.appId);
	const scope = target.type;
	const c = {
		appId: creds.appId,
		clientSecret: creds.clientSecret
	};
	const uploadResult = await ctx.mediaApi.uploadMedia(scope, target.id, 2, c, {
		url: opts.videoUrl,
		fileData: opts.videoBase64
	});
	const result = await ctx.mediaApi.sendMediaMessage(scope, target.id, uploadResult.file_info, c, {
		msgId: opts.msgId,
		content: opts.content
	});
	notifyMediaHook(creds.appId, result, {
		text: opts.content,
		mediaType: "video",
		...opts.videoUrl ? { mediaUrl: opts.videoUrl } : {},
		...opts.localPath ? { mediaLocalPath: opts.localPath } : {}
	});
	return result;
}
/**
* Upload and send a file message.
*/
async function sendFileMessage(target, creds, opts) {
	if (target.type !== "c2c" && target.type !== "group") throw new Error(`File sending not supported for target type: ${target.type}`);
	const ctx = resolveAccount(creds.appId);
	const scope = target.type;
	const c = {
		appId: creds.appId,
		clientSecret: creds.clientSecret
	};
	const uploadResult = await ctx.mediaApi.uploadMedia(scope, target.id, 4, c, {
		url: opts.fileUrl,
		fileData: opts.fileBase64,
		fileName: opts.fileName
	});
	const result = await ctx.mediaApi.sendMediaMessage(scope, target.id, uploadResult.file_info, c, { msgId: opts.msgId });
	notifyMediaHook(creds.appId, result, {
		mediaType: "file",
		mediaUrl: opts.fileUrl,
		mediaLocalPath: opts.localFilePath ?? opts.fileName
	});
	return result;
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
//#endregion
export { withTokenRetry as C, formatDuration as D, debugWarn as E, formatErrorMessage as O, stopBackgroundTokenRefresh as S, debugLog as T, sendText as _, createRawInputNotifyFn as a, setOpenClawVersion as b, getMessageApi as c, initSender as d, onMessageSent as f, sendInputNotify as g, sendImage as h, clearTokenCache as i, getPluginUserAgent as l, sendFileMessage as m, acknowledgeInteraction as n, getAccessToken as o, registerAccount as p, buildDeliveryTarget as r, getGatewayUrl as s, accountToCreds as t, initApiConfig as u, sendVideoMessage as v, debugError as w, startBackgroundTokenRefresh as x, sendVoiceMessage as y };
