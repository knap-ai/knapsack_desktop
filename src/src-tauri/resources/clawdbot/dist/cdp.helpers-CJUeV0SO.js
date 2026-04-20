import { r as redactSensitiveText } from "./redact-D4nea1HF.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as isLoopbackHost } from "./net-lBInRHnX.js";
import { t as rawDataToString } from "./ws-BjBhlcWu.js";
import { r as hasProxyEnvConfigured } from "./proxy-env-qIN1SJGt.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { t as normalizeHostname } from "./hostname-E_rVPb-s.js";
import { d as isPrivateNetworkAllowedByPolicy, f as matchesHostnameAllowlist, h as resolvePinnedHostnameWithPolicy, t as SsrFBlockedError } from "./ssrf-DoOclwFS.js";
import "./text-runtime-DTMxvodz.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./browser-node-runtime-Cr9m9xwX.js";
import "./browser-security-runtime-DCYxvSMK.js";
import { t as resolveBrowserRateLimitMessage } from "./rate-limit-message-1yTP_ns_.js";
import { isIP } from "node:net";
import WebSocket from "ws";
import http from "node:http";
import https from "node:https";
//#region extensions/browser/src/browser/navigation-guard.ts
const NETWORK_NAVIGATION_PROTOCOLS = new Set(["http:", "https:"]);
const SAFE_NON_NETWORK_URLS = new Set(["about:blank"]);
function isAllowedNonNetworkNavigationUrl(parsed) {
	return SAFE_NON_NETWORK_URLS.has(parsed.href);
}
var InvalidBrowserNavigationUrlError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "InvalidBrowserNavigationUrlError";
	}
};
function withBrowserNavigationPolicy(ssrfPolicy) {
	return ssrfPolicy ? { ssrfPolicy } : {};
}
function requiresInspectableBrowserNavigationRedirects(ssrfPolicy) {
	return ssrfPolicy?.dangerouslyAllowPrivateNetwork === false;
}
function requiresInspectableBrowserNavigationRedirectsForUrl(url, ssrfPolicy) {
	if (!requiresInspectableBrowserNavigationRedirects(ssrfPolicy)) return false;
	try {
		const parsed = new URL(url);
		return NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol);
	} catch {
		return false;
	}
}
function isIpLiteralHostname(hostname) {
	return isIP(normalizeHostname(hostname)) !== 0;
}
function isExplicitlyAllowedBrowserHostname(hostname, ssrfPolicy) {
	const normalizedHostname = normalizeHostname(hostname);
	if ((ssrfPolicy?.allowedHostnames ?? []).some((value) => normalizeHostname(value) === normalizedHostname)) return true;
	const hostnameAllowlist = (ssrfPolicy?.hostnameAllowlist ?? []).map((pattern) => normalizeHostname(pattern)).filter(Boolean);
	return hostnameAllowlist.length > 0 ? matchesHostnameAllowlist(normalizedHostname, hostnameAllowlist) : false;
}
async function assertBrowserNavigationAllowed(opts) {
	const rawUrl = normalizeOptionalString(opts.url) ?? "";
	if (!rawUrl) throw new InvalidBrowserNavigationUrlError("url is required");
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		throw new InvalidBrowserNavigationUrlError(`Invalid URL: ${rawUrl}`);
	}
	if (!NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol)) {
		if (isAllowedNonNetworkNavigationUrl(parsed)) return;
		throw new InvalidBrowserNavigationUrlError(`Navigation blocked: unsupported protocol "${parsed.protocol}"`);
	}
	if (hasProxyEnvConfigured() && !isPrivateNetworkAllowedByPolicy(opts.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy cannot be enforced while env proxy variables are set");
	if (opts.ssrfPolicy && opts.ssrfPolicy.dangerouslyAllowPrivateNetwork === false && !isPrivateNetworkAllowedByPolicy(opts.ssrfPolicy) && !isIpLiteralHostname(parsed.hostname) && !isExplicitlyAllowedBrowserHostname(parsed.hostname, opts.ssrfPolicy)) throw new InvalidBrowserNavigationUrlError("Navigation blocked: strict browser SSRF policy requires an IP-literal URL because browser DNS rebinding protections are unavailable for hostname-based navigation");
	await resolvePinnedHostnameWithPolicy(parsed.hostname, {
		lookupFn: opts.lookupFn,
		policy: opts.ssrfPolicy
	});
}
/**
* Best-effort post-navigation guard for final page URLs.
* Only validates network URLs (http/https) and about:blank to avoid false
* positives on browser-internal error pages (e.g. chrome-error://). In strict
* mode this intentionally re-applies the hostname gate after redirects.
*/
async function assertBrowserNavigationResultAllowed(opts) {
	const rawUrl = normalizeOptionalString(opts.url) ?? "";
	if (!rawUrl) return;
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return;
	}
	if (NETWORK_NAVIGATION_PROTOCOLS.has(parsed.protocol) || isAllowedNonNetworkNavigationUrl(parsed)) await assertBrowserNavigationAllowed(opts);
}
async function assertBrowserNavigationRedirectChainAllowed(opts) {
	const chain = [];
	let current = opts.request ?? null;
	while (current) {
		chain.push(current.url());
		current = current.redirectedFrom();
	}
	for (const url of chain.toReversed()) await assertBrowserNavigationAllowed({
		url,
		lookupFn: opts.lookupFn,
		ssrfPolicy: opts.ssrfPolicy
	});
}
//#endregion
//#region extensions/browser/src/browser/errors.ts
const BROWSER_ENDPOINT_BLOCKED_MESSAGE = "browser endpoint blocked by policy";
const BROWSER_NAVIGATION_BLOCKED_MESSAGE = "browser navigation blocked by policy";
var BrowserError = class extends Error {
	constructor(message, status = 500, options) {
		super(message, options);
		this.name = new.target.name;
		this.status = status;
	}
};
/**
* Raised when a browser CDP endpoint (the cdpUrl itself) fails the
* configured SSRF policy. Distinct from a blocked navigation target so
* callers see "fix your browser endpoint config" rather than "fix your
* navigation URL".
*/
var BrowserCdpEndpointBlockedError = class extends BrowserError {
	constructor(options) {
		super(BROWSER_ENDPOINT_BLOCKED_MESSAGE, 400, options);
	}
};
var BrowserValidationError = class extends BrowserError {
	constructor(message, options) {
		super(message, 400, options);
	}
};
var BrowserTargetAmbiguousError = class extends BrowserError {
	constructor(message = "ambiguous target id prefix", options) {
		super(message, 409, options);
	}
};
var BrowserTabNotFoundError = class extends BrowserError {
	constructor(message = "tab not found", options) {
		super(message, 404, options);
	}
};
var BrowserProfileNotFoundError = class extends BrowserError {
	constructor(message, options) {
		super(message, 404, options);
	}
};
var BrowserConflictError = class extends BrowserError {
	constructor(message, options) {
		super(message, 409, options);
	}
};
var BrowserResetUnsupportedError = class extends BrowserError {
	constructor(message, options) {
		super(message, 400, options);
	}
};
var BrowserProfileUnavailableError = class extends BrowserError {
	constructor(message, options) {
		super(message, 409, options);
	}
};
var BrowserResourceExhaustedError = class extends BrowserError {
	constructor(message, options) {
		super(message, 507, options);
	}
};
function toBrowserErrorResponse(err) {
	if (err instanceof BrowserError) return {
		status: err.status,
		message: err.message
	};
	if (err instanceof Error && err.name === "BlockedBrowserTargetError") return {
		status: 409,
		message: err.message
	};
	if (err instanceof SsrFBlockedError) return {
		status: 400,
		message: BROWSER_NAVIGATION_BLOCKED_MESSAGE
	};
	if (err instanceof InvalidBrowserNavigationUrlError || err instanceof Error && err.name === "InvalidBrowserNavigationUrlError") return {
		status: 400,
		message: err.message
	};
	return null;
}
//#endregion
//#region extensions/browser/src/browser/cdp-proxy-bypass.ts
/**
* Proxy bypass for CDP (Chrome DevTools Protocol) localhost connections.
*
* When HTTP_PROXY / HTTPS_PROXY / ALL_PROXY environment variables are set,
* CDP connections to localhost/127.0.0.1 can be incorrectly routed through
* the proxy, causing browser control to fail.
*
* @see https://github.com/nicepkg/openclaw/issues/31219
*/
/** HTTP agent that never uses a proxy — for localhost CDP connections. */
const directHttpAgent = new http.Agent();
const directHttpsAgent = new https.Agent();
/**
* Returns a plain (non-proxy) agent for WebSocket or HTTP connections
* when the target is a loopback address. Returns `undefined` otherwise
* so callers fall through to their default behaviour.
*/
function getDirectAgentForCdp(url) {
	try {
		const parsed = new URL(url);
		if (isLoopbackHost(parsed.hostname)) return parsed.protocol === "https:" || parsed.protocol === "wss:" ? directHttpsAgent : directHttpAgent;
	} catch {}
}
/**
* Returns `true` when any proxy-related env var is set that could
* interfere with loopback connections.
*/
function hasProxyEnv() {
	return hasProxyEnvConfigured();
}
const LOOPBACK_ENTRIES = "localhost,127.0.0.1,[::1]";
function noProxyAlreadyCoversLocalhost() {
	const current = process.env.NO_PROXY || process.env.no_proxy || "";
	return current.includes("localhost") && current.includes("127.0.0.1") && current.includes("[::1]");
}
function isLoopbackCdpUrl(url) {
	try {
		return isLoopbackHost(new URL(url).hostname);
	} catch {
		return false;
	}
}
var NoProxyLeaseManager = class {
	constructor() {
		this.leaseCount = 0;
		this.snapshot = null;
	}
	acquire(url) {
		if (!isLoopbackCdpUrl(url) || !hasProxyEnv()) return null;
		if (this.leaseCount === 0 && !noProxyAlreadyCoversLocalhost()) {
			const noProxy = process.env.NO_PROXY;
			const noProxyLower = process.env.no_proxy;
			const current = noProxy || noProxyLower || "";
			const applied = current ? `${current},${LOOPBACK_ENTRIES}` : LOOPBACK_ENTRIES;
			process.env.NO_PROXY = applied;
			process.env.no_proxy = applied;
			this.snapshot = {
				noProxy,
				noProxyLower,
				applied
			};
		}
		this.leaseCount += 1;
		let released = false;
		return () => {
			if (released) return;
			released = true;
			this.release();
		};
	}
	release() {
		if (this.leaseCount <= 0) return;
		this.leaseCount -= 1;
		if (this.leaseCount > 0 || !this.snapshot) return;
		const { noProxy, noProxyLower, applied } = this.snapshot;
		const currentNoProxy = process.env.NO_PROXY;
		const currentNoProxyLower = process.env.no_proxy;
		if (currentNoProxy === applied && (currentNoProxyLower === applied || currentNoProxyLower === void 0)) {
			if (noProxy !== void 0) process.env.NO_PROXY = noProxy;
			else delete process.env.NO_PROXY;
			if (noProxyLower !== void 0) process.env.no_proxy = noProxyLower;
			else delete process.env.no_proxy;
		}
		this.snapshot = null;
	}
};
const noProxyLeaseManager = new NoProxyLeaseManager();
/**
* Scoped NO_PROXY bypass for loopback CDP URLs.
*
* This wrapper only mutates env vars for loopback destinations. On restore,
* it avoids clobbering external NO_PROXY changes that happened while calls
* were in-flight.
*/
async function withNoProxyForCdpUrl(url, fn) {
	const release = noProxyLeaseManager.acquire(url);
	try {
		return await fn();
	} finally {
		release?.();
	}
}
//#endregion
//#region extensions/browser/src/browser/cdp-timeouts.ts
const CDP_HTTP_REQUEST_TIMEOUT_MS = 1500;
const CDP_WS_HANDSHAKE_TIMEOUT_MS = 5e3;
const CDP_JSON_NEW_TIMEOUT_MS = 1500;
const CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS = 1e4;
const CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS = 5e3;
const CHROME_LAUNCH_READY_WINDOW_MS = 15e3;
const CHROME_STOP_TIMEOUT_MS = 2500;
const CHROME_STDERR_HINT_MAX_CHARS = 2e3;
const PROFILE_WS_REACHABILITY_MAX_TIMEOUT_MS = 2e3;
const PROFILE_ATTACH_RETRY_TIMEOUT_MS = 1200;
const CHROME_MCP_ATTACH_READY_WINDOW_MS = 8e3;
function usesFastLoopbackCdpProbeClass(params) {
	return params.profileIsLoopback && params.attachOnly !== true;
}
function normalizeTimeoutMs(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return;
	return Math.max(1, Math.floor(value));
}
function resolveCdpReachabilityTimeouts(params) {
	const normalized = normalizeTimeoutMs(params.timeoutMs);
	if (usesFastLoopbackCdpProbeClass({
		profileIsLoopback: params.profileIsLoopback,
		attachOnly: params.attachOnly
	})) {
		const httpTimeoutMs = normalized ?? 300;
		return {
			httpTimeoutMs,
			wsTimeoutMs: Math.max(200, Math.min(PROFILE_WS_REACHABILITY_MAX_TIMEOUT_MS, httpTimeoutMs * 2))
		};
	}
	if (normalized !== void 0) return {
		httpTimeoutMs: Math.max(normalized, params.remoteHttpTimeoutMs),
		wsTimeoutMs: Math.max(normalized * 2, params.remoteHandshakeTimeoutMs)
	};
	return {
		httpTimeoutMs: params.remoteHttpTimeoutMs,
		wsTimeoutMs: params.remoteHandshakeTimeoutMs
	};
}
//#endregion
//#region extensions/browser/src/browser/cdp.helpers.ts
function parseBrowserHttpUrl(raw, label) {
	const trimmed = raw.trim();
	const parsed = new URL(trimmed);
	if (![
		"http:",
		"https:",
		"ws:",
		"wss:"
	].includes(parsed.protocol)) throw new Error(`${label} must be http(s) or ws(s), got: ${parsed.protocol.replace(":", "")}`);
	const isSecure = parsed.protocol === "https:" || parsed.protocol === "wss:";
	const port = parsed.port && Number.parseInt(parsed.port, 10) > 0 ? Number.parseInt(parsed.port, 10) : isSecure ? 443 : 80;
	if (Number.isNaN(port) || port <= 0 || port > 65535) throw new Error(`${label} has invalid port: ${parsed.port}`);
	return {
		parsed,
		port,
		normalized: parsed.toString().replace(/\/$/, "")
	};
}
/**
* Returns true when the URL uses a WebSocket protocol (ws: or wss:).
* Used to distinguish direct-WebSocket CDP endpoints
* from HTTP(S) endpoints that require /json/version discovery.
*/
function isWebSocketUrl(url) {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "ws:" || parsed.protocol === "wss:";
	} catch {
		return false;
	}
}
async function assertCdpEndpointAllowed(cdpUrl, ssrfPolicy) {
	if (!ssrfPolicy) return;
	const parsed = new URL(cdpUrl);
	if (![
		"http:",
		"https:",
		"ws:",
		"wss:"
	].includes(parsed.protocol)) throw new Error(`Invalid CDP URL protocol: ${parsed.protocol.replace(":", "")}`);
	try {
		const policy = isLoopbackHost(parsed.hostname) ? {
			...ssrfPolicy,
			allowedHostnames: Array.from(new Set([...ssrfPolicy?.allowedHostnames ?? [], parsed.hostname]))
		} : ssrfPolicy;
		await resolvePinnedHostnameWithPolicy(parsed.hostname, { policy });
	} catch (error) {
		throw new BrowserCdpEndpointBlockedError({ cause: error });
	}
}
function redactCdpUrl(cdpUrl) {
	if (typeof cdpUrl !== "string") return cdpUrl;
	const trimmed = cdpUrl.trim();
	if (!trimmed) return trimmed;
	try {
		const parsed = new URL(trimmed);
		parsed.username = "";
		parsed.password = "";
		return redactSensitiveText(parsed.toString().replace(/\/$/, ""));
	} catch {
		return redactSensitiveText(trimmed);
	}
}
function getHeadersWithAuth(url, headers = {}) {
	const mergedHeaders = { ...headers };
	try {
		const parsed = new URL(url);
		if (Object.keys(mergedHeaders).some((key) => normalizeLowercaseStringOrEmpty(key) === "authorization")) return mergedHeaders;
		if (parsed.username || parsed.password) {
			const auth = Buffer.from(`${parsed.username}:${parsed.password}`).toString("base64");
			return {
				...mergedHeaders,
				Authorization: `Basic ${auth}`
			};
		}
	} catch {}
	return mergedHeaders;
}
function appendCdpPath(cdpUrl, path) {
	const url = new URL(cdpUrl);
	url.pathname = `${url.pathname.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
	return url.toString();
}
function normalizeCdpHttpBaseForJsonEndpoints(cdpUrl) {
	try {
		const url = new URL(cdpUrl);
		if (url.protocol === "ws:") url.protocol = "http:";
		else if (url.protocol === "wss:") url.protocol = "https:";
		url.pathname = url.pathname.replace(/\/devtools\/browser\/.*$/, "");
		url.pathname = url.pathname.replace(/\/cdp$/, "");
		return url.toString().replace(/\/$/, "");
	} catch {
		return cdpUrl.replace(/^ws:/, "http:").replace(/^wss:/, "https:").replace(/\/devtools\/browser\/.*$/, "").replace(/\/cdp$/, "").replace(/\/$/, "");
	}
}
function createCdpSender(ws) {
	let nextId = 1;
	const pending = /* @__PURE__ */ new Map();
	const send = (method, params, sessionId) => {
		const id = nextId++;
		const msg = {
			id,
			method,
			params,
			sessionId
		};
		ws.send(JSON.stringify(msg));
		return new Promise((resolve, reject) => {
			pending.set(id, {
				resolve,
				reject
			});
		});
	};
	const closeWithError = (err) => {
		for (const [, p] of pending) p.reject(err);
		pending.clear();
		try {
			ws.close();
		} catch {}
	};
	ws.on("error", (err) => {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
	});
	ws.on("message", (data) => {
		try {
			const parsed = JSON.parse(rawDataToString(data));
			if (typeof parsed.id !== "number") return;
			const p = pending.get(parsed.id);
			if (!p) return;
			pending.delete(parsed.id);
			if (parsed.error?.message) {
				p.reject(new Error(parsed.error.message));
				return;
			}
			p.resolve(parsed.result);
		} catch {}
	});
	ws.on("close", () => {
		closeWithError(/* @__PURE__ */ new Error("CDP socket closed"));
	});
	return {
		send,
		closeWithError
	};
}
async function fetchJson(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init, ssrfPolicy) {
	const { response, release } = await fetchCdpChecked(url, timeoutMs, init, ssrfPolicy);
	try {
		return await response.json();
	} finally {
		await release();
	}
}
async function fetchCdpChecked(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init, ssrfPolicy) {
	const ctrl = new AbortController();
	const t = setTimeout(ctrl.abort.bind(ctrl), timeoutMs);
	let guardedRelease;
	let released = false;
	const release = async () => {
		if (released) return;
		released = true;
		clearTimeout(t);
		await guardedRelease?.();
	};
	try {
		const headers = getHeadersWithAuth(url, init?.headers || {});
		const res = await withNoProxyForCdpUrl(url, async () => {
			const parsedUrl = new URL(url);
			const policy = isLoopbackHost(parsedUrl.hostname) ? {
				...ssrfPolicy,
				allowedHostnames: Array.from(new Set([...ssrfPolicy?.allowedHostnames ?? [], parsedUrl.hostname]))
			} : ssrfPolicy ?? { allowPrivateNetwork: true };
			const guarded = await fetchWithSsrFGuard({
				url,
				init: {
					...init,
					headers
				},
				signal: ctrl.signal,
				policy,
				auditContext: "browser-cdp"
			});
			guardedRelease = guarded.release;
			return guarded.response;
		});
		if (!res.ok) {
			if (res.status === 429) throw new Error(`${resolveBrowserRateLimitMessage(url)} Do NOT retry the browser tool.`);
			throw new Error(`HTTP ${res.status}`);
		}
		return {
			response: res,
			release
		};
	} catch (error) {
		await release();
		if (error instanceof SsrFBlockedError) throw new BrowserCdpEndpointBlockedError({ cause: error });
		throw error;
	}
}
async function fetchOk(url, timeoutMs = CDP_HTTP_REQUEST_TIMEOUT_MS, init, ssrfPolicy) {
	const { release } = await fetchCdpChecked(url, timeoutMs, init, ssrfPolicy);
	await release();
}
function openCdpWebSocket(wsUrl, opts) {
	const headers = getHeadersWithAuth(wsUrl, opts?.headers ?? {});
	const handshakeTimeoutMs = typeof opts?.handshakeTimeoutMs === "number" && Number.isFinite(opts.handshakeTimeoutMs) ? Math.max(1, Math.floor(opts.handshakeTimeoutMs)) : CDP_WS_HANDSHAKE_TIMEOUT_MS;
	const agent = getDirectAgentForCdp(wsUrl);
	return new WebSocket(wsUrl, {
		handshakeTimeout: handshakeTimeoutMs,
		...Object.keys(headers).length ? { headers } : {},
		...agent ? { agent } : {}
	});
}
async function withCdpSocket(wsUrl, fn, opts) {
	const ws = openCdpWebSocket(wsUrl, opts);
	const { send, closeWithError } = createCdpSender(ws);
	const openPromise = new Promise((resolve, reject) => {
		ws.once("open", () => resolve());
		ws.once("error", (err) => reject(err));
		ws.once("close", () => reject(/* @__PURE__ */ new Error("CDP socket closed")));
	});
	try {
		await openPromise;
	} catch (err) {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
		throw err;
	}
	try {
		return await fn(send);
	} catch (err) {
		closeWithError(err instanceof Error ? err : new Error(String(err)));
		throw err;
	} finally {
		try {
			ws.close();
		} catch {}
	}
}
//#endregion
export { BrowserTargetAmbiguousError as A, withNoProxyForCdpUrl as C, BrowserResetUnsupportedError as D, BrowserProfileUnavailableError as E, assertBrowserNavigationRedirectChainAllowed as F, assertBrowserNavigationResultAllowed as I, requiresInspectableBrowserNavigationRedirectsForUrl as L, toBrowserErrorResponse as M, InvalidBrowserNavigationUrlError as N, BrowserResourceExhaustedError as O, assertBrowserNavigationAllowed as P, withBrowserNavigationPolicy as R, usesFastLoopbackCdpProbeClass as S, BrowserProfileNotFoundError as T, CHROME_MCP_ATTACH_READY_WINDOW_MS as _, fetchOk as a, PROFILE_ATTACH_RETRY_TIMEOUT_MS as b, normalizeCdpHttpBaseForJsonEndpoints as c, redactCdpUrl as d, withCdpSocket as f, CHROME_LAUNCH_READY_WINDOW_MS as g, CHROME_BOOTSTRAP_PREFS_TIMEOUT_MS as h, fetchJson as i, BrowserValidationError as j, BrowserTabNotFoundError as k, openCdpWebSocket as l, CHROME_BOOTSTRAP_EXIT_TIMEOUT_MS as m, assertCdpEndpointAllowed as n, getHeadersWithAuth as o, CDP_JSON_NEW_TIMEOUT_MS as p, fetchCdpChecked as r, isWebSocketUrl as s, appendCdpPath as t, parseBrowserHttpUrl as u, CHROME_STDERR_HINT_MAX_CHARS as v, BrowserConflictError as w, resolveCdpReachabilityTimeouts as x, CHROME_STOP_TIMEOUT_MS as y };
