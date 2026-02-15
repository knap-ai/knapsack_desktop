import { c as logWarn } from "./exec-B52LZOrO.js";
import { g as createPinnedDispatcher, h as closeDispatcher, m as SsrFBlockedError, o as detectMime, s as extensionForMime, y as resolvePinnedHostnameWithPolicy } from "./image-ops-BuOO2fiP.js";
import path from "node:path";

//#region src/utils/fetch-timeout.ts
/**
* Relay abort without forwarding the Event argument as the abort reason.
* Using .bind() avoids closure scope capture (memory leak prevention).
*/
function relayAbort() {
	this.abort();
}
/** Returns a bound abort relay for use as an event listener. */
function bindAbortRelay(controller) {
	return relayAbort.bind(controller);
}
/**
* Fetch wrapper that adds timeout support via AbortController.
*
* @param url - The URL to fetch
* @param init - RequestInit options (headers, method, body, etc.)
* @param timeoutMs - Timeout in milliseconds
* @param fetchFn - The fetch implementation to use (defaults to global fetch)
* @returns The fetch Response
* @throws AbortError if the request times out
*/
async function fetchWithTimeout(url, init, timeoutMs, fetchFn = fetch) {
	const controller = new AbortController();
	const timer = setTimeout(controller.abort.bind(controller), Math.max(1, timeoutMs));
	try {
		return await fetchFn(url, {
			...init,
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
}

//#endregion
//#region src/infra/net/fetch-guard.ts
const DEFAULT_MAX_REDIRECTS = 3;
function isRedirectStatus(status) {
	return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}
function buildAbortSignal(params) {
	const { timeoutMs, signal } = params;
	if (!timeoutMs && !signal) return {
		signal: void 0,
		cleanup: () => {}
	};
	if (!timeoutMs) return {
		signal,
		cleanup: () => {}
	};
	const controller = new AbortController();
	const timeoutId = setTimeout(controller.abort.bind(controller), timeoutMs);
	const onAbort = bindAbortRelay(controller);
	if (signal) if (signal.aborted) controller.abort();
	else signal.addEventListener("abort", onAbort, { once: true });
	const cleanup = () => {
		clearTimeout(timeoutId);
		if (signal) signal.removeEventListener("abort", onAbort);
	};
	return {
		signal: controller.signal,
		cleanup
	};
}
async function fetchWithSsrFGuard(params) {
	const fetcher = params.fetchImpl ?? globalThis.fetch;
	if (!fetcher) throw new Error("fetch is not available");
	const maxRedirects = typeof params.maxRedirects === "number" && Number.isFinite(params.maxRedirects) ? Math.max(0, Math.floor(params.maxRedirects)) : DEFAULT_MAX_REDIRECTS;
	const { signal, cleanup } = buildAbortSignal({
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
			const pinned = await resolvePinnedHostnameWithPolicy(parsedUrl.hostname, {
				lookupFn: params.lookupFn,
				policy: params.policy
			});
			if (params.pinDns !== false) dispatcher = createPinnedDispatcher(pinned);
			const init = {
				...params.init ? { ...params.init } : {},
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
				const nextUrl = new URL(location, parsedUrl).toString();
				if (visited.has(nextUrl)) {
					await release(dispatcher);
					throw new Error("Redirect loop detected");
				}
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
//#region src/media/fetch.ts
var MediaFetchError = class extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
		this.name = "MediaFetchError";
	}
};
function stripQuotes(value) {
	return value.replace(/^["']|["']$/g, "");
}
function parseContentDispositionFileName(header) {
	if (!header) return;
	const starMatch = /filename\*\s*=\s*([^;]+)/i.exec(header);
	if (starMatch?.[1]) {
		const cleaned = stripQuotes(starMatch[1].trim());
		const encoded = cleaned.split("''").slice(1).join("''") || cleaned;
		try {
			return path.basename(decodeURIComponent(encoded));
		} catch {
			return path.basename(encoded);
		}
	}
	const match = /filename\s*=\s*([^;]+)/i.exec(header);
	if (match?.[1]) return path.basename(stripQuotes(match[1].trim()));
}
async function readErrorBodySnippet(res, maxChars = 200) {
	try {
		const text = await res.text();
		if (!text) return;
		const collapsed = text.replace(/\s+/g, " ").trim();
		if (!collapsed) return;
		if (collapsed.length <= maxChars) return collapsed;
		return `${collapsed.slice(0, maxChars)}…`;
	} catch {
		return;
	}
}
async function fetchRemoteMedia(options) {
	const { url, fetchImpl, filePathHint, maxBytes, maxRedirects, ssrfPolicy, lookupFn } = options;
	let res;
	let finalUrl = url;
	let release = null;
	try {
		const result = await fetchWithSsrFGuard({
			url,
			fetchImpl,
			maxRedirects,
			policy: ssrfPolicy,
			lookupFn
		});
		res = result.response;
		finalUrl = result.finalUrl;
		release = result.release;
	} catch (err) {
		throw new MediaFetchError("fetch_failed", `Failed to fetch media from ${url}: ${String(err)}`);
	}
	try {
		if (!res.ok) {
			const statusText = res.statusText ? ` ${res.statusText}` : "";
			const redirected = finalUrl !== url ? ` (redirected to ${finalUrl})` : "";
			let detail = `HTTP ${res.status}${statusText}`;
			if (!res.body) detail = `HTTP ${res.status}${statusText}; empty response body`;
			else {
				const snippet = await readErrorBodySnippet(res);
				if (snippet) detail += `; body: ${snippet}`;
			}
			throw new MediaFetchError("http_error", `Failed to fetch media from ${url}${redirected}: ${detail}`);
		}
		const contentLength = res.headers.get("content-length");
		if (maxBytes && contentLength) {
			const length = Number(contentLength);
			if (Number.isFinite(length) && length > maxBytes) throw new MediaFetchError("max_bytes", `Failed to fetch media from ${url}: content length ${length} exceeds maxBytes ${maxBytes}`);
		}
		const buffer = maxBytes ? await readResponseWithLimit(res, maxBytes) : Buffer.from(await res.arrayBuffer());
		let fileNameFromUrl;
		try {
			const parsed = new URL(finalUrl);
			fileNameFromUrl = path.basename(parsed.pathname) || void 0;
		} catch {}
		const headerFileName = parseContentDispositionFileName(res.headers.get("content-disposition"));
		let fileName = headerFileName || fileNameFromUrl || (filePathHint ? path.basename(filePathHint) : void 0);
		const filePathForMime = headerFileName && path.extname(headerFileName) ? headerFileName : filePathHint ?? finalUrl;
		const contentType = await detectMime({
			buffer,
			headerMime: res.headers.get("content-type"),
			filePath: filePathForMime
		});
		if (fileName && !path.extname(fileName) && contentType) {
			const ext = extensionForMime(contentType);
			if (ext) fileName = `${fileName}${ext}`;
		}
		return {
			buffer,
			contentType: contentType ?? void 0,
			fileName
		};
	} finally {
		if (release) await release();
	}
}
async function readResponseWithLimit(res, maxBytes) {
	const body = res.body;
	if (!body || typeof body.getReader !== "function") {
		const fallback = Buffer.from(await res.arrayBuffer());
		if (fallback.length > maxBytes) throw new MediaFetchError("max_bytes", `Failed to fetch media from ${res.url || "response"}: payload exceeds maxBytes ${maxBytes}`);
		return fallback;
	}
	const reader = body.getReader();
	const chunks = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value?.length) {
				total += value.length;
				if (total > maxBytes) {
					try {
						await reader.cancel();
					} catch {}
					throw new MediaFetchError("max_bytes", `Failed to fetch media from ${res.url || "response"}: payload exceeds maxBytes ${maxBytes}`);
				}
				chunks.push(value);
			}
		}
	} finally {
		try {
			reader.releaseLock();
		} catch {}
	}
	return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total);
}

//#endregion
export { fetchWithTimeout as a, bindAbortRelay as i, fetchRemoteMedia as n, fetchWithSsrFGuard as r, MediaFetchError as t };