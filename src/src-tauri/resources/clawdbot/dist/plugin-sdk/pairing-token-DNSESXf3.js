import { c as resolveStateDir } from "./paths-WR8OhEmw.js";
import path from "node:path";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
//#region src/security/secret-equal.ts
function safeEqualSecret(provided, expected) {
	if (typeof provided !== "string" || typeof expected !== "string") return false;
	const hash = (s) => createHash("sha256").update(s).digest();
	return timingSafeEqual(hash(provided), hash(expected));
}
//#endregion
//#region src/infra/json-files.ts
async function readJsonFile(filePath) {
	try {
		const raw = await fs.readFile(filePath, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function writeJsonAtomic(filePath, value, options) {
	await writeTextAtomic(filePath, JSON.stringify(value, null, 2), {
		mode: options?.mode,
		ensureDirMode: options?.ensureDirMode,
		appendTrailingNewline: options?.trailingNewline
	});
}
async function writeTextAtomic(filePath, content, options) {
	const mode = options?.mode ?? 384;
	const payload = options?.appendTrailingNewline && !content.endsWith("\n") ? `${content}\n` : content;
	const mkdirOptions = { recursive: true };
	if (typeof options?.ensureDirMode === "number") mkdirOptions.mode = options.ensureDirMode;
	await fs.mkdir(path.dirname(filePath), mkdirOptions);
	const tmp = `${filePath}.${randomUUID()}.tmp`;
	try {
		await fs.writeFile(tmp, payload, {
			encoding: "utf8",
			mode
		});
		try {
			await fs.chmod(tmp, mode);
		} catch {}
		await fs.rename(tmp, filePath);
		try {
			await fs.chmod(filePath, mode);
		} catch {}
	} finally {
		await fs.rm(tmp, { force: true }).catch(() => void 0);
	}
}
function createAsyncLock() {
	let lock = Promise.resolve();
	return async function withLock(fn) {
		const prev = lock;
		let release;
		lock = new Promise((resolve) => {
			release = resolve;
		});
		await prev;
		try {
			return await fn();
		} finally {
			release?.();
		}
	};
}
//#endregion
//#region src/shared/device-auth.ts
function normalizeDeviceAuthRole(role) {
	return role.trim();
}
function normalizeDeviceAuthScopes(scopes) {
	if (!Array.isArray(scopes)) return [];
	const out = /* @__PURE__ */ new Set();
	for (const scope of scopes) {
		const trimmed = scope.trim();
		if (trimmed) out.add(trimmed);
	}
	return [...out].toSorted();
}
//#endregion
//#region src/infra/pairing-files.ts
function resolvePairingPaths(baseDir, subdir) {
	const root = baseDir ?? resolveStateDir();
	const dir = path.join(root, subdir);
	return {
		dir,
		pendingPath: path.join(dir, "pending.json"),
		pairedPath: path.join(dir, "paired.json")
	};
}
function pruneExpiredPending(pendingById, nowMs, ttlMs) {
	for (const [id, req] of Object.entries(pendingById)) if (nowMs - req.ts > ttlMs) delete pendingById[id];
}
//#endregion
//#region src/infra/pairing-pending.ts
async function rejectPendingPairingRequest(params) {
	const state = await params.loadState();
	const pending = state.pendingById[params.requestId];
	if (!pending) return null;
	delete state.pendingById[params.requestId];
	await params.persistState(state);
	return {
		requestId: params.requestId,
		[params.idKey]: params.getId(pending)
	};
}
function generatePairingToken() {
	return randomBytes(32).toString("base64url");
}
//#endregion
export { normalizeDeviceAuthRole as a, readJsonFile as c, safeEqualSecret as d, resolvePairingPaths as i, writeJsonAtomic as l, rejectPendingPairingRequest as n, normalizeDeviceAuthScopes as o, pruneExpiredPending as r, createAsyncLock as s, generatePairingToken as t, writeTextAtomic as u };
