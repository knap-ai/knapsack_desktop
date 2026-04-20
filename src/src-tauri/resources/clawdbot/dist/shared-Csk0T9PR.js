import { i as matchesNoProxy, n as hasEnvHttpProxyConfigured } from "./proxy-env-qIN1SJGt.js";
import { c as resolveProviderRequestPolicyConfig, n as buildProviderRequestDispatcherPolicy } from "./provider-request-config-S_W3yUlE.js";
import { n as fetchWithSsrFGuard, t as GUARDED_FETCH_MODE } from "./fetch-guard-B3p4gGaY.js";
//#region src/media-understanding/shared.ts
const MAX_ERROR_CHARS = 300;
const MAX_ERROR_RESPONSE_BYTES = 4096;
const DEFAULT_GUARDED_HTTP_TIMEOUT_MS = 6e4;
const MAX_AUDIT_CONTEXT_CHARS = 80;
function createProviderOperationDeadline(params) {
	if (typeof params.timeoutMs !== "number" || !Number.isFinite(params.timeoutMs) || params.timeoutMs <= 0) return { label: params.label };
	const timeoutMs = Math.floor(params.timeoutMs);
	return {
		deadlineAtMs: Date.now() + timeoutMs,
		label: params.label,
		timeoutMs
	};
}
function resolveProviderOperationTimeoutMs(params) {
	const deadlineAtMs = params.deadline.deadlineAtMs;
	if (typeof deadlineAtMs !== "number") return params.defaultTimeoutMs;
	const remainingMs = deadlineAtMs - Date.now();
	if (remainingMs <= 0) throw new Error(`${params.deadline.label} timed out after ${params.deadline.timeoutMs}ms`);
	return Math.max(1, Math.min(params.defaultTimeoutMs, remainingMs));
}
async function waitProviderOperationPollInterval(params) {
	const deadlineAtMs = params.deadline.deadlineAtMs;
	if (typeof deadlineAtMs !== "number") {
		await new Promise((resolve) => setTimeout(resolve, params.pollIntervalMs));
		return;
	}
	const remainingMs = deadlineAtMs - Date.now();
	if (remainingMs <= 0) throw new Error(`${params.deadline.label} timed out after ${params.deadline.timeoutMs}ms`);
	await new Promise((resolve) => setTimeout(resolve, Math.min(params.pollIntervalMs, remainingMs)));
}
function resolveGuardedHttpTimeoutMs(timeoutMs) {
	if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) return DEFAULT_GUARDED_HTTP_TIMEOUT_MS;
	return timeoutMs;
}
function sanitizeAuditContext(auditContext) {
	const cleaned = auditContext?.replace(/\p{Cc}+/gu, " ").replace(/\s+/g, " ").trim();
	if (!cleaned) return;
	return cleaned.slice(0, MAX_AUDIT_CONTEXT_CHARS);
}
function resolveProviderHttpRequestConfig(params) {
	const requestConfig = resolveProviderRequestPolicyConfig({
		provider: params.provider ?? "",
		baseUrl: params.baseUrl,
		defaultBaseUrl: params.defaultBaseUrl,
		capability: params.capability ?? "other",
		transport: params.transport ?? "http",
		callerHeaders: params.headers ? Object.fromEntries(new Headers(params.headers).entries()) : void 0,
		providerHeaders: params.defaultHeaders,
		precedence: "caller-wins",
		allowPrivateNetwork: params.allowPrivateNetwork,
		api: params.api,
		request: params.request
	});
	const headers = new Headers(requestConfig.headers);
	if (!requestConfig.baseUrl) throw new Error("Missing baseUrl: provide baseUrl or defaultBaseUrl");
	return {
		baseUrl: requestConfig.baseUrl,
		allowPrivateNetwork: requestConfig.allowPrivateNetwork,
		headers,
		dispatcherPolicy: buildProviderRequestDispatcherPolicy(requestConfig),
		requestConfig
	};
}
/**
* Decide whether to auto-upgrade a provider HTTP request into
* `TRUSTED_ENV_PROXY` mode based on the runtime environment.
*
* This is gated conservatively to avoid the SSRF bypasses the initial
* auto-upgrade path exposed (see openclaw#64974 review threads):
*
* 1. If the caller supplied an explicit `dispatcherPolicy` — custom proxy URL,
*    `proxyTls`, or `connect` options — do NOT override it. Trusted-env mode
*    builds an `EnvHttpProxyAgent` that would silently drop those overrides,
*    breaking enterprise proxy/mTLS configs.
*
* 2. Only auto-upgrade when `HTTP_PROXY` or `HTTPS_PROXY` (lower- or
*    upper-case) is configured for the target protocol. `ALL_PROXY` is
*    explicitly ignored by `EnvHttpProxyAgent`, so counting it would
*    auto-upgrade requests that then make direct connections while skipping
*    pinned-DNS/SSRF hostname checks.
*
* 3. If `NO_PROXY` would bypass the proxy for this target, do NOT auto-upgrade.
*    `EnvHttpProxyAgent` makes direct connections for `NO_PROXY` matches, but
*    in `TRUSTED_ENV_PROXY` mode `fetchWithSsrFGuard` skips
*    `resolvePinnedHostnameWithPolicy` — so those direct connections would
*    bypass SSRF protection. Keep strict mode for `NO_PROXY` matches.
*/
function shouldAutoUpgradeToTrustedEnvProxy(params) {
	if (params.dispatcherPolicy) return false;
	let protocol;
	try {
		const parsed = new URL(params.url);
		if (parsed.protocol === "http:") protocol = "http";
		else if (parsed.protocol === "https:") protocol = "https";
		else return false;
	} catch {
		return false;
	}
	if (!hasEnvHttpProxyConfigured(protocol)) return false;
	if (matchesNoProxy(params.url)) return false;
	return true;
}
async function fetchWithTimeoutGuarded(url, init, timeoutMs, fetchFn, options) {
	const resolvedMode = options?.mode ?? (shouldAutoUpgradeToTrustedEnvProxy({
		url,
		dispatcherPolicy: options?.dispatcherPolicy
	}) ? GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY : void 0);
	return await fetchWithSsrFGuard({
		url,
		fetchImpl: fetchFn,
		init,
		timeoutMs: resolveGuardedHttpTimeoutMs(timeoutMs),
		policy: options?.ssrfPolicy,
		lookupFn: options?.lookupFn,
		pinDns: options?.pinDns,
		dispatcherPolicy: options?.dispatcherPolicy,
		auditContext: sanitizeAuditContext(options?.auditContext),
		...resolvedMode ? { mode: resolvedMode } : {}
	});
}
function resolveGuardedPostRequestOptions(params) {
	if (!params.allowPrivateNetwork && !params.dispatcherPolicy && params.pinDns === void 0 && !params.auditContext && params.mode === void 0) return;
	return {
		...params.allowPrivateNetwork ? { ssrfPolicy: { allowPrivateNetwork: true } } : {},
		...params.pinDns !== void 0 ? { pinDns: params.pinDns } : {},
		...params.dispatcherPolicy ? { dispatcherPolicy: params.dispatcherPolicy } : {},
		...params.auditContext ? { auditContext: params.auditContext } : {},
		...params.mode !== void 0 ? { mode: params.mode } : {}
	};
}
async function postTranscriptionRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: params.body
	}, params.timeoutMs, params.fetchFn, resolveGuardedPostRequestOptions(params));
}
async function postJsonRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: JSON.stringify(params.body)
	}, params.timeoutMs, params.fetchFn, resolveGuardedPostRequestOptions(params));
}
async function readErrorResponse(res) {
	let reader;
	try {
		if (!res.body) return;
		reader = res.body.getReader();
		const chunks = [];
		let total = 0;
		let sawBytes = false;
		while (total < MAX_ERROR_RESPONSE_BYTES) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value || value.length === 0) continue;
			sawBytes = true;
			const remaining = MAX_ERROR_RESPONSE_BYTES - total;
			const chunk = value.length <= remaining ? value : value.subarray(0, remaining);
			chunks.push(chunk);
			total += chunk.length;
			if (chunk.length < value.length) break;
		}
		if (!sawBytes) return;
		const bytes = new Uint8Array(total);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.length;
		}
		const collapsed = new TextDecoder().decode(bytes).replace(/\s+/g, " ").trim();
		if (!collapsed) return;
		if (collapsed.length <= MAX_ERROR_CHARS) return collapsed;
		return `${collapsed.slice(0, MAX_ERROR_CHARS)}…`;
	} catch {
		return;
	} finally {
		try {
			await reader?.cancel();
		} catch {}
	}
}
async function assertOkOrThrowHttpError(res, label) {
	if (res.ok) return;
	const detail = await readErrorResponse(res);
	const suffix = detail ? `: ${detail}` : "";
	throw new Error(`${label} (HTTP ${res.status})${suffix}`);
}
function requireTranscriptionText(value, missingMessage) {
	const text = value?.trim();
	if (!text) throw new Error(missingMessage);
	return text;
}
//#endregion
export { postTranscriptionRequest as a, resolveProviderOperationTimeoutMs as c, postJsonRequest as i, waitProviderOperationPollInterval as l, createProviderOperationDeadline as n, requireTranscriptionText as o, fetchWithTimeoutGuarded as r, resolveProviderHttpRequestConfig as s, assertOkOrThrowHttpError as t };
