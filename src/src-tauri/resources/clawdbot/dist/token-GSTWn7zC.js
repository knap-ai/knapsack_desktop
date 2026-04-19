import { a as hasConfiguredSecretInput, c as normalizeResolvedSecretInputString, l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import "./secret-input-BEMaS7ol.js";
import { t as getMSTeamsRuntime } from "./runtime-D4L8hM9P.js";
import { n as refreshMSTeamsDelegatedTokens } from "./oauth.token-SrwNGaVJ.js";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname } from "node:path";
//#region extensions/msteams/src/storage.ts
function resolveMSTeamsStorePath(params) {
	if (params.storePath) return params.storePath;
	if (params.stateDir) return path.join(params.stateDir, params.filename);
	const env = params.env ?? process.env;
	const stateDir = params.homedir ? getMSTeamsRuntime().state.resolveStateDir(env, params.homedir) : getMSTeamsRuntime().state.resolveStateDir(env);
	return path.join(stateDir, params.filename);
}
//#endregion
//#region extensions/msteams/src/token.ts
function resolveAuthType(cfg) {
	const fromCfg = cfg?.authType;
	if (fromCfg === "secret" || fromCfg === "federated") return fromCfg;
	if (process.env.MSTEAMS_AUTH_TYPE === "federated") return "federated";
	return "secret";
}
function hasConfiguredMSTeamsCredentials(cfg) {
	const authType = resolveAuthType(cfg);
	const hasAppId = Boolean(normalizeSecretInputString(cfg?.appId) || normalizeSecretInputString(process.env.MSTEAMS_APP_ID));
	const hasTenantId = Boolean(normalizeSecretInputString(cfg?.tenantId) || normalizeSecretInputString(process.env.MSTEAMS_TENANT_ID));
	if (authType === "federated") {
		const hasCert = Boolean(cfg?.certificatePath || process.env.MSTEAMS_CERTIFICATE_PATH);
		const hasManagedIdentity = cfg?.useManagedIdentity ?? process.env.MSTEAMS_USE_MANAGED_IDENTITY === "true";
		return hasAppId && hasTenantId && (hasCert || hasManagedIdentity);
	}
	return Boolean(normalizeSecretInputString(cfg?.appId) && hasConfiguredSecretInput(cfg?.appPassword) && normalizeSecretInputString(cfg?.tenantId));
}
function resolveMSTeamsCredentials(cfg) {
	const authType = resolveAuthType(cfg);
	const appId = normalizeSecretInputString(cfg?.appId) || normalizeSecretInputString(process.env.MSTEAMS_APP_ID);
	const tenantId = normalizeSecretInputString(cfg?.tenantId) || normalizeSecretInputString(process.env.MSTEAMS_TENANT_ID);
	if (!appId || !tenantId) return;
	if (authType === "federated") {
		const certificatePath = cfg?.certificatePath || process.env.MSTEAMS_CERTIFICATE_PATH || void 0;
		const certificateThumbprint = cfg?.certificateThumbprint || process.env.MSTEAMS_CERTIFICATE_THUMBPRINT || void 0;
		const useManagedIdentity = cfg?.useManagedIdentity ?? process.env.MSTEAMS_USE_MANAGED_IDENTITY === "true";
		const managedIdentityClientId = cfg?.managedIdentityClientId || process.env.MSTEAMS_MANAGED_IDENTITY_CLIENT_ID || void 0;
		if (!certificatePath && !useManagedIdentity) return;
		return {
			type: "federated",
			appId,
			tenantId,
			certificatePath,
			certificateThumbprint,
			useManagedIdentity: useManagedIdentity || void 0,
			managedIdentityClientId
		};
	}
	const appPassword = normalizeResolvedSecretInputString({
		value: cfg?.appPassword,
		path: "channels.msteams.appPassword"
	}) || normalizeSecretInputString(process.env.MSTEAMS_APP_PASSWORD);
	if (!appPassword) return;
	return {
		type: "secret",
		appId,
		appPassword,
		tenantId
	};
}
const DELEGATED_TOKEN_FILENAME = "msteams-delegated.json";
function resolveDelegatedTokenPath() {
	return resolveMSTeamsStorePath({ filename: DELEGATED_TOKEN_FILENAME });
}
function loadDelegatedTokens() {
	try {
		const content = readFileSync(resolveDelegatedTokenPath(), "utf8");
		return JSON.parse(content);
	} catch {
		return;
	}
}
function saveDelegatedTokens(tokens) {
	const tokenPath = resolveDelegatedTokenPath();
	mkdirSync(dirname(tokenPath), { recursive: true });
	writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), "utf8");
}
async function resolveDelegatedAccessToken(params) {
	const tokens = loadDelegatedTokens();
	if (!tokens) return;
	if (tokens.expiresAt > Date.now()) return tokens.accessToken;
	try {
		const refreshed = await refreshMSTeamsDelegatedTokens({
			tenantId: params.tenantId,
			clientId: params.clientId,
			clientSecret: params.clientSecret,
			refreshToken: tokens.refreshToken,
			scopes: tokens.scopes
		});
		saveDelegatedTokens(refreshed);
		return refreshed.accessToken;
	} catch {
		return;
	}
}
//#endregion
export { resolveMSTeamsCredentials as a, resolveDelegatedTokenPath as i, loadDelegatedTokens as n, saveDelegatedTokens as o, resolveDelegatedAccessToken as r, resolveMSTeamsStorePath as s, hasConfiguredMSTeamsCredentials as t };
