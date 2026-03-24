import { _ as resolveStateDir, o as resolveConfigPath, u as resolveGatewayPort } from "./paths-ViKUYWUK.js";
import { c as ensureDir, t as CONFIG_DIR, x as shortenHomeInString, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { n as VERSION } from "./version-CD3oP1-d.js";
import { d as resolveSecretInputRef, l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { i as resolveSecretRefString } from "./resolve-B7S4PlnO.js";
import { a as isSecureWebSocketUrl } from "./net-JAg9zL0G.js";
import { f as trimToUndefined, r as resolveGatewayCredentialsFromConfig, t as GatewaySecretRefUnavailableError } from "./credentials-D8pfRimu.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-BliByQBl.js";
import { dn as loadOrCreateDeviceIdentity, l as resolveLeastPrivilegeOperatorScopesForMethod, ln as normalizeFingerprint, r as CLI_DEFAULT_OPERATOR_SCOPES, u as GatewayClient } from "./method-scopes-BiEi0X2g.js";
import path from "node:path";
import { execFile } from "node:child_process";
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
//#region src/secrets/resolve-secret-input-string.ts
async function resolveSecretInputString(params) {
	const normalize = params.normalize ?? normalizeSecretInputString;
	const { ref } = resolveSecretInputRef({
		value: params.value,
		defaults: params.defaults ?? params.config.secrets?.defaults
	});
	if (!ref) return normalize(params.value);
	let resolved;
	try {
		resolved = await resolveSecretRefString(ref, {
			config: params.config,
			env: params.env
		});
	} catch (error) {
		if (params.onResolveRefError) return params.onResolveRefError(error, ref);
		throw error;
	}
	return normalize(resolved);
}
//#endregion
//#region src/gateway/call.ts
const defaultCreateGatewayClient = (opts) => new GatewayClient(opts);
const defaultGatewayCallDeps = {
	createGatewayClient: defaultCreateGatewayClient,
	loadConfig,
	resolveGatewayPort,
	resolveConfigPath,
	resolveStateDir,
	loadGatewayTlsRuntime
};
const gatewayCallDeps = { ...defaultGatewayCallDeps };
const __testing = {
	setDepsForTests(deps) {
		gatewayCallDeps.createGatewayClient = deps?.createGatewayClient ?? defaultGatewayCallDeps.createGatewayClient;
		gatewayCallDeps.loadConfig = deps?.loadConfig ?? defaultGatewayCallDeps.loadConfig;
		gatewayCallDeps.resolveGatewayPort = deps?.resolveGatewayPort ?? defaultGatewayCallDeps.resolveGatewayPort;
		gatewayCallDeps.resolveConfigPath = deps?.resolveConfigPath ?? defaultGatewayCallDeps.resolveConfigPath;
		gatewayCallDeps.resolveStateDir = deps?.resolveStateDir ?? defaultGatewayCallDeps.resolveStateDir;
		gatewayCallDeps.loadGatewayTlsRuntime = deps?.loadGatewayTlsRuntime ?? defaultGatewayCallDeps.loadGatewayTlsRuntime;
	},
	setCreateGatewayClientForTests(createGatewayClient) {
		gatewayCallDeps.createGatewayClient = createGatewayClient ?? defaultGatewayCallDeps.createGatewayClient;
	},
	resetDepsForTests() {
		gatewayCallDeps.createGatewayClient = defaultGatewayCallDeps.createGatewayClient;
		gatewayCallDeps.loadConfig = defaultGatewayCallDeps.loadConfig;
		gatewayCallDeps.resolveGatewayPort = defaultGatewayCallDeps.resolveGatewayPort;
		gatewayCallDeps.resolveConfigPath = defaultGatewayCallDeps.resolveConfigPath;
		gatewayCallDeps.resolveStateDir = defaultGatewayCallDeps.resolveStateDir;
		gatewayCallDeps.loadGatewayTlsRuntime = defaultGatewayCallDeps.loadGatewayTlsRuntime;
	}
};
function shouldAttachDeviceIdentityForGatewayCall(params) {
	return true;
}
function resolveExplicitGatewayAuth(opts) {
	return {
		token: typeof opts?.token === "string" && opts.token.trim().length > 0 ? opts.token.trim() : void 0,
		password: typeof opts?.password === "string" && opts.password.trim().length > 0 ? opts.password.trim() : void 0
	};
}
function ensureExplicitGatewayAuth(params) {
	if (!params.urlOverride) return;
	const explicitToken = params.explicitAuth?.token;
	const explicitPassword = params.explicitAuth?.password;
	if (params.urlOverrideSource === "cli" && (explicitToken || explicitPassword)) return;
	const hasResolvedAuth = params.resolvedAuth?.token || params.resolvedAuth?.password || explicitToken || explicitPassword;
	if (params.urlOverrideSource === "env" && hasResolvedAuth) return;
	const message = [
		"gateway url override requires explicit credentials",
		params.errorHint,
		params.configPath ? `Config: ${params.configPath}` : void 0
	].filter(Boolean).join("\n");
	throw new Error(message);
}
function buildGatewayConnectionDetails(options = {}) {
	const config = options.config ?? gatewayCallDeps.loadConfig();
	const configPath = options.configPath ?? gatewayCallDeps.resolveConfigPath(process.env, gatewayCallDeps.resolveStateDir(process.env));
	const isRemoteMode = config.gateway?.mode === "remote";
	const remote = isRemoteMode ? config.gateway?.remote : void 0;
	const tlsEnabled = config.gateway?.tls?.enabled === true;
	const localPort = gatewayCallDeps.resolveGatewayPort(config);
	const bindMode = config.gateway?.bind ?? "loopback";
	const localUrl = `${tlsEnabled ? "wss" : "ws"}://127.0.0.1:${localPort}`;
	const cliUrlOverride = typeof options.url === "string" && options.url.trim().length > 0 ? options.url.trim() : void 0;
	const envUrlOverride = cliUrlOverride ? void 0 : trimToUndefined(process.env.OPENCLAW_GATEWAY_URL);
	const urlOverride = cliUrlOverride ?? envUrlOverride;
	const remoteUrl = typeof remote?.url === "string" && remote.url.trim().length > 0 ? remote.url.trim() : void 0;
	const remoteMisconfigured = isRemoteMode && !urlOverride && !remoteUrl;
	const urlSourceHint = options.urlSource ?? (cliUrlOverride ? "cli" : envUrlOverride ? "env" : void 0);
	const url = urlOverride || remoteUrl || localUrl;
	const urlSource = urlOverride ? urlSourceHint === "env" ? "env OPENCLAW_GATEWAY_URL" : "cli --url" : remoteUrl ? "config gateway.remote.url" : remoteMisconfigured ? "missing gateway.remote.url (fallback local)" : "local loopback";
	const bindDetail = !urlOverride && !remoteUrl ? `Bind: ${bindMode}` : void 0;
	const remoteFallbackNote = remoteMisconfigured ? "Warn: gateway.mode=remote but gateway.remote.url is missing; set gateway.remote.url or switch gateway.mode=local." : void 0;
	const allowPrivateWs = process.env.OPENCLAW_ALLOW_INSECURE_PRIVATE_WS === "1";
	if (!isSecureWebSocketUrl(url, { allowPrivateWs })) throw new Error([
		`SECURITY ERROR: Gateway URL "${url}" uses plaintext ws:// to a non-loopback address.`,
		"Both credentials and chat data would be exposed to network interception.",
		`Source: ${urlSource}`,
		`Config: ${configPath}`,
		"Fix: Use wss:// for remote gateway URLs.",
		"Safe remote access defaults:",
		"- keep gateway.bind=loopback and use an SSH tunnel (ssh -N -L 18789:127.0.0.1:18789 user@gateway-host)",
		"- or use Tailscale Serve/Funnel for HTTPS remote access",
		allowPrivateWs ? void 0 : "Break-glass (trusted private networks only): set OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1",
		"Doctor: openclaw doctor --fix",
		"Docs: https://docs.openclaw.ai/gateway/remote"
	].join("\n"));
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
function resolveGatewayCallTimeout(timeoutValue) {
	const timeoutMs = typeof timeoutValue === "number" && Number.isFinite(timeoutValue) ? timeoutValue : 1e4;
	return {
		timeoutMs,
		safeTimerTimeoutMs: Math.max(1, Math.min(Math.floor(timeoutMs), 2147483647))
	};
}
function resolveGatewayCallContext(opts) {
	const config = opts.config ?? gatewayCallDeps.loadConfig();
	const configPath = opts.configPath ?? gatewayCallDeps.resolveConfigPath(process.env, gatewayCallDeps.resolveStateDir(process.env));
	const isRemoteMode = config.gateway?.mode === "remote";
	const remote = isRemoteMode ? config.gateway?.remote : void 0;
	const cliUrlOverride = trimToUndefined(opts.url);
	const envUrlOverride = cliUrlOverride ? void 0 : trimToUndefined(process.env.OPENCLAW_GATEWAY_URL);
	return {
		config,
		configPath,
		isRemoteMode,
		remote,
		urlOverride: cliUrlOverride ?? envUrlOverride,
		urlOverrideSource: cliUrlOverride ? "cli" : envUrlOverride ? "env" : void 0,
		remoteUrl: trimToUndefined(remote?.url),
		explicitAuth: resolveExplicitGatewayAuth({
			token: opts.token,
			password: opts.password
		})
	};
}
function ensureRemoteModeUrlConfigured(context) {
	if (!context.isRemoteMode || context.urlOverride || context.remoteUrl) return;
	throw new Error([
		"gateway remote mode misconfigured: gateway.remote.url missing",
		`Config: ${context.configPath}`,
		"Fix: set gateway.remote.url, or set gateway.mode=local."
	].join("\n"));
}
async function resolveGatewaySecretInputString(params) {
	const value = await resolveSecretInputString({
		config: params.config,
		value: params.value,
		env: params.env,
		normalize: trimToUndefined,
		onResolveRefError: () => {
			throw new GatewaySecretRefUnavailableError(params.path);
		}
	});
	if (!value) throw new Error(`${params.path} resolved to an empty or non-string value.`);
	return value;
}
async function resolveGatewayCredentials(context) {
	return resolveGatewayCredentialsWithEnv(context, process.env);
}
async function resolveGatewayCredentialsWithEnv(context, env) {
	if (context.explicitAuth.token || context.explicitAuth.password) return {
		token: context.explicitAuth.token,
		password: context.explicitAuth.password
	};
	return resolveGatewayCredentialsFromConfigWithSecretInputs({
		context,
		env
	});
}
const ALL_GATEWAY_SECRET_INPUT_PATHS = [
	"gateway.auth.token",
	"gateway.auth.password",
	"gateway.remote.token",
	"gateway.remote.password"
];
function isSupportedGatewaySecretInputPath(path) {
	return path === "gateway.auth.token" || path === "gateway.auth.password" || path === "gateway.remote.token" || path === "gateway.remote.password";
}
function readGatewaySecretInputValue(config, path) {
	if (path === "gateway.auth.token") return config.gateway?.auth?.token;
	if (path === "gateway.auth.password") return config.gateway?.auth?.password;
	if (path === "gateway.remote.token") return config.gateway?.remote?.token;
	return config.gateway?.remote?.password;
}
function hasConfiguredGatewaySecretRef(config, path) {
	return Boolean(resolveSecretInputRef({
		value: readGatewaySecretInputValue(config, path),
		defaults: config.secrets?.defaults
	}).ref);
}
function resolveGatewayCredentialsFromConfigOptions(params) {
	const { context, env, cfg } = params;
	return {
		cfg,
		env,
		explicitAuth: context.explicitAuth,
		urlOverride: context.urlOverride,
		urlOverrideSource: context.urlOverrideSource,
		modeOverride: context.modeOverride,
		localTokenPrecedence: context.localTokenPrecedence,
		localPasswordPrecedence: context.localPasswordPrecedence,
		remoteTokenPrecedence: context.remoteTokenPrecedence,
		remotePasswordPrecedence: context.remotePasswordPrecedence ?? "env-first",
		remoteTokenFallback: context.remoteTokenFallback,
		remotePasswordFallback: context.remotePasswordFallback
	};
}
function isTokenGatewaySecretInputPath(path) {
	return path === "gateway.auth.token" || path === "gateway.remote.token";
}
function localAuthModeAllowsGatewaySecretInputPath(params) {
	const { authMode, path } = params;
	if (authMode === "none" || authMode === "trusted-proxy") return false;
	if (authMode === "token") return isTokenGatewaySecretInputPath(path);
	if (authMode === "password") return !isTokenGatewaySecretInputPath(path);
	return true;
}
function gatewaySecretInputPathCanWin(params) {
	if (!hasConfiguredGatewaySecretRef(params.config, params.path)) return false;
	if ((params.context.modeOverride ?? (params.config.gateway?.mode === "remote" ? "remote" : "local")) === "local" && !localAuthModeAllowsGatewaySecretInputPath({
		authMode: params.config.gateway?.auth?.mode,
		path: params.path
	})) return false;
	const sentinel = `__OPENCLAW_GATEWAY_SECRET_REF_PROBE_${params.path.replaceAll(".", "_")}__`;
	const probeConfig = structuredClone(params.config);
	for (const candidatePath of ALL_GATEWAY_SECRET_INPUT_PATHS) {
		if (!hasConfiguredGatewaySecretRef(probeConfig, candidatePath)) continue;
		assignResolvedGatewaySecretInput({
			config: probeConfig,
			path: candidatePath,
			value: void 0
		});
	}
	assignResolvedGatewaySecretInput({
		config: probeConfig,
		path: params.path,
		value: sentinel
	});
	try {
		const resolved = resolveGatewayCredentialsFromConfig(resolveGatewayCredentialsFromConfigOptions({
			context: params.context,
			env: params.env,
			cfg: probeConfig
		}));
		const tokenCanWin = resolved.token === sentinel && !resolved.password;
		const passwordCanWin = resolved.password === sentinel && !resolved.token;
		return tokenCanWin || passwordCanWin;
	} catch {
		return false;
	}
}
async function resolveConfiguredGatewaySecretInput(params) {
	const { config, path, env } = params;
	if (path === "gateway.auth.token") return resolveGatewaySecretInputString({
		config,
		value: config.gateway?.auth?.token,
		path,
		env
	});
	if (path === "gateway.auth.password") return resolveGatewaySecretInputString({
		config,
		value: config.gateway?.auth?.password,
		path,
		env
	});
	if (path === "gateway.remote.token") return resolveGatewaySecretInputString({
		config,
		value: config.gateway?.remote?.token,
		path,
		env
	});
	return resolveGatewaySecretInputString({
		config,
		value: config.gateway?.remote?.password,
		path,
		env
	});
}
function assignResolvedGatewaySecretInput(params) {
	const { config, path, value } = params;
	if (path === "gateway.auth.token") {
		if (config.gateway?.auth) config.gateway.auth.token = value;
		return;
	}
	if (path === "gateway.auth.password") {
		if (config.gateway?.auth) config.gateway.auth.password = value;
		return;
	}
	if (path === "gateway.remote.token") {
		if (config.gateway?.remote) config.gateway.remote.token = value;
		return;
	}
	if (config.gateway?.remote) config.gateway.remote.password = value;
}
async function resolvePreferredGatewaySecretInputs(params) {
	let nextConfig = params.config;
	for (const path of ALL_GATEWAY_SECRET_INPUT_PATHS) {
		if (!gatewaySecretInputPathCanWin({
			context: params.context,
			env: params.env,
			config: nextConfig,
			path
		})) continue;
		if (nextConfig === params.config) nextConfig = structuredClone(params.config);
		try {
			const resolvedValue = await resolveConfiguredGatewaySecretInput({
				config: nextConfig,
				path,
				env: params.env
			});
			assignResolvedGatewaySecretInput({
				config: nextConfig,
				path,
				value: resolvedValue
			});
		} catch {
			continue;
		}
	}
	return nextConfig;
}
async function resolveGatewayCredentialsFromConfigWithSecretInputs(params) {
	let resolvedConfig = await resolvePreferredGatewaySecretInputs({
		context: params.context,
		env: params.env,
		config: params.context.config
	});
	const resolvedPaths = /* @__PURE__ */ new Set();
	for (;;) try {
		return resolveGatewayCredentialsFromConfig(resolveGatewayCredentialsFromConfigOptions({
			context: params.context,
			env: params.env,
			cfg: resolvedConfig
		}));
	} catch (error) {
		if (!(error instanceof GatewaySecretRefUnavailableError)) throw error;
		const path = error.path;
		if (!isSupportedGatewaySecretInputPath(path) || resolvedPaths.has(path)) throw error;
		if (resolvedConfig === params.context.config) resolvedConfig = structuredClone(params.context.config);
		const resolvedValue = await resolveConfiguredGatewaySecretInput({
			config: resolvedConfig,
			path,
			env: params.env
		});
		assignResolvedGatewaySecretInput({
			config: resolvedConfig,
			path,
			value: resolvedValue
		});
		resolvedPaths.add(path);
	}
}
async function resolveGatewayCredentialsWithSecretInputs(params) {
	const modeOverride = params.modeOverride;
	const isRemoteMode = modeOverride ? modeOverride === "remote" : params.config.gateway?.mode === "remote";
	const remoteFromConfig = params.config.gateway?.mode === "remote" ? params.config.gateway?.remote : void 0;
	const remoteFromOverride = modeOverride === "remote" ? params.config.gateway?.remote : void 0;
	return resolveGatewayCredentialsWithEnv({
		config: params.config,
		configPath: gatewayCallDeps.resolveConfigPath(process.env, gatewayCallDeps.resolveStateDir(process.env)),
		isRemoteMode,
		remote: remoteFromOverride ?? remoteFromConfig,
		urlOverride: trimToUndefined(params.urlOverride),
		urlOverrideSource: params.urlOverrideSource,
		remoteUrl: isRemoteMode ? trimToUndefined((params.config.gateway?.remote)?.url) : void 0,
		explicitAuth: resolveExplicitGatewayAuth(params.explicitAuth),
		modeOverride,
		localTokenPrecedence: params.localTokenPrecedence,
		localPasswordPrecedence: params.localPasswordPrecedence,
		remoteTokenPrecedence: params.remoteTokenPrecedence,
		remotePasswordPrecedence: params.remotePasswordPrecedence,
		remoteTokenFallback: params.remoteTokenFallback,
		remotePasswordFallback: params.remotePasswordFallback
	}, params.env ?? process.env);
}
async function resolveGatewayTlsFingerprint(params) {
	const { opts, context, url } = params;
	const tlsRuntime = context.config.gateway?.tls?.enabled === true && !context.urlOverrideSource && !context.remoteUrl && url.startsWith("wss://") ? await gatewayCallDeps.loadGatewayTlsRuntime(context.config.gateway?.tls) : void 0;
	const overrideTlsFingerprint = trimToUndefined(opts.tlsFingerprint);
	const remoteTlsFingerprint = context.isRemoteMode && context.urlOverrideSource !== "cli" ? trimToUndefined(context.remote?.tlsFingerprint) : void 0;
	return overrideTlsFingerprint || remoteTlsFingerprint || (tlsRuntime?.enabled ? tlsRuntime.fingerprintSha256 : void 0);
}
function formatGatewayCloseError(code, reason, connectionDetails) {
	const reasonText = reason?.trim() || "no close reason";
	const hint = code === 1006 ? "abnormal closure (no close frame)" : code === 1e3 ? "normal closure" : "";
	return `gateway closed (${code}${hint ? ` ${hint}` : ""}): ${reasonText}\n${connectionDetails.message}`;
}
function formatGatewayTimeoutError(timeoutMs, connectionDetails) {
	return `gateway timeout after ${timeoutMs}ms\n${connectionDetails.message}`;
}
function ensureGatewaySupportsRequiredMethods(params) {
	const requiredMethods = Array.isArray(params.requiredMethods) ? params.requiredMethods.map((entry) => entry.trim()).filter((entry) => entry.length > 0) : [];
	if (requiredMethods.length === 0) return;
	const supportedMethods = new Set((Array.isArray(params.methods) ? params.methods : []).map((entry) => entry.trim()).filter((entry) => entry.length > 0));
	for (const method of requiredMethods) {
		if (supportedMethods.has(method)) continue;
		throw new Error([`active gateway does not support required method "${method}" for "${params.attemptedMethod}".`, "Update the gateway or run without SecretRefs."].join(" "));
	}
}
async function executeGatewayRequestWithScopes(params) {
	const { opts, scopes, url, token, password, tlsFingerprint, timeoutMs, safeTimerTimeoutMs } = params;
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
		const client = gatewayCallDeps.createGatewayClient({
			url,
			token,
			password,
			tlsFingerprint,
			instanceId: opts.instanceId ?? randomUUID(),
			clientName: opts.clientName ?? GATEWAY_CLIENT_NAMES.CLI,
			clientDisplayName: opts.clientDisplayName,
			clientVersion: opts.clientVersion ?? VERSION,
			platform: opts.platform,
			mode: opts.mode ?? GATEWAY_CLIENT_MODES.CLI,
			role: "operator",
			scopes,
			deviceIdentity: shouldAttachDeviceIdentityForGatewayCall({
				url,
				token,
				password
			}) ? loadOrCreateDeviceIdentity() : void 0,
			minProtocol: opts.minProtocol ?? 3,
			maxProtocol: opts.maxProtocol ?? 3,
			onHelloOk: async (hello) => {
				try {
					ensureGatewaySupportsRequiredMethods({
						requiredMethods: opts.requiredMethods,
						methods: hello.features?.methods,
						attemptedMethod: opts.method
					});
					const result = await client.request(opts.method, opts.params, {
						expectFinal: opts.expectFinal,
						timeoutMs: opts.timeoutMs
					});
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
				stop(new Error(formatGatewayCloseError(code, reason, params.connectionDetails)));
			}
		});
		const timer = setTimeout(() => {
			ignoreClose = true;
			client.stop();
			stop(new Error(formatGatewayTimeoutError(timeoutMs, params.connectionDetails)));
		}, safeTimerTimeoutMs);
		client.start();
	});
}
async function callGatewayWithScopes(opts, scopes) {
	const { timeoutMs, safeTimerTimeoutMs } = resolveGatewayCallTimeout(opts.timeoutMs);
	const context = resolveGatewayCallContext(opts);
	const resolvedCredentials = await resolveGatewayCredentials(context);
	ensureExplicitGatewayAuth({
		urlOverride: context.urlOverride,
		urlOverrideSource: context.urlOverrideSource,
		explicitAuth: context.explicitAuth,
		resolvedAuth: resolvedCredentials,
		errorHint: "Fix: pass --token or --password (or gatewayToken in tools).",
		configPath: context.configPath
	});
	ensureRemoteModeUrlConfigured(context);
	const connectionDetails = buildGatewayConnectionDetails({
		config: context.config,
		url: context.urlOverride,
		urlSource: context.urlOverrideSource,
		...opts.configPath ? { configPath: opts.configPath } : {}
	});
	const url = connectionDetails.url;
	const tlsFingerprint = await resolveGatewayTlsFingerprint({
		opts,
		context,
		url
	});
	const { token, password } = resolvedCredentials;
	return await executeGatewayRequestWithScopes({
		opts,
		scopes,
		url,
		token,
		password,
		tlsFingerprint,
		timeoutMs,
		safeTimerTimeoutMs,
		connectionDetails
	});
}
async function callGatewayScoped(opts) {
	return await callGatewayWithScopes(opts, opts.scopes);
}
async function callGatewayCli(opts) {
	return await callGatewayWithScopes(opts, Array.isArray(opts.scopes) ? opts.scopes : CLI_DEFAULT_OPERATOR_SCOPES);
}
async function callGatewayLeastPrivilege(opts) {
	return await callGatewayWithScopes(opts, resolveLeastPrivilegeOperatorScopesForMethod(opts.method));
}
async function callGateway(opts) {
	if (Array.isArray(opts.scopes)) return await callGatewayWithScopes(opts, opts.scopes);
	const callerMode = opts.mode ?? GATEWAY_CLIENT_MODES.BACKEND;
	const callerName = opts.clientName ?? GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT;
	if (callerMode === GATEWAY_CLIENT_MODES.CLI || callerName === GATEWAY_CLIENT_NAMES.CLI) return await callGatewayCli(opts);
	return await callGatewayLeastPrivilege({
		...opts,
		mode: callerMode,
		clientName: callerName
	});
}
function randomIdempotencyKey() {
	return randomUUID();
}
//#endregion
export { callGatewayLeastPrivilege as a, randomIdempotencyKey as c, loadGatewayTlsRuntime as d, callGatewayCli as i, resolveExplicitGatewayAuth as l, buildGatewayConnectionDetails as n, callGatewayScoped as o, callGateway as r, ensureExplicitGatewayAuth as s, __testing as t, resolveGatewayCredentialsWithSecretInputs as u };
