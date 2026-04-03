import { n as redactSensitiveText } from "./redact-BDinS1q9.js";
import { r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { n as extensionForMime, t as detectMime } from "./mime-C9472kP8.js";
import { i as withStrictGuardedFetchMode, n as fetchWithSsrFGuard } from "./fetch-guard-Lvq2pw52.js";
import path from "node:path";
//#region src/media/read-response-with-limit.ts
async function readChunkWithIdleTimeout(reader, chunkTimeoutMs, onIdleTimeout) {
	let timeoutId;
	let timedOut = false;
	return await new Promise((resolve, reject) => {
		const clear = () => {
			if (timeoutId !== void 0) {
				clearTimeout(timeoutId);
				timeoutId = void 0;
			}
		};
		timeoutId = setTimeout(() => {
			timedOut = true;
			clear();
			reader.cancel().catch(() => void 0);
			reject(onIdleTimeout?.({ chunkTimeoutMs }) ?? /* @__PURE__ */ new Error(`Media download stalled: no data received for ${chunkTimeoutMs}ms`));
		}, chunkTimeoutMs);
		reader.read().then((result) => {
			clear();
			if (!timedOut) resolve(result);
		}, (err) => {
			clear();
			if (!timedOut) reject(err);
		});
	});
}
async function readResponsePrefix(res, maxBytes, opts) {
	const chunkTimeoutMs = opts?.chunkTimeoutMs;
	const body = res.body;
	if (!body || typeof body.getReader !== "function") {
		const fallback = Buffer.from(await res.arrayBuffer());
		if (fallback.length > maxBytes) return {
			buffer: fallback.subarray(0, maxBytes),
			size: fallback.length,
			truncated: true
		};
		return {
			buffer: fallback,
			size: fallback.length,
			truncated: false
		};
	}
	const reader = body.getReader();
	const chunks = [];
	let total = 0;
	let size = 0;
	let truncated = false;
	try {
		while (true) {
			const { done, value } = chunkTimeoutMs ? await readChunkWithIdleTimeout(reader, chunkTimeoutMs, opts?.onIdleTimeout) : await reader.read();
			if (done) {
				size = total;
				break;
			}
			if (!value?.length) continue;
			const nextTotal = total + value.length;
			if (nextTotal > maxBytes) {
				const remaining = maxBytes - total;
				if (remaining > 0) {
					chunks.push(value.subarray(0, remaining));
					total += remaining;
				}
				size = nextTotal;
				truncated = true;
				try {
					await reader.cancel();
				} catch {}
				break;
			}
			chunks.push(value);
			total = nextTotal;
			size = total;
		}
	} finally {
		try {
			reader.releaseLock();
		} catch {}
	}
	return {
		buffer: Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total),
		size,
		truncated
	};
}
async function readResponseWithLimit(res, maxBytes, opts) {
	const onOverflow = opts?.onOverflow ?? ((params) => /* @__PURE__ */ new Error(`Content too large: ${params.size} bytes (limit: ${params.maxBytes} bytes)`));
	const prefix = await readResponsePrefix(res, maxBytes, {
		chunkTimeoutMs: opts?.chunkTimeoutMs,
		onIdleTimeout: opts?.onIdleTimeout
	});
	if (prefix.truncated) throw onOverflow({
		size: prefix.size,
		maxBytes,
		res
	});
	return prefix.buffer;
}
async function readResponseTextSnippet(res, opts) {
	const maxBytes = opts?.maxBytes ?? 8 * 1024;
	const maxChars = opts?.maxChars ?? 200;
	const prefix = await readResponsePrefix(res, maxBytes, {
		chunkTimeoutMs: opts?.chunkTimeoutMs,
		onIdleTimeout: opts?.onIdleTimeout
	});
	if (prefix.buffer.length === 0) return;
	const text = new TextDecoder().decode(prefix.buffer);
	if (!text) return;
	const collapsed = text.replace(/\s+/g, " ").trim();
	if (!collapsed) return;
	if (collapsed.length > maxChars) return `${collapsed.slice(0, maxChars)}…`;
	return prefix.truncated ? `${collapsed}…` : collapsed;
}
//#endregion
//#region src/media/fetch.ts
var MediaFetchError = class extends Error {
	constructor(code, message, options) {
		super(message, options);
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
async function readErrorBodySnippet(res, opts) {
	try {
		return await readResponseTextSnippet(res, {
			maxBytes: 8 * 1024,
			maxChars: opts?.maxChars,
			chunkTimeoutMs: opts?.chunkTimeoutMs
		});
	} catch {
		return;
	}
}
function redactMediaUrl(url) {
	return redactSensitiveText(url);
}
async function fetchRemoteMedia(options) {
	const { url, fetchImpl, requestInit, filePathHint, maxBytes, maxRedirects, readIdleTimeoutMs, ssrfPolicy, lookupFn, dispatcherAttempts, shouldRetryFetchError } = options;
	const sourceUrl = redactMediaUrl(url);
	let res;
	let finalUrl = url;
	let release = null;
	const attempts = dispatcherAttempts && dispatcherAttempts.length > 0 ? dispatcherAttempts : [{
		dispatcherPolicy: void 0,
		lookupFn
	}];
	const runGuardedFetch = async (attempt) => await fetchWithSsrFGuard(withStrictGuardedFetchMode({
		url,
		fetchImpl,
		init: requestInit,
		maxRedirects,
		policy: ssrfPolicy,
		lookupFn: attempt.lookupFn ?? lookupFn,
		dispatcherPolicy: attempt.dispatcherPolicy
	}));
	try {
		let result;
		const attemptErrors = [];
		for (let i = 0; i < attempts.length; i += 1) try {
			result = await runGuardedFetch(attempts[i]);
			break;
		} catch (err) {
			if (typeof shouldRetryFetchError !== "function" || !shouldRetryFetchError(err) || i === attempts.length - 1) {
				if (attemptErrors.length > 0) {
					const combined = new Error(`Primary fetch failed and fallback fetch also failed for ${sourceUrl}`, { cause: err });
					combined.primaryError = attemptErrors[0];
					combined.attemptErrors = [...attemptErrors, err];
					throw combined;
				}
				throw err;
			}
			attemptErrors.push(err);
		}
		res = result.response;
		finalUrl = result.finalUrl;
		release = result.release;
	} catch (err) {
		throw new MediaFetchError("fetch_failed", `Failed to fetch media from ${sourceUrl}: ${formatErrorMessage(err)}`, { cause: err });
	}
	try {
		if (!res.ok) {
			const statusText = res.statusText ? ` ${res.statusText}` : "";
			const redirected = finalUrl !== url ? ` (redirected to ${redactMediaUrl(finalUrl)})` : "";
			let detail = `HTTP ${res.status}${statusText}`;
			if (!res.body) detail = `HTTP ${res.status}${statusText}; empty response body`;
			else {
				const snippet = await readErrorBodySnippet(res, { chunkTimeoutMs: readIdleTimeoutMs });
				if (snippet) detail += `; body: ${snippet}`;
			}
			throw new MediaFetchError("http_error", `Failed to fetch media from ${sourceUrl}${redirected}: ${redactSensitiveText(detail)}`);
		}
		const contentLength = res.headers.get("content-length");
		if (maxBytes && contentLength) {
			const length = Number(contentLength);
			if (Number.isFinite(length) && length > maxBytes) throw new MediaFetchError("max_bytes", `Failed to fetch media from ${sourceUrl}: content length ${length} exceeds maxBytes ${maxBytes}`);
		}
		let buffer;
		try {
			buffer = maxBytes ? await readResponseWithLimit(res, maxBytes, {
				onOverflow: ({ maxBytes, res }) => new MediaFetchError("max_bytes", `Failed to fetch media from ${redactMediaUrl(res.url || url)}: payload exceeds maxBytes ${maxBytes}`),
				chunkTimeoutMs: readIdleTimeoutMs
			}) : Buffer.from(await res.arrayBuffer());
		} catch (err) {
			if (err instanceof MediaFetchError) throw err;
			throw new MediaFetchError("fetch_failed", `Failed to fetch media from ${redactMediaUrl(res.url || url)}: ${formatErrorMessage(err)}`, { cause: err });
		}
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
//#endregion
export { readResponseWithLimit as i, fetchRemoteMedia as n, readResponseTextSnippet as r, MediaFetchError as t };
