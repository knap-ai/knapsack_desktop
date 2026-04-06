import { d as resolvePinnedHostnameWithPolicy, i as createPinnedDispatcher, r as closeDispatcher } from "./ssrf-BWlfjI7J.js";
import { i as readResponseWithLimit$1 } from "./fetch-ClF-ZgDC.js";
import "./media-runtime-DdCWeFPm.js";
import { t as buildTimeoutAbortSignal } from "./runtime-api-eE9m_2UG.js";
//#region extensions/matrix/src/matrix/sdk/event-helpers.ts
function matrixEventToRaw(event) {
	const unsigned = event.getUnsigned?.() ?? {};
	const raw = {
		event_id: event.getId() ?? "",
		sender: event.getSender() ?? "",
		type: event.getType() ?? "",
		origin_server_ts: event.getTs() ?? 0,
		content: (event.getContent?.() ?? {}) || {},
		unsigned
	};
	const stateKey = resolveMatrixStateKey(event);
	if (typeof stateKey === "string") raw.state_key = stateKey;
	return raw;
}
function parseMxc(url) {
	const match = /^mxc:\/\/([^/]+)\/(.+)$/.exec(url.trim());
	if (!match) return null;
	return {
		server: match[1],
		mediaId: match[2]
	};
}
function buildHttpError(statusCode, bodyText) {
	let message = `Matrix HTTP ${statusCode}`;
	if (bodyText.trim()) try {
		const parsed = JSON.parse(bodyText);
		if (typeof parsed.error === "string" && parsed.error.trim()) message = parsed.error.trim();
		else message = bodyText.slice(0, 500);
	} catch {
		message = bodyText.slice(0, 500);
	}
	return Object.assign(new Error(message), { statusCode });
}
function resolveMatrixStateKey(event) {
	const direct = event.getStateKey?.();
	if (typeof direct === "string") return direct;
	const wireContent = event.getWireContent?.();
	if (wireContent && typeof wireContent.state_key === "string") return wireContent.state_key;
	const rawEvent = event.event;
	if (rawEvent && typeof rawEvent.state_key === "string") return rawEvent.state_key;
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/read-response-with-limit.ts
async function readResponseWithLimit(res, maxBytes, opts) {
	return await readResponseWithLimit$1(res, maxBytes, {
		...opts,
		onIdleTimeout: opts?.onIdleTimeout ?? (({ chunkTimeoutMs }) => /* @__PURE__ */ new Error(`Matrix media download stalled: no data received for ${chunkTimeoutMs}ms`))
	});
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/transport.ts
function normalizeEndpoint(endpoint) {
	if (!endpoint) return "/";
	return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}
function applyQuery(url, qs) {
	if (!qs) return;
	for (const [key, rawValue] of Object.entries(qs)) {
		if (rawValue === void 0 || rawValue === null) continue;
		if (Array.isArray(rawValue)) {
			for (const item of rawValue) {
				if (item === void 0 || item === null) continue;
				url.searchParams.append(key, String(item));
			}
			continue;
		}
		url.searchParams.set(key, String(rawValue));
	}
}
function isRedirectStatus(statusCode) {
	return statusCode >= 300 && statusCode < 400;
}
function toFetchUrl(resource) {
	if (resource instanceof URL) return resource.toString();
	if (typeof resource === "string") return resource;
	return resource.url;
}
function buildBufferedResponse(params) {
	const response = new Response(params.body, {
		status: params.source.status,
		statusText: params.source.statusText,
		headers: new Headers(params.source.headers)
	});
	try {
		Object.defineProperty(response, "url", {
			value: params.source.url || params.url,
			configurable: true
		});
	} catch {}
	return response;
}
async function fetchWithMatrixGuardedRedirects(params) {
	let currentUrl = new URL(params.url);
	let method = (params.init?.method ?? "GET").toUpperCase();
	let body = params.init?.body;
	let headers = new Headers(params.init?.headers ?? {});
	const maxRedirects = 5;
	const visited = /* @__PURE__ */ new Set();
	const { signal, cleanup } = buildTimeoutAbortSignal({
		timeoutMs: params.timeoutMs,
		signal: params.signal
	});
	for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
		let dispatcher;
		try {
			dispatcher = createPinnedDispatcher(await resolvePinnedHostnameWithPolicy(currentUrl.hostname, { policy: params.ssrfPolicy }), params.dispatcherPolicy, params.ssrfPolicy);
			const response = await fetch(currentUrl.toString(), {
				...params.init,
				method,
				body,
				headers,
				redirect: "manual",
				signal,
				dispatcher
			});
			if (!isRedirectStatus(response.status)) return {
				response,
				release: async () => {
					cleanup();
					await closeDispatcher(dispatcher);
				},
				finalUrl: currentUrl.toString()
			};
			const location = response.headers.get("location");
			if (!location) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error(`Matrix redirect missing location header (${currentUrl.toString()})`);
			}
			const nextUrl = new URL(location, currentUrl);
			if (nextUrl.protocol !== currentUrl.protocol) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error(`Blocked cross-protocol redirect (${currentUrl.protocol} -> ${nextUrl.protocol})`);
			}
			const nextUrlString = nextUrl.toString();
			if (visited.has(nextUrlString)) {
				cleanup();
				await closeDispatcher(dispatcher);
				throw new Error("Redirect loop detected");
			}
			visited.add(nextUrlString);
			if (nextUrl.origin !== currentUrl.origin) {
				headers = new Headers(headers);
				headers.delete("authorization");
			}
			if (response.status === 303 || (response.status === 301 || response.status === 302) && method !== "GET" && method !== "HEAD") {
				method = "GET";
				body = void 0;
				headers = new Headers(headers);
				headers.delete("content-type");
				headers.delete("content-length");
			}
			response.body?.cancel();
			await closeDispatcher(dispatcher);
			currentUrl = nextUrl;
		} catch (error) {
			cleanup();
			await closeDispatcher(dispatcher);
			throw error;
		}
	}
	cleanup();
	throw new Error(`Too many redirects while requesting ${params.url}`);
}
function createMatrixGuardedFetch(params) {
	return (async (resource, init) => {
		const url = toFetchUrl(resource);
		const { signal, ...requestInit } = init ?? {};
		const { response, release } = await fetchWithMatrixGuardedRedirects({
			url,
			init: requestInit,
			signal: signal ?? void 0,
			ssrfPolicy: params.ssrfPolicy,
			dispatcherPolicy: params.dispatcherPolicy
		});
		try {
			return buildBufferedResponse({
				source: response,
				body: await response.arrayBuffer(),
				url
			});
		} finally {
			await release();
		}
	});
}
async function performMatrixRequest(params) {
	const isAbsoluteEndpoint = params.endpoint.startsWith("http://") || params.endpoint.startsWith("https://");
	if (isAbsoluteEndpoint && params.allowAbsoluteEndpoint !== true) throw new Error(`Absolute Matrix endpoint is blocked by default: ${params.endpoint}. Set allowAbsoluteEndpoint=true to opt in.`);
	const baseUrl = isAbsoluteEndpoint ? new URL(params.endpoint) : new URL(normalizeEndpoint(params.endpoint), params.homeserver);
	applyQuery(baseUrl, params.qs);
	const headers = new Headers();
	headers.set("Accept", params.raw ? "*/*" : "application/json");
	if (params.accessToken) headers.set("Authorization", `Bearer ${params.accessToken}`);
	let body;
	if (params.body !== void 0) if (params.body instanceof Uint8Array || params.body instanceof ArrayBuffer || typeof params.body === "string") body = params.body;
	else {
		headers.set("Content-Type", "application/json");
		body = JSON.stringify(params.body);
	}
	const { response, release } = await fetchWithMatrixGuardedRedirects({
		url: baseUrl.toString(),
		init: {
			method: params.method,
			headers,
			body
		},
		timeoutMs: params.timeoutMs,
		ssrfPolicy: params.ssrfPolicy,
		dispatcherPolicy: params.dispatcherPolicy
	});
	try {
		if (params.raw) {
			const contentLength = response.headers.get("content-length");
			if (params.maxBytes && contentLength) {
				const length = Number(contentLength);
				if (Number.isFinite(length) && length > params.maxBytes) throw new Error(`Matrix media exceeds configured size limit (${length} bytes > ${params.maxBytes} bytes)`);
			}
			const bytes = params.maxBytes ? await readResponseWithLimit(response, params.maxBytes, {
				onOverflow: ({ maxBytes, size }) => /* @__PURE__ */ new Error(`Matrix media exceeds configured size limit (${size} bytes > ${maxBytes} bytes)`),
				chunkTimeoutMs: params.readIdleTimeoutMs
			}) : Buffer.from(await response.arrayBuffer());
			return {
				response,
				text: bytes.toString("utf8"),
				buffer: bytes
			};
		}
		const text = await response.text();
		return {
			response,
			text,
			buffer: Buffer.from(text, "utf8")
		};
	} finally {
		await release();
	}
}
//#endregion
//#region extensions/matrix/src/matrix/sdk/http-client.ts
var MatrixAuthedHttpClient = class {
	constructor(params) {
		this.homeserver = params.homeserver;
		this.accessToken = params.accessToken;
		this.ssrfPolicy = params.ssrfPolicy;
		this.dispatcherPolicy = params.dispatcherPolicy;
	}
	async requestJson(params) {
		const { response, text } = await performMatrixRequest({
			homeserver: this.homeserver,
			accessToken: this.accessToken,
			method: params.method,
			endpoint: params.endpoint,
			qs: params.qs,
			body: params.body,
			timeoutMs: params.timeoutMs,
			ssrfPolicy: this.ssrfPolicy,
			dispatcherPolicy: this.dispatcherPolicy,
			allowAbsoluteEndpoint: params.allowAbsoluteEndpoint
		});
		if (!response.ok) throw buildHttpError(response.status, text);
		if ((response.headers.get("content-type") ?? "").includes("application/json")) {
			if (!text.trim()) return {};
			return JSON.parse(text);
		}
		return text;
	}
	async requestRaw(params) {
		const { response, buffer } = await performMatrixRequest({
			homeserver: this.homeserver,
			accessToken: this.accessToken,
			method: params.method,
			endpoint: params.endpoint,
			qs: params.qs,
			timeoutMs: params.timeoutMs,
			raw: true,
			maxBytes: params.maxBytes,
			readIdleTimeoutMs: params.readIdleTimeoutMs,
			ssrfPolicy: this.ssrfPolicy,
			dispatcherPolicy: this.dispatcherPolicy,
			allowAbsoluteEndpoint: params.allowAbsoluteEndpoint
		});
		if (!response.ok) throw buildHttpError(response.status, buffer.toString("utf8"));
		return buffer;
	}
};
//#endregion
export { parseMxc as i, createMatrixGuardedFetch as n, matrixEventToRaw as r, MatrixAuthedHttpClient as t };
