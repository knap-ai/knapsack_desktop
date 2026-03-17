import { Gn as readJsonFileWithFallback, In as createDedupeCache, Kn as writeJsonFileAtomically, Os as withFileLock } from "./thread-bindings-SYAnWHuW.js";
//#region src/plugin-sdk/persistent-dedupe.ts
const DEFAULT_LOCK_OPTIONS = {
	retries: {
		retries: 6,
		factor: 1.35,
		minTimeout: 8,
		maxTimeout: 180,
		randomize: true
	},
	stale: 6e4
};
function mergeLockOptions(overrides) {
	return {
		stale: overrides?.stale ?? DEFAULT_LOCK_OPTIONS.stale,
		retries: {
			retries: overrides?.retries?.retries ?? DEFAULT_LOCK_OPTIONS.retries.retries,
			factor: overrides?.retries?.factor ?? DEFAULT_LOCK_OPTIONS.retries.factor,
			minTimeout: overrides?.retries?.minTimeout ?? DEFAULT_LOCK_OPTIONS.retries.minTimeout,
			maxTimeout: overrides?.retries?.maxTimeout ?? DEFAULT_LOCK_OPTIONS.retries.maxTimeout,
			randomize: overrides?.retries?.randomize ?? DEFAULT_LOCK_OPTIONS.retries.randomize
		}
	};
}
function sanitizeData(value) {
	if (!value || typeof value !== "object") return {};
	const out = {};
	for (const [key, ts] of Object.entries(value)) if (typeof ts === "number" && Number.isFinite(ts) && ts > 0) out[key] = ts;
	return out;
}
function pruneData(data, now, ttlMs, maxEntries) {
	if (ttlMs > 0) {
		for (const [key, ts] of Object.entries(data)) if (now - ts >= ttlMs) delete data[key];
	}
	const keys = Object.keys(data);
	if (keys.length <= maxEntries) return;
	keys.toSorted((a, b) => data[a] - data[b]).slice(0, keys.length - maxEntries).forEach((key) => {
		delete data[key];
	});
}
function createPersistentDedupe(options) {
	const ttlMs = Math.max(0, Math.floor(options.ttlMs));
	const memoryMaxSize = Math.max(0, Math.floor(options.memoryMaxSize));
	const fileMaxEntries = Math.max(1, Math.floor(options.fileMaxEntries));
	const lockOptions = mergeLockOptions(options.lockOptions);
	const memory = createDedupeCache({
		ttlMs,
		maxSize: memoryMaxSize
	});
	const inflight = /* @__PURE__ */ new Map();
	async function checkAndRecordInner(key, namespace, scopedKey, now, onDiskError) {
		if (memory.check(scopedKey, now)) return false;
		const path = options.resolveFilePath(namespace);
		try {
			return !await withFileLock(path, lockOptions, async () => {
				const { value } = await readJsonFileWithFallback(path, {});
				const data = sanitizeData(value);
				const seenAt = data[key];
				if (seenAt != null && (ttlMs <= 0 || now - seenAt < ttlMs)) return true;
				data[key] = now;
				pruneData(data, now, ttlMs, fileMaxEntries);
				await writeJsonFileAtomically(path, data);
				return false;
			});
		} catch (error) {
			onDiskError?.(error);
			memory.check(scopedKey, now);
			return true;
		}
	}
	async function warmup(namespace = "global", onError) {
		const filePath = options.resolveFilePath(namespace);
		const now = Date.now();
		try {
			const { value } = await readJsonFileWithFallback(filePath, {});
			const data = sanitizeData(value);
			let loaded = 0;
			for (const [key, ts] of Object.entries(data)) {
				if (ttlMs > 0 && now - ts >= ttlMs) continue;
				const scopedKey = `${namespace}:${key}`;
				memory.check(scopedKey, ts);
				loaded++;
			}
			return loaded;
		} catch (error) {
			onError?.(error);
			return 0;
		}
	}
	async function checkAndRecord(key, dedupeOptions) {
		const trimmed = key.trim();
		if (!trimmed) return true;
		const namespace = dedupeOptions?.namespace?.trim() || "global";
		const scopedKey = `${namespace}:${trimmed}`;
		if (inflight.has(scopedKey)) return false;
		const onDiskError = dedupeOptions?.onDiskError ?? options.onDiskError;
		const work = checkAndRecordInner(trimmed, namespace, scopedKey, dedupeOptions?.now ?? Date.now(), onDiskError);
		inflight.set(scopedKey, work);
		try {
			return await work;
		} finally {
			inflight.delete(scopedKey);
		}
	}
	return {
		checkAndRecord,
		warmup,
		clearMemory: () => memory.clear(),
		memorySize: () => memory.size()
	};
}
//#endregion
export { createPersistentDedupe as t };
