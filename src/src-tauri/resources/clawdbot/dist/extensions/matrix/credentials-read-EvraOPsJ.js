import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, n as requiresExplicitMatrixDefaultAccount } from "./account-selection-Dbr-o5gC.js";
import { t as getMatrixRuntime } from "./runtime-D_K9vUaM.js";
import { a as resolveMatrixCredentialsPath$1, r as resolveMatrixCredentialsDir$1 } from "./storage-paths-DEBfRoQT.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
//#region extensions/matrix/src/matrix/credentials-read.ts
var credentials_read_exports = /* @__PURE__ */ __exportAll({
	credentialsMatchConfig: () => credentialsMatchConfig,
	loadMatrixCredentials: () => loadMatrixCredentials,
	resolveMatrixCredentialsDir: () => resolveMatrixCredentialsDir,
	resolveMatrixCredentialsPath: () => resolveMatrixCredentialsPath
});
function resolveStateDir(env) {
	try {
		return getMatrixRuntime().state.resolveStateDir(env, os.homedir);
	} catch {
		const override = env.OPENCLAW_STATE_DIR?.trim();
		if (override) return path.resolve(override);
		const homeDir = env.OPENCLAW_HOME?.trim() || env.HOME?.trim() || os.homedir();
		return path.join(homeDir, ".openclaw");
	}
}
function resolveLegacyMatrixCredentialsPath(env) {
	return path.join(resolveMatrixCredentialsDir(env), "credentials.json");
}
function shouldReadLegacyCredentialsForAccount(accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const cfg = getMatrixRuntime().config.loadConfig();
	if (!cfg.channels?.matrix || typeof cfg.channels.matrix !== "object") return normalizedAccountId === DEFAULT_ACCOUNT_ID;
	if (requiresExplicitMatrixDefaultAccount(cfg)) return false;
	return normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg)) === normalizedAccountId;
}
function resolveLegacyMigrationSourcePath(env, accountId) {
	if (!shouldReadLegacyCredentialsForAccount(accountId)) return null;
	const legacyPath = resolveLegacyMatrixCredentialsPath(env);
	return legacyPath === resolveMatrixCredentialsPath(env, accountId) ? null : legacyPath;
}
function parseMatrixCredentialsFile(filePath) {
	const raw = fs.readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(raw);
	if (typeof parsed.homeserver !== "string" || typeof parsed.userId !== "string" || typeof parsed.accessToken !== "string") return null;
	return parsed;
}
function loadMatrixCredentialsFile(filePath, source) {
	try {
		return {
			kind: "loaded",
			source,
			credentials: parseMatrixCredentialsFile(filePath)
		};
	} catch (error) {
		if (error?.code === "ENOENT") return { kind: "missing" };
		throw error;
	}
}
function loadLegacyMatrixCredentialsWithCurrentFallback(params) {
	const legacy = loadMatrixCredentialsFile(params.legacyPath, "legacy");
	if (legacy.kind === "loaded") return legacy;
	return loadMatrixCredentialsFile(params.currentPath, "current");
}
function resolveMatrixCredentialsDir(env = process.env, stateDir) {
	return resolveMatrixCredentialsDir$1(stateDir ?? resolveStateDir(env));
}
function resolveMatrixCredentialsPath(env = process.env, accountId) {
	return resolveMatrixCredentialsPath$1({
		stateDir: resolveStateDir(env),
		accountId
	});
}
function loadMatrixCredentials(env = process.env, accountId) {
	const currentPath = resolveMatrixCredentialsPath(env, accountId);
	try {
		const current = loadMatrixCredentialsFile(currentPath, "current");
		if (current.kind === "loaded") return current.credentials;
		const legacyPath = resolveLegacyMigrationSourcePath(env, accountId);
		if (!legacyPath) return null;
		const loaded = loadLegacyMatrixCredentialsWithCurrentFallback({
			legacyPath,
			currentPath
		});
		if (loaded.kind !== "loaded" || !loaded.credentials) return null;
		if (loaded.source === "legacy") try {
			fs.mkdirSync(path.dirname(currentPath), { recursive: true });
			fs.renameSync(legacyPath, currentPath);
		} catch {}
		return loaded.credentials;
	} catch {
		return null;
	}
}
function credentialsMatchConfig(stored, config) {
	if (!config.userId) {
		if (!config.accessToken) return false;
		return stored.homeserver === config.homeserver && stored.accessToken === config.accessToken;
	}
	return stored.homeserver === config.homeserver && stored.userId === config.userId;
}
//#endregion
export { resolveMatrixCredentialsPath as a, resolveMatrixCredentialsDir as i, credentials_read_exports as n, loadMatrixCredentials as r, credentialsMatchConfig as t };
