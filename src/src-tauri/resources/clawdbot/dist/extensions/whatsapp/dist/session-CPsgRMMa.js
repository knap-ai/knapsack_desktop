import { o as resolveWebCredsBackupPath, s as resolveWebCredsPath, t as assertWebCredsPathRegularFileOrMissing } from "./creds-files-B1kSWtBg.js";
import { n as getStatusCode } from "./session-errors-BAj9D2La.js";
import { E as writeWebCredsRawAtomically, S as enqueueCredsSave, T as writeCredsJsonAtomically, b as restoreCredsFromBackupIfNeeded, u as readCredsJsonRaw, w as waitForCredsSaveQueueWithTimeout, y as resolveDefaultWebAuthDir } from "./auth-store-GTQvJznL.js";
import { i as makeWASocket, n as fetchLatestBaileysVersion, o as useMultiFileAuthState, r as makeCacheableSignalKeyStore, t as DisconnectReason } from "./session.runtime-C6uBkEaI.js";
import { VERSION, formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { danger, getChildLogger, success, toPinoLikeLogger } from "openclaw/plugin-sdk/runtime-env";
import { renderQrTerminal } from "openclaw/plugin-sdk/media-runtime";
import { ensureDir, resolveUserPath } from "openclaw/plugin-sdk/text-utility-runtime";
import { randomUUID } from "node:crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import { createHttp1EnvHttpProxyAgent, createHttp1ProxyAgent, resolveActiveManagedProxyTlsOptions, resolveEnvHttpProxyUrl, shouldUseEnvHttpProxyForUrl } from "openclaw/plugin-sdk/fetch-runtime";
//#region extensions/whatsapp/src/socket-timing.ts
const DEFAULT_WHATSAPP_SOCKET_TIMING = {
	keepAliveIntervalMs: 25e3,
	connectTimeoutMs: 6e4,
	defaultQueryTimeoutMs: 6e4
};
function positiveInteger(value) {
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : void 0;
}
function resolveWhatsAppSocketTiming(cfg, overrides) {
	const configured = cfg.web?.whatsapp;
	return {
		keepAliveIntervalMs: positiveInteger(overrides?.keepAliveIntervalMs) ?? positiveInteger(configured?.keepAliveIntervalMs) ?? DEFAULT_WHATSAPP_SOCKET_TIMING.keepAliveIntervalMs,
		connectTimeoutMs: positiveInteger(overrides?.connectTimeoutMs) ?? positiveInteger(configured?.connectTimeoutMs) ?? DEFAULT_WHATSAPP_SOCKET_TIMING.connectTimeoutMs,
		defaultQueryTimeoutMs: positiveInteger(overrides?.defaultQueryTimeoutMs) ?? positiveInteger(configured?.defaultQueryTimeoutMs) ?? DEFAULT_WHATSAPP_SOCKET_TIMING.defaultQueryTimeoutMs
	};
}
//#endregion
//#region extensions/whatsapp/src/session.ts
const LOGGED_OUT_STATUS = DisconnectReason?.loggedOut ?? 401;
const WHATSAPP_WEBSOCKET_PROXY_TARGET = "https://mmg.whatsapp.net/";
const CREDS_FLUSH_TIMEOUT_MESSAGE = "Queued WhatsApp creds save did not finish before auth bootstrap; skipping repair and continuing with primary creds.";
async function rejectUnsafeWebCredsPath(authDir) {
	await assertWebCredsPathRegularFileOrMissing(resolveWebCredsPath(authDir));
}
function enqueueSaveCreds(authDir, saveCreds, logger) {
	enqueueCredsSave(authDir, () => safeSaveCreds(authDir, saveCreds, logger), (err) => {
		logger.warn({ error: String(err) }, "WhatsApp creds save queue error");
	});
}
async function safeSaveCreds(authDir, saveCreds, logger) {
	try {
		const credsPath = resolveWebCredsPath(authDir);
		const backupPath = resolveWebCredsBackupPath(authDir);
		const raw = readCredsJsonRaw(credsPath);
		if (raw) try {
			JSON.parse(raw);
			await writeWebCredsRawAtomically({
				filePath: backupPath,
				content: raw,
				tempPrefix: ".creds.backup"
			});
		} catch {}
	} catch {}
	try {
		await Promise.resolve(saveCreds());
	} catch (err) {
		logger.warn({ error: String(err) }, "failed saving WhatsApp creds");
	}
}
async function printTerminalQr(qr) {
	const output = await renderQrTerminal(qr);
	process.stdout.write(output.endsWith("\n") ? output : `${output}\n`);
}
/**
* Create a Baileys socket backed by the multi-file auth store we keep on disk.
* Consumers can opt into QR printing for interactive login flows.
*/
async function createWaSocket(printQr, verbose, opts = {}) {
	const logger = toPinoLikeLogger(getChildLogger({ module: "baileys" }, { level: verbose ? "info" : "silent" }), verbose ? "info" : "silent");
	const authDir = resolveUserPath(opts.authDir ?? resolveDefaultWebAuthDir());
	await rejectUnsafeWebCredsPath(authDir);
	await ensureDir(authDir);
	const sessionLogger = getChildLogger({ module: "web-session" });
	if (await waitForCredsSaveQueueWithTimeout(authDir) === "timed_out") sessionLogger.warn({ authDir }, CREDS_FLUSH_TIMEOUT_MESSAGE);
	else {
		await rejectUnsafeWebCredsPath(authDir);
		await restoreCredsFromBackupIfNeeded(authDir);
	}
	await rejectUnsafeWebCredsPath(authDir);
	const { state } = await useMultiFileAuthState(authDir);
	const saveCreds = async () => {
		await writeCredsJsonAtomically(authDir, state.creds);
	};
	const { version } = await fetchLatestBaileysVersion();
	const agent = await resolveEnvProxyAgent(sessionLogger);
	const fetchAgent = await resolveEnvFetchDispatcher(sessionLogger, agent);
	const socketTiming = {
		keepAliveIntervalMs: opts.keepAliveIntervalMs ?? DEFAULT_WHATSAPP_SOCKET_TIMING.keepAliveIntervalMs,
		connectTimeoutMs: opts.connectTimeoutMs ?? DEFAULT_WHATSAPP_SOCKET_TIMING.connectTimeoutMs,
		defaultQueryTimeoutMs: opts.defaultQueryTimeoutMs ?? DEFAULT_WHATSAPP_SOCKET_TIMING.defaultQueryTimeoutMs
	};
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
		...socketTiming,
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
					console.log("Open the WhatsApp app, go to Linked Devices, then scan this QR:");
					printTerminalQr(qr).catch((err) => {
						sessionLogger.warn({ error: String(err) }, "failed rendering WhatsApp QR");
					});
				}
			}
			if (connection === "close") {
				if (getStatusCode(lastDisconnect?.error) === LOGGED_OUT_STATUS) console.error(danger(`WhatsApp session logged out. Run: ${formatCliCommand("openclaw channels login")}`));
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
	if (!shouldUseEnvHttpProxyForUrl(WHATSAPP_WEBSOCKET_PROXY_TARGET)) return;
	const proxyUrl = resolveEnvHttpProxyUrl("https");
	if (!proxyUrl) return;
	const proxyTls = resolveActiveManagedProxyTlsOptions({ proxyUrl });
	const proxyAgentOptions = proxyTls?.ca ? { ca: proxyTls.ca } : void 0;
	try {
		const agent = new HttpsProxyAgent(proxyUrl, proxyAgentOptions);
		logger.info("Using ambient env proxy for WhatsApp WebSocket connection");
		return agent;
	} catch (error) {
		logger.warn({ error: String(error) }, "Failed to initialize env proxy agent for WhatsApp WebSocket connection");
		return;
	}
}
async function resolveEnvFetchDispatcher(logger, agent) {
	const proxyUrl = resolveProxyUrlFromAgent(agent);
	const envProxyUrl = resolveEnvHttpsProxyUrl();
	if (!proxyUrl && !envProxyUrl) return;
	try {
		return proxyUrl ? createHttp1ProxyAgent({ uri: proxyUrl }) : createHttp1EnvHttpProxyAgent();
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
function newConnectionId() {
	return randomUUID();
}
//#endregion
export { renderQrTerminal as a, resolveWhatsAppSocketTiming as i, newConnectionId as n, waitForWaConnection as r, createWaSocket as t };
