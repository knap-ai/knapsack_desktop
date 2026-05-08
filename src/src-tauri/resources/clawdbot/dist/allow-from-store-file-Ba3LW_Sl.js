import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { o as resolveRequiredHomeDir } from "./home-dir-g5LU3LmA.js";
import { _ as resolveStateDir, h as resolveOAuthDir } from "./paths-B2cMK-wd.js";
import "./account-id-DhSD7lhD.js";
import { t as readJsonFileWithFallback } from "./json-store-BEwdd3qq.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
//#region src/pairing/allow-from-store-file.ts
const allowFromReadCache = /* @__PURE__ */ new Map();
function resolvePairingCredentialsDir(env = process.env) {
	return resolveOAuthDir(env, resolveStateDir(env, () => resolveRequiredHomeDir(env, os.homedir)));
}
/** Sanitize channel ID for use in filenames (prevent path traversal). */
function safeChannelKey(channel) {
	const raw = normalizeLowercaseStringOrEmpty(String(channel));
	if (!raw) throw new Error("invalid pairing channel");
	const safe = raw.replace(/[\\/:*?"<>|]/g, "_").replace(/\.\./g, "_");
	if (!safe || safe === "_") throw new Error("invalid pairing channel");
	return safe;
}
function safeAccountKey(accountId) {
	const raw = normalizeLowercaseStringOrEmpty(accountId);
	if (!raw) throw new Error("invalid pairing account id");
	const safe = raw.replace(/[\\/:*?"<>|]/g, "_").replace(/\.\./g, "_");
	if (!safe || safe === "_") throw new Error("invalid pairing account id");
	return safe;
}
function resolveAllowFromFilePath(channel, env = process.env, accountId) {
	const base = safeChannelKey(channel);
	const normalizedAccountId = normalizeOptionalString(accountId) ?? "";
	if (!normalizedAccountId) return path.join(resolvePairingCredentialsDir(env), `${base}-allowFrom.json`);
	return path.join(resolvePairingCredentialsDir(env), `${base}-${safeAccountKey(normalizedAccountId)}-allowFrom.json`);
}
function dedupePreserveOrder(entries) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const entry of entries) {
		const normalized = normalizeOptionalString(entry) ?? "";
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		out.push(normalized);
	}
	return out;
}
function shouldIncludeLegacyAllowFromEntries(normalizedAccountId) {
	return !normalizedAccountId || normalizedAccountId === "default";
}
function resolveAllowFromAccountId(accountId) {
	return normalizeLowercaseStringOrEmpty(accountId) || "default";
}
function cloneAllowFromCacheEntry(entry) {
	return {
		exists: entry.exists,
		mtimeMs: entry.mtimeMs,
		size: entry.size,
		entries: entry.entries.slice()
	};
}
function resolveAllowFromCacheKey(cacheNamespace, filePath) {
	return `${cacheNamespace}\u0000${filePath}`;
}
function setAllowFromFileReadCache(params) {
	allowFromReadCache.set(resolveAllowFromCacheKey(params.cacheNamespace, params.filePath), cloneAllowFromCacheEntry(params.entry));
}
function resolveAllowFromReadCacheHit(params) {
	const cached = allowFromReadCache.get(resolveAllowFromCacheKey(params.cacheNamespace, params.filePath));
	if (!cached) return null;
	if (cached.exists !== params.exists) return null;
	if (!params.exists) return cloneAllowFromCacheEntry(cached);
	if (cached.mtimeMs !== params.mtimeMs || cached.size !== params.size) return null;
	return cloneAllowFromCacheEntry(cached);
}
function resolveAllowFromReadCacheOrMissing(params) {
	const cached = resolveAllowFromReadCacheHit({
		cacheNamespace: params.cacheNamespace,
		filePath: params.filePath,
		exists: Boolean(params.stat),
		mtimeMs: params.stat?.mtimeMs ?? null,
		size: params.stat?.size ?? null
	});
	if (cached) return {
		entries: cached.entries,
		exists: cached.exists
	};
	if (!params.stat) {
		setAllowFromFileReadCache({
			cacheNamespace: params.cacheNamespace,
			filePath: params.filePath,
			entry: {
				exists: false,
				mtimeMs: null,
				size: null,
				entries: []
			}
		});
		return {
			entries: [],
			exists: false
		};
	}
	return null;
}
async function readAllowFromFileWithExists(params) {
	let stat = null;
	try {
		stat = await fs.promises.stat(params.filePath);
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
	}
	const cachedOrMissing = resolveAllowFromReadCacheOrMissing({
		cacheNamespace: params.cacheNamespace,
		filePath: params.filePath,
		stat
	});
	if (cachedOrMissing) return cachedOrMissing;
	if (!stat) return {
		entries: [],
		exists: false
	};
	const { value, exists } = await readJsonFileWithFallback(params.filePath, {
		version: 1,
		allowFrom: []
	});
	const entries = params.normalizeStore(value);
	setAllowFromFileReadCache({
		cacheNamespace: params.cacheNamespace,
		filePath: params.filePath,
		entry: {
			exists,
			mtimeMs: stat.mtimeMs,
			size: stat.size,
			entries
		}
	});
	return {
		entries,
		exists
	};
}
function readAllowFromFileSyncWithExists(params) {
	let stat = null;
	try {
		stat = fs.statSync(params.filePath);
	} catch (err) {
		if (err.code !== "ENOENT") return {
			entries: [],
			exists: false
		};
	}
	const cachedOrMissing = resolveAllowFromReadCacheOrMissing({
		cacheNamespace: params.cacheNamespace,
		filePath: params.filePath,
		stat
	});
	if (cachedOrMissing) return cachedOrMissing;
	if (!stat) return {
		entries: [],
		exists: false
	};
	let raw = "";
	try {
		raw = fs.readFileSync(params.filePath, "utf8");
	} catch (err) {
		if (err.code === "ENOENT") return {
			entries: [],
			exists: false
		};
		return {
			entries: [],
			exists: false
		};
	}
	try {
		const parsed = JSON.parse(raw);
		const entries = params.normalizeStore(parsed);
		setAllowFromFileReadCache({
			cacheNamespace: params.cacheNamespace,
			filePath: params.filePath,
			entry: {
				exists: true,
				mtimeMs: stat.mtimeMs,
				size: stat.size,
				entries
			}
		});
		return {
			entries,
			exists: true
		};
	} catch {
		setAllowFromFileReadCache({
			cacheNamespace: params.cacheNamespace,
			filePath: params.filePath,
			entry: {
				exists: true,
				mtimeMs: stat.mtimeMs,
				size: stat.size,
				entries: []
			}
		});
		return {
			entries: [],
			exists: true
		};
	}
}
function clearAllowFromFileReadCacheForNamespace(cacheNamespace) {
	for (const key of allowFromReadCache.keys()) if (key.startsWith(`${cacheNamespace}\u0000`)) allowFromReadCache.delete(key);
}
//#endregion
export { resolveAllowFromAccountId as a, safeChannelKey as c, readAllowFromFileWithExists as i, setAllowFromFileReadCache as l, dedupePreserveOrder as n, resolveAllowFromFilePath as o, readAllowFromFileSyncWithExists as r, resolvePairingCredentialsDir as s, clearAllowFromFileReadCacheForNamespace as t, shouldIncludeLegacyAllowFromEntries as u };
