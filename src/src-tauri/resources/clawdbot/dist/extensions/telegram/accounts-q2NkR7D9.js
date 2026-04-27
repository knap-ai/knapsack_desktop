import { n as resolveTelegramAccountConfig, t as mergeTelegramAccountConfig } from "./account-config-Cifs-fXF.js";
import { r as resolveDefaultTelegramAccountSelection, t as listTelegramAccountIds$1 } from "./account-selection-CejmBnAP.js";
import { createAccountActionGate, normalizeAccountId, normalizeOptionalAccountId, resolveAccountWithDefaultFallback, resolveNormalizedAccountEntry } from "openclaw/plugin-sdk/account-core";
import { tryReadSecretFileSync } from "openclaw/plugin-sdk/channel-core";
import { resolveDefaultSecretProviderAlias } from "openclaw/plugin-sdk/provider-auth";
import { DEFAULT_ACCOUNT_ID, formatSetExplicitDefaultInstruction, normalizeAccountId as normalizeAccountId$1 } from "openclaw/plugin-sdk/routing";
import { normalizeSecretInputString, resolveSecretInputString } from "openclaw/plugin-sdk/secret-input";
import util from "node:util";
import { createSubsystemLogger, isTruthyEnvValue } from "openclaw/plugin-sdk/runtime-env";
import { normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
//#region extensions/telegram/src/token.ts
function resolveEnvSecretRefValue(params) {
	const providerConfig = params.cfg?.secrets?.providers?.[params.provider];
	if (providerConfig) {
		if (providerConfig.source !== "env") throw new Error(`Secret provider "${params.provider}" has source "${providerConfig.source}" but ref requests "env".`);
		if (providerConfig.allowlist && !providerConfig.allowlist.includes(params.id)) throw new Error(`Environment variable "${params.id}" is not allowlisted in secrets.providers.${params.provider}.allowlist.`);
	} else if (params.provider !== resolveDefaultSecretProviderAlias({ secrets: params.cfg?.secrets }, "env")) throw new Error(`Secret provider "${params.provider}" is not configured (ref: env:${params.provider}:${params.id}).`);
	return normalizeSecretInputString((params.env ?? process.env)[params.id]);
}
function resolveRuntimeTokenValue(params) {
	const resolved = resolveSecretInputString({
		value: params.value,
		path: params.path,
		defaults: params.cfg?.secrets?.defaults,
		mode: "inspect"
	});
	if (resolved.status === "available") return {
		status: "available",
		value: resolved.value
	};
	if (resolved.status === "missing") return { status: "missing" };
	if (resolved.ref.source === "env") {
		const envValue = resolveEnvSecretRefValue({
			cfg: params.cfg,
			provider: resolved.ref.provider,
			id: resolved.ref.id
		});
		if (envValue) return {
			status: "available",
			value: envValue
		};
		return { status: "configured_unavailable" };
	}
	resolveSecretInputString({
		value: params.value,
		path: params.path,
		defaults: params.cfg?.secrets?.defaults,
		mode: "strict"
	});
	return { status: "configured_unavailable" };
}
function resolveTelegramToken(cfg, opts = {}) {
	const accountId = normalizeAccountId$1(opts.accountId);
	const telegramCfg = cfg?.channels?.telegram;
	const resolveAccountCfg = (id) => {
		const accounts = telegramCfg?.accounts;
		return Array.isArray(accounts) ? void 0 : resolveNormalizedAccountEntry(accounts, id, normalizeAccountId$1);
	};
	const accountCfg = resolveAccountCfg(accountId !== DEFAULT_ACCOUNT_ID ? accountId : DEFAULT_ACCOUNT_ID);
	if (accountId !== DEFAULT_ACCOUNT_ID && !accountCfg) {
		const accounts = telegramCfg?.accounts;
		if (!!accounts && typeof accounts === "object" && !Array.isArray(accounts) && Object.keys(accounts).length > 0) {
			opts.logMissingFile?.(`channels.telegram.accounts: unknown accountId "${accountId}" — not found in config, refusing channel-level fallback`);
			return {
				token: "",
				source: "none"
			};
		}
	}
	const accountTokenFile = accountCfg?.tokenFile?.trim();
	if (accountTokenFile) {
		const token = tryReadSecretFileSync(accountTokenFile, `channels.telegram.accounts.${accountId}.tokenFile`, { rejectSymlink: true });
		if (token) return {
			token,
			source: "tokenFile"
		};
		opts.logMissingFile?.(`channels.telegram.accounts.${accountId}.tokenFile not found or unreadable: ${accountTokenFile}`);
		return {
			token: "",
			source: "none"
		};
	}
	const accountToken = resolveRuntimeTokenValue({
		cfg,
		value: accountCfg?.botToken,
		path: `channels.telegram.accounts.${accountId}.botToken`
	});
	if (accountToken.status === "available") return {
		token: accountToken.value,
		source: "config"
	};
	if (accountToken.status === "configured_unavailable") return {
		token: "",
		source: "none"
	};
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const tokenFile = telegramCfg?.tokenFile?.trim();
	if (tokenFile) {
		const token = tryReadSecretFileSync(tokenFile, "channels.telegram.tokenFile", { rejectSymlink: true });
		if (token) return {
			token,
			source: "tokenFile"
		};
		opts.logMissingFile?.(`channels.telegram.tokenFile not found or unreadable: ${tokenFile}`);
		return {
			token: "",
			source: "none"
		};
	}
	const configToken = resolveRuntimeTokenValue({
		cfg,
		value: telegramCfg?.botToken,
		path: "channels.telegram.botToken"
	});
	if (configToken.status === "available") return {
		token: configToken.value,
		source: "config"
	};
	if (configToken.status === "configured_unavailable") return {
		token: "",
		source: "none"
	};
	const envToken = allowEnv ? (opts.envToken ?? process.env.TELEGRAM_BOT_TOKEN)?.trim() : "";
	if (envToken) return {
		token: envToken,
		source: "env"
	};
	return {
		token: "",
		source: "none"
	};
}
//#endregion
//#region extensions/telegram/src/accounts.ts
let log = null;
function getLog() {
	if (!log) log = createSubsystemLogger("telegram/accounts");
	return log;
}
function formatDebugArg(value) {
	if (typeof value === "string") return value;
	if (value instanceof Error) return value.stack ?? value.message;
	return util.inspect(value, {
		colors: false,
		depth: null,
		compact: true,
		breakLength: Infinity
	});
}
const debugAccounts = (...args) => {
	if (isTruthyEnvValue(process.env.OPENCLAW_DEBUG_TELEGRAM_ACCOUNTS)) {
		const parts = args.map((arg) => formatDebugArg(arg));
		getLog().warn(parts.join(" ").trim());
	}
};
function listTelegramAccountIds(cfg) {
	const ids = listTelegramAccountIds$1(cfg);
	debugAccounts("listTelegramAccountIds", ids);
	return ids;
}
let emittedMissingDefaultWarn = false;
/** @internal Reset the once-per-process warning flag. Exported for tests only. */
function resetMissingDefaultWarnFlag() {
	emittedMissingDefaultWarn = false;
}
function resolveDefaultTelegramAccountId(cfg) {
	const selection = resolveDefaultTelegramAccountSelection(cfg);
	if (selection.shouldWarnMissingDefault && !emittedMissingDefaultWarn) {
		emittedMissingDefaultWarn = true;
		getLog().warn(`channels.telegram: accounts.default is missing; falling back to "${selection.accountId}". ${formatSetExplicitDefaultInstruction("telegram")} to avoid routing surprises in multi-account setups.`);
	}
	return selection.accountId;
}
function createTelegramActionGate(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultTelegramAccountId(params.cfg));
	return createAccountActionGate({
		baseActions: params.cfg.channels?.telegram?.actions,
		accountActions: resolveTelegramAccountConfig(params.cfg, accountId)?.actions
	});
}
function resolveTelegramMediaRuntimeOptions(params) {
	const normalizedAccountId = normalizeOptionalAccountId(params.accountId);
	const accountCfg = normalizedAccountId ? mergeTelegramAccountConfig(params.cfg, normalizedAccountId) : params.cfg.channels?.telegram;
	return {
		token: params.token,
		transport: params.transport,
		apiRoot: accountCfg?.apiRoot,
		trustedLocalFileRoots: accountCfg?.trustedLocalFileRoots,
		dangerouslyAllowPrivateNetwork: accountCfg?.network?.dangerouslyAllowPrivateNetwork
	};
}
function resolveTelegramPollActionGateState(isActionEnabled) {
	const sendMessageEnabled = isActionEnabled("sendMessage");
	const pollEnabled = isActionEnabled("poll");
	return {
		sendMessageEnabled,
		pollEnabled,
		enabled: sendMessageEnabled && pollEnabled
	};
}
function resolveTelegramAccount(params) {
	const baseEnabled = params.cfg.channels?.telegram?.enabled !== false;
	const resolve = (accountId) => {
		const merged = mergeTelegramAccountConfig(params.cfg, accountId);
		const accountEnabled = merged.enabled !== false;
		const enabled = baseEnabled && accountEnabled;
		const tokenResolution = resolveTelegramToken(params.cfg, { accountId });
		debugAccounts("resolve", {
			accountId,
			enabled,
			tokenSource: tokenResolution.source
		});
		return {
			accountId,
			enabled,
			name: normalizeOptionalString(merged.name),
			token: tokenResolution.token,
			tokenSource: tokenResolution.source,
			config: merged
		};
	};
	return resolveAccountWithDefaultFallback({
		accountId: params.accountId,
		normalizeAccountId,
		resolvePrimary: resolve,
		hasCredential: (account) => account.tokenSource !== "none",
		resolveDefaultAccountId: () => resolveDefaultTelegramAccountId(params.cfg)
	});
}
function listEnabledTelegramAccounts(cfg) {
	return listTelegramAccountIds(cfg).map((accountId) => resolveTelegramAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}
//#endregion
export { resolveDefaultTelegramAccountId as a, resolveTelegramPollActionGateState as c, resetMissingDefaultWarnFlag as i, resolveTelegramToken as l, listEnabledTelegramAccounts as n, resolveTelegramAccount as o, listTelegramAccountIds as r, resolveTelegramMediaRuntimeOptions as s, createTelegramActionGate as t };
