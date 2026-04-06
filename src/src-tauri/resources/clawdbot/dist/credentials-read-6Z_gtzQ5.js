import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, n as requiresExplicitMatrixDefaultAccount } from "./account-selection-BoMWBXkb.js";
import { t as getMatrixRuntime } from "./runtime-Jdij2_G2.js";
import { a as resolveMatrixCredentialsPath$1, r as resolveMatrixCredentialsDir$1 } from "./storage-paths-DQTtejVa.js";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
//#region extensions/matrix/src/matrix/credentials-read.ts
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
	const raw = fsSync.readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(raw);
	if (typeof parsed.homeserver !== "string" || typeof parsed.userId !== "string" || typeof parsed.accessToken !== "string") return null;
	return parsed;
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
	const credPath = resolveMatrixCredentialsPath(env, accountId);
	try {
		if (fsSync.existsSync(credPath)) return parseMatrixCredentialsFile(credPath);
		const legacyPath = resolveLegacyMigrationSourcePath(env, accountId);
		if (!legacyPath || !fsSync.existsSync(legacyPath)) return null;
		const parsed = parseMatrixCredentialsFile(legacyPath);
		if (!parsed) return null;
		try {
			fsSync.mkdirSync(path.dirname(credPath), { recursive: true });
			fsSync.renameSync(legacyPath, credPath);
		} catch {}
		return parsed;
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
export { resolveMatrixCredentialsPath as i, loadMatrixCredentials as n, resolveMatrixCredentialsDir as r, credentialsMatchConfig as t };
