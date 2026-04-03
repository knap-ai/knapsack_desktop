import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { t as isTruthyEnvValue } from "./env-CjUKd1aw.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { t as resolveAccountEntry } from "./account-lookup-DI_0omIr.js";
import { i as listCombinedAccountIds, o as resolveListedDefaultAccountId } from "./account-helpers-DqNwQN08.js";
import { t as createAccountActionGate } from "./account-action-gate-CAiFBP9j.js";
import { n as resolveAccountWithDefaultFallback } from "./account-core-C5WQtrMO.js";
import { i as resolveDefaultAgentBoundAccountId, r as listBoundAccountIds } from "./bindings-CxBQdMiO.js";
import { n as formatSetExplicitDefaultInstruction } from "./default-account-warnings-D4DOHGRO.js";
import "./routing-Br1fEo8A.js";
import { t as resolveTelegramToken } from "./token-c341LyYr.js";
import "./runtime-env-CoykX19-.js";
import util from "node:util";
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
function listConfiguredAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	for (const key of Object.keys(cfg.channels?.telegram?.accounts ?? {})) if (key) ids.add(normalizeAccountId(key));
	return [...ids];
}
function listTelegramAccountIds(cfg) {
	const ids = listCombinedAccountIds({
		configuredAccountIds: listConfiguredAccountIds(cfg),
		additionalAccountIds: listBoundAccountIds(cfg, "telegram"),
		fallbackAccountIdWhenEmpty: DEFAULT_ACCOUNT_ID
	});
	debugAccounts("listTelegramAccountIds", ids);
	return ids;
}
let emittedMissingDefaultWarn = false;
/** @internal Reset the once-per-process warning flag. Exported for tests only. */
function resetMissingDefaultWarnFlag() {
	emittedMissingDefaultWarn = false;
}
function resolveDefaultTelegramAccountId(cfg) {
	const boundDefault = resolveDefaultAgentBoundAccountId(cfg, "telegram");
	if (boundDefault) return boundDefault;
	const ids = listTelegramAccountIds(cfg);
	const resolved = resolveListedDefaultAccountId({
		accountIds: ids,
		configuredDefaultAccountId: normalizeOptionalAccountId(cfg.channels?.telegram?.defaultAccount)
	});
	if (resolved !== ids[0] || ids.includes("default") || ids.length <= 1) return resolved;
	if (ids.length > 1 && !emittedMissingDefaultWarn) {
		emittedMissingDefaultWarn = true;
		getLog().warn(`channels.telegram: accounts.default is missing; falling back to "${ids[0]}". ${formatSetExplicitDefaultInstruction("telegram")} to avoid routing surprises in multi-account setups.`);
	}
	return resolved;
}
function resolveTelegramAccountConfig(cfg, accountId) {
	const normalized = normalizeAccountId(accountId);
	return resolveAccountEntry(cfg.channels?.telegram?.accounts, normalized);
}
function mergeTelegramAccountConfig(cfg, accountId) {
	const { accounts: _ignored, defaultAccount: _ignoredDefaultAccount, groups: channelGroups, ...base } = cfg.channels?.telegram ?? {};
	const account = resolveTelegramAccountConfig(cfg, accountId) ?? {};
	const isMultiAccount = Object.keys(cfg.channels?.telegram?.accounts ?? {}).length > 1;
	const groups = account.groups ?? (isMultiAccount ? void 0 : channelGroups);
	return {
		...base,
		...account,
		groups
	};
}
function createTelegramActionGate(params) {
	const accountId = normalizeAccountId(params.accountId);
	return createAccountActionGate({
		baseActions: params.cfg.channels?.telegram?.actions,
		accountActions: resolveTelegramAccountConfig(params.cfg, accountId)?.actions
	});
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
			name: merged.name?.trim() || void 0,
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
export { resetMissingDefaultWarnFlag as a, resolveTelegramAccountConfig as c, mergeTelegramAccountConfig as i, resolveTelegramPollActionGateState as l, listEnabledTelegramAccounts as n, resolveDefaultTelegramAccountId as o, listTelegramAccountIds as r, resolveTelegramAccount as s, createTelegramActionGate as t };
