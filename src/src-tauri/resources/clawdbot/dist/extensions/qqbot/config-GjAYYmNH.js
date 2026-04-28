import { c as getPlatformAdapter } from "./string-normalize-Ci6NM5DE.js";
import { c as resolveDefaultAccountId, n as applyAccountConfig, o as listAccountIds, s as resolveAccountBase, t as DEFAULT_ACCOUNT_ID$1 } from "./resolve-D_06fV6-.js";
import fs from "node:fs";
//#region extensions/qqbot/src/bridge/config.ts
const DEFAULT_ACCOUNT_ID = DEFAULT_ACCOUNT_ID$1;
/** List all configured QQBot account IDs. */
function listQQBotAccountIds(cfg) {
	return listAccountIds(cfg);
}
/** Resolve the default QQBot account ID. */
function resolveDefaultQQBotAccountId(cfg) {
	return resolveDefaultAccountId(cfg);
}
/** Resolve QQBot account config for runtime or setup flows. */
function resolveQQBotAccount(cfg, accountId, opts) {
	const base = resolveAccountBase(cfg, accountId);
	const qqbot = cfg.channels?.qqbot;
	/**
	* Legacy top-level account uses `channels.qqbot` as the base, but per-account
	* fields (allowFrom, streaming, …) often live under `accounts.default`.
	* Merge that slice so runtime sees `config.streaming` etc.
	*/
	const accountConfig = base.accountId === DEFAULT_ACCOUNT_ID ? {
		...qqbot,
		...qqbot?.accounts?.[DEFAULT_ACCOUNT_ID]
	} : qqbot?.accounts?.[base.accountId] ?? {};
	let clientSecret = "";
	let secretSource = "none";
	const clientSecretPath = base.accountId === DEFAULT_ACCOUNT_ID ? "channels.qqbot.clientSecret" : `channels.qqbot.accounts.${base.accountId}.clientSecret`;
	const adapter = getPlatformAdapter();
	if (adapter.hasConfiguredSecret(accountConfig.clientSecret)) {
		clientSecret = opts?.allowUnresolvedSecretRef ? adapter.normalizeSecretInputString(accountConfig.clientSecret) ?? "" : adapter.resolveSecretInputString({
			value: accountConfig.clientSecret,
			path: clientSecretPath
		}) ?? "";
		secretSource = "config";
	} else if (accountConfig.clientSecretFile) try {
		clientSecret = fs.readFileSync(accountConfig.clientSecretFile, "utf8").trim();
		secretSource = "file";
	} catch {
		secretSource = "none";
	}
	else if (process.env.QQBOT_CLIENT_SECRET && base.accountId === DEFAULT_ACCOUNT_ID) {
		clientSecret = process.env.QQBOT_CLIENT_SECRET;
		secretSource = "env";
	}
	return {
		accountId: base.accountId,
		name: accountConfig.name,
		enabled: base.enabled,
		appId: base.appId,
		clientSecret,
		secretSource,
		systemPrompt: base.systemPrompt,
		markdownSupport: base.markdownSupport,
		config: accountConfig
	};
}
/** Apply account config updates back into the OpenClaw config object. */
function applyQQBotAccountConfig(cfg, accountId, input) {
	return applyAccountConfig(cfg, accountId, input);
}
//#endregion
export { resolveQQBotAccount as a, resolveDefaultQQBotAccountId as i, applyQQBotAccountConfig as n, listQQBotAccountIds as r, DEFAULT_ACCOUNT_ID as t };
