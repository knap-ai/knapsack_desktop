import { r as isPidAlive, t as resolveProcessScopedMap } from "./process-scoped-map-DAjtY4r-.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
//#region src/plugin-sdk/file-lock.ts
const HELD_LOCKS = resolveProcessScopedMap(Symbol.for("openclaw.fileLockHeldLocks"));
const CLEANUP_REGISTERED_KEY = Symbol.for("openclaw.fileLockCleanupRegistered");
function releaseAllLocksSync() {
	for (const [normalizedFile, held] of HELD_LOCKS) {
		rmLockPathSync(held.lockPath);
		HELD_LOCKS.delete(normalizedFile);
	}
}
function rmLockPathSync(lockPath) {
	try {
		fs.rmSync(lockPath, { force: true });
	} catch {}
}
function ensureExitCleanupRegistered() {
	const proc = process;
	if (proc[CLEANUP_REGISTERED_KEY]) return;
	proc[CLEANUP_REGISTERED_KEY] = true;
	process.on("exit", releaseAllLocksSync);
}
function computeDelayMs(retries, attempt) {
	const base = Math.min(retries.maxTimeout, Math.max(retries.minTimeout, retries.minTimeout * retries.factor ** attempt));
	const jitter = retries.randomize ? 1 + Math.random() : 1;
	return Math.min(retries.maxTimeout, Math.round(base * jitter));
}
async function readLockPayload(lockPath) {
	try {
		const raw = await fs$1.readFile(lockPath, "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed.pid !== "number" || typeof parsed.createdAt !== "string") return null;
		return {
			pid: parsed.pid,
			createdAt: parsed.createdAt
		};
	} catch {
		return null;
	}
}
async function resolveNormalizedFilePath(filePath) {
	const resolved = path.resolve(filePath);
	const dir = path.dirname(resolved);
	await fs$1.mkdir(dir, { recursive: true });
	try {
		const realDir = await fs$1.realpath(dir);
		return path.join(realDir, path.basename(resolved));
	} catch {
		return resolved;
	}
}
async function isStaleLock(lockPath, staleMs) {
	const payload = await readLockPayload(lockPath);
	if (payload?.pid && !isPidAlive(payload.pid)) return true;
	if (payload?.createdAt) {
		const createdAt = Date.parse(payload.createdAt);
		if (!Number.isFinite(createdAt) || Date.now() - createdAt > staleMs) return true;
	}
	try {
		const stat = await fs$1.stat(lockPath);
		return Date.now() - stat.mtimeMs > staleMs;
	} catch {
		return true;
	}
}
async function releaseHeldLock(normalizedFile) {
	const current = HELD_LOCKS.get(normalizedFile);
	if (!current) return;
	current.count -= 1;
	if (current.count > 0) return;
	HELD_LOCKS.delete(normalizedFile);
	await current.handle.close().catch(() => void 0);
	await fs$1.rm(current.lockPath, { force: true }).catch(() => void 0);
}
function resetFileLockStateForTest() {
	releaseAllLocksSync();
}
/** Acquire a re-entrant process-local file lock backed by a `.lock` sidecar file. */
async function acquireFileLock(filePath, options) {
	ensureExitCleanupRegistered();
	const normalizedFile = await resolveNormalizedFilePath(filePath);
	const lockPath = `${normalizedFile}.lock`;
	const held = HELD_LOCKS.get(normalizedFile);
	if (held) {
		held.count += 1;
		return {
			lockPath,
			release: () => releaseHeldLock(normalizedFile)
		};
	}
	const attempts = Math.max(1, options.retries.retries + 1);
	for (let attempt = 0; attempt < attempts; attempt += 1) try {
		const handle = await fs$1.open(lockPath, "wx");
		await handle.writeFile(JSON.stringify({
			pid: process.pid,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		}, null, 2), "utf8");
		HELD_LOCKS.set(normalizedFile, {
			count: 1,
			handle,
			lockPath
		});
		return {
			lockPath,
			release: () => releaseHeldLock(normalizedFile)
		};
	} catch (err) {
		if (err.code !== "EEXIST") throw err;
		if (await isStaleLock(lockPath, options.stale)) {
			await fs$1.rm(lockPath, { force: true }).catch(() => void 0);
			continue;
		}
		if (attempt >= attempts - 1) break;
		await new Promise((resolve) => setTimeout(resolve, computeDelayMs(options.retries, attempt)));
	}
	throw new Error(`file lock timeout for ${normalizedFile}`);
}
/** Run an async callback while holding a file lock, always releasing the lock afterward. */
async function withFileLock(filePath, options, fn) {
	const lock = await acquireFileLock(filePath, options);
	try {
		return await fn();
	} finally {
		await lock.release();
	}
}
//#endregion
export { resetFileLockStateForTest as n, withFileLock as r, acquireFileLock as t };
