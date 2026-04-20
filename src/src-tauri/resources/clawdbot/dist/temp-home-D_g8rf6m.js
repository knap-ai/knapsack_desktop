import { n as drainFileLockStateForTest } from "./file-lock-ByJeCMLs.js";
import "./file-lock-BMw37VAn.js";
import { r as drainSessionWriteLockStateForTest } from "./session-write-lock-CcI4KSH8.js";
import { t as clearSessionStoreCaches } from "./store-cache-C6102ouP.js";
import { r as drainSessionStoreLockQueuesForTest } from "./store-lock-state-Cu-GBI9_.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
//#region src/test-utils/fetch-mock.ts
function withFetchPreconnect(fn) {
	return Object.assign(fn, {
		preconnect: (_url, _options) => {},
		__openclawAcceptsDispatcher: true
	});
}
//#endregion
//#region src/test-utils/env.ts
function captureEnv(keys) {
	const snapshot = /* @__PURE__ */ new Map();
	for (const key of keys) snapshot.set(key, process.env[key]);
	return { restore() {
		for (const [key, value] of snapshot) if (value === void 0) delete process.env[key];
		else process.env[key] = value;
	} };
}
function applyEnvValues(env) {
	for (const [key, value] of Object.entries(env)) if (value === void 0) delete process.env[key];
	else process.env[key] = value;
}
function withEnv(env, fn) {
	const snapshot = captureEnv(Object.keys(env));
	try {
		applyEnvValues(env);
		return fn();
	} finally {
		snapshot.restore();
	}
}
async function withEnvAsync(env, fn) {
	const snapshot = captureEnv(Object.keys(env));
	try {
		applyEnvValues(env);
		return await fn();
	} finally {
		snapshot.restore();
	}
}
//#endregion
//#region src/test-utils/session-state-cleanup.ts
let fileLockDrainerForTests = null;
let sessionStoreLockQueueDrainerForTests = null;
let sessionWriteLockDrainerForTests = null;
async function cleanupSessionStateForTest() {
	await (sessionStoreLockQueueDrainerForTests ?? drainSessionStoreLockQueuesForTest)();
	clearSessionStoreCaches();
	await (fileLockDrainerForTests ?? drainFileLockStateForTest)();
	await (sessionWriteLockDrainerForTests ?? drainSessionWriteLockStateForTest)();
}
//#endregion
//#region src/test-utils/temp-home.ts
const HOME_ENV_KEYS = [
	"HOME",
	"USERPROFILE",
	"HOMEDRIVE",
	"HOMEPATH",
	"OPENCLAW_STATE_DIR"
];
const prefixRoots = /* @__PURE__ */ new Map();
const pendingPrefixRoots = /* @__PURE__ */ new Map();
let nextHomeIndex = 0;
async function ensurePrefixRoot(prefix) {
	const cached = prefixRoots.get(prefix);
	if (cached) return cached;
	const pending = pendingPrefixRoots.get(prefix);
	if (pending) return await pending;
	const create = fs.mkdtemp(path.join(os.tmpdir(), prefix));
	pendingPrefixRoots.set(prefix, create);
	try {
		const root = await create;
		prefixRoots.set(prefix, root);
		return root;
	} finally {
		pendingPrefixRoots.delete(prefix);
	}
}
async function createTempHomeEnv(prefix) {
	const prefixRoot = await ensurePrefixRoot(prefix);
	const home = path.join(prefixRoot, `home-${String(nextHomeIndex)}`);
	nextHomeIndex += 1;
	await fs.rm(home, {
		recursive: true,
		force: true
	});
	await fs.mkdir(path.join(home, ".openclaw"), { recursive: true });
	const snapshot = captureEnv([...HOME_ENV_KEYS]);
	process.env.HOME = home;
	process.env.USERPROFILE = home;
	process.env.OPENCLAW_STATE_DIR = path.join(home, ".openclaw");
	if (process.platform === "win32") {
		const match = home.match(/^([A-Za-z]:)(.*)$/);
		if (match) {
			process.env.HOMEDRIVE = match[1];
			process.env.HOMEPATH = match[2] || "\\";
		}
	}
	return {
		home,
		restore: async () => {
			await cleanupSessionStateForTest().catch(() => void 0);
			snapshot.restore();
			await fs.rm(home, {
				recursive: true,
				force: true
			});
		}
	};
}
//#endregion
export { withEnvAsync as a, withEnv as i, cleanupSessionStateForTest as n, withFetchPreconnect as o, captureEnv as r, createTempHomeEnv as t };
