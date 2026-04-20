import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { _ as resolveStateDir, o as resolveConfigPath, u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { n as VERSION } from "./version-Bk5OW-rN.js";
import { a as trimToUndefined } from "./credential-planner-CxtmVh4K.js";
import "./credentials-DH-nlrJW.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { t as GatewayClient } from "./client-DkWAat_P.js";
import { n as loadOrCreateDeviceIdentity } from "./device-identity-TBOlRcQx.js";
import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES } from "./message-channel-CBqCPFa_.js";
import "./protocol-C6T5DFc8.js";
import { a as resolveLeastPrivilegeOperatorScopesForMethod, t as CLI_DEFAULT_OPERATOR_SCOPES } from "./method-scopes-D3xbsVVt.js";
import { t as loadGatewayTlsRuntime } from "./gateway-BRe0gTJ4.js";
import { t as buildGatewayConnectionDetailsWithResolvers } from "./connection-details-DVKcA1hM.js";
import { t as resolveGatewayCredentialsWithSecretInputs } from "./credentials-secret-inputs-CW0my3bl.js";
import { t as canSkipGatewayConfigLoad } from "./explicit-connection-policy-Dz2zLNQA.js";
import { randomUUID } from "node:crypto";
//#region src/gateway/call.ts
const defaultCreateGatewayClient = (opts) => new GatewayClient(opts);
const defaultGatewayCallDeps = {
	createGatewayClient: defaultCreateGatewayClient,
	loadConfig,
	loadOrCreateDeviceIdentity,
	resolveGatewayPort,
	resolveConfigPath,
	resolveStateDir,
	loadGatewayTlsRuntime
};
const gatewayCallDeps = { ...defaultGatewayCallDeps };
function resolveGatewayClientDisplayName(opts) {
	if (opts.clientDisplayName) return opts.clientDisplayName;
	const clientName = opts.clientName ?? GATEWAY_CLIENT_NAMES.CLI;
	if ((opts.mode ?? GATEWAY_CLIENT_MODES.CLI) !== GATEWAY_CLIENT_MODES.BACKEND && clientName !== GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT) return;
	const method = opts.method.trim();
	return method ? `gateway:${method}` : "gateway:request";
}
function loadGatewayConfig() {
	return (typeof gatewayCallDeps.loadConfig === "function" ? gatewayCallDeps.loadConfig : typeof defaultGatewayCallDeps.loadConfig === "function" ? defaultGatewayCallDeps.loadConfig : loadConfig)();
}
function resolveGatewayStateDir(env) {
	return (typeof gatewayCallDeps.resolveStateDir === "function" ? gatewayCallDeps.resolveStateDir : resolveStateDir)(env);
}
function resolveGatewayConfigPath(env) {
	return (typeof gatewayCallDeps.resolveConfigPath === "function" ? gatewayCallDeps.resolveConfigPath : resolveConfigPath)(env, resolveGatewayStateDir(env));
}
function resolveGatewayPortValue(config, env) {
	return (typeof gatewayCallDeps.resolveGatewayPort === "function" ? gatewayCallDeps.resolveGatewayPort : resolveGatewayPort)(config, env);
}
function buildGatewayConnectionDetails(options = {}) {
	return buildGatewayConnectionDetailsWithResolvers(options, {
		loadConfig: () => loadGatewayConfig(),
		resolveConfigPath: (env) => resolveGatewayConfigPath(env),
		resolveGatewayPort: (config, env) => resolveGatewayPortValue(config, env)
	});
}
const __testing = {
	setDepsForTests(deps) {
		gatewayCallDeps.createGatewayClient = deps?.createGatewayClient ?? defaultGatewayCallDeps.createGatewayClient;
		gatewayCallDeps.loadConfig = deps?.loadConfig ?? defaultGatewayCallDeps.loadConfig;
		gatewayCallDeps.loadOrCreateDeviceIdentity = deps?.loadOrCreateDeviceIdentity ?? defaultGatewayCallDeps.loadOrCreateDeviceIdentity;
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
		gatewayCallDeps.loadOrCreateDeviceIdentity = defaultGatewayCallDeps.loadOrCreateDeviceIdentity;
		gatewayCallDeps.resolveGatewayPort = defaultGatewayCallDeps.resolveGatewayPort;
		gatewayCallDeps.resolveConfigPath = defaultGatewayCallDeps.resolveConfigPath;
		gatewayCallDeps.resolveStateDir = defaultGatewayCallDeps.resolveStateDir;
		gatewayCallDeps.loadGatewayTlsRuntime = defaultGatewayCallDeps.loadGatewayTlsRuntime;
	}
};
function resolveDeviceIdentityForGatewayCall() {
	try {
		return gatewayCallDeps.loadOrCreateDeviceIdentity();
	} catch {
		return null;
	}
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
function resolveGatewayCallTimeout(timeoutValue) {
	const timeoutMs = typeof timeoutValue === "number" && Number.isFinite(timeoutValue) ? timeoutValue : 1e4;
	return {
		timeoutMs,
		safeTimerTimeoutMs: Math.max(1, Math.min(Math.floor(timeoutMs), 2147483647))
	};
}
function resolveGatewayCallContext(opts) {
	const cliUrlOverride = trimToUndefined(opts.url);
	const explicitAuth = resolveExplicitGatewayAuth({
		token: opts.token,
		password: opts.password
	});
	const envUrlOverride = cliUrlOverride ? void 0 : trimToUndefined(process.env.OPENCLAW_GATEWAY_URL);
	const urlOverride = cliUrlOverride ?? envUrlOverride;
	const urlOverrideSource = cliUrlOverride ? "cli" : envUrlOverride ? "env" : void 0;
	const canSkipConfigLoad = canSkipGatewayConfigLoad({
		config: opts.config,
		urlOverride,
		explicitAuth
	});
	const config = opts.config ?? (canSkipConfigLoad ? {} : loadGatewayConfig());
	const configPath = opts.configPath ?? resolveGatewayConfigPath(process.env);
	const isRemoteMode = config.gateway?.mode === "remote";
	const remote = isRemoteMode ? config.gateway?.remote : void 0;
	return {
		config,
		configPath,
		isRemoteMode,
		remote,
		urlOverride,
		urlOverrideSource,
		remoteUrl: trimToUndefined(remote?.url),
		explicitAuth
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
async function resolveGatewayCredentials(context) {
	return resolveGatewayCredentialsWithEnv(context, process.env);
}
async function resolveGatewayCredentialsWithEnv(context, env) {
	if (context.explicitAuth.token || context.explicitAuth.password) return {
		token: context.explicitAuth.token,
		password: context.explicitAuth.password
	};
	return resolveGatewayCredentialsWithSecretInputs({
		config: context.config,
		explicitAuth: context.explicitAuth,
		urlOverride: context.urlOverride,
		urlOverrideSource: context.urlOverrideSource,
		env,
		modeOverride: context.modeOverride,
		localTokenPrecedence: context.localTokenPrecedence,
		localPasswordPrecedence: context.localPasswordPrecedence,
		remoteTokenPrecedence: context.remoteTokenPrecedence,
		remotePasswordPrecedence: context.remotePasswordPrecedence,
		remoteTokenFallback: context.remoteTokenFallback,
		remotePasswordFallback: context.remotePasswordFallback
	});
}
async function resolveGatewayTlsFingerprint(params) {
	const { opts, context, url } = params;
	const tlsRuntime = context.config.gateway?.tls?.enabled === true && !context.urlOverrideSource && !context.remoteUrl && url.startsWith("wss://") ? await gatewayCallDeps.loadGatewayTlsRuntime(context.config.gateway?.tls) : void 0;
	const overrideTlsFingerprint = trimToUndefined(opts.tlsFingerprint);
	const remoteTlsFingerprint = context.isRemoteMode && context.urlOverrideSource !== "cli" ? trimToUndefined(context.remote?.tlsFingerprint) : void 0;
	return overrideTlsFingerprint || remoteTlsFingerprint || (tlsRuntime?.enabled ? tlsRuntime.fingerprintSha256 : void 0);
}
function formatGatewayCloseError(code, reason, connectionDetails) {
	const reasonText = normalizeOptionalString(reason) || "no close reason";
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
	await new Promise((r) => setImmediate(r));
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
			clientDisplayName: resolveGatewayClientDisplayName(opts),
			clientVersion: opts.clientVersion ?? VERSION,
			platform: opts.platform,
			mode: opts.mode ?? GATEWAY_CLIENT_MODES.CLI,
			role: "operator",
			scopes,
			deviceIdentity: resolveDeviceIdentityForGatewayCall(),
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
export { callGatewayLeastPrivilege as a, randomIdempotencyKey as c, callGatewayCli as i, resolveExplicitGatewayAuth as l, buildGatewayConnectionDetails as n, callGatewayScoped as o, callGateway as r, ensureExplicitGatewayAuth as s, __testing as t };
