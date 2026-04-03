import { a as hasConfiguredSecretInput, c as normalizeResolvedSecretInputString, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import "./secret-input-C8U7qpTM.js";
import fsSync from "node:fs";
//#region extensions/qqbot/src/config.ts
const DEFAULT_ACCOUNT_ID = "default";
function normalizeQQBotAccountConfig(account) {
	if (!account) return {};
	return {
		...account,
		...account.audioFormatPolicy ? { audioFormatPolicy: { ...account.audioFormatPolicy } } : {}
	};
}
function normalizeAppId(raw) {
	if (raw === null || raw === void 0) return "";
	return String(raw).trim();
}
/** List all configured QQBot account IDs. */
function listQQBotAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const qqbot = cfg.channels?.qqbot;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) ids.add(DEFAULT_ACCOUNT_ID);
	if (qqbot?.accounts) {
		for (const accountId of Object.keys(qqbot.accounts)) if (qqbot.accounts[accountId]?.appId) ids.add(accountId);
	}
	return Array.from(ids);
}
/** Resolve the default QQBot account ID. */
function resolveDefaultQQBotAccountId(cfg) {
	const qqbot = cfg.channels?.qqbot;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) return DEFAULT_ACCOUNT_ID;
	if (qqbot?.accounts) {
		const ids = Object.keys(qqbot.accounts);
		if (ids.length > 0) return ids[0];
	}
	return DEFAULT_ACCOUNT_ID;
}
/** Resolve QQBot account config for runtime or setup flows. */
function resolveQQBotAccount(cfg, accountId, opts) {
	const resolvedAccountId = accountId ?? "default";
	const qqbot = cfg.channels?.qqbot;
	let accountConfig = {};
	let appId = "";
	let clientSecret = "";
	let secretSource = "none";
	if (resolvedAccountId === "default") {
		accountConfig = normalizeQQBotAccountConfig(qqbot);
		appId = normalizeAppId(qqbot?.appId);
	} else {
		const account = qqbot?.accounts?.[resolvedAccountId];
		accountConfig = normalizeQQBotAccountConfig(account);
		appId = normalizeAppId(account?.appId);
	}
	const clientSecretPath = resolvedAccountId === "default" ? "channels.qqbot.clientSecret" : `channels.qqbot.accounts.${resolvedAccountId}.clientSecret`;
	if (hasConfiguredSecretInput(accountConfig.clientSecret)) {
		clientSecret = opts?.allowUnresolvedSecretRef ? normalizeSecretInputString(accountConfig.clientSecret) ?? "" : normalizeResolvedSecretInputString({
			value: accountConfig.clientSecret,
			path: clientSecretPath
		}) ?? "";
		secretSource = "config";
	} else if (accountConfig.clientSecretFile) try {
		clientSecret = fsSync.readFileSync(accountConfig.clientSecretFile, "utf8").trim();
		secretSource = "file";
	} catch {
		secretSource = "none";
	}
	else if (process.env.QQBOT_CLIENT_SECRET && resolvedAccountId === "default") {
		clientSecret = process.env.QQBOT_CLIENT_SECRET;
		secretSource = "env";
	}
	if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === "default") appId = normalizeAppId(process.env.QQBOT_APP_ID);
	return {
		accountId: resolvedAccountId,
		name: accountConfig.name,
		enabled: accountConfig.enabled !== false,
		appId,
		clientSecret,
		secretSource,
		systemPrompt: accountConfig.systemPrompt,
		markdownSupport: accountConfig.markdownSupport !== false,
		config: accountConfig
	};
}
/** Apply account config updates back into the OpenClaw config object. */
function applyQQBotAccountConfig(cfg, accountId, input) {
	const next = { ...cfg };
	if (accountId === "default") {
		const allowFrom = (next.channels?.qqbot || {}).allowFrom ?? ["*"];
		next.channels = {
			...next.channels,
			qqbot: {
				...next.channels?.qqbot || {},
				enabled: true,
				allowFrom,
				...input.appId ? { appId: input.appId } : {},
				...input.clientSecret ? {
					clientSecret: input.clientSecret,
					clientSecretFile: void 0
				} : input.clientSecretFile ? {
					clientSecretFile: input.clientSecretFile,
					clientSecret: void 0
				} : {},
				...input.name ? { name: input.name } : {}
			}
		};
	} else {
		const allowFrom = ((next.channels?.qqbot)?.accounts?.[accountId] || {}).allowFrom ?? ["*"];
		next.channels = {
			...next.channels,
			qqbot: {
				...next.channels?.qqbot || {},
				enabled: true,
				accounts: {
					...(next.channels?.qqbot)?.accounts || {},
					[accountId]: {
						...(next.channels?.qqbot)?.accounts?.[accountId] || {},
						enabled: true,
						allowFrom,
						...input.appId ? { appId: input.appId } : {},
						...input.clientSecret ? {
							clientSecret: input.clientSecret,
							clientSecretFile: void 0
						} : input.clientSecretFile ? {
							clientSecretFile: input.clientSecretFile,
							clientSecret: void 0
						} : {},
						...input.name ? { name: input.name } : {}
					}
				}
			}
		};
	}
	return next;
}
//#endregion
export { resolveQQBotAccount as a, resolveDefaultQQBotAccountId as i, applyQQBotAccountConfig as n, listQQBotAccountIds as r, DEFAULT_ACCOUNT_ID as t };
