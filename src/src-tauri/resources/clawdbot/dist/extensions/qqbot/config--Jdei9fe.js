import { t as getPlatformAdapter } from "./adapter-DfD2SNGz.js";
import { a as normalizeStringifiedOptionalString, o as readStringField, r as normalizeOptionalLowercaseString, t as asOptionalObjectRecord } from "./string-normalize-C6Z4K8Fh.js";
import fs from "node:fs";
//#region extensions/qqbot/src/engine/config/resolve.ts
/**
* QQBot config resolution (pure logic layer).
* QQBot 配置解析（纯逻辑层）。
*
* Resolves account IDs, default account selection, and base account
* info from raw config objects. Secret/credential resolution is
* intentionally left to the outer layer (src/bridge/config.ts) so that
* this module stays framework-agnostic and self-contained.
*/
/**
* Default account ID, used for the unnamed top-level account.
* 默认账号 ID，用于顶层配置中未命名的账号。
*/
const DEFAULT_ACCOUNT_ID$1 = "default";
function normalizeAppId(raw) {
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "number") return String(raw);
	return "";
}
function normalizeAccountConfig(account) {
	if (!account) return {};
	const audioPolicy = asOptionalObjectRecord(account.audioFormatPolicy);
	return {
		...account,
		...audioPolicy ? { audioFormatPolicy: { ...audioPolicy } } : {}
	};
}
function readQQBotSection(cfg) {
	return asOptionalObjectRecord(asOptionalObjectRecord(cfg.channels)?.qqbot);
}
/**
* List all configured QQBot account IDs.
* 列出所有已配置的 QQBot 账号 ID。
*/
function listAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const qqbot = readQQBotSection(cfg);
	if (qqbot?.appId || process.env.QQBOT_APP_ID) ids.add(DEFAULT_ACCOUNT_ID$1);
	if (qqbot?.accounts) {
		for (const accountId of Object.keys(qqbot.accounts)) if (qqbot.accounts[accountId]?.appId) ids.add(accountId);
	}
	return Array.from(ids);
}
/**
* Resolve the default QQBot account ID.
* 解析默认 QQBot 账号 ID（优先级：defaultAccount > 顶层 appId > 第一个命名账号）。
*/
function resolveDefaultAccountId(cfg) {
	const qqbot = readQQBotSection(cfg);
	const configuredDefaultAccountId = normalizeOptionalLowercaseString(qqbot?.defaultAccount);
	if (configuredDefaultAccountId && (configuredDefaultAccountId === "default" || Boolean(qqbot?.accounts?.[configuredDefaultAccountId]?.appId))) return configuredDefaultAccountId;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) return DEFAULT_ACCOUNT_ID$1;
	if (qqbot?.accounts) {
		const ids = Object.keys(qqbot.accounts);
		if (ids.length > 0) return ids[0];
	}
	return DEFAULT_ACCOUNT_ID$1;
}
/**
* Resolve base account info (without credentials).
* 解析账号基础信息（不含凭证）。
*
* Resolves everything except Secret/credential fields. The outer
* config.ts layer calls this and adds Secret handling on top.
*/
function resolveAccountBase(cfg, accountId) {
	const resolvedAccountId = accountId ?? resolveDefaultAccountId(cfg);
	const qqbot = readQQBotSection(cfg);
	let accountConfig = {};
	let appId = "";
	if (resolvedAccountId === "default") {
		accountConfig = normalizeAccountConfig(asOptionalObjectRecord(qqbot));
		appId = normalizeAppId(qqbot?.appId);
	} else {
		const account = qqbot?.accounts?.[resolvedAccountId];
		accountConfig = normalizeAccountConfig(asOptionalObjectRecord(account));
		appId = normalizeAppId(asOptionalObjectRecord(account)?.appId);
	}
	if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === "default") appId = normalizeAppId(process.env.QQBOT_APP_ID);
	return {
		accountId: resolvedAccountId,
		name: readStringField(accountConfig, "name"),
		enabled: accountConfig.enabled !== false,
		appId,
		systemPrompt: readStringField(accountConfig, "systemPrompt"),
		markdownSupport: accountConfig.markdownSupport !== false,
		config: accountConfig
	};
}
/** Apply account config updates into a raw config object. */
function applyAccountConfig(cfg, accountId, input) {
	const next = { ...cfg };
	const channels = asOptionalObjectRecord(cfg.channels) ?? {};
	const existingQQBot = asOptionalObjectRecord(channels.qqbot) ?? {};
	if (accountId === "default") {
		const allowFrom = existingQQBot.allowFrom ?? ["*"];
		next.channels = {
			...channels,
			qqbot: {
				...existingQQBot,
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
		const accounts = existingQQBot.accounts ?? {};
		const existingAccount = accounts[accountId] ?? {};
		const allowFrom = existingAccount.allowFrom ?? ["*"];
		next.channels = {
			...channels,
			qqbot: {
				...existingQQBot,
				enabled: true,
				accounts: {
					...accounts,
					[accountId]: {
						...existingAccount,
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
/** Check whether a QQBot account has been fully configured. */
function isAccountConfigured(account) {
	return Boolean(account?.appId && (Boolean(account?.clientSecret) || getPlatformAdapter().hasConfiguredSecret(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim())));
}
/** Build a summary description of an account. */
function describeAccount(account) {
	return {
		accountId: account?.accountId ?? "default",
		name: account?.name,
		enabled: account?.enabled ?? false,
		configured: isAccountConfigured(account),
		tokenSource: account?.secretSource
	};
}
/** Normalize allowFrom entries into uppercase strings without the qqbot: prefix. */
function formatAllowFrom(allowFrom) {
	return (allowFrom ?? []).map((entry) => normalizeStringifiedOptionalString(entry)).filter((entry) => Boolean(entry)).map((entry) => entry.replace(/^qqbot:/i, "")).map((entry) => entry.toUpperCase());
}
//#endregion
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
	const accountConfig = base.accountId === DEFAULT_ACCOUNT_ID ? qqbot ?? {} : qqbot?.accounts?.[base.accountId] ?? {};
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
export { resolveQQBotAccount as a, describeAccount as c, resolveDefaultQQBotAccountId as i, formatAllowFrom as l, applyQQBotAccountConfig as n, DEFAULT_ACCOUNT_ID$1 as o, listQQBotAccountIds as r, applyAccountConfig as s, DEFAULT_ACCOUNT_ID as t, isAccountConfigured as u };
