import { t as expandHomePrefix } from "./home-dir-BEqRdfoa.js";
import { f as resolveConfigDir } from "./utils-D5DtWkEu.js";
import { t as parseJsonWithJson5Fallback } from "./parse-json-compat-fs1eUPUx.js";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
//#region src/cron/store.ts
const serializedStoreCache = /* @__PURE__ */ new Map();
function resolveDefaultCronDir() {
	return path.join(resolveConfigDir(), "cron");
}
function resolveDefaultCronStorePath() {
	return path.join(resolveDefaultCronDir(), "jobs.json");
}
function stripRuntimeOnlyCronFields(store) {
	return {
		version: store.version,
		jobs: store.jobs.map((job) => {
			const { state: _state, updatedAtMs: _updatedAtMs, ...rest } = job;
			return rest;
		})
	};
}
function parseCronStoreForBackupComparison(raw) {
	try {
		const parsed = parseJsonWithJson5Fallback(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		const version = parsed.version;
		const jobs = parsed.jobs;
		if (version !== 1 || !Array.isArray(jobs)) return null;
		return {
			version: 1,
			jobs: jobs.filter(Boolean)
		};
	} catch {
		return null;
	}
}
function shouldSkipCronBackupForRuntimeOnlyChanges(previousRaw, nextStore) {
	if (previousRaw === null) return false;
	const previous = parseCronStoreForBackupComparison(previousRaw);
	if (!previous) return false;
	return JSON.stringify(stripRuntimeOnlyCronFields(previous)) === JSON.stringify(stripRuntimeOnlyCronFields(nextStore));
}
function resolveCronStorePath(storePath) {
	if (storePath?.trim()) {
		const raw = storePath.trim();
		if (raw.startsWith("~")) return path.resolve(expandHomePrefix(raw));
		return path.resolve(raw);
	}
	return resolveDefaultCronStorePath();
}
async function loadCronStore(storePath) {
	try {
		const raw = await fs.promises.readFile(storePath, "utf-8");
		let parsed;
		try {
			parsed = parseJsonWithJson5Fallback(raw);
		} catch (err) {
			throw new Error(`Failed to parse cron store at ${storePath}: ${String(err)}`, { cause: err });
		}
		const parsedRecord = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
		const store = {
			version: 1,
			jobs: (Array.isArray(parsedRecord.jobs) ? parsedRecord.jobs : []).filter(Boolean)
		};
		serializedStoreCache.set(storePath, JSON.stringify(store, null, 2));
		return store;
	} catch (err) {
		if (err?.code === "ENOENT") {
			serializedStoreCache.delete(storePath);
			return {
				version: 1,
				jobs: []
			};
		}
		throw err;
	}
}
async function setSecureFileMode(filePath) {
	await fs.promises.chmod(filePath, 384).catch(() => void 0);
}
async function saveCronStore(storePath, store, opts) {
	const storeDir = path.dirname(storePath);
	await fs.promises.mkdir(storeDir, {
		recursive: true,
		mode: 448
	});
	await fs.promises.chmod(storeDir, 448).catch(() => void 0);
	const json = JSON.stringify(store, null, 2);
	const cached = serializedStoreCache.get(storePath);
	if (cached === json) return;
	let previous = cached ?? null;
	if (previous === null) try {
		previous = await fs.promises.readFile(storePath, "utf-8");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
	}
	if (previous === json) {
		serializedStoreCache.set(storePath, json);
		return;
	}
	const skipBackup = opts?.skipBackup === true || shouldSkipCronBackupForRuntimeOnlyChanges(previous, store);
	const tmp = `${storePath}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`;
	await fs.promises.writeFile(tmp, json, {
		encoding: "utf-8",
		mode: 384
	});
	await setSecureFileMode(tmp);
	if (previous !== null && !skipBackup) try {
		const backupPath = `${storePath}.bak`;
		await fs.promises.copyFile(storePath, backupPath);
		await setSecureFileMode(backupPath);
	} catch {}
	await renameWithRetry(tmp, storePath);
	await setSecureFileMode(storePath);
	serializedStoreCache.set(storePath, json);
}
const RENAME_MAX_RETRIES = 3;
const RENAME_BASE_DELAY_MS = 50;
async function renameWithRetry(src, dest) {
	for (let attempt = 0; attempt <= RENAME_MAX_RETRIES; attempt++) try {
		await fs.promises.rename(src, dest);
		return;
	} catch (err) {
		const code = err.code;
		if (code === "EBUSY" && attempt < RENAME_MAX_RETRIES) {
			await new Promise((resolve) => setTimeout(resolve, RENAME_BASE_DELAY_MS * 2 ** attempt));
			continue;
		}
		if (code === "EPERM" || code === "EEXIST") {
			await fs.promises.copyFile(src, dest);
			await fs.promises.unlink(src).catch(() => {});
			return;
		}
		throw err;
	}
}
//#endregion
export { resolveCronStorePath as n, saveCronStore as r, loadCronStore as t };
