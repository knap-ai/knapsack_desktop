import { t as normalizeDiscordToken } from "./token-D-w3Rigl.js";
import { i as mergeDiscordAccountConfig, o as resolveDiscordAccount } from "./accounts-zcI4mtzH.js";
import { isRecord, normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { normalizeAccountId } from "openclaw/plugin-sdk/routing";
import { ChannelType, PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { DiscordError, Embed, RateLimitError, RequestClient, serializePayload } from "@buape/carbon";
import { PollLayoutType } from "discord-api-types/payloads/v10";
import { buildOutboundMediaLoadOptions, extensionForMime, normalizePollDurationHours, normalizePollInput } from "openclaw/plugin-sdk/media-runtime";
import { resolveTextChunksWithFallback } from "openclaw/plugin-sdk/reply-payload";
import { loadWebMedia } from "openclaw/plugin-sdk/web-media";
import { chunkMarkdownTextWithMode } from "openclaw/plugin-sdk/reply-chunking";
import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import { isIP } from "node:net";
import { makeProxyFetch } from "openclaw/plugin-sdk/infra-runtime";
import { danger } from "openclaw/plugin-sdk/runtime-env";
import { createRateLimitRetryRunner } from "openclaw/plugin-sdk/retry-runtime";
//#region extensions/discord/src/chunk.ts
const DEFAULT_MAX_CHARS = 2e3;
const DEFAULT_MAX_LINES = 17;
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
function countLines(text) {
	if (!text) return 0;
	return text.split("\n").length;
}
function parseFenceLine(line) {
	const match = line.match(FENCE_RE);
	if (!match) return null;
	const indent = match[1] ?? "";
	const marker = match[2] ?? "";
	return {
		indent,
		markerChar: marker[0] ?? "`",
		markerLen: marker.length,
		openLine: line
	};
}
function closeFenceLine(openFence) {
	return `${openFence.indent}${openFence.markerChar.repeat(openFence.markerLen)}`;
}
function closeFenceIfNeeded(text, openFence) {
	if (!openFence) return text;
	const closeLine = closeFenceLine(openFence);
	if (!text) return closeLine;
	if (!text.endsWith("\n")) return `${text}\n${closeLine}`;
	return `${text}${closeLine}`;
}
function splitLongLine(line, maxChars, opts) {
	const limit = Math.max(1, Math.floor(maxChars));
	if (line.length <= limit) return [line];
	const out = [];
	let remaining = line;
	while (remaining.length > limit) {
		if (opts.preserveWhitespace) {
			out.push(remaining.slice(0, limit));
			remaining = remaining.slice(limit);
			continue;
		}
		const window = remaining.slice(0, limit);
		let breakIdx = -1;
		for (let i = window.length - 1; i >= 0; i--) if (/\s/.test(window[i])) {
			breakIdx = i;
			break;
		}
		if (breakIdx <= 0) breakIdx = limit;
		out.push(remaining.slice(0, breakIdx));
		remaining = remaining.slice(breakIdx);
	}
	if (remaining.length) out.push(remaining);
	return out;
}
/**
* Chunks outbound Discord text by both character count and (soft) line count,
* while keeping fenced code blocks balanced across chunks.
*/
function chunkDiscordText(text, opts = {}) {
	const maxChars = Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS));
	const maxLines = Math.max(1, Math.floor(opts.maxLines ?? DEFAULT_MAX_LINES));
	const body = text ?? "";
	if (!body) return [];
	if (body.length <= maxChars && countLines(body) <= maxLines) return [body];
	const lines = body.split("\n");
	const chunks = [];
	let current = "";
	let currentLines = 0;
	let openFence = null;
	const flush = () => {
		if (!current) return;
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
		current = "";
		currentLines = 0;
		if (openFence) {
			current = openFence.openLine;
			currentLines = 1;
		}
	};
	for (const originalLine of lines) {
		const fenceInfo = parseFenceLine(originalLine);
		const wasInsideFence = openFence !== null;
		let nextOpenFence = openFence;
		if (fenceInfo) {
			if (!openFence) nextOpenFence = fenceInfo;
			else if (openFence.markerChar === fenceInfo.markerChar && fenceInfo.markerLen >= openFence.markerLen) nextOpenFence = null;
		}
		const reserveChars = nextOpenFence ? closeFenceLine(nextOpenFence).length + 1 : 0;
		const reserveLines = nextOpenFence ? 1 : 0;
		const effectiveMaxChars = maxChars - reserveChars;
		const effectiveMaxLines = maxLines - reserveLines;
		const charLimit = effectiveMaxChars > 0 ? effectiveMaxChars : maxChars;
		const lineLimit = effectiveMaxLines > 0 ? effectiveMaxLines : maxLines;
		const prefixLen = current.length > 0 ? current.length + 1 : 0;
		const segments = splitLongLine(originalLine, Math.max(1, charLimit - prefixLen), { preserveWhitespace: wasInsideFence });
		for (let segIndex = 0; segIndex < segments.length; segIndex++) {
			const segment = segments[segIndex];
			const isLineContinuation = segIndex > 0;
			const addition = `${isLineContinuation ? "" : current.length > 0 ? "\n" : ""}${segment}`;
			const nextLen = current.length + addition.length;
			const nextLines = currentLines + (isLineContinuation ? 0 : 1);
			if ((nextLen > charLimit || nextLines > lineLimit) && current.length > 0) flush();
			if (current.length > 0) {
				current += addition;
				if (!isLineContinuation) currentLines += 1;
			} else {
				current = segment;
				currentLines = 1;
			}
		}
		openFence = nextOpenFence;
	}
	if (current.length) {
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
	}
	return rebalanceReasoningItalics(text, chunks);
}
function chunkDiscordTextWithMode(text, opts) {
	if ((opts.chunkMode ?? "length") !== "newline") return chunkDiscordText(text, opts);
	const lineChunks = chunkMarkdownTextWithMode(text, Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS)), "newline");
	const chunks = [];
	for (const line of lineChunks) {
		const nested = chunkDiscordText(line, opts);
		if (!nested.length && line) {
			chunks.push(line);
			continue;
		}
		chunks.push(...nested);
	}
	return chunks;
}
function rebalanceReasoningItalics(source, chunks) {
	if (chunks.length <= 1) return chunks;
	if (!(source.startsWith("Reasoning:\n_") && source.trimEnd().endsWith("_"))) return chunks;
	const adjusted = [...chunks];
	for (let i = 0; i < adjusted.length; i++) {
		const isLast = i === adjusted.length - 1;
		const current = adjusted[i];
		if (!current.trimEnd().endsWith("_")) adjusted[i] = `${current}_`;
		if (isLast) break;
		const next = adjusted[i + 1];
		const leadingWhitespaceLen = next.length - next.trimStart().length;
		const leadingWhitespace = next.slice(0, leadingWhitespaceLen);
		const nextBody = next.slice(leadingWhitespaceLen);
		if (!nextBody.startsWith("_")) adjusted[i + 1] = `${leadingWhitespace}_${nextBody}`;
	}
	return adjusted;
}
//#endregion
//#region extensions/discord/src/proxy-fetch.ts
function resolveDiscordProxyUrl(account, cfg) {
	const accountProxy = account.config.proxy?.trim();
	if (accountProxy) return accountProxy;
	const channelProxy = cfg?.channels?.discord?.proxy;
	if (typeof channelProxy !== "string") return;
	return channelProxy.trim() || void 0;
}
function resolveDiscordProxyFetchByUrl(proxyUrl, runtime) {
	return withValidatedDiscordProxy(proxyUrl, runtime, (proxy) => makeProxyFetch(proxy));
}
function resolveDiscordProxyFetchForAccount(account, cfg, runtime) {
	return resolveDiscordProxyFetchByUrl(resolveDiscordProxyUrl(account, cfg), runtime);
}
function withValidatedDiscordProxy(proxyUrl, runtime, createValue) {
	const proxy = proxyUrl?.trim();
	if (!proxy) return;
	try {
		validateDiscordProxyUrl(proxy);
		return createValue(proxy);
	} catch (err) {
		runtime?.error?.(danger(`discord: invalid rest proxy: ${String(err)}`));
		return;
	}
}
function validateDiscordProxyUrl(proxyUrl) {
	let parsed;
	try {
		parsed = new URL(proxyUrl);
	} catch {
		throw new Error("Proxy URL must be a valid http or https URL");
	}
	if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Proxy URL must use http or https");
	if (!isLoopbackProxyHostname(parsed.hostname)) throw new Error("Proxy URL must target a loopback host");
	return proxyUrl;
}
function isLoopbackProxyHostname(hostname) {
	const normalized = normalizeLowercaseStringOrEmpty(hostname);
	if (!normalized) return false;
	const bracketless = normalized.startsWith("[") && normalized.endsWith("]") ? normalized.slice(1, -1) : normalized;
	if (bracketless === "localhost") return true;
	const ipFamily = isIP(bracketless);
	if (ipFamily === 4) return bracketless.startsWith("127.");
	if (ipFamily === 6) return bracketless === "::1" || bracketless === "0:0:0:0:0:0:0:1";
	return false;
}
//#endregion
//#region extensions/discord/src/proxy-request-client.ts
const defaultOptions = {
	tokenHeader: "Bot",
	baseUrl: "https://discord.com/api",
	apiVersion: 10,
	userAgent: "DiscordBot (https://github.com/buape/carbon, v0.0.0)",
	timeout: 15e3,
	queueRequests: true,
	maxQueueSize: 1e3,
	runtimeProfile: "persistent",
	scheduler: {}
};
function getMultipartFiles(payload) {
	if (!isRecord(payload)) return [];
	const directFiles = payload.files;
	if (Array.isArray(directFiles)) return directFiles;
	const nestedData = payload.data;
	if (!isRecord(nestedData)) return [];
	const nestedFiles = nestedData.files;
	return Array.isArray(nestedFiles) ? nestedFiles : [];
}
function isMultipartPayload(payload) {
	return getMultipartFiles(payload).length > 0;
}
function toRateLimitBody(parsedBody, rawBody, headers) {
	if (isRecord(parsedBody)) {
		const message = typeof parsedBody.message === "string" ? parsedBody.message : void 0;
		const retryAfter = typeof parsedBody.retry_after === "number" ? parsedBody.retry_after : void 0;
		const global = typeof parsedBody.global === "boolean" ? parsedBody.global : void 0;
		if (message !== void 0 && retryAfter !== void 0 && global !== void 0) return {
			message,
			retry_after: retryAfter,
			global
		};
	}
	const retryAfterHeader = headers.get("Retry-After");
	return {
		message: typeof parsedBody === "string" ? parsedBody : rawBody || "You are being rate limited.",
		retry_after: retryAfterHeader && !Number.isNaN(Number(retryAfterHeader)) ? Number(retryAfterHeader) : 1,
		global: headers.get("X-RateLimit-Scope") === "global"
	};
}
function createRateLimitErrorCompat(response, body, request) {
	return new RateLimitError(response, body, request);
}
function toDiscordErrorBody(parsedBody, rawBody) {
	if (isRecord(parsedBody) && typeof parsedBody.message === "string") return parsedBody;
	return { message: typeof parsedBody === "string" ? parsedBody : rawBody || "Discord request failed" };
}
function toBlobPart(value) {
	if (value instanceof ArrayBuffer || typeof value === "string") return value;
	if (ArrayBuffer.isView(value)) {
		const copied = new Uint8Array(value.byteLength);
		copied.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
		return copied;
	}
	if (value instanceof Blob) return value;
	return String(value);
}
var ProxyRequestClientCompat = class {
	constructor(token, options) {
		this.queue = [];
		this.abortController = null;
		this.processingQueue = false;
		this.routeBuckets = /* @__PURE__ */ new Map();
		this.bucketStates = /* @__PURE__ */ new Map();
		this.globalRateLimitUntil = 0;
		this.token = token;
		this.options = {
			...defaultOptions,
			...options
		};
		this.customFetch = options?.fetch;
	}
	async get(path, query) {
		return await this.request("GET", path, { query });
	}
	async post(path, data, query) {
		return await this.request("POST", path, {
			data,
			query
		});
	}
	async patch(path, data, query) {
		return await this.request("PATCH", path, {
			data,
			query
		});
	}
	async put(path, data, query) {
		return await this.request("PUT", path, {
			data,
			query
		});
	}
	async delete(path, data, query) {
		return await this.request("DELETE", path, {
			data,
			query
		});
	}
	clearQueue() {
		this.queue.length = 0;
	}
	get queueSize() {
		return this.queue.length;
	}
	abortAllRequests() {
		this.abortController?.abort();
		this.abortController = null;
	}
	async request(method, path, params) {
		const routeKey = this.getRouteKey(method, path);
		if (this.options.queueRequests) {
			if (typeof this.options.maxQueueSize === "number" && this.options.maxQueueSize > 0 && this.queue.length >= this.options.maxQueueSize) {
				const stats = this.queue.reduce((acc, item) => {
					const count = (acc.counts.get(item.routeKey) ?? 0) + 1;
					acc.counts.set(item.routeKey, count);
					if (count > acc.topCount) {
						acc.topCount = count;
						acc.topRoute = item.routeKey;
					}
					return acc;
				}, {
					counts: new Map([[routeKey, 1]]),
					topRoute: routeKey,
					topCount: 1
				});
				throw new Error(`Request queue is full (${this.queue.length} / ${this.options.maxQueueSize}), you should implement a queuing system in your requests or raise the queue size in Carbon. Top offender: ${stats.topRoute}`);
			}
			return await new Promise((resolve, reject) => {
				this.queue.push({
					method,
					path,
					data: params.data,
					query: params.query,
					resolve,
					reject,
					routeKey
				});
				this.processQueue();
			});
		}
		return await new Promise((resolve, reject) => {
			this.executeRequest({
				method,
				path,
				data: params.data,
				query: params.query,
				resolve,
				reject,
				routeKey
			}).then(resolve).catch(reject);
		});
	}
	async executeRequest(request) {
		const { method, path, data, query, routeKey } = request;
		await this.waitForBucket(routeKey);
		const queryString = query ? `?${Object.entries(query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")}` : "";
		const url = `${this.options.baseUrl}${path}${queryString}`;
		const originalRequest = new Request(url, { method });
		const headers = this.token === "webhook" ? new Headers() : new Headers({ Authorization: `${this.options.tokenHeader} ${this.token}` });
		if (data?.headers) for (const [key, value] of Object.entries(data.headers)) headers.set(key, value);
		this.abortController = new AbortController();
		const timeoutMs = typeof this.options.timeout === "number" && this.options.timeout > 0 ? this.options.timeout : void 0;
		let body;
		if (data?.body && isMultipartPayload(data.body)) {
			const payload = data.body;
			const normalizedBody = typeof payload === "string" ? {
				content: payload,
				attachments: []
			} : {
				...payload,
				attachments: []
			};
			const formData = new FormData();
			const files = getMultipartFiles(payload);
			for (const [index, file] of files.entries()) {
				const normalizedFileData = file.data instanceof Blob ? file.data : new Blob([toBlobPart(file.data)]);
				formData.append(`files[${index}]`, normalizedFileData, file.name);
				normalizedBody.attachments.push({
					id: index,
					filename: file.name,
					description: file.description
				});
			}
			const cleanedBody = {
				...normalizedBody,
				files: void 0
			};
			formData.append("payload_json", JSON.stringify(cleanedBody));
			body = formData;
		} else if (data?.body != null) {
			headers.set("Content-Type", "application/json");
			body = data.rawBody ? data.body : JSON.stringify(data.body);
		}
		let timeoutId;
		if (timeoutMs !== void 0) timeoutId = setTimeout(() => {
			this.abortController?.abort();
		}, timeoutMs);
		let response;
		try {
			response = await (this.customFetch ?? globalThis.fetch)(url, {
				method,
				headers,
				body,
				signal: this.abortController.signal
			});
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}
		let rawBody = "";
		let parsedBody;
		try {
			rawBody = await response.text();
		} catch {
			rawBody = "";
		}
		if (rawBody.length > 0) try {
			parsedBody = JSON.parse(rawBody);
		} catch {
			parsedBody = void 0;
		}
		if (response.status === 429) {
			const rateLimitBody = toRateLimitBody(parsedBody, rawBody, response.headers);
			const rateLimitError = createRateLimitErrorCompat(response, rateLimitBody, originalRequest);
			this.scheduleRateLimit(routeKey, rateLimitError.retryAfter, rateLimitError.scope === "global");
			throw rateLimitError;
		}
		this.updateBucketFromHeaders(routeKey, response.headers);
		if (!response.ok) throw new DiscordError(response, toDiscordErrorBody(parsedBody, rawBody));
		return parsedBody ?? rawBody;
	}
	async processQueue() {
		if (this.processingQueue) return;
		this.processingQueue = true;
		try {
			while (this.queue.length > 0) {
				const request = this.queue.shift();
				if (!request) continue;
				try {
					const result = await this.executeRequest(request);
					request.resolve(result);
				} catch (error) {
					if (error instanceof RateLimitError && this.options.queueRequests) {
						this.queue.unshift(request);
						continue;
					}
					request.reject(error);
				}
			}
		} finally {
			this.processingQueue = false;
		}
	}
	async waitForBucket(routeKey) {
		while (true) {
			const now = Date.now();
			if (this.globalRateLimitUntil > now) {
				await new Promise((resolve) => setTimeout(resolve, this.globalRateLimitUntil - now));
				continue;
			}
			const bucketKey = this.routeBuckets.get(routeKey);
			const bucketUntil = bucketKey ? this.bucketStates.get(bucketKey) ?? 0 : 0;
			if (bucketUntil > now) {
				await new Promise((resolve) => setTimeout(resolve, bucketUntil - now));
				continue;
			}
			return;
		}
	}
	scheduleRateLimit(routeKey, retryAfterSeconds, global) {
		const resetAt = Date.now() + Math.ceil(retryAfterSeconds * 1e3);
		if (global) {
			this.globalRateLimitUntil = Math.max(this.globalRateLimitUntil, resetAt);
			return;
		}
		const bucketKey = this.routeBuckets.get(routeKey) ?? routeKey;
		this.routeBuckets.set(routeKey, bucketKey);
		this.bucketStates.set(bucketKey, Math.max(this.bucketStates.get(bucketKey) ?? 0, resetAt));
	}
	updateBucketFromHeaders(routeKey, headers) {
		const bucket = headers.get("X-RateLimit-Bucket");
		const retryAfter = headers.get("X-RateLimit-Reset-After");
		const remaining = headers.get("X-RateLimit-Remaining");
		const resetAfterSeconds = retryAfter ? Number(retryAfter) : NaN;
		const remainingRequests = remaining ? Number(remaining) : NaN;
		if (!bucket) return;
		this.routeBuckets.set(routeKey, bucket);
		if (!Number.isFinite(resetAfterSeconds) || !Number.isFinite(remainingRequests)) {
			if (!this.bucketStates.has(bucket)) this.bucketStates.set(bucket, 0);
			return;
		}
		if (remainingRequests <= 0) {
			this.bucketStates.set(bucket, Date.now() + Math.ceil(resetAfterSeconds * 1e3));
			return;
		}
		this.bucketStates.set(bucket, 0);
	}
	getMajorParameter(path) {
		const guildMatch = path.match(/^\/guilds\/(\d+)/);
		if (guildMatch?.[1]) return guildMatch[1];
		const channelMatch = path.match(/^\/channels\/(\d+)/);
		if (channelMatch?.[1]) return channelMatch[1];
		const webhookMatch = path.match(/^\/webhooks\/(\d+)(?:\/([^/]+))?/);
		if (webhookMatch) {
			const [, id, token] = webhookMatch;
			return token ? `${id}/${token}` : id ?? null;
		}
		return null;
	}
	getRouteKey(method, path) {
		return `${method.toUpperCase()}:${this.getBucketKey(path)}`;
	}
	getBucketKey(path) {
		const majorParameter = this.getMajorParameter(path);
		const normalizedPath = path.replace(/\?.*$/, "").replace(/\/\d{17,20}(?=\/|$)/g, "/:id").replace(/\/reactions\/[^/]+/g, "/reactions/:reaction");
		return majorParameter ? `${normalizedPath}:${majorParameter}` : normalizedPath;
	}
};
function createDiscordRequestClient(token, options) {
	if (!options?.fetch) return new RequestClient(token, options);
	return new ProxyRequestClientCompat(token, options);
}
//#endregion
//#region extensions/discord/src/retry.ts
const DISCORD_RETRY_DEFAULTS = {
	attempts: 3,
	minDelayMs: 500,
	maxDelayMs: 3e4,
	jitter: .1
};
function createDiscordRetryRunner(params) {
	return createRateLimitRetryRunner({
		...params,
		defaults: DISCORD_RETRY_DEFAULTS,
		logLabel: "discord",
		shouldRetry: (err) => err instanceof RateLimitError,
		retryAfterMs: (err) => err instanceof RateLimitError ? err.retryAfter * 1e3 : void 0
	});
}
//#endregion
//#region extensions/discord/src/client.ts
function createDiscordRuntimeAccountContext(params) {
	return {
		cfg: params.cfg,
		accountId: normalizeAccountId(params.accountId)
	};
}
function resolveDiscordClientAccountContext(opts, cfg, runtime) {
	const resolvedCfg = opts.cfg ?? cfg ?? loadConfig();
	const account = resolveAccountWithoutToken({
		cfg: resolvedCfg,
		accountId: opts.accountId
	});
	return {
		cfg: resolvedCfg,
		account,
		proxyFetch: resolveDiscordProxyFetchForAccount(account, resolvedCfg, runtime)
	};
}
function resolveToken(params) {
	const fallback = normalizeDiscordToken(params.fallbackToken, "channels.discord.token");
	if (!fallback) throw new Error(`Discord bot token missing for account "${params.accountId}" (set discord.accounts.${params.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	return fallback;
}
function resolveRest(token, account, cfg, rest, proxyFetch) {
	if (rest) return rest;
	const resolvedProxyFetch = proxyFetch ?? resolveDiscordProxyFetchForAccount(account, cfg);
	return createDiscordRequestClient(token, resolvedProxyFetch ? { fetch: resolvedProxyFetch } : void 0);
}
function resolveAccountWithoutToken(params) {
	const accountId = normalizeAccountId(params.accountId);
	const merged = mergeDiscordAccountConfig(params.cfg, accountId);
	const baseEnabled = params.cfg.channels?.discord?.enabled !== false;
	const accountEnabled = merged.enabled !== false;
	return {
		accountId,
		enabled: baseEnabled && accountEnabled,
		name: normalizeOptionalString(merged.name),
		token: "",
		tokenSource: "none",
		config: merged
	};
}
function createDiscordRestClient(opts, cfg) {
	const explicitToken = normalizeDiscordToken(opts.token, "channels.discord.token");
	const proxyContext = resolveDiscordClientAccountContext(opts, cfg);
	const resolvedCfg = proxyContext.cfg;
	const account = explicitToken ? proxyContext.account : resolveDiscordAccount({
		cfg: resolvedCfg,
		accountId: opts.accountId
	});
	const token = explicitToken ?? resolveToken({
		accountId: account.accountId,
		fallbackToken: account.token
	});
	return {
		token,
		rest: resolveRest(token, account, resolvedCfg, opts.rest, proxyContext.proxyFetch),
		account
	};
}
function createDiscordClient(opts, cfg) {
	const { token, rest, account } = createDiscordRestClient(opts, opts.cfg ?? cfg);
	return {
		token,
		rest,
		request: createDiscordRetryRunner({
			retry: opts.retry,
			configRetry: account.config.retry,
			verbose: opts.verbose
		})
	};
}
function resolveDiscordRest(opts) {
	return createDiscordRestClient(opts, opts.cfg).rest;
}
//#endregion
//#region extensions/discord/src/send.permissions.ts
const PERMISSION_ENTRIES = Object.entries(PermissionFlagsBits).filter(([, value]) => typeof value === "bigint");
const ALL_PERMISSIONS = PERMISSION_ENTRIES.reduce((acc, [, value]) => acc | value, 0n);
const ADMINISTRATOR_BIT = PermissionFlagsBits.Administrator;
function addPermissionBits(base, add) {
	if (!add) return base;
	return base | BigInt(add);
}
function removePermissionBits(base, deny) {
	if (!deny) return base;
	return base & ~BigInt(deny);
}
function bitfieldToPermissions(bitfield) {
	return PERMISSION_ENTRIES.filter(([, value]) => (bitfield & value) === value).map(([name]) => name).toSorted();
}
function hasAdministrator(bitfield) {
	return (bitfield & ADMINISTRATOR_BIT) === ADMINISTRATOR_BIT;
}
function hasPermissionBit(bitfield, permission) {
	return (bitfield & permission) === permission;
}
function isThreadChannelType(channelType) {
	return channelType === ChannelType.GuildNewsThread || channelType === ChannelType.GuildPublicThread || channelType === ChannelType.GuildPrivateThread;
}
async function fetchBotUserId(rest) {
	const me = await rest.get(Routes.user("@me"));
	if (!me?.id) throw new Error("Failed to resolve bot user id");
	return me.id;
}
/**
* Fetch guild-level permissions for a user. This does not include channel-specific overwrites.
*/
async function fetchMemberGuildPermissionsDiscord(guildId, userId, opts = {}) {
	const rest = resolveDiscordRest(opts);
	try {
		const [guild, member] = await Promise.all([rest.get(Routes.guild(guildId)), rest.get(Routes.guildMember(guildId, userId))]);
		const rolesById = new Map((guild.roles ?? []).map((role) => [role.id, role]));
		const everyoneRole = rolesById.get(guildId);
		let permissions = 0n;
		if (everyoneRole?.permissions) permissions = addPermissionBits(permissions, everyoneRole.permissions);
		for (const roleId of member.roles ?? []) {
			const role = rolesById.get(roleId);
			if (role?.permissions) permissions = addPermissionBits(permissions, role.permissions);
		}
		return permissions;
	} catch {
		return null;
	}
}
/**
* Returns true when the user has ADMINISTRATOR or required permission bits
* matching the provided predicate.
*/
async function hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, check, opts = {}) {
	const permissions = await fetchMemberGuildPermissionsDiscord(guildId, userId, opts);
	if (permissions === null) return false;
	if (hasAdministrator(permissions)) return true;
	return check(permissions, requiredPermissions);
}
/**
* Returns true when the user has ADMINISTRATOR or any required permission bit.
*/
async function hasAnyGuildPermissionDiscord(guildId, userId, requiredPermissions, opts = {}) {
	return await hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, (permissions, required) => required.some((permission) => hasPermissionBit(permissions, permission)), opts);
}
/**
* Returns true when the user has ADMINISTRATOR or all required permission bits.
*/
async function hasAllGuildPermissionsDiscord(guildId, userId, requiredPermissions, opts = {}) {
	return await hasGuildPermissionsDiscord(guildId, userId, requiredPermissions, (permissions, required) => required.every((permission) => hasPermissionBit(permissions, permission)), opts);
}
async function fetchChannelPermissionsDiscord(channelId, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const channel = await rest.get(Routes.channel(channelId));
	const channelType = "type" in channel ? channel.type : void 0;
	const guildId = "guild_id" in channel ? channel.guild_id : void 0;
	if (!guildId) return {
		channelId,
		permissions: [],
		raw: "0",
		isDm: true,
		channelType
	};
	const botId = await fetchBotUserId(rest);
	const [guild, member] = await Promise.all([rest.get(Routes.guild(guildId)), rest.get(Routes.guildMember(guildId, botId))]);
	const rolesById = new Map((guild.roles ?? []).map((role) => [role.id, role]));
	const everyoneRole = rolesById.get(guildId);
	let base = 0n;
	if (everyoneRole?.permissions) base = addPermissionBits(base, everyoneRole.permissions);
	for (const roleId of member.roles ?? []) {
		const role = rolesById.get(roleId);
		if (role?.permissions) base = addPermissionBits(base, role.permissions);
	}
	if (hasAdministrator(base)) return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(ALL_PERMISSIONS),
		raw: ALL_PERMISSIONS.toString(),
		isDm: false,
		channelType
	};
	let permissions = base;
	const overwrites = "permission_overwrites" in channel ? channel.permission_overwrites ?? [] : [];
	for (const overwrite of overwrites) if (overwrite.id === guildId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (member.roles?.includes(overwrite.id)) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (overwrite.id === botId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(permissions),
		raw: permissions.toString(),
		isDm: false,
		channelType
	};
}
//#endregion
//#region extensions/discord/src/send.types.ts
var DiscordSendError = class extends Error {
	constructor(message, opts) {
		super(message);
		this.name = "DiscordSendError";
		if (opts) Object.assign(this, opts);
	}
	toString() {
		return this.message;
	}
};
const DISCORD_MAX_EMOJI_BYTES = 256 * 1024;
const DISCORD_MAX_STICKER_BYTES = 512 * 1024;
const DISCORD_MAX_EVENT_COVER_BYTES = 8 * 1024 * 1024;
//#endregion
//#region extensions/discord/src/send.shared.ts
const DISCORD_TEXT_LIMIT = 2e3;
const DISCORD_MAX_STICKERS = 3;
const DISCORD_POLL_MAX_ANSWERS = 10;
const DISCORD_POLL_MAX_DURATION_HOURS = 768;
const DISCORD_MISSING_PERMISSIONS = 50013;
const DISCORD_CANNOT_DM = 50007;
function normalizeReactionEmoji(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("emoji required");
	const customMatch = trimmed.match(/^<a?:([^:>]+):(\d+)>$/);
	const identifier = customMatch ? `${customMatch[1]}:${customMatch[2]}` : trimmed.replace(/[\uFE0E\uFE0F]/g, "");
	return encodeURIComponent(identifier);
}
function normalizeStickerIds(raw) {
	const ids = raw.map((entry) => entry.trim()).filter(Boolean);
	if (ids.length === 0) throw new Error("At least one sticker id is required");
	if (ids.length > DISCORD_MAX_STICKERS) throw new Error("Discord supports up to 3 stickers per message");
	return ids;
}
function normalizeEmojiName(raw, label) {
	const name = raw.trim();
	if (!name) throw new Error(`${label} is required`);
	return name;
}
function normalizeDiscordPollInput(input) {
	const poll = normalizePollInput(input, { maxOptions: DISCORD_POLL_MAX_ANSWERS });
	const duration = normalizePollDurationHours(poll.durationHours, {
		defaultHours: 24,
		maxHours: DISCORD_POLL_MAX_DURATION_HOURS
	});
	return {
		question: { text: poll.question },
		answers: poll.options.map((answer) => ({ poll_media: { text: answer } })),
		duration,
		allow_multiselect: poll.maxSelections > 1,
		layout_type: PollLayoutType.Default
	};
}
function getDiscordErrorCode(err) {
	if (!err || typeof err !== "object") return;
	const candidate = "code" in err && err.code !== void 0 ? err.code : "rawError" in err && err.rawError && typeof err.rawError === "object" ? err.rawError.code : void 0;
	if (typeof candidate === "number") return candidate;
	if (typeof candidate === "string" && /^\d+$/.test(candidate)) return Number(candidate);
}
async function buildDiscordSendError(err, ctx) {
	if (err instanceof DiscordSendError) return err;
	const code = getDiscordErrorCode(err);
	if (code === DISCORD_CANNOT_DM) return new DiscordSendError("discord dm failed: user blocks dms or privacy settings disallow it", { kind: "dm-blocked" });
	if (code !== DISCORD_MISSING_PERMISSIONS) return err;
	let missing = [];
	try {
		const permissions = await fetchChannelPermissionsDiscord(ctx.channelId, {
			rest: ctx.rest,
			token: ctx.token
		});
		const current = new Set(permissions.permissions);
		const required = ["ViewChannel", "SendMessages"];
		if (isThreadChannelType(permissions.channelType)) required.push("SendMessagesInThreads");
		if (ctx.hasMedia) required.push("AttachFiles");
		missing = required.filter((permission) => !current.has(permission));
	} catch {}
	return new DiscordSendError(`${missing.length ? `missing permissions in channel ${ctx.channelId}: ${missing.join(", ")}` : `missing permissions in channel ${ctx.channelId}`}. bot might be muted or blocked by role/channel overrides`, {
		kind: "missing-permissions",
		channelId: ctx.channelId,
		missingPermissions: missing
	});
}
async function resolveChannelId(rest, recipient, request) {
	if (recipient.kind === "channel") return { channelId: recipient.id };
	const dmChannel = await request(() => rest.post(Routes.userChannels(), { body: { recipient_id: recipient.id } }), "dm-channel");
	if (!dmChannel?.id) throw new Error("Failed to create Discord DM channel");
	return {
		channelId: dmChannel.id,
		dm: true
	};
}
async function resolveDiscordChannelType(rest, channelId) {
	try {
		return (await rest.get(Routes.channel(channelId)))?.type;
	} catch {
		return;
	}
}
const SUPPRESS_NOTIFICATIONS_FLAG = 4096;
function buildDiscordTextChunks(text, opts = {}) {
	if (!text) return [];
	return resolveTextChunksWithFallback(text, chunkDiscordTextWithMode(text, {
		maxChars: opts.maxChars ?? DISCORD_TEXT_LIMIT,
		maxLines: opts.maxLinesPerMessage,
		chunkMode: opts.chunkMode
	}));
}
function hasV2Components(components) {
	return Boolean(components?.some((component) => "isV2" in component && component.isV2));
}
function resolveDiscordSendComponents(params) {
	if (!params.components || !params.isFirst) return;
	return typeof params.components === "function" ? params.components(params.text) : params.components;
}
function normalizeDiscordEmbeds(embeds) {
	if (!embeds?.length) return;
	return embeds.map((embed) => embed instanceof Embed ? embed : new Embed(embed));
}
function resolveDiscordSendEmbeds(params) {
	if (!params.embeds || !params.isFirst) return;
	return normalizeDiscordEmbeds(params.embeds);
}
function buildDiscordMessagePayload(params) {
	const payload = {};
	const hasV2 = hasV2Components(params.components);
	const trimmed = params.text.trim();
	if (!hasV2 && trimmed) payload.content = params.text;
	if (params.components?.length) payload.components = params.components;
	if (!hasV2 && params.embeds?.length) payload.embeds = params.embeds;
	if (params.flags !== void 0) payload.flags = params.flags;
	if (params.files?.length) payload.files = params.files;
	return payload;
}
function stripUndefinedFields(value) {
	return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== void 0));
}
function toDiscordFileBlob(data) {
	if (data instanceof Blob) return data;
	const arrayBuffer = new ArrayBuffer(data.byteLength);
	new Uint8Array(arrayBuffer).set(data);
	return new Blob([arrayBuffer]);
}
async function sendDiscordText(rest, channelId, text, replyTo, request, maxLinesPerMessage, components, embeds, chunkMode, silent) {
	if (!text.trim()) throw new Error("Message must be non-empty for Discord sends");
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG : void 0;
	const chunks = buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	});
	const sendChunk = async (chunk, isFirst) => {
		const body = stripUndefinedFields({
			...serializePayload(buildDiscordMessagePayload({
				text: chunk,
				components: resolveDiscordSendComponents({
					components,
					text: chunk,
					isFirst
				}),
				embeds: resolveDiscordSendEmbeds({
					embeds,
					isFirst
				}),
				flags
			})),
			...messageReference ? { message_reference: messageReference } : {}
		});
		return await request(() => rest.post(Routes.channelMessages(channelId), { body }), "text");
	};
	if (chunks.length === 1) return await sendChunk(chunks[0], true);
	let last = null;
	for (const [index, chunk] of chunks.entries()) last = await sendChunk(chunk, index === 0);
	if (!last) throw new Error("Discord send failed (empty chunk result)");
	return last;
}
async function sendDiscordMedia(rest, channelId, text, mediaUrl, filename, mediaLocalRoots, mediaReadFile, maxBytes, replyTo, request, maxLinesPerMessage, components, embeds, chunkMode, silent) {
	const media = await loadWebMedia(mediaUrl, buildOutboundMediaLoadOptions({
		maxBytes,
		mediaLocalRoots,
		mediaReadFile
	}));
	const resolvedFileName = filename?.trim() || media.fileName || (media.contentType ? `upload${extensionForMime(media.contentType) ?? ""}` : "") || "upload";
	const chunks = text ? buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	}) : [];
	const caption = chunks[0] ?? "";
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG : void 0;
	const fileData = toDiscordFileBlob(media.buffer);
	const payload = buildDiscordMessagePayload({
		text: caption,
		components: resolveDiscordSendComponents({
			components,
			text: caption,
			isFirst: true
		}),
		embeds: resolveDiscordSendEmbeds({
			embeds,
			isFirst: true
		}),
		flags,
		files: [{
			data: fileData,
			name: resolvedFileName
		}]
	});
	const res = await request(() => rest.post(Routes.channelMessages(channelId), { body: stripUndefinedFields({
		...serializePayload(payload),
		...messageReference ? { message_reference: messageReference } : {}
	}) }), "media");
	for (const chunk of chunks.slice(1)) {
		if (!chunk.trim()) continue;
		await sendDiscordText(rest, channelId, chunk, replyTo, request, maxLinesPerMessage, void 0, void 0, chunkMode, silent);
	}
	return res;
}
function buildReactionIdentifier(emoji) {
	if (emoji.id && emoji.name) return `${emoji.name}:${emoji.id}`;
	return emoji.name ?? "";
}
function formatReactionEmoji(emoji) {
	return buildReactionIdentifier(emoji);
}
//#endregion
export { resolveDiscordClientAccountContext as A, fetchChannelPermissionsDiscord as C, createDiscordClient as D, hasAnyGuildPermissionDiscord as E, validateDiscordProxyUrl as F, withValidatedDiscordProxy as I, chunkDiscordTextWithMode as L, createDiscordRetryRunner as M, createDiscordRequestClient as N, createDiscordRestClient as O, resolveDiscordProxyFetchForAccount as P, DiscordSendError as S, hasAllGuildPermissionsDiscord as T, stripUndefinedFields as _, buildReactionIdentifier as a, DISCORD_MAX_EVENT_COVER_BYTES as b, normalizeEmojiName as c, resolveChannelId as d, resolveDiscordChannelType as f, sendDiscordText as g, sendDiscordMedia as h, buildDiscordTextChunks as i, resolveDiscordRest as j, createDiscordRuntimeAccountContext as k, normalizeReactionEmoji as l, resolveDiscordSendEmbeds as m, buildDiscordMessagePayload as n, formatReactionEmoji as o, resolveDiscordSendComponents as p, buildDiscordSendError as r, normalizeDiscordPollInput as s, SUPPRESS_NOTIFICATIONS_FLAG as t, normalizeStickerIds as u, toDiscordFileBlob as v, fetchMemberGuildPermissionsDiscord as w, DISCORD_MAX_STICKER_BYTES as x, DISCORD_MAX_EMOJI_BYTES as y };
