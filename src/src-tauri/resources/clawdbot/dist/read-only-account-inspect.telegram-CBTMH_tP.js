import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import { l as resolveDefaultSecretProviderAlias } from "./ref-contract-BW7up38N.js";
import { t as resolveAccountEntry } from "./account-lookup-DI_0omIr.js";
import { i as listCombinedAccountIds, o as resolveListedDefaultAccountId } from "./account-helpers-DqNwQN08.js";
import { n as resolveAccountWithDefaultFallback } from "./account-core-C5WQtrMO.js";
import { i as resolveDefaultAgentBoundAccountId, r as listBoundAccountIds } from "./bindings-CxBQdMiO.js";
import { i as tryReadSecretFileSync } from "./secret-file-DtXtlZpO.js";
import "./provider-auth-rTeK2_Yu.js";
//#region src/channels/read-only-account-inspect.telegram.ts
function normalizeTelegramAllowFromEntry(raw) {
	return (typeof raw === "string" ? raw : typeof raw === "number" ? String(raw) : "").trim().replace(/^(telegram|tg):/i, "").trim();
}
function isNumericTelegramUserId(raw) {
	return /^-?\d+$/.test(raw);
}
function listConfiguredAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	for (const key of Object.keys(cfg.channels?.telegram?.accounts ?? {})) if (key) ids.add(normalizeAccountId(key));
	return [...ids];
}
function listTelegramAccountIds(cfg) {
	return listCombinedAccountIds({
		configuredAccountIds: listConfiguredAccountIds(cfg),
		additionalAccountIds: listBoundAccountIds(cfg, "telegram"),
		fallbackAccountIdWhenEmpty: DEFAULT_ACCOUNT_ID
	});
}
function resolveDefaultTelegramAccountId(cfg) {
	const boundDefault = resolveDefaultAgentBoundAccountId(cfg, "telegram");
	if (boundDefault) return boundDefault;
	return resolveListedDefaultAccountId({
		accountIds: listTelegramAccountIds(cfg),
		configuredDefaultAccountId: normalizeOptionalAccountId(cfg.channels?.telegram?.defaultAccount)
	});
}
function resolveTelegramAccountConfig(cfg, accountId) {
	return resolveAccountEntry(cfg.channels?.telegram?.accounts, normalizeAccountId(accountId));
}
function mergeTelegramAccountConfig(cfg, accountId) {
	const { accounts: _ignored, defaultAccount: _ignoredDefaultAccount, groups: channelGroups, ...base } = cfg.channels?.telegram ?? {};
	const account = resolveTelegramAccountConfig(cfg, accountId) ?? {};
	const configuredAccountIds = Object.keys(cfg.channels?.telegram?.accounts ?? {});
	const groups = account.groups ?? (configuredAccountIds.length > 1 ? void 0 : channelGroups);
	return {
		...base,
		...account,
		groups
	};
}
function inspectTokenFile(pathValue) {
	const tokenFile = typeof pathValue === "string" ? pathValue.trim() : "";
	if (!tokenFile) return null;
	const token = tryReadSecretFileSync(tokenFile, "Telegram bot token", { rejectSymlink: true });
	return {
		token: token ?? "",
		tokenSource: "tokenFile",
		tokenStatus: token ? "available" : "configured_unavailable"
	};
}
function canResolveEnvSecretRefInReadOnlyPath(params) {
	const providerConfig = params.cfg.secrets?.providers?.[params.provider];
	if (!providerConfig) return params.provider === resolveDefaultSecretProviderAlias(params.cfg, "env");
	if (providerConfig.source !== "env") return false;
	const allowlist = providerConfig.allowlist;
	return !allowlist || allowlist.includes(params.id);
}
function hasConfiguredSecretInput(value) {
	return Boolean(coerceSecretRef(value) || typeof value === "string" && value.trim());
}
function normalizeSecretInputString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function inspectTokenValue(params) {
	const ref = coerceSecretRef(params.value, params.cfg.secrets?.defaults);
	if (ref?.source === "env") {
		if (!canResolveEnvSecretRefInReadOnlyPath({
			cfg: params.cfg,
			provider: ref.provider,
			id: ref.id
		})) return {
			token: "",
			tokenSource: "env",
			tokenStatus: "configured_unavailable"
		};
		const envValue = process.env[ref.id];
		if (envValue && envValue.trim()) return {
			token: envValue.trim(),
			tokenSource: "env",
			tokenStatus: "available"
		};
		return {
			token: "",
			tokenSource: "env",
			tokenStatus: "configured_unavailable"
		};
	}
	const token = normalizeSecretInputString(params.value);
	if (token) return {
		token,
		tokenSource: "config",
		tokenStatus: "available"
	};
	if (hasConfiguredSecretInput(params.value)) return {
		token: "",
		tokenSource: "config",
		tokenStatus: "configured_unavailable"
	};
	return null;
}
function inspectTelegramAccountPrimary(params) {
	const accountId = normalizeAccountId(params.accountId);
	const merged = mergeTelegramAccountConfig(params.cfg, accountId);
	const enabled = params.cfg.channels?.telegram?.enabled !== false && merged.enabled !== false;
	const accountConfig = resolveTelegramAccountConfig(params.cfg, accountId);
	const accountTokenFile = inspectTokenFile(accountConfig?.tokenFile);
	if (accountTokenFile) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: accountTokenFile.token,
		tokenSource: accountTokenFile.tokenSource,
		tokenStatus: accountTokenFile.tokenStatus,
		configured: accountTokenFile.tokenStatus !== "missing",
		config: merged
	};
	const accountToken = inspectTokenValue({
		cfg: params.cfg,
		value: accountConfig?.botToken
	});
	if (accountToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: accountToken.token,
		tokenSource: accountToken.tokenSource,
		tokenStatus: accountToken.tokenStatus,
		configured: accountToken.tokenStatus !== "missing",
		config: merged
	};
	const channelTokenFile = inspectTokenFile(params.cfg.channels?.telegram?.tokenFile);
	if (channelTokenFile) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: channelTokenFile.token,
		tokenSource: channelTokenFile.tokenSource,
		tokenStatus: channelTokenFile.tokenStatus,
		configured: channelTokenFile.tokenStatus !== "missing",
		config: merged
	};
	const channelToken = inspectTokenValue({
		cfg: params.cfg,
		value: params.cfg.channels?.telegram?.botToken
	});
	if (channelToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: channelToken.token,
		tokenSource: channelToken.tokenSource,
		tokenStatus: channelToken.tokenStatus,
		configured: channelToken.tokenStatus !== "missing",
		config: merged
	};
	const envToken = accountId === "default" ? (params.envToken ?? process.env.TELEGRAM_BOT_TOKEN)?.trim() : "";
	if (envToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: envToken,
		tokenSource: "env",
		tokenStatus: "available",
		configured: true,
		config: merged
	};
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config: merged
	};
}
function inspectTelegramAccount(params) {
	return resolveAccountWithDefaultFallback({
		accountId: params.accountId,
		normalizeAccountId,
		resolvePrimary: (accountId) => inspectTelegramAccountPrimary({
			cfg: params.cfg,
			accountId,
			envToken: params.envToken
		}),
		hasCredential: (account) => account.tokenSource !== "none",
		resolveDefaultAccountId: () => resolveDefaultTelegramAccountId(params.cfg)
	});
}
//#endregion
export { resolveDefaultTelegramAccountId as a, normalizeTelegramAllowFromEntry as i, isNumericTelegramUserId as n, listTelegramAccountIds as r, inspectTelegramAccount as t };
