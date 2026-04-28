import { d as normalizeStringifiedOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import { r as parseByteSize } from "./zod-schema-DjRHIl0Z.js";
import { t as parseDurationMs } from "./parse-duration-D7zSmneY.js";
import "./config--k_1dtUP.js";
import { a as normalizeSessionDeliveryFields } from "./delivery-context.shared-Bmv0a_G3.js";
import { a as readSessionStoreCache, i as isSessionStoreCacheEnabled, l as getFileStatSnapshot, o as setSerializedSessionStore, s as writeSessionStoreCache } from "./store-cache-aeFgCAch.js";
import { a as normalizeSessionRuntimeModelFields } from "./types-UHw-opRq.js";
import fs from "node:fs";
import path from "node:path";
//#region src/config/sessions/store-maintenance.ts
const log$1 = createSubsystemLogger("sessions/store");
const DEFAULT_SESSION_PRUNE_AFTER_MS = 720 * 60 * 60 * 1e3;
const DEFAULT_SESSION_MAX_ENTRIES = 500;
const DEFAULT_SESSION_ROTATE_BYTES = 10485760;
const DEFAULT_SESSION_MAINTENANCE_MODE = "enforce";
const DEFAULT_SESSION_DISK_BUDGET_HIGH_WATER_RATIO = .8;
const STRICT_ENTRY_MAINTENANCE_MAX_ENTRIES = 49;
const MIN_BATCHED_ENTRY_MAINTENANCE_SLACK = 25;
const BATCHED_ENTRY_MAINTENANCE_SLACK_RATIO = .1;
function resolvePruneAfterMs(maintenance) {
	const normalized = normalizeStringifiedOptionalString(maintenance?.pruneAfter ?? maintenance?.pruneDays);
	if (!normalized) return DEFAULT_SESSION_PRUNE_AFTER_MS;
	try {
		return parseDurationMs(normalized, { defaultUnit: "d" });
	} catch {
		return DEFAULT_SESSION_PRUNE_AFTER_MS;
	}
}
function resolveRotateBytes(maintenance) {
	const raw = maintenance?.rotateBytes;
	const normalized = normalizeStringifiedOptionalString(raw);
	if (!normalized) return DEFAULT_SESSION_ROTATE_BYTES;
	try {
		return parseByteSize(normalized, { defaultUnit: "b" });
	} catch {
		return DEFAULT_SESSION_ROTATE_BYTES;
	}
}
function resolveResetArchiveRetentionMs(maintenance, pruneAfterMs) {
	const raw = maintenance?.resetArchiveRetention;
	if (raw === false) return null;
	const normalized = normalizeStringifiedOptionalString(raw);
	if (!normalized) return pruneAfterMs;
	try {
		return parseDurationMs(normalized, { defaultUnit: "d" });
	} catch {
		return pruneAfterMs;
	}
}
function resolveMaxDiskBytes(maintenance) {
	const raw = maintenance?.maxDiskBytes;
	const normalized = normalizeStringifiedOptionalString(raw);
	if (!normalized) return null;
	try {
		return parseByteSize(normalized, { defaultUnit: "b" });
	} catch {
		return null;
	}
}
function resolveHighWaterBytes(maintenance, maxDiskBytes) {
	const computeDefault = () => {
		if (maxDiskBytes == null) return null;
		if (maxDiskBytes <= 0) return 0;
		return Math.max(1, Math.min(maxDiskBytes, Math.floor(maxDiskBytes * DEFAULT_SESSION_DISK_BUDGET_HIGH_WATER_RATIO)));
	};
	if (maxDiskBytes == null) return null;
	const raw = maintenance?.highWaterBytes;
	const normalized = normalizeStringifiedOptionalString(raw);
	if (!normalized) return computeDefault();
	try {
		const parsed = parseByteSize(normalized, { defaultUnit: "b" });
		return Math.min(parsed, maxDiskBytes);
	} catch {
		return computeDefault();
	}
}
/**
* Resolve maintenance settings from openclaw.json (`session.maintenance`).
* Falls back to built-in defaults when config is missing or unset.
*/
function resolveMaintenanceConfigFromInput(maintenance) {
	const pruneAfterMs = resolvePruneAfterMs(maintenance);
	const maxDiskBytes = resolveMaxDiskBytes(maintenance);
	return {
		mode: maintenance?.mode ?? DEFAULT_SESSION_MAINTENANCE_MODE,
		pruneAfterMs,
		maxEntries: maintenance?.maxEntries ?? DEFAULT_SESSION_MAX_ENTRIES,
		rotateBytes: resolveRotateBytes(maintenance),
		resetArchiveRetentionMs: resolveResetArchiveRetentionMs(maintenance, pruneAfterMs),
		maxDiskBytes,
		highWaterBytes: resolveHighWaterBytes(maintenance, maxDiskBytes)
	};
}
function resolveSessionEntryMaintenanceHighWater(maxEntries) {
	if (!Number.isSafeInteger(maxEntries) || maxEntries <= 0) return 1;
	if (maxEntries <= STRICT_ENTRY_MAINTENANCE_MAX_ENTRIES) return maxEntries + 1;
	return maxEntries + Math.max(MIN_BATCHED_ENTRY_MAINTENANCE_SLACK, Math.ceil(maxEntries * BATCHED_ENTRY_MAINTENANCE_SLACK_RATIO));
}
function shouldRunSessionEntryMaintenance(params) {
	if (params.force) return true;
	return params.entryCount >= resolveSessionEntryMaintenanceHighWater(params.maxEntries);
}
/**
* Remove entries whose `updatedAt` is older than the configured threshold.
* Entries without `updatedAt` are kept (cannot determine staleness).
* Mutates `store` in-place.
*/
function pruneStaleEntries(store, overrideMaxAgeMs, opts = {}) {
	const maxAgeMs = overrideMaxAgeMs ?? resolveMaintenanceConfigFromInput().pruneAfterMs;
	const cutoffMs = Date.now() - maxAgeMs;
	let pruned = 0;
	for (const [key, entry] of Object.entries(store)) {
		if (opts.preserveKeys?.has(key)) continue;
		if (entry?.updatedAt != null && entry.updatedAt < cutoffMs) {
			opts.onPruned?.({
				key,
				entry
			});
			delete store[key];
			pruned++;
		}
	}
	if (pruned > 0 && opts.log !== false) log$1.info("pruned stale session entries", {
		pruned,
		maxAgeMs
	});
	return pruned;
}
function getEntryUpdatedAt(entry) {
	return entry?.updatedAt ?? Number.NEGATIVE_INFINITY;
}
function getActiveSessionMaintenanceWarning(params) {
	const activeSessionKey = params.activeSessionKey.trim();
	if (!activeSessionKey) return null;
	const activeEntry = params.store[activeSessionKey];
	if (!activeEntry) return null;
	const cutoffMs = (params.nowMs ?? Date.now()) - params.pruneAfterMs;
	const wouldPrune = activeEntry.updatedAt != null ? activeEntry.updatedAt < cutoffMs : false;
	const keys = Object.keys(params.store);
	const wouldCap = wouldCapActiveSession({
		store: params.store,
		keys,
		activeEntry,
		activeSessionKey,
		maxEntries: params.maxEntries
	});
	if (!wouldPrune && !wouldCap) return null;
	return {
		activeSessionKey,
		activeUpdatedAt: activeEntry.updatedAt,
		totalEntries: keys.length,
		pruneAfterMs: params.pruneAfterMs,
		maxEntries: params.maxEntries,
		wouldPrune,
		wouldCap
	};
}
function wouldCapActiveSession(params) {
	if (params.keys.length <= params.maxEntries) return false;
	if (params.maxEntries <= 0) return true;
	const activeUpdatedAt = getEntryUpdatedAt(params.activeEntry);
	let newerOrTieBeforeActive = 0;
	let seenActive = false;
	for (const key of params.keys) {
		if (key === params.activeSessionKey) {
			seenActive = true;
			continue;
		}
		const entryUpdatedAt = getEntryUpdatedAt(params.store[key]);
		if (entryUpdatedAt > activeUpdatedAt || !seenActive && entryUpdatedAt === activeUpdatedAt) {
			newerOrTieBeforeActive++;
			if (newerOrTieBeforeActive >= params.maxEntries) return true;
		}
	}
	return false;
}
/**
* Cap the store to the N most recently updated entries.
* Entries without `updatedAt` are sorted last (removed first when over limit).
* Mutates `store` in-place.
*/
function capEntryCount(store, overrideMax, opts = {}) {
	const maxEntries = overrideMax ?? resolveMaintenanceConfigFromInput().maxEntries;
	const preservedCount = opts.preserveKeys ? Object.keys(store).filter((key) => opts.preserveKeys?.has(key)).length : 0;
	const maxRemovableEntries = Math.max(0, maxEntries - preservedCount);
	const keys = Object.keys(store).filter((key) => !opts.preserveKeys?.has(key));
	if (keys.length <= maxRemovableEntries) return 0;
	const toRemove = keys.toSorted((a, b) => {
		const aTime = getEntryUpdatedAt(store[a]);
		return getEntryUpdatedAt(store[b]) - aTime;
	}).slice(maxRemovableEntries);
	for (const key of toRemove) {
		const entry = store[key];
		if (entry) opts.onCapped?.({
			key,
			entry
		});
		delete store[key];
	}
	if (opts.log !== false) log$1.info("capped session entry count", {
		removed: toRemove.length,
		maxEntries
	});
	return toRemove.length;
}
async function getSessionFileSize(storePath) {
	try {
		return (await fs.promises.stat(storePath)).size;
	} catch {
		return null;
	}
}
/**
* Rotate the sessions file if it exceeds the configured size threshold.
* Copies the current file to `sessions.json.bak.{timestamp}` and cleans up
* old rotation backups, keeping only the 3 most recent `.bak.*` files.
*/
async function rotateSessionFile(storePath, overrideBytes) {
	const maxBytes = overrideBytes ?? resolveMaintenanceConfigFromInput().rotateBytes;
	const fileSize = await getSessionFileSize(storePath);
	if (fileSize == null) return false;
	if (fileSize <= maxBytes) return false;
	const backupPath = `${storePath}.bak.${Date.now()}`;
	try {
		await fs.promises.copyFile(storePath, backupPath);
		log$1.info("backed up session store file before rotation", {
			backupPath: path.basename(backupPath),
			sizeBytes: fileSize
		});
	} catch (err) {
		log$1.warn("session store rotation backup failed", { err });
		return false;
	}
	try {
		const dir = path.dirname(storePath);
		const baseName = path.basename(storePath);
		const backups = (await fs.promises.readdir(dir)).filter((f) => f.startsWith(`${baseName}.bak.`)).toSorted().toReversed();
		const maxBackups = 3;
		if (backups.length > maxBackups) {
			const toDelete = backups.slice(maxBackups);
			for (const old of toDelete) await fs.promises.unlink(path.join(dir, old)).catch(() => void 0);
			log$1.info("cleaned up old session store backups", { deleted: toDelete.length });
		}
	} catch {}
	return true;
}
//#endregion
//#region src/config/sessions/store-maintenance-runtime.ts
function resolveMaintenanceConfig() {
	let maintenance;
	try {
		maintenance = getRuntimeConfig().session?.maintenance;
	} catch {}
	return resolveMaintenanceConfigFromInput(maintenance);
}
//#endregion
//#region src/config/sessions/store-migrations.ts
function applySessionStoreMigrations(store) {
	for (const entry of Object.values(store)) {
		if (!entry || typeof entry !== "object") continue;
		const rec = entry;
		if (typeof rec.channel !== "string" && typeof rec.provider === "string") {
			rec.channel = rec.provider;
			delete rec.provider;
		}
		if (typeof rec.lastChannel !== "string" && typeof rec.lastProvider === "string") {
			rec.lastChannel = rec.lastProvider;
			delete rec.lastProvider;
		}
		if (typeof rec.groupChannel !== "string" && typeof rec.room === "string") {
			rec.groupChannel = rec.room;
			delete rec.room;
		} else if ("room" in rec) delete rec.room;
	}
}
//#endregion
//#region src/config/sessions/store-load.ts
const log = createSubsystemLogger("sessions/store");
function isSessionStoreRecord(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeSessionEntryDelivery(entry) {
	const normalized = normalizeSessionDeliveryFields({
		channel: entry.channel,
		lastChannel: entry.lastChannel,
		lastTo: entry.lastTo,
		lastAccountId: entry.lastAccountId,
		lastThreadId: entry.lastThreadId ?? entry.deliveryContext?.threadId ?? entry.origin?.threadId,
		deliveryContext: entry.deliveryContext
	});
	const nextDelivery = normalized.deliveryContext;
	const sameDelivery = (entry.deliveryContext?.channel ?? void 0) === nextDelivery?.channel && (entry.deliveryContext?.to ?? void 0) === nextDelivery?.to && (entry.deliveryContext?.accountId ?? void 0) === nextDelivery?.accountId && (entry.deliveryContext?.threadId ?? void 0) === nextDelivery?.threadId;
	const sameLast = entry.lastChannel === normalized.lastChannel && entry.lastTo === normalized.lastTo && entry.lastAccountId === normalized.lastAccountId && entry.lastThreadId === normalized.lastThreadId;
	if (sameDelivery && sameLast) return entry;
	return {
		...entry,
		deliveryContext: nextDelivery,
		lastChannel: normalized.lastChannel,
		lastTo: normalized.lastTo,
		lastAccountId: normalized.lastAccountId,
		lastThreadId: normalized.lastThreadId
	};
}
function normalizeSessionStore(store) {
	for (const [key, entry] of Object.entries(store)) {
		if (!entry) continue;
		const normalized = normalizeSessionEntryDelivery(normalizeSessionRuntimeModelFields(entry));
		if (normalized !== entry) store[key] = normalized;
	}
}
function loadSessionStore(storePath, opts = {}) {
	if (!opts.skipCache && isSessionStoreCacheEnabled()) {
		const currentFileStat = getFileStatSnapshot(storePath);
		const cached = readSessionStoreCache({
			storePath,
			mtimeMs: currentFileStat?.mtimeMs,
			sizeBytes: currentFileStat?.sizeBytes
		});
		if (cached) return cached;
	}
	let store = {};
	let fileStat = getFileStatSnapshot(storePath);
	let mtimeMs = fileStat?.mtimeMs;
	let serializedFromDisk;
	const maxReadAttempts = process.platform === "win32" ? 3 : 1;
	const retryBuf = maxReadAttempts > 1 ? new Int32Array(new SharedArrayBuffer(4)) : void 0;
	for (let attempt = 0; attempt < maxReadAttempts; attempt += 1) try {
		const raw = fs.readFileSync(storePath, "utf-8");
		if (raw.length === 0 && attempt < maxReadAttempts - 1) {
			Atomics.wait(retryBuf, 0, 0, 50);
			continue;
		}
		const parsed = JSON.parse(raw);
		if (isSessionStoreRecord(parsed)) {
			store = parsed;
			serializedFromDisk = raw;
		}
		fileStat = getFileStatSnapshot(storePath) ?? fileStat;
		mtimeMs = fileStat?.mtimeMs;
		break;
	} catch {
		if (attempt < maxReadAttempts - 1) {
			Atomics.wait(retryBuf, 0, 0, 50);
			continue;
		}
	}
	if (serializedFromDisk !== void 0) setSerializedSessionStore(storePath, serializedFromDisk);
	else setSerializedSessionStore(storePath, void 0);
	applySessionStoreMigrations(store);
	normalizeSessionStore(store);
	const maintenance = opts.maintenanceConfig ?? resolveMaintenanceConfig();
	const beforeCount = Object.keys(store).length;
	if (maintenance.mode === "enforce" && beforeCount > maintenance.maxEntries) {
		const pruned = pruneStaleEntries(store, maintenance.pruneAfterMs, { log: false });
		const countAfterPrune = Object.keys(store).length;
		const capped = shouldRunSessionEntryMaintenance({
			entryCount: countAfterPrune,
			maxEntries: maintenance.maxEntries
		}) ? capEntryCount(store, maintenance.maxEntries, { log: false }) : 0;
		const afterCount = Object.keys(store).length;
		if (pruned > 0 || capped > 0) {
			serializedFromDisk = void 0;
			setSerializedSessionStore(storePath, void 0);
			log.info("applied load-time maintenance to oversized session store", {
				storePath,
				before: beforeCount,
				after: afterCount,
				pruned,
				capped,
				maxEntries: maintenance.maxEntries
			});
		}
	}
	if (!opts.skipCache && isSessionStoreCacheEnabled()) writeSessionStoreCache({
		storePath,
		store,
		mtimeMs,
		sizeBytes: fileStat?.sizeBytes,
		serialized: serializedFromDisk
	});
	return opts.clone === false ? store : structuredClone(store);
}
//#endregion
export { getActiveSessionMaintenanceWarning as a, rotateSessionFile as c, capEntryCount as i, shouldRunSessionEntryMaintenance as l, normalizeSessionStore as n, pruneStaleEntries as o, resolveMaintenanceConfig as r, resolveMaintenanceConfigFromInput as s, loadSessionStore as t };
