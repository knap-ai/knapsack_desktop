import { n as resolveProviderRequestCapabilities, r as resolveProviderRequestPolicy } from "./provider-attribution-BrdhzyJa.js";
//#region src/agents/provider-request-config.ts
const FORBIDDEN_HEADER_KEYS = new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
const FORBIDDEN_INSECURE_TLS_MESSAGE = "Provider transport overrides do not allow insecureSkipVerify";
const FORBIDDEN_RUNTIME_TRANSPORT_OVERRIDE_MESSAGE = "Runtime auth request overrides do not allow proxy or TLS transport settings";
function normalizeBaseUrl(baseUrl, fallback) {
	const raw = baseUrl?.trim() || fallback?.trim();
	if (!raw) return;
	return raw.replace(/\/+$/, "");
}
function mergeProviderRequestHeaders(...headerSets) {
	let merged;
	const headerNamesByLowerKey = /* @__PURE__ */ new Map();
	for (const headers of headerSets) {
		if (!headers) continue;
		if (!merged) merged = Object.create(null);
		for (const [key, value] of Object.entries(headers)) {
			const normalizedKey = key.toLowerCase();
			if (FORBIDDEN_HEADER_KEYS.has(normalizedKey)) continue;
			const previousKey = headerNamesByLowerKey.get(normalizedKey);
			if (previousKey && previousKey !== key) delete merged[previousKey];
			merged[key] = value;
			headerNamesByLowerKey.set(normalizedKey, key);
		}
	}
	return merged && Object.keys(merged).length > 0 ? merged : void 0;
}
function resolveTlsOverride(tls) {
	if (!tls) return { configured: false };
	if (tls.insecureSkipVerify === true) throw new Error(FORBIDDEN_INSECURE_TLS_MESSAGE);
	const ca = tls.ca?.trim();
	const cert = tls.cert?.trim();
	const key = tls.key?.trim();
	const passphrase = tls.passphrase?.trim();
	const serverName = tls.serverName?.trim();
	const rejectUnauthorized = tls.insecureSkipVerify === false ? true : void 0;
	if (!ca && !cert && !key && !passphrase && !serverName && rejectUnauthorized === void 0) return { configured: false };
	return {
		configured: true,
		...ca ? { ca } : {},
		...cert ? { cert } : {},
		...key ? { key } : {},
		...passphrase ? { passphrase } : {},
		...serverName ? { serverName } : {},
		...rejectUnauthorized !== void 0 ? { rejectUnauthorized } : {}
	};
}
function resolveAuthOverride(params) {
	const auth = params.request?.auth;
	if (auth?.mode === "authorization-bearer") {
		const value = auth.token.trim();
		if (value) return {
			configured: true,
			mode: "authorization-bearer",
			headerName: "Authorization",
			value,
			injectAuthorizationHeader: true
		};
	}
	if (auth?.mode === "header") {
		const headerName = auth.headerName.trim();
		const value = auth.value.trim();
		const prefix = auth.prefix?.trim();
		if (headerName && value) return {
			configured: true,
			mode: "header",
			headerName,
			value,
			...prefix ? { prefix } : {},
			injectAuthorizationHeader: false
		};
	}
	return {
		configured: false,
		mode: params.authHeader ? "authorization-bearer" : "provider-default",
		injectAuthorizationHeader: params.authHeader === true
	};
}
function sanitizeRuntimeProviderRequestOverrides(request) {
	if (!request) return;
	if (request.proxy || request.tls) throw new Error(FORBIDDEN_RUNTIME_TRANSPORT_OVERRIDE_MESSAGE);
	const headers = request.headers;
	const auth = request.auth;
	if (!headers && !auth) return;
	return {
		...headers ? { headers } : {},
		...auth ? { auth } : {}
	};
}
function resolveProxyOverride(request) {
	const proxy = request?.proxy;
	if (!proxy) return { configured: false };
	const tls = resolveTlsOverride(proxy.tls);
	if (proxy.mode === "env-proxy") return {
		configured: true,
		mode: "env-proxy",
		tls
	};
	const proxyUrl = proxy.url.trim();
	if (!proxyUrl) return { configured: false };
	return {
		configured: true,
		mode: "explicit-proxy",
		proxyUrl,
		tls
	};
}
function applyResolvedAuthHeader(headers, auth) {
	if (!auth.configured) return headers;
	const next = mergeProviderRequestHeaders(headers) ?? Object.create(null);
	const keysToDelete = new Set([auth.headerName.toLowerCase()]);
	if (auth.mode === "header") keysToDelete.add("authorization");
	for (const key of Object.keys(next)) if (keysToDelete.has(key.toLowerCase())) delete next[key];
	next[auth.headerName] = auth.mode === "authorization-bearer" ? `Bearer ${auth.value}` : `${auth.prefix ?? ""}${auth.value}`;
	return Object.keys(next).length > 0 ? next : void 0;
}
function toTlsConnectOptions(tls) {
	if (!tls.configured) return;
	const next = {};
	if (tls.ca) next.ca = tls.ca;
	if (tls.cert) next.cert = tls.cert;
	if (tls.key) next.key = tls.key;
	if (tls.passphrase) next.passphrase = tls.passphrase;
	if (tls.serverName) next.servername = tls.serverName;
	if (tls.rejectUnauthorized !== void 0) next.rejectUnauthorized = tls.rejectUnauthorized;
	return Object.keys(next).length > 0 ? next : void 0;
}
function buildProviderRequestDispatcherPolicy(request) {
	const targetTls = toTlsConnectOptions(request.tls);
	if (!request.proxy.configured) return targetTls ? {
		mode: "direct",
		connect: targetTls
	} : void 0;
	const proxiedTls = toTlsConnectOptions(request.proxy.tls);
	if (request.proxy.mode === "env-proxy") return {
		mode: "env-proxy",
		...targetTls ? { connect: { ...targetTls } } : {},
		...proxiedTls ? { proxyTls: { ...proxiedTls } } : {}
	};
	return {
		mode: "explicit-proxy",
		proxyUrl: request.proxy.proxyUrl,
		...proxiedTls ? { proxyTls: proxiedTls } : {}
	};
}
function buildProviderRequestTlsClientOptions(request) {
	return toTlsConnectOptions(request.tls);
}
function resolveProviderRequestPolicyConfig(params) {
	const baseUrl = normalizeBaseUrl(params.baseUrl, params.defaultBaseUrl);
	const capability = params.capability ?? "llm";
	const transport = params.transport ?? "http";
	const policyInput = {
		provider: params.provider,
		api: params.api,
		baseUrl,
		capability,
		transport
	};
	const policy = resolveProviderRequestPolicy(policyInput);
	const capabilities = resolveProviderRequestCapabilities({
		...policyInput,
		compat: params.compat,
		modelId: params.modelId
	});
	const auth = resolveAuthOverride({
		authHeader: params.authHeader,
		request: params.request
	});
	const extraHeaders = applyResolvedAuthHeader(mergeProviderRequestHeaders(params.discoveredHeaders, params.providerHeaders, params.modelHeaders, params.request?.headers), auth);
	const protectedAttributionKeys = new Set(Object.keys(policy.attributionHeaders ?? {}).map((key) => key.toLowerCase()));
	const unprotectedCallerHeaders = params.callerHeaders ? Object.fromEntries(Object.entries(params.callerHeaders).filter(([key]) => !protectedAttributionKeys.has(key.toLowerCase()))) : void 0;
	const mergedDefaults = mergeProviderRequestHeaders(extraHeaders, policy.attributionHeaders);
	const headers = params.precedence === "caller-wins" ? mergeProviderRequestHeaders(mergedDefaults, unprotectedCallerHeaders) : mergeProviderRequestHeaders(unprotectedCallerHeaders, mergedDefaults);
	return {
		api: params.api,
		baseUrl,
		headers,
		extraHeaders: {
			configured: Boolean(extraHeaders),
			headers: extraHeaders
		},
		auth,
		proxy: resolveProxyOverride(params.request),
		tls: resolveTlsOverride(params.request?.tls),
		policy,
		capabilities,
		allowPrivateNetwork: params.allowPrivateNetwork ?? Boolean(params.baseUrl?.trim())
	};
}
function resolveProviderRequestConfig(params) {
	const resolved = resolveProviderRequestPolicyConfig(params);
	return {
		api: resolved.api,
		baseUrl: resolved.baseUrl,
		headers: resolved.extraHeaders.headers,
		extraHeaders: resolved.extraHeaders,
		auth: resolved.auth,
		proxy: resolved.proxy,
		tls: resolved.tls,
		policy: resolved.policy
	};
}
//#endregion
export { resolveProviderRequestPolicyConfig as a, resolveProviderRequestConfig as i, buildProviderRequestTlsClientOptions as n, sanitizeRuntimeProviderRequestOverrides as o, normalizeBaseUrl as r, buildProviderRequestDispatcherPolicy as t };
