import { b as withTelegramApiErrorLogging } from "./send-B5NZ9QZr.js";
import { t as resolveTelegramAllowedUpdates } from "./allowed-updates-BD2bJyzD.js";
import { t as createTelegramBot } from "./bot-gUR32RLX.js";
import { logWebhookError, logWebhookProcessed, logWebhookReceived, normalizeOptionalString, startDiagnosticHeartbeat, stopDiagnosticHeartbeat } from "openclaw/plugin-sdk/text-runtime";
import { defaultRuntime } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/ssrf-runtime";
import * as grammy from "grammy";
import { isDiagnosticsEnabled } from "openclaw/plugin-sdk/diagnostic-runtime";
import { createServer } from "node:http";
import net from "node:net";
import { safeEqualSecret } from "openclaw/plugin-sdk/browser-security-runtime";
import { WEBHOOK_RATE_LIMIT_DEFAULTS, applyBasicWebhookRequestGuards, createFixedWindowRateLimiter } from "openclaw/plugin-sdk/webhook-ingress";
import { readJsonBodyWithLimit } from "openclaw/plugin-sdk/webhook-request-guards";
//#region extensions/telegram/src/webhook.ts
const TELEGRAM_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;
const TELEGRAM_WEBHOOK_BODY_TIMEOUT_MS = 3e4;
const TELEGRAM_WEBHOOK_CALLBACK_TIMEOUT_MS = 5e3;
const InputFileCtor = typeof grammy.InputFile === "function" ? grammy.InputFile : class InputFileFallback {
	constructor(path) {
		this.path = path;
	}
};
async function listenHttpServer(params) {
	await new Promise((resolve, reject) => {
		const onError = (err) => {
			params.server.off("error", onError);
			reject(err);
		};
		params.server.once("error", onError);
		params.server.listen(params.port, params.host, () => {
			params.server.off("error", onError);
			resolve();
		});
	});
}
function resolveWebhookPublicUrl(params) {
	if (params.configuredPublicUrl) return params.configuredPublicUrl;
	const address = params.server.address();
	if (address && typeof address !== "string") return `http://${params.host === "0.0.0.0" || address.address === "0.0.0.0" || address.address === "::" ? "localhost" : address.address}:${address.port}${params.path}`;
	return `http://${params.host === "0.0.0.0" ? "localhost" : params.host}:${params.port}${params.path}`;
}
async function initializeTelegramWebhookBot(params) {
	const initSignal = params.abortSignal;
	await withTelegramApiErrorLogging({
		operation: "getMe",
		runtime: params.runtime,
		fn: () => params.bot.init(initSignal)
	});
}
function resolveSingleHeaderValue(header) {
	if (typeof header === "string") return header;
	if (Array.isArray(header) && header.length === 1) return header[0];
}
function hasValidTelegramWebhookSecret(secretHeader, expectedSecret) {
	return safeEqualSecret(secretHeader, expectedSecret);
}
function parseIpLiteral(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	if (trimmed.startsWith("[")) {
		const end = trimmed.indexOf("]");
		if (end !== -1) {
			const candidate = trimmed.slice(1, end);
			return net.isIP(candidate) === 0 ? void 0 : candidate;
		}
	}
	if (net.isIP(trimmed) !== 0) return trimmed;
	const lastColon = trimmed.lastIndexOf(":");
	if (lastColon > -1 && trimmed.includes(".") && trimmed.indexOf(":") === lastColon) {
		const candidate = trimmed.slice(0, lastColon);
		return net.isIP(candidate) === 4 ? candidate : void 0;
	}
}
function isTrustedProxyAddress(ip, trustedProxies) {
	const candidate = parseIpLiteral(ip);
	if (!candidate || !trustedProxies?.length) return false;
	const blockList = new net.BlockList();
	for (const proxy of trustedProxies) {
		const trimmed = normalizeOptionalString(proxy) ?? "";
		if (!trimmed) continue;
		if (trimmed.includes("/")) {
			const [address, prefix] = trimmed.split("/", 2);
			const parsedPrefix = Number.parseInt(prefix ?? "", 10);
			const family = net.isIP(address);
			if (family === 4 && Number.isInteger(parsedPrefix) && parsedPrefix >= 0 && parsedPrefix <= 32) blockList.addSubnet(address, parsedPrefix, "ipv4");
			if (family === 6 && Number.isInteger(parsedPrefix) && parsedPrefix >= 0 && parsedPrefix <= 128) blockList.addSubnet(address, parsedPrefix, "ipv6");
			continue;
		}
		if (net.isIP(trimmed) === 4) {
			blockList.addAddress(trimmed, "ipv4");
			continue;
		}
		if (net.isIP(trimmed) === 6) blockList.addAddress(trimmed, "ipv6");
	}
	return blockList.check(candidate, net.isIP(candidate) === 6 ? "ipv6" : "ipv4");
}
function resolveForwardedClientIp(forwardedFor, trustedProxies) {
	if (!trustedProxies?.length) return;
	const forwardedChain = forwardedFor?.split(",").map((entry) => parseIpLiteral(entry)).filter((entry) => Boolean(entry));
	if (!forwardedChain?.length) return;
	for (let index = forwardedChain.length - 1; index >= 0; index -= 1) {
		const hop = forwardedChain[index];
		if (!isTrustedProxyAddress(hop, trustedProxies)) return hop;
	}
}
function resolveTelegramWebhookClientIp(req, config) {
	const remoteAddress = parseIpLiteral(req.socket.remoteAddress);
	const trustedProxies = config?.gateway?.trustedProxies;
	if (!remoteAddress) return "unknown";
	if (!isTrustedProxyAddress(remoteAddress, trustedProxies)) return remoteAddress;
	const forwardedClientIp = resolveForwardedClientIp(Array.isArray(req.headers["x-forwarded-for"]) ? req.headers["x-forwarded-for"][0] : req.headers["x-forwarded-for"], trustedProxies);
	if (forwardedClientIp) return forwardedClientIp;
	if (config?.gateway?.allowRealIpFallback === true) return parseIpLiteral(Array.isArray(req.headers["x-real-ip"]) ? req.headers["x-real-ip"][0] : req.headers["x-real-ip"]) ?? "unknown";
	return "unknown";
}
function resolveTelegramWebhookRateLimitKey(req, path, config) {
	return `${path}:${resolveTelegramWebhookClientIp(req, config)}`;
}
async function startTelegramWebhook(opts) {
	const path = opts.path ?? "/telegram-webhook";
	const healthPath = opts.healthPath ?? "/healthz";
	const port = opts.port ?? 8787;
	const host = opts.host ?? "127.0.0.1";
	const secret = normalizeOptionalString(opts.secret) ?? "";
	if (!secret) throw new Error("Telegram webhook mode requires a non-empty secret token. Set channels.telegram.webhookSecret in your config.");
	const runtime = opts.runtime ?? defaultRuntime;
	const diagnosticsEnabled = isDiagnosticsEnabled(opts.config);
	const bot = createTelegramBot({
		token: opts.token,
		runtime,
		proxyFetch: opts.fetch,
		config: opts.config,
		accountId: opts.accountId
	});
	await initializeTelegramWebhookBot({
		bot,
		runtime,
		abortSignal: opts.abortSignal
	});
	const telegramWebhookRateLimiter = createFixedWindowRateLimiter({
		windowMs: WEBHOOK_RATE_LIMIT_DEFAULTS.windowMs,
		maxRequests: WEBHOOK_RATE_LIMIT_DEFAULTS.maxRequests,
		maxTrackedKeys: WEBHOOK_RATE_LIMIT_DEFAULTS.maxTrackedKeys
	});
	const handler = grammy.webhookCallback(bot, "callback", {
		secretToken: secret,
		onTimeout: "return",
		timeoutMilliseconds: TELEGRAM_WEBHOOK_CALLBACK_TIMEOUT_MS
	});
	if (diagnosticsEnabled) startDiagnosticHeartbeat(opts.config);
	const server = createServer((req, res) => {
		const respondText = (statusCode, text = "") => {
			if (res.headersSent || res.writableEnded) return;
			res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
			res.end(text);
		};
		if (req.url === healthPath) {
			res.writeHead(200);
			res.end("ok");
			return;
		}
		if (req.url !== path || req.method !== "POST") {
			res.writeHead(404);
			res.end();
			return;
		}
		if (!applyBasicWebhookRequestGuards({
			req,
			res,
			rateLimiter: telegramWebhookRateLimiter,
			rateLimitKey: resolveTelegramWebhookRateLimitKey(req, path, opts.config)
		})) return;
		const startTime = Date.now();
		if (diagnosticsEnabled) logWebhookReceived({
			channel: "telegram",
			updateType: "telegram-post"
		});
		const secretHeader = resolveSingleHeaderValue(req.headers["x-telegram-bot-api-secret-token"]);
		if (!hasValidTelegramWebhookSecret(secretHeader, secret)) {
			res.shouldKeepAlive = false;
			res.setHeader("Connection", "close");
			respondText(401, "unauthorized");
			return;
		}
		(async () => {
			const body = await readJsonBodyWithLimit(req, {
				maxBytes: TELEGRAM_WEBHOOK_MAX_BODY_BYTES,
				timeoutMs: TELEGRAM_WEBHOOK_BODY_TIMEOUT_MS,
				emptyObjectOnEmpty: false
			});
			if (!body.ok) {
				if (body.code === "PAYLOAD_TOO_LARGE") {
					respondText(413, body.error);
					return;
				}
				if (body.code === "REQUEST_BODY_TIMEOUT") {
					respondText(408, body.error);
					return;
				}
				if (body.code === "CONNECTION_CLOSED") {
					respondText(400, body.error);
					return;
				}
				respondText(400, body.error);
				return;
			}
			let replied = false;
			const reply = async (json) => {
				if (replied) return;
				replied = true;
				if (res.headersSent || res.writableEnded) return;
				res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
				res.end(json);
			};
			const unauthorized = async () => {
				if (replied) return;
				replied = true;
				respondText(401, "unauthorized");
			};
			await handler(body.value, reply, secretHeader, unauthorized);
			if (!replied) respondText(200);
			if (diagnosticsEnabled) logWebhookProcessed({
				channel: "telegram",
				updateType: "telegram-post",
				durationMs: Date.now() - startTime
			});
		})().catch((err) => {
			const errMsg = formatErrorMessage(err);
			if (diagnosticsEnabled) logWebhookError({
				channel: "telegram",
				updateType: "telegram-post",
				error: errMsg
			});
			runtime.log?.(`webhook handler failed: ${errMsg}`);
			respondText(500);
		});
	});
	await listenHttpServer({
		server,
		port,
		host
	});
	const boundAddress = server.address();
	const boundPort = boundAddress && typeof boundAddress !== "string" ? boundAddress.port : port;
	const publicUrl = resolveWebhookPublicUrl({
		configuredPublicUrl: opts.publicUrl,
		server,
		path,
		host,
		port
	});
	try {
		await withTelegramApiErrorLogging({
			operation: "setWebhook",
			runtime,
			fn: () => bot.api.setWebhook(publicUrl, {
				secret_token: secret,
				allowed_updates: resolveTelegramAllowedUpdates(),
				certificate: opts.webhookCertPath ? new InputFileCtor(opts.webhookCertPath) : void 0
			})
		});
	} catch (err) {
		server.close();
		bot.stop();
		if (diagnosticsEnabled) stopDiagnosticHeartbeat();
		throw err;
	}
	runtime.log?.(`webhook local listener on http://${host}:${boundPort}${path}`);
	runtime.log?.(`webhook advertised to telegram on ${publicUrl}`);
	let shutDown = false;
	const shutdown = () => {
		if (shutDown) return;
		shutDown = true;
		withTelegramApiErrorLogging({
			operation: "deleteWebhook",
			runtime,
			fn: () => bot.api.deleteWebhook({ drop_pending_updates: false })
		}).catch(() => {});
		server.close();
		bot.stop();
		if (diagnosticsEnabled) stopDiagnosticHeartbeat();
	};
	if (opts.abortSignal) opts.abortSignal.addEventListener("abort", shutdown, { once: true });
	return {
		server,
		bot,
		stop: shutdown
	};
}
//#endregion
export { startTelegramWebhook };
