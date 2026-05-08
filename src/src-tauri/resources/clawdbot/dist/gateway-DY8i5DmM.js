import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { u as resolveGatewayPort } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { a as trimToUndefined } from "./credential-planner-DT5dEiCa.js";
import { r as resolveGatewayCredentialsFromConfig } from "./credentials-CbE6PbFU.js";
import { i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import "./config--k_1dtUP.js";
import { i as GATEWAY_CLIENT_NAMES, r as GATEWAY_CLIENT_MODES } from "./client-info-B22NhLQV.js";
import { a as resolveLeastPrivilegeOperatorScopesForMethod } from "./method-scopes-D2ZEhvQU.js";
import { r as callGateway } from "./call-CP7A3sdw.js";
import { g as readStringParam } from "./common-C4RGIxnG.js";
//#region src/agents/tools/gateway.ts
function readGatewayCallOptions(params) {
	return {
		gatewayUrl: readStringParam(params, "gatewayUrl", { trim: false }),
		gatewayToken: readStringParam(params, "gatewayToken", { trim: false }),
		timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0
	};
}
function canonicalizeToolGatewayWsUrl(raw) {
	const input = raw.trim();
	let url;
	try {
		url = new URL(input);
	} catch (error) {
		const message = formatErrorMessage(error);
		throw new Error(`invalid gatewayUrl: ${input} (${message})`, { cause: error });
	}
	if (url.protocol !== "ws:" && url.protocol !== "wss:") throw new Error(`invalid gatewayUrl protocol: ${url.protocol} (expected ws:// or wss://)`);
	if (url.username || url.password) throw new Error("invalid gatewayUrl: credentials are not allowed");
	if (url.search || url.hash) throw new Error("invalid gatewayUrl: query/hash not allowed");
	if (url.pathname && url.pathname !== "/") throw new Error("invalid gatewayUrl: path not allowed");
	return {
		origin: url.origin,
		key: `${url.protocol}//${normalizeLowercaseStringOrEmpty(url.host)}`
	};
}
function validateGatewayUrlOverrideForAgentTools(params) {
	const { cfg } = params;
	const port = resolveGatewayPort(cfg);
	const localAllowed = new Set([
		`ws://127.0.0.1:${port}`,
		`wss://127.0.0.1:${port}`,
		`ws://localhost:${port}`,
		`wss://localhost:${port}`,
		`ws://[::1]:${port}`,
		`wss://[::1]:${port}`
	]);
	let remoteKey;
	const remoteUrl = normalizeOptionalString(cfg.gateway?.remote?.url) ?? "";
	if (remoteUrl) try {
		remoteKey = canonicalizeToolGatewayWsUrl(remoteUrl).key;
	} catch {}
	const parsed = canonicalizeToolGatewayWsUrl(params.urlOverride);
	if (localAllowed.has(parsed.key)) return {
		url: parsed.origin,
		target: "local"
	};
	if (remoteKey && parsed.key === remoteKey) return {
		url: parsed.origin,
		target: "remote"
	};
	throw new Error([
		"gatewayUrl override rejected.",
		`Allowed: ws(s) loopback on port ${port} (127.0.0.1/localhost/[::1])`,
		"Or: configure gateway.remote.url and omit gatewayUrl to use the configured remote gateway."
	].join(" "));
}
function resolveGatewayOverrideToken(params) {
	if (params.explicitToken) return params.explicitToken;
	return resolveGatewayCredentialsFromConfig({
		cfg: params.cfg,
		env: process.env,
		modeOverride: params.target,
		remoteTokenFallback: params.target === "remote" ? "remote-only" : "remote-env-local",
		remotePasswordFallback: params.target === "remote" ? "remote-only" : "remote-env-local"
	}).token;
}
function resolveGatewayOptions(opts) {
	const cfg = getRuntimeConfig();
	const validatedOverride = trimToUndefined(opts?.gatewayUrl) !== void 0 ? validateGatewayUrlOverrideForAgentTools({
		cfg,
		urlOverride: String(opts?.gatewayUrl)
	}) : void 0;
	const explicitToken = trimToUndefined(opts?.gatewayToken);
	const token = validatedOverride ? resolveGatewayOverrideToken({
		cfg,
		target: validatedOverride.target,
		explicitToken
	}) : explicitToken;
	const timeoutMs = typeof opts?.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(1, Math.floor(opts.timeoutMs)) : 3e4;
	return {
		url: validatedOverride?.url,
		token,
		timeoutMs
	};
}
async function callGatewayTool(method, opts, params, extra) {
	const gateway = resolveGatewayOptions(opts);
	const scopes = Array.isArray(extra?.scopes) ? extra.scopes : resolveLeastPrivilegeOperatorScopesForMethod(method);
	return await callGateway({
		url: gateway.url,
		token: gateway.token,
		method,
		params,
		timeoutMs: gateway.timeoutMs,
		expectFinal: extra?.expectFinal,
		clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
		clientDisplayName: "agent",
		mode: GATEWAY_CLIENT_MODES.BACKEND,
		scopes
	});
}
//#endregion
export { readGatewayCallOptions as n, resolveGatewayOptions as r, callGatewayTool as t };
