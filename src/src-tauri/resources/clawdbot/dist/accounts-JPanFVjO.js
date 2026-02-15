import { c as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./session-key-BWxPj0z_.js";

//#region src/signal/accounts.ts
function listConfiguredAccountIds(cfg) {
	const accounts = cfg.channels?.signal?.accounts;
	if (!accounts || typeof accounts !== "object") return [];
	return Object.keys(accounts).filter(Boolean);
}
function listSignalAccountIds(cfg) {
	const ids = listConfiguredAccountIds(cfg);
	if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
	return ids.toSorted((a, b) => a.localeCompare(b));
}
function resolveAccountConfig(cfg, accountId) {
	const accounts = cfg.channels?.signal?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	return accounts[accountId];
}
function mergeSignalAccountConfig(cfg, accountId) {
	const { accounts: _ignored, ...base } = cfg.channels?.signal ?? {};
	const account = resolveAccountConfig(cfg, accountId) ?? {};
	return {
		...base,
		...account
	};
}
function resolveSignalAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.signal?.enabled !== false;
	const merged = mergeSignalAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const host = merged.httpHost?.trim() || "127.0.0.1";
	const port = merged.httpPort ?? 8080;
	const baseUrl = merged.httpUrl?.trim() || `http://${host}:${port}`;
	const configured = Boolean(merged.account?.trim() || merged.httpUrl?.trim() || merged.cliPath?.trim() || merged.httpHost?.trim() || typeof merged.httpPort === "number" || typeof merged.autoStart === "boolean");
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		baseUrl,
		configured,
		config: merged
	};
}
function listEnabledSignalAccounts(cfg) {
	return listSignalAccountIds(cfg).map((accountId) => resolveSignalAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}

//#endregion
export { resolveSignalAccount as n, listEnabledSignalAccounts as t };