import { n as resolveDiscordToken } from "./token-D-w3Rigl.js";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { createAccountActionGate, createAccountListHelpers, resolveMergedAccountConfig } from "openclaw/plugin-sdk/account-helpers";
import { resolveAccountEntry } from "openclaw/plugin-sdk/routing";
//#region extensions/discord/src/accounts.ts
const { listAccountIds, resolveDefaultAccountId } = createAccountListHelpers("discord");
const listDiscordAccountIds = listAccountIds;
const resolveDefaultDiscordAccountId = resolveDefaultAccountId;
function resolveDiscordAccountConfig(cfg, accountId) {
	return resolveAccountEntry(cfg.channels?.discord?.accounts, accountId);
}
function mergeDiscordAccountConfig(cfg, accountId) {
	return resolveMergedAccountConfig({
		channelConfig: cfg.channels?.discord,
		accounts: cfg.channels?.discord?.accounts,
		accountId
	});
}
function createDiscordActionGate(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultDiscordAccountId(params.cfg));
	return createAccountActionGate({
		baseActions: params.cfg.channels?.discord?.actions,
		accountActions: resolveDiscordAccountConfig(params.cfg, accountId)?.actions
	});
}
function resolveDiscordAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultDiscordAccountId(params.cfg));
	const baseEnabled = params.cfg.channels?.discord?.enabled !== false;
	const merged = mergeDiscordAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const tokenResolution = resolveDiscordToken(params.cfg, { accountId });
	return {
		accountId,
		enabled,
		name: normalizeOptionalString(merged.name),
		token: tokenResolution.token,
		tokenSource: tokenResolution.source,
		config: merged
	};
}
function resolveDiscordMaxLinesPerMessage(params) {
	if (typeof params.discordConfig?.maxLinesPerMessage === "number") return params.discordConfig.maxLinesPerMessage;
	return resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).config.maxLinesPerMessage;
}
function listEnabledDiscordAccounts(cfg) {
	return listDiscordAccountIds(cfg).map((accountId) => resolveDiscordAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}
//#endregion
export { resolveDefaultDiscordAccountId as a, resolveDiscordMaxLinesPerMessage as c, mergeDiscordAccountConfig as i, listDiscordAccountIds as n, resolveDiscordAccount as o, listEnabledDiscordAccounts as r, resolveDiscordAccountConfig as s, createDiscordActionGate as t };
