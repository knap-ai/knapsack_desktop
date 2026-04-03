import { a as logWarn } from "./logger-Dr2uNJI4.js";
import { n as buildTimeoutAbortSignal } from "./fetch-timeout-C2XH7I0A.js";
import { r as hasProxyEnvConfigured } from "./proxy-env-jA26vAp8.js";
import { t as retainSafeHeadersForCrossOriginRedirect$1 } from "./redirect-headers-Dd5ch3iy.js";
import { d as resolvePinnedHostnameWithPolicy, i as createPinnedDispatcher, p as loadUndiciRuntimeDeps, r as closeDispatcher, t as SsrFBlockedError } from "./ssrf-BWlfjI7J.js";
//#region src/infra/net/fetch-guard.ts
const GUARDED_FETCH_MODE = {
	STRICT: "strict",
	TRUSTED_ENV_PROXY: "trusted_env_proxy"
};
const DEFAULT_MAX_REDIRECTS = 3;
function withStrictGuardedFetchMode(params) {
	return {
		...params,
		mode: GUARDED_FETCH_MODE.STRICT
	};
}
function withTrustedEnvProxyGuardedFetchMode(params) {
	return {
		...params,
		mode: GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY
	};
}
function resolveGuardedFetchMode(params) {
	if (params.mode) return params.mode;
	if (params.proxy === "env" && params.dangerouslyAllowEnvProxyWithoutPinnedDns === true) return GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY;
	return GUARDED_FETCH_MODE.STRICT;
}
function assertExplicitProxySupportsPinnedDns(url, dispatcherPolicy, pinDns) {
	if (pinDns !== false && dispatcherPolicy?.mode === "explicit-proxy" && url.protocol !== "https:") throw new Error("Explicit proxy SSRF pinning requires HTTPS targets; plain HTTP targets are not supported");
}
async function assertExplicitProxyAllowed(dispatcherPolicy, lookupFn, policy) {
	if (!dispatcherPolicy || dispatcherPolicy.mode !== "explicit-proxy") return;
	let parsedProxyUrl;
	try {
		parsedProxyUrl = new URL(dispatcherPolicy.proxyUrl);
	} catch {
		throw new Error("Invalid explicit proxy URL");
	}
	if (!["http:", "https:"].includes(parsedProxyUrl.protocol)) throw new Error("Explicit proxy URL must use http or https");
	await resolvePinnedHostnameWithPolicy(parsedProxyUrl.hostname, {
		lookupFn,
		policy: dispatcherPolicy.allowPrivateProxy === true ? {
			...policy,
			allowPrivateNetwork: true
		} : policy
	});
}
function isRedirectStatus(status) {
	return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}
function retainSafeHeadersForCrossOriginRedirectHeaders(headers) {
	return retainSafeHeadersForCrossOriginRedirect$1(headers);
}
function retainSafeHeadersForCrossOriginRedirect(init) {
	if (!init?.headers) return init;
	return {
		...init,
		headers: retainSafeHeadersForCrossOriginRedirect$1(init.headers)
	};
}
async function fetchWithSsrFGuard(params) {
	const fetcher = params.fetchImpl ?? globalThis.fetch;
	if (!fetcher) throw new Error("fetch is not available");
	const maxRedirects = typeof params.maxRedirects === "number" && Number.isFinite(params.maxRedirects) ? Math.max(0, Math.floor(params.maxRedirects)) : DEFAULT_MAX_REDIRECTS;
	const mode = resolveGuardedFetchMode(params);
	const { signal, cleanup } = buildTimeoutAbortSignal({
		timeoutMs: params.timeoutMs,
		signal: params.signal
	});
	let released = false;
	const release = async (dispatcher) => {
		if (released) return;
		released = true;
		cleanup();
		await closeDispatcher(dispatcher ?? void 0);
	};
	const visited = /* @__PURE__ */ new Set();
	let currentUrl = params.url;
	let currentInit = params.init ? { ...params.init } : void 0;
	let redirectCount = 0;
	while (true) {
		let parsedUrl;
		try {
			parsedUrl = new URL(currentUrl);
		} catch {
			await release();
			throw new Error("Invalid URL: must be http or https");
		}
		if (!["http:", "https:"].includes(parsedUrl.protocol)) {
			await release();
			throw new Error("Invalid URL: must be http or https");
		}
		let dispatcher = null;
		try {
			assertExplicitProxySupportsPinnedDns(parsedUrl, params.dispatcherPolicy, params.pinDns);
			await assertExplicitProxyAllowed(params.dispatcherPolicy, params.lookupFn, params.policy);
			const pinned = await resolvePinnedHostnameWithPolicy(parsedUrl.hostname, {
				lookupFn: params.lookupFn,
				policy: params.policy
			});
			if (mode === GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY && hasProxyEnvConfigured()) {
				const { EnvHttpProxyAgent } = loadUndiciRuntimeDeps();
				dispatcher = new EnvHttpProxyAgent();
			} else if (params.pinDns !== false) dispatcher = createPinnedDispatcher(pinned, params.dispatcherPolicy, params.policy);
			const init = {
				...currentInit ? { ...currentInit } : {},
				redirect: "manual",
				...dispatcher ? { dispatcher } : {},
				...signal ? { signal } : {}
			};
			const response = await fetcher(parsedUrl.toString(), init);
			if (isRedirectStatus(response.status)) {
				const location = response.headers.get("location");
				if (!location) {
					await release(dispatcher);
					throw new Error(`Redirect missing location header (${response.status})`);
				}
				redirectCount += 1;
				if (redirectCount > maxRedirects) {
					await release(dispatcher);
					throw new Error(`Too many redirects (limit: ${maxRedirects})`);
				}
				const nextParsedUrl = new URL(location, parsedUrl);
				const nextUrl = nextParsedUrl.toString();
				if (visited.has(nextUrl)) {
					await release(dispatcher);
					throw new Error("Redirect loop detected");
				}
				if (nextParsedUrl.origin !== parsedUrl.origin) currentInit = retainSafeHeadersForCrossOriginRedirect(currentInit);
				visited.add(nextUrl);
				response.body?.cancel();
				await closeDispatcher(dispatcher);
				currentUrl = nextUrl;
				continue;
			}
			return {
				response,
				finalUrl: currentUrl,
				release: async () => release(dispatcher)
			};
		} catch (err) {
			if (err instanceof SsrFBlockedError) logWarn(`security: blocked URL fetch (${params.auditContext ?? "url-fetch"}) target=${parsedUrl.origin}${parsedUrl.pathname} reason=${err.message}`);
			await release(dispatcher);
			throw err;
		}
	}
}
//#endregion
export { withTrustedEnvProxyGuardedFetchMode as a, withStrictGuardedFetchMode as i, fetchWithSsrFGuard as n, retainSafeHeadersForCrossOriginRedirectHeaders as r, GUARDED_FETCH_MODE as t };
