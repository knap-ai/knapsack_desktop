import { n as resolveWebCredsBackupPath, r as resolveWebCredsPath } from "./creds-files-BD3Rjqo2.js";
import { n as registerWhatsAppConnectionController, r as unregisterWhatsAppConnectionController } from "./connection-controller-registry-B3czWHIv.js";
import { a as maybeRestoreCredsFromBackup, i as logoutWeb, s as readCredsJsonRaw, u as resolveDefaultWebAuthDir } from "./auth-store-3FRPEigM.js";
import { n as getStatusCode, t as formatError } from "./session-errors-CjMYNFqh.js";
import fs from "node:fs";
import path from "node:path";
import { clamp, ensureDir, resolveUserPath } from "openclaw/plugin-sdk/text-runtime";
import { VERSION, formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { computeBackoff, danger, getChildLogger as getChildLogger$1, info, sleepWithAbort, success, toPinoLikeLogger } from "openclaw/plugin-sdk/runtime-env";
import fs$1 from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolveAmbientNodeProxyAgent } from "openclaw/plugin-sdk/extension-shared";
import { BufferJSON, DisconnectReason, DisconnectReason as DisconnectReason$1, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
const DEFAULT_RECONNECT_POLICY = {
	initialMs: 2e3,
	maxMs: 3e4,
	factor: 1.8,
	jitter: .25,
	maxAttempts: 12
};
function resolveHeartbeatSeconds(cfg, overrideSeconds) {
	const candidate = overrideSeconds ?? cfg.web?.heartbeatSeconds;
	if (typeof candidate === "number" && candidate > 0) return candidate;
	return 60;
}
function resolveReconnectPolicy(cfg, overrides) {
	const reconnectOverrides = cfg.web?.reconnect ?? {};
	const overrideConfig = overrides ?? {};
	const merged = {
		...DEFAULT_RECONNECT_POLICY,
		...reconnectOverrides,
		...overrideConfig
	};
	merged.initialMs = Math.max(250, merged.initialMs);
	merged.maxMs = Math.max(merged.initialMs, merged.maxMs);
	merged.factor = clamp(merged.factor, 1.1, 10);
	merged.jitter = clamp(merged.jitter, 0, 1);
	merged.maxAttempts = Math.max(0, Math.floor(merged.maxAttempts));
	return merged;
}
function newConnectionId$1() {
	return randomUUID();
}
//#endregion
//#region extensions/whatsapp/src/session.ts
const LOGGED_OUT_STATUS$1 = DisconnectReason$1?.loggedOut ?? 401;
async function loadQrTerminal() {
	const mod = await import("qrcode-terminal");
	return mod.default ?? mod;
}
async function writeCredsJsonAtomically(authDir, creds) {
	const credsPath = resolveWebCredsPath(authDir);
	const tempPath = path.join(authDir, `.creds.${process.pid}.${Date.now()}.tmp`);
	try {
		await fs$1.writeFile(tempPath, JSON.stringify(creds, BufferJSON.replacer), { mode: 384 });
		await fs$1.rename(tempPath, credsPath);
	} catch (err) {
		try {
			await fs$1.rm(tempPath, { force: true });
		} catch {}
		throw err;
	}
}
const credsSaveQueues = /* @__PURE__ */ new Map();
const CREDS_SAVE_FLUSH_TIMEOUT_MS = 15e3;
function enqueueSaveCreds(authDir, saveCreds, logger) {
	const next = (credsSaveQueues.get(authDir) ?? Promise.resolve()).then(() => safeSaveCreds(authDir, saveCreds, logger)).catch((err) => {
		logger.warn({ error: String(err) }, "WhatsApp creds save queue error");
	}).finally(() => {
		if (credsSaveQueues.get(authDir) === next) credsSaveQueues.delete(authDir);
	});
	credsSaveQueues.set(authDir, next);
}
async function safeSaveCreds(authDir, saveCreds, logger) {
	try {
		const credsPath = resolveWebCredsPath(authDir);
		const backupPath = resolveWebCredsBackupPath(authDir);
		const raw = readCredsJsonRaw(credsPath);
		if (raw) try {
			JSON.parse(raw);
			fs.copyFileSync(credsPath, backupPath);
			try {
				fs.chmodSync(backupPath, 384);
			} catch {}
		} catch {}
	} catch {}
	try {
		await Promise.resolve(saveCreds());
	} catch (err) {
		logger.warn({ error: String(err) }, "failed saving WhatsApp creds");
	}
}
/**
* Create a Baileys socket backed by the multi-file auth store we keep on disk.
* Consumers can opt into QR printing for interactive login flows.
*/
async function createWaSocket(printQr, verbose, opts = {}) {
	const logger = toPinoLikeLogger(getChildLogger$1({ module: "baileys" }, { level: verbose ? "info" : "silent" }), verbose ? "info" : "silent");
	const authDir = resolveUserPath(opts.authDir ?? resolveDefaultWebAuthDir());
	await ensureDir(authDir);
	const sessionLogger = getChildLogger$1({ module: "web-session" });
	maybeRestoreCredsFromBackup(authDir);
	const { state } = await useMultiFileAuthState(authDir);
	const saveCreds = async () => {
		await writeCredsJsonAtomically(authDir, state.creds);
	};
	const { version } = await fetchLatestBaileysVersion();
	const agent = await resolveEnvProxyAgent(sessionLogger);
	const fetchAgent = await resolveEnvFetchDispatcher(sessionLogger, agent);
	const sock = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger)
		},
		version,
		logger,
		printQRInTerminal: false,
		browser: [
			"openclaw",
			"cli",
			VERSION
		],
		syncFullHistory: false,
		markOnlineOnConnect: false,
		agent,
		fetchAgent
	});
	sock.ev.on("creds.update", () => enqueueSaveCreds(authDir, saveCreds, sessionLogger));
	sock.ev.on("connection.update", async (update) => {
		try {
			const { connection, lastDisconnect, qr } = update;
			if (qr) {
				opts.onQr?.(qr);
				if (printQr) {
					console.log("Scan this QR in WhatsApp (Linked Devices):");
					(await loadQrTerminal()).generate(qr, { small: true });
				}
			}
			if (connection === "close") {
				if (getStatusCode(lastDisconnect?.error) === LOGGED_OUT_STATUS$1) console.error(danger(`WhatsApp session logged out. Run: ${formatCliCommand("openclaw channels login")}`));
			}
			if (connection === "open" && verbose) console.log(success("WhatsApp Web connected."));
		} catch (err) {
			sessionLogger.error({ error: String(err) }, "connection.update handler error");
		}
	});
	if (sock.ws && typeof sock.ws.on === "function") sock.ws.on("error", (err) => {
		sessionLogger.error({ error: String(err) }, "WebSocket error");
	});
	return sock;
}
async function resolveEnvProxyAgent(logger) {
	return resolveAmbientNodeProxyAgent({
		onError: (err) => {
			logger.warn({ error: String(err) }, "Failed to initialize env proxy agent for WhatsApp WebSocket connection");
		},
		onUsingProxy: () => {
			logger.info("Using ambient env proxy for WhatsApp WebSocket connection");
		}
	});
}
async function resolveEnvFetchDispatcher(logger, agent) {
	const proxyUrl = resolveProxyUrlFromAgent(agent);
	const envProxyUrl = resolveEnvHttpsProxyUrl();
	if (!proxyUrl && !envProxyUrl) return;
	try {
		const { EnvHttpProxyAgent, ProxyAgent } = await import("undici");
		return proxyUrl ? new ProxyAgent({
			allowH2: false,
			uri: proxyUrl
		}) : new EnvHttpProxyAgent({ allowH2: false });
	} catch (error) {
		logger.warn({ error: String(error) }, "Failed to initialize env proxy dispatcher for WhatsApp media uploads");
		return;
	}
}
function resolveProxyUrlFromAgent(agent) {
	if (typeof agent !== "object" || agent === null || !("proxy" in agent)) return;
	const proxy = agent.proxy;
	if (proxy instanceof URL) return proxy.toString();
	return typeof proxy === "string" && proxy.length > 0 ? proxy : void 0;
}
function resolveEnvHttpsProxyUrl(env = process.env) {
	const lowerHttpsProxy = normalizeEnvProxyValue(env.https_proxy);
	const lowerHttpProxy = normalizeEnvProxyValue(env.http_proxy);
	const httpsProxy = lowerHttpsProxy !== void 0 ? lowerHttpsProxy : normalizeEnvProxyValue(env.HTTPS_PROXY);
	const httpProxy = lowerHttpProxy !== void 0 ? lowerHttpProxy : normalizeEnvProxyValue(env.HTTP_PROXY);
	return httpsProxy ?? httpProxy ?? void 0;
}
function normalizeEnvProxyValue(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
async function waitForWaConnection(sock) {
	return new Promise((resolve, reject) => {
		const evWithOff = sock.ev;
		const handler = (...args) => {
			const update = args[0] ?? {};
			if (update.connection === "open") {
				evWithOff.off?.("connection.update", handler);
				resolve();
			}
			if (update.connection === "close") {
				evWithOff.off?.("connection.update", handler);
				reject(update.lastDisconnect ?? /* @__PURE__ */ new Error("Connection closed"));
			}
		};
		sock.ev.on("connection.update", handler);
	});
}
/** Await pending credential saves — scoped to one authDir, or all if omitted. */
function waitForCredsSaveQueue(authDir) {
	if (authDir) return credsSaveQueues.get(authDir) ?? Promise.resolve();
	return Promise.all(credsSaveQueues.values()).then(() => {});
}
/** Await pending credential saves, but don't hang forever on stalled I/O. */
async function waitForCredsSaveQueueWithTimeout(authDir, timeoutMs = CREDS_SAVE_FLUSH_TIMEOUT_MS) {
	let flushTimeout;
	await Promise.race([waitForCredsSaveQueue(authDir), new Promise((resolve) => {
		flushTimeout = setTimeout(resolve, timeoutMs);
	})]).finally(() => {
		if (flushTimeout) clearTimeout(flushTimeout);
	});
}
function newConnectionId() {
	return randomUUID();
}
//#endregion
//#region extensions/whatsapp/src/connection-controller.ts
const LOGGED_OUT_STATUS = DisconnectReason?.loggedOut ?? 401;
const WHATSAPP_LOGIN_RESTART_MESSAGE = "WhatsApp asked for a restart after pairing (code 515); waiting for creds to save…";
const WHATSAPP_LOGGED_OUT_RELINK_MESSAGE = "WhatsApp reported the session is logged out. Cleared cached web session; please rerun openclaw channels login and scan the QR again.";
const WHATSAPP_LOGGED_OUT_QR_MESSAGE = "WhatsApp reported the session is logged out. Cleared cached web session; please scan a new QR.";
function createNeverResolvePromise() {
	return new Promise(() => {});
}
function createLiveConnection(params) {
	let closeResolved = false;
	let resolveClosePromise = (_reason) => {};
	const closePromise = new Promise((resolve) => {
		resolveClosePromise = (reason) => {
			if (closeResolved) return;
			closeResolved = true;
			resolve(reason);
		};
	});
	return {
		connectionId: params.connectionId,
		startedAt: Date.now(),
		sock: params.sock,
		listener: params.listener,
		heartbeat: null,
		watchdogTimer: null,
		lastInboundAt: null,
		handledMessages: 0,
		unregisterUnhandled: null,
		backgroundTasks: /* @__PURE__ */ new Set(),
		closePromise,
		resolveClose: resolveClosePromise
	};
}
function closeWaSocket(sock) {
	try {
		sock?.ws?.close?.();
	} catch {}
}
function closeWaSocketSoon(sock, delayMs = 500) {
	setTimeout(() => {
		closeWaSocket(sock);
	}, delayMs);
}
async function waitForWhatsAppLoginResult(params) {
	const wait = params.waitForConnection ?? waitForWaConnection;
	const createSocket = params.createSocket ?? createWaSocket;
	let currentSock = params.sock;
	let restarted = false;
	while (true) try {
		await wait(currentSock);
		return {
			outcome: "connected",
			restarted,
			sock: currentSock
		};
	} catch (err) {
		const statusCode = getStatusCode(err);
		if (statusCode === 515 && !restarted) {
			restarted = true;
			params.runtime.log(info(WHATSAPP_LOGIN_RESTART_MESSAGE));
			closeWaSocket(currentSock);
			await waitForCredsSaveQueueWithTimeout(params.authDir);
			try {
				currentSock = await createSocket(false, params.verbose, { authDir: params.authDir });
				params.onSocketReplaced?.(currentSock);
				continue;
			} catch (createErr) {
				return {
					outcome: "failed",
					message: formatError(createErr),
					statusCode: getStatusCode(createErr),
					error: createErr
				};
			}
		}
		if (statusCode === LOGGED_OUT_STATUS) {
			await logoutWeb({
				authDir: params.authDir,
				isLegacyAuthDir: params.isLegacyAuthDir,
				runtime: params.runtime
			});
			return {
				outcome: "logged-out",
				message: WHATSAPP_LOGGED_OUT_RELINK_MESSAGE,
				statusCode: LOGGED_OUT_STATUS,
				error: err
			};
		}
		return {
			outcome: "failed",
			message: formatError(err),
			statusCode,
			error: err
		};
	}
}
var WhatsAppConnectionController = class {
	constructor(params) {
		this.disconnectRetryController = new AbortController();
		this.current = null;
		this.reconnectAttempts = 0;
		this.accountId = params.accountId;
		this.authDir = params.authDir;
		this.verbose = params.verbose;
		this.keepAlive = params.keepAlive;
		this.heartbeatSeconds = params.heartbeatSeconds;
		this.messageTimeoutMs = params.messageTimeoutMs;
		this.watchdogCheckMs = params.watchdogCheckMs;
		this.reconnectPolicy = params.reconnectPolicy;
		this.abortSignal = params.abortSignal;
		this.sleep = params.sleep ?? ((ms, signal) => sleepWithAbort(ms, signal));
		this.isNonRetryableStatus = params.isNonRetryableStatus ?? (() => false);
		this.socketRef = { current: null };
		this.abortPromise = params.abortSignal && new Promise((resolve) => {
			params.abortSignal?.addEventListener("abort", () => resolve("aborted"), { once: true });
		});
		if (params.abortSignal?.aborted) this.stopDisconnectRetries();
		else params.abortSignal?.addEventListener("abort", () => this.stopDisconnectRetries(), { once: true });
	}
	getActiveListener() {
		return this.current?.listener ?? null;
	}
	getReconnectAttempts() {
		return this.reconnectAttempts;
	}
	isStopRequested() {
		return this.abortSignal?.aborted === true;
	}
	shouldRetryDisconnect() {
		return this.keepAlive && !this.isStopRequested() && !this.disconnectRetryController.signal.aborted;
	}
	getDisconnectRetryAbortSignal() {
		return this.disconnectRetryController.signal;
	}
	noteInbound(timestamp = Date.now()) {
		if (!this.current) return;
		this.current.handledMessages += 1;
		this.current.lastInboundAt = timestamp;
	}
	getCurrentSnapshot(connection = this.current) {
		if (!connection) return null;
		return {
			connectionId: connection.connectionId,
			startedAt: connection.startedAt,
			lastInboundAt: connection.lastInboundAt,
			handledMessages: connection.handledMessages,
			reconnectAttempts: this.reconnectAttempts,
			uptimeMs: Date.now() - connection.startedAt
		};
	}
	setUnhandledRejectionCleanup(unregister) {
		if (!this.current) {
			unregister?.();
			return;
		}
		this.current.unregisterUnhandled?.();
		this.current.unregisterUnhandled = unregister;
	}
	async openConnection(params) {
		if (this.current) await this.closeCurrentConnection();
		let sock = null;
		let connection = null;
		try {
			await waitForCredsSaveQueueWithTimeout(this.authDir);
			sock = await createWaSocket(false, this.verbose, { authDir: this.authDir });
			await waitForWaConnection(sock);
			this.socketRef.current = sock;
			connection = createLiveConnection({
				connectionId: params.connectionId,
				sock,
				listener: {}
			});
			const listener = await params.createListener({
				sock,
				connection
			});
			connection.listener = listener;
			this.current = connection;
			registerWhatsAppConnectionController(this.accountId, this);
			this.startTimers(connection, {
				onHeartbeat: params.onHeartbeat,
				onWatchdogTimeout: params.onWatchdogTimeout
			});
			return connection;
		} catch (err) {
			if (this.socketRef.current === sock) this.socketRef.current = null;
			closeWaSocket(sock);
			if (connection?.unregisterUnhandled) connection.unregisterUnhandled();
			throw err;
		}
	}
	async waitForClose() {
		const connection = this.current;
		if (!connection) return "aborted";
		const listenerClose = connection.listener.onClose?.catch((err) => ({
			status: 500,
			isLoggedOut: false,
			error: err
		})) ?? createNeverResolvePromise();
		return await Promise.race([
			connection.closePromise,
			listenerClose,
			this.abortPromise ?? createNeverResolvePromise()
		]);
	}
	normalizeCloseReason(reason) {
		const statusCode = (typeof reason === "object" && reason && "status" in reason ? reason.status : void 0) ?? void 0;
		return {
			statusCode,
			statusLabel: typeof statusCode === "number" ? statusCode : "unknown",
			isLoggedOut: typeof reason === "object" && reason !== null && "isLoggedOut" in reason && reason.isLoggedOut === true,
			error: reason?.error,
			errorText: formatError(reason)
		};
	}
	resolveCloseDecision(reason) {
		if (reason === "aborted" || this.isStopRequested()) return "aborted";
		const current = this.current;
		if (current && Date.now() - current.startedAt > this.heartbeatSeconds * 1e3) this.reconnectAttempts = 0;
		const normalized = this.normalizeCloseReason(reason);
		if (normalized.isLoggedOut) return {
			action: "stop",
			reconnectAttempts: this.reconnectAttempts,
			healthState: "logged-out",
			normalized
		};
		if (this.isNonRetryableStatus(normalized.statusCode)) return {
			action: "stop",
			reconnectAttempts: this.reconnectAttempts,
			healthState: "conflict",
			normalized
		};
		this.reconnectAttempts += 1;
		if (this.reconnectPolicy.maxAttempts > 0 && this.reconnectAttempts >= this.reconnectPolicy.maxAttempts) return {
			action: "stop",
			reconnectAttempts: this.reconnectAttempts,
			healthState: "stopped",
			normalized
		};
		return {
			action: "retry",
			delayMs: computeBackoff(this.reconnectPolicy, this.reconnectAttempts),
			reconnectAttempts: this.reconnectAttempts,
			healthState: "reconnecting",
			normalized
		};
	}
	forceClose(reason) {
		const connection = this.current;
		if (!connection) return;
		connection.resolveClose(reason);
		connection.listener.signalClose?.(reason);
	}
	async closeCurrentConnection() {
		const connection = this.current;
		if (!connection) return;
		this.current = null;
		if (this.socketRef.current === connection.sock) this.socketRef.current = null;
		connection.unregisterUnhandled?.();
		if (connection.heartbeat) clearInterval(connection.heartbeat);
		if (connection.watchdogTimer) clearInterval(connection.watchdogTimer);
		if (connection.backgroundTasks.size > 0) {
			await Promise.allSettled(connection.backgroundTasks);
			connection.backgroundTasks.clear();
		}
		try {
			await connection.listener.close?.();
		} catch {}
		closeWaSocket(connection.sock);
	}
	async waitBeforeRetry(delayMs) {
		await this.sleep(delayMs, this.abortSignal);
	}
	async shutdown() {
		this.stopDisconnectRetries();
		await this.closeCurrentConnection();
		unregisterWhatsAppConnectionController(this.accountId, this);
	}
	startTimers(connection, hooks) {
		if (!this.keepAlive) return;
		connection.heartbeat = setInterval(() => {
			const snapshot = this.getCurrentSnapshot(connection);
			if (!snapshot) return;
			hooks.onHeartbeat?.(snapshot);
		}, this.heartbeatSeconds * 1e3);
		connection.watchdogTimer = setInterval(() => {
			const baselineAt = connection.lastInboundAt ?? connection.startedAt;
			if (Date.now() - baselineAt <= this.messageTimeoutMs) return;
			const snapshot = this.getCurrentSnapshot(connection);
			if (!snapshot) return;
			hooks.onWatchdogTimeout?.(snapshot);
			this.forceClose({
				status: 499,
				isLoggedOut: false,
				error: "watchdog-timeout"
			});
		}, this.watchdogCheckMs);
	}
	stopDisconnectRetries() {
		if (!this.disconnectRetryController.signal.aborted) this.disconnectRetryController.abort();
	}
};
//#endregion
export { sleepWithAbort as _, waitForWhatsAppLoginResult as a, waitForCredsSaveQueue as c, writeCredsJsonAtomically as d, DEFAULT_RECONNECT_POLICY as f, resolveReconnectPolicy as g, resolveHeartbeatSeconds as h, closeWaSocketSoon as i, waitForCredsSaveQueueWithTimeout as l, newConnectionId$1 as m, WhatsAppConnectionController as n, createWaSocket as o, computeBackoff as p, closeWaSocket as r, newConnectionId as s, WHATSAPP_LOGGED_OUT_QR_MESSAGE as t, waitForWaConnection as u };
