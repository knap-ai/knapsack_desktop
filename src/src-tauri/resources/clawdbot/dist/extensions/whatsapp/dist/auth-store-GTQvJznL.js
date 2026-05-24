import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { a as readWebCredsJsonRawSync, c as statWebCredsFileSync, i as readWebCredsJsonRaw, o as resolveWebCredsBackupPath, s as resolveWebCredsPath, t as assertWebCredsPathRegularFileOrMissing } from "./creds-files-B1kSWtBg.js";
import { r as resolveUserPath } from "./text-runtime-Dk37KYHj.js";
import { c as resolveComparableIdentity } from "./identity-xoLLdqEv.js";
import path from "node:path";
import { resolveOAuthDir as resolveOAuthDir$1 } from "openclaw/plugin-sdk/state-paths";
import { replaceFileAtomic } from "openclaw/plugin-sdk/security-runtime";
import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { defaultRuntime, getChildLogger, info, success } from "openclaw/plugin-sdk/runtime-env";
import fs from "node:fs/promises";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/routing";
//#region extensions/whatsapp/src/creds-persistence.ts
const CREDS_FILE_MODE = 384;
const CREDS_SAVE_FLUSH_TIMEOUT_MS = 15e3;
const credsSaveQueues = /* @__PURE__ */ new Map();
async function stringifyCreds(creds) {
	const { BufferJSON } = await import("./session.runtime-C6uBkEaI.js").then((n) => n.a);
	return JSON.stringify(creds, BufferJSON.replacer);
}
async function writeWebCredsRawAtomically(params) {
	await assertWebCredsPathRegularFileOrMissing(params.filePath);
	await replaceFileAtomic({
		filePath: params.filePath,
		content: params.content,
		dirMode: 448,
		mode: CREDS_FILE_MODE,
		tempPrefix: params.tempPrefix,
		syncTempFile: true,
		syncParentDir: true,
		beforeRename: async ({ filePath }) => {
			await assertWebCredsPathRegularFileOrMissing(filePath);
		}
	});
}
async function writeCredsJsonAtomically(authDir, creds) {
	await writeWebCredsRawAtomically({
		filePath: resolveWebCredsPath(authDir),
		content: await stringifyCreds(creds),
		tempPrefix: ".creds"
	});
}
function enqueueCredsSave(authDir, saveCreds, onError) {
	const next = (credsSaveQueues.get(authDir) ?? Promise.resolve()).then(() => saveCreds()).catch((error) => {
		onError(error);
	}).finally(() => {
		if (credsSaveQueues.get(authDir) === next) credsSaveQueues.delete(authDir);
	});
	credsSaveQueues.set(authDir, next);
}
function waitForCredsSaveQueue(authDir) {
	if (authDir) return credsSaveQueues.get(authDir) ?? Promise.resolve();
	return Promise.all(credsSaveQueues.values()).then(() => {});
}
async function waitForCredsSaveQueueWithTimeout(authDir, timeoutMs = CREDS_SAVE_FLUSH_TIMEOUT_MS) {
	let flushTimeout;
	return await Promise.race([waitForCredsSaveQueue(authDir).then(() => "drained"), new Promise((resolve) => {
		flushTimeout = setTimeout(() => resolve("timed_out"), timeoutMs);
	})]).finally(() => {
		if (flushTimeout) clearTimeout(flushTimeout);
	});
}
//#endregion
//#region extensions/whatsapp/src/auth-store.ts
var auth_store_exports = /* @__PURE__ */ __exportAll({
	WA_WEB_AUTH_DIR: () => WA_WEB_AUTH_DIR,
	WHATSAPP_AUTH_UNSTABLE_CODE: () => WHATSAPP_AUTH_UNSTABLE_CODE,
	WhatsAppAuthUnstableError: () => WhatsAppAuthUnstableError,
	formatWhatsAppWebAuthStatusState: () => formatWhatsAppWebAuthStatusState,
	getWebAuthAgeMs: () => getWebAuthAgeMs,
	logWebSelfId: () => logWebSelfId,
	logoutWeb: () => logoutWeb,
	pickWebChannel: () => pickWebChannel,
	readCredsJsonRaw: () => readCredsJsonRaw,
	readWebAuthExistsBestEffort: () => readWebAuthExistsBestEffort,
	readWebAuthExistsForDecision: () => readWebAuthExistsForDecision,
	readWebAuthSnapshot: () => readWebAuthSnapshot,
	readWebAuthSnapshotBestEffort: () => readWebAuthSnapshotBestEffort,
	readWebAuthState: () => readWebAuthState,
	readWebSelfId: () => readWebSelfId,
	readWebSelfIdentity: () => readWebSelfIdentity,
	readWebSelfIdentityForDecision: () => readWebSelfIdentityForDecision,
	resolveDefaultWebAuthDir: () => resolveDefaultWebAuthDir,
	resolveWebCredsBackupPath: () => resolveWebCredsBackupPath,
	resolveWebCredsPath: () => resolveWebCredsPath,
	restoreCredsFromBackupIfNeeded: () => restoreCredsFromBackupIfNeeded,
	webAuthExists: () => webAuthExists
});
const WHATSAPP_AUTH_UNSTABLE_CODE = "whatsapp-auth-unstable";
const authStoreLogger = getChildLogger({ module: "web-auth-store" });
const emptyWebSelfId = () => ({
	e164: null,
	jid: null,
	lid: null
});
var WhatsAppAuthUnstableError = class extends Error {
	constructor(message = "WhatsApp auth state is still stabilizing; retry shortly.") {
		super(message);
		this.code = WHATSAPP_AUTH_UNSTABLE_CODE;
		this.name = "WhatsAppAuthUnstableError";
	}
};
function resolveDefaultWebAuthDir() {
	return path.join(resolveOAuthDir$1(), "whatsapp", DEFAULT_ACCOUNT_ID);
}
const WA_WEB_AUTH_DIR = resolveDefaultWebAuthDir();
function readCredsJsonRaw(filePath) {
	return readWebCredsJsonRawSync(filePath);
}
async function waitForWebAuthBarrier(authDir, context) {
	const result = await waitForCredsSaveQueueWithTimeout(authDir);
	if (result === "timed_out") authStoreLogger.warn({
		authDir,
		context
	}, "timed out waiting for queued WhatsApp creds save before auth read");
	return result;
}
async function restoreCredsFromBackupIfNeeded(authDir) {
	const logger = getChildLogger({ module: "web-session" });
	try {
		const credsPath = resolveWebCredsPath(authDir);
		const backupPath = resolveWebCredsBackupPath(authDir);
		try {
			await assertWebCredsPathRegularFileOrMissing(credsPath);
		} catch {
			return false;
		}
		const raw = readCredsJsonRaw(credsPath);
		if (raw) {
			JSON.parse(raw);
			return false;
		}
		const backupRaw = readCredsJsonRaw(backupPath);
		if (!backupRaw) return false;
		JSON.parse(backupRaw);
		await writeWebCredsRawAtomically({
			filePath: credsPath,
			content: backupRaw,
			tempPrefix: ".creds.restore"
		});
		logger.warn({ credsPath }, "restored corrupted WhatsApp creds.json from backup");
		return true;
	} catch {}
	return false;
}
async function webAuthExists(authDir = resolveDefaultWebAuthDir()) {
	const raw = await readWebCredsJsonRaw(resolveWebCredsPath(resolveUserPath(authDir)));
	if (!raw) return false;
	try {
		JSON.parse(raw);
		return true;
	} catch {
		return false;
	}
}
function resolveWebAuthState(params) {
	if (params.barrierResult === "timed_out") return "unstable";
	return params.linked ? "linked" : "not-linked";
}
async function readWebAuthStateCore(authDir, context) {
	const resolvedAuthDir = resolveUserPath(authDir);
	const barrierResult = await waitForWebAuthBarrier(resolvedAuthDir, context);
	const linked = await webAuthExists(resolvedAuthDir);
	return {
		authDir: resolvedAuthDir,
		linked,
		state: resolveWebAuthState({
			linked,
			barrierResult
		})
	};
}
function formatWhatsAppWebAuthStatusState(state) {
	switch (state) {
		case "linked": return "linked";
		case "not-linked": return "not linked";
		case "unstable": return "auth stabilizing";
	}
	return state;
}
async function readWebAuthState(authDir = resolveDefaultWebAuthDir()) {
	return (await readWebAuthStateCore(authDir, "readWebAuthState")).state;
}
async function readWebAuthSnapshot(authDir = resolveDefaultWebAuthDir()) {
	const auth = await readWebAuthStateCore(authDir, "readWebAuthSnapshot");
	return {
		state: auth.state,
		authAgeMs: auth.state === "linked" ? getWebAuthAgeMs(auth.authDir) : null,
		selfId: auth.state === "linked" ? readWebSelfId(auth.authDir) : emptyWebSelfId()
	};
}
async function readWebAuthExistsBestEffort(authDir = resolveDefaultWebAuthDir()) {
	const state = await readWebAuthState(authDir);
	return {
		exists: state === "linked",
		timedOut: state === "unstable"
	};
}
async function readWebAuthExistsForDecision(authDir = resolveDefaultWebAuthDir()) {
	const state = await readWebAuthState(authDir);
	if (state === "unstable") return { outcome: "unstable" };
	return {
		outcome: "stable",
		exists: state === "linked"
	};
}
async function readWebAuthSnapshotBestEffort(authDir = resolveDefaultWebAuthDir()) {
	const snapshot = await readWebAuthSnapshot(authDir);
	return {
		linked: snapshot.state === "linked",
		timedOut: snapshot.state === "unstable",
		authAgeMs: snapshot.authAgeMs,
		selfId: snapshot.selfId
	};
}
function isBaileysAuthFileName(name) {
	if (name === "oauth.json") return false;
	if (name === "creds.json" || name === "creds.json.bak") return true;
	if (!name.endsWith(".json")) return false;
	return /^(app-state-sync|session|sender-key|pre-key)-/.test(name);
}
async function clearBaileysAuthFiles(authDir) {
	const rootStats = await fs.lstat(authDir).catch(() => null);
	if (!rootStats?.isDirectory() || rootStats.isSymbolicLink()) return;
	const entries = await fs.readdir(authDir, { withFileTypes: true });
	await Promise.all(entries.map(async (entry) => {
		if (!entry.isFile()) return;
		if (!isBaileysAuthFileName(entry.name)) return;
		await fs.rm(path.join(authDir, entry.name), { force: true });
	}));
}
async function shouldClearOnLogout(authDir, isLegacyAuthDir) {
	try {
		const stats = await fs.lstat(authDir);
		if (!stats.isDirectory() || stats.isSymbolicLink()) return false;
		if (isLegacyAuthDir) return (await fs.readdir(authDir, { withFileTypes: true })).some((entry) => {
			if (!entry.isFile()) return false;
			return isBaileysAuthFileName(entry.name);
		});
		if ((await fs.lstat(resolveWebCredsPath(authDir)).catch(() => null))?.isFile()) return true;
		return (await fs.lstat(resolveWebCredsBackupPath(authDir)).catch(() => null))?.isFile() === true;
	} catch (error) {
		const codeValue = error && typeof error === "object" && "code" in error ? error.code : void 0;
		return (typeof codeValue === "string" ? codeValue : "") !== "ENOENT";
	}
}
function isPathInsideDirectory(baseDir, targetPath) {
	const relativePath = path.relative(baseDir, targetPath);
	return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}
async function pathHasSymlinkComponent(baseDir, targetPath) {
	const relativePath = path.relative(baseDir, targetPath);
	let currentPath = baseDir;
	for (const segment of relativePath.split(path.sep)) {
		currentPath = path.join(currentPath, segment);
		const stats = await fs.lstat(currentPath).catch(() => null);
		if (!stats || stats.isSymbolicLink()) return true;
	}
	return false;
}
async function isLegacyWebAuthDir(authDir) {
	const legacyAuthDir = path.resolve(resolveOAuthDir$1());
	const resolvedAuthDir = path.resolve(authDir);
	if (resolvedAuthDir !== legacyAuthDir) return false;
	const stats = await fs.lstat(resolvedAuthDir).catch(() => null);
	return stats?.isDirectory() === true && !stats.isSymbolicLink();
}
async function classifyWebAuthDirOwnership(authDir) {
	const whatsappAuthBase = path.resolve(resolveOAuthDir$1(), "whatsapp");
	const resolvedAuthDir = path.resolve(authDir);
	if (!isPathInsideDirectory(whatsappAuthBase, resolvedAuthDir)) return { kind: "external" };
	const [baseRealPath, authDirRealPath] = await Promise.all([fs.realpath(whatsappAuthBase).catch(() => null), fs.realpath(resolvedAuthDir).catch(() => null)]);
	if (!baseRealPath || !authDirRealPath) return { kind: "unsafe-owned" };
	if (!isPathInsideDirectory(baseRealPath, authDirRealPath)) return { kind: "unsafe-owned" };
	if (await pathHasSymlinkComponent(whatsappAuthBase, resolvedAuthDir)) return { kind: "unsafe-owned" };
	return {
		kind: "owned",
		authDir: resolvedAuthDir
	};
}
async function logoutWeb(params) {
	const runtime = params.runtime ?? defaultRuntime;
	const resolvedAuthDir = resolveUserPath(params.authDir ?? resolveDefaultWebAuthDir());
	if (await waitForWebAuthBarrier(resolvedAuthDir, "logoutWeb") === "timed_out") runtime.log(info("WhatsApp auth state is still stabilizing; clearing cached credentials anyway."));
	if (!await shouldClearOnLogout(resolvedAuthDir, Boolean(params.isLegacyAuthDir))) {
		runtime.log(info("No WhatsApp Web session found; nothing to delete."));
		return false;
	}
	if (params.isLegacyAuthDir) {
		if (!await isLegacyWebAuthDir(resolvedAuthDir)) {
			runtime.log(info("Skipped WhatsApp Web credential cleanup outside the managed legacy auth directory."));
			return false;
		}
		await clearBaileysAuthFiles(resolvedAuthDir);
	} else {
		const ownership = await classifyWebAuthDirOwnership(resolvedAuthDir);
		if (ownership.kind === "owned") await fs.rm(ownership.authDir, {
			recursive: true,
			force: true
		});
		else if (ownership.kind === "unsafe-owned") {
			runtime.log(info("Skipped WhatsApp Web credential cleanup because the auth directory crosses a symlink boundary."));
			return false;
		} else {
			runtime.log(info("Skipped WhatsApp Web credential cleanup outside the managed auth directory."));
			return false;
		}
	}
	runtime.log(success("Cleared WhatsApp Web credentials."));
	return true;
}
function readWebSelfId(authDir = resolveDefaultWebAuthDir()) {
	try {
		const raw = readCredsJsonRaw(resolveWebCredsPath(resolveUserPath(authDir)));
		if (!raw) return emptyWebSelfId();
		const parsed = JSON.parse(raw);
		const identity = resolveComparableIdentity({
			jid: parsed?.me?.id ?? null,
			lid: parsed?.me?.lid ?? null
		}, authDir);
		return {
			e164: identity.e164 ?? null,
			jid: identity.jid ?? null,
			lid: identity.lid ?? null
		};
	} catch {
		return emptyWebSelfId();
	}
}
async function readWebSelfIdentity(authDir = resolveDefaultWebAuthDir(), fallback) {
	const resolvedAuthDir = resolveUserPath(authDir);
	const raw = await readWebCredsJsonRaw(resolveWebCredsPath(resolvedAuthDir));
	if (raw) try {
		const parsed = JSON.parse(raw);
		return resolveComparableIdentity({
			jid: parsed?.me?.id ?? null,
			lid: parsed?.me?.lid ?? null
		}, resolvedAuthDir);
	} catch {}
	return resolveComparableIdentity({
		jid: fallback?.id ?? null,
		lid: fallback?.lid ?? null
	}, resolvedAuthDir);
}
async function readWebSelfIdentityForDecision(authDir = resolveDefaultWebAuthDir(), fallback) {
	const resolvedAuthDir = resolveUserPath(authDir);
	if (await waitForWebAuthBarrier(resolvedAuthDir, "readWebSelfIdentityForDecision") === "timed_out") return { outcome: "unstable" };
	return {
		outcome: "stable",
		identity: await readWebSelfIdentity(resolvedAuthDir, fallback)
	};
}
/**
* Return the age (in milliseconds) of the cached WhatsApp web auth state, or null when missing.
* Helpful for heartbeats/observability to spot stale credentials.
*/
function getWebAuthAgeMs(authDir = resolveDefaultWebAuthDir()) {
	const stats = statWebCredsFileSync(resolveWebCredsPath(resolveUserPath(authDir)));
	return stats ? Math.max(0, Date.now() - stats.mtimeMs) : null;
}
function logWebSelfId(authDir = resolveDefaultWebAuthDir(), runtime = defaultRuntime, includeChannelPrefix = false) {
	const { e164, jid, lid } = readWebSelfId(authDir);
	const parts = [jid ? `jid ${jid}` : null, lid ? `lid ${lid}` : null].filter((value) => Boolean(value));
	const details = e164 || parts.length > 0 ? `${e164 ?? "unknown"}${parts.length > 0 ? ` (${parts.join(", ")})` : ""}` : "unknown";
	const prefix = includeChannelPrefix ? "Web Channel: " : "";
	runtime.log(info(`${prefix}${details}`));
}
async function pickWebChannel(pref, authDir = resolveDefaultWebAuthDir()) {
	const choice = pref === "auto" ? "web" : pref;
	const auth = await readWebAuthExistsForDecision(authDir);
	if (auth.outcome === "unstable") throw new WhatsAppAuthUnstableError();
	if (!auth.exists) throw new Error(`No WhatsApp Web session found. Run \`${formatCliCommand("openclaw channels login --channel whatsapp --verbose")}\` to link.`);
	return choice;
}
//#endregion
export { waitForCredsSaveQueue as C, writeWebCredsRawAtomically as E, enqueueCredsSave as S, writeCredsJsonAtomically as T, readWebSelfIdentity as _, formatWhatsAppWebAuthStatusState as a, restoreCredsFromBackupIfNeeded as b, logoutWeb as c, readWebAuthExistsBestEffort as d, readWebAuthExistsForDecision as f, readWebSelfId as g, readWebAuthState as h, auth_store_exports as i, pickWebChannel as l, readWebAuthSnapshotBestEffort as m, WHATSAPP_AUTH_UNSTABLE_CODE as n, getWebAuthAgeMs as o, readWebAuthSnapshot as p, WhatsAppAuthUnstableError as r, logWebSelfId as s, WA_WEB_AUTH_DIR as t, readCredsJsonRaw as u, readWebSelfIdentityForDecision as v, waitForCredsSaveQueueWithTimeout as w, webAuthExists as x, resolveDefaultWebAuthDir as y };
