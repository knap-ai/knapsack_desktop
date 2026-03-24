import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { Hx as projectAccountWarningCollector, Lx as createConditionalWarningCollector, Mx as composeWarningCollectors, Vb as createChatChannelPlugin, Vx as projectAccountConfigWarningCollector, Yb as createHybridChannelConfigAdapter, ex as createScopedDmSecurityResolver } from "./pi-embedded-CbCYZxIb.js";
import { t as buildAgentSessionKey } from "./resolve-route-DwFWP4JW.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { t as attachChannelToResult } from "./channel-send-result-DDWpviAF.js";
import { D as createFixedWindowRateLimiter, F as readRequestBodyWithLimit, I as requestBodyErrorToText, N as isRequestBodyLimitError, l as registerPluginHttpRoute } from "./webhook-ingress-D-H5frou.js";
import { m as createEmptyChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { i as waitUntilAbort } from "./channel-lifecycle-DmiShiUP.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { i as resolveAccount, n as synologyChatSetupWizard, r as listAccountIds, t as synologyChatSetupAdapter } from "./setup-surface-r2mesIzg.js";
import * as crypto$1 from "node:crypto";
import { z } from "zod";
import * as https$1 from "node:https";
import * as http$1 from "node:http";
import * as querystring from "node:querystring";
//#region extensions/synology-chat/src/client.ts
/**
* Synology Chat HTTP client.
* Sends messages TO Synology Chat via the incoming webhook URL.
*/
const MIN_SEND_INTERVAL_MS = 500;
let lastSendTime = 0;
const chatUserCache = /* @__PURE__ */ new Map();
const CACHE_TTL_MS = 300 * 1e3;
/**
* Send a text message to Synology Chat via the incoming webhook.
*
* @param incomingUrl - Synology Chat incoming webhook URL
* @param text - Message text to send
* @param userId - Optional user ID to mention with @
* @returns true if sent successfully
*/
async function sendMessage(incomingUrl, text, userId, allowInsecureSsl = true) {
	const body = buildWebhookBody({ text }, userId);
	const elapsed = Date.now() - lastSendTime;
	if (elapsed < MIN_SEND_INTERVAL_MS) await sleep(MIN_SEND_INTERVAL_MS - elapsed);
	const maxRetries = 3;
	const baseDelay = 300;
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const ok = await doPost(incomingUrl, body, allowInsecureSsl);
			lastSendTime = Date.now();
			if (ok) return true;
		} catch {}
		if (attempt < maxRetries - 1) await sleep(baseDelay * Math.pow(2, attempt));
	}
	return false;
}
/**
* Send a file URL to Synology Chat.
*/
async function sendFileUrl(incomingUrl, fileUrl, userId, allowInsecureSsl = true) {
	const body = buildWebhookBody({ file_url: fileUrl }, userId);
	try {
		const ok = await doPost(incomingUrl, body, allowInsecureSsl);
		lastSendTime = Date.now();
		return ok;
	} catch {
		return false;
	}
}
/**
* Fetch the list of Chat users visible to this bot via the user_list API.
* Results are cached for CACHE_TTL_MS to avoid excessive API calls.
*
* The user_list endpoint uses the same base URL as the chatbot API but
* with method=user_list instead of method=chatbot.
*/
async function fetchChatUsers(incomingUrl, allowInsecureSsl = true, log) {
	const now = Date.now();
	const listUrl = incomingUrl.replace(/method=\w+/, "method=user_list");
	const cached = chatUserCache.get(listUrl);
	if (cached && now - cached.cachedAt < CACHE_TTL_MS) return cached.users;
	return new Promise((resolve) => {
		let parsedUrl;
		try {
			parsedUrl = new URL(listUrl);
		} catch {
			log?.warn("fetchChatUsers: invalid user_list URL, using cached data");
			resolve(cached?.users ?? []);
			return;
		}
		(parsedUrl.protocol === "https:" ? https$1 : http$1).get(listUrl, { rejectUnauthorized: !allowInsecureSsl }, (res) => {
			let data = "";
			res.on("data", (c) => {
				data += c.toString();
			});
			res.on("end", () => {
				try {
					const result = JSON.parse(data);
					if (result.success && result.data?.users) {
						const users = result.data.users.map((u) => ({
							user_id: u.user_id,
							username: u.username || "",
							nickname: u.nickname || ""
						}));
						chatUserCache.set(listUrl, {
							users,
							cachedAt: now
						});
						resolve(users);
					} else {
						log?.warn(`fetchChatUsers: API returned success=${result.success}, using cached data`);
						resolve(cached?.users ?? []);
					}
				} catch {
					log?.warn("fetchChatUsers: failed to parse user_list response");
					resolve(cached?.users ?? []);
				}
			});
		}).on("error", (err) => {
			log?.warn(`fetchChatUsers: HTTP error — ${err instanceof Error ? err.message : err}`);
			resolve(cached?.users ?? []);
		});
	});
}
/**
* Resolve a mutable webhook username/nickname to the correct Chat API user_id.
*
* Synology Chat outgoing webhooks send a user_id that may NOT match the
* Chat-internal user_id needed by the chatbot API (method=chatbot).
* The webhook's "username" field corresponds to the Chat user's "nickname".
*
* @returns The correct Chat user_id, or undefined if not found
*/
async function resolveLegacyWebhookNameToChatUserId(params) {
	const users = await fetchChatUsers(params.incomingUrl, params.allowInsecureSsl, params.log);
	const lower = params.mutableWebhookUsername.toLowerCase();
	const byNickname = users.find((u) => u.nickname.toLowerCase() === lower);
	if (byNickname) return byNickname.user_id;
	const byUsername = users.find((u) => u.username.toLowerCase() === lower);
	if (byUsername) return byUsername.user_id;
}
function buildWebhookBody(payload, userId) {
	const numericId = parseNumericUserId(userId);
	if (numericId !== void 0) payload.user_ids = [numericId];
	return `payload=${encodeURIComponent(JSON.stringify(payload))}`;
}
function parseNumericUserId(userId) {
	if (userId === void 0) return;
	const numericId = typeof userId === "number" ? userId : parseInt(userId, 10);
	return Number.isNaN(numericId) ? void 0 : numericId;
}
function doPost(url, body, allowInsecureSsl = true) {
	return new Promise((resolve, reject) => {
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			reject(/* @__PURE__ */ new Error(`Invalid URL: ${url}`));
			return;
		}
		const req = (parsedUrl.protocol === "https:" ? https$1 : http$1).request(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": Buffer.byteLength(body)
			},
			timeout: 3e4,
			rejectUnauthorized: !allowInsecureSsl
		}, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk.toString();
			});
			res.on("end", () => {
				resolve(res.statusCode === 200);
			});
		});
		req.on("error", reject);
		req.on("timeout", () => {
			req.destroy();
			reject(/* @__PURE__ */ new Error("Request timeout"));
		});
		req.write(body);
		req.end();
	});
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
//#endregion
//#region extensions/synology-chat/src/config-schema.ts
const SynologyChatChannelConfigSchema = buildChannelConfigSchema(z.object({
	dangerouslyAllowNameMatching: z.boolean().optional(),
	dangerouslyAllowInheritedWebhookPath: z.boolean().optional()
}).passthrough());
//#endregion
//#region extensions/synology-chat/src/inbound-context.ts
const CHANNEL_ID$4 = "synology-chat";
function buildSynologyChatInboundContext(params) {
	const { account, msg, sessionKey } = params;
	return params.finalizeInboundContext({
		Body: msg.body,
		RawBody: msg.body,
		CommandBody: msg.body,
		From: `synology-chat:${msg.from}`,
		To: `synology-chat:${msg.from}`,
		SessionKey: sessionKey,
		AccountId: account.accountId,
		OriginatingChannel: CHANNEL_ID$4,
		OriginatingTo: `synology-chat:${msg.from}`,
		ChatType: msg.chatType,
		SenderName: msg.senderName,
		SenderId: msg.from,
		Provider: CHANNEL_ID$4,
		Surface: CHANNEL_ID$4,
		ConversationLabel: msg.senderName || msg.from,
		Timestamp: Date.now(),
		CommandAuthorized: msg.commandAuthorized
	});
}
//#endregion
//#region extensions/synology-chat/src/runtime.ts
const { setRuntime: setSynologyRuntime, getRuntime: getSynologyRuntime } = createPluginRuntimeStore("Synology Chat runtime not initialized - plugin not registered");
//#endregion
//#region extensions/synology-chat/src/session-key.ts
const CHANNEL_ID$3 = "synology-chat";
function buildSynologyChatInboundSessionKey(params) {
	return buildAgentSessionKey({
		agentId: params.agentId,
		channel: CHANNEL_ID$3,
		accountId: params.accountId,
		peer: {
			kind: "direct",
			id: params.userId
		},
		dmScope: "per-account-channel-peer",
		identityLinks: params.identityLinks
	});
}
//#endregion
//#region extensions/synology-chat/src/inbound-turn.ts
const CHANNEL_ID$2 = "synology-chat";
function resolveSynologyChatInboundRoute(params) {
	const rt = getSynologyRuntime();
	const route = rt.channel.routing.resolveAgentRoute({
		cfg: params.cfg,
		channel: CHANNEL_ID$2,
		accountId: params.account.accountId,
		peer: {
			kind: "direct",
			id: params.userId
		}
	});
	return {
		rt,
		route,
		sessionKey: buildSynologyChatInboundSessionKey({
			agentId: route.agentId,
			accountId: params.account.accountId,
			userId: params.userId,
			identityLinks: params.cfg.session?.identityLinks
		})
	};
}
async function deliverSynologyChatReply(params) {
	const text = params.payload.text ?? params.payload.body;
	if (!text) return;
	await sendMessage(params.account.incomingUrl, text, params.sendUserId, params.account.allowInsecureSsl);
}
async function dispatchSynologyChatInboundTurn(params) {
	const currentCfg = await getSynologyRuntime().config.loadConfig();
	const sendUserId = params.msg.chatUserId ?? params.msg.from;
	const resolved = resolveSynologyChatInboundRoute({
		cfg: currentCfg,
		account: params.account,
		userId: params.msg.from
	});
	const msgCtx = buildSynologyChatInboundContext({
		finalizeInboundContext: resolved.rt.channel.reply.finalizeInboundContext,
		account: params.account,
		msg: params.msg,
		sessionKey: resolved.sessionKey
	});
	await resolved.rt.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
		ctx: msgCtx,
		cfg: currentCfg,
		dispatcherOptions: {
			deliver: async (payload) => {
				await deliverSynologyChatReply({
					account: params.account,
					sendUserId,
					payload
				});
			},
			onReplyStart: () => {
				params.log?.info?.(`Agent reply started for ${params.msg.from}`);
			}
		}
	});
	return null;
}
//#endregion
//#region extensions/synology-chat/src/security.ts
/**
* Security module: token validation, rate limiting, input sanitization, user allowlist.
*/
/**
* Validate webhook token using constant-time comparison.
* Prevents timing attacks that could leak token bytes.
*/
function validateToken(received, expected) {
	if (!received || !expected) return false;
	const key = "openclaw-token-cmp";
	const a = crypto$1.createHmac("sha256", key).update(received).digest();
	const b = crypto$1.createHmac("sha256", key).update(expected).digest();
	return crypto$1.timingSafeEqual(a, b);
}
/**
* Check if a user ID is in the allowed list.
* Allowlist mode must be explicit; empty lists should not match any user.
*/
function checkUserAllowed(userId, allowedUserIds) {
	if (allowedUserIds.length === 0) return false;
	return allowedUserIds.includes(userId);
}
/**
* Resolve DM authorization for a sender across all DM policy modes.
* Keeps policy semantics in one place so webhook/startup behavior stays consistent.
*/
function authorizeUserForDm(userId, dmPolicy, allowedUserIds) {
	if (dmPolicy === "disabled") return {
		allowed: false,
		reason: "disabled"
	};
	if (dmPolicy === "open") return { allowed: true };
	if (allowedUserIds.length === 0) return {
		allowed: false,
		reason: "allowlist-empty"
	};
	if (!checkUserAllowed(userId, allowedUserIds)) return {
		allowed: false,
		reason: "not-allowlisted"
	};
	return { allowed: true };
}
/**
* Sanitize user input to prevent prompt injection attacks.
* Filters known dangerous patterns and truncates long messages.
*/
function sanitizeInput(text) {
	const dangerousPatterns = [
		/ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
		/you\s+are\s+now\s+/gi,
		/system:\s*/gi,
		/<\|.*?\|>/g
	];
	let sanitized = text;
	for (const pattern of dangerousPatterns) sanitized = sanitized.replace(pattern, "[FILTERED]");
	const maxLength = 4e3;
	if (sanitized.length > maxLength) sanitized = sanitized.slice(0, maxLength) + "... [truncated]";
	return sanitized;
}
/**
* Sliding window rate limiter per user ID.
*/
var RateLimiter = class {
	constructor(limit = 30, windowSeconds = 60, maxTrackedUsers = 5e3) {
		this.limit = limit;
		this.limiter = createFixedWindowRateLimiter({
			windowMs: Math.max(1, Math.floor(windowSeconds * 1e3)),
			maxRequests: Math.max(1, Math.floor(limit)),
			maxTrackedKeys: Math.max(1, Math.floor(maxTrackedUsers))
		});
	}
	/** Returns true if the request is allowed, false if rate-limited. */
	check(userId) {
		return !this.limiter.isRateLimited(userId);
	}
	/** Exposed for tests and diagnostics. */
	size() {
		return this.limiter.size();
	}
	/** Exposed for tests and account lifecycle cleanup. */
	clear() {
		this.limiter.clear();
	}
	/** Exposed for tests. */
	maxRequests() {
		return this.limit;
	}
};
//#endregion
//#region extensions/synology-chat/src/webhook-handler.ts
const rateLimiters = /* @__PURE__ */ new Map();
const PREAUTH_MAX_BODY_BYTES = 64 * 1024;
const PREAUTH_BODY_TIMEOUT_MS = 5e3;
function getRateLimiter(account) {
	let rl = rateLimiters.get(account.accountId);
	if (!rl || rl.maxRequests() !== account.rateLimitPerMinute) {
		rl?.clear();
		rl = new RateLimiter(account.rateLimitPerMinute);
		rateLimiters.set(account.accountId, rl);
	}
	return rl;
}
/** Read the full request body as a string. */
async function readBody(req) {
	try {
		return {
			ok: true,
			body: await readRequestBodyWithLimit(req, {
				maxBytes: PREAUTH_MAX_BODY_BYTES,
				timeoutMs: PREAUTH_BODY_TIMEOUT_MS
			})
		};
	} catch (err) {
		if (isRequestBodyLimitError(err)) return {
			ok: false,
			statusCode: err.statusCode,
			error: requestBodyErrorToText(err.code)
		};
		return {
			ok: false,
			statusCode: 400,
			error: "Invalid request body"
		};
	}
}
function firstNonEmptyString(value) {
	if (Array.isArray(value)) {
		for (const item of value) {
			const normalized = firstNonEmptyString(item);
			if (normalized) return normalized;
		}
		return;
	}
	if (value === null || value === void 0) return void 0;
	const str = String(value).trim();
	return str.length > 0 ? str : void 0;
}
function pickAlias(record, aliases) {
	for (const alias of aliases) {
		const normalized = firstNonEmptyString(record[alias]);
		if (normalized) return normalized;
	}
}
function parseQueryParams(req) {
	try {
		const url = new URL(req.url ?? "", "http://localhost");
		const out = {};
		for (const [key, value] of url.searchParams.entries()) out[key] = value;
		return out;
	} catch {
		return {};
	}
}
function parseFormBody(body) {
	return querystring.parse(body);
}
function parseJsonBody(body) {
	if (!body.trim()) return {};
	const parsed = JSON.parse(body);
	if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Invalid JSON body");
	return parsed;
}
function headerValue(header) {
	return firstNonEmptyString(header);
}
function extractTokenFromHeaders(req) {
	const explicit = headerValue(req.headers["x-synology-token"]) ?? headerValue(req.headers["x-webhook-token"]) ?? headerValue(req.headers["x-openclaw-token"]);
	if (explicit) return explicit;
	const auth = headerValue(req.headers.authorization);
	if (!auth) return void 0;
	const bearerMatch = auth.match(/^Bearer\s+(.+)$/i);
	if (bearerMatch?.[1]) return bearerMatch[1].trim();
	return auth.trim();
}
/**
* Parse/normalize incoming webhook payload.
*
* Supports:
* - application/x-www-form-urlencoded
* - application/json
*
* Token resolution order: body.token -> query.token -> headers
* Field aliases:
* - user_id <- user_id | userId | user
* - text    <- text | message | content
*/
function parsePayload(req, body) {
	const contentType = String(req.headers["content-type"] ?? "").toLowerCase();
	let bodyFields = {};
	if (contentType.includes("application/json")) bodyFields = parseJsonBody(body);
	else if (contentType.includes("application/x-www-form-urlencoded")) bodyFields = parseFormBody(body);
	else try {
		bodyFields = parseJsonBody(body);
	} catch {
		bodyFields = parseFormBody(body);
	}
	const queryFields = parseQueryParams(req);
	const headerToken = extractTokenFromHeaders(req);
	const token = pickAlias(bodyFields, ["token"]) ?? pickAlias(queryFields, ["token"]) ?? headerToken;
	const userId = pickAlias(bodyFields, [
		"user_id",
		"userId",
		"user"
	]) ?? pickAlias(queryFields, [
		"user_id",
		"userId",
		"user"
	]);
	const text = pickAlias(bodyFields, [
		"text",
		"message",
		"content"
	]) ?? pickAlias(queryFields, [
		"text",
		"message",
		"content"
	]);
	if (!token || !userId || !text) return null;
	return {
		token,
		channel_id: pickAlias(bodyFields, ["channel_id"]) ?? pickAlias(queryFields, ["channel_id"]) ?? void 0,
		channel_name: pickAlias(bodyFields, ["channel_name"]) ?? pickAlias(queryFields, ["channel_name"]) ?? void 0,
		user_id: userId,
		username: pickAlias(bodyFields, [
			"username",
			"user_name",
			"name"
		]) ?? pickAlias(queryFields, [
			"username",
			"user_name",
			"name"
		]) ?? "unknown",
		post_id: pickAlias(bodyFields, ["post_id"]) ?? pickAlias(queryFields, ["post_id"]) ?? void 0,
		timestamp: pickAlias(bodyFields, ["timestamp"]) ?? pickAlias(queryFields, ["timestamp"]) ?? void 0,
		text,
		trigger_word: pickAlias(bodyFields, ["trigger_word", "triggerWord"]) ?? pickAlias(queryFields, ["trigger_word", "triggerWord"]) ?? void 0
	};
}
/** Send a JSON response. */
function respondJson(res, statusCode, body) {
	res.writeHead(statusCode, { "Content-Type": "application/json" });
	res.end(JSON.stringify(body));
}
/** Send a no-content ACK. */
function respondNoContent(res) {
	res.writeHead(204);
	res.end();
}
async function parseWebhookPayloadRequest(params) {
	const bodyResult = await readBody(params.req);
	if (!bodyResult.ok) {
		params.log?.error("Failed to read request body", bodyResult.error);
		respondJson(params.res, bodyResult.statusCode, { error: bodyResult.error });
		return { ok: false };
	}
	let payload = null;
	try {
		payload = parsePayload(params.req, bodyResult.body);
	} catch (err) {
		params.log?.warn("Failed to parse webhook payload", err);
		respondJson(params.res, 400, { error: "Invalid request body" });
		return { ok: false };
	}
	if (!payload) {
		respondJson(params.res, 400, { error: "Missing required fields (token, user_id, text)" });
		return { ok: false };
	}
	return {
		ok: true,
		payload
	};
}
function authorizeSynologyWebhook(params) {
	if (!validateToken(params.payload.token, params.account.token)) {
		params.log?.warn(`Invalid token from ${params.req.socket?.remoteAddress}`);
		return {
			ok: false,
			statusCode: 401,
			error: "Invalid token"
		};
	}
	const auth = authorizeUserForDm(params.payload.user_id, params.account.dmPolicy, params.account.allowedUserIds);
	if (!auth.allowed) {
		if (auth.reason === "disabled") return {
			ok: false,
			statusCode: 403,
			error: "DMs are disabled"
		};
		if (auth.reason === "allowlist-empty") {
			params.log?.warn("Synology Chat allowlist is empty while dmPolicy=allowlist; rejecting message");
			return {
				ok: false,
				statusCode: 403,
				error: "Allowlist is empty. Configure allowedUserIds or use dmPolicy=open."
			};
		}
		params.log?.warn(`Unauthorized user: ${params.payload.user_id}`);
		return {
			ok: false,
			statusCode: 403,
			error: "User not authorized"
		};
	}
	if (!params.rateLimiter.check(params.payload.user_id)) {
		params.log?.warn(`Rate limit exceeded for user: ${params.payload.user_id}`);
		return {
			ok: false,
			statusCode: 429,
			error: "Rate limit exceeded"
		};
	}
	return {
		ok: true,
		commandAuthorized: auth.allowed
	};
}
function sanitizeSynologyWebhookText(payload) {
	let cleanText = sanitizeInput(payload.text);
	if (payload.trigger_word && cleanText.startsWith(payload.trigger_word)) cleanText = cleanText.slice(payload.trigger_word.length).trim();
	return cleanText;
}
async function parseAndAuthorizeSynologyWebhook(params) {
	const parsed = await parseWebhookPayloadRequest(params);
	if (!parsed.ok) return { ok: false };
	const authorized = authorizeSynologyWebhook({
		req: params.req,
		account: params.account,
		payload: parsed.payload,
		rateLimiter: params.rateLimiter,
		log: params.log
	});
	if (!authorized.ok) {
		respondJson(params.res, authorized.statusCode, { error: authorized.error });
		return { ok: false };
	}
	const cleanText = sanitizeSynologyWebhookText(parsed.payload);
	if (!cleanText) {
		respondNoContent(params.res);
		return { ok: false };
	}
	const preview = cleanText.length > 100 ? `${cleanText.slice(0, 100)}...` : cleanText;
	return {
		ok: true,
		message: {
			payload: parsed.payload,
			body: cleanText,
			commandAuthorized: authorized.commandAuthorized,
			preview
		}
	};
}
async function resolveSynologyReplyDeliveryUserId(params) {
	if (!params.account.dangerouslyAllowNameMatching) return params.payload.user_id;
	const resolvedChatApiUserId = await resolveLegacyWebhookNameToChatUserId({
		incomingUrl: params.account.incomingUrl,
		mutableWebhookUsername: params.payload.username,
		allowInsecureSsl: params.account.allowInsecureSsl,
		log: params.log
	});
	if (resolvedChatApiUserId !== void 0) return String(resolvedChatApiUserId);
	params.log?.warn(`Could not resolve Chat API user_id for "${params.payload.username}" — falling back to webhook user_id ${params.payload.user_id}. Reply delivery may fail.`);
	return params.payload.user_id;
}
async function processAuthorizedSynologyWebhook(params) {
	const authorizedWebhookUserId = params.message.payload.user_id;
	let deliveryUserId = authorizedWebhookUserId;
	try {
		deliveryUserId = await resolveSynologyReplyDeliveryUserId({
			account: params.account,
			payload: params.message.payload,
			log: params.log
		});
		const deliverPromise = params.deliver({
			body: params.message.body,
			from: authorizedWebhookUserId,
			senderName: params.message.payload.username,
			provider: "synology-chat",
			chatType: "direct",
			accountId: params.account.accountId,
			commandAuthorized: params.message.commandAuthorized,
			chatUserId: deliveryUserId
		});
		const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("Agent response timeout (120s)")), 12e4));
		const reply = await Promise.race([deliverPromise, timeoutPromise]);
		if (!reply) return;
		await sendMessage(params.account.incomingUrl, reply, deliveryUserId, params.account.allowInsecureSsl);
		const replyPreview = reply.length > 100 ? `${reply.slice(0, 100)}...` : reply;
		params.log?.info?.(`Reply sent to ${params.message.payload.username} (${deliveryUserId}): ${replyPreview}`);
	} catch (err) {
		const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
		params.log?.error?.(`Failed to process message from ${params.message.payload.username}: ${errMsg}`);
		await sendMessage(params.account.incomingUrl, "Sorry, an error occurred while processing your message.", deliveryUserId, params.account.allowInsecureSsl);
	}
}
function createWebhookHandler(deps) {
	const { account, deliver, log } = deps;
	const rateLimiter = getRateLimiter(account);
	return async (req, res) => {
		if (req.method !== "POST") {
			respondJson(res, 405, { error: "Method not allowed" });
			return;
		}
		const authorized = await parseAndAuthorizeSynologyWebhook({
			req,
			res,
			account,
			rateLimiter,
			log
		});
		if (!authorized.ok) return;
		log?.info(`Message from ${authorized.message.payload.username} (${authorized.message.payload.user_id}): ${authorized.message.preview}`);
		respondNoContent(res);
		await processAuthorizedSynologyWebhook({
			account,
			deliver,
			log,
			message: authorized.message
		});
	};
}
//#endregion
//#region extensions/synology-chat/src/gateway-runtime.ts
const CHANNEL_ID$1 = "synology-chat";
const activeRouteUnregisters = /* @__PURE__ */ new Map();
function buildStartupIssue(code, message, logLevel = "warn") {
	return {
		code,
		logLevel,
		message
	};
}
function logStartupIssues(log, issues) {
	for (const issue of issues) {
		const message = `Synology Chat ${issue.message}`;
		if (issue.logLevel === "info") {
			log?.info?.(message);
			continue;
		}
		log?.warn?.(message);
	}
}
function getRouteKey(account) {
	return `${account.accountId}:${account.webhookPath}`;
}
function createUnknownArgsLogAdapter(log) {
	if (!log) return;
	return {
		info: (...args) => log.info?.(String(args[0] ?? "")),
		warn: (...args) => log.warn?.(String(args[0] ?? "")),
		error: (...args) => log.error?.(String(args[0] ?? ""))
	};
}
function collectSynologyGatewayStartupIssues(params) {
	const { cfg, account, accountId } = params;
	const issues = [];
	if (!account.enabled) {
		issues.push(buildStartupIssue("disabled", `account ${accountId} is disabled, skipping`, "info"));
		return issues;
	}
	if (!account.token || !account.incomingUrl) issues.push(buildStartupIssue("missing-credentials", `account ${accountId} not fully configured (missing token or incomingUrl)`));
	if (account.dmPolicy === "allowlist" && account.allowedUserIds.length === 0) issues.push(buildStartupIssue("empty-allowlist", `account ${accountId} has dmPolicy=allowlist but empty allowedUserIds; refusing to start route`));
	const accountIds = listAccountIds(cfg);
	if (accountIds.length > 1 && accountId !== "default" && account.webhookPathSource === "inherited-base" && !account.dangerouslyAllowInheritedWebhookPath) issues.push(buildStartupIssue("inherited-shared-webhook-path", `account ${accountId} must set an explicit webhookPath in multi-account setups; refusing inherited shared path. Set channels.synology-chat.accounts.${accountId}.webhookPath or opt in with dangerouslyAllowInheritedWebhookPath=true.`));
	const conflictingAccounts = accountIds.filter((candidateId) => {
		if (candidateId === accountId) return false;
		const candidate = resolveAccount(cfg, candidateId);
		return candidate.enabled && candidate.webhookPath === account.webhookPath;
	});
	if (conflictingAccounts.length > 0) issues.push(buildStartupIssue("duplicate-webhook-path", `account ${accountId} conflicts on webhookPath ${account.webhookPath} with ${conflictingAccounts.join(", ")}; refusing to start ambiguous shared route.`));
	return issues;
}
function collectSynologyGatewayRoutingWarnings(params) {
	return collectSynologyGatewayStartupIssues({
		cfg: params.cfg,
		account: params.account,
		accountId: params.account.accountId
	}).filter((issue) => issue.code === "inherited-shared-webhook-path" || issue.code === "duplicate-webhook-path").map((issue) => `- Synology Chat: ${issue.message}`);
}
function validateSynologyGatewayAccountStartup(params) {
	const issues = collectSynologyGatewayStartupIssues(params);
	if (issues.length > 0) {
		logStartupIssues(params.log, issues);
		return { ok: false };
	}
	return { ok: true };
}
function registerSynologyWebhookRoute(params) {
	const { account, log } = params;
	const routeKey = getRouteKey(account);
	const prevUnregister = activeRouteUnregisters.get(routeKey);
	if (prevUnregister) {
		log?.info?.(`Deregistering stale route before re-registering: ${account.webhookPath}`);
		prevUnregister();
		activeRouteUnregisters.delete(routeKey);
	}
	const handler = createWebhookHandler({
		account,
		deliver: async (msg) => await dispatchSynologyChatInboundTurn({
			account,
			msg,
			log: createUnknownArgsLogAdapter(log)
		}),
		log: createUnknownArgsLogAdapter(log)
	});
	const unregister = registerPluginHttpRoute({
		path: account.webhookPath,
		auth: "plugin",
		pluginId: CHANNEL_ID$1,
		accountId: account.accountId,
		log: (msg) => log?.info?.(msg),
		handler
	});
	activeRouteUnregisters.set(routeKey, unregister);
	return () => {
		unregister();
		activeRouteUnregisters.delete(routeKey);
	};
}
//#endregion
//#region extensions/synology-chat/src/channel.ts
const CHANNEL_ID = "synology-chat";
const resolveSynologyChatDmPolicy = createScopedDmSecurityResolver({
	channelKey: CHANNEL_ID,
	resolvePolicy: (account) => account.dmPolicy,
	resolveAllowFrom: (account) => account.allowedUserIds,
	policyPathSuffix: "dmPolicy",
	defaultPolicy: "allowlist",
	approveHint: "openclaw pairing approve synology-chat <code>",
	normalizeEntry: (raw) => raw.toLowerCase().trim()
});
const synologyChatConfigAdapter = createHybridChannelConfigAdapter({
	sectionKey: CHANNEL_ID,
	listAccountIds,
	resolveAccount,
	defaultAccountId: () => DEFAULT_ACCOUNT_ID,
	clearBaseFields: [
		"token",
		"incomingUrl",
		"nasHost",
		"webhookPath",
		"dangerouslyAllowNameMatching",
		"dangerouslyAllowInheritedWebhookPath",
		"dmPolicy",
		"allowedUserIds",
		"rateLimitPerMinute",
		"botName",
		"allowInsecureSsl"
	],
	resolveAllowFrom: (account) => account.allowedUserIds,
	formatAllowFrom: (allowFrom) => allowFrom.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean)
});
const collectSynologyChatSecurityWarnings = createConditionalWarningCollector((account) => !account.token && "- Synology Chat: token is not configured. The webhook will reject all requests.", (account) => !account.incomingUrl && "- Synology Chat: incomingUrl is not configured. The bot cannot send replies.", (account) => account.allowInsecureSsl && "- Synology Chat: SSL verification is disabled (allowInsecureSsl=true). Only use this for local NAS with self-signed certificates.", (account) => account.dangerouslyAllowNameMatching && "- Synology Chat: dangerouslyAllowNameMatching=true re-enables mutable username/nickname recipient matching for replies. Prefer stable numeric user IDs.", (account) => account.dangerouslyAllowInheritedWebhookPath && account.webhookPathSource === "inherited-base" && "- Synology Chat: dangerouslyAllowInheritedWebhookPath=true opts a named account into a shared inherited webhook path. Prefer an explicit per-account webhookPath.", (account) => account.dmPolicy === "open" && "- Synology Chat: dmPolicy=\"open\" allows any user to message the bot. Consider \"allowlist\" for production use.", (account) => account.dmPolicy === "allowlist" && account.allowedUserIds.length === 0 && "- Synology Chat: dmPolicy=\"allowlist\" with empty allowedUserIds blocks all senders. Add users or set dmPolicy=\"open\".");
const collectSynologyChatRoutingWarnings = projectAccountConfigWarningCollector((cfg) => cfg, ({ account, cfg }) => collectSynologyGatewayRoutingWarnings({
	account,
	cfg
}));
function resolveOutboundAccount(cfg, accountId) {
	return resolveAccount(cfg ?? {}, accountId);
}
function requireIncomingUrl(account) {
	if (!account.incomingUrl) throw new Error("Synology Chat incoming URL not configured");
	return account.incomingUrl;
}
function createSynologyChatPlugin() {
	return createChatChannelPlugin({
		base: {
			id: CHANNEL_ID,
			meta: {
				id: CHANNEL_ID,
				label: "Synology Chat",
				selectionLabel: "Synology Chat (Webhook)",
				detailLabel: "Synology Chat (Webhook)",
				docsPath: "/channels/synology-chat",
				blurb: "Connect your Synology NAS Chat to OpenClaw",
				order: 90
			},
			capabilities: {
				chatTypes: ["direct"],
				media: true,
				threads: false,
				reactions: false,
				edit: false,
				unsend: false,
				reply: false,
				effects: false,
				blockStreaming: false
			},
			reload: { configPrefixes: [`channels.${CHANNEL_ID}`] },
			configSchema: SynologyChatChannelConfigSchema,
			setup: synologyChatSetupAdapter,
			setupWizard: synologyChatSetupWizard,
			config: { ...synologyChatConfigAdapter },
			messaging: {
				normalizeTarget: (target) => {
					const trimmed = target.trim();
					if (!trimmed) return void 0;
					return trimmed.replace(/^synology[-_]?chat:/i, "").trim();
				},
				targetResolver: {
					looksLikeId: (id) => {
						const trimmed = id?.trim();
						if (!trimmed) return false;
						return /^\d+$/.test(trimmed) || /^synology[-_]?chat:/i.test(trimmed);
					},
					hint: "<userId>"
				}
			},
			directory: createEmptyChannelDirectoryAdapter(),
			gateway: {
				startAccount: async (ctx) => {
					const { cfg, accountId, log, abortSignal } = ctx;
					const account = resolveAccount(cfg, accountId);
					if (!validateSynologyGatewayAccountStartup({
						cfg,
						account,
						accountId,
						log
					}).ok) return waitUntilAbort(abortSignal);
					log?.info?.(`Starting Synology Chat channel (account: ${accountId}, path: ${account.webhookPath})`);
					const unregister = registerSynologyWebhookRoute({
						account,
						accountId,
						log
					});
					log?.info?.(`Registered HTTP route: ${account.webhookPath} for Synology Chat`);
					return waitUntilAbort(abortSignal, () => {
						log?.info?.(`Stopping Synology Chat channel (account: ${accountId})`);
						unregister();
					});
				},
				stopAccount: async (ctx) => {
					ctx.log?.info?.(`Synology Chat account ${ctx.accountId} stopped`);
				}
			},
			agentPrompt: { messageToolHints: () => [
				"",
				"### Synology Chat Formatting",
				"Synology Chat supports limited formatting. Use these patterns:",
				"",
				"**Links**: Use `<URL|display text>` to create clickable links.",
				"  Example: `<https://example.com|Click here>` renders as a clickable link.",
				"",
				"**File sharing**: Include a publicly accessible URL to share files or images.",
				"  The NAS will download and attach the file (max 32 MB).",
				"",
				"**Limitations**:",
				"- No markdown, bold, italic, or code blocks",
				"- No buttons, cards, or interactive elements",
				"- No message editing after send",
				"- Keep messages under 2000 characters for best readability",
				"",
				"**Best practices**:",
				"- Use short, clear responses (Synology Chat has a minimal UI)",
				"- Use line breaks to separate sections",
				"- Use numbered or bulleted lists for clarity",
				"- Wrap URLs with `<URL|label>` for user-friendly links"
			] }
		},
		pairing: { text: {
			idLabel: "synologyChatUserId",
			message: "OpenClaw: your access has been approved.",
			normalizeAllowEntry: (entry) => entry.toLowerCase().trim(),
			notify: async ({ cfg, id, message }) => {
				const account = resolveAccount(cfg);
				if (!account.incomingUrl) return;
				await sendMessage(account.incomingUrl, message, id, account.allowInsecureSsl);
			}
		} },
		security: {
			resolveDmPolicy: resolveSynologyChatDmPolicy,
			collectWarnings: composeWarningCollectors(projectAccountWarningCollector(collectSynologyChatSecurityWarnings), collectSynologyChatRoutingWarnings)
		},
		outbound: {
			deliveryMode: "gateway",
			textChunkLimit: 2e3,
			sendText: async ({ to, text, accountId, cfg }) => {
				const account = resolveOutboundAccount(cfg ?? {}, accountId);
				if (!await sendMessage(requireIncomingUrl(account), text, to, account.allowInsecureSsl)) throw new Error("Failed to send message to Synology Chat");
				return attachChannelToResult(CHANNEL_ID, {
					messageId: `sc-${Date.now()}`,
					chatId: to
				});
			},
			sendMedia: async ({ to, mediaUrl, accountId, cfg }) => {
				const account = resolveOutboundAccount(cfg ?? {}, accountId);
				const incomingUrl = requireIncomingUrl(account);
				if (!mediaUrl) throw new Error("No media URL provided");
				if (!await sendFileUrl(incomingUrl, mediaUrl, to, account.allowInsecureSsl)) throw new Error("Failed to send media to Synology Chat");
				return attachChannelToResult(CHANNEL_ID, {
					messageId: `sc-${Date.now()}`,
					chatId: to
				});
			}
		}
	});
}
const synologyChatPlugin = createSynologyChatPlugin();
//#endregion
export { setSynologyRuntime as n, synologyChatPlugin as t };
