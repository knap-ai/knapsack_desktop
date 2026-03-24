import { n as getProcessStartTime, r as isPidAlive, t as resolveProcessScopedMap } from "./process-scoped-map-DAjtY4r-.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
//#region src/agents/session-write-lock.ts
function isValidLockNumber(value) {
	return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
const CLEANUP_SIGNALS = [
	"SIGINT",
	"SIGTERM",
	"SIGQUIT",
	"SIGABRT"
];
const CLEANUP_STATE_KEY = Symbol.for("openclaw.sessionWriteLockCleanupState");
const HELD_LOCKS_KEY = Symbol.for("openclaw.sessionWriteLockHeldLocks");
const WATCHDOG_STATE_KEY = Symbol.for("openclaw.sessionWriteLockWatchdogState");
const DEFAULT_STALE_MS = 1800 * 1e3;
const DEFAULT_MAX_HOLD_MS = 300 * 1e3;
const DEFAULT_WATCHDOG_INTERVAL_MS = 6e4;
const DEFAULT_TIMEOUT_GRACE_MS = 120 * 1e3;
const MAX_LOCK_HOLD_MS = 2147e6;
const HELD_LOCKS = resolveProcessScopedMap(HELD_LOCKS_KEY);
function resolveCleanupState() {
	const proc = process;
	if (!proc[CLEANUP_STATE_KEY]) proc[CLEANUP_STATE_KEY] = {
		registered: false,
		cleanupHandlers: /* @__PURE__ */ new Map()
	};
	return proc[CLEANUP_STATE_KEY];
}
function resolveWatchdogState() {
	const proc = process;
	if (!proc[WATCHDOG_STATE_KEY]) proc[WATCHDOG_STATE_KEY] = {
		started: false,
		intervalMs: DEFAULT_WATCHDOG_INTERVAL_MS
	};
	return proc[WATCHDOG_STATE_KEY];
}
function resolvePositiveMs(value, fallback, opts = {}) {
	if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return fallback;
	if (value === Number.POSITIVE_INFINITY) return opts.allowInfinity ? value : fallback;
	if (!Number.isFinite(value)) return fallback;
	return value;
}
function resolveSessionLockMaxHoldFromTimeout(params) {
	const minMs = resolvePositiveMs(params.minMs, DEFAULT_MAX_HOLD_MS);
	const timeoutMs = resolvePositiveMs(params.timeoutMs, minMs, { allowInfinity: true });
	if (timeoutMs === Number.POSITIVE_INFINITY) return MAX_LOCK_HOLD_MS;
	const graceMs = resolvePositiveMs(params.graceMs, DEFAULT_TIMEOUT_GRACE_MS);
	return Math.min(MAX_LOCK_HOLD_MS, Math.max(minMs, timeoutMs + graceMs));
}
async function releaseHeldLock(normalizedSessionFile, held, opts = {}) {
	if (HELD_LOCKS.get(normalizedSessionFile) !== held) return false;
	if (opts.force) held.count = 0;
	else {
		held.count -= 1;
		if (held.count > 0) return false;
	}
	if (held.releasePromise) {
		await held.releasePromise.catch(() => void 0);
		return true;
	}
	HELD_LOCKS.delete(normalizedSessionFile);
	held.releasePromise = (async () => {
		try {
			await held.handle.close();
		} catch {}
		try {
			await fs$1.rm(held.lockPath, { force: true });
		} catch {}
	})();
	try {
		await held.releasePromise;
		return true;
	} finally {
		held.releasePromise = void 0;
		if (HELD_LOCKS.size === 0) stopWatchdogTimer();
	}
}
/**
* Synchronously release all held locks.
* Used during process exit when async operations aren't reliable.
*/
function releaseAllLocksSync() {
	for (const [sessionFile, held] of HELD_LOCKS) {
		try {
			fs.rmSync(held.lockPath, { force: true });
		} catch {}
		HELD_LOCKS.delete(sessionFile);
	}
	if (HELD_LOCKS.size === 0) stopWatchdogTimer();
}
async function runLockWatchdogCheck(nowMs = Date.now()) {
	let released = 0;
	for (const [sessionFile, held] of HELD_LOCKS.entries()) {
		const heldForMs = nowMs - held.acquiredAt;
		if (heldForMs <= held.maxHoldMs) continue;
		console.warn(`[session-write-lock] releasing lock held for ${heldForMs}ms (max=${held.maxHoldMs}ms): ${held.lockPath}`);
		if (await releaseHeldLock(sessionFile, held, { force: true })) released += 1;
	}
	return released;
}
function stopWatchdogTimer() {
	const watchdogState = resolveWatchdogState();
	if (watchdogState.timer) {
		clearInterval(watchdogState.timer);
		watchdogState.timer = void 0;
	}
	watchdogState.started = false;
}
function ensureWatchdogStarted(intervalMs) {
	const watchdogState = resolveWatchdogState();
	if (watchdogState.started) return;
	watchdogState.started = true;
	watchdogState.intervalMs = intervalMs;
	watchdogState.timer = setInterval(() => {
		runLockWatchdogCheck().catch(() => {});
	}, intervalMs);
	watchdogState.timer.unref?.();
}
function handleTerminationSignal(signal) {
	releaseAllLocksSync();
	const cleanupState = resolveCleanupState();
	if (process.listenerCount(signal) === 1) {
		const handler = cleanupState.cleanupHandlers.get(signal);
		if (handler) {
			process.off(signal, handler);
			cleanupState.cleanupHandlers.delete(signal);
		}
		try {
			process.kill(process.pid, signal);
		} catch {}
	}
}
function registerCleanupHandlers() {
	const cleanupState = resolveCleanupState();
	if (!cleanupState.registered) {
		cleanupState.registered = true;
		process.on("exit", () => {
			releaseAllLocksSync();
		});
	}
	ensureWatchdogStarted(DEFAULT_WATCHDOG_INTERVAL_MS);
	for (const signal of CLEANUP_SIGNALS) {
		if (cleanupState.cleanupHandlers.has(signal)) continue;
		try {
			const handler = () => handleTerminationSignal(signal);
			cleanupState.cleanupHandlers.set(signal, handler);
			process.on(signal, handler);
		} catch {}
	}
}
async function readLockPayload(lockPath) {
	try {
		const raw = await fs$1.readFile(lockPath, "utf8");
		const parsed = JSON.parse(raw);
		const payload = {};
		if (isValidLockNumber(parsed.pid) && parsed.pid > 0) payload.pid = parsed.pid;
		if (typeof parsed.createdAt === "string") payload.createdAt = parsed.createdAt;
		if (isValidLockNumber(parsed.starttime)) payload.starttime = parsed.starttime;
		return payload;
	} catch {
		return null;
	}
}
function inspectLockPayload(payload, staleMs, nowMs) {
	const pid = isValidLockNumber(payload?.pid) && payload.pid > 0 ? payload.pid : null;
	const pidAlive = pid !== null ? isPidAlive(pid) : false;
	const createdAt = typeof payload?.createdAt === "string" ? payload.createdAt : null;
	const createdAtMs = createdAt ? Date.parse(createdAt) : NaN;
	const ageMs = Number.isFinite(createdAtMs) ? Math.max(0, nowMs - createdAtMs) : null;
	const storedStarttime = isValidLockNumber(payload?.starttime) ? payload.starttime : null;
	const pidRecycled = pidAlive && pid !== null && storedStarttime !== null ? (() => {
		const currentStarttime = getProcessStartTime(pid);
		return currentStarttime !== null && currentStarttime !== storedStarttime;
	})() : false;
	const staleReasons = [];
	if (pid === null) staleReasons.push("missing-pid");
	else if (!pidAlive) staleReasons.push("dead-pid");
	else if (pidRecycled) staleReasons.push("recycled-pid");
	if (ageMs === null) staleReasons.push("invalid-createdAt");
	else if (ageMs > staleMs) staleReasons.push("too-old");
	return {
		pid,
		pidAlive,
		createdAt,
		ageMs,
		stale: staleReasons.length > 0,
		staleReasons
	};
}
function lockInspectionNeedsMtimeStaleFallback(details) {
	return details.stale && details.staleReasons.every((reason) => reason === "missing-pid" || reason === "invalid-createdAt");
}
async function shouldReclaimContendedLockFile(lockPath, details, staleMs, nowMs) {
	if (!details.stale) return false;
	if (!lockInspectionNeedsMtimeStaleFallback(details)) return true;
	try {
		const stat = await fs$1.stat(lockPath);
		return Math.max(0, nowMs - stat.mtimeMs) > staleMs;
	} catch (error) {
		return error?.code !== "ENOENT";
	}
}
function shouldTreatAsOrphanSelfLock(params) {
	if ((isValidLockNumber(params.payload?.pid) ? params.payload.pid : null) !== process.pid) return false;
	if (isValidLockNumber(params.payload?.starttime)) return false;
	return !HELD_LOCKS.has(params.normalizedSessionFile);
}
async function cleanStaleLockFiles(params) {
	const sessionsDir = path.resolve(params.sessionsDir);
	const staleMs = resolvePositiveMs(params.staleMs, DEFAULT_STALE_MS);
	const removeStale = params.removeStale !== false;
	const nowMs = params.nowMs ?? Date.now();
	let entries = [];
	try {
		entries = await fs$1.readdir(sessionsDir, { withFileTypes: true });
	} catch (err) {
		if (err.code === "ENOENT") return {
			locks: [],
			cleaned: []
		};
		throw err;
	}
	const locks = [];
	const cleaned = [];
	const lockEntries = entries.filter((entry) => entry.name.endsWith(".jsonl.lock")).toSorted((a, b) => a.name.localeCompare(b.name));
	for (const entry of lockEntries) {
		const lockPath = path.join(sessionsDir, entry.name);
		const lockInfo = {
			lockPath,
			...inspectLockPayload(await readLockPayload(lockPath), staleMs, nowMs),
			removed: false
		};
		if (lockInfo.stale && removeStale) {
			await fs$1.rm(lockPath, { force: true });
			lockInfo.removed = true;
			cleaned.push(lockInfo);
			params.log?.warn?.(`removed stale session lock: ${lockPath} (${lockInfo.staleReasons.join(", ") || "unknown"})`);
		}
		locks.push(lockInfo);
	}
	return {
		locks,
		cleaned
	};
}
async function acquireSessionWriteLock(params) {
	registerCleanupHandlers();
	const timeoutMs = resolvePositiveMs(params.timeoutMs, 1e4, { allowInfinity: true });
	const staleMs = resolvePositiveMs(params.staleMs, DEFAULT_STALE_MS);
	const maxHoldMs = resolvePositiveMs(params.maxHoldMs, DEFAULT_MAX_HOLD_MS);
	const sessionFile = path.resolve(params.sessionFile);
	const sessionDir = path.dirname(sessionFile);
	await fs$1.mkdir(sessionDir, { recursive: true });
	let normalizedDir = sessionDir;
	try {
		normalizedDir = await fs$1.realpath(sessionDir);
	} catch {}
	const normalizedSessionFile = path.join(normalizedDir, path.basename(sessionFile));
	const lockPath = `${normalizedSessionFile}.lock`;
	const allowReentrant = params.allowReentrant ?? true;
	const held = HELD_LOCKS.get(normalizedSessionFile);
	if (allowReentrant && held) {
		held.count += 1;
		return { release: async () => {
			await releaseHeldLock(normalizedSessionFile, held);
		} };
	}
	const startedAt = Date.now();
	let attempt = 0;
	while (Date.now() - startedAt < timeoutMs) {
		attempt += 1;
		let handle = null;
		try {
			handle = await fs$1.open(lockPath, "wx");
			const createdAt = (/* @__PURE__ */ new Date()).toISOString();
			const starttime = getProcessStartTime(process.pid);
			const lockPayload = {
				pid: process.pid,
				createdAt
			};
			if (starttime !== null) lockPayload.starttime = starttime;
			await handle.writeFile(JSON.stringify(lockPayload, null, 2), "utf8");
			const createdHeld = {
				count: 1,
				handle,
				lockPath,
				acquiredAt: Date.now(),
				maxHoldMs
			};
			HELD_LOCKS.set(normalizedSessionFile, createdHeld);
			return { release: async () => {
				await releaseHeldLock(normalizedSessionFile, createdHeld);
			} };
		} catch (err) {
			if (handle) {
				try {
					await handle.close();
				} catch {}
				try {
					await fs$1.rm(lockPath, { force: true });
				} catch {}
			}
			if (err.code !== "EEXIST") throw err;
			const payload = await readLockPayload(lockPath);
			const nowMs = Date.now();
			const inspected = inspectLockPayload(payload, staleMs, nowMs);
			if (await shouldReclaimContendedLockFile(lockPath, shouldTreatAsOrphanSelfLock({
				payload,
				normalizedSessionFile
			}) ? {
				...inspected,
				stale: true,
				staleReasons: inspected.staleReasons.includes("orphan-self-pid") ? inspected.staleReasons : [...inspected.staleReasons, "orphan-self-pid"]
			} : inspected, staleMs, nowMs)) {
				await fs$1.rm(lockPath, { force: true });
				continue;
			}
			const delay = Math.min(1e3, 50 * attempt);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	const payload = await readLockPayload(lockPath);
	const owner = typeof payload?.pid === "number" ? `pid=${payload.pid}` : "unknown";
	throw new Error(`session file locked (timeout ${timeoutMs}ms): ${owner} ${lockPath}`);
}
[...CLEANUP_SIGNALS];
//#endregion
export { cleanStaleLockFiles as n, resolveSessionLockMaxHoldFromTimeout as r, acquireSessionWriteLock as t };
