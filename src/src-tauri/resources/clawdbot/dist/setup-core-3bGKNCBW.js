import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { t as applyAccountNameToChannelSection, u as prepareScopedSetupConfig } from "./setup-helpers-CjYO5YkF.js";
import "./setup-CPpe7OZc.js";
import { o as getMatrixScopedEnvVarNames } from "./account-selection-BoMWBXkb.js";
import { t as updateMatrixAccountConfig } from "./config-update-CQz1brXo.js";
//#region extensions/matrix/src/matrix/client/env-auth.ts
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
function resolveScopedMatrixEnvConfig(accountId, env = process.env) {
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
function hasReadyMatrixEnvAuth(config) {
	const homeserver = clean(config.homeserver);
	const userId = clean(config.userId);
	const accessToken = clean(config.accessToken);
	const password = clean(config.password);
	return Boolean(homeserver && (accessToken || userId && password));
}
function resolveMatrixEnvAuthReadiness(accountId, env = process.env) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const scoped = resolveScopedMatrixEnvConfig(normalizedAccountId, env);
	if (normalizedAccountId !== "default") {
		const keys = getMatrixScopedEnvVarNames(normalizedAccountId);
		return {
			ready: hasReadyMatrixEnvAuth(scoped),
			homeserver: scoped.homeserver || void 0,
			userId: scoped.userId || void 0,
			sourceHint: `${keys.homeserver} (+ auth vars)`,
			missingMessage: `Set per-account env vars for "${normalizedAccountId}" (for example ${keys.homeserver} + ${keys.accessToken} or ${keys.userId} + ${keys.password}).`
		};
	}
	const defaultScoped = resolveScopedMatrixEnvConfig(DEFAULT_ACCOUNT_ID, env);
	const global = resolveGlobalMatrixEnvConfig(env);
	const defaultKeys = getMatrixScopedEnvVarNames(DEFAULT_ACCOUNT_ID);
	return {
		ready: hasReadyMatrixEnvAuth(defaultScoped) || hasReadyMatrixEnvAuth(global),
		homeserver: defaultScoped.homeserver || global.homeserver || void 0,
		userId: defaultScoped.userId || global.userId || void 0,
		sourceHint: "MATRIX_* or MATRIX_DEFAULT_*",
		missingMessage: `Set Matrix env vars for the default account (for example MATRIX_HOMESERVER + MATRIX_ACCESS_TOKEN, MATRIX_USER_ID + MATRIX_PASSWORD, or ${defaultKeys.homeserver} + ${defaultKeys.accessToken}).`
	};
}
//#endregion
//#region extensions/matrix/src/setup-config.ts
const channel$1 = "matrix";
const COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE = new Set([
	"name",
	"enabled",
	"httpPort",
	"webhookPath",
	"webhookUrl",
	"webhookSecret",
	"service",
	"region",
	"homeserver",
	"userId",
	"accessToken",
	"password",
	"deviceName",
	"url",
	"code",
	"dmPolicy",
	"allowFrom",
	"groupPolicy",
	"groupAllowFrom",
	"defaultTo"
]);
const MATRIX_SINGLE_ACCOUNT_KEYS_TO_MOVE = new Set([
	"deviceId",
	"avatarUrl",
	"initialSyncLimit",
	"encryption",
	"allowlistOnly",
	"allowBots",
	"blockStreaming",
	"replyToMode",
	"threadReplies",
	"textChunkLimit",
	"chunkMode",
	"responsePrefix",
	"ackReaction",
	"ackReactionScope",
	"reactionNotifications",
	"threadBindings",
	"startupVerification",
	"startupVerificationCooldownHours",
	"mediaMaxMb",
	"autoJoin",
	"autoJoinAllowlist",
	"dm",
	"groups",
	"rooms",
	"actions"
]);
const MATRIX_NAMED_ACCOUNT_PROMOTION_KEYS = new Set([
	"name",
	"homeserver",
	"userId",
	"accessToken",
	"password",
	"deviceId",
	"deviceName",
	"avatarUrl",
	"initialSyncLimit",
	"encryption"
]);
function cloneIfObject(value) {
	if (value && typeof value === "object") return structuredClone(value);
	return value;
}
function moveSingleMatrixAccountConfigToNamedAccount(cfg) {
	const baseConfig = cfg.channels?.[channel$1];
	const base = typeof baseConfig === "object" && baseConfig ? baseConfig : void 0;
	if (!base) return cfg;
	const accounts = typeof base.accounts === "object" && base.accounts ? base.accounts : {};
	const hasNamedAccounts = Object.keys(accounts).filter(Boolean).length > 0;
	const keysToMove = Object.entries(base).filter(([key, value]) => {
		if (key === "accounts" || key === "enabled" || value === void 0) return false;
		if (!COMMON_SINGLE_ACCOUNT_KEYS_TO_MOVE.has(key) && !MATRIX_SINGLE_ACCOUNT_KEYS_TO_MOVE.has(key)) return false;
		if (hasNamedAccounts && !MATRIX_NAMED_ACCOUNT_PROMOTION_KEYS.has(key)) return false;
		return true;
	}).map(([key]) => key);
	if (keysToMove.length === 0) return cfg;
	const defaultAccount = typeof base.defaultAccount === "string" && base.defaultAccount.trim() ? normalizeAccountId(base.defaultAccount) : void 0;
	const targetAccountId = defaultAccount && defaultAccount !== "default" ? Object.entries(accounts).find(([accountId, value]) => accountId && value && typeof value === "object" && normalizeAccountId(accountId) === defaultAccount)?.[0] ?? "default" : defaultAccount ?? (Object.keys(accounts).filter(Boolean).length === 1 ? Object.keys(accounts).filter(Boolean)[0] : "default");
	const nextAccount = { ...accounts[targetAccountId] ?? {} };
	for (const key of keysToMove) nextAccount[key] = cloneIfObject(base[key]);
	const nextChannel = { ...base };
	for (const key of keysToMove) delete nextChannel[key];
	return {
		...cfg,
		channels: {
			...cfg.channels,
			[channel$1]: {
				...nextChannel,
				accounts: {
					...accounts,
					[targetAccountId]: nextAccount
				}
			}
		}
	};
}
function validateMatrixSetupInput(params) {
	if (params.input.useEnv) {
		const envReadiness = resolveMatrixEnvAuthReadiness(params.accountId, process.env);
		return envReadiness.ready ? null : envReadiness.missingMessage;
	}
	if (!params.input.homeserver?.trim()) return "Matrix requires --homeserver";
	const accessToken = params.input.accessToken?.trim();
	const password = normalizeSecretInputString(params.input.password);
	const userId = params.input.userId?.trim();
	if (!accessToken && !password) return "Matrix requires --access-token or --password";
	if (!accessToken) {
		if (!userId) return "Matrix requires --user-id when using --password";
		if (!password) return "Matrix requires --password when using --user-id";
	}
	return null;
}
function applyMatrixSetupAccountConfig(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const next = applyAccountNameToChannelSection({
		cfg: normalizedAccountId !== "default" ? moveSingleMatrixAccountConfigToNamedAccount(params.cfg) : params.cfg,
		channelKey: channel$1,
		accountId: normalizedAccountId,
		name: params.input.name
	});
	if (params.input.useEnv) return updateMatrixAccountConfig(next, normalizedAccountId, {
		enabled: true,
		homeserver: null,
		allowPrivateNetwork: null,
		proxy: null,
		userId: null,
		accessToken: null,
		password: null,
		deviceId: null,
		deviceName: null
	});
	const accessToken = params.input.accessToken?.trim();
	const password = normalizeSecretInputString(params.input.password);
	const userId = params.input.userId?.trim();
	return updateMatrixAccountConfig(next, normalizedAccountId, {
		enabled: true,
		homeserver: params.input.homeserver?.trim(),
		allowPrivateNetwork: typeof params.input.allowPrivateNetwork === "boolean" ? params.input.allowPrivateNetwork : void 0,
		proxy: params.input.proxy?.trim() || void 0,
		userId: password && !userId ? null : userId,
		accessToken: accessToken || (password ? null : void 0),
		password: password || (accessToken ? null : void 0),
		deviceName: params.input.deviceName?.trim(),
		avatarUrl: params.avatarUrl,
		initialSyncLimit: params.input.initialSyncLimit
	});
}
//#endregion
//#region extensions/matrix/src/setup-core.ts
const channel = "matrix";
function resolveMatrixSetupAccountId(params) {
	return normalizeAccountId(params.accountId?.trim() || params.name?.trim() || "default");
}
const matrixSetupAdapter = {
	resolveAccountId: ({ accountId, input }) => resolveMatrixSetupAccountId({
		accountId,
		name: input?.name
	}),
	resolveBindingAccountId: ({ accountId, agentId }) => resolveMatrixSetupAccountId({
		accountId,
		name: agentId
	}),
	applyAccountName: ({ cfg, accountId, name }) => prepareScopedSetupConfig({
		cfg,
		channelKey: channel,
		accountId,
		name
	}),
	validateInput: ({ accountId, input }) => validateMatrixSetupInput({
		accountId,
		input
	}),
	applyAccountConfig: ({ cfg, accountId, input }) => applyMatrixSetupAccountConfig({
		cfg,
		accountId,
		input
	}),
	afterAccountConfigWritten: async ({ previousCfg, cfg, accountId, runtime }) => {
		const { runMatrixSetupBootstrapAfterConfigWrite } = await import("./setup-bootstrap-DZkSEpgL.js");
		await runMatrixSetupBootstrapAfterConfigWrite({
			previousCfg,
			cfg,
			accountId,
			runtime
		});
	}
};
//#endregion
export { resolveMatrixEnvAuthReadiness as n, matrixSetupAdapter as t };
