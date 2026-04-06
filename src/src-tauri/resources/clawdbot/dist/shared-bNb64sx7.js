import { n as fetchWithSsrFGuard } from "./fetch-guard-Lvq2pw52.js";
import { a as resolveProviderRequestPolicyConfig, t as buildProviderRequestDispatcherPolicy } from "./provider-request-config-0I1kx7Qd.js";
//#region src/media-understanding/shared.ts
const MAX_ERROR_CHARS = 300;
const MAX_ERROR_RESPONSE_BYTES = 4096;
const DEFAULT_GUARDED_HTTP_TIMEOUT_MS = 6e4;
const MAX_AUDIT_CONTEXT_CHARS = 80;
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
async function fetchWithTimeoutGuarded(url, init, timeoutMs, fetchFn, options) {
	return await fetchWithSsrFGuard({
		url,
		fetchImpl: fetchFn,
		init,
		timeoutMs: resolveGuardedHttpTimeoutMs(timeoutMs),
		policy: options?.ssrfPolicy,
		lookupFn: options?.lookupFn,
		pinDns: options?.pinDns,
		dispatcherPolicy: options?.dispatcherPolicy,
		auditContext: sanitizeAuditContext(options?.auditContext)
	});
}
async function postTranscriptionRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: params.body
	}, params.timeoutMs, params.fetchFn, params.allowPrivateNetwork || params.dispatcherPolicy ? {
		...params.allowPrivateNetwork ? { ssrfPolicy: { allowPrivateNetwork: true } } : {},
		...params.dispatcherPolicy ? { dispatcherPolicy: params.dispatcherPolicy } : {},
		...params.auditContext ? { auditContext: params.auditContext } : {}
	} : void 0);
}
async function postJsonRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: JSON.stringify(params.body)
	}, params.timeoutMs, params.fetchFn, params.allowPrivateNetwork || params.dispatcherPolicy ? {
		...params.allowPrivateNetwork ? { ssrfPolicy: { allowPrivateNetwork: true } } : {},
		...params.dispatcherPolicy ? { dispatcherPolicy: params.dispatcherPolicy } : {},
		...params.auditContext ? { auditContext: params.auditContext } : {}
	} : void 0);
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
export { requireTranscriptionText as a, postTranscriptionRequest as i, fetchWithTimeoutGuarded as n, resolveProviderHttpRequestConfig as o, postJsonRequest as r, assertOkOrThrowHttpError as t };
