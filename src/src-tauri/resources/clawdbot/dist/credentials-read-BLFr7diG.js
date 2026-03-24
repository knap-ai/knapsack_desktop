import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { a as resolveMatrixCredentialsPath$1, d as requiresExplicitMatrixDefaultAccount, m as resolveMatrixDefaultOrOnlyAccountId, r as resolveMatrixCredentialsDir$1 } from "./helper-api-CFToxS1G.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
//#region extensions/matrix/src/runtime.ts
const { setRuntime: setMatrixRuntime, getRuntime: getMatrixRuntime } = createPluginRuntimeStore("Matrix runtime not initialized");
//#endregion
//#region extensions/matrix/src/matrix/credentials-read.ts
function resolveStateDir(env) {
	return getMatrixRuntime().state.resolveStateDir(env, os.homedir);
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
		if (fs.existsSync(credPath)) return parseMatrixCredentialsFile(credPath);
		const legacyPath = resolveLegacyMigrationSourcePath(env, accountId);
		if (!legacyPath || !fs.existsSync(legacyPath)) return null;
		const parsed = parseMatrixCredentialsFile(legacyPath);
		if (!parsed) return null;
		try {
			fs.mkdirSync(path.dirname(credPath), { recursive: true });
			fs.renameSync(legacyPath, credPath);
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
export { getMatrixRuntime as a, resolveMatrixCredentialsPath as i, loadMatrixCredentials as n, setMatrixRuntime as o, resolveMatrixCredentialsDir as r, credentialsMatchConfig as t };
