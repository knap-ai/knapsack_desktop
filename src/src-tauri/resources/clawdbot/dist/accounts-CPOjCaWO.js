import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import "./secret-input-C8U7qpTM.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, l as resolveMatrixAccountStringValues, o as getMatrixScopedEnvVarNames, r as resolveConfiguredMatrixAccountIds } from "./account-selection-BoMWBXkb.js";
import { c as resolveMatrixBaseConfig, i as findMatrixAccountConfig, s as resolveMatrixAccountConfig } from "./config-paths-TkWX6drG.js";
import { n as loadMatrixCredentials, t as credentialsMatchConfig } from "./credentials-read-6Z_gtzQ5.js";
//#region extensions/matrix/src/matrix/accounts.ts
function clean(value) {
	return typeof value === "string" ? value.trim() : "";
}
function resolveGlobalMatrixEnvConfig(env) {
	return {
		homeserver: clean(env.MATRIX_HOMESERVER),
		userId: clean(env.MATRIX_USER_ID),
		accessToken: clean(env.MATRIX_ACCESS_TOKEN) || void 0,
		password: clean(env.MATRIX_PASSWORD) || void 0,
		deviceId: clean(env.MATRIX_DEVICE_ID) || void 0,
		deviceName: clean(env.MATRIX_DEVICE_NAME) || void 0
	};
}
function resolveScopedMatrixEnvConfig(accountId, env) {
	const keys = getMatrixScopedEnvVarNames(accountId);
	return {
		homeserver: clean(env[keys.homeserver]),
		userId: clean(env[keys.userId]),
		accessToken: clean(env[keys.accessToken]) || void 0,
		password: clean(env[keys.password]) || void 0,
		deviceId: clean(env[keys.deviceId]) || void 0,
		deviceName: clean(env[keys.deviceName]) || void 0
	};
}
function resolveMatrixAccountAuthView(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const matrix = resolveMatrixBaseConfig(params.cfg);
	const account = findMatrixAccountConfig(params.cfg, normalizedAccountId) ?? {};
	const resolvedStrings = resolveMatrixAccountStringValues({
		accountId: normalizedAccountId,
		account: {
			homeserver: clean(account.homeserver),
			userId: clean(account.userId),
			accessToken: typeof account.accessToken === "string" ? clean(account.accessToken) : "",
			password: typeof account.password === "string" ? clean(account.password) : "",
			deviceId: clean(account.deviceId),
			deviceName: clean(account.deviceName)
		},
		scopedEnv: resolveScopedMatrixEnvConfig(normalizedAccountId, params.env),
		channel: {
			homeserver: clean(matrix.homeserver),
			userId: clean(matrix.userId),
			accessToken: typeof matrix.accessToken === "string" ? clean(matrix.accessToken) : "",
			password: typeof matrix.password === "string" ? clean(matrix.password) : "",
			deviceId: clean(matrix.deviceId),
			deviceName: clean(matrix.deviceName)
		},
		globalEnv: resolveGlobalMatrixEnvConfig(params.env)
	});
	return {
		homeserver: resolvedStrings.homeserver,
		userId: resolvedStrings.userId,
		accessToken: resolvedStrings.accessToken || void 0,
		password: resolvedStrings.password || void 0
	};
}
function resolveMatrixAccountUserId(params) {
	const env = params.env ?? process.env;
	const authView = resolveMatrixAccountAuthView({
		cfg: params.cfg,
		accountId: params.accountId,
		env
	});
	const configuredUserId = authView.userId.trim();
	if (configuredUserId) return configuredUserId;
	const stored = loadMatrixCredentials(env, params.accountId);
	if (!stored) return null;
	if (authView.homeserver && stored.homeserver !== authView.homeserver) return null;
	if (authView.accessToken && stored.accessToken !== authView.accessToken) return null;
	return stored.userId.trim() || null;
}
function listMatrixAccountIds(cfg) {
	const ids = resolveConfiguredMatrixAccountIds(cfg, process.env);
	return ids.length > 0 ? ids : [DEFAULT_ACCOUNT_ID];
}
function resolveDefaultMatrixAccountId(cfg) {
	return normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg));
}
function resolveConfiguredMatrixBotUserIds(params) {
	const env = params.env ?? process.env;
	const currentAccountId = normalizeAccountId(params.accountId);
	const accountIds = new Set(resolveConfiguredMatrixAccountIds(params.cfg, env));
	if (resolveMatrixAccount({
		cfg: params.cfg,
		accountId: "default",
		env
	}).configured) accountIds.add(DEFAULT_ACCOUNT_ID);
	const ids = /* @__PURE__ */ new Set();
	for (const accountId of accountIds) {
		if (normalizeAccountId(accountId) === currentAccountId) continue;
		if (!resolveMatrixAccount({
			cfg: params.cfg,
			accountId,
			env
		}).configured) continue;
		const userId = resolveMatrixAccountUserId({
			cfg: params.cfg,
			accountId,
			env
		});
		if (userId) ids.add(userId);
	}
	return ids;
}
function resolveMatrixAccount(params) {
	const env = params.env ?? process.env;
	const accountId = normalizeAccountId(params.accountId);
	const matrixBase = resolveMatrixBaseConfig(params.cfg);
	const base = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId,
		env
	});
	const explicitAuthConfig = accountId === "default" ? base : findMatrixAccountConfig(params.cfg, accountId) ?? {};
	const enabled = base.enabled !== false && matrixBase.enabled !== false;
	const authView = resolveMatrixAccountAuthView({
		cfg: params.cfg,
		accountId,
		env
	});
	const hasHomeserver = Boolean(authView.homeserver);
	const hasUserId = Boolean(authView.userId);
	const hasAccessToken = Boolean(authView.accessToken) || hasConfiguredSecretInput(explicitAuthConfig.accessToken);
	const hasPassword = Boolean(authView.password);
	const hasPasswordAuth = hasUserId && (hasPassword || hasConfiguredSecretInput(explicitAuthConfig.password));
	const stored = loadMatrixCredentials(env, accountId);
	const hasStored = stored && authView.homeserver ? credentialsMatchConfig(stored, {
		homeserver: authView.homeserver,
		userId: authView.userId || ""
	}) : false;
	const configured = hasHomeserver && (hasAccessToken || hasPasswordAuth || Boolean(hasStored));
	return {
		accountId,
		enabled,
		name: base.name?.trim() || void 0,
		configured,
		homeserver: authView.homeserver || void 0,
		userId: authView.userId || void 0,
		config: base
	};
}
//#endregion
export { resolveMatrixAccount as i, resolveConfiguredMatrixBotUserIds as n, resolveDefaultMatrixAccountId as r, listMatrixAccountIds as t };
