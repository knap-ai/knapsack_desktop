import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
//#region src/agents/tools/web-shared.ts
const DEFAULT_TIMEOUT_SECONDS = 30;
const DEFAULT_CACHE_TTL_MINUTES = 15;
const DEFAULT_CACHE_MAX_ENTRIES = 100;
function resolveTimeoutSeconds(value, fallback) {
	return Math.max(1, Math.floor(typeof value === "number" && Number.isFinite(value) ? value : fallback));
}
function resolveCacheTtlMs(value, fallbackMinutes) {
	return Math.round((typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallbackMinutes) * 6e4);
}
function normalizeCacheKey(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function readCache(cache, key) {
	const entry = cache.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return null;
	}
	return {
		value: entry.value,
		cached: true
	};
}
function writeCache(cache, key, value, ttlMs) {
	if (ttlMs <= 0) return;
	if (cache.size >= DEFAULT_CACHE_MAX_ENTRIES) {
		const oldest = cache.keys().next();
		if (!oldest.done) cache.delete(oldest.value);
	}
	cache.set(key, {
		value,
		expiresAt: Date.now() + ttlMs,
		insertedAt: Date.now()
	});
}
function withTimeout(signal, timeoutMs) {
	if (timeoutMs <= 0) return signal ?? new AbortController().signal;
	const controller = new AbortController();
	const timer = setTimeout(controller.abort.bind(controller), timeoutMs);
	if (signal) signal.addEventListener("abort", () => {
		clearTimeout(timer);
		controller.abort();
	}, { once: true });
	controller.signal.addEventListener("abort", () => {
		clearTimeout(timer);
	}, { once: true });
	return controller.signal;
}
async function readResponseText(res, options) {
	const maxBytesRaw = options?.maxBytes;
	const maxBytes = typeof maxBytesRaw === "number" && Number.isFinite(maxBytesRaw) && maxBytesRaw > 0 ? Math.floor(maxBytesRaw) : void 0;
	const body = res.body;
	if (maxBytes && body && typeof body === "object" && "getReader" in body && typeof body.getReader === "function") {
		const reader = body.getReader();
		const decoder = new TextDecoder();
		let bytesRead = 0;
		let truncated = false;
		const parts = [];
		try {
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				if (!value || value.byteLength === 0) continue;
				let chunk = value;
				if (bytesRead + chunk.byteLength > maxBytes) {
					const remaining = Math.max(0, maxBytes - bytesRead);
					if (remaining <= 0) {
						truncated = true;
						break;
					}
					chunk = chunk.subarray(0, remaining);
					truncated = true;
				}
				bytesRead += chunk.byteLength;
				parts.push(decoder.decode(chunk, { stream: true }));
				if (truncated || bytesRead >= maxBytes) {
					truncated = true;
					break;
				}
			}
		} catch {} finally {
			if (truncated) reader.cancel().catch(() => void 0);
		}
		parts.push(decoder.decode());
		return {
			text: parts.join(""),
			truncated,
			bytesRead
		};
	}
	try {
		const text = await res.text();
		return {
			text,
			truncated: false,
			bytesRead: text.length
		};
	} catch {
		return {
			text: "",
			truncated: false,
			bytesRead: 0
		};
	}
}
//#endregion
export { readResponseText as a, withTimeout as c, readCache as i, writeCache as l, DEFAULT_TIMEOUT_SECONDS as n, resolveCacheTtlMs as o, normalizeCacheKey as r, resolveTimeoutSeconds as s, DEFAULT_CACHE_TTL_MINUTES as t };
