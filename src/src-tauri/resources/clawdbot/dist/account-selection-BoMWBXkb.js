import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import { n as resolveNormalizedAccountEntry } from "./account-lookup-DI_0omIr.js";
import { i as listCombinedAccountIds, o as resolveListedDefaultAccountId } from "./account-helpers-DqNwQN08.js";
import { t as listConfiguredAccountIds } from "./account-core-C5WQtrMO.js";
import "./secret-input-C8U7qpTM.js";
//#region extensions/matrix/src/auth-precedence.ts
const MATRIX_DEFAULT_ACCOUNT_AUTH_ONLY_FIELDS = new Set([
	"userId",
	"accessToken",
	"password",
	"deviceId"
]);
function resolveMatrixStringSourceValue(value) {
	return typeof value === "string" ? value : "";
}
function shouldAllowBaseAuthFallback(accountId, field) {
	return normalizeAccountId(accountId) === "default" || !MATRIX_DEFAULT_ACCOUNT_AUTH_ONLY_FIELDS.has(field);
}
function resolveMatrixAccountStringValues(params) {
	const fields = [
		"homeserver",
		"userId",
		"accessToken",
		"password",
		"deviceId",
		"deviceName"
	];
	const resolved = {};
	for (const field of fields) resolved[field] = resolveMatrixStringSourceValue(params.account?.[field]) || resolveMatrixStringSourceValue(params.scopedEnv?.[field]) || (shouldAllowBaseAuthFallback(params.accountId, field) ? resolveMatrixStringSourceValue(params.channel?.[field]) || resolveMatrixStringSourceValue(params.globalEnv?.[field]) : "");
	return resolved;
}
//#endregion
//#region extensions/matrix/src/env-vars.ts
const MATRIX_SCOPED_ENV_SUFFIXES = [
	"HOMESERVER",
	"USER_ID",
	"ACCESS_TOKEN",
	"PASSWORD",
	"DEVICE_ID",
	"DEVICE_NAME"
];
const MATRIX_GLOBAL_ENV_KEYS = MATRIX_SCOPED_ENV_SUFFIXES.map((suffix) => `MATRIX_${suffix}`);
const MATRIX_SCOPED_ENV_RE = new RegExp(`^MATRIX_(.+)_(${MATRIX_SCOPED_ENV_SUFFIXES.join("|")})$`);
function resolveMatrixEnvAccountToken(accountId) {
	return Array.from(normalizeAccountId(accountId)).map((char) => /[a-z0-9]/.test(char) ? char.toUpperCase() : `_X${char.codePointAt(0)?.toString(16).toUpperCase() ?? "00"}_`).join("");
}
function getMatrixScopedEnvVarNames(accountId) {
	const token = resolveMatrixEnvAccountToken(accountId);
	return {
		homeserver: `MATRIX_${token}_HOMESERVER`,
		userId: `MATRIX_${token}_USER_ID`,
		accessToken: `MATRIX_${token}_ACCESS_TOKEN`,
		password: `MATRIX_${token}_PASSWORD`,
		deviceId: `MATRIX_${token}_DEVICE_ID`,
		deviceName: `MATRIX_${token}_DEVICE_NAME`
	};
}
function decodeMatrixEnvAccountToken(token) {
	let decoded = "";
	for (let index = 0; index < token.length;) {
		const hexEscape = /^_X([0-9A-F]+)_/.exec(token.slice(index));
		if (hexEscape) {
			const hex = hexEscape[1];
			const codePoint = hex ? Number.parseInt(hex, 16) : NaN;
			if (!Number.isFinite(codePoint)) return;
			decoded += String.fromCodePoint(codePoint);
			index += hexEscape[0].length;
			continue;
		}
		const char = token[index];
		if (!char || !/[A-Z0-9]/.test(char)) return;
		decoded += char.toLowerCase();
		index += 1;
	}
	const normalized = normalizeOptionalAccountId(decoded);
	if (!normalized) return;
	return resolveMatrixEnvAccountToken(normalized) === token ? normalized : void 0;
}
function listMatrixEnvAccountIds(env = process.env) {
	const ids = /* @__PURE__ */ new Set();
	for (const key of MATRIX_GLOBAL_ENV_KEYS) if (typeof env[key] === "string" && env[key]?.trim()) {
		ids.add(normalizeAccountId("default"));
		break;
	}
	for (const key of Object.keys(env)) {
		const match = MATRIX_SCOPED_ENV_RE.exec(key);
		if (!match) continue;
		const accountId = decodeMatrixEnvAccountToken(match[1]);
		if (accountId) ids.add(accountId);
	}
	return Array.from(ids).toSorted((a, b) => a.localeCompare(b));
}
//#endregion
//#region extensions/matrix/src/account-selection.ts
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function readConfiguredMatrixString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function readConfiguredMatrixSecretSource(value) {
	return hasConfiguredSecretInput(value) ? "configured" : "";
}
function resolveMatrixChannelStringSources(entry) {
	if (!entry) return {};
	return {
		homeserver: readConfiguredMatrixString(entry.homeserver),
		userId: readConfiguredMatrixString(entry.userId),
		accessToken: readConfiguredMatrixSecretSource(entry.accessToken),
		password: readConfiguredMatrixSecretSource(entry.password),
		deviceId: readConfiguredMatrixString(entry.deviceId),
		deviceName: readConfiguredMatrixString(entry.deviceName)
	};
}
function readEnvMatrixString(env, key) {
	const value = env[key];
	return typeof value === "string" ? value.trim() : "";
}
function resolveScopedMatrixEnvStringSources(accountId, env) {
	const keys = getMatrixScopedEnvVarNames(accountId);
	return {
		homeserver: readEnvMatrixString(env, keys.homeserver),
		userId: readEnvMatrixString(env, keys.userId),
		accessToken: readEnvMatrixString(env, keys.accessToken),
		password: readEnvMatrixString(env, keys.password),
		deviceId: readEnvMatrixString(env, keys.deviceId),
		deviceName: readEnvMatrixString(env, keys.deviceName)
	};
}
function resolveGlobalMatrixEnvStringSources(env) {
	return {
		homeserver: readEnvMatrixString(env, "MATRIX_HOMESERVER"),
		userId: readEnvMatrixString(env, "MATRIX_USER_ID"),
		accessToken: readEnvMatrixString(env, "MATRIX_ACCESS_TOKEN"),
		password: readEnvMatrixString(env, "MATRIX_PASSWORD"),
		deviceId: readEnvMatrixString(env, "MATRIX_DEVICE_ID"),
		deviceName: readEnvMatrixString(env, "MATRIX_DEVICE_NAME")
	};
}
function hasUsableResolvedMatrixAuth(values) {
	return Boolean(values.homeserver && (values.accessToken || values.userId));
}
function hasFreshResolvedMatrixAuth(values) {
	return Boolean(values.homeserver && (values.accessToken || values.userId && values.password));
}
function resolveEffectiveMatrixAccountSources(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	return resolveMatrixAccountStringValues({
		accountId: normalizedAccountId,
		scopedEnv: resolveScopedMatrixEnvStringSources(normalizedAccountId, params.env),
		channel: resolveMatrixChannelStringSources(params.channel),
		globalEnv: resolveGlobalMatrixEnvStringSources(params.env)
	});
}
function hasUsableEffectiveMatrixAccountSource(params) {
	return hasUsableResolvedMatrixAuth(resolveEffectiveMatrixAccountSources(params));
}
function hasFreshEffectiveMatrixAccountSource(params) {
	return hasFreshResolvedMatrixAuth(resolveEffectiveMatrixAccountSources(params));
}
function hasConfiguredDefaultMatrixAccountSource(params) {
	return hasFreshEffectiveMatrixAccountSource({
		channel: params.channel,
		accountId: DEFAULT_ACCOUNT_ID,
		env: params.env
	});
}
function resolveMatrixChannelConfig(cfg) {
	return isRecord(cfg.channels?.matrix) ? cfg.channels.matrix : null;
}
function findMatrixAccountEntry(cfg, accountId) {
	const channel = resolveMatrixChannelConfig(cfg);
	if (!channel) return null;
	const accounts = isRecord(channel.accounts) ? channel.accounts : null;
	if (!accounts) return null;
	const entry = resolveNormalizedAccountEntry(accounts, accountId, normalizeAccountId);
	return isRecord(entry) ? entry : null;
}
function resolveConfiguredMatrixAccountIds(cfg, env = process.env) {
	const channel = resolveMatrixChannelConfig(cfg);
	const configuredAccountIds = listConfiguredAccountIds({
		accounts: channel && isRecord(channel.accounts) ? channel.accounts : void 0,
		normalizeAccountId
	});
	if (hasConfiguredDefaultMatrixAccountSource({
		channel,
		env
	})) configuredAccountIds.push(DEFAULT_ACCOUNT_ID);
	return listCombinedAccountIds({
		configuredAccountIds,
		additionalAccountIds: listMatrixEnvAccountIds(env).filter((accountId) => normalizeAccountId(accountId) === "default" ? hasConfiguredDefaultMatrixAccountSource({
			channel,
			env
		}) : hasUsableEffectiveMatrixAccountSource({
			channel,
			accountId,
			env
		})),
		fallbackAccountIdWhenEmpty: channel ? DEFAULT_ACCOUNT_ID : void 0
	});
}
function resolveMatrixDefaultOrOnlyAccountId(cfg, env = process.env) {
	const channel = resolveMatrixChannelConfig(cfg);
	if (!channel) return DEFAULT_ACCOUNT_ID;
	const configuredDefault = normalizeOptionalAccountId(typeof channel.defaultAccount === "string" ? channel.defaultAccount : void 0);
	return resolveListedDefaultAccountId({
		accountIds: resolveConfiguredMatrixAccountIds(cfg, env),
		configuredDefaultAccountId: configuredDefault,
		ambiguousFallbackAccountId: DEFAULT_ACCOUNT_ID
	});
}
function requiresExplicitMatrixDefaultAccount(cfg, env = process.env) {
	const channel = resolveMatrixChannelConfig(cfg);
	if (!channel) return false;
	const configuredAccountIds = resolveConfiguredMatrixAccountIds(cfg, env);
	if (configuredAccountIds.length <= 1) return false;
	const configuredDefault = normalizeOptionalAccountId(typeof channel.defaultAccount === "string" ? channel.defaultAccount : void 0);
	return !(configuredDefault && configuredAccountIds.includes(configuredDefault));
}
//#endregion
export { resolveMatrixDefaultOrOnlyAccountId as a, resolveMatrixEnvAccountToken as c, resolveMatrixChannelConfig as i, resolveMatrixAccountStringValues as l, requiresExplicitMatrixDefaultAccount as n, getMatrixScopedEnvVarNames as o, resolveConfiguredMatrixAccountIds as r, listMatrixEnvAccountIds as s, findMatrixAccountEntry as t };
