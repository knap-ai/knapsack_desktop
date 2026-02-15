import { $ as resolveStateDir, U as resolveConfigPath, q as resolveGatewayPort } from "./entry.js";
import { s as ensureDir, t as CONFIG_DIR, x as shortenHomeInString, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import { t as pickPrimaryTailnetIPv4 } from "./tailnet-3BgKN5Il.js";
import { c as pickPrimaryLanIPv4 } from "./ws-D56uQr0E.js";
import { Dt as PROTOCOL_VERSION, It as normalizeFingerprint, Rt as loadOrCreateDeviceIdentity, t as GatewayClient } from "./client-DV6vI7ic.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import { X509Certificate, randomUUID } from "node:crypto";

//#region src/infra/tls/gateway.ts
const execFileAsync = promisify(execFile);
async function fileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}
async function generateSelfSignedCert(params) {
	const certDir = path.dirname(params.certPath);
	const keyDir = path.dirname(params.keyPath);
	await ensureDir(certDir);
	if (keyDir !== certDir) await ensureDir(keyDir);
	await execFileAsync("openssl", [
		"req",
		"-x509",
		"-newkey",
		"rsa:2048",
		"-sha256",
		"-days",
		"3650",
		"-nodes",
		"-keyout",
		params.keyPath,
		"-out",
		params.certPath,
		"-subj",
		"/CN=openclaw-gateway"
	]);
	await fs.chmod(params.keyPath, 384).catch(() => {});
	await fs.chmod(params.certPath, 384).catch(() => {});
	params.log?.info?.(`gateway tls: generated self-signed cert at ${shortenHomeInString(params.certPath)}`);
}
async function loadGatewayTlsRuntime(cfg, log) {
	if (!cfg || cfg.enabled !== true) return {
		enabled: false,
		required: false
	};
	const autoGenerate = cfg.autoGenerate !== false;
	const baseDir = path.join(CONFIG_DIR, "gateway", "tls");
	const certPath = resolveUserPath(cfg.certPath ?? path.join(baseDir, "gateway-cert.pem"));
	const keyPath = resolveUserPath(cfg.keyPath ?? path.join(baseDir, "gateway-key.pem"));
	const caPath = cfg.caPath ? resolveUserPath(cfg.caPath) : void 0;
	const hasCert = await fileExists(certPath);
	const hasKey = await fileExists(keyPath);
	if (!hasCert && !hasKey && autoGenerate) try {
		await generateSelfSignedCert({
			certPath,
			keyPath,
			log
		});
	} catch (err) {
		return {
			enabled: false,
			required: true,
			certPath,
			keyPath,
			error: `gateway tls: failed to generate cert (${String(err)})`
		};
	}
	if (!await fileExists(certPath) || !await fileExists(keyPath)) return {
		enabled: false,
		required: true,
		certPath,
		keyPath,
		error: "gateway tls: cert/key missing"
	};
	try {
		const cert = await fs.readFile(certPath, "utf8");
		const key = await fs.readFile(keyPath, "utf8");
		const ca = caPath ? await fs.readFile(caPath, "utf8") : void 0;
		const fingerprintSha256 = normalizeFingerprint(new X509Certificate(cert).fingerprint256 ?? "");
		if (!fingerprintSha256) return {
			enabled: false,
			required: true,
			certPath,
			keyPath,
			caPath,
			error: "gateway tls: unable to compute certificate fingerprint"
		};
		return {
			enabled: true,
			required: true,
			certPath,
			keyPath,
			caPath,
			fingerprintSha256,
			tlsOptions: {
				cert,
				key,
				ca,
				minVersion: "TLSv1.3"
			}
		};
	} catch (err) {
		return {
			enabled: false,
			required: true,
			certPath,
			keyPath,
			caPath,
			error: `gateway tls: failed to load cert (${String(err)})`
		};
	}
}

//#endregion
//#region src/gateway/call.ts
function resolveExplicitGatewayAuth(opts) {
	return {
		token: typeof opts?.token === "string" && opts.token.trim().length > 0 ? opts.token.trim() : void 0,
		password: typeof opts?.password === "string" && opts.password.trim().length > 0 ? opts.password.trim() : void 0
	};
}
function ensureExplicitGatewayAuth(params) {
	if (!params.urlOverride) return;
	if (params.auth.token || params.auth.password) return;
	const message = [
		"gateway url override requires explicit credentials",
		params.errorHint,
		params.configPath ? `Config: ${params.configPath}` : void 0
	].filter(Boolean).join("\n");
	throw new Error(message);
}
function buildGatewayConnectionDetails(options = {}) {
	const config = options.config ?? loadConfig();
	const configPath = options.configPath ?? resolveConfigPath(process.env, resolveStateDir(process.env));
	const isRemoteMode = config.gateway?.mode === "remote";
	const remote = isRemoteMode ? config.gateway?.remote : void 0;
	const tlsEnabled = config.gateway?.tls?.enabled === true;
	const localPort = resolveGatewayPort(config);
	const tailnetIPv4 = pickPrimaryTailnetIPv4();
	const bindMode = config.gateway?.bind ?? "loopback";
	const preferTailnet = bindMode === "tailnet" && !!tailnetIPv4;
	const preferLan = bindMode === "lan";
	const lanIPv4 = preferLan ? pickPrimaryLanIPv4() : void 0;
	const scheme = tlsEnabled ? "wss" : "ws";
	const localUrl = preferTailnet && tailnetIPv4 ? `${scheme}://${tailnetIPv4}:${localPort}` : preferLan && lanIPv4 ? `${scheme}://${lanIPv4}:${localPort}` : `${scheme}://127.0.0.1:${localPort}`;
	const urlOverride = typeof options.url === "string" && options.url.trim().length > 0 ? options.url.trim() : void 0;
	const remoteUrl = typeof remote?.url === "string" && remote.url.trim().length > 0 ? remote.url.trim() : void 0;
	const remoteMisconfigured = isRemoteMode && !urlOverride && !remoteUrl;
	const url = urlOverride || remoteUrl || localUrl;
	const urlSource = urlOverride ? "cli --url" : remoteUrl ? "config gateway.remote.url" : remoteMisconfigured ? "missing gateway.remote.url (fallback local)" : preferTailnet && tailnetIPv4 ? `local tailnet ${tailnetIPv4}` : preferLan && lanIPv4 ? `local lan ${lanIPv4}` : "local loopback";
	const remoteFallbackNote = remoteMisconfigured ? "Warn: gateway.mode=remote but gateway.remote.url is missing; set gateway.remote.url or switch gateway.mode=local." : void 0;
	const bindDetail = !urlOverride && !remoteUrl ? `Bind: ${bindMode}` : void 0;
	return {
		url,
		urlSource,
		bindDetail,
		remoteFallbackNote,
		message: [
			`Gateway target: ${url}`,
			`Source: ${urlSource}`,
			`Config: ${configPath}`,
			bindDetail,
			remoteFallbackNote
		].filter(Boolean).join("\n")
	};
}
async function callGateway(opts) {
	const timeoutMs = typeof opts.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 1e4;
	const safeTimerTimeoutMs = Math.max(1, Math.min(Math.floor(timeoutMs), 2147483647));
	const config = opts.config ?? loadConfig();
	const isRemoteMode = config.gateway?.mode === "remote";
	const remote = isRemoteMode ? config.gateway?.remote : void 0;
	const urlOverride = typeof opts.url === "string" && opts.url.trim().length > 0 ? opts.url.trim() : void 0;
	const explicitAuth = resolveExplicitGatewayAuth({
		token: opts.token,
		password: opts.password
	});
	ensureExplicitGatewayAuth({
		urlOverride,
		auth: explicitAuth,
		errorHint: "Fix: pass --token or --password (or gatewayToken in tools).",
		configPath: opts.configPath ?? resolveConfigPath(process.env, resolveStateDir(process.env))
	});
	const remoteUrl = typeof remote?.url === "string" && remote.url.trim().length > 0 ? remote.url.trim() : void 0;
	if (isRemoteMode && !urlOverride && !remoteUrl) {
		const configPath = opts.configPath ?? resolveConfigPath(process.env, resolveStateDir(process.env));
		throw new Error([
			"gateway remote mode misconfigured: gateway.remote.url missing",
			`Config: ${configPath}`,
			"Fix: set gateway.remote.url, or set gateway.mode=local."
		].join("\n"));
	}
	const authToken = config.gateway?.auth?.token;
	const authPassword = config.gateway?.auth?.password;
	const connectionDetails = buildGatewayConnectionDetails({
		config,
		url: urlOverride,
		...opts.configPath ? { configPath: opts.configPath } : {}
	});
	const url = connectionDetails.url;
	const tlsRuntime = config.gateway?.tls?.enabled === true && !urlOverride && !remoteUrl && url.startsWith("wss://") ? await loadGatewayTlsRuntime(config.gateway?.tls) : void 0;
	const remoteTlsFingerprint = isRemoteMode && !urlOverride && remoteUrl && typeof remote?.tlsFingerprint === "string" ? remote.tlsFingerprint.trim() : void 0;
	const tlsFingerprint = (typeof opts.tlsFingerprint === "string" ? opts.tlsFingerprint.trim() : void 0) || remoteTlsFingerprint || (tlsRuntime?.enabled ? tlsRuntime.fingerprintSha256 : void 0);
	const token = explicitAuth.token || (!urlOverride ? isRemoteMode ? typeof remote?.token === "string" && remote.token.trim().length > 0 ? remote.token.trim() : void 0 : process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || process.env.CLAWDBOT_GATEWAY_TOKEN?.trim() || (typeof authToken === "string" && authToken.trim().length > 0 ? authToken.trim() : void 0) : void 0);
	const password = explicitAuth.password || (!urlOverride ? process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() || process.env.CLAWDBOT_GATEWAY_PASSWORD?.trim() || (isRemoteMode ? typeof remote?.password === "string" && remote.password.trim().length > 0 ? remote.password.trim() : void 0 : typeof authPassword === "string" && authPassword.trim().length > 0 ? authPassword.trim() : void 0) : void 0);
	const formatCloseError = (code, reason) => {
		const reasonText = reason?.trim() || "no close reason";
		const hint = code === 1006 ? "abnormal closure (no close frame)" : code === 1e3 ? "normal closure" : "";
		return `gateway closed (${code}${hint ? ` ${hint}` : ""}): ${reasonText}\n${connectionDetails.message}`;
	};
	const formatTimeoutError = () => `gateway timeout after ${timeoutMs}ms\n${connectionDetails.message}`;
	return await new Promise((resolve, reject) => {
		let settled = false;
		let ignoreClose = false;
		const stop = (err, value) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			if (err) reject(err);
			else resolve(value);
		};
		const client = new GatewayClient({
			url,
			token,
			password,
			tlsFingerprint,
			instanceId: opts.instanceId ?? randomUUID(),
			clientName: opts.clientName ?? GATEWAY_CLIENT_NAMES.CLI,
			clientDisplayName: opts.clientDisplayName,
			clientVersion: opts.clientVersion ?? "dev",
			platform: opts.platform,
			mode: opts.mode ?? GATEWAY_CLIENT_MODES.CLI,
			role: "operator",
			scopes: [
				"operator.admin",
				"operator.approvals",
				"operator.pairing"
			],
			deviceIdentity: loadOrCreateDeviceIdentity(),
			minProtocol: opts.minProtocol ?? PROTOCOL_VERSION,
			maxProtocol: opts.maxProtocol ?? PROTOCOL_VERSION,
			onHelloOk: async () => {
				try {
					const result = await client.request(opts.method, opts.params, { expectFinal: opts.expectFinal });
					ignoreClose = true;
					stop(void 0, result);
					client.stop();
				} catch (err) {
					ignoreClose = true;
					client.stop();
					stop(err);
				}
			},
			onClose: (code, reason) => {
				if (settled || ignoreClose) return;
				ignoreClose = true;
				client.stop();
				stop(new Error(formatCloseError(code, reason)));
			}
		});
		const timer = setTimeout(() => {
			ignoreClose = true;
			client.stop();
			stop(new Error(formatTimeoutError()));
		}, safeTimerTimeoutMs);
		client.start();
	});
}
function randomIdempotencyKey() {
	return randomUUID();
}

//#endregion
export { resolveExplicitGatewayAuth as a, randomIdempotencyKey as i, callGateway as n, loadGatewayTlsRuntime as o, ensureExplicitGatewayAuth as r, buildGatewayConnectionDetails as t };